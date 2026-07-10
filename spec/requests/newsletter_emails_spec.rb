require "rails_helper"

RSpec.describe "NewsletterEmails", type: :request do
  it "creates a subscriber and redirects with a subscribed flash" do
    expect {
      post "/newsletter_emails", params: { email: "new@example.com", source: "ig" }
    }.to change(NewsletterEmail, :count).by(1)

    expect(response).to redirect_to(root_path)
    expect(flash[:subscribed]).to be_truthy
    expect(NewsletterEmail.last.source).to eq("ig")
  end

  it "does not duplicate an existing email and flags already_subscribed" do
    NewsletterEmail.create!(email: "dup@example.com")

    expect {
      post "/newsletter_emails", params: { email: "DUP@example.com" }
    }.not_to change(NewsletterEmail, :count)

    expect(response).to redirect_to(root_path)
    expect(flash[:already_subscribed]).to be_truthy
  end

  it "rejects a malformed email without creating a row" do
    expect {
      post "/newsletter_emails", params: { email: "nope" }
    }.not_to change(NewsletterEmail, :count)

    expect(response).to redirect_to(root_path)
  end
end
