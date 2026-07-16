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

  def follow_clean_confirmation_redirect
    purchase = Purchase.last

    expect(response).to redirect_to(gracias_por_tu_compra_path)
    expect(response.location).to eq("http://www.example.com/gracias-por-tu-compra")
    expect(request.session[:gracias_purchase_id]).to eq(purchase.id)
    expect(request.session.to_hash.to_s).not_to include("cs_test_123")

    follow_redirect!

    expect(response).to have_http_status(:ok)
    expect(request.fullpath).to eq("/gracias-por-tu-compra")
    expect(inertia_page.fetch("url")).to eq("/gracias-por-tu-compra")

    purchase
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

  it "filters session_id from parameter logging" do
    filter = ActiveSupport::ParameterFilter.new(Rails.application.config.filter_parameters)

    expect(filter.filter("session_id" => "cs_test_123")).to eq("session_id" => "[FILTERED]")
  end

  it "confirms the purchase, redirects cleanly, signs in the buyer, and renders" do
    allow(Stripe::Checkout::Session).to receive(:retrieve)
      .with("cs_test_123").and_return(checkout_session)

    expect {
      get "/gracias-por-tu-compra", params: { session_id: "cs_test_123" }
    }.to change(Purchase, :count).by(1)
      .and have_enqueued_job(PurchaseFulfillmentJob)

    purchase = follow_clean_confirmation_redirect

    expect(inertia_page.fetch("component")).to eq("GraciasPorTuCompra")
    expect(inertia_page.dig("props", "email")).to eq("buyer@example.com")
    expect(inertia_page.dig("props", "manualPath")).to eq("/manual-del-color-vivo")
    expect(inertia_page.dig("props", "user", "email")).to eq("buyer@example.com")
    expect(request.env.fetch("warden").user(:user)).to eq(purchase.user)

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

    purchase = follow_clean_confirmation_redirect

    expect(purchase).to eq(existing_purchase)
    expect(Purchase.count).to eq(1)
    expect(User.where(email: "buyer@example.com").count).to eq(1)
    expect(request.env.fetch("warden").user(:user)).to eq(existing_purchase.user)
  end

  it "redirects a clean direct request without confirmation state" do
    allow(Stripe::Checkout::Session).to receive(:retrieve)

    expect {
      get "/gracias-por-tu-compra"
    }.not_to change { [ Purchase.count, User.count ] }

    expect(response).to redirect_to(root_path)
    expect(Stripe::Checkout::Session).not_to have_received(:retrieve)
    expect(PurchaseFulfillmentJob).not_to have_been_enqueued
    expect(request.env.fetch("warden")).not_to be_authenticated(:user)
  end

  it "does not render confirmation state for a different signed-in user" do
    allow(Stripe::Checkout::Session).to receive(:retrieve)
      .with("cs_test_123").and_return(checkout_session)
    get "/gracias-por-tu-compra", params: { session_id: "cs_test_123" }
    buyer = Purchase.last.user
    expect(response).to redirect_to(gracias_por_tu_compra_path)

    other_user = create(:user, email: "other@example.com")
    sign_in other_user
    get "/gracias-por-tu-compra"

    expect(response).to redirect_to(root_path)
    expect(request.env.fetch("warden").user(:user)).to eq(other_user)
    expect(other_user).not_to eq(buyer)
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

  [
    [ "an array", { session_id: [ "cs_test_123" ] }, {} ],
    [ "nested parameters", { session_id: { value: "cs_test_123" } }, {} ],
    [ "a non-string JSON value", { session_id: 123 }, { as: :json } ]
  ].each do |description, submitted_params, request_options|
    it "rejects #{description} before calling Stripe" do
      allow(Stripe::Checkout::Session).to receive(:retrieve).and_return(checkout_session)

      expect {
        get "/gracias-por-tu-compra", params: submitted_params, **request_options
      }.not_to change { [ Purchase.count, User.count ] }

      expect(response).to redirect_to(root_path)
      expect(Stripe::Checkout::Session).not_to have_received(:retrieve)
      expect(PurchaseFulfillmentJob).not_to have_been_enqueued
      expect(request.env.fetch("warden")).not_to be_authenticated(:user)
    end
  end

  it "switches an existing different login to the purchase owner" do
    other_user = create(:user, email: "other@example.com")
    sign_in other_user
    allow(Stripe::Checkout::Session).to receive(:retrieve)
      .with("cs_test_123").and_return(checkout_session)

    get "/gracias-por-tu-compra", params: { session_id: "cs_test_123" }

    buyer = Purchase.last.user
    expect(response).to redirect_to(gracias_por_tu_compra_path)
    expect(buyer).not_to eq(other_user)
    expect(request.env.fetch("warden").user(:user)).to eq(buyer)

    follow_redirect!

    expect(response).to have_http_status(:ok)
    expect(inertia_page.dig("props", "user", "email")).to eq("buyer@example.com")
    expect(inertia_page.dig("props", "email")).to eq("buyer@example.com")
  end
end
