// The test tube (exploratory): the analysis fixed in the note (README.md), before computing.
//
//   node fase2/resultats/arrelament/proveta/analisi.mjs [--check] > fase2/resultats/arrelament/proveta/analisi-sortida.txt
//
// It reads programes.json, the parts proveta-FIRST-LAST.jsonl (which must cover the 60 worlds of the cohort, each once, from the same clean
// commit and the same programes.json) and the pilot's part-A records (for the rooting shares of the planted genotypes). If anything is
// missing or does not fit, it reads nothing. With --check, it validates the data and prints only the counts of what it read, no share.
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { partA, bootstrap } from '../../../../eines/arrelament-analisi.mjs';
import { DESIGN } from '../../../../eines/arrelament.mjs';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { ROOT, PILOT, HERE, SOUPS, KINDS, PLANTED, CONDITIONS, PROGRAMS_CAP, BOOTSTRAP, sha256, readJsonl } from './comu.mjs';

const args = process.argv.slice(2);
const check = args.includes('--check');
if (args.length !== (check ? 1 : 0)) { console.error('usage: node analisi.mjs [--check]'); process.exit(2); }
const out = (s = '') => console.log(s);
const f = (x, k = 3) => (x === null || x === undefined || !Number.isFinite(x) ? '—' : x.toFixed(k));
const ci = ([lo, hi], k = 3) => `[${f(lo, k)}, ${f(hi, k)}]`;
const problems = [];
const isN = (x) => Number.isSafeInteger(x) && x >= 0;

// 0. The data, complete
const m = JSON.parse(readFileSync(join(ROOT, PILOT, 'manifest.json'), 'utf8'));
const cohort = m.worlds.filter((w) => w.included).map((w) => w.world);
const progText = readFileSync(join(ROOT, HERE, 'programes.json'));
const P = JSON.parse(progText);
if (P.type !== 'programs' || String(P.code).includes('+')) problems.push('programes.json is not a clean list of programs');
const entries = [...(P.planted ?? []), ...(P.founders ?? []), ...(P.others ?? [])];
if ((P.planted ?? []).map((e) => e.id).join() !== PLANTED.join()) problems.push('programes.json: the planted genotypes are not G1 to G4');
for (const e of entries) {
  if (!Array.isArray(e.programs) || !e.programs.length || e.programs.length > PROGRAMS_CAP || e.programs.some((h) => !/^[0-9a-f]{128}$/.test(h))) problems.push(`programes.json: ${e.id} has no valid programs`);
  if (e.id.startsWith('F:') || e.id.startsWith('L:')) { if (!cohort.includes(e.world) || !SOUPS.includes(e.soup)) problems.push(`programes.json: ${e.id} is of no world or soup of the cohort`); }
}
if (new Set(entries.map((e) => e.id)).size !== entries.length) problems.push('programes.json: an entry twice');
const files = readdirSync(join(ROOT, HERE)).filter((x) => /^proveta-\d+-\d+\.jsonl$/.test(x)).sort();
const tests = new Map(), covered = new Array(cohort.length).fill(0);
let code = null, lines = 0;
for (const file of files) {
  let L;
  try { L = readJsonl(join(ROOT, HERE, file)); } catch { problems.push(`${file} is not valid JSONL`); continue; }
  const s = L[0], e = L.at(-1);
  if (!s || s.type !== 'start' || !e || e.type !== 'end') { problems.push(`${file} is not complete`); continue; }
  if (String(s.code).includes('+') || (code !== null && s.code !== code)) problems.push(`${file} is of ${s.code}`);
  code = code ?? s.code;
  if (s.programsSha256 !== sha256(progText) || s.conditions !== CONDITIONS) problems.push(`${file} is not of this programes.json or of ${CONDITIONS} conditions`);
  const [a, b] = s.worlds ?? [];
  if (`proveta-${a}-${b}.jsonl` !== file) problems.push(`${file} says the worlds ${a} to ${b}`);
  for (let i = a; i <= b; i++) covered[i - 1]++;
  const ws = L.filter((l) => l.type === 'world');
  if (ws.length !== b - a + 1 || e.worlds !== ws.length || ws.some((l, k) => l.position !== a + k || l.world !== cohort[a + k - 1])) problems.push(`${file}: the world lines are not its worlds`);
  let n = 0;
  for (const l of L.slice(1, -1)) {
    if (l.type === 'world') continue;
    if (l.type !== 'test') { problems.push(`${file}: an unexpected line type`); break; }
    const key = `${l.entry}|${l.p}|${l.world}|${l.kind}`;
    if (tests.has(key)) problems.push(`${file}: ${key} twice`);
    const ok = l.n === CONDITIONS && [l.solo, l.hSolo, l.context, l.hContext, l.heritable].every((x) => isN(x) && x <= l.n)
      && l.hSolo <= l.solo && l.hContext <= l.context && l.heritable >= Math.max(l.hSolo, l.hContext) && l.heritable <= l.hSolo + l.hContext;
    if (!ok) problems.push(`${file}: impossible counts in ${key}`);
    tests.set(key, l); n++;
  }
  if (e.tests !== n * CONDITIONS) problems.push(`${file}: the end line does not count what is there`);
  lines += n;
}
if (covered.some((c) => c !== 1)) problems.push(`the parts do not cover the ${cohort.length} worlds, each once`);
let expected = 0;
for (const e of entries) {
  const all = !e.id.startsWith('L:');
  e.programs.forEach((_, p) => {
    for (const w of all ? cohort : [e.world]) for (const kind of all ? KINDS : [e.soup]) {
      expected++;
      if (!tests.has(`${e.id}|${p}|${w}|${kind}`)) problems.push(`no test of ${e.id} ${p} with ${w} ${kind}`);
    }
  });
}
if (tests.size !== expected) problems.push(`${tests.size} tests, not ${expected}`);
// the pilot's rooting shares of the planted genotypes (one cell), from the part-A records
const pR = {};
for (const v of PLANTED) for (const soup of SOUPS) {
  const bs = m.branches.filter((b) => b.part === 'A' && b.variant === v && b.soup === soup && cohort.includes(b.world));
  let k = 0;
  for (const b of bs) {
    const L = readJsonl(join(ROOT, PILOT, 'part-a', `${b.id}.jsonl`));
    if (L[0].type !== 'start' || L.at(-1).type !== 'end') { problems.push(`${b.id}: the record is not complete`); continue; }
    if (partA(L, { start: DESIGN.age, horizon: DESIGN.horizonA }).outcome === 'arrela') k++;
  }
  pR[`${v}|${soup}`] = bs.length ? k / bs.length : null;
}
out(`The test tube: do the natural founders fit their own soup? (exploratory). The analysis: ${codeVersion()}, ${process.version}.`);
out(`programes.json: ${P.code} ${P.node}, ${P.planted?.length} planted, ${P.founders?.length} founders, ${P.others?.length} natural lineages that did not become established; the parts: ${files.length} (${code}), ${lines} lines of ${expected}.`);
if (problems.length) { out(`\nNothing is analysed: ${problems.length} problems.\n- ${problems.slice(0, 30).join('\n- ')}`); process.exit(1); }
if (check) { out('--check: all the data were read and are valid; no share is printed.'); process.exit(0); }

