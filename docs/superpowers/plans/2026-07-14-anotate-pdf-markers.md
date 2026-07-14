# /anotate PDF Marker Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin-only `/anotate` page rendering `data/manual.pdf` as scrollable page images where long-press places a persistent "pregúntarle a la autora" marker (draggable until release) and tapping a marker deletes it.

**Architecture:** Rails 8 + Inertia React. `PdfMarker` model stores page + fractional x/y. `ManualPdfPages` service shells out to `pdftoppm` per page, disk-caches PNGs in `tmp/manual_pages/`. Admin gating via routes-level `authenticate` block (same pattern as RailsAdmin mount). Frontend is one Inertia page `Anotate.jsx` using pointer events; marker CRUD via plain `fetch` JSON endpoints.

**Tech Stack:** Rails 8.0.5, Ruby 3.4, PostgreSQL, Inertia Rails, React 19, Tailwind CSS 4, RSpec + FactoryBot, poppler's `pdftoppm`.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-14-anotate-pdf-markers-design.md`.
- Marker text is exactly `pregúntarle a la autora`, underlined.
- PDF facts (from `pdfinfo data/manual.pdf`): 136 pages, page size 396.85 × 612.283 pts.
- Coordinates stored as fractions 0..1 of page width/height (PDF-point convertible later). Export is OUT OF SCOPE.
- Admin-only: anonymous → redirect to login; signed-in non-admin → 404 (Devise routes-level `authenticate` behavior, same as `/antesis-admin`).
- `pdftoppm` must exist on the deploy server (poppler). Present locally at `/opt/homebrew/bin/pdftoppm`.
- Run `bin/rubocop` before each commit touching Ruby files; Omakase style.
- Frontend has no JS test runner — verify with `bin/vite build` + request specs.

---

### Task 1: `PdfMarker` model

**Files:**
- Create: `db/migrate/<timestamp>_create_pdf_markers.rb` (via generator)
- Create: `app/models/pdf_marker.rb`
- Create: `spec/factories/pdf_markers.rb`
- Test: `spec/models/pdf_marker_spec.rb`

**Interfaces:**
- Consumes: nothing.
- Produces: `PdfMarker` AR model — integer `page` validated in `1..ManualPdfPages::PAGE_COUNT`, decimal `x`, `y` validated in `0..1`. This task also creates `app/services/manual_pdf_pages.rb` holding only `PAGE_COUNT = 136`; Task 2 expands that class.

- [ ] **Step 1: Generate migration**

```bash
bin/rails generate migration CreatePdfMarkers
```

Edit the generated file `db/migrate/*_create_pdf_markers.rb` to:

```ruby
class CreatePdfMarkers < ActiveRecord::Migration[8.0]
  def change
    create_table :pdf_markers do |t|
      t.integer :page, null: false
      t.decimal :x, precision: 6, scale: 5, null: false
      t.decimal :y, precision: 6, scale: 5, null: false

      t.timestamps
    end
    add_index :pdf_markers, :page
  end
end
```

Run: `bin/rails db:migrate`

- [ ] **Step 2: Write the failing model spec**

Create `spec/models/pdf_marker_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe PdfMarker, type: :model do
  it "is valid with a page in range and fractional coordinates" do
    expect(build(:pdf_marker)).to be_valid
  end

  it "rejects a missing page" do
    expect(build(:pdf_marker, page: nil)).not_to be_valid
  end

  it "rejects page 0" do
    expect(build(:pdf_marker, page: 0)).not_to be_valid
  end

  it "rejects a page beyond the manual's last page" do
    expect(build(:pdf_marker, page: ManualPdfPages::PAGE_COUNT + 1)).not_to be_valid
  end

  it "accepts the boundary coordinates 0 and 1" do
    expect(build(:pdf_marker, x: 0, y: 1)).to be_valid
  end

  it "rejects coordinates below 0" do
    expect(build(:pdf_marker, x: -0.1)).not_to be_valid
  end

  it "rejects coordinates above 1" do
    expect(build(:pdf_marker, y: 1.1)).not_to be_valid
  end
end
```

