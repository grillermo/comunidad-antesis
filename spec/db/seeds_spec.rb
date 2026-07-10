require "rails_helper"
require "stringio"

RSpec.describe "Database seeds" do
  around do |example|
    original_email = ENV["ADMIN_EMAIL"]
    original_password = ENV["ADMIN_PASSWORD"]

    example.run
  ensure
    original_email.nil? ? ENV.delete("ADMIN_EMAIL") : ENV["ADMIN_EMAIL"] = original_email
    original_password.nil? ? ENV.delete("ADMIN_PASSWORD") : ENV["ADMIN_PASSWORD"] = original_password
  end

  def load_seeds
    original_stdout = $stdout
    $stdout = StringIO.new
    load Rails.root.join("db/seeds.rb")
  ensure
    $stdout = original_stdout
  end

  it "creates one normalized admin across mixed-case seed loads without resetting its password" do
    ENV["ADMIN_EMAIL"] = "  Mixed.Admin@Example.COM  "
    ENV["ADMIN_PASSWORD"] = "initial-seed-password"
    load_seeds

    ENV["ADMIN_EMAIL"] = "MIXED.ADMIN@example.com"
    ENV["ADMIN_PASSWORD"] = "replacement-seed-password"
    load_seeds

    admins = User.where(email: "mixed.admin@example.com")

    expect(admins.count).to eq(1)
    expect(admins.first).to be_admin
    expect(admins.first).to be_valid_password("initial-seed-password")
    expect(admins.first).not_to be_valid_password("replacement-seed-password")
  end

  it "raises when the normalized email belongs to a non-admin and preserves its role" do
    commenter = User.create!(
      email: "collision@example.com",
      password: "commenter-password",
      role: :commenter
    )
    ENV["ADMIN_EMAIL"] = "  Collision@Example.COM  "
    ENV["ADMIN_PASSWORD"] = "seed-password"

    expect { load_seeds }.to raise_error(
      RuntimeError,
      "Cannot seed admin collision@example.com: email belongs to a non-admin user"
    )
    expect(commenter.reload).to be_commenter
  end
end
