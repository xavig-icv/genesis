// La prova preregistrada dels zeros (docs/protocol-zeros.md): la lectura i la validació dels registres de les branques,
// i l'anàlisi. Només la carrega fase2/zeros-confirmacio.mjs, després de comprovar el preregistre.
//
// La mesura principal és la proporció d'hereditaris al primer cens de cada branca (t + 250). Aquest cens té la mateixa
// mostra de cel·les a tots els braços, perquè el cens té una llavor fixa i és la primera vegada que se'n fa servir
// l'atzar. El valor d'un món i un braç és la mitjana de les seves llavors de continuació, i el món és la unitat.
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const LOSS_MAX = 5; // la regla R2: 5 hereditaris o menys, de 2.048, en dos censos seguits
export const RECOVER_MIN = 21; // la recuperació: l'1 % de 2.048

// Les branques que el manifest espera: [{ id, world, role, arm, tag, seed, from, start, epochs }]
export function expectedBranches(manifest) {
  const p = manifest.params, out = [];
  for (const w of manifest.worlds.filter((x) => x.included)) {
    for (const arm of p.arms) {
      for (const [tag, offset] of p.continuation) {
        out.push({ id: `${w.world}-${arm}-${tag}`, world: w.world, role: w.role, arm, tag, seed: Number(w.world.replace(/^[AB]/, '')) + offset, from: w.arms[arm].file, start: w.start, epochs: w.start + p.horizon });
      }
    }
  }
  return out;
}

// Els problemes d'un registre de branca, contra el que n'espera el manifest (buit si és correcte)
export function branchProblems(records, b, manifest, commit) {
  const p = [], every = 250;
  const start = records[0], end = records[records.length - 1];
  if (!start || start.type !== 'start') return [`${b.id}: no comença amb la línia d'inici`];
  if (!end || end.type !== 'end') return [`${b.id}: no acaba amb la línia final (incomplet)`];
  if (commit && start.code !== commit.slice(0, start.code.length)) p.push(`${b.id}: el codi és ${start.code}, no el del preregistre`);
  if (!commit || start.code.includes('+canvis') || start.code.length < 7) p.push(`${b.id}: el codi del registre no és un commit net (${start.code})`);
  const want = { seed: b.seed, from: b.from, start: b.start, epochs: b.epochs, mixing: manifest.params.mixing, rng: 'v2' };
  for (const [k, v] of Object.entries(want)) if (start[k] !== v) p.push(`${b.id}: ${k} és ${JSON.stringify(start[k])}, i el manifest diu ${JSON.stringify(v)}`);
  if (!start.census || start.census.version !== 'v3' || start.census.every !== every || start.census.sample !== 2048) p.push(`${b.id}: el cens no és el v3 cada 250, amb una mostra de 2.048`);
  if (end.epoch !== b.epochs || end.reason !== 'horitzó') p.push(`${b.id}: acaba a l'època ${end.epoch} (${end.reason}), no a ${b.epochs} per l'horitzó`);
  const cs = records.filter((r) => r.type === 'census');
  const epochs = cs.map((c) => c.epoch), wantEpochs = [];
  for (let e = b.start + every; e <= b.epochs; e += every) wantEpochs.push(e);
  if (epochs.join(',') !== wantEpochs.join(',')) p.push(`${b.id}: els censos no són els de cada 250 èpoques de ${b.start + every} a ${b.epochs}`);
  for (const c of cs) {
    if (!(c.sample === 2048 && Number.isInteger(c.heritable) && c.heritable >= 0 && c.heritable <= c.sample)) { p.push(`${b.id}: el cens de l'època ${c.epoch} no és vàlid`); break; }
  }
  return p;
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
    h1: share(cs[0]),
    h234: (share(cs[1]) + share(cs[2]) + share(cs[3])) / 3,
    loss, recovered, final: share(cs[cs.length - 1]),
  };
}

// Llegeix i valida totes les branques. Retorna { worlds, problems }; worlds: world → { role, arms: { arm → [mesures] } }
export function readSeries(folder, manifest, { commit } = {}) {
  const problems = [], worlds = new Map();
  for (const b of expectedBranches(manifest)) {
    const f = join(folder, `${b.id}.jsonl`);
    if (!existsSync(f)) { problems.push(`${b.id}: no hi ha el registre`); continue; }
    let records;
    try { records = readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l)); }
    catch { problems.push(`${b.id}: el registre no es pot llegir`); continue; }
    const bad = branchProblems(records, b, manifest, commit);
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

