require "rails_helper"

RSpec.describe Purchase do
  def checkout_session(
    id: "cs_test_123",
    email: "buyer@example.com",
    payment_status: "paid",
    metadata: { product: "manual_del_color_vivo" }
  )
    Stripe::Checkout::Session.construct_from(
      id: id,
      payment_status: payment_status,
      metadata: metadata,
      customer_details: { email: email }
    )
  end

  describe ".fulfillable_session?" do
    it "accepts a paid session for the manual product" do
      expect(described_class.fulfillable_session?(checkout_session)).to be(true)
    end

    it "rejects an unpaid session" do
      session = checkout_session(payment_status: "unpaid")

      expect(described_class.fulfillable_session?(session)).to be(false)
    end

    it "rejects a session without product metadata" do
      session = checkout_session(metadata: {})

      expect(described_class.fulfillable_session?(session)).to be(false)
    end

    it "rejects a session for another product" do
      session = checkout_session(metadata: { product: "another_product" })

      expect(described_class.fulfillable_session?(session)).to be(false)
    end
  end

  describe ".record!" do
    it "creates a purchase and a user from the session email" do
      purchase = described_class.record!(checkout_session)

      expect(purchase).to be_persisted
      expect(purchase.stripe_session_id).to eq("cs_test_123")
      expect(purchase.email).to eq("buyer@example.com")
      expect(purchase.user).to be_persisted
      expect(purchase.user.email).to eq("buyer@example.com")
    end

    it "is idempotent for the same session id" do
      first = described_class.record!(checkout_session)
      second = described_class.record!(checkout_session)

      expect(second.id).to eq(first.id)
      expect(Purchase.count).to eq(1)
      expect(User.where(email: "buyer@example.com").count).to eq(1)
    end

    it "reuses an existing user with the same email" do
      existing = create(:user, email: "buyer@example.com")

      purchase = described_class.record!(checkout_session)

      expect(purchase.user).to eq(existing)
      expect(User.count).to eq(1)
    end

    it "normalizes the session email before reusing an existing user" do
      existing = create(:user, email: "buyer@example.com")

      purchase = described_class.record!(checkout_session(email: " Buyer@Example.com "))

      expect(purchase.email).to eq("buyer@example.com")
      expect(purchase.user).to eq(existing)
      expect(User.count).to eq(1)
    end

    it "backfills user_id if a previous call crashed before linking" do
      Purchase.create!(stripe_session_id: "cs_test_123", email: "buyer@example.com")

      purchase = described_class.record!(checkout_session)

      expect(purchase.user).to be_present
    end

    it "created users are commenters with an unguessable password" do
      purchase = described_class.record!(checkout_session)

      expect(purchase.user.role).to eq("commenter")
      expect(purchase.user.encrypted_password).to be_present
    end
  end
end
