// La sembra de l'assaig d'invasió: el pilot de l'aparició i l'arrelament (docs/pla-aparicio-arrelament.md, §4.2), l'única excepció a la
// regla de no plantar res (§2). Escriu el fitxer que llegeix sim.mjs --plant: la SHA-256 del món de partida, les cel·les i els 64 bytes
// que s'hi planten. No escriu cap captura: la sembra es fa a la memòria, a sim.mjs.
//
//   node eines/sembra.mjs --from captura.bin --program HEX --cell X,Y [--square] [--sham LLAVOR] --lineage-seed N
//        [--genotype NOM] [--width W] --out fitxer.json
//   node eines/sembra.mjs --positions MON K [--width W --height H]
//
//  - El genotip ha de ser hereditari sol en 95 o més de les 100 condicions de companys inerts (fase2/inert.js, la llavor 3000000000).
//  - Amb --sham, es planten els bytes del genotip en un ordre a l'atzar (el generador v2, amb la LLAVOR): la primera permutació que no
//    es copia en cap de les 100 condicions.
//  - La cel·la ha de ser a 2 o més de cada vora (té els 24 veïns). Amb --square, el quadrat de 3 × 3 cel·les centrat en aquesta.
//  - Les posicions del pilot (--positions): el generador v2 amb la llavor del món + 700.000; x = 2 + ⌊r · (W − 4)⌋ i després
//    y = 2 + ⌊r · (H − 4)⌋, K cel·les diferents.
// No sobreescriu mai cap fitxer.
import { readFileSync, writeFileSync, existsSync, renameSync } from 'fs';
import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import { PROGRAM_SIZE } from '../fase1/bff.js';
import { makeRng } from '../fase1/soup.js';
import { conditions, testInert, fromHex, toHex, INERT_CONDITIONS_SEED } from '../fase2/inert.js';

export const POSITION_OFFSET = 700000;
export const GENOTYPE_MIN = 95;   // hereditari sol en 95 de 100, com a mínim
export const SHAM_TRIES = 100;
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const count1 = (s) => [...s].filter((c) => c === '1').length;

// Les K posicions d'un món
export function positions(world, k, width = 512, height = 256) {
  const rng = makeRng(world + POSITION_OFFSET, 'v2');
  const out = [];
  while (out.length < k) {
    const x = 2 + ((rng() * (width - 4)) | 0), y = 2 + ((rng() * (height - 4)) | 0);
    if (!out.some((p) => p.x === x && p.y === y)) out.push({ x, y, cell: y * width + x });
  }
  return out;
}

// Les quatre xifres d'un programa a les 100 condicions
export function genotypeTest(bytes) {
  const s = testInert(bytes, conditions(INERT_CONDITIONS_SEED, 100));
  return { solo: count1(s.solo), context: count1(s.context), heritableSolo: count1(s.heritableSolo), heritableContext: count1(s.heritableContext) };
}

// La permutació del sham: la primera que no es copia en cap condició
export function makeSham(bytes, seed) {
  const rng = makeRng(seed, 'v2');
  for (let attempt = 1; attempt <= SHAM_TRIES; attempt++) {
    const p = Uint8Array.from(bytes);
    for (let i = p.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [p[i], p[j]] = [p[j], p[i]]; }
    const t = genotypeTest(p);
    if (t.solo === 0 && t.context === 0) return { bytes: p, attempts: attempt, test: t };
  }
  throw new Error(`cap de les ${SHAM_TRIES} permutacions no deixa de copiar-se`);
}

// Les cel·les d'una sembra
export function plantCells(x, y, width, height, square) {
  if (x < 2 || y < 2 || x > width - 3 || y > height - 3) throw new Error(`la cel·la (${x}, ${y}) no és a 2 o més de cada vora`);
  return square ? [-1, 0, 1].flatMap((dy) => [-1, 0, 1].map((dx) => (y + dy) * width + (x + dx))) : [y * width + x];
}

