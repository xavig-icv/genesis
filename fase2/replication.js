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
//
// Herència (AUD-33 de l'auditoria 2 i AU2-02 de l'auditoria externa 2): un programa que només copia
// un tros de les seves dades al company passa aquesta prova sense ser un replicador. Un replicador de
// debò deixa una còpia que també es copia. Amb `heredity`, cada vegada que A es replica, el company tal
// com ha quedat (el "fill") es posa a prova de la mateixa manera (sol, o en context amb un altre veí de
// A): si el seu company (el "nét") acaba portant alguna finestra de A, A és un replicador hereditari.
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

// Prova la cel·la c. Opcions: width (0 = sopa barrejada), radius (radi d'interacció del món),
// complete (si és false, para al primer èxit, com fa el registre de famílies per anar de pressa),
// heredity (fa també la prova de segona generació; sense, l'atzar que es consumeix és el de sempre) i
// evaluate (l'intèrpret d'una química de B1, de fase1/bff.js: la prova ha de fer servir la mateixa química
// que el món, AUD-65; per defecte, el de BFF).
// Retorna { solo, context, heritable, heritableSolo, heritableContext }: si s'ha replicat sol, si s'ha
// replicat en context i (només amb heredity) si alguna de les seves còpies també s'ha replicat:
// heritableSolo si l'herència s'ha demostrat sol, heritableContext si només s'ha demostrat en context
// (si ja s'ha demostrat sol, no es prova en context).
//
// Amb heredity, els intents de cada paper continuen fins que l'herència queda demostrada, dins del
// mateix pressupost d'intents: el primer fill pot ser una còpia parcial i el segon no (AU2-15 de
// l'auditoria externa 3).
//
// Limitació coneguda (AUD-42 de l'auditoria 3): en context, el company va primer i també executa codi.
// Envoltat de "lectors" (programes que copien el company dins seu), fins i tot un bloc de dades sense
// cap instrucció surt hereditari en context. Per això es distingeix heritableSolo de heritableContext, i
// el protocol estadístic té una anàlisi de sensibilitat només amb l'herència sola.
//
// Dues opcions de la prova d'autonomia de B1 (docs/pla-b1.md, §4), desactivades per defecte: sense, la prova és la de sempre, i
// gasta el mateix atzar.
//  - soloPartner: la funció que fa el company del paper sol (i el del fill, a la prova de l'herència sola), a partir de l'atzar de
//    la prova: soloPartner(rng) ha de tornar 64 bytes. Per defecte, bytes uniformes. En context, els companys són els de la sopa.
//  - bothRoles: prova l'herència en context encara que ja s'hagi demostrat sola. Llavors heritableContext vol dir "hereditari en
//    context", i no "només en context". solo, context, heritableSolo i heritable no canvien: el paper sol es prova igual, i el de
//    context, quan l'herència sola no s'ha demostrat, també. Amb bothRoles, la prova no para al primer èxit, encara que complete
//    sigui false.
export function replicationTest(soup, c, rng, { width = 0, radius = 2, complete = true, heredity = false, evaluate: interpret = evaluate, soloPartner = null, bothRoles = false } = {}) {
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
  const result = { solo: false, context: false, heritable: false, heritableSolo: false, heritableContext: false };
  if (!set.size) return result;
  const tape = new Uint8Array(TAPE_SIZE);
  // Executa la parella i retorna el company tal com ha quedat si porta alguna finestra de A (si no, null)
  const run = (first, second, partnerOffset) => {
    tape.set(first, 0);
    tape.set(second, PROGRAM_SIZE);
    interpret(tape, 0);
    const partner = tape.subarray(partnerOffset, partnerOffset + PROGRAM_SIZE);
    return hasWindow(partner, set) ? partner.slice() : null;
  };
  const noise = soloPartner === null ? () => Uint8Array.from({ length: PROGRAM_SIZE }, () => (rng() * 256) | 0) : () => {
    const P = soloPartner(rng);
    if (!(P instanceof Uint8Array) || P.length !== PROGRAM_SIZE) throw new Error(`soloPartner ha de tornar ${PROGRAM_SIZE} bytes`);
    return P;
  };
  const contextPartner = () => {
    for (let tries = 0; tries < 20; tries++) {
      const p = partnerCell();
      const P = soup.subarray(p * PROGRAM_SIZE, (p + 1) * PROGRAM_SIZE);
      if (!hasWindow(P, set)) return P.slice();
    }
    return null;
  };
  // Segona generació: el fill, en el mateix paper que A i amb els mateixos intents, ha de deixar alguna
  // finestra de A al seu company. (Amb menys intents, la prova perdria els replicadors que només es
  // copien de tant en tant, com el que necessita parella: un 18 % d'èxit per intent.)
  const heritable = (child, solo) => {
    for (let t = 0; t < (solo ? SOLO_TRIALS : CONTEXT_TRIALS); t++) {
      if (solo) { if (run(child, noise(), PROGRAM_SIZE)) return true; }
      else { const B = contextPartner(); if (B && run(B, child, 0)) return true; }
    }
    return false;
  };
  for (let t = 0; t < SOLO_TRIALS && (!result.solo || (heredity && !result.heritableSolo)); t++) {
    const child = run(A, noise(), PROGRAM_SIZE);
    if (child) {
      result.solo = true;
      if (heredity) result.heritableSolo = heritable(child, true);
    }
  }
  result.heritable = result.heritableSolo;
  if (result.solo && !complete && !bothRoles && (!heredity || result.heritable)) return result;
  const pending = () => heredity && (bothRoles || !result.heritableSolo) && !result.heritableContext;
  for (let t = 0; t < CONTEXT_TRIALS && (!result.context || pending()); t++) {
    const B = contextPartner();
    const child = B && run(B, A, 0);
    if (child) {
      result.context = true;
      if (pending()) result.heritableContext = heritable(child, false);
    }
  }
  result.heritable = result.heritableSolo || result.heritableContext;
  return result;
}

// Es replica, d'una manera o de l'altra?
export function replicates(soup, c, rng, options = {}) {
  const r = replicationTest(soup, c, rng, { ...options, complete: false });
  return r.solo || r.context;
}
