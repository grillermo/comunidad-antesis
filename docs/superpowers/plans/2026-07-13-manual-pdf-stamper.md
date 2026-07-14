# Manual PDF Stamper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Signed-in users download `data/manual.pdf` personalized with `copia de <their email>` stamped in small blue text on page 2, below the author name, via `GET /generate-pdf`.

**Architecture:** A TypeScript script (run with `tsx`, using `@cantoo/pdf-lib`) does the actual PDF stamping and writes the result to stdout. A Ruby service class `ManualPdfStamper` shells out to it with `Open3.capture3`. A thin `GeneratedPdfsController#show` authenticates, calls the service, and `send_data`s the bytes. Spec: `docs/superpowers/specs/2026-07-13-manual-pdf-stamper-design.md`.

**Tech Stack:** Rails 8.0.5, RSpec, Node (already present via Vite), `@cantoo/pdf-lib` (MIT fork of pdf-lib), `tsx` runner, TypeScript.

## Global Constraints

- PDF engine is `@cantoo/pdf-lib` — do NOT install the original `pdf-lib` package (dead since 2022) and do NOT use any AGPL library (HexaPDF, PyMuPDF).
- `@cantoo/pdf-lib` and `tsx` go in `dependencies` (needed at runtime in production); `typescript` goes in `devDependencies` (only for optional typechecking).
- Stamp text is exactly `copia de <email>` (lowercase "copia de", one space each side).
- Download filename is exactly `manual-del-color-vivo.pdf`.
- Page geometry facts (measured): all pages are 396.85 × 612.283 pt. Page 2 (index 1) has the author name "Anabel Torres Chávez" horizontally centered, baseline ≈ 57 pt from the page bottom, in steel blue on cream background.
- The email must never be interpolated into a shell string — always pass argv arrays to `Open3.capture3`.
- Never emit a partial PDF: the script writes to stdout only after `doc.save()` succeeds; failures go to stderr with exit code 1.
- Run `bin/rubocop` before every commit that touches Ruby files; fix offenses.
- The user's project convention: RSpec request specs use `sign_in user` (Devise::Test::IntegrationHelpers) and FactoryBot `create(:user)`.

---

### Task 1: TypeScript stamp script + npm dependencies

**Files:**
- Modify: `package.json` (via npm install)
- Create: `scripts/stamp-manual-pdf.ts`

**Interfaces:**
- Consumes: `data/manual.pdf` (checked into repo).
- Produces: CLI contract used by Task 2 — `node_modules/.bin/tsx scripts/stamp-manual-pdf.ts <source-pdf-path> <email>` → stamped PDF bytes on stdout, exit 0; any failure → message on stderr, exit 1, nothing usable on stdout.

- [ ] **Step 1: Install dependencies**

```bash
npm install @cantoo/pdf-lib tsx
npm install --save-dev typescript
```

Expected: `package.json` gains `@cantoo/pdf-lib` and `tsx` under `dependencies`, `typescript` under `devDependencies`.

- [ ] **Step 2: Write the script**

Create `scripts/stamp-manual-pdf.ts`:

```typescript
import { readFile } from "node:fs/promises"
import { PDFDocument, StandardFonts, rgb } from "@cantoo/pdf-lib"

// Page 2 of data/manual.pdf: 396.85 x 612.283 pt, author name centered,
// baseline ~57pt from bottom. Stamp goes directly below it.
const STAMP_PAGE_INDEX = 1
const FONT_SIZE = 7
const BASELINE_Y = 46
const AUTHOR_BLUE = rgb(0.23, 0.42, 0.65)

async function main() {
  const [sourcePath, email] = process.argv.slice(2)
  if (!sourcePath || !email) {
    console.error("usage: stamp-manual-pdf.ts <source-pdf-path> <email>")
    process.exit(1)
  }

  const doc = await PDFDocument.load(await readFile(sourcePath))
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const page = doc.getPage(STAMP_PAGE_INDEX)

  const text = `copia de ${email}`
  const textWidth = font.widthOfTextAtSize(text, FONT_SIZE)
  page.drawText(text, {
    x: (page.getWidth() - textWidth) / 2,
    y: BASELINE_Y,
    size: FONT_SIZE,
    font,
    color: AUTHOR_BLUE,
  })

  process.stdout.write(await doc.save())
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 3: Run it and check the output is a PDF**

```bash
node_modules/.bin/tsx scripts/stamp-manual-pdf.ts data/manual.pdf test@example.com > /tmp/stamped-manual.pdf
head -c 8 /tmp/stamped-manual.pdf; echo; ls -la /tmp/stamped-manual.pdf data/manual.pdf
```

Expected: first bytes `%PDF-1.`, output file size ≥ 3.6MB source size, exit 0.

- [ ] **Step 4: Visually calibrate placement and color**

Use the Read tool on `/tmp/stamped-manual.pdf` with `pages: "2"`. Check:
1. `copia de test@example.com` appears directly below "Anabel Torres Chávez", visually centered.
2. Gap between author name and stamp looks like one small line-height (not touching, not floating far below).
3. Blue matches the author name's steel blue (not brighter/darker).

If off, adjust `BASELINE_Y` (placement) and `AUTHOR_BLUE` (color) constants, re-run Step 3, re-check. Repeat until correct. Record final constants in the commit.

- [ ] **Step 5: Verify failure contract**

```bash
node_modules/.bin/tsx scripts/stamp-manual-pdf.ts missing.pdf a@b.com > /tmp/should-be-empty.pdf; echo "exit=$?"; ls -la /tmp/should-be-empty.pdf
```

Expected: `exit=1`, error text on stderr, `/tmp/should-be-empty.pdf` is 0 bytes.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json scripts/stamp-manual-pdf.ts
git commit -m "Add TypeScript manual PDF stamp script (@cantoo/pdf-lib via tsx)"
```

