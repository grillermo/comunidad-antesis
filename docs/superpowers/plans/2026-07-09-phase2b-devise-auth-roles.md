# Phase 2b — Devise Auth, Roles & RailsAdmin Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email/password authentication (Devise), two roles (`commenter`/`admin`), a custom Inertia login page, a logged-in state on the landing page, and an admin-only RailsAdmin UI at `/antesis-admin`.

**Architecture:** Devise provides the auth engine; its Turbo/ERB views are replaced by a React `Login.jsx` rendered through a custom `Users::SessionsController`. The current user is exposed to every Inertia page via `Current.user` + `inertia_share`. RailsAdmin is mounted behind a Devise `authenticate` route constraint plus Warden-based guards in its initializer. RailsAdmin assets are served by the app's existing propshaft pipeline.

**Tech Stack:** Rails 8.0.5, Ruby 3.4.7, Devise, RailsAdmin ~> 3.3 (propshaft asset source), Inertia Rails + React 19 + Vite, Tailwind v4, RSpec, Postgres (unified schema).

**Spec:** `docs/superpowers/specs/2026-07-09-phase2b-devise-auth-roles-design.md`

---

## Conventions in this codebase (read before starting)

- **No FactoryBot.** Existing specs build records with `Model.create!(...)` inline. Follow that — do not add FactoryBot.
- **Controllers inherit `InertiaController`** (which inherits `ApplicationController`) when they render Inertia pages. See `app/controllers/landing_controller.rb`.
- **Spanish, hardcoded.** Existing user-facing strings are literal Spanish (see `NewsletterEmail`), not I18n — except Devise, which we localize via a locale file + `:es` default.
- **Inertia flash→props pattern:** controllers pass simple flags as props (see `LandingController`). Validation errors use `redirect_to ..., inertia: { errors: record.errors }`.
- **Run the suite with:** `bundle exec rspec`. Baseline before this phase: **14 examples, 0 failures**.
- **Frontend pages** live in `app/frontend/pages/` and use `@inertiajs/react`'s `useForm`. Palette tokens (`cream`, `blue`, `blue-ink`, `orange`, `orange-ink`) and fonts (`font-display`, `font-body`) come from `app/frontend/entrypoints/application.css`. Reuse them; do not invent new colors.

## File Structure

**Create:**
- `app/models/user.rb` — Devise user + role enum (generator creates, we edit).
- `app/models/current.rb` — `ActiveSupport::CurrentAttributes` holding `:user`.
- `app/controllers/users/sessions_controller.rb` — Inertia login view + 303 logout.
- `app/frontend/pages/Login.jsx` — React login form.
- `config/locales/devise.es.yml` — Spanish Devise messages.
- `config/initializers/devise.rb` — generator-created; no edits needed this phase.
- `config/initializers/rails_admin.rb` — generator-created; we add Warden guards + propshaft asset source.
- `spec/models/user_spec.rb`
- `spec/requests/sessions_spec.rb`
- `spec/requests/rails_admin_access_spec.rb`
- `spec/requests/landing_authenticated_spec.rb`
- `spec/support/devise.rb` — wire Devise request-spec helpers.
- `db/migrate/*_devise_create_users.rb` — generator-created; we edit.

