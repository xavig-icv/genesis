// L'anàlisi del pilot de la maduració (docs/pilot-maduracio.md, §3, i la lectura de l'acta, escrita abans de la primera
// branca). És exploratòria: no en surt cap conclusió, i serveix per dissenyar la sèrie.
//
//   node eines/maduracio-analisi.mjs [--serie manifest.json] [carpeta]
//
// Primer comprova que hi hagi els registres de totes les branques del manifest, sense llegir-ne cap: durant el lot no
// es miren resultats. Després els valida tots (l'esquema sencer de cada línia, l'ordre exacta, els censos i
// l'establiment recalculat, amb les funcions de la sèrie de B2), i el simulador del seu codi, que ha de ser el de la
// preparació. Només si tot és correcte, en dona:
//   - els establiments de cada braç dins de H (la mesura principal del pilot), per món, i el temps fins a l'establiment
//     (RMST, restringit a H);
//   - els mateixos establiments, separats segons si el món tenia alguna cel·la hereditària sola al començament del braç
//     (l'escaneig del manifest, AUD-121), com diu la lectura de l'acta;
//   - la concordança entre llavors (la rho d'eines/potencia-maduracio.mjs) i entre braços;
//   - cada braç contra continue, món a món, sense cap prova;
//   - el primer cens amb algun hereditari;
//   - el cost.
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { censusProblem, structureProblems } from '../fase2/b2-serie.mjs';
import { EVENT_SHARE, EVENT_CENSUSES } from '../fase2/census.js';
import { SIM_FILES } from './pilot.mjs';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MANIFEST = 'fase2/resultats/maduracio/pilot/manifest.json';
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const START_KEYS = 'census,code,command,diffusion,epochs,event,every,flow,from,mixing,mutation,node,programs,radius,renewal,rng,seed,start,type,world,zlib';

// Les branques del manifest, amb el que se n'espera: la captura del braç, l'inici, el final i el punt de partida
export function expectedBranches(manifest) {
  const byWorld = new Map(manifest.worlds.map((w) => [w.world, w]));
  return manifest.branches.map((b) => {
    const w = byWorld.get(b.world), a = w.arms[b.arm];
    return { ...b, from: a.file, start: w.start, epochs: w.start + manifest.params.horizon, scan: a.scan };
  });
}

// Que el manifest sigui el del pilot i coherent amb ell mateix
export function manifestProblems(manifest) {
  const P = manifest?.params, num = (x) => typeof x === 'number' && Number.isFinite(x);
  if (manifest?.pilot !== 'maduracio') return ['el manifest no és el del pilot de la maduració'];
  if (!P || !Array.isArray(P.arms) || !P.arms.length || !Array.isArray(P.continuation) || P.continuation.length !== 2 || !num(P.horizon) ||
    P.stopAfterEvent !== 0 || !Array.isArray(P.world) || !P.census || !num(P.census.every) || !num(P.every)) return ["els paràmetres del manifest no tenen l'estructura esperada"];
  if (!Array.isArray(manifest.worlds) || !Array.isArray(manifest.branches)) return ['el manifest no té els mons o les branques'];
  const out = [];
  const included = manifest.worlds.filter((w) => w.included);
  if (!included.length) out.push('el manifest no té cap món inclòs');
  for (const w of included) {
    for (const arm of P.arms) {
      const s = w.arms?.[arm]?.scan;
      if (!s || !Number.isInteger(s.heritable) || !Number.isInteger(s.heritableSolo) || !(s.cells > 0)) out.push(`${w.world}: el braç ${arm} no té l'escaneig del punt de partida`);
    }
  }
  const want = included.flatMap((w) => P.arms.flatMap((arm) => P.continuation.map(([tag]) => `${w.world}-${arm}-${tag}`)));
  const ids = manifest.branches.map((b) => b.id);
  if (!same([...ids].sort(), [...want].sort()) || new Set(ids).size !== ids.length) out.push('les branques del manifest no són els mons inclosos × els braços × les llavors');
  if (manifest.branches.some((b) => typeof b.command !== 'string' || !b.command.startsWith('node sim.mjs '))) out.push("hi ha branques sense l'ordre de sim.mjs");
  return out;
}

