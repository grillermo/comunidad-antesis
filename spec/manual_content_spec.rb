require "rails_helper"

RSpec.describe "Manual content completeness" do
  pages_dir = Rails.root.join("app/frontend/pages/manual-del-color-vivo")

  it "has replaced every placeholder body with real content" do
    offenders = Dir.glob(pages_dir.join("**/*.jsx")).select do |path|
      File.read(path).include?("Contenido próximamente")
    end

    expect(offenders).to be_empty,
      "Pages still holding placeholder text:\n#{offenders.join("\n")}"
  end
end
