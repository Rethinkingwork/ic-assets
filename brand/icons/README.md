# icons/ — CIS / Scout panel icon set

Sixteen glyphs for the CIS / Scout browser panel: eight quick actions, six tabs,
two header controls. Round four, geometric wing with controlled optical softening.

**Generated, not hand-copied.** Every file here is written by `build-icons.mjs`,
which ports the glyph data and the drawing rules verbatim out of the round-four
design sheet in `source/`. Change the sheet, re-port, re-run — never edit an SVG
in this folder by hand, or the masters and the approved drawings will drift.

```
node build-icons.mjs
```

## Files

```
colour/     24×24 masters, brand colours baked in
mono/       the same glyphs in currentColor (canonical ink is #152420)
icons.json  machine-readable manifest: id, role, group, tab, alternative,
            rotational pair, and the one-line "why" for each glyph
source/     the design sheet these are generated from, and the record of
            why each glyph is drawn the way it is
build-icons.mjs
```

**If you are an agent picking icons for a CIS surface:** read `icons.json`, not
this file. Match on `role` first — it is what tells you whether an action is
safe or consequential — then on `id`. Never recolour a glyph to fit a layout;
the colours carry meaning.

Twenty-one masters cover the sixteen slots: three glyphs (Draft, Credit
balance, Workspace switcher) still ship both alternatives, and Credit balance
also ships its low-balance warning state.

## The grammar these are drawn to

| | |
|---|---|
| Grid | 24×24, 2px safe margin, 1.7 stroke, round caps and joins |
| Read | Open or receptive geometry, predominantly outline, movement inward. No solid marker anywhere in the glyph. |
| Write / spend | A closed destination or committed terminal plus one solid orange consequence marker — the only filled mass, so it survives monochrome. |
| The ring | Only where a context is genuinely held, bounded or switched. Appears once, in Workspace switcher A. |
| Rotation | Genuine counterparts are one composition under `rotate(180 12 12)`, never a mirror. That is the mark's own construction rule. Log sent / Log reply and Chat use it. |
| Selected tab | Ground tint plus a deep-teal underline, carried by the container. Never orange, so it cannot read as a write action. |
| One motif each | Where the wing appears it is a corner, a terminal or a speech form — not a second idea layered on the first. |

Colour is functional, not decorative: teal `#1B9894` is structure, deep teal
`#156E6B` is the read accent, orange `#E1702F` marks consequence. The read/write
distinction does not depend on hue alone — the geometry carries it too.

## Not finished yet

1. **Three alternatives are unresolved** — Draft A/B, Credit balance A/B,
   Workspace switcher A/B. Both of each are exported. Once ruled on, delete the
   loser and drop the `-a`/`-b` suffix.
2. **Log sent / Log reply want redrawing.** They are round-three drawings carried
   forward unrevised. The round-three fault (the wing translated outside the 24px
   box, so only its tail rendered) is fixed in this geometry — measured and
   confirmed — but the pair has not had a round-four pass.
3. **Fields was never presented for evaluation.** It existed only inside the tab
   strip of the round-four sheet, so it appears in no family cell, no silhouette
   row and no collision audit. It is exported here as `tab-fields.svg`, but it is
   the least scrutinised glyph in the set.
4. **16px optically corrected variants** are not exported. Optical correction is
   a drawing decision, not something a build script can infer, so these need
   drawing where the counters need it — Credit balance A's segments and Copy's
   overlap are the likely candidates.

## Measured geometry audit

Bounding boxes measured on the exported files (geometry, plus half the stroke
width where the shape is stroked). Safe area is 2 → 22.

| Glyph | Finding |
|---|---|
| `log-call-outcome` | **Breaks the safe margin.** The handset's stroke reaches x ≈ 0.24, against a 2px floor, and the glyph's optical centre sits at (11.4, 11.3). The `translate(-0.6 2.4) scale(0.8)` on a 24-grid handset path pushes it off the grid; it wants re-fitting. |
| `import-linkedin-dossier` | Optical centre at x ≈ 14.2 — the glyph sits 2.2px right of centre, so it will read as shoved right in a square button. |
| `tab-worklist` / `tab-draft-a` / `tab-fields` | Centres 1.2–1.6px off. Worklist's lean is arguably deliberate (spine left, veins right); Draft A and Fields look unintentional. |
| `copy-outreach-prompt` | Reaches y ≈ 22.1, marginally over the safe line. Cosmetic. |
| Everything else | Inside the safe area, centres within ~1px. |

## Contrast

Measured against WCAG's 3:1 minimum for non-text UI.

| Colour | On cream `#F8F7F4` | On white |
|---|---|---|
| Teal `#1B9894` | 3.29 | 3.52 |
| Deep teal `#156E6B` | 5.64 | 6.04 |
| Orange `#E1702F` | **2.99** | 3.20 |
| Ink `#152420` | 15.02 | 16.09 |

The orange consequence marker is the one element in the system doing safety work
— it is what tells an operator a click will write or spend — and on a cream
ground it lands at 2.99:1, a hair under the minimum. On white it passes. Either
put the icons on white in the panel, or darken the marker slightly for icon use
only (roughly `#D2651F` clears 3.4:1 on cream) while leaving the brand orange
untouched everywhere else.

One pair is missing from the sheet's collision audit: **`pull-linkedin-info` and
`tab-fields`** are both a bare wing with two short strokes to its right. At 16px
in monochrome they are the closest pair in the set, and neither the audit nor the
silhouette row shows them together.
