# Phase 2c: Manual del Color Vivo SSR Webpage — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve the ebook *Manual del Color Vivo* as ~88 authenticated, server-side-rendered web pages — one route per *Contenido* entry — with empty placeholder bodies (prose deferred to a later content pass).

**Architecture:** No ActiveRecord models. The book outline lives as a committed Ruby tree (`Manual::TABLE_OF_CONTENTS`). `routes.rb` iterates that tree to draw one explicit route per node (URL depth mirrors outline nesting), all handled by a single `ManualController` gated by `authenticate_user!`. Each node maps to a hand-generated React page under `app/frontend/pages/manual-del-color-vivo/`. Pages render through Inertia Rails SSR via vite_ruby's Node SSR server.

**Tech Stack:** Rails 8, Inertia Rails 3.21, React 19, Vite + vite-plugin-ruby 3.10 + @inertiajs/vite, Tailwind v4, RSpec, Devise.

**Spec:** `docs/superpowers/specs/2026-07-10-phase2c-manual-ssr-webpage-design.md`

**Conventions in this codebase (read before starting):**
- Inertia pages resolve from `app/frontend/pages` (`app/frontend/entrypoints/inertia.jsx` sets `pages: "../pages"`). Component name `"a/b/c"` → `app/frontend/pages/a/b/c.jsx`.
- Controllers that render Inertia inherit `InertiaController` (shares `Current.user` as the `user` prop). See `app/controllers/inertia_controller.rb`.
- Reuse Tailwind `@theme` tokens (`bg-cream`, `text-blue`, `text-blue-ink`, `text-orange-ink`, `bg-orange`, `font-display`, `font-body`) — defined in `app/frontend/entrypoints/application.css`. See `app/frontend/pages/Landing.jsx` for the flat house style.
- No FactoryBot. Tests build users with `User.create!(email:, password:)`. Devise request-spec helpers are included (`spec/support/devise.rb`) — use `sign_in user`.
- `User` roles are `commenter` (default) and `admin` only; there is no `viewer` role. The manual gate is "signed in," so role is irrelevant here.
- `project/` (the PDF and `sections.txt`) is **gitignored** — never reference it at runtime. The committed `Manual::TABLE_OF_CONTENTS` is the only source of truth in the app.
- Commits are signed via 1Password; if a commit fails with "failed to fill whole buffer", the human must unlock 1Password. Use the commit messages given here.

---

## Chunk 1: Table of contents data (`Manual`)

### Task 1: `Manual` module

**Files:**
- Create: `app/models/manual.rb`
- Test: `spec/models/manual_spec.rb`

- [ ] **Step 1: Write the failing test**

```ruby
# spec/models/manual_spec.rb
require "rails_helper"

RSpec.describe Manual do
  describe ".paths" do
    it "yields one path per node, 87 nodes total" do
      expect(Manual.paths.size).to eq(87)
    end

    it "builds ancestry paths from slugs" do
      expect(Manual.paths).to include(%w[el-origen-del-color introduccion])
      expect(Manual.paths).to include(
        %w[color-sobre-fibra modificadores-y-tratamientos-de-color acido-tanico receta-de-pretratamiento-con-taninos]
      )
    end

    it "includes the standalone leaf parts" do
      expect(Manual.paths).to include(%w[epilogo])
      expect(Manual.paths).to include(%w[glosario])
      expect(Manual.paths).to include(%w[atlas-del-color])
    end
  end

  describe ".find" do
    it "returns the node at an exact path" do
      expect(Manual.find(%w[el-origen-del-color introduccion])[:title]).to eq("Introducción")
    end

    it "returns nil for an unknown path" do
      expect(Manual.find(%w[el-origen-del-color nope])).to be_nil
    end
  end

  describe ".path?" do
    it "is true for every enumerated path and false otherwise" do
      expect(Manual.path?(%w[glosario])).to be(true)
      expect(Manual.path?(%w[glosario extra])).to be(false)
      expect(Manual.path?(%w[does-not-exist])).to be(false)
    end
  end
end
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bundle exec rspec spec/models/manual_spec.rb`
Expected: FAIL — `uninitialized constant Manual`.

