// Proves de les eines de les dades i de les imatges del lloc web (eines/web-dades.mjs i eines/web-imatges.mjs), de la cinta
// de la portada (web/js/cinta.js) i del motor del món en viu (web/js/viu-motor.js).
// Executa: node test/web.mjs
// Fa servir els retalls de 32 × 32 cel·les amb vida de test/fixtures com si fossin les captures d'una execució.
import assert from 'assert';
import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { inflateSync } from 'zlib';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { KIND, runPairs } from '../fase1/bff.js';
import { makeRng } from '../fase1/soup.js';
import { CLASS, PALETTE_SIZE } from '../eines/web-dades.mjs';
import { trace, check, mirrorStep } from '../web/js/cinta.js';
import { createWorld, step, runHere, runInWorkers, fingerprint, command, CENSUS_EVERY } from '../web/js/viu-motor.js';
import { createCensus } from '../fase2/census.js';

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
      // cada família de la llista és a la fitxa, amb la seva posició a la paleta, i dues de vives no la comparteixen
      for (const id of f.f) assert.ok(mon.families.some((g) => g.id === id && Number.isInteger(g.paleta) && g.paleta >= 0 && g.paleta < PALETTE_SIZE));
      const slots = f.f.map((id) => mon.families.find((g) => g.id === id).paleta);
      assert.strictEqual(new Set(slots).size, Math.min(slots.length, PALETTE_SIZE));
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
  'els fotogrames sols (AUD-161): cadascun, igual que el seu tros dels mapes, amb la SHA-256 a mon.json': () => {
    const dir = join(tmp, 'sols'), r = run(fitxa(dir, { sols: [100] }));
    assert.strictEqual(r.status, 0, r.stderr);
    const mon = JSON.parse(readFileSync(join(dir, 'mon.json'), 'utf8')), maps = inflateSync(readFileSync(join(dir, 'mapes.z')));
    const z = readFileSync(join(dir, 'sols', '100.z'));
    assert.deepStrictEqual(mon.solsFitxers, { 100: { fitxer: 'sols/100.z', sha256: sha(z), bytes: z.length } });
    assert.ok(inflateSync(z).equals(maps.subarray(1 * 2 * N, 2 * 2 * N)), 'el fotograma de l\'època 100 és el segon dels mapes');
    // una època que no és de cap fotograma: no s'escriu res
    const bad = join(tmp, 'sols-mal'), q = run(fitxa(bad, { sols: [75] }));
    assert.strictEqual(q.status, 1);
    assert.match(q.stderr, /no és de cap fotograma/);
    assert.ok(!existsSync(join(bad, 'mon.json')));
  },
  '--refresca torna a fer mon.json amb la fitxa, sense les captures, i en surt el mateix que de les captures': () => {
    const a = join(tmp, 'refresca'), b = join(tmp, 'refresca-referencia');
    assert.strictEqual(run(fitxa(a)).status, 0);
    const maps = sha(readFileSync(join(a, 'mapes.z')));
    // la fitxa, amb un text nou, un avís i un fotograma sol
    const extra = { text: { ca: 'Un text nou', en: 'A new text' }, avisos: [{ des: 100, fins: 100, ca: 'Un avís', en: 'A notice' }], sols: [150] };
    fitxa(a, extra);
    const r = spawnSync(process.execPath, [tool, '--refresca', join(a, 'fitxa.json')], { encoding: 'utf8' });
    assert.strictEqual(r.status, 0, r.stderr);
    assert.strictEqual(run(fitxa(b, extra)).status, 0);
    for (const f of ['mon.json', 'sols/150.z']) assert.strictEqual(sha(readFileSync(join(a, f))), sha(readFileSync(join(b, f))), f);
    assert.strictEqual(sha(readFileSync(join(a, 'mapes.z'))), maps, 'els mapes no es toquen');
    // si la fitxa canvia el que surt de les captures, s'atura, i mon.json no canvia
    const before = sha(readFileSync(join(a, 'mon.json')));
    fitxa(a, { ...extra, epoques: { des: 50, fins: 100, cada: 50 } });
    const q = spawnSync(process.execPath, [tool, '--refresca', join(a, 'fitxa.json')], { encoding: 'utf8' });
    assert.strictEqual(q.status, 1);
    assert.match(q.stderr, /canvia «epoques»/);
    assert.strictEqual(sha(readFileSync(join(a, 'mon.json'))), before);
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
  'la cinta de la portada: el traçat coincideix amb l’intèrpret a cada pas, i els peus diuen el que hi passa': () => {
    const html = readFileSync(join(root, 'web/index.html'), 'utf8');
    const bytes = Uint8Array.from(Buffer.from(html.match(/id="tape" data-bytes="([0-9a-f]{256})"/)[1], 'hex'));
    const tr = trace(bytes);
    assert.strictEqual(check(bytes, tr, 1), -1, 'el traçat no coincideix amb evaluate()');
    assert.strictEqual(tr.steps, 8192);
    // el pas on la còpia al revés és sencera, al peu i al final de la figura («La còpia és sencera»), en les dues llengües
    const done = mirrorStep(bytes, tr);
    const ca = [...html.matchAll(/[Aa]l pas <span class="ob-mono">(\d+)<\/span> la còpia ja és sencera/g)], en = [...html.matchAll(/[Bb]y step <span class="ob-mono">(\d+)<\/span> the copy is complete/g)];
    assert.ok(ca.length === 2 && en.length === 2, 'el peu i el final de la cinta');
    for (const m of [...ca, ...en]) assert.strictEqual(Number(m[1]), done);
    // A no canvia, i al final B és A al revés
    for (let k = 0; k < 64; k++) {
      assert.strictEqual(tr.final[k], bytes[k], `el byte ${k} d'A`);
      assert.strictEqual(tr.final[64 + k], bytes[63 - k], `el byte ${64 + k} de B`);
    }
    // al principi, quants bytes de B són els d'A als mateixos llocs
    let same = 0;
    for (let k = 0; k < 64; k++) if (bytes[k] === bytes[64 + k]) same++;
    assert.match(html, new RegExp(`${same} dels seus 64 bytes eren els d’A`));
    assert.match(html, new RegExp(`${same} of its 64 bytes were A’s`));
  },
  'el traçat de la cinta coincideix amb l’intèrpret en cintes a l’atzar i en parelles de cel·les amb vida': () => {
    const rng = makeRng(20261030, 'v2');
    // pas a pas si l'execució és curta; si no, cada 61 passos (i al final)
    const ok = (t, what) => { const tr = trace(t); assert.strictEqual(check(t, tr, tr.steps < 1000 ? 1 : 61), -1, what); };
    for (let k = 0; k < 200; k++) ok(Uint8Array.from({ length: 128 }, () => (rng() * 256) | 0), `la cinta a l'atzar ${k}`);
    for (const src of [a, b]) {
      for (let k = 0; k < 40; k++) {
        const x = (rng() * 31) | 0, y = (rng() * 31) | 0, p = y * 32 + x, q = rng() < 0.5 ? p + 1 : p + 32;
        const t = new Uint8Array(128);
        t.set(src.subarray(p * 64, p * 64 + 64), 0);
        t.set(src.subarray(q * 64, q * 64 + 64), 64);
        ok(t, `la parella ${p}-${q}`);
      }
    }
  },
  'el món en viu fa la mateixa història que sim.mjs, amb un fil o amb tres: els censos i l’empremta': async () => {
    // tres treballadors de mentida, que executen les cintes com fase1/worker.js i responen més tard
    const fake = () => ({ onmessage: null, onerror: null, postMessage(msg) { runPairs(new Uint8Array(msg.buffer), msg.nPairs); setImmediate(() => this.onmessage({ data: { buffer: msg.buffer } })); } });
    for (const [width, height, seed, mixing, epochs] of [[32, 16, 7, 0, 600], [24, 24, 11, 0.01, 600]]) {
      const p = { seed, width, height, mixing }, json = join(tmp, `viu-${seed}.jsonl`);
      // l'ordre que la pàgina diu que fa el mateix món
      const r = spawnSync(process.execPath, [join(root, 'sim.mjs'), ...command(p, epochs).split(' ').slice(2), '--json', json], { cwd: root, encoding: 'utf8' });
      assert.strictEqual(r.status, 0, r.stderr);
      const recs = readFileSync(json, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
      const want = recs.filter((x) => x.type === 'census'), end = recs.find((x) => x.type === 'end');
      for (const run of [runHere, runInWorkers([fake(), fake(), fake()])]) {
        const w = createWorld(p), census = createCensus({ version: 'v3', width, radius: 2 }), got = [];
        while (w.epoch < epochs) { await step(w, run); if (w.epoch % CENSUS_EVERY === 0) got.push(census.run(w.soup, w.n, w.epoch)); }
        assert.strictEqual(fingerprint(w.soup), end.fingerprint, `l'empremta de la llavor ${seed}`);
        assert.deepStrictEqual(got.map((c) => [c.epoch, c.sample, c.heritable, c.replicating, JSON.stringify(c.families)]), want.map((c) => [c.epoch, c.sample, c.heritable, c.replicating, JSON.stringify(c.families)]));
      }
    }
  },
  "l'eina de les imatges valida les opcions i no sobreescriu res, abans d'obrir Chrome": () => {
    const images = (...args) => spawnSync(process.execPath, [join(root, 'eines', 'web-imatges.mjs'), ...args], { encoding: 'utf8' });
    assert.strictEqual(images('--help').status, 0);
    // un fitxer qualsevol fa de Chrome: l'eina s'ha d'aturar abans de fer-lo servir
    const chrome = process.execPath, dir = join(tmp, 'imatges');
    const bad = [
      ['--sortida', dir],
      ['--chrome', join(tmp, 'no-hi-es.exe'), '--sortida', dir],
      ['--chrome', chrome, '--sortida', dir, '--color', 'blau'],
      ['--chrome', chrome, '--sortida', dir, '--mon', 'u'],
      ['--chrome', chrome, '--sortida', dir, '--camera3d', '380'],
      ['--chrome', chrome, '--sortida', dir, '--url', 'http://exemple.cat/web/'],
      ['--chrome', chrome, '--sortida', dir, '--sortida', dir],
      ['--chrome', chrome],
    ];
    for (const args of bad) assert.strictEqual(images(...args).status, 2, args.join(' '));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'entrada-2d-fosc.jpg'), 'abans');
    const r = images('--chrome', chrome, '--sortida', dir);
    assert.strictEqual(r.status, 2);
    assert.match(r.stderr, /ja existeix .*entrada-2d-fosc\.jpg/);
    assert.strictEqual(readFileSync(join(dir, 'entrada-2d-fosc.jpg'), 'utf8'), 'abans');
    // també els pòsters del naixement, a la seva carpeta
    const dir2 = join(tmp, 'imatges-2');
    mkdirSync(join(dir2, 'naixement'), { recursive: true });
    writeFileSync(join(dir2, 'naixement', 'clar-6000.webp'), 'abans');
    const r2 = images('--chrome', chrome, '--sortida', dir2);
    assert.strictEqual(r2.status, 2);
    assert.match(r2.stderr, /ja existeix .*clar-6000\.webp/);
    assert.strictEqual(readFileSync(join(dir2, 'naixement', 'clar-6000.webp'), 'utf8'), 'abans');
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { await fn(); console.log(`  ok   ${name}`); } catch (e) { failed++; console.log(`  FALLA ${name}\n       ${e.message}`); }
}
rmSync(tmp, { recursive: true, force: true });
if (failed) { console.log(`\n${failed} proves fallades`); process.exit(1); }
console.log(`\nTotes les ${Object.keys(tests).length} proves del lloc web passen.`);
