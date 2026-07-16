# One row per Stripe Checkout Session. The unique index on stripe_session_id
# makes .record! idempotent across the webhook/redirect race and webhook
# retries; fulfilled_at guards the one-shot fulfillment email.
class Purchase < ApplicationRecord
  MANUAL_PRODUCT = "manual_del_color_vivo"

  belongs_to :user, optional: true

  def self.fulfillable_session?(session)
    session.payment_status == "paid" && session.metadata&.[]("product") == MANUAL_PRODUCT
  end

  # Shared entry point for the webhook and the gracias page. Deliberately NOT
  # wrapped in one transaction: on Postgres a unique-violation inside an open
  # transaction poisons it, breaking create_or_find_by's rescue path. Each
  # statement is individually atomic and a crash between them is repaired by
  # the next call (user_id backfill below).
  def self.record!(session)
    # Normalize to match Devise's strip_whitespace_keys and
    # case_insensitive_keys, so the rescue path can't miss an existing user.
    email = session.customer_details.email.strip.downcase

    purchase = create_or_find_by!(stripe_session_id: session.id) do |p|
      p.email = email
    end

    if purchase.user_id.nil?
      # NOT create_or_find_by!: Devise :validatable adds an email-uniqueness
      # validation, so create! raises RecordInvalid (not RecordNotUnique) when
      # the user exists, and create_or_find_by!'s rescue never fires.
      user = begin
        User.find_or_create_by!(email: purchase.email) do |u|
          u.password = Devise.friendly_token
        end
      rescue ActiveRecord::RecordNotUnique, ActiveRecord::RecordInvalid
        # Lost the creation race; the row exists now.
        User.find_by!(email: purchase.email)
      end
      purchase.update!(user: user)
    end

    purchase
  end
end
