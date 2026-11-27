// A record of copy events (exploratory): the analysis fixed in the note (README.md), before computing.
//
//   node fase2/resultats/arrelament/esdeveniments/analisi.mjs --code COMMIT [--check] > fase2/resultats/arrelament/esdeveniments/analisi-sortida.txt
//
// It reads the list (llista.json), the pilot's records, the data of ../registre-copies/dades.mjs (the exposures and the worlds, as the
// earlier notes) and this note's records (registres/*.jsonl.gz), validated by valida.mjs against the computation's commit (--code, required),
// with every state of the evidence tested again by the census's test. With --check, it validates and prints only counts: no class and no
// end (the short test). It reads nothing if the instrument's checks (prova-sortida.txt) did not all pass. The world is the unit of the
// bootstrap. --registres DIR reads another folder: only for prova.mjs's synthetic records.
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { gunzipSync } from 'zlib';
import { bootstrap } from '../../../../eines/arrelament-analisi.mjs';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { load, ROOT, ARMS, sha256 } from '../registre-copies/dades.mjs';
import { createHeritability, appearanceClass, byOrigin, birthKey } from './cadena.mjs';
import { HERE, LIST, LIST_SHA256, BOOT_SEED, BOOT_COUNT } from './comu.mjs';
import { validate, pilotFacts } from './valida.mjs';
import { coverageRows } from './cobertura.mjs';

const args = process.argv.slice(2), check = args.includes('--check');
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const code = opt('--code'), ri = args.indexOf('--registres');
const recDir = ri >= 0 ? args[ri + 1] : join(ROOT, HERE, 'registres');
if (!code || args.length !== 2 + (check ? 1 : 0) + (ri >= 0 ? 2 : 0) || (ri >= 0 && !args[ri + 1])) { console.error('usage: node analisi.mjs --code COMMIT [--check] [--registres DIR]'); process.exit(2); }
const out = (s = '') => console.log(s);
const f = (x, k = 2) => (x === null || x === undefined || !Number.isFinite(x) ? '—' : x.toFixed(k));
const ci = ([lo, hi]) => `[${f(lo)}; ${f(hi)}]`;
const above = (c) => c[0] !== null && c[0] > 1;
const stop = (why) => { out(`\nNothing is analysed: ${why}`); process.exit(1); };
const SOUP = { continue: 'aged', 'shuffle-all': 'shuffled', reinit: 'fresh' };

const listText = readFileSync(join(ROOT, LIST));
out(`A record of copy events (exploratory). The analysis: ${codeVersion()}, ${process.version}; the list, SHA-256 ${sha256(listText).slice(0, 16)}…; the records' commit, ${code}.`);
if (sha256(listText) !== LIST_SHA256) stop('the list is not the note\'s');
const list = JSON.parse(listText.toString());
if (ri < 0) {
  const pf = join(ROOT, HERE, 'prova-sortida.txt');
  if (!existsSync(pf) || !readFileSync(pf, 'utf8').trim().endsWith('every check passes')) stop('the instrument\'s checks (prova-sortida.txt) did not all pass');
}

