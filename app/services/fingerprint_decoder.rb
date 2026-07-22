require "open3"
require "json"
require "tmpdir"

# Given an uploaded PDF or image, rasterizes it (pdftoppm for PDF, ImageMagick
# convert for images) and runs scripts/decode-watermark.ts against each page,
# picking the best CRC-valid match, then looking up the User by fingerprint_code.
#
# Page indexing: the cover occupies pages 0-1 (0-indexed); the pixel fingerprint
# watermark starts at page index 2 (see STAMP_PAGE_INDEX in
# scripts/stamp-manual-pdf.ts). pdftoppm's -f/-l flags are 1-indexed, so page
# index 2 is pdftoppm page 3 — hence "-f 3" below.
class FingerprintDecoder
  class Error < StandardError; end

  DECODE_SCRIPT = Rails.root.join("scripts/decode-watermark.ts")
  TSX_BIN = Rails.root.join("node_modules/.bin/tsx")
  MAX_PDF_PAGES = 6 # first N content pages after the cover, enough redundancy

  Result = Data.define(:user, :confidence, :purchase)

  def initialize(uploaded_file)
    @uploaded_file = uploaded_file
  end

  def call
    Dir.mktmpdir("fingerprint-decode-") do |dir|
      image_paths = rasterize(dir)
      candidates = image_paths.filter_map { |path| decode_image(path) }
      best = candidates.max_by { |c| c[:confidence] }
      return nil unless best

      user = User.find_by(fingerprint_code: best[:code])
      return nil unless user

      Result.new(user: user, confidence: best[:confidence], purchase: user.purchases.order(created_at: :desc).first)
    end
  end

  private

  def rasterize(dir)
    pdf? ? rasterize_pdf(dir) : rasterize_image(dir)
  end

  def pdf?
    @uploaded_file.content_type == "application/pdf" ||
      @uploaded_file.original_filename.to_s.downcase.end_with?(".pdf")
  end

  def rasterize_pdf(dir)
    source = File.join(dir, "input.pdf")
    File.binwrite(source, @uploaded_file.read)
    base = File.join(dir, "page")

    _stdout, stderr, status = Open3.capture3(
      "pdftoppm", "-png", "-r", "150", "-f", "3", "-l", (2 + MAX_PDF_PAGES).to_s, source, base
    )
    raise Error, "pdftoppm failed: #{stderr}" unless status.success?

    Dir.glob("#{base}-*.png").sort
  rescue SystemCallError => e
    raise Error, "pdftoppm could not be launched: #{e.message}"
  end

  def rasterize_image(dir)
    source = File.join(dir, "input")
    File.binwrite(source, @uploaded_file.read)
    target = File.join(dir, "page-1.png")

    _stdout, stderr, status = Open3.capture3("convert", source, target)
    raise Error, "ImageMagick convert failed: #{stderr}" unless status.success?

    [ target ]
  rescue SystemCallError => e
    raise Error, "ImageMagick convert could not be launched: #{e.message}"
  end

  def decode_image(path)
    stdout, stderr, status = Open3.capture3(TSX_BIN.to_s, DECODE_SCRIPT.to_s, path)
    raise Error, "decode-watermark.ts failed: #{stderr}" unless status.success?

    parsed = JSON.parse(stdout)
    return nil unless parsed["crcValid"]

    { code: parsed["code"], confidence: parsed["confidence"] }
  rescue SystemCallError => e
    raise Error, "decode-watermark.ts could not be launched: #{e.message}"
  rescue JSON::ParserError
    nil
  end
end
