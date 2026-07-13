require "securerandom"

class HealthController < ApplicationController
  def show
    checks = {
      "database" => check_database,
      "cache" => check_cache
    }

    ok = checks.values.all? { |value| value == "ok" }
    status = ok ? :ok : :service_unavailable
    overall = ok ? "ok" : "error"

    # `port` lets the deploy script (./serve) verify it reached the slot it
    # expects (blue vs green) and not a stale pane still bound elsewhere.
    render json: { status: overall, port: request.port, checks: checks }, status: status
  end

  private

  def check_database
    ActiveRecord::Base.connection.execute("SELECT 1")
    "ok"
  rescue StandardError
    "error"
  end

  def check_cache
    key = "health_check_#{SecureRandom.hex(4)}"
    Rails.cache.write(key, "ok", expires_in: 5.seconds)
    Rails.cache.read(key) == "ok" ? "ok" : "error"
  rescue StandardError
    "error"
  ensure
    Rails.cache.delete(key) if key
  end
end
