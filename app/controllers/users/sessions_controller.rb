# frozen_string_literal: true

# Inherits Devise::SessionsController (NOT InertiaController), so the shared
# `user` prop is intentionally absent on the Login page.
class Users::SessionsController < Devise::SessionsController
  rate_limit to: 10, within: 1.minute, only: :create, name: "login-by-ip",
    by: -> { request.remote_ip }
  rate_limit to: 5, within: 15.minutes, only: :create, name: "login-by-email",
    by: -> { params.dig(:user, :email).to_s.strip.downcase }

  # Render the React login page instead of Devise's ERB view.
  def new
    render inertia: "Login", props: {
      alert: flash[:alert]
    }
  end

  protected

  # Let Warden redirect failed sign-ins so the Inertia page receives the alert.
  def auth_options
    super.except(:recall)
  end
end
