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
end
