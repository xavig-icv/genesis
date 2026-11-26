// A measure of continuity (exploratory): the analysis fixed in the note (README.md), before computing.
//
//   node fase2/resultats/arrelament/continuitat/analisi.mjs --code COMMIT [--check] > fase2/resultats/arrelament/continuitat/analisi-sortida.txt
//
// It reads the list (../registre-copies/llista.json), the pilot's records, the data of ../registre-copies/dades.mjs and this note's records
// (registres/*.jsonl.gz), validated by valida.mjs against the computation's commit (--code, required). With --check, it validates and prints
// only counts: no measure and no class (the short test). It reads nothing if the instrument's checks (prova-sortida.txt) did not all pass.
// The world is the unit of the bootstrap. --registres DIR reads another folder: only for prova.mjs's synthetic records.
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { gunzipSync } from 'zlib';
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { bootstrap } from '../../../../eines/arrelament-analisi.mjs';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { load, ROOT, ARMS, sha256 } from '../registre-copies/dades.mjs';
import { WINDOWS } from '../descendencia/traca.mjs';
import { HERE, LIST, LIST_SHA256, ADV_SEED, MIN_B, MIN_FAR, SENS_MIN, FAR_NONE_MIN } from './comu.mjs';
import { validate, pilotFacts } from './valida.mjs';
import { context, orderedRun, mapRun, donorRun, distinct, score, classOf, appearanceClass, startAdjacent, commonRun, bridgeable, adversarial,
  adversarialFails, FAMILIES, RUN, FRAC } from './mesura.mjs';

const P = PROGRAM_SIZE;
const BOOTSTRAP = { count: 10000, seed: 3100000000 };   // the within-world null note's: R0 and R1 must come out as there
const args = process.argv.slice(2), check = args.includes('--check');
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const code = opt('--code'), ri = args.indexOf('--registres');
const recDir = ri >= 0 ? args[ri + 1] : join(ROOT, HERE, 'registres');
if (!code || args.length !== 2 + (check ? 1 : 0) + (ri >= 0 ? 2 : 0) || (ri >= 0 && !args[ri + 1])) { console.error('usage: node analisi.mjs --code COMMIT [--check] [--registres DIR]'); process.exit(2); }
const out = (s = '') => console.log(s);
const f = (x, k = 2) => (x === null || x === undefined || !Number.isFinite(x) ? '—' : x.toFixed(k));
const ci = ([lo, hi]) => `[${f(lo)}, ${f(hi)}]`;
const verdict = (c) => (c[0] === null ? 'cannot say' : c[0] > 1 ? 'above 1' : c[1] < 1 ? 'below 1' : 'contains 1');
const stop = (why) => { out(`\nNothing is analysed: ${why}`); process.exit(1); };
const [MAINW, SHORTW] = WINDOWS;

const listText = readFileSync(join(ROOT, LIST));
out(`A measure of continuity (exploratory). The analysis: ${codeVersion()}, ${process.version}; the list, SHA-256 ${sha256(listText).slice(0, 16)}…; the records' commit, ${code}.`);
if (sha256(listText) !== LIST_SHA256) stop('the list is not the note\'s');
const list = JSON.parse(listText.toString());
if (ri < 0) {
  const pf = join(ROOT, HERE, 'prova-sortida.txt');
  if (!existsSync(pf) || !readFileSync(pf, 'utf8').trim().endsWith('All the checks pass.')) stop('the instrument\'s checks (prova-sortida.txt) did not all pass');
}

