# Manual Content Authoring Pass — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 87 placeholder pages of *Manual del Color Vivo* with the real verbatim ebook prose and illustrations, using a small semantic component kit.

**Architecture:** Prose is hardcoded directly in each per-page `.jsx` under `app/frontend/pages/manual-del-color-vivo/` (lazy-split Vite chunks, security-by-obscurity accepted). A reusable component kit under `app/frontend/components/manual/` renders recipes, material lists, callouts, side notes, sub-headings, and part dividers. Images are extracted from the source PDF with `pdfimages`/`pdftoppm`, optimized with `magick`, and stored under `app/frontend/assets/manual/`. Work is phased by book part; each phase has a scoped grep gate, and a final RSpec example enforces zero remaining placeholders.

**Tech Stack:** Rails 8 + Inertia Rails (SSR) + React 19 + Vite + Tailwind v4 (`@theme`), RSpec, poppler (`pdfimages`/`pdftoppm`/`pdfinfo`), ImageMagick (`magick`).

**Spec:** `docs/superpowers/specs/2026-07-10-manual-content-authoring-design.md`

**Source PDF (gitignored):** `project/MaquetaCompleta-ManualDelColorVivo-VER1 (1).pdf` (136 pages).

---

## Conventions used throughout

- **Verify commands** use the environment's rbenv shim path:
  ```bash
  env PATH="/Users/grillermo/.rbenv/shims:$PATH" bundle exec rspec
  env PATH="/Users/grillermo/.rbenv/shims:$PATH" RAILS_ENV=production NODE_ENV=production bin/vite build --clear
  env PATH="/Users/grillermo/.rbenv/shims:$PATH" RAILS_ENV=production NODE_ENV=production bin/vite build --ssr
  ```
- **Commits are signed via 1Password.** If a commit fails with `1Password: failed to fill whole buffer`, stop and ask the human to unlock 1Password; never bypass signing (`--no-gpg-sign`) and never add false co-author trailers. End commit messages with:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- **Slugs are stable contracts** (`app/models/manual.rb`). Never rename a slug or move a page file. Page file paths mirror the TOC nesting, e.g.
  `app/frontend/pages/manual-del-color-vivo/el-origen-del-color/herramientas-basicas/materiales-para-tenir.jsx`.
- **No JS test runner exists** (only Vite). Component correctness is verified by the production SSR build passing and an authenticated browser check — not JS unit tests. Do **not** add vitest; it is out of scope.
- **`Contenido próximamente.`** is the placeholder string in every stub. "Filled" means that exact string is gone from the page.

---

## Chunk 1: Foundations (Phase A)

Builds everything Phases B–G consume: the content-map reference, the extracted/optimized images, and the component kit. No prose is transcribed here.

### Task A1: Content map (slug → PDF page range)

**Files:**
- Create: `docs/superpowers/plans/manual-content-map.md`

- [ ] **Step 1: List the PDF's "Contenido" start pages.** Read PDF pages 4–7 (the Contenido listing) with the Read tool. These give the printed start page per section. Note: printed page numbers are offset from PDF page indices (printed p9 = "Introducción"); record the offset by finding where "Introducción" actually renders (read PDF pages 8–10) and compute `pdf_index = printed_page + offset`.

- [ ] **Step 2: Write the map.** For every one of the 87 nodes in `Manual::TABLE_OF_CONTENTS` (walk order), write a row: `slug | title | PDF page range`. Ranges are start-of-this-section to start-of-next. For near-duplicate recipe titles (several "Receta para modificar el color de un tinte con …"), the page range is what disambiguates them — get these right.

- [ ] **Step 3: Cross-check count.** Confirm the map has exactly 87 rows:
  ```bash
  env PATH="/Users/grillermo/.rbenv/shims:$PATH" bin/rails runner 'puts Manual.paths.size'
  ```
  Expected: `87`. The map row count must equal this.

- [ ] **Step 4: Commit.**
  ```bash
  git add docs/superpowers/plans/manual-content-map.md
  git commit -m "Add slug-to-PDF-page content map for manual authoring"
  ```

### Task A2: Extract and optimize the 5 part-divider images

