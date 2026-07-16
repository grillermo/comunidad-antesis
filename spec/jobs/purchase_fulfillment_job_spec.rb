require "rails_helper"

RSpec.describe PurchaseFulfillmentJob do
  let(:purchase) { create(:purchase) }

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
      .and_return(instance_double(ManualPdfStamper, call: "%PDF-1.4 fake"))
  end

  it "stamps the PDF with the buyer's email, mails it, and marks fulfillment" do
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
end
