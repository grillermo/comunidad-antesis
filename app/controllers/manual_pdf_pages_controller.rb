# frozen_string_literal: true

require "open3"
require "securerandom"

# DEV-ONLY. Rasterizes a single page of the gitignored source PDF to PNG for
# the side-by-side visual-validation view (see ManualLayout). The route is only
# drawn in development; this controller re-checks the env as defense in depth so
# a routing mistake can never expose the PDF in another environment.
class ManualPdfPagesController < ApplicationController
  PAGE_RANGE = (1..136)
  CACHE_DIR = Rails.root.join("tmp/manual_pdf_pages")

  before_action :require_development!

  def show
    page = parse_page(params[:page])

    png = CACHE_DIR.join("#{page}.png")
    rasterize(page, png) unless png.exist?

    send_file png, type: "image/png", disposition: "inline"
  end

  private

  def require_development!
    raise ActionController::RoutingError, "not found" unless Rails.env.development?
  end

  def parse_page(value)
    page = Integer(value, 10)
    raise ActionController::RoutingError, "page out of range" unless PAGE_RANGE.cover?(page)

    page
  rescue ArgumentError, TypeError
    raise ActionController::RoutingError, "page out of range"
  end

  def source_pdf
    pdfs = Dir.glob(Rails.root.join("project/*.pdf"))
    raise ActionController::RoutingError, "no source PDFs found under project/*.pdf" if pdfs.empty?

    manuals = pdfs.select { |candidate| pdf_page_count(candidate) == PAGE_RANGE.size }
    if manuals.empty?
      raise ActionController::RoutingError, "could not find the 136-page source PDF"
    end
    if manuals.many?
      raise ActionController::RoutingError, "multiple 136-page source PDFs found"
    end

    manuals.first
  end

  def pdf_page_count(candidate)
    info, _error, status = Open3.capture3("pdfinfo", candidate.to_s)
    raise ActionController::RoutingError, "pdfinfo failed" unless status.success?

    count = info[/Pages:\s+(\d+)/, 1]
    raise ActionController::RoutingError, "pdfinfo did not report a page count" unless count

    Integer(count, 10)
  rescue Errno::ENOENT
    raise ActionController::RoutingError, "pdfinfo unavailable"
  end

  def rasterize(page, png)
    pdf = source_pdf
    FileUtils.mkdir_p(png.dirname)
    # Render beside the final cache file, then rename atomically so a concurrent
    # request can never serve a partially written PNG.
    prefix = png.dirname.join(".#{page}-#{SecureRandom.hex(8)}").to_s
    temporary_png = Pathname("#{prefix}.png")
    _out, status = Open3.capture2(
      "pdftoppm", "-png", "-singlefile", "-r", "150",
      "-f", page.to_s, "-l", page.to_s, pdf, prefix
    )
    raise ActionController::RoutingError, "pdftoppm failed" unless status.success?
    raise ActionController::RoutingError, "pdftoppm produced no PNG" unless temporary_png.exist?

    File.rename(temporary_png, png)
  rescue Errno::ENOENT
    raise ActionController::RoutingError, "pdftoppm unavailable"
  ensure
    FileUtils.rm_f(temporary_png) if temporary_png
  end
end