- [ ] **Step 3: Write the implementation**

Create `app/models/manual.rb`. The `TABLE_OF_CONTENTS` literal below is authoritative — paste it exactly (slugs are frozen; titles carry Spanish accents with obvious source typos corrected). It has 87 nodes.

```ruby
# frozen_string_literal: true

# Static table of contents for the ebook "Manual del Color Vivo".
# No database: the book outline is fixed content, expressed as a tree and
# turned into explicit routes + React pages. Transcribed from the book's
# "Contenido" (project/sections.txt, gitignored). Slugs are STABLE — never
# change a slug once shipped, as it is also the URL and the page file path.
module Manual
  TABLE_OF_CONTENTS = [
    { title: "El origen del color", slug: "el-origen-del-color", children: [
      { title: "Introducción", slug: "introduccion", children: [] },
      { title: "El color en la naturaleza", slug: "el-color-en-la-naturaleza", children: [] },
      { title: "Principios del teñido y extracción de tintes naturales", slug: "principios-del-tenido-y-extraccion-de-tintes-naturales", children: [] },
      { title: "Materiales y herramientas", slug: "materiales-y-herramientas", children: [] },
      { title: "Herramientas básicas", slug: "herramientas-basicas", children: [
        { title: "Materiales para teñir", slug: "materiales-para-tenir", children: [] },
        { title: "Materiales para teñir con índigo", slug: "materiales-para-tenir-con-indigo", children: [] },
        { title: "Materiales para extraer pigmentos", slug: "materiales-para-extraer-pigmentos", children: [] },
        { title: "Materiales para preparar pintura y aglutinantes", slug: "materiales-para-preparar-pintura-y-aglutinantes", children: [] },
      ] },
      { title: "Medidas de seguridad", slug: "medidas-de-seguridad", children: [] },
      { title: "Preparación de carbonatos", slug: "preparacion-de-carbonatos", children: [
        { title: "Receta para preparar carbonato de calcio", slug: "receta-para-preparar-carbonato-de-calcio", children: [] },
        { title: "Receta para preparar carbonato de sodio", slug: "receta-para-preparar-carbonato-de-sodio", children: [] },
      ] },
    ] },
    { title: "Color sobre fibra", slug: "color-sobre-fibra", children: [
      { title: "Elegir el textil", slug: "elegir-el-textil", children: [] },
      { title: "Guía de lavado", slug: "guia-de-lavado", children: [
        { title: "Lavado simple", slug: "lavado-simple", children: [] },
        { title: "Descrudado", slug: "descrudado", children: [] },
      ] },
      { title: "Guía de mordentado", slug: "guia-de-mordentado", children: [
        { title: "Mordientes", slug: "mordientes", children: [] },
        { title: "Receta para mordentar", slug: "receta-para-mordentar", children: [] },
      ] },
      { title: "Guía de teñido", slug: "guia-de-tenido", children: [] },
      { title: "Consejos para teñir ropa", slug: "consejos-para-tenir-ropa", children: [] },
      { title: "Modificadores y tratamientos de color", slug: "modificadores-y-tratamientos-de-color", children: [
        { title: "Ácido tánico", slug: "acido-tanico", children: [
          { title: "Receta de pretratamiento con taninos", slug: "receta-de-pretratamiento-con-taninos", children: [] },
        ] },
        { title: "Sulfato ferroso", slug: "sulfato-ferroso", children: [
          { title: "Receta de baño modificador con sulfato ferroso", slug: "receta-de-bano-modificador-con-sulfato-ferroso", children: [] },
        ] },
        { title: "Dibujos con sulfato ferroso", slug: "dibujos-con-sulfato-ferroso", children: [] },
        { title: "Ácido cítrico", slug: "acido-citrico", children: [
          { title: "Receta para modificar el color de un tinte con ácido cítrico", slug: "receta-para-moditicar-el-color-de-un-tinte-con-acido-citrico", children: [] },
          { title: "Dibujos con ácido cítrico", slug: "dibujos-con-acido-citrico", children: [] },
          { title: "Reservas en negativo con ácido cítrico", slug: "reservas-en-negativo-con-acido-citrico", children: [] },
        ] },
        { title: "Carbonato de calcio", slug: "carbonato-de-calcio", children: [
          { title: "Receta para modificar el color de un tinte con carbonato de calcio", slug: "receta-para-modificar-el-color-de-un-tinte-con-carbonato-de-calcio", children: [] },
          { title: "Receta de baño intensificador con carbonato de calcio", slug: "receta-de-bano-intensificador-con-carbonato-de-calcio", children: [] },
        ] },
        { title: "Leche de soya", slug: "leche-de-soya", children: [
          { title: "Receta de leche de soya casera", slug: "receta-de-leche-de-soya-casera", children: [] },
          { title: "Receta para pretratamiento con leche de soya", slug: "receta-para-pretratamiento-con-leche-de-soya", children: [] },
        ] },
      ] },
      { title: "Teñir con plantas", slug: "tenir-con-plantas", children: [
        { title: "Recomendaciones antes de teñir", slug: "recomendaciones-antes-de-tenir", children: [] },
        { title: "Receta general para teñir con plantas", slug: "receta-general-para-tenir-con-plantas", children: [] },
        { title: "Receta para teñir con cáscara de granada", slug: "receta-para-tenir-con-cascara-de-granada", children: [] },
        { title: "Receta para teñir con palo de Campeche", slug: "receta-para-tenir-con-palo-de-campeche", children: [] },
        { title: "Receta para teñir con rubia", slug: "receta-para-tenir-con-rubia", children: [] },
      ] },
      { title: "Teñir con grana cochinilla", slug: "tenir-con-grana-cochinilla", children: [
        { title: "Guía básica para teñir con grana cochinilla", slug: "guia-basica-para-tenir-con-grana-cochinilla", children: [] },
      ] },
      { title: "Teñir con índigo", slug: "tenir-con-indigo", children: [
        { title: "Receta de tinte de índigo con fructosa", slug: "receta-de-tinte-de-indigo-con-fructosa", children: [] },
        { title: "Receta de tinte de índigo con sulfato ferroso", slug: "receta-de-tinte-de-indigo-con-sulfato-ferroso", children: [] },
        { title: "Resolución de problemas al teñir con índigo", slug: "resolucion-de-problemas-al-tenir-con-indigo", children: [] },
        { title: "Pasta de resistencia para índigo", slug: "pasta-de-resistencia-para-indigo", children: [] },
      ] },
      { title: "Reteñido", slug: "retenido", children: [] },
      { title: "Impresión botánica", slug: "impresion-botanica", children: [] },
      { title: "Hapa zome", slug: "hapa-zome", children: [] },
      { title: "Tinta textil", slug: "tinta-textil", children: [] },
      { title: "Guía de cuidados", slug: "guia-de-cuidados", children: [] },
    ] },
    { title: "Pigmento y polvo", slug: "pigmento-y-polvo", children: [
      { title: "Pigmentos de laca", slug: "pigmentos-de-laca", children: [] },
      { title: "Azul maya", slug: "azul-maya", children: [] },
      { title: "Cernir pigmentos minerales", slug: "cernir-pigmentos-minerales", children: [] },
    ] },
    { title: "Color en movimiento", slug: "color-en-movimiento", children: [
      { title: "Recomendaciones generales", slug: "recomendaciones-generales", children: [] },
      { title: "Tempera", slug: "tempera", children: [] },
      { title: "Tempera grasa", slug: "tempera-grasa", children: [] },
      { title: "Pintura textil", slug: "pintura-textil", children: [] },
      { title: "Aglutinante para pastillas de acuarela", slug: "aglutinante-para-pastillas-de-acuarela", children: [] },
      { title: "Gouache", slug: "gouache", children: [] },
      { title: "Pasteles", slug: "pasteles", children: [
        { title: "Receta para pastel suave", slug: "receta-para-pastel-suave", children: [] },
        { title: "Receta para pastel al óleo", slug: "receta-para-pastel-al-oleo", children: [] },
      ] },
    ] },
    { title: "Color cotidiano", slug: "color-cotidiano", children: [
      { title: "Crayones", slug: "crayones", children: [] },
      { title: "Gises", slug: "gises", children: [] },
      { title: "Tinta botánica", slug: "tinta-botanica", children: [] },
      { title: "Tinta ferrogálica", slug: "tinta-ferrogalica", children: [] },
      { title: "Tinta a base de alcohol", slug: "tinta-a-base-de-alcohol", children: [] },
      { title: "Papel artesanal coloreado", slug: "papel-artesanal-coloreado", children: [] },
      { title: "Antotipia con cúrcuma", slug: "antotipia-con-curcuma", children: [] },
      { title: "Velas", slug: "velas", children: [] },
      { title: "Envoltorios de cera de abeja", slug: "envoltorios-de-cera-de-abeja", children: [] },
      { title: "Masa moldeable", slug: "masa-moldeable", children: [] },
      { title: "Huevos de pascua", slug: "huevos-de-pascua", children: [] },
    ] },
    { title: "Atlas del color", slug: "atlas-del-color", children: [] },
    { title: "Epílogo", slug: "epilogo", children: [] },
    { title: "Glosario", slug: "glosario", children: [] },
  ].freeze

  module_function

  # Yields |node, path| for every node depth-first, where path is the array of
  # ancestor slugs including the node's own (e.g. %w[part section subsection]).
  def walk(nodes = TABLE_OF_CONTENTS, prefix = [], &block)
    nodes.each do |node|
      path = prefix + [node[:slug]]
      block.call(node, path)
      walk(node[:children], path, &block)
    end
  end

  # All node paths as arrays of slugs.
  def paths
    [].tap { |acc| walk { |_node, path| acc << path } }
  end

  # The node at an exact slug path, or nil.
  def find(segments)
    segments = Array(segments).map(&:to_s)
    node = nil
    nodes = TABLE_OF_CONTENTS
    segments.each do |seg|
      node = nodes.find { |n| n[:slug] == seg }
      return nil if node.nil?
      nodes = node[:children]
    end
    node
  end

  # True iff segments is a valid, complete node path.
  def path?(segments)
    !find(segments).nil?
  end
end
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bundle exec rspec spec/models/manual_spec.rb`
Expected: PASS (all examples). If the node count is not 87, the literal was altered — restore it exactly.

