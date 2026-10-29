// Els llindars calibrats de la sèrie de la maduració (docs/protocol-maduracio.md, §6; AUD-128, AU2-94): per a cada m, el
// nombre de mons amb diferència, i per a cada pas de Holm (α/2 = 1/80 i α = 1/40), el recompte K més gran amb què la prova
// és vàlida per a la hipòtesi del mateix ritme.
//
// La prova (fase2/maduracio-serie.mjs, signFlipTest): amb K = 2 llavors per braç, la diferència d'un món, D, va de −2 a 2.
// La p és count / 2^m, la proporció de les 2^m assignacions de signes amb una suma igual o més gran que l'observada. Al pas
// de Holm j es rebutja si count ≤ K_j(m).
//
// La calibració. Els mons són independents: les llavors es fixen abans, i la regla d'inclusió només mira l'envelliment. Sota
// la hipòtesi nul·la del ritme, les diferències dels mons són independents i tenen mitjana 0. Sabent m, les m diferències no
// nul·les són independents i tenen una mateixa distribució g a {−2, −1, 1, 2}, amb mitjana 0. La concordança entre les
// llavors i la dependència entre els braços d'un món només canvien g. Per a cada K, la probabilitat de rebutjar, sabent m, és
// una funció de g, i K_j(m) és el més gran amb el màxim d'aquesta funció com a molt α_j·(1 − MARGIN) sobre totes les g. Si la
// prova ho compleix per a cada m, ho compleix sempre, sigui quina sigui la distribució de m. Sabent m, una nul·la amb mitjana
// negativa rebutja encara menys, perquè el recompte no creix mai si una diferència no nul·la creix. Entre m diferents, en
// canvi, la decisió no és monòtona: si una diferència passa de 0 a +1, m creix, i el llindar pot baixar més que la p
// (AUD-130, auditoria 21). No afecta la validesa, que és per a cada m.
//
// La certificació (AU2-99, auditoria 21). La cerca troba un màxim, però no en demostra cap: --certifica en dona una cota
// superior rigorosa, amb un altre mètode (els polinomis de Bernstein, més avall), i l'escriu a CERTIFICATE.
//
// g es parametritza amb r = P(|D| = 1 | D ≠ 0) i pi1 = P(D > 0 | |D| = 1); pi2 = P(D > 0 | |D| = 2) en surt, perquè la
// mitjana sigui 0. El màxim es busca:
//   - a les dues arestes del vèrtex (−2: 1/3, +1: 2/3), la forma que concentra els −2 i reparteix els +1, on són els
//     màxims de l'exploració de l'auditoria 20: sense +2 (pi2 = 0) i sense −1 (pi1 = 1);
//   - en una graella de tota la regió;
//   - amb una cerca local des dels millors punts.
// Cada K es tria amb una recerca binària, amb les arestes, i es comprova amb la cerca sencera. Si no passa, es baixa al K
// anterior.
//
// El càlcul fa servir enters exactes (BigInt) per als recomptes, i només sumes i productes de coma flotant per a les
// probabilitats: dona el mateix resultat a qualsevol màquina.
//
// Ús:
//   node eines/llindars-maduracio.mjs --calcula [--fins M]    calcula la taula, amb els dos passos alhora (més d'una hora), i
//                                                              l'escriu a fase2/maduracio-llindars.json, sense sobreescriure
//   node eines/llindars-maduracio.mjs --comprova [--fins M]   la torna a calcular, fins a M, i la compara amb el fitxer
//   node eines/llindars-maduracio.mjs --validesa              la probabilitat exacta de rebutjar, amb els llindars nominals i
//                                                              els calibrats: la validesa amb el mateix ritme, i la potència
//   node eines/llindars-maduracio.mjs --suprem                el cas pitjor de cada regla sense saber m, sobre totes les
//                                                              distribucions amb mitjana 0: la cota inferior d'una cerca i la
//                                                              superior de les cotes certificades de cada m (uns minuts)
//   node eines/llindars-maduracio.mjs --certifica             la cota superior certificada de cada llindar de la taula, i la del
//                                                              recompte següent; l'escriu a CERTIFICATE, sense sobreescriure
//   node eines/llindars-maduracio.mjs --comprova-certificat [--fins M]
//                                                              comprova el certificat, i en torna a calcular les files fins a M
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const TABLE = 'fase2/maduracio-llindars.json';
export const STEPS = [[1, 80], [1, 40]]; // α/2 i α de Holm, amb α = 0,025 per a la família
export const WORLDS = 150;
export const MARGIN = 1e-4; // la part d'α que es deixa per a l'error de la cerca
export const SEARCH = { screen: 300, edge: 2000, grid: 100, starts: 10 };
export const CERTIFICATE = 'fase2/maduracio-llindars-certificat.json';
export const SAFE = 1e-9; // el marge relatiu de les comparacions de la certificació, per a l'error de coma flotant

// ---- Els recomptes exactes

const binomRow = (n) => { const r = [1n]; for (let k = 1; k <= n; k++) r.push((r[k - 1] * BigInt(n - k + 1)) / BigInt(k)); return r; };
const ROWS = [];
const rowsUpTo = (m) => { for (let n = ROWS.length; n <= m; n++) ROWS.push(binomRow(n)); return ROWS; };
// Les cues de T* = X* + 2Y*, amb X* ~ Bin(m1, ½) i Y* ~ Bin(m − m1, ½), en recomptes: tails[m1][t] = #{assignacions amb
// T* ≥ t}. La suma observada és 2T − m1 − 2m2, i la p és tails[m1][T] / 2^m
export function tailCounts(m) {
  const rows = rowsUpTo(m);
  return Array.from({ length: m + 1 }, (_, m1) => {
    const m2 = m - m1, tmax = m1 + 2 * m2, c = new Array(tmax + 2).fill(0n);
    for (let y = 0; y <= m2; y++) for (let x = 0; x <= m1; x++) c[x + 2 * y] += rows[m1][x] * rows[m2][y];
    for (let t = tmax - 1; t >= 0; t--) c[t] += c[t + 1];
    return c;
  });
}
// El t crític de cada m1 per a un recompte K: el més petit amb la cua com a molt K (tmax + 1 si cap)
export const criticals = (tails, K) => tails.map((c) => { let crit = c.length - 1; for (let t = c.length - 2; t >= 0; t--) { if (c[t] <= K) crit = t; else break; } return crit; });

