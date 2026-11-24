// The first-byte vulnerability of the natural establishments (exploratory): the analysis fixed in the note (README.md), before computing.
//
//   node fase2/resultats/arrelament/vulnerables/analisi.mjs [--check] > fase2/resultats/arrelament/vulnerables/analisi-sortida.txt
//
// It reads vulnerables.jsonl (git), the natural-lineage trackings of the lineage note and the part-B records of the pilot (git). It requires
// all of them, complete; if anything is missing or impossible, it analyses nothing. With --check, it validates the data and prints only the
// counts of what it read, no result (the short test). The world is the unit: the bootstrap resamples whole worlds.
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { bootstrap, ANALYSIS } from '../../../../eines/arrelament-analisi.mjs';
import { DESIGN } from '../../../../eines/arrelament.mjs';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { ROOT, PILOT, LINEAGES, HERE, ARMS, KINDS, PER_KIND, PARTNER_SEED, BOOTSTRAP, CALIBRATION, GENOTYPES, sha256, readJsonl, works, vulnerable, vulnerableTo0 } from './comu.mjs';

const args = process.argv.slice(2);
const check = args.includes('--check');
if (args.length !== (check ? 1 : 0)) { console.error('usage: node analisi.mjs [--check]'); process.exit(2); }
const start = DESIGN.age;
const out = (s = '') => console.log(s);
const f = (x, k = 2) => (x === null || x === undefined || !Number.isFinite(x) ? '—' : x.toFixed(k));
const ci = ([lo, hi], k = 2) => `[${f(lo, k)}, ${f(hi, k)}]`;
const problems = [];
const isN = (x) => Number.isSafeInteger(x) && x >= 0;

// 0. The data, complete
const m = JSON.parse(readFileSync(join(ROOT, PILOT, 'manifest.json'), 'utf8'));
const cohort = m.worlds.filter((w) => w.included).map((w) => w.world);
const list = readFileSync(join(ROOT, LINEAGES, 'llista.txt'), 'utf8').trim().split('\n').map((l) => l.split(' ')[0]);
const seg = new Map();
for (const id of list) {
  const s = join(ROOT, LINEAGES, 'seguiments', `${id}.jsonl`), r = join(ROOT, LINEAGES, 'simulacio', `${id}.jsonl`), c = join(ROOT, LINEAGES, 'comparacio', `${id}.txt`);
  if (!existsSync(s) || !existsSync(r) || !existsSync(c) || !readFileSync(c, 'utf8').includes(`${id}: hi coincideix`)) { problems.push(`${id}: the tracking, its record or its check is missing`); continue; }
  const L = readJsonl(s);
  if (L[0].type !== 'start' || L.at(-1).type !== 'end' || L[0].record.sha256 !== sha256(readFileSync(r))) { problems.push(`${id}: the tracking is not complete or not of its record`); continue; }
  seg.set(id, L);
}
// the part-B branches, with their lineages, the dominant group at the confirmation and the roots (as the extinction note, section 4)
const B = m.branches.filter((b) => b.part === 'B' && ARMS.includes(b.soup)).map((b) => {
  const rec = readJsonl(join(ROOT, PILOT, 'part-b', `${b.id}.jsonl`));
  const ev = rec.find((l) => l.type === 'event') ?? null;
  const r = { ...b, ev, lineages: [], domRoot: null };
  const L = seg.get(b.id);
  if (!L) return r;
  const lin = new Map(), parent = new Map();
  const root = (id) => { while (parent.has(id)) id = parent.get(id); return id; };
  for (const l of L) {
    if (l.type === 'new') lin.set(l.id, { id: l.id, first: l.epoch, k: Number(l.id.split(':')[1]), programs: l.programs });
    if (l.type === 'census') {
      for (const [young, old] of l.joins) parent.set(young, old);
      if (ev && l.epoch === ev.confirmed) for (const [rid, k] of Object.entries(l.groups)) if (l.heritable > 0 && k >= ANALYSIS.dominance * l.heritable) r.domRoot = root(rid);
    }
  }
  r.lineages = [...lin.values()].map((x) => ({ ...x, root: root(x.id) }));
  for (const x of r.lineages) x.dominant = r.domRoot !== null && x.root === r.domRoot;
  return r;
});
if (B.length !== cohort.length * ARMS.length) problems.push(`the manifest has ${B.length} part-B branches of the three soups`);