// Els problemes d'un registre de branca (buit si és correcte). Com la validació de l'envelliment (eines/pilot.mjs) i de
// B2, amb l'ordre exacta del manifest. Una branca acaba a l'horitzó sense establiment, o al cens que el confirma
export function branchProblems(records, b, manifest) {
  try { return recordProblems(records, b, manifest); } catch (e) { return [`${b.id}: el registre no té l'estructura esperada (${e.message})`]; }
}
function recordProblems(records, b, manifest) {
  const P = manifest.params, problems = [], p = (m) => problems.push(`${b.id}: ${m}`);
  if (!records.length || records[0]?.type !== 'start') return [`${b.id}: no comença amb la línia d'inici`];
  const s = records[0];
  if (Object.keys(s).sort().join(',') !== START_KEYS) p("la línia d'inici no té els camps esperats");
  const expect = {
    seed: b.seed, from: b.from, start: b.start, epochs: b.epochs, command: b.command, mixing: P.mixing, world: P.world, programs: P.world[0] * P.world[1],
    radius: P.radius, rng: P.rng, every: P.every, mutation: P.mutation, diffusion: 0, flow: 0, renewal: 0, census: P.census,
    event: { share: EVENT_SHARE, censuses: EVENT_CENSUSES, stopAfter: P.stopAfterEvent },
  };
  for (const [k, v] of Object.entries(expect)) if (!same(s[k], v)) p(`${k} és ${JSON.stringify(s[k])}, i el manifest diu ${JSON.stringify(v)}`);
  if (!(typeof s.code === 'string' && /^[0-9a-f]{7,40}$/.test(s.code))) p(`el codi del registre no és un commit net (${s.code})`);
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
    seconds: end.seconds, ops: records.filter((r) => r.type === 'measure').reduce((a, m) => a + m.ops, 0), node: records[0].node,
  };
}

// Que el simulador del codi dels registres sigui el de la preparació (el codi del manifest), fitxer per fitxer. Sense
// git, no es pot comprovar, i es diu
export function simulatorCheck(codes, manifestCode, { root = ROOT } = {}) {
  const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  try { git('rev-parse', '--git-dir'); } catch { return { checked: false, problems: [] }; }
  const problems = [], blob = (c, f) => { try { return git('rev-parse', `${c}:${f}`); } catch { return null; } };
  for (const code of codes) {
    for (const f of SIM_FILES) {
      const a = blob(code, f), b = blob(manifestCode, f);
      if (a === null || b === null) { problems.push(`no es pot llegir ${f} del commit ${a === null ? code : manifestCode}`); continue; }
      if (a !== b) problems.push(`${f} del commit dels registres (${code}) no és el de la preparació (${manifestCode})`);
    }
  }
  return { checked: true, problems };
}

// Les branques que falten, sense llegir-ne cap
export function missingBranches(folder, manifest) {
  return expectedBranches(manifest).filter((b) => !existsSync(join(folder, `${b.id}.jsonl`))).map((b) => b.id);
}

// Llegeix i valida totes les branques. Retorna { branches, problems, codes }
export function readSeries(folder, manifest) {
  const problems = manifestProblems(manifest), branches = [], codes = new Set();
  if (problems.length) return { branches, problems, codes: [] };
  for (const b of expectedBranches(manifest)) {
    const f = join(folder, `${b.id}.jsonl`);
    if (!existsSync(f)) { problems.push(`${b.id}: no hi ha el registre`); continue; }
    let records;
    try { records = readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l)); } catch { problems.push(`${b.id}: el registre no es pot llegir`); continue; }
    const bad = branchProblems(records, b, manifest);
    if (bad.length) { problems.push(...bad); continue; }
    codes.add(records[0].code);
    branches.push({ ...b, ...branchMeasures(records, b) });
  }
  return { branches, problems, codes: [...codes] };
}

