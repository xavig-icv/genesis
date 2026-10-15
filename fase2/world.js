// Llei 1 · Espai. El món és un mapa de cel·les; cada cel·la conté un programa
// i només pot interactuar amb els veïns que té a prop.
//
// Igual que la versió 2D de l'article (cubff, make_2d_pattern.py): veïns dins
// d'un quadrat de 5×5 (radi 2) i vores dures, sense donar la volta.
//
// A cada època es recorren les cel·les en un ordre aleatori. Cada cel·la lliure
// tria un veí a l'atzar; si el veí també és lliure, formen parella. Si no, la
// cel·la es queda sense parella aquesta època (però les mutacions la toquen igual).

import { PROGRAM_SIZE } from '../fase1/bff.js';

export const DEFAULT_WIDTH = 512;
export const DEFAULT_HEIGHT = 256;
export const DEFAULT_RADIUS = 2;
const WORDS = PROGRAM_SIZE / 4;

// Omple `pairs` amb parelles [p, q, p, q, ...] i retorna quantes n'hi ha.
// `order` ha d'estar barrejat; `taken` és un Uint8Array de treball de mida width*height.
export function pairNeighbors(order, taken, pairs, width, height, radius, rng) {
  taken.fill(0);
  const side = 2 * radius + 1;
  let nPairs = 0;
  for (let k = 0; k < order.length; k++) {
    const p = order[k];
    if (taken[p]) continue;
    const x = p % width, y = (p / width) | 0;
    // veí a l'atzar dins del quadrat, que no sigui la mateixa cel·la ni caigui fora del mapa
    let nx, ny;
    do {
      nx = x + ((rng() * side) | 0) - radius;
      ny = y + ((rng() * side) | 0) - radius;
    } while ((nx === x && ny === y) || nx < 0 || ny < 0 || nx >= width || ny >= height);
    const q = ny * width + nx;
    if (taken[q]) continue;
    taken[p] = taken[q] = 1;
    pairs[2 * nPairs] = p;
    pairs[2 * nPairs + 1] = q;
    nPairs++;
  }
  return nPairs;
}

// Llei 2 · Corrents. Mouen els programes pel mapa abans de cada època.
//
//  - Barreja (mixing): el corrent arrossega una fracció `mixing` de les cel·les i les
//    deixa en llocs a l'atzar d'entre les mateixes cel·les arrossegades. Amb 0, és el
//    món 2D quiet; amb 1, tot es barreja cada època i el món és com la sopa de la Fase 1.
//  - Difusió (diffusion): `diffusion × cel·les` intercanvis d'una cel·la amb un veí
//    del costat (els 8 del voltant), com una remenada suau.
//
// Amb tots dos a 0 no es fa servir l'atzar, i les històries de la llei 1 sola no canvien.
// `scratch` ha de ser un Uint32Array de mida width*height*16 (o més), i `pool` un
// Uint32Array de mida width*height.
export function applyCurrents(soup, width, height, mixing, diffusion, rng, scratch, pool) {
  const n = width * height;
  const s = new Uint32Array(soup.buffer, soup.byteOffset, soup.length >> 2);
  let moved = 0;

  if (mixing > 0) {
    // Quines cel·les arrossega el corrent (salts geomètrics, com les mutacions)
    let k = 0;
    if (mixing >= 1) { for (let c = 0; c < n; c++) pool[k++] = c; }
    else {
      const logq = Math.log(1 - mixing);
      for (let c = Math.floor(Math.log(1 - rng()) / logq); c < n; c += 1 + Math.floor(Math.log(1 - rng()) / logq)) pool[k++] = c;
    }
    // Es copien a part i es tornen a deixar en un ordre barrejat (Fisher-Yates)
    for (let i = 0; i < k; i++) for (let w = 0; w < WORDS; w++) scratch[i * WORDS + w] = s[pool[i] * WORDS + w];
    for (let i = k - 1; i > 0; i--) {
      const j = (rng() * (i + 1)) | 0;
      const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    for (let i = 0; i < k; i++) for (let w = 0; w < WORDS; w++) s[pool[i] * WORDS + w] = scratch[i * WORDS + w];
    moved += k;
  }

  if (diffusion > 0) {
    const swaps = Math.round(diffusion * n);
    for (let k = 0; k < swaps; k++) {
      const p = (rng() * n) | 0;
      const x = p % width, y = (p / width) | 0;
      let nx, ny;
      do {
        nx = x + ((rng() * 3) | 0) - 1;
        ny = y + ((rng() * 3) | 0) - 1;
      } while ((nx === x && ny === y) || nx < 0 || ny < 0 || nx >= width || ny >= height);
      const q = ny * width + nx;
      for (let w = 0; w < WORDS; w++) {
        const t = s[p * WORDS + w]; s[p * WORDS + w] = s[q * WORDS + w]; s[q * WORDS + w] = t;
      }
    }
    moved += 2 * swaps;
  }
  return moved;
}

// Llei 3 · Flux. El món és un sistema obert: entra material nou i en surt de vell.
//
//  - Riu (flow): columnes per època que el corrent desplaça cap a la dreta. Quan el
//    desplaçament acumulat arriba a una columna, tot el mapa es mou una columna: la
//    de l'extrem dret surt del món i per l'esquerra entra una columna de programes
//    nous (bytes a l'atzar, com la sopa del principi). Un programa hi passa
//    width / flow èpoques. Aigües amunt, material jove; aigües avall, material vell.
//  - Renovació (renewal): cada època, una fracció de cel·les qualssevol se substitueix
//    per material nou, sense cap direcció (com la pluja, o un quimiòstat).
//
// `state` guarda el desplaçament acumulat entre èpoques ({ carry: 0 } al principi).
// Amb tots dos a 0 no es fa servir l'atzar. Retorna quantes columnes s'han desplaçat.
export function applyFlow(soup, width, height, flow, renewal, rng, state) {
  let shifts = 0;
  if (flow > 0) {
    state.carry += flow;
    const rowBytes = width * PROGRAM_SIZE;
    while (state.carry >= 1 - 1e-9) { // (0,1 sumat deu vegades fa 0,9999999999999999)
      state.carry -= 1;
      shifts++;
      for (let y = 0; y < height; y++) {
        const row = y * rowBytes;
        soup.copyWithin(row + PROGRAM_SIZE, row, row + rowBytes - PROGRAM_SIZE);
        for (let i = 0; i < PROGRAM_SIZE; i++) soup[row + i] = (rng() * 256) | 0;
      }
    }
  }
  if (renewal > 0) {
    const n = width * height;
    const logq = Math.log(1 - renewal);
    for (let c = Math.floor(Math.log(1 - rng()) / logq); c < n; c += 1 + Math.floor(Math.log(1 - rng()) / logq)) {
      for (let i = 0; i < PROGRAM_SIZE; i++) soup[c * PROGRAM_SIZE + i] = (rng() * 256) | 0;
    }
  }
  return shifts;
}