// The records, validated against the list, the pilot's records and the commit
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
const v = validate({ list, records, files, pilot, code });
if (v.problems.length) stop(`${v.problems.length} problems:\n- ${v.problems.slice(0, 20).join('\n- ')}`);
const nApp = list.branches.reduce((s, b) => s + b.observers.reduce((t, o) => t + o.appearances.length, 0), 0);
out(`The records: ${records.size} branches, of ${code}, run with ${records.get(list.branches[0].id)[0].node}; ${nApp} appearances at ${list.branches.reduce((s, b) => s + b.observers.length, 0)} tracked censuses; every line the list asks for, once and in order; the seeds, the measures (${[...records.values()].reduce((s, L) => s + L.at(-1).measuresChecked, 0)}), the invariant checks and the final fingerprints, those of the pilot records.`);
// The same cells as the descent note (its records, in git): D's carriers, the halves, the far cells and the matched cells, census by census.
// Entry 28's scores are also recomputed from the saved origins below (the full analysis): if anything differs, nothing is read.
const DESC = 'fase2/resultats/arrelament/descendencia/registres';
const rec28 = new Map();
if (ri < 0) {
  const bad28 = [];
  for (const br of list.branches) {
    const L28 = readJsonl(`${DESC}/${br.id}.jsonl`);
    rec28.set(br.id, L28);
    for (const x of records.get(br.id).slice(1, -1)) {
      const y = L28.find((l) => l.type === x.type && l.epoch === x.epoch && l.window === x.window && (x.type === 'census' || l.id === x.id));
      if (!y) { bad28.push(`${br.id}: no line of the descent note for ${x.type} ${x.epoch}/${x.window}`); continue; }
      if (x.type === 'census' && x.D && (!y.D || y.D.carriers !== x.D.carriers || y.D.excluded !== x.D.excluded || y.D.A !== x.D.A || y.D.B !== x.D.B || y.D.far.cells !== x.D.farCells)) bad28.push(`${br.id} ${x.epoch}/${x.window}: D's carriers or halves are not the descent note's`);
      if (x.type === 'appearance' && x.matched && (!y.baseline || y.baseline.distance !== x.matched.distance || JSON.stringify(y.baseline.cells) !== JSON.stringify(x.matched.cells))) bad28.push(`${br.id} ${x.id} ${x.epoch}/${x.window}: the matched cells are not the descent note's`);
    }
  }
  if (bad28.length) stop(`not the descent note's cells (${bad28.length}):\n- ${bad28.slice(0, 10).join('\n- ')}`);
  out('The same cells as the descent note\'s records: D\'s carriers, the halves, the far cells and the matched cells of every census and window.');
}
if (check) {
  const cs = [...records.values()].flatMap((L) => L.filter((l) => l.type === 'census' && l.D));
  out(`--check: all the records were read and are valid; ${cs.length} censuses and windows with D, their pools of ${cs.reduce((s, c) => s + c.D.pool.length / P, 0)} distinct sequences (half A ${cs.reduce((s, c) => s + c.D.A, 0)} carriers in all). No measure and no class is printed.`);
  process.exit(0);
}

const d = load();
if (d.problems.length) stop(`the data are not valid (${d.problems[0]})`);
const { B, failed, wb } = d;
const n0 = ARMS.map((s) => B.filter((b) => b.soup === s).reduce((t, b) => t + failed(b).length, 0));
if (n0.join() !== '33,14,8') stop(`R0 is not the within-world null note's (${n0.join(', ')})`);

// The variants: the main measure, and the sensitivities (never read for the reading)
const VARIANTS = [
  { key: 'main', w: MAINW, frac: FRAC, cell: 'ordered', app: 'majority', what: 'the main measure (window 1,250, the map at 1 %, the ordered run, half the cells)' },
  { key: 'w250', w: SHORTW, frac: FRAC, cell: 'ordered', app: 'majority', what: 'the window of 250 epochs' },
  { key: 'map05', w: MAINW, frac: 0.005, cell: 'ordered', app: 'majority', what: 'the map at 0.5 %' },
  { key: 'map5', w: MAINW, frac: 0.05, cell: 'ordered', app: 'majority', what: 'the map at 5 %' },
  { key: 'any', w: MAINW, frac: FRAC, cell: 'ordered', app: 'any', what: 'an appearance ordered if any of its cells is' },
  { key: 'mapRun', w: MAINW, frac: FRAC, cell: 'mapRun', app: 'majority', what: 'auditor 1\'s post hoc measure (map pairs, no donor)' },
  { key: 'donorRun', w: MAINW, frac: FRAC, cell: 'donorRun', app: 'majority', what: 'the run in one donor, with no map' },
];
const ctxKeys = [...new Set(VARIANTS.map((x) => `${x.w}|${x.frac}`))];
const get = (br, type, epoch, w, pred = () => true) => records.get(br.id).find((l) => l.type === type && l.epoch === epoch && l.window === w && pred(l));
const gather = (pool, ix) => { const a = new Int32Array(ix.length * P); ix.forEach((i, k) => a.set(pool.subarray(i * P, i * P + P), k * P)); return a; };
const pctOf = (vals, x) => (vals.length ? (vals.filter((y) => y < x).length + 0.5 * vals.filter((y) => y === x).length) / vals.length : null);

