namespace :manual do
  desc "Map each Manual section path to its source-PDF page range (dev-only, needs project/*.pdf)"
  task map_pdf_pages: :environment do
    require "open3"
    require "shellwords"
    require "yaml"

    pdf = Dir.glob(Rails.root.join("project/*.pdf")).first
    abort "No PDF found under project/*.pdf (it is gitignored — add it locally)." unless pdf

    page_count = Integer(`pdfinfo #{Shellwords.escape(pdf)}`[/Pages:\s+(\d+)/, 1])

    # Extract normalized text per page once, up front.
    pages = (1..page_count).map do |n|
      text, status = Open3.capture2("pdftotext", "-f", n.to_s, "-l", n.to_s, pdf, "-")
      abort "pdftotext failed on page #{n}" unless status.success?
      Manual::TextMatch.normalize(text)
    end

    threshold = 2
    scan_ahead = 12 # how many pages forward to search for the next title

    starts = {}          # "part/section" => start_page (1-based)
    first_title = Manual::TextMatch.normalize(Manual.find(Manual.paths.first)[:title])
    cursor = pages.index { |page| page.include?(first_title) && !page.start_with?("contenido") } || 0

    Manual.paths.each do |path|
      component = path.join("/")
      title = Manual.find(path)[:title]
      pdf_title = {
        "color-cotidiano" => "Crayones",
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
      next_start = ordered[idx + 1]&.last
      last = next_start ? next_start - 1 : page_count
      last = start if last < start # guard against two sections on one page
      ranges[component] = [ start, last ]
    end

    out = Rails.root.join("config/manual_pdf_pages.yml")
    File.write(out, YAML.dump(ranges))
    puts "Wrote #{ranges.size} ranges to #{out.relative_path_from(Rails.root)} (PDF: #{page_count} pages)."
  end
end
