# Phase 2c: Manual del Color Vivo as an SSR Webpage — Design

## Context

`comunidad-antesis` promotes the Spanish-language ebook *Manual del Color
Vivo* by Anabel Torres Chávez (natural dyes, pigments, paints). Phases
delivered so far: Phase 1 (Rails 8 skeleton — Postgres unified schema, Solid
Queue/Cache, RSpec, Inertia+React 19+Vite+Tailwind v4, `/health`), Phase 2a
(public landing page + `NewsletterEmail` capture), Phase 2b (Devise
username/password login, no self-registration, roles Admin/Commenter/Viewer,
RailsAdmin at `/antesis-admin`, `InertiaController` shares `Current.user`).

This spec covers **Phase 2c only**: turning the ebook into an authenticated,
server-side-rendered set of web pages — one URL per entry in the book's
*Contenido* (table of contents).

Source spec: `docs/initial-prompt.md`. The ebook PDF lives at
`project/MaquetaCompleta-ManualDelColorVivo-VER1 (1).pdf` (136 pages,
gitignored — local-only). The table-of-contents structure has been captured
into `project/sections.txt` (also gitignored).

## Goals

- One authenticated route + React page per *Contenido* entry, nested to
  mirror the book's outline (URL depth = outline indentation).
- A `/manual-del-color-vivo` index page (the "Contenido") linking to every
  page, grouped by part.
- All pages **server-side rendered** via Inertia Rails SSR — this phase adds
  the app's first long-running Node service beyond the Vite dev server.
- **Proof of concept, this phase:** every route resolves and returns HTTP 200
  for an authenticated user; the React pages are created but intentionally
  empty of prose.

## Out of scope (deferred)

- **Transcribing the PDF's prose** into the page bodies. This phase creates
  empty page components; a later content-authoring pass fills them. The book
  index/structure is read now; the book *content* is not.
- **Comments (Phase 2d).** Section pages will later anchor comments by
  path/slug (there is no `Section` model to hang a foreign key on — see
  "No models" below), but nothing comment-related is built here.
- Search, pagination, print/PDF export, prev/next in-reader navigation
  (beyond the index and a back-to-index link).

## Key decision: no models

There is **no `Ebook`, `Section`, or `Subsection` ActiveRecord model.** The
book's outline is static, so it is expressed as committed Ruby data and a set
of explicit routes + hand-authored React components. This deliberately
replaces the earlier HANDOFF sketch of an `Ebook has_many :sections` resource.

Rationale: the content is fixed and read-only; a database-backed CMS would add
migrations, an admin authoring UI, and query overhead for content that ships
in the repo and changes only when the book does. Static routes + SSR pages are
simpler to reason about, trivially cacheable, and let each page be a normal
React component authored directly.

## Table of contents as committed data

`project/sections.txt` is gitignored, so it is transcribed into a committed
source of truth: **`Manual::TABLE_OF_CONTENTS`** in `app/models/manual.rb` — a
plain Ruby module (no ActiveRecord). It is a nested tree; each node is:

```ruby
{ title: "Introducción", slug: "introduccion", children: [] }
```

Top level is the eight **parts** (each itself a node, with a `children` array):

| Part slug | Title | Source (sections.txt lines) |
|---|---|---|
| `el-origen-del-color` | El origen del color | 1–19 |
| `color-sobre-fibra` | Color sobre fibra | 21–76 |
| `pigmento-y-polvo` | Pigmento y polvo | 78–82 |
| `color-en-movimiento` | Color en movimiento | 84–98 |
| `color-cotidiano` | Color cotidiano | 99–110 |
| `atlas-del-color` | Atlas del color | (leaf) |
| `epilogo` | Epílogo | (leaf) |
| `glosario` | Glosario | (leaf) |

The part grouping was derived from the PDF's *Contenido* (pages 4–7) and the
part-divider pages (PDF pages 83/94/110/121 for parts III/IV/V and Atlas;
parts I/II begin at content pages 9/23). `sections.txt` itself contains only
the section titles with **tab-indentation encoding outline depth**; the part
grouping is applied on top when building the tree.

