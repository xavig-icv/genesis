// Anàlisi estadística de les sèries d'experiments (protocol estadístic, docs/protocol-estadistic.md).
//
// Ús:
//   node fase2/estadistica.mjs --etapa 1|2 carpeta-A carpeta-B
//        la decisió confirmatòria. Només es pot prendre des d'una còpia neta del commit de l'etiqueta de
//        git preregistre-llei2: el commit de referència és el de l'etiqueta, i el manifest es llegeix
//        d'aquest commit (AUD-50, AU2-29). Valida que els fitxers siguin exactament els preregistrats
//        (llavors, paràmetres, commit, censos i mesures complets, ordre de les línies, final coherent)
//        i, si ho són, aplica la decisió de l'etapa amb el límit preregistrat. Si hi ha qualsevol
//        anomalia, no decideix (codi de sortida 1). L'etapa 2 comprova, a més, que l'etapa 1 no rebutjava H0
//   node fase2/estadistica.mjs --etapa 1|2 --prova --commit HASH --manifest fitxer carpeta-A carpeta-B
//        el mateix, per provar el programa amb altres dades: NO és una decisió confirmatòria, i ho diu.
//        El commit ha de ser un hash complet de 40 caràcters
//   node fase2/estadistica.mjs carpeta-A carpeta-B     informe descriptiu, sense validació ni decisió
//   node fase2/estadistica.mjs --potencia [rèpliques]  potència i error de tipus I del procediment de
//        dues etapes sencer, per simulació
//
// Cada experiment és un fitxer .jsonl (sim.mjs --json). L'esdeveniment és l'establiment de la vida
// segons el criteri de fase2/census.js (el mateix codi que atura els experiments); si no passa abans
// del final, l'experiment queda censurat a l'última època simulada. Els experiments que no han arribat
// al final previst sense establiment (s'han tallat) s'assenyalen: el protocol diu que es tornen a
// executar.
//
// Totes les funcions estadístiques s'exporten i tenen proves (test/estadistica.mjs).
import { readFileSync, readdirSync } from 'fs';
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { basename, join } from 'path';
import { fileURLToPath } from 'url';
import { establishment } from './census.js';
import { makeRng } from '../fase1/soup.js';

// ---- Distribució normal

// Funció de distribució de la normal estàndard (Abramowitz i Stegun 7.1.26 sobre erf; error < 1,5e-7)
export function normalCdf(z) {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const erf = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return z >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
}

// ---- Proporcions

// Prova exacta de Fisher bilateral (probabilitats menors o iguals que l'observada)
export function fisher(x1, n1, x2, n2) {
  const lf = (n) => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; };
  const total = x1 + x2;
  const p = (a) => Math.exp(lf(n1) + lf(n2) + lf(total) + lf(n1 + n2 - total) - lf(n1 + n2) - lf(a) - lf(n1 - a) - lf(total - a) - lf(n2 - total + a));
  const observed = p(x1);
  let sum = 0;
  for (let a = Math.max(0, total - n2); a <= Math.min(n1, total); a++) { const q = p(a); if (q <= observed * (1 + 1e-7)) sum += q; }
  return Math.min(1, sum);
}

// Interval de Wilson al 95 %
export function wilson(x, n, z = 1.959964) {
  const p = x / n, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d;
  const h = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}

// ---- Supervivència. Cada grup és una llista de { time, event } (event: true si hi ha establiment)

// Log-rank bilateral (amb empats). Retorna l'estadístic Z (observats menys esperats al grup A), el
// khi quadrat i el valor p.
export function logrank(a, b) {
  const all = [...a.map((x) => ({ ...x, g: 0 })), ...b.map((x) => ({ ...x, g: 1 }))];
  const times = [...new Set(all.filter((x) => x.event).map((x) => x.time))].sort((x, y) => x - y);
  let O = 0, E = 0, V = 0;
  for (const t of times) {
    let r0 = 0, r1 = 0, d0 = 0, d = 0;
    for (const x of all) {
      if (x.time >= t) { if (x.g === 0) r0++; else r1++; }
      if (x.time === t && x.event) { d++; if (x.g === 0) d0++; }
    }
    const r = r0 + r1;
    O += d0; E += (d * r0) / r;
    if (r > 1) V += (d * (r0 / r) * (r1 / r) * (r - d)) / (r - 1);
  }
  const z = V > 0 ? (O - E) / Math.sqrt(V) : 0;
  return { z, chi2: z * z, p: 2 * (1 - normalCdf(Math.abs(z))) };
}

// Kaplan-Meier: la funció de supervivència (aquí, la probabilitat que la vida encara no s'hagi
// establert), amb l'error de Greenwood. Retorna els esglaons [{ time, s, se, atRisk, events }].
export function kaplanMeier(group) {
  const times = [...new Set(group.filter((x) => x.event).map((x) => x.time))].sort((x, y) => x - y);
  let s = 1, g = 0;
  const steps = [];
  for (const t of times) {
    const atRisk = group.filter((x) => x.time >= t).length;
    const events = group.filter((x) => x.time === t && x.event).length;
    s *= 1 - events / atRisk;
    if (atRisk > events) g += events / (atRisk * (atRisk - events));
    steps.push({ time: t, s, se: s * Math.sqrt(g), atRisk, events });
  }
  return steps;
}

