// La prova preregistrada dels zeros (docs/protocol-zeros.md): la lectura i la validació dels registres de les branques,
// i l'anàlisi. Només la carrega fase2/zeros-confirmacio.mjs, després de comprovar el preregistre.
//
// La mesura principal (auditoria 16, AUD-116) és g = h₁ / h₀, la vida del primer cens de la branca (t + 250) respecte
// de la que hi havia al començament del mateix braç:
//   - h₁, la proporció d'hereditaris al primer cens. Aquest cens té la mateixa mostra de cel·les a tots els braços,
//     perquè el cens té una llavor fixa i és la primera vegada que se'n fa servir l'atzar. El valor d'un món i un braç
//     és la mitjana de les seves llavors de continuació;
//   - h₀, la proporció d'hereditaris de l'escaneig de totes les cel·les de la captura del braç (eines/transforma.mjs
//     --scan), feta abans del preregistre i desada al manifest.
// El món és la unitat. Els registres es validen amb les funcions de la sèrie de B2 (AU2-83, AUD-117): l'esquema
// sencer de cada línia, l'ordre, totes les mesures, els invariants del cens i l'establiment, recalculat amb els censos.
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { startProblems, censusProblem, structureProblems } from './b2-serie.mjs';

export const LOSS_MAX = 5; // la regla R2: 5 hereditaris o menys, de 2.048, en dos censos seguits
export const RECOVER_MIN = 21; // la recuperació: l'1 % de 2.048
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const mean = (v) => v.reduce((a, b) => a + b, 0) / v.length;

// Les branques del manifest (les escriu eines/pilot.mjs --prepara), amb el que se n'espera
export function expectedBranches(manifest) {
  const byWorld = new Map(manifest.worlds.map((w) => [w.world, w]));
  return manifest.branches.map((b) => {
    const w = byWorld.get(b.world);
    return { ...b, role: w.role, from: w.arms[b.arm].file, start: w.start, epochs: w.start + manifest.params.horizon };
  });
}

// Que el manifest sigui coherent amb ell mateix: cada món inclòs, tots els braços amb el seu escaneig, i totes les
// branques (els mons × els braços × les llavors), sense cap de repetida
export function manifestProblems(manifest) {
  const out = [], p = (m) => out.push(m), P = manifest?.params;
  // l'estructura: els paràmetres i la prova que fan servir la validació i l'anàlisi
  const num = (x) => typeof x === 'number' && Number.isFinite(x);
  if (!P || !Array.isArray(P.arms) || !P.arms.length || !Array.isArray(P.continuation) || !P.continuation.length || !num(P.horizon) || !num(P.mixing) ||
    !Array.isArray(P.world) || P.world.length !== 2 || !num(P.radius) || P.rng !== 'v2' || !num(P.every) || !num(P.mutation) ||
    !P.census || !['version', 'every', 'sample', 'seed'].every((k) => k in P.census)) return ["els paràmetres del manifest no tenen l'estructura esperada"];
  const t = manifest.test;
  if (!t || !Array.isArray(t.contrasts) || !t.contrasts.length || !num(t.alpha)) return ["la prova del manifest no té l'estructura esperada"];
  if (!Array.isArray(manifest.worlds) || !Array.isArray(manifest.branches)) return ['el manifest no té els mons o les branques'];
  if (manifest.branches.some((b) => typeof b.command !== 'string' || !b.command.startsWith('node sim.mjs '))) p("hi ha branques sense l'ordre de sim.mjs");
  const included = manifest.worlds.filter((w) => w.included);
  if (!included.length) p('el manifest no té cap món inclòs');
  if (!included.some((w) => w.role === 'prova')) p('el manifest no té cap món de prova');
  for (const w of included) {
    for (const arm of P.arms) {
      const s = w.arms?.[arm]?.scan;
      if (!s || !Number.isInteger(s.heritable) || !Number.isInteger(s.heritableSolo) || !(s.cells > 0)) p(`${w.world}: el braç ${arm} no té l'escaneig del punt de partida`);
      else if (w.role === 'prova' && (s.heritable === 0 || s.heritableSolo === 0)) p(`${w.world}: el punt de partida del braç ${arm} és 0`);
    }
  }
  const want = included.flatMap((w) => P.arms.flatMap((arm) => P.continuation.map(([tag]) => `${w.world}-${arm}-${tag}`)));
  const ids = (manifest.branches ?? []).map((b) => b.id);
  if (!same([...ids].sort(), [...want].sort())) p('les branques del manifest no són els mons inclosos × els braços × les llavors');
  if (new Set(ids).size !== ids.length) p('hi ha branques repetides al manifest');
  return out;
}