`atlas-del-color`, `epilogo`, and `glosario` are **leaf pages** (a part that
is itself the page, no children). The other five parts are non-leaf: they get
a part index page plus one descendant page per outline entry.

### Slug algorithm

Slugs are generated from titles: strip accents (NFKD → ASCII), `ñ`→`n`,
lowercase, collapse any run of non-`[a-z0-9]` to a single `-`, trim leading/
trailing `-`. Example: `"Guía de teñido"` → `guia-de-tenido`.

**Slugs are stable and derived from the raw `sections.txt` text.** Because
accents are stripped, the source's misspelling of *teñir* as "tenir" produces
the same slug either way. One genuine source typo survives into a slug:
`"Receta para moditicar…"` → `…/receta-para-moditicar-…`. During
transcription, obvious typos are corrected in the **`title`** (display) field,
but **slugs are frozen** as listed in the enumeration appendix so URLs never
shift. If a title correction would change a slug, keep the slug as enumerated.

### Helpers

- `Manual.walk { |node, path| ... }` — yields every node with `path`, the
  array of ancestor slugs including its own (e.g.
  `["color-sobre-fibra", "guia-de-lavado", "descrudado"]`).
- `Manual.path?(segments)` — true iff `segments` is a valid node path. Used by
  the controller to reject anything not in the tree.

## Routing

`config/routes.rb` builds the routes by iterating the tree — no wildcards:

```ruby
get "/manual-del-color-vivo", to: "manual#index", as: :manual

Manual.walk do |node, path|
  get "/manual-del-color-vivo/#{path.join('/')}",
      to: "manual#show",
      defaults: { component: path.join("/") }
end
```

- URL = `/manual-del-color-vivo/` + the joined ancestor slugs, so depth
  mirrors the book outline (up to 3 levels deep below a part).
- Each route pins `defaults: { component: "<part>/<...>/<leaf>" }`, so the
  component to render is fixed by the route, never taken from user input.
- One named `manual` route for the index; section routes are anonymous (the
  index builds hrefs from the tree, so no per-section route helpers needed).

Total: **1 index route + 87 section/part routes = 88 routes** (see appendix).

## Controller & auth

`ManualController < InertiaController` (inherits `Current.user` sharing).

- `before_action :authenticate_user!` — **any authenticated user** may read
  (Viewer, Commenter, or Admin). Anonymous visitors are redirected to login by
  Devise. No role gate beyond being signed in.
- `#index` — renders `inertia: "manual-del-color-vivo/Index"`, passing the
  `Manual::TABLE_OF_CONTENTS` tree as a `contents` prop (titles + hrefs) for
  navigation.
- `#show` — renders `inertia: "manual-del-color-vivo/#{params[:component]}"`.
  Because `component` comes from the route's `defaults` (fixed at boot, not
  from the request), it is already trusted; `#show` additionally asserts
  `Manual.path?(params[:component].split("/"))` and raises
  `ActiveRecord::RecordNotFound` (→ 404) otherwise, as defense in depth.
  Props: the node's `title` (and its part title) so the page has a heading.

## Views

Under `app/frontend/pages/manual-del-color-vivo/`, mirroring the URL tree
(Inertia resolves component `"a/b/c"` to `../pages/a/b/c.jsx`, per this app's
existing `inertia.jsx` glob at `app/frontend/pages`):

- `Index.jsx` — the *Contenido* page. Lists all parts and, nested beneath
  each, links to every descendant page. Reuses the app's Tailwind v4 `@theme`
  tokens (Fredoka/Nunito Sans, cream/orange palette) and the flat, minimal
  style established by `Landing.jsx`.
- One `<part>/<...>/<slug>.jsx` per node — a **minimal but valid** React
  component: default-exports a component that renders the section title inside
  a shared `ManualLayout`, with **no book prose** (a placeholder such as
  "Contenido próximamente" is acceptable). These must be real components so
  Inertia resolves them and SSR renders them (an empty file has no default
  export and would 500).
