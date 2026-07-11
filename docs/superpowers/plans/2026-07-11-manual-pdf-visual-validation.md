# Manual PDF Visual Validation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a development-only, side-by-side view on each manual section page — source PDF pages on the left, current rendered content on the right — so a developer can visually verify transcribed prose against the original book.

**Architecture:** A one-off rake task maps each of the 87 section paths to its PDF page range (committed as `config/manual_pdf_pages.yml`). A dev-only route rasterizes individual PDF pages to PNG on demand via `pdftoppm`. `ManualController` shares a `pdfPages` prop (dev only) via `inertia_share`, and `ManualLayout` reads it with `usePage()` to render an optional two-column layout with a collapse toggle. Nothing is reachable or changed outside `Rails.env.development?`.

**Tech Stack:** Rails 8, Inertia Rails 3.21 (`inertia_share`), React 19 (`usePage`), Tailwind v4, RSpec, poppler (`pdftoppm`/`pdftotext`).

**Spec:** `docs/superpowers/specs/2026-07-11-manual-pdf-visual-validation-design.md`

**Conventions in this codebase (read before starting):**
- `Manual` is a `module_function` module in `app/models/manual.rb` (no ActiveRecord). It exposes `.walk`, `.paths`, `.find`, `.path?`. Zeitwerk loads nested `Manual::Foo` from `app/models/manual/foo.rb`.
- `ManualController < InertiaController`; `InertiaController` already uses `inertia_share user: -> { ... }` (`app/controllers/inertia_controller.rb:4`). Section pages render via `manual#show` with `params[:component]` = the full `"part/section/..."` slug path.
- Request specs read the Inertia payload by parsing `Nokogiri::HTML(response.body).at_css("script[data-page]").text` as JSON (see `spec/requests/manual_spec.rb`). SSR is off in test/`test` env; pages come back as the Inertia HTML shell.
- No FactoryBot. `User.create!(email:, password:)`; `sign_in user` (Devise request helpers).
- The PDF (`project/*.pdf`, 136 pages) and `project/sections.txt` are **gitignored** — only the *generated page-number map* (`config/manual_pdf_pages.yml`, integers only) is committed. Never read the PDF at request time except through the dev-only rasterize controller.
- `tmp/` is gitignored; the PNG cache lives under `tmp/manual_pdf_pages/`.
- Commits are signed via 1Password; if a commit fails with "failed to fill whole buffer", the human must unlock 1Password, then re-run the commit. Use the commit messages given here.

---

## Chunk 1: Pure text-matching + page-range lookup

Everything here is plain Ruby, TDD-able with no PDF present.

### Task 1: `Manual::TextMatch` (normalize + Levenshtein)

**Files:**
- Create: `app/models/manual/text_match.rb`
- Test: `spec/models/manual/text_match_spec.rb`

- [ ] **Step 1: Write the failing test**

```ruby
# spec/models/manual/text_match_spec.rb
require "rails_helper"

RSpec.describe Manual::TextMatch do
  describe ".normalize" do
    it "strips accents, downcases, collapses whitespace, drops punctuation" do
      expect(described_class.normalize("  Ácido   Tánico! ")).to eq("acido tanico")
    end

    it "returns an empty string for nil" do
      expect(described_class.normalize(nil)).to eq("")
    end
  end

  describe ".distance" do
    it "is zero for identical strings" do
      expect(described_class.distance("gouache", "gouache")).to eq(0)
    end

    it "counts single-character edits" do
      expect(described_class.distance("gises", "gisos")).to eq(1)
      expect(described_class.distance("tempera", "tenpora")).to eq(2)
    end

    it "handles insertions and deletions" do
      expect(described_class.distance("velas", "vela")).to eq(1)
      expect(described_class.distance("", "abc")).to eq(3)
    end
  end

  describe ".within?" do
    it "is true when normalized distance is at or below the threshold" do
      expect(described_class.within?("Ácido tánico", "acido tanica", 2)).to be(true)
    end

    it "is false when normalized distance exceeds the threshold" do
      expect(described_class.within?("gouache", "pasteles", 2)).to be(false)
    end
  end
end
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bundle exec rspec spec/models/manual/text_match_spec.rb`
Expected: FAIL — `uninitialized constant Manual::TextMatch`.

- [ ] **Step 3: Write the implementation**

