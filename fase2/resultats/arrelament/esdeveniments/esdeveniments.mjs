// A record of copy events (exploratory; the note, README.md): one branch, again, and the chains of its failed appearances' cells.
//
//   node fase2/resultats/arrelament/esdeveniments/esdeveniments.mjs ID [--out FILE]
//
// From the branch's start capture and seed, the world's epochs exactly as sim.mjs does them (mon.mjs; the simulator is not touched), up to
// the end of the pilot's record, keeping a checkpoint every 50 epochs inside each window (the 1,250 epochs before each detection census).
// It fails, and writes nothing more, if any measure (every 100 epochs: H0, the operations, the runs) or the final fingerprint differs from
// the pilot's record, if an appearance's cells do not hold its programs at its census or are not heritable there by the census's test, or
// if a segment run again does not end in its checkpoint. Then, for every cell of every appearance, its chain (cadena.mjs), with K = 2
// (the main rule) and K = 4 (a sensitivity), fetching the records it needs by running segments again; and the same for the cells of the
// census's reference lineages (prepara.mjs), from their first census, whose births the analysis compares with the appearances'.
// The output (registres/ID.jsonl.gz): a start line; per census, its appearances and, per cell, its chains (the end, the hops and, at each
// acquisition and birth, the states before and after and the count of its bytes' origins); an end line with the checks.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { gzipSync } from 'zlib';
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { shannonEntropy } from '../../../../fase1/soup.js';
import { fromHex } from '../../../inert.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { CarrierIndex } from '../registre-copies/traca.mjs';
import { ROOT, sha256 } from '../registre-copies/dades.mjs';
import { createWorld, createReplayer } from './mon.mjs';
import { createHeritability, createHistory, chain, K, THETA, REPLACE, MAX_HOPS } from './cadena.mjs';
import { HERE, LIST, LIST_SHA256, STEP, FOLLOW_RADIUS, K_SENS } from './comu.mjs';

const P = PROGRAM_SIZE;
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ID = args[0];
const outFile = opt('--out') ?? join(ROOT, HERE, 'registres', `${ID}.jsonl.gz`);
if (!ID || ID.startsWith('--') || args.length !== (opt('--out') ? 3 : 1)) { console.error('usage: node esdeveniments.mjs ID [--out FILE]'); process.exit(2); }
const listText = readFileSync(join(ROOT, LIST));
if (sha256(listText) !== LIST_SHA256) { console.error('esdeveniments: llista.json is not the note\'s'); process.exit(2); }
const L = JSON.parse(listText.toString());
const br = L.branches.find((b) => b.id === ID);
if (!br) { console.error(`esdeveniments: ${ID} is not in the list`); process.exit(2); }
mkdirSync(dirname(outFile), { recursive: true });
const lines = [];
const emit = (x) => lines.push(JSON.stringify(x));
const flush = () => writeFileSync(outFile, gzipSync(Buffer.from(lines.join('\n') + '\n'), { level: 9 }));
const fail = (why) => { emit({ type: 'fail', why }); flush(); console.error(`esdeveniments ${ID}: ${why}`); process.exit(1); };
const hex = (a) => Buffer.from(a).toString('hex');

