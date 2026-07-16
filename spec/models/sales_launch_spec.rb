require "rails_helper"

RSpec.describe SalesLaunch do
  it "is not live before August 15, 2026" do
    travel_to Date.new(2026, 8, 14) do
      expect(SalesLaunch.live?).to be(false)
    end
  end

  it "is live on August 15, 2026" do
    travel_to Date.new(2026, 8, 15) do
      expect(SalesLaunch.live?).to be(true)
    end
  end

  it "is live after August 15, 2026" do
    travel_to Date.new(2027, 1, 1) do
      expect(SalesLaunch.live?).to be(true)
    end
  end
end
