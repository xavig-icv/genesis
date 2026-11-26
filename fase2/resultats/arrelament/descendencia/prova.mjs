// A measure of descent by position (exploratory; the note, README.md): the instrument's checks, before it is used on any branch.
//
//   node fase2/resultats/arrelament/descendencia/prova.mjs > fase2/resultats/arrelament/descendencia/prova-sortida.txt
//
// Test worlds only (random bytes), with the replicator of Phase 1 that the project's tests already use and a variant of it made here (the
// same instructions, its other non-zero bytes changed): no world of the project is touched and nothing is planted in any experiment.
//   1. The small record's interpreter and mutations, again (a shorter run), and this note's new origins of mutations.
//   2. The tags against a slow reference written another way, at every epoch, with and without mutations.
//   3. Known answers, one case at a time (auditor 2's list at audit 44).
//   4. The descent score in test worlds with a known answer: specificity against the variant and against an independent planting.
//   5. The one-origin rule in the test world, and its null.
//   6. The world against sim.mjs, with this note's tracers open.
//   7. The validators fail closed (AU2-219) and the comparator's exit code (AU2-223).
//   8. The analysis on synthetic records with a known answer.
import { writeFileSync, mkdtempSync, readFileSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execFileSync, spawnSync } from 'child_process';
import { evaluate, TAPE_SIZE, PROGRAM_SIZE, OPCODES } from '../../../../fase1/bff.js';
import { makeRng, mutate, shannonEntropy } from '../../../../fase1/soup.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { evaluateEvents, mutateListed, writes, Observer, MUT, ARITH } from '../registre-copies/traca.mjs';
import { createWorld } from '../registre-copies/mon.mjs';
import { ROOT, ARMS } from '../registre-copies/dades.mjs';
import { Tracer, RefTracer, buildMap, score, aligned, shared, hist, quantile, shareAtLeast, VARIANTS, MAIN, WINDOWS, EDGE, NULL_MAX, RUN } from './traca.mjs';
import { validate, pilotFacts } from './valida.mjs';
import { compare } from './compara.mjs';

const P = PROGRAM_SIZE;
const MAIN_MODE = VARIANTS.find((v) => v.key === MAIN).mode;
const out = (s = '') => console.log(s);
let failures = 0;
const check = (ok, what) => { out(`   ${ok ? 'ok  ' : 'FAIL'} ${what}`); if (!ok) failures++; };
const HERE = 'fase2/resultats/arrelament/descendencia';
// The replicator of Phase 1 (the one of test/quimiques.mjs, test/densitat.mjs and registre-copies/prova.mjs)
const R1 = Uint8Array.from([140,221,0,221,20,164,126,32,105,126,78,173,241,242,207,220,199,45,213,101,52,91,155,79,44,60,2,125,93,71,65,217,65,5,71,141,93,141,15,5,65,217,15,71,93,125,2,60,44,79,155,91,52,101,213,45,0,0,62,82,0,77,77,0]);
// The variant: the same instructions and zeros; every other byte moved to the next value that is neither an instruction nor 0
const INSTR = new Set([...OPCODES].map((c) => c.charCodeAt(0)));
const R2 = R1.map((b) => { if (b === 0 || INSTR.has(b)) return b; let v = b; do { v = (v + 1) & 255; } while (v === 0 || INSTR.has(v) || v === b); return v; });
out(`A measure of descent by position: the instrument's checks (exploratory). The code: ${codeVersion()}, ${process.version}.`);

// 1. The interpreter and the mutations (the small record's, imported as they are), and the new origins of mutations
out('\n1. The interpreter and the mutations, again; the new origins of mutations');
{
  const rng = makeRng(3300000101, 'v2'), ops = [...OPCODES].map((c) => c.charCodeAt(0)), ev = new Int32Array(2 * 8192 + 2);
  let same = 0, total = 0;
  for (let i = 0; i < 20000; i++) {
    const t = Uint8Array.from({ length: TAPE_SIZE }, () => (rng() < 0.7 ? ops[(rng() * ops.length) | 0] : (rng() * 256) | 0));
    const a = t.slice(), b = t.slice();
    total++; if (evaluate(a, 0) === evaluateEvents(b, 0, ev) && a.every((v, k) => v === b[k])) same++;
  }
  check(same === total, `the same tape and operations as evaluate: ${same} of ${total} tapes`);
  const a = new Uint8Array(1 << 18), b = new Uint8Array(1 << 18), ra = makeRng(3300000102, 'v2'), rb = makeRng(3300000102, 'v2'), list = [];
  const ca = mutate(a, a.length, 0.001, ra), cb = mutateListed(b, b.length, 0.001, rb, list);
  check(ca === cb && a.every((v, k) => v === b[k]) && ra() === rb() && list.length === cb, `mutateListed: the same buffer and random numbers as mutate (${cb} mutations)`);
  const fake = { carrier: new Uint16Array(4), update() {}, tracers: [] };
  const t = new Tracer(fake, 0, 0, new Uint8Array(4 * P), 2);
  t.mutated([5, 9, 5]);
  check(t.orig[5] === 4 * P + 2 && t.orig[9] === 4 * P + 1 && t.flag[5] === MUT && t.next === 4 * P + 3, 'each mutated byte takes a new origin of its own, above the world\'s bytes and in order (a byte mutated twice, the second)');
}

