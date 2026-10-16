// Proves de regressió del determinisme ("golden master"). Executa: node test/determinisme.mjs
//
// Totes les conclusions del projecte depenen que una mateixa llavor doni sempre la mateixa
// història. Aquestes proves executen sim.mjs en casos curts i comparen l'empremta del món final
// (FNV-1a de tots els bytes) amb la que es va obtenir quan es van fixar. Si un canvi al codi altera,
// encara que sigui sense voler, l'ordre de les crides a l'atzar o la química, alguna prova fallarà.
//
// Si un canvi ha d'alterar les històries a propòsit, no es toquen aquestes empremtes: s'hi afegeix
// una opció nova (com --rng v2) i les antigues continuen reproduint-se igual.
import assert from 'assert';
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
const sim = (...args) => execFileSync(process.execPath, ['sim.mjs', ...args], { cwd: root, encoding: 'utf8' });
const fingerprint = (out) => out.match(/empremta del món: ([0-9a-f]+)/)?.[1];
const tmp = mkdtempSync(join(tmpdir(), 'claude-origins-'));

const LAWS = ['--mixing', '0.1', '--diffusion', '0.05', '--flow', '0.3', '--renewal', '0.002'];
const QUIET = ['--every', '1000', '--census', '1000'];

const tests = {
  // Generador v1 (mulberry32): els experiments fets fins a l'auditoria 1. Aquestes empremtes es van
  // fixar abans d'introduir el generador v2 i no poden canviar mai.
  'v1 · sopa barrejada (Fase 1)'() {
    assert.strictEqual(fingerprint(sim('--rng', 'v1', '--seed', '1', '--log2size', '12', '--epochs', '60', '--every', '1000')), 'a1cdd7f5');
  },
  'v1 · sopa que imita el navegador amb 3 fils (--chunks)'() {
    assert.strictEqual(fingerprint(sim('--rng', 'v1', '--seed', '2', '--log2size', '12', '--chunks', '3', '--epochs', '60', '--every', '1000')), 'a77836cc');
  },
  'v1 · món 2D quiet (llei 1)'() {
    assert.strictEqual(fingerprint(sim('--rng', 'v1', '--world', '128x64', '--seed', '3', '--epochs', '80', ...QUIET, '--save', tmp)), 'f2fb6937');
  },
  'v1 · món 2D amb corrents, difusió, riu i renovació (lleis 1 a 3)'() {
    assert.strictEqual(fingerprint(sim('--rng', 'v1', '--world', '128x64', '--seed', '4', '--epochs', '80', ...LAWS, ...QUIET)), 'b8887bbd');
  },
  'v1 · experiment de branca des d\'una captura (--from)'() {
    // fa servir la captura final del món quiet, que desa la prova anterior
    assert.strictEqual(fingerprint(sim('--rng', 'v1', '--world', '128x64', '--from', join(tmp, 'llavor3-mon128x64-r2-final.bin'),
      '--start', '80', '--epochs', '120', '--seed', '9', '--mixing', '0.01', ...QUIET)), '2f786a9e');
  },
  'v1 · empremta històrica de la llei 2 (a07175f0, comprovada al navegador i a la VM)'() {
    assert.strictEqual(fingerprint(sim('--rng', 'v1', '--world', '256x128', '--seed', '5', '--epochs', '30', ...QUIET,
      '--mixing', '0.1', '--diffusion', '0.1')), 'a07175f0');
  },
  'v1 · registre històric de la Fase 1 (fase1/resultats/llavor-1.log, època 100)'() {
    const out = sim('--rng', 'v1', '--seed', '1', '--epochs', '100', '--every', '100');
    const line = out.split('\n').find((l) => l.startsWith('època 100')) ?? '';
    // H0 i les operacions només depenen de la història, i es comparen exactament. L'HOE també depèn
    // de la implementació de zlib: Node 16 (zlib 1.2.11) i Node 20 (zlib 1.3.1) donen 0.183, però
    // Node 22 dona 0.184 (AU2-07 de l'auditoria externa 2). Per això es compara amb una tolerància.
    assert.ok(line.startsWith('època 100  H0=7.999  HOE='), line);
    assert.ok(line.includes('  ops/execució=67.3  '), line);
    const hoe = Number(line.match(/HOE=([\d.]+)/)?.[1]);
    assert.ok(Math.abs(hoe - 0.183) <= 0.002, `HOE=${hoe}: s'esperava 0.183 ± 0.002 (zlib ${process.versions.zlib})`);
  },

  // Generador v2 (xoshiro128**): el de les sèries noves.
  'v2 · sopa barrejada'() {
    assert.strictEqual(fingerprint(sim('--rng', 'v2', '--seed', '1', '--log2size', '12', '--epochs', '60', '--every', '1000')), '959e7937');
  },
  'v2 · sopa amb --chunks 3'() {
    assert.strictEqual(fingerprint(sim('--rng', 'v2', '--seed', '2', '--log2size', '12', '--chunks', '3', '--epochs', '60', '--every', '1000')), '573eb8f1');
  },
  'v2 · món 2D amb les lleis 1 a 3'() {
    assert.strictEqual(fingerprint(sim('--rng', 'v2', '--world', '128x64', '--seed', '4', '--epochs', '80', ...LAWS, ...QUIET)), 'edfd9766');
  },
  'v2 és el generador per defecte'() {
    assert.strictEqual(fingerprint(sim('--world', '128x64', '--seed', '4', '--epochs', '80', ...LAWS, ...QUIET)), 'edfd9766');
  },
  // Casos que abans només es provaven barrejats amb la resta de lleis (AUD-36 de l'auditoria 2)
  'v2 · món 2D amb radi 1'() {
    assert.strictEqual(fingerprint(sim('--world', '128x64', '--seed', '4', '--epochs', '80', '--radius', '1', ...QUIET)), 'b054f4b');
  },
  'v2 · difusió sense barreja'() {
    assert.strictEqual(fingerprint(sim('--world', '128x64', '--seed', '4', '--epochs', '80', '--diffusion', '0.1', ...QUIET)), '3db24b96');
  },

  // El cens (AUD-36): les empremtes del món no el veuen, però ara és la mesura principal. Es prova sobre
  // dos retalls de 32x32 de mons amb vida (test/fixtures): l'esclat del replicador que necessita
  // parella i el palíndrom del punt. Els valors del cens v2 es van obtenir amb el codi d'abans de la
  // iteració 3 (commit 4bbee9a): el cens v2 els ha de reproduir exactament.
  ...Object.fromEntries([['esclat', 'bbf02f058fe26cd3', '0a30da1b21bb7f8b', '9741e854'], ['punt', '0b74109de2367cb7', 'a67305348633b1e0', 'b01bd77a']]
    .map(([name, v2, v3, world]) => [`cens v2 i v3 · retall «${name}» (el cens no toca el món)`, () => {
      const run = (version) => sim('--rng', 'v1', '--world', '32x32', '--from', join(root, 'test', 'fixtures', `${name}-32x32.bin`), '--start', '0',
        '--epochs', '30', '--every', '1000', '--census', '5', '--census-version', version);
      for (const [version, expected] of [['v2', v2], ['v3', v3]]) {
        const out = run(version);
        const lines = out.split('\n').filter((l) => /^cens |FAMÍLIA|ESTABLIMENT/.test(l)).join('\n') + '\n';
        assert.strictEqual(createHash('sha256').update(lines).digest('hex').slice(0, 16), expected, `cens ${version}:\n${lines}`);
        assert.strictEqual(fingerprint(out), world, `cens ${version}: el món ha canviat`);
      }
    }])),
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  const t0 = Date.now();
  try { fn(); console.log('  ok  ', name, `(${((Date.now() - t0) / 1000).toFixed(1)} s)`); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
rmSync(tmp, { recursive: true, force: true });
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
