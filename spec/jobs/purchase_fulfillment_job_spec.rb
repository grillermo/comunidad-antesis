require "rails_helper"

RSpec.describe PurchaseFulfillmentJob do
  let(:purchase) { create(:purchase) }
  let(:pdf) { "%PDF-1.4\n\x00\xFFstamped".b }

  # Test adapter so retry_on's re-enqueue is observable (test env default is
  # :solid_queue — see newsletter_mailerlite_enqueue_spec.rb).
  around do |example|
    original = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :test
    example.run
    ActiveJob::Base.queue_adapter = original
  end

  before do
    allow(ManualPdfStamper).to receive(:new)
      .and_return(instance_double(ManualPdfStamper, call: pdf))
  end

  def fail_delivery_with(error)
    delivery = instance_double(ActionMailer::MessageDelivery)
    allow(PurchaseMailer).to receive(:fulfillment).and_return(delivery)
    allow(delivery).to receive(:deliver_now).and_raise(error)
  end

  def mailgun_error(status)
    return Mailgun::CommunicationError.new("network timeout") if status.zero?

    Mailgun::CommunicationError.new(
      "Mailgun request failed",
      status: status,
      body: '{"message":"request failed"}'
    )
  end

  it "stamps the PDF with the buyer's email, mails it, and marks fulfillment" do
    expect(PurchaseMailer).to receive(:fulfillment).with(purchase, pdf).and_call_original

    expect {
      described_class.perform_now(purchase)
    }.to change { ActionMailer::Base.deliveries.count }.by(1)

    expect(ManualPdfStamper).to have_received(:new).with(email: purchase.email)
    expect(purchase.reload.fulfilled_at).to be_present
  end

  it "skips already-fulfilled purchases (webhook retries, double enqueue)" do
    purchase.update!(fulfilled_at: 1.minute.ago)

    expect {
      described_class.perform_now(purchase)
    }.not_to change { ActionMailer::Base.deliveries.count }

    expect(ManualPdfStamper).not_to have_received(:new)
  end

  it "leaves the purchase unfulfilled and schedules a retry when stamping fails" do
    allow(ManualPdfStamper).to receive(:new).and_raise(ManualPdfStamper::Error, "boom")

    # retry_on is active even under perform_now (it works via rescue_from):
    # the error is swallowed and a retry is enqueued instead of raising.
    expect {
      described_class.perform_now(purchase)
    }.to have_enqueued_job(described_class).with(purchase)

    expect(purchase.reload.fulfilled_at).to be_nil
    expect(ActionMailer::Base.deliveries).to be_empty
  end

  [ 0, 408, 429, 500, 599 ].each do |status|
    it "leaves the purchase unfulfilled and retries transient Mailgun status #{status}" do
      fail_delivery_with(mailgun_error(status))

      expect {
        described_class.perform_now(purchase)
      }.to have_enqueued_job(described_class).with(purchase)

      expect(purchase.reload.fulfilled_at).to be_nil
    end
  end

  [ 400, 401, 404 ].each do |status|
    it "does not retry permanent Mailgun status #{status}" do
      error = mailgun_error(status)
      fail_delivery_with(error)

      expect {
        described_class.perform_now(purchase)
      }.to raise_error(error)

      expect(ActiveJob::Base.queue_adapter.enqueued_jobs).to be_empty
      expect(purchase.reload.fulfilled_at).to be_nil
    end
  end

  it "does not retry Railgun configuration errors" do
    error = Railgun::ConfigurationError.new("missing provider configuration")
    fail_delivery_with(error)

    expect {
      described_class.perform_now(purchase)
    }.to raise_error(error)

    expect(ActiveJob::Base.queue_adapter.enqueued_jobs).to be_empty
    expect(purchase.reload.fulfilled_at).to be_nil
  end
end
