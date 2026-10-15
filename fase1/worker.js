// Treballador: rep un lot de cintes (parelles de programes), hi aplica
// les mutacions de fons, les executa i les retorna.
import { runPairs } from './bff.js';
import { makeRng, mutate } from './soup.js';

self.onmessage = (e) => {
  const { buffer, nPairs, seed, mutation, id, rng = 'v1' } = e.data;
  const pairs = new Uint8Array(buffer);
  const mutations = mutate(pairs, pairs.length, mutation, makeRng(seed, rng));
  const ops = runPairs(pairs, nPairs);
  self.postMessage({ buffer, ops, mutations, id }, [buffer]);
};
