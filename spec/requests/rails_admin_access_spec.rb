require "rails_helper"

RSpec.describe "RailsAdmin access", type: :request do
  it "redirects anonymous users away from the admin" do
    login_path = new_user_session_path

    get "/antesis-admin"

    expect(response).to have_http_status(:found)
    expect(response).to redirect_to(login_path)
  end

  it "hides the admin from an authenticated commenter" do
    sign_in User.create!(email: "c@example.com", password: "password123", role: :commenter)

    get "/antesis-admin"

    expect(response).to have_http_status(:not_found)
  end

  it "allows an admin into the admin dashboard" do
    sign_in User.create!(email: "a@example.com", password: "password123", role: :admin)

    get "/antesis-admin"

    expect(response).to have_http_status(:ok)
    expect(response.body).not_to match(/translation missing/i)
  end

  it "lists comments for an admin" do
    admin = create(:user, :admin)
    create(:comment, user: admin)
    sign_in admin

    get "/antesis-admin/comment"

    expect(response).to have_http_status(:ok)
  end
end
