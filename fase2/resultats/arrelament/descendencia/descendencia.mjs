// A measure of descent by position (exploratory; the note, README.md): one branch, again, with the descent scores.
//
//   node fase2/resultats/arrelament/descendencia/descendencia.mjs ID [--out FILE]
//
// From the branch's start capture and seed, the world's epochs exactly as sim.mjs does them (the small record's mon.mjs; the simulator is
// not touched), up to the end of the pilot's record. Before each tracked census E, the windows (1,250 and 250 epochs, or from the branch's
// start) are traced with this note's tracer (traca.mjs). It fails, and writes nothing more, if any measure (every 100 epochs: H0, the
// operations, the runs) or the final fingerprint differs from the pilot's record, if an appearance's cells do not hold its programs at E, or
// if a tag breaks the invariant. The output (registres/ID.jsonl): per census and window, a line of controls; per appearance and window, its
// scores and those of its matched cells; per pair of appearances of a census and window, their one-origin count and its local null.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { makeRng, shannonEntropy } from '../../../../fase1/soup.js';
import { fromHex } from '../../../inert.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { Observer, MUT, ARITH } from '../registre-copies/traca.mjs';
import { createWorld } from '../registre-copies/mon.mjs';
import { ROOT, ARMS, sha256 } from '../registre-copies/dades.mjs';
import { Tracer, WINDOWS, SPLIT_SEED, MATCHED_SEED, FAR, MATCHED, VARIANTS, MAIN, buildMap, score, aligned, shared, hist } from './traca.mjs';

export const HERE = 'fase2/resultats/arrelament/descendencia';
export const LIST = 'fase2/resultats/arrelament/registre-copies/llista.json';
export const LIST_SHA256 = 'c0afb2c0f182f9224d3ce447433255787a7068c063db9c7459c02dbac4bca4f2';
const P = PROGRAM_SIZE;

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ID = args[0];
const outFile = opt('--out') ?? join(ROOT, HERE, 'registres', `${ID}.jsonl`);
if (!ID || ID.startsWith('--') || args.length !== (opt('--out') ? 3 : 1)) { console.error('usage: node descendencia.mjs ID [--out FILE]'); process.exit(2); }
const listText = readFileSync(join(ROOT, LIST));
if (sha256(listText) !== LIST_SHA256) { console.error('descendencia: llista.json is not the note\'s'); process.exit(2); }
const L = JSON.parse(listText.toString());
const br = L.branches.find((b) => b.id === ID);
if (!br) { console.error(`descendencia: ${ID} is not in the list`); process.exit(2); }
mkdirSync(dirname(outFile), { recursive: true });
const lines = [];
const emit = (x) => lines.push(JSON.stringify(x));
const flush = () => writeFileSync(outFile, lines.join('\n') + '\n');
const fail = (why) => { emit({ type: 'fail', why }); flush(); console.error(`descendencia ${ID}: ${why}`); process.exit(1); };

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

