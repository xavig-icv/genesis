// The test tube (exploratory; the note, README.md): the programs of programes.json with partners drawn from the pilot's starting soups.
// It only reads the snapshots, and plants nothing in any world.
//
//   node fase2/resultats/arrelament/proveta/proveta.mjs PILOT-FOLDER [--worlds FIRST-LAST] > fase2/resultats/arrelament/proveta/proveta-FIRST-LAST.jsonl
//
// PILOT-FOLDER: the pilot folder of the pilot's computation copy, the one with alicuotes/NNNN/ARM.bin (not in git). Each snapshot must have
// the manifest's SHA-256. --worlds: the positions in the cohort, from 1 (by default, all 60).
// For each world, five pools: its three soups, and two made from the aged one (fixed: each cell whose first byte is ] or 0 gets the first
// byte of a random cell whose first byte is neither; placebo: as many cells whose first byte is neither get the first byte of another such
// cell). Each pool has CONDITIONS conditions: 8 partners drawn uniformly from its cells, the same for every program. The test is the
// census's (fase2/replication.js) with heredity, complete and bothRoles, as the inert test does, with the pool's cells instead of inert
// partners: in the first role (and the child's) a partner drawn from the pool, in the second the 8. The planted genotypes and the founders
// are tested against every pool; the natural lineages of question 5, only against their own soup of their own world.
import { readFileSync } from 'fs';
import { join } from 'path';
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { makeRng } from '../../../../fase1/soup.js';
import { replicationTest } from '../../../../fase2/replication.js';
import { fromHex, PARTNERS } from '../../../../fase2/inert.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { ROOT, PILOT, HERE, KINDS, CONDITIONS, CONDITIONS_SEED, TRANSFORM_SEED, BAD_FIRST, sha256, poolIndex } from './comu.mjs';

const args = process.argv.slice(2);
const src = args[0];
const range = args[1] === '--worlds' ? /^(\d+)-(\d+)$/.exec(args[2] ?? '') : null;
if (!src || !(args.length === 1 || (args.length === 3 && range))) { console.error('usage: node proveta.mjs PILOT-FOLDER [--worlds FIRST-LAST]'); process.exit(2); }
const t0 = Date.now();
const m = JSON.parse(readFileSync(join(ROOT, PILOT, 'manifest.json'), 'utf8'));
const cohort = m.worlds.filter((w) => w.included);
const [first, last] = range ? [Number(range[1]), Number(range[2])] : [1, cohort.length];
if (!(first >= 1 && last <= cohort.length && first <= last)) { console.error(`--worlds: from 1 to ${cohort.length}`); process.exit(2); }
const progText = readFileSync(join(ROOT, HERE, 'programes.json'));
const P = JSON.parse(progText);
if (P.type !== 'programs' || String(P.code).includes('+')) { console.error('programes.json is not a clean list of programs'); process.exit(1); }
const entries = [...P.planted.map((e) => ({ ...e, all: true })), ...P.founders.map((e) => ({ ...e, all: true })), ...P.others.map((e) => ({ ...e, all: false }))];
for (const e of entries) e.bytes = e.programs.map(fromHex);

console.log(JSON.stringify({ type: 'start', code: codeVersion(), node: process.version, programsSha256: sha256(progText), worlds: [first, last],
  conditions: CONDITIONS, partners: PARTNERS, seeds: { conditions: CONDITIONS_SEED, transform: TRANSFORM_SEED } }));
const N = PROGRAM_SIZE;
let tests = 0, worlds = 0;
for (let i = first - 1; i < last; i++) {
  const w = cohort[i], tw = Date.now();
  const load = (arm) => {
    const a = w.arms[arm];
    const buf = new Uint8Array(readFileSync(join(src, a.file.slice(PILOT.length + 1))));
    if (sha256(buf) !== a.sha256) { console.error(`${w.world} ${arm}: the snapshot does not have the manifest's SHA-256`); process.exit(1); }
    return buf;
  };
  const pools = { continue: load('continue'), 'shuffle-all': load('shuffle-all'), reinit: load('reinit') };
  // the fixed and placebo pools, from the aged soup
  const aged = pools.continue, n = aged.length / N;
  const good = [], goodFirst = [];
  for (let c = 0; c < n; c++) if (!BAD_FIRST.has(aged[c * N])) { good.push(c); goodFirst.push(aged[c * N]); }
  const fixed = aged.slice(), rf = makeRng((TRANSFORM_SEED + 2 * i) >>> 0, 'v2');
  let changed = 0;
  for (let c = 0; c < n; c++) if (BAD_FIRST.has(aged[c * N])) { fixed[c * N] = goodFirst[(rf() * goodFirst.length) | 0]; changed++; }
  const placebo = aged.slice(), rp = makeRng((TRANSFORM_SEED + 2 * i + 1) >>> 0, 'v2');
  const order = good.slice();
  for (let k = 0; k < changed; k++) {
    const j = k + ((rp() * (order.length - k)) | 0);
    [order[k], order[j]] = [order[j], order[k]];
    let o;
    do { o = (rp() * good.length) | 0; } while (good[o] === order[k]);
    placebo[order[k] * N] = goodFirst[o];
  }
  pools.fixed = fixed; pools.placebo = placebo;
  for (const kind of KINDS) {
    const pool = pools[kind], k = poolIndex(i, kind);
    const cell = (rng) => { const c = (rng() * n) | 0; return pool.slice(c * N, (c + 1) * N); };
    const conds = Array.from({ length: CONDITIONS }, (_, j) => {
      const rng = makeRng((CONDITIONS_SEED + 1000 * k + 2 * j) >>> 0, 'v2');
      return { partners: Array.from({ length: PARTNERS }, () => cell(rng)), testSeed: (CONDITIONS_SEED + 1000 * k + 2 * j + 1) >>> 0 };
    });
    for (const e of entries) {
      if (!e.all && !(e.world === w.world && e.soup === kind)) continue;
      e.bytes.forEach((bytes, p) => {
        const s = { solo: 0, hSolo: 0, context: 0, hContext: 0, heritable: 0 };
        for (const cond of conds) {
          const soup = new Uint8Array(N * (1 + PARTNERS));
          soup.set(bytes, 0);
          cond.partners.forEach((q, x) => soup.set(q, N * (1 + x)));
          const r = replicationTest(soup, 0, makeRng(cond.testSeed, 'v2'), { heredity: true, complete: true, bothRoles: true, soloPartner: cell });
          s.solo += r.solo ? 1 : 0; s.hSolo += r.heritableSolo ? 1 : 0; s.context += r.context ? 1 : 0; s.hContext += r.heritableContext ? 1 : 0;
          s.heritable += r.heritableSolo || r.heritableContext ? 1 : 0;
          tests++;
        }
        console.log(JSON.stringify({ type: 'test', entry: e.id, p, world: w.world, kind, n: CONDITIONS, ...s }));
      });
    }
  }
  worlds++;
  console.log(JSON.stringify({ type: 'world', world: w.world, position: i + 1, changed, seconds: (Date.now() - tw) / 1000 }));
}
console.log(JSON.stringify({ type: 'end', worlds, tests, seconds: (Date.now() - t0) / 1000 }));
