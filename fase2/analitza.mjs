// Anàlisi d'una captura del món o de la sopa (.bin): hi ha vida? de quin tipus?
//
// Ús: node fase2/analitza.mjs fitxer.bin [mostra] [amplada] [radi]
//   mostra   cel·les que es posen a prova (per defecte 4000)
//   amplada  amplada del món; per defecte es llegeix del nom del fitxer (…mon512x256…).
//            0 vol dir sopa barrejada (els companys en context són cel·les qualssevol).
//   radi     radi d'interacció del món (per defecte, el del nom del fitxer, …-r2…, o 2)
//
// 1. Prova de replicació (fase2/replication.js, la mateixa que fa servir el registre de famílies)
//    sobre una mostra de cel·les: sol (primer, amb un company de soroll) i en context (segon, amb un
//    veí que encara no porta cap tros seu). Les que es repliquen es tornen a provar amb la prova de
//    segona generació (la còpia també es copia?), amb un generador a part: així la mostra i les xifres
//    de replicació són les mateixes que abans de la iteració 3.
// 2. El que veu el registre de famílies.
import { readFileSync, existsSync } from 'fs';
import { KIND, PROGRAM_SIZE } from '../fase1/bff.js';
import { createRng, makeRng, shannonEntropy } from '../fase1/soup.js';
import { replicationTest } from './replication.js';
import { createFamilyTracker } from './families.js';

const [file, sampleArg, widthArg, radiusArg] = process.argv.slice(2);
if (!file || file === '--help' || !existsSync(file)) {
  console.error(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).slice(0, 7)
    .map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  if (file && file !== '--help') console.error(`\nError: no trobo el fitxer ${file}`);
  process.exit(file === '--help' ? 0 : 2);
}
const sampleSize = Number(sampleArg ?? 4000);
const soup = new Uint8Array(readFileSync(file));
const n = soup.length / PROGRAM_SIZE;
const width = Number(widthArg ?? (file.match(/mon(\d+)x\d+/)?.[1] ?? 0));
const radius = Number(radiusArg ?? (file.match(/-r(\d+)/)?.[1] ?? 2));
const rng = createRng(17);
const show = (b) => Array.from(b, (v) => (KIND[v] ? String.fromCharCode(v) : v === 0 ? '0' : '·')).join('');
const where = (c) => (width ? `(${c % width},${Math.floor(c / width)})` : `núm. ${c}`);

console.log(`${file}\n${width ? `món de ${width} d'amplada, radi ${radius}` : 'sopa barrejada'} · entropia de Shannon: ${shannonEntropy(soup).toFixed(3)} bits`);
const counts = new Float64Array(256);
for (const v of soup) counts[v]++;
console.log('bytes més freqüents:', [...counts.keys()].sort((a, b) => counts[b] - counts[a]).slice(0, 5)
  .map((v) => `${KIND[v] ? String.fromCharCode(v) : v === 0 ? '0' : '#' + v}:${(counts[v] / soup.length * 100).toFixed(1)}%`).join(' '));

let solo = 0, context = 0, any = 0, heritable = 0;
const examples = [];
const heredityRng = makeRng(18, 'v2');
for (let k = 0; k < sampleSize; k++) {
  const c = (rng() * n) | 0;
  const r = replicationTest(soup, c, rng, { width, radius });
  if (r.solo) solo++;
  if (r.context) context++;
  if (r.solo || r.context) {
    any++;
    if (replicationTest(soup, c, heredityRng, { width, radius, heredity: true }).heritable) heritable++;
    if (examples.length < 4) examples.push(`${r.solo ? 'sol     ' : 'context '} ${where(c)} |${show(soup.subarray(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE))}|`);
  }
}
const pct = (x) => `${(x / sampleSize * 100).toFixed(1)}%`;
console.log(`\nreplicadors a la mostra de ${sampleSize}: ${pct(any)} (sols ${pct(solo)}, en context ${pct(context)})`);
console.log(`hereditaris (la còpia també es copia): ${pct(heritable)}`);
for (const e of examples) console.log('  ' + e);

const t0 = Date.now();
const fam = createFamilyTracker().analyse(soup, n, 0, width, radius);
console.log(`\nregistre de famílies: ${fam.families.length} famílies, ${(fam.alive * 100).toFixed(1)} % de la mostra es replica (${Date.now() - t0} ms)`);
for (const f of fam.families) console.log(`  família ${f.id}: ${(f.share * 100).toFixed(1)} % del mapa · nucli ${f.core} · exemple |${show(f.example)}|`);
