require "rails_helper"

RSpec.describe "Health", type: :request do
  describe "GET /health" do
    it "returns ok with every check passing when all dependencies are healthy" do
      get "/health"

      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body.fetch("status")).to eq("ok")
      expect(body.fetch("port")).to eq(request.port)
      expect(body.fetch("checks")).to eq(
        "database" => "ok",
        "cache" => "ok"
      )
    end

    it "returns service unavailable with database error when the database check fails" do
      allow(ActiveRecord::Base.connection).to receive(:execute).and_raise(
        ActiveRecord::ConnectionNotEstablished, "no connection"
      )

      get "/health"

      expect(response).to have_http_status(:service_unavailable)
      body = response.parsed_body
      expect(body.fetch("status")).to eq("error")
      expect(body.dig("checks", "database")).to eq("error")
    end

    it "returns service unavailable with cache error when the cache check fails" do
      allow(Rails.cache).to receive(:write).and_raise(StandardError, "cache unavailable")

      get "/health"

      expect(response).to have_http_status(:service_unavailable)
      body = response.parsed_body
      expect(body.fetch("status")).to eq("error")
      expect(body.dig("checks", "cache")).to eq("error")
    end
  end
end