// The pilot's record: the parameters of the world, the measures and the end
const recText = readFileSync(join(ROOT, br.record));
if (sha256(recText) !== br.recordSha256) fail('the pilot record is not the list\'s');
const rec = recText.toString().trim().split('\n').map((l) => JSON.parse(l));
const S = rec[0], END = rec.at(-1);
const [Wd, Ht] = S.world;
if (S.rng !== 'v2' || S.mixing !== 0 || S.diffusion !== 0 || S.flow !== 0 || S.renewal !== 0 || !Array.isArray(S.world)) fail('the branch is not a quiet 2D world with rng v2');
if (S.start !== br.start || END.epoch !== br.end || S.from !== br.capture) fail('the pilot record is not of the list\'s branch');
const n = Wd * Ht, every = S.every, start = S.start, last = END.epoch;
const measures = new Map(rec.filter((l) => l.type === 'measure').map((l) => [l.epoch, l]));
const capture = readFileSync(join(ROOT, br.capture));
if (sha256(capture) !== br.captureSha256) fail('the start capture does not have the manifest\'s SHA-256');
const soup = new Uint8Array(capture);
if (soup.length !== n * P) fail('the start capture is not of this world');
emit({ type: 'start', branch: ID, world: br.world, soup: br.soup, code: codeVersion(), node: process.version, list: LIST_SHA256, seed: S.seed, start, end: last,
  rules: { K, kSensitivity: K_SENS, theta: THETA, replace: REPLACE, maxHops: MAX_HOPS, step: STEP, followRadius: FOLLOW_RADIUS }, censuses: br.censuses.map((c) => ({ epoch: c.epoch, w0: c.w0 })) });

// The run, with the checkpoints of the windows
const world = createWorld({ soup, width: Wd, height: Ht, radius: S.radius, mutation: S.mutation, seed: S.seed });
world.epoch = start;
const wanted = new Set();
for (const c of br.censuses) for (let e = c.w0; e <= c.epoch; e += STEP) wanted.add(e);
if ([...wanted].some((e) => e % STEP !== 0)) fail('a window does not start on a multiple of the checkpoints\' spacing');
const cps = new Map();
if (wanted.has(start)) cps.set(start, world.checkpoint());
// a reference lineage first detected at the branch's start: its cells hold its programs there
for (const c of br.censuses) for (const x of c.references.filter((z) => z.first === start)) x.cells.forEach((cell, i) => {
  const prog = fromHex(x.programs[i]);
  for (let j = 0; j < P; j++) if (soup[cell * P + j] !== prog[j]) fail(`at ${start}, the cell ${cell} of the reference lineage ${x.id} does not hold its program`);
});
let ops = 0, runs = 0, checked = 0, rss = 0;
const t0 = Date.now();
for (let epoch = start + 1; epoch <= last; epoch++) {
  const r = world.step();
  ops += r.ops; runs += r.runs;
  if (epoch % every === 0) {
    const m = measures.get(epoch);
    if (!m) fail(`no measure in the pilot record at ${epoch}`);
    const h0 = shannonEntropy(soup);
    if (h0 !== m.h0 || ops !== m.ops || runs !== m.runs) fail(`at ${epoch}, the world is not the pilot's (H0 ${h0} against ${m.h0}, operations ${ops} against ${m.ops}, runs ${runs} against ${m.runs})`);
    checked++; ops = 0; runs = 0;
    rss = Math.max(rss, process.memoryUsage().rss);
  }
  if (wanted.has(epoch)) cps.set(epoch, world.checkpoint());
  for (const c of br.censuses.filter((x) => x.epoch === epoch)) for (const y of c.appearances) y.cells.forEach((cell, i) => {
    const prog = fromHex(y.programs[i]);
    for (let j = 0; j < P; j++) if (soup[cell * P + j] !== prog[j]) fail(`at ${epoch}, the cell ${cell} of ${y.id} does not hold its program`);
  });
  for (const c of br.censuses) for (const x of c.references.filter((z) => z.first === epoch)) x.cells.forEach((cell, i) => {
    const prog = fromHex(x.programs[i]);
    for (let j = 0; j < P; j++) if (soup[cell * P + j] !== prog[j]) fail(`at ${epoch}, the cell ${cell} of the reference lineage ${x.id} does not hold its program`);
  });
}
let hash = 0x811c9dc5;
for (let i = 0; i < soup.length; i++) hash = Math.imul(hash ^ soup[i], 0x01000193);
const fp = (hash >>> 0).toString(16);
if (fp !== END.fingerprint) fail(`the final fingerprint is not the pilot's (${fp} against ${END.fingerprint})`);
if (cps.size !== wanted.size) fail('a checkpoint is missing');
const tRun = (Date.now() - t0) / 1000;

