// L'anàlisi de la prova d'autonomia de B1 (docs/pla-b1.md, §4), escrita abans de calcular res. Llegeix els JSONL
// d'eines/autonomia.mjs d'una carpeta, els valida i en treu, per a cada química, la distribució de les condicions en què cada
// replicador és hereditari amb companys inerts, i les quatre xifres fixades abans.
//
//   node eines/autonomia-analisi.mjs carpeta
//
// La validació (si hi ha cap problema, els llista i no analitza res):
//   - cada fitxer, sencer, amb l'empremta; la línia d'inici, la de l'eina, amb l'ordre, llegida sencera amb el contracte d'opcions de
//     l'eina, que diu el mateix que els camps i que escriu aquest fitxer (AU2-143);
//   - tots del mateix commit, sense "+canvis", i amb la SHA-256 dels mòduls igual que la dels d'aquesta còpia;
//   - el pla sencer, ni més ni menys (PLAN): les químiques i les distribucions, la llavor, les 100 condicions, els 8 companys, la
//     prova, l'extracte, i els companys de cada condició, inerts;
//   - els replicadors de cada fitxer, els hereditaris del registre del nivell 1 de l'extracte, tots i en ordre, amb els mateixos
//     bytes; i cada cadena, de C caràcters 0 o 1, amb l'herència només on hi ha la replicació.
// Tot és descriptiu. La xifra principal d'un replicador és en quantes de les 100 condicions és hereditari, sol o en context: n.
// Les quatre xifres, fixades abans (§4): n ≥ 1, «es pot copiar sense el codi del company»; n > 50, «en la majoria de les condicions
// assajades»; n ≥ 95, «autonomia robusta»; n = 100, «autonomia estricta». Les dues últimes són classificacions operatives de les 100
// condicions assajades, no propietats demostrades amb un nombre finit de proves (auditor 2). Les mateixes quatre xifres, sol i en
// context per separat. "Sol" vol dir que el programa va primer (AUD-175). Els intervals són de Clopper-Pearson, del 95 %: la part dels
// hereditaris de la química que hi passen.
// Els zeros per construcció (AUD-176), comprovats i escrits a la sortida: S2 en context, S3 sol, i S4 en tots dos papers. Amb S4, el
// codi d'una meitat no pot escriure a l'altra, i un company inert no hi executa res: el company no canvia mai, i la tirada d'S4 és un
// control. Si cap no dona 0, és un error del codi, i la sortida ho diu.
import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { OPCODES } from '../fase1/bff.js';
import { AUTONOMY } from './b1-llavors.mjs';
import { EXTRACT_SHA256, fileHashes, readExtract, extractRecord, readJsonl, commandOptions, baseName } from './b1-comu.mjs';
import { clopperPearsonBeta } from './b1-estadistica.mjs';
import { MODULES, TEST, PARTNERS, CONDITIONS, OPTIONS } from './autonomia.mjs';

export const PLAN = Object.freeze({
  seed: AUTONOMY.from, conditions: CONDITIONS, partners: PARTNERS, test: TEST, extract: EXTRACT_SHA256,
  // les químiques amb hereditaris al nivell 1: les deu de la llista del nivell 2 amb D½, i C0 amb bytes uniformes (exploratori)
  runs: Object.freeze({ 'd-mig': ['C0', 'K1', 'K2', 'R0', 'S1', 'S2', 'S3', 'S4', 'X1', 'H64'], uniforme: ['C0'] }),
});
// Els papers on una química no pot replicar res, per construcció: el company, amb companys inerts, no pot canviar (§4; AUD-176)
export const BY_CONSTRUCTION = Object.freeze({ S2: Object.freeze(['context']), S3: Object.freeze(['solo']), S4: Object.freeze(['solo', 'context']) });
export const FIGURES = Object.freeze([
  { name: 'en 1 o més', test: (n) => n >= 1, label: 'es pot copiar sense el codi del company' },
  { name: 'en més de 50', test: (n) => n > 50, label: 'en la majoria de les condicions assajades' },
  { name: 'en 95 o més', test: (n) => n >= 95, label: 'autonomia robusta (operativa)' },
  { name: 'en totes 100', test: (n) => n >= 100, label: 'autonomia estricta (operativa)' },
]);
const KEYS = ['solo', 'context', 'heritableSolo', 'heritableContext'];

