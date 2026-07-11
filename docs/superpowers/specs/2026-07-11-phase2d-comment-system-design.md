# Phase 2d — Comment System Design

**Date**: 2026-07-11
**Status**: Approved design, ready for implementation plan
**Depends on**: Phases 1, 2a, 2b, 2c and the manual content authoring pass (all complete on `main`).

## Goal

Add a Reddit-style nested comment system to every section of the manual
(*Manual del Color Vivo*). Authenticated users read and post comments;
comments support unlimited nesting, Markdown, hearts (positive-only voting),
sticky pinning, author/admin editing and deletion, per-comment reply
notifications, admin notification with a signed approve link, and moderation
through RailsAdmin.

Comments attach to manual sections by **slug string** — there is no `Section`
database model (Phase 2c uses the static `Manual::TABLE_OF_CONTENTS`).

## Scope Decisions

These were settled during brainstorming and are fixed for this phase:

| Decision | Choice | Rationale |
|---|---|---|
| Approval model | Publish immediately, moderate after | Best UX for a small community; "approve" is an after-the-fact triage flag, not a visibility gate. |
| Nesting storage | `ancestry` gem (materialized path, single table) | Efficient subtree queries and ordering without hand-rolled recursion. |
| Markdown rendering | Server-side render + sanitize | Single trusted source, SSR-friendly, safest; the same HTML is reused in emails. |
| Voting | Hearts only, positive | Owner wants hearts that only add appreciation; no downvotes. |
| Reply notifications | Per-comment subscription | Author opts in per comment via a checkbox when posting. |
| Admin approve link | Signed token, no login required | Frictionless approval from email/phone; link is a scoped, expiring bearer credential. |
| Moderation UI | RailsAdmin (already mounted) | Register `Comment`; near-zero new UI. Fast path is the email approve link. |
| Delete semantics | Soft-delete tombstone | Deleting keeps replies visible under a `[eliminado]` placeholder; preserves thread structure. |
| Read/write access | All authenticated users | Only `commenter`/`admin` roles exist; unauthenticated users are already blocked by the manual routes. |

## Data Model

### `Comment`

Single table, `ancestry` gem for unlimited nesting.

| Column | Type | Notes |
|---|---|---|
| `section_slug` | string, null: false | Validated against `Manual` known slugs. |
| `user_id` | bigint, null: false | Author. FK to `users`. |
| `body` | text, null: false | Raw Markdown as typed. |
| `body_html` | text | Rendered + sanitized HTML cache. Recomputed on save. |
| `ancestry` | string | Managed by the `ancestry` gem. |
| `hearts_count` | integer, default 0, null: false | Cached count of `Heart` records. |
| `sticky` | boolean, default false, null: false | Top-level only; admin toggles. |
| `approved` | boolean, default false, null: false | Admin triage flag. Does **not** gate visibility. |
| `deleted_at` | datetime | Soft-delete tombstone marker. |
| `created_at` / `updated_at` | datetime | |

Indexes: `[section_slug, ancestry]`, `ancestry` (gem default), `user_id`.

Behavior:
- `body_html` is regenerated from `body` in a `before_save` whenever `body`
  changes (see Rendering).
- Soft delete sets `deleted_at`; the record is retained so replies keep their
  parent. A deleted comment renders as `[eliminado]` with author hidden and
  `body_html` suppressed. Hearts and reply actions are disabled on tombstones.
- `sticky` may only be set on root (top-level) comments.
- Validation: `section_slug` must be present in `Manual`'s known slug set;
  `body` present (unless deleted); nesting depth is unlimited.

### `Heart`

Positive-only vote (a "like").

| Column | Type | Notes |
|---|---|---|
| `user_id` | bigint, null: false | FK to `users`. |
| `comment_id` | bigint, null: false | FK to `comments`. |
| `created_at` / `updated_at` | datetime | |

Unique index `[user_id, comment_id]` — one heart per user per comment.
Creating/removing a heart recaches `comments.hearts_count`. No `value` column
and no negative path.

### `CommentSubscription`

Per-comment reply notification opt-in.

| Column | Type | Notes |
|---|---|---|
| `user_id` | bigint, null: false | Subscriber. |
| `comment_id` | bigint, null: false | The comment whose replies trigger notification. |
| `created_at` / `updated_at` | datetime | |

Unique index `[user_id, comment_id]`. Created when the author checks "notify
me of replies" while posting. When a new reply is created, subscribers of the
parent comment are emailed.

## Roles & Authorization

Only `commenter` and `admin` roles exist; all manual routes already require
authentication. Therefore:

- **Any authenticated user** may read comments and create new comments/replies.
- **Author** may edit and delete their own comment.
- **Admin** may edit (rewrite), delete, approve, and sticky **any** comment.
- **Hearts**: any authenticated user may heart/un-heart any non-deleted
  comment (not their own restriction is not required).

Authorization is enforced in controllers (and mirrored in RailsAdmin's
admin-only mount). Deleted/tombstoned comments reject edit, delete, heart, and
reply actions.

## Markdown Rendering & Sanitization

- Render Markdown → HTML server-side with `commonmarker`, enabling the GFM
  features the prompt lists: bold, italic, strikethrough, links, images,
  tables, and code blocks.
- Sanitize the rendered HTML with an allowlist (Rails `sanitize` / Loofah):
  permit only the tags/attributes needed for the above; force safe `href`/`src`
  schemes (http/https/mailto); strip scripts, event handlers, and styles.
- Store both raw `body` and sanitized `body_html`. React renders the trusted
  `body_html`. Emails reuse the same `body_html`.
