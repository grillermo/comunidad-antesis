require "rails_helper"

RSpec.describe FingerprintDecoder do
  let(:user) { User.create!(email: "buyer@example.com", password: Devise.friendly_token) }

  def uploaded_pdf(bytes)
    Tempfile.create([ "upload", ".pdf" ], binmode: true) do |f|
      f.write(bytes)
      f.rewind
      yield ActionDispatch::Http::UploadedFile.new(tempfile: f, filename: "upload.pdf", type: "application/pdf")
    end
  end

  it "decodes a stamped PDF back to the buyer" do
    pdf_bytes = ManualPdfStamper.new(email: user.email).call

    uploaded_pdf(pdf_bytes) do |file|
      result = described_class.new(file).call

      expect(result).not_to be_nil
      expect(result.user).to eq(user)
    end
  end

  it "returns nil for a PDF with no fingerprint (no matching User)" do
    pdf_bytes = ManualPdfStamper.new(email: "ghost@example.com").call

    uploaded_pdf(pdf_bytes) do |file|
      expect(described_class.new(file).call).to be_nil
    end
  end
end
