# Preload next manual section for instant navigation

## Problem

When a reader clicks the "next section →" link at the bottom of a manual page,
Inertia makes an XHR round-trip for the page props (title, comments, nextPage)
**and** lazy-loads the next page's JS chunk on demand. On a slow connection this
is a visible delay. We want the next section to appear instantly on click.

## Goal

By the time the reader clicks "next section →", both the page's Inertia props
JSON and its React component chunk are already in the browser, so the visit
resolves from cache with no network wait.

Comments are **deferred** — excluded from the initial (and prefetched) payload
and loaded in a follow-up request after the page mounts. This makes the page
appear faster, keeps the prefetch payload small, and — because deferred props
are never part of a prefetch — guarantees comments are always fetched fresh on a
real visit rather than served stale from the prefetch cache.

## Approach: idle-delay programmatic prefetch + chunk warming + deferred comments

Chosen over the simpler `prefetch` prop on `<Link>` because:

- **Hover doesn't exist on touch.** Most readers are on phones/tablets. A
  `prefetch` (hover) prop buys them nothing.
- **Skip bounce visits.** A 3s idle timer means we only spend the request/chunk
  on readers who actually stay to read, not drive-by visits.
- **Warm the JS chunk too.** The `prefetch` prop only caches props JSON; the
  page component module still lazy-loads on click. We also want the chunk warm.

### Client — `app/frontend/components/ManualLayout.jsx`

Add a `useEffect` keyed on `nextPage?.url`:

1. Bail if there is no `nextPage` (last section in reading order).
2. Start a 3-second `setTimeout`. On fire:
   - `router.prefetch(nextPage.url, { method: 'get' }, { cacheFor: '30m' })`
     — caches the next page's Inertia props for 30 minutes. Long TTL so the
     cache survives a long, slow read of the current page.
   - Warm the component chunk. A module-level
     `import.meta.glob('../pages/manual-del-color-vivo/**/*.jsx')` gives a map
     of glob key → lazy import loader (the same 88 files, same chunks Vite
     already emits — deduped, no new chunks). Derive the glob key from
     `nextPage.url` by stripping the `/manual-del-color-vivo/` prefix:

     ```js
     const slugPath = nextPage.url.replace('/manual-del-color-vivo/', '')
     const key = `../pages/manual-del-color-vivo/${slugPath}.jsx`
     pageModules[key]?.()   // fires the dynamic import, caches the module
     ```

3. Cleanup clears the timer if the reader navigates away before 3s.

Notes:
- `Index.jsx` (table of contents) does not use `ManualLayout` — untouched.
- Warming reuses Vite's existing chunks, so no build/config change.
- The `?.()` guard means an unexpected URL shape silently no-ops rather than
  throwing.

### Server — `app/controllers/manual_controller.rb`

Inertia's core sends a `Purpose: prefetch` request header on prefetch visits
(verified in `@inertiajs/core`). `ManualController#show` currently calls
`remember_last_manual_path`, which advances the reader's bookmark
(`User#last_manual_path`, used by the login redirect) to the current page.

**Fix:** skip `remember_last_manual_path` when
`request.headers["Purpose"] == "prefetch"`. Otherwise a prefetch of the *next*
page would move the bookmark to a page the reader never opened, sending them to
the wrong place on next login.

### Deferred comments — server

Wrap the `comments` prop in `InertiaRails.defer`:

```ruby
render inertia: "manual-del-color-vivo/#{params[:component]}", props: {
  title: node[:title],
  section: params[:component],
  nextPage: ...,
  comments: InertiaRails.defer {
    CommentTree.new(section_path: params[:component], current_user: Current.user).as_json
  }
}
```

`CommentTree` (the request's most expensive work — nested tree + per-node
permission annotation) now runs only in the follow-up deferred request, not on
initial render. Deferred props are excluded from the base payload **and** from
prefetch payloads, so a prefetched next page carries no comments; they load
fresh when the reader actually lands on the page and the component mounts.

Note: the deferred fetch re-runs `show` as a partial reload without the
`Purpose: prefetch` header, so it correctly updates `last_manual_path` on the
real visit (idempotent — `remember_last_manual_path` early-returns if unchanged).

### Deferred comments — client (`ManualLayout.jsx`)

Replace the direct render:

```jsx
{comments && section ? <CommentThread comments={comments} section={section} /> : null}
```

with Inertia's `Deferred` wrapper, which renders a fallback until `comments`
arrives, then renders children (which read `comments` from page props):

```jsx
import { Deferred } from '@inertiajs/react'

{section ? (
  <Deferred data="comments" fallback={<CommentsFallback />}>
    <CommentThread section={section} />
  </Deferred>
) : null}
```

- `CommentThread` reads `comments` from `usePage().props` instead of receiving
  it as a prop (or keep the prop and pass it through `usePage` in the layout —
  either way it only renders once loaded, so no undefined guard needed inside).
- `CommentsFallback` renders the same section chrome (top border + "Conversación"
  heading) so there's no layout jump, then a centered spinner: a Tailwind
  `animate-spin` ring in brand colors (e.g. `h-6 w-6 rounded-full border-2
  border-blue/20 border-t-orange`) beside a muted "Cargando conversación…" label.
  Mark it `role="status"` with an `aria-label` for screen readers, and respect
  `motion-reduce:animate-none`.
- `section` stays a normal (non-deferred) prop, always present.

## Testing

- **Request spec** (`spec/requests/manual_spec.rb` or existing manual controller
  spec): GET a section with the `Purpose: prefetch` header leaves the user's
  `last_manual_path` unchanged; a normal GET updates it.
- **Request spec — deferred comments**: a normal GET returns the page with
  `comments` absent from the initial props and listed under `deferredProps`; a
  partial reload requesting only `comments` (header `X-Inertia-Partial-Data:
  comments`) returns the built `CommentTree`.
- **Frontend**: manual verification per project convention (no JS test runner).
  Confirm in the browser Network tab that (a) the comments arrive in a second
  request after page render, showing the fallback briefly; (b) after ~3s the
  next section's props request fires and its chunk loads; (c) clicking the link
  swaps the page with no wait, and comments then load fresh for that page.

## Out of scope

- Prefetching more than one section ahead.
- Prefetching sibling/child links in the table of contents.
- Any change to `Link` markup or cache invalidation on comment post.
