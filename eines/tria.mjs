// Tria N elements a l'atzar d'una llista, amb una llavor declarada: sempre els mateixos per a la mateixa llavor
// i la mateixa llista, en l'ordre de la llista. Serveix per triar exemples sense escollir "els que es veuen
// bé" (proposta 9 de la revisió del repositori).
//
//   node eines/tria.mjs LLAVOR N element1 element2 ...
//
// Fa servir el generador v2 (fase1/soup.js) i una permutació de Fisher–Yates parcial.
import { fileURLToPath } from 'url';
import { makeRng } from '../fase1/soup.js';

export function pick(seed, n, items) {
  if (!(Number.isInteger(n) && n >= 0 && n <= items.length)) throw new Error(`N ha de ser entre 0 i ${items.length}`);
  const rng = makeRng(seed, 'v2');
  const idx = items.map((_, i) => i);
  for (let k = 0; k < n; k++) {
    const j = k + ((rng() * (idx.length - k)) | 0);
    [idx[k], idx[j]] = [idx[j], idx[k]];
  }
  return idx.slice(0, n).sort((a, b) => a - b).map((i) => items[i]);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [seed, n, ...items] = process.argv.slice(2);
  if (!/^\d+$/.test(seed ?? '') || !/^\d+$/.test(n ?? '')) {
    console.error('Ús: node eines/tria.mjs LLAVOR N element1 element2 ...');
    process.exit(2);
  }
  console.log(pick(Number(seed), Number(n), items).join(' '));
}
