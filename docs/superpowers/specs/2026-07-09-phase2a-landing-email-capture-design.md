# Phase 2a: Landing Page & Email Capture — Design

## Context

`comunidad-antesis` promotes and sells access to the Spanish-language ebook
*Manual del Color Vivo* by Anabel Torres Chávez (natural dyes, pigments, and
paints). Phase 1 delivered the Rails 8 skeleton (Postgres unified schema,
Solid Queue/Cache, RSpec, Inertia+React+Vite+Tailwind, `/health`). This spec
covers **Phase 2a only**: the public landing page and email capture.

Auth (Devise login + roles) and the Ebook/Sections reader are **separate later
specs** and are out of scope here.

Source spec: `docs/initial-prompt.md`. Design system reference: the ebook PDF
at `project/MaquetaCompleta-ManualDelColorVivo-VER1 (1).pdf`.

## Goals

- A public, above-the-fold landing page at `/` that captures email addresses
  by offering a discount on the ebook.
- Emails persisted to a `NewsletterEmail` model.
- Visual design derived from the ebook's palette and typography.

## Out of scope

- Any discount code generation, email/SMTP sending, or purchase flow. The
  landing page only captures the address; discount delivery is handled later
  when a purchase flow exists.
- Authentication, Ebook/Section models, comments.
- Below-the-fold marketing content. The page is above-the-fold only, no
  scrolling required.

## Layout & visual direction

Validated interactively via visual mockups. Chosen direction: **flat, cream
background** ("Dirección A"). No shadows, no gradients, no 3D perspective, no
decorative botanical elements — flat and minimal.

- **Two-column, above-the-fold hero.**
  - **Left column:** uppercase kicker ("Manual del Color Vivo"), a bold
    headline, a 2–3 sentence hook, an email capture form (single email input +
    submit button), and a small reassurance line ("Sin spam…").
  - **Right column:** the ebook cover shown flat (not a 3D render, per the
    minimal/flat direction chosen over the original spec's "3D mockup"
    wording).
- Headline (working copy, editable): "Tiñe, extrae y pinta con lo que da la
  tierra".
- Hook (working copy): "Más de una década de fórmulas para dar color con
  plantas, minerales e insectos. Déjanos tu correo y recibe un descuento para
  el ebook completo."
- Button (working copy): "Quiero mi descuento".

### Design tokens (Tailwind theme)

Fonts load via a `<link>` to Google Fonts in the Inertia layout `<head>`
(`app/views/layouts/*` used by inertia-rails), with `preconnect` hints, so
both faces are requested as early as possible for the above-the-fold render.
(`@fontsource` via Vite is an acceptable alternative; the plan should pick one
and note the FOUT tradeoff.)

Extend `tailwind.config` with the book's palette:

| Token | Hex |
|---|---|
| `cream` | `#F5EFDA` |
| `blue` | `#33538C` |
| `blue-deep` | `#2C4C86` |
| `blue-ink` | `#2A3F6B` |
| `orange` | `#EF6C15` |
| `orange-ink` | `#E5620C` |

Fonts: **Fredoka** (rounded display — headline, kicker, button) and **Nunito
Sans** (body) via Google Fonts. These are close free approximations of the
book's faces, not the exact licensed fonts; flagged as swappable if the exact
fonts are licensed later.

Cover image: extracted from PDF page 1, committed as a static app asset and
rendered flat in the right column.

## Routes & controllers

- `GET /` → `LandingController#index`
  - Renders Inertia page `Landing`.
  - Props: `subscribed` (bool), `alreadySubscribed` (bool), and `source`
    (string, echoed from `params[:source]` so it can be forwarded through the
    form as a hidden field).
  - **Flash → props mechanism (single approach, do not also use
    `inertia_share`):** `LandingController#index` reads `flash[:subscribed]`
    and `flash[:already_subscribed]` and passes them as the `subscribed` /
    `alreadySubscribed` props explicitly. Flash survives the single
    redirect-to-root used by `create`, so no global shared-data wiring is
    needed for Phase 2a.
  - Replaces the temporary `WelcomeController#index` / `Welcome` page created
    for the Phase 1 Inertia smoke test — both the controller and the
    `Welcome.jsx` page are deleted.
- `POST /newsletter_emails` → `NewsletterEmailsController#create`
  - Params: `email`, `source` (optional).
  - Control flow (the controller must distinguish the three outcomes, not
    treat all save failures alike):
    1. Build `NewsletterEmail.new(email:, source:)` and attempt `save`.
    2. **Success** (`save` returns true): redirect to `/` with
       `flash[:subscribed] = true`.
    3. **Duplicate**: detected when `save` returns false and
       `record.errors.details[:email]` includes `{ error: :taken }`, OR when
       the DB unique index raises `ActiveRecord::RecordNotUnique` (concurrent
       insert race — wrap the save in a rescue for this). Both map to a
       redirect to `/` with `flash[:already_subscribed] = true` (no new row).
    4. **Invalid** (any other validation failure, e.g. blank/malformed): see
       the invalid-email path below.
  - **Invalid-email error path:** inertia-rails does not server-side
    re-render. Use the redirect-back-with-errors pattern: `redirect_to
    root_path` with the model's errors surfaced via inertia-rails validation
    handling (`redirect_to root_path, inertia: { errors: record.errors }`, or
    equivalently rely on the gem's `inertia_errors` sharing after
    `redirect_back`). The `Landing` page then reads the standard Inertia
    `errors.email` prop and shows an inline message under the input.

