// El llinatge d'un programa plantat: l'assaig d'invasió del pilot de l'aparició i l'arrelament (docs/pla-aparicio-arrelament.md, §4.5),
// l'única excepció a la regla de no plantar res (§2). sim.mjs el fa servir amb --plant i --lineage-every; i, sense plantar res, amb
// --track, el control de les col·lisions al bessó natural (el mateix seguiment, amb les finestres d'uns programes que no s'hi han plantat).
//
// A cada punt (cada N èpoques):
//  1. les cel·les del llinatge: les que porten alguna finestra del llinatge (M). Una finestra és un tros de 16 bytes seguits amb almenys
//     6 valors diferents, del programa o del seu mirall: la de la prova de replicació (fase2/replication.js, windowsOf i hasWindow);
//  2. com a molt `sample` d'aquestes (256), triades amb l'atzar del llinatge, provades amb companys inerts en 3 condicions
//     (fase2/inert.js). Si M ≤ 256, totes. Si cap de les 256 no és hereditària, es proven totes les M (AUD-192 = AU2-157): F = 0 és,
//     doncs, sempre exacte;
//  3. F, les funcionals estimades: M × la fracció de les provades que són hereditàries en alguna condició;
//  4. les finestres de les funcionals provades s'afegeixen a les del llinatge, per seguir-lo encara que les mutacions en canviïn els bytes.
// S'extingeix quan F = 0 en dos punts seguits: l'època de l'extinció és la del primer. No toca el món ni l'atzar del món.
//
// Què mesura: l'expansió del conjunt de cel·les que porten alguna finestra del llinatge i es copien, no una descendència provada
// (AU2-156). El control de les col·lisions és el bessó natural amb --track.
import { PROGRAM_SIZE, evaluate } from '../fase1/bff.js';
import { makeRng } from '../fase1/soup.js';
import { WINDOW, MIN_DISTINCT } from './replication.js';
import { conditions, testInert, copies, heritable, INERT_CONDITIONS, INERT_CONDITIONS_SEED } from './inert.js';

export const LINEAGE_SAMPLE = 256;

// Les finestres d'un llinatge, amb la mateixa regla que windowsOf i hasWindow (fase2/replication.js). Per anar de pressa, s'indexen pels
// quatre primers bytes; test/arrelament.mjs comprova que fa el mateix que la prova de replicació.
export class Windows {
  constructor() { this.set = new Set(); this.index = new Map(); }
  get size() { return this.set.size; }
  addProgram(P) {
    for (const b of [P, P.slice().reverse()]) {
      for (let i = 0; i + WINDOW <= PROGRAM_SIZE; i++) {
        const w = b.subarray(i, i + WINDOW);
        if (new Set(w).size < MIN_DISTINCT) continue;
        const key = String.fromCharCode(...w);
        if (this.set.has(key)) continue;
        this.set.add(key);
        const k4 = ((w[0] << 24) | (w[1] << 16) | (w[2] << 8) | w[3]) >>> 0;
        const list = this.index.get(k4);
        if (list) list.push(key); else this.index.set(k4, [key]);
      }
    }
  }
  has(P) {
    for (let i = 0; i + WINDOW <= PROGRAM_SIZE; i++) {
      const k4 = ((P[i] << 24) | (P[i + 1] << 16) | (P[i + 2] << 8) | P[i + 3]) >>> 0;
      const list = this.index.get(k4);
      if (list && list.includes(String.fromCharCode(...P.subarray(i, i + WINDOW)))) return true;
    }
    return false;
  }
}

// Les cel·les d'un món que porten alguna finestra d'uns programes (per exemple, abans de plantar-los: AU2-156)
export function carriers(soup, n, programs) {
  const w = new Windows();
  for (const p of programs) w.addProgram(p);
  let k = 0;
  for (let c = 0; c < n; c++) if (w.has(soup.subarray(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE))) k++;
  return k;
}

// `program`: un programa (Uint8Array) o una llista de programes (el seguiment d'uns quants alhora, com el del bessó)
export function createLineage({ program, seed, sample = LINEAGE_SAMPLE, count = INERT_CONDITIONS, conditionsSeed = INERT_CONDITIONS_SEED, interpret = evaluate }) {
  const programs = Array.isArray(program) ? program : [program];
  if (!programs.length || programs.some((p) => !(p instanceof Uint8Array) || p.length !== PROGRAM_SIZE)) throw new Error(`cada programa del llinatge ha de tenir ${PROGRAM_SIZE} bytes`);
  const windows = new Windows();
  for (const p of programs) windows.addProgram(p);
  const rng = makeRng(seed, 'v2');
  const conds = conditions(conditionsSeed, count);
  let lastZero = null, extinctAt = null;
  function step(soup, n, epoch) {
    const members = [];
    for (let c = 0; c < n; c++) if (windows.has(soup.subarray(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE))) members.push(c);
    const M = members.length;
    let size = Math.min(sample, M);
    if (M > sample) {
      for (let k = 0; k < size; k++) {
        const j = k + ((rng() * (M - k)) | 0);
        [members[k], members[j]] = [members[j], members[k]];
      }
    }
    let copying = 0, functional = 0, exhaustive = false;
    const fresh = [];
    const test = (from, to) => {
      for (let k = from; k < to; k++) {
        const c = members[k];
        const P = soup.slice(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE);
        const s = testInert(P, conds, interpret);
        if (copies(s)) copying++;
        if (heritable(s)) { functional++; fresh.push(P); }
      }
    };
    test(0, size);
    // cap de la mostra no és hereditària: es proven totes, perquè F = 0 sigui exacte i l'extinció no surti d'una mostra (AUD-192)
    if (M > sample && functional === 0) { test(size, M); size = M; exhaustive = true; }
    for (const P of fresh) windows.addProgram(P);
    const F = size ? Math.round((M * functional) / size) : 0;
    if (F === 0) {
      if (lastZero === null) lastZero = epoch;
      else if (extinctAt === null) extinctAt = lastZero;
    } else lastZero = null;
    return { type: 'lineage', epoch, M, tested: size, copying, functional, F, windows: windows.size, ...(exhaustive ? { exhaustive: true } : {}) };
  }
  return {
    step,
    // si un programa porta alguna finestra del llinatge (les de l'últim punt)
    has: (P) => windows.has(P),
    get extinctAt() { return extinctAt; },
    description: { seed, sample, conditions: { seed: conditionsSeed, count } },
  };
}
