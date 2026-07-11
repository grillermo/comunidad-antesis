# Manual Content Authoring Pass — Design

**Date**: 2026-07-10
**Status**: Approved design, pending plan
**Depends on**: Phase 2c (manual routing, SSR, layout, placeholder pages)

## Goal

Replace the 87 placeholder pages of *Manual del Color Vivo* with the real,
verbatim ebook prose transcribed from the source PDF
(`project/MaquetaCompleta-ManualDelColorVivo-VER1 (1).pdf`, gitignored,
136 pages), plus the book's illustrations. This is a content pass, not a
routing or infrastructure pass: the routes, controller, SSR, and
`ManualLayout` from Phase 2c stay as they are.

## Delivery & Security Model

- Prose is **hardcoded directly** in each per-page `.jsx` file under
  `app/frontend/pages/manual-del-color-vivo/`, replacing the
  "Contenido próximamente." placeholder body.
- Inertia + Vite already lazy-split each page (`pages: "../pages"` uses
  `import.meta.glob`) into its own hashed chunk. Manual chunks are therefore
  never downloaded by public/landing visitors — only when an authenticated
  user navigates to a manual page.
- **Security posture: obscurity accepted.** This is an explicit product
  decision by the owner. The compiled chunks live in `public/vite` with hashed
  filenames, are not linked from any public page, but are technically fetchable
  by anyone who learns the hashed URL or reads the Vite manifest. No
  authenticated asset-serving layer is added in this pass. This intentionally
  overrides the HANDOFF caution about prose in public bundles; record the
  decision so it is not "fixed" later by accident.

## Semantic Component Kit

New components under `app/frontend/components/manual/`. Each has one clear
purpose, is styled once with the existing Tailwind v4 `@theme` palette, and is
composed by the page files. `ManualLayout` remains the outer wrapper.

- `<Recipe rendimiento={…} tiempo={…}>` — wraps a recipe; renders the
  yield (`Rendimiento`) / time (`Tiempo`) sidebar and the recipe body.
  `rendimiento` and `tiempo` are **optional** props: some recipes carry only
  one, or neither, and the sidebar omits absent fields.
- `<Steps>` — the numbered `Procedimiento` list (`<ol>`).
- `<MaterialList>` + `<Material term="…">description</Material>` — the
  bold-term + em-dash bulleted material lists.
- `<Callout>` — the highlighted `Importante:` box.
- `<SideNote>` — margin/aside notes (e.g. "El cascarón de huevo es 94%
  carbonato de calcio…").
- `<Subheading>` — in-section headings (h2/h3) such as "Herramientas básicas",
  "Antes de empezar", "Durante el trabajo".
- `<PartDivider image={…} title={…}>` — the 5 top-level part pages, showing the
  full-page divider illustration.

The kit is built and reviewed before bulk transcription so every section
composes a consistent, already-styled vocabulary. It may be revised once the
first real sections (Phase B) are transcribed and reveal structures not
anticipated from the sample sections (e.g. an extra recipe field like
`Dificultad`, or a callout variant). Such revisions are expected and cheap
early; later phases inherit the settled kit.

## Content Fidelity

Transcription is **verbatim**: the author's Spanish prose is reproduced as
written, with its punctuation and voice preserved. No summarizing, rewriting,
or "web-friendly" editing. The content is extracted by reading the PDF pages
and typing the prose into the matching page file, guided by
`Manual::TABLE_OF_CONTENTS` (slugs are stable URL/page-path contracts and are
not changed).

## Images

Exactly 7 raster images are embedded in the PDF (`pdfimages` lists them on
pages 1, 8, 22, 83, 94, 110, 121); the interior is otherwise text plus the
brand color scheme (any decorative botanical art is vector).

- **Cover** (page 1) — already extracted as `app/frontend/assets/cover.jpg`;
  already used as the landing hero (Phase 2a). Not re-placed by this pass.
- **5 part-divider illustrations** (PDF pages 8, 22, 83, 94, 110) — extracted
  with `pdfimages`, optimized with `magick` (resized/compressed to match the
  `cover.jpg` treatment), stored in `app/frontend/assets/manual/`, and shown on
  the 5 top-level part pages via `<PartDivider>`.
- **Atlas del color** (PDF pages 121–130, "índice cromático: tintes y sus gamas
  de color") — a visual color-swatch chart where visual fidelity is the point.
  The 7th embedded raster (page 121) is the Atlas opener; the swatch pages
  (122–130) are vector. To treat the whole chart uniformly, the entire range
  121–130 is rasterized page-by-page with `pdftoppm`, optimized, and shown in
  sequence on the `atlas-del-color` page. Not selectable text; it is a visual
  reference. (The embedded page-121 raster is thus superseded by its rasterized
  version and not extracted separately.)

Images are imported via the `@/assets` Vite alias. Because obscurity is
accepted, they may live in the public bundle alongside the prose chunks.

## Content Mapping (before transcription)

Because several recipe titles are near-duplicates (e.g. multiple "Receta para
modificar el color de un tinte con …"), transcribing "by title" alone is
error-prone. Phase A produces a reviewed **slug → PDF-page-range index**
covering all 87 nodes of `Manual::TABLE_OF_CONTENTS`, derived from the PDF's
"Contenido" pages (which list start pages per section). This index is the
transcription guide; it is checked against the TOC before any prose is typed.
Front matter (PDF pages ~1–7: title, credits, the "ANTESIS" epigraph, the
"Contenido" listing) has no TOC node and is **out of scope**; the existing
`Index.jsx` contents page (Phase 2c) is unchanged.

## Plan Decomposition

One spec (this document); the implementation plan is phased and reviewed per
phase to keep each chunk reviewable against the source:

- **Phase A** — component kit + image extraction/optimization (dividers +
  Atlas).
- **Phase B** — Part I *El origen del color* section pages (front matter
  excluded; see Content Mapping).
- **Phase C** — Part II *Color sobre fibra* (largest; many recipes).
- **Phase D** — Part III *Pigmento y polvo*.
- **Phase E** — Part IV *Color en movimiento*.
- **Phase F** — Part V *Color cotidiano*.
- **Phase G** — *Atlas del color*, *Epílogo*, *Glosario*.

## Verification

- **Per-phase completion gate:** no page in the phase's slug set still contains
  the placeholder string `"Contenido próximamente."`. Enforced by a grep over
  the phase's files in the plan's phase steps. This keeps the gate scoped to the
  slugs the phase actually completed, so earlier phases are not blocked by
  pages later phases will fill.
- **Overall completion gate (Phase G only):** an RSpec example that fails if
  *any* page file under `app/frontend/pages/manual-del-color-vivo/` still
  contains the placeholder. This global test is introduced only in the final
  phase (G), once all 87 pages are done — adding it earlier would keep
  `bundle exec rspec` red through Phases B–F. It is the one expected Ruby change
  (a test only); no model or controller change is needed.
- Each phase carries a checklist of the exact slugs it must complete (from the
  Content Mapping index), ticked off before the phase is considered done.
- `bundle exec rspec` stays green at the end of every phase (the global
  placeholder test does not exist until Phase G, when it too passes).
- Production Vite client + SSR builds pass.
- Per phase: authenticated browser check of representative pages confirms
  server-rendered real prose and correct component rendering; the owner
  spot-checks transcription fidelity against the PDF.

## Non-Goals

- No changes to manual routes, slugs, controller logic, SSR wiring, or
  `ManualLayout` structure (styling tweaks only if a component needs them).
- No database content models (Phase 2c decision stands).
- No authenticated asset-serving layer (obscurity accepted).
- Comment system (Phase 2d) is out of scope.
