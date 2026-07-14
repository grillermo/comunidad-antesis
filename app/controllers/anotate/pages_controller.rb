module Anotate
  class PagesController < ApplicationController
    def show
      page = Integer(params[:page], exception: false)
      raise ActiveRecord::RecordNotFound unless page&.between?(1, ManualPdfPages::PAGE_COUNT)

      expires_in 1.year
      send_file ManualPdfPages.path_for(page), type: "image/png", disposition: "inline"
    rescue ManualPdfPages::Error => e
      Rails.logger.error("ManualPdfPages failed: #{e.message}")
      head :service_unavailable
    end
  end
end
