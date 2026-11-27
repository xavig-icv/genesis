// A record of copy events (exploratory; the note, README.md): the preparation. It simulates nothing.
//
//   node fase2/resultats/arrelament/esdeveniments/prepara.mjs CAPTURES-FOLDER
//
// CAPTURES-FOLDER: the pilot's folder in the computation's copy (alicuotes/NNNN/ARM.bin; not in git).
// 1. The simulation's modules must be the pilot's (92b8f4f): fase1/ and fase2/, unchanged.
// 2. The data, read and validated (../registre-copies/dades.mjs, as it is).
// 3. The appearances, fixed in the note: every failed appearance of part B (the time rule's and the rest), in the three soups. For each
//    branch with some, its detection censuses E, each with its appearances (cells and programs), its window's start (E − 1,250, or the
//    branch's start) and the lineages detected before E (first < E), split into the dominant group's (rooted) and the others.
// 3b. The reference lineages of each census: the branch's other tracked lineages (not failed appearances) first detected inside its window
//    before the census, or at the census if they are the dominant group's; at most REF_CELLS of their cells (the first in the tracking).
// 4. The start captures of those branches, copied to the same relative path (git does not follow them), with the manifest's SHA-256.
// 5. llista.json. It writes nothing else; a capture already there must have its SHA-256.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { load, ROOT, PILOT, TIME, sha256 } from '../registre-copies/dades.mjs';
import { HERE, WINDOW, REF_CELLS } from './comu.mjs';

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
const { B, failed, m, start } = d;
const worlds = new Map(m.worlds.map((w) => [w.world, w]));
const branches = [];
let nApp = 0, nCells = 0, nRef = 0, nRefCells = 0;
for (const b of B) {
  const f = failed(b);
  if (!f.length) continue;
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
  if (b.rec[0].from !== arm.file || b.rec[0].start !== start) fail(`${b.id}: the record does not start from the manifest's capture`);
  const censuses = [];
  const failedIds = new Set(f.map((y) => y.id));
  for (const E of [...new Set(f.map((y) => y.first))].sort((p, q) => p - q)) {
    const ys = f.filter((y) => y.first === E);
    const before = b.lineages.filter((x) => x.first < E);
    const w0 = Math.max(start, E - WINDOW);
    const refs = b.lineages.filter((x) => !failedIds.has(x.id) && x.first >= w0 && (x.first < E || (x.first === E && x.rooted)));
    censuses.push({
      epoch: E, w0,
      appearances: ys.map((y) => ({ id: y.id, cells: y.cells, programs: y.programs, timeRule: b.ev !== null && b.ev.epoch - y.first <= TIME })),
      earlier: { dominant: before.filter((x) => x.rooted).flatMap((x) => x.programs), other: before.filter((x) => !x.rooted).flatMap((x) => x.programs),
        lineages: { dominant: before.filter((x) => x.rooted).length, other: before.filter((x) => !x.rooted).length } },
      references: refs.map((x) => ({ id: x.id, first: x.first, rooted: x.rooted, cells: x.cells.slice(0, REF_CELLS), programs: x.programs.slice(0, REF_CELLS),
        earlier: b.lineages.filter((z) => z.first < x.first).flatMap((z) => z.programs) })),
    });
    nApp += ys.length; nCells += ys.reduce((s, y) => s + y.cells.length, 0); nRef += refs.length; nRefCells += refs.reduce((s, x) => s + Math.min(REF_CELLS, x.cells.length), 0);
  }
  const record = `${PILOT}/part-b/${b.id}.jsonl`;
  branches.push({ id: b.id, world: b.world, soup: b.soup, event: b.ev ? b.ev.epoch : null, record, recordSha256: sha256(readFileSync(join(ROOT, record))),
    capture: arm.file, captureSha256: arm.sha256, start, end: b.end.epoch, exposure: b.exposure, censuses });
}
const out = { note: HERE, code: run('git rev-parse --short HEAD').trim(), window: WINDOW, branches };
const file = join(ROOT, HERE, 'llista.json');
writeFileSync(file, JSON.stringify(out, null, 1) + '\n');
const per = (f) => ['continue', 'shuffle-all', 'reinit'].map((s) => `${s} ${branches.filter((b) => b.soup === s).flatMap((b) => b.censuses.flatMap((c) => c.appearances)).filter(f).length}`).join(', ');
console.log(`appearances: ${nApp}, cells ${nCells} (all: ${per(() => true)}; the time rule's: ${per((y) => y.timeRule)})`);
console.log(`reference lineages (per census): ${nRef}, cells ${nRefCells}`);
console.log(`branches: ${branches.length}; detection censuses: ${branches.reduce((s, b) => s + b.censuses.length, 0)}; epochs to simulate: ${branches.reduce((s, b) => s + b.end - b.start, 0)}`);
console.log(`llista.json, SHA-256 ${sha256(readFileSync(file))}`);
