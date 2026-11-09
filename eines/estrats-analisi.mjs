// L'anàlisi de la composició de bytes de B1 (docs/pla-b1.md, §13), escrita abans de calcular res. Exploratòria.
//
//   node eines/estrats-analisi.mjs carpeta
//
// Llegeix els JSONL d'eines/estrats.mjs d'una carpeta i els valida contra el pla (planRuns): els 65 estrats de la corba, les 22
// sopes del pilot amb els dos tipus de company, i D½ amb companys de D½. Cada tirada, amb la seva llavor (eines/b1-llavors.mjs) i
// la seva N, sencera de 0 a N (en un fitxer o en trossos sense forats); tots del mateix commit, sense canvis, i amb els mòduls
// d'aquesta còpia; els bytes de cada replicador, els del seu programa; cada composició, la del fitxer de git, i la seva captura, la
// del manifest del pilot. Si hi ha cap problema, els llista i no analitza res.
//
// Què en surt (tot descriptiu):
//  1. la corba: per a cada estrat k, rₖ, la part dels programes amb k instruccions que són hereditaris, amb el seu interval de
//     Clopper-Pearson; m, el k més petit amb algun hereditari (el de veritat pot ser més petit); i ρ(p) = Σₖ C(64, k) pᵏ (1 − p)⁶⁴⁻ᵏ rₖ,
//     amb l'interval de Fay i Feuer, a una graella de p, amb p*, la p de la graella fina amb la ρ més alta, i les p on la cota
//     superior arriba a la inferior de p*. També amb l'herència sola, que vol dir «el programa primer»: el codi del company també s'hi
//     executa, després del del programa (AUD-175). Amb companys de soroll, el company hi pot ajudar, i als k petits la corba en mesura
//     sobretot l'ajuda: la corba sense l'ajuda del company, ρ_aut(p), és a eines/estrats-autonomia-analisi.mjs. Dues comprovacions
//     descriptives, amb mostres independents: ρ(½) contra la densitat de C0 amb D½ al nivell 1, i ρ(10/256) contra la de C0 amb bytes
//     uniformes;
//  2. les sopes del pilot: per a cada món, la part d'instruccions, la densitat amb companys uniformes i amb companys sintetitzats a
//     partir de l'histograma de la sopa (aparellades, amb la taula de 2 × 2 i el quocient), la ρ de la corba a la mateixa part
//     d'instruccions (amb les instruccions i els altres valors uniformes), i la part de cel·les hereditàries de l'escaneig del braç
//     shuffle-all del pilot (AUD-121 i AUD-122); i les 22 juntes, amb la taula de 2 × 2 i el quocient (auditor 1). Els companys
//     sintetitzats només conserven la freqüència de cada byte, no l'estructura de les cel·les (auditor 2). Comparar-les no és cap
//     predicció causal de l'origen a la sopa: demanaria un model dels encontres. Tots els recomptes es donen, també els zeros, i N no
//     s'amplia després de veure'ls (auditor 2);
//  3. D½ amb companys de D½: els primers 10⁶ programes del nivell 1, amb uns altres companys, contra C0 al nivell 1.
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { PROGRAM_SIZE } from '../fase1/bff.js';
import { LEVEL1, strataBlocks, strataSize, soupBlocks, SOUP_PROGRAMS } from './b1-llavors.mjs';
import { fileHashes, readExtract, extractRecord, readJsonl, sha256 } from './b1-comu.mjs';
import { clopperPearsonBeta, fayFeuer } from './b1-estadistica.mjs';
import { ratio } from './densitat-analisi.mjs';
import { MODULES, TEST, NOISE, parseSource, readComposition, soupFor, sourceDraw } from './estrats.mjs';
import { cohort, MANIFEST } from './composicio.mjs';


