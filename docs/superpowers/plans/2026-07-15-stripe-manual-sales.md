# Stripe Manual Sales Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sell the "Manual del Color Vivo" ebook as a one-time $30 USD Stripe Checkout purchase: buyers get a stamped PDF by email plus gated web access, with a sales home page that activates on 2026-08-15.

**Architecture:** A `Purchase` record keyed on the Stripe Checkout Session id makes fulfillment idempotent across the webhook/redirect race and webhook retries. Both post-purchase paths (webhook, `/gracias-por-tu-compra`) funnel through `Purchase.record!`, and a Solid Queue job stamps the PDF and emails it exactly once. A hardcoded `SalesLaunch.live?` date switch flips the home page and enables checkout.

**Tech Stack:** Rails 8.0.5, `stripe` gem, Devise (+`:recoverable`), Inertia Rails + React 19, Solid Queue, Mailgun, RSpec.

**Spec:** `docs/superpowers/specs/2026-07-15-stripe-manual-sales-design.md`

**Codebase facts the implementer needs:**
- `ManualPdfStamper.new(email:).call` returns raw PDF bytes; raises `ManualPdfStamper::Error` (`app/services/manual_pdf_stamper.rb`). It shells out to `tsx` — it actually works in the test env (see `spec/requests/generated_pdfs_spec.rb`, which asserts real `%PDF` output).
- Manual gating (`before_action :authenticate_user!` on `ManualController`) is ALREADY implemented and tested (`spec/requests/manual_spec.rb`). Do not re-add it.
- `GeneratedPdfsController` at `GET /generate-pdf` already serves the stamped PDF to the signed-in user. The gracias page reuses it — zero new download code.
- Request specs get Devise's `sign_in` helper via `spec/support/devise.rb`.
- Factories: `create(:user)` (`spec/factories/users.rb`).
- Inertia responses embed page JSON in `script[data-page]`; existing specs parse it with Nokogiri (see `spec/requests/manual_spec.rb`).
- `ApplicationController#set_current_user` sets `Current.user` before actions; `InertiaController` shares the `user` prop.
- Layout already has `csrf_meta_tags`, so a plain HTML `<form method="post">` with a hidden `authenticity_token` (read from the meta tag) works from React.
- `dotenv-rails` loads `.env` in development/test.
- The test env uses the `:solid_queue` ActiveJob adapter (`config/environments/test.rb:24`), so `have_enqueued_job` does NOT work bare. Existing precedent (`spec/requests/newsletter_mailerlite_enqueue_spec.rb`) wraps examples in an `around` hook that swaps `ActiveJob::Base.queue_adapter = :test` — copy that hook wherever a spec asserts enqueues.
- Devise sends mail with `deliver_now`, so password-reset specs can assert `ActionMailer::Base.deliveries` directly (delivery method is `:test`).
- `spec/support/vcr.rb` enables WebMock globally, but nothing in this plan makes real HTTP (all Stripe calls stubbed; `Stripe::...construct_from` is offline) — no cassettes needed.
- All user-facing strings in Spanish; code/comments/docs in English.

**Conventions:** TDD every task. Run single spec files, not the whole suite, until the final task. Commit after each task (small commits are fine mid-task too).

---

## Chunk 1: Stripe setup + launch switch

### Task 1: Stripe gem, env vars, initializer

**Files:**
- Modify: `Gemfile`
- Create: `config/initializers/stripe.rb`
- Modify: `.env.example`, `.env`

- [ ] **Step 1: Add gem**

In `Gemfile`, after the `gem "devise", "~> 5.0"` line:

```ruby
gem "stripe"
```

Run: `bundle install`
Expected: `Bundle complete`, `stripe` in lockfile.

- [ ] **Step 2: Initializer**

Create `config/initializers/stripe.rb`:

```ruby
Stripe.api_key = ENV["STRIPE_SECRET_KEY"]
```

- [ ] **Step 3: Env vars**

Append to `.env.example`:

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
```

Add all three vars to `.env` as well (verified: `.env` currently has NO Stripe entries). `STRIPE_SECRET_KEY` comes from the user's sandbox account (ask the user or fetch the sandbox key from the Stripe dashboard); `STRIPE_WEBHOOK_SECRET` comes from the webhook setup in Task 2 / `stripe listen`; `STRIPE_PRICE_ID` is filled in Task 2. Do NOT commit `.env`.

- [ ] **Step 4: Boot check**

Run: `bin/rails runner "puts Stripe::VERSION"`
Expected: version string, no boot errors.

- [ ] **Step 5: Commit**

```bash
git add Gemfile Gemfile.lock config/initializers/stripe.rb .env.example
git commit -m "Add stripe gem and configuration"
```

### Task 2: Create Stripe product via MCP + webhook instructions doc

**Files:**
- Create: `docs/webhook-instructions.md`
- Modify: `.env` (price id — not committed)

- [ ] **Step 1: Create product and price via Stripe MCP**

Using the Stripe MCP tools (`mcp__stripe__stripe_api_write` or equivalent; account is a sandbox), create:
- Product: name `Manual del Color Vivo`, description (Spanish, e.g. `Ebook: más de una década de fórmulas para teñir, extraer y pintar con pigmentos naturales de plantas, minerales e insectos.`).
- Price on that product: one-time, `unit_amount: 3000`, `currency: "usd"`.

Record the resulting `price_...` id. If the Stripe MCP is unavailable, create the product/price in the Stripe dashboard (test mode) and record the price id manually.

Verify: retrieve the created price via `mcp__stripe__stripe_api_read` (or dashboard) and confirm `unit_amount: 3000`, `currency: "usd"`, one-time (no `recurring`).

- [ ] **Step 2: Save price id**

Set `STRIPE_PRICE_ID=price_...` in `.env`.

- [ ] **Step 3: Verify the MCP cannot create webhook endpoints**

Check the available Stripe MCP tools; if webhook endpoint creation is possible, create the endpoint (URL: `https://<production-host>/webhooks/stripe`, single event `checkout.session.completed`) and note it in the doc below as already done. Otherwise write manual instructions.

- [ ] **Step 4: Write `docs/webhook-instructions.md`**

```markdown
# Stripe Webhook Configuration

Manual step (Stripe MCP cannot create webhook endpoints — verify note above).

1. Go to https://dashboard.stripe.com/webhooks (sandbox: toggle test mode).
2. Click "Add endpoint".
3. Endpoint URL: `https://<your-host>/webhooks/stripe`
4. Events: select ONLY `checkout.session.completed`.
5. After creating, reveal the "Signing secret" (`whsec_...`) and set it as
   `STRIPE_WEBHOOK_SECRET` in `.env` on the server.
6. Local testing: `stripe listen --forward-to localhost:3000/webhooks/stripe`
   prints a temporary `whsec_...` — use that in your local `.env`.
