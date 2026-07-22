require "rails_helper"

RSpec.describe "Admin::Fingerprints", type: :request do
  let(:admin) { User.create!(email: "admin@example.com", password: Devise.friendly_token, role: :admin) }
  let(:commenter) { User.create!(email: "reader@example.com", password: Devise.friendly_token) }

  it "blocks non-admins" do
    sign_in commenter
    get "/antesis-admin/fingerprint"
    expect(response).to have_http_status(:not_found).or have_http_status(:redirect)
  end

  it "decodes an uploaded stamped PDF for an admin" do
    buyer = User.create!(email: "buyer@example.com", password: Devise.friendly_token)
    pdf_bytes = ManualPdfStamper.new(email: buyer.email).call

    Tempfile.create([ "upload", ".pdf" ], binmode: true) do |f|
      f.write(pdf_bytes)
      f.rewind

      sign_in admin
      post "/antesis-admin/fingerprint", params: {
        file: Rack::Test::UploadedFile.new(f.path, "application/pdf")
      }

      expect(response).to have_http_status(:ok)
    end
  end
end