// Els problemes d'un registre de branca, contra el manifest (buit si és correcte). El mateix que la validació de B2
// (fase2/b2-serie.mjs, validateBranch), amb l'ordre exacta de la branca del manifest. Un manifest o un registre sense
// l'estructura esperada són un problema, no una excepció
export function branchProblems(records, b, manifest, commit) {
  const m = manifestProblems(manifest).filter((x) => /estructura|branques sense/.test(x));
  if (m.length) return m.map((x) => `${b.id}: ${x}`);
  try { return recordProblems(records, b, manifest, commit); } catch (e) { return [`${b.id}: el registre no té l'estructura esperada (${e.message})`]; }
}
function recordProblems(records, b, manifest, commit) {
  const problems = [], P = manifest.params, p = (m) => problems.push(`${b.id}: ${m}`);
  if (!records.length || records[0].type !== 'start') return [`${b.id}: no comença amb la línia d'inici`];
  const s = records[0];
  if (!(commit && typeof s.code === 'string' && s.code.length >= 7 && !s.code.includes('+') && commit.startsWith(s.code))) p(`el codi és ${s.code}, no el del preregistre`);
  const expect = {
    seed: b.seed, mixing: P.mixing, from: b.from, start: b.start, epochs: b.epochs,
    world: P.world, radius: P.radius, rng: P.rng, every: P.every, mutation: P.mutation, diffusion: 0, flow: 0, renewal: 0,
  };
  for (const [k, v] of Object.entries(expect)) if (!same(s[k], v)) p(`${k} és ${JSON.stringify(s[k])}, i el manifest diu ${JSON.stringify(v)}`);
  for (const k of ['version', 'every', 'sample', 'seed']) if (!s.census || s.census[k] !== P.census[k]) p(`el cens (${k}) no és el del manifest`);
  startProblems(s, P).forEach(p);
  if (s.command !== b.command) p("l'ordre no és la del manifest");
  const end = records[records.length - 1];
  if (end.type !== 'end') p('no acaba amb la línia final (incomplet)');
  else if (end.epoch !== b.epochs || end.reason !== 'horitzó') p(`acaba a l'època ${end.epoch} (${end.reason}), no a ${b.epochs} per l'horitzó`);
  if (records.filter((r) => r.type === 'start').length !== 1 || records.filter((r) => r.type === 'end').length !== 1) p("té més d'una línia d'inici o de final");
  const cs = records.filter((r) => r.type === 'census');
  const want = [];
  for (let e = b.start + P.census.every; e <= b.epochs; e += P.census.every) want.push(e);
  if (!same(cs.map((c) => c.epoch), want)) p(`els censos no són exactament els de cada ${P.census.every} èpoques de ${want[0]} a ${want[want.length - 1]}`);
  for (const c of cs) {
    const bad = censusProblem(c, P.census);
    if (bad) { p(`el cens de l'època ${c.epoch} no és vàlid: ${bad}`); break; }
  }
  structureProblems(records, b.start, P.horizon, P).forEach(p);
  return problems;
}

// La lectura d'una branca: la mesura principal i les secundàries
export function branchMeasures(records, b) {
  const cs = records.filter((r) => r.type === 'census');
  const share = (c) => c.heritable / c.sample;
  let loss = null, recovered = false;
  for (let i = 0; i + 1 < cs.length; i++) {
    if (cs[i].heritable <= LOSS_MAX && cs[i + 1].heritable <= LOSS_MAX) {
      loss = cs[i].epoch - b.start;
      recovered = cs.slice(i + 2).some((c) => c.heritable >= RECOVER_MIN);
      break;
    }
  }
  return {
    h1: share(cs[0]), h1solo: cs[0].heritableSolo / cs[0].sample,
    h234: (share(cs[1]) + share(cs[2]) + share(cs[3])) / 3,
    loss, recovered, final: share(cs[cs.length - 1]),
  };
}

