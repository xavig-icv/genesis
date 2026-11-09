// L'anàlisi de la corba sense l'ajuda del company, ρ_aut(p), de la composició de bytes de B1 (docs/pla-b1.md, §13; AUD-175, auditoria
// 28), escrita abans de calcular res. Exploratòria i descriptiva, com la de la §13.
//
//   node eines/estrats-autonomia-analisi.mjs carpeta-estrats carpeta-autonomia-estrats carpeta-autonomia
//
// Per què: amb companys de soroll, un hereditari «sol» vol dir que el programa va primer, no que el company no hi faci res: el codi
// del company també s'executa, després del del programa. Als estrats amb pocs bytes d'instrucció, la corba ρ(p) de la §13 mesuraria
// sobretot el que fa el company (auditor 1). Aquí, cada hereditari de les tirades de la §13 es torna a provar amb companys inerts, amb
// la prova d'autonomia de la §4 i les seves 100 condicions (eines/autonomia.mjs --registre).
//
// Les tres carpetes:
//  - carpeta-estrats: els registres de la §13 (eines/estrats.mjs), validats com a eines/estrats-analisi.mjs: el pla sencer;
//  - carpeta-autonomia-estrats: els d'eines/autonomia.mjs --registre, un per cada registre de la §13. Es validen: cada fitxer sencer,
//    amb l'empremta; l'ordre, la de l'eina, amb --registre; la química (C0), la llavor, les condicions, els companys, la prova i la
//    comprovació dels companys inerts, les de la §4; tots del mateix commit, sense canvis, i amb els mòduls d'aquesta còpia; cada
//    registre de la §13, amb un sol registre d'autonomia, que en porta el nom, la SHA-256 i l'empremta; i els replicadors, els
//    hereditaris del registre de la §13, tots i en ordre, amb els mateixos bytes, i cada cadena, de 100 caràcters 0 o 1, coherent;
//  - carpeta-autonomia: els de la prova d'autonomia de la §4, validats amb eines/autonomia-analisi.mjs, per a les comprovacions.
// Si hi ha cap problema, els llista i no analitza res.
//
// La xifra d'un hereditari, com a la §4: n, en quantes de les 100 condicions és hereditari, sol o en context, amb companys inerts. aₖ,
// els hereditaris de l'estrat k amb n ≥ 1 (es poden copiar sense el codi del company: la xifra principal), i, a part, amb n > 50.
// Què en surt:
//  1. ρ_aut(p) = Σₖ wₖ(p) · aₖ / nₖ, amb nₖ els programes de l'estrat i l'interval de Fay i Feuer, a la graella de la §13; m_aut, el k
//     més petit amb algun aₖ > 0 (el de veritat pot ser més petit); p*, descriptiva; i dues comprovacions, amb mostres independents:
//     ρ_aut(½) contra la part dels programes de C0 amb D½ del nivell 1 que passen la mateixa xifra a la §4, i ρ_aut(10/256) contra la
//     de C0 amb bytes uniformes. La predicció de la §13 (ρ creix com pᵐ amb p petit) és la de ρ_aut;
//  2. per grups de k (0–4, 5–12, 13–24, 25–40 i 41–64): els hereditaris, i quants passen cada xifra;
//  3. les sopes del pilot: per a cada sopa, i les 22 juntes, els autònoms amb companys uniformes i amb companys sintetitzats a partir
//     de l'histograma de la sopa, de 10⁶, i ρ_aut a la seva part d'instruccions;
//  4. D½ amb companys de D½: els autònoms dels seus hereditaris. Els que també ho eren al nivell 1 són els mateixos bytes, amb les
//     mateixes condicions: les seves quatre cadenes han de ser les de la §4, i, si no, és un problema de la validació.
import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { AUTONOMY } from './b1-llavors.mjs';
import { fileHashes, readJsonl } from './b1-comu.mjs';
import { clopperPearsonBeta } from './b1-estadistica.mjs';
import { MODULES_STRATA, TEST, PARTNERS, CONDITIONS } from './autonomia.mjs';
import { readFolder as readAutonomyFolder, countsOf } from './autonomia-analisi.mjs';
import { readFolder as readStrataFolder, planRuns, rho, GRID, COMPOSITIONS } from './estrats-analisi.mjs';
import { readComposition } from './estrats.mjs';
import { cohort } from './composicio.mjs';

