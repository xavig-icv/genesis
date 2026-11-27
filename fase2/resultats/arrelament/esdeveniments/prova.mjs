// A record of copy events (exploratory; the note, README.md): the instrument's checks, before anything is run on a branch of the pilot.
//
//   node fase2/resultats/arrelament/esdeveniments/prova.mjs > fase2/resultats/arrelament/esdeveniments/prova-sortida.txt
//
// Test worlds only (random bytes), with the replicator of Phase 1 that the project's tests already use and a variant of it, planted by the
// test itself: no world of the project is touched and nothing is planted in any experiment.
//   1. The generator against fase1/soup.js; this world against the small record's (../registre-copies/mon.mjs, checked against sim.mjs);
//      following cells changes nothing; a checkpoint restored runs the same; every record keeps its own check.
//   2. The rules, one case at a time, each with its known answer (synthetic records).
//   3. The chains in test worlds whose genealogy is known by construction: a planting, two plantings of the same program, a planting before
//      the window, an earlier lineage, a loss and a re-acquisition, a repair in place, a variant replaced by the replicator.
//   4. The validator fails closed (valida.mjs), with impossible records.
//   5. The analysis, on synthetic records of every branch of the list, with a known answer.
//   6. Auditor 1's coverage, with known answers, on a synthetic record of the continuity note's format.
// It exits with 1 if any check fails.
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { gzipSync } from 'zlib';
import { spawnSync } from 'child_process';
import { PROGRAM_SIZE, OPCODES } from '../../../../fase1/bff.js';
import { makeRng } from '../../../../fase1/soup.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { createWorld as smallWorld } from '../registre-copies/mon.mjs';
import { CarrierIndex } from '../registre-copies/traca.mjs';
import { rngV2, createWorld, createReplayer, provenance, recordInconsistent, ARITH } from './mon.mjs';
import { createHeritability, createHistory, acquisition, chain, appearanceClass, fromPartner, byOrigin, birthKey } from './cadena.mjs';
import { validate, pilotFacts } from './valida.mjs';
import { LIST, LIST_SHA256 } from './comu.mjs';
import { ROOT } from '../registre-copies/dades.mjs';
import { coverageIndex, coverage, coverageRows } from './cobertura.mjs';

const P = PROGRAM_SIZE;
const out = (s = '') => console.log(s);
let failures = 0;
const check = (ok, what) => { out(`   ${ok ? 'ok  ' : 'FAIL'} ${what}`); if (!ok) failures++; };
// The replicator of Phase 1 (test/quimiques.mjs and the earlier notes' checks) and its variant: the same instructions and zeros, every other
// byte moved to the next value that is neither an instruction nor 0
const R1 = Uint8Array.from([140,221,0,221,20,164,126,32,105,126,78,173,241,242,207,220,199,45,213,101,52,91,155,79,44,60,2,125,93,71,65,217,65,5,71,141,93,141,15,5,65,217,15,71,93,125,2,60,44,79,155,91,52,101,213,45,0,0,62,82,0,77,77,0]);
const INSTR = new Set([...OPCODES].map((c) => c.charCodeAt(0)));
const R2 = R1.map((b) => { if (b === 0 || INSTR.has(b)) return b; let v = b; do { v = (v + 1) & 255; } while (v === 0 || INSTR.has(v) || v === b); return v; });
const her = createHeritability();
out(`A record of copy events: the instrument's checks (exploratory). The code: ${codeVersion()}, ${process.version}.`);

const testSoup = (W, H, seed) => { const r = makeRng(seed, 'v2'); return Uint8Array.from({ length: W * H * P }, () => (r() * 256) | 0); };
const cellsAt = (W, pts) => pts.map(([x, y]) => y * W + x);
const plantAt = (cells, prog) => cells.flatMap((c) => Array.from(prog, (v, j) => [c * P + j, v]));

// 1. The generator and the world
out('\n1. The generator and the world');
{
  let same = true;
  for (const seed of [1, 407046, 3500000001]) {
    const a = makeRng(seed, 'v2'), b = rngV2(seed);
    for (let i = 0; i < 100000; i++) if (a() !== b()) { same = false; break; }
  }
  check(same, 'the generator gives the numbers of fase1/soup.js (three seeds, 100,000 numbers each)');
  const g = rngV2(3500000002);
  for (let i = 0; i < 1000; i++) g();
  const st = g.get(), x1 = Array.from({ length: 100 }, () => g());
  g.set(st);
  const x2 = Array.from({ length: 100 }, () => g());
  check(x1.every((v, i) => v === x2[i]), 'its state, saved and set again, gives the same numbers');

  const W = 64, H = 64, seed = 3500000101, mutation = 0.002;
  const s0 = testSoup(W, H, seed);
  const sa = s0.slice(), sb = s0.slice(), sc = s0.slice();
  const wa = smallWorld({ soup: sa, width: W, height: H, radius: 2, mutation, seed: seed + 1 });
  const wb = createWorld({ soup: sb, width: W, height: H, radius: 2, mutation, seed: seed + 1 });
  const wc = createWorld({ soup: sc, width: W, height: H, radius: 2, mutation, seed: seed + 1 });
  const follow = new Uint8Array(W * H); for (let c = 0; c < W * H; c += 7) follow[c] = 1;
  let equal = true, opsEqual = true, inconsistent = 0, joined = true, records = 0;
  let prev = null;
  const cps = new Map([[0, wb.checkpoint()]]);
  for (let e = 1; e <= 300; e++) {
    const ra = wa.step(), rb = wb.step(), rc = wc.step(follow);
    if (ra.ops !== rb.ops || rb.ops !== rc.ops) opsEqual = false;
    for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i] || sb[i] !== sc[i]) { equal = false; break; }
    for (const [c, r] of rc.records) {
      records++;
      inconsistent += recordInconsistent(r);
      const p = prev?.get(c);
      if (p && p.I.some((v, j) => v !== r.A[j])) joined = false;
    }
    prev = rc.records;
    if (e % 50 === 0) cps.set(e, wb.checkpoint());
  }
  check(equal && opsEqual, 'this world and the small record\'s, 300 epochs of a 64 × 64 test world with mutations: the same soup at every epoch, the same operations; with a seventh of the cells followed, too');
  check(inconsistent === 0 && joined && records === 300 * Math.ceil(W * H / 7), `every record keeps its own check (${records} records), and a cell's state after an epoch is its state before the next`);
  const { replay, stats } = createReplayer(wb, cps);
  let threw = null;
  try { const r = replay([5, 100, 4000], 100, 150); check(r.get(100).size === 50, 'a segment run again from its checkpoint ends in the next checkpoint, byte for byte, and gives the records of its cells'); }
  catch (e) { threw = e.message; }
  check(threw === null, `the replay does not fail${threw ? ` (${threw})` : ''}`);
  const cpBad = new Map(cps); const bad = cpBad.get(150); cpBad.set(150, { ...bad, soup: bad.soup.slice() }); cpBad.get(150).soup[12345] ^= 1;
  let caught = false; try { createReplayer(wb, cpBad).replay([5], 100, 150); } catch { caught = true; }
  check(caught, 'a checkpoint with one bit changed: the replay fails');
  check(stats.replays === 1 && stats.epochs === 50, 'the replays are counted');
}

