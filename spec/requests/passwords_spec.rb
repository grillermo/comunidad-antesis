require "rails_helper"

RSpec.describe "Passwords", type: :request do
  let(:user) { create(:user) }

  it "renders the forgot-password Inertia page" do
    get "/users/password/new"

    expect(response).to have_http_status(:ok)
    page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
    expect(page.fetch("component")).to eq("ForgotPassword")
  end

  it "sends reset instructions and redirects to login" do
    # Devise mails with deliver_now, so deliveries changes synchronously.
    expect {
      post "/users/password", params: { user: { email: user.email } }
    }.to change { ActionMailer::Base.deliveries.count }.by(1)

    expect(response).to redirect_to("/users/sign_in")
  end

  it "does not reveal whether the submitted email exists" do
    post "/users/password", params: { user: { email: user.email } }
    known_email_notice = request.flash[:notice]

    expect {
      post "/users/password", params: { user: { email: "unknown@example.com" } }
    }.not_to change { ActionMailer::Base.deliveries.count }

    expect(response).to redirect_to("/users/sign_in")
    expect(request.flash[:notice]).to eq(known_email_notice)
  end

  it "renders the reset form for a valid token" do
    token = user.send_reset_password_instructions

    get "/users/password/edit", params: { reset_password_token: token }

    expect(response).to have_http_status(:ok)
    page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
    expect(page.fetch("component")).to eq("ResetPassword")
    expect(page.dig("props", "resetPasswordToken")).to eq(token)
  end

  it "updates the password with a valid token" do
    token = user.send_reset_password_instructions

    put "/users/password", params: {
      user: {
        reset_password_token: token,
        password: "newpassword123",
        password_confirmation: "newpassword123"
      }
    }

    expect(user.reload.valid_password?("newpassword123")).to be(true)
  end

  it "renders safe validation errors when password confirmation does not match" do
    original_encrypted_password = user.encrypted_password
    token = user.send_reset_password_instructions

    put "/users/password", params: {
      user: {
        reset_password_token: token,
        password: "newpassword123",
        password_confirmation: "differentpassword123"
      }
    }

    expect(response).to have_http_status(:unprocessable_content)
    page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
    expect(page.fetch("component")).to eq("ResetPassword")
    expect(page.dig("props", "resetPasswordToken")).to eq(token)
    expect(page.dig("props", "errors")).to eq(
      "password_confirmation" => [ "Las contraseñas no coinciden." ]
    )
    expect(response.body).not_to include("newpassword123", "differentpassword123")
    expect(user.reload.encrypted_password).to eq(original_encrypted_password)
  end
end
