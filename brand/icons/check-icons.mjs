/**
 * Geometry and collision checks for the icon set.
 *
 *   node check-icons.mjs [--json]
 *
 * Two things a design sheet cannot tell you by eye, both of which have already
 * caught real faults in this set:
 *
 *  1. Safe margin and optical centre — measured as the real inked extent
 *     (geometry plus half the stroke), not the path bounding box. Round three
 *     shipped a glyph whose wing was translated outside the 24px box; that is
 *     what this catches.
 *
 *  2. A 16px collision score — every glyph rasterised at actual size in
 *     monochrome and compared pairwise, so the collision audit ranks real
 *     silhouette overlap instead of asserting which pairs look alike.
 *
 * Needs a Chromium binary (CHROME env var, or the usual Playwright location).
 * Exits non-zero if any glyph breaks the 2px safe margin.
 */

import { writeFileSync, mkdtempSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { GL, BY_ID, draw } from './build-icons.mjs';

const CHROME = process.env.CHROME
  || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/usr/bin/chromium', '/usr/bin/google-chrome']
    .find(p => existsSync(p));
if (!CHROME) { console.error('No Chromium found. Set CHROME=/path/to/chrome'); process.exit(2); }

const SAFE = 2, GRID = 24;

function runPage(html) {
  const dir = mkdtempSync(join(tmpdir(), 'iconcheck-'));
  const file = join(dir, 'p.html');
  writeFileSync(file, html);
  const dom = execFileSync(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu',
    '--virtual-time-budget=8000', '--dump-dom', file],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  const m = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
  if (!m) throw new Error('page produced no output');
  return JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
}

/** Inked bounding box of each variant, in user units. */
function measureAll(variants) {
  const blocks = variants.map((v, i) =>
    `<div data-n="${i}"><svg width="2400" height="2400" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">${v.inner}</svg></div>`).join('');
  const rows = runPage(`<!doctype html><body>${blocks}<pre id="out"></pre><script>
const out=[];
for(const d of document.querySelectorAll('div[data-n]')){
  const s=d.querySelector('svg');
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const el of s.querySelectorAll('path,rect,circle')){
    let b; try{ b=el.getBBox(); }catch(e){ continue; }
    let tm=s.createSVGMatrix(), chain=[], cur=el;
    while(cur&&cur!==s){ chain.unshift(cur); cur=cur.parentNode; }
    for(const n of chain){ const t=n.transform&&n.transform.baseVal.consolidate(); if(t) tm=tm.multiply(t.matrix); }
    let sw=0,p=el; while(p&&p!==s){ const v=p.getAttribute&&p.getAttribute('stroke-width'); if(v){sw=parseFloat(v);break;} p=p.parentNode; }
    let stroked=false; p=el;
    while(p&&p!==s){ const v=p.getAttribute&&p.getAttribute('stroke'); if(v){stroked=(v!=='none');break;} p=p.parentNode; }
    const sc=Math.sqrt(Math.abs(tm.a*tm.d-tm.b*tm.c))||1, half=stroked?(sw*sc)/2:0;
    for(const [px,py] of [[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]]){
      const X=tm.a*px+tm.c*py+tm.e, Y=tm.b*px+tm.d*py+tm.f;
      x0=Math.min(x0,X-half); y0=Math.min(y0,Y-half); x1=Math.max(x1,X+half); y1=Math.max(y1,Y+half);
    }
  }
  out.push({i:+d.dataset.n,x0,y0,x1,y1});
}
document.getElementById('out').textContent=JSON.stringify(out);
<\/script>`);
  return rows.map(r => ({
    name: variants[r.i].name,
    x0: +r.x0.toFixed(2), y0: +r.y0.toFixed(2), x1: +r.x1.toFixed(2), y1: +r.y1.toFixed(2),
    cx: +((r.x0 + r.x1) / 2).toFixed(2), cy: +((r.y0 + r.y1) / 2).toFixed(2),
    margin: +Math.min(r.x0, r.y0, GRID - r.x1, GRID - r.y1).toFixed(2)
  }));
}

/**
 * Rasterise each glyph at 16px in monochrome and score every pair.
 * Score is coverage-weighted overlap on a slightly blurred alpha field, which
 * approximates what the eye resolves at that size: 1.0 identical, 0 disjoint.
 */
function collisions(items) {
  const payload = JSON.stringify(items.map(i => ({ name: i.name, svg: i.svg })));
  return runPage(`<!doctype html><body><pre id="out"></pre><script>
const ITEMS=${payload};
const N=16;
function alpha(svg){
  return new Promise(res=>{
    const img=new Image();
    img.onload=()=>{
      const c=document.createElement('canvas'); c.width=N; c.height=N;
      const x=c.getContext('2d'); x.drawImage(img,0,0,N,N);
      const d=x.getImageData(0,0,N,N).data, a=new Float64Array(N*N);
      for(let i=0;i<N*N;i++) a[i]=d[i*4+3]/255;
      res(a);
    };
    img.onerror=()=>res(new Float64Array(N*N));
    img.src='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg)));
  });
}
function blur(a){
  const b=new Float64Array(N*N);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    let s=0,n=0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      const yy=y+dy,xx=x+dx; if(yy<0||xx<0||yy>=N||xx>=N) continue;
      const w=(dx===0&&dy===0)?4:1; s+=a[yy*N+xx]*w; n+=w;
    }
    b[y*N+x]=s/n;
  }
  return b;
}
(async()=>{
  const fields=[];
  for(const it of ITEMS) fields.push(blur(await alpha(it.svg)));
  const pairs=[];
  for(let i=0;i<fields.length;i++) for(let j=i+1;j<fields.length;j++){
    let inter=0,uni=0;
    for(let k=0;k<N*N;k++){ inter+=Math.min(fields[i][k],fields[j][k]); uni+=Math.max(fields[i][k],fields[j][k]); }
    pairs.push({a:ITEMS[i].name,b:ITEMS[j].name,score:uni?+(inter/uni).toFixed(3):0});
  }
  pairs.sort((p,q)=>q.score-p.score);
  document.getElementById('out').textContent=JSON.stringify(pairs);
})();
<\/script>`);
}

const variants = [];
for (const g of GL) {
  variants.push({ name: g.nm, inner: draw(g) });
  if (g.small) variants.push({ name: `${g.nm} · 16px master`, inner: draw(g, { small: true }) });
}
variants.push({ name: 'Credit balance — low balance', inner: draw(BY_ID.credit, { warn: true }) });

const boxes = measureAll(variants);
const mono = GL.map(g => ({
  name: g.nm,
  svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">${draw(g, { mono: true })}</svg>`
}));
const pairs = collisions(mono);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ boxes, pairs }, null, 2));
} else {
  console.log('Inked extent (safe area is 2 → 22), optical centre should be near 12,12\n');
  console.log('  glyph                            x0     y0     x1     y1     cx     cy   margin');
  for (const b of boxes) {
    const bad = b.margin < SAFE - 0.005;
    console.log(`  ${(bad ? '! ' : '  ') + b.name.padEnd(30)} ${String(b.x0).padStart(6)} ${String(b.y0).padStart(6)} ${String(b.x1).padStart(6)} ${String(b.y1).padStart(6)} ${String(b.cx).padStart(6)} ${String(b.cy).padStart(6)} ${String(b.margin).padStart(7)}`);
  }
  const fails = boxes.filter(b => b.margin < SAFE - 0.005);
  console.log(`\n${fails.length ? `${fails.length} glyph(s) break the ${SAFE}px safe margin.` : `All ${boxes.length} inside the ${SAFE}px safe margin.`}`);
  console.log('\nClosest pairs at 16px, monochrome (overlap on a blurred alpha field):\n');
  for (const p of pairs.slice(0, 12)) console.log(`  ${p.score.toFixed(3)}  ${p.a} / ${p.b}`);
  process.exit(fails.length ? 1 : 0);
}
