# frozen_string_literal: true

# Inherits Devise::SessionsController (NOT InertiaController), so the shared
# `user` prop is intentionally absent on the Login page.
class Users::SessionsController < Devise::SessionsController
  # Render the React login page instead of Devise's ERB view.
  def new
    render inertia: "Login", props: {
      alert: flash[:alert]
    }
  end

  protected

  # Let Warden redirect failed sign-ins so the Inertia page receives the alert.
  def auth_options
    super.except(:recall).merge(message: :invalid)
  end

  private

  # Inertia requires a 303 redirect after a non-GET request (logout is DELETE).
  def respond_to_on_destroy(non_navigational_status: :no_content)
    redirect_to after_sign_out_path_for(resource_name), status: :see_other
  end
end
