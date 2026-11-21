// Les famílies naturals seguides com els plantats (exploratori; la nota, README.md): la comprovació de punta a punta d'una branca.
//
//   node fase2/resultats/arrelament/llinatges/compara.mjs ID
//
// El registre nou (simulacio/ID.jsonl) ha de tenir les mateixes línies que el de git (pilot/part-b/ID.jsonl): els censos v3, els censos
// inerts, el llinatge del seguiment, l'establiment i les mesures (sense els segons), i la mateixa línia final (sense els segons). La línia
// d'inici només canvia en l'ordre (--json, --save i --save-every) i en el commit. Surt amb el codi 0 si tot hi coincideix, i 1 si no.
import { join } from 'path';
import { ROOT, PILOT, AQUI, readJsonl } from './comu.mjs';

const id = process.argv[2];
if (!id || process.argv.length !== 3) { console.error('ús: node compara.mjs ID'); process.exit(2); }
const a = readJsonl(join(ROOT, PILOT, 'part-b', `${id}.jsonl`));
const b = readJsonl(join(ROOT, AQUI, 'simulacio', `${id}.jsonl`));
const sense = (l, ...keys) => JSON.stringify(Object.fromEntries(Object.entries(l).filter(([k]) => !keys.includes(k))));
const clau = (l) => (l.type === 'measure' || l.type === 'end' ? sense(l, 'seconds') : JSON.stringify(l));
const problemes = [];
if (a.length !== b.length) problemes.push(`${a.length} línies a git i ${b.length} al registre nou`);
const ia = a[0], ib = b[0];
if (ia.type !== 'start' || ib.type !== 'start') problemes.push('la primera línia no és la d\'inici');
const ordre = (c) => c.replace(/ --json \S+/, '').replace(/ --save \S+/, '').replace(/ --save-every \d+/, '');
if (ordre(ia.command) !== ordre(ib.command)) problemes.push('l\'ordre no és la mateixa, llevat de --json, --save i --save-every');
if (sense(ia, 'code', 'command') !== sense(ib, 'code', 'command')) problemes.push('la línia d\'inici canvia en alguna cosa més que el commit i l\'ordre');
for (let i = 1; i < Math.min(a.length, b.length); i++) {
  if (clau(a[i]) !== clau(b[i])) { problemes.push(`la línia ${i + 1} (${a[i].type}, època ${a[i].epoch}) no hi coincideix`); if (problemes.length > 5) break; }
}
const per = {};
for (const l of a.slice(1)) per[l.type] = (per[l.type] ?? 0) + 1;
if (problemes.length) { console.log(`${id}: NO hi coincideix\n- ${problemes.join('\n- ')}`); process.exit(1); }
console.log(`${id}: hi coincideix, ${a.length} línies (${Object.entries(per).map(([k, v]) => `${k} ${v}`).join(', ')}); l'empremta, ${a.at(-1).fingerprint}`);
