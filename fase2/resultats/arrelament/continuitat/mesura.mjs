// A measure of continuity (exploratory; the note, README.md): the measures, as functions of the bytes' origins, and the synthetic cells of
// known answer that test them. Nothing here reads a record or a capture.
//
// The origins are those of the descent note's tracer (../descendencia/traca.mjs): each byte of the world is its own origin at the window's
// start (its index, below N = the world's bytes); a copy passes the origin on; a mutation gives the byte a new origin of its own (N or more).
// A cell is 64 origins (an Int32Array and the offset of its first byte).
//
// The context of a census and a window (`context`): the map of the descent note, built as it was (buildMap, imported as it is) from the
// carriers of half A of the dominant group D (the donors): the unordered pairs of origins of two adjacent bytes found in `frac` of them or
// more (at least 2). The donors' distinct sequences of origins, with an index from each origin to where it sits in them.
//
// The main measure, the ordered run (`orderedRun`): the longest run of the cell's consecutive bytes that sits, in the same order (forward or
// backward, at any offset), in ONE donor; each pair of adjacent bytes of the run that are not bridged is a pair of the map; the run may pass
// over the cell's own mutations (an origin of a mutation, N or more, that is not an origin of the map), at most 2 bytes in a row, which
// keep their place in the donor (a substitution, not an insertion). The run starts and ends on a byte that is not bridged.
// The classes of a cell (`classOf`): 'ordered' if the ordered run is 16 bytes or more (the tracking's window); 'pieces' if it is shorter
// but the cell holds at least one pair of the map; 'none' if it holds none.
// Sensitivities, never read for the classes: `mapRun` (auditor 1's post hoc measure at audit 45 made exact: the longest run of map pairs,
// passing over at most 2 own mutations in a row where the map's order passes, with no donor); `donorRun` (the ordered run without the map:
// any run in one donor); `score` (entry 28's measure: how many of the 63 adjacent pairs are map pairs, each position counted).
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { makeRng } from '../../../../fase1/soup.js';
import { buildMap } from '../descendencia/traca.mjs';

const P = PROGRAM_SIZE;
export const RUN = 16;        // the bytes in a row that make an ordered run: the tracking's window
export const MAX_GAP = 2;     // own mutations passed over: at most 2 bytes in a row
export const FRAC = 0.01;     // the map: pairs in 1 % of half A (sensitivities 0.005 and 0.05)
export const FRACS = [0.01, 0.005, 0.05];

// The key of an unordered pair of origins, exactly as ../descendencia/traca.mjs builds it (both below 2^26, or it fails)
const KEY = 67108864;
export function pairKey(g, h) {
  if (g >= KEY || h >= KEY || g < 0 || h < 0) throw new Error(`an origin out of the keys' range (${g}, ${h})`);
  return g < h ? g * KEY + h : h * KEY + g;
}

// The context: `donors` a flat Int32Array of half A's carriers (64 origins each), `frac` the map's share, `N` the world's bytes
export function context(donors, frac, N) {
  if (!(donors.length % P === 0) || !Number.isSafeInteger(N) || N <= 0) throw new Error('the donors are not whole cells, or N is not a count');
  const nA = donors.length / P;
  const map = buildMap(donors, [...Array(nA).keys()], frac);
  const nb = new Map();
  for (const k of map.pairs) {
    const lo = k % KEY, hi = Math.floor(k / KEY);
    if (!nb.has(lo)) nb.set(lo, new Set());
    if (!nb.has(hi)) nb.set(hi, new Set());
    nb.get(lo).add(hi); nb.get(hi).add(lo);
  }
  // the donors' distinct sequences, and where each origin sits in them (sequence × 64 + position)
  const seen = new Map(), uniq = [];
  for (let c = 0; c < nA; c++) {
    const s = donors.subarray(c * P, c * P + P), key = s.join(',');
    if (!seen.has(key)) { seen.set(key, uniq.length); uniq.push(s); }
  }
  const seq = new Int32Array(uniq.length * P);
  uniq.forEach((s, u) => seq.set(s, u * P));
  const lists = new Map();
  for (let i = 0; i < seq.length; i++) { const g = seq[i]; let l = lists.get(g); if (!l) lists.set(g, (l = [])); l.push(i); }
  const index = new Map();
  let maxOcc = 1;
  for (const [g, l] of lists) { index.set(g, Int32Array.from(l)); maxOcc = Math.max(maxOcc, l.length); }
  return { N, frac, thr: map.thr, pairs: map.pairs, nb, seq, nUniq: uniq.length, index, nDonors: nA,
    at: new Int32Array(2 * maxOcc), dir: new Int8Array(2 * maxOcc) };   // the alignments' scratch space
}

