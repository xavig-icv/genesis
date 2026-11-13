// Exploratori (la maduració, pas 3; el README d'aquesta carpeta, escrit abans de calcular): totes les cel·les d'una captura del món 1034,
// provades amb companys inerts, i les que es copien i els positius de l'escaneig del pas 1, tornats a provar en 100 condicions.
//
//   node fase2/resultats/maduracio/durada/durada.mjs CARPETA-DEL-1034 EPOCA > durada-EPOCA.jsonl
//
// CARPETA-DEL-1034: la de les captures del món (llavor1034-mon512x256-r2-epocaE.bin). La captura ha de tenir la SHA-256 que en desa
// l'escaneig del pas 1 (../descripcio/escaneig-1034.jsonl, a git). No simula res.
//
// 1. Totes les cel·les: la prova d'autonomia de B1 (testCondition, a eines/autonomia.mjs), amb la química C0, en les 10 primeres
//    condicions de la llavor del pas 2b (3000000000).
// 2. Les cel·les que es copien en alguna de les 10 (sola o en context), i els positius de l'escaneig del pas 1: testReplicator en les 100
//    condicions del pas 2b. Les 10 primeres han de ser iguals a les del punt 1; si no, s'atura.
// 3. Una línia JSON d'inici, una per cel·la tornada a provar (cell, program, scan, i les quatre cadenes de les 100 condicions: solo,
//    context, heritableSolo i heritableContext; '1' o '0' a la posició j segons la condició j) i la final (els recomptes de les 131.072
//    cel·les a les 10 condicions, i els segons).
// No importar dins de cap fil (worker_threads): eines/autonomia.mjs hi posa el seu receptor de feines.
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { PROGRAM_SIZE, evaluator } from '../../../../fase1/bff.js';
import { conditions, checkInert, testCondition, testReplicator } from '../../../../eines/autonomia.mjs';
import { codeVersion, sha256 } from '../../../../eines/b1-comu.mjs';

export const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
export const SCAN = 'fase2/resultats/maduracio/descripcio/escaneig-1034.jsonl';
export const SEED = 3000000000;
export const SCREEN = 10;
export const CONDITIONS = 100;
export const CHEMISTRY = 'C0';
// els tres trams, fixats a la nota: de la 100 a la 1.100, de la 5.000 a la 6.000 i de la 8.000 a la 9.000, cada 100 èpoques
export const STRETCHES = { jove: [100, 1100], brot: [5000, 6000], vell: [8000, 9000] };
export const EPOCHS = Object.values(STRETCHES).flatMap(([a, b]) => Array.from({ length: (b - a) / 100 + 1 }, (_, i) => a + 100 * i));
export const KEYS = ['solo', 'context', 'heritableSolo', 'heritableContext'];
export const captureName = (epoch) => `llavor1034-mon512x256-r2-epoca${epoch}.bin`;

