# Manual del Color Vivo — remaining content-fidelity work

Tracking doc for what's left after the review in
`2026-07-11-manual-content-review.html`. The 13 `<pre>`-dump pages are done
(see `2026-07-11-fixed-pages-links.html`). This covers what's left: finding
5 (fragmented lists) and finding 3 (split paragraphs) from that review.

Re-verified counts below on 2026-07-11 after the `<pre>` fixes — some files
listed in the original review are already resolved as a side effect (e.g.
`receta-general-para-tenir-con-plantas.jsx`), and a few flagged lines turned
out to be false positives (see "Not actually bugs" at the bottom).

## 1. Fragmented lists — one `<ul>` per `<li>` instead of one list

Confirmed via `ul` count == `li` count (i.e. every list has exactly one item).
Should become a single `<ul className="list-disc space-y-4 pl-6
marker:text-orange">` per logical group, or `<MaterialList>/<Material>` where
items are bold-term + em-dash style (check `guia-de-tenido.jsx` — its 8 items
are literally `"Quinonas — rojos..."`, the exact `Material` shape).

- [x] `color-sobre-fibra/retenido.jsx` — 11 fragmented `<ul>` → 2 lists (3 + 8 items)
- [x] `color-sobre-fibra/consejos-para-tenir-ropa.jsx` — 7
- [x] `color-sobre-fibra/guia-de-lavado.jsx` — 7 (also joined a sentence split mid-item across a stray `<p>`)
- [x] `color-sobre-fibra/guia-de-tenido.jsx` — 8 (→ `MaterialList`/`Material`)
- [x] `color-sobre-fibra/tenir-con-indigo/resolucion-de-problemas-al-tenir-con-indigo.jsx` — 7 (first item was intro text, moved to standalone `<p>` before the list; also joined a mid-item sentence split)
- [x] `color-sobre-fibra/guia-de-cuidados.jsx` — 6
- [x] `color-en-movimiento/recomendaciones-generales.jsx` — 4 (also joined a mid-item sentence split)
- [x] `color-sobre-fibra/tenir-con-plantas/recomendaciones-antes-de-tenir.jsx` — 3

All 8 done 2026-07-11. `bin/vite build` exits 0 (only pre-existing Bootstrap
Sass deprecation noise). Verification links:
`docs/superpowers/reviews/2026-07-11-fragmented-lists-links.html`.

Not a bug: `el-origen-del-color/medidas-de-seguridad.jsx` has 3 `<ul>` but
12 `<li>` total (grouped correctly under 3 `<Subheading>` sections) — already
fine, no action.

## 2. Sentences split across `<p>` at PDF line-wrap points

Detected via paragraphs starting with a lowercase letter. **Verify each
against the PDF before joining** — a few lowercase starts are intentional
(see false positives below), so don't blind-join without checking.

- [ ] `color-sobre-fibra/tenir-con-indigo.jsx`
- [ ] `color-sobre-fibra/tenir-con-grana-cochinilla.jsx`
- [x] `color-sobre-fibra/guia-de-cuidados.jsx` — fragmented lists fixed 2026-07-11; no split-paragraph found in this file after re-check, false positive
- [ ] `color-sobre-fibra/tenir-con-indigo/pasta-de-resistencia-para-indigo.jsx`
- [x] `color-sobre-fibra/tenir-con-indigo/resolucion-de-problemas-al-tenir-con-indigo.jsx` — fragmented lists fixed 2026-07-11, and its one mid-list split ("baño está demasiado reducido... Si" / "persiste, agrega...") joined at the same time
- [ ] `color-cotidiano/tinta-botanica.jsx`
- [ ] `color-en-movimiento/pintura-textil.jsx`
- [x] `color-sobre-fibra/guia-de-lavado.jsx` — fragmented lists fixed 2026-07-11, and its one mid-list split ("hebras no" / "se separen, pero...") joined at the same time
- [ ] `color-sobre-fibra/guia-de-mordentado/mordientes.jsx`
- [ ] `color-sobre-fibra/guia-de-tenido.jsx` — fragmented lists fixed 2026-07-11 (converted to `MaterialList`); its separate split-paragraph issue (if any, outside the list) still needs checking
- [x] `color-en-movimiento/recomendaciones-generales.jsx` — fragmented lists fixed 2026-07-11, and its one mid-list split ("estas" / "preparaciones son puntos de partida...") joined at the same time

### Not actually bugs (checked against PDF, leave as-is)

- `color-sobre-fibra/elegir-el-textil.jsx` — `<Callout>` body starts
  lowercase ("cada fibra reacciona..."), matches PDF verbatim. This book's
  `Importante:` callouts are written with a lowercase continuation after the
  bold label — same pattern as `pigmentos-de-laca.jsx`. Not a split sentence.
- `pigmento-y-polvo/pigmentos-de-laca.jsx` — same reason ("usa cubrebocas...").
- `glosario.jsx` — the one lowercase `<p>` hit is the glossary term `pH:`
  itself, not a continuation.

## 3. Styling polish (low priority)

- [ ] `glosario.jsx` — bold the 38 term names (`<strong>Término</strong> —
  definición`, matching the `Material` convention) instead of plain
  `<p>Término: definición</p>`.

## Verification checklist per batch

- [ ] `grep -rc '<ul' app/frontend/pages/manual-del-color-vivo | grep -v ':0'`
      then diff `ul` vs `li` counts per file to confirm no more 1-item lists
- [ ] `grep -rEn '<p>[a-záéíóúñ]' app/frontend/pages/manual-del-color-vivo`
      re-run and manually check each hit against `pdftotext -layout` output
      before deciding it's a real split
- [ ] `bundle exec rspec spec/manual_content_spec.rb`
- [ ] `bin/vite build` (exit 0, no errors — ignore the pre-existing Bootstrap
      Sass deprecation noise from `rails_admin`, unrelated)
- [ ] Spot-check 2–3 fixed pages in browser against the PDF for fidelity
