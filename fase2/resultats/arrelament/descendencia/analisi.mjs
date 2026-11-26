// A measure of descent by position (exploratory): the analysis fixed in the note (README.md), before computing.
//
//   node fase2/resultats/arrelament/descendencia/analisi.mjs [--check] > fase2/resultats/arrelament/descendencia/analisi-sortida.txt
//
// It reads the list (../registre-copies/llista.json), the pilot's records, the data of ../registre-copies/dades.mjs and this note's
// records (registres/), validated by valida.mjs (closed by default). With --check, it validates and prints only counts, no score and no
// class (the short test). It reads nothing if the instrument's checks (prova-sortida.txt) did not all pass. The world is the unit of the
// bootstrap. --registres DIR reads another folder: only for prova.mjs's synthetic records.
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { bootstrap } from '../../../../eines/arrelament-analisi.mjs';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { load, ROOT, ARMS, sha256 } from '../registre-copies/dades.mjs';
import { WINDOWS, VARIANTS, MAIN, RUN, EDGES, EDGE, MIN_HALF, MIN_FAR, SENS_Q, FAR_MAX, COPY_PCT, NOT_PCT, NULL_MAX, quantile, shareAtLeast, percentile } from './traca.mjs';
import { validate, pilotFacts } from './valida.mjs';

const HERE = 'fase2/resultats/arrelament/descendencia', LIST = 'fase2/resultats/arrelament/registre-copies/llista.json';
const LIST_SHA256 = 'c0afb2c0f182f9224d3ce447433255787a7068c063db9c7459c02dbac4bca4f2';
const BOOTSTRAP = { count: 10000, seed: 3100000000 };   // the within-world null note's: R0 and R1 must come out as there
const args = process.argv.slice(2), check = args.includes('--check'), ri = args.indexOf('--registres');
const recDir = ri >= 0 ? args[ri + 1] : join(ROOT, HERE, 'registres');
if (args.length !== (check ? 1 : 0) + (ri >= 0 ? 2 : 0) || (ri >= 0 && !args[ri + 1])) { console.error('usage: node analisi.mjs [--check] [--registres DIR]'); process.exit(2); }
const out = (s = '') => console.log(s);
const f = (x, k = 2) => (x === null || x === undefined || !Number.isFinite(x) ? '—' : x.toFixed(k));
const ci = ([lo, hi]) => `[${f(lo)}, ${f(hi)}]`;
const verdict = (c) => (c[0] === null ? 'cannot say' : c[0] > 1 ? 'above 1' : c[1] < 1 ? 'below 1' : 'contains 1');
const stop = (why) => { out(`\nNothing is analysed: ${why}`); process.exit(1); };
const [MAINW, SHORTW] = WINDOWS;

const listText = readFileSync(join(ROOT, LIST));
out(`A measure of descent by position (exploratory). The analysis: ${codeVersion()}, ${process.version}; the list, SHA-256 ${sha256(listText).slice(0, 16)}….`);
if (sha256(listText) !== LIST_SHA256) stop('the list is not the note\'s');
const list = JSON.parse(listText.toString());
// the instrument's checks must all have passed (prova-sortida.txt, in git with the note's checks), except for prova.mjs's own test
if (ri < 0) {
  const pf = join(ROOT, HERE, 'prova-sortida.txt');
  if (!existsSync(pf) || !readFileSync(pf, 'utf8').trim().endsWith('All the checks pass.')) stop('the instrument\'s checks (prova-sortida.txt) did not all pass');
}

// The records, validated against the list and the pilot's records
const readJsonl = (file) => readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const pilot = pilotFacts(list, (rel) => readJsonl(join(ROOT, rel)));
if (!existsSync(recDir)) stop('no folder of records');
const files = readdirSync(recDir);
const records = new Map();
for (const br of list.branches) {
  const file = join(recDir, `${br.id}.jsonl`);
  if (!existsSync(file)) continue;
  try { records.set(br.id, readJsonl(file)); } catch { stop(`${br.id}: the record is not valid JSONL`); }
}
const v = validate({ list, records, files, pilot });
if (v.problems.length) stop(`${v.problems.length} problems:\n- ${v.problems.slice(0, 20).join('\n- ')}`);
const nApp = list.branches.reduce((s, b) => s + b.observers.reduce((t, o) => t + o.appearances.length, 0), 0);
out(`The records: ${records.size} branches, of ${v.code}; ${nApp} appearances at ${list.branches.reduce((s, b) => s + b.observers.length, 0)} tracked censuses; every line the list asks for, once; the seeds, the measures (${[...records.values()].reduce((s, L) => s + L.at(-1).measuresChecked, 0)}) and the final fingerprints, those of the pilot records.`);
if (check) { out('--check: all the records were read and are valid; no score and no class is printed.'); process.exit(0); }

