// A measure of descent by position (exploratory; the note, README.md): the short test's check of one record. It validates the record with
// valida.mjs (the list narrowed to its branch) and prints only counts: the line types, the measures and the fingerprint checked, the time
// and the memory. No score and no class.
//
//   node fase2/resultats/arrelament/descendencia/prova/curta.mjs ID FILE
import { readFileSync } from 'fs';
import { join } from 'path';
import { ROOT } from '../../registre-copies/dades.mjs';
import { validate, pilotFacts } from '../valida.mjs';

const [ID, FILE] = process.argv.slice(2);
if (!ID || !FILE) { console.error('usage: node curta.mjs ID FILE'); process.exit(2); }
const full = JSON.parse(readFileSync(join(ROOT, 'fase2/resultats/arrelament/registre-copies/llista.json'), 'utf8'));
const list = { ...full, branches: full.branches.filter((b) => b.id === ID) };
if (!list.branches.length) { console.error(`${ID} is not in the list`); process.exit(2); }
const readJsonl = (f) => readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const pilot = pilotFacts(list, (rel) => readJsonl(join(ROOT, rel)));
const L = readJsonl(FILE);
const v = validate({ list, records: new Map([[ID, L]]), pilot });
const types = {}; for (const l of L) types[l.type] = (types[l.type] ?? 0) + 1;
const E = L.at(-1);
console.log(`${ID}: lines ${L.length}, types ${JSON.stringify(types)}; the validation, ${v.problems.length ? `${v.problems.length} problems: ${v.problems.join('; ')}` : 'no problem'}; measures checked ${E.measuresChecked}, invariant checks ${E.invariantChecks}, the final fingerprint ${E.fingerprint === pilot.get(ID).fingerprint ? 'the pilot\'s' : 'NOT the pilot\'s'}; ${E.seconds} s, ${E.rssMB} MB`);
process.exitCode = v.problems.length ? 1 : 0;
