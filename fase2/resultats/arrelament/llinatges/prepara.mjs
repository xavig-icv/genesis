// Les famílies naturals seguides com els plantats (exploratori; la nota, README.md): la preparació. No simula res.
//
//   node fase2/resultats/arrelament/llinatges/prepara.mjs CARPETA-DE-LES-CAPTURES
//
// CARPETA-DE-LES-CAPTURES: la carpeta del pilot de la còpia del càlcul, la que té alicuotes/NNNN/ARM.bin (no són a git).
// 1. El codi de la simulació ha de ser el del pilot (92b8f4f): sim.mjs i els .js i .mjs de fase1/ i fase2/, sense cap canvi.
// 2. Les branques: les de la part B on el cens inert troba alguna cel·la hereditària (els registres de git), en l'ordre del manifest.
// 3. Les captures de partida d'aquestes branques, copiades al mateix camí relatiu (git no les segueix), amb la SHA-256 del manifest.
// 4. llista.txt: una línia per branca, «ID ordre», amb l'ordre del manifest, un altre --json i --save --save-every 50.
// Només escriu llista.txt i les captures que hi falten; si una captura ja hi és, n'ha de tenir la SHA-256.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { createHash } from 'crypto';
import { ROOT } from './comu.mjs';

const PILOT = 'fase2/resultats/arrelament/pilot';
const AQUI = 'fase2/resultats/arrelament/llinatges';
const CODI = '92b8f4f';
const sha = (b) => createHash('sha256').update(b).digest('hex');
const fail = (msg) => { console.error(`prepara: ${msg}`); process.exit(1); };

const font = process.argv[2];
if (!font || process.argv.length !== 3) fail('ús: node prepara.mjs CARPETA-DE-LES-CAPTURES');
const run = (cmd) => execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
// els patrons, amb :(glob), perquè fase2/*.mjs no agafi les subcarpetes (com aquesta)
const CODE = 'sim.mjs ":(glob)fase1/*.js" ":(glob)fase1/*.mjs" ":(glob)fase2/*.js" ":(glob)fase2/*.mjs"';
if (run(`git diff --name-only ${CODI} HEAD -- ${CODE}`).trim()) fail(`el codi de la simulació no és el de ${CODI}`);
if (run(`git status --porcelain -- ${CODE}`).trim()) fail('el codi de la simulació té canvis sense desar');

const m = JSON.parse(readFileSync(join(ROOT, PILOT, 'manifest.json'), 'utf8'));
const worlds = new Map(m.worlds.map((w) => [w.world, w]));
const tria = [];
for (const b of m.branches.filter((x) => x.part === 'B')) {
  const lines = readFileSync(join(ROOT, PILOT, 'part-b', `${b.id}.jsonl`), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  if (lines.some((l) => l.type === 'inert' && l.heritable > 0)) tria.push(b);
}
const out = [];
for (const b of tria) {
  const arm = worlds.get(b.world).arms[b.soup];
  const dst = join(ROOT, arm.file);
  if (!existsSync(dst)) {
    const src = join(font, arm.file.slice(PILOT.length + 1));
    if (!existsSync(src)) fail(`no trobo la captura de partida de ${b.id} a la carpeta donada`);
    if (sha(readFileSync(src)) !== arm.sha256) fail(`la captura de partida de ${b.id} no té la SHA-256 del manifest`);
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }
  if (sha(readFileSync(dst)) !== arm.sha256) fail(`la captura de partida de ${b.id}, a la còpia, no té la SHA-256 del manifest`);
  const ordre = b.command.replace(/^node sim\.mjs /, '');
  const json = `--json ${PILOT}/part-b/${b.id}.jsonl`;
  if (!ordre.includes(json)) fail(`l'ordre de ${b.id} no té el --json esperat`);
  out.push(`${b.id} ${ordre.replace(json, `--json ${AQUI}/simulacio/${b.id}.jsonl --save ${AQUI}/captures/${b.id} --save-every 50`)}`);
}
writeFileSync(join(ROOT, AQUI, 'llista.txt'), out.join('\n') + '\n');
const per = {};
for (const b of tria) per[b.soup] = (per[b.soup] ?? 0) + 1;
console.log(`${tria.length} branques (${Object.entries(per).map(([k, v]) => `${k} ${v}`).join(', ')}); llista.txt, SHA-256 ${sha(readFileSync(join(ROOT, AQUI, 'llista.txt')))}`);
