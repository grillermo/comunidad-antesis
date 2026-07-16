require "rails_helper"

RSpec.describe "Purchase fulfillment controller race", type: :request do
  include ActiveJob::TestHelper

  let(:secret) { "whsec_test_secret" }
  let(:pdf) { "%PDF-1.4\nstamped".b }

  around do |example|
    original = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :test
    example.run
  ensure
    clear_enqueued_jobs
    clear_performed_jobs
    ActiveJob::Base.queue_adapter = original
  end

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("STRIPE_WEBHOOK_SECRET").and_return(secret)
    allow(Stripe::Checkout::Session).to receive(:retrieve)
      .with("cs_test_race").and_return(checkout_session)
    allow(ManualPdfStamper).to receive(:new)
      .and_return(instance_double(ManualPdfStamper, call: pdf))
  end

  def checkout_session
    Stripe::Checkout::Session.construct_from(
      id: "cs_test_race",
      payment_status: "paid",
      metadata: { product: Purchase::MANUAL_PRODUCT },
      customer_details: { email: "buyer@example.com" }
    )
  end

  def webhook_payload
    {
      id: "evt_test_race",
      object: "event",
      type: "checkout.session.completed",
      data: { object: checkout_session.to_hash }
    }.to_json
  end

  def post_webhook
    payload = webhook_payload
    timestamp = Time.current
    signature = Stripe::Webhook::Signature.compute_signature(timestamp, payload, secret)

    post "/webhooks/stripe",
      params: payload,
      headers: {
        "CONTENT_TYPE" => "application/json",
        "HTTP_STRIPE_SIGNATURE" => "t=#{timestamp.to_i},v1=#{signature}"
      }

    expect(response).to have_http_status(:ok)
  end

  def get_gracias
    get "/gracias-por-tu-compra", params: { session_id: "cs_test_race" }

    expect(response).to redirect_to(gracias_por_tu_compra_path)
  end

  def expect_single_fulfillment
    fulfillment_jobs = enqueued_jobs.select { |job| job.fetch(:job) == PurchaseFulfillmentJob }
    expect(fulfillment_jobs.size).to eq(2)

    expect {
      perform_enqueued_jobs(only: PurchaseFulfillmentJob)
    }.to change { ActionMailer::Base.deliveries.count }.by(1)

    expect(Purchase.count).to eq(1)
    expect(User.where(email: "buyer@example.com").count).to eq(1)
    expect(Purchase.first.reload.fulfilled_at).to be_present
  end

  it "fulfills once when the webhook arrives before Gracias" do
    post_webhook
    get_gracias

    expect_single_fulfillment
  end

  it "fulfills once when Gracias arrives before the webhook" do
    get_gracias
    post_webhook

    expect_single_fulfillment
  end
end
