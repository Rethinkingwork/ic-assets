/**
 * Export the CIS / Scout icon family as individual SVG masters.
 *
 * Source of truth: source/CIS Icon Set v3 (geometric wing).html, the round-four
 * design sheet. The glyph data and the draw() rules below are ported verbatim
 * from it, so the exported masters cannot drift from the approved drawings. If
 * a glyph changes in the sheet, change it here too and re-run.
 *
 *   node build-icons.mjs
 *
 * Writes {colour,mono}/*.svg and icons.json beside this file.
 */

import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));

// Brand tokens — functional, not decorative.
const T = '#1B9894'; // teal      structure
const D = '#156E6B'; // deep teal read accent / secondary
const O = '#E1702F'; // orange    write / spend consequence marker
const I = '#152420'; // ink       monochrome

// The wing module: two circular arcs meeting at a tip. One shape, rotated.
const W = 'M12 12A6 6 0 0 1 4 5 6 6 0 0 1 12 12Z';

/** The ten glyphs drawn in round four, plus the three A/B alternates. */
const GL = [
  { id: 'copy', file: 'copy-outreach-prompt', nm: 'Copy outreach prompt', role: 'read', group: 'action',
    why: 'Two offset prompt cards. The wing enters as the back card’s top-right corner — two arcs meeting at a tip — so the brand sits in the fragment being copied, not in the metaphor.',
    a: '<path d="M8.2 9.4V6.6a2 2 0 0 1 2-2h6.4A4 4 0 0 1 20.9 3.5 4 4 0 0 1 19.8 8.2V13.2a2 2 0 0 1-2 2h-2.2"/><path d="M6.8 15h5.6"/>',
    s: '<path d="M5.6 9.4h8a2 2 0 0 1 2 2v6.8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-6.8a2 2 0 0 1 2-2z"/>' },

  { id: 'queue', file: 'add-to-action-queue', nm: 'Add to action queue', role: 'write', group: 'action',
    why: 'An ordered destination of three positions with the last one left open, and a solid module entering it from the right. Wide and striped, where Add to campaign rises diagonally.',
    s: '<path d="M4.4 6.6h13.2M4.4 12h13.2M4.4 17.4h8.2"/>',
    f: '<rect x="15" y="15.5" width="3.9" height="3.9" rx="1.15"/>' },

  { id: 'call', file: 'log-call-outcome', nm: 'Log a call outcome', role: 'write', group: 'action',
    why: 'A conventional handset, untouched, plus one closed outcome node. The node is the only committed mass in the glyph, which is what makes it a log rather than a dial.',
    s: '<g transform="translate(-0.6 2.4) scale(0.8)"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></g>',
    f: '<circle cx="19" cy="5.2" r="2.6"/>' },

  { id: 'dossier', file: 'import-linkedin-dossier', nm: 'Import LinkedIn dossier', role: 'write', group: 'action',
    why: 'A bounded document receiving one contained bundle across a dashed boundary. Pull LinkedIn info stays a light extraction; this is a block of material crossing into the record.',
    s: '<path d="M12.8 3.8h5.6a2 2 0 0 1 2 2v12.4a2 2 0 0 1-2 2h-5.6"/>',
    a: '<path d="M14.4 7.4h4M14.4 16.6h4"/>',
    d: '<path d="M12.8 3.8V20.2"/>',
    f: '<rect x="8" y="9.6" width="6.6" height="4.8" rx="1.4"/>' },

  { id: 'worklist', file: 'tab-worklist', nm: 'Worklist', role: 'read', group: 'tab', tab: 'Worklist',
    why: 'A spine with three ordered veins reading top to bottom, all angled the same way so the structure stays a list rather than a plant. The single filled node marks the active position.',
    s: '<path d="M6.8 3.8V20.2"/><path d="M6.8 8.6 18.4 6.6M6.8 13.2 18.4 11.2M6.8 17.8 18.4 15.8"/>',
    f: '<circle cx="18.4" cy="6.6" r="2"/>' },

  { id: 'draftA', file: 'tab-draft-a', nm: 'Draft', role: 'read', group: 'tab', tab: 'Draft', alt: 'A',
    why: 'A page whose contour is deliberately unfinished at the bottom-right, with the second rule stopping short. Mid-change stated by the geometry, with no pencil to confuse with Edit.',
    s: '<path d="M7.6 20.2H5.6a1.8 1.8 0 0 1-1.8-1.8V5.6a1.8 1.8 0 0 1 1.8-1.8h9.6a1.8 1.8 0 0 1 1.8 1.8v5.4"/>',
    a: '<path d="M7.4 9h5.6M7.4 13h3"/>' },

  { id: 'draftB', file: 'tab-draft-b', nm: 'Draft', role: 'read', group: 'tab', tab: 'Draft', alt: 'B',
    why: 'The same idea on a message form rather than a page: the bubble’s lower run and tail are left open. Reads more clearly as unsent outreach, less clearly as a document.',
    s: '<path d="M8.6 19.4H6a2.2 2.2 0 0 1-2.2-2.2V7a2.2 2.2 0 0 1 2.2-2.2h12a2.2 2.2 0 0 1 2.2 2.2v5"/>',
    a: '<path d="M7.6 9.6h8.8M7.6 13.4h4.2"/>' },

  { id: 'chat', file: 'tab-chat', nm: 'Chat', role: 'read', group: 'tab', tab: 'Chat',
    why: 'Two speech forms related by 180° rotation, holding a diagonal band of negative space between two perspectives. The clearest expression of the construction rule in the set, and no ring, so it never becomes the logo.',
    s: '<path d="M5.8 3.6h7a2.2 2.2 0 0 1 2.2 2.2v3.4a2.2 2.2 0 0 1-2.2 2.2H8.4l-3.6 2.3.6-2.5a2.2 2.2 0 0 1-1.8-2.15V5.8a2.2 2.2 0 0 1 2.2-2.2z"/>',
    a: '<g transform="rotate(180 12 12)"><path d="M5.8 3.6h7a2.2 2.2 0 0 1 2.2 2.2v3.4a2.2 2.2 0 0 1-2.2 2.2H8.4l-3.6 2.3.6-2.5a2.2 2.2 0 0 1-1.8-2.15V5.8a2.2 2.2 0 0 1 2.2-2.2z"/></g>' },

  { id: 'today', file: 'tab-today', nm: 'Today', role: 'read', group: 'tab', tab: 'Today',
    why: 'A bounded day inside a conventional calendar. One emphatic present-day node, deep teal rather than orange, since arriving at today spends nothing.',
    s: '<path d="M3.8 7.8a2 2 0 0 1 2-2h12.4a2 2 0 0 1 2 2v10.4a2 2 0 0 1-2 2H5.8a2 2 0 0 1-2-2z"/><path d="M3.8 10.8h16.4"/>',
    f: '<rect x="10" y="13.2" width="4" height="4" rx="1.2"/>' },

  { id: 'log', file: 'tab-log', nm: 'Log', role: 'read', group: 'tab', tab: 'Log',
    why: 'A straight vertical path with three deposited nodes and rules that shorten as they recede. Settled past, where Worklist points at pending action.',
    s: '<path d="M7.6 3.8V20.2"/><path d="M12.6 7h7.6M12.6 12h6.2M12.6 17h4.4"/>',
    f: '<circle cx="7.6" cy="7" r="1.9"/><circle cx="7.6" cy="12" r="1.9"/><circle cx="7.6" cy="17" r="1.9"/>' },

  { id: 'creditA', file: 'credit-balance-a', nm: 'Credit balance', role: 'status', group: 'header', alt: 'A',
    why: 'A segmented meter: five finite positions, three remaining. Restrained enough to sit at 14px beside the numeral without competing with it.',
    s: '<rect x="2.6" y="9.2" width="18.8" height="5.6" rx="2.8"/>',
    seg: '<path d="M5.8 12h1.3M9.4 12h1.3M13 12h1.3"/>' },

  { id: 'creditB', file: 'credit-balance-b', nm: 'Credit balance', role: 'status', group: 'header', alt: 'B',
    why: 'Four compact units, three spent. Counts rather than measures, which suits a balance that moves in whole credits, and holds its shape better than a meter at 14px.',
    s: '<rect x="3.8" y="3.8" width="7.4" height="7.4" rx="1.8"/><rect x="12.8" y="3.8" width="7.4" height="7.4" rx="1.8"/><rect x="3.8" y="12.8" width="7.4" height="7.4" rx="1.8"/><rect x="12.8" y="12.8" width="7.4" height="7.4" rx="1.8"/>',
    fx: '<rect x="5.4" y="5.4" width="4.2" height="4.2" rx="1"/><rect x="14.4" y="5.4" width="4.2" height="4.2" rx="1"/><rect x="5.4" y="14.4" width="4.2" height="4.2" rx="1"/>' },

  { id: 'wsA', file: 'workspace-switcher-a', nm: 'Workspace switcher', role: 'switch', group: 'header', alt: 'A',
    why: 'The mark’s own arrangement at icon scale: two wings in the held ring, rotationally paired. Teal and deep teal only — identity is carried by the geometry, and orange stays available for a warning.',
    raw: (c, a) => `<circle cx="12" cy="12" r="9.3" fill="none" stroke="${c}" stroke-width="1.2" opacity=".5"/><g fill="none" stroke="${c}" stroke-width="1.7" transform="translate(3.6 3.6) scale(.7)"><path d="${W}"/></g><g fill="none" stroke="${a}" stroke-width="1.7" transform="rotate(180 12 12) translate(3.6 3.6) scale(.7)"><path d="${W}"/></g>` },

  { id: 'wsB', file: 'workspace-switcher-b', nm: 'Workspace switcher', role: 'switch', group: 'header', alt: 'B',
    why: 'Two arcs related by 180° rotation, each with a committed terminal, turning around the held context in the centre. The switch is the rotation, so the whole context visibly changes rather than being colour-coded.',
    s: '<path d="M15 3.7A8.8 8.8 0 0 1 15 20.3"/><path d="M15 20.3 14.2 16.9M15 20.3 11.5 21.1"/>',
    a: '<path d="M9 20.3A8.8 8.8 0 0 1 9 3.7"/><path d="M9 3.7 9.8 7.1M9 3.7 12.5 2.9"/><rect x="9.9" y="9.9" width="4.2" height="4.2" rx="1.3"/>' }
];

