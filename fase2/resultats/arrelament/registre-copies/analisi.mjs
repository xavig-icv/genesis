// The record of heritable copies, the small version (exploratory): the analysis fixed in the note (README.md), before computing.
//
//   node fase2/resultats/arrelament/registre-copies/analisi.mjs [--check] > fase2/resultats/arrelament/registre-copies/analisi-sortida.txt
//
// It reads llista.json, the records of registre.mjs (registres/) and the data of dades.mjs. With --check, it validates them and prints
// only counts, no share and no class (the short test). The world is the unit of the bootstrap.
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { bootstrap } from '../../../../eines/arrelament-analisi.mjs';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { load, ROOT, HERE, ARMS, sha256 } from './dades.mjs';
import { WINDOWS } from './traca.mjs';

const BOOTSTRAP = { count: 10000, seed: 3100000000 };   // the within-world null note's: R0 and R1 must come out as there
const DERIVED = 0.5, NOT_FROM = 0.125, EDGE = 16, POS = 0.95, FAR_MAX = 0.05, MIN_CARRIERS = 10;
// --registres DIR: another folder of records, only for the analysis's own test with synthetic records (prova.mjs, 7)
const args = process.argv.slice(2), check = args.includes('--check'), ri = args.indexOf('--registres');
const recDir = ri >= 0 ? args[ri + 1] : join(ROOT, HERE, 'registres');
if (args.length !== (check ? 1 : 0) + (ri >= 0 ? 2 : 0)) { console.error('usage: node analisi.mjs [--check] [--registres DIR]'); process.exit(2); }
const out = (s = '') => console.log(s);
const f = (x, k = 2) => (x === null || x === undefined || !Number.isFinite(x) ? '—' : x.toFixed(k));
const ci = ([lo, hi]) => `[${f(lo)}, ${f(hi)}]`;
const verdict = (c) => (c[0] === null ? 'cannot say' : c[0] > 1 ? 'above 1' : c[1] < 1 ? 'below 1' : 'contains 1');
const stop = (why) => { out(`\nNothing is analysed: ${why}`); process.exit(1); };
const MAIN = WINDOWS[0], SHORT = WINDOWS[1];

const listFile = join(ROOT, HERE, 'llista.json');
const list = JSON.parse(readFileSync(listFile, 'utf8'));
out(`The record of heritable copies, the small version (exploratory). The analysis: ${codeVersion()}, ${process.version}; llista.json, SHA-256 ${sha256(readFileSync(listFile)).slice(0, 16)}….`);
const d = load();
if (d.problems.length) stop(`the data are not valid (${d.problems[0]})`);
const { B, failed, wb } = d;
const n0 = ARMS.map((s) => B.filter((b) => b.soup === s).reduce((t, b) => t + failed(b).length, 0));
if (n0.join() !== '33,14,8') stop(`R0 is not the within-world null note's (${n0.join(', ')})`);

// The records of registre.mjs: one per branch, complete, of one commit with no unsaved change, and with every line the list asks for
const R = new Map(), codes = new Set(), problems = [];
for (const br of list.branches) {
  const file = join(recDir, `${br.id}.jsonl`);
  if (!existsSync(file)) { problems.push(`${br.id}: no record`); continue; }
  const L = readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const S = L[0], E = L.at(-1);
  if (S.type !== 'start' || E.type !== 'end' || S.branch !== br.id || E.branch !== br.id || L.some((l) => l.type === 'fail') || JSON.stringify(S.windows) !== JSON.stringify(WINDOWS)) { problems.push(`${br.id}: the record is not complete`); continue; }
  codes.add(S.code);
  for (const o of br.observers) for (const w of WINDOWS) {
    if (!L.some((l) => l.type === 'control' && l.epoch === o.epoch && l.window === w)) problems.push(`${br.id}: no control at ${o.epoch}, window ${w}`);
    for (const y of o.appearances) if (L.filter((l) => l.type === 'appearance' && l.epoch === o.epoch && l.window === w && l.id === y.id).length !== 1) problems.push(`${br.id}: ${y.id}, window ${w}, not once`);
  }
  R.set(br.id, L);
}
if (codes.size > 1 || [...codes].some((c) => String(c).includes('+'))) problems.push(`the records are of ${[...codes].join(', ')}: not one commit with no unsaved change`);
if (problems.length) stop(`${problems.length} problems:\n- ${problems.slice(0, 20).join('\n- ')}`);
const nApp = list.branches.reduce((s, b) => s + b.observers.reduce((t, o) => t + o.appearances.length, 0), 0);
out(`The records: ${R.size} branches, of ${[...codes][0]}; ${nApp} appearances at ${list.branches.reduce((s, b) => s + b.observers.length, 0)} tracked censuses; every measure and final fingerprint of the pilot records reproduced (${[...R.values()].reduce((s, L) => s + L.at(-1).measuresChecked, 0)} measures).`);
if (check) { out('--check: all the records were read and are valid; no share and no class is printed.'); process.exit(0); }

