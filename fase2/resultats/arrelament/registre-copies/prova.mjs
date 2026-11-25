// The record of heritable copies, the small version (exploratory; the note, README.md): the instrument's checks, before it is used.
//
//   node fase2/resultats/arrelament/registre-copies/prova.mjs > fase2/resultats/arrelament/registre-copies/prova-sortida.txt
//
// 1. The interpreter: evaluateEvents gives the tape and the operations of evaluate (fase1/bff.js), and its writes, replayed, give the tape.
// 2. The mutations: mutateListed gives the buffer and the random numbers of mutate (fase1/soup.js), and lists what it overwrites.
// 3. The tags, in cases with a known answer: a copy takes all the tags of the byte copied (also onto an equal value), '+' and '-' keep
//    them with a flag, a chain of copies keeps the first origin, a mutation clears them, and a carrier's bytes take its bits.
// 4. A tiny test world (32 × 32, no mutation) with the replicator of Phase 1 in two cells (only here, as the project's tests already do;
//    no world of the project is touched): every cell that carries it at the end has a window whose 16 bytes all carry its bit and descend
//    from those two cells, and both are origins; the invariant holds at every epoch; with mutations, it still holds.
// 5. The world against sim.mjs: a tiny world from a capture, run by sim.mjs and by mon.mjs with windows open: the same measures and the
//    same final fingerprint.
// 6. The data's checks (dades.mjs) reject impossible cases: auditor 2's four (AU2-216) and others.
import { writeFileSync, mkdtempSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execFileSync } from 'child_process';
import { evaluate, TAPE_SIZE, PROGRAM_SIZE, OPCODES } from '../../../../fase1/bff.js';
import { makeRng, mutate, shannonEntropy } from '../../../../fase1/soup.js';
import { evaluateEvents, mutateListed, writes, Observer, Tracer, MUT, ARITH } from './traca.mjs';
import { createWorld } from './mon.mjs';
import { load, ROOT, sha256 } from './dades.mjs';
import { codeVersion } from '../../../../eines/b1-comu.mjs';

const out = (s = '') => console.log(s);
let failures = 0;
const check = (ok, what) => { out(`   ${ok ? 'ok  ' : 'FAIL'} ${what}`); if (!ok) failures++; };
// The replicator of Phase 1 (the one of test/quimiques.mjs and test/densitat.mjs)
const REPLICATOR = Uint8Array.from([140,221,0,221,20,164,126,32,105,126,78,173,241,242,207,220,199,45,213,101,52,91,155,79,44,60,2,125,93,71,65,217,65,5,71,141,93,141,15,5,65,217,15,71,93,125,2,60,44,79,155,91,52,101,213,45,0,0,62,82,0,77,77,0]);
out(`The record of heritable copies: the instrument's checks (exploratory). The code: ${codeVersion()}, ${process.version}.`);

// 1. The interpreter
out('\n1. The interpreter, against evaluate');
{
  const rng = makeRng(3200000101, 'v2'), ops = [...OPCODES].map((c) => c.charCodeAt(0));
  const ev = new Int32Array(2 * 8192 + 2);
  let same = 0, replay = 0, total = 0, writesSeen = 0;
  const one = (tape) => {
    const a = tape.slice(), b = tape.slice();
    const oa = evaluate(a, 0), ob = evaluateEvents(b, 0, ev);
    total++;
    if (oa === ob && a.every((v, i) => v === b[i])) same++;
    const r = tape.slice();
    for (let k = 0; k < writes.n; k++) { const d = ev[2 * k], s = ev[2 * k + 1]; if (s >= 0) r[d] = r[s]; else if (s === -1) r[d] = (r[d] + 1) & 255; else r[d] = (r[d] - 1) & 255; }
    writesSeen += writes.n;
    if (r.every((v, i) => v === b[i])) replay++;
  };
  for (let i = 0; i < 100000; i++) one(Uint8Array.from({ length: TAPE_SIZE }, () => (rng() * 256) | 0));
  for (let i = 0; i < 100000; i++) one(Uint8Array.from({ length: TAPE_SIZE }, () => (rng() < 0.7 ? ops[(rng() * ops.length) | 0] : (rng() * 256) | 0)));
  // real neighbour pairs of an aged soup of the pilot (world 7014's start capture)
  const cap = readFileSync(join(ROOT, 'fase2/resultats/arrelament/pilot/alicuotes/7014/continue.bin'));
  for (let i = 0; i < 50000; i++) {
    const c = (rng() * 131072) | 0, x = c % 512, y = (c / 512) | 0;
    let nx, ny;
    do { nx = x + ((rng() * 5) | 0) - 2; ny = y + ((rng() * 5) | 0) - 2; } while ((nx === x && ny === y) || nx < 0 || ny < 0 || nx >= 512 || ny >= 256);
    const t = new Uint8Array(TAPE_SIZE); t.set(cap.subarray(c * 64, c * 64 + 64), 0); t.set(cap.subarray((ny * 512 + nx) * 64, (ny * 512 + nx) * 64 + 64), 64);
    one(t);
  }
  check(same === total, `the same tape and operations as evaluate: ${same} of ${total} tapes (uniform, rich in instructions, real pairs)`);
  check(replay === total, `the writes, replayed, give the tape: ${replay} of ${total} (${writesSeen} writes)`);
}

