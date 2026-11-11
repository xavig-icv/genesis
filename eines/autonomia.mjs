// B1, la prova d'autonomia (docs/pla-b1.md, §4): cada replicador hereditari del nivell 1, tornat a provar amb companys inerts.
//
//   node eines/autonomia.mjs --quimica Q --distribucio d-mig|uniforme --llavor N --json fitxer.jsonl
//                            [--condicions C] [--extracte fitxer.jsonl.gz] [--fils F] [--tros T]
//   node eines/autonomia.mjs --registre fitxer.jsonl --llavor N --json fitxer.jsonl [--condicions C] [--fils F] [--tros T]
//
// Els replicadors, de dues fonts:
//  - el nivell 1 (§4; --quimica i --distribucio): els hereditaris del registre del nivell 1 d'aquesta química i distribució, de
//    l'extracte (fase2/resultats/b1/nivell1/hereditaris.jsonl.gz, comprovat amb la seva SHA-256), en l'ordre dels índexs. Abans de
//    començar, els bytes de cadascun es tornen a fer amb el generador del nivell 1 (eines/densitat.mjs, soupFor): han de ser els
//    mateixos;
//  - una tirada de la §13 (--registre; AUD-175, auditoria 28): els hereditaris d'un registre d'eines/estrats.mjs, sencer, en l'ordre
//    dels índexs, amb la química del registre (C0). Abans de començar, els bytes de cadascun es tornen a fer amb el sorteig del registre
//    (eines/estrats.mjs, soupFor). És la corba sense l'ajuda del company, ρ_aut(p), i la seva anàlisi és
//    eines/estrats-autonomia-analisi.mjs. La línia d'inici porta el nom, la SHA-256 i l'empremta del registre.
//
// Un company inert: 64 bytes, cadascun a l'atzar d'entre els 246 valors que no són cap de les 10 instruccions, el 0 inclòs. Amb
// totes les químiques, un byte que no és una instrucció no fa res: un company inert no hi executa res, i només hi pot ser llegit
// (test/quimiques.mjs ho comprova en 10.000 cintes de cada química).
//
// Les condicions, les mateixes per a tots els replicadors i totes les químiques: la condició j (de 0 a C - 1) són els 8 companys
// inerts de la sopa, fets amb el generador de la llavor més 2j, i l'atzar de la prova, el de la llavor més 2j + 1. Abans de
// començar, cada parella ordenada dels 8 companys de cada condició s'executa amb la química: cap operació, i la cinta igual. Si no,
// s'atura.
//
// La prova és la del cens (fase2/replication.js), amb l'herència, completa, amb l'intèrpret de la química, i amb les dues opcions
// de la prova d'autonomia: el company del paper sol, inert (soloPartner), i l'herència en context provada encara que ja s'hagi
// demostrat sola (bothRoles). El programa és a la cel·la 0 d'una sopa de 9: ell i els 8 companys inerts de la condició.
//
// El JSONL (no sobreescriu cap fitxer): la línia d'inici, amb el codi, la SHA-256 dels mòduls, l'ordre, els paràmetres, el registre
// del nivell 1 d'on surten els replicadors i la comprovació dels companys; una línia per replicador, amb els seus bytes i, per a
// cada prova, quatre cadenes de C caràcters, '1' o '0' a la posició j segons la condició j: solo, context, heritableSolo i
// heritableContext; i la línia final, amb l'empremta (la SHA-256 de les línies dels replicadors) i els segons. A la consola, només
// el progrés.
import { openSync, writeSync, closeSync, readFileSync } from 'fs';
import { createHash } from 'crypto';
import { isMainThread } from 'worker_threads';
import { pathToFileURL } from 'url';
import { PROGRAM_SIZE, TAPE_SIZE, OPCODES, CHEMISTRIES, evaluator } from '../fase1/bff.js';
import { makeRng } from '../fase1/soup.js';
import { replicationTest } from '../fase2/replication.js';
import { EXTRACT, EXTRACT_SHA256, codeVersion, fileHashes, parseOptions, readExtract, extractRecord, readJsonl, runJobs, serveJobs, sha256 } from './b1-comu.mjs';
// eines/densitat.mjs i eines/estrats.mjs (soupFor, per comprovar els bytes) només s'importen al fil principal: dins d'un fil, hi
// posarien el seu receptor de feines, i contestarien abans que el d'aquesta eina

export const PARTNERS = 8;
export const CONDITIONS = 100;
export const TEST = 'fase2/replication.js, heredity, complete, soloPartner inert, bothRoles';
export const MODULES = ['fase1/bff.js', 'fase1/soup.js', 'fase2/replication.js', 'eines/densitat.mjs', 'eines/b1-comu.mjs', 'eines/autonomia.mjs'];
// amb --registre, també el de la §13, que fa els bytes dels programes
export const MODULES_STRATA = [...MODULES, 'eines/estrats.mjs'];
const INSTRUCTIONS = new Set([...OPCODES].map((c) => c.charCodeAt(0)));
export const INERT = Object.freeze(Array.from({ length: 256 }, (_, b) => b).filter((b) => !INSTRUCTIONS.has(b)));