// 2. The rules, with synthetic records
out('\n2. The rules, one case at a time, with synthetic records');
// a history over fixed records: recs, a Map cell -> Map epoch -> record (A, M, I, mut, partner, half, Pm, prov)
const fakeHistory = (recs) => ({
  rec: (c, e) => { const r = recs.get(c)?.get(e); if (!r) throw new Error(`no record of ${c} at ${e}`); return r; },
  state(c, e, ph, w0) { return ph === 'I' && e === w0 ? this.rec(c, w0 + 1).A : ph === 'I' ? this.rec(c, e).I : this.rec(c, e).M; },
});
{
  const r = makeRng(3500000201, 'v2');
  const rand = () => Uint8Array.from({ length: P }, () => (r() * 256) | 0);
  let junk = rand(); while (her(junk)) junk = rand();
  check(her(R1) && her(R2) && !her(junk), 'the census test: the replicator and its variant are heritable, random bytes are not');
  // a byte of R1 whose change kills its heredity
  let kill = -1;
  for (let k = 0; k < P && kill < 0; k++) { const x = R1.slice(); x[k] = x[k] === 7 ? 9 : 7; if (!her(x)) kill = k; }
  check(kill >= 0, `the replicator has a byte whose change kills its heredity (${kill})`);
  const broken = R1.slice(); broken[kill] = broken[kill] === 7 ? 9 : 7;
  const fromP = (h) => Uint8Array.from({ length: P }, (_, j) => (h === 0 ? P + j : j));
  const own = (h) => Uint8Array.from({ length: P }, (_, j) => (h === 0 ? j : P + j));
  const rec = (A, M, I, x = {}) => ({ A, M, I, mut: [], partner: -1, half: -1, Pm: null, prov: null, ...x });
  const H = (cells) => fakeHistory(new Map(Object.entries(cells).map(([c, es]) => [Number(c), new Map(Object.entries(es).map(([e, v]) => [Number(e), v]))])));
  // a. a copy of a heritable partner over random bytes
  {
    const h = H({ 3: { 1: rec(junk, junk, R1, { partner: 9, half: 0, Pm: R1, prov: fromP(0) }) }, 9: { 1: rec(R1, R1, R1, { partner: 3, half: 1, Pm: junk, prov: own(1) }) } });
    const a = acquisition(h, her, 3, 1, 'interaction', 0);
    check(a.inherited && a.H === 64 && a.source.cell === 9 && a.source.e === 1 && a.source.ph === 'M', 'a copy of a heritable partner over random bytes: inherited from the partner, at its state before the interaction');
    const ch = chain(h, her, { cell: 3, e: 1, ph: 'I' }, 0, null);
    check(ch.end === 'older' && ch.hops.length === 1 && ch.hops[0].kind === 'inherited' && ch.hops[0].to === 9, 'its chain moves to the partner, heritable since the window\'s start: older');
  }
  // b. heredity made by the cell's own writes from material never heritable: a birth
  {
    const I = R1.slice();
    const h = H({ 3: { 1: rec(broken, broken, I, { partner: 9, half: 0, Pm: junk, prov: Uint8Array.from(own(0).map((t, j) => (j === kill ? t | ARITH : t))) }) }, 9: { 1: rec(junk, junk, junk, { partner: 3, half: 1, Pm: broken, prov: own(1) }) } });
    const ch = chain(h, her, { cell: 3, e: 1, ph: 'I' }, 0, null);
    check(ch.end === 'birth' && ch.epoch === 1 && ch.step === 'interaction' && ch.material.H === 0, 'a broken copy, never heritable, repaired by the cell\'s own \'+\': a birth at that interaction');
  }
  // c. a loss by a mutation and a repair: the material was heritable in the cell itself before the loss
  {
    const h = H({ 3: {
      1: rec(R1, broken, broken, { mut: [kill] }),
      2: rec(broken, broken, R1, { partner: 9, half: 0, Pm: junk, prov: Uint8Array.from(own(0).map((t, j) => (j === kill ? t | ARITH : t))) }) },
      9: { 1: rec(junk, junk, junk), 2: rec(junk, junk, junk, { partner: 3, half: 1, Pm: broken, prov: own(1) }) } });
    const ch = chain(h, her, { cell: 3, e: 2, ph: 'I' }, 0, null);
    check(ch.hops.length === 1 && ch.hops[0].material.H === 63 && ch.hops[0].to === 3 && ch.end === 'older', 'heredity lost by a mutation and repaired: inherited from the cell itself before the loss (63 bytes), then older');
  }
  // d. heredity brought by a partner that is not heritable, whose bytes came from a heritable cell one transfer before
  {
    const pI = R1.slice(); pI[kill] = broken[kill];
    const cM = junk.slice(); cM[kill] = R1[kill];
    const cProv = fromP(0); cProv[kill] = kill;
    const pProv = fromP(1); pProv[kill] = P + kill;
    const h = H({
      20: { 1: rec(R1, R1, R1, { partner: 9, half: 0, Pm: junk, prov: own(0) }), 2: rec(R1, R1, R1) },
      9: { 1: rec(junk, junk, pI, { partner: 20, half: 1, Pm: R1, prov: Uint8Array.from(Array.from({ length: P }, (_, j) => (j === kill ? P + kill : j))) }), 2: rec(pI, pI, pI, { partner: 3, half: 1, Pm: cM, prov: own(1) }) },
      3: { 1: rec(cM, cM, cM), 2: rec(cM, cM, R1, { partner: 9, half: 0, Pm: pI, prov: cProv }) } });
    const a = acquisition(h, her, 3, 2, 'interaction', 0);
    check(a.inherited && a.source.cell === 20 && a.H === 63, `bytes from a partner that is not heritable, which got them from a heritable cell one transfer before: inherited from that cell (${a.H} bytes)`);
    const a0 = acquisition(h, her, 3, 2, 'interaction', 0, 0);
    check(!a0.inherited && a0.H === 0 && a0.U === 63, 'the same with no transfer allowed: not inherited (63 bytes past the transfers allowed)');
  }
  // e. a replacement, and a partial overwrite that is not one
  {
    const h = H({ 3: { 1: rec(R2, R2, R1, { partner: 9, half: 0, Pm: R1, prov: fromP(0) }) }, 9: { 1: rec(R1, R1, R1, { partner: 3, half: 1, Pm: R2, prov: own(1) }) } });
    const ch = chain(h, her, { cell: 3, e: 1, ph: 'I' }, 0, null);
    check(ch.hops.length === 1 && ch.hops[0].kind === 'replacement' && ch.hops[0].to === 9, 'a heritable cell overwritten by a heritable partner: a replacement, the chain moves to the partner');
    const I = R2.slice(); for (let j = 0; j < 20; j++) I[j] = R1[j];
    const prov = own(0); for (let j = 0; j < 20; j++) prov[j] = P + j;
    const h2 = H({ 3: { 1: rec(R2, R2, I, { partner: 9, half: 0, Pm: R1, prov }) }, 9: { 1: rec(R1, R1, R1) } });
    const ch2 = chain(h2, her, { cell: 3, e: 1, ph: 'I' }, 0, null);
    check(her(I) && ch2.hops.length === 0 && ch2.end === 'older', 'a heritable cell with fewer than half of its bytes from a heritable partner: no replacement, the chain stays');
  }
  // f. a birth by a mutation, an earlier lineage
  {
    const h = H({ 3: { 1: rec(junk, R1, R1, { mut: Array.from({ length: P }, (_, j) => j) }) } });
    const ch = chain(h, her, { cell: 3, e: 1, ph: 'I' }, 0, null);
    check(ch.end === 'birth' && ch.step === 'mutation' && ch.epoch === 1, 'random bytes made heritable by mutations: a birth by mutation, at its epoch');
    const ix = new CarrierIndex(); ix.add([R1], 1);
    const h2 = H({ 3: { 1: rec(junk, junk, R1, { partner: 9, half: 0, Pm: R1, prov: fromP(0) }) }, 9: { 1: rec(R1, R1, R1) } });
    const ch2 = chain(h2, her, { cell: 3, e: 1, ph: 'I' }, 0, ix);
    check(ch2.end === 'earlier lineage' && ch2.cell === 9 && ch2.bits === 1, 'inherited from a carrier of a lineage detected before: an earlier lineage');
  }
  check(fromPartner({ prov: Uint8Array.from([...own(0).slice(0, 63), (P + 3) | ARITH]), half: 0 }).length === 1, 'a byte copied from the partner and then changed by \'+\' or \'-\' still counts as from the partner');
  {
    const b1 = { end: 'birth', cell: 5, epoch: 10, step: 'mutation', hops: [] }, b2 = { end: 'birth', cell: 6, epoch: 10, step: 'mutation', hops: [] };
    const set = new Set([birthKey(b1)]);
    check(byOrigin(b1, set).end === 'earlier lineage' && byOrigin(b1, set).byOrigin === true && byOrigin(b2, set).end === 'birth' && byOrigin({ end: 'older', hops: [] }, set).end === 'older', 'a birth that an earlier lineage\'s chains also reach is that lineage\'s origin (earlier lineage, by origin); another birth, or another end, stays');
  }
  check(appearanceClass(['birth', 'birth', 'earlier lineage']) === 'birth' && appearanceClass(['birth', 'older']) === 'mixed' && appearanceClass(['older']) === 'older', 'the class of an appearance: the end of more than half of its cells, else mixed');
}

