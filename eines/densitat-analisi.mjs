// L'anàlisi del nivell 1 de B1 (docs/pla-b1.md, §5 i §6), escrita abans de calcular res. Llegeix els JSONL d'eines/densitat.mjs
// d'una carpeta, els valida i en treu, per a cada distribució i química, la densitat de replicadors hereditaris; contra C0,
// programa a programa, la taula aparellada; i les regles del pla: els controls, l'ampliació i quines variants van a la sopa.
//
//   node eines/densitat-analisi.mjs carpeta
//
// La validació (si hi ha cap problema, els llista i no analitza res):
//   - cada fitxer, sencer: la línia d'inici, els replicadors en ordre i dins del seu tros, els recomptes acumulats, la línia
//     final amb els totals i l'empremta, tornada a calcular;
//   - la línia d'inici: una química i una distribució conegudes, la prova del cens, i l'ordre que diu el mateix que els camps; i
//     els bytes de cada replicador, els del programa que en donen la llavor i l'índex;
//   - tots, del mateix commit, sense "+canvis", i amb la SHA-256 dels mòduls que fan el càlcul igual que la dels d'aquesta còpia
//     (AUD-139, AU2-102);
//   - el pla sencer, ni més ni menys (AUD-142, AU2-103): la llavor i el soroll del pla, les dues distribucions, totes les
//     químiques de cadascuna, i una N que el pla preveu (10⁷, o 10⁸ després de l'ampliació, amb d-mig);
//   - per a cada distribució i química, els trossos cobreixen de 0 a N sense forats ni solapaments, i totes les químiques
//     d'una distribució tenen la mateixa N: són els mateixos programes (§5).
// Tot és descriptiu (§6): els intervals són de Clopper-Pearson, del 95 %. El del quocient de dues densitats és el de dos
// recomptes de Poisson independents (la binomial condicionada); amb els mateixos programes, és conservador (la cobertura, per
// simulació: node eines/densitat-cobertura.mjs).
import { readFileSync, readdirSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { OPCODES, CHEMISTRIES, PROGRAM_SIZE } from '../fase1/bff.js';
import { soupFor, moduleHashes, MODULES, NOISE, DISTRIBUTIONS, TEST } from './densitat.mjs';

// El pla (§5): la llavor, el soroll de la prova, i, per a cada distribució, les químiques i les N possibles. Si hi falta o hi
// sobra res, no s'analitza res (AUD-142, AU2-103)
export const PLAN = Object.freeze({
  seed: 20261101,
  noise: NOISE,
  distributions: { 'd-mig': { chemistries: Object.keys(CHEMISTRIES), sizes: [1e7, 1e8] }, uniforme: { chemistries: ['C0', 'K0'], sizes: [1e7] } },
});
export const CONTROLS = ['K0', 'L0', 'X0'];  // han de donar 0 (§2). S4 no: el company hi pot copiar el programa (AUD-140)
export const EXTEND_BELOW = 30;              // si C0 en té menys, amb d-mig, totes les variants passen a 10⁸ programes (§5)
const KEYS = ['tested', 'replicates', 'heritable', 'heritableSolo', 'heritableContext'];

// P(X ≤ k) per a X ~ Binomial(n, p), sumant els termes fins a k (k és petit: els replicadors són rars). ln C(n, i) es fa de
// terme a terme, sense cap taula: serveix amb n = 10⁸
function binomCdf(k, n, p) {
  if (k < 0) return 0;
  if (k >= n || p <= 0) return 1;
  if (p >= 1) return 0;
  const lp = Math.log(p), lq = Math.log1p(-p);
  let lc = 0, s = 0;
  for (let i = 0; i <= k; i++) {
    if (i > 0) lc += Math.log(n - i + 1) - Math.log(i);
    s += Math.exp(lc + i * lp + (n - i) * lq);
  }
  return Math.min(1, s);
}
// L'interval de Clopper-Pearson, com el de fase2/maduracio-serie.mjs
export function clopperPearson(k, n, level = 0.95) {
  const a = (1 - level) / 2, bisect = (f) => { let lo = 0, hi = 1; for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (f(mid)) hi = mid; else lo = mid; } return (lo + hi) / 2; };
  const lower = k === 0 ? 0 : bisect((p) => 1 - binomCdf(k - 1, n, p) >= a);
  const upper = k === n ? 1 : bisect((p) => binomCdf(k, n, p) <= a);
  return [lower, upper];
}
// El quocient de dues densitats amb els mateixos programes, x / y, i el seu interval: la binomial condicionada (x de x + y)
export function ratio(x, y) {
  if (x + y === 0) return { value: null, ci: [null, null] };
  const [lo, hi] = clopperPearson(x, x + y);
  const r = (p) => (p >= 1 ? Infinity : p / (1 - p));
  return { value: y ? x / y : Infinity, ci: [r(lo), r(hi)] };
}