// 2. The mutations
out('\n2. The mutations, against mutate');
for (const p of [0.00024, 0.01]) {
  const a = new Uint8Array(1 << 20), b = new Uint8Array(1 << 20), ra = makeRng(3200000102, 'v2'), rb = makeRng(3200000102, 'v2'), list = [];
  const ca = mutate(a, a.length, p, ra), cb = mutateListed(b, b.length, p, rb, list);
  const changed = [...b.keys()].filter((i) => b[i] !== 0);
  check(ca === cb && a.every((v, i) => v === b[i]) && ra() === rb() && list.length === cb && changed.every((i) => list.includes(i)),
    `p = ${p}: the same buffer, count (${cb}) and following random number; every overwritten byte is listed`);
}

// 3. The tags, in cases with a known answer (one pair of cells)
out('\n3. The tags, in cases with a known answer');
{
  const fakeObserver = (bits) => ({ carrier: Uint16Array.from(bits), update() {}, tracers: [] });
  const pair = Uint32Array.from([0, 1]);
  const mk = (bits, soup) => new Tracer(fakeObserver(bits), 0, 0, soup, 1);
  // a. the replicator in cell 0 (a carrier: bit 1), a partner of data bytes in cell 1: its copied bytes take bit 1 and come from cell 0
  const soup = new Uint8Array(128); soup.set(REPLICATOR, 0); soup.fill(1, 64);
  const t = mk([0, 0], soup);
  t.observer.carrier[0] = 1;   // it becomes a carrier after the window's start: its bytes take the bit when it interacts
  const tape = soup.slice(), ev = new Int32Array(2 * 8192 + 2);
  t.gather(pair, 1); evaluateEvents(tape, 0, ev); t.apply(0, ev, writes.n); soup.set(tape); t.scatter(pair, 1);
  let copied = 0, okCopied = true;
  for (let j = 64; j < 128; j++) if (t.orig[j] !== j) { if (t.orig[j] >= 0 && t.orig[j] < 64 && (t.mask[j] & 1) && (t.flag[j] !== 0 || soup[j] === t.snap[t.orig[j]])) copied++; else okCopied = false; }
  check(okCopied && copied >= 32, `the replicator's copy: ${copied} bytes of the partner come from it, all with its bit and its values`);
  check(t.inconsistent(soup) === 0, 'the invariant holds after the interaction');
  check([...Array(64).keys()].every((j) => t.mask[j] & 1), 'the carrier\'s own bytes take its bit when it interacts');
  // b. '+' and '-': the tags stay, with the flag
  const t2 = mk([0, 0], new Uint8Array(128)); t2.gather(pair, 1);
  t2.apply(0, Int32Array.from([5, -1, 6, -2]), 2); t2.scatter(pair, 1);
  check(t2.orig[5] === 5 && t2.orig[6] === 6 && t2.flag[5] === ARITH && t2.flag[6] === ARITH, "'+' and '-' keep the origin and set the flag");
  // c. a copy takes all the tags of the byte copied, also onto an equal value; d. a chain keeps the first origin
  const s3 = new Uint8Array(128).fill(9), t3 = mk([4, 0], s3); t3.gather(pair, 1);
  t3.apply(0, Int32Array.from([64, 0, 65, 1, 70, 64, 71, 70]), 4); t3.scatter(pair, 1);
  check(t3.orig[64] === 0 && t3.orig[65] === 1 && t3.orig[70] === 0 && t3.orig[71] === 0 && (t3.mask[71] & 4) && !(t3.mask[72] & 4),
    'a copy onto an equal value takes the source\'s tags; a chain of copies keeps the first origin and the bit; an untouched byte does not get it');
  // e. a mutation clears the tags
  const t4 = mk([2, 2], new Uint8Array(128)); t4.mutated([3, 100]);
  check(t4.orig[3] === -1 && t4.flag[3] === MUT && t4.mask[3] === 0 && t4.flag[100] === MUT, 'a mutation clears the origin and the bits and sets the flag');
}

