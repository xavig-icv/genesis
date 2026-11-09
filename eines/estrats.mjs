// B1, la composició de bytes (docs/pla-b1.md, §13): la densitat de replicadors hereditaris de programes fets amb una composició,
// amb C0 (BFF tal com és) i la prova del cens, com al nivell 1.
//
//   node eines/estrats.mjs --programa estrat:K|d-mig|sopa:fitxer.json --company uniforme|programa --llavor N --programes N
//                          --json fitxer.jsonl [--de I] [--fils F] [--tros T]
//
// D'on surten els programes (--programa):
//  - estrat:K (K de 0 a 64): exactament K bytes d'instrucció, a K posicions a l'atzar, i cada byte, uniforme dins de la seva classe:
//    una de les 10 instruccions, o un dels altres 246 valors. És la distribució de D_p condicionada a K, per a qualsevol p (§13):
//    primer les posicions (Fisher-Yates parcial), i després els 64 bytes, per ordre;
//  - d-mig: D½, el mateix sorteig que el nivell 1 (eines/densitat.mjs). Amb la llavor del nivell 1 i companys uniformes, fa
//    exactament les seves sopes;
//  - sopa:fitxer.json: cada byte, a l'atzar amb la freqüència que té a la sopa (la composició d'eines/composicio.mjs). Amb una sopa
//    sencera de 512 × 256 cel·les, el total és 2²³, i el sorteig és exacte. Abans de començar, la composició es comprova sencera, i ha
//    de ser la d'una sopa de la cohort del pilot (AU2-140): si no, s'hi nega, sense crear el JSONL.
// Els enters a l'atzar són exactes: es rebutgen els valors de l'atzar que en farien un biaix (uniformInt).
//
// Els 8 companys de la sopa de la prova (--company): uniforme, de bytes uniformes, com al nivell 1; o programa, de la mateixa
// distribució que el programa (no amb estrat:K). Amb una sopa, són companys sintetitzats a partir del seu histograma, byte a byte:
// no són cel·les de la captura, i no en conserven l'estructura (auditor 2). El company del paper sol és el del cens, de bytes
// uniformes, sempre: és el que fa el cens a la sopa i al món, i el que fan els escanejos del pilot.
//
// L'atzar, com al nivell 1: el programa i i els seus companys, amb el generador de la llavor més 2i, en aquest ordre; la prova, amb
// el de la llavor més 2i + 1. Els mateixos programes amb els dos tipus de company: la comparació és aparellada.
//
// El JSONL és com el d'eines/densitat.mjs: la línia d'inici (el codi, la SHA-256 dels mòduls, l'ordre, els paràmetres i, amb una
// sopa, la SHA-256 de la composició), una línia per cada programa que es replica, un recompte acumulat cada --tros programes i la
// línia final, amb els totals i l'empremta. No sobreescriu cap fitxer.
import { openSync, writeSync, closeSync, readFileSync } from 'fs';
import { createHash } from 'crypto';
import { isMainThread } from 'worker_threads';
import { pathToFileURL } from 'url';
import { PROGRAM_SIZE, OPCODES, evaluate } from '../fase1/bff.js';
import { makeRng } from '../fase1/soup.js';
import { replicationTest } from '../fase2/replication.js';
import { codeVersion, fileHashes, parseOptions, runJobs, serveJobs, sha256 } from './b1-comu.mjs';

export const TEST = 'fase2/replication.js, heredity, complete, C0';
export const MODULES = ['fase1/bff.js', 'fase1/soup.js', 'fase2/replication.js', 'eines/b1-comu.mjs', 'eines/estrats.mjs'];
export const SOUP_BYTES = 512 * 256 * PROGRAM_SIZE;  // 2²³
export const NOISE = 8;  // els companys de la sopa de la prova, com al nivell 1
const INSTRUCTIONS = [...OPCODES].map((c) => c.charCodeAt(0));
const OTHERS = Array.from({ length: 256 }, (_, b) => b).filter((b) => !INSTRUCTIONS.includes(b));
const TWO32 = 4294967296;
// D½, el sorteig del nivell 1, idèntic al d'eines/densitat.mjs (test/b1-estrats.mjs ho comprova): no s'importa d'allà perquè, dins
// d'un fil, eines/densitat.mjs hi posaria el seu receptor de feines
export const dMig = (rng) => (rng() < 0.5 ? INSTRUCTIONS[(rng() * INSTRUCTIONS.length) | 0] : OTHERS[(rng() * OTHERS.length) | 0]);

