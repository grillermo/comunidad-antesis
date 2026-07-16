# Manual sales via Stripe


## 0. Preparation (before the flow exists)

1. **Read Stripe docs** — Checkout (one-time payment), webhooks (`checkout.session.completed`), redirect URLs. Via Stripe MCP / official docs.
2. **Create the Stripe Product** (via Stripe MCP): ebook "Manual del Color Vivo", one-time **30 USD**(only) purchase. Add a relevant description to the product. Save the stripe_price_id in .env. 
3. **Configure webhook endpoint** in Stripe pointing to our app. Only implement the minimal events required for this flow. Add docs/webhook-instructions.md for me follow to configure the webhook (unless the MCP allows you to do it)

## 1. Landing — second version of the home page

4. **New home page version**, activated automatically **after August 15, 2026 (hardcoded)**. that fully replaces current version.
5. In this version, the call-to-action is a **"Comprar el manual"** button.

## 2. Checkout

6. The button leads to a **Stripe Checkout** (session created server-side with the 30 USD Product, `customer_email` captured by Stripe).
7. The session's `success_url` points to **`/gracias-por-tu-compra`** (with `session_id`), so the user can return to our site.

## 3. Post-purchase — two paths that create the User (idempotent)

Both create the `User` with the email coming from Stripe **if it doesn't exist yet**:

8. **Webhook** — `checkout.session.completed`:
   - Verify signature.
   - Create User (if it doesn't exist) with the session's email.
   - Enqueue background job (Solid Queue) that:
     - Generates the PDF **stamped with the buyer's email** using `ManualPDFStamper`.
     - Sends **email to the buyer** with the PDF attached + link to the web version of the manual.
9. **`/gracias-por-tu-compra` page** (redirect back from Stripe):
   - Retrieves the Checkout session by `session_id`, validates payment.
   - Creates the User if the webhook hasn't yet (webhook vs. redirect race) (use transactions to avoid the race)
   * Sign in the user automatically, the auto-sign in last 2 days (see below)
    *The user gets an automatically generated page. 
   - Shows a **"Descargar el manual"** button → PDF stamped with the buyer's email (`ManualPDFStamper`).

## 4. Implementation deliverables

- [ ] Stripe Product (30 USD, one-time) via MCP.
- [ ] Home v2 with hardcoded date (>= 2026-08-15) and purchase button.
- [ ] Endpoint that creates the Checkout Session.
- [ ] Webhook controller (signature verification, User creation, job enqueue).
- [ ] `/gracias-por-tu-compra`: fallback User creation + download button.
- [ ] Stamped PDF download via `ManualPDFStamper`.
- [ ] Mailer + background job: PDF attachment + link to the web manual.  The link has an short expiration(2 days) token that automatically logs in the user.