- [ ] **Step 5: Commit**

```bash
git add app/models/manual.rb spec/models/manual_spec.rb
git commit -m "Add Manual table-of-contents tree for Phase 2c

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Chunk 2: Routing, controller, auth

### Task 2: `ManualController` + routes

**Files:**
- Create: `app/controllers/manual_controller.rb`
- Modify: `config/routes.rb`
- Test: `spec/requests/manual_spec.rb`

- [ ] **Step 1: Write the failing request spec**

```ruby
# spec/requests/manual_spec.rb
require "rails_helper"

RSpec.describe "Manual", type: :request do
  let(:user) { User.create!(email: "reader@example.com", password: "password123") }

  it "redirects anonymous visitors to the login page" do
    # A plain request-spec GET carries no X-Inertia header, so Devise's
    # authenticate_user! issues an ordinary 302 to /users/sign_in. (A real
    # Inertia XHR visit would get Inertia's client-side redirect handling; this
    # app has no custom unauthenticated-Inertia handler, so we assert only the
    # verifiable browser-GET behavior here.)
    get "/manual-del-color-vivo"
    expect(response).to redirect_to("/users/sign_in")
  end

  it "renders the Contenido index for a signed-in user" do
    sign_in user
    get "/manual-del-color-vivo"
    expect(response).to have_http_status(:ok)

    page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
    expect(page.fetch("component")).to eq("manual-del-color-vivo/Index")
    expect(page.dig("props", "contents")).to be_an(Array)
  end

  it "renders every section route with 200 and the correct component" do
    sign_in user
    Manual.walk do |node, path|
      url = "/manual-del-color-vivo/#{path.join('/')}"
      get url
      expect(response).to have_http_status(:ok), "expected 200 for #{url}, got #{response.status}"

      page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
      expect(page.fetch("component")).to eq("manual-del-color-vivo/#{path.join('/')}")
      expect(page.dig("props", "title")).to eq(node[:title])
    end
  end

  it "returns 404 for an unknown slug" do
    sign_in user
    # No route is drawn for unknown slugs; Rails' router raises
    # ActionController::RoutingError, which the test env (show_exceptions =
    # :rescuable, see config/environments/test.rb) renders as a 404 response
    # rather than propagating the exception. So assert on the status, not raise_error.
    get "/manual-del-color-vivo/does-not-exist"
    expect(response).to have_http_status(:not_found)
  end