```

Adjust step 5/6 wording to match reality after Step 3.

- [ ] **Step 5: Commit**

```bash
git add docs/webhook-instructions.md
git commit -m "Add Stripe webhook configuration instructions"
```

### Task 3: SalesLaunch date switch

**Files:**
- Create: `app/models/sales_launch.rb`
- Create: `spec/models/sales_launch_spec.rb`
- Create: `spec/support/time_helpers.rb`

- [ ] **Step 1: Time helpers support file**

Create `spec/support/time_helpers.rb`:

```ruby
RSpec.configure do |config|
  config.include ActiveSupport::Testing::TimeHelpers
end
```

- [ ] **Step 2: Failing spec**

Create `spec/models/sales_launch_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe SalesLaunch do
  it "is not live before August 15, 2026" do
    travel_to Date.new(2026, 8, 14) do
      expect(SalesLaunch.live?).to be(false)
    end
  end

  it "is live on August 15, 2026" do
    travel_to Date.new(2026, 8, 15) do
      expect(SalesLaunch.live?).to be(true)
    end
  end

  it "is live after August 15, 2026" do
    travel_to Date.new(2027, 1, 1) do
      expect(SalesLaunch.live?).to be(true)
    end
  end
end
```

- [ ] **Step 3: Run, expect fail**

Run: `bundle exec rspec spec/models/sales_launch_spec.rb`
Expected: FAIL — `uninitialized constant SalesLaunch`.

- [ ] **Step 4: Implement**

Create `app/models/sales_launch.rb`:

```ruby
# Hardcoded launch switch: the sales home page and checkout activate on this
# date (spec: docs/superpowers/specs/2026-07-15-stripe-manual-sales-design.md).
module SalesLaunch
  LAUNCH_DATE = Date.new(2026, 8, 15)

  def self.live?
    Date.current >= LAUNCH_DATE
  end
end
```

- [ ] **Step 5: Run, expect pass**

Run: `bundle exec rspec spec/models/sales_launch_spec.rb`
Expected: 3 examples, 0 failures.

- [ ] **Step 6: Commit**

```bash
git add app/models/sales_launch.rb spec/models/sales_launch_spec.rb spec/support/time_helpers.rb
git commit -m "Add SalesLaunch hardcoded launch-date switch"
```

## Chunk 2: Purchase data, buyer auth, fulfillment

### Task 4: Purchase model + `Purchase.record!`

**Files:**
- Create: `db/migrate/<timestamp>_create_purchases.rb` (via generator)
- Create: `app/models/purchase.rb`
- Modify: `app/models/user.rb` (association)
- Create: `spec/models/purchase_spec.rb`
- Create: `spec/factories/purchases.rb`

- [ ] **Step 1: Migration**

Run: `bin/rails generate migration CreatePurchases`

Edit the generated file:

```ruby
class CreatePurchases < ActiveRecord::Migration[8.0]
  def change
    create_table :purchases do |t|
      t.string :stripe_session_id, null: false
      t.string :email, null: false
      t.references :user, foreign_key: true
      t.datetime :fulfilled_at

      t.timestamps
    end
    add_index :purchases, :stripe_session_id, unique: true
  end
end
```

Run: `bin/rails db:migrate`
Expected: migration runs, `db/schema.rb` updated.

- [ ] **Step 2: Failing spec**

Create `spec/models/purchase_spec.rb`. Note: Checkout Session doubles are built with `Stripe::Checkout::Session.construct_from`, the stripe-gem way to fake API objects.

```ruby
require "rails_helper"

RSpec.describe Purchase do
  def checkout_session(id: "cs_test_123", email: "buyer@example.com")
    Stripe::Checkout::Session.construct_from(
      id: id,
      payment_status: "paid",
      customer_details: { email: email }
    )
  end

  describe ".record!" do
    it "creates a purchase and a user from the session email" do
      purchase = described_class.record!(checkout_session)

      expect(purchase).to be_persisted
      expect(purchase.stripe_session_id).to eq("cs_test_123")
      expect(purchase.email).to eq("buyer@example.com")
      expect(purchase.user).to be_persisted
      expect(purchase.user.email).to eq("buyer@example.com")
    end

    it "is idempotent for the same session id" do
      first = described_class.record!(checkout_session)
      second = described_class.record!(checkout_session)

      expect(second.id).to eq(first.id)
      expect(Purchase.count).to eq(1)
      expect(User.where(email: "buyer@example.com").count).to eq(1)
    end

    it "reuses an existing user with the same email" do
      existing = create(:user, email: "buyer@example.com")

      purchase = described_class.record!(checkout_session)

      expect(purchase.user).to eq(existing)
      expect(User.count).to eq(1)
    end

    it "backfills user_id if a previous call crashed before linking" do
      Purchase.create!(stripe_session_id: "cs_test_123", email: "buyer@example.com")

      purchase = described_class.record!(checkout_session)

      expect(purchase.user).to be_present
    end

    it "created users are commenters with an unguessable password" do
      purchase = described_class.record!(checkout_session)

      expect(purchase.user.role).to eq("commenter")
      expect(purchase.user.encrypted_password).to be_present
    end
  end
end
```

- [ ] **Step 3: Run, expect fail**

Run: `bundle exec rspec spec/models/purchase_spec.rb`
Expected: FAIL — `uninitialized constant Purchase`.

- [ ] **Step 4: Implement**

Create `app/models/purchase.rb`:

```ruby
# One row per Stripe Checkout Session. The unique index on stripe_session_id
# makes .record! idempotent across the webhook/redirect race and webhook
# retries; fulfilled_at guards the one-shot fulfillment email.
class Purchase < ApplicationRecord
  belongs_to :user, optional: true

  # Shared entry point for the webhook and the gracias page. Deliberately NOT
  # wrapped in one transaction: on Postgres a unique-violation inside an open
  # transaction poisons it, breaking create_or_find_by's rescue path. Each
  # statement is individually atomic and a crash between them is repaired by
  # the next call (user_id backfill below).
  def self.record!(session)
    # Downcase to match Devise's case_insensitive_keys normalization, so the
    # rescue path's find_by! below can't miss an existing user row.
    email = session.customer_details.email.downcase

    purchase = create_or_find_by!(stripe_session_id: session.id) do |p|
      p.email = email
    end

    if purchase.user_id.nil?
      # NOT create_or_find_by!: Devise :validatable adds an email-uniqueness
      # validation, so create! raises RecordInvalid (not RecordNotUnique) when
      # the user exists, and create_or_find_by!'s rescue never fires.
      user = begin
        User.find_or_create_by!(email: purchase.email) do |u|
          u.password = Devise.friendly_token
        end
      rescue ActiveRecord::RecordNotUnique, ActiveRecord::RecordInvalid
        # Lost the creation race; the row exists now.
        User.find_by!(email: purchase.email)
      end
      purchase.update!(user: user)
    end

    purchase
  end
