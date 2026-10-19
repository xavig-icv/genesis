// Proves dels lots d'experiments: eines/experiments.sh, eines/llanca-lot.sh i eines/seguiment.sh (A6 del pla de la
// iteració 4; correccions de l'auditoria 8: AU2-37 a AU2-40, AUD-56, AUD-57 i AUD-59), i d'on treu
// eines/desplega-vm.sh l'adreça de la VM.
// Executa: node test/lots.mjs (necessita bash: Git Bash a Windows)
import assert from 'assert';
import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync, copyFileSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
const bash = (script, args = [], opts = {}) => spawnSync('bash', [join(root, 'eines', script), ...args], { cwd: root, encoding: 'utf8', ...opts });
const slash = (p) => p.replace(/\\/g, '/');         // xargs llegeix les barres invertides com a escapament
const lotOut = (dir, list = 'llista') => readFileSync(join(dir, `lot-${list}.out`), 'utf8');

// Un experiment que acaba (un món petit i curt) i un que surt amb error (una opció incorrecta)
const LIST = [
  'bo --world 32x32 --seed 1 --epochs 3 --census 250',
  'dolent --world 32x32 --epochs 3 --mixng 0.5',
  '',
  '# un comentari',
].join('\n') + '\n';

function withDir(fn) {
  const tmp = mkdtempSync(join(tmpdir(), 'lots-'));
  try { fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); }
}
function withBatch(fn, list = LIST) {
  withDir((dir) => {
    const file = join(dir, 'llista.txt');
    writeFileSync(file, typeof list === 'function' ? list(dir) : list);
    fn(dir, file);
  });
}
// Un experiment amb JSONL, amb camins absoluts (amb barres normals)
const withJson = (dir) => `petit --world 32x32 --seed 7 --epochs 2 --census 250 --json ${slash(join(dir, 'petit.jsonl'))}\n`;

