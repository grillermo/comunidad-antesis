require "rails_helper"

RSpec.describe MailerLite do
  before { Rails.cache.clear }

  describe "#upsert_subscriber" do
    it "creates the group then upserts the subscriber", vcr: { cassette_name: "mailerlite/upsert_new_group" } do
      response = described_class.upsert_subscriber(
        email: "reader@example.com",
        group_name: "pre-launch",
        fields: { source: "ig" }
      )

      expect(response.dig("data", "email")).to eq("reader@example.com")
    end

    it "reuses an existing group", vcr: { cassette_name: "mailerlite/upsert_existing_group" } do
      response = described_class.upsert_subscriber(
        email: "reader@example.com",
        group_name: "pre-launch"
      )

      expect(response.dig("data", "id")).to be_present
    end
  end

  describe "#find_or_create_group" do
    it "caches the resolved group id", vcr: { cassette_name: "mailerlite/upsert_existing_group" } do
      client = described_class.new

      first = client.find_or_create_group("pre-launch")
      second = client.find_or_create_group("pre-launch")

      expect(first).to eq(second)
    end
  end

  it "raises MailerLite::Error on a failed response", vcr: { cassette_name: "mailerlite/subscriber_error" } do
    expect {
      described_class.upsert_subscriber(email: "bad@example.com", group_name: "pre-launch")
    }.to raise_error(MailerLite::Error, /MailerLite 4\d\d/)
  end
end
