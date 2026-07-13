require "vcr"

VCR.configure do |config|
  config.cassette_library_dir = "spec/cassettes"
  config.hook_into :webmock
  config.configure_rspec_metadata!

  # Never record the real API token into a cassette.
  config.filter_sensitive_data("<MAILERLITE_API_TOKEN>") do
    ENV["MAILERLITE_API_TOKEN"]
  end
  config.filter_sensitive_data("<MAILERLITE_API_TOKEN>") do
    "Bearer #{ENV['MAILERLITE_API_TOKEN']}"
  end

  # Fail loudly on unexpected HTTP instead of silently hitting the network.
  config.default_cassette_options = { record: :once }
end