// 3. The chains in test worlds
out('\n3. The chains in test worlds whose genealogy is known by construction');
function testChains({ W, H, seed, E, w0, inject, earlier = null, mutation = 0, heads: pickHeads = null, limit = 150 }) {
  const soup = testSoup(W, H, seed);
  const world = createWorld({ soup, width: W, height: H, radius: 2, mutation, seed: seed + 1, inject });
  const cps = new Map();
  if (w0 === 0) cps.set(0, world.checkpoint());
  for (let e = 1; e <= E; e++) { world.step(); if (e >= w0 && (e - w0) % 50 === 0) cps.set(e, world.checkpoint()); }
  const atE = soup.slice();
  const cand = pickHeads ? pickHeads(atE) : Array.from({ length: W * H }, (_, c) => c);
  // the heritable cells at E; at most `limit` of them, a fixed random sample (the world's seed), as the chains' heads
  let heads = cand.filter((c) => her(atE.subarray(c * P, c * P + P)));
  const all = heads.length;
  if (heads.length > limit) { const rr = makeRng(seed + 7, 'v2'), a = heads.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (rr() * (i + 1)) | 0; const x = a[i]; a[i] = a[j]; a[j] = x; } heads = a.slice(0, limit).sort((x, y) => x - y); }
  const { replay, stats } = createReplayer(world, cps);
  const h = createHistory({ replay, width: W, height: H, radius: 4, step: 50 });
  const chains = heads.map((c) => ({ appearanceCell: c, ...chain(h, her, { cell: c, e: E, ph: 'I' }, w0, earlier) }));
  return { chains, atE, stats, heads, all, replays: stats.replays };
}
const show = (chains, ok) => { const bad = chains.filter((ch) => !ok(ch)); for (const ch of bad.slice(0, 3)) out(`        e.g. cell ${ch.appearanceCell}: ${ch.end} at ${ch.cell}@${ch.epoch ?? '-'}; hops ${ch.hops.map((h) => `${h.kind}@${h.epoch}->${h.to}@${h.toEpoch}${h.toPhase}${h.material ? ` H${h.material.H}` : ''}`).join(', ') || 'none'}`); return bad.length === 0; };
const ends = (chains) => { const m = new Map(); for (const ch of chains) { const k = ch.end === 'birth' ? `birth ${ch.cell}@${ch.epoch} (${ch.step})` : ch.end; m.set(k, (m.get(k) ?? 0) + 1); } return [...m].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${v}`).join('; '); };
{
  // a. one planting inside the window
  const W = 64, H = 64, X = 64 * 20 + 20;
  const t = testChains({ W, H, seed: 3500000301, E: 200, w0: 0, inject: (e) => (e === 10 ? plantAt([X], R1) : null) });
  out(`   a. one planting of the replicator at cell ${X}, epoch 10; ${t.all} heritable cells at 200 (${t.heads.length} followed); ${t.replays} replays; ends: ${ends(t.chains)}`);
  check(t.heads.length >= 20 && t.chains.every((ch) => ch.end === 'birth' && ch.cell === X && ch.epoch === 10 && ch.step === 'mutation'), 'every heritable cell\'s chain ends at the planting (its cell, its epoch, a change in place)');
  check(t.chains.filter((ch) => ch.appearanceCell !== X).every((ch) => ch.hops.length >= 1 && ch.hops.every((h) => h.kind === 'inherited' || h.kind === 'replacement')), 'every other cell reaches it through inherited copies (or replacements)');
}
{
  // b. two plantings of the same program, far apart, at the same epoch: two origins, each on its side
  const W = 384, H = 32, X1 = 16 * W + 48, X2 = 16 * W + 336;
  const t = testChains({ W, H, seed: 3500000302, E: 150, w0: 0, inject: (e) => (e === 10 ? plantAt([X1, X2], R1) : null),
    heads: (s) => { const ix = new CarrierIndex(); ix.add([R1], 1); return Array.from({ length: W * H }, (_, c) => c).filter((c) => ix.bits(s, c * P)); } });
  const side = (c) => (c % W < W / 2 ? X1 : X2);
  out(`   b. the same program planted twice, at cells ${X1} and ${X2}, epoch 10; ${t.all} heritable carriers at 150, ${t.heads.length} followed; ends: ${ends(t.chains)}`);
  const leftN = t.heads.filter((c) => c % W < W / 2).length;
  const ixb = new CarrierIndex(); ixb.add([R1], 1);
  const apart = !Array.from({ length: W * H }, (_, c) => c).some((c) => c % W >= 160 && c % W < 224 && ixb.bits(t.atE, c * P));
  check(apart, 'the test world is usable: no carrier of the replicator in the middle band (columns 160 to 223) at 150');
  check(leftN >= 10 && t.heads.length - leftN >= 10 && t.chains.every((ch) => ch.end === 'birth' && ch.cell === side(ch.appearanceCell) && ch.epoch === 10), 'two origins: every chain ends at the planting on its own side, never at the other (equal programs, two ancestries)');
}
{
  // c. a planting before the window
  const W = 64, H = 64, X = 64 * 30 + 30;
  const t = testChains({ W, H, seed: 3500000303, E: 200, w0: 50, inject: (e) => (e === 5 ? plantAt([X], R1) : null) });
  out(`   c. a planting at epoch 5, the window from 50; ${t.all} heritable cells at 200, ${t.heads.length} followed; ends: ${ends(t.chains)}`);
  check(t.heads.length >= 20 && t.chains.every((ch) => ch.end === 'older'), 'every chain ends older than the window (a copy before the window: not a birth)');
}
{
  // d. an earlier lineage: the replicator's program is a lineage detected before
  const W = 64, H = 64, X = 64 * 20 + 40;
  const ix = new CarrierIndex(); ix.add([R1], 1);
  const t = testChains({ W, H, seed: 3500000304, E: 200, w0: 0, earlier: ix, inject: (e) => (e === 10 ? plantAt([X], R1) : null) });
  out(`   d. the replicator, a lineage detected before; ${t.all} heritable cells at 200, ${t.heads.length} followed; ends: ${ends(t.chains)}`);
  const okd = (ch) => (ch.appearanceCell === X && ch.end === 'birth') || (ch.end === 'earlier lineage' && ch.hops.length >= 1);
  check(t.heads.length >= 20 && show(t.chains, okd), 'every chain that inherits ends as an earlier lineage (where a holder still carries one of its windows: its heritable variants may not)');
}
{
  // e. a loss and a re-acquisition: at epoch 120 every carrier on the left third is wiped; those heritable again at 200 re-acquired it later
  const W = 96, H = 64, X = 32 * W + 48;
  const ix = new CarrierIndex(); ix.add([R1], 1);
  const pre = testSoup(W, H, 3500000305);
  const wiped = new Set();
  const inject = (e) => {
    if (e === 10) return plantAt([X], R1);
    if (e !== 120) return null;
    const out2 = [];
    for (let c = 0; c < W * H; c++) if (c % W < 56 && c % W >= 40) { wiped.add(c); for (let j = 0; j < P; j++) out2.push([c * P + j, pre[((c * 7919) % (W * H)) * P + j]]); }
    return out2;
  };
  const t = testChains({ W, H, seed: 3500000305, E: 200, w0: 0, inject, heads: (s) => Array.from({ length: W * H }, (_, c) => c).filter((c) => c % W >= 40 && c % W < 56 && ix.bits(s, c * P)) });
  const again = t.chains.filter((ch) => wiped.has(ch.appearanceCell));
  out(`   e. the planting at ${X}; at 120 the cells of columns 40 to 55 replaced by random bytes; ${t.all} of them heritable again at 200, ${t.heads.length} followed; ends: ${ends(t.chains)}`);
  const oke = (ch) => ch.hops.length >= 1 && (ch.hops[0].epoch > 120 || (ch.hops[0].epoch === 120 && ch.hops[0].step === 'interaction'));
  check(again.length >= 5 && show(again, oke), 'every wiped cell heritable again acquired it after the wipe (its first hop, in the interaction of epoch 120 or later), not at the first planting');
  check(t.chains.every((ch) => ch.end === 'birth' && ch.cell === X && ch.epoch === 10), 'and every chain still ends at the planting');
}
{
  // f. a repair in place: a broken replicator planted at 10 and repaired at 30: the birth is the repair
  const W = 64, H = 64, Z = 64 * 32 + 32;
  let kill = -1;
  for (let k = 0; k < P && kill < 0; k++) { const x = R1.slice(); x[k] = x[k] === 7 ? 9 : 7; if (!her(x)) kill = k; }
  const broken = R1.slice(); broken[kill] = broken[kill] === 7 ? 9 : 7;
  const t = testChains({ W, H, seed: 3500000306, E: 200, w0: 0, inject: (e) => (e === 10 ? plantAt([Z], broken) : e === 30 ? [[Z * P + kill, R1[kill]]] : null) });
  out(`   f. a broken replicator planted at ${Z}, epoch 10, repaired at 30; ${t.all} heritable cells at 200, ${t.heads.length} followed; ends: ${ends(t.chains)}`);
  check(t.heads.length >= 20 && t.chains.every((ch) => ch.end === 'birth' && ch.cell === Z && ch.epoch === 30), 'every chain ends at the repair (epoch 30), not at the planting of a program that was not heritable');
}
{
  // g. the variant replaced by the replicator: two plantings side by side; each heritable carrier ends at the planting of what it carries
  const W = 64, H = 64, X = 64 * 32 + 24, Y = 64 * 32 + 40;
  const ix = new CarrierIndex(); ix.add([R1], 1); ix.add([R2], 2);
  const t = testChains({ W, H, seed: 3500000307, E: 200, w0: 0, inject: (e) => (e === 10 ? [...plantAt([X], R2), ...plantAt([Y], R1)] : null),
    heads: (s) => Array.from({ length: W * H }, (_, c) => c).filter((c) => { const b = ix.bits(s, c * P); return b === 1 || b === 2; }) });
  const bitsAt = (c) => ix.bits(t.atE, c * P);
  const r1 = t.chains.filter((ch) => bitsAt(ch.appearanceCell) === 1), r2 = t.chains.filter((ch) => bitsAt(ch.appearanceCell) === 2);
  const replaced = t.chains.filter((ch) => ch.hops.some((h) => h.kind === 'replacement')).length;
  out(`   g. the variant at ${X} and the replicator at ${Y}, epoch 10; heritable carriers at 200: ${r1.length} of the replicator, ${r2.length} of the variant; ${replaced} chains with a replacement; ends: ${ends(t.chains)}`);
  check(r1.length >= 10 && r1.every((ch) => ch.end === 'birth' && ch.cell === Y), 'every carrier of the replicator ends at its planting');
  check(r2.every((ch) => ch.end === 'birth' && ch.cell === X), 'every carrier of the variant ends at its planting');
}

{
  // i. the origin rule: the replicator planted at 10; a lineage "detected" at 100 (4 of its heritable cells, followed from there) and an
  //    appearance at 200 (heritable cells, with no earlier lineage's windows): the appearance's births are the earlier lineage's origin
  const W = 64, H = 64, X = 64 * 40 + 20, seed = 3500000309;
  const soup = testSoup(W, H, seed);
  const world = createWorld({ soup, width: W, height: H, radius: 2, mutation: 0, seed: seed + 1, inject: (e) => (e === 10 ? plantAt([X], R1) : null) });
  const cps = new Map([[0, world.checkpoint()]]);
  let at100 = null;
  for (let e = 1; e <= 200; e++) { world.step(); if (e % 50 === 0) cps.set(e, world.checkpoint()); if (e === 100) at100 = soup.slice(); }
  const pickHer = (snap, k, sd) => { const all = Array.from({ length: W * H }, (_, c) => c).filter((c) => her(snap.subarray(c * P, c * P + P))); const rr = makeRng(sd, 'v2'); const a = all.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (rr() * (i + 1)) | 0; const x = a[i]; a[i] = a[j]; a[j] = x; } return a.slice(0, k).sort((x, y) => x - y); };
  const refs = pickHer(at100, 4, seed + 11), apps = pickHer(soup, 40, seed + 12);
  const { replay } = createReplayer(world, cps);
  const hh = createHistory({ replay, width: W, height: H, radius: 4, step: 50 });
  const refEnds = refs.map((c) => chain(hh, her, { cell: c, e: 100, ph: 'I' }, 0, null));
  const earlierBirths = new Set(refEnds.filter((ch) => ch.end === 'birth').map(birthKey));
  const appEnds = apps.map((c) => byOrigin(chain(hh, her, { cell: c, e: 200, ph: 'I' }, 0, null), earlierBirths));
  out(`   i. the planting at ${X}, epoch 10; a lineage detected at 100 (${refs.length} cells: ${refEnds.map((ch) => ch.end === 'birth' ? `birth ${birthKey(ch)}` : ch.end).join(', ')}); an appearance at 200 (${apps.length} cells)`);
  check(refEnds.length === 4 && refEnds.every((ch) => ch.end === 'birth' && ch.cell === X && ch.epoch === 10), 'the earlier lineage\'s chains end at the planting');
  check(apps.length >= 20 && appEnds.every((ch) => ch.end === 'earlier lineage' && ch.byOrigin), 'every chain of the appearance ends at that birth: the earlier lineage\'s origin, not a new one');
}

{
  // h. with mutations (0.0005 per byte and epoch, about twice the pilot's): one planting; how many chains end elsewhere
  const W = 64, H = 64, X = 64 * 20 + 44;
  const t = testChains({ W, H, seed: 3500000308, E: 200, w0: 0, mutation: 0.0005, inject: (e) => (e === 10 ? plantAt([X], R1) : null) });
  const atX = t.chains.filter((ch) => ch.end === 'birth' && ch.cell === X && ch.epoch === 10).length;
  out(`   h. with mutations (0.0005): one planting at ${X}, epoch 10; ${t.all} heritable cells at 200, ${t.heads.length} followed; ends: ${ends(t.chains)}`);
  check(t.heads.length >= 20 && atX >= 0.95 * t.heads.length, `with mutations, ${atX} of ${t.heads.length} chains end at the planting (95 % or more)`);
}

// 4. The validator fails closed
out('\n4. The validator fails closed (valida.mjs), with a synthetic record and impossible variants of it');
{
  const hx = (fill, first) => Array.from({ length: P }, (_, j) => (j === 0 ? first : fill)).map((v) => v.toString(16).padStart(2, '0')).join('');
  const NOT = hx(7, 0), YES = hx(7, 1);
  const herFake = (b) => b[0] === 1;   // a stand-in for the census's test: heritable if the first byte is 1
  const list = { branches: [{ id: 'b1', world: '9001', soup: 'continue', start: 8000, end: 9300, record: 'x', censuses: [{ epoch: 9250, w0: 8000, appearances: [{ id: '9250:1', cells: [100, 200], timeRule: true }],
    references: [{ id: '9000:1', first: 9000, rooted: true, cells: [400] }] }] }] };
  const pilot = new Map([['b1', { seed: 409001, measures: 13, fingerprint: 'abcd1234' }]]);
  const code = '0123abcd';
  const birth = (cell) => ({ end: 'birth', cell, epoch: 9100, step: 'interaction', material: { H: 3, U: 2, N: 59, mutation: 0, sources: 1 }, states: { before: NOT, after: YES, partner: 7, partnerBefore: NOT }, hops: [] });
  const inherited = () => ({ end: 'earlier lineage', bits: 1, cell: 300, epoch: 9000, hops: [{ cell: 200, epoch: 9050, kind: 'inherited', step: 'interaction', material: { H: 40, U: 0, N: 24, mutation: 0, sources: 1, given: 40 }, to: 300, toEpoch: 9000, toPhase: 'I', states: { before: NOT, after: YES, partner: 300, partnerBefore: YES } }] });
  const wantedCps = Math.floor((9250 - 8000) / 50) + 1;
  const make = () => [
    { type: 'start', branch: 'b1', world: '9001', soup: 'continue', code, node: 'v16', list: LIST_SHA256, seed: 409001, start: 8000, end: 9300,
      rules: { K: 2, kSensitivity: 4, theta: 32, replace: 32, maxHops: 64, step: 50, followRadius: 4 }, censuses: [{ epoch: 9250, w0: 8000 }] },
    { type: 'appearance', id: '9250:1', census: 9250, w0: 8000, timeRule: true, cells: [{ cell: 100, chains: { main: birth(100), sensitivity: birth(100) } }, { cell: 200, chains: { main: inherited(), sensitivity: inherited() } }] },
    { type: 'reference', id: '9000:1', census: 9250, w0: 8000, first: 9000, rooted: true, cells: [{ cell: 400, chains: { main: { ...birth(400), epoch: 8900 }, sensitivity: { ...birth(400), epoch: 8900 } } }] },
    { type: 'end', branch: 'b1', measuresChecked: 13, fingerprint: 'abcd1234', checkpoints: wantedCps, replays: 5, heritabilityTests: 9 },
  ];
  const run = (L, extra = {}) => validate({ list, records: new Map([['b1', L]]), files: ['b1.jsonl.gz'], pilot, code, her: herFake, ...extra }).problems;
  check(run(make()).length === 0, `the synthetic record is valid (${run(make()).join('; ') || 'no problems'})`);
  const cases = [
    ['a record of another commit', (L) => { L[0].code = 'ffffffff'; }],
    ['the computation\'s commit with changes', (L) => {}, { code: '0123abcd+canvis' }],
    ['another list', (L) => { L[0].list = 'x'.repeat(64); }],
    ['another seed', (L) => { L[0].seed = 1; }],
    ['other rules (K)', (L) => { L[0].rules.K = 3; }],
    ['a census that is not the list\'s', (L) => { L[0].censuses[0].w0 = 8050; }],
    ['one measure less than the pilot\'s', (L) => { L.at(-1).measuresChecked = 12; }],
    ['another fingerprint', (L) => { L.at(-1).fingerprint = 'abcd1235'; }],
    ['a checkpoint missing', (L) => { L.at(-1).checkpoints -= 1; }],
    ['no replay', (L) => { L.at(-1).replays = 0; }],
    ['a fail line', (L) => { L.splice(1, 0, { type: 'fail', why: 'x' }); }],
    ['an appearance line missing', (L) => { L.splice(1, 1); }],
    ['a cell that is not the list\'s', (L) => { L[1].cells[0].cell = 101; }],
    ['the sensitivity\'s chain missing', (L) => { delete L[1].cells[0].chains.sensitivity; }],
    ['an end that is not one of the four', (L) => { L[1].cells[0].chains.main.end = 'copy'; }],
    ['a birth with half its bytes from heritable holders', (L) => { L[1].cells[0].chains.main.material.H = 32; L[1].cells[0].chains.main.material.N = 30; }],
    ['a birth whose counts do not add up to 64', (L) => { L[1].cells[0].chains.main.material.N = 58; }],
    ['a birth with no count of its bytes', (L) => { delete L[1].cells[0].chains.main.material; }],
    ['a birth after the census', (L) => { L[1].cells[0].chains.main.epoch = 9300; }],
    ['a birth at the window\'s start', (L) => { L[1].cells[0].chains.main.epoch = 8000; }],
    ['a birth not where the chain is', (L) => { L[1].cells[0].chains.main.cell = 101; }],
    ['a birth whose state before is heritable', (L) => { L[1].cells[0].chains.main.states.before = YES; }],
    ['a birth whose state after is not heritable', (L) => { L[1].cells[0].chains.main.states.after = NOT; }],
    ['a birth with no states', (L) => { delete L[1].cells[0].chains.main.states; }],
    ['an inheritance with fewer than half its bytes from heritable holders', (L) => { const m = L[1].cells[1].chains.main.hops[0].material; m.H = 31; m.N = 33; m.given = 31; }],
    ['a hop that does not start at the appearance\'s cell', (L) => { L[1].cells[1].chains.main.hops[0].cell = 201; }],
    ['a hop later than the census', (L) => { L[1].cells[1].chains.main.hops[0].epoch = 9260; }],
    ['a holder\'s point after its step', (L) => { L[1].cells[1].chains.main.hops[0].toEpoch = 9060; }],
    ['an earlier lineage not at the last hop\'s cell', (L) => { L[1].cells[1].chains.main.cell = 301; }],
    ['an earlier lineage with no carrier bits', (L) => { L[1].cells[1].chains.main.bits = 0; }],
    ['an earlier lineage with no hop', (L) => { L[1].cells[1].chains.main.hops = []; L[1].cells[1].chains.main.cell = 200; }],
    ['a replacement with fewer than half the cell', (L) => { L[1].cells[1].chains.main.hops[0] = { cell: 200, epoch: 9050, kind: 'replacement', F: 31, to: 300, toEpoch: 9050, toPhase: 'M' }; }],
    ['an acquisition hop whose state before is heritable', (L) => { L[1].cells[1].chains.main.hops[0].states.before = YES; }],
    ['the reference lineage\'s line missing', (L) => { L.splice(2, 1); }],
    ['a reference lineage first detected after the census', (L) => { L[2].first = 9260; }],
    ['a reference lineage\'s birth after its first census', (L) => { L[2].cells[0].chains.main.epoch = 9010; }],
    ['a reference lineage that is not the list\'s', (L) => { L[2].id = '9000:2'; }],
    ['an unresolved end of no kind', (L) => { L[1].cells[0].chains.main = { end: 'unresolved', cell: 100, hops: [] }; }],
    ['an unresolved end by hops with too few hops', (L) => { L[1].cells[0].chains.main = { end: 'unresolved', why: 'hops', cell: 100, hops: [] }; }],
  ];
  let rejected = 0;
  for (const [what, mut, extra] of cases) {
    const L = make(); mut(L);
    const p = run(L, extra);
    if (p.length) rejected++; else out(`   FAIL accepted: ${what}`);
  }
  check(rejected === cases.length, `${rejected} of ${cases.length} impossible records rejected`);
  check(validate({ list, records: new Map(), files: [], pilot, code }).problems.length > 0, 'no record: rejected');
  check(validate({ list, records: new Map([['b1', make()]]), files: ['b1.jsonl.gz', 'b2.jsonl.gz'], pilot, code }).problems.length > 0, 'a file more in the folder: rejected');
}

// 5. The analysis, on synthetic records of every branch of the list, with a known answer
out('\n5. The analysis (analisi.mjs), on synthetic records of every branch of the list, with a known answer');
{
  const list = JSON.parse(readFileSync(join(ROOT, LIST), 'utf8'));
  const readJsonl = (rel) => readFileSync(join(ROOT, rel), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const pilot = pilotFacts(list, readJsonl);
  const r = makeRng(3500000501, 'v2');
  let junk = Uint8Array.from({ length: P }, () => (r() * 256) | 0); while (her(junk)) junk = Uint8Array.from({ length: P }, () => (r() * 256) | 0);
  const NOT = Buffer.from(junk).toString('hex'), YES = Buffer.from(R1).toString('hex');
  const code = '0123abcd';
  // the known answer: in the aged soup every cell's chain ends at a birth of its own, one epoch after its window's start; in the shuffled
  // soup, older; in the fresh soup, an earlier lineage (one inherited hop); every reference lineage's chain inherits from the first cell of
  // its census's first appearance and ends at that cell's birth (so, in the aged soup, that cell becomes an earlier lineage, by origin)
  const birth = (cell, epoch) => ({ end: 'birth', cell, epoch, step: 'interaction', material: { H: 0, U: 10, N: 54, mutation: 0, sources: 0 }, states: { before: NOT, after: YES, partner: cell + 1, partnerBefore: NOT }, hops: [] });
  const older = (cell) => ({ end: 'older', cell, hops: [] });
  const inherited = (cell, epoch) => ({ end: 'earlier lineage', bits: 1, cell: cell + 1, epoch: epoch - 1, hops: [{ cell, epoch, kind: 'inherited', step: 'interaction', material: { H: 64, U: 0, N: 0, mutation: 0, sources: 1, given: 64 }, to: cell + 1, toEpoch: epoch - 1, toPhase: 'I', states: { before: NOT, after: YES, partner: cell + 1, partnerBefore: YES } }] });
  const dir = mkdtempSync(join(tmpdir(), 'esdeveniments-prova-'));
  let expectedByOrigin = 0;
  for (const b of list.branches) {
    const S = { type: 'start', branch: b.id, world: b.world, soup: b.soup, code, node: process.version, list: LIST_SHA256, seed: pilot.get(b.id).seed, start: b.start, end: b.end,
      rules: { K: 2, kSensitivity: 4, theta: 32, replace: 32, maxHops: 64, step: 50, followRadius: 4 }, censuses: b.censuses.map((c) => ({ epoch: c.epoch, w0: c.w0 })) };
    const L = [S];
    let cps = new Set();
    for (const c of b.censuses) {
      for (let e = c.w0; e <= c.epoch; e += 50) cps.add(e);
      const end = (cell) => (b.soup === 'continue' ? birth(cell, c.w0 + 1) : b.soup === 'shuffle-all' ? older(cell) : inherited(cell, c.epoch - 100));
      for (const y of c.appearances) L.push({ type: 'appearance', id: y.id, census: c.epoch, w0: c.w0, timeRule: y.timeRule, cells: y.cells.map((cell) => ({ cell, chains: { main: end(cell), sensitivity: end(cell) } })) });
      const first = c.appearances[0].cells[0];
      for (const x of c.references) {
        const via = (cell) => ({ ...birth(first, c.w0 + 1), hops: [{ cell, epoch: x.first, kind: 'inherited', step: 'interaction', material: { H: 64, U: 0, N: 0, mutation: 0, sources: 1, given: 64 }, to: first, toEpoch: c.w0 + 1, toPhase: 'I', states: { before: NOT, after: YES, partner: first, partnerBefore: YES } }] });
        L.push({ type: 'reference', id: x.id, census: c.epoch, w0: c.w0, first: x.first, rooted: x.rooted, cells: x.cells.map((cell) => ({ cell, chains: x.first === c.w0 ? { main: older(cell), sensitivity: older(cell) } : { main: via(cell), sensitivity: via(cell) } })) });
      }
      if (b.soup === 'continue' && c.references.some((x) => x.first > c.w0)) expectedByOrigin++;
    }
    L.push({ type: 'end', branch: b.id, measuresChecked: pilot.get(b.id).measures, fingerprint: pilot.get(b.id).fingerprint, checkpoints: cps.size, replays: 1, heritabilityTests: 1 });
    writeFileSync(join(dir, `${b.id}.jsonl.gz`), gzipSync(Buffer.from(L.map((x) => JSON.stringify(x)).join('\n') + '\n')));
  }
  const res = spawnSync(process.execPath, [join(ROOT, 'fase2/resultats/arrelament/esdeveniments/analisi.mjs'), '--code', code, '--registres', dir], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const txt = res.stdout;
  const row = (soup) => (txt.split('\n').find((l) => l.trim().startsWith(soup)) ?? '').trim().split(/\s+/).slice(1).map(Number);
  const aged = row('aged'), shuffled = row('shuffled'), fresh = row('fresh');
  out(`   the classes' table: aged ${aged.join(' ')}; shuffled ${shuffled.join(' ')}; fresh ${fresh.join(' ')} (exit code ${res.status})`);
  const nByOrigin = Number((txt.match(/Chains ending at the birth of a lineage detected before: (\d+)/) ?? [])[1]);
  check(res.status === 0 && aged[0] === 33 && shuffled[0] === 14 && fresh[0] === 8, 'the analysis runs, and counts the 33, 14 and 8 failed appearances');
  check(shuffled[3] === 14 && fresh[2] === 8 && aged[1] + aged[2] + aged[5] === 33, 'the shuffled soup\'s are older, the fresh soup\'s earlier lineages, the aged soup\'s births, but those that reach a reference lineage\'s birth');
  check(nByOrigin >= expectedByOrigin && nByOrigin > 0, `the origin rule applies (${nByOrigin} chains end at an earlier lineage's birth)`);
  check(/5\. The reading/.test(txt) && /The aged soup's time-rule removals: 16/.test(txt), 'the reading is printed, with the aged soup\'s 16 time-rule removals');
  const bad = spawnSync(process.execPath, [join(ROOT, 'fase2/resultats/arrelament/esdeveniments/analisi.mjs'), '--code', 'ffffffff', '--registres', dir], { encoding: 'utf8' });
  check(bad.status === 1 && /Nothing is analysed/.test(bad.stdout), 'with another commit, the analysis reads nothing (exit code 1)');
  rmSync(dir, { recursive: true, force: true });
}

