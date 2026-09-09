/**
 * Export the CIS / Scout icon family as individual SVG masters.
 *
 * Source of truth: source/CIS Icon Set v3 (geometric wing).html, the round-four
 * design sheet, as amended by the round-four ruling. FINALISATION.html is the review sheet.
 * Glyph data and drawing rules are held here so the masters cannot drift.
 *
 *   node build-icons.mjs
 *
 * Writes {colour,mono}/*.svg, small/*.svg and icons.json beside this file.
 */

import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));

// Brand tokens — functional, not decorative. Unforked: the ruling declined an
// icon-only orange, so action icons sit on white where #E1702F measures 3.20:1.
export const TOKENS = {
  teal: '#1B9894',      // structure
  deepTeal: '#156E6B',  // read accent / secondary
  orange: '#E1702F',    // write / spend consequence marker
  ink: '#152420',       // monochrome
  mute: '#A8B0AC',      // disabled
  surface: '#FFFFFF',   // the ground action icons must sit on
  hover: '#F2F8F7',
  pressed: '#E8F5F3',
  cream: '#F8F7F4'
};
const { teal: T, deepTeal: D, orange: O, ink: I } = TOKENS;

// The wing module: two circular arcs meeting at a tip. One shape, rotated.
const W = 'M12 12A6 6 0 0 1 4 5 6 6 0 0 1 12 12Z';

// A conventional handset, refit to the 2px safe margin. Scaled geometry needs
// its stroke-width divided back out so it still draws at a true 1.7.
const HANDSET = 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z';
const hs = 0.628;

// Log sent: baseline, a wing rotated so its axis climbs to the upper right, and
// the consequence marker at the head of the flight. Log reply is this exact
// composition under rotate(180 12 12) — which only stays inside the box because
// the composition is centred on (12,12). That centring is load-bearing.
const SENT_S = '<path d="M4.1 20.1h9.6"/>';
const SENT_A = `<g transform="translate(3.77 2.10) rotate(-82.4 8 8.5)"><path d="${W}"/></g>`;
const SENT_F = '<circle cx="18.5" cy="5.3" r="2.2"/>';
const rot = s => `<g transform="rotate(180 12 12)">${s}</g>`;

