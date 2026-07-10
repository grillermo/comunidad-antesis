# Phase 2b — Devise Auth, Roles & RailsAdmin — Design

**Date**: 2026-07-09
**Phase**: 2b (auth foundation), part of the comunidad-antesis ebook platform
**Status**: Design approved, pending spec review

## Goal

Add authentication and role-based authorization to the app. Users log in with
email + password (Devise), there is no public self-registration, and an admin
manages all accounts through a RailsAdmin UI mounted at `/admin`. The landing
page (`/`) gains a logged-in state. This phase builds the auth foundation that
Phase 2c (ebook/sections, authenticated-only) and Phase 2d (comments,
role-gated) depend on.

## Scope

**In scope**
- Devise install + `User` model (email login).
- Two roles (`commenter`, `admin`) as a string-backed enum.
- Custom Inertia/React login page (no Devise ERB views).
- Logout.
- RailsAdmin at `/admin`, admin-only, for user management.
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
| Roles | `enum role: { commenter: "commenter", admin: "admin" }`, string-backed, default `commenter`, `null: false` | Two mutually-exclusive tiers (viewer dropped per user). Strings are DB-readable. |
| Devise modules | `database_authenticatable, validatable, rememberable, trackable` | Login, remember-me, and sign-in analytics without needing a mailer. No `registerable`/`recoverable`/`confirmable`. |
| Account creation | RailsAdmin UI + one env-seeded admin | User chose RailsAdmin (`railsadminteam/rails_admin`). Seed admin bootstraps a fresh DB so `/admin` is reachable. |
| RailsAdmin assets | Sprockets (RailsAdmin default), not Vite | User's explicit choice; avoids wiring RailsAdmin's asset bundle into Vite. |
| Post-login destination | Redirect to `/` (landing, logged-in state) | No protected app pages exist until 2c; landing already renders via Inertia. |
| Current user sharing | `Current` (ActiveSupport::CurrentAttributes) + activate `inertia_share` in `InertiaController` | The commented `inertia_share user:` line in `InertiaController` is the intended home for this. |

## Architecture

### Gems
- `devise` — authentication.
- `rails_admin ~> 3.3` — admin UI at `/admin`. Transitively pulls
  `turbo-rails`, `kaminari`, `nested_form`; these are scoped to the mounted
  engine's own server-rendered pages and do not affect Inertia pages. (The
  HANDOFF warning was specifically about Action Cable / `solid_cable`, not the
  `turbo-rails` gem, and no Action Cable is introduced.)
- `sprockets-rails` — required for RailsAdmin's asset serving in sprockets mode.

### Asset pipeline coexistence (implementation risk to resolve in the plan)
The app currently uses **propshaft** for its own assets and **Vite** for the
Inertia/React frontend. Adding `sprockets-rails` for RailsAdmin means sprockets
and propshaft both register asset tasks. The plan must ensure:
- App/Inertia assets continue to build via Vite + propshaft exactly as today
  (landing page, `application.css` `@theme` tokens unchanged).
- Sprockets serves **only** RailsAdmin's gem-provided assets (its manifest /
  `rails_admin.css`/`rails_admin.js`), not the app's.
- `bin/rails assets:precompile` produces both sets without conflict.
If propshaft + sprockets-rails cannot cleanly coexist, the plan falls back to
RailsAdmin's importmap or Vite/cssbundling asset mode — but the default target
is sprockets per the user's decision.

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
  mount RailsAdmin::Engine => "/admin", as: "rails_admin"
end
```
- `Users::SessionsController < Devise::SessionsController` overrides `new` to
  `render inertia: "Login"` and lets `create`/`destroy` use Devise's flow,
  redirecting to `/` on success and re-rendering Login with a Spanish flash on
  failure.
- RailsAdmin is additionally guarded in its initializer
  (`config.authenticate_with` → require `current_user`; `config.authorize_with`
  → `unless current_user&.admin?` raise `Forbidden`) as defense in depth beyond
  the route constraint. Non-admins never reach the engine.

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
  show an "Admin" link to `/admin`. When absent, show an "Iniciar sesión" link
  to `/users/sign_in`. Anonymous landing behavior (email capture) is unchanged.

### Localization
Devise flash messages in Spanish, consistent with the existing
`NewsletterEmail` Spanish validation messages (e.g. via `config/locales/devise.es.yml`
and setting the default locale, or overriding the specific flash keys used).

### Seeds
`db/seeds.rb` creates one admin if none exists, from `ADMIN_EMAIL` /
`ADMIN_PASSWORD` (dotenv). Idempotent (`find_or_create_by!(email:)`). Documented
in `.env.example` if present.

### serve / serve-dev updates
- `serve` already runs `bin/rails assets:precompile`; confirm it now also emits
  RailsAdmin's sprockets assets (no new pane needed).
- `serve-dev`: sprockets serves RailsAdmin assets dynamically in development, so
  no Vite change is required for `/admin`. Verify `/admin` renders styled under
  `serve-dev`; add a precompile step or note only if dynamic serving proves
  insufficient.

## Testing (RSpec)

- **Model** (`spec/models/user_spec.rb`): email presence/uniqueness/format &
  password validation (Devise `validatable`); role enum defaults to
  `commenter`; `admin?`/`commenter?` predicates.
- **Request** (`spec/requests/`):
  - `/admin` → redirect/deny for anonymous, deny for commenter, allow for admin.
  - Login success (valid creds → redirect `/`, session set).
  - Login failure (bad creds → Login re-rendered, Spanish flash, no session).
  - Logout clears the session.
  - Landing exposes the `user` Inertia prop when authenticated, and not when
    anonymous.
- The existing 14 examples must remain green (`bundle exec rspec`).

## Risks / Notes

- **propshaft + sprockets-rails coexistence** is the main implementation risk;
  see the asset-pipeline section. Resolve before wiring the rest.
- RailsAdmin's UI is server-rendered inside its engine — expected and isolated;
  it does not change the Inertia app's rendering.
- No mailer/SMTP is configured this phase; nothing depends on it yet.
