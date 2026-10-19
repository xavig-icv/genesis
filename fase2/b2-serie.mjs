// La sèrie preregistrada de B2: quant dura la vida establerta (docs/protocol-b2.md, v0.2). Funcions pures:
// la validació de les branques contra el manifest, la primera pèrdua sostinguda, les estimacions amb el
// bootstrap de mons, la prova del canvi de règim i els descriptius. El programa que decideix és
// fase2/b2-confirmacio.mjs, que comprova el preregistre abans de carregar aquest mòdul.
import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { makeRng } from '../fase1/soup.js';

// ---- Les branques del manifest

// La condició de cada món: la d'origen (la de la sèrie de la llei 2) i la de canvi (l'altra)
export const ORIGIN_MIXING = { A: 0, B: 0.01 };
export const conditionMixing = (group, cond) => (cond === 'origen' ? ORIGIN_MIXING[group] : ORIGIN_MIXING[group === 'A' ? 'B' : 'A']);

// L'ordre de sim.mjs d'una branca, la mateixa de l'exploració, amb el món final desat
export function branchCommand(branch, world, manifest) {
  const { dir } = manifest;
  return [branch.name, '--world', manifest.params.world.join('x'), '--seed', branch.seed, '--mixing', branch.mixing,
    '--from', world.capture, '--start', world.t, '--epochs', world.t + branch.H, '--every', manifest.params.every,
    '--census', manifest.params.census.every, '--census-version', manifest.params.census.version, '--rng', manifest.params.rng,
    '--json', `${dir}/${branch.name}.jsonl`, '--save', `${dir}/captures`].join(' ');
}

// Les llistes de cada màquina: les branques de cada món, a la màquina del seu món, en l'ordre dels noms opacs
export function machineLists(manifest) {
  const worlds = new Map(manifest.worlds.map((w) => [w.id, w]));
  const out = Object.fromEntries(manifest.machines.names.map((m) => [m, []]));
  for (const b of [...manifest.branches].sort((x, y) => x.name.localeCompare(y.name))) {
    const w = worlds.get(b.world);
    out[w.machine].push(branchCommand(b, w, manifest));
  }
  return out;
}

// ---- La validació d'una branca (AU2-60): qualsevol diferència amb el manifest és un error, no una censura

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function validateBranch(records, branch, world, manifest, { commit = null } = {}) {
  const problems = [];
  const p = (msg) => problems.push(`${branch.name}: ${msg}`);
  if (!records.length || records[0].type !== 'start') { p('no comença amb la línia d\'inici'); return problems; }
  const s = records[0], P = manifest.params;
  if (commit && !(s.code && !s.code.includes('+') && commit.startsWith(s.code) && s.code.length >= 7)) p(`el codi és ${s.code}, no el del preregistre`);
  const expect = {
    seed: branch.seed, mixing: branch.mixing, from: world.capture, start: world.t, epochs: world.t + branch.H,
    world: P.world, radius: P.radius, rng: P.rng, every: P.every, mutation: P.mutation, diffusion: 0, flow: 0, renewal: 0,
  };
  for (const [k, v] of Object.entries(expect)) if (!same(s[k], v)) p(`${k} és ${JSON.stringify(s[k])}, i el manifest diu ${JSON.stringify(v)}`);
  for (const k of ['version', 'every', 'sample', 'seed']) {
    if (!s.census || s.census[k] !== P.census[k]) p(`el cens (${k}) no és el del manifest`);
  }
  if (s.command !== `node sim.mjs ${branchCommand(branch, world, manifest).split(' ').slice(1).join(' ')}`) p('l\'ordre no és la del manifest');
  const end = records[records.length - 1];
  if (end.type !== 'end') p('no acaba amb la línia final');
  else if (end.epoch !== world.t + branch.H) p(`acaba a l'època ${end.epoch}, no a ${world.t + branch.H}`);
  else if (end.reason !== 'horitzó') p(`acaba per "${end.reason}", no per l'horitzó`);
  if (records.filter((r) => r.type === 'start').length !== 1 || records.filter((r) => r.type === 'end').length !== 1) p('té més d\'una línia d\'inici o de final');
  const censuses = records.filter((r) => r.type === 'census');
  const every = P.census.every, n = branch.H / every;
  const epochs = censuses.map((c) => c.epoch);
  const want = Array.from({ length: n }, (_, j) => world.t + every * (j + 1));
  if (!same(epochs, want)) p(`els censos no són exactament els de ${want[0]} a ${want[want.length - 1]}, cada ${every} èpoques`);
  for (const c of censuses) {
    if (c.sample !== P.census.sample || !Number.isInteger(c.heritable) || c.heritable < 0 || c.heritable > c.sample) { p(`el cens de l'època ${c.epoch} no és vàlid`); break; }
  }
  return problems;
}

