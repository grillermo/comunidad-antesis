require "rails_helper"

RSpec.describe User, type: :model do
  it "defaults new users to the commenter role" do
    user = User.create!(email: "c@example.com", password: "password123")
    expect(user.role).to eq("commenter")
    expect(user.commenter?).to be(true)
    expect(user.admin?).to be(false)
  end

  it "supports the admin role and its predicate" do
    user = User.create!(email: "a@example.com", password: "password123", role: :admin)
    expect(user.admin?).to be(true)
  end

  it "requires a valid, unique email" do
    User.create!(email: "dup@example.com", password: "password123")
    dup = User.new(email: "dup@example.com", password: "password123")
    expect(dup).not_to be_valid
    expect(dup.errors[:email]).to be_present
  end

  it "requires a password" do
    user = User.new(email: "nopass@example.com")
    expect(user).not_to be_valid
    expect(user.errors[:password]).to be_present
  end

  it "falls back to generic English validation error messages" do
    expect { User.create!(email: "invalid@example.com") }
      .to raise_error(ActiveRecord::RecordInvalid, /Validation failed/)
  end
end