end
```

Add to `app/models/user.rb` (with the other `has_many` lines):

```ruby
  has_many :purchases, dependent: :nullify
```

- [ ] **Step 5: Run, expect pass**

Run: `bundle exec rspec spec/models/purchase_spec.rb`
Expected: 5 examples, 0 failures.

- [ ] **Step 6: Factory**

Create `spec/factories/purchases.rb`:

```ruby
FactoryBot.define do
  factory :purchase do
    sequence(:stripe_session_id) { |n| "cs_test_#{n}" }
    sequence(:email) { |n| "buyer#{n}@example.com" }
    user
  end
end
```

- [ ] **Step 7: Commit**

```bash
git add db/migrate db/schema.rb app/models/purchase.rb app/models/user.rb spec/models/purchase_spec.rb spec/factories/purchases.rb
git commit -m "Add Purchase model with idempotent record! for Stripe sessions"
```

### Task 5: Devise :recoverable for buyers

**Files:**
- Create: `db/migrate/<timestamp>_add_recoverable_to_users.rb`
- Modify: `app/models/user.rb`
- Create: `app/controllers/users/passwords_controller.rb`
- Modify: `config/routes.rb`
- Create: `app/frontend/pages/ForgotPassword.jsx`, `app/frontend/pages/ResetPassword.jsx`
- Modify: `app/frontend/pages/Login.jsx` (forgot-password link)
- Create: `spec/requests/passwords_spec.rb`

- [ ] **Step 1: Migration**

Run: `bin/rails generate migration AddRecoverableToUsers`

```ruby
class AddRecoverableToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :reset_password_token, :string
    add_column :users, :reset_password_sent_at, :datetime
    add_index :users, :reset_password_token, unique: true
  end
end
```

Run: `bin/rails db:migrate`

- [ ] **Step 2: Failing spec**

Create `spec/requests/passwords_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "Passwords", type: :request do
  let(:user) { create(:user) }

  it "renders the forgot-password Inertia page" do
    get "/users/password/new"

    expect(response).to have_http_status(:ok)
    page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
    expect(page.fetch("component")).to eq("ForgotPassword")
  end

  it "sends reset instructions and redirects to login" do
    # Devise mails with deliver_now, so deliveries changes synchronously.
    expect {
      post "/users/password", params: { user: { email: user.email } }
    }.to change { ActionMailer::Base.deliveries.count }.by(1)

    expect(response).to redirect_to("/users/sign_in")
  end

  it "renders the reset form for a valid token" do
    token = user.send_reset_password_instructions

    get "/users/password/edit", params: { reset_password_token: token }

    expect(response).to have_http_status(:ok)
    page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
    expect(page.fetch("component")).to eq("ResetPassword")
    expect(page.dig("props", "resetPasswordToken")).to eq(token)
  end

  it "updates the password with a valid token" do
    token = user.send_reset_password_instructions

    put "/users/password", params: {
      user: {
        reset_password_token: token,
        password: "newpassword123",
        password_confirmation: "newpassword123"
      }
    }

    expect(user.reload.valid_password?("newpassword123")).to be(true)
  end
end
```


- [ ] **Step 3: Run, expect fail**

Run: `bundle exec rspec spec/requests/passwords_spec.rb`
Expected: FAIL — no `/users/password` routes (recoverable not enabled).

- [ ] **Step 4: Enable recoverable + Inertia passwords controller**

`app/models/user.rb` devise line:

```ruby
  devise :database_authenticatable, :recoverable, :validatable, :rememberable, :trackable
```

Create `app/controllers/users/passwords_controller.rb` (mirror the Inertia pattern of `Users::SessionsController`):

```ruby
# frozen_string_literal: true

# Renders the React forgot/reset password pages instead of Devise's ERB views.
class Users::PasswordsController < Devise::PasswordsController
  def new
    render inertia: "ForgotPassword", props: {
      alert: flash[:alert],
      notice: flash[:notice]
    }
  end

  def edit
    render inertia: "ResetPassword", props: {
      resetPasswordToken: params[:reset_password_token],
      alert: flash[:alert]
    }
  end
end
```

`config/routes.rb` devise_for:

```ruby
  devise_for :users,
    skip: [ :registrations ],
    controllers: {
      sessions: "users/sessions",
      passwords: "users/passwords"
    }
```

- [ ] **Step 5: React pages**

Look at `app/frontend/pages/Login.jsx` first and copy its structure/styles exactly (form layout, classes, `useForm` usage).

Create `app/frontend/pages/ForgotPassword.jsx`:

```jsx
import { useForm } from '@inertiajs/react'

export default function ForgotPassword({ alert, notice }) {
  const form = useForm({ email: '' })

  const submit = (e) => {
    e.preventDefault()
    form.transform((data) => ({ user: data }))
    form.post('/users/password')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream font-body text-blue-ink">
      <form onSubmit={submit} className="w-full max-w-sm px-6">
        <h1 className="font-display text-2xl font-bold text-blue">Recupera tu acceso</h1>
        <p className="mt-2 text-sm text-blue-ink/80">
          Te enviaremos un correo con instrucciones para crear tu contraseña.
        </p>
        {alert && <p role="alert" className="mt-3 text-sm text-orange-ink">{alert}</p>}
        {notice && <p role="status" className="mt-3 text-sm">{notice}</p>}
        <label className="mt-5 block text-sm font-semibold" htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          required
          value={form.data.email}
          onChange={(e) => form.setData('email', e.target.value)}
          className="mt-1 w-full border border-blue/20 bg-white px-3 py-2"
        />
        <button
          type="submit"
          disabled={form.processing}
          className="font-display mt-5 w-full bg-orange px-4 py-3 font-semibold text-white"
        >
          Enviar instrucciones
        </button>
      </form>
    </main>
  )
}
```

Create `app/frontend/pages/ResetPassword.jsx`:

```jsx
import { useForm } from '@inertiajs/react'

