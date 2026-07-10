require "rails_helper"

RSpec.describe "Landing", type: :request do
  it "renders the landing page" do
    get "/"
    expect(response).to have_http_status(:ok)
  end
end