// ---- La probabilitat de rebutjar, sabent m

// Les binomials de 0 a n amb la probabilitat pi, per recurrència (només sumes i productes)
function binRows(n, pi) {
  const rows = [Float64Array.of(1)];
  for (let k = 1; k <= n; k++) {
    const prev = rows[k - 1], row = new Float64Array(k + 1);
    for (let j = 0; j <= k; j++) row[j] = (j < k ? prev[j] * (1 - pi) : 0) + (j > 0 ? prev[j - 1] * pi : 0);
    rows.push(row);
  }
  return rows;
}
const upper = (p) => { const o = new Float64Array(p.length + 1); for (let k = p.length - 1; k >= 0; k--) o[k] = o[k + 1] + p[k]; return o; };
// pi2 perquè la mitjana sigui 0: r(2·pi1 − 1) + 2(1 − r)(2·pi2 − 1) = 0. Fora de [0, 1], la forma no existeix
export const pi2Of = (r, pi1) => (r >= 1 ? (pi1 === 0.5 ? 0.5 : NaN) : 0.5 - (r * (2 * pi1 - 1)) / (4 * (1 - r)));
// La forma de les m diferències no nul·les: M[m1] = P(m1 | m), X[n][x] = P(Bin(n, pi1) ≥ x) i Y[n][y] = P(Bin(n, pi2) = y)
export function shape(m, r, pi1) {
  const pi2 = pi2Of(r, pi1);
  if (!(pi2 >= -1e-12 && pi2 <= 1 + 1e-12)) return null;
  return { r, pi1, M: binRows(m, r)[m], X: binRows(m, pi1).map(upper), Y: binRows(m, Math.min(1, Math.max(0, pi2))) };
}
// P(rebutjar | m) amb la forma sh: Σ_m1 P(m1 | m) Σ_y P(Y = y) P(X ≥ crit − 2y)
export function conditionalSize(sh, m, crits) {
  let s = 0;
  for (let m1 = 0; m1 <= m; m1++) {
    const w = sh.M[m1];
    if (w === 0) continue;
    const m2 = m - m1, tc = crits[m1], X = sh.X[m1], Y = sh.Y[m2];
    let t = 0;
    for (let y = 0; y <= m2; y++) { const nx = tc - 2 * y; t += Y[y] * X[nx < 0 ? 0 : nx > m1 ? m1 + 1 : nx]; }
    s += w * t;
  }
  return s;
}
// Les dues arestes del vèrtex (−2: 1/3, +1: 2/3), amb n + 1 punts cadascuna: u va del vèrtex (0) a l'altre extrem (1)
function edgePoints(n) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, r = 2 / 3 + u / 3;
    out.push([r, r >= 1 ? 0.5 : Math.min(1, 0.5 + (1 - r) / r)]); // sense +2: de V3 a (±1)
    const r2 = (2 / 3) * (1 - u);
    out.push([r2, r2 > 0 ? 1 : 0.5]); // sense −1: de V3 a (±2)
  }
  return out;
}

// ---- La cerca del màxim

// La cerca sencera: les arestes, la graella i la cerca local des dels millors punts. Retorna { max, r, pi1 }
export function fullMax(m, crits, search = SEARCH) {
  const seen = [];
  const at = (r, pi1) => { const sh = shape(m, r, pi1); if (!sh) return null; const s = conditionalSize(sh, m, crits); seen.push({ s, r, pi1 }); return s; };
  for (const [r, pi1] of edgePoints(search.edge)) at(r, pi1);
  for (let i = 0; i <= search.grid; i++) for (let j = 0; j <= search.grid; j++) at(i / search.grid, j / search.grid);
  seen.sort((a, b) => b.s - a.s);
  let best = seen[0];
  for (const start of seen.slice(0, search.starts)) {
    let cur = start, h = 0.01;
    while (h > 1e-7) {
      let moved = false;
      const tries = [[h, 0], [-h, 0], [0, h], [0, -h], [h, h], [-h, -h], [h, -h], [-h, h]].map(([dr, dp]) => [cur.r + dr, cur.pi1 + dp]);
      // i sobre l'aresta sense +2, amb pi1 lligat a r
      for (const dr of [h, -h]) { const r = cur.r + dr; if (r >= 2 / 3 && r <= 1) tries.push([r, r >= 1 ? 0.5 : Math.min(1, 0.5 + (1 - r) / r)]); }
      for (const [r, pi1] of tries) {
        if (r < 0 || r > 1 || pi1 < 0 || pi1 > 1) continue;
        const s = at(r, pi1);
        if (s !== null && s > cur.s) { cur = { s, r, pi1 }; moved = true; }
      }
      if (!moved) h /= 2;
    }
    if (cur.s > best.s) best = cur;
  }
  return { max: best.s, r: best.r, pi1: best.pi1 };
}

