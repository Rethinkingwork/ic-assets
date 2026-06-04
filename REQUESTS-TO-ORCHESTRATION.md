# REQUESTS TO ORCHESTRATION (from the ic-assets / website-bot lane)

Per the scope lock, this lane (ic-assets only) cannot touch the `site-bot` edge
function, the DB, env/secrets, doctrine, decision_registry, or go to production.
Anything needing those is logged here for orchestration to action. Newest first.

---

## REQ-005 — Lead-capture endpoint + storage (`site-lead`)
**Why:** every brand site now has an inline lead-capture form (the conversion moment
for visitors who won't chat). It POSTs to
`https://kntrbfrhajtvbuupyntu.supabase.co/functions/v1/site-lead`. That function does
not exist yet, so the form currently **falls back to a prefilled mailto** to
`john@rethinkingwork.life` (no lead lost). The day the endpoint ships, the forms work
with zero front-end change.
**Ask:** build the `site-lead` edge function (verify_jwt=false, CORS, like site-bot) that
accepts the payload below and stores the lead — ideally via the SAME create-or-resolve
contact + engagement path the bot uses (source=`ic_website`/`<site>`, source_type=IC,
butterfly_stage=`signal`), so chat-leads and form-leads land in one place. Honour DEC-119
(check `cis_suppression` before storing/contacting). British English in any reply copy.
**Payload the form sends:**
```json
{
  "site": "inspiringconnections|rethinkingwork-life|smartreach|schoolofthought",
  "lead_type": "connection|people_strategy|smartreach|thinking_partner",
  "name": "…", "email": "…", "message": "…",
  "consent": true,
  "path": "/", "referrer": "https://…|null",
  "ts": "2026-06-04T…Z"
}
```
Return `{ ok: true }` on success (any non-2xx makes the form fall back to mailto).
When live, tell me and I'll confirm the endpoint URL in `capture.js` defaults (it's
already set to the URL above — only needs confirming, not changing).

## REQ-004 — Per-`site` voice + routing in the site-bot edge function
**Why:** the widget now ships on 4 brands, each sending a distinct `site` slug
(`inspiringconnections`, `rethinkingwork-life`, `smartreach`, `schoolofthought`).
The edge function currently runs ONE persona (IC / ANNA) for every site, so replies
on the three non-IC sites speak in the IC voice. Openers are correct (client-side),
but follow-up turns are not on-brand.
**Ask:** branch the system prompt + routing by `payload.site` — one persona/offer
set per brand:
- `rethinkingwork-life` — people strategy (recruit/retain/realise); route to a call.
- `smartreach` — outreach product (rethinkingwork.co.uk); route to a demo/call.
- `schoolofthought` — thinking partner/coaching; route to a gentle conversation.
- `inspiringconnections` — unchanged (current ANNA prompt).
Widget contract is already in place: `{ site, conversationId, message, meta }`.

## REQ-003 — Persist the self-learning `meta` payload
**Why:** the widget now sends a `meta` object each turn `{ path, referrer, ts, turn }`
to seed the self-learning loop. The edge function currently ignores it.
**Ask:** persist `meta` (e.g. fold into `cis_conversation_messages.context_snapshot`
alongside the existing intent/cost snapshot). No schema change needed if it goes in the
existing jsonb. This is the clean foundation for the self-learning loop.

## REQ-002 — Opt-out write to `cis_suppression` (DEC-119)
**Why:** the bot detects opt-out intent and currently honours it in conversation but
persists nothing. `cis_suppression` already exists live (do NOT build a new table).
**Ask:** when a site-bot turn returns `intent="opt_out"`, write a suppression row keyed
to the visitor's stable identity (email/linkedin if given), recording the triggering
surface (`ic_website`) + site slug, per DEC-119 (workspace-wide, indefinite).
**Payload shape the bot can provide** (confirm against the live `cis_suppression` columns):
```json
{
  "email": "<if given>",
  "linkedin_url": "<if given>",
  "reason": "website_opt_out",
  "source_surface": "ic_website",
  "site": "<site slug>",
  "captured_at": "<ISO ts>"
}
```
Tell me the exact column names and I'll have the widget/edge contract match.

## REQ-001 — Go-live (owned by orchestration + John)
For completeness — production flip is NOT this lane's to do:
- Merge the `ic-assets` branch → `main` (Vercel auto-deploys the IC domain).
- Map production domains for all 4 Vercel projects when ready.
- Decide where the 4 sites ultimately reside (stay in ic-assets vs a `cis-sites` repo).
- Purge or keep the Sarah test rows (contact 6e99cf3f…, engagement a4998fb2…).
(All also captured in `cis-data-pipeline` prompt CIS-CC-IC-GOLIVE-001.)
