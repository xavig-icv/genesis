// Anàlisi d'una captura del món (.bin): hi ha vida? de quin tipus?
// Ús: node fase2/analitza.mjs fitxer.bin [mostra]
//
// 1. Prova general de replicació sobre una mostra de cel·les, en dues posicions:
//    primer amb un company de soroll, i segon amb un company del mateix món.
// 2. El que veu el registre de famílies (des de zero), amb el temps que hi dedica.
import { readFileSync } from 'fs';
import { evaluate, KIND, PROGRAM_SIZE, TAPE_SIZE } from '../fase1/bff.js';
import { createRng, shannonEntropy } from '../fase1/soup.js';
import { createFamilyTracker } from './families.js';

const file = process.argv[2];
const sampleSize = Number(process.argv[3] ?? 4000);
const soup = new Uint8Array(readFileSync(file));
const n = soup.length / PROGRAM_SIZE;
// amplada del món: del nom del fitxer (…mon512x256…); 0 vol dir sopa barrejada
const width = Number(process.argv[4] ?? (file.match(/mon(\d+)x\d+/)?.[1] ?? 0));
const rng = createRng(17);
const show = (b) => Array.from(b, (v) => (KIND[v] ? String.fromCharCode(v) : v === 0 ? '0' : '·')).join('');
const program = (c) => soup.subarray(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE);
const noise = () => Uint8Array.from({ length: PROGRAM_SIZE }, () => (rng() * 256) | 0);

// El company acaba portant 16 bytes seguits del programa (o del seu mirall)?
function windowsOf(A) {
  const set = new Set();
  for (const b of [A, A.slice().reverse()]) for (let i = 0; i + 16 <= PROGRAM_SIZE; i++) set.add(String.fromCharCode(...b.subarray(i, i + 16)));
  return set;
}
function copies(A, B, aFirst, set) {
  // si el company ja portava un tros del programa, la prova no diu res
  for (let i = 0; i + 16 <= PROGRAM_SIZE; i++) if (set.has(String.fromCharCode(...B.subarray(i, i + 16)))) return false;
  const t = new Uint8Array(TAPE_SIZE);
  t.set(aFirst ? A : B, 0);
  t.set(aFirst ? B : A, PROGRAM_SIZE);
  evaluate(t, 0);
  const P = aFirst ? t.subarray(PROGRAM_SIZE) : t.subarray(0, PROGRAM_SIZE);
  for (let i = 0; i + 16 <= PROGRAM_SIZE; i++) if (set.has(String.fromCharCode(...P.subarray(i, i + 16)))) return true;
  return false;
}

console.log(`${file}\nentropia de Shannon: ${shannonEntropy(soup).toFixed(3)} bits`);
const counts = new Float64Array(256);
for (const v of soup) counts[v]++;
console.log('bytes més freqüents:', [...counts.keys()].sort((a, b) => counts[b] - counts[a]).slice(0, 5)
  .map((v) => `${KIND[v] ? String.fromCharCode(v) : v === 0 ? '0' : '#' + v}:${(counts[v] / soup.length * 100).toFixed(1)}%`).join(' '));

let solo = 0, context = 0;
const examples = [];
for (let k = 0; k < sampleSize; k++) {
  const c = (rng() * n) | 0;
  const A = program(c);
  const set = windowsOf(A);
  const s = copies(A, noise(), true, set) && copies(A, noise(), true, set);
  const ctx = copies(A, program((rng() * n) | 0), false, set);
  if (s) solo++;
  if (ctx) context++;
  if ((s || ctx) && examples.length < 4) examples.push(`${s ? 'sol     ' : 'context '} (${c % 512},${(c / 512) | 0}) |${show(A)}|`);
}
console.log(`\nreplicadors a la mostra de ${sampleSize}: sols ${(solo / sampleSize * 100).toFixed(1)}%   en context (segon, company del món) ${(context / sampleSize * 100).toFixed(1)}%`);
for (const e of examples) console.log('  ' + e);

const t0 = Date.now();
const fam = createFamilyTracker().analyse(soup, n, 0, width);
console.log(`\nregistre de famílies: ${fam.families.length} famílies, ${(fam.alive * 100).toFixed(1)} % de la mostra es replica (${Date.now() - t0} ms)`);
for (const f of fam.families) console.log(`  família ${f.id}: ${(f.share * 100).toFixed(1)} % del mapa · nucli ${f.core} · exemple |${show(f.example)}|`);
