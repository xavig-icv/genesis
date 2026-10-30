// Proves d'eines/densitat.mjs, el nivell 1 de B1 (docs/pla-b1.md). Cap no mira quants replicadors hi ha: només que les
// opcions es validin, que el resultat no depengui dels fils ni dels trossos, que la sopa de cada programa només depengui de
// la llavor i de l'índex, que la prova sigui la del cens amb la química (AUD-65), i que el JSONL sigui complet i coherent.
// Executa: node test/densitat.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { soupFor, testSoup, testRange, DISTRIBUTIONS, NOISE } from '../eines/densitat.mjs';
import { evaluator, OPCODES, PROGRAM_SIZE } from '../fase1/bff.js';
import { replicationTest } from '../fase2/replication.js';
import { makeRng } from '../fase1/soup.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const SEED = 777; // una llavor de prova, que no és la del pla
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'densitat-')); try { fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }
const tool = (...a) => spawnSync(process.execPath, [join(root, 'eines', 'densitat.mjs'), ...a], { cwd: root, encoding: 'utf8' });
const lines = (f) => readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
// les línies dels resultats: sense la de l'inici (porta l'ordre) ni els segons de la final
const results = (f) => lines(f).filter((o) => o.type !== 'start').map((o) => { const { seconds, ...rest } = o; return JSON.stringify(rest); });
// El replicador real de la Fase 1 (fase2/test-world.mjs)
const REPLICATOR = Uint8Array.from([140,221,0,221,20,164,126,32,105,126,78,173,241,242,207,220,199,45,213,101,52,91,155,79,44,60,2,125,93,71,65,217,65,5,71,141,93,141,15,5,65,217,15,71,93,125,2,60,44,79,155,91,52,101,213,45,0,0,62,82,0,77,77,0]);