**Files:**
- Create: `app/frontend/assets/manual/divider-el-origen-del-color.jpg`
- Create: `app/frontend/assets/manual/divider-color-sobre-fibra.jpg`
- Create: `app/frontend/assets/manual/divider-pigmento-y-polvo.jpg`
- Create: `app/frontend/assets/manual/divider-color-en-movimiento.jpg`
- Create: `app/frontend/assets/manual/divider-color-cotidiano.jpg`

- [ ] **Step 1: Extract raster pages.** The 5 dividers are embedded on PDF pages 8, 22, 83, 94, 110. Render each to a temp image (page render preserves the smask/composite; extracting raw with `pdfimages` would drop the alpha mask):
  ```bash
  PDF="project/MaquetaCompleta-ManualDelColorVivo-VER1 (1).pdf"
  mkdir -p tmp/manual-img app/frontend/assets/manual
  for spec in 8:el-origen-del-color 22:color-sobre-fibra 83:pigmento-y-polvo 94:color-en-movimiento 110:color-cotidiano; do
    pg=${spec%%:*}; name=${spec#*:}
    pdftoppm -f "$pg" -l "$pg" -r 200 -jpeg "$PDF" "tmp/manual-img/$name"
  done
  ls tmp/manual-img
  ```
  Expected: 5 files like `el-origen-del-color-08.jpg` (suffix may vary).

- [ ] **Step 2: Optimize to web size.** Match the `cover.jpg` treatment (check its dimensions first: `magick identify app/frontend/assets/cover.jpg`). Resize to ~1200px wide, quality 82:
  ```bash
  for f in tmp/manual-img/*.jpg; do
    base=$(basename "$f"); name="${base%-*}"
    magick "$f" -resize 1200x -quality 82 "app/frontend/assets/manual/divider-$name.jpg"
  done
  ls -la app/frontend/assets/manual
  ```
  Expected: 5 `divider-*.jpg` files, each well under 300 KB.

- [ ] **Step 3: Visually confirm.** Read each generated `app/frontend/assets/manual/divider-*.jpg` with the Read tool and confirm it is the correct part-divider illustration (matches the part title).

- [ ] **Step 4: Commit.**
  ```bash
  git add app/frontend/assets/manual/divider-*.jpg
  git commit -m "Add optimized manual part-divider illustrations"
  ```

### Task A3: Extract and optimize the Atlas del color pages

**Files:**
- Create: `app/frontend/assets/manual/atlas-01.jpg` … `atlas-NN.jpg` (one per Atlas page in range 121–130; confirm the true last page from the content map)

- [ ] **Step 1: Confirm the Atlas page range.** From the content map, the Atlas spans PDF pages 121 through the page before "Epílogo". Verify the last Atlas page by reading PDF pages 129–131.

- [ ] **Step 2: Rasterize each Atlas page.**
  ```bash
  PDF="project/MaquetaCompleta-ManualDelColorVivo-VER1 (1).pdf"
  pdftoppm -f 121 -l 130 -r 200 -jpeg "$PDF" tmp/manual-img/atlas
  for f in tmp/manual-img/atlas-*.jpg; do
    n=$(basename "$f" .jpg | sed 's/atlas-//')
    magick "$f" -resize 1400x -quality 85 "app/frontend/assets/manual/atlas-$n.jpg"
  done
  ls app/frontend/assets/manual/atlas-*.jpg
  ```
  Expected: one optimized `atlas-*.jpg` per Atlas page.

- [ ] **Step 3: Visually confirm** each `atlas-*.jpg` shows the color-swatch chart legibly (read them with the Read tool).

- [ ] **Step 4: Commit.**
  ```bash
  git add app/frontend/assets/manual/atlas-*.jpg
  git commit -m "Add optimized Atlas del color chart images"
  ```

### Task A4: Component kit — build the vocabulary

Study existing style before writing: read `app/frontend/components/ManualLayout.jsx` and `app/frontend/entrypoints/application.css` for the `@theme` tokens (`bg-cream`, `text-blue-ink`, `font-display`, `text-orange-ink`, etc.). Reuse those tokens; do not invent new colors or create `tailwind.config.js`.

