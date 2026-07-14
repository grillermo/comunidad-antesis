require "rails_helper"

RSpec.describe "Anotate", type: :request do
  let(:admin) { create(:user, :admin) }
  let(:commenter) { create(:user) }

  describe "GET /anotate" do
    it "redirects anonymous users to login" do
      get "/anotate"

      expect(response).to redirect_to(new_user_session_path)
    end

    it "is hidden from non-admin users" do
      sign_in commenter

      get "/anotate"

      expect(response).to have_http_status(:not_found)
    end

    it "renders the Anotate page with markers and page metadata for an admin" do
      marker = create(:pdf_marker, page: 5, x: 0.5, y: 0.25)
      sign_in admin

      get "/anotate"

      expect(response).to have_http_status(:ok)
      page = JSON.parse(response.parsed_body.at_css("script[data-page]").text)
      props = page["props"]
      expect(props["pageCount"]).to eq(ManualPdfPages::PAGE_COUNT)
      expect(props["pageAspect"]).to be_within(0.001).of(1.543)
      expect(props["markers"]).to eq([
        { "id" => marker.id, "page" => 5, "x" => 0.5, "y" => 0.25 }
      ])
    end
  end

  describe "GET /anotate/pages/:page" do
    it "redirects anonymous users to login" do
      get "/anotate/pages/1"

      expect(response).to redirect_to(new_user_session_path)
    end

    it "is hidden from non-admin users" do
      sign_in commenter

      get "/anotate/pages/1"

      expect(response).to have_http_status(:not_found)
    end

    it "serves the page PNG to an admin" do
      sign_in admin

      get "/anotate/pages/1"

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("image/png")
      expect(response.headers["Cache-Control"]).to include("max-age=31556952")
    end

    it "404s on a page beyond the manual" do
      sign_in admin

      get "/anotate/pages/137"

      expect(response).to have_http_status(:not_found)
    end

    it "404s on a non-numeric page" do
      sign_in admin

      get "/anotate/pages/abc"

      expect(response).to have_http_status(:not_found)
    end

    it "responds 503 when rendering fails" do
      sign_in admin
      allow(ManualPdfPages).to receive(:path_for).and_raise(ManualPdfPages::Error, "boom")

      get "/anotate/pages/1"

      expect(response).to have_http_status(:service_unavailable)
      expect(response.headers["Cache-Control"]).to eq("no-cache")
    end
  end
end