---

### Task 2: ManualPdfStamper service (TDD)

**Files:**
- Create: `spec/services/manual_pdf_stamper_spec.rb`
- Create: `app/services/manual_pdf_stamper.rb`

**Interfaces:**
- Consumes: CLI contract from Task 1 (`node_modules/.bin/tsx scripts/stamp-manual-pdf.ts <source> <email>` → PDF on stdout).
- Produces: `ManualPdfStamper.new(email:, source: ManualPdfStamper::SOURCE_PDF).call` → `String` (binary PDF bytes). Raises `ManualPdfStamper::Error` on any failure. Task 3 relies on exactly these names.

- [ ] **Step 1: Write the failing spec**

Create `spec/services/manual_pdf_stamper_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe ManualPdfStamper do
  it "returns stamped PDF bytes for the manual" do
    bytes = described_class.new(email: "reader@example.com").call

    expect(bytes).to start_with("%PDF")
    expect(bytes.bytesize).to be >= File.size(Rails.root.join("data/manual.pdf"))
  end

  it "raises Error when the source PDF does not exist" do
    stamper = described_class.new(email: "reader@example.com", source: Rails.root.join("data/nope.pdf"))

    expect { stamper.call }.to raise_error(ManualPdfStamper::Error)
  end
end
```

- [ ] **Step 2: Run spec, verify it fails**

```bash
bundle exec rspec spec/services/manual_pdf_stamper_spec.rb
```

Expected: FAIL with `uninitialized constant ManualPdfStamper`.

- [ ] **Step 3: Implement the service**

Create `app/services/manual_pdf_stamper.rb`:

```ruby
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
```

- [ ] **Step 4: Run spec, verify it passes**

```bash
bundle exec rspec spec/services/manual_pdf_stamper_spec.rb
```

Expected: 2 examples, 0 failures. (Each example shells out to Node — a few seconds total is normal.)

- [ ] **Step 5: Lint and commit**

```bash
bin/rubocop app/services/manual_pdf_stamper.rb spec/services/manual_pdf_stamper_spec.rb
git add app/services/manual_pdf_stamper.rb spec/services/manual_pdf_stamper_spec.rb
git commit -m "Add ManualPdfStamper service shelling out to stamp script"
```

---

### Task 3: Route + GeneratedPdfsController (TDD)

**Files:**
- Modify: `config/routes.rb`
- Create: `app/controllers/generated_pdfs_controller.rb`
- Create: `spec/requests/generated_pdfs_spec.rb`

**Interfaces:**
- Consumes: `ManualPdfStamper.new(email:).call` → binary `String`; raises `ManualPdfStamper::Error` (Task 2).
- Produces: `GET /generate-pdf` — authenticated: `200` + `application/pdf` attachment `manual-del-color-vivo.pdf`; anonymous: Devise redirect; stamper failure: `503`.

- [ ] **Step 1: Write the failing request spec**

Create `spec/requests/generated_pdfs_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "GeneratedPdfs", type: :request do
  let(:user) { create(:user) }

  it "requires authentication" do
    get "/generate-pdf"

    expect(response).to have_http_status(:found)
    expect(response).to redirect_to(new_user_session_path)
  end

  it "sends the stamped manual as a PDF download" do
    sign_in user

    get "/generate-pdf"

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq("application/pdf")
    expect(response.headers["Content-Disposition"]).to include('attachment; filename="manual-del-color-vivo.pdf"')
    expect(response.body).to start_with("%PDF")
  end

  it "responds 503 when stamping fails" do
    sign_in user
    allow(ManualPdfStamper).to receive(:new).and_raise(ManualPdfStamper::Error, "boom")

    get "/generate-pdf"

    expect(response).to have_http_status(:service_unavailable)
  end
end
```

- [ ] **Step 2: Run spec, verify it fails**

```bash
bundle exec rspec spec/requests/generated_pdfs_spec.rb
```

Expected: FAIL — routing error (`No route matches [GET] "/generate-pdf"`).

- [ ] **Step 3: Add route and controller**

In `config/routes.rb`, next to the other top-level app routes (after the health/landing routes, outside the RailsAdmin/Devise blocks), add:

```ruby
get "generate-pdf", to: "generated_pdfs#show"
```

Create `app/controllers/generated_pdfs_controller.rb`:

```ruby
class GeneratedPdfsController < ApplicationController
  before_action :authenticate_user!

  def show
    pdf = ManualPdfStamper.new(email: Current.user.email).call
    send_data pdf,
      filename: "manual-del-color-vivo.pdf",
      type: "application/pdf",
      disposition: "attachment"
  rescue ManualPdfStamper::Error => e
    Rails.logger.error("ManualPdfStamper failed: #{e.message}")
    head :service_unavailable
  end
end
```

- [ ] **Step 4: Run spec, verify it passes**

```bash
bundle exec rspec spec/requests/generated_pdfs_spec.rb
```

Expected: 3 examples, 0 failures.

- [ ] **Step 5: Full suite + lint**

```bash
bundle exec rspec
bin/rubocop
```

Expected: full suite green, no rubocop offenses.

- [ ] **Step 6: Commit**

```bash
git add config/routes.rb app/controllers/generated_pdfs_controller.rb spec/requests/generated_pdfs_spec.rb
git commit -m "Add /generate-pdf endpoint serving email-stamped manual"
```