// Un company inert, amb l'atzar que es doni
export const inertProgram = (rng) => Uint8Array.from({ length: PROGRAM_SIZE }, () => INERT[(rng() * INERT.length) | 0]);

// Les condicions: { partners, testSeed } per a cada j
export function conditions(seed, count) {
  return Array.from({ length: count }, (_, j) => {
    const rng = makeRng((seed + 2 * j) >>> 0, 'v2');
    return { partners: Array.from({ length: PARTNERS }, () => inertProgram(rng)), testSeed: (seed + 2 * j + 1) >>> 0 };
  });
}
// Cada parella ordenada de companys d'una condició, executada amb la química: quantes cintes hi ha executat res o han canviat
export function checkInert(conds, interpret) {
  let pairs = 0, active = 0;
  const t = new Uint8Array(TAPE_SIZE);
  for (const { partners } of conds) {
    for (let a = 0; a < partners.length; a++) {
      for (let b = 0; b < partners.length; b++) {
        if (a === b) continue;
        t.set(partners[a], 0); t.set(partners[b], PROGRAM_SIZE);
        const before = t.slice(), ops = interpret(t, 0);
        pairs++;
        if (ops !== 0 || t.some((v, i) => v !== before[i]) || partners[a].some((v) => INSTRUCTIONS.has(v))) active++;
      }
    }
  }
  return { pairs, active };
}
// La prova d'un programa en una condició
export function testCondition(bytes, cond, interpret) {
  const soup = new Uint8Array(PROGRAM_SIZE * (1 + PARTNERS));
  soup.set(bytes, 0);
  cond.partners.forEach((p, i) => soup.set(p, PROGRAM_SIZE * (1 + i)));
  return replicationTest(soup, 0, makeRng(cond.testSeed, 'v2'), {
    heredity: true, complete: true, evaluate: interpret, soloPartner: inertProgram, bothRoles: true,
  });
}
// Un replicador en totes les condicions: les quatre cadenes
export function testReplicator(bytes, conds, interpret) {
  const out = { solo: '', context: '', heritableSolo: '', heritableContext: '' };
  for (const cond of conds) {
    const r = testCondition(bytes, cond, interpret);
    for (const k of Object.keys(out)) out[k] += r[k] ? '1' : '0';
  }
  return out;
}
// Una feina: els replicadors [{ index, bytes }] d'un tros
function computeChunk(job, { chemistry, seed, count }) {
  const interpret = evaluator(chemistry), conds = conditions(seed, count);
  return job.map(({ index, bytes }) => ({ type: 'replicator', index, bytes, ...testReplicator(Uint8Array.from(Buffer.from(bytes, 'hex')), conds, interpret) }));
}

// Els hereditaris d'un registre de la §13 (eines/estrats.mjs), sencer i amb l'empremta: { start, end, heritable, source }. Amb una sopa,
// la composició, sencera i de la cohort del pilot, i la de la línia d'inici, camp a camp (AU2-142). Els bytes de cadascun, els del seu
// programa (el mateix sorteig, amb la composició del registre). Si no, s'hi nega
export async function strataHeritables(file) {
  const { TEST: STRATA_TEST, parseSource, checkRecordComposition, sourceDraw, soupFor } = await import('./estrats.mjs');
  const r = readJsonl(file);
  if (r.problems.length) throw new Error(r.problems.join('; '));
  const { name, start: s, lines, end } = r;
  if (!/^node eines\/estrats\.mjs /.test(s.command ?? '') || s.test !== STRATA_TEST || s.chemistry !== 'C0') throw new Error(`${name}: no és un registre de la §13 (eines/estrats.mjs)`);
  const source = parseSource(s.program);
  let draw;
  if (source.kind === 'sopa') {
    try { draw = sourceDraw(source, checkRecordComposition(s, source.file).counts); } catch (e) { throw new Error(`${name}: ${e.message}`); }
  } else draw = sourceDraw(source);
  const heritable = [];
  for (const o of lines) {
    if (o.type !== 'replicator' || !(o.heritableSolo || o.heritableContext)) continue;
    if (o.bytes !== Buffer.from(soupFor(o.index, s.seed, source, s.partner, draw).subarray(0, PROGRAM_SIZE)).toString('hex')) throw new Error(`${name}: els bytes del replicador ${o.index} no són els del seu programa`);
    heritable.push({ index: o.index, bytes: o.bytes });
  }
  if (heritable.length !== end.heritable) throw new Error(`${name}: ${heritable.length} hereditaris, i la línia final en diu ${end.heritable}`);
  return {
    start: s, end, heritable,
    source: { file: name, sha256: sha256(readFileSync(file)), program: s.program, partner: s.partner, seed: s.seed, from: s.from, to: s.to, code: s.code, heritable: end.heritable, fingerprint: end.fingerprint },
  };
}

