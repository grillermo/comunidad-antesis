# Phase 2b — Devise Auth, Roles & RailsAdmin — Design

**Date**: 2026-07-09
**Phase**: 2b (auth foundation), part of the comunidad-antesis ebook platform
**Status**: Design approved, pending spec review

## Goal

Add authentication and role-based authorization to the app. Users log in with
email + password (Devise), there is no public self-registration, and an admin
manages all accounts through a RailsAdmin UI mounted at `/antesis-admin`. The landing
page (`/`) gains a logged-in state. This phase builds the auth foundation that
Phase 2c (ebook/sections, authenticated-only) and Phase 2d (comments,
role-gated) depend on.

## Scope

**In scope**
- Devise install + `User` model (email login).
- Two roles (`commenter`, `admin`) as a string-backed enum.
- Custom Inertia/React login page (no Devise ERB views).
- Logout.
- RailsAdmin at `/antesis-admin`, admin-only, for user management.
- `Current.user` + Inertia shared `user` prop; landing shows logged-in state.
- One seeded admin from env vars for a fresh DB.
- RSpec coverage for the above.

**Out of scope (later phases)**
- Password reset / mailer (no `recoverable` module now).
- Ebook/section pages and their `authenticate_user!` gating (Phase 2c).
- Comment roles/permissions beyond storing the role (Phase 2d).
- A bespoke Inertia admin UI (RailsAdmin covers admin needs for now).

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth engine | Devise, custom Inertia views | Spec says "devise"; Devise's Turbo/ERB views are replaced by a React login page so it fits Inertia. |
| Login identifier | Email + password | Simpler standard Devise; email is also needed for Phase 2d reply-notification emails. |
| Roles | `enum :role, { commenter: "commenter", admin: "admin" }`, string-backed, default `commenter`, `null: false` | Two mutually-exclusive tiers (viewer dropped per user). Strings are DB-readable. |
| Devise modules | `database_authenticatable, validatable, rememberable, trackable` | Login, remember-me, and sign-in analytics without needing a mailer. No `registerable`/`recoverable`/`confirmable`. |
| Account creation | RailsAdmin UI + one env-seeded admin | User chose RailsAdmin (`railsadminteam/rails_admin`). Seed admin bootstraps a fresh DB so `/antesis-admin` is reachable. |
| RailsAdmin assets | Propshaft (the app's existing pipeline) | RailsAdmin 3 supports propshaft (railsadminteam/rails_admin#3675); no sprockets needed, no second asset pipeline. |
| Post-login destination | Redirect to `/` (landing, logged-in state) | No protected app pages exist until 2c; landing already renders via Inertia. |
| Current user sharing | `Current` (ActiveSupport::CurrentAttributes) + activate `inertia_share` in `InertiaController` | The commented `inertia_share user:` line in `InertiaController` is the intended home for this. |

## Architecture

### Gems
- `devise` — authentication.
- `rails_admin ~> 3.3` — admin UI at `/antesis-admin`. Transitively pulls
  `turbo-rails`, `kaminari`, `nested_form`; these are scoped to the mounted
  engine's own server-rendered pages and do not affect Inertia pages. (The
  HANDOFF warning was specifically about Action Cable / `solid_cable`, not the
  `turbo-rails` gem, and no Action Cable is introduced.)
### Asset pipeline
RailsAdmin 3 supports **propshaft** (railsadminteam/rails_admin#3675), which is
already the app's asset pipeline. RailsAdmin's gem-provided assets are served/
precompiled by propshaft; the app/Inertia assets continue to build via Vite +
propshaft exactly as today (landing page and `application.css` `@theme` tokens
unchanged). No sprockets, no second asset pipeline, no importmap.

### User model
`users` table (Devise-generated migration, extended):
- Devise fields for `database_authenticatable` (`email`, `encrypted_password`),
  `rememberable` (`remember_created_at`), `trackable` (`sign_in_count`,
  `current_sign_in_at`, `last_sign_in_at`, `current_sign_in_ip`,
  `last_sign_in_ip`).
- `role` — string, `null: false`, default `"commenter"`, indexed.
- Unique index on `email`.

```ruby
class User < ApplicationRecord
  devise :database_authenticatable, :validatable, :rememberable, :trackable
  enum :role, { commenter: "commenter", admin: "admin" }, default: "commenter"
end
```
`user.admin?` / `user.commenter?` come from the enum.

### Routing & controllers
```ruby
devise_for :users,
  skip: [:registrations],
  controllers: { sessions: "users/sessions" }

authenticate :user, ->(u) { u.admin? } do
  mount RailsAdmin::Engine => "/antesis-admin", as: "rails_admin"
end
```
- `Users::SessionsController < Devise::SessionsController` overrides `new` to
  `render inertia: "Login"` and lets `create`/`destroy` use Devise's flow,
  redirecting to `/` on success and re-rendering Login with a Spanish flash on
  failure.
- RailsAdmin is additionally guarded in its initializer as defense in depth
  beyond the route constraint. Because RailsAdmin's controllers do **not**
  inherit from `ApplicationController`, its guards resolve the user via Warden/
  Devise directly (`warden.authenticate!(scope: :user)` in
  `config.authenticate_with`, and `config.authorize_with { unless
  warden.user&.admin? ... }`), **not** via the `Current.user` set in
  `ApplicationController`'s `before_action` (which may be unset in the engine's
  request cycle). Non-admins never reach the engine.

