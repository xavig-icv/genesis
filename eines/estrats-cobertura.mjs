// La cobertura de l'interval de la corba ρ(p) de la §13 de B1 (docs/pla-b1.md), amb recomptes sintètics: no posa a prova cap
// programa. L'anàlisi (eines/estrats-analisi.mjs) en dona l'interval de Fay i Feuer (1997), amb els pesos C(64, k) pᵏ (1 − p)⁶⁴⁻ᵏ / nₖ
// i les N del pla. Aquí es mesura amb la mateixa funció: per a cada escenari (uns rₖ de veritat) i cada p, la part de les repeticions
// en què l'interval del 95 % conté la ρ(p) de veritat. Els recomptes dels estrats són de Poisson independents, amb esperança nₖ rₖ.
//
//   node eines/estrats-cobertura.mjs [--repeticions N]
import { pathToFileURL } from 'url';
import { makeRng } from '../fase1/soup.js';
import { STRATA_COVERAGE_SEED, strataSize } from './b1-llavors.mjs';
import { rho, binomialWeight } from './estrats-analisi.mjs';
import { parseOptions } from './b1-comu.mjs';

// Els escenaris: rₖ per a k de 0 a 64. No són prediccions: cobreixen formes possibles, amb pocs i amb molts hereditaris
export const SCENARIOS = Object.freeze({
  'un bony a k = 32, com D½ (1,6·10⁻⁴)': (k) => (k < 6 ? 0 : 2.4e-4 * Math.exp(-(((k - 32) / 14) ** 2))),
  'el mateix bony, deu vegades més petit': (k) => (k < 6 ? 0 : 2.4e-5 * Math.exp(-(((k - 32) / 14) ** 2))),
  'pla i baix, 10⁻⁶ des de k = 3': (k) => (k < 3 ? 0 : 1e-6),
  'creixent, 10⁻⁶ · (k / 10)³': (k) => 1e-6 * (k / 10) ** 3,
});
export const PS = [10 / 256, 0.1, 0.25, 0.5, 0.75];

function poissonSampler(u) {
  const small = (l) => { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= u(); } while (p > L); return k - 1; };
  return (l) => { let s = 0; while (l > 50) { s += small(50); l -= 50; } return s + small(l); };
}
export function coverage(r, reps, rng) {
  const pois = poissonSampler(rng), n = Array.from({ length: 65 }, (_, k) => strataSize(k));
  const truth = PS.map((p) => n.reduce((s, _, k) => s + binomialWeight(k, p) * r(k), 0));
  const hits = PS.map(() => 0);
  for (let i = 0; i < reps; i++) {
    const strata = n.map((nk, k) => ({ n: nk, x: pois(nk * r(k)) }));
    PS.forEach((p, j) => { const { ci } = rho(strata, p); if (ci[0] <= truth[j] && truth[j] <= ci[1]) hits[j]++; });
  }
  return PS.map((p, j) => ({ p, truth: truth[j], coverage: hits[j] / reps }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const opts = parseOptions(process.argv.slice(2), { repeticions: { type: 'int', min: 10, max: 1e6, default: 2000 } },
    'Ús: node eines/estrats-cobertura.mjs [--repeticions N]');
  const rng = makeRng(STRATA_COVERAGE_SEED, 'v2');
  console.log(`La cobertura de l'interval de Fay i Feuer del 95 % de ρ(p), ${opts.repeticions} repeticions per escenari (la llavor ${STRATA_COVERAGE_SEED})`);
  for (const [name, r] of Object.entries(SCENARIOS)) {
    console.log(`  ${name}: ${coverage(r, opts.repeticions, rng).map((c) => `p = ${c.p === 10 / 256 ? '10/256' : c.p}, ρ = ${c.truth.toExponential(2)}, ${(100 * c.coverage).toFixed(1)} %`).join('; ')}`);
  }
}
