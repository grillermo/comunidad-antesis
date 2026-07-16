require "rails_helper"

RSpec.describe CommentMailer, type: :mailer do
  let(:section) { "el-origen-del-color/introduccion" }
  let(:author) { create(:user) }
  let!(:admin) { create(:user, :admin, email: "admin@example.com") }
  let(:subscriber) { create(:user, email: "sub@example.com") }

  it "admin_notification goes to all admins with a working signed approve link" do
    comment = create(:comment, section_path: section, user: author)
    mail = described_class.admin_notification(comment)

    expect(mail.to).to include("admin@example.com")
    token = mail.body.encoded[%r{/moderation/comments/approve/([^"'\s]+)}, 1]
    expect(Comment.find_signed(token, purpose: :approve)).to eq(comment)
  end

  it "reply_notification targets the subscriber" do
    parent = create(:comment, section_path: section, user: subscriber, body: "raiz")
    reply = create(:comment, section_path: section, user: author, body: "resp", parent: parent)
    mail = described_class.reply_notification(reply, subscriber)

    expect(mail.to).to eq([ "sub@example.com" ])
    expect(mail.body.encoded).to include("resp")
  end
end
