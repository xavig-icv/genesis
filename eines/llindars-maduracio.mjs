// Els llindars calibrats de la sèrie de la maduració (docs/protocol-maduracio.md, §6; AUD-128, AU2-94): per a cada m, el
// nombre de mons amb diferència, i per a cada pas de Holm (α/2 = 1/80 i α = 1/40), el recompte K més gran amb què la prova
// és vàlida per a la hipòtesi del mateix ritme.
//
// La prova (fase2/maduracio-serie.mjs, signFlipTest): amb K = 2 llavors per braç, la diferència d'un món, D, va de −2 a 2.
// La p és count / 2^m, la proporció de les 2^m assignacions de signes amb una suma igual o més gran que l'observada. Al pas
// de Holm j es rebutja si count ≤ K_j(m).
//
// La calibració. Sota la hipòtesi nul·la del ritme, les diferències dels mons són independents i tenen mitjana 0. Sabent m,
// les m diferències no nul·les són independents i tenen una mateixa distribució g a {−2, −1, 1, 2}, amb mitjana 0. La
// concordança entre les llavors i la dependència entre els braços d'un món només canvien g. Per a cada K, la probabilitat
// de rebutjar, sabent m, és una funció de g, i K_j(m) és el més gran amb el màxim d'aquesta funció com a molt
// α_j·(1 − MARGIN) sobre totes les g. Si la prova ho compleix per a cada m, ho compleix sempre, sigui quina sigui la
// distribució de m. Una nul·la amb mitjana negativa rebutja encara menys, perquè la p no creix mai si una diferència creix.
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
//   node eines/llindars-maduracio.mjs --suprem                el cas pitjor de cada regla, sobre totes les distribucions amb
//                                                              mitjana 0 (uns minuts)
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const TABLE = 'fase2/maduracio-llindars.json';
export const STEPS = [[1, 80], [1, 40]]; // α/2 i α de Holm, amb α = 0,025 per a la família
export const WORLDS = 150;
export const MARGIN = 1e-4; // la part d'α que es deixa per a l'error de la cerca
export const SEARCH = { screen: 300, edge: 2000, grid: 100, starts: 10 };

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
// El suprem de la mida d'una regla sobre totes les distribucions de D amb mitjana 0, la nul·la del ritme, sense cap model.
// Coordenades: a = P(−2), b = P(−1), e = P(+2); P(+1) = 2a + b − 2e, i P(0), la resta. Una graella de tot el políedre, una
// de fina a la zona del pitjor (pocs mons amb diferència), les dues arestes del vèrtex (−2: 1/3, +1: 2/3), i una cerca
// local des dels millors punts
export function unconditionalMax(crits) {
  const qOf = (a, b, e) => { const c = 2 * a + b - 2 * e, z = 1 - a - b - c - e; return a < 0 || b < 0 || e < 0 || c < -1e-12 || z < -1e-12 ? null : [a, b, Math.max(0, z), Math.max(0, c), e]; };
  const pts = [];
  const add = (a, b, e) => { const q = qOf(a, b, e); if (q) pts.push({ a, b, e, s: size(q, crits) }); };
  for (let a = 0; a <= 0.34; a += 0.02) for (let b = 0; b <= 0.5; b += 0.04) for (let e = 0; e <= 0.2; e += 0.04) add(a, b, e);
  for (let a = 0; a <= 0.06; a += 0.002) for (let b = 0; b <= 0.04; b += 0.004) for (let e = 0; e <= 0.01; e += 0.005) add(a, b, e);
  for (let t = 0.02; t <= 1.0001; t += 0.02) for (let u = 0; u <= 1.0001; u += 0.1) { add((u * t) / 3, ((1 - u) * t) / 2, 0); add((u * t) / 3 + ((1 - u) * t) / 2, 0, ((1 - u) * t) / 2); }
  add(1 / 3, 0, 0);
  pts.sort((x, y) => y.s - x.s);
  let best = pts[0];
  for (const start of pts.slice(0, 5)) {
    let cur = start, h = [0.002, 0.003, 0.002];
    while (h[0] > 1e-6) {
      let moved = false;
      for (let k = 0; k < 3; k++) for (const sg of [1, -1]) {
        const v = [cur.a, cur.b, cur.e]; v[k] = Math.max(0, v[k] + sg * h[k]);
        const q = qOf(...v); if (!q) continue;
        const s = size(q, crits); if (s > cur.s) { cur = { a: v[0], b: v[1], e: v[2], s }; moved = true; }
      }
      if (!moved) h = h.map((x) => x / 2);
    }
    if (cur.s > best.s) best = cur;
  }
  return { max: best.s, q: qOf(best.a, best.b, best.e) };
}

// ---- La taula

export function readTable(root = ROOT) {
  const t = JSON.parse(readFileSync(join(root, TABLE), 'utf8'));
  return { ...t, rows: t.rows.map((r) => ({ ...r, k: r.k.map(BigInt) })) };
}
const rowJSON = (m, c1, c2) => ({ m, k: [String(c1.K), String(c2.K)], max: [c1.max, c2.max], at: [c1.at, c2.at] });

async function main(argv) {
  const usage = 'Ús: node eines/llindars-maduracio.mjs --calcula [--fins M] | --comprova [--fins M] | --validesa | --suprem';
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
      for (const [j, r] of rules.entries()) for (const kind of ['nominal', 'calibrated']) {
        const b = unconditionalMax(r[kind]);
        console.log(`  el suprem, pas ${j + 1}, ${kind === 'nominal' ? 'nominal' : 'calibrat'}: ${pc(b.max)}, a P(−2..2) = (${b.q.map((x) => x.toFixed(4)).join(', ')}), amb P(D ≠ 0) = ${(1 - b.q[2]).toFixed(4)}`);
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
  console.error(usage);
  process.exit(2);
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(1); });
