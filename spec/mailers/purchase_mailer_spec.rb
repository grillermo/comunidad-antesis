require "rails_helper"
require "open3"

RSpec.describe PurchaseMailer do
  let(:purchase) { create(:purchase, email: "buyer@example.com") }
  let(:pdf) { "%PDF-1.4\n\x00\xFFbinary".b }
  let(:mail) { described_class.fulfillment(purchase, pdf) }

  around do |example|
    original_options = ActionMailer::Base.default_url_options
    ActionMailer::Base.default_url_options = { host: "app.example.test", protocol: "https" }
    example.run
  ensure
    ActionMailer::Base.default_url_options = original_options
  end

  it "is addressed to the buyer" do
    expect(mail.to).to eq([ "buyer@example.com" ])
    expect(mail.subject).to eq("Tu Manual del Color Vivo")
  end

  it "attaches the stamped PDF" do
    attachment = mail.attachments["manual-del-color-vivo.pdf"]
    expect(attachment).to be_present
    expect(attachment.mime_type).to eq("application/pdf")
    expect(attachment.body.decoded).to eq(pdf)
  end

  it "includes a tokenized login link to the web manual" do
    html = mail.html_part.body.to_s
    token = html[%r{/acceso/([^"]+)}, 1]

    expect(html).to include("https://app.example.test/acceso/")
    expect(mail.text_part.body.to_s).to include("https://app.example.test/acceso/")
    expect(token).to be_present
    expect(User.find_signed!(CGI.unescape(token), purpose: :purchase_login)).to eq(purchase.user)
  end

  it "keeps the login token valid until its two-day expiry boundary" do
    issued_at = Time.zone.local(2026, 7, 15, 12)
    token = travel_to(issued_at) do
      html = mail.html_part.body.to_s
      CGI.unescape(html[%r{/acceso/([^"]+)}, 1])
    end

    travel_to(issued_at + 2.days - 1.second) do
      expect(User.find_signed(token, purpose: :purchase_login)).to eq(purchase.user)
    end

    travel_to(issued_at + 2.days) do
      expect(User.find_signed(token, purpose: :purchase_login)).to be_nil
    end
  end

  it "mentions password recovery for permanent access" do
    expect(mail.html_part.body.to_s).to include("contraseña")
    expect(mail.text_part.body.to_s).to include("contraseña")
  end

  it "uses APP_HOST rather than the Mailgun provider domain in production" do
    script = <<~RUBY
      require "./config/environment"
      puts "MAILER_OPTIONS=" + ActionMailer::Base.default_url_options.to_json
    RUBY
    env = {
      "RAILS_ENV" => "production",
      "SECRET_KEY_BASE_DUMMY" => "1",
      "APP_HOST" => "app.example.test",
      "MAILGUN_API_KEY" => "placeholder",
      "MAILGUN_DOMAIN" => "mg.example.test"
    }
    stdout, stderr, status = Open3.capture3(env, RbConfig.ruby, "-e", script, chdir: Rails.root.to_s)

    expect(status).to be_success, stderr
    encoded_options = stdout.lines.find { |line| line.start_with?("MAILER_OPTIONS=") }
    expect(JSON.parse(encoded_options.delete_prefix("MAILER_OPTIONS="))).to eq(
      "host" => "app.example.test",
      "protocol" => "https"
    )
  end
end
