# icons/ — CIS / Scout panel icon set

Sixteen glyphs for the CIS / Scout browser panel: eight quick actions, six tabs,
two header controls. Round four, geometric wing with controlled optical
softening, resolved against the round-four ruling.

**Status: finalisation candidate.** Every alternative is ruled on and every
mandatory correction applied, but the set is not locked until `FINALISATION.html`
has been reviewed. Four things in it need a human eye and are listed in its
final section. Stage marks and the Notion icon tier are deliberately not
started — the ruling holds them until the sixteen are locked.

**Generated, not hand-drawn here.** Every SVG is written by `build-icons.mjs`,
which holds the glyph data and the drawing rules. Never edit an SVG in this
folder by hand: the next build overwrites it and the masters silently stop
matching the reviewed sheet.

```
node build-icons.mjs                                  # write the masters
node check-icons.mjs                                  # measure them; non-zero if any fail
node check-icons.mjs --json > checks.json
node build-sheet.mjs checks.json                      # regenerate the review sheet
```

## Files

```
colour/            24×24 masters, brand colours baked in
mono/              the same glyphs in currentColor (canonical ink is #152420)
small/             16px masters, for the four glyphs whose 24px drawing
                   demonstrably fails at actual size
icons.json         manifest: id, role, group, tab, rotational pair, state
                   specifications, and the reason each glyph is drawn as it is
FINALISATION.html  the review sheet — the sixteen in row order, all states,
                   measured geometry, the full 120-pair collision matrix
source/            the round-four design sheet the set descends from
build-icons.mjs    writes the masters
check-icons.mjs    measures safe margin, optical centre and 16px collisions
build-sheet.mjs    writes FINALISATION.html
```

**If you are an agent picking an icon for a CIS surface:** read `icons.json`, not
this file. Match on `role` first — it is what tells you whether an action is safe
or consequential — then on `id`. Use `small/` at 16px where it exists. Never
recolour a glyph to fit a layout; the colours carry meaning.

## The grammar

| | |
|---|---|
| Grid | 24×24, 2px safe margin, 1.7 stroke, round caps and joins |
| Read | Open or receptive geometry, predominantly outline, movement inward. No solid marker anywhere in the glyph. |
| Write / spend | A closed destination or committed terminal plus one solid orange consequence marker — the only filled mass, so the distinction survives monochrome. |
| The ring | Not used. The panel header lockup carries the mark; a ring at icon scale reads as the logo. |
| Rotation | Genuine counterparts are one composition under `rotate(180 12 12)`, never a mirror. Such a composition **must** be centred on (12,12), or its counterpart leaves the box. |
| Selected tab | Ground tint plus a 2px deep-teal underline, carried by the container. The glyph never changes colour. |
| Surface | Action icons sit on **white**. Orange measures 2.99:1 on cream and fails the 3:1 floor for non-text UI; on white it is 3.20:1. The brand orange is not forked. |

## Why the checks exist

`check-icons.mjs` measures the **inked** extent — geometry plus half the stroke —
rather than the path bounding box, and rasterises every glyph at actual 16px to
score all 120 pairs for silhouette overlap. It is not ceremony. Between rounds
three and four it caught, in order:

- a wing translated outside the 24px box, so only its tail rendered;
- three glyphs breaking the 2px safe margin, one of them on both sides, which
  had survived four rounds of visual review;
- a handset drawing at 1.36 stroke instead of 1.7, because it had been scaled
  without dividing the stroke width back out;
- a write-role pair carrying no filled mass at all, and so drawn to the read
  grammar it is supposed to contrast with;
- and a collision this round introduced, caught and reduced before it shipped.

None of those are visible on a design sheet at 24px. Run the checks before
committing a change to any glyph.
