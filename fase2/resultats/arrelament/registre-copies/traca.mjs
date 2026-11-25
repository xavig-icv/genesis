// The record of heritable copies, the small version (exploratory; the note, README.md): the instrument. The simulator is not touched:
//  - evaluateEvents: a copy of evaluate (fase1/bff.js, BFF as it is, C0) that lists every write: [dst, src], src the position copied from,
//    or -1 for '+' and -2 for '-';
//  - mutateListed: a copy of mutate (fase1/soup.js) that lists the bytes it overwrites;
//  - the tags of every byte of the world, and how they move: a mask (which tracked programs' carriers the byte has been in), a flag
//    (overwritten by a mutation, or changed by '+' or '-') and the origin (the byte of the window's start it descends from by copies).
// prova.mjs checks all of it, before it is used, against the simulator and against cases with a known answer.
import { KIND, TAPE_SIZE, MAX_STEPS, PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { WINDOW, MIN_DISTINCT } from '../../../replication.js';

const MASK = TAPE_SIZE - 1;
const NOP = 0, LT = 1, GT = 2, LB = 3, RB = 4, DEC = 5, INC = 6, DOT = 7, COM = 8, LOOP = 9, END = 10;
export const MUT = 1, ARITH = 2;
// the note: the windows (the main one and auditor 1's), the seed of the matched-distance cells (of no plan), what is far from the dominant
// group, and how many matched cells
export const WINDOWS = [1250, 250];
export const CONTROL_SEED = 3200000000;
export const FAR = 64, MATCHED = 200;
export const writes = { n: 0 };

export function evaluateEvents(t, base, ev, maxSteps = MAX_STEPS) {
  let pc = 0, h0 = 0, h1 = 0, ops = 0, steps = 0, n = 0;
  let lastEnd = -1, lastEndSteps = 0, lastEndOps = 0, dirty = true;
  writes.n = 0;
  while (steps < maxSteps) {
    const k = KIND[t[base + pc]];
    if (k === NOP) {
      do {
        steps++;
        if (++pc >= TAPE_SIZE) { writes.n = n; return ops; }
      } while (steps < maxSteps && KIND[t[base + pc]] === NOP);
      continue;
    }
    ops++;
    if (k === LOOP) {
      if (t[base + h0] === 0) {
        let depth = 1;
        while (depth > 0) {
          if (++pc >= TAPE_SIZE) { writes.n = n; return ops; }
          const q = KIND[t[base + pc]];
          if (q === LOOP) depth++;
          else if (q === END) depth--;
        }
      }
    } else if (k === END) {
      if (t[base + h0] !== 0) {
        if (pc === lastEnd && !dirty) {
          const period = steps - lastEndSteps;
          const periodOps = ops - lastEndOps;
          const cycles = Math.floor((maxSteps - steps - 1) / period);
          steps += cycles * period;
          ops += cycles * periodOps;
        }
        lastEnd = pc; lastEndSteps = steps; lastEndOps = ops; dirty = false;
        let depth = 1;
        while (depth > 0) {
          if (--pc < 0) { writes.n = n; return ops; }
          const q = KIND[t[base + pc]];
          if (q === END) depth++;
          else if (q === LOOP) depth--;
        }
      }
    } else {
      dirty = true;
      if (k === DOT) { t[base + h1] = t[base + h0]; ev[2 * n] = h1; ev[2 * n + 1] = h0; n++; }
      else if (k === COM) { t[base + h0] = t[base + h1]; ev[2 * n] = h0; ev[2 * n + 1] = h1; n++; }
      else if (k === GT) h0 = (h0 + 1) & MASK;
      else if (k === LT) h0 = (h0 - 1) & MASK;
      else if (k === RB) h1 = (h1 + 1) & MASK;
      else if (k === LB) h1 = (h1 - 1) & MASK;
      else if (k === INC) { t[base + h0]++; ev[2 * n] = h0; ev[2 * n + 1] = -1; n++; }
      else { t[base + h0]--; ev[2 * n] = h0; ev[2 * n + 1] = -2; n++; }
    }
    steps++;
    if (++pc >= TAPE_SIZE) { writes.n = n; return ops; }
  }
  writes.n = n;
  return ops;
}

// mutate (fase1/soup.js), with the same random numbers, listing the positions it overwrites
export function mutateListed(buf, length, p, rng, list) {
  if (p <= 0) return 0;
  const logq = Math.log(1 - p);
  let count = 0;
  let i = Math.floor(Math.log(1 - rng()) / logq);
  while (i < length) {
    buf[i] = (rng() * 256) | 0;
    list.push(i);
    count++;
    i += 1 + Math.floor(Math.log(1 - rng()) / logq);
  }
  return count;
}

// The windows of a set of programs (the tracking's rule: 16 bytes in a row with 6 different values or more, of the program or of its
// mirror), indexed by their first four bytes. Each tracked set has a bit; carrierBits(cell) is the OR of the sets the cell carries.
export class CarrierIndex {
  constructor() { this.index = new Map(); }
  add(programs, bit) {
    for (const P of programs) for (const b of [P, P.slice().reverse()]) {
      for (let i = 0; i + WINDOW <= PROGRAM_SIZE; i++) {
        const w = b.subarray(i, i + WINDOW);
        if (new Set(w).size < MIN_DISTINCT) continue;
        const key = String.fromCharCode(...w), k4 = ((w[0] << 24) | (w[1] << 16) | (w[2] << 8) | w[3]) >>> 0;
        let list = this.index.get(k4);
        if (!list) this.index.set(k4, (list = []));
        const e = list.find((x) => x.key === key);
        if (e) e.bits |= bit; else list.push({ key, bits: bit });
      }
    }
  }
  // the bits of the 64 bytes at s[o..o+64), and (with `where`) the first window of each bit: where[bit index] = offset
  bits(s, o) {
    let bits = 0;
    for (let i = 0; i + WINDOW <= PROGRAM_SIZE; i++) {
      const list = this.index.get(((s[o + i] << 24) | (s[o + i + 1] << 16) | (s[o + i + 2] << 8) | s[o + i + 3]) >>> 0);
      if (!list) continue;
      const key = String.fromCharCode(...s.subarray(o + i, o + i + WINDOW));
      for (const e of list) if (e.key === key) bits |= e.bits;
    }
    return bits;
  }
  // the offsets of the windows of bit `bit` in s[o..o+64)
  windowsOf(s, o, bit) {
    const at = [];
    for (let i = 0; i + WINDOW <= PROGRAM_SIZE; i++) {
      const list = this.index.get(((s[o + i] << 24) | (s[o + i + 1] << 16) | (s[o + i + 2] << 8) | s[o + i + 3]) >>> 0);
      if (!list) continue;
      const key = String.fromCharCode(...s.subarray(o + i, o + i + WINDOW));
      if (list.some((e) => e.key === key && (e.bits & bit))) at.push(i);
    }
    return at;
  }
}

// One tracked census: its sets of programs (each a bit), the carriers of the world's cells (kept up to date for the cells that change),
// and its tracers (one per window).
export class Observer {
  constructor(n, sets) {
    this.n = n; this.sets = sets; this.index = new CarrierIndex();
    for (const s of sets) this.index.add(s.programs, s.bit);
    this.carrier = new Uint16Array(n); this.dirty = new Uint8Array(n); this.tracers = [];
  }
  all(soup) { for (let c = 0; c < this.n; c++) this.carrier[c] = this.index.bits(soup, c * PROGRAM_SIZE); this.dirty.fill(0); }
  update(soup) { for (let c = 0; c < this.n; c++) if (this.dirty[c]) { this.carrier[c] = this.index.bits(soup, c * PROGRAM_SIZE); this.dirty[c] = 0; } }
}

// One window: the tags of every byte of the world, from its start (where every byte is its own origin, with the bits of its cell)
export class Tracer {
  constructor(observer, window, startEpoch, soup, nPairsMax) {
    const N = soup.length;
    this.observer = observer; this.window = window; this.startEpoch = startEpoch;
    this.mask = new Uint16Array(N); this.flag = new Uint8Array(N); this.orig = new Int32Array(N); this.snap = soup.slice();
    for (let i = 0; i < N; i++) { this.mask[i] = observer.carrier[i >> 6]; this.orig[i] = i; }
    this.startCarriers = observer.carrier.slice();
    const T = nPairsMax * TAPE_SIZE;
    this.pmask = new Uint16Array(T); this.pflag = new Uint8Array(T); this.porig = new Int32Array(T);
  }
  mutated(list) { for (const i of list) { this.mask[i] = 0; this.flag[i] = MUT; this.orig[i] = -1; } }
  // the tapes of the pairs: each byte, with the bits of the cell it is in at the start of the interaction
  gather(pairIdx, nPairs) {
    const car = this.observer.carrier;
    for (let i = 0; i < nPairs; i++) for (let h = 0; h < 2; h++) {
      const c = pairIdx[2 * i + h], s = c * PROGRAM_SIZE, d = i * TAPE_SIZE + h * PROGRAM_SIZE, b = car[c];
      for (let j = 0; j < PROGRAM_SIZE; j++) { this.pmask[d + j] = this.mask[s + j] | b; this.pflag[d + j] = this.flag[s + j]; this.porig[d + j] = this.orig[s + j]; }
    }
  }
  // the writes of one interaction: a copy takes all the tags of the byte copied; '+' and '-' keep them and set the flag
  apply(base, ev, n) {
    for (let k = 0; k < n; k++) {
      const d = base + ev[2 * k], s = ev[2 * k + 1];
      if (s >= 0) { this.pmask[d] = this.pmask[base + s]; this.pflag[d] = this.pflag[base + s]; this.porig[d] = this.porig[base + s]; }
      else this.pflag[d] |= ARITH;
    }
  }
  scatter(pairIdx, nPairs) {
    for (let i = 0; i < nPairs; i++) for (let h = 0; h < 2; h++) {
      const c = pairIdx[2 * i + h], s = c * PROGRAM_SIZE, d = i * TAPE_SIZE + h * PROGRAM_SIZE;
      for (let j = 0; j < PROGRAM_SIZE; j++) { this.mask[s + j] = this.pmask[d + j]; this.flag[s + j] = this.pflag[d + j]; this.orig[s + j] = this.porig[d + j]; }
    }
  }
  // the invariant: a byte with no flag has the value of its origin at the window's start; returns the bytes that break it
  inconsistent(soup) {
    let bad = 0;
    for (let i = 0; i < soup.length; i++) if (this.flag[i] === 0 && (this.orig[i] < 0 || soup[i] !== this.snap[this.orig[i]])) bad++;
    return bad;
  }
}
