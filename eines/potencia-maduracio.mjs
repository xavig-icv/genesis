// La potència orientativa de la sèrie de la maduració (docs/pilot-maduracio.md, §3): el contrast continue contra
// shuffle-all, amb el món com a unitat (AUD-113). A cada món i braç hi ha K branques. La puntuació del món és la
// diferència del nombre d'establiments entre els dos braços, i la prova és la de signes exacta, unilateral, sobre els
// mons amb diferència. Les K branques d'un braç poden estar correlacionades: amb probabilitat rho són idèntiques (la
// mateixa sort), i si no, independents; la correlació entre dues branques és rho. Els braços són independents entre
// ells, perquè les trajectòries de la BFF divergeixen.
//
//   node eines/potencia-maduracio.mjs [--continue 0.22] [--shuffle 0.11,0.15] [--k 2] [--mons 40,80,120,160,240]
//                                     [--rho 0] [--alfa 0.025] [--sims 4000] [--seed 20261025]
import { fileURLToPath } from 'url';
import { makeRng } from '../fase1/soup.js';

// el nombre mínim d'èxits per rebutjar, amb n mons amb diferència i la prova de signes unilateral
export function critical(n, alpha) {
  let tail = 0, c = 1; // c = C(n, k), de k = n cap avall
  const p = [];
  for (let k = 0; k <= n; k++) { p.push(c); c = (c * (n - k)) / (k + 1); }
  const total = 2 ** n;
  for (let k = n; k >= 0; k--) { if ((tail + p[k]) / total > alpha) return k + 1; tail += p[k]; }
  return 0;
}

export function power({ pc, ps, k = 2, worlds, rho = 0, alpha = 0.025, sims = 4000, seed = 20261025 }) {
  const rng = makeRng(seed, 'v2');
  const arm = (p) => {
    if (rng() < rho) { const z = rng() < p; return z ? k : 0; }
    let s = 0; for (let j = 0; j < k; j++) if (rng() < p) s++; return s;
  };
  let hits = 0;
  const crit = new Map();
  for (let it = 0; it < sims; it++) {
    let pos = 0, neg = 0;
    for (let w = 0; w < worlds; w++) { const a = arm(pc), b = arm(ps); if (a > b) pos++; else if (b > a) neg++; }
    const n = pos + neg;
    if (!crit.has(n)) crit.set(n, critical(n, alpha));
    if (n && pos >= crit.get(n)) hits++;
  }
  return hits / sims;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : def; };
  const pc = Number(arg('continue', '0.22')), shuffles = arg('shuffle', '0.11,0.15').split(',').map(Number);
  const k = Number(arg('k', '2')), worldsList = arg('mons', '40,80,120,160,240').split(',').map(Number);
  const rho = Number(arg('rho', '0')), alpha = Number(arg('alfa', '0.025')), sims = Number(arg('sims', '4000')), seed = Number(arg('seed', '20261025'));
  console.log(`la potència, amb el món com a unitat: K = ${k}, rho = ${rho}, α = ${alpha} unilateral, ${sims} repeticions, llavor ${seed}`);
  for (const ps of shuffles) {
    console.log(`continue ${pc * 100} %, shuffle-all ${ps * 100} %: ` + worldsList.map((n) => `${n} mons ${Math.round(100 * power({ pc, ps, k, worlds: n, rho, alpha, sims, seed }))} %`).join(' · '));
  }
}
