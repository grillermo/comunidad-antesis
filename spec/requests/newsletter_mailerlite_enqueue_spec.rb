require "rails_helper"

RSpec.describe "Newsletter MailerLite enqueue", type: :request do
  around do |example|
    original = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :test
    example.run
    ActiveJob::Base.queue_adapter = original
  end

  it "enqueues a MailerLite upsert when a new subscriber is created" do
    expect {
      post "/newsletter_emails", params: { email: "new@example.com", source: "ig" }
    }.to have_enqueued_job(NewsletterSubscriptionJob)
      .with("new@example.com", source: "ig")
  end

  it "does not enqueue when the email is invalid" do
    expect {
      post "/newsletter_emails", params: { email: "nope" }
    }.not_to have_enqueued_job(NewsletterSubscriptionJob)
  end

  it "does not enqueue for a duplicate email" do
    NewsletterEmail.create!(email: "dup@example.com")

    expect {
      post "/newsletter_emails", params: { email: "DUP@example.com" }
    }.not_to have_enqueued_job(NewsletterSubscriptionJob)
  end
end