// A test world: random bytes, some cells holding programs; createWorld as the instrument uses it
function testWorld({ W, H, seed, plant, mutation }) {
  const r = makeRng(seed, 'v2'), n = W * H;
  const soup = Uint8Array.from({ length: n * P }, () => (r() * 256) | 0);
  for (const [cells, prog] of plant) for (const c of cells) soup.set(prog, c * P);
  return { n, soup, world: createWorld({ soup, width: W, height: H, radius: 2, mutation, seed: seed + 1 }) };
}
const cellsAt = (W, pts) => pts.map(([x, y]) => y * W + x);

// 2. The tags against the slow reference
out('\n2. The tags against a slow reference written another way (the tags on the world\'s bytes), at every epoch');
for (const mutation of [0, 0.002]) {
  const W = 32, H = 32;
  const { n, soup, world } = testWorld({ W, H, seed: 3300000201, mutation, plant: [[cellsAt(W, [[6, 6], [7, 6]]), R1], [cellsAt(W, [[24, 24], [25, 24]]), R2]] });
  const o = new Observer(n, [{ name: 'R1', bit: 1, programs: [R1] }, { name: 'R2', bit: 2, programs: [R2] }]); o.all(soup);
  const t = new Tracer(o, 0, 0, soup, n / 2), ref = new RefTracer(o, soup);
  o.tracers.push(t, ref);
  let epochsEqual = 0, bad = 0;
  for (let e = 0; e < 60; e++) {
    world.step([o]);
    let eq = t.next === ref.next;
    for (let i = 0; eq && i < soup.length; i++) if (t.orig[i] !== ref.orig[i] || t.flag[i] !== ref.flag[i] || t.mask[i] !== ref.mask[i]) eq = false;
    if (eq) epochsEqual++;
    bad += t.inconsistent(soup);
  }
  check(epochsEqual === 60, `mutation ${mutation}: the origins, flags and bits equal to the reference's at ${epochsEqual} of 60 epochs (${t.next - soup.length} new origins of mutations)`);
  check(bad === 0, `mutation ${mutation}: the invariant holds at every epoch`);
}

