require "rails_helper"

RSpec.describe "Admin::Fingerprints", type: :request do
  let(:admin) { create(:user, :admin) }
  let(:commenter) { create(:user) }

  def inertia_props(response)
    node = Nokogiri::HTML(response.body).at_css("script[data-page]")
    JSON.parse(node.text).fetch("props")
  end

  def upload_pdf(pdf_bytes)
    Tempfile.create([ "upload", ".pdf" ], binmode: true) do |f|
      f.write(pdf_bytes)
      f.rewind
      yield Rack::Test::UploadedFile.new(f.path, "application/pdf")
    end
  end

  it "redirects anonymous users to login" do
    get "/antesis-admin/fingerprint"

    expect(response).to have_http_status(:found)
    expect(response).to redirect_to(new_user_session_path)
  end

  it "blocks non-admins" do
    sign_in commenter
    get "/antesis-admin/fingerprint"
    expect(response).to have_http_status(:not_found)
  end

  it "decodes an uploaded stamped PDF for an admin" do
    buyer = create(:user)
    pdf_bytes = ManualPdfStamper.new(email: buyer.email).call

    sign_in admin
    upload_pdf(pdf_bytes) do |file|
      post "/antesis-admin/fingerprint", params: { file: file }
    end

    expect(response).to have_http_status(:ok)
    expect(inertia_props(response).dig("result", "email")).to eq(buyer.email)
  end

  it "renders result: null for a valid PDF with no matching fingerprint" do
    pdf_bytes = ManualPdfStamper.new(email: "ghost@example.com").call

    sign_in admin
    upload_pdf(pdf_bytes) do |file|
      post "/antesis-admin/fingerprint", params: { file: file }
    end

    expect(response).to have_http_status(:ok)
    expect(inertia_props(response)["result"]).to be_nil
  end

  it "responds with 400, not 500, when no file is uploaded" do
    sign_in admin
    post "/antesis-admin/fingerprint", params: {}

    expect(response).to have_http_status(:bad_request)
  end

  it "renders the error prop when the decoder raises FingerprintDecoder::Error" do
    allow_any_instance_of(FingerprintDecoder).to receive(:call).and_raise(FingerprintDecoder::Error, "boom")

    sign_in admin
    upload_pdf(ManualPdfStamper.new(email: "ghost@example.com").call) do |file|
      post "/antesis-admin/fingerprint", params: { file: file }
    end

    expect(response).to have_http_status(:ok)
    expect(inertia_props(response)["error"]).to eq("boom")
  end

  it "rejects an oversized upload with the error prop, never reaching pdftoppm" do
    expect(Open3).not_to receive(:capture3)

    Tempfile.create([ "upload", ".pdf" ], binmode: true) do |f|
      f.write("%PDF-1.4\n")
      f.truncate(FingerprintDecoder::MAX_UPLOAD_BYTES + 1)
      f.rewind

      sign_in admin
      post "/antesis-admin/fingerprint", params: {
        file: Rack::Test::UploadedFile.new(f.path, "application/pdf")
      }
    end

    expect(response).to have_http_status(:ok)
    expect(inertia_props(response)["error"]).to match(/too large/)
  end

  it "rejects a file whose content doesn't match its claimed type, never reaching convert" do
    expect(Open3).not_to receive(:capture3)

    Tempfile.create([ "upload", ".png" ], binmode: true) do |f|
      f.write("this is not actually a png")
      f.rewind

      sign_in admin
      post "/antesis-admin/fingerprint", params: {
        file: Rack::Test::UploadedFile.new(f.path, "image/png")
      }
    end

    expect(response).to have_http_status(:ok)
    expect(inertia_props(response)["error"]).to match(/Unrecognized file format/)
  end
end