const KEYS = ['solo', 'context', 'heritableSolo', 'heritableContext'];
export const XIFRES = Object.freeze([
  { name: 'n ≥ 1', test: (n) => n >= 1, label: 'es poden copiar sense el codi del company (la xifra principal)' },
  { name: 'n > 50', test: (n) => n > 50, label: 'en la majoria de les condicions assajades' },
]);
const isHer = (o) => o.heritableSolo || o.heritableContext;

// La carpeta de l'autonomia dels hereditaris de la §13, contra els registres de la §13 (strata, de readStrataFolder). Retorna
// { tested, problems }: tested[key] = [{ index, bytes, solo, context, heritableSolo, heritableContext }], en l'ordre de la tirada
export function readStrataAutonomy(dir, strata, { plan = planRuns(), modules = fileHashes(MODULES_STRATA), seed = AUTONOMY.from, conditions: C = CONDITIONS } = {}) {
  const problems = [], bySha = new Map();
  const files = readdirSync(dir).filter((f) => f.endsWith('.jsonl')).sort();
  if (!files.length) return { tested: {}, problems: [`${dir}: cap JSONL`] };
  let code = null;
  for (const f of files) {
    const r = readJsonl(join(dir, f));
    problems.push(...r.problems);
    if (r.problems.length) continue;
    const { name, start: s, lines, end } = r;
    const m = /^node eines\/autonomia\.mjs --registre (\S+) /.exec(s.command ?? '');
    if (!m || m[1].split(/[\\/]/).pop() !== s.source?.file) problems.push(`${name}: l'ordre no és la d'eines/autonomia.mjs amb --registre, o no diu el mateix registre que la línia d'inici`);
    if (s.chemistry !== 'C0' || s.seed !== seed || s.conditions !== C || s.partners !== PARTNERS || s.test !== TEST) problems.push(`${name}: la química, la llavor, les condicions, els companys o la prova no són els del pla`);
    if (s.inertCheck?.active !== 0 || s.inertCheck?.pairs !== C * PARTNERS * (PARTNERS - 1)) problems.push(`${name}: la comprovació dels companys inerts no és la de tots, o en va trobar d'actius`);
    if (code === null) code = s.code;
    if (s.code !== code || !/^[0-9a-f]{7,40}$/.test(s.code ?? '')) problems.push(`${name}: el codi és ${s.code}, i ha de ser el mateix commit a tots, sense canvis (${code})`);
    const other = MODULES_STRATA.filter((x) => s.modules?.[x] !== modules[x]);
    if (other.length) problems.push(`${name}: ${other.join(', ')}, amb una altra SHA-256 que a aquesta còpia: el registre és d'un altre codi`);
    if (bySha.has(s.source?.sha256)) { problems.push(`${name}: el registre de la §13 ${s.source?.file} ja té una prova d'autonomia`); continue; }
    bySha.set(s.source?.sha256, { name, start: s, lines, end });
  }
  const tested = {};
  for (const p of plan) {
    const run = strata[p.key];
    if (!run) continue;  // readStrataFolder ja ho diu
    tested[p.key] = [];
    for (const file of run.files) {
      const a = bySha.get(file.sha256);
      if (!a) { problems.push(`${p.key}: el registre ${file.name} no té cap prova d'autonomia`); continue; }
      bySha.delete(file.sha256);
      const her = file.found.filter(isHer);
      if (a.start.source.file !== file.name || a.start.source.fingerprint !== file.end.fingerprint || a.start.source.heritable !== her.length) problems.push(`${a.name}: el registre de la §13 no és ${file.name} tal com és`);
      if (a.lines.length !== her.length || a.end.replicators !== a.lines.length || a.end.conditions !== C) problems.push(`${a.name}: ${a.lines.length} replicadors, i ${file.name} té ${her.length} hereditaris`);
      a.lines.forEach((o, i) => {
        const h = her[i];
        if (o.type !== 'replicator' || !h || o.index !== h.index || o.bytes !== h.bytes) { problems.push(`${a.name}: la línia ${i + 2} no és l'hereditari ${h?.index} de ${file.name}`); return; }
        if (KEYS.some((k) => typeof o[k] !== 'string' || !new RegExp(`^[01]{${C}}$`).test(o[k]))) { problems.push(`${a.name}: el replicador ${o.index} no té les quatre cadenes de ${C}`); return; }
        for (let j = 0; j < C; j++) if ((o.heritableSolo[j] === '1' && o.solo[j] !== '1') || (o.heritableContext[j] === '1' && o.context[j] !== '1')) { problems.push(`${a.name}: el replicador ${o.index} no és coherent a la condició ${j}`); return; }
        tested[p.key].push(o);
      });
    }
  }
  for (const a of bySha.values()) problems.push(`${a.name}: no és de cap registre de la §13 de la carpeta (${a.start.source?.file})`);
  return { tested, problems };
}