// Llegeix i valida un JSONL. Retorna { start, end, found, problems }
export function readRun(file) {
  const problems = [], name = file.split(/[\\/]/).pop();
  let ls;
  try { ls = readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l)); } catch { return { problems: [`${name}: no es pot llegir`] }; }
  const start = ls[0], end = ls[ls.length - 1];
  if (start?.type !== 'start' || end?.type !== 'end' || ls.length < 3) return { problems: [`${name}: no és sencer (sense la línia d'inici o la final)`] };
  // la línia d'inici: el que diuen els camps ho ha de dir l'ordre, i la SHA-256 dels mòduls hi ha de ser
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const known = has(CHEMISTRIES, start.chemistry) && has(DISTRIBUTIONS, start.distribution) && Number.isInteger(start.seed);
  const arg = (k, d) => { const m = new RegExp(`(?:^| )--${k} (\\S+)`).exec(start.command ?? ''); return m ? m[1] : d; };
  if (!known) problems.push(`${name}: una química, una distribució o una llavor desconegudes (${start.chemistry}, ${start.distribution}, ${start.seed})`);
  if (!/^node eines\/densitat\.mjs /.test(start.command ?? '') || arg('quimica') !== start.chemistry || arg('distribucio') !== start.distribution ||
      Number(arg('llavor')) !== start.seed || Number(arg('programes')) !== start.programs || Number(arg('de', '0')) !== start.from) problems.push(`${name}: l'ordre no diu el mateix que els camps de la línia d'inici`);
  if (start.test !== TEST) problems.push(`${name}: la prova no és la del cens (${start.test})`);
  if (typeof start.modules !== 'object' || start.modules === null || Object.keys(start.modules).length !== MODULES.length ||
      MODULES.some((m) => !/^[0-9a-f]{64}$/.test(start.modules[m] ?? ''))) problems.push(`${name}: sense la SHA-256 dels mòduls (${MODULES.join(', ')})`);
  const totals = Object.fromEntries(KEYS.map((k) => [k, 0])), found = [], hash = createHash('sha256');
  let last = start.from - 1, upTo = start.from;
  for (const o of ls.slice(1, -1)) {
    hash.update(JSON.stringify(o) + '\n');
    if (o.type === 'replicator') {
      if (!(Number.isInteger(o.index) && o.index > last && o.index >= upTo && o.index < start.to)) problems.push(`${name}: un replicador fora d'ordre o del seu tros (${o.index})`);
      // l'herència sola demana la replicació sola, i la de context, la de context
      if (!(o.solo || o.context) || (o.heritableSolo && !o.solo) || (o.heritableContext && !o.context) || !/^[0-9a-f]{128}$/.test(o.bytes ?? '')) problems.push(`${name}: el replicador ${o.index} no és coherent`);
      // els bytes, els del programa de la llavor i l'índex: lliga el registre al generador (auditor 1)
      else if (known && Number.isInteger(o.index) && o.bytes !== Buffer.from(soupFor(o.index, start.seed, start.distribution).subarray(0, PROGRAM_SIZE)).toString('hex')) problems.push(`${name}: els bytes del replicador ${o.index} no són els del seu programa`);
      last = o.index;
      found.push(o);
      totals.replicates++;
      if (o.heritableSolo || o.heritableContext) totals.heritable++;
      if (o.heritableSolo) totals.heritableSolo++;
      if (o.heritableContext) totals.heritableContext++;
    } else if (o.type === 'count') {
      if (!(o.upTo > upTo && o.upTo <= start.to)) problems.push(`${name}: un recompte fora d'ordre (${o.upTo})`);
      if (last >= o.upTo) problems.push(`${name}: el replicador ${last} és després del recompte fins a ${o.upTo}`);
      totals.tested = o.upTo - start.from;
      upTo = o.upTo;
      for (const k of KEYS) if (o[k] !== totals[k]) problems.push(`${name}: el recompte fins a ${o.upTo} no és el dels replicadors (${k})`);
    } else problems.push(`${name}: una línia desconeguda (${o.type})`);
  }
  if (upTo !== start.to) problems.push(`${name}: els recomptes no arriben al final del tros`);
  for (const k of KEYS) if (end[k] !== totals[k]) problems.push(`${name}: el total de la línia final no és el dels recomptes (${k})`);
  if (end.from !== start.from || end.to !== start.to || start.to - start.from !== start.programs) problems.push(`${name}: el tros de la línia final no és el de la d'inici`);
  if (end.fingerprint !== hash.digest('hex')) problems.push(`${name}: l'empremta no és la dels resultats`);
  return { name, start, end, found, problems };
}