end
```

- [ ] **Step 2: Run to verify it fails**

Run: `bundle exec rspec spec/requests/manual_spec.rb`
Expected: FAIL — no route matches `/manual-del-color-vivo`.

- [ ] **Step 3: Add the controller**

```ruby
# app/controllers/manual_controller.rb
# frozen_string_literal: true

# Serves the static ebook pages. No models: routes are drawn from
# Manual::TABLE_OF_CONTENTS in config/routes.rb, and each route pins the
# component to render via its `component` default (never user input).
class ManualController < InertiaController
  before_action :authenticate_user!

  def index
    render inertia: "manual-del-color-vivo/Index", props: {
      contents: Manual::TABLE_OF_CONTENTS
    }
  end

  def show
    segments = params[:component].split("/")
    node = Manual.find(segments)
    raise ActiveRecord::RecordNotFound unless node

    render inertia: "manual-del-color-vivo/#{params[:component]}", props: {
      title: node[:title]
    }
  end
end
```

- [ ] **Step 4: Draw the routes**

In `config/routes.rb`, add (place after `root "landing#index"`, before the `newsletter_emails` line):

```ruby
  get "/manual-del-color-vivo", to: "manual#index", as: :manual
  Manual.walk do |_node, path|
    get "/manual-del-color-vivo/#{path.join('/')}",
        to: "manual#show",
        defaults: { component: path.join("/") }
  end
