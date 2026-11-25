// A within-world null for the fragment links (exploratory): the analysis fixed in the note (README.md), before computing.
//
//   node fase2/resultats/arrelament/nul-dins-mon/analisi.mjs [--check] > fase2/resultats/arrelament/nul-dins-mon/analisi-sortida.txt
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
const check = args.includes('--check');
if (args.length !== (check ? 1 : 0)) { console.error('usage: node analisi.mjs [--check]'); process.exit(2); }
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
out(`A within-world null for the fragment links: the note's analysis (exploratory). The analysis: ${codeVersion()}, ${process.version}.`);
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
if (check) { out('--check: all the data were read and are valid; no result is printed.'); process.exit(0); }

// substrings (also reversed), as the sensitivities note
const lcs = (a, b) => { let best = 0; const prev = new Uint8Array(b.length + 1), cur = new Uint8Array(b.length + 1); for (let i = 1; i <= a.length; i++) { for (let j = 1; j <= b.length; j++) { cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : 0; if (cur[j] > best) best = cur[j]; } prev.set(cur); cur.fill(0); } return best; };
const lcsBoth = (p, q) => Math.max(lcs(p, q), lcs(p, q.slice().reverse()));
const progs = (x) => (x.bytes ??= x.programs.map(fromHex));
const pairMemo = new Map();
const lin2 = (x, y) => { const a = `${x.bid}/${x.id}`, c = `${y.bid}/${y.id}`, k = a < c ? `${a}|${c}` : `${c}|${a}`; if (!pairMemo.has(k)) { let v = 0; for (const p of progs(x)) for (const q of progs(y)) v = Math.max(v, lcsBoth(p, q)); pairMemo.set(k, v); } return pairMemo.get(k); };
for (const b of B) for (const x of b.lineages) x.bid = b.id;
const best = (y, X) => X.reduce((v, x) => Math.max(v, lin2(y, x)), 0);
// the exact distribution of a sum of independent Bernoulli variables, and its upper tail
const poisBin = (ps) => { let d = [1]; for (const p of ps) { const n = new Array(d.length + 1).fill(0); for (let i = 0; i < d.length; i++) { n[i] += d[i] * (1 - p); n[i + 1] += d[i] * p; } d = n; } return d; };
const upper = (ps, k) => { const d = poisBin(ps); let s = 0; for (let i = k; i < d.length; i++) s += d[i]; return Math.min(1, s); };
const share = (k, n) => (n ? k / n : null);
const verdict = (c) => (c[0] === null ? 'cannot say' : c[0] > 1 ? 'above 1' : c[1] < 1 ? 'below 1' : 'contains 1');

// 1. Sequence
out('\n1. Sequence: two within-world controls and a label permutation');
out('   1a. Other arms of the same world: the longest substring of each failed appearance of an establishing branch with the dominant group of each other establishing arm');
for (const soup of ARMS) {
  const V = [];
  for (const b of est(soup)) for (const y of failed(b)) for (const o of B.filter((z) => z.world === b.world && z.soup !== soup && z.domRoot !== null)) V.push(best(y, domLin(o)));
  out(`   ${soup.padEnd(12)} ${V.length} pairs; the longest ${V.length ? Math.max(...V) : '—'} bytes; reaching ${THRESHOLDS.map((t) => `${t}: ${V.filter((v) => v >= t).length}`).join(', ')}`);
}
const crossAll = ARMS.flatMap((soup) => est(soup).flatMap((b) => failed(b).flatMap((y) => B.filter((z) => z.world === b.world && z.soup !== soup && z.domRoot !== null).map((o) => best(y, domLin(o))))));
const crossMax = crossAll.length ? Math.max(...crossAll) : null;
const crossSmallest = THRESHOLDS.find((t) => crossAll.every((v) => v < t)) ?? null;
out(`   The note's reading (1a): ${!crossAll.length ? 'no pair: no answer' : crossAll.every((v) => v < MAIN) ? `no pair reaches ${MAIN} bytes (the longest is ${crossMax}): the threshold holds within the world for pairs that cannot be descent` : `${crossAll.filter((v) => v >= MAIN).length} pairs reach ${MAIN} bytes (the longest is ${crossMax}): it does not; the smallest threshold of the note that none reaches is ${crossSmallest ?? 'none of them'}`}`);