**Modify:**
- `Gemfile` — add `devise`, `rails_admin`.
- `config/routes.rb` — `devise_for` + mount RailsAdmin behind `authenticate`.
- `config/application.rb` — `config.i18n.default_locale = :es`.
- `app/controllers/application_controller.rb` — set `Current.user`.
- `app/controllers/inertia_controller.rb` — activate `inertia_share user:`.
- `app/frontend/pages/Landing.jsx` — logged-in state (greeting, logout, admin link, login link).
- `db/seeds.rb` — seed one admin from env.
- `.env.example` — document `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- `serve`, `serve-dev` — verify/add RailsAdmin asset handling.
- `spec/rails_helper.rb` — ensure `spec/support` is loaded.

---

## Chunk 1: Auth foundation (gems, User model, locale, Current sharing)

### Task 1: Install Devise and RailsAdmin gems

**Files:**
- Modify: `Gemfile`
- Create (by generator): `config/initializers/devise.rb`

- [ ] **Step 1: Add gems**

Run:
```bash
bundle add devise
bundle add rails_admin --version "~> 3.3"
```
Expected: both resolve; `Gemfile.lock` gains `devise`, `rails_admin`, and its transitive deps (`turbo-rails`, `kaminari`, `nested_form`).

- [ ] **Step 2: Run the Devise install generator**

Run: `bin/rails generate devise:install`
Expected: creates `config/initializers/devise.rb` and `config/locales/devise.en.yml`, prints post-install instructions. Ignore the mailer/root-route instructions (root is already set; no mailer this phase).

- [ ] **Step 3: Verify the app still boots and suite is green**

Run: `bundle exec rspec`
Expected: **14 examples, 0 failures** (no behavior added yet).

- [ ] **Step 4: Commit**

```bash
git add Gemfile Gemfile.lock config/initializers/devise.rb config/locales/devise.en.yml
git commit -m "Add devise and rails_admin gems, run devise:install"
```

---

### Task 2: User model with role enum

**Files:**
- Create (generator): `db/migrate/<ts>_devise_create_users.rb`, `app/models/user.rb`
- Modify: the migration and `app/models/user.rb`
- Test: `spec/models/user_spec.rb`

- [ ] **Step 1: Generate the Devise model**

Run: `bin/rails generate devise User`
Expected: creates `app/models/user.rb`, a `devise_create_users` migration, and adds `devise_for :users` to `config/routes.rb` (we will refine that route in Task 5).

- [ ] **Step 2: Edit the migration**

In the generated `db/migrate/<ts>_devise_create_users.rb`:
- **Uncomment** the `## Rememberable` block (`t.datetime :remember_created_at`).
- **Uncomment** the `## Trackable` block (`sign_in_count`, `current_sign_in_at`, `last_sign_in_at`, `current_sign_in_ip`, `last_sign_in_ip`).
- Leave Recoverable/Confirmable commented.
- Add the role column just before the `t.timestamps`:

```ruby
      t.string :role, null: false, default: "commenter"
```
- Ensure these indexes exist at the bottom (email index is generated; add role):

```ruby
      add_index :users, :email, unique: true
      add_index :users, :role
```

- [ ] **Step 3: Edit `app/models/user.rb`**

```ruby
class User < ApplicationRecord
  devise :database_authenticatable, :validatable, :rememberable, :trackable

  enum :role, { commenter: "commenter", admin: "admin" }, default: "commenter"
end
```

- [ ] **Step 4: Migrate**

Run: `bin/rails db:migrate`
Expected: `users` table created; `db/schema.rb` updated (single unified schema).

- [ ] **Step 5: Write the failing model spec**

Create `spec/models/user_spec.rb`:
```ruby
require "rails_helper"

RSpec.describe User, type: :model do
  it "defaults new users to the commenter role" do
    user = User.create!(email: "c@example.com", password: "password123")
    expect(user.role).to eq("commenter")
    expect(user.commenter?).to be(true)
    expect(user.admin?).to be(false)
  end

  it "supports the admin role and its predicate" do
    user = User.create!(email: "a@example.com", password: "password123", role: :admin)
    expect(user.admin?).to be(true)
  end

  it "requires a valid, unique email" do
    User.create!(email: "dup@example.com", password: "password123")
    dup = User.new(email: "dup@example.com", password: "password123")
    expect(dup).not_to be_valid
    expect(dup.errors[:email]).to be_present
  end

  it "requires a password" do
    user = User.new(email: "nopass@example.com")
    expect(user).not_to be_valid
    expect(user.errors[:password]).to be_present
  end
end
```

- [ ] **Step 6: Run the model spec**

Run: `bundle exec rspec spec/models/user_spec.rb`
Expected: all 4 examples PASS. (Devise `validatable` supplies email/password validations; the enum supplies role default + predicates.)

- [ ] **Step 7: Run the full suite**

