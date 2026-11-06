// El que comparteixen les eines de B1 que venen després del nivell 1 (docs/pla-b1.md, §4, §13 i §14): la prova d'autonomia
// (eines/autonomia.mjs), els estrats i les sopes de la §13 (eines/estrats.mjs) i les seves anàlisis. eines/densitat.mjs no en fa
// servir res: és el del nivell 1, i no canvia.
//  - el codi, com a eines/densitat.mjs: el commit, amb "+canvis" si hi ha cap .js o .mjs sense desar o sense seguir;
//  - la SHA-256 dels mòduls de què depèn el resultat;
//  - les opcions de la línia d'ordres, validades estrictament;
//  - l'extracte dels hereditaris del nivell 1 (fase2/resultats/b1/nivell1/hereditaris.jsonl.gz), comprovat amb la seva SHA-256;
//  - les feines en fils (worker_threads), amb els resultats escrits en ordre: no depenen dels fils;
//  - la lectura d'un JSONL amb la línia d'inici, les dels resultats i la final, amb l'empremta.
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { createHash } from 'crypto';
import { join } from 'path';
import { gunzipSync } from 'zlib';
import { fileURLToPath } from 'url';
import { Worker, parentPort, workerData } from 'worker_threads';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const EXTRACT = 'fase2/resultats/b1/nivell1/hereditaris.jsonl.gz';
// la SHA-256 del contingut de l'extracte, descomprimit (fase2/resultats/b1/nivell1/README.md, AUD-174)
export const EXTRACT_SHA256 = '6029d8783b13b1c8faa4077b0e28b2c569903e2420b8f660efa081092fb049a1';
export const sha256 = (b) => createHash('sha256').update(b).digest('hex');

// Quina versió del codi fa el càlcul: el commit, amb "+canvis" si el codi té canvis sense desar o fitxers sense seguir; o, sense
// git (a la màquina virtual), el fitxer VERSIO
export function codeVersion(root = ROOT) {
  const run = (cmd) => execSync(cmd, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  try {
    const hash = run('git rev-parse --short HEAD');
    return hash + (run('git status --porcelain -- "*.js" "*.mjs"') ? '+canvis' : '');
  } catch {
    try { return readFileSync(join(root, 'VERSIO'), 'utf8').trim(); } catch { return 'desconeguda'; }
  }
}
export function fileHashes(files, root = ROOT) {
  return Object.fromEntries(files.map((f) => [f, sha256(readFileSync(join(root, f)))]));
}

// Les opcions: spec[nom] = { type: 'int'|'num'|'enum'|'str', min, max, values, required, default }. Els errors surten amb el codi 2
export function parseOptions(argv, spec, usage) {
  const fail = (m) => { console.error(`Error: ${m}\nFes servir --help per veure les opcions.`); process.exit(2); };
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help') { console.log(usage); process.exit(0); }
    if (!a.startsWith('--')) fail(`argument inesperat: ${a}`);
    const name = a.slice(2), s = spec[name];
    if (!s) fail(`opció desconeguda: ${a}`);
    if (name in opts) fail(`opció repetida: ${a}`);
    const v = argv[++i];
    if (v === undefined || v.startsWith('--')) fail(`${a} necessita un valor`);
    if (s.type === 'int') {
      if (!/^\d+$/.test(v) || Number(v) < s.min || Number(v) > s.max) fail(`${a} ha de ser un enter de ${s.min} a ${s.max}: ${v}`);
      opts[name] = Number(v);
    } else if (s.type === 'enum') {
      if (!s.values.includes(v)) fail(`${a} ha de ser ${s.values.join(', ')}: ${v}`);
      opts[name] = v;
    } else opts[name] = v;
  }
  for (const [name, s] of Object.entries(spec)) {
    if (name in opts) continue;
    if (s.required) fail(`falta --${name}`);
    opts[name] = s.default;
  }
  return opts;
}

