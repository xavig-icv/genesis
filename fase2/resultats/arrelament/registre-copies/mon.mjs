// The record of heritable copies, the small version (exploratory; the note, README.md): the world's epoch, as sim.mjs does it in a quiet
// 2D world (worldEpoch: no currents and no flow), with the same modules and the same order of random numbers, and with the tracers of the
// open windows. The simulator is not touched; prova.mjs checks it against sim.mjs, and registre.mjs against every pilot record it uses.
import { TAPE_SIZE, runPairs } from '../../../../fase1/bff.js';
import { makeRng, shuffle, gather, scatter } from '../../../../fase1/soup.js';
import { pairNeighbors } from '../../../world.js';
import { evaluateEvents, mutateListed, writes } from './traca.mjs';

export function createWorld({ soup, width, height, radius, mutation, seed }) {
  const n = width * height;
  const rng = makeRng(seed, 'v2');
  const order = new Uint32Array(n).map((_, i) => i);
  const taken = new Uint8Array(n), pairIdx = new Uint32Array(n), pairs = new Uint8Array((n / 2) * TAPE_SIZE);
  const ev = new Int32Array(2 * 8192 + 2), mutList = [];
  // one epoch; `observers`: those with a window open (each with its tracers)
  function step(observers = []) {
    shuffle(order, rng);
    const nPairs = pairNeighbors(order, taken, pairIdx, width, height, radius, rng);
    mutList.length = 0;
    mutateListed(soup, soup.length, mutation, rng, mutList);
    gather(soup, pairIdx, pairs, 0, nPairs);
    const T = observers.flatMap((o) => o.tracers);
    if (!T.length) {
      const ops = runPairs(pairs, nPairs);
      scatter(soup, pairIdx, pairs, 0, nPairs);
      return { ops, runs: nPairs };
    }
    for (const t of T) t.mutated(mutList);
    for (const o of observers) { for (const i of mutList) o.dirty[i >> 6] = 1; o.update(soup); }
    for (const t of T) t.gather(pairIdx, nPairs);
    let ops = 0;
    for (let i = 0; i < nPairs; i++) {
      ops += evaluateEvents(pairs, i * TAPE_SIZE, ev);
      const w = writes.n;
      if (!w) continue;
      for (const t of T) t.apply(i * TAPE_SIZE, ev, w);
      for (const o of observers) { o.dirty[pairIdx[2 * i]] = 1; o.dirty[pairIdx[2 * i + 1]] = 1; }
    }
    scatter(soup, pairIdx, pairs, 0, nPairs);
    for (const t of T) t.scatter(pairIdx, nPairs);
    return { ops, runs: nPairs };
  }
  return { n, soup, step };
}
