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
  validateSeries, decide, simulateTwoStage,
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
  params: { world: [8, 8], radius: 2, mutation: 0.00024, rng: 'v2', epochs: 1000, start: 0,
    census: { version: 'v3', every: 250, sample: 64, seed: 7 }, event: { share: 0.01, censuses: 2, stopAfter: 500 } },
  stages: { 1: { perGroup: 3, bound: 2.479178635 }, 2: { perGroup: 5, bound: 2.004268879 } },
};
function experiment({ seed, mixing, eventAt = null, code = 'abc1234' }) {
  const { epochs } = MANIFEST.params, every = 250, stopAfter = 500;
  const end = eventAt === null ? epochs : Math.min(epochs, eventAt + stopAfter);
  const records = [{ type: 'start', code, seed, mixing, ...MANIFEST.params }];
  for (let e = every; e <= end; e += every) {
    const h = eventAt !== null && e >= eventAt ? 10 : 0;
    records.push({ type: 'census', version: 'v3', epoch: e, sample: 64, heritable: h, heritableSolo: h, heritableContext: 0, replicating: h, solo: h, families: [] });
    if (eventAt !== null && e === eventAt + every) records.push({ type: 'event', epoch: eventAt, confirmed: e });
  }
  records.push({ type: 'end', epoch: end, reason: eventAt !== null && eventAt + stopAfter <= epochs ? 'establiment' : 'horitzó' });
  return records;
}
function writeSeries(dir, edit = () => {}) {
  const groups = { A: [[1, null], [2, 500], [3, null]], B: [[11, 250], [12, 250], [13, 750]] };
  for (const [g, list] of Object.entries(groups)) {
    mkdirSync(join(dir, g), { recursive: true });
    for (const [seed, eventAt] of list) {
      const records = experiment({ seed, mixing: MANIFEST.groups[g].mixing, eventAt });
      edit(g, seed, records);
      writeFileSync(join(dir, g, `s${seed}.jsonl`), records.map((r) => JSON.stringify(r)).join('\n') + '\n');
    }
  }
  return [join(dir, 'A'), join(dir, 'B')];
}
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'claude-origins-')); try { return fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }

tests['validador: una sèrie correcta passa, i la decisió fa servir el límit de l\'etapa'] = () => withTmp((tmp) => {
  const [a, b] = writeSeries(tmp);
  const v = validateSeries(a, b, MANIFEST, '1');
  assert.deepStrictEqual(v.errors, []);
  assert.strictEqual(v.code, 'abc1234');
  assert.strictEqual(v.A.length + v.B.length, 6);
});

const brokenCases = {
  'mixing equivocat': [(g, seed, r) => { if (seed === 2) r[0].mixing = 0.9; }, /mixing/],
  'llavor que no és de l\'etapa': [(g, seed, r) => { if (seed === 3) r[0].seed = 99; }, /sobren|falten/],
  'commit amb canvis sense desar': [(g, seed, r) => { if (seed === 1) r[0].code = 'abc1234+canvis'; }, /commit net|mateix commit/],
  'commits diferents': [(g, seed, r) => { if (g === 'B') r[0].code = 'def5678'; }, /mateix commit/],
  'un cens que falta (AU2-17)': [(g, seed, r) => { if (seed === 1) r.splice(2, 1); }, /hi falten censos/],
  "experiment tallat abans de l'horitzó": [(g, seed, r) => { if (seed === 3) { r.splice(3); r.push({ type: 'end', epoch: 500, reason: 'horitzó' }); } }, /hauria d'arribar/],
  "línia d'establiment que no és la del criteri": [(g, seed, r) => { const e = r.find((x) => x.type === 'event'); if (seed === 11 && e) e.epoch = 500; }, /línia d'establiment/],
  'un paràmetre del protocol canviat': [(g, seed, r) => { if (seed === 12) r[0].mutation = 0.0005; }, /mutation/],
};
for (const [name, [edit, pattern]] of Object.entries(brokenCases)) {
  tests[`validador: rebutja ${name}`] = () => withTmp((tmp) => {
    const [a, b] = writeSeries(tmp, edit);
    const v = validateSeries(a, b, MANIFEST, '1');
    assert.ok(v.errors.some((e) => pattern.test(e)), v.errors.join(' | ') || '(cap error)');
  });
}
tests['validador: rebutja una llavor repetida'] = () => withTmp((tmp) => {
  const [a, b] = writeSeries(tmp);
  writeFileSync(join(a, 'copia.jsonl'), experiment({ seed: 1, mixing: 0 }).map((r) => JSON.stringify(r)).join('\n') + '\n');
  assert.ok(validateSeries(a, b, MANIFEST, '1').errors.some((e) => /repetides/.test(e)));
});
tests["validador: l'etapa 2 demana les llavors de totes dues etapes"] = () => withTmp((tmp) => {
  const [a, b] = writeSeries(tmp);
  assert.ok(validateSeries(a, b, MANIFEST, '2').errors.some((e) => /falten les llavors 4, 5/.test(e)));
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
  const r = spawnSync(process.execPath, [join(root, 'fase2', 'estadistica.mjs'), '--etapa', '1', '--manifest', join(tmp, 'manifest.json'), a, b], { encoding: 'utf8' });
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
