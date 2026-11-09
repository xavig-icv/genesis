// Proves de la prova d'autonomia i de les variants per cap de B1 (docs/pla-b1.md, §4, §14 i §15). Cap no mira cap resultat del
// càlcul: les llavors són de prova (777), i els programes, els de les proves o els de l'extracte, sense mirar-ne les xifres.
//   - les dues opcions noves de fase2/replication.js: sense, la prova i l'atzar que gasta són els de sempre; amb bothRoles, tot és
//     igual llevat de l'herència en context; soloPartner fa el company del paper sol;
//   - el mapa de llavors: cap solapament, ni cap parella de llavors a 1, 2 o 3 vegades la constant de splitmix32;
//   - l'estadística: Clopper-Pearson amb la beta, igual que el del nivell 1; Fay i Feuer amb un estrat, l'interval de Garwood;
//   - l'eina de l'autonomia: els companys inerts, les condicions, els controls (positius i negatius), la línia d'ordres, el JSONL;
//   - l'anàlisi de l'autonomia: les quatre xifres, la validació i cada manera com s'hi ha de negar;
//   - l'anàlisi de les variants per cap: la comparació amb el nivell 1, que s'hi nega si C0 o S1 no hi coincideixen;
//   - les feines en fils (runJobs): sense cap feina, i amb un fil que s'atura abans d'hora (AUD-179).
// Executa: node test/b1-autonomia.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { evaluator, CHEMISTRIES, PROGRAM_SIZE, OPCODES } from '../fase1/bff.js';
import { makeRng } from '../fase1/soup.js';
import { replicationTest } from '../fase2/replication.js';
import { soupFor } from '../eines/densitat.mjs';
import { clopperPearson } from '../eines/densitat-analisi.mjs';
import { GOLDEN, LEVEL1, AUTONOMY, seedMap, checkSeedMap, strataBlocks } from '../eines/b1-llavors.mjs';
import { clopperPearsonBeta, fayFeuer, gammaP, betaI } from '../eines/b1-estadistica.mjs';
import { readExtract, extractRecord, fileHashes, sha256, runJobs, EXTRACT_SHA256 } from '../eines/b1-comu.mjs';
import { INERT, inertProgram, conditions, checkInert, testReplicator, MODULES, MODULES_STRATA, PARTNERS } from '../eines/autonomia.mjs';
import { readFolder, analyse, countsOf, FIGURES, PLAN } from '../eines/autonomia-analisi.mjs';
import { readHeads, analyse as analyseHeads } from '../eines/caps-analisi.mjs';
import { readFolder as readStrataFolder, planRuns } from '../eines/estrats-analisi.mjs';
import { readStrataAutonomy, checkAgainstLevel1, analyse as analyseStrataAutonomy } from '../eines/estrats-autonomia-analisi.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const SEED = 777;
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'autonomia-')); try { fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }
async function withTmpAsync(fn) { const tmp = mkdtempSync(join(tmpdir(), 'autonomia-')); try { await fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }
// Una promesa que ha d'acabar: si no acaba, la prova falla i ho diu, en lloc de deixar el procés sense res pendent (AUD-179)
async function within(ms, p, what) {
  let t;
  try { return await Promise.race([p, new Promise((_, reject) => { t = setTimeout(() => reject(new Error(`${what}: no acaba`)), ms); })]); }
  finally { clearTimeout(t); }
}
const run = (tool, ...a) => spawnSync(process.execPath, [join(root, 'eines', tool), ...a], { cwd: root, encoding: 'utf8' });
const lines = (f) => readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
// Les proves també corren en una còpia amb canvis: el codi de la línia d'inici, sense "+canvis" (no és a l'empremta)
const clean = (f) => writeFileSync(f, readFileSync(f, 'utf8').replace(/^(\{"type":"start","code":"[0-9a-f]+)\+canvis"/, '$1"'));
const INSTR =new Set([...OPCODES].map((c) => c.charCodeAt(0)));
const REPLICATORS = {
  fase1: [140,221,0,221,20,164,126,32,105,126,78,173,241,242,207,220,199,45,213,101,52,91,155,79,44,60,2,125,93,71,65,217,65,5,71,141,93,141,15,5,65,217,15,71,93,125,2,60,44,79,155,91,52,101,213,45,0,0,62,82,0,77,77,0],
  espaiat: [94,94,251,91,78,198,39,237,82,55,89,53,123,232,163,46,62,181,38,253,255,31,255,23,119,154,94,34,181,93,93,79,34,94,154,40,160,18,170,255,119,107,181,62,46,163,232,123,15,89,55,143,237,117,198,78,91,251,222,94,250,168,50,50],
  immune: [239,241,90,60,255,192,45,111,101,255,2,241,255,255,241,52,91,255,106,91,155,79,44,60,2,125,93,71,71,217,45,5,71,141,93,141,71,5,45,217,71,71,93,125,2,60,44,79,155,91,106,255,91,52,241,2,255,101,111,45,192,52,255,60],
};
// El programa de l'auditor 1 de l'AUD-140 (test/quimiques.mjs): necessita el codi del company
const DATA = Array.from({ length: 255 }, (_, i) => i + 1).filter((b) => !INSTR.has(b));
const AUD140 = Uint8Array.from([...DATA.slice(0, 20), ...[...'{>[>{'].map((c) => c.charCodeAt(0)), ...DATA.slice(20, 59)]);
const ones = (s) => [...s].filter((c) => c === '1').length;
const KEYS4 = ['solo', 'context', 'heritableSolo', 'heritableContext'];
// Un control positiu del context, fet a mà (AUD-177): un palíndrom, `{,[>{,]`, 25 bytes de dades diferents i el seu mirall. Quan va
// segon, `{` porta h1 a 127, i el bucle copia de h1, que baixa, a h0, que puja: la primera meitat acaba portant el programa al revés,
// que és ell mateix. Cap byte no és 0, i el bucle no s'atura fins al final del pressupost de passos
const CONTEXT_CONTROL = (() => {
  const half = [...[...'{,[>{,]'].map((c) => c.charCodeAt(0)), ...DATA.slice(0, 25)];
  return Uint8Array.from([...half, ...half.slice().reverse()]);
})();

// Uns programes per comparar la prova amb i sense les opcions: els tres replicadors i 120 de D½
function programs() {
  const out = Object.values(REPLICATORS).map((a) => Uint8Array.from(a));
  for (let i = 0; i < 120; i++) out.push(soupFor(i, SEED, 'd-mig').subarray(0, PROGRAM_SIZE).slice());
  return out;
}
const soupWith = (A, i) => { const s = soupFor(i, SEED, 'uniforme'); s.set(A, 0); return s; };

const tests = {
  "sense les opcions noves, la prova i l'atzar que gasta són els de sempre"() {
    programs().forEach((A, i) => {
      const soup = soupWith(A, i);
      for (const name of ['C0', 'S1', 'H64']) {
        const r1 = makeRng(5000 + i, 'v2'), r2 = makeRng(5000 + i, 'v2');
        const a = replicationTest(soup, 0, r1, { heredity: true, evaluate: evaluator(name) });
        const b = replicationTest(soup, 0, r2, { heredity: true, evaluate: evaluator(name), soloPartner: null, bothRoles: false });
        assert.deepStrictEqual(a, b, `${name}, programa ${i}`);
        assert.strictEqual(r1(), r2(), `${name}, programa ${i}: l'atzar gastat`);
      }
    });
  },
  "amb bothRoles, tot és igual llevat de l'herència en context, que es prova encara que l'herència sola ja hi sigui"() {
    let both = 0;
    programs().forEach((A, i) => {
      const soup = soupWith(A, i);
      for (const name of ['C0', 'S1', 'S3', 'H64']) {
        const a = replicationTest(soup, 0, makeRng(6000 + i, 'v2'), { heredity: true, complete: true, evaluate: evaluator(name) });
        const b = replicationTest(soup, 0, makeRng(6000 + i, 'v2'), { heredity: true, complete: true, evaluate: evaluator(name), bothRoles: true });
        for (const k of ['solo', 'context', 'heritableSolo', 'heritable']) assert.strictEqual(a[k], b[k], `${name}, programa ${i}, ${k}`);
        assert.strictEqual(a.heritableContext, b.heritableContext && !b.heritableSolo, `${name}, programa ${i}`);
        if (b.heritableSolo && b.heritableContext) both++;
      }
    });
    assert.ok(both > 0, 'cap programa no és hereditari sol i en context alhora: la prova no diu res');
  },
  'soloPartner fa el company del paper sol, amb l\'atzar de la prova, i ha de tornar 64 bytes'() {
    const A = Uint8Array.from(REPLICATORS.fase1), soup = soupWith(A, 0);
    const seen = [];
    const partner = (rng) => { const p = inertProgram(rng); seen.push(p); return p; };
    const r = replicationTest(soup, 0, makeRng(1, 'v2'), { heredity: true, complete: true, soloPartner: partner });
    assert.ok(seen.length >= 1 && seen.every((p) => p.every((b) => !INSTR.has(b))));
    assert.ok(r.heritableSolo, 'el replicador de la Fase 1 es copia sol en un company inert');
    assert.throws(() => replicationTest(soup, 0, makeRng(1, 'v2'), { soloPartner: () => new Uint8Array(10) }), /64 bytes/);
  },
  "el mapa de llavors: cap solapament, ni llavors a 1, 2 o 3 vegades la constant de splitmix32"() {
    assert.deepStrictEqual(checkSeedMap(seedMap()), []);
    assert.strictEqual(strataBlocks().length, 65);
    // un interval dolent: a GOLDEN, a 2·GOLDEN o a -3·GOLDEN del nivell 1, o solapat amb l'autonomia
    for (const d of [GOLDEN, 2 * GOLDEN, -3 * GOLDEN]) {
      const from = (((LEVEL1.from + d) % 2 ** 32) + 2 ** 32) % 2 ** 32;
      assert.ok(checkSeedMap([...seedMap(), { name: 'dolent', from, size: 10 }]).length > 0, String(d / GOLDEN));
    }
    assert.ok(checkSeedMap([...seedMap(), { name: 'dolent', from: AUTONOMY.from + 100, size: 10 }]).length > 0);
    // per què: amb el v2, la llavor s fa l'estat amb mix(s + GOLDEN), ..., mix(s + 4·GOLDEN), i s + GOLDEN en comparteix tres mots
    const mix = (a) => { let z = Math.imul(a ^ (a >>> 16), 0x85ebca6b) >>> 0; z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0; return (z ^ (z >>> 16)) >>> 0; };
    const first = (s) => { const b = mix((s + 2 * GOLDEN) >>> 0); return (Math.imul(((Math.imul(b, 5) << 7) | (Math.imul(b, 5) >>> 25)), 9) >>> 0) / 2 ** 32; };
    for (const s of [0, 1, 777, LEVEL1.from]) assert.strictEqual(makeRng(s, 'v2')(), first(s), `la llavor ${s}`);
  },
  "l'estadística: Clopper-Pearson amb la beta, com el del nivell 1, i Fay i Feuer amb un estrat, l'interval exacte de Garwood"() {
    for (const [k, n] of [[0, 1e7], [37, 1e7], [1625, 1e7], [5, 20], [20, 20], [0, 5], [3, 100]]) {
      const a = clopperPearson(k, n), b = clopperPearsonBeta(k, n);
      a.forEach((x, i) => assert.ok(Math.abs(x - b[i]) <= 1e-8 * Math.max(x, 1e-12), `${k} de ${n}: ${a} ${b}`));
    }
    const near = (x, y) => assert.ok(Math.abs(x - y) < 5e-4, `${x} ${y}`);
    for (const [x, lo, hi] of [[0, 0, 3.6889], [1, 0.0253, 5.5716], [10, 4.7954, 18.3904]]) {
      const { ci } = fayFeuer([2], [x]);
      near(ci[0] / 2, lo); near(ci[1] / 2, hi);
    }
    near(gammaP(3, 2), 1 - 5 * Math.exp(-2));
    near(betaI(2, 3, 0.4), 0.5248);
  },
  'els companys inerts: 64 bytes dels 246 valors que no són instruccions, el 0 inclòs; i inerts amb totes les químiques'() {
    assert.strictEqual(INERT.length, 246);
    assert.ok(INERT.includes(0) && INERT.every((b) => !INSTR.has(b)));
    const rng = makeRng(SEED, 'v2'), seen = new Set();
    for (let i = 0; i < 2000; i++) for (const b of inertProgram(rng)) seen.add(b);
    assert.strictEqual(seen.size, 246);
    const conds = conditions(SEED, 10);
    assert.deepStrictEqual(conditions(SEED, 10), conds, 'deterministes');
    assert.strictEqual(conds.length, 10);
    assert.ok(conds.every((c, j) => c.partners.length === PARTNERS && c.testSeed === SEED + 2 * j + 1));
    for (const name of Object.keys(CHEMISTRIES)) assert.deepStrictEqual(checkInert(conds, evaluator(name)), { pairs: 10 * 56, active: 0 }, name);
    // un company actiu sí que es veu
    const bad = conditions(SEED, 1);
    bad[0].partners[3][7] = '.'.charCodeAt(0);
    assert.ok(checkInert(bad, evaluator('C0')).active > 0);
  },
  'els controls: els tres replicadors de les proves es copien sols amb companys inerts; el programa de l\'AUD-140 i S4, no'() {
    const conds = conditions(SEED, 20);
    for (const [name, a] of Object.entries(REPLICATORS)) {
      const r = testReplicator(Uint8Array.from(a), conds, evaluator('C0'));
      assert.ok(ones(r.heritableSolo) >= 15, `${name}, C0: ${r.heritableSolo}`);
      assert.strictEqual(ones(testReplicator(Uint8Array.from(a), conds, evaluator('S4')).heritableSolo), 0, `${name}, S4`);
      for (let j = 0; j < 20; j++) assert.ok(r.heritableSolo[j] === '0' || r.solo[j] === '1');
    }
    for (const name of ['C0', 'S4']) {
      const r = testReplicator(AUD140, conds, evaluator(name));
      assert.strictEqual(ones(r.solo) + ones(r.context), 0, `AUD-140, ${name}`);
    }
  },
  "AUD-177: un control positiu del context, fet a mà, es copia quan va segon amb companys inerts; amb K2 (sense ','), no"() {
    assert.deepStrictEqual([...CONTEXT_CONTROL], [...CONTEXT_CONTROL].reverse(), 'és un palíndrom');
    const conds = conditions(SEED, 20), r = testReplicator(CONTEXT_CONTROL, conds, evaluator('C0'));
    assert.deepStrictEqual(KEYS4.map((k) => ones(r[k])), [0, 20, 0, 20], 'sol, cap; en context, totes, i hereditari');
    const k2 = testReplicator(CONTEXT_CONTROL, conds, evaluator('K2'));
    assert.strictEqual(ones(k2.solo) + ones(k2.context), 0, 'amb K2, la còpia no fa res');
  },
  "AUD-176: a l'anàlisi, els zeros per construcció (S2 en context, S3 sol i S4 en tots dos papers), comprovats i escrits"() {
    const z = '0'.repeat(100), one = '1' + '0'.repeat(99);
    const rep = (solo, context) => ({ index: 1, bytes: '00'.repeat(64), solo, context, heritableSolo: z, heritableContext: z, level1Solo: false });
    let out = analyse({ 'd-mig': { S4: { reps: [rep(z, z), rep(z, z)] }, S2: { reps: [rep(one, z)] } } }).join('\n');
    assert.match(out, /S4, d-mig \(un control: 0 per construcció en tots dos papers, AUD-176\)/);
    assert.match(out, /Els zeros per construcció \(AUD-176\): sol, cap de 2 no s'hi replica \(correcte\); en context, cap de 2 no s'hi replica \(correcte\)/);
    assert.match(out, /Els zeros per construcció \(AUD-176\): en context, cap de 1 no s'hi replica \(correcte\)/);
    out = analyse({ 'd-mig': { S4: { reps: [rep(z, one)] } } }).join('\n');
    assert.match(out, /en context, NO: 1 replicadors s'hi repliquen \(un error del codi\)/);
  },
  "AUD-175: l'eina amb --registre prova els hereditaris d'un registre de la §13, i la validació els compara amb el registre"() {
    withTmp((tmp) => {
      const strataDir = join(tmp, 'estrats'), testedDir = join(tmp, 'autonomia');
      mkdirSync(strataDir); mkdirSync(testedDir);
      // un registre de la §13 amb hereditaris coneguts: D½ amb companys uniformes i la llavor del nivell 1 fa les seves sopes, i els
      // primers 5.000 programes en tenen dos de C0 (el 3.406 i el 4.560)
      const rec = join(strataDir, 'd-mig-uniforme.jsonl');
      let r = run('estrats.mjs', '--programa', 'd-mig', '--company', 'uniforme', '--llavor', String(LEVEL1.from), '--programes', '5000', '--tros', '1000', '--fils', '2', '--json', rec);
      assert.strictEqual(r.status, 0, r.stderr);
      clean(rec);
      const out = join(testedDir, 'd-mig-uniforme.jsonl'), base = ['--registre', rec, '--llavor', String(SEED), '--condicions', '2'];
      // --registre no va amb --quimica, --distribucio ni --extracte; i cal --registre, o --quimica i --distribucio
      for (const a of [[...base, '--quimica', 'C0'], [...base, '--distribucio', 'd-mig'], [...base, '--extracte', 'x.gz'], ['--llavor', String(SEED)], ['--registre', join(tmp, 'no.jsonl'), '--llavor', String(SEED)]]) {
        assert.strictEqual(run('autonomia.mjs', ...a, '--json', out).status, 2, a.join(' '));
      }
      r = run('autonomia.mjs', ...base, '--fils', '2', '--tros', '1', '--json', out);
      assert.strictEqual(r.status, 0, r.stderr);
      clean(out);
      const ls = lines(out), s = ls[0], level1 = extractRecord(readExtract(), 'C0', 'd-mig').heritable.filter((o) => o.index < 5000);
      assert.deepStrictEqual(ls.slice(1, -1).map((o) => [o.index, o.bytes]), level1.map((o) => [o.index, o.bytes]));
      assert.deepStrictEqual(level1.map((o) => o.index), [3406, 4560]);
      assert.strictEqual(s.chemistry, 'C0');
      assert.deepStrictEqual([s.source.file, s.source.sha256, s.source.heritable], ['d-mig-uniforme.jsonl', sha256(readFileSync(rec)), 2]);
      assert.deepStrictEqual(s.modules, fileHashes(MODULES_STRATA));
      // la mateixa prova que la de la §4, amb els mateixos bytes i les mateixes condicions
      const conds = conditions(SEED, 2);
      for (const o of ls.slice(1, -1)) { const t = testReplicator(Uint8Array.from(Buffer.from(o.bytes, 'hex')), conds, evaluator('C0')); for (const k of KEYS4) assert.strictEqual(o[k], t[k], k); }
      // un registre de la §13 amb uns bytes canviats: s'hi nega
      const bad = join(tmp, 'canviat.jsonl');
      writeFileSync(bad, readFileSync(rec, 'utf8').replace(/("index":3406,"bytes":")(..)/, (_, a, b) => a + (b === 'ff' ? 'fe' : 'ff')));
      assert.strictEqual(run('autonomia.mjs', '--registre', bad, '--llavor', String(SEED), '--condicions', '2', '--json', join(tmp, 'x.jsonl')).status, 2);
      // la validació de l'anàlisi, amb un pla de prova
      const plan = [{ key: 'd-mig:uniforme', program: 'd-mig', partner: 'uniforme', seed: LEVEL1.from, programs: 5000 }];
      const strata = readStrataFolder(strataDir, { root, plan });
      assert.deepStrictEqual(strata.problems, []);
      const opts = { plan, seed: SEED, conditions: 2 }, ok = readStrataAutonomy(testedDir, strata.runs, opts);
      assert.deepStrictEqual(ok.problems, []);
      assert.deepStrictEqual(ok.tested['d-mig:uniforme'].map((o) => o.index), [3406, 4560]);
      // amb el pla de veritat (la llavor i les condicions de la §4), s'hi nega
      assert.ok(readStrataAutonomy(testedDir, strata.runs, { plan }).problems.some((p) => /no són els del pla/.test(p)));
      const text = readFileSync(out, 'utf8');
      const tamper = (fn, re) => {
        writeFileSync(out, fn(text));
        const { problems } = readStrataAutonomy(testedDir, strata.runs, opts);
        assert.ok(problems.some((p) => re.test(p)), `${re}: ${problems.join(' | ')}`);
        writeFileSync(out, text);
      };
      tamper((t) => t.replace(/"sha256":"[0-9a-f]{64}"/, `"sha256":"${'0'.repeat(64)}"`), /no té cap prova d'autonomia/);
      tamper((t) => t.replace(/("index":3406,"bytes":")(..)/, '$1ff'), /empremta/);
      tamper((t) => t.replace(/"code":"[0-9a-f]+"/, '"code":"abc1234+canvis"'), /el codi és/);
      tamper((t) => t.replace(/"eines\/estrats.mjs":"[0-9a-f]{64}"/, `"eines/estrats.mjs":"${'0'.repeat(64)}"`), /un altre codi/);
      rmSync(out);
      assert.ok(readStrataAutonomy(testedDir, strata.runs, opts).problems.some((p) => /cap JSONL/.test(p)));
    });
  },
  async "AUD-179: un registre de la §13 sense cap hereditari: amb 8 fils, l'eina el fa sencer, amb 0 replicadors, i la validació l'accepta"() {
    // runJobs sense cap feina, amb 8 fils: acaba de seguida, sense crear cap fil ni cridar res
    let calls = 0;
    await within(10000, runJobs([], { threads: 8, compute: () => { calls++; }, workerUrl: new URL('../eines/autonomia.mjs', import.meta.url), data: null, onDone: () => { calls++; } }), 'runJobs sense cap feina');
    assert.strictEqual(calls, 0);
    // un fil que s'atura abans d'hora, sense cap error: s'hi nega, en lloc de no acabar mai
    await withTmpAsync(async (tmp) => {
      const w = join(tmp, 'fil.mjs');
      writeFileSync(w, "import { parentPort } from 'worker_threads';\nparentPort.on('message', () => process.exit(3));\n");
      const p = runJobs([[1], [2], [3]], { threads: 2, compute: null, workerUrl: pathToFileURL(w), data: null, onDone: () => {} });
      await assert.rejects(within(10000, p, 'runJobs amb un fil que s\'atura'), /s'ha aturat abans d'acabar les seves feines \(codi 3\)/);
    });
    withTmp((tmp) => {
      const strataDir = join(tmp, 'estrats'), testedDir = join(tmp, 'autonomia');
      mkdirSync(strataDir); mkdirSync(testedDir);
      // l'estrat 0: cap byte d'instrucció, i cap replicador. Com a la llista de la §13, el mateix nom a les dues carpetes
      const rec = join(strataDir, 'estrat-00.jsonl'), out = join(testedDir, 'estrat-00.jsonl');
      let r = run('estrats.mjs', '--programa', 'estrat:0', '--company', 'uniforme', '--llavor', String(SEED), '--programes', '20', '--tros', '10', '--json', rec);
      assert.strictEqual(r.status, 0, r.stderr);
      clean(rec);
      assert.strictEqual(lines(rec).pop().heritable, 0);
      // amb 8 fils, com a la llista: abans de l'AUD-179, sortia amb el codi 0 i només la línia d'inici
      r = run('autonomia.mjs', '--registre', rec, '--llavor', String(SEED), '--condicions', '2', '--fils', '8', '--json', out);
      assert.strictEqual(r.status, 0, r.stderr);
      clean(out);
      const ls = lines(out);
      assert.deepStrictEqual(ls.map((o) => o.type), ['start', 'end'], "la línia d'inici i la final, i cap replicador");
      assert.deepStrictEqual([ls[0].replicators, ls[1].replicators, ls[1].fingerprint], [0, 0, sha256('')]);
      const plan = [{ key: 'estrat:0', program: 'estrat:0', partner: 'uniforme', seed: SEED, programs: 20, k: 0 }];
      const strata = readStrataFolder(strataDir, { root, plan });
      assert.deepStrictEqual(strata.problems, []);
      const ok = readStrataAutonomy(testedDir, strata.runs, { plan, seed: SEED, conditions: 2 });
      assert.deepStrictEqual(ok.problems, []);
      assert.deepStrictEqual(ok.tested['estrat:0'], []);
    });
  },
  "AUD-175: l'anàlisi de ρ_aut, amb dades sintètiques: la corba, m_aut, els grups de k, les sopes i D½ amb companys de D½"() {
    const n = (k) => '1'.repeat(k) + '0'.repeat(100 - k);
    const rep = (index, k) => ({ index, bytes: '00'.repeat(64), solo: n(k), context: n(0), heritableSolo: n(k), heritableContext: n(0) });
    const strata = {}, tested = {};
    for (const p of planRuns()) {
      strata[p.key] = { n: p.programs };
      // els estrats: cap hereditari de k = 0 a 4, i dos a cada k ≥ 5, un d'autònom (n = 60) i un que no (n = 0); les sopes, tres
      // hereditaris, un d'autònom; D½ amb companys de D½, un, autònom a totes
      tested[p.key] = p.k !== undefined ? (p.k >= 5 ? [rep(1, 60), rep(2, 0)] : []) : p.world ? [rep(1, 1), rep(2, 0), rep(3, 0)] : [rep(7, 100)];
    }
    const autonomy = { 'd-mig': { C0: { start: { level1: { programs: 1e7 } }, reps: [rep(7, 100), rep(9, 0)] } }, uniforme: { C0: { start: { level1: { programs: 1e7 } }, reps: [rep(1, 0)] } } };
    const out = analyseStrataAutonomy(strata, tested, autonomy).join('\n');
    assert.match(out, /m_aut, el k més petit amb algun autònom: 5 \(/);
    assert.match(out, /k de 0 a 4: 0 hereditaris de 50000000 programes; n ≥ 1, 0; n > 50, 0/);
    assert.match(out, /k de 5 a 12: 16 hereditaris de 80000000 programes; n ≥ 1, 8; n > 50, 8/);
    assert.match(out, /Les 22 sopes juntes: uniformes, 66 hereditaris, 22 autònoms, .*; de la sopa, 66 hereditaris, 22 autònoms/);
    assert.match(out, /4\. D½ amb companys de D½, els primers 1000000 programes del nivell 1, amb C0: 1 hereditaris; n ≥ 1, 1; n > 50, 1\. Els 1 que també ho eren al nivell 1/);
    assert.match(out, /Comprovació, D½: ρ_aut = .*, i al nivell 1, C0, a la §4, 1 de 10000000/);
    // la comprovació amb la §4: una cadena diferent és un problema
    assert.deepStrictEqual(checkAgainstLevel1(tested, autonomy).problems, []);
    const other = { ...autonomy, 'd-mig': { C0: { ...autonomy['d-mig'].C0, reps: [rep(7, 99)] } } };
    assert.ok(checkAgainstLevel1(tested, other).problems.some((p) => /no té les cadenes de la §4/.test(p)));
  },
  "l'eina: les opcions, el JSONL, els fils, i que no sobreescriu res (S4, 2 condicions, sense mirar-ne cap xifra)"() {
    withTmp((tmp) => {
      const f = (n) => join(tmp, `${n}.jsonl`), base = ['--quimica', 'S4', '--distribucio', 'd-mig', '--llavor', String(SEED), '--condicions', '2'];
      assert.strictEqual(run('autonomia.mjs', '--help').status, 0);
      for (const a of [[...base], [...base, '--json', f('x'), '--fils', '17'], [...base.map((v) => (v === 'S4' ? 'S9' : v)), '--json', f('x')],
        [...base, '--json', f('x'), '--extracte', join(tmp, 'no.gz')], [...base, '--json', f('x'), '--color', 'blau']]) assert.strictEqual(run('autonomia.mjs', ...a).status, 2, a.join(' '));
      assert.strictEqual(run('autonomia.mjs', ...base, '--json', f('a'), '--tros', '7').status, 0);
      assert.strictEqual(run('autonomia.mjs', ...base, '--json', f('b'), '--fils', '3', '--tros', '5').status, 0);
      const a = lines(f('a')), b = lines(f('b')), rec = extractRecord(readExtract(), 'S4', 'd-mig');
      assert.deepStrictEqual(a.slice(1, -1), b.slice(1, -1), 'el resultat no depèn dels fils ni dels trossos');
      assert.strictEqual(a[a.length - 1].fingerprint, b[b.length - 1].fingerprint);
      const s = a[0];
      assert.strictEqual(s.extractSha256, EXTRACT_SHA256);
      assert.deepStrictEqual(s.modules, fileHashes(MODULES));
      assert.deepStrictEqual(s.inertCheck, { pairs: 2 * 56, active: 0 });
      assert.strictEqual(s.level1.fingerprint, rec.end.fingerprint);
      assert.deepStrictEqual(a.slice(1, -1).map((o) => o.index), rec.heritable.map((o) => o.index));
      assert.ok(a.slice(1, -1).every((o) => ['solo', 'context', 'heritableSolo', 'heritableContext'].every((k) => /^[01]{2}$/.test(o[k]))));
      const before = readFileSync(f('a'), 'utf8'), r = run('autonomia.mjs', ...base, '--json', f('a'));
      assert.strictEqual(r.status, 2);
      assert.strictEqual(readFileSync(f('a'), 'utf8'), before);
    });
  },
  "l'anàlisi: les quatre xifres de cada replicador, i la distribució"() {
    const mk = (s, c) => ({ heritableSolo: s, heritableContext: c });
    assert.deepStrictEqual(countsOf(mk('1100', '0110')), { any: 3, solo: 2, context: 2 });
    const n = (k) => '1'.repeat(k) + '0'.repeat(100 - k);
    const reps = [0, 1, 50, 51, 94, 95, 99, 100].map((k, i) => ({ index: i, bytes: '00'.repeat(64), solo: n(k), context: n(0), heritableSolo: n(k), heritableContext: n(0), level1Solo: true }));
    const out = analyse({ 'd-mig': { C0: { reps } } }).join('\n');
    const expected = { 'en 1 o més': 7, 'en més de 50': 5, 'en 95 o més': 3, 'en totes 100': 1 };
    for (const f of FIGURES) assert.ok(out.includes(`    ${f.name}: ${expected[f.name]} (`), `${f.name}\n${out}`);
    assert.match(out, /la distribució: 0: 1; 1-10: 1; 11-50: 1; 51-94: 2; 95-99: 2; 100: 1/);
    assert.match(out, /autonomia robusta \(operativa\)/);
  },
  "l'anàlisi: la validació, i cada manera com s'hi ha de negar"() {
    withTmp((tmp) => {
      const dir = join(tmp, 'r'), plan = { ...PLAN, seed: SEED, conditions: 2, runs: { 'd-mig': ['S4'] } };
      mkdirSync(dir);
      assert.strictEqual(run('autonomia.mjs', '--quimica', 'S4', '--distribucio', 'd-mig', '--llavor', String(SEED), '--condicions', '2', '--json', join(dir, 's4.jsonl')).status, 0);
      clean(join(dir, 's4.jsonl'));
      const ok = readFolder(dir, { plan });
      assert.deepStrictEqual(ok.problems, []);
      assert.strictEqual(ok.runs['d-mig'].S4.reps.length, extractRecord(readExtract(), 'S4', 'd-mig').heritable.length);
      // amb el pla de veritat, la llavor i les condicions no hi són
      assert.ok(readFolder(dir).problems.some((p) => /no són els del pla/.test(p)));
      const text = readFileSync(join(dir, 's4.jsonl'), 'utf8'), ls = text.trim().split('\n');
      const tamper = (fn, re) => {
        const d = join(tmp, `t${Math.random().toString(36).slice(2)}`);
        mkdirSync(d);
        writeFileSync(join(d, 's4.jsonl'), fn(ls.slice()).join('\n') + '\n');
        const { problems } = readFolder(d, { plan });
        assert.ok(problems.some((p) => re.test(p)), `${re}: ${problems.join(' | ')}`);
      };
      tamper((l) => { l[1] = l[1].replace(/"bytes":"(..)/, '"bytes":"ff'); return l; }, /no és el replicador|empremta/);
      tamper((l) => l.filter((_, i) => i !== 2), /empremta|hereditaris/);
      tamper((l) => { const o = JSON.parse(l[0]); o.code = 'abc1234+canvis'; l[0] = JSON.stringify(o); return l; }, /el codi és/);
      tamper((l) => { const o = JSON.parse(l[0]); o.modules['fase2/replication.js'] = '0'.repeat(64); l[0] = JSON.stringify(o); return l; }, /un altre codi/);
      tamper((l) => { const o = JSON.parse(l[0]); o.inertCheck.active = 1; l[0] = JSON.stringify(o); return l; }, /inerts/);
      tamper((l) => l.slice(0, -1), /no és sencer/);
      // un registre de més, o un que hi falta
      copyFileSync(join(dir, 's4.jsonl'), join(dir, 's4-bis.jsonl'));
      assert.ok(readFolder(dir, { plan }).problems.some((p) => /repetit/.test(p)));
      assert.ok(readFolder(dir, { plan: { ...plan, runs: { 'd-mig': ['S4', 'C0'] } } }).problems.some((p) => /hi falten C0/.test(p)));
    });
  },
  "les variants per cap: la validació demana C0 i S1 iguals als del nivell 1 (aquí, uns registres de prova i una referència seva)"() {
    withTmp((tmp) => {
      const plan = { seed: SEED, noise: 8, distributions: { 'd-mig': { chemistries: ['C0', 'S1', 'S1h0', 'S1h1'], sizes: [300] } } };
      for (const c of plan.distributions['d-mig'].chemistries) {
        const r = run('densitat.mjs', '--quimica', c, '--distribucio', 'd-mig', '--llavor', String(SEED), '--programes', '300', '--tros', '100', '--json', join(tmp, `d-mig-${c}.jsonl`));
        assert.strictEqual(r.status, 0, r.stderr);
        clean(join(tmp, `d-mig-${c}.jsonl`));
      }
      const endOf = (c) => lines(join(tmp, `d-mig-${c}.jsonl`)).pop();
      const ok = readHeads(tmp, { plan, reference: endOf });
      assert.deepStrictEqual(ok.problems, []);
      const out = analyseHeads(ok.groups).join('\n');
      assert.match(out, /Contra S1, programa a programa/);
      assert.match(out, /S1h1: \d+ hereditaris/);
      // si C0 o S1 no fan el mateix que al nivell 1, no s'analitza res
      const other = (c) => ({ ...endOf(c), fingerprint: c === 'S1' ? '0'.repeat(64) : endOf(c).fingerprint });
      assert.ok(readHeads(tmp, { plan, reference: other }).problems.some((p) => /S1: no fa el mateix que al nivell 1/.test(p)));
      // i el pla del nivell 1 no les accepta: no hi són
      assert.ok(!PLAN.runs['d-mig'].includes('S1h0'));
    });
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { await fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