const d = load();
if (d.problems.length) stop(`the data are not valid (${d.problems[0]})`);
const { B, failed, wb } = d;
const n0 = ARMS.map((s) => B.filter((b) => b.soup === s).reduce((t, b) => t + failed(b).length, 0));
if (n0.join() !== '33,14,8') stop(`R0 is not the within-world null note's (${n0.join(', ')})`);

// The controls of a census's set, for a variant: q10 (90 % of half B reach it), the run K that counts as descent, the far cells reaching
// K, and whether the census is valid (sensitivity: q10 at K or above; specificity: 5 % of the far cells or fewer at K)
const runOf = (key) => RUN[VARIANTS.find((v) => v.key === key).mode];
const controls = (info, key) => {
  const K = runOf(key);
  if (!info) return { valid: false, why: 'no D', q: null, K, farShare: null };
  const q = quantile(info.heldOut[key], SENS_Q), farShare = shareAtLeast(info.far.hist[key], K);
  const why = info.B < MIN_HALF ? `half B has ${info.B} carriers` : info.far.cells < MIN_FAR ? `${info.far.cells} far cells` : !(q >= K) ? `q10 ${q} is below ${K}` : farShare > FAR_MAX ? `${f(farShare, 3)} of the far cells reach ${K}` : null;
  return { valid: !why, why, q, K, farShare };
};
const get = (br, type, epoch, w, pred = () => true) => records.get(br.id).find((l) => l.type === type && l.epoch === epoch && l.window === w && pred(l));

// 0. The controls of each census
out('\n0. The controls of each census (D; the main measure: adjacent bytes whose origins are adjacent in the map, the map at 1 % of half A)');
out('   soup        branch  census  window  D carriers (excluded)  half A / B  thr  q10   far cells, share ≥ K (15)  valid');
for (const br of list.branches) for (const o of br.observers) for (const w of WINDOWS) {
  const c = get(br, 'census', o.epoch, w), x = c.D, k = controls(x, MAIN);
  out(`   ${br.soup.padEnd(11)} ${String(br.world).padEnd(7)} ${String(o.epoch).padEnd(7)} ${String(w).padEnd(7)} ${x ? `${x.carriers} (${x.excluded})`.padEnd(22) : '—'.padEnd(22)} ${x ? `${x.A} / ${x.B}`.padEnd(11) : '—'.padEnd(11)} ${x ? String(x.thr[MAIN]).padEnd(4) : '—   '} ${k.q === null ? '—   ' : String(k.q).padEnd(5)} ${x ? `${x.far.cells}, ${f(k.farShare, 3)}`.padEnd(23) : '—'.padEnd(23)} ${k.valid ? 'yes' : `no (${k.why})`}`);
}

