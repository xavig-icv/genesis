// How the planted replicators die out in the aged soup (exploratory): the analysis fixed in the note (README.md), before computing.
//
//   node fase2/resultats/arrelament/extincions/analisi.mjs [--check] > fase2/resultats/arrelament/extincions/analisi-sortida.txt
//
// It reads the part-A records of the pilot (git), primer-byte.jsonl (git) and the natural-lineage trackings of the previous note (git).
// It requires all of them, complete; if anything is missing, it reads nothing. With --check, it validates the data and prints only the
// counts of what it read, no result (the short test). The world is the unit: the bootstrap resamples whole worlds.
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { partA, plantedClass, followUpClass, consistencyTally, bootstrap, ANALYSIS } from '../../../../eines/arrelament-analisi.mjs';
import { DESIGN } from '../../../../eines/arrelament.mjs';
import { conditions, testInert, fromHex, INERT_CONDITIONS_SEED } from '../../../../fase2/inert.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { ROOT, PILOT, LINEAGES, HERE, ARMS, VARIANTS, BOOTSTRAP, sha256, readJsonl } from './comu.mjs';

const args = process.argv.slice(2);
const check = args[0] === '--check';
if (args.length > 1 || (args.length === 1 && !check)) { console.error('usage: node analisi.mjs [--check]'); process.exit(2); }
const d = DESIGN, start = d.age;
const out = (s = '') => console.log(s);
const f = (x, k = 2) => (x === null || x === undefined || !Number.isFinite(x) ? '—' : x.toFixed(k));
const ci = ([lo, hi], k = 2) => `[${f(lo, k)}, ${f(hi, k)}]`;
const pc = (x) => (x === null || !Number.isFinite(x) ? '—' : `${(100 * x).toFixed(1)}%`);
const problems = [];

// 0. The data, complete
const m = JSON.parse(readFileSync(join(ROOT, PILOT, 'manifest.json'), 'utf8'));
const cohort = m.worlds.filter((w) => w.included).map((w) => w.world);
const A = m.branches.filter((b) => b.part === 'A' && ARMS.includes(b.soup) && VARIANTS.includes(b.variant));
if (A.length !== cohort.length * ARMS.length * VARIANTS.length * 4) problems.push(`the manifest has ${A.length} informative part-A branches`);
const items = [];
for (const b of A) {
  const file = join(ROOT, PILOT, 'part-a', `${b.id}.jsonl`);
  if (!existsSync(file)) { problems.push(`${b.id}: no record`); continue; }
  const L = readJsonl(file);
  if (L[0].type !== 'start' || L.at(-1).type !== 'end') { problems.push(`${b.id}: the record is not complete`); continue; }
  if (String(L[0].code) !== String(m.code) || String(L[0].code).includes('+')) { problems.push(`${b.id}: the record is of ${L[0].code}, not of the manifest's ${m.code}`); continue; }
  const lin = L.filter((l) => l.type === 'lineage').sort((x, y) => x.epoch - y.epoch);
  if (!lin.length || lin[0].epoch !== start || !lin.find((l) => l.epoch === start + 50)) { problems.push(`${b.id}: the lineage does not start at ${start} with a step at ${start + 50}`); continue; }
  const steps = lin.filter((l) => l.epoch >= start + 50 && l.epoch <= start + 250 && l.tested > 0);
  items.push({ b, lin, r: partA(L, { start, horizon: d.horizonA }), first: lin.find((l) => l.epoch === start + 50),
    steps: { t: steps.reduce((s, l) => s + l.tested, 0), c: steps.reduce((s, l) => s + l.copying, 0), fn: steps.reduce((s, l) => s + l.functional, 0) } });
}
const pbFile = join(ROOT, HERE, 'primer-byte.jsonl');
const PB = existsSync(pbFile) ? readJsonl(pbFile) : null;
const pbWorlds = new Map(), pbSeeds = new Map();
if (!PB || PB[0].type !== 'start' || PB.at(-1).type !== 'end' || PB[0].only) problems.push('primer-byte.jsonl is missing, not complete, or of the short test');
else {
  if (String(PB[0].code).includes('+')) problems.push(`primer-byte.jsonl says ${PB[0].code}`);
  for (const l of PB) { if (l.type === 'world') pbWorlds.set(l.world, l); if (l.type === 'seed') pbSeeds.set(l.branch, l); }
  if (cohort.some((w) => !pbWorlds.has(w) || ARMS.some((a) => !pbWorlds.get(w)[a]))) problems.push('primer-byte.jsonl lacks a world or a soup');
  const oneCell = m.branches.filter((b) => b.part === 'A' && ARMS.includes(b.soup) && (b.variant === 'G1' || b.variant === 'G4'));
  if (oneCell.some((b) => !pbSeeds.has(b.id))) problems.push('primer-byte.jsonl lacks a one-cell seed');
}
// the natural-lineage trackings of the previous note (question 4)
const list = readFileSync(join(ROOT, LINEAGES, 'llista.txt'), 'utf8').trim().split('\n').map((l) => l.split(' ')[0]);
const seg = new Map();
for (const id of list) {
  const s = join(ROOT, LINEAGES, 'seguiments', `${id}.jsonl`), r = join(ROOT, LINEAGES, 'simulacio', `${id}.jsonl`);
  const c = join(ROOT, LINEAGES, 'comparacio', `${id}.txt`);
  if (!existsSync(s) || !existsSync(r) || !existsSync(c) || !readFileSync(c, 'utf8').includes(`${id}: hi coincideix`)) { problems.push(`${id}: the tracking, its record or its check is missing`); continue; }
  const L = readJsonl(s);
  if (L[0].type !== 'start' || L.at(-1).type !== 'end' || L[0].record.sha256 !== sha256(readFileSync(r))) { problems.push(`${id}: the tracking is not complete or not of its record`); continue; }
  seg.set(id, L);
}
out(`How the planted replicators die out in the aged soup: the note's analysis (exploratory). The analysis: ${codeVersion()}, ${process.version}.`);
out(`The part-A records: ${items.length} of ${A.length} (of ${m.code}); primer-byte.jsonl: ${PB ? `${PB[0].code} ${PB[0].node}` : '—'}, ${pbWorlds.size} worlds, ${pbSeeds.size} seeds; the natural-lineage trackings: ${seg.size} of ${list.length}.`);
if (problems.length) { out(`\nNothing is analysed: ${problems.length} problems.\n- ${problems.slice(0, 30).join('\n- ')}`); process.exit(1); }
if (check) { out('--check: all the data were read and are valid; no result is printed.'); process.exit(0); }