const tests = {
  'les opcions es validen: les que falten, les desconegudes, els valors fora de rang i el fitxer que ja existeix'() {
    withTmp((tmp) => {
      const out = join(tmp, 'a.jsonl'), ok = ['--quimica', 'C0', '--distribucio', 'd-mig', '--llavor', '1', '--programes', '10', '--json', out];
      assert.strictEqual(tool('--help').status, 0);
      const bad = [
        ok.filter((_, i) => i < 2 || i > 3),                                      // sense --distribucio
        [...ok, '--color', 'blau'],
        [...ok, '--fils', '17'],
        [...ok, '--fils', '0'],
        [...ok, '--de', '-1'],
        [...ok, '--de', '999999995'],                                              // de + programes > 10⁹
        [...ok, '--llavor', '2'],                                                  // repetida
        ok.map((v) => (v === 'C0' ? 'C9' : v)),
        ok.map((v) => (v === 'd-mig' ? 'cust' : v)),
        ok.map((v) => (v === '10' ? '0' : v)),
        ok.map((v) => (v === '10' ? '1,5' : v)),
        [...ok, 'sobrant'],
      ];
      for (const a of bad) assert.strictEqual(tool(...a).status, 2, a.join(' '));
      assert.strictEqual(tool(...ok).status, 0);
      const before = readFileSync(out, 'utf8');
      const r = tool(...ok);
      assert.strictEqual(r.status, 2);
      assert.match(r.stderr, /ja existeix/);
      assert.strictEqual(readFileSync(out, 'utf8'), before, 'no el sobreescriu');
    });
  },
  "el resultat no depèn dels fils, dels trossos ni de l'ordre"() {
    withTmp((tmp) => {
      const base = ['--quimica', 'H64', '--distribucio', 'd-mig', '--llavor', String(SEED)];
      const f = (name) => join(tmp, `${name}.jsonl`);
      assert.strictEqual(tool(...base, '--programes', '240', '--tros', '40', '--json', f('u')).status, 0);
      assert.strictEqual(tool(...base, '--programes', '240', '--tros', '40', '--fils', '4', '--json', f('q')).status, 0);
      assert.deepStrictEqual(results(f('q')), results(f('u')));
      // en dos trossos: els mateixos replicadors, i els totals sumen
      assert.strictEqual(tool(...base, '--programes', '100', '--json', f('a')).status, 0);
      assert.strictEqual(tool(...base, '--programes', '140', '--de', '100', '--fils', '2', '--json', f('b')).status, 0);
      const found = (file) => lines(file).filter((o) => o.type === 'replicator').map((o) => JSON.stringify(o));
      assert.deepStrictEqual([...found(f('a')), ...found(f('b'))], found(f('u')));
      const end = (file) => { const l = lines(file); return l[l.length - 1]; };
      for (const k of ['tested', 'replicates', 'heritable', 'heritableSolo', 'heritableContext']) assert.strictEqual(end(f('a'))[k] + end(f('b'))[k], end(f('u'))[k], k);
      // i és el que dona testRange, sense l'eina
      const direct = testRange(0, 240, { seed: SEED, distribution: 'd-mig', chemistry: 'H64' });
      assert.deepStrictEqual(direct.found.map((o) => JSON.stringify(o)), found(f('u')));
      assert.strictEqual(direct.counts.tested, 240);
    });
  },
  'el JSONL és complet: la línia d\'inici, els recomptes acumulats, els replicadors en ordre i l\'empremta'() {
    withTmp((tmp) => {
      const out = join(tmp, 'a.jsonl');
      assert.strictEqual(tool('--quimica', 'K2', '--distribucio', 'uniforme', '--llavor', String(SEED), '--programes', '150', '--de', '7', '--tros', '50', '--json', out).status, 0);
      const ls = lines(out), start = ls[0], end = ls[ls.length - 1];
      assert.strictEqual(start.type, 'start');
      assert.deepStrictEqual([start.chemistry, start.distribution, start.seed, start.from, start.to, start.programs, start.noise, start.chunk], ['K2', 'uniforme', SEED, 7, 157, 150, NOISE, 50]);
      assert.match(start.code, /^[0-9a-f]{7}/);
      assert.strictEqual(start.command, `node eines/densitat.mjs --quimica K2 --distribucio uniforme --llavor ${SEED} --programes 150 --de 7 --tros 50 --json ${out}`);
      assert.strictEqual(end.type, 'end');
      assert.deepStrictEqual([end.from, end.to, end.tested], [7, 157, 150]);
      const counts = ls.filter((o) => o.type === 'count');
      assert.deepStrictEqual(counts.map((o) => o.upTo), [57, 107, 157]);
      let prev = -1, replicates = 0, heritable = 0;
      for (const o of ls.slice(1, -1)) {
        if (o.type === 'replicator') {
          assert.ok(o.index > prev && o.index >= 7 && o.index < 157);
          prev = o.index;
          assert.strictEqual(o.bytes.length, 2 * PROGRAM_SIZE);
          assert.ok(o.solo || o.context);
          replicates++;
          if (o.heritableSolo || o.heritableContext) heritable++;
        } else {
          assert.strictEqual(o.type, 'count');
          assert.strictEqual(o.tested, o.upTo - 7);
          assert.strictEqual(o.replicates, replicates);
          assert.strictEqual(o.heritable, heritable);
        }
      }
      const hash = createHash('sha256');
      for (const o of ls.slice(1, -1)) hash.update(JSON.stringify(o) + '\n');
      assert.strictEqual(end.fingerprint, hash.digest('hex'));
    });
  },
  'la sopa i la prova de cada programa només depenen de la llavor i de l\'índex'() {
    assert.deepStrictEqual(soupFor(12, SEED, 'd-mig'), soupFor(12, SEED, 'd-mig'));
    assert.notDeepStrictEqual(soupFor(12, SEED, 'd-mig'), soupFor(13, SEED, 'd-mig'));
    assert.notDeepStrictEqual(soupFor(12, SEED, 'd-mig'), soupFor(12, SEED + 1, 'd-mig'));
    assert.strictEqual(soupFor(0, SEED, 'd-mig').length, PROGRAM_SIZE * (1 + NOISE));
    assert.notDeepStrictEqual(soupFor(5, SEED, 'd-mig').subarray(0, PROGRAM_SIZE), soupFor(5, SEED, 'uniforme').subarray(0, PROGRAM_SIZE));
    const interpret = evaluator('C0');
    assert.deepStrictEqual(testSoup(soupFor(3, SEED, 'd-mig'), 3, SEED, interpret), testSoup(soupFor(3, SEED, 'd-mig'), 3, SEED, interpret));
  },
  'les distribucions: d-mig, la meitat instruccions i la resta dels altres 246 valors; uniforme, els 256'() {
    const instr = new Set([...OPCODES].map((c) => c.charCodeAt(0)));
    for (const [name, share, values] of [['d-mig', 0.5, 256], ['uniforme', 10 / 256, 256]]) {
      const rng = makeRng(9, 'v2'), seen = new Set();
      let n = 0, k = 0;
      for (let i = 0; i < 200000; i++) { const v = DISTRIBUTIONS[name](rng); seen.add(v); n++; if (instr.has(v)) k++; }
      assert.ok(Math.abs(k / n - share) < 0.006, `${name}: ${k / n}`);
      assert.strictEqual(seen.size, values, name);
    }
  },
  "la prova és la del cens, amb la química (AUD-65): el replicador de la Fase 1, a la cel·la 0, és hereditari amb C0 i no amb K0"() {
    const soup = soupFor(0, SEED, 'uniforme');
    soup.set(REPLICATOR, 0);
    const c0 = testSoup(soup, 0, SEED, evaluator('C0'));
    assert.ok(c0.heritable, JSON.stringify(c0));
    assert.ok(!testSoup(soup, 0, SEED, evaluator('K0')).heritable);
    // és replicationTest, amb l'herència, completa, i l'atzar del programa: la llavor més 2i + 1
    assert.deepStrictEqual(c0, replicationTest(soup, 0, makeRng((SEED + 1) >>> 0, 'v2'), { heredity: true, complete: true }));
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
