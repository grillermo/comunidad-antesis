# frozen_string_literal: true

require "open3"

# DEV-ONLY. Rasterizes a single page of the gitignored source PDF to PNG for
# the side-by-side visual-validation view (see ManualLayout). The route is only
# drawn in development; this controller re-checks the env as defense in depth so
# a routing mistake can never expose the PDF in another environment.
class ManualPdfPagesController < ApplicationController
  PAGE_RANGE = (1..136)
  CACHE_DIR = Rails.root.join("tmp/manual_pdf_pages")

  before_action :require_development!

  def show
    page = params[:page].to_i
    raise ActionController::RoutingError, "page out of range" unless PAGE_RANGE.cover?(page)

    png = CACHE_DIR.join("#{page}.png")
    rasterize(page, png) unless png.exist?

    send_file png, type: "image/png", disposition: "inline"
  end

  private

  def require_development!
    raise ActionController::RoutingError, "not found" unless Rails.env.development?
  end

  def rasterize(page, png)
    pdf = Dir.glob(Rails.root.join("project/*.pdf")).first
    raise ActionController::RoutingError, "source PDF missing under project/*.pdf" unless pdf

    FileUtils.mkdir_p(CACHE_DIR)
    # argv array — no shell, no interpolation. `-singlefile` makes the output
    # exactly `<prefix>.png` (no page-number suffix), matching what we serve.
    prefix = CACHE_DIR.join(page.to_s).to_s
    _out, status = Open3.capture2(
      "pdftoppm", "-png", "-singlefile", "-r", "150",
      "-f", page.to_s, "-l", page.to_s, pdf, prefix
    )
    raise ActionController::RoutingError, "pdftoppm failed" unless status.success?
  end
end
