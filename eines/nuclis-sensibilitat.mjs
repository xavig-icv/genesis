// La sensibilitat del registre de famílies al criteri dels trossos informatius (AUD-162, AU2-134). Exploratòria: el pla,
// escrit abans de calcular, és a fase2/resultats/nuclis/pla.md. No simula res: torna a fer córrer el registre de famílies
// (fase2/families.js) sobre captures que ja existeixen, amb minDistinct 1 (el d'ara), 2 i 3, i compara les famílies i el
// territori. No llegeix res de la sèrie de la maduració.
//
//   node eines/nuclis-sensibilitat.mjs clau [--arrel CARPETA] --sortida FITXER.json
//       Les captures de docs/captures.sha256, una per una, cadascuna amb un registre nou, comprovades abans amb la seva
//       SHA-256. --arrel diu on són (per defecte, l'arrel del repositori).
//   node eines/nuclis-sensibilitat.mjs mon --fitxa CARPETA/fitxa.json --captures CARPETA --sortida FITXER.json
//       La història d'un món del lloc web, en l'ordre de les seves èpoques i amb un sol registre per a tota la història,
//       com eines/web-dades.mjs. Cada captura es comprova amb la SHA-256 de mon.json, al costat de la fitxa.
//
// Escriu el JSON i, al costat, un CSV amb una fila per captura i valor. Mai no sobreescriu cap fitxer.
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createFamilyTracker, compactCode } from '../fase2/families.js';
import { PROGRAM_SIZE } from '../fase1/bff.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const VARIANTS = [1, 2, 3];
const USAGE = 'Ús: node eines/nuclis-sensibilitat.mjs clau [--arrel CARPETA] --sortida FITXER.json\n' +
  '     node eines/nuclis-sensibilitat.mjs mon --fitxa CARPETA/fitxa.json --captures CARPETA --sortida FITXER.json';
const fail = (msg, code = 2) => { console.error(`Error: ${msg}\n${USAGE}`); process.exit(code); };
const sha256 = (b) => createHash('sha256').update(b).digest('hex');

// El codi que fa el càlcul: el commit (amb +canvis si n'hi ha cap sense desar, a tot el repositori) i la SHA-256 del registre
function codeVersion() {
  const run = (cmd) => execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  try { return run('git rev-parse --short HEAD') + (run('git status --porcelain --untracked-files=no') ? '+canvis' : ''); } catch { return 'desconeguda'; }
}

const args = process.argv.slice(2), mode = args.shift();
if (mode !== 'clau' && mode !== 'mon') fail(`mode desconegut: ${mode ?? '(cap)'}`);
const opt = {};
const allowed = mode === 'clau' ? ['--arrel', '--sortida'] : ['--fitxa', '--captures', '--sortida'];
for (let i = 0; i < args.length; i += 2) {
  if (!allowed.includes(args[i])) fail(`opció desconeguda per al mode ${mode}: ${args[i]}`);
  if (args[i] in opt) fail(`opció repetida: ${args[i]}`);
  if (args[i + 1] === undefined) fail(`falta el valor de ${args[i]}`);
  opt[args[i]] = args[i + 1];
}
for (const a of allowed) if (a !== '--arrel' && !(a in opt)) fail(`falta ${a}`);
const out = resolve(opt['--sortida']), csvOut = out.replace(/\.json$/, '') + '.csv';
if (!out.endsWith('.json')) fail('la sortida ha de ser un .json');
for (const f of [out, csvOut]) if (existsSync(f)) fail(`${f} ja existeix: l'eina no sobreescriu res`, 1);

// Les cel·les amb una tirada d'una sola instrucció (6 iguals seguides al codi compacte), una vegada per captura
const RUN = /(.)\1{5}/;
function runCells(soup, n) {
  const cells = new Uint8Array(n);
  let count = 0;
  for (let c = 0; c < n; c++) if (RUN.test(compactCode(soup, c))) { cells[c] = 1; count++; }
  return { cells, count };
}

// Una captura, amb els tres valors: les famílies, el territori i la comparació amb el d'ara (minDistinct 1)
function compare(results, soup, n) {
  const runs = runCells(soup, n), base = results[1];
  const colored = (m) => { let k = 0; for (let c = 0; c < n; c++) if (m[c]) k++; return k; };
  const entry = { runCells: runs.count, variants: {} };
  for (const v of VARIANTS) {
    const r = results[v];
    let lost = 0, gained = 0, runColored = 0;
    for (let c = 0; c < n; c++) {
      if (base.map[c] && !r.map[c]) lost++;
      if (!base.map[c] && r.map[c]) gained++;
      if (runs.cells[c] && r.map[c]) runColored++;
    }
    // cada família del d'ara, aparellada amb la d'aquest valor amb què comparteix més cel·les (Jaccard de les cel·les)
    const sizeA = new Map(), sizeB = new Map(), both = new Map();
    for (let c = 0; c < n; c++) {
      const a = base.map[c], b = r.map[c];
      if (a) sizeA.set(a, (sizeA.get(a) ?? 0) + 1);
      if (b) sizeB.set(b, (sizeB.get(b) ?? 0) + 1);
      if (a && b) { const k = `${a},${b}`; both.set(k, (both.get(k) ?? 0) + 1); }
    }
    const pairs = base.families.map((f, i) => {
      let best = null;
      for (let j = 0; j < r.families.length; j++) {
        const inter = both.get(`${i + 1},${j + 1}`) ?? 0, union = (sizeA.get(i + 1) ?? 0) + (sizeB.get(j + 1) ?? 0) - inter;
        const jac = union ? inter / union : 0;
        if (!best || jac > best.jaccard) best = { id: r.families[j].id, jaccard: Math.round(jac * 1e4) / 1e4 };
      }
      return { id: f.id, amb: best && best.jaccard > 0 ? best : null };
    });
    entry.variants[v] = {
      alive: r.alive, colored: colored(r.map), lost, gained, runColored,
      families: r.families.map((f) => ({ id: f.id, born: f.born, core: f.core, share: Math.round(f.share * 1e6) / 1e6, distinct: new Set(f.core).size })),
      ...(v === 1 ? {} : { pairs }),
    };
  }
  // la mostra i els replicadors són els mateixos amb tots tres valors (l'opció no toca el generador aleatori)
  for (const v of VARIANTS) if (results[v].alive !== base.alive) throw new Error(`la fracció de replicadors canvia amb minDistinct ${v}: no hauria de canviar`);
  return entry;
}

