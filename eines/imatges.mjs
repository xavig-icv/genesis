// Imatges dels resultats per al README i el quadern, generades a partir de les captures (.bin): es poden
// tornar a fer amb els mateixos fitxers i donen sempre la mateixa imatge. Sense dependències.
//
//   node eines/imatges.mjs sopa sortida.png <captura.bin | aleatoria:LLAVOR[:v1]> ... [--programes N] [--des-de I] [--escala S]
//        tires de programes de la sopa, l'una al costat de l'altra: cada fila és un programa de 64 bytes, i
//        cada byte té el color de la seva família d'instruccions (els colors de la interfície del navegador)
//   node eines/imatges.mjs mon WxH sortida.png captura.bin ... [--escala S] [--simple] [--graella] [--marc X,Y,AMPLADA,ALCADA]
//        mons 2D, l'un al costat de l'altre: cada cel·la és un programa. El gris diu quantes instruccions té
//        (els programes a l'atzar en tenen poques), i les tres famílies de replicadors més grans del registre
//        (fase2/families.js) tenen el seu color, com a la interfície: rosa, verd i violeta, i les altres
//        famílies, gris fosc. Amb --simple, el gris només té tres tons (un fitxer molt més petit). Amb --graella,
//        cada cel·la té una vora del color del fons, i es veu la quadrícula. Amb --marc, hi dibuixa un
//        rectangle (per marcar on fa zoom una altra imatge)
//   node eines/imatges.mjs codi WxH sortida.png captura.bin ... [--byte P] [--marc X,Y,AMPLADA,ALCADA]
//        la vista de codi de la interfície: cada cel·la mostra els seus 64 bytes en una quadrícula de 8 × 8, amb
//        els colors de les instruccions, i un marc del color de la seva família (si en té). Amb --byte P, cada
//        byte fa P × P píxels
//   node eines/imatges.mjs animacio WxH sortida.png captura.bin ... [--escala S] [--retard ms] [--simple]
//        un PNG animat (APNG) amb un món per captura, en l'ordre donat; cada família conserva el color
//   Per a mon, codi i animacio, --regio X,Y,AMPLADA,ALCADA (en cel·les) en dibuixa només una part (el registre
//   de famílies es fa igualment amb tot el món). Per a totes les imatges, --tema fosc fa servir els colors del
//   mode fosc de la interfície.
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
// Els dos temes de la interfície: surface és el color dels marcs de la vista de codi i de la graella
export const THEMES = {
  clar: { ...COLORS, surface: hex('#fcfcfb'), ink: hex('#0b0b0b'), world: WORLD },
  fosc: {
    page: hex('#0d0d0d'), copy: hex('#3987e5'), loop: hex('#d95926'), head: hex('#199e70'), arith: hex('#ffffff'),
    zero: hex('#1a1a19'), lo: hex('#242423'), hi: hex('#363633'), surface: hex('#1a1a19'), ink: hex('#ffffff'),
    world: { lo: hex('#1f1f1e'), hi: hex('#45453f'), fam: [hex('#d55181'), hex('#008300'), hex('#9085e9')], other: hex('#c3c2b7') },
  },
};
const FAMILY = new Array(256).fill('data');
FAMILY[0] = 'zero';
for (const c of '.,') FAMILY[c.charCodeAt(0)] = 'copy';
for (const c of '[]') FAMILY[c.charCodeAt(0)] = 'loop';
for (const c of '<>{}') FAMILY[c.charCodeAt(0)] = 'head';
for (const c of '+-') FAMILY[c.charCodeAt(0)] = 'arith';
const byteColor = (v, t = THEMES.clar) => (FAMILY[v] === 'data'
  ? t.lo.map((c, i) => Math.round(c + (t.hi[i] - c) * (v / 255)))
  : t[FAMILY[v]]);
const mix = (a, b, f) => a.map((c, i) => Math.round(c + (b[i] - c) * f));
// La densitat d'instruccions d'una cel·la (k de 0 a 64): contínua, com a la interfície, o en tres tons
const density = (k, simple, w = WORLD) => (simple
  ? (k < 8 ? w.lo : k < 16 ? mix(w.lo, w.hi, 0.5) : w.hi)
  : mix(w.lo, w.hi, Math.min(1, k / 24)));

function blank(width, height, color = COLORS.page) {
  const rgb = new Uint8Array(width * height * 3);
  for (let i = 0; i < width * height; i++) rgb.set(color, i * 3);
  return rgb;
}
function square(rgb, width, x, y, scale, color) {
  for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) rgb.set(color, ((y + dy) * width + x + dx) * 3);
}
// Diverses imatges de la mateixa alçada, l'una al costat de l'altra, amb un marge entre elles
export function row(images, gap = 12, color = [255, 255, 255]) {
  const height = Math.max(...images.map((im) => im.height));
  const width = images.reduce((s, im) => s + im.width, 0) + gap * (images.length - 1);
  const rgb = blank(width, height, color);
  let x0 = 0;
  for (const im of images) {
    for (let y = 0; y < im.height; y++) rgb.set(im.rgb.subarray(y * im.width * 3, (y + 1) * im.width * 3), (y * width + x0) * 3);
    x0 += im.width + gap;
  }
  return { rgb, width, height };
}

