// A record of copy events (exploratory; the note, README.md): the chains. Pure functions over the records of followed cells (mon.mjs);
// prova.mjs checks each rule with a known answer before anything is run on a branch of the pilot.
//
// Time points: (e, 'M') is a cell's state after the mutations of epoch e, before its interaction; (e, 'I') its state after the
// interaction, which is also its state before the mutations of epoch e + 1. A head is a cell heritable at a time point; walking back, the
// heritable state is kept while the states before each step stay heritable, and the chain ends, or moves to another cell, at the first
// step whose state before is not heritable (an acquisition), or at a step where a heritable partner overwrote half or more of a heritable
// cell (a replacement):
//  - an acquisition by a mutation: a birth ('mutation');
//  - an acquisition in an interaction: F, the bytes of the state after that came from the partner's half. If F is empty, or the state after
//    with F put back to the bytes the cell had before is still heritable, a birth ('own'); else, if the partner's state before was
//    heritable, the heredity was inherited from it, and the chain moves to the partner; else a birth ('partner material');
//  - a replacement: the chain moves to the partner;
//  - when the chain moves to a partner whose state carries a window of a lineage detected before the appearance's census, it ends there
//    ('earlier lineage'; the index of mon.mjs's neighbour ../registre-copies/traca.mjs, CarrierIndex);
//  - at the window's start, still heritable: 'older than the window'; past the cap of hops: 'unresolved'.
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { conditions, testInert, heritable, INERT_CONDITIONS_SEED, INERT_CONDITIONS } from '../../../inert.js';
import { ARITH } from './mon.mjs';

const P = PROGRAM_SIZE;
export const REPLACE = 32;   // a replacement: the heritable partner wrote half the cell or more
export const MAX_HOPS = 64;  // the cap of hops of a chain

