// Exploratori (la maduració, pas 2a): la prova de traca.mjs, abans de fer-lo servir. Amb cintes a l'atzar (amb un 4, un 25 i un 50 %
// d'instruccions) i amb parelles de veïns de captures reals, la cinta final i les operacions han de ser idèntiques a les de fase1/bff.js,
// i les escriptures que avisa, aplicades en ordre a la cinta de partida, l'han de refer. Llavor 940.000 (de cap pla).
//   node prova-traca.mjs CAPTURA... > prova-traca-sortida.txt
import { readFileSync } from 'fs';
import { basename } from 'path';
import { evaluate, OPCODES } from '../../../../fase1/bff.js';
import { makeRng } from '../../../../fase1/soup.js';
import { evaluateTraced, neighbourPair } from './traca.mjs';

const rng = makeRng(940000, 'v2'), OPS = [...OPCODES].map((c) => c.charCodeAt(0));
let n = 0, bad = 0, writes = 0;
function check(tape) {
  const a = Uint8Array.from(tape), b = Uint8Array.from(tape), log = [];
  const oa = evaluate(a, 0), ob = evaluateTraced(b, 0, (op, pos, before, after) => log.push([pos, before, after]));
  const re = Uint8Array.from(tape);
  let ok = oa === ob;
  for (const [pos, before, after] of log) { if (re[pos] !== before) ok = false; re[pos] = after; }
  for (let i = 0; i < 128; i++) if (a[i] !== b[i] || re[i] !== b[i]) ok = false;
  n++; writes += log.length; if (!ok) bad++;
}
const randomTape = (p) => Uint8Array.from({ length: 128 }, () => (rng() < p ? OPS[(rng() * 10) | 0] : (rng() * 256) | 0));
for (const p of [0, 0.25, 0.5]) for (let i = 0; i < 33334; i++) check(randomTape(p));
console.log(`cintes a l'atzar: ${n}, diferents: ${bad}, escriptures avisades: ${writes}`);
for (const file of process.argv.slice(2)) {
  const soup = readFileSync(file), before = n, badBefore = bad, wBefore = writes;
  for (let i = 0; i < 25000; i++) {
    const [c, d] = neighbourPair(rng, 512, 256);
    const tape = new Uint8Array(128);
    tape.set(soup.subarray(c * 64, c * 64 + 64), 0); tape.set(soup.subarray(d * 64, d * 64 + 64), 64);
    check(tape);
  }
  console.log(`${basename(file)}: ${n - before} parelles, diferents: ${bad - badBefore}, escriptures avisades: ${writes - wBefore}`);
}
console.log(bad === 0 ? 'tot igual: traca.mjs fa el mateix que fase1/bff.js' : `ATENCIÓ: ${bad} diferents; traca.mjs no es pot fer servir`);