```

Note: this references the `Manual` constant at route-load time. It autoloads fine (Zeitwerk resolves `app/models/manual.rb`). The `component` default contains slashes; `params[:component]` will be the full `"part/section/..."` string.

- [ ] **Step 5: Run to verify it passes**

Run: `bundle exec rspec spec/requests/manual_spec.rb`
Expected: PASS. The "every section route" example makes 87 requests and asserts 200 + component + title on each. (SSR is off in the test env, so these 200s come from the standard Inertia HTML shell; the matching page files are verified separately in Task 4.)

- [ ] **Step 6: Verify the full suite still green**

Run: `bundle exec rspec`
Expected: all prior examples still pass (14 + the new ones).

- [ ] **Step 7: Commit**

```bash
git add app/controllers/manual_controller.rb config/routes.rb spec/requests/manual_spec.rb
git commit -m "Add authenticated routes and controller for the manual

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Chunk 3: Views (layout, index, generated stubs)

### Task 3: Vite `@` alias, `ManualLayout`, `Index` page

**Files:**
- Modify: `vite.config.ts`
- Create: `app/frontend/components/ManualLayout.jsx`
- Create: `app/frontend/pages/manual-del-color-vivo/Index.jsx`

- [ ] **Step 1: Add an `@` → `app/frontend` alias to Vite**

Replace `vite.config.ts` with:

