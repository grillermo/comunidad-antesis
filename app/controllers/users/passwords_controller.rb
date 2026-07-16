# frozen_string_literal: true

# Renders the React forgot/reset password pages instead of Devise's ERB views.
class Users::PasswordsController < Devise::PasswordsController
  before_action :require_password_request_parameters, only: :create

  rate_limit to: 10, within: 1.minute, only: :create, name: "password-reset-by-ip",
    by: -> { request.remote_ip }
  rate_limit to: 5, within: 15.minutes, only: :create, name: "password-reset-by-email",
    by: -> { normalized_password_request_email }

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

  def update
    super do |resource|
      next if resource.errors.empty?

      render inertia: "ResetPassword", props: {
        resetPasswordToken: resource.reset_password_token,
        errors: resource.errors.to_hash
      }, status: :unprocessable_content
      return
    end
  end

  private

  def require_password_request_parameters
    user_parameters = params[:user]
    valid_shape = user_parameters.is_a?(ActionController::Parameters) &&
      user_parameters[:email].is_a?(String)

    head :bad_request unless valid_shape
  end

  def normalized_password_request_email
    params[:user][:email].strip.downcase
  end
end
