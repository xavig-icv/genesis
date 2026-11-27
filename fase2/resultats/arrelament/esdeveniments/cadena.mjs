// A record of copy events (exploratory; the note, README.md): the chains, over the records of followed cells (mon.mjs). prova.mjs checks
// each rule with a known answer before anything is run on a branch of the pilot.
//
// Time points: (e, 'M') is a cell's state after the mutations of epoch e, before its interaction; (e, 'I') its state after the
// interaction, which is also its state before the mutations of epoch e + 1; (w0, 'I') the state at the window's start.
//
// A chain starts at an appearance's cell, heritable at its census (E, 'I'), and walks back while the cell's states stay heritable:
//  - a step whose state before is not heritable is an acquisition. Each byte of the state after is traced back (trace below) to a holder
//    that was heritable while it held the byte (H), to its creation by a mutation or to the window's start in cells that were not
//    heritable (N), or, past K transfers between cells, not to a heritable holder within K transfers (U). If H >= THETA (half the program),
//    the heredity was inherited: the chain moves to the holder that gave the most bytes, at the latest point it was heritable holding
//    them; else it ends in a birth (heredity assembled from material that had not been in a heritable cell within K transfers), at that
//    cell and epoch;
//  - a step where a heritable partner wrote half the cell or more into a heritable cell is a replacement: the chain moves to the partner;
//  - when the chain moves to a holder whose state there carries a window of a lineage detected before the appearance's census, it ends
//    ('earlier lineage'); at the window's start, still heritable: 'older'; past MAX_HOPS hops: 'unresolved'.
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { conditions, testInert, heritable, INERT_CONDITIONS_SEED, INERT_CONDITIONS } from '../../../inert.js';
import { ARITH } from './mon.mjs';

const P = PROGRAM_SIZE;
export const THETA = 32;     // half the program: inherited if half its bytes or more come from heritable holders
export const K = 2;          // transfers between cells a byte is traced back through
export const REPLACE = 32;   // a replacement: the heritable partner wrote half the cell or more
export const MAX_HOPS = 64;  // the cap of hops of a chain

// The inert census's test (the 3 conditions of the pilot's census), cached by the program's bytes
export function createHeritability(interpret) {
  const conds = conditions(INERT_CONDITIONS_SEED, INERT_CONDITIONS);
  const cache = new Map();
  let tests = 0;
  const her = (bytes) => {
    const k = Buffer.from(bytes.buffer, bytes.byteOffset, P).toString('latin1');
    let v = cache.get(k);
    if (v === undefined) { v = heritable(interpret ? testInert(bytes, conds, interpret) : testInert(bytes, conds)); cache.set(k, v); tests++; }
    return v;
  };
  her.tests = () => tests;
  return her;
}

const same = (a, b) => { for (let j = 0; j < P; j++) if (a[j] !== b[j]) return false; return true; };
export const fromPartner = (r) => {
  const F = [];
  for (let j = 0; j < P; j++) { const t = r.prov[j] & ~ARITH & 127; if (r.half === 0 ? t >= P : t < P) F.push(j); }
  return F;
};

// The records of cells, fetched lazily: rec(cell, e) runs the segment that holds epoch e again (replay, from mon.mjs's createReplayer),
// following the cell and its neighbours within `radius`, and keeps every record it gets. Segments: (s, s + step], s a multiple of step. At
// most `cap` records are kept: past it, the segments used least recently are forgotten (a record asked again is fetched again, the same).
export function createHistory({ replay, width, height, radius, step, cap = 300000 }) {
  const segs = new Map();   // s -> { cells: Map cell -> Map epoch -> record, n }, in the order of their last use
  let fetches = 0, kept = 0;
  const near = (c) => {
    const x = c % width, y = (c / width) | 0, out = [];
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
      const X = x + dx, Y = y + dy;
      if (X >= 0 && Y >= 0 && X < width && Y < height) out.push(Y * width + X);
    }
    return out;
  };
  function rec(cell, e) {
    const s = Math.floor((e - 1) / step) * step;
    let seg = segs.get(s);
    if (seg) { segs.delete(s); segs.set(s, seg); }   // the most recently used, last
    const r = seg && seg.cells.get(cell)?.get(e);
    if (r) return r;
    if (!seg) { seg = { cells: new Map(), n: 0 }; segs.set(s, seg); }
    const cells = near(cell).filter((c) => !seg.cells.has(c));
    const got = replay(cells, s, s + step);
    fetches++;
    for (const [c, mm] of got) { seg.cells.set(c, mm); seg.n += mm.size; kept += mm.size; }
    for (const [t, other] of segs) {
      if (kept <= cap || t === s) break;
      segs.delete(t); kept -= other.n;
    }
    const r2 = seg.cells.get(cell)?.get(e);
    if (!r2) throw new Error(`history: no record of cell ${cell} at epoch ${e}`);
    return r2;
  }
  const state = (cell, e, ph, w0) => (ph === 'I' && e === w0 ? rec(cell, w0 + 1).A : ph === 'I' ? rec(cell, e).I : rec(cell, e).M);
  // clear(): forget every record (after each census)
  const clear = () => { segs.clear(); kept = 0; };
  return { rec, state, clear, fetches: () => fetches, kept: () => kept };
}

