# Final Purchase Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent Checkout email from authenticating an existing account while adding bounded delivery retries, canonical mail URLs, password-reset throttles, and end-to-end race coverage.

**Architecture:** `Purchase` owns the durable auto-login decision under its row lock and the users-email unique index arbitrates cross-purchase races. `GraciasController` consumes that decision without ever replacing an active identity and exposes owner-only props. The fulfillment job classifies Mailgun failures by response status, while Rails controller rate limits and required production environment variables cover the public operational boundary.

**Tech Stack:** Rails 8.0.5, Ruby 3.4.7, PostgreSQL, Devise 5.0.4, Active Job/Solid Queue, mailgun-ruby 1.4.4, Inertia Rails/React, RSpec.

## Global Constraints

- Run every shell command through `rtk`; run Ruby/Rails/RSpec through `rbenv exec`.
- Edit files only through `apply_patch`; never inspect or print credential/key contents.
- Observe a behavior-specific failing spec before each production change.
- Never auto-login when `current_user` is present and differs from the purchase owner.
- Retry Mailgun communication status 0, 408, 429, and 5xx only.
- Produce exactly two logical commits: security takeover first, operational hardening second.

---

### Task 1: Durable safe auto-login decision

**Files:**
- Create: `db/migrate/<timestamp>_add_auto_login_on_return_to_purchases.rb`
- Modify: `db/schema.rb`
- Modify: `app/models/purchase.rb`
- Modify: `spec/models/purchase_spec.rb`

**Interfaces:**
- Produces: `Purchase#auto_login_on_return` boolean, false by default.
- Produces: `Purchase.record!(stripe_session)` linking one normalized-email user while marking true only after successful user insertion.

- [ ] **Step 1: Add failing model examples**

Assert new-user true, existing commenter/admin false, backfill false, second purchase for the same email false, narrow uniqueness-race loser false, and unrelated `RecordInvalid` propagation.

- [ ] **Step 2: Run RED**

Run: `rtk rbenv exec bundle exec rspec spec/models/purchase_spec.rb --format documentation`

Expected: failures for missing `auto_login_on_return` and unsafe reuse behavior.

- [ ] **Step 3: Generate and run the migration**

Run: `rtk rbenv exec bundle exec rails generate migration AddAutoLoginOnReturnToPurchases auto_login_on_return:boolean`

Set the column to `default: false, null: false`, then run:

`rtk rbenv exec bundle exec rails db:migrate RAILS_ENV=test`

- [ ] **Step 4: Implement the locked model flow**

Within `purchase.with_lock`, return when already linked; otherwise find an existing normalized user and link false, or attempt `User.create!`. Mark true only after successful creation. Rescue `RecordNotUnique`, and rescue `RecordInvalid` only when the exception record has an email-taken error; link the committed winner false. Re-raise every other validation failure.

- [ ] **Step 5: Run GREEN**

Run the Task 1 spec command and require zero failures.

### Task 2: Gracias identity and disclosure boundary

**Files:**
- Modify: `app/controllers/gracias_controller.rb`
- Modify: `app/frontend/pages/GraciasPorTuCompra.jsx`
- Modify: `spec/requests/gracias_spec.rb`

**Interfaces:**
- Consumes: `Purchase#auto_login_on_return`.
- Produces: owner props `{ email:, manualPath: }`; generic confirmation receives neither prop.

- [ ] **Step 1: Add failing request examples**

Cover signed-out existing commenter and admin, active different user, active matching owner, and brand-new buyer. Assert no Warden authentication for reused accounts, no identity switch, clean redirect/session exchange, and absent `email`/`manualPath` on generic responses.

- [ ] **Step 2: Run RED**

Run: `rtk rbenv exec bundle exec rspec spec/requests/gracias_spec.rb --format documentation`

Expected: reused users are currently authenticated and active different users are currently replaced.

- [ ] **Step 3: Implement controller and React branches**

Sign in only when `current_user.nil? && purchase.auto_login_on_return?`. Store the purchase id and redirect cleanly for every valid confirmation. On the clean request, load the session purchase; pass owner props only when `current_user == purchase.user`; otherwise render generic Spanish copy without access links.

- [ ] **Step 4: Run GREEN and frontend build smoke check**

Run the Task 2 request spec and `rtk proxy env NODE_ENV=production bin/vite build --clear`.

- [ ] **Step 5: Commit security fix**

Stage only Task 1/2 production/spec/schema/design/plan files and commit with `rtk git commit --no-gpg-sign -m "Prevent Checkout return account takeover"`.

### Task 3: Bounded transient Mailgun retry

**Files:**
- Modify: `app/jobs/purchase_fulfillment_job.rb`
- Modify: `spec/jobs/purchase_fulfillment_job_spec.rb`

**Interfaces:**
- Produces: job-local retryable exception for Mailgun statuses 0, 408, 429, and 500..599.

- [ ] **Step 1: Add failing job examples**