// vulnerables.jsonl, every line checked against the trackings and the note
const file = join(ROOT, HERE, 'vulnerables.jsonl');
let V = null;
try { V = existsSync(file) ? readJsonl(file) : null; } catch { problems.push('vulnerables.jsonl is not valid JSONL'); }
if (V && V.some((l) => l === null || typeof l !== 'object' || Array.isArray(l))) { problems.push('vulnerables.jsonl: a line that is not an object'); V = null; }
const cal = new Map(), lin = new Map(), test = new Map(), parts = new Map(), worldLines = new Set();
if (!V || V[0].type !== 'start' || V.at(-1).type !== 'end') problems.push('vulnerables.jsonl is missing or not complete');
else {
  const head = V[0];
  if (typeof head.code !== 'string' || head.code.includes('+')) problems.push(`vulnerables.jsonl is of ${JSON.stringify(head.code)}, not of a clean commit`);
  if (typeof head.node !== 'string' || !/^v\d+\.\d+\.\d+$/.test(head.node)) problems.push('vulnerables.jsonl: the header does not say the Node version');
  if (head.only !== null) problems.push('vulnerables.jsonl is of the short test (--world)');
  if (head.perKind !== PER_KIND || head.partnerSeed !== PARTNER_SEED || head.robust !== ANALYSIS.robust) problems.push('vulnerables.jsonl: the header is not the note\'s');
  const okCounts = (c) => c && typeof c === 'object' && KINDS.every((k) => c[k] && c[k].n === PER_KIND && isN(c[k].c) && isN(c[k].h) && isN(c[k].keep) && c[k].c <= c[k].n && c[k].h <= c[k].c && c[k].keep <= c[k].c)
    && Object.keys(c).length === KINDS.length;
  for (const l of V.slice(1, -1)) {
    if (l.type === 'partners') {
      const k = `${l.world}|${l.soup}`;
      if (parts.has(k)) problems.push(`vulnerables.jsonl: the partners of ${k} twice`);
      parts.set(k, l);
      for (const kind of KINDS) {
        const cells = l.cells?.[kind];
        if (!Array.isArray(cells) || cells.length !== PER_KIND || new Set(cells).size !== PER_KIND || !cells.every(isN) || !isN(l.available?.[kind]) || l.available[kind] < PER_KIND
          || cells.some((c) => c >= m.params.world[0] * m.params.world[1])) problems.push(`vulnerables.jsonl: the ${kind} partners of ${k} are not ${PER_KIND} different cells of the world`);
      }
    } else if (l.type === 'calibration') {
      const k = `${l.world}|${l.genotype}`;
      if (cal.has(k) || !GENOTYPES.includes(l.genotype) || !okCounts(l.counts)) problems.push(`vulnerables.jsonl: an impossible calibration line (${k})`);
      cal.set(k, l);
    } else if (l.type === 'lineage') {
      const k = `${l.branch}|${l.id}`;
      if (lin.has(k)) problems.push(`vulnerables.jsonl: the lineage ${k} twice`);
      lin.set(k, l);
    } else if (l.type === 'test') {
      const k = `${l.branch}|${l.id}|${l.partners}`;
      if (test.has(k) || !['aged', 'own'].includes(l.partners) || !okCounts(l.counts)) problems.push(`vulnerables.jsonl: an impossible test line (${k})`);
      test.set(k, l);
    } else if (l.type === 'world') worldLines.add(l.world);
    else problems.push(`vulnerables.jsonl: an unexpected line type (${l.type})`);
  }
  for (const w of cohort) {
    if (!worldLines.has(w)) problems.push(`vulnerables.jsonl: world ${w} is not finished`);
    for (const s of ARMS) if (!parts.has(`${w}|${s}`)) problems.push(`vulnerables.jsonl: no partners for ${w} ${s}`);
    for (const g of GENOTYPES) if (!cal.has(`${w}|${g}`)) problems.push(`vulnerables.jsonl: no calibration of ${g} in ${w}`);
  }
  if (worldLines.size !== cohort.length || parts.size !== cohort.length * ARMS.length || cal.size !== cohort.length * GENOTYPES.length) problems.push('vulnerables.jsonl: more worlds than the cohort');
  // every lineage of every tracking, with its best first program; a test of every robust one, with the aged partners and (not in the aged
  // soup) its own soup's; none of the others
  let nLin = 0;
  for (const b of B.filter((x) => seg.has(x.id))) for (const x of b.lineages) {
    nLin++;
    const l = lin.get(`${b.id}|${x.id}`);
    if (!l || l.world !== b.world || l.soup !== b.soup || l.first !== x.first || l.programs !== x.programs.length || !x.programs.includes(l.program) || !isN(l.score) || l.score > ANALYSIS.retest.count
      || l.robust !== (l.score >= ANALYSIS.robust)) { problems.push(`vulnerables.jsonl: the lineage ${b.id} ${x.id} is missing or does not match its tracking`); continue; }
    x.score = l.score; x.robust = l.robust;
    for (const p of ['aged', 'own']) {
      const t = test.get(`${b.id}|${x.id}|${p}`), want = l.robust && (p === 'aged' || b.soup !== 'continue');
      if (want !== Boolean(t) || (t && (t.world !== b.world || t.soup !== b.soup))) problems.push(`vulnerables.jsonl: the ${p} test of ${b.id} ${x.id} is ${t ? 'there and should not be, or does not match' : 'missing'}`);
      if (t) x[p] = t.counts;
    }
  }
  if (lin.size !== nLin) problems.push(`vulnerables.jsonl: ${lin.size} lineage lines, not ${nLin}`);
  const e = V.at(-1);
  if (e.worlds !== cohort.length || e.tests !== cal.size + test.size) problems.push('vulnerables.jsonl: the end line does not count what is there');
}
out(`The first-byte vulnerability of the natural establishments: the note's analysis (exploratory). The analysis: ${codeVersion()}, ${process.version}.`);
out(`vulnerables.jsonl: ${V ? `${V[0].code} ${V[0].node}` : '—'}, ${worldLines.size} worlds, ${parts.size} partner sets, ${cal.size} calibration lines, ${lin.size} lineages, ${test.size} tests; the trackings: ${seg.size} of ${list.length}; the part-B branches: ${B.length}.`);
if (problems.length) { out(`\nNothing is analysed: ${problems.length} problems.\n- ${problems.slice(0, 30).join('\n- ')}`); process.exit(1); }
if (check) { out('--check: all the data were read and are valid; no result is printed.'); process.exit(0); }