Run: `bundle exec rspec`
Expected: **18 examples, 0 failures**.

- [ ] **Step 8: Commit**

```bash
git add app/models/user.rb db/migrate db/schema.rb config/routes.rb spec/models/user_spec.rb
git commit -m "Add User model with role enum and Devise auth"
```

---

### Task 3: Spanish locale for Devise

**Files:**
- Modify: `config/application.rb`
- Create: `config/locales/devise.es.yml`

- [ ] **Step 1: Set the default locale**

In `config/application.rb`, inside the `Application` class (after `config.load_defaults 8.0`):
```ruby
    config.i18n.default_locale = :es
    config.i18n.available_locales = [ :es, :en ]
```

- [ ] **Step 2: Add the Spanish Devise locale**

Create `config/locales/devise.es.yml` (standard devise-i18n Spanish translations). Minimum viable set — the flash keys the login flow uses:
```yaml
es:
  devise:
    failure:
      invalid: "Correo o contraseña no válidos."
      not_found_in_database: "Correo o contraseña no válidos."
      unauthenticated: "Necesitas iniciar sesión antes de continuar."
      timeout: "Tu sesión expiró. Inicia sesión de nuevo."
    sessions:
      signed_in: "Sesión iniciada."
      signed_out: "Sesión cerrada."
      already_signed_out: "Sesión cerrada."
  errors:
    messages:
      already_confirmed: "ya fue confirmada"
      not_found: "no encontrado"
      taken: "ya está en uso"
```

- [ ] **Step 3: Verify the locale loads**

Run:
```bash
bin/rails runner 'puts I18n.default_locale; puts I18n.t("devise.failure.invalid")'
```
Expected: prints `es` then `Correo o contraseña no válidos.`

- [ ] **Step 4: Run the full suite (guard against locale regressions)**

Run: `bundle exec rspec`
Expected: **18 examples, 0 failures**.

- [ ] **Step 5: Commit**

```bash
git add config/application.rb config/locales/devise.es.yml
git commit -m "Default locale to Spanish, add Devise es translations"
```

---

### Task 4: Current.user + Inertia sharing

**Files:**
- Create: `app/models/current.rb`
- Modify: `app/controllers/application_controller.rb`, `app/controllers/inertia_controller.rb`

- [ ] **Step 1: Add the Current model**

Create `app/models/current.rb`:
```ruby
class Current < ActiveSupport::CurrentAttributes
  attribute :user
end
```

- [ ] **Step 2: Set Current.user in ApplicationController**

Edit `app/controllers/application_controller.rb`:
```ruby
class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  before_action :set_current_user

  private

  def set_current_user
    Current.user = current_user
  end
end
```
(`current_user` is provided by Devise once `devise_for` is in routes — already added in Task 2.)

- [ ] **Step 3: Activate inertia_share in InertiaController**

Replace the commented example in `app/controllers/inertia_controller.rb`:
```ruby
# frozen_string_literal: true

class InertiaController < ApplicationController
  inertia_share user: -> { Current.user&.as_json(only: [ :id, :email, :role ]) }
end
```

- [ ] **Step 4: Write a failing request spec proving the shared prop**

Create `spec/requests/landing_authenticated_spec.rb`:
```ruby
require "rails_helper"

RSpec.describe "Landing shared user prop", type: :request do
  it "exposes no user prop when anonymous" do
    get "/"
    expect(response).to have_http_status(:ok)
    # Inertia serializes props into the initial-page data-page attribute.
    expect(response.body).to include('&quot;user&quot;:null').or include('"user":null')
  end

  it "exposes the user prop when signed in" do
    user = User.create!(email: "viewer@example.com", password: "password123")
    sign_in user

    get "/"
    expect(response).to have_http_status(:ok)
    expect(response.body).to include("viewer@example.com")
  end
end
```

- [ ] **Step 5: Wire Devise request-spec helpers**

Create `spec/support/devise.rb`:
```ruby
RSpec.configure do |config|
  config.include Devise::Test::IntegrationHelpers, type: :request
end
```

