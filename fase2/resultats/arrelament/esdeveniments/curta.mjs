// A record of copy events (exploratory): the short test's record, validated as the full run's will be, with its evidence tested again. It
// prints no class and no end: the lines, the chains counted, the replays, the time and the memory.
//
//   node fase2/resultats/arrelament/esdeveniments/curta.mjs ID FILE.jsonl.gz COMMIT
import { readFileSync } from 'fs';
import { join, basename } from 'path';
import { gunzipSync } from 'zlib';
import { ROOT } from '../registre-copies/dades.mjs';
import { createHeritability } from './cadena.mjs';
import { LIST } from './comu.mjs';
import { validate, pilotFacts } from './valida.mjs';

const [id, file, code] = process.argv.slice(2);
if (!id || !file || !code || process.argv.length !== 5) { console.error('usage: node curta.mjs ID FILE.jsonl.gz COMMIT'); process.exit(2); }
const readJsonl = (rel) => readFileSync(join(ROOT, rel), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const full = JSON.parse(readFileSync(join(ROOT, LIST), 'utf8'));
const list = { ...full, branches: full.branches.filter((b) => b.id === id) };
if (list.branches.length !== 1) { console.error(`curta: ${id} is not in the list`); process.exit(2); }
const L = gunzipSync(readFileSync(file)).toString().trim().split('\n').map((l) => JSON.parse(l));
const her = createHeritability();
const v = validate({ list, records: new Map([[id, L]]), files: [basename(file) === `${id}.jsonl.gz` ? basename(file) : 'not-the-name'], pilot: pilotFacts(list, readJsonl), code, her });
console.log(`The short test, ${id} (${file}): ${v.problems.length ? `${v.problems.length} problems: ${v.problems.join('; ')}` : 'valid, against the list, the pilot record and the commit'}; ${v.n} chains, their evidence tested again (${her.tests()} states).`);
const types = {}; for (const x of L) types[x.type] = (types[x.type] ?? 0) + 1;
const Z = L.at(-1);
console.log(`Lines: ${L.length} (${Object.entries(types).map(([k, n]) => `${k} ${n}`).join(', ')}).`);
console.log(`The end: ${Z.measuresChecked} measures and the final fingerprint ${Z.fingerprint}; ${Z.checkpoints} checkpoints; ${Z.replays} segments run again (${Z.replayedEpochs} epochs, ${Z.recordsChecked} records checked), ${Z.fetches} fetches, ${Z.heritabilityTests} heritability tests; ${Z.secondsRun} s for the branch, ${Z.seconds} s in all, ${Z.rssMB} MB; the file, ${readFileSync(file).length} bytes.`);
process.exit(v.problems.length ? 1 : 0);
