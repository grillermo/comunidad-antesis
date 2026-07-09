# Phase 2a: Landing Page & Email Capture Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public, flat, above-the-fold landing page at `/` that captures email addresses into a `NewsletterEmail` model, with subscribed / already-subscribed / invalid states, styled with the ebook's palette and typography.

**Architecture:** A `NewsletterEmail` model (email + source, case-insensitive unique). `LandingController#index` renders an Inertia `Landing` React page; `NewsletterEmailsController#create` saves the email and redirects back to `/` with flash (success/duplicate) or Inertia errors (invalid). The React page uses Inertia's `useForm`. Styling uses Tailwind v4 `@theme` tokens and Google-Fonts-loaded Fredoka + Nunito Sans.

**Tech Stack:** Rails 8, PostgreSQL, RSpec, Inertia Rails, React 19, Vite, Tailwind CSS v4.

**Spec:** `docs/superpowers/specs/2026-07-09-phase2a-landing-email-capture-design.md`

**Key facts about the existing codebase (verified):**
- Tailwind is **v4** — theme customization lives in `app/frontend/entrypoints/application.css` via `@theme { ... }`, NOT a `tailwind.config.js`.
- An `InertiaController < ApplicationController` base class already exists (`app/controllers/inertia_controller.rb`) — new Inertia controllers inherit from it.
- `config/initializers/inertia_rails.rb` sets `always_include_errors_hash = true`, so the redirect-back-with-errors pattern works out of the box.
- Inertia pages live in `app/frontend/pages/`; assets import from `app/frontend/assets/`.
- The layout is `app/views/layouts/application.html.erb` (no Google Fonts link yet).
- A temporary `WelcomeController` + `app/frontend/pages/Welcome.jsx` + `spec/requests/welcome_spec.rb` exist from Phase 1 and must be deleted.

---

## Chunk 1: `NewsletterEmail` model (TDD)

**Files:**
- Create: `db/migrate/*_create_newsletter_emails.rb`
- Create: `app/models/newsletter_email.rb`
- Test: `spec/models/newsletter_email_spec.rb`

- [ ] **Step 1: Write the failing model spec**

Create `spec/models/newsletter_email_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe NewsletterEmail, type: :model do
  it "is valid with a well-formed email" do
    expect(NewsletterEmail.new(email: "reader@example.com")).to be_valid
  end

  it "normalizes email by stripping and downcasing before validation" do
    record = NewsletterEmail.create!(email: "  Reader@Example.COM  ")
    expect(record.email).to eq("reader@example.com")
  end

  it "is invalid without an email" do
    record = NewsletterEmail.new(email: nil)
    expect(record).not_to be_valid
    expect(record.errors[:email]).to be_present
  end

  it "is invalid with a malformed email" do
    expect(NewsletterEmail.new(email: "not-an-email")).not_to be_valid
  end

  it "enforces case-insensitive uniqueness" do
    NewsletterEmail.create!(email: "foo@x.com")
    dup = NewsletterEmail.new(email: "FOO@x.com")
    expect(dup).not_to be_valid
    expect(dup.errors.details[:email]).to include(a_hash_including(error: :taken))
  end

  it "persists an optional source" do
    record = NewsletterEmail.create!(email: "s@x.com", source: "instagram")
    expect(record.source).to eq("instagram")
  end
end
```

- [ ] **Step 2: Run the spec, confirm it fails**

Run: `bundle exec rspec spec/models/newsletter_email_spec.rb`
Expected: FAIL — `uninitialized constant NewsletterEmail`.

- [ ] **Step 3: Create the migration**

Create `db/migrate/20260709100001_create_newsletter_emails.rb`:

```ruby
class CreateNewsletterEmails < ActiveRecord::Migration[8.0]
  def change
    create_table :newsletter_emails do |t|
      t.string :email, null: false
      t.string :source

      t.timestamps
    end

    add_index :newsletter_emails, :email, unique: true
  end
end
```

- [ ] **Step 4: Run the migration**

Run: `bin/rails db:migrate`
Expected: creates `newsletter_emails`; `db/schema.rb` updated.

- [ ] **Step 5: Write the model**

Create `app/models/newsletter_email.rb`:

```ruby
class NewsletterEmail < ApplicationRecord
  before_validation :normalize_email

  validates :email,
    presence: { message: "Escribe tu correo." },
    format: { with: URI::MailTo::EMAIL_REGEXP, message: "El correo no es válido." },
    uniqueness: { case_sensitive: false, message: "Ya estás en la lista." }

  private

  def normalize_email
    self.email = email.to_s.strip.downcase
  end
end
```