/** The resolved sixteen, in panel row order. */
const GL = [
  // ── Quick-action row ───────────────────────────────────────────────────────
  { id: 'pull', file: 'pull-linkedin-info', nm: 'Pull LinkedIn info', role: 'read', group: 'action',
    why: 'A wing receiving two signal arcs. Lightweight extraction — outline throughout, nothing committed.',
    s: `<g transform="translate(-1.05 2.2) scale(1.15)"><path d="${W}"/></g>`,
    a: '<path d="M16 8.8a5.2 5.2 0 0 1 0 6.4"/><path d="M18.6 6.6a8.6 8.6 0 0 1 0 10.8"/>' },

  { id: 'copy', file: 'copy-outreach-prompt', nm: 'Copy outreach prompt', role: 'read', group: 'action',
    why: 'Two offset prompt cards. The wing enters as the back card’s top-right corner — two arcs meeting at a tip — so the brand sits in the fragment being copied, not in the metaphor.',
    a: '<path d="M8.2 9.4V6.6a2 2 0 0 1 2-2h6.4A3.5 3.5 0 0 1 20.4 3.9 3.5 3.5 0 0 1 19.8 8.2V13.2a2 2 0 0 1-2 2h-2.2"/><path d="M6.8 15h5.6"/>',
    s: '<path d="M5.6 9.4h8a2 2 0 0 1 2 2v6.8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-6.8a2 2 0 0 1 2-2z"/>',
    // At 16px the wing tip's aperture closes and the top edge crosses the safe
    // line. The small master squares that corner off and pulls the card down.
    small: {
      a: '<path d="M8.2 9.4V6.4a2 2 0 0 1 2-2h7.6a2 2 0 0 1 2 2v6.8a2 2 0 0 1-2 2h-2.2"/><path d="M6.8 15h5.6"/>',
      s: '<path d="M5.6 9.4h8a2 2 0 0 1 2 2v6.8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-6.8a2 2 0 0 1 2-2z"/>' } },

  { id: 'campaign', file: 'add-to-campaign', nm: 'Add to campaign', role: 'write', group: 'action',
    why: 'Three wings rising on a diagonal — a flight formation — with the solid module at the top of the climb.',
    s: `<g transform="translate(1.4 11) scale(.58)"><path d="${W}"/></g><g transform="translate(5 7.4) scale(.58)"><path d="${W}"/></g><g transform="translate(8.6 3.8) scale(.58)"><path d="${W}"/></g>`,
    f: '<circle cx="19" cy="17" r="2.4"/>' },

  { id: 'queue', file: 'add-to-action-queue', nm: 'Add to action queue', role: 'write', group: 'action',
    why: 'An ordered destination of three positions with the last one left open, and a solid module entering it from the right. Wide and striped, where Add to campaign rises diagonally.',
    s: '<path d="M4.4 6.6h13.2M4.4 12h13.2M4.4 17.4h8.2"/>',
    f: '<rect x="15" y="15.5" width="3.9" height="3.9" rx="1.15"/>' },

  { id: 'sent', file: 'log-sent', nm: 'Log sent', role: 'write', group: 'action', pairWith: 'reply',
    why: 'A wing leaving the record on a rising diagonal, with the consequence marker at the head of the flight. Round four added that marker: the pair previously carried no filled mass and so failed the write grammar it belongs to.',
    s: SENT_S, a: SENT_A, f: SENT_F },

  { id: 'reply', file: 'log-reply', nm: 'Log reply', role: 'write', group: 'action', pairWith: 'sent',
    why: 'Log sent under rotate(180 12 12) — the operation that makes the mark’s second half from its first. Enforced by the transform, so the pairing cannot drift.',
    s: rot(SENT_S), a: rot(SENT_A), f: rot(SENT_F) },

  { id: 'call', file: 'log-call-outcome', nm: 'Log a call outcome', role: 'write', group: 'action',
    why: 'A conventional handset, untouched, plus one closed outcome node. The node is the only committed mass, which is what makes it a log rather than a dial.',
    // The stroke is divided by the scale so the handset draws at a true 1.7,
    // matching the rest of the set — at 0.8 it was drawing at 1.36.
    s: `<g transform="translate(2.47 5.93) scale(${hs})" stroke-width="${(1.7 / hs).toFixed(3)}"><path d="${HANDSET}"/></g>`,
    f: '<circle cx="18.55" cy="5.95" r="2.5"/>' },

  { id: 'dossier', file: 'import-linkedin-dossier', nm: 'Import LinkedIn dossier', role: 'write', group: 'action',
    why: 'A bounded document receiving one contained bundle across a dashed boundary. Pull LinkedIn info stays a light extraction; this is a block of material crossing into the record.',
    s: '<path d="M10.2 3.8h5.6a2 2 0 0 1 2 2v12.4a2 2 0 0 1-2 2h-5.6"/>',
    a: '<path d="M11.8 7.4h4M11.8 16.6h4"/>',
    d: '<path d="M10.2 3.8V20.2"/>',
    f: '<rect x="5.4" y="9.6" width="6.6" height="4.8" rx="1.4"/>' },

  // ── Tabs ───────────────────────────────────────────────────────────────────
  { id: 'fields', file: 'tab-fields', nm: 'Fields', role: 'read', group: 'tab', tab: 'Fields',
    why: 'Three key/value rows across an open gutter: properties already arranged, where Pull LinkedIn info is information still moving inward. No contour, so it cannot be a document; no verticals, so it cannot be a grid. The value ends are set on a wing arc, which is the only family mark it carries.',
    s: '<path d="M12.8 6.2h6M12.8 12h7.2M12.8 17.8h4.8"/>',
    a: '<path d="M4.1 6.2h2.6M4.1 12h2.6M4.1 17.8h2.6"/>' },

  { id: 'worklist', file: 'tab-worklist', nm: 'Worklist', role: 'read', group: 'tab', tab: 'Worklist',
    why: 'A spine with three ordered veins reading top to bottom, all angled the same way so the structure stays a list rather than a plant. The single filled node marks the active position. Its lean is deliberate and left uncorrected.',
    s: '<path d="M6.8 3.8V20.2"/><path d="M6.8 8.6 18.4 6.6M6.8 13.2 18.4 11.2M6.8 17.8 18.4 15.8"/>',
    f: '<circle cx="18.4" cy="6.6" r="2"/>' },

  { id: 'draft', file: 'tab-draft', nm: 'Draft', role: 'read', group: 'tab', tab: 'Draft',
    why: 'A page whose contour is deliberately unfinished at the bottom-right, with the second rule stopping short. Mid-change stated by the geometry, and no pencil to confuse with Edit. The opening is large on purpose — a small nick reads as a rasterising artefact, a whole absent corner reads as intent.',
    s: '<path d="M9.2 20.2H7.2a1.8 1.8 0 0 1-1.8-1.8V5.6a1.8 1.8 0 0 1 1.8-1.8h9.6a1.8 1.8 0 0 1 1.8 1.8v5.4"/>',
    a: '<path d="M9 9h5.6M9 13h3"/>' },

  { id: 'chat', file: 'tab-chat', nm: 'Chat', role: 'read', group: 'tab', tab: 'Chat',
    why: 'Two speech forms related by 180° rotation, holding a diagonal band of negative space between two perspectives. The clearest expression of the construction rule in the set, and no ring, so it never becomes the logo.',
    s: '<path d="M5.8 3.6h7a2.2 2.2 0 0 1 2.2 2.2v3.4a2.2 2.2 0 0 1-2.2 2.2H8.4l-3.6 2.3.6-2.5a2.2 2.2 0 0 1-1.8-2.15V5.8a2.2 2.2 0 0 1 2.2-2.2z"/>',
    a: '<g transform="rotate(180 12 12)"><path d="M5.8 3.6h7a2.2 2.2 0 0 1 2.2 2.2v3.4a2.2 2.2 0 0 1-2.2 2.2H8.4l-3.6 2.3.6-2.5a2.2 2.2 0 0 1-1.8-2.15V5.8a2.2 2.2 0 0 1 2.2-2.2z"/></g>' },

  { id: 'today', file: 'tab-today', nm: 'Today', role: 'read', group: 'tab', tab: 'Today',
    why: 'A bounded day inside a conventional calendar. One emphatic present-day node, deep teal rather than orange, since arriving at today spends nothing.',
    s: '<path d="M3.8 6.8a2 2 0 0 1 2-2h12.4a2 2 0 0 1 2 2v10.4a2 2 0 0 1-2 2H5.8a2 2 0 0 1-2-2z"/><path d="M3.8 9.8h16.4"/>',
    f: '<rect x="10" y="12.2" width="4" height="4" rx="1.2"/>',
    // The header band's 1.3-unit clearance closes to 0.87px at 16. Opened out.
    small: {
      s: '<path d="M3.8 5.8a2 2 0 0 1 2-2h12.4a2 2 0 0 1 2 2v12.4a2 2 0 0 1-2 2H5.8a2 2 0 0 1-2-2z"/><path d="M3.8 10.2h16.4"/>',
      f: '<rect x="10" y="13" width="4" height="4" rx="1.2"/>' } },

  { id: 'log', file: 'tab-log', nm: 'Log', role: 'read', group: 'tab', tab: 'Log',
    why: 'A straight vertical path with three deposited nodes and rules that shorten as they recede. Settled past, where Worklist points at pending action.',
    s: '<path d="M6.2 3.8V20.2"/><path d="M11.2 7h7.6M11.2 12h6.2M11.2 17h4.4"/>',
    f: '<circle cx="6.2" cy="7" r="1.9"/><circle cx="6.2" cy="12" r="1.9"/><circle cx="6.2" cy="17" r="1.9"/>',
    // At 24 the beads leave 1.2 units of spine showing between them — 0.8px at
    // 16, which fills in and reads as one solid bar. Smaller, further apart.
    small: {
      s: '<path d="M6.2 3.8V20.2"/><path d="M11.2 6.4h7.6M11.2 12h6.2M11.2 17.6h4.4"/>',
      f: '<circle cx="6.2" cy="6.4" r="1.5"/><circle cx="6.2" cy="12" r="1.5"/><circle cx="6.2" cy="17.6" r="1.5"/>' } },

  // ── Header controls ────────────────────────────────────────────────────────
  { id: 'workspace', file: 'workspace-switcher', nm: 'Workspace switcher', role: 'switch', group: 'header',
    why: 'Two arcs related by 180° rotation, each with a committed terminal, turning around the held context in the centre. The switch is the rotation, so the whole context visibly changes rather than being colour-coded. No ring and no wing: the header lockup already carries the mark, and a ring here would read as the logo.',
    s: '<path d="M15 3.7A8.8 8.8 0 0 1 15 20.3"/><path d="M15 20.3 14.2 16.9M15 20.3 11.5 21.1"/>',
    a: '<path d="M9 20.3A8.8 8.8 0 0 1 9 3.7"/><path d="M9 3.7 9.8 7.1M9 3.7 12.5 2.9"/><rect x="9.9" y="9.9" width="4.2" height="4.2" rx="1.3"/>' },

  { id: 'credit', file: 'credit-balance', nm: 'Credit balance', role: 'status', group: 'header',
    why: 'A segmented meter: finite positions, some remaining. Restrained enough to sit at 14px beside the numeral without competing with it. The numeral stays primary; the meter qualifies it.',
    s: '<rect x="3.4" y="9.2" width="17.2" height="5.6" rx="2.8"/>',
    seg: '<path d="M6.6 12h1.3M10 12h1.3M13.4 12h1.3"/>',
    // 2.6-wide segments inside a 5.6 capsule leave 0.65 units of clearance —
    // 0.43px at 16, which closes. The small master opens the capsule, thins the
    // segments and trades the third segment for the clearance.
    small: {
      s: '<rect x="3.4" y="8.8" width="17.2" height="6.4" rx="3.2"/>',
      seg: '<path d="M6.9 12h2.1M11.5 12h2.1"/>',
      segWarn: '<path d="M6.9 12h2.1"/>' } }
];