out('   1b. Within the branch: every failed appearance of a tracked branch and each of its available groups (the representative: the oldest earlier live robust lineage)');
const pairs = [];   // { soup, world, isD, v }
for (const b of B.filter((x) => x.tracked)) for (const y of failed(b)) for (const g of available(b, y)) pairs.push({ soup: b.soup, world: b.world, isD: g.isD, v: lin2(y, g.rep) });
// the share of the pairs that reach t, from per-world counts, so that the bootstrap only sums them
const rate = (P, isD, t) => { const per = new Map(); for (const p of P) if (p.isD === isD) { const c = per.get(p.world) ?? [0, 0]; c[1]++; if (p.v >= t) c[0]++; per.set(p.world, c); } return (ws) => { let k = 0, n = 0; for (const w of ws) { const c = per.get(w); if (c) { k += c[0]; n += c[1]; } } return share(k, n); }; };
const f8 = {};
for (const soup of ARMS) {
  const P = pairs.filter((p) => p.soup === soup), PD = P.filter((p) => p.isD), PC = P.filter((p) => !p.isD);
  out(`   ${soup}: ${PD.length} pairs with the dominant group, ${PC.length} with control groups; the longest substring with a control group ${PC.length ? Math.max(...PC.map((p) => p.v)) : '—'} bytes`);
  for (const t of THRESHOLDS) {
    const kD = PD.filter((p) => p.v >= t).length, kC = PC.filter((p) => p.v >= t).length;
    const cD = PD.length ? bootstrap(cohort, rate(P, true, t), BOOTSTRAP) : [null, null], cC = PC.length ? bootstrap(cohort, rate(P, false, t), BOOTSTRAP) : [null, null];
    out(`      t = ${String(t).padEnd(2)}  with the dominant group ${kD} of ${PD.length} (${f(share(kD, PD.length))} ${ci(cD)}); with control groups, f_t = ${kC} of ${PC.length} (${f(share(kC, PC.length))} ${ci(cC)})`);
    if (t === MAIN) f8[soup] = share(kC, PC.length);
  }
}
const fA = f8.continue;
out(`   The note's reading (1b, the aged soup): ${fA === null ? 'no control pair: no answer' : fA <= 0.10 ? `f_8 = ${f(fA)}: 8 bytes rarely links never-united groups of the same branch` : fA >= 0.33 ? `f_8 = ${f(fA)}: 8 bytes often links never-united groups of the same branch, and it is not calibrated within the world` : `f_8 = ${f(fA)}: in between, partly`}`);

out('   1c. The label permutation: the informative appearances (with the dominant group and a control group available), and the dominant label drawn uniformly among the available groups');
let main1c = null;
for (const soup of ARMS) {
  const I = est(soup).flatMap((b) => failed(b).map((y) => ({ b, y, G: available(b, y) }))).filter((z) => z.G.some((g) => g.isD) && z.G.some((g) => !g.isD));
  if (!I.length) { out(`   ${soup.padEnd(12)} no informative appearance`); continue; }
  for (const [lab, link] of [['the representative', (y, g) => lin2(y, g.rep)], ['the group link (all lineages)', (y, g) => best(y, g.X)]]) {
    for (const t of THRESHOLDS) {
      const T = I.filter((z) => link(z.y, z.G.find((g) => g.isD)) >= t).length;
      const ps = I.map((z) => z.G.filter((g) => link(z.y, g) >= t).length / z.G.length);
      const p = upper(ps, T), E = ps.reduce((s, x) => s + x, 0);
      out(`   ${soup.padEnd(12)} ${lab}, t = ${String(t).padEnd(2)}: ${I.length} informative; T = ${T} linked to the dominant group; under the null ${f(E)} expected; p = P(T* >= T) = ${pf(p)}`);
      if (soup === 'continue' && lab === 'the representative' && t === MAIN) main1c = { n: I.length, T, E, p, groups: I.map((z) => z.G.length) };
    }
  }
}
const v1c = main1c === null || main1c.n < MIN_INFORMATIVE ? 'indeterminate' : main1c.p <= 0.05 ? 'singles out' : 'does not';
out(`   The note's reading (1c, the main test): ${main1c === null ? 'no informative appearance in the aged soup: indeterminate'
  : `${main1c.n} informative appearances (available groups: ${main1c.groups.join(', ')}); ` + (v1c === 'indeterminate' ? `fewer than ${MIN_INFORMATIVE}: indeterminate`
  : v1c === 'singles out' ? `p = ${pf(main1c.p)}: the sequence link singles out the dominant group within the world`
  : `p = ${pf(main1c.p)}: it does not, at this power; within the branch the sequence link is about as frequent with other groups, and it is weaker evidence of fragments than the sensitivities note read`)}`);