// 4. A tiny test world with the replicator in two cells
out('\n4. A tiny test world (32 × 32), the replicator of Phase 1 in two cells');
for (const mutation of [0, 0.00024]) {
  const W = 32, H = 32, n = W * H, r = makeRng(3200000103, 'v2');
  const soup = Uint8Array.from({ length: n * PROGRAM_SIZE }, () => (r() * 256) | 0);
  const A = 10 * W + 10, Bc = 21 * W + 21;
  soup.set(REPLICATOR, A * PROGRAM_SIZE); soup.set(REPLICATOR, Bc * PROGRAM_SIZE);
  const world = createWorld({ soup, width: W, height: H, radius: 2, mutation, seed: 3200000104 });
  const o = new Observer(n, [{ name: 'R', bit: 1, programs: [REPLICATOR] }]); o.all(soup);
  const t = new Tracer(o, 0, 0, soup, n / 2); o.tracers.push(t);
  let bad = 0;
  for (let e = 0; e < 60; e++) { world.step([o]); bad += t.inconsistent(soup); }
  o.update(soup);
  let carriers = 0, descend = 0, fromA = 0, fromB = 0;
  for (let c = 0; c < n; c++) {
    if (!(o.carrier[c] & 1)) continue;
    carriers++;
    for (const a of o.index.windowsOf(soup, c * PROGRAM_SIZE, 1)) {
      let ok = true, oa = 0, ob = 0;
      for (let j = a; j < a + 16; j++) { const i = c * PROGRAM_SIZE + j, oc = t.orig[i] >> 6; if (!(t.mask[i] & 1) || t.orig[i] < 0 || (oc !== A && oc !== Bc)) ok = false; if (oc === A) oa++; if (oc === Bc) ob++; }
      if (ok) { descend++; if (oa) fromA++; if (ob) fromB++; break; }
    }
  }
  check(bad === 0, `mutation ${mutation}: the invariant holds at every one of 60 epochs`);
  if (mutation === 0) {
    check(carriers >= 5, `the replicator spreads: ${carriers} carriers at the end`);
    check(descend === carriers, `every carrier has a window whose 16 bytes carry its bit and descend from the two cells: ${descend} of ${carriers}`);
    check(fromA > 0 && fromB > 0, `both cells are origins: ${fromA} carriers with bytes from A, ${fromB} from B`);
  } else check(descend >= 0.95 * carriers, `with mutations, ${descend} of ${carriers} carriers descend from the two cells by a full window`);
}

