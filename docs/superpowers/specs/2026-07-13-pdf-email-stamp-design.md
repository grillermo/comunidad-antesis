# Personalized manual PDF — email stamp (v1)

Date: 2026-07-13
Status: approved design, pending implementation plan

## Goal

Signed-in users download `data/manual.pdf` with their email stamped on page 2
(interior title page), directly below the author name "Anabel Torres Chávez":
small blue text reading `copia de <user email>`.

v2 (out of scope here, but architecture must allow it): a mark on every page
and link annotations on most pages — requires pixel-perfect placement.

## Stack decision

- **@cantoo/pdf-lib** (MIT, actively maintained fork of pdf-lib; v2.7.2,
  released 2026-07-12) + **@pdf-lib/fontkit** for TTF embedding.
- Script written in **TypeScript**, executed with the **tsx** runner
  (`npx tsx scripts/stamp-manual-pdf.ts`). `tsx` is a regular (production)
  dependency; `typescript` and `@types/node` are dev dependencies.
- Rejected: HexaPDF (AGPL — incompatible with commercial project without paid
  license), CombinePDF (no link annotations, weak Unicode fonts — blocks v2),
  Prawn+pdftk (two tools, no link annotations), pdfcpu (limited link
  annotation support), PyMuPDF/borb (AGPL), pypdf+reportlab (viable but adds
  Python runtime; Node already in stack via Vite).

## Architecture

```
GET /generate-pdf
  → GeneratedPdfsController#show   (authenticate_user!)
    → ManualPdfStamper.new(email: Current.user.email).call  → PDF bytes
      → Open3.capture3("npx", "tsx", "scripts/stamp-manual-pdf.ts",
                        source_path, email)   # email as argv, never shell-interpolated
        → stamped PDF written to stdout
    → send_data bytes, filename: "manual-del-color-vivo.pdf",
                type: "application/pdf", disposition: "attachment"
```

Generation is **on-the-fly per request** (no caching, no background job).
136 pages / 3.6MB stamps in low seconds; acceptable for occasional downloads.

## Components

### ManualPdfStamper (Ruby, app/services/manual_pdf_stamper.rb)

- Single responsibility: invoke the Node script, return stamped PDF bytes.
- `Open3.capture3` with argv array (no shell string). stdin closed,
  stdout binary = PDF, stderr captured for diagnostics.
- Non-zero exit status → raise `ManualPdfStamper::Error` including stderr;
  controller lets it bubble (500) — no silent fallback to unstamped PDF.
- Source path default `Rails.root.join("data/manual.pdf")`, injectable for tests.

### stamp-manual-pdf.ts (TypeScript, scripts/)

- argv: `<source.pdf> <email>`. Output: stamped PDF on stdout. Errors → stderr,
  exit 1.
- Loads source, targets page index 1 (page 2).
- Draws `copia de <email>`:
  - centered horizontally on the page,
  - positioned directly below the "Anabel Torres Chávez" line (exact y
    measured once during implementation from the fixed page layout; stored as
    named constants),
  - font size ~8–9pt,
  - color: the same steel blue as the author name (sampled from the PDF
    during implementation, stored as constant),
  - font: embed a TTF subset via fontkit for accent-safe glyphs; fall back to
    a standard WinAnsi font only if all needed glyphs render correctly.
- v2 extension point: this script owns the whole pdf-lib pipeline, so
  per-page marks and link annotations become additional drawing steps here —
  no architecture change.

### Route + controller

- `get "/generate-pdf", to: "generated_pdfs#show"` inside the authenticated
  area. Controller inherits from `InertiaController`'s parent chain like other
  authenticated controllers; uses `Current.user.email`.

## Error handling

- Anonymous request → Devise redirect to login (standard `authenticate_user!`).
- Script failure (missing node modules, bad source PDF) → exception with
  stderr detail, standard 500. Never serve the unstamped original.

## Testing

- **Request spec**: signed-in user gets 200, `Content-Type: application/pdf`,
  body starts with `%PDF`, `Content-Disposition` attachment with filename.
  Anonymous user redirected to sign-in.
- **Service spec**: runs the real script against the real `data/manual.pdf`,
  asserts valid PDF output (magic bytes, non-trivial size) and that the
  stamped page contains the email (assert via pdf-lib itself in a small
  verify mode, or byte/text search fallback).
- One-time manual visual check of placement during implementation
  (screenshot/open the output).

## Out of scope (v2, future)

- Mark on every page; link annotations on most pages.
- Any caching or background generation.
