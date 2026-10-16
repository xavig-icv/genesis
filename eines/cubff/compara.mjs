// Compara l'intèrpret del projecte (fase1/bff.js) amb el de cubff (oracle extern, AU2-12).
//
// Ús: node eines/cubff/compara.mjs ruta-a-oracle [cintes-per-tipus=5000] [--desa fitxer]
//
// Genera un corpus determinista de cintes de 128 bytes (llavor fixa), l'executa amb tots dos
// intèrprets i compara la cinta final i el nombre d'operacions de cada una. Amb --desa, escriu els
// resultats de cubff (FNV-1a de la cinta final i operacions, 8 bytes per cinta) perquè la prova
// test/oracle-cubff.mjs pugui comparar-los sense tenir cubff.
import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { evaluate, TAPE_SIZE, OPCODES } from '../../fase1/bff.js';
import { makeRng } from '../../fase1/soup.js';

export const KINDS = ['aleatòries', 'densitat alta d\'instruccions', 'programes de mons amb vida + soroll', 'parelles de veïns de mons amb vida'];

// El corpus: `perKind` cintes de cada tipus, sempre les mateixes per a una llavor
export function corpus(perKind, seed = 20261016) {
  const rng = makeRng(seed, 'v2');
  const byte = () => (rng() * 256) | 0;
  const alphabet = [...OPCODES].map((c) => c.charCodeAt(0)).concat([0]);
  const fixtures = ['esclat', 'punt'].map((n) => new Uint8Array(readFileSync(fileURLToPath(new URL(`../../test/fixtures/${n}-32x32.bin`, import.meta.url)))));
  const program = () => { const f = fixtures[byte() & 1]; const c = (rng() * 1024) | 0; return f.subarray(c * 64, c * 64 + 64); };
  const tapes = [];
  for (let kind = 0; kind < KINDS.length; kind++) {
    for (let k = 0; k < perKind; k++) {
      const t = new Uint8Array(TAPE_SIZE);
      if (kind === 0) for (let i = 0; i < TAPE_SIZE; i++) t[i] = byte();
      if (kind === 1) for (let i = 0; i < TAPE_SIZE; i++) t[i] = rng() < 0.8 ? alphabet[(rng() * alphabet.length) | 0] : byte();
      if (kind === 2) {
        const [first, second] = rng() < 0.5 ? [0, 64] : [64, 0];
        t.set(program(), first);
        for (let i = 0; i < 64; i++) t[second + i] = byte();
      }
      if (kind === 3) {
        // dues cel·les veïnes (a distància de 2 com a màxim) d'un mateix retall, com a l'aparellament del món
        const f = fixtures[byte() & 1];
        const x = (rng() * 32) | 0, y = (rng() * 32) | 0;
        const nx = Math.min(31, Math.max(0, x + ((rng() * 5) | 0) - 2)), ny = Math.min(31, Math.max(0, y + ((rng() * 5) | 0) - 2));
        t.set(f.subarray((y * 32 + x) * 64, (y * 32 + x) * 64 + 64), 0);
        t.set(f.subarray((ny * 32 + nx) * 64, (ny * 32 + nx) * 64 + 64), 64);
      }
      tapes.push({ kind, tape: t });
    }
  }
  return tapes;
}

export const fnv = (bytes) => { let h = 0x811c9dc5; for (const b of bytes) h = Math.imul(h ^ b, 0x01000193); return h >>> 0; };

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const [oracle, perArg, flag, out] = process.argv.slice(2);
  if (!oracle) { console.error('Ús: node eines/cubff/compara.mjs ruta-a-oracle [cintes-per-tipus] [--desa fitxer]'); process.exit(2); }
  const perKind = Number(perArg ?? 5000);
  const tapes = corpus(perKind);
  const input = Buffer.alloc(tapes.length * TAPE_SIZE);
  tapes.forEach((x, i) => input.set(x.tape, i * TAPE_SIZE));
  const r = spawnSync(oracle, [], { input, maxBuffer: 1 << 30 });
  if (r.status !== 0) { console.error(String(r.stderr)); process.exit(1); }
  const output = r.stdout;
  const stats = KINDS.map(() => ({ n: 0, tape: 0, ops: 0, maxOps: 0, limit: 0 }));
  const saved = Buffer.alloc(tapes.length * 8);
  const examples = [];
  tapes.forEach(({ kind, tape }, i) => {
    const theirs = output.subarray(i * (TAPE_SIZE + 4), i * (TAPE_SIZE + 4) + TAPE_SIZE);
    const theirOps = output.readUInt32LE(i * (TAPE_SIZE + 4) + TAPE_SIZE);
    const mine = tape.slice();
    const myOps = evaluate(mine, 0);
    const s = stats[kind];
    s.n++;
    const sameTape = Buffer.compare(Buffer.from(mine), theirs) === 0;
    if (sameTape) s.tape++;
    if (myOps === theirOps) s.ops++;
    s.maxOps = Math.max(s.maxOps, theirOps);
    if (theirOps >= 8192 - 128) s.limit++;
    if ((!sameTape || myOps !== theirOps) && examples.length < 5) examples.push({ kind, i, myOps, theirOps, sameTape });
    saved.writeUInt32LE(fnv(theirs), i * 8);
    saved.writeUInt32LE(theirOps, i * 8 + 4);
  });
  for (let k = 0; k < KINDS.length; k++) {
    const s = stats[k];
    console.log(`${KINDS[k].padEnd(38)} ${s.n} cintes: cinta final igual ${s.tape}, operacions iguals ${s.ops} (màxim ${s.maxOps}; a prop del límit de passos: ${s.limit})`);
  }
  for (const e of examples) console.log(`  DIFERÈNCIA: tipus ${KINDS[e.kind]}, cinta ${e.i}: operacions nostres ${e.myOps}, de cubff ${e.theirOps}, cinta ${e.sameTape ? 'igual' : 'diferent'}`);
  const total = stats.reduce((a, s) => a + s.n, 0), same = stats.reduce((a, s) => a + Math.min(s.tape, s.ops), 0);
  console.log(`\n${examples.length ? 'HI HA DIFERÈNCIES' : 'Coincideixen totes'}: ${total} cintes`);
  if (flag === '--desa' && out) { writeFileSync(out, saved); console.log(`resultats de cubff desats a ${out} (${saved.length} bytes)`); }
  process.exit(examples.length ? 1 : 0);
}