const entries = [];
let set;
if (mode === 'clau') {
  const root = resolve(opt['--arrel'] ?? ROOT);
  const list = readFileSync(join(ROOT, 'docs', 'captures.sha256'), 'utf8').trim().split('\n').map((l) => { const [h, f] = l.trim().split(/\s+\*?/); return { sha: h, file: f.replace(/^\*/, '') }; });
  if (list.some((x) => /maduracio/.test(x.file))) fail('la llista porta captures de la sèrie de la maduració: no se\'n llegeix cap');
  set = { conjunt: 'docs/captures.sha256', arrel: root === ROOT ? '.' : 'una altra còpia', captures: list.length };
  list.forEach(({ sha, file }, k) => {
    const raw = readFileSync(join(root, file));
    if (sha256(raw) !== sha) fail(`${file} no té la SHA-256 de docs/captures.sha256`, 1);
    const soup = new Uint8Array(raw.buffer, raw.byteOffset, raw.length), n = soup.length / PROGRAM_SIZE;
    const m = file.match(/mon(\d+)x(\d+)/), width = m ? Number(m[1]) : 0, radius = Number(file.match(/-r(\d+)-/)?.[1] ?? 2);
    if (m && Number(m[1]) * Number(m[2]) !== n) fail(`${file} no té la mida del seu nom`, 1);
    const results = {};
    for (const v of VARIANTS) results[v] = createFamilyTracker(undefined, { minDistinct: v }).analyse(soup, n, 0, width, radius);
    entries.push({ captura: file, width, radius, n, ...compare(results, soup, n) });
    process.stdout.write(`  ${k + 1}/${list.length} ${file}\n`);
  });
} else {
  const fitxaPath = resolve(opt['--fitxa']), fitxa = JSON.parse(readFileSync(fitxaPath, 'utf8'));
  const mon = JSON.parse(readFileSync(join(dirname(fitxaPath), 'mon.json'), 'utf8'));
  if (/maduracio/.test(`${fitxa.serie ?? ''} ${opt['--captures']}`)) fail('és un món de la sèrie de la maduració: no se\'n llegeix cap');
  const [W, H] = fitxa.mida, n = W * H;
  set = { conjunt: `el món ${fitxa.id} del lloc web`, ordre: fitxa.ordre, fotogrames: mon.fonts.length };
  const trackers = Object.fromEntries(VARIANTS.map((v) => [v, createFamilyTracker(undefined, { minDistinct: v })]));
  mon.fonts.forEach(({ e, captura, sha256: expected }, k) => {
    const raw = readFileSync(join(resolve(opt['--captures']), captura));
    if (sha256(raw) !== expected) fail(`${captura} no té la SHA-256 de mon.json: no és la mateixa història`, 1);
    const soup = new Uint8Array(raw.buffer, raw.byteOffset, raw.length);
    if (soup.length !== n * PROGRAM_SIZE) fail(`${captura} no té la mida del món`, 1);
    const results = {};
    for (const v of VARIANTS) results[v] = trackers[v].analyse(soup, n, e, W);
    entries.push({ epoca: e, ...compare(results, soup, n) });
    if (k % 10 === 0) process.stdout.write(`  ${k + 1}/${mon.fonts.length} època ${e}\n`);
  });
}

const doc = {
  eina: 'eines/nuclis-sensibilitat.mjs', codi: codeVersion(), registre: { fitxer: 'fase2/families.js', sha256: sha256(readFileSync(join(ROOT, 'fase2', 'families.js'))) },
  node: process.version, data: new Date().toISOString(), valors: VARIANTS, ...set, entrades: entries,
};
const rows = [['entrada', 'minDistinct', 'families', 'colorejades', 'perdudes', 'guanyades', 'cel_les_amb_tirada', 'tirada_colorejades', 'nucli_menys_diferent', 'replicadors_mostra']];
for (const x of entries) for (const v of VARIANTS) {
  const r = x.variants[v];
  rows.push([x.captura ?? x.epoca, v, r.families.length, r.colored, r.lost, r.gained, x.runCells, r.runColored, r.families.length ? Math.min(...r.families.map((f) => f.distinct)) : '', r.alive]);
}
writeFileSync(out, JSON.stringify(doc, null, 1) + '\n', { flag: 'wx' });
writeFileSync(csvOut, rows.map((r) => r.join(',')).join('\n') + '\n', { flag: 'wx' });
console.log(`${out}: ${entries.length} entrades, amb minDistinct ${VARIANTS.join(', ')}`);
