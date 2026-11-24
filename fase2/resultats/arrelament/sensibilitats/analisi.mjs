// The neighbours within worlds, and a graph of candidate fragments (exploratory): the analysis fixed in the note (README.md), before computing.
//
//   node fase2/resultats/arrelament/sensibilitats/analisi.mjs [--check] > fase2/resultats/arrelament/sensibilitats/analisi-sortida.txt
//
// It reads only data in git: the part-A records of the pilot, the extinction note's first-byte scan, the natural-lineage trackings of the
// lineage note (with their records and checks) and the part-B records of the pilot. It requires all of them, complete; if anything is
// missing or impossible, it analyses nothing. With --check, it validates the data and prints only the counts of what it read, no result
// (the short test). The world is the unit: the bootstrap resamples whole worlds.
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { partA, bootstrap, ANALYSIS } from '../../../../eines/arrelament-analisi.mjs';
import { DESIGN } from '../../../../eines/arrelament.mjs';
import { conditions, testInert, fromHex, INERT_CONDITIONS_SEED } from '../../../../fase2/inert.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..', '..');
const PILOT = 'fase2/resultats/arrelament/pilot', LINEAGES = 'fase2/resultats/arrelament/llinatges', EXT = 'fase2/resultats/arrelament/extincions';
const ARMS = ['continue', 'shuffle-all', 'reinit'];
// the bootstrap over worlds (the note): 10,000 resamples, a seed of no plan
const BOOTSTRAP = { count: 10000, seed: 20261127 };
// the place rule (the note): at most 8 cells away (Chebyshev); the time rule: the 1,250 epochs before the establishment (auditor 1)
const PLACE = 8, TIME = 1250, R2_BYTES = 10;
// the scan's provenance (the extinction note)
const SCAN_CODE = 'fcec8bd9', BAD_FIRST = [0, 93];
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const readJsonl = (file) => readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l));