// 0. The instrument's controls
out('\n0. The instrument\'s controls (at each tracked census, the main window and the short one)');
let valid = true;
for (const w of WINDOWS) {
  let sets = 0, okSets = 0, worst = 1, farWorst = 0, farN = 0;
  for (const L of R.values()) for (const c of L.filter((l) => l.type === 'control' && l.window === w)) {
    for (const s of c.sets) if (s.carriers >= MIN_CARRIERS) { sets++; const r = s.ok / s.carriers; worst = Math.min(worst, r); if (r >= POS) okSets++; }
    if (c.far && c.far.cells) { farN++; farWorst = Math.max(farWorst, c.far.meanShare); }
  }
  out(`   window ${w}: sets with ${MIN_CARRIERS} carriers or more, ${sets}; with ${POS} or more of their carriers holding a full window with the set's bit, ${okSets} (the lowest share ${f(worst, 3)}); far cells (${'≥'}64 from the dominant group), the highest mean share of D, ${f(farWorst, 3)} (${farN} censuses)`);
  if (okSets !== sets || farWorst > FAR_MAX) valid = false;
}
if (!valid) stop('the instrument fails its controls (the note\'s rule): nothing is read.');
out('   By the note\'s rule, the instrument passes its controls.');

// 1. Each appearance
const rows = [];
for (const br of list.branches) for (const o of br.observers) for (const y of o.appearances) {
  const get = (w) => R.get(br.id).find((l) => l.type === 'appearance' && l.epoch === o.epoch && l.window === w && l.id === y.id);
  const a = get(MAIN), s = get(SHORT);
  const cls = (x, share) => (o.why === 'burst' ? 'no dominant group' : !o.dStrictLineages && share === 'dStrict' ? 'no earlier dominant lineage'
    : x.presentAtStart > 0 ? 'older than the window' : x[share] >= DERIVED ? 'D-derived' : x[share] <= NOT_FROM ? 'not from D' : 'mixed');
  rows.push({ br, o, y, a, s, cls: cls(a, 'dStrict'), cls250: cls(s, 'dStrict'), clsBroad: o.why === 'burst' ? 'no dominant group' : cls(a, 'dBroad') });
}
out('\n1. Each appearance (the main window: 1,250 epochs, or from the branch\'s start; the short one: 250)');
out('   soup        branch  census  appearance  cells  D (main)  class (main)                  D (250)  class (250)              Dbroad  baseline: distance, mean D, percentile  present at start (main/250)  mut  arith  self');
for (const r of rows) {
  const b = r.a.baseline;
  out(`   ${r.br.soup.padEnd(11)} ${String(r.br.world).padEnd(7)} ${String(r.o.epoch).padEnd(7)} ${r.y.id.padEnd(11)} ${String(r.y.cells.length).padEnd(6)} ${f(r.a.dStrict).padEnd(9)} ${r.cls.padEnd(29)} ${f(r.s.dStrict).padEnd(8)} ${r.cls250.padEnd(24)} ${f(r.a.dBroad).padEnd(7)} ${b ? `${b.distance}, ${f(b.meanShare)}, ${f(b.percentile)}` : '—'}  ${r.a.presentAtStart}/${r.s.presentAtStart}  ${f(r.a.mut)} ${f(r.a.arith)} ${f(r.a.self)}`);
}

// 2. The classes, by soup (the appearances the time rule removes)
out('\n2. The classes of the appearances the time rule removes, by soup');
const CLASSES = ['D-derived', 'mixed', 'not from D', 'older than the window', 'no earlier dominant lineage'];
for (const [lab, key] of [['main window', 'cls'], ['short window (250)', 'cls250'], ['Dbroad, main window', 'clsBroad']]) {
  out(`   ${lab}:`);
  for (const s of ARMS) {
    const T = rows.filter((r) => r.br.soup === s && r.o.why === 'time rule');
    out(`      ${s.padEnd(12)} ${T.length}: ${CLASSES.map((c) => `${c} ${T.filter((r) => r[key] === c).length}`).join(', ')}`);
  }
}

