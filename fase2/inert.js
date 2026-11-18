// Els companys inerts, per al pilot de l'aparició i l'arrelament (docs/pla-aparicio-arrelament.md): la prova d'un programa amb
// companys sense cap instrucció, i el cens inert de sim.mjs (--inert-census).
//
// La prova és la de la prova d'autonomia de B1 (eines/autonomia.mjs; docs/pla-b1.md, §4): el programa i 8 companys inerts, amb la
// prova de replicació del cens (fase2/replication.js) amb `soloPartner` inert i `bothRoles`. Aquestes funcions en són còpies, perquè el
// simulador no depengui d'una eina de B1 (que, a més, posa el seu receptor de feines dins dels fils). test/arrelament.mjs comprova que
// fan el mateix. Aquest mòdul no fa servir Buffer: el codi de fase2/ també es pot servir al navegador.
//
// «Es copia» i «hereditari» són dues xifres (AUD-186): es copia si el company acaba portant 16 bytes seguits del programa; n'és
// hereditari si la còpia també es copia.
import { PROGRAM_SIZE, OPCODES, evaluate } from '../fase1/bff.js';
import { makeRng } from '../fase1/soup.js';
import { replicationTest } from './replication.js';

export const PARTNERS = 8;
export const INERT_CONDITIONS_SEED = 3000000000; // les condicions del pas 2b de la maduració
export const INERT_CONDITIONS = 3;               // les 3 primeres, al cens inert i al llinatge
export const INERT_CENSUS_SEED = 20261116;       // l'atzar propi del cens inert, independent del món i del cens v3
const INSTRUCTIONS = new Set([...OPCODES].map((c) => c.charCodeAt(0)));
export const INERT = Object.freeze(Array.from({ length: 256 }, (_, b) => b).filter((b) => !INSTRUCTIONS.has(b)));

// Un company inert, amb l'atzar que es doni
export const inertProgram = (rng) => Uint8Array.from({ length: PROGRAM_SIZE }, () => INERT[(rng() * INERT.length) | 0]);

// Les condicions: { partners, testSeed } per a cada j
export function conditions(seed, count) {
  return Array.from({ length: count }, (_, j) => {
    const rng = makeRng((seed + 2 * j) >>> 0, 'v2');
    return { partners: Array.from({ length: PARTNERS }, () => inertProgram(rng)), testSeed: (seed + 2 * j + 1) >>> 0 };
  });
}

// La prova d'un programa en una condició
export function testCondition(bytes, cond, interpret = evaluate) {
  const soup = new Uint8Array(PROGRAM_SIZE * (1 + PARTNERS));
  soup.set(bytes, 0);
  cond.partners.forEach((p, i) => soup.set(p, PROGRAM_SIZE * (1 + i)));
  return replicationTest(soup, 0, makeRng(cond.testSeed, 'v2'), {
    heredity: true, complete: true, evaluate: interpret, soloPartner: inertProgram, bothRoles: true,
  });
}

// En unes condicions: les quatre cadenes, '1' o '0' a la posició j segons la condició j
export function testInert(bytes, conds, interpret = evaluate) {
  const out = { solo: '', context: '', heritableSolo: '', heritableContext: '' };
  for (const cond of conds) {
    const r = testCondition(bytes, cond, interpret);
    for (const k of Object.keys(out)) out[k] += r[k] ? '1' : '0';
  }
  return out;
}
export const copies = (s) => s.solo.includes('1') || s.context.includes('1');
export const heritable = (s) => s.heritableSolo.includes('1') || s.heritableContext.includes('1');
export const toHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
export function fromHex(hex) {
  if (!/^([0-9a-f]{2})+$/.test(hex)) throw new Error('un programa en hexadecimal ha de tenir parells de xifres de 0 a f');
  return Uint8Array.from(hex.match(/../g), (h) => parseInt(h, 16));
}

// El cens inert: a cada crida, `sample` cel·les diferents a l'atzar (amb el seu atzar, com la mostra del cens v3), provades amb
// companys inerts en les condicions. El registre porta les que es copien en alguna condició, amb el programa i les cadenes. No toca el
// món ni l'atzar del món.
export function createInertCensus({ sample, seed = INERT_CENSUS_SEED, count = INERT_CONDITIONS, conditionsSeed = INERT_CONDITIONS_SEED, interpret = evaluate }) {
  const rng = makeRng(seed, 'v2');
  const conds = conditions(conditionsSeed, count);
  let indices = null;
  function run(soup, n, epoch) {
    const size = Math.min(sample, n);
    if (indices?.length !== n) indices = Uint32Array.from({ length: n }, (_, i) => i);
    for (let k = 0; k < size; k++) {
      const j = k + ((rng() * (n - k)) | 0);
      [indices[k], indices[j]] = [indices[j], indices[k]];
    }
    const cells = [];
    let copying = 0, heritables = 0;
    for (let k = 0; k < size; k++) {
      const c = indices[k];
      const bytes = soup.slice(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE);
      const s = testInert(bytes, conds, interpret);
      if (!copies(s)) continue;
      copying++;
      if (heritable(s)) heritables++;
      cells.push({ cell: c, program: toHex(bytes), ...s });
    }
    return { type: 'inert', epoch, sample: size, copying, heritable: heritables, cells };
  }
  return { run, description: { sample, seed, conditions: { seed: conditionsSeed, count } } };
}