// the heritable share: of a program, the share of its conditions; of an entry, the mean over its programs
const share = (e, w, kind, field = 'heritable') => e.programs.reduce((s, _, p) => s + tests.get(`${e.id}|${p}|${w}|${kind}`)[field] / CONDITIONS, 0) / e.programs.length;
const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
const byId = new Map(entries.map((e) => [e.id, e]));
const H = (id, ws, kind, field) => mean(ws.map((w) => share(byId.get(id), w, kind, field)));
const below1 = ([lo, hi]) => hi !== null && hi < 1, above1 = ([lo]) => lo !== null && lo > 1, has1 = ([lo, hi]) => lo !== null && lo <= 1 && 1 <= hi;
const verdict0 = ([lo, hi]) => (lo === null ? 'cannot say' : hi < 0 ? 'below 0' : lo > 0 ? 'above 0' : 'contains 0');
const verdict1 = ([lo, hi]) => (lo === null ? 'cannot say' : hi < 1 ? 'below 1' : lo > 1 ? 'above 1' : 'contains 1');
const ratio = (a, b) => (a !== null && b ? a / b : null);

// 1. Calibration
out('\n1. Calibration: the planted genotypes, the mean heritable share over the 60 worlds (either role; the program first; second), against the pilot\'s pR');
const ranks = (a) => { const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]); const r = new Array(a.length); for (let i = 0; i < idx.length;) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1; i = j + 1; } return r; };
const spearman = (x, y) => { const rx = ranks(x), ry = ranks(y), mx = mean(rx), my = mean(ry); let a = 0, b = 0, c = 0; for (let i = 0; i < x.length; i++) { a += (rx[i] - mx) * (ry[i] - my); b += (rx[i] - mx) ** 2; c += (ry[i] - my) ** 2; } return b && c ? a / Math.sqrt(b * c) : null; };
const pts = [];
for (const v of PLANTED) {
  for (const soup of SOUPS) {
    const h = H(v, cohort, soup);
    pts.push([h, pR[`${v}|${soup}`]]);
    out(`   ${v}  ${soup.padEnd(12)} ${f(h)} (${f(H(v, cohort, soup, 'hSolo'))}; ${f(H(v, cohort, soup, 'hContext'))}); pR ${f(pR[`${v}|${soup}`], 2)}`);
  }
}
const rho = spearman(pts.map((p) => p[0]), pts.map((p) => p[1]));
out(`   Spearman over the 12 points: ${f(rho, 2)}`);
const c1 = SOUPS.every((s) => Math.min(H('G2', cohort, s), H('G3', cohort, s)) > Math.max(H('G1', cohort, s), H('G4', cohort, s)));
const rG = (v, a, b, field) => (ws) => ratio(H(v, ws, a, field), H(v, ws, b, field));
const ciG1 = bootstrap(cohort, rG('G1', 'continue', 'reinit'), BOOTSTRAP);
out(`   C1, G2 and G3 above G1 and G4 in each soup: ${c1 ? 'yes' : 'no'}`);
out(`   C2, G1 aged against fresh: ${f(rG('G1', 'continue', 'reinit')(cohort))} ${ci(ciG1)} (${verdict1(ciG1)})`);
out(`   reported: G4 aged against fresh ${f(rG('G4', 'continue', 'reinit')(cohort))} ${ci(bootstrap(cohort, rG('G4', 'continue', 'reinit'), BOOTSTRAP))}; shuffled against fresh, G1 ${f(rG('G1', 'shuffle-all', 'reinit')(cohort))} ${ci(bootstrap(cohort, rG('G1', 'shuffle-all', 'reinit'), BOOTSTRAP))}, G4 ${f(rG('G4', 'shuffle-all', 'reinit')(cohort))} ${ci(bootstrap(cohort, rG('G4', 'shuffle-all', 'reinit'), BOOTSTRAP))}`);
const passes = c1 && below1(ciG1);
out(`   The note's reading: ${passes ? 'the test tube passes the calibration; questions 2 to 4 are read by the note\'s rules' : 'the test tube fails the calibration: questions 2 to 5 are reported as numbers, with no reading'}`);
const read = (s) => (passes ? s : 'not read (the calibration failed)');