// El K calibrat d'un m i d'un pas (α = num/den): el recompte més gran, entre els que es poden donar, amb el màxim com a molt
// α·(1 − MARGIN). −1 si cap
export function calibrate(m, num, den, search = SEARCH) {
  const limit = (num / den) * (1 - MARGIN), tails = tailCounts(m), nominal = (BigInt(num) << BigInt(m)) / BigInt(den);
  const values = [...new Set(tails.flat().filter((c) => c > 0n && c <= nominal))].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const screen = edgePoints(search.screen).map(([r, pi1]) => shape(m, r, pi1)).filter(Boolean);
  const screenMax = (K) => { const c = criticals(tails, K); let s = 0; for (const sh of screen) s = Math.max(s, conditionalSize(sh, m, c)); return s; };
  let lo = -1, hi = values.length; // values[lo] passa les arestes; values[hi], no
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (screenMax(values[mid]) <= limit) lo = mid; else hi = mid; }
  for (; lo >= 0; lo--) {
    const f = fullMax(m, criticals(tails, values[lo]), search);
    if (f.max <= limit) return { m, K: values[lo], max: f.max, at: [f.r, f.pi1] };
  }
  return { m, K: -1n, max: 0, at: null };
}

// ---- La probabilitat de rebutjar, sense saber m: la validesa i la potència d'una regla

// Els t crítics de cada m (de 0 a N) per a unes regles, kOf(m) = el recompte K del pas; null si no es pot rebutjar. Els
// recomptes de tots els m es fan alhora, per recurrència: afegir un món amb |D| = 2 a (m1, m2) és sumar els recomptes
// desplaçats en 0 i en 2. Són els mateixos que els de tailCounts, que la prova compara
export function ruleCriticals(kOfs, worlds = WORLDS) {
  const out = kOfs.map(() => []), points = []; // points[m1]: els recomptes de T* = t, amb m2 = m − m1
  for (let m = 0; m <= worlds; m++) {
    for (let m1 = 0; m1 < m; m1++) {
      const prev = points[m1], next = new Array(prev.length + 2).fill(0n);
      for (let t = 0; t < prev.length; t++) { next[t] += prev[t]; next[t + 2] += prev[t]; }
      points[m1] = next;
    }
    points[m] = binomRow(m);
    const tails = points.map((c) => { const o = new Array(c.length + 1).fill(0n); for (let t = c.length - 1; t >= 0; t--) o[t] = o[t + 1] + c[t]; return o; });
    kOfs.forEach((kOf, i) => { const K = kOf(m); out[i].push(K < 1n ? null : criticals(tails, K)); });
  }
  return out;
}
// La regla nominal, count ≤ α·2^m, i la calibrada, la de la taula
export const nominalK = (num, den) => (m) => (BigInt(num) << BigInt(m)) / BigInt(den);
export const tableK = (table, step) => (m) => table.rows[m].k[step];
// La probabilitat exacta de rebutjar amb N mons, si la diferència de cada món té la distribució q = [P(−2), P(−1), P(0),
// P(1), P(2)]: Σ_m P(m) P(rebutjar | m)
export function size(q, crits, worlds = crits.length - 1) {
  const t = 1 - q[2], r1 = q[1] + q[3], r2 = q[0] + q[4];
  const r = t > 0 ? r1 / t : 0.5, pi1 = r1 > 0 ? q[3] / r1 : 0.5, pi2 = r2 > 0 ? q[4] / r2 : 0.5;
  const W = binRows(worlds, Math.min(1, Math.max(0, t)))[worlds], R = binRows(worlds, r), X = binRows(worlds, pi1).map(upper), Y = binRows(worlds, pi2);
  let s = 0;
  for (let m = 0; m <= worlds; m++) if (W[m] > 0 && crits[m]) s += W[m] * conditionalSize({ M: R[m], X, Y }, m, crits[m]);
  return s;
}
// El nombre d'establiments d'un braç (0, 1 o 2) amb el ritme p i la correlació rho de les dues llavors (el model de la
// potència, eines/potencia-maduracio.mjs), i la diferència de dos braços independents
export const arm = (p, rho) => { const c = rho * p * (1 - p); return [(1 - p) ** 2 + c, 2 * p * (1 - p) - 2 * c, p * p + c]; };
export const difference = (A, B) => { const o = [0, 0, 0, 0, 0]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[i - j + 2] += A[i] * B[j]; return o; };
// El suprem de la mida d'una regla sobre totes les distribucions de D amb mitjana 0, la nul·la del ritme, sense cap model:
// una cota inferior. Coordenades: a = P(−2), b = P(−1), e = P(+2); P(+1) = 2a + b − 2e, i P(0), la resta, z = 1 − 3a − 2b + e.
// Una graella de tot el políedre, una de fina a la zona del pitjor (pocs mons amb diferència), les dues arestes del vèrtex
// (−2: 1/3, +1: 2/3), una línia fina a la vora P(D = 0) = 0, i una cerca local des dels millors punts, que també es mou al
// llarg de les vores (AUD-131: a la vora, amb tots els mons amb diferència, hi ha el pitjor dels calibrats al pas 2)
export function unconditionalMax(crits) {
  const qOf = (a, b, e) => { const c = 2 * a + b - 2 * e, z = 1 - a - b - c - e; return a < 0 || b < 0 || e < 0 || c < -1e-12 || z < -1e-12 ? null : [a, b, Math.max(0, z), Math.max(0, c), e]; };
  const pts = [];
  const add = (a, b, e) => { const q = qOf(a, b, e); if (q) pts.push({ a, b, e, s: size(q, crits) }); };
  for (let a = 0; a <= 0.34; a += 0.02) for (let b = 0; b <= 0.5; b += 0.04) for (let e = 0; e <= 0.2; e += 0.04) add(a, b, e);
  for (let a = 0; a <= 0.06; a += 0.002) for (let b = 0; b <= 0.04; b += 0.004) for (let e = 0; e <= 0.01; e += 0.005) add(a, b, e);
  for (let t = 0.02; t <= 1.0001; t += 0.02) for (let u = 0; u <= 1.0001; u += 0.1) { add((u * t) / 3, ((1 - u) * t) / 2, 0); add((u * t) / 3 + ((1 - u) * t) / 2, 0, ((1 - u) * t) / 2); }
  for (let i = 0; i <= 1000; i++) { const u = i / 1000; add(u / 3, (1 - u) / 2, 0); add(u / 3 + (1 - u) / 2, 0, (1 - u) / 2); }
  add(1 / 3, 0, 0);
  pts.sort((x, y) => y.s - x.s);
  let best = pts[0];
  // els passos: d'una coordenada, i de dues alhora sense canviar P(0) (z), per moure's per la vora P(D = 0) = 0
  const steps = (h) => [[h[0], 0, 0], [-h[0], 0, 0], [0, h[1], 0], [0, -h[1], 0], [0, 0, h[2]], [0, 0, -h[2]],
    [h[0], -1.5 * h[0], 0], [-h[0], 1.5 * h[0], 0], [0, h[1], 2 * h[1]], [0, -h[1], -2 * h[1]], [h[0], 0, 3 * h[0]], [-h[0], 0, -3 * h[0]]];
  for (const start of pts.slice(0, 5)) {
    let cur = start, h = [0.002, 0.003, 0.002];
    while (h[0] > 1e-6) {
      let moved = false;
      for (const [da, db, de] of steps(h)) {
        const v = [Math.max(0, cur.a + da), Math.max(0, cur.b + db), Math.max(0, cur.e + de)];
        const q = qOf(...v); if (!q) continue;
        const s = size(q, crits); if (s > cur.s) { cur = { a: v[0], b: v[1], e: v[2], s }; moved = true; }
      }
      if (!moved) h = h.map((x) => x / 2);
    }
    if (cur.s > best.s) best = cur;
  }
  return { max: best.s, q: qOf(best.a, best.b, best.e) };
}

