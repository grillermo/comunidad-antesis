require "open3"

# Renders single pages of data/manual.pdf to PNG via pdftoppm (poppler),
# caching them on disk. Deploy prerequisite: pdftoppm must be installed.
class ManualPdfPages
  class Error < StandardError; end

  SOURCE_PDF = Rails.root.join("data/manual.pdf")
  CACHE_DIR = Rails.root.join("tmp/manual_pages")
  PAGE_COUNT = 136
  PAGE_WIDTH_PTS = 396.85
  PAGE_HEIGHT_PTS = 612.283
  RESOLUTION_DPI = 150

  def self.aspect_ratio
    (PAGE_HEIGHT_PTS / PAGE_WIDTH_PTS).round(5)
  end

  def self.path_for(page)
    new(page).path
  end

  def initialize(page, source: SOURCE_PDF, cache_dir: CACHE_DIR)
    @page = page
    @source = source
    @cache_dir = cache_dir
  end

  def path
    cached = @cache_dir.join(format("page-%03d.png", @page))
    render_to(cached) unless cached.exist?
    cached
  end

  private

  def render_to(cached)
    FileUtils.mkdir_p(@cache_dir)
    prefix = @cache_dir.join("rendering-#{@page}-#{Process.pid}")

    _stdout, stderr, status = Open3.capture3(
      "pdftoppm", "-f", @page.to_s, "-l", @page.to_s,
      "-singlefile", "-r", RESOLUTION_DPI.to_s, "-png",
      @source.to_s, prefix.to_s
    )

    rendered = Pathname.new("#{prefix}.png")
    unless status.success? && rendered.exist?
      raise Error, "pdftoppm failed for page #{@page} (status #{status.exitstatus}): #{stderr.strip}"
    end

    FileUtils.mv(rendered, cached)
  rescue SystemCallError => e
    raise Error, "pdftoppm could not be launched: #{e.message}"
  end
end