export const COMPOSITIONS = 'fase2/resultats/b1/composicio';
export const D_MIG_PROGRAMS = 1e6;
// Les tirades del pla: { key, program, partner, seed, programs }
export function planRuns(worlds = cohort().map((w) => w.world)) {
  const runs = strataBlocks().map((b) => ({ key: `estrat:${b.k}`, program: `estrat:${b.k}`, partner: 'uniforme', seed: b.from, programs: strataSize(b.k), k: b.k }));
  const soups = soupBlocks(worlds.length);
  worlds.forEach((world, s) => {
    for (const partner of ['uniforme', 'programa']) runs.push({ key: `sopa:${world}:${partner}`, program: `sopa:${COMPOSITIONS}/${world}.json`, partner, seed: soups[s].from, programs: SOUP_PROGRAMS, world });
  });
  runs.push({ key: 'd-mig:programa', program: 'd-mig', partner: 'programa', seed: LEVEL1.from, programs: D_MIG_PROGRAMS });
  return runs;
}
const KEYS = ['tested', 'replicates', 'heritable', 'heritableSolo', 'heritableContext'];

// Un fitxer: { name, sha256, start, found, problems }, amb els recomptes i els bytes comprovats. La SHA-256 és la del fitxer: la prova
// d'autonomia dels seus hereditaris (eines/autonomia.mjs --registre) la porta a la línia d'inici
export function readRun(file, root) {
  const r = readJsonl(file), { name } = r;
  if (r.problems.length && !r.start) return r;
  const problems = [...r.problems], { start: s, lines, end } = r;
  const arg = (k, d) => { const m = new RegExp(`(?:^| )--${k} (\\S+)`).exec(s.command ?? ''); return m ? m[1] : d; };
  if (!/^node eines\/estrats\.mjs /.test(s.command ?? '') || arg('programa') !== s.program || arg('company') !== s.partner || Number(arg('llavor')) !== s.seed ||
      Number(arg('programes')) !== s.programs || Number(arg('de', '0')) !== s.from) problems.push(`${name}: l'ordre no diu el mateix que els camps de la línia d'inici`);
  if (s.test !== TEST || s.chemistry !== 'C0' || s.noise !== NOISE) problems.push(`${name}: la prova no és la de la §13`);
  let source = null, draw = null;
  try {
    source = parseSource(s.program);
    if (source.kind === 'sopa') {
      const comp = readComposition(join(root, source.file));
      if (s.composition?.sha256 !== comp.sha256) problems.push(`${name}: la composició no és la de ${source.file}`);
      draw = sourceDraw(source, comp.counts);
    } else draw = sourceDraw(source);
  } catch (e) { problems.push(`${name}: ${e.message}`); }
  const totals = Object.fromEntries(KEYS.map((k) => [k, 0])), found = [];
  let last = s.from - 1, upTo = s.from;
  for (const o of lines ?? []) {
    if (o.type === 'replicator') {
      if (!(Number.isInteger(o.index) && o.index > last && o.index >= upTo && o.index < s.to)) problems.push(`${name}: un replicador fora d'ordre o del seu tros (${o.index})`);
      if (!(o.solo || o.context) || (o.heritableSolo && !o.solo) || (o.heritableContext && !o.context) || !/^[0-9a-f]{128}$/.test(o.bytes ?? '')) problems.push(`${name}: el replicador ${o.index} no és coherent`);
      else if (source && o.bytes !== Buffer.from(soupFor(o.index, s.seed, source, s.partner, draw).subarray(0, PROGRAM_SIZE)).toString('hex')) problems.push(`${name}: els bytes del replicador ${o.index} no són els del seu programa`);
      last = o.index;
      found.push(o);
      totals.replicates++;
      if (o.heritableSolo || o.heritableContext) totals.heritable++;
      if (o.heritableSolo) totals.heritableSolo++;
      if (o.heritableContext) totals.heritableContext++;
    } else if (o.type === 'count') {
      if (!(o.upTo > upTo && o.upTo <= s.to) || last >= o.upTo) problems.push(`${name}: un recompte fora d'ordre (${o.upTo})`);
      totals.tested = o.upTo - s.from;
      upTo = o.upTo;
      for (const k of KEYS) if (o[k] !== totals[k]) problems.push(`${name}: el recompte fins a ${o.upTo} no és el dels replicadors (${k})`);
    } else problems.push(`${name}: una línia desconeguda (${o.type})`);
  }
  if (upTo !== s.to || end.from !== s.from || end.to !== s.to || s.to - s.from !== s.programs) problems.push(`${name}: els recomptes o la línia final no arriben al final del tros`);
  for (const k of KEYS) if (end[k] !== totals[k]) problems.push(`${name}: el total de la línia final no és el dels recomptes (${k})`);
  return { name, sha256: sha256(readFileSync(file)), start: s, end, found, problems };
}

