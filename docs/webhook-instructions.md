# Stripe Webhook Configuration

The Stripe MCP used for this setup cannot create webhook endpoints, and no
production host is known yet. Create the endpoint manually after replacing the
host placeholder below. Keep the Dashboard in **sandbox/test mode** throughout
this setup.

1. Open <https://dashboard.stripe.com/webhooks> and confirm that test mode is
   enabled.
2. Select **Add endpoint**.
3. Set the endpoint URL to
   `https://<production-host>/webhooks/stripe`.
4. Subscribe to both required events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
5. Optionally subscribe to `checkout.session.async_payment_failed` if the app
   will notify buyers when a delayed payment fails. This event must not trigger
   fulfillment.
6. Create the endpoint, reveal its signing secret (`whsec_...`), and store it as
   `STRIPE_WEBHOOK_SECRET` in the production host's secret manager or server
   environment. Never commit or log this secret.

The webhook handler must verify the Stripe signature against the raw request
body before processing an event. Fulfill the manual only when all of these are
true:

- The event is `checkout.session.completed` or
  `checkout.session.async_payment_succeeded`.
- The Checkout Session has `payment_status == "paid"`.
- The session carries the manual-specific metadata set by the application. For
  example, if Checkout Session creation sets
  `metadata: { product: "manual_del_color_vivo" }`, require that exact key and
  value before fulfillment.

Make fulfillment idempotent by the Checkout Session ID because Stripe retries
webhooks and the two supported events can both describe the same purchase.

## Local testing

Run:

```sh
stripe listen --forward-to localhost:3000/webhooks/stripe
```

The Stripe CLI prints a temporary `whsec_...` for that listener. Put it in the
ignored local `.env` as `STRIPE_WEBHOOK_SECRET`; it is different from the
Dashboard endpoint's signing secret. Trigger and test both required event paths,
including the paid-status and metadata guards, before configuring production.