// ---- La certificació (AU2-99, auditoria 21): una cota superior rigorosa de P(rebutjar | m), sobre totes les distribucions
//
// - Les distribucions de les diferències no nul·les amb mitjana 0 són el quadrilàter de vèrtexs V1 = (−2: 1/3, +1: 2/3),
//   V3 = (±1: ½), V2 = (−1: 2/3, +2: 1/3) i V4 = (±2: ½). La diagonal V3–V4, les formes simètriques, el parteix en dos
//   triangles, (V1, V3, V4) i (V2, V3, V4).
// - Dins d'un triangle (A, B, C), g = λA·A + λB·B + λC·C, i cada diferència es pot sortejar en dos temps: primer el vèrtex, amb
//   les λ, i després el valor, amb la distribució del vèrtex. Sabent m, la probabilitat de rebutjar és exactament el polinomi
//   de Bernstein Σ Mult(n; m, λ)·c(n): c(nA, nB, nC) és la probabilitat de rebutjar si nA diferències surten d'A, nB de B i nC
//   de C.
// - És una mitjana ponderada dels coeficients: al triangle, no passa del més gran, i els coeficients dels tres vèrtexs en són
//   els valors exactes.
// - La ramificació i poda parteix el triangle de la cota més alta per la meitat del costat més llarg (de Casteljau, fila a
//   fila). La cota superior és la més alta de les fulles, i la inferior, el valor més alt dels vèrtexs.
// Els coeficients dels dos triangles: els valors de V3 i V4 tenen els signes a l'atzar, i la cua de U + 2V, amb U ~ Bin(nB, ½)
// i V ~ Bin(nC, ½), es calcula una vegada per a tots els (nB, nC); els de V1 i V2 surten de Bin(nA, 2/3) i de Bin(nA, 1/3).
// Només hi ha sumes de positius, productes i meitats: l'error relatiu de coma flotant és de l'ordre de 10⁻¹², molt per sota de
// SAFE, i el resultat és el mateix a qualsevol màquina.
const VERTICES = { V1: [1 / 3, 0, 2 / 3, 0], V3: [0, 0.5, 0.5, 0], V2: [0, 2 / 3, 0, 1 / 3], V4: [0.5, 0, 0, 0.5] }; // P(−2, −1, +1, +2)

// Les cues de U + 2V, amb U ~ Bin(b, ½) i V ~ Bin(c, ½), per a b + c ≤ n: H[b][c][t] = P(U + 2V ≥ t), de t = 0 a b + 2c + 1
let HALF = null;
function halfTails(n) {
  if (HALF && HALF.n >= n) return HALF.H;
  const H = [];
  for (let b = 0; b <= n; b++) {
    let p = Float64Array.of(1);
    for (let k = 1; k <= b; k++) { const q = new Float64Array(k + 1); for (let j = 0; j <= k; j++) q[j] = ((j < k ? p[j] : 0) + (j > 0 ? p[j - 1] : 0)) / 2; p = q; }
    const rows = [];
    for (let c = 0; b + c <= n; c++) {
      if (c > 0) { const q = new Float64Array(p.length + 2); for (let j = 0; j < q.length; j++) q[j] = ((j < p.length ? p[j] : 0) + (j >= 2 ? p[j - 2] : 0)) / 2; p = q; }
      rows.push(upper(p));
    }
    H.push(rows);
  }
  HALF = { n, H };
  return H;
}
const tailAt = (T, t) => (t <= 0 ? T[0] : t < T.length ? T[t] : 0);
// Les posicions dels coeficients d'un triangle de grau m: la fila nC i, dins de la fila, nB (nA = m − nB − nC)
const offsetsOf = (m) => { const o = new Int32Array(m + 2); for (let k = 0; k <= m; k++) o[k + 1] = o[k] + (m - k + 1); return o; };