const byWorld = new Map(cohort.map((w) => [w, items.filter((x) => x.b.world === w)]));
const pick = (ws, v, soup) => ws.flatMap((w) => byWorld.get(w).filter((x) => (Array.isArray(v) ? v.includes(x.b.variant) : x.b.variant === v) && x.b.soup === soup));
const verdictRatio = ([lo, hi]) => (lo === null ? 'cannot say' : hi < 1 ? 'below 1' : lo > 1 ? 'above 1' : 'contains 1');

// 1. The anatomy
out('\n1. The anatomy: how the planted lineages die out (part A, the informative variants)');
const T = [start + 50, start + 100, start + 250, start + 500, start + 1000, start + 1500];
const firstZero = (x) => { const l = x.lin.find((y) => y.F === 0); return l ? l.epoch : null; };
const median = (a) => { if (!a.length) return null; const s = [...a].sort((p, q) => p - q); return s[(s.length - 1) >> 1]; };
for (const v of VARIANTS) {
  for (const soup of ARMS) {
    const X = pick(cohort, v, soup);
    const st = { lost: 0, present: 0, heritable: 0 };
    for (const x of X) st[x.first.M === 0 ? 'lost' : x.first.F === 0 ? 'present' : 'heritable']++;
    const alive = T.map((t) => X.filter((x) => x.r.extinctAt === null || x.r.extinctAt > t).length);
    const tt = X.reduce((s, x) => s + x.steps.t, 0), cc = X.reduce((s, x) => s + x.steps.c, 0), ff = X.reduce((s, x) => s + x.steps.fn, 0);
    out(`   ${v.padEnd(5)}${soup.padEnd(12)} ${X.length} plantings; at ${start + 50}: lost ${st.lost}, present but not heritable ${st.present}, heritable ${st.heritable}; still alive at ${T.join(', ')}: ${alive.join(', ')}; the first F = 0, median epoch ${median(X.map(firstZero).filter((e) => e !== null)) ?? '—'} (${X.filter((x) => firstZero(x) === null).length} never)`);
    out(`   ${''.padEnd(17)} the members in the first five steps (${start + 50} to ${start + 250}): tested ${tt}; copying ${cc} (${pc(tt ? cc / tt : null)} of tested); functional ${ff} (${pc(cc ? ff / cc : null)} of copying; ${pc(tt ? ff / tt : null)} of tested)`);
  }
  const at = (soup, k) => pick(cohort, v, soup).filter((x) => (k === 'lost' ? x.first.M === 0 : x.first.M > 0 && x.first.F === 0)).length;
  out(`   ${v.padEnd(5)}aged minus fresh, at ${start + 50}: lost ${at('continue', 'lost') - at('reinit', 'lost')}, present but not heritable ${at('continue', 'present') - at('reinit', 'present')}`);
}