const mean = (v) => v.reduce((a, b) => a + b, 0) / v.length;
// la mediana, amb el criteri del projecte: amb un nombre parell, la mitjana dels dos valors del mig (AUD-123)
export const median = (v) => { const s = [...v].sort((a, b) => a - b), h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
export function pearson(x, y) {
  const mx = mean(x), my = mean(y);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null;
}
// La concordança entre les dues llavors d'un món i un braç. rho és la correlació intraclasse amb la mitjana de cada braç,
// la de la potència (dues branques del mateix món i braç); els termes d'un braç sense variació són 0
export function seedConcordance(pairsByArm) {
  let num = 0, den = 0;
  const perArm = pairsByArm.map(({ arm, pairs }) => {
    const p = mean(pairs.flat());
    for (const [a, b] of pairs) { num += (a - p) * (b - p); den += p * (1 - p); }
    return { arm, agree: pairs.filter(([a, b]) => a === b).length, n: pairs.length, phi: pearson(pairs.map((x) => x[0]), pairs.map((x) => x[1])) };
  });
  return { perArm, rho: den > 0 ? num / den : null };
}

const pct = (x) => `${(100 * x).toFixed(1)} %`;
const fmt = (x, d = 2) => (x === null ? '—' : x.toFixed(d));
const ep = (x) => (x === null ? '—' : String(Math.round(x)));

export function analyse(branches, manifest) {
  const P = manifest.params, H = P.horizon, arms = P.arms, lines = [];
  const worlds = [...new Set(branches.map((b) => b.world))];
  const tags = P.continuation.map(([t]) => t);
  const of = (w, arm) => tags.map((t) => branches.find((b) => b.world === w && b.arm === arm && b.tag === t));
  const est = (bs) => bs.filter((b) => b.established).length;
  const prop = (w, arm) => est(of(w, arm)) / tags.length;
  const restricted = (b) => (b.established ? b.T : H);

  lines.push(`La mesura principal: l'establiment dins de H = ${H} èpoques (el criteri de la llei 2), per braç, amb ${worlds.length} mons i ${tags.length} llavors:`);
  for (const arm of arms) {
    const bs = branches.filter((b) => b.arm === arm), Ts = bs.filter((b) => b.established).map((b) => b.T);
    lines.push(`  ${arm}: establertes ${est(bs)} de ${bs.length} branques (${pct(est(bs) / bs.length)}), a ${worlds.filter((w) => prop(w, arm) > 0).length} mons de ${worlds.length}` +
      ` (totes dues llavors a ${worlds.filter((w) => prop(w, arm) === 1).length}); RMST ${ep(mean(bs.map(restricted)))} èpoques; T dels establerts, mediana ${ep(Ts.length ? median(Ts) : null)}`);
  }

  lines.push('');
  lines.push("Separats pel punt de partida del braç (la lectura de l'acta): alguna cel·la hereditària sola a l'escaneig, o cap:");
  for (const arm of arms) {
    const solo = (w) => branches.find((b) => b.world === w && b.arm === arm).scan.heritableSolo > 0;
    const part = (ws) => { const bs = ws.flatMap((w) => of(w, arm)); return ws.length ? `${est(bs)} de ${bs.length} (${pct(est(bs) / bs.length)})` : '—'; };
    const withSolo = worlds.filter(solo), without = worlds.filter((w) => !solo(w));
    lines.push(`  ${arm}: amb alguna (${withSolo.length} mons) ${part(withSolo)}; sense cap (${without.length} mons) ${part(without)}`);
  }

  lines.push('');
  const conc = seedConcordance(arms.map((arm) => ({ arm, pairs: worlds.map((w) => of(w, arm).map((b) => (b.established ? 1 : 0))) })));
  lines.push(`La concordança entre llavors: rho = ${fmt(conc.rho)} (la correlació intraclasse, amb la mitjana de cada braç; la de la potència)`);
  for (const c of conc.perArm) lines.push(`  ${c.arm}: les dues llavors coincideixen a ${c.agree} mons de ${c.n}; phi ${fmt(c.phi)}`);

  lines.push('');
  lines.push("Entre braços: la correlació, entre mons, de la proporció d'establiments de cada món:");
  for (let i = 0; i < arms.length; i++) {
    for (let j = i + 1; j < arms.length; j++) {
      lines.push(`  ${arms[i]} · ${arms[j]}: ${fmt(pearson(worlds.map((w) => prop(w, arms[i])), worlds.map((w) => prop(w, arms[j]))))}`);
    }
  }

  lines.push('');
  lines.push('Cada braç contra continue, món a món (la proporció dels dos; és un pilot, sense cap prova):');
  for (const arm of arms.filter((a) => a !== 'continue')) {
    const d = worlds.map((w) => prop(w, arm) - prop(w, 'continue'));
    lines.push(`  ${arm}: més alta a ${d.filter((x) => x > 0).length} mons, més baixa a ${d.filter((x) => x < 0).length}, igual a ${d.filter((x) => x === 0).length}`);
  }

  lines.push('');
  lines.push('El primer cens amb algun hereditari, des del començament (mediana de les branques que en tenen):');
  for (const arm of arms) {
    const bs = branches.filter((b) => b.arm === arm), any = bs.filter((b) => b.firstHeritable !== null), solo = bs.filter((b) => b.firstSolo !== null);
    lines.push(`  ${arm}: qualsevol, ${ep(any.length ? median(any.map((b) => b.firstHeritable)) : null)} èpoques (${any.length} de ${bs.length} branques); sol, ${ep(solo.length ? median(solo.map((b) => b.firstSolo)) : null)} èpoques (${solo.length} de ${bs.length})`);
  }

  lines.push('');
  const hours = (bs) => bs.reduce((a, b) => a + b.seconds, 0) / 3600;
  lines.push(`El cost: ${hours(branches).toFixed(1)} h de branques en total (la suma dels temps de cada una, amb les altres corrent alhora)`);
  for (const arm of arms) {
    const bs = branches.filter((b) => b.arm === arm);
    lines.push(`  ${arm}: ${hours(bs).toFixed(1)} h; per branca, mediana ${ep(median(bs.map((b) => b.seconds)))} s i ${ep(median(bs.map((b) => b.epochs)))} èpoques`);
  }
  for (const node of [...new Set(branches.map((b) => b.node))].sort()) {
    const bs = branches.filter((b) => b.node === node);
    lines.push(`  Node ${node}: ${bs.length} branques; mediana ${fmt(median(bs.map((b) => (1000 * b.seconds) / b.epochs)), 0)} s per 1.000 èpoques`);
  }
  lines.push(`  per món (${arms.length} braços × ${tags.length} llavors), de mitjana: ${(hours(branches) / worlds.length).toFixed(1)} h`);
  return { lines, rho: conc.rho };
}

function fail(message, code = 1) { console.log(message); process.exit(code); }

function main(argv) {
  const args = [...argv], i = args.indexOf('--serie');
  let manifestPath = MANIFEST;
  if (i >= 0) { manifestPath = args[i + 1]; args.splice(i, 2); }
  if (!manifestPath || args.length > 1 || args.some((a) => a.startsWith('--'))) fail('Ús: node eines/maduracio-analisi.mjs [--serie manifest.json] [carpeta]', 2);
  let manifest;
  try { manifest = JSON.parse(readFileSync(resolve(ROOT, manifestPath), 'utf8')); } catch { fail(`no es pot llegir el manifest ${manifestPath}`, 2); }
  const bad = manifestProblems(manifest);
  if (bad.length) fail(`El manifest no és el del pilot:\n- ${bad.join('\n- ')}`);
  const folder = resolve(args[0] ?? join(ROOT, 'fase2/resultats/maduracio/pilot/branques'));
  // durant el lot no es mira res: si en falta cap, només es compten
  const missing = missingBranches(folder, manifest);
  if (missing.length) fail(`Falten ${missing.length} registres de ${manifest.branches.length}: no s'analitza res fins que hi siguin tots.`);
  const { branches, problems, codes } = readSeries(folder, manifest);
  if (problems.length) fail(`Les branques no són les del manifest (${problems.length} problemes):\n- ${problems.slice(0, 20).join('\n- ')}${problems.length > 20 ? `\n- i ${problems.length - 20} més` : ''}`);
  const sim = simulatorCheck(codes, manifest.code);
  if (sim.problems.length) fail(`El simulador dels registres no és el de la preparació:\n- ${sim.problems.join('\n- ')}`);
  console.log(`El pilot de la maduració: ${branches.length} branques de ${manifest.branches.length}, totes vàlides. El codi dels registres: ${codes.join(', ')}; ` +
    (sim.checked ? `el simulador, el de la preparació (${manifest.code}).` : 'sense git, el simulador no s\'ha pogut comparar amb el de la preparació.'));
  console.log("És un pilot: no en surt cap conclusió (docs/pilot-maduracio.md). La lectura de cada braç és a l'acta.");
  console.log('');
  for (const l of analyse(branches, manifest).lines) console.log(l);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main(process.argv.slice(2));