// The records, validated, with the evidence tested again
const readJsonl = (rel) => readFileSync(join(ROOT, rel), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const pilot = pilotFacts(list, readJsonl);
if (!existsSync(recDir)) stop('no folder of records');
const files = readdirSync(recDir);
const records = new Map();
for (const br of list.branches) {
  const file = join(recDir, `${br.id}.jsonl.gz`);
  if (!existsSync(file)) continue;
  try { records.set(br.id, gunzipSync(readFileSync(file)).toString().trim().split('\n').map((l) => JSON.parse(l))); } catch { stop(`${br.id}: the record is not gzip of valid JSON lines`); }
}
const her = createHeritability();
const v = validate({ list, records, files, pilot, code, her });
if (v.problems.length) stop(`${v.problems.length} problems:\n- ${v.problems.slice(0, 20).join('\n- ')}`);
const apps = list.branches.flatMap((b) => b.censuses.flatMap((c) => c.appearances.map((y) => ({ b, c, y }))));
const ends = [...records.values()].reduce((s, L) => s + L.at(-1).replays, 0);
out(`The records: ${records.size} branches, of ${code}, run with ${records.get(list.branches[0].id)[0].node}; ${apps.length} appearances, ${apps.reduce((s, a) => s + a.y.cells.length, 0)} cells, ${v.n} chains (K = 2 and K = 4); every line the list asks for, once and in order; the seeds, the measures (${[...records.values()].reduce((s, L) => s + L.at(-1).measuresChecked, 0)}) and the final fingerprints, those of the pilot records; ${ends} segments run again, each ending in its checkpoint.`);
out(`The evidence: every acquisition and birth's states tested again by the census's test (${her.tests()} distinct states): each, not heritable before and heritable after.`);
if (check) { out('--check: all the records were read and are valid. No class and no end is printed.'); process.exit(0); }

// The data of the earlier notes: the exposures, the worlds, R0
const d = load();
if (d.problems.length) stop(`the data are not valid: ${d.problems[0]}`);
const byId = new Map(d.B.map((b) => [b.id, b]));
for (const b of list.branches) {
  const B = byId.get(b.id), F = d.failed(B);
  if (!B || B.exposure !== b.exposure || F.length !== b.censuses.reduce((s, c) => s + c.appearances.length, 0)) stop(`${b.id}: the list's appearances are not the failed appearances of the data`);
}
const W = 512;
const dist = (a, c) => Math.max(Math.abs((a % W) - (c % W)), Math.abs(((a / W) | 0) - ((c / W) | 0)));

let mainRows = null;
for (const which of ['main', 'sensitivity']) {
  out(`\n${'='.repeat(4)} ${which === 'main' ? 'THE MAIN RULE (K = 2)' : 'THE SENSITIVITY (K = 4; not read)'} ${'='.repeat(4)}`);
  // 1. The classes of the appearances
  const rows = [];
  for (const { b, c, y } of apps) {
    const L = records.get(b.id), line = L.find((l) => l.type === 'appearance' && l.id === y.id);
    // the births of the lineages detected before it: its census's reference lineages, and the failed appearances of the branch's earlier censuses
    const earlier = new Set(L.filter((l) => (l.type === 'reference' && l.census === c.epoch) || (l.type === 'appearance' && l.census < c.epoch))
      .flatMap((l) => l.cells.map((x) => x.chains[which]).filter((ch) => ch.end === 'birth').map(birthKey)));
    const chains = line.cells.map((x) => byOrigin({ appCell: x.cell, ...x.chains[which] }, earlier));
    const cls = appearanceClass(chains.map((ch) => ch.end));
    const births = new Set(chains.filter((ch) => ch.end === 'birth').map((ch) => `${ch.cell}@${ch.epoch}:${ch.step}`));
    rows.push({ b, c, y, chains, cls, births });
  }
  out(`\n1. The classes of the failed appearances (the end of more than half of their cells; else mixed). Chains ending at the birth of a lineage detected before: ${rows.reduce((s, r) => s + r.chains.filter((ch) => ch.byOrigin).length, 0)}`);
  out('   soup       all  birth  earlier lineage  older  unresolved  mixed');
  for (const s of ARMS) {
    const R = rows.filter((r) => r.b.soup === s), k = (x) => R.filter((r) => r.cls === x).length;
    out(`   ${SOUP[s].padEnd(9)} ${String(R.length).padStart(4)} ${String(k('birth')).padStart(6)} ${String(k('earlier lineage')).padStart(16)} ${String(k('older')).padStart(6)} ${String(k('unresolved')).padStart(11)} ${String(k('mixed')).padStart(6)}`);
  }
  for (const [name, f2] of [['the time rule\'s removals', (r) => r.y.timeRule], ['the rest', (r) => !r.y.timeRule]]) {
    const R = rows.filter(f2);
    out(`   ${name}: ${ARMS.map((s) => { const Q = R.filter((r) => r.b.soup === s); return `${SOUP[s]} ${Q.length} (${['birth', 'earlier lineage', 'older', 'unresolved', 'mixed'].map((x) => `${x} ${Q.filter((r) => r.cls === x).length}`).join(', ')})`; }).join('; ')}`);
  }
  // 2. Each appearance
  out('\n2. Each appearance: its cells\' ends (birth: the cell and epoch, the step, the bytes from heritable holders; earlier lineage: the dominant group\'s (1), another (2)), the hops, the distance from its cell');
  for (const r of rows) {
    const desc = r.chains.map((ch) => {
      const hops = `${ch.hops.length} hop${ch.hops.length === 1 ? '' : 's'}`;
      if (ch.end === 'birth') return `birth ${ch.cell}@${ch.epoch} (${ch.step}; H ${ch.material.H}, U ${ch.material.U}, mutated ${ch.material.mutation}; ${r.c.epoch - ch.epoch} epochs before the census, ${dist(ch.cell, ch.appCell)} cells away; ${hops})`;
      if (ch.end === 'earlier lineage') return ch.byOrigin ? `earlier lineage by origin, the birth ${ch.cell}@${ch.epoch} (${hops})` : `earlier lineage ${ch.bits} at ${ch.epoch} (${hops})`;
      if (ch.end === 'unresolved') return `unresolved, past ${ch.hops.length - 1} hops`;
      return `older (${hops})`;
    });
    out(`   ${SOUP[r.b.soup].padEnd(9)} ${String(r.b.world).padEnd(5)} ${String(r.c.epoch).padEnd(6)} ${r.y.id.padEnd(9)} ${r.y.timeRule ? 'T' : '-'} ${r.cls.padEnd(16)} ${desc.join(' | ')}`);
  }
  if (which === 'main') mainRows = rows;
  // 3. The origins: the distinct births of each branch's appearances classed birth
  out('\n3. The origins: the distinct births the appearances classed birth reach, per branch');
  const origins = new Map();
  for (const b of list.branches) {
    const R = rows.filter((r) => r.b === b);
    const ev = new Set(R.filter((r) => r.cls === 'birth').flatMap((r) => [...r.births]));
    const unknown = R.filter((r) => ['older', 'unresolved', 'mixed'].includes(r.cls)).length;
    origins.set(b.id, { low: ev.size, high: ev.size + unknown, apps: R.filter((r) => r.cls === 'birth').length });
    if (R.length) out(`   ${b.id.padEnd(26)} appearances ${R.length}, classed birth ${R.filter((r) => r.cls === 'birth').length}, their distinct births ${ev.size}; not decided ${unknown}`);
  }
  // 4. The recount
  out('\n4. The recount (per 1,000 world-epochs; aged / shuffled / fresh, and aged/fresh with the world as the unit; never a ratio of every birth in the soup)');
  const cnt = (f2) => (b) => (origins.has(b.id) ? f2(origins.get(b.id)) : 0);
  const line = (name, c) => {
    const n = ARMS.map((s) => d.B.filter((b) => b.soup === s).reduce((t, b) => t + c(b), 0));
    const lam = (ws, s) => { let k = 0, e = 0; for (const x of ws) { k += c(x[s]); e += x[s].exposure; } return e ? (1000 * k) / e : null; };
    const q = (ws) => { const a = lam(ws, 'continue'), r = lam(ws, 'reinit'); return a !== null && r ? a / r : null; };
    const cc = bootstrap(d.wb, q, { count: BOOT_COUNT, seed: BOOT_SEED });
    out(`   ${name.padEnd(78)} ${n.join(', ').padEnd(12)} ${f(q(d.wb))} ${ci(cc)}${cc[0] === null ? ', the interval cannot be computed' : above(cc) ? ', above 1' : ', contains 1'}`);
    return cc;
  };
  line('R0, every failed appearance (for reference)', (b) => d.failed(b).length);
  const lo = line('Ro, the distinct births of the appearances classed birth', cnt((o) => o.low));
  const hi = line('Ro+, Ro with the appearances not decided (older, unresolved, mixed) as births', cnt((o) => o.high));
  line('Ra, the appearances classed birth (descriptive)', cnt((o) => o.apps));
  if (which === 'main') {
    out('\n5. The reading (by the rule fixed in the note)');
    const r = above(lo) && above(hi) ? 'more new origins in the aged soup than in the fresh, at both ends' : !above(lo) && !above(hi) ? 'not shown: at both ends the interval contains 1 or cannot be computed' : 'it depends on the appearances not decided';
    const undecided = rows.filter((x) => ['older', 'unresolved', 'mixed'].includes(x.cls)).length;
    if (2 * undecided > rows.length) out(`   The instrument does not decide on these worlds: ${undecided} of ${rows.length} appearances are not decided (older, unresolved, mixed); the recount is not read.`);
    else out(`   The recount: ${r} (${undecided} of ${rows.length} appearances not decided).`);
    const T = rows.filter((x) => x.y.timeRule && x.b.soup === 'continue'), dec = T.filter((x) => ['birth', 'earlier lineage'].includes(x.cls));
    const kE = dec.filter((x) => x.cls === 'earlier lineage').length, kB = dec.filter((x) => x.cls === 'birth').length;
    out(`   The aged soup's time-rule removals: ${T.length}, decided ${dec.length}: earlier lineage ${kE}, birth ${kB}: ${dec.length && 3 * kE >= 2 * dec.length ? 'mostly descendants of earlier lineages, as the time rule assumed' : dec.length && 3 * kB >= 2 * dec.length ? 'mostly births, against what the time rule assumed' : 'mixed'}.`);
  }
}

// 6. Auditor 1's coverage against the events (descriptive; cobertura.mjs): the appearances with D of the continuity note's records
out('\n6. Auditor 1\'s coverage (cobertura.mjs: copy, long piece, pieces, none; the threshold, the 10th percentile of 200 cells of half B) against the events (the main rule), for the appearances with D of the continuity note\'s records');
if (ri >= 0) out('   (skipped: synthetic records)');
else {
  const cov = coverageRows(ROOT);
  const ev = new Map(mainRows.map((r) => [`${r.b.id}|${r.y.id}`, r.cls]));
  const C4 = ['copy', 'long piece', 'pieces', 'none'], E5 = ['birth', 'earlier lineage', 'older', 'unresolved', 'mixed'];
  for (const r of cov) out(`   ${SOUP[r.soup].padEnd(9)} ${String(r.world).padEnd(5)} ${String(r.census).padEnd(6)} ${r.id.padEnd(9)} threshold ${r.threshold} (median ${r.refMedian}); cells ${r.cells.map((x) => `${x.cov}/${x.run}`).join(', ')} -> ${r.cls.padEnd(10)} events: ${ev.get(`${r.branch}|${r.id}`) ?? '(not in this note)'}`);
  for (const s of ['continue', 'shuffle-all']) {
    const R = cov.filter((r) => r.soup === s);
    out(`   ${SOUP[s]}: ${R.length} appearances; coverage × events: ${C4.map((c) => `${c} (${E5.map((e) => `${e} ${R.filter((r) => r.cls === c && ev.get(`${r.branch}|${r.id}`) === e).length}`).join(', ')})`).join('; ')}`);
  }
}
const Ls = [...records.values()];
out(`\n(${Ls.reduce((s, L) => s + L.at(-1).seconds, 0).toFixed(0)} s of computation in all, ${Ls.reduce((s, L) => s + L.at(-1).heritabilityTests, 0)} heritability tests; at most ${Math.max(...Ls.map((L) => L.at(-1).rssMB))} MB)`);