/**
 * The four round-three quick actions the panel already uses, carried forward
 * unrevised, plus the Fields tab (which existed only inside the tab strip in
 * the round-four sheet). Round four's own note stands: Log sent / Log reply
 * still want redrawing properly alongside the resolved alternates.
 */
const EXIST = [
  { id: 'pull', file: 'pull-linkedin-info', nm: 'Pull LinkedIn info', role: 'read', group: 'action',
    why: 'A wing receiving two signal arcs — lightweight extraction, nothing committed.',
    s: `<g transform="translate(-1.6 2.2) scale(1.15)"><path d="${W}"/></g>`,
    a: '<path d="M16.4 8.8a5.2 5.2 0 0 1 0 6.4"/><path d="M19 6.6a8.6 8.6 0 0 1 0 10.8"/>' },

  { id: 'campaign', file: 'add-to-campaign', nm: 'Add to campaign', role: 'write', group: 'action',
    why: 'Three wings rising on a diagonal — a flight formation — with the solid module at the top of the climb.',
    s: `<g transform="translate(1.4 11) scale(.58)"><path d="${W}"/></g><g transform="translate(5 7.4) scale(.58)"><path d="${W}"/></g><g transform="translate(8.6 3.8) scale(.58)"><path d="${W}"/></g>`,
    f: '<circle cx="19" cy="17" r="2.4"/>' },

  { id: 'sent', file: 'log-sent', nm: 'Log sent', role: 'write', group: 'action', pairWith: 'reply',
    why: 'A wing leaving a groundline. Its counterpart, Log reply, is this same composition rotated 180° — the operation that makes the mark’s second half from its first.',
    s: '<path d="M4.6 18.6h14.8"/>',
    a: `<g transform="translate(-1 -1.8) scale(1.3)"><path d="${W}"/></g>` },

  { id: 'reply', file: 'log-reply', nm: 'Log reply', role: 'write', group: 'action', pairWith: 'sent',
    why: 'Log sent under rotate(180 12 12). The pairing is enforced by the transform, so it cannot drift.',
    s: '<g transform="rotate(180 12 12)"><path d="M4.6 18.6h14.8"/></g>',
    a: `<g transform="rotate(180 12 12) translate(-1 -1.8) scale(1.3)"><path d="${W}"/></g>` },

  { id: 'fields', file: 'tab-fields', nm: 'Fields', role: 'read', group: 'tab', tab: 'Fields',
    why: 'A wing at tab scale with two short keyed strokes reading into it — the record’s stored values, received rather than written.',
    s: `<g transform="translate(-.4 -.4) translate(1.6 1.6) scale(1.55)"><path d="${W}"/></g>`,
    a: '<path d="M9.2 9.6 6.4 7.6M10 6.6 8.2 5.2"/>' }
];