**Files:**
- Create: `app/frontend/components/manual/Subheading.jsx`
- Create: `app/frontend/components/manual/Callout.jsx`
- Create: `app/frontend/components/manual/SideNote.jsx`
- Create: `app/frontend/components/manual/MaterialList.jsx` (exports `MaterialList` and `Material`)
- Create: `app/frontend/components/manual/Steps.jsx`
- Create: `app/frontend/components/manual/Recipe.jsx`
- Create: `app/frontend/components/manual/PartDivider.jsx`

- [ ] **Step 1: Write the leaf components.** Each is a small presentational component using the palette tokens.
  - `Subheading` — renders an `<h2>` (accept optional `as="h3"`) with `font-display` styling for in-section headings.
  - `Callout` — a highlighted box (subtle bordered/tinted panel) for `Importante:` notes; children are the body.
  - `SideNote` — an aside styled as a margin note (smaller, muted).
  - `MaterialList` / `Material` — `MaterialList` renders a `<ul>`; `Material` renders an `<li>` with a bold `term` prop followed by an em-dash and its children as the description (description optional — some items are just the bold term).
  - `Steps` — renders an `<ol>` with numbered `Procedimiento` styling; children are `<li>`s.

- [ ] **Step 2: Write `Recipe.jsx`.** Props: `rendimiento` (optional), `tiempo` (optional), `children`. Renders a two-column-on-desktop layout: a sidebar showing `Rendimiento` and/or `Tiempo` (omit a field entirely when its prop is absent; render no sidebar if both absent) and the recipe body (`children`). Use responsive Tailwind (stacks on mobile).

- [ ] **Step 3: Write `PartDivider.jsx`.** Props: `image` (imported asset URL), `title`, optional `children` (intro prose for the part page). Renders the full-width divider illustration with the part title.

- [ ] **Step 4: Build a temporary demo page to verify rendering.** Temporarily edit ONE existing placeholder page — `app/frontend/pages/manual-del-color-vivo/el-origen-del-color/preparacion-de-carbonatos/receta-para-preparar-carbonato-de-calcio.jsx` — to compose `Recipe`, `Steps`, `SideNote`, and `Callout` with the real page-19–20 content (this page gets transcribed for real in Phase B anyway, so the work is not wasted). Import components from `@/components/manual/...`.

- [ ] **Step 5: Verify the production SSR build passes** (this compiles JSX and catches import/JSX errors):
  ```bash
  env PATH="/Users/grillermo/.rbenv/shims:$PATH" RAILS_ENV=production NODE_ENV=production bin/vite build --clear
  env PATH="/Users/grillermo/.rbenv/shims:$PATH" RAILS_ENV=production NODE_ENV=production bin/vite build --ssr
  ```
  Expected: both builds succeed with no errors.

- [ ] **Step 6: Browser-verify the demo page.** Use the authenticated browser flow (see "Authenticated browser check" below) to load `/manual-del-color-vivo/el-origen-del-color/preparacion-de-carbonatos/receta-para-preparar-carbonato-de-calcio` and confirm the recipe sidebar, steps, side note, and callout render correctly and on-brand.

- [ ] **Step 7: Commit.**
  ```bash
  git add app/frontend/components/manual/ app/frontend/pages/manual-del-color-vivo/el-origen-del-color/preparacion-de-carbonatos/receta-para-preparar-carbonato-de-calcio.jsx
  git commit -m "Add manual content component kit and first recipe page"
  ```

### Chunk 1 exit criteria
- Content map exists with 87 rows.
- All divider and atlas images extracted, optimized, visually confirmed, committed.
- Component kit renders (SSR build green, one real recipe page verified in-browser).

---

## Transcription Procedure (used by Chunks 2–7)

This is the repeatable loop for turning one TOC node into a real page. It is **not** a code-logic task, so it uses browser/build verification rather than unit tests.

For each slug in a phase's checklist:

