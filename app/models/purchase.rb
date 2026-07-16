# One row per Stripe Checkout Session. The unique index on stripe_session_id
# makes .record! idempotent across the webhook/redirect race and webhook
# retries; fulfilled_at guards the one-shot fulfillment email.
class Purchase < ApplicationRecord
  belongs_to :user, optional: true

  # Shared entry point for the webhook and the gracias page. Deliberately NOT
  # wrapped in one transaction: on Postgres a unique-violation inside an open
  # transaction poisons it, breaking create_or_find_by's rescue path. Each
  # statement is individually atomic and a crash between them is repaired by
  # the next call (user_id backfill below).
  def self.record!(session)
    # Downcase to match Devise's case_insensitive_keys normalization, so the
    # rescue path's find_by! below can't miss an existing user row.
    email = session.customer_details.email.downcase

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
