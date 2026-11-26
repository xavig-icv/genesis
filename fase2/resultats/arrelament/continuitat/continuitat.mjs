// A measure of continuity (exploratory; the note, README.md): one branch, again, keeping the origins of the cells the measures read.
//
//   node fase2/resultats/arrelament/continuitat/continuitat.mjs ID [--out FILE]
//
// From the branch's start capture and seed, the world's epochs exactly as sim.mjs does them (the small record's mon.mjs; the simulator is
// not touched), up to the end of the pilot's record. Before each tracked census E, the windows (1,250 and 250 epochs, or from the branch's
// start) are traced with the descent note's tracer (../descendencia/traca.mjs, imported as it is). It fails, and writes nothing more, if any
// measure (every 100 epochs: H0, the operations, the runs) or the final fingerprint differs from the pilot's record, if an appearance's cells
// do not hold its programs at E, or if a tag breaks the invariant. Nothing is measured here: the record keeps the origins, and analisi.mjs
// measures them (auditor 1's request at audit 45: scores can be recomputed without running the branches again).
// The output (registres/ID.jsonl.gz, JSON lines compressed with gzip): per census and window, D's carriers (half A, the donors, whole; half
// B, the first 1,000 of its random order; 1,000 far cells at random) as a pool of distinct sequences of 64 origins and indices into it; per
// appearance and window, its cells' origins and flags, its 200 matched cells (the descent note's) and the ring of cells around it.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { gzipSync } from 'zlib';
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { makeRng, shannonEntropy } from '../../../../fase1/soup.js';
import { fromHex } from '../../../inert.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { Observer } from '../registre-copies/traca.mjs';
import { createWorld } from '../registre-copies/mon.mjs';
import { ROOT, ARMS, sha256 } from '../registre-copies/dades.mjs';
import { Tracer, WINDOWS, SPLIT_SEED, MATCHED_SEED, FAR, MATCHED } from '../descendencia/traca.mjs';

import { HERE, LIST, LIST_SHA256, FAR_SEED, SAMPLE } from './comu.mjs';

const P = PROGRAM_SIZE;

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ID = args[0];
const outFile = opt('--out') ?? join(ROOT, HERE, 'registres', `${ID}.jsonl.gz`);
if (!ID || ID.startsWith('--') || args.length !== (opt('--out') ? 3 : 1)) { console.error('usage: node continuitat.mjs ID [--out FILE]'); process.exit(2); }
const listText = readFileSync(join(ROOT, LIST));
if (sha256(listText) !== LIST_SHA256) { console.error('continuitat: llista.json is not the note\'s'); process.exit(2); }
const L = JSON.parse(listText.toString());
const br = L.branches.find((b) => b.id === ID);
if (!br) { console.error(`continuitat: ${ID} is not in the list`); process.exit(2); }
mkdirSync(dirname(outFile), { recursive: true });
const lines = [];
const emit = (x) => lines.push(JSON.stringify(x));
const flush = () => writeFileSync(outFile, gzipSync(Buffer.from(lines.join('\n') + '\n'), { level: 9 }));
const fail = (why) => { emit({ type: 'fail', why }); flush(); console.error(`continuitat ${ID}: ${why}`); process.exit(1); };

// The pilot's record: the parameters of the world, the measures and the end
const recText = readFileSync(join(ROOT, br.record));
if (sha256(recText) !== br.recordSha256) fail('the pilot record is not the list\'s');
const rec = recText.toString().trim().split('\n').map((l) => JSON.parse(l));
const S = rec[0], END = rec.at(-1);
const [Wd, Ht] = S.world;
if (S.rng !== 'v2' || S.mixing !== 0 || S.diffusion !== 0 || S.flow !== 0 || S.renewal !== 0 || !Array.isArray(S.world)) fail('the branch is not a quiet 2D world with rng v2');
const n = Wd * Ht, every = S.every, start = S.start, last = END.epoch;
const measures = new Map(rec.filter((l) => l.type === 'measure').map((l) => [l.epoch, l]));
const capture = readFileSync(join(ROOT, S.from));
if (sha256(capture) !== br.captureSha256) fail('the start capture does not have the manifest\'s SHA-256');
const soup = new Uint8Array(capture);
if (soup.length !== n * P) fail('the start capture is not of this world');
emit({ type: 'start', branch: ID, world: br.world, soup: br.soup, code: codeVersion(), node: process.version, list: LIST_SHA256, seed: S.seed, start, end: last, windows: WINDOWS, censuses: br.observers.map((o) => o.epoch) });

