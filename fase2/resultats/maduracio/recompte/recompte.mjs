// Exploratori (la maduració, pas 2b; el README d'aquesta carpeta, escrit abans de calcular): les cel·les que es repliquen de les tres
// sopes de partida de la sèrie de la maduració (la nova, l'envellida i la barrejada), tornades a provar amb companys inerts.
//
//   node fase2/resultats/maduracio/recompte/recompte.mjs CARPETA-AMB-LES-CAPTURES DE FINS > recompte-DE-FINS.jsonl
//
// CARPETA-AMB-LES-CAPTURES: l'arrel d'una còpia del repositori amb les captures de la sèrie (fase2/resultats/maduracio/serie/alicuotes/).
// El manifest i el codi són els d'aquesta còpia. Els mons: els inclosos del manifest, en el seu ordre, del DE al FINS (sense el FINS).
//
// Per a cada sopa: l'escaneig de la preparació, de nou (scanCells d'eines/transforma.mjs, amb la mateixa llavor, amplada i radi), desant
// quines cel·les donen positiu; si els tres recomptes no són els del manifest, s'atura. Després, cada positiu amb la prova d'autonomia de
// B1 (eines/autonomia.mjs): la química C0, 100 condicions de companys inerts i la llavor 3000000000. Una línia JSON per sopa.
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { PROGRAM_SIZE, evaluator } from '../../../../fase1/bff.js';
import { makeRng } from '../../../../fase1/soup.js';
import { replicationTest } from '../../../../fase2/replication.js';
import { conditions, testReplicator } from '../../../../eines/autonomia.mjs';
import { TRANSFORM_OFFSET, COMMON } from '../../../../eines/pilot.mjs';
import { codeVersion, sha256 } from '../../../../eines/b1-comu.mjs';

export const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
export const MANIFEST = 'fase2/resultats/maduracio/serie/manifest.json';
export const ARMS = ['continue', 'shuffle-all', 'reinit'];
export const SEED = 3000000000;
export const CONDITIONS = 100;
export const CHEMISTRY = 'C0';

const seedOf = (world) => Number(String(world).replace(/^[AB]/, ''));

// L'escaneig de scanCells (eines/transforma.mjs), cel·la a cel·la i amb el mateix atzar, desant els positius
export function scanPositions(soup, seed, { width, radius }) {
  const rng = makeRng(seed, 'v2'), n = soup.length / PROGRAM_SIZE, positives = [];
  let replicating = 0, heritable = 0, heritableSolo = 0;
  for (let c = 0; c < n; c++) {
    const r = replicationTest(soup, c, rng, { width, radius, complete: true, heredity: true });
    if (r.solo || r.context) replicating++;
    if (r.heritable) heritable++;
    if (r.heritableSolo) heritableSolo++;
    if (r.solo || r.context || r.heritable) positives.push({ cell: c, solo: !!r.solo, context: !!r.context, heritable: !!r.heritable, heritableSolo: !!r.heritableSolo });
  }
  return { cells: n, replicating, heritable, heritableSolo, positives };
}

const ones = (s) => [...s].filter((ch) => ch === '1').length;

// Una sopa: { world, arm, file, sha256, seed, width, radius, cells, replicating, heritable, heritableSolo, positives }. Cada positiu, en
// una llista compacta: [cel·la, escaneig (solo, context, heritable, heritableSolo, com a 0 i 1), i, de les 100 condicions, en quantes es
// copia sol, en context, és hereditari sol i en context]
export function recountSoup(root, world, arm, entry, { interpret, conds }) {
  const file = entry.file, buf = new Uint8Array(readFileSync(join(root, file)));
  const hash = sha256(buf);
  if (hash !== entry.sha256) throw new Error(`${world} ${arm}: la captura no té la SHA-256 del manifest`);
  const width = COMMON.world[0], radius = COMMON.radius, seed = seedOf(world) + TRANSFORM_OFFSET;
  const s = scanPositions(buf, seed, { width, radius });
  for (const k of ['cells', 'replicating', 'heritable', 'heritableSolo']) {
    if (s[k] !== entry.scan[k]) throw new Error(`${world} ${arm}: l'escaneig no dona el ${k} del manifest (${s[k]} i ${entry.scan[k]})`);
  }
  const positives = s.positives.map((p) => {
    const bytes = Uint8Array.from(buf.subarray(p.cell * PROGRAM_SIZE, (p.cell + 1) * PROGRAM_SIZE));
    const t = testReplicator(bytes, conds, interpret);
    return [p.cell, +p.solo, +p.context, +p.heritable, +p.heritableSolo, ones(t.solo), ones(t.context), ones(t.heritableSolo), ones(t.heritableContext)];
  });
  return { type: 'soup', world, arm, file, sha256: hash, seed, width, radius, cells: s.cells, replicating: s.replicating, heritable: s.heritable, heritableSolo: s.heritableSolo, positives };
}

export function includedWorlds(root) {
  const manifest = JSON.parse(readFileSync(join(root, MANIFEST), 'utf8'));
  return manifest.worlds.filter((w) => w.included);
}

function main(argv) {
  const [captures, from, to] = argv;
  const a = Number(from), b = Number(to);
  if (!captures || !Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b <= a) {
    console.error('Ús: node fase2/resultats/maduracio/recompte/recompte.mjs CARPETA-AMB-LES-CAPTURES DE FINS > recompte-DE-FINS.jsonl');
    process.exit(2);
  }
  const worlds = includedWorlds(ROOT);
  if (b > worlds.length) { console.error(`només hi ha ${worlds.length} mons inclosos`); process.exit(2); }
  const interpret = evaluator(CHEMISTRY), conds = conditions(SEED, CONDITIONS);
  const out = (o) => process.stdout.write(JSON.stringify(o) + '\n');
  out({ type: 'start', code: codeVersion(ROOT), node: process.version, manifest: MANIFEST, manifestSha256: sha256(readFileSync(join(ROOT, MANIFEST))), from: a, to: b, arms: ARMS, chemistry: CHEMISTRY, seed: SEED, conditions: CONDITIONS, date: new Date().toISOString() });
  let soups = 0;
  for (const w of worlds.slice(a, b)) {
    for (const arm of ARMS) {
      const t0 = Date.now();
      out(recountSoup(captures, w.world, arm, w.arms[arm], { interpret, conds }));
      soups++;
      console.error(`${w.world} ${arm}: ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
  }
  out({ type: 'end', soups });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main(process.argv.slice(2));
