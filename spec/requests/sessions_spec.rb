require "rails_helper"

RSpec.describe "Sessions", type: :request do
  it "renders the login page" do
    get "/users/sign_in"

    expect(response).to have_http_status(:ok)
    expect(response.body).to include("Login")
  end

  it "signs in with valid credentials and redirects to root" do
    User.create!(email: "user@example.com", password: "password123")

    post "/users/sign_in", params: { user: { email: "user@example.com", password: "password123" } }

    expect(response).to redirect_to(root_path)
    follow_redirect!
    expect(response).to have_http_status(:ok)
  end

  it "rejects invalid credentials without a session" do
    User.create!(email: "user@example.com", password: "password123")

    post "/users/sign_in", params: { user: { email: "user@example.com", password: "wrong" } }

    expect(response).to redirect_to(new_user_session_path)
    expect(request.env.fetch("warden")).not_to be_authenticated(:user)

    follow_redirect!
    expect(response.body).to include("Correo o contraseña no válidos.")
    expect(response.body).not_to include("wrong")
  end

  it "signs out with a 303 redirect (Inertia requirement)" do
    user = User.create!(email: "user@example.com", password: "password123")
    sign_in user

    delete "/users/sign_out"

    expect(response).to have_http_status(:see_other)
    expect(response).to redirect_to(root_path)
  end

  it "has no self-registration route" do
    expect(Rails.application.routes.url_helpers).not_to respond_to(:new_user_registration_path)
  end
end