Ensure support files load — in `spec/rails_helper.rb`, uncomment/confirm this line is active:
```ruby
Rails.root.glob('spec/support/**/*.rb').sort_by(&:to_s).each { |f| require f }
```

- [ ] **Step 6: Run the spec**

Run: `bundle exec rspec spec/requests/landing_authenticated_spec.rb`
Expected: both examples PASS. If the `data-page` JSON encoding differs (Inertia may HTML-escape quotes), adjust the anonymous assertion to match the actual encoding you observe — the intent is "user is null when anonymous, email present when signed in."

- [ ] **Step 7: Run the full suite**

Run: `bundle exec rspec`
Expected: **20 examples, 0 failures**.

- [ ] **Step 8: Commit**

```bash
git add app/models/current.rb app/controllers/application_controller.rb app/controllers/inertia_controller.rb spec/support/devise.rb spec/rails_helper.rb spec/requests/landing_authenticated_spec.rb
git commit -m "Share current user with all Inertia pages via Current + inertia_share"
```

---

## Chunk 2: Login UI, logout, RailsAdmin, seeds

### Task 5: Custom Inertia login + 303 logout

**Files:**
- Modify: `config/routes.rb`
- Create: `app/controllers/users/sessions_controller.rb`, `app/frontend/pages/Login.jsx`
- Test: `spec/requests/sessions_spec.rb`

- [ ] **Step 1: Point the Devise route at our controller and drop registrations**

In `config/routes.rb`, replace the generated `devise_for :users` line with:
```ruby
  devise_for :users,
    skip: [ :registrations ],
    controllers: { sessions: "users/sessions" }
```

- [ ] **Step 2: Create the sessions controller**

Create `app/controllers/users/sessions_controller.rb`:
```ruby
# frozen_string_literal: true

# Inherits Devise::SessionsController (NOT InertiaController), so the shared
# `user` prop is intentionally absent on the Login page.
class Users::SessionsController < Devise::SessionsController
  # Render the React login page instead of Devise's ERB view.
  def new
    render inertia: "Login", props: {
      alert: flash[:alert]
    }
  end

  private

  # Inertia requires a 303 redirect after a non-GET request (logout is DELETE).
  def respond_to_on_destroy
    redirect_to after_sign_out_path_for(resource_name), status: :see_other
  end
end
```
Note: `respond_to_on_destroy` is the Devise hook that builds the logout response; overriding it to `:see_other` (303) satisfies Inertia. Login *success* uses Devise's default POST→302 redirect to `root_path`, which Inertia accepts for POST — no override needed. No change to `config/initializers/devise.rb` is required (`sign_out_via: :delete` is already Devise's default).

- [ ] **Step 3: Create the login page**

Create `app/frontend/pages/Login.jsx`, matching `Landing.jsx` styling conventions (cream bg, flat inputs, orange button, Spanish copy):
```jsx
import { useForm } from '@inertiajs/react'

export default function Login({ alert }) {
  const form = useForm({ user: { email: '', password: '', remember_me: false } })

  const submit = (e) => {
    e.preventDefault()
    form.post('/users/sign_in')
  }

  return (
    <main className="min-h-screen bg-cream font-body text-blue-ink">
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-orange-ink">
          Manual del Color Vivo
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-blue">Iniciar sesión</h1>

        {alert && (
          <p role="alert" className="mt-4 text-sm text-orange-ink">{alert}</p>
        )}

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm">Correo electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.data.user.email}
              onChange={(e) => form.setData('user', { ...form.data.user, email: e.target.value })}
              className="w-full border border-blue/20 bg-white px-3 py-3 text-[15px] outline-none focus:border-orange"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={form.data.user.password}
              onChange={(e) => form.setData('user', { ...form.data.user, password: e.target.value })}
              className="w-full border border-blue/20 bg-white px-3 py-3 text-[15px] outline-none focus:border-orange"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.data.user.remember_me}
              onChange={(e) => form.setData('user', { ...form.data.user, remember_me: e.target.checked })}
            />
            Recordarme
          </label>

          <button
            type="submit"
            disabled={form.processing}
            className="font-display bg-orange px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Write failing request specs**

Create `spec/requests/sessions_spec.rb`:
```ruby
require "rails_helper"

