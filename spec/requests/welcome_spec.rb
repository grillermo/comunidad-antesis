require "rails_helper"

RSpec.describe "Welcome", type: :request do
  describe "GET /" do
    it "renders the Inertia welcome page" do
      get "/"

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("comunidad-antesis Inertia")
    end
  end
end
