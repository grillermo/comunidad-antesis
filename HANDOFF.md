# Handoff: comunidad-antesis — Ebook Promo & Community Platform

**Updated**: 2026-07-11
**Branch**: main
**Status**: Phases 1, 2a, 2b, 2c, 2d, and the manual content authoring pass are complete on `main`.

## Goal

Build a Rails app to promote and sell a Spanish-language ebook, *Manual del
Color Vivo* by Anabel Torres Chávez (natural dyes/pigments/paints). Full
scope, per `docs/initial-prompt.md`: a landing page with email capture,
Devise login with admin-created accounts, an authenticated ebook reader broken
into sections, and a Reddit-style nested comment system with roles, voting,
markdown, and moderation.

This is being built in phases, each with its own spec → plan → implementation
cycle. Do not re-read the full original prompt to get oriented unless a new
phase needs details not captured here.

## Completed

- [x] **Phase 1 — Rails app skeleton & infra.** Rails 8.0.5 / Ruby 3.4.7 app
      at repo root. Postgres uses a single unified schema: app tables, Solid
      Queue, and Solid Cache all live in `db/schema.rb`. RSpec replaces
      Minitest. `/health` returns database/queue/cache checks. Inertia Rails +
      React 19 + Vite + Tailwind CSS v4 are installed. `dotenv-rails` is used
      for env vars. `./serve-dev` and `./serve` are tmux-based process scripts.
- [x] **Phase 2a — Landing page & email capture.** Public landing page at `/`
      with book-cover hero and email capture. `NewsletterEmail` normalizes and
      validates emails with Spanish error messages and duplicate handling.
      Tailwind v4 `@theme` tokens define the book-derived palette and fonts.
- [x] **Phase 2b — Devise auth + roles.** Devise username/password login is
      wired with no self-registration. Accounts are admin-created. Roles are
      string enum values on `User`: `admin` and `commenter`; default is
      `commenter`. RailsAdmin is mounted at `/antesis-admin` and constrained
      to admins; commenters receive a 404. Devise failed Inertia sign-ins use
      redirect/error behavior that works with the app's Inertia flow. Login
      parameter handling and throttling were hardened.
- [x] **Phase 2c — Manual as authenticated SSR webpage.** The manual now has
      explicit authenticated routes under `/manual-del-color-vivo`, one route
      per table-of-contents node. No `Ebook`, `Section`, or `Subsection`
      database models were added. The static table of contents lives in
      `Manual::TABLE_OF_CONTENTS`; `Manual.walk` draws 87 section routes.
      React placeholder page stubs exist for every route under
      `app/frontend/pages/manual-del-color-vivo/`. Inertia SSR is enabled via
      vite_ruby with a Node SSR server on `http://localhost:13714/render`.
      `serve-dev` now runs Rails, Vite dev, Solid Queue, and SSR in four tmux
      panes. `serve` now runs Rails, Solid Queue, and SSR in three tmux panes.
- [x] **Manual content authoring pass.** All 87 manual route pages contain the
      ebook's Spanish prose or their designated visual content. A shared
      semantic component kit renders recipes, procedures, materials, callouts,
      side notes, subheadings, and part dividers. Five part illustrations and
      ten Atlas pages are optimized under `app/frontend/assets/manual/`.
      `spec/manual_content_spec.rb` prevents placeholder content from returning.
- [x] **Phase 2d — Comment system.** Every manual section has authenticated,
      unlimited nested comments with sanitized Markdown, hearts, subscriptions,
      author/admin editing and soft-delete tombstones. Root comments can be
      sticky. Admins receive signed approval links and moderate comments through
      RailsAdmin. Inertia renders the recursive thread and refreshes comment props
      after mutations.

## Not Yet Done

- [ ] **Final step after all phases:** write/update `AGENTS.md` and any other
      agent-facing docs for the finished app. Do this only after the comment
      system and content strategy are done.

## Current State

**Working**

- App boots in development with `./serve-dev`.
- `bundle exec rspec` passes, including the global manual-content completeness gate.
- `bin/rails manual:generate_stubs` is idempotent: `Created 0 stub(s); 87 paths total.`
- Production Vite client build and SSR build pass.
- Authenticated browser verification confirmed `/manual-del-color-vivo` returns
  raw HTML with `data-server-rendered="true"` and server-rendered manual
  content.
- `/manual-del-color-vivo` and all 87 section routes require authentication.
- `/antesis-admin` is admin-only; non-admins receive 404.
- Comment posting, nested replies, heart toggle, editing, admin soft-delete,
  tombstones, and signed approval were verified in a live browser on desktop
  and mobile widths with no console errors.