// The distance (Chebyshev, closed world) of every cell to the nearest cell with a bit, as the small record
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
const bitCount = (t, cells, bit) => { let k = 0; for (const c of cells) for (let j = 0; j < P; j++) if (t.mask[c * P + j] & bit) k++; return k; };
const shuffled = (arr, seed) => { const a = arr.slice(), r = makeRng(seed, 'v2'); for (let i = a.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; const x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
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

// The maps and the controls of one set (D or Dbroad) at E: the halves of its carriers (the appearances' cells are never in them), the
// maps of half A, half B's scores and the far cells' scores, as histograms
function setControls(t, o, bit, appCells, variants, seed, dist) {
  const all = []; for (let c = 0; c < n; c++) if (o.carrier[c] & bit) all.push(c);
  const pool = all.filter((c) => !appCells.has(c));
  const sh = shuffled(pool, seed), nA = Math.ceil(sh.length / 2), A = sh.slice(0, nA), B = sh.slice(nA);
  const far = []; for (let c = 0; c < n; c++) if (dist[c] >= FAR) far.push(c);
  const maps = {}, thr = {}, heldOut = {}, farH = {};
  for (const v of variants) {
    if (!maps[v.frac]) maps[v.frac] = buildMap(t.orig, A, v.frac);
    const m = maps[v.frac];
    thr[v.key] = m.thr;
    heldOut[v.key] = hist(B.map((c) => score(t.orig, c, m, v.mode)));
    farH[v.key] = hist(far.map((c) => score(t.orig, c, m, v.mode)));
  }
  return { info: { carriers: all.length, excluded: all.length - pool.length, A: A.length, B: B.length, thr, heldOut, far: { cells: far.length, hist: farH } }, maps };
}

// At a tracked census: the controls, the appearances and their pairs, for every window
function close(p, epoch) {
  const o = p.obs;
  o.update(soup);
  const bitOf = Object.fromEntries(p.sets.map((s) => [s.name, s.bit]));
  for (const y of p.appearances) {
    for (let i = 0; i < y.cells.length; i++) {
      const c = y.cells[i], prog = fromHex(y.programs[i]);
      for (let j = 0; j < P; j++) if (soup[c * P + j] !== prog[j]) fail(`at ${epoch}, the cell ${c} of ${y.id} does not hold its program`);
    }
  }
  const appCells = new Set(p.appearances.flatMap((y) => y.cells));
  const dBit = bitOf.D ?? 0, bBit = bitOf.Dbroad ?? 0;
  const dist = dBit ? distances(o.carrier, dBit) : null, distB = bBit ? distances(o.carrier, bBit) : null;
  const main = VARIANTS.filter((v) => v.key === MAIN);
  const arm = ARMS.indexOf(br.soup);
  for (const t of o.tracers) {
    const bad = t.inconsistent(soup);
    if (bad) fail(`at ${epoch}, window ${t.window}: ${bad} bytes break the invariant`);
    // the exposure controls, as the small record
    const sets = p.sets.map((s) => {
      let carriers = 0, ok = 0, flagged = 0;
      for (let c = 0; c < n; c++) {
        if (!(o.carrier[c] & s.bit)) continue;
        carriers++;
        let full = false, fl = false;
        for (const a of o.index.windowsOf(soup, c * P, s.bit)) {
          let all = true;
          for (let j = a; j < a + 16; j++) { const i = c * P + j; if (!(t.mask[i] & s.bit)) all = false; if (t.flag[i]) fl = true; }
          if (all) { full = true; break; }
        }
        if (full) ok++; else if (fl) flagged++;
      }
      let atStart = 0; for (let c = 0; c < n; c++) if (t.startCarriers[c] & s.bit) atStart++;
      return { name: s.name, carriersAtStart: atStart, carriers, ok, flagged };
    });
    const seed = SPLIT_SEED + 1000 * Number(br.world) + 10 * arm + p.index;
    const D = dBit ? setControls(t, o, dBit, appCells, VARIANTS, seed, dist) : null;
    const Db = bBit ? setControls(t, o, bBit, appCells, main, seed + 5, distB) : null;
    emit({ type: 'census', epoch, window: t.window, windowStart: t.startEpoch, exposure: sets, D: D ? D.info : null, Dbroad: Db ? Db.info : null });
    for (const y of p.appearances) {
      const N = y.cells.length * P;
      let mutNew = 0, arith = 0, self = 0;
      const origCells = {};
      for (const c of y.cells) for (let j = 0; j < P; j++) {
        const i = c * P + j;
        if (t.flag[i] & ARITH) arith++;
        if (t.flag[i] === 0 && t.orig[i] === i) self++;
        if (t.orig[i] >= t.N) mutNew++;
        else { const oc = t.orig[i] >> 6; origCells[oc] = (origCells[oc] ?? 0) + 1; }
      }
      const descent = D ? Object.fromEntries(VARIANTS.map((v) => [v.key, y.cells.reduce((k, c) => k + score(t.orig, c, D.maps[v.frac], v.mode), 0)])) : null;
      const descentBroad = Db ? y.cells.reduce((k, c) => k + score(t.orig, c, Db.maps[main[0].frac], main[0].mode), 0) : null;
      let baseline = null;
      if (dBit) {
        // the small record's 200 matched cells (its seed and order): the same distance to D, no tracked set
        const dy = Math.min(...y.cells.map((c) => dist[c]));
        const cand = [];
        for (let c = 0; c < n; c++) if (dist[c] === dy && o.carrier[c] === 0) cand.push(c);
        const r = makeRng(MATCHED_SEED + 1000 * Number(br.world) + 10 * arm + p.index, 'v2');
        for (let i = cand.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; const x = cand[i]; cand[i] = cand[j]; cand[j] = x; }
        const pick = cand.slice(0, MATCHED);
        baseline = { distance: dy, cells: pick, exposure: pick.map((c) => bitCount(t, [c], dBit)),
          descent: Object.fromEntries(VARIANTS.map((v) => [v.key, pick.map((c) => score(t.orig, c, D.maps[v.frac], v.mode))])) };
      }
      let present = 0; const own = p.sets.find((s) => s.name === y.id);
      for (let c = 0; c < n; c++) if (t.startCarriers[c] & own.bit) present++;
      emit({ type: 'appearance', epoch, window: t.window, id: y.id, cells: y.cells, bytes: N,
        exposureD: dBit ? bitCount(t, y.cells, dBit) : null, exposureDbroad: bBit ? bitCount(t, y.cells, bBit) : null,
        descent, descentBroad, mutNew, arith, self, origCells, presentAtStart: present, baseline });
    }
    // the pairs of appearances of this census: the one-origin count, and its local null (the cells touching each, pair by pair)
    const A = p.appearances;
    for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) {
      let best = { same: 0, mirror: 0, max: 0 }, sh = 0, dmin = Infinity;
      for (const ca of A[i].cells) for (const cb of A[j].cells) {
        const a = aligned(t.orig, ca, cb); if (a.max > best.max) best = a;
        sh = Math.max(sh, shared(t.orig, ca, cb));
        dmin = Math.min(dmin, Math.max(Math.abs((ca % Wd) - (cb % Wd)), Math.abs(((ca / Wd) | 0) - ((cb / Wd) | 0))));
      }
      const ra = ring(A[i].cells, o.carrier), rb = ring(A[j].cells, o.carrier);
      const nul = [], nulA = [];
      for (const ca of ra) for (const cb of rb) if (ca !== cb) { nul.push(shared(t.orig, ca, cb)); nulA.push(aligned(t.orig, ca, cb).max); }
      emit({ type: 'pair', epoch, window: t.window, a: A[i].id, b: A[j].id, shared: sh, same: best.same, mirror: best.mirror, aligned: best.max, distance: dmin,
        nullPairs: nul.length, nullHist: hist(nul), nullHistAligned: hist(nulA) });
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
