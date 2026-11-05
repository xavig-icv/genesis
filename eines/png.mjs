// Codificador mínim de PNG i d'APNG (PNG animat), sense dependències: només zlib de Node.
// Les imatges són RGB de 8 bits: un Uint8Array de mida amplada × alçada × 3. Per als APNG grans (les captures del lloc web),
// també amb una paleta comuna de fins a 256 colors (encodeApngIndexed), i un descodificador mínim de PNG (decodePng).
import { deflateSync, inflateSync } from 'zlib';

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
const u32 = (...v) => { const b = Buffer.alloc(4 * v.length); v.forEach((x, i) => b.writeUInt32BE(x, 4 * i)); return b; };
function ihdr(width, height) {
  const b = Buffer.alloc(13);
  b.writeUInt32BE(width, 0); b.writeUInt32BE(height, 4);
  b[8] = 8; b[9] = 2; // 8 bits, RGB
  return chunk('IHDR', b);
}
// Les files amb el filtre 0 al davant, comprimides
function pixels(rgb, width, height) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    Buffer.from(rgb.buffer, rgb.byteOffset + y * width * 3, width * 3).copy(raw, y * (width * 3 + 1) + 1);
  }
  return deflateSync(raw, { level: 9 });
}
const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function encodePng(rgb, width, height) {
  return Buffer.concat([SIGNATURE, ihdr(width, height), chunk('IDAT', pixels(rgb, width, height)), chunk('IEND', Buffer.alloc(0))]);
}

// Un APNG amb totes les imatges de la mateixa mida. delayMs: el temps de cada imatge; lastMs: el de l'última.
// cover: una imatge per defecte que no forma part de l'animació (la que mostren els visors que no animen, com
// les previsualitzacions); sense cover, és el primer fotograma.
export function encodeApng(frames, width, height, { delayMs = 100, lastMs = delayMs, loops = 0, cover = null } = {}) {
  const parts = [SIGNATURE, ihdr(width, height), chunk('acTL', u32(frames.length, loops))];
  if (cover) parts.push(chunk('IDAT', pixels(cover, width, height)));
  let seq = 0;
  frames.forEach((rgb, i) => {
    const ms = i === frames.length - 1 ? lastMs : delayMs;
    const fctl = Buffer.alloc(26);
    fctl.writeUInt32BE(seq++, 0); fctl.writeUInt32BE(width, 4); fctl.writeUInt32BE(height, 8);
    fctl.writeUInt32BE(0, 12); fctl.writeUInt32BE(0, 16);
    fctl.writeUInt16BE(ms, 20); fctl.writeUInt16BE(1000, 22); // retard = ms / 1000 s
    fctl[24] = 0; fctl[25] = 0; // sense esborrar; substitueix
    parts.push(chunk('fcTL', fctl));
    const data = pixels(rgb, width, height);
    parts.push(i === 0 && !cover ? chunk('IDAT', data) : chunk('fdAT', Buffer.concat([u32(seq++), data])));
  });
  parts.push(chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(parts);
}

// Un descodificador mínim: PNG de 8 bits per canal (gris, RGB, gris amb alfa o RGBA), sense entrellaçat, com els de les
// captures del navegador i els d'encodePng. Torna { width, height, rgb } (l'alfa, si n'hi ha, es descarta).
export function decodePng(png) {
  if (!png.subarray(0, 8).equals(SIGNATURE)) throw new Error('no és un PNG');
  let width = 0, height = 0, type = -1;
  const idat = [];
  for (let off = 8; off < png.length;) {
    const len = png.readUInt32BE(off), t = png.toString('ascii', off + 4, off + 8), data = png.subarray(off + 8, off + 8 + len);
    if (t === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4); type = data[9];
      if (data[8] !== 8 || data[12] !== 0) throw new Error('només PNG de 8 bits sense entrellaçat');
    }
    if (t === 'IDAT') idat.push(data);
    if (t === 'IEND') break;
    off += 12 + len;
  }
  const bpp = { 0: 1, 2: 3, 4: 2, 6: 4 }[type];
  if (!bpp) throw new Error(`tipus de color no suportat: ${type}`);
  const raw = inflateSync(Buffer.concat(idat)), stride = width * bpp;
  if (raw.length !== (stride + 1) * height) throw new Error('les dades no fan la mida de la imatge');
  let prev = Buffer.alloc(stride), cur = Buffer.alloc(stride);
  const rgb = new Uint8Array(width * height * 3);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let x = line[i];
      if (f === 1) x += a;
      else if (f === 2) x += b;
      else if (f === 3) x += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); x += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      else if (f !== 0) throw new Error(`filtre desconegut: ${f}`);
      cur[i] = x & 255;
    }
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 3, s = x * bpp;
      if (bpp < 3) rgb[o] = rgb[o + 1] = rgb[o + 2] = cur[s];
      else { rgb[o] = cur[s]; rgb[o + 1] = cur[s + 1]; rgb[o + 2] = cur[s + 2]; }
    }
    [prev, cur] = [cur, prev];
  }
  return { width, height, rgb };
}

// La distància entre dos colors, ponderada (el verd hi pesa més, com a l'ull)
const dist2 = (r, g, b, p, i) => 2 * (r - p[i]) ** 2 + 4 * (g - p[i + 1]) ** 2 + 3 * (b - p[i + 2]) ** 2;

