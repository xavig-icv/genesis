// Imatges dels resultats per al README i el quadern, generades a partir de les captures (.bin): es poden
// tornar a fer amb els mateixos fitxers i donen sempre la mateixa imatge. Sense dependències.
//
//   node eines/imatges.mjs sopa sortida.png <captura.bin | aleatoria:LLAVOR> ... [--programes N] [--des-de I] [--escala S]
//        tires de programes de la sopa, l'una al costat de l'altra: cada fila és un programa de 64 bytes, i
//        cada byte té el color de la seva família d'instruccions (els colors de la interfície del navegador)
//   node eines/imatges.mjs mon WxH sortida.png captura.bin ... [--escala S] [--simple]
//        mons 2D, l'un al costat de l'altre: cada cel·la és un programa. El gris diu quantes instruccions té
//        (els programes a l'atzar en tenen poques), i les tres famílies de replicadors més grans del registre
//        (fase2/families.js) tenen el seu color, com a la interfície: rosa, verd i violeta, i les altres
//        famílies, gris fosc. Amb --simple, el gris només té tres tons (un fitxer molt més petit)
//   node eines/imatges.mjs animacio WxH sortida.png captura.bin ... [--escala S] [--retard ms] [--simple]
//        un PNG animat (APNG) amb un món per captura, en l'ordre donat; cada família conserva el color
//   node eines/imatges.mjs km carpeta-A carpeta-B sortida.svg [--etiquetes "A|B"]
//        la corba de Kaplan–Meier d'una sèrie, amb colors fixos (per a GitHub, que no té les variables del quadern)
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { encodePng, encodeApng } from './png.mjs';
import { PROGRAM_SIZE, KIND } from '../fase1/bff.js';
import { randomSoup, makeRng } from '../fase1/soup.js';
import { createFamilyTracker } from '../fase2/families.js';

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
// Els colors del tema clar de fase1/style.css (la sopa) i de fase2/style.css (el món)
export const COLORS = {
  page: hex('#f9f9f7'), copy: hex('#2a78d6'), loop: hex('#eb6834'), head: hex('#1baf7a'), arith: hex('#0b0b0b'),
  zero: hex('#fcfcfb'), lo: hex('#dcdad3'), hi: hex('#efeee9'),
};
export const WORLD = {
  lo: hex('#f3f2ee'), hi: hex('#c9c7bf'),
  fam: [hex('#e87ba4'), hex('#008300'), hex('#4a3aa7')], other: hex('#52514e'),
};
const FAMILY = new Array(256).fill('data');
FAMILY[0] = 'zero';
for (const c of '.,') FAMILY[c.charCodeAt(0)] = 'copy';
for (const c of '[]') FAMILY[c.charCodeAt(0)] = 'loop';
for (const c of '<>{}') FAMILY[c.charCodeAt(0)] = 'head';
for (const c of '+-') FAMILY[c.charCodeAt(0)] = 'arith';
const byteColor = (v) => (FAMILY[v] === 'data'
  ? COLORS.lo.map((c, i) => Math.round(c + (COLORS.hi[i] - c) * (v / 255)))
  : COLORS[FAMILY[v]]);
const mix = (a, b, f) => a.map((c, i) => Math.round(c + (b[i] - c) * f));
// La densitat d'instruccions d'una cel·la (k de 0 a 64): contínua, com a la interfície, o en tres tons
const density = (k, simple) => (simple
  ? (k < 8 ? WORLD.lo : k < 16 ? mix(WORLD.lo, WORLD.hi, 0.5) : WORLD.hi)
  : mix(WORLD.lo, WORLD.hi, Math.min(1, k / 24)));

function blank(width, height, color = COLORS.page) {
  const rgb = new Uint8Array(width * height * 3);
  for (let i = 0; i < width * height; i++) rgb.set(color, i * 3);
  return rgb;
}
function square(rgb, width, x, y, scale, color) {
  for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) rgb.set(color, ((y + dy) * width + x + dx) * 3);
}
// Diverses imatges de la mateixa alçada, l'una al costat de l'altra, amb un marge entre elles
export function row(images, gap = 12) {
  const height = Math.max(...images.map((im) => im.height));
  const width = images.reduce((s, im) => s + im.width, 0) + gap * (images.length - 1);
  const rgb = blank(width, height, [255, 255, 255]);
  let x0 = 0;
  for (const im of images) {
    for (let y = 0; y < im.height; y++) rgb.set(im.rgb.subarray(y * im.width * 3, (y + 1) * im.width * 3), (y * width + x0) * 3);
    x0 += im.width + gap;
  }
  return { rgb, width, height };
}

// Una tira de programes: { rgb, width, height }
export function soupImage(soup, { first = 0, programs = 128, scale = 3 } = {}) {
  const width = PROGRAM_SIZE * scale, height = programs * scale;
  const rgb = blank(width, height);
  for (let p = 0; p < programs; p++) {
    for (let i = 0; i < PROGRAM_SIZE; i++) square(rgb, width, i * scale, p * scale, scale, byteColor(soup[(first + p) * PROGRAM_SIZE + i]));
  }
  return { rgb, width, height };
}

