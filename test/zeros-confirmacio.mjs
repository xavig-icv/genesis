// Proves de la prova preregistrada dels zeros (fase2/zeros-serie.mjs i fase2/zeros-confirmacio.mjs), amb sèries
// sintètiques: la prova de signes, Holm, la validació dels registres, les decisions, --prova i --decideix. Les proves
// de l'etiqueta es fan en un repositori temporal, perquè no depenguin del repositori on s'executen.
// Executa: node test/zeros-confirmacio.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, copyFileSync, readdirSync, appendFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { signTest, holm, expectedBranches, readSeries, analyse, decisionLines } from '../fase2/zeros-serie.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const COMMIT = 'abcdef0123456789abcdef0123456789abcdef01';
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'zeros-')); try { fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }

// Un manifest petit: 8 mons de prova i un control negatiu, tres braços i dues llavors
function smallManifest(dir = 'serie/branques') {
  const worlds = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9'].map((world, i) => ({
    world, role: i < 8 ? 'prova' : 'control negatiu', included: true, start: 1000 + 250 * i,
    arms: Object.fromEntries(['continue', 'zeros-data', 'placebo-cell'].map((a) => [a, { file: `serie/alicuotes/${world}/${a}.bin` }])),
  }));
  return {
    tag: 'preregistre-zeros', dir,
    test: { measure: 'h1', unit: 'món', worlds: 'prova', contrasts: [['zeros-data', 'continue'], ['zeros-data', 'placebo-cell']], method: 'holm', alpha: 0.025, sided: 'greater' },
    params: { arms: ['continue', 'zeros-data', 'placebo-cell'], horizon: 1000, mixing: 0.01, continuation: [['a', 400000], ['b', 500000]] },
    worlds,
  };
}
// Escriu els registres de totes les branques. heritable(b, k) dona els hereditaris del cens k de la branca b
function writeSeries(dir, m, heritable, { code = COMMIT.slice(0, 7), mutate = () => {} } = {}) {
  mkdirSync(dir, { recursive: true });
  for (const b of expectedBranches(m)) {
    const r = [{ type: 'start', code, rng: 'v2', seed: b.seed, from: b.from, start: b.start, epochs: b.epochs, mixing: m.params.mixing, census: { version: 'v3', every: 250, sample: 2048, seed: 20261016 } }];
    let k = 0;
    for (let e = b.start + 250; e <= b.epochs; e += 250) r.push({ type: 'census', epoch: e, sample: 2048, heritable: heritable(b, k++) });
    r.push({ type: 'end', epoch: b.epochs, reason: 'horitzó', fingerprint: '1', event: null });
    mutate(b, r);
    writeFileSync(join(dir, `${b.id}.jsonl`), r.map((x) => JSON.stringify(x)).join('\n') + '\n');
  }
}
// La vida baixa al primer cens amb continue i amb el placebo, i no amb zeros-data (excepte als mons de `except`)
const effect = (except = []) => (b, k) => (k > 0 ? 300 : b.arm !== 'zeros-data' ? 60 + (b.seed % 7) : except.includes(b.world) ? 30 : 400);

