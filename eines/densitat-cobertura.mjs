// La cobertura de l'interval del quocient de dues densitats del nivell 1 de B1 (docs/pla-b1.md, §6), amb recomptes sintètics.
// L'anàlisi (eines/densitat-analisi.mjs) en dona el de dos recomptes de Poisson independents (la binomial condicionada), i
// diu que, amb els mateixos programes a totes dues químiques, és conservador. L'auditor 2 ho demanava justificat
// (auditoria 25): aquí es mesura, amb la mateixa funció que l'anàlisi.
//
//   node eines/densitat-cobertura.mjs [--repeticions N]
//
// El model: els programes són rars i independents, i cadascun és hereditari a totes dues químiques (a), només a C0 (b) o només
// a la variant (c). Amb milions de programes, a, b i c són tres recomptes de Poisson independents. La variant en té a + c, i C0,
// a + b; el quocient de veritat és el de les esperances. El solapament és la part dels hereditaris de la química que en té
// menys que també ho són a l'altra: 0, independents; 1, tots. Per a cada escenari, la part de les repeticions en què l'interval
// del 95 % conté el quocient de veritat, i la seva amplada mediana (en logaritme). No posa a prova cap programa.
import { pathToFileURL } from 'url';
import { ratio } from './densitat-analisi.mjs';
import { makeRng } from '../fase1/soup.js';
import { COVERAGE_SEED } from './b1-llavors.mjs';

// la llavor de la simulació, declarada: la del mapa de B1 (eines/b1-llavors.mjs). Fins a la v0.5 del pla era la del nivell 1, 20261101,
// que ha de ser només la del càlcul (AUD-146)
const SEED = COVERAGE_SEED;

// Poisson(l) amb el mètode de Knuth, en trossos de 50 perquè exp(-l) no es perdi
function poissonSampler(u) {
  const small = (l) => { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= u(); } while (p > L); return k - 1; };
  return (l) => { let s = 0; while (l > 50) { s += small(50); l -= 50; } return s + small(l); };
}

// La cobertura d'un escenari: lambda0, els hereditaris esperats a C0; theta, el quocient (variant / C0); overlap, el solapament
export function coverage(lambda0, theta, overlap, reps, rng) {
  const pois = poissonSampler(rng), cache = new Map();
  const ci = (x, y) => { const k = `${x},${y}`; if (!cache.has(k)) cache.set(k, ratio(x, y).ci); return cache.get(k); };
  const lambda1 = theta * lambda0, both = overlap * Math.min(lambda0, lambda1);
  let hit = 0, total = 0;
  const widths = [];
  for (let i = 0; i < reps; i++) {
    const a = pois(both), b = pois(lambda0 - both), c = pois(lambda1 - both), x = a + c, y = a + b;
    if (x + y === 0) continue;
    const [lo, hi] = ci(x, y);
    total++;
    if (lo <= theta && theta <= hi) hit++;
    if (lo > 0 && hi < Infinity) widths.push(Math.log(hi / lo));
  }
  widths.sort((p, q) => p - q);
  return { coverage: hit / total, width: widths.length ? widths[widths.length >> 1] : null, reps: total };
}

function main(argv) {
  let reps = 20000;
  if (argv.length) {
    if (argv.length !== 2 || argv[0] !== '--repeticions' || !/^\d+$/.test(argv[1]) || Number(argv[1]) < 100) {
      console.error('Ús: node eines/densitat-cobertura.mjs [--repeticions N], amb N ≥ 100 (20.000 per defecte)');
      process.exit(2);
    }
    reps = Number(argv[1]);
  }
  const rng = makeRng(SEED, 'v2');
  console.log(`La cobertura de l'interval del quocient (variant / C0), del 95 % nominal, amb els mateixos programes: ${reps} repeticions per escenari, llavor ${SEED}`);
  console.log('C0 esperat | quocient | solapament | cobertura | amplada mediana (log)');
  let min = 1;
  for (const lambda0 of [30, 100]) for (const theta of [0.1, 0.5, 1, 2]) for (const overlap of [0, 0.5, 1]) {
    const r = coverage(lambda0, theta, overlap, reps, rng);
    min = Math.min(min, r.coverage);
    console.log(`${String(lambda0).padStart(10)} | ${String(theta).padStart(8)} | ${String(overlap).padStart(10)} | ${(100 * r.coverage).toFixed(2).padStart(7)} % | ${r.width === null ? '—' : r.width.toFixed(3)}`);
  }
  console.log(`La cobertura més baixa: ${(100 * min).toFixed(2)} %`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
