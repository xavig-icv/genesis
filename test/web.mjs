// Proves de l'eina de les dades del lloc web (eines/web-dades.mjs). Executa: node test/web.mjs
// Fa servir els retalls de 32 × 32 cel·les amb vida de test/fixtures com si fossin les captures d'una execució.
import assert from 'assert';
import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { inflateSync } from 'zlib';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { KIND } from '../fase1/bff.js';
import { CLASS } from '../eines/web-dades.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const tool = join(root, 'eines', 'web-dades.mjs');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const tmp = mkdtempSync(join(tmpdir(), 'web-dades-'));
const caps = join(tmp, 'captures');
mkdirSync(caps);
const a = readFileSync(join(root, 'test/fixtures/esclat-32x32.bin')), b = readFileSync(join(root, 'test/fixtures/punt-32x32.bin'));
const mid = Buffer.concat([a.subarray(0, a.length / 2), b.subarray(b.length / 2)]);
const sources = { 50: a, 100: mid, 150: b };
for (const [e, buf] of Object.entries(sources)) writeFileSync(join(caps, `mon-epoca${e}.bin`), buf);
const N = 32 * 32;

function fitxa(dir, extra = {}) {
  mkdirSync(dir, { recursive: true });
  const f = {
    id: 'prova', mida: [32, 32], titol: { ca: 'Prova', en: 'Test' }, tria: { ca: '', en: '' }, text: { ca: '', en: '' },
    captures: 'mon-epoca{e}.bin', epoques: { des: 50, fins: 150, cada: 50 }, codi: { des: 100, fins: 150, cada: 50 }, ...extra,
  };
  writeFileSync(join(dir, 'fitxa.json'), JSON.stringify(f));
  return join(dir, 'fitxa.json');
}
const run = (f) => spawnSync(process.execPath, [tool, f, caps], { encoding: 'utf8' });
const one = join(tmp, 'u'), two = join(tmp, 'dos');

