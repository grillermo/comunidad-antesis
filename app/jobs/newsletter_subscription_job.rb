# Pushes a newsletter signup to MailerLite off the request cycle so an API
# outage never blocks the subscribe form.
class NewsletterSubscriptionJob < ApplicationJob
  queue_as :default

  PRE_LAUNCH_GROUP = "pre-launch".freeze

  retry_on MailerLite::Error, wait: :polynomially_longer, attempts: 5

  def perform(email, source: nil)
    fields = source.present? ? { source: source } : {}

    MailerLite.upsert_subscriber(
      email: email,
      group_name: PRE_LAUNCH_GROUP,
      fields: fields
    )
  end
end
