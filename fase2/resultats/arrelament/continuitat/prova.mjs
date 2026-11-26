// A measure of continuity (exploratory; the note, README.md): the instrument's and the measure's checks, before anything is run on a branch.
//
//   node fase2/resultats/arrelament/continuitat/prova.mjs > fase2/resultats/arrelament/continuitat/prova-sortida.txt
//
// Test worlds only (random bytes), with the replicator of Phase 1 that the project's tests already use and a variant of it: no world of the
// project is touched and nothing is planted in any experiment.
//   1. The descent note's tracer against its slow reference, and the world against sim.mjs with the tracer open (imported as they are).
//   2. The measures, one case at a time, each with its known answer (both auditors' cases at audit 45).
//   3. The measures in test worlds: the replicator's half B, the variant, an independent planting, the far cells; the adversarial controls
//      on its real copies; a neighbour that receives its material in pieces through the tracer.
//   4. The validators fail closed, also with an impossible value that is the same in every record (AUD-234 = AU2-229); the comparator's
//      exit codes.
//   5. The analysis on synthetic records with a known answer.
import { writeFileSync, mkdtempSync, readFileSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execFileSync, spawnSync } from 'child_process';
import { gzipSync } from 'zlib';
import { PROGRAM_SIZE, OPCODES } from '../../../../fase1/bff.js';
import { makeRng, shannonEntropy } from '../../../../fase1/soup.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { Observer } from '../registre-copies/traca.mjs';
import { createWorld } from '../registre-copies/mon.mjs';
import { ROOT } from '../registre-copies/dades.mjs';
import { Tracer, RefTracer, buildMap, score as score28, WINDOWS } from '../descendencia/traca.mjs';
import { LIST, LIST_SHA256, SAMPLE } from './comu.mjs';
import { context, orderedRun, mapRun, donorRun, distinct, score, classOf, bridgeable, appearanceClass, commonRun, pairKey, shuffledPieces, piecesInForeign,
  repeatedPair, mutatedCopy, adversarial, adversarialFails, FAMILIES, RUN } from './mesura.mjs';
import { validate, pilotFacts } from './valida.mjs';
import { compare } from './compara.mjs';

const P = PROGRAM_SIZE;
const out = (s = '') => console.log(s);
let failures = 0;
const check = (ok, what) => { out(`   ${ok ? 'ok  ' : 'FAIL'} ${what}`); if (!ok) failures++; };
const HERE = 'fase2/resultats/arrelament/continuitat';
// The replicator of Phase 1 (the one of test/quimiques.mjs and the earlier notes' checks), and its variant: the same instructions and zeros,
// every other byte moved to the next value that is neither an instruction nor 0
const R1 = Uint8Array.from([140,221,0,221,20,164,126,32,105,126,78,173,241,242,207,220,199,45,213,101,52,91,155,79,44,60,2,125,93,71,65,217,65,5,71,141,93,141,15,5,65,217,15,71,93,125,2,60,44,79,155,91,52,101,213,45,0,0,62,82,0,77,77,0]);
const INSTR = new Set([...OPCODES].map((c) => c.charCodeAt(0)));
const R2 = R1.map((b) => { if (b === 0 || INSTR.has(b)) return b; let v = b; do { v = (v + 1) & 255; } while (v === 0 || INSTR.has(v) || v === b); return v; });
out(`A measure of continuity: the instrument's and the measure's checks (exploratory). The code: ${codeVersion()}, ${process.version}.`);

function testWorld({ W, H, seed, plant, mutation }) {
  const r = makeRng(seed, 'v2'), n = W * H;
  const soup = Uint8Array.from({ length: n * P }, () => (r() * 256) | 0);
  for (const [cells, prog] of plant) for (const c of cells) soup.set(prog, c * P);
  return { n, soup, world: createWorld({ soup, width: W, height: H, radius: 2, mutation, seed: seed + 1 }) };
}
const cellsAt = (W, pts) => pts.map(([x, y]) => y * W + x);

