require "rails_helper"

RSpec.describe "Landing shared user prop", type: :request do
  around do |example|
    travel_to Date.new(2026, 8, 14) do
      example.run
    end
  end

  it "exposes no user prop when anonymous" do
    get "/"
    expect(response).to have_http_status(:ok)

    page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
    props = page.fetch("props")
    expect(props).to include("user")
    expect(props.fetch("user")).to be_nil
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

  it "exposes the admin role used to authorize the admin link" do
    sign_in User.create!(email: "boss@example.com", password: "password123", role: :admin)
    get "/"

    page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
    expect(page.dig("props", "user", "role")).to eq("admin")
  end
end
