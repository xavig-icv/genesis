// Proves de la sèrie preregistrada de la maduració (fase2/maduracio-serie.mjs i fase2/maduracio-confirmacio.mjs), amb un
// manifest petit i registres sintètics amb l'esquema sencer que escriu sim.mjs:
//   - la permutació de signes exacta, contra l'enumeració de totes les assignacions de signes, i contra la de coma
//     flotant de la potència (eines/potencia-maduracio.mjs);
//   - Holm amb les p exactes, l'interval de Clopper-Pearson i el bootstrap per món;
//   - el manifest i la validació dels registres, amb les mutacions que no hi han de passar;
//   - l'anàlisi i les frases de les decisions, amb un resultat conegut;
//   - la línia d'ordres: --prova no llegeix la carpeta de la sèrie, i --decideix no decideix res sense el preregistre.
// Executa: node test/maduracio-serie.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, readdirSync, copyFileSync, appendFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { expectedBranches, manifestProblems, branchProblems, readSeries, signFlipTest, holm, clopperPearson, worldBootstrap, analyse, decisionLines } from '../fase2/maduracio-serie.mjs';
import { signFlipP, signP } from '../eines/potencia-maduracio.mjs';
import { establishment } from '../fase2/census.js';
import { makeRng } from '../fase1/soup.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const ARMS = ['continue', 'shuffle-all', 'reinit'];
const COMMIT = 'abcdef0' + '1'.repeat(33);
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'serie-')); try { fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }

// Un manifest petit de la sèrie: n mons inclosos (W1, W2...) i un d'exclòs, 3 braços, 2 llavors, i H = 1.000 des de
// l'època 1.000
function smallManifest({ n = 6, dir = 'fase2/resultats/maduracio/serie/branques', code = 'abcdef0' } = {}) {
  const continuation = [['a', 400000], ['b', 500000]];
  const params = { arms: ARMS, horizon: 1000, mixing: 0, stopAfterEvent: 0, age: 1000, transformOffset: 600000, continuation, world: [512, 256], radius: 2, rng: 'v2', every: 100, mutation: 0.00024, census: { version: 'v3', every: 250, sample: 2048, seed: 20261016 }, cohort: { from: 1, to: 99, size: n } };
  const worlds = Array.from({ length: n }, (_, i) => `W${i + 1}`).map((id) => ({
    world: id, start: 1000, included: true,
    arms: Object.fromEntries(ARMS.map((a) => [a, { file: `serie/alicuotes/${id}/${a}.bin`, scan: { heritable: a === 'shuffle-all' ? 4 : 0, heritableSolo: a === 'shuffle-all' && id === 'W1' ? 1 : 0, replicating: 10, cells: 2048 } }])),
  }));
  worlds.splice(1, 0, { world: 'X', start: 1000, included: false, reason: "2 cel·les hereditàries a l'escaneig de l'època 1000" });
  const branches = worlds.filter((w) => w.included).flatMap((w) => ARMS.flatMap((arm) => continuation.map(([tag, off]) => {
    const id = `${w.world}-${arm}-${tag}`, seed = Number(w.world.slice(1)) + off;
    return { id, world: w.world, arm, tag, seed, command: `node sim.mjs --world 512x256 --seed ${seed} --mixing 0 --from ${w.arms[arm].file} --start 1000 --epochs 2000 --every 100 --census 250 --census-version v3 --rng v2 --stop-after-event 0 --json ${dir}/${id}.jsonl` };
  })));
  const test = { measure: 'x', unit: 'món', worlds: 'tots', contrasts: [['continue', 'reinit'], ['shuffle-all', 'reinit']], method: 'holm', alpha: 0.025, sided: 'greater', statistic: 'x', descriptive: [['continue', 'shuffle-all']] };
  return { pilot: 'serie', code, tag: 'preregistre-maduracio', dir, test, params, worlds, branches };
}
// Un registre complet, com l'escriu sim.mjs amb --stop-after-event 0 (com a test/maduracio-analisi.mjs). fate(b) dona
// T, l'època de l'establiment des del començament, o null si no s'estableix dins de H
function records(b, m, fate, { code = m.code } = {}) {
  const P = m.params, T = fate(b), end = T === null ? b.epochs : b.start + T + P.census.every;
  const rec = [{
    type: 'start', code, rng: 'v2', node: 'v16', zlib: 'x', command: b.command, seed: b.seed, programs: P.world[0] * P.world[1], world: P.world, radius: 2,
    mixing: 0, diffusion: 0, flow: 0, renewal: 0, mutation: 0.00024, from: b.from, start: b.start, epochs: b.epochs, every: 100,
    census: { ...P.census }, event: { share: 0.01, censuses: 2, stopAfter: 0 },
  }];
  const seen = [];
  let event = null;
  for (let e = b.start + 1; e <= end; e++) {
    if (e % 250 === 0) {
      const h = T !== null && e - b.start >= T ? 60 : e - b.start >= 500 ? 3 : 0;
      const c = { type: 'census', version: 'v3', epoch: e, families: [], extinct: [], untracked: [], familySample: 0.1, sample: 2048, replicating: h + 10, solo: h + 10, context: 0, heritable: h, heritableSolo: h, heritableContext: 0 };
      rec.push(c); seen.push(c);
      if (event === null) { const t = establishment(seen, 250); if (t !== null) { event = t; rec.push({ type: 'event', epoch: t, confirmed: e }); } }
    }
    if (e % 100 === 0) rec.push({ type: 'measure', epoch: e, h0: 5, hoe: 1, ops: 1000, runs: 100, epochs: 100, seconds: e - b.start });
  }
  rec.push({ type: 'end', epoch: end, reason: T === null ? 'horitzó' : 'establiment', fingerprint: 'abcd1234', hoeTransition: null, event, seconds: end - b.start });
  return rec;
}
const write = (dir, b, rec) => { mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, `${b.id}.jsonl`), rec.map((x) => JSON.stringify(x)).join('\n') + '\n'); };
function writeSeries(dir, m, fate) { for (const b of expectedBranches(m)) write(dir, b, records(b, m, fate)); }
// Un resultat conegut, amb els establiments de cada món (continue, shuffle-all, reinit; de 0 a 2): W1 2 1 0, W2 1 1 0,
// W3 1 0 1, W4 0 1 0, W5 1 2 0, W6 0 0 2. La llavor a s'estableix abans que la b
const COUNTS = { W1: [2, 1, 0], W2: [1, 1, 0], W3: [1, 0, 1], W4: [0, 1, 0], W5: [1, 2, 0], W6: [0, 0, 2] };
const fateOf = (counts) => (b) => { const k = counts[b.world]?.[ARMS.indexOf(b.arm)] ?? 0; return (b.tag === 'a' && k >= 1) || (b.tag === 'b' && k >= 2) ? (b.tag === 'a' ? 250 : 500) : null; };

