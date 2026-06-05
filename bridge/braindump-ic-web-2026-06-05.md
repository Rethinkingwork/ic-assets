# Thinking harvest — ic-web (IC website + bots) — 2026-06-05

Lane: the four brand sites (inspiringconnections.io, rethinkingwork.life,
rethinkingwork.co.uk/SmartReach, schoolofthought.life) + the ANNA bot + lead-gen funnels.
Code is all on `ic-assets` (branch `claude/inspiring-connections-site-bot-xsHcT`, == main).
This file is the stuff that never became code.

## Projects / workflows discussed (not yet built)
- **Self-learning loop.** Explicitly out of scope for this build, but the foundation is laid:
  every bot turn ships a `meta` blob (path/referrer/ts/turn) and the edge fn persists per-turn
  intent/route/cost snapshots. Next step is an analysis pass over `cis_conversation_messages`
  to learn which openers/questions/variants convert, then feed that back into the prompt.
- **Richer ANNA flow (qualify → match-signal → prove → refer).** A more advanced bot exists on
  the *other* branch (`claude/github-visibility-check-xKvrs`, commit b8aa302): it shows a
  "Checking the network…" chip, surfaces the Connection/Growth/Impact taxonomy + a Connection
  Card proof line, and auto-appends "Your first introduction is on us." The LIVE anna.js is the
  simpler one I built. Someone must pick which is canonical (see open questions).
- **Connection Card self-serve.** ANNA *offers* a Connection Card conversationally, but there's
  no actual generation/delivery flow — it's a promise that lands as an engagement for John to
  action by hand. A real "request → generate → deliver a Connection Card" surface is future work.
- **Second conversion surface.** Floated: an inline mid-page "request a Connection Card" CTA,
  and/or an exit-intent nudge. Not built — kept the page to one clear primary CTA + the bot + the
  end-of-page form on purpose.
- **Accessibility / Lighthouse polish pass** across the 4 pages (contrast, focus order, labels,
  perf). Floated as a "keep me busy" option, never scoped.
- **Per-site brand tinting of the widget.** The widget supports `CONFIG.brand` (CSS var override)
  but all 4 sites currently use the default IC teal/orange. SmartReach (orange-led) and School of
  Thought (calm teal) would feel more "theirs" with a tint.

## Decisions & the reasoning behind them
- **Bot backend = a Supabase edge function (`site-bot`), not in-page and not a cis-runners import.**
  Why: the sites are static (per-site Vercel root dirs), so they can't import the cis-runners TS
  DEC-102 seam; the edge fn is the natural home for the LLM call + DB writes + CORS, and it keeps
  ic-assets a pure static asset repo (three-store discipline). DEC-102 honoured by isolating the
  provider behind `callLlm()` + env (`LLM_PROVIDER`/`SITE_BOT_MODEL`), not by importing the seam.
- **One identical `anna.js`/`capture.js` on every site; per-site differences in a `window.*_CONFIG`
  block in each page.** Why: per-site Vercel roots mean a shared/ folder isn't served, so each site
  needs its own copy — and config-in-page kills the drift you'd get from editing N copies. Cloning
  a 5th site is two file copies + a config block.
- **Opener rendered client-side (free).** The first LLM call only fires when the visitor actually
  replies — saves a Haiku call on every bounce. Cost discipline.
- **One LLM call per turn via a forced `respond` tool** (structured output: reply + intent + stage +
  route + captured fields in a single call). Haiku-only; system prompt prompt-cached.
- **Engagement write only on qualification** (real intent + an email, not opt-out): create-or-resolve
  a contact (match email→linkedin, else insert), `client_assignment` left NULL at ingest (DEC-81),
  `partner_contexts=['ic_direct']` = visibility. Source=ic_website. Stage signal→spark.
- **Anonymous-visitor conversation key.** `cis_conversations` has a CHECK (contact_id OR linkedin_url);
  a fresh visitor has neither, so I open with a namespaced session URL in `linkedin_url`
  (`https://<site>.io/_s/<uuid>`) and backfill contact_id on qualify. Honest-ish, non-colliding.
- **Form posts to `site-lead`, with a prefilled mailto fallback** so a lead is never lost before the
  backend exists. GDPR consent required (ethics-first), honeypot for spam, name+email validated.
- **Audience taxonomy:** routed on the brief's 3 intents (Growth / Connection / Service) but labelled
  in brand-canon terms (Growth Partner / Impact Partner / Connector + solo). The brand canon doesn't
  have "Connection Partner"; "Connector" is the right word.
- **ANNA is the WARM co-captain; ERIC is the cheeky one** (Notion role cards). Bot tuned warmth-first,
  light cheek — not full music-hall, despite DEC-115's "cheeky/jolly good".
- **ANNA backronym = "Authentic Networks, Nurturing Aspirations"** (repo + JB), not Notion's stale
  "Navigating Alignment". JB's word + repo win; Notion is a downstream mirror.

