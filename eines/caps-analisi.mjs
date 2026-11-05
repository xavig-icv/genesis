// L'anàlisi de les variants per cap d'S1 (docs/pla-b1.md, §14), escrita abans de calcular res. Exploratòria.
//
//   node eines/caps-analisi.mjs carpeta
//
// La carpeta té els quatre registres d'eines/densitat.mjs de la §14, amb D½, la llavor del nivell 1 i els seus 10⁷ programes: C0,
// S1, S1h0 i S1h1. Es validen com els del nivell 1 (eines/densitat-analisi.mjs, readFolder), amb aquest pla: el mateix commit, sense
// canvis, i els mòduls d'aquesta còpia. C0 i S1 tornen a fer els registres del nivell 1 amb el codi nou: n'han de tenir els
// mateixos resultats, l'empremta i els totals de la línia final de l'extracte (fase2/resultats/b1/nivell1/hereditaris.jsonl.gz). Si
// no, el codi nou no fa el mateix que el del nivell 1, i no s'analitza res.
//
// Tot és descriptiu, com al nivell 1: per a cada química, la densitat de replicadors hereditaris amb el seu interval de
// Clopper-Pearson; contra S1 i contra C0, programa a programa, la taula de 2 × 2 i el quocient de les densitats, amb l'interval de
// la binomial condicionada.
import { pathToFileURL } from 'url';
import { readFolder, clopperPearson, ratio } from './densitat-analisi.mjs';
import { NOISE } from './densitat.mjs';
import { readExtract, extractRecord } from './b1-comu.mjs';

export const PLAN = Object.freeze({
  seed: 20261101,
  noise: NOISE,
  distributions: { 'd-mig': { chemistries: ['C0', 'S1', 'S1h0', 'S1h1'], sizes: [1e7] } },
});
const TOTALS = ['tested', 'replicates', 'heritable', 'heritableSolo', 'heritableContext', 'fingerprint'];

// La validació: la del nivell 1 amb aquest pla, i C0 i S1 iguals als del nivell 1 (reference dona la línia final del registre del
// nivell 1 d'una química; les proves hi posen la seva). Retorna { groups, problems }
export function readHeads(dir, { plan = PLAN, reference = null, ...opts } = {}) {
  const { groups, problems } = readFolder(dir, { plan, ...opts });
  if (problems.length) return { groups, problems };
  const extract = reference ? null : readExtract(), endOf = reference ?? ((chem) => extractRecord(extract, chem, 'd-mig').end);
  for (const chem of ['C0', 'S1']) {
    const old = endOf(chem), g = groups['d-mig'][chem];
    // el registre nou és un sol fitxer, de 0 a 10⁷, amb els trossos del nivell 1: la línia final ha de ser la mateixa
    const end = g.ends.length === 1 ? g.ends[0] : null;
    const diff = end ? TOTALS.filter((k) => end[k] !== old[k]) : ['un sol fitxer'];
    if (diff.length) problems.push(`${chem}: no fa el mateix que al nivell 1 (${diff.join(', ')})`);
  }
  return { groups, problems };
}

const fmt = (x) => (x === null ? '—' : x === Infinity ? '∞' : x.toFixed(2));
const sci = (x) => (x === 0 ? '0' : x.toExponential(2).replace('e', '·10^').replace('+', ''));
export function analyse(groups) {
  const g = groups['d-mig'], her = (c) => g[c].found.filter((o) => o.heritableSolo || o.heritableContext), out = [];
  out.push(`Les variants per cap d'S1 (exploratori): d-mig, ${g.C0.n} programes, els del nivell 1. C0 i S1, iguals als del nivell 1`);
  for (const chem of PLAN.distributions['d-mig'].chemistries) {
    const h = her(chem), k = h.length, [lo, hi] = clopperPearson(k, g[chem].n), solo = h.filter((o) => o.heritableSolo).length;
    out.push(`  ${chem}: ${k} hereditaris (${sci(k / g[chem].n)}; IC del 95 %, de ${sci(lo)} a ${sci(hi)}); sols ${solo}, només en context ${k - solo}`);
  }
  for (const [base, variants] of [['S1', ['S1h0', 'S1h1']], ['C0', ['S1', 'S1h0', 'S1h1']]]) {
    const b = new Set(her(base).map((o) => o.index));
    out.push(`  Contra ${base}, programa a programa (els hereditaris a totes dues, només a ${base}, només a la variant; el quocient de densitats i el seu interval):`);
    for (const chem of variants) {
      const x = new Set(her(chem).map((o) => o.index)), both = [...x].filter((i) => b.has(i)).length, r = ratio(x.size, b.size);
      out.push(`    ${chem}: ${both}, ${b.size - both}, ${x.size - both}; quocient ${fmt(r.value)} (de ${fmt(r.ci[0])} a ${fmt(r.ci[1])})`);
    }
  }
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.argv[2];
  if (!dir || process.argv.length !== 3) { console.error('Ús: node eines/caps-analisi.mjs carpeta'); process.exit(2); }
  const { groups, problems } = readHeads(dir);
  if (problems.length) {
    console.log(`Els registres no són els del pla (${problems.length} problemes):\n${problems.slice(0, 20).map((p) => `  ${p}`).join('\n')}${problems.length > 20 ? `\n  i ${problems.length - 20} més` : ''}`);
    process.exit(1);
  }
  for (const l of analyse(groups)) console.log(l);
}
