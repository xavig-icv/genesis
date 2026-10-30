// Proves de la sèrie preregistrada de la maduració (fase2/maduracio-serie.mjs i fase2/maduracio-confirmacio.mjs), amb un
// manifest petit i registres sintètics amb l'esquema sencer que escriu sim.mjs:
//   - la permutació de signes exacta, contra l'enumeració de totes les assignacions de signes, i contra la de coma
//     flotant de la potència (eines/potencia-maduracio.mjs);
//   - Holm amb les p exactes i amb els llindars calibrats, la taula dels llindars, l'interval de Clopper-Pearson i el
//     bootstrap per món;
//   - el manifest i la validació dels registres, amb les mutacions que no hi han de passar;
//   - l'anàlisi i les frases de les decisions, amb un resultat conegut;
//   - el certificat de la taula (AU2-99): les cotes, contra la cerca de la taula i una graella, una taula adulterada, i un número
//     del fitxer canviat, que la preparació troba en tornar-lo a calcular (auditoria 22);
//   - la línia d'ordres: --prova no llegeix cap registre de la sèrie, ni pel camí d'un àlies de la carpeta o dels fitxers, ni
//     amb un manifest que digui un altre dir, ni si la sèrie ja en té (AU2-96, AU2-98), ni des d'una altra còpia del
//     repositori, ni en una còpia dels fitxers (AUD-132); d'un registre, abans de llegir-lo, en llegeix només la primera línia
//     no buida, com el lector, i ni un byte més, comptat (AU2-100, AUD-133); i --decideix no decideix res sense el preregistre.
// Executa: node test/maduracio-serie.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, readdirSync, copyFileSync, appendFileSync, symlinkSync, linkSync } from 'fs';
import { tmpdir } from 'os';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { expectedBranches, manifestProblems, branchProblems, readSeries, signFlipTest, holm, calibratedHolm, readThresholds, thresholdProblems, THRESHOLDS, THRESHOLDS_SHA256, clopperPearson, worldBootstrap, analyse, decisionLines } from '../fase2/maduracio-serie.mjs';
import { calibrate, STEPS, tailCounts, criticals, ruleCriticals, nominalK, CERTIFICATE, SAFE, certify, certificateRows, certificateProblems, recomputedProblems, sha256Of, shape, conditionalSize } from '../eines/llindars-maduracio.mjs';
import { signFlipP, signP } from '../eines/potencia-maduracio.mjs';
import { establishment } from '../fase2/census.js';
import { makeRng } from '../fase1/soup.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const ARMS = ['continue', 'shuffle-all', 'reinit'];
const COMMIT = 'abcdef0' + '1'.repeat(33);
// la carpeta de la sèrie de veritat, i una altra per a les dades sintètiques de --prova: les ordres dels registres de la sèrie
// escriuen a la primera, i --prova no en llegeix cap (AUD-132)
const SERIES_DIR = 'fase2/resultats/maduracio/serie/branques', SYNTH_DIR = 'fase2/resultats/maduracio/prova/branques';
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'serie-')); try { fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }
// la taula dels llindars calibrats del projecte (fase2/maduracio-llindars.json)
let TABLE = null;
const table = () => { if (!TABLE) { const t = readThresholds(join(root, THRESHOLDS), 0.025); assert.deepStrictEqual(t.problems, []); TABLE = t.table; } return TABLE; };