// ---- La mesura (protocol §5): la primera pèrdua sostinguda amb la regla R2

// censuses: els censos de la branca, en ordre (a t + 250, ..., t + H). Retorna, en èpoques des de t:
//   T: el primer de dos censos seguits amb lossMax hereditaris o menys (confirmat al segon), o H si no n'hi ha
//   event: si hi ha pèrdua confirmada abans de H; recovered: si després torna a recoverMin o més
//   final1pct, finalR2: l'estat al cens final, dues mesures diferents de T
export function lossTime(censuses, t, H, { lossMax, recoverMin }) {
  let T = H, event = false, recovered = false;
  for (let i = 0; i + 1 < censuses.length; i++) {
    if (censuses[i].heritable <= lossMax && censuses[i + 1].heritable <= lossMax) {
      T = censuses[i].epoch - t; event = true;
      recovered = censuses.slice(i + 2).some((c) => c.heritable >= recoverMin);
      break;
    }
  }
  const last = censuses[censuses.length - 1];
  return { T, event, recovered, final1pct: last.heritable >= recoverMin, finalR2: last.heritable > lossMax };
}

// La durada restringida a Hr: una pèrdua compta si es pot confirmar dins de Hr (T ≤ Hr − 250)
export const restricted = (r, Hr, every = 250) => (r.event && r.T <= Hr - every ? r.T : Hr);

// ---- La lectura de la sèrie

// Llegeix els JSONL de la carpeta i els valida contra el manifest. Retorna { worlds, problems }, amb cada món
// { id, group, t, origen: [resultat per llavor], canvi: [...] }. Si hi ha cap problema, no s'ha de calcular res.
export function readSeries(dir, manifest, { commit = null } = {}) {
  const problems = [];
  const files = readdirSync(dir).filter((f) => f.endsWith('.jsonl'));
  const expected = new Map(manifest.branches.map((b) => [`${b.name}.jsonl`, b]));
  for (const f of files) if (!expected.has(f)) problems.push(`${f}: no és cap branca del manifest`);
  for (const f of expected.keys()) if (!files.includes(f)) problems.push(`${f}: falta`);
  const worldsById = new Map(manifest.worlds.map((w) => [w.id, w]));
  const worlds = new Map(manifest.worlds.map((w) => [w.id, { id: w.id, group: w.group, t: w.t, origen: [], canvi: [] }]));
  for (const [f, b] of expected) {
    if (!files.includes(f)) continue;
    let records;
    try { records = readFileSync(join(dir, f), 'utf8').trim().split('\n').map((l) => JSON.parse(l)); }
    catch { problems.push(`${f}: no es pot llegir`); continue; }
    const w = worldsById.get(b.world);
    const bad = validateBranch(records, b, w, manifest, { commit });
    if (bad.length) { problems.push(...bad); continue; }
    const censuses = records.filter((r) => r.type === 'census');
    const result = { name: b.name, k: b.k, H: b.H, ...lossTime(censuses, w.t, b.H, manifest.rule) };
    const last = censuses[censuses.length - 1];
    const fams = last.families ?? [];
    const top = fams.length ? fams.reduce((a, c) => (c.share > a.share ? c : a)) : null;
    result.successor = top ? top.born > w.t + manifest.params.census.every : null;   // la família dominant al final és nova
    result.costs = costsByWindow(records, w.t);
    worlds.get(b.world)[b.cond][b.k] = result;
  }
  for (const w of worlds.values()) {
    const want = manifest.branches.filter((b) => b.world === w.id);
    for (const cond of ['origen', 'canvi']) {
      const n = want.filter((b) => b.cond === cond).length;
      if (w[cond].filter(Boolean).length !== n && !problems.length) problems.push(`${w.id}: falten branques de la condició ${cond}`);
    }
  }
  return { worlds: [...worlds.values()], problems };
}