// Una paleta comuna de fins a n colors per a uns quants fotogrames RGB: el tall per la mediana (cada vegada es parteix la caixa
// amb més error, pel canal amb més variància, a la seva mitjana) i sis passades de k-mitjanes. Determinista: els mateixos
// fotogrames donen la mateixa paleta. Si hi ha n colors o menys, la paleta són exactament aquests colors.
export function paletteOf(frames, n = 256) {
  const hist = new Map();
  for (const rgb of frames) for (let i = 0; i < rgb.length; i += 3) { const k = (rgb[i] << 16) | (rgb[i + 1] << 8) | rgb[i + 2]; hist.set(k, (hist.get(k) ?? 0) + 1); }
  const colors = [...hist].map(([k, c]) => ({ r: k >> 16, g: (k >> 8) & 255, b: k & 255, c }));
  if (colors.length <= n) return Uint8Array.from(colors.flatMap((x) => [x.r, x.g, x.b]));
  const stats = (items) => {
    let t = 0, mr = 0, mg = 0, mb = 0, vr = 0, vg = 0, vb = 0;
    for (const x of items) { t += x.c; mr += x.r * x.c; mg += x.g * x.c; mb += x.b * x.c; }
    mr /= t; mg /= t; mb /= t;
    for (const x of items) { vr += x.c * (x.r - mr) ** 2; vg += x.c * (x.g - mg) ** 2; vb += x.c * (x.b - mb) ** 2; }
    return { m: { r: mr, g: mg, b: mb }, v: { r: vr, g: vg, b: vb }, sse: vr + vg + vb };
  };
  const boxes = [{ items: colors, s: stats(colors) }];
  while (boxes.length < n) {
    let bi = -1, best = 0;
    boxes.forEach((b, i) => { if (b.items.length > 1 && b.s.sse > best) { best = b.s.sse; bi = i; } });
    if (bi < 0) break;
    const { items, s } = boxes[bi];
    const ch = ['r', 'g', 'b'].reduce((a, k) => (s.v[k] > s.v[a] ? k : a), 'r');
    items.sort((a, b) => a[ch] - b[ch]);
    let cut = items.findIndex((x) => x[ch] > s.m[ch]);
    if (cut <= 0) cut = items.length >> 1;
    const a = items.slice(0, cut), b = items.slice(cut);
    boxes.splice(bi, 1, { items: a, s: stats(a) }, { items: b, s: stats(b) });
  }
  let pal = boxes.flatMap((b) => [b.s.m.r, b.s.m.g, b.s.m.b]);
  for (let it = 0; it < 6; it++) {
    const sum = new Float64Array((pal.length / 3) * 4);
    for (const x of colors) {
      let bi = 0, bd = Infinity;
      for (let i = 0; i < pal.length; i += 3) { const d = dist2(x.r, x.g, x.b, pal, i); if (d < bd) { bd = d; bi = i / 3; } }
      sum[bi * 4] += x.r * x.c; sum[bi * 4 + 1] += x.g * x.c; sum[bi * 4 + 2] += x.b * x.c; sum[bi * 4 + 3] += x.c;
    }
    pal = pal.map((v, i) => { const j = Math.floor(i / 3) * 4; return sum[j + 3] ? sum[j + (i % 3)] / sum[j + 3] : v; });
  }
  return Uint8Array.from(pal.map((v) => Math.max(0, Math.min(255, Math.round(v)))));
}

// Els índexs d'un fotograma RGB a la paleta: el color més proper. cache: una memòria dels colors ja vistos, que es pot compartir
// entre fotogrames.
export function toIndices(rgb, pal, cache = new Map()) {
  const out = new Uint8Array(rgb.length / 3);
  for (let i = 0, j = 0; i < rgb.length; i += 3, j++) {
    const k = (rgb[i] << 16) | (rgb[i + 1] << 8) | rgb[i + 2];
    let p = cache.get(k);
    if (p === undefined) {
      let bd = Infinity;
      for (let q = 0; q < pal.length; q += 3) { const d = dist2(rgb[i], rgb[i + 1], rgb[i + 2], pal, q); if (d < bd) { bd = d; p = q / 3; } }
      cache.set(k, p);
    }
    out[j] = p;
  }
  return out;
}

// Un APNG amb una paleta comuna (tipus de color 3): cada fotograma, els índexs de la paleta (un Uint8Array de mida amplada ×
// alçada). Les opcions, com les d'encodeApng (cover també és d'índexs).
export function encodeApngIndexed(frames, pal, width, height, { delayMs = 100, lastMs = delayMs, loops = 0, cover = null } = {}) {
  if (pal.length % 3 || pal.length < 3 || pal.length > 768) throw new Error('la paleta ha de tenir d’1 a 256 colors');
  const head = Buffer.alloc(13);
  head.writeUInt32BE(width, 0); head.writeUInt32BE(height, 4);
  head[8] = 8; head[9] = 3; // 8 bits, amb paleta
  const rows = (idx) => {
    const raw = Buffer.alloc((width + 1) * height);
    for (let y = 0; y < height; y++) Buffer.from(idx.buffer, idx.byteOffset + y * width, width).copy(raw, y * (width + 1) + 1);
    return deflateSync(raw, { level: 9 });
  };
  const parts = [SIGNATURE, chunk('IHDR', head), chunk('PLTE', Buffer.from(pal)), chunk('acTL', u32(frames.length, loops))];
  if (cover) parts.push(chunk('IDAT', rows(cover)));
  let seq = 0;
  frames.forEach((idx, i) => {
    const fctl = Buffer.alloc(26);
    fctl.writeUInt32BE(seq++, 0); fctl.writeUInt32BE(width, 4); fctl.writeUInt32BE(height, 8);
    fctl.writeUInt16BE(i === frames.length - 1 ? lastMs : delayMs, 20); fctl.writeUInt16BE(1000, 22);
    parts.push(chunk('fcTL', fctl));
    const data = rows(idx);
    parts.push(i === 0 && !cover ? chunk('IDAT', data) : chunk('fdAT', Buffer.concat([u32(seq++), data])));
  });
  parts.push(chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(parts);
}
