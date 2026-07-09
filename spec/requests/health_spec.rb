require "rails_helper"

RSpec.describe "Health", type: :request do
  describe "GET /health" do
    it "returns ok when database, queue, and cache checks pass" do
      get "/health"

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.fetch("status")).to eq("ok")
    end

    it "returns service unavailable when the database check fails" do
      allow(ActiveRecord::Base).to receive(:connection).and_raise(ActiveRecord::ConnectionNotEstablished)

      get "/health"

      expect(response).to have_http_status(:service_unavailable)
      expect(response.parsed_body.fetch("status")).to eq("error")
    end

    it "returns service unavailable when the queue check fails" do
      allow(SolidQueue::Process).to receive(:create!).and_raise(StandardError, "queue unavailable")

      get "/health"

      expect(response).to have_http_status(:service_unavailable)
      expect(response.parsed_body.fetch("status")).to eq("error")
    end

    it "returns service unavailable when the cache check fails" do
      allow(Rails.cache).to receive(:write).and_raise(StandardError, "cache unavailable")

      get "/health"

      expect(response).to have_http_status(:service_unavailable)
      expect(response.parsed_body.fetch("status")).to eq("error")
    end
  end
end
