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
// It exits with 1 if any check fails.
import { PROGRAM_SIZE, OPCODES } from '../../../../fase1/bff.js';
import { makeRng } from '../../../../fase1/soup.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { createWorld as smallWorld } from '../registre-copies/mon.mjs';
import { CarrierIndex } from '../registre-copies/traca.mjs';
import { rngV2, createWorld, createReplayer, provenance, recordInconsistent, ARITH } from './mon.mjs';
import { createHeritability, classifyAcquisition, walk, resolve, appearanceClass, fromPartner } from './cadena.mjs';

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
{
  const r = makeRng(3500000201, 'v2');
  const rand = () => Uint8Array.from({ length: P }, () => (r() * 256) | 0);
  let junk = rand(); while (her(junk)) junk = rand();
  check(her(R1) && her(R2) && !her(junk), 'the census test: the replicator and its variant are heritable, random bytes are not');
  // a byte of R1 whose change kills its heredity, and one whose change does not
  let kill = -1, keep = -1;
  for (let k = 0; k < P && (kill < 0 || keep < 0); k++) { const x = R1.slice(); x[k] = x[k] === 7 ? 9 : 7; if (!her(x) && kill < 0) kill = k; if (her(x) && keep < 0) keep = k; }
  check(kill >= 0 && keep >= 0, `the replicator has a byte that kills its heredity (${kill}) and one that does not (${keep})`);
  const broken = R1.slice(); broken[kill] = broken[kill] === 7 ? 9 : 7;
  const rec = (M, I, Pm, prov, half = 0) => ({ M, I, Pm, prov: Uint8Array.from(prov), half, partner: 1, A: M, mut: [] });
  const fromP = (h) => Array.from({ length: P }, (_, j) => (h === 0 ? P + j : j));
  const own = (h) => Array.from({ length: P }, (_, j) => (h === 0 ? j : P + j));
  // a. inherited: every byte from a heritable partner
  check(classifyAcquisition(rec(junk, R1.slice(), R1.slice(), fromP(0)), her).kind === 'inherited', 'a copy of a heritable partner over random bytes: inherited');
  check(classifyAcquisition(rec(junk, R1.slice(), R1.slice(), fromP(1), 1), her).kind === 'inherited', 'the same, the cell in the second half: inherited');
  // b. own: nothing from the partner
  check(classifyAcquisition(rec(broken, R1.slice(), junk, own(0)), her).kind === 'own', 'heredity made by the cell\'s own writes, nothing from the partner: own');
  // c. own, by the counterfactual: the partner gave one byte that does not matter, the repair is the cell's own
  {
    // the state before: the broken replicator with its harmless byte changed too; the partner (heritable) writes only the harmless byte,
    // and the cell's own writes repair the other (only F and the states enter the rule)
    const M = broken.slice(); M[keep] = (M[keep] + 1) & 255;
    const prov = own(0); prov[keep] = P + keep;
    const a = classifyAcquisition(rec(M, R1.slice(), R1.slice(), prov), her);
    check(a.kind === 'own' && a.counterfactual === true && a.F === 1, `a heritable partner whose only byte does not matter (the counterfactual is heritable): own, not inherited`);
  }
  // d. partner material: the partner is not heritable (one byte broken), the cell held the missing byte
  {
    const M = junk.slice(); M[kill] = R1[kill];
    const prov = fromP(0); prov[kill] = kill;
    check(classifyAcquisition(rec(M, R1.slice(), broken.slice(), prov), her).kind === 'partner material', 'heredity from the bytes of a partner that is not heritable and one of the cell\'s own: partner material');
  }
  // e. a recombination: half from a heritable partner, half the cell's own (which held the rest of R1): inherited, if the partner's half is needed
  {
    const M = R1.slice(); for (let j = 0; j < 32; j++) M[j] = junk[j];
    const prov = own(0); for (let j = 0; j < 32; j++) prov[j] = P + j;
    const a = classifyAcquisition(rec(M, R1.slice(), R1.slice(), prov), her);
    check(a.kind === (her(M) ? 'own' : 'inherited') && a.F === 32, `a recombination (32 bytes from a heritable partner, the rest the cell's own): ${a.kind}, as the counterfactual says`);
  }
  check(fromPartner({ prov: Uint8Array.from([...own(0).slice(0, 63), P + 3 | ARITH]), half: 0 }).length === 1, 'a byte copied from the partner and then changed by \'+\' or \'-\' still counts as from the partner');
  // f. walk: a heritable cell since the window's start is older; a heritable cell overwritten by a heritable partner moves; a mutation births
  {
    const mk = (e, A, M, I, extra = {}) => ({ epoch: e, A, M, I, mut: [], partner: 9, half: 0, Pm: junk, prov: Uint8Array.from(own(0)), ...extra });
    const recs = new Map([[1, mk(1, R1, R1, R1)], [2, mk(2, R1, R1, R1)]]);
    check(walk({ cell: 3, point: { e: 2, ph: 'I' } }, recs, 0, 0, her).end === 'older', 'heritable since the window\'s start: older than the window');
    check(walk({ cell: 3, point: { e: 2, ph: 'I' } }, recs, 0, -50, her).move === true, 'heritable since the segment\'s start: the chain goes on in the segment before');
    const recs2 = new Map([[1, mk(1, junk, R1, R1, { mut: [0] })], [2, mk(2, R1, R1, R1)]]);
    const w2 = walk({ cell: 3, point: { e: 2, ph: 'I' } }, recs2, 0, 0, her);
    check(w2.end === 'birth' && w2.kind === 'mutation' && w2.epoch === 1, 'random bytes made heritable by a mutation: a birth by mutation, at its epoch');
    const recs3 = new Map([[1, mk(1, R2, R2, R1, { Pm: R1, prov: Uint8Array.from(fromP(0)) })], [2, mk(2, R1, R1, R1)]]);
    const w3 = walk({ cell: 3, point: { e: 2, ph: 'I' } }, recs3, 0, 0, her);
    check(w3.source?.cell === 9 && w3.hop.kind === 'replacement' && w3.source.epoch === 1, 'a heritable cell overwritten by a heritable partner: the chain moves to the partner (a replacement)');
    const recs4 = new Map([[1, mk(1, R2, R2, R2.map((v, j) => (j < 20 ? R1[j] : v)), { Pm: R1, prov: Uint8Array.from(own(0).map((t, j) => (j < 20 ? P + j : t))) })], [2, mk(2, R1, R1, R1)]]);
    const w4 = walk({ cell: 3, point: { e: 1, ph: 'I' } }, recs4, 0, 0, her);
    check(w4.end === 'older', 'a heritable cell with fewer than half of its bytes from a heritable partner: no replacement, the chain stays');
  }
  check(appearanceClass(['birth', 'birth', 'earlier lineage']) === 'birth' && appearanceClass(['birth', 'older']) === 'mixed' && appearanceClass(['older']) === 'older', 'the class of an appearance: the end of more than half of its cells, else mixed');
}

