require "rails_helper"

RSpec.describe NewsletterEmail, type: :model do
  it "is valid with a well-formed email" do
    expect(NewsletterEmail.new(email: "reader@example.com")).to be_valid
  end

  it "normalizes email by stripping and downcasing before validation" do
    record = NewsletterEmail.create!(email: "  Reader@Example.COM  ")
    expect(record.email).to eq("reader@example.com")
  end

  it "is invalid without an email" do
    record = NewsletterEmail.new(email: nil)
    expect(record).not_to be_valid
    expect(record.errors[:email]).to be_present
  end

  it "is invalid with a malformed email" do
    expect(NewsletterEmail.new(email: "not-an-email")).not_to be_valid
  end

  it "enforces case-insensitive uniqueness" do
    NewsletterEmail.create!(email: "foo@x.com")
    dup = NewsletterEmail.new(email: "FOO@x.com")
    expect(dup).not_to be_valid
    expect(dup.errors.details[:email]).to include(a_hash_including(error: :taken))
  end

  it "persists an optional source" do
    record = NewsletterEmail.create!(email: "s@x.com", source: "instagram")
    expect(record.source).to eq("instagram")
  end
end