1. **Locate the source.** From `docs/superpowers/plans/manual-content-map.md`, get the PDF page range for the slug. Read those PDF pages with the Read tool.
2. **Compose the page.** Open the matching page file under `app/frontend/pages/manual-del-color-vivo/…`. Replace the placeholder body (the `Contenido próximamente.` paragraph) with the **verbatim** Spanish prose, composed from the component kit:
   - Flowing paragraphs → `<p>` inside the existing `ManualLayout`.
   - In-section headings → `<Subheading>`.
   - Bold-term + em-dash bullet lists → `<MaterialList>` / `<Material term="…">`.
   - Recipes → `<Recipe rendimiento tiempo>` with `<Steps>` for `Procedimiento`.
   - `Importante:` boxes → `<Callout>`; margin notes → `<SideNote>`.
   - Keep the author's exact wording, punctuation, and accents. No summarizing or rewriting.
   - Top-level part pages (`el-origen-del-color.jsx`, etc.) use `<PartDivider>` with the imported divider asset.
3. **Preserve the `title` prop contract.** Pages receive `title` from the controller; keep passing it to `ManualLayout` (or render the part title via `PartDivider`). Do not hardcode a title that diverges from `Manual::TABLE_OF_CONTENTS`.
4. **Batch the phase, then verify once** (see phase steps): scoped grep gate + SSR build + representative browser check.

**Authenticated browser check** (reused): start the app with `./serve-dev` (four tmux panes: Rails, Vite, Solid Queue, SSR — requires a real terminal), sign in as an existing user, and navigate to the page's route (`/manual-del-color-vivo/<slug-path>`). Confirm the response is server-rendered (`data-server-rendered="true"`) and shows the real prose. If `serve-dev` is unavailable in the run context, rely on the production SSR build plus reading the page file for fidelity, and flag for a human browser pass.

---

## Chunk 2: Part I — El origen del color (Phase B)

Slugs (page-file paths relative to `app/frontend/pages/manual-del-color-vivo/`):

- [ ] `el-origen-del-color.jsx` (part page — `PartDivider`)
- [ ] `el-origen-del-color/introduccion.jsx`
- [ ] `el-origen-del-color/el-color-en-la-naturaleza.jsx`
- [ ] `el-origen-del-color/principios-del-tenido-y-extraccion-de-tintes-naturales.jsx`
- [ ] `el-origen-del-color/materiales-y-herramientas.jsx`
- [ ] `el-origen-del-color/herramientas-basicas.jsx`
- [ ] `el-origen-del-color/herramientas-basicas/materiales-para-tenir.jsx`
- [ ] `el-origen-del-color/herramientas-basicas/materiales-para-tenir-con-indigo.jsx`
- [ ] `el-origen-del-color/herramientas-basicas/materiales-para-extraer-pigmentos.jsx`
- [ ] `el-origen-del-color/herramientas-basicas/materiales-para-preparar-pintura-y-aglutinantes.jsx`
- [ ] `el-origen-del-color/medidas-de-seguridad.jsx`
- [ ] `el-origen-del-color/preparacion-de-carbonatos.jsx`
- [ ] `el-origen-del-color/preparacion-de-carbonatos/receta-para-preparar-carbonato-de-calcio.jsx` (done in A4 — verify only)
- [ ] `el-origen-del-color/preparacion-de-carbonatos/receta-para-preparar-carbonato-de-sodio.jsx`

**Phase steps:**

- [ ] **Step 1: Transcribe every slug above** using the Transcription Procedure.
- [ ] **Step 2: Kit-revision checkpoint.** This is the first real phase — if a structure appears that the kit does not cover (e.g. a recipe field like `Dificultad`, a new callout variant), extend the kit now, rebuild, and note the change. Later phases inherit the settled kit.
- [ ] **Step 3: Scoped placeholder gate.**
  ```bash
  grep -rl "Contenido próximamente" app/frontend/pages/manual-del-color-vivo/el-origen-del-color* ; echo "exit: $?"
  ```
  Expected: no file paths printed (grep exit `1`).
- [ ] **Step 4: SSR build passes** (both `bin/vite build` commands above).
- [ ] **Step 5: Browser-verify** 2–3 representative pages (a prose page, a material-list page, the carbonato-de-sodio recipe).
- [ ] **Step 6: Commit.**
  ```bash
  git add app/frontend/pages/manual-del-color-vivo/el-origen-del-color
  git commit -m "Transcribe Part I: El origen del color"
  ```

