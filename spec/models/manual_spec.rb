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

  describe ".pdf_page_range" do
    let(:map) do
      {
        "el-origen-del-color/introduccion" => [5, 6],
        "glosario" => [130, 136],
      }
    end

    it "returns [start, end] for a mapped component path" do
      expect(Manual.pdf_page_range("el-origen-del-color/introduccion", map: map)).to eq([5, 6])
    end

    it "returns nil for an unmapped path" do
      expect(Manual.pdf_page_range("does/not/exist", map: map)).to be_nil
    end

    it "returns nil for a blank component (e.g. the index action)" do
      expect(Manual.pdf_page_range(nil, map: map)).to be_nil
      expect(Manual.pdf_page_range("", map: map)).to be_nil
    end
  end
end
