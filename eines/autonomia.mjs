// B1, la prova d'autonomia (docs/pla-b1.md, §4): cada replicador hereditari del nivell 1, tornat a provar amb companys inerts.
//
//   node eines/autonomia.mjs --quimica Q --distribucio d-mig|uniforme --llavor N --json fitxer.jsonl
//                            [--condicions C] [--extracte fitxer.jsonl.gz] [--fils F] [--tros T]
//
// Els replicadors són els hereditaris del registre del nivell 1 d'aquesta química i distribució, de l'extracte
// (fase2/resultats/b1/nivell1/hereditaris.jsonl.gz, comprovat amb la seva SHA-256), en l'ordre dels índexs. Abans de començar,
// els bytes de cadascun es tornen a fer amb el generador del nivell 1 (eines/densitat.mjs, soupFor): han de ser els mateixos.
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
import { openSync, writeSync, closeSync } from 'fs';
import { createHash } from 'crypto';
import { isMainThread } from 'worker_threads';
import { pathToFileURL } from 'url';
import { PROGRAM_SIZE, TAPE_SIZE, OPCODES, CHEMISTRIES, evaluator } from '../fase1/bff.js';
import { makeRng } from '../fase1/soup.js';
import { replicationTest } from '../fase2/replication.js';
import { EXTRACT, EXTRACT_SHA256, codeVersion, fileHashes, parseOptions, readExtract, extractRecord, runJobs, serveJobs } from './b1-comu.mjs';
// eines/densitat.mjs (soupFor, per comprovar els bytes) només s'importa al fil principal: dins d'un fil, hi posaria el seu receptor
// de feines, i contestaria abans que el d'aquesta eina

export const PARTNERS = 8;
export const CONDITIONS = 100;
export const TEST = 'fase2/replication.js, heredity, complete, soloPartner inert, bothRoles';
export const MODULES = ['fase1/bff.js', 'fase1/soup.js', 'fase2/replication.js', 'eines/densitat.mjs', 'eines/b1-comu.mjs', 'eines/autonomia.mjs'];
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

const OPTIONS = {
  quimica: { type: 'enum', values: Object.keys(CHEMISTRIES), required: true },
  distribucio: { type: 'enum', values: ['d-mig', 'uniforme'], required: true },
  llavor: { type: 'int', min: 0, max: 2 ** 32 - 2 * 1000, required: true },
  condicions: { type: 'int', min: 1, max: 1000, default: CONDITIONS },
  extracte: { type: 'str', default: EXTRACT },
  fils: { type: 'int', min: 1, max: 16, default: 1 },
  tros: { type: 'int', min: 1, max: 1e6, default: 200 },
  json: { type: 'str', required: true },
};
const USAGE = `Ús: node eines/autonomia.mjs --quimica ${Object.keys(CHEMISTRIES).join('|')} --distribucio d-mig|uniforme
         --llavor N --json fitxer.jsonl [--condicions C] [--extracte fitxer.jsonl.gz] [--fils F] [--tros T]
La prova d'autonomia de B1 (docs/pla-b1.md, §4): els hereditaris del nivell 1, amb companys inerts.`;

async function main() {
  const { soupFor } = await import('./densitat.mjs');
  const argv = process.argv.slice(2), opts = parseOptions(argv, OPTIONS, USAGE), t0 = Date.now();
  const fail = (m) => { console.error(`Error: ${m}`); process.exit(2); };
  let record;
  try { record = extractRecord(readExtract(opts.extracte), opts.quimica, opts.distribucio); } catch (e) { fail(e.message); }
  const reps = record.heritable.map((o) => ({ index: o.index, bytes: o.bytes }));
  // els bytes, els del programa que en donen la llavor i l'índex del nivell 1
  for (const { index, bytes } of reps) {
    if (Buffer.from(soupFor(index, record.start.seed, opts.distribucio).subarray(0, PROGRAM_SIZE)).toString('hex') !== bytes) fail(`els bytes del replicador ${index} no són els del seu programa`);
  }
  const conds = conditions(opts.llavor, opts.condicions), inert = checkInert(conds, evaluator(opts.quimica));
  if (inert.active) fail(`${inert.active} parelles de companys de les condicions no són inerts amb ${opts.quimica}`);
  let fd;
  try { fd = openSync(opts.json, 'wx'); } catch (e) { fail(e.code === 'EEXIST' ? `${opts.json} ja existeix: no el sobreescric` : `no puc crear ${opts.json}: ${e.message}`); }
  const line = (o) => writeSync(fd, JSON.stringify(o) + '\n');
  line({
    type: 'start', code: codeVersion(), modules: fileHashes(MODULES), node: process.version, command: `node eines/autonomia.mjs ${argv.join(' ')}`,
    chemistry: opts.quimica, description: CHEMISTRIES[opts.quimica].description, distribution: opts.distribucio,
    level1: { code: record.start.code, seed: record.start.seed, programs: record.start.programs, heritable: record.end.heritable, fingerprint: record.end.fingerprint },
    extractSha256: EXTRACT_SHA256, seed: opts.llavor, conditions: opts.condicions, partners: PARTNERS, test: TEST,
    replicators: reps.length, inertCheck: inert,
  });
  const jobs = [];
  for (let a = 0; a < reps.length; a += opts.tros) jobs.push(reps.slice(a, a + opts.tros));
  const hash = createHash('sha256');
  let done = 0;
  await runJobs(jobs, {
    threads: opts.fils, compute: computeChunk, workerUrl: new URL(import.meta.url), data: { chemistry: opts.quimica, seed: opts.llavor, count: opts.condicions },
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