// Llegeix la carpeta i la valida sencera, contra el pla i els mòduls d'aquesta còpia (les proves hi passen els seus). Retorna
// { groups, problems }: groups[distribució][química] = { n, found }
export function readFolder(dir, { plan = PLAN, modules = moduleHashes() } = {}) {
  const problems = [], groups = {};
  const files = readdirSync(dir).filter((f) => f.endsWith('.jsonl')).sort();
  if (!files.length) return { groups, problems: [`${dir}: cap JSONL`] };
  const runs = files.map((f) => readRun(join(dir, f)));
  for (const r of runs) problems.push(...r.problems);
  if (problems.length) return { groups, problems };
  const first = runs[0].start;
  for (const r of runs) {
    if (r.start.code !== first.code || !/^[0-9a-f]{7,40}$/.test(r.start.code)) problems.push(`${r.name}: el codi és ${r.start.code}, i ha de ser el mateix commit a tots, sense canvis (${first.code})`);
    if (r.start.seed !== plan.seed || r.start.noise !== plan.noise) problems.push(`${r.name}: la llavor o el soroll no són els del pla (${plan.seed}, ${plan.noise})`);
    const other = MODULES.filter((m) => r.start.modules[m] !== modules[m]);
    if (other.length) problems.push(`${r.name}: ${other.join(', ')}, amb una altra SHA-256 que a aquesta còpia: el registre és d'un altre codi`);
  }
  const pieces = {};
  for (const r of runs) ((pieces[r.start.distribution] ??= {})[r.start.chemistry] ??= []).push(r);
  // el pla sencer: totes les químiques de cada distribució, i cap més
  for (const [dist, spec] of Object.entries(plan.distributions)) {
    const have = Object.keys(pieces[dist] ?? {});
    const missing = spec.chemistries.filter((c) => !have.includes(c)), extra = have.filter((c) => !spec.chemistries.includes(c));
    if (missing.length) problems.push(`${dist}: hi falten les químiques ${missing.join(', ')}`);
    if (extra.length) problems.push(`${dist}: les químiques ${extra.join(', ')} no són del pla`);
  }
  for (const dist of Object.keys(pieces)) if (!plan.distributions[dist]) problems.push(`la distribució ${dist} no és del pla`);
  for (const [dist, byChem] of Object.entries(pieces)) {
    groups[dist] = {};
    let n = null;
    for (const [chem, rs] of Object.entries(byChem)) {
      rs.sort((a, b) => a.start.from - b.start.from);
      let at = 0;
      for (const r of rs) {
        if (r.start.from !== at) problems.push(`${dist}, ${chem}: ${r.start.from > at ? 'hi falten' : 'es repeteixen'} programes a partir del ${at}`);
        at = Math.max(at, r.start.to);
      }
      if (n !== null && at !== n) problems.push(`${dist}, ${chem}: ${at} programes, i les altres químiques en tenen ${n}`);
      n ??= at;
      groups[dist][chem] = { n: at, found: rs.flatMap((r) => r.found) };
    }
    const sizes = plan.distributions[dist]?.sizes;
    if (sizes && n !== null && !sizes.includes(n)) problems.push(`${dist}: ${n} programes, i el pla en preveu ${sizes.join(' o ')}`);
  }
  // l'ampliació (§5): la N gran només si, amb la petita, C0 hi tenia menys de EXTEND_BELOW hereditaris. Són els mateixos
  // programes, i els primers ho diuen (AU2-103: les N, segons l'etapa)
  const [small, large] = plan.distributions['d-mig']?.sizes ?? [], c0 = groups['d-mig']?.C0;
  if (large && c0?.n === large) {
    const before = c0.found.filter((o) => o.index < small && (o.heritableSolo || o.heritableContext)).length;
    if (before >= EXTEND_BELOW) problems.push(`d-mig: ${large} programes, però amb els primers ${small} C0 ja hi tenia ${before} hereditaris: l'ampliació no tocava (§5)`);
  }
  return { groups, problems };
}