// 3. Known answers, one case at a time
out('\n3. Known answers, one case at a time');
{
  const fakeObserver = (bits) => ({ carrier: Uint16Array.from(bits), update() {}, tracers: [] });
  const pair = Uint32Array.from([0, 1]), ev = new Int32Array(2 * 8192 + 2);
  // a. exact replication: R1 in cell 0, data in cell 1; the partner's copied bytes descend from cell 0 and keep their adjacency (the
  //    replicator of Phase 1 copies itself backwards, its byte g to the partner's 62 - g: off the mirror by one; previ/desplacament-1.txt)
  {
    const soup = new Uint8Array(2 * P); soup.set(R1, 0); soup.fill(1, P);
    const t = new Tracer(fakeObserver([1, 0]), 0, 0, soup, 1), tape = soup.slice();
    t.gather(pair, 1); evaluateEvents(tape, 0, ev); t.apply(0, ev, writes.n); soup.set(tape); t.scatter(pair, 1);
    let fromA = 0, posOrMirror = 0;
    for (let j = 0; j < P; j++) { const g = t.orig[P + j]; if (g < P) { fromA++; if (g === j || g === P - 1 - j) posOrMirror++; } }
    const sh = shared(t.orig, 0, 1);
    check(fromA >= 32 && sh >= fromA - 2, `exact replication: ${fromA} bytes of the partner come from the replicator; ${sh} of its pairs of adjacent origins are the replicator's (by absolute position or the mirror, ${posOrMirror} bytes)`);
  }
  // b. '+' and '-'; c. a copy onto an equal value; d. a chain of copies; e. two origins in one cell
  {
    const t = new Tracer(fakeObserver([0, 0]), 0, 0, new Uint8Array(2 * P).fill(9), 1);
    t.gather(pair, 1); t.apply(0, Int32Array.from([5, -1, 6, -2, 64, 0, 70, 64, 71, 70]), 5); t.scatter(pair, 1);
    check(t.orig[5] === 5 && t.flag[5] === ARITH && t.orig[6] === 6 && t.flag[6] === ARITH, "'+' and '-' keep the origin and set the flag");
    check(t.orig[64] === 0 && t.flag[64] === 0, 'a copy onto an equal value takes the source\'s origin');
    check(t.orig[70] === 0 && t.orig[71] === 0, 'a chain of copies keeps the first origin');
    const cells = new Set([...Array(P).keys()].map((j) => (t.orig[P + j] < 2 * P ? t.orig[P + j] >> 6 : -1)));
    check(cells.has(0) && cells.has(1), 'two origins in one cell: the partner holds bytes from both cells');
  }
  // f. a mutation to the same value: a new origin, flagged, even if the value does not change
  {
    const soup = new Uint8Array(2 * P).fill(7), t = new Tracer(fakeObserver([0, 0]), 0, 0, soup, 1);
    t.mutated([3]);
    check(soup[3] === 7 && t.orig[3] === 2 * P && t.flag[3] === MUT && t.inconsistent(soup) === 0, 'a mutation to the same value: a new origin and the flag, the invariant holds');
  }
  // the map and the score on origins with a known answer: 40 carriers whose byte j descends from origin 1000 + j (the same program)
  const N = 100 * P, orig = new Int32Array(N);
  for (let i = 0; i < N; i++) orig[i] = 5000000 + i;   // every other byte, an origin of its own
  const carriers = [...Array(40).keys()].map((k) => k + 10);
  for (const c of carriers) for (let j = 0; j < P; j++) orig[c * P + j] = 1000 + j;
  const map = buildMap(orig, carriers, 0.01);
  // g. recombination: half of a copy, half other bytes
  for (let j = 0; j < P; j++) orig[60 * P + j] = j < 32 ? 1000 + j : 7000000 + j;
  check(score(orig, 60, map, MAIN_MODE) === 31, `recombination: half a copy scores ${score(orig, 60, map, MAIN_MODE)} of 63 pairs`);
  // a fragment: a run of 16 bytes of a copy, the rest other bytes: 15 pairs, the run that counts as descent
  for (let j = 0; j < P; j++) orig[59 * P + j] = j >= 20 && j < 36 ? 1000 + j - 9 : 7200000 + j;
  check(score(orig, 59, map, MAIN_MODE) === RUN[MAIN_MODE], `a fragment, a run of 16 bytes of a copy moved by 9: ${score(orig, 59, map, MAIN_MODE)} of 63 pairs (the run that counts, ${RUN[MAIN_MODE]})`);
  // h. a new arrangement: the carriers' origins, shuffled within the cell (a fixed random order)
  { const r = makeRng(3300000301, 'v2'), perm = [...Array(P).keys()]; for (let i = P - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [perm[i], perm[j]] = [perm[j], perm[i]]; }
    for (let j = 0; j < P; j++) orig[61 * P + j] = 1000 + perm[j]; }
  check(score(orig, 61, map, MAIN_MODE) <= 3 && score(orig, 61, map, 'any') === 64, `a new arrangement of the same bytes: ${score(orig, 61, map, MAIN_MODE)} of 63 pairs (at any position, ${score(orig, 61, map, 'any')} of 64 bytes)`);
  // copies at another offset or backwards: the run of a copy moved by 5 (the rest other bytes), and the whole copy backwards and off by one
  for (let j = 0; j < P; j++) orig[62 * P + j] = j >= 5 ? 1000 + j - 5 : 7100000 + j;
  for (let j = 0; j < P; j++) orig[63 * P + j] = 1000 + ((P + 62 - j) % P);
  check(score(orig, 62, map, MAIN_MODE) === 58 && score(orig, 62, map, 'pm') <= 2, `a copy moved by 5 bytes: ${score(orig, 62, map, MAIN_MODE)} of 63 pairs (by absolute position or the mirror, ${score(orig, 62, map, 'pm')} of 64)`);
  check(score(orig, 63, map, MAIN_MODE) >= 62 && score(orig, 63, map, 'p') <= 2, `a backward copy off the mirror by one (as the replicator of Phase 1): ${score(orig, 63, map, MAIN_MODE)} of 63 pairs (by position only, ${score(orig, 63, map, 'p')})`);
  // i. a false carrier made by a mutation (auditor 2's counterexample): the exposure bit takes all 64 bytes with no write; the score stays 0
  {
    const p = Uint8Array.from({ length: P }, (_, i) => 128 + (i % 24)), s = new Uint8Array(2 * P).fill(200);
    const o = new Observer(2, [{ name: 'D', bit: 1, programs: [p] }]); o.all(s);
    const t = new Tracer(o, 1250, 0, s, 1);
    s.set(p.subarray(0, 16)); t.mutated([...Array(16).keys()]); o.all(s);
    const tape = s.slice(); t.gather(pair, 1); evaluateEvents(tape, 0, ev); const w = writes.n; t.apply(0, ev, w); t.scatter(pair, 1);
    const exposed = [...Array(P).keys()].filter((j) => t.mask[j] & 1).length;
    const m = buildMap(Int32Array.from({ length: 30 * P }, (_, i) => 1000 + (i % P)), [...Array(30).keys()], 0.01);
    check(o.carrier[0] === 1 && w === 0 && exposed === 64 && score(t.orig, 0, m, MAIN_MODE) === 0, `a false carrier made by a mutation: no write, the exposure bit on ${exposed} of 64 bytes, the descent score ${score(t.orig, 0, m, MAIN_MODE)}`);
  }
  // j. disappearance and rebirth: a carrier's 64 bytes all mutated (new origins), even back to the same values: no descent; a copy of it
  // shares its new origins
  {
    const soup = new Uint8Array(2 * P); soup.set(R1, 0);
    const t = new Tracer(fakeObserver([1, 0]), 0, 0, soup, 1);
    const m = buildMap(Int32Array.from({ length: 30 * P }, (_, i) => i % P), [...Array(30).keys()], 0.01);   // the map of cell 0's own origins
    const before = score(t.orig, 0, m, MAIN_MODE);
    t.mutated([...Array(P).keys()]);
    t.gather(pair, 1); t.apply(0, Int32Array.from([...Array(P).keys()].flatMap((j) => [P + j, j])), P); t.scatter(pair, 1);
    check(before === 63 && score(t.orig, 0, m, MAIN_MODE) === 0 && shared(t.orig, 0, 1) === 63, `disappearance and rebirth: ${before} of 63 pairs before, ${score(t.orig, 0, m, MAIN_MODE)} after its bytes are all mutated; its copy shares its ${shared(t.orig, 0, 1)} new pairs`);
  }
}

