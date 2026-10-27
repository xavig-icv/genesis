// La sèrie preregistrada de la maduració (docs/protocol-maduracio.md): la lectura i la validació dels registres de les
// branques, la prova i l'anàlisi. Només la carrega fase2/maduracio-confirmacio.mjs, després de comprovar el preregistre.
// eines/potencia-maduracio.mjs en fa servir la prova, per calcular la potència amb la mateixa.
//
// La mesura (§5): per a cada món i braç, el nombre de branques on la vida s'estableix dins de H (de 0 a K), amb el
// criteri de la llei 2 (fase2/census.js). Les dues proves (§6) comparen continue i shuffle-all amb reinit, món a món:
// la diferència d'un món és la dels seus nombres d'establiments, i la prova és la permutació de signes exacta sobre la
// suma de les diferències, unilateral, amb Holm. Les p es calculen amb enters exactes, i la decisió les compara amb els
// llindars sense cap arrodoniment.
//
// Els registres es validen com els del pilot (eines/maduracio-analisi.mjs), amb les funcions de la sèrie de B2: l'esquema
// sencer de cada línia, l'ordre exacta del manifest, els censos, les mesures i l'establiment recalculat. A més, el codi
// de cada registre ha de ser el commit del preregistre.
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { censusProblem, structureProblems } from './b2-serie.mjs';
import { EVENT_SHARE, EVENT_CENSUSES } from './census.js';
import { makeRng } from '../fase1/soup.js';

export const BOOTSTRAP = { reps: 10000, seed: 20261027 }; // els intervals per món (AU2-90): descriptius
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const START_KEYS = 'census,code,command,diffusion,epochs,event,every,flow,from,mixing,mutation,node,programs,radius,renewal,rng,seed,start,type,world,zlib';

// ---- El manifest i els registres

// Les branques del manifest (les escriu eines/pilot.mjs serie --prepara), amb el que se n'espera
export function expectedBranches(manifest) {
  const byWorld = new Map(manifest.worlds.map((w) => [w.world, w]));
  return manifest.branches.map((b) => {
    const w = byWorld.get(b.world), a = w.arms[b.arm];
    return { ...b, from: a.file, start: w.start, epochs: w.start + manifest.params.horizon, scan: a.scan };
  });
}

// Que el manifest sigui el de la sèrie i coherent amb ell mateix
export function manifestProblems(manifest) {
  const P = manifest?.params, t = manifest?.test, num = (x) => typeof x === 'number' && Number.isFinite(x);
  if (manifest?.pilot !== 'serie') return ['el manifest no és el de la sèrie de la maduració'];
  if (!P || !Array.isArray(P.arms) || !P.arms.length || !Array.isArray(P.continuation) || !P.continuation.length || !num(P.horizon) || P.stopAfterEvent !== 0 ||
    !Array.isArray(P.world) || P.world.length !== 2 || !num(P.radius) || P.rng !== 'v2' || !num(P.every) || !num(P.mutation) || !num(P.mixing) ||
    !P.census || !['version', 'every', 'sample', 'seed'].every((k) => k in P.census) || !P.cohort || !Number.isInteger(P.cohort.size)) return ["els paràmetres del manifest no tenen l'estructura esperada"];
  if (!t || !Array.isArray(t.contrasts) || !t.contrasts.length || !num(t.alpha) || t.method !== 'holm' || t.sided !== 'greater' ||
    t.contrasts.some((c) => !Array.isArray(c) || c.length !== 2 || c.some((a) => !P.arms.includes(a)))) return ["la prova del manifest no té l'estructura esperada"];
  if (!Array.isArray(manifest.worlds) || !Array.isArray(manifest.branches)) return ['el manifest no té els mons o les branques'];
  const out = [];
  const included = manifest.worlds.filter((w) => w.included === true);
  if (included.length !== P.cohort.size) out.push(`el manifest té ${included.length} mons inclosos, i la cohort n'ha de tenir ${P.cohort.size}`);
  for (const w of included) {
    for (const arm of P.arms) {
      const s = w.arms?.[arm]?.scan;
      if (!s || !Number.isInteger(s.heritable) || !Number.isInteger(s.heritableSolo) || !(s.cells > 0) || typeof w.arms[arm].file !== 'string') out.push(`${w.world}: el braç ${arm} no té la captura o l'escaneig del punt de partida`);
    }
  }
  const want = included.flatMap((w) => P.arms.flatMap((arm) => P.continuation.map(([tag]) => `${w.world}-${arm}-${tag}`)));
  const ids = manifest.branches.map((b) => b.id);
  if (!same([...ids].sort(), [...want].sort()) || new Set(ids).size !== ids.length) out.push('les branques del manifest no són els mons inclosos × els braços × les llavors');
  if (manifest.branches.some((b) => typeof b.command !== 'string' || !b.command.startsWith('node sim.mjs '))) out.push("hi ha branques sense l'ordre de sim.mjs");
  return out;
}

