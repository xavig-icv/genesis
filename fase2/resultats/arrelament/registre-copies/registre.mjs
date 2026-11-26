// The record of heritable copies, the small version (exploratory; the note, README.md): one branch, again, with the record.
//
//   node fase2/resultats/arrelament/registre-copies/registre.mjs ID [--llista FILE] [--out FILE]
//
// From the branch's start capture and seed, the world's epochs exactly as sim.mjs does them (the same modules and random numbers; the
// simulator is not touched), up to the end of the pilot's record. Before each tracked census E, the windows (1,250 and 250 epochs, or from
// the branch's start) are traced with traca.mjs. It fails, and writes nothing more, if any measure (every 100 epochs: H0, the operations,
// the runs) or the final fingerprint differs from the pilot's record, if an appearance's cells do not hold its programs at E, or if a
// tag breaks the invariant. The output (registres/ID.jsonl) has one line per appearance and window, and the controls.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { makeRng, shannonEntropy } from '../../../../fase1/soup.js';
import { fromHex } from '../../../inert.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { Observer, Tracer, MUT, ARITH, WINDOWS, CONTROL_SEED, FAR, MATCHED } from './traca.mjs';
import { createWorld } from './mon.mjs';
import { ROOT, HERE, sha256, ARMS } from './dades.mjs';


const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ID = args[0];
const listFile = opt('--llista') ?? join(ROOT, HERE, 'llista.json');
const outFile = opt('--out') ?? join(ROOT, HERE, 'registres', `${ID}.jsonl`);
if (!ID || ID.startsWith('--')) { console.error('usage: node registre.mjs ID [--llista FILE] [--out FILE]'); process.exit(2); }
const L = JSON.parse(readFileSync(listFile, 'utf8'));
const br = L.branches.find((b) => b.id === ID);
if (!br) { console.error(`registre: ${ID} is not in the list`); process.exit(2); }
mkdirSync(dirname(outFile), { recursive: true });
const lines = [];
const emit = (x) => lines.push(JSON.stringify(x));
const flush = () => writeFileSync(outFile, lines.join('\n') + '\n');
const fail = (why) => { emit({ type: 'fail', why }); flush(); console.error(`registre ${ID}: ${why}`); process.exit(1); };

// The pilot's record: the parameters of the world, the measures and the end
const rec = readFileSync(join(ROOT, br.record), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const S = rec[0], END = rec.at(-1);
if (sha256(readFileSync(join(ROOT, br.record))) !== br.recordSha256) fail('the pilot record is not the list\'s');
const [Wd, Ht] = S.world;
if (S.rng !== 'v2' || S.mixing !== 0 || S.diffusion !== 0 || S.flow !== 0 || S.renewal !== 0 || !Array.isArray(S.world)) fail('the branch is not a quiet 2D world with rng v2');
const n = Wd * Ht, every = S.every, start = S.start, last = END.epoch;
const measures = new Map(rec.filter((l) => l.type === 'measure').map((l) => [l.epoch, l]));
const capture = readFileSync(join(ROOT, S.from));
if (sha256(capture) !== br.captureSha256) fail('the start capture does not have the manifest\'s SHA-256');
const soup = new Uint8Array(capture);
if (soup.length !== n * PROGRAM_SIZE) fail('the start capture is not of this world');
emit({ type: 'start', branch: ID, world: br.world, soup: br.soup, code: codeVersion(), node: process.version, seed: S.seed, start, end: last, windows: WINDOWS, censuses: br.observers.map((o) => o.epoch) });

// The world, as sim.mjs (mon.mjs): the same arrays and the same order of random numbers
const world = createWorld({ soup, width: Wd, height: Ht, radius: S.radius, mutation: S.mutation, seed: S.seed });
const active = [];   // observers with a window open
const plan = br.observers.map((o) => {
  const sets = o.sets.map((s) => ({ ...s, programs: s.programs.map(fromHex) }));
  return { ...o, sets, obs: null, starts: WINDOWS.map((w) => ({ w, at: Math.max(start, o.epoch - w) })) };
});
function open(epochNow) {
  for (const p of plan) for (const s of p.starts) {
    if (s.at !== epochNow || s.tracer || s.done) continue;
    if (!p.obs) { p.obs = new Observer(n, p.sets); p.obs.all(soup); active.push(p); } else p.obs.update(soup);
    s.tracer = new Tracer(p.obs, s.w, epochNow, soup, n / 2);
    p.obs.tracers.push(s.tracer);
  }
}
const tracers = () => active.flatMap((p) => p.obs.tracers);

// The distance (Chebyshev) of every cell to the nearest cell with a bit, by a breadth-first search from those cells
function distances(car, bit) {
  const d = new Int32Array(n).fill(-1), q = new Int32Array(n);
  let h = 0, t = 0;
  for (let c = 0; c < n; c++) if (car[c] & bit) { d[c] = 0; q[t++] = c; }
  while (h < t) {
    const c = q[h++], x = c % Wd, y = (c / Wd) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= Wd || ny >= Ht) continue;
      const e = ny * Wd + nx;
      if (d[e] < 0) { d[e] = d[c] + 1; q[t++] = e; }
    }
  }
  return d;
}
const share = (t, cells, bit) => { let k = 0; for (const c of cells) for (let j = 0; j < PROGRAM_SIZE; j++) if (t.mask[c * PROGRAM_SIZE + j] & bit) k++; return k / (cells.length * PROGRAM_SIZE); };