// Llegeix i valida la carpeta: { runs, problems }, runs[distribució][química] = { start, reps }
export function readFolder(dir, { plan = PLAN, modules = fileHashes(MODULES), extract = readExtract() } = {}) {
  const problems = [], runs = {};
  const files = readdirSync(dir).filter((f) => f.endsWith('.jsonl')).sort();
  if (!files.length) return { runs, problems: [`${dir}: cap JSONL`] };
  let code = null;
  for (const f of files) {
    const r = readJsonl(join(dir, f));
    problems.push(...r.problems);
    if (r.problems.length) continue;
    const { name, start: s, lines, end } = r, C = plan.conditions;
    // l'ordre, sencera, amb el contracte d'opcions de l'eina: el mateix que els camps de la línia d'inici, sense --registre, i el JSONL,
    // aquest fitxer (AU2-143)
    const { opts: o, error } = commandOptions(s.command, 'eines/autonomia.mjs', OPTIONS);
    if (error || o.registre !== undefined || o.quimica !== s.chemistry || o.distribucio !== s.distribution || o.llavor !== s.seed ||
        o.condicions !== s.conditions || baseName(o.json) !== name) problems.push(`${name}: l'ordre no diu el mateix que els camps de la línia d'inici, o no és la d'aquest fitxer${error ? ` (${error})` : ''}`);
    if (!plan.runs[s.distribution]?.includes(s.chemistry)) { problems.push(`${name}: ${s.chemistry} amb ${s.distribution} no és del pla`); continue; }
    if ((runs[s.distribution] ??= {})[s.chemistry]) { problems.push(`${name}: ${s.chemistry} amb ${s.distribution}, repetit`); continue; }
    if (s.seed !== plan.seed || s.conditions !== C || s.partners !== plan.partners || s.test !== plan.test || s.extractSha256 !== plan.extract) problems.push(`${name}: la llavor, les condicions, els companys, la prova o l'extracte no són els del pla`);
    if (s.inertCheck?.active !== 0 || s.inertCheck?.pairs !== C * plan.partners * (plan.partners - 1)) problems.push(`${name}: la comprovació dels companys inerts no és la de tots, o en va trobar d'actius`);
    if (code === null) code = s.code;
    if (s.code !== code || !/^[0-9a-f]{7,40}$/.test(s.code ?? '')) problems.push(`${name}: el codi és ${s.code}, i ha de ser el mateix commit a tots, sense canvis (${code})`);
    const other = MODULES.filter((m) => s.modules?.[m] !== modules[m]);
    if (other.length) problems.push(`${name}: ${other.join(', ')}, amb una altra SHA-256 que a aquesta còpia: el registre és d'un altre codi`);
    // els replicadors: els hereditaris del registre del nivell 1, tots i en ordre
    let rec;
    try { rec = extractRecord(extract, s.chemistry, s.distribution); } catch (e) { problems.push(`${name}: ${e.message}`); continue; }
    if (s.level1?.fingerprint !== rec.end.fingerprint || s.level1?.seed !== rec.start.seed) problems.push(`${name}: el registre del nivell 1 no és el de l'extracte`);
    if (lines.length !== rec.heritable.length || end.replicators !== lines.length || end.conditions !== C) problems.push(`${name}: ${lines.length} replicadors, i el nivell 1 en té ${rec.heritable.length} d'hereditaris`);
    const reps = [];
    lines.forEach((o, i) => {
      const h = rec.heritable[i];
      if (o.type !== 'replicator' || !h || o.index !== h.index || o.bytes !== h.bytes) { problems.push(`${name}: la línia ${i + 2} no és el replicador ${h?.index} del nivell 1`); return; }
      if (KEYS.some((k) => typeof o[k] !== 'string' || !new RegExp(`^[01]{${C}}$`).test(o[k]))) { problems.push(`${name}: el replicador ${o.index} no té les quatre cadenes de ${C}`); return; }
      for (let j = 0; j < C; j++) if ((o.heritableSolo[j] === '1' && o.solo[j] !== '1') || (o.heritableContext[j] === '1' && o.context[j] !== '1')) { problems.push(`${name}: el replicador ${o.index} no és coherent a la condició ${j}`); return; }
      reps.push({ ...o, level1Solo: h.heritableSolo });
    });
    runs[s.distribution][s.chemistry] = { start: s, reps };
  }
  for (const [dist, chems] of Object.entries(plan.runs)) {
    const missing = chems.filter((c) => !runs[dist]?.[c]);
    if (missing.length) problems.push(`${dist}: hi falten ${missing.join(', ')}`);
  }
  return { runs, problems };
}

