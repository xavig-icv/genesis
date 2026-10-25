// Transforma una captura (.bin) per als experiments d'alíquotes: la maduració de la sopa i la intervenció dels zeros
// (docs/pilot-maduracio.md). Cada braç d'un experiment parteix de la mateixa captura, amb una sola transformació, i
// després continua amb sim.mjs --from i el mateix atzar de continuació (--seed) a tots els braços.
//
//   node eines/transforma.mjs --from captura.bin --kind TIPUS --seed N --out sortida.bin [--width W] [--radius R]
//
// Tipus:
//   continue          la captura tal com és (el braç de referència)
//   shuffle-programs  permuta els programes sencers entre cel·les: conserva cada programa i l'histograma, i desfà
//                     la disposició a l'espai
//   shuffle-within    barreja els bytes dins de cada programa: conserva la composició de cada cel·la, i desfà
//                     l'ordre del codi
//   shuffle-all       barreja tots els bytes del món: conserva només l'histograma global
//   reinit            bytes nous a l'atzar, com una sopa de l'època 0
//   zeros-outside     els bytes zero de les cel·les que no es repliquen passen a un valor a l'atzar, d'1 a 255
//   control-outside   el mateix nombre de bytes no zero de les mateixes cel·les passen a un altre valor no zero
//   zeros-all         els bytes zero de totes les cel·les
//   control-all       el control de zeros-all
//
// Les cel·les que es repliquen són les que passen la prova de replicació (fase2/replication.js, sola o en
// context), provades totes una per una (uns 95 s en un món de 512 × 256). Amb la mateixa captura i la mateixa
// --seed, zeros-outside i control-outside fan servir exactament les mateixes cel·les.
//
// L'atzar de la transformació és el de --seed (generador v2), independent del de la continuació. L'eina escriu
// sortida.bin i sortida.json, amb la SHA-256 de l'entrada i de la sortida, el tipus, la llavor, el que ha canviat
// i els invariants comprovats. Si un invariant no es compleix, no escriu res i surt amb el codi 1.
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { PROGRAM_SIZE } from '../fase1/bff.js';
import { makeRng, randomSoup } from '../fase1/soup.js';
import { replicationTest } from '../fase2/replication.js';

export const KINDS = ['continue', 'shuffle-programs', 'shuffle-within', 'shuffle-all', 'reinit',
  'zeros-outside', 'control-outside', 'zeros-all', 'control-all'];
const sha256 = (b) => createHash('sha256').update(b).digest('hex');

// Fisher–Yates sobre `a` (in situ)
function shuffleArray(a, rng) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
}

// Les cel·les que es repliquen (prova completa, sola o en context), com a Uint8Array de 0 i 1
export function replicatingCells(soup, rng, { width, radius = 2 }) {
  const n = soup.length / PROGRAM_SIZE;
  const mask = new Uint8Array(n);
  for (let c = 0; c < n; c++) {
    const r = replicationTest(soup, c, rng, { width, radius, complete: true, heredity: false });
    if (r.solo || r.context) mask[c] = 1;
  }
  return mask;
}