const tests = {
  "llanca-lot.sh no escriu res a la consola, i el progrés va al fitxer del lot": () => withBatch((dir, list) => {
    const r = bash('llanca-lot.sh', ['2', dir, list]);
    assert.strictEqual(r.status, 0, r.stderr);
    assert.strictEqual(r.stdout, '');
    assert.strictEqual(r.stderr, '');
    const out = lotOut(dir);
    assert.match(out, /^== lot començat .* codi=\S+ llista=.*llista\.txt paral·lel=2$/m);
    assert.match(out, /^comença: bo$/m);
    assert.match(out, /^acaba: {3}bo$/m);
  }),
  "un experiment que surt amb error s'anota com a fallat, amb el codi, i el lot acaba igualment": () => withBatch((dir, list) => {
    const r = bash('llanca-lot.sh', ['2', dir, list]);
    assert.strictEqual(r.status, 0, r.stderr);
    const out = lotOut(dir);
    assert.match(out, /^falla: {3}dolent \(codi [1-9]\d*\)$/m);
    assert.doesNotMatch(out, /^acaba: {3}dolent$/m);
    assert.match(out, /^== lot acabat .*: 1 acabats, 1 fallats, 0 ja fets$/m);
    assert.ok(readFileSync(join(dir, 'bo.log'), 'utf8').includes('empremta del món'));
  }),
  "en rellançar, se salten els acabats i es tornen a fer els fallats": () => withBatch((dir, list) => {
    bash('llanca-lot.sh', ['2', dir, list]);
    const r = bash('llanca-lot.sh', ['2', dir, list]);
    assert.strictEqual(r.status, 0, r.stderr);
    const out = lotOut(dir);
    assert.strictEqual(out.match(/^== lot començat/gm).length, 2);
    assert.match(out, /^ja fet: bo$/m);
    assert.match(out, /^== lot acabat .*: 0 acabats, 1 fallats, 1 ja fets$/m);
  }),
  // A6-01 de l'auditor 2 (AU2-37)
  "un experiment amb el registre complet però sense JSONL es torna a fer": () => withBatch((dir, list) => {
    bash('llanca-lot.sh', ['1', dir, list]);
    rmSync(join(dir, 'petit.jsonl'));
    bash('llanca-lot.sh', ['1', dir, list]);
    const out = lotOut(dir);
    assert.doesNotMatch(out, /^ja fet: petit$/m);
    assert.strictEqual(out.match(/^acaba: {3}petit$/gm).length, 2);
    assert.ok(readFileSync(join(dir, 'petit.jsonl'), 'utf8').trim().split('\n').pop().includes('"type":"end"'));
  }, withJson),
  // A6-02 de l'auditor 2
  "un JSONL sense línia final, o d'una altra llavor, no compta com a fet": () => withBatch((dir, list) => {
    bash('llanca-lot.sh', ['1', dir, list]);
    const json = join(dir, 'petit.jsonl');
    const lines = readFileSync(json, 'utf8').trim().split('\n');
    writeFileSync(json, lines.slice(0, -1).join('\n') + '\n');          // sense la línia final
    bash('llanca-lot.sh', ['1', dir, list]);
    writeFileSync(json, readFileSync(json, 'utf8').replace('"seed":7,', '"seed":8,'));   // una altra llavor
    bash('llanca-lot.sh', ['1', dir, list]);
    const out = lotOut(dir);
    assert.doesNotMatch(out, /^ja fet: petit$/m);
    assert.strictEqual(out.match(/^acaba: {3}petit$/gm).length, 3);
    // i un de complet, sí que se salta
    bash('llanca-lot.sh', ['1', dir, list]);
    assert.match(lotOut(dir), /^ja fet: petit$/m);
  }, withJson),
  // AU2-56 de l'auditor 2 (auditoria 9): el mateix nom i la mateixa llavor no n'hi ha prou
  "un experiment amb el mateix nom i llavor però una altra ordre es torna a fer (AU2-56)": () => withDir((dir) => {
    const json = slash(join(dir, 'petit.jsonl'));
    const base = `petit --world 32x32 --seed 7 --epochs 2 --census 250 --json ${json}`;
    const list = join(dir, 'llista.txt');
    const launch = (line) => { writeFileSync(list, line + '\n'); assert.strictEqual(bash('llanca-lot.sh', ['1', dir, list]).status, 0); };
    launch(base);
    // cada canvi de l'ordre, amb el mateix nom i la mateixa llavor: un altre horitzó, un altre corrent, una opció més
    const changes = [base.replace('--epochs 2', '--epochs 3'), `${base} --mixing 0.5`, `${base} --every 50`];
    for (const line of changes) launch(line);
    const out = lotOut(dir);
    assert.doesNotMatch(out, /^ja fet: petit$/m);
    assert.strictEqual(out.match(/^acaba: {3}petit$/gm).length, 1 + changes.length);
    // el JSONL és el de l'última ordre
    const start = JSON.parse(readFileSync(join(dir, 'petit.jsonl'), 'utf8').split('\n')[0]);
    assert.strictEqual(start.command, `node sim.mjs ${changes[changes.length - 1].replace(/^petit /, '')}`);
    // i amb la mateixa ordre, sí que se salta
    launch(changes[changes.length - 1]);
    assert.match(lotOut(dir), /^ja fet: petit$/m);
  }),
  // A6-03 de l'auditor 2 (AU2-38)
  "un nombre d'experiments alhora incorrecte es rebutja abans de començar, amb el codi 2": () => withBatch((dir, list) => {
    for (const p of ['INVALID', '0', '17', '-1', '2.5']) {
      const r = bash('llanca-lot.sh', [p, dir, list]);
      assert.strictEqual(r.status, 2, `${p}: ${r.stderr}`);
      assert.match(r.stderr, /enter d'1 a 16/);
      const e = spawnSync('bash', [join(root, 'eines', 'experiments.sh'), p, dir], { input: LIST, encoding: 'utf8' });
      assert.strictEqual(e.status, 2, `experiments.sh ${p}`);
    }
    assert.ok(!existsSync(join(dir, 'lot-llista.out')));
    assert.ok(!existsSync(join(dir, 'bo.log')));
  }),
  // A6-04 de l'auditor 2 (AU2-39)
  "una llista buida o només amb comentaris es rebutja, i no s'executa res": () => withDir((dir) => {
    for (const [name, content] of [['buida', ''], ['comentaris', '# res\n   \n  # tampoc\n']]) {
      const list = join(dir, `${name}.txt`);
      writeFileSync(list, content);
      const r = bash('llanca-lot.sh', ['2', dir, list]);
      assert.strictEqual(r.status, 2, name);
      assert.match(r.stderr, /no té cap experiment/);
      const e = spawnSync('bash', [join(root, 'eines', 'experiments.sh'), '2', dir], { input: content, encoding: 'utf8' });
      assert.strictEqual(e.status, 2, `experiments.sh, llista ${name}`);
    }
    assert.deepStrictEqual(readdirSync(dir).filter((f) => f.endsWith('.log') || f.endsWith('.out')), []);
  }),
  "una llista sense salt de línia al final executa l'última línia": () => withBatch((dir, list) => {
    assert.strictEqual(bash('llanca-lot.sh', ['1', dir, list]).status, 0);
    assert.match(lotOut(dir), /^acaba: {3}bo$/m);
  }, 'bo --world 32x32 --seed 1 --epochs 3 --census 250'),
  "noms repetits: el lot s'interromp amb el codi 2, i la línia final ho diu": () => withBatch((dir, list) => {
    const r = bash('llanca-lot.sh', ['2', dir, list]);
    assert.strictEqual(r.status, 2);
    const out = lotOut(dir);
    assert.match(out, /noms repetits a la llista: bo/);
    assert.match(out, /^== lot interromput \(codi 2\) .*: 0 acabats, 0 fallats, 0 ja fets$/m);
    assert.ok(!existsSync(join(dir, 'bo.log')));
  }, 'bo --world 32x32 --seed 1 --epochs 3\nbo --world 32x32 --seed 2 --epochs 3\n'),
  // AUD-59 de l'auditor 1
  "la carpeta i la llista relatives es resolen des d'on es crida": () => withDir((dir) => {
    writeFileSync(join(dir, 'llista.txt'), 'bo --world 32x32 --seed 1 --epochs 3 --census 250\n');
    const r = bash('llanca-lot.sh', ['1', 'sortida', 'llista.txt'], { cwd: dir });
    assert.strictEqual(r.status, 0, r.stderr);
    assert.ok(existsSync(join(dir, 'sortida', 'lot-llista.out')));
    assert.ok(existsSync(join(dir, 'sortida', 'bo.log')));
    assert.ok(!existsSync(join(root, 'sortida')));
  }),
  'seguiment.sh compta sense mostrar cap resultat': () => withBatch((dir, list) => {
    bash('llanca-lot.sh', ['2', dir, list]);
    const r = bash('seguiment.sh', [dir]);
    assert.strictEqual(r.status, 0, r.stderr);
    assert.match(r.stdout, /experiments: 2 {3}acabats: 1 {3}fallats: 1 {3}en marxa: 0/);
    assert.match(r.stdout, /registres complets dels acabats: 1 de 1$/m);
    assert.match(r.stdout, /fallats: dolent/);
    const fingerprint = readFileSync(join(dir, 'bo.log'), 'utf8').match(/empremta del món: (\S+)/)[1];
    assert.ok(!r.stdout.includes(fingerprint));
    assert.doesNotMatch(r.stdout, /H0=|HOE=|hereditaris/);
  }),
  // A6-05 de l'auditor 2 (AU2-40) i AUD-56 de l'auditor 1
  "seguiment.sh: un experiment acabat en un lot i 'ja fet' al següent compta una sola vegada": () => withBatch((dir, list) => {
    bash('llanca-lot.sh', ['1', dir, list]);
    bash('llanca-lot.sh', ['1', dir, list]);
    const r = bash('seguiment.sh', [dir]);
    assert.match(r.stdout, /experiments: 1 {3}acabats: 1 {3}fallats: 0 {3}en marxa: 0/);
    assert.match(r.stdout, /registres complets dels acabats: 1 de 1$/m);
  }, withJson),
  "seguiment.sh: l'últim estat mana (un fallat que torna a córrer és en marxa), i els noms amb carpeta": () => withDir((dir) => {
    writeFileSync(join(dir, 'lot-a.out'), [
      '== lot començat 2026-10-18 10:00:00 codi=abc llista=a.txt paral·lel=3',
      'comença: A/1001', 'comença: B/2001', 'comença: A/1002',
      'acaba:   A/1001', 'falla:   B/2001 (codi 1)', 'comença: B/2002',
      '== lot acabat 2026-10-18 11:00:00: 1 acabats, 1 fallats, 0 ja fets', '',
    ].join('\n'));
    writeFileSync(join(dir, 'lot-b.out'), [
      '== lot començat 2026-10-18 12:00:00 codi=abc llista=b.txt paral·lel=3',
      'ja fet: A/1001', 'comença: B/2001', '',
    ].join('\n'));
    for (const g of ['A', 'B']) mkdirSync(join(dir, g));
    writeFileSync(join(dir, 'A', '1001.log'), 'empremta del món: 1234abcd\n');
    writeFileSync(join(dir, 'A', '1002.log'), 'època 100 ...\n');
    writeFileSync(join(dir, 'B', '2001.log'), 'època 100 ...\n');
    const r = bash('seguiment.sh', [dir]);
    assert.strictEqual(r.status, 0, r.stderr);
    assert.match(r.stdout, /experiments: 4 {3}acabats: 1 {3}fallats: 0 {3}en marxa: 3/);
    assert.match(r.stdout, /lot-a\.out: lot acabat/);
    assert.match(r.stdout, /en marxa: B\/2001, sense escriure fa \d+ min/);
    assert.match(r.stdout, /en marxa: A\/1002, sense escriure fa \d+ min/);
    assert.match(r.stdout, /en marxa: B\/2002, encara sense registre/);
    assert.ok(!r.stdout.includes('1234abcd'));
  }),
  // AUD-57 de l'auditor 1
  "seguiment.sh --agregat no escriu cap nom": () => withBatch((dir, list) => {
    bash('llanca-lot.sh', ['2', dir, list]);
    const r = bash('seguiment.sh', ['--agregat', dir]);
    assert.strictEqual(r.status, 0, r.stderr);
    assert.match(r.stdout, /experiments: 2 {3}acabats: 1 {3}fallats: 1 {3}en marxa: 0/);
    assert.doesNotMatch(r.stdout, /\bbo\b|dolent/);
  }),
  "seguiment.sh: un acabat amb el JSONL incomplet surt com a incomplet": () => withBatch((dir, list) => {
    bash('llanca-lot.sh', ['1', dir, list]);
    const json = join(dir, 'petit.jsonl');
    writeFileSync(json, readFileSync(json, 'utf8').trim().split('\n').slice(0, -1).join('\n') + '\n');
    const r = bash('seguiment.sh', [dir]);
    assert.match(r.stdout, /registres complets dels acabats: 0 de 1 {3}INCOMPLETS: petit/);
  }, withJson),
  // Abans, una còpia neta de git aturava llanca-lot.sh sense escriure res (set -e i un "&&" dins de la
  // substitució del codi). Es prova en una còpia mínima del simulador, en els tres casos.
  "el codi del lot: còpia neta de git, còpia amb canvis i sense git (VERSIO)": () => withBatch((dir, list) => {
    const copy = join(dir, 'copia');
    mkdirSync(copy);
    mkdirSync(join(copy, 'eines'));
    for (const f of ['eines/llanca-lot.sh', 'eines/experiments.sh', 'sim.mjs', 'package.json']) copyFileSync(join(root, f), join(copy, f));
    for (const d of ['fase1', 'fase2']) {
      mkdirSync(join(copy, d));
      for (const f of readdirSync(join(root, d)).filter((f) => /\.m?js$/.test(f))) copyFileSync(join(root, d, f), join(copy, d, f));
    }
    const run = (cmd) => spawnSync('bash', ['-c', cmd], { cwd: copy, encoding: 'utf8' });
    const launch = () => {
      const r = spawnSync('bash', ['eines/llanca-lot.sh', '1', 'lot', list], { cwd: copy, encoding: 'utf8' });
      assert.strictEqual(r.status, 0, r.stderr);
      const out = readFileSync(join(copy, 'lot', 'lot-llista.out'), 'utf8');
      rmSync(join(copy, 'lot'), { recursive: true });
      return out;
    };
    writeFileSync(join(copy, 'VERSIO'), 'abc1234\n');
    let out = launch();
    assert.match(out, /^== lot començat .* codi=abc1234 /m);
    assert.match(out, /^acaba: {3}bo$/m);
    const git = 'git -c user.name=prova -c user.email=prova@exemple.invalid';
    assert.strictEqual(run(`${git} init -q && ${git} add -A && ${git} commit -q -m prova`).status, 0);
    const hash = run('git rev-parse --short HEAD').stdout.trim();
    out = launch();
    assert.match(out, new RegExp(`^== lot començat .* codi=${hash} `, 'm'));
    writeFileSync(join(copy, 'fase1', 'bff.js'), readFileSync(join(copy, 'fase1', 'bff.js'), 'utf8') + '\n// canvi\n');
    out = launch();
    assert.match(out, new RegExp(`^== lot començat .* codi=${hash}\\+canvis `, 'm'));
    // una llista de dins del repositori surt amb el camí relatiu a l'arrel, sense les carpetes de la màquina
    mkdirSync(join(copy, 'llistes'));
    copyFileSync(list, join(copy, 'llistes', 'llista.txt'));
    const r = spawnSync('bash', ['eines/llanca-lot.sh', '1', 'lot', 'llistes/llista.txt'], { cwd: copy, encoding: 'utf8' });
    assert.strictEqual(r.status, 0, r.stderr);
    assert.match(readFileSync(join(copy, 'lot', 'lot-llista.out'), 'utf8'), /^== lot començat .* llista=llistes\/llista\.txt paral·lel=1$/m);
  }),
  "desplega-vm.sh: l'adreça de la VM surt d'eines/local.env o de VM i VM_KEY, i sense cap de les dues s'atura": () => withDir((dir) => {
    mkdirSync(join(dir, 'eines'));
    mkdirSync(join(dir, 'bin'));
    copyFileSync(join(root, 'eines', 'desplega-vm.sh'), join(dir, 'eines', 'desplega-vm.sh'));
    // un ssh fals: apunta amb quins arguments l'han cridat i respon que el commit ja és desplegat
    writeFileSync(join(dir, 'bin', 'ssh'), '#!/usr/bin/env bash\necho "$@" >> "$(dirname "$0")/crides"\n', { mode: 0o755 });
    const env = { ...process.env };
    delete env.VM;
    delete env.VM_KEY;
    const deploy = (extra = {}) => spawnSync('bash', ['-c', 'PATH="$PWD/bin:$PATH" exec bash eines/desplega-vm.sh'],
      { cwd: dir, encoding: 'utf8', env: { ...env, ...extra } });
    let r = deploy();
    assert.strictEqual(r.status, 2, r.stderr);
    assert.match(r.stderr, /local\.env\.exemple/);
    writeFileSync(join(dir, 'eines', 'local.env'), 'VM=usuari@vm-del-fitxer\nVM_KEY=/clau/del-fitxer\n');
    const git = 'git -c user.name=prova -c user.email=prova@exemple.invalid';
    assert.strictEqual(spawnSync('bash', ['-c', `${git} init -q && ${git} add -A && ${git} commit -q -m prova`], { cwd: dir }).status, 0);
    r = deploy();
    assert.strictEqual(r.status, 0, r.stderr);
    assert.match(r.stdout, /^ja desplegat: /m);
    let calls = readFileSync(join(dir, 'bin', 'crides'), 'utf8');
    assert.match(calls, /^-i \/clau\/del-fitxer -o BatchMode=yes usuari@vm-del-fitxer test -e /m);
    // les variables d'entorn tenen prioritat sobre el fitxer
    rmSync(join(dir, 'bin', 'crides'));
    r = deploy({ VM: 'usuari@vm-de-l-entorn', VM_KEY: '/clau/de-l-entorn' });
    assert.strictEqual(r.status, 0, r.stderr);
    calls = readFileSync(join(dir, 'bin', 'crides'), 'utf8');
    assert.match(calls, /^-i \/clau\/de-l-entorn -o BatchMode=yes usuari@vm-de-l-entorn test -e /m);
  }),
  'llanca-lot.sh rebutja els arguments incorrectes': () => {
    assert.strictEqual(bash('llanca-lot.sh', ['2']).status, 2);
    assert.strictEqual(bash('llanca-lot.sh', ['2', tmpdir(), 'no-existeix.txt']).status, 2);
    assert.strictEqual(bash('seguiment.sh', []).status, 2);
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
