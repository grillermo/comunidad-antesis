require "securerandom"

class HealthController < ApplicationController
  def show
    checks = {
      "database" => check_database,
      "queue" => check_queue,
      "cache" => check_cache
    }

    ok = checks.values.all? { |value| value == "ok" }
    status = ok ? :ok : :service_unavailable
    overall = ok ? "ok" : "error"

    render json: { status: overall, checks: checks }, status: status
  end

  private

  def check_database
    ActiveRecord::Base.connection.execute("SELECT 1")
    "ok"
  rescue StandardError
    "error"
  end

  # Confirms a Solid Queue worker process is registered and alive, not merely
  # that the schema is migrated (the database check already covers that).
  def check_queue
    SolidQueue::Process.exists? ? "ok" : "error"
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
