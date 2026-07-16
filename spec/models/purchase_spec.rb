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
      expect(purchase.auto_login_on_return).to be(true)
    end

    it "is idempotent for the same session id" do
      first = described_class.record!(checkout_session)
      second = described_class.record!(checkout_session)

      expect(second.id).to eq(first.id)
      expect(second.auto_login_on_return).to be(true)
      expect(Purchase.count).to eq(1)
      expect(User.where(email: "buyer@example.com").count).to eq(1)
    end

    it "reuses an existing user with the same email" do
      existing = create(:user, email: "buyer@example.com")

      purchase = described_class.record!(checkout_session)

      expect(purchase.user).to eq(existing)
      expect(purchase.auto_login_on_return).to be(false)
      expect(User.count).to eq(1)
    end

    it "never enables return auto-login for an existing admin" do
      existing = create(:user, :admin, email: "buyer@example.com")

      purchase = described_class.record!(checkout_session)

      expect(purchase.user).to eq(existing)
      expect(purchase.auto_login_on_return).to be(false)
      expect(existing).to be_admin
    end

    it "normalizes the session email before reusing an existing user" do
      existing = create(:user, email: "buyer@example.com")

      purchase = described_class.record!(checkout_session(email: " Buyer@Example.com "))

      expect(purchase.email).to eq("buyer@example.com")
      expect(purchase.user).to eq(existing)
      expect(purchase.auto_login_on_return).to be(false)
      expect(User.count).to eq(1)
    end

    it "backfills user_id if a previous call crashed before linking" do
      Purchase.create!(stripe_session_id: "cs_test_123", email: "buyer@example.com")

      purchase = described_class.record!(checkout_session)

      expect(purchase.user).to be_present
      expect(purchase.auto_login_on_return).to be(false)
    end

    it "enables return auto-login only for the purchase that creates the user" do
      first = described_class.record!(checkout_session(id: "cs_test_first"))
      second = described_class.record!(checkout_session(id: "cs_test_second"))

      expect(first.user).to eq(second.user)
      expect(first.auto_login_on_return).to be(true)
      expect(second.auto_login_on_return).to be(false)
      expect(User.where(email: "buyer@example.com").count).to eq(1)
    end

    it "keeps return auto-login disabled when another purchase wins the user insert race" do
      winning_user = create(:user, email: "buyer@example.com")
      allow(User).to receive(:find_by).and_call_original
      allow(User).to receive(:find_by).with(email: "buyer@example.com").and_return(nil)
      allow(User).to receive(:create!).and_raise(ActiveRecord::RecordNotUnique, "race lost")

      purchase = described_class.record!(checkout_session)

      expect(purchase.user).to eq(winning_user)
      expect(purchase.auto_login_on_return).to be(false)
      expect(User.where(email: "buyer@example.com").count).to eq(1)
    end

    it "does not swallow unrelated user validation failures" do
      invalid_user = User.new(email: "buyer@example.com")
      invalid_user.errors.add(:password, :blank)
      validation_error = ActiveRecord::RecordInvalid.new(invalid_user)
      allow(User).to receive(:find_by).and_call_original
      allow(User).to receive(:find_by).with(email: "buyer@example.com").and_return(nil)
      allow(User).to receive(:create!).and_raise(validation_error)

      expect {
        described_class.record!(checkout_session)
      }.to raise_error(validation_error)
    end

    it "does not swallow unrelated failures combined with an email race" do
      create(:user, email: "buyer@example.com")
      invalid_user = User.new(email: "buyer@example.com")
      invalid_user.errors.add(:email, :taken)
      invalid_user.errors.add(:password, :blank)
      validation_error = ActiveRecord::RecordInvalid.new(invalid_user)
      allow(User).to receive(:find_by).and_call_original
      allow(User).to receive(:find_by).with(email: "buyer@example.com").and_return(nil)
      allow(User).to receive(:create!).and_raise(validation_error)

      expect {
        described_class.record!(checkout_session)
      }.to raise_error(validation_error)
    end

    it "created users are commenters with an unguessable password" do
      purchase = described_class.record!(checkout_session)

      expect(purchase.user.role).to eq("commenter")
      expect(purchase.user.encrypted_password).to be_present
    end
  end
end
