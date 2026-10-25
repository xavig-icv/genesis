// Proves de la prova preregistrada dels zeros (fase2/zeros-serie.mjs i fase2/zeros-confirmacio.mjs), amb sèries
// sintètiques amb l'esquema sencer que escriu sim.mjs, i amb un registre de veritat d'un món petit:
//   - la prova de signes, Holm, i la mesura g = h₁ / h₀ (AUD-116: un efecte només immediat no dona cap decisió);
//   - la validació dels registres, amb les mutacions de l'auditor 2 (AU2-83, AUD-117);
//   - --prova, i --decideix en un repositori temporal (amb i sense l'etiqueta, i amb el codi canviat).
// Executa: node test/zeros-confirmacio.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, copyFileSync, readdirSync, appendFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { signTest, holm, expectedBranches, branchProblems, manifestProblems, readSeries, analyse, decisionLines } from '../fase2/zeros-serie.mjs';
import { establishment } from '../fase2/census.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const COMMIT = 'abcdef0123456789abcdef0123456789abcdef01';
const ARMS = ['continue', 'zeros-data', 'placebo-cell', 'zeros-inert'];
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'zeros-')); try { fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }

// Un manifest petit: 8 mons de prova i un control negatiu, quatre braços, dues llavors i H = 1.000. h0(món, braç) dona
// els hereditaris de l'escaneig del punt de partida (de 2.048 cel·les)
function smallManifest({ dir = 'serie/branques', world = [512, 256], horizon = 1000, h0 = (w, arm) => (arm === 'zeros-data' ? 300 : 200), starts = (i) => 1000 + 250 * i } = {}) {
  const continuation = [['a', 400000], ['b', 500000]];
  const params = { arms: ARMS, horizon, mixing: 0.01, stopAfterEvent: null, age: null, transformOffset: 600000, continuation, world, radius: 2, rng: 'v2', every: 100, mutation: 0.00024, census: { version: 'v3', every: 250, sample: 2048, seed: 20261016 } };
  const worlds = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9'].map((id, i) => ({
    world: id, role: i < 8 ? 'prova' : 'control negatiu', included: true, start: starts(i), capture: `serie/origen/${id}.bin`,
    arms: Object.fromEntries(ARMS.map((a) => [a, { file: `serie/alicuotes/${id}/${a}.bin`, scope: a === 'placebo-cell' ? { zeros: 1000, shortfall: 10, saturated: { cells: 2, zeros: 120 } } : null, scan: { heritable: h0(id, a), heritableSolo: h0(id, a), replicating: h0(id, a), cells: 2048 } }])),
  }));
  const branches = worlds.flatMap((w) => ARMS.flatMap((arm) => continuation.map(([tag, off]) => {
    const id = `${w.world}-${arm}-${tag}`, seed = Number(w.world.slice(1)) + off;
    return { id, world: w.world, arm, tag, seed, command: `node sim.mjs --world ${world.join('x')} --seed ${seed} --mixing 0.01 --from ${w.arms[arm].file} --start ${w.start} --epochs ${w.start + horizon} --every 100 --census 250 --census-version v3 --rng v2 --json ${dir}/${id}.jsonl` };
  })));
  return {
    tag: 'preregistre-zeros', dir, params, worlds, branches,
    test: { measure: 'g', unit: 'món', worlds: 'prova', contrasts: [['zeros-data', 'continue'], ['zeros-data', 'placebo-cell']], method: 'holm', alpha: 0.025, sided: 'greater', descriptive: [['zeros-inert', 'continue'], ['zeros-data', 'zeros-inert'], ['placebo-cell', 'continue']] },
  };
}
// Un registre complet, com l'escriu sim.mjs: a cada època, el cens (múltiples de 250), l'establiment si aquest cens el
// confirma, i després la mesura (múltiples de 100). heritable(b, k) dona els hereditaris del cens k
function records(b, m, heritable, { code = COMMIT.slice(0, 7) } = {}) {
  const P = m.params;
  const rec = [{
    type: 'start', code, rng: 'v2', node: 'v16', zlib: 'x', command: b.command, seed: b.seed, programs: P.world[0] * P.world[1], world: P.world, radius: 2,
    mixing: 0.01, diffusion: 0, flow: 0, renewal: 0, mutation: 0.00024, from: b.from, start: b.start, epochs: b.epochs, every: 100,
    census: { ...P.census }, event: { share: 0.01, censuses: 2, stopAfter: null },
  }];
  const seen = [];
  let event = null, k = 0;
  for (let e = b.start + 1; e <= b.epochs; e++) {
    if (e % 250 === 0) {
      const h = heritable(b, k++), rep = Math.min(2048, h + 10);
      const c = { type: 'census', version: 'v3', epoch: e, families: [], extinct: [], untracked: [], familySample: 0.1, sample: 2048, replicating: rep, solo: rep, context: 0, heritable: h, heritableSolo: h, heritableContext: 0 };
      rec.push(c); seen.push(c);
      if (event === null) { const t = establishment(seen, 250); if (t !== null) { event = t; rec.push({ type: 'event', epoch: t, confirmed: e }); } }
    }
    if (e % 100 === 0) rec.push({ type: 'measure', epoch: e, h0: 5, hoe: 1, ops: 1000, runs: 100, epochs: 100, seconds: e - b.start });
  }
  rec.push({ type: 'end', epoch: b.epochs, reason: 'horitzó', fingerprint: 'abcd1234', hoeTransition: null, event, seconds: b.epochs - b.start });
  return rec;
}
function writeSeries(dir, m, heritable, opts = {}) {
  mkdirSync(dir, { recursive: true });
  for (const b of expectedBranches(m)) writeFileSync(join(dir, `${b.id}.jsonl`), records(b, m, heritable, opts).map((x) => JSON.stringify(x)).join('\n') + '\n');
}
// El primer cens de cada braç: amb continue i el placebo, 50 de 2.048 (g = 0,25); amb zeros-data, h1 (per defecte 150,
// g = 0,5 amb h0 = 300); amb zeros-inert, 100 (g = 0,5). Els censos següents, 300
const fate = ({ zeros = 150, except = [], exceptValue = 30 } = {}) => (b, k) => {
  if (k > 0) return 300;
  if (b.arm === 'zeros-data') return except.includes(b.world) ? exceptValue : zeros;
  return b.arm === 'zeros-inert' ? 100 : 50;
};

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
  "la mesura g = h₁ / h₀: amb l'efecte a tots 8 mons es rebutgen totes dues; amb 7 de 8, cap; i un efecte només immediat no dona res (AUD-116)": () => withTmp((tmp) => {
    const m = smallManifest();
    assert.deepStrictEqual(manifestProblems(m), []);
    writeSeries(join(tmp, 'a'), m, fate());
    let { worlds, problems } = readSeries(join(tmp, 'a'), m, { commit: COMMIT });
    assert.deepStrictEqual(problems, []);
    let r = analyse(worlds, m);
    assert.deepStrictEqual(r.results.map((x) => [x.pos, x.neg, x.rejected]), [[8, 0, true], [8, 0, true]]);
    assert.match(decisionLines(r)[0], /^DECISIÓ 1 \(zeros-data contra continue\): es rebutja H0: .*baixa menys, o creix més/);
    // 7 de 8: B3 té un g més baix amb zeros-data (30/300 = 0,1 contra 0,25)
    writeSeries(join(tmp, 'b'), m, fate({ except: ['B3'] }));
    ({ worlds } = readSeries(join(tmp, 'b'), m, { commit: COMMIT }));
    r = analyse(worlds, m);
    assert.deepStrictEqual(r.results.map((x) => [x.pos, x.neg, x.rejected]), [[7, 1, false], [7, 1, false]]);
    assert.match(decisionLines(r)[1], /no es rebutja H0: no concloent.*La potència era condicionada/);
    // el cas de l'auditor 1: zeros-data comença amb un 50 % més de vida (300 contra 200) i baixa igual (75: g = 0,25).
    // h₁ sol seria més alt a tots 8 mons, però g és igual: cap decisió
    writeSeries(join(tmp, 'c'), m, fate({ zeros: 75 }));
    ({ worlds } = readSeries(join(tmp, 'c'), m, { commit: COMMIT }));
    r = analyse(worlds, m);
    assert.deepStrictEqual(r.results.map((x) => [x.pos, x.ties, x.rejected]), [[0, 8, false], [0, 8, false]]);
    // l'efecte immediat i el quart braç, als descriptius
    assert.ok(r.lines.some((l) => /l'efecte immediat de zeros-data/.test(l) && /1\.50/.test(l)));
    assert.ok(r.lines.some((l) => /g amb zeros-inert contra g amb continue, als mons de prova: més alt a 8/.test(l)));
    // un empat no compta: amb 7 a favor i 1 igual, p = 1/128, i es rebutja
    writeSeries(join(tmp, 'd'), m, fate({ except: ['B3'], exceptValue: 75 }));
    ({ worlds } = readSeries(join(tmp, 'd'), m, { commit: COMMIT }));
    r = analyse(worlds, m);
    assert.deepStrictEqual([r.results[0].pos, r.results[0].ties, r.results[0].p], [7, 1, 1 / 128]);
    // el control negatiu no entra a la prova
    writeSeries(join(tmp, 'e'), m, (b, k) => (k === 0 && b.world === 'B9' && b.arm === 'zeros-data' ? 900 : k === 0 ? Math.round(50 * (b.arm === 'zeros-data' ? 1.5 : 1)) : 300));
    ({ worlds } = readSeries(join(tmp, 'e'), m, { commit: COMMIT }));
    assert.deepStrictEqual(analyse(worlds, m).results.map((x) => [x.pos, x.neg, x.ties]), [[0, 0, 8], [0, 0, 8]]);
  }),
  'el manifest ha de ser coherent: sense escaneig, amb un punt de partida 0, o amb branques de menys, no es llegeix res': () => withTmp((tmp) => {
    let m = smallManifest();
    delete m.worlds[0].arms['zeros-inert'].scan;
    assert.ok(manifestProblems(m).some((x) => /no té l'escaneig/.test(x)));
    m = smallManifest({ h0: (w, a) => (w === 'B2' && a === 'placebo-cell' ? 0 : 200) });
    assert.ok(manifestProblems(m).some((x) => /B2: el punt de partida del braç placebo-cell és 0/.test(x)));
    m = smallManifest();
    m.branches = m.branches.slice(1);
    assert.ok(manifestProblems(m).some((x) => /branques del manifest/.test(x)));
    writeSeries(join(tmp, 'a'), smallManifest(), fate());
    assert.ok(readSeries(join(tmp, 'a'), m, { commit: COMMIT }).problems.length > 0);
  }),
  "la validació dels registres rebutja les mutacions de l'auditor 2 (AU2-83) i les de l'esquema (AUD-117)": () => withTmp((tmp) => {
    const m = smallManifest();
    const b = expectedBranches(m)[0], good = records(b, m, fate());
    assert.deepStrictEqual(branchProblems(good, b, m, COMMIT), []);
    const clone = () => JSON.parse(JSON.stringify(good));
    const cases = [
      ['sense cap mesura', (r) => r.filter((x) => x.type !== 'measure'), /mesures/],
      ['amb un tipus desconegut', (r) => { r.splice(2, 0, { type: 'mystery', epoch: b.start + 250, heritable: 987654 }); return r; }, /tipus/],
      ['amb un cens impossible (més hereditaris que replicadors)', (r) => { const c = r.find((x) => x.type === 'census'); c.heritable = 2048; c.heritableSolo = 2048; c.replicating = 0; c.solo = 0; return r; }, /no és vàlid/],
      ['amb una empremta que no ho és', (r) => { r[r.length - 1].fingerprint = 'NOT_A_HASH'; return r; }, /empremta/],
      ['sense la línia de l\'establiment', (r) => r.filter((x) => x.type !== 'event'), /establiment/],
      ['amb una altra ordre', (r) => { r[0].command = r[0].command.replace('--mixing 0.01', '--mixing 0.02'); return r; }, /ordre/],
      ['amb un altre món', (r) => { r[0].world = [256, 256]; r[0].programs = 65536; return r; }, /world/],
      ['amb una altra llavor del cens', (r) => { r[0].census.seed = 1; return r; }, /cens \(seed\)/],
      ['amb una altra mutació', (r) => { r[0].mutation = 0.001; return r; }, /mutation/],
      ['amb el riu', (r) => { r[0].flow = 1; return r; }, /flow/],
      ['amb un camp de més a la capçalera', (r) => { r[0].extra = 1; return r; }, /camps esperats/],
      ['amb el criteri d\'establiment canviat', (r) => { r[0].event.share = 0.5; return r; }, /criteri d'establiment/],
      ['amb un cens de menys', (r) => r.filter((x) => !(x.type === 'census' && x.epoch === b.start + 500)), /censos no són/],
      ['amb una mesura fora de lloc', (r) => { r.find((x) => x.type === 'measure').epoch += 1; return r; }, /mesura/],
      ['amb els segons que baixen', (r) => { r.filter((x) => x.type === 'measure')[3].seconds = -5; return r; }, /segons/],
      ['incomplet', (r) => r.slice(0, -1), /incomplet|línia final/],
      ['amb el codi canviat', (r) => { r[0].code = 'abcdef0+canvis'; return r; }, /no el del preregistre/],
    ];
    for (const [what, mutate, re] of cases) {
      const pr = branchProblems(mutate(clone()), b, m, COMMIT);
      assert.ok(pr.some((x) => re.test(x)), `no detecta un registre ${what}: ${pr.join('; ')}`);
    }
    // amb el manifest mínim de l'auditor 2 (sense els paràmetres del món ni del cens), un problema i no una excepció
    const minimal = { test: m.test, params: { arms: ARMS, horizon: 1000, mixing: 0.01, continuation: m.params.continuation }, worlds: m.worlds, branches: m.branches };
    assert.ok(branchProblems(good, b, minimal, COMMIT).some((x) => /estructura esperada/.test(x)));
    assert.ok(readSeries(join(tmp, 'res'), minimal, { commit: COMMIT }).problems.some((x) => /estructura esperada/.test(x)));
    // i, a tota la sèrie, cap anàlisi amb un sol registre dolent
    writeSeries(join(tmp, 's'), m, fate());
    const bad = expectedBranches(m)[5];
    writeFileSync(join(tmp, 's', `${bad.id}.jsonl`), records(bad, m, fate()).filter((x) => x.type !== 'measure').map((x) => JSON.stringify(x)).join('\n') + '\n');
    assert.ok(readSeries(join(tmp, 's'), m, { commit: COMMIT }).problems.some((x) => x.startsWith(bad.id)));
  }),
  "un registre de veritat de sim.mjs, en un món petit, passa la validació; i la mutació d'una sola línia, no": () => withTmp((tmp) => {
    // un món de 32 × 64 (2.048 cel·les, la mostra del cens sencera), amb la vida de dues fixtures de 32 × 32
    const fx = Buffer.concat([readFileSync(join(root, 'test', 'fixtures', 'esclat-32x32.bin')), readFileSync(join(root, 'test', 'fixtures', 'punt-32x32.bin'))]);
    const dir = join(tmp, 'branques').replaceAll('\\', '/'), from = join(tmp, 'origen.bin').replaceAll('\\', '/');
    writeFileSync(from, fx);
    const m = smallManifest({ dir, world: [32, 64], horizon: 500, starts: () => 1000 });
    m.worlds[0].arms.continue.file = from;
    const b = expectedBranches(m).find((x) => x.world === 'B1' && x.arm === 'continue' && x.tag === 'a');
    b.command = `node sim.mjs --world 32x64 --seed ${b.seed} --mixing 0.01 --from ${from} --start 1000 --epochs 1500 --every 100 --census 250 --census-version v3 --rng v2 --json ${dir}/${b.id}.jsonl`;
    mkdirSync(dir, { recursive: true });
    const r = spawnSync(process.execPath, [join(root, 'sim.mjs'), ...b.command.split(' ').slice(2)], { cwd: root, encoding: 'utf8' });
    assert.strictEqual(r.status, 0, r.stderr);
    const real = readFileSync(join(dir, `${b.id}.jsonl`), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    const commit = real[0].code.replace(/\+canvis$/, '') + '0'.repeat(33);
    const pr = branchProblems(real, { ...b, from }, m, commit).filter((x) => !/codi/.test(x));
    assert.deepStrictEqual(pr, [], `el registre de veritat no passa: ${pr.join('; ')}`);
    const broken = real.filter((x, i) => !(x.type === 'measure' && i === real.findIndex((y) => y.type === 'measure')));
    assert.ok(branchProblems(broken, { ...b, from }, m, commit).some((x) => /mesures|mesura/.test(x)));
  }),
  '--prova calcula sense decidir, i es nega a llegir la carpeta de la sèrie': () => withTmp((tmp) => {
    const m = smallManifest({ dir: join(tmp, 'veritat').replaceAll('\\', '/') });
    writeFileSync(join(tmp, 'serie.json'), JSON.stringify(m));
    writeSeries(join(tmp, 'sint'), m, fate());
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
    const files = ['serie.json', 'docs/protocol-zeros.md', 'fase2/zeros-confirmacio.mjs', 'fase2/zeros-serie.mjs', 'fase2/b2-serie.mjs', 'fase2/census.js', 'fase2/preregistre.mjs', 'eines/transforma.mjs', 'eines/pilot.mjs'];
    git('tag', '-a', 'preregistre-zeros', '-m', 'Preregistre de prova\n\n' + files.map((f) => `${sha(f)}  ${f}`).join('\n'));
    const commit = git('rev-parse', 'HEAD');
    writeSeries(join(tmp, 'dades'), m, fate(), { code: commit.slice(0, 7) });
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