Create `spec/factories/pdf_markers.rb`:

```ruby
FactoryBot.define do
  factory :pdf_marker do
    page { 3 }
    x { 0.5 }
    y { 0.25 }
  end
end
```

- [ ] **Step 3: Run spec to verify it fails**

Run: `bundle exec rspec spec/models/pdf_marker_spec.rb`
Expected: FAIL with `uninitialized constant PdfMarker`

- [ ] **Step 4: Write the model (and the constant holder)**

Create `app/services/manual_pdf_pages.rb` (Task 2 expands this class; only the constant exists now):

```ruby
class ManualPdfPages
  PAGE_COUNT = 136
end
```

Create `app/models/pdf_marker.rb`:

```ruby
class PdfMarker < ApplicationRecord
  validates :page, presence: true,
    numericality: { only_integer: true, in: 1..ManualPdfPages::PAGE_COUNT }
  validates :x, :y, presence: true, numericality: { in: 0..1 }
end
```

- [ ] **Step 5: Run spec to verify it passes**

Run: `bundle exec rspec spec/models/pdf_marker_spec.rb`
Expected: 7 examples, 0 failures

- [ ] **Step 6: Lint and commit**

```bash
bin/rubocop
git add db/migrate db/schema.rb app/models/pdf_marker.rb app/services/manual_pdf_pages.rb spec/models/pdf_marker_spec.rb spec/factories/pdf_markers.rb
git commit -m "Add PdfMarker model storing page + fractional coordinates"
```

---

### Task 2: `ManualPdfPages` page-rendering service

**Files:**
- Modify: `app/services/manual_pdf_pages.rb`
- Test: `spec/services/manual_pdf_pages_spec.rb`

**Interfaces:**
- Consumes: `data/manual.pdf`, `pdftoppm` binary.
- Produces:
  - `ManualPdfPages::PAGE_COUNT` → `136`
  - `ManualPdfPages.aspect_ratio` → `Float` (height/width ≈ 1.54286)
  - `ManualPdfPages.path_for(page) → Pathname` of a cached PNG; renders on cache miss; raises `ManualPdfPages::Error` on failure.

- [ ] **Step 1: Write the failing service spec**

Create `spec/services/manual_pdf_pages_spec.rb`. The happy path invokes the real `pdftoppm` (present locally and on the server) against the real PDF, writing into a temp cache dir:

```ruby
require "rails_helper"

RSpec.describe ManualPdfPages do
  around do |example|
    Dir.mktmpdir do |dir|
      @cache_dir = Pathname.new(dir)
      example.run
    end
  end

  it "exposes the manual's page count" do
    expect(described_class::PAGE_COUNT).to eq(136)
  end

  it "exposes the page aspect ratio (height / width)" do
    expect(described_class.aspect_ratio).to be_within(0.001).of(1.543)
  end

  it "renders a page to a cached PNG on first request" do
    path = described_class.new(1, cache_dir: @cache_dir).path

    expect(path).to eq(@cache_dir.join("page-001.png"))
    expect(path).to exist
    expect(path.binread[0, 8]).to eq("\x89PNG\r\n\x1A\n".b)
  end

  it "serves the cached file without re-rendering" do
    cached = @cache_dir.join("page-002.png")
    cached.binwrite("fake png")
    expect(Open3).not_to receive(:capture3)

    path = described_class.new(2, cache_dir: @cache_dir).path

    expect(path.binread).to eq("fake png")
  end

  it "raises Error when pdftoppm fails" do
    status = instance_double(Process::Status, success?: false, exitstatus: 1)
    allow(Open3).to receive(:capture3).and_return([ "", "boom", status ])

    expect {
      described_class.new(3, cache_dir: @cache_dir).path
    }.to raise_error(ManualPdfPages::Error, /boom/)
  end

  it "raises Error when pdftoppm cannot be launched" do
    allow(Open3).to receive(:capture3).and_raise(Errno::ENOENT, "pdftoppm")

    expect {
      described_class.new(3, cache_dir: @cache_dir).path
    }.to raise_error(ManualPdfPages::Error, /launched/)
  end
end
```