---

## Chunk 3: Part II — Color sobre fibra (Phase C)

Largest phase (many recipes and nested modifiers). Slugs under `color-sobre-fibra/`:

- [ ] `color-sobre-fibra.jsx` (part page — `PartDivider`)
- [ ] `color-sobre-fibra/elegir-el-textil.jsx`
- [ ] `color-sobre-fibra/guia-de-lavado.jsx`
- [ ] `color-sobre-fibra/guia-de-lavado/lavado-simple.jsx`
- [ ] `color-sobre-fibra/guia-de-lavado/descrudado.jsx`
- [ ] `color-sobre-fibra/guia-de-mordentado.jsx`
- [ ] `color-sobre-fibra/guia-de-mordentado/mordientes.jsx`
- [ ] `color-sobre-fibra/guia-de-mordentado/receta-para-mordentar.jsx`
- [ ] `color-sobre-fibra/guia-de-tenido.jsx`
- [ ] `color-sobre-fibra/consejos-para-tenir-ropa.jsx`
- [ ] `color-sobre-fibra/modificadores-y-tratamientos-de-color.jsx`
- [ ] `color-sobre-fibra/modificadores-y-tratamientos-de-color/acido-tanico.jsx`
- [ ] `color-sobre-fibra/modificadores-y-tratamientos-de-color/acido-tanico/receta-de-pretratamiento-con-taninos.jsx`
- [ ] `color-sobre-fibra/modificadores-y-tratamientos-de-color/sulfato-ferroso.jsx`
- [ ] `color-sobre-fibra/modificadores-y-tratamientos-de-color/sulfato-ferroso/receta-de-bano-modificador-con-sulfato-ferroso.jsx`
- [ ] `color-sobre-fibra/modificadores-y-tratamientos-de-color/dibujos-con-sulfato-ferroso.jsx`
- [ ] `color-sobre-fibra/modificadores-y-tratamientos-de-color/acido-citrico.jsx`
- [ ] `color-sobre-fibra/modificadores-y-tratamientos-de-color/acido-citrico/receta-para-moditicar-el-color-de-un-tinte-con-acido-citrico.jsx` (note: `moditicar` is the shipped slug typo — do not "fix" it)
- [ ] `color-sobre-fibra/modificadores-y-tratamientos-de-color/acido-citrico/dibujos-con-acido-citrico.jsx`
- [ ] `color-sobre-fibra/modificadores-y-tratamientos-de-color/acido-citrico/reservas-en-negativo-con-acido-citrico.jsx`
- [ ] `color-sobre-fibra/modificadores-y-tratamientos-de-color/carbonato-de-calcio.jsx`
- [ ] `color-sobre-fibra/modificadores-y-tratamientos-de-color/carbonato-de-calcio/receta-para-modificar-el-color-de-un-tinte-con-carbonato-de-calcio.jsx`
- [ ] `color-sobre-fibra/modificadores-y-tratamientos-de-color/carbonato-de-calcio/receta-de-bano-intensificador-con-carbonato-de-calcio.jsx`
- [ ] `color-sobre-fibra/modificadores-y-tratamientos-de-color/leche-de-soya.jsx`
- [ ] `color-sobre-fibra/modificadores-y-tratamientos-de-color/leche-de-soya/receta-de-leche-de-soya-casera.jsx`
- [ ] `color-sobre-fibra/modificadores-y-tratamientos-de-color/leche-de-soya/receta-para-pretratamiento-con-leche-de-soya.jsx`
- [ ] `color-sobre-fibra/tenir-con-plantas.jsx`
- [ ] `color-sobre-fibra/tenir-con-plantas/recomendaciones-antes-de-tenir.jsx`
- [ ] `color-sobre-fibra/tenir-con-plantas/receta-general-para-tenir-con-plantas.jsx`
- [ ] `color-sobre-fibra/tenir-con-plantas/receta-para-tenir-con-cascara-de-granada.jsx`
- [ ] `color-sobre-fibra/tenir-con-plantas/receta-para-tenir-con-palo-de-campeche.jsx`
- [ ] `color-sobre-fibra/tenir-con-plantas/receta-para-tenir-con-rubia.jsx`
- [ ] `color-sobre-fibra/tenir-con-grana-cochinilla.jsx`
- [ ] `color-sobre-fibra/tenir-con-grana-cochinilla/guia-basica-para-tenir-con-grana-cochinilla.jsx`
- [ ] `color-sobre-fibra/tenir-con-indigo.jsx`
- [ ] `color-sobre-fibra/tenir-con-indigo/receta-de-tinte-de-indigo-con-fructosa.jsx`
- [ ] `color-sobre-fibra/tenir-con-indigo/receta-de-tinte-de-indigo-con-sulfato-ferroso.jsx`
- [ ] `color-sobre-fibra/tenir-con-indigo/resolucion-de-problemas-al-tenir-con-indigo.jsx`
- [ ] `color-sobre-fibra/tenir-con-indigo/pasta-de-resistencia-para-indigo.jsx`
- [ ] `color-sobre-fibra/retenido.jsx`
- [ ] `color-sobre-fibra/impresion-botanica.jsx`
- [ ] `color-sobre-fibra/hapa-zome.jsx`
- [ ] `color-sobre-fibra/tinta-textil.jsx`
- [ ] `color-sobre-fibra/guia-de-cuidados.jsx`

