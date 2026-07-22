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

  it "has comments, hearts, and comment subscriptions" do
    user = create(:user)
    comment = create(:comment, user: user)

    expect(user.comments).to include(comment)
    expect(user).to respond_to(:hearts)
    expect(user).to respond_to(:comment_subscriptions)
  end

  describe "fingerprint_code" do
    it "is assigned on create" do
      user = User.create!(email: "reader@example.com", password: Devise.friendly_token)
      expect(user.fingerprint_code).to be_a(Integer)
      expect(user.fingerprint_code).to be_between(1, 2**32 - 1)
    end

    it "is unique" do
      allow(SecureRandom).to receive(:random_number).with(2**32 - 1).and_return(41, 41, 42)
      existing = User.create!(email: "first@example.com", password: Devise.friendly_token)
      new_user = User.create!(email: "second@example.com", password: Devise.friendly_token)

      expect(new_user.fingerprint_code).not_to eq(existing.fingerprint_code)
    end
  end
end
