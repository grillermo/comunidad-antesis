# /anotate — PDF marker tool

**Date:** 2026-07-14
**Status:** Approved design

## Purpose

Admin-only, phone-friendly page at `/anotate` that renders `data/manual.pdf` (136 pages) as scrollable page images. Long-pressing a page places a floating marker with the fixed text **"pregúntarle a la autora"** (underlined); while the finger stays down the marker drags with it; releasing saves it. Tapping an existing marker deletes it. Markers persist in the database across visits.

Markers will later be exported into a stamped PDF (reusing the pdf-lib/tsx tooling from `ManualPdfStamper`), so coordinates must be convertible to PDF points. Export is **out of scope** for this build.

## Architecture

Inertia + React page in the existing Rails 8 monolith, consistent with the rest of the app.

### Routes & auth

```ruby
authenticate :user, ->(u) { u.admin? } do
  get "/anotate", to: "anotate#show"
  get "/anotate/pages/:page", to: "anotate/pages#show", as: :anotate_page
  resources :pdf_markers, only: [ :create, :destroy ], path: "anotate/markers"
end
```

All markers are loaded as an Inertia prop on `/anotate` — no index endpoint.

### Model: `PdfMarker`

| column | type    | notes                                        |
|--------|---------|----------------------------------------------|
| page   | integer | 1..136, presence + range validation          |
| x      | decimal | fraction 0..1 of page width (tap point)      |
| y      | decimal | fraction 0..1 of page height (tap point)     |

Fractions are render-scale independent and convert to PDF points at export time (`x * page_width_pt`, `y * page_height_pt`).

### Page images: `Anotate::PagesController#show`

- Validates page param is an integer in 1..136; otherwise 404.
- Cache path: `tmp/manual_pages/page-%03d.png`.
- On cache miss, shells out to `pdftoppm -f N -l N -r 150 -png` against `data/manual.pdf`, writes the cached file. PNG only — no webp/ImageMagick dependency.
- Serves via `send_file` with long-lived cache headers (images are immutable per PDF version).
- **Deploy prerequisite:** `pdftoppm` (poppler) must be installed on the server.

Page aspect ratio (from PDF metadata, computed once server-side) is passed as an Inertia prop so unloaded `<img>` placeholders reserve correct height.

### Frontend: `app/frontend/pages/Anotate.jsx`

- Vertical column of 136 page containers: `position: relative` div wrapping `<img loading="lazy" src="/anotate/pages/N">` with aspect-ratio placeholder.
- Markers render inside their page container as absolutely positioned spans at `left: x*100%`, `top: y*100%`, `transform: translate(-50%, -50%)`. Text "pregúntarle a la autora", underlined, high-contrast (red-ish), non-selectable.

**Interaction (pointer events):**

- **Long-press (~400 ms) on a page** → provisional marker appears under the finger. While the pointer stays down, `pointermove` drags the marker. `pointerup` → POST to `/anotate/markers`, marker becomes permanent (optimistic; server id swapped in on response).
- **Quick swipe** (movement before the 400 ms threshold, or release before threshold) → normal scroll, no marker.
- **Tap on an existing marker** → DELETE `/anotate/markers/:id`, marker removed. `stopPropagation` prevents the tap from also starting a placement.
- Markers are not repositionable after placement — delete and re-place.
- Works with mouse too (same pointer-event code path) for desktop testing.

### Error handling

- `pdftoppm` failure → 503, stderr logged.
- Marker create failure → revert optimistic marker, show alert.
- Marker delete failure → restore marker, show alert.

## Testing

Request specs:

- `/anotate`, page images, and marker endpoints are admin-gated (anonymous and non-admin users rejected).
- `PdfMarker` create with valid/invalid page and fraction values.
- Destroy removes the marker.
- Page endpoint rejects out-of-range/non-numeric page params; shell-out stubbed; cache-hit path serves the existing file.

Model spec: validations (page range, x/y bounds).

## Out of scope (YAGNI)

- Stamped-PDF export (future; coordinates designed for it).
- Marker text editing (fixed text).
- Page-jump navigation UI (plain scroll).
- Multi-user marker ownership (admin-only tool, shared table).