// A cell's own mutation: an origin of a mutation (N or more) that is not an origin of the map
export const bridgeable = (ctx, g) => g >= ctx.N && !ctx.nb.has(g);

// How many distinct map pairs the cell's 63 adjacent pairs hold; and entry 28's score (each position counted)
export function distinct(ctx, o, off) {
  const s = new Set();
  for (let j = 0; j + 1 < P; j++) { const k = pairKey(o[off + j], o[off + j + 1]); if (ctx.pairs.has(k)) s.add(k); }
  return s.size;
}
export function score(ctx, o, off) {
  let k = 0;
  for (let j = 0; j + 1 < P; j++) if (ctx.pairs.has(pairKey(o[off + j], o[off + j + 1]))) k++;
  return k;
}

// Is there a path of exactly `len` steps from g to h in the map's graph (len 2 or 3: one or two bytes passed over)?
function mapPath(ctx, g, h, len) {
  const a = ctx.nb.get(g);
  if (!a) return false;
  for (const x of a) {
    const b = ctx.nb.get(x);
    if (!b) continue;
    if (len === 2) { if (b.has(h)) return true; continue; }
    for (const y of b) { const c = ctx.nb.get(y); if (c && c.has(h)) return true; }
  }
  return false;
}

// The cell's segments, the runs an ordered run can lie in: bytes not bridged joined to the next one not bridged when their pair is a map pair
// (mode 'map'; 'path' also checks, across a bridge, that the map's order passes there; 'any' joins every pair, no map), passing over at most
// MAX_GAP bridgeable bytes in a row; [first, last] byte positions, both not bridged, last > first. With mode 'map' the segments bound the
// ordered run from above.
export function segments(ctx, o, off, mode) {
  const segs = [];
  let s = -1, last = -1, gap = 0;
  const close = () => { if (s >= 0 && last > s) segs.push([s, last]); s = -1; last = -1; gap = 0; };
  for (let j = 0; j < P; j++) {
    const g = o[off + j];
    if (bridgeable(ctx, g)) { if (s >= 0 && ++gap > MAX_GAP) close(); continue; }
    if (s >= 0) {
      const ok = mode === 'any' || (gap === 0 ? ctx.pairs.has(pairKey(o[off + last], g)) : (mode !== 'path' || mapPath(ctx, o[off + last], g, gap + 1)));
      if (ok) { last = j; gap = 0; continue; }
      close();
    }
    s = j; last = j; gap = 0;
  }
  close();
  return segs;
}

// Auditor 1's post hoc measure, made exact (a sensitivity): the longest segment with the map's order checked across the bridges
export function mapRun(ctx, o, off) {
  let best = 0;
  for (const [s, e] of segments(ctx, o, off, 'path')) best = Math.max(best, e - s + 1);
  return best;
}