// the founders, by the soup they were born in; the bootstrap resamples the worlds of the founders
const F = P.founders;
const group = (soup) => F.filter((x) => x.soup === soup);
const pick = (ws, soup) => ws.flatMap((w) => F.filter((x) => x.world === w && x.soup === soup));
const others = (x) => cohort.filter((w) => w !== x.world);
const Hgen = (x, kind) => mean(others(x).map((w) => share(x, w, kind)));

// 2. To the kind of soup
out('\n2. To the kind of soup: each founder\'s mean heritable share with the aged and the fresh soups of the other worlds, and D, the first minus the second');
for (const soup of SOUPS) {
  const X = group(soup);
  out(`   born in ${soup.padEnd(12)} ${X.length} founders; with aged soups ${f(mean(X.map((x) => Hgen(x, 'continue'))))}, with fresh soups ${f(mean(X.map((x) => Hgen(x, 'reinit'))))}; the mean D ${f(mean(X.map((x) => Hgen(x, 'continue') - Hgen(x, 'reinit'))))}`);
}
const Dmean = (X) => mean(X.map((x) => Hgen(x, 'continue') - Hgen(x, 'reinit')));
const inter = (ws) => { const a = pick(ws, 'continue'), b = pick(ws, 'reinit'); return a.length && b.length ? Dmean(a) - Dmean(b) : null; };
const ciI = bootstrap(cohort, inter, BOOTSTRAP);
out(`   The interaction (the mean D of the founders born in aged soups minus that of those born in fresh soups): ${f(inter(cohort))} ${ci(ciI)} (${verdict0(ciI)}; width ${f(ciI[1] !== null ? ciI[1] - ciI[0] : null)})`);
out(`   The note's reading: ${read(verdict0(ciI) === 'above 0' ? 'the founders fit the kind of soup they were born in (in the test tube)' : verdict0(ciI) === 'contains 0' ? 'no fit to the kind of soup could be seen' : verdict0(ciI) === 'below 0' ? 'the opposite of a fit to the kind of soup' : 'cannot say')}`);

