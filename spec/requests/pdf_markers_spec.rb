require "rails_helper"

RSpec.describe "PdfMarkers", type: :request do
  let(:admin) { create(:user, :admin) }

  describe "POST /anotate/markers" do
    it "redirects anonymous users to login" do
      post "/anotate/markers", params: { pdf_marker: { page: 1, x: 0.5, y: 0.5 } }

      expect(response).to redirect_to(new_user_session_path)
    end

    it "is hidden from non-admin users" do
      sign_in create(:user)

      post "/anotate/markers", params: { pdf_marker: { page: 1, x: 0.5, y: 0.5 } }

      expect(response).to have_http_status(:not_found)
    end

    it "creates a marker and returns it as JSON" do
      sign_in admin

      expect {
        post "/anotate/markers",
          params: { pdf_marker: { page: 12, x: 0.31416, y: 0.9 } },
          as: :json
      }.to change(PdfMarker, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(response.parsed_body).to eq(
        "id" => PdfMarker.last.id, "page" => 12, "x" => 0.31416, "y" => 0.9
      )
    end

    it "rejects an out-of-range page with validation errors" do
      sign_in admin

      post "/anotate/markers",
        params: { pdf_marker: { page: 999, x: 0.5, y: 0.5 } },
        as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["errors"]).to be_present
    end
  end

  describe "DELETE /anotate/markers/:id" do
    it "deletes the marker" do
      marker = create(:pdf_marker)
      sign_in admin

      expect {
        delete "/anotate/markers/#{marker.id}"
      }.to change(PdfMarker, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "404s on an unknown marker" do
      sign_in admin

      delete "/anotate/markers/999999"

      expect(response).to have_http_status(:not_found)
    end
  end
end
