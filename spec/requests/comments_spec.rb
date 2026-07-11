require "rails_helper"

RSpec.describe "Comments", type: :request do
  let(:section) { "el-origen-del-color/introduccion" }
  let(:section_url) { "/manual-del-color-vivo/#{section}" }
  let(:user) { create(:user) }

  describe "POST /comments" do
    it "requires authentication" do
      post "/comments", params: { comment: { section_path: section, body: "hi" } }

      expect(response).to have_http_status(:found)
      expect(response.location).to include("/users/sign_in")
    end

    it "creates a comment and redirects back to the section" do
      sign_in user

      expect {
        post "/comments", params: { comment: { section_path: section, body: "**hola**" } }
      }.to change(Comment, :count).by(1)

      expect(response).to redirect_to(section_url)
      expect(Comment.last.body_html).to include("<strong>hola</strong>")
    end

    it "creates a subscription when subscribe is set" do
      sign_in user

      expect {
        post "/comments", params: {
          comment: { section_path: section, body: "hi" },
          subscribe: "1"
        }
      }.to change(CommentSubscription, :count).by(1)
    end

    it "rejects an unknown section" do
      sign_in user

      post "/comments", params: { comment: { section_path: "no/existe", body: "hi" } }

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "rejects replies to deleted or cross-section parents" do
      sign_in user
      deleted_parent = create(:comment, section_path: section)
      deleted_parent.soft_delete!

      post "/comments", params: {
        comment: { section_path: section, body: "hi", parent_id: deleted_parent.id }
      }
      expect(response).to have_http_status(:unprocessable_content)

      other_parent = create(:comment, section_path: "color-sobre-fibra/guia-de-lavado")
      post "/comments", params: {
        comment: { section_path: section, body: "hi", parent_id: other_parent.id }
      }
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "enqueues admin notification for the new comment" do
      pending "CommentMailer is introduced in Task 15"
      sign_in user

      expect {
        post "/comments", params: { comment: { section_path: section, body: "hi" } }
      }.to have_enqueued_mail(CommentMailer, :admin_notification)
    end
  end

  describe "PATCH /comments/:id" do
    let(:other) { create(:user) }
    let(:admin) { create(:user, :admin) }
    let!(:comment) { create(:comment, section_path: section, user: user, body: "orig") }

    it "lets the author edit and re-renders body_html" do
      sign_in user

      patch "/comments/#{comment.id}", params: { comment: { body: "**new**" } }

      expect(comment.reload.body).to eq("**new**")
      expect(comment.body_html).to include("<strong>new</strong>")
    end

    it "lets an admin edit any comment" do
      sign_in admin

      patch "/comments/#{comment.id}", params: { comment: { body: "mod" } }

      expect(comment.reload.body).to eq("mod")
    end

    it "forbids a non-author non-admin" do
      sign_in other

      patch "/comments/#{comment.id}", params: { comment: { body: "hack" } }

      expect(response).to have_http_status(:forbidden)
      expect(comment.reload.body).to eq("orig")
    end
  end
end