export default function ResetPassword({ resetPasswordToken, alert }) {
  const form = useForm({
    reset_password_token: resetPasswordToken,
    password: '',
    password_confirmation: '',
  })

  const submit = (e) => {
    e.preventDefault()
    form.transform((data) => ({ user: data }))
    form.put('/users/password')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream font-body text-blue-ink">
      <form onSubmit={submit} className="w-full max-w-sm px-6">
        <h1 className="font-display text-2xl font-bold text-blue">Crea tu contraseña</h1>
        {alert && <p role="alert" className="mt-3 text-sm text-orange-ink">{alert}</p>}
        <label className="mt-5 block text-sm font-semibold" htmlFor="password">Nueva contraseña</label>
        <input
          id="password"
          type="password"
          required
          value={form.data.password}
          onChange={(e) => form.setData('password', e.target.value)}
          className="mt-1 w-full border border-blue/20 bg-white px-3 py-2"
        />
        <label className="mt-4 block text-sm font-semibold" htmlFor="password_confirmation">Confirma tu contraseña</label>
        <input
          id="password_confirmation"
          type="password"
          required
          value={form.data.password_confirmation}
          onChange={(e) => form.setData('password_confirmation', e.target.value)}
          className="mt-1 w-full border border-blue/20 bg-white px-3 py-2"
        />
        <button
          type="submit"
          disabled={form.processing}
          className="font-display mt-5 w-full bg-orange px-4 py-3 font-semibold text-white"
        >
          Guardar contraseña
        </button>
      </form>
    </main>
  )
}
```

Adjust both to match Login.jsx's real classes/markup if they differ.

Add to `Login.jsx`, near the submit button:

```jsx
<a href="/users/password/new" className="mt-3 block text-sm text-blue underline">
  ¿Olvidaste tu contraseña?
</a>
```

- [ ] **Step 6: Run, expect pass**

Run: `bundle exec rspec spec/requests/passwords_spec.rb`
Expected: 4 examples, 0 failures.

Run: `bin/vite build`
Expected: builds without errors.

- [ ] **Step 7: Commit**

```bash
git add db/migrate db/schema.rb app/models/user.rb app/controllers/users/passwords_controller.rb config/routes.rb app/frontend/pages/ForgotPassword.jsx app/frontend/pages/ResetPassword.jsx app/frontend/pages/Login.jsx spec/requests/passwords_spec.rb spec/support
git commit -m "Add Devise recoverable with Inertia password pages"
```

### Task 6: Token auto-login (`GET /acceso/:token`)

**Files:**
- Create: `app/controllers/accesos_controller.rb`
- Modify: `config/routes.rb`
- Create: `spec/requests/accesos_spec.rb`

- [ ] **Step 1: Failing spec**

Create `spec/requests/accesos_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "Accesos", type: :request do
  let(:user) { create(:user) }

  it "signs the user in with a valid token and redirects to the manual" do
    token = user.signed_id(purpose: :purchase_login, expires_in: 2.days)

    get "/acceso/#{token}"

    expect(response).to redirect_to("/manual-del-color-vivo")

    follow_redirect!
    expect(response).to have_http_status(:ok)
  end

  it "redirects to the reader's last manual section when present" do
    user.update_column(:last_manual_path, "color-cotidiano/velas")
    token = user.signed_id(purpose: :purchase_login, expires_in: 2.days)

    get "/acceso/#{token}"

    expect(response).to redirect_to("/manual-del-color-vivo/color-cotidiano/velas")
  end

  it "rejects an expired token with an alert" do
    token = user.signed_id(purpose: :purchase_login, expires_in: 2.days)

    travel_to 3.days.from_now do
      get "/acceso/#{token}"
    end

    expect(response).to redirect_to("/users/sign_in")
    expect(flash[:alert]).to be_present
  end

  it "rejects a token with the wrong purpose" do
    token = user.signed_id(purpose: :other, expires_in: 2.days)

    get "/acceso/#{token}"

    expect(response).to redirect_to("/users/sign_in")
  end

  it "rejects garbage tokens" do
    get "/acceso/not-a-token"

    expect(response).to redirect_to("/users/sign_in")
  end
end
```

- [ ] **Step 2: Run, expect fail**

Run: `bundle exec rspec spec/requests/accesos_spec.rb`
Expected: FAIL — no route matches `/acceso/...`.

- [ ] **Step 3: Implement**

Create `app/controllers/accesos_controller.rb`:

```ruby
# frozen_string_literal: true

# One-click login from the purchase email. The signed token carries a 2-day
# expiry; after that buyers recover access via the password-reset flow.
class AccesosController < ApplicationController
  def show
    user = User.find_signed!(params[:token], purpose: :purchase_login)
    sign_in(user)
    redirect_to Manual.url_for(user.last_manual_path) || manual_path
  rescue ActiveSupport::MessageVerifier::InvalidSignature, ActiveRecord::RecordNotFound
    redirect_to new_user_session_path,
      alert: "El enlace ha expirado. Recupera tu acceso con tu correo."
  end
end
```

Add to `config/routes.rb` (near `get "generate-pdf"`):

```ruby
  get "/acceso/:token", to: "accesos#show", as: :acceso
```

- [ ] **Step 4: Run, expect pass**

Run: `bundle exec rspec spec/requests/accesos_spec.rb`
Expected: 5 examples, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add app/controllers/accesos_controller.rb config/routes.rb spec/requests/accesos_spec.rb
git commit -m "Add tokenized auto-login endpoint for purchase emails"
```

### Task 7: PurchaseMailer

**Files:**
- Create: `app/mailers/purchase_mailer.rb`
- Create: `app/views/purchase_mailer/fulfillment.html.erb`, `app/views/purchase_mailer/fulfillment.text.erb`
- Create: `spec/mailers/purchase_mailer_spec.rb`

- [ ] **Step 1: Failing spec**

Create `spec/mailers/purchase_mailer_spec.rb` (follow the style of `spec/mailers/comment_mailer_spec.rb`):

```ruby
require "rails_helper"

RSpec.describe PurchaseMailer do
  let(:purchase) { create(:purchase, email: "buyer@example.com") }
  let(:pdf) { "%PDF-1.4 fake" }
  let(:mail) { described_class.fulfillment(purchase, pdf) }

  it "is addressed to the buyer" do
    expect(mail.to).to eq([ "buyer@example.com" ])
    expect(mail.subject).to eq("Tu Manual del Color Vivo")
  end

  it "attaches the stamped PDF" do
    attachment = mail.attachments["manual-del-color-vivo.pdf"]
    expect(attachment).to be_present
    expect(attachment.mime_type).to eq("application/pdf")
    expect(attachment.body.raw_source).to start_with("%PDF")
  end

  it "includes a tokenized login link to the web manual" do
    html = mail.html_part.body.to_s
    token = html[%r{/acceso/([^"]+)}, 1]

    expect(token).to be_present
    expect(User.find_signed!(CGI.unescape(token), purpose: :purchase_login)).to eq(purchase.user)
  end

  it "mentions password recovery for permanent access" do
    expect(mail.html_part.body.to_s).to include("contraseña")
    expect(mail.text_part.body.to_s).to include("contraseña")
  end
end
```

- [ ] **Step 2: Run, expect fail**

Run: `bundle exec rspec spec/mailers/purchase_mailer_spec.rb`
Expected: FAIL — `uninitialized constant PurchaseMailer`.

- [ ] **Step 3: Implement**

Create `app/mailers/purchase_mailer.rb`:

