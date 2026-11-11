// Exploratori (la maduració, pas 1; afegit després de veure l'escaneig del 1034, no era a la nota): les cel·les hereditàries de
// l'escaneig, tornades a provar 200 vegades cadascuna amb llavors noves (900.000 a 900.199, que no són de cap pla). Totes les soles (fora
// del brot de les èpoques 5.200 a 5.400) i una de cada quatre del brot. Una hereditària de debò s'ha de tornar a replicar; si la còpia la
// va fer el company de soroll, no. Només la prova del projecte (fase2/replication.js): no simula res.
//   node reprova-hereditaries.mjs CARPETA-DEL-1034 > reprova-hereditaries-sortida.txt
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { replicationTest } from '../../../replication.js';
import { makeRng } from '../../../../fase1/soup.js';

const dir = process.argv[2];
if (!dir) { console.error('Ús: node reprova-hereditaries.mjs CARPETA-DEL-1034'); process.exit(2); }
const here = dirname(fileURLToPath(import.meta.url)), N = 200, OPS = '<>{}-+.,[]';
const scans = readFileSync(join(here, 'escaneig-1034.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const ops = (hex) => [...Buffer.from(hex, 'hex')].map((b) => String.fromCharCode(b)).filter((c) => OPS.includes(c)).join('');
const outbreak = (e) => e >= 5200 && e <= 5400;
function retest(soup, c) {
  let solo = 0, heritable = 0;
  for (let k = 0; k < N; k++) {
    const r = replicationTest(soup, c, makeRng(900000 + k, 'v2'), { width: 512, radius: 2, complete: true, heredity: true });
    if (r.solo) solo++;
    if (r.heritableSolo) heritable++;
  }
  return { solo, heritable };
}
console.log(`LES HEREDITÀRIES DE L'ESCANEIG DEL 1034, TORNADES A PROVAR ${N} VEGADES (llavors de 900.000 a ${900000 + N - 1})`);
console.log("\n1. Les soles (fora del brot): època, cel·la, instruccions del programa; en quantes proves es replica sola i en quantes és hereditària sola");
const soles = [];
for (const s of scans.filter((x) => !outbreak(x.epoch) && x.heritable > 0)) {
  const soup = new Uint8Array(readFileSync(join(dir, s.file)));
  for (const x of s.list.filter((y) => y.heritable)) {
    const r = retest(soup, x.c);
    soles.push(r);
    console.log(`   ${String(s.epoch).padStart(5)}, ${String(x.c).padStart(6)}, ${ops(x.program).padEnd(14)}: ${r.solo} i ${r.heritable}`);
  }
}
console.log(`   ${soles.length} cel·les; amb alguna prova hereditària: ${soles.filter((r) => r.heritable > 0).length}`);
console.log('\n2. El brot (una de cada quatre hereditàries de les captures 5.200, 5.300 i 5.400)');
const brot = [];
for (const s of scans.filter((x) => outbreak(x.epoch))) {
  const soup = new Uint8Array(readFileSync(join(dir, s.file)));
  s.list.filter((y) => y.heritable).filter((_, i) => i % 4 === 0).forEach((x) => brot.push(retest(soup, x.c)));
}
const min = (k) => Math.min(...brot.map((r) => r[k])), max = (k) => Math.max(...brot.map((r) => r[k]));
console.log(`   ${brot.length} cel·les; es replica sola, de ${min('solo')} a ${max('solo')} de ${N}; hereditària sola, de ${min('heritable')} a ${max('heritable')} de ${N}`);