// Every census, every context (window and map): the controls, and its appearances measured
const censusRes = new Map();   // `${br.id}|${epoch}|${w}|${frac}` -> controls
const appRes = new Map();      // `${br.id}|${y.id}|${variant}` -> { cls, why, cells }
const descr = new Map();       // `${br.id}|${y.id}` -> the main measure's description
const pairsRes = new Map();    // `${br.id}|${epoch}` -> one origin
const against28 = [];          // entry 28's scores recomputed from the saved origins, where they differ
let checked28 = 0;
for (const br of list.branches) for (const [index, o] of br.observers.entries()) for (const ck of ctxKeys) {
  const [w, frac] = ck.split('|').map(Number);
  const c = get(br, 'census', o.epoch, w), apps = o.appearances.map((y) => ({ y, a: get(br, 'appearance', o.epoch, w, (l) => l.id === y.id) }));
  const variants = VARIANTS.filter((x) => x.w === w && x.frac === frac);
  const isMain = w === MAINW && frac === FRAC;
  if (!c.D) {
    censusRes.set(`${br.id}|${o.epoch}|${w}|${frac}`, { ok: false, why: o.why === 'burst' ? 'no dominant group' : 'no earlier dominant lineage' });
    for (const { y } of apps) for (const x of variants) appRes.set(`${br.id}|${y.id}|${x.key}`, { cls: o.why === 'burst' ? 'no dominant group' : 'unclassifiable', why: 'no D' });
    if (isMain && apps.length > 1) pairsRes.set(`${br.id}|${o.epoch}`, onePairs(apps, null));
    continue;
  }
  const D = c.D, pool = Int32Array.from(D.pool);
  const ctx = context(gather(pool, D.halfA), frac, c.N), hB = gather(pool, D.halfB), far = gather(pool, D.far);
  const nB = D.halfB.length, nF = D.far.length;
  let bOrd = 0; for (let i = 0; i < nB; i++) if (orderedRun(ctx, hB, i * P).run >= RUN) bOrd++;
  let fNone = 0; for (let i = 0; i < nF; i++) if (distinct(ctx, far, i * P) === 0) fNone++;
  const adv = adversarial(ctx, hB, far, ADV_SEED + 1000 * Number(br.world) + 10 * ARMS.indexOf(br.soup) + index, c.next);
  const why = nB < MIN_B ? `half B's sample has ${nB} cells` : nF < MIN_FAR ? `${nF} far cells` : bOrd < SENS_MIN * nB ? `half B ordered, ${bOrd} of ${nB}`
    : nF - fNone > (1 - FAR_NONE_MIN) * nF ? `far cells with a map pair, ${nF - fNone} of ${nF}` : (adversarialFails(adv).join('; ') || null);
  censusRes.set(`${br.id}|${o.epoch}|${w}|${frac}`, { ok: !why, why, nA: D.A, nUniq: ctx.nUniq, thr: ctx.thr, nPairs: ctx.pairs.size, nB, bOrd, nF, fNone, adv });
  if (rec28.size && frac === FRAC) {
    // entry 28's map and scores, from the saved origins: the threshold, each appearance's score and its 200 matched cells' scores
    const L28 = rec28.get(br.id), c28 = L28.find((l) => l.type === 'census' && l.epoch === o.epoch && l.window === w);
    if (c28.D.thr.adj1 !== ctx.thr) against28.push(`${br.id} ${o.epoch}/${w}: the map's threshold`);
    for (const { y, a } of apps) {
      const a28 = L28.find((l) => l.type === 'appearance' && l.epoch === o.epoch && l.window === w && l.id === y.id), orig = Int32Array.from(a.orig), mo = Int32Array.from(a.matched.orig);
      const s = y.cells.reduce((t, c, i) => t + score(ctx, orig, i * P), 0);
      if (s !== a28.descent.adj1) against28.push(`${br.id} ${y.id} ${o.epoch}/${w}: entry 28's score ${s} against ${a28.descent.adj1}`);
      if (a28.baseline.descent.adj1.some((v, i) => v !== score(ctx, mo, i * P))) against28.push(`${br.id} ${y.id} ${o.epoch}/${w}: the matched cells' scores`);
      checked28 += 1 + a28.baseline.descent.adj1.length;
    }
  }
  for (const { y, a } of apps) {
    const orig = Int32Array.from(a.orig), k = y.cells.length;
    const cells = [...Array(k).keys()].map((i) => {
      const off = i * P, r = orderedRun(ctx, orig, off), nd = distinct(ctx, orig, off);
      return { run: r.run, from: r.from, to: r.to, distinct: nd, mapRun: mapRun(ctx, orig, off), donorRun: donorRun(ctx, orig, off), score: score(ctx, orig, off),
        own: [...Array(P).keys()].filter((j) => bridgeable(ctx, orig[off + j])).length,
        arith: r.run ? [...Array(r.to - r.from + 1).keys()].filter((j) => a.flags[off + r.from + j] & 2).length : 0,
        start: r.run ? startAdjacent(ctx, orig, off, r.from, r.to) : null };
    });
    for (const x of variants) {
      if (!why) {
        const cc = cells.map((q) => classOf(x.cell === 'mapRun' ? q.mapRun : x.cell === 'donorRun' ? q.donorRun : q.run, q.distinct));
        const cls = x.app === 'any' ? (cc.includes('ordered') ? 'ordered' : cc.every((q) => q === 'none') ? 'none' : 'pieces') : appearanceClass(cc);
        appRes.set(`${br.id}|${y.id}|${x.key}`, { cls, cells: cc });
      } else appRes.set(`${br.id}|${y.id}|${x.key}`, { cls: 'unclassifiable', why });
    }
    if (isMain) {
      // the matched cells (descriptive): their classes, and each cell's ordered run among theirs
      const m = a.matched, mo = Int32Array.from(m.orig), mr = [], mc = { ordered: 0, pieces: 0, none: 0 };
      for (let i = 0; i < m.cells.length; i++) { const r = orderedRun(ctx, mo, i * P).run; mr.push(r); mc[classOf(r, distinct(ctx, mo, i * P))]++; }
      descr.set(`${br.id}|${y.id}`, { cells, matched: { n: m.cells.length, distance: m.distance, ...mc, pct: cells.map((q) => pctOf(mr, q.run)) } });
    }
  }
  if (isMain && apps.length > 1) pairsRes.set(`${br.id}|${o.epoch}`, onePairs(apps, ctx));
}

