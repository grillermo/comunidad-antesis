require "rails_helper"

RSpec.describe "Checkouts", type: :request do
  let(:stripe_session) do
    Stripe::Checkout::Session.construct_from(
      id: "cs_test_123",
      url: "https://checkout.stripe.com/c/pay/cs_test_123"
    )
  end

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("STRIPE_PRICE_ID").and_return("price_test_123")
    allow(Stripe::Checkout::Session).to receive(:create).and_return(stripe_session)
  end

  it "is not available before launch" do
    travel_to Date.new(2026, 8, 14) do
      post "/checkout"
    end

    expect(response).to have_http_status(:not_found)
    expect(Stripe::Checkout::Session).not_to have_received(:create)
  end

  it "creates a tagged one-time session and redirects to Stripe after launch" do
    travel_to Date.new(2026, 8, 15) do
      post "/checkout"
    end

    expect(response).to have_http_status(:see_other)
    expect(response).to redirect_to("https://checkout.stripe.com/c/pay/cs_test_123")
    expect(Stripe::Checkout::Session).to have_received(:create).with(
      mode: "payment",
      metadata: { product: Purchase::MANUAL_PRODUCT },
      line_items: [ { price: "price_test_123", quantity: 1 } ],
      success_url: "http://www.example.com/gracias-por-tu-compra?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://www.example.com/"
    )
  end
end
