# frozen_string_literal: true

# Handles the browser return from Stripe Checkout. The webhook and this path
# share Purchase.record!, so either arrival order produces one purchase.
class GraciasController < InertiaController
  def show
    return redirect_to(root_path) if params[:session_id].blank?

    session = Stripe::Checkout::Session.retrieve(params[:session_id])
    return redirect_to(root_path) unless Purchase.fulfillable_session?(session)

    purchase = Purchase.record!(session)
    PurchaseFulfillmentJob.perform_later(purchase)

    sign_in(purchase.user) unless current_user == purchase.user
    Current.user = purchase.user

    render inertia: "GraciasPorTuCompra", props: {
      email: purchase.email,
      manualPath: manual_path
    }
  rescue Stripe::InvalidRequestError
    redirect_to root_path
  end
end