// Els coeficients dels dos triangles, amb els t crítics crits (es rebutja si T* ≥ crits[m1])
function startCoefficients(m, crits) {
  const H = halfTails(Math.max(m, WORLDS)), B23 = binRows(m, 2 / 3), B13 = binRows(m, 1 / 3), off = offsetsOf(m);
  const c1 = new Float64Array(off[m + 1]), c2 = new Float64Array(off[m + 1]);
  for (let nC = 0; nC <= m; nC++) for (let nB = 0; nB + nC <= m; nB++) {
    const a = m - nB - nC, T = H[nB][nC], i = off[nC] + nB;
    // V1: x de les a són +1, i la resta, −2. m1 = x + nB, i T* = x + U + 2V
    let s = 0;
    for (let x = 0; x <= a; x++) s += B23[a][x] * tailAt(T, crits[x + nB] - x);
    c1[i] = s;
    // V2: y de les a són +2, i la resta, −1. m1 = a − y + nB, i T* = U + 2y + 2V
    s = 0;
    for (let y = 0; y <= a; y++) s += B13[a][y] * tailAt(T, crits[a - y + nB] - 2 * y);
    c2[i] = s;
  }
  return [c1, c2];
}
// El triangle amb els vèrtexs en un altre ordre, p: el nou vèrtex i és el vèrtex p[i] d'abans
function permuted(t, p, m, off) {
  const coef = new Float64Array(t.coef.length), n = [0, 0, 0];
  for (let nC = 0; nC <= m; nC++) for (let nB = 0; nB + nC <= m; nB++) {
    n[0] = m - nB - nC; n[1] = nB; n[2] = nC;
    coef[off[n[p[2]]] + n[p[1]]] = t.coef[off[nC] + nB];
  }
  return { verts: p.map((i) => t.verts[i]), coef };
}
// Els dos triangles que surten de partir (A, B, C) pel punt mitjà P d'AB: (A, P, C) i (P, B, C). Fila a fila (nC fix), és el de
// Casteljau d'una dimensió a t = ½
function halves(t, m, off) {
  const L = new Float64Array(t.coef.length), R = new Float64Array(t.coef.length), w = new Float64Array(m + 1);
  for (let k = 0; k <= m; k++) {
    const d = m - k, o = off[k];
    for (let j = 0; j <= d; j++) w[j] = t.coef[o + j];
    L[o] = w[0]; R[o + d] = w[d];
    for (let l = 1; l <= d; l++) {
      for (let i = 0; i <= d - l; i++) w[i] = (w[i] + w[i + 1]) / 2;
      L[o + l] = w[0]; R[o + d - l] = w[d - l];
    }
  }
  const [A, B, C] = t.verts, P = A.map((x, i) => (x + B[i]) / 2);
  return [{ verts: [A, P, C], coef: L }, { verts: [P, B, C], coef: R }];
}
const l1 = (p, q) => Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]) + Math.abs(p[3] - q[3]);
// Parteix el triangle pel costat més llarg
function split(t, m, off) {
  const [A, B, C] = t.verts, e = [l1(A, B), l1(B, C), l1(C, A)];
  const p = e[0] >= e[1] && e[0] >= e[2] ? null : e[1] >= e[2] ? [1, 2, 0] : [2, 0, 1];
  return halves(p ? permuted(t, p, m, off) : t, m, off);
}
// Un munt amb la cota més alta a dalt
class Heap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  top() { return this.a[0]; }
  push(x) {
    const a = this.a;
    a.push(x);
    for (let i = a.length - 1; i > 0;) { const p = (i - 1) >> 1; if (a[p].bound >= a[i].bound) break; [a[p], a[i]] = [a[i], a[p]]; i = p; }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0; ;) {
        const l = 2 * i + 1, r = l + 1;
        let j = i;
        if (l < a.length && a[l].bound > a[j].bound) j = l;
        if (r < a.length && a[r].bound > a[j].bound) j = r;
        if (j === i) break;
        [a[j], a[i]] = [a[i], a[j]]; i = j;
      }
    }
    return top;
  }
}
const maxOf = (c) => { let x = 0; for (let i = 0; i < c.length; i++) if (c[i] > x) x = c[i]; return x; };

// La cota del suprem de P(rebutjar | m) sobre totes les distribucions amb mitjana 0, amb els t crítics crits. Parteix fins que
// la cota superior no passa de la inferior en més de gap (relatiu), i fins que cap dels llindars de levels no queda entre totes
// dues, amb el marge SAFE. Retorna { lower, upper, at (on és la cota inferior: P(−2, −1, +1, +2)), splits }
export function certify(m, crits, { levels = [], gap = 1e-6, budget = 200000 } = {}) {
  const off = offsetsOf(m), corners = [0, m, off[m]], heap = new Heap();
  let lower = 0, at = null, dropped = 0, splits = 0;
  // una fulla: els seus vèrtexs donen la cota inferior; si la seva cota ja és per sota de la inferior, només se'n guarda la cota
  const add = ({ verts, coef }) => {
    corners.forEach((i, v) => { if (at === null || coef[i] > lower) { lower = coef[i]; at = verts[v]; } });
    const bound = maxOf(coef);
    if (bound * (1 + SAFE) < lower * (1 - SAFE)) dropped = Math.max(dropped, bound);
    else heap.push({ verts, coef, bound });
  };
  const [c1, c2] = startCoefficients(m, crits);
  add({ verts: [VERTICES.V1, VERTICES.V3, VERTICES.V4], coef: c1 });
  add({ verts: [VERTICES.V2, VERTICES.V3, VERTICES.V4], coef: c2 });
  const open = (u) => u > lower * (1 + gap) || levels.some((tau) => lower * (1 - SAFE) <= tau && tau < u * (1 + SAFE));
  while (heap.size && open(heap.top().bound)) {
    if (++splits > budget) throw new Error(`m = ${m}: la cota no s'ha decidit amb ${budget} particions`);
    for (const child of split(heap.pop(), m, off)) add(child);
    // les fulles que ja no poden passar de la cota inferior
    if (heap.size > 2048) {
      const keep = heap.a.filter((x) => { const k = x.bound * (1 + SAFE) >= lower * (1 - SAFE); if (!k) dropped = Math.max(dropped, x.bound); return k; });
      heap.a = []; for (const x of keep) heap.push(x);
    }
  }
  return { lower, upper: Math.max(heap.size ? heap.top().bound : 0, dropped), at, splits };
}