Spanish messages keep the inline error consistent with the rest of the UI.
Note the `presence` message only shows if the field is blank; `format`
covers malformed input. (The `:taken`/`uniqueness` case is normally
intercepted by the controller and shown as the "ya estás en la lista"
success-style state rather than an inline field error, but the message is
set for completeness.)

- [ ] **Step 6: Run the spec, confirm it passes**

Run: `bundle exec rspec spec/models/newsletter_email_spec.rb`
Expected: `6 examples, 0 failures`.

- [ ] **Step 7: Commit**

```bash
git add db/migrate/20260709100001_create_newsletter_emails.rb db/schema.rb app/models/newsletter_email.rb spec/models/newsletter_email_spec.rb
git commit -m "Add NewsletterEmail model with normalized, unique email"
```

---

## Chunk 2: Routes & controllers (TDD), remove Welcome smoke-test

**Files:**
- Modify: `config/routes.rb`
- Create: `app/controllers/landing_controller.rb`
- Create: `app/controllers/newsletter_emails_controller.rb`
- Delete: `app/controllers/welcome_controller.rb`, `spec/requests/welcome_spec.rb` (the `Welcome.jsx` page is deleted in Chunk 4)
- Test: `spec/requests/landing_spec.rb`, `spec/requests/newsletter_emails_spec.rb`

- [ ] **Step 1: Write the failing request specs**

Create `spec/requests/landing_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "Landing", type: :request do
  it "renders the landing page" do
    get "/"
    expect(response).to have_http_status(:ok)
  end
end
```

Create `spec/requests/newsletter_emails_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "NewsletterEmails", type: :request do
  it "creates a subscriber and redirects with a subscribed flash" do
    expect {
      post "/newsletter_emails", params: { email: "new@example.com", source: "ig" }
    }.to change(NewsletterEmail, :count).by(1)

    expect(response).to redirect_to(root_path)
    expect(flash[:subscribed]).to be_truthy
    expect(NewsletterEmail.last.source).to eq("ig")
  end

  it "does not duplicate an existing email and flags already_subscribed" do
    NewsletterEmail.create!(email: "dup@example.com")

    expect {
      post "/newsletter_emails", params: { email: "DUP@example.com" }
    }.not_to change(NewsletterEmail, :count)

    expect(response).to redirect_to(root_path)
    expect(flash[:already_subscribed]).to be_truthy
  end

  it "rejects a malformed email without creating a row" do
    expect {
      post "/newsletter_emails", params: { email: "nope" }
    }.not_to change(NewsletterEmail, :count)

    expect(response).to redirect_to(root_path)
  end
end
```

- [ ] **Step 2: Run the specs, confirm they fail**

Run: `bundle exec rspec spec/requests/landing_spec.rb spec/requests/newsletter_emails_spec.rb`
Expected: FAIL — routing errors (`/` still maps to `welcome#index`; no `/newsletter_emails` route).

- [ ] **Step 3: Update routes**

Rewrite the top of `config/routes.rb` so `root` points at landing and add the create route. Replace the `root "welcome#index"` line:

```ruby
Rails.application.routes.draw do
  root "landing#index"

  resources :newsletter_emails, only: [:create]

  get "/health", to: "health#show"

  # Reveal health status on /up for load balancers and uptime monitors.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*.
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
end
```

- [ ] **Step 4: Create `LandingController`**

Create `app/controllers/landing_controller.rb`:

```ruby
class LandingController < InertiaController
  def index
    render inertia: "Landing", props: {
      subscribed: flash[:subscribed] || false,
      alreadySubscribed: flash[:already_subscribed] || false,
      source: params[:source]
    }
  end
end
```

- [ ] **Step 5: Create `NewsletterEmailsController`**

Create `app/controllers/newsletter_emails_controller.rb`:

```ruby
class NewsletterEmailsController < InertiaController
  def create
    record = NewsletterEmail.new(newsletter_email_params)

    if record.save
      redirect_to root_path, flash: { subscribed: true }
    elsif duplicate?(record)
      redirect_to root_path, flash: { already_subscribed: true }
    else
      redirect_to root_path, inertia: { errors: record.errors }
    end
  rescue ActiveRecord::RecordNotUnique
    redirect_to root_path, flash: { already_subscribed: true }
  end

  private

  def newsletter_email_params
    params.permit(:email, :source)
  end

  def duplicate?(record)
    record.errors.details[:email].any? { |detail| detail[:error] == :taken }
  end
end
```

