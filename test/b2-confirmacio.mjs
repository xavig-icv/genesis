// Proves del programa de la sèrie preregistrada de B2 (fase2/b2-confirmacio.mjs i fase2/b2-serie.mjs), amb la
// matriu de l'auditor 2 (auditoria 9, AU2-60) i la comprovació del preregistre abans de carregar el codi
// (AUD-81). Executa: node test/b2-confirmacio.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, copyFileSync, readdirSync, appendFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import {
  lossTime, restricted, validateBranch, readSeries, survival, rmstShare, survivalCurve, bootstrap, interval,
  regimeDiffs, spreadDiffs, signTest, holm, branchCommand, conditionMixing, analyse, costsByWindow,
} from '../fase2/b2-serie.mjs';
import { buildManifest } from '../eines/b2-manifest.mjs';
import { calibrate, spreadPower } from '../eines/b2-cobertura.mjs';
import { checkCaptures } from '../eines/b2-captures.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const RULE = { lossMax: 5, recoverMin: 21 };
const cs = (t, hs) => hs.map((h, j) => ({ type: 'census', epoch: t + 250 * (j + 1), sample: 2048, heritable: h }));

// Un manifest petit: 2 mons A i 2 de B, H = 1.000 (4 censos), K = 2 a cada condició
function smallManifest(extra = {}) {
  const worlds = [
    { id: 'A1', group: 'A', seed: 1, t: 1000 }, { id: 'A2', group: 'A', seed: 2, t: 2000 },
    { id: 'B1', group: 'B', seed: 11, t: 500 }, { id: 'B2', group: 'B', seed: 12, t: 750 },
  ].map((w) => ({ ...w, capture: `captures/${w.id}.bin`, sha256: '0'.repeat(64), machine: w.group === 'A' ? 'pc' : 'vm' }));
  const branches = [];
  for (const w of worlds) for (const cond of ['origen', 'canvi']) for (const k of [0, 1]) {
    branches.push({ name: `b${String(branches.length + 1).padStart(3, '0')}`, world: w.id, cond, mixing: conditionMixing(w.group, cond), k, seed: w.seed + [200000, 300000][k], H: 1000 });
  }
  return {
    name: 'prova', estat: 'final', tag: 'preregistre-b2', protocol: 'docs/protocol-b2.md', dir: 'fase2/resultats/b2/confirmacio', design: 'prova',
    params: { world: [512, 256], radius: 2, rng: 'v2', every: 100, mutation: 0.00024, census: { version: 'v3', every: 250, sample: 2048, seed: 20261016 } },
    rule: RULE,
    tests: {
      method: 'holm', alpha: 0.025,
      regime: { horizon: 1000, seedsOrigin: [0, 1], seedsSwitch: [0, 1], sided: 'unilateral' },
      spread: { censuses: 4, seedsOrigin: [0, 1], seedsSwitch: [0, 1], sided: 'unilateral' },
    },
    bootstrap: { reps: 300, seed: 7, interval: 'percentil', level: 0.95 }, machines: { names: ['pc', 'vm'], seed: 1 }, names: { seed: 2 },
    worlds, branches, ...extra,
  };
}
// Els registres d'una branca, en el format de sim.mjs
function records(b, w, m, heritables, { code = 'abcdef1' } = {}) {
  const rec = [{
    type: 'start', code, rng: 'v2', node: 'v16', zlib: 'x', command: `node sim.mjs ${branchCommand(b, w, m).split(' ').slice(1).join(' ')}`,
    seed: b.seed, programs: 131072, world: [512, 256], radius: 2, mixing: b.mixing, diffusion: 0, flow: 0, renewal: 0, mutation: 0.00024,
    from: w.capture, start: w.t, epochs: w.t + b.H, every: 100, census: { version: 'v3', every: 250, sample: 2048, seed: 20261016 },
  }];
  // com sim.mjs: a cada època, el cens (múltiples de 250) i després la mesura (múltiples de 100 absoluts)
  const fam = [{ id: 1, born: w.t + 250, share: 0.1 }];
  for (let e = w.t + 1; e <= w.t + b.H; e++) {
    if (e % 250 === 0) {
      const h = heritables[(e - w.t) / 250 - 1], rep = Math.min(2048, h + 10);
      rec.push({ type: 'census', version: 'v3', epoch: e, families: fam, extinct: [], untracked: [], familySample: 0.1, sample: 2048, replicating: rep, solo: rep, context: 0, heritable: h, heritableSolo: h, heritableContext: 0 });
    }
    if (e % 100 === 0) rec.push({ type: 'measure', epoch: e, h0: 5, hoe: 1, ops: 1000, runs: 100, epochs: 100, seconds: (e - w.t) * 2 });
  }
  rec.push({ type: 'end', epoch: w.t + b.H, reason: 'horitzó', fingerprint: 'abcd1234', hoeTransition: null, event: null, seconds: b.H * 2 });
  return rec;
}
// Escriu una sèrie sintètica: fate(branca) dona els hereditaris dels 4 censos
function writeSeries(dir, m, fate, opts = {}) {
  mkdirSync(dir, { recursive: true });
  for (const b of m.branches) {
    const w = m.worlds.find((x) => x.id === b.world);
    writeFileSync(join(dir, `${b.name}.jsonl`), records(b, w, m, fate(b, w), opts).map((r) => JSON.stringify(r)).join('\n') + '\n');
  }
}
const ALIVE = [300, 400, 500, 600];
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'b2c-')); try { fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }

