# Thin client over the MailerLite Connect API (https://connect.mailerlite.com).
# Upserts newsletter subscribers and assigns them to a named group.
class MailerLite
  BASE_URL = "https://connect.mailerlite.com/api".freeze
  GROUP_CACHE_TTL = 1.hour

  class Error < StandardError; end

  # Upserts a subscriber by email and adds them to +group_name+.
  # POST /subscribers is idempotent on email: it creates or updates.
  def self.upsert_subscriber(email:, group_name:, fields: {})
    new.upsert_subscriber(email:, group_name:, fields:)
  end

  def upsert_subscriber(email:, group_name:, fields: {})
    group_id = find_or_create_group(group_name)

    body = { email: email, groups: [ group_id ] }
    body[:fields] = fields if fields.present?

    post("/subscribers", body)
  end

  # Resolves a group id by name, creating the group if it doesn't exist.
  def find_or_create_group(name)
    Rails.cache.fetch("mailerlite:group:#{name}", expires_in: GROUP_CACHE_TTL) do
      existing_group_id(name) || create_group(name)
    end
  end

  private

  def existing_group_id(name)
    data = get("/groups", params: { "filter[name]" => name }).fetch("data", [])
    data.find { |g| g["name"] == name }&.fetch("id")
  end

  def create_group(name)
    get_or_dig(post("/groups", { name: name }), "data", "id")
  end

  def get_or_dig(response, *keys)
    response.dig(*keys) or raise Error, "Unexpected MailerLite response: #{response.inspect}"
  end

  def get(path, params: {})
    parse client.get("#{BASE_URL}#{path}", params: params)
  end

  def post(path, body)
    parse client.post("#{BASE_URL}#{path}", json: body)
  end

  def parse(response)
    unless response.status.success?
      raise Error, "MailerLite #{response.status}: #{response.body}"
    end

    response.parse
  rescue HTTP::Error => e
    raise Error, "MailerLite request failed: #{e.message}"
  end

  def client
    token = ENV.fetch("MAILERLITE_API_TOKEN")

    HTTP
      .auth("Bearer #{token}")
      .headers(accept: "application/json", content_type: "application/json")
      .timeout(10)
  end
end