// 3. The appearances of one census of one branch: how many origins (the note's rule)
out('\n3. The appearances detected at one census of one branch (two or more): how many origins, by the note\'s rule (main window)');
const groups = [];
for (const br of list.branches) for (const o of br.observers) {
  if (o.appearances.length < 2) continue;
  const ys = rows.filter((r) => r.br === br && r.o === o), k = ys.length, parent = ys.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const byId = (r, id) => (r.a.members[id] ?? 0) * r.a.bytes;
  for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) {
    const A = ys[i].a, Bq = ys[j].a;
    const carry = byId(ys[i], ys[j].y.id) >= EDGE || byId(ys[j], ys[i].y.id) >= EDGE;
    const shared = Object.keys(A.origCells).some((c) => A.origCells[c] >= EDGE && (Bq.origCells[c] ?? 0) >= EDGE);
    if (carry || shared) parent[find(i)] = find(j);
  }
  const comps = new Set(ys.map((_, i) => find(i)));
  groups.push({ br, o, ys, comps: comps.size, of: ys.map((_, i) => find(i)) });
  out(`   ${br.soup.padEnd(11)} ${String(br.world).padEnd(7)} ${String(o.epoch).padEnd(7)} ${k} appearances: ${comps.size} origins`);
}

// 4. The recount
out('\n4. The recount (the failed appearances per 1,000 world-epochs; the aged/fresh ratio, with the bootstrap over worlds)');
const lam = (ws, soup, cnt) => { let k = 0, e = 0; for (const x of ws) { k += cnt(x[soup]); e += x[soup].exposure; } return e ? (1000 * k) / e : null; };
const rq = (cnt) => (ws) => { const a = lam(ws, 'continue', cnt), r = lam(ws, 'reinit', cnt); return a !== null && r ? a / r : null; };
const line = (name, cnt) => {
  const n = ARMS.map((s) => B.filter((b) => b.soup === s).reduce((t, b) => t + cnt(b), 0));
  const c = bootstrap(wb, rq(cnt), BOOTSTRAP);
  out(`   ${name.padEnd(58)} ${n.join(', ')}; aged/fresh ${f(rq(cnt)(wb))} ${ci(c)} (${verdict(c)})`);
  return { n, c };
};
const T = (b, y) => b.ev !== null && b.ev.epoch - y.first <= 1250;
const removed = (key) => (b) => rows.filter((r) => r.br.id === b.id && r[key] === 'D-derived').length;
line('R0, no rule (as the within-world null note)', (b) => failed(b).length);
line('R1, the time rule (as the within-world null note)', (b) => failed(b).filter((y) => !T(b, y)).length);
const rc = line('Rc, without the D-derived (main window)', (b) => failed(b).length - removed('cls')(b));
const collapsed = (b) => {
  let k = failed(b).length - removed('cls')(b);
  for (const g of groups.filter((x) => x.br.id === b.id)) {
    const keep = g.ys.map((r, i) => (r.cls === 'D-derived' ? null : g.of[i])).filter((x) => x !== null);
    k -= keep.length - new Set(keep).size;
  }
  return k;
};
const rc2 = line('Rc′, and each census\'s appearances counted by origins', collapsed);
line('sensitivity: Rc with the short window (250)', (b) => failed(b).length - removed('cls250')(b));
line('sensitivity: Rc with Dbroad', (b) => failed(b).length - removed('clsBroad')(b));

// 5. The reading, by the rules fixed in the note
out('\n5. The reading, by the rules fixed in the note');
const aged = rows.filter((r) => r.br.soup === 'continue' && r.o.why === 'time rule');
const classifiable = aged.filter((r) => ['D-derived', 'mixed', 'not from D'].includes(r.cls));
const der = classifiable.filter((r) => r.cls === 'D-derived').length, notFrom = classifiable.filter((r) => r.cls === 'not from D').length;
out(`   The aged soup's appearances the time rule removes: ${aged.length}; classifiable ${classifiable.length}; D-derived ${der}, not from D ${notFrom}.`);
out(`   ${!classifiable.length ? 'None is classifiable: no reading.'
  : der >= (2 / 3) * classifiable.length ? 'Two thirds or more are D-derived: they are made mostly of the dominant group\'s material, fragments as the time rule assumed.'
  : der <= classifiable.length / 3 && notFrom >= classifiable.length / 2 ? 'A third or fewer are D-derived and half or more are not from D: the time rule removes appearances that are not made of the dominant group\'s material.'
  : 'In between: partly.'}`);
out(`   The recount: Rc ${verdict(rc.c)}, Rc′ ${verdict(rc2.c)}. A copy is not a lineage of descent from one program: "D-derived" says what the bytes passed through, not that the appearance is a mutated copy of the dominant group's program.`);
