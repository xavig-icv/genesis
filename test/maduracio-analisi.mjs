// Proves de l'anàlisi del pilot de la maduració (eines/maduracio-analisi.mjs), amb un manifest petit i registres
// sintètics amb l'esquema sencer que escriu sim.mjs, i amb un registre de veritat d'un món petit que s'estableix:
//   - la validació: les branques que acaben a l'horitzó i les que s'aturen a l'establiment, i les mutacions que no hi
//     han de passar;
//   - les xifres de l'anàlisi, amb un resultat conegut;
//   - la línia d'ordres: sense tots els registres, no en llegeix cap ni analitza res.
// Executa: node test/maduracio-analisi.mjs
import assert from 'assert';
import { spawnSync, execFileSync } from 'child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { expectedBranches, manifestProblems, branchProblems, branchMeasures, readSeries, analyse, seedConcordance, median, missingBranches, simulatorCheck } from '../eines/maduracio-analisi.mjs';
import { establishment } from '../fase2/census.js';
import { SIM_FILES } from '../eines/pilot.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const ARMS = ['continue', 'shuffle-programs', 'shuffle-within', 'shuffle-all', 'reinit'];
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'maduracio-')); try { fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }
const git = (...a) => { try { return execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };

// Un manifest petit: 4 mons inclosos i un d'exclòs, 5 braços, 2 llavors, i H = 1.000 des de l'època 1.000. solo(món,
// braç) dona les hereditàries soles de l'escaneig del punt de partida (per defecte, a shuffle-all dels mons M1 a M3)
function smallManifest({ world = [512, 256], dir = 'pilot/branques', horizon = 1000, code = 'abcdef0', solo = (w, arm) => (arm === 'shuffle-all' && w !== 'M4' ? 1 : 0) } = {}) {
  const continuation = [['a', 400000], ['b', 500000]];
  const params = { arms: ARMS, horizon, mixing: 0, stopAfterEvent: 0, age: 1000, transformOffset: 600000, continuation, world, radius: 2, rng: 'v2', every: 100, mutation: 0.00024, census: { version: 'v3', every: 250, sample: 2048, seed: 20261016 } };
  const worlds = ['M1', 'M2', 'M3', 'M4'].map((id) => ({
    world: id, start: 1000, included: true,
    arms: Object.fromEntries(ARMS.map((a) => [a, { file: `pilot/alicuotes/${id}/${a}.bin`, scan: { heritable: solo(id, a) + (a === 'shuffle-all' ? 3 : 0), heritableSolo: solo(id, a), replicating: 10, cells: 2048 } }])),
  }));
  worlds.push({ world: 'M5', start: 1000, included: false, reason: "2 cel·les hereditàries a l'escaneig de l'època 1000" });
  const branches = worlds.filter((w) => w.included).flatMap((w) => ARMS.flatMap((arm) => continuation.map(([tag, off]) => {
    const id = `${w.world}-${arm}-${tag}`, seed = Number(w.world.slice(1)) + off;
    return { id, world: w.world, arm, tag, seed, command: `node sim.mjs --world ${world.join('x')} --seed ${seed} --mixing 0 --from ${w.arms[arm].file} --start 1000 --epochs ${1000 + horizon} --every 100 --census 250 --census-version v3 --rng v2 --stop-after-event 0 --json ${dir}/${id}.jsonl --save ${dir}/captures --save-what event` };
  })));
  return { pilot: 'maduracio', code, params, worlds, branches };
}
// Un registre complet, com l'escriu sim.mjs amb --stop-after-event 0. fate(b) dona T, l'època de l'establiment des
// del començament (el primer dels dos censos amb l'1 % d'hereditaris o més), o null si no s'estableix dins de H. Abans,
// 3 hereditaris de 2.048 a partir de l'època 500, sense arribar a l'1 %
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
// Un resultat conegut: continue, només M1-a (a l'època 500); shuffle-within, totes dues de M1 (250); shuffle-all, totes
// dues de M1 a M3 (250); reinit, només M2-b (750); shuffle-programs, cap
const FATE = (b) => ({
  'M1-continue-a': 500, 'M1-shuffle-within-a': 250, 'M1-shuffle-within-b': 250, 'M1-shuffle-all-a': 250, 'M1-shuffle-all-b': 250,
  'M2-shuffle-all-a': 250, 'M2-shuffle-all-b': 250, 'M3-shuffle-all-a': 250, 'M3-shuffle-all-b': 250, 'M2-reinit-b': 750,
}[b.id] ?? null);

const tests = {
  'el manifest: el del pilot, coherent, i les branques de cada món inclòs × braç × llavor': () => {
    const m = smallManifest();
    assert.deepStrictEqual(manifestProblems(m), []);
    assert.strictEqual(expectedBranches(m).length, 4 * 5 * 2);
    assert.ok(manifestProblems({ ...m, pilot: 'zeros' }).length);
    assert.ok(manifestProblems({ ...m, params: { ...m.params, stopAfterEvent: null } }).some((x) => /estructura/.test(x)));
    assert.ok(manifestProblems({ ...m, branches: m.branches.slice(1) }).some((x) => /branques del manifest/.test(x)));
    const noScan = JSON.parse(JSON.stringify(m));
    delete noScan.worlds[2].arms.reinit.scan;
    assert.ok(manifestProblems(noScan).some((x) => /M3: el braç reinit no té l'escaneig/.test(x)));
  },
  "la validació: les branques que acaben a l'horitzó i les que s'aturen a l'establiment hi passen; les mutacions, no": () => {
    const m = smallManifest(), bs = expectedBranches(m);
    const est = bs.find((b) => b.id === 'M1-shuffle-all-a'), hor = bs.find((b) => b.id === 'M4-shuffle-all-a');
    const good = records(est, m, FATE), quiet = records(hor, m, FATE);
    assert.strictEqual(good[good.length - 1].reason, 'establiment');
    assert.deepStrictEqual(branchProblems(good, est, m), []);
    assert.deepStrictEqual(branchProblems(quiet, hor, m), []);
    const mut = (rec, f) => f(JSON.parse(JSON.stringify(rec)));
    const cases = [
      ['amb una altra llavor', mut(good, (r) => { r[0].seed += 1; return r; }), /seed/],
      ["amb una altra ordre", mut(good, (r) => { r[0].command += ' --x'; return r; }), /command/],
      ['sense aturar-se a l\'establiment', mut(good, (r) => { r[0].event.stopAfter = null; return r; }), /event/],
      ['amb codi sense desar', mut(good, (r) => { r[0].code = 'abcdef0+canvis'; return r; }), /commit net/],
      ["sense la línia de l'establiment", mut(good, (r) => r.filter((x) => x.type !== 'event')), /establiment/],
      ['sense la línia final', mut(good, (r) => r.slice(0, -1)), /incomplet/],
      ['sense un cens', mut(quiet, (r) => r.filter((x) => !(x.type === 'census' && x.epoch === 1500))), /censos/],
      ['amb un tipus de línia desconegut', mut(quiet, (r) => { r.splice(3, 0, { type: 'nota', epoch: 1100 }); return r; }), /tipus/],
      ["acabat abans d'hora per l'horitzó", mut(quiet, (r) => { const e = r[r.length - 1]; e.epoch = 1750; e.seconds = 750; return r.filter((x) => x.type === 'end' || x.type === 'start' || x.epoch <= 1750); }), /horitzó/],
      ['amb un cens impossible', mut(quiet, (r) => { r.find((x) => x.type === 'census').heritable = 5000; return r; }), /cens/],
    ];
    for (const [what, rec, re] of cases) {
      const b = rec[0].seed === hor.seed && rec.some((x) => x.type === 'end' && x.reason === 'horitzó') ? hor : est;
      const pr = branchProblems(rec, b, m);
      assert.ok(pr.some((x) => re.test(x)), `no detecta un registre ${what}: ${pr.join('; ') || 'cap problema'}`);
    }
  },
  "un registre de veritat de sim.mjs, d'un món petit que s'estableix, passa la validació": () => withTmp((tmp) => {
    // un món de 32 × 64 amb la vida de dues fixtures de 32 × 32: s'estableix al primer cens i s'atura al segon
    const fx = Buffer.concat([readFileSync(join(root, 'test', 'fixtures', 'esclat-32x32.bin')), readFileSync(join(root, 'test', 'fixtures', 'punt-32x32.bin'))]);
    const dir = join(tmp, 'branques').replaceAll('\\', '/'), from = join(tmp, 'origen.bin').replaceAll('\\', '/');
    writeFileSync(from, fx);
    const m = smallManifest({ world: [32, 64], dir, horizon: 500 });
    m.worlds[0].arms.continue.file = from;
    const b = expectedBranches(m).find((x) => x.id === 'M1-continue-a');
    b.command = `node sim.mjs --world 32x64 --seed ${b.seed} --mixing 0 --from ${from} --start 1000 --epochs 1500 --every 100 --census 250 --census-version v3 --rng v2 --stop-after-event 0 --json ${dir}/${b.id}.jsonl`;
    mkdirSync(dir, { recursive: true });
    const r = spawnSync(process.execPath, [join(root, 'sim.mjs'), ...b.command.split(' ').slice(2)], { cwd: root, encoding: 'utf8' });
    assert.strictEqual(r.status, 0, r.stderr);
    const real = readFileSync(join(dir, `${b.id}.jsonl`), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.strictEqual(real[real.length - 1].reason, 'establiment', "el món petit s'hauria d'establir");
    // el codi pot dir "+canvis" si la còpia de treball té canvis: aquí només es prova l'esquema
    const pr = branchProblems(real, b, m).filter((x) => !/codi/.test(x));
    assert.deepStrictEqual(pr, [], `el registre de veritat no passa: ${pr.join('; ')}`);
    const me = branchMeasures(real, b);
    assert.deepStrictEqual([me.established, me.T, me.epochs], [true, 250, 500]);
  }),
  "l'anàlisi, amb un resultat conegut": () => withTmp((tmp) => {
    const m = smallManifest();
    writeSeries(tmp, m, FATE);
    const { branches, problems, codes } = readSeries(tmp, m);
    assert.deepStrictEqual(problems, []);
    assert.deepStrictEqual(codes, ['abcdef0']);
    assert.strictEqual(branches.length, 40);
    const { lines, rho } = analyse(branches, m);
    const line = (re) => lines.find((l) => re.test(l)) ?? '';
    assert.match(line(/^ {2}continue: establertes/), /establertes 1 de 8 branques \(12\.5 %\), a 1 mons de 4 \(totes dues llavors a 0\); RMST 938 èpoques; T dels establerts, mediana 500/);
    assert.match(line(/^ {2}shuffle-all: establertes/), /establertes 6 de 8 branques \(75\.0 %\), a 3 mons de 4 \(totes dues llavors a 3\); RMST 438 èpoques/);
    assert.match(line(/^ {2}shuffle-programs: establertes/), /establertes 0 de 8 .*mediana —/);
    // la lectura de l'acta: shuffle-all, separat pel punt de partida (hereditàries soles a M1-M3)
    assert.match(line(/^ {2}shuffle-all: amb alguna/), /amb alguna \(3 mons\) 6 de 6 \(100\.0 %\); sense cap \(1 mons\) 0 de 2 \(0\.0 %\)/);
    assert.match(line(/^ {2}continue: amb alguna/), /amb alguna \(0 mons\) —; sense cap \(4 mons\) 1 de 8/);
    // la concordança: la rho calculada a mà és 1,375 / 2,375
    assert.ok(Math.abs(rho - 1.375 / 2.375) < 1e-12, `rho = ${rho}`);
    assert.match(line(/^ {2}continue: les dues llavors/), /coincideixen a 3 mons de 4; phi —/);
    assert.match(line(/^ {2}shuffle-all: les dues llavors/), /coincideixen a 4 mons de 4; phi 1\.00/);
    assert.match(line(/continue · shuffle-all:/), /0\.33/);
    assert.match(line(/^ {2}shuffle-all: més alta/), /més alta a 3 mons, més baixa a 0, igual a 1/);
    assert.match(line(/^ {2}shuffle-programs: més alta/), /més alta a 0 mons, més baixa a 1, igual a 3/);
    assert.match(line(/^ {2}shuffle-all: qualsevol/), /qualsevol, 250 èpoques \(8 de 8 branques\)/);
    assert.match(line(/^El cost:/), /h de branques en total/);
  }),
  'les eines estadístiques: la mediana del projecte i la rho': () => {
    assert.strictEqual(median([4, 1, 3, 2]), 2.5);
    assert.strictEqual(median([3, 1, 2]), 2);
    // sense variació, la rho no es pot calcular; amb les llavors sempre iguals, és 1
    assert.strictEqual(seedConcordance([{ arm: 'x', pairs: [[0, 0], [0, 0]] }]).rho, null);
    assert.strictEqual(seedConcordance([{ arm: 'x', pairs: [[1, 1], [0, 0]] }]).rho, 1);
    assert.strictEqual(seedConcordance([{ arm: 'x', pairs: [[1, 0], [0, 1]] }]).rho, -1);
  },
  // en un repositori temporal de dos commits, i no amb la història del de veritat: a GitHub, la còpia és superficial i
  // només té un commit
  "el simulador dels registres, comparat amb el de la preparació": () => withTmp((tmp) => {
    const g = (...a) => execFileSync('git', ['-c', 'user.name=prova', '-c', 'user.email=prova@example.invalid', ...a], { cwd: tmp, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    try { g('init', '-q'); } catch { console.log('    (sense git: no es prova)'); return; }
    for (const f of SIM_FILES) { mkdirSync(join(tmp, f, '..'), { recursive: true }); writeFileSync(join(tmp, f), `// ${f}\n`); }
    g('add', '-A'); g('commit', '-q', '-m', 'a');
    const a = g('rev-parse', '--short=7', 'HEAD');
    writeFileSync(join(tmp, 'sim.mjs'), '// un altre simulador\n');
    g('commit', '-q', '-am', 'b');
    const b = g('rev-parse', '--short=7', 'HEAD');
    assert.deepStrictEqual(simulatorCheck([a], a, { root: tmp }), { checked: true, problems: [] });
    assert.deepStrictEqual(simulatorCheck([a], b, { root: tmp }).problems, [`sim.mjs del commit dels registres (${a}) no és el de la preparació (${b})`]);
    const missing = simulatorCheck(['0000000'], b, { root: tmp }).problems;
    assert.ok(missing.length && missing.every((x) => /no es pot llegir/.test(x)), 'un commit que no existeix no pot passar');
  }),
  "la línia d'ordres: amb tots els registres, l'anàlisi; si en falta cap, no en llegeix ni n'analitza cap": () => withTmp((tmp) => {
    const code = git('rev-parse', '--short=7', 'HEAD') ?? 'abcdef0';
    const m = smallManifest({ code });
    writeFileSync(join(tmp, 'manifest.json'), JSON.stringify(m));
    const dir = join(tmp, 'branques');
    writeSeries(dir, m, FATE);
    const run = () => spawnSync(process.execPath, [join(root, 'eines', 'maduracio-analisi.mjs'), '--serie', join(tmp, 'manifest.json'), dir], { encoding: 'utf8' });
    let r = run();
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /40 branques de 40, totes vàlides/);
    assert.match(r.stdout, /La mesura principal/);
    const b = expectedBranches(m)[7];
    unlinkSync(join(dir, `${b.id}.jsonl`));
    assert.deepStrictEqual(missingBranches(dir, m), [b.id]);
    r = run();
    assert.strictEqual(r.status, 1);
    assert.match(r.stdout, /Falten 1 registres de 40/);
    assert.ok(!/La mesura principal/.test(r.stdout), 'sense tots els registres no ha de donar cap xifra');
    // un registre trencat: no s'analitza res
    write(dir, b, records(b, m, FATE).slice(0, -1));
    r = run();
    assert.strictEqual(r.status, 1);
    assert.match(r.stdout, /incomplet/);
    assert.ok(!/La mesura principal/.test(r.stdout));
  }),
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log(`  ok   ${name}`); } catch (e) { failed++; console.log(`  FALLA ${name}\n       ${e.message}`); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