**Phase steps:** identical shape to Chunk 2 —
- [ ] Transcribe every slug above (Transcription Procedure).
- [ ] Scoped placeholder gate: `grep -rl "Contenido próximamente" app/frontend/pages/manual-del-color-vivo/color-sobre-fibra* ; echo "exit: $?"` → no paths. (The trailing `*` also covers the sibling `color-sobre-fibra.jsx` part page, which lives outside the directory.)
- [ ] SSR build passes.
- [ ] Browser-verify representative pages (a nested modifier recipe, the índigo recipes, a prose guide).
- [ ] Commit: `git commit -m "Transcribe Part II: Color sobre fibra"`.

---

## Chunk 4: Part III — Pigmento y polvo (Phase D)

- [ ] `pigmento-y-polvo.jsx` (part page — `PartDivider`)
- [ ] `pigmento-y-polvo/pigmentos-de-laca.jsx`
- [ ] `pigmento-y-polvo/azul-maya.jsx`
- [ ] `pigmento-y-polvo/cernir-pigmentos-minerales.jsx`

**Phase steps:** Transcribe → scoped grep (`…/pigmento-y-polvo*`, trailing `*` to cover the sibling part page) → SSR build → browser-verify → commit `"Transcribe Part III: Pigmento y polvo"`.

---

## Chunk 5: Part IV — Color en movimiento (Phase E)

- [ ] `color-en-movimiento.jsx` (part page — `PartDivider`)
- [ ] `color-en-movimiento/recomendaciones-generales.jsx`
- [ ] `color-en-movimiento/tempera.jsx`
- [ ] `color-en-movimiento/tempera-grasa.jsx`
- [ ] `color-en-movimiento/pintura-textil.jsx`
- [ ] `color-en-movimiento/aglutinante-para-pastillas-de-acuarela.jsx`
- [ ] `color-en-movimiento/gouache.jsx`
- [ ] `color-en-movimiento/pasteles.jsx`
- [ ] `color-en-movimiento/pasteles/receta-para-pastel-suave.jsx`
- [ ] `color-en-movimiento/pasteles/receta-para-pastel-al-oleo.jsx`

**Phase steps:** Transcribe → scoped grep (`…/color-en-movimiento*`, trailing `*` to cover the sibling part page) → SSR build → browser-verify → commit `"Transcribe Part IV: Color en movimiento"`.

---

## Chunk 6: Part V — Color cotidiano (Phase F)

