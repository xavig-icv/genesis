// Anàlisi EXPLORATÒRIA de B2: quant dura la vida establerta (pla de la iteració 4). No decideix res: serveix
// per dissenyar la sèrie preregistrada (el llindar de "mort", l'horitzó, quantes llavors de continuació i
// la prova). Només llegeix les branques de la part "exploracio" del repartiment, i la història original
// (de la sèrie de la llei 2) d'aquests mateixos mons; mai els de la part "confirmacio".
//
//   node fase2/b2-analisi.mjs [carpeta-branques] [--repartiment fitxer] [--serie carpeta]
//
// Per defecte: fase2/resultats/b2/exploracio, fase2/resultats/b2/repartiment.json i
// fase2/resultats/serie-llei2.
//
// Cada branca és un JSONL de sim.mjs --from (la captura de l'època t de l'establiment), amb la llavor
// d'origen + 100.000 i m = 0 o m = 0,01. La "mort" de la vida establerta és el primer de dos censos seguits
// que no compleixen la regla. Se n'informa amb tres regles candidates (auditoria 8: AUD-60 i AU2-41):
//   R1 · menys de l'1 % d'hereditaris (la regla provisional, el mateix llindar que l'establiment)
//   R2 · 5 hereditaris de 2.048 o menys (< 0,25 %), amb marge sobre l'1 %
//   R3 · cap hereditari
// i també la mort de la còpia (menys de l'1 % que es copien), per separat (AUD-60, §6.1). Una mort és
// "falsa" si després algun cens torna a l'1 % d'hereditaris abans de l'horitzó.
import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { readExperiment, firstRun } from './estadistica.mjs';

export const SEED_OFFSET = 100000;
export const RULES = {
  'R1 · < 1 %': (c) => c.heritable / c.sample >= 0.01,
  'R2 · ≤ 5 de 2.048': (c) => c.heritable > Math.floor(0.0025 * c.sample),
  'R3 · cap hereditari': (c) => c.heritable > 0,
};
const copyAlive = (c) => c.replicating / c.sample >= 0.01;

// Una branca: { name, group, originSeed, seed, mixing, t, horizon, censuses, seconds, complete, file }
export function readBranch(file) {
  const x = readExperiment(file);
  const start = x.records.find((r) => r.type === 'start');
  const group = /serie-llei2\/([AB])\/captures\//.exec(start.from ?? '')?.[1] ?? null;
  const last = x.measures[x.measures.length - 1];
  return {
    file, name: basename(file, '.jsonl'), group, originSeed: start.seed - SEED_OFFSET, seed: start.seed, mixing: start.mixing,
    t: start.start, horizon: start.epochs - start.start, censuses: x.censuses, seconds: last?.seconds ?? null,
    complete: x.records[x.records.length - 1]?.type === 'end' && x.end >= start.epochs,
  };
}

// La mort amb una regla: el primer de dos censos seguits que no la compleixen. Retorna { first, second,
// recovered } (recovered: algun cens posterior torna a l'1 % d'hereditaris) o null
export function death(b, alive, count = 2) {
  const every = b.censuses.length > 1 ? b.censuses[1].epoch - b.censuses[0].epoch : 250;
  const first = firstRun(b.censuses, (c) => !alive(c), count, every);
  if (first === null) return null;
  const second = first + (count - 1) * every;
  const recovered = b.censuses.some((c) => c.epoch > second && RULES['R1 · < 1 %'](c));
  return { first, second, recovered };
}

// La durada restringida a l'horitzó, datada al primer cens de la mort (o al segon, amb second: true)
export function lifespan(b, d, { second = false } = {}) {
  return d === null ? b.horizon : Math.min(b.horizon, (second ? d.second : d.first) - b.t);
}

// Prova de signes exacta, bilateral (descriptiva)
export function signTest(pos, neg) {
  const n = pos + neg;
  if (n === 0) return 1;
  const k = Math.min(pos, neg);
  let tail = 0, c = 1;
  for (let i = 0; i <= n; i++) { if (i <= k) tail += c; c = (c * (n - i)) / (i + 1); }
  return Math.min(1, (2 * tail) / 2 ** n);
}