// One origin (descriptive): two appearances of a census share one if a cell of each holds the same run of 16 bytes or more in the same
// order (the common run), counted only where its pairs are not map pairs (material they share that is not the dominant group's order); the
// local null, the pairs of cells of their rings (no tracked set).
function onePairs(apps, ctx) {
  const cellsOf = (a, key) => { const o = Int32Array.from(a[key].orig ?? a[key]), k = o.length / P; return [...Array(k).keys()].map((i) => [o, i * P]); };
  const res = [];
  for (let i = 0; i < apps.length; i++) for (let j = i + 1; j < apps.length; j++) {
    let any = 0, outside = 0;
    for (const [o1, f1] of cellsOf(apps[i].a, 'orig')) for (const [o2, f2] of cellsOf(apps[j].a, 'orig')) {
      any = Math.max(any, commonRun(o1, f1, o2, f2)); if (ctx) outside = Math.max(outside, commonRun(o1, f1, o2, f2, ctx));
    }
    const ra = cellsOf({ r: apps[i].a.ring }, 'r'), rb = cellsOf({ r: apps[j].a.ring }, 'r'), ca = apps[i].a.ring.cells, cb = apps[j].a.ring.cells;
    let nul = 0, nul16 = 0;
    ra.forEach(([o1, f1], p) => rb.forEach(([o2, f2], q) => { if (ca[p] === cb[q]) return; nul++; if (commonRun(o1, f1, o2, f2, ctx) >= RUN) nul16++; }));
    res.push({ a: apps[i].y.id, b: apps[j].y.id, any, outside: ctx ? outside : null, nul, nul16 });
  }
  return res;
}

