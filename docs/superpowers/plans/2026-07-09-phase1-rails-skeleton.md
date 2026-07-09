# Phase 1: Rails App Skeleton & Infra Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a bootable Rails 8 app at the repo root with Postgres (unified schema, Solid Queue, Solid Cache), RSpec, a `/health` endpoint, Inertia+React+Vite+Tailwind wired up, and `./serve-dev`/`./serve` tmux scripts — no product features yet.

**Architecture:** Generate the app with `rails new .` using flags that skip Docker/Kamal/Hotwire/Minitest, then layer in RSpec, reconfigure Solid Queue/Solid Cache onto the single primary database, install Inertia+React+Vite+Tailwind via the `inertia_rails` generator, add the `/health` controller (TDD), and write the tmux process scripts.

**Tech Stack:** Ruby 3.4.7, Rails 8.0.5, PostgreSQL, Solid Queue, Solid Cache, RSpec, Inertia Rails, React, Vite, Tailwind CSS, `http` gem, `dotenv-rails`.

**Spec:** `docs/superpowers/specs/2026-07-09-phase1-rails-skeleton-design.md`

---

## Chunk 1: App Generation & Base Config

**Files:**
- Create: entire Rails app skeleton at repo root (`Gemfile`, `app/`, `config/`, `bin/`, `db/`, etc.)
- Modify: `.gitignore` (already un-ignores `docs/`; add Rails-specific entries)
- Modify: `.ruby-version` (generated, verify content)

- [ ] **Step 1: Confirm Ruby 3.4.7 is active**

Run: `ruby -v`
Expected: `ruby 3.4.7 ...` (already the rbenv-pinned system version per `~/.ruby-version` — this repo will get its own `.ruby-version` in Step 3)

- [ ] **Step 2: Install Rails 8.0.5 gem**

Run: `gem install rails -v 8.0.5`
Expected: `1 gem installed` (or already-installed message)

- [ ] **Step 3: Generate the Rails app at repo root**

Run from `/Users/grillermo/c/comunidad-antesis`:

```bash
rails _8.0.5_ new . \
  --database=postgresql \
  --skip-test \
  --skip-hotwire \
  --skip-javascript \
  --skip-jbuilder \
  --skip-docker \
  --skip-kamal \
  --skip-action-cable \
  --skip-devcontainer \
  --force
```

`--skip-javascript` skips `importmap-rails` and `app/javascript/` — this app's JS pipeline is entirely `vite_rails`/Inertia, installed in Chunk 6, so importmap would otherwise sit unused as dead config.

`--force` is required because `docs/`, `project/`, `.gitignore`, `.git/` already exist in this directory; Rails will prompt to overwrite `.gitignore` — confirm it merges rather than blows away the `project/` ignore rule (verify in Step 6).

Expected: generator runs `bundle install` and `git init` (git init will no-op, already a repo) and finishes without error.

- [ ] **Step 4: Verify Docker/Kamal/Hotwire artifacts are absent**

