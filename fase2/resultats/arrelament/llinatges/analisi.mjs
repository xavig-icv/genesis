// Les famílies naturals seguides com els plantats (exploratori; la nota, README.md): l'anàlisi, fixada a la nota abans de calcular.
//
//   node fase2/resultats/arrelament/llinatges/analisi.mjs > fase2/resultats/arrelament/llinatges/analisi-sortida.txt
//
// Llegeix els 52 seguiments (seguiments/), les comprovacions (comparacio/), els registres del pilot (a git) i veins.jsonl. N'exigeix les 52
// branques de llista.txt, cada comprovació bona, cada seguiment sencer i del seu registre, i el mateix commit i la mateixa versió de Node a
// tots els seguiments i a veins.jsonl; si en falta cap, no en llegeix cap. El món és la unitat (el bootstrap remostra mons sencers).
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { families, partA, plantedClass, followUpClass, consistencyTally, bootstrap, ANALYSIS } from '../../../../eines/arrelament-analisi.mjs';
import { DESIGN } from '../../../../eines/arrelament.mjs';
import { conditions, testInert, fromHex, heritable, INERT_CONDITIONS_SEED } from '../../../../fase2/inert.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { ROOT, PILOT, AQUI, ARMS, BOOTSTRAP, sha256, readJsonl } from './comu.mjs';

const d = DESIGN, start = d.age;
const out = (s = '') => console.log(s);
const f2 = (x, k = 2) => (x === null || x === undefined || !Number.isFinite(x) ? '—' : x.toFixed(k));
const ci = ([lo, hi], k = 2) => `[${f2(lo, k)}, ${f2(hi, k)}]`;
const problems = [];

// 0. Les dades, senceres
const llista = readFileSync(join(ROOT, AQUI, 'llista.txt'), 'utf8').trim().split('\n').map((l) => l.split(' ')[0]);
const m = JSON.parse(readFileSync(join(ROOT, PILOT, 'manifest.json'), 'utf8'));
const seg = new Map();
for (const id of llista) {
  const c = join(ROOT, AQUI, 'comparacio', `${id}.txt`), s = join(ROOT, AQUI, 'seguiments', `${id}.jsonl`), r = join(ROOT, AQUI, 'simulacio', `${id}.jsonl`);
  if (!existsSync(c) || !readFileSync(c, 'utf8').includes(`${id}: hi coincideix`)) { problems.push(`${id}: la comprovació no hi és o no hi coincideix`); continue; }
  if (!existsSync(s) || !existsSync(r)) { problems.push(`${id}: falta el seguiment o el registre nou`); continue; }
  const L = readJsonl(s);
  if (L[0].type !== 'start' || L.at(-1).type !== 'end') { problems.push(`${id}: el seguiment no és sencer`); continue; }
  if (L[0].record.sha256 !== sha256(readFileSync(r))) problems.push(`${id}: el seguiment no és del registre nou que hi ha`);
  seg.set(id, L);
}
const veinsFile = join(ROOT, AQUI, 'veins.jsonl');
const V = existsSync(veinsFile) ? readJsonl(veinsFile) : null;
if (!V || V[0].type !== 'start' || V.at(-1).type !== 'end' || V[0].only) problems.push('veins.jsonl no hi és, no és sencer o és de la prova curta');
else if (V.filter((l) => l.type === 'sembra').some((l) => !l.genotypeFunctional)) problems.push('a veins.jsonl, un genotip no és hereditari a la prova del llinatge');
const codes = new Set([...seg.values()].map((L) => `${L[0].code} ${L[0].node}`));
if (V) codes.add(`${V[0].code} ${V[0].node}`);
if (codes.size !== 1) problems.push(`no tots tenen el mateix commit i la mateixa versió de Node: ${[...codes].join('; ')}`);
for (const c of codes) if (c.includes('+canvis')) problems.push(`un registre diu ${c}`);
out(`Les famílies naturals seguides com els plantats: l'anàlisi de la nota (exploratori). L'anàlisi: ${codeVersion()}, ${process.version}.`);
out(`Els seguiments i els veïns: ${[...codes].join('; ')}. ${seg.size} branques de ${llista.length}.`);
if (problems.length) { out(`\nNo s'analitza res: ${problems.length} problemes.\n- ${problems.slice(0, 30).join('\n- ')}`); process.exit(1); }