// Supervivència a l'època t, amb el seu error
export function survivalAt(steps, t) {
  let last = { s: 1, se: 0 };
  for (const st of steps) if (st.time <= t) last = st;
  return last;
}

// Diferència d'incidència acumulada (1 - S) entre B i A a l'època t, amb interval al 95 %
export function incidenceDifference(a, b, t) {
  const sa = survivalAt(kaplanMeier(a), t), sb = survivalAt(kaplanMeier(b), t);
  const diff = (1 - sb.s) - (1 - sa.s);
  const se = Math.sqrt(sa.se ** 2 + sb.se ** 2);
  // Interval de Wald, retallat a [-1, 1]: és descriptiu, i amb poques incidències és molt aproximat
  return { diff, low: Math.max(-1, diff - 1.959964 * se), high: Math.min(1, diff + 1.959964 * se) };
}

// Temps mitjà restringit fins a l'establiment (RMST) fins a l'època t, amb l'error de la fórmula
// habitual (suma sobre els esglaons de Kaplan-Meier)
export function rmst(group, t) {
  const steps = kaplanMeier(group).filter((st) => st.time <= t);
  const knots = [0, ...steps.map((st) => st.time), t];
  const values = [1, ...steps.map((st) => st.s)];
  let area = 0;
  const areas = [];
  for (let i = 0; i < values.length; i++) { const piece = values[i] * (knots[i + 1] - knots[i]); area += piece; areas.push(piece); }
  let variance = 0, tail = 0;
  for (let i = steps.length - 1; i >= 0; i--) {
    tail += areas[i + 1];
    const { atRisk, events } = steps[i];
    if (atRisk > events) variance += (tail * tail * events) / (atRisk * (atRisk - events));
  }
  return { rmst: area, se: Math.sqrt(variance) };
}

// ---- Disseny en dues etapes (protocol §6): límits d'O'Brien-Fleming amb la despesa de Lan-DeMets

// Alfa gastada fins a la fracció d'informació f (bilateral)
export const obfSpending = (f, alpha = 0.05) => 2 * (1 - normalCdf(normalInverse(1 - alpha / 2) / Math.sqrt(f)));

