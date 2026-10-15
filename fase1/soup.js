// La sopa: N programes de 64 bytes en un sol Uint8Array.
// Cada època: es barregen, s'aparellen a l'atzar, cada parella s'executa
// com una cinta de 128 bytes i les dues meitats tornen al seu lloc.
// Ningú no crea ni destrueix programes: només es reescriuen.

import { PROGRAM_SIZE, TAPE_SIZE } from './bff.js';

export const DEFAULT_MUTATION = 0.00024; // 0.024% per byte i època, com a l'article

// Generadors pseudoaleatoris, amb llavor perquè els experiments es puguin repetir.
//
// v1 · mulberry32. És el que van fer servir tots els experiments fins a l'auditoria 1. Té un sol
//      cicle de 2^32 nombres: un món 2D l'esgota cap a l'època 10.000-13.000, i totes les llavors
//      en són punts de partida diferents del mateix cicle (AUD-01). Es manté per reproduir els
//      resultats ja publicats (sim.mjs --rng v1).
// v2 · xoshiro128** (Blackman i Vigna), amb un període de 2^128 - 1. L'estat s'inicialitza amb
//      SplitMix32 a partir de la llavor, perquè llavors veïnes (1, 2, 3…) donin seqüències sense
//      cap relació. És el generador per defecte de les sèries noves.
export const RNG_VERSIONS = ['v1', 'v2'];

export function createRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// SplitMix32: suma la proporció àuria i barreja amb el finalitzador de MurmurHash3.
function splitmix32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x9e3779b9) >>> 0;
    let z = Math.imul(a ^ (a >>> 16), 0x85ebca6b) >>> 0;
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
    return (z ^ (z >>> 16)) >>> 0;
  };
}

const rotl = (x, k) => (x << k) | (x >>> (32 - k));

// xoshiro128** a partir d'un estat explícit; retorna enters de 32 bits sense signe.
export function xoshiro128ss(a, b, c, d) {
  return function next() {
    const result = Math.imul(rotl(Math.imul(b, 5), 7), 9) >>> 0;
    const t = b << 9;
    c ^= a; d ^= b; b ^= c; a ^= d;
    c ^= t;
    d = rotl(d, 11);
    return result;
  };
}

export function createRngV2(seed) {
  const sm = splitmix32(seed);
  let a = sm(), b = sm(), c = sm(), d = sm();
  if ((a | b | c | d) === 0) a = 1; // l'estat tot zeros no és vàlid
  const next = xoshiro128ss(a, b, c, d);
  return () => next() / 4294967296;
}

export function makeRng(seed, version = 'v2') {
  if (version === 'v1') return createRng(seed);
  if (version === 'v2') return createRngV2(seed);
  throw new Error(`generador desconegut: ${version}`);
}

export function randomSoup(nPrograms, rng) {
  const soup = new Uint8Array(nPrograms * PROGRAM_SIZE);
  for (let i = 0; i < soup.length; i++) soup[i] = (rng() * 256) | 0;
  return soup;
}

// Fisher-Yates: un ordre aleatori dels índexs de programa.
export function shuffle(perm, rng) {
  for (let i = perm.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    const tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp;
  }
}

// Copia les parelles perm[2i], perm[2i+1] de la sopa a cintes consecutives.
// Es copia de 4 en 4 bytes (Uint32) perquè és molt més ràpid que byte a byte.
const WORDS = PROGRAM_SIZE / 4;
export function gather(soup, perm, pairs, firstPair, nPairs) {
  const s = new Uint32Array(soup.buffer, soup.byteOffset, soup.length >> 2);
  const d = new Uint32Array(pairs.buffer, pairs.byteOffset, pairs.length >> 2);
  for (let i = 0; i < nPairs; i++) {
    const p1 = perm[2 * (firstPair + i)] * WORDS;
    const p2 = perm[2 * (firstPair + i) + 1] * WORDS;
    const dst = i * 2 * WORDS;
    for (let w = 0; w < WORDS; w++) d[dst + w] = s[p1 + w];
    for (let w = 0; w < WORDS; w++) d[dst + WORDS + w] = s[p2 + w];
  }
}

// El camí invers: cada meitat torna al lloc d'on havia sortit.
export function scatter(soup, perm, pairs, firstPair, nPairs) {
  const s = new Uint32Array(soup.buffer, soup.byteOffset, soup.length >> 2);
  const d = new Uint32Array(pairs.buffer, pairs.byteOffset, pairs.length >> 2);
  for (let i = 0; i < nPairs; i++) {
    const p1 = perm[2 * (firstPair + i)] * WORDS;
    const p2 = perm[2 * (firstPair + i) + 1] * WORDS;
    const src = i * 2 * WORDS;
    for (let w = 0; w < WORDS; w++) s[p1 + w] = d[src + w];
    for (let w = 0; w < WORDS; w++) s[p2 + w] = d[src + WORDS + w];
  }
}

// Mutacions de fons: cada byte té probabilitat p de canviar per un valor
// aleatori. En lloc de tirar un dau per byte, saltem directament al
// següent byte mutat (distribució geomètrica). Retorna quants n'ha mutat.
export function mutate(buf, length, p, rng) {
  if (p <= 0) return 0;
  const logq = Math.log(1 - p);
  let count = 0;
  let i = Math.floor(Math.log(1 - rng()) / logq);
  while (i < length) {
    buf[i] = (rng() * 256) | 0;
    count++;
    i += 1 + Math.floor(Math.log(1 - rng()) / logq);
  }
  return count;
}

// Entropia de Shannon d'ordre zero, en bits per byte.
export function shannonEntropy(bytes) {
  const counts = new Float64Array(256);
  for (let i = 0; i < bytes.length; i++) counts[bytes[i]]++;
  let h = 0;
  for (let i = 0; i < 256; i++) {
    if (counts[i] > 0) {
      const f = counts[i] / bytes.length;
      h -= f * Math.log2(f);
    }
  }
  return h;
}

// Entropia d'ordre superior (com a l'article): entropia de Shannon menys
// els bits per byte que queden després de comprimir. Una sopa aleatòria
// no es pot comprimir, i dona ~0. Quan la sopa s'omple de còpies es
// comprimeix molt i el valor puja.
export function higherOrderEntropy(h0, compressedBytes, totalBytes) {
  return h0 - (compressedBytes * 8) / totalBytes;
}

// Compta els programes idèntics i retorna els més abundants.
export function topPrograms(soup, nPrograms, limit = 5) {
  const counts = new Map();
  for (let p = 0; p < nPrograms; p++) {
    // FNV-1a de 32 bits sobre els 64 bytes
    let h = 0x811c9dc5;
    const base = p * PROGRAM_SIZE;
    for (let i = 0; i < PROGRAM_SIZE; i++) h = Math.imul(h ^ soup[base + i], 0x01000193);
    const e = counts.get(h);
    if (e) e.count++;
    else counts.set(h, { count: 1, index: p });
  }
  const top = limit ? [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit) : [];
  return { distinct: counts.size, top };
}
