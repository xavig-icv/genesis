// The test tube (exploratory; the note, README.md): the programs it tests, chosen from git before any test.
//
//   node fase2/resultats/arrelament/proveta/programes.mjs > fase2/resultats/arrelament/proveta/programes.json
//
// - the planted genotypes G1 to G4, from the pilot's manifest;
// - the founders: for each part-B branch with an establishment, the dominant group at the confirmation (half or more of the inert census's
//   heritable cells, the pilot's rule), and its oldest lineage (the root, by the tracking's joins up to then); its programs at first
//   detection, the first PROGRAMS_CAP in the tracking's order;
// - the natural lineages that did not become established (question 5): the robust lineages (heritable in ANALYSIS.robust or more of the
//   100 retest conditions with inert partners) that are not of the dominant group and were detected before the branch's end or event,
//   without the probable fragments (10 bytes or more in common, also reversed, with an initial program of the dominant group of their
//   branch); the first PROGRAMS_CAP programs. The same rules as the extinction note (../extincions/analisi.mjs, question 4).
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ANALYSIS } from '../../../../eines/arrelament-analisi.mjs';
import { DESIGN } from '../../../../eines/arrelament.mjs';
import { conditions, testInert, fromHex, INERT_CONDITIONS_SEED } from '../../../../fase2/inert.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { ROOT, PILOT, LINEAGES, SOUPS, PLANTED, PROGRAMS_CAP, sha256, readJsonl } from './comu.mjs';

if (process.argv.length !== 2) { console.error('usage: node programes.mjs > programes.json'); process.exit(2); }
const start = DESIGN.age;
const manifestText = readFileSync(join(ROOT, PILOT, 'manifest.json'));
const m = JSON.parse(manifestText);
const cohort = m.worlds.filter((w) => w.included).map((w) => w.world);
const fail = (msg) => { console.error(msg); process.exit(1); };

const planted = PLANTED.map((id) => {
  const hex = m.genotypes[id];
  if (typeof hex !== 'string' || hex.length !== 128) fail(`the manifest has no 64-byte genotype ${id}`);
  return { id, programs: [hex] };
});

const retest = conditions(INERT_CONDITIONS_SEED, ANALYSIS.retest.from + ANALYSIS.retest.count).slice(ANALYSIS.retest.from);
const cache = new Map();
const score = (hex) => {
  if (!cache.has(hex)) {
    const s = testInert(fromHex(hex), retest);
    let k = 0;
    for (let i = 0; i < s.heritableSolo.length; i++) if (s.heritableSolo[i] === '1' || s.heritableContext[i] === '1') k++;
    cache.set(hex, k);
  }
  return cache.get(hex);
};
const lcs = (a, b) => { let best = 0; const prev = new Uint8Array(b.length + 1), cur = new Uint8Array(b.length + 1); for (let i = 1; i <= a.length; i++) { for (let j = 1; j <= b.length; j++) { cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : 0; if (cur[j] > best) best = cur[j]; } prev.set(cur); cur.fill(0); } return best; };
const lcsBoth = (p, q) => Math.max(lcs(p, q), lcs(p, q.slice().reverse()));

const founders = [], others = [];
const counts = { branches: 0, tracked: 0, establishing: 0, noDominant: 0, robustFailed: 0, fragments: 0 };
for (const b of m.branches.filter((x) => x.part === 'B' && cohort.includes(x.world) && SOUPS.includes(x.soup))) {
  counts.branches++;
  const rec = readJsonl(join(ROOT, PILOT, 'part-b', `${b.id}.jsonl`));
  if (rec[0].type !== 'start' || rec.at(-1).type !== 'end') fail(`${b.id}: the record is not complete`);
  const ev = rec.find((l) => l.type === 'event') ?? null, end = rec.at(-1);
  const file = join(ROOT, LINEAGES, 'seguiments', `${b.id}.jsonl`);
  if (!existsSync(file)) { if (ev) fail(`${b.id}: an establishment without a tracking`); continue; }
  counts.tracked++;
  const L = readJsonl(file);
  if (L[0].type !== 'start' || L.at(-1).type !== 'end') fail(`${b.id}: the tracking is not complete`);
  const lin = new Map(), parent = new Map();
  const root = (id) => { while (parent.has(id)) id = parent.get(id); return id; };
  let domRoot = null;
  for (const l of L) {
    if (l.type === 'new') lin.set(l.id, { id: l.id, first: l.epoch, programs: l.programs });
    if (l.type === 'census') {
      for (const [young, old] of l.joins) parent.set(young, old);
      if (ev && l.epoch === ev.confirmed) for (const [rid, k] of Object.entries(l.groups)) if (l.heritable > 0 && k >= ANALYSIS.dominance * l.heritable) domRoot = root(rid);
    }
  }
  const exposure = (ev ? ev.epoch : end.epoch) - start;
  const all = [...lin.values()].map((x) => ({ ...x, root: root(x.id) }));
  const dominant = all.filter((x) => domRoot !== null && x.root === domRoot);
  if (ev) {
    counts.establishing++;
    if (domRoot === null || !lin.has(domRoot)) counts.noDominant++;
    else {
      const f = lin.get(domRoot);
      founders.push({ id: `F:${b.id}`, branch: b.id, world: b.world, soup: b.soup, lineage: f.id, first: f.first, event: ev.epoch,
        programs: f.programs.slice(0, PROGRAMS_CAP) });
    }
  }
  const domPrograms = dominant.flatMap((x) => x.programs.map(fromHex));
  for (const x of all) {
    if (domRoot !== null && x.root === domRoot) continue;
    if (x.first > start + exposure || Math.max(...x.programs.map(score)) < ANALYSIS.robust) continue;
    counts.robustFailed++;
    const progs = x.programs.map(fromHex);
    let shared = 0;
    for (const p of progs) for (const q of domPrograms) shared = Math.max(shared, lcsBoth(p, q));
    if (shared >= 10) { counts.fragments++; continue; }
    others.push({ id: `L:${b.id}:${x.id}`, branch: b.id, world: b.world, soup: b.soup, lineage: x.id, first: x.first,
      programs: x.programs.slice(0, PROGRAMS_CAP) });
  }
}
console.log(JSON.stringify({ type: 'programs', code: codeVersion(), node: process.version, manifestSha256: sha256(manifestText),
  cap: PROGRAMS_CAP, counts, planted, founders, others }, null, 1));