// The chains
const her = createHeritability();
const { replay, stats } = createReplayer(world, cps);
const h = createHistory({ replay, width: Wd, height: Ht, radius: FOLLOW_RADIUS, step: STEP });
const slim = (x) => {
  if (!x) return x;
  const o = { ...x };
  if (o.material) o.material = { H: o.material.H, U: o.material.U, N: o.material.N, mutation: o.material.mutation, sources: o.material.sources, given: o.material.given };
  if (o.hops) o.hops = o.hops.map(slim);
  return o;
};
// the states of a step (before and after, and the partner's before), for the evidence
const statesOf = (cell, e, step) => {
  const r = h.rec(cell, e);
  return step === 'interaction' ? { before: hex(r.M), after: hex(r.I), partner: r.partner, partnerBefore: r.Pm ? hex(r.Pm) : null } : { before: hex(r.A), after: hex(r.M), mutated: r.mut.length };
};
for (const c of br.censuses) {
  const ix = new CarrierIndex();
  if (c.earlier.dominant.length) ix.add(c.earlier.dominant.map(fromHex), 1);
  if (c.earlier.other.length) ix.add(c.earlier.other.map(fromHex), 2);
  const earlier = c.earlier.dominant.length || c.earlier.other.length ? ix : null;
  for (const y of c.appearances) {
    const cells = [];
    for (const cell of y.cells) {
      const st = h.state(cell, c.epoch, 'I', c.w0);
      if (!her(st)) fail(`${y.id}: the cell ${cell} is not heritable at ${c.epoch} by the census's test`);
      const out = {};
      for (const [name, k] of [['main', K], ['sensitivity', K_SENS]]) {
        const ch = chain(h, her, { cell, e: c.epoch, ph: 'I' }, c.w0, earlier, k);
        const res = slim(ch);
        if (ch.end === 'birth') res.states = statesOf(ch.cell, ch.epoch, ch.step);
        res.hops = ch.hops.map((x) => ({ ...slim(x), ...(x.kind === 'inherited' ? { states: statesOf(x.cell, x.epoch, x.step) } : {}) }));
        out[name] = res;
      }
      cells.push({ cell, chains: out });
    }
    emit({ type: 'appearance', id: y.id, census: c.epoch, w0: c.w0, timeRule: y.timeRule, cells });
  }
  for (const x of c.references) {
    const rx = new CarrierIndex();
    if (x.earlier.length) rx.add(x.earlier.map(fromHex), 1);
    const cells = [];
    for (const cell of x.cells) {
      if (!her(h.state(cell, x.first, 'I', c.w0))) fail(`the cell ${cell} of the reference lineage ${x.id} is not heritable at ${x.first} by the census's test`);
      const out = {};
      for (const [name, k] of [['main', K], ['sensitivity', K_SENS]]) {
        const ch = chain(h, her, { cell, e: x.first, ph: 'I' }, c.w0, x.earlier.length ? rx : null, k);
        const res = slim(ch);
        if (ch.end === 'birth') res.states = statesOf(ch.cell, ch.epoch, ch.step);
        res.hops = ch.hops.map((z) => ({ ...slim(z), ...(z.kind === 'inherited' ? { states: statesOf(z.cell, z.epoch, z.step) } : {}) }));
        out[name] = res;
      }
      cells.push({ cell, chains: out });
    }
    emit({ type: 'reference', id: x.id, census: c.epoch, w0: c.w0, first: x.first, rooted: x.rooted, cells });
  }
  h.clear();
  rss = Math.max(rss, process.memoryUsage().rss);
}
emit({ type: 'end', branch: ID, measuresChecked: checked, fingerprint: fp, checkpoints: cps.size, replays: stats.replays, replayedEpochs: stats.epochs,
  recordsChecked: stats.records, fetches: h.fetches(), heritabilityTests: her.tests(), secondsRun: tRun, seconds: (Date.now() - t0) / 1000, rssMB: Math.round(Math.max(rss, process.memoryUsage().rss) / 1048576) });
flush();
