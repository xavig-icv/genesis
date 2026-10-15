// La prova de replicació, en un sol lloc (AUD-02 de l'auditoria 1).
//
// Abans n'hi havia dues versions: la del registre de famílies i la de fase2/analitza.mjs, que no
// filtrava les finestres monòtones i comptava com a replicador un programa que només escriu zeros
// al company (48 % en un món de prova, contra un 0 % de la prova bona). Ara totes les eines fan
// servir aquest mòdul.
//
// Un programa A es replica si, després de trobar-se amb un company, el company acaba portant 16
// bytes seguits de A (o del seu mirall, perquè els replicadors que hem vist es copien al revés),
// i aquests 16 bytes tenen almenys 6 valors diferents: un tros monòton (zeros, <<<<) es pot
// "copiar" per accident i no demostra res. Es prova de dues maneres:
//  - sol: A va primer, amb un company de bytes a l'atzar (2 intents);
//  - en context: A va segon, amb un company del món que encara no porta cap tros seu. Si es
//    coneix l'amplada del món, el company és un veí dins del radi d'interacció (amb qui A es
//    troba de debò); si no (sopa barrejada), una cel·la qualsevol (4 intents).
import { PROGRAM_SIZE, TAPE_SIZE, evaluate } from '../fase1/bff.js';

export const WINDOW = 16;
export const MIN_DISTINCT = 6;
const SOLO_TRIALS = 2;
const CONTEXT_TRIALS = 4;

// Finestres de 16 bytes del programa i del seu mirall, prou variades per no coincidir per atzar.
export function windowsOf(A) {
  const set = new Set();
  for (const b of [A, A.slice().reverse()]) {
    for (let i = 0; i + WINDOW <= PROGRAM_SIZE; i++) {
      const w = b.subarray(i, i + WINDOW);
      if (new Set(w).size >= MIN_DISTINCT) set.add(String.fromCharCode(...w));
    }
  }
  return set;
}

export function hasWindow(P, set) {
  for (let i = 0; i + WINDOW <= PROGRAM_SIZE; i++) if (set.has(String.fromCharCode(...P.subarray(i, i + WINDOW)))) return true;
  return false;
}

// Prova la cel·la c. Opcions: width (0 = sopa barrejada), radius (radi d'interacció del món) i
// complete (si és false, para al primer èxit, com fa el registre de famílies per anar de pressa).
// Retorna { solo, context }: si s'ha replicat sol i si s'ha replicat en context.
export function replicationTest(soup, c, rng, { width = 0, radius = 2, complete = true } = {}) {
  const n = soup.length / PROGRAM_SIZE;
  const height = width ? n / width : 0;
  const side = 2 * radius + 1;
  const partnerCell = () => {
    if (!width) return (rng() * n) | 0;
    const x = c % width, y = (c / width) | 0;
    let nx, ny;
    do {
      nx = x + ((rng() * side) | 0) - radius;
      ny = y + ((rng() * side) | 0) - radius;
    } while ((nx === x && ny === y) || nx < 0 || ny < 0 || nx >= width || ny >= height);
    return ny * width + nx;
  };
  const A = soup.slice(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE);
  const set = windowsOf(A);
  const result = { solo: false, context: false };
  if (!set.size) return result;
  const tape = new Uint8Array(TAPE_SIZE);
  const run = (first, second, partnerOffset) => {
    tape.set(first, 0);
    tape.set(second, PROGRAM_SIZE);
    evaluate(tape, 0);
    return hasWindow(tape.subarray(partnerOffset, partnerOffset + PROGRAM_SIZE), set);
  };
  for (let t = 0; t < SOLO_TRIALS && !result.solo; t++) {
    const B = Uint8Array.from({ length: PROGRAM_SIZE }, () => (rng() * 256) | 0);
    if (run(A, B, PROGRAM_SIZE)) result.solo = true;
  }
  if (result.solo && !complete) return result;
  for (let t = 0; t < CONTEXT_TRIALS && !result.context; t++) {
    let B = null;
    for (let tries = 0; tries < 20 && !B; tries++) {
      const p = partnerCell();
      const P = soup.subarray(p * PROGRAM_SIZE, (p + 1) * PROGRAM_SIZE);
      if (!hasWindow(P, set)) B = P.slice();
    }
    if (B && run(B, A, 0)) result.context = true;
  }
  return result;
}

// Es replica, d'una manera o de l'altra?
export function replicates(soup, c, rng, options = {}) {
  const r = replicationTest(soup, c, rng, { ...options, complete: false });
  return r.solo || r.context;
}