// La carpeta, contra el pla. Retorna { runs, problems }: runs[key] = { n, found }
export function readFolder(dir, { root = process.cwd(), plan = planRuns(), modules = fileHashes(MODULES), manifest = cohort(join(root, MANIFEST)) } = {}) {
  const problems = [], byKey = {};
  const files = readdirSync(dir).filter((f) => f.endsWith('.jsonl')).sort();
  if (!files.length) return { runs: {}, problems: [`${dir}: cap JSONL`] };
  let code = null;
  const keyOf = (s) => plan.find((p) => p.program === s.program && p.partner === s.partner);
  for (const f of files) {
    const r = readRun(join(dir, f), root);
    problems.push(...r.problems);
    if (!r.start) continue;
    const p = keyOf(r.start);
    if (!p) { problems.push(`${r.name}: ${r.start.program} amb companys ${r.start.partner} no és del pla`); continue; }
    if (r.start.seed !== p.seed) problems.push(`${r.name}: la llavor és ${r.start.seed}, i la del pla, ${p.seed}`);
    if (code === null) code = r.start.code;
    if (r.start.code !== code || !/^[0-9a-f]{7,40}$/.test(r.start.code ?? '')) problems.push(`${r.name}: el codi és ${r.start.code}, i ha de ser el mateix commit a tots, sense canvis (${code})`);
    const other = MODULES.filter((m) => r.start.modules?.[m] !== modules[m]);
    if (other.length) problems.push(`${r.name}: ${other.join(', ')}, amb una altra SHA-256 que a aquesta còpia: el registre és d'un altre codi`);
    if (p.world) {
      const w = manifest.find((x) => x.world === p.world), c = r.start.composition;
      if (!w || c?.world !== p.world || c?.capture?.sha256 !== w.capture.sha256) problems.push(`${r.name}: la composició no és la de la captura del món ${p.world} del manifest`);
    }
    (byKey[p.key] ??= []).push(r);
  }
  const runs = {};
  for (const p of plan) {
    const rs = (byKey[p.key] ?? []).sort((a, b) => a.start.from - b.start.from);
    if (!rs.length) { problems.push(`${p.key}: hi falta`); continue; }
    let at = 0;
    for (const r of rs) {
      if (r.start.from !== at) problems.push(`${p.key}: ${r.start.from > at ? 'hi falten' : 'es repeteixen'} programes a partir del ${at}`);
      at = Math.max(at, r.start.to);
    }
    if (at !== p.programs) problems.push(`${p.key}: ${at} programes, i el pla en preveu ${p.programs}`);
    // files: cada fitxer de la tirada, amb la seva SHA-256, per a la prova d'autonomia dels seus hereditaris (AUD-175)
    runs[p.key] = { n: at, found: rs.flatMap((r) => r.found), files: rs.map((r) => ({ name: r.name, sha256: r.sha256, start: r.start, end: r.end, found: r.found })) };
  }
  return { runs, problems };
}

