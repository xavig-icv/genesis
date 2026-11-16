// La prova de viabilitat (exploratori): el llinatge de cada branca, després de calcular-la (el README d'aquesta carpeta, el punt 6; el
// pla, §4.5). Des de l'arrel de la còpia:
//   node fase2/resultats/arrelament/viabilitat/llinatge.mjs [--prova] --tros K/N     (les branques amb índex ≡ K mòdul N)
//   node fase2/resultats/arrelament/viabilitat/llinatge.mjs [--prova] ID...
// A cada branca, la captura sembrada (l'època 8.000) i les de cada 100 èpoques, en ordre: les cel·les que porten alguna finestra del
// llinatge (M); com a molt 256, provades amb companys inerts en 3 condicions (si M ≤ 256, totes); F = M × la fracció de les provades que
// són hereditàries en alguna condició; i les finestres de les funcionals provades, afegides a les del llinatge. Un JSONL per branca, a
// llinatge/ (o prova/llinatge/), amb la línia d'inici, una línia per captura i la línia final. Si ja hi és sencer, se'l salta.
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'fs';
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { makeRng } from '../../../../fase1/soup.js';
import { DIR, CELLS, SAMPLE, LINEAGE_OFFSET, INERT_SEED, Windows, at, fromHex, programAt, sha256, header, readJsonl, inertTest, inertConditions } from './comu.mjs';

const argv = process.argv.slice(2);
const prova = argv[0] === '--prova';
if (prova) argv.shift();
const design = JSON.parse(readFileSync(at(`${DIR}/disseny.json`), 'utf8'));
const base = prova ? `${DIR}/prova` : DIR;
let ids;
if (argv[0] === '--tros') {
  const m = (argv[1] ?? '').match(/^(\d+)\/(\d+)$/);
  if (!m || Number(m[1]) >= Number(m[2])) { console.error('--tros K/N, amb 0 ≤ K < N'); process.exit(2); }
  ids = design.branches.map((b) => b.id).filter((_, i) => i % Number(m[2]) === Number(m[1]));
} else ids = argv;
if (prova) ids = readFileSync(at(`${DIR}/prova/llista.txt`), 'utf8').split('\n').filter(Boolean).map((l) => l.split(' ')[0]);
if (!ids.length) { console.error('cap branca'); process.exit(2); }
const conds = inertConditions(3);
mkdirSync(at(`${base}/llinatge`), { recursive: true });
const complete = (file) => existsSync(file) && readJsonl(file).at(-1)?.type === 'end';

for (const id of ids) {
  const b = design.branches.find((x) => x.id === id);
  if (!b) { console.error(`${id}: no és a disseny.json`); process.exit(2); }
  const out = at(`${base}/llinatge/${id}.jsonl`);
  if (complete(out)) { console.error(`${id}: ja és fet`); continue; }
  const plant = JSON.parse(readFileSync(at(b.plant), 'utf8'));
  const reg = readJsonl(at(`${base}/registres/${id}.jsonl`));
  if (reg.at(-1).type !== 'end') { console.error(`${id}: el registre de la branca no és sencer`); process.exit(2); }
  const last = reg.at(-1).epoch;
  const t0 = Date.now();
  const lines = [{ type: 'start', id, ...header(), world: b.world, arm: b.arm, variant: b.variant, genotype: b.genotype, hex: plant.hex,
    cells: b.cells, seed: b.seed, lineageSeed: Number(b.world) + LINEAGE_OFFSET, conditions: { seed: INERT_SEED, count: 3 }, sample: SAMPLE, lastEpoch: last }];
  const windows = new Windows();
  windows.addProgram(fromHex(plant.hex));
  const rng = makeRng(Number(b.world) + LINEAGE_OFFSET, 'v2');
  const files = [{ epoch: 8000, file: b.plant.replace(/\.json$/, '.bin'), sha256: plant.outputSha256 }];
  for (let e = 8100; e <= last; e += 100) files.push({ epoch: e, file: `${base}/captures/${id}/llavor${b.seed}-mon512x256-r2-des8000-epoca${e}.bin` });
  for (const f of files) {
    const buf = readFileSync(at(f.file));
    if (buf.length !== CELLS * PROGRAM_SIZE) throw new Error(`${f.file}: la mida no és la d'un món`);
    const hash = sha256(buf);
    if (f.sha256 && hash !== f.sha256) throw new Error(`${f.file}: la SHA-256 no és la de la sembra`);
    const soup = new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
    const members = [];
    for (let c = 0; c < CELLS; c++) if (windows.has(programAt(soup, c))) members.push(c);
    const M = members.length;
    let tested = members;
    if (M > SAMPLE) {
      for (let k = 0; k < SAMPLE; k++) { const j = k + ((rng() * (M - k)) | 0); [members[k], members[j]] = [members[j], members[k]]; }
      tested = members.slice(0, SAMPLE);
    }
    let copies = 0, functional = 0;
    const fresh = [];
    for (const c of tested) {
      const P = programAt(soup, c).slice();
      const r = inertTest(P, conds);
      if (r.copies) copies++;
      if (r.heritable) { functional++; fresh.push(P); }
    }
    for (const P of fresh) windows.addProgram(P);
    const F = tested.length ? Math.round((M * functional) / tested.length) : 0;
    lines.push({ type: 'capture', epoch: f.epoch, file: f.file.split('/').pop(), sha256: hash, M, tested: tested.length, copies, functional, F, windows: windows.size });
  }
  lines.push({ type: 'end', captures: files.length, seconds: Math.round((Date.now() - t0) / 1000) });
  writeFileSync(`${out}.part`, lines.map((l) => JSON.stringify(l)).join('\n') + '\n');
  renameSync(`${out}.part`, out);
  console.error(`${id}: ${files.length} captures, ${Math.round((Date.now() - t0) / 1000)} s`);
}