- [ ] **Step 2: Run spec to verify it fails**

Run: `bundle exec rspec spec/services/manual_pdf_pages_spec.rb`
Expected: FAIL — `aspect_ratio`, `new(..., cache_dir:)`, `path` undefined (only `PAGE_COUNT` passes)

- [ ] **Step 3: Implement the service**

Replace `app/services/manual_pdf_pages.rb` with (mirrors `ManualPdfStamper`'s Open3 pattern):

```ruby
require "open3"

# Renders single pages of data/manual.pdf to PNG via pdftoppm (poppler),
# caching them on disk. Deploy prerequisite: pdftoppm must be installed.
class ManualPdfPages
  class Error < StandardError; end

  SOURCE_PDF = Rails.root.join("data/manual.pdf")
  CACHE_DIR = Rails.root.join("tmp/manual_pages")
  PAGE_COUNT = 136
  PAGE_WIDTH_PTS = 396.85
  PAGE_HEIGHT_PTS = 612.283
  RESOLUTION_DPI = 150

  def self.aspect_ratio
    (PAGE_HEIGHT_PTS / PAGE_WIDTH_PTS).round(5)
  end

  def self.path_for(page)
    new(page).path
  end

  def initialize(page, source: SOURCE_PDF, cache_dir: CACHE_DIR)
    @page = page
    @source = source
    @cache_dir = cache_dir
  end

  def path
    cached = @cache_dir.join(format("page-%03d.png", @page))
    render_to(cached) unless cached.exist?
    cached
  end

  private

  def render_to(cached)
    FileUtils.mkdir_p(@cache_dir)
    prefix = @cache_dir.join("rendering-#{@page}-#{Process.pid}")

    _stdout, stderr, status = Open3.capture3(
      "pdftoppm", "-f", @page.to_s, "-l", @page.to_s,
      "-singlefile", "-r", RESOLUTION_DPI.to_s, "-png",
      @source.to_s, prefix.to_s
    )

    rendered = Pathname.new("#{prefix}.png")
    unless status.success? && rendered.exist?
      raise Error, "pdftoppm failed for page #{@page} (status #{status.exitstatus}): #{stderr.strip}"
    end

    FileUtils.mv(rendered, cached)
  rescue SystemCallError => e
    raise Error, "pdftoppm could not be launched: #{e.message}"
  end
end
```

- [ ] **Step 4: Run spec to verify it passes**

Run: `bundle exec rspec spec/services/manual_pdf_pages_spec.rb`
Expected: 6 examples, 0 failures

- [ ] **Step 5: Lint and commit**

```bash
bin/rubocop
git add app/services/manual_pdf_pages.rb spec/services/manual_pdf_pages_spec.rb
git commit -m "Add ManualPdfPages service rendering cached page PNGs via pdftoppm"
```

---

### Task 3: Admin-gated routes, `AnotateController`, page-image endpoint

**Files:**
- Modify: `config/routes.rb`
- Create: `app/controllers/anotate_controller.rb`
- Create: `app/controllers/anotate/pages_controller.rb`
- Test: `spec/requests/anotate_spec.rb`

**Interfaces:**
- Consumes: `ManualPdfPages` (Task 2), `PdfMarker` (Task 1).
- Produces:
  - `GET /anotate` → Inertia component `Anotate` with props `pageCount` (Integer), `pageAspect` (Float), `markers` (array of `{ id:, page:, x:, y: }` with Float x/y).
  - `GET /anotate/pages/:page` → PNG (`send_file`, inline, long cache) or 404/503.
  - Routes also declare `resources :pdf_markers` (controller comes in Task 4, so route exists but its specs come later).

- [ ] **Step 1: Write the failing request spec**

Create `spec/requests/anotate_spec.rb` (gating expectations copied from `spec/requests/rails_admin_access_spec.rb` — the routes-level `authenticate` block redirects anonymous users and 404s non-admins):

```ruby
require "rails_helper"

RSpec.describe "Anotate", type: :request do
  let(:admin) { create(:user, :admin) }
  let(:commenter) { create(:user) }

  describe "GET /anotate" do
    it "redirects anonymous users to login" do
      get "/anotate"

      expect(response).to redirect_to(new_user_session_path)
    end

    it "is hidden from non-admin users" do
      sign_in commenter

      get "/anotate"

      expect(response).to have_http_status(:not_found)
    end

    it "renders the Anotate page with markers and page metadata for an admin" do
      marker = create(:pdf_marker, page: 5, x: 0.5, y: 0.25)
      sign_in admin

      get "/anotate"

      expect(response).to have_http_status(:ok)
      page = response.parsed_body.css("#app").first["data-page"]
      props = JSON.parse(page)["props"]
      expect(props["pageCount"]).to eq(ManualPdfPages::PAGE_COUNT)
      expect(props["pageAspect"]).to be_within(0.001).of(1.543)
      expect(props["markers"]).to eq([
        { "id" => marker.id, "page" => 5, "x" => 0.5, "y" => 0.25 }
      ])
    end
  end

  describe "GET /anotate/pages/:page" do
    it "redirects anonymous users to login" do
      get "/anotate/pages/1"

      expect(response).to redirect_to(new_user_session_path)
    end

    it "is hidden from non-admin users" do
      sign_in commenter

      get "/anotate/pages/1"

      expect(response).to have_http_status(:not_found)
    end

    it "serves the page PNG to an admin" do
      sign_in admin

      get "/anotate/pages/1"

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("image/png")
      expect(response.headers["Cache-Control"]).to include("max-age=31556952")
    end

    it "404s on a page beyond the manual" do
      sign_in admin

      get "/anotate/pages/137"

      expect(response).to have_http_status(:not_found)
    end

    it "404s on a non-numeric page" do
      sign_in admin

      get "/anotate/pages/abc"

      expect(response).to have_http_status(:not_found)
    end

    it "responds 503 when rendering fails" do
      sign_in admin
      allow(ManualPdfPages).to receive(:path_for).and_raise(ManualPdfPages::Error, "boom")

      get "/anotate/pages/1"

      expect(response).to have_http_status(:service_unavailable)
    end
  end
end
```

- [ ] **Step 2: Run spec to verify it fails**

Run: `bundle exec rspec spec/requests/anotate_spec.rb`
Expected: FAIL with routing errors (`No route matches [GET] "/anotate"`)

- [ ] **Step 3: Add routes**

In `config/routes.rb`, after the RailsAdmin `authenticate` block, add:

```ruby
  authenticate :user, ->(user) { user.admin? } do
    get "/anotate", to: "anotate#show"
    get "/anotate/pages/:page", to: "anotate/pages#show", as: :anotate_page
    resources :pdf_markers, only: [ :create, :destroy ], path: "anotate/markers"
  end
```

- [ ] **Step 4: Implement the controllers**

Create `app/controllers/anotate_controller.rb`:

```ruby
# Admin-only PDF annotation tool (gated by the authenticate block in routes).
class AnotateController < InertiaController
  def show
    render inertia: "Anotate", props: {
      pageCount: ManualPdfPages::PAGE_COUNT,
      pageAspect: ManualPdfPages.aspect_ratio,
      markers: PdfMarker.order(:page, :created_at).map do |marker|
        { id: marker.id, page: marker.page, x: marker.x.to_f, y: marker.y.to_f }
      end
    }
  end
end
```

Create `app/controllers/anotate/pages_controller.rb`:

```ruby
module Anotate
  class PagesController < ApplicationController
    def show
      page = Integer(params[:page], exception: false)
      raise ActiveRecord::RecordNotFound unless page&.between?(1, ManualPdfPages::PAGE_COUNT)

      expires_in 1.year
      send_file ManualPdfPages.path_for(page), type: "image/png", disposition: "inline"
    rescue ManualPdfPages::Error => e
      Rails.logger.error("ManualPdfPages failed: #{e.message}")
      head :service_unavailable
    end
  end
end
```

- [ ] **Step 5: Run spec to verify it passes**

Run: `bundle exec rspec spec/requests/anotate_spec.rb`
Expected: 9 examples, 0 failures. (The "serves the page PNG" example really renders page 1 via pdftoppm into `tmp/manual_pages/` — first run is slower, later runs hit the cache.)

Note: the Inertia render of component `Anotate` does not require the JSX file to exist for a request spec (Inertia only embeds the component name in `data-page`). If the spec instead fails complaining about a missing page component, temporarily create a stub `app/frontend/pages/Anotate.jsx` exporting an empty component — Task 5 replaces it.

- [ ] **Step 6: Lint and commit**

```bash
bin/rubocop
git add config/routes.rb app/controllers/anotate_controller.rb app/controllers/anotate spec/requests/anotate_spec.rb
git commit -m "Add admin-gated /anotate page and cached page-image endpoint"
```

---

### Task 4: Marker create/destroy JSON endpoints

**Files:**
- Create: `app/controllers/pdf_markers_controller.rb`
- Test: `spec/requests/pdf_markers_spec.rb`

**Interfaces:**
- Consumes: `PdfMarker` (Task 1); route `resources :pdf_markers, path: "anotate/markers"` (Task 3).
- Produces:
  - `POST /anotate/markers` with JSON `{ pdf_marker: { page:, x:, y: } }` → 201 `{ id:, page:, x:, y: }` (x/y Floats) or 422 `{ errors: [...] }`.
  - `DELETE /anotate/markers/:id` → 204.

- [ ] **Step 1: Write the failing request spec**

Create `spec/requests/pdf_markers_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "PdfMarkers", type: :request do
  let(:admin) { create(:user, :admin) }

  describe "POST /anotate/markers" do
    it "redirects anonymous users to login" do
      post "/anotate/markers", params: { pdf_marker: { page: 1, x: 0.5, y: 0.5 } }

      expect(response).to redirect_to(new_user_session_path)
    end

    it "is hidden from non-admin users" do
      sign_in create(:user)

      post "/anotate/markers", params: { pdf_marker: { page: 1, x: 0.5, y: 0.5 } }

      expect(response).to have_http_status(:not_found)
    end

    it "creates a marker and returns it as JSON" do
      sign_in admin

      expect {
        post "/anotate/markers",
          params: { pdf_marker: { page: 12, x: 0.31416, y: 0.9 } },
          as: :json
      }.to change(PdfMarker, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(response.parsed_body).to eq(
        "id" => PdfMarker.last.id, "page" => 12, "x" => 0.31416, "y" => 0.9
      )
    end

    it "rejects an out-of-range page with validation errors" do
      sign_in admin

      post "/anotate/markers",
        params: { pdf_marker: { page: 999, x: 0.5, y: 0.5 } },
        as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["errors"]).to be_present
    end
  end

  describe "DELETE /anotate/markers/:id" do
    it "deletes the marker" do
      marker = create(:pdf_marker)
      sign_in admin

      expect {
        delete "/anotate/markers/#{marker.id}"
      }.to change(PdfMarker, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "404s on an unknown marker" do
      sign_in admin

      delete "/anotate/markers/999999"

      expect(response).to have_http_status(:not_found)
    end
  end
end
```

- [ ] **Step 2: Run spec to verify it fails**

Run: `bundle exec rspec spec/requests/pdf_markers_spec.rb`
Expected: FAIL with `uninitialized constant PdfMarkersController`

- [ ] **Step 3: Implement the controller**

Create `app/controllers/pdf_markers_controller.rb`:

```ruby
# JSON API for the /anotate tool (admin-gated in routes).
class PdfMarkersController < ApplicationController
  def create
    marker = PdfMarker.new(params.require(:pdf_marker).permit(:page, :x, :y))

    if marker.save
      render json: { id: marker.id, page: marker.page, x: marker.x.to_f, y: marker.y.to_f },
        status: :created
    else
      render json: { errors: marker.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    PdfMarker.find(params[:id]).destroy!
    head :no_content
  end
end
```

- [ ] **Step 4: Run spec to verify it passes**

Run: `bundle exec rspec spec/requests/pdf_markers_spec.rb`
Expected: 6 examples, 0 failures

- [ ] **Step 5: Lint and commit**

```bash
bin/rubocop
git add app/controllers/pdf_markers_controller.rb spec/requests/pdf_markers_spec.rb
git commit -m "Add JSON create/destroy endpoints for PDF markers"
```

---

### Task 5: `Anotate.jsx` frontend

**Files:**
- Create: `app/frontend/pages/Anotate.jsx`

**Interfaces:**
- Consumes: Inertia props `pageCount`, `pageAspect`, `markers` (Task 3); JSON endpoints `POST/DELETE /anotate/markers` (Task 4); images `GET /anotate/pages/:page` (Task 3); CSRF token from `csrf_meta_tags` in the layout.
- Produces: the user-facing tool. No JS tests (none configured in this repo); verified via `bin/vite build`, the existing request specs, and manual browser check.

**Interaction contract (from spec):** long-press ~400 ms places a provisional marker under the finger; dragging while pressed moves it; release POSTs it. Movement > 10 px before the threshold cancels (that's a scroll). Tapping an existing marker deletes it. Mouse works through the same pointer-event path.

- [ ] **Step 1: Write the component**

Create `app/frontend/pages/Anotate.jsx`:

```jsx
import { useEffect, useRef, useState } from "react";

const MARKER_TEXT = "pregúntarle a la autora";
const LONG_PRESS_MS = 400;
const MOVE_TOLERANCE_PX = 10;

const csrfToken = () =>
  document.querySelector('meta[name="csrf-token"]')?.content;

async function apiCreateMarker({ page, x, y }) {
  const response = await fetch("/anotate/markers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken(),
      Accept: "application/json",
    },
    body: JSON.stringify({ pdf_marker: { page, x, y } }),
  });
  if (!response.ok) throw new Error(`create failed: ${response.status}`);
  return response.json();
}

async function apiDeleteMarker(id) {
  const response = await fetch(`/anotate/markers/${id}`, {
    method: "DELETE",
    headers: { "X-CSRF-Token": csrfToken(), Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`delete failed: ${response.status}`);
}

const markerClasses =
  "absolute -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap " +
  "text-sm font-semibold text-red-600 underline";

function Marker({ marker, onDelete }) {
  return (
    <span
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onDelete(marker);
      }}
      className={`${markerClasses} cursor-pointer`}
      style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%` }}
    >
      {MARKER_TEXT}
    </span>
  );
}

