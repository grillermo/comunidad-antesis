# Stamps the manual PDF with the buyer's email and records fulfillment. The row
# lock serializes duplicate enqueues, and fulfilled_at skips work once marked.
# Mail handoff and the marker update are not atomic, so a crash between them can
# resend. deliver_now ensures the marker is set only after mail handoff.
class PurchaseFulfillmentJob < ApplicationJob
  class TransientMailgunError < StandardError; end

  queue_as :default

  retry_on ManualPdfStamper::Error, wait: :polynomially_longer, attempts: 5
  retry_on TransientMailgunError, wait: :polynomially_longer, attempts: 5

  def perform(purchase)
    purchase.with_lock do
      next if purchase.fulfilled_at?

      pdf = ManualPdfStamper.new(email: purchase.email).call
      deliver_fulfillment(purchase, pdf)
      purchase.update!(fulfilled_at: Time.current)
    end
  end

  private

  def deliver_fulfillment(purchase, pdf)
    PurchaseMailer.fulfillment(purchase, pdf).deliver_now
  rescue Mailgun::CommunicationError => error
    raise unless transient_mailgun_error?(error)

    raise TransientMailgunError, "Temporary Mailgun delivery failure"
  end

  def transient_mailgun_error?(error)
    status = error.status.to_i
    status.zero? || status == 408 || status == 429 || status.between?(500, 599)
  end
end