// 4. The descent score in test worlds with a known answer
out('\n4. The descent score in test worlds: the replicator, its variant beside it and an independent planting of the replicator far away');
let lastWorld = null;
for (const mutation of [0, 0.0005]) {
  const W = 128, H = 32, spread = 0, traced = 30;   // the window opens at the planting: every later carrier is made within it, as the dominant group's in the main window
  const { n, soup, world } = testWorld({ W, H, seed: 3300000401 + (mutation ? 1 : 0), mutation, plant: [
    [cellsAt(W, [[12, 10], [13, 10], [12, 11]]), R1], [cellsAt(W, [[12, 22], [13, 22], [12, 23]]), R2], [cellsAt(W, [[112, 16], [113, 16], [112, 17]]), R1]] });
  for (let e = 0; e < spread; e++) world.step();
  const o = new Observer(n, [{ name: 'R1', bit: 1, programs: [R1] }, { name: 'R2', bit: 2, programs: [R2] }]); o.all(soup);
  const t = new Tracer(o, 0, spread, soup, n / 2); o.tracers.push(t);
  for (let e = 0; e < traced; e++) world.step([o]);
  o.update(soup);
  const xOf = (c) => c % W;
  const r1 = [], r1b = [], r2 = [];
  for (let c = 0; c < n; c++) { if ((o.carrier[c] & 1) && xOf(c) < 64) r1.push(c); else if (o.carrier[c] & 1) r1b.push(c); if ((o.carrier[c] & 2) && !(o.carrier[c] & 1)) r2.push(c); }
  // the plantings did not meet (no carrier of the replicator in the middle columns), and the far cells are far from both
  const apart = ![...r1, ...r1b].some((c) => xOf(c) >= 56 && xOf(c) < 72);
  const sh = r1.slice(), rr = makeRng(3300000410, 'v2');
  for (let i = sh.length - 1; i > 0; i--) { const j = (rr() * (i + 1)) | 0; const x = sh[i]; sh[i] = sh[j]; sh[j] = x; }
  const A = sh.slice(0, Math.ceil(sh.length / 2)), Bh = sh.slice(Math.ceil(sh.length / 2));
  const far = []; for (let c = 0; c < n; c++) if (!o.carrier[c] && xOf(c) >= 56 && xOf(c) < 72) far.push(c);
  out(`   mutation ${mutation}: carriers of the replicator ${r1.length} (half A ${A.length}, half B ${Bh.length}), of the independent planting ${r1b.length}, of the variant ${r2.length}; far cells ${far.length}`);
  for (const v of VARIANTS.filter((x) => [MAIN, 'pm1', 'p1'].includes(x.key))) {
    const m = buildMap(t.orig, A, v.frac), hB = hist(Bh.map((c) => score(t.orig, c, m, v.mode))), q = quantile(hB, 0.10), K = RUN[v.mode];
    const at = (cells) => shareAtLeast(hist(cells.map((c) => score(t.orig, c, m, v.mode))), K);
    const sB = at(Bh), sV = at(r2), sI = at(r1b), sF = at(far);
    if (v.key === MAIN) {
      check(apart && r1.length >= 20 && r1b.length >= 10 && r2.length >= 10 && far.length >= 100, 'the test world is usable: the plantings kept apart, enough carriers of each and far cells');
      check(q >= K && sB >= 0.90, `sensitivity, the replicator's half B: q10 = ${q} of 63 pairs, ${sB?.toFixed(3)} at the run of ${K} or above`);
      check(sV <= 0.05, `specificity, the variant beside it (not a descendant): ${sV?.toFixed(3)} of its carriers at ${K} or above`);
      check(sI <= 0.05, `specificity, the independent planting (the same program, another ancestry): ${sI?.toFixed(3)} at ${K} or above`);
      check(sF <= 0.05, `the far cells: ${sF?.toFixed(3)} at ${K} or above`);
    } else out(`      ${v.key} (descriptive): q10 ${q}; at ${K} or above: half B ${sB?.toFixed(3)}, the variant ${sV?.toFixed(3)}, the independent planting ${sI?.toFixed(3)}, far ${sF?.toFixed(3)}`);
  }
  // the exposure bit, for comparison: the share of the bytes with the replicator's bit
  const expo = (cells) => (cells.length ? cells.reduce((k, c) => { let s = 0; for (let j = 0; j < P; j++) if (t.mask[c * P + j] & 1) s++; return k + s; }, 0) / (cells.length * P) : null);
  out(`      the exposure bit (descriptive): half B ${expo(Bh)?.toFixed(3)}, the variant ${expo(r2)?.toFixed(3)}, the independent planting ${expo(r1b)?.toFixed(3)}, far ${expo(far)?.toFixed(3)}`);
  if (mutation === 0) lastWorld = { o, t, r1, r1b, r2, n, W };
}

