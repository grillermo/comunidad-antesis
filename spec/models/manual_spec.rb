# spec/models/manual_spec.rb
require "rails_helper"

RSpec.describe Manual do
  describe ".paths" do
    it "yields one path per node, 87 nodes total" do
      expect(Manual.paths.size).to eq(87)
    end

    it "builds ancestry paths from slugs" do
      expect(Manual.paths).to include(%w[el-origen-del-color introduccion])
      expect(Manual.paths).to include(
        %w[color-sobre-fibra modificadores-y-tratamientos-de-color acido-tanico receta-de-pretratamiento-con-taninos]
      )
    end

    it "includes the standalone leaf parts" do
      expect(Manual.paths).to include(%w[epilogo])
      expect(Manual.paths).to include(%w[glosario])
      expect(Manual.paths).to include(%w[atlas-del-color])
    end
  end

  describe ".find" do
    it "returns the node at an exact path" do
      expect(Manual.find(%w[el-origen-del-color introduccion])[:title]).to eq("Introducción")
    end

    it "returns nil for an unknown path" do
      expect(Manual.find(%w[el-origen-del-color nope])).to be_nil
    end
  end

  describe ".path?" do
    it "is true for every enumerated path and false otherwise" do
      expect(Manual.path?(%w[glosario])).to be(true)
      expect(Manual.path?(%w[glosario extra])).to be(false)
      expect(Manual.path?(%w[does-not-exist])).to be(false)
    end
  end

  describe ".url_for" do
    it "builds the URL for a valid slash-joined path string" do
      expect(Manual.url_for("el-origen-del-color/introduccion"))
        .to eq("/manual-del-color-vivo/el-origen-del-color/introduccion")
    end

    it "builds the URL for a valid segment array" do
      expect(Manual.url_for(%w[glosario])).to eq("/manual-del-color-vivo/glosario")
    end

    it "returns nil for an unknown, blank, or nil path" do
      expect(Manual.url_for("does-not-exist")).to be_nil
      expect(Manual.url_for("")).to be_nil
      expect(Manual.url_for(nil)).to be_nil
    end
  end

  describe "GLOSSARY_PATH" do
    it "points at the glossary route" do
      expect(Manual::GLOSSARY_PATH).to eq(Manual.url_for(%w[glosario]))
    end
  end
end
