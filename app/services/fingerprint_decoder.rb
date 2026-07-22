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

  # This tool only ever needs to handle a manual-sized PDF or a single-page
  # screenshot, both far smaller than this — a hard cap avoids reading an
  # arbitrarily huge upload fully into memory (memory-exhaustion DoS).
  MAX_UPLOAD_BYTES = 25.megabytes

  # Dispatch is based on sniffing real file content, not attacker-controlled
  # request metadata (content_type/filename).
  MAGIC_BYTES = {
    pdf: "%PDF",
    png: "\x89PNG".b,
    jpeg: "\xFF\xD8\xFF".b
  }.freeze

  # Resource limits passed to ImageMagick's `convert` to reduce blast radius
  # from a crafted/hostile image (decompression bombs, ImageTragick-class
  # issues): cap memory/map usage and wall-clock time.
  CONVERT_RESOURCE_LIMITS = %w[-limit memory 256MiB -limit map 256MiB -limit time 30].freeze

  Result = Data.define(:user, :confidence, :purchase)

  def initialize(uploaded_file)
    @uploaded_file = uploaded_file
  end

  def call
    validate_size!
    format = detect_format!

    Dir.mktmpdir("fingerprint-decode-") do |dir|
      image_paths = format == :pdf ? rasterize_pdf(dir) : rasterize_image(dir)
      candidates = image_paths.filter_map { |path| decode_image(path) }
      best = candidates.max_by { |c| c[:confidence] }
      return nil unless best

      user = User.find_by(fingerprint_code: best[:code])
      return nil unless user

      Result.new(user: user, confidence: best[:confidence], purchase: user.purchases.order(created_at: :desc).first)
    end
  end

  private

  def validate_size!
    size = @uploaded_file.size
    return if size && size <= MAX_UPLOAD_BYTES

    raise Error, "Uploaded file is too large (max #{MAX_UPLOAD_BYTES / 1.megabyte} MB)"
  end

  # Sniffs the first few bytes of the actual content to decide how to
  # rasterize it, rather than trusting content_type/filename.
  def detect_format!
    header = @uploaded_file.read(8).to_s.b
    @uploaded_file.rewind

    return :pdf if header.start_with?(MAGIC_BYTES[:pdf])
    return :image if header.start_with?(MAGIC_BYTES[:png]) || header.start_with?(MAGIC_BYTES[:jpeg])

    raise Error, "Unrecognized file format: expected a PDF, PNG, or JPEG"
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

    _stdout, stderr, status = Open3.capture3("convert", *CONVERT_RESOURCE_LIMITS, source, target)
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
