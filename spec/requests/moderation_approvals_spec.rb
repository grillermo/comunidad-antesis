require "rails_helper"

RSpec.describe "Moderation approvals", type: :request do
  let(:comment) { create(:comment) }

  def token(comment, expires_in: 7.days) = comment.signed_id(purpose: :approve, expires_in: expires_in)

  it "approves via a valid signed token without login" do
    get "/moderation/comments/approve/#{token(comment)}"

    expect(response).to have_http_status(:ok)
    expect(comment.reload.approved).to be(true)
  end

  it "rejects a tampered token" do
    get "/moderation/comments/approve/not-a-real-token"

    expect(response).to have_http_status(:not_found)
    expect(response.body).to include("Enlace de aprobación inválido")
  end

  it "rejects an expired token" do
    expired_token = token(comment, expires_in: -1.second)

    get "/moderation/comments/approve/#{expired_token}"

    expect(response).to have_http_status(:not_found)
    expect(comment.reload.approved).to be(false)
  end
end