// les opcions, també per a les anàlisis, que llegeixen l'ordre de cada registre amb aquest contracte (AU2-143)
export const OPTIONS = {
  quimica: { type: 'enum', values: Object.keys(CHEMISTRIES) },
  distribucio: { type: 'enum', values: ['d-mig', 'uniforme'] },
  registre: { type: 'str' },
  llavor: { type: 'int', min: 0, max: 2 ** 32 - 2 * 1000, required: true },
  condicions: { type: 'int', min: 1, max: 1000, default: CONDITIONS },
  extracte: { type: 'str' },
  fils: { type: 'int', min: 1, max: 16, default: 1 },
  tros: { type: 'int', min: 1, max: 1e6, default: 200 },
  json: { type: 'str', required: true },
};
const USAGE = `Ús: node eines/autonomia.mjs --quimica ${Object.keys(CHEMISTRIES).join('|')} --distribucio d-mig|uniforme
         --llavor N --json fitxer.jsonl [--condicions C] [--extracte fitxer.jsonl.gz] [--fils F] [--tros T]
   o: node eines/autonomia.mjs --registre fitxer.jsonl --llavor N --json fitxer.jsonl [--condicions C] [--fils F] [--tros T]
La prova d'autonomia de B1 (docs/pla-b1.md, §4): els hereditaris del nivell 1 o d'una tirada de la §13, amb companys inerts.`;

async function main() {
  const argv = process.argv.slice(2), opts = parseOptions(argv, OPTIONS, USAGE), t0 = Date.now();
  const fail = (m) => { console.error(`Error: ${m}`); process.exit(2); };
  let chemistry, reps, header, modules;
  if (opts.registre !== undefined) {
    // una tirada de la §13 (AUD-175): la química, la del registre
    if (opts.quimica !== undefined || opts.distribucio !== undefined || opts.extracte !== undefined) fail('amb --registre, la química és la del registre de la §13: sense --quimica, --distribucio ni --extracte');
    let rec;
    try { rec = await strataHeritables(opts.registre); } catch (e) { fail(e.message); }
    chemistry = rec.start.chemistry;
    reps = rec.heritable;
    header = { source: rec.source };
    modules = MODULES_STRATA;
  } else {
    if (opts.quimica === undefined || opts.distribucio === undefined) fail('cal --quimica i --distribucio, o --registre');
    const { soupFor } = await import('./densitat.mjs');
    let record;
    try { record = extractRecord(readExtract(opts.extracte ?? EXTRACT), opts.quimica, opts.distribucio); } catch (e) { fail(e.message); }
    reps = record.heritable.map((o) => ({ index: o.index, bytes: o.bytes }));
    // els bytes, els del programa que en donen la llavor i l'índex del nivell 1
    for (const { index, bytes } of reps) {
      if (Buffer.from(soupFor(index, record.start.seed, opts.distribucio).subarray(0, PROGRAM_SIZE)).toString('hex') !== bytes) fail(`els bytes del replicador ${index} no són els del seu programa`);
    }
    chemistry = opts.quimica;
    header = {
      distribution: opts.distribucio,
      level1: { code: record.start.code, seed: record.start.seed, programs: record.start.programs, heritable: record.end.heritable, fingerprint: record.end.fingerprint },
      extractSha256: EXTRACT_SHA256,
    };
    modules = MODULES;
  }
  const conds = conditions(opts.llavor, opts.condicions), inert = checkInert(conds, evaluator(chemistry));
  if (inert.active) fail(`${inert.active} parelles de companys de les condicions no són inerts amb ${chemistry}`);
  let fd;
  try { fd = openSync(opts.json, 'wx'); } catch (e) { fail(e.code === 'EEXIST' ? `${opts.json} ja existeix: no el sobreescric` : `no puc crear ${opts.json}: ${e.message}`); }
  const line = (o) => writeSync(fd, JSON.stringify(o) + '\n');
  line({
    type: 'start', code: codeVersion(), modules: fileHashes(modules), node: process.version, command: `node eines/autonomia.mjs ${argv.join(' ')}`,
    chemistry, description: CHEMISTRIES[chemistry].description, ...header, seed: opts.llavor, conditions: opts.condicions, partners: PARTNERS, test: TEST,
    replicators: reps.length, inertCheck: inert,
  });
  const jobs = [];
  for (let a = 0; a < reps.length; a += opts.tros) jobs.push(reps.slice(a, a + opts.tros));
  const hash = createHash('sha256');
  let done = 0;
  await runJobs(jobs, {
    threads: opts.fils, compute: computeChunk, workerUrl: new URL(import.meta.url), data: { chemistry, seed: opts.llavor, count: opts.condicions },
    onDone: (rs) => {
      for (const r of rs) { const s = JSON.stringify(r) + '\n'; hash.update(s); writeSync(fd, s); }
      done += rs.length;
      console.log(`${done} de ${reps.length} replicadors (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    },
  });
  line({ type: 'end', replicators: done, conditions: opts.condicions, fingerprint: hash.digest('hex'), seconds: Math.round((Date.now() - t0) / 1000) });
  closeSync(fd);
}

if (!isMainThread) serveJobs(computeChunk);
else if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((e) => { console.error(e); process.exit(1); });