**Known local environment issue**

- Running `./serve` locally starts Rails and SSR, but the Solid Queue
  production pane can fail if the local PostgreSQL production role
  `comunidad_antesis` does not exist. This is local production DB setup, not a
  script regression.

**Uncommitted changes**

- The existing `.gitignore` edit adding `.tokensave` is user-owned and remains
  intentionally uncommitted. No Phase 2d implementation files should be dirty.

## Phase Docs

| Phase | Spec | Plan |
|---|---|---|
| 1 — Rails skeleton | `docs/superpowers/specs/2026-07-09-phase1-rails-skeleton-design.md` | `docs/superpowers/plans/2026-07-09-phase1-rails-skeleton.md` |
| 2a — Landing + email | `docs/superpowers/specs/2026-07-09-phase2a-landing-email-capture-design.md` | `docs/superpowers/plans/2026-07-09-phase2a-landing-email-capture.md` |
| 2b — Devise auth + roles | `docs/superpowers/specs/2026-07-09-phase2b-devise-auth-roles-design.md` | `docs/superpowers/plans/2026-07-09-phase2b-devise-auth-roles.md` |
| 2c — Manual SSR webpage | `docs/superpowers/specs/2026-07-10-phase2c-manual-ssr-webpage-design.md` | `docs/superpowers/plans/2026-07-10-phase2c-manual-ssr-webpage.md` |
| Manual content authoring | `docs/superpowers/specs/2026-07-10-manual-content-authoring-design.md` | `docs/superpowers/plans/2026-07-10-manual-content-authoring.md` |
| 2d — Comment system | `docs/superpowers/specs/2026-07-11-phase2d-comment-system-design.md` | `docs/superpowers/plans/2026-07-11-phase2d-comment-system.md` |

## Recent Phase 2d Commits

- `944f86f` Add ancestry, commonmarker, and factory_bot gems for comments
- `d7b1230` Add FactoryBot config and minimal user factory
- `6d23c09` Add comment thread UI to manual sections
- `ca3ddc6` Allow preserved replies to update after parent deletion

## Files to Know

| File | Why It Matters |
|---|---|
| `docs/initial-prompt.md` | Original full product spec. Use it for Phase 2d requirements, but rely on phase specs/plans where they exist. |
| `app/models/user.rb` | Devise user model. Roles are `admin` and `commenter`; default is `commenter`. |
| `app/controllers/users/sessions_controller.rb` | Custom Devise/Inertia sign-in behavior. |
| `app/controllers/inertia_controller.rb` | Base class for Inertia controllers and shared props. |
| `app/models/manual.rb` | Static manual table of contents and route/page lookup helpers. Slugs are URL/page-path contracts; do not rename casually. |
| `app/controllers/manual_controller.rb` | Authenticated Inertia manual index/show actions. `component` comes from route defaults, not direct user input. |
| `app/models/comment.rb` | Comment tree, section integrity, Markdown cache, sticky rules, and soft-delete behavior. |
| `app/models/heart.rb` | Unique positive reaction with `hearts_count` counter cache. |
| `app/models/comment_subscription.rb` | Per-comment reply notification subscription. |
| `app/serializers/comment_tree.rb` | Ordered recursive Inertia payload with viewer-specific permissions and heart state. |
| `app/controllers/comments_controller.rb` | Create, edit, soft-delete, subscriptions, and notification dispatch. |
| `app/controllers/hearts_controller.rb` | Authenticated heart toggle. |
| `app/mailers/comment_mailer.rb` | Admin approval and subscriber reply emails. |
| `app/frontend/components/ManualLayout.jsx` | Shared manual page layout. |
| `app/frontend/components/comments/*.jsx` | Recursive comment thread, node actions, and post/reply forms. |
| `app/frontend/pages/manual-del-color-vivo/Index.jsx` | Manual Contenido page. |
| `app/frontend/components/manual/*.jsx` | Semantic components shared by the authored manual pages. |
| `app/frontend/pages/manual-del-color-vivo/**/*.jsx` | Verbatim manual prose and visual pages for each authenticated route. |
| `app/frontend/assets/manual/*.jpg` | Optimized part dividers and Atlas page images. |
| `app/frontend/ssr/ssr.jsx` | Inertia SSR entrypoint. |
| `config/initializers/inertia_rails.rb` | Inertia config, including SSR enabled from vite_ruby and explicit `ssr_url`. |
| `config/vite.json` | vite_ruby config; SSR builds are enabled in development and production, not test. |
| `config/routes.rb` | Devise routes, admin-only RailsAdmin mount, manual route generation, newsletter, health. |
| `lib/tasks/manual.rake` | `manual:generate_stubs`, used to keep placeholder pages aligned with `Manual::TABLE_OF_CONTENTS`. |
| `serve-dev` | Dev tmux launcher: Rails, Vite dev, Solid Queue, SSR. Requires a real terminal because it attaches tmux. |
| `serve` | Production-like tmux launcher: precompile assets, then Rails, Solid Queue, SSR. Requires local production DB setup. |
| `app/frontend/entrypoints/application.css` | Tailwind v4 `@theme` palette/fonts. Reuse for Phase 2d UI. |
| `app/frontend/pages/Landing.jsx` | Reference for this app's Inertia + React form conventions. |
| `project/MaquetaCompleta-ManualDelColorVivo-VER1 (1).pdf` | Local-only ebook source material; `project/` is gitignored. |
| `app/frontend/assets/cover.jpg` | Optimized cover image already extracted from the ebook. |