// Un enter uniforme de 0 a m - 1, exacte: rng() és un enter de 32 bits dividit per 2³², i es rebutgen els que en farien un biaix.
// Amb m fora d'1 a 2³², s'hi nega: amb m > 2³², el límit seria 0, i no acabaria mai (AU2-140)
export function uniformInt(rng, m) {
  if (!(Number.isInteger(m) && m >= 1 && m <= TWO32)) throw new RangeError(`uniformInt: ${m} no és un enter d'1 a 2³²`);
  const limit = TWO32 - (TWO32 % m);
  for (;;) { const x = rng() * TWO32; if (x < limit) return x % m; }
}
// Un programa de l'estrat k
export function stratumProgram(rng, k) {
  const pos = Array.from({ length: PROGRAM_SIZE }, (_, i) => i), isInstr = new Uint8Array(PROGRAM_SIZE);
  for (let s = 0; s < k; s++) { const j = s + uniformInt(rng, PROGRAM_SIZE - s); [pos[s], pos[j]] = [pos[j], pos[s]]; isInstr[pos[s]] = 1; }
  return Uint8Array.from({ length: PROGRAM_SIZE }, (_, i) => (isInstr[i] ? INSTRUCTIONS[uniformInt(rng, 10)] : OTHERS[uniformInt(rng, 246)]));
}
// El sorteig d'una composició: counts[b], quantes vegades hi és el byte b. 256 recomptes enters, que sumin d'1 a 2³²
export function compositionDraw(counts) {
  const total = Array.isArray(counts) && counts.length === 256 && counts.every((c) => Number.isSafeInteger(c) && c >= 0) ? counts.reduce((s, c) => s + c, 0) : -1;
  if (!(total >= 1 && total <= TWO32)) throw new RangeError("la composició ha de tenir 256 recomptes enters, no negatius, que sumin d'1 a 2³²");
  const cum = [];
  let acc = 0;
  for (const c of counts) { acc += c; cum.push(acc); }
  return (rng) => {
    const u = uniformInt(rng, total);
    let lo = 0, hi = 255;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] > u) hi = mid; else lo = mid + 1; }
    return lo;
  };
}
// Una composició d'eines/composicio.mjs: { world, epoch, capture: { file, sha256 }, bytes, instructions, counts }, comprovada sencera
// abans de fer-la servir (AU2-140): exactament 2²³ bytes, els d'una sopa sencera; 256 recomptes enters, no negatius, que hi sumen; i
// els bytes d'instrucció, els que en surten amb els 10 opcodes. Si no, s'hi nega
export function readComposition(file) {
  const raw = readFileSync(file);
  const bad = (why) => new Error(`${file}: no és una composició (${why})`);
  let c;
  try { c = JSON.parse(raw); } catch { throw bad('no és JSON'); }
  if (c === null || typeof c !== 'object' || Array.isArray(c)) throw bad('no és un objecte');
  if (typeof c.world !== 'string' || !/^\d+$/.test(c.world) || !Number.isSafeInteger(c.epoch) || c.epoch < 0) throw bad("el món o l'època");
  if (typeof c.capture?.file !== 'string' || !/^[0-9a-f]{64}$/.test(c.capture?.sha256 ?? '')) throw bad('la captura');
  if (c.bytes !== SOUP_BYTES) throw bad(`ha de tenir ${SOUP_BYTES} bytes, i en diu ${c.bytes}`);
  if (!Array.isArray(c.counts) || c.counts.length !== 256 || c.counts.some((x) => !Number.isSafeInteger(x) || x < 0)) throw bad('els recomptes han de ser 256 enters no negatius');
  const total = c.counts.reduce((s, x) => s + x, 0);
  if (total !== c.bytes) throw bad(`els recomptes sumen ${total}, i no ${c.bytes}`);
  const instructions = INSTRUCTIONS.reduce((s, b) => s + c.counts[b], 0);
  if (c.instructions !== instructions) throw bad(`diu ${c.instructions} bytes d'instrucció, i els recomptes en fan ${instructions}`);
  return { ...c, sha256: sha256(raw) };
}
// La composició ha de ser la d'una sopa de la cohort del pilot (AU2-140): un món inclòs al manifest, a l'època de partida (8.000), amb
// la captura i la SHA-256 que hi diu. L'eina ho comprova abans de començar cada tirada d'una sopa, i l'anàlisi, després
export const PILOT_MANIFEST = 'fase2/resultats/maduracio/pilot/manifest.json';
export const PILOT_EPOCH = 8000;
export function checkCohort(comp, manifestFile = PILOT_MANIFEST) {
  const w = JSON.parse(readFileSync(manifestFile, 'utf8')).worlds.find((x) => x.included && x.world === comp.world);
  if (!w) throw new Error(`la composició del món ${comp.world} no és de cap món de la cohort del pilot`);
  if (comp.epoch !== PILOT_EPOCH || w.start !== PILOT_EPOCH) throw new Error(`la composició del món ${comp.world} és de l'època ${comp.epoch}, i ha de ser de la ${PILOT_EPOCH}`);
  if (comp.capture.file !== w.capture || comp.capture.sha256 !== w.captureSha256) throw new Error(`la captura de la composició del món ${comp.world} no és la del manifest del pilot`);
}

