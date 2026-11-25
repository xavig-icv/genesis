// A within-world null for the fragment links (exploratory): a post hoc check, after reading the output (README.md, "Everything tried").
// The same data, checks and definitions as analisi.mjs (its code, copied up to the pair counts), then only: where the control pairs of 1b
// come from in the aged soup, per world and branch, and how many reach 8 bytes.
//
//   node fase2/resultats/arrelament/nul-dins-mon/posthoc-mons.mjs > fase2/resultats/arrelament/nul-dins-mon/posthoc-mons-sortida.txt
//
// It reads only data in git: the natural-lineage trackings of the lineage note (with their records and checks) and the part-B records of the
// pilot, validated more strictly than the sensitivities note did (AU2-205). If anything is missing or impossible, it analyses nothing. With
// --check, it validates the data and prints only the counts of what it read and of the pairs each control has: no link and no substring
// (the short test). The world is the unit: the bootstrap resamples whole worlds.
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { bootstrap, ANALYSIS } from '../../../../eines/arrelament-analisi.mjs';
import { DESIGN } from '../../../../eines/arrelament.mjs';
import { conditions, testInert, fromHex, INERT_CONDITIONS_SEED } from '../../../../fase2/inert.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..', '..');
const PILOT = 'fase2/resultats/arrelament/pilot', LINEAGES = 'fase2/resultats/arrelament/llinatges';
const ARMS = ['continue', 'shuffle-all', 'reinit'];
// the note: the bootstrap over worlds (10,000 resamples, a seed of no plan), the thresholds, the place and time rules
const BOOTSTRAP = { count: 10000, seed: 3100000000 };
const THRESHOLDS = [8, 9, 10, 12, 16], MAIN = 8, PLACE = 8, TIME = 1250, MIN_INFORMATIVE = 8;
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const readJsonl = (file) => readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l));

const args = process.argv.slice(2);
if (args.length) { console.error('usage: node posthoc-mons.mjs'); process.exit(2); }
const start = DESIGN.age;
const out = (s = '') => console.log(s);
const f = (x, k = 2) => (x === null || x === undefined || !Number.isFinite(x) ? '—' : x.toFixed(k));
const ci = ([lo, hi], k = 2) => `[${f(lo, k)}, ${f(hi, k)}]`;
const pf = (p) => (p === null ? '—' : p < 0.0001 ? p.toExponential(2) : p.toFixed(4));
const isN = (x) => Number.isSafeInteger(x) && x >= 0;
const problems = [];