Make real `deliver_now` raise `Mailgun::CommunicationError` instances with network/408/429/5xx statuses and assert one retry enqueue plus nil `fulfilled_at`. Assert 400/401 communication subclasses and `Railgun::ConfigurationError` propagate and enqueue no retry.

- [ ] **Step 2: Run RED**

Run: `rtk rbenv exec bundle exec rspec spec/jobs/purchase_fulfillment_job_spec.rb --format documentation`

Expected: transient mail failure raises without enqueue.

- [ ] **Step 3: Implement and run GREEN**

Add a bounded polynomial `retry_on` for a job-local transient wrapper. Rescue `Mailgun::CommunicationError` only around delivery, classify status, translate only the approved statuses, and re-raise permanent failures. Preserve stamper retry and marker ordering.

### Task 4: Canonical application host

**Files:**
- Modify: `.env.example`
- Modify: `config/environments/production.rb`
- Modify: `spec/mailers/purchase_mailer_spec.rb`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: required production `APP_HOST`.
- Produces: signed access links with `https://<APP_HOST>/acceso?...`.

- [ ] **Step 1: Add failing configured-host mailer assertion and run RED**

Temporarily set mailer default URL options to `{ host: "app.example.test", protocol: "https" }`, deliver, and assert the full access URL in both bodies. Run `rtk rbenv exec bundle exec rspec spec/mailers/purchase_mailer_spec.rb --format documentation`.

- [ ] **Step 2: Implement config/docs and run GREEN**

Add `APP_HOST=` to `.env.example`; set production default URL options to `{ host: ENV.fetch("APP_HOST"), protocol: "https" }`; leave Mailgun domain provider-only; update `CLAUDE.md`; rerun the mailer spec.

### Task 5: Public password-reset throttles and shape guard

**Files:**
- Modify: `app/controllers/users/passwords_controller.rb`
- Modify: `spec/requests/passwords_spec.rb`

**Interfaces:**
- Produces: reset limits `password-reset-by-ip` (10/minute) and `password-reset-by-email` (5/15 minutes).

- [ ] **Step 1: Add failing request examples**

Use real Rails cache counters to assert fifth/sixth normalized-email boundary across IPs, tenth/eleventh IP boundary across emails, below-limit paranoid behavior, and empty 400/no mail for missing/scalar/array/nested email shapes.

- [ ] **Step 2: Run RED**

Run: `rtk rbenv exec bundle exec rspec spec/requests/passwords_spec.rb --format documentation`

Expected: throttle requests continue through Devise and malformed shapes raise or redirect.

- [ ] **Step 3: Implement guard/limits and run GREEN**

Declare the create-only guard before two named `rate_limit` callbacks. Accept only `ActionController::Parameters` containing a String email; normalize with strip/downcase; return empty 400 for every other shape. Rerun the password specs.

### Task 6: Webhook/Gracias race integration

**Files:**
- Modify: `spec/requests/gracias_spec.rb`
- Modify: `spec/requests/webhooks/stripe_spec.rb` or add one focused integration context to `spec/requests/gracias_spec.rb`

**Interfaces:**
- Exercises: real controllers, Active Job test queue, `PurchaseFulfillmentJob` marker guard.

- [ ] **Step 1: Add ordering examples and run RED if behavior is missing**

For webhook-first and Gracias-first, submit both accepted controller requests, assert two job enqueues, drain both jobs with real mail delivery and a deterministic stamper, and assert one purchase, one user, and one delivery.

- [ ] **Step 2: Make only the minimal helper/production adjustment required and run GREEN**

Run: `rtk rbenv exec bundle exec rspec spec/requests/gracias_spec.rb spec/requests/webhooks/stripe_spec.rb spec/jobs/purchase_fulfillment_job_spec.rb --format documentation`.

### Task 7: Verification, documentation, and operational commit

**Files:**
- Modify: `.superpowers/sdd/task-13-report.md`
- Modify: `.superpowers/sdd/progress.md`

- [ ] **Step 1: Run migrations and focused specs**

Run `rtk rbenv exec bundle exec rails db:migrate`, then all changed focused specs.

- [ ] **Step 2: Run full verification**

Run full RSpec, changed-file RuboCop, Brakeman, production client build, production SSR build, and production Rails boot with placeholder `APP_HOST`, Mailgun, Stripe, and dummy secret-base environment only.

- [ ] **Step 3: Audit security requirements**

Confirm no secrets/key contents, no buyer disclosure on generic Gracias, no active identity replacement, no broad Mailgun/config rescue, and no new Brakeman warning.

- [ ] **Step 4: Update evidence ledgers**

Record every RED/GREEN command/result, migration, build module count, warning comparison, and commit hash in Task 13 report and progress ledger.

- [ ] **Step 5: Commit operational hardening**

Stage remaining tracked changes and commit with `rtk git commit --no-gpg-sign -m "Harden purchase delivery and account recovery"`.

- [ ] **Step 6: Final clean audit**

Run `rtk git status --short`, `rtk git diff --check`, and `rtk git log -2 --oneline`; report exact evidence and any residual pre-existing warnings.
