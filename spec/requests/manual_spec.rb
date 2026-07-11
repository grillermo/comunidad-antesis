require "rails_helper"

RSpec.describe "Manual", type: :request do
  let(:user) { User.create!(email: "reader@example.com", password: "password123") }

  it "redirects anonymous visitors to the login page" do
    # A plain request-spec GET carries no X-Inertia header, so Devise's
    # authenticate_user! issues an ordinary 302 to /users/sign_in. (A real
    # Inertia XHR visit would get Inertia's client-side redirect handling; this
    # app has no custom unauthenticated-Inertia handler, so we assert only the
    # verifiable browser-GET behavior here.)
    get "/manual-del-color-vivo"
    expect(response).to redirect_to("/users/sign_in")
  end

  it "renders the Contenido index for a signed-in user" do
    sign_in user
    get "/manual-del-color-vivo"
    expect(response).to have_http_status(:ok)

    page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
    expect(page.fetch("component")).to eq("manual-del-color-vivo/Index")
    expect(page.dig("props", "contents")).to be_an(Array)
  end

  it "renders every section route with 200 and the correct component" do
    sign_in user
    Manual.walk do |node, path|
      url = "/manual-del-color-vivo/#{path.join('/')}"
      get url
      expect(response).to have_http_status(:ok), "expected 200 for #{url}, got #{response.status}"

      page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
      expect(page.fetch("component")).to eq("manual-del-color-vivo/#{path.join('/')}")
      expect(page.dig("props", "title")).to eq(node[:title])
    end
  end

  it "returns 404 for an unknown slug" do
    sign_in user
    # No route is drawn for unknown slugs; Rails' router raises
    # ActionController::RoutingError, which the test env (show_exceptions =
    # :rescuable, see config/environments/test.rb) renders as a 404 response
    # rather than propagating the exception. So assert on the status, not raise_error.
    get "/manual-del-color-vivo/does-not-exist"
    expect(response).to have_http_status(:not_found)
  end

  it "never includes a pdfPages prop outside development" do
    sign_in user
    get "/manual-del-color-vivo/glosario"
    page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
    expect(page["props"]).not_to have_key("pdfPages")
  end
end