// 3. The chains in test worlds
out('\n3. The chains in test worlds whose genealogy is known by construction');
function testChains({ W, H, seed, E, w0, inject, earlier = null, mutation = 0, heads: pickHeads = null }) {
  const soup = testSoup(W, H, seed);
  const world = createWorld({ soup, width: W, height: H, radius: 2, mutation, seed: seed + 1, inject });
  const cps = new Map();
  if (w0 === 0) cps.set(0, world.checkpoint());
  for (let e = 1; e <= E; e++) { world.step(); if (e >= w0 && (e - w0) % 50 === 0) cps.set(e, world.checkpoint()); }
  const atE = soup.slice();
  const cand = pickHeads ? pickHeads(atE) : Array.from({ length: W * H }, (_, c) => c);
  const heads = cand.filter((c) => her(atE.subarray(c * P, c * P + P))).map((c) => ({ id: `c${c}`, cell: c, point: { e: E, ph: 'I' }, w0, earlier }));
  const { replay, stats } = createReplayer(world, cps);
  const res = resolve({ heads, replay, her, width: W, height: H, radius: 2, step: 50, top: E, bottom: w0 });
  return { ...res, atE, stats, heads };
}
const ends = (chains) => { const m = new Map(); for (const ch of chains) { const k = ch.result.end === 'birth' ? `birth ${ch.result.cell}@${ch.result.epoch} (${ch.result.kind})` : ch.result.end; m.set(k, (m.get(k) ?? 0) + 1); } return [...m].map(([k, v]) => `${k}: ${v}`).join('; '); };
{
  // a. one planting inside the window
  const W = 64, H = 64, X = 64 * 20 + 20;
  const t = testChains({ W, H, seed: 3500000301, E: 200, w0: 0, inject: (e) => (e === 10 ? plantAt([X], R1) : null) });
  out(`   a. one planting of the replicator at cell ${X}, epoch 10; ${t.heads.length} heritable cells at 200; ${t.replays} replays; ends: ${ends(t.chains)}`);
  check(t.heads.length >= 20 && t.chains.every((ch) => ch.result.end === 'birth' && ch.result.cell === X && ch.result.epoch === 10 && ch.result.kind === 'mutation'), 'every heritable cell\'s chain ends at the planting (its cell, its epoch, a change in place)');
  check(t.chains.filter((ch) => ch.appearanceCell !== X).every((ch) => ch.hops.length >= 1 && ch.hops.every((h) => h.kind === 'inherited' || h.kind === 'replacement')), 'every other cell reaches it through inherited copies (or replacements)');
}
{
  // b. two plantings of the same program, far apart, at the same epoch: two origins, each on its side
  const W = 256, H = 32, X1 = 16 * W + 40, X2 = 16 * W + 216;
  const t = testChains({ W, H, seed: 3500000302, E: 150, w0: 0, inject: (e) => (e === 10 ? plantAt([X1, X2], R1) : null),
    heads: (s) => { const ix = new CarrierIndex(); ix.add([R1], 1); return Array.from({ length: W * H }, (_, c) => c).filter((c) => ix.bits(s, c * P)); } });
  const side = (c) => (c % W < W / 2 ? X1 : X2);
  out(`   b. the same program planted twice, at cells ${X1} and ${X2}, epoch 10; ${t.heads.length} heritable carriers at 150; ends: ${ends(t.chains)}`);
  const leftN = t.heads.filter((h) => h.cell % W < W / 2).length;
  check(leftN >= 10 && t.heads.length - leftN >= 10 && t.chains.every((ch) => ch.result.end === 'birth' && ch.result.cell === side(ch.appearanceCell) && ch.result.epoch === 10), 'two origins: every chain ends at the planting on its own side, never at the other (equal programs, two ancestries)');
}
{
  // c. a planting before the window
  const W = 64, H = 64, X = 64 * 30 + 30;
  const t = testChains({ W, H, seed: 3500000303, E: 200, w0: 50, inject: (e) => (e === 5 ? plantAt([X], R1) : null) });
  out(`   c. a planting at epoch 5, the window from 50; ${t.heads.length} heritable cells at 200; ends: ${ends(t.chains)}`);
  check(t.heads.length >= 20 && t.chains.every((ch) => ch.result.end === 'older'), 'every chain ends older than the window (a copy before the window: not a birth)');
}
{
  // d. an earlier lineage: the replicator's program is a lineage detected before
  const W = 64, H = 64, X = 64 * 20 + 40;
  const ix = new CarrierIndex(); ix.add([R1], 1);
  const t = testChains({ W, H, seed: 3500000304, E: 200, w0: 0, earlier: ix, inject: (e) => (e === 10 ? plantAt([X], R1) : null) });
  out(`   d. the replicator, a lineage detected before; ${t.heads.length} heritable cells at 200; ends: ${ends(t.chains)}`);
  check(t.heads.length >= 20 && t.chains.every((ch) => (ch.appearanceCell === X && ch.result.end === 'birth') || (ch.result.end === 'earlier lineage' && ch.hops.length === 1)), 'every chain that inherits ends at its first hop as an earlier lineage');
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
  const t = testChains({ W, H, seed: 3500000305, E: 200, w0: 0, inject, heads: (s) => Array.from({ length: W * H }, (_, c) => c).filter((c) => ix.bits(s, c * P)) });
  const again = t.chains.filter((ch) => wiped.has(ch.appearanceCell));
  out(`   e. the planting at ${X}; at 120 the cells of columns 40 to 55 replaced by random bytes; ${again.length} of them heritable again at 200; ends: ${ends(t.chains)}`);
  check(again.length >= 5 && again.every((ch) => ch.hops.length >= 1 && ch.hops[0].epoch > 120), 'every wiped cell heritable again acquired it after the wipe (its first hop is later), not at the first planting');
  check(t.chains.every((ch) => ch.result.end === 'birth' && ch.result.cell === X && ch.result.epoch === 10), 'and every chain still ends at the planting');
}
{
  // f. a repair in place: a broken replicator planted at 10 and repaired at 30: the birth is the repair
  const W = 64, H = 64, Z = 64 * 32 + 32;
  let kill = -1;
  for (let k = 0; k < P && kill < 0; k++) { const x = R1.slice(); x[k] = x[k] === 7 ? 9 : 7; if (!her(x)) kill = k; }
  const broken = R1.slice(); broken[kill] = broken[kill] === 7 ? 9 : 7;
  const t = testChains({ W, H, seed: 3500000306, E: 200, w0: 0, inject: (e) => (e === 10 ? plantAt([Z], broken) : e === 30 ? [[Z * P + kill, R1[kill]]] : null) });
  out(`   f. a broken replicator planted at ${Z}, epoch 10, repaired at 30; ${t.heads.length} heritable cells at 200; ends: ${ends(t.chains)}`);
  check(t.heads.length >= 20 && t.chains.every((ch) => ch.result.end === 'birth' && ch.result.cell === Z && ch.result.epoch === 30), 'every chain ends at the repair (epoch 30), not at the planting of a program that was not heritable');
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
  check(r1.length >= 10 && r1.every((ch) => ch.result.end === 'birth' && ch.result.cell === Y), 'every carrier of the replicator ends at its planting');
  check(r2.every((ch) => ch.result.end === 'birth' && ch.result.cell === X), 'every carrier of the variant ends at its planting');
}

out(`\n${failures ? `${failures} checks FAILED` : 'every check passes'}`);
process.exit(failures ? 1 : 0);
