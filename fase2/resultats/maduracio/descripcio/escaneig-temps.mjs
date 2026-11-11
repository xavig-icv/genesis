// Exploratori (la maduració, pas 1, l'afegit): l'escaneig de totes les cel·les de les captures del món 1034, una cada 100 èpoques, amb
// la prova de replicació del projecte (fase2/replication.js, completa i amb la segona generació; la mateixa de transforma.mjs --scan).
// De cada cel·la que es replica en desa la posició, el programa i si és hereditària. No simula res: només llegeix captures.
//   node escaneig-temps.mjs CARPETA-DEL-1034 CARPETA-DE-TREBALL FILS [EPOCA...]     (sense èpoques: de la 100 a la 16.000, cada 100)
// Escriu un fitxer per captura a la carpeta de treball (i se salta els que ja hi són), i en acabar, escaneig-1034.jsonl al costat.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { replicationTest } from '../../../replication.js';
import { makeRng } from '../../../../fase1/soup.js';

const SEED = 711000, WIDTH = 512, RADIUS = 2;
const name = (epoch) => `llavor1034-mon512x256-r2-epoca${epoch}.bin`;

function scan(dir, epoch) {
  const soup = new Uint8Array(readFileSync(join(dir, name(epoch)))), n = soup.length / 64, rng = makeRng(SEED + epoch, 'v2'), cells = [];
  for (let c = 0; c < n; c++) {
    const r = replicationTest(soup, c, rng, { width: WIDTH, radius: RADIUS, complete: true, heredity: true });
    if (r.solo || r.context) cells.push({ c, solo: r.solo, context: r.context, heritable: r.heritable, heritableSolo: r.heritableSolo, program: Buffer.from(soup.subarray(c * 64, (c + 1) * 64)).toString('hex') });
  }
  return { epoch, file: name(epoch), sha256: createHash('sha256').update(soup).digest('hex'), seed: SEED + epoch, cells: n, replicating: cells.length, heritable: cells.filter((x) => x.heritable).length, heritableSolo: cells.filter((x) => x.heritableSolo).length, list: cells };
}

if (!isMainThread) {
  parentPort.on('message', (epoch) => {
    const t = Date.now(), r = scan(workerData.dir, epoch);
    writeFileSync(join(workerData.work, `${epoch}.json`), JSON.stringify(r) + '\n');
    parentPort.postMessage({ epoch, seconds: (Date.now() - t) / 1000, replicating: r.replicating, heritable: r.heritable });
  });
} else {
  const [dir, work, threadsArg, ...rest] = process.argv.slice(2);
  if (!dir || !work || !threadsArg) { console.error('Ús: node escaneig-temps.mjs CARPETA-DEL-1034 CARPETA-DE-TREBALL FILS [EPOCA...]'); process.exit(2); }
  mkdirSync(work, { recursive: true });
  const all = rest.length ? rest.map(Number) : Array.from({ length: 160 }, (_, i) => 100 * (i + 1));
  const todo = all.filter((e) => !existsSync(join(work, `${e}.json`)));
  console.error(`${all.length} captures; ${all.length - todo.length} ja fetes; ${todo.length} per fer, amb ${threadsArg} fils`);
  let next = 0, running = 0;
  await new Promise((resolve, reject) => {
    if (!todo.length) return resolve();
    for (let f = 0; f < Math.min(Number(threadsArg), todo.length); f++) {
      const w = new Worker(fileURLToPath(import.meta.url), { workerData: { dir, work } });
      const give = () => { if (next < todo.length) w.postMessage(todo[next++]); else { w.terminate(); if (--running === 0) resolve(); } };
      running++;
      w.on('message', (m) => { console.error(`època ${m.epoch}: ${m.replicating} es repliquen, ${m.heritable} hereditàries (${m.seconds.toFixed(0)} s)`); give(); });
      w.on('error', reject);
      give();
    }
  });
  // el registre sencer, per ordre d'època, només si hi són totes les captures demanades i són les 160
  if (!rest.length && all.every((e) => existsSync(join(work, `${e}.json`)))) {
    writeFileSync(join(dirname(fileURLToPath(import.meta.url)), 'escaneig-1034.jsonl'), all.map((e) => readFileSync(join(work, `${e}.json`), 'utf8').trim()).join('\n') + '\n');
    console.error('escrit: escaneig-1034.jsonl');
  }
}