// 5. The one-origin rule in the test world
out('\n5. The one-origin rule in the test world (no mutation): shared pairs of adjacent origins, 15 or more');
{
  const { o, t, r1, r1b, r2, n, W } = lastWorld;
  const near = (a, b) => Math.max(Math.abs((a % W) - (b % W)), Math.abs(((a / W) | 0) - ((b / W) | 0))) <= 2;
  let pr = 0, pr15 = 0, x = 0, x15 = 0, v = 0, v15 = 0;
  for (let i = 0; i < r1.length; i++) for (let j = i + 1; j < r1.length; j++) if (near(r1[i], r1[j])) { pr++; if (shared(t.orig, r1[i], r1[j]) >= EDGE) pr15++; }
  for (const a of r1) for (const b of r1b) { x++; if (shared(t.orig, a, b) >= EDGE) x15++; }
  for (const a of r1) for (const b of r2) { v++; if (shared(t.orig, a, b) >= EDGE) v15++; }
  const plain = []; for (let c = 0; c < n; c++) if (!o.carrier[c]) plain.push(c);
  let np = 0, n15 = 0;
  for (let i = 0; i + 1 < plain.length; i++) { const a = plain[i], b = plain[i + 1]; if (!near(a, b)) continue; np++; if (shared(t.orig, a, b) >= EDGE) n15++; }
  check(pr > 0 && pr15 / pr >= 0.5, `copies of the replicator near each other share an origin: ${pr15} of ${pr} pairs`);
  check(x15 === 0, `the replicator and its independent planting never: ${x15} of ${x} pairs`);
  out(`      the replicator and its variant beside it (descriptive: a cell can hold both): ${v15} of ${v} pairs`);
  check(np > 0 && n15 / np < NULL_MAX, `the null, neighbouring cells with no program: ${n15} of ${np} pairs`);
}