- [ ] **Step 6: Delete the Phase 1 Welcome smoke-test controller and spec**

```bash
git rm app/controllers/welcome_controller.rb spec/requests/welcome_spec.rb
```

(The `Welcome.jsx` page is removed in Chunk 4, together with the new `Landing.jsx`.)

- [ ] **Step 7: Run the request specs, confirm they pass**

Run: `bundle exec rspec spec/requests/landing_spec.rb spec/requests/newsletter_emails_spec.rb`
Expected: `4 examples, 0 failures`.

Note: `GET /` renders the `Landing` Inertia component, which does not exist as a `.jsx` file until Chunk 4. The request spec only asserts a `200` (the server renders the HTML shell with the `data-page` payload regardless of whether the JS component file exists), so this passes now; the actual React page is built and verified in the browser in Chunk 4.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Add landing and newsletter_emails routes and controllers"
```

---

## Chunk 3: Design tokens, fonts, cover asset

**Files:**
- Modify: `app/frontend/entrypoints/application.css` (Tailwind v4 `@theme`)
- Modify: `app/views/layouts/application.html.erb` (Google Fonts link)
- Create: `app/frontend/assets/cover.jpg` (optimized ebook cover)

- [ ] **Step 1: Add the palette and fonts to Tailwind v4 `@theme`**

Edit `app/frontend/entrypoints/application.css` to append a `@theme` block after the existing imports:

```css
@import 'tailwindcss';

@plugin '@tailwindcss/typography';
@plugin '@tailwindcss/forms';

@theme {
  --color-cream: #F5EFDA;
  --color-blue: #33538C;
  --color-blue-deep: #2C4C86;
  --color-blue-ink: #2A3F6B;
  --color-orange: #EF6C15;
  --color-orange-ink: #E5620C;

  --font-display: "Fredoka", ui-sans-serif, sans-serif;
  --font-body: "Nunito Sans", ui-sans-serif, sans-serif;
}
```

This generates utilities `bg-cream`, `text-blue`, `text-orange`, `text-orange-ink`, `font-display`, `font-body`, etc.

- [ ] **Step 2: Load Fredoka + Nunito Sans in the layout head**

In `app/views/layouts/application.html.erb`, add inside `<head>` (before `<%= vite_client_tag %>`):

```erb
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700&display=swap" rel="stylesheet">
```

- [ ] **Step 3: Extract and optimize the ebook cover to under 300 KB**

The cover is page 1 of the PDF. Extract at a modest resolution and compress:

```bash
mkdir -p app/frontend/assets
pdftoppm -f 1 -l 1 -r 110 -jpeg -jpegopt quality=82 \
  "project/MaquetaCompleta-ManualDelColorVivo-VER1 (1).pdf" /tmp/ca-cover
# pdftoppm writes /tmp/ca-cover-01.jpg (or -1.jpg); find and resize to ~700px wide
SRC=$(ls /tmp/ca-cover-*.jpg | head -1)
sips -Z 700 "$SRC" --out app/frontend/assets/cover.jpg
```

- [ ] **Step 4: Verify the cover asset is small enough**

Run: `ls -la app/frontend/assets/cover.jpg`
Expected: file exists and is well under 300 KB. If it's larger, re-run Step 3 with a lower `-r` (e.g. `-r 90`) or smaller `sips -Z` width (e.g. `600`), or drop JPEG quality to `78`.

- [ ] **Step 5: Commit**

```bash
git add app/frontend/entrypoints/application.css app/views/layouts/application.html.erb app/frontend/assets/cover.jpg
git commit -m "Add ebook palette/font tokens, Google Fonts, optimized cover asset"
```

---

## Chunk 4: `Landing` React page + browser verification

**Files:**
- Create: `app/frontend/pages/Landing.jsx`
- Delete: `app/frontend/pages/Welcome.jsx`

- [ ] **Step 1: Delete the Phase 1 Welcome page**

```bash
git rm app/frontend/pages/Welcome.jsx
```

- [ ] **Step 2: Write the `Landing` page**

Create `app/frontend/pages/Landing.jsx`. Flat, cream, above-the-fold, two-column (Direction A). Uses `useForm`; renders subscribed / already-subscribed / error / default states; accessible input.

```jsx
import { useForm } from '@inertiajs/react'
import coverUrl from '../assets/cover.jpg'

