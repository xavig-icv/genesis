// La trobada del microscopi (web/microscopi/): quina parella de cel·les reals s'hi posa. Mòdul pur, sense el navegador: el
// proven les proves del lloc (test/web.mjs).
//
// La parella és una cel·la d'una família de replicadors i una veïna seva que encara no és de cap família, a l'època d'un fotograma
// amb codi (eines/web-dades.mjs). Veïna vol dir a dues cel·les com a molt en cada direcció, dins del món i sense donar la volta: el
// radi d'interacció dels mons de les sèries, com a la prova de replicació (fase2/replication.js). Es tria a l'atzar entre totes les
// parelles així, amb el generador del simulador (fase1/soup.js, el v2) i una llavor declarada, que va a l'adreça de la pàgina: la
// mateixa adreça fa sempre la mateixa parella.
import { makeRng } from '../../fase1/soup.js';
import { OPCODES } from './formes.js';

export const RADIUS = 2;

// La classe de formes.js de cada byte: 1 el zero, de 2 a 11 les instruccions <>{}-+.,[], i 0 qualsevol altre
const CLASS = new Uint8Array(256);
CLASS[0] = 1;
[...OPCODES].forEach((c, i) => { CLASS[c.charCodeAt(0)] = i + 2; });
export const classOfByte = (b) => CLASS[b];

// Recorre les parelles d'un fotograma, en ordre: les cel·les c de la família (j, la seva posició a la llista del fotograma, de
// l'1 endavant: el valor del mapa), i per a cadascuna, les veïnes b, per files i columnes, que no són de cap família (0 al mapa).
// visit(c, b) torna true per aturar-se
function walk(fam, W, H, j, visit, radius = RADIUS) {
  for (let c = 0; c < W * H; c++) {
    if (fam[c] !== j) continue;
    const x = c % W, y = (c - x) / W;
    for (let dy = -radius; dy <= radius; dy++) {
      const ny = y + dy;
      if (ny < 0 || ny >= H) continue;
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        if ((dx === 0 && dy === 0) || nx < 0 || nx >= W) continue;
        const b = ny * W + nx;
        if (fam[b] === 0 && visit(c, b)) return;
      }
    }
  }
}
// Totes les parelles (per a les proves, i per a mons petits)
export function frontierPairs(fam, W, H, j, radius = RADIUS) {
  const out = [];
  walk(fam, W, H, j, (c, b) => { out.push([c, b]); return false; }, radius);
  return out;
}
export function countPairs(fam, W, H, j, radius = RADIUS) {
  let n = 0;
  walk(fam, W, H, j, () => { n++; return false; }, radius);
  return n;
}
// La parella k-èsima, sense desar-les totes
export function pairAt(fam, W, H, j, k, radius = RADIUS) {
  let i = 0, found = null;
  walk(fam, W, H, j, (c, b) => { if (i++ === k) { found = [c, b]; return true; } return false; }, radius);
  return found;
}
// Una parella a l'atzar amb la llavor: l'índex, el primer nombre del generador v2 de la llavor, per les parelles que hi ha.
// Torna { pair, count, index }, o null si no n'hi ha cap
export function pickPair(fam, W, H, j, seed, radius = RADIUS) {
  const count = countPairs(fam, W, H, j, radius);
  if (!count) return null;
  const index = Math.floor(makeRng(seed >>> 0, 'v2')() * count);
  return { pair: pairAt(fam, W, H, j, index, radius), count, index };
}