const sci = (x) => (x === null ? '—' : x === 0 ? '0' : x.toExponential(2).replace('e', '·10^').replace('+', ''));
const fmt = (x) => (x === null ? '—' : x === Infinity ? '∞' : x.toFixed(2));
const cp = (k, n) => { const [lo, hi] = clopperPearsonBeta(k, n); return `${sci(k / n)} (de ${sci(lo)} a ${sci(hi)})`; };
const isHer = (o) => o.heritableSolo || o.heritableContext;
// ln C(64, k)
const LNC = (() => { const f = [0]; for (let i = 1; i <= 64; i++) f.push(f[i - 1] + Math.log(i)); return (k) => f[64] - f[k] - f[64 - k]; })();
export const binomialWeight = (k, p) => (p <= 0 ? (k === 0 ? 1 : 0) : p >= 1 ? (k === 64 ? 1 : 0) : Math.exp(LNC(k) + k * Math.log(p) + (64 - k) * Math.log1p(-p)));
// ρ(p) i el seu interval, a partir dels recomptes dels estrats: strata[k] = { n, x }
export function rho(strata, p) {
  const ks = strata.map((_, k) => k);
  return fayFeuer(ks.map((k) => binomialWeight(k, p) / strata[k].n), ks.map((k) => strata[k].x));
}
export const GRID = [0.01, 0.02, 0.03, 10 / 256, 0.05, 0.075, 0.1, 0.125, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99];