// 2. The lead at the lineage level
out('\n2. The first-byte lead at the lineage level: functional/tested of the members in the first five steps, the ratio against the fresh soup');
const share = (ws, v, soup) => { let fn = 0, t = 0; for (const x of pick(ws, v, soup)) { fn += x.steps.fn; t += x.steps.t; } return t ? fn / t : null; };
const ratio = (ws, v, soup) => { const a = share(ws, v, soup), r = share(ws, v, 'reinit'); return a !== null && r ? a / r : null; };
const ratios = {};
for (const v of VARIANTS) {
  for (const soup of ['continue', 'shuffle-all']) {
    const c = bootstrap(cohort, (ws) => ratio(ws, v, soup), BOOTSTRAP);
    if (soup === 'continue') ratios[v] = c;
    out(`   ${v.padEnd(5)}${soup.padEnd(12)} ${pc(share(cohort, v, soup))} against ${pc(share(cohort, v, 'reinit'))}: ${f(ratio(cohort, v, soup))} ${ci(c)} (${verdictRatio(c)})`);
  }
}
const g1 = verdictRatio(ratios.G1), g4 = verdictRatio(ratios.G4);
out(`   The note's reading (G1 and G4, aged against fresh): ${g1 === 'contains 1' ? 'G1 contains 1: the records do not show the lead at the lineage level'
  : g1 === 'below 1' && g4 === 'contains 1' ? 'G1 below 1 and G4 contains 1: the lineage records agree with the first-byte lead'
  : g1 === 'below 1' && g4 === 'below 1' ? 'G1 and G4 below 1: something in the aged soup hurts both, and the first byte is not the explanation'
  : `none of the fixed cases (G1 ${g1}, G4 ${g4})`}`);

// 3. The lead between worlds
out('\n3. The first-byte lead between worlds (the aged soup)');
const badShare = (w) => { const c = pbWorlds.get(w).continue; return (c.bracket + c.zero) / c.cells; };
const S = cohort.map(badShare).sort((p, q) => p - q);
out(`   the share of cells that start with ] or 0, over the 60 worlds: min ${pc(S[0])}, median ${pc(S[(S.length - 1) >> 1])}, max ${pc(S.at(-1))} (the shuffled soup, median ${pc(median(cohort.map((w) => { const c = pbWorlds.get(w)['shuffle-all']; return (c.bracket + c.zero) / c.cells; })))}; the fresh, ${pc(median(cohort.map((w) => { const c = pbWorlds.get(w).reinit; return (c.bracket + c.zero) / c.cells; })))})`);
const ranks = (a) => { const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]); const r = new Array(a.length); for (let i = 0; i < idx.length;) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1; i = j + 1; } return r; };
const spearman = (pairs) => {
  const P = pairs.filter(([x, y]) => x !== null && y !== null && Number.isFinite(x) && Number.isFinite(y));
  if (P.length < 5) return null;
  const rx = ranks(P.map((p) => p[0])), ry = ranks(P.map((p) => p[1]));
  const mx = rx.reduce((s, v) => s + v, 0) / rx.length, my = ry.reduce((s, v) => s + v, 0) / ry.length;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < rx.length; i++) { sxy += (rx[i] - mx) * (ry[i] - my); sxx += (rx[i] - mx) ** 2; syy += (ry[i] - my) ** 2; }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : null;
};
const rooted = (w, v) => pick([w], v, 'continue').filter((x) => x.r.outcome === 'arrela').length;
const OUT = {
  'G1 and G1 × 9, plantings that take root (of 8)': (w) => rooted(w, ['G1', 'G1x9']),
  'G1, functional/tested in the first five steps': (w) => share([w], 'G1', 'continue'),
  'G4, plantings that take root (of 4)': (w) => rooted(w, 'G4'),
  'G4, functional/tested in the first five steps': (w) => share([w], 'G4', 'continue'),
};
const corr = {};
for (const [name, fn] of Object.entries(OUT)) {
  const rho = (ws) => spearman(ws.map((w) => [badShare(w), fn(w)]));
  const c = bootstrap(cohort, rho, BOOTSTRAP);
  corr[name] = c;
  out(`   ${name}: Spearman ${f(rho(cohort))} ${ci(c)} (worlds with a value: ${cohort.filter((w) => fn(w) !== null).length})`);
}
const verdictZero = ([lo, hi]) => (lo === null ? 'cannot say' : hi < 0 ? 'below 0' : lo > 0 ? 'above 0' : 'contains 0');
const c1 = verdictZero(corr['G1 and G1 × 9, plantings that take root (of 8)']), c4 = verdictZero(corr['G4, plantings that take root (of 4)']);
out(`   The note's reading (taking root): ${c1 === 'contains 0' ? 'G1 contains 0: no between-world association'
  : c1 === 'below 0' && c4 === 'contains 0' ? 'G1 below 0 and G4 contains 0: the between-world pattern agrees with the lead'
  : `none of the fixed cases (G1 ${c1}, G4 ${c4})`}`);
