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

## Approach: idle-delay programmatic prefetch + chunk warming

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

## Trade-offs accepted

- **Stale comments up to 30m.** If someone posts a comment on the next section
  during the reader's 30m cache window, the reader sees the pre-prefetch state
  on arrival. Acceptable for a reading app. The reader's *own* comments are
  unaffected — posting reloads the current section fresh.

## Testing

- **Request spec** (`spec/requests/manual_spec.rb` or existing manual controller
  spec): GET a section with the `Purpose: prefetch` header leaves the user's
  `last_manual_path` unchanged; a normal GET updates it.
- **Frontend**: manual verification per project convention (no JS test runner).
  Confirm in the browser Network tab that after ~3s the next section's props
  request fires, its chunk loads, and clicking the link produces no new request.

## Out of scope

- Prefetching more than one section ahead.
- Prefetching sibling/child links in the table of contents.
- Any change to `Link` markup or cache invalidation on comment post.