// The longest run inside [s, e] that sits in one donor (forward or backward), passing over the bridgeable bytes, which keep their place;
// `best` the run to beat. Returns { run, from, to, dir }.
function inDonor(ctx, o, off, s, e, best) {
  let res = { run: best, from: -1, to: -1, dir: 0 };
  const seq = ctx.seq;
  for (let a = s; a <= e; a++) {
    const g = o[off + a];
    if (bridgeable(ctx, g)) continue;
    if (e - a + 1 <= res.run) break;
    const occ = ctx.index.get(g);
    if (!occ) continue;
    // the alignments: each place of g in a donor, forward and backward
    let m = 2 * occ.length;
    const at = ctx.at, dir = ctx.dir;
    for (let i = 0; i < occ.length; i++) { at[2 * i] = occ[i]; dir[2 * i] = 1; at[2 * i + 1] = occ[i]; dir[2 * i + 1] = -1; }
    let good = a;
    for (let j = a + 1; j <= e && m > 0; j++) {
      const h = o[off + j], br = bridgeable(ctx, h);
      let k = 0;
      for (let i = 0; i < m; i++) {
        const base = at[i] - (at[i] % P), p = (at[i] % P) + dir[i] * (j - a);
        if (p < 0 || p >= P) continue;
        if (!br && seq[base + p] !== h) continue;
        at[k] = at[i]; dir[k] = dir[i]; k++;
      }
      m = k;
      if (m > 0 && !br) good = j;
    }
    if (good - a + 1 > res.run) {
      // the direction of the run found (the first surviving alignment that reaches `good`), for the description only
      res = { run: good - a + 1, from: a, to: good, dir: 0 };
    }
  }
  return res;
}

// The main measure: the ordered run (0 if the cell holds no map pair). Returns { run, from, to }.
export function orderedRun(ctx, o, off) {
  const segs = segments(ctx, o, off, 'map').sort((x, y) => (y[1] - y[0]) - (x[1] - x[0]) || x[0] - y[0]);
  let best = { run: 0, from: -1, to: -1 };
  for (const [s, e] of segs) {
    if (e - s + 1 <= best.run) break;
    const r = inDonor(ctx, o, off, s, e, best.run);
    if (r.run > best.run) best = { run: r.run, from: r.from, to: r.to };
  }
  return best;
}

// A sensitivity: the longest run in one donor with no map condition (the bridges as in the main measure)
export function donorRun(ctx, o, off) {
  let best = 0;
  const segs = segments(ctx, o, off, 'any').sort((x, y) => (y[1] - y[0]) - (x[1] - x[0]) || x[0] - y[0]);
  for (const [s, e] of segs) { if (e - s + 1 <= best) break; best = Math.max(best, inDonor(ctx, o, off, s, e, best).run); }
  return best;
}

// The class of a cell
export const classOf = (run, nDistinct) => (run >= RUN ? 'ordered' : nDistinct > 0 ? 'pieces' : 'none');
// The class of an appearance from its cells' classes: 'ordered' if half or more of its cells are; 'none' if all are; else 'pieces'
export function appearanceClass(classes) {
  const k = classes.filter((c) => c === 'ordered').length;
  return 2 * k >= classes.length ? 'ordered' : classes.every((c) => c === 'none') ? 'none' : 'pieces';
}

// The run's pairs of adjacent bytes that were already adjacent at the window's start (two world bytes of one cell, side by side): the rest
// were made within the window (descriptive)
export function startAdjacent(ctx, o, off, from, to) {
  let k = 0, all = 0;
  for (let j = from; j < to; j++) {
    const g = o[off + j], h = o[off + j + 1];
    if (bridgeable(ctx, g) || bridgeable(ctx, h)) continue;
    all++;
    if (g < ctx.N && h < ctx.N && Math.floor(g / P) === Math.floor(h / P) && Math.abs(g - h) === 1) k++;
  }
  return { k, all };
}

