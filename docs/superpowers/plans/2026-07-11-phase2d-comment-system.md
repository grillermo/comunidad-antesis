# Phase 2d — Comment System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Reddit-style nested comment system to every manual section: authenticated posting, unlimited nesting, server-rendered sanitized Markdown, hearts (positive-only), sticky pinning, author/admin edit + soft-delete, per-comment reply notifications, admin email with a signed approve link, and RailsAdmin moderation.

**Architecture:** Three new tables (`comments`, `hearts`, `comment_subscriptions`) in the unified Postgres schema. `Comment` uses the `ancestry` gem for the tree and stores raw `body` + cached sanitized `body_html`. Comments attach to a section by its full **component path** string (the unique per-page identifier from Phase 2c routes), validated with `Manual.path?`. Controllers are plain Inertia actions that redirect back and let the thread refresh via a partial reload of the `comments` prop. Emails go through ActionMailer `deliver_later` on Solid Queue.

**Tech Stack:** Rails 8.0.5, Ruby 3.4.7, Postgres, `ancestry`, `commonmarker`, Rails HTML sanitizer, Inertia Rails + React 19, RSpec, Devise, RailsAdmin, Solid Queue.

**Spec:** `docs/superpowers/specs/2026-07-11-phase2d-comment-system-design.md`

## Executor-approved reconciliations

- RailsAdmin is the only moderation UI for sticky/approve controls; the
  comment thread does not add a custom Inertia moderation UI.
- `section` remains a top-level Inertia prop rather than being duplicated in
  every serialized comment node.
- Sticky comments are restricted to roots, replies cannot target deleted or
  cross-section parents, and invalid/expired approval tokens render a friendly
  error page.
- Signed approval tokens consistently use purpose `:approve`.

## Execution progress

- Baseline: 53 examples, 0 failures at `cb852bc`.
- Task 1 complete: `944f86f` — dependencies installed and locked.
- Task 1b complete: `d7b1230` — FactoryBot RSpec configuration and minimal
  user factory added; focused user spec passed (5 examples, 0 failures).
- Next resume point: run the pending Task 1/1b review gate using
  `.superpowers/sdd/task-1-brief.md`, `.superpowers/sdd/task-1-report.md`, and
  `.superpowers/sdd/review-cb852bc..d7b1230.diff`, then begin Task 2.

---

## Naming reconciliation

The spec calls the section reference `section_slug`. Manual slugs are **not**
globally unique across the tree, but the full route path (e.g.
`color-sobre-fibra/guia-de-lavado`) is. This plan names the column
**`section_path`** and stores that full component-path string. Same concept as
the spec, clearer name. Validation uses the existing `Manual.path?(segments)`.

## Verification prelude

All shell commands in this plan assume the rbenv shim path used in this repo:

```bash
export PATH="/Users/grillermo/.rbenv/shims:$PATH"
```

Run RSpec with `bundle exec rspec`. **factory_bot is added in Task 1 and is the
exclusive way to build ActiveRecord objects in tests** — never `Model.create!`
or `Model.new` in specs; always `build`/`create(:factory)`. Factories carry the
minimal fields needed to pass validations (Task 1b). Sign in with Devise's
`sign_in` helper (already wired in `spec/support/devise.rb`). Request specs read
Inertia props by parsing the `script[data-page]` node (see
`spec/requests/landing_authenticated_spec.rb` for the exact pattern).

Commit after every green step. Work directly on `main` (this repo's convention;
no worktree/branch per prior phases).

---

## File Structure