// 1. Each appearance
const classify = (br, o, y, w, key) => {
  if (o.why === 'burst') return { cls: 'no dominant group' };
  const c = get(br, 'census', o.epoch, w), a = get(br, 'appearance', o.epoch, w, (l) => l.id === y.id), k = controls(c.D, key);
  if (!c.D) return { cls: 'unclassifiable', why: 'no earlier dominant lineage' };
  if (!k.valid) return { cls: 'unclassifiable', why: k.why, q: k.q };
  const s = a.descent[key] / y.cells.length, pct = percentile(a.baseline.descent[key], s);
  return { cls: s >= k.K && pct >= COPY_PCT ? 'a copy of D' : s < k.K && pct <= NOT_PCT ? 'not a copy of D' : 'undecided', s, q: k.q, pct };
};
const rows = [];
for (const br of list.branches) for (const o of br.observers) for (const y of o.appearances) {
  const a = get(br, 'appearance', o.epoch, MAINW, (l) => l.id === y.id);
  const sens = Object.fromEntries([...VARIANTS.filter((x) => x.key !== MAIN).map((x) => [x.key, classify(br, o, y, MAINW, x.key).cls]), ['w250', classify(br, o, y, SHORTW, MAIN).cls]]);
  rows.push({ br, o, y, a, main: classify(br, o, y, MAINW, MAIN), sens, T: o.why === 'time rule' });
}
out('\n1. Each appearance (the main window, the main measure; the score and q10 per cell, of 63 pairs)');
out(`   soup        branch  census  appearance  cells  score  q10  matched: mean, percentile  class              exposure  mut. new  | sensitivities: ${[...VARIANTS.filter((x) => x.key !== MAIN).map((x) => x.key), 'w250'].join(', ')}`);
for (const r of rows) {
  const m = r.main, bl = r.a.baseline, mean = bl ? bl.descent[MAIN].reduce((x, y) => x + y, 0) / bl.descent[MAIN].length : null;
  out(`   ${r.br.soup.padEnd(11)} ${String(r.br.world).padEnd(7)} ${String(r.o.epoch).padEnd(7)} ${r.y.id.padEnd(11)} ${String(r.y.cells.length).padEnd(6)} ${f(m.s, 1).padEnd(6)} ${m.q === undefined || m.q === null ? '—  ' : String(m.q).padEnd(4)} ${bl ? `${f(mean, 1)}, ${f(m.pct)}`.padEnd(26) : '—'.padEnd(26)} ${m.cls.padEnd(18)} ${r.a.exposureD === null ? '—   ' : f(r.a.exposureD / r.a.bytes)}      ${f(r.a.mutNew / r.a.bytes)}      | ${Object.values(r.sens).join(', ')}${m.why ? `  (${m.why})` : ''}`);
}

// 2. The classes, by soup (the time rule's appearances)
out('\n2. The classes of the appearances the time rule removes, by soup (main window, main measure; and the sensitivities)');
const CLASSES = ['a copy of D', 'not a copy of D', 'undecided', 'unclassifiable'];
const tally = (T, pick) => CLASSES.map((c) => `${c} ${T.filter((r) => pick(r) === c).length}`).join(', ');
for (const s of ARMS) {
  const T = rows.filter((r) => r.br.soup === s && r.T);
  out(`   ${s.padEnd(12)} ${T.length}: ${tally(T, (r) => r.main.cls)}`);
  for (const k of Object.keys(rows[0].sens)) out(`      ${k.padEnd(9)} ${tally(T, (r) => r.sens[k])}`);
}

// 3. One origin: the appearances of one census (main window), by the 16-byte rule and its local null
out('\n3. The appearances of one census (two or more): how many origins (shared pairs of adjacent origins: 15, a run of 16 bytes; 7 and 31, sensitivities; the local null)');
const comps = new Map();   // `${br.id}|${epoch}` -> { of: id -> component, ok }
for (const br of list.branches) for (const o of br.observers) {
  if (o.appearances.length < 2) continue;
  const pairs = records.get(br.id).filter((l) => l.type === 'pair' && l.epoch === o.epoch && l.window === MAINW);
  const nullPairs = pairs.reduce((s, p) => s + p.nullPairs, 0);
  const res = {};
  for (const e of EDGES) {
    const nullRate = nullPairs ? pairs.reduce((s, p) => s + p.nullHist.slice(e).reduce((a, b) => a + b, 0), 0) / nullPairs : null;
    const parent = Object.fromEntries(o.appearances.map((y) => [y.id, y.id]));
    const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    for (const p of pairs) if (p.shared >= e) parent[find(p.a)] = find(p.b);
    const of = Object.fromEntries(o.appearances.map((y) => [y.id, find(y.id)]));
    res[e] = { nullRate, ok: nullRate !== null && nullRate < NULL_MAX, n: new Set(Object.values(of)).size, of };
  }
  comps.set(`${br.id}|${o.epoch}`, res[EDGE]);
  const show = (e) => `${e} pairs: ${res[e].ok ? `${res[e].n} origins` : 'cannot tell'} (null ${f(res[e].nullRate, 3)})`;
  const nA = nullPairs ? pairs.reduce((s, p) => s + p.nullHistAligned.slice(16).reduce((a, b) => a + b, 0), 0) / nullPairs : null;
  out(`   ${br.soup.padEnd(11)} ${String(br.world).padEnd(7)} ${String(o.epoch).padEnd(7)} ${o.appearances.length} appearances: ${EDGES.map(show).join('; ')}; the largest shared between two, ${Math.max(...pairs.map((p) => p.shared))}; by absolute position (16 bytes, descriptive), ${pairs.filter((p) => p.aligned >= 16).length} pairs joined, null ${f(nA, 3)}`);
}