// 6. Auditor 1's coverage (cobertura.mjs), with known answers, on a synthetic record of the continuity note's format
out('\n6. Auditor 1\'s coverage (cobertura.mjs), with known answers, on a synthetic record of the continuity note\'s format');
{
  // origins: the donors are 40 copies of one sequence of 64 distinct origins, with 8 positions each replaced by an origin of its own
  const base = Int32Array.from({ length: P }, (_, j) => 1000 + j);
  const r = makeRng(3500000601, 'v2');
  let next = 5000;
  const donors = [];
  for (let k = 0; k < 40; k++) { const s = base.slice(); for (let m = 0; m < 8; m++) s[(r() * P) | 0] = next++; donors.push(s); }
  const flat = (arr) => { const a = new Int32Array(arr.length * P); arr.forEach((s, i) => a.set(s, i * P)); return a; };
  const ix = coverageIndex(flat(donors));
  const copy = base.slice(), mirror = base.slice().reverse(), shifted = Int32Array.from({ length: P }, (_, j) => base[(j + 5) % P]);
  const piece = Int32Array.from({ length: P }, (_, j) => (j < 20 ? base[j + 10] : 900000 + j));
  const scattered = Int32Array.from({ length: P }, (_, j) => (j % 4 === 0 ? base[j] : 800000 + j));
  const cv = (o) => coverage(ix, o);
  out(`   a copy ${cv(copy)}, its mirror ${cv(mirror)}, shifted by 5 ${cv(shifted)}, a piece of 20 bytes ${cv(piece)}, one byte in four at its place ${cv(scattered)}, a donor ${cv(donors[0])}`);
  check(cv(copy) >= 56 && cv(mirror) === cv(copy) && cv(shifted) >= 51 && cv(piece) === 20 && cv(scattered) === 16 && cv(donors[0]) === 64, 'the coverage counts the bytes one donor holds at one alignment, forward or backward, in a row or not');
  // a synthetic record: one census with half A, half B and an appearance of three cells (a copy, a piece, nothing of the donors)
  const root = mkdtempSync(join(tmpdir(), 'esdeveniments-cobertura-'));
  const dir = join(root, 'fase2/resultats/arrelament/continuitat/registres');
  mkdirSync(dir, { recursive: true });
  const halfA = donors.slice(0, 30), halfB = donors.slice(30);
  const seqs = [...halfA, ...halfB];
  const L = [
    { type: 'start', branch: 'x-continue', world: '9001', soup: 'continue' },
    { type: 'census', epoch: 9000, window: 1250, N: 8388608, D: { pool: Array.from(flat(seqs)), halfA: halfA.map((_, i) => i), halfB: halfB.map((_, i) => 30 + i), far: [] } },
    { type: 'appearance', epoch: 9000, window: 1250, id: '9000:1', cells: [1, 2, 3], orig: [...copy, ...piece, ...Int32Array.from({ length: P }, (_, j) => 700000 + j)] },
    { type: 'end' },
  ];
  writeFileSync(join(dir, 'x-continue.jsonl.gz'), gzipSync(Buffer.from(L.map((x) => JSON.stringify(x)).join('\n') + '\n')));
  const rows = coverageRows(root);
  rmSync(root, { recursive: true, force: true });
  const y = rows[0];
  out(`   the synthetic appearance: threshold ${y?.threshold}; cells ${y?.cells.map((c) => `${c.cov}/${c.run} ${c.cls}`).join(', ')}; the appearance ${y?.cls}`);
  check(rows.length === 1 && y.cells[0].cls === 'copy' && y.cells[1].cls !== 'copy' && y.cells[1].cls === 'long piece' && y.cells[2].cls === 'none' && y.cls === 'long piece', 'a copy reaches the threshold, a piece of 20 bytes in order does not (a long piece), a cell with nothing of the donors is none; a copy and a long piece of three: the appearance is a long piece');
}

out(`\n${failures ? `${failures} checks FAILED` : 'every check passes'}`);
process.exit(failures ? 1 : 0);
