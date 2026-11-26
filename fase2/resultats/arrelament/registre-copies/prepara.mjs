// The record of heritable copies, the small version (exploratory; the note, README.md): the preparation. It simulates nothing and traces
// nothing.
//
//   node fase2/resultats/arrelament/registre-copies/prepara.mjs CAPTURES-FOLDER
//
// CAPTURES-FOLDER: the pilot's folder in the computation's copy (alicuotes/NNNN/ARM.bin; not in git).
// 1. The simulation's modules must be the pilot's (92b8f4f): fase1/ and fase2/, unchanged.
// 2. The data, read and validated (dades.mjs).
// 3. The appearances, fixed in the note: the failed appearances the time rule removes, in the three soups, and the burst of world 7046 at
//    epoch 16,000 (its last census). Each census of a branch with some of them is a tracked census, with its sets of programs: D (the
//    dominant group's lineages detected at an earlier census), Dbroad (all its lineages up to the confirmation) and each appearance.
// 4. The start captures of those branches, copied to the same relative path (git does not follow them), with the manifest's SHA-256.
// 5. llista.json. It writes nothing else; a capture already there must have its SHA-256.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { load, ROOT, PILOT, HERE, TIME, sha256 } from './dades.mjs';

const CODE = '92b8f4f';
const fail = (msg) => { console.error(`prepara: ${msg}`); process.exit(1); };
const font = process.argv[2];
if (!font || process.argv.length !== 3) fail('usage: node prepara.mjs CAPTURES-FOLDER');
const run = (cmd) => execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const MODULES = '":(glob)fase1/*.js" ":(glob)fase2/*.js"';
if (run(`git diff --name-only ${CODE} HEAD -- ${MODULES}`).trim()) fail(`the simulation's modules are not those of ${CODE}`);
if (run(`git status --porcelain -- ${MODULES}`).trim()) fail('the simulation\'s modules have unsaved changes');

const d = load();
if (d.problems.length) fail(`the data are not valid:\n- ${d.problems.slice(0, 20).join('\n- ')}`);
const { B, failed, m } = d;
const worlds = new Map(m.worlds.map((w) => [w.world, w]));
const chosen = [];
for (const b of B) for (const y of failed(b)) {
  const timeRule = b.ev !== null && b.ev.epoch - y.first <= TIME;
  const burst = String(b.world) === '7046' && b.soup === 'continue' && y.first === 16000;
  if (timeRule || burst) chosen.push({ b, y, why: timeRule ? 'time rule' : 'burst' });
}
const branches = [];
for (const b of B) {
  const mine = chosen.filter((c) => c.b === b);
  if (!mine.length) continue;
  const arm = worlds.get(b.world).arms[b.soup];
  const dst = join(ROOT, arm.file);
  if (!existsSync(dst)) {
    const src = join(font, arm.file.slice(PILOT.length + 1));
    if (!existsSync(src)) fail(`no start capture for ${b.id} in the folder given`);
    if (sha256(readFileSync(src)) !== arm.sha256) fail(`the start capture of ${b.id} does not have the manifest's SHA-256`);
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }
  if (sha256(readFileSync(dst)) !== arm.sha256) fail(`the start capture of ${b.id}, in the copy, does not have the manifest's SHA-256`);
  if (b.rec[0].from !== arm.file) fail(`${b.id}: the record does not start from the manifest's capture`);
  const observers = [];
  for (const E of [...new Set(mine.map((c) => c.y.first))].sort((p, q) => p - q)) {
    const ys = mine.filter((c) => c.y.first === E).map((c) => c.y);
    const dom = b.domRoot === null ? [] : b.lineages.filter((x) => x.rooted);
    const strict = dom.filter((x) => x.first < E), broad = dom.filter((x) => x.first <= b.ev.confirmed);
    const sets = [];
    let bit = 1;
    if (strict.length) { sets.push({ name: 'D', bit, programs: strict.flatMap((x) => x.programs) }); }
    bit <<= 1;
    if (broad.length) { sets.push({ name: 'Dbroad', bit, programs: broad.flatMap((x) => x.programs) }); }
    for (const y of ys) { bit <<= 1; sets.push({ name: y.id, bit, programs: y.programs }); }
    if (bit > 0x8000) fail(`${b.id} at ${E}: too many sets for 16 bits`);
    observers.push({ epoch: E, why: mine.find((c) => c.y.first === E).why, dStrictLineages: strict.length, dBroadLineages: broad.length,
      appearances: ys.map((y) => ({ id: y.id, cells: y.cells, programs: y.programs })), sets });
  }
  const record = `${PILOT}/part-b/${b.id}.jsonl`;
  branches.push({ id: b.id, world: b.world, soup: b.soup, event: b.ev ? b.ev.epoch : null, record, recordSha256: sha256(readFileSync(join(ROOT, record))),
    captureSha256: arm.sha256, end: b.end.epoch, observers });
}
const out = { note: HERE, code: run('git rev-parse --short HEAD').trim(), branches };
const file = join(ROOT, HERE, 'llista.json');
writeFileSync(file, JSON.stringify(out, null, 1) + '\n');
const per = (f) => ['continue', 'shuffle-all', 'reinit'].map((s) => `${s} ${chosen.filter((c) => c.b.soup === s && f(c)).length}`).join(', ');
console.log(`appearances: ${chosen.length} (the time rule: ${per((c) => c.why === 'time rule')}; the burst of 7046: ${chosen.filter((c) => c.why === 'burst').length})`);
console.log(`branches: ${branches.length}; tracked censuses: ${branches.reduce((s, b) => s + b.observers.length, 0)}; with no earlier dominant lineage: ${branches.flatMap((b) => b.observers).filter((o) => o.why === 'time rule' && !o.dStrictLineages).length}`);
console.log(`epochs to simulate: ${branches.reduce((s, b) => s + b.end - 8000, 0)}; llista.json, SHA-256 ${sha256(readFileSync(file))}`);