## Data model — `NewsletterEmail`

Migration + model.

Columns:
- `email` — string, `null: false`, unique index (see normalization below).
- `source` — string, nullable (attribution: captured from a `?source=` query
  param forwarded as a hidden form field; e.g. a campaign tag).
- `created_at` / `updated_at`.

Model behavior:
- Normalize `email` before validation: `strip` + `downcase`.
- Validations:
  - presence of `email`.
  - format of `email` (a simple, permissive RFC-ish regex — e.g.
    `URI::MailTo::EMAIL_REGEXP`).
  - uniqueness of `email`, case-insensitive (enforced by both the model
    validation and the unique index; normalization makes these agree).

## Submit flow (Inertia, no full reload)

1. The `Landing` React page uses Inertia's `useForm({ email, source })`.
2. On submit, `form.post("/newsletter_emails")`.
3. Controller outcomes map to the three flash/error states in **Routes &
   controllers** above.
4. The React page renders:
   - default: the form.
   - `subscribed`: inline thank-you replacing the form ("¡Listo! Te
     avisaremos y te enviaremos tu descuento.").
   - `alreadySubscribed`: inline "Ya estás en la lista" message.
   - validation error: the form with an error message under the input.

Because the controller redirects back to `/` in every outcome (the Inertia
redirect pattern — 303 for the POST), no full page reload occurs; flash props
drive the success/already-subscribed states and the Inertia `errors` prop
drives the invalid state.

## Component / file structure

- `app/controllers/landing_controller.rb` — `#index`.
- `app/controllers/newsletter_emails_controller.rb` — `#create`.
- `app/models/newsletter_email.rb` — validations + normalization.
- `db/migrate/*_create_newsletter_emails.rb`.
- `app/frontend/pages/Landing.jsx` — the two-column hero + form + success
  states. One focused page component.
- `tailwind.config.*` — palette + font family tokens.
- Cover asset under `app/frontend/assets/` (or the Vite assets path the
  Phase 1 `inertia:install` established).
- Delete: `app/controllers/welcome_controller.rb`,
  `app/frontend/pages/Welcome.jsx`, and the `spec/requests/welcome_spec.rb`
  smoke-test spec.

## Testing

- **Model spec** (`spec/models/newsletter_email_spec.rb`):
  - valid with a well-formed email.
  - normalizes email (strips + downcases) before save.
  - invalid without email; invalid with a malformed email.
  - uniqueness is case-insensitive (`Foo@x.com` vs `foo@x.com`).
- **Request specs** (`spec/requests/landing_spec.rb`,
  `spec/requests/newsletter_emails_spec.rb`):
  - `GET /` returns 200 and renders the `Landing` Inertia page.
  - `POST /newsletter_emails` with a valid new email creates one row and
    redirects to `/` with `subscribed` flash.
  - `POST` with a duplicate email creates no new row and redirects with
    `alreadySubscribed` flash (case-insensitive duplicate, e.g. existing
    `foo@x.com` + submitted `Foo@x.com`).
  - `POST` with a malformed email creates no row and surfaces an Inertia
    `errors.email` error.
  - `source` is persisted when provided.
  - (Optional, if straightforward to simulate) a `RecordNotUnique` raised at
    save maps to the `alreadySubscribed` outcome, not a 500.

## Open questions / risks

- **Inertia flash props:** resolved above — `LandingController#index` reads
  flash and sets the `subscribed`/`alreadySubscribed` props explicitly (no
  global `inertia_share`). The plan should verify inertia-rails' error sharing
  (for the invalid-email `errors` prop) is available in the Phase 1 install;
  if not, enable it (the `inertia_rails` `redirect_to ..., inertia: { errors:
  }` handling or an `inertia_share` of `inertia_errors`).
- **Accessibility:** the email input needs an associated label (visible or
  `aria-label`) and the inline error should be tied to the input via
  `aria-describedby`; success/already-subscribed messages should be
  announced (e.g. `role="status"`). Cheap to include; the plan should specify
  it.
- **Font fidelity:** Fredoka/Nunito Sans approximate the book; exact match is
  not guaranteed. Acceptable for now, flagged for later refinement.
- **Cover asset weight:** the extracted cover PNG should be reasonably
  compressed (target well under ~300 KB) so the above-the-fold render stays
  fast; the plan should specify the extraction resolution/format.