// El cost: segons per època per trams de 500 èpoques des de t (les mesures porten els segons acumulats)
function costsByWindow(records, t, width = 500) {
  const m = records.filter((r) => r.type === 'measure');
  const at = (e) => m.find((r) => r.epoch === e);
  const out = [];
  for (let a = 0; ; a += width) {
    const x = a === 0 ? { seconds: 0 } : at(t + a), y = at(t + a + width);
    if (!x || !y) break;
    out.push((y.seconds - x.seconds) / width);
  }
  return out;
}

// ---- Les estimacions (protocol §6.1): el món com a unitat, la mitjana de les seves K branques

const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
export const worldMean = (w, cond, f, ks = null) => mean((ks ? ks.map((k) => w[cond][k]) : w[cond]).map(f));
// S(H): la proporció sense pèrdua fins a H
export const survival = (worlds, cond = 'origen') => mean(worlds.map((w) => worldMean(w, cond, (r) => (r.event ? 0 : 1))));
// La durada mitjana restringida, dividida per H (entre 0 i 1)
export const rmstShare = (worlds, cond = 'origen') => mean(worlds.map((w) => worldMean(w, cond, (r) => r.T / r.H)));
// La corba de supervivència en els censos: S(τ) = mitjana de mons de P(T > τ)
export function survivalCurve(worlds, cond = 'origen', every = 250) {
  const H = worlds[0][cond][0].H;
  const curve = [];
  for (let tau = every; tau <= H; tau += every) curve.push({ tau, s: mean(worlds.map((w) => worldMean(w, cond, (r) => (r.event && r.T <= tau ? 0 : 1)))) });
  const below = curve.find((c) => c.s <= 0.5);
  return { curve, median: below ? below.tau : null };
}

// ---- El bootstrap estratificat per origen i agrupat per món (protocol §6.1, AU2-58)

// Cada rèplica reextreu, amb reemplaçament, tants mons A com n'hi ha i tants B com n'hi ha; cada món s'hi
// emporta totes les seves branques. stat(mons) retorna un nombre. Sempre amb el generador v2 i la llavor donada.
export function bootstrap(worlds, stat, { reps, seed }) {
  const rng = makeRng(seed, 'v2');
  const strata = ['A', 'B'].map((g) => worlds.filter((w) => w.group === g)).filter((s) => s.length);
  const out = new Float64Array(reps);
  for (let r = 0; r < reps; r++) {
    const sample = [];
    for (const s of strata) for (let i = 0; i < s.length; i++) sample.push(s[(rng() * s.length) | 0]);
    out[r] = stat(sample);
  }
  return out;
}

// La normal estàndard: la distribució i la inversa (Acklam), prou precises per als intervals
const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
function erf(x) {
  const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a);
  return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a));
}
export function PhiInv(p) {
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  const lo = 0.02425;
  if (p < lo) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - lo) return -PhiInv(1 - p);
  const q = p - 0.5, r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}
const quantile = (sorted, q) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))))];