const world = createWorld({ soup, width: Wd, height: Ht, radius: S.radius, mutation: S.mutation, seed: S.seed });
const active = [];
const plan = br.observers.map((o, index) => {
  const sets = o.sets.map((s) => ({ ...s, programs: s.programs.map(fromHex) }));
  return { ...o, index, sets, obs: null, starts: WINDOWS.map((w) => ({ w, at: Math.max(start, o.epoch - w) })) };
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

// The distance (Chebyshev, closed world) of every cell to the nearest cell with a bit, as the small record and the descent note
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
const shuffled = (arr, seed) => { const a = arr.slice(), r = makeRng(seed, 'v2'); for (let i = a.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; const x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
// The cells touching an appearance's cells that hold no tracked set (the descent note's local null), in order
const ring = (cells, car) => {
  const s = new Set();
  for (const c of cells) {
    const x = c % Wd, y = (c / Wd) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const X = x + dx, Y = y + dy;
      if (X < 0 || Y < 0 || X >= Wd || Y >= Ht) continue;
      const e = Y * Wd + X;
      if (!cells.includes(e) && car[e] === 0) s.add(e);
    }
  }
  return [...s].sort((a, b) => a - b);
};
const originsOf = (t, cells) => { const a = []; for (const c of cells) for (let j = 0; j < P; j++) a.push(t.orig[c * P + j]); return a; };

// At a tracked census: for every window, D's carriers and the appearances' cells, with their origins
function close(p, epoch) {
  const o = p.obs;
  o.update(soup);
  for (const y of p.appearances) {
    for (let i = 0; i < y.cells.length; i++) {
      const c = y.cells[i], prog = fromHex(y.programs[i]);
      for (let j = 0; j < P; j++) if (soup[c * P + j] !== prog[j]) fail(`at ${epoch}, the cell ${c} of ${y.id} does not hold its program`);
    }
  }
  const appCells = new Set(p.appearances.flatMap((y) => y.cells));
  const dSet = p.sets.find((s) => s.name === 'D'), dBit = dSet ? dSet.bit : 0;
  const dist = dBit ? distances(o.carrier, dBit) : null;
  const arm = ARMS.indexOf(br.soup);
  for (const t of o.tracers) {
    const bad = t.inconsistent(soup);
    if (bad) fail(`at ${epoch}, window ${t.window}: ${bad} bytes break the invariant`);
    let D = null;
    if (dBit) {
      // the halves as the descent note (its seed, so the same map), half B's sample and the far sample
      const all = []; for (let c = 0; c < n; c++) if (o.carrier[c] & dBit) all.push(c);
      const pool = all.filter((c) => !appCells.has(c));
      const sh = shuffled(pool, SPLIT_SEED + 1000 * Number(br.world) + 10 * arm + p.index), nA = Math.ceil(sh.length / 2);
      const A = sh.slice(0, nA), B = sh.slice(nA), Bs = B.slice(0, SAMPLE);
      const farAll = []; for (let c = 0; c < n; c++) if (dist[c] >= FAR) farAll.push(c);
      const Fs = shuffled(farAll, FAR_SEED + 1000 * Number(br.world) + 10 * arm + p.index).slice(0, SAMPLE);
      const seqs = [], at = new Map();
      const idx = (c) => { const s = t.orig.subarray(c * P, c * P + P), k = s.join(','); if (!at.has(k)) { at.set(k, seqs.length); seqs.push(s); } return at.get(k); };
      const iA = A.map(idx), iB = Bs.map(idx), iF = Fs.map(idx);
      const flat = []; for (const s of seqs) for (let j = 0; j < P; j++) flat.push(s[j]);
      D = { carriers: all.length, excluded: all.length - pool.length, A: A.length, B: B.length, farCells: farAll.length, pool: flat, halfA: iA, halfB: iB, far: iF };
    }
    emit({ type: 'census', epoch, window: t.window, windowStart: t.startEpoch, N: t.N, next: t.next, D });
    for (const y of p.appearances) {
      const flags = []; for (const c of y.cells) for (let j = 0; j < P; j++) flags.push(t.flag[c * P + j]);
      let matched = null;
      if (dBit) {
        // the descent note's 200 matched cells (its seed and order): the same distance to D, no tracked set
        const dy = Math.min(...y.cells.map((c) => dist[c]));
        const cand = [];
        for (let c = 0; c < n; c++) if (dist[c] === dy && o.carrier[c] === 0) cand.push(c);
        const r = makeRng(MATCHED_SEED + 1000 * Number(br.world) + 10 * arm + p.index, 'v2');
        for (let i = cand.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; const x = cand[i]; cand[i] = cand[j]; cand[j] = x; }
        const pick = cand.slice(0, MATCHED);
        matched = { distance: dy, cells: pick, orig: originsOf(t, pick) };
      }
      const rc = ring(y.cells, o.carrier);
      emit({ type: 'appearance', epoch, window: t.window, id: y.id, cells: y.cells, orig: originsOf(t, y.cells), flags, matched, ring: { cells: rc, orig: originsOf(t, rc) } });
    }
  }
  active.splice(active.indexOf(p), 1);
  p.obs = null;
  for (const s of p.starts) { s.tracer = null; s.done = true; }
}

// The run
open(start);
let ops = 0, runs = 0, checked = 0, invariantChecks = 0, rss = 0;
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
    rss = Math.max(rss, process.memoryUsage().rss);
  }
  for (const p of plan.filter((x) => x.epoch === epoch && x.obs)) close(p, epoch);
  open(epoch);
}
let hash = 0x811c9dc5;
for (let i = 0; i < soup.length; i++) hash = Math.imul(hash ^ soup[i], 0x01000193);
const fp = (hash >>> 0).toString(16);
if (fp !== END.fingerprint) fail(`the final fingerprint is not the pilot's (${fp} against ${END.fingerprint})`);
if (plan.some((p) => p.obs || p.starts.some((s) => !s.done))) fail('a tracked census was not reached');
emit({ type: 'end', branch: ID, measuresChecked: checked, invariantChecks, fingerprint: fp, seconds: (Date.now() - t0) / 1000, rssMB: Math.round(rss / 1048576) });
flush();