// 1. The tracer and the world
out('\n1. The descent note\'s tracer against its slow reference, and the world against sim.mjs with the tracer open');
{
  const W = 32, H = 32;
  const { n, soup, world } = testWorld({ W, H, seed: 3400000101, mutation: 0.002, plant: [[cellsAt(W, [[6, 6], [7, 6]]), R1], [cellsAt(W, [[24, 24], [25, 24]]), R2]] });
  const o = new Observer(n, [{ name: 'R1', bit: 1, programs: [R1] }, { name: 'R2', bit: 2, programs: [R2] }]); o.all(soup);
  const t = new Tracer(o, 0, 0, soup, n / 2), ref = new RefTracer(o, soup);
  o.tracers.push(t, ref);
  let equal = 0, bad = 0;
  for (let e = 0; e < 40; e++) {
    world.step([o]);
    let eq = t.next === ref.next;
    for (let i = 0; eq && i < soup.length; i++) if (t.orig[i] !== ref.orig[i] || t.flag[i] !== ref.flag[i]) eq = false;
    if (eq) equal++;
    bad += t.inconsistent(soup);
  }
  check(equal === 40 && bad === 0, `the origins and flags equal to the reference's at ${equal} of 40 epochs with mutations (${t.next - soup.length} new origins), the invariant at every epoch`);
}
{
  const dir = mkdtempSync(join(tmpdir(), 'continuitat-prova-')), cap = join(dir, 'capture.bin'), js = join(dir, 'sim.jsonl');
  try {
    const r = makeRng(3400000102, 'v2'), W = 32, H = 32, n = W * H;
    const soup = Uint8Array.from({ length: n * P }, () => (r() * 256) | 0);
    soup.set(R1, 100 * P); soup.set(R1, 900 * P);
    writeFileSync(cap, soup);
    execFileSync(process.execPath, ['sim.mjs', '--world', '32x32', '--seed', '3400000103', '--mixing', '0', '--from', cap, '--start', '0', '--epochs', '600', '--every', '100', '--json', js], { cwd: ROOT, stdio: ['ignore', 'ignore', 'pipe'] });
    const L = readFileSync(js, 'utf8').trim().split('\n').map((l) => JSON.parse(l)), M = L.filter((l) => l.type === 'measure'), END = L.at(-1);
    const world = createWorld({ soup, width: W, height: H, radius: L[0].radius, mutation: L[0].mutation, seed: 3400000103 });
    let o = null, ops = 0, runs = 0, okM = 0;
    for (let e = 1; e <= 600; e++) {
      if (e === 101) { o = new Observer(n, [{ name: 'R', bit: 1, programs: [R1] }]); o.all(soup); o.tracers.push(new Tracer(o, 0, 100, soup, n / 2)); }
      const s = world.step(o ? [o] : []); ops += s.ops; runs += s.runs;
      if (e % 100 === 0) { const m = M.find((x) => x.epoch === e); if (m && m.h0 === shannonEntropy(soup) && m.ops === ops && m.runs === runs) okM++; ops = 0; runs = 0; }
    }
    let hash = 0x811c9dc5;
    for (let i = 0; i < soup.length; i++) hash = Math.imul(hash ^ soup[i], 0x01000193);
    check(okM === 6 && M.length === 6 && (hash >>> 0).toString(16) === END.fingerprint, `the measures of sim.mjs, ${okM} of ${M.length} equal with the tracer open from epoch 101, and the final fingerprint (${(hash >>> 0).toString(16)} against ${END.fingerprint})`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

// 2. The measures, one case at a time
out('\n2. The measures, one case at a time (the donors: 40 carriers of a program X, origins 1000 + j; 40 of a program Y, 2000 + j; others as each case says)');
{
  const N = 400000 * P, own = (k) => 30000000 + k;   // the world's bytes (every origin below N); own mutations: N or more, held by no donor
  const progs = [];
  const prog = (f) => Int32Array.from({ length: P }, (_, j) => f(j));
  const X = prog((j) => 1000 + j), Y = prog((j) => 2000 + j);
  const Z = prog((j) => (j === 10 ? 29000000 : 3000 + j));   // a program with a mutation every carrier of it shares (frequent: in the map)
  // a chain of 8 programs: program k holds 10000·(k+1) + j, except that its byte 8k − 1 is program k − 1's (they share one origin)
  const chain = [...Array(8).keys()].map((k) => prog((j) => (k > 0 && j === 8 * k - 1 ? 10000 * k + j : 10000 * (k + 1) + j)));
  for (let i = 0; i < 40; i++) progs.push(X, Y);
  for (let i = 0; i < 10; i++) progs.push(Z, ...chain);
  const W = prog((j) => 4000 + j); progs.push(W);   // a rare variant: one donor of 171 (the map wants 2)
  const donors = new Int32Array(progs.length * P); progs.forEach((p, i) => donors.set(p, i * P));
  const ctx = context(donors, 0.01, N);
  const at = (cell) => ({ run: orderedRun(ctx, cell, 0).run, map: mapRun(ctx, cell, 0), donor: donorRun(ctx, cell, 0), d: distinct(ctx, cell, 0), s: score(ctx, cell, 0) });
  const cls = (cell) => { const a = at(cell); return classOf(a.run, a.d); };
  const foreign = (k) => prog((j) => 200000 + 64 * k + j);
  const mut = (src, pos) => { const c = src.slice(); pos.forEach((j, i) => { c[j] = own(i + 100 * pos.length); }); return c; };
  check(ctx.thr === 2 && ctx.nDonors === progs.length && ctx.nUniq === 12, `the context: ${ctx.nDonors} donors, ${ctx.nUniq} distinct, the map wants ${ctx.thr} carriers, ${ctx.pairs.size} pairs`);
  {
    const m28 = buildMap(donors, [...Array(progs.length).keys()], 0.01), cell = foreign(1); cell.set(X.subarray(0, 40), 10);
    const all = new Int32Array(P * 2); all.set(cell); all.set(Y, P);
    check(m28.pairs.size === ctx.pairs.size && score(ctx, cell, 0) === score28(all, 0, m28, 'adj') && score(ctx, Y, 0) === score28(all, 1, m28, 'adj'), `the map and entry 28's score, the descent note's exactly (${score(ctx, cell, 0)} and ${score(ctx, Y, 0)} of 63)`);
  }
  const cases = [
    ['an exact copy of X', X, 64, 'ordered'],
    ['a backward copy off the mirror by one (as the replicator of Phase 1: byte g at 62 − g)', prog((j) => 1000 + ((P + 62 - j) % P)), 63, 'ordered'],
    ['a copy of X moved by 5 bytes, the rest foreign', prog((j) => (j >= 5 ? 1000 + j - 5 : 200000 + j)), 59, 'ordered'],
    ['one own mutation (byte 30)', mut(X, [30]), 64, 'ordered'],
    ['two own mutations side by side (30, 31)', mut(X, [30, 31]), 64, 'ordered'],
    ['three side by side (30 to 32): the run stops there', mut(X, [30, 31, 32]), 31, 'ordered'],
    ['an own mutation on the last byte: the run does not end on it', mut(X, [63]), 63, 'ordered'],
    ['eight own mutations, scattered', mut(X, [5, 13, 21, 29, 37, 45, 53, 61]), 64, 'ordered'],
    ['a mutation the donors share (frequent, in the map): not passed over, it matches', Z, 64, 'ordered'],
    ['auditor 2\'s counterexample: X in blocks of 2 bytes, reordered (0 1 4 5 … 60 61, then 2 3 6 7 … 62 63)', prog((j) => 1000 + (j < 32 ? 4 * (j >> 1) + (j & 1) : 4 * ((j - 32) >> 1) + 2 + (j & 1))), 2, 'pieces'],
    ['a pair of the map repeated over the cell', repeatedPair(1000, 1001), 2, 'pieces'],
    ['a mosaic: X\'s first half, then Y\'s second half', prog((j) => (j < 32 ? 1000 + j : 2000 + j)), 32, 'ordered'],
    ['a mosaic of pieces of 8 bytes, X and Y in turn (each at its place)', prog((j) => ((j >> 3) % 2 ? 2000 + j : 1000 + j)), 8, 'pieces'],
    ['a chain of 8 programs joined by shared origins: every pair is a map pair, no donor holds more than 9 bytes of it', prog((j) => 10000 * ((j >> 3) + 1) + j), 9, 'pieces'],
    ['a fragment of 16 bytes of X in a foreign cell', (() => { const c = foreign(2); c.set(X.subarray(20, 36), 10); return c; })(), 16, 'ordered'],
    ['a fragment of 15 bytes', (() => { const c = foreign(3); c.set(X.subarray(20, 35), 10); return c; })(), 15, 'pieces'],
    ['a copy made before the window (the program\'s own origins, never copied in it): a false negative the measure cannot avoid', foreign(4), 0, 'none'],
    ['a rare variant (one donor of 171): a false negative the measure cannot avoid', W, 0, 'none'],
  ];
  for (const [what, cell, run, c] of cases) {
    const a = at(cell);
    check(a.run === run && cls(cell) === c, `${what}: the ordered run ${a.run} (expected ${run}), ${cls(cell)} (expected ${c}); auditor 1's measure ${a.map}, one donor ${a.donor}, distinct ${a.d}, entry 28's score ${a.s}`);
  }
  {
    const cell = X.slice(); const r = orderedRun(ctx, cell, 0);
    check(r.from === 0 && r.to === 63, `where the run is: bytes ${r.from} to ${r.to}`);
    const au2 = cases[9][1], rep = cases[10][1], chainCell = cases[13][1];
    check(score(ctx, au2, 0) === 32 && mapRun(ctx, rep, 0) === 64 && mapRun(ctx, chainCell, 0) === 64, `the counterexamples that entry 28's score and auditor 1's measure do not stop: the blocks score ${score(ctx, au2, 0)} of 63 (auditor 2's 32); the repeated pair and the chain, auditor 1's measure ${mapRun(ctx, rep, 0)} and ${mapRun(ctx, chainCell, 0)}`);
  }
  {
    const rng = makeRng(3400000201, 'v2'), far = foreign(5);
    const cells = [...Array(200).keys()].map(() => piecesInForeign(X, 0, far, 0, 2, 16, rng));
    const runs = cells.map((c) => orderedRun(ctx, c, 0).run);
    check(runs.every((r) => r === 2) && cells.every((c) => cls(c) === 'pieces'), `16 pieces of 2 bytes of X in a foreign cell, 200 ways: the ordered run ${Math.min(...runs)} to ${Math.max(...runs)}, all pieces`);
    for (const size of [1, 2, 4, 8, 16]) {
      const rr = [...Array(200).keys()].map(() => orderedRun(ctx, shuffledPieces(X, 0, size, rng), 0).run);
      const want = size === 1 ? 1 : size;
      check(rr.every((r) => r === (size === 1 ? 0 : want) || (size === 1 && r <= 1)), `X in pieces of ${size} byte${size > 1 ? 's' : ''}, separated, 200 ways: the ordered run ${Math.min(...rr)} to ${Math.max(...rr)} (no two pieces consecutive in X side by side: never more than a piece)`);
    }
    let next = 40000000; const fresh = () => next++;
    for (const k of [1, 4, 8]) {
      const rr = [...Array(200).keys()].map(() => orderedRun(ctx, mutatedCopy(X, 0, k, 1, 62, rng, fresh), 0).run);
      out(`      X with ${k} own mutations at random places, 200 ways: the ordered run ${Math.min(...rr)} to ${Math.max(...rr)}; ordered ${rr.filter((r) => r >= RUN).length} of 200 (descriptive)`);
    }
  }
  {
    const a = X.slice(), b = mut(X, [40]), c = foreign(6); c.set(X.subarray(0, 20), 0);
    check(commonRun(a, 0, b, 0) === 40 && commonRun(a, 0, c, 0) === 20 && commonRun(a, 0, prog((j) => 1000 + 63 - j), 0) === 64, `the common run of two cells: ${commonRun(a, 0, b, 0)} (a copy mutated at 40), ${commonRun(a, 0, c, 0)} (20 bytes of it), ${commonRun(a, 0, prog((j) => 1000 + 63 - j), 0)} (backwards)`);
    const s1 = foreign(7), s2 = foreign(8); s1.set(prog((j) => 500000 + j).subarray(0, 20), 30); s2.set(prog((j) => 500000 + j).subarray(0, 20), 5);
    check(commonRun(a, 0, b, 0, ctx) <= 1 && commonRun(s1, 0, s2, 0, ctx) === 20, `outside the dominant group's order: two copies of X share ${commonRun(a, 0, b, 0, ctx)} byte(s); two cells sharing 20 bytes of material outside the map, ${commonRun(s1, 0, s2, 0, ctx)}`);
  }
  {
    let threw = false; try { pairKey(67108864, 1); } catch { threw = true; }
    check(threw, 'an origin beyond the keys\' range fails, it is not folded into another');
    check(appearanceClass(['ordered', 'pieces']) === 'ordered' && appearanceClass(['ordered', 'pieces', 'none']) === 'pieces' && appearanceClass(['none', 'none']) === 'none' && appearanceClass(['pieces', 'none']) === 'pieces', 'the class of an appearance: ordered if half or more of its cells are; none if all are; else pieces');
  }
}

// 3. The measures in test worlds
out('\n3. The measures in test worlds: the replicator traced from its planting, its variant beside it, an independent planting far away');
for (const mutation of [0, 0.0005]) {
  const W = 128, H = 32;
  const { n, soup, world } = testWorld({ W, H, seed: 3400000301 + (mutation ? 1 : 0), mutation, plant: [
    [cellsAt(W, [[12, 10], [13, 10], [12, 11]]), R1], [cellsAt(W, [[12, 22], [13, 22], [12, 23]]), R2], [cellsAt(W, [[112, 16], [113, 16], [112, 17]]), R1]] });
  const o = new Observer(n, [{ name: 'R1', bit: 1, programs: [R1] }, { name: 'R2', bit: 2, programs: [R2] }]); o.all(soup);
  const t = new Tracer(o, 0, 0, soup, n / 2); o.tracers.push(t);
  for (let e = 0; e < 30; e++) world.step([o]);
  o.update(soup);
  const xOf = (c) => c % W, r1 = [], r1b = [], r2 = [];
  for (let c = 0; c < n; c++) { if ((o.carrier[c] & 1) && xOf(c) < 64) r1.push(c); else if (o.carrier[c] & 1) r1b.push(c); if ((o.carrier[c] & 2) && !(o.carrier[c] & 1)) r2.push(c); }
  const apart = ![...r1, ...r1b].some((c) => xOf(c) >= 56 && xOf(c) < 72);
  const sh = r1.slice(), rr = makeRng(3400000310, 'v2');
  for (let i = sh.length - 1; i > 0; i--) { const j = (rr() * (i + 1)) | 0; const x = sh[i]; sh[i] = sh[j]; sh[j] = x; }
  const A = sh.slice(0, Math.ceil(sh.length / 2)), Bh = sh.slice(Math.ceil(sh.length / 2));
  const far = []; for (let c = 0; c < n; c++) if (!o.carrier[c] && xOf(c) >= 56 && xOf(c) < 72) far.push(c);
  const flat = (cells) => { const a = new Int32Array(cells.length * P); cells.forEach((c, i) => a.set(t.orig.subarray(c * P, c * P + P), i * P)); return a; };
  const ctx = context(flat(A), 0.01, soup.length), hB = flat(Bh), fF = flat(far);
  const share = (cells, want) => { const a = flat(cells); let k = 0; for (let i = 0; i < cells.length; i++) if (classOf(orderedRun(ctx, a, i * P).run, distinct(ctx, a, i * P)) === want) k++; return cells.length ? k / cells.length : null; };
  out(`   mutation ${mutation}: carriers of the replicator ${r1.length} (half A ${A.length}, half B ${Bh.length}), of the independent planting ${r1b.length}, of the variant ${r2.length}; far cells ${far.length}`);
  check(apart && r1.length >= 20 && r1b.length >= 10 && r2.length >= 10 && far.length >= 100, 'the test world is usable: the plantings kept apart, enough carriers of each and far cells');
  check(share(Bh, 'ordered') >= 0.90, `sensitivity, the replicator's half B: ${share(Bh, 'ordered')?.toFixed(3)} ordered`);
  check(share(r2, 'ordered') <= 0.05, `the variant beside it (not a descendant; a cell can hold both): ${share(r2, 'ordered')?.toFixed(3)} ordered, ${share(r2, 'none')?.toFixed(3)} none`);
  check(share(r1b, 'none') >= 0.95, `the independent planting (the same program, another ancestry): ${share(r1b, 'none')?.toFixed(3)} none`);
  check(share(far, 'none') >= 0.95, `the far cells: ${share(far, 'none')?.toFixed(3)} none`);
  const adv = adversarial(ctx, hB, fF, 3400000320, t.next), fails = adversarialFails(adv);
  check(fails.length === 0, `the adversarial controls on its real copies, as each census will have them: ${FAMILIES.map((x) => `${x.key} ${adv[x.key].ordered}/${adv[x.key].cells}`).join(', ')}${fails.length ? ` (failing: ${fails.join('; ')})` : ''}`);
  // a neighbour that receives the replicator's material through the tracer: 16 pieces of 2 bytes from a carrier of half B, separated, into
  // a far cell; and, as the positive, one piece of 16 bytes
  const rngN = makeRng(3400000330 + (mutation ? 1 : 0), 'v2'), pair = new Uint32Array(2), targets = far.slice(0, 40);
  // the sources: carriers whose ordered run covers bytes 20 to 35, neither of which is an own mutation (so the piece's known answer is a run of 16)
  const srcs = Bh.filter((c) => { const r = orderedRun(ctx, t.orig, c * P); return r.from >= 0 && r.from <= 20 && r.to >= 35 && !bridgeable(ctx, t.orig[c * P + 20]) && !bridgeable(ctx, t.orig[c * P + 35]); });
  const results = { pieces: [], whole: [] };
  targets.forEach((tg, i) => {
    const src = srcs[i % srcs.length], kind = i < 20 ? 'pieces' : 'whole';
    pair[0] = src; pair[1] = tg;
    const ev = [];
    if (kind === 'pieces') {
      const order = [...Array(32).keys()], slots = [...Array(32).keys()];
      let ok = false;
      while (!ok) {
        for (let a = 31; a > 0; a--) { const b = (rngN() * (a + 1)) | 0; [order[a], order[b]] = [order[b], order[a]]; }
        ok = true; for (let a = 0; a + 1 < 16; a++) if (Math.abs(order[a] - order[a + 1]) === 1) ok = false;
      }
      for (let a = 0; a < 16; a++) for (let b = 0; b < 2; b++) ev.push(P + 4 * slots[a] + b, 2 * order[a] + b);   // every other slot of 2 bytes
    } else for (let b = 0; b < 16; b++) ev.push(P + 24 + b, 20 + b);
    t.gather(pair, 1);
    for (let k = 0; k < ev.length; k += 2) soup[tg * P + ev[k] - P] = soup[src * P + ev[k + 1]];
    t.apply(0, Int32Array.from(ev), ev.length / 2);
    t.scatter(pair, 1);
    const c = t.orig.subarray(tg * P, tg * P + P);
    results[kind].push(classOf(orderedRun(ctx, c, 0).run, distinct(ctx, c, 0)));
  });
  check(t.inconsistent(soup) === 0, 'the writes through the tracer keep its invariant');
  check(results.pieces.every((c) => c === 'pieces') && results.whole.every((c) => c === 'ordered'), `a far cell given 16 pieces of 2 bytes of a carrier through the tracer: ${results.pieces.filter((c) => c === 'pieces').length} of 20 pieces; given one piece of 16 bytes: ${results.whole.filter((c) => c === 'ordered').length} of 20 ordered`);
}

// 4. The validators and the comparator
out('\n4. The validators fail closed (also with a value impossible in the same way in every record), and the comparator\'s exit codes');
const readJsonl = (rel) => readFileSync(join(ROOT, rel), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const list = JSON.parse(readFileSync(join(ROOT, LIST), 'utf8'));
const pilot = pilotFacts(list, readJsonl);
const CODE = 'abcdef1234567';
// Synthetic records that pass: per census and window, D (if the list has it): 60 donors and 60 of half B holding one program (the origins of
// world cell 5), 120 far cells of their own; the appearances' cells as `kinds` says ('ordered', 'pieces', 'none'), matched cells and a ring.
function synthetic({ kinds = () => 'ordered', small = () => false } = {}) {
  const recs = new Map(), appIndex = new Map();   // one index per appearance, the same in both windows
  for (const br of list.branches) {
    const pr = pilot.get(br.id), N = pr.n * P, next = N + 100000;
    const progO = Array.from({ length: P }, (_, j) => 5 * P + j), foreignO = (k) => Array.from({ length: P }, (_, j) => (100 + k) * P + j);
    const L = [{ type: 'start', branch: br.id, world: br.world, soup: br.soup, code: CODE, node: 'v16.15.1', list: LIST_SHA256, seed: pr.seed, start: pr.start, end: pr.end, windows: WINDOWS, censuses: br.observers.map((o) => o.epoch) }];
    for (const o of br.observers) for (const w of WINDOWS) {
      const hasD = o.sets.some((s) => s.name === 'D'), tiny = small(br, o);
      let D = null;
      if (hasD) {
        const nB = tiny ? 5 : 60, nA = tiny ? 6 : 60, nF = 120;
        const pool = [...progO]; for (let k = 0; k < nF; k++) pool.push(...foreignO(k));
        D = { carriers: nA + nB, excluded: 0, A: nA, B: nB, farCells: nF, pool, halfA: Array(nA).fill(0), halfB: Array(Math.min(SAMPLE, nB)).fill(0), far: [...Array(nF).keys()].map((k) => k + 1) };
      }
      L.push({ type: 'census', epoch: o.epoch, window: w, windowStart: Math.max(pr.start, o.epoch - w), N, next, D });
      for (const y of o.appearances) {
        if (!appIndex.has(`${br.id}|${y.id}`)) appIndex.set(`${br.id}|${y.id}`, appIndex.size);
        const kind = kinds(br, o, y, appIndex.get(`${br.id}|${y.id}`)), orig = [];
        for (let i = 0; i < y.cells.length; i++) {
          if (kind === 'ordered') orig.push(...progO);
          else if (kind === 'pieces') { const p = Array.from({ length: P }, (_, j) => 2000 * P + j); for (let q = 0; q < 8; q++) { p[8 * q] = progO[8 * ((q * 3) % 8)]; p[8 * q + 1] = progO[8 * ((q * 3) % 8) + 1]; } orig.push(...p); }
          else orig.push(...foreignO(500 + i));
        }
        const mc = [...Array(5).keys()].map((k) => (y.cells[0] + 1000 + k) % pr.n).filter((c) => !y.cells.includes(c));
        const rc = [(y.cells[0] + 1) % pr.n, (y.cells[0] + pr.n - 1) % pr.n].filter((c) => !y.cells.includes(c));
        L.push({ type: 'appearance', epoch: o.epoch, window: w, id: y.id, cells: y.cells, orig, flags: Array(y.cells.length * P).fill(0),
          matched: hasD ? { distance: 1, cells: mc, orig: mc.flatMap((c, k) => foreignO(700 + k)) } : null, ring: { cells: rc, orig: rc.flatMap((c, k) => foreignO(800 + k)) } });
      }
    }
    L.push({ type: 'end', branch: br.id, measuresChecked: pr.measures, invariantChecks: pr.invariantChecks, fingerprint: pr.fingerprint, seconds: 1, rssMB: 100 });
    recs.set(br.id, L);
  }
  return recs;
}
const clone = (recs) => new Map([...recs].map(([k, L]) => [k, JSON.parse(JSON.stringify(L))]));
const files = list.branches.map((b) => `${b.id}.jsonl.gz`);
{
  const good = synthetic();
  const v0 = validate({ list, records: good, files, pilot, code: CODE });
  check(v0.problems.length === 0, `the synthetic records pass (${v0.problems.length ? v0.problems[0] : 'no problem'})`);
  check(validate({ list, records: good, files, pilot, code: CODE.slice(0, 7) }).problems.length === 0, 'a short form of the commit is the same commit');
  const firstD = (L) => L.find((x) => x.type === 'census' && x.D), firstA = (L) => L.find((x) => x.type === 'appearance' && x.matched);
  const all = (fn) => (recs) => { for (const L of recs.values()) fn(L); };
  const one = (fn) => (recs) => fn(recs.get(list.branches.find((b) => b.observers.some((o) => o.sets.some((s) => s.name === 'D'))).id));
  const bad = [
    ['the list\'s SHA-256 false in every record', all((L) => { L[0].list = 'f'.repeat(64); })],
    ['the commit false in every record', all((L) => { L[0].code = '1234567'; })],
    ['a commit with +canvis', all((L) => { L[0].code = `${CODE}+canvis`; })],
    ['no Node version', one((L) => { L[0].node = ''; })],
    ['two Node versions', one((L) => { L[0].node = 'v20.19.2'; })],
    ['the seed false', one((L) => { L[0].seed += 1; })],
    ['the final fingerprint false', one((L) => { L.at(-1).fingerprint = '0'; })],
    ['the measures checked, one fewer', one((L) => { L.at(-1).measuresChecked -= 1; })],
    ['the invariant checks, one more', one((L) => { L.at(-1).invariantChecks += 1; })],
    ['the window\'s start false', one((L) => { L[1].windowStart += 1; })],
    ['the next origin below the world\'s bytes', one((L) => { firstD(L).next = firstD(L).N - 1; })],
    ['an origin at or above the next one', one((L) => { const c = firstD(L); c.D.pool[3] = c.next; })],
    ['a negative origin', one((L) => { firstD(L).D.pool[0] = -1; })],
    ['an index outside the pool', one((L) => { const c = firstD(L); c.D.halfA[0] = c.D.pool.length / P; })],
    ['half A not of its size', one((L) => { firstD(L).D.halfA.pop(); })],
    ['half B\'s sample not of its size', one((L) => { firstD(L).D.halfB.push(0); })],
    ['the far sample larger than the far cells', one((L) => { firstD(L).D.farCells = 3; })],
    ['the carriers and the halves not adding up', one((L) => { firstD(L).D.carriers += 1; })],
    ['a sequence twice in the pool', one((L) => { const d = firstD(L).D; d.pool.push(...d.pool.slice(0, P)); d.far[0] = d.pool.length / P - 1; })],
    ['a sequence in the pool no sample uses', one((L) => { const d = firstD(L).D; d.pool.push(...Array.from({ length: P }, (_, j) => 3 * P + j)); })],
    ['D where the list has none', all((L) => { const c = L.find((x) => x.type === 'census' && !x.D); if (c) c.D = firstD(L) ? firstD(L).D : { carriers: 1 }; })],
    ['matched cells at distance 0', one((L) => { firstA(L).matched.distance = 0; })],
    ['no matched cell at distance 1', one((L) => { const m = firstA(L).matched; m.cells = []; m.orig = []; })],
    ['a matched cell that is the appearance\'s', one((L) => { const a = firstA(L); a.matched.cells[0] = a.cells[0]; })],
    ['more than 200 matched cells', one((L) => { const m = firstA(L).matched; m.cells = [...Array(201).keys()].map((k) => k + 50000); m.orig = Array(201 * P).fill(1); })],
    ['appearance origins of the wrong length', one((L) => { firstA(L).orig.pop(); })],
    ['an impossible flag', one((L) => { firstA(L).flags[0] = 4; })],
    ['a ring with the appearance\'s cell', one((L) => { const a = firstA(L); a.ring.cells[0] = a.cells[0]; })],
    ['a line missing', one((L) => { L.splice(2, 1); })],
    ['a line twice', one((L) => { L.splice(2, 0, JSON.parse(JSON.stringify(L[2]))); })],
    ['two lines out of order', one((L) => { const x = L[1]; L[1] = L[2]; L[2] = x; })],
    ['a field more', one((L) => { L[1].extra = 1; })],
  ];
  for (const [what, mutate] of bad) {
    const recs = clone(good); mutate(recs);
    const v = validate({ list, records: recs, files, pilot, code: CODE });
    check(v.problems.length > 0, `rejected: ${what}${v.problems.length ? ` (${v.problems[0].slice(0, 90)})` : ''}`);
  }
  check(validate({ list, records: good, files: [...files, 'extra.jsonl.gz'], pilot, code: CODE }).problems.length > 0, 'rejected: a file more in the folder');
  check(validate({ list, records: good, files, pilot, code: '1234567' }).problems.length > 0, 'rejected: records of another commit than the computation\'s');
  check(validate({ list, records: good, files, pilot, code: null }).problems.length > 0, 'rejected: no commit to check against');
  const dir = mkdtempSync(join(tmpdir(), 'continuitat-compara-'));
  try {
    const L = good.get(list.branches[0].id), a = join(dir, 'a.gz'), b = join(dir, 'b.gz'), c = join(dir, 'c.gz');
    const w = (f, x) => writeFileSync(f, gzipSync(Buffer.from(x.map((l) => JSON.stringify(l)).join('\n') + '\n')));
    const L2 = JSON.parse(JSON.stringify(L)); L2[0].code = 'fedcba9'; L2.at(-1).seconds = 99;
    const L3 = JSON.parse(JSON.stringify(L)); L3[1].next += 1;
    w(a, L); w(b, L2); w(c, L3);
    const run = (x, y) => spawnSync(process.execPath, [join(ROOT, HERE, 'compara.mjs'), x, y], { encoding: 'utf8' }).status;
    check(run(a, b) === 0 && run(a, c) === 1 && run(a, join(dir, 'missing.gz')) === 2 && compare(L, L2).same && !compare(L, L3).same, 'the comparator: 0 if the same but for the commit and the seconds, 1 if a line differs, 2 if a file cannot be read');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

// 5. The analysis on synthetic records with a known answer
out('\n5. The analysis on synthetic records with a known answer');
{
  const kindsOf = ['ordered', 'pieces', 'none'];
  const tinyCensus = (br, o) => br.id === list.branches.find((b) => b.observers.some((q) => q.sets.some((s) => s.name === 'D'))).id;
  const recs = synthetic({ kinds: (br, o, y, i) => kindsOf[i % 3], small: tinyCensus });
  const dir = mkdtempSync(join(tmpdir(), 'continuitat-analisi-'));
  try {
    for (const [id, L] of recs) writeFileSync(join(dir, `${id}.jsonl.gz`), gzipSync(Buffer.from(L.map((x) => JSON.stringify(x)).join('\n') + '\n')));
    const r = spawnSync(process.execPath, [join(ROOT, HERE, 'analisi.mjs'), '--code', CODE, '--registres', dir], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
    const text = r.stdout ?? '';
    check(r.status === 0 && text.includes('5. The reading'), `the analysis runs to the end on them (exit ${r.status}${r.stderr ? `; ${r.stderr.trim().split('\n')[0]}` : ''})`);
    let right = 0, wrong = [], ai = 0;
    for (const br of list.branches) for (const o of br.observers) for (const y of o.appearances) {
      const hasD = o.sets.some((s) => s.name === 'D'), want = !hasD ? (o.why === 'burst' ? 'no dominant group' : 'unclassifiable') : tinyCensus(br, o) ? 'unclassifiable' : kindsOf[ai % 3];
      ai++;
      const ln = text.split('\n').find((l) => l.startsWith(`   ${br.soup.padEnd(11)} ${String(br.world).padEnd(7)} ${String(o.epoch).padEnd(7)} ${y.id.padEnd(11)} `));
      const got = ln ? ln.slice(`   ${br.soup.padEnd(11)} ${String(br.world).padEnd(7)} ${String(o.epoch).padEnd(7)} ${y.id.padEnd(11)} `.length).split(' (')[0] : null;
      if (got === want) right++; else wrong.push(`${br.id} ${y.id}: ${got} (expected ${want})`);
    }
    check(wrong.length === 0, `every appearance's class, the one its synthetic cells were made for (a census with half B too small, unclassifiable): ${right} right${wrong.length ? `; ${wrong.slice(0, 3).join('; ')}` : ''}`);
    const r2 = spawnSync(process.execPath, [join(ROOT, HERE, 'analisi.mjs'), '--code', '1234567', '--registres', dir], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
    check(r2.status === 1 && (r2.stdout ?? '').includes('Nothing is analysed'), 'the analysis reads nothing from records of another commit');
    const r3 = spawnSync(process.execPath, [join(ROOT, HERE, 'analisi.mjs'), '--code', CODE, '--check', '--registres', dir], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
    check(r3.status === 0 && !/ordered|pieces|run \d/.test(r3.stdout ?? ''), '--check prints no class and no run');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

out(failures ? `\n${failures} checks fail.` : '\nAll the checks pass.');
process.exit(failures ? 1 : 0);
