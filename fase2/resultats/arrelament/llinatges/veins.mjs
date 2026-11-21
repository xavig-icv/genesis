// Les famílies naturals seguides com els plantats (exploratori; la nota, README.md, la pregunta 3): els veïns de la sembra, en una sola
// trobada. Una prova fora del món, com la de replicació: no planta res al món ni en cap branca.
//
//   node fase2/resultats/arrelament/llinatges/veins.mjs CARPETA-DE-LES-CAPTURES [--mon NNNN] > veins.jsonl
//
// CARPETA-DE-LES-CAPTURES: la carpeta del pilot de la còpia del càlcul, la que té alicuotes/NNNN/ARM.bin (no són a git). Cada captura ha de
// tenir la SHA-256 del manifest i la de la sembra (sourceSha256). Amb --mon, només aquell món (la prova curta).
// Per a cada sembra de G1 (una cel·la) i de G4 de la part A: els veïns de la cel·la sembrada dins del quadrat de radi 2 (els que
// pairNeighbors hi pot aparellar) a la captura de partida; amb cada veí, la cinta de les dues parelles (el genotip primer, i el veí
// primer), executada una vegada amb evaluate() de fase1/bff.js (la química de sempre, el màxim de passos del món), sense mutacions. De cada
// trobada, tres coses (no s'exclouen; canviat després de la prova curta, vegeu el README):
//  - 'copia': la meitat del veí porta alguna finestra del genotip (o del seu mirall), la regla de la prova de replicació (fase2/replication.js);
//  - 'tocat': algun byte de la meitat del genotip ha canviat;
//  - 'malmes': la meitat del genotip ja no és hereditària amb companys inerts, amb la prova del llinatge (fase2/inert.js, les 3 condicions).
// I la composició dels veïns: la part dels bytes que són instruccions, i la de '<' i ','.
import { readFileSync } from 'fs';
import { join } from 'path';
import { evaluate, PROGRAM_SIZE, TAPE_SIZE, OPCODES } from '../../../../fase1/bff.js';
import { fromHex, conditions, testInert, heritable, INERT_CONDITIONS, INERT_CONDITIONS_SEED } from '../../../../fase2/inert.js';
import { windowsOf, hasWindow } from '../../../../fase2/replication.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { ROOT, PILOT, ARMS, sha256 } from './comu.mjs';

const args = process.argv.slice(2);
const font = args[0];
const nomes = args[1] === '--mon' ? args[2] : null;
if (!font || !(args.length === 1 || (args.length === 3 && nomes))) { console.error('ús: node veins.mjs CARPETA-DE-LES-CAPTURES [--mon NNNN]'); process.exit(2); }
const t0 = Date.now();
const m = JSON.parse(readFileSync(join(ROOT, PILOT, 'manifest.json'), 'utf8'));
const [W, H] = m.params.world, R = m.params.radius;
const worlds = new Map(m.worlds.map((w) => [w.world, w]));
const INSTR = new Set([...OPCODES].map((c) => c.charCodeAt(0)));
const LT = '<'.charCodeAt(0), COMMA = ','.charCodeAt(0);
const same = (a, off, g) => { for (let i = 0; i < PROGRAM_SIZE; i++) if (a[off + i] !== g[i]) return false; return true; };
const conds = conditions(INERT_CONDITIONS_SEED, INERT_CONDITIONS);
const fn = new Map();
const functional = (P) => { const k = Array.from(P).join(','); if (!fn.has(k)) fn.set(k, heritable(testInert(P, conds))); return fn.get(k); };
console.log(JSON.stringify({ type: 'start', code: codeVersion(), node: process.version, genotypes: ['G1', 'G4'], radius: R, world: [W, H], only: nomes }));
const cache = new Map();
let n = 0;
for (const b of m.branches.filter((x) => x.part === 'A' && ARMS.includes(x.soup) && (x.variant === 'G1' || x.variant === 'G4') && (!nomes || x.world === nomes))) {
  const s = JSON.parse(readFileSync(join(ROOT, b.plant), 'utf8'));
  const arm = worlds.get(b.world).arms[b.soup];
  if (s.sourceSha256 !== arm.sha256) { console.error(`${b.id}: la sembra no és de la captura del manifest`); process.exit(1); }
  if (!cache.has(arm.file)) {
    const buf = new Uint8Array(readFileSync(join(font, arm.file.slice(PILOT.length + 1))));
    if (sha256(buf) !== arm.sha256) { console.error(`${b.id}: la captura de partida no té la SHA-256 del manifest`); process.exit(1); }
    cache.clear(); cache.set(arm.file, buf);
  }
  const soup = cache.get(arm.file);
  const g = fromHex(s.hex);
  if (s.cells.length !== 1) { console.error(`${b.id}: no és una sembra d'una cel·la`); process.exit(1); }
  const p = s.cells[0], x = p % W, y = (p / W) | 0;
  const counts = { copia: 0, tocat: 0, malmes: 0 };
  const wg = windowsOf(g);
  const genotypeFunctional = functional(g);
  let bytes = 0, instr = 0, lt = 0, comma = 0, veins = 0;
  const tape = new Uint8Array(TAPE_SIZE);
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    const nx = x + dx, ny = y + dy;
    if ((dx === 0 && dy === 0) || nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    const q = soup.subarray((ny * W + nx) * PROGRAM_SIZE, (ny * W + nx + 1) * PROGRAM_SIZE);
    veins++;
    for (const v of q) { bytes++; if (INSTR.has(v)) instr++; if (v === LT) lt++; if (v === COMMA) comma++; }
    for (const first of [true, false]) {
      const go = first ? 0 : PROGRAM_SIZE, qo = first ? PROGRAM_SIZE : 0;
      tape.set(g, go); tape.set(q, qo);
      evaluate(tape, 0);
      if (hasWindow(tape.subarray(qo, qo + PROGRAM_SIZE), wg)) counts.copia++;
      const intact = same(tape, go, g);
      if (!intact) counts.tocat++;
      if (!(intact ? genotypeFunctional : functional(tape.slice(go, go + PROGRAM_SIZE)))) counts.malmes++;
    }
  }
  n++;
  console.log(JSON.stringify({ type: 'sembra', branch: b.id, world: b.world, soup: b.soup, genotype: b.variant, position: b.position, cell: p, veins,
    genotypeFunctional, ...counts, instr: instr / bytes, lt: lt / bytes, comma: comma / bytes }));
}
console.log(JSON.stringify({ type: 'end', sembres: n, seconds: (Date.now() - t0) / 1000 }));
