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
import { execFileSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
const sim = (...args) => execFileSync(process.execPath, ['sim.mjs', ...args], { cwd: root, encoding: 'utf8' });
const fingerprint = (out) => out.match(/empremta del món: ([0-9a-f]+)/)?.[1];
const tmp = mkdtempSync(join(tmpdir(), 'claude-origins-'));

const tests = {
  'sopa barrejada (Fase 1)'() {
    assert.strictEqual(fingerprint(sim('--seed', '1', '--log2size', '12', '--epochs', '60', '--every', '1000')), 'a1cdd7f5');
  },
  'sopa que imita el navegador amb 3 fils (--chunks)'() {
    assert.strictEqual(fingerprint(sim('--seed', '2', '--log2size', '12', '--chunks', '3', '--epochs', '60', '--every', '1000')), 'a77836cc');
  },
  'món 2D quiet (llei 1)'() {
    assert.strictEqual(fingerprint(sim('--world', '128x64', '--seed', '3', '--epochs', '80', '--every', '1000', '--census', '1000', '--save', tmp)), 'f2fb6937');
  },
  'món 2D amb corrents, difusió, riu i renovació (lleis 1 a 3)'() {
    assert.strictEqual(fingerprint(sim('--world', '128x64', '--seed', '4', '--epochs', '80', '--mixing', '0.1', '--diffusion', '0.05',
      '--flow', '0.3', '--renewal', '0.002', '--every', '1000', '--census', '1000')), 'b8887bbd');
  },
  'experiment de branca des d\'una captura (--from)'() {
    // fa servir la captura final del món quiet, que desa la prova anterior
    assert.strictEqual(fingerprint(sim('--world', '128x64', '--from', join(tmp, 'llavor3-mon128x64-r2-final.bin'), '--start', '80',
      '--epochs', '120', '--seed', '9', '--mixing', '0.01', '--every', '1000', '--census', '1000', '--after', '99999')), '2f786a9e');
  },
  'empremta històrica de la llei 2 (a07175f0, comprovada al navegador i a la VM)'() {
    assert.strictEqual(fingerprint(sim('--world', '256x128', '--seed', '5', '--epochs', '30', '--every', '1000', '--census', '1000',
      '--mixing', '0.1', '--diffusion', '0.1')), 'a07175f0');
  },
  'registre històric de la Fase 1 (fase1/resultats/llavor-1.log, època 100)'() {
    const out = sim('--seed', '1', '--epochs', '100', '--every', '100');
    assert.ok(out.includes('època 100  H0=7.999  HOE=0.183  ops/execució=67.3'), out.split('\n').find((l) => l.startsWith('època 100')));
  },
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
