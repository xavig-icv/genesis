// A record of copy events (exploratory; the note, README.md): the world's epoch, as sim.mjs does it in a quiet 2D world (worldEpoch: no
// currents, no flow), with the same modules and the same order of random numbers, and two things the simulator does not need:
//  - its state can be saved and restored (the soup, the order of the cells and the generator's four words), so a stretch of epochs can be
//    run again from a checkpoint and must end in the next checkpoint, byte for byte;
//  - some cells can be followed: for each of them and each epoch, its state before the epoch's mutations, the positions mutated, its state
//    before its interaction, its partner and the partner's state, where each of its bytes came from in the interaction, and its state after.
// The simulator is not touched. prova.mjs checks this world against the small record's (../registre-copies/mon.mjs, itself checked against
// sim.mjs) and against the pilot's records; the generator against fase1/soup.js.
import { TAPE_SIZE, PROGRAM_SIZE, evaluate } from '../../../../fase1/bff.js';
import { shuffle, gather, scatter } from '../../../../fase1/soup.js';
import { pairNeighbors } from '../../../world.js';
import { evaluateEvents, mutateListed, writes } from '../registre-copies/traca.mjs';

const P = PROGRAM_SIZE;
const rotl = (x, k) => (x << k) | (x >>> (32 - k));
export const ARITH = 128;   // in a provenance byte: the byte was changed by '+' or '-' after it was copied

// The v2 generator of fase1/soup.js (splitmix32 seeding xoshiro128**), with its state readable (get) and settable (set)
export function rngV2(seed) {
  let s = seed >>> 0;
  const sm = () => {
    s = (s + 0x9e3779b9) >>> 0;
    let z = Math.imul(s ^ (s >>> 16), 0x85ebca6b) >>> 0;
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
    return (z ^ (z >>> 16)) >>> 0;
  };
  let a = sm(), b = sm(), c = sm(), d = sm();
  if ((a | b | c | d) === 0) a = 1;
  const rng = () => {
    const result = Math.imul(rotl(Math.imul(b, 5), 7), 9) >>> 0;
    const t = b << 9;
    c ^= a; d ^= b; b ^= c; a ^= d;
    c ^= t;
    d = rotl(d, 11);
    return result / 4294967296;
  };
  rng.get = () => [a, b, c, d];
  rng.set = (v) => { [a, b, c, d] = v; };
  return rng;
}

// The provenance of one interaction: for each byte of the joined tape after it, the position (0..127) of the byte it was copied from at
// the interaction's start, with ARITH if '+' or '-' changed it afterwards (writes: [dst, src] pairs, src -1 for '+' and -2 for '-')
export function provenance(ev, n) {
  const tag = new Uint8Array(TAPE_SIZE);
  for (let i = 0; i < TAPE_SIZE; i++) tag[i] = i;
  for (let k = 0; k < n; k++) {
    const d = ev[2 * k], s = ev[2 * k + 1];
    if (s >= 0) tag[d] = tag[s];
    else tag[d] |= ARITH;
  }
  return tag;
}

