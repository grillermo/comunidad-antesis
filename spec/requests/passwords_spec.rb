require "rails_helper"

RSpec.describe "Passwords", type: :request do
  let(:user) { create(:user) }

  before { Rails.cache.clear }
  after { Rails.cache.clear }

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

  it "allows reset requests below both limits to retain paranoid behavior" do
    known_notice = nil

    2.times do
      post "/users/password", params: { user: { email: user.email } }
      known_notice = request.flash[:notice]
      expect(response).to redirect_to("/users/sign_in")
    end

    post "/users/password", params: { user: { email: "unknown@example.com" } }

    expect(response).to redirect_to("/users/sign_in")
    expect(request.flash[:notice]).to eq(known_notice)
  end

  it "rate limits the sixth reset request for the same normalized email across IPs" do
    submitted_emails = [
      " Person@Example.com ",
      "PERSON@example.com",
      "person@EXAMPLE.com",
      " person@example.com",
      "person@example.com ",
      "person@example.com"
    ]

    submitted_emails.first(5).each_with_index do |email, index|
      post "/users/password",
        params: { user: { email: email } },
        headers: { "REMOTE_ADDR" => "203.0.113.#{index + 1}" }

      expect(response).to redirect_to("/users/sign_in")
    end

    post "/users/password",
      params: { user: { email: submitted_emails.last } },
      headers: { "REMOTE_ADDR" => "203.0.113.6" }

    expect(response).to have_http_status(:too_many_requests)
  end

  it "rate limits the eleventh reset request from one IP across distinct emails" do
    remote_ip = "203.0.113.20"

    10.times do |attempt|
      post "/users/password",
        params: { user: { email: "person#{attempt}@example.com" } },
        headers: { "REMOTE_ADDR" => remote_ip }

      expect(response).to redirect_to("/users/sign_in")
    end

    post "/users/password",
      params: { user: { email: "person10@example.com" } },
      headers: { "REMOTE_ADDR" => remote_ip }

    expect(response).to have_http_status(:too_many_requests)
  end

  {
    "missing parameters" => {},
    "a scalar user" => { user: "malformed" },
    "an array user" => { user: [ "malformed" ] },
    "a nested email" => { user: { email: { value: "person@example.com" } } },
    "an array email" => { user: { email: [ "person@example.com" ] } }
  }.each do |description, submitted_params|
    it "rejects #{description} without sending reset email" do
      expect {
        post "/users/password", params: submitted_params
      }.not_to change { ActionMailer::Base.deliveries.count }

      expect(response).to have_http_status(:bad_request)
      expect(response.body).to be_empty
    end
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