const INSTRUCTIONS = new Set([...OPCODES].map((c) => c.charCodeAt(0)));
const fmt = (x) => (x === null ? '—' : x === Infinity ? '∞' : x.toFixed(2));
const sci = (x) => (x === 0 ? '0' : x.toExponential(2).replace('e', '·10^').replace('+', ''));
const median = (v) => { const s = [...v].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

// L'anàlisi: les línies del text, en ordre
export function analyse(groups) {
  const out = [], heritableOf = (g) => g.found.filter((o) => o.heritableSolo || o.heritableContext);
  // les químiques, en l'ordre del pla (fase1/bff.js); les distribucions, en ordre alfabètic
  const order = Object.keys(CHEMISTRIES), byPlan = (cs) => [...cs].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  for (const dist of Object.keys(groups).sort()) {
    const g = groups[dist], chems = byPlan(Object.keys(g)), base = g.C0;
    out.push(`Distribució ${dist}: ${chems.length} químiques, ${g[chems[0]].n} programes cadascuna, els mateixos a totes`);
    for (const chem of chems) {
      const { n } = g[chem], h = heritableOf(g[chem]), k = h.length, [lo, hi] = clopperPearson(k, n);
      const solo = h.filter((o) => o.heritableSolo).length, context = k - solo;
      let line = `  ${chem}: ${k} hereditaris de ${n} (${sci(k / n)}; IC del 95 %, de ${sci(lo)} a ${sci(hi)}); sols ${solo}, només en context ${context}; es repliquen ${g[chem].found.length}`;
      if (k) {
        const instr = h.map((o) => Buffer.from(o.bytes, 'hex').reduce((s, b) => s + (INSTRUCTIONS.has(b) ? 1 : 0), 0));
        line += `; instruccions per programa, de ${Math.min(...instr)} a ${Math.max(...instr)} (mediana ${median(instr)})`;
      }
      out.push(line);
    }
    if (base) {
      const c0 = new Set(heritableOf(base).map((o) => o.index));
      out.push(`  Contra C0, programa a programa (els hereditaris a totes dues, només a C0, només a la variant; el quocient de densitats i el seu interval):`);
      for (const chem of chems.filter((c) => c !== 'C0')) {
        const x = new Set(heritableOf(g[chem]).map((o) => o.index));
        const both = [...x].filter((i) => c0.has(i)).length, r = ratio(x.size, c0.size);
        out.push(`    ${chem}: ${both}, ${c0.size - both}, ${x.size - both}; quocient ${fmt(r.value)} (de ${fmt(r.ci[0])} a ${fmt(r.ci[1])})`);
      }
    }
    for (const chem of CONTROLS.filter((c) => g[c])) {
      const h = heritableOf(g[chem]);
      if (h.length) out.push(`  ATENCIÓ: el control ${chem} té ${h.length} hereditaris (programes ${h.slice(0, 10).map((o) => o.index).join(', ')}${h.length > 10 ? '…' : ''}). Cal mirar-los un a un abans d'interpretar res (§6)`);
    }
  }
  const main = groups['d-mig'];
  const failedControls = Object.values(groups).some((g) => CONTROLS.some((c) => g[c] && heritableOf(g[c]).length));
  if (failedControls) {
    out.push("Les regles de l'ampliació i del nivell 2 no s'apliquen fins que no s'hagin mirat els hereditaris dels controls (§6)");
  } else if (main?.C0) {
    const k0 = heritableOf(main.C0).length;
    if (main.C0.n >= 1e8) out.push(`Ampliació (§5): ja són ${main.C0.n} programes`);
    else if (k0 < EXTEND_BELOW) out.push(`Ampliació (§5): C0 hi té ${k0} hereditaris, menys de ${EXTEND_BELOW}: totes les variants passen a 10⁸ programes, els mateixos`);
    else out.push(`Ampliació (§5): C0 hi té ${k0} hereditaris: no cal`);
    // amb l'ampliació pendent, la llista del nivell 2 no surt: es fa amb els 10⁸ programes (AUD-142)
    if (main.C0.n < 1e8 && k0 < EXTEND_BELOW) out.push("Al nivell 2 (§6): es decidirà amb els 10⁸ programes, després de l'ampliació");
    else {
      const level2 = byPlan(Object.keys(main)).filter((c) => c === 'C0' || heritableOf(main[c]).length > 0);
      out.push(`Al nivell 2 (§6), amb d-mig: ${level2.join(', ')}`);
      const none = byPlan(Object.keys(main)).filter((c) => !level2.includes(c));
      if (none.length) out.push(`Sense cap hereditari en ${main.C0.n} programes: ${none.join(', ')} (la cota del 95 %, ${sci(clopperPearson(0, main.C0.n)[1])})`);
    }
  }
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.argv[2];
  if (!dir || process.argv.length !== 3) { console.error('Ús: node eines/densitat-analisi.mjs carpeta'); process.exit(2); }
  const { groups, problems } = readFolder(dir);
  if (problems.length) {
    console.log(`Els registres no són els del pla (${problems.length} problemes):\n${problems.slice(0, 20).map((p) => `  ${p}`).join('\n')}${problems.length > 20 ? `\n  i ${problems.length - 20} més` : ''}`);
    process.exit(1);
  }
  for (const l of analyse(groups)) console.log(l);
}
