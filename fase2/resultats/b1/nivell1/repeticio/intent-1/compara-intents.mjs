// Els dos intents de la repetició del nivell 1 de B1: cada registre del primer ha de ser igual al del segon, línia a línia, llevat
// del camp `code` de la línia d'inici i del camp `seconds` de la final. No escriu cap recompte.
//   node compara-intents.mjs CARPETA-INTENT-1 CARPETA-INTENT-2
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const [a, b] = process.argv.slice(2);
const files = readdirSync(b).filter((f) => f.endsWith('.jsonl')).sort();
const firstFiles = readdirSync(a).filter((f) => f.endsWith('.jsonl')).sort();
if (JSON.stringify(files) !== JSON.stringify(firstFiles)) { console.log('els dos intents no tenen els mateixos registres'); process.exit(1); }
const strip = (line, key) => { const o = JSON.parse(line); delete o[key]; return JSON.stringify(o); };
let same = 0;
const codes = new Set();
for (const f of files) {
  const la = readFileSync(join(a, f), 'utf8').split('\n'), lb = readFileSync(join(b, f), 'utf8').split('\n');
  const n = la.length;
  let ok = n === lb.length && n >= 3 && la[n - 1] === '' && lb[n - 1] === '';
  if (ok) {
    codes.add(`${JSON.parse(la[0]).code} → ${JSON.parse(lb[0]).code}`);
    ok = strip(la[0], 'code') === strip(lb[0], 'code') && strip(la[n - 2], 'seconds') === strip(lb[n - 2], 'seconds');
    for (let i = 1; ok && i < n - 2; i++) ok = la[i] === lb[i];
  }
  if (ok) same++;
  else console.log(`${f}: diferent`);
}
console.log(`el camp code: ${[...codes].join('; ')}`);
console.log(`${same} de ${files.length} iguals, llevat de code i seconds`);
process.exit(same === files.length ? 0 : 1);