const ones = (s) => { let n = 0; for (let j = 0; j < s.length; j++) if (s[j] === '1') n++; return n; };
// Les tres xifres d'un replicador: sol, en context i en alguna de les dues
export function countsOf(o) {
  let any = 0;
  for (let j = 0; j < o.heritableSolo.length; j++) if (o.heritableSolo[j] === '1' || o.heritableContext[j] === '1') any++;
  return { any, solo: ones(o.heritableSolo), context: ones(o.heritableContext) };
}
const INSTRUCTIONS = new Set([...OPCODES].map((c) => c.charCodeAt(0)));
const pct = (k, n) => (n ? `${((100 * k) / n).toFixed(1)} %` : '—');
const median = (v) => { if (!v.length) return '—'; const s = [...v].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const ci = (k, n) => { const [lo, hi] = clopperPearsonBeta(k, n); return `de ${(100 * lo).toFixed(1)} a ${(100 * hi).toFixed(1)} %`; };
const BINS = [[0, 0], [1, 10], [11, 50], [51, 94], [95, 99], [100, 100]];

// Les característiques d'un programa per a la descripció dels robustos i dels fràgils (exploratori, fixades abans)
export function features(hex) {
  const b = Buffer.from(hex, 'hex'), c = (ch) => b.filter((x) => x === ch.charCodeAt(0)).length;
  const instr = [...b].filter((x) => INSTRUCTIONS.has(x));
  return { instructions: instr.length, distinct: new Set(instr).size, loop: c('[') > 0 && c(']') > 0, copies: c('.') + c(','), moves: c('<') + c('>') + c('{') + c('}') };
}

export function analyse(runs) {
  const out = [], summary = [];
  for (const dist of Object.keys(runs).sort()) {
    for (const chem of PLAN.runs[dist].filter((c) => runs[dist][c])) {
      const { reps } = runs[dist][chem], n = reps.length, cs = reps.map(countsOf), nSolo1 = reps.filter((o) => o.level1Solo).length;
      const zero = BY_CONSTRUCTION[chem];
      out.push(`${chem}, ${dist}${dist === 'uniforme' ? ' (exploratori)' : ''}${chem === 'S4' ? ' (un control: 0 per construcció en tots dos papers, AUD-176)' : ''}: ${n} hereditaris del nivell 1 (sols ${nSolo1}, només en context ${n - nSolo1}), ${PLAN.conditions} condicions amb companys inerts`);
      // els zeros per construcció: cap replicació, ni sense herència, en el paper on no n'hi pot haver
      if (zero) {
        out.push(`  Els zeros per construcció (AUD-176): ${zero.map((role) => {
          const k = reps.filter((o) => o[role].includes('1')).length;
          return `${role === 'solo' ? 'sol' : 'en context'}, ${k ? `NO: ${k} replicadors s'hi repliquen (un error del codi)` : `cap de ${n} no s'hi replica (correcte)`}`;
        }).join('; ')}`);
      }
      for (const [role, key] of [['En alguna de les dues proves (la xifra principal)', 'any'], ['Sol (el programa primer)', 'solo'], ['En context (el programa segon)', 'context']]) {
        out.push(`  ${role}:`);
        for (const f of FIGURES) { const k = cs.filter((c) => f.test(c[key])).length; out.push(`    ${f.name}: ${k} (${pct(k, n)}; IC del 95 %, ${ci(k, n)}), ${f.label}`); }
        out.push(`    la distribució: ${BINS.map(([a, b]) => `${a === b ? a : `${a}-${b}`}: ${cs.filter((c) => c[key] >= a && c[key] <= b).length}`).join('; ')}`);
      }
      // amb el nivell 1: els sols i els només en context, per separat
      for (const [label, sel] of [['dels sols al nivell 1', true], ['dels només en context al nivell 1', false]]) {
        const g = cs.filter((_, i) => reps[i].level1Solo === sel);
        out.push(`  ${label} (${g.length}): ${FIGURES.map((f) => `${f.name}, ${g.filter((c) => f.test(c.any)).length}`).join('; ')}`);
      }
      // els robustos i els fràgils (exploratori): per a cada grup de n, les característiques dels programes
      out.push('  Els robustos i els fràgils (exploratori): grup de n, quants, instruccions, instruccions diferents i còpies (medianes), amb bucle:');
      for (const [a, b] of [[0, 0], [1, 50], [51, 94], [95, 100]]) {
        const g = reps.filter((_, i) => cs[i].any >= a && cs[i].any <= b).map((o) => features(o.bytes));
        out.push(`    ${a === b ? a : `${a}-${b}`}: ${g.length}; ${median(g.map((x) => x.instructions))}, ${median(g.map((x) => x.distinct))}, ${median(g.map((x) => x.copies))}; amb '[' i ']', ${pct(g.filter((x) => x.loop).length, g.length)}`);
      }
      summary.push(`  ${chem}, ${dist}: ${n}; ${FIGURES.map((f) => pct(cs.filter((c) => f.test(c.any)).length, n)).join('; ')}`);
    }
  }
  out.push(`Resum: química i distribució, hereditaris, i la part que ho és ${FIGURES.map((f) => f.name).join('; ')} de les ${PLAN.conditions} condicions:`);
  return [...out, ...summary];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.argv[2];
  if (!dir || process.argv.length !== 3) { console.error('Ús: node eines/autonomia-analisi.mjs carpeta'); process.exit(2); }
  const { runs, problems } = readFolder(dir);
  if (problems.length) {
    console.log(`Els registres no són els del pla (${problems.length} problemes):\n${problems.slice(0, 20).map((p) => `  ${p}`).join('\n')}${problems.length > 20 ? `\n  i ${problems.length - 20} més` : ''}`);
    process.exit(1);
  }
  for (const l of analyse(runs)) console.log(l);
}
