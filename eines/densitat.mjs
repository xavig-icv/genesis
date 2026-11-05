// B1, el nivell 1: la densitat de replicadors hereditaris a l'espai de programes, amb una química (docs/pla-b1.md).
//
//   node eines/densitat.mjs --quimica C0 --distribucio d-mig --llavor N --programes N --json fitxer.jsonl
//                           [--de I] [--fils F] [--tros T]
//
// El programa i (de --de a --de + --programes - 1) es fa amb el seu generador, a partir de la llavor i de l'índex, amb la
// distribució de bytes, i amb 8 programes de soroll de bytes uniformes. Es posa a prova amb la prova del cens
// (fase2/replication.js, AUD-02), amb l'herència i amb l'intèrpret de la química (AUD-65), en una sopa barrejada de 9
// programes: sol, el programa va primer, amb un company de soroll; en context, va segon, amb un dels 8 de soroll primer.
// L'atzar de la prova també és propi de cada programa. Així, el resultat d'un programa només depèn de la llavor, de l'índex i
// de la química: no de l'ordre, ni de quants fils hi ha, ni de la màquina.
//
// Les distribucions (§3 del pla): d-mig, cada byte és, amb probabilitat ½, una de les 10 instruccions, a l'atzar, i si no, un
// dels altres 246 valors, a l'atzar; uniforme, bytes uniformes, com els de la sopa del començament.
//
// El JSONL (no sobreescriu cap fitxer): la línia d'inici, amb el codi, la SHA-256 dels mòduls que fan el càlcul, l'ordre i els
// paràmetres; una línia per a cada programa que es replica, amb els seus bytes i les quatre proves; un recompte acumulat cada
// --tros programes (100.000 per defecte); i la línia final, amb els totals, l'empremta dels resultats (la SHA-256 de les línies
// dels replicadors i dels recomptes, que no depèn dels fils) i els segons. A la consola, només el progrés, sense cap recompte.
import { openSync, writeSync, closeSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import { createHash } from 'crypto';
import { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { PROGRAM_SIZE, OPCODES, CHEMISTRIES, evaluator } from '../fase1/bff.js';
import { makeRng } from '../fase1/soup.js';
import { replicationTest } from '../fase2/replication.js';

export const NOISE = 8;            // els programes de soroll de la sopa de la prova
export const MAX_PROGRAMS = 1e9;   // l'índex més gran: la llavor més 2i ha de cabre en 32 bits
export const TEST = 'fase2/replication.js, heredity, complete';
// Els mòduls de què depèn el resultat d'un programa: la seva SHA-256 va a la línia d'inici, i l'anàlisi la compara amb la dels
// de la seva còpia (AUD-139, AU2-102). A la màquina virtual, sense git, és l'única manera de veure-hi un canvi
export const MODULES = ['fase1/bff.js', 'fase1/soup.js', 'fase2/replication.js', 'eines/densitat.mjs'];
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const INSTRUCTIONS = [...OPCODES].map((c) => c.charCodeAt(0));
const OTHERS = Array.from({ length: 256 }, (_, b) => b).filter((b) => !INSTRUCTIONS.includes(b));
export const DISTRIBUTIONS = Object.freeze({
  'd-mig': (rng) => (rng() < 0.5 ? INSTRUCTIONS[(rng() * INSTRUCTIONS.length) | 0] : OTHERS[(rng() * OTHERS.length) | 0]),
  uniforme: (rng) => (rng() * 256) | 0,
});

// La sopa de la prova del programa i: el programa, a la cel·la 0, i els 8 de soroll. El generador del programa i fa servir la
// llavor més 2i, i el de la seva prova, la llavor més 2i + 1 (amb el v2, llavors veïnes donen seqüències sense relació)
export function soupFor(i, seed, distribution) {
  const rng = makeRng((seed + 2 * i) >>> 0, 'v2'), draw = DISTRIBUTIONS[distribution];
  const soup = new Uint8Array(PROGRAM_SIZE * (1 + NOISE));
  for (let j = 0; j < PROGRAM_SIZE; j++) soup[j] = draw(rng);
  for (let j = PROGRAM_SIZE; j < soup.length; j++) soup[j] = (rng() * 256) | 0;
  return soup;
}
// La prova de la cel·la 0 d'aquesta sopa, amb l'atzar propi del programa i
export function testSoup(soup, i, seed, interpret) {
  return replicationTest(soup, 0, makeRng((seed + 2 * i + 1) >>> 0, 'v2'), { heredity: true, complete: true, evaluate: interpret });
}
// Els programes de from a to - 1: els que es repliquen, en ordre, i els recomptes
export function testRange(from, to, { seed, distribution, chemistry }) {
  const interpret = evaluator(chemistry), found = [];
  const counts = { tested: 0, replicates: 0, heritable: 0, heritableSolo: 0, heritableContext: 0 };
  for (let i = from; i < to; i++) {
    const soup = soupFor(i, seed, distribution), r = testSoup(soup, i, seed, interpret);
    counts.tested++;
    if (!r.solo && !r.context) continue;
    counts.replicates++;
    if (r.heritable) counts.heritable++;
    if (r.heritableSolo) counts.heritableSolo++;
    if (r.heritableContext) counts.heritableContext++;
    found.push({ type: 'replicator', index: i, bytes: Buffer.from(soup.subarray(0, PROGRAM_SIZE)).toString('hex'), solo: r.solo, context: r.context, heritableSolo: r.heritableSolo, heritableContext: r.heritableContext });
  }
  return { from, to, counts, found };
}

// Quina versió del codi fa el càlcul, com a sim.mjs: el commit de git, amb "+canvis" si el codi té canvis sense desar; o, si
// no hi ha git (a la màquina virtual), el fitxer VERSIO. Git es crida des de l'arrel del repositori: des d'eines/, els patrons
// només hi miraven aquesta carpeta, i un canvi a fase1/ o a fase2/ no hi sortia (AUD-139, AU2-102)
function codeVersion() {
  const run = (cmd) => execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  try {
    const hash = run('git rev-parse --short HEAD');
    return hash + (run('git status --porcelain -- "*.js" "*.mjs"') ? '+canvis' : '');
  } catch {
    try { return readFileSync(join(ROOT, 'VERSIO'), 'utf8').trim(); } catch { return 'desconeguda'; }
  }
}
// La SHA-256 de cada mòdul de MODULES, tal com és a la còpia de root
export function moduleHashes(root = ROOT) {
  return Object.fromEntries(MODULES.map((m) => [m, createHash('sha256').update(readFileSync(join(root, m))).digest('hex')]));
}

const OPTIONS = {
  quimica: { type: 'enum', values: Object.keys(CHEMISTRIES), required: true },
  distribucio: { type: 'enum', values: Object.keys(DISTRIBUTIONS), required: true },
  llavor: { type: 'int', min: 0, max: 2 ** 31 - 1, required: true },
  programes: { type: 'int', min: 1, max: MAX_PROGRAMS, required: true },
  de: { type: 'int', min: 0, max: MAX_PROGRAMS, default: 0 },
  fils: { type: 'int', min: 1, max: 16, default: 1 },
  tros: { type: 'int', min: 1, max: MAX_PROGRAMS, default: 100000 },
  json: { type: 'str', required: true },
};
const USAGE = `Ús: node eines/densitat.mjs --quimica ${Object.keys(CHEMISTRIES).join('|')} --distribucio ${Object.keys(DISTRIBUTIONS).join('|')}
         --llavor N --programes N --json fitxer.jsonl [--de I] [--fils F] [--tros T]
La densitat de replicadors hereditaris a l'espai de programes, amb una química (docs/pla-b1.md).`;
function usageError(message) {
  console.error(`Error: ${message}\nFes servir --help per veure les opcions.`);
  process.exit(2);
}
function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help') { console.log(USAGE); process.exit(0); }
    if (!a.startsWith('--')) usageError(`argument inesperat: ${a}`);
    const name = a.slice(2), spec = OPTIONS[name];
    if (!spec) usageError(`opció desconeguda: ${a}`);
    if (name in opts) usageError(`opció repetida: ${a}`);
    const v = argv[++i];
    if (v === undefined || v.startsWith('--')) usageError(`${a} necessita un valor`);
    if (spec.type === 'int') {
      if (!/^\d+$/.test(v) || Number(v) < spec.min || Number(v) > spec.max) usageError(`${a} ha de ser un enter de ${spec.min} a ${spec.max}: ${v}`);
      opts[name] = Number(v);
    } else if (spec.type === 'enum') {
      if (!spec.values.includes(v)) usageError(`${a} ha de ser ${spec.values.join(', ')}: ${v}`);
      opts[name] = v;
    } else opts[name] = v;
  }
  for (const [name, spec] of Object.entries(OPTIONS)) {
    if (name in opts) continue;
    if (spec.required) usageError(`falta --${name}`);
    opts[name] = spec.default;
  }
  if (opts.de + opts.programes > MAX_PROGRAMS) usageError(`--de més --programes no pot passar de ${MAX_PROGRAMS}`);
  return opts;
}