const mean = (v) => v.reduce((a, b) => a + b, 0) / v.length;
const pct = (x) => `${(100 * x).toFixed(1)} %`;

export function analyse(worlds, manifest) {
  const t = manifest.test, lines = [];
  const test = [...worlds].filter(([, w]) => w.role === 'prova');
  const controls = [...worlds].filter(([, w]) => w.role !== 'prova');
  const value = (w, arm, key = 'h1') => mean(w.arms[arm].map((m) => m[key]));
  lines.push(`La mesura principal (${t.measure}), mitjana de les llavors de cada món:`);
  lines.push(`  món      paper            ${manifest.params.arms.map((a) => a.padEnd(13)).join('')}`);
  for (const [id, w] of [...test, ...controls]) lines.push(`  ${id.padEnd(8)} ${w.role.padEnd(16)} ${manifest.params.arms.map((a) => pct(value(w, a)).padEnd(13)).join('')}`);
  const results = t.contrasts.map(([a, b]) => {
    const d = test.map(([, w]) => value(w, a) - value(w, b));
    const pos = d.filter((x) => x > 0).length, neg = d.filter((x) => x < 0).length, ties = d.length - pos - neg;
    return { a, b, pos, neg, ties, p: signTest(pos, neg), median: [...d].sort((x, y) => x - y)[Math.floor((d.length - 1) / 2)] };
  });
  const h = holm(results.map((r) => r.p), t.alpha);
  results.forEach((r, i) => Object.assign(r, h[i]));
  lines.push('');
  results.forEach((r, i) => lines.push(`Prova ${i + 1}, ${r.a} contra ${r.b} (els ${test.length} mons de prova, prova de signes unilateral): més alta amb ${r.a} a ${r.pos}, més baixa a ${r.neg}, iguals ${r.ties}; p = ${r.p.toFixed(4)}; llindar de Holm ${r.threshold}`));
  lines.push('');
  lines.push('Descriptius:');
  for (const [a, b] of [['placebo-cell', 'continue']]) {
    const d = test.map(([, w]) => value(w, a) - value(w, b));
    lines.push(`  ${a} contra ${b}, als mons de prova: més alta a ${d.filter((x) => x > 0).length}, més baixa a ${d.filter((x) => x < 0).length}`);
  }
  for (const [id, w] of controls) lines.push(`  control negatiu ${id}: zeros-data menys continue ${((value(w, 'zeros-data') - value(w, 'continue')) * 100).toFixed(1)} punts; placebo-cell menys continue ${((value(w, 'placebo-cell') - value(w, 'continue')) * 100).toFixed(1)} punts`);
  for (const arm of manifest.params.arms) {
    const all = [...worlds.values()].flatMap((w) => w.arms[arm]);
    lines.push(`  ${arm}: censos 2 a 4, ${pct(mean(all.map((m) => m.h234)))} de mitjana; pèrdua R2 a ${all.filter((m) => m.loss !== null).length} de ${all.length} branques, recuperades ${all.filter((m) => m.recovered).length}; al cens final, ${pct(mean(all.map((m) => m.final)))}`);
  }
  return { results, lines };
}

// Les frases de les decisions: diuen exactament el que posa a prova cada prova (com a B2, AU2-74)
export function decisionLines({ results }) {
  return results.map((r, i) => `DECISIÓ ${i + 1} (${r.a} contra ${r.b}): ` + (r.rejected
    ? `es rebutja H0: als mons de prova, entre els que tenen una diferència, predominen els que tenen més hereditaris al primer cens amb ${r.a} que amb ${r.b} (més alta: ${r.pos}, més baixa: ${r.neg}, iguals: ${r.ties}; p = ${r.p.toFixed(4)}, llindar de Holm ${r.threshold})`
    : `no es rebutja H0: no concloent; la prova no permet afirmar que, als mons de prova, ${r.a} doni més hereditaris al primer cens que ${r.b} (més alta: ${r.pos}, més baixa: ${r.neg}, iguals: ${r.ties}; p = ${r.p.toFixed(4)}, llindar de Holm ${r.threshold})`));
}
