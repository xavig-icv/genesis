// The first-byte vulnerability of the natural establishments (exploratory; the note, README.md, the method): single encounters of each robust
// natural lineage's best first program, and of the four genotypes of the pilot, with real partners of the pilot's starting snapshots, sorted
// by their first byte. It plants nothing in any world and simulates no world: it only reads the snapshots.
//
//   node fase2/resultats/arrelament/vulnerables/vulnerables.mjs PILOT-FOLDER [--world NNNN] > fase2/resultats/arrelament/vulnerables/vulnerables.jsonl
//
// PILOT-FOLDER: the pilot folder of the pilot's computation copy, the one with alicuotes/NNNN/ARM.bin (not in git); each snapshot must have
// the manifest's SHA-256. --world: only that world (the short test). The lines: 'start'; 'lineage' (every lineage of the 52 trackings, its
// best first program and its retest score); 'partners' (the cells drawn in each world and soup); 'calibration' (a genotype against the aged
// partners of a world); 'test' (a robust lineage's program against the aged partners of its world, and, for the shuffled and the fresh
// soup, against the partners of its own soup); 'world'; and 'end'.
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { evaluate, PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { makeRng } from '../../../../fase1/soup.js';
import { windowsOf, hasWindow } from '../../../../fase2/replication.js';
import { conditions, testInert, heritable, fromHex, INERT_CONDITIONS, INERT_CONDITIONS_SEED } from '../../../../fase2/inert.js';
import { ANALYSIS } from '../../../../eines/arrelament-analisi.mjs';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { ROOT, PILOT, LINEAGES, ARMS, KINDS, kindOf, PER_KIND, PARTNER_SEED, partnerSeed, GENOTYPES, sha256, readJsonl } from './comu.mjs';

const args = process.argv.slice(2);
const src = args[0];
const only = args[1] === '--world' ? args[2] : null;
if (!src || !(args.length === 1 || (args.length === 3 && /^\d{4}$/.test(only ?? '')))) { console.error('usage: node vulnerables.mjs PILOT-FOLDER [--world NNNN]'); process.exit(2); }
const t0 = Date.now();
const m = JSON.parse(readFileSync(join(ROOT, PILOT, 'manifest.json'), 'utf8'));
const cohort = m.worlds.filter((w) => w.included);
if (only && !cohort.some((w) => w.world === only)) { console.error(`--world: ${only} is not in the cohort`); process.exit(2); }
const N = PROGRAM_SIZE;

// the lineages of the 52 trackings, each checked against its record and its check (as the extinction note does)
const list = readFileSync(join(ROOT, LINEAGES, 'llista.txt'), 'utf8').trim().split('\n').map((l) => l.split(' ')[0]);
if (list.length !== 52) { console.error(`llista.txt has ${list.length} branches, not 52`); process.exit(1); }
const branches = [];
for (const id of list) {
  const s = join(ROOT, LINEAGES, 'seguiments', `${id}.jsonl`), r = join(ROOT, LINEAGES, 'simulacio', `${id}.jsonl`), c = join(ROOT, LINEAGES, 'comparacio', `${id}.txt`);
  if (!existsSync(s) || !existsSync(r) || !existsSync(c) || !readFileSync(c, 'utf8').includes(`${id}: hi coincideix`)) { console.error(`${id}: the tracking, its record or its check is missing`); process.exit(1); }
  const L = readJsonl(s);
  if (L[0].type !== 'start' || L.at(-1).type !== 'end' || L[0].record.sha256 !== sha256(readFileSync(r))) { console.error(`${id}: the tracking is not complete or not of its record`); process.exit(1); }
  const b = m.branches.find((x) => x.id === id);
  if (!b || b.part !== 'B' || !ARMS.includes(b.soup)) { console.error(`${id}: not a part-B branch of the manifest`); process.exit(1); }
  branches.push({ id, world: b.world, soup: b.soup, lineages: L.filter((l) => l.type === 'new').map((l) => ({ id: l.id, first: l.epoch, programs: l.programs })) });
}

// the retest score of a program (the 100 retest conditions, as in the extinction note), and the best first program of each lineage
const retest = conditions(INERT_CONDITIONS_SEED, ANALYSIS.retest.from + ANALYSIS.retest.count).slice(ANALYSIS.retest.from);
const scores = new Map();
const score = (hex) => {
  if (!scores.has(hex)) {
    const s = testInert(fromHex(hex), retest);
    let k = 0;
    for (let i = 0; i < s.heritableSolo.length; i++) if (s.heritableSolo[i] === '1' || s.heritableContext[i] === '1') k++;
    scores.set(hex, k);
  }
  return scores.get(hex);
};

// the encounter (the note): the program first and the partner second, executed once, without mutations
const conds = conditions(INERT_CONDITIONS_SEED, INERT_CONDITIONS);
const tape = new Uint8Array(2 * N);
function profile(P, partners) {
  const W = windowsOf(P), out = {};
  for (const k of KINDS) {
    const r = { n: 0, c: 0, h: 0, keep: 0 };
    for (const q of partners[k]) {
      tape.set(P, 0); tape.set(q, N);
      evaluate(tape, 0);
      const half = tape.slice(N, 2 * N);
      r.n++;
      if (!hasWindow(half, W)) continue;
      r.c++;
      if (half[0] === q[0]) r.keep++;
      if (heritable(testInert(half, conds))) r.h++;
    }
    out[k] = r;
  }
  return out;
}

console.log(JSON.stringify({ type: 'start', code: codeVersion(), node: process.version, only, perKind: PER_KIND, partnerSeed: PARTNER_SEED,
  conditions: { seed: INERT_CONDITIONS_SEED, count: INERT_CONDITIONS }, retest: ANALYSIS.retest, robust: ANALYSIS.robust }));
const worldsDone = [];
let tests = 0;
for (let i = 0; i < cohort.length; i++) {
  const w = cohort[i];
  if (only && w.world !== only) continue;
  const tw = Date.now();
  // the partners of each soup of this world: PER_KIND of each kind, uniformly without replacement
  const partners = {};
  for (let a = 0; a < ARMS.length; a++) {
    const arm = w.arms[ARMS[a]];
    const buf = new Uint8Array(readFileSync(join(src, arm.file.slice(PILOT.length + 1))));
    if (sha256(buf) !== arm.sha256) { console.error(`${w.world} ${ARMS[a]}: the snapshot does not have the manifest's SHA-256`); process.exit(1); }
    const n = buf.length / N, pool = { ']': [], '0': [], other: [] };
    for (let c = 0; c < n; c++) pool[kindOf(buf[c * N])].push(c);
    const drawn = {}, P = {};
    KINDS.forEach((k, ki) => {
      const ids = pool[k].slice(), rng = makeRng(partnerSeed(i, a, ki), 'v2');
      if (ids.length < PER_KIND) { console.error(`${w.world} ${ARMS[a]}: only ${ids.length} cells start with ${k}`); process.exit(1); }
      for (let j = 0; j < PER_KIND; j++) { const r = j + ((rng() * (ids.length - j)) | 0); [ids[j], ids[r]] = [ids[r], ids[j]]; }
      drawn[k] = ids.slice(0, PER_KIND);
      P[k] = drawn[k].map((c) => buf.slice(c * N, (c + 1) * N));
    });
    partners[ARMS[a]] = P;
    console.log(JSON.stringify({ type: 'partners', world: w.world, soup: ARMS[a], available: Object.fromEntries(KINDS.map((k) => [k, pool[k].length])), cells: drawn }));
  }
  // the calibration: the four genotypes against the aged partners
  for (const g of GENOTYPES) {
    console.log(JSON.stringify({ type: 'calibration', world: w.world, genotype: g, counts: profile(fromHex(m.genotypes[g]), partners.continue) }));
    tests++;
  }
  // the lineages of this world's branches
  for (const b of branches.filter((x) => x.world === w.world)) {
    for (const x of b.lineages) {
      let best = null, s = -1;
      for (const hex of x.programs) { const k = score(hex); if (k > s) { s = k; best = hex; } }
      const robust = s >= ANALYSIS.robust;
      console.log(JSON.stringify({ type: 'lineage', branch: b.id, world: b.world, soup: b.soup, id: x.id, first: x.first, programs: x.programs.length, score: s, program: best, robust }));
      if (!robust) continue;
      const P = fromHex(best);
      console.log(JSON.stringify({ type: 'test', branch: b.id, world: b.world, soup: b.soup, id: x.id, partners: 'aged', counts: profile(P, partners.continue) }));
      tests++;
      if (b.soup !== 'continue') {
        console.log(JSON.stringify({ type: 'test', branch: b.id, world: b.world, soup: b.soup, id: x.id, partners: 'own', counts: profile(P, partners[b.soup]) }));
        tests++;
      }
    }
  }
  worldsDone.push(w.world);
  console.log(JSON.stringify({ type: 'world', world: w.world, position: i + 1, seconds: (Date.now() - tw) / 1000 }));
}
console.log(JSON.stringify({ type: 'end', worlds: worldsDone.length, tests, seconds: (Date.now() - t0) / 1000 }));