// 2. Place: the spatial null
out('\n2. Place: the failed appearances moved by every rigid translation that keeps them inside the world, with the dominant group\'s sources fixed');
const cellsAt = (b, x, e) => [...(b.census.get(e)?.get(x.id) ?? []), ...(x.first === e ? x.cells : [])];
const near = (A, Bc) => { for (const a of A) { const ax = a % W, ay = (a / W) | 0; for (const c of Bc) if (Math.abs(ax - (c % W)) <= PLACE && Math.abs(ay - ((c / W) | 0)) <= PLACE) return true; } return false; };
const mask = (Bc) => { const g = new Uint8Array(W * H); for (const c of Bc) { const cx = c % W, cy = (c / W) | 0; for (let y = Math.max(0, cy - PLACE); y <= Math.min(H - 1, cy + PLACE); y++) for (let x = Math.max(0, cx - PLACE); x <= Math.min(W - 1, cx + PLACE); x++) g[y * W + x] = 1; } return g; };
const translated = (cells, Bc) => {
  const g = mask(Bc), xs = cells.map((c) => c % W), ys = cells.map((c) => (c / W) | 0);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  let hit = 0, all = 0;
  for (let dy = -y0; dy <= H - 1 - y1; dy++) for (let dx = -x0; dx <= W - 1 - x1; dx++) {
    all++;
    for (let i = 0; i < xs.length; i++) if (g[(ys[i] + dy) * W + xs[i] + dx]) { hit++; break; }
  }
  return hit / all;
};
const placeNull = new Map();   // `${branch}|${id}` -> { P, p, S, T }
for (const soup of ARMS) {
  const R = [];
  for (const b of est(soup)) {
    const D = domLin(b);
    for (const y of failed(b)) {
      const e = y.first, src = D.filter((x) => x.id !== y.id && before(x, y) && alive(x, e));
      const Bc = src.flatMap((x) => cellsAt(b, x, e));
      const r = { P: Bc.length ? near(y.cells, Bc) : false, p: Bc.length ? translated(y.cells, Bc) : 0, S: src.some((x) => lin2(y, x) >= MAIN), T: b.ev.epoch - y.first <= TIME, src: src.length > 0 };
      placeNull.set(`${b.id}|${y.id}`, r);
      R.push(r);
    }
  }
  const Q = R.filter((r) => r.src), obs = Q.filter((r) => r.P).length, ps = Q.map((r) => r.p);
  out(`   ${soup.padEnd(12)} ${Q.length} appearances with sources; place links observed ${obs}; expected under the null ${f(ps.reduce((s, x) => s + x, 0))}; P(count >= ${obs}) = ${pf(Q.length ? upper(ps, obs) : null)}; p_y: median ${f([...ps].sort((a, c) => a - c)[(ps.length - 1) >> 1] ?? null, 3)}, min ${f(ps.length ? Math.min(...ps) : null, 3)}, max ${f(ps.length ? Math.max(...ps) : null, 3)}`);
  if (soup === 'continue') counts.placeAged = { obs, p: Q.length ? upper(ps, obs) : null };
}
{
  const R = est('continue').flatMap((b) => failed(b).map((y) => placeNull.get(`${b.id}|${y.id}`))).filter((r) => r.T);
  const obs = R.filter((r) => r.S || r.P).length, ps = R.map((r) => (r.S ? 1 : r.p));
  out(`   The agreement under this null (the aged soup, descriptive): of the ${R.length} the time rule removes, ${obs} are linked by sequence or place; with the sequence as observed and place from the null, ${f(ps.reduce((s, x) => s + x, 0))} expected; P(>= ${obs}) = ${pf(upper(ps, obs))}`);
}
const v2 = counts.placeAged.p !== null && counts.placeAged.p <= 0.05;
out(`   The note's reading (2): ${counts.placeAged.p === null ? 'no appearance with sources: no answer' : v2 ? `P = ${pf(counts.placeAged.p)}: the place links are more than the same appearances placed uniformly would give; place is evidence at the level of the set` : `P = ${pf(counts.placeAged.p)}: they are not; place is no evidence beyond a uniform placement`}`);
out(`   The reading of "cannot be separated from fragmentation": ${v1c === 'indeterminate' && !v2 ? 'the main test is indeterminate, and place adds nothing beyond chance: the within-world null cannot be built well enough with these records'
  : v1c === 'singles out' && v2 ? 'both within-world nulls are beaten: the agreement stands against both'
  : v1c === 'singles out' ? 'it stands on the sequence'
  : v2 ? (v1c === 'indeterminate' ? 'the main test is indeterminate; it stands on place alone' : 'it stands on place alone')
  : 'neither null is beaten: it weakens, and the aged soup\'s excess of failed appearances is a more open question'}`);

