// Intèrpret BFF, fidel a l'implementació de referència (cubff, variant bff_noheads)
// de l'article "Computational Life" (Agüera y Arcas et al., 2024).
//
// Una cinta són 128 bytes: dos programes de 64 bytes enganxats.
// El codi i les dades viuen a la mateixa cinta, així que un programa
// es pot reescriure a si mateix i també el seu veí.
//
//   <  head0 = head0 - 1          {  head1 = head1 - 1
//   >  head0 = head0 + 1          }  head1 = head1 + 1
//   -  tape[head0]--              .  tape[head1] = tape[head0]
//   +  tape[head0]++              ,  tape[head0] = tape[head1]
//   [  si tape[head0] == 0, salta endavant fins al ] corresponent
//   ]  si tape[head0] != 0, salta enrere fins al [ corresponent
//
// Qualsevol altre byte no fa res (són "dades"). El 0 és el valor que
// fa sortir dels bucles.

export const PROGRAM_SIZE = 64;
export const TAPE_SIZE = 128;
export const MAX_STEPS = 8192; // 2^13, com a l'article
const MASK = TAPE_SIZE - 1;

export const OPCODES = '<>{}-+.,[]';

// Tipus d'instrucció per a cada valor de byte (0 = no fa res).
const NOP = 0, LT = 1, GT = 2, LB = 3, RB = 4, DEC = 5, INC = 6, DOT = 7, COM = 8, LOOP = 9, END = 10;
export const KIND = new Uint8Array(256);
KIND[60] = LT;   // <
KIND[62] = GT;   // >
KIND[123] = LB;  // {
KIND[125] = RB;  // }
KIND[45] = DEC;  // -
KIND[43] = INC;  // +
KIND[46] = DOT;  // .
KIND[44] = COM;  // ,
KIND[91] = LOOP; // [
KIND[93] = END;  // ]

// Executa la cinta que comença a t[base] i retorna quantes instruccions
// reals (no buides) s'han executat. Modifica la cinta in situ.
//
// Els caps comencen a 0 i donen la volta a la cinta (mòdul 128).
// L'execució s'atura si el punter d'instruccions surt de la cinta,
// si un claudàtor no té parella o quan s'arriba a MAX_STEPS passos.
//
// Optimitzacions (el resultat és idèntic al de la versió de referència
// de test-bff.mjs):
//  1. Els bytes de dades no canvien res, i es recorren en un bucle curt.
//  2. Si arribem dues vegades seguides al mateix ] sense haver canviat
//     res entremig (ni la cinta ni els caps), l'estat és idèntic i el
//     bucle es repetirà fins al límit: avancem directament.
export function evaluate(t, base, maxSteps = MAX_STEPS) {
  let pc = 0, h0 = 0, h1 = 0, ops = 0, steps = 0;
  let lastEnd = -1, lastEndSteps = 0, lastEndOps = 0, dirty = true;
  while (steps < maxSteps) {
    const k = KIND[t[base + pc]];
    if (k === NOP) {
      // camí ràpid: avança fins a la propera instrucció
      do {
        steps++;
        if (++pc >= TAPE_SIZE) return ops;
      } while (steps < maxSteps && KIND[t[base + pc]] === NOP);
      continue;
    }
    ops++;
    if (k === LOOP) {
      if (t[base + h0] === 0) {
        let depth = 1;
        while (depth > 0) {
          if (++pc >= TAPE_SIZE) return ops;
          const q = KIND[t[base + pc]];
          if (q === LOOP) depth++;
          else if (q === END) depth--;
        }
      }
    } else if (k === END) {
      if (t[base + h0] !== 0) {
        if (pc === lastEnd && !dirty) {
          const period = steps - lastEndSteps;
          const periodOps = ops - lastEndOps;
          // -1: aquest mateix ] encara ha de comptar com a pas
          const cycles = Math.floor((maxSteps - steps - 1) / period);
          steps += cycles * period;
          ops += cycles * periodOps;
        }
        lastEnd = pc; lastEndSteps = steps; lastEndOps = ops; dirty = false;
        let depth = 1;
        while (depth > 0) {
          if (--pc < 0) return ops;
          const q = KIND[t[base + pc]];
          if (q === END) depth++;
          else if (q === LOOP) depth--;
        }
      }
    } else {
      dirty = true;
      if (k === DOT) t[base + h1] = t[base + h0];
      else if (k === COM) t[base + h0] = t[base + h1];
      else if (k === GT) h0 = (h0 + 1) & MASK;
      else if (k === LT) h0 = (h0 - 1) & MASK;
      else if (k === RB) h1 = (h1 + 1) & MASK;
      else if (k === LB) h1 = (h1 - 1) & MASK;
      else if (k === INC) t[base + h0]++;
      else t[base + h0]--; // DEC. Uint8Array: 0 - 1 -> 255
    }
    steps++;
    if (++pc >= TAPE_SIZE) return ops;
  }
  return ops;
}

// Executa nPairs cintes consecutives d'un buffer i retorna el total d'operacions.
export function runPairs(buf, nPairs, maxSteps = MAX_STEPS) {
  let ops = 0;
  for (let i = 0; i < nPairs; i++) ops += evaluate(buf, i * TAPE_SIZE, maxSteps);
  return ops;
}
