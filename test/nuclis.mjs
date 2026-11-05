// Proves de l'eina de la sensibilitat del registre de famílies al criteri dels trossos (eines/nuclis-sensibilitat.mjs, AUD-162),
// amb un món petit fet dels retalls de 32 × 32 cel·les de test/fixtures, com si fos un món del lloc web.
// Executa: node test/nuclis.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
const tool = join(root, 'eines', 'nuclis-sensibilitat.mjs');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const run = (...args) => spawnSync(process.execPath, [tool, ...args], { encoding: 'utf8' });
const tmp = mkdtempSync(join(tmpdir(), 'nuclis-'));

// Un món de 32 × 32 i tres fotogrames: els dos retalls amb vida i una barreja dels dos, amb la fitxa i el mon.json del lloc
const a = readFileSync(join(root, 'test/fixtures/esclat-32x32.bin')), b = readFileSync(join(root, 'test/fixtures/punt-32x32.bin'));
const caps = join(tmp, 'captures'), dades = join(tmp, 'dades');
mkdirSync(caps);
mkdirSync(dades);
const frames = { 50: a, 100: Buffer.concat([a.subarray(0, a.length / 2), b.subarray(b.length / 2)]), 150: b };
const fonts = Object.entries(frames).map(([e, buf]) => {
  writeFileSync(join(caps, `mon-epoca${e}.bin`), buf);
  return { e: Number(e), captura: `mon-epoca${e}.bin`, sha256: sha(buf) };
});
const fitxa = join(dades, 'fitxa.json');
writeFileSync(fitxa, JSON.stringify({ id: 'prova', mida: [32, 32], ordre: 'cap' }));
writeFileSync(join(dades, 'mon.json'), JSON.stringify({ id: 'prova', mida: [32, 32], fonts }));

const tests = {
  'el mode mon: una entrada per fotograma, amb els tres valors, i la mateixa fracció de replicadors amb tots': () => {
    const out = join(tmp, 'prova.json'), r = run('mon', '--fitxa', fitxa, '--captures', caps, '--sortida', out);
    assert.strictEqual(r.status, 0, r.stderr);
    const doc = JSON.parse(readFileSync(out, 'utf8'));
    assert.deepStrictEqual(doc.entrades.map((x) => x.epoca), [50, 100, 150]);
    for (const x of doc.entrades) {
      assert.deepStrictEqual(Object.keys(x.variants), ['1', '2', '3']);
      for (const v of ['2', '3']) assert.strictEqual(x.variants[v].alive, x.variants[1].alive);
      assert.strictEqual(x.variants[1].lost + x.variants[1].gained, 0, 'el d\'ara, comparat amb si mateix');
      for (const f of x.variants[3].families) assert.ok(f.distinct >= 3, f.core);
    }
    assert.ok(doc.entrades.some((x) => x.variants[1].families.length > 0), 'els retalls tenen vida: hi ha d\'haver alguna família');
    assert.strictEqual(doc.registre.sha256, sha(readFileSync(join(root, 'fase2', 'families.js'))));
    // el CSV: una fila per fotograma i valor, i la capçalera
    assert.strictEqual(readFileSync(join(tmp, 'prova.csv'), 'utf8').trim().split('\n').length, 1 + 3 * 3);
  },
  'no sobreescriu res, i una captura que no és la de mon.json atura el càlcul sense escriure res': () => {
    const r = run('mon', '--fitxa', fitxa, '--captures', caps, '--sortida', join(tmp, 'prova.json'));
    assert.strictEqual(r.status, 1);
    assert.match(r.stderr, /ja existeix/);
    writeFileSync(join(caps, 'mon-epoca100.bin'), a); // una altra captura, amb el nom de la de l'època 100
    const q = run('mon', '--fitxa', fitxa, '--captures', caps, '--sortida', join(tmp, 'altra.json'));
    assert.strictEqual(q.status, 1);
    assert.match(q.stderr, /no té la SHA-256 de mon\.json/);
    assert.ok(!existsSync(join(tmp, 'altra.json')) && !existsSync(join(tmp, 'altra.csv')));
  },
  'les opcions es validen': () => {
    for (const args of [[], ['cap'], ['mon', '--sortida', 'x.json'], ['clau', '--fitxa', 'f', '--sortida', 'x.json'],
      ['mon', '--fitxa', 'f', '--captures', 'c', '--sortida', 'x.txt'], ['clau', '--sortida', 'x.json', '--sortida', 'y.json']]) {
      assert.strictEqual(run(...args).status, 2, args.join(' '));
    }
  },
  'no llegeix cap món de la sèrie de la maduració': () => {
    const d = join(tmp, 'maduracio');
    mkdirSync(d);
    writeFileSync(join(d, 'fitxa.json'), JSON.stringify({ id: 'x', mida: [32, 32], serie: 'fase2/resultats/maduracio/serie/branques/x.jsonl' }));
    writeFileSync(join(d, 'mon.json'), JSON.stringify({ id: 'x', mida: [32, 32], fonts }));
    const r = run('mon', '--fitxa', join(d, 'fitxa.json'), '--captures', caps, '--sortida', join(tmp, 'm.json'));
    assert.strictEqual(r.status, 2);
    assert.match(r.stderr, /maduració/);
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
