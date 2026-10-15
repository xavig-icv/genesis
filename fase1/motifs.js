// Cerca dels fragments de codi més repetits a la sopa.
//
// Un replicador no fa còpies exactes del programa sencer de 64 bytes: copia
// un tros de si mateix dins del company. Per això busquem fragments
// (finestres de LEN bytes) que apareixen en molts programes diferents.
//
// Comparem l'"esquelet" del codi: les instruccions i els zeros tal qual,
// i qualsevol altre byte de dades com a equivalent (valor DATA). Així dues
// còpies que només difereixen en dades compten com el mateix fragment.
import { KIND, PROGRAM_SIZE } from './bff.js';

export const DATA = 1;
export const skeleton = (v) => (KIND[v] || v === 0 ? v : DATA);

const LEN = 12;            // mida del fragment
const MIN_OPS = 5;         // instruccions mínimes perquè un fragment sigui "codi"
const SAMPLE = 8192;       // programes analitzats (mostra regular de la sopa)
const OVERLAP = 8;         // dos fragments que comparteixen 8 bytes seguits són variants del mateix

export function topMotifs(soup, nPrograms, limit = 5) {
  const stride = Math.max(1, Math.floor(nPrograms / SAMPLE));
  const counts = new Map();
  let sampled = 0;
  for (let p = 0; p < nPrograms; p += stride) {
    sampled++;
    const base = p * PROGRAM_SIZE;
    const seen = new Set(); // cada fragment compta un cop per programa
    for (let i = 0; i + LEN <= PROGRAM_SIZE; i++) {
      // el fragment ha de començar i acabar amb una instrucció
      if (!KIND[soup[base + i]] || !KIND[soup[base + i + LEN - 1]]) continue;
      let ops = 0;
      for (let j = 0; j < LEN; j++) if (KIND[soup[base + i + j]]) ops++;
      if (ops < MIN_OPS) continue;
      let key = '';
      for (let j = 0; j < LEN; j++) key += String.fromCharCode(skeleton(soup[base + i + j]));
      if (seen.has(key)) continue;
      seen.add(key);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const candidates = [...counts.entries()].filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]).slice(0, 300);
  const chosen = [];
  for (const [key, count] of candidates) {
    let variant = false;
    for (const c of chosen) {
      for (let k = 0; k + OVERLAP <= LEN && !variant; k++) if (c.key.includes(key.slice(k, k + OVERLAP))) variant = true;
      if (variant) break;
    }
    if (variant) continue;
    chosen.push({ key, count });
    if (chosen.length >= limit) break;
  }
  return chosen.map(({ key, count }) => ({
    bytes: Uint8Array.from(key, (ch) => ch.charCodeAt(0)),
    share: count / sampled, // fracció de programes que el contenen
  }));
}
