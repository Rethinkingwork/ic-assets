// render.mjs — internal tooling (NOT shipped to recipients).
// Two jobs, both via the bundled Playwright Chromium at /opt/pw-browsers:
//   1.  node render.mjs logo <in.svg> <out.png> <width> <height>
//       Rasterise a brand SVG on a transparent background → crisp 2x PNG for email.
//   2.  node render.mjs shot <in.html> <out.png> [width=680]
//       Screenshot a finished email HTML so we can eyeball it like a mail client.
//
// Playwright is resolved from the global node_modules; chromium from PLAYWRIGHT_BROWSERS_PATH.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [, , mode, inPath, outPath, a, b] = process.argv;

if (!mode || !inPath || !outPath) {
  console.error('usage: render.mjs <logo|shot> <in> <out> [w] [h]');
  process.exit(1);
}

const browser = await chromium.launch({
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});

try {
  if (mode === 'logo') {
    const w = Number(a) || 240;
    const h = Number(b) || 240;
    const scale = 2; // retina-friendly: render at 2x the display width
    const svg = readFileSync(resolve(inPath), 'utf8');
    const page = await browser.newPage({ deviceScaleFactor: scale });
    await page.setViewportSize({ width: w, height: h });
    // Transparent canvas; the SVG fills it edge-to-edge.
    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8">
       <style>html,body{margin:0;padding:0;background:transparent}
       svg{display:block;width:${w}px;height:${h}px}</style></head>
       <body>${svg}</body></html>`,
      { waitUntil: 'networkidle' }
    );
    const el = await page.$('svg');
    await el.screenshot({ path: resolve(outPath), omitBackground: true });
    console.log(`logo → ${outPath} (${w}x${h} @${scale}x)`);
  } else if (mode === 'shot') {
    const width = Number(a) || 680;
    const page = await browser.newPage({ deviceScaleFactor: 2 });
    await page.setViewportSize({ width, height: 1200 });
    const url = 'file://' + resolve(inPath);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: resolve(outPath), fullPage: true });
    console.log(`shot → ${outPath} (w=${width})`);
  } else {
    console.error('unknown mode', mode);
    process.exit(1);
  }
} finally {
  await browser.close();
}
