require "rails_helper"

RSpec.describe PdfMarker, type: :model do
  it "is valid with a page in range and fractional coordinates" do
    expect(build(:pdf_marker)).to be_valid
  end

  it "rejects a missing page" do
    expect(build(:pdf_marker, page: nil)).not_to be_valid
  end

  it "rejects page 0" do
    expect(build(:pdf_marker, page: 0)).not_to be_valid
  end

  it "rejects a page beyond the manual's last page" do
    expect(build(:pdf_marker, page: ManualPdfPages::PAGE_COUNT + 1)).not_to be_valid
  end

  it "accepts the boundary coordinates 0 and 1" do
    expect(build(:pdf_marker, x: 0, y: 1)).to be_valid
  end

  it "rejects coordinates below 0" do
    expect(build(:pdf_marker, x: -0.1)).not_to be_valid
  end

  it "rejects coordinates above 1" do
    expect(build(:pdf_marker, y: 1.1)).not_to be_valid
  end
end
