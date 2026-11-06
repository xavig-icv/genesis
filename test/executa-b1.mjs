// Proves d'eines/executa-b1.sh, l'executor de B1 amb la guarda de l'AUD-174 (docs/pla-b1.md, §11). En un repositori de prova, amb
// unes eines falses que només escriuen la línia d'inici i la final:
//   - una llista bona s'executa sencera, i una segona vegada se salta el que ja és sencer;
//   - la SHA-256, el commit, una ordre que no és de B1 o un registre repetit l'aturen abans de començar;
//   - la guarda: un fitxer de codi sense seguir o amb canvis l'atura abans de començar, i també abans de cada ordre;
//   - un registre que diu "+canvis" l'atura.
// Executa: node test/executa-b1.mjs (necessita bash i git: Git Bash a Windows)
import assert from 'assert';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, copyFileSync, existsSync, appendFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');
// Una eina falsa: escriu la línia d'inici (amb el codi que li diu la variable CODI, si n'hi ha) i la final al fitxer de --json. Si
// hi ha la variable NOU, abans crea aquell fitxer de codi a l'arrel
const FAKE = `import { writeFileSync } from 'fs';
const a = process.argv.slice(2), json = a[a.indexOf('--json') + 1];
if (process.env.NOU) writeFileSync(process.env.NOU, '// nou\\n');
writeFileSync(json, JSON.stringify({ type: 'start', code: process.env.CODI || 'abc1234' }) + '\\n' + JSON.stringify({ type: 'end' }) + '\\n', { flag: 'wx' });
`;
function withRepo(fn) {
  const tmp = mkdtempSync(join(tmpdir(), 'executa-'));
  try {
    const git = (...a) => spawnSync('git', a, { cwd: tmp, encoding: 'utf8' });
    git('init', '-q');
    git('config', 'user.email', 'prova@example.com');
    git('config', 'user.name', 'prova');
    git('config', 'core.autocrlf', 'false');
    mkdirSync(join(tmp, 'eines'));
    mkdirSync(join(tmp, 'r'));
    for (const t of ['densitat', 'autonomia', 'estrats']) writeFileSync(join(tmp, 'eines', `${t}.mjs`), FAKE);
    writeFileSync(join(tmp, 'package.json'), '{ "type": "module" }\n');
    copyFileSync(join(root, 'eines', 'executa-b1.sh'), join(tmp, 'eines', 'executa-b1.sh'));
    writeFileSync(join(tmp, 'r', 'llista.txt'), 'node eines/autonomia.mjs --quimica C0 --json r/a.jsonl\nnode eines/estrats.mjs --programa estrat:3 --json r/b.jsonl\n');
    git('add', '.');
    git('commit', '-q', '-m', 'prova');
    const head = git('rev-parse', 'HEAD').stdout.trim();
    const exec = (env = {}, list = 'r/llista.txt', s = sha(join(tmp, list)), commit = head) =>
      spawnSync('bash', ['eines/executa-b1.sh', list, s, commit], { cwd: tmp, encoding: 'utf8', env: { ...process.env, ...env } });
    fn({ tmp, git, exec, head, estat: () => readFileSync(join(tmp, 'r', 'estat-llista.txt'), 'utf8') });
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}

const tests = {
  "una llista bona s'executa sencera, i la segona vegada se salta el que ja és sencer"() {
    withRepo(({ tmp, exec, estat }) => {
      const r = exec();
      assert.strictEqual(r.status, 0, r.stderr);
      assert.ok(existsSync(join(tmp, 'r', 'a.jsonl')) && existsSync(join(tmp, 'r', 'b.jsonl')));
      assert.match(estat(), /acabat\n$/);
      const ex = readFileSync(join(tmp, 'r', 'execucio-llista.txt'), 'utf8');
      // sha256sum escriu "SHA  fitxer", o "SHA *fitxer" a Windows
      assert.match(ex, /registres \(SHA-256\):\n[0-9a-f]{64} [ *]r\/a\.jsonl\n[0-9a-f]{64} [ *]r\/b\.jsonl\n$/);
      assert.strictEqual(exec().status, 0);
      assert.strictEqual((estat().match(/ja és sencer, se salta/g) ?? []).length, 2);
    });
  },
  "la SHA-256, el commit, una ordre que no és de B1 o un registre repetit l'aturen abans de començar"() {
    withRepo(({ tmp, git, exec }) => {
      assert.strictEqual(exec({}, 'r/llista.txt', '0'.repeat(64)).status, 2);
      assert.strictEqual(exec({}, 'r/llista.txt', undefined, '0'.repeat(40)).status, 2);
      for (const [name, text] of [['dolenta', 'node sim.mjs --json r/x.jsonl\n'], ['repetida', 'node eines/densitat.mjs --json r/x.jsonl\nnode eines/estrats.mjs --json r/x.jsonl\n']]) {
        writeFileSync(join(tmp, 'r', `${name}.txt`), text);
        git('add', '.'); git('commit', '-q', '-m', name);
        const head = git('rev-parse', 'HEAD').stdout.trim();
        assert.strictEqual(exec({}, `r/${name}.txt`, undefined, head).status, 2, name);
      }
      assert.ok(!existsSync(join(tmp, 'r', 'x.jsonl')));
    });
  },
  "la guarda: un fitxer de codi sense seguir o amb canvis l'atura abans de començar (AUD-174)"() {
    withRepo(({ tmp, exec, estat }) => {
      writeFileSync(join(tmp, 'compara.mjs'), '// sense seguir\n');
      let r = exec();
      assert.strictEqual(r.status, 2);
      assert.match(estat(), /hi ha codi amb canvis o sense seguir \(AUD-174\): \?\? compara\.mjs/);
      assert.ok(!existsSync(join(tmp, 'r', 'a.jsonl')));
      rmSync(join(tmp, 'compara.mjs'));
      appendFileSync(join(tmp, 'eines', 'estrats.mjs'), '// un canvi\n');
      r = exec();
      assert.strictEqual(r.status, 2);
      assert.ok(!existsSync(join(tmp, 'r', 'a.jsonl')));
    });
  },
  "la guarda, abans de cada ordre: si en surt un fitxer de codi nou, s'atura abans de la següent"() {
    withRepo(({ tmp, exec, estat }) => {
      const r = exec({ NOU: 'nou.mjs' });
      assert.strictEqual(r.status, 2);
      assert.ok(existsSync(join(tmp, 'r', 'a.jsonl')) && !existsSync(join(tmp, 'r', 'b.jsonl')));
      assert.match(estat(), /aturat: hi ha codi amb canvis o sense seguir \(AUD-174\): \?\? nou\.mjs/);
    });
  },
  "un registre que diu \"+canvis\" l'atura"() {
    withRepo(({ tmp, exec, estat }) => {
      const r = exec({ CODI: 'abc1234+canvis' });
      assert.strictEqual(r.status, 1);
      assert.match(estat(), /el registre r\/a\.jsonl diu \+canvis/);
      assert.ok(!existsSync(join(tmp, 'r', 'b.jsonl')));
    });
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