// Els problemes d'un registre de branca (buit si és correcte). Una branca acaba a l'horitzó sense establiment, o al cens
// que el confirma. Un manifest o un registre sense l'estructura esperada són un problema, no una excepció
export function branchProblems(records, b, manifest, commit) {
  try { return recordProblems(records, b, manifest, commit); } catch (e) { return [`${b.id}: el registre no té l'estructura esperada (${e.message})`]; }
}
function recordProblems(records, b, manifest, commit) {
  const P = manifest.params, problems = [], p = (m) => problems.push(`${b.id}: ${m}`);
  if (!records.length || records[0]?.type !== 'start') return [`${b.id}: no comença amb la línia d'inici`];
  const s = records[0];
  if (Object.keys(s).sort().join(',') !== START_KEYS) p("la línia d'inici no té els camps esperats");
  if (!(commit && typeof s.code === 'string' && /^[0-9a-f]{7,40}$/.test(s.code) && commit.startsWith(s.code))) p(`el codi és ${s.code}, no el del preregistre`);
  const expect = {
    seed: b.seed, from: b.from, start: b.start, epochs: b.epochs, command: b.command, mixing: P.mixing, world: P.world, programs: P.world[0] * P.world[1],
    radius: P.radius, rng: P.rng, every: P.every, mutation: P.mutation, diffusion: 0, flow: 0, renewal: 0, census: P.census,
    event: { share: EVENT_SHARE, censuses: EVENT_CENSUSES, stopAfter: P.stopAfterEvent },
  };
  for (const [k, v] of Object.entries(expect)) if (!same(s[k], v)) p(`${k} és ${JSON.stringify(s[k])}, i el manifest diu ${JSON.stringify(v)}`);
  for (const k of ['node', 'zlib']) if (typeof s[k] !== 'string' || !s[k]) p(`${k} no és un text`);
  const end = records[records.length - 1];
  if (end?.type !== 'end') return [...problems, `${b.id}: no acaba amb la línia final (incomplet)`];
  if (records.filter((r) => r.type === 'start').length !== 1 || records.filter((r) => r.type === 'end').length !== 1) p("té més d'una línia d'inici o de final");
  if (!(Number.isInteger(end.epoch) && end.epoch > b.start && end.epoch <= b.epochs)) return [...problems, `${b.id}: la línia final és a l'època ${end.epoch}, fora de la branca`];
  const cs = records.filter((r) => r.type === 'census'), want = [];
  for (let e = b.start + P.census.every; e <= end.epoch; e += P.census.every) want.push(e);
  if (!same(cs.map((c) => c.epoch), want)) p(`els censos no són exactament els de cada ${P.census.every} èpoques fins a l'època ${end.epoch}`);
  for (const c of cs) {
    const bad = censusProblem(c, P.census);
    if (bad) { p(`el cens de l'època ${c.epoch} no és vàlid: ${bad}`); break; }
  }
  structureProblems(records, b.start, end.epoch - b.start, P).forEach(p);
  const ev = records.find((r) => r.type === 'event');
  if (end.reason === 'horitzó') {
    if (end.epoch !== b.epochs || ev) p(`acaba per l'horitzó a l'època ${end.epoch}, i hauria de ser a ${b.epochs} sense establiment`);
  } else if (end.reason === 'establiment') {
    if (!ev || end.epoch !== ev.confirmed) p(`acaba per l'establiment a l'època ${end.epoch}, que no és la del cens que el confirma`);
  } else p(`acaba per "${end.reason}", que no és ni l'horitzó ni l'establiment`);
  return problems;
}

