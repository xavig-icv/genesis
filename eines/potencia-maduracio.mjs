// La potència orientativa de la sèrie de la maduració (docs/pilot-maduracio.md, §3, i docs/protocol-maduracio.md, §6):
// amb el món com a unitat (AUD-113). A cada món i braç hi ha K branques. La puntuació del món és la diferència del
// nombre d'establiments entre els dos braços. Les K branques d'un braç poden estar correlacionades: amb probabilitat rho
// són idèntiques (la mateixa sort), i si no, independents; la correlació entre dues branques és rho. Els braços són
// independents entre ells, perquè les trajectòries de la BFF divergeixen (al pilot, les llavors comunes no hi creen cap
// correlació, auditoria 19).
//
// Tres modes:
//   - un contrast (continue contra shuffle-all, el del pilot), amb la prova de signes exacta, unilateral, sobre els mons
//     amb diferència, o amb la permutació de signes (--prova permutacio):
//       node eines/potencia-maduracio.mjs [--continue 0.22] [--shuffle 0.11,0.15] [--k 2] [--mons 40,80,120,160,240]
//                                         [--rho 0] [--alfa 0.025] [--sims 4000] [--seed 20261025] [--prova signes]
//   - la família de la sèrie (§6): continue i shuffle-all contra reinit, amb Holm i α per a la família. Dona la potència
//     de (b) i de (c), la de rebutjar-les totes dues i la de rebutjar-ne almenys una. La prova de la sèrie és la permutació
//     de signes amb els llindars calibrats per m (--prova calibrada, la de per defecte; fase2/maduracio-llindars.json,
//     AUD-128 i AU2-94), amb K = 2 i fins a 150 mons:
//       node eines/potencia-maduracio.mjs --familia [--continue 0.27] [--shuffle 0.27] [--reinit 0.135,0.18] [--k 2]
//                                         [--mons 150] [--rho 0.03] [--alfa 0.025] [--prova calibrada|permutacio|signes] ...
//   - la validesa (§6): dos braços amb el mateix ritme i una concordança diferent; quantes vegades cada prova dona el
//     primer per més alt, que hauria de ser com a molt α (la calibrada, amb K = 2 i α de 0,0125 o 0,025):
//       node eines/potencia-maduracio.mjs --validesa [--ritme 0.2] [--rho 0,0.4] [--k 2] [--mons 150] [--alfa 0.0125] ...
import { fileURLToPath } from 'url';
import { makeRng } from '../fase1/soup.js';
import { readTable, ruleCriticals, tableK, STEPS } from './llindars-maduracio.mjs';

// el nombre mínim d'èxits per rebutjar, amb n mons amb diferència i la prova de signes unilateral
export function critical(n, alpha) {
  let tail = 0, c = 1; // c = C(n, k), de k = n cap avall
  const p = [];
  for (let k = 0; k <= n; k++) { p.push(c); c = (c * (n - k)) / (k + 1); }
  const total = 2 ** n;
  for (let k = n; k >= 0; k--) { if ((tail + p[k]) / total > alpha) return k + 1; tail += p[k]; }
  return 0;
}

// Les probabilitats de Bin(m, 1/2)
const halfBinomial = (m) => { const b = [2 ** -m]; for (let j = 0; j < m; j++) b.push((b[j] * (m - j)) / (j + 1)); return b; };
// La prova de signes exacta, unilateral: P(Bin(pos + neg, 1/2) ≥ pos)
export function signP(diffs) {
  const pos = diffs.filter((d) => d > 0).length, n = pos + diffs.filter((d) => d < 0).length;
  if (!n) return 1;
  const b = halfBinomial(n);
  let s = 0;
  for (let k = pos; k <= n; k++) s += b[k];
  return Math.min(1, s);
}
// La permutació de signes, unilateral, amb coma flotant i una memòria de les distribucions, per a la simulació. La de la
// decisió, amb enters exactes, és a fase2/maduracio-serie.mjs (signFlipTest), i test/maduracio-serie.mjs comprova que
// totes dues coincideixen
export function signFlipP(diffs, cache = new Map()) {
  const counts = [];
  let sum = 0;
  for (const d of diffs) { sum += d; if (d) counts[Math.abs(d)] = (counts[Math.abs(d)] ?? 0) + 1; }
  const key = counts.join(',');
  let tail = cache.get(key);
  if (!tail) {
    let tot = 0;
    counts.forEach((m, v) => { if (m) tot += v * m; });
    let dist = new Float64Array(2 * tot + 1);
    dist[tot] = 1;
    counts.forEach((m, v) => {
      if (!m) return;
      const b = halfBinomial(m), next = new Float64Array(2 * tot + 1);
      for (let i = 0; i < dist.length; i++) if (dist[i]) for (let j = 0; j <= m; j++) next[i + v * (2 * j - m)] += dist[i] * b[j];
      dist = next;
    });
    for (let i = dist.length - 2; i >= 0; i--) dist[i] += dist[i + 1]; // la cua, P(S ≥ i − tot)
    tail = { dist, tot };
    cache.set(key, tail);
  }
  const i = sum + tail.tot;
  return i < 0 ? 1 : i >= tail.dist.length ? 0 : Math.min(1, tail.dist[i]);
}
const pValue = (test, cache) => (test === 'permutacio' ? (d) => signFlipP(d, cache) : signP);