```ruby
class PurchaseMailer < ApplicationMailer
  def fulfillment(purchase, pdf)
    @purchase = purchase
    @login_url = acceso_url(
      token: purchase.user.signed_id(purpose: :purchase_login, expires_in: 2.days)
    )

    attachments["manual-del-color-vivo.pdf"] = {
      mime_type: "application/pdf",
      content: pdf
    }

    mail(to: purchase.email, subject: "Tu Manual del Color Vivo")
  end
end
```

Create `app/views/purchase_mailer/fulfillment.html.erb`:

```erb
<h1>¡Gracias por tu compra!</h1>

<p>Adjunto encontrarás tu ejemplar del <strong>Manual del Color Vivo</strong> en PDF, personalizado con tu correo.</p>

<p>También puedes leer el manual en línea:</p>

<p><a href="<%= @login_url %>">Leer el manual en la web</a></p>

<p>Este enlace inicia tu sesión automáticamente y es válido por 2 días. Después, entra con tu correo usando la opción <em>¿Olvidaste tu contraseña?</em> para crear tu contraseña y conservar el acceso.</p>

<p>— Comunidad Antesis</p>
```

Create `app/views/purchase_mailer/fulfillment.text.erb`:

```erb
¡Gracias por tu compra!

Adjunto encontrarás tu ejemplar del Manual del Color Vivo en PDF, personalizado con tu correo.

Lee el manual en línea (el enlace inicia tu sesión y es válido por 2 días):
<%= @login_url %>

Después de 2 días, entra con tu correo usando "¿Olvidaste tu contraseña?" para crear tu contraseña y conservar el acceso.

— Comunidad Antesis
```

- [ ] **Step 4: Run, expect pass**

Run: `bundle exec rspec spec/mailers/purchase_mailer_spec.rb`
Expected: 4 examples, 0 failures. If the token assertion fails on escaping, drop the `CGI.unescape` (signed_ids are URL-safe Base64; adjust the spec to whichever form the URL actually contains).

- [ ] **Step 5: Commit**

```bash
git add app/mailers/purchase_mailer.rb app/views/purchase_mailer spec/mailers/purchase_mailer_spec.rb
git commit -m "Add PurchaseMailer with stamped PDF and login link"
```

### Task 8: PurchaseFulfillmentJob

**Files:**
- Create: `app/jobs/purchase_fulfillment_job.rb`
- Create: `spec/jobs/purchase_fulfillment_job_spec.rb`

- [ ] **Step 1: Failing spec**

Create `spec/jobs/purchase_fulfillment_job_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe PurchaseFulfillmentJob do
  let(:purchase) { create(:purchase) }

  # Test adapter so retry_on's re-enqueue is observable (test env default is
  # :solid_queue — see codebase facts / newsletter_mailerlite_enqueue_spec.rb).
  around do |example|
    original = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :test
    example.run
    ActiveJob::Base.queue_adapter = original
  end

  before do
    allow(ManualPdfStamper).to receive(:new)
      .and_return(instance_double(ManualPdfStamper, call: "%PDF-1.4 fake"))
  end

  it "stamps the PDF with the buyer's email, mails it, and marks fulfillment" do
    expect {
      described_class.perform_now(purchase)
    }.to change { ActionMailer::Base.deliveries.count }.by(1)

    expect(ManualPdfStamper).to have_received(:new).with(email: purchase.email)
    expect(purchase.reload.fulfilled_at).to be_present
  end

  it "skips already-fulfilled purchases (webhook retries, double enqueue)" do
    purchase.update!(fulfilled_at: 1.minute.ago)

    expect {
      described_class.perform_now(purchase)
    }.not_to change { ActionMailer::Base.deliveries.count }

    expect(ManualPdfStamper).not_to have_received(:new)
  end

  it "leaves the purchase unfulfilled and schedules a retry when stamping fails" do
    allow(ManualPdfStamper).to receive(:new).and_raise(ManualPdfStamper::Error, "boom")

    # retry_on is active even under perform_now (it works via rescue_from):
    # the error is swallowed and a retry is enqueued instead of raising.
    expect {
      described_class.perform_now(purchase)
    }.to have_enqueued_job(described_class).with(purchase)

    expect(purchase.reload.fulfilled_at).to be_nil
    expect(ActionMailer::Base.deliveries).to be_empty
  end
end
```

- [ ] **Step 2: Run, expect fail**

Run: `bundle exec rspec spec/jobs/purchase_fulfillment_job_spec.rb`
Expected: FAIL — `uninitialized constant PurchaseFulfillmentJob`.

- [ ] **Step 3: Implement**

Create `app/jobs/purchase_fulfillment_job.rb`:

```ruby
# Stamps the manual PDF with the buyer's email and mails it, exactly once per
# purchase. Row lock + fulfilled_at guard make double-enqueues (webhook +
# gracias page) and Stripe webhook retries harmless. deliver_now (not later)
# so fulfilled_at is only set after the mail is actually handed off.
class PurchaseFulfillmentJob < ApplicationJob
  queue_as :default

  retry_on ManualPdfStamper::Error, wait: :polynomially_longer, attempts: 5

  def perform(purchase)
    purchase.with_lock do
      next if purchase.fulfilled_at?

      pdf = ManualPdfStamper.new(email: purchase.email).call
      PurchaseMailer.fulfillment(purchase, pdf).deliver_now
      purchase.update!(fulfilled_at: Time.current)
    end
  end
end
```

Note: `next` (not `return`) inside `with_lock` — the block runs inside a transaction and `next` ends it with a commit; `return` semantics inside transaction blocks are a known footgun.

- [ ] **Step 4: Run, expect pass**

