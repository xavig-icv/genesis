// A measure of continuity (exploratory): the short test's record, validated as the full run's will be, and against the descent note's cells.
// It prints no measure and no class: the lines, their types, the samples' sizes, the time and the memory.
//
//   node fase2/resultats/arrelament/continuitat/curta.mjs ID FILE.jsonl.gz COMMIT
import { readFileSync } from 'fs';
import { join, basename } from 'path';
import { gunzipSync } from 'zlib';
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { ROOT } from '../registre-copies/dades.mjs';
import { LIST } from './comu.mjs';
import { validate, pilotFacts } from './valida.mjs';

const P = PROGRAM_SIZE;
const [id, file, code] = process.argv.slice(2);
if (!id || !file || !code || process.argv.length !== 5) { console.error('usage: node curta.mjs ID FILE.jsonl.gz COMMIT'); process.exit(2); }
const readJsonl = (rel) => readFileSync(join(ROOT, rel), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const full = JSON.parse(readFileSync(join(ROOT, LIST), 'utf8'));
const list = { ...full, branches: full.branches.filter((b) => b.id === id) };
if (list.branches.length !== 1) { console.error(`curta: ${id} is not in the list`); process.exit(2); }
const L = gunzipSync(readFileSync(file)).toString().trim().split('\n').map((l) => JSON.parse(l));
const v = validate({ list, records: new Map([[id, L]]), files: [basename(file) === `${id}.jsonl.gz` ? basename(file) : 'not-the-name'], pilot: pilotFacts(list, readJsonl), code });
console.log(`The short test, ${id} (${file}): ${v.problems.length ? `${v.problems.length} problems: ${v.problems.join('; ')}` : 'valid, against the list, the pilot record and the commit'}.`);
const L28 = readJsonl(`fase2/resultats/arrelament/descendencia/registres/${id}.jsonl`);
let same = 0, diff = 0;
for (const x of L.slice(1, -1)) {
  const y = L28.find((l) => l.type === x.type && l.epoch === x.epoch && l.window === x.window && (x.type === 'census' || l.id === x.id));
  const ok = x.type === 'census' ? (!x.D || (y.D.carriers === x.D.carriers && y.D.A === x.D.A && y.D.B === x.D.B && y.D.far.cells === x.D.farCells))
    : (!x.matched || JSON.stringify(y.baseline.cells) === JSON.stringify(x.matched.cells));
  if (ok) same++; else diff++;
}
console.log(`Against the descent note's record: ${same} lines with the same carriers, halves, far cells and matched cells; ${diff} differ.`);
const types = {}; for (const x of L) types[x.type] = (types[x.type] ?? 0) + 1;
const cs = L.filter((x) => x.type === 'census' && x.D);
console.log(`Lines: ${L.length} (${Object.entries(types).map(([k, n]) => `${k} ${n}`).join(', ')}); censuses with D ${cs.length}: half A ${cs.map((c) => c.D.A).join(', ')}, half B's sample ${cs.map((c) => c.D.halfB.length).join(', ')}, far ${cs.map((c) => c.D.far.length).join(', ')}, distinct sequences ${cs.map((c) => c.D.pool.length / P).join(', ')}.`);
console.log(`The end: ${L.at(-1).measuresChecked} measures and ${L.at(-1).invariantChecks} invariant checks, the final fingerprint ${L.at(-1).fingerprint}; ${L.at(-1).seconds} s, ${L.at(-1).rssMB} MB; the file, ${readFileSync(file).length} bytes.`);
process.exit(v.problems.length || diff ? 1 : 0);