- No client-side Markdown rendering. A short Markdown help hint sits near the
  compose box; live preview is out of scope (YAGNI).

## Thread UI

- A comment thread component renders at the bottom of `ManualLayout`, so it
  appears on all 87 manual section pages.
- `ManualController#show` passes a `comments` prop for the current
  `section_slug`: the section's comment tree, each node carrying author display
  name, `body_html`, `hearts_count`, `hearted_by_current_user`, `sticky`,
  `deleted`, timestamps, and permission flags (`can_edit`, `can_delete`,
  `can_moderate`).
- Ordering: sticky top-level comments first, then `hearts_count` desc, then
  newest first. Replies are chronological (oldest first) within each parent.
- Each comment shows: author, relative time, rendered body, a 💙 button with
  count (filled if hearted, outline if not — toggles on click), and
  reply/edit/delete controls per the viewer's permissions. Admins also see
  sticky and approve controls.
- Nested replies are visually indented. Nesting is unlimited; deep threads use
  progressive indentation (exact visual treatment decided during
  implementation, reusing the Tailwind v4 `@theme` palette).

## Endpoints

All are Inertia actions that respond with a redirect back to the section page;
the thread updates via an Inertia partial reload of the `comments` prop.

- `CommentsController#create` — new comment or reply (`parent_id` optional).
  Accepts a `subscribe` flag to create a `CommentSubscription`. Enqueues
  reply + admin notification emails.
- `CommentsController#update` — edit `body` (author or admin). Recomputes
  `body_html`.
- `CommentsController#destroy` — soft delete (author or admin) → tombstone.
- `HeartsController#create` — toggle the current user's heart on a comment;
  recaches `hearts_count`.
- `Moderation::ApprovalsController#show` — the signed approve link target.
  Verifies `Comment.find_signed(token, purpose: :approve)`; sets
  `approved: true`. No login required. Shows a simple confirmation page.
  Invalid/expired/tampered tokens render a friendly error.
- Comment moderation (approve, rewrite, delete, sticky) is also available in
  **RailsAdmin** by registering the `Comment` model. RailsAdmin remains
  admin-only via the existing route constraint.

## Emails

Delivered with ActionMailer `deliver_later` through Solid Queue (no Action
Cable — the requirement is email-based).

- `CommentMailer#reply_notification` — sent to each `CommentSubscription`
  subscriber of the parent comment when a reply is posted. Excludes the
  replier themselves.
- `CommentMailer#admin_notification` — sent to all admins for every new
  comment. Includes the comment body and a **signed approve link**
  (`comment.signed_id(purpose: :approve, expires_in: 7.days)`).

Emails render the sanitized `body_html`. Subject and copy are in Spanish to
match the app.

## Error Handling

- Posting to an unknown `section_slug` is rejected by validation (422).
- Editing/deleting/hearting a tombstoned comment is rejected.
- Unauthorized edit/delete/moderate attempts return 403/404 per the app's
  existing conventions.
- Expired or tampered approve tokens render a friendly error page, not a 500.
- Email delivery failures are handled by Solid Queue ret/failure semantics and
  never block comment creation (jobs are enqueued after the comment commits).

## Testing

- **Model specs**: ancestry nesting and subtree loading; soft-delete tombstone
  behavior (replies preserved, body/author hidden); `Heart` uniqueness, toggle,
  and `hearts_count` recache; `section_slug` validation against `Manual`;
  Markdown rendering and sanitization including XSS payloads (script tags,
  `javascript:` hrefs, event handlers, `onerror` images).
- **Request specs**: create/reply/edit/delete authorization (author vs admin vs
  other user); heart toggle; sticky restricted to top-level and admin; approve
  link with valid, expired, and tampered tokens; unknown-slug rejection.
- **Mailer specs**: reply notification targets subscribers and excludes the
  replier; admin notification goes to admins and contains a working signed
  approve link.
- Existing suites (including the manual-content completeness gate) continue to
  pass.

## Out of Scope

- Pre-moderation / approval gating of visibility.
- Downvotes or any negative voting.
- Client-side Markdown rendering or live preview.
- A custom Inertia moderation UI (RailsAdmin covers it).
- Real-time updates / Action Cable.
- Viewer role (declined in Phase 2b).

## Key File Touch Points

| File | Change |
|---|---|
| `db/migrate/*` | Create `comments`, `hearts`, `comment_subscriptions` in the unified schema. |
| `app/models/comment.rb` | New model: ancestry, rendering, tombstone, validations. |
| `app/models/heart.rb`, `app/models/comment_subscription.rb` | New join models. |
| `app/models/user.rb` | `has_many` comments/hearts/subscriptions. |
| `app/models/manual.rb` | Expose a known-slug lookup for validation (if not already available). |
| `app/controllers/manual_controller.rb` | Pass `comments` prop on `#show`. |
| `app/controllers/comments_controller.rb`, `hearts_controller.rb`, `moderation/approvals_controller.rb` | New controllers. |
| `app/mailers/comment_mailer.rb` + views | Reply + admin notification emails (Spanish). |
| `app/frontend/components/ManualLayout.jsx` | Mount the thread component. |
| `app/frontend/components/comments/*.jsx` | Thread, comment, compose, heart button. |
| `config/routes.rb` | Comment, heart, approval routes; RailsAdmin `Comment`. |
| `config/initializers/rails_admin.rb` | Register `Comment` for moderation. |
| `Gemfile` | Add `ancestry` and `commonmarker`. |
