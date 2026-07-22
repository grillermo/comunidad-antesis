require "rails_helper"

RSpec.describe "watermark codec round-trip" do
  it "recovers the exact code through buildFrame/decodeFrame" do
    stdout, stderr, status = Open3.capture3(
      Rails.root.join("node_modules/.bin/tsx").to_s,
      Rails.root.join("scripts/watermark-selftest.ts").to_s,
      "3735928559"
    )

    expect(status).to be_success, stderr
    expect(JSON.parse(stdout)["code"]).to eq(3735928559)
  end

  it "fails CRC on a garbage code" do
    _stdout, _stderr, status = Open3.capture3(
      Rails.root.join("node_modules/.bin/tsx").to_s,
      Rails.root.join("scripts/watermark-selftest.ts").to_s,
      "0"
    )

    expect(status).not_to be_success
  end
end
