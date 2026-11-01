// Proves d'eines/densitat-analisi.mjs, l'anàlisi del nivell 1 de B1 (docs/pla-b1.md, §5 i §6), amb registres sintètics:
//   - l'interval de Clopper-Pearson, contra el de fase2/maduracio-serie.mjs, i amb n = 10⁸;
//   - un resultat conegut: les densitats, la taula aparellada amb C0, el quocient, l'avís dels controls i les regles;
//   - la validació: cada manera com un registre no és el del pla és un problema, també el pla incomplet (AUD-142, AU2-103) i
//     uns mòduls que no són els d'aquesta còpia (AUD-139, AU2-102);
//   - la línia d'ordres, amb el pla de veritat;
//   - els fitxers que escriu eines/densitat.mjs passen la validació.
// Executa: node test/densitat-analisi.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { clopperPearson, ratio, readRun, readFolder, analyse, PLAN, CONTROLS } from '../eines/densitat-analisi.mjs';
import { soupFor, moduleHashes, MODULES, TEST } from '../eines/densitat.mjs';
import { OPCODES, PROGRAM_SIZE } from '../fase1/bff.js';
import { clopperPearson as reference } from '../fase2/maduracio-serie.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'densitat-analisi-')); try { fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }
const KEYS = ['tested', 'replicates', 'heritable', 'heritableSolo', 'heritableContext'];
// Uns mòduls de mentida per als registres sintètics: la validació els compara amb els que se li passen
const FAKE = Object.fromEntries(MODULES.map((m, i) => [m, String(i).repeat(64)]));
// Un pla petit, per a les proves: la llavor 5, poques químiques i pocs programes
const SMALL = { seed: 5, noise: 8, distributions: { 'd-mig': { chemistries: ['C0', 'K0', 'L0', 'K1', 'H64'], sizes: [1000] }, uniforme: { chemistries: ['C0', 'K0'], sizes: [2000] } } };
const check = (dir, plan = SMALL) => readFolder(dir, { plan, modules: FAKE });
// els bytes del programa de la llavor i l'índex, com els desa eines/densitat.mjs
const program = (index, seed, distribution) => Buffer.from(soupFor(index, seed, distribution).subarray(0, PROGRAM_SIZE)).toString('hex');
// Un registre com el d'eines/densitat.mjs. reps: els programes que es repliquen, { index, solo, context, hs, hc, bytes }
function writeRun(dir, { chemistry, distribution = 'd-mig', seed = 5, from = 0, to = 1000, chunk = 250, code = 'abc1234', noise = 8, modules = FAKE, reps = [], start: startPatch = {}, end: endPatch = {} }) {
  const command = `node eines/densitat.mjs --quimica ${chemistry} --distribucio ${distribution} --llavor ${seed} --programes ${to - from} --de ${from} --json x.jsonl`;
  const lines = [{ type: 'start', code, modules, node: 'v16', command, chemistry, description: '', distribution, seed, from, to, programs: to - from, noise, chunk, test: TEST, ...startPatch }];
  const totals = Object.fromEntries(KEYS.map((k) => [k, 0])), hash = createHash('sha256');
  const push = (o) => { hash.update(JSON.stringify(o) + '\n'); lines.push(o); };
  for (let a = from; a < to; a += chunk) {
    const b = Math.min(to, a + chunk);
    for (const r of reps.filter((x) => x.index >= a && x.index < b).sort((x, y) => x.index - y.index)) {
      const o = { type: 'replicator', index: r.index, bytes: r.bytes ?? program(r.index, seed, distribution), solo: r.solo ?? true, context: r.context ?? false, heritableSolo: r.hs ?? false, heritableContext: r.hc ?? false };
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
const INSTRUCTIONS = new Set([...OPCODES].map((c) => c.charCodeAt(0)));
const instructions = (index) => [...soupFor(index, 5, 'd-mig').subarray(0, PROGRAM_SIZE)].filter((b) => INSTRUCTIONS.has(b)).length;
const median = (v) => { const s = [...v].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

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
      const { groups, problems } = check(tmp);
      assert.deepStrictEqual(problems, []);
      const out = analyse(groups), text = out.join('\n');
      const [lo, hi] = clopperPearson(40, 1000).map((x) => x.toExponential(2).replace('e', '·10^'));
      const instr = c0.map(instructions);
      assert.ok(out.includes(`  C0: 40 hereditaris de 1000 (4.00·10^-2; IC del 95 %, de ${lo} a ${hi}); sols 40, només en context 0; es repliquen 40; instruccions per programa, de ${Math.min(...instr)} a ${Math.max(...instr)} (mediana ${median(instr)})`), text);
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
  "els controls (K0, L0 i X0, no S4): l'avís, i cap regla no s'aplica; amb poc C0, l'ampliació, i la llista del nivell 2, només amb 10⁸"() {
    assert.deepStrictEqual(CONTROLS, ['K0', 'L0', 'X0']);
    withTmp((tmp) => {
      const plan = { seed: 5, noise: 8, distributions: { 'd-mig': { chemistries: ['C0', 'X0', 'S4'], sizes: [1000] } } };
      writeRun(tmp, { chemistry: 'C0', reps: heritable([1, 2, 3]) });
      writeRun(tmp, { chemistry: 'X0', reps: heritable([2, 9]) });
      writeRun(tmp, { chemistry: 'S4', reps: heritable([2, 5]) });  // S4 ja no és un control (AUD-140)
      const { groups, problems } = check(tmp, plan);
      assert.deepStrictEqual(problems, []);
      const out = analyse(groups), text = out.join('\n');
      assert.ok(out.some((l) => l.startsWith('  ATENCIÓ: el control X0 té 2 hereditaris (programes 2, 9)')), text);
      assert.ok(!/el control S4/.test(text), text);
      assert.ok(/no s'apliquen fins que no s'hagin mirat els hereditaris dels controls/.test(text), text);
      assert.ok(!/Al nivell 2/.test(text) && !/Ampliació/.test(text), text);
    });
    // amb poc C0 i menys de 10⁸ programes, l'ampliació, i la llista del nivell 2 no surt (AUD-142)
    withTmp((tmp) => {
      const plan = { seed: 5, noise: 8, distributions: { 'd-mig': { chemistries: ['C0', 'K0'], sizes: [1000] } } };
      writeRun(tmp, { chemistry: 'C0', reps: heritable([1, 2, 3]) });
      writeRun(tmp, { chemistry: 'K0' });
      const { groups, problems } = check(tmp, plan);
      assert.deepStrictEqual(problems, []);
      const out = analyse(groups), text = out.join('\n');
      assert.ok(out.includes('Ampliació (§5): C0 hi té 3 hereditaris, menys de 30: totes les variants passen a 10⁸ programes, els mateixos'), text);
      assert.ok(out.includes("Al nivell 2 (§6): es decidirà amb els 10⁸ programes, després de l'ampliació"), text);
      assert.ok(!/Al nivell 2 \(§6\), amb d-mig/.test(text) && !/Sense cap hereditari/.test(text), text);
    });
    // amb 10⁸, la llista surt, encara que C0 en tingui menys de 30
    withTmp((tmp) => {
      const plan = { seed: 5, noise: 8, distributions: { 'd-mig': { chemistries: ['C0', 'K0'], sizes: [1e8] } } };
      writeRun(tmp, { chemistry: 'C0', to: 1e8, chunk: 1e7, reps: heritable([1, 2, 3]) });
      writeRun(tmp, { chemistry: 'K0', to: 1e8, chunk: 1e7 });
      const { groups, problems } = check(tmp, plan);
      assert.deepStrictEqual(problems, []);
      const out = analyse(groups), text = out.join('\n');
      assert.ok(out.includes('Ampliació (§5): ja són 100000000 programes'), text);
      assert.ok(out.includes('Al nivell 2 (§6), amb d-mig: C0'), text);
      assert.ok(out.some((l) => l.startsWith('Sense cap hereditari en 100000000 programes: K0')), text);
    });
  },
  'la validació: cada manera com els registres no són els del pla és un problema'() {
    const all = (d, { skip = [], ...patch } = {}) => {
      for (const [dist, spec] of Object.entries(SMALL.distributions)) for (const c of spec.chemistries) {
        if (!skip.includes(`${dist}/${c}`)) writeRun(d, { chemistry: c, distribution: dist, to: spec.sizes[0], ...patch });
      }
    };
    const cases = [
      ['un forat', (d) => { writeRun(d, { chemistry: 'C0' }); writeRun(d, { chemistry: 'K0', to: 400 }); writeRun(d, { chemistry: 'K0', from: 500, to: 1000 }); }, /hi falten programes a partir del 400/],
      ['un solapament', (d) => { writeRun(d, { chemistry: 'C0' }); writeRun(d, { chemistry: 'K0', to: 600 }); writeRun(d, { chemistry: 'K0', from: 500, to: 1000 }); }, /es repeteixen programes a partir del 600/],
      ['una altra N', (d) => { writeRun(d, { chemistry: 'C0' }); writeRun(d, { chemistry: 'K0', to: 900 }); }, /900 programes, i les altres químiques en tenen 1000/],
      ['una N que el pla no preveu', (d) => all(d, { to: 900 }), /d-mig: 900 programes, i el pla en preveu 1000/],
      ['una altra llavor', (d) => { writeRun(d, { chemistry: 'C0' }); writeRun(d, { chemistry: 'K0', seed: 6 }); }, /la llavor o el soroll no són els del pla \(5, 8\)/],
      ['un altre soroll', (d) => { writeRun(d, { chemistry: 'C0', noise: 4 }); }, /la llavor o el soroll no són els del pla/],
      ['un altre commit', (d) => { writeRun(d, { chemistry: 'C0' }); writeRun(d, { chemistry: 'K0', code: 'abc9999' }); }, /el mateix commit/],
      ['el codi amb canvis', (d) => { writeRun(d, { chemistry: 'C0', code: 'abc1234+canvis' }); }, /sense canvis/],
      ['un codi desconegut', (d) => { writeRun(d, { chemistry: 'C0', code: 'desconeguda' }); }, /sense canvis/],
      ["uns mòduls que no són els d'aquesta còpia", (d) => all(d, { modules: { ...FAKE, 'fase1/bff.js': 'f'.repeat(64) } }), /fase1\/bff\.js, amb una altra SHA-256/],
      ['sense la SHA-256 dels mòduls', (d) => { writeRun(d, { chemistry: 'C0', start: { modules: null } }); }, /sense la SHA-256 dels mòduls/],
      ["amb la d'un mòdul de menys", (d) => { writeRun(d, { chemistry: 'C0', start: { modules: { 'fase1/bff.js': FAKE['fase1/bff.js'] } } }); }, /sense la SHA-256 dels mòduls/],
      ['una química del pla que hi falta', (d) => all(d, { skip: ['d-mig/K0'] }), /d-mig: hi falten les químiques K0/],
      ['una química que no és del pla', (d) => { all(d); writeRun(d, { chemistry: 'S1', distribution: 'uniforme', to: 2000 }); }, /uniforme: les químiques S1 no són del pla/],
      ['una distribució que hi falta', (d) => all(d, { skip: ['uniforme/C0', 'uniforme/K0'] }), /uniforme: hi falten les químiques C0, K0/],
      ['una química desconeguda', (d) => { writeRun(d, { chemistry: 'Z9' }); }, /desconegudes \(Z9, d-mig, 5\)/],
      ['una distribució desconeguda', (d) => { writeRun(d, { chemistry: 'C0', distribution: 'cust' }); }, /desconegudes \(C0, cust, 5\)/],
      ["l'ordre no diu el mateix que els camps", (d) => { writeRun(d, { chemistry: 'C0', start: { command: 'node eines/densitat.mjs --quimica K0 --distribucio d-mig --llavor 5 --programes 1000 --json x' } }); }, /l'ordre no diu el mateix/],
      ["l'ordre, amb una altra llavor", (d) => { writeRun(d, { chemistry: 'C0', start: { command: 'node eines/densitat.mjs --quimica C0 --distribucio d-mig --llavor 6 --programes 1000 --json x' } }); }, /l'ordre no diu el mateix/],
      ['una altra prova', (d) => { writeRun(d, { chemistry: 'C0', start: { test: 'una altra' } }); }, /la prova no és la del cens/],
      ['uns bytes que no són els del programa', (d) => { writeRun(d, { chemistry: 'C0', reps: [{ index: 5, hs: true, bytes: program(6, 5, 'd-mig') }] }); }, /els bytes del replicador 5 no són els del seu programa/],
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
        const { problems } = check(tmp);
        assert.ok(problems.length && problems.some((p) => why.test(p)), `${what}: ${JSON.stringify(problems)}`);
      });
    }
    // i el pla sencer, sense res de més ni de menys, passa
    withTmp((tmp) => { all(tmp); assert.deepStrictEqual(check(tmp).problems, []); });
  },
  "la línia d'ordres, amb el pla de veritat: amb problemes, codi 1 i cap anàlisi; sense carpeta, codi 2; i un resultat bo, codi 0"() {
    const cli = (...a) => spawnSync(process.execPath, [join(root, 'eines', 'densitat-analisi.mjs'), ...a], { encoding: 'utf8' });
    assert.strictEqual(cli().status, 2);
    // tot el pla (§5): 10⁷ programes, la llavor del pla i els mòduls d'aquesta còpia, i un hereditari a C0
    const whole = (d, skip = '') => {
      for (const [dist, spec] of Object.entries(PLAN.distributions)) for (const c of spec.chemistries) {
        if (`${dist}/${c}` !== skip) writeRun(d, { chemistry: c, distribution: dist, seed: PLAN.seed, to: 1e7, chunk: 1e6, modules: moduleHashes(), reps: c === 'C0' && dist === 'd-mig' ? heritable([123456]) : [] });
      }
    };
    withTmp((tmp) => {
      whole(tmp);
      const r = cli(tmp);
      assert.strictEqual(r.status, 0, r.stdout);
      assert.match(r.stdout, /C0: 1 hereditaris de 10000000/);
      assert.match(r.stdout, /Al nivell 2 \(§6\): es decidirà amb els 10⁸ programes/);
    });
    withTmp((tmp) => {
      whole(tmp, 'd-mig/X0');
      const r = cli(tmp);
      assert.strictEqual(r.status, 1);
      assert.match(r.stdout, /Els registres no són els del pla/);
      assert.match(r.stdout, /d-mig: hi falten les químiques X0/);
      assert.ok(!/hereditaris de/.test(r.stdout));
    });
    withTmp((tmp) => {
      writeRun(tmp, { chemistry: 'C0', code: 'abc1234+canvis', seed: PLAN.seed, modules: moduleHashes() });
      const r = cli(tmp);
      assert.strictEqual(r.status, 1);
      assert.match(r.stdout, /sense canvis/);
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
