// How the planted replicators die out in the aged soup (exploratory; the note, README.md, questions 3 and 2): the first bytes of the
// pilot's starting snapshots. It only reads them.
//
//   node fase2/resultats/arrelament/extincions/primer-byte.mjs PILOT-FOLDER [--world NNNN] > fase2/resultats/arrelament/extincions/primer-byte.jsonl
//
// PILOT-FOLDER: the pilot folder of the pilot's computation copy, the one with alicuotes/NNNN/ARM.bin (not in git). Each snapshot must
// have the manifest's SHA-256. With --world, only that world (the short test).
// For each world of the cohort and each soup: the cells, and those whose first byte is ']' or 0. For each one-cell seed of G1 and G4 of
// part A: its 24 neighbours within radius 2 (the ones pairNeighbors can pair with it), and how many of them start with ']' or 0.
import { readFileSync } from 'fs';
import { join } from 'path';
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { ROOT, PILOT, ARMS, BAD_FIRST, sha256 } from './comu.mjs';

const args = process.argv.slice(2);
const src = args[0];
const only = args[1] === '--world' ? args[2] : null;
if (!src || !(args.length === 1 || (args.length === 3 && only))) { console.error('usage: node primer-byte.mjs PILOT-FOLDER [--world NNNN]'); process.exit(2); }
const t0 = Date.now();
const m = JSON.parse(readFileSync(join(ROOT, PILOT, 'manifest.json'), 'utf8'));
const [W, H] = m.params.world, R = m.params.radius;
const cohort = m.worlds.filter((w) => w.included && (!only || w.world === only));
if (!cohort.length) { console.error('no world of the cohort to read'); process.exit(2); }
console.log(JSON.stringify({ type: 'start', code: codeVersion(), node: process.version, radius: R, world: [W, H], bad: [...BAD_FIRST], only }));
let worlds = 0, seeds = 0;
for (const w of cohort) {
  const counts = {};
  for (const arm of ARMS) {
    const a = w.arms[arm];
    const buf = new Uint8Array(readFileSync(join(src, a.file.slice(PILOT.length + 1))));
    if (sha256(buf) !== a.sha256) { console.error(`${w.world} ${arm}: the snapshot does not have the manifest's SHA-256`); process.exit(1); }
    let n = 0, bracket = 0, zero = 0;
    for (let c = 0; c < buf.length; c += PROGRAM_SIZE) { n++; if (buf[c] === 93) bracket++; else if (buf[c] === 0) zero++; }
    counts[arm] = { cells: n, bracket, zero };
    for (const b of m.branches.filter((x) => x.part === 'A' && x.world === w.world && x.soup === arm && (x.variant === 'G1' || x.variant === 'G4'))) {
      const s = JSON.parse(readFileSync(join(ROOT, b.plant), 'utf8'));
      if (s.sourceSha256 !== a.sha256) { console.error(`${b.id}: the seed is not of the manifest's snapshot`); process.exit(1); }
      if (s.cells.length !== 1) { console.error(`${b.id}: not a one-cell seed`); process.exit(1); }
      const p = s.cells[0], x = p % W, y = (p / W) | 0;
      let neighbours = 0, bad = 0;
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
        const nx = x + dx, ny = y + dy;
        if ((dx === 0 && dy === 0) || nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        neighbours++;
        if (BAD_FIRST.has(buf[(ny * W + nx) * PROGRAM_SIZE])) bad++;
      }
      seeds++;
      console.log(JSON.stringify({ type: 'seed', branch: b.id, world: b.world, soup: arm, variant: b.variant, position: b.position, cell: p, neighbours, bad }));
    }
  }
  worlds++;
  console.log(JSON.stringify({ type: 'world', world: w.world, ...counts }));
}
console.log(JSON.stringify({ type: 'end', worlds, seeds, seconds: (Date.now() - t0) / 1000 }));