const roleOrder = { action: 0, tab: 1, header: 2 };
const BY_ID = Object.fromEntries(GL.map(g => [g.id, g]));

/** Interaction states. Glyph colour never changes to signal selection. */
export const STATES = {
  default:  { ground: TOKENS.surface, note: 'Icons sit on white. Orange measures 3.20:1 there; on cream it is 2.99:1 and fails.' },
  hover:    { ground: TOKENS.hover,   note: 'Ground tint only. No colour change in the glyph.' },
  pressed:  { ground: TOKENS.pressed, note: 'Deeper tint of the same hue. Still no glyph change.' },
  focus:    { ground: TOKENS.surface, ring: TOKENS.deepTeal, note: '2px deep-teal ring, 2px offset. Ground unchanged, so focus and hover can co-occur.' },
  selected: { ground: TOKENS.hover, underline: TOKENS.deepTeal, note: 'Tabs only. Ground plus a 2px deep-teal underline carried by the container. Never orange.' },
  disabled: { ground: TOKENS.surface, flatten: TOKENS.mute, note: 'Whole glyph flattens to one mute grey. The orange marker disappears, which is correct: no consequence is available.' }
};

/**
 * Render a glyph. `mono` renders every part in one colour; `warn` is the credit
 * low-balance state; `small` selects the 16px-corrected geometry where one
 * exists; `flatten` forces a single colour (disabled).
 */
