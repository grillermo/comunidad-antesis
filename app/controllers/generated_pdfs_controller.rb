class GeneratedPdfsController < ApplicationController
  before_action :authenticate_user!

  def show
    pdf = ManualPdfStamper.new(email: Current.user.email).call
    send_data pdf,
      filename: "manual-del-color-vivo.pdf",
      type: "application/pdf",
      disposition: "attachment"
  rescue ManualPdfStamper::Error => e
    Rails.logger.error("ManualPdfStamper failed: #{e.message}")
    head :service_unavailable
  end
end