const tests = {
  'la prova de signes exacta i Holm amb dues proves': () => {
    assert.strictEqual(signTest(8, 0), 1 / 256);
    assert.strictEqual(signTest(7, 1), 9 / 256);
    assert.strictEqual(signTest(0, 0), 1);
    let h = holm([1 / 256, 1 / 256], 0.025);
    assert.deepStrictEqual(h.map((x) => x.rejected), [true, true]);
    h = holm([0.03, 1 / 256], 0.025);
    assert.deepStrictEqual(h.map((x) => x.rejected), [false, true]);
    assert.deepStrictEqual(h.map((x) => x.threshold), [0.025, 0.0125]);
    h = holm([0.02, 0.02], 0.025);
    assert.deepStrictEqual(h.map((x) => x.rejected), [false, false], 'la primera ha de passar α/2');
  },
  "l'anàlisi: amb l'efecte a tots 8 mons de prova es rebutgen totes dues; amb 7 de 8, cap (p = 0,035)": () => withTmp((tmp) => {
    const m = smallManifest();
    writeSeries(join(tmp, 'a'), m, effect());
    let { worlds, problems } = readSeries(join(tmp, 'a'), m, { commit: COMMIT });
    assert.deepStrictEqual(problems, []);
    let r = analyse(worlds, m);
    assert.deepStrictEqual(r.results.map((x) => [x.pos, x.neg, x.rejected]), [[8, 0, true], [8, 0, true]]);
    assert.match(decisionLines(r)[0], /^DECISIÓ 1 \(zeros-data contra continue\): es rebutja H0/);
    writeSeries(join(tmp, 'b'), m, effect(['B3']));
    ({ worlds, problems } = readSeries(join(tmp, 'b'), m, { commit: COMMIT }));
    r = analyse(worlds, m);
    assert.deepStrictEqual(r.results.map((x) => [x.pos, x.neg, x.rejected]), [[7, 1, false], [7, 1, false]]);
    // un empat no compta: amb 7 a favor i 1 igual, p = 1/128, i es rebutja
    writeSeries(join(tmp, 'e'), m, (b, k) => (k > 0 ? 300 : b.arm !== 'zeros-data' ? 60 : b.world === 'B3' ? 60 : 400));
    ({ worlds } = readSeries(join(tmp, 'e'), m, { commit: COMMIT }));
    assert.deepStrictEqual(analyse(worlds, m).results[0].ties, 1);
    assert.strictEqual(analyse(worlds, m).results[0].p, 1 / 128);
    assert.match(decisionLines(r)[1], /^DECISIÓ 2 \(zeros-data contra placebo-cell\): no es rebutja H0: no concloent/);
    // el control negatiu no entra a la prova: un efecte només allà no canvia res
    writeSeries(join(tmp, 'c'), m, (b, k) => (k === 0 && b.world === 'B9' && b.arm === 'zeros-data' ? 900 : 300));
    ({ worlds } = readSeries(join(tmp, 'c'), m, { commit: COMMIT }));
    assert.deepStrictEqual(analyse(worlds, m).results.map((x) => [x.pos, x.neg, x.ties]), [[0, 0, 8], [0, 0, 8]]);
  }),
  'la validació dels registres: cens que falta, llavor, captura, horitzó, incomplet i codi amb canvis': () => withTmp((tmp) => {
    const m = smallManifest();
    const cases = [
      [(b, r) => { if (b.id === 'B1-continue-a') r.splice(2, 1); }, /els censos no són/],
      [(b, r) => { if (b.id === 'B2-zeros-data-b') r[0].seed = 1; }, /seed és 1/],
      [(b, r) => { if (b.id === 'B3-placebo-cell-a') r[0].from = 'serie/alicuotes/B3/continue.bin'; }, /from és/],
      [(b, r) => { if (b.id === 'B4-continue-b') r[r.length - 1].reason = 'establiment'; }, /no a \d+ per l'horitzó/],
      [(b, r) => { if (b.id === 'B5-continue-a') r.pop(); }, /incomplet/],
      [(b, r) => { if (b.id === 'B6-continue-a') r[1].sample = 512; }, /no és vàlid/],
    ];
    cases.forEach(([mutate, re], i) => {
      writeSeries(join(tmp, `v${i}`), m, effect(), { mutate });
      const { problems } = readSeries(join(tmp, `v${i}`), m, { commit: COMMIT });
      assert.ok(problems.some((p) => re.test(p)), `no detecta el cas ${i}: ${problems.join('; ')}`);
    });
    writeSeries(join(tmp, 'w'), m, effect(), { code: 'abcdef0+canvis' });
    assert.ok(readSeries(join(tmp, 'w'), m, { commit: COMMIT }).problems.some((p) => /no és un commit net/.test(p)));
    writeSeries(join(tmp, 'x'), m, effect(), { code: '1234567' });
    assert.ok(readSeries(join(tmp, 'x'), m, { commit: COMMIT }).problems.some((p) => /no el del preregistre/.test(p)));
    rmSync(join(tmp, 'x', 'B7-zeros-data-a.jsonl'));
    assert.ok(readSeries(join(tmp, 'x'), m, { commit: COMMIT }).problems.some((p) => /B7-zeros-data-a: no hi ha el registre/.test(p)));
  }),
  '--prova calcula sense decidir, i es nega a llegir la carpeta de la sèrie': () => withTmp((tmp) => {
    const m = smallManifest(join(tmp, 'veritat').replaceAll('\\', '/'));
    writeFileSync(join(tmp, 'serie.json'), JSON.stringify(m));
    writeSeries(join(tmp, 'sint'), m, effect());
    const run = (...a) => spawnSync(process.execPath, [join(root, 'fase2', 'zeros-confirmacio.mjs'), ...a], { encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '' } });
    let r = run('--prova', COMMIT, '--serie', join(tmp, 'serie.json'), join(tmp, 'sint'));
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /MODE DE PROVA/);
    assert.ok(!/DECISIÓ/.test(r.stdout), '--prova no ha de decidir res');
    mkdirSync(join(tmp, 'veritat'));
    r = run('--prova', COMMIT, '--serie', join(tmp, 'serie.json'), join(tmp, 'veritat'));
    assert.strictEqual(r.status, 2);
    assert.match(r.stdout, /no llegeix la carpeta de la sèrie/);
  }),
  '--decideix: sense l\'etiqueta es nega; amb l\'etiqueta decideix; i amb el codi canviat es nega sense executar-lo': () => withTmp((tmp) => {
    const repo = join(tmp, 'repo');
    for (const d of ['fase1', 'fase2', 'eines', 'docs']) mkdirSync(join(repo, d), { recursive: true });
    copyFileSync(join(root, 'package.json'), join(repo, 'package.json'));
    for (const d of ['fase1', 'fase2', 'eines']) for (const f of readdirSync(join(root, d)).filter((f) => /\.m?js$/.test(f))) copyFileSync(join(root, d, f), join(repo, d, f));
    writeFileSync(join(repo, 'docs', 'protocol-zeros.md'), '# Protocol de prova\n');
    const m = smallManifest();
    writeFileSync(join(repo, 'serie.json'), JSON.stringify(m, null, 1) + '\n');
    const GIT = ['-c', 'user.name=prova', '-c', 'user.email=prova@exemple.invalid', '-c', 'core.autocrlf=false'];
    const git = (...a) => { const r = spawnSync('git', [...GIT, ...a], { cwd: repo, encoding: 'utf8' }); if (r.status) throw new Error(r.stderr); return r.stdout.trim(); };
    git('init', '-q'); git('add', '-A'); git('commit', '-q', '-m', 'preregistre de prova');
    const decide = () => spawnSync(process.execPath, ['fase2/zeros-confirmacio.mjs', '--decideix', '--serie', 'serie.json', join(tmp, 'dades')], { cwd: repo, encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '' } });
    let r = decide();
    assert.strictEqual(r.status, 1);
    assert.match(r.stdout, /no hi ha l'etiqueta de git preregistre-zeros/);
    const sha = (f) => createHash('sha256').update(readFileSync(join(repo, f))).digest('hex');
    const files = ['serie.json', 'docs/protocol-zeros.md', 'fase2/zeros-confirmacio.mjs', 'fase2/zeros-serie.mjs', 'fase2/preregistre.mjs', 'eines/transforma.mjs', 'eines/pilot.mjs'];
    git('tag', '-a', 'preregistre-zeros', '-m', 'Preregistre de prova\n\n' + files.map((f) => `${sha(f)}  ${f}`).join('\n'));
    const commit = git('rev-parse', 'HEAD');
    writeSeries(join(tmp, 'dades'), m, effect(), { code: commit.slice(0, 7) });
    r = decide();
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /^DECISIÓ 1 \(zeros-data contra continue\): es rebutja H0/m);
    assert.match(r.stdout, /^DECISIÓ 2 \(zeros-data contra placebo-cell\): es rebutja H0/m);
    appendFileSync(join(repo, 'fase2', 'zeros-serie.mjs'), "\nconsole.log('CODI MODIFICAT');\n");
    r = decide();
    assert.strictEqual(r.status, 1);
    assert.match(r.stdout, /fitxers diferents dels de l'etiqueta: fase2\/zeros-serie\.mjs/);
    assert.ok(!r.stdout.includes('CODI MODIFICAT'), 'el codi canviat no s\'ha d\'executar abans de la comprovació');
  }),
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