// Les K branques d'un braç: amb probabilitat rho, totes fan el mateix; si no, independents
const armDraw = (rng, p, k, rho) => {
  if (rng() < rho) { const z = rng() < p; return z ? k : 0; }
  let s = 0; for (let j = 0; j < k; j++) if (rng() < p) s++; return s;
};

export function power({ pc, ps, k = 2, worlds, rho = 0, alpha = 0.025, sims = 4000, seed = 20261025, test = 'signes' }) {
  const rng = makeRng(seed, 'v2');
  const arm = (p) => armDraw(rng, p, k, rho);
  let hits = 0;
  const crit = new Map(), cache = new Map();
  for (let it = 0; it < sims; it++) {
    if (test === 'permutacio') {
      const d = Array.from({ length: worlds }, () => arm(pc) - arm(ps));
      if (signFlipP(d, cache) <= alpha) hits++;
      continue;
    }
    let pos = 0, neg = 0;
    for (let w = 0; w < worlds; w++) { const a = arm(pc), b = arm(ps); if (a > b) pos++; else if (b > a) neg++; }
    const n = pos + neg;
    if (!crit.has(n)) crit.set(n, critical(n, alpha));
    if (n && pos >= crit.get(n)) hits++;
  }
  return hits / sims;
}

// Els llindars calibrats (fase2/maduracio-llindars.json), com a t crítics de cada m i m1, per als dos passos de Holm. Amb
// K = 2, la prova només depèn de m1 i m2 (els mons amb |D| = 1 i 2) i de T = x + 2y (els positius de cada grup)
const calibratedCache = new Map();
export function calibratedCriticals(worlds) {
  if (!calibratedCache.has(worlds)) { const t = readTable(); calibratedCache.set(worlds, ruleCriticals([tableK(t, 0), tableK(t, 1)], worlds)); }
  return calibratedCache.get(worlds);
}
const stats = (d) => {
  let m1 = 0, m2 = 0, T = 0;
  for (const v of d) { if (v === 1 || v === -1) { m1++; if (v > 0) T++; } else if (v === 2 || v === -2) { m2++; if (v > 0) T += 2; } else if (v) throw new Error('la prova calibrada és per a K = 2'); }
  return { m: m1 + m2, m1, T };
};
const rejects = (crits, st) => crits[st.m] !== null && st.T >= crits[st.m][st.m1];

// Holm amb dues proves: la p més petita amb α / 2 i, si es rebutja, l'altra amb α
const holm2 = (p1, p2, alpha) => {
  const [lo, hi] = p1 <= p2 ? [p1, p2] : [p2, p1];
  if (lo > alpha / 2) return [false, false];
  return p1 <= p2 ? [true, hi <= alpha] : [hi <= alpha, true];
};
// La família de la sèrie: (b) continue contra reinit i (c) shuffle-all contra reinit, als mateixos mons (comparteixen
// reinit). Retorna la potència de (b) i de (c) amb Holm, la de totes dues i la d'almenys una
export function familyPower({ pc, ps, pr, k = 2, worlds, rho = 0, alpha = 0.025, sims = 4000, seed = 20261028, test = 'calibrada' }) {
  if (test === 'calibrada' && (k !== 2 || alpha !== 0.025)) throw new Error('la prova calibrada és per a K = 2 i α = 0,025');
  const rng = makeRng(seed, 'v2'), P = test === 'calibrada' ? null : pValue(test, new Map()), crits = test === 'calibrada' ? calibratedCriticals(worlds) : null;
  const out = { b: 0, c: 0, both: 0, any: 0 };
  for (let it = 0; it < sims; it++) {
    const db = [], dc = [];
    for (let w = 0; w < worlds; w++) { const c = armDraw(rng, pc, k, rho), s = armDraw(rng, ps, k, rho), r = armDraw(rng, pr, k, rho); db.push(c - r); dc.push(s - r); }
    let rb, rc;
    if (crits) {
      // Holm amb els llindars calibrats: el primer pas, i el segon si l'altra es rebutja al primer
      const sb = stats(db), sc = stats(dc), b1 = rejects(crits[0], sb), c1 = rejects(crits[0], sc);
      rb = b1 || (c1 && rejects(crits[1], sb)); rc = c1 || (b1 && rejects(crits[1], sc));
    } else [rb, rc] = holm2(P(db), P(dc), alpha);
    if (rb) out.b++; if (rc) out.c++; if (rb && rc) out.both++; if (rb || rc) out.any++;
  }
  for (const key of Object.keys(out)) out[key] /= sims;
  return out;
}

