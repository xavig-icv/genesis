// Calibratge de la sèrie de B2 abans del preregistre (protocol §6 i §8; AUD-84, AU2-58, AU2-61): la cobertura dels
// intervals de S(H) i la potència de la prova del canvi de règim, amb mons sintètics. Fa servir les mateixes
// funcions que el programa de la sèrie (fase2/b2-serie.mjs).
//
//   node eines/b2-cobertura.mjs [--sims N] [--reps B] [--risc-origen h] [--rr r1,r2,...] [--icc rho]
//
// El model: cada món té un risc de pèrdua per cens (cada 250 èpoques), h_i ~ Beta amb mitjana h (--risc-origen) i
// una correlació intraclasse rho entre les branques del món. A la condició de canvi, el risc és h_i × RR. Cada
// branca és independent donat el risc del seu món: T és el primer cens amb pèrdua, i es detecta fins a H − 250.
// Per defecte, h surt de l'exploració (1 pèrdua en 29 branques d'origen en 7 censos detectables) i el RR de les
// branques de canvi (5 en 29) és d'uns 5. Sota H0, RR = 1.
import { fileURLToPath } from 'url';
import { survival, interval, regimeDiffs, signTest } from '../fase2/b2-serie.mjs';
import { makeRng } from '../fase1/soup.js';

// Beta(a, b) amb el mètode de dues gammes (Marsaglia–Tsang)
function gammaSampler(u) {
  const normal = () => { const a = u() || 1e-12, b = u(); return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b); };
  const gamma = (k) => {
    if (k < 1) return gamma(k + 1) * u() ** (1 / k);
    const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
    for (;;) {
      let x, v; do { x = normal(); v = 1 + c * x; } while (v <= 0);
      v = v ** 3; const q = u();
      if (q < 1 - 0.0331 * x ** 4 || Math.log(q) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
  };
  return (a, b) => { const x = gamma(a), y = gamma(b); return x / (x + y); };
}

// Una sèrie sintètica: 12 mons A i 17 B, amb K branques per condició, horitzons H (origen) i Hs (canvi)
export function syntheticSeries(u, { h, rr, rho, K = 2, Ks = 2, H = 5000, Hs = 5000, every = 250 }) {
  const beta = gammaSampler(u);
  const s = (1 - rho) / rho;                           // la Beta amb mitjana h i correlació intraclasse rho
  const branch = (hz, Hb) => {
    const steps = Hb / every;
    for (let j = 1; j <= steps - 1; j++) if (u() < hz) return { event: true, T: j * every, H: Hb };
    return { event: false, T: Hb, H: Hb };
  };
  return Array.from({ length: 29 }, (_, i) => {
    const hi = rho > 0 ? beta(h * s, (1 - h) * s) : h;
    return {
      id: `w${i}`, group: i < 12 ? 'A' : 'B',
      origen: Array.from({ length: K }, () => branch(hi, H)),
      canvi: Array.from({ length: Ks }, () => branch(Math.min(1, hi * rr), Hs)),
    };
  });
}

// La S(H) veritable del model: la mitjana de (1 − h_i)^(passos detectables), estimada per Monte Carlo
function trueSurvival(u, { h, rho, H, every = 250 }) {
  const beta = gammaSampler(u), s = (1 - rho) / rho, n = 200000, steps = H / every - 1;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += (1 - (rho > 0 ? beta(h * s, (1 - h) * s) : h)) ** steps;
  return sum / n;
}

export function calibrate({ sims = 400, reps = 1000, h = 1 / 29 / 7, rrs = [1, 2, 3, 5], rho = 0.3, seed = 20261024 } = {}) {
  const u = makeRng(seed, 'v2');
  const lines = [];
  // 1. La cobertura de S_orig(H), amb el disseny (i) i tres riscos
  lines.push(`Cobertura de l'interval del 95 % de S_orig(H), disseny (i) (H = 5.000, K = 2), rho = ${rho}, ${sims} simulacions:`);
  for (const hh of [h, 2 * h, 4 * h]) {
    const truth = trueSurvival(u, { h: hh, rho, H: 5000 });
    const hits = { percentil: 0, bca: 0, logit: 0 };
    for (let k = 0; k < sims; k++) {
      const worlds = syntheticSeries(u, { h: hh, rr: 1, rho, K: 2, Ks: 2, H: 5000, Hs: 5000 });
      for (const method of Object.keys(hits)) {
        const r = interval(worlds, (ws) => survival(ws, 'origen'), { reps, seed: k + 1, method });
        if (r.lo <= truth && truth <= r.hi) hits[method]++;
      }
    }
    lines.push(`  risc per cens ${hh.toFixed(4)} (S veritable ${truth.toFixed(3)}): ${Object.entries(hits).map(([m, n]) => `${m} ${(100 * n / sims).toFixed(1)} %`).join(', ')}`);
  }
  // 2. La potència de la prova del canvi de règim, unilateral amb α = 0,025, als dos dissenys
  const designs = {
    i: { K: 2, Ks: 2, H: 5000, Hs: 5000, test: { horizon: 5000, seedsOrigin: [0, 1], seedsSwitch: [0, 1] } },
    ii: { K: 2, Ks: 1, H: 6000, Hs: 4000, test: { horizon: 4000, seedsOrigin: [0], seedsSwitch: [0] } },
  };
  lines.push('', `La prova del canvi de règim (signes, unilateral, α = 0,025), risc d'origen ${h.toFixed(4)} per cens, rho = ${rho}:`);
  for (const [name, D] of Object.entries(designs)) {
    const row = rrs.map((rr) => {
      let rej = 0;
      for (let k = 0; k < sims; k++) {
        const worlds = syntheticSeries(u, { h, rr, rho, ...D });
        if (signTest(regimeDiffs(worlds, D.test), 'unilateral').p < 0.025) rej++;
      }
      return `RR ${rr}: ${(100 * rej / sims).toFixed(1)} %`;
    });
    lines.push(`  disseny (${name}): ${row.join(', ')}  (RR 1 = la taxa de falsos positius)`);
  }
  return lines;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const opt = (name, def) => { const i = args.indexOf(name); return i < 0 ? def : args[i + 1]; };
  const lines = calibrate({
    sims: Number(opt('--sims', 400)), reps: Number(opt('--reps', 1000)), h: Number(opt('--risc-origen', 1 / 29 / 7)),
    rrs: opt('--rr', '1,2,3,5').split(',').map(Number), rho: Number(opt('--icc', 0.3)),
  });
  for (const l of lines) console.log(l);
}
