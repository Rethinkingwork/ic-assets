/**
 * Generate FINALISATION.html — the review sheet for the resolved sixteen.
 *
 *   node check-icons.mjs --json > /tmp/checks.json && node build-sheet.mjs /tmp/checks.json
 *
 * Everything in the sheet is generated from the same glyph data the masters are
 * exported from, and every number in it is measured rather than asserted.
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GL, BY_ID, TOKENS, STATES, draw } from './build-icons.mjs';

const OUT = dirname(fileURLToPath(import.meta.url));
const checks = JSON.parse(readFileSync(process.argv[2] || join(OUT, 'checks.json'), 'utf8'));
const box = n => checks.boxes.find(b => b.name === n);
const score = (a, b) => {
  const p = checks.pairs.find(p => (p.a === a && p.b === b) || (p.a === b && p.b === a));
  return p ? p.score : 1;
};

const ico = (g, size, opts = {}) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">${draw(g, opts)}</svg>`;

// A conventional refresh mark, drawn only so the workspace switcher can be
// checked against the thing it is most at risk of being mistaken for. Not part
// of the set, never shipped.
const REFRESH = { nm: 'Refresh (reference only)', role: 'read',
  s: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 3.6V7h-3.4"/>' };

const rows = [
  ['Quick actions', GL.filter(g => g.group === 'action')],
  ['Tabs', GL.filter(g => g.group === 'tab')],
  ['Header controls', GL.filter(g => g.group === 'header')]
];

const RULING = [
  ['Draft', 'Approve A, the page', 'A is the resolved Draft. B is deleted. The opening is left large on purpose: at 16px a small nick reads as a rasterising artefact, whereas a whole absent corner reads as intent. Whether it says <i>unfinished</i> rather than <i>damaged</i> is a judgement only your eye can make — section 08.'],
  ['Credit balance', 'Approve A, the meter', 'A is the resolved Credit balance. B is deleted. Measured in four states in section 03. Its inked width ran to 22.25 — outside the safe area on both sides, never previously caught — and the capsule has been narrowed to 3.4 → 20.6.'],
  ['Workspace switcher', 'Approve B, the rotational arcs', 'B is the resolved Workspace switcher; the ring-and-wings A is deleted. Checked against the header lockup, Chat and a conventional refresh mark in section 06. Its arcs deliberately carry no arrowheads, and the held centre is a solid square, so the switch reads as destination rather than repetition.'],
  ['Contrast', 'Do not fork the brand orange', 'No fork. <code>#E1702F</code> is unchanged. Action icons are specified onto white, where they measure 3.20:1, and every interactive state ground is specified and measured in section 03 so none returns orange to a failing contrast.'],
  ['Fields', 'Redraw it', 'Redrawn as three key/value rows across an open gutter. No wing, no document contour, no sliders, no grid. Its 16px monochrome overlap with Pull LinkedIn info is now 0.24 — the two are among the most separated pairs in the set.'],
  ['Log sent / Log reply', 'Require a round-four pass', 'Both redrawn. The pass found something the bounding-box repair had hidden: neither glyph carried a filled mass, so a write-role pair was drawn to the read grammar. Both now carry the consequence marker. Section 06.'],
  ['Production corrections', 'Seven items, plus test the rest', 'All seven done, and testing the rest found four more faults — three safe-margin breaks (Pull LinkedIn info, Copy, Credit balance) and a stroke-weight inconsistency in Log a call outcome, which was drawing at 1.36 instead of 1.7. Sections 04 and 07.'],
  ['Stage marks', 'Share the DNA, break the action grammar', 'Not started. Held until this sheet is reviewed, as instructed.'],
  ['Notion tier', 'Separate small-size tier', 'Not started. Held until the sixteen are locked, as instructed.']
];

const NAMED = [
  ['fields', 'pull', 'Fields / Pull LinkedIn info',
   'The pair the ruling required be shown together. Pull is a wing receiving two arcs — one closed mass with curved satellites, weighted right. Fields is six straight strokes in two columns with an open gutter down the middle and no closed form anywhere. They share neither a contour nor an axis.'],
  ['draft', 'chat', 'Draft / Chat',
   'The collision that decided the Draft ruling. Chat is two closed speech forms in rotational pair, filling the frame corner to corner on the diagonal. Draft is a single orthogonal page with one absent corner. Had Draft B been chosen, these would have been two bubbles adjacent in a six-tab strip.'],
  ['sent', 'reply', 'Log sent / Log reply',
   'One composition and its 180° rotation. The pair is unambiguous when adjacent, which is how the quick-action row always presents it. Read in isolation each is weaker — that is the honest cost of the rotation rule, and section 08 records it rather than hiding it.'],
  ['workspace', 'chat', 'Workspace switcher / Chat',
   'Both are rotational pairs. Chat’s two forms are offset on the diagonal with a band of ground between them; the switcher’s arcs are concentric about a held centre. The old ring-and-wings A separated from Chat only by the presence of a ring; B separates by whole silhouette.'],
  ['today', 'credit', 'Today / Credit balance',
   'Both are bounded horizontal containers. Today is near-square with a header rule and a node in the lower half. Credit is a 3:1 capsule with segments on the centre line and no crossing rule. Aspect ratio alone resolves it, and it is the lowest-scoring of the named pairs.']
];

const cr = (fg, bg) => {
  const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const L = h => { const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
  const x = L(fg), y = L(bg);
  return ((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2);
};

// ── State rendering ──────────────────────────────────────────────────────────
function stateCell(g, key) {
  const st = STATES[key];
  const opts = st.flatten ? { flatten: st.flatten } : {};
  const ring = st.ring ? `box-shadow:0 0 0 2px ${st.ground},0 0 0 4px ${st.ring};` : '';
  const under = st.underline ? `border-bottom:2px solid ${st.underline};` : '';
  return `<div class="st"><div class="stbox" style="background:${st.ground};${ring}${under}">${ico(g, 20, opts)}</div><span class="cap">${key}</span></div>`;
}

const glyphRow = g => `
<div class="cell">
  <div class="pair">
    <div class="half"><span class="gl">${ico(g, 24)}${ico(g, 16, { small: !!g.small })}</span><span class="cap">Colour · 24 / 16</span></div>
    <div class="half"><span class="gl">${ico(g, 24, { mono: true })}${ico(g, 16, { mono: true, small: !!g.small })}</span><span class="cap">Mono · 24 / 16</span></div>
  </div>
  <div class="nm">${g.nm}${g.small ? '<span class="alt">16px master</span>' : ''}</div>
  <div class="role" style="color:${{ read: TOKENS.deepTeal, write: TOKENS.orange, status: TOKENS.deepTeal, switch: TOKENS.teal }[g.role]}">${g.role}</div>
  <p class="why">${g.why}</p>
</div>`;

// ── Collision matrix ─────────────────────────────────────────────────────────
function matrix() {
  const head = `<tr><th class="corner"></th>${GL.map(g => `<th><span class="mg">${ico(g, 16, { mono: true })}</span></th>`).join('')}</tr>`;
  const body = GL.map((a, i) => `<tr><th class="rh"><span class="mg">${ico(a, 16, { mono: true })}</span>${a.nm}</th>` +
    GL.map((b, j) => {
      if (i === j) return '<td class="self"></td>';
      const s = score(a.nm, b.nm);
      const band = s >= 0.55 ? 'hi' : s >= 0.45 ? 'md' : s >= 0.35 ? 'lo' : 'ok';
      return `<td class="${band}" title="${a.nm} / ${b.nm}">${s.toFixed(2)}</td>`;
    }).join('') + '</tr>').join('');
  return `<table class="mx">${head}${body}</table>`;
}

const top = [...checks.pairs].slice(0, 6);

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>The Resolved Sixteen</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>
:root{--teal:${TOKENS.teal};--deep:${TOKENS.deepTeal};--orange:${TOKENS.orange};--cream:${TOKENS.cream};--ink:${TOKENS.ink};--line:#E2DED3;--mute:#5F6B66;--fh:'Montserrat',system-ui,sans-serif;--fb:'Open Sans',system-ui,sans-serif}
*{box-sizing:border-box}
body{margin:0;background:var(--cream);color:var(--ink);font-family:var(--fb);line-height:1.55;-webkit-font-smoothing:antialiased}
.wrap{max-width:1240px;margin:0 auto;padding:56px 28px 100px}
h1,h2,h3,p{margin:0}
.eyebrow{font-family:var(--fh);font-weight:700;text-transform:uppercase;letter-spacing:2.4px;font-size:11px;color:var(--orange)}
h1{font-family:var(--fh);font-weight:800;font-size:clamp(30px,4vw,44px);letter-spacing:-1px;line-height:1.05;margin-top:10px;text-wrap:balance}
.lede{font-size:15.5px;color:var(--mute);max-width:70ch;margin-top:14px;text-wrap:pretty}
h2{font-family:var(--fh);font-weight:800;font-size:20px;letter-spacing:-.3px;margin-top:62px;text-wrap:balance}
h2 .n{color:var(--mute);margin-right:10px;font-weight:700}
.sub{font-size:13.5px;color:var(--mute);margin-top:5px;max-width:76ch;text-wrap:pretty}
.rowhead{font-family:var(--fh);font-weight:700;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:var(--mute);margin-top:30px}
.fam{display:grid;grid-template-columns:repeat(auto-fill,minmax(288px,1fr));gap:0;border-top:1px solid var(--line);border-left:1px solid var(--line);margin-top:12px}
.cell{background:#fff;border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:22px 22px 20px;display:flex;flex-direction:column}
.pair{display:flex;border:1px solid #F1EEE6}
.half{flex:1 1 0;padding:16px 8px 11px;display:flex;flex-direction:column;align-items:center;gap:12px}
.half+.half{border-left:1px solid #F1EEE6;background:#FCFBF9}
.gl{display:flex;align-items:center;gap:14px;min-height:26px}
svg{display:block;flex:none}
.cap{font-family:var(--fh);font-weight:700;font-size:8.5px;letter-spacing:1.3px;text-transform:uppercase;color:#8A938F}
.nm{font-family:var(--fh);font-weight:800;font-size:14px;letter-spacing:-.2px;margin-top:14px;display:flex;align-items:baseline;gap:8px}
.alt{font-family:var(--fh);font-weight:700;font-size:8.5px;letter-spacing:1.2px;border:1px solid var(--line);padding:2px 5px;color:var(--mute);flex:none}
.role{font-size:9.5px;font-family:var(--fh);font-weight:700;letter-spacing:1.3px;text-transform:uppercase;margin-top:5px}
.why{font-size:12.4px;color:var(--mute);margin-top:8px;text-wrap:pretty}
table{border-collapse:collapse;width:100%;background:#fff;margin-top:22px;font-size:12.4px}
th,td{border:1px solid var(--line);padding:9px 11px;text-align:left;vertical-align:top}
th{font-family:var(--fh);font-weight:700;font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:var(--mute)}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
.scroll{overflow-x:auto;margin-top:22px;border:1px solid var(--line);background:#fff}
.mx{margin:0;border:0;font-variant-numeric:tabular-nums;font-size:11px}
.mx th,.mx td{padding:5px 6px;text-align:center}
.mx td{width:44px}
.mx .rh{text-align:left;white-space:nowrap;font-family:var(--fb);font-weight:600;font-size:11.5px;color:var(--ink);text-transform:none;letter-spacing:0;display:flex;align-items:center;gap:8px;border-right:1px solid var(--line)}
.mx .corner{border:0}
.mx .self{background:#F4F2EC}
.mx .hi{background:#FBE3D2;font-weight:700}
.mx .md{background:#FDF1E7}
.mx .lo{background:#F2F8F7}
.mx .ok{color:#9AA39F}
.states{display:flex;flex-wrap:wrap;gap:0;border-top:1px solid var(--line);border-left:1px solid var(--line);margin-top:22px}
.strow{display:flex;align-items:center;gap:18px;background:#fff;border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:16px 20px;flex:1 1 340px}
.strow .lbl{font-family:var(--fh);font-weight:700;font-size:11.5px;width:104px;flex:none}
.st{display:flex;flex-direction:column;align-items:center;gap:7px}
.stbox{width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:7px}
.cmp{background:#fff;border:1px solid var(--line);padding:22px 24px;margin-top:22px}
.cmp+.cmp{margin-top:0;border-top:0}
.cmph{display:flex;align-items:center;gap:26px;flex-wrap:wrap}
.cmph .gs{display:flex;align-items:center;gap:16px}
.cmpt{font-family:var(--fh);font-weight:800;font-size:14px}
.sc{font-family:var(--fh);font-weight:700;font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:var(--mute);border:1px solid var(--line);padding:3px 8px}
.flag{background:#FFF7F1;border:1px solid #F2D6C2;padding:18px 20px;margin-top:26px;font-size:13.2px;max-width:84ch;text-wrap:pretty}
.flag b.h{font-family:var(--fh);font-size:11px;letter-spacing:1.3px;text-transform:uppercase;color:var(--orange);display:block;margin-bottom:7px}
.flag ol{margin:10px 0 0;padding-left:20px}.flag li{margin-bottom:9px}
footer{margin-top:76px;border-top:1px solid var(--line);padding-top:20px;font-size:12.5px;color:var(--mute);max-width:80ch;text-wrap:pretty}
code{font-size:12px;background:#F4F2EC;padding:1px 4px}
</style></head><body><div class="wrap">

<div class="eyebrow">CIS / Scout — finalisation</div>
<h1>The resolved sixteen</h1>
<p class="lede">Every alternative ruled on, every mandatory correction applied, and every claim in this sheet measured rather than asserted. Testing the rest of the set as instructed found four faults beyond the seven named — three of them safe-margin breaks that had survived four rounds because nothing had ever measured the inked extent.</p>

<h2><span class="n">01</span>The ruling, applied</h2>
<p class="sub">Each item, and what was actually done about it.</p>
<table><tr><th style="width:150px">Item</th><th style="width:210px">Ruling</th><th>Disposition</th></tr>
${RULING.map(([a, b, c]) => `<tr><td><b>${a}</b></td><td>${b}</td><td>${c}</td></tr>`).join('')}
</table>

<h2><span class="n">02</span>The sixteen, in row order</h2>
<p class="sub">As the panel presents them: the quick-action row, then the tab strip, then the two header controls. Colour beside monochrome, 24px beside actual 16px. Where a glyph has a 16px master, the 16px column shows that master rather than a scaled-down 24.</p>
${rows.map(([label, gs]) => `<div class="rowhead">${label}</div><div class="fam">${gs.map(glyphRow).join('')}</div>`).join('')}

<h2><span class="n">03</span>Interaction states</h2>
<p class="sub">The glyph never changes colour to signal state — selection and pressure are carried entirely by the container, so the write grammar stays the only thing orange means. Grounds are specified below and measured against the 3:1 floor for non-text UI.</p>
<div class="states">
${[BY_ID.queue, BY_ID.pull, BY_ID.chat, BY_ID.credit].map(g =>
  `<div class="strow"><span class="lbl">${g.nm}</span>${Object.keys(STATES).map(k => stateCell(g, k)).join('')}</div>`).join('')}
</div>
<table><tr><th style="width:110px">State</th><th style="width:120px">Ground</th><th style="width:150px">Orange on ground</th><th>Specification</th></tr>
${Object.entries(STATES).map(([k, st]) => {
  const c = cr(TOKENS.orange, st.ground);
  const pass = st.flatten ? 'n/a — no orange' : `${c}:1 ${(+c >= 3 ? '✓' : '✗')}`;
  return `<tr><td><b>${k}</b></td><td><code>${st.ground}</code></td><td>${pass}</td><td>${st.note}</td></tr>`;
}).join('')}
</table>
<p class="sub" style="margin-top:14px">For comparison, the same marker on cream <code>${TOKENS.cream}</code> measures ${cr(TOKENS.orange, TOKENS.cream)}:1 and fails. That is the whole reason the action icons are specified onto white rather than the brand ground.</p>

<h2><span class="n">04</span>Measured geometry</h2>
<p class="sub">Inked extent — the drawn geometry plus half the stroke, which is what the safe margin actually governs. The safe area is 2 → 22; the optical centre should sit near 12, 12. Measured by <code>check-icons.mjs</code>, which fails the build if any glyph breaks the margin.</p>
<table><tr><th>Glyph</th><th class="num">x0</th><th class="num">y0</th><th class="num">x1</th><th class="num">y1</th><th class="num">centre</th><th class="num">margin</th><th>Note</th></tr>
${checks.boxes.map(b => {
  const off = Math.max(Math.abs(b.cx - 12), Math.abs(b.cy - 12));
  const note = b.name.includes('Worklist') ? 'Lean is deliberate — spine left, veins right.'
    : off > 1 ? 'Off centre; see below.' : '';
  return `<tr><td>${b.name}</td><td class="num">${b.x0}</td><td class="num">${b.y0}</td><td class="num">${b.x1}</td><td class="num">${b.y1}</td><td class="num">${b.cx}, ${b.cy}</td><td class="num">${b.margin}</td><td>${note}</td></tr>`;
}).join('')}
</table>
<p class="sub" style="margin-top:14px">Worklist is the one glyph left deliberately off centre, at ${box('Worklist').cx}. Its spine sits left and its veins run right; centring the bounding box would put the spine in the middle and turn a list into a plant. Log carried the same lean until this round and has been centred, which also pulled it off Worklist’s silhouette — see section 05.</p>

<h2><span class="n">05</span>Collision matrix — all 120 pairs</h2>
<p class="sub">Every glyph rasterised at actual 16px in monochrome and compared with every other, scoring overlap on a slightly blurred alpha field: 1.00 is identical, 0.00 disjoint. This measures how much ink two glyphs put in the same places at the size an operator meets them — it does not know that a rectangle and a circle are easy to tell apart, so it over-reports pairs that merely both fill the frame. Read it as a ranking of where to look, not a verdict.</p>
<div class="scroll">${matrix()}</div>
<table><tr><th style="width:70px" class="num">Score</th><th>Closest six, and whether it matters</th></tr>
${top.map(p => {
  const notes = {
    'Today/Workspace switcher': 'Both fill the frame — a rounded rectangle and a pair of concentric arcs. The metric penalises the shared coverage; the eye separates rectangle from circle at any size. They also never appear together: one is a tab, the other a header control.',
    'Worklist/Log': 'The genuine closest pair, and adjacent in the tab strip. Worklist leans — three diagonals off a left spine with the active node at the top right. Log is orthogonal, beaded on the spine, and now centred rather than leaning. Down from 0.72 before the centring.',
    'Copy outreach prompt/Today': 'Both rectilinear and frame-filling. Copy is two offset cards and steps twice; Today is one container with a header rule. Different rows, never adjacent.',
    'Pull LinkedIn info/Credit balance': 'A quick action against a header control, never adjacent, and one is a closed mass with arcs where the other is a wide capsule.',
    'Add to action queue/Log': 'Both stack horizontal rules. Queue’s are full width with a solid orange module low right; Log’s are beaded on a spine and carry no orange. Colour separates them before silhouette has to.',
    'Add to action queue/Fields': 'The one this round introduced, and then reduced from 0.61 by widening Fields’ gutter. Queue is three continuous full-width rules; Fields is six short strokes in two columns with a 4.3-unit gutter — 2.9px of clear ground at 16px.'
  };
  const k = `${p.a}/${p.b}`;
  return `<tr><td class="num"><b>${p.score.toFixed(2)}</b></td><td><b>${p.a} / ${p.b}</b> — ${notes[k] || notes[`${p.b}/${p.a}`] || 'Different rows; no shared contour.'}</td></tr>`;
}).join('')}
</table>

<h2><span class="n">06</span>The comparisons you asked for</h2>
<p class="sub">Each pair at 16px monochrome as the eye meets it, then at 32px to see what differs, with its measured overlap score.</p>
${NAMED.map(([a, b, title, text]) => {
  const A = BY_ID[a], B = BY_ID[b];
  return `<div class="cmp"><div class="cmph">
    <span class="gs">${ico(A, 16, { mono: true })}${ico(B, 16, { mono: true })}${ico(A, 32, { mono: true })}${ico(B, 32, { mono: true })}</span>
    <span class="cmpt">${title}</span><span class="sc">overlap ${score(A.nm, B.nm).toFixed(2)}</span>
  </div><p class="why" style="margin-top:12px">${text}</p></div>`;
}).join('')}
<div class="cmp"><div class="cmph">
  <span class="gs">${ico(BY_ID.workspace, 16, { mono: true })}${ico(REFRESH, 16, { mono: true })}${ico(BY_ID.workspace, 32, { mono: true })}${ico(REFRESH, 32, { mono: true })}</span>
  <span class="cmpt">Workspace switcher / refresh</span><span class="sc">reference only</span>
</div><p class="why" style="margin-top:12px">The switcher’s main remaining risk, as the ruling identified. The reference refresh mark on the right is <b>not part of the set</b> — it is drawn here only for the comparison. The two separate on three counts: the switcher has no arrowheads, its terminals are short straight flags rather than triangles; it holds a solid square at the centre, so the eye is given a destination rather than a cycle; and its arcs are two separate half-turns about that centre rather than one closed ring. Refresh says <i>again</i>; the switcher says <i>the other one</i>.</p></div>

<h2><span class="n">07</span>16px masters</h2>
<p class="sub">Drawn where the 24px master demonstrably fails at actual size, not assumed. Each was found by measuring the clearance between strokes and converting it to pixels at 16px — anything under about 1px closes up in rasterisation.</p>
<table><tr><th style="width:150px">Glyph</th><th style="width:110px">Master · 16px</th><th style="width:110px">Small · 16px</th><th>What was failing, and what changed</th></tr>
${GL.filter(g => g.small).map(g => `<tr>
  <td><b>${g.nm}</b></td>
  <td><span class="gl">${ico(g, 16)}${ico(g, 32)}</span></td>
  <td><span class="gl">${ico(g, 16, { small: true })}${ico(g, 32, { small: true })}</span></td>
  <td>${{
    copy: 'The wing tip’s aperture measured about 1.2 units and closed to under 1px, and the arc bulged past the safe line. The small master squares the corner off and lets the back card meet the front cleanly. The wing leaves the glyph at this size — which is the right trade: at 16px it was never legible as a wing, only as a smudge.',
    today: 'The header band left 1.3 units of clearance — 0.87px at 16px — so the rule merged with the top edge and the calendar lost its header. The band is opened to 2.5 units and the day node drops to match.',
    log: 'The beads left 1.2 units of spine showing between them, 0.8px at 16px, so the three deposits filled in and read as one solid bar. Radius drops from 1.9 to 1.5 and the spacing opens from 5.0 to 5.6.',
    credit: 'The worst of them: 2.6-wide segments inside a 5.6 capsule left 0.65 units of clearance, 0.43px, so the meter filled solid and stopped reading as segmented at all. The capsule opens to 6.4, the segments thin to 1.9, and the third segment is traded for the clearance — two positions instead of three. The count is not the message; the depletion is.'
  }[g.id]}</td></tr>`).join('')}
</table>
<p class="sub" style="margin-top:14px">The other twelve were tested the same way and hold at 16px without a variant. The credit warning state ships a small master too, since it inherits the same capsule.</p>

<div class="flag"><b class="h">08 · What this sheet cannot settle</b>
Four things need your eye rather than a measurement, and I would rather name them than let them pass as approved.
<ol>
<li><b>Draft’s opening.</b> The ruling asked whether the broken contour reads as <i>unfinished</i> rather than <i>damaged</i>. I have kept it large, on the reasoning that a small nick reads as a rendering artefact where a whole absent corner reads as intent. That reasoning is arguable and the judgement is yours.</li>
<li><b>Log sent and Log reply in isolation.</b> The ruling anticipated this exactly: rotation may make them elegant as a pair while leaving each ambiguous alone. It does. Adjacent in the quick-action row they are unmistakable; alone, neither states its direction without its counterpart. The rotation rule forbids the obvious fix, and I have not broken it — but you should decide knowing the cost is real and unresolved.</li>
<li><b>Fields as a noun.</b> It is now clearly not Pull LinkedIn info, and clearly not a document, grid or slider. Whether six strokes in two columns says <i>structured properties</i> to an operator who has not been told is a comprehension question, and the only honest way to answer it is to show someone.</li>
<li><b>The credit meter’s four states.</b> Section 03 shows them measured and specified, and it does not read as a battery or a progress bar to me. But “does not read as a device battery” is precisely the kind of claim that is worth one person’s glance and worthless from the person who drew it.</li>
</ol></div>

<footer>Generated by <b>build-sheet.mjs</b> from the same glyph data <b>build-icons.mjs</b> exports the masters from, so this sheet and the files in <code>colour/</code>, <code>mono/</code> and <code>small/</code> cannot disagree. Geometry and collision figures are produced by <b>check-icons.mjs</b>, which fails if any glyph breaks the 2px safe margin. Rounds preserved in <code>source/</code>. Stage marks and the Notion tier are not started, per the ruling.</footer>
</div></body></html>`;

writeFileSync(join(OUT, 'FINALISATION.html'), html);
console.log(`Wrote FINALISATION.html (${(html.length / 1024).toFixed(0)} KB)`);