// La p per enumeració de totes les assignacions de signes
function bruteForce(d) {
  const nz = d.filter((x) => x !== 0), obs = d.reduce((a, b) => a + b, 0);
  let count = 0;
  for (let mask = 0; mask < 2 ** nz.length; mask++) {
    let s = 0;
    for (let i = 0; i < nz.length; i++) s += (mask >> i) & 1 ? Math.abs(nz[i]) : -Math.abs(nz[i]);
    if (s >= obs) count++;
  }
  return { count, total: 2 ** nz.length };
}

const tests = {
  "la permutació de signes exacta: la mateixa p que l'enumeració, i la de la potència": () => {
    assert.strictEqual(signFlipTest([1, 1, 1, 1, 1, 1, 1]).p, 1 / 128);
    assert.deepStrictEqual([signFlipTest([2, -1]).count, signFlipTest([2, -1]).total], [2n, 4n]);
    assert.strictEqual(signFlipTest([0, 0, 0]).p, 1); // sense cap món amb diferència
    assert.strictEqual(signFlipTest([-2, -2, -1]).p, 1);
    const rng = makeRng(20261027, 'v2');
    for (let it = 0; it < 300; it++) {
      const n = 1 + Math.floor(rng() * 12), d = Array.from({ length: n }, () => Math.floor(rng() * 5) - 2);
      const r = signFlipTest(d), b = bruteForce(d);
      assert.strictEqual(r.count, BigInt(b.count), `${d}`);
      assert.strictEqual(r.total, BigInt(b.total), `${d}`);
      assert.ok(Math.abs(signFlipP(d) - b.count / b.total) < 1e-12, `${d}: la de coma flotant no coincideix`);
    }
    // amb 150 mons, la de coma flotant de la potència dona la mateixa p que l'exacta
    for (let it = 0; it < 20; it++) {
      const d = Array.from({ length: 150 }, () => Math.floor(rng() * 5) - 2 + (rng() < 0.1 ? 1 : 0)).map((x) => Math.max(-2, Math.min(2, x)));
      const r = signFlipTest(d);
      assert.ok(Math.abs(signFlipP(d) - r.p) <= 1e-9 * Math.max(r.p, 1e-12) + 1e-15, `n = 150: ${signFlipP(d)} contra ${r.p}`);
    }
    assert.throws(() => signFlipTest([0.5]));
  },
  "la prova de signes de la potència, la de sempre": () => {
    assert.strictEqual(signP([1, 1, 1, 1, 1, 1, 1, 1]), 1 / 256);
    assert.strictEqual(signP([1, 1, 1, 1, 1, 1, 1, -1]), 9 / 256);
    assert.strictEqual(signP([0, 0]), 1);
  },
  'Holm amb les p exactes: la més petita amb α / 2, i l\'altra amb α només si la primera es rebutja': () => {
    const r = (count, m) => ({ count: BigInt(count), total: 1n << BigInt(m) });
    // 1/128 = 0,0078 ≤ 0,0125; 1/64 = 0,0156 ≤ 0,025
    assert.deepStrictEqual(holm([r(1, 7), r(1, 6)], 0.025).map((x) => x.rejected), [true, true]);
    assert.deepStrictEqual(holm([r(1, 6), r(1, 7)], 0.025).map((x) => x.rejected), [true, true]);
    // 1/64 com a primera no arriba a 0,0125: cap
    assert.deepStrictEqual(holm([r(1, 6), r(1, 6)], 0.025).map((x) => x.rejected), [false, false]);
    // la segona, de 1/32 = 0,031 > 0,025: només la primera
    assert.deepStrictEqual(holm([r(1, 7), r(1, 5)], 0.025).map((x) => x.rejected), [true, false]);
    assert.deepStrictEqual(holm([r(1, 7), r(1, 5)], 0.025).map((x) => x.threshold), [0.0125, 0.025]);
    // a tocar del llindar, sense arrodonir: 1.638.399 / 2^27 = 0,012207 ≤ 0,0125, i 1.677.722 / 2^27 = 0,0125000 > 0,0125
    assert.strictEqual(holm([r(1638399, 27), r(1, 1)], 0.025)[0].rejected, true);
    assert.strictEqual(holm([r(1677722, 27), r(1, 1)], 0.025)[0].rejected, false);
  },
  "l'interval de Clopper-Pearson (els del pilot) i el bootstrap per món, determinista": () => {
    const f = ([lo, hi]) => `${(100 * lo).toFixed(1)}–${(100 * hi).toFixed(1)}`;
    assert.strictEqual(f(clopperPearson(12, 44)), '15.0–42.8');
    assert.strictEqual(f(clopperPearson(8, 44)), '8.2–32.7');
    assert.strictEqual(f(clopperPearson(6, 44)), '5.2–27.4');
    assert.strictEqual(clopperPearson(0, 10)[0], 0);
    assert.strictEqual(clopperPearson(10, 10)[1], 1);
    const units = [{ x: 1 }, { x: 0 }, { x: 2 }, { x: 1 }];
    const a = worldBootstrap(units, (s) => s.reduce((t, u) => t + u.x, 0) / s.length, { reps: 2000 });
    assert.deepStrictEqual(worldBootstrap(units, (s) => s.reduce((t, u) => t + u.x, 0) / s.length, { reps: 2000 }), a);
    assert.ok(a[0] < 1 && a[1] > 1);
    assert.deepStrictEqual(worldBootstrap([{ x: 3 }, { x: 3 }], (s) => s[0].x, { reps: 100 }), [3, 3]);
  },
  'el manifest: el de la sèrie, amb la cohort sencera, i les branques de cada món inclòs × braç × llavor': () => {
    const m = smallManifest();
    assert.deepStrictEqual(manifestProblems(m), []);
    assert.strictEqual(expectedBranches(m).length, 6 * 3 * 2);
    assert.ok(manifestProblems({ ...m, pilot: 'maduracio' }).length);
    assert.ok(manifestProblems({ ...m, params: { ...m.params, cohort: { ...m.params.cohort, size: 7 } } }).some((x) => /cohort/.test(x)));
    assert.ok(manifestProblems({ ...m, params: { ...m.params, stopAfterEvent: null } }).some((x) => /estructura/.test(x)));
    assert.ok(manifestProblems({ ...m, test: { ...m.test, contrasts: [['continue', 'zeros']] } }).some((x) => /prova/.test(x)));
    assert.ok(manifestProblems({ ...m, branches: m.branches.slice(1) }).some((x) => /branques del manifest/.test(x)));
    const noScan = JSON.parse(JSON.stringify(m));
    delete noScan.worlds[0].arms.reinit.scan;
    assert.ok(manifestProblems(noScan).some((x) => /escaneig/.test(x)));
  },
  'la validació: un registre complet passa, i cada mutació és un problema (AU2-64, AU2-71, AU2-83)': () => {
    const m = smallManifest(), bs = expectedBranches(m), fate = fateOf(COUNTS);
    const est = bs.find((b) => fate(b) !== null), hor = bs.find((b) => fate(b) === null);
    assert.deepStrictEqual(branchProblems(records(est, m, fate), est, m, COMMIT), []);
    assert.deepStrictEqual(branchProblems(records(hor, m, fate), hor, m, COMMIT), []);
    const cases = [
      ['un altre codi', hor, (r) => { r[0].code = '1234567'; return r; }, /no el del preregistre/],
      ['codi amb canvis', hor, (r) => { r[0].code = 'abcdef0+canvis'; return r; }, /no el del preregistre/],
      ['sense commit del preregistre', hor, (r) => r, /no el del preregistre/, null],
      ['sense mesures', hor, (r) => r.filter((x) => x.type !== 'measure'), /mesures/],
      ['una altra llavor', hor, (r) => { r[0].seed++; return r; }, /seed/],
      ['una altra ordre', hor, (r) => { r[0].command += ' --save x'; return r; }, /command/],
      ['un cens impossible', hor, (r) => { r.find((x) => x.type === 'census').heritable = 99; return r; }, /no és vàlid/],
      ['un tipus desconegut', hor, (r) => { r.splice(2, 0, { type: 'misteri', epoch: 1100 }); return r; }, /tipus/],
      ['incomplet', hor, (r) => r.slice(0, -1), /incomplet/],
      ["l'establiment, suprimit", est, (r) => r.filter((x) => x.type !== 'event'), /el registre no el té|confirma/],
      ["l'establiment, mogut", est, (r) => { r.find((x) => x.type === 'event').epoch += 250; return r; }, /establiment/],
      ["aturada a l'horitzó amb establiment", est, (r) => { r[r.length - 1].reason = 'horitzó'; return r; }, /horitzó/],
      ['una raó desconeguda', hor, (r) => { r[r.length - 1].reason = 'HOE'; return r; }, /ni l'horitzó/],
      ['un registre que no és JSON', hor, () => [{ type: 'start' }, null], /estructura|camps/],
    ];
    for (const [what, b, mutate, re, commit = COMMIT] of cases) {
      const pr = branchProblems(mutate(records(b, m, fate)), b, m, commit);
      assert.ok(pr.some((x) => re.test(x)), `no detecta ${what}: ${pr.slice(0, 3).join('; ')}`);
    }
  },
  "la lectura i l'anàlisi, amb un resultat conegut": () => withTmp((tmp) => {
    const m = smallManifest(), dir = join(tmp, 'branques');
    writeSeries(dir, m, fateOf(COUNTS));
    const { branches, problems } = readSeries(dir, m, { commit: COMMIT });
    assert.deepStrictEqual(problems, []);
    assert.strictEqual(branches.length, 36);
    const { results, lines } = analyse(branches, m);
    const db = Object.values(COUNTS).map(([c, , r]) => c - r), dc = Object.values(COUNTS).map(([, s, r]) => s - r);
    assert.deepStrictEqual([results[0].ka, results[0].kb, results[0].sum, results[0].pos, results[0].neg, results[0].ties], [5, 3, 2, 3, 1, 2]);
    assert.deepStrictEqual([results[1].ka, results[1].kb, results[1].sum, results[1].pos, results[1].neg, results[1].ties], [5, 3, 2, 4, 2, 0]);
    for (const [r, d] of [[results[0], db], [results[1], dc]]) { const b = bruteForce(d); assert.strictEqual(r.count, BigInt(b.count)); assert.strictEqual(r.total, BigInt(b.total)); }
    assert.ok(results.every((r) => !r.rejected));
    const text = lines.join('\n');
    for (const want of ['continue: 5 de 12 branques', 'shuffle-all: 5 de 12', 'reinit: 3 de 12', 'Prova 1, continue contra reinit', 'Prova 2, shuffle-all contra reinit', 'sense cap prova ni cap afirmació d\'equivalència', 'W6 002']) {
      assert.ok(text.includes(want), `falta «${want}»`);
    }
    const dec = decisionLines({ results });
    assert.strictEqual(dec.length, 2);
    assert.ok(dec.every((l) => /no es rebutja H0: no concloent/.test(l) && /No vol dir que s'hi estableixi igual/.test(l)));
    assert.ok(/la p més petita possible era 0\.0625/.test(dec[0]), dec[0]); // 4 mons amb diferència
    // un registre de menys: un problema, i no s'analitza res
    rmSync(join(dir, `${m.branches[0].id}.jsonl`));
    assert.ok(readSeries(dir, m, { commit: COMMIT }).problems.some((x) => /no hi ha el registre/.test(x)));
  }),
  'les decisions, quan es rebutja: el que diu la frase, i l\'abast': () => withTmp((tmp) => {
    // 10 mons: continue i shuffle-all s'estableixen a totes dues llavors, i reinit a cap; p = 2^-10 a totes dues proves
    const counts = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`W${i + 1}`, [2, 2, 0]]));
    const m = smallManifest({ n: 10 }), dir = join(tmp, 'branques');
    writeSeries(dir, m, fateOf(counts));
    const { branches, problems } = readSeries(dir, m, { commit: COMMIT });
    assert.deepStrictEqual(problems, []);
    const result = analyse(branches, m);
    assert.ok(result.results.every((r) => r.rejected && r.count === 1n && r.total === 1024n));
    const [b, c] = decisionLines(result);
    assert.ok(/es rebutja H0/.test(b) && /si es conserva la sopa envellida que amb una sopa nova/.test(b) && /efecte total/.test(b), b);
    assert.ok(/es rebutja H0/.test(c) && /l'histograma de bytes/.test(c) && /no aïlla la composició/.test(c), c);
  }),
  "la línia d'ordres: --prova calcula sense decidir, no llegeix la carpeta de la sèrie, i --decideix necessita el preregistre": () => withTmp((tmp) => {
    const run = (...a) => spawnSync(process.execPath, [join(root, 'fase2', 'maduracio-confirmacio.mjs'), ...a], { cwd: root, encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '' } });
    const m = smallManifest(), dir = join(tmp, 'branques'), manifest = join(tmp, 'manifest.json');
    writeFileSync(manifest, JSON.stringify(m));
    writeSeries(dir, m, fateOf(COUNTS));
    let r = run('--prova', COMMIT, '--serie', manifest, dir);
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    assert.ok(/MODE DE PROVA, sense cap decisió/.test(r.stdout) && /Prova 1, continue contra reinit/.test(r.stdout) && !/DECISIÓ/.test(r.stdout), r.stdout);
    assert.strictEqual(run('--prova', 'abcdef0', '--serie', manifest, dir).status, 2, 'un commit que no és sencer');
    assert.strictEqual(run('--prova', COMMIT, '--serie', manifest, m.dir).status, 2, 'la carpeta de la sèrie de veritat');
    assert.strictEqual(run('--prova', COMMIT, '--decideix', dir).status, 2);
    assert.strictEqual(run(dir).status, 2);
    r = run('--decideix', dir);
    assert.strictEqual(r.status, 1);
    assert.ok(/No es pot prendre la decisió confirmatòria/.test(r.stdout), r.stdout);
    r = run('--prova', '0'.repeat(40), '--serie', manifest, dir);
    assert.strictEqual(r.status, 1, 'un altre commit: els registres no són del preregistre');
    assert.ok(/no el del preregistre/.test(r.stdout));
  }),
  "--decideix: sense l'etiqueta es nega; amb l'etiqueta decideix; i amb el codi canviat es nega sense executar-lo": () => withTmp((tmp) => {
    const repo = join(tmp, 'repo');
    for (const d of ['fase1', 'fase2', 'eines', 'docs']) mkdirSync(join(repo, d), { recursive: true });
    copyFileSync(join(root, 'package.json'), join(repo, 'package.json'));
    for (const d of ['fase1', 'fase2', 'eines']) for (const f of readdirSync(join(root, d)).filter((f) => /\.m?js$/.test(f))) copyFileSync(join(root, d, f), join(repo, d, f));
    writeFileSync(join(repo, 'docs', 'protocol-maduracio.md'), '# Protocol de prova\n');
    const counts = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`W${i + 1}`, i < 9 ? [2, 1, 0] : [0, 0, 1]]));
    const m = smallManifest({ n: 10 });
    writeFileSync(join(repo, 'serie.json'), JSON.stringify(m, null, 1) + '\n');
    const GIT = ['-c', 'user.name=prova', '-c', 'user.email=prova@exemple.invalid', '-c', 'core.autocrlf=false'];
    const git = (...a) => { const r = spawnSync('git', [...GIT, ...a], { cwd: repo, encoding: 'utf8' }); if (r.status) throw new Error(r.stderr); return r.stdout.trim(); };
    git('init', '-q'); git('add', '-A'); git('commit', '-q', '-m', 'preregistre de prova');
    const decide = () => spawnSync(process.execPath, ['fase2/maduracio-confirmacio.mjs', '--decideix', '--serie', 'serie.json', join(tmp, 'dades')], { cwd: repo, encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '' } });
    let r = decide();
    assert.strictEqual(r.status, 1);
    assert.match(r.stdout, /no hi ha l'etiqueta de git preregistre-maduracio/);
    const sha = (f) => createHash('sha256').update(readFileSync(join(repo, f))).digest('hex');
    const files = ['serie.json', 'docs/protocol-maduracio.md', 'fase2/maduracio-confirmacio.mjs', 'fase2/maduracio-serie.mjs', 'fase2/b2-serie.mjs', 'fase2/census.js', 'fase1/soup.js', 'fase2/preregistre.mjs', 'eines/transforma.mjs', 'eines/pilot.mjs'];
    // sense la SHA-256 d'un dels fitxers del programa al missatge, es nega
    git('tag', '-a', 'preregistre-maduracio', '-m', 'Preregistre de prova\n\n' + files.filter((f) => f !== 'fase1/soup.js').map((f) => `${sha(f)}  ${f}`).join('\n'));
    r = decide();
    assert.strictEqual(r.status, 1);
    assert.match(r.stdout, /no porta la SHA-256 de fase1\/soup\.js/);
    git('tag', '-d', 'preregistre-maduracio');
    git('tag', '-a', 'preregistre-maduracio', '-m', 'Preregistre de prova\n\n' + files.map((f) => `${sha(f)}  ${f}`).join('\n'));
    const commit = git('rev-parse', 'HEAD');
    const dir = join(tmp, 'dades');
    for (const b of expectedBranches(m)) write(dir, b, records(b, m, fateOf(counts), { code: commit.slice(0, 7) }));
    r = decide();
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /^Commit del preregistre: /m);
    assert.match(r.stdout, /^DECISIÓ 1 \(continue contra reinit\): es rebutja H0/m);
    assert.match(r.stdout, /^DECISIÓ 2 \(shuffle-all contra reinit\): es rebutja H0/m);
    appendFileSync(join(repo, 'fase2', 'maduracio-serie.mjs'), "\nconsole.log('CODI MODIFICAT');\n");
    r = decide();
    assert.strictEqual(r.status, 1);
    assert.match(r.stdout, /fitxers diferents dels de l'etiqueta: fase2\/maduracio-serie\.mjs/);
    assert.ok(!r.stdout.includes('CODI MODIFICAT'), "el codi canviat no s'ha d'executar abans de la comprovació");
  }),
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