// Llegeix i valida totes les branques. Retorna { worlds, problems }; worlds: world → { role, arms: { arm → [mesures] } }
export function readSeries(folder, manifest, { commit } = {}) {
  const problems = manifestProblems(manifest), worlds = new Map();
  if (problems.length) return { worlds, problems };
  for (const b of expectedBranches(manifest)) {
    const f = join(folder, `${b.id}.jsonl`);
    if (!existsSync(f)) { problems.push(`${b.id}: no hi ha el registre`); continue; }
    let records;
    try { records = readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l)); }
    catch { problems.push(`${b.id}: el registre no es pot llegir`); continue; }
    let bad;
    try { bad = branchProblems(records, b, manifest, commit); } catch (e) { bad = [`${b.id}: el registre no té l'estructura esperada (${e.message})`]; }
    if (bad.length) { problems.push(...bad); continue; }
    if (!worlds.has(b.world)) worlds.set(b.world, { role: b.role, arms: {} });
    (worlds.get(b.world).arms[b.arm] ??= []).push(branchMeasures(records, b));
  }
  return { worlds, problems };
}

// La prova de signes exacta, unilateral: P(X ≥ pos) amb n = pos + neg i p = 1/2
export function signTest(pos, neg) {
  const n = pos + neg;
  if (!n) return 1;
  let s = 0, c = 1;
  for (let k = 0; k <= n; k++) { if (k >= pos) s += c; c = (c * (n - k)) / (k + 1); }
  return s / 2 ** n;
}

// La correcció de Holm amb dues proves: la p més petita amb α/2, i l'altra amb α només si la primera es rebutja
export function holm(ps, alpha) {
  const order = ps.map((p, i) => [p, i]).sort((a, b) => a[0] - b[0]);
  const out = ps.map(() => ({ rejected: false, threshold: null }));
  let open = true;
  order.forEach(([p, i], rank) => {
    const threshold = alpha / (ps.length - rank);
    out[i].threshold = threshold;
    if (open && p <= threshold) out[i].rejected = true; else open = false;
  });
  return out;
}

const pct = (x) => `${(100 * x).toFixed(1)} %`;
const signs = (d) => ({ pos: d.filter((x) => x > 0).length, neg: d.filter((x) => x < 0).length, ties: d.filter((x) => x === 0).length });