// la prova de les aparicions de l'anàlisi del pilot: les 100 condicions que no són les del cens inert (AUD-191)
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

// 1. Les 180 branques de la part B: l'exposició (de l'anàlisi del pilot) i, a les 52, els llinatges
const cohort = m.worlds.filter((w) => w.included).map((w) => w.world);
const B = m.branches.filter((b) => b.part === 'B').map((b) => {
  const rec = readJsonl(join(ROOT, PILOT, 'part-b', `${b.id}.jsonl`));
  const ev = rec.find((l) => l.type === 'event') ?? null, end = rec.at(-1);
  const exposureEnd = ev ? ev.epoch : end.epoch;
  const r = { ...b, ev, exposure: exposureEnd - start, lineages: [], fams: [] };
  const L = seg.get(b.id);
  if (!L) return r;
  // els llinatges i les seves unions, en l'ordre del seguiment
  const lin = new Map(), parent = new Map();
  const root = (id) => { while (parent.has(id)) id = parent.get(id); return id; };
  let domRoot = null;
  for (const l of L) {
    if (l.type === 'new') lin.set(l.id, { id: l.id, first: l.epoch, programs: l.programs, cells: l.cells });
    if (l.type === 'census') {
      for (const [young, old] of l.joins) parent.set(young, old);
      if (ev && l.epoch === ev.confirmed) {
        // el grup dominant a la confirmació: la meitat o més de les hereditàries del cens inert (les d'abans de crear-ne de nous)
        for (const [rid, k] of Object.entries(l.groups)) if (l.heritable > 0 && k >= ANALYSIS.dominance * l.heritable) domRoot = root(rid);
      }
    }
  }
  r.lineages = [...lin.values()].map((x) => ({ ...x, robust: robust(x.programs), root: root(x.id), rooted: domRoot !== null && root(x.id) === domRoot }));
  r.domRoot = domRoot;
  // la fragmentació: les famílies de l'anàlisi del pilot (16 bytes, fins a l'exposició), i on cauen
  const inert = rec.filter((l) => l.type === 'inert');
  const censusOf = new Map(L.filter((l) => l.type === 'census').map((l) => [l.epoch, l]));
  for (const f of families(inert.filter((l) => l.epoch <= exposureEnd))) {
    const rob = robust(f.programs);
    const ir = inert.find((l) => l.epoch === f.first);
    const cells = ir.cells.filter((c) => heritable(c) && f.programs.includes(c.program)).map((c) => c.cell);
    const cl = censusOf.get(f.first).cells.filter((c) => cells.includes(c.cell));
    const before = cl.flatMap((c) => c.lineages);
    const created = r.lineages.filter((x) => x.first === f.first && x.cells.some((c) => cells.includes(c)));
    r.fams.push({ first: f.first, robust: rob, inside: before.length > 0, lineage: before.length ? root(before[0]) : created.length ? root(created[0].id) : null });
  }
  return r;
});
const bySoup = (soup) => B.filter((b) => b.soup === soup);

// 2. La fragmentació
out('\n1. La fragmentació: les aparicions robustes de l\'anàlisi del pilot (famílies de 16 bytes) que cauen dins d\'un llinatge que ja se seguia');
for (const soup of ARMS) {
  const all = bySoup(soup).flatMap((b) => b.fams.filter((f) => f.robust));
  const inside = all.filter((f) => f.inside).length;
  const lins = bySoup(soup).flatMap((b) => b.lineages.filter((x) => x.robust && x.first <= start + b.exposure));
  const perLin = new Map();
  for (const b of bySoup(soup)) for (const f of b.fams.filter((x) => x.robust && x.lineage)) perLin.set(`${b.id}|${f.lineage}`, (perLin.get(`${b.id}|${f.lineage}`) ?? 0) + 1);
  const counts = [...perLin.values()].sort((a, b) => a - b);
  out(`   ${soup.padEnd(12)} famílies robustes ${all.length}; dins d'un llinatge que ja se seguia ${inside} (${f2(all.length ? inside / all.length : null)}); llinatges robustos ${lins.length}; famílies per grup de llinatges: la mediana ${counts.length ? counts[(counts.length - 1) >> 1] : '—'}, el màxim ${counts.length ? counts.at(-1) : '—'}`);
}