- Create `db/migrate/*_create_comments.rb`, `*_create_hearts.rb`, `*_create_comment_subscriptions.rb`
- Create `app/models/comment.rb`, `app/models/heart.rb`, `app/models/comment_subscription.rb`
- Create `app/services/comment_markdown.rb` — Markdown render + sanitize (one responsibility)
- Create `app/serializers/comment_tree.rb` — builds the props payload for a section
- Modify `app/models/user.rb` — associations
- Modify `app/models/manual.rb` — only if a public slug/path helper is missing (it isn't; `Manual.path?` exists)
- Create `app/controllers/comments_controller.rb`, `app/controllers/hearts_controller.rb`, `app/controllers/moderation/approvals_controller.rb`
- Modify `app/controllers/manual_controller.rb` — pass `comments` prop on `#show`
- Create `app/mailers/comment_mailer.rb` + `app/views/comment_mailer/*.html.erb`
- Modify `config/routes.rb` — comment/heart/approval routes
- Modify `config/initializers/rails_admin.rb` — register `Comment`
- Modify `Gemfile` — add `ancestry`, `commonmarker`
- Create `app/frontend/components/comments/*.jsx` + mount in `app/frontend/components/ManualLayout.jsx`
- Create `spec/support/factory_bot.rb` + `spec/factories/{users,comments,hearts,comment_subscriptions}.rb`
- Create specs under `spec/models`, `spec/requests`, `spec/mailers`, `spec/services` — all use FactoryBot exclusively

---

## Chunk 1: Data layer

### Task 1: Add gems

**Files:**
- Modify: `Gemfile`

- [x] **Step 1: Add gems**

Add to `Gemfile` (top-level runtime gems, near `devise`):

```ruby
gem "ancestry", "~> 4.3"
gem "commonmarker", "~> 1.1"
```

Add `factory_bot_rails` to the existing `group :development, :test` block:

```ruby
group :development, :test do
  # ... existing gems ...
  gem "factory_bot_rails", "~> 6.4"
end
```

- [x] **Step 2: Install**

Run: `bundle install`
Expected: bundle completes; `Gemfile.lock` gains `ancestry`, `commonmarker`, and `factory_bot_rails`.

- [x] **Step 3: Commit**

```bash
git add Gemfile Gemfile.lock
git commit -m "Add ancestry, commonmarker, and factory_bot gems for comments"
```

---

### Task 1b: FactoryBot config + minimal factories

**Files:**
- Create: `spec/support/factory_bot.rb`
- Create: `spec/factories/users.rb`, `spec/factories/comments.rb`, `spec/factories/hearts.rb`, `spec/factories/comment_subscriptions.rb`

Factories are added incrementally as each model lands (a `comment` factory can't
exist before the `comments` table). Create the config + `user` factory now; add
the others in the model tasks that introduce them. Each factory carries only the
minimal fields required to pass validations — no extra attributes.

- [x] **Step 1: FactoryBot syntax config**

Create `spec/support/factory_bot.rb`:

```ruby
RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods
end
```

(`factory_bot_rails` auto-loads `spec/factories/**`. The file above enables the
bare `build`/`create` syntax; it is required automatically via the existing
`spec/support/**/*.rb` glob in `rails_helper.rb`.)

- [x] **Step 2: User factory**

Create `spec/factories/users.rb`:

```ruby
FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }

    trait :admin do
      role { :admin }
    end
  end
end
```

- [x] **Step 3: Sanity check**

Run: `bundle exec rspec spec/models/user_spec.rb`
Expected: still PASS (existing examples untouched; factory unused yet).

- [x] **Step 4: Commit**

```bash
git add spec/support/factory_bot.rb spec/factories/users.rb
git commit -m "Add FactoryBot config and minimal user factory"
```

---

### Task 2: Comments table + base model

**Files:**
- Create: `db/migrate/<ts>_create_comments.rb`
- Create: `app/models/comment.rb`
- Test: `spec/models/comment_spec.rb`

- [x] **Step 1: Write the failing test**

Create `spec/models/comment_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe Comment, type: :model do
  it "is valid with a known section path, author, and body" do
    expect(build(:comment)).to be_valid
  end

  it "rejects an unknown section path" do
    comment = build(:comment, section_path: "no/existe")
    expect(comment).not_to be_valid
    expect(comment.errors[:section_path]).to be_present
  end

  it "requires a body" do
    expect(build(:comment, body: nil)).not_to be_valid
  end

  it "nests replies with ancestry" do
    parent = create(:comment)
    reply  = create(:comment, parent: parent)
    expect(reply.parent).to eq(parent)
    expect(parent.children).to include(reply)
  end
end
```

The `comment` factory is created in Step 5b below, before the model passes.

- [x] **Step 2: Run and confirm failure**

Run: `bundle exec rspec spec/models/comment_spec.rb`
Expected: FAIL — uninitialized constant `Comment`.

- [x] **Step 3: Create the migration**

Create `db/migrate/<ts>_create_comments.rb` (use `rails g migration CreateComments` to get a timestamp, then replace body):

```ruby
class CreateComments < ActiveRecord::Migration[8.0]
  def change
    create_table :comments do |t|
      t.string   :section_path, null: false
      t.references :user, null: false, foreign_key: true
      t.text     :body, null: false
      t.text     :body_html
      t.string   :ancestry, collation: "C"
      t.integer  :hearts_count, null: false, default: 0
      t.boolean  :sticky, null: false, default: false
      t.boolean  :approved, null: false, default: false
      t.datetime :deleted_at
      t.timestamps
    end

    add_index :comments, [:section_path, :ancestry]
    add_index :comments, :ancestry
  end
end
```

- [x] **Step 4: Migrate**

Run: `bin/rails db:migrate`
Expected: `comments` table created; `db/schema.rb` updated (version bumped).

- [x] **Step 5: Create the model**

Create `app/models/comment.rb`:

```ruby
class Comment < ApplicationRecord
  has_ancestry

  belongs_to :user

  validates :body, presence: true
  validate  :section_path_must_exist

  private

  def section_path_must_exist
    return if section_path.present? && Manual.path?(section_path.split("/"))

    errors.add(:section_path, "is not a known manual section")
  end
end
```

- [x] **Step 5b: Create the comment factory**

Create `spec/factories/comments.rb` (minimal valid fields only):

```ruby
FactoryBot.define do
  factory :comment do
    user
    section_path { "el-origen-del-color/introduccion" }
    body { "Un comentario" }
  end
end
```

- [x] **Step 6: Run and confirm pass**

Run: `bundle exec rspec spec/models/comment_spec.rb`
Expected: PASS (4 examples).

- [x] **Step 7: Commit**

```bash
git add db/migrate db/schema.rb app/models/comment.rb spec/models/comment_spec.rb spec/factories/comments.rb
git commit -m "Add Comment model with ancestry and section validation"
```

---

### Task 3: Markdown rendering + sanitization

**Files:**
- Create: `app/services/comment_markdown.rb`
- Test: `spec/services/comment_markdown_spec.rb`
- Modify: `app/models/comment.rb`

- [x] **Step 1: Write the failing service test**

Create `spec/services/comment_markdown_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe CommentMarkdown do
  def render(text) = described_class.render(text)

  it "renders basic Markdown" do
    expect(render("**bold** and *italic*")).to include("<strong>bold</strong>")
    expect(render("**bold** and *italic*")).to include("<em>italic</em>")
  end

  it "renders strikethrough, links, and code blocks" do
    expect(render("~~gone~~")).to include("<del>gone</del>")
    expect(render("[x](https://example.com)")).to include('href="https://example.com"')
    expect(render("```\ncode\n```")).to include("<code>")
  end

  it "strips <script> tags" do
    expect(render("hi <script>alert(1)</script>")).not_to include("<script")
  end

  it "strips javascript: hrefs" do
    html = render("[x](javascript:alert(1))")
    expect(html).not_to include("javascript:")
  end

  it "strips inline event handlers and onerror images" do
    html = render('<img src="x" onerror="alert(1)">')
    expect(html).not_to include("onerror")
  end
end
```

- [x] **Step 2: Run and confirm failure**

Run: `bundle exec rspec spec/services/comment_markdown_spec.rb`
Expected: FAIL — uninitialized constant `CommentMarkdown`.

- [x] **Step 3: Implement the service**

Create `app/services/comment_markdown.rb`:

```ruby
# Renders user Markdown to sanitized, trusted HTML. Single source of truth for
# comment HTML — reused by the web thread and by notification emails.
class CommentMarkdown
  ALLOWED_TAGS = %w[
    p br strong em del a code pre blockquote
    ul ol li h1 h2 h3 h4 h5 h6 hr
    table thead tbody tr th td img
  ].freeze

  ALLOWED_ATTRIBUTES = %w[href src alt title].freeze

  def self.render(text)
    return "" if text.blank?

    raw = Commonmarker.to_html(
      text,
      options: { extension: { strikethrough: true, table: true, autolink: true, tagfilter: true } }
    )

    ActionController::Base.helpers.sanitize(
      raw,
      tags: ALLOWED_TAGS,
      attributes: ALLOWED_ATTRIBUTES
    )
  end
end
```

Note: Rails' `sanitize` drops `javascript:`/unsafe schemes and event-handler
attributes by default once the allowlist excludes them. `tagfilter` neutralizes
raw HTML tags like `<script>` inside Markdown.

- [x] **Step 4: Run and confirm pass**

Run: `bundle exec rspec spec/services/comment_markdown_spec.rb`
Expected: PASS.

- [x] **Step 5: Wire rendering into the model**

Add to `app/models/comment.rb` (inside the class, after validations):

```ruby
  before_save :render_body_html, if: :will_save_change_to_body?

  private

  def render_body_html
    self.body_html = CommentMarkdown.render(body)
  end
```

(Keep the existing `section_path_must_exist` private method below.)

- [x] **Step 6: Add a model test for caching**

Append to `spec/models/comment_spec.rb`:

```ruby
  it "caches sanitized body_html on save" do
    c = create(:comment, body: "**hi**")
    expect(c.body_html).to include("<strong>hi</strong>")
  end
```

- [x] **Step 7: Run and confirm pass**

Run: `bundle exec rspec spec/models/comment_spec.rb spec/services/comment_markdown_spec.rb`
Expected: PASS.

- [x] **Step 8: Commit**

```bash
git add app/services/comment_markdown.rb spec/services/comment_markdown_spec.rb app/models/comment.rb spec/models/comment_spec.rb
git commit -m "Render and sanitize comment Markdown into cached body_html"
```

---

### Task 4: Soft-delete tombstone

**Files:**
- Modify: `app/models/comment.rb`
- Test: `spec/models/comment_spec.rb`

- [x] **Step 1: Write the failing test**

Append to `spec/models/comment_spec.rb`:

```ruby
  describe "soft delete" do
    it "marks deleted, hides body, and keeps replies" do
      parent = create(:comment)
      reply  = create(:comment, parent: parent)

      parent.soft_delete!

      expect(parent.reload.deleted?).to be(true)
      expect(parent.display_body_html).to eq("<p>[eliminado]</p>")
      expect(parent.children).to include(reply)
    end

    it "reports not-deleted comments as active" do
      c = create(:comment)
      expect(c.deleted?).to be(false)
      expect(c.display_body_html).to eq(c.body_html)
    end
  end

  it "only allows sticky on root comments" do
    parent = create(:comment)
    expect(build(:comment, parent: parent, sticky: true)).not_to be_valid
  end

  it "rejects deleted and cross-section parents" do
    deleted_parent = create(:comment)
    deleted_parent.soft_delete!
    expect(build(:comment, parent: deleted_parent)).not_to be_valid

    other_parent = create(:comment, section_path: "color-sobre-fibra/introduccion")
    expect(build(:comment, parent: other_parent)).not_to be_valid
  end
```

- [x] **Step 2: Run and confirm failure**

Run: `bundle exec rspec spec/models/comment_spec.rb -e "soft delete"`
Expected: FAIL — no `soft_delete!`.

- [x] **Step 3: Implement**

Add to `app/models/comment.rb`:

```ruby
  TOMBSTONE_HTML = "<p>[eliminado]</p>".freeze

  scope :active, -> { where(deleted_at: nil) }

  def deleted? = deleted_at.present?

  def soft_delete!
    update!(deleted_at: Time.current)
  end

  def display_body_html
    deleted? ? TOMBSTONE_HTML : body_html
  end

  validate :sticky_only_on_root
  validate :parent_must_be_active_and_in_same_section

  private

  def sticky_only_on_root
    errors.add(:sticky, "is only allowed on root comments") if sticky? && parent.present?
  end

  def parent_must_be_active_and_in_same_section
    return unless parent

    errors.add(:parent, "is deleted") if parent.deleted?
    errors.add(:parent, "belongs to another section") if parent.section_path != section_path
  end
```

- [x] **Step 4: Run and confirm pass**

Run: `bundle exec rspec spec/models/comment_spec.rb`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add app/models/comment.rb spec/models/comment_spec.rb
git commit -m "Add soft-delete tombstone to Comment"
```

---

### Task 5: Heart model + counter cache

**Files:**
- Create: `db/migrate/<ts>_create_hearts.rb`
- Create: `app/models/heart.rb`
- Modify: `app/models/comment.rb`
- Test: `spec/models/heart_spec.rb`

- [x] **Step 1: Write the failing test**

Create `spec/models/heart_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe Heart, type: :model do
  let(:comment) { create(:comment) }

  it "increments hearts_count on the comment" do
    expect { create(:heart, comment: comment) }
      .to change { comment.reload.hearts_count }.from(0).to(1)
  end

  it "enforces one heart per user per comment" do
    user = create(:user)
    create(:heart, user: user, comment: comment)
    dup = build(:heart, user: user, comment: comment)
    expect(dup).not_to be_valid
  end

  it "decrements when removed" do
    heart = create(:heart, comment: comment)
    expect { heart.destroy }.to change { comment.reload.hearts_count }.from(1).to(0)
  end
end
```

- [x] **Step 2: Run and confirm failure**

Run: `bundle exec rspec spec/models/heart_spec.rb`
Expected: FAIL — uninitialized constant `Heart`.

- [x] **Step 3: Migration**

```ruby
class CreateHearts < ActiveRecord::Migration[8.0]
  def change
    create_table :hearts do |t|
      t.references :user, null: false, foreign_key: true
      t.references :comment, null: false, foreign_key: true
      t.timestamps
    end
    add_index :hearts, [:user_id, :comment_id], unique: true
  end
end
```

Run: `bin/rails db:migrate`

- [x] **Step 4: Models**

Create `app/models/heart.rb`:

```ruby
class Heart < ApplicationRecord
  belongs_to :user
  belongs_to :comment, counter_cache: :hearts_count

  validates :user_id, uniqueness: { scope: :comment_id }
end
```

Add to `app/models/comment.rb` (with associations):

```ruby
  has_many :hearts, dependent: :destroy
```

- [x] **Step 4b: Heart factory**

Create `spec/factories/hearts.rb`:

```ruby
FactoryBot.define do
  factory :heart do
    user
    comment
  end
end
```

- [x] **Step 5: Run and confirm pass**

Run: `bundle exec rspec spec/models/heart_spec.rb`
Expected: PASS.

- [x] **Step 6: Commit**

```bash
git add db/migrate db/schema.rb app/models/heart.rb app/models/comment.rb spec/models/heart_spec.rb spec/factories/hearts.rb
git commit -m "Add Heart model with hearts_count counter cache"
```

---

### Task 6: CommentSubscription model

**Files:**
- Create: `db/migrate/<ts>_create_comment_subscriptions.rb`
- Create: `app/models/comment_subscription.rb`
- Modify: `app/models/comment.rb`
- Test: `spec/models/comment_subscription_spec.rb`

- [x] **Step 1: Write the failing test**

Create `spec/models/comment_subscription_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe CommentSubscription, type: :model do
  let(:user) { create(:user) }
  let(:comment) { create(:comment) }

  it "is valid for a user + comment" do
    expect(build(:comment_subscription, user: user, comment: comment)).to be_valid
  end

  it "is unique per user + comment" do
    create(:comment_subscription, user: user, comment: comment)
    expect(build(:comment_subscription, user: user, comment: comment)).not_to be_valid
  end
end
```

- [x] **Step 2: Run and confirm failure**

Run: `bundle exec rspec spec/models/comment_subscription_spec.rb`
Expected: FAIL — uninitialized constant.

- [x] **Step 3: Migration**

```ruby
class CreateCommentSubscriptions < ActiveRecord::Migration[8.0]
  def change
    create_table :comment_subscriptions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :comment, null: false, foreign_key: true
      t.timestamps
    end
    add_index :comment_subscriptions, [:user_id, :comment_id], unique: true
  end
end
```

Run: `bin/rails db:migrate`

- [x] **Step 4: Models**

Create `app/models/comment_subscription.rb`:

```ruby
class CommentSubscription < ApplicationRecord
  belongs_to :user
  belongs_to :comment

  validates :user_id, uniqueness: { scope: :comment_id }
end
```

Add to `app/models/comment.rb`:

```ruby
  has_many :comment_subscriptions, dependent: :destroy
  has_many :subscribers, through: :comment_subscriptions, source: :user
```

- [x] **Step 4b: CommentSubscription factory**

Create `spec/factories/comment_subscriptions.rb`:

```ruby
FactoryBot.define do
  factory :comment_subscription do
    user
    comment
  end
end
```

- [x] **Step 5: Run and confirm pass**

Run: `bundle exec rspec spec/models/comment_subscription_spec.rb`
Expected: PASS.

- [x] **Step 6: Commit**

```bash
git add db/migrate db/schema.rb app/models/comment_subscription.rb app/models/comment.rb spec/models/comment_subscription_spec.rb spec/factories/comment_subscriptions.rb
git commit -m "Add CommentSubscription model for reply notifications"
```

---

### Task 7: User associations

**Files:**
- Modify: `app/models/user.rb`
- Test: `spec/models/user_spec.rb`

- [x] **Step 1: Write the failing test**

Append to `spec/models/user_spec.rb`:

```ruby
  it "has comments, hearts, and comment subscriptions" do
    user = create(:user)
    comment = create(:comment, user: user)
    expect(user.comments).to include(comment)
    expect(user).to respond_to(:hearts)
    expect(user).to respond_to(:comment_subscriptions)
  end
```

- [x] **Step 2: Run and confirm failure**

Run: `bundle exec rspec spec/models/user_spec.rb -e "has comments"`
Expected: FAIL — no `comments` association.

- [x] **Step 3: Implement**

Add to `app/models/user.rb` (inside the class):

```ruby
  has_many :comments, dependent: :destroy
  has_many :hearts, dependent: :destroy
  has_many :comment_subscriptions, dependent: :destroy
```

- [x] **Step 4: Run and confirm pass**

Run: `bundle exec rspec spec/models/user_spec.rb`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add app/models/user.rb spec/models/user_spec.rb
git commit -m "Associate User with comments, hearts, and subscriptions"
```

---

## Chunk 2: Serialization + read path

### Task 8: CommentTree serializer

**Files:**
- Create: `app/serializers/comment_tree.rb`
- Test: `spec/serializers/comment_tree_spec.rb`

- [x] **Step 1: Write the failing test**

Create `spec/serializers/comment_tree_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe CommentTree do
  let(:section) { "el-origen-del-color/introduccion" }
  let(:author) { create(:user) }
  let(:admin)  { create(:user, :admin) }
  let(:viewer) { create(:user) }

  it "returns roots sorted by sticky then hearts then newest, replies chronological" do
    low  = create(:comment, section_path: section, user: author, body: "low")
    high = create(:comment, section_path: section, user: author, body: "high")
    create(:heart, user: viewer, comment: high)
    pinned = create(:comment, section_path: section, user: author, body: "pin", sticky: true)
    reply_a = create(:comment, section_path: section, user: author, body: "r1", parent: low)
    reply_b = create(:comment, section_path: section, user: author, body: "r2", parent: low)

    tree = CommentTree.new(section_path: section, current_user: viewer).as_json
    expect(tree.map { |n| n[:id] }).to eq([pinned.id, high.id, low.id])
    low_node = tree.find { |n| n[:id] == low.id }
    expect(low_node[:replies].map { |n| n[:id] }).to eq([reply_a.id, reply_b.id])
  end

  it "exposes permission flags and heart state per viewer" do
    c = create(:comment, section_path: section, user: author)
    create(:heart, user: viewer, comment: c)

    as_viewer = CommentTree.new(section_path: section, current_user: viewer).as_json.first
    expect(as_viewer[:hearted]).to be(true)
    expect(as_viewer[:can_edit]).to be(false)
    expect(as_viewer[:can_delete]).to be(false)

    as_author = CommentTree.new(section_path: section, current_user: author).as_json.first
    expect(as_author[:can_edit]).to be(true)
    expect(as_author[:can_delete]).to be(true)

    as_admin = CommentTree.new(section_path: section, current_user: admin).as_json.first
    expect(as_admin[:can_delete]).to be(true)
    expect(as_admin[:can_moderate]).to be(true)
  end

  it "renders tombstones for deleted comments" do
    c = create(:comment, section_path: section, user: author, body: "secret")
    c.soft_delete!
    node = CommentTree.new(section_path: section, current_user: viewer).as_json.first
    expect(node[:body_html]).to eq("<p>[eliminado]</p>")
    expect(node[:deleted]).to be(true)
  end
end
```

- [x] **Step 2: Run and confirm failure**

Run: `bundle exec rspec spec/serializers/comment_tree_spec.rb`
Expected: FAIL — uninitialized constant `CommentTree`.

- [x] **Step 3: Implement**

Create `app/serializers/comment_tree.rb`:

```ruby
# Builds the ordered, nested comment payload for one manual section, with
# per-viewer permission and heart flags. Consumed as an Inertia prop.
class CommentTree
  def initialize(section_path:, current_user:)
    @section_path = section_path
    @current_user = current_user
  end

  def as_json(*)
    comments = Comment.where(section_path: @section_path).includes(:user)
    @hearted_ids = @current_user ? @current_user.hearts.where(comment_id: comments.map(&:id)).pluck(:comment_id).to_set : Set.new
    by_parent = comments.group_by(&:parent_id)
    build(by_parent[nil] || [], by_parent, root: true)
  end

  private

  def build(nodes, by_parent, root:)
    ordered = root ? sort_roots(nodes) : nodes.sort_by(&:created_at)
    ordered.map do |c|
      node(c).merge(replies: build(by_parent[c.id] || [], by_parent, root: false))
    end
  end

  def sort_roots(nodes)
    nodes.sort_by { |c| [c.sticky ? 0 : 1, -c.hearts_count, -c.created_at.to_f] }
  end

  def node(comment)
    {
      id: comment.id,
      author: comment.deleted? ? nil : comment.user.email,
      body_html: comment.display_body_html,
      hearts_count: comment.hearts_count,
      hearted: @hearted_ids.include?(comment.id),
      sticky: comment.sticky,
      approved: comment.approved,
      deleted: comment.deleted?,
      created_at: comment.created_at.iso8601,
      can_edit: can_edit?(comment),
      can_delete: can_delete?(comment),
      can_moderate: admin?
    }
  end

  def can_edit?(comment)
    return false if comment.deleted?
    admin? || comment.user_id == @current_user&.id
  end
  alias can_delete? can_edit?

  def admin? = @current_user&.admin? || false
end
```

- [x] **Step 4: Run and confirm pass**

Run: `bundle exec rspec spec/serializers/comment_tree_spec.rb`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add app/serializers/comment_tree.rb spec/serializers/comment_tree_spec.rb
git commit -m "Add CommentTree serializer for section comment props"
```

---

### Task 9: Pass comments prop from ManualController#show

**Files:**
- Modify: `app/controllers/manual_controller.rb`
- Test: `spec/requests/manual_comments_spec.rb`

- [x] **Step 1: Write the failing request test**

Create `spec/requests/manual_comments_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "Manual section comments prop", type: :request do
  def page_props(response)
    node = Nokogiri::HTML(response.body).at_css("script[data-page]")
    JSON.parse(node.text).fetch("props")
  end

  let(:user) { create(:user) }

  it "includes a comments prop for the section" do
    create(:comment, section_path: "el-origen-del-color/introduccion", user: user, body: "hola")
    sign_in user

    get "/manual-del-color-vivo/el-origen-del-color/introduccion"

    expect(response).to have_http_status(:ok)
    props = page_props(response)
    expect(props.fetch("section")).to eq("el-origen-del-color/introduccion")
    expect(props.fetch("comments").first.fetch("body_html")).to include("hola")
  end
end
```

Note: `section` is added to the props at the controller level (see below) so
the frontend knows where to post. If `<p>hola</p>` differs from Commonmarker's
exact output, adjust the expectation to `include("hola")`.

- [x] **Step 2: Run and confirm failure**

Run: `bundle exec rspec spec/requests/manual_comments_spec.rb`
Expected: FAIL — no `comments` prop.

- [x] **Step 3: Implement**

Modify `app/controllers/manual_controller.rb` `#show`:

```ruby
  def show
    segments = params[:component].split("/")
    node = Manual.find(segments)
    raise ActiveRecord::RecordNotFound unless node

    render inertia: "manual-del-color-vivo/#{params[:component]}", props: {
      title: node[:title],
      section: params[:component],
      comments: CommentTree.new(section_path: params[:component], current_user: Current.user).as_json
    }
  end
```

- [x] **Step 4: Run and confirm pass**

Run: `bundle exec rspec spec/requests/manual_comments_spec.rb`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add app/controllers/manual_controller.rb spec/requests/manual_comments_spec.rb
git commit -m "Expose section comments prop from ManualController#show"
```

---

## Chunk 3: Write path (controllers + routes)

### Task 10: Routes for comments, hearts, approvals

**Files:**
- Modify: `config/routes.rb`

- [x] **Step 1: Add routes**

Insert into `config/routes.rb` (after the manual routes, before `resources :newsletter_emails`):

```ruby
  resources :comments, only: [:create, :update, :destroy] do
    resource :heart, only: [:create], module: :comments
  end

  namespace :moderation do
    get "comments/approve/:token", to: "approvals#show", as: :comment_approval
  end
```

Rename the heart controller path: create `app/controllers/comments/hearts_controller.rb`
(namespaced) OR keep a flat `HeartsController`. This plan uses a flat controller;
adjust the route to:

```ruby
  resources :comments, only: [:create, :update, :destroy]
  post "comments/:comment_id/heart", to: "hearts#create", as: :comment_heart

  namespace :moderation do
    get "comments/approve/:token", to: "approvals#show", as: :comment_approval
  end
```

- [x] **Step 2: Verify routes load**

Run: `bin/rails routes | grep -E "comment|heart|approval"`
Expected: routes for `comments#create/update/destroy`, `hearts#create`, `moderation/approvals#show`.

- [x] **Step 3: Commit**

```bash
git add config/routes.rb
git commit -m "Add routes for comments, hearts, and comment approval"
```

---

### Task 11: CommentsController#create (with subscription + email enqueue)

**Files:**
- Create: `app/controllers/comments_controller.rb`
- Test: `spec/requests/comments_spec.rb`

- [x] **Step 1: Write the failing test**

Create `spec/requests/comments_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "Comments", type: :request do
  let(:section) { "el-origen-del-color/introduccion" }
  let(:section_url) { "/manual-del-color-vivo/#{section}" }
  let(:user) { create(:user) }

  describe "POST /comments" do
    it "requires authentication" do
      post "/comments", params: { comment: { section_path: section, body: "hi" } }
      expect(response).to have_http_status(:found)
      expect(response.location).to include("/users/sign_in")
    end

    it "creates a comment and redirects back to the section" do
      sign_in user
      expect {
        post "/comments", params: { comment: { section_path: section, body: "**hola**" } }
      }.to change(Comment, :count).by(1)
      expect(response).to redirect_to(section_url)
      expect(Comment.last.body_html).to include("<strong>hola</strong>")
    end

    it "creates a subscription when subscribe is set" do
      sign_in user
      expect {
        post "/comments", params: { comment: { section_path: section, body: "hi" }, subscribe: "1" }
      }.to change(CommentSubscription, :count).by(1)
    end

    it "rejects an unknown section" do
      sign_in user
      post "/comments", params: { comment: { section_path: "no/existe", body: "hi" } }
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "rejects replies to deleted or cross-section parents" do
      sign_in user
      deleted_parent = create(:comment, section_path: section)
      deleted_parent.soft_delete!
      post "/comments", params: { comment: { section_path: section, body: "hi", parent_id: deleted_parent.id } }
      expect(response).to have_http_status(:unprocessable_content)

      other_parent = create(:comment, section_path: "color-sobre-fibra/introduccion")
      post "/comments", params: { comment: { section_path: section, body: "hi", parent_id: other_parent.id } }
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "enqueues admin notification for the new comment" do
      sign_in user
      expect {
        post "/comments", params: { comment: { section_path: section, body: "hi" } }
      }.to have_enqueued_mail(CommentMailer, :admin_notification)
    end
  end
end
```

Note: `have_enqueued_mail` requires ActiveJob test adapter — Solid Queue uses
ActiveJob, and `deliver_later` enqueues a mail job. If the matcher does not see
the job, assert on `enqueued_jobs` or set `ActiveJob::Base.queue_adapter = :test`
in a `before`. Confirm the app's test job adapter in `config/environments/test.rb`.

- [x] **Step 2: Run and confirm failure**

Run: `bundle exec rspec spec/requests/comments_spec.rb -e "POST /comments"`
Expected: FAIL — no `CommentsController`. (The admin-notification example also
needs Task 15's mailer; leave it failing until then or `pending` it.)

- [x] **Step 3: Implement create**

Create `app/controllers/comments_controller.rb`:

```ruby
class CommentsController < ApplicationController
  before_action :authenticate_user!

  def create
    comment = Current.user.comments.build(create_params)
    comment.parent = Comment.find(params[:comment][:parent_id]) if params[:comment][:parent_id].present?

    if comment.save
      subscribe(comment) if params[:subscribe].present?
      notify(comment)
      redirect_to section_path_url(comment.section_path)
    else
      redirect_to section_path_url(create_params[:section_path]),
        inertia: { errors: comment.errors }, status: :unprocessable_content
    end
  end

  private

  def create_params
    params.require(:comment).permit(:section_path, :body)
  end

  def subscribe(comment)
    CommentSubscription.find_or_create_by(user: Current.user, comment: comment)
  end

  def notify(comment)
    CommentMailer.admin_notification(comment).deliver_later
    if comment.parent
      comment.parent.subscribers.where.not(id: Current.user.id).find_each do |subscriber|
        CommentMailer.reply_notification(comment, subscriber).deliver_later
      end
    end
  end

  def section_path_url(section)
    "/manual-del-color-vivo/#{section}"
  end
end
```

Note: the unprocessable branch must still render the section page for Inertia.
If returning a bare `422` breaks the Inertia flow, mirror the pattern in
`app/controllers/users/sessions_controller.rb` for failed-submit handling.
Verify against that controller before finalizing.

- [x] **Step 4: Run and confirm pass (create + subscribe + reject)**

Run: `bundle exec rspec spec/requests/comments_spec.rb -e "POST /comments" -e "creates" -e "subscription" -e "rejects"`
Expected: PASS (admin-notification example still pending until Task 15).

- [x] **Step 5: Commit**

```bash
git add app/controllers/comments_controller.rb spec/requests/comments_spec.rb
git commit -m "Add CommentsController#create with subscriptions and notifications"
```

---

### Task 12: CommentsController#update (author or admin)

**Files:**
- Modify: `app/controllers/comments_controller.rb`
- Test: `spec/requests/comments_spec.rb`

- [ ] **Step 1: Write the failing test**

Append to `spec/requests/comments_spec.rb`:

```ruby
  describe "PATCH /comments/:id" do
    let(:other) { create(:user) }
    let(:admin) { create(:user, :admin) }
    let!(:comment) { create(:comment, section_path: section, user: user, body: "orig") }

    it "lets the author edit and re-renders body_html" do
      sign_in user
      patch "/comments/#{comment.id}", params: { comment: { body: "**new**" } }
      expect(comment.reload.body).to eq("**new**")
      expect(comment.body_html).to include("<strong>new</strong>")
    end

    it "lets an admin edit any comment" do
      sign_in admin
      patch "/comments/#{comment.id}", params: { comment: { body: "mod" } }
      expect(comment.reload.body).to eq("mod")
    end

    it "forbids a non-author non-admin" do
      sign_in other
      patch "/comments/#{comment.id}", params: { comment: { body: "hack" } }
      expect(response).to have_http_status(:forbidden)
      expect(comment.reload.body).to eq("orig")
    end
  end
```

- [ ] **Step 2: Run and confirm failure**

Run: `bundle exec rspec spec/requests/comments_spec.rb -e "PATCH"`
Expected: FAIL — no `update` action.

- [ ] **Step 3: Implement**

Add to `app/controllers/comments_controller.rb`:

```ruby
  def update
    comment = Comment.find(params[:id])
    return head :forbidden unless can_modify?(comment)

    comment.update!(params.require(:comment).permit(:body))
    redirect_to section_path_url(comment.section_path)
  end
```

Add to the private section:

```ruby
  def can_modify?(comment)
    !comment.deleted? && (Current.user.admin? || comment.user_id == Current.user.id)
  end
```

- [ ] **Step 4: Run and confirm pass**

Run: `bundle exec rspec spec/requests/comments_spec.rb -e "PATCH"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/controllers/comments_controller.rb spec/requests/comments_spec.rb
git commit -m "Add CommentsController#update with author/admin authorization"
```

---

### Task 13: CommentsController#destroy (soft delete)

**Files:**
- Modify: `app/controllers/comments_controller.rb`
- Test: `spec/requests/comments_spec.rb`

- [ ] **Step 1: Write the failing test**

Append to `spec/requests/comments_spec.rb`:

```ruby
  describe "DELETE /comments/:id" do
    let(:other) { create(:user) }
    let!(:comment) { create(:comment, section_path: section, user: user, body: "bye") }

    it "soft-deletes for the author and keeps the record" do
      sign_in user
      delete "/comments/#{comment.id}"
      expect(comment.reload.deleted?).to be(true)
      expect(Comment.exists?(comment.id)).to be(true)
    end

    it "forbids a non-author non-admin" do
      sign_in other
      delete "/comments/#{comment.id}"
      expect(response).to have_http_status(:forbidden)
      expect(comment.reload.deleted?).to be(false)
    end
  end
```

- [ ] **Step 2: Run and confirm failure**

Run: `bundle exec rspec spec/requests/comments_spec.rb -e "DELETE"`
Expected: FAIL — no `destroy`.

- [ ] **Step 3: Implement**

Add to `app/controllers/comments_controller.rb`:

```ruby
  def destroy
    comment = Comment.find(params[:id])
    return head :forbidden unless can_modify?(comment)

    comment.soft_delete!
    redirect_to section_path_url(comment.section_path)
  end
```

- [ ] **Step 4: Run and confirm pass**

Run: `bundle exec rspec spec/requests/comments_spec.rb -e "DELETE"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/controllers/comments_controller.rb spec/requests/comments_spec.rb
git commit -m "Add CommentsController#destroy soft delete"
```

---

### Task 14: HeartsController#create (toggle)

**Files:**
- Create: `app/controllers/hearts_controller.rb`
- Test: `spec/requests/hearts_spec.rb`

- [ ] **Step 1: Write the failing test**

Create `spec/requests/hearts_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "Hearts", type: :request do
  let(:section) { "el-origen-del-color/introduccion" }
  let(:author) { create(:user) }
  let(:user) { create(:user) }
  let!(:comment) { create(:comment, section_path: section, user: author, body: "hi") }

  it "requires authentication" do
    post "/comments/#{comment.id}/heart"
    expect(response).to have_http_status(:found)
  end

  it "adds a heart on first click and removes it on second" do
    sign_in user
    expect { post "/comments/#{comment.id}/heart" }.to change { comment.reload.hearts_count }.from(0).to(1)
    expect { post "/comments/#{comment.id}/heart" }.to change { comment.reload.hearts_count }.from(1).to(0)
  end

  it "does not heart a deleted comment" do
    comment.soft_delete!
    sign_in user
    post "/comments/#{comment.id}/heart"
    expect(comment.reload.hearts_count).to eq(0)
  end
end
```

- [ ] **Step 2: Run and confirm failure**

Run: `bundle exec rspec spec/requests/hearts_spec.rb`
Expected: FAIL — no `HeartsController`.

- [ ] **Step 3: Implement**

Create `app/controllers/hearts_controller.rb`:

```ruby
class HeartsController < ApplicationController
  before_action :authenticate_user!

  def create
    comment = Comment.find(params[:comment_id])
    toggle(comment) unless comment.deleted?
    redirect_to "/manual-del-color-vivo/#{comment.section_path}"
  end

  private

  def toggle(comment)
    heart = Heart.find_by(user: Current.user, comment: comment)
    heart ? heart.destroy : Heart.create!(user: Current.user, comment: comment)
  end
end
```

- [ ] **Step 4: Run and confirm pass**

Run: `bundle exec rspec spec/requests/hearts_spec.rb`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/controllers/hearts_controller.rb spec/requests/hearts_spec.rb
git commit -m "Add HeartsController toggle"
```

---

## Chunk 4: Emails + approval

### Task 15: CommentMailer

**Files:**
- Create: `app/mailers/comment_mailer.rb`
- Create: `app/views/comment_mailer/reply_notification.html.erb`
- Create: `app/views/comment_mailer/admin_notification.html.erb`
- Test: `spec/mailers/comment_mailer_spec.rb`

- [ ] **Step 1: Confirm mailer defaults**

Check `config/environments/production.rb` / `development.rb` for
`default_url_options` on the mailer host. If absent, add a dev host so URL
helpers in the mailer render (e.g. `config.action_mailer.default_url_options = { host: "localhost", port: ENV.fetch("RAILS_PORT", 3000) }`). Note this in the commit.

- [ ] **Step 2: Write the failing test**

Create `spec/mailers/comment_mailer_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe CommentMailer, type: :mailer do
  let(:section) { "el-origen-del-color/introduccion" }
  let(:author) { create(:user) }
  let!(:admin) { create(:user, :admin, email: "admin@example.com") }
  let(:subscriber) { create(:user, email: "sub@example.com") }

  it "admin_notification goes to all admins with a working signed approve link" do
    comment = create(:comment, section_path: section, user: author)
    mail = CommentMailer.admin_notification(comment)
    expect(mail.to).to include("admin@example.com")

    # signed_id embeds a timestamp, so assert the link resolves rather than
    # comparing against a freshly minted (different) token string.
    token = mail.body.encoded[%r{/moderation/comments/approve/([^"'\s]+)}, 1]
    expect(Comment.find_signed(token, purpose: :approve)).to eq(comment)
  end

  it "reply_notification targets the subscriber" do
    parent = create(:comment, section_path: section, user: subscriber, body: "raiz")
    reply  = create(:comment, section_path: section, user: author, body: "resp", parent: parent)
    mail = CommentMailer.reply_notification(reply, subscriber)
    expect(mail.to).to eq(["sub@example.com"])
    expect(mail.body.encoded).to include("resp")
  end
end
```

- [ ] **Step 3: Run and confirm failure**

Run: `bundle exec rspec spec/mailers/comment_mailer_spec.rb`
Expected: FAIL — no `CommentMailer`.

- [ ] **Step 4: Implement mailer**

Create `app/mailers/comment_mailer.rb`:

```ruby
class CommentMailer < ApplicationMailer
  def admin_notification(comment)
    @comment = comment
    @approve_url = moderation_comment_approval_url(
      token: comment.signed_id(purpose: :approve, expires_in: 7.days)
    )
    admins = User.where(role: :admin).pluck(:email)
    mail(to: admins, subject: "Nuevo comentario en el manual")
  end

  def reply_notification(comment, subscriber)
    @comment = comment
    @section_url = manual_section_url(comment.section_path)
    mail(to: subscriber.email, subject: "Nueva respuesta a tu comentario")
  end

  private

  def manual_section_url(section)
    "#{root_url.chomp('/')}/manual-del-color-vivo/#{section}"
  end
end
```

Add `moderation_comment_approval_url` — it comes from the Task 10 route. If the
route helper name differs, run `bin/rails routes | grep approval` and use the
actual `*_url` helper.

- [ ] **Step 5: Create email views**

Create `app/views/comment_mailer/admin_notification.html.erb`:

```erb
<p>Se publicó un nuevo comentario en la sección <%= @comment.section_path %>.</p>
<div><%= raw @comment.body_html %></div>
<p><a href="<%= @approve_url %>">Aprobar este comentario</a></p>
```

Create `app/views/comment_mailer/reply_notification.html.erb`:

```erb
<p>Alguien respondió a tu comentario.</p>
<div><%= raw @comment.body_html %></div>
<p><a href="<%= @section_url %>">Ver la conversación</a></p>
```

`body_html` is already sanitized by `CommentMarkdown`, so `raw` is safe here.

- [ ] **Step 6: Run and confirm pass**

Run: `bundle exec rspec spec/mailers/comment_mailer_spec.rb`
Expected: PASS.

- [ ] **Step 7: Un-pend and pass the create enqueue test**

Run: `bundle exec rspec spec/requests/comments_spec.rb -e "enqueues admin notification"`
Expected: PASS (remove any `pending` added in Task 11).

- [ ] **Step 8: Commit**

```bash
git add app/mailers/comment_mailer.rb app/views/comment_mailer config/environments spec/mailers/comment_mailer_spec.rb spec/requests/comments_spec.rb
git commit -m "Add CommentMailer reply and admin notifications"
```

---

### Task 16: Moderation::ApprovalsController (signed link)

**Files:**
- Create: `app/controllers/moderation/approvals_controller.rb`
- Test: `spec/requests/moderation_approvals_spec.rb`

- [ ] **Step 1: Write the failing test**

Create `spec/requests/moderation_approvals_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "Moderation approvals", type: :request do
  let(:comment) { create(:comment) }

  def token(c, expires_in: 7.days) = c.signed_id(purpose: :approve, expires_in: expires_in)

  it "approves via a valid signed token without login" do
    get "/moderation/comments/approve/#{token(comment)}"
    expect(response).to have_http_status(:ok)
    expect(comment.reload.approved).to be(true)
  end

  it "rejects a tampered token" do
    get "/moderation/comments/approve/not-a-real-token"
    expect(response).to have_http_status(:not_found)
    expect(response.body).to include("Enlace de aprobación inválido")
  end

  it "rejects an expired token" do
    t = token(comment, expires_in: -1.second)
    get "/moderation/comments/approve/#{t}"
    expect(response).to have_http_status(:not_found)
    expect(comment.reload.approved).to be(false)
  end
end
```

- [ ] **Step 2: Run and confirm failure**

Run: `bundle exec rspec spec/requests/moderation_approvals_spec.rb`
Expected: FAIL — no controller.

- [ ] **Step 3: Implement**

Create `app/controllers/moderation/approvals_controller.rb`:

```ruby
module Moderation
  class ApprovalsController < ApplicationController
    # Signed-token approval: intentionally no authentication. The token is a
    # scoped, expiring bearer credential minted only for admin emails.
    def show
      comment = Comment.find_signed(params[:token], purpose: :approve)
      return render inertia: "moderation/ApprovalError", status: :not_found unless comment

      comment.update!(approved: true)
      render inertia: "moderation/ApprovalConfirmation", props: { section: comment.section_path }
    end
  end
end
```

Create the confirmation page `app/frontend/pages/moderation/ApprovalConfirmation.jsx`:

```jsx
export default function ApprovalConfirmation({ section }) {
  return (
    <main className="mx-auto max-w-lg p-8 text-center">
      <h1 className="text-2xl font-bold">Comentario aprobado</h1>
      <p className="mt-4">
        El comentario en <code>{section}</code> quedó aprobado.
      </p>
    </main>
  );
}
```

Create `app/frontend/pages/moderation/ApprovalError.jsx`:

```jsx
export default function ApprovalError() {
  return (
    <main className="mx-auto max-w-lg p-8 text-center">
      <h1 className="text-2xl font-bold">Enlace de aprobación inválido</h1>
      <p className="mt-4">El enlace expiró o no es válido.</p>
    </main>
  );
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `bundle exec rspec spec/requests/moderation_approvals_spec.rb`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/controllers/moderation app/frontend/pages/moderation spec/requests/moderation_approvals_spec.rb
git commit -m "Add signed-token comment approval endpoint"
```

---

## Chunk 5: RailsAdmin moderation

### Task 17: Register Comment in RailsAdmin

**Files:**
- Modify: `config/initializers/rails_admin.rb`
- Test: `spec/requests/rails_admin_access_spec.rb` (extend)

- [ ] **Step 1: Write the failing test**

Append to `spec/requests/rails_admin_access_spec.rb` an admin-only check that the
Comment admin list loads:

```ruby
  it "lists comments for an admin" do
    admin = create(:user, :admin)
    create(:comment, user: admin)
    sign_in admin
    get "/antesis-admin/comment"
    expect(response).to have_http_status(:ok)
  end
```

- [ ] **Step 2: Run and confirm failure**

Run: `bundle exec rspec spec/requests/rails_admin_access_spec.rb -e "lists comments"`
Expected: FAIL (model not registered / label config missing) or PASS trivially —
if it passes without config, still add config in Step 3 for the moderation UX.

- [ ] **Step 3: Register the model**

Add to `config/initializers/rails_admin.rb` inside the `RailsAdmin.config` block:

```ruby
  config.model "Comment" do
    list do
      field :id
      field :section_path
      field :user
      field :body
      field :hearts_count
      field :sticky
      field :approved
      field :deleted_at
      field :created_at
    end
    edit do
      field :body
      field :sticky
      field :approved
      field :deleted_at
    end
  end
```

- [ ] **Step 4: Run and confirm pass**

Run: `bundle exec rspec spec/requests/rails_admin_access_spec.rb`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add config/initializers/rails_admin.rb spec/requests/rails_admin_access_spec.rb
git commit -m "Register Comment in RailsAdmin for moderation"
```

---

## Chunk 6: Frontend thread

### Task 18: Comment thread components + mount in ManualLayout

**Files:**
- Create: `app/frontend/components/comments/CommentThread.jsx`
- Create: `app/frontend/components/comments/CommentNode.jsx`
- Create: `app/frontend/components/comments/CommentForm.jsx`
- Modify: `app/frontend/components/ManualLayout.jsx`

Follow the app's Inertia + React conventions from
`app/frontend/pages/Landing.jsx` (form via `useForm`, `router` from
`@inertiajs/react`). Reuse the Tailwind v4 `@theme` palette in
`app/frontend/entrypoints/application.css`.

- [ ] **Step 1: CommentForm**

Create `app/frontend/components/comments/CommentForm.jsx` — a compose box that
posts to `/comments` with `section`, `body`, optional `parent_id`, and a
`subscribe` checkbox. Uses `useForm`. On success resets and Inertia reloads the
`comments` prop:

```jsx
import { useForm } from "@inertiajs/react";

export default function CommentForm({ section, parentId = null, onDone }) {
  const form = useForm({ comment: { section_path: section, body: "", parent_id: parentId }, subscribe: false });

  function submit(e) {
    e.preventDefault();
    form.post("/comments", {
      preserveScroll: true,
      only: ["comments"],
      onSuccess: () => { form.reset(); onDone?.(); },
    });
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-2">
      <textarea
        className="w-full rounded border p-2"
        value={form.data.comment.body}
        onChange={(e) => form.setData("comment", { ...form.data.comment, body: e.target.value })}
        placeholder="Escribe un comentario (Markdown permitido)"
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.data.subscribe}
          onChange={(e) => form.setData("subscribe", e.target.checked)} />
        Avísame de respuestas
      </label>
      <button type="submit" disabled={form.processing}
        className="rounded bg-[--color-primary] px-4 py-2 text-white">Publicar</button>
    </form>
  );
}
```

- [ ] **Step 2: CommentNode**

Create `app/frontend/components/comments/CommentNode.jsx` — renders one comment
and its replies recursively: author, relative time, `dangerouslySetInnerHTML`
from `body_html` (already sanitized server-side), a 💙 button posting to
`/comments/:id/heart` with `hearts_count`, and reply/edit/delete controls gated
by `can_edit`/`can_delete`. Sticky and approve controls remain in RailsAdmin;
do not add a custom Inertia moderation UI. Deleted nodes render the tombstone
body and hide actions. Recurse over `replies` with visual indentation.

- [ ] **Step 3: CommentThread**

Create `app/frontend/components/comments/CommentThread.jsx` — takes `comments`
and `section` props, renders a top-level `CommentForm` and maps roots to
`CommentNode`.

- [ ] **Step 4: Mount in ManualLayout**

Modify `app/frontend/components/ManualLayout.jsx` to render `<CommentThread
comments={comments} section={section} />` at the bottom of the content when
those props are present (index page has none). Read `comments`/`section` from
the page props passed to the layout.

- [ ] **Step 5: Build to verify no errors**

Run: `bin/vite build --clear`
Expected: client build succeeds.

Run: `RAILS_ENV=production NODE_ENV=production bin/vite build --ssr`
Expected: SSR build succeeds.

- [ ] **Step 6: Commit**

```bash
git add app/frontend/components/comments app/frontend/components/ManualLayout.jsx
git commit -m "Add comment thread UI to manual sections"
```

---

## Chunk 7: Full-suite verification

### Task 19: Whole-suite green + manual browser check

- [ ] **Step 1: Run the full spec suite**

Run: `bundle exec rspec`
Expected: all green, including the existing manual-content completeness gate.

- [ ] **Step 2: Production builds**

Run:
```bash
RAILS_ENV=production NODE_ENV=production bin/vite build --clear
RAILS_ENV=production NODE_ENV=production bin/vite build --ssr
```
Expected: both succeed.

- [ ] **Step 3: Manual browser verification (use superpowers:verification-before-completion)**

Start `./serve-dev`, sign in, open a manual section, and confirm: posting a
comment, replying (nested), hearting/un-hearting, editing own comment, admin
deleting another user's comment (tombstone), and that the admin approve link
approves. Note results explicitly before claiming done.

- [ ] **Step 4: Update HANDOFF.md**

Mark Phase 2d complete, add the spec/plan rows to the Phase Docs table, and add
the new files to "Files to Know."

```bash
git add HANDOFF.md
git commit -m "Mark Phase 2d comment system complete in handoff"
```

---

## Notes for the executor

- **Commonmarker output exactness:** a couple of tests assert exact HTML
  (`<p>hola</p>`). If Commonmarker 1.x wraps or escapes differently, relax those
  to substring matches — do not weaken the XSS assertions.
- **Inertia error path on invalid create:** verify the 422/`inertia: { errors: }`
  branch against `app/controllers/users/sessions_controller.rb`, which already
  solves failed-submit UX in this app.
- **Job adapter in tests:** confirm `have_enqueued_mail` works with the test
  environment's ActiveJob adapter; set `:test` adapter in the mailer spec if needed.
- **`Current.user` vs `current_user`:** this app uses `Current.user` in shared
  Inertia props (`app/controllers/inertia_controller.rb`). Controllers here use
  `Current.user`; confirm it is populated by the app's Devise/Current wiring, and
  fall back to Devise `current_user` if not.
- **FactoryBot is mandatory and exclusive in specs:** build every ActiveRecord
  object with `build`/`create(:factory)`. Never `Model.create!`/`Model.new` in a
  spec. Keep factories minimal — only fields required to pass validations. Do not
  retrofit existing passing specs to factories in this phase unless a task says so.
- Do not add Action Cable. Do not create `tailwind.config.js`. Do not rename
  manual slugs.
```
