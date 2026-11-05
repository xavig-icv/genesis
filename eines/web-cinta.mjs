// La cinta de la portada del lloc web (web/index.html, la figura #tape): tria una parella de cel·les veïnes d'una captura i
// en comprova les xifres del peu. Les parelles són les d'una cel·la de la família (primer) amb un veí sense família
// (segon, dins del quadrat de 5 × 5 del món, fase2/world.js), en l'ordre de les cel·les (y, x) i, per a cada una, dels
// veïns (dy, dx). La família de cada cel·la és la dels mapes del lloc (web/dades/MON/mapes.z). Se'n tria una a l'atzar
// amb eines/tria.mjs i la llavor, i s'executen totes amb l'intèrpret del simulador: quantes acaben amb una còpia sencera
// del programa de la família al revés a l'altra meitat (com es copien els replicadors que hem vist, fase2/replication.js),
// quantes del dret i quantes hi deixen almenys una finestra de 16 bytes (el criteri de la prova de replicació).
//
//   node eines/web-cinta.mjs CAPTURA.bin web/dades/1006 3500 20261030 [FAMILIA]
//
// Escriu els bytes de la cinta triada (el data-bytes de la figura) i el pas on la còpia al revés és sencera.
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';
import { inflateSync } from 'zlib';
import { evaluate, PROGRAM_SIZE, TAPE_SIZE } from '../fase1/bff.js';
import { windowsOf, hasWindow } from '../fase2/replication.js';
import { pick } from './tria.mjs';
import { trace, check, mirrorStep } from '../web/js/cinta.js';

const [capture, dir, epochArg, seedArg, familyArg = '1'] = process.argv.slice(2);
if (!capture || !dir || !/^\d+$/.test(epochArg ?? '') || !/^\d+$/.test(seedArg ?? '')) {
  console.error('Ús: node eines/web-cinta.mjs CAPTURA.bin web/dades/MON EPOCA LLAVOR [FAMILIA]');
  process.exit(2);
}
// un Uint8Array, no un Buffer: Buffer.slice() no copia
const soup = new Uint8Array(readFileSync(capture));
const meta = JSON.parse(readFileSync(join(dir, 'mon.json'), 'utf8'));
const [W, H] = meta.mida, n = W * H;
if (soup.length !== n * PROGRAM_SIZE) throw new Error(`${capture} no té la mida del món ${meta.id}`);
const sha = createHash('sha256').update(soup).digest('hex');
const source = meta.fonts.find((f) => f.e === Number(epochArg));
if (!source || source.sha256 !== sha) throw new Error(`la captura no és la de l'època ${epochArg} de ${dir}/mon.json`);
const maps = inflateSync(readFileSync(join(dir, meta.mapes.fitxer)));
const i = meta.fotogrames.findIndex((f) => f.e === Number(epochArg));
const fam = maps.subarray(i * 2 * n, i * 2 * n + n), slot = meta.fotogrames[i].f.indexOf(Number(familyArg)) + 1;
if (!slot) throw new Error(`la família ${familyArg} no és viva a l'època ${epochArg}`);

const pairs = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (fam[y * W + x] !== slot) continue;
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    if (!dx && !dy) continue;
    const bx = x + dx, by = y + dy;
    if (bx < 0 || by < 0 || bx >= W || by >= H || fam[by * W + bx] !== 0) continue;
    pairs.push([x, y, bx, by]);
  }
}
const cell = (x, y) => soup.slice((y * W + x) * PROGRAM_SIZE, (y * W + x + 1) * PROGRAM_SIZE);
let mirror = 0, exact = 0, windowed = 0;
const tape = new Uint8Array(TAPE_SIZE);
for (const [x, y, bx, by] of pairs) {
  const A = cell(x, y);
  tape.set(A, 0);
  tape.set(cell(bx, by), PROGRAM_SIZE);
  evaluate(tape, 0);
  let m = true, e = true;
  for (let k = 0; k < PROGRAM_SIZE; k++) {
    if (tape[PROGRAM_SIZE + k] !== A[PROGRAM_SIZE - 1 - k]) m = false;
    if (tape[PROGRAM_SIZE + k] !== A[k]) e = false;
  }
  mirror += m; exact += e;
  if (hasWindow(tape.subarray(PROGRAM_SIZE), windowsOf(A))) windowed++;
}
const pct = (k) => `${((k / pairs.length) * 100).toFixed(1)} %`;
console.log(`captura ${capture} (sha256 ${sha}), època ${epochArg}, família ${familyArg}`);
console.log(`parelles: ${pairs.length}`);
console.log(`  còpia sencera al revés: ${mirror} (${pct(mirror)})`);
console.log(`  còpia sencera del dret: ${exact} (${pct(exact)})`);
console.log(`  almenys una finestra de 16 bytes: ${windowed} (${pct(windowed)})`);

const [chosen] = pick(Number(seedArg), 1, pairs.map((p) => p.join(',')));
const [x, y, bx, by] = chosen.split(',').map(Number);
const bytes = new Uint8Array(TAPE_SIZE);
bytes.set(cell(x, y), 0);
bytes.set(cell(bx, by), PROGRAM_SIZE);
const tr = trace(bytes);
if (check(bytes, tr, 1) !== -1) throw new Error("el traçat de web/js/cinta.js no coincideix amb l'intèrpret");
let same = 0;
for (let k = 0; k < PROGRAM_SIZE; k++) if (bytes[k] === bytes[PROGRAM_SIZE + k]) same++;
console.log(`triada amb la llavor ${seedArg}: A (${x}, ${y}), B (${bx}, ${by})`);
console.log(`  passos: ${tr.steps}; còpia al revés sencera al pas ${mirrorStep(bytes, tr)}`);
console.log(`  al principi, B té ${same} dels 64 bytes d'A als mateixos llocs`);
console.log(`  data-bytes="${Buffer.from(bytes).toString('hex')}"`);
