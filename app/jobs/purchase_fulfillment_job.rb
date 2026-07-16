# Stamps the manual PDF with the buyer's email and mails it, exactly once per
# purchase. Row lock + fulfilled_at guard make double-enqueues (webhook +
# gracias page) and Stripe webhook retries harmless. deliver_now (not later)
# so fulfilled_at is only set after the mail is actually handed off.
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