```ruby
# app/models/manual/text_match.rb
# frozen_string_literal: true

module Manual
  # Small, dependency-free text utilities for the (dev-only) PDF page mapper.
  # Kept pure so it is unit-testable without the gitignored source PDF.
  module TextMatch
    module_function

    # Accent-fold, downcase, strip punctuation, collapse runs of whitespace.
    def normalize(str)
      str.to_s
         .unicode_normalize(:nfd)
         .gsub(/\p{Mn}/, "")          # drop combining accent marks
         .downcase
         .gsub(/[^a-z0-9\s]/, " ")    # punctuation -> space
         .gsub(/\s+/, " ")
         .strip
    end

    # Classic iterative Levenshtein edit distance between two raw strings.
    def distance(a, b)
      a = a.to_s
      b = b.to_s
      return b.length if a.empty?
      return a.length if b.empty?

      prev = (0..b.length).to_a
      a.each_char.with_index(1) do |ca, i|
        curr = [i]
        b.each_char.with_index(1) do |cb, j|
          cost = ca == cb ? 0 : 1
          curr << [prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost].min
        end
        prev = curr
      end
      prev.last
    end

    # True iff the two strings are within `threshold` edits after normalization.
    def within?(a, b, threshold)
      distance(normalize(a), normalize(b)) <= threshold
    end
  end
end
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bundle exec rspec spec/models/manual/text_match_spec.rb`
Expected: PASS (all examples).

- [ ] **Step 5: Commit**

```bash
git add app/models/manual/text_match.rb spec/models/manual/text_match_spec.rb
git commit -m "Add Manual::TextMatch normalize + Levenshtein helper

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

### Task 2: `Manual.pdf_page_range` lookup

**Files:**
- Modify: `app/models/manual.rb` (add method near the other `module_function` methods)
- Test: `spec/models/manual_spec.rb` (append a describe block)

- [ ] **Step 1: Write the failing test**

Append to `spec/models/manual_spec.rb` (inside the top-level `RSpec.describe Manual do`):

```ruby
  describe ".pdf_page_range" do
    let(:map) do
      {
        "el-origen-del-color/introduccion" => [5, 6],
        "glosario" => [130, 136],
      }
    end

    it "returns [start, end] for a mapped component path" do
      expect(Manual.pdf_page_range("el-origen-del-color/introduccion", map: map)).to eq([5, 6])
    end

    it "returns nil for an unmapped path" do
      expect(Manual.pdf_page_range("does/not/exist", map: map)).to be_nil
    end

    it "returns nil for a blank component (e.g. the index action)" do
      expect(Manual.pdf_page_range(nil, map: map)).to be_nil
      expect(Manual.pdf_page_range("", map: map)).to be_nil
    end
  end
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bundle exec rspec spec/models/manual_spec.rb -e pdf_page_range`
Expected: FAIL — `NoMethodError: undefined method 'pdf_page_range'`.

- [ ] **Step 3: Write the implementation**

Add `require "yaml"` at the top of `app/models/manual.rb` (after `# frozen_string_literal: true`), then add these two methods after `path?` (before the final `end`):

```ruby
  # Lazily-loaded slug-path => [start_page, end_page] map, generated offline by
  # `rake manual:map_pdf_pages` and committed as integers only (no PDF content).
  # Empty when the file is absent (e.g. before the map has ever been generated).
  def pdf_page_map
    @pdf_page_map ||= begin
      file = Rails.root.join("config/manual_pdf_pages.yml")
      file.exist? ? (YAML.safe_load_file(file) || {}) : {}
    end
  end

  # [start_page, end_page] for a "part/section/..." component path, or nil.
  # `map:` is injectable for tests; defaults to the committed file.
  def pdf_page_range(component, map: pdf_page_map)
    return nil if component.nil? || component.to_s.empty?

    range = map[component.to_s]
    range && [range.first, range.last]
  end
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bundle exec rspec spec/models/manual_spec.rb`
Expected: PASS (all prior Manual examples plus the 3 new ones).

- [ ] **Step 5: Commit**