// La línia de l'escaneig del pas 1 d'una època
export function scanLine(root, epoch) {
  const lines = readFileSync(join(root, SCAN), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const s = lines.find((x) => x.epoch === epoch);
  if (!s) throw new Error(`l'escaneig del pas 1 no té l'època ${epoch}`);
  return s;
}

// Una captura: { counts, retested } amb la prova de les 131.072 cel·les i les cel·les tornades a provar
export function durationCapture(buf, scan, { interpret, screen, conds, onProgress = () => {} }) {
  const n = buf.length / PROGRAM_SIZE;
  const scanned = new Map(scan.list.map((x) => [x.c, x]));
  const counts = { cells: n, copy: 0, heritable: 0, copySolo: 0, copyContext: 0, heritableSolo: 0, heritableContext: 0 };
  const first = new Map();
  for (let c = 0; c < n; c++) {
    const bytes = buf.subarray(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE);
    const s = { solo: '', context: '', heritableSolo: '', heritableContext: '' };
    for (const cond of screen) {
      const r = testCondition(bytes, cond, interpret);
      for (const k of KEYS) s[k] += r[k] ? '1' : '0';
    }
    const has = (k) => s[k].includes('1');
    if (has('solo') || has('context')) {
      counts.copy++;
      first.set(c, s);
    }
    if (has('heritableSolo') || has('heritableContext')) counts.heritable++;
    if (has('solo')) counts.copySolo++;
    if (has('context')) counts.copyContext++;
    if (has('heritableSolo')) counts.heritableSolo++;
    if (has('heritableContext')) counts.heritableContext++;
    if ((c + 1) % 16384 === 0) onProgress(c + 1);
  }
  // les que es copien, i els positius de l'escaneig, en les 100 condicions
  const cells = [...new Set([...first.keys(), ...scanned.keys()])].sort((a, b) => a - b);
  const retested = cells.map((c) => {
    const bytes = Uint8Array.from(buf.subarray(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE));
    const t = testReplicator(bytes, conds, interpret);
    // les 10 primeres condicions són les de la prova de totes les cel·les: el mateix resultat
    const s = first.get(c);
    for (const k of KEYS) {
      const head = t[k].slice(0, screen.length);
      if (s ? head !== s[k] : head.includes('1')) throw new Error(`la cel·la ${c}: les ${screen.length} primeres condicions (${k}) no donen el mateix a les dues proves`);
    }
    const x = scanned.get(c);
    return {
      type: 'cell', cell: c, program: Buffer.from(bytes).toString('hex'),
      scan: x ? { solo: x.solo, context: x.context, heritable: x.heritable, heritableSolo: x.heritableSolo } : null,
      ...Object.fromEntries(KEYS.map((k) => [k, t[k]])),
    };
  });
  return { counts, retested };
}

function main(argv) {
  const [dir, epochArg] = argv, epoch = Number(epochArg);
  if (!dir || !Number.isInteger(epoch) || !EPOCHS.includes(epoch)) {
    console.error(`Ús: node fase2/resultats/maduracio/durada/durada.mjs CARPETA-DEL-1034 EPOCA > durada-EPOCA.jsonl\n(les èpoques dels tres trams: ${EPOCHS.join(' ')})`);
    process.exit(2);
  }
  const t0 = Date.now(), interpret = evaluator(CHEMISTRY);
  const conds = conditions(SEED, CONDITIONS), screen = conds.slice(0, SCREEN);
  const inert = checkInert(conds, interpret);
  if (inert.active) throw new Error(`${inert.active} parelles de companys de les condicions no són inerts`);
  const scan = scanLine(ROOT, epoch), file = captureName(epoch);
  if (scan.file !== file) throw new Error(`l'escaneig del pas 1 diu ${scan.file}, i no ${file}`);
  const buf = new Uint8Array(readFileSync(join(dir, file)));
  const hash = sha256(buf);
  if (hash !== scan.sha256) throw new Error(`${file}: la SHA-256 no és la de l'escaneig del pas 1`);
  const out = (o) => process.stdout.write(JSON.stringify(o) + '\n');
  out({
    type: 'start', code: codeVersion(ROOT), node: process.version, epoch, file, sha256: hash,
    scanRecord: SCAN, scanRecordSha256: sha256(readFileSync(join(ROOT, SCAN))), scanSeed: scan.seed,
    chemistry: CHEMISTRY, seed: SEED, screen: SCREEN, conditions: CONDITIONS, inertCheck: inert, date: new Date().toISOString(),
  });
  const { counts, retested } = durationCapture(buf, scan, {
    interpret, screen, conds,
    onProgress: (k) => console.error(`època ${epoch}: ${k} de ${buf.length / PROGRAM_SIZE} cel·les (${((Date.now() - t0) / 1000).toFixed(0)} s)`),
  });
  for (const r of retested) out(r);
  out({ type: 'end', epoch, ...counts, scanPositives: scan.list.length, retested: retested.length, seconds: Math.round((Date.now() - t0) / 1000) });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main(process.argv.slice(2));