### Current user + Inertia sharing
- Add `app/models/current.rb`:
  ```ruby
  class Current < ActiveSupport::CurrentAttributes
    attribute :user
  end
  ```
- `ApplicationController` sets `Current.user = current_user` in a `before_action`.
- `InertiaController` activates the shared prop:
  ```ruby
  inertia_share user: -> { Current.user&.as_json(only: [:id, :email, :role]) }
  ```
- `LandingController` already renders `Landing` via Inertia, so the `user` prop
  is available there automatically.

### Frontend
- `app/frontend/pages/Login.jsx` — flat React page reusing the palette and
  `useForm`/accessible-error conventions from `Landing.jsx`. Fields: email,
  password, remember-me checkbox; submits to `POST /users/sign_in`. Shows
  Devise's Spanish auth error.
- `Landing.jsx` updated: when the `user` prop is present, show a greeting +
  "Cerrar sesión" (logout, `DELETE /users/sign_out`); if `user.role === "admin"`,
  show an "Admin" link to `/antesis-admin`. When absent, show an "Iniciar sesión" link
  to `/users/sign_in`. Anonymous landing behavior (email capture) is unchanged.
### Localization

Set `config.i18n.default_locale = :es` (in `config/application.rb`) and add a
`config/locales/devise.es.yml` so Devise's flash/error messages render in
Spanish, consistent with the existing `NewsletterEmail` Spanish messages.
Nothing currently relies on `:en` I18n (existing strings are hardcoded Spanish),
so flipping the default locale is low-risk and matches the Spanish-only product.

### Seeds
`db/seeds.rb` creates one admin if none exists, from `ADMIN_EMAIL` /
`ADMIN_PASSWORD` (dotenv). Idempotent, with `password` and `role` set in the
create block (not the finder) so a re-run matches only on email and the created
record is valid:
```ruby
User.find_or_create_by!(email: ENV.fetch("ADMIN_EMAIL")) do |u|
  u.password = ENV.fetch("ADMIN_PASSWORD")
  u.role = :admin
end
```
Documented in `.env.example` if present.

### serve / serve-dev updates
- `serve` already runs `bin/rails assets:precompile`; propshaft will include
  RailsAdmin's assets automatically (no new pane, no extra step).
- `serve-dev`: propshaft serves RailsAdmin's assets in development the same way
  it serves the app's; no Vite change needed for `/antesis-admin`. Verify `/antesis-admin`
  renders styled under `serve-dev`.

## Testing (RSpec)

- **Model** (`spec/models/user_spec.rb`): email presence/uniqueness/format &
  password validation (Devise `validatable`); role enum defaults to
  `commenter`; `admin?`/`commenter?` predicates.
- **Request** (`spec/requests/`):
  - `/antesis-admin` → redirect/deny for anonymous, deny for commenter, allow for admin.
  - Login success (valid creds → redirect `/`, session set).
  - Login failure (bad creds → Login re-rendered, Spanish flash, no session).
  - Logout clears the session; `DELETE /users/sign_out` returns a 303 redirect
    (Inertia requires 303 after non-GET) landing on the public Landing page.
  - Landing exposes the `user` Inertia prop when authenticated, and not when
    anonymous.
- The existing 14 examples must remain green (`bundle exec rspec`).

## Risks / Notes

- RailsAdmin's UI is server-rendered inside its engine — expected and isolated;
  it does not change the Inertia app's rendering.
- No mailer/SMTP is configured this phase; nothing depends on it yet.