export function analyse(branches, { worlds, originals = new Map() }) {
  const lines = [];
  const key = (b) => `${b.group}${b.originSeed}`;
  const byWorld = new Map();
  for (const b of branches) {
    if (!byWorld.has(key(b))) byWorld.set(key(b), {});
    byWorld.get(key(b))[b.mixing] = b;
  }
  const expected = worlds.filter((w) => w.part === 'exploracio');
  lines.push(`Branques: ${branches.length} (incompletes: ${branches.filter((b) => !b.complete).length}); mons: ${byWorld.size} de ${expected.length} d'exploració`);
  const missing = expected.filter((w) => !byWorld.has(`${w.group}${w.seed}`) || Object.keys(byWorld.get(`${w.group}${w.seed}`)).length < 2);
  if (missing.length) lines.push(`  ATENCIÓ: mons sense les dues branques: ${missing.map((w) => w.group + w.seed).join(', ')}`);
  const H = Math.min(...branches.map((b) => b.horizon));
  lines.push(`Horitzó: ${H} èpoques des de t`);

  for (const [rule, alive] of Object.entries(RULES)) {
    lines.push('', `${rule} (dos censos seguits)`);
    for (const g of ['A', 'B']) {
      for (const m of [0, 0.01]) {
        const bs = branches.filter((b) => b.group === g && b.mixing === m);
        const ds = bs.map((b) => death(b, alive));
        const dead = ds.filter(Boolean);
        const L = bs.map((b, i) => lifespan(b, ds[i]));
        const mean = L.length ? L.reduce((s, x) => s + x, 0) / L.length : NaN;
        lines.push(`  origen ${g}, m = ${m}: ${dead.length} morts de ${bs.length} (falses: ${dead.filter((d) => d.recovered).length}); durada mitjana ${mean.toFixed(0)} èpoques`);
      }
    }
    // Aparellat pel món: D = L(m = 0) − L(m = 0,01)
    let pos = 0, neg = 0, zero = 0; const Ds = [];
    for (const pair of byWorld.values()) {
      if (!pair[0] || !pair[0.01]) continue;
      const D = lifespan(pair[0], death(pair[0], alive)) - lifespan(pair[0.01], death(pair[0.01], alive));
      Ds.push(D); if (D > 0) pos++; else if (D < 0) neg++; else zero++;
    }
    const meanD = Ds.length ? Ds.reduce((s, x) => s + x, 0) / Ds.length : NaN;
    lines.push(`  aparellat (${Ds.length} mons): D = L(0) − L(0,01) mitjana ${meanD.toFixed(0)} èpoques; vida més llarga sense corrent ${pos}, amb corrent ${neg}, iguals ${zero}; prova de signes p = ${signTest(pos, neg).toFixed(3)} (descriptiva)`);
  }

  lines.push('', 'La mort de la còpia (menys de l\'1 % que es copien, dos censos seguits):');
  for (const m of [0, 0.01]) {
    const bs = branches.filter((b) => b.mixing === m);
    lines.push(`  m = ${m}: ${bs.filter((b) => death(b, copyAlive)).length} de ${bs.length}`);
  }

  // AUD-61: la història original de t a t + 1.000 com a segona realització de la branca de la condició d'origen
  lines.push('', "Concordança amb la història original a t + 1.000 (R1), branca de la condició d'origen (AUD-61):");
  let both = 0, onlyOrig = 0, onlyBranch = 0, neither = 0, n = 0;
  for (const pair of byWorld.values()) {
    const any = pair[0] ?? pair[0.01];
    const orig = originals.get(key(any));
    const b = any.group === 'A' ? pair[0] : pair[0.01];
    if (!orig || !b) continue;
    const at = (cs, e) => cs.find((c) => c.epoch === e);
    const o = at(orig.censuses, b.t + 1000), c = at(b.censuses, b.t + 1000);
    if (!o || !c) continue;
    n++;
    const ao = RULES['R1 · < 1 %'](o), ab = RULES['R1 · < 1 %'](c);
    if (ao && ab) both++; else if (ao) onlyOrig++; else if (ab) onlyBranch++; else neither++;
  }
  lines.push(`  ${n} mons: viva a totes dues ${both}, només a l'original ${onlyOrig}, només a la branca ${onlyBranch}, a cap ${neither}`);

  const secs = branches.filter((b) => b.seconds !== null);
  const alive = secs.filter((b) => !death(b, RULES['R1 · < 1 %'])), dead = secs.filter((b) => death(b, RULES['R1 · < 1 %']));
  const mean = (v) => (v.length ? v.reduce((s, b) => s + b.seconds, 0) / v.length / 60 : NaN);
  lines.push('', `Cost (minuts per branca): sense mort (R1) ${mean(alive).toFixed(0)}, amb mort ${mean(dead).toFixed(0)}`);
  return lines.join('\n');
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const args = process.argv.slice(2);
  const opt = (name, def) => { const i = args.indexOf(name); if (i < 0) return def; const v = args[i + 1]; args.splice(i, 2); return v; };
  const root = fileURLToPath(new URL('..', import.meta.url));
  const repartiment = opt('--repartiment', join(root, 'fase2/resultats/b2/repartiment.json'));
  const serie = opt('--serie', join(root, 'fase2/resultats/serie-llei2'));
  const dir = args[0] ?? join(root, 'fase2/resultats/b2/exploracio');
  const { worlds } = JSON.parse(readFileSync(repartiment, 'utf8'));
  const part = new Map(worlds.map((w) => [`${w.group}${w.seed}`, w.part]));
  const branches = readdirSync(dir).filter((f) => f.endsWith('.jsonl')).map((f) => readBranch(join(dir, f)));
  const forbidden = branches.filter((b) => part.get(`${b.group}${b.originSeed}`) !== 'exploracio');
  if (forbidden.length) {
    console.log(`Hi ha branques de mons que no són d'exploració (${forbidden.map((b) => b.name).join(', ')}): no s'analitza res.`);
    process.exit(1);
  }
  const originals = new Map();
  for (const w of worlds.filter((w) => w.part === 'exploracio')) {
    originals.set(`${w.group}${w.seed}`, readExperiment(join(serie, w.group, `${w.seed}.jsonl`)));
  }
  console.log('Anàlisi EXPLORATÒRIA de B2 (no decideix res)\n');
  console.log(analyse(branches, { worlds, originals }));
}