// 0. The data, complete and consistent
const m = JSON.parse(readFileSync(join(ROOT, PILOT, 'manifest.json'), 'utf8'));
const cohort = m.worlds.filter((w) => w.included).map((w) => w.world);
const [W, H] = m.params.world;
const PBr = m.branches.filter((b) => b.part === 'B' && ARMS.includes(b.soup));
if (PBr.length !== cohort.length * ARMS.length) problems.push(`the manifest has ${PBr.length} part-B branches of the three soups`);
const recB = new Map();
for (const b of PBr) {
  const file = join(ROOT, PILOT, 'part-b', `${b.id}.jsonl`);
  if (!existsSync(file)) { problems.push(`${b.id}: no part-B record`); continue; }
  let rec;
  try { rec = readJsonl(file); } catch { problems.push(`${b.id}: the part-B record is not valid JSONL`); continue; }
  if (rec[0].type !== 'start' || rec.at(-1).type !== 'end' || String(rec[0].code) !== String(m.code) || String(rec[0].code).includes('+')) { problems.push(`${b.id}: the part-B record is not complete, or not of the manifest's commit`); continue; }
  recB.set(b.id, rec);
}
// the tracked branches: exactly the part-B branches with an inert census that finds a heritable cell, in the manifest's order
const list = readFileSync(join(ROOT, LINEAGES, 'llista.txt'), 'utf8').trim().split('\n').map((l) => l.split(' ')[0]);
const expected = PBr.filter((b) => recB.get(b.id)?.some((l) => l.type === 'inert' && l.heritable > 0)).map((b) => b.id);
if (JSON.stringify(list) !== JSON.stringify(expected)) problems.push(`llista.txt is not the part-B branches with a heritable cell in the inert census, in the manifest's order (${list.length} against ${expected.length})`);
const seg = new Map();
for (const id of list) {
  const b = PBr.find((x) => x.id === id), rec = recB.get(id);
  const s = join(ROOT, LINEAGES, 'seguiments', `${id}.jsonl`), r = join(ROOT, LINEAGES, 'simulacio', `${id}.jsonl`), c = join(ROOT, LINEAGES, 'comparacio', `${id}.txt`);
  if (!b || !rec) { problems.push(`${id}: not a part-B branch with a record`); continue; }
  if (!existsSync(s) || !existsSync(r) || !existsSync(c) || !readFileSync(c, 'utf8').includes(`${id}: hi coincideix`)) { problems.push(`${id}: the tracking, its record or its check is missing`); continue; }
  let L;
  try { L = readJsonl(s); } catch { problems.push(`${id}: the tracking is not valid JSONL`); continue; }
  const S = L[0], ev = rec.find((l) => l.type === 'event') ?? null;
  if (S.type !== 'start' || L.at(-1).type !== 'end' || S.record?.sha256 !== sha256(readFileSync(r))) { problems.push(`${id}: the tracking is not complete or not of its record`); continue; }
  if (S.branch !== id || String(S.world) !== String(b.world) || S.soup !== b.soup || S.start !== start || S.end !== rec.at(-1).epoch
    || S.event !== (ev ? ev.epoch : null) || S.confirmed !== (ev ? ev.confirmed : null)) { problems.push(`${id}: the tracking's start line does not match the manifest and the part-B record`); continue; }
  const inert = new Map(rec.filter((l) => l.type === 'inert').map((l) => [l.epoch, l]));
  const news = new Map(), bad = [];
  for (const l of L.slice(1, -1)) {
    if (l.type === 'new') {
      if (news.has(l.id) || !/^\d+:\d+$/.test(l.id) || Number(l.id.split(':')[0]) !== l.epoch || !Array.isArray(l.programs) || !Array.isArray(l.cells) || !l.programs.length
        || l.programs.length !== l.cells.length || l.programs.some((p) => !/^[0-9a-f]{128}$/.test(p)) || new Set(l.cells).size !== l.cells.length
        || l.cells.some((x) => !isN(x) || x >= W * H)) bad.push(`new ${l.id}`);
      news.set(l.id, l);
    } else if (l.type === 'census') {
      const i = inert.get(l.epoch);
      const cells = Array.isArray(l.cells) ? l.cells : [];
      const created = (l.created ?? []).flatMap((x) => news.get(x)?.cells ?? [null]).sort((p, q) => p - q);
      const empty = cells.filter((x) => Array.isArray(x.lineages) && !x.lineages.length).map((x) => x.cell).sort((p, q) => p - q);
      if (!i || l.sample !== i.sample || l.heritable !== i.heritable || cells.length !== l.heritable || new Set(cells.map((x) => x.cell)).size !== cells.length
        || cells.some((x) => !isN(x.cell) || x.cell >= W * H || !Array.isArray(x.lineages) || x.lineages.some((y) => !news.has(y) || news.get(y).epoch > l.epoch))
        || (l.created ?? []).some((x) => !news.has(x) || news.get(x).epoch !== l.epoch) || JSON.stringify(created) !== JSON.stringify(empty)
        || !Array.isArray(l.joins) || l.joins.some(([a, o]) => !news.has(a) || !news.has(o) || !(Number(a.split(':')[1]) > Number(o.split(':')[1])))) bad.push(`census ${l.epoch}`);
    } else if (l.type === 'step') {
      if (!news.has(l.id) || l.epoch < news.get(l.id).epoch || !isN(l.M) || !isN(l.tested) || !isN(l.functional) || !isN(l.F)
        || l.functional > l.tested || l.tested > l.M || l.F > l.M) bad.push(`step ${l.id} ${l.epoch}`);
    } else bad.push(`a line of type ${l.type}`);
  }
  if (bad.length) { problems.push(`${id}: impossible lines (${bad.slice(0, 3).join('; ')}${bad.length > 3 ? '; …' : ''})`); continue; }
  seg.set(id, L);
}
out(`A within-world null for the fragment links: a post hoc check, after reading the output (exploratory). The check: ${codeVersion()}, ${process.version}.`);
out(`The part-B records: ${recB.size} of ${PBr.length} (of ${m.code}); the trackings: ${seg.size} of ${list.length} (the expected list: ${expected.length}).`);
if (problems.length) { out(`\nNothing is analysed: ${problems.length} problems.\n- ${problems.slice(0, 30).join('\n- ')}`); process.exit(1); }

