# frozen_string_literal: true

# Handles the browser return from Stripe Checkout. The webhook and this path
# share Purchase.record!, so either arrival order produces one purchase.
class GraciasController < InertiaController
  def show
    if params.key?(:session_id)
      confirm_purchase
    else
      render_confirmation
    end
  rescue Stripe::InvalidRequestError
    redirect_to root_path
  end

  private

  def confirm_purchase
    stripe_session_id = params[:session_id]
    return redirect_to(root_path) unless stripe_session_id.is_a?(String) && stripe_session_id.present?

    checkout_session = Stripe::Checkout::Session.retrieve(stripe_session_id)
    return redirect_to(root_path) unless Purchase.fulfillable_session?(checkout_session)

    purchase = Purchase.record!(checkout_session)
    PurchaseFulfillmentJob.perform_later(purchase)

    if current_user.nil? && purchase.auto_login_on_return?
      sign_in(purchase.user)
      Current.user = purchase.user
    end
    session[:gracias_purchase_id] = purchase.id

    redirect_to gracias_por_tu_compra_path
  end

  def render_confirmation
    return redirect_to(root_path) unless session[:gracias_purchase_id]

    purchase = Purchase.find_by(id: session[:gracias_purchase_id])
    return redirect_to(root_path) unless purchase

    props = if current_user == purchase.user
      { email: purchase.email, manualPath: manual_path }
    else
      {}
    end

    render inertia: "GraciasPorTuCompra", props: props
  end
end
