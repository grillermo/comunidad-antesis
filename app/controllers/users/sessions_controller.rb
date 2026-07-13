# frozen_string_literal: true

# Inherits Devise::SessionsController (NOT InertiaController), so the shared
# `user` prop is intentionally absent on the Login page.
class Users::SessionsController < Devise::SessionsController
  before_action :require_login_parameters, only: :create

  rate_limit to: 10, within: 1.minute, only: :create, name: "login-by-ip",
    by: -> { request.remote_ip }
  rate_limit to: 5, within: 15.minutes, only: :create, name: "login-by-email",
    by: -> { normalized_login_email }

  # Render the React login page instead of Devise's ERB view.
  def new
    render inertia: "Login", props: {
      alert: flash[:alert]
    }
  end

  protected

  # Send readers back where they left off: an explicitly requested page (Devise
  # stored location), else the last manual section they viewed, else the manual root.
  def after_sign_in_path_for(resource)
    stored_location_for(resource) ||
      Manual.url_for(resource.last_manual_path) ||
      Manual::GLOSSARY_PATH
  end

  # Let Warden redirect failed sign-ins so the Inertia page receives the alert.
  def auth_options
    super.except(:recall)
  end

  private

  def require_login_parameters
    head :bad_request unless params[:user].is_a?(ActionController::Parameters)
  end

  def normalized_login_email
    return unless params[:user].is_a?(ActionController::Parameters)

    params[:user][:email].to_s.strip.downcase
  end
end