Run: `ls Dockerfile .dockerignore config/deploy.yml bin/docker-entrypoint bin/dev app/javascript/controllers 2>&1`
Expected: `Dockerfile`, `.dockerignore`, `config/deploy.yml`, `bin/docker-entrypoint`, `app/javascript/controllers` should all be `No such file or directory`. `bin/dev` is scaffolded by Rails 8 regardless of the flags above (it's a generic dev-server launcher script, not Docker/Hotwire-specific) — it will exist; that's expected and fine to leave, since it's harmless and unused once `./serve-dev` exists.

If any of the Docker/Kamal files unexpectedly exist, delete them:
`rm -f Dockerfile .dockerignore config/deploy.yml bin/docker-entrypoint`

- [ ] **Step 5: Verify `solid_cable` was not pulled in despite `--skip-action-cable`**

Run: `grep -n solid_cable Gemfile config/database.yml 2>/dev/null`
Expected: no output. If `solid_cable` appears in `Gemfile`, remove that line and run `bundle install` again. If `config/cable.yml` exists, delete it: `rm -f config/cable.yml`.

- [ ] **Step 6: Fix `.gitignore` after generation**

The Rails generator may have rewritten `.gitignore`. Open it and ensure it still contains the pre-existing `project/` rule plus Rails defaults, and does **not** re-add a `docs/` ignore rule. Target contents:

```
project/
.DS_Store

# Rails
/log/*
/tmp/*
!/log/.keep
!/tmp/.keep
/db/*.sqlite3
/db/*.sqlite3-journal
/public/assets
/.byebug_history
config/master.key
config/credentials/*.key
.env
```

- [ ] **Step 7: Verify `.ruby-version` content**

Run: `cat .ruby-version`
Expected: `3.4.7`. Rails generates this automatically from the active rbenv Ruby — confirm it matches; if not, write `3.4.7` into it manually.

- [ ] **Step 8: Hardcode Ruby version in Gemfile**

Open `Gemfile`, find the line `ruby "3.4.7"` (Rails 8 generators write this by default from `.ruby-version`). Confirm it's an exact pin, not a `~>` constraint. If it's missing or uses a constraint operator, set it to exactly:

```ruby
ruby "3.4.7"
```

- [ ] **Step 9: Confirm Rails is pinned exactly in Gemfile**

Run: `grep '^gem "rails"' Gemfile`
Expected: `gem "rails", "8.0.5"` (no `~>`). If the generator wrote a `~>` version constraint, edit it to the exact string above.

- [ ] **Step 10: Create the three Postgres databases**

Run: `bin/rails db:create`
Expected: output confirms `comunidad_antesis_development` and `comunidad_antesis_test` created. (Production DB is created later via `RAILS_ENV=production bin/rails db:create` once `.env` production credentials exist — do not attempt it now.)

- [ ] **Step 11: Boot the app once to confirm it works end-to-end**

Run: `bin/rails server -p 3000 &` then `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000`, then kill the server: `kill %1`
Expected: HTTP `200`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "Generate Rails 8.0.5 app skeleton (Postgres, no Docker/Kamal/Hotwire)"
```

---

## Chunk 2: Environment Variables & dotenv

**Files:**
- Modify: `Gemfile` (add `dotenv-rails`)
- Create: `.env.example`
- Create: `.env` (gitignored, local only)

- [ ] **Step 1: Add `dotenv-rails` to the Gemfile**

Add to the `:development, :test` group (create the group if it doesn't already exist near the top of `Gemfile`, following whatever grouping convention Rails 8 generated):

```ruby
group :development, :test do
  gem "dotenv-rails"
end
```

Note: `dotenv-rails` auto-loads `.env` in dev/test only, which is correct — production reads real environment variables set on the host, not a committed file.

- [ ] **Step 2: Bundle install**

Run: `bundle install`
Expected: `dotenv-rails` resolves and installs without conflicts.

- [ ] **Step 3: Create `.env.example`**

```
RAILS_PORT=3000
```

- [ ] **Step 4: Create local `.env` (not committed)**

```bash
cp .env.example .env
```

- [ ] **Step 5: Verify `.env` is gitignored**

Run: `git check-ignore -v .env`
Expected: matches the `.env` rule added in Chunk 1 Step 6.

- [ ] **Step 6: Commit**

```bash
git add Gemfile Gemfile.lock .env.example
git commit -m "Add dotenv-rails for dev/test env vars"
```

---

## Chunk 3: Unified Schema for Solid Queue & Solid Cache

**Files:**
- Modify: `config/database.yml`
- Modify: `config/environments/development.rb`, `config/environments/production.rb`, `config/environments/test.rb` (cache_store, queue adapter config)
- Modify: `config/solid_queue.yml` (if generated)
- Modify: `config/cache.yml` (if generated)
- Modify: `db/migrate/*` (Solid Queue/Cache migrations move into primary schema)

By default, Rails 8's `rails new` with Solid Queue/Solid Cache sets up **three separate databases** (`primary`, `cache`, `queue`) each with their own schema file. The spec requires a **single unified schema**. This chunk collapses them into `primary`.

- [ ] **Step 1: Inspect what the generator created**

Run: `cat config/database.yml`
Expected: development/test/production blocks each list `primary`, `cache`, `queue` sub-databases (e.g. `comunidad_antesis_development_cache`).

- [ ] **Step 2: Rewrite `config/database.yml` to a single database per environment**

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>

development:
  <<: *default
  database: comunidad_antesis_development

test:
  <<: *default
  database: comunidad_antesis_test

production:
  <<: *default
  database: comunidad_antesis_production
  username: comunidad_antesis
  password: <%= ENV["COMUNIDAD_ANTESIS_DATABASE_PASSWORD"] %>
```

Add the new production credential to `.env.example` (created in Chunk 2) so it's documented alongside `RAILS_PORT`:

```
RAILS_PORT=3000
COMUNIDAD_ANTESIS_DATABASE_PASSWORD=
```

Update the local `.env` too (`COMUNIDAD_ANTESIS_DATABASE_PASSWORD=` — left blank in development, since the dev/test blocks above don't reference it).

- [ ] **Step 3: Move Solid Queue/Cache migrations into the primary migration path**

Run: `find db -type d`
Expected: shows `db/queue_migrate` and `db/cache_migrate` alongside `db/migrate` (Rails puts each sub-database's migrations in its own folder). Move their contents into `db/migrate`:

```bash
mv db/queue_migrate/*.rb db/migrate/ 2>/dev/null
mv db/cache_migrate/*.rb db/migrate/ 2>/dev/null
rmdir db/queue_migrate db/cache_migrate 2>/dev/null
```

- [ ] **Step 4: Point Solid Queue config at the primary database connection**

`config/solid_queue.yml` (if present) configures worker/dispatcher process topology (polling interval, thread counts) — it does NOT control which database Solid Queue writes to. The actual database routing directive is `config.solid_queue.connects_to = { database: { writing: :queue } }`, set inline in `config/environments/development.rb` and `config/environments/production.rb` (Rails 8's default multi-db generator adds this line to both). Find and delete that line in both files so Solid Queue falls back to the primary connection (`ActiveRecord::Base`) instead of a named `:queue` connection.

Also check `app/models/application_record.rb` and any `app/models/solid_queue_record.rb`/`solid_cache_record.rb` the generator may have created — if either defines `connects_to database: { writing: :queue }` or `:cache`, delete that override.

Run: `grep -rn "connects_to" config/environments/ app/models/ 2>/dev/null`
Expected: no results referencing `:queue` or `:cache` after edits.

- [ ] **Step 5: Point Solid Cache config at the primary database connection**

Edit `config/cache.yml` similarly — remove any `database: cache` key so it uses the primary connection.

In each of `config/environments/development.rb` and `config/environments/production.rb`, confirm (or set):

```ruby
config.cache_store = :solid_cache_store
```

- [ ] **Step 6: Drop the orphaned per-database Postgres databases**

Chunk 1 Step 10 ran `bin/rails db:create` against the original multi-database `config/database.yml`, which created `comunidad_antesis_development_cache` and `comunidad_antesis_development_queue` (and their `_test` equivalents) as real Postgres databases. Now that `database.yml` no longer references them, `bin/rails db:drop` won't clean them up. Drop them directly:

```bash
psql -U "$(whoami)" -c "DROP DATABASE IF EXISTS comunidad_antesis_development_cache;"
psql -U "$(whoami)" -c "DROP DATABASE IF EXISTS comunidad_antesis_development_queue;"
psql -U "$(whoami)" -c "DROP DATABASE IF EXISTS comunidad_antesis_test_cache;"
psql -U "$(whoami)" -c "DROP DATABASE IF EXISTS comunidad_antesis_test_queue;"
```

Expected: each returns `DROP DATABASE` (or silently no-ops if a given name doesn't exist).

- [ ] **Step 7: Regenerate schema against the unified database**

```bash
bin/rails db:drop db:create db:migrate
```

Expected: no errors; `db/schema.rb` (or `db/structure.sql`, whichever Rails 8 defaults to) now contains `solid_queue_*` and `solid_cache_entries` tables alongside any app tables, all in one file.

- [ ] **Step 8: Verify unified schema**

Run: `grep -c "create_table \"solid_queue" db/schema.rb` and `grep -c "create_table \"solid_cache" db/schema.rb`
Expected: both > 0, confirming the tables live in the single `db/schema.rb`.

- [ ] **Step 9: Boot the app and confirm Solid Queue/Cache initialize without error**

Run: `bin/rails runner "puts Rails.cache.class; puts SolidQueue::Job.count"`
Expected: prints `SolidCache::Store` (or similar) then `0`, no exceptions.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Unify Solid Queue/Cache onto the primary database schema"
```

---

## Chunk 4: RSpec Setup

**Files:**
- Modify: `Gemfile` (add `rspec-rails`)
- Create: `spec/spec_helper.rb`, `spec/rails_helper.rb` (generated)
- Modify: `.rspec` (generated)

- [ ] **Step 1: Add `rspec-rails` to the Gemfile's `:development, :test` group**

```ruby
group :development, :test do
  gem "dotenv-rails"
  gem "rspec-rails"
end
```

- [ ] **Step 2: Bundle install**

Run: `bundle install`

- [ ] **Step 3: Run the RSpec install generator**

Run: `bin/rails generate rspec:install`
Expected: creates `.rspec`, `spec/spec_helper.rb`, `spec/rails_helper.rb`.

- [ ] **Step 4: Confirm Minitest directory is gone**

Run: `ls test/ 2>&1`
Expected: `No such file or directory` (already skipped via `--skip-test` in Chunk 1; this just confirms).

- [ ] **Step 5: Run the empty suite to confirm RSpec boots**

Run: `bundle exec rspec`
Expected: `0 examples, 0 failures`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Install RSpec, replacing Minitest"
```

---

## Chunk 5: `/health` Endpoint (TDD)

**Files:**
- Create: `app/controllers/health_controller.rb`
- Modify: `config/routes.rb`
- Test: `spec/requests/health_spec.rb`

Each check (database, queue, cache) is driven by its own failing test before its branch of the controller is written, per TDD. `SolidQueue::Process.exists?` needs a real row to return `true` in the healthy-path test — no worker runs during `rspec`, so tests create/remove the row explicitly via a shared helper.

- [ ] **Step 1: Write the failing spec for the database check only**

Create `spec/requests/health_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "GET /health", type: :request do
  it "returns 200 with database ok when the database is reachable" do
    get "/health"

    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body["checks"]["database"]).to eq("ok")
  end

  it "returns 503 with database error when the database check fails" do
    allow(ActiveRecord::Base.connection).to receive(:active?).and_raise(
      ActiveRecord::ConnectionNotEstablished, "no connection"
    )

    get "/health"

    expect(response).to have_http_status(:service_unavailable)
    body = JSON.parse(response.body)
    expect(body["status"]).to eq("error")
    expect(body["checks"]["database"]).to eq("error")
  end
end
```

- [ ] **Step 2: Run the spec, confirm it fails with a routing error**

Run: `bundle exec rspec spec/requests/health_spec.rb`
Expected: `FAIL` — `ActionController::RoutingError` or similar, since no `/health` route exists yet.

- [ ] **Step 3: Add the route**

In `config/routes.rb`, add:

```ruby
get "/health", to: "health#show"
```

- [ ] **Step 4: Write the minimal controller for the database check only**

Create `app/controllers/health_controller.rb`:

```ruby
class HealthController < ActionController::Base
  def show
    checks = { "database" => check_database }

    status = checks.values.all? { |v| v == "ok" } ? :ok : :service_unavailable
    overall = status == :ok ? "ok" : "error"

    render json: { status: overall, checks: checks }, status: status
  end

  private

  def check_database
    ActiveRecord::Base.connection.active? ? "ok" : "error"
  rescue StandardError
    "error"
  end
end
```

- [ ] **Step 5: Run the spec, confirm both database examples pass**

Run: `bundle exec rspec spec/requests/health_spec.rb`
Expected: `2 examples, 0 failures`.

- [ ] **Step 6: Write the failing spec for the queue check**

Add to `spec/requests/health_spec.rb`, inside the existing `RSpec.describe` block:

```ruby
  it "returns 200 with queue ok when a Solid Queue worker is registered" do
    SolidQueue::Process.create!(
      kind: "Worker",
      pid: Process.pid,
      hostname: "test-host",
      last_heartbeat_at: Time.current,
      name: "test-worker-#{SecureRandom.hex(4)}",
      metadata: {}
    )

    get "/health"

    body = JSON.parse(response.body)
    expect(body["checks"]["queue"]).to eq("ok")
  end

  it "returns 503 with queue error when no Solid Queue worker is registered" do
    get "/health"

    expect(response).to have_http_status(:service_unavailable)
    body = JSON.parse(response.body)
    expect(body["checks"]["queue"]).to eq("error")
  end
```

Run: `bundle exec rspec spec/requests/health_spec.rb`
Expected: FAIL — `checks["queue"]` is `nil` (key doesn't exist yet) on both new examples.

- [ ] **Step 7: Add the queue check to the controller**

Update `app/controllers/health_controller.rb`:

```ruby
  def show
    checks = {
      "database" => check_database,
      "queue" => check_queue
    }

    status = checks.values.all? { |v| v == "ok" } ? :ok : :service_unavailable
    overall = status == :ok ? "ok" : "error"

    render json: { status: overall, checks: checks }, status: status
  end

  private

  def check_database
    ActiveRecord::Base.connection.active? ? "ok" : "error"
  rescue StandardError
    "error"
  end

  def check_queue
    SolidQueue::Process.exists? ? "ok" : "error"
  rescue StandardError
    "error"
  end
```

Per the spec, this confirms a registered Solid Queue worker process exists, not just that the schema is migrated — that's already covered by the database check.

- [ ] **Step 8: Run the spec, confirm all 4 examples pass**

Run: `bundle exec rspec spec/requests/health_spec.rb`
Expected: `4 examples, 0 failures`.

- [ ] **Step 9: Write the failing spec for the cache check**

Add to `spec/requests/health_spec.rb`:

```ruby
  it "returns 200 with cache ok when the cache round-trips" do
    get "/health"

    body = JSON.parse(response.body)
    expect(body["checks"]["cache"]).to eq("ok")
  end

  it "returns 503 with cache error when the cache write fails" do
    allow(Rails.cache).to receive(:write).and_raise(StandardError, "cache unreachable")

    get "/health"

    expect(response).to have_http_status(:service_unavailable)
    body = JSON.parse(response.body)
    expect(body["checks"]["cache"]).to eq("error")
  end
```

Run: `bundle exec rspec spec/requests/health_spec.rb`
Expected: FAIL — `checks["cache"]` is `nil` on both new examples.

- [ ] **Step 10: Add the cache check to the controller**

Update `app/controllers/health_controller.rb`:

```ruby
  def show
    checks = {
      "database" => check_database,
      "queue" => check_queue,
      "cache" => check_cache
    }

    status = checks.values.all? { |v| v == "ok" } ? :ok : :service_unavailable
    overall = status == :ok ? "ok" : "error"

    render json: { status: overall, checks: checks }, status: status
  end
```

And add the private method alongside `check_database`/`check_queue`:

```ruby
  def check_cache
    key = "health_check_#{SecureRandom.hex(4)}"
    Rails.cache.write(key, "1", expires_in: 5.seconds)
    Rails.cache.read(key) == "1" ? "ok" : "error"
  rescue StandardError
    "error"
  end
```

- [ ] **Step 11: Run the full spec file, confirm all 6 examples pass**

Run: `bundle exec rspec spec/requests/health_spec.rb`
Expected: `6 examples, 0 failures`.

- [ ] **Step 12: Manual smoke test**

Run: `bin/rails server -p 3000 &`, then `curl -s http://localhost:3000/health | python3 -m json.tool`, then `kill %1`
Expected: JSON body with `"status": "error"` and `"checks": {"database": "ok", "queue": "error", "cache": "ok"}` — `queue` is expected to show `"error"` here because no Solid Queue worker process is running outside of tests (the `serve-dev`/`serve` scripts in Chunk 8 start one; this manual check is run without them).

- [ ] **Step 13: Commit**

```bash
git add app/controllers/health_controller.rb config/routes.rb spec/requests/health_spec.rb
git commit -m "Add /health endpoint checking database, queue, and cache"
```

---

## Chunk 6: Inertia + React + Vite + Tailwind

**Files:**
- Modify: `Gemfile` (add `inertia_rails`, `vite_rails`)
- Create: `app/frontend/` (React entrypoints, generated by `inertia:install`)
- Create: `vite.config.ts` (generated)
- Modify: `config/routes.rb` (add a root route for smoke-testing Inertia)
- Create: `app/controllers/welcome_controller.rb` (temporary smoke-test controller, removed/replaced in the landing-page phase)

- [ ] **Step 1: Add `inertia_rails` to the Gemfile**

```ruby
gem "inertia_rails"
```

- [ ] **Step 2: Bundle install**

Run: `bundle install`

- [ ] **Step 3: Run the Inertia install generator with React + Vite + Tailwind**

First check the generator's actual flag names before running it, since Thor boolean flags don't always take `=false`/`=true` — some are toggled via a `--no-` prefix instead:

Run: `bin/rails generate inertia:install --help`
Expected: output lists `--framework` and a typescript-related boolean option. Confirm whether disabling it is `--no-typescript` or `--typescript=false` from the actual `--help` output, then use that exact form below.

Run (adjust the typescript flag per the `--help` output above): `bin/rails generate inertia:install --framework=react --no-typescript --tailwind`

Expected: generator adds `vite_rails` to the Gemfile automatically, scaffolds `app/frontend/entrypoints/application.jsx`, `app/frontend/pages/`, `vite.config.ts`, `bin/vite`, and wires Tailwind into the Vite build. If the generator prompts to install npm packages, allow it (it runs `npm install`/`yarn install` depending on what's detected — confirm a `package.json` and lockfile now exist at repo root).

- [ ] **Step 4: Verify Vite + Propshaft compatibility**

Run: `bundle exec vite --version` (or `bin/vite --version`) to confirm `vite_rails` is functional, then run `bin/rails assets:precompile` once as a dry run.
Expected: completes without Propshaft manifest errors. If it errors referencing asset lookup/manifest paths, consult `vite_rails` README for the Propshaft-specific config (`config.assets.paths` may need `app/frontend/entrypoints` excluded, or `vite_rails` may need `after_initialize` ordering) — this is the risk flagged in the spec's Open Questions; resolve it here rather than deferring.

- [ ] **Step 5: Add a temporary smoke-test route + controller + page**

Create `app/controllers/welcome_controller.rb`:

```ruby
class WelcomeController < ApplicationController
  def index
    render inertia: "Welcome", props: { message: "comunidad-antesis is alive" }
  end
end
```

In `config/routes.rb`, add:

```ruby
root "welcome#index"
```

Confirm the generator created `app/frontend/pages/Welcome.jsx` (or create it if not present):

```jsx
export default function Welcome({ message }) {
  return <div>{message}</div>;
}
```

Note: this `WelcomeController`/`Welcome.jsx` pair exists only to prove the Inertia+React+Vite pipeline works end-to-end. It will be deleted and replaced by the real landing-page controller/page in the next phase.

- [ ] **Step 6: Run dev servers and smoke-test in a browser or via curl**

Run: `bin/rails server -p 3000 &` and `bin/vite dev &`, then `curl -s http://localhost:3000/ | grep -o "comunidad-antesis is alive"`
Expected: match found (confirms server-rendered HTML shell + Inertia hydration path is wired, though `curl` alone won't execute JS — this check just confirms the Inertia page component name and props are embedded in the initial HTML payload via the `data-page` attribute).
Kill both background processes: `kill %1 %2`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Wire up Inertia Rails + React + Vite + Tailwind"
```

---

## Chunk 7: `http` Gem

**Files:**
- Modify: `Gemfile` (add `http`)

- [ ] **Step 1: Add the gem**

```ruby
gem "http"
```

- [ ] **Step 2: Bundle install**

Run: `bundle install`

- [ ] **Step 3: Confirm it loads**

Run: `bin/rails runner "puts HTTP.class"`
Expected: prints `Module` (or similar), no load error.

- [ ] **Step 4: Commit**

```bash
git add Gemfile Gemfile.lock
git commit -m "Add http gem for future third-party API calls"
```

---

## Chunk 8: `serve-dev` and `serve` Scripts

**Files:**
- Create: `serve-dev` (executable)
- Create: `serve` (executable)

- [ ] **Step 1: Create `serve-dev`**

```bash
#!/bin/bash

# Load environment variables
set -a
[ -f .env ] && . .env
set +a

SESSION="comunidad-antesis"

# Kill existing session if any
tmux kill-session -t "$SESSION" 2>/dev/null

# Create session with first pane
tmux new-session -d -s "$SESSION" -n main

# Split into 3 panes
tmux split-window -h -t "$SESSION"
tmux split-window -v -t "$SESSION"

# Pane 1: Rails server
tmux send-keys -t "$SESSION:main.1" "source .env && bin/rails s -p ${RAILS_PORT:-3000} -b 0.0.0.0" C-m

# Pane 2: Vite dev server
tmux send-keys -t "$SESSION:main.2" "source .env && bin/vite dev" C-m

# Pane 3: Solid Queue worker
tmux send-keys -t "$SESSION:main.3" "source .env && RAILS_LOG_TO_STDOUT=1 bin/jobs" C-m

# Attach to session
tmux attach -t "$SESSION"
```

- [ ] **Step 2: Create `serve`**

```bash
#!/bin/bash

# Load environment variables
set -a
[ -f .env ] && . .env
set +a

RAILS_ENV=production bin/rails assets:precompile

SESSION="comunidad-antesis"

# Kill existing session if any
tmux kill-session -t "$SESSION" 2>/dev/null

# Create session with first pane
tmux new-session -d -s "$SESSION" -n main

# Split into 2 panes
tmux split-window -h -t "$SESSION"

# Pane 1: Rails server (production)
tmux send-keys -t "$SESSION:main.1" "source .env && RAILS_ENV=production bin/rails s -p ${RAILS_PORT:-3000} -b 0.0.0.0" C-m

# Pane 2: Solid Queue worker
tmux send-keys -t "$SESSION:main.2" "source .env && RAILS_ENV=production RAILS_LOG_TO_STDOUT=1 bin/jobs" C-m

# Attach to session
tmux attach -t "$SESSION"
```

- [ ] **Step 3: Make both executable**

```bash
chmod +x serve-dev serve
```

- [ ] **Step 4: Smoke-test `serve-dev`**

Run: `./serve-dev` in a terminal, confirm the tmux session opens with 3 panes and the Rails server responds at `http://localhost:3000`. Detach with `Ctrl-b d`, then `tmux kill-session -t comunidad-antesis` to clean up.

- [ ] **Step 5: Commit**

```bash
git add serve-dev serve
git commit -m "Add tmux-based serve-dev and serve scripts"
```

---

## Chunk 9: README & Final Verification

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# comunidad-antesis

A platform to promote and sell a Spanish-language digital ebook ("Manual del
Color Vivo") to the Spanish-speaking community: a landing page with email
capture, an authenticated ebook reader broken into sections, and a
Reddit-style commenting system for readers to discuss each section.

## Architecture

- **Rails 8** (Ruby 3.4.7) monolith, PostgreSQL for all persistence.
- **Unified schema:** app data, Solid Queue (background jobs), and Solid
  Cache (caching) all live in one Postgres database — no separate
  queue/cache databases.
- **Frontend:** Inertia Rails + React + Vite + Tailwind CSS. No separate
  API layer or SPA build — controllers render Inertia pages with props.
- **`/health`** endpoint reports database, queue, and cache reachability
  for uptime monitoring.

This repository currently contains only the application skeleton (Phase 1
of the build). Product features (landing page, auth, ebook content,
comments) land in subsequent phases — see `docs/superpowers/specs/`.

## Setup

1. Install Ruby 3.4.7 (via `rbenv install 3.4.7`) and PostgreSQL.
2. `bundle install`
3. `cp .env.example .env` and adjust values as needed.
4. `bin/rails db:create db:migrate`
5. `npm install` (or `yarn install`) for frontend dependencies.

## Running in development

```bash
./serve-dev
```

Opens a tmux session with panes for the Rails server, Vite dev server, and
the Solid Queue worker.

## Running in production

```bash
./serve
```

Precompiles assets, then opens a tmux session with panes for the Rails
server (production) and the Solid Queue worker. No Docker/Kamal — deploys
to a single bare-metal/VPS host.

## Testing

```bash
bundle exec rspec
```
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Add README with architecture and run instructions"
```

- [ ] **Step 3: Full-suite final check**

Run: `bundle exec rspec`
Expected: all specs pass (health spec from Chunk 5, `0 failures`).

- [ ] **Step 4: Full boot smoke test**

Run: `./serve-dev`, confirm all 3 tmux panes are healthy (no crash loops), hit `http://localhost:3000/` and `http://localhost:3000/health` in a browser or via `curl`, confirm both return successfully. Detach and kill the session when done.

Phase 1 is complete once this chunk's steps all pass. The next phase (landing page + email capture + Devise auth) starts from this committed state.