// Un manifest petit de la sèrie: n mons inclosos (W1, W2...) i un d'exclòs, 3 braços, 2 llavors, i H = 1.000 des de
// l'època 1.000
function smallManifest({ n = 6, dir = SERIES_DIR, code = 'abcdef0' } = {}) {
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
  const test = { measure: 'x', unit: 'món', worlds: 'tots', contrasts: [['continue', 'reinit'], ['shuffle-all', 'reinit']], method: 'holm', alpha: 0.025, sided: 'greater', statistic: 'x', thresholds: THRESHOLDS, thresholdsSha256: THRESHOLDS_SHA256, descriptive: [['continue', 'shuffle-all']] };
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
// Una còpia del programa en una carpeta temporal, amb la taula dels llindars i el seu certificat: les proves que hi escriuen la
// sèrie de veritat no toquen el repositori
function programCopy(tmp) {
  const repo = join(tmp, 'repo');
  for (const d of ['fase1', 'fase2', 'eines', 'docs']) mkdirSync(join(repo, d), { recursive: true });
  copyFileSync(join(root, 'package.json'), join(repo, 'package.json'));
  for (const d of ['fase1', 'fase2', 'eines']) for (const f of readdirSync(join(root, d)).filter((f) => /\.m?js$/.test(f))) copyFileSync(join(root, d, f), join(repo, d, f));
  for (const f of [THRESHOLDS, CERTIFICATE]) copyFileSync(join(root, f), join(repo, f));
  writeFileSync(join(repo, 'docs', 'protocol-maduracio.md'), '# Protocol de prova\n');
  return repo;
}
function writeSeries(dir, m, fate) { for (const b of expectedBranches(m)) write(dir, b, records(b, m, fate)); }
// El programa de la decisió, executat des d'una còpia (cwd); i que --prova es negui amb el codi 2, abans de llegir cap registre
const runIn = (cwd, ...a) => spawnSync(process.execPath, [join(cwd, 'fase2', 'maduracio-confirmacio.mjs'), ...a], { cwd, encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '' } });
function refused(r, what, why) {
  assert.strictEqual(r.status, 2, `${what}: ${r.stdout}${r.stderr}`);
  assert.ok(why.test(r.stdout), `${what}: ${r.stdout}`);
  assert.ok(!/MODE DE PROVA|La sèrie no és la del manifest/.test(r.stdout), `${what}: n'ha llegit el contingut`);
}
// Un comptador de lectures (AU2-100): es carrega abans del programa (--require) i embolcalla les funcions de fs, també les que el
// programa importa com a mòdul ES (syncBuiltinESMExports). De cada fitxer .jsonl, desa a $LECTURES quants bytes se n'han llegit
// amb readSync i si s'ha llegit sencer amb readFileSync
const COUNTER = `const fs = require('fs'), { syncBuiltinESMExports } = require('module');
const { openSync, readSync, closeSync, readFileSync, writeFileSync } = fs, open = new Map(), reads = {};
const note = (p) => reads[p] || (reads[p] = { bytes: 0, whole: false });
const isRecord = (p) => typeof p === 'string' && p.endsWith('.jsonl');
fs.openSync = (p, ...a) => { const fd = openSync(p, ...a); if (isRecord(p)) { open.set(fd, p); note(p); } return fd; };
fs.closeSync = (fd) => { open.delete(fd); return closeSync(fd); };
fs.readSync = (fd, ...a) => { const n = readSync(fd, ...a); if (open.has(fd)) note(open.get(fd)).bytes += n; return n; };
fs.readFileSync = (p, ...a) => { if (isRecord(p)) note(p).whole = true; return readFileSync(p, ...a); };
syncBuiltinESMExports();
process.on('exit', () => writeFileSync(process.env.LECTURES, JSON.stringify(reads)));
`;
// Els bytes d'un registre fins al salt de línia de la primera línia no buida, inclòs: tot el que la barrera en pot llegir
const headBytes = (buf) => { for (let from = 0; ;) { const nl = buf.indexOf(0x0a, from); if (nl < 0) return buf.length; if (buf.toString('utf8', from, nl).trim()) return nl + 1; from = nl + 1; } };
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
  "Holm amb els llindars calibrats: el primer pas amb K1(m), i el segon amb K2(m) només si l'altra es rebutja al primer": () => {
    // una taula sintètica: al primer pas, només el resultat més extrem (el recompte 1) i a partir de 7 mons; al segon, el
    // recompte 2 a partir de 6
    const t = { rows: Array.from({ length: 13 }, (_, m) => ({ m, k: [m >= 7 ? 1n : -1n, m >= 6 ? 2n : -1n] })) };
    const r = (count, m) => ({ count: BigInt(count), total: 1n << BigInt(m), m });
    const h = (a, b) => calibratedHolm([a, b], t).map((x) => [x.rejected, x.step]);
    assert.deepStrictEqual(h(r(1, 7), r(1, 7)), [[true, 1], [true, 1]]);
    assert.deepStrictEqual(h(r(1, 7), r(2, 6)), [[true, 1], [true, 2]]); // la segona, al segon pas
    assert.deepStrictEqual(h(r(2, 7), r(1, 8)), [[true, 2], [true, 1]]);
    assert.deepStrictEqual(h(r(3, 7), r(1, 8)), [[false, 2], [true, 1]]);
    assert.deepStrictEqual(h(r(2, 7), r(2, 8)), [[false, 1], [false, 1]]); // cap al primer pas: cap
    assert.deepStrictEqual(h(r(1, 6), r(1, 6)), [[false, 1], [false, 1]]); // amb 6 mons, el primer pas no admet res
    const x = calibratedHolm([r(1, 7), r(1, 6)], t);
    assert.deepStrictEqual([x[0].K, x[1].K, x[0].threshold, x[1].threshold], [1n, 2n, 1 / 128, 2 / 64]);
    assert.strictEqual(calibratedHolm([r(1, 6), r(1, 6)], t)[0].threshold, 0);
    assert.throws(() => calibratedHolm([r(1, 13), r(1, 7)], t), /no arriba/);
    assert.throws(() => calibratedHolm([r(1, 7)], t), /dues proves/);
  },
  'la taula dels llindars: la del programa, amb els seus límits, i cada mutació és un problema (AUD-128, AU2-94)': () => {
    const t = JSON.parse(readFileSync(join(root, THRESHOLDS), 'utf8'));
    assert.deepStrictEqual(thresholdProblems(t, 0.025), []);
    assert.strictEqual(t.rows.length, 151);
    assert.deepStrictEqual(t.steps, STEPS);
    // les primeres files, tornades a calcular amb eines/llindars-maduracio.mjs
    for (let m = 0; m <= 16; m++) assert.deepStrictEqual(t.rows[m].k, STEPS.map(([num, den]) => String(calibrate(m, num, den).K)), `m = ${m}`);
    // amb 10 mons o menys amb diferència, el primer pas no admet cap rebuig, i el segon, amb 9 o menys
    assert.ok(t.rows.slice(0, 11).every((r) => r.k[0] === '-1') && t.rows[11].k[0] !== '-1', 'el primer pas');
    assert.ok(t.rows.slice(0, 10).every((r) => r.k[1] === '-1') && t.rows[10].k[1] !== '-1', 'el segon pas');
    // cap llindar no passa del nominal, i el màxim de cada fila no passa d'α
    for (const r of t.rows) STEPS.forEach(([num, den], j) => { assert.ok(BigInt(r.k[j]) * BigInt(den) <= BigInt(num) << BigInt(r.m)); assert.ok(r.max[j] <= num / den, `m = ${r.m}`); });
    const mut = (fn) => { const c = JSON.parse(JSON.stringify(t)); fn(c); return thresholdProblems(c, 0.025); };
    assert.ok(mut((c) => { c.rows[50].k = [c.rows[50].k[1], c.rows[50].k[0]]; }).some((x) => /més alt que el del segon/.test(x)));
    assert.ok(mut((c) => { c.rows[50].k = [String(1n << 50n), String(1n << 50n)]; }).some((x) => /nominal/.test(x)));
    assert.ok(mut((c) => { c.rows.splice(3, 1); }).some((x) => /fila 3/.test(x)));
    assert.ok(mut((c) => { c.rows[3].k[0] = '1.5'; }).some((x) => /fila 3/.test(x)));
    assert.ok(mut((c) => { c.steps = [[1, 40], [1, 20]]; }).some((x) => /passos/.test(x)));
    assert.ok(thresholdProblems(t, 0.05).some((x) => /passos/.test(x)));
    // els recomptes per recurrència (els de la potència) són els de tailCounts (els de la calibració)
    const [c] = ruleCriticals([nominalK(1, 80)], 40);
    for (const m of [12, 25, 40]) assert.deepStrictEqual(c[m], criticals(tailCounts(m), nominalK(1, 80)(m)), `m = ${m}`);
  },
  "el certificat de la taula: les cotes, contra la cerca de la taula i una graella, i una taula adulterada no hi passa (AU2-99)": () => withTmp((tmp) => {
    const cert = JSON.parse(readFileSync(join(root, CERTIFICATE), 'utf8')), t = JSON.parse(readFileSync(join(root, THRESHOLDS), 'utf8'));
    // el certificat és el de la taula certificada, i totes les cotes són com a molt α
    assert.strictEqual(sha256Of(join(root, THRESHOLDS)), THRESHOLDS_SHA256);
    assert.strictEqual(cert.tableSha256, THRESHOLDS_SHA256);
    assert.deepStrictEqual(certificateProblems(cert, { table: t, tableSha256: THRESHOLDS_SHA256 }), []);
    // les primeres files, tornades a calcular; i un número canviat del fitxer, que la preparació no deixa passar (auditor 1,
    // auditoria 22)
    assert.deepStrictEqual(certificateRows(t, 20), cert.rows.slice(0, 21));
    assert.deepStrictEqual(recomputedProblems(cert, t, 20), []);
    const touched = JSON.parse(JSON.stringify(cert));
    touched.rows[13].upper[0] *= 0.999;
    assert.deepStrictEqual(certificateProblems(touched, { table: t, tableSha256: THRESHOLDS_SHA256 }), []);
    assert.deepStrictEqual(recomputedProblems(touched, t, 20), ['les files de m = 13 no són les que surten del càlcul']);
    // dos mètodes independents: el màxim de la cerca de la taula no passa mai de la cota, i hi és a prop
    for (const r of cert.rows) STEPS.forEach((_, j) => {
      assert.ok(t.rows[r.m].max[j] <= r.upper[j] * (1 + SAFE), `m = ${r.m}, pas ${j + 1}: el màxim de la taula passa de la cota`);
      assert.ok(r.upper[j] - t.rows[r.m].max[j] <= 1e-6 * r.upper[j], `m = ${r.m}, pas ${j + 1}: la cota és lluny del màxim de la taula`);
      assert.ok(r.lower[j] <= r.upper[j] && (r.next[j] === null || r.next[j].lower > r.upper[j]), `m = ${r.m}, pas ${j + 1}`);
    });
    // cap punt d'una graella de les distribucions amb mitjana 0 no passa de la cota
    for (const m of [11, 12, 13]) STEPS.forEach((_, j) => {
      const crits = criticals(tailCounts(m), BigInt(t.rows[m].k[j]));
      let g = 0;
      for (let a = 0; a <= 200; a++) for (let b = 0; b <= 200; b++) { const sh = shape(m, a / 200, b / 200); if (sh) g = Math.max(g, conditionalSize(sh, m, crits)); }
      assert.ok(g > 0 && g <= cert.rows[m].upper[j] * (1 + SAFE), `m = ${m}, pas ${j + 1}: la graella ${g}, la cota ${cert.rows[m].upper[j]}`);
    });
    // la taula adulterada de l'auditor 2, amb el K₂(108) nominal: té l'estructura esperada, però no és la certificada, i la
    // certificació hi troba una distribució amb mitjana 0 que rebutja més que α
    const bad = JSON.parse(JSON.stringify(t));
    bad.rows[108].k[1] = String(nominalK(1, 40)(108));
    assert.deepStrictEqual(thresholdProblems(bad, 0.025), []);
    const file = join(tmp, 'llindars.json');
    writeFileSync(file, JSON.stringify(bad, null, 1) + '\n');
    assert.ok(readThresholds(file, 0.025).problems.some((x) => /no és la certificada/.test(x)));
    const s = certify(108, criticals(tailCounts(108), BigInt(bad.rows[108].k[1])), { levels: [0.025], gap: Infinity });
    assert.ok(s.lower * (1 - SAFE) > 0.025, `la cota inferior ${s.lower}`);
    assert.ok(certificateProblems({ ...cert, tableSha256: sha256Of(file) }, { table: bad, tableSha256: sha256Of(file) }).some((x) => /m = 108, pas 2: el K/.test(x)));
    assert.ok(certificateProblems(cert, { table: t, tableSha256: sha256Of(file) }).some((x) => /d'una altra taula/.test(x)));
  }),
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
    const { results, lines } = analyse(branches, m, table());
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
    assert.ok(/Amb 4 mons amb diferència, cap resultat no arriba al llindar calibrat del pas 1: la prova no es podia rebutjar/.test(dec[0]), dec[0]);
    assert.ok(/llindar calibrat de Holm, pas 1, amb 4 mons amb diferència: cap rebuig possible/.test(text), text);
    assert.throws(() => analyse(branches, m), /taula dels llindars/);
    // un registre de menys: un problema, i no s'analitza res
    rmSync(join(dir, `${m.branches[0].id}.jsonl`));
    assert.ok(readSeries(dir, m, { commit: COMMIT }).problems.some((x) => /no hi ha el registre/.test(x)));
  }),
  'les decisions, quan es rebutja: el que diu la frase, i l\'abast': () => withTmp((tmp) => {
    // 12 mons: continue i shuffle-all s'estableixen a totes dues llavors, i reinit a cap; p = 2^-12 a totes dues proves
    const counts = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`W${i + 1}`, [2, 2, 0]]));
    const m = smallManifest({ n: 12 }), dir = join(tmp, 'branques');
    writeSeries(dir, m, fateOf(counts));
    const { branches, problems } = readSeries(dir, m, { commit: COMMIT });
    assert.deepStrictEqual(problems, []);
    const result = analyse(branches, m, table());
    assert.ok(result.results.every((r) => r.rejected && r.count === 1n && r.total === 4096n && r.step === 1));
    const [b, c] = decisionLines(result);
    assert.ok(/es rebutja H0/.test(b) && /si es conserva la sopa envellida que amb una sopa nova/.test(b) && /efecte total/.test(b), b);
    assert.ok(/es rebutja H0/.test(c) && /l'histograma de bytes/.test(c) && /no aïlla la composició/.test(c), c);
    // la segona prova amb sis mons a favor (AUD-129, AU2-95): amb els llindars nominals es rebutjaria, i amb els calibrats
    // no es pot rebutjar, i la frase ho diu
    const second = { ...signFlipTest([1, 1, 1, 1, 1, 1]), a: 'shuffle-all', b: 'reinit', ka: 6, kb: 0, branches: 24 };
    const pair = [{ ...result.results[0] }, second];
    assert.deepStrictEqual(holm(pair, 0.025).map((x) => x.rejected), [true, true]);
    calibratedHolm(pair, table()).forEach((x, i) => Object.assign(pair[i], x));
    assert.deepStrictEqual(pair.map((x) => [x.rejected, x.step]), [[true, 1], [false, 2]]);
    assert.ok(/Amb 6 mons amb diferència, cap resultat no arriba al llindar calibrat del pas 2: la prova no es podia rebutjar/.test(decisionLines({ results: pair })[1]));
  }),
  "la línia d'ordres: --prova calcula sense decidir, no llegeix la carpeta de la sèrie, i --decideix necessita el preregistre": () => withTmp((tmp) => {
    const run = (...a) => spawnSync(process.execPath, [join(root, 'fase2', 'maduracio-confirmacio.mjs'), ...a], { cwd: root, encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '' } });
    const m = smallManifest({ dir: SYNTH_DIR }), dir = join(tmp, 'branques'), manifest = join(tmp, 'manifest.json');
    writeFileSync(manifest, JSON.stringify(m));
    writeSeries(dir, m, fateOf(COUNTS));
    let r = run('--prova', COMMIT, '--serie', manifest, dir);
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    assert.ok(/MODE DE PROVA, sense cap decisió/.test(r.stdout) && /Prova 1, continue contra reinit/.test(r.stdout) && !/DECISIÓ/.test(r.stdout), r.stdout);
    assert.strictEqual(run('--prova', 'abcdef0', '--serie', manifest, dir).status, 2, 'un commit que no és sencer');
    assert.strictEqual(run('--prova', COMMIT, '--serie', manifest, m.dir).status, 2, 'la carpeta del manifest');
    assert.strictEqual(run('--prova', COMMIT, '--serie', manifest, SERIES_DIR).status, 2, 'la carpeta de la sèrie de veritat');
    assert.strictEqual(run('--prova', COMMIT, '--decideix', dir).status, 2);
    assert.strictEqual(run(dir).status, 2);
    r = run('--decideix', dir);
    assert.strictEqual(r.status, 1);
    assert.ok(/No es pot prendre la decisió confirmatòria/.test(r.stdout), r.stdout);
    r = run('--prova', '0'.repeat(40), '--serie', manifest, dir);
    assert.strictEqual(r.status, 1, 'un altre commit: els registres no són del preregistre');
    assert.ok(/no el del preregistre/.test(r.stdout));
    // un àlies de la carpeta de la sèrie (una unió a Windows, un enllaç simbòlic a la resta), tampoc (AU2-96)
    const real = join(tmp, 'serie-real'), alias = join(tmp, 'alies');
    mkdirSync(join(real, 'sub'), { recursive: true });
    symlinkSync(real, alias, process.platform === 'win32' ? 'junction' : 'dir');
    writeFileSync(manifest, JSON.stringify({ ...m, dir: real }));
    for (const f of [alias, join(alias, 'sub')]) {
      r = run('--prova', COMMIT, '--serie', manifest, f);
      assert.strictEqual(r.status, 2, `l'àlies ${f}: ${r.stdout}`);
      assert.ok(/--prova no llegeix la carpeta de la sèrie/.test(r.stdout), r.stdout);
    }
    // una taula dels llindars que no és la del projecte: la prova del manifest no té l'estructura esperada
    writeFileSync(manifest, JSON.stringify({ ...m, test: { ...m.test, thresholds: 'package.json' } }));
    r = run('--prova', COMMIT, '--serie', manifest, dir);
    assert.strictEqual(r.status, 1, r.stdout);
    assert.ok(/no té l'estructura esperada/.test(r.stdout), r.stdout);
  }),
  "--prova no llegeix cap registre de la sèrie: ni per enllaços als fitxers, ni amb un manifest que digui un altre dir, ni si la sèrie ja en té (AU2-98)": () => withTmp((tmp) => {
    // 1. al repositori, amb una carpeta protegida: la del manifest, amb registres sintètics
    const real = join(tmp, 'protegida'), m = smallManifest({ dir: real }), manifest = join(tmp, 'manifest.json');
    writeFileSync(manifest, JSON.stringify(m));
    writeSeries(real, m, fateOf(COUNTS));
    refused(runIn(root, '--prova', COMMIT, '--serie', manifest, real), 'la carpeta', /no llegeix la carpeta de la sèrie/);
    // enllaços durs a cada registre: a Windows no demanen permisos, i el camí real d'un enllaç dur és el seu
    const hard = join(tmp, 'durs');
    mkdirSync(hard);
    for (const f of readdirSync(real)) linkSync(join(real, f), join(hard, f));
    refused(runIn(root, '--prova', COMMIT, '--serie', manifest, hard), 'els enllaços durs', /és el mateix fitxer que un registre de la sèrie/);
    // enllaços simbòlics a cada registre (la prova de l'auditor 2). A Windows, sense permisos, no se'n poden fer: el cas ho diu i
    // se salta (a GitHub, amb Linux, s'executa)
    const soft = join(tmp, 'simbolics');
    mkdirSync(soft);
    let made = true;
    try { for (const f of readdirSync(real)) symlinkSync(join(real, f), join(soft, f), 'file'); }
    catch (e) { if (e.code !== 'EPERM') throw e; made = false; console.log(`        (els enllaços simbòlics de fitxer, omesos: no se'n poden crear en aquest sistema, ${e.code})`); }
    if (made) refused(runIn(root, '--prova', COMMIT, '--serie', manifest, soft), 'els enllaços simbòlics', /és un enllaç a un registre de la sèrie/);
    // 2. en una còpia del programa, amb registres a la carpeta de la sèrie de veritat
    const repo = programCopy(tmp), truth = join(repo, 'fase2', 'resultats', 'maduracio', 'serie', 'branques');
    const m2 = smallManifest(), mf2 = join(tmp, 'manifest2.json'), other = join(tmp, 'altre-dir.json');
    writeFileSync(mf2, JSON.stringify(m2));
    writeSeries(truth, m2, fateOf(COUNTS));
    // un manifest copiat que diu un altre dir: la carpeta de veritat continua protegida
    writeFileSync(other, JSON.stringify({ ...m2, dir: join(tmp, 'una-altra') }));
    refused(runIn(repo, '--prova', COMMIT, '--serie', other, truth), 'un manifest amb un altre dir', /no llegeix la carpeta de la sèrie \(fase2\/resultats\/maduracio\/serie\/branques\)/);
    // si la sèrie de veritat ja té registres, --prova no s'executa en aquella còpia, encara que la carpeta sigui una altra
    const ms = smallManifest({ dir: SYNTH_DIR }), mfs = join(tmp, 'sintetic.json'), synth = join(tmp, 'sintetiques');
    writeFileSync(mfs, JSON.stringify(ms));
    writeSeries(synth, ms, fateOf(COUNTS));
    refused(runIn(repo, '--prova', COMMIT, '--serie', mfs, synth), 'la sèrie amb registres', /ja té registres de la sèrie/);
    // sense registres a la sèrie de veritat, la mateixa còpia sí que fa la prova amb les dades sintètiques
    rmSync(truth, { recursive: true, force: true });
    const r = runIn(repo, '--prova', COMMIT, '--serie', mfs, synth);
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /MODE DE PROVA/);
  }),
  // AUD-132 (auditoria 22): la sèrie de veritat en una altra còpia del repositori, la de l'etiqueta, on les branques es llancen.
  // Des d'una altra còpia, cap de les barreres del camí i de la identitat no la veu: l'atura el contingut, la primera línia
  "--prova no llegeix cap registre de la sèrie d'una altra còpia del repositori, ni una còpia dels registres (AUD-132)": () => withTmp((tmp) => {
    // la còpia de l'etiqueta (a), amb el manifest i els registres de la sèrie a les seves carpetes, i una altra (b), sense
    const a = programCopy(join(tmp, 'a')), b = programCopy(join(tmp, 'b'));
    const m = smallManifest(), series = join(a, 'fase2', 'resultats', 'maduracio', 'serie'), truth = join(series, 'branques');
    mkdirSync(series, { recursive: true });
    writeFileSync(join(series, 'manifest.json'), JSON.stringify(m));
    writeSeries(truth, m, fateOf(COUNTS));
    const why = /és un registre de la sèrie de veritat: la seva ordre l'escriu a fase2\/resultats\/maduracio\/serie\/branques/;
    // la carpeta de la còpia a, pel seu camí: amb el manifest de la còpia a, i amb el de la còpia b, que és el mateix
    refused(runIn(b, '--prova', COMMIT, '--serie', join(series, 'manifest.json'), truth), "la carpeta d'una altra còpia, amb el seu manifest", why);
    mkdirSync(join(b, 'fase2', 'resultats', 'maduracio', 'serie'), { recursive: true });
    writeFileSync(join(b, SERIES_DIR, '..', 'manifest.json'), JSON.stringify(m));
    refused(runIn(b, '--prova', COMMIT, truth), "la carpeta d'una altra còpia, amb el manifest per defecte", why);
    // una unió (un enllaç simbòlic a la resta) de la carpeta de la sèrie de la còpia a, enllaços durs als seus registres, i una
    // còpia dels fitxers, en una carpeta qualsevol
    const alias = join(tmp, 'unio'), hard = join(tmp, 'durs'), copied = join(tmp, 'copia');
    symlinkSync(series, alias, process.platform === 'win32' ? 'junction' : 'dir');
    mkdirSync(hard); mkdirSync(copied);
    for (const f of readdirSync(truth)) { linkSync(join(truth, f), join(hard, f)); copyFileSync(join(truth, f), join(copied, f)); }
    refused(runIn(b, '--prova', COMMIT, join(alias, 'branques')), "una unió de la carpeta d'una altra còpia", why);
    refused(runIn(b, '--prova', COMMIT, hard), "enllaços durs als registres d'una altra còpia", why);
    refused(runIn(b, '--prova', COMMIT, copied), 'una còpia dels registres', why);
    // un registre sol n'hi ha prou: la resta, sintètics
    const ms = smallManifest({ dir: SYNTH_DIR }), mfs = join(tmp, 'sintetic.json'), mixed = join(tmp, 'barrejats');
    writeFileSync(mfs, JSON.stringify(ms));
    writeSeries(mixed, ms, fateOf(COUNTS));
    copyFileSync(join(truth, 'W3-reinit-b.jsonl'), join(mixed, 'W3-reinit-b.jsonl'));
    refused(runIn(b, '--prova', COMMIT, '--serie', mfs, mixed), 'un sol registre de la sèrie entre els sintètics', /W3-reinit-b\.jsonl és un registre de la sèrie de veritat/);
    // les dades sintètiques, que escriuen a una altra carpeta, sí que es llegeixen, des de qualsevol de les dues còpies
    writeSeries(mixed, ms, fateOf(COUNTS));
    for (const copy of [b, a]) {
      if (copy === a) rmSync(truth, { recursive: true, force: true });
      const r = runIn(copy, '--prova', COMMIT, '--serie', mfs, mixed);
      assert.strictEqual(r.status, 0, r.stdout + r.stderr);
      assert.match(r.stdout, /MODE DE PROVA/);
    }
  }),
  // AU2-100 i AUD-133 (auditoria 23): de cada registre, la barrera del contingut en llegeix només la primera línia no buida, byte a
  // byte i ni un byte més, i la llegeix com el lector, que salta les línies buides del començament i en llegeix el JSON. Les
  // lectures, comptades, en còpies dels registres de la sèrie fora de qualsevol còpia del repositori
  "--prova llegeix de cada registre només la primera línia no buida, com el lector, i ni un byte més (AU2-100, AUD-133)": () => withTmp((tmp) => {
    const a = programCopy(join(tmp, 'a')), b = programCopy(join(tmp, 'b'));
    const m = smallManifest(), truth = join(a, SERIES_DIR);
    writeSeries(truth, m, fateOf(COUNTS));
    mkdirSync(join(b, SERIES_DIR, '..'), { recursive: true });
    writeFileSync(join(b, SERIES_DIR, '..', 'manifest.json'), JSON.stringify(m));
    const counter = join(tmp, 'comptador.cjs'), log = join(tmp, 'lectures.json');
    writeFileSync(counter, COUNTER);
    // --prova des de la còpia b, amb el comptador
    const counted = (...args) => {
      rmSync(log, { force: true });
      const r = spawnSync(process.execPath, ['--require', counter, join(b, 'fase2', 'maduracio-confirmacio.mjs'), '--prova', COMMIT, ...args], { cwd: b, encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '', LECTURES: log } });
      return { ...r, reads: JSON.parse(readFileSync(log, 'utf8')) };
    };
    // que no hagi llegit cap registre sencer, i que de cada registre que ha obert n'hagi llegit fins al salt de línia de la
    // primera línia no buida, ni un byte més
    const onlyHeads = (r, dir, what) => {
      const opened = Object.keys(r.reads);
      assert.ok(opened.length > 0, `${what}: no ha obert cap registre`);
      for (const p of opened) {
        assert.strictEqual(r.reads[p].whole, false, `${what}: ${basename(p)}, llegit sencer`);
        assert.strictEqual(r.reads[p].bytes, headBytes(readFileSync(join(dir, basename(p)))), `${what}: ${basename(p)}, els bytes llegits`);
      }
    };
    const why = /és un registre de la sèrie de veritat: la seva ordre l'escriu a fase2\/resultats\/maduracio\/serie\/branques/;
    const files = readdirSync(truth);
    const variant = (name, change) => { const d = join(tmp, name); mkdirSync(d); for (const f of files) writeFileSync(join(d, f), change(readFileSync(join(truth, f), 'utf8'))); return d; };
    // els registres de la sèrie, copiats, i canviats sense cap diferència per al lector
    const cases = [
      ['una còpia dels registres', (t) => t],
      ['amb CRLF', (t) => t.replace(/\n/g, '\r\n')],
      ['amb la marca BOM', (t) => '﻿' + t],
      ['amb una línia en blanc al davant', (t) => '\n' + t],
      ["amb una línia d'espais al davant", (t) => ' \t \r\n' + t],
      ['amb la primera línia escrita amb \\/ (el mateix JSON)', (t) => { const [h, ...rest] = t.split('\n'); return [h.replace(/\//g, '\\/'), ...rest].join('\n'); }],
    ];
    cases.forEach(([what, change], i) => {
      const dir = variant(`variant${i}`, change), r = counted(dir);
      refused(r, what, why);
      onlyHeads(r, dir, what);
    });
    // un sol registre de la sèrie entre els sintètics: dels d'abans, la barrera també n'ha llegit només la primera línia
    const ms = smallManifest({ dir: SYNTH_DIR }), mfs = join(tmp, 'sintetic.json'), mixed = join(tmp, 'barrejats');
    writeFileSync(mfs, JSON.stringify(ms));
    writeSeries(mixed, ms, fateOf(COUNTS));
    copyFileSync(join(truth, 'W3-reinit-b.jsonl'), join(mixed, 'W3-reinit-b.jsonl'));
    let r = counted('--serie', mfs, mixed);
    refused(r, 'un registre de la sèrie entre els sintètics', /W3-reinit-b\.jsonl és un registre de la sèrie de veritat/);
    onlyHeads(r, mixed, 'un registre de la sèrie entre els sintètics');
    assert.strictEqual(Object.keys(r.reads).length, 18, 'els 17 sintètics d\'abans i el de la sèrie');
    // 64 KiB de línies buides al davant: la barrera no hi troba cap línia sencera, es nega, i no en llegeix res més
    const deep = variant('fons', (t) => '\n'.repeat(70000) + t);
    r = counted(deep);
    refused(r, '70.000 línies buides al davant', /W1-continue-a\.jsonl no comença amb la línia d'inici d'un registre/);
    assert.deepStrictEqual(Object.values(r.reads), [{ bytes: 1 << 16, whole: false }]);
    // un registre sintètic sense la línia d'inici: tampoc no se sap què és
    const noStart = join(tmp, 'sense-inici');
    writeSeries(noStart, ms, fateOf(COUNTS));
    const first = join(noStart, 'W1-continue-a.jsonl');
    writeFileSync(first, readFileSync(first, 'utf8').split('\n').slice(1).join('\n'));
    refused(counted('--serie', mfs, noStart), "un registre sense la línia d'inici", /W1-continue-a\.jsonl no comença amb la línia d'inici d'un registre/);
    // les dades sintètiques, amb una línia en blanc al davant, es llegeixen igual que sense
    const synth = join(tmp, 'sintetiques'), blank = join(tmp, 'sintetiques-blanc');
    writeSeries(synth, ms, fateOf(COUNTS));
    mkdirSync(blank);
    for (const f of readdirSync(synth)) writeFileSync(join(blank, f), '\n' + readFileSync(join(synth, f), 'utf8'));
    const plain = runIn(b, '--prova', COMMIT, '--serie', mfs, synth);
    r = counted('--serie', mfs, blank);
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /Prova 1, continue contra reinit/);
    assert.strictEqual(r.stdout, plain.stdout);
  }),
  "--decideix: sense l'etiqueta es nega; amb l'etiqueta decideix; i amb el codi canviat es nega sense executar-lo": () => withTmp((tmp) => {
    const repo = programCopy(tmp);
    const counts = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`W${i + 1}`, i < 11 ? [2, 1, 0] : [0, 0, 1]]));
    const m = smallManifest({ n: 12 });
    writeFileSync(join(repo, 'serie.json'), JSON.stringify(m, null, 1) + '\n');
    const GIT = ['-c', 'user.name=prova', '-c', 'user.email=prova@exemple.invalid', '-c', 'core.autocrlf=false'];
    const git = (...a) => { const r = spawnSync('git', [...GIT, ...a], { cwd: repo, encoding: 'utf8' }); if (r.status) throw new Error(r.stderr); return r.stdout.trim(); };
    git('init', '-q'); git('add', '-A'); git('commit', '-q', '-m', 'preregistre de prova');
    const decide = () => spawnSync(process.execPath, ['fase2/maduracio-confirmacio.mjs', '--decideix', '--serie', 'serie.json', join(tmp, 'dades')], { cwd: repo, encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '' } });
    let r = decide();
    assert.strictEqual(r.status, 1);
    assert.match(r.stdout, /no hi ha l'etiqueta de git preregistre-maduracio/);
    const sha = (f) => createHash('sha256').update(readFileSync(join(repo, f))).digest('hex');
    const files = ['serie.json', 'docs/protocol-maduracio.md', 'fase2/maduracio-confirmacio.mjs', 'fase2/maduracio-serie.mjs', 'fase2/b2-serie.mjs', 'fase2/census.js', 'fase1/soup.js', 'fase2/preregistre.mjs', THRESHOLDS, CERTIFICATE, 'eines/llindars-maduracio.mjs', 'eines/transforma.mjs', 'eines/pilot.mjs'];
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