// Una tira de programes: { rgb, width, height }
export function soupImage(soup, { first = 0, programs = 128, scale = 3, theme = THEMES.clar } = {}) {
  const width = PROGRAM_SIZE * scale, height = programs * scale;
  const rgb = blank(width, height, theme.page);
  for (let p = 0; p < programs; p++) {
    for (let i = 0; i < PROGRAM_SIZE; i++) square(rgb, width, i * scale, p * scale, scale, byteColor(soup[(first + p) * PROGRAM_SIZE + i], theme));
  }
  return { rgb, width, height };
}

// La part del món que es dibuixa: [x, y, amplada, alçada] en cel·les (per defecte, tot)
function crop(region, W, H) {
  const [x0, y0, w, h] = region ?? [0, 0, W, H];
  if (!(x0 >= 0 && y0 >= 0 && w > 0 && h > 0 && x0 + w <= W && y0 + h <= H)) throw new Error(`regió fora del món: ${region}`);
  return [x0, y0, w, h];
}

// Un món 2D. tracker: un registre de famílies (createFamilyTracker); amb el mateix per a diverses imatges,
// cada família conserva el color. Amb grid, l'última fila i l'última columna de cada cel·la fan de graella.
// Amb mark ([x, y, amplada, alçada] en cel·les), hi dibuixa un rectangle.
export function worldImage(soup, W, H, { scale = 2, tracker = null, epoch = 0, simple = false, region = null, grid = false, mark = null, theme = THEMES.clar } = {}) {
  const fams = tracker ? tracker.analyse(soup, W * H, epoch, W) : null;
  const [x0, y0, w, h] = crop(region, W, H);
  const width = w * scale, height = h * scale;
  const rgb = blank(width, height, theme.surface);
  const inner = grid ? scale - 1 : scale;
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const c = y * W + x;
      let color;
      const f = fams && fams.map[c] ? fams.families[fams.map[c] - 1] : null;
      if (f) color = f.slot >= 0 ? theme.world.fam[f.slot] : theme.world.other;
      else {
        let k = 0;
        for (let i = 0; i < PROGRAM_SIZE; i++) if (KIND[soup[c * PROGRAM_SIZE + i]]) k++;
        color = density(k, simple, theme.world);
      }
      square(rgb, width, (x - x0) * scale, (y - y0) * scale, inner, color);
    }
  }
  if (mark) outline(rgb, width, height, (mark[0] - x0) * scale, (mark[1] - y0) * scale, mark[2] * scale, mark[3] * scale, theme.ink);
  return { rgb, width, height, families: fams?.families ?? [] };
}

// Un rectangle buit de 2 píxels de gruix (per marcar on fa zoom la imatge següent)
function outline(rgb, width, height, x, y, w, h, color) {
  const put = (px, py) => { if (px >= 0 && py >= 0 && px < width && py < height) rgb.set(color, (py * width + px) * 3); };
  for (let t = 0; t < 2; t++) {
    for (let i = -2; i < w + 2; i++) { put(x + i, y - 1 - t); put(x + i, y + h + t); }
    for (let j = -2; j < h + 2; j++) { put(x - 1 - t, y + j); put(x + w + t, y + j); }
  }
}

// La vista de codi de la interfície (fase2/main.js): cada cel·la és un bloc de 10 × 10 píxels, amb els seus 64
// bytes en una quadrícula de 8 × 8 (byte píxels per byte) i un marc d'un píxel del color de la seva família.
export function codeImage(soup, W, H, { tracker = null, epoch = 0, region = null, byte = 1, mark = null, theme = THEMES.clar } = {}) {
  const fams = tracker ? tracker.analyse(soup, W * H, epoch, W) : null;
  const [x0, y0, w, h] = crop(region, W, H);
  // De més a prop (byte ≥ 4), el marc es fa més gruixut i els bytes queden separats per una línia del fons
  const frame = byte >= 4 ? Math.ceil(byte / 4) : 1, sep = byte >= 4 ? 1 : 0;
  const cell = 8 * byte + 2 * frame;
  const width = w * cell, height = h * cell;
  const rgb = blank(width, height, theme.surface);
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const c = y * W + x, ox = (x - x0) * cell, oy = (y - y0) * cell;
      const f = fams && fams.map[c] ? fams.families[fams.map[c] - 1] : null;
      if (f) {
        const color = f.slot >= 0 ? theme.world.fam[f.slot] : theme.world.other;
        for (let t = 0; t < frame; t++) {
          for (let i = 0; i < cell; i++) {
            rgb.set(color, ((oy + t) * width + ox + i) * 3);
            rgb.set(color, ((oy + cell - 1 - t) * width + ox + i) * 3);
            rgb.set(color, ((oy + i) * width + ox + t) * 3);
            rgb.set(color, ((oy + i) * width + ox + cell - 1 - t) * 3);
          }
        }
      }
      for (let b = 0; b < PROGRAM_SIZE; b++) {
        square(rgb, width, ox + frame + (b % 8) * byte, oy + frame + (b >> 3) * byte, byte - sep, byteColor(soup[c * PROGRAM_SIZE + b], theme));
      }
    }
  }
  if (mark) outline(rgb, width, height, (mark[0] - x0) * cell, (mark[1] - y0) * cell, mark[2] * cell, mark[3] * cell, theme.ink);
  return { rgb, width, height, families: fams?.families ?? [] };
}

