# ANNA — shared website bot widget

The conversational front door for the Rethinking Work family of sites. Vanilla
JS + CSS, no build step. Talks to the orchestration-owned `site-bot` Supabase
edge function (Haiku, one LLM call per turn; transcript + qualified engagements
written back server-side).

## What's here (canonical copies)
- `anna.js`  — the widget (launcher, panel, turn loop, CTA rendering, client-side
  rate-limit, self-learning `meta` capture, optional per-site brand tint).
- `anna.css` — brand-styled (IC teal/orange; uses the host page's Montserrat/Open Sans).

`anna.js` ships **identical** to every site. Per-site differences live in a small
`window.ANNA_CONFIG` block in each page — nothing in these two files changes per site.

## Live on
- `inspiringconnections.io` — uses the built-in IC defaults (no config block needed).
- `rethinkingwork.life`, `rethinkingwork.co.uk` (smartreach), `schoolofthought.life`
  — each carries a `window.ANNA_CONFIG` block (site slug, opener, subtitle, launcher).

## Cloning to another site (the recipe)
1. Copy `anna.js` + `anna.css` into that site's folder (per-site Vercel root dirs mean a
   parent `shared/` folder is not served, so each site serves its own copy).
2. In that site's `index.html`:
   - `<link rel="stylesheet" href="/anna.css">` in `<head>`.
   - Before `</body>`, a config block then the script:
     ```html
     <script>
     window.ANNA_CONFIG = {
       site: "your-slug",                 // distinguishes the site server-side
       launcherLabel: "Chat to ANNA",
       subtitle: "one warm line",
       opener: "The first thing ANNA says (client-side, costs nothing).",
       // optional: brand: { primary:"#…", primaryHi:"#…", accent:"#…", accentD:"#…" }
     };
     </script>
     <script src="/anna.js" defer></script>
     ```
   - Add `onclick="ANNA.open();return false;"` to the page's primary CTA buttons.
3. The `endpoint` defaults to the shared edge function — leave it. The `site` slug is
   how the backend tells the brands apart.

## IMPORTANT — per-site VOICE is server-side
The opener is client-side (per brand, free). Every **reply after that** comes from the
`site-bot` edge function, which today runs ONE persona (IC / ANNA) for all sites. Until
orchestration adds per-`site` system prompts + routing, replies on the non-IC sites will
speak in the IC default voice. Tracked in `ic-assets/REQUESTS-TO-ORCHESTRATION.md`.

## Backend (owned by orchestration, not this repo)
Edge function: `cis-data-pipeline/supabase/functions/site-bot/index.ts`.
Model/provider env-driven (`SITE_BOT_MODEL`, `LLM_PROVIDER`) per DEC-102.
Anything needing the backend, DB, env, a DEC, or domain mapping → write it to
`ic-assets/REQUESTS-TO-ORCHESTRATION.md`; orchestration actions it.