// 3. λlin, i les aparicions que no s'estableixen
const worlds = cohort.map((w) => ({ w, b: Object.fromEntries(ARMS.map((s) => [s, B.find((x) => x.world === w && x.soup === s)])) }));
const appear = (b, pick) => b.lineages.filter((x) => x.robust && x.first <= start + b.exposure && pick(x)).length;
const PICK = { totes: () => true, 'no s\'estableixen': (x) => !x.rooted };
const lam = (ws, soup, pick) => { let k = 0, e = 0; for (const x of ws) { k += appear(x.b[soup], pick); e += x.b[soup].exposure; } return e ? (1000 * k) / e : null; };
const ratio = (ws, soup, pick) => { const a = lam(ws, soup, pick), r = lam(ws, 'reinit', pick); return a !== null && r ? a / r : null; };
out('\n2. λlin: les aparicions robustes dels llinatges naturals, per cada 1.000 mon-èpoques d\'exposició (exploratori)');
for (const [nom, pick] of Object.entries(PICK)) {
  out(`   ${nom}:`);
  for (const soup of ARMS) {
    const k = bySoup(soup).reduce((s, b) => s + appear(b, pick), 0);
    out(`     ${soup.padEnd(12)} ${k} aparicions; λlin ${f2(lam(worlds, soup, pick), 3)}`);
  }
  for (const soup of ['continue', 'shuffle-all']) out(`     ${soup} contra reinit: ${f2(ratio(worlds, soup, pick))} ${ci(bootstrap(worlds, (ws) => ratio(ws, soup, pick), BOOTSTRAP))}`);
}
const est = (ws, soup) => { let k = 0, e = 0; for (const x of ws) { k += x.b[soup].ev ? 1 : 0; e += x.b[soup].exposure; } return e ? k / e : null; };
for (const soup of ['continue', 'shuffle-all']) out(`   el ritme d'establiment, ${soup} contra reinit: ${f2(est(worlds, soup) / est(worlds, 'reinit'))} ${ci(bootstrap(worlds, (ws) => { const r = est(ws, 'reinit'); return r ? est(ws, soup) / r : null; }, BOOTSTRAP))}`);

// 4. La consistència
const fisher = (a, b, c, dd) => {
  const lf = (n) => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; };
  const n1 = a + b, n2 = c + dd, k = a + c, N = n1 + n2;
  const p = (x) => Math.exp(lf(n1) - lf(x) - lf(n1 - x) + lf(n2) - lf(k - x) - lf(n2 - k + x) - (lf(N) - lf(k) - lf(N - k)));
  const p0 = p(a); let s = 0;
  for (let x = Math.max(0, k - n2); x <= Math.min(k, n1); x++) { const px = p(x); if (px <= p0 * (1 + 1e-9)) s += px; }
  return Math.min(1, s);
};
const A = m.branches.filter((b) => b.part === 'A' && ARMS.includes(b.soup) && ANALYSIS.informative.includes(b.variant));
out('\n3. La consistència: P(arrela | detectada) dels llinatges naturals robustos contra els plantats informatius (G1, G1x9 i G4)');
for (const soup of ARMS) {
  const nat = consistencyTally(bySoup(soup).flatMap((b) => b.lineages.filter((x) => x.robust).map((x) =>
    followUpClass({ detected: x.first, event: b.ev ? b.ev.epoch : null, dominant: x.rooted, eligibleUntil: start + d.horizonB - ANALYSIS.interval }))));
  // els plantats que el cens inert ha detectat, com a l'anàlisi del pilot (detectedAt no nul); el primer intent els hi posava tots (intent-1/)
  const pla = consistencyTally(A.filter((b) => b.soup === soup).map((b) => partA(readJsonl(join(ROOT, PILOT, 'part-a', `${b.id}.jsonl`)), { start, horizon: d.horizonA }))
    .filter((r) => r.detectedAt !== null).map((r) => plantedClass(r, { start, horizon: d.horizonA })));
  const P = (t) => (t.n ? t.k / t.n : null);
  const pN = P(nat.main), pP = P(pla.main);
  const p = fisher(nat.main.k, nat.main.n - nat.main.k, pla.main.k, pla.main.n - pla.main.k);
  const diff = pN !== null && pP !== null ? pN - pP : null;
  const verdict = diff === null ? 'no es pot dir' : Math.abs(diff) <= 0.15 && p >= 0.05 ? 'coincideixen' : 'no coincideixen';
  out(`   ${soup.padEnd(12)} naturals ${nat.main.k} de ${nat.main.n} (${f2(pN)}); plantats ${pla.main.k} de ${pla.main.n} (${f2(pP)}); la diferència ${f2(diff)}, p de Fisher ${f2(p, 3)}: ${verdict}`);
  out(`     naturals: arrela ${nat.arrela}, competidor ${nat.competidor}, no arrela ${nat['no arrela']}; no hi entren: tardanes ${nat.tardana}, prèvies ${nat.previ}; plantats: arrela ${pla.arrela}, competidor ${pla.competidor}, no arrela ${pla['no arrela']}; tardanes ${pla.tardana}, prèvies ${pla.previ}`);
  out(`     sense els competidors (sensibilitat): naturals ${nat.sansCompetitors.k} de ${nat.sansCompetitors.n} (${f2(P(nat.sansCompetitors))}), plantats ${pla.sansCompetitors.k} de ${pla.sansCompetitors.n} (${f2(P(pla.sansCompetitors))})`);
}