// The longest common run of two cells: consecutive bytes of one with the same origins, in order, as consecutive bytes of the other (forward
// or backward). With `outside` (a context), only runs whose adjacent pairs are all not map pairs: material the two share that is not the
// dominant group's order (one origin, descriptive).
export function commonRun(o1, off1, o2, off2, outside = null) {
  let best = 0;
  for (const d of [1, -1]) {
    let prev = new Int32Array(P), cur = new Int32Array(P);
    for (let i = 0; i < P; i++) {
      cur.fill(0);
      for (let j = 0; j < P; j++) {
        if (o1[off1 + i] !== o2[off2 + j]) continue;
        const pj = j - d;
        let L = 1;
        if (i > 0 && pj >= 0 && pj < P && prev[pj] > 0) {
          if (!outside || !outside.pairs.has(pairKey(o1[off1 + i - 1], o1[off1 + i]))) L = prev[pj] + 1;
        }
        cur[j] = L;
        if (L > best) best = L;
      }
      [prev, cur] = [cur, prev];
    }
  }
  return best;
}

// ---------------------------------------------------------------------------------------------------------------------------------------
// Synthetic cells of known answer, built from real cells (the controls of each census, and prova.mjs). `rng` a makeRng; `fresh` a function
// that gives a new own-mutation origin each call (above every origin of the census).

// A permutation of k pieces in which no two pieces consecutive in the source end up side by side (either order)
function separated(k, rng) {
  for (let tries = 0; tries < 10000; tries++) {
    const p = [...Array(k).keys()];
    for (let i = k - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [p[i], p[j]] = [p[j], p[i]]; }
    let ok = true;
    for (let i = 0; i + 1 < k && ok; i++) if (Math.abs(p[i] - p[i + 1]) === 1) ok = false;
    if (ok) return p;
  }
  throw new Error(`no separated permutation of ${k} pieces`);
}
// The source cut into pieces of `size` bytes, the pieces in a separated order (each piece keeps its own order)
export function shuffledPieces(src, off, size, rng) {
  if (P % size !== 0 || size >= P / 2 + 1) throw new Error(`pieces of ${size} bytes`);
  const k = P / size, perm = separated(k, rng), out = new Int32Array(P);
  perm.forEach((q, i) => out.set(src.subarray(off + q * size, off + q * size + size), i * size));
  return out;
}
// `count` pieces of `size` bytes of the source, in a separated order, at random aligned slots of a foreign cell (the rest stays foreign)
export function piecesInForeign(src, off, foreign, foff, size, count, rng) {
  const k = P / size, out = foreign.slice(foff, foff + P);
  if (count > k) throw new Error('too many pieces');
  const order = separated(k, rng).slice(0, count);
  const slots = [...Array(k).keys()];
  for (let i = k - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [slots[i], slots[j]] = [slots[j], slots[i]]; }
  const chosen = slots.slice(0, count).sort((a, b) => a - b);
  // two pieces consecutive in the source never land in slots side by side
  for (let tries = 0; tries < 1000; tries++) {
    let ok = true;
    for (let i = 0; i + 1 < count && ok; i++) if (chosen[i + 1] === chosen[i] + 1 && Math.abs(order[i] - order[i + 1]) === 1) ok = false;
    if (ok) break;
    for (let i = count - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [order[i], order[j]] = [order[j], order[i]]; }
  }
  chosen.forEach((sl, i) => out.set(src.subarray(off + order[i] * size, off + order[i] * size + size), sl * size));
  return out;
}
// A pair of origins repeated over the whole cell
export const repeatedPair = (g, h) => Int32Array.from({ length: P }, (_, j) => (j % 2 ? h : g));
// The source with `k` of its bytes in [from, to] replaced by own mutations (distinct random positions)
export function mutatedCopy(src, off, k, from, to, rng, fresh) {
  const out = src.slice(off, off + P), pos = [];
  for (let j = from; j <= to; j++) pos.push(j);
  for (let i = pos.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [pos[i], pos[j]] = [pos[j], pos[i]]; }
  for (const j of pos.slice(0, k)) out[j] = fresh();
  return out;
}