export function normalInverse(p) {
  // Cerca binària sobre normalCdf (prou precisa per als límits)
  let lo = -10, hi = 10;
  for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (normalCdf(mid) < p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

// Límits |Z| de les dues etapes per a una fracció d'informació f a l'etapa 1. El de l'etapa 2 fa que
// la probabilitat total de rebutjar H0 sigui alfa: P(|Z1| > c1) + P(|Z1| <= c1, |Z2| > c2) = alfa, amb
// Z2 = sqrt(f) Z1 + sqrt(1 - f) W (integral numèrica sobre Z1).
export function twoStageBounds(f, alpha = 0.05) {
  const a1 = obfSpending(f, alpha);
  const c1 = normalInverse(1 - a1 / 2);
  const phi = (z) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  const reject2 = (c2) => {
    const N = 2000, h = (2 * c1) / N;
    let sum = 0;
    for (let i = 0; i <= N; i++) {
      const z1 = -c1 + i * h;
      const w = i === 0 || i === N ? 1 : i % 2 ? 4 : 2;
      const m = Math.sqrt(f) * z1, s = Math.sqrt(1 - f);
      sum += w * phi(z1) * (normalCdf((-c2 - m) / s) + 1 - normalCdf((c2 - m) / s));
    }
    return (sum * h) / 3;
  };
  let lo = 1, hi = 4;
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (a1 + reject2(mid) > alpha) lo = mid; else hi = mid; }
  const c2 = (lo + hi) / 2;
  return { c1, c2, p1: 2 * (1 - normalCdf(c1)), p2: 2 * (1 - normalCdf(c2)) };
}

// ---- Potència per simulació (riscos exponencials, temps arrodonits al cens, censura a l'horitzó)

export function power({ n, pA, pB, horizon = 16000, every = 250, reps = 4000, seed = 424242, z = 1.959964 }) {
  const rng = makeRng(seed, 'v2');
  const draw = (p) => {
    const lambda = -Math.log(1 - p) / horizon;
    const t = -Math.log(1 - rng()) / lambda;
    return t <= horizon ? { time: Math.ceil(t / every) * every, event: true } : { time: horizon, event: false };
  };
  let hits = 0;
  for (let k = 0; k < reps; k++) {
    const a = Array.from({ length: n }, () => draw(pA)), b = Array.from({ length: n }, () => draw(pB));
    if (Math.abs(logrank(a, b).z) > z) hits++;
  }
  return hits / reps;
}

// Temps fins a l'establiment d'una distribució de Weibull de forma `shape` amb incidència acumulada `p` a
// l'horitzó (shape = 1: risc constant; < 1: risc que baixa amb el temps; > 1: que puja), arrodonit al
// cens següent; censurat a l'horitzó
export function drawTime(rng, p, shape = 1, horizon = 16000, every = 250) {
  if (p <= 0) return { time: horizon, event: false };
  const scale = horizon / Math.pow(-Math.log(1 - p), 1 / shape);
  const t = scale * Math.pow(-Math.log(1 - rng()), 1 / shape);
  return t <= horizon ? { time: Math.min(horizon, Math.ceil(t / every) * every), event: true } : { time: horizon, event: false };
}

// El procediment de dues etapes sencer (protocol §8; AU2-21 de l'auditoria externa 3): etapa 1 amb n1
// experiments per condició i el límit c1; si no es rebutja H0, etapa 2 amb n2 i el límit c2. Retorna la
// proporció de rebuigs, la d'aturades a l'etapa 1 i el nombre mitjà d'experiments.
export function simulateTwoStage({ A, B, n1 = 50, n2 = 80, c1, c2, reps = 20000, seed = 20261017, horizon = 16000, every = 250 }) {
  const rng = makeRng(seed, 'v2');
  let rejected = 0, stopped1 = 0, experiments = 0;
  for (let k = 0; k < reps; k++) {
    const a = Array.from({ length: n2 }, () => drawTime(rng, A.p, A.shape, horizon, every));
    const b = Array.from({ length: n2 }, () => drawTime(rng, B.p, B.shape, horizon, every));
    if (Math.abs(logrank(a.slice(0, n1), b.slice(0, n1)).z) > c1) { rejected++; stopped1++; experiments += 2 * n1; continue; }
    experiments += 2 * n2;
    if (Math.abs(logrank(a, b).z) > c2) rejected++;
  }
  const rate = rejected / reps;
  return { rate, se: Math.sqrt(rate * (1 - rate) / reps), stopped1: stopped1 / reps, experiments: experiments / reps };
}

// ---- Lectura dels experiments

// Un experiment a partir del seu JSONL: { file, seed, time, event, end, horizon, complete, censuses }
export function readExperiment(file) {
  const records = readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const start = records.find((r) => r.type === 'start');
  const end = records.find((r) => r.type === 'end');
  if (!start) throw new Error(`${file}: no té la línia d'inici`);
  const censuses = records.filter((r) => r.type === 'census' && r.version === 'v3');
  const measures = records.filter((r) => r.type === 'measure');
  if (!start.census?.every) throw new Error(`${file}: la línia d'inici no diu l'interval del cens`);
  const every = start.census.every;
  const t = establishment(censuses, every);
  const last = end?.epoch ?? (censuses.length ? censuses[censuses.length - 1].epoch : start.start);
  return {
    file, seed: start.seed, code: start.code, mixing: start.mixing, horizon: start.epochs, every,
    stopAfter: start.event?.stopAfter ?? null,
    time: t ?? last, event: t !== null, end: last, reason: end?.reason ?? null,
    // complet: o ha arribat a l'horitzó, o s'ha aturat després d'un establiment
    complete: end !== undefined && (t !== null || last >= start.epochs), censuses, measures, records,
    hash: createHash('sha256').update(readFileSync(file)).digest('hex'),
  };
}

// ---- Validació de la sèrie confirmatòria (AU2-16, AU2-17 i AUD-44 de l'auditoria 3)

// Els errors d'un experiment respecte del manifest, del grup i del commit del preregistre (llista buida si
// és correcte). Auditoria externa 4: el commit ha de ser el del preregistre (AU2-23), els censos i les
// mesures han de ser-hi tots (AU2-24, AU2-27), i els recomptes han de ser enters i coherents (AU2-25).
export function validateExperiment(x, manifest, group, { commit = null } = {}) {
  const errors = [];
  const where = basename(x.file);
  const err = (msg) => errors.push(`${where}: ${msg}`);
  const types = x.records.map((r) => r.type);
  if (types[0] !== 'start' || types.filter((t) => t === 'start').length !== 1) err("hi ha d'haver una sola línia d'inici, la primera");
  if (types[types.length - 1] !== 'end' || types.filter((t) => t === 'end').length !== 1) err("hi ha d'haver una sola línia final, l'última");
  // només els cinc tipus de línia de sim.mjs, en l'ordre en què els escriu: les èpoques no baixen, i dins
  // d'una mateixa època, el cens, l'establiment (a l'època en què es confirma) i la mesura (AU2-30)
  const unknown = [...new Set(types.filter((t) => !['start', 'census', 'measure', 'event', 'end'].includes(t)))];
  if (unknown.length) err(`té línies d'un tipus desconegut: ${unknown.join(', ')}`);
  const RANK = { census: 0, event: 1, measure: 2 };
  let previous = null;
  for (const r of x.records) {
    if (!(r.type in RANK)) continue;
    const key = [r.type === 'event' ? r.confirmed : r.epoch, RANK[r.type]];
    if (previous && (key[0] < previous[0] || (key[0] === previous[0] && key[1] < previous[1]))) { err("les línies no van en l'ordre en què les escriu sim.mjs"); break; }
    previous = key;
  }
  const start = x.records.find((r) => r.type === 'start') ?? {};
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  for (const [key, value] of Object.entries(manifest.params)) {
    if (!same(start[key], value)) err(`${key} és ${JSON.stringify(start[key])}, el protocol diu ${JSON.stringify(value)}`);
  }
  if (start.mixing !== manifest.groups[group].mixing) err(`mixing ${start.mixing} no és el del grup ${group} (${manifest.groups[group].mixing})`);
  if (typeof start.code !== 'string' || !/^[0-9a-f]{7,}$/.test(start.code)) err(`el codi "${start.code}" no és un commit net`);
  else if (!commit) err("no s'ha indicat el commit del preregistre");
  else if (!/^[0-9a-f]{40}$/.test(commit)) err(`el commit de referència "${commit}" no és un hash complet de 40 caràcters`);
  else if (!commit.startsWith(start.code)) err(`el codi ${start.code} no és el commit del preregistre (${commit})`);
  // censos: v3, seguits des del primer (every, 2·every…), fins al final
  const every = manifest.params.census.every;
  const censuses = x.records.filter((r) => r.type === 'census');
  const endRecord = x.records.find((r) => r.type === 'end') ?? {};
  if (censuses.some((c) => c.version !== 'v3')) err('hi ha censos que no són v3');
  // tots els censos, de l'època `every` fins a la final, sense cap forat (AU2-24)
  const expectedCensuses = Number.isSafeInteger(endRecord.epoch) ? Math.floor(endRecord.epoch / every) : 0;
  if (censuses.length !== expectedCensuses) err(`té ${censuses.length} censos, i fins a l'època ${endRecord.epoch} n'hi ha d'haver ${expectedCensuses}`);
  const sample = Math.min(manifest.params.census.sample, manifest.params.programs);
  const COUNTS = ['replicating', 'solo', 'context', 'heritable', 'heritableSolo', 'heritableContext'];
  censuses.forEach((c, i) => {
    if (c.epoch !== every * (i + 1)) err(`el cens ${i + 1} és de l'època ${c.epoch}, hauria de ser de la ${every * (i + 1)} (hi falten censos o n'hi ha de repetits)`);
    // recomptes enters i coherents, amb la mostra del protocol (AU2-25)
    if (c.sample !== sample) err(`el cens de l'època ${c.epoch} té una mostra de ${c.sample}, el protocol en diu ${sample}`);
    const bad = COUNTS.filter((k) => !Number.isSafeInteger(c[k]) || c[k] < 0 || c[k] > c.sample);
    if (bad.length) { err(`el cens de l'època ${c.epoch} té recomptes absents o impossibles: ${bad.join(', ')}`); return; }
    const ok = c.heritableSolo + c.heritableContext === c.heritable && c.heritable <= c.replicating &&
      c.heritableSolo <= c.solo && c.heritableContext <= c.context && c.solo <= c.replicating && c.context <= c.replicating &&
      c.replicating <= c.solo + c.context && Array.isArray(c.families);
    if (!ok) err(`el cens de l'època ${c.epoch} té recomptes incoherents entre ells`);
  });
  // totes les mesures, cada `every` èpoques fins a la final (AU2-27)
  const measures = x.records.filter((r) => r.type === 'measure');
  const step = manifest.params.every;
  const expectedMeasures = Number.isSafeInteger(endRecord.epoch) ? Math.floor(endRecord.epoch / step) : 0;
  if (measures.length !== expectedMeasures) err(`té ${measures.length} mesures, i fins a l'època ${endRecord.epoch} n'hi ha d'haver ${expectedMeasures}`);
  measures.forEach((m, i) => {
    if (m.epoch !== step * (i + 1)) err(`la mesura ${i + 1} és de l'època ${m.epoch}, hauria de ser de la ${step * (i + 1)}`);
    if (![m.h0, m.hoe].every(Number.isFinite) || !Number.isSafeInteger(m.runs) || m.runs < 0 || m.epochs !== step) err(`la mesura de l'època ${m.epoch} té valors absents o impossibles`);
  });
  // l'esdeveniment i el final, coherents amb el criteri i la regla d'aturada
  const { epochs } = manifest.params;
  const { stopAfter } = manifest.params.event;
  const t = establishment(censuses, every);
  const events = x.records.filter((r) => r.type === 'event');
  const end = x.records.find((r) => r.type === 'end') ?? {};
  if (t === null) {
    if (events.length) err("hi ha una línia d'establiment, però els censos no compleixen el criteri");
    if (end.epoch !== epochs || end.reason !== 'horitzó') err(`sense establiment hauria d'arribar a l'època ${epochs}, i s'acaba a la ${end.epoch} (${end.reason})`);
  } else {
    if (events.length !== 1 || events[0].epoch !== t || events[0].confirmed !== t + every) err(`la línia d'establiment no és la del criteri (època ${t}, confirmat a la ${t + every})`);
    const expected = Math.min(epochs, t + stopAfter);
    if (end.epoch !== expected) err(`amb establiment a l'època ${t} s'hauria d'aturar a la ${expected}, i s'acaba a la ${end.epoch}`);
    const reason = t + stopAfter <= epochs ? 'establiment' : 'horitzó';
    if (end.reason !== reason) err(`amb establiment a l'època ${t}, el motiu del final hauria de ser "${reason}", i és "${end.reason}"`);
  }
  if (censuses.length && censuses[censuses.length - 1].epoch !== end.epoch) err(`l'últim cens (${censuses[censuses.length - 1].epoch}) no és el de l'època final (${end.epoch})`);
  return errors;
}

// Les llavors preregistrades d'un grup fins a una etapa
export function stageSeeds(manifest, group, stage) {
  const seeds = [];
  for (let s = 1; s <= stage; s++) {
    const [from, to] = manifest.groups[group].seeds[s];
    for (let k = from; k <= to; k++) seeds.push(k);
  }
  return seeds;
}

// Valida tota la sèrie d'una etapa contra el manifest i el commit del preregistre. Retorna { A, B, errors, code }
export function validateSeries(dirA, dirB, manifest, stage, { commit = null } = {}) {
  const errors = [];
  const read = (dir) => readdirSync(dir).filter((f) => f.endsWith('.jsonl')).sort().map((f) => {
    try { return readExperiment(join(dir, f)); } catch (e) { errors.push(`${f}: no es pot llegir (${e.message})`); return null; }
  }).filter(Boolean);
  const groups = { A: read(dirA), B: read(dirB) };
  for (const [group, list] of Object.entries(groups)) {
    const expected = stageSeeds(manifest, group, stage);
    const found = list.map((x) => x.seed);
    const missing = expected.filter((s) => !found.includes(s));
    const extra = found.filter((s) => !expected.includes(s));
    const duplicated = found.filter((s, i) => found.indexOf(s) !== i);
    if (missing.length) errors.push(`grup ${group}: hi falten les llavors ${missing.join(', ')}`);
    if (extra.length) errors.push(`grup ${group}: hi sobren llavors que no són d'aquesta etapa: ${extra.join(', ')}`);
    if (duplicated.length) errors.push(`grup ${group}: llavors repetides: ${[...new Set(duplicated)].join(', ')}`);
    if (list.length !== manifest.stages[stage].perGroup) errors.push(`grup ${group}: ${list.length} experiments, l'etapa ${stage} en demana ${manifest.stages[stage].perGroup}`);
    for (const x of list) errors.push(...validateExperiment(x, manifest, group, { commit }));
  }
  const codes = [...new Set([...groups.A, ...groups.B].map((x) => x.code))];
  if (codes.length > 1) errors.push(`els experiments no són tots del mateix commit: ${codes.join(', ')}`);
  return { ...groups, errors, code: codes[0] ?? null };
}

// L'etapa 2 només té sentit si l'etapa 1 no va rebutjar H0 (AUD-47, AU2-26): es recalcula Z sobre les
// llavors de l'etapa 1. Retorna { z1, rejected1 }
export function stageOneCheck(A, B, manifest) {
  const inStage1 = (g) => (x) => stageSeeds(manifest, g, 1).includes(x.seed);
  const z1 = logrank(A.filter(inStage1('A')), B.filter(inStage1('B'))).z;
  return { z1, rejected1: Math.abs(z1) > manifest.stages[1].bound };
}

// El preregistre (AUD-46, AUD-50, AU2-23, AU2-29): el commit de l'etiqueta de git preregistre-llei2 i el
// manifest d'aquest commit. A més, el programa que decideix ha de ser el d'aquest commit: la còpia de
// treball ha de ser-hi, sense canvis al codi ni al manifest. Retorna { commit, manifest, problem }
export function preregistration() {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const git = (...a) => execFileSync('git', a, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  let commit;
  try { commit = git('rev-parse', 'preregistre-llei2^{commit}').trim(); }
  catch { return { problem: "no hi ha l'etiqueta de git preregistre-llei2" }; }
  try {
    const head = git('rev-parse', 'HEAD').trim();
    if (head !== commit) return { problem: `la còpia de treball és al commit ${head}, no al del preregistre (${commit})` };
    if (git('status', '--porcelain', '--', '*.js', '*.mjs', '*.json').trim()) return { problem: 'la còpia de treball té canvis al codi o al manifest' };
    return { commit, manifest: JSON.parse(git('show', `${commit}:fase2/serie-llei2.json`)) };
  } catch (e) {
    return { problem: `no es pot llegir el preregistre amb git (${e.message})` };
  }
}

// La decisió de l'etapa (protocol §8): mecànica, amb el límit preregistrat
export function decide(stage, z, manifest) {
  const bound = manifest.stages[stage].bound;
  if (Math.abs(z) > bound) return { bound, decision: `es rebutja H0 a l'etapa ${stage}: la sèrie s'acaba` };
  if (Number(stage) === 1) return { bound, decision: "no es rebutja H0 a l'etapa 1: cal executar l'etapa 2" };
  return { bound, decision: "no es rebutja H0: la sèrie no permet afirmar que el corrent canviï el ritme d'establiment" };
}

// ---- Anàlisis de sensibilitat i mesures secundàries (protocol, §6 i §7)

// L'època del primer de `count` censos seguits (a `every` èpoques l'un de l'altre) que compleixen `ok`
export function firstRun(censuses, ok, count = 2, every = 250) {
  let run = 0;
  for (let i = 0; i < censuses.length; i++) {
    const follows = i > 0 && censuses[i].epoch - censuses[i - 1].epoch === every;
    run = ok(censuses[i]) ? (follows ? run + 1 : 1) : 0;
    if (run >= count) return censuses[i - count + 1].epoch;
  }
  return null;
}

const share = (key, threshold) => (c) => c.sample > 0 && c[key] / c.sample >= threshold;
export const SENSITIVITY = {
  'sense herència (es copien ≥ 1 %)': (x) => firstRun(x.censuses, share('replicating', 0.01), 2, x.every),
  'llindar del 5 %': (x) => firstRun(x.censuses, share('heritable', 0.05), 2, x.every),
  // AUD-42 i AU2-19: l'herència demostrada sola, sense la prova en context
  'herència sola (≥ 1 %)': (x) => firstRun(x.censuses, share('heritableSolo', 0.01), 2, x.every),
  'famílies, unió del territori ≥ 1 % (v0.1)': (x) => firstRun(x.censuses, (c) => c.families.reduce((a, f) => a + f.share, 0) >= 0.01, 2, x.every),
  'HOE > 1': (x) => x.measures.find((m) => m.hoe > 1)?.epoch ?? null,
};

// Un grup amb un altre criteri: mateix final de seguiment, un altre temps d'esdeveniment. (Els
// experiments s'aturen 1.000 èpoques després de l'establiment principal: un criteri que es compleixi
// més tard hi queda censurat. Per això aquestes anàlisis són descriptives.)
export const withCriterion = (group, criterion) => group.map((x) => {
  const t = criterion(x);
  return { ...x, time: t ?? x.end, event: t !== null };
});

// Mesures d'origen i de manteniment d'un experiment (protocol, §6.5 i §6.6)
export function originMeasures(x) {
  const firstHeritable = x.censuses.find((c) => c.heritable > 0)?.epoch ?? null;
  const firstCopy = x.censuses.find((c) => c.replicating > 0)?.epoch ?? null;
  const before = x.censuses.filter((c) => !x.event || c.epoch < x.time);
  const after = x.event ? x.censuses.find((c) => c.epoch === x.time + (x.stopAfter ?? 1000)) : undefined;
  return {
    firstHeritable, firstCopy,
    heritableCensusesBefore: before.filter((c) => c.heritable > 0).length,
    copyCensusesBefore: before.filter((c) => c.replicating > 0).length,
    delay: x.event && firstHeritable !== null ? x.time - firstHeritable : null,
    maintained: after ? after.heritable / after.sample >= 0.01 : null,
  };
}

export const readSeries = (dir) => readdirSync(dir).filter((f) => f.endsWith('.jsonl')).sort().map((f) => readExperiment(join(dir, f)));

// Un registre de text antic (sèrie exploratòria, cens v2), amb un dels criteris que s'hi han fet servir:
//  'hoe'        l'HOE supera 1 bit (entrada 6);
//  'familia'    una mateixa família >= 1 % del mapa en dos censos seguits (protocol v0.1);
//  'funcional'  la mostra del cens que es replica >= 1 % en dos censos seguits.
// Retorna { file, time, event, end }: censurat a l'última època del registre si no hi ha esdeveniment.
export function readLegacyLog(file, criterion = 'hoe') {
  const text = readFileSync(file, 'utf8');
  const end = Number([...text.matchAll(/^època (\d+)/gm)].pop()?.[1] ?? 0);
  let time = null;
  if (criterion === 'hoe') {
    time = Number(text.match(/HOE > [\d.]+ a l.època (\d+)/)?.[1] ?? NaN);
    if (Number.isNaN(time)) time = null;
  } else {
    const cs = [...text.matchAll(/^cens (\d+)\s+es repliquen=([\d.]+)%\s+famílies=\d+(.*)$/gm)].map((m) => ({
      epoch: Number(m[1]), alive: Number(m[2]), fams: [...m[3].matchAll(/#(\d+):([\d.]+)%/g)].map((f) => ({ id: f[1], share: Number(f[2]) })),
    }));
    for (let i = 0; i + 1 < cs.length && time === null; i++) {
      if (criterion === 'funcional' && cs[i].alive >= 1 && cs[i + 1].alive >= 1) time = cs[i].epoch;
      if (criterion === 'familia' && cs[i].fams.some((f) => f.share >= 1 && cs[i + 1].fams.some((g) => g.id === f.id && g.share >= 1))) time = cs[i].epoch;
    }
  }
  return { file, time: time ?? end, event: time !== null, end };
}

// ---- Informe de dues condicions

export function report(A, B, { horizon = null, labelA = 'A', labelB = 'B' } = {}) {
  const lines = [];
  const pct = (x) => `${(x * 100).toFixed(1)} %`;
  // L'horitzó és el dels experiments (--epochs): més enllà no hi ha dades
  const horizons = [...new Set([...A, ...B].map((x) => x.horizon))];
  if (horizon === null) horizon = Math.min(...horizons);
  if (horizons.length > 1) lines.push(`ATENCIÓ: els experiments no tenen tots el mateix horitzó (${horizons.join(', ')}); es fa servir ${horizon}`);
  for (const [label, g] of [[labelA, A], [labelB, B]]) {
    const events = g.filter((x) => x.event).length;
    const [lo, hi] = wilson(events, g.length);
    const codes = [...new Set(g.map((x) => x.code))];
    lines.push(`${label}: ${g.length} experiments, ${events} amb establiment (${pct(events / g.length)}; Wilson 95 % ${pct(lo)}–${pct(hi)}); codi ${codes.join(', ')}`);
    const incomplete = g.filter((x) => !x.complete);
    if (incomplete.length) lines.push(`  ATENCIÓ: ${incomplete.length} experiments tallats abans d'hora (cal tornar-los a executar): ${incomplete.map((x) => x.file).join(', ')}`);
  }
  const lr = logrank(A, B);
  lines.push(`Log-rank bilateral: Z = ${lr.z.toFixed(3)}, khi quadrat = ${lr.chi2.toFixed(3)}, p = ${lr.p.toFixed(4)}`);
  const eA = A.filter((x) => x.event).length, eB = B.filter((x) => x.event).length;
  lines.push(`Fisher bilateral (descriptiu): p = ${fisher(eA, A.length, eB, B.length).toFixed(4)}`);
  const d = incidenceDifference(A, B, horizon);
  lines.push(`Diferència d'incidència acumulada a l'època ${horizon} (${labelB} − ${labelA}): ${pct(d.diff)} (IC 95 % ${pct(d.low)} a ${pct(d.high)})`);
  const ra = rmst(A, horizon), rb = rmst(B, horizon);
  lines.push(`RMST fins a l'època ${horizon}: ${labelA} ${ra.rmst.toFixed(0)} ± ${ra.se.toFixed(0)}, ${labelB} ${rb.rmst.toFixed(0)} ± ${rb.se.toFixed(0)} (diferència ${(rb.rmst - ra.rmst).toFixed(0)} ± ${Math.hypot(ra.se, rb.se).toFixed(0)})`);
  for (const [label, g] of [[labelA, A], [labelB, B]]) {
    lines.push(`Kaplan-Meier ${label}: ${kaplanMeier(g).map((st) => `${st.time}:${st.s.toFixed(3)}`).join('  ') || '(cap establiment)'}`);
  }
  for (const [label, g] of [[labelA, A], [labelB, B]]) {
    const runs = g.flatMap((x) => x.measures ?? []).reduce((acc, m) => [acc[0] + m.runs, acc[1] + m.epochs], [0, 0]);
    if (runs[1]) lines.push(`Interaccions ${label}: ${(runs[0] / runs[1]).toFixed(0)} parelles per època de mitjana`);
  }
  lines.push('', "Sensibilitats (descriptives; entre parèntesis, els experiments aturats per l'establiment principal abans de complir el criteri, que hi queden censurats):");
  for (const [name, criterion] of Object.entries(SENSITIVITY)) {
    const a = withCriterion(A, criterion), b = withCriterion(B, criterion);
    const cut = (g) => g.filter((x) => !x.event && x.end < x.horizon).length;
    lines.push(`  ${name}: ${a.filter((x) => x.event).length}/${a.length} (${cut(a)}) contra ${b.filter((x) => x.event).length}/${b.length} (${cut(b)}), log-rank p = ${logrank(a, b).p.toFixed(4)}`);
  }
  lines.push('', 'Origen i manteniment (descriptius):');
  const median = (v) => { const s = v.filter((x) => x !== null).sort((p, q) => p - q); return s.length ? s[s.length >> 1] : '—'; };
  for (const [label, g] of [[labelA, A], [labelB, B]]) {
    const m = g.map(originMeasures);
    lines.push(`  ${label}: amb algun hereditari ${m.filter((x) => x.firstHeritable !== null).length}/${g.length} (primer, mediana: època ${median(m.map((x) => x.firstHeritable))}); ` +
      `amb algun copiador ${m.filter((x) => x.firstCopy !== null).length}/${g.length}; ` +
      `del primer hereditari a l'establiment, mediana ${median(m.map((x) => x.delay))} èpoques; ` +
      `mantinguts a t + 1.000: ${m.filter((x) => x.maintained).length} de ${m.filter((x) => x.maintained !== null).length}`);
  }
  return lines.join('\n');
}

// ---- Línia d'ordres

// Escenaris de la simulació del procediment de dues etapes (protocol §8)
export const SCENARIOS = [
  ...[0.1, 0.3, 0.5, 0.7, 0.9].flatMap((p) => [0.5, 1, 2].map((shape) => ({ name: `H0 · ${p * 100} % · forma ${shape}`, A: { p, shape }, B: { p, shape } }))),
  { name: 'H1 · 20 % contra 40 % · riscos proporcionals', A: { p: 0.2, shape: 1 }, B: { p: 0.4, shape: 1 } },
  { name: 'H1 · 20 % contra 50 % · riscos proporcionals', A: { p: 0.2, shape: 1 }, B: { p: 0.5, shape: 1 } },
  { name: 'H1 · 20 % contra 40 % · B primerenc (forma 0,5), A tardà (forma 2)', A: { p: 0.2, shape: 2 }, B: { p: 0.4, shape: 0.5 } },
  { name: 'H1 · 20 % contra 40 % · B tardà (forma 2), A primerenc (forma 0,5)', A: { p: 0.2, shape: 0.5 }, B: { p: 0.4, shape: 2 } },
];

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const args = process.argv.slice(2);
  const usage = () => {
    console.error('Ús: node fase2/estadistica.mjs --etapa 1|2 carpeta-A carpeta-B\n' +
      '     node fase2/estadistica.mjs --etapa 1|2 --prova --commit HASH --manifest fitxer carpeta-A carpeta-B\n' +
      '     node fase2/estadistica.mjs carpeta-A carpeta-B\n     node fase2/estadistica.mjs --potencia [rèpliques]');
    process.exit(2);
  };
  if (args[0] === '--potencia') {
    const reps = Number(args[1] ?? 20000);
    const b = twoStageBounds(50 / 80);
    console.log(`Dues etapes (50 → 80): etapa 1 |Z| > ${b.c1.toFixed(3)} (p < ${b.p1.toFixed(4)}), etapa 2 |Z| > ${b.c2.toFixed(3)} (p < ${b.p2.toFixed(4)})`);
    console.log(`Procediment sencer, ${reps} rèpliques per escenari (rebuig ± error de Monte Carlo; aturades a l'etapa 1; experiments esperats):`);
    for (const sc of SCENARIOS) {
      const r = simulateTwoStage({ A: sc.A, B: sc.B, c1: b.c1, c2: b.c2, reps });
      console.log(`  ${sc.name.padEnd(68)} ${(r.rate * 100).toFixed(2)} % ± ${(r.se * 100).toFixed(2)}   ${(r.stopped1 * 100).toFixed(0)} %   ${r.experiments.toFixed(0)}`);
    }
  } else if (args[0] === '--etapa') {
    const stage = args[1];
    let rest = args.slice(2), manifestFile = null, explicitCommit = null, test = false;
    for (;;) {
      if (rest[0] === '--manifest') { manifestFile = rest[1]; rest = rest.slice(2); }
      else if (rest[0] === '--commit') { explicitCommit = rest[1]; rest = rest.slice(2); }
      else if (rest[0] === '--prova') { test = true; rest = rest.slice(1); }
      else break;
    }
    if (!['1', '2'].includes(stage) || rest.length !== 2) usage();
    if (!test && (manifestFile || explicitCommit)) {
      console.log("--commit i --manifest només es poden fer servir amb --prova: la decisió confirmatòria es pren amb l'etiqueta del preregistre.");
      process.exit(1);
    }
    if (test && (!manifestFile || !/^[0-9a-f]{40}$/.test(explicitCommit ?? ''))) {
      console.log('--prova necessita --manifest i --commit amb un hash complet de 40 caràcters.');
      process.exit(1);
    }
    let commit, manifest, source;
    if (test) {
      ({ commit } = { commit: explicitCommit });
      manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
      source = `PROVA, NO CONFIRMATÒRIA: --commit i --manifest ${manifestFile}`;
    } else {
      const pre = preregistration();
      if (pre.problem) {
        console.log(`No es pot prendre la decisió confirmatòria: ${pre.problem}.`);
        process.exit(1);
      }
      ({ commit, manifest } = pre);
      source = "etiqueta de git preregistre-llei2; manifest i programa d'aquest commit";
    }
    const { A, B, errors, code } = validateSeries(rest[0], rest[1], manifest, stage, { commit });
    if (errors.length) {
      console.log(`La sèrie NO és la preregistrada (${errors.length} problemes): no es pren cap decisió.`);
      for (const e of errors.slice(0, 50)) console.log(`  - ${e}`);
      if (errors.length > 50) console.log(`  … i ${errors.length - 50} més`);
      process.exit(1);
    }
    if (stage === '2') {
      const { z1, rejected1 } = stageOneCheck(A, B, manifest);
      console.log(`Etapa 1 recalculada sobre les seves llavors: Z1 = ${z1.toFixed(4)} (límit |Z| > ${manifest.stages[1].bound})`);
      if (rejected1) {
        console.log("L'etapa 1 ja rebutjava H0: la sèrie s'havia d'acabar allà. No hi ha decisió d'etapa 2.");
        process.exit(1);
      }
    }
    console.log(`Commit del preregistre: ${commit} (${source})`);
    const label = test ? 'DECISIÓ DE PROVA (no confirmatòria)' : 'DECISIÓ';
    const lr = logrank(A, B);
    const { bound, decision } = decide(stage, lr.z, manifest);
    const all = createHash('sha256').update([...A, ...B].map((x) => x.hash).join('\n')).digest('hex');
    console.log(`Sèrie validada: etapa ${stage}, ${A.length} + ${B.length} experiments, commit ${code}`);
    console.log(`Empremta dels fitxers (SHA-256): ${all}`);
    console.log(`Log-rank: Z = ${lr.z.toFixed(4)}; límit de l'etapa ${stage}: |Z| > ${bound}`);
    console.log(`${label}: ${decision}`);
    if (Math.abs(lr.z) > bound && stage === '1') console.log("(Amb aturada a l'etapa 1, la mida de l'efecte és descriptiva: en un disseny seqüencial tendeix a sobreestimar-se.)");
    console.log('');
    console.log(report(A, B, { labelA: manifest.groups.A.label, labelB: manifest.groups.B.label }));
  } else if (args.length === 2) {
    console.log("Informe descriptiu, sense validació ni decisió (per a la sèrie confirmatòria, feu servir --etapa).\n");
    console.log(report(readSeries(args[0]), readSeries(args[1]), { labelA: basename(args[0]), labelB: basename(args[1]) }));
  } else usage();
}
