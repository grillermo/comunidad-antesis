# frozen_string_literal: true

# Creates the Stripe Checkout Session for the one-time manual purchase.
# The sales page submits a regular form, so the 303 sends the browser directly
# to Stripe instead of initiating an Inertia visit.
class CheckoutsController < ApplicationController
  def create
    raise ActiveRecord::RecordNotFound unless SalesLaunch.live?

    session = Stripe::Checkout::Session.create(
      mode: "payment",
      metadata: { product: Purchase::MANUAL_PRODUCT },
      line_items: [ { price: ENV.fetch("STRIPE_PRICE_ID"), quantity: 1 } ],
      success_url: "#{gracias_por_tu_compra_url}?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: root_url
    )

    redirect_to session.url, allow_other_host: true, status: :see_other
  end
end
