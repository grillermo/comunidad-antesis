require "rails_helper"

RSpec.describe "Gracias por tu compra", type: :request do
  around do |example|
    original = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :test
    example.run
  ensure
    ActiveJob::Base.queue_adapter = original
  end

  def checkout_session(
    id: "cs_test_123",
    email: "buyer@example.com",
    payment_status: "paid",
    metadata: { product: Purchase::MANUAL_PRODUCT }
  )
    attributes = {
      id: id,
      payment_status: payment_status,
      customer_details: { email: email }
    }
    attributes[:metadata] = metadata unless metadata == :missing

    Stripe::Checkout::Session.construct_from(attributes)
  end

  def inertia_page
    JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
  end

  def expect_rejected_session(session)
    allow(Stripe::Checkout::Session).to receive(:retrieve)
      .with("cs_test_123").and_return(session)

    expect {
      get "/gracias-por-tu-compra", params: { session_id: "cs_test_123" }
    }.not_to change { [ Purchase.count, User.count ] }

    expect(response).to redirect_to(root_path)
    expect(PurchaseFulfillmentJob).not_to have_been_enqueued
    expect(request.env.fetch("warden")).not_to be_authenticated(:user)
  end

  it "creates the purchase, signs in the buyer, enqueues fulfillment, and renders" do
    allow(Stripe::Checkout::Session).to receive(:retrieve)
      .with("cs_test_123").and_return(checkout_session)

    expect {
      get "/gracias-por-tu-compra", params: { session_id: "cs_test_123" }
    }.to change(Purchase, :count).by(1)
      .and have_enqueued_job(PurchaseFulfillmentJob)

    expect(response).to have_http_status(:ok)
    expect(inertia_page.fetch("component")).to eq("GraciasPorTuCompra")
    expect(inertia_page.dig("props", "email")).to eq("buyer@example.com")
    expect(inertia_page.dig("props", "manualPath")).to eq("/manual-del-color-vivo")
    expect(inertia_page.dig("props", "user", "email")).to eq("buyer@example.com")
    expect(request.env.fetch("warden").user(:user)).to eq(Purchase.last.user)

    get "/manual-del-color-vivo"
    expect(response).to have_http_status(:ok)
  end

  it "reuses the purchase when the webhook wins the race" do
    session = checkout_session
    existing_purchase = Purchase.record!(session)
    allow(Stripe::Checkout::Session).to receive(:retrieve)
      .with("cs_test_123").and_return(session)

    expect {
      get "/gracias-por-tu-compra", params: { session_id: "cs_test_123" }
    }.to have_enqueued_job(PurchaseFulfillmentJob).with(existing_purchase)

    expect(response).to have_http_status(:ok)
    expect(Purchase.count).to eq(1)
    expect(User.where(email: "buyer@example.com").count).to eq(1)
    expect(request.env.fetch("warden").user(:user)).to eq(existing_purchase.user)
  end

  it "redirects without side effects when session_id is missing" do
    allow(Stripe::Checkout::Session).to receive(:retrieve)

    expect {
      get "/gracias-por-tu-compra"
    }.not_to change { [ Purchase.count, User.count ] }

    expect(response).to redirect_to(root_path)
    expect(Stripe::Checkout::Session).not_to have_received(:retrieve)
    expect(PurchaseFulfillmentJob).not_to have_been_enqueued
    expect(request.env.fetch("warden")).not_to be_authenticated(:user)
  end

  it "redirects without side effects when Stripe rejects the session id" do
    allow(Stripe::Checkout::Session).to receive(:retrieve)
      .with("cs_bogus")
      .and_raise(Stripe::InvalidRequestError.new("No such session", "session_id"))

    expect {
      get "/gracias-por-tu-compra", params: { session_id: "cs_bogus" }
    }.not_to change { [ Purchase.count, User.count ] }

    expect(response).to redirect_to(root_path)
    expect(PurchaseFulfillmentJob).not_to have_been_enqueued
    expect(request.env.fetch("warden")).not_to be_authenticated(:user)
  end

  it "redirects without side effects when the session is unpaid" do
    expect_rejected_session(checkout_session(payment_status: "unpaid"))
  end

  it "redirects without side effects when product metadata is missing" do
    expect_rejected_session(checkout_session(metadata: :missing))
  end

  it "redirects without side effects when product metadata is wrong" do
    expect_rejected_session(checkout_session(metadata: { product: "another_product" }))
  end

  it "switches an existing different login to the purchase owner" do
    other_user = create(:user, email: "other@example.com")
    sign_in other_user
    allow(Stripe::Checkout::Session).to receive(:retrieve)
      .with("cs_test_123").and_return(checkout_session)

    get "/gracias-por-tu-compra", params: { session_id: "cs_test_123" }

    buyer = Purchase.last.user
    expect(response).to have_http_status(:ok)
    expect(buyer).not_to eq(other_user)
    expect(request.env.fetch("warden").user(:user)).to eq(buyer)
    expect(inertia_page.dig("props", "user", "email")).to eq("buyer@example.com")
    expect(inertia_page.dig("props", "email")).to eq("buyer@example.com")
  end
end
