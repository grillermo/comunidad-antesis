# Final Purchase Security Hardening Design

## Goal

Close the Checkout-return account-takeover path while preserving safe access for
new buyers, and harden fulfillment delivery, public password reset, and mail URL
configuration without broad exception handling or identity switching.

## Purchase ownership and browser return

Add `purchases.auto_login_on_return` as a non-null boolean defaulting to false.
`Purchase.record!` will create/find the purchase, acquire that purchase row's
lock, and link a normalized-email user. It sets the marker to true only when its
own `User.create!` successfully creates the user. Existing users—including
admins—and narrowly handled email-uniqueness race losers are linked with a false
marker. Existing/backfilled purchases remain false. Concurrent calls for the
same purchase serialize on the purchase lock; concurrent different purchases
for one email are resolved by the users email unique index, so only the purchase
whose call created the user can be marked true.

The Stripe bearer `session_id` is exchanged for the encrypted Rails-session
purchase id and then removed by redirecting to the clean Gracias URL. A signed-
out browser is signed in only when the purchase marker is true. An existing
matching owner keeps their identity and access. Any other active identity is
never replaced. The clean page gives email/manual access props only to the
authenticated purchase owner; every other visitor with valid confirmation state
gets generic Spanish confirmation copy with no buyer email or gated link.

## Fulfillment resilience

Keep the existing purchase row lock, stamper retry, and `fulfilled_at` update
after successful mail handoff. Translate only transient Mailgun communication
failures into a job-local retryable error: status 0 (network/no response), 408,
429, and 5xx. Retry it with bounded polynomial backoff. Mailgun permanent 4xx,
parameter errors, and Railgun configuration errors propagate without retry.

## Production URLs and password reset

Production mailer URLs use required `APP_HOST` with protocol `https`; Mailgun's
domain remains provider configuration only. The example environment and project
guidance document the new variable. Mailer coverage asserts a complete HTTPS
access URL using the configured host.

`Users::PasswordsController#create` gets Rails' two named limits matching login:
10 attempts per minute per remote IP and 5 attempts per 15 minutes per normalized
email across IPs. A create-only shape guard requires a parameters object with a
string email before the rate-limit callbacks, so missing, scalar, array, or
nested email shapes return an empty 400 and cannot send mail. Valid known and
unknown addresses retain Devise's paranoid response behavior.

## Integration and verification

Request/job integration coverage will exercise webhook-first and Gracias-first
ordering, drain both queued fulfillment jobs, and prove one purchase, one user,
and one delivery. Each behavior is introduced with an observed failing spec
before implementation. Verification includes focused specs, migrations, the
full suite, changed-file RuboCop, Brakeman comparison, production client and SSR
builds, and a production boot using placeholder environment values only.
