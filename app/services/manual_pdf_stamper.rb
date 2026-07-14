require "open3"

class ManualPdfStamper
  class Error < StandardError; end

  SOURCE_PDF = Rails.root.join("data/manual.pdf")
  SCRIPT = Rails.root.join("scripts/stamp-manual-pdf.ts")
  TSX_BIN = Rails.root.join("node_modules/.bin/tsx")

  def initialize(email:, source: SOURCE_PDF)
    @email = email
    @source = source
  end

  def call
    stdout, stderr, status = Open3.capture3(
      TSX_BIN.to_s, SCRIPT.to_s, @source.to_s, @email,
      binmode: true
    )
    unless status.success? && stdout.start_with?("%PDF")
      raise Error, "stamp script failed (status #{status.exitstatus}): #{stderr.strip}"
    end

    stdout
  end
end
