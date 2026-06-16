# Inspiring Connections — Email System

Branded email for IC / Rethinking Work: signatures, a reusable master template,
the automated onboarding drip, and the plan to make it send itself.

Built to match the live brand — same teal/cream/charcoal palette, Montserrat
headings, Open Sans body, and butterfly mark as the sites in `../sites/` and the
scorecard in `cis-portals`. British English throughout.

> **Nothing here sends to anyone.** These are templates, drafts and a design.
> Live sending is gated on John's explicit "go" **and** a suppression check on
> every recipient (see [Suppression](#suppression-non-negotiable)).

---

## What's in here

```
email/
├── README.md                      ← you are here (the automation plan)
├── signatures/
│   ├── signature-inspiringconnections.html   john@inspiringconnections.io
│   ├── signature-rethinkingwork.html         john@rethinkingwork.life
│   └── PASTE-INTO-GMAIL.md                    step-by-step paste guide
├── templates/
│   └── base-template.html         master template — copy this for any new email
├── onboarding-sequence/
│   ├── 01-welcome.html            send: immediately
│   ├── 02-getting-started.html    send: ~day 1
│   ├── 03-quick-win-scorecard.html send: ~day 3
│   ├── 04-tips-use-case.html      send: ~day 7
│   └── 05-check-in.html           send: ~day 14
├── assets/                        logo PNGs (masters) + source SVGs
└── _render/                       internal QA tooling (NOT shipped to recipients)
```

Preview screenshots are generated into `../.previews/` (gitignored). Regenerate
any time — see [Previewing](#previewing-locally).

---

## 1. The logo-rendering fix (signatures)

**Root cause.** A Gmail signature logo shows as a broken box when the `<img>`
points at something the recipient's mail client can't fetch anonymously — a
Google Drive link (`drive.google.com/...` needs auth), a `file://`/local path, or
a pasted/attached image whose `cid:` reference is dropped on reply. Mail clients
only reliably render images from a **stable, public HTTPS URL**.

**The fix.** We render the IC butterfly mark and the RW wordmark to PNG and serve
them from the live brand sites, so the URL is public and permanent:

| Brand | Public URL | Used by |
| --- | --- | --- |
| Inspiring Connections (mark) | `https://inspiringconnections.io/logo-email.png` | IC signature |
| Inspiring Connections (lockup) | `https://inspiringconnections.io/logo-email-horizontal.png` | all IC emails |
| Rethinking Work (lockup) | `https://rethinkingwork.life/logo-email.png` | RW signature |

The PNGs are committed both as masters in `assets/` **and** into the site folders
(`../sites/inspiringconnections.io/`, `../sites/rethinkingwork.life/`) so they
deploy with the sites. Every signature/email `<img>` sets an explicit `width` (so
it's crisp, not full-size) and an `alt` (so it degrades gracefully).

> ⚠️ **These URLs go live only when this branch is deployed.** `inspiringconnections.io`
> is already live (its `og.png` returns 200), so the moment these files ship to
> the site root the logos resolve. Until then the `alt` text shows instead — which
> is exactly the "broken box" being fixed, just with a tidy fallback. **Verify each
> URL returns 200 after deploy.**

To paste the signatures into Gmail, see `signatures/PASTE-INTO-GMAIL.md`. (Gmail
signatures can't be set programmatically — the operator pastes them once.)

---

## 2. The base template

`templates/base-template.html` is the house style every email copies:

- **~600px, table layout, all CSS inlined** — survives Gmail, Outlook, Apple Mail.
- Bulletproof CTA button (VML for Outlook, standard anchor everywhere else).
- Public logo header, teal accent rule, cream card, full footer with company
  details and a **required** `{{unsubscribe_url}}`.
- Mobile styles + a preheader (inbox preview line).

**Merge fields** (substitute at send time):

| Field | Meaning |
| --- | --- |
| `{{first_name}}` | recipient first name (fallback: "there") |
| `{{subject}}` / `{{preheader}}` | subject + inbox preview |
| `{{eyebrow}}` / `{{headline}}` | the teal kicker + the H1 |
| `{{paragraph_1}}` … | body copy |
| `{{cta_url}}` / `{{cta_label}}` | primary button |
| `{{score}}` | scorecard result, where relevant |
| `{{unsubscribe_url}}` | **required** — one-click unsubscribe |
| `{{preferences_url}}` / `{{company_address}}` / `{{year}}` | footer |

To make a new email: copy the file, swap the block between `BODY START` / `BODY
END`, fill the fields. Everything else stays put so the family stays consistent.

---

## 3. The onboarding sequence (5 emails)

A SaaS-style welcome drip for every new signup. Warm, benefit-led, one clear
action each, the scorecard as the recurring hook.

| # | File | Subject | Send timing |
| --- | --- | --- | --- |
| 1 | `01-welcome.html` | Welcome to Inspiring Connections, {{first_name}} 👋 | **immediately** on signup |
| 2 | `02-getting-started.html` | How it works — three steps and you're away | **~day 1** |
| 3 | `03-quick-win-scorecard.html` | How intentional are you, really? (2-minute Scorecard) | **~day 3** |
| 4 | `04-tips-use-case.html` | The one question that makes every introduction land | **~day 7** |
| 5 | `05-check-in.html` | How's it going so far? Let's have a quick chat | **~day 14** |

Each is a finished, self-contained HTML file built from the base template.
CTA destinations (all set in `_render/build-sequence.mjs`):

- Scorecard → `https://cis-portals.vercel.app/scorecard`
- Get started → `https://cis-portals.vercel.app/start` *(verified live, 200)*
- Book a call → `https://calendly.com/rethinkingwork` *(John's real Calendly, verified)*

> ⚠️ **`/scorecard` currently 404s in production** (the route exists in
> `cis-portals` but isn't merged to `main` yet). It must be live before email 1
> sends, or change the CTA to `/start`. Everything else is verified reachable.

Emails 02–05 are **generated** from `_render/build-sequence.mjs` so the chrome
can never drift between them. Edit copy there and re-run; email 01 is the
hand-authored reference. (Both approaches produce identical, valid output.)

---

## 4. The automation plan — how this becomes automatic

The goal: a new signup gets email 1 within minutes and the rest on schedule,
sent from John's own Gmail, with suppression honoured on every send — **at zero
marginal cost** (no SendGrid/Mailgun).

### The trigger
A new signup already lands as a `contacts` row via the **`site-lead`** edge
function (`source='ic_website'`, `partner_contexts=['ic_direct']`,
`engagements.butterfly_stage='signal'`). That row is the trigger.

Two ways to fire onboarding off it (pick one):

- **A — sequence-state table + cron (recommended).** A new table
  `onboarding_sequence_state` (one row per enrolled contact) tracks which step is
  next and when it's due. A scheduled function wakes up, finds everything due,
  and sends. Simple, observable, idempotent, easy to pause.
- **B — DB trigger / webhook.** A Postgres trigger or Supabase webhook on
  `contacts` insert calls an "enrol" function. Lower latency for email 1, but
  scheduling 2–5 still needs the table + cron from A — so A is the backbone
  either way.

### The sender — John's Gmail, free
No paid provider. Send **as `john@inspiringconnections.io`** via one of:

- **Gmail API** (OAuth, `gmail.send` scope) — cleanest, no password sharing,
  refresh-token based. Slightly more setup.
- **SMTP with a Gmail App Password** (`smtp.gmail.com:587`) — simplest to wire
  from an edge function; needs 2FA on the account + a 16-char App Password.

Either way the daily volume here is tiny (a handful of onboarding emails), well
within Gmail's limits. **Recommended: App-Password SMTP for v1** (fastest to
ship), migrate to Gmail API later if volume grows.

### The scheduler — a new edge function + cron
Add **`cis-onboarding-send`** to `cis-runners/functions/` (Pattern B, DEC-133),
scheduled via **Supabase cron** (`pg_cron` / scheduled function) every ~15 min:

```
cron ──▶ cis-onboarding-send
          1. SELECT due rows FROM onboarding_sequence_state
             (next_send_at <= now, status='active')
          2. for each:
             a. suppression-check  ──▶ skip + mark 'suppressed' if blocked
             b. render template N  (fill {{first_name}}, {{unsubscribe_url}} …)
             c. send via Gmail (App-Password SMTP / Gmail API)
             d. advance: step += 1, next_send_at = now + delay[step]
                (or status='completed' after step 5)
             e. log to activity_feed (skill='cis-onboarding-send')
```

`{{unsubscribe_url}}` is built per-recipient with the **existing `cis-unsub`**
HMAC token scheme — the one-click unsubscribe handler is already deployed.

### Suppression (non-negotiable)
Per **DEC-119 / DEC-128**, the global do-not-contact register `cis_suppression`
binds every send. The **`suppression-check`** function is already deployed and
**fail-closed** (any error ⇒ treat as suppressed). `cis-onboarding-send` MUST
call it immediately before every individual send — never batch past it, never
assume a stale result. A suppressed contact is silently skipped and the row
marked, never retried.

### What it costs
£0 in new services. Supabase edge functions + cron are on the existing project;
sending rides John's existing Gmail. The only spend is John's time to create one
App Password and click "go".

### Exactly what JB must provide to switch it on

1. **Gmail App Password** (or Gmail API OAuth consent) for
   `john@inspiringconnections.io`, stored as a Supabase Edge Function secret
   (e.g. `GMAIL_APP_PASSWORD` / `GMAIL_SENDER`). *Requires 2FA on the account.*
2. **`UNSUB_HMAC_SECRET`** set on `cis-unsub` (if not already) so unsubscribe
   tokens validate.
3. **Explicit "go"** to send to real people — and confirmation that suppression
   is verified for the initial cohort.
4. **`/scorecard` live in production** (currently 404) — or approval to point
   that CTA at `/start` instead.
5. Sign-off on subject lines + send cadence (the table in §3).

### Build checklist (engineering, after JB provides the above)
- [ ] migration: `onboarding_sequence_state` table (+ enrol on `site-lead` insert)
- [ ] edge function `cis-onboarding-send` (+ a test — `Test before live`, per repo rules)
- [ ] Gmail send helper routed through the LLM-neutral / no-vendor-lock seam style
- [ ] Supabase cron schedule (~15 min)
- [ ] templates moved/loaded by the function (inline or fetched from a store)
- [ ] deploy logo PNGs (this branch) and verify all logo URLs return 200
- [ ] dry-run to John's own inbox first; only then enable for real signups

---

## Previewing locally

Renders finished HTML in the bundled headless Chromium and screenshots it to
`../.previews/` (gitignored). Internal QA only — never part of a send.

```bash
cd email
export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers

# fill merge fields with sample data, then screenshot
node _render/fill.mjs onboarding-sequence/01-welcome.html ../.previews/01.html
node _render/render.mjs shot ../.previews/01.html ../.previews/01.png 680

# regenerate emails 02–05 from the shared scaffold
node _render/build-sequence.mjs

# re-rasterise the logo PNGs from their SVG masters
node _render/render.mjs logo assets/ic-logo-email.svg assets/ic-logo-email.png 240 240
```

Brand source of truth: `../sites/shared/brand.css` and
`../../cis-portals/lib/brand.js`. Keep colours/fonts in lockstep with those.
