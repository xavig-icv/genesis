// Proves d'eines/densitat-analisi.mjs, l'anàlisi del nivell 1 de B1 (docs/pla-b1.md, §5 i §6), amb registres sintètics:
//   - l'interval de Clopper-Pearson, contra el de fase2/maduracio-serie.mjs, i amb n = 10⁸;
//   - un resultat conegut: les densitats, la taula aparellada amb C0, el quocient, l'avís dels controls i les regles;
//   - la validació: cada manera com un registre no és el del pla és un problema;
//   - els fitxers que escriu eines/densitat.mjs passen la validació.
// Executa: node test/densitat-analisi.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { clopperPearson, ratio, readRun, readFolder, analyse } from '../eines/densitat-analisi.mjs';
import { clopperPearson as reference } from '../fase2/maduracio-serie.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'densitat-analisi-')); try { fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }
const BYTES = '2b'.repeat(10) + '01'.repeat(54); // 10 instruccions ('+') i 54 bytes de dades
const KEYS = ['tested', 'replicates', 'heritable', 'heritableSolo', 'heritableContext'];
// Un registre com el d'eines/densitat.mjs. reps: els programes que es repliquen, { index, solo, context, hs, hc }
function writeRun(dir, { chemistry, distribution = 'd-mig', seed = 5, from = 0, to = 1000, chunk = 250, code = 'abc1234', noise = 8, reps = [], end: endPatch = {} }) {
  const lines = [{ type: 'start', code, node: 'v16', command: 'x', chemistry, description: '', distribution, seed, from, to, programs: to - from, noise, chunk, test: '' }];
  const totals = Object.fromEntries(KEYS.map((k) => [k, 0])), hash = createHash('sha256');
  const push = (o) => { hash.update(JSON.stringify(o) + '\n'); lines.push(o); };
  for (let a = from; a < to; a += chunk) {
    const b = Math.min(to, a + chunk);
    for (const r of reps.filter((x) => x.index >= a && x.index < b).sort((x, y) => x.index - y.index)) {
      const o = { type: 'replicator', index: r.index, bytes: BYTES, solo: r.solo ?? true, context: r.context ?? false, heritableSolo: r.hs ?? false, heritableContext: r.hc ?? false };
      push(o);
      totals.replicates++;
      if (o.heritableSolo || o.heritableContext) totals.heritable++;
      if (o.heritableSolo) totals.heritableSolo++;
      if (o.heritableContext) totals.heritableContext++;
    }
    totals.tested = b - from;
    push({ type: 'count', upTo: b, ...totals });
  }
  lines.push({ type: 'end', from, to, ...totals, fingerprint: hash.digest('hex'), seconds: 1, ...endPatch });
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${chemistry}-${distribution}-${from}.jsonl`);
  writeFileSync(file, lines.map((o) => JSON.stringify(o)).join('\n') + '\n');
  return file;
}
const heritable = (indices, extra = {}) => indices.map((index) => ({ index, hs: true, ...extra }));
const range = (a, b, step = 1) => Array.from({ length: Math.ceil((b - a) / step) }, (_, i) => a + i * step);

const tests = {
  "l'interval de Clopper-Pearson és el de fase2/maduracio-serie.mjs, i serveix amb n = 10⁸"() {
    // amb n = 10⁶, el de la sèrie, amb la seva taula de log-factorials, té un error d'arrodoniment d'uns 10⁻⁸ (a la sèrie, n
    // és com a molt 300): la diferència tolerada hi és de 10⁻⁷. El d'aquí suma ln C(n, i) des d'i = 0, i a P(X ≤ 499) amb
    // p = 4,5713814·10⁻⁴ dona el valor exacte, fet amb racionals, fins a 10⁻¹²
    for (const [k, n, tol] of [[0, 1000, 1e-9], [3, 1000, 1e-9], [30, 100000, 1e-9], [1000, 1000, 1e-9], [0, 1000000, 1e-7], [500, 1000000, 1e-7]]) {
      const [a, b] = clopperPearson(k, n), [c, d] = reference(k, n);
      assert.ok(Math.abs(a - c) <= tol * c && Math.abs(b - d) <= tol * d, `${k} de ${n}: ${a} ${b} contra ${c} ${d}`);
    }
    // 5 de 10⁸: l'interval exacte de Poisson per a 5, 1,6235 i 11,668, dividit per 10⁸
    const [lo, hi] = clopperPearson(5, 1e8);
    assert.ok(Math.abs(lo / 1.6235e-8 - 1) < 1e-4 && Math.abs(hi / 11.668e-8 - 1) < 1e-4, `${lo} ${hi}`);
    // el quocient: 20 contra 40, la binomial condicionada; sense cap, no n'hi ha
    const r = ratio(20, 40), [p, q] = clopperPearson(20, 60);
    assert.strictEqual(r.value, 0.5);
    assert.ok(Math.abs(r.ci[0] - p / (1 - p)) < 1e-12 && Math.abs(r.ci[1] - q / (1 - q)) < 1e-12);
    assert.deepStrictEqual(ratio(0, 0), { value: null, ci: [null, null] });
  },
  'un resultat conegut: les densitats, la taula aparellada, el quocient i les regles'() {
    withTmp((tmp) => {
      const c0 = range(0, 1000, 25);                                      // 40 hereditaris
      writeRun(tmp, { chemistry: 'C0', reps: heritable(c0) });
      writeRun(tmp, { chemistry: 'K1', reps: [...heritable(c0.slice(0, 20), { context: true }), ...heritable([3, 7, 11, 13, 17], { context: true, hs: false, hc: true })] });
      writeRun(tmp, { chemistry: 'K0', reps: [{ index: 4, solo: true }] }); // es replica, però no és hereditari
      writeRun(tmp, { chemistry: 'L0' });
      // H64 en dos trossos, amb trossos de mides diferents
      writeRun(tmp, { chemistry: 'H64', to: 600, chunk: 100, reps: heritable(range(0, 600, 10)) });
      writeRun(tmp, { chemistry: 'H64', from: 600, to: 1000, reps: heritable(range(600, 1000, 10)) });
      writeRun(tmp, { chemistry: 'C0', distribution: 'uniforme', to: 2000 });
      writeRun(tmp, { chemistry: 'K0', distribution: 'uniforme', to: 2000 });
      const { groups, problems } = readFolder(tmp);
      assert.deepStrictEqual(problems, []);
      const out = analyse(groups), text = out.join('\n');
      const [lo, hi] = clopperPearson(40, 1000).map((x) => x.toExponential(2).replace('e', '·10^'));
      assert.ok(out.includes(`  C0: 40 hereditaris de 1000 (4.00·10^-2; IC del 95 %, de ${lo} a ${hi}); sols 40, només en context 0; es repliquen 40; instruccions per programa, de 10 a 10 (mediana 10)`), text);
      assert.ok(out.some((l) => l.startsWith('  K1: 25 hereditaris de 1000') && l.includes('sols 20, només en context 5')), text);
      assert.ok(out.some((l) => l.startsWith('  K0: 0 hereditaris de 1000') && l.includes('es repliquen 1')), text);
      assert.ok(out.some((l) => l.startsWith('  H64: 100 hereditaris de 1000')), text);
      // la taula aparellada: a totes dues, només a C0, només a la variant
      const r = ratio(25, 40);
      assert.ok(out.includes(`    K1: 20, 20, 5; quocient ${r.value.toFixed(2)} (de ${r.ci[0].toFixed(2)} a ${r.ci[1].toFixed(2)})`), text);
      // C0, cada 25; H64, cada 10: a tots dos, els múltiples de 50
      assert.ok(out.some((l) => l.startsWith('    H64: 20, 20, 80;')), text);
      // en l'ordre de les químiques del pla, i no en el dels fitxers
      assert.deepStrictEqual(out.filter((l) => /^ {2}[A-Z]\w*: \d+ hereditaris/.test(l)).map((l) => l.trim().split(':')[0]), ['C0', 'K0', 'L0', 'K1', 'H64', 'C0', 'K0']);
      assert.ok(out.includes('Ampliació (§5): C0 hi té 40 hereditaris: no cal'), text);
      assert.ok(out.includes('Al nivell 2 (§6), amb d-mig: C0, K1, H64'), text);
      assert.ok(out.some((l) => l.startsWith('Sense cap hereditari en 1000 programes: K0, L0')), text);
      assert.ok(out.includes('Distribució uniforme: 2 químiques, 2000 programes cadascuna, els mateixos a totes'), text);
      assert.ok(!/ATENCIÓ/.test(text), text);
    });
  },
  "un control amb hereditaris: l'avís, i cap regla no s'aplica; i amb poc C0, l'ampliació"() {
    withTmp((tmp) => {
      writeRun(tmp, { chemistry: 'C0', reps: heritable([1, 2, 3]) });
      writeRun(tmp, { chemistry: 'S4', reps: heritable([2, 9]) });
      const out = analyse(readFolder(tmp).groups), text = out.join('\n');
      assert.ok(out.some((l) => l.startsWith('  ATENCIÓ: el control S4 té 2 hereditaris (programes 2, 9)')), text);
      assert.ok(/no s'apliquen fins que no s'hagin mirat els hereditaris dels controls/.test(text), text);
      assert.ok(!/Al nivell 2/.test(text) && !/Ampliació/.test(text), text);
    });
    withTmp((tmp) => {
      writeRun(tmp, { chemistry: 'C0', reps: heritable([1, 2, 3]) });
      writeRun(tmp, { chemistry: 'K0' });
      const out = analyse(readFolder(tmp).groups);
      assert.ok(out.includes('Ampliació (§5): C0 hi té 3 hereditaris, menys de 30: totes les variants passen a 10⁸ programes, els mateixos'), out.join('\n'));
    });
  },
  'la validació: cada manera com els registres no són els del pla és un problema'() {
    const cases = [
      ['un forat', (d) => { writeRun(d, { chemistry: 'C0' }); writeRun(d, { chemistry: 'K0', to: 400 }); writeRun(d, { chemistry: 'K0', from: 500, to: 1000 }); }, /hi falten programes a partir del 400/],
      ['un solapament', (d) => { writeRun(d, { chemistry: 'C0' }); writeRun(d, { chemistry: 'K0', to: 600 }); writeRun(d, { chemistry: 'K0', from: 500, to: 1000 }); }, /es repeteixen programes a partir del 600/],
      ['una altra N', (d) => { writeRun(d, { chemistry: 'C0' }); writeRun(d, { chemistry: 'K0', to: 900 }); }, /900 programes, i les altres químiques en tenen 1000/],
      ['una altra llavor', (d) => { writeRun(d, { chemistry: 'C0' }); writeRun(d, { chemistry: 'K0', seed: 6 }); }, /una altra llavor/],
      ['un altre soroll', (d) => { writeRun(d, { chemistry: 'C0' }); writeRun(d, { chemistry: 'K0', noise: 4 }); }, /un altre soroll/],
      ['un altre commit', (d) => { writeRun(d, { chemistry: 'C0' }); writeRun(d, { chemistry: 'K0', code: 'abc9999' }); }, /el mateix commit/],
      ['el codi amb canvis', (d) => { writeRun(d, { chemistry: 'C0', code: 'abc1234+canvis' }); }, /sense canvis/],
      ["l'empremta", (d) => { writeRun(d, { chemistry: 'C0', end: { fingerprint: '0'.repeat(64) } }); }, /l'empremta no és la dels resultats/],
      ['el total final', (d) => { writeRun(d, { chemistry: 'C0', reps: heritable([5]), end: { heritable: 2 } }); }, /el total de la línia final/],
      ["l'herència sense la replicació", (d) => { writeRun(d, { chemistry: 'C0', reps: [{ index: 5, solo: false, context: true, hs: true }] }); }, /no és coherent/],
      ['un fitxer sense la línia final', (d) => { const f = writeRun(d, { chemistry: 'C0' }); writeFileSync(f, readFileSync(f, 'utf8').trim().split('\n').slice(0, -1).join('\n') + '\n'); }, /no és sencer/],
      ['un replicador esborrat', (d) => { const f = writeRun(d, { chemistry: 'C0', reps: heritable([5, 6]) }); writeFileSync(f, readFileSync(f, 'utf8').split('\n').filter((l) => !l.includes('"index":6')).join('\n')); }, /no és el dels replicadors|l'empremta/],
      ['una carpeta buida', () => {}, /cap JSONL/],
    ];
    for (const [what, make, why] of cases) {
      withTmp((tmp) => {
        make(tmp);
        const { problems } = readFolder(tmp);
        assert.ok(problems.length && problems.some((p) => why.test(p)), `${what}: ${JSON.stringify(problems)}`);
      });
    }
  },
  "la línia d'ordres: amb problemes, codi 1 i cap anàlisi; sense carpeta, codi 2; i un resultat bo, codi 0"() {
    const cli = (...a) => spawnSync(process.execPath, [join(root, 'eines', 'densitat-analisi.mjs'), ...a], { encoding: 'utf8' });
    assert.strictEqual(cli().status, 2);
    withTmp((tmp) => {
      writeRun(tmp, { chemistry: 'C0', code: 'abc1234+canvis' });
      const r = cli(tmp);
      assert.strictEqual(r.status, 1);
      assert.match(r.stdout, /Els registres no són els del pla/);
      assert.ok(!/hereditaris de/.test(r.stdout));
    });
    withTmp((tmp) => {
      writeRun(tmp, { chemistry: 'C0', reps: heritable([1]) });
      const r = cli(tmp);
      assert.strictEqual(r.status, 0, r.stdout);
      assert.match(r.stdout, /C0: 1 hereditaris de 1000/);
    });
  },
  "els fitxers d'eines/densitat.mjs passen la validació de cada fitxer"() {
    withTmp((tmp) => {
      const out = join(tmp, 'a.jsonl');
      const r = spawnSync(process.execPath, [join(root, 'eines', 'densitat.mjs'), '--quimica', 'S1', '--distribucio', 'd-mig', '--llavor', '777', '--programes', '120', '--de', '30', '--tros', '40', '--fils', '2', '--json', out], { encoding: 'utf8' });
      assert.strictEqual(r.status, 0, r.stderr);
      const run = readRun(out);
      assert.deepStrictEqual(run.problems, []);
      assert.deepStrictEqual([run.start.from, run.start.to, run.end.tested], [30, 150, 120]);
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