// At a tracked census: the appearances and the controls, for every window
function close(p, epoch) {
  const o = p.obs;
  o.update(soup);
  const bitOf = Object.fromEntries(p.sets.map((s) => [s.name, s.bit]));
  for (const y of p.appearances) {
    for (let i = 0; i < y.cells.length; i++) {
      const c = y.cells[i], prog = fromHex(y.programs[i]);
      for (let j = 0; j < PROGRAM_SIZE; j++) if (soup[c * PROGRAM_SIZE + j] !== prog[j]) fail(`at ${epoch}, the cell ${c} of ${y.id} does not hold its program`);
    }
  }
  const dBit = bitOf.D ?? 0, dist = dBit ? distances(o.carrier, dBit) : null;
  for (const t of o.tracers) {
    const bad = t.inconsistent(soup);
    if (bad) fail(`at ${epoch}, window ${t.window}: ${bad} bytes break the invariant`);
    // the controls: for every tracked set, its carriers at E and how many have a window whose 16 bytes all carry its bit
    const sets = p.sets.map((s) => {
      let carriers = 0, ok = 0, flagged = 0;
      for (let c = 0; c < n; c++) {
        if (!(o.carrier[c] & s.bit)) continue;
        carriers++;
        const at = o.index.windowsOf(soup, c * PROGRAM_SIZE, s.bit);
        let full = false, fl = false;
        for (const a of at) {
          let all = true;
          for (let j = a; j < a + 16; j++) { const i = c * PROGRAM_SIZE + j; if (!(t.mask[i] & s.bit)) all = false; if (t.flag[i]) fl = true; }
          if (all) { full = true; break; }
        }
        if (full) ok++; else if (fl) flagged++;
      }
      let atStart = 0; for (let c = 0; c < n; c++) if (t.startCarriers[c] & s.bit) atStart++;
      return { name: s.name, carriersAtStart: atStart, carriers, ok, flagged };
    });
    let far = null;
    if (dist) { let k = 0, sum = 0; for (let c = 0; c < n; c++) if (dist[c] >= FAR) { k++; sum += share(t, [c], dBit); } far = { cells: k, meanShare: k ? sum / k : null }; }
    emit({ type: 'control', epoch, window: t.window, windowStart: t.startEpoch, sets, far });
    for (const y of p.appearances) {
      const N = y.cells.length * PROGRAM_SIZE;
      let mut = 0, arith = 0, self = 0;
      const origCells = {};
      for (const c of y.cells) for (let j = 0; j < PROGRAM_SIZE; j++) {
        const i = c * PROGRAM_SIZE + j;
        if (t.flag[i] & MUT) mut++;
        if (t.flag[i] & ARITH) arith++;
        if (t.flag[i] === 0 && t.orig[i] === i) self++;
        if (t.orig[i] >= 0) { const oc = t.orig[i] >> 6; origCells[oc] = (origCells[oc] ?? 0) + 1; }
      }
      const members = {};
      for (const s of p.sets) if (s.name !== 'D' && s.name !== 'Dbroad' && s.name !== y.id) members[s.name] = share(t, y.cells, s.bit);
      let baseline = null;
      if (dist) {
        const dy = Math.min(...y.cells.map((c) => dist[c]));
        const cand = [];
        for (let c = 0; c < n; c++) if (dist[c] === dy && o.carrier[c] === 0) cand.push(c);
        const r = makeRng(CONTROL_SEED + 1000 * Number(br.world) + 10 * ARMS.indexOf(br.soup) + p.index, 'v2');
        for (let i = cand.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; const x = cand[i]; cand[i] = cand[j]; cand[j] = x; }
        const pick = cand.slice(0, MATCHED), vals = pick.map((c) => share(t, [c], dBit));
        const mine = share(t, y.cells, dBit);
        baseline = { distance: dy, cells: pick.length, meanShare: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null,
          percentile: vals.length ? (vals.filter((v) => v < mine).length + 0.5 * vals.filter((v) => v === mine).length) / vals.length : null };
      }
      const present = {};
      for (const s of p.sets) if (s.name === y.id) { let k = 0; for (let c = 0; c < n; c++) if (t.startCarriers[c] & s.bit) k++; present.self = k; }
      emit({ type: 'appearance', epoch, window: t.window, windowStart: t.startEpoch, id: y.id, cells: y.cells, bytes: N,
        dStrict: dBit ? share(t, y.cells, dBit) : null, dBroad: bitOf.Dbroad ? share(t, y.cells, bitOf.Dbroad) : null, members,
        mut: mut / N, arith: arith / N, self: self / N, origCells, presentAtStart: present.self ?? null, baseline });
    }
  }
  active.splice(active.indexOf(p), 1);
  p.obs = null;
  for (const s of p.starts) { s.tracer = null; s.done = true; }
}

