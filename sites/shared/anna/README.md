# ANNA — shared website bot widget

The conversational front door for the IC family of sites. Vanilla JS + CSS, no
build step. Talks to the `site-bot` Supabase edge function (Haiku, one LLM call
per turn; transcript + qualified engagements written back to Supabase).

## What's here
- `anna.js`  — the widget (launcher, panel, turn loop, CTA rendering).
- `anna.css` — brand-styled (IC teal/orange; uses the host page's Montserrat/Open Sans).

These are the **canonical** copies. Each site serves its own copy from its Vercel
root folder (per-site root dirs mean a parent `shared/` folder is not served).

## Conversation flow (CIS-CC-ICWEB-001, 2026-06-04)

ANNA runs a four-stage qualify → match signal → prove → refer flow:

1. **Qualify** — ANNA uncovers the visitor's need (hire / partnership / service / intro).
   Warm, curious. Maximum 2–3 turns to establish the need.

2. **Match signal** — When the edge fn identifies a need, it returns `match_signal: true`
   in the JSON response. ANNA shows a transient "Checking the network…" chip and signals
   the platform knows people.

3. **Prove** — ANNA surfaces the proof line: Connection / Growth / Impact partner taxonomy,
   and how introductions work (Connection Cards, not cold emails).

4. **Refer** — Route to one of three CTAs based on `cta.type` in the edge fn response:
   - `meeting_cta`  → Calendly/mailto (CONFIG.meetingUrl placeholder)
   - `card_cta`     → Connection Card intent, stored via edge fn; the free intro line is
                      appended automatically: "Your first introduction is on us."
   - `nurture_cta`  → nurture / follow-up fallback

## Edge fn contract (JSON response shape)

```json
{
  "ok": true,
  "conversationId": "uuid",
  "reply": "ANNA's response text",
  "match_signal": false,
  "cta": {
    "type": "card_cta",
    "label": "Request a Connection Card"
  }
}
```

`match_signal` and `cta` are optional; omit both for plain conversational turns.

## Cloning to another site (the recipe)
1. Copy `anna.js` + `anna.css` into that site's folder (e.g. `sites/rethinkingwork.life/`).
2. In the copied `anna.js`, edit the `CONFIG` block at the top:
   - `site` — a short slug (used for attribution + the session key).
   - `subtitle`, `opener`, `launcherLabel` — per-brand voice.
   - `meetingUrl` — meeting booking URL for that site's primary CTA.
   - `endpoint` — leave as-is (one shared edge function serves every site;
     `site` distinguishes them). Override per-site brand colours in `anna.css`
     `.anna-root` custom properties if the palette differs.
3. In that site's `index.html`: add `<link rel="stylesheet" href="/anna.css">` in
   `<head>`, `<script src="/anna.js" defer></script>` before `</body>`, and add
   `onclick="ANNA.open();return false;"` to the page's primary CTA buttons.

## Backend
Edge function source: `cis-data-pipeline/supabase/functions/site-bot/index.ts`.
Model + provider are env-driven (`SITE_BOT_MODEL`, `LLM_PROVIDER`) per DEC-102.
The edge fn MUST return `match_signal` (bool) and optional `cta.type` to drive
the qualify→refer flow described above.