// El registre d'una sembra (el que llegeix sim.mjs --plant). `soup` és el món de partida, sencer; `from`, el seu camí. Amb `cache`,
// les proves del genotip i del sham es fan una sola vegada per programa i llavor (eines/arrelament.mjs en fa milers)
export function makePlant({ from, soup, width = 512, cells, program, genotype = null, sham = null, lineageSeed, cache = null }) {
  if (!/^[0-9a-f]{128}$/.test(program)) throw new Error(`el programa ha de tenir ${PROGRAM_SIZE} bytes en hexadecimal (en minúscules)`);
  if (soup.length % (PROGRAM_SIZE * width)) throw new Error(`${from} no és un món d'amplada ${width}`);
  if (!Number.isInteger(lineageSeed)) throw new Error('falta la llavor del llinatge');
  const height = soup.length / PROGRAM_SIZE / width;
  const memo = (key, fn) => { if (!cache) return fn(); if (!cache.has(key)) cache.set(key, fn()); return cache.get(key); };
  const g = fromHex(program);
  const genotypeResult = memo(`g:${program}`, () => genotypeTest(g));
  if (genotypeResult.heritableSolo < GENOTYPE_MIN) throw new Error(`el genotip és hereditari sol en ${genotypeResult.heritableSolo} de 100 condicions, i en cal ${GENOTYPE_MIN}`);
  let bytes = g, shamInfo = null, planted = genotypeResult;
  if (sham !== null) {
    const s = memo(`s:${program}:${sham}`, () => makeSham(g, sham));
    bytes = s.bytes; planted = s.test;
    shamInfo = { seed: sham, attempts: s.attempts };
  }
  const out = Uint8Array.from(soup);
  for (const c of cells) out.set(bytes, c * PROGRAM_SIZE);
  const allowed = new Set(cells);
  for (let i = 0; i < out.length; i++) if (out[i] !== soup[i] && !allowed.has((i / PROGRAM_SIZE) | 0)) throw new Error('ha canviat un byte fora de les cel·les plantades');
  return {
    type: 'plant', code: codeVersion(), node: process.version, date: new Date().toISOString(),
    from, sourceSha256: sha256(soup), outputSha256: sha256(out), width, height, cells,
    genotype, program, hex: toHex(bytes), sham: shamInfo, lineageSeed,
    genotypeTest: genotypeResult, plantedTest: planted, conditions: { seed: INERT_CONDITIONS_SEED, count: 100 },
  };
}
// L'escriu, sense sobreescriure mai res
export function writePlant(out, record) {
  if (existsSync(out) || existsSync(`${out}.part`)) throw new Error(`${out} ja hi és: no el sobreescric`);
  writeFileSync(`${out}.part`, JSON.stringify(record, null, 2) + '\n', { flag: 'wx' });
  renameSync(`${out}.part`, out);
}

let codeMemo = null;
function codeVersion() {
  if (codeMemo) return codeMemo;
  codeMemo = gitVersion();
  return codeMemo;
}
function gitVersion() {
  const here = fileURLToPath(new URL('..', import.meta.url));
  const run = (cmd) => execSync(cmd, { cwd: here, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  try { return run('git rev-parse --short HEAD') + (run('git status --porcelain -- "*.js" "*.mjs"') ? '+canvis' : ''); }
  catch { try { return readFileSync(new URL('../VERSIO', import.meta.url), 'utf8').trim(); } catch { return 'desconeguda'; } }
}

function fail(message) {
  console.error(`Error: ${message}\nÚs: node eines/sembra.mjs --from captura.bin --program HEX --cell X,Y [--square] [--sham LLAVOR] --lineage-seed N [--genotype NOM] [--width W] --out fitxer.json\n     node eines/sembra.mjs --positions MON K [--width W --height H]`);
  process.exit(2);
}

function main(argv) {
  const opts = {};
  const flags = new Set(['square']);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) fail(`no s'esperava "${a}"`);
    const name = a.slice(2);
    if (name in opts) fail(`--${name} està repetida`);
    if (flags.has(name)) { opts[name] = true; continue; }
    if (name === 'positions') { opts.positions = [argv[++i], argv[++i]]; continue; }
    const v = argv[++i];
    if (v === undefined || v.startsWith('--')) fail(`--${name} necessita un valor`);
    opts[name] = v;
  }
  const known = new Set(['from', 'program', 'cell', 'square', 'sham', 'lineage-seed', 'genotype', 'width', 'height', 'out', 'positions']);
  for (const k of Object.keys(opts)) if (!known.has(k)) fail(`opció desconeguda --${k}`);
  const int = (name, v) => { if (!/^\d+$/.test(v ?? '')) fail(`--${name} ha de ser un nombre enter`); return Number(v); };
  const width = opts.width === undefined ? 512 : int('width', opts.width);
  if (opts.positions) {
    const [w, k] = opts.positions;
    const height = opts.height === undefined ? 256 : int('height', opts.height);
    for (const p of positions(int('positions', w), int('positions', k), width, height)) console.log(`${p.x},${p.y} ${p.cell}`);
    return;
  }
  for (const k of ['from', 'program', 'cell', 'lineage-seed', 'out']) if (opts[k] === undefined) fail(`falta --${k}`);
  if (existsSync(opts.out) || existsSync(`${opts.out}.part`)) fail(`${opts.out} ja hi és: no el sobreescric`);
  const soup = new Uint8Array(readFileSync(opts.from));
  if (soup.length % (PROGRAM_SIZE * width)) fail(`${opts.from} no és un món d'amplada ${width}`);
  const height = soup.length / PROGRAM_SIZE / width;
  const m = opts.cell.match(/^(\d+),(\d+)$/);
  if (!m) fail('--cell ha de ser X,Y');
  let cells;
  try { cells = plantCells(Number(m[1]), Number(m[2]), width, height, !!opts.square); } catch (e) { fail(e.message); }
  let record;
  try {
    record = makePlant({ from: opts.from, soup, width, cells, program: opts.program, genotype: opts.genotype ?? null,
      sham: opts.sham === undefined ? null : int('sham', opts.sham), lineageSeed: int('lineage-seed', opts['lineage-seed']) });
    writePlant(opts.out, record);
  } catch (e) { fail(e.message); }
  const planted = record.plantedTest;
  console.log(`${opts.out}: ${record.sham ? `sham (la permutació ${record.sham.attempts})` : `el genotip ${record.genotype ?? ''}`} a ${cells.length} cel·la${cells.length > 1 ? 'es' : ''}; hereditari sol en ${planted.heritableSolo} de 100`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
