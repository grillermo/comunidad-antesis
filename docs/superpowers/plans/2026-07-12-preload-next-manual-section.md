# Preload Next Manual Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make clicking "next section →" in the manual feel instant by prefetching the next page's props and JS chunk, and load comments lazily after page render behind a spinner.

**Architecture:** Three changes. (1) The `comments` prop becomes an Inertia deferred prop — excluded from the initial and prefetched payloads, fetched in a follow-up request and shown behind a spinner. (2) `ManualController#show` stops advancing the reader's login bookmark on prefetch requests (detected via the `Purpose: prefetch` header). (3) `ManualLayout` runs a 3-second idle timer that programmatically prefetches the next section's props and warms its lazy-loaded React chunk.

**Tech Stack:** Rails 8 + inertia_rails 3.21, Inertia React 3.6 (`Deferred` component, `router.prefetch`), Vite 8 (`import.meta.glob`), Tailwind CSS 4, RSpec.

## Global Constraints

- **Never change a shipped slug** — slugs are both URL and page file path.
- Deferred prop group: default (single follow-up request). No custom group name needed.
- Prefetch cache duration: `30m`. Idle delay before prefetch: `3000` ms.
- Spinner must set `role="status"`, an `aria-label`, and honor `motion-reduce:animate-none`.
- Spanish UI copy (matches existing pages): loading label `Cargando conversación…`.
- Frontend has no JS test runner — frontend behavior is verified manually; only Ruby gets automated tests.

---

### Task 1: Defer the comments prop with a spinner fallback

Comments move off the initial render into a deferred follow-up request. The heavy `CommentTree` build runs only in that follow-up. The client shows a spinner until comments arrive.

**Files:**
- Modify: `app/controllers/manual_controller.rb` (the `render inertia:` call in `show`)
- Modify: `app/frontend/components/comments/CommentThread.jsx` (read `comments` from page props)
- Modify: `app/frontend/components/ManualLayout.jsx` (wrap thread in `Deferred`)
- Create: `app/frontend/components/comments/CommentsFallback.jsx` (spinner)
- Test: `spec/requests/manual_comments_spec.rb` (rewrite for deferred behavior)

**Interfaces:**
- Produces: server lists `comments` under the page object's `deferredProps` (group `"default"`) and omits it from initial `props`; a partial reload with header `X-Inertia-Partial-Data: comments` returns `props.comments` as the `CommentTree` array.
- Produces: `<CommentsFallback />` — a default-exported React component taking no props.
- Consumes: `CommentTree.new(section_path:, current_user:).as_json` (unchanged existing serializer).

- [ ] **Step 1: Rewrite the request spec to expect deferred comments**

Replace the entire body of `spec/requests/manual_comments_spec.rb` with:

```ruby
require "rails_helper"

RSpec.describe "Manual section comments prop", type: :request do
  def page_object(response)
    node = Nokogiri::HTML(response.body).at_css("script[data-page]")
    JSON.parse(node.text)
  end

  let(:user) { create(:user) }
  let(:section) { "el-origen-del-color/introduccion" }

  it "defers the comments prop on the initial render" do
    create(:comment, section_path: section, user: user, body: "hola")
    sign_in user

    get "/manual-del-color-vivo/#{section}"

    expect(response).to have_http_status(:ok)
    page = page_object(response)
    expect(page.dig("props", "section")).to eq(section)
    expect(page.fetch("props")).not_to have_key("comments")
    expect(page.dig("deferredProps", "default")).to include("comments")
  end

  it "returns the built comment tree on a partial reload for comments" do
    create(:comment, section_path: section, user: user, body: "hola")
    sign_in user

    # X-Inertia-Version must match the server's (ViteRuby.digest, set in
    # config/initializers/inertia_rails.rb) or the middleware treats the GET
    # as stale and returns a 409 force-refresh instead of the partial payload.
    get "/manual-del-color-vivo/#{section}",
        headers: {
          "X-Inertia" => "true",
          "X-Inertia-Version" => InertiaRails.configuration.version.to_s,
          "X-Inertia-Partial-Component" => "manual-del-color-vivo/#{section}",
          "X-Inertia-Partial-Data" => "comments"
        }

    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body.dig("props", "comments").first.fetch("body_html")).to include("hola")
  end
end
```

- [ ] **Step 2: Run the spec to verify it fails**

Run: `bundle exec rspec spec/requests/manual_comments_spec.rb`
Expected: FAIL — the first example still finds a `comments` key (comments not yet deferred).

- [ ] **Step 3: Defer the comments prop in the controller**

In `app/controllers/manual_controller.rb`, change the `comments:` entry of the `render inertia:` props hash in `show` from:

```ruby
      comments: CommentTree.new(
        section_path: params[:component],
        current_user: Current.user
      ).as_json
```

to:

```ruby
      comments: InertiaRails.defer {
        CommentTree.new(
          section_path: params[:component],
          current_user: Current.user
        ).as_json
      }
```

- [ ] **Step 4: Run the spec to verify it passes**

Run: `bundle exec rspec spec/requests/manual_comments_spec.rb`
Expected: PASS (both examples).

- [ ] **Step 5: Create the spinner fallback component**

Create `app/frontend/components/comments/CommentsFallback.jsx`:

```jsx
export default function CommentsFallback() {
  return (
    <section className="mt-14 border-t border-blue/20 pt-9" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="font-display text-2xl font-bold text-blue">Conversación</h2>
      <div role="status" aria-label="Cargando conversación" className="mt-8 flex items-center gap-3 py-5">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue/20 border-t-orange motion-reduce:animate-none" />
        <span className="text-sm text-blue-ink/65">Cargando conversación…</span>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Make CommentThread read comments from page props**

In `app/frontend/components/comments/CommentThread.jsx`, change the imports and signature so it no longer receives `comments` as a prop (the `Deferred` wrapper renders it only after comments load). Replace lines 1-4:

```jsx
import { usePage } from '@inertiajs/react'
import CommentForm from './CommentForm'
import CommentNode from './CommentNode'

