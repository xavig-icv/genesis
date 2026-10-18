// Proves dels lots d'experiments: experiments.sh, llanca-lot.sh i seguiment.sh (A6 del pla de la
// iteració 4). Executa: node test/lots.mjs (necessita bash: Git Bash a Windows)
import assert from 'assert';
import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync, copyFileSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
const bash = (script, ...args) => spawnSync('bash', [script, ...args], { cwd: root, encoding: 'utf8' });

// Un experiment que acaba (un món petit i curt) i un que surt amb error (una opció incorrecta)
const LIST = [
  'bo --world 32x32 --seed 1 --epochs 3 --census 250',
  'dolent --world 32x32 --epochs 3 --mixng 0.5',
  '',
  '# un comentari',
].join('\n') + '\n';

function withBatch(fn) {
  const tmp = mkdtempSync(join(tmpdir(), 'lots-'));
  try {
    const list = join(tmp, 'llista.txt');
    writeFileSync(list, LIST);
    fn(tmp, list);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const tests = {
  "llanca-lot.sh no escriu res a la consola, i el progrés va al fitxer del lot": () => withBatch((dir, list) => {
    const r = bash('llanca-lot.sh', '2', dir, list);
    assert.strictEqual(r.status, 0, r.stderr);
    assert.strictEqual(r.stdout, '');
    assert.strictEqual(r.stderr, '');
    const out = readFileSync(join(dir, 'lot-llista.out'), 'utf8');
    assert.match(out, /^== lot començat .* codi=\S+ llista=.*llista\.txt paral·lel=2$/m);
    assert.match(out, /^comença: bo$/m);
    assert.match(out, /^acaba: {3}bo$/m);
  }),
  "un experiment que surt amb error s'anota com a fallat, amb el codi": () => withBatch((dir, list) => {
    bash('llanca-lot.sh', '2', dir, list);
    const out = readFileSync(join(dir, 'lot-llista.out'), 'utf8');
    assert.match(out, /^falla: {3}dolent \(codi [1-9]\d*\)$/m);
    assert.doesNotMatch(out, /^acaba: {3}dolent$/m);
    assert.match(out, /^== lot acabat .*: 1 acabats, 1 fallats, 0 ja fets$/m);
    assert.ok(existsSync(join(dir, 'bo.log')) && readFileSync(join(dir, 'bo.log'), 'utf8').includes('empremta del món'));
  }),
  "en rellançar, se salten els acabats i es tornen a fer els fallats": () => withBatch((dir, list) => {
    bash('llanca-lot.sh', '2', dir, list);
    const r = bash('llanca-lot.sh', '2', dir, list);
    assert.strictEqual(r.status, 0, r.stderr);
    const out = readFileSync(join(dir, 'lot-llista.out'), 'utf8');
    assert.strictEqual(out.match(/^== lot començat/gm).length, 2);
    assert.match(out, /^ja fet: bo$/m);
    assert.match(out, /^== lot acabat .*: 0 acabats, 1 fallats, 1 ja fets$/m);
  }),
  'seguiment.sh compta sense mostrar cap resultat': () => withBatch((dir, list) => {
    bash('llanca-lot.sh', '2', dir, list);
    const r = bash('seguiment.sh', dir);
    assert.strictEqual(r.status, 0, r.stderr);
    assert.match(r.stdout, /començats: 2 {3}acabats: 1 {3}fallats: 1 {3}ja fets abans: 0 {3}en marxa: 0/);
    assert.match(r.stdout, /registres complets dels acabats: 1$/m);
    assert.match(r.stdout, /fallats: dolent/);
    // cap xifra del registre: ni l'empremta del món ni les mesures
    const log = readFileSync(join(dir, 'bo.log'), 'utf8');
    const fingerprint = log.match(/empremta del món: (\S+)/)[1];
    assert.ok(!r.stdout.includes(fingerprint));
    assert.doesNotMatch(r.stdout, /H0=|HOE=|hereditaris/);
  }),
  "seguiment.sh: experiments en marxa, noms amb carpeta i un fallat que després acaba": () => withBatch((dir) => {
    // Un lot fet a mà, com els de la sèrie de la llei 2 (noms A/1001...)
    writeFileSync(join(dir, 'lot-a.out'), [
      '== lot començat 2026-10-18 10:00:00 codi=abc llista=a.txt paral·lel=3',
      'comença: A/1001', 'comença: B/2001', 'comença: A/1002',
      'acaba:   A/1001', 'falla:   B/2001 (codi 1)', 'comença: B/2001', 'acaba:   B/2001', 'comença: B/2002', '',
    ].join('\n'));
    for (const g of ['A', 'B']) mkdirSync(join(dir, g));
    writeFileSync(join(dir, 'A', '1001.log'), 'empremta del món: 1234abcd\n');
    writeFileSync(join(dir, 'B', '2001.log'), 'empremta del món: 99aa\n');
    writeFileSync(join(dir, 'A', '1002.log'), 'època 100 ...\n');
    const r = bash('seguiment.sh', dir);
    assert.strictEqual(r.status, 0, r.stderr);
    assert.match(r.stdout, /començats: 4 {3}acabats: 2 {3}fallats: 0 {3}ja fets abans: 0 {3}en marxa: 2/);
    assert.match(r.stdout, /registres complets dels acabats: 2$/m);
    assert.match(r.stdout, /en marxa: A\/1002, sense escriure fa \d+ min/);
    assert.match(r.stdout, /en marxa: B\/2002, encara sense registre/);
    assert.ok(!r.stdout.includes('1234abcd'));
  }),
  // Abans, una còpia neta de git aturava llanca-lot.sh sense escriure res (set -e i un "&&" dins de la
  // substitució del codi). Les proves d'abans no ho veien perquè el repositori tenia canvis sense desar.
  // Aquí es prova en una còpia mínima del simulador, en els tres casos.
  "el codi del lot: còpia neta de git, còpia amb canvis i sense git (VERSIO)": () => withBatch((dir, list) => {
    const copy = join(dir, 'copia');
    mkdirSync(copy);
    for (const f of ['llanca-lot.sh', 'experiments.sh', 'sim.mjs', 'package.json']) copyFileSync(join(root, f), join(copy, f));
    for (const d of ['fase1', 'fase2']) {
      mkdirSync(join(copy, d));
      for (const f of readdirSync(join(root, d)).filter((f) => /\.m?js$/.test(f))) copyFileSync(join(root, d, f), join(copy, d, f));
    }
    const run = (cmd) => spawnSync('bash', ['-c', cmd], { cwd: copy, encoding: 'utf8' });
    const launch = () => {
      const r = spawnSync('bash', ['llanca-lot.sh', '1', 'lot', list], { cwd: copy, encoding: 'utf8' });
      assert.strictEqual(r.status, 0, r.stderr);
      const out = readFileSync(join(copy, 'lot', 'lot-llista.out'), 'utf8');
      rmSync(join(copy, 'lot'), { recursive: true });
      return out;
    };
    // sense git: el codi és el de VERSIO
    writeFileSync(join(copy, 'VERSIO'), 'abc1234\n');
    let out = launch();
    assert.match(out, /^== lot començat .* codi=abc1234 /m);
    assert.match(out, /^acaba: {3}bo$/m);
    assert.match(out, /^== lot acabat .*: 1 acabats, 1 fallats/m);
    // còpia neta de git: el commit, sense +canvis
    const git = 'git -c user.name=prova -c user.email=prova@exemple.invalid';
    assert.strictEqual(run(`${git} init -q && ${git} add -A && ${git} commit -q -m prova`).status, 0);
    const hash = run('git rev-parse --short HEAD').stdout.trim();
    out = launch();
    assert.match(out, new RegExp(`^== lot començat .* codi=${hash} `, 'm'));
    assert.match(out, /^acaba: {3}bo$/m);
    // amb un canvi al codi: +canvis
    writeFileSync(join(copy, 'fase1', 'bff.js'), readFileSync(join(copy, 'fase1', 'bff.js'), 'utf8') + '\n// canvi\n');
    out = launch();
    assert.match(out, new RegExp(`^== lot començat .* codi=${hash}\\+canvis `, 'm'));
  }),
  'llanca-lot.sh rebutja els arguments incorrectes': () => {
    assert.strictEqual(bash('llanca-lot.sh', '2').status, 2);
    assert.strictEqual(bash('llanca-lot.sh', '2', tmpdir(), 'no-existeix.txt').status, 2);
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