// La lectura d'una branca. T és l'època de l'establiment (el primer dels dos censos) des del començament
export function branchMeasures(records, b) {
  const cs = records.filter((r) => r.type === 'census'), ev = records.find((r) => r.type === 'event'), end = records[records.length - 1];
  const first = (f) => { const c = cs.find(f); return c ? c.epoch - b.start : null; };
  return {
    established: Boolean(ev), T: ev ? ev.epoch - b.start : null, epochs: end.epoch - b.start,
    firstHeritable: first((c) => c.heritable > 0), firstSolo: first((c) => c.heritableSolo > 0),
    seconds: end.seconds, node: records[0].node,
  };
}

// Llegeix i valida totes les branques. Retorna { branches, problems }
export function readSeries(folder, manifest, { commit } = {}) {
  const problems = manifestProblems(manifest), branches = [];
  if (problems.length) return { branches, problems };
  for (const b of expectedBranches(manifest)) {
    const f = join(folder, `${b.id}.jsonl`);
    if (!existsSync(f)) { problems.push(`${b.id}: no hi ha el registre`); continue; }
    let records;
    try { records = readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l)); } catch { problems.push(`${b.id}: el registre no es pot llegir`); continue; }
    const bad = branchProblems(records, b, manifest, commit);
    if (bad.length) { problems.push(...bad); continue; }
    branches.push({ ...b, ...branchMeasures(records, b) });
  }
  return { branches, problems };
}

// ---- La prova (§6)

// Els coeficients binomials C(m, j), exactes
function binomials(m) {
  const c = [1n];
  for (let j = 0; j < m; j++) c.push((c[j] * BigInt(m - j)) / BigInt(j + 1));
  return c;
}
// La permutació de signes exacta, unilateral: sota H0, cada diferència té el mateix valor absolut i un signe a l'atzar, i
// la p és la proporció de les 2^m assignacions de signes (m, els mons amb diferència) amb una suma igual o més gran que
// l'observada. La distribució de la suma es fa per convolució, amb enters exactes. Els mons sense diferència no hi compten.
// Retorna { count, total, p, sum, m, pos, neg, ties }: la p exacta és count / total
export function signFlipTest(diffs) {
  if (!diffs.every(Number.isInteger)) throw new Error('les diferències han de ser enters');
  const sum = diffs.reduce((a, b) => a + b, 0), counts = new Map();
  for (const d of diffs) if (d) counts.set(Math.abs(d), (counts.get(Math.abs(d)) ?? 0) + 1);
  const m = diffs.filter((d) => d !== 0).length, tot = [...counts].reduce((a, [v, k]) => a + v * k, 0);
  let dist = new Array(2 * tot + 1).fill(0n);
  dist[tot] = 1n;
  for (const [v, k] of counts) {
    const c = binomials(k), next = new Array(2 * tot + 1).fill(0n);
    for (let i = 0; i < dist.length; i++) {
      if (!dist[i]) continue;
      for (let j = 0; j <= k; j++) next[i + v * (2 * j - k)] += dist[i] * c[j];
    }
    dist = next;
  }
  let count = 0n;
  for (let i = Math.max(0, sum + tot); i < dist.length; i++) count += dist[i];
  const total = 1n << BigInt(m);
  return { count, total, p: Number(count) / Number(total), sum, m, pos: diffs.filter((d) => d > 0).length, neg: diffs.filter((d) => d < 0).length, ties: diffs.filter((d) => d === 0).length };
}

