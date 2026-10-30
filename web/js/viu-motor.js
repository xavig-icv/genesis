// El motor del món en viu (web/viu/): el món 2D de les sèries, en el navegador, amb el mateix ordre de passos que
// worldEpoch() a sim.mjs (corrents, riu, barrejar l'ordre, aparellar veïns, mutar tot el mapa i executar). Tot l'atzar és
// aquí, i qui executa les cintes (aquí mateix o els treballadors de fase1/worker.js) només executa: el nombre de fils no
// canvia la història. Amb la mateixa llavor, surt el mateix món que amb
//   node sim.mjs --world AMPLADAxALÇADA --seed LLAVOR --mixing M --epochs E --after 99999
// (test/web.mjs ho comprova amb l'empremta final i els censos).
import { TAPE_SIZE, PROGRAM_SIZE, runPairs } from '../../fase1/bff.js';
import { makeRng, randomSoup, shuffle, gather, scatter, mutate, DEFAULT_MUTATION } from '../../fase1/soup.js';
import { pairNeighbors, applyCurrents, applyFlow, DEFAULT_RADIUS } from '../../fase2/world.js';

export const RADIUS = DEFAULT_RADIUS;
export const CENSUS_EVERY = 250; // el cens de sim.mjs (--census, per defecte)
export const FRAME_EVERY = 50;   // el registre de famílies, cada 50 èpoques com a les dades de l'explorador

export function createWorld({ seed, width, height, mixing = 0 }) {
  const n = width * height, rng = makeRng(seed, 'v2');
  return {
    seed, width, height, mixing, n, rng, epoch: 0,
    soup: randomSoup(n, rng),
    order: Uint32Array.from({ length: n }, (_, i) => i),
    taken: new Uint8Array(n),
    pairIdx: new Uint32Array(n),
    scratch: mixing > 0 ? new Uint32Array(n * (PROGRAM_SIZE / 4)) : null,
    pool: mixing > 0 ? new Uint32Array(n) : null,
    flowState: { carry: 0 },
  };
}

// Una època. run(w, nPairs) executa les nPairs cintes de les parelles de w.pairIdx i deixa la sopa com a sim.mjs
export async function step(w, run = runHere) {
  applyCurrents(w.soup, w.width, w.height, w.mixing, 0, w.rng, w.scratch, w.pool);
  applyFlow(w.soup, w.width, w.height, 0, 0, w.rng, w.flowState);
  shuffle(w.order, w.rng);
  const nPairs = pairNeighbors(w.order, w.taken, w.pairIdx, w.width, w.height, RADIUS, w.rng);
  mutate(w.soup, w.soup.length, DEFAULT_MUTATION, w.rng);
  await run(w, nPairs);
  w.epoch++;
  return nPairs;
}

// Les cintes, aquí mateix (Node i les proves)
export function runHere(w, nPairs) {
  const pairs = new Uint8Array(nPairs * TAPE_SIZE);
  gather(w.soup, w.pairIdx, pairs, 0, nPairs);
  runPairs(pairs, nPairs);
  scatter(w.soup, w.pairIdx, pairs, 0, nPairs);
}

// Les cintes, repartides entre treballadors (fase1/worker.js): cadascun n'executa un tros seguit
export function runInWorkers(workers) {
  const buffers = [];
  const call = (wk, msg) => new Promise((resolve, reject) => {
    wk.onmessage = (e) => resolve(e.data);
    wk.onerror = reject;
    wk.postMessage(msg, [msg.buffer]);
  });
  return async (w, nPairs) => {
    const per = Math.ceil(nPairs / workers.length), jobs = [];
    for (let i = 0; i < workers.length; i++) {
      const first = i * per, count = Math.min(per, nPairs - first);
      if (count <= 0) break;
      let buffer = buffers[i];
      if (!buffer || buffer.byteLength < count * TAPE_SIZE) buffer = new ArrayBuffer(per * TAPE_SIZE);
      gather(w.soup, w.pairIdx, new Uint8Array(buffer), first, count);
      jobs.push(call(workers[i], { buffer, nPairs: count, seed: 0, mutation: 0 }).then((r) => {
        buffers[i] = r.buffer;
        scatter(w.soup, w.pairIdx, new Uint8Array(r.buffer), first, count);
      }));
    }
    await Promise.all(jobs);
  };
}

// L'empremta del món (FNV-1a), com la que escriu sim.mjs al final
export function fingerprint(soup) {
  let h = 0x811c9dc5;
  for (let i = 0; i < soup.length; i++) h = Math.imul(h ^ soup[i], 0x01000193);
  return (h >>> 0).toString(16);
}

// L'ordre de sim.mjs que fa la mateixa història fins a l'època E
export const command = ({ seed, width, height, mixing }, epochs) =>
  `node sim.mjs --world ${width}x${height} --seed ${seed} --mixing ${mixing} --epochs ${epochs} --after 99999`;