const pct = (k, n) => (n ? `${k} of ${n} (${f(k / n)})` : `${k} of 0`);
const dist = (a) => { const s = [...a].sort((p, q) => p - q); return s.length ? `min ${s[0]}, median ${s[(s.length - 1) >> 1]}, max ${s.at(-1)}` : '—'; };

// 0. The calibration
out('\n0. The calibration: the four genotypes against the aged partners of each world (20 of each first byte)');
const calOk = {};
for (const g of GENOTYPES) {
  const C = cohort.map((w) => cal.get(`${w}|${g}`).counts);
  const sum = (k, x) => C.reduce((s, c) => s + c[k][x], 0);
  out(`   ${g}: works in ${C.filter(works).length} worlds, vulnerable in ${C.filter(vulnerable).length}, vulnerable to 0 in ${C.filter(vulnerableTo0).length}; copies (heritable, keep the first byte) of ${60 * PER_KIND}: ] ${sum(']', 'c')} (${sum(']', 'h')}, ${sum(']', 'keep')}); 0 ${sum('0', 'c')} (${sum('0', 'h')}, ${sum('0', 'keep')}); other ${sum('other', 'c')} (${sum('other', 'h')}, ${sum('other', 'keep')})`);
  calOk[g] = g === 'G1' ? C.filter(vulnerable).length : C.filter((c) => works(c) && !vulnerable(c)).length;
}
const calibrated = calOk.G1 >= CALIBRATION.worlds && calOk.G4 >= CALIBRATION.worlds;
out(`   The note's rule (G1 vulnerable, and G4 working and not vulnerable, in ${CALIBRATION.worlds} of the 60 worlds or more): G1 ${calOk.G1}, G4 ${calOk.G4}: ${calibrated ? 'passed' : 'FAILED: the test does not measure what it should, and nothing else is read'}`);
if (!calibrated) process.exit(0);