// La comprovació de construcció de la §4 amb D½ amb companys de D½: els hereditaris que també ho eren al nivell 1 (C0, D½) han de tenir
// les quatre cadenes de la §4, cadena a cadena
export function checkAgainstLevel1(tested, autonomy) {
  const problems = [], level1 = new Map((autonomy['d-mig']?.C0?.reps ?? []).map((o) => [o.index, o]));
  let same = 0;
  for (const o of tested['d-mig:programa'] ?? []) {
    const l = level1.get(o.index);
    if (!l) continue;
    if (l.bytes !== o.bytes || KEYS.some((k) => l[k] !== o[k])) problems.push(`d-mig:programa: l'hereditari ${o.index} no té les cadenes de la §4, amb els mateixos bytes i les mateixes condicions`);
    else same++;
  }
  return { same, problems };
}

const sci = (x) => (x === null ? '—' : x === 0 ? '0' : x.toExponential(2).replace('e', '·10^').replace('+', ''));
const cp = (k, n) => { const [lo, hi] = clopperPearsonBeta(k, n); return `${sci(k / n)} (de ${sci(lo)} a ${sci(hi)})`; };
const count = (reps, f) => reps.filter((o) => f.test(countsOf(o).any)).length;
export const GROUPS = Object.freeze([[0, 4], [5, 12], [13, 24], [25, 40], [41, 64]]);