- [ ] `color-cotidiano.jsx` (part page — `PartDivider`)
- [ ] `color-cotidiano/crayones.jsx`
- [ ] `color-cotidiano/gises.jsx`
- [ ] `color-cotidiano/tinta-botanica.jsx`
- [ ] `color-cotidiano/tinta-ferrogalica.jsx`
- [ ] `color-cotidiano/tinta-a-base-de-alcohol.jsx`
- [ ] `color-cotidiano/papel-artesanal-coloreado.jsx`
- [ ] `color-cotidiano/antotipia-con-curcuma.jsx`
- [ ] `color-cotidiano/velas.jsx`
- [ ] `color-cotidiano/envoltorios-de-cera-de-abeja.jsx`
- [ ] `color-cotidiano/masa-moldeable.jsx`
- [ ] `color-cotidiano/huevos-de-pascua.jsx`

**Phase steps:** Transcribe → scoped grep (`…/color-cotidiano*`, trailing `*` to cover the sibling part page) → SSR build → browser-verify → commit `"Transcribe Part V: Color cotidiano"`.

---

## Chunk 7: Atlas, Epílogo, Glosario + final gate (Phase G)

### Task G1: Transcribe the three remaining top-level sections

- [ ] `atlas-del-color.jsx` — render the sequence of optimized `atlas-*.jpg` images from `@/assets/manual/`, each as a full-width figure, in page order. Include the section title via `ManualLayout`.
- [ ] `epilogo.jsx` — verbatim prose (Transcription Procedure).
- [ ] `glosario.jsx` — verbatim term list; use `<MaterialList>`/`<Material term>` (bold term + definition) or `<dl>` as fits the source.

### Task G2: Global placeholder RSpec gate (TDD — introduced now, when it can pass)

**Files:**
- Create: `spec/manual_content_spec.rb`

- [ ] **Step 1: Write the failing test first** (before confirming all pages are done, so it genuinely gates):
  ```ruby
  require "rails_helper"

  RSpec.describe "Manual content completeness" do
    pages_dir = Rails.root.join("app/frontend/pages/manual-del-color-vivo")

    it "has replaced every placeholder body with real content" do
      offenders = Dir.glob(pages_dir.join("**/*.jsx")).select do |path|
        File.read(path).include?("Contenido próximamente")
      end
      expect(offenders).to be_empty,
        "Pages still holding placeholder text:\n#{offenders.join("\n")}"
    end
  end
  ```

- [ ] **Step 2: Run it.**
  ```bash
  env PATH="/Users/grillermo/.rbenv/shims:$PATH" bundle exec rspec spec/manual_content_spec.rb
  ```
  Expected: PASS (all 87 pages filled by now). If it FAILS, it prints the exact remaining files — go finish them, do not weaken the test.

- [ ] **Step 3: Full suite + builds green.**
  ```bash
  env PATH="/Users/grillermo/.rbenv/shims:$PATH" bundle exec rspec
  env PATH="/Users/grillermo/.rbenv/shims:$PATH" RAILS_ENV=production NODE_ENV=production bin/vite build --clear
  env PATH="/Users/grillermo/.rbenv/shims:$PATH" RAILS_ENV=production NODE_ENV=production bin/vite build --ssr
  ```
  Expected: all green.

- [ ] **Step 4: Browser-verify** the Atlas page (images legible, in order), Epílogo, and Glosario.

- [ ] **Step 5: Commit.**
  ```bash
  git add app/frontend/pages/manual-del-color-vivo/atlas-del-color.jsx app/frontend/pages/manual-del-color-vivo/epilogo.jsx app/frontend/pages/manual-del-color-vivo/glosario.jsx spec/manual_content_spec.rb
  git commit -m "Transcribe Atlas, Epilogo, Glosario and add completeness gate"
  ```

### Task G3: Update HANDOFF.md

- [ ] Mark "Manual content authoring pass" complete in `HANDOFF.md`, note the obscurity decision and the completeness gate, and commit.

### Chunk 7 exit criteria
- `spec/manual_content_spec.rb` passes → zero placeholders remain across all 87 pages.
- Full RSpec suite green; client + SSR production builds pass.
- Atlas/Epílogo/Glosario verified in browser.

---

## Done when
- All 87 pages hold verbatim prose composed from the component kit.
- Part dividers and Atlas images render on their pages.
- `spec/manual_content_spec.rb` and the full suite pass; both production builds pass.
- `HANDOFF.md` updated.