## Key Decisions

| Decision | Rationale |
|---|---|
| Work happened directly on `main` | User explicitly requested no worktree/branch for these phases. |
| Rails 8.0.5 exact-pinned, Ruby 3.4.7 | Spec required hardcoded versions; Rails 8 ships Solid Queue/Cache natively. |
| Unified Postgres schema | Explicit Phase 1 requirement; do not reintroduce split queue/cache databases. |
| No Docker/Kamal, tmux-based `serve`/`serve-dev` | User explicitly chose bare metal. |
| Tailwind v4 CSS-native `@theme`; no `tailwind.config.js` | Matches the app's installed Tailwind/Vite setup. |
| Devise registrations skipped | Accounts are admin-created; no public self-registration. |
| Roles are `admin` and `commenter` only | User declined a separate viewer role for Phase 2b; unauthenticated users are the read-denied case. |
| RailsAdmin admin-only via route constraint | Commenters get 404, per user instruction. |
| Manual has no DB content models | Phase 2c uses static `Manual::TABLE_OF_CONTENTS`, explicit routes, and React pages. |
| Manual slugs are stable contracts | Slugs define URLs and page file paths; changing them breaks links and generated page resolution. |
| Inertia SSR uses explicit `config.ssr_url` | Live verification showed Inertia Rails otherwise posted to the Vite dev server endpoint here; the Node SSR server renders on `/render` port 13714. |
| Manual prose ships in lazy-split client chunks | The owner explicitly accepted obscurity: chunks and images are hashed and unlinked publicly, but technically fetchable if their asset URLs are discovered. Do not replace this decision accidentally with a different content-delivery model. |

## Verification Commands

Use the rbenv shim path in this environment:

```bash
env PATH="/Users/grillermo/.rbenv/shims:$PATH" bundle exec rspec
env PATH="/Users/grillermo/.rbenv/shims:$PATH" bin/rails manual:generate_stubs
env PATH="/Users/grillermo/.rbenv/shims:$PATH" SECRET_KEY_BASE_DUMMY=1 RAILS_ENV=production NODE_ENV=production bin/vite build --clear
env PATH="/Users/grillermo/.rbenv/shims:$PATH" SECRET_KEY_BASE_DUMMY=1 RAILS_ENV=production NODE_ENV=production bin/vite build --ssr
```

Per `/Users/grillermo/AGENTS.md`, prefix shell commands with `rtk` when running
them through Codex, for example:

```bash
rtk proxy env PATH="/Users/grillermo/.rbenv/shims:$PATH" bundle exec rspec
```

## Resume Instructions

1. Confirm repo state with `rtk proxy git status --short`. Expect only
   intentional local edits.
2. Confirm tests with:
   `rtk proxy env PATH="/Users/grillermo/.rbenv/shims:$PATH" bundle exec rspec`.
3. Phase 2d is complete. Use its committed spec and plan before changing comment
   behavior or moderation contracts.

## Warnings

- Do not add Action Cable unless a real-time requirement appears. The original
  comment notification requirement is email-based.
- Do not create `tailwind.config.js`; use Tailwind v4 `@theme` in CSS.
- Do not commit `project/`; it is local-only source material.
- Do not rename manual slugs casually. URLs, generated page files, and route
  defaults depend on them.
- The owner explicitly accepted hashed public bundles for the protected prose
  and images in this pass. Revisit that posture only as an intentional product
  and security decision.
- Do not bypass commit signing or add false co-author trailers.
