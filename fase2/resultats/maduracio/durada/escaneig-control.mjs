// Exploratori (la maduració, pas 3; el control de la prova curta, al README): l'escaneig del pas 1 d'una captura del món 1034, refet
// amb el codi d'ara, ha de donar la mateixa línia d'escaneig-1034.jsonl, byte a byte. És el procediment de
// ../descripcio/escaneig-temps.mjs (la prova del cens, completa i amb la segona generació; la llavor 711.000 més l'època, l'amplada 512 i
// el radi 2). No simula res.
//   node fase2/resultats/maduracio/durada/escaneig-control.mjs CARPETA-DEL-1034 EPOCA
import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { replicationTest } from '../../../../fase2/replication.js';
import { makeRng } from '../../../../fase1/soup.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { ROOT, SCAN, captureName } from './durada.mjs';

const SEED = 711000, WIDTH = 512, RADIUS = 2;
const [dir, epochArg] = process.argv.slice(2), epoch = Number(epochArg);
if (!dir || !Number.isInteger(epoch)) { console.error('Ús: node fase2/resultats/maduracio/durada/escaneig-control.mjs CARPETA-DEL-1034 EPOCA'); process.exit(2); }
const t0 = Date.now();
const soup = new Uint8Array(readFileSync(join(dir, captureName(epoch)))), n = soup.length / 64, rng = makeRng(SEED + epoch, 'v2'), cells = [];
for (let c = 0; c < n; c++) {
  const r = replicationTest(soup, c, rng, { width: WIDTH, radius: RADIUS, complete: true, heredity: true });
  if (r.solo || r.context) cells.push({ c, solo: r.solo, context: r.context, heritable: r.heritable, heritableSolo: r.heritableSolo, program: Buffer.from(soup.subarray(c * 64, (c + 1) * 64)).toString('hex') });
}
const mine = JSON.stringify({ epoch, file: captureName(epoch), sha256: createHash('sha256').update(soup).digest('hex'), seed: SEED + epoch, cells: n, replicating: cells.length, heritable: cells.filter((x) => x.heritable).length, heritableSolo: cells.filter((x) => x.heritableSolo).length, list: cells });
const theirs = readFileSync(join(ROOT, SCAN), 'utf8').trim().split('\n').find((l) => JSON.parse(l).epoch === epoch);
console.log(`codi ${codeVersion(ROOT)}, node ${process.version}; l'escaneig de l'època ${epoch}, refet: ${cells.length} es repliquen, ${cells.filter((x) => x.heritable).length} hereditàries (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
console.log(mine === theirs ? `igual, byte a byte, a la línia de ${SCAN}` : `DIFERENT de la línia de ${SCAN}`);
process.exit(mine === theirs ? 0 : 1);