// Un món 2D. tracker: un registre de famílies (createFamilyTracker); amb el mateix per a diverses imatges,
// cada família conserva el color
export function worldImage(soup, W, H, { scale = 2, tracker = null, epoch = 0, simple = false } = {}) {
  const n = W * H;
  const fams = tracker ? tracker.analyse(soup, n, epoch, W) : null;
  const width = W * scale, height = H * scale;
  const rgb = blank(width, height);
  for (let c = 0; c < n; c++) {
    let color;
    const f = fams && fams.map[c] ? fams.families[fams.map[c] - 1] : null;
    if (f) color = f.slot >= 0 ? WORLD.fam[f.slot] : WORLD.other;
    else {
      let k = 0;
      for (let i = 0; i < PROGRAM_SIZE; i++) if (KIND[soup[c * PROGRAM_SIZE + i]]) k++;
      color = density(k, simple);
    }
    square(rgb, width, (c % W) * scale, ((c / W) | 0) * scale, scale, color);
  }
  return { rgb, width, height, families: fams?.families ?? [] };
}

const readSoup = (src) => (src.startsWith('aleatoria:')
  ? randomSoup(131072, makeRng(Number(src.slice('aleatoria:'.length)), 'v2'))
  : new Uint8Array(readFileSync(src)));
const size = (s) => { const m = /^(\d+)x(\d+)$/.exec(s ?? ''); if (!m) throw new Error(`mida incorrecta: ${s} (ha de ser AxB)`); return [Number(m[1]), Number(m[2])]; };
const report = (fams) => fams.map((f) => `  família ${f.id}: ${(100 * f.share).toFixed(1)} % del mapa${f.slot >= 0 ? ` (color ${f.slot + 1})` : ''}`).join('\n');

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const args = process.argv.slice(2);
  const opt = (name, def) => { const i = args.indexOf(name); if (i < 0) return def; const v = args[i + 1]; args.splice(i, 2); return v; };
  const flag = (name) => { const i = args.indexOf(name); if (i < 0) return false; args.splice(i, 1); return true; };
  const scale = Number(opt('--escala', 0)) || undefined;
  const simple = flag('--simple');
  const cmd = args[0];
  if (cmd === 'sopa') {
    const programs = Number(opt('--programes', 128)), first = Number(opt('--des-de', 0));
    const [out, ...srcs] = args.slice(1);
    const img = row(srcs.map((s) => soupImage(readSoup(s), { programs, first, scale: scale ?? 3 })));
    writeFileSync(out, encodePng(img.rgb, img.width, img.height));
  } else if (cmd === 'mon') {
    const [wh, out, ...srcs] = args.slice(1);
    const [W, H] = size(wh);
    const tracker = createFamilyTracker();
    const imgs = srcs.map((s, i) => worldImage(readSoup(s), W, H, { scale: scale ?? 2, tracker, epoch: i, simple }));
    imgs.forEach((im, i) => console.log(`${srcs[i]}:\n${report(im.families) || '  (cap família)'}`));
    const img = row(imgs);
    writeFileSync(out, encodePng(img.rgb, img.width, img.height));
  } else if (cmd === 'animacio') {
    const delay = Number(opt('--retard', 120));
    const [wh, out, ...files] = args.slice(1);
    const [W, H] = size(wh);
    const tracker = createFamilyTracker();
    const frames = files.map((f, i) => worldImage(readSoup(f), W, H, { scale: scale ?? 1, tracker, epoch: i, simple }));
    writeFileSync(out, encodeApng(frames.map((f) => f.rgb), frames[0].width, frames[0].height, { delayMs: delay, lastMs: delay * 12 }));
  } else if (cmd === 'km') {
    const labels = opt('--etiquetes', 'món quiet|corrent 0,01').split('|');
    const [dirA, dirB, out] = args.slice(1);
    const { kmSvg } = await import('../fase2/quadern-serie.mjs');
    const { readSeries } = await import('../fase2/estadistica.mjs');
    let svg = kmSvg(readSeries(dirA), readSeries(dirB), { labelA: labels[0], labelB: labels[1] });
    // Colors fixos en lloc de les variables del quadern, i un fons blanc
    const vars = { '--text-2': '#52514e', '--grid': '#e1e0d9', '--axis': '#c3c2b7', '--series-1': '#2a78d6', '--op-loop': '#eb6834' };
    for (const [k, v] of Object.entries(vars)) svg = svg.split(`var(${k})`).join(v);
    svg = svg.replace('<svg class="km" ', '<svg xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" ')
      .replace(/(<svg[^>]*>)/, '$1\n  <rect width="640" height="300" fill="#ffffff"/>');
    writeFileSync(out, svg + '\n');
  } else {
    console.error('Ús: node eines/imatges.mjs sopa|mon|animacio|km ... (vegeu la capçalera del fitxer)');
    process.exit(2);
  }
}
