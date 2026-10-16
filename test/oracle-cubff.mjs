// L'intèrpret coincideix amb cubff, l'implementació original de l'article (AU2-12 de l'auditoria
// externa 2). Executa: node test/oracle-cubff.mjs
//
// test/fixtures/cubff-oracle.bin són els resultats de cubff (commit f212e84, compilat sense CUDA, amb
// eines/cubff/oracle.cc) sobre un corpus de 10.000 cintes que es genera sempre igual: per a cada cinta,
// l'FNV-1a de la cinta final i el nombre d'operacions. Aquesta prova regenera el corpus, l'executa amb
// fase1/bff.js i compara cinta per cinta. Com es va obtenir, i la comparació amb 200.000 cintes, és a
// eines/cubff/README.md.
import assert from 'assert';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { evaluate } from '../fase1/bff.js';
import { corpus, fnv, KINDS } from '../eines/cubff/compara.mjs';

const expected = readFileSync(fileURLToPath(new URL('fixtures/cubff-oracle.bin', import.meta.url)));
const tapes = corpus(2500);
assert.strictEqual(expected.length, tapes.length * 8);

let failed = 0;
const byKind = KINDS.map(() => 0);
tapes.forEach(({ kind, tape }, i) => {
  const t = tape.slice();
  const ops = evaluate(t, 0);
  if (fnv(t) !== expected.readUInt32LE(i * 8) || ops !== expected.readUInt32LE(i * 8 + 4)) {
    if (failed < 5) console.log(`  FALLA cinta ${i} (${KINDS[kind]}): operacions ${ops}, cubff ${expected.readUInt32LE(i * 8 + 4)}`);
    failed++;
  } else byKind[kind]++;
});
KINDS.forEach((k, i) => console.log(`  ${failed ? '    ' : 'ok  '} ${k}: ${byKind[i]} de 2500 cintes iguals que a cubff`));
console.log(failed ? `\n${failed} cintes diferents` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