// 6. The world against sim.mjs, with this note's tracers open
out('\n6. A tiny world from a capture, run by sim.mjs and by the instrument with this note\'s tracers open');
{
  const dir = mkdtempSync(join(tmpdir(), 'descendencia-prova-')), cap = join(dir, 'capture.bin'), js = join(dir, 'sim.jsonl');
  try {
    const r = makeRng(3300000601, 'v2'), W = 32, H = 32, n = W * H;
    const soup = Uint8Array.from({ length: n * P }, () => (r() * 256) | 0);
    soup.set(R1, 100 * P); soup.set(R1, 900 * P);
    writeFileSync(cap, soup);
    execFileSync(process.execPath, ['sim.mjs', '--world', '32x32', '--seed', '3300000602', '--mixing', '0', '--from', cap, '--start', '0', '--epochs', '600', '--every', '100', '--json', js], { cwd: ROOT, stdio: ['ignore', 'ignore', 'pipe'] });
    const L = readFileSync(js, 'utf8').trim().split('\n').map((l) => JSON.parse(l)), M = L.filter((l) => l.type === 'measure'), END = L.at(-1);
    const world = createWorld({ soup, width: W, height: H, radius: L[0].radius, mutation: L[0].mutation, seed: 3300000602 });
    let o = null, ops = 0, runs = 0, okM = 0;
    for (let e = 1; e <= 600; e++) {
      if (e === 101) { o = new Observer(n, [{ name: 'R', bit: 1, programs: [R1] }]); o.all(soup); o.tracers.push(new Tracer(o, 0, 100, soup, n / 2), new RefTracer(o, soup)); }
      const s = world.step(o ? [o] : []); ops += s.ops; runs += s.runs;
      if (e % 100 === 0) { const m = M.find((x) => x.epoch === e); if (m && m.h0 === shannonEntropy(soup) && m.ops === ops && m.runs === runs) okM++; ops = 0; runs = 0; }
    }
    let hash = 0x811c9dc5;
    for (let i = 0; i < soup.length; i++) hash = Math.imul(hash ^ soup[i], 0x01000193);
    check(okM === 6 && M.length === 6, `the measures of sim.mjs: ${okM} of ${M.length} equal (both tracers open from epoch 101)`);
    check((hash >>> 0).toString(16) === END.fingerprint, `the final fingerprint: ${(hash >>> 0).toString(16)} against sim.mjs's ${END.fingerprint}`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

// Synthetic records for the 18 branches (no branch is run): valid against the list and the pilot's records, with chosen scores
const list = JSON.parse(readFileSync(join(ROOT, 'fase2/resultats/arrelament/registre-copies/llista.json'), 'utf8'));
const readJsonl = (rel) => readFileSync(join(ROOT, rel), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const pilot = pilotFacts(list, readJsonl);
const keys = VARIANTS.map((v) => v.key);
function synthetic({ appScore, matched }) {
  const recs = new Map();
  for (const br of list.branches) {
    const pr = pilot.get(br.id), L = [];
    L.push({ type: 'start', branch: br.id, world: br.world, soup: br.soup, code: 'abc1234', node: 'v16', list: 'c0afb2c0f182f9224d3ce447433255787a7068c063db9c7459c02dbac4bca4f2', seed: pr.seed, start: pr.start, end: pr.end, windows: WINDOWS, censuses: br.observers.map((o) => o.epoch) });
    for (const o of br.observers) for (const w of WINDOWS) {
      const hasD = o.sets.some((s) => s.name === 'D'), hasB = o.sets.some((s) => s.name === 'Dbroad');
      const info = (ks) => { const h = new Array(65).fill(0); h[40] = 20; const fh = new Array(65).fill(0); fh[0] = 200; return { carriers: 40, excluded: 0, A: 20, B: 20, thr: Object.fromEntries(ks.map((k) => [k, 2])), heldOut: Object.fromEntries(ks.map((k) => [k, h.slice()])), far: { cells: 200, hist: Object.fromEntries(ks.map((k) => [k, fh.slice()])) } }; };
      L.push({ type: 'census', epoch: o.epoch, window: w, windowStart: Math.max(pr.start, o.epoch - w), exposure: o.sets.map((s) => ({ name: s.name, carriersAtStart: 0, carriers: s.name === 'D' ? 40 : 20, ok: 20, flagged: 0 })), D: hasD ? info(keys) : null, Dbroad: hasB ? info([MAIN]) : null });
      for (const y of o.appearances) {
        const N = y.cells.length * P;
        L.push({ type: 'appearance', epoch: o.epoch, window: w, id: y.id, cells: y.cells, bytes: N, exposureD: hasD ? N : null, exposureDbroad: hasB ? N : null,
          descent: hasD ? Object.fromEntries(keys.map((k) => [k, appScore * y.cells.length])) : null, descentBroad: hasB ? appScore * y.cells.length : null,
          mutNew: 0, arith: 0, self: 0, origCells: { [String(y.cells[0])]: N }, presentAtStart: 0,
          baseline: hasD ? { distance: 1, cells: [...Array(400).keys()].map((k) => (y.cells[0] + 1 + k) % 131072).filter((c) => !y.cells.includes(c)).slice(0, 200), exposure: new Array(200).fill(32), descent: Object.fromEntries(keys.map((k) => [k, new Array(200).fill(matched)])) } : null });
      }
      for (let i = 0; i < o.appearances.length; i++) for (let j = i + 1; j < o.appearances.length; j++) { const nh = new Array(65).fill(0); nh[0] = 50; L.push({ type: 'pair', epoch: o.epoch, window: w, a: o.appearances[i].id, b: o.appearances[j].id, shared: 0, same: 0, mirror: 0, aligned: 0, distance: 5, nullPairs: 50, nullHist: nh, nullHistAligned: nh.slice() }); }
    }
    L.push({ type: 'end', branch: br.id, measuresChecked: pr.measures, invariantChecks: pr.measures, fingerprint: pr.fingerprint, seconds: 1, rssMB: 100 });
    recs.set(br.id, L);
  }
  return recs;
}
const writeRecs = (dir, recs) => { mkdirSync(dir, { recursive: true }); for (const [id, L] of recs) writeFileSync(join(dir, `${id}.jsonl`), L.map((x) => JSON.stringify(x)).join('\n') + '\n'); };
const clone = (recs) => new Map([...recs].map(([k, L]) => [k, JSON.parse(JSON.stringify(L))]));

// 7. The validators fail closed, and the comparator's exit code
out('\n7. The validators fail closed (AU2-219) and the comparator says a difference by its exit code (AU2-223)');
{
  const good = synthetic({ appScore: 40, matched: 0 });
  const files = list.branches.map((b) => `${b.id}.jsonl`);
  const r0 = validate({ list, records: good, files, pilot });
  check(r0.problems.length === 0, `a valid synthetic record set: ${r0.problems.length} problems${r0.problems.length ? ` (${r0.problems[0]})` : ''}`);
  const first = (recs, type, pred = () => true) => recs.get(list.branches[0].id).find((l) => l.type === type && pred(l));
  const withD = list.branches.find((b) => b.observers.some((o) => o.sets.some((s) => s.name === 'D'))).id;
  const firstD = (recs, type) => recs.get(withD).find((l) => l.type === type && (type !== 'appearance' || l.descent));
  const cases = {
    'a false seed': (r) => { first(r, 'start').seed = -1; },
    'a false fingerprint': (r) => { first(r, 'end').fingerprint = 'false'; },
    'no measures': (r) => { first(r, 'end').measuresChecked = 0; },
    'a score above the bytes (D = 2)': (r) => { const a = firstD(r, 'appearance'); a.descent[MAIN] = a.bytes + 1; },
    'a fractional score': (r) => { firstD(r, 'appearance').descent[MAIN] = 10.5; },
    'a cell outside the world': (r) => { first(r, 'appearance').origCells = { 999999999: first(r, 'appearance').bytes }; },
    'origins that do not add up': (r) => { first(r, 'appearance').mutNew = 1; },
    'carriers below ok + flagged': (r) => { const c = first(r, 'census'); c.exposure[0].ok = c.exposure[0].carriers + 1; },
    'a histogram that does not add up': (r) => { firstD(r, 'census').D.heldOut[MAIN][3] += 1; },
    'a duplicated line': (r) => { const L = r.get(list.branches[0].id); L.splice(1, 0, JSON.parse(JSON.stringify(L[1]))); },
    'a missing line': (r) => { const L = r.get(list.branches[0].id); L.splice(L.findIndex((l) => l.type === 'appearance'), 1); },
    'a line of an unexpected type': (r) => { const L = r.get(list.branches[0].id); L.splice(1, 0, { type: 'fail', why: 'x' }); },
    'an extra field': (r) => { first(r, 'census').extra = 1; },
    'a code with +': (r) => { for (const L of r.values()) L[0].code = 'abc1234+canvis'; },
    'two commits': (r) => { first(r, 'start').code = 'def5678'; },
    'a wrong window start': (r) => { first(r, 'census').windowStart += 1; },
    'a baseline cell inside the appearance': (r) => { const a = firstD(r, 'appearance'); a.baseline.cells[0] = a.cells[0]; },
    'a pair whose larger count is not the larger': (r) => { const L = [...r.values()].find((x) => x.some((l) => l.type === 'pair')); L.find((l) => l.type === 'pair').aligned = 5; },
    'a missing record': (r) => { r.delete(list.branches[0].id); },
  };
  let rejected = 0;
  for (const [name, mut] of Object.entries(cases)) {
    const r = clone(good); mut(r);
    const v = validate({ list, records: r, files, pilot });
    if (v.problems.length) rejected++; else out(`   FAIL not rejected: ${name}`);
  }
  check(rejected === Object.keys(cases).length, `impossible records rejected: ${rejected} of ${Object.keys(cases).length}`);
  check(validate({ list, records: good, files: [...files, 'extra.jsonl'], pilot }).problems.length > 0, 'a folder with a file that is not the list\'s: rejected');
  // through the command line: exit 0 for the valid set, non-zero for an impossible one
  const dir = mkdtempSync(join(tmpdir(), 'descendencia-check-'));
  try {
    writeRecs(join(dir, 'ok'), good);
    const bad = clone(good); first(bad, 'end').fingerprint = 'false'; writeRecs(join(dir, 'bad'), bad);
    const run = (sub) => spawnSync(process.execPath, [`${HERE}/analisi.mjs`, '--check', '--registres', join(dir, sub)], { cwd: ROOT, encoding: 'utf8' }).status;
    const sOk = run('ok'), sBad = run('bad');
    check(sOk === 0 && sBad === 1, `analisi.mjs --check: exit ${sOk} for the valid set, ${sBad} for an impossible one`);
    const A = good.get(list.branches[0].id).map((x) => JSON.stringify(x)).join('\n') + '\n';
    const Bm = clone(good); first(Bm, 'start').code = 'fff0000'; first(Bm, 'end').seconds = 99;
    const Bt = Bm.get(list.branches[0].id).map((x) => JSON.stringify(x)).join('\n') + '\n';
    const Cm = clone(good); first(Cm, 'census').windowStart += 1;
    const Ct = Cm.get(list.branches[0].id).map((x) => JSON.stringify(x)).join('\n') + '\n';
    writeFileSync(join(dir, 'a.jsonl'), A); writeFileSync(join(dir, 'b.jsonl'), Bt); writeFileSync(join(dir, 'c.jsonl'), Ct);
    const cmp = (x, y) => spawnSync(process.execPath, [`${HERE}/compara.mjs`, ...(y ? [join(dir, x), join(dir, y)] : [join(dir, x)])], { cwd: ROOT, encoding: 'utf8' }).status;
    const e1 = cmp('a.jsonl', 'b.jsonl'), e2 = cmp('a.jsonl', 'c.jsonl'), e3 = cmp('a.jsonl');
    check(e1 === 0 && e2 === 1 && e3 === 2 && compare(A, Ct).length === 1, `compara.mjs: exit ${e1} for records that differ only in the ignored fields, ${e2} for a difference, ${e3} for wrong arguments`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

// 8. The analysis on synthetic records with a known answer
out('\n8. The analysis (analisi.mjs) on synthetic records with a known answer');
for (const [name, appScore, matched, expect, rd] of [
  ['all copies of D', 40, 0, 'Two thirds or more are copies of D', '17, 5, 4'],
  ['none a copy of D', 0, 0, 'Two thirds or more are not copies of D', '33, 12, 4'],
  ['the neighbourhood as high (undecided)', 40, 64, 'cannot tell', '17, 5, 4']]) {
  const dir = mkdtempSync(join(tmpdir(), 'descendencia-analisi-'));
  try {
    writeRecs(dir, synthetic({ appScore, matched }));
    const text = execFileSync(process.execPath, [`${HERE}/analisi.mjs`, '--registres', dir], { cwd: ROOT, encoding: 'utf8' });
    const rdLine = text.split('\n').find((l) => l.includes('Rd, only the time rule')) ?? '';
    check(text.includes(expect) && rdLine.includes(` ${rd}; `), `${name}: the reading ("${expect}…") and Rd's counts (${rd})`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

out(`\n${failures ? `${failures} checks FAIL: the instrument is not used.` : 'All the checks pass.'}`);
process.exitCode = failures ? 1 : 0;
