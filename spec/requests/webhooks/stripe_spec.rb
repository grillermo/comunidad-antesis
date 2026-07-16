require "rails_helper"

RSpec.describe "Stripe webhooks", type: :request do
  let(:secret) { "whsec_test_secret" }

  # Test adapter so have_enqueued_job works (test env default is :solid_queue).
  around do |example|
    original = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :test
    example.run
  ensure
    ActiveJob::Base.queue_adapter = original
  end

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("STRIPE_WEBHOOK_SECRET").and_return(secret)
  end

  def event_payload(
    session_id: "cs_test_123",
    email: "buyer@example.com",
    type: "checkout.session.completed",
    payment_status: "paid",
    metadata: { product: "manual_del_color_vivo" }
  )
    session = {
      id: session_id,
      object: "checkout.session",
      payment_status: payment_status,
      customer_details: { email: email }
    }
    session[:metadata] = metadata unless metadata == :missing

    {
      id: "evt_test_1",
      object: "event",
      type: type,
      data: { object: session }
    }.to_json
  end

  def signature_header(payload, signing_secret: secret, timestamp: Time.now)
    signature = Stripe::Webhook::Signature.compute_signature(timestamp, payload, signing_secret)
    "t=#{timestamp.to_i},v1=#{signature}"
  end

  def post_event(payload, header: signature_header(payload))
    headers = { "CONTENT_TYPE" => "application/json" }
    headers["HTTP_STRIPE_SIGNATURE"] = header if header
    post "/webhooks/stripe", params: payload, headers: headers
  end

  it "creates a purchase and enqueues fulfillment for checkout.session.completed" do
    payload = event_payload

    expect {
      post_event(payload)
    }.to change(Purchase, :count).by(1)
      .and have_enqueued_job(PurchaseFulfillmentJob)

    expect(response).to have_http_status(:ok)
    purchase = Purchase.last
    expect(purchase.stripe_session_id).to eq("cs_test_123")
    expect(purchase.user.email).to eq("buyer@example.com")
  end

  it "creates a purchase and enqueues fulfillment for checkout.session.async_payment_succeeded" do
    payload = event_payload(type: "checkout.session.async_payment_succeeded")

    expect {
      post_event(payload)
    }.to change(Purchase, :count).by(1)
      .and have_enqueued_job(PurchaseFulfillmentJob)

    expect(response).to have_http_status(:ok)
  end

  it "acknowledges and ignores an unpaid completed session" do
    payload = event_payload(payment_status: "unpaid")

    expect {
      post_event(payload)
    }.not_to change(Purchase, :count)

    expect(response).to have_http_status(:ok)
    expect(PurchaseFulfillmentJob).not_to have_been_enqueued
  end

  it "acknowledges and ignores a session with missing metadata" do
    payload = event_payload(metadata: :missing)

    expect {
      post_event(payload)
    }.not_to change(Purchase, :count)

    expect(response).to have_http_status(:ok)
    expect(PurchaseFulfillmentJob).not_to have_been_enqueued
  end

  it "acknowledges and ignores a session with wrong product metadata" do
    payload = event_payload(metadata: { product: "another_product" })

    expect {
      post_event(payload)
    }.not_to change(Purchase, :count)

    expect(response).to have_http_status(:ok)
    expect(PurchaseFulfillmentJob).not_to have_been_enqueued
  end

  it "acknowledges and ignores other event types" do
    payload = event_payload(type: "payment_intent.succeeded")

    expect {
      post_event(payload)
    }.not_to change(Purchase, :count)

    expect(response).to have_http_status(:ok)
    expect(PurchaseFulfillmentJob).not_to have_been_enqueued
  end

  it "rejects an invalid signature" do
    payload = event_payload

    expect {
      post_event(payload, header: signature_header(payload, signing_secret: "whsec_wrong"))
    }.not_to change(Purchase, :count)

    expect(response).to have_http_status(:bad_request)
    expect(PurchaseFulfillmentJob).not_to have_been_enqueued
  end

  it "rejects a missing signature" do
    payload = event_payload

    expect {
      post_event(payload, header: nil)
    }.not_to change(Purchase, :count)

    expect(response).to have_http_status(:bad_request)
    expect(PurchaseFulfillmentJob).not_to have_been_enqueued
  end

  it "is idempotent when an accepted event is delivered repeatedly" do
    payload = event_payload

    post_event(payload)

    expect {
      post_event(payload)
    }.not_to change(Purchase, :count)

    expect(response).to have_http_status(:ok)
    expect(User.where(email: "buyer@example.com").count).to eq(1)
  end
end