// L'interval d'una proporció θ ∈ [0, 1], amb tres mètodes candidats (protocol §6.1, AUD-84). Es triarà el que
// doni la cobertura més a prop del nominal a la simulació (eines/b2-cobertura.mjs). Si tots els mons donen el
// mateix (θ = 0 o 1, sense cap variació), el límit exacte de Clopper–Pearson amb els mons com a unitats.
export function interval(worlds, stat, { reps, seed, method, level = 0.95 }) {
  const theta = stat(worlds), alpha = 1 - level, n = worlds.length;
  const boot = bootstrap(worlds, stat, { reps, seed });
  const sorted = Float64Array.from(boot).sort();
  if (sorted[0] === sorted[sorted.length - 1]) {
    if (theta >= 1) return { theta, lo: (alpha / 2) ** (1 / n), hi: 1, method: 'exacte (cap variació)' };
    if (theta <= 0) return { theta, lo: 0, hi: 1 - (alpha / 2) ** (1 / n), method: 'exacte (cap variació)' };
    return { theta, lo: theta, hi: theta, method: 'cap variació' };
  }
  if (method === 'percentil') return { theta, lo: quantile(sorted, alpha / 2), hi: quantile(sorted, 1 - alpha / 2), method };
  if (method === 'logit') {
    const eps = 0.5 / (n * Math.max(...worlds.map((w) => w.origen.length + w.canvi.length)));
    const lg = (x) => { const y = Math.min(1 - eps, Math.max(eps, x)); return Math.log(y / (1 - y)); };
    const ls = Array.from(boot, lg), m = mean(ls), sd = Math.sqrt(mean(ls.map((x) => (x - m) ** 2)));
    const z = PhiInv(1 - alpha / 2), inv = (x) => 1 / (1 + Math.exp(-x));
    return { theta, lo: inv(lg(theta) - z * sd), hi: inv(lg(theta) + z * sd), method };
  }
  if (method === 'bca') {
    const less = boot.filter((x) => x < theta).length, eq = boot.filter((x) => x === theta).length;
    const z0 = PhiInv(Math.min(1 - 1e-9, Math.max(1e-9, (less + eq / 2) / reps)));
    const jack = worlds.map((_, i) => stat(worlds.filter((__, j) => j !== i)));
    const jm = mean(jack);
    const num = jack.reduce((s, x) => s + (jm - x) ** 3, 0), den = jack.reduce((s, x) => s + (jm - x) ** 2, 0);
    const a = den > 0 ? num / (6 * den ** 1.5) : 0;
    const adj = (zq) => Phi(z0 + (z0 + zq) / (1 - a * (z0 + zq)));
    return { theta, lo: quantile(sorted, adj(PhiInv(alpha / 2))), hi: quantile(sorted, adj(PhiInv(1 - alpha / 2))), method };
  }
  throw new Error(`mètode d'interval desconegut: ${method}`);
}

// ---- La prova confirmatòria (protocol §6.2): el canvi de règim

// D_i = durada restringida a Hr de la condició de canvi − la de la condició d'origen, amb les llavors del manifest
export function regimeDiffs(worlds, test, every = 250) {
  return worlds.map((w) => worldMean(w, 'canvi', (r) => restricted(r, test.horizon, every), test.seedsSwitch)
    - worldMean(w, 'origen', (r) => restricted(r, test.horizon, every), test.seedsOrigin));
}
const binom = (n, k) => { let r = 1; for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1); return r; };
// La prova de signes exacta sobre els mons amb D ≠ 0. H₁: la vida dura menys quan el món canvia (D < 0)
export function signTest(diffs, sided) {
  const neg = diffs.filter((d) => d < 0).length, pos = diffs.filter((d) => d > 0).length, n = neg + pos;
  const tail = (x) => { let s = 0; for (let k = x; k <= n; k++) s += binom(n, k); return s / 2 ** n; };   // P(X ≥ x)
  const p = n === 0 ? 1 : sided === 'unilateral' ? tail(neg) : Math.min(1, 2 * Math.min(tail(neg), tail(pos)));
  return { neg, pos, ties: diffs.length - n, p };
}

// ---- Els descriptius (protocol §6.3)

export function describe(worlds, test, every = 250) {
  const cell = (g, cond) => {
    const ws = worlds.filter((w) => w.group === g);
    if (!ws.length) return null;
    const ks = cond === 'origen' ? test.seedsOrigin : test.seedsSwitch;
    return {
      n: ws.length,
      s: mean(ws.map((w) => worldMean(w, cond, (r) => (r.event && r.T <= test.horizon - every ? 0 : 1), ks))),
      rmst: mean(ws.map((w) => worldMean(w, cond, (r) => restricted(r, test.horizon, every), ks))),
    };
  };
  const all = worlds.flatMap((w) => [...w.origen, ...w.canvi]);
  const multi = worlds.flatMap((w) => ['origen', 'canvi'].filter((c) => w[c].length > 1).map((c) => w[c]));
  return {
    cells: { A: { origen: cell('A', 'origen'), canvi: cell('A', 'canvi') }, B: { origen: cell('B', 'origen'), canvi: cell('B', 'canvi') } },
    concordance: multi.length ? multi.filter((rs) => rs.every((r) => r.event === rs[0].event)).length / multi.length : null,
    events: all.filter((r) => r.event).length, recovered: all.filter((r) => r.event && r.recovered).length,
    final1pct: all.filter((r) => r.final1pct).length, finalR2: all.filter((r) => r.finalR2).length, branches: all.length,
    successors: all.filter((r) => r.successor).length,
    costs: Array.from({ length: Math.max(0, ...all.map((r) => r.costs.length)) }, (_, i) => mean(all.map((r) => r.costs[i]).filter((x) => x !== undefined))),
  };
}