export default function Landing({ subscribed, alreadySubscribed, source }) {
  const form = useForm({ email: '', source: source || '' })

  const submit = (e) => {
    e.preventDefault()
    form.post('/newsletter_emails', { preserveScroll: true })
  }

  return (
    <main className="min-h-screen bg-cream font-body text-blue-ink">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-8 px-6 md:grid-cols-2">
        {/* Left column */}
        <div className="max-w-md">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-orange-ink">
            Manual del Color Vivo
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] text-blue sm:text-5xl">
            Tiñe, extrae y pinta con lo que da la tierra
          </h1>

          {subscribed ? (
            <p role="status" className="mt-5 text-lg">
              ¡Listo! Te avisaremos y te enviaremos tu descuento.
            </p>
          ) : alreadySubscribed ? (
            <p role="status" className="mt-5 text-lg">
              Ya estás en la lista. ¡Nos vemos pronto!
            </p>
          ) : (
            <>
              <p className="mt-4 text-[15px] leading-relaxed text-blue-ink/90">
                Más de una década de fórmulas para dar color con plantas,
                minerales e insectos. Déjanos tu correo y recibe un descuento
                para el ebook completo.
              </p>

              <form onSubmit={submit} className="mt-6 flex max-w-sm gap-2" noValidate>
                <div className="flex-1">
                  <label htmlFor="email" className="sr-only">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    aria-invalid={form.errors.email ? 'true' : undefined}
                    aria-describedby={form.errors.email ? 'email-error' : undefined}
                    className="w-full border border-blue/20 bg-white px-3 py-3 text-[15px] outline-none focus:border-orange"
                  />
                </div>
                <button
                  type="submit"
                  disabled={form.processing}
                  className="font-display bg-orange px-4 py-3 font-semibold text-white disabled:opacity-60"
                >
                  Quiero mi descuento
                </button>
              </form>

              {form.errors.email && (
                <p id="email-error" role="alert" className="mt-2 text-sm text-orange-ink">
                  {Array.isArray(form.errors.email) ? form.errors.email[0] : form.errors.email}
                </p>
              )}

              <p className="mt-3 text-xs text-blue-ink/70">
                Sin spam. Solo el descuento y el aviso de lanzamiento.
              </p>
            </>
          )}
        </div>

        {/* Right column */}
        <div className="flex items-center justify-center">
          <img src={coverUrl} alt="Portada de Manual del Color Vivo" className="w-48 sm:w-56" />
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Boot dev servers**

Run: `bin/rails server -p 3000 &` and `bin/vite dev &`
(Ensure no stale `tmp/pids/server.pid`; remove it if the server refuses to boot.)

- [ ] **Step 4: Verify the landing page renders in a browser**

Use the browser tooling (or ask the user) to open `http://localhost:3000/`. Confirm:
- Two-column, above-the-fold, flat, cream background.
- Headline in blue, kicker + button in vibrant orange, cover shown flat on the right.
- Fonts are Fredoka (headline/button) and Nunito Sans (body).

- [ ] **Step 5: Verify the three form outcomes**

- Submit a new valid email → left column swaps to the "¡Listo!" thank-you.
- Submit the same email again → "Ya estás en la lista" message.
- Submit a malformed email (e.g. `nope`) → inline error under the input; no navigation away.

Confirm in the DB: `bin/rails runner "puts NewsletterEmail.pluck(:email, :source).inspect"`.

- [ ] **Step 6: Kill dev servers**

Run: `kill %1 %2` (or stop the individual background jobs).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add flat cream Landing page with email capture form"
```

---

## Chunk 5: Final verification

- [ ] **Step 1: Full test suite**

Run: `bundle exec rspec`
Expected: all green — the Phase 1 `/health` specs plus the new model and request specs (Welcome smoke-test spec is gone).

- [ ] **Step 2: Production asset build sanity check**

Run: `bin/rails assets:precompile`
Expected: Vite build completes without error (confirms the `cover.jpg` import and Tailwind `@theme` compile in a production build).

- [ ] **Step 3: Rubocop the new Ruby**

Run: `bundle exec rubocop app/controllers/landing_controller.rb app/controllers/newsletter_emails_controller.rb app/models/newsletter_email.rb db/migrate/20260709100001_create_newsletter_emails.rb`
Expected: no offenses (autocorrect with `-A` if the omakase config flags formatting).

- [ ] **Step 4: Confirm Welcome is fully gone**

Run: `ls app/controllers/welcome_controller.rb app/frontend/pages/Welcome.jsx spec/requests/welcome_spec.rb 2>&1`
Expected: `No such file or directory` for all three.

Phase 2a is complete once this chunk passes. The next phase (Devise auth + roles) starts from this committed state.
