# frozen_string_literal: true

module Webhooks
  # Stripe's signature authenticates this API-only endpoint.
  class StripeController < ActionController::API
    FULFILLMENT_EVENT_TYPES = %w[
      checkout.session.completed
      checkout.session.async_payment_succeeded
    ].freeze

    def create
      event = Stripe::Webhook.construct_event(
        request.body.read,
        request.env["HTTP_STRIPE_SIGNATURE"].to_s,
        ENV.fetch("STRIPE_WEBHOOK_SECRET")
      )

      if FULFILLMENT_EVENT_TYPES.include?(event.type) && Purchase.fulfillable_session?(event.data.object)
        purchase = Purchase.record!(event.data.object)
        PurchaseFulfillmentJob.perform_later(purchase)
      end

      head :ok
    rescue JSON::ParserError, Stripe::SignatureVerificationError
      head :bad_request
    end
  end
end