// aleatoria:LLAVOR[:v1] és la sopa inicial que fa sim.mjs amb aquesta llavor (i el generador v2, o el v1 dels
// experiments anteriors a l'auditoria 1)
function readSoup(src) {
  if (!src.startsWith('aleatoria:')) return new Uint8Array(readFileSync(src));
  const [seed, version = 'v2'] = src.slice('aleatoria:'.length).split(':');
  return randomSoup(131072, makeRng(Number(seed), version));
}
const size = (s) => { const m = /^(\d+)x(\d+)$/.exec(s ?? ''); if (!m) throw new Error(`mida incorrecta: ${s} (ha de ser AxB)`); return [Number(m[1]), Number(m[2])]; };
const report = (fams) => fams.map((f) => `  família ${f.id}: ${(100 * f.share).toFixed(1)} % del mapa${f.slot >= 0 ? ` (color ${f.slot + 1})` : ''}`).join('\n');

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const args = process.argv.slice(2);
  const opt = (name, def) => { const i = args.indexOf(name); if (i < 0) return def; const v = args[i + 1]; args.splice(i, 2); return v; };
  const flag = (name) => { const i = args.indexOf(name); if (i < 0) return false; args.splice(i, 1); return true; };
  const scale = Number(opt('--escala', 0)) || undefined;
  const simple = flag('--simple'), grid = flag('--graella');
  const theme = THEMES[opt('--tema', 'clar')];
  if (!theme) throw new Error('--tema ha de ser clar o fosc');
  const regionArg = opt('--regio');
  const region = regionArg ? regionArg.split(',').map(Number) : null;
  const markArg = opt('--marc');
  const mark = markArg ? markArg.split(',').map(Number) : null;
  const byte = Number(opt('--byte', 1));
  const gapColor = theme === THEMES.clar ? [255, 255, 255] : theme.page;
  const cmd = args[0];
  if (cmd === 'sopa') {
    const programs = Number(opt('--programes', 128)), first = Number(opt('--des-de', 0));
    const [out, ...srcs] = args.slice(1);
    const img = row(srcs.map((s) => soupImage(readSoup(s), { programs, first, scale: scale ?? 3, theme })), 12, gapColor);
    writeFileSync(out, encodePng(img.rgb, img.width, img.height));
  } else if (cmd === 'mon') {
    const [wh, out, ...srcs] = args.slice(1);
    const [W, H] = size(wh);
    const tracker = createFamilyTracker();
    const imgs = srcs.map((s, i) => worldImage(readSoup(s), W, H, { scale: scale ?? 2, tracker, epoch: i, simple, region, grid, mark, theme }));
    imgs.forEach((im, i) => console.log(`${srcs[i]}:\n${report(im.families) || '  (cap família)'}`));
    const img = row(imgs, 12, gapColor);
    writeFileSync(out, encodePng(img.rgb, img.width, img.height));
  } else if (cmd === 'codi') {
    const [wh, out, ...srcs] = args.slice(1);
    const [W, H] = size(wh);
    const tracker = createFamilyTracker();
    const imgs = srcs.map((s, i) => codeImage(readSoup(s), W, H, { tracker, epoch: i, region, byte, mark, theme }));
    imgs.forEach((im, i) => console.log(`${srcs[i]}:\n${report(im.families) || '  (cap família)'}`));
    const img = row(imgs, 12, gapColor);
    writeFileSync(out, encodePng(img.rgb, img.width, img.height));
  } else if (cmd === 'animacio') {
    const delay = Number(opt('--retard', 120));
    const [wh, out, ...files] = args.slice(1);
    const [W, H] = size(wh);
    const tracker = createFamilyTracker();
    const frames = files.map((f, i) => worldImage(readSoup(f), W, H, { scale: scale ?? 1, tracker, epoch: i, simple, region, grid, theme }));
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
    console.error('Ús: node eines/imatges.mjs sopa|mon|codi|animacio|km ... (vegeu la capçalera del fitxer)');
    process.exit(2);
  }
}
