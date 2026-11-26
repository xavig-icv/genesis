// A measure of descent by position (exploratory; the note, README.md): this note's tracer and the measures. The rest of the instrument is
// the small record's (../registre-copies/traca.mjs and mon.mjs), imported as it is; prova.mjs checks everything before it is used.
//  - Tracer: the small record's tracer, except that a mutation gives each byte it writes a NEW origin of its own (a number above the
//    world's bytes, in order), so that two cells that descend from one mutated byte share that origin;
//  - RefTracer: a second tracer written another way (the tags on the world's bytes directly), the slow reference of prova.mjs;
//  - the descent score by arrangement (the main measure): the map of the pairs of adjacent origins of half of a set's carriers, and how
//    many of a cell's pairs of adjacent bytes have their two origins adjacent in the map (forward or backward, at any offset); and, as
//    sensitivities, by absolute position (the first version of this note, and auditor 1's post hoc measure) and at any position;
//  - the one-origin count: the pairs of adjacent origins two cells share.
import { PROGRAM_SIZE, TAPE_SIZE } from '../../../../fase1/bff.js';
import { Tracer as SmallTracer, MUT, ARITH } from '../registre-copies/traca.mjs';

export { MUT, ARITH };
const P = PROGRAM_SIZE;
// the note: the windows, the seeds (of no plan), the map's share of carriers and its variants, the controls
export const WINDOWS = [1250, 250];
export const SPLIT_SEED = 3300000000;       // the halves of the carriers
export const MATCHED_SEED = 3200000000;     // the small record's: the same 200 matched cells
export const FAR = 64, MATCHED = 200, EDGE = 15, EDGES = [7, 15, 31];   // one origin: shared adjacent pairs (15 = a run of 16 bytes)
export const VARIANTS = [
  { key: 'adj1', frac: 0.01, mode: 'adj' },   // the main measure: adjacent bytes whose two origins are adjacent in 1 % of half A's carriers
  { key: 'adj05', frac: 0.005, mode: 'adj' },
  { key: 'adj5', frac: 0.05, mode: 'adj' },
  { key: 'pm1', frac: 0.01, mode: 'pm' },     // the first version of this note: the same position or the mirror (previ/)
  { key: 'p1', frac: 0.01, mode: 'p' },       // auditor 1's post hoc measure: the position only
  { key: 'any1', frac: 0.01, mode: 'any' },   // any position
];
export const MAIN = 'adj1';
export const MIN_HALF = 10, MIN_FAR = 100, SENS_Q = 0.10, FAR_MAX = 0.05, COPY_PCT = 0.90, NOT_PCT = 0.50, NULL_MAX = 0.05;
// the run that counts as descent: 16 bytes, the tracking's window (15 pairs of adjacent bytes; 16 bytes for the measures by byte)
export const RUN = { adj: 15, pm: 16, p: 16, any: 16 };

export class Tracer extends SmallTracer {
  constructor(observer, window, startEpoch, soup, nPairsMax) {
    super(observer, window, startEpoch, soup, nPairsMax);
    this.N = soup.length; this.next = soup.length;
  }
  mutated(list) { for (const i of list) { this.mask[i] = 0; this.flag[i] = MUT; this.orig[i] = this.next++; } }
}

// The reference: the same tags, kept on the world's bytes (not on the pairs' tapes), written another way
export class RefTracer {
  constructor(observer, soup) {
    const N = soup.length;
    this.observer = observer; this.N = N; this.next = N;
    this.mask = new Uint16Array(N); this.flag = new Uint8Array(N); this.orig = new Int32Array(N); this.snap = soup.slice();
    for (let i = 0; i < N; i++) { this.orig[i] = i; this.mask[i] = observer.carrier[Math.floor(i / P)]; }
    this.pairIdx = null;
  }
  mutated(list) { for (const i of list) { this.mask[i] = 0; this.flag[i] = MUT; this.orig[i] = this.next++; } }
  gather(pairIdx, nPairs) {
    this.pairIdx = pairIdx;
    for (let k = 0; k < 2 * nPairs; k++) {
      const c = pairIdx[k], b = this.observer.carrier[c];
      for (let j = 0; j < P; j++) this.mask[c * P + j] |= b;
    }
  }
  // a position of the pair's tape, as a byte of the world
  at(pair, x) { return x < P ? this.pairIdx[2 * pair] * P + x : this.pairIdx[2 * pair + 1] * P + (x - P); }
  apply(base, ev, n) {
    const pair = base / TAPE_SIZE;
    for (let k = 0; k < n; k++) {
      const d = this.at(pair, ev[2 * k]), s = ev[2 * k + 1];
      if (s < 0) { this.flag[d] |= ARITH; continue; }
      const q = this.at(pair, s);
      this.mask[d] = this.mask[q]; this.flag[d] = this.flag[q]; this.orig[d] = this.orig[q];
    }
  }
  scatter() {}
}

