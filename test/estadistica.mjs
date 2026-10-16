// Proves de l'anàlisi estadística (fase2/estadistica.mjs). Executa: node test/estadistica.mjs
//
// Els valors de referència surten de fonts externes (les dades de Gehan, 1965, que fan servir els
// manuals de supervivència), de dues implementacions independents (la de l'equip i la de l'auditor 1)
// o de càlculs a mà que s'indiquen.
import assert from 'assert';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import {
  fisher, wilson, logrank, kaplanMeier, survivalAt, incidenceDifference, rmst, twoStageBounds, power,
  readExperiment, readLegacyLog, normalCdf,
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
        const lines = [{ type: 'start', seed: 1, code: 'x', mixing: 0, epochs, start: 0 },
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

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