// ---- L'informe

const pct = (x) => `${(100 * x).toFixed(1)} %`;
export function analyse(worlds, manifest) {
  const { bootstrap: bs, test } = manifest, every = manifest.params.census.every;
  const lines = [];
  const S = interval(worlds, (ws) => survival(ws, 'origen'), { reps: bs.reps, seed: bs.seed, method: bs.interval, level: bs.level });
  const R = interval(worlds, (ws) => rmstShare(ws, 'origen'), { reps: bs.reps, seed: bs.seed + 1, method: bs.interval, level: bs.level });
  const Ho = manifest.branches.find((b) => b.cond === 'origen').H;
  const { curve, median } = survivalCurve(worlds, 'origen', every);
  lines.push(`La durada en el seu món (condició d'origen, ${worlds.length} mons, H = ${Ho}):`);
  lines.push(`  sense pèrdua fins a H: ${pct(S.theta)} (IC ${bs.level * 100} %: ${pct(S.lo)}–${pct(S.hi)}, ${S.method})`);
  lines.push(`  durada mitjana restringida: ${(R.theta * Ho).toFixed(0)} èpoques de ${Ho} (IC: ${(R.lo * Ho).toFixed(0)}–${(R.hi * Ho).toFixed(0)})`);
  lines.push(`  mediana: ${median === null ? 'no assolida' : `${median} èpoques`}`);
  lines.push(`  corba: ${curve.map((c) => `${c.tau}:${c.s.toFixed(3)}`).join(' ')}`);
  for (const g of ['A', 'B']) {
    const ws = worlds.filter((w) => w.group === g);
    if (ws.length) lines.push(`  origen ${g} (${ws.length} mons): sense pèrdua ${pct(survival(ws, 'origen'))}`);
  }
  const diffs = regimeDiffs(worlds, test, every);
  const st = signTest(diffs, test.sided);
  lines.push('', `El canvi de règim (horitzó ${test.horizon}, prova de signes ${test.sided}, α = ${test.alpha}):`);
  lines.push(`  mons on la vida dura menys amb el canvi: ${st.neg}; més: ${st.pos}; igual: ${st.ties}; p = ${st.p.toFixed(4)}`);
  const d = describe(worlds, test, every);
  lines.push('', 'Descriptius:');
  for (const g of ['A', 'B']) for (const c of ['origen', 'canvi']) {
    const x = d.cells[g][c];
    if (x) lines.push(`  ${g}, ${c} (m = ${conditionMixing(g, c)}): sense pèrdua fins a ${test.horizon} ${pct(x.s)}, durada restringida ${x.rmst.toFixed(0)}`);
  }
  lines.push(`  pèrdues: ${d.events} de ${d.branches} branques, de les quals es recuperen ${d.recovered}`);
  lines.push(`  al cens final: ${d.final1pct} amb l'1 % o més, ${d.finalR2} amb més de ${manifest.rule.lossMax}; la família dominant és nova a ${d.successors}`);
  if (d.concordance !== null) lines.push(`  les llavors coincideixen (pèrdua o no) en ${pct(d.concordance)} dels mons i condicions`);
  if (d.costs.length) lines.push(`  segons per època, per trams de 500: ${d.costs.map((x) => x.toFixed(2)).join(' ')}`);
  return { lines, S, R, signTest: st, rejected: st.p < test.alpha };
}
