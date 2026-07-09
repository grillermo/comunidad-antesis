require "rails_helper"

RSpec.describe "Health", type: :request do
  describe "GET /health" do
    # Register a Solid Queue worker row so the queue check reports "ok".
    # No worker runs during the test suite, so it must be seeded explicitly.
    def register_worker
      SolidQueue::Process.create!(
        kind: "Worker",
        name: "health-check-#{SecureRandom.hex(4)}",
        last_heartbeat_at: Time.current,
        pid: Process.pid,
        hostname: "test-host"
      )
    end

    it "returns ok with every check passing when all dependencies are healthy" do
      register_worker

      get "/health"

      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body.fetch("status")).to eq("ok")
      expect(body.fetch("checks")).to eq(
        "database" => "ok",
        "queue" => "ok",
        "cache" => "ok"
      )
    end

    it "returns service unavailable with database error when the database check fails" do
      register_worker
      allow(ActiveRecord::Base.connection).to receive(:execute).and_raise(
        ActiveRecord::ConnectionNotEstablished, "no connection"
      )

      get "/health"

      expect(response).to have_http_status(:service_unavailable)
      body = response.parsed_body
      expect(body.fetch("status")).to eq("error")
      expect(body.dig("checks", "database")).to eq("error")
    end

    it "returns service unavailable with queue error when no worker is registered" do
      get "/health"

      expect(response).to have_http_status(:service_unavailable)
      body = response.parsed_body
      expect(body.fetch("status")).to eq("error")
      expect(body.dig("checks", "queue")).to eq("error")
    end

    it "returns service unavailable with cache error when the cache check fails" do
      register_worker
      allow(Rails.cache).to receive(:write).and_raise(StandardError, "cache unavailable")

      get "/health"

      expect(response).to have_http_status(:service_unavailable)
      body = response.parsed_body
      expect(body.fetch("status")).to eq("error")
      expect(body.dig("checks", "cache")).to eq("error")
    end
  end
end