const tests = {
  // ---- La mesura (AU2-57; la matriu de l'auditor 2)
  'dos censos seguits amb 5 o menys: pèrdua, datada al primer': () => {
    const r = lossTime(cs(0, [100, 5, 3, 50]), 0, 1000, RULE);
    assert.deepStrictEqual([r.event, r.T, r.recovered], [true, 250 * 2, true]);
  },
  'un cens baix i el següent no: cap pèrdua': () => {
    const r = lossTime(cs(0, [100, 5, 6, 50]), 0, 1000, RULE);
    assert.deepStrictEqual([r.event, r.T], [false, 1000]);
  },
  'la parella a H − 250 i H: pèrdua a H − 250; un sol cens baix a H: censura a H': () => {
    assert.deepStrictEqual(lossTime(cs(0, [100, 100, 4, 2]), 0, 1000, RULE).T, 750);
    const r = lossTime(cs(0, [100, 100, 100, 2]), 0, 1000, RULE);
    assert.deepStrictEqual([r.event, r.T, r.finalR2], [false, 1000, false]);
  },
  'una recuperació no anul·la la pèrdua, i l\'estat final és una altra mesura': () => {
    const r = lossTime(cs(0, [3, 2, 40, 1825]), 0, 1000, RULE);
    assert.deepStrictEqual([r.event, r.T, r.recovered, r.final1pct, r.finalR2], [true, 250, true, true, true]);
    assert.strictEqual(restricted(r, 1000), 250);
    assert.strictEqual(restricted({ event: true, T: 900 }, 1000), 1000);   // no es podria confirmar abans de 1.000
  },
  // ---- La validació (AU2-60)
  'un cens que falta, una línia final anticipada o una altra ordre: error, no censura': () => {
    const m = smallManifest(), b = m.branches[0], w = m.worlds.find((x) => x.id === b.world);
    const ok = records(b, w, m, ALIVE);
    assert.deepStrictEqual(validateBranch(ok, b, w, m), []);
    const gap = ok.filter((r) => !(r.type === 'census' && r.epoch === w.t + 500));
    assert.match(validateBranch(gap, b, w, m).join(), /censos no són exactament/);
    const early = ok.filter((r) => !(r.type === 'census' && r.epoch > w.t + 500) && r.type !== 'end').concat([{ type: 'end', epoch: w.t + 500, reason: 'horitzó' }]);
    assert.match(validateBranch(early, b, w, m).join(), /acaba a l'època/);
    const wrongSeed = [{ ...ok[0], seed: ok[0].seed + 1 }, ...ok.slice(1)];
    assert.match(validateBranch(wrongSeed, b, w, m).join(), /seed és/);
    const wrongCond = [{ ...ok[0], mixing: 0.01 - ok[0].mixing }, ...ok.slice(1)];
    assert.match(validateBranch(wrongCond, b, w, m).join(), /mixing és/);
    const wrongFrom = [{ ...ok[0], from: 'una/altra.bin' }, ...ok.slice(1)];
    assert.match(validateBranch(wrongFrom, b, w, m).join(), /from és/);
  },
  'un commit diferent, o amb canvis sense desar, és un error del preregistre': () => {
    const m = smallManifest(), b = m.branches[0], w = m.worlds.find((x) => x.id === b.world);
    const commit = 'abcdef1' + '0'.repeat(33);
    assert.deepStrictEqual(validateBranch(records(b, w, m, ALIVE), b, w, m, { commit }), []);
    assert.match(validateBranch(records(b, w, m, ALIVE, { code: '1234567' }), b, w, m, { commit }).join(), /no el del preregistre/);
    assert.match(validateBranch(records(b, w, m, ALIVE, { code: 'abcdef1+canvis' }), b, w, m, { commit }).join(), /no el del preregistre/);
  },
  'una branca que falta, o un JSONL aliè: la sèrie no es calcula': () => withTmp((tmp) => {
    const m = smallManifest();
    writeSeries(tmp, m, () => ALIVE);
    assert.deepStrictEqual(readSeries(tmp, m).problems, []);
    rmSync(join(tmp, 'b003.jsonl'));
    writeFileSync(join(tmp, 'x.jsonl'), '{}\n');
    const p = readSeries(tmp, m).problems.join('\n');
    assert.match(p, /b003\.jsonl: falta/);
    assert.match(p, /x\.jsonl: no és cap branca/);
  }),
  // ---- Les estimacions i el bootstrap (AU2-58)
  'les estimacions, amb el mateix pes per món i la mitjana de les K llavors': () => withTmp((tmp) => {
    const m = smallManifest();
    // a A1, una de les dues llavors d'origen perd la vida a 250; la resta, vives
    writeSeries(tmp, m, (b) => (b.world === 'A1' && b.cond === 'origen' && b.k === 0 ? [3, 2, 1, 0] : ALIVE));
    const { worlds } = readSeries(tmp, m);
    assert.strictEqual(survival(worlds, 'origen'), (0.5 + 1 + 1 + 1) / 4);
    assert.strictEqual(rmstShare(worlds, 'origen'), ((250 / 1000 + 1) / 2 + 1 + 1 + 1) / 4);
    const { curve, median } = survivalCurve(worlds, 'origen');
    assert.deepStrictEqual(curve.map((c) => c.s), [0.875, 0.875, 0.875, 0.875]);
    assert.strictEqual(median, null);
  }),
  'el bootstrap reextreu mons sencers, amb tants A i tants B com n\'hi ha': () => {
    const worlds = ['A', 'A', 'A', 'B', 'B'].map((group, i) => ({ id: `w${i}`, group, origen: [{ i }], canvi: [] }));
    const seen = [];
    bootstrap(worlds, (s) => { seen.push(s); return 0; }, { reps: 50, seed: 3 });
    for (const s of seen) {
      assert.strictEqual(s.filter((w) => w.group === 'A').length, 3);
      assert.strictEqual(s.filter((w) => w.group === 'B').length, 2);
      assert.ok(s.every((w) => worlds.includes(w)));                 // el món sencer, no branques soltes
    }
    // sempre el mateix, amb la mateixa llavor
    const a = bootstrap(worlds, (s) => s.filter((w) => w.group === 'A' && w.id === 'w0').length, { reps: 20, seed: 9 });
    const b = bootstrap(worlds, (s) => s.filter((w) => w.group === 'A' && w.id === 'w0').length, { reps: 20, seed: 9 });
    assert.deepStrictEqual([...a], [...b]);
  },
  '29 mons sense cap pèrdua: l\'interval exacte, sense NaN': () => {
    const worlds = Array.from({ length: 29 }, (_, i) => ({ id: `w${i}`, group: i < 12 ? 'A' : 'B', origen: [{ event: false, T: 1000, H: 1000 }], canvi: [] }));
    for (const method of ['percentil', 'bca', 'logit']) {
      const r = interval(worlds, (ws) => survival(ws), { reps: 200, seed: 1, method });
      assert.strictEqual(r.theta, 1);
      assert.strictEqual(r.hi, 1);
      assert.ok(Math.abs(r.lo - 0.025 ** (1 / 29)) < 1e-12, `${method}: ${r.lo}`);
    }
  },
  'els tres mètodes donen un interval que conté l\'estimació': () => {
    const worlds = Array.from({ length: 29 }, (_, i) => ({ id: `w${i}`, group: i < 12 ? 'A' : 'B',
      origen: [{ event: i % 4 === 0, T: i % 4 === 0 ? 500 : 1000, H: 1000 }, { event: i % 5 === 0, T: i % 5 === 0 ? 750 : 1000, H: 1000 }], canvi: [] }));
    for (const method of ['percentil', 'bca', 'logit']) {
      const r = interval(worlds, (ws) => survival(ws), { reps: 500, seed: 2, method });
      assert.ok(r.lo <= r.theta && r.theta <= r.hi && r.lo >= 0 && r.hi <= 1, `${method}: ${JSON.stringify(r)}`);
    }
  },
  // ---- La prova del canvi de règim
  'la prova de signes: el canvi escurça la vida a 3 mons i a cap la allarga': () => withTmp((tmp) => {
    const m = smallManifest();
    writeSeries(tmp, m, (b) => (b.cond === 'canvi' && b.world !== 'B2' ? [3, 2, 1, 0] : ALIVE));
    const { worlds } = readSeries(tmp, m);
    const d = regimeDiffs(worlds, m.tests.regime);
    assert.deepStrictEqual(d.map((x) => Math.sign(x)), [-1, -1, -1, 0]);
    assert.deepStrictEqual(signTest(d, 'unilateral'), { neg: 3, pos: 0, ties: 1, p: 1 / 8 });
    assert.strictEqual(signTest(d, 'bilateral').p, 1 / 4);
    const res = analyse(worlds, m);
    assert.strictEqual(res.tests.regime.rejected, false);            // amb 3 mons, p = 0,125 > 0,025
  }),
  // ---- La prova de l'expansió amb corrent (protocol §6.3)
  "l'expansió: el corrent és el canvi als mons A i l'origen als B, amb la mitjana dels primers censos": () => withTmp((tmp) => {
    const m = smallManifest();
    // amb corrent, més hereditaris a A1, A2 i B1; a B2, menys
    const more = [600, 700, 800, 900], less = [300, 300, 300, 300];
    writeSeries(tmp, m, (b, w) => {
      const current = b.mixing > 0;
      if (w.id === 'B2') return current ? less : more;
      return current ? more : less;
    });
    const { worlds } = readSeries(tmp, m);
    const d = spreadDiffs(worlds, m.tests.spread);
    assert.deepStrictEqual(d.map((x) => Math.sign(x)), [1, 1, 1, -1]);
    assert.ok(Math.abs(d[0] - (750 - 300) / 2048) < 1e-12);
    assert.deepStrictEqual(signTest(d, 'unilateral', { expect: 'positiu' }), { neg: 1, pos: 3, ties: 0, p: 5 / 16 });
    assert.strictEqual(signTest(d, 'unilateral').p, 15 / 16);          // l'altra cua
    // només els n primers censos: amb 2, la mitjana de 600 i 700 contra 300
    assert.ok(Math.abs(spreadDiffs(worlds, { ...m.tests.spread, censuses: 2 })[0] - (650 - 300) / 2048) < 1e-12);
    const res = analyse(worlds, m);
    assert.deepStrictEqual([res.tests.spread.pos, res.tests.spread.rejected], [3, false]);
  }),
  'un manifest amb menys censos que els de la prova de l\'expansió: la sèrie no es calcula': () => withTmp((tmp) => {
    const m = smallManifest();
    writeSeries(tmp, m, () => ALIVE);
    const bad = { ...m, tests: { ...m.tests, spread: { ...m.tests.spread, censuses: 5 } } };
    assert.match(readSeries(tmp, bad).problems.join(), /menys de 5 censos/);
  }),
  // AU2-64 (auditoria 10): les mutacions de l'auditor 2 i unes quantes més, sobre un registre complet
  'el validador rebutja un registre sense mesures, amb segons negatius, línies alienes o comptadors impossibles (AU2-64)': () => {
    const m = smallManifest(), b = m.branches.find((x) => x.world === 'B2'), w = m.worlds.find((x) => x.id === 'B2');   // t = 750
    const ok = records(b, w, m, ALIVE);
    assert.deepStrictEqual(validateBranch(ok, b, w, m), []);
    const bad = (label, rec, re) => { const e = validateBranch(rec, b, w, m).join(' | '); assert.match(e, re, `${label}: ${e || 'cap error'}`); };
    bad('sense mesures', ok.filter((r) => r.type !== 'measure'), /0 mesures/);
    bad('una mesura de menys', ok.filter((r) => !(r.type === 'measure' && r.epoch === 1200)), /mesur/);
    bad('segons negatius', ok.map((r) => (r.type === 'measure' ? { ...r, seconds: -500 } : r)), /segons negatius/);
    bad('segons que baixen', ok.map((r) => (r.type === 'measure' && r.epoch === 1500 ? { ...r, seconds: 1 } : r)), /segons baixen/);
    bad('una línia d\'un tipus inventat', [...ok.slice(0, -1), { type: 'INVENTAT', epoch: 1750 }, ok[ok.length - 1]], /tipus que no hi pot ser/);
    bad('un camp de més', ok.map((r) => (r.type === 'measure' && r.epoch === 900 ? { ...r, extra: 1 } : r)), /camps esperats/);
    bad('replicating = 0 amb hereditaris', ok.map((r) => (r.type === 'census' ? { ...r, replicating: 0 } : r)), /replicating no quadra|més hereditaris/);
    bad('heritable sense desglossament', ok.map((r) => (r.type === 'census' ? { ...r, heritableSolo: 0 } : r)), /heritableSolo \+ heritableContext/);
    bad('tots els censos abans de les mesures', [ok[0], ...ok.filter((r) => r.type === 'census'), ...ok.filter((r) => r.type === 'measure'), ok[ok.length - 1]], /ordre de sim\.mjs/);
    bad('un establiment que no quadra', [...ok.slice(0, -1), { type: 'event', epoch: 1100, confirmed: 1250 }, ok[ok.length - 1]], /establiment/);
    // un establiment ben fet, al seu lloc (després del cens que el confirma) i a la línia final, és vàlid
    const i = ok.findIndex((r) => r.type === 'census' && r.epoch === 1250);
    const withEvent = [...ok.slice(0, i + 1), { type: 'event', epoch: 1000, confirmed: 1250 }, ...ok.slice(i + 1, -1), { ...ok[ok.length - 1], event: 1000 }];
    assert.deepStrictEqual(validateBranch(withEvent, b, w, m), []);
  },
  'una sèrie amb un sol registre mutat no es calcula, i el programa no decideix res (AU2-64)': () => withTmp((tmp) => {
    const m = smallManifest();
    writeSeries(tmp, m, () => ALIVE);
    const f = join(tmp, 'b005.jsonl');
    writeFileSync(f, readFileSync(f, 'utf8').split('\n').filter((l) => !l.includes('"measure"')).join('\n'));
    const { problems } = readSeries(tmp, m);
    assert.ok(problems.some((p) => /b005: té 0 mesures/.test(p)), problems.join('\n'));
  }),
  'el cost per trams, també si t no és múltiple de 100 (corregit a l\'auditoria 10)': () => {
    const m = smallManifest(), b = m.branches.find((x) => x.world === 'B2'), w = m.worlds.find((x) => x.id === 'B2');
    assert.strictEqual(w.t % 100, 50);
    assert.deepStrictEqual(costsByWindow(records(b, w, m, ALIVE), w.t), [2, 2]);       // 2 s per època, 1.000 èpoques
  },
  // AU2-65 (auditoria 10): la regla conjunta per origen, amb el contraexemple de l'auditor 2
  'l\'expansió es rebutja només si, a més de Holm, el corrent guanya a més de la meitat dels mons de cada origen (AU2-65)': () => {
    const m = smallManifest();
    m.tests.spread = { ...m.tests.spread, censuses: 4, byOrigin: 'majoria' };
    m.bootstrap = { ...m.bootstrap, reps: 50 };
    const branch = (v) => ({ H: 1000, T: 1000, event: false, recovered: false, final1pct: true, finalR2: true, shares: [v, v, v, v], costs: [], successor: false });
    const series = (plusA, plusB) => Array.from({ length: 29 }, (_, i) => {
      const group = i < 12 ? 'A' : 'B', plus = group === 'A' ? i < plusA : i - 12 < plusB;
      const yes = branch(plus ? 0.8 : 0.2), no = branch(plus ? 0.2 : 0.8);       // yes: la condició amb corrent
      return { id: `w${i}`, group, origen: group === 'B' ? [yes, yes] : [no, no], canvi: group === 'A' ? [yes, yes] : [no, no] };
    });
    let r = analyse(series(4, 17), m).tests.spread;                                // 21 de 29, però només 4 de 12 als A
    assert.deepStrictEqual([r.pos, r.holmRejected, r.coherent, r.rejected], [21, true, false, false]);
    assert.deepStrictEqual([r.byOrigin.A.pos, r.byOrigin.B.pos], [4, 17]);
    r = analyse(series(10, 12), m).tests.spread;                                   // 22 de 29, coherent: 10 de 12 i 12 de 17
    assert.deepStrictEqual([r.pos, r.holmRejected, r.coherent, r.rejected], [22, true, true, true]);
    r = analyse(series(6, 15), m).tests.spread;                                    // 21 de 29, i 6 de 12 als A: no n'hi ha prou (cal més de la meitat)
    assert.deepStrictEqual([r.holmRejected, r.coherent, r.rejected], [true, false, false]);
    // sense la regla (un manifest antic), mana només Holm
    const old = { ...m, tests: { ...m.tests, spread: { ...m.tests.spread, byOrigin: undefined } } };
    assert.strictEqual(analyse(series(4, 17), old).tests.spread.rejected, true);
  },
  // AU2-66 (auditoria 10): la SHA-256 de les captures d'origen, a cada màquina, abans de llançar
  'la comprovació de les captures: una de bona, una de diferent i una que falta (AU2-66)': () => withTmp((tmp) => {
    const put = (name, text) => { writeFileSync(join(tmp, name), text); return createHash('sha256').update(text).digest('hex'); };
    const shaA = put('a.bin', 'captura A'), shaB = put('b.bin', 'captura B');
    const m = { worlds: [
      { id: 'A1', machine: 'pc', capture: join(tmp, 'a.bin'), sha256: shaA },
      { id: 'B1', machine: 'vm', capture: join(tmp, 'b.bin'), sha256: shaA },
      { id: 'B2', machine: 'vm', capture: join(tmp, 'c.bin'), sha256: shaB },
    ] };
    assert.deepStrictEqual(checkCaptures(m).bad, ['B1', 'B2']);
    assert.deepStrictEqual(checkCaptures(m, { machine: 'pc' }), { lines: [`ok        A1  ${join(tmp, 'a.bin')}  ${shaA}`], bad: [], n: 1 });
    assert.match(checkCaptures(m, { machine: 'vm' }).lines.join('\n'), /DIFERENT  B1[\s\S]*FALTA     B2/);
  }),
  'la potència realista de l\'expansió: la de l\'auditor 1, i la regla conjunta hi costa poc (auditoria 10)': () => {
    const r = (d, K) => spreadPower(d, { K });
    assert.deepStrictEqual([r(14.6, 1).global, r(14.6, 2).global, r(10, 2).global].map((x) => Math.round(100 * x)), [74, 85, 50]);
    for (const [d, K] of [[7, 1], [10, 2], [14.6, 2]]) assert.ok(r(d, K).global - r(d, K).conjunct < 0.02);
  },
  'Holm: la p més petita amb α/2, i l\'altra amb α només si la primera es rebutja': () => {
    const pick = (r) => r.map((x) => [x.rejected, x.threshold]);
    assert.deepStrictEqual(pick(holm([0.01, 0.02], 0.025)), [[true, 0.0125], [true, 0.025]]);
    assert.deepStrictEqual(pick(holm([0.02, 0.001], 0.025)), [[true, 0.025], [true, 0.0125]]);
    assert.deepStrictEqual(pick(holm([0.03, 0.001], 0.025)), [[false, 0.025], [true, 0.0125]]);
    assert.deepStrictEqual(pick(holm([0.013, 0.02], 0.025)), [[false, 0.0125], [false, null]]);
  },
  "l'eina de calibratge dona la cobertura i la potència, sense NaN": () => {
    const lines = calibrate({ sims: 4, reps: 30, rrs: [1, 5], rho: 0 });
    assert.ok(lines.some((l) => /percentil .* bca .* logit/.test(l)));
    assert.ok(lines.some((l) => /disseny \(i\): RR 1: .* RR 5: /.test(l)));
    // a 29 mons, la prova de l'expansió demana 21 de 29 tant amb α com amb α/2 (Holm no li costa res)
    assert.ok(lines.some((l) => /^  α = 0\.025: calen 21 de 29; .*q 0\.76: 75\.\d %/.test(l)), lines.join('\n'));
    assert.ok(lines.some((l) => /^  α = 0\.0125: calen 21 de 29;/.test(l)));
    assert.ok(!lines.join('\n').includes('NaN'));
  },
  // ---- El manifest
  'el manifest: els 29 mons de confirmació, cap d\'exploració, i les màquines equilibrades per origen': () => {
    for (const design of ['i', 'ii']) {
      const m = buildManifest({ design });
      assert.strictEqual(m.worlds.length, 29);
      const split = JSON.parse(readFileSync(join(root, 'fase2', 'resultats', 'b2', 'repartiment.json'), 'utf8'));
      const conf = new Set(split.worlds.filter((w) => w.part === 'confirmacio').map((w) => `${w.group}${w.seed}`));
      assert.ok(m.worlds.every((w) => conf.has(w.id)));
      for (const g of ['A', 'B']) {
        const ws = m.worlds.filter((w) => w.group === g), pc = ws.filter((w) => w.machine === 'pc').length;
        assert.ok(Math.abs(2 * pc - ws.length) <= 1);
      }
      assert.strictEqual(new Set(m.branches.map((b) => b.name)).size, m.branches.length);
      assert.strictEqual(m.branches.length, design === 'i' ? 116 : 87);
      // les dues proves, amb Holm; l'expansió, amb tots els censos que necessita a totes les branques
      assert.deepStrictEqual([m.tests.method, m.tests.alpha, m.tests.spread.censuses], ['holm', 0.025, 8]);
      assert.ok(m.branches.every((b) => b.H / m.params.census.every >= m.tests.spread.censuses));
      assert.deepStrictEqual(m.tests.spread.seedsSwitch, design === 'i' ? [0, 1] : [0]);
      assert.deepStrictEqual(buildManifest({ design }), m);           // sempre el mateix
    }
  },
  // ---- El programa
  '--prova calcula sense decidir, i es nega a llegir la carpeta de la sèrie': () => withTmp((tmp) => {
    const m = smallManifest();
    const man = join(tmp, 'serie.json');
    writeFileSync(man, JSON.stringify(m));
    writeSeries(join(tmp, 'dades'), m, () => ALIVE);
    const run = (...a) => spawnSync(process.execPath, [join(root, 'fase2', 'b2-confirmacio.mjs'), ...a], { cwd: root, encoding: 'utf8' });
    const rel = (p) => relative(root, p).replace(/\\/g, '/');      // --serie és relatiu a l'arrel
    let r = run('--prova', 'abcdef1'.padEnd(40, '0'), '--serie', rel(man), join(tmp, 'dades'));
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /^MODE DE PROVA/m);
    assert.doesNotMatch(r.stdout, /DECISIÓ/);
    r = run('--prova', 'abcdef1'.padEnd(40, '0'), '--serie', rel(man), join(root, 'fase2', 'resultats', 'b2', 'confirmacio'));
    assert.strictEqual(r.status, 2);
    assert.match(r.stdout, /no llegeix la carpeta de la sèrie/);
  }),
  '--decideix sense l\'etiqueta preregistre-b2 es nega a decidir': () => {
    const r = spawnSync(process.execPath, [join(root, 'fase2', 'b2-confirmacio.mjs'), '--decideix', tmpdir()], { cwd: root, encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '' } });
    assert.strictEqual(r.status, 1);
    assert.match(r.stdout, /No es pot prendre la decisió confirmatòria: no hi ha l'etiqueta de git preregistre-b2/);
  },
  'amb l\'etiqueta decideix; i amb b2-serie.mjs canviat es nega, sense executar-ne el codi (AUD-81)': () => withTmp((tmp) => {
    const repo = join(tmp, 'repo');
    for (const d of ['fase1', 'fase2', 'docs']) mkdirSync(join(repo, d), { recursive: true });
    copyFileSync(join(root, 'package.json'), join(repo, 'package.json'));
    for (const d of ['fase1', 'fase2']) for (const f of readdirSync(join(root, d)).filter((f) => /\.m?js$/.test(f))) copyFileSync(join(root, d, f), join(repo, d, f));
    writeFileSync(join(repo, 'docs', 'protocol-b2.md'), '# Protocol de prova\n');
    const m = smallManifest();
    writeFileSync(join(repo, 'fase2', 'serie-b2.json'), JSON.stringify(m, null, 1) + '\n');
    const GIT = ['-c', 'user.name=prova', '-c', 'user.email=prova@exemple.invalid', '-c', 'core.autocrlf=false'];
    const git = (...a) => { const r = spawnSync('git', [...GIT, ...a], { cwd: repo, encoding: 'utf8' }); if (r.status) throw new Error(r.stderr); return r.stdout.trim(); };
    git('init', '-q'); git('add', '-A'); git('commit', '-q', '-m', 'preregistre de prova');
    const sha = (f) => createHash('sha256').update(readFileSync(join(repo, f))).digest('hex');
    const files = ['fase2/serie-b2.json', 'docs/protocol-b2.md', 'fase2/b2-confirmacio.mjs', 'fase2/b2-serie.mjs', 'fase2/preregistre.mjs'];
    git('tag', '-a', 'preregistre-b2', '-m', 'Preregistre de prova\n\n' + files.map((f) => `${sha(f)}  ${f}`).join('\n'));
    const commit = git('rev-parse', 'HEAD');
    writeSeries(join(tmp, 'dades'), m, () => ALIVE, { code: commit.slice(0, 7) });
    const decide = () => spawnSync(process.execPath, ['fase2/b2-confirmacio.mjs', '--decideix', join(tmp, 'dades')], { cwd: repo, encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '' } });
    let r = decide();
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /^DECISIÓ 1 \(el canvi de règim\): no es rebutja H0/m);
    assert.match(r.stdout, /^DECISIÓ 2 \(l'expansió amb corrent\): no es rebutja H0/m);
    appendFileSync(join(repo, 'fase2', 'b2-serie.mjs'), "\nconsole.log('CODI MODIFICAT');\n");
    r = decide();
    assert.strictEqual(r.status, 1);
    assert.match(r.stdout, /fitxers diferents dels de l'etiqueta: fase2\/b2-serie\.mjs/);
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
