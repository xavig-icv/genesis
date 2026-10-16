// Proves de l'anàlisi estadística (fase2/estadistica.mjs). Executa: node test/estadistica.mjs
//
// Els valors de referència surten de fonts externes (les dades de Gehan, 1965, que fan servir els
// manuals de supervivència), de dues implementacions independents (la de l'equip i la de l'auditor 1)
// o de càlculs a mà que s'indiquen.
import assert from 'assert';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import {
  fisher, wilson, logrank, kaplanMeier, survivalAt, incidenceDifference, rmst, twoStageBounds, power,
  readExperiment, readLegacyLog, normalCdf, firstRun, SENSITIVITY, withCriterion, originMeasures,
  validateSeries, validateExperiment, decide, simulateTwoStage, stageOneCheck,
} from '../fase2/estadistica.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const near = (x, y, tol, what) => assert.ok(Math.abs(x - y) <= tol, `${what}: ${x}, s'esperava ${y} ± ${tol}`);

// Gehan (1965): remissió de leucèmia, 6-MP contra placebo (setmanes; + = censurat)
const parse = (s) => s.split(' ').map((v) => ({ time: Number(v.replace('+', '')), event: !v.endsWith('+') }));
const MP = parse('6 6 6 6+ 7 9+ 10 10+ 11+ 13 16 17+ 19+ 20+ 22 23 25+ 32+ 32+ 34+ 35+');
const PLACEBO = parse('1 1 2 2 3 4 4 5 5 8 8 8 8 11 11 12 12 15 17 22 23');

const tests = {
  'la normal estàndard'() {
    near(normalCdf(1.959964), 0.975, 1e-6, 'Φ(1,96)');
    near(normalCdf(-1), 0.158655, 1e-6, 'Φ(-1)');
  },
  'Fisher: les xifres de l\'entrada 6 (dues implementacions independents)'() {
    near(fisher(3, 15, 8, 15), 0.128, 0.0005, '3/15 contra 8/15');
    near(fisher(3, 15, 7, 15), 0.245, 0.0005, '3/15 contra 7/15');
    assert.strictEqual(fisher(5, 10, 5, 10), 1);
  },
  'Wilson: 3 de 15 (calculat a mà: 7,05 %–45,19 %)'() {
    const [lo, hi] = wilson(3, 15);
    near(lo, 0.0705, 0.0005, 'inferior');
    near(hi, 0.4519, 0.0005, 'superior');
  },
  'log-rank: dades de Gehan (khi quadrat 16,8)'() {
    const r = logrank(MP, PLACEBO);
    near(r.chi2, 16.79, 0.01, 'khi quadrat');
    assert.ok(r.p < 1e-4 && r.z < 0, `p = ${r.p}, Z = ${r.z}`);
  },
  'Kaplan-Meier: dades de Gehan (6-MP)'() {
    const km = kaplanMeier(MP);
    const expected = { 6: 0.857, 7: 0.807, 10: 0.753, 13: 0.690, 16: 0.627, 22: 0.538, 23: 0.448 };
    for (const [t, s] of Object.entries(expected)) near(survivalAt(km, Number(t)).s, s, 0.0005, `S(${t})`);
    near(survivalAt(km, 6).se, 0.0764, 0.0005, 'error de Greenwood a t = 6');
    assert.strictEqual(survivalAt(km, 5).s, 1);
  },
  'diferència d\'incidència i RMST: casos que es poden calcular a mà'() {
    // A: cap esdeveniment; B: la meitat a t = 100, la resta censurada a 200
    const A = Array.from({ length: 10 }, () => ({ time: 200, event: false }));
    const B = [...Array.from({ length: 5 }, () => ({ time: 100, event: true })), ...Array.from({ length: 5 }, () => ({ time: 200, event: false }))];
    const d = incidenceDifference(A, B, 200);
    near(d.diff, 0.5, 1e-9, 'diferència');
    near(d.high - d.diff, 1.959964 * Math.sqrt(0.25 / 10), 1e-6, 'semiamplada (Greenwood = binomial sense censura)');
    near(rmst(A, 200).rmst, 200, 1e-9, 'RMST sense esdeveniments');
    near(rmst(B, 200).rmst, 150, 1e-9, 'RMST: 100 + 0,5 × 100');
  },
  'dues etapes: els límits d\'O\'Brien–Fleming de l\'auditor 1 (50 → 80)'() {
    const b = twoStageBounds(50 / 80);
    near(b.c1, 2.479, 0.002, 'etapa 1');
    near(b.c2, 2.004, 0.003, 'etapa 2');
  },
  'potència: coincideix amb la simulació de l\'auditor 1 (59 % per a 20 % contra 40 %, n = 50)'() {
    near(power({ n: 50, pA: 0.2, pB: 0.4, reps: 2000 }), 0.59, 0.035, 'potència');
  },
  'la sèrie exploratòria: les xifres de l\'entrada 6 (HOE > 1)'() {
    const dir = join(root, 'fase2', 'resultats');
    const log = (m, s) => [`corrent-m${m}-llavor-${s}.log`, `vm/corrent-m${m}-llavor-${s}.log`, m === '0' ? `mon-llavor-${s}.log` : '']
      .map((f) => join(dir, f)).find((f) => f.endsWith('.log') && existsSync(f));
    const quiet = Array.from({ length: 15 }, (_, i) => readLegacyLog(log('0', i + 1), 'hoe'));
    const current = Array.from({ length: 15 }, (_, i) => readLegacyLog(log('0.01', i + 1), 'hoe'));
    assert.strictEqual(quiet.filter((x) => x.event).length, 3);
    assert.strictEqual(current.filter((x) => x.event).length, 8);
    // entrada 6: log-rank p = 0,043. Els experiments sense transició es van censurar a la 16.000
    near(logrank(quiet, current).p, 0.043, 0.0005, 'log-rank');
    // el criteri de família del protocol v0.1 no es pot avaluar a la llavor 4 amb corrent (AUD-30)
    assert.strictEqual(readLegacyLog(log('0.01', 4), 'familia').event, false);
    assert.strictEqual(readLegacyLog(log('0.01', 4), 'funcional').time, 11750);
  },
  'lectura del JSONL: establiment, censura a l\'horitzó i experiments tallats'() {
    const tmp = mkdtempSync(join(tmpdir(), 'claude-origins-'));
    try {
      const write = (name, censuses, end, epochs = 1000) => {
        const lines = [{ type: 'start', seed: 1, code: 'x', mixing: 0, epochs, start: 0, census: { every: 250 }, event: { stopAfter: 1000 } },
          ...censuses.map(([epoch, heritable]) => ({ type: 'census', version: 'v3', epoch, sample: 100, heritable })),
          ...(end === null ? [] : [{ type: 'end', epoch: end }])];
        writeFileSync(join(tmp, name), lines.map((l) => JSON.stringify(l)).join('\n') + '\n');
        return readExperiment(join(tmp, name));
      };
      const a = write('a.jsonl', [[250, 0], [500, 2], [750, 3]], 750);
      assert.deepStrictEqual([a.event, a.time, a.complete], [true, 500, true]);
      // el criteri només es compleix a l'últim cens: no hi ha segon cens, i queda censurat
      const b = write('b.jsonl', [[250, 0], [500, 0], [750, 0], [1000, 5]], 1000);
      assert.deepStrictEqual([b.event, b.time, b.complete], [false, 1000, true]);
      // s'ha aturat a la 500 sense establiment: és un experiment tallat
      const c = write('c.jsonl', [[250, 0], [500, 0]], 500);
      assert.deepStrictEqual([c.event, c.complete], [false, false]);
      // sense línia final (el procés es va interrompre)
      const d = write('d.jsonl', [[250, 0]], null);
      assert.strictEqual(d.complete, false);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  },
};

tests['sensibilitats i mesures d\'origen sobre censos sintètics'] = () => {
  const census = (epoch, heritable, replicating, heritableSolo, familyShare) => ({ epoch, sample: 1000, heritable, replicating, heritableSolo, families: [{ share: familyShare }] });
  const x = {
    end: 2250, event: true, time: 1000, every: 250, stopAfter: 1000,
    censuses: [census(250, 0, 3, 0, 0), census(500, 2, 12, 11, 0.004), census(750, 5, 15, 14, 0.008), census(1000, 12, 20, 2, 0.012),
      census(1250, 60, 70, 3, 0.05), census(1500, 70, 80, 4, 0.06), census(1750, 75, 85, 5, 0.08), census(2000, 80, 90, 5, 0.1)],
    measures: [{ epoch: 900, hoe: 0.8 }, { epoch: 1100, hoe: 1.4 }],
  };
  assert.strictEqual(firstRun(x.censuses, (c) => c.heritable >= 10), 1000);
  const t = Object.fromEntries(Object.entries(SENSITIVITY).map(([k, f]) => [k, f(x)]));
  assert.deepStrictEqual(Object.values(t), [500, 1250, 500, 1000, 1100]);
  // un criteri que no es compleix: censurat al final del seguiment
  assert.deepStrictEqual(withCriterion([x], () => null).map((y) => [y.event, y.time]), [[false, 2250]]);
  const o = originMeasures(x);
  assert.deepStrictEqual([o.firstHeritable, o.firstCopy, o.heritableCensusesBefore, o.copyCensusesBefore, o.delay, o.maintained], [500, 250, 2, 3, 500, true]);
};

// Una sèrie sintètica petita amb el mateix format que la de sim.mjs, per provar el validador
const MANIFEST = {
  groups: { A: { label: 'A', mixing: 0, seeds: { 1: [1, 3], 2: [4, 5] } }, B: { label: 'B', mixing: 0.01, seeds: { 1: [11, 13], 2: [14, 15] } } },
  params: { programs: 64, world: [8, 8], radius: 2, mutation: 0.00024, rng: 'v2', epochs: 1000, every: 100, start: 0,
    census: { version: 'v3', every: 250, sample: 64, seed: 7 }, event: { share: 0.01, censuses: 2, stopAfter: 500 } },
  stages: { 1: { perGroup: 3, bound: 2.479178635 }, 2: { perGroup: 5, bound: 2.004268879 } },
};
// El commit de referència, sencer (40 caràcters), i el codi curt que escriu sim.mjs
const COMMIT = 'abc1234' + '0123456789abcdef0123456789abcdef0'.slice(0, 33);
const CODE = COMMIT.slice(0, 7);
// Un experiment sintètic amb el format de sim.mjs: inici, mesures cada 100, censos cada 250, establiment i final
function experiment({ seed, mixing, eventAt = null, code = CODE }) {
  const { epochs } = MANIFEST.params, every = 250, stopAfter = 500;
  const end = eventAt === null ? epochs : Math.min(epochs, eventAt + stopAfter);
  const records = [{ type: 'start', code, seed, mixing, ...MANIFEST.params }];
  for (let e = 1; e <= end; e++) {
    if (e % every === 0) {
      const h = eventAt !== null && e >= eventAt ? 10 : 0;
      records.push({ type: 'census', version: 'v3', epoch: e, sample: 64, replicating: h + 1, solo: h + 1, context: 0,
        heritable: h, heritableSolo: h, heritableContext: 0, families: [] });
      if (eventAt !== null && e === eventAt + every) records.push({ type: 'event', epoch: eventAt, confirmed: e });
    }
    if (e % 100 === 0) records.push({ type: 'measure', epoch: e, h0: 7.9, hoe: 0.2, ops: 1000, runs: 2400, epochs: 100, seconds: 1 });
  }
  records.push({ type: 'end', epoch: end, reason: eventAt !== null && eventAt + stopAfter <= epochs ? 'establiment' : 'horitzó' });
  return records;
}
const save = (file, records) => writeFileSync(file, records.map((r) => JSON.stringify(r)).join('\n') + '\n');
function writeSeries(dir, edit = () => {}, stage = 1) {
  const groups = { A: [[1, null], [2, 500], [3, null], [4, null], [5, 750]], B: [[11, 250], [12, 250], [13, 750], [14, 500], [15, null]] };
  for (const [g, list] of Object.entries(groups)) {
    mkdirSync(join(dir, g), { recursive: true });
    for (const [seed, eventAt] of list.slice(0, stage === 1 ? 3 : 5)) {
      const records = experiment({ seed, mixing: MANIFEST.groups[g].mixing, eventAt });
      edit(g, seed, records);
      save(join(dir, g, `s${seed}.jsonl`), records);
    }
  }
  return [join(dir, 'A'), join(dir, 'B')];
}
const onlyCensus = (r, epoch) => r.find((x) => x.type === 'census' && x.epoch === epoch);
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'claude-origins-')); try { return fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }

tests['validador: una sèrie correcta passa, i la decisió fa servir el límit de l\'etapa'] = () => withTmp((tmp) => {
  const [a, b] = writeSeries(tmp);
  const v = validateSeries(a, b, MANIFEST, '1', { commit: COMMIT });
  assert.deepStrictEqual(v.errors, []);
  assert.strictEqual(v.code, CODE);
  assert.strictEqual(v.A.length + v.B.length, 6);
  // el commit de referència ha de ser sencer: un prefix, ni que sigui el correcte, no serveix (AUD-50, AU2-29)
  for (const short of [CODE, 'a', 'f']) {
    assert.ok(validateSeries(a, b, MANIFEST, '1', { commit: short }).errors.some((e) => /hash complet/.test(e)), short);
  }
});

const brokenCases = {
  'mixing equivocat': [(g, seed, r) => { if (seed === 2) r[0].mixing = 0.9; }, /mixing/],
  'llavor que no és de l\'etapa': [(g, seed, r) => { if (seed === 3) r[0].seed = 99; }, /sobren|falten/],
  'commit amb canvis sense desar': [(g, seed, r) => { if (seed === 1) r[0].code = 'abc1234+canvis'; }, /commit net|mateix commit/],
  'commits diferents': [(g, seed, r) => { if (g === 'B') r[0].code = 'def5678'; }, /mateix commit/],
  'un cens que falta (AU2-17)': [(g, seed, r) => { if (seed === 1) r.splice(r.findIndex((x) => x.type === 'census' && x.epoch === 500), 1); }, /hi falten censos/],
  "experiment tallat abans de l'horitzó": [(g, seed, r) => { if (seed === 3) { r.splice(3); r.push({ type: 'end', epoch: 500, reason: 'horitzó' }); } }, /hauria d'arribar/],
  "línia d'establiment que no és la del criteri": [(g, seed, r) => { const e = r.find((x) => x.type === 'event'); if (seed === 11 && e) e.epoch = 500; }, /línia d'establiment/],
  'un paràmetre del protocol canviat': [(g, seed, r) => { if (seed === 12) r[0].mutation = 0.0005; }, /mutation/],
  // auditoria externa 4 (AU2-23 a AU2-27)
  'tots del mateix commit net, però no del preregistre (AU2-23)': [(g, seed, r) => { r[0].code = 'deadbee'; }, /no és el commit del preregistre/],
  'un experiment sense cap cens (AU2-24)': [(g, seed, r) => { if (seed === 1) for (let i = r.length - 1; i >= 0; i--) if (r[i].type === 'census') r.splice(i, 1); }, /té 0 censos/],
  'censos parcials amb un final coherent (AU2-24)': [(g, seed, r) => { if (seed === 3) r.splice(r.findIndex((x) => x.type === 'census' && x.epoch === 1000), 1); }, /té 3 censos/],
  'una mostra d\'1 (AU2-25)': [(g, seed, r) => { if (seed === 1) { const c = onlyCensus(r, 250); c.sample = 1; c.replicating = c.solo = 1; } }, /mostra de 1/],
  'una mostra de 63 (AU2-25)': [(g, seed, r) => { if (seed === 1) onlyCensus(r, 250).sample = 63; }, /mostra de 63/],
  'hereditaris fraccionaris (AU2-25)': [(g, seed, r) => { if (seed === 2) { const c = onlyCensus(r, 500); c.heritable = 0.5; c.heritableSolo = 0.5; } }, /absents o impossibles: heritable/],
  'un recompte negatiu (AU2-25)': [(g, seed, r) => { if (seed === 1) onlyCensus(r, 250).replicating = -1; }, /absents o impossibles: replicating/],
  'més hereditaris que no pas copiadors (AU2-25)': [(g, seed, r) => { if (seed === 2) { const c = onlyCensus(r, 500); c.replicating = 5; c.solo = 5; } }, /incoherents entre ells/],
  'un recompte absent (AU2-25)': [(g, seed, r) => { if (seed === 1) delete onlyCensus(r, 250).context; }, /absents o impossibles: context/],
  'una suma de sol i context incorrecta (AU2-25)': [(g, seed, r) => { if (seed === 2) onlyCensus(r, 500).heritableContext = 3; }, /incoherents entre ells/],
  'cap mesura (AU2-27)': [(g, seed, r) => { if (seed === 1) for (let i = r.length - 1; i >= 0; i--) if (r[i].type === 'measure') r.splice(i, 1); }, /té 0 mesures/],
  'una mesura de l\'interior que falta (AU2-27)': [(g, seed, r) => { if (seed === 3) r.splice(r.findIndex((x) => x.type === 'measure' && x.epoch === 500), 1); }, /té 9 mesures/],
  'un motiu final que no és el de l\'establiment (AU2-27)': [(g, seed, r) => { if (seed === 11) r[r.length - 1].reason = 'horitzó'; }, /motiu del final/],
  // auditoria externa 5 (AU2-30)
  "la línia d'establiment fora del seu lloc (AU2-30)": [(g, seed, r) => { if (seed === 11) { const i = r.findIndex((x) => x.type === 'event'); r.splice(r.length - 1, 0, ...r.splice(i, 1)); } }, /ordre en què les escriu/],
  "una línia d'un tipus desconegut (AU2-30)": [(g, seed, r) => { if (seed === 1) r.splice(3, 0, { type: 'injected', epoch: 300 }); }, /tipus desconegut: injected/],
  'una mesura abans del seu cens (AU2-30)': [(g, seed, r) => { if (seed === 3) { const i = r.findIndex((x) => x.type === 'census' && x.epoch === 500); const j = r.findIndex((x) => x.type === 'measure' && x.epoch === 500); [r[i], r[j]] = [r[j], r[i]]; } }, /ordre en què les escriu/],
};
for (const [name, [edit, pattern]] of Object.entries(brokenCases)) {
  tests[`validador: rebutja ${name}`] = () => withTmp((tmp) => {
    const [a, b] = writeSeries(tmp, edit);
    const v = validateSeries(a, b, MANIFEST, '1', { commit: COMMIT });
    assert.ok(v.errors.some((e) => pattern.test(e)), v.errors.join(' | ') || '(cap error)');
  });
}
tests['validador: rebutja una llavor repetida'] = () => withTmp((tmp) => {
  const [a, b] = writeSeries(tmp);
  save(join(a, 'copia.jsonl'), experiment({ seed: 1, mixing: 0 }));
  assert.ok(validateSeries(a, b, MANIFEST, '1', { commit: COMMIT }).errors.some((e) => /repetides/.test(e)));
});
tests["validador: l'etapa 2 demana les llavors de totes dues etapes"] = () => withTmp((tmp) => {
  const [a, b] = writeSeries(tmp);
  assert.ok(validateSeries(a, b, MANIFEST, '2', { commit: COMMIT }).errors.some((e) => /falten les llavors 4, 5/.test(e)));
});
tests["sense el commit del preregistre no es valida res (AU2-23)"] = () => withTmp((tmp) => {
  const [a, b] = writeSeries(tmp);
  assert.ok(validateSeries(a, b, MANIFEST, '1').errors.some((e) => /no s'ha indicat el commit del preregistre/.test(e)));
});
tests["l'etapa 2 es nega a decidir si l'etapa 1 ja rebutjava H0 (AUD-47, AU2-26)"] = () => withTmp((tmp) => {
  // A sense cap establiment, B amb establiment a totes: a l'etapa 1, |Z1| supera el límit
  const strong = { ...MANIFEST, stages: { 1: { perGroup: 3, bound: 1.5 }, 2: { perGroup: 5, bound: 2.004268879 } } };
  const [a, b] = writeSeries(tmp, (g, seed, r) => {
    if (g === 'A') { r.splice(0, r.length, ...experiment({ seed, mixing: 0 })); }
    else { r.splice(0, r.length, ...experiment({ seed, mixing: 0.01, eventAt: 250 })); }
  }, 2);
  const v = validateSeries(a, b, strong, '2', { commit: COMMIT });
  assert.deepStrictEqual(v.errors, []);
  const { z1, rejected1 } = stageOneCheck(v.A, v.B, strong);
  assert.ok(rejected1, `Z1 = ${z1}`);
  writeFileSync(join(tmp, 'manifest.json'), JSON.stringify(strong));
  const r = spawnSync(process.execPath, [join(root, 'fase2', 'estadistica.mjs'), '--etapa', '2', '--prova', '--commit', COMMIT, '--manifest', join(tmp, 'manifest.json'), a, b], { encoding: 'utf8' });
  assert.strictEqual(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /L'etapa 1 ja rebutjava H0/);
  assert.doesNotMatch(r.stdout, /DECISIÓ/);
});
tests['--etapa --prova decideix amb el commit correcte, i ho marca com a prova; no amb un altre ni amb un prefix (AU2-23, AU2-29)'] = () => withTmp((tmp) => {
  const [a, b] = writeSeries(tmp);
  writeFileSync(join(tmp, 'manifest.json'), JSON.stringify(MANIFEST));
  const run = (...extra) => spawnSync(process.execPath, [join(root, 'fase2', 'estadistica.mjs'), '--etapa', '1', ...extra, a, b], { encoding: 'utf8' });
  const good = run('--prova', '--commit', COMMIT, '--manifest', join(tmp, 'manifest.json'));
  assert.strictEqual(good.status, 0, good.stdout + good.stderr);
  assert.match(good.stdout, /DECISIÓ DE PROVA \(no confirmatòria\): /);
  assert.match(good.stdout, /PROVA, NO CONFIRMATÒRIA/);
  for (const commit of ['1234567890abcdef1234567890abcdef12345678', 'f', CODE]) {
    const bad = run('--prova', '--commit', commit, '--manifest', join(tmp, 'manifest.json'));
    assert.strictEqual(bad.status, 1, commit);
    assert.doesNotMatch(bad.stdout, /DECISIÓ/, commit);
  }
});
tests["la decisió confirmatòria no admet --commit ni --manifest, i sense l'etiqueta no decideix (AUD-50, AU2-29)"] = () => withTmp((tmp) => {
  const [a, b] = writeSeries(tmp);
  writeFileSync(join(tmp, 'manifest.json'), JSON.stringify(MANIFEST));
  const run = (...extra) => spawnSync(process.execPath, [join(root, 'fase2', 'estadistica.mjs'), '--etapa', '1', ...extra, a, b], { encoding: 'utf8' });
  for (const extra of [['--commit', COMMIT], ['--manifest', join(tmp, 'manifest.json')], ['--commit', COMMIT, '--manifest', join(tmp, 'manifest.json')]]) {
    const r = run(...extra);
    assert.strictEqual(r.status, 1, extra.join(' '));
    assert.match(r.stdout, /només es poden fer servir amb --prova/);
  }
  // Sense res: o no hi ha l'etiqueta, o la còpia de treball no hi és, o (si hi és) la sèrie sintètica no
  // és la del manifest preregistrat. En cap cas no hi pot haver decisió.
  const plain = run();
  assert.strictEqual(plain.status, 1, plain.stdout);
  assert.doesNotMatch(plain.stdout, /DECISIÓ/);
});
tests['el validador accepta els JSONL reals de sim.mjs, amb establiment i sense'] = () => withTmp((tmp) => {
  // AU2, audit4 §6: una execució real del simulador, no només dades sintètiques
  const sim = (args, file) => spawnSync(process.execPath, [join(root, 'sim.mjs'), ...args, '--json', file], { cwd: root, encoding: 'utf8' });
  const cases = [
    { group: 'A', args: ['--world', '16x16', '--seed', '1', '--epochs', '500', '--every', '100', '--census', '250', '--stop-after-event', '250'],
      params: { programs: 256, world: [16, 16], radius: 2, diffusion: 0, flow: 0, renewal: 0, mutation: 0.00024, rng: 'v2', epochs: 500, every: 100, from: null, start: 0,
        census: { version: 'v3', every: 250, sample: 2048, seed: 20261016 }, event: { share: 0.01, censuses: 2, stopAfter: 250 } }, mixing: 0 },
    { group: 'B', args: ['--world', '32x32', '--seed', '2', '--from', 'test/fixtures/punt-32x32.bin', '--start', '0', '--epochs', '100', '--every', '5', '--census', '5', '--stop-after-event', '10', '--mixing', '0.01'],
      params: { programs: 1024, world: [32, 32], radius: 2, diffusion: 0, flow: 0, renewal: 0, mutation: 0.00024, rng: 'v2', epochs: 100, every: 5, from: 'test/fixtures/punt-32x32.bin', start: 0,
        census: { version: 'v3', every: 5, sample: 2048, seed: 20261016 }, event: { share: 0.01, censuses: 2, stopAfter: 10 } }, mixing: 0.01 },
  ];
  for (const c of cases) {
    const file = join(tmp, `${c.group}.jsonl`);
    const r = sim(c.args, file);
    assert.strictEqual(r.status, 0, r.stderr);
    const x = readExperiment(file);
    const manifest = { groups: { [c.group]: { mixing: c.mixing } }, params: c.params };
    // el codi pot portar +canvis si l'arbre de treball no està net: llavors només hi ha d'haver aquest error
    // El commit es prova a part. Aquí, la referència és el commit sencer si hi ha git, o, sense git (a la VM,
    // on el codi ve de VERSIO), un hash de 40 caràcters que comença pel codi del fitxer
    const git = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
    const code = x.code.replace('+canvis', '');
    const head = git.status === 0 ? git.stdout.trim() : code.padEnd(40, '0');
    const errors = validateExperiment(x, manifest, c.group, { commit: head });
    const rest = errors.filter((e) => !/commit net/.test(e));
    assert.deepStrictEqual(rest, [], `${c.group}: ${errors.join(' | ')}`);
    if (c.group === 'B') assert.ok(x.event && x.time === 5, 'el retall del punt té establiment al primer cens');
  }
});
tests['decisió de cada etapa, amb els límits preregistrats'] = () => {
  assert.match(decide('1', 2.5, MANIFEST).decision, /es rebutja H0 a l'etapa 1/);
  assert.match(decide('1', -2.48, MANIFEST).decision, /es rebutja/);
  assert.match(decide('1', 2.4, MANIFEST).decision, /cal executar l'etapa 2/);
  assert.match(decide('2', 2.01, MANIFEST).decision, /es rebutja H0 a l'etapa 2/);
  assert.match(decide('2', 1.99, MANIFEST).decision, /no es rebutja H0: la sèrie no permet/);
};
tests['--etapa no decideix si la sèrie no és la preregistrada'] = () => withTmp((tmp) => {
  const [a, b] = writeSeries(tmp, (g, seed, r) => { if (seed === 2) r[0].mixing = 0.9; });
  writeFileSync(join(tmp, 'manifest.json'), JSON.stringify(MANIFEST));
  const r = spawnSync(process.execPath, [join(root, 'fase2', 'estadistica.mjs'), '--etapa', '1', '--prova', '--commit', COMMIT, '--manifest', join(tmp, 'manifest.json'), a, b], { encoding: 'utf8' });
  assert.strictEqual(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /NO és la preregistrada/);
  assert.doesNotMatch(r.stdout, /DECISIÓ/);
});
tests['simulació de dues etapes: sense esdeveniments no rebutja mai'] = () => {
  const r = simulateTwoStage({ A: { p: 0, shape: 1 }, B: { p: 0, shape: 1 }, c1: 2.479, c2: 2.004, reps: 50 });
  assert.deepStrictEqual([r.rate, r.stopped1, r.experiments], [0, 0, 160]);
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
