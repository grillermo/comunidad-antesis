# One row per Stripe Checkout Session. The unique index on stripe_session_id
# makes .record! idempotent across the webhook/redirect race and webhook
# retries; fulfilled_at skips delivery work that already completed.
class Purchase < ApplicationRecord
  MANUAL_PRODUCT = "manual_del_color_vivo"

  belongs_to :user, optional: true

  def self.fulfillable_session?(session)
    session.payment_status == "paid" && session.metadata&.[]("product") == MANUAL_PRODUCT
  end

  # Shared entry point for the webhook and the gracias page. create_or_find_by!
  # isolates its insert in a requires_new transaction (a savepoint when
  # nested), so Rails can recover from a uniqueness race safely. No outer
  # transaction is required for correctness: if the process stops after the
  # purchase commits but before user_id is linked, the next call repairs it.
  # The purchase row lock serializes that repair and its auto-login decision.
  def self.record!(session)
    # Normalize to match Devise's strip_whitespace_keys and
    # case_insensitive_keys, so the rescue path can't miss an existing user.
    email = session.customer_details.email.strip.downcase

    purchase = create_or_find_by!(stripe_session_id: session.id) do |p|
      p.email = email
    end
    purchase_created = purchase.previously_new_record?

    purchase.with_lock do
      next if purchase.user_id?

      if (user = User.find_by(email: purchase.email))
        purchase.update!(user: user, auto_login_on_return: false)
        next
      end

      begin
        # The savepoint contains a possible unique-index violation so the
        # outer purchase-lock transaction can safely link the winning row.
        user = User.transaction(requires_new: true) do
          User.create!(email: purchase.email, password: Devise.friendly_token)
        end
        purchase.update!(user: user, auto_login_on_return: purchase_created)
      rescue ActiveRecord::RecordNotUnique
        purchase.update!(
          user: User.find_by!(email: purchase.email),
          auto_login_on_return: false
        )
      rescue ActiveRecord::RecordInvalid => error
        raise unless error.record.errors.added?(:email, :taken)

        purchase.update!(
          user: User.find_by!(email: purchase.email),
          auto_login_on_return: false
        )
      end
    end

    purchase
  end
end