// 3. The whole graph, at every threshold
out('\n3. The whole graph, at every threshold (the sensitivities note\'s definitions: all the dominant group\'s lineages earlier and alive)');
const robustOf = (b) => b.lineages.filter((x) => x.robust);
const linkOf = (b, y, t) => {
  const e = y.first, src = domLin(b).filter((x) => x.id !== y.id && before(x, y) && alive(x, e));
  return { T: b.ev.epoch - y.first <= TIME, S: src.some((x) => lin2(y, x) >= t), P: src.some((x) => near(y.cells, cellsAt(b, x, e))) };
};
// the graph of a branch: union groups contracted, candidate edges (sequence at t, place) between earlier live robust lineages
const graph = (b, t, and) => {
  const X = robustOf(b), roots = [...new Set(X.map((x) => x.root))], idx = new Map(roots.map((r, i) => [r, i]));
  const edges = [];
  let possible = 0;
  for (const y of X) for (const x of X) {
    if (x === y || !before(x, y) || !alive(x, y.first)) continue;
    possible++;
    const s = lin2(y, x) >= t, p = near(y.cells, cellsAt(b, x, y.first));
    if (and ? s && p : s || p) edges.push([idx.get(x.root), idx.get(y.root)]);
  }
  return { X, roots, idx, edges, possible };
};
const components = (n, E) => { const par = Array.from({ length: n }, (_, i) => i); const find = (i) => { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; }; for (const [a, c] of E) { const r1 = find(a), r2 = find(c); if (r1 !== r2) par[r1] = r2; } return Array.from({ length: n }, (_, i) => find(i)); };
const bridges = (n, E) => {   // Tarjan, on a multigraph (parallel edges are never bridges); self-loops ignored
  const adj = Array.from({ length: n }, () => []);
  E.forEach(([a, c], i) => { if (a !== c) { adj[a].push([c, i]); adj[c].push([a, i]); } });
  const tin = new Array(n).fill(-1), low = new Array(n).fill(0), out2 = new Set();
  let timer = 0;
  const dfs = (v, pe) => { tin[v] = low[v] = timer++; for (const [u, i] of adj[v]) { if (i === pe) continue; if (tin[u] >= 0) low[v] = Math.min(low[v], tin[u]); else { dfs(u, i); low[v] = Math.min(low[v], low[u]); if (low[u] > tin[v]) out2.add(i); } } };
  for (let v = 0; v < n; v++) if (tin[v] < 0) dfs(v, -1);
  return out2;
};
const failedFamilies = (b, g, E) => {
  const comp = components(g.roots.length, E), byC = new Map();
  for (const x of g.X) { const c = comp[g.idx.get(x.root)]; if (!byC.has(c)) byC.set(c, []); byC.get(c).push(x); }
  return [...byC.values()].filter((c) => !c.some((x) => x.rooted) && Math.min(...c.map((x) => x.first)) <= start + b.exposure).length;
};
const lam = (ws, soup, cnt) => { let k = 0, e = 0; for (const x of ws) { k += cnt(x[soup]); e += x[soup].exposure; } return e ? (1000 * k) / e : null; };
const rq = (cnt, soup = 'continue') => (ws) => { const a = lam(ws, soup, cnt), r = lam(ws, 'reinit', cnt); return a !== null && r ? a / r : null; };
// each rule's count per branch, computed once (the bootstrap only sums them)
const memo = (cnt) => { const c = new Map(); return (b) => { if (!c.has(b.id)) c.set(b.id, cnt(b)); return c.get(b.id); }; };
const ruleLine = (name, cnt0) => {
  const cnt = memo(cnt0);
  const n = ARMS.map((s) => B.filter((b) => b.soup === s).reduce((tt, b) => tt + cnt(b), 0));
  const c = bootstrap(wb, rq(cnt), BOOTSTRAP);
  out(`      ${name.padEnd(34)} ${n.join(', ')}; aged/fresh ${f(rq(cnt)(wb))} ${ci(c)} (${verdict(c)})`);
};
const countRule = (rm, t) => (b) => failed(b).filter((y) => !(b.domRoot !== null && rm(linkOf(b, y, t)))).length;
out('   R0 and R1 do not depend on the threshold (counts aged, shuffled, fresh; the aged/fresh ratio per 1,000 world-epochs):');
ruleLine('R0 none', countRule(() => false, MAIN));
ruleLine('R1 time', countRule((l) => l.T, MAIN));
const gcache = new Map();
const G = (b, t, and) => { const k = `${b.id}|${t}|${and}`; if (!gcache.has(k)) gcache.set(k, graph(b, t, and)); return gcache.get(k); };
for (const t of THRESHOLDS) {
  out(`   t = ${t}`);
  ruleLine(`R3 sequence`, countRule((l) => l.S, t));
  ruleLine(`R5 time, sequence or place`, countRule((l) => l.T || l.S || l.P, t));
  ruleLine(`R5∧ sequence and place`, countRule((l) => l.S && l.P, t));
  ruleLine(`R6 candidate families`, (b) => (b.tracked ? failedFamilies(b, G(b, t, false), G(b, t, false).edges) : 0));
  ruleLine(`R6∧ (edges by sequence and place)`, (b) => (b.tracked ? failedFamilies(b, G(b, t, true), G(b, t, true).edges) : 0));
  ruleLine(`R6 without the bridges`, (b) => { if (!b.tracked) return 0; const g = G(b, t, false), br = bridges(g.roots.length, g.edges); return failedFamilies(b, g, g.edges.filter((_, i) => !br.has(i))); });
  const Ls = est('continue').flatMap((b) => failed(b).map((y) => linkOf(b, y, t))), TT = Ls.filter((l) => l.T);
  out(`      the agreement (aged): of the ${TT.length} the time rule removes, ${TT.filter((l) => l.S || l.P).length} linked by sequence or place (sequence ${TT.filter((l) => l.S).length}, place ${TT.filter((l) => l.P).length})`);
  for (const soup of ARMS) {
    let edges = 0, possible = 0, comps = 0, br = 0;
    for (const b of B.filter((x) => x.soup === soup && x.tracked)) { const g = G(b, t, false); edges += g.edges.length; possible += g.possible; comps += new Set(components(g.roots.length, g.edges)).size; br += bridges(g.roots.length, g.edges).size; }
    out(`      the graph, ${soup}: ${edges} edges of ${possible} possible pairs (density ${f(share(edges, possible), 3)}); ${comps} components; ${br} bridges`);
  }
}
out(`   Leave one world out (t = ${MAIN}; the aged/fresh ratio; each with its own bootstrap):`);
const LOWO = [['R0', countRule(() => false, MAIN)], ['R1', countRule((l) => l.T, MAIN)], ['R5', countRule((l) => l.T || l.S || l.P, MAIN)],
  ['R6', (b) => (b.tracked ? failedFamilies(b, G(b, MAIN, false), G(b, MAIN, false).edges) : 0)]];
for (const [name, cnt0] of LOWO) {
  const cnt = memo(cnt0);
  const full = verdict(bootstrap(wb, rq(cnt), BOOTSTRAP));
  let lo = Infinity, hi = -Infinity, changed = 0;
  const which = [];
  for (let i = 0; i < wb.length; i++) {
    const ws = wb.filter((_, j) => j !== i), v = rq(cnt)(ws);
    if (v !== null) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
    const vv = verdict(bootstrap(ws, rq(cnt), BOOTSTRAP));
    if (vv !== full) { changed++; which.push(`${cohort[i]} (${vv})`); }
  }
  out(`      ${name}: the full verdict ${full}; the point estimate from ${f(lo)} to ${f(hi)}; ${changed} of ${wb.length} leave-outs change the verdict${which.length ? `: ${which.join(', ')}` : ''}`);
}
