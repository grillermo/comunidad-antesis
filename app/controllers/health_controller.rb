require "securerandom"
require "socket"

class HealthController < ApplicationController
  def show
    check_database
    check_queue
    check_cache

    render json: { status: "ok" }
  rescue StandardError => error
    render json: { status: "error", error: error.message }, status: :service_unavailable
  end

  private

  def check_database
    ActiveRecord::Base.connection.execute("SELECT 1")
  end

  def check_queue
    SolidQueue::Process.create!(
      kind: "Worker",
      name: "health-check-#{SecureRandom.hex(4)}",
      last_heartbeat_at: Time.current,
      pid: Process.pid,
      hostname: Socket.gethostname
    ).destroy!
  end

  def check_cache
    key = "health_check_#{SecureRandom.hex(4)}"

    Rails.cache.write(key, "ok", expires_in: 5.seconds)
    raise "cache unavailable" unless Rails.cache.read(key) == "ok"
  ensure
    Rails.cache.delete(key) if key
  end
end
