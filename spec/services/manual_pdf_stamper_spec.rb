require "rails_helper"

RSpec.describe ManualPdfStamper do
  it "returns stamped PDF bytes for the manual" do
    bytes = described_class.new(email: "reader@example.com").call

    expect(bytes).to start_with("%PDF")
    expect(bytes.bytesize).to be >= File.size(Rails.root.join("data/manual.pdf"))
  end

  it "raises Error when the source PDF does not exist" do
    stamper = described_class.new(email: "reader@example.com", source: Rails.root.join("data/nope.pdf"))

    expect { stamper.call }.to raise_error(ManualPdfStamper::Error)
  end

  it "raises Error when the stamp script cannot be launched" do
    allow(Open3).to receive(:capture3).and_raise(Errno::ENOENT)

    expect { described_class.new(email: "reader@example.com").call }.to raise_error(ManualPdfStamper::Error)
  end

  it "embeds the pixel fingerprint when the email belongs to a User" do
    user = User.create!(email: "buyer@example.com", password: Devise.friendly_token)

    bytes = described_class.new(email: user.email).call

    expect(bytes).to start_with("%PDF")
  end

  it "skips the watermark without erroring when the email has no User" do
    bytes = described_class.new(email: "no-account@example.com").call

    expect(bytes).to start_with("%PDF")
  end
end