if (against28.length) stop(`entry 28's scores, recomputed from the saved origins, are not the descent note's (${against28.length}):\n- ${against28.slice(0, 10).join('\n- ')}`);
if (rec28.size) out(`Entry 28's map thresholds and scores, recomputed from the saved origins: the descent note's, all ${checked28} (the appearances and their matched cells, both windows).`);

// 0. The controls of each census
out('\n0. The controls of each census (D; the main window and map, and the sensitivities\' contexts)');
out('   soup        branch  census  window  map   half A (distinct)  thr  map pairs  half B ordered  far none     adversarial (ordered of cells: ' + FAMILIES.map((x) => x.key).join(', ') + ')  valid');
for (const br of list.branches) for (const o of br.observers) for (const ck of ctxKeys) {
  const [w, frac] = ck.split('|').map(Number), r = censusRes.get(`${br.id}|${o.epoch}|${w}|${frac}`);
  const head = `   ${br.soup.padEnd(11)} ${String(br.world).padEnd(7)} ${String(o.epoch).padEnd(7)} ${String(w).padEnd(7)} ${String(frac).padEnd(5)}`;
  if (r.nA === undefined) { out(`${head} —  (${r.why})`); continue; }
  out(`${head} ${`${r.nA} (${r.nUniq})`.padEnd(18)} ${String(r.thr).padEnd(4)} ${String(r.nPairs).padEnd(10)} ${`${r.bOrd} of ${r.nB}`.padEnd(15)} ${`${r.fNone} of ${r.nF}`.padEnd(12)} ${FAMILIES.map((x) => `${r.adv[x.key].ordered}/${r.adv[x.key].cells}`).join(' ')}  ${r.ok ? 'yes' : `no (${r.why})`}`);
}

// 1. Each appearance (the main measure)
const rows = [];
for (const br of list.branches) for (const o of br.observers) for (const y of o.appearances) {
  const sens = Object.fromEntries(VARIANTS.filter((x) => x.key !== 'main').map((x) => [x.key, appRes.get(`${br.id}|${y.id}|${x.key}`).cls]));
  rows.push({ br, o, y, main: appRes.get(`${br.id}|${y.id}|main`), sens, ds: descr.get(`${br.id}|${y.id}`), T: o.why === 'time rule' });
}
out('\n1. Each appearance (the main measure), cell by cell: the ordered run (bytes) and where; auditor 1\'s measure (map pairs, no donor); the run in one donor with no map; distinct map pairs; entry 28\'s score; own mutations; flagged + or - in the run; the run\'s pairs adjacent at the window\'s start. The matched cells (descriptive): ordered / pieces / none, and the percentile of each cell\'s run among theirs.');
for (const r of rows) {
  const head = `   ${r.br.soup.padEnd(11)} ${String(r.br.world).padEnd(7)} ${String(r.o.epoch).padEnd(7)} ${r.y.id.padEnd(11)} ${r.main.cls}${r.main.why ? ` (${r.main.why})` : ''}`;
  out(head);
  if (!r.ds) continue;
  r.ds.cells.forEach((q, i) => out(`      cell ${r.y.cells[i]}: run ${q.run}${q.run ? ` (${q.from}–${q.to})` : ''}, auditor 1's ${q.mapRun}, one donor ${q.donorRun}, distinct ${q.distinct}, score ${q.score}, own ${q.own}, flagged ${q.arith}, at the start ${q.start ? `${q.start.k} of ${q.start.all}` : '—'}; class ${r.main.cells ? r.main.cells[i] : '—'}; percentile among the matched ${f(r.ds.matched.pct[i])}`));
  out(`      matched (distance ${r.ds.matched.distance}): ${r.ds.matched.n} cells, ordered ${r.ds.matched.ordered}, pieces ${r.ds.matched.pieces}, none ${r.ds.matched.none}  | sensitivities: ${Object.entries(r.sens).map(([k, c]) => `${k} ${c}`).join(', ')}`);
}