// La font dels programes: { kind, k, file, draw }
export function parseSource(spec) {
  let m = /^estrat:(\d+)$/.exec(spec);
  if (m && Number(m[1]) <= PROGRAM_SIZE) return { kind: 'estrat', k: Number(m[1]) };
  if (spec === 'd-mig') return { kind: 'd-mig' };
  m = /^sopa:(.+)$/.exec(spec);
  if (m) return { kind: 'sopa', file: m[1] };
  throw new Error(`--programa ha de ser estrat:K (K de 0 a ${PROGRAM_SIZE}), d-mig o sopa:fitxer.json: ${spec}`);
}
// El sorteig d'un byte de la font (amb estrat:K, cap: els bytes depenen de la posició)
export function sourceDraw(source, counts = null) {
  return source.kind === 'd-mig' ? dMig : source.kind === 'sopa' ? compositionDraw(counts) : null;
}
// La sopa de la prova del programa i: el programa, a la cel·la 0, i els 8 companys
export function soupFor(i, seed, source, partner, draw = sourceDraw(source)) {
  const rng = makeRng((seed + 2 * i) >>> 0, 'v2'), soup = new Uint8Array(PROGRAM_SIZE * (1 + NOISE));
  if (source.kind === 'estrat') soup.set(stratumProgram(rng, source.k), 0);
  else for (let j = 0; j < PROGRAM_SIZE; j++) soup[j] = draw(rng);
  for (let j = PROGRAM_SIZE; j < soup.length; j++) soup[j] = partner === 'programa' ? draw(rng) : (rng() * 256) | 0;
  return soup;
}
export function testRange(from, to, { seed, source, partner, counts }) {
  const found = [], tally = { tested: 0, replicates: 0, heritable: 0, heritableSolo: 0, heritableContext: 0 };
  const draw = sourceDraw(source, counts);  // el sorteig de la composició es prepara una vegada
  for (let i = from; i < to; i++) {
    const soup = soupFor(i, seed, source, partner, draw);
    const r = replicationTest(soup, 0, makeRng((seed + 2 * i + 1) >>> 0, 'v2'), { heredity: true, complete: true, evaluate });
    tally.tested++;
    if (!r.solo && !r.context) continue;
    tally.replicates++;
    if (r.heritable) tally.heritable++;
    if (r.heritableSolo) tally.heritableSolo++;
    if (r.heritableContext) tally.heritableContext++;
    found.push({ type: 'replicator', index: i, bytes: Buffer.from(soup.subarray(0, PROGRAM_SIZE)).toString('hex'), solo: r.solo, context: r.context, heritableSolo: r.heritableSolo, heritableContext: r.heritableContext });
  }
  return { from, to, counts: tally, found };
}
const OPTIONS = {
  programa: { type: 'str', required: true },
  company: { type: 'enum', values: ['uniforme', 'programa'], required: true },
  llavor: { type: 'int', min: 0, max: 2 ** 32 - 1, required: true },
  programes: { type: 'int', min: 1, max: 1e8, required: true },
  de: { type: 'int', min: 0, max: 1e8, default: 0 },
  fils: { type: 'int', min: 1, max: 16, default: 1 },
  tros: { type: 'int', min: 1, max: 1e8, default: 100000 },
  json: { type: 'str', required: true },
};
const USAGE = `Ús: node eines/estrats.mjs --programa estrat:K|d-mig|sopa:fitxer.json --company uniforme|programa --llavor N --programes N
         --json fitxer.jsonl [--de I] [--fils F] [--tros T]
La composició de bytes de B1 (docs/pla-b1.md, §13): la densitat de replicadors hereditaris amb C0.`;