export function analyse(worlds, manifest) {
  const t = manifest.test, P = manifest.params, lines = [];
  const byWorld = new Map(manifest.worlds.map((w) => [w.world, w]));
  const scan = (id, arm) => byWorld.get(id).arms[arm].scan;
  const h0 = (id, arm, solo) => (solo ? scan(id, arm).heritableSolo : scan(id, arm).heritable) / scan(id, arm).cells;
  const h1 = (w, arm, solo) => mean(w.arms[arm].map((m) => (solo ? m.h1solo : m.h1)));
  const g = (id, w, arm, solo = false) => h1(w, arm, solo) / h0(id, arm, solo);
  const test = [...worlds].filter(([, w]) => w.role === 'prova'), controls = [...worlds].filter(([, w]) => w.role !== 'prova');
  lines.push(`La mesura principal, g = h₁ / h₀: la vida del primer cens (h₁, mitjana de les llavors) respecte de la del començament del braç (h₀, l'escaneig de totes les cel·les):`);
  for (const [id, w] of [...test, ...controls]) {
    lines.push(`  ${id} (${w.role}): ` + P.arms.map((a) => `${a} h₀ ${pct(h0(id, a))}, h₁ ${pct(h1(w, a))}, g ${g(id, w, a).toFixed(3)}`).join(' · '));
  }
  const results = t.contrasts.map(([a, b]) => {
    const d = test.map(([id, w]) => g(id, w, a) - g(id, w, b));
    const s = signs(d);
    return { a, b, ...s, p: signTest(s.pos, s.neg), n: test.length };
  });
  holm(results.map((r) => r.p), t.alpha).forEach((h, i) => Object.assign(results[i], h));
  lines.push('');
  results.forEach((r, i) => lines.push(`Prova ${i + 1}, g amb ${r.a} contra g amb ${r.b} (els ${r.n} mons de prova, prova de signes unilateral): més alt amb ${r.a} a ${r.pos}, més baix a ${r.neg}, iguals ${r.ties}; p = ${r.p.toFixed(4)}; llindar de Holm ${r.threshold}`));
  lines.push('');
  lines.push('Descriptius:');
  // l'efecte immediat de cada transformació, abans de cap època de dinàmica (AUD-116)
  for (const arm of P.arms.filter((a) => a !== 'continue')) {
    const r = test.map(([id]) => h0(id, arm) / h0(id, 'continue')).sort((x, y) => x - y);
    lines.push(`  l'efecte immediat de ${arm}, h₀ respecte del de continue, als mons de prova: de ${r[0].toFixed(2)} a ${r[r.length - 1].toFixed(2)}, mediana ${r[Math.floor((r.length - 1) / 2)].toFixed(2)}`);
  }
  for (const [a, b] of t.descriptive ?? []) {
    const s = signs(test.map(([id, w]) => g(id, w, a) - g(id, w, b)));
    lines.push(`  g amb ${a} contra g amb ${b}, als mons de prova: més alt a ${s.pos}, més baix a ${s.neg}, iguals ${s.ties}`);
  }
  // la sensibilitat amb els hereditaris sols, que no depenen dels veïns (AUD-119)
  for (const [a, b] of t.contrasts) {
    const s = signs(test.map(([id, w]) => g(id, w, a, true) - g(id, w, b, true)));
    lines.push(`  sensibilitat, només els hereditaris sols: g amb ${a} contra ${b}, més alt a ${s.pos}, més baix a ${s.neg}, iguals ${s.ties}; p = ${signTest(s.pos, s.neg).toFixed(4)}, descriptiva`);
  }
  for (const [id, w] of controls) lines.push(`  control negatiu ${id}: ` + P.arms.filter((a) => a !== 'continue').map((a) => `g amb ${a} menys g amb continue ${(g(id, w, a) - g(id, w, 'continue')).toFixed(3)}`).join('; '));
  for (const [id] of test) {
    const pl = byWorld.get(id).arms['placebo-cell']?.scope;
    if (pl) lines.push(`  ${id}: el placebo deixa sense aparellar ${pl.shortfall} dels ${pl.zeros} zeros de l'abast (${pct(pl.shortfall / pl.zeros)}), a ${pl.saturated?.cells ?? '—'} cel·les saturades`);
  }
  for (const arm of P.arms) {
    const all = [...worlds.values()].flatMap((w) => w.arms[arm]);
    lines.push(`  ${arm}: censos 2 a 4, ${pct(mean(all.map((m) => m.h234)))} de mitjana; pèrdua R2 a ${all.filter((m) => m.loss !== null).length} de ${all.length} branques, recuperades ${all.filter((m) => m.recovered).length}; al cens final, ${pct(mean(all.map((m) => m.final)))}`);
  }
  return { results, lines };
}

// Les frases de les decisions: diuen exactament el que posa a prova cada prova (com a B2, AU2-74), i, quan no es
// rebutja, la potència condicionada del protocol (AUD-119)
export function decisionLines({ results }) {
  const against = (b) => (b === 'placebo-cell' ? 'amb el placebo, aparellat cel·la per cel·la (en part a les cel·les saturades)' : `amb ${b}`);
  return results.map((r, i) => `DECISIÓ ${i + 1} (${r.a} contra ${r.b}): ` + (r.rejected
    ? `es rebutja H0: als mons de prova, entre els que tenen una diferència, predominen els que la vida baixa menys, o creix més, del començament al primer cens amb ${r.a} que ${against(r.b)} (g més alt: ${r.pos}, més baix: ${r.neg}, iguals: ${r.ties}; p = ${r.p.toFixed(4)}, llindar de Holm ${r.threshold}). No diu res de mons nous`
    : `no es rebutja H0: no concloent; la prova no permet afirmar que, als mons de prova, la vida baixi menys del començament al primer cens amb ${r.a} que ${against(r.b)} (g més alt: ${r.pos}, més baix: ${r.neg}, iguals: ${r.ties}; p = ${r.p.toFixed(4)}, llindar de Holm ${r.threshold}). La potència era condicionada: si a cada món la diferència surt a favor amb una probabilitat q, la prova es rebutja amb una probabilitat q elevat al nombre de mons amb diferència (protocol §6)`));
}