- `ManualLayout.jsx` (shared, colocated) — header, back-to-index link,
  consistent typography — so the later content pass only fills each page body.

These ~88 component files are **generated** during implementation from the
`Manual::TABLE_OF_CONTENTS` tree (a rake task or script that writes the stub
for any missing path), not hand-typed one by one.

## Server-side rendering (vite_ruby)

Uses vite_ruby's built-in SSR support (the app already uses `vite-plugin-ruby`
alongside `@inertiajs/vite`; this keeps one build toolchain):

- **`app/frontend/ssr/ssr.jsx`** — SSR entry:
  ```jsx
  import createServer from '@inertiajs/react/server'
  import ReactDOMServer from 'react-dom/server'
  import { createInertiaApp } from '@inertiajs/react'

  createServer((page) =>
    createInertiaApp({
      page,
      render: ReactDOMServer.renderToString,
      resolve: (name) => {
        const pages = import.meta.glob('../pages/**/*.jsx')
        return pages[`../pages/${name}.jsx`]()
      },
      setup: ({ App, props }) => <App {...props} />,
    }),
  )
  ```
- **`config/vite.json`** — enable `ssrBuildEnabled` and point `ssrEntrypoint`
  at `ssr/ssr.jsx` (add a `production` block — the file currently has only
  `all`/`development`/`test`). Verify exact key casing against the installed
  vite_ruby version during planning: a JSON-key vs. Ruby-accessor mismatch
  (`ssrBuildEnabled` ↔ `ssr_build_enabled`) fails silently, leaving SSR off.
- **`config/initializers/inertia_rails.rb`** — add
  `config.ssr_enabled = ViteRuby.config.ssr_build_enabled`.
- **`package.json`** — `build` script becomes `vite build && vite build --ssr`
  so precompile emits both browser and SSR bundles.
- **Development:** vite_ruby runs the SSR server (`bin/vite ssr`, port 13714);
  no manual build needed. **Production:** `assets:precompile` builds the SSR
  bundle, and a dedicated process runs the Node SSR server.

Rails renders the page via the SSR server and returns fully-rendered HTML;
React hydrates on the client. This is the first long-running Node service in
this app beyond the Vite dev server.

**SSR service unavailable:** if the Node SSR server is down, Inertia Rails
falls back to client-side rendering (ships the page JSON, React renders on the
client) rather than erroring. That default is acceptable here — a reader still
gets the page; only the first-paint SSR benefit is lost. No custom hard-fail
behavior is added.

## serve / serve-dev process scripts

Both are tmux-based (Phase 1 convention — no Docker/Kamal).

- **`serve-dev`** — currently 3 panes (Rails / Vite dev / Solid Queue) built
  with `split-window -h` then `-v`. Add a **4th pane** running `bin/vite ssr`
  via an explicit `split-window` targeting a named pane so the layout stays
  deterministic.
- **`serve`** — currently 2 panes (Rails / Solid Queue). `assets:precompile`
  already produces the SSR bundle (via the updated build script +
  `ssrBuildEnabled`); add a **3rd pane** (explicit split target) running the
  built Node SSR server (`bin/vite ssr`).

## Testing / verification

- **Request spec (the "all return 200" proof):** iterate `Manual.walk` (plus
  the index) and assert every route returns HTTP 200 for a signed-in user.
  This is the primary acceptance check for the phase.
- **Auth spec:** an anonymous request to a manual route redirects to login.
  Manual routes are Inertia endpoints, so the test asserts the app's
  Inertia-aware unauthenticated response (a `409` with an
  `X-Inertia-Location` header pointing at the login page, per the existing
  "Redirect failed Inertia sign-ins" behavior — not a bare `302`). An unknown
  slug (not in the tree) returns 404.