// 2. The classes, by soup (the time rule's appearances)
out('\n2. The classes of the appearances the time rule removes, by soup (the main measure; and the sensitivities)');
const CLASSES = ['ordered', 'pieces', 'none', 'unclassifiable', 'no dominant group'];
const tally = (T, pick) => CLASSES.map((c) => `${c} ${T.filter((r) => pick(r) === c).length}`).join(', ');
for (const s of ARMS) {
  const T = rows.filter((r) => r.br.soup === s && r.T);
  out(`   ${s.padEnd(12)} ${T.length}: ${tally(T, (r) => r.main.cls)}`);
  for (const k of Object.keys(rows[0].sens)) out(`      ${k.padEnd(9)} ${tally(T, (r) => r.sens[k])}`);
}

// 3. One origin (descriptive)
out('\n3. The appearances of one census (two or more): the longest common run between cells of two (bytes), and outside the dominant group\'s order (its pairs not map pairs); components by the latter at 16; the local null (pairs of ring cells at 16 outside the order). Descriptive: never counted as births or as one origin in the recount.');
for (const br of list.branches) for (const o of br.observers) {
  const p = pairsRes.get(`${br.id}|${o.epoch}`);
  if (!p) continue;
  const parent = Object.fromEntries(o.appearances.map((y) => [y.id, y.id]));
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const D = p[0].outside !== null;
  for (const q of p) if ((D ? q.outside : q.any) >= RUN) parent[find(q.a)] = find(q.b);
  const nComp = new Set(o.appearances.map((y) => find(y.id))).size, nul = p.reduce((s, q) => s + q.nul, 0), nul16 = p.reduce((s, q) => s + q.nul16, 0);
  out(`   ${br.soup.padEnd(11)} ${String(br.world).padEnd(7)} ${String(o.epoch).padEnd(7)} ${o.appearances.length} appearances: common run, largest ${Math.max(...p.map((q) => q.any))}; ${D ? `outside the order, largest ${Math.max(...p.map((q) => q.outside))}` : 'no D: the common run with no map'}; ${nComp} components at 16; the null, ${nul16} of ${nul} ring pairs (${f(nul ? nul16 / nul : null, 3)})`);
}

