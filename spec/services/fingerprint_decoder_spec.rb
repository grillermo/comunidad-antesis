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

  it "rejects an oversized upload before touching pdftoppm/convert" do
    expect(Open3).not_to receive(:capture3)

    Tempfile.create([ "upload", ".pdf" ], binmode: true) do |f|
      f.write("%PDF-1.4\n")
      f.truncate(described_class::MAX_UPLOAD_BYTES + 1)
      f.rewind
      file = ActionDispatch::Http::UploadedFile.new(tempfile: f, filename: "big.pdf", type: "application/pdf")

      expect { described_class.new(file).call }.to raise_error(described_class::Error, /too large/)
    end
  end

  it "rejects a file claiming to be a PDF whose content isn't actually a PDF" do
    expect(Open3).not_to receive(:capture3)

    Tempfile.create([ "upload", ".pdf" ], binmode: true) do |f|
      f.write("plain text, not a real pdf")
      f.rewind
      file = ActionDispatch::Http::UploadedFile.new(tempfile: f, filename: "fake.pdf", type: "application/pdf")

      expect { described_class.new(file).call }.to raise_error(described_class::Error, /Unrecognized file format/)
    end
  end

  it "rejects a file claiming to be a PNG whose content isn't actually a PNG" do
    expect(Open3).not_to receive(:capture3)

    Tempfile.create([ "upload", ".png" ], binmode: true) do |f|
      f.write("this is not actually a png")
      f.rewind
      file = ActionDispatch::Http::UploadedFile.new(tempfile: f, filename: "fake.png", type: "image/png")

      expect { described_class.new(file).call }.to raise_error(described_class::Error, /Unrecognized file format/)
    end
  end
end