// La validesa: dos braços amb el mateix ritme p i concordances rhoA i rhoB. Retorna, per a cada prova, la proporció de
// sèries en què dona el primer braç per més alt amb α
export function validity({ p, k = 2, worlds, rhoA, rhoB, alpha = 0.0125, sims = 20000, seed = 20261027 }) {
  const rng = makeRng(seed, 'v2'), cache = new Map();
  // la calibrada, amb el pas de Holm d'aquesta α
  const step = k === 2 ? STEPS.findIndex(([num, den]) => num / den === alpha) : -1, crits = step >= 0 ? calibratedCriticals(worlds)[step] : null;
  const out = { signes: 0, permutacio: 0, ...(crits ? { calibrada: 0 } : {}) };
  for (let it = 0; it < sims; it++) {
    const d = Array.from({ length: worlds }, () => armDraw(rng, p, k, rhoA) - armDraw(rng, p, k, rhoB));
    if (signP(d) <= alpha) out.signes++;
    if (signFlipP(d, cache) <= alpha) out.permutacio++;
    if (crits && rejects(crits, stats(d))) out.calibrada++;
  }
  for (const key of Object.keys(out)) out[key] /= sims;
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const argv = process.argv.slice(2), modes = ['--familia', '--validesa'].filter((m) => argv.includes(m));
  if (modes.length > 1) { console.error('Ús: --familia i --validesa no van junts'); process.exit(2); }
  const mode = modes[0] ?? null;
  const arg = (name, def) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : def; };
  const list = (s) => s.split(',').map(Number);
  const test = arg('prova', mode === '--familia' ? 'calibrada' : 'signes');
  if (!['signes', 'permutacio', ...(mode === '--familia' ? ['calibrada'] : [])].includes(test)) { console.error(`Ús: --prova ${mode === '--familia' ? 'calibrada|' : ''}signes|permutacio`); process.exit(2); }
  const k = Number(arg('k', '2')), sims = Number(arg('sims', mode === '--validesa' ? '20000' : '4000'));
  const pct = (x) => `${Math.round(100 * x)} %`;
  if (mode === '--familia') {
    const pc = Number(arg('continue', '0.27')), ps = Number(arg('shuffle', String(pc))), reinits = list(arg('reinit', '0.135,0.18'));
    const worldsList = list(arg('mons', '150')), rho = Number(arg('rho', '0.03')), alpha = Number(arg('alfa', '0.025')), seed = Number(arg('seed', '20261028'));
    console.log(`la família de la sèrie, amb el món com a unitat: (b) continue contra reinit i (c) shuffle-all contra reinit, Holm amb α = ${alpha}; ` +
      `la prova de ${test === 'calibrada' ? 'permutació de signes, amb els llindars calibrats' : test === 'permutacio' ? 'permutació de signes' : 'signes'}; K = ${k}, rho = ${rho}, ${sims} repeticions, llavor ${seed}`);
    for (const pr of reinits) {
      console.log(`continue ${pc * 100} %, shuffle-all ${ps * 100} %, reinit ${pr * 100} %:`);
      for (const worlds of worldsList) {
        const r = familyPower({ pc, ps, pr, k, worlds, rho, alpha, sims, seed, test });
        console.log(`  ${worlds} mons: (b) ${pct(r.b)} · (c) ${pct(r.c)} · totes dues ${pct(r.both)} · almenys una ${pct(r.any)}`);
      }
    }
  } else if (mode === '--validesa') {
    const p = Number(arg('ritme', '0.2')), [rhoA, rhoB] = list(arg('rho', '0,0.4')), worlds = Number(arg('mons', '150')), alpha = Number(arg('alfa', '0.0125')), seed = Number(arg('seed', '20261027'));
    const r = validity({ p, k, worlds, rhoA, rhoB, alpha, sims, seed });
    console.log(`la validesa: dos braços amb el ritme ${p}, concordances ${rhoA} i ${rhoB}; ${worlds} mons, K = ${k}, α = ${alpha}, ${sims} repeticions, llavor ${seed}`);
    console.log(`  es dona el primer per més alt: prova de signes ${(100 * r.signes).toFixed(1)} %, permutació de signes ${(100 * r.permutacio).toFixed(1)} %` +
      ('calibrada' in r ? `, permutació amb els llindars calibrats ${(100 * r.calibrada).toFixed(1)} %` : ''));
  } else {
    const pc = Number(arg('continue', '0.22')), shuffles = list(arg('shuffle', '0.11,0.15'));
    const worldsList = list(arg('mons', '40,80,120,160,240'));
    const rho = Number(arg('rho', '0')), alpha = Number(arg('alfa', '0.025')), seed = Number(arg('seed', '20261025'));
    console.log(`la potència, amb el món com a unitat: K = ${k}, rho = ${rho}, α = ${alpha} unilateral, ${sims} repeticions, llavor ${seed}` + (test === 'permutacio' ? ', la permutació de signes' : ''));
    for (const ps of shuffles) {
      console.log(`continue ${pc * 100} %, shuffle-all ${ps * 100} %: ` + worldsList.map((n) => `${n} mons ${Math.round(100 * power({ pc, ps, k, worlds: n, rho, alpha, sims, seed, test }))} %`).join(' · '));
    }
  }
}