RSpec.describe "Sessions", type: :request do
  it "renders the login page" do
    get "/users/sign_in"
    expect(response).to have_http_status(:ok)
    expect(response.body).to include("Login") # Inertia component name in data-page
  end

  it "signs in with valid credentials and redirects to root" do
    User.create!(email: "user@example.com", password: "password123")

    post "/users/sign_in", params: { user: { email: "user@example.com", password: "password123" } }

    expect(response).to redirect_to(root_path)
    follow_redirect!
    expect(response).to have_http_status(:ok)
  end

  it "rejects invalid credentials without a session" do
    User.create!(email: "user@example.com", password: "password123")

    post "/users/sign_in", params: { user: { email: "user@example.com", password: "wrong" } }

    expect(response).to redirect_to(new_user_session_path)
  end

  it "signs out with a 303 redirect (Inertia requirement)" do
    user = User.create!(email: "user@example.com", password: "password123")
    sign_in user

    delete "/users/sign_out"

    expect(response).to have_http_status(:see_other) # 303
    expect(response).to redirect_to(root_path)
  end

  it "has no self-registration route" do
    expect(Rails.application.routes.url_helpers).not_to respond_to(:new_user_registration_path)
  end
end
```
Note: the invalid-credentials redirect target is Devise's Warden failure app default (`new_user_session_path`). If your Devise config differs, assert on `response` being a 3xx to sign-in rather than a session being established.

- [ ] **Step 5: Run the specs**

Run: `bundle exec rspec spec/requests/sessions_spec.rb`
Expected: all examples PASS. Adjust the registration-route assertion if needed to simply confirm `new_user_registration_path` is undefined.

- [ ] **Step 6: Run the full suite**

Run: `bundle exec rspec`
Expected: green (**~25 examples, 0 failures**).

- [ ] **Step 7: Commit**

```bash
git add config/routes.rb app/controllers/users/sessions_controller.rb app/frontend/pages/Login.jsx spec/requests/sessions_spec.rb
git commit -m "Add Inertia login page, 303 logout, no self-registration"
```

---

### Task 6: RailsAdmin mounted admin-only at /antesis-admin

**Files:**
- Create (generator): `config/initializers/rails_admin.rb`
- Modify: `config/initializers/rails_admin.rb`, `config/routes.rb`
- Test: `spec/requests/rails_admin_access_spec.rb`

- [ ] **Step 1: Run the RailsAdmin install generator**

Run: `bin/rails generate rails_admin:install`
When prompted for the route/namespace, answer `antesis-admin`. When asked about the user model for Devise, answer `User`.
Expected: creates `config/initializers/rails_admin.rb` and adds a `mount RailsAdmin::Engine => '/antesis-admin', as: 'rails_admin'` line to `config/routes.rb`.

- [ ] **Step 2: Move the mount behind a Devise authentication constraint**

In `config/routes.rb`, remove the plain `mount RailsAdmin::Engine ...` line the generator added and replace it with an authentication-gated mount. **Note:** the constraint enforces *login only* (`authenticate :user`), NOT `->(u){ u.admin? }`. A block-based role constraint would make a logged-in commenter fall through to a 404 (the route wouldn't match) instead of being redirected — the admin gate belongs in the initializer's `authorize_with` (Step 3), which can redirect non-admins to root.
```ruby
  authenticate :user do
    mount RailsAdmin::Engine => "/antesis-admin", as: "rails_admin"
  end
```

- [ ] **Step 3: Configure RailsAdmin (asset source + Warden guards)**

In `config/initializers/rails_admin.rb`, set the propshaft asset source and the defense-in-depth guards. RailsAdmin controllers do NOT inherit `ApplicationController`, so resolve the user through Warden, not `Current.user`:
```ruby
RailsAdmin.config do |config|
  config.asset_source = :propshaft

  ### Popular gems integration
  config.authenticate_with do
    warden.authenticate! scope: :user
  end
  config.authorize_with do
    unless current_user&.admin?
      redirect_to main_app.root_path
    end
  end
  config.current_user_method(&:current_user)

  config.actions do
    dashboard
    index
    new
    export
    bulk_delete
    show
    edit
    delete
  end
