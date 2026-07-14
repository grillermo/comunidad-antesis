require "rails_helper"

RSpec.describe "GeneratedPdfs", type: :request do
  let(:user) { create(:user) }

  it "requires authentication" do
    get "/generate-pdf"

    expect(response).to have_http_status(:found)
    expect(response).to redirect_to(new_user_session_path)
  end

  it "sends the stamped manual as a PDF download" do
    sign_in user

    get "/generate-pdf"

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq("application/pdf")
    expect(response.headers["Content-Disposition"]).to include('attachment; filename="manual-del-color-vivo.pdf"')
    expect(response.body).to start_with("%PDF")
  end

  it "responds 503 when stamping fails" do
    sign_in user
    allow(ManualPdfStamper).to receive(:new).and_raise(ManualPdfStamper::Error, "boom")

    get "/generate-pdf"

    expect(response).to have_http_status(:service_unavailable)
  end
end