async function main() {
  const argv = process.argv.slice(2), opts = parseArgs(argv), t0 = Date.now();
  const params = { seed: opts.llavor, distribution: opts.distribucio, chemistry: opts.quimica };
  let fd;
  try { fd = openSync(opts.json, 'wx'); } catch (e) { usageError(e.code === 'EEXIST' ? `${opts.json} ja existeix: no el sobreescric` : `no puc crear ${opts.json}: ${e.message}`); }
  const hash = createHash('sha256');
  const line = (o) => writeSync(fd, JSON.stringify(o) + '\n');
  const result = (o) => { const s = JSON.stringify(o); hash.update(s + '\n'); writeSync(fd, s + '\n'); };
  const from = opts.de, to = opts.de + opts.programes;
  line({
    type: 'start', code: codeVersion(), modules: moduleHashes(), node: process.version, command: `node eines/densitat.mjs ${argv.join(' ')}`,
    chemistry: opts.quimica, description: CHEMISTRIES[opts.quimica].description, distribution: opts.distribucio, seed: opts.llavor,
    from, to, programs: opts.programes, noise: NOISE, chunk: opts.tros, test: TEST,
  });
  const jobs = [];
  for (let a = from; a < to; a += opts.tros) jobs.push([a, Math.min(to, a + opts.tros)]);
  const totals = { tested: 0, replicates: 0, heritable: 0, heritableSolo: 0, heritableContext: 0 };
  const done = new Map();
  let next = 0;
  // escriu, en ordre, les feines que ja són fetes
  const flush = () => {
    while (done.has(next)) {
      const r = done.get(next);
      done.delete(next);
      for (const f of r.found) result(f);
      for (const k of Object.keys(totals)) totals[k] += r.counts[k];
      result({ type: 'count', upTo: r.to, ...totals });
      next++;
      console.log(`${totals.tested} de ${opts.programes} programes (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
  };
  if (opts.fils === 1) {
    jobs.forEach(([a, b], k) => { done.set(k, testRange(a, b, params)); flush(); });
  } else {
    await new Promise((resolve, reject) => {
      let given = 0, running = 0;
      const give = (w) => {
        if (given >= jobs.length) { w.terminate(); if (--running === 0) resolve(); return; }
        const k = given++;
        w.postMessage({ k, from: jobs[k][0], to: jobs[k][1] });
      };
      for (let f = 0; f < Math.min(opts.fils, jobs.length); f++) {
        const w = new Worker(new URL(import.meta.url), { workerData: params });
        running++;
        w.on('message', ({ k, r }) => { done.set(k, r); flush(); give(w); });
        w.on('error', reject);
        give(w);
      }
    });
  }
  if (next !== jobs.length) throw new Error('hi falten feines');
  line({ type: 'end', from, to, ...totals, fingerprint: hash.digest('hex'), seconds: Math.round((Date.now() - t0) / 1000) });
  closeSync(fd);
}

if (!isMainThread) {
  parentPort.on('message', ({ k, from, to }) => parentPort.postMessage({ k, r: testRange(from, to, workerData) }));
} else if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
