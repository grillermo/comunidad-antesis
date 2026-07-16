# frozen_string_literal: true

# One-click login from the purchase email. The signed token carries a 2-day
# expiry; after that buyers recover access via the password-reset flow.
class AccesosController < ApplicationController
  def show
    user = User.find_signed!(params[:token], purpose: :purchase_login)
    sign_in(user)
    redirect_to Manual.url_for(user.last_manual_path) || manual_path
  rescue ActiveSupport::MessageVerifier::InvalidSignature, ActiveRecord::RecordNotFound
    redirect_to new_user_session_path,
      alert: "El enlace ha expirado. Recupera tu acceso con tu correo."
  end
end