```bash
git add app/models/manual.rb spec/models/manual_spec.rb
git commit -m "Add Manual.pdf_page_range lookup over committed page map

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Chunk 2: The offline mapping rake task

This task **requires the gitignored PDF to be present locally** and shells out to `pdftotext`. It is not unit-TDD'd (it reads a local binary asset); verification is running it and inspecting the committed YAML.

### Task 3: `manual:map_pdf_pages` rake task

**Files:**
- Create: `lib/tasks/manual_pdf_pages.rake`
- Create (generated): `config/manual_pdf_pages.yml`

- [ ] **Step 1: Write the rake task**

```ruby
# lib/tasks/manual_pdf_pages.rake
namespace :manual do
  desc "Map each Manual section path to its source-PDF page range (dev-only, needs project/*.pdf)"
  task map_pdf_pages: :environment do
    require "open3"
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

    THRESHOLD = 2
    SCAN_AHEAD = 6 # how many pages forward to search for the next title

    starts = {}          # "part/section" => start_page (1-based)
    cursor = 0           # 0-based index into `pages`; scan forward only

    Manual.paths.each do |path|
      component = path.join("/")
      title = Manual.find(path)[:title]
      norm = Manual::TextMatch.normalize(title)

      found = nil
      (cursor...[cursor + SCAN_AHEAD, pages.size].min).each do |i|
        # Fast path: normalized title appears as a substring on the page.
        if pages[i].include?(norm)
          found = i
          break
        end
        # Fallback: any window of the page's words within Levenshtein <= 2.
        words = pages[i].split(" ")
        title_len = norm.split(" ").size
        if words.each_cons([title_len, 1].max).any? { |w| Manual::TextMatch.distance(norm, w.join(" ")) <= THRESHOLD }
          found = i
          break
        end
      end

      abort <<~MSG if found.nil?
        Could not locate section on the PDF (searched pages #{cursor + 1}..#{[cursor + SCAN_AHEAD, pages.size].min}):
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
      ranges[component] = [start, last]
    end

    out = Rails.root.join("config/manual_pdf_pages.yml")
    File.write(out, YAML.dump(ranges))
    puts "Wrote #{ranges.size} ranges to #{out.relative_path_from(Rails.root)} (PDF: #{page_count} pages)."
  end
end
```

- [ ] **Step 2: Run the task**

Run: `bin/rails manual:map_pdf_pages`
Expected: `Wrote 87 ranges to config/manual_pdf_pages.yml (PDF: 136 pages).`
If it aborts naming a title it couldn't find, either widen `SCAN_AHEAD` and re-run, or (if the PDF text genuinely differs) fix that single entry by hand in the YAML after a partial run — but prefer re-running cleanly.

- [ ] **Step 3: Sanity-check the output**

Run: `head -6 config/manual_pdf_pages.yml`
Expected: valid YAML mapping keys to two-element integer arrays. Keys are `Manual.paths` in book order, so the first key is the top-level part `el-origen-del-color` (part nodes are mapped/rendered too), followed by its children like `el-origen-del-color/introduccion`. Ranges are non-decreasing.

- [ ] **Step 4: Confirm the lookup now reads the real file**

Run: `bin/rails runner 'p Manual.pdf_page_range("el-origen-del-color/introduccion")'`
Expected: a two-integer array, e.g. `[5, 6]`.

- [ ] **Step 5: Commit the task and the generated map**

```bash
git add lib/tasks/manual_pdf_pages.rake config/manual_pdf_pages.yml
git commit -m "Add manual:map_pdf_pages task and generated page map

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Chunk 3: Dev-only PDF rasterize route + controller

### Task 4: `ManualPdfPagesController` + dev-only route

**Files:**
- Create: `app/controllers/manual_pdf_pages_controller.rb`
- Modify: `config/routes.rb`
- Test: `spec/requests/manual_pdf_pages_spec.rb`

- [ ] **Step 1: Write the failing request spec**

```ruby
# spec/requests/manual_pdf_pages_spec.rb
require "rails_helper"

RSpec.describe "Manual PDF pages", type: :request do
  # The rasterize route is drawn ONLY in development. In the test env it does
  # not exist, so the router returns 404 (test env renders RoutingError as 404;
  # same mechanism spec/requests/manual_spec.rb relies on for unknown slugs).
  it "does not expose the dev rasterize route outside development" do
    expect(Rails.env.development?).to be(false) # sanity: we are in test env
    get "/dev/manual_pdf_pages/1.png"
    expect(response).to have_http_status(:not_found)
  end
end
```

- [ ] **Step 2: Run to confirm it passes by absence (a lock-in guard, not red-green)**

Run: `bundle exec rspec spec/requests/manual_pdf_pages_spec.rb`
Expected: PASS immediately (route doesn't exist yet, so 404). This is a guard spec, not a TDD red step: its job is to *lock in* that the route stays dev-only. Because the route is drawn only in development, it must **remain green** after Steps 3–4 in the test env. If it ever fails, the route leaked into a non-dev env.

- [ ] **Step 3: Add the controller**

```ruby
# app/controllers/manual_pdf_pages_controller.rb
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
```

- [ ] **Step 4: Draw the dev-only route**

In `config/routes.rb`, add after the `Manual.walk` block (before `resources :newsletter_emails`):

```ruby
  if Rails.env.development?
    get "/dev/manual_pdf_pages/:page.png",
        to: "manual_pdf_pages#show",
        constraints: { page: /\d+/ }
  end
```

- [ ] **Step 5: Verify the guard spec still passes**

Run: `bundle exec rspec spec/requests/manual_pdf_pages_spec.rb`
Expected: PASS — the route is absent in test env, so `/dev/manual_pdf_pages/1.png` is still 404.

- [ ] **Step 6: Manually verify rasterization works in development**

```bash
RAILS_ENV=development bin/rails runner '
  c = ManualPdfPagesController.new
  c.send(:rasterize, 5, ManualPdfPagesController::CACHE_DIR.join("5.png"))
  puts ManualPdfPagesController::CACHE_DIR.join("5.png").exist?
'
```
Expected: prints `true` and `tmp/manual_pdf_pages/5.png` exists (a rendered page image). (Requires the local PDF.)

- [ ] **Step 7: Commit**

```bash
git add app/controllers/manual_pdf_pages_controller.rb config/routes.rb spec/requests/manual_pdf_pages_spec.rb
git commit -m "Add dev-only PDF page rasterize route and controller

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Chunk 4: Wire `pdfPages` into the view

### Task 5: Share `pdfPages` from `ManualController` (dev only)

**Files:**
- Modify: `app/controllers/manual_controller.rb`
- Test: `spec/requests/manual_spec.rb` (append an example)

- [ ] **Step 1: Write the failing test**

Append inside the top-level `RSpec.describe "Manual", type: :request do` in `spec/requests/manual_spec.rb`:

```ruby
  it "never includes a pdfPages prop outside development" do
    sign_in user
    get "/manual-del-color-vivo/glosario"
    page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
    expect(page["props"]).not_to have_key("pdfPages")
  end
```

- [ ] **Step 2: Run to verify current behavior**

Run: `bundle exec rspec spec/requests/manual_spec.rb -e "pdfPages"`
Expected: PASS already (no `pdfPages` shared yet). Like Task 4's guard spec, this locks in that the dev-only share never leaks into the test/prod payload.

- [ ] **Step 3: Add the `inertia_share` block**

In `app/controllers/manual_controller.rb`, add inside the class, right after `before_action :authenticate_user!`:

```ruby
  # Dev-only: expose the section's source-PDF page range so ManualLayout can
  # render the side-by-side validation view. Evaluated per request (needs
  # params[:component]); a no-op in every other environment, so the prop never
  # reaches the client outside development. Mirrors InertiaController's
  # `inertia_share user: -> { ... }` pattern.
  inertia_share do
    next unless Rails.env.development?

    range = Manual.pdf_page_range(params[:component])
    { pdfPages: range && (range.first..range.last).to_a }
  end
```

- [ ] **Step 4: Run to verify the test still passes (prop stays absent in test env)**

Run: `bundle exec rspec spec/requests/manual_spec.rb`
Expected: PASS — including the new example. In the test env the block returns `nil` (guarded by `Rails.env.development?`), so `pdfPages` is never in the payload.

- [ ] **Step 5: Manually verify the prop IS present in development**

```bash
RAILS_ENV=development bin/rails runner '
  include Rails.application.routes.url_helpers
  puts Manual.pdf_page_range("el-origen-del-color/introduccion").inspect
'
```
Expected: a two-integer array (proves the share will produce a range in dev). Full end-to-end browser check happens in Task 6 Step 5.

- [ ] **Step 6: Commit**

```bash
git add app/controllers/manual_controller.rb spec/requests/manual_spec.rb
git commit -m "Share dev-only pdfPages prop from ManualController

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

### Task 6: Two-column layout + collapse toggle in `ManualLayout`

**Files:**
- Modify: `app/frontend/components/ManualLayout.jsx`

No automated frontend test (this repo has no JS test runner configured); verification is the manual browser check in Step 5. Keep the change additive so the single-column path is byte-for-byte the current behavior when `pdfPages` is absent.

- [ ] **Step 1: Rewrite `ManualLayout.jsx`**

```jsx
// app/frontend/components/ManualLayout.jsx
import { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'

// Shared wrapper for every manual section page. In development a `pdfPages`
// shared prop (array of page numbers) may be present; when it is, we render a
// dev-only two-column view: source PDF pages on the left, content on the right.
// Outside development the prop is never sent, so this renders exactly the
// original single-column layout.
function Content({ title, hideTitle, children }) {
  return (
    <>
      <Link href="/manual-del-color-vivo" className="font-display text-sm font-semibold text-orange-ink">
        ← Contenido
      </Link>
      {hideTitle ? null : <h1 className="mt-4 font-display text-3xl font-bold text-blue">{title}</h1>}
      <div className="mt-6 space-y-5 text-[1.05rem] leading-8">{children}</div>
    </>
  )
}

export default function ManualLayout({ title, children, hideTitle = false }) {
  const { pdfPages } = usePage().props
  const [showPdf, setShowPdf] = useState(true)

  if (!pdfPages || pdfPages.length === 0) {
    return (
      <main className="min-h-screen bg-cream font-body text-blue-ink">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <Content title={title} hideTitle={hideTitle}>{children}</Content>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-cream font-body text-blue-ink">
      <div className={`grid ${showPdf ? 'grid-cols-[1fr_1fr]' : 'grid-cols-1'}`}>
        {showPdf && (
          <aside className="max-h-screen overflow-y-auto border-r border-blue/15 bg-blue/5 p-4">
            <button
              type="button"
              onClick={() => setShowPdf(false)}
              className="mb-4 rounded bg-blue px-3 py-1 font-display text-xs font-semibold text-cream"
            >
              Ocultar PDF
            </button>
            <div className="space-y-4">
              {pdfPages.map((n) => (
                <img
                  key={n}
                  src={`/dev/manual_pdf_pages/${n}.png`}
                  alt={`PDF página ${n}`}
                  className="w-full border border-blue/20 bg-white shadow-sm"
                />
              ))}
            </div>
          </aside>
        )}
        <div className="max-h-screen overflow-y-auto px-6 py-12">
          <div className="mx-auto max-w-3xl">
            {!showPdf && (
              <button
                type="button"
                onClick={() => setShowPdf(true)}
                className="mb-4 rounded bg-orange px-3 py-1 font-display text-xs font-semibold text-orange-ink"
              >
                Mostrar PDF
              </button>
            )}
            <Content title={title} hideTitle={hideTitle}>{children}</Content>
          </div>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify the RSpec suite is still green**

Run: `bundle exec rspec`
Expected: all green (the change is JS-only; no Ruby behavior changed). `pdfPages` is absent in test env, so pages still render the single-column path.

- [ ] **Step 3: Start the dev environment**

Run: `./serve-dev` (boots Rails + Vite + SSR panes; see the Phase 2c plan). Ensure the local PDF exists at `project/*.pdf` and `config/manual_pdf_pages.yml` is present.

- [ ] **Step 4: Sign in**

In a browser, log in (no self-registration; use an existing dev user, or create one via `bin/rails runner 'User.create!(email: "dev@example.com", password: "password123")'`).

- [ ] **Step 5: Visually verify the split view**

Visit `http://localhost:3000/manual-del-color-vivo/el-origen-del-color/introduccion`.
Expected:
- Two columns: left shows the rendered PDF page image(s) for that section, right shows the current content.
- "Ocultar PDF" collapses the left column to a single-column read view with a "Mostrar PDF" button; clicking it restores the split.
- The `/manual-del-color-vivo` Contenido index page (no `pdfPages`) is unchanged — single column, no toggle.

- [ ] **Step 6: Verify production render is unaffected (spot check)**

Run: `RAILS_ENV=production bin/rails runner 'p Rails.application.routes.recognize_path("/dev/manual_pdf_pages/5.png") rescue p $!.class'`
Expected: prints `ActionController::RoutingError` (route not drawn in production). This confirms the dev route and the whole feature are absent outside development.

- [ ] **Step 7: Commit**

```bash
git add app/frontend/components/ManualLayout.jsx
git commit -m "Add dev-only side-by-side PDF view to ManualLayout

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Final verification

- [ ] `bundle exec rspec` — all green (TextMatch, Manual pdf_page_range, manual request specs incl. the pdfPages-absence guard, the dev-route-absence guard, plus all pre-existing examples).
- [ ] `bin/rails manual:map_pdf_pages` prints `Wrote 87 ranges ...` and re-running overwrites the same file with identical content.
- [ ] Dev browser check (Task 6 Step 5): split view renders, toggle works, index page unchanged.
- [ ] `RAILS_ENV=production` route check (Task 6 Step 6) raises `RoutingError` for `/dev/manual_pdf_pages/*`.
- [ ] `git status` clean.

## Out of scope (do NOT do here)

- Any production/test behavior change — the feature is strictly `Rails.env.development?`.
- Prose transcription or content edits — this is only a viewing aid.
- Automated prose/OCR diffing — the comparison is visual only.
- Caching invalidation for the PNG cache — a developer can `rm -rf tmp/manual_pdf_pages` if the source PDF changes.
