# Handoff: comunidad-antesis — Ebook Promo & Community Platform

**Generated**: 2026-07-09
**Branch**: main
**Status**: Phase 1 and Phase 2a complete and merged to `main`. Ready to start Phase 2b.

## Goal

Build a Rails app to promote and sell a Spanish-language ebook, *Manual del
Color Vivo* by Anabel Torres Chávez (natural dyes/pigments/paints). Full
scope, per `docs/initial-prompt.md`: a landing page with email capture,
Devise login (no self-registration), an authenticated ebook reader broken
into sections (content sourced from the book's PDF), and a Reddit-style
nested comment system with roles, voting, markdown, and moderation.

This is being built in phases, each with its own spec → plan → implementation
cycle (see "Phase docs" below). **Do not re-read the full original prompt or
past conversation to get oriented — this file plus the two docs it points to
per phase is the complete context you need.**

## Completed

- [x] **Phase 1 — Rails app skeleton & infra.** Rails 8.0.5 / Ruby 3.4.7 app
      generated at repo root. Postgres with a **single unified schema**
      (Solid Queue + Solid Cache tables live in the same `db/schema.rb` as
      app tables — no separate queue/cache databases, no Action Cable/solid_cable).
      RSpec replaces Minitest. `/health` endpoint (database/queue/cache
      checks). Inertia Rails + React 19 + Vite + Tailwind CSS **v4**. `http`
      gem installed for future third-party calls. `dotenv-rails` for env
      vars. `./serve-dev` / `./serve` are tmux-based process scripts (no
      Docker/Kamal). No auth, no product features yet.
- [x] **Phase 2a — Landing page & email capture.** Public page at `/`:
      flat, cream, two-column, above-the-fold hero with a headline, hook
      copy, email form, and the flat book cover. `NewsletterEmail` model
      (normalized, case-insensitive-unique email + optional `source`).
      Three states: subscribed / already-subscribed / invalid-email, all
      browser-verified. Book-derived Tailwind `@theme` tokens (palette +
      Fredoka/Nunito Sans fonts via Google Fonts).

## Not Yet Done

- [ ] **Phase 2b — Devise auth + roles.** Username/password login only, no
      self-registration (admin creates accounts). Roles: Admin, Commenter,
      Viewer.
- [ ] **Phase 2c — Ebook & Section content.** `Ebook has_many :sections`
      resource. Content transcribed from the PDF (136 pages, 5 parts + Atlas
      del color + Epílogo + Glosario — see "The source material" below).
      Index page replicates the book's table of contents; one URL per
      section; authenticated-only.
  - **Note:** transcribing ~40 sections of Spanish content from the PDF is
    itself a large content-authoring task, separate from the Rails
    scaffolding. Consider whether this needs its own decomposition
    (e.g. content-authoring pass vs. the section/model/routing scaffolding)
    when you brainstorm this phase.
- [ ] **Phase 2d — Comment system.** Nested (unlimited depth) comments per
      section, role-gated (viewer=read-only, commenter=post, admin=moderate),
      markdown support (bold/italic/strikethrough/links/images/tables/code),
      sticky top-level comments, edit/delete (author or admin), upvote/
      downvote with score, reply-notification emails (opt-in), admin gets
      notified of every comment with an inline approve link, and a simple
      admin moderation UI (approve/delete/rewrite comments).
- [ ] **Final step (per original spec, do this only after everything above
      is built):** write `AGENTS.md`/`CLAUDE.md` documenting the finished
      app for future agents. Not needed per-phase.

## Failed Approaches (Don't Repeat These)

- **Executing the Phase 1 plan in a separate/background session produced
  spec deviations that had to be fixed afterward**: the multi-database
  Solid Queue/Cache split wasn't collapsed to a unified schema, `serve`/
  `serve-dev` were written with a bash `trap`+background-jobs pattern
  instead of the spec-required tmux panes, the queue health check used a
  create-then-destroy probe instead of checking for a registered worker,
  and `/health`'s JSON body was flattened to `{status}` instead of the
  full `{status, checks: {...}}` contract. All four were fixed in a
  follow-up pass (commit `52f8ee6`). **Lesson: after any phase is executed,
  verify the result against its spec/plan before treating it as done** —
  don't just trust an "implemented" report.
- **Browser-testing the invalid-email form state was initially misread as a
  broken feature.** Two false leads before finding the real cause:
  1. Reading the static `<script data-page>` tag via JS after an SPA-driven
     Inertia navigation shows *stale* initial-load data, not live client
     state — that tag is only correct on a real full-page load. Don't use
     it to inspect post-navigation Inertia props; read the live DOM/
     accessibility tree instead, or intercept the actual XHR/fetch call.
  2. Typing genuinely malformed text with no `@` (e.g. `"nope"`) into
     `<input type="email">` gets silently sanitized to `""` by the browser
     itself before it ever reaches React state — this is standard
     `type="email"` behavior, not a bug. To test the server-side format
     validator in a real browser, either submit a blank field (tests the
     presence validator) or use a string with `@` but invalid domain chars
     per `URI::MailTo::EMAIL_REGEXP` (e.g. `"foo@bar_baz"` — underscore
     isn't a valid domain-label character). Also note: the regex has **no
     required TLD** — `"foo@bar"` (no dot) is actually valid per
     `URI::MailTo::EMAIL_REGEXP`.
  3. Separately, several `computer` tool clicks on input/button elements
     silently missed their target in that session (focus never landed on
     the input; `document.activeElement` was `BODY`). If a click-driven
     browser test isn't producing an expected network request, verify
     `document.activeElement` or use `element.click()` via
     `javascript_tool` as a fallback before concluding the app is broken.

## Key Decisions

| Decision | Rationale |
|---|---|
| Rails 8.0.5 exact-pinned, Ruby 3.4.7 | Spec required hardcoded versions; Rails 8 ships Solid Queue/Cache natively. |
| Unified Postgres schema (no separate queue/cache/cable DBs) | Explicit spec requirement; required manually converting Rails 8's default per-service schema files into regular migrations. |
| No Docker/Kamal, tmux-based `serve`/`serve-dev` | User explicitly said "assume bare metal, remove all docker related stuff." |
| Tailwind **v4** (`@theme` in CSS, no `tailwind.config.js`) | Matches what `inertia:install` actually generated in this app — don't write a JS config file for this app. |
| Landing page: flat, no shadows/gradients/3D, vibrant orange (`#EF6C15`) | Validated interactively with the user via the brainstorming skill's visual companion (mockups shown in-browser); user explicitly rejected the original spec's "3D mockup" wording in favor of flat. |
| Fredoka + Nunito Sans (Google Fonts) | Close free approximations of the book's actual typography; flagged in the spec as swappable later if exact fonts are licensed. |
| `NewsletterEmail.source` field added (not in original spec) | User chose this during brainstorming Q&A for future attribution; cheap, deliberate scope addition, not creep. |
| Duplicate email → "already subscribed" UX state, not a validation error | User's explicit answer during brainstorming: distinguish "new signup" / "duplicate" / "malformed" as three different UI outcomes. |

## Current State

**Working**: Full app boots via `./serve-dev` (or manually: `bin/rails
server` + `bin/vite dev`). `bundle exec rspec` → 14 examples, 0 failures.
`/` renders the landing page; `/health` returns `{status, checks:
{database, queue, cache}}`. No auth exists yet — everything is public.

**Broken**: Nothing known. Working tree is clean, `git status` shows no
uncommitted changes as of this handoff.

**Uncommitted Changes**: None.

## Phase docs (read only the ones relevant to what you're doing next)

| Phase | Spec | Plan |
|---|---|---|
| 1 — Rails skeleton | `docs/superpowers/specs/2026-07-09-phase1-rails-skeleton-design.md` | `docs/superpowers/plans/2026-07-09-phase1-rails-skeleton.md` |
| 2a — Landing + email | `docs/superpowers/specs/2026-07-09-phase2a-landing-email-capture-design.md` | `docs/superpowers/plans/2026-07-09-phase2a-landing-email-capture.md` |

For Phase 2b/2c/2d, there is no spec/plan yet — **start with the
`superpowers:brainstorming` skill**, not by writing code directly. Original
full requirements for everything not-yet-built are in `docs/initial-prompt.md`
(the "Features" section, starting at "Add authentication with username and
password using devise…").

## Files to Know

| File | Why It Matters |
|---|---|
| `docs/initial-prompt.md` | Original full product spec — the source of truth for what Phases 2b/2c/2d need to cover. |
| `app/frontend/entrypoints/application.css` | Tailwind v4 `@theme` block — palette (`cream`/`blue`/`blue-deep`/`blue-ink`/`orange`/`orange-ink`) and font tokens (`font-display`=Fredoka, `font-body`=Nunito Sans). Reuse these tokens for auth/ebook/comment UI — don't reinvent the palette. |
| `app/frontend/pages/Landing.jsx` | Reference implementation for this app's Inertia+React conventions (useForm, accessible error states, flat/minimal Tailwind styling). |
| `app/controllers/inertia_controller.rb` | Base class new Inertia-rendering controllers should inherit from (currently empty, has commented `inertia_share` example — this is likely where a Phase 2b `Current.user` share would go). |
| `config/database.yml` | Single unified database per environment — read this before adding any new background-processing or caching concern to make sure it doesn't reintroduce a split schema. |
| `db/schema.rb` | Single schema file for everything (app tables + Solid Queue + Solid Cache). |
| `project/MaquetaCompleta-ManualDelColorVivo-VER1 (1).pdf` | The ebook itself — source for Phase 2c section content and (already used) the cover art. Gitignored (`project/` in `.gitignore`), stays local-only. |
| `app/frontend/assets/cover.jpg` | Already-extracted, optimized (108 KB) flat cover image — reuse for Phase 2c if the ebook index page needs the cover again. |

## Code Context

**NewsletterEmail model contract** (Phase 2c/2d don't need this, but it's the
pattern to follow for new models — normalize-then-validate, Spanish error
messages):
```ruby
# app/models/newsletter_email.rb
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

**Inertia flash→props pattern** (used by `LandingController`, reuse for any
controller needing similar success/error state without global `inertia_share`):
```ruby
def index
  render inertia: "Landing", props: {
    subscribed: flash[:subscribed] || false,
    alreadySubscribed: flash[:already_subscribed] || false
  }
end
```
Validation errors use the gem's built-in mechanism instead:
`redirect_to root_path, inertia: { errors: record.errors }` — the `errors`
prop is then automatically available on the next Inertia page load via
`config.always_include_errors_hash = true` (already set in
`config/initializers/inertia_rails.rb`).

## Resume Instructions

1. Confirm the app still boots: `bin/rails db:prepare && bundle exec rspec`
   — Expected: `14 examples, 0 failures`.
2. For Phase 2b (Devise auth), invoke the `superpowers:brainstorming` skill
   fresh (don't skip it) with something like: "Let's brainstorm Phase 2b:
   Devise auth with roles, per docs/initial-prompt.md and
   HANDOFF.md." Let it explore the codebase and ask clarifying questions —
   likely topics: how admin accounts get created (rails console? seed
   task? admin UI?), exact role enum values/storage (column vs. separate
   model), and whether `InertiaController`'s commented-out `inertia_share
   user:` line should be activated for sharing the current user to all
   Inertia pages.
3. Follow the same spec → plan → subagent-driven-development cycle used for
   Phases 1 and 2a (see the two phase docs above as examples of the level
   of detail expected).
4. After Phase 2b ships, do the same for 2c (Ebook/Sections) — flag early
   in brainstorming whether the PDF-to-section content transcription should
   be split into its own sub-task from the Rails scaffolding work.

## Warnings

- **Don't add Action Cable / `solid_cable` back** without a real-time
  requirement — Phase 1 deliberately removed it (`--skip-action-cable`
  equivalent cleanup). Comment reply notifications (Phase 2d) are
  email-based per spec, not WebSocket — no Action Cable is needed for the
  full original spec as written.
- **Don't create a `tailwind.config.js`** — this app uses Tailwind v4's
  CSS-native `@theme` mechanism in `application.css`. A JS config file
  would be dead weight and inconsistent with the rest of the app.
- **The `project/` directory (containing the ebook PDF) is gitignored** —
  don't try to commit it or reference it from a path that assumes it's
  tracked in git; it's local-only source material.
- **`app/controllers/inertia_controller.rb` is currently a near-empty base
  class** — this is intentional, not incomplete; it's where Phase 2b should
  add `inertia_share user: -> { ... }` once auth exists.
