// Les dades de l'explorador 3D del lloc web (web/): els fotogrames d'un món, a partir de les captures (.bin) d'una
// execució amb --save-every. No hi ha cap mesura nova: la família de cada cel·la surt del registre de famílies
// (fase2/families.js) i l'alçada, del nombre d'instruccions de la cel·la, com a les imatges del README
// (eines/imatges.mjs). Sense dependències.
//
//   node eines/web-dades.mjs web/dades/ID/fitxa.json carpeta-de-captures
//
// La fitxa, escrita a mà, diu quin món és i per què es mostra (vegeu web/dades/README.md). L'eina hi escriu, al
// costat:
//   mon.json       la fitxa, amb els fotogrames, les famílies, la procedència de cada captura i les SHA-256
//   mapes.z        per a cada fotograma, la família de cada cel·la (l'índex a la llista del fotograma, 0 = cap) i el
//                  seu nombre d'instruccions (de 0 a 64): 2 bytes per cel·la, comprimits amb zlib
//   codi/E.z       el codi de l'època E: la classe de cada byte (0 = dada, 1 = zero, 2 a 11 = les instruccions
//                  <>{}-+.,[] en aquest ordre), comprimit amb zlib
// Abans de res, l'eina comprova que la història sigui la del registre, i si no ho és, no escriu res:
//   "comprova"   les captures que porten SHA-256 (de docs/captures.sha256), comparades amb les de la carpeta;
//   "registre"   els censos del JSONL de l'execució (--json, a la carpeta de les captures), comparats amb els del
//                registre de la sèrie, i l'empremta final si totes dues acaben a la mateixa època.
// "epoques" i "codi" són un tram ({ des, fins, cada }) o una llista de trams. Mai no sobreescriu cap fitxer.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';
import { deflateSync } from 'zlib';
import { dirname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';
import { PROGRAM_SIZE, KIND, OPCODES } from '../fase1/bff.js';
import { createFamilyTracker } from '../fase2/families.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
// Els colors de les famílies, sobre el fons fosc del lloc. La primera és el rosa de la primera família del README
export const PALETTE = ['#ff4f9a', '#a98bff', '#ffcf4a', '#3fd6ff', '#ff7a59', '#b8f04a', '#e35cff', '#4ff0c8',
  '#ff9bd2', '#7fb2ff', '#ffa62b', '#9ff5a6'];
// La classe de cada valor de byte: 0 dada, 1 zero, 2 + la posició a OPCODES
export const CLASS = new Uint8Array(256);
CLASS[0] = 1;
for (let i = 0; i < OPCODES.length; i++) CLASS[OPCODES.charCodeAt(i)] = 2 + i;

const sha256 = (b) => createHash('sha256').update(b).digest('hex');
function fail(message) { console.error(`Error: ${message}`); process.exit(1); }

// Els noms de les captures d'una execució: el patró de la fitxa, amb {e} per l'època
const captureName = (pattern, e) => pattern.replace('{e}', String(e));
const range1 = ({ des, fins, cada }) => { const out = []; for (let e = des; e <= fins; e += cada) out.push(e); return out; };
const range = (r) => [...new Set((Array.isArray(r) ? r : [r]).flatMap(range1))].sort((a, b) => a - b);
const jsonl = (f) => readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l));

// Els censos de l'execució han de ser exactament els del registre de la sèrie, fins on arriben tots dos, i l'empremta
// final, la mateixa si acaben a la mateixa època. Retorna què s'ha comparat
function checkRecord(reg, captures) {
  const serie = jsonl(resolve(ROOT, reg.serie)), run = jsonl(join(captures, reg.execucio));
  const end = (r) => r.find((x) => x.type === 'end'), cens = (r) => new Map(r.filter((x) => x.type === 'census').map((x) => [x.epoch, JSON.stringify(x)]));
  const a = cens(serie), b = cens(run), last = Math.min(Math.max(...a.keys()), Math.max(...b.keys()));
  let n = 0;
  for (const [e, line] of a) {
    if (e > last) continue;
    if (b.get(e) !== line) fail(`el cens de l'època ${e} no és el de ${reg.serie}: no és la mateixa història`);
    n++;
  }
  if (!n) fail(`cap cens per comparar amb ${reg.serie}`);
  const ea = end(serie), eb = end(run);
  let fingerprint = false;
  if (ea && eb && ea.epoch === eb.epoch) {
    if (ea.fingerprint !== eb.fingerprint) fail(`l'empremta final (època ${ea.epoch}) no és la de ${reg.serie}`);
    fingerprint = true;
  }
  return { censos: n, fins: last, empremta: fingerprint ? ea.fingerprint : null };
}