// 5. Els veïns
const S = V.filter((l) => l.type === 'sembra').map((s) => ({ ...s, frac: s.malmes / (2 * s.veins) }));
const firstZero = new Map();
for (const s of S) {
  const rec = readJsonl(join(ROOT, PILOT, 'part-a', `${s.branch}.jsonl`));
  const l = rec.find((x) => x.type === 'lineage' && x.epoch === start + 50);
  firstZero.set(s.branch, l ? l.F === 0 : null);
}
out('\n4. Els veïns de la sembra, en una sola trobada: la part de les trobades en què el genotip queda malmès (ja no és hereditari amb companys inerts; la mitjana de les sembres)');
const meanFrac = (ss) => (ss.length ? ss.reduce((t, s) => t + s.frac, 0) / ss.length : null);
const wv = cohort.map((w) => S.filter((s) => s.world === w));
for (const g of ['G1', 'G4']) {
  for (const soup of ARMS) {
    const ss = S.filter((s) => s.genotype === g && s.soup === soup);
    const c = ss.reduce((t, s) => ({ copia: t.copia + s.copia, tocat: t.tocat + s.tocat, malmes: t.malmes + s.malmes, n: t.n + 2 * s.veins }), { copia: 0, tocat: 0, malmes: 0, n: 0 });
    out(`   ${g} ${soup.padEnd(12)} ${ss.length} sembres; malmès ${f2(meanFrac(ss), 3)}; de ${c.n} trobades: es copia ${c.copia}, tocat ${c.tocat}, malmès ${c.malmes}`);
  }
  for (const soup of ['continue', 'shuffle-all']) {
    const rq = (ws) => { const a = meanFrac(ws.flat().filter((s) => s.genotype === g && s.soup === soup)), r = meanFrac(ws.flat().filter((s) => s.genotype === g && s.soup === 'reinit')); return a !== null && r ? a / r : null; };
    out(`   ${g} ${soup} contra reinit: ${f2(rq(wv))} ${ci(bootstrap(wv, rq, BOOTSTRAP))}`);
  }
}
out('   Dins de cada sopa: la part de les sembres que s\'apaguen al primer pas del llinatge (F = 0 a l\'època 8.050), per terços de la part malmesa');
for (const g of ['G1', 'G4']) for (const soup of ARMS) {
  const ss = S.filter((s) => s.genotype === g && s.soup === soup).sort((a, b) => a.frac - b.frac);
  const t = [0, 1, 2].map((i) => ss.slice(Math.floor((i * ss.length) / 3), Math.floor(((i + 1) * ss.length) / 3)));
  out(`   ${g} ${soup.padEnd(12)} ${t.map((x, i) => `terç ${i + 1} (malmès ${f2(meanFrac(x), 3)}): ${x.filter((s) => firstZero.get(s.branch)).length} de ${x.length}`).join('; ')}`);
}
out('   La composició dels 24 veïns (descriptiu, la mitjana de les sembres de G1): la part d\'instruccions, de < i de ,');
for (const soup of ARMS) {
  const ss = S.filter((s) => s.genotype === 'G1' && s.soup === soup);
  const avg = (k) => ss.reduce((t, s) => t + s[k], 0) / ss.length;
  out(`   ${soup.padEnd(12)} instruccions ${f2(avg('instr'), 3)}; < ${f2(avg('lt'), 4)}; , ${f2(avg('comma'), 4)}`);
}
