// Com es mostra un programa com a text: cada byte, un caràcter acolorit
// segons la família d'instrucció. Compartit per totes les fases.
import { skeleton } from './motifs.js';

export const FAMILY = new Array(256).fill('data');
FAMILY[0] = 'zero';
for (const c of '.,') FAMILY[c.charCodeAt(0)] = 'copy';
for (const c of '[]') FAMILY[c.charCodeAt(0)] = 'loop';
for (const c of '<>{}') FAMILY[c.charCodeAt(0)] = 'head';
for (const c of '+-') FAMILY[c.charCodeAt(0)] = 'arith';

export const countInstructions = (bytes) => {
  let n = 0;
  for (const v of bytes) if (FAMILY[v] !== 'data' && FAMILY[v] !== 'zero') n++;
  return n;
};

// Posicions on apareix el fragment `motif` (en forma d'esquelet) dins de `bytes`.
export function motifMask(bytes, motif) {
  const mask = new Uint8Array(bytes.length);
  if (!motif) return mask;
  for (let i = 0; i + motif.length <= bytes.length; i++) {
    let j = 0;
    while (j < motif.length && skeleton(bytes[i + j]) === motif[j]) j++;
    if (j === motif.length) mask.fill(1, i, i + motif.length);
  }
  return mask;
}

export function renderProgram(container, bytes, motif = null, isSkeleton = false) {
  const mask = motifMask(bytes, motif);
  const frag = document.createDocumentFragment();
  for (let i = 0; i < bytes.length; i++) {
    const v = bytes[i];
    const fam = FAMILY[v];
    const span = document.createElement('span');
    span.className = `g ${fam}${mask[i] ? ' motif' : ''}`;
    span.textContent = fam === 'data' ? '·' : fam === 'zero' ? '0' : String.fromCharCode(v);
    if (fam === 'data') span.title = isSkeleton ? 'qualsevol byte de dades' : `byte ${v}`;
    frag.appendChild(span);
  }
  container.replaceChildren(frag);
}

// Llegeix un color #rrggbb d'una variable CSS i el retorna com a [r, g, b].
export function cssRgb(name) {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Empaqueta un color per a un Uint32Array sobre ImageData (RGBA en little-endian).
export const pack = ([r, g, b]) => ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;

// Taula de colors per a cada valor de byte, segons les variables CSS de la pàgina.
export function byteLut() {
  const lut = new Uint32Array(256);
  const colors = {
    copy: pack(cssRgb('--op-copy')),
    loop: pack(cssRgb('--op-loop')),
    head: pack(cssRgb('--op-head')),
    arith: pack(cssRgb('--op-arith')),
    zero: pack(cssRgb('--byte-zero')),
  };
  const lo = cssRgb('--byte-lo'), hi = cssRgb('--byte-hi');
  for (let v = 0; v < 256; v++) {
    const fam = FAMILY[v];
    lut[v] = fam === 'data' ? pack(lo.map((c, i) => Math.round(c + (hi[i] - c) * (v / 255)))) : colors[fam];
  }
  return lut;
}