// Retorna { out, info }. `info` diu quines cel·les eren dins de l'abast i quants bytes han canviat.
export function transform(soup, kind, seed, { width = 0, radius = 2 } = {}) {
  if (!KINDS.includes(kind)) throw new Error(`tipus de transformació desconegut: ${kind}`);
  const rng = makeRng(seed, 'v2');
  const n = soup.length / PROGRAM_SIZE;
  const out = Uint8Array.from(soup);
  const info = { kind, seed, cells: n };
  if (kind === 'shuffle-programs') {
    const perm = Uint32Array.from({ length: n }, (_, i) => i);
    shuffleArray(perm, rng);
    for (let c = 0; c < n; c++) out.set(soup.subarray(perm[c] * PROGRAM_SIZE, (perm[c] + 1) * PROGRAM_SIZE), c * PROGRAM_SIZE);
  } else if (kind === 'shuffle-within') {
    for (let c = 0; c < n; c++) shuffleArray(out.subarray(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE), rng);
  } else if (kind === 'shuffle-all') {
    shuffleArray(out, rng);
  } else if (kind === 'reinit') {
    out.set(randomSoup(n, rng));
  } else if (kind !== 'continue') {
    // els zeros i el seu control: l'abast és el de totes les cel·les, o el de les que no es repliquen
    const outside = kind.endsWith('-outside');
    const mask = outside ? replicatingCells(soup, rng, { width, radius }) : new Uint8Array(n);
    const inScope = (c) => !mask[c];
    let zeros = 0, scopeCells = 0;
    for (let c = 0; c < n; c++) {
      if (!inScope(c)) continue;
      scopeCells++;
      for (let i = c * PROGRAM_SIZE; i < (c + 1) * PROGRAM_SIZE; i++) if (soup[i] === 0) zeros++;
    }
    info.scope = { cells: scopeCells, replicating: n - scopeCells, zeros };
    if (kind.startsWith('zeros-')) {
      for (let c = 0; c < n; c++) {
        if (!inScope(c)) continue;
        for (let i = c * PROGRAM_SIZE; i < (c + 1) * PROGRAM_SIZE; i++) if (soup[i] === 0) out[i] = 1 + ((rng() * 255) | 0);
      }
    } else {
      // el mateix nombre de bytes no zero de l'abast, triats a l'atzar, passen a un altre valor no zero
      const eligible = new Uint32Array(scopeCells * PROGRAM_SIZE - zeros);
      let k = 0;
      for (let c = 0; c < n; c++) {
        if (!inScope(c)) continue;
        for (let i = c * PROGRAM_SIZE; i < (c + 1) * PROGRAM_SIZE; i++) if (soup[i] !== 0) eligible[k++] = i;
      }
      if (zeros > eligible.length) throw new Error('hi ha més zeros que bytes no zero a l\'abast: el control no és possible');
      for (let j = 0; j < zeros; j++) {
        const r = j + ((rng() * (eligible.length - j)) | 0);
        const t = eligible[j]; eligible[j] = eligible[r]; eligible[r] = t;
        const i = eligible[j];
        let v = 1 + ((rng() * 254) | 0);
        if (v >= soup[i]) v++;
        out[i] = v;
      }
    }
    info.mask = mask;
  }
  let changed = 0;
  for (let i = 0; i < soup.length; i++) if (soup[i] !== out[i]) changed++;
  info.changed = changed;
  return { out, info };
}

const histogram = (b) => { const h = new Float64Array(256); for (let i = 0; i < b.length; i++) h[b[i]]++; return h; };
const sameArray = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

// Comprova que la sortida conservi el que ha de conservar cada tipus. Retorna la llista de problemes (buida si
// tot és correcte).
export function checkInvariants(input, output, info) {
  const p = [];
  const n = input.length / PROGRAM_SIZE;
  const cell = (b, c) => b.subarray(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE);
  if (output.length !== input.length) return ['la sortida no té la mida de l\'entrada'];
  switch (info.kind) {
    case 'continue':
      if (!sameArray(input, output)) p.push('continue ha canviat algun byte');
      break;
    case 'shuffle-programs': {
      const key = (b) => Array.from({ length: n }, (_, c) => Buffer.from(cell(b, c)).toString('hex')).sort();
      if (!sameArray(key(input), key(output))) p.push('shuffle-programs no conserva el conjunt de programes');
      break;
    }
    case 'shuffle-within':
      for (let c = 0; c < n; c++) {
        if (!sameArray(Array.from(cell(input, c)).sort((a, b) => a - b), Array.from(cell(output, c)).sort((a, b) => a - b))) { p.push(`shuffle-within no conserva la composició de la cel·la ${c}`); break; }
      }
      break;
    case 'shuffle-all':
      if (!sameArray(histogram(input), histogram(output))) p.push('shuffle-all no conserva l\'histograma');
      break;
    case 'reinit':
      break;
    default: {
      const mask = info.mask;
      let changed = 0;
      for (let c = 0; c < n; c++) {
        for (let i = c * PROGRAM_SIZE; i < (c + 1) * PROGRAM_SIZE; i++) {
          if (input[i] === output[i]) continue;
          changed++;
          if (mask[c]) { p.push(`${info.kind} ha canviat una cel·la fora de l'abast (${c})`); return p; }
          if (info.kind.startsWith('zeros-') && input[i] !== 0) { p.push(`${info.kind} ha canviat un byte no zero (${i})`); return p; }
          if (info.kind.startsWith('control-') && (input[i] === 0 || output[i] === 0)) { p.push(`${info.kind} ha tocat o creat un zero (${i})`); return p; }
        }
      }
      if (info.kind.startsWith('zeros-')) {
        for (let c = 0; c < n; c++) if (!mask[c] && cell(output, c).includes(0)) { p.push(`${info.kind} deixa zeros a l'abast (cel·la ${c})`); break; }
      }
      if (changed !== info.scope.zeros) p.push(`${info.kind} ha canviat ${changed} bytes, i n'havia de canviar ${info.scope.zeros}`);
    }
  }
  return p;
}

