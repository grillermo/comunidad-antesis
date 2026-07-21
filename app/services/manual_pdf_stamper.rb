require "open3"
require "json"
require "cgi"

class ManualPdfStamper
  class Error < StandardError; end

  SOURCE_PDF = Rails.root.join("data/manual.pdf")
  SCRIPT = Rails.root.join("scripts/stamp-manual-pdf.ts")
  TSX_BIN = Rails.root.join("node_modules/.bin/tsx")
  MANUAL_BASE_PATH = "/manual-del-color-vivo"

  def initialize(email:, source: SOURCE_PDF)
    @email = email
    @source = source
  end

  def call
    stdout, stderr, status = Open3.capture3(
      TSX_BIN.to_s, SCRIPT.to_s, @source.to_s, @email,
      stdin_data: link_targets_json,
      binmode: true
    )
    unless status.success? && stdout.start_with?("%PDF")
      raise Error, "stamp script failed (status #{status.exitstatus}): #{stderr.strip}"
    end

    stdout
  rescue SystemCallError => e
    raise Error, "stamp script could not be launched: #{e.message}"
  end

  private

  # Every manual node as {title, url}. The stamp script matches these titles
  # against the PDF's orange/blue headings and turns each occurrence into a link
  # to its reader-facing web page, tagged with the buyer's email and pdf source.
  def link_targets_json
    targets = []
    Manual.walk { |node, path| targets << { title: node[:title], url: url_for(path) } }
    JSON.generate(targets)
  end

  def url_for(path)
    query = "user=#{CGI.escape(@email)}&source=pdf"
    "https://#{ENV.fetch('APP_HOST')}#{MANUAL_BASE_PATH}/#{path.join('/')}?#{query}"
  end
end
