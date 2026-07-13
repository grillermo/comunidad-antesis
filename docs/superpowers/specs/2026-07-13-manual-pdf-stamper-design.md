# Manual PDF Stamper — Design

**Date:** 2026-07-13
**Status:** Approved (v1 scope)

## Goal

Signed-in users download a personalized copy of the manual PDF from `GET /generate-pdf`.
The copy is `data/manual.pdf` with one addition: on page 2 (interior title page), directly
below the author name "Anabel Torres Chávez", a small blue line of text reading
`copia de <user email>`.

A future v2 will extend the same pipeline to stamp a mark on every page and add link
annotations to most pages. The v1 architecture must not block that.

## Tech stack decision

- **PDF engine:** `@cantoo/pdf-lib` (MIT) — the actively maintained fork of `pdf-lib`
  (original: last release May 2022, effectively dead; fork: v2.7.2 released 2026-07-12,
  110 releases, same API). Chosen over:
  - HexaPDF (Ruby): AGPL, unacceptable for this commercial project without paid license.
  - CombinePDF (Ruby, MIT): no custom font embedding (accents at risk), no link
    annotations — blocks v2.
  - Prawn + pdftk: two moving parts, system binary, no link annotations — blocks v2.
  - pypdf + reportlab (Python, BSD): capable, but adds a Python runtime to the deploy.
  - pdfcpu (Go, Apache-2.0): strong stamping, weak link-annotation support — risks v2.
- **Script language:** TypeScript, executed with the `tsx` runner (no build step).
- **Font embedding:** `@pdf-lib/fontkit` to embed a TTF subset so accented glyphs
  ("á" in "Chávez"-adjacent text, the email line itself) render correctly. If testing
  shows a standard WinAnsi font covers all needed glyphs, the TTF may be dropped.
- Node is already part of the stack (Vite); no new runtime lands on the server.

## Architecture

```
GET /generate-pdf
  → GeneratedPdfsController#show   (behind authenticate_user!)
      → ManualPdfStamper.new(email: Current.user.email).call  → PDF bytes
          → Open3.capture3("npx", "tsx", "scripts/stamp-manual-pdf.ts",
                           SOURCE_PDF_PATH, email)
              stdout = stamped PDF bytes, non-zero exit = failure
      → send_data bytes, filename: "manual-del-color-vivo.pdf",
                  type: "application/pdf", disposition: "attachment"
```

Generation is on-the-fly per request (decision: no caching, no background job).
136 pages / 3.6 MB stamps in low seconds; acceptable for occasional downloads.

### Components

**`GeneratedPdfsController#show`** (Rails)
- Route: `get "generate-pdf", to: "generated_pdfs#show"`.
- Requires authentication (`authenticate_user!`); email comes from `Current.user`.
- On stamper failure: log, respond 503 with a plain error (no partial PDF ever sent).

**`ManualPdfStamper`** (`app/services/manual_pdf_stamper.rb`)
- Single responsibility: run the Node script, return stamped bytes.
- `Open3.capture3` with argv array — email is never interpolated into a shell string.
- Raises `ManualPdfStamper::Error` (with stderr captured) on non-zero exit or empty output.
- Source path constant: `Rails.root.join("data/manual.pdf")`.

**`scripts/stamp-manual-pdf.ts`** (TypeScript, run via `tsx`)
- argv: `<source-pdf-path> <email>`; writes stamped PDF to stdout; errors to stderr, exit 1.
- Loads the PDF, takes page index 1 (page 2), draws `copia de <email>`:
  - horizontally centered,
  - positioned directly below the "Anabel Torres Chávez" baseline — exact x/y measured
    once from the fixed page-2 layout and kept as named constants,
  - font size ~8–9 pt,
  - color: the same steel blue as the author name (sampled from the PDF, stored as an
    RGB constant).
- Owns the whole pdf-lib pipeline so v2 (per-page marks + link annotations) extends this
  script without architecture changes.

### Dependencies (package.json)

- deps: `@cantoo/pdf-lib`, `@pdf-lib/fontkit`
- devDeps → deps note: `tsx` and `typescript` are needed at runtime in production
  (script runs per request), so both are declared as regular dependencies.

## Error handling

- Node script: any failure → stderr message + exit 1; never emits partial PDF to stdout.
- ManualPdfStamper: non-zero exit or empty/invalid stdout → raise with stderr attached.
- Controller: rescue stamper error → 503, logged. Anonymous user → Devise redirect to login.

## Testing

- **Request spec** (`spec/requests/generated_pdfs_spec.rb`):
  - signed-in user gets 200, `Content-Type: application/pdf`, body starts with `%PDF`,
    attachment filename correct;
  - anonymous user redirected to sign-in.
- **Service spec** (`spec/services/manual_pdf_stamper_spec.rb`): runs the real script
  against the real `data/manual.pdf`; asserts output is a valid PDF (magic bytes + EOF
  marker), output size ≥ input size, and the email string appears in the page-2 content
  (via pdf-lib's own text or a byte search on the decompressed stream — whichever the
  implementation makes cheap). Failure path: bad source path raises `Error`.
- One-time manual visual check of the stamped page 2 during implementation to pin the
  coordinates.

## Out of scope (v2)

- Mark on every page.
- Link annotations on most pages.
- Any caching/storage of generated files.