Run: `bundle exec rspec spec/jobs/purchase_fulfillment_job_spec.rb`
Expected: 3 examples, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add app/jobs/purchase_fulfillment_job.rb spec/jobs/purchase_fulfillment_job_spec.rb
git commit -m "Add PurchaseFulfillmentJob: stamp, mail, mark fulfilled once"
```

## Chunk 3: HTTP endpoints + sales page

### Task 9: Stripe webhook endpoint

**Files:**
- Create: `app/controllers/webhooks/stripe_controller.rb`
- Modify: `config/routes.rb`
- Create: `spec/requests/webhooks/stripe_spec.rb`

- [ ] **Step 1: Failing spec**

Create `spec/requests/webhooks/stripe_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "Stripe webhooks", type: :request do
  let(:secret) { "whsec_test_secret" }

  # Test adapter so have_enqueued_job works (test env default is :solid_queue).
  around do |example|
    original = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :test
    example.run
    ActiveJob::Base.queue_adapter = original
  end

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("STRIPE_WEBHOOK_SECRET").and_return(secret)
  end

  def event_payload(session_id: "cs_test_123", email: "buyer@example.com", type: "checkout.session.completed")
    {
      id: "evt_test_1",
      object: "event",
      type: type,
      data: {
        object: {
          id: session_id,
          object: "checkout.session",
          payment_status: "paid",
          customer_details: { email: email }
        }
      }
    }.to_json
  end

  def signature_header(payload, signing_secret: secret, timestamp: Time.now)
    signature = Stripe::Webhook::Signature.compute_signature(timestamp, payload, signing_secret)
    "t=#{timestamp.to_i},v1=#{signature}"
  end

  def post_event(payload, header)
    post "/webhooks/stripe", params: payload,
      headers: { "CONTENT_TYPE" => "application/json", "HTTP_STRIPE_SIGNATURE" => header }
  end

  it "creates a purchase and enqueues fulfillment for checkout.session.completed" do
    payload = event_payload

    expect {
      post_event(payload, signature_header(payload))
    }.to change(Purchase, :count).by(1)
      .and have_enqueued_job(PurchaseFulfillmentJob)

    expect(response).to have_http_status(:ok)
    purchase = Purchase.last
    expect(purchase.stripe_session_id).to eq("cs_test_123")
    expect(purchase.user.email).to eq("buyer@example.com")
  end

  it "is idempotent on webhook retries" do
    payload = event_payload

    post_event(payload, signature_header(payload))
    expect {
      post_event(payload, signature_header(payload))
    }.not_to change(Purchase, :count)

    expect(response).to have_http_status(:ok)
  end

  it "rejects an invalid signature" do
    payload = event_payload

    expect {
      post_event(payload, signature_header(payload, signing_secret: "whsec_wrong"))
    }.not_to change(Purchase, :count)

    expect(response).to have_http_status(:bad_request)
  end

  it "rejects a missing signature" do
    post "/webhooks/stripe", params: event_payload,
      headers: { "CONTENT_TYPE" => "application/json" }

    expect(response).to have_http_status(:bad_request)
  end

  it "acknowledges and ignores other event types" do
    payload = event_payload(type: "payment_intent.succeeded")

    expect {
      post_event(payload, signature_header(payload))
    }.not_to change(Purchase, :count)

    expect(response).to have_http_status(:ok)
  end
end
```


- [ ] **Step 2: Run, expect fail**

Run: `bundle exec rspec spec/requests/webhooks/stripe_spec.rb`
Expected: FAIL — no route.

- [ ] **Step 3: Implement**

Create `app/controllers/webhooks/stripe_controller.rb`:

```ruby
# frozen_string_literal: true

module Webhooks
  # Receives Stripe events. ActionController::API: no CSRF, no Devise/Inertia
  # concerns — the signature IS the authentication.
  class StripeController < ActionController::API
    def create
      event = Stripe::Webhook.construct_event(
        request.body.read,
        request.env["HTTP_STRIPE_SIGNATURE"].to_s,
        ENV.fetch("STRIPE_WEBHOOK_SECRET")
      )

      if event.type == "checkout.session.completed"
        purchase = Purchase.record!(event.data.object)
        PurchaseFulfillmentJob.perform_later(purchase)
      end

      head :ok
    rescue JSON::ParserError, Stripe::SignatureVerificationError
      head :bad_request
    end
  end
end
```

Add to `config/routes.rb`:

```ruby
  post "/webhooks/stripe", to: "webhooks/stripe#create"
```

- [ ] **Step 4: Run, expect pass**

Run: `bundle exec rspec spec/requests/webhooks/stripe_spec.rb`
Expected: 5 examples, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add app/controllers/webhooks config/routes.rb spec/requests/webhooks
git commit -m "Add Stripe webhook endpoint with signature verification"
```

### Task 10: Checkout endpoint

**Files:**
- Create: `app/controllers/checkouts_controller.rb`
- Modify: `config/routes.rb`
- Create: `spec/requests/checkouts_spec.rb`

- [ ] **Step 1: Failing spec**

Create `spec/requests/checkouts_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "Checkouts", type: :request do
  let(:stripe_session) do
    Stripe::Checkout::Session.construct_from(
      id: "cs_test_123",
      url: "https://checkout.stripe.com/c/pay/cs_test_123"
    )
  end

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("STRIPE_PRICE_ID").and_return("price_test_123")
    allow(Stripe::Checkout::Session).to receive(:create).and_return(stripe_session)
  end

  it "is not available before launch" do
    travel_to Date.new(2026, 8, 14) do
      post "/checkout"
    end

    expect(response).to have_http_status(:not_found)
    expect(Stripe::Checkout::Session).not_to have_received(:create)
  end

  it "creates a session and redirects to Stripe after launch" do
    travel_to Date.new(2026, 8, 15) do
      post "/checkout"
    end

    expect(response).to have_http_status(:see_other)
    expect(response).to redirect_to("https://checkout.stripe.com/c/pay/cs_test_123")

    expect(Stripe::Checkout::Session).to have_received(:create).with(
      hash_including(
        mode: "payment",
        line_items: [ { price: "price_test_123", quantity: 1 } ],
        success_url: a_string_including("/gracias-por-tu-compra?session_id={CHECKOUT_SESSION_ID}"),
        cancel_url: "http://www.example.com/"
      )
    )
  end
end
```

- [ ] **Step 2: Run, expect fail**

Run: `bundle exec rspec spec/requests/checkouts_spec.rb`
Expected: FAIL — no route.

- [ ] **Step 3: Implement**

Create `app/controllers/checkouts_controller.rb`:

```ruby
# frozen_string_literal: true

# Creates the Stripe Checkout Session for the one-time manual purchase.
# Plain form POST from the sales page (not an Inertia visit), so the 303
# redirect sends the browser straight to Stripe.
class CheckoutsController < ApplicationController
  def create
    raise ActiveRecord::RecordNotFound unless SalesLaunch.live?

    session = Stripe::Checkout::Session.create(
      mode: "payment",
      line_items: [ { price: ENV.fetch("STRIPE_PRICE_ID"), quantity: 1 } ],
      success_url: "#{gracias_por_tu_compra_url}?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: root_url
    )

    redirect_to session.url, allow_other_host: true, status: :see_other
  end
end
```

Add to `config/routes.rb`:

```ruby
  post "/checkout", to: "checkouts#create"
```

The `gracias_por_tu_compra_url` helper doesn't exist until Task 11 — add the route now so this task's spec passes:

```ruby
  get "/gracias-por-tu-compra", to: "gracias#show", as: :gracias_por_tu_compra
```