export function build(fitxaPath, captures) {
  const dir = dirname(fitxaPath), fitxa = JSON.parse(readFileSync(fitxaPath, 'utf8'));
  const [W, H] = fitxa.mida, n = W * H;
  for (const f of ['mon.json', 'mapes.z', 'codi']) if (existsSync(join(dir, f))) fail(`${join(dir, f)} ja existeix: no es torna a fer`);
  const epochs = range(fitxa.epoques), codeEpochs = new Set(fitxa.codi ? range(fitxa.codi) : []);
  for (const e of codeEpochs) if (!epochs.includes(e)) fail(`el codi de l'època ${e} no és de cap fotograma`);
  // les captures que s'han de comprovar, abans de res
  for (const c of fitxa.comprova ?? []) {
    const file = join(captures, captureName(fitxa.captures, c.epoca));
    if (!existsSync(file)) fail(`no hi ha la captura de l'època ${c.epoca} (${file})`);
    if (sha256(readFileSync(file)) !== c.sha256) fail(`la captura de l'època ${c.epoca} no té la SHA-256 de ${c.font}: no és la mateixa història`);
  }
  const record = fitxa.registre ? checkRecord(fitxa.registre, captures) : null;

  const tracker = createFamilyTracker();
  const maps = Buffer.alloc(epochs.length * 2 * n);
  const frames = [], fonts = [], families = new Map(), codeFiles = {};
  let alive = new Set();
  epochs.forEach((e, i) => {
    const file = join(captures, captureName(fitxa.captures, e));
    if (!existsSync(file)) fail(`no hi ha la captura de l'època ${e} (${file})`);
    const raw = readFileSync(file), soup = new Uint8Array(raw.buffer, raw.byteOffset, raw.length);
    if (soup.length !== n * PROGRAM_SIZE) fail(`${file} no té la mida d'un món de ${W} × ${H}`);
    fonts.push({ e, captura: captureName(fitxa.captures, e), sha256: sha256(raw) });
    const r = tracker.analyse(soup, n, e, W);
    const fam = maps.subarray(i * 2 * n, i * 2 * n + n), k = maps.subarray(i * 2 * n + n, (i + 1) * 2 * n);
    fam.set(r.map);
    for (let c = 0; c < n; c++) {
      let m = 0;
      for (let b = c * PROGRAM_SIZE, end = b + PROGRAM_SIZE; b < end; b++) if (KIND[soup[b]]) m++;
      k[c] = m;
    }
    // les famílies: cadascuna conserva el seu color mentre viu, el primer que no tingui cap de les vives
    const now = new Set(r.families.map((f) => f.id));
    for (const id of alive) if (!now.has(id)) { const f = families.get(id); f.mor ??= e; f.fi = r.extinct.includes(id) ? 'extingida' : 'sense seguiment'; }
    const used = new Set(r.families.filter((f) => families.has(f.id)).map((f) => families.get(f.id).color));
    for (const f of r.families) {
      if (!families.has(f.id)) {
        const color = PALETTE.find((c) => !used.has(c)) ?? PALETTE[f.id % PALETTE.length];
        used.add(color);
        families.set(f.id, { id: f.id, color, neix: f.born, mor: null, fi: null, nucli: f.core, exemple: f.example ?? null, quota: [] });
      }
      const g = families.get(f.id);
      g.quota[i] = Math.round(f.share * 1e5) / 1e5;
      g.nucli = f.core || g.nucli;
    }
    alive = now;
    frames.push({ e, f: r.families.map((f) => f.id), viu: Math.round(r.alive * 1e4) / 1e4 });
    if (codeEpochs.has(e)) {
      const cls = new Uint8Array(soup.length);
      for (let b = 0; b < soup.length; b++) cls[b] = CLASS[soup[b]];
      codeFiles[e] = deflateSync(cls, { level: 9 });
    }
    process.stdout.write(`  època ${e}: ${r.families.length} famílies vives\n`);
  });
  // la quota de cada família, un valor per fotograma (null quan no hi és)
  for (const f of families.values()) f.quota = epochs.map((_, i) => f.quota[i] ?? null);

  const mapsZ = deflateSync(maps, { level: 9 });
  mkdirSync(join(dir, 'codi'));
  const codi = {};
  for (const [e, z] of Object.entries(codeFiles)) {
    writeFileSync(join(dir, 'codi', `${e}.z`), z, { flag: 'wx' });
    codi[e] = { fitxer: `codi/${e}.z`, sha256: sha256(z), bytes: z.length };
  }
  writeFileSync(join(dir, 'mapes.z'), mapsZ, { flag: 'wx' });
  const mon = {
    ...fitxa, format: 1,
    eina: { programa: 'eines/web-dades.mjs', registre: 'fase2/families.js (createFamilyTracker, per defecte)' },
    comprovat: { captures: (fitxa.comprova ?? []).length, ...(record ? { registre: record } : {}) },
    mapes: { fitxer: 'mapes.z', sha256: sha256(mapsZ), bytes: mapsZ.length },
    codiFitxers: codi, fotogrames: frames, families: [...families.values()].sort((a, b) => a.neix - b.neix || a.id - b.id), fonts,
  };
  writeFileSync(join(dir, 'mon.json'), JSON.stringify(mon) + '\n', { flag: 'wx' });
  return { frames: frames.length, families: families.size, mapsBytes: mapsZ.length, codeBytes: Object.values(codi).reduce((s, c) => s + c.bytes, 0), dir: relative(ROOT, dir) };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [fitxa, captures, ...rest] = process.argv.slice(2);
  if (!fitxa || !captures || rest.length) fail('Ús: node eines/web-dades.mjs web/dades/ID/fitxa.json carpeta-de-captures');
  const r = build(fitxa, captures);
  console.log(`${r.dir}: ${r.frames} fotogrames, ${r.families} famílies; mapes ${(r.mapsBytes / 1e6).toFixed(1)} MB, codi ${(r.codeBytes / 1e6).toFixed(1)} MB`);
}