const tests = {
  'escriu els mapes, el codi i la fitxa, amb les SHA-256 i la procedència': () => {
    const r = run(fitxa(one));
    assert.strictEqual(r.status, 0, r.stderr);
    const mon = JSON.parse(readFileSync(join(one, 'mon.json'), 'utf8'));
    assert.deepStrictEqual(mon.fotogrames.map((f) => f.e), [50, 100, 150]);
    const mapsZ = readFileSync(join(one, 'mapes.z')), maps = inflateSync(mapsZ);
    assert.strictEqual(mon.mapes.sha256, sha(mapsZ));
    assert.strictEqual(maps.length, 3 * 2 * N);
    mon.fotogrames.forEach((f, i) => {
      const src = sources[f.e], fam = maps.subarray(i * 2 * N, i * 2 * N + N), k = maps.subarray(i * 2 * N + N, (i + 1) * 2 * N);
      for (let c = 0; c < N; c++) {
        let m = 0;
        for (let j = 0; j < 64; j++) if (KIND[src[c * 64 + j]]) m++;
        assert.strictEqual(k[c], m, `les instruccions de la cel·la ${c} a l'època ${f.e}`);
        assert.ok(fam[c] <= f.f.length, `la família de la cel·la ${c} és a la llista del fotograma`);
      }
      // cada família de la llista és a la fitxa, amb un color
      for (const id of f.f) assert.ok(mon.families.some((g) => g.id === id && /^#[0-9a-f]{6}$/.test(g.color)));
    });
    assert.ok(mon.families.length > 0, 'els retalls tenen vida: hi ha d’haver alguna família');
    // el codi, només a les èpoques de la fitxa, i la classe de cada byte
    assert.deepStrictEqual(Object.keys(mon.codiFitxers).sort(), ['100', '150']);
    for (const e of ['100', '150']) {
      const z = readFileSync(join(one, mon.codiFitxers[e].fitxer)), cls = inflateSync(z);
      assert.strictEqual(mon.codiFitxers[e].sha256, sha(z));
      assert.strictEqual(cls.length, N * 64);
      for (let j = 0; j < cls.length; j++) assert.strictEqual(cls[j], CLASS[sources[e][j]]);
    }
    assert.deepStrictEqual(readdirSync(join(one, 'codi')).sort(), ['100.z', '150.z']);
    // la procedència: la SHA-256 de cada captura
    for (const f of mon.fonts) assert.strictEqual(f.sha256, sha(sources[f.e]));
  },
  'dues execucions donen exactament els mateixos fitxers': () => {
    const r = run(fitxa(two));
    assert.strictEqual(r.status, 0, r.stderr);
    for (const f of ['mon.json', 'mapes.z', 'codi/100.z', 'codi/150.z']) assert.strictEqual(sha(readFileSync(join(two, f))), sha(readFileSync(join(one, f))), f);
  },
  'no sobreescriu res': () => {
    const before = sha(readFileSync(join(one, 'mon.json')));
    const r = run(join(one, 'fitxa.json'));
    assert.strictEqual(r.status, 1);
    assert.match(r.stderr, /ja existeix/);
    assert.strictEqual(sha(readFileSync(join(one, 'mon.json'))), before);
  },
  'compara els censos i l’empremta final amb el registre de la sèrie': () => {
    // un registre de la sèrie i el de l'execució, amb els mateixos censos i la mateixa empremta
    const cens = (e, h) => ({ type: 'census', version: 'v3', epoch: e, families: [], sample: 2048, heritable: h });
    const lines = (rows, end) => [{ type: 'start', seed: 1 }, ...rows, { type: 'end', epoch: 150, fingerprint: end }].map((x) => JSON.stringify(x)).join('\n') + '\n';
    const serie = join(tmp, 'serie.jsonl');
    writeFileSync(serie, lines([cens(50, 0), cens(100, 3), cens(150, 40)], 'abcd1234'));
    writeFileSync(join(caps, 'run-igual.jsonl'), lines([cens(50, 0), cens(100, 3), cens(150, 40)], 'abcd1234'));
    const dir = join(tmp, 'quatre');
    const r = run(fitxa(dir, { codi: undefined, registre: { serie, execucio: 'run-igual.jsonl' } }));
    assert.strictEqual(r.status, 0, r.stderr);
    assert.deepStrictEqual(JSON.parse(readFileSync(join(dir, 'mon.json'), 'utf8')).comprovat.registre, { censos: 3, fins: 150, empremta: 'abcd1234' });
    // un cens diferent, o una altra empremta: no és la mateixa història, i no s'escriu res
    for (const [name, rows, end, why] of [['cens', [cens(50, 0), cens(100, 4), cens(150, 40)], 'abcd1234', /el cens de l'època 100/], ['empremta', [cens(50, 0), cens(100, 3), cens(150, 40)], 'ffff0000', /l'empremta final/]]) {
      writeFileSync(join(caps, `run-${name}.jsonl`), lines(rows, end));
      const d = join(tmp, `cinc-${name}`), q = run(fitxa(d, { registre: { serie, execucio: `run-${name}.jsonl` } }));
      assert.strictEqual(q.status, 1, name);
      assert.match(q.stderr, why);
      assert.ok(!existsSync(join(d, 'mon.json')) && !existsSync(join(d, 'mapes.z')), name);
    }
  },
  'si una captura no té la SHA-256 del registre, no escriu res': () => {
    const dir = join(tmp, 'tres');
    const r = run(fitxa(dir, { comprova: [{ epoca: 100, sha256: '0'.repeat(64), font: 'una prova' }] }));
    assert.strictEqual(r.status, 1);
    assert.match(r.stderr, /no és la mateixa història/);
    assert.ok(!existsSync(join(dir, 'mon.json')) && !existsSync(join(dir, 'mapes.z')) && !existsSync(join(dir, 'codi')));
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log(`  ok   ${name}`); } catch (e) { failed++; console.log(`  FALLA ${name}\n       ${e.message}`); }
}
rmSync(tmp, { recursive: true, force: true });
if (failed) { console.log(`\n${failed} proves fallades`); process.exit(1); }
console.log(`\nTotes les ${Object.keys(tests).length} proves de les dades del lloc web passen.`);