const ALL = [...EXIST.slice(0, 4), ...GL, EXIST[4]];

/**
 * Ported from the sheet's draw(). `mono` renders every part in one colour;
 * `warn` is the credit-balance low-balance state.
 */
function body(g, { mono = false, warn = false, ink = I } = {}) {
  const c = mono ? ink : T;
  const a = mono ? ink : D;
  let f = mono ? ink : (g.role === 'write' ? O : D);
  if (warn) f = O;
  let o = '';
  if (g.raw) o += g.raw(c, a, f);
  if (g.s) o += `<g fill="none" stroke="${c}" stroke-width="1.7">${g.s}</g>`;
  if (g.a) o += `<g fill="none" stroke="${a}" stroke-width="1.7">${g.a}</g>`;
  if (g.d) o += `<g fill="none" stroke="${a}" stroke-width="1.5" stroke-dasharray="2 2.4">${g.d}</g>`;
  if (g.seg) o += `<g fill="none" stroke="${warn ? O : a}" stroke-width="2.6">${warn ? '<path d="M5.4 12h1.4"/>' : g.seg}</g>`;
  if (g.f) o += `<g fill="${f}" stroke="none">${g.f}</g>`;
  if (g.fx) o += `<g fill="${warn ? O : a}" stroke="none">${warn ? '<rect x="5.4" y="5.4" width="4.2" height="4.2" rx="1"/>' : g.fx}</g>`;
  return o;
}

