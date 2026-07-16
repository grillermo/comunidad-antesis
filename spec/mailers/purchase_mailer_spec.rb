require "rails_helper"

RSpec.describe PurchaseMailer do
  let(:purchase) { create(:purchase, email: "buyer@example.com") }
  let(:pdf) { "%PDF-1.4\n\x00\xFFbinary".b }
  let(:mail) { described_class.fulfillment(purchase, pdf) }

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
end
