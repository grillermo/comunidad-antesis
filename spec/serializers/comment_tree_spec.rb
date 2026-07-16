require "rails_helper"

RSpec.describe CommentTree do
  let(:section) { "el-origen-del-color/introduccion" }
  let(:author) { create(:user) }
  let(:admin) { create(:user, :admin) }
  let(:viewer) { create(:user) }

  it "returns roots sorted by sticky then hearts then newest, replies chronological" do
    low = create(:comment, section_path: section, user: author, body: "low")
    high = create(:comment, section_path: section, user: author, body: "high")
    create(:heart, user: viewer, comment: high)
    pinned = create(:comment, section_path: section, user: author, body: "pin", sticky: true)
    reply_a = create(:comment, section_path: section, user: author, body: "r1", parent: low)
    reply_b = create(:comment, section_path: section, user: author, body: "r2", parent: low)

    tree = described_class.new(section_path: section, current_user: viewer).as_json

    expect(tree.map { |node| node[:id] }).to eq([ pinned.id, high.id, low.id ])
    low_node = tree.find { |node| node[:id] == low.id }
    expect(low_node[:replies].map { |node| node[:id] }).to eq([ reply_a.id, reply_b.id ])
  end

  it "exposes permission flags and heart state per viewer" do
    comment = create(:comment, section_path: section, user: author)
    create(:heart, user: viewer, comment: comment)

    as_viewer = described_class.new(section_path: section, current_user: viewer).as_json.first
    expect(as_viewer[:hearted]).to be(true)
    expect(as_viewer[:can_edit]).to be(false)
    expect(as_viewer[:can_delete]).to be(false)
    expect(as_viewer[:body]).to be_nil

    as_author = described_class.new(section_path: section, current_user: author).as_json.first
    expect(as_author[:can_edit]).to be(true)
    expect(as_author[:can_delete]).to be(true)
    expect(as_author[:body]).to eq(comment.body)

    as_admin = described_class.new(section_path: section, current_user: admin).as_json.first
    expect(as_admin[:can_delete]).to be(true)
    expect(as_admin[:can_moderate]).to be(true)
  end

  it "renders tombstones for deleted comments" do
    comment = create(:comment, section_path: section, user: author, body: "secret")
    comment.soft_delete!

    node = described_class.new(section_path: section, current_user: viewer).as_json.first

    expect(node[:body_html]).to eq("<p>[eliminado]</p>")
    expect(node[:deleted]).to be(true)
  end
end