export function analyse(runs, { extract = readExtract(), manifest = cohort() } = {}) {
  const out = [];
  // 1. la corba
  for (const [label, sel] of [['hereditaris (sols o en context)', isHer], ['hereditaris sols (el programa primer; el codi del company també hi és, AUD-175)', (o) => o.heritableSolo]]) {
    const strata = Array.from({ length: 65 }, (_, k) => { const r = runs[`estrat:${k}`]; return { n: r.n, x: r.found.filter(sel).length }; });
    out.push(`1. La corba ρ(p), ${label}, amb C0 i companys uniformes`);
    out.push(`  Els estrats, k: hereditaris de n, rₖ (IC del 95 %), només els que en tenen: ${strata.map((s, k) => (s.x ? `${k}: ${s.x} de ${s.n}` : null)).filter(Boolean).join('; ') || 'cap'}`);
    const m = strata.findIndex((s) => s.x > 0);
    out.push(`  m, el k més petit amb algun hereditari: ${m < 0 ? 'cap' : `${m} (rₘ = ${cp(strata[m].x, strata[m].n)}); el de veritat pot ser més petit, i amb l'ajuda del company pot ser 0 o 1 (AUD-175)`}`);
    out.push(`  ρ(p), amb l'interval de Fay i Feuer del 95 %: ${GRID.map((p) => { const r = rho(strata, p); return `${p === 10 / 256 ? '10/256' : p}: ${sci(r.value)} (de ${sci(r.ci[0])} a ${sci(r.ci[1])})`; }).join('; ')}`);
    let best = 0, bestP = null;
    for (let i = 1; i < 1000; i++) { const v = rho(strata, i / 1000).value; if (v > best) { best = v; bestP = i / 1000; } }
    if (bestP !== null) {
      const at = rho(strata, bestP), near = [];
      for (let i = 1; i < 1000; i++) if (rho(strata, i / 1000).ci[1] >= at.ci[0]) near.push(i / 1000);
      out.push(`  p*, la p amb la ρ més alta (graella de 0,001): ${bestP}, ρ = ${sci(at.value)} (de ${sci(at.ci[0])} a ${sci(at.ci[1])}); les p on la cota superior arriba a la inferior de p*: de ${near[0]} a ${near[near.length - 1]}`);
    } else out.push('  p*: cap estrat no té hereditaris');
    if (sel === isHer) {
      for (const [p, dist, what] of [[0.5, 'd-mig', 'D½'], [10 / 256, 'uniforme', 'bytes uniformes']]) {
        const e = extractRecord(extract, 'C0', dist).end, r = rho(strata, p);
        out.push(`  Comprovació, ${what}: ρ = ${sci(r.value)} (de ${sci(r.ci[0])} a ${sci(r.ci[1])}), i al nivell 1, C0, ${e.heritable} de ${e.tested}: ${cp(e.heritable, e.tested)}`);
      }
    }
  }
  // 2. les sopes del pilot
  const curve = Array.from({ length: 65 }, (_, k) => { const r = runs[`estrat:${k}`]; return { n: r.n, x: r.found.filter(isHer).length }; });
  out.push(`2. Les sopes del pilot (l'època 8.000), amb C0: la part d'instruccions; hereditaris amb companys uniformes i amb companys sintetitzats a partir de l'histograma de la sopa (de ${SOUP_PROGRAMS}); la taula de 2 × 2 (tots dos, només uniformes, només de la sopa) i el quocient (de la sopa / uniformes); la ρ de la corba a la mateixa part; i l'escaneig de shuffle-all del pilot, hereditaris de les cel·les`);
  const pilot = JSON.parse(readFileSync(MANIFEST, 'utf8')).worlds;
  const sum = { u: 0, c: 0, n: 0, both: 0, sh: 0, cells: 0 };
  for (const w of manifest) {
    const u = runs[`sopa:${w.world}:uniforme`], c = runs[`sopa:${w.world}:programa`];
    const comp = readComposition(join(COMPOSITIONS, `${w.world}.json`)), p = comp.instructions / comp.bytes;
    const hu = new Set(u.found.filter(isHer).map((o) => o.index)), hc = new Set(c.found.filter(isHer).map((o) => o.index));
    const both = [...hc].filter((i) => hu.has(i)).length, r = ratio(hc.size, hu.size), d = rho(curve, p);
    const scan = pilot.find((x) => x.world === w.world).arms['shuffle-all'].scan;
    out.push(`  ${w.world}: p = ${p.toFixed(4)}; uniformes ${hu.size}, ${cp(hu.size, u.n)}; de la sopa ${hc.size}, ${cp(hc.size, c.n)}; ${both}, ${hu.size - both}, ${hc.size - both}, quocient ${fmt(r.value)} (de ${fmt(r.ci[0])} a ${fmt(r.ci[1])}); la corba, ${sci(d.value)} (de ${sci(d.ci[0])} a ${sci(d.ci[1])}); shuffle-all, ${scan.heritable} de ${scan.cells}, ${cp(scan.heritable, scan.cells)}`);
    sum.u += hu.size; sum.c += hc.size; sum.n += u.n; sum.both += both; sum.sh += scan.heritable; sum.cells += scan.cells;
  }
  // les 22 juntes, aparellades programa a programa (auditor 1): cada sopa en donarà pocs
  const rAll = ratio(sum.c, sum.u);
  out.push(`  Les ${manifest.length} sopes juntes: uniformes ${sum.u}, ${cp(sum.u, sum.n)}; de la sopa ${sum.c}, ${cp(sum.c, sum.n)}; ${sum.both}, ${sum.u - sum.both}, ${sum.c - sum.both}, quocient ${fmt(rAll.value)} (de ${fmt(rAll.ci[0])} a ${fmt(rAll.ci[1])}); shuffle-all, ${sum.sh} de ${sum.cells}, ${cp(sum.sh, sum.cells)}`);
  // 3. D½ amb companys de D½, aparellat amb el nivell 1
  const dm = runs['d-mig:programa'], h3 = new Set(dm.found.filter(isHer).map((o) => o.index));
  const h1 = new Set(extractRecord(extract, 'C0', 'd-mig').heritable.filter((o) => o.index < dm.n).map((o) => o.index));
  const both3 = [...h3].filter((i) => h1.has(i)).length, r3 = ratio(h3.size, h1.size);
  out.push(`3. D½ amb companys de D½, els primers ${dm.n} programes del nivell 1, amb C0: ${h3.size} hereditaris, ${cp(h3.size, dm.n)}; amb companys uniformes (el nivell 1), ${h1.size}; ${both3}, ${h1.size - both3}, ${h3.size - both3}; quocient ${fmt(r3.value)} (de ${fmt(r3.ci[0])} a ${fmt(r3.ci[1])})`);
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.argv[2];
  if (!dir || process.argv.length !== 3) { console.error('Ús: node eines/estrats-analisi.mjs carpeta'); process.exit(2); }
  const { runs, problems } = readFolder(dir);
  if (problems.length) {
    console.log(`Els registres no són els del pla (${problems.length} problemes):\n${problems.slice(0, 20).map((p) => `  ${p}`).join('\n')}${problems.length > 20 ? `\n  i ${problems.length - 20} més` : ''}`);
    process.exit(1);
  }
  for (const l of analyse(runs)) console.log(l);
}
