require "rails_helper"

RSpec.describe Manual::TextMatch do
  describe ".normalize" do
    it "strips accents, downcases, collapses whitespace, drops punctuation" do
      expect(described_class.normalize("  Ácido   Tánico! ")).to eq("acido tanico")
    end

    it "returns an empty string for nil" do
      expect(described_class.normalize(nil)).to eq("")
    end
  end

  describe ".distance" do
    it "is zero for identical strings" do
      expect(described_class.distance("gouache", "gouache")).to eq(0)
    end

    it "counts single-character edits" do
      expect(described_class.distance("gises", "gisos")).to eq(1)
      expect(described_class.distance("tempera", "tenpora")).to eq(2)
    end

    it "handles insertions and deletions" do
      expect(described_class.distance("velas", "vela")).to eq(1)
      expect(described_class.distance("", "abc")).to eq(3)
    end
  end

  describe ".within?" do
    it "is true when normalized distance is at or below the threshold" do
      expect(described_class.within?("Ácido tánico", "acido tanica", 2)).to be(true)
    end

    it "is false when normalized distance exceeds the threshold" do
      expect(described_class.within?("gouache", "pasteles", 2)).to be(false)
    end
  end
end