// 4. The recount: a range, with the pieces at each end
out('\n4. The recount (the failed appearances per 1,000 world-epochs; the aged/fresh ratio, with the bootstrap over worlds). Counts of observed appearances, never a ratio of births (AU2-227).');
const lam = (ws, soup, cnt) => { let k = 0, e = 0; for (const x of ws) { k += cnt(x[soup]); e += x[soup].exposure; } return e ? (1000 * k) / e : null; };
const rq = (cnt) => (ws) => { const a = lam(ws, 'continue', cnt), r = lam(ws, 'reinit', cnt); return a !== null && r ? a / r : null; };
const results = {};
const line = (name, key, cnt) => {
  const n = ARMS.map((s) => B.filter((b) => b.soup === s).reduce((t, b) => t + cnt(b), 0));
  const c = bootstrap(wb, rq(cnt), BOOTSTRAP);
  out(`   ${name.padEnd(78)} ${n.join(', ')}; aged/fresh ${f(rq(cnt)(wb))} ${ci(c)} (${verdict(c)})`);
  results[key] = { n, c };
};
const Tr = (b, y) => b.ev !== null && b.ev.epoch - y.first <= 1250;
const clsOf = (b, y, pick) => { const r = rows.find((x) => x.br.id === b.id && x.y.id === y.id); if (!r) throw new Error(`${b.id} ${y.id}: a time-rule appearance not in the list`); return pick(r); };
const OK = new Set(['ordered', 'pieces', 'none']);
// Rf: the pieces as fragments (a time-rule appearance kept only if 'none'); Rb: the pieces as births (kept if 'pieces' or 'none'); the ones
// that cannot be classified, removed as by the time rule. Rb+: Rb with those kept.
const keep = (pick, keepCls, unclKept) => (b) => failed(b).filter((y) => { if (!Tr(b, y)) return true; const c = clsOf(b, y, pick); return OK.has(c) ? keepCls.includes(c) : unclKept; }).length;
line('R0, no rule (as the within-world null note)', 'R0', (b) => failed(b).length);
line('R1, the time rule (as the within-world null note)', 'R1', (b) => failed(b).filter((y) => !Tr(b, y)).length);
line('Rf, the pieces as fragments: only the time rule\'s "none" kept (main)', 'Rf', keep((r) => r.main.cls, ['none'], false));
line('Rb, the pieces as births: the time rule\'s "pieces" and "none" kept (main)', 'Rb', keep((r) => r.main.cls, ['pieces', 'none'], false));
line('Rb+, Rb with the unclassifiable ones kept (sensitivity)', 'RbPlus', keep((r) => r.main.cls, ['pieces', 'none'], true));
for (const k of Object.keys(rows[0].sens)) {
  line(`sensitivity ${k}: Rf`, `Rf_${k}`, keep((r) => r.sens[k], ['none'], false));
  line(`sensitivity ${k}: Rb`, `Rb_${k}`, keep((r) => r.sens[k], ['pieces', 'none'], false));
}

// 5. The reading, by the rules fixed in the note
out('\n5. The reading, by the rules fixed in the note');
const read = (soup, label) => {
  const T = rows.filter((r) => r.br.soup === soup && r.T), cl = T.filter((r) => OK.has(r.main.cls));
  const k = (c) => cl.filter((r) => r.main.cls === c).length;
  out(`   ${label}: ${T.length} appearances the time rule removes; classifiable ${cl.length}: ordered ${k('ordered')}, pieces ${k('pieces')}, none ${k('none')}.`);
  out(`   ${!cl.length ? 'None is classifiable: no reading.'
    : k('ordered') >= (2 / 3) * cl.length ? 'Two thirds or more carry 16 bytes or more in the dominant group\'s order, in one of its carriers, over their own mutations: by this measure, copies of its program, whole or mutated (for these appearances).'
    : k('pieces') >= (2 / 3) * cl.length ? 'Two thirds or more carry pieces of the dominant group\'s material and no run of 16 bytes in its order: by this measure, not copies of its program.'
    : k('none') >= (2 / 3) * cl.length ? 'Two thirds or more carry nothing of the dominant group\'s order made in the window.'
    : 'No class reaches two thirds: mixed, by this measure.'}`);
};
read('continue', 'The aged soup');
read('shuffle-all', 'The shuffled soup');
const rf = results.Rf.c, rb = results.Rb.c;
out(`   The excess: ${rf[0] !== null && rf[0] > 1 ? 'Rf lies above 1: shown even with the pieces as fragments, under this measure.'
  : rb[0] === null || rb[0] <= 1 ? 'Rb does not lie above 1: not shown even with the pieces as births, under this measure (never "there is no excess").'
  : 'Rb lies above 1 and Rf does not: it depends on what the pieces are, which this measure does not decide.'}`);
out('   For the aged soup this is not independent of auditor 1\'s post hoc numbers at audit 45 (the note, "What has already been seen"); the shuffled soup\'s are new.');
