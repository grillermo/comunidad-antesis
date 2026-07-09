# Phase 1: Rails App Skeleton & Infra — Design

## Context

`comunidad-antesis` is a new Rails application to promote and sell access to a
Spanish-language digital ebook ("Manual del Color Vivo"). The full feature set
(landing page, auth, ebook/sections content, Reddit-style comment system) is
large and will be broken into multiple specs. This document covers **Phase
1 only**: the bare application skeleton and infrastructure that every later
phase depends on. No product features (landing page, auth, ebook, comments)
are in scope here.

Source spec: `docs/initial-prompt.md`.

## Goals

- A bootable Rails 8 app, checked into the repo root, with Postgres,
  RSpec, Inertia+React+Vite+Tailwind wired up.
- A `/health` endpoint proving the app and its Postgres-backed services are up.
- Dev and prod process-management scripts (`./serve-dev`, `./serve`) using
  tmux, no Docker.
- Baseline repo hygiene (`.gitignore`, `README.md`, env var handling).

## Out of scope

- Any Rails models/controllers/views for landing page, auth, Ebook/Section,
  or comments — these are later phases.
- `AGENTS.md`/`CLAUDE.md` content — written after the full app exists, per
  the original spec's instruction ("Add claude.md after building the app").
  Phase 1 does not write this file.
- Any third-party API integration (the `http` gem is installed but unused).

## Stack decisions

| Concern | Choice | Why |
|---|---|---|
| Ruby | 3.4.7 via rbenv | Per spec. `.ruby-version` + hardcoded in `Gemfile`. |
| Rails | 8.x | Ships with Solid Queue/Solid Cache built-in, matching the spec's Postgres-backed cache/job requirement natively. |
| DB | PostgreSQL, single schema, dev/test/production databases | Per spec. |
| Cache | Solid Cache (Postgres-backed) | Per spec, Rails 8 default. |
| Jobs | Solid Queue (Postgres-backed), `bin/jobs` runner, STDOUT logging | Per spec. |
| Schema | Cache + Queue tables merged into primary `db/schema.rb` | Per spec's "unified schema" requirement — Rails 8 supports this via single-database config instead of the default 3-database (`queue`/`cache`/`cable` split) setup. |
| Test framework | RSpec (replaces Minitest) | Per spec. |
| Frontend | Inertia Rails + React + Vite (`vite_rails`) + Tailwind | Per spec (pure React, props from controllers) + user preference for Vite/Tailwind. |
| HTTP client | `http` gem (httprb) installed, no usage yet | Per spec, for future 3rd-party calls. |
| Env vars | `.env` + `dotenv-rails`, `.env.example` committed, `.env` gitignored | Needed for `RAILS_PORT` etc. referenced in `serve-dev`/`serve`. |
| Deploy target | Bare-metal single host, no Docker | User instruction: strip Rails 8's default `Dockerfile`/`.dockerignore`/`bin/docker-entrypoint`. |
| App location | Repo root (`rails new .`) | Alongside existing `docs/` and `project/` directories. |

## `/health` endpoint

- Dedicated `HealthController#show`, mounted at `GET /health`.
- Checks, in order:
  1. DB connection (`ActiveRecord::Base.connection.active?` / a trivial query).
  2. Solid Queue reachability (its tables live in the primary DB; a simple
     count query against a Solid Queue table confirms reachability).
  3. Solid Cache reachability (write+read a throwaway key, or a simple query
     against its table).
- Returns `200 OK` with a small JSON body (`{ status: "ok", checks: {...} }`)
  only if all three pass.
- Returns `503 Service Unavailable` with per-check status if any fail.
- No authentication required (used by external uptime monitors / load
  balancers).

## Scripts

Both scripts follow the tmux-pane pattern from the spec's `serve-dev`
example, extended with a Vite pane.

**`./serve-dev`** (development):
- Loads `.env`.
- tmux session `comunidad-antesis`, 3 panes:
  1. `bin/rails s -p $RAILS_PORT -b 0.0.0.0`
  2. `bin/vite dev` (Vite dev server for HMR)
  3. `RAILS_LOG_TO_STDOUT=1 bin/jobs` (Solid Queue worker)

**`./serve`** (production):
- Loads `.env`.
- Runs `bin/vite build` (or `rails assets:precompile`, whichever `vite_rails`
  wires up) before starting anything.
- tmux session, 2 panes:
  1. Puma server (`bin/rails s` in production mode, or `bin/puma`)
  2. `RAILS_LOG_TO_STDOUT=1 bin/jobs` (Solid Queue worker)
- No Docker build/run steps.

Both scripts are documented as extensible: future phases (e.g. a mailer
preview service, if needed) add more panes.

## Repo hygiene

- `.gitignore`: macOS (`.DS_Store`), Rails `tmp/`, `log/`, `.env`,
  `config/master.key`, `config/credentials/*.key`.
- `README.md`: project purpose, architecture overview, install/run
  instructions (including `./serve-dev` and `./serve` usage).
- `docs/initial-prompt.md` already present (source spec) — left as-is.

## Testing

- RSpec installed via `rspec-rails`, standard `spec/` structure
  (`spec_helper.rb`, `rails_helper.rb`).
- One request spec for `/health`:
  - Healthy path: DB/queue/cache all reachable → `200`, body reflects all
    checks passing.
  - Degraded path: DB connection failure stubbed → `503`, body reflects the
    failing check.
- No feature/system specs yet (nothing to click through in phase 1).

## Open questions / risks

- Rails 8's single-database Solid Queue/Solid Cache setup (vs. the
  multi-database default) requires explicit config
  (`config/solid_queue.yml`, `config/cache.yml` pointed at `primary`, and
  disabling the separate `queue`/`cache` database entries in
  `config/database.yml`). This is a known, documented Rails 8 configuration
  path, not a blocker, but the implementation plan must call it out
  explicitly since it diverges from `rails new` defaults.
- Stripping Docker files after `rails new` is mechanical (delete + remove
  references in `.dockerignore`/`config/deploy.yml` if Kamal scaffolding is
  also generated) — implementation plan should confirm whether Kamal
  scaffolding is skipped at `rails new` time via `--skip-kamal` and whether
  `--skip-docker` is a valid generator flag for the Rails version in use.
