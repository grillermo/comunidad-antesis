class PurchaseMailer < ApplicationMailer
  def fulfillment(purchase, pdf)
    @purchase = purchase
    @login_url = acceso_url(
      token: purchase.user.signed_id(purpose: :purchase_login, expires_in: 2.days)
    )

    attachments["manual-del-color-vivo.pdf"] = {
      mime_type: "application/pdf",
      content: pdf
    }

    mail(to: purchase.email, subject: "Tu Manual del Color Vivo")
  end
end