// The lineages of each branch, as the sensitivities note's section 2
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
const B = PBr.map((b) => {
  const rec = recB.get(b.id), ev = rec.find((l) => l.type === 'event') ?? null, end = rec.at(-1);
  const r = { ...b, ev, exposure: (ev ? ev.epoch : end.epoch) - start, lineages: [], domRoot: null, census: new Map(), tracked: seg.has(b.id) };
  const L = seg.get(b.id);
  if (!L) return r;
  const lin = new Map(), parent = new Map(), steps = new Map();
  const root = (id) => { while (parent.has(id)) id = parent.get(id); return id; };
  for (const l of L) {
    if (l.type === 'new') lin.set(l.id, { id: l.id, first: l.epoch, k: Number(l.id.split(':')[1]), programs: l.programs, cells: l.cells });
    if (l.type === 'census') {
      for (const [young, old] of l.joins) parent.set(young, old);
      if (ev && l.epoch === ev.confirmed) for (const [rid, k] of Object.entries(l.groups)) if (l.heritable > 0 && k >= ANALYSIS.dominance * l.heritable) r.domRoot = root(rid);
      const byLin = new Map();
      for (const c of l.cells) for (const x of c.lineages) { if (!byLin.has(x)) byLin.set(x, []); byLin.get(x).push(c.cell); }
      r.census.set(l.epoch, byLin);
    }
    if (l.type === 'step') { if (!steps.has(l.id)) steps.set(l.id, []); steps.get(l.id).push(l); }
  }
  r.lineages = [...lin.values()].map((x) => ({ ...x, robust: Math.max(...x.programs.map(score)) >= ANALYSIS.robust, root: root(x.id), steps: steps.get(x.id) ?? [] }));
  for (const x of r.lineages) x.rooted = r.domRoot !== null && x.root === r.domRoot;
  return r;
});
const wb = cohort.map((w) => Object.fromEntries(ARMS.map((s) => [s, B.find((x) => x.world === w && x.soup === s)])));
const failed = (b) => b.lineages.filter((x) => x.robust && !x.rooted && x.first <= start + b.exposure);
const before = (x, y) => x.first < y.first || (x.first === y.first && x.k < y.k);
const alive = (x, e) => x.first <= e && x.steps.some((s) => s.epoch > e - 250 && s.epoch <= e && s.F >= 1);
const domLin = (b) => b.lineages.filter((x) => x.rooted);
const oldest = (X) => X.reduce((a, x) => (a === null || before(x, a) ? x : a), null);
// the available groups of y: the groups other than y's own with a robust lineage earlier than y and alive at its detection
const available = (b, y) => {
  const G = new Map();
  for (const x of b.lineages) {
    if (!x.robust || x === y || x.root === y.root || !before(x, y) || !alive(x, y.first)) continue;
    if (!G.has(x.root)) G.set(x.root, []);
    G.get(x.root).push(x);
  }
  return [...G.entries()].map(([root, X]) => ({ root, X, isD: root === b.domRoot, rep: oldest(X) }));
};
const est = (soup) => B.filter((b) => b.soup === soup && b.domRoot !== null);

// the counts of each control's pairs (the short test prints only these)
const counts = {};
for (const soup of ARMS) {
  const E = est(soup);
  let crossPairs = 0, dPairs = 0, cPairs = 0, informative = 0, placeYs = 0;
  for (const b of E) for (const y of failed(b)) {
    crossPairs += B.filter((o) => o.world === b.world && o.soup !== soup && o.domRoot !== null).length;
    const G = available(b, y);
    if (G.some((g) => g.isD)) placeYs++;
    if (G.some((g) => g.isD) && G.some((g) => !g.isD)) informative++;
  }
  for (const b of B.filter((x) => x.soup === soup && x.tracked)) for (const y of failed(b)) for (const g of available(b, y)) { if (g.isD) dPairs++; else cPairs++; }
  counts[soup] = { crossPairs, dPairs, cPairs, informative, placeYs };
}
out(`The pairs of each control (no link computed): ${ARMS.map((s) => `${s}: 1a ${counts[s].crossPairs} pairs with other arms; 1b ${counts[s].dPairs} pairs with the dominant group and ${counts[s].cPairs} with control groups; 1c ${counts[s].informative} informative appearances; 2 ${counts[s].placeYs} appearances with an earlier live dominant lineage`).join('; ')}.`);

const lcs = (a, b) => { let best = 0; const prev = new Uint8Array(b.length + 1), cur = new Uint8Array(b.length + 1); for (let i = 1; i <= a.length; i++) { for (let j = 1; j <= b.length; j++) { cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : 0; if (cur[j] > best) best = cur[j]; } prev.set(cur); cur.fill(0); } return best; };
const lcsBoth = (p, q) => Math.max(lcs(p, q), lcs(p, q.slice().reverse()));
const progs = (x) => (x.bytes ??= x.programs.map(fromHex));
const pairMemo = new Map();
const lin2 = (x, y) => { const a = `${x.bid}/${x.id}`, c = `${y.bid}/${y.id}`, k = a < c ? `${a}|${c}` : `${c}|${a}`; if (!pairMemo.has(k)) { let v = 0; for (const p of progs(x)) for (const q of progs(y)) v = Math.max(v, lcsBoth(p, q)); pairMemo.set(k, v); } return pairMemo.get(k); };
for (const b of B) for (const x of b.lineages) x.bid = b.id;
out('\nPost hoc: the control pairs of 1b in the aged soup (the representative), per world and branch');
const per = new Map();
for (const b of B.filter((x) => x.soup === 'continue' && x.tracked)) for (const y of failed(b)) for (const g of available(b, y)) {
  if (g.isD) continue;
  const k = `${b.world} ${b.domRoot !== null ? 'establishing' : 'not establishing'}`, c = per.get(k) ?? [0, 0];
  c[1]++; if (lin2(y, g.rep) >= MAIN) c[0]++; per.set(k, c);
}
for (const [k, [a, n]] of [...per.entries()].sort((p, q) => q[1][1] - p[1][1])) out(`   ${k}: ${a} of ${n} reach ${MAIN} bytes`);
out(`   ${per.size} worlds; the largest carries ${Math.max(...[...per.values()].map((c) => c[1]))} of ${[...per.values()].reduce((t, c) => t + c[1], 0)} pairs`);
