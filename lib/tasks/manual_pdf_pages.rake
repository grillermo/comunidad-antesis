namespace :manual do
  desc "Map each Manual section path to its source-PDF page range (dev-only, needs project/*.pdf)"
  task map_pdf_pages: :environment do
    require "open3"
    require "yaml"

    pdfs = Dir.glob(Rails.root.join("project/*.pdf"))
    abort "No PDF found under project/*.pdf (it is gitignored — add it locally)." if pdfs.empty?

    pdf_page_counts = pdfs.to_h do |candidate|
      info, error, status = Open3.capture3("pdfinfo", candidate.to_s)
      abort "pdfinfo failed for #{candidate}: #{error.strip}" unless status.success?

      count = info[/Pages:\s+(\d+)/, 1]
      abort "pdfinfo did not report a page count for #{candidate}." unless count

      [ candidate, Integer(count) ]
    end

    manuals = pdf_page_counts.select { |_candidate, count| count == 136 }
    if manuals.empty?
      found = pdf_page_counts.map { |candidate, count| "#{candidate} (#{count} pages)" }.join(", ")
      abort "Could not find the 136-page Manual del Color Vivo under project/*.pdf. Found: #{found}"
    end
    if manuals.many?
      abort "Found multiple 136-page PDFs under project/*.pdf; cannot choose the manual: #{manuals.keys.join(", ")}"
    end

    pdf, page_count = manuals.first

    # Extract normalized text per page once, up front.
    pages = (1..page_count).map do |n|
      text, status = Open3.capture2("pdftotext", "-f", n.to_s, "-l", n.to_s, pdf, "-")
      abort "pdftotext failed on page #{n}" unless status.success?
      Manual::TextMatch.normalize(text)
    end

    threshold = 2
    scan_ahead = 12 # how many pages forward to search for the next title

    starts = {}          # "part/section" => start_page (1-based)
    # The Color cotidiano divider is physically on pages 110-111, after some
    # child recipes. Keep its full visual range without moving the scan cursor.
    range_overrides = { "color-cotidiano" => [ 110, 111 ] }
    first_title = Manual::TextMatch.normalize(Manual.find(Manual.paths.first)[:title])
    cursor = pages.index { |page| page.include?(first_title) && !page.start_with?("contenido") } || 0

    Manual.paths.each do |path|
      component = path.join("/")
      if range_overrides.key?(component)
        starts[component] = nil
        next
      end

      title = Manual.find(path)[:title]
      pdf_title = {
        "color-sobre-fibra/modificadores-y-tratamientos-de-color/sulfato-ferroso/receta-de-bano-modificador-con-sulfato-ferroso" =>
          "Receta de baño oscurecedor con sulfato ferroso"
      }.fetch(component, title)
      norm = Manual::TextMatch.normalize(pdf_title)

      found = nil
      (cursor...[ cursor + scan_ahead, pages.size ].min).each do |i|
        # Fast path: normalized title appears as a substring on the page.
        if pages[i].include?(norm)
          found = i
          break
        end
        # Fallback: any window of the page's words within Levenshtein <= 2.
        words = pages[i].split(" ")
        title_len = norm.split(" ").size
        if words.each_cons([ title_len, 1 ].max).any? { |w| Manual::TextMatch.distance(norm, w.join(" ")) <= threshold }
          found = i
          break
        end
      end

      abort <<~MSG if found.nil?
        Could not locate section on the PDF (searched pages #{cursor + 1}..#{[ cursor + scan_ahead, pages.size ].min}):
          title:     #{title.inspect}
          component: #{component}
        Last matched page: #{cursor} (1-based #{cursor + 1}).
        Fix this one entry by hand in config/manual_pdf_pages.yml after the task, or widen SCAN_AHEAD, then re-run.
      MSG

      starts[component] = found + 1 # store 1-based page number
      cursor = found
    end

    # Turn start pages into [start, end] ranges: a section runs until the page
    # before the next section starts; the last section ends at page_count.
    ordered = starts.to_a # already in book order (Manual.paths order)
    ranges = {}
    ordered.each_with_index do |(component, start), idx|
      if range_overrides.key?(component)
        ranges[component] = range_overrides.fetch(component)
        next
      end

      next_start = ordered.drop(idx + 1).find { |_next_component, candidate| candidate }&.last
      last = next_start ? next_start - 1 : page_count
      last = start if last < start # guard against two sections on one page
      ranges[component] = [ start, last ]
    end

    out = Rails.root.join("config/manual_pdf_pages.yml")
    File.write(out, YAML.dump(ranges))
    puts "Wrote #{ranges.size} ranges to #{out.relative_path_from(Rails.root)} (PDF: #{page_count} pages)."
  end
end