// The inert census's test (the 3 conditions of the pilot's census), cached by the program's bytes
export function createHeritability(interpret) {
  const conds = conditions(INERT_CONDITIONS_SEED, INERT_CONDITIONS);
  const cache = new Map();
  let tests = 0;
  const her = (bytes) => {
    const k = Buffer.from(bytes).toString('hex');
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

// What an interaction did to a cell whose state before (r.M) is not heritable and after (r.I) is: 'own', 'inherited' or
// 'partner material' (the classification above), with F and whether the counterfactual is heritable.
export function classifyAcquisition(r, her) {
  const F = fromPartner(r);
  if (!F.length) return { kind: 'own', F: 0, counterfactual: null };
  const Z = r.I.slice();
  for (const j of F) Z[j] = r.M[j];
  const cf = her(Z);
  if (cf) return { kind: 'own', F: F.length, counterfactual: true };
  if (her(r.Pm)) return { kind: 'inherited', F: F.length, counterfactual: false };
  return { kind: 'partner material', F: F.length, counterfactual: false };
}

// Walk one head back through the records of its cell in the segment (s, t]: recs.get(e) is the cell's record of epoch e, for e in s+1..t.
// The head's point (e, ph), with s < e <= t (or e === s, 'I', which belongs to the segment before). Returns one of:
//   { move: true } (still heritable at (s, 'I'): the head goes on in the segment before),
//   { end: 'older' } (at the window's start w0),
//   { end: 'birth', kind, epoch, step, F?, counterfactual? },
//   { source: { cell, epoch }, hop: { ... } } (inherited or replacement: the chain moves to the partner, at (epoch, 'M')).
export function walk(head, recs, s, w0, her) {
  let { e, ph } = head.point;
  for (;;) {
    if (ph === 'I' && e === w0) return { end: 'older', point: { e, ph } };
    if (ph === 'I' && e === s) return { move: true };
    const r = recs.get(e);
    if (!r) throw new Error(`walk: no record of cell ${head.cell} at epoch ${e}`);
    if (ph === 'I') {
      if (r.partner < 0 || same(r.M, r.I)) { ph = 'M'; continue; }
      if (!her(r.M)) {
        const a = classifyAcquisition(r, her);
        if (a.kind === 'inherited') return { source: { cell: r.partner, epoch: e, state: r.Pm }, hop: { cell: head.cell, epoch: e, kind: 'inherited', F: a.F } };
        return { end: 'birth', kind: a.kind, epoch: e, step: 'interaction', cell: head.cell, F: a.F, counterfactual: a.counterfactual };
      }
      const F = fromPartner(r);
      if (F.length >= REPLACE && her(r.Pm)) return { source: { cell: r.partner, epoch: e, state: r.Pm }, hop: { cell: head.cell, epoch: e, kind: 'replacement', F: F.length } };
      ph = 'M';
    } else {
      if (same(r.A, r.M)) { e -= 1; ph = 'I'; continue; }
      if (!her(r.A)) return { end: 'birth', kind: 'mutation', epoch: e, step: 'mutation', cell: head.cell, mut: r.mut.length };
      e -= 1; ph = 'I';
    }
  }
}

// The class of an appearance from the ends of its cells' chains: the end of more than half of its cells, else 'mixed'
export function appearanceClass(ends) {
  const k = new Map();
  for (const x of ends) k.set(x, (k.get(x) ?? 0) + 1);
  for (const [x, c] of k) if (2 * c > ends.length) return x;
  return 'mixed';
}

// The chains of a branch. `replay(cells, s, t)`: the records of the cells (an array of cell numbers) for the epochs s+1..t, as a Map
// cell -> Map epoch -> record (it runs the segment again from the checkpoint at s and must end in the checkpoint at t). `heads`: one per
// appearance cell: { id, cell, point: { e, ph }, w0, earlier } (earlier: a CarrierIndex of the lineages detected before its census, or
// null). `width`, `height`, `radius`: the neighbours followed with each head. `step`: the checkpoints' spacing (segments (s, s + step]).
// Returns { chains, replays }: per head, { id, appearanceCell, hops, result } (result: the walk's end, or 'earlier lineage' with the
// bits, or 'unresolved'). The caller checks, before, that every head is heritable at its point.
export function resolve({ heads, replay, her, width, height, radius, step, top, bottom, log = null }) {
  const chains = heads.map((h) => ({ id: h.id, appearanceCell: h.cell, cell: h.cell, point: { ...h.point }, w0: h.w0, earlier: h.earlier, hops: [], result: null }));
  let replays = 0;
  const near = (c) => {
    const x = c % width, y = (c / width) | 0, out = [];
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
      const X = x + dx, Y = y + dy;
      if (X >= 0 && Y >= 0 && X < width && Y < height) out.push(Y * width + X);
    }
    return out;
  };
  for (let t = top; t > bottom; t -= step) {
    const s = t - step;
    const inSeg = (ch) => !ch.result && ch.point.e > s && ch.point.e <= t;
    for (let round = 0; ; round++) {
      const act = chains.filter(inSeg);
      if (!act.length) break;
      const cells = [...new Set(act.flatMap((ch) => near(ch.cell)))];
      const recs = replay(cells, s, t);
      replays++;
      for (const ch of act) {
        // follow the chain inside this replay while its cell is among the followed ones
        for (;;) {
          const r = recs.get(ch.cell);
          if (!r) break;   // its cell was not followed in this replay: another round
          const w = walk(ch, r, s, ch.w0, her);
          if (w.move) { ch.point = { e: s, ph: 'I' }; break; }
          if (w.end) { ch.result = w; break; }
          ch.hops.push({ ...w.hop, to: w.source.cell });
          if (ch.hops.length > MAX_HOPS) { ch.result = { end: 'unresolved', why: 'hops' }; break; }
          const bits = ch.earlier ? ch.earlier.bits(w.source.state, 0) : 0;
          if (bits) { ch.result = { end: 'earlier lineage', bits, epoch: w.source.epoch, cell: w.source.cell }; break; }
          ch.cell = w.source.cell;
          ch.point = { e: w.source.epoch, ph: 'M' };
        }
      }
      if (log) log(`segment (${s}, ${t}], round ${round}: ${act.length} chains, ${cells.length} cells followed`);
      if (round > 4 * MAX_HOPS) throw new Error('resolve: too many rounds in one segment');
    }
  }
  for (const ch of chains) if (!ch.result) throw new Error(`resolve: the chain of ${ch.id} at cell ${ch.appearanceCell} has no end`);
  return { chains, replays };
}