// 3. To its own soup
out('\n3. To its own soup: each founder\'s heritable share with its own world\'s soup of its birth, minus the mean with the same soup of the other worlds');
const Sp = (x) => share(x, x.world, x.soup) - Hgen(x, x.soup);
const sp = {};
for (const soup of SOUPS) {
  const stat = (ws) => { const X = pick(ws, soup); return X.length ? mean(X.map(Sp)) : null; };
  sp[soup] = bootstrap(cohort, stat, BOOTSTRAP);
  out(`   born in ${soup.padEnd(12)} ${group(soup).length} founders; own ${f(mean(group(soup).map((x) => share(x, x.world, x.soup))))}, others ${f(mean(group(soup).map((x) => Hgen(x, x.soup))))}; the mean difference ${f(stat(cohort))} ${ci(sp[soup])} (${verdict0(sp[soup])})`);
}
out(`   The note's reading (the founders of the aged soups): ${read(verdict0(sp.continue) === 'above 0' ? 'they fit their own soup beyond its kind' : `no fit to their own soup beyond its kind could be seen (${verdict0(sp.continue)})`)}`);

// 4. The first byte
out('\n4. The first byte: the mean heritable share with the fixed pools against the placebo pools (either role; the program first)');
const rFix = (v, field) => (ws) => ratio(H(v, ws, 'fixed', field), H(v, ws, 'placebo', field));
const ciFix = {};
for (const v of ['G1', 'G4']) {
  ciFix[v] = bootstrap(cohort, rFix(v), BOOTSTRAP);
  out(`   ${v}  fixed ${f(H(v, cohort, 'fixed'))}, placebo ${f(H(v, cohort, 'placebo'))}, aged ${f(H(v, cohort, 'continue'))}, fresh ${f(H(v, cohort, 'reinit'))}: ${f(rFix(v)(cohort))} ${ci(ciFix[v])} (${verdict1(ciFix[v])}); the program first ${f(rFix(v, 'hSolo')(cohort))} ${ci(bootstrap(cohort, rFix(v, 'hSolo'), BOOTSTRAP))}`);
}
const gap = (ws) => { const d = H('G1', ws, 'reinit') - H('G1', ws, 'continue'); return d ? (H('G1', ws, 'fixed') - H('G1', ws, 'placebo')) / d : null; };
out(`   G1, the share of its aged-against-fresh gap that the fixed pools close: ${f(gap(cohort))} ${ci(bootstrap(cohort, gap, BOOTSTRAP))}`);
for (const soup of SOUPS) {
  const stat = (field) => (ws) => { const X = pick(ws, soup); return X.length ? ratio(mean(X.map((x) => mean(cohort.map((w) => share(x, w, 'fixed', field))))), mean(X.map((x) => mean(cohort.map((w) => share(x, w, 'placebo', field)))))) : null; };
  out(`   the founders born in ${soup.padEnd(12)} ${f(stat('heritable')(cohort))} ${ci(bootstrap(cohort, stat('heritable'), BOOTSTRAP))}; the program first ${f(stat('hSolo')(cohort))} ${ci(bootstrap(cohort, stat('hSolo'), BOOTSTRAP))}`);
}
out(`   The note's reading: ${read(above1(ciFix.G1) && has1(ciFix.G4) ? 'G1 above 1 and G4 contains 1: the first byte acts in the test tube' : `none of the fixed cases (G1 ${verdict1(ciFix.G1)}, G4 ${verdict1(ciFix.G4)})`)}`);

// 5. Descriptive
out('\n5. Descriptive: the heritable share with its own soup of its own world, the founders against the natural lineages that did not become established');
const median = (a) => { if (!a.length) return null; const s = [...a].sort((p, q) => p - q); return (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2; };
for (const soup of SOUPS) {
  const a = group(soup).map((x) => share(x, x.world, x.soup)), b = P.others.filter((x) => x.soup === soup).map((x) => share(x, x.world, x.soup));
  out(`   ${soup.padEnd(12)} founders ${a.length}: mean ${f(mean(a))}, median ${f(median(a))}; the others ${b.length}: mean ${f(mean(b))}, median ${f(median(b))}`);
}
