# Domain sites

Four on-brand, static landing pages — one folder per domain, each a single
`index.html`. **Zero build step**: each deploys to Vercel as a static project
(framework preset "Other"). Mobile-first, responsive, with tasteful
hover/scroll transitions and a brief HTML comment block at the top of each file
explaining its structure so they're easy to edit later.

Brand family (canonical — Notion "IC Brand Guide" + `cis-portals/lib/brand.js`):
Teal `#1B9894` · Deep Teal `#156E6B` · Orange `#E1702F` · Cream `#F8F7F4` ·
Charcoal `#2D2D2D`. Fonts: Montserrat (headings) + Open Sans (body) via Google
Fonts. Each site takes its own accent within the family so they're a family, not
four clones.

| Folder | Domain | Theme | Accent |
|--------|--------|-------|--------|
| `schoolofthought.life/`    | schoolofthought.life    | A calm, foundational **thinking space** — John as thinking partner; "create time and space, explore your thoughts, discover what matters, find your flow" + walking-and-talking. | Deep teal, airy cream |
| `rethinkingwork.life/`     | rethinkingwork.life     | The thinking space **for companies**, built on **Recruit · Retain · Realise** — the philosophy that powers Inspiring Connections. | Teal + orange CTA |
| `rethinkingwork.co.uk/`    | rethinkingwork.co.uk    | **smartreach** — email **outreach at scale, done like a human**. The engine sister to `.life`. | Orange-led (warm/action) |
| `inspiringconnections.io/` | inspiringconnections.io | **Relationship intelligence** — the flagship IC brand behind the CIS. ERIC+ANNA, the connection loop, CQ/PMQ/Impact Score, trust guardrails. | Deep-teal hero, orange CTA |

## Shared assets
- `shared/brand.css` — canonical design tokens + components (the reference each
  page should converge on). **For deploy independence, every `index.html` is
  currently self-contained** (its own inline `<style>`/`<script>` mirroring the
  shared file) so it works even when its folder is the Vercel deploy root.
- `shared/reveal.js` — the fade-in-on-scroll enhancement (also inlined per page).

If you want a site to use the shared file instead of its inline copy, deploy
with `sites/` as the project root and link `../shared/brand.css`, or copy
`brand.css` into the site folder.

## Real brand material used (grounded in John's own words)
Copy was grounded in John's actual material via Google Drive + Notion — not
invented. Key sources:
- Notion **IC Brand Guide (Canonical)** — `358847f3-4950-4a74-a236-d4e71220ae54`
  ("Purposeful connection unlocks potential"; ERIC/ANNA; locked butterfly logo
  concept; banned-words list; palette).
- Notion **John Bennett — Personal Voice Doctrine v1.1** —
  `31fe26ae-726e-81e9-a945-e4a0a82f54e8` (School of Thought line, walking-and-
  talking, "teams outperform companies", "the tools tell you what, we tell you
  why", "unleashing people's potential").
- Drive **smartreach Vision** (`1MHDKo6DFHRE8RoRZziOgN-EOt-rL1M3v`) and
  **smartreach RE analysis** (`1fxWQy2xWAzb7u-_r7uJDuViYMiL-Floe`) — the
  consultative-outreach definition and the "trust is the thing that could kill
  it" line.
- Drive **IC Platform Explainer** (`1mLVDKjnshM6iMwfSnssqfUWFlTL3nDLI`) — the
  Signal→Spark→Align→Connect→Adapt loop, CQ/PMQ/Impact Score, Growth/Impact
  Partners, governance guardrails.

## Logos — found in Drive (fileIds recorded; NOT embedded — placeholders used)
Each page currently uses a clean inline-SVG **placeholder** mark (clearly marked
in the HTML comments). Swap for real exports when ready.

**School of Thought — John has TWO logos**, including a **business one: a circle
with two faces and a business message around the rim.** A clean export of that
specific circular business mark has **not** been located yet. Candidates to
check (likely sources for it):
- `Secondary Circular Logos Transparent-02.psd` — `1bittLw807tr2Tsqy_F932ktyDpx4zC6A`
- `Secondary Circular Logos Transparent-orange.psd` — `1UgrmOTz0XUVc81oQYm9vP2wAarHC5oxT`
The two-faces concept origin is documented in the Voice Doctrine ("the original
IC butterfly logo with the two faces came from this philosophy"). The SoT page
header has a placeholder two-profiles-in-a-circle SVG ready to be replaced.

**Inspiring Connections / Rethinking Work logos (Drive):**
- `IC_logo_primary_circle.svg` — `1OBYXLrEsQE3wyohW5fvJ3AhWejR484F-`
- `IC_logo_compact.svg` — `1okZ0lVKw8oPFTuFbH4UD7Eawj3Xe4QUd`
- `Inspiring Connections Logo.png` — `1bq0VP_NeiJFh8-YnHrebH7Fv4b7fxTWj`
- `Rethinking Work - Logo.png` — `1MEBWO-C7kUTQECkGexztk14d5oX2Nen6`
- `LinkedIn-Banner-Inspiring-Connections.png` — `12rrq5G4nL0adyrU2ryUiOtXO7-kgaJJ8`
- `LinkedIn-Banner-Rethinking-Work.png` — `1l4wdde550fDSRJiJo6Mnf7c4vCrOcDBG`

## Deploy (morning, ~5 min together)
For each site: create a Vercel project (root = the site folder, framework =
"Other / static"), deploy, then add the custom domain in Vercel and point DNS
at the registrar (Vercel shows the exact A/CNAME records). DNS needs John's
registrar login — the only step Claude can't do unattended.

## Open questions / placeholders for John
- **SoT circular business logo** (faces + rim message): supply the clean export
  to replace the placeholder mark.
- **smartreach stats band** (`rethinkingwork.co.uk` #stats): swap the indicative
  tiles for real campaign metrics (reply rate, meetings booked, etc.).
- **rethinkingwork.co.uk vs .life**: now clearly distinct (`.co.uk` = smartreach
  outreach engine; `.life` = consultancy/philosophy). Confirm you're happy
  keeping both rather than redirecting one.
- Replace `mailto:` CTAs with a Calendly/booking link if preferred.
