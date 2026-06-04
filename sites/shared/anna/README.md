# ANNA — shared website bot widget

The conversational front door for the IC family of sites. Vanilla JS + CSS, no
build step. Talks to the `site-bot` Supabase edge function (Haiku, one LLM call
per turn; transcript + qualified engagements written back to Supabase).

## What's here
- `anna.js`  — the widget (launcher, panel, turn loop, CTA rendering).
- `anna.css` — brand-styled (IC teal/orange; uses the host page's Montserrat/Open Sans).

These are the **canonical** copies. Each site serves its own copy from its Vercel
root folder (per-site root dirs mean a parent `shared/` folder is not served).

## Cloning to another site (the recipe)
1. Copy `anna.js` + `anna.css` into that site's folder (e.g. `sites/rethinkingwork.life/`).
2. In the copied `anna.js`, edit the `CONFIG` block at the top:
   - `site` — a short slug (used for attribution + the session key).
   - `subtitle`, `opener`, `launcherLabel` — per-brand voice.
   - `endpoint` — leave as-is (one shared edge function serves every site;
     `site` distinguishes them). Override per-site brand colours in `anna.css`
     `.anna-root` custom properties if the palette differs.
3. In that site's `index.html`: add `<link rel="stylesheet" href="/anna.css">` in
   `<head>`, `<script src="/anna.js" defer></script>` before `</body>`, and add
   `onclick="ANNA.open();return false;"` to the page's primary CTA buttons.

## Backend
Edge function source: `cis-data-pipeline/supabase/functions/site-bot/index.ts`.
Model + provider are env-driven (`SITE_BOT_MODEL`, `LLM_PROVIDER`) per DEC-102.