end
```
Note: `current_user` inside RailsAdmin resolves via `config.current_user_method`, which reads Devise's Warden-backed `current_user`. This works even though the engine bypasses `ApplicationController`.

- [ ] **Step 4: Write failing access specs**

Create `spec/requests/rails_admin_access_spec.rb`:
```ruby
require "rails_helper"

RSpec.describe "RailsAdmin access", type: :request do
  it "redirects anonymous users away from the admin" do
    get "/antesis-admin"
    expect(response).to have_http_status(:found) # redirected to login
    expect(response).not_to have_http_status(:ok)
  end

  it "blocks a commenter from the admin (authenticated but not admin)" do
    sign_in User.create!(email: "c@example.com", password: "password123", role: :commenter)

    get "/antesis-admin"
    # Passes the route's `authenticate :user` gate, then the initializer's
    # authorize_with redirects the non-admin to root.
    expect(response).to redirect_to(root_path)
  end

  it "allows an admin into the admin dashboard" do
    sign_in User.create!(email: "a@example.com", password: "password123", role: :admin)

    get "/antesis-admin"
    expect(response).to have_http_status(:ok)
  end
end
```

- [ ] **Step 5: Run the specs**

Run: `bundle exec rspec spec/requests/rails_admin_access_spec.rb`
Expected: all 3 PASS. If the anonymous case returns a different 3xx target, assert on "not 200 + not admin content" rather than an exact path.

- [ ] **Step 6: Browser-verify the admin renders styled (propshaft assets)**

Start the dev stack (`./serve-dev`), sign in as an admin, visit `http://localhost:3000/antesis-admin`. Confirm the RailsAdmin UI loads **with CSS applied** (not unstyled HTML) — this proves `config.asset_source = :propshaft` serves the engine's assets. If unstyled, run `bin/rails assets:precompile` once and reload, and record the finding.

- [ ] **Step 7: Run the full suite**

Run: `bundle exec rspec`
Expected: green (**~28 examples, 0 failures**).

- [ ] **Step 8: Commit**

```bash
git add config/initializers/rails_admin.rb config/routes.rb spec/requests/rails_admin_access_spec.rb
git commit -m "Mount admin-only RailsAdmin at /antesis-admin with propshaft assets"
```

---

### Task 7: Landing logged-in state

**Files:**
- Modify: `app/frontend/pages/Landing.jsx`
- Test: extend `spec/requests/landing_authenticated_spec.rb`

- [ ] **Step 1: Add logged-in UI to Landing.jsx**

The `user` prop is shared globally (Task 4), so add it to the `Landing` component signature and render a header block. Use Inertia's `Link`/`router` for the logout DELETE.

At the top of `app/frontend/pages/Landing.jsx`, update imports and signature:
```jsx
import { useForm, router } from '@inertiajs/react'
import coverUrl from '../assets/cover.jpg'

export default function Landing({ subscribed, alreadySubscribed, source, user }) {
```

Inside `<main>`, as the first child before the grid `<div>`, add an auth bar:
```jsx
      <header className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-6 py-4 text-sm">
        {user ? (
          <>
            <span className="text-blue-ink/80">Hola, {user.email}</span>
            {user.role === 'admin' && (
              <a href="/antesis-admin" className="font-display font-semibold text-blue">Admin</a>
            )}
            <button
              type="button"
              onClick={() => router.delete('/users/sign_out')}
              className="font-display font-semibold text-orange-ink"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <a href="/users/sign_in" className="font-display font-semibold text-blue">Iniciar sesión</a>
        )}
      </header>
```
Adjust `min-h-screen` layout only if the header visibly breaks vertical centering; the email-capture behavior and copy must stay unchanged.

- [ ] **Step 2: Extend the request spec for the admin link**