- **Model spec:** `Manual` helpers — `walk` yields exactly **87** nodes (the 5
  content parts + their descendants + the 3 leaf pages `atlas-del-color`,
  `epilogo`, `glosario`; the `/manual-del-color-vivo` index is a separate
  route, not a tree node, so the route total is 87 + 1 = 88). Paths are
  well-formed, and `path?` accepts every enumerated path and rejects invalid
  ones.
- **SSR is verified manually**, not automated: `curl` a section URL (with an
  authenticated session) and confirm the response body contains
  server-rendered markup (the section heading present in the initial HTML, not
  only injected by client JS). Recorded as a manual step in the plan.

## Appendix: full route enumeration

Index: `/manual-del-color-vivo`

```
/manual-del-color-vivo/el-origen-del-color
/manual-del-color-vivo/el-origen-del-color/introduccion
/manual-del-color-vivo/el-origen-del-color/el-color-en-la-naturaleza
/manual-del-color-vivo/el-origen-del-color/principios-del-tenido-y-extraccion-de-tintes-naturales
/manual-del-color-vivo/el-origen-del-color/materiales-y-herramientas
/manual-del-color-vivo/el-origen-del-color/herramientas-basicas
/manual-del-color-vivo/el-origen-del-color/herramientas-basicas/materiales-para-tenir
/manual-del-color-vivo/el-origen-del-color/herramientas-basicas/materiales-para-tenir-con-indigo
/manual-del-color-vivo/el-origen-del-color/herramientas-basicas/materiales-para-extraer-pigmentos
/manual-del-color-vivo/el-origen-del-color/herramientas-basicas/materiales-para-preparar-pintura-y-aglutinantes
/manual-del-color-vivo/el-origen-del-color/medidas-de-seguridad
/manual-del-color-vivo/el-origen-del-color/preparacion-de-carbonatos
/manual-del-color-vivo/el-origen-del-color/preparacion-de-carbonatos/receta-para-preparar-carbonato-de-calcio
/manual-del-color-vivo/el-origen-del-color/preparacion-de-carbonatos/receta-para-preparar-carbonato-de-sodio
/manual-del-color-vivo/color-sobre-fibra
/manual-del-color-vivo/color-sobre-fibra/elegir-el-textil
/manual-del-color-vivo/color-sobre-fibra/guia-de-lavado
/manual-del-color-vivo/color-sobre-fibra/guia-de-lavado/lavado-simple
/manual-del-color-vivo/color-sobre-fibra/guia-de-lavado/descrudado
/manual-del-color-vivo/color-sobre-fibra/guia-de-mordentado
/manual-del-color-vivo/color-sobre-fibra/guia-de-mordentado/mordientes
/manual-del-color-vivo/color-sobre-fibra/guia-de-mordentado/receta-para-mordentar
/manual-del-color-vivo/color-sobre-fibra/guia-de-tenido
/manual-del-color-vivo/color-sobre-fibra/consejos-para-tenir-ropa
/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color
/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color/acido-tanico
/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color/acido-tanico/receta-de-pretratamiento-con-taninos
/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color/sulfato-ferroso
/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color/sulfato-ferroso/receta-de-bano-modificador-con-sulfato-ferroso
/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color/dibujos-con-sulfato-ferroso
/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color/acido-citrico
/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color/acido-citrico/receta-para-moditicar-el-color-de-un-tinte-con-acido-citrico
/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color/acido-citrico/dibujos-con-acido-citrico
/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color/acido-citrico/reservas-en-negativo-con-acido-citrico
/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color/carbonato-de-calcio
/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color/carbonato-de-calcio/receta-para-modificar-el-color-de-un-tinte-con-carbonato-de-calcio
/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color/carbonato-de-calcio/receta-de-bano-intensificador-con-carbonato-de-calcio
/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color/leche-de-soya
/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color/leche-de-soya/receta-de-leche-de-soya-casera
/manual-del-color-vivo/color-sobre-fibra/modificadores-y-tratamientos-de-color/leche-de-soya/receta-para-pretratamiento-con-leche-de-soya
/manual-del-color-vivo/color-sobre-fibra/tenir-con-plantas
/manual-del-color-vivo/color-sobre-fibra/tenir-con-plantas/recomendaciones-antes-de-tenir
/manual-del-color-vivo/color-sobre-fibra/tenir-con-plantas/receta-general-para-tenir-con-plantas
/manual-del-color-vivo/color-sobre-fibra/tenir-con-plantas/receta-para-tenir-con-cascara-de-granada
/manual-del-color-vivo/color-sobre-fibra/tenir-con-plantas/receta-para-tenir-con-palo-de-campeche
/manual-del-color-vivo/color-sobre-fibra/tenir-con-plantas/receta-para-tenir-con-rubia
/manual-del-color-vivo/color-sobre-fibra/tenir-con-grana-cochinilla
/manual-del-color-vivo/color-sobre-fibra/tenir-con-grana-cochinilla/guia-basica-para-tenir-con-grana-cochinilla
/manual-del-color-vivo/color-sobre-fibra/tenir-con-indigo
/manual-del-color-vivo/color-sobre-fibra/tenir-con-indigo/receta-de-tinte-de-indigo-con-fructosa
/manual-del-color-vivo/color-sobre-fibra/tenir-con-indigo/receta-de-tinte-de-indigo-con-sulfato-ferroso
/manual-del-color-vivo/color-sobre-fibra/tenir-con-indigo/resolucion-de-problemas-al-tenir-con-indigo
/manual-del-color-vivo/color-sobre-fibra/tenir-con-indigo/pasta-de-resistencia-para-indigo
/manual-del-color-vivo/color-sobre-fibra/retenido
/manual-del-color-vivo/color-sobre-fibra/impresion-botanica
/manual-del-color-vivo/color-sobre-fibra/hapa-zome
/manual-del-color-vivo/color-sobre-fibra/tinta-textil
/manual-del-color-vivo/color-sobre-fibra/guia-de-cuidados
/manual-del-color-vivo/pigmento-y-polvo
/manual-del-color-vivo/pigmento-y-polvo/pigmentos-de-laca
/manual-del-color-vivo/pigmento-y-polvo/azul-maya
/manual-del-color-vivo/pigmento-y-polvo/cernir-pigmentos-minerales
/manual-del-color-vivo/color-en-movimiento
/manual-del-color-vivo/color-en-movimiento/recomendaciones-generales
/manual-del-color-vivo/color-en-movimiento/tempera
/manual-del-color-vivo/color-en-movimiento/tempera-grasa
/manual-del-color-vivo/color-en-movimiento/pintura-textil
/manual-del-color-vivo/color-en-movimiento/aglutinante-para-pastillas-de-acuarela
/manual-del-color-vivo/color-en-movimiento/gouache
/manual-del-color-vivo/color-en-movimiento/pasteles
/manual-del-color-vivo/color-en-movimiento/pasteles/receta-para-pastel-suave
/manual-del-color-vivo/color-en-movimiento/pasteles/receta-para-pastel-al-oleo
/manual-del-color-vivo/color-cotidiano
/manual-del-color-vivo/color-cotidiano/crayones
/manual-del-color-vivo/color-cotidiano/gises
/manual-del-color-vivo/color-cotidiano/tinta-botanica
/manual-del-color-vivo/color-cotidiano/tinta-ferrogalica
/manual-del-color-vivo/color-cotidiano/tinta-a-base-de-alcohol
/manual-del-color-vivo/color-cotidiano/papel-artesanal-coloreado
/manual-del-color-vivo/color-cotidiano/antotipia-con-curcuma
/manual-del-color-vivo/color-cotidiano/velas
/manual-del-color-vivo/color-cotidiano/envoltorios-de-cera-de-abeja
/manual-del-color-vivo/color-cotidiano/masa-moldeable
/manual-del-color-vivo/color-cotidiano/huevos-de-pascua
/manual-del-color-vivo/atlas-del-color
/manual-del-color-vivo/epilogo
/manual-del-color-vivo/glosario
```