// L'extracte dels hereditaris del nivell 1: per a cada registre, la línia d'inici, les dels hereditaris i la final. Si la SHA-256
// del contingut no és la de l'extracte, es nega
export function readExtract(file = join(ROOT, EXTRACT)) {
  const text = gunzipSync(readFileSync(file));
  if (sha256(text) !== EXTRACT_SHA256) throw new Error(`${file}: la SHA-256 del contingut no és la de l'extracte (${EXTRACT_SHA256})`);
  const records = [];
  let cur = null;
  for (const l of text.toString('utf8').split('\n')) {
    if (!l) continue;
    const o = JSON.parse(l);
    if (o.type === 'start') { if (cur) throw new Error('extracte: una línia d\'inici abans de la final'); cur = { start: o, heritable: [] }; }
    else if (o.type === 'replicator') { if (!cur) throw new Error('extracte: un replicador fora d\'un registre'); cur.heritable.push(o); }
    else if (o.type === 'end') { if (!cur || cur.heritable.length !== o.heritable) throw new Error('extracte: un registre que no quadra'); records.push({ ...cur, end: o }); cur = null; }
    else throw new Error(`extracte: una línia desconeguda (${o.type})`);
  }
  if (cur) throw new Error("extracte: l'últim registre no té la línia final");
  return records;
}
export function extractRecord(records, chemistry, distribution) {
  const r = records.filter((x) => x.start.chemistry === chemistry && x.start.distribution === distribution);
  if (r.length !== 1) throw new Error(`l'extracte no té un sol registre de ${chemistry} amb ${distribution}`);
  return r[0];
}

// Les feines, en fils: compute(job) a cada fil (el fitxer de l'eina, workerUrl, amb serveJobs), o aquí si threads és 1. onDone rep
// els resultats en l'ordre de les feines
export async function runJobs(jobs, { threads, compute, workerUrl, data, onDone }) {
  const done = new Map();
  let next = 0;
  const flush = () => { while (done.has(next)) { const r = done.get(next); done.delete(next); onDone(r, next); next++; } };
  if (threads === 1) jobs.forEach((job, k) => { done.set(k, compute(job, data)); flush(); });
  else {
    await new Promise((resolve, reject) => {
      let given = 0, running = 0;
      const give = (w) => {
        if (given >= jobs.length) { w.terminate(); if (--running === 0) resolve(); return; }
        const k = given++;
        w.postMessage({ k, job: jobs[k] });
      };
      for (let f = 0; f < Math.min(threads, jobs.length); f++) {
        const w = new Worker(workerUrl, { workerData: data });
        running++;
        w.on('message', ({ k, r }) => { done.set(k, r); flush(); give(w); });
        w.on('error', reject);
        give(w);
      }
    });
  }
  if (next !== jobs.length) throw new Error('hi falten feines');
}
export function serveJobs(compute) {
  parentPort.on('message', ({ k, job }) => parentPort.postMessage({ k, r: compute(job, workerData) }));
}

// Llegeix un JSONL d'una d'aquestes eines: { name, start, lines, end, problems }. L'empremta de la línia final és la SHA-256 de
// les línies d'entremig, tal com són
export function readJsonl(file) {
  const name = file.split(/[\\/]/).pop();
  let raw;
  try { raw = readFileSync(file, 'utf8'); } catch { return { name, problems: [`${name}: no es pot llegir`] }; }
  const text = raw.split('\n').filter((l) => l !== '');
  let ls;
  try { ls = text.map((l) => JSON.parse(l)); } catch { return { name, problems: [`${name}: una línia que no és JSON`] }; }
  const start = ls[0], end = ls[ls.length - 1];
  if (start?.type !== 'start' || end?.type !== 'end' || ls.length < 2) return { name, problems: [`${name}: no és sencer (sense la línia d'inici o la final)`] };
  const fingerprint = sha256(text.slice(1, -1).map((l) => l + '\n').join(''));
  const problems = end.fingerprint === fingerprint ? [] : [`${name}: l'empremta no és la dels resultats`];
  return { name, start, lines: ls.slice(1, -1), end, problems };
}
