require "rails_helper"

RSpec.describe "Landing", type: :request do
  def inertia_page
    JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
  end

  it "renders the pre-launch landing page with its existing props before August 15, 2026" do
    travel_to Date.new(2026, 8, 14) do
      get "/", params: { source: "instagram" }
    end

    expect(response).to have_http_status(:ok)
    expect(inertia_page.fetch("component")).to eq("Landing")
    expect(inertia_page.fetch("props")).to include(
      "subscribed" => false,
      "alreadySubscribed" => false,
      "source" => "instagram",
      "manualPath" => "/manual-del-color-vivo"
    )
  end

  it "renders the sales landing page from August 15, 2026" do
    travel_to Date.new(2026, 8, 15) do
      get "/"
    end

    expect(response).to have_http_status(:ok)
    expect(inertia_page.fetch("component")).to eq("LandingSale")
  end

  it "exposes the real manual contents for the sales preview" do
    travel_to Date.new(2026, 8, 15) do
      get "/"
    end

    expect(inertia_page.dig("props", "contents")).to eq(
      JSON.parse(Manual::TABLE_OF_CONTENTS.to_json)
    )
    expect(inertia_page.dig("props", "manualPath")).to eq("/manual-del-color-vivo")
  end
end
