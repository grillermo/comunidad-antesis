require "rails_helper"

RSpec.describe Heart, type: :model do
  let(:comment) { create(:comment) }

  it "increments hearts_count on the comment" do
    expect { create(:heart, comment: comment) }
      .to change { comment.reload.hearts_count }.from(0).to(1)
  end

  it "enforces one heart per user per comment" do
    user = create(:user)
    create(:heart, user: user, comment: comment)
    duplicate = build(:heart, user: user, comment: comment)

    expect(duplicate).not_to be_valid
  end

  it "decrements when removed" do
    heart = create(:heart, comment: comment)

    expect { heart.destroy }.to change { comment.reload.hearts_count }.from(1).to(0)
  end
end
