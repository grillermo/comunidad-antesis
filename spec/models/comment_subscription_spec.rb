require "rails_helper"

RSpec.describe CommentSubscription, type: :model do
  let(:user) { create(:user) }
  let(:comment) { create(:comment) }

  it "is valid for a user + comment" do
    expect(build(:comment_subscription, user: user, comment: comment)).to be_valid
  end

  it "is unique per user + comment" do
    create(:comment_subscription, user: user, comment: comment)

    expect(build(:comment_subscription, user: user, comment: comment)).not_to be_valid
  end
end