// The adversarial controls of one census (fixed in the note): synthetic cells built from half B's sample, the far sample and the map;
// returns, per family, how many cells and how many come out 'ordered'. `seed` this census's seed.
export const FAMILIES = [
  { key: 'pieces1', test: 'max', limit: 0.05, what: 'half B cells cut into pieces of 1 byte, separated' },
  { key: 'pieces2', test: 'max', limit: 0.05, what: 'pieces of 2 bytes, separated' },
  { key: 'pieces4', test: 'max', limit: 0.05, what: 'pieces of 4 bytes, separated' },
  { key: 'far2x16', test: 'max', limit: 0.05, what: '16 pieces of 2 bytes of a half B cell in a far cell' },
  { key: 'repeated', test: 'max', limit: 0, what: 'a pair of the map repeated over the cell (pairs no donor holds as three alternating bytes)' },
  { key: 'mutated4', test: 'min', limit: 0.90, what: 'a half B cell with an ordered run of 32 or more, 4 own mutations inside the run' },
  { key: 'pieces8', test: null, what: 'pieces of 8 bytes, separated (descriptive)' },
  { key: 'pieces16', test: null, what: 'pieces of 16 bytes, separated (descriptive: each piece is a run of 16)' },
  { key: 'mutated8', test: null, what: '8 own mutations (descriptive)' },
  { key: 'mutated16', test: null, what: '16 own mutations (descriptive)' },
];
export const PER_FAMILY = 500;
export function adversarial(ctx, halfB, far, seed, maxOrigin) {
  const rng = makeRng(seed, 'v2');
  let next = maxOrigin;
  const fresh = () => next++;
  const nB = halfB.length / P, nF = far.length / P, res = {};
  const cls = (cell) => classOf(orderedRun(ctx, cell, 0).run, distinct(ctx, cell, 0));
  const tally = (key, cells) => { res[key] = { cells: cells.length, ordered: cells.filter((c) => cls(c) === 'ordered').length }; };
  const pick = (n, k) => { const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, Math.min(k, n)); };
  const srcB = pick(nB, PER_FAMILY);
  for (const size of [1, 2, 4, 8, 16]) tally(`pieces${size}`, srcB.map((c) => shuffledPieces(halfB, c * P, size, rng)));
  tally('far2x16', nF ? srcB.map((c) => piecesInForeign(halfB, c * P, far, pick(nF, 1)[0] * P, 2, 16, rng)) : []);
  // the repeated pair: only pairs no donor holds as three alternating bytes (g h g or h g h), so the known answer is a run of 2 (a donor that
  // does hold the repetition holds that order, and a cell repeating it then sits in it: not a failure of the measure)
  const pairs = [...ctx.pairs].filter((k) => !alternates(ctx, k % KEY, Math.floor(k / KEY)));
  tally('repeated', pick(pairs.length, 100).map((i) => repeatedPair(pairs[i] % KEY, Math.floor(pairs[i] / KEY))));
  const long = srcB.map((c) => ({ c, r: orderedRun(ctx, halfB, c * P) })).filter((x) => x.r.run >= 32);
  for (const k of [4, 8, 16]) tally(`mutated${k}`, long.map(({ c, r }) => mutatedCopy(halfB, c * P, k, r.from + 1, r.to - 1, rng, fresh)));
  return res;
}
// Does any donor hold three alternating bytes of the pair, g h g or h g h?
function alternates(ctx, g, h) {
  for (const [x, y] of [[g, h], [h, g]]) {
    const occ = ctx.index.get(x);
    if (!occ) continue;
    for (const i of occ) { const p = i % P; if (p + 2 < P && ctx.seq[i + 1] === y && ctx.seq[i + 2] === x) return true; }
  }
  return false;
}
// Does a census pass its adversarial controls?
export function adversarialFails(res) {
  const why = [];
  for (const f of FAMILIES) {
    if (!f.test) continue;
    const r = res[f.key];
    if (!r || r.cells < 10) { why.push(`${f.key}: ${r ? r.cells : 0} cells`); continue; }
    const share = r.ordered / r.cells;
    if (f.test === 'max' && share > f.limit) why.push(`${f.key}: ${r.ordered} of ${r.cells} ordered`);
    if (f.test === 'min' && share < f.limit) why.push(`${f.key}: ${r.ordered} of ${r.cells} ordered`);
  }
  return why;
}
