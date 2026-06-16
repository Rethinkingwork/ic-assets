// fill.mjs — substitute {{merge_fields}} with sample values for PREVIEW ONLY.
// Produces a throwaway HTML in .previews/ so we can screenshot a realistic render.
// Never used at send time — the real sender fills fields from the contacts row.
//   node fill.mjs <in.html> <out.html>
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SAMPLE = {
  subject: 'Welcome to Inspiring Connections',
  preheader: 'A warm hello, and the one thing worth doing first.',
  eyebrow: 'Welcome aboard',
  headline: 'Lovely to have you here.',
  first_name: 'Sarah',
  paragraph_1:
    'Thank you for signing up — genuinely. You have joined a small, growing group of people who believe the right connection, at the right moment, changes everything.',
  paragraph_2:
    'Over the next couple of weeks I will send you a short series to help you get value quickly. No fluff, no daily barrage — just the useful bits, spaced out so they are easy to act on.',
  cta_url: 'https://cis-portals.vercel.app/scorecard',
  cta_label: 'Take the 2-minute Scorecard',
  score: '72',
  ps_line:
    'P.S. Curious how intentional you already are? The Connection Intelligence Scorecard takes two minutes and gives you a number to beat.',
  company_address: 'Inspiring Connections, United Kingdom · Registered in England & Wales',
  unsubscribe_url: 'https://kntrbfrhajtvbuupyntu.supabase.co/functions/v1/cis-unsub?u=SAMPLE_TOKEN',
  preferences_url: 'https://inspiringconnections.io/preferences',
  year: '2026',
};

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) { console.error('usage: fill.mjs <in.html> <out.html>'); process.exit(1); }

let html = readFileSync(resolve(inPath), 'utf8');
html = html.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (m, key) =>
  Object.prototype.hasOwnProperty.call(SAMPLE, key) ? SAMPLE[key] : m
);
writeFileSync(resolve(outPath), html);
console.log(`filled → ${outPath}`);
