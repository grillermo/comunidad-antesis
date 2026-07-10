require "rails_helper"

RSpec.describe "Landing shared user prop", type: :request do
  it "exposes no user prop when anonymous" do
    get "/"
    expect(response).to have_http_status(:ok)

    page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
    expect(page.dig("props", "user")).to be_nil
  end

  it "exposes the user prop when signed in" do
    user = User.create!(email: "viewer@example.com", password: "password123")
    sign_in user

    get "/"
    expect(response).to have_http_status(:ok)

    page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
    expect(page.dig("props", "user")).to eq(
      "id" => user.id,
      "email" => "viewer@example.com",
      "role" => user.role
    )
  end
end