async function main() {
  const argv = process.argv.slice(2), opts = parseOptions(argv, OPTIONS, USAGE), t0 = Date.now();
  const fail = (m) => { console.error(`Error: ${m}\nFes servir --help per veure les opcions.`); process.exit(2); };
  let source, comp = null;
  // la composició, sencera i de la cohort, abans de començar i abans de crear el JSONL (AU2-140)
  try { source = parseSource(opts.programa); if (source.kind === 'sopa') { comp = readComposition(source.file); checkCohort(comp); } } catch (e) { fail(e.message); }
  if (source.kind === 'estrat' && opts.company === 'programa') fail('amb estrat:K, els companys són uniformes');
  const from = opts.de, to = opts.de + opts.programes;
  // les llavors dels generadors, de la llavor a la llavor + 2·to - 1, han de cabre en 32 bits
  if (opts.llavor + 2 * to > 2 ** 32) fail('la llavor més 2 vegades el darrer índex no cap en 32 bits');
  let fd;
  try { fd = openSync(opts.json, 'wx'); } catch (e) { fail(e.code === 'EEXIST' ? `${opts.json} ja existeix: no el sobreescric` : `no puc crear ${opts.json}: ${e.message}`); }
  const hash = createHash('sha256');
  const line = (o) => writeSync(fd, JSON.stringify(o) + '\n');
  const result = (o) => { const s = JSON.stringify(o) + '\n'; hash.update(s); writeSync(fd, s); };
  line({
    type: 'start', code: codeVersion(), modules: fileHashes(MODULES), node: process.version, command: `node eines/estrats.mjs ${argv.join(' ')}`,
    chemistry: 'C0', program: opts.programa, partner: opts.company, composition: comp ? { world: comp.world, epoch: comp.epoch, capture: comp.capture, sha256: comp.sha256 } : null,
    seed: opts.llavor, from, to, programs: opts.programes, noise: NOISE, chunk: opts.tros, test: TEST,
  });
  const jobs = [];
  for (let a = from; a < to; a += opts.tros) jobs.push([a, Math.min(to, a + opts.tros)]);
  const totals = { tested: 0, replicates: 0, heritable: 0, heritableSolo: 0, heritableContext: 0 };
  const params = { seed: opts.llavor, source, partner: opts.company, counts: comp?.counts ?? null };
  await runJobs(jobs, {
    threads: opts.fils, compute: ([a, b], p) => testRange(a, b, p), workerUrl: new URL(import.meta.url), data: params,
    onDone: (r) => {
      for (const f of r.found) result(f);
      for (const k of Object.keys(totals)) totals[k] += r.counts[k];
      result({ type: 'count', upTo: r.to, ...totals });
      console.log(`${totals.tested} de ${opts.programes} programes (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    },
  });
  line({ type: 'end', from, to, ...totals, fingerprint: hash.digest('hex'), seconds: Math.round((Date.now() - t0) / 1000) });
  closeSync(fd);
}

if (!isMainThread) serveJobs(([a, b], p) => testRange(a, b, p));
else if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((e) => { console.error(e); process.exit(1); });