```ts
import react from '@vitejs/plugin-react'
import inertia from '@inertiajs/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app/frontend', import.meta.url)),
    },
  },
  plugins: [
    tailwindcss(),
    RubyPlugin(),
    inertia(),
    react(),
  ],
})
```

This lets the deeply-nested stub pages import the shared layout as `@/components/ManualLayout` regardless of their folder depth. Vite applies the alias in both the browser and SSR builds.

- [ ] **Step 2: Create the shared layout**

```jsx
// app/frontend/components/ManualLayout.jsx
import { Link } from '@inertiajs/react'

// Shared wrapper for every manual section page. Bodies are filled in a later
// content pass; for now pages pass only a title and a placeholder body.
export default function ManualLayout({ title, children }) {
  return (
    <main className="min-h-screen bg-cream font-body text-blue-ink">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/manual-del-color-vivo" className="font-display text-sm font-semibold text-orange-ink">
          ← Contenido
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-blue">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Create the Contenido index page**

```jsx
// app/frontend/pages/manual-del-color-vivo/Index.jsx
import { Link } from '@inertiajs/react'

function NodeList({ nodes, prefix }) {
  return (
    <ul className="mt-2 space-y-1 border-l border-blue/15 pl-4">
      {nodes.map((node) => {
        const href = `${prefix}/${node.slug}`
        return (
          <li key={href}>
            <Link href={href} className="text-blue hover:text-orange">
              {node.title}
            </Link>
            {node.children.length > 0 && <NodeList nodes={node.children} prefix={href} />}
          </li>
        )
      })}
    </ul>
  )
}