// strata: les tirades de la §13 (readStrataFolder); tested: les proves d'autonomia (readStrataAutonomy); autonomy: les de la §4
// (eines/autonomia-analisi.mjs, readFolder)
export function analyse(strata, tested, autonomy, { manifest = cohort() } = {}) {
  const out = [];
  // 1. la corba
  for (const f of XIFRES) {
    const curve = Array.from({ length: 65 }, (_, k) => ({ n: strata[`estrat:${k}`].n, x: count(tested[`estrat:${k}`], f) }));
    out.push(`1. La corba sense l'ajuda del company, ρ_aut(p), amb C0, ${f.name}: ${f.label}`);
    out.push(`  Els estrats, k: autònoms de n (programes), només els que en tenen: ${curve.map((s, k) => (s.x ? `${k}: ${s.x} de ${s.n}` : null)).filter(Boolean).join('; ') || 'cap'}`);
    const m = curve.findIndex((s) => s.x > 0);
    out.push(`  m_aut, el k més petit amb algun autònom: ${m < 0 ? 'cap' : `${m} (${cp(curve[m].x, curve[m].n)}); el de veritat pot ser més petit`}`);
    out.push(`  ρ_aut(p), amb l'interval de Fay i Feuer del 95 %: ${GRID.map((p) => { const r = rho(curve, p); return `${p === 10 / 256 ? '10/256' : p}: ${sci(r.value)} (de ${sci(r.ci[0])} a ${sci(r.ci[1])})`; }).join('; ')}`);
    let best = 0, bestP = null;
    for (let i = 1; i < 1000; i++) { const v = rho(curve, i / 1000).value; if (v > best) { best = v; bestP = i / 1000; } }
    if (bestP !== null) {
      const at = rho(curve, bestP), near = [];
      for (let i = 1; i < 1000; i++) if (rho(curve, i / 1000).ci[1] >= at.ci[0]) near.push(i / 1000);
      out.push(`  p*, la p amb la ρ_aut més alta (graella de 0,001; descriptiva): ${bestP}, ρ_aut = ${sci(at.value)} (de ${sci(at.ci[0])} a ${sci(at.ci[1])}); les p on la cota superior arriba a la inferior de p*: de ${near[0]} a ${near[near.length - 1]}`);
    } else out.push('  p*: cap estrat no té autònoms');
    for (const [p, dist, what] of [[0.5, 'd-mig', 'D½'], [10 / 256, 'uniforme', 'bytes uniformes']]) {
      const run = autonomy[dist].C0, N = run.start.level1.programs, x = count(run.reps, f), r = rho(curve, p);
      out.push(`  Comprovació, ${what}: ρ_aut = ${sci(r.value)} (de ${sci(r.ci[0])} a ${sci(r.ci[1])}), i al nivell 1, C0, a la §4, ${x} de ${N}: ${cp(x, N)}`);
    }
  }
  // 2. per grups de k
  out.push(`2. Els hereditaris dels estrats per grups de k, i quants passen cada xifra (${XIFRES.map((f) => f.name).join('; ')})`);
  for (const [a, b] of GROUPS) {
    let her = 0, programs = 0;
    const xs = XIFRES.map(() => 0);
    for (let k = a; k <= b; k++) { const t = tested[`estrat:${k}`]; her += t.length; programs += strata[`estrat:${k}`].n; XIFRES.forEach((f, i) => { xs[i] += count(t, f); }); }
    out.push(`  k de ${a} a ${b}: ${her} hereditaris de ${programs} programes; ${xs.map((x, i) => `${XIFRES[i].name}, ${x}`).join('; ')}`);
  }
  // 3. les sopes del pilot
  const main = Array.from({ length: 65 }, (_, k) => ({ n: strata[`estrat:${k}`].n, x: count(tested[`estrat:${k}`], XIFRES[0]) }));
  out.push(`3. Les sopes del pilot, amb C0: la part d'instruccions; els hereditaris i els autònoms (n ≥ 1), amb companys uniformes i amb companys sintetitzats a partir de l'histograma de la sopa (de ${strata[`sopa:${manifest[0].world}:uniforme`].n}); i ρ_aut a la mateixa part`);
  const sum = { u: 0, c: 0, au: 0, ac: 0, n: 0 };
  for (const w of manifest) {
    const u = tested[`sopa:${w.world}:uniforme`], c = tested[`sopa:${w.world}:programa`], n = strata[`sopa:${w.world}:uniforme`].n;
    const comp = readComposition(join(COMPOSITIONS, `${w.world}.json`)), p = comp.instructions / comp.bytes, d = rho(main, p);
    const au = count(u, XIFRES[0]), ac = count(c, XIFRES[0]);
    out.push(`  ${w.world}: p = ${p.toFixed(4)}; uniformes, ${u.length} hereditaris, ${au} autònoms, ${cp(au, n)}; de la sopa, ${c.length} hereditaris, ${ac} autònoms, ${cp(ac, n)}; ρ_aut, ${sci(d.value)} (de ${sci(d.ci[0])} a ${sci(d.ci[1])})`);
    sum.u += u.length; sum.c += c.length; sum.au += au; sum.ac += ac; sum.n += n;
  }
  out.push(`  Les ${manifest.length} sopes juntes: uniformes, ${sum.u} hereditaris, ${sum.au} autònoms, ${cp(sum.au, sum.n)}; de la sopa, ${sum.c} hereditaris, ${sum.ac} autònoms, ${cp(sum.ac, sum.n)}`);
  // 4. D½ amb companys de D½
  const dm = tested['d-mig:programa'], n4 = strata['d-mig:programa'].n, { same } = checkAgainstLevel1(tested, autonomy);
  out.push(`4. D½ amb companys de D½, els primers ${n4} programes del nivell 1, amb C0: ${dm.length} hereditaris; ${XIFRES.map((f) => `${f.name}, ${count(dm, f)}`).join('; ')}. Els ${same} que també ho eren al nivell 1 tenen les cadenes de la §4`);
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [dirStrata, dirTested, dirAutonomy] = process.argv.slice(2);
  if (!dirAutonomy || process.argv.length !== 5) { console.error('Ús: node eines/estrats-autonomia-analisi.mjs carpeta-estrats carpeta-autonomia-estrats carpeta-autonomia'); process.exit(2); }
  const s = readStrataFolder(dirStrata), a = readAutonomyFolder(dirAutonomy);
  const t = s.problems.length ? { tested: {}, problems: [] } : readStrataAutonomy(dirTested, s.runs);
  const problems = [...s.problems, ...a.problems, ...t.problems];
  if (!problems.length) problems.push(...checkAgainstLevel1(t.tested, a.runs).problems);
  if (problems.length) {
    console.log(`Els registres no són els del pla (${problems.length} problemes):\n${problems.slice(0, 20).map((p) => `  ${p}`).join('\n')}${problems.length > 20 ? `\n  i ${problems.length - 20} més` : ''}`);
    process.exit(1);
  }
  for (const l of analyse(s.runs, t.tested, a.runs)) console.log(l);
}
