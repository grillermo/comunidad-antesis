require "rails_helper"

RSpec.describe "Sessions", type: :request do
  before { Rails.cache.clear }
  after { Rails.cache.clear }

  def inertia_page
    JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
  end

  def expect_rejected_sign_in(email:)
    post "/users/sign_in", params: { user: { email: email, password: "wrong" } }

    expect(response).to redirect_to(new_user_session_path)
    expect(request.env.fetch("warden")).not_to be_authenticated(:user)

    follow_redirect!
    expect(response.body).not_to include("wrong")
    expect(inertia_page.dig("props", "alert")).to eq("Correo o contraseña no válidos.")
  end

  it "renders the login page" do
    get "/users/sign_in"

    expect(response).to have_http_status(:ok)
    expect(inertia_page.fetch("component")).to eq("Login")
  end

  it "signs in with valid credentials and redirects to the glossary when there is no manual history" do
    User.create!(email: "user@example.com", password: "password123")

    post "/users/sign_in", params: { user: { email: "user@example.com", password: "password123" } }

    expect(response).to redirect_to(Manual::GLOSSARY_PATH)
    expect(request.env.fetch("warden")).to be_authenticated(:user)
    follow_redirect!
    expect(response).to have_http_status(:ok)
  end

  it "signs in and redirects to the last manual page the user saw" do
    user = User.create!(
      email: "user@example.com",
      password: "password123",
      last_manual_path: "color-cotidiano/velas"
    )

    post "/users/sign_in", params: { user: { email: user.email, password: "password123" } }

    expect(response).to redirect_to("/manual-del-color-vivo/color-cotidiano/velas")
  end

  it "falls back to the glossary when the stored manual path is no longer valid" do
    user = User.create!(
      email: "user@example.com",
      password: "password123",
      last_manual_path: "removed-in-a-later-edition"
    )

    post "/users/sign_in", params: { user: { email: user.email, password: "password123" } }

    expect(response).to redirect_to(Manual::GLOSSARY_PATH)
  end

  it "prefers a Devise-stored location over the last manual page" do
    user = User.create!(
      email: "user@example.com",
      password: "password123",
      last_manual_path: "color-cotidiano/velas"
    )

    # Hitting a protected page unauthenticated makes Devise store the location.
    get "/manual-del-color-vivo/glosario"
    expect(response).to redirect_to("/users/sign_in")

    post "/users/sign_in", params: { user: { email: user.email, password: "password123" } }

    expect(response).to redirect_to("/manual-del-color-vivo/glosario")
  end

  it "rejects a known email with the wrong password using a generic alert" do
    User.create!(email: "user@example.com", password: "password123")

    expect_rejected_sign_in(email: "user@example.com")
  end

  it "rejects an unknown email using the same generic alert" do
    expect_rejected_sign_in(email: "unknown@example.com")
  end

  it "redirects an invalid Inertia XHR sign-in back to Login with the generic alert" do
    User.create!(email: "user@example.com", password: "password123")
    get "/users/sign_in"

    expect(response).to have_http_status(:ok)

    headers = {
      "X-Inertia" => "true",
      "X-Inertia-Version" => InertiaRails.configuration.version.to_s,
      "X-Requested-With" => "XMLHttpRequest",
      "Accept" => "text/html, application/xhtml+xml"
    }

    post "/users/sign_in",
      params: { user: { email: "user@example.com", password: "wrong" } },
      headers: headers,
      as: :json

    expect(response).to have_http_status(:found)
    expect(response).to redirect_to(new_user_session_path)
    expect(request.flash[:alert]).to eq("Correo o contraseña no válidos.")

    follow_redirect!(headers: headers)

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq("application/json")
    expect(response.headers.fetch("X-Inertia")).to eq("true")
    expect(JSON.parse(response.body)).to include(
      "component" => "Login",
      "props" => include("alert" => "Correo o contraseña no válidos.")
    )
    expect(request.env.fetch("warden")).not_to be_authenticated(:user)
  end

  it "rejects malformed login parameters with a bodyless bad request" do
    post "/users/sign_in", params: { user: "malformed" }

    expect(response).to have_http_status(:bad_request)
    expect(response.body).to be_empty
  end

  it "rejects missing login parameters with a bodyless bad request" do
    post "/users/sign_in"

    expect(response).to have_http_status(:bad_request)
    expect(response.body).to be_empty
  end

  it "allows attempts below both login limits to use Devise's generic failure response" do
    5.times do
      post "/users/sign_in", params: { user: { email: "below@example.com", password: "wrong" } }

      expect(response).to redirect_to(new_user_session_path)
    end

    follow_redirect!
    expect(inertia_page.dig("props", "alert")).to eq("Correo o contraseña no válidos.")
  end

  it "rate limits the sixth attempt for the same normalized email" do
    submitted_emails = [
      " Person@Example.com ",
      "PERSON@example.com",
      "person@EXAMPLE.com",
      " person@example.com",
      "person@example.com ",
      "person@example.com"
    ]

    submitted_emails.first(5).each do |email|
      post "/users/sign_in", params: { user: { email: email, password: "wrong" } }

      expect(response).to redirect_to(new_user_session_path)
    end

    post "/users/sign_in", params: { user: { email: submitted_emails.last, password: "wrong" } }

    expect(response).to have_http_status(:too_many_requests)
  end

  it "rate limits the eleventh attempt from one IP across distinct emails" do
    remote_ip = "203.0.113.10"

    10.times do |attempt|
      post "/users/sign_in",
        params: { user: { email: "person#{attempt}@example.com", password: "wrong" } },
        headers: { "REMOTE_ADDR" => remote_ip }

      expect(response).to redirect_to(new_user_session_path)
    end

    post "/users/sign_in",
      params: { user: { email: "person10@example.com", password: "wrong" } },
      headers: { "REMOTE_ADDR" => remote_ip }

    expect(response).to have_http_status(:too_many_requests)
  end

  it "signs out with a 303 redirect (Inertia requirement)" do
    user = User.create!(email: "user@example.com", password: "password123")
    sign_in user

    delete "/users/sign_out"

    expect(response).to have_http_status(:see_other)
    expect(response).to redirect_to(root_path)
    expect(request.env.fetch("warden")).not_to be_authenticated(:user)
  end

  it "preserves Devise's non-navigational logout response" do
    user = User.create!(email: "user@example.com", password: "password123")
    sign_in user

    delete "/users/sign_out", as: :json

    expect(response).to have_http_status(:no_content)
    expect(response).not_to be_redirect
    expect(request.env.fetch("warden")).not_to be_authenticated(:user)
  end

  it "preserves Devise's non-navigational response when already signed out" do
    delete "/users/sign_out", as: :json

    expect(response).to have_http_status(:unauthorized)
    expect(response).not_to be_redirect
  end

  it "has no self-registration or password-recovery routes" do
    expect(Rails.application.routes.url_helpers).not_to respond_to(:new_user_registration_path)
    expect(Rails.application.routes.url_helpers).not_to respond_to(:new_user_password_path)
  end
end