export default function Index({ contents }) {
  return (
    <main className="min-h-screen bg-cream font-body text-blue-ink">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-orange-ink">
          Manual del Color Vivo
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-blue">Contenido</h1>
        <div className="mt-8">
          <NodeList nodes={contents} prefix="/manual-del-color-vivo" />
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts app/frontend/components/ManualLayout.jsx app/frontend/pages/manual-del-color-vivo/Index.jsx
git commit -m "Add manual layout, Contenido index page, and @ Vite alias

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

### Task 4: Generate the 87 placeholder page stubs

**Files:**
- Create: `lib/tasks/manual.rake`
- Create (generated): `app/frontend/pages/manual-del-color-vivo/**/*.jsx` (87 files)
- Test: `spec/models/manual_pages_spec.rb`

- [ ] **Step 1: Write the failing test that every path has a page file**

```ruby
# spec/models/manual_pages_spec.rb
require "rails_helper"

RSpec.describe "Manual page files" do
  it "has a React page file for every node path" do
    root = Rails.root.join("app/frontend/pages/manual-del-color-vivo")
    missing = Manual.paths.reject { |path| root.join("#{path.join('/')}.jsx").exist? }
    expect(missing).to be_empty, "missing page files for: #{missing.map { |p| p.join('/') }.join(', ')}"
  end
end
```

- [ ] **Step 2: Run to verify it fails**

Run: `bundle exec rspec spec/models/manual_pages_spec.rb`
Expected: FAIL — 87 missing page files.

- [ ] **Step 3: Write the generator rake task**

```ruby
# lib/tasks/manual.rake
namespace :manual do
  desc "Generate placeholder Inertia page stubs for every Manual section (idempotent)"
  task generate_stubs: :environment do
    root = Rails.root.join("app/frontend/pages/manual-del-color-vivo")
    template = <<~JSX
      import ManualLayout from '@/components/ManualLayout'

      // Placeholder page. Prose is transcribed in a later content pass.
      export default function Page({ title }) {
        return (
          <ManualLayout title={title}>
            <p className="text-blue-ink/60">Contenido próximamente.</p>
          </ManualLayout>
        )
      }
    JSX

    created = 0
    Manual.walk do |_node, path|
      file = root.join("#{path.join('/')}.jsx")
      next if file.exist?
      FileUtils.mkdir_p(file.dirname)
      File.write(file, template)
      created += 1
    end
    puts "Created #{created} stub(s); #{Manual.paths.size} paths total."
  end
end
```

- [ ] **Step 4: Run the generator**

Run: `bin/rails manual:generate_stubs`
Expected output: `Created 87 stub(s); 87 paths total.`

- [ ] **Step 5: Run to verify the test passes**

Run: `bundle exec rspec spec/models/manual_pages_spec.rb`
Expected: PASS.

- [ ] **Step 6: Commit the generator and the generated stubs**

```bash
git add lib/tasks/manual.rake spec/models/manual_pages_spec.rb app/frontend/pages/manual-del-color-vivo
git commit -m "Generate placeholder page stubs for every manual section

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Chunk 4: Server-side rendering + process scripts

Enable Inertia SSR through vite_ruby's Node SSR server and wire it into the tmux `serve`/`serve-dev` scripts.

Reference: `docs/superpowers/specs/2026-07-10-phase2c-manual-ssr-webpage-design.md` §"Server-side rendering". Key facts verified against the installed gems:
- vite_ruby 3.10 default `ssrEntrypoint` is `~/ssr/ssr.{js,ts,jsx,tsx}` (`~` = `app/frontend`) and default `ssrOutputDir` is `public/vite-ssr`. So the entry file must be `app/frontend/ssr/ssr.jsx`; no entrypoint/output config needed.
- `bin/vite ssr` runs `node public/vite-ssr/ssr.js` — it requires a prior `bin/vite build --ssr` (or an `assets:precompile` that built the SSR bundle).
- inertia_rails posts to `http://localhost:13714/render` by default; `@inertiajs/react/server`'s `createServer` listens on `13714` by default. They already match — no `ssr_url`/port config needed.
- `assets:precompile` is enhanced by vite_ruby to run `vite:build_all`, which **also builds the SSR bundle when `ssr_build_enabled` is true**. Because `serve` runs with `RAILS_ENV=production` and the `production` block sets `ssrBuildEnabled: true`, precompile already produces `public/vite-ssr/ssr.js` — no separate SSR build command is needed in `serve`.
- If the SSR server is down/unbuilt, `inertia_rails` rescues the failed call and falls back to client-side rendering (still HTTP 200). SSR being off in the `test` env is therefore fine — request specs stay green.

### Task 5: SSR entrypoint + config

**Files:**
- Create: `app/frontend/ssr/ssr.jsx`
- Modify: `config/vite.json`
- Modify: `config/initializers/inertia_rails.rb`

- [ ] **Step 1: Create the SSR entrypoint**

```jsx
// app/frontend/ssr/ssr.jsx
import createServer from '@inertiajs/react/server'
import { createInertiaApp } from '@inertiajs/react'
import ReactDOMServer from 'react-dom/server'

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

Do NOT import `application.css` here (SSR runs in Node; the CSS is delivered by the client bundle). The `../pages` glob is relative to this file's `ssr/` directory, i.e. `app/frontend/pages` — the same page set the browser resolves.

- [ ] **Step 2: Enable the SSR build in `config/vite.json`**

Add `ssrBuildEnabled` to `development` and add a `production` block. Leave `test` untouched (SSR stays off in tests — keeps the suite fast and avoids a per-request call to a non-running server). Result:

```json
{
  "all": {
    "sourceCodeDir": "app/frontend",
    "watchAdditionalPaths": []
  },
  "development": {
    "autoBuild": true,
    "skipProxy": true,
    "publicOutputDir": "vite-dev",
    "port": 3036,
    "ssrBuildEnabled": true
  },
  "test": {
    "autoBuild": true,
    "publicOutputDir": "vite-test",
    "port": 3037
  },
  "production": {
    "ssrBuildEnabled": true
  }
}
```

- [ ] **Step 3: Enable SSR in the Inertia initializer**

In `config/initializers/inertia_rails.rb`, add inside the `configure` block:

```ruby
  config.ssr_enabled = ViteRuby.config.ssr_build_enabled
```

- [ ] **Step 4: Verify SSR renders on the server (manual)**

```bash
bin/vite build --ssr          # builds public/vite-ssr/ssr.js
bin/vite ssr &                # starts the Node SSR server on :13714
# In another shell, boot Rails in development and sign in, then:
#   curl -s http://localhost:3000/manual-del-color-vivo | grep -c "Contenido"
# Expect the section heading text to appear in the RAW HTML (server-rendered),
# not only after client JS runs. Stop the background SSR server when done:
kill %1
```

Expected: the heading (e.g. `Contenido`) is present in the curl output. (Because unauthenticated requests redirect, either script a signed-in session cookie or perform this check against `./serve` after Task 6 with a logged-in browser + "View Source".)

- [ ] **Step 5: Commit**

```bash
git add app/frontend/ssr/ssr.jsx config/vite.json config/initializers/inertia_rails.rb
git commit -m "Enable Inertia SSR via vite_ruby Node server

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

### Task 6: Run the SSR server in `serve` and `serve-dev`

**Files:**
- Modify: `serve`
- Modify: `serve-dev`

- [ ] **Step 1: Add an SSR pane to `serve-dev`**

`serve-dev` currently builds 3 panes (Rails / Vite dev / Solid Queue). Add a 4th pane that builds the SSR bundle once and runs the Node SSR server. After the existing `split-window -v` line, add another split targeting the main window, and add the send-keys block:

```bash
# (add near the other split-window calls)
tmux split-window -v -t "$SESSION:main"

# Pane 4: Inertia SSR server (build once, then serve on :13714)
tmux send-keys -t "$SESSION:main.4" "source .env 2>/dev/null; bin/vite build --ssr && bin/vite ssr" C-m
```

Note for the implementer: tmux pane numbering after multiple splits can be non-obvious. After adding the split, run `tmux select-layout -t "$SESSION:main" tiled` (add this line before `tmux attach`) to get a clean, deterministic 4-pane grid, and confirm pane `.4` is the SSR pane. In development, editing a page's `.jsx` requires re-running the SSR build for the change to appear in server-rendered HTML (client HMR still updates the browser live); this is acceptable for placeholder pages.

- [ ] **Step 2: Add an SSR pane to `serve`**

`serve` currently builds 2 panes (Rails / Solid Queue). The existing `bin/rails assets:precompile` already builds the SSR bundle in production (via `vite:build_all` + `ssrBuildEnabled`), so no extra build command is needed — just add a 3rd pane running the SSR server:

```bash
# (after the existing `tmux split-window -h`)
tmux split-window -v -t "$SESSION:main"
tmux select-layout -t "$SESSION:main" tiled

# Pane 3: Inertia SSR server (bundle already built by assets:precompile)
tmux send-keys -t "$SESSION:main.3" "source .env 2>/dev/null; bin/vite ssr" C-m
```

- [ ] **Step 3: Manually verify both scripts boot 4/3 panes**

Run: `shellcheck serve serve-dev`
Expected: no new errors.

Then (optional live check): `./serve-dev`, confirm 4 panes come up, the SSR pane prints a build then "Inertia SSR server started" (or similar) on port 13714, and `/manual-del-color-vivo` renders. `Ctrl-b &` to kill the session, or `tmux kill-session -t comunidad-antesis`.

- [ ] **Step 4: Commit**

```bash
git add serve serve-dev
git commit -m "Run the Inertia SSR server in serve and serve-dev

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Final verification

- [ ] `bundle exec rspec` — all green (Manual model, manual request specs incl. the 87-route 200 sweep, page-file existence, plus the pre-existing 14).
- [ ] `bin/rails manual:generate_stubs` prints `Created 0 stub(s); 87 paths total.` (idempotent — no new files on a second run).
- [ ] Manual SSR check (Task 5 Step 4) confirms server-rendered HTML.
- [ ] `git status` clean.

## Out of scope (do NOT do here)

- Transcribing PDF prose into the page bodies — a separate later content pass. Pages stay at "Contenido próximamente."
- Comments (Phase 2d).
- Prev/next in-reader navigation, search, print/export.
