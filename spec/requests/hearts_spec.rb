require "rails_helper"

RSpec.describe "Hearts", type: :request do
  let(:section) { "el-origen-del-color/introduccion" }
  let(:author) { create(:user) }
  let(:user) { create(:user) }
  let!(:comment) { create(:comment, section_path: section, user: author, body: "hi") }

  it "requires authentication" do
    post "/comments/#{comment.id}/heart"

    expect(response).to have_http_status(:found)
  end

  it "adds a heart on first click and removes it on second" do
    sign_in user

    expect { post "/comments/#{comment.id}/heart" }
      .to change { comment.reload.hearts_count }.from(0).to(1)
    expect { post "/comments/#{comment.id}/heart" }
      .to change { comment.reload.hearts_count }.from(1).to(0)
  end

  it "does not heart a deleted comment" do
    comment.soft_delete!
    sign_in user

    post "/comments/#{comment.id}/heart"

    expect(comment.reload.hearts_count).to eq(0)
  end
end
