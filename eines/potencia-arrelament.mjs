// La precisió del contrast principal del pilot de l'aparició i l'arrelament (docs/pla-aparicio-arrelament.md, §6 i §8), simulada amb el
// món com a unitat. No simula cap món: sorteja quines sembres arrelen.
//
//   node eines/potencia-arrelament.mjs [--mons 60] [--posicions 4] [--simulacions 400] [--remostres 1000] [--llavor 20261118]
//
// El model: a cada món, per a cada variant informativa (G1, G1 × 9 i G4) i sopa, K sembres, cadascuna arrela amb probabilitat
// p = logistic(logit(p_v) + u + e), on u és l'efecte del món (normal, de desviació sigma, el mateix a totes dues sopes i a totes les
// variants del món) i e, el de cada sopa del món (normal, de desviació tau: la interacció entre el món i la sopa). A `continue`, la probabilitat és R vegades la de `reinit` (com a molt 1). Les p_v són les de la prova de viabilitat (les tres
// sopes juntes): G1 2 de 18, G1 × 9 7 de 18 i G4 4 de 18. El contrast és el de la §6: el quocient de Mantel i Haenszel estratificat per
// variant (amb el mateix nombre de sembres a cada estrat, la suma dels que arrelen a `continue` dividida per la de `reinit`), amb
// l'interval del 95 % del bootstrap per món. Per a cada sigma i cada R: la semiamplada mitjana de l'interval en logaritme (la regla de la
// v0.1 en demana com a molt log(1,6)/2 = 0,235), la probabilitat que l'interval no contingui 1, la que no contingui 1,6, i la cobertura
// del valor de debò.
import { makeRng } from '../fase1/soup.js';

const VARIANTS = [['G1', 2 / 18], ['G1 × 9', 7 / 18], ['G4', 4 / 18]];
const defaults = { mons: 60, posicions: 4, simulacions: 400, remostres: 1000, llavor: 20261118 };
const opts = { ...defaults };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 2) {
  const name = argv[i]?.replace(/^--/, '');
  if (!(name in defaults) || !/^\d+$/.test(argv[i + 1] ?? '')) { console.error(`Ús: node eines/potencia-arrelament.mjs ${Object.keys(defaults).map((k) => `[--${k} N]`).join(' ')}`); process.exit(2); }
  opts[name] = Number(argv[i + 1]);
}
const rng = makeRng(opts.llavor, 'v2');
const normal = () => { let u = 0; while (u === 0) u = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng()); };
const logit = (p) => Math.log(p / (1 - p));
const logistic = (x) => 1 / (1 + Math.exp(-x));
const binom = (n, p) => { let k = 0; for (let i = 0; i < n; i++) if (rng() < p) k++; return k; };

// Un pilot simulat: per món, [arrelen a continue, arrelen a reinit], sumats sobre les variants
function pilot(sigma, tau, R) {
  const worlds = [];
  for (let w = 0; w < opts.mons; w++) {
    const u = sigma * normal(), ec = tau * normal(), er = tau * normal();
    let a = 0, b = 0;
    for (const [, p] of VARIANTS) {
      a += binom(opts.posicions, Math.min(1, R * logistic(logit(p) + u + ec)));
      b += binom(opts.posicions, logistic(logit(p) + u + er));
    }
    worlds.push([a, b]);
  }
  return worlds;
}
// L'interval del bootstrap per món, en logaritme
function interval(worlds) {
  const est = [];
  for (let r = 0; r < opts.remostres; r++) {
    let a = 0, b = 0;
    for (let i = 0; i < worlds.length; i++) { const [x, y] = worlds[(rng() * worlds.length) | 0]; a += x; b += y; }
    est.push(Math.log((a + 0.5) / (b + 0.5)));
  }
  est.sort((x, y) => x - y);
  return [est[Math.floor(0.025 * est.length)], est[Math.floor(0.975 * est.length) - 1]];
}

console.log(`La precisió del contrast principal: ${opts.mons} mons, ${opts.posicions} posicions per variant i sopa, ${opts.simulacions} simulacions, ${opts.remostres} remostres, la llavor ${opts.llavor}`);
console.log(`Les variants: ${VARIANTS.map(([v, p]) => `${v} ${p.toFixed(2)}`).join(', ')}; la regla: semiamplada ≤ ${(Math.log(1.6) / 2).toFixed(3)}`);
console.log('\nLa cobertura és aproximada: amb tau o amb el sostre de probabilitat 1, el quocient de debò no és exactament R');
console.log('sigma  tau   R      semiamplada  exclou 1  exclou 1,6  cobertura');
for (const [sigma, tau] of [[0, 0], [0.5, 0], [1, 0], [0.5, 0.5], [1, 0.5], [1, 1]]) {
  for (const R of [1 / 1.6, 1, 1.6, 2.05]) {
    let half = 0, ex1 = 0, ex16 = 0, cover = 0;
    for (let s = 0; s < opts.simulacions; s++) {
      const [lo, hi] = interval(pilot(sigma, tau, R));
      half += (hi - lo) / 2;
      if (lo > 0 || hi < 0) ex1++;
      if (lo > Math.log(1.6) || hi < Math.log(1.6)) ex16++;
      if (lo <= Math.log(R) && Math.log(R) <= hi) cover++;
    }
    const n = opts.simulacions;
    console.log(`${sigma.toFixed(1).padEnd(6)} ${tau.toFixed(1).padEnd(5)} ${R.toFixed(2).padEnd(6)} ${(half / n).toFixed(3).padEnd(12)} ${(ex1 / n).toFixed(2).padEnd(9)} ${(ex16 / n).toFixed(2).padEnd(11)} ${(cover / n).toFixed(2)}`);
  }
}