// Una fracció exacta d'un llindar decimal (α = 0,025 és 25 / 1.000): [numerador, denominador]
const fraction = (x) => { const d = 10n ** 9n; return [BigInt(Math.round(x * 1e9)), d]; };
// count / total ≤ num / (den · k), sense arrodonir
const atMost = (r, [num, den], k) => r.count * den * BigInt(k) <= num * r.total;
// La correcció de Holm, amb les p exactes: la més petita amb α / n, la següent amb α / (n − 1)... fins a la primera que no
// es rebutja. Les p iguals es tracten en l'ordre de les proves
export function holm(results, alpha) {
  const a = fraction(alpha), n = results.length;
  const order = results.map((_, i) => i).sort((i, j) => {
    const x = results[i].count * results[j].total, y = results[j].count * results[i].total;
    return x < y ? -1 : x > y ? 1 : i - j;
  });
  const out = results.map(() => ({ rejected: false, threshold: null }));
  let open = true;
  order.forEach((i, rank) => {
    out[i].threshold = alpha / (n - rank);
    if (open && atMost(results[i], a, n - rank)) out[i].rejected = true; else open = false;
  });
  return out;
}

// ---- Els descriptius (§5)

const mean = (v) => v.reduce((a, b) => a + b, 0) / v.length;
// la mediana, amb el criteri del projecte: amb un nombre parell, la mitjana dels dos valors del mig (AUD-123)
export const median = (v) => { const s = [...v].sort((a, b) => a - b), h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
export function pearson(x, y) {
  const mx = mean(x), my = mean(y);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null;
}
// L'interval exacte de Clopper-Pearson d'una proporció k / n, del 95 %, per bisecció sobre la distribució binomial
const lf = [0];
const logFact = (n) => { for (let i = lf.length; i <= n; i++) lf.push(lf[i - 1] + Math.log(i)); return lf[n]; };
function binomCdf(k, n, p) { // P(X ≤ k)
  if (k < 0) return 0;
  if (k >= n) return 1;
  if (p <= 0) return 1;
  if (p >= 1) return 0;
  let s = 0;
  for (let i = 0; i <= k; i++) s += Math.exp(logFact(n) - logFact(i) - logFact(n - i) + i * Math.log(p) + (n - i) * Math.log1p(-p));
  return Math.min(1, s);
}
export function clopperPearson(k, n, level = 0.95) {
  const a = (1 - level) / 2, bisect = (f) => { let lo = 0, hi = 1; for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (f(mid)) hi = mid; else lo = mid; } return (lo + hi) / 2; };
  const lower = k === 0 ? 0 : bisect((p) => 1 - binomCdf(k - 1, n, p) >= a);
  const upper = k === n ? 1 : bisect((p) => binomCdf(k, n, p) <= a);
  return [lower, upper];
}
// El bootstrap per món: es tornen a mostrejar mons sencers, amb els seus braços. Retorna l'interval de percentils del 95 %
export function worldBootstrap(units, stat, { reps = BOOTSTRAP.reps, seed = BOOTSTRAP.seed } = {}) {
  const rng = makeRng(seed, 'v2'), out = new Float64Array(reps), n = units.length, sample = new Array(n);
  for (let r = 0; r < reps; r++) {
    for (let i = 0; i < n; i++) sample[i] = units[(rng() * n) | 0];
    out[r] = stat(sample);
  }
  out.sort();
  return [out[Math.floor(0.025 * reps)], out[Math.ceil(0.975 * reps) - 1]];
}
// La concordança entre les llavors d'un món i un braç: rho, la correlació intraclasse amb la mitjana de cada braç (la de
// la potència), i, per braç, la phi de les dues primeres llavors
export function seedConcordance(pairsByArm) {
  let num = 0, den = 0;
  const perArm = pairsByArm.map(({ arm, pairs }) => {
    const p = mean(pairs.flat());
    for (const v of pairs) for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) { num += (v[i] - p) * (v[j] - p); den += p * (1 - p); }
    return { arm, agree: pairs.filter((v) => v.every((x) => x === v[0])).length, n: pairs.length, phi: pearson(pairs.map((x) => x[0]), pairs.map((x) => x[1])) };
  });
  return { perArm, rho: den > 0 ? num / den : null };
}