export default function CommentThread({ section }) {
  const { comments } = usePage().props
```

Leave the rest of the component (the `<section>` body using `comments` and `section`) unchanged.

- [ ] **Step 7: Wrap the thread in Deferred in ManualLayout**

In `app/frontend/components/ManualLayout.jsx`:

Change line 1-2 imports to add `Deferred` and the fallback:

```jsx
import { Link, usePage, Deferred } from '@inertiajs/react'
import CommentThread from './comments/CommentThread'
import CommentsFallback from './comments/CommentsFallback'
```

Change the destructure on line 5 to drop `comments` (no longer read directly here):

```jsx
  const { section, nextPage } = usePage().props
```

Replace the comment render line (line 22):

```jsx
        {comments && section ? <CommentThread comments={comments} section={section} /> : null}
```

with:

```jsx
        {section ? (
          <Deferred data="comments" fallback={<CommentsFallback />}>
            <CommentThread section={section} />
          </Deferred>
        ) : null}
```

- [ ] **Step 8: Verify the build compiles**

Run: `bin/vite build`
Expected: build succeeds with no errors.

- [ ] **Step 9: Manually verify in the browser**

Start `./serve-dev`, sign in, open a manual section (e.g. `/manual-del-color-vivo/el-origen-del-color/introduccion`). In the Network tab confirm: the initial document has no comments in `data-page` props; a second request (`X-Inertia-Partial-Data: comments`) fires right after render; the spinner shows briefly, then the thread appears.

- [ ] **Step 10: Commit**

```bash
git add app/controllers/manual_controller.rb app/frontend/components/ManualLayout.jsx app/frontend/components/comments/CommentThread.jsx app/frontend/components/comments/CommentsFallback.jsx spec/requests/manual_comments_spec.rb
git commit -m "feat: defer manual comments loading behind a spinner"
```

---

### Task 2: Skip the reader bookmark update on prefetch requests

Inertia sends a `Purpose: prefetch` header on prefetch visits. Without this guard, prefetching the next section would move `User#last_manual_path` to a page the reader never opened, breaking the login redirect.

**Files:**
- Modify: `app/controllers/manual_controller.rb` (`remember_last_manual_path`)
- Test: `spec/requests/manual_spec.rb` (add one example)

**Interfaces:**
- Consumes: `request.headers["Purpose"]` — equals `"prefetch"` on Inertia prefetch visits.
- Produces: on a request carrying `Purpose: prefetch`, `User#last_manual_path` is left unchanged.

- [ ] **Step 1: Add the failing spec**

In `spec/requests/manual_spec.rb`, add this example after the existing "records the last section" example (after line 44):

```ruby
  it "does not record the last section for a prefetch request" do
    sign_in user
    get "/manual-del-color-vivo/color-cotidiano/velas",
        headers: { "Purpose" => "prefetch" }

    expect(user.reload.last_manual_path).to be_nil
  end
```

- [ ] **Step 2: Run the spec to verify it fails**

Run: `bundle exec rspec spec/requests/manual_spec.rb -e "prefetch"`
Expected: FAIL — `last_manual_path` is `"color-cotidiano/velas"`, not `nil` (bookmark still written).

- [ ] **Step 3: Guard remember_last_manual_path against prefetch**

In `app/controllers/manual_controller.rb`, change the `remember_last_manual_path` method. Replace:

```ruby
  def remember_last_manual_path
    user = Current.user
    return if user.nil? || user.last_manual_path == params[:component]

    user.update_column(:last_manual_path, params[:component])
  end
```

with:

```ruby
  def remember_last_manual_path
    return if request.headers["Purpose"] == "prefetch"

    user = Current.user
    return if user.nil? || user.last_manual_path == params[:component]

    user.update_column(:last_manual_path, params[:component])
  end
```

- [ ] **Step 4: Run the spec to verify it passes**

Run: `bundle exec rspec spec/requests/manual_spec.rb`
Expected: PASS (new example plus all existing ones — the normal "records the last section" example still passes).

- [ ] **Step 5: Commit**

```bash
git add app/controllers/manual_controller.rb spec/requests/manual_spec.rb
git commit -m "feat: skip reader bookmark update on prefetch requests"
```

---

### Task 3: Prefetch the next section and warm its JS chunk

After the reader has spent 3 seconds on a page, prefetch the next section's props (30-minute cache) and eagerly import its React component chunk so navigation resolves from cache with no network wait.

**Files:**
- Modify: `app/frontend/components/ManualLayout.jsx` (add imports + a `useEffect`)

**Interfaces:**
- Consumes: `nextPage.url` page prop — a string like `/manual-del-color-vivo/<slug/path>` (or absent on the last section).
- Consumes: `router.prefetch(url, visitOptions, { cacheFor })` from `@inertiajs/react`.
- Consumes: Vite `import.meta.glob('../pages/manual-del-color-vivo/**/*.jsx')` — maps glob keys like `../pages/manual-del-color-vivo/<slug/path>.jsx` to lazy import loaders. All 88 page files match; keys mirror the URL slug path.

- [ ] **Step 1: Add imports and the module-level glob**

In `app/frontend/components/ManualLayout.jsx`, update the React import to include `router` and `useEffect`, and add the glob at module scope (below the imports, above the component):

```jsx
import { useEffect } from 'react'
import { Link, usePage, Deferred, router } from '@inertiajs/react'
import CommentThread from './comments/CommentThread'
import CommentsFallback from './comments/CommentsFallback'

// Same 88 page files Vite already chunks — reused here to warm the next
// section's module. import.meta.glob dedupes to the existing chunks.
const pageModules = import.meta.glob('../pages/manual-del-color-vivo/**/*.jsx')
```

- [ ] **Step 2: Add the idle-prefetch effect**

Inside the `ManualLayout` component, after the `usePage` destructure and before the `return`, add:

```jsx
  useEffect(() => {
    if (!nextPage) return

    const timer = setTimeout(() => {
      router.prefetch(nextPage.url, { method: 'get' }, { cacheFor: '30m' })

      const slugPath = nextPage.url.replace('/manual-del-color-vivo/', '')
      const chunkKey = `../pages/manual-del-color-vivo/${slugPath}.jsx`
      pageModules[chunkKey]?.()
    }, 3000)

    return () => clearTimeout(timer)
  }, [nextPage?.url])
```

- [ ] **Step 3: Verify the build compiles**

Run: `bin/vite build`
Expected: build succeeds. The glob resolves statically (no "cannot analyze" Vite warning).

- [ ] **Step 4: Manually verify prefetch + instant navigation**

Start `./serve-dev`, sign in, open a section that has a next section (e.g. `/manual-del-color-vivo/el-origen-del-color/introduccion`). In the Network tab:
- After ~3s, confirm a props request to the next section fires (carries `Purpose: prefetch`) and its JS chunk loads.
- Click "next section →": the page swaps with no new props/chunk request; only the deferred `comments` request fires for the new page.
- Confirm the reader bookmark did not jump: the prefetch request must not have changed where a fresh login lands.

- [ ] **Step 5: Run the full Ruby suite**

Run: `bundle exec rspec`
Expected: PASS (no regressions).

- [ ] **Step 6: Commit**

```bash
git add app/frontend/components/ManualLayout.jsx
git commit -m "feat: prefetch next manual section and warm its chunk on idle"
```

---

## Notes for the implementer

- **Task order matters.** Task 1 must land before Task 3's manual verification, since Task 3's check ("only the deferred comments request fires") depends on comments being deferred.
- **`Index.jsx`** (table of contents) does not use `ManualLayout` — it is unaffected by all three tasks.
- **No new chunks:** the `import.meta.glob` in Task 3 points at the same files Inertia's page resolver already globs, so Vite emits no extra chunks; warming just triggers the existing lazy import early.
- **Last section:** nodes with no `nextPage` prop (e.g. `glosario`) skip the prefetch effect via the `if (!nextPage) return` guard.
