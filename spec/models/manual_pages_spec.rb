require "rails_helper"

RSpec.describe "Manual page files" do
  it "has a React page file for every node path" do
    root = Rails.root.join("app/frontend/pages/manual-del-color-vivo")
    missing = Manual.paths.reject { |path| root.join("#{path.join('/')}.jsx").exist? }
    expect(missing).to be_empty, "missing page files for: #{missing.map { |p| p.join('/') }.join(', ')}"
  end
end