const pct = (x) => `${(100 * x).toFixed(1)} %`;
const nm = (n) => `${n} ${n === 1 ? 'món' : 'mons'}`;
const pts =(x) => `${x >= 0 ? '+' : '−'}${Math.abs(100 * x).toFixed(1)} punts`;
const ep = (x) => (x === null ? '—' : String(Math.round(x)));
const fmt = (x, d = 2) => (x === null ? '—' : x.toFixed(d));
const pText = (r) => (r.p < 1e-4 ? r.p.toExponential(2) : r.p.toFixed(4));

// L'anàlisi: les dues proves i els descriptius predefinits. branches, les de readSeries
export function analyse(branches, manifest) {
  const P = manifest.params, t = manifest.test, H = P.horizon, arms = P.arms, tags = P.continuation.map(([x]) => x), lines = [];
  const byWorld = new Map(manifest.worlds.map((w) => [w.world, w]));
  const worlds = manifest.worlds.filter((w) => w.included).map((w) => w.world);
  const of = new Map(branches.map((b) => [`${b.world} ${b.arm} ${b.tag}`, b]));
  const bs = (w, arm) => tags.map((tag) => of.get(`${w} ${arm} ${tag}`));
  const n = (w, arm) => bs(w, arm).filter((b) => b.established).length;
  const units = worlds.map((w) => Object.fromEntries(arms.map((a) => [a, n(w, a)])));
  const rate = (sample, arm) => mean(sample.map((u) => u[arm])) / tags.length;
  const K = tags.length, branchesPerArm = worlds.length * K;

  lines.push(`La mesura: l'establiment dins de H = ${H} èpoques (el criteri de la llei 2), a ${worlds.length} mons, amb ${K} llavors per braç.`);
  for (const arm of arms) {
    const k = units.reduce((a, u) => a + u[arm], 0), [lo, hi] = clopperPearson(k, branchesPerArm), [blo, bhi] = worldBootstrap(units, (s) => rate(s, arm));
    lines.push(`  ${arm}: ${k} de ${branchesPerArm} branques (${pct(k / branchesPerArm)}); IC del 95 %: de Clopper-Pearson ${pct(lo)}–${pct(hi)} (branques independents), del bootstrap per món ${pct(blo)}–${pct(bhi)}; ` +
      `mons amb algun establiment ${units.filter((u) => u[arm] > 0).length}, amb totes les llavors ${units.filter((u) => u[arm] === K).length}`);
  }

  // les dues proves
  const results = t.contrasts.map(([a, b]) => {
    const d = units.map((u) => u[a] - u[b]);
    return { a, b, ...signFlipTest(d), ka: units.reduce((s, u) => s + u[a], 0), kb: units.reduce((s, u) => s + u[b], 0), branches: branchesPerArm, worlds: worlds.length, diff: worldBootstrap(units, (s) => rate(s, a) - rate(s, b)) };
  });
  holm(results, t.alpha).forEach((h, i) => Object.assign(results[i], h));
  lines.push('');
  lines.push(`Les proves (la permutació de signes exacta, unilateral, sobre la suma de les diferències de cada món; Holm, α = ${t.alpha} per a la família):`);
  results.forEach((r, i) => {
    const sizes = [1, 2, 3, 4].filter((v) => v <= K).map((v) => `${v}: ${units.filter((u) => u[r.a] - u[r.b] === v).length} a favor i ${units.filter((u) => u[r.a] - u[r.b] === -v).length} en contra`).join(', ');
    lines.push(`  Prova ${i + 1}, ${r.a} contra ${r.b}: ${r.ka} contra ${r.kb} establiments de ${r.branches}; la diferència dels ritmes ${pts((r.ka - r.kb) / r.branches)} (IC del bootstrap per món ${pts(r.diff[0])} a ${pts(r.diff[1])}).`);
    lines.push(`    Món a món: més alt amb ${r.a} a ${nm(r.pos)}, més baix a ${r.neg}, iguals ${r.ties}; per la mida de la diferència, ${sizes}. Suma ${r.sum}, amb ${nm(r.m)} amb diferència.`);
    lines.push(`    p = ${pText(r)} (exacta: ${r.count} de ${r.total} assignacions de signes); llindar de Holm ${r.threshold}; ${r.rejected ? 'es rebutja H0' : 'no es rebutja H0'}`);
  });

  lines.push('');
  lines.push('Descriptius:');
  for (const [a, b] of t.descriptive ?? []) {
    const d = units.map((u) => u[a] - u[b]), [lo, hi] = worldBootstrap(units, (s) => rate(s, a) - rate(s, b));
    lines.push(`  ${a} contra ${b}, sense cap prova ni cap afirmació d'equivalència: la diferència dels ritmes ${pts(mean(d) / K)} (IC del bootstrap per món ${pts(lo)} a ${pts(hi)}); ` +
      `més alt amb ${a} a ${nm(d.filter((x) => x > 0).length)}, més baix a ${d.filter((x) => x < 0).length}, iguals ${d.filter((x) => x === 0).length}`);
  }
  lines.push("  El punt de partida de cada braç (l'escaneig de totes les cel·les del manifest; mediana i rang de les que es repliquen, i les hereditàries):");
  for (const arm of arms) {
    const sc = worlds.map((w) => byWorld.get(w).arms[arm].scan), rep = sc.map((s) => s.replicating);
    const her = sc.reduce((a, s) => a + s.heritable, 0), solo = sc.reduce((a, s) => a + s.heritableSolo, 0);
    lines.push(`    ${arm}: es repliquen ${ep(median(rep))} (${Math.min(...rep)}–${Math.max(...rep)}); hereditàries ${her}, a ${nm(sc.filter((s) => s.heritable > 0).length)} (soles ${solo}, a ${nm(sc.filter((s) => s.heritableSolo > 0).length)}; només en context ${her - solo})`);
  }
  lines.push("  Els establiments separats pel punt de partida del braç, alguna hereditària sola o cap (una partició dels mons tal com són, no un efecte):");
  for (const arm of arms) {
    const solo = (w) => byWorld.get(w).arms[arm].scan.heritableSolo > 0;
    const part = (ws) => { const k = ws.reduce((a, w) => a + n(w, arm), 0); return ws.length ? `${k} de ${ws.length * K} (${pct(k / (ws.length * K))})` : '—'; };
    const withSolo = worlds.filter(solo), without = worlds.filter((w) => !solo(w));
    lines.push(`    ${arm}: amb alguna (${nm(withSolo.length)}) ${part(withSolo)}; sense cap (${nm(without.length)}) ${part(without)}`);
  }
  lines.push(`  El temps: la RMST (la mitjana de T restringida a H, amb totes les branques) i la mediana de T de les branques establertes, que no diu que un braç sigui més ràpid:`);
  for (const arm of arms) {
    const all = worlds.flatMap((w) => bs(w, arm)), Ts = all.filter((b) => b.established).map((b) => b.T);
    lines.push(`    ${arm}: RMST ${ep(mean(all.map((b) => (b.established ? b.T : H))))} èpoques; T de les establertes, mediana ${ep(Ts.length ? median(Ts) : null)}`);
  }
  const conc = seedConcordance(arms.map((arm) => ({ arm, pairs: worlds.map((w) => bs(w, arm).map((b) => (b.established ? 1 : 0))) })));
  lines.push(`  La concordança entre llavors: rho = ${fmt(conc.rho)} (la correlació intraclasse, amb la mitjana de cada braç)`);
  for (const c of conc.perArm) lines.push(`    ${c.arm}: totes les llavors coincideixen a ${c.agree} de ${nm(c.n)}; phi ${fmt(c.phi)}`);
  lines.push('  Entre braços, la correlació entre mons dels nombres d\'establiments:');
  for (let i = 0; i < arms.length; i++) for (let j = i + 1; j < arms.length; j++) lines.push(`    ${arms[i]} · ${arms[j]}: ${fmt(pearson(units.map((u) => u[arms[i]]), units.map((u) => u[arms[j]])))}`);
  lines.push('  El primer cens amb algun hereditari, des del començament (mediana de les branques que en tenen):');
  for (const arm of arms) {
    const all = worlds.flatMap((w) => bs(w, arm)), any = all.filter((b) => b.firstHeritable !== null), solo = all.filter((b) => b.firstSolo !== null);
    lines.push(`    ${arm}: qualsevol, ${ep(any.length ? median(any.map((b) => b.firstHeritable)) : null)} èpoques (${any.length} de ${all.length} branques); sol, ${ep(solo.length ? median(solo.map((b) => b.firstSolo)) : null)} èpoques (${solo.length} de ${all.length})`);
  }
  const hours = (x) => x.reduce((a, b) => a + b.seconds, 0) / 3600;
  lines.push(`  El cost: ${hours(branches).toFixed(1)} h de branques (la suma dels temps de cada una, amb les altres corrent alhora)`);
  for (const arm of arms) { const x = branches.filter((b) => b.arm === arm); lines.push(`    ${arm}: ${hours(x).toFixed(1)} h; per branca, ${(hours(x) / x.length).toFixed(2)} h de mitjana`); }
  for (const node of [...new Set(branches.map((b) => b.node))].sort()) {
    const x = branches.filter((b) => b.node === node);
    lines.push(`    Node ${node}: ${x.length} branques; mediana ${fmt(median(x.map((b) => (1000 * b.seconds) / b.epochs)), 0)} s per 1.000 èpoques`);
  }
  lines.push('');
  lines.push(`Els establiments de cada món (${arms.join(', ')}):`);
  for (let i = 0; i < worlds.length; i += 10) lines.push('  ' + worlds.slice(i, i + 10).map((w, j) => `${w} ${arms.map((a) => units[i + j][a]).join('')}`).join(' · '));
  return { results, lines };
}