// 5. The world against sim.mjs
out('\n5. A tiny world from a capture, run by sim.mjs and by mon.mjs with windows open');
{
  const dir = mkdtempSync(join(tmpdir(), 'registre-prova-')), cap = join(dir, 'capture.bin'), js = join(dir, 'sim.jsonl');
  try {
    const r = makeRng(3200000105, 'v2'), W = 32, H = 32, n = W * H;
    const soup = Uint8Array.from({ length: n * PROGRAM_SIZE }, () => (r() * 256) | 0);
    writeFileSync(cap, soup);
    execFileSync(process.execPath, ['sim.mjs', '--world', '32x32', '--seed', '3200000106', '--mixing', '0', '--from', cap, '--start', '0', '--epochs', '600', '--every', '100', '--json', js], { cwd: ROOT, stdio: ['ignore', 'ignore', 'pipe'] });
    const L = readFileSync(js, 'utf8').trim().split('\n').map((l) => JSON.parse(l)), M = L.filter((l) => l.type === 'measure'), END = L.at(-1);
    const world = createWorld({ soup, width: W, height: H, radius: L[0].radius, mutation: L[0].mutation, seed: 3200000106 });
    let o = null, ops = 0, runs = 0, okM = 0;
    for (let e = 1; e <= 600; e++) {
      if (e === 101) { o = new Observer(n, [{ name: 'R', bit: 1, programs: [REPLICATOR] }]); o.all(soup); o.tracers.push(new Tracer(o, 0, 100, soup, n / 2)); }
      const s = world.step(o ? [o] : []); ops += s.ops; runs += s.runs;
      if (e % 100 === 0) { const m = M.find((x) => x.epoch === e); if (m && m.h0 === shannonEntropy(soup) && m.ops === ops && m.runs === runs) okM++; ops = 0; runs = 0; }
    }
    let hash = 0x811c9dc5;
    for (let i = 0; i < soup.length; i++) hash = Math.imul(hash ^ soup[i], 0x01000193);
    check(okM === 6 && M.length === 6, `the measures of sim.mjs: ${okM} of ${M.length} equal (windows open from epoch 101)`);
    check((hash >>> 0).toString(16) === END.fingerprint, `the final fingerprint: ${(hash >>> 0).toString(16)} against sim.mjs's ${END.fingerprint}`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

// 6. The data's checks reject impossible cases
out('\n6. The data\'s checks (dades.mjs): the real data pass, and impossible cases do not');
{
  const withJoins = (d) => d.trackings.get(d.list.find((x) => d.trackings.get(x).some((l) => l.type === 'census' && l.joins.length)));
  const firstEst = (d) => d.list.find((id) => d.records.get(id).some((l) => l.type === 'event'));
  const cases = {
    'a missing census': (d) => { const L = d.trackings.get(d.list[0]); L.splice(L.findIndex((l) => l.type === 'census'), 1); },
    'a false group at the confirmation': (d) => { const id = firstEst(d), ev = d.records.get(id).find((l) => l.type === 'event'); const c = d.trackings.get(id).find((l) => l.type === 'census' && l.epoch === ev.confirmed); c.groups = { '99999:99999': c.heritable }; },
    'a step after the end': (d) => { const L = d.trackings.get(d.list[0]); const s = L.find((l) => l.type === 'step'); s.epoch = L[0].end + 250; },
    'a false branch in the final line': (d) => { d.trackings.get(d.list[0]).at(-1).branch = 'not-the-branch'; },
    'a changed line of the replayed record': (d) => { const R = d.replays.get(d.list[0]); const x = R.lines.find((l) => l.type === 'measure'); x.h0 += 1e-9; },
    'a changed program of a new lineage': (d) => { const n = d.trackings.get(d.list[0]).find((l) => l.type === 'new'); n.programs[0] = (n.programs[0][0] === 'a' ? 'b' : 'a') + n.programs[0].slice(1); },
    'a lineage joined twice': (d) => { const L = withJoins(d); const c = L.find((l) => l.type === 'census' && l.joins.length); c.joins.push(c.joins[0]); },
    'a census cell that is not heritable': (d) => { const L = d.trackings.get(d.list[0]); const c = L.find((l) => l.type === 'census' && l.cells.length); c.cells[0] = { ...c.cells[0], cell: (c.cells[0].cell + 1) % 131072 }; },
    'a repeated part-B branch in the manifest': (d) => { const b = d.m.branches.find((x) => x.part === 'B'); d.m.branches.push({ ...b }); },
  };
  const real = load({ robust: false });
  check(real.problems.length === 0, `the real data: ${real.problems.length} problems`);
  for (const [name, mutate] of Object.entries(cases)) {
    const r = load({ robust: false, mutate });
    check(r.problems.length > 0, `${name}: rejected (${r.problems[0] ?? 'not rejected'})`);
  }
}

// 7. The analysis, on synthetic records with a known answer (no record of a branch is read)
out('\n7. The analysis (analisi.mjs) on synthetic records with a known answer');
{
  const list = JSON.parse(readFileSync(join(ROOT, 'fase2/resultats/arrelament/registre-copies/llista.json'), 'utf8'));
  const WINDOWS = [1250, 250];
  for (const [name, dShare, expect] of [['all D-derived', 0.9, 'Two thirds or more are D-derived'], ['none from D', 0, 'A third or fewer are D-derived']]) {
    const dir = mkdtempSync(join(tmpdir(), 'registre-analisi-'));
    try {
      let removedAged = 0;
      for (const br of list.branches) {
        const L = [{ type: 'start', branch: br.id, code: 'abc1234', windows: WINDOWS }];
        for (const o of br.observers) for (const w of WINDOWS) {
          L.push({ type: 'control', epoch: o.epoch, window: w, sets: o.sets.map((s) => ({ name: s.name, carriersAtStart: 0, carriers: 20, ok: 20, flagged: 0 })), far: { cells: 100, meanShare: 0 } });
          for (const y of o.appearances) {
            L.push({ type: 'appearance', epoch: o.epoch, window: w, id: y.id, cells: y.cells, bytes: y.cells.length * 64, dStrict: o.dStrictLineages ? dShare : null, dBroad: o.dBroadLineages ? dShare : null,
              members: {}, mut: 0, arith: 0, self: 0, origCells: {}, presentAtStart: 0, baseline: { distance: 3, cells: 200, meanShare: 0.2, percentile: 0.5 } });
            if (w === 1250 && dShare >= 0.5 && o.dStrictLineages && o.why === 'time rule' && br.soup === 'continue') removedAged++;
          }
        }
        L.push({ type: 'end', branch: br.id, measuresChecked: 1, invariantChecks: 0 });
        writeFileSync(join(dir, `${br.id}.jsonl`), L.map((x) => JSON.stringify(x)).join('\n') + '\n');
      }
      const text = execFileSync(process.execPath, ['fase2/resultats/arrelament/registre-copies/analisi.mjs', '--registres', dir], { cwd: ROOT, encoding: 'utf8' });
      const rc = text.split('\n').find((l) => l.includes('Rc, without the D-derived')) ?? '';
      check(text.includes(expect) && rc.includes(` ${33 - removedAged}, `), `${name}: the reading ("${expect}…") and Rc's aged count (${33 - removedAged})`);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
}

out(`\n${failures ? `${failures} checks FAIL: the instrument is not used.` : 'All the checks pass.'}`);
process.exitCode = failures ? 1 : 0;