// The run
plan.forEach((p, i) => { p.index = i; });
open(start);
let ops = 0, runs = 0, checked = 0, invariantChecks = 0;
const t0 = Date.now();
for (let epoch = start + 1; epoch <= last; epoch++) {
  const r = world.step(active.map((p) => p.obs));
  ops += r.ops; runs += r.runs;
  if (epoch % every === 0) {
    const m = measures.get(epoch);
    if (!m) fail(`no measure in the pilot record at ${epoch}`);
    const h0 = shannonEntropy(soup);
    if (h0 !== m.h0 || ops !== m.ops || runs !== m.runs) fail(`at ${epoch}, the world is not the pilot's (H0 ${h0} against ${m.h0}, operations ${ops} against ${m.ops}, runs ${runs} against ${m.runs})`);
    checked++; ops = 0; runs = 0;
    for (const t of tracers()) { const bad = t.inconsistent(soup); invariantChecks++; if (bad) fail(`at ${epoch}, window ${t.window}: ${bad} bytes break the invariant`); }
  }
  for (const p of plan.filter((x) => x.epoch === epoch && x.obs)) close(p, epoch);
  open(epoch);
}
let hash = 0x811c9dc5;
for (let i = 0; i < soup.length; i++) hash = Math.imul(hash ^ soup[i], 0x01000193);
const fp = (hash >>> 0).toString(16);
if (fp !== END.fingerprint) fail(`the final fingerprint is not the pilot's (${fp} against ${END.fingerprint})`);
if (plan.some((p) => p.obs || p.starts.some((s) => !s.done))) fail('a tracked census was not reached');
emit({ type: 'end', branch: ID, measuresChecked: checked, invariantChecks, fingerprint: fp, seconds: (Date.now() - t0) / 1000 });
flush();
