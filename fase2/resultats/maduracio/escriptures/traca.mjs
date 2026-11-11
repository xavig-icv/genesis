// Exploratori (la maduració, pas 2a): una còpia de `evaluate` de fase1/bff.js (BFF tal com és, C0) que avisa de cada escriptura. El
// simulador no es toca. prova-traca.mjs comprova, abans de fer-la servir, que la cinta final i les operacions siguin les de fase1/bff.js,
// i que les escriptures que avisa refacin la cinta final.
import { KIND, TAPE_SIZE, MAX_STEPS } from '../../../../fase1/bff.js';

const MASK = TAPE_SIZE - 1;
const NOP = 0, LT = 1, GT = 2, LB = 3, RB = 4, DEC = 5, INC = 6, DOT = 7, COM = 8, LOOP = 9, END = 10;

// onWrite(op, pos, before, after, src, pc): op, '.', ',', '+' o '-'; pos, la posició escrita (0-127); src, la posició d'on es copia
// (-1 per a '+' i '-'); pc, la posició de la instrucció que escriu.
export function evaluateTraced(t, base, onWrite, maxSteps = MAX_STEPS) {
  let pc = 0, h0 = 0, h1 = 0, ops = 0, steps = 0;
  let lastEnd = -1, lastEndSteps = 0, lastEndOps = 0, dirty = true;
  while (steps < maxSteps) {
    const k = KIND[t[base + pc]];
    if (k === NOP) {
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
      if (k === DOT) { const b = t[base + h1]; t[base + h1] = t[base + h0]; onWrite('.', h1, b, t[base + h1], h0, pc); }
      else if (k === COM) { const b = t[base + h0]; t[base + h0] = t[base + h1]; onWrite(',', h0, b, t[base + h0], h1, pc); }
      else if (k === GT) h0 = (h0 + 1) & MASK;
      else if (k === LT) h0 = (h0 - 1) & MASK;
      else if (k === RB) h1 = (h1 + 1) & MASK;
      else if (k === LB) h1 = (h1 - 1) & MASK;
      else if (k === INC) { const b = t[base + h0]; t[base + h0]++; onWrite('+', h0, b, t[base + h0], -1, pc); }
      else { const b = t[base + h0]; t[base + h0]--; onWrite('-', h0, b, t[base + h0], -1, pc); }
    }
    steps++;
    if (++pc >= TAPE_SIZE) return ops;
  }
  return ops;
}

// Una parella de veïns de debò, com al món: una cel·la a l'atzar i un veí a l'atzar dins del radi (sense ella mateixa ni fora del món)
export function neighbourPair(rng, width, height, radius = 2) {
  const c = (rng() * width * height) | 0, x = c % width, y = (c / width) | 0, side = 2 * radius + 1;
  let nx, ny;
  do {
    nx = x + ((rng() * side) | 0) - radius;
    ny = y + ((rng() * side) | 0) - radius;
  } while ((nx === x && ny === y) || nx < 0 || ny < 0 || nx >= width || ny >= height);
  return [c, ny * width + nx];
}