(The controller arrives in Task 11; a drawn route without a hit doesn't break anything.)

- [ ] **Step 4: Run, expect pass**

Run: `bundle exec rspec spec/requests/checkouts_spec.rb`
Expected: 2 examples, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add app/controllers/checkouts_controller.rb config/routes.rb spec/requests/checkouts_spec.rb
git commit -m "Add checkout endpoint creating Stripe Checkout Sessions"
```

### Task 11: Gracias page

**Files:**
- Create: `app/controllers/gracias_controller.rb`
- Create: `app/frontend/pages/GraciasPorTuCompra.jsx`
- Create: `spec/requests/gracias_spec.rb`

- [ ] **Step 1: Failing spec**

Create `spec/requests/gracias_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "Gracias por tu compra", type: :request do
  # Test adapter so have_enqueued_job works (test env default is :solid_queue).
  around do |example|
    original = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :test
    example.run
    ActiveJob::Base.queue_adapter = original
  end

  def paid_session(id: "cs_test_123", email: "buyer@example.com", payment_status: "paid")
    Stripe::Checkout::Session.construct_from(
      id: id,
      payment_status: payment_status,
      customer_details: { email: email }
    )
  end

  it "creates the user, signs them in, enqueues fulfillment, and renders" do
    allow(Stripe::Checkout::Session).to receive(:retrieve)
      .with("cs_test_123").and_return(paid_session)

    expect {
      get "/gracias-por-tu-compra", params: { session_id: "cs_test_123" }
    }.to change(Purchase, :count).by(1)
      .and have_enqueued_job(PurchaseFulfillmentJob)

    expect(response).to have_http_status(:ok)
    page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
    expect(page.fetch("component")).to eq("GraciasPorTuCompra")
    expect(page.dig("props", "email")).to eq("buyer@example.com")

    # Signed in: the gated manual now responds 200.
    get "/manual-del-color-vivo"
    expect(response).to have_http_status(:ok)
  end

  it "works when the webhook already created the purchase (race)" do
    session = paid_session
    Purchase.record!(session)
    allow(Stripe::Checkout::Session).to receive(:retrieve)
      .with("cs_test_123").and_return(session)

    expect {
      get "/gracias-por-tu-compra", params: { session_id: "cs_test_123" }
    }.not_to change(Purchase, :count)

    expect(response).to have_http_status(:ok)
    expect(User.where(email: "buyer@example.com").count).to eq(1)
  end

  it "redirects to root when session_id is missing" do
    get "/gracias-por-tu-compra"

    expect(response).to redirect_to("/")
  end

  it "redirects to root when the session is unpaid" do
    allow(Stripe::Checkout::Session).to receive(:retrieve)
      .and_return(paid_session(payment_status: "unpaid"))

    get "/gracias-por-tu-compra", params: { session_id: "cs_test_123" }

    expect(response).to redirect_to("/")
    expect(Purchase.count).to eq(0)
  end

  it "redirects to root when Stripe rejects the session id" do
    allow(Stripe::Checkout::Session).to receive(:retrieve)
      .and_raise(Stripe::InvalidRequestError.new("No such session", "session_id"))

    get "/gracias-por-tu-compra", params: { session_id: "cs_bogus" }

    expect(response).to redirect_to("/")
  end
end
```

- [ ] **Step 2: Run, expect fail**

Run: `bundle exec rspec spec/requests/gracias_spec.rb`
Expected: FAIL — `uninitialized constant GraciasController` (route exists from Task 10).

- [ ] **Step 3: Implement controller**

Create `app/controllers/gracias_controller.rb`:

```ruby
# frozen_string_literal: true

# Landing back from Stripe Checkout. Also the fallback purchase-recording
# path when the redirect beats the webhook — Purchase.record! is idempotent
# and the fulfillment job no-ops once fulfilled, so double work is harmless.
class GraciasController < InertiaController
  def show
    return redirect_to(root_path) if params[:session_id].blank?

    session = Stripe::Checkout::Session.retrieve(params[:session_id])
    return redirect_to(root_path) unless session.payment_status == "paid"

    purchase = Purchase.record!(session)
    PurchaseFulfillmentJob.perform_later(purchase)

    unless current_user
      sign_in(purchase.user)
      Current.user = purchase.user # set_current_user already ran; refresh for the shared prop
    end

    render inertia: "GraciasPorTuCompra", props: {
      email: purchase.email,
      manualPath: manual_path
    }
  rescue Stripe::InvalidRequestError
    redirect_to root_path
  end
end
```

- [ ] **Step 4: React page**

Create `app/frontend/pages/GraciasPorTuCompra.jsx` (match Landing.jsx styling conventions):

```jsx
export default function GraciasPorTuCompra({ email, manualPath }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream font-body text-blue-ink">
      <div className="max-w-md px-6 text-center">
        <h1 className="font-display text-3xl font-bold text-blue">¡Gracias por tu compra!</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-blue-ink/90">
          En unos minutos recibirás en <strong>{email}</strong> tu ejemplar del
          Manual del Color Vivo en PDF. También puedes descargarlo o leerlo en
          línea ahora mismo.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <a
            href="/generate-pdf"
            className="font-display bg-orange px-4 py-3 font-semibold text-white"
          >
            Descargar el manual
          </a>
          <a href={manualPath} className="font-display font-semibold text-blue underline">
            Leer el manual en la web
          </a>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Run, expect pass**

Run: `bundle exec rspec spec/requests/gracias_spec.rb`
Expected: 5 examples, 0 failures.

Run: `bin/vite build`
Expected: builds clean.

- [ ] **Step 6: Commit**

```bash
git add app/controllers/gracias_controller.rb app/frontend/pages/GraciasPorTuCompra.jsx spec/requests/gracias_spec.rb
git commit -m "Add gracias-por-tu-compra page with fallback purchase recording"
```

### Task 12: Home v2 sales page

**Files:**
- Modify: `app/controllers/landing_controller.rb`
- Create: `app/frontend/pages/LandingSale.jsx`
- Modify: `spec/requests/landing_spec.rb`

- [ ] **Step 1: Read source material**

Read the introduction of `data/manual.pdf` (Read tool handles PDFs; first ~10 pages) — the pitch copy comes from there. Browse `app/frontend/pages/manual-del-color-vivo/` and `app/frontend/components/manual/` to pick a short, visually representative recipe from early chapters for the inline preview, and note which content primitives (recipe/steps/materials components) it uses so they can be reused. The user vetoes both choices — flag them in the task summary.

- [ ] **Step 2: Failing spec**

Extend `spec/requests/landing_spec.rb`:

```ruby
require "rails_helper"

RSpec.describe "Landing", type: :request do
  def inertia_component
    JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text).fetch("component")
  end

  it "renders the pre-launch landing page before August 15, 2026" do
    travel_to Date.new(2026, 8, 14) do
      get "/"
    end

    expect(response).to have_http_status(:ok)
    expect(inertia_component).to eq("Landing")
  end

  it "renders the sales landing page from August 15, 2026" do
    travel_to Date.new(2026, 8, 15) do
      get "/"
    end

    expect(response).to have_http_status(:ok)
    expect(inertia_component).to eq("LandingSale")
  end

  it "exposes the manual contents for the sales preview" do
    travel_to Date.new(2026, 8, 15) do
      get "/"
    end

    page = JSON.parse(Nokogiri::HTML(response.body).at_css("script[data-page]").text)
    expect(page.dig("props", "contents")).to be_an(Array)
  end
end
```

(Replaces the old single "renders the landing page" example — the date pin keeps it deterministic after the real launch date passes. Check `spec/requests/landing_authenticated_spec.rb` too: if it asserts the `Landing` component or its props, pin its date with `travel_to Date.new(2026, 8, 14)` the same way.)

- [ ] **Step 3: Run, expect fail**

Run: `bundle exec rspec spec/requests/landing_spec.rb`
Expected: FAIL — component is `Landing` after launch date, no `contents` prop.

- [ ] **Step 4: Controller switch**

Rewrite `app/controllers/landing_controller.rb`:

```ruby
class LandingController < InertiaController
  def index
    if SalesLaunch.live?
      render inertia: "LandingSale", props: {
        contents: Manual::TABLE_OF_CONTENTS,
        manualPath: Manual.url_for(Current.user&.last_manual_path) || manual_path
      }
    else
      render inertia: "Landing", props: {
        subscribed: flash[:subscribed] || false,
        alreadySubscribed: flash[:already_subscribed] || false,
        source: params[:source],
        manualPath: Manual.url_for(Current.user&.last_manual_path) || manual_path
      }
    end
  end
end
```

- [ ] **Step 5: Sales page component**

Create `app/frontend/pages/LandingSale.jsx`. Skeleton below — the implementer fills the pitch copy from the PDF intro (Step 1) and renders the chosen recipe preview with the existing manual content primitives. Reuse Landing.jsx's header/TopMenu block and visual language (bg-cream, font-display, orange CTA).

```jsx
import coverUrl from '../assets/cover.jpg'
import TopMenu from '../components/TopMenu'

function BuyButton() {
  const csrf = document.querySelector('meta[name="csrf-token"]')?.content
  return (
    <form method="post" action="/checkout">
      <input type="hidden" name="authenticity_token" value={csrf} />
      <button
        type="submit"
        className="font-display bg-orange px-6 py-4 text-lg font-semibold text-white"
      >
        Comprar el manual — 30 USD
      </button>
    </form>
  )
}

export default function LandingSale({ user, contents, manualPath }) {
  return (
    <main className="flex min-h-screen flex-col bg-cream font-body text-blue-ink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-end gap-4 px-6 py-4 text-sm">
        {user ? (
          <TopMenu user={user} />
        ) : (
          <a href="/users/sign_in" className="font-display font-semibold text-blue">Iniciar sesión</a>
        )}
      </header>

      {/* Hero: title + pitch (from manual.pdf intro) + cover + CTA */}
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-6 py-10 md:grid-cols-2">
        <div className="max-w-md">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-orange-ink">
            Manual del Color Vivo
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] text-blue sm:text-5xl">
            Tiñe, extrae y pinta con lo que da la tierra
          </h1>
          {/* PITCH: 2-3 paragraphs written from the PDF introduction */}
          <div className="mt-6">
            {user ? (
              <a href={manualPath} className="font-display bg-orange px-6 py-4 text-lg font-semibold text-white">
                Continuar leyendo
              </a>
            ) : (
              <BuyButton />
            )}
          </div>
        </div>
        <img src={coverUrl} alt="Portada del Manual del Color Vivo" className="w-full max-w-sm justify-self-center" />
      </section>

      {/* Preview: table of contents */}
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <h2 className="font-display text-2xl font-bold text-blue">¿Qué contiene?</h2>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {contents.map((chapter) => (
            <li key={chapter.slug}>
              <span className="font-display font-semibold">{chapter.title}</span>
              {chapter.children && (
                <ul className="ml-4 list-disc text-sm text-blue-ink/80">
                  {chapter.children.map((section) => (
                    <li key={section.slug}>{section.title}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Preview: one full recipe, rendered with the manual content primitives */}
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <h2 className="font-display text-2xl font-bold text-blue">Una receta de muestra</h2>
        {/* RECIPE PREVIEW: inline the chosen recipe's content here */}
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14 text-center">
        {!user && <BuyButton />}
      </section>
    </main>
  )
}
```

Check `Manual::TABLE_OF_CONTENTS` node keys (`app/models/manual.rb`) — adjust `chapter.slug`/`children` access to the real shape. Recipe preview: import the recipe page's inner content or copy its primitive usage — do NOT wrap it in `ManualLayout` (that expects manual props/comments).

- [ ] **Step 6: Run, expect pass**

Run: `bundle exec rspec spec/requests/landing_spec.rb spec/requests/landing_authenticated_spec.rb`
Expected: all pass.

Run: `bin/vite build`
Expected: builds clean.

- [ ] **Step 7: Visual check**

Today is before the launch date, so `/` renders the old landing in dev; component correctness is covered by the request spec. To eyeball `LandingSale` visually, temporarily set `LAUNCH_DATE = Date.new(2026, 1, 1)` in `app/models/sales_launch.rb`, load `/` in the dev server, then REVERT before committing (`git diff` must show no sales_launch.rb change). Flag pitch copy + recipe choice to the user for veto.

- [ ] **Step 8: Commit**

```bash
git add app/controllers/landing_controller.rb app/frontend/pages/LandingSale.jsx spec/requests/landing_spec.rb spec/requests/landing_authenticated_spec.rb
git commit -m "Add sales landing page activated on launch date"
```

### Task 13: Full verification

- [ ] **Step 1: Full suite**

Run: `bundle exec rspec`
Expected: 0 failures. Fix anything broken (watch for: landing specs without date pins, Devise route changes).

- [ ] **Step 2: Lint + security + build**

Run: `bin/rubocop`
Expected: no offenses (fix or justify).

Run: `bin/brakeman`
Expected: no new warnings. Note: `redirect_to session.url, allow_other_host: true` in CheckoutsController may flag as unprotected redirect — the URL comes from Stripe's API, not user input; add a brakeman ignore with that justification if flagged.

Run: `bin/vite build`
Expected: clean.

- [ ] **Step 3: Manual smoke test (document results, ask user to verify payment flow)**

Pre-launch, `/checkout` returns 404 by design. To smoke-test the full flow: temporarily set `LAUNCH_DATE` to today in `app/models/sales_launch.rb` (revert before committing), run `stripe listen --forward-to localhost:3000/webhooks/stripe` plus the dev server, and complete a sandbox purchase with card `4242 4242 4242 4242`. Document these instructions for the user in the final summary.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A && git commit -m "Fix verification findings"
```

- [ ] **Step 5: Update CLAUDE.md architecture section**

Add a short paragraph to the project `CLAUDE.md` Architecture section describing: SalesLaunch switch, Purchase.record! idempotency design, fulfillment job, webhook endpoint, buyer auth (recoverable + /acceso tokens). Commit.
