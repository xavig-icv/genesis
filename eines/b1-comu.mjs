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

// Les opcions: spec[nom] = { type: 'int'|'num'|'enum'|'str', min, max, values, required, default }. readOptions les llegeix i les
// valida estrictament: { opts }, { help: true } si demanen l'ajuda, o { error }. parseOptions, a la línia d'ordres, surt amb el codi 2 si
// hi ha cap error. Les anàlisis llegeixen l'ordre de cada registre amb el mateix contracte que l'eina (commandOptions, AU2-143)
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
export function readOptions(argv, spec) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help') return { help: true };
    if (!a.startsWith('--')) return { error: `argument inesperat: ${a}` };
    const name = a.slice(2), s = own(spec, name) ? spec[name] : null;
    if (!s) return { error: `opció desconeguda: ${a}` };
    if (own(opts, name)) return { error: `opció repetida: ${a}` };
    const v = argv[++i];
    if (v === undefined || v.startsWith('--')) return { error: `${a} necessita un valor` };
    if (s.type === 'int') {
      if (!/^\d+$/.test(v) || Number(v) < s.min || Number(v) > s.max) return { error: `${a} ha de ser un enter de ${s.min} a ${s.max}: ${v}` };
      opts[name] = Number(v);
    } else if (s.type === 'enum') {
      if (!s.values.includes(v)) return { error: `${a} ha de ser ${s.values.join(', ')}: ${v}` };
      opts[name] = v;
    } else opts[name] = v;
  }
  for (const [name, s] of Object.entries(spec)) {
    if (own(opts, name)) continue;
    if (s.required) return { error: `falta --${name}` };
    opts[name] = s.default;
  }
  return { opts };
}
export function parseOptions(argv, spec, usage) {
  const r = readOptions(argv, spec);
  if (r.help) { console.log(usage); process.exit(0); }
  if (r.error) { console.error(`Error: ${r.error}\nFes servir --help per veure les opcions.`); process.exit(2); }
  return r.opts;
}
// L'ordre d'un registre (command, a la línia d'inici), sencera, llegida amb el contracte d'opcions de l'eina (AU2-143, auditoria 29):
// { opts } o { error }. Les eines l'escriuen com a `node TOOL` i les opcions separades per un espai: cap no en porta cap
export function commandOptions(command, tool, spec) {
  const prefix = `node ${tool} `;
  if (typeof command !== 'string' || !command.startsWith(prefix)) return { error: `no és una ordre de ${tool}` };
  const r = readOptions(command.slice(prefix.length).split(' '), spec);
  return r.help ? { error: "l'ordre demana l'ajuda" } : r;
}
// El nom d'un fitxer, sense la carpeta (amb / o \)
export const baseName = (p) => String(p).split(/[\\/]/).pop();

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
// els resultats en l'ordre de les feines. Sempre acaba amb totes les feines fetes, o amb un error (AUD-179, auditoria 29): sense cap
// feina, no crea cap fil, i acaba de seguida (abans, la promesa no es resolia mai, i l'eina sortia amb el codi 0 sense escriure la línia
// final); i si un fil s'atura abans d'hora sense cap error, s'hi nega
export async function runJobs(jobs, { threads, compute, workerUrl, data, onDone }) {
  const done = new Map();
  let next = 0;
  const flush = () => { while (done.has(next)) { const r = done.get(next); done.delete(next); onDone(r, next); next++; } };
  if (threads === 1 || jobs.length === 0) jobs.forEach((job, k) => { done.set(k, compute(job, data)); flush(); });
  else {
    await new Promise((resolve, reject) => {
      let given = 0, running = 0;
      const ended = new Set();
      const give = (w) => {
        if (given >= jobs.length) { ended.add(w); w.terminate(); if (--running === 0) resolve(); return; }
        const k = given++;
        w.postMessage({ k, job: jobs[k] });
      };
      for (let f = 0; f < Math.min(threads, jobs.length); f++) {
        const w = new Worker(workerUrl, { workerData: data });
        running++;
        w.on('message', ({ k, r }) => { done.set(k, r); flush(); give(w); });
        w.on('error', reject);
        w.on('exit', (code) => { if (!ended.has(w)) reject(new Error(`un fil s'ha aturat abans d'acabar les seves feines (codi ${code})`)); });
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