Append to `spec/requests/landing_authenticated_spec.rb`:
```ruby
  it "shows an admin link for admins" do
    sign_in User.create!(email: "boss@example.com", password: "password123", role: :admin)
    get "/"
    expect(response.body).to include("/antesis-admin")
  end
```

- [ ] **Step 3: Run the spec**

Run: `bundle exec rspec spec/requests/landing_authenticated_spec.rb`
Expected: PASS (admin sees `/antesis-admin` in the serialized props/markup).

- [ ] **Step 4: Browser-verify the three states**

With `./serve-dev` running: (a) anonymous `/` shows "Iniciar sesión" and the email form; (b) signed-in commenter shows greeting + "Cerrar sesión", no Admin link; (c) admin shows the Admin link; clicking "Cerrar sesión" logs out and returns to the anonymous landing.

- [ ] **Step 5: Run the full suite**

Run: `bundle exec rspec`
Expected: green.

- [ ] **Step 6: Commit**

```bash
git add app/frontend/pages/Landing.jsx spec/requests/landing_authenticated_spec.rb
git commit -m "Add logged-in state (greeting, logout, admin link) to landing"
```

---

### Task 8: Seed admin + env docs + serve scripts

**Files:**
- Modify: `db/seeds.rb`, `.env.example`, `serve`, `serve-dev`

- [ ] **Step 1: Seed one admin from env**

In `db/seeds.rb`, add:
```ruby
if ENV["ADMIN_EMAIL"].present? && ENV["ADMIN_PASSWORD"].present?
  User.find_or_create_by!(email: ENV.fetch("ADMIN_EMAIL")) do |u|
    u.password = ENV.fetch("ADMIN_PASSWORD")
    u.role = :admin
  end
  puts "Seeded admin #{ENV.fetch('ADMIN_EMAIL')}"
else
  puts "Skipping admin seed (set ADMIN_EMAIL and ADMIN_PASSWORD to enable)"
end
```

- [ ] **Step 2: Document env vars**

Add to `.env.example`:
```
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

- [ ] **Step 3: Verify the seed is idempotent**

Set `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env`, then run:
```bash
bin/rails db:seed
bin/rails db:seed
```
Expected: first run creates the admin; second run does not raise and does not create a duplicate (`User.where(role: "admin").count` stays 1).

- [ ] **Step 4: Confirm serve scripts need no structural change**

Read `serve` and `serve-dev`. `serve` already runs `bin/rails assets:precompile`, which now includes RailsAdmin's propshaft assets — no new pane needed. `serve-dev` serves assets dynamically via propshaft — no Vite pane change needed. Add a brief comment to each script noting that `/antesis-admin` (RailsAdmin) is served by propshaft, so a future maintainer doesn't reintroduce sprockets. Only add an actual command if Step 6 of Task 6 found the admin unstyled under `serve-dev`.

- [ ] **Step 5: Run the full suite one final time**

Run: `bundle exec rspec`
Expected: green, all phases' examples passing.

- [ ] **Step 6: Commit**

```bash
git add db/seeds.rb .env.example serve serve-dev
git commit -m "Seed admin from env, document ADMIN_* vars, note propshaft admin assets"
```

---

## Final verification checklist (before declaring Phase 2b done)

- [ ] `bundle exec rspec` — all green, no fewer than the pre-phase 14 baseline plus the new specs.
- [ ] `./serve-dev` boots; `/` renders anonymous, commenter, and admin states correctly.
- [ ] Login with valid creds redirects to `/`; invalid creds show the Spanish alert on the login page.
- [ ] `/antesis-admin` is 200 for admin, redirects for commenter and anonymous.
- [ ] Logout returns to the anonymous landing (303 under the hood).
- [ ] `bin/rails db:seed` twice is idempotent.
- [ ] No `tailwind.config.js` created; no sprockets added; no Action Cable reintroduced.
- [ ] Verify Phase 2b result against the spec `docs/superpowers/specs/2026-07-09-phase2b-devise-auth-roles-design.md` (per the HANDOFF lesson: don't trust "implemented" — check against spec).
