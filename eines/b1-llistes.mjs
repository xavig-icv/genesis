// Les llistes d'ordres dels càlculs de B1 que venen després del nivell 1 (docs/pla-b1.md, §11), fetes a partir del pla i del mapa de
// llavors (eines/b1-llavors.mjs). Les de git (fase2/resultats/b1/*/llista.txt, i fase2/resultats/b1/estrats/llista-autonomia.txt) han
// de ser exactament les que en surten (test/b1-estrats.mjs ho comprova), i les executa eines/executa-b1.sh.
//
//   node eines/b1-llistes.mjs autonomia|caps|estrats|estrats-autonomia
//
// estrats-autonomia (AUD-175, auditoria 28): la prova d'autonomia dels hereditaris de cada tirada de la §13, amb les condicions de la
// §4, una ordre per registre de la llista estrats. Va després d'aquella llista: llegeix els seus registres.
import { pathToFileURL } from 'url';
import { AUTONOMY, LEVEL1 } from './b1-llavors.mjs';
import { planRuns, D_MIG_PROGRAMS } from './estrats-analisi.mjs';
import { PLAN as AUTONOMY_PLAN } from './autonomia-analisi.mjs';
import { PLAN as HEADS_PLAN } from './caps-analisi.mjs';

export const THREADS = 8;
const dir = (what) => `fase2/resultats/b1/${what}/registres`;
export const STRATA_AUTONOMY_DIR = 'fase2/resultats/b1/estrats/autonomia';
// on és cada llista, a git
export const LIST_FILES = Object.freeze({
  autonomia: 'fase2/resultats/b1/autonomia/llista.txt',
  caps: 'fase2/resultats/b1/caps/llista.txt',
  estrats: 'fase2/resultats/b1/estrats/llista.txt',
  'estrats-autonomia': 'fase2/resultats/b1/estrats/llista-autonomia.txt',
});

export function lists() {
  const autonomia = Object.entries(AUTONOMY_PLAN.runs).flatMap(([dist, chems]) => chems.map((c) =>
    `node eines/autonomia.mjs --quimica ${c} --distribucio ${dist} --llavor ${AUTONOMY.from} --condicions ${AUTONOMY_PLAN.conditions} --fils ${THREADS} --json ${dir('autonomia')}/${dist}-${c}.jsonl`));
  // les variants per cap, i C0 i S1 de nou: les ordres del nivell 1 (fase2/resultats/b1/nivell1/llista.txt), amb una altra carpeta
  const caps = HEADS_PLAN.distributions['d-mig'].chemistries.map((c) =>
    `node eines/densitat.mjs --quimica ${c} --distribucio d-mig --llavor ${LEVEL1.from} --programes 10000000 --tros 100000 --fils ${THREADS} --json ${dir('caps')}/d-mig-${c}.jsonl`);
  const names = planRuns().map((p) => (p.k !== undefined ? `estrat-${String(p.k).padStart(2, '0')}` : p.world ? `sopa-${p.world}-${p.partner}` : `d-mig-${p.partner}`));
  const estrats = planRuns().map((p, i) =>
    `node eines/estrats.mjs --programa ${p.program} --company ${p.partner} --llavor ${p.seed} --programes ${p.programs} --tros 100000 --fils ${THREADS} --json ${dir('estrats')}/${names[i]}.jsonl`);
  if (estrats.length !== 110 || !estrats.some((l) => l.includes(`--programes ${D_MIG_PROGRAMS}`))) throw new Error('la llista de la §13 no és la del pla');
  const estratsAutonomia = names.map((name) =>
    `node eines/autonomia.mjs --registre ${dir('estrats')}/${name}.jsonl --llavor ${AUTONOMY.from} --condicions ${AUTONOMY_PLAN.conditions} --fils ${THREADS} --json ${STRATA_AUTONOMY_DIR}/${name}.jsonl`);
  return { autonomia, caps, estrats, 'estrats-autonomia': estratsAutonomia };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const what = process.argv[2], all = lists();
  if (process.argv.length !== 3 || !all[what]) { console.error('Ús: node eines/b1-llistes.mjs autonomia|caps|estrats|estrats-autonomia'); process.exit(2); }
  process.stdout.write(all[what].join('\n') + '\n');
}
