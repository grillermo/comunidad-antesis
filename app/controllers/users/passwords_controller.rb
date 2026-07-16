# frozen_string_literal: true

# Renders the React forgot/reset password pages instead of Devise's ERB views.
class Users::PasswordsController < Devise::PasswordsController
  def new
    render inertia: "ForgotPassword", props: {
      alert: flash[:alert],
      notice: flash[:notice]
    }
  end

  def edit
    render inertia: "ResetPassword", props: {
      resetPasswordToken: params[:reset_password_token],
      alert: flash[:alert]
    }
  end
end