// The map of a set's carriers (cells), position by position: the origins that the byte at position j has in `frac` of them or more (at
// least 2). `thr` is that number of carriers; `pos` the keys origin·64 + j; `any` the origins counted over all positions.
// `adj`: the unordered pairs of origins of two adjacent bytes (j, j + 1), in that many carriers or more (each carrier counted once): a copy
// keeps them, forward or backward and at any offset; a new arrangement of the same bytes breaks them.
// The key of an unordered pair of origins, as a number; both below 2^26, or it fails (a world of 512 × 256 has 2^23 bytes, and the
// mutations of 1,250 epochs add a few million new origins)
const KEY = 67108864;
function pairKey(g, h) {
  if (g >= KEY || h >= KEY || g < 0 || h < 0) throw new Error(`an origin out of the keys' range (${g}, ${h})`);
  return g < h ? g * KEY + h : h * KEY + g;
}
export function buildMap(orig, cells, frac) {
  const at = new Map(), tot = new Map(), adj = new Map();
  for (const c of cells) {
    const seen = new Set();
    for (let j = 0; j < P; j++) {
      const g = orig[c * P + j], k = g * P + j;
      at.set(k, (at.get(k) ?? 0) + 1);
      tot.set(g, (tot.get(g) ?? 0) + 1);
      if (j + 1 < P) {
        const key = pairKey(g, orig[c * P + j + 1]);
        if (!seen.has(key)) { seen.add(key); adj.set(key, (adj.get(key) ?? 0) + 1); }
      }
    }
  }
  const thr = Math.max(2, Math.ceil(frac * cells.length));
  const pos = new Set(), any = new Set(), pairs = new Set();
  for (const [k, v] of at) if (v >= thr) pos.add(k);
  for (const [g, v] of tot) if (v >= thr) any.add(g);
  for (const [k, v] of adj) if (v >= thr) pairs.add(k);
  return { thr, pos, any, pairs };
}

// The descent score of a cell. Mode 'adj' (the main measure): how many of its 63 pairs of adjacent bytes have their two origins adjacent in
// the map. The others, how many of its 64 bytes have an origin of the map: 'pm' at their position or the mirror; 'p' at their position only;
// 'any' at any position.
export function score(orig, c, map, mode) {
  let k = 0;
  if (mode === 'adj') {
    for (let j = 0; j + 1 < P; j++) if (map.pairs.has(pairKey(orig[c * P + j], orig[c * P + j + 1]))) k++;
    return k;
  }
  for (let j = 0; j < P; j++) {
    const g = orig[c * P + j];
    if (mode === 'any' ? map.any.has(g) : map.pos.has(g * P + j) || (mode === 'pm' && map.pos.has(g * P + (P - 1 - j)))) k++;
  }
  return k;
}

// The one-origin count of two cells (the main rule): the pairs of adjacent origins they share (each pair once); 15 is a run of 16 bytes
export function shared(orig, a, b) {
  const A = new Set();
  for (let j = 0; j + 1 < P; j++) A.add(pairKey(orig[a * P + j], orig[a * P + j + 1]));
  const seen = new Set();
  for (let j = 0; j + 1 < P; j++) { const k = pairKey(orig[b * P + j], orig[b * P + j + 1]); if (A.has(k)) seen.add(k); }
  return seen.size;
}

// The first version's one-origin count (a sensitivity): bytes with the same origin at the same position, at the mirror position, the larger
export function aligned(orig, a, b) {
  let same = 0, mirror = 0;
  for (let j = 0; j < P; j++) {
    const g = orig[a * P + j];
    if (g === orig[b * P + j]) same++;
    if (g === orig[b * P + (P - 1 - j)]) mirror++;
  }
  return { same, mirror, max: Math.max(same, mirror) };
}

// A histogram of integer scores 0..64
export function hist(values) { const h = new Array(P + 1).fill(0); for (const v of values) h[v]++; return h; }
// The q-quantile of a histogram (the smallest score s with at least q of the values at s or below)... and the share at or above a score
export function quantile(h, q) { const n = h.reduce((a, b) => a + b, 0); if (!n) return null; let c = 0; for (let s = 0; s <= P; s++) { c += h[s]; if (c >= q * n) return s; } return P; }
export function shareAtLeast(h, s) { const n = h.reduce((a, b) => a + b, 0); if (!n) return null; let k = 0; for (let x = s; x <= P; x++) k += h[x]; return k / n; }
// The mid-rank percentile of a value among values
export function percentile(vals, v) { return vals.length ? (vals.filter((x) => x < v).length + 0.5 * vals.filter((x) => x === v).length) / vals.length : null; }
