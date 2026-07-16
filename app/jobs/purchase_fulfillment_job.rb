# Stamps the manual PDF with the buyer's email and records fulfillment. The row
# lock serializes duplicate enqueues, and fulfilled_at skips work once marked.
# Mail handoff and the marker update are not atomic, so a crash between them can
# resend. deliver_now ensures the marker is set only after mail handoff.
class PurchaseFulfillmentJob < ApplicationJob
  queue_as :default

  retry_on ManualPdfStamper::Error, wait: :polynomially_longer, attempts: 5

  def perform(purchase)
    purchase.with_lock do
      next if purchase.fulfilled_at?

      pdf = ManualPdfStamper.new(email: purchase.email).call
      PurchaseMailer.fulfillment(purchase, pdf).deliver_now
      purchase.update!(fulfilled_at: Time.current)
    end
  end
end
