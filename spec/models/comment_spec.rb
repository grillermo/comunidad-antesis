require "rails_helper"

RSpec.describe Comment, type: :model do
  it "is valid with a known section path, author, and body" do
    expect(build(:comment)).to be_valid
  end

  it "rejects an unknown section path" do
    comment = build(:comment, section_path: "no/existe")
    expect(comment).not_to be_valid
    expect(comment.errors[:section_path]).to be_present
  end

  it "requires a body" do
    expect(build(:comment, body: nil)).not_to be_valid
  end

  it "nests replies with ancestry" do
    parent = create(:comment)
    reply = create(:comment, parent: parent)

    expect(reply.parent).to eq(parent)
    expect(parent.children).to include(reply)
  end
end