## Open questions / unresolved trade-offs
- **Which anna.js is canonical** — the simple live one (ic-assets main) or the qualify→match→refer
  enhancement on github-visibility-check (b8aa302)? Decide BEFORE that spine folds in (gate 65) or it
  clobbers the live widget.
- **Ratify vs revert the ic-assets `main` fast-forward** (task 82). It's live + verified correct;
  reverting takes 4 live sites down. Strong recommend: ratify.
- **Repo home for the 4 sites** — stay in ic-assets (asset library) or move to a dedicated `cis-sites`
  repo (cleaner per DEC-95). Never decided.
- **Apex vs www as canonical.** Domains 308→www; canonical tags point to the apex. Pick one and make
  them agree (small SEO inconsistency otherwise).
- **rethinkingwork.life is double-booked** as a Short.io short-link domain — can't serve both the site
  and short links on the same apex. Either move short links, or run the site on www/subdomain.
- **apikey on the edge fns.** Not required today (gateway accepts no-apikey on verify_jwt=false). If
  that gateway policy ever changes, BOTH widgets (site-bot + capture) must add the anon key together.

## Dead-ends (and why)
- **Assumed a separate `site-inspiringconnections` repo existed.** Wrong — it's only a Vercel project
  name; all 4 sites live in `ic-assets`. Lesson: check Vercel↔git linkage, not repo names.
- **`cis_identities` insert with owner_type='channel' → failed.** CHECK allows only operator|client.
  Used 'operator' for the website channel.
- **`cis_conversations` insert with no key → failed** the contact_id-OR-linkedin_url CHECK (see session-key decision).
- **`activity_feed` insert with a `source` column → failed** (no such column; it keys on skill+action).
  DEC-76 prose implies `source=` but the live table doesn't have it → doctrine-vs-schema drift to fix.
- **SVG `og:image` → no social card.** LinkedIn/X/Facebook don't render SVG OG images. No raster tooling
  in this lane (no rsvg/convert/inkscape/sharp), so it was handed to orchestration (rendered via cairosvg).
- **The orchestrator's "apikey is CRITICAL" warning** was a false premise — verified empirically that
  no-apikey returns 200. Lesson: test for the real 200, don't trust an assumed gateway requirement.

## Ideas floated in passing
- Per-purpose Calendly event types (one general slot is wired now).
- A real mobile screenshot / Chrome attended QA pass (couldn't do from a headless lane).
- Brand-tint each non-IC widget for stronger per-brand feel.
- Use the logged `meta` + per-turn snapshots as the training signal for the self-learning loop.

## "Do later" notes
- Purge test rows: contact 6e99cf3f (Sarah Whitmore) + engagement a4998fb2 + the anna-formtest@ contact.
- Repoint rethinkingwork.life off Short.io to the Vercel project (or decide www/subdomain).
- Align canonical tags with the www redirect.
- Update the Notion ANNA card to "Nurturing Aspirations" (ERIC's job; Notion is a mirror).
- Reconcile DEC-76 (activity_feed `source` vs `skill`/`action`).
- Server-side rate-limit / origin allowlist on the edge fns (client-side rate-limit is done).
- Confirm BUILD_STATE §8 is updated (ANTHROPIC_API_KEY works now — the "placeholder/401" note was stale).

## Mental models / framings
- **Funnel = discovery + conversion.** Discovery = SEO/social (canonical/OG/Twitter/JSON-LD/robots/
  sitemap, cross-linked via sameAs so 4 brands reinforce one entity). Conversion = ANNA (conversational)
  OR the form (for people who won't chat). Two capture modes, one backend.
- **"The conversation IS the qualification."** ANNA figures out which of three a visitor is within
  3–5 turns and routes — no separate qualifying step.
- **Lane/scope split worked well:** front-end in this lane; anything backend/DB/DEC/domain → a numbered
  REQUEST in `REQUESTS-TO-ORCHESTRATION.md`. That file is a clean, durable lane↔orchestration channel.
- **Client-side opener = free greeting; pay only when engaged.** A general "spend the LLM only on real
  intent" instinct that applies beyond this bot.

## Anything else worth keeping
- Costs (real, Haiku): ~£0.002/turn, ~£0.009 (~0.9p) for a full 4-turn qualifying conversation. Comfortably
  under the 5p flag. Cost meter lives in `cis_conversation_messages.context_snapshot`.
- Contracts (for whoever maintains the backend):
  - site-bot POST `{ site, conversationId, message, meta }` → `{ ok, conversationId, reply, route, cta, intent, stage, engagement_written, cost_gbp }`.
  - site-lead POST `{ site, lead_type, name, email, message, consent, path, referrer, ts }` → `{ ok:true }` (non-2xx → form falls back to mailto).
- `REQUESTS-TO-ORCHESTRATION.md` holds the full REQ-001…006 log with verification evidence.
