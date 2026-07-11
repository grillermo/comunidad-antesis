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

  it "caches sanitized body_html on save" do
    comment = create(:comment, body: "**hi**")

    expect(comment.body_html).to include("<strong>hi</strong>")
  end

  describe "soft delete" do
    it "marks deleted, hides body, and keeps replies" do
      parent = create(:comment)
      reply = create(:comment, parent: parent)

      parent.soft_delete!

      expect(parent.reload.deleted?).to be(true)
      expect(parent.display_body_html).to eq("<p>[eliminado]</p>")
      expect(parent.children).to include(reply)
    end

    it "reports not-deleted comments as active" do
      comment = create(:comment)

      expect(comment.deleted?).to be(false)
      expect(comment.display_body_html).to eq(comment.body_html)
    end
  end

  it "only allows sticky on root comments" do
    parent = create(:comment)

    expect(build(:comment, parent: parent, sticky: true)).not_to be_valid
  end

  it "rejects deleted and cross-section parents" do
    deleted_parent = create(:comment)
    deleted_parent.soft_delete!
    expect(build(:comment, parent: deleted_parent)).not_to be_valid

    other_parent = create(:comment, section_path: "color-sobre-fibra/guia-de-lavado")
    expect(build(:comment, parent: other_parent)).not_to be_valid
  end
end