export function draw(g, { mono = false, warn = false, small = false, ink = I, flatten = null } = {}) {
  const src = small && g.small ? { ...g, ...g.small } : g;
  const c = flatten || (mono ? ink : T);
  const a = flatten || (mono ? ink : D);
  let f = flatten || (mono ? ink : (g.role === 'write' ? O : D));
  if (warn && !flatten && !mono) f = O;
  const segCol = flatten || (mono ? ink : (warn ? O : D));
  let o = '';
  if (src.s) o += `<g fill="none" stroke="${c}" stroke-width="1.7">${src.s}</g>`;
  if (src.a) o += `<g fill="none" stroke="${a}" stroke-width="1.7">${src.a}</g>`;
  if (src.d) o += `<g fill="none" stroke="${a}" stroke-width="1.5" stroke-dasharray="2 2.4">${src.d}</g>`;
  if (src.seg) o += `<g fill="none" stroke="${segCol}" stroke-width="${small ? 1.9 : 2.6}">${warn ? (src.segWarn || '<path d="M6.6 12h1.4"/>') : src.seg}</g>`;
  if (src.f) o += `<g fill="${f}" stroke="none">${src.f}</g>`;
  return o;
}

export function svg(g, opts = {}) {
  const label = g.nm + (opts.warn ? ' — low balance' : '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"`
    + ` fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${label}">\n`
    + `  <title>${label}</title>\n  ${draw(g, opts)}\n</svg>\n`;
}

export { GL, BY_ID, roleOrder };

// ── Emit ─────────────────────────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  for (const d of ['colour', 'mono', 'small']) {
    rmSync(join(OUT, d), { recursive: true, force: true });
    mkdirSync(join(OUT, d), { recursive: true });
  }

  const manifest = [];
  for (const g of GL) {
    writeFileSync(join(OUT, 'colour', `${g.file}.svg`), svg(g));
    writeFileSync(join(OUT, 'mono', `${g.file}.svg`), svg(g, { mono: true, ink: 'currentColor' }));
    if (g.small) writeFileSync(join(OUT, 'small', `${g.file}.svg`), svg(g, { small: true }));
    manifest.push({
      id: g.id, name: g.nm, file: `${g.file}.svg`, group: g.group, role: g.role,
      ...(g.tab ? { tab: g.tab } : {}),
      ...(g.pairWith ? { rotationalPair: g.pairWith } : {}),
      ...(g.small ? { smallMaster: `small/${g.file}.svg` } : {}),
      why: g.why
    });
  }

  const credit = BY_ID.credit;
  writeFileSync(join(OUT, 'colour', 'credit-balance-warning.svg'), svg(credit, { warn: true }));
  writeFileSync(join(OUT, 'small', 'credit-balance-warning.svg'), svg(credit, { warn: true, small: true }));
  manifest.push({
    id: 'creditWarning', name: 'Credit balance — low balance', file: 'credit-balance-warning.svg',
    group: 'header', role: 'warning', smallMaster: 'small/credit-balance-warning.svg',
    why: 'Orange enters the credit component only when the balance is nearly spent, so the colour keeps its meaning as consequence.'
  });

  writeFileSync(join(OUT, 'icons.json'), JSON.stringify({
    set: 'CIS / Scout panel icons',
    version: '4.0.0',
    status: 'finalisation candidate — awaiting review of FINALISATION.html',
    source: 'source/CIS Icon Set v3 (geometric wing).html, as amended by the round-four ruling',
    generatedBy: 'build-icons.mjs',
    grid: 24, strokeWidth: 1.7, safeMargin: 2,
    tokens: TOKENS,
    grammar: {
      read: 'Open or receptive geometry, predominantly outline, movement inward. No solid marker.',
      write: 'A closed destination or committed terminal plus one solid orange consequence marker.',
      ring: 'Not used. The header lockup carries the mark; a ring at icon scale reads as the logo.',
      rotation: 'Genuine counterparts are one composition under rotate(180 12 12), never a mirror. Such a composition must be centred on (12,12) or its counterpart leaves the box.',
      selectedTab: 'Ground tint plus a 2px deep-teal underline, carried by the container. Never orange.',
      surface: 'Action icons sit on white. Orange measures 2.99:1 on cream and fails the 3:1 floor for non-text UI.'
    },
    states: STATES,
    icons: manifest
  }, null, 2) + '\n');

  console.log(`Wrote ${manifest.length} masters to ${OUT}`);
}