// One byte, at position j of cell x at point (e, ph), traced back: { t: 'H', cell, e, ph } (a heritable holder), { t: 'N', why } or
// { t: 'U' } (past k transfers)
export function trace(h, her, x, j, e, ph, w0, k = K) {
  let hops = 0;
  for (;;) {
    if (her(h.state(x, e, ph, w0))) return { t: 'H', cell: x, e, ph };
    if (ph === 'I' && e === w0) return { t: 'N', why: 'start' };
    const r = h.rec(x, e);
    if (ph === 'I') {
      if (r.partner < 0) { ph = 'M'; continue; }
      const tag = r.prov[j] & ~ARITH & 127, own = r.half === 0 ? tag < P : tag >= P;
      j = tag % P; ph = 'M';
      if (!own) { if (++hops > k) return { t: 'U' }; x = r.partner; }
    } else {
      if (r.mut.includes(j)) return { t: 'N', why: 'mutation' };
      e -= 1; ph = 'I';
    }
  }
}

// An acquisition of cell `cell` at the step into (e, step === 'interaction' ? 'I' : 'M'): every byte of the state after, traced back
export function acquisition(h, her, cell, e, step, w0, k = K) {
  const r = h.rec(cell, e), res = [];
  for (let j = 0; j < P; j++) {
    if (step === 'interaction') {
      const tag = r.prov[j] & ~ARITH & 127, own = r.half === 0 ? tag < P : tag >= P;
      res.push(trace(h, her, own ? cell : r.partner, tag % P, e, 'M', w0, k));
    } else {
      res.push(r.mut.includes(j) ? { t: 'N', why: 'mutation' } : trace(h, her, cell, j, e - 1, 'I', w0, k));
    }
  }
  const nH = res.filter((x) => x.t === 'H').length, nU = res.filter((x) => x.t === 'U').length;
  const nM = res.filter((x) => x.t === 'N' && x.why === 'mutation').length;
  const by = new Map();
  for (const x of res) if (x.t === 'H') { const b = by.get(x.cell); if (!b || x.e > b.e || (x.e === b.e && x.ph === 'I' && b.ph === 'M')) by.set(x.cell, { n: (b?.n ?? 0) + 1, e: x.e, ph: x.ph }); else b.n++; }
  const summary = { H: nH, U: nU, N: P - nH - nU, mutation: nM, sources: by.size };
  if (nH >= THETA) {
    let best = null;
    for (const [c, b] of by) if (!best || b.n > best.n || (b.n === best.n && (b.e > best.e || (b.e === best.e && c < best.cell)))) best = { cell: c, ...b };
    return { inherited: true, source: { cell: best.cell, e: best.e, ph: best.ph }, given: best.n, ...summary };
  }
  return { inherited: false, ...summary };
}

// The chain of one head: { end, ... } and its hops
export function chain(h, her, head, w0, earlier, k = K) {
  let { cell, e, ph } = head;
  const hops = [];
  for (;;) {
    if (ph === 'I' && e === w0) return { end: 'older', cell, hops };
    const r = h.rec(cell, e);
    let moveTo = null, hop = null;
    if (ph === 'I') {
      if (r.partner >= 0 && !same(r.M, r.I)) {
        if (!her(r.M)) {
          const a = acquisition(h, her, cell, e, 'interaction', w0, k);
          if (!a.inherited) return { end: 'birth', cell, epoch: e, step: 'interaction', material: a, hops };
          moveTo = a.source; hop = { cell, epoch: e, kind: 'inherited', step: 'interaction', material: a };
        } else {
          const F = fromPartner(r);
          if (F.length >= REPLACE && her(r.Pm)) { moveTo = { cell: r.partner, e, ph: 'M' }; hop = { cell, epoch: e, kind: 'replacement', F: F.length }; }
        }
      }
      if (!moveTo) { ph = 'M'; continue; }
    } else {
      if (!same(r.A, r.M) && !her(r.A)) {
        const a = acquisition(h, her, cell, e, 'mutation', w0, k);
        if (!a.inherited) return { end: 'birth', cell, epoch: e, step: 'mutation', material: a, hops };
        moveTo = a.source; hop = { cell, epoch: e, kind: 'inherited', step: 'mutation', material: a };
      } else { e -= 1; ph = 'I'; continue; }
    }
    hops.push({ ...hop, to: moveTo.cell, toEpoch: moveTo.e, toPhase: moveTo.ph });
    if (hops.length > MAX_HOPS) return { end: 'unresolved', why: 'hops', cell, hops };
    const st = h.state(moveTo.cell, moveTo.e, moveTo.ph, w0);
    const bits = earlier ? earlier.bits(st, 0) : 0;
    if (bits) return { end: 'earlier lineage', bits, cell: moveTo.cell, epoch: moveTo.e, hops };
    ({ cell, e, ph } = moveTo);
  }
}

// A birth that the chains of a lineage detected before the appearance also reach (a reference lineage of its census, or a failed
// appearance of an earlier census of the branch) is that lineage's origin: the chain's end becomes 'earlier lineage', by origin
export const birthKey = (ch) => `${ch.cell}@${ch.epoch}:${ch.step}`;
export const byOrigin = (ch, earlierBirths) => (ch.end === 'birth' && earlierBirths.has(birthKey(ch)) ? { ...ch, end: 'earlier lineage', byOrigin: true } : ch);

// The class of an appearance from the ends of its cells' chains: the end of more than half of its cells, else 'mixed'
export function appearanceClass(ends) {
  const k = new Map();
  for (const x of ends) k.set(x, (k.get(x) ?? 0) + 1);
  for (const [x, c] of k) if (2 * c > ends.length) return x;
  return 'mixed';
}