// La certificació d'un llindar K de la taula, al pas α = num/den: la cota del suprem amb K, i la del recompte següent que es
// pot donar (el més petit per sobre de K), si no passa del nominal. Els llindars de la decisió són α·(1 − MARGIN), el criteri
// de la taula, i α. Si el suprem del recompte següent passa del criteri, K és el més gran
export function certifyStep(m, K, num, den) {
  const tails = tailCounts(m), alpha = num / den, levels = [alpha * (1 - MARGIN), alpha], nominal = (BigInt(num) << BigInt(m)) / BigInt(den);
  const s = K < 1n ? { lower: 0, upper: 0, at: null, splits: 0 } : certify(m, criticals(tails, K), { levels });
  const values = [...new Set(tails.flat().filter((c) => c > 0n && c <= nominal))].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const k2 = values.find((c) => c > K);
  const n = k2 === undefined ? null : certify(m, criticals(tails, k2), { levels, gap: Infinity });
  return { k: String(K), lower: s.lower, upper: s.upper, at: s.at, splits: s.splits + (n ? n.splits : 0), next: n && { k: String(k2), lower: n.lower, upper: n.upper } };
}
// Les files del certificat, de m = 0 a to, amb els K de la taula
export function certificateRows(table, to = WORLDS) {
  halfTails(WORLDS);
  const rows = [];
  for (let m = 0; m <= to; m++) {
    const [a, b] = STEPS.map(([num, den], j) => certifyStep(m, BigInt(table.rows[m].k[j]), num, den));
    rows.push({ m, k: [a.k, b.k], upper: [a.upper, b.upper], lower: [a.lower, b.lower], at: [a.at, b.at], next: [a.next, b.next], splits: a.splits + b.splits });
  }
  return rows;
}
// Que les files del certificat, de m = 0 a to, siguin les que surten del càlcul: --comprova-certificat, i la preparació de la
// sèrie, que no es refia dels números del fitxer (auditor 1, auditoria 22)
export function recomputedProblems(cert, table, to = WORLDS) {
  const bad = certificateRows(table, to).filter((r, m) => JSON.stringify(r) !== JSON.stringify(cert?.rows?.[m])).map((r) => r.m);
  return bad.length ? [`les files de m = ${bad.join(', ')} no són les que surten del càlcul`] : [];
}
export const sha256Of = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
// Els problemes d'un certificat: l'estructura, la taula (la SHA-256 i els K), i la validesa de cada fila: la cota superior,
// amb el marge SAFE, com a molt α del seu pas
export function certificateProblems(cert, { table, tableSha256 }) {
  if (!cert || cert.table !== TABLE || !Array.isArray(cert.rows) || cert.rows.length !== WORLDS + 1) return ["el certificat dels llindars no té l'estructura esperada"];
  const out = [];
  if (cert.tableSha256 !== tableSha256) out.push(`el certificat és d'una altra taula (SHA-256 ${cert.tableSha256}, i la taula és ${tableSha256})`);
  cert.rows.forEach((r, m) => STEPS.forEach(([num, den], j) => {
    if (r?.m !== m || !Array.isArray(r.k) || r.k[j] !== String(table.rows[m]?.k[j])) out.push(`m = ${m}, pas ${j + 1}: el K del certificat no és el de la taula`);
    else if (!(typeof r.upper?.[j] === 'number' && r.upper[j] * (1 + SAFE) <= num / den)) out.push(`m = ${m}, pas ${j + 1}: la cota superior del certificat no és com a molt α`);
  }));
  return out;
}
// El resum d'un certificat, en línies
export function certificateSummary(rows) {
  const pc = (x, d = 6) => `${(100 * x).toFixed(d)} %`, out = [];
  const all = rows.flatMap((r) => STEPS.map(([num, den], j) => ({ m: r.m, j, alpha: num / den, upper: r.upper[j], lower: r.lower[j], next: r.next[j] })));
  const valid = all.filter((x) => x.upper * (1 + SAFE) <= x.alpha).length, criterion = all.filter((x) => x.upper * (1 + SAFE) <= x.alpha * (1 - MARGIN)).length;
  out.push(`${all.length} llindars (m de 0 a ${rows.length - 1}, els dos passos). La cota superior, com a molt α: ${valid}; com a molt α·(1 − 10⁻⁴), el criteri de la taula: ${criterion}`);
  for (const j of [0, 1]) {
    const c = all.filter((x) => x.j === j).reduce((a, b) => (b.upper / b.alpha > a.upper / a.alpha ? b : a));
    out.push(`  el més a prop d'α al pas ${j + 1}: m = ${c.m}, el suprem entre ${pc(c.lower)} i ${pc(c.upper)} (${(c.upper / c.alpha).toFixed(6)}·α)`);
  }
  const withNext = all.filter((x) => x.next), largest = withNext.filter((x) => x.next.lower * (1 - SAFE) > x.alpha * (1 - MARGIN));
  out.push(`K és el més gran (el suprem del recompte següent passa del criteri): ${largest.length} de ${withNext.length} (els altres ${all.length - withNext.length}, sense cap recompte més fins al nominal)`);
  for (const x of withNext.filter((y) => !(y.next.lower * (1 - SAFE) > y.alpha * (1 - MARGIN)))) out.push(`  m = ${x.m}, pas ${x.j + 1}: el criteri no decideix el recompte següent`);
  const margin = withNext.filter((x) => x.next.upper * (1 + SAFE) <= x.alpha);
  out.push(`El recompte següent seria vàlid, i només el marge de 10⁻⁴ l'exclou: ${margin.length}`);
  for (const x of margin) out.push(`  m = ${x.m}, pas ${x.j + 1}: el suprem del recompte següent entre ${pc(x.next.lower, 5)} i ${pc(x.next.upper, 5)}`);
  out.push(`particions: ${rows.reduce((a, r) => a + r.splits, 0)}`);
  return out;
}
// La cota superior de Σ_m Bin(m; N, π)·U[m], per a π de 0 a 1, i la inferior: és un polinomi de Bernstein de grau N en π, amb
// els coeficients U. Es parteix l'interval de la cota més alta (de Casteljau, a la meitat) fins que la superior no passa de la
// inferior (els valors als extrems dels intervals) en més de gap. Retorna { lower, upper, at (la π de la inferior) }
export function mixtureBound(U, gap = 1e-6) {
  const N = U.length - 1, heap = new Heap();
  let lower = -1, at = 0;
  const add = (coef, lo, hi) => {
    if (coef[0] > lower) { lower = coef[0]; at = lo; }
    if (coef[N] > lower) { lower = coef[N]; at = hi; }
    heap.push({ coef, lo, hi, bound: maxOf(coef) });
  };
  add(Float64Array.from(U), 0, 1);
  while (heap.top().bound > lower * (1 + gap)) {
    const { coef, lo, hi } = heap.pop(), L = new Float64Array(N + 1), R = new Float64Array(N + 1), w = Float64Array.from(coef), mid = (lo + hi) / 2;
    L[0] = w[0]; R[N] = w[N];
    for (let l = 1; l <= N; l++) { for (let i = 0; i <= N - l; i++) w[i] = (w[i] + w[i + 1]) / 2; L[l] = w[0]; R[N - l] = w[N - l]; }
    add(L, lo, mid); add(R, mid, hi);
  }
  return { lower, upper: heap.top().bound, at };
}