// Les frases de les decisions (§6): diuen el que posa a prova cada prova, el ritme, i l'abast de l'afirmació
export function decisionLines({ results }) {
  const what = (a) => (a === 'continue' ? 'si es conserva la sopa envellida' : a === 'shuffle-all' ? "si es conserva l'histograma de bytes de la sopa envellida, barrejat," : `amb ${a}`);
  const scope = (a) => (a === 'continue' ? "És l'efecte total de conservar la sopa d'aquests mons, no d'un mecanisme concret" : a === 'shuffle-all' ? "Inclou el que la barreja crea a l'instant, com els replicadors del començament: no aïlla la composició" : 'No aïlla cap mecanisme');
  return results.map((r, i) => {
    const counts = `${r.ka} de ${r.branches} branques contra ${r.kb}; p = ${pText(r)}, llindar de Holm ${r.threshold}`;
    if (r.rejected) {
      return `DECISIÓ ${i + 1} (${r.a} contra ${r.b}): es rebutja H0. A la cohort (mons quiets sense vida a l'època 8.000, sense cap cel·la hereditària), la vida s'hi estableix més sovint en les 8.000 èpoques següents ${what(r.a)} que amb una sopa nova (${counts}). ${scope(r.a)}.`;
    }
    const minimum = 2 ** -r.m > r.threshold ? ` Amb ${nm(r.m)} amb diferència, la p més petita possible era ${(2 ** -r.m).toFixed(4)}: la prova no es podia rebutjar.` : '';
    return `DECISIÓ ${i + 1} (${r.a} contra ${r.b}): no es rebutja H0: no concloent. La prova no permet afirmar que, a la cohort, la vida s'hi estableixi més sovint ${what(r.a)} que amb una sopa nova (${counts}). No vol dir que s'hi estableixi igual.${minimum}`;
  });
}