function codeVersion() {
  const here = fileURLToPath(new URL('..', import.meta.url));
  const run = (cmd) => execSync(cmd, { cwd: here, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  try { return run('git rev-parse --short HEAD') + (run('git status --porcelain -- "*.js" "*.mjs"') ? '+canvis' : ''); }
  catch { try { return readFileSync(new URL('../VERSIO', import.meta.url), 'utf8').trim(); } catch { return 'desconeguda'; } }
}

function fail(message) {
  console.error(`Error: ${message}\nÚs: node eines/transforma.mjs --from captura.bin --kind TIPUS --seed N --out sortida.bin [--width W] [--radius R]\nTipus: ${KINDS.join(', ')}`);
  process.exit(2);
}

function main(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i += 2) {
    const name = argv[i]?.replace(/^--/, '');
    if (!['from', 'kind', 'seed', 'out', 'width', 'radius'].includes(name) || !argv[i].startsWith('--')) fail(`opció desconeguda: ${argv[i]}`);
    if (name in opts) fail(`--${name} està repetida`);
    if (argv[i + 1] === undefined) fail(`--${name} necessita un valor`);
    opts[name] = argv[i + 1];
  }
  for (const k of ['from', 'kind', 'seed', 'out']) if (!(k in opts)) fail(`falta --${k}`);
  if (!KINDS.includes(opts.kind)) fail(`tipus desconegut: ${opts.kind}`);
  if (!/^\d+$/.test(opts.seed)) fail('--seed ha de ser un enter no negatiu');
  if (!existsSync(opts.from)) fail(`no trobo ${opts.from}`);
  if (!opts.out.endsWith('.bin')) fail('--out ha d\'acabar en .bin');
  const width = Number(opts.width ?? (opts.from.match(/mon(\d+)x\d+/)?.[1] ?? NaN));
  const radius = Number(opts.radius ?? (opts.from.match(/-r(\d+)/)?.[1] ?? 2));
  if (!Number.isInteger(width) || width < 2) fail('no sé l\'amplada del món: fes servir --width');
  const input = new Uint8Array(readFileSync(opts.from));
  if (input.length % PROGRAM_SIZE || (input.length / PROGRAM_SIZE) % width) fail(`${opts.from} no té la mida d'un món de ${width} d'amplada`);
  const { out, info } = transform(input, opts.kind, Number(opts.seed), { width, radius });
  const problems = checkInvariants(input, out, info);
  if (problems.length) { console.error(`Invariants incomplerts:\n- ${problems.join('\n- ')}`); process.exit(1); }
  const record = {
    tool: 'eines/transforma.mjs', code: codeVersion(), node: process.version,
    from: opts.from, fromSha256: sha256(input), kind: opts.kind, seed: Number(opts.seed), width, radius,
    out: opts.out, outSha256: sha256(out), changed: info.changed, scope: info.scope ?? null,
    zeros: { before: input.reduce((s, v) => s + (v === 0), 0), after: out.reduce((s, v) => s + (v === 0), 0) },
    invariants: 'correctes',
  };
  writeFileSync(opts.out, out);
  writeFileSync(opts.out.replace(/\.bin$/, '.json'), JSON.stringify(record, null, 1) + '\n');
  console.log(`${opts.kind}: ${info.changed} bytes canviats${info.scope ? ` (abast: ${info.scope.cells} cel·les, ${info.scope.zeros} zeros)` : ''}; invariants correctes; ${opts.out}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main(process.argv.slice(2));