// `inject` (prova.mjs only): a function (epoch) -> [[position, value], ...] applied before the epoch's mutations, which a followed cell
// sees as a mutation (the test worlds' plantings); it uses no random number.
export function createWorld({ soup, width, height, radius, mutation, seed, inject = null }) {
  const n = width * height;
  const rng = rngV2(seed);
  const order = new Uint32Array(n).map((_, i) => i);
  const taken = new Uint8Array(n), pairIdx = new Uint32Array(n), pairs = new Uint8Array((n / 2) * TAPE_SIZE);
  const ev = new Int32Array(2 * 8192 + 2), mutList = [];
  const slot = new Int32Array(n);   // the pair slot of each cell in this epoch (2i or 2i+1), -1 if unpaired
  let epoch = 0;
  const api = {
    n, soup,
    get epoch() { return epoch; },
    set epoch(e) { epoch = e; },
    checkpoint: () => ({ epoch, soup: soup.slice(), order: order.slice(), rng: rng.get() }),
    restore(cp) { soup.set(cp.soup); order.set(cp.order); rng.set(cp.rng); epoch = cp.epoch; },
    // the same state as a checkpoint: the soup, the order and the generator
    sameAs(cp) {
      if (cp.epoch !== epoch || rng.get().some((x, i) => x !== cp.rng[i])) return false;
      for (let i = 0; i < n; i++) if (order[i] !== cp.order[i]) return false;
      for (let i = 0; i < soup.length; i++) if (soup[i] !== cp.soup[i]) return false;
      return true;
    },
    // One epoch. `follow`: a Uint8Array(n) of the cells to follow, or null. Returns { ops, runs, records } (records: one per followed cell)
    step(follow = null) {
      epoch++;
      shuffle(order, rng);
      const nPairs = pairNeighbors(order, taken, pairIdx, width, height, radius, rng);
      let recs = null;
      if (follow) {
        recs = new Map();
        for (let c = 0; c < n; c++) if (follow[c]) recs.set(c, { epoch, cell: c, A: soup.slice(c * P, c * P + P), mut: [], M: null, partner: -1, half: -1, Pm: null, prov: null, I: null });
      }
      mutList.length = 0;
      if (inject) for (const [i, v] of inject(epoch) ?? []) { soup[i] = v; mutList.push(i); }
      mutateListed(soup, soup.length, mutation, rng, mutList);
      if (recs) {
        for (const i of mutList) { const r = recs.get((i / P) | 0); if (r && !r.mut.includes(i % P)) r.mut.push(i % P); }
        for (const r of recs.values()) { r.mut.sort((x, y) => x - y); r.M = soup.slice(r.cell * P, r.cell * P + P); }
        slot.fill(-1);
        for (let k = 0; k < 2 * nPairs; k++) slot[pairIdx[k]] = k;
      }
      gather(soup, pairIdx, pairs, 0, nPairs);
      let ops = 0;
      if (!recs) {
        for (let i = 0; i < nPairs; i++) ops += evaluate(pairs, i * TAPE_SIZE);
      } else {
        for (let i = 0; i < nPairs; i++) {
          const c0 = pairIdx[2 * i], c1 = pairIdx[2 * i + 1];
          const r0 = recs.get(c0), r1 = recs.get(c1);
          if (!r0 && !r1) { ops += evaluate(pairs, i * TAPE_SIZE); continue; }
          const pre = pairs.slice(i * TAPE_SIZE, (i + 1) * TAPE_SIZE);
          ops += evaluateEvents(pairs, i * TAPE_SIZE, ev);
          const tag = provenance(ev, writes.n);
          for (const [r, h, q] of [[r0, 0, c1], [r1, 1, c0]]) {
            if (!r) continue;
            r.partner = q; r.half = h;
            r.Pm = pre.slice((1 - h) * P, (2 - h) * P);
            r.prov = tag.slice(h * P, (h + 1) * P);
          }
        }
      }
      scatter(soup, pairIdx, pairs, 0, nPairs);
      if (recs) for (const r of recs.values()) r.I = soup.slice(r.cell * P, r.cell * P + P);
      return { ops, runs: nPairs, records: recs };
    },
  };
  return api;
}

// The segments: checkpoints (a Map epoch -> checkpoint) and replay(cells, s, t): the records of `cells` for the epochs s+1..t, as a Map
// cell -> Map epoch -> record, running the segment again from the checkpoint at s; it fails unless the world ends in the checkpoint at t,
// byte for byte, and every record keeps its own check. `stats` counts the replays, the epochs and the records checked.
export function createReplayer(world, checkpoints) {
  const stats = { replays: 0, epochs: 0, records: 0 };
  const follow = new Uint8Array(world.n);
  function replay(cells, s, t) {
    const a = checkpoints.get(s), b = checkpoints.get(t);
    if (!a || !b) throw new Error(`replay: no checkpoint at ${a ? t : s}`);
    world.restore(a);
    follow.fill(0);
    for (const c of cells) follow[c] = 1;
    const out = new Map(cells.map((c) => [c, new Map()]));
    let prev = null;
    for (let e = s + 1; e <= t; e++) {
      const { records } = world.step(follow);
      for (const [c, r] of records) {
        if (recordInconsistent(r)) throw new Error(`replay: the record of cell ${c} at epoch ${e} breaks its own check`);
        const before = prev?.get(c);
        if (before && before.I.some((v, j) => v !== r.A[j])) throw new Error(`replay: cell ${c} is not the same between epochs ${e - 1} and ${e}`);
        out.get(c).set(e, r);
        stats.records++;
      }
      prev = records;
    }
    if (!world.sameAs(b)) throw new Error(`replay: the segment (${s}, ${t}] does not end in its checkpoint`);
    stats.replays++; stats.epochs += t - s;
    return out;
  }
  return { replay, stats };
}

// A record's own check: each byte after the interaction is the value at its provenance before it (the cell's or the partner's half), unless
// '+' or '-' changed it; with no partner, the state is unchanged by the interaction. Returns the number of bytes that break it.
export function recordInconsistent(r) {
  if (r.partner < 0) { let bad = 0; for (let j = 0; j < P; j++) if (r.I[j] !== r.M[j]) bad++; return bad; }
  let bad = 0;
  for (let j = 0; j < P; j++) {
    const t = r.prov[j];
    if (t & ARITH) continue;
    const fromMine = r.half === 0 ? t < P : t >= P;
    const v = fromMine ? r.M[t % P] : r.Pm[t % P];
    if (r.I[j] !== v) bad++;
  }
  return bad;
}
