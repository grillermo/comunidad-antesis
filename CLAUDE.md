# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Rails 8.0.5 monolith (Ruby 3.4.7), PostgreSQL, Inertia Rails + React 19 + Vite + Tailwind CSS 4. Solid Queue (jobs) and Solid Cache, both DB-backed (no Redis). Devise for auth. RSpec for tests. Deploys to a single bare-metal/VPS host via `./serve` — no Docker/Kamal.

## Commands

```bash
bundle install && npm install        # setup
cp .env.example .env
bin/rails db:prepare

./serve-dev                          # dev: tmux session with Rails server, Vite HMR, Solid Queue worker
./serve                              # production-style: precompiled assets, Rails in production mode, Solid Queue worker

bundle exec rspec                    # full test suite
bundle exec rspec spec/path/to_spec.rb        # single file
bundle exec rspec spec/path/to_spec.rb:42     # single example by line
bin/vite build                       # asset build check
bin/rubocop                          # lint (Omakase Rails style)
bin/brakeman                         # security static analysis
curl http://localhost:${RAILS_PORT:-3000}/health   # health check
```

No JS test runner or lint script is configured in `package.json` — frontend correctness is covered by RSpec request specs plus manual verification.

## Architecture

**The "manual" is static content, not database rows.** `app/models/manual.rb` defines `Manual::TABLE_OF_CONTENTS`, a hardcoded tree (transcribed from `./project/MaquetaCompleta-ManualDelColorVivo-VER1.pdf/`, the source book) of `{title, slug, children}` nodes. `config/routes.rb` calls `Manual.walk` to generate one GET route per node, each pinning `component:` (the slug path) as a route default — never derived from user input. `ManualController#show` looks up the node via `Manual.find(segments)` and renders the Inertia component at `manual-del-color-vivo/#{params[:component]}`, which must exist as a `.jsx` file under `app/frontend/pages/manual-del-color-vivo/` with a matching path. **Slugs are stable identifiers — never change a shipped slug**, since it's both the URL and the page file path. `spec/manual_content_spec.rb` and `spec/models/manual_pages_spec.rb` guard content completeness (no leftover "Contenido próximamente" placeholders) and slug/page-file correspondence.

**Inertia prop sharing**: `InertiaController < ApplicationController` shares the `user` prop (id/email/role) on every Inertia render via `inertia_share`. `Users::SessionsController` deliberately extends `Devise::SessionsController` directly (not `InertiaController`) so the Login page never receives a `user` prop. `ApplicationController#set_current_user` populates `Current.user` from Devise's `current_user` on every request; controllers and serializers read `Current.user` rather than calling `current_user` directly.

**Comments**: threaded via the `ancestry` gem (`Comment#has_ancestry`), scoped to a `section_path` (the manual slug path) rather than a foreign key to a manual row (since manual sections aren't DB records). Soft-deleted (`deleted_at`) rather than destroyed, showing a tombstone body. `CommentTree` (`app/serializers/comment_tree.rb`) builds the full nested, permission-annotated JSON tree for one section per request — root comments sort sticky-first then by hearts/recency, replies sort chronologically. Body is rendered to `body_html` via `CommentMarkdown` on save (`before_save`, only when body changed). New comments and replies trigger `CommentMailer` (admin notification + reply notification to thread subscribers via `CommentSubscription`), delivered through Solid Queue (`deliver_later`).

**Comment moderation**: uses signed, purpose-scoped tokens (`Comment.find_signed(token, purpose: :approve)`, Rails' `ActiveRecord::SignedId`) as bearer credentials for one-click email-based approval (`Moderation::ApprovalsController`) — no separate admin-only route/auth needed for that action.

**Reader continuity**: `User#last_manual_path` is updated (via `update_column`, bypassing validations/timestamps as a read-path side effect) whenever a signed-in reader visits a manual page. `Users::SessionsController#after_sign_in_path_for` sends them back to: an explicitly stored Devise location, else their last manual path, else the manual root.

**Rate limiting**: uses Rails 8's built-in controller-level `rate_limit` (see `Users::SessionsController`), not an external gem — separate IP-based and email-based limits on login attempts.

**Admin access**: `RailsAdmin` engine mounted at `/antesis-admin`, gated by `authenticate :user, ->(user) { user.admin? }` in routes. `User#role` enum (`commenter`/`admin`), default `commenter`. Admin seeding is opt-in via `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars in `db/seeds.rb` (idempotent; raises if the email belongs to an existing non-admin).

**Frontend**: Inertia pages live in `app/frontend/pages/`, most nested under `manual-del-color-vivo/` mirroring the slug tree. Shared manual chrome (title, "back to contents" link, next-page link, comment thread) lives in `ManualLayout.jsx`; reusable content primitives (recipes, callouts, material lists, steps, dividers) live in `app/frontend/components/manual/`. No SSR is wired into routes despite `app/frontend/ssr/ssr.jsx` existing.


## About this site

This is a site in spanish, but make sure all development work happens in english, all documentation. Only user facing string should be in spanish.