// 4. The recount
out('\n4. The recount (the failed appearances per 1,000 world-epochs; the aged/fresh ratio, with the bootstrap over worlds)');
const lam = (ws, soup, cnt) => { let k = 0, e = 0; for (const x of ws) { k += cnt(x[soup]); e += x[soup].exposure; } return e ? (1000 * k) / e : null; };
const rq = (cnt) => (ws) => { const a = lam(ws, 'continue', cnt), r = lam(ws, 'reinit', cnt); return a !== null && r ? a / r : null; };
const results = {};
const line = (name, key, cnt) => {
  const n = ARMS.map((s) => B.filter((b) => b.soup === s).reduce((t, b) => t + cnt(b), 0));
  const c = bootstrap(wb, rq(cnt), BOOTSTRAP);
  out(`   ${name.padEnd(64)} ${n.join(', ')}; aged/fresh ${f(rq(cnt)(wb))} ${ci(c)} (${verdict(c)})`);
  results[key] = { n, c };
};
const Tr = (b, y) => b.ev !== null && b.ev.epoch - y.first <= 1250;
const clsOf = (b, y, pick) => { const r = rows.find((x) => x.br.id === b.id && x.y.id === y.id); if (!r) throw new Error(`${b.id} ${y.id}: a time-rule appearance not in the list`); return pick(r); };
const keepRd = (pick) => (b) => failed(b).filter((y) => !Tr(b, y) || clsOf(b, y, pick) === 'not a copy of D').length;
const keepRdPlus = (pick) => (b) => failed(b).filter((y) => !Tr(b, y) || clsOf(b, y, pick) !== 'a copy of D').length;
const collapsed = (b) => {
  const kept = failed(b).filter((y) => !Tr(b, y) || clsOf(b, y, (r) => r.main.cls) === 'not a copy of D');
  let k = kept.length;
  for (const br of list.branches.filter((x) => x.id === b.id)) for (const o of br.observers) {
    const c = comps.get(`${br.id}|${o.epoch}`);
    if (!c || !c.ok) continue;
    const here = kept.filter((y) => o.appearances.some((a) => a.id === y.id)).map((y) => c.of[y.id]);
    k -= here.length - new Set(here).size;
  }
  return k;
};
line('R0, no rule (as the within-world null note)', 'R0', (b) => failed(b).length);
line('R1, the time rule (as the within-world null note)', 'R1', (b) => failed(b).filter((y) => !Tr(b, y)).length);
line('Rd, only the time rule\'s "not a copy of D" kept (main)', 'Rd', keepRd((r) => r.main.cls));
line('Rd+, only the time rule\'s "a copy of D" removed (sensitivity)', 'RdPlus', keepRdPlus((r) => r.main.cls));
line('Rd′, Rd with each census\'s appearances counted by origins', 'RdPrime', collapsed);
for (const k of Object.keys(rows[0].sens)) line(`sensitivity: Rd, ${k}`, `Rd_${k}`, keepRd((r) => r.sens[k]));

// 5. The reading, by the rules fixed in the note
out('\n5. The reading, by the rules fixed in the note');
const aged = rows.filter((r) => r.br.soup === 'continue' && r.T), cl = aged.filter((r) => r.main.cls !== 'unclassifiable');
const cp = cl.filter((r) => r.main.cls === 'a copy of D').length, nc = cl.filter((r) => r.main.cls === 'not a copy of D').length;
out(`   The aged soup's appearances the time rule removes: ${aged.length}; classifiable ${cl.length}: a copy of D ${cp}, not a copy of D ${nc}, undecided ${cl.length - cp - nc}.`);
out(`   ${!cl.length ? 'None is classifiable: no reading.'
  : cp >= (2 / 3) * cl.length ? 'Two thirds or more are copies of D: by position, they are copies of the dominant group\'s program, descent as the time rule assumed (for these appearances, with this measure).'
  : nc >= (2 / 3) * cl.length ? 'Two thirds or more are not copies of D: they are not copies of the dominant group\'s program, but new arrangements of its material.'
  : 'Neither two thirds copies nor two thirds not: cannot tell.'}`);
const rd = results.Rd.c;
out(`   The excess left (Rd): ${rd[0] !== null && rd[0] > 1 ? 'shown under this rule (the interval lies above 1).' : 'not shown under this rule (never "there is no excess").'}`);
out('   For the aged soup this is not an independent test of auditor 1\'s post hoc lead (the note, "What has already been seen").');