function Page({ page, aspect, markers, onPlace, onDelete }) {
  const containerRef = useRef(null);
  const pressRef = useRef(null);
  const draggingRef = useRef(false);
  const [provisional, setProvisional] = useState(null);

  // While dragging a provisional marker, block touch scrolling so the
  // drag tracks the finger instead of panning the document.
  useEffect(() => {
    if (!provisional) return undefined;
    const block = (e) => e.preventDefault();
    document.addEventListener("touchmove", block, { passive: false });
    return () => document.removeEventListener("touchmove", block);
  }, [provisional]);

  const fractionFor = (clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    const clamp = (v) => Math.min(Math.max(v, 0), 1);
    return {
      x: clamp((clientX - rect.left) / rect.width),
      y: clamp((clientY - rect.top) / rect.height),
    };
  };

  const cancelPress = () => {
    if (pressRef.current) clearTimeout(pressRef.current.timer);
    pressRef.current = null;
  };

  const handlePointerDown = (e) => {
    if (draggingRef.current) return;
    const { clientX, clientY, pointerId } = e;
    pressRef.current = {
      startX: clientX,
      startY: clientY,
      timer: setTimeout(() => {
        pressRef.current = null;
        draggingRef.current = true;
        containerRef.current.setPointerCapture(pointerId);
        setProvisional(fractionFor(clientX, clientY));
      }, LONG_PRESS_MS),
    };
  };

  const handlePointerMove = (e) => {
    if (draggingRef.current) {
      setProvisional(fractionFor(e.clientX, e.clientY));
    } else if (pressRef.current) {
      const dx = e.clientX - pressRef.current.startX;
      const dy = e.clientY - pressRef.current.startY;
      if (Math.hypot(dx, dy) > MOVE_TOLERANCE_PX) cancelPress();
    }
  };

  const handlePointerUp = (e) => {
    cancelPress();
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setProvisional(null);
    onPlace(page, fractionFor(e.clientX, e.clientY));
  };

  const handlePointerCancel = () => {
    cancelPress();
    draggingRef.current = false;
    setProvisional(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ aspectRatio: `1 / ${aspect}`, WebkitTouchCallout: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img
        src={`/anotate/pages/${page}`}
        loading="lazy"
        alt={`Página ${page}`}
        draggable="false"
        className="pointer-events-none h-full w-full select-none"
      />
      {markers.map((marker) => (
        <Marker key={marker.id} marker={marker} onDelete={onDelete} />
      ))}
      {provisional && (
        <span
          className={`${markerClasses} pointer-events-none opacity-70`}
          style={{
            left: `${provisional.x * 100}%`,
            top: `${provisional.y * 100}%`,
          }}
        >
          {MARKER_TEXT}
        </span>
      )}
    </div>
  );
}

export default function Anotate({ pageCount, pageAspect, markers: initialMarkers }) {
  const [markers, setMarkers] = useState(initialMarkers);

  const place = async (page, { x, y }) => {
    const temp = { id: `temp-${Date.now()}`, page, x, y };
    setMarkers((current) => [...current, temp]);
    try {
      const saved = await apiCreateMarker({ page, x, y });
      setMarkers((current) =>
        current.map((m) => (m.id === temp.id ? saved : m))
      );
    } catch {
      setMarkers((current) => current.filter((m) => m.id !== temp.id));
      alert("No se pudo guardar el marcador");
    }
  };

  const remove = async (marker) => {
    setMarkers((current) => current.filter((m) => m.id !== marker.id));
    try {
      await apiDeleteMarker(marker.id);
    } catch {
      setMarkers((current) => [...current, marker]);
      alert("No se pudo borrar el marcador");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
        <Page
          key={page}
          page={page}
          aspect={pageAspect}
          markers={markers.filter((m) => m.page === page)}
          onPlace={place}
          onDelete={remove}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify the frontend builds**

Run: `bin/vite build`
Expected: build succeeds, no errors mentioning `Anotate.jsx`

- [ ] **Step 3: Run the full test suite**

Run: `bundle exec rspec`
Expected: 0 failures

- [ ] **Step 4: Manual smoke test**

Start `./serve-dev`, sign in as an admin, open `http://localhost:3000/anotate`:
- Pages render and scroll.
- With a mouse: press-and-hold 400 ms → marker appears; drag → follows; release → persists (check `PdfMarker.count` in `bin/rails console` or reload the page).
- Click a marker → it disappears; reload → still gone.
- Quick scroll gestures do NOT create markers.
- On the phone (same network or tunnel): long-press places, drag adjusts, release saves, tap deletes, swipe scrolls.

- [ ] **Step 5: Commit**

```bash
git add app/frontend/pages/Anotate.jsx
git commit -m "Add Anotate page: long-press to place markers, tap to delete"
```