// 1. The main measure
out('\n1. The founders of the establishments (the first robust lineage of the dominant group), with the aged partners of their world');
const est = B.filter((b) => b.domRoot !== null).map((b) => {
  const R = b.lineages.filter((x) => x.dominant && x.robust).sort((p, q) => p.first - q.first || p.k - q.k);
  return { b, R, founder: R[0] ?? null };
});
const byWorld = new Map(cohort.map((w) => [w, Object.fromEntries(ARMS.map((s) => [s, est.find((e) => e.b.world === w && e.b.soup === s) ?? null]))]));
const share = (ws, soup, p = 'aged') => {
  let k = 0, n = 0;
  for (const w of ws) { const e = byWorld.get(w)[soup]; if (!e || !e.founder) continue; const c = p === 'own' && soup !== 'continue' ? e.founder.own : e.founder.aged; if (!works(c)) continue; n++; if (vulnerable(c)) k++; }
  return n ? k / n : null;
};
const tally = (soup, p = 'aged') => {
  const E = est.filter((e) => e.b.soup === soup), F = E.filter((e) => e.founder), c = (e) => (p === 'own' && soup !== 'continue' ? e.founder.own : e.founder.aged);
  return { est: E.length, noRobust: E.length - F.length, work: F.filter((e) => works(c(e))).length, vuln: F.filter((e) => works(c(e)) && vulnerable(c(e))).length };
};
for (const soup of ARMS) {
  const t = tally(soup);
  out(`   ${soup.padEnd(12)} ${t.est} establishments; no robust lineage in the dominant group ${t.noRobust}; the founder works ${t.work}; vulnerable ${pct(t.vuln, t.work)}`);
}
const diff = (ws, a, p = 'aged') => { const x = share(ws, 'continue', p), y = share(ws, a, p); return x !== null && y !== null ? x - y : null; };
const cS = bootstrap(cohort, (ws) => diff(ws, 'shuffle-all'), BOOTSTRAP), cR = bootstrap(cohort, (ws) => diff(ws, 'reinit'), BOOTSTRAP);
out(`   aged minus shuffled: ${f(diff(cohort, 'shuffle-all'))} ${ci(cS)}; aged minus fresh: ${f(diff(cohort, 'reinit'))} ${ci(cR)}`);
const sA = share(cohort, 'continue'), sS = share(cohort, 'shuffle-all'), sR = share(cohort, 'reinit');
out(`   The note's reading: ${sA >= sS ? 'the aged share is equal to or above the shuffled share: no filter is seen'
  : sA < sR && cS[1] !== null && cS[1] < 0 ? 'the aged share is below both, and the interval of aged minus shuffled lies below 0: the natural establishments agree with a first-byte filter in the aged soup'
  : 'the aged share is lower, but not as the rule asks: it cannot say'}`);

// 2. Descriptive
out('\n2. Descriptive (fixed in the note)');
out('   a. Per establishment, the share of the dominant group\'s working robust lineages that are vulnerable (aged partners), averaged over the establishments');
for (const soup of ARMS) {
  const S = est.filter((e) => e.b.soup === soup).map((e) => { const W = e.R.filter((x) => works(x.aged)); return W.length ? W.filter((x) => vulnerable(x.aged)).length / W.length : null; }).filter((x) => x !== null);
  out(`   ${soup.padEnd(12)} ${S.length} establishments with a working robust lineage; the mean share ${f(S.length ? S.reduce((s, x) => s + x, 0) / S.length : null)}`);
}
out('   b. All the working robust lineages (aged partners): in the dominant group, among the vulnerable ones and among the others (counts; the lineages of a branch are not independent)');
for (const soup of ARMS) {
  const X = B.filter((b) => b.soup === soup).flatMap((b) => b.lineages.filter((x) => x.robust && works(x.aged)));
  const v = X.filter((x) => vulnerable(x.aged)), o = X.filter((x) => !vulnerable(x.aged));
  out(`   ${soup.padEnd(12)} ${X.length} working robust lineages; vulnerable ${v.length}, of which in the dominant group ${pct(v.filter((x) => x.dominant).length, v.length)}; the others ${o.length}, in the dominant group ${pct(o.filter((x) => x.dominant).length, o.length)}`);
}
out('   c. The main measure with the partners of the program\'s own soup (the aged soup\'s are the same)');
for (const soup of ARMS) { const t = tally(soup, 'own'); out(`   ${soup.padEnd(12)} the founder works ${t.work}; vulnerable ${pct(t.vuln, t.work)}`); }
out(`   aged minus shuffled: ${f(diff(cohort, 'shuffle-all', 'own'))}; aged minus fresh: ${f(diff(cohort, 'reinit', 'own'))}`);
out('   d. The founders (aged partners): the share of their copies with the other partners that keep the first byte, and their heritable copies with the ] and the 0 partners (of 20)');
for (const soup of ARMS) {
  const F = est.filter((e) => e.b.soup === soup && e.founder).map((e) => e.founder.aged);
  const keep = F.filter((c) => c.other.c > 0).map((c) => Math.round((100 * c.other.keep) / c.other.c));
  out(`   ${soup.padEnd(12)} keep the first byte (% of copies): ${dist(keep)}; heritable with ]: ${dist(F.map((c) => c[']'].h))}; with 0: ${dist(F.map((c) => c['0'].h))}; vulnerable to 0: ${F.filter(vulnerableTo0).length} of ${F.filter(works).length} working`);
}
