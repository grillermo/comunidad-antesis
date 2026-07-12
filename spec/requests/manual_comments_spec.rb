require "rails_helper"

RSpec.describe "Manual section comments prop", type: :request do
  def page_object(response)
    node = Nokogiri::HTML(response.body).at_css("script[data-page]")
    JSON.parse(node.text)
  end

  let(:user) { create(:user) }
  let(:section) { "el-origen-del-color/introduccion" }

  it "defers the comments prop on the initial render" do
    create(:comment, section_path: section, user: user, body: "hola")
    sign_in user

    get "/manual-del-color-vivo/#{section}"

    expect(response).to have_http_status(:ok)
    page = page_object(response)
    expect(page.dig("props", "section")).to eq(section)
    expect(page.fetch("props")).not_to have_key("comments")
    expect(page.dig("deferredProps", "default")).to include("comments")
  end

  it "returns the built comment tree on a partial reload for comments" do
    create(:comment, section_path: section, user: user, body: "hola")
    sign_in user

    # X-Inertia-Version must match the server's (ViteRuby.digest, set in
    # config/initializers/inertia_rails.rb) or the middleware treats the GET
    # as stale and returns a 409 force-refresh instead of the partial payload.
    get "/manual-del-color-vivo/#{section}",
        headers: {
          "X-Inertia" => "true",
          "X-Inertia-Version" => InertiaRails.configuration.version.to_s,
          "X-Inertia-Partial-Component" => "manual-del-color-vivo/#{section}",
          "X-Inertia-Partial-Data" => "comments"
        }

    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body.dig("props", "comments").first.fetch("body_html")).to include("hola")
  end
end