out('   Descriptive: the one-cell G1 seeds of the aged soup, functional/tested in the first five steps, by the number of the 24 neighbours that start with ] or 0');
for (const [lab, ok] of [['none', (n) => n === 0], ['1 or 2', (n) => n >= 1 && n <= 2], ['3 or more', (n) => n >= 3]]) {
  const X = pick(cohort, 'G1', 'continue').filter((x) => ok(pbSeeds.get(x.b.id).bad));
  const t = X.reduce((s, x) => s + x.steps.t, 0), fn = X.reduce((s, x) => s + x.steps.fn, 0);
  out(`   ${lab.padEnd(10)} ${X.length} seeds; functional ${fn} of ${t} tested (${pc(t ? fn / t : null)}); take root ${X.filter((x) => x.r.outcome === 'arrela').length}`);
}

// 4. The natural families counted both ways (descriptive)
out('\n4. The natural families counted both ways (descriptive; auditor 1 computed parts of it post hoc in audit 38)');
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
const robust = (programs) => Math.max(...programs.map(score)) >= ANALYSIS.robust;
const B = m.branches.filter((b) => b.part === 'B').map((b) => {
  const rec = readJsonl(join(ROOT, PILOT, 'part-b', `${b.id}.jsonl`));
  const ev = rec.find((l) => l.type === 'event') ?? null, end = rec.at(-1);
  const r = { ...b, ev, exposure: (ev ? ev.epoch : end.epoch) - start, lineages: [], domRoot: null };
  const L = seg.get(b.id);
  if (!L) return r;
  const lin = new Map(), parent = new Map();
  const root = (id) => { while (parent.has(id)) id = parent.get(id); return id; };
  for (const l of L) {
    if (l.type === 'new') lin.set(l.id, { id: l.id, first: l.epoch, programs: l.programs });
    if (l.type === 'census') {
      for (const [young, old] of l.joins) parent.set(young, old);
      if (ev && l.epoch === ev.confirmed) for (const [rid, k] of Object.entries(l.groups)) if (l.heritable > 0 && k >= ANALYSIS.dominance * l.heritable) r.domRoot = root(rid);
    }
  }
  r.lineages = [...lin.values()].map((x) => ({ ...x, robust: robust(x.programs), root: root(x.id) }));
  for (const x of r.lineages) x.rooted = r.domRoot !== null && x.root === r.domRoot;
  return r;
});
// 4a. the consistency counted by group
const fisher = (a, b, c, dd) => {
  const lf = (n) => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; };
  const n1 = a + b, n2 = c + dd, k = a + c, N = n1 + n2;
  const p = (x) => Math.exp(lf(n1) - lf(x) - lf(n1 - x) + lf(n2) - lf(k - x) - lf(n2 - k + x) - (lf(N) - lf(k) - lf(N - k)));
  const p0 = p(a); let s = 0;
  for (let x = Math.max(0, k - n2); x <= Math.min(k, n1); x++) { const px = p(x); if (px <= p0 * (1 + 1e-9)) s += px; }
  return Math.min(1, s);
};
out('   4a. The consistency counted by group (a group: the robust lineages with the same root at the end; the note\'s rule, an operational criterion, not a test of equivalence; Fisher\'s p does not account for the world)');
for (const soup of ARMS) {
  const groups = [];
  for (const b of B.filter((x) => x.soup === soup)) {
    const g = new Map();
    for (const x of b.lineages.filter((y) => y.robust)) { const cur = g.get(x.root); if (!cur || x.first < cur.first) g.set(x.root, { first: x.first, rooted: x.rooted }); }
    for (const v of g.values()) groups.push(followUpClass({ detected: v.first, event: b.ev ? b.ev.epoch : null, dominant: v.rooted, eligibleUntil: start + d.horizonB - ANALYSIS.interval }));
  }
  const nat = consistencyTally(groups);
  const pla = consistencyTally(items.filter((x) => x.b.soup === soup && x.r.detectedAt !== null).map((x) => plantedClass(x.r, { start, horizon: d.horizonA })));
  const P = (t) => (t.n ? t.k / t.n : null);
  const diff = P(nat.main) - P(pla.main), p = fisher(nat.main.k, nat.main.n - nat.main.k, pla.main.k, pla.main.n - pla.main.k);
  out(`   ${soup.padEnd(12)} groups ${nat.main.k} of ${nat.main.n} (${f(P(nat.main))}); planted ${pla.main.k} of ${pla.main.n} (${f(P(pla.main))}); the difference ${f(diff)}, Fisher p ${f(p, 3)}: ${Math.abs(diff) <= 0.15 && p >= 0.05 ? 'meets the criterion' : 'does not meet the criterion'}; groups: take root ${nat.arrela}, competitor ${nat.competidor}, do not take root ${nat['no arrela']}, late ${nat.tardana}, previous ${nat.previ}`);
}
// 4b. the longest common substring with the dominant group
const lcs = (a, b) => { let best = 0; const prev = new Uint8Array(b.length + 1), cur = new Uint8Array(b.length + 1); for (let i = 1; i <= a.length; i++) { for (let j = 1; j <= b.length; j++) { cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : 0; if (cur[j] > best) best = cur[j]; } prev.set(cur); cur.fill(0); } return best; };
const lcsBoth = (p, q) => Math.max(lcs(p, q), lcs(p, q.slice().reverse()));
const best = (progs, dom) => { let k = 0; for (const p of progs) for (const q of dom) k = Math.max(k, lcsBoth(p, q)); return k; };
const domPrograms = (b) => b.lineages.filter((x) => x.rooted).flatMap((x) => x.programs.map(fromHex));
const failed = (b) => b.lineages.filter((x) => x.robust && !x.rooted && x.first <= start + b.exposure);
out('   4b. The failed appearances of establishing branches: the longest common substring (also reversed) with the initial programs of the branch\'s dominant group, and, as a control, with those of the other worlds of the same soup');
const fragment = new Set();
for (const soup of ARMS) {
  const est = B.filter((b) => b.soup === soup && b.domRoot !== null);
  const own = [], ctl = [];
  for (const b of est) for (const x of failed(b)) {
    const progs = x.programs.map(fromHex);
    const o = best(progs, domPrograms(b));
    const c = Math.max(0, ...est.filter((y) => y.world !== b.world).map((y) => best(progs, domPrograms(y))));
    own.push(o); ctl.push(c);
    if (o >= 10) fragment.add(`${b.id}|${x.id}`);
  }
  out(`   ${soup.padEnd(12)} ${own.length} failed appearances in establishing branches; with their dominant group, the median ${median(own) ?? '—'} bytes, 10 or more: ${own.filter((k) => k >= 10).length}; with the best of the other worlds, the median ${median(ctl) ?? '—'}, 10 or more: ${ctl.filter((k) => k >= 10).length}`);
}
// 4c. the failed appearances without the probable fragments
out('   4c. The failed appearances without the probable fragments (10 bytes or more in common with their branch\'s dominant group), per 1,000 world-epochs');
const wb = cohort.map((w) => Object.fromEntries(ARMS.map((s) => [s, B.find((x) => x.world === w && x.soup === s)])));
const count = (b) => failed(b).filter((x) => !fragment.has(`${b.id}|${x.id}`)).length;
const lam = (ws, soup) => { let k = 0, e = 0; for (const x of ws) { k += count(x[soup]); e += x[soup].exposure; } return e ? (1000 * k) / e : null; };
for (const soup of ARMS) out(`   ${soup.padEnd(12)} ${B.filter((b) => b.soup === soup).reduce((s, b) => s + count(b), 0)} (of ${B.filter((b) => b.soup === soup).reduce((s, b) => s + failed(b).length, 0)}); ${f(lam(wb, soup), 3)}`);
for (const soup of ['continue', 'shuffle-all']) {
  const rq = (ws) => { const a = lam(ws, soup), r = lam(ws, 'reinit'); return a !== null && r ? a / r : null; };
  out(`   ${soup} against reinit: ${f(rq(wb))} ${ci(bootstrap(wb, rq, BOOTSTRAP))}`);
}