const args = process.argv.slice(2);
const check = args.includes('--check');
if (args.length !== (check ? 1 : 0)) { console.error('usage: node analisi.mjs [--check]'); process.exit(2); }
const d = DESIGN, start = d.age;
const out = (s = '') => console.log(s);
const f = (x, k = 2) => (x === null || x === undefined || !Number.isFinite(x) ? '—' : x.toFixed(k));
const ci = ([lo, hi], k = 2) => `[${f(lo, k)}, ${f(hi, k)}]`;
const pc = (x) => (x === null || !Number.isFinite(x) ? '—' : `${(100 * x).toFixed(1)}%`);
const median = (a) => { if (!a.length) return null; const s = [...a].sort((p, q) => p - q); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const isN = (x) => Number.isSafeInteger(x) && x >= 0;
const problems = [];

// 0. The data, complete
const m = JSON.parse(readFileSync(join(ROOT, PILOT, 'manifest.json'), 'utf8'));
const cohort = m.worlds.filter((w) => w.included).map((w) => w.world);
const [W, H] = m.params.world, RAD = m.params.radius;

// 0a. The part-A records of the aged soup, G1, G4 and G1 × 9, checked as the extinction note checks them
const A = m.branches.filter((b) => b.part === 'A' && b.soup === 'continue' && ['G1', 'G4', 'G1x9'].includes(b.variant));
if (A.length !== cohort.length * 3 * 4) problems.push(`the manifest has ${A.length} aged-soup part-A branches of G1, G4 and G1 × 9`);
const seeds = new Map();   // branch id -> { b, t, fn, first, outcome }
for (const b of A) {
  const file = join(ROOT, PILOT, 'part-a', `${b.id}.jsonl`);
  if (!existsSync(file)) { problems.push(`${b.id}: no record`); continue; }
  let L;
  try { L = readJsonl(file); } catch { problems.push(`${b.id}: the record is not valid JSONL`); continue; }
  if (!L.length || L[0].type !== 'start' || L.at(-1).type !== 'end' || String(L[0].code) !== String(m.code) || String(L[0].code).includes('+')) { problems.push(`${b.id}: the record is not complete, or not of the manifest's commit`); continue; }
  const desc = L[0].lineage, lin = L.filter((l) => l.type === 'lineage');
  if (!desc || desc.every !== 50 || !isN(desc.sample) || !lin.length || lin.some((l, i) => l.epoch !== start + 50 * i) || !lin.find((l) => l.epoch === start + 50)
    || lin.at(-1).epoch > L.at(-1).epoch || lin.at(-1).epoch + 50 <= L.at(-1).epoch) { problems.push(`${b.id}: the lineage lines are not one every 50 epochs to the end`); continue; }
  const bad = lin.find((l) => !isN(l.M) || !isN(l.tested) || !isN(l.copying) || !isN(l.functional) || !isN(l.F) || l.tested > l.M || l.copying > l.tested
    || l.functional > l.copying || l.F > l.M || l.tested !== (l.exhaustive ? l.M : Math.min(desc.sample, l.M)) || (l.exhaustive && l.M <= desc.sample)
    || l.F !== (l.tested ? Math.round((l.M * l.functional) / l.tested) : 0));
  if (bad) { problems.push(`${b.id}: an impossible lineage line at ${bad.epoch}`); continue; }
  const steps = lin.filter((l) => l.epoch >= start + 50 && l.epoch <= start + 250 && l.tested > 0);
  seeds.set(b.id, { b, t: steps.reduce((s, l) => s + l.tested, 0), fn: steps.reduce((s, l) => s + l.functional, 0), first: lin.find((l) => l.epoch === start + 50),
    outcome: partA(L, { start, horizon: d.horizonA }).outcome });
}
// 0b. The first-byte scan of the extinction note: the header, and one line per one-cell seed that matches the manifest and its cell
const pbFile = join(ROOT, EXT, 'primer-byte.jsonl');
const PB = existsSync(pbFile) ? readJsonl(pbFile) : null;
const scan = new Map();     // `${world}|${position}` -> bad neighbours of the aged-soup place
if (!PB || PB[0].type !== 'start' || PB.at(-1).type !== 'end' || PB[0].code !== SCAN_CODE || PB[0].only !== null || PB[0].radius !== RAD
  || JSON.stringify(PB[0].world) !== JSON.stringify([W, H]) || JSON.stringify([...PB[0].bad].sort((p, q) => p - q)) !== JSON.stringify(BAD_FIRST)) problems.push('primer-byte.jsonl is missing, not complete, or not the extinction note\'s scan');
else {
  for (const b of A.filter((x) => x.variant !== 'G1x9')) {
    const l = PB.find((x) => x.type === 'seed' && x.branch === b.id);
    const cell = JSON.parse(readFileSync(join(ROOT, b.plant), 'utf8')).cells[0];
    if (!l || l.world !== b.world || l.soup !== b.soup || l.variant !== b.variant || l.position !== b.position || l.cell !== cell || !isN(l.bad) || l.bad > l.neighbours || l.neighbours > 24) { problems.push(`primer-byte.jsonl: the seed ${b.id} is missing or does not match`); continue; }
    const k = `${b.world}|${b.position}`;
    if (scan.has(k) && scan.get(k) !== l.bad) problems.push(`primer-byte.jsonl: G1 and G4 of ${k} have other counts`);
    scan.set(k, l.bad);
  }
  // G1 × 9 is centred on the same cell (the descriptive of 1a)
  for (const b of A.filter((x) => x.variant === 'G1x9')) {
    const cells = JSON.parse(readFileSync(join(ROOT, b.plant), 'utf8')).cells;
    const g1 = A.find((x) => x.variant === 'G1' && x.world === b.world && x.position === b.position);
    const c1 = JSON.parse(readFileSync(join(ROOT, g1.plant), 'utf8')).cells[0];
    if (cells.length !== 9 || !cells.includes(c1)) problems.push(`${b.id}: G1 × 9 is not centred on G1's cell`);
  }
}
// 0c. The natural-lineage trackings, with their records and checks, and the part-B records
const list = readFileSync(join(ROOT, LINEAGES, 'llista.txt'), 'utf8').trim().split('\n').map((l) => l.split(' ')[0]);
const seg = new Map();
for (const id of list) {
  const s = join(ROOT, LINEAGES, 'seguiments', `${id}.jsonl`), r = join(ROOT, LINEAGES, 'simulacio', `${id}.jsonl`), c = join(ROOT, LINEAGES, 'comparacio', `${id}.txt`);
  if (!existsSync(s) || !existsSync(r) || !existsSync(c) || !readFileSync(c, 'utf8').includes(`${id}: hi coincideix`)) { problems.push(`${id}: the tracking, its record or its check is missing`); continue; }
  const L = readJsonl(s);
  if (L[0].type !== 'start' || L.at(-1).type !== 'end' || L[0].record.sha256 !== sha256(readFileSync(r))) { problems.push(`${id}: the tracking is not complete or not of its record`); continue; }
  seg.set(id, L);
}
const PBr = m.branches.filter((b) => b.part === 'B' && ARMS.includes(b.soup));
if (PBr.length !== cohort.length * ARMS.length) problems.push(`the manifest has ${PBr.length} part-B branches of the three soups`);
const recB = new Map();
for (const b of PBr) {
  const file = join(ROOT, PILOT, 'part-b', `${b.id}.jsonl`);
  if (!existsSync(file)) { problems.push(`${b.id}: no part-B record`); continue; }
  const rec = readJsonl(file);
  if (rec[0].type !== 'start' || rec.at(-1).type !== 'end' || String(rec[0].code) !== String(m.code)) { problems.push(`${b.id}: the part-B record is not complete, or not of the manifest's commit`); continue; }
  recB.set(b.id, rec);
}
out(`The neighbours within worlds, and a graph of candidate fragments: the note's analysis (exploratory). The analysis: ${codeVersion()}, ${process.version}.`);
out(`The aged-soup part-A records: ${seeds.size} of ${A.length} (of ${m.code}); primer-byte.jsonl: ${PB ? `${PB[0].code} ${PB[0].node}` : '—'}, ${scan.size} places; the trackings: ${seg.size} of ${list.length}; the part-B records: ${recB.size} of ${PBr.length}.`);
if (problems.length) { out(`\nNothing is analysed: ${problems.length} problems.\n- ${problems.slice(0, 30).join('\n- ')}`); process.exit(1); }
if (check) { out('--check: all the data were read and are valid; no result is printed.'); process.exit(0); }

// 1. The neighbours, within worlds and against G4 at the same cell
out('\n1. The neighbours, within worlds and against G4 at the same cell (the aged soup; functional/tested of the members in the first five steps, pooled)');
const seed = (w, v, p) => seeds.get(`${w}-continue-${v}-p${p}`);
const places = (ws) => ws.flatMap((w) => [1, 2, 3, 4].map((p) => ({ w, p, b: scan.get(`${w}|${p}`) })));
const pool = (P, v) => { let t = 0, fn = 0; for (const x of P) { const s = seed(x.w, v, x.p); t += s.t; fn += s.fn; } return t ? fn / t : null; };
const ratio = (a, b) => (a !== null && b !== null && b > 0 ? a / b : null);
const CLASSES = [['none', (b) => b === 0], ['1 or 2', (b) => b >= 1 && b <= 2], ['3 or more', (b) => b >= 3]];
out('   a. The extinction note\'s table, with intervals (the bootstrap over worlds)');
for (const [lab, ok] of CLASSES) {
  const sel = (ws) => places(ws).filter((x) => ok(x.b));
  const P = sel(cohort);
  const rt = (ws) => ratio(pool(sel(ws), 'G1'), pool(sel(ws), 'G4'));
  out(`   ${lab.padEnd(10)} ${P.length} places in ${new Set(P.map((x) => x.w)).size} worlds; G1 ${pc(pool(P, 'G1'))} ${ci(bootstrap(cohort, (ws) => pool(sel(ws), 'G1'), BOOTSTRAP).map((x) => (x === null ? null : 100 * x)), 1)}; G4 ${pc(pool(P, 'G4'))}; G1/G4 ${f(rt(cohort))} ${ci(bootstrap(cohort, rt, BOOTSTRAP))}; G1 × 9 (descriptive) ${pc(pool(P, 'G1x9'))}; take root: G1 ${P.filter((x) => seed(x.w, 'G1', x.p).outcome === 'arrela').length}, G4 ${P.filter((x) => seed(x.w, 'G4', x.p).outcome === 'arrela').length}, G1 × 9 ${P.filter((x) => seed(x.w, 'G1x9', x.p).outcome === 'arrela').length}`);
}
// b. within worlds: each world's places above and below the median of its four
const halves = (ws) => {
  const hi = [], lo = [];
  for (const w of ws) {
    const P = places([w]), md = median(P.map((x) => x.b));
    for (const x of P) { if (x.b > md) hi.push(x); else if (x.b < md) lo.push(x); }
  }
  return { hi, lo };
};
const R = (ws, v) => { const { hi, lo } = halves(ws); return ratio(pool(hi, v), pool(lo, v)); };
const RR = (ws) => ratio(R(ws, 'G1'), R(ws, 'G4'));
const hv = halves(cohort);
out(`   b. Within worlds: ${hv.hi.length} high places and ${hv.lo.length} low places, in ${new Set([...hv.hi, ...hv.lo].map((x) => x.w)).size} worlds (${cohort.filter((w) => new Set(places([w]).map((x) => x.b)).size === 1).length} worlds with the same b at their four places, left out)`);
const cG1 = bootstrap(cohort, (ws) => R(ws, 'G1'), BOOTSTRAP), cG4 = bootstrap(cohort, (ws) => R(ws, 'G4'), BOOTSTRAP), cRR = bootstrap(cohort, RR, BOOTSTRAP);
out(`      G1: high ${pc(pool(hv.hi, 'G1'))}, low ${pc(pool(hv.lo, 'G1'))}, R ${f(R(cohort, 'G1'))} ${ci(cG1)}`);
out(`      G4: high ${pc(pool(hv.hi, 'G4'))}, low ${pc(pool(hv.lo, 'G4'))}, R ${f(R(cohort, 'G4'))} ${ci(cG4)}`);
out(`      RR = R(G1) / R(G4): ${f(RR(cohort))} ${ci(cRR)}`);
const vRR = cRR[0] === null ? 'cannot say' : cRR[1] < 1 ? 'below 1' : cRR[0] > 1 ? 'above 1' : 'contains 1';
out(`   The note's reading (RR): ${vRR === 'below 1' ? 'below 1: within worlds and against G4 at the same cells, the local pattern agrees with the lead'
  : vRR === 'contains 1' ? `contains 1: the local test cannot see the lead either way (the interval runs from ${f(cRR[0])} to ${f(cRR[1])})`
  : vRR === 'above 1' ? 'above 1: the local pattern goes against the simple local version of the lead, even within worlds and against G4 at the same cells'
  : 'the bootstrap could not give an interval'}`);
out('   c. Descriptive: the seeds still heritable at the first step (F >= 1 at 8,050), each seed counted once');
for (const v of ['G1', 'G4']) {
  const k = (P) => P.filter((x) => seed(x.w, v, x.p).first.F >= 1).length;
  out(`      ${v}: high ${k(hv.hi)} of ${hv.hi.length}, low ${k(hv.lo)} of ${hv.lo.length}`);
}

// 2. The graph of candidate fragments
out('\n2. The graph of candidate fragments (the natural lineages of part B)');
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
// the branches, the lineages and the dominant group at the confirmation, as the extinction note's section 4; plus each lineage's cells at
// its detection, the cells of every lineage at every inert census, and the steps
const B = PBr.map((b) => {
  const rec = recB.get(b.id), ev = rec.find((l) => l.type === 'event') ?? null, end = rec.at(-1);
  const r = { ...b, ev, exposure: (ev ? ev.epoch : end.epoch) - start, lineages: [], domRoot: null, census: new Map() };
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
const lcs = (a, b) => { let best = 0; const prev = new Uint8Array(b.length + 1), cur = new Uint8Array(b.length + 1); for (let i = 1; i <= a.length; i++) { for (let j = 1; j <= b.length; j++) { cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : 0; if (cur[j] > best) best = cur[j]; } prev.set(cur); cur.fill(0); } return best; };
const lcsBoth = (p, q) => Math.max(lcs(p, q), lcs(p, q.slice().reverse()));
const best = (P, Q) => { let k = 0; for (const p of P) for (const q of Q) k = Math.max(k, lcsBoth(p, q)); return k; };
const progs = (x) => (x.bytes ??= x.programs.map(fromHex));
const domLin = (b) => b.lineages.filter((x) => x.rooted);
// alive: detected at or before e, and F >= 1 in one of its steps of the 250 epochs up to e
const alive = (x, e) => x.first <= e && x.steps.some((s) => s.epoch > e - 250 && s.epoch <= e && s.F >= 1);
// x's heritable cells at the census of epoch e (and, if x was created at that census, the cells of its creation)
const cellsAt = (b, x, e) => [...(b.census.get(e)?.get(x.id) ?? []), ...(x.first === e ? x.cells : [])];
const near = (A, Bc) => { for (const a of A) { const ax = a % W, ay = (a / W) | 0; for (const c of Bc) if (Math.abs(ax - (c % W)) <= PLACE && Math.abs(ay - ((c / W) | 0)) <= PLACE) return true; } return false; };
const chance = (Bc) => {
  const g = new Uint8Array(W * H);
  for (const c of Bc) { const cx = c % W, cy = (c / W) | 0; for (let y = Math.max(0, cy - PLACE); y <= Math.min(H - 1, cy + PLACE); y++) for (let x = Math.max(0, cx - PLACE); x <= Math.min(W - 1, cx + PLACE); x++) g[y * W + x] = 1; }
  let k = 0; for (const v of g) k += v; return k / (W * H);
};
// the threshold of the sequence rule, from the control: 1 + the longest substring any failed appearance of an establishing branch shares with
// the dominant groups of the other worlds of its soup, over the three soups
let ctlMax = 0;
for (const soup of ARMS) {
  const est = B.filter((b) => b.soup === soup && b.domRoot !== null);
  for (const b of est) for (const y of failed(b)) for (const o of est.filter((z) => z.world !== b.world)) ctlMax = Math.max(ctlMax, best(progs(y), domLin(o).flatMap(progs)));
}
const S_STAR = ctlMax + 1;
out(`   The sequence threshold from the control: the longest substring with the other worlds' dominant groups is ${ctlMax} bytes, so s* = ${S_STAR}`);
// the links of each failed appearance of an establishing branch to the dominant group
const links = new Map();   // `${branch}|${id}` -> { T, R2, S, P, chance }
for (const b of B.filter((x) => x.domRoot !== null)) {
  const D = domLin(b);
  for (const y of failed(b)) {
    const e = y.first;
    const T = b.ev.epoch - y.first <= TIME;
    const R2 = best(progs(y), D.flatMap(progs)) >= R2_BYTES;
    const src = D.filter((x) => x.id !== y.id && (x.first < e || (x.first === e && x.k < y.k)) && alive(x, e));
    const S = src.some((x) => best(progs(y), progs(x)) >= S_STAR);
    const near8 = src.filter((x) => near(y.cells, cellsAt(b, x, e)));
    const P = near8.length > 0;
    links.set(`${b.id}|${y.id}`, { T, R2, S, P, chance: P ? chance(src.flatMap((x) => cellsAt(b, x, e))) : null });
  }
}
// R6: the candidate families, the connected components of the graph of the robust lineages of each branch
const families = (b) => {
  const X = b.lineages.filter((x) => x.robust), par = new Map(X.map((x) => [x.id, x.id]));
  const find = (i) => { while (par.get(i) !== i) { par.set(i, par.get(par.get(i))); i = par.get(i); } return i; };
  const join = (i, j) => { const a = find(i), c = find(j); if (a !== c) par.set(a, c); };
  for (const x of X) for (const y of X) if (x !== y && x.root === y.root) join(x.id, y.id);
  for (const y of X) for (const x of X) {
    if (x === y || !(x.first < y.first || (x.first === y.first && x.k < y.k)) || !alive(x, y.first)) continue;
    if (best(progs(y), progs(x)) >= S_STAR || near(y.cells, cellsAt(b, x, y.first))) join(x.id, y.id);
  }
  const comp = new Map();
  for (const x of X) { const r = find(x.id); if (!comp.has(r)) comp.set(r, []); comp.get(r).push(x); }
  return [...comp.values()].filter((c) => !c.some((x) => x.rooted) && Math.min(...c.map((x) => x.first)) <= start + b.exposure).length;
};
const famCount = new Map(B.map((b) => [b.id, families(b)]));
const RULES = [
  ['R0 none (entry 21)', () => false],
  ['R1 time (auditor 1)', (l) => l.T],
  [`R2 ${R2_BYTES} bytes or more (the extinction note)`, (l) => l.R2],
  [`R3 sequence, s* = ${S_STAR}`, (l) => l.S],
  [`R4 place, ${PLACE} cells`, (l) => l.P],
  ['R5 any of T, S, P', (l) => l.T || l.S || l.P],
];
const countRule = (b, rm) => failed(b).filter((y) => { const l = links.get(`${b.id}|${y.id}`); return !(l && rm(l)); }).length;
const lam = (ws, soup, cnt) => { let k = 0, e = 0; for (const x of ws) { k += cnt(x[soup]); e += x[soup].exposure; } return e ? (1000 * k) / e : null; };
out('   The failed appearances under each rule: the counts (aged, shuffled, fresh), and the ratios against the fresh soup per 1,000 world-epochs');
const verdicts = [];
for (const [name, rm] of [...RULES, ['R6 candidate families', null]]) {
  const cnt = rm ? (b) => countRule(b, rm) : (b) => famCount.get(b.id);
  const n = ARMS.map((s) => B.filter((b) => b.soup === s).reduce((t, b) => t + cnt(b), 0));
  const rq = (soup) => (ws) => { const a = lam(ws, soup, cnt), r = lam(ws, 'reinit', cnt); return a !== null && r ? a / r : null; };
  const cA = bootstrap(wb, rq('continue'), BOOTSTRAP), cS = bootstrap(wb, rq('shuffle-all'), BOOTSTRAP);
  const v = cA[0] === null ? 'cannot say' : cA[0] > 1 ? 'above 1' : cA[1] < 1 ? 'below 1' : 'contains 1';
  verdicts.push([name, v]);
  out(`   ${name.padEnd(36)} ${n.join(', ')}; aged ${f(rq('continue')(wb))} ${ci(cA)} (${v}); shuffled ${f(rq('shuffle-all')(wb))} ${ci(cS)}`);
}
out(`   The range: the aged/fresh interval ${verdicts.every(([, v]) => v === 'contains 1') ? 'contains 1 under every rule' : verdicts.every(([, v]) => v === 'above 1') ? 'lies above 1 under every rule' : `contains 1 under ${verdicts.filter(([, v]) => v === 'contains 1').map(([n]) => n.split(' ')[0]).join(', ') || 'none'}, and lies above 1 under ${verdicts.filter(([, v]) => v === 'above 1').map(([n]) => n.split(' ')[0]).join(', ') || 'none'}`}`);
out('   The agreement: the failed appearances of establishing branches, by the kinds of evidence that link them to the dominant group');
let agree = null;
for (const soup of ARMS) {
  const Ls = B.filter((b) => b.soup === soup && b.domRoot !== null).flatMap((b) => failed(b).map((y) => links.get(`${b.id}|${y.id}`)));
  const T = Ls.filter((l) => l.T), SP = Ls.filter((l) => l.S || l.P);
  const combo = {};
  for (const l of Ls) { const k = `${l.T ? 'T' : '-'}${l.S ? 'S' : '-'}${l.P ? 'P' : '-'}`; combo[k] = (combo[k] ?? 0) + 1; }
  out(`   ${soup.padEnd(12)} ${Ls.length} failed appearances; the time rule removes ${T.length}, of which linked by sequence or place ${T.filter((l) => l.S || l.P).length} (sequence ${T.filter((l) => l.S).length}, place ${T.filter((l) => l.P).length}); linked by sequence or place ${SP.length}, of which the time rule removes ${SP.filter((l) => l.T).length}; by combination (T, S, P): ${Object.entries(combo).sort().map(([k, v]) => `${k} ${v}`).join(', ')}`);
  if (soup === 'continue') agree = T.length ? T.filter((l) => l.S || l.P).length / T.length : null;
}
out(`   The note's reading (the aged soup): ${agree === null ? 'the time rule removes none: no answer'
  : agree >= 2 / 3 ? `${f(agree)} of those the time rule removes are also linked by sequence or place: the three kinds of evidence agree that they are probable fragments, and the time rule's reading is the more defensible`
  : agree <= 1 / 3 ? `${f(agree)}: the time rule removes appearances that neither the sequence nor the place links to the dominant group, and it is not the more defensible one`
  : `${f(agree)}: in between, no clear answer`}`);
out('   Place as evidence: the chance level of the place links to the dominant group (the share of the world\'s cells as close to the same cells)');
const ch = [];
for (const soup of ARMS) {
  const C = B.filter((b) => b.soup === soup && b.domRoot !== null).flatMap((b) => failed(b).map((y) => links.get(`${b.id}|${y.id}`))).filter((l) => l.P).map((l) => l.chance);
  ch.push(...C);
  out(`   ${soup.padEnd(12)} ${C.length} place links; the chance level: median ${f(median(C), 3)}, min ${f(C.length ? Math.min(...C) : null, 3)}, max ${f(C.length ? Math.max(...C) : null, 3)}`);
}
const mc = median(ch);
out(`   The note's reading: the median chance level over the three soups is ${f(mc, 3)}: ${mc === null ? 'no place link' : mc > 0.5 ? 'place is no evidence' : mc < 0.1 ? 'place is strong evidence' : 'place is weak evidence'}`);