// ---- La taula

export function readTable(root = ROOT) {
  const t = JSON.parse(readFileSync(join(root, TABLE), 'utf8'));
  return { ...t, rows: t.rows.map((r) => ({ ...r, k: r.k.map(BigInt) })) };
}
const rowJSON = (m, c1, c2) => ({ m, k: [String(c1.K), String(c2.K)], max: [c1.max, c2.max], at: [c1.at, c2.at] });

async function main(argv) {
  const usage = 'Ús: node eines/llindars-maduracio.mjs --calcula [--fins M] | --comprova [--fins M] | --validesa | --suprem | --certifica | --comprova-certificat [--fins M]';
  const fins = argv.indexOf('--fins'), to = fins >= 0 ? Number(argv[fins + 1]) : WORLDS;
  if (!(Number.isInteger(to) && to >= 0 && to <= WORLDS)) { console.error(usage); process.exit(2); }
  // un pas sol, per als processos fills de --calcula
  if (argv[0] === '--pas') {
    const step = Number(argv[1]), out = argv[4], rows = [];
    const [num, den] = STEPS[step - 1];
    for (let m = 0; m <= to; m++) { const c = calibrate(m, num, den); rows.push({ m, K: String(c.K), max: c.max, at: c.at }); }
    writeFileSync(out, JSON.stringify(rows));
    return;
  }
  if (argv[0] === '--calcula' && (argv.length === 1 || (argv.length === 3 && fins === 1))) {
    if (existsSync(join(ROOT, TABLE))) { console.error(`${TABLE} ja existeix: no es torna a calcular`); process.exit(1); }
    const parts = STEPS.map((_, i) => join(ROOT, `${TABLE}.pas${i + 1}`));
    await Promise.all(parts.map((out, i) => new Promise((resolve, reject) => {
      const p = spawn(process.execPath, [fileURLToPath(import.meta.url), '--pas', String(i + 1), '--fins', String(to), out], { stdio: 'inherit' });
      p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`el pas ${i + 1} ha acabat amb el codi ${code}`))));
    })));
    const [a, b] = parts.map((f) => JSON.parse(readFileSync(f, 'utf8')));
    const rows = a.map((x, m) => rowJSON(m, { ...x, K: x.K }, { ...b[m], K: b[m].K }));
    const table = {
      description: "Els llindars calibrats de la sèrie de la maduració (docs/protocol-maduracio.md, §6): per a cada m, els recomptes K dels dos passos de Holm. Es rebutja si count ≤ K, amb la p = count / 2^m; −1 vol dir que no es pot rebutjar. max és el màxim de la probabilitat de rebutjar, sabent m, sobre totes les distribucions amb mitjana 0, i at, on és (r, pi1)",
      program: 'eines/llindars-maduracio.mjs', steps: STEPS, worlds: WORLDS, margin: MARGIN, search: SEARCH, rows,
    };
    writeFileSync(join(ROOT, TABLE), JSON.stringify(table, null, 1) + '\n', { flag: 'wx' });
    parts.forEach((f) => unlinkSync(f));
    console.log(`${TABLE}: ${rows.length} files`);
    return;
  }
  if ((argv[0] === '--validesa' || argv[0] === '--suprem') && argv.length === 1) {
    const t = readTable(), pc = (x) => `${(100 * x).toFixed(2)} %`;
    const [n1, c1, n2, c2] = ruleCriticals([nominalK(...STEPS[0]), tableK(t, 0), nominalK(...STEPS[1]), tableK(t, 1)]);
    const rules = [{ nominal: n1, calibrated: c1 }, { nominal: n2, calibrated: c2 }];
    const both = (q) => rules.map((r) => `${pc(size(q, r.nominal))} / ${pc(size(q, r.calibrated))}`).join(' · ');
    console.log(`La probabilitat exacta de rebutjar, amb ${WORLDS} mons i K = 2. Per a cada pas de Holm (α/2 = 1/80 · α = 1/40), els llindars nominals / els calibrats:`);
    if (argv[0] === '--suprem') {
      // la cota superior: Σ_m Bin(m; N, π)·U_m, amb U_m la cota certificada de cada m (la del certificat, per als calibrats)
      const cert = existsSync(join(ROOT, CERTIFICATE)) ? JSON.parse(readFileSync(join(ROOT, CERTIFICATE), 'utf8')) : null;
      for (const [j, r] of rules.entries()) for (const kind of ['nominal', 'calibrated']) {
        const b = unconditionalMax(r[kind]);
        const U = Array.from({ length: WORLDS + 1 }, (_, m) => {
          if (kind === 'calibrated' && cert) return cert.rows[m].upper[j];
          const K = kind === 'nominal' ? nominalK(...STEPS[j])(m) : t.rows[m].k[j];
          return K < 1n ? 0 : certify(m, criticals(tailCounts(m), K), { gap: 1e-4 }).upper;
        });
        const u = mixtureBound(U);
        console.log(`  el cas pitjor, pas ${j + 1}, ${kind === 'nominal' ? 'nominal' : 'calibrat'}: entre ${pc(b.max)} (a P(−2..2) = (${b.q.map((x) => x.toFixed(4)).join(', ')}), amb P(D ≠ 0) = ${(1 - b.q[2]).toFixed(4)}) i ${pc(u.upper)} (la cota, amb P(D ≠ 0) = ${u.at.toFixed(4)})`);
      }
      return;
    }
    console.log('  La validesa: dos braços amb el mateix ritme, i les concordances entre llavors de cadascun:');
    for (const [p, ra, rb] of [[0.2, 0, 0.4], [0.2, 0.4, 0], [0.27, 0, 0.4], [0.1, 0, 0.8], [0.18, -0.2, 0.8], [0.02, 0, 1], [0.05, 0, 1], [0.2, 0, 1]]) console.log(`    ritme ${p}, concordances ${ra} i ${rb}: ${both(difference(arm(p, ra), arm(p, rb)))}`);
    const b = (1 - 8 / 22) / 5;
    console.log(`    la forma de (c) al pilot, amb mitjana 0 (+1, −1, −2 i 0): ${both([b, b, 8 / 22, 3 * b, 0])}`);
    console.log(`    el vèrtex (−2: 1/3, +1: 2/3), tots els mons amb diferència: ${both([1 / 3, 0, 0, 2 / 3, 0])}`);
    console.log('  La potència de cada prova sola, amb braços independents i la mateixa concordança:');
    for (const [p1, p2] of [[0.27, 0.135], [0.27, 0.18]]) for (const rho of [0.03, 0.3]) console.log(`    ${p1} contra ${p2}, rho ${rho}: ${both(difference(arm(p1, rho), arm(p2, rho)))}`);
    return;
  }
  if (argv[0] === '--comprova' && (argv.length === 1 || (argv.length === 3 && fins === 1))) {
    const t = readTable(), bad = [];
    for (let m = 0; m <= to; m++) {
      const want = rowJSON(m, calibrate(m, ...STEPS[0]), calibrate(m, ...STEPS[1])), got = t.rows[m];
      if (!got || JSON.stringify({ ...got, k: got.k.map(String) }) !== JSON.stringify(want)) bad.push(m);
    }
    if (bad.length) { console.log(`La taula no és la que surt del càlcul a m = ${bad.join(', ')}`); process.exit(1); }
    console.log(`La taula és la que surt del càlcul, de m = 0 a ${to}.`);
    return;
  }
  if (argv[0] === '--certifica' && argv.length === 1) {
    if (existsSync(join(ROOT, CERTIFICATE))) { console.error(`${CERTIFICATE} ja existeix: no es torna a calcular`); process.exit(1); }
    const start = Date.now(), rows = certificateRows(readTable());
    const cert = {
      description: "La certificació de la taula dels llindars calibrats (docs/protocol-maduracio.md, §6; AU2-99): per a cada m i cada pas, una cota superior rigorosa (upper) i una d'inferior (lower) del suprem de la probabilitat de rebutjar, sabent m, sobre totes les distribucions de les diferències amb mitjana 0, amb el K de la taula; at, on és la inferior (P(−2, −1, +1, +2)); i les del recompte següent que es pot donar, si no passa del nominal (next). Els polinomis de Bernstein dels dos triangles de les distribucions amb mitjana 0, amb ramificació i poda",
      program: 'eines/llindars-maduracio.mjs --certifica', table: TABLE, tableSha256: sha256Of(join(ROOT, TABLE)), steps: STEPS, margin: MARGIN, safe: SAFE, rows,
    };
    writeFileSync(join(ROOT, CERTIFICATE), JSON.stringify(cert, null, 1) + '\n', { flag: 'wx' });
    for (const l of certificateSummary(rows)) console.log(l);
    console.log(`${CERTIFICATE}: ${rows.length} files, en ${Math.round((Date.now() - start) / 1000)} s`);
    return;
  }
  if (argv[0] === '--comprova-certificat' && (argv.length === 1 || (argv.length === 3 && fins === 1))) {
    const t = readTable(), cert = JSON.parse(readFileSync(join(ROOT, CERTIFICATE), 'utf8'));
    const problems = [...certificateProblems(cert, { table: t, tableSha256: sha256Of(join(ROOT, TABLE)) }), ...recomputedProblems(cert, t, to)];
    for (const l of certificateSummary(cert.rows)) console.log(l);
    if (problems.length) { console.log(`El certificat no és vàlid (${problems.length} problemes):\n${problems.slice(0, 20).map((p) => `  ${p}`).join('\n')}`); process.exit(1); }
    console.log(`El certificat és el de la taula, totes les cotes són com a molt α, i les files de m = 0 a ${to} són les que surten del càlcul.`);
    return;
  }
  console.error(usage);
  process.exit(2);
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(1); });
