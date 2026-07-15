# Manual Sales via Stripe — Design

Date: 2026-07-15
Status: Approved by user
Source spec: `pre-spec.md`

## Goal

Sell the "Manual del Color Vivo" ebook as a one-time $30 USD purchase through Stripe Checkout. Buyers receive a PDF stamped with their email plus web access to the manual. The web manual becomes reader-gated; a new sales home page activates automatically on August 15, 2026.

## Decisions (from brainstorming)

- Stripe Checkout Sessions via the `stripe` gem (not Payment Links).
- A `Purchase` model keyed on `stripe_session_id` provides idempotency for the webhook/redirect race and webhook retries.
- Buyers become regular `User` records with a random password; Devise `:recoverable` is added so they can set a password later.
- Auto-login uses `signed_id` tokens (purpose `:purchase_login`, 2-day expiry).
- Manual pages gate to any signed-in user, effective immediately (existing users grandfathered).
- Home v2, the checkout endpoint, and all buying activate on/after 2026-08-15 (hardcoded date). Before that, the manual is gated and unbuyable.
- No public preview routes; the preview (table of contents + one recipe) lives inline on home v2 only.
- Stripe product created in the sandbox account now; production keys handled later.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` live in `.env`.

## 1. Stripe setup

- Create the product via Stripe MCP in the sandbox account: ebook "Manual del Color Vivo", one-time price of $30 USD, with a relevant description.
- Add the `stripe` gem.
- Env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` (documented in `.env.example`).
- The Stripe MCP cannot create webhook endpoints, so write `docs/webhook-instructions.md` for the user: endpoint URL `/webhooks/stripe`, subscribe to the single event `checkout.session.completed`.

## 2. Launch switch

- `SalesLaunch.live?` → `Date.current >= Date.new(2026, 8, 15)`, hardcoded (per pre-spec).
- Controls two things: which home page component renders, and whether the checkout endpoint responds (404 before the date).
- Manual gating is NOT behind this switch — it is active immediately.

## 3. Manual gating

- `ManualController` gains `before_action :authenticate_user!`. Devise redirects anonymous visitors to the login page.
- No preview routes are exempted.

## 4. Home v2 (sales page)

- New Inertia page `LandingSale.jsx`. `LandingController#index` renders `LandingSale` when `SalesLaunch.live?`, else the current `Landing`.
- Content (all user-facing copy in Spanish):
  - Pitch written from the introduction of `data/manual.pdf` (read at implementation time; user vetoes copy).
  - Preview: the manual's table of contents plus one representative recipe rendered inline.
  - Price ($30 USD) and a "Comprar el manual" button.
- The button POSTs to `/checkout` → `CheckoutsController#create`:
  - Returns 404 unless `SalesLaunch.live?`.
  - Creates `Stripe::Checkout::Session` with `mode: "payment"`, the configured price ID, `success_url: <app>/gracias-por-tu-compra?session_id={CHECKOUT_SESSION_ID}`, `cancel_url` back to home. Stripe captures `customer_email` itself.
  - Responds with a 303 redirect to `session.url`.

## 5. Purchase model + fulfillment

- New table `purchases`: `stripe_session_id` (string, unique index, null: false), `email` (null: false), `user_id` (FK), `fulfilled_at` (datetime, nullable), timestamps.
- `Purchase.record!(session)` — the single shared entry point for both post-purchase paths:
  - Runs in a transaction.
  - `Purchase.create_or_find_by(stripe_session_id:)`, storing the session's email.
  - `User.find_or_create_by(email:)` with a random `Devise.friendly_token` password (users.email unique index arbitrates races).
  - Returns the purchase (with associated user).
- `PurchaseFulfillmentJob` (Solid Queue):
  - Locks the purchase row; returns early if `fulfilled_at` is set (makes webhook retries and double-enqueues safe).
  - Generates the stamped PDF via `ManualPdfStamper.new(email: purchase.email).call`.
  - Sends `PurchaseMailer#fulfillment`.
  - Sets `fulfilled_at`.

## 6. Webhook

- `POST /webhooks/stripe` (`Webhooks::StripeController`), CSRF skipped.
- Verifies the signature with `Stripe::Webhook.construct_event` using `STRIPE_WEBHOOK_SECRET`; returns 400 on verification failure.
- Handles only `checkout.session.completed`: calls `Purchase.record!` and enqueues `PurchaseFulfillmentJob`. Ignores other event types.
- Returns 200 after successful handling.

## 7. Gracias page

- `GET /gracias-por-tu-compra?session_id=...` (`ThankYouController` or similar):
  - Retrieves the Checkout Session from Stripe; requires `payment_status == "paid"`, else redirects to root.
  - Calls `Purchase.record!` (covers the webhook-not-yet-arrived race) and enqueues `PurchaseFulfillmentJob` if unfulfilled (job is idempotent, so double-enqueue is harmless).
  - Signs the user in (`sign_in(user)`).
  - Renders an Inertia thank-you page: "Descargar el manual" button pointing at the existing `GeneratedPdfsController` route, plus a link to the web manual.

## 8. Buyer authentication

- Add Devise `:recoverable` to `User` (migration adds `reset_password_token` + `reset_password_sent_at`). Buyers use "forgot password" to set a permanent password.
- Email auto-login link: `GET /acceso/:token` → `User.find_signed!(token, purpose: :purchase_login)` (token generated with `expires_in: 2.days`) → `sign_in` → redirect to the manual. Expired/invalid token → login page with an alert.

## 9. Mailer

- `PurchaseMailer#fulfillment` (delivered via Solid Queue / existing Mailgun config):
  - Attaches the stamped PDF.
  - Includes the tokenized web-manual link (2-day auto-login).
  - Mentions setting a password ("olvidé mi contraseña") for permanent access.
  - Copy in Spanish.

## 10. Testing (RSpec)

- Webhook: signature verification (reject bad, accept good), idempotency on retries, ignores other events.
- Race: webhook-first and redirect-first orderings both end with one user, one purchase, one email.
- Manual gating: anonymous redirected, signed-in allowed.
- Launch switch: `travel_to` before/after 2026-08-15 flips home component and checkout availability.
- Checkout endpoint: 303 to Stripe URL (API stubbed), 404 pre-launch.
- Gracias page: paid session signs in + renders; unpaid/invalid redirects.
- Job: skips when fulfilled, stamps + mails + marks when not.
- Mailer: attachment present, login link present.
- Token login: valid signs in, expired/invalid alerts.
- All Stripe API calls stubbed.