function svg(g, opts = {}) {
  const label = g.nm + (g.alt ? ` (alternative ${g.alt})` : '') + (opts.warn ? ' — low balance' : '');
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"',
    ' fill="none" stroke-linecap="round" stroke-linejoin="round" role="img"',
    ` aria-label="${label}">\n`,
    `  <title>${label}</title>\n`,
    `  ${body(g, opts)}\n`,
    '</svg>\n'
  ].join('');
}

rmSync(join(OUT, 'colour'), { recursive: true, force: true });
rmSync(join(OUT, 'mono'), { recursive: true, force: true });
mkdirSync(join(OUT, 'colour'), { recursive: true });
mkdirSync(join(OUT, 'mono'), { recursive: true });

const manifest = [];
for (const g of ALL) {
  writeFileSync(join(OUT, 'colour', `${g.file}.svg`), svg(g));
  // Mono masters use currentColor so the panel can tint them per state;
  // the canonical monochrome ink is #152420.
  writeFileSync(join(OUT, 'mono', `${g.file}.svg`), svg(g, { mono: true, ink: 'currentColor' }));
  manifest.push({
    id: g.id, name: g.nm, file: `${g.file}.svg`, group: g.group,
    role: g.role, ...(g.tab ? { tab: g.tab } : {}), ...(g.alt ? { alternative: g.alt } : {}),
    ...(g.pairWith ? { rotationalPair: g.pairWith } : {}), why: g.why
  });
}

// The credit balance also ships its warning state, the one place orange is
// allowed outside the write grammar.
for (const id of ['creditA', 'creditB']) {
  const g = GL.find(x => x.id === id);
  writeFileSync(join(OUT, 'colour', `${g.file}-warning.svg`), svg(g, { warn: true }));
  manifest.push({
    id: `${g.id}Warning`, name: `${g.nm} — low balance`, file: `${g.file}-warning.svg`,
    group: 'header', role: 'warning', alternative: g.alt,
    why: 'Orange enters the credit component only when the balance is nearly spent, so the colour keeps its meaning as consequence.'
  });
}

writeFileSync(join(OUT, 'icons.json'), JSON.stringify({
  set: 'CIS / Scout panel icons',
  version: '3.0.0-draft',
  source: 'source/CIS Icon Set v3 (geometric wing).html',
  generatedBy: 'build-icons.mjs',
  grid: 24,
  strokeWidth: 1.7,
  safeMargin: 2,
  tokens: { teal: T, deepTeal: D, orange: O, ink: I },
  grammar: {
    read: 'Open or receptive geometry, predominantly outline, movement inward. No solid marker.',
    write: 'A closed destination or committed terminal plus one solid orange consequence marker.',
    ring: 'Only where a context is genuinely held, bounded or switched.',
    rotation: 'Genuine counterparts are one composition under rotate(180 12 12), never a mirror.',
    selectedTab: 'Ground tint plus a deep-teal underline, carried by the container. Never orange.'
  },
  unresolved: ['Draft A/B', 'Credit balance A/B', 'Workspace switcher A/B'],
  icons: manifest
}, null, 2) + '\n');

console.log(`Wrote ${manifest.length} masters to ${OUT}`);
