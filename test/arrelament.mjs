// Proves de les eines del pilot de l'aparició i l'arrelament (docs/pla-aparicio-arrelament.md): els companys inerts i el cens inert
// (fase2/inert.js), el llinatge (fase2/llinatge.js), la sembra (eines/sembra.mjs), les opcions noves de sim.mjs (--inert-census,
// --plant, --lineage-every i --stop-on-extinction) i els tipus byte0 i byte0-placebo d'eines/transforma.mjs.
// Executa: node test/arrelament.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { PROGRAM_SIZE } from '../fase1/bff.js';
import { makeRng, randomSoup } from '../fase1/soup.js';
import { windowsOf, hasWindow } from '../fase2/replication.js';
import * as inert from '../fase2/inert.js';
import { Windows, createLineage } from '../fase2/llinatge.js';
import { conditions as conditionsB1, testCondition as testConditionB1, inertProgram as inertProgramB1, INERT as INERT_B1 } from '../eines/autonomia.mjs';
import { positions, makeSham, plantCells } from '../eines/sembra.mjs';
import { transform, checkInvariants } from '../eines/transforma.mjs';
import { designFor, agingLine, branchesOf, prepare, preflight, checkManifest } from '../eines/arrelament.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const sim = (...args) => spawnSync(process.execPath, ['sim.mjs', ...args], { cwd: root, encoding: 'utf8' });
const sembra = (...args) => spawnSync(process.execPath, ['eines/sembra.mjs', ...args], { cwd: root, encoding: 'utf8' });
const readJsonl = (f) => readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'arrelament-')); try { fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }
// G1 de la prova de viabilitat: un programa del brot del món 1034, hereditari sol en les 100 condicions de companys inerts (el registre
// del pas 3 de la maduració, fase2/resultats/maduracio/durada/registres/durada-5200.jsonl). Només es planta en aquestes proves i a
// l'assaig d'invasió.
const G1 = '1f1414191faf5b5b66335b5b9a3cf0887dbf3bf03bcff4ff393939ff17f45ccf2c3b5d5d3b2ccf5cf417ff393939fff4cf3bf03bbf7d88f03c9a5b5b33665b5b';
const W = 32, H = 16;
// Una captura petita, de sim.mjs mateix
function capture(tmp) {
  const r = sim('--world', `${W}x${H}`, '--seed', '3', '--epochs', '100', '--census', '50', '--save', tmp);
  assert.strictEqual(r.status, 0, r.stderr);
  return join(tmp, `llavor3-mon${W}x${H}-r2-final.bin`);
}

const tests = {
  'els companys inerts de fase2/inert.js són els de la prova d\'autonomia de B1': () => {
    assert.deepStrictEqual([...inert.INERT], [...INERT_B1]);
    const a = inert.conditions(3000000000, 100), b = conditionsB1(3000000000, 100);
    assert.deepStrictEqual(a.map((c) => c.testSeed), b.map((c) => c.testSeed));
    for (let j = 0; j < 100; j++) for (let k = 0; k < inert.PARTNERS; k++) assert.deepStrictEqual([...a[j].partners[k]], [...b[j].partners[k]]);
    assert.deepStrictEqual([...inert.inertProgram(makeRng(9, 'v2'))], [...inertProgramB1(makeRng(9, 'v2'))]);
    // la prova, amb programes a l'atzar, densos d'instruccions i el replicador del brot
    const rng = makeRng(11, 'v2'), ops = [...'<>{}-+.,[]'].map((c) => c.charCodeAt(0));
    const programs = [inert.fromHex(G1)];
    for (let i = 0; i < 30; i++) programs.push(Uint8Array.from({ length: PROGRAM_SIZE }, () => (i % 2 ? (rng() * 256) | 0 : ops[(rng() * ops.length) | 0])));
    for (const p of programs) for (const cond of a.slice(0, 5)) assert.deepStrictEqual(inert.testCondition(p, cond), testConditionB1(p, cond, undefined));
    const s = inert.testInert(programs[0], a.slice(0, 3));
    assert.ok(inert.heritable(s) && inert.copies(s), 'el replicador del brot no es copia amb companys inerts');
  },
  'les finestres del llinatge fan el mateix que la prova de replicació': () => {
    const rng = makeRng(12345, 'v2');
    const rnd = () => Uint8Array.from({ length: PROGRAM_SIZE }, () => (rng() * 256) | 0);
    let positive = 0;
    for (let t = 0; t < 300; t++) {
      const A = t % 3 ? rnd() : Uint8Array.from({ length: PROGRAM_SIZE }, () => [60, 62, 91, 93, 44, 0][(rng() * 6) | 0]);
      const w = new Windows(); w.addProgram(A);
      const set = windowsOf(A);
      assert.strictEqual(w.size, set.size);
      for (let k = 0; k < 20; k++) {
        let P;
        if (k < 5) { const R = A.slice().reverse(), s = (rng() * 40) | 0; P = Uint8Array.from([...R.slice(s), ...R.slice(0, s)]); }
        else if (k < 12) { P = rnd(); const s = (rng() * 48) | 0, d = (rng() * 48) | 0; P.set(A.subarray(s, s + 16), d); }
        else P = rnd();
        for (let m = 0; m < k % 4; m++) P[(rng() * PROGRAM_SIZE) | 0] = (rng() * 256) | 0;
        assert.strictEqual(w.has(P), hasWindow(P, set));
        if (w.has(P)) positive++;
      }
    }
    assert.ok(positive > 500, 'la prova no té prou casos positius');
  },
  'el cens inert: determinista, no toca el món, i troba el replicador': () => {
    const soup = randomSoup(W * H, makeRng(5, 'v2'));
    for (let c = 0; c < 40; c++) soup.set(inert.fromHex(G1), c * PROGRAM_SIZE);
    const before = Uint8Array.from(soup);
    const a = inert.createInertCensus({ sample: 100 }).run(soup, W * H, 10);
    const b = inert.createInertCensus({ sample: 100 }).run(soup, W * H, 10);
    assert.deepStrictEqual(a, b);
    assert.deepStrictEqual(soup, before);
    assert.strictEqual(a.sample, 100);
    assert.strictEqual(a.cells.length, a.copying);
    const g1 = a.cells.filter((x) => x.program === G1);
    assert.ok(g1.length > 0 && g1.every((x) => x.cell < 40 && x.heritableSolo.includes('1')), 'no troba el replicador plantat');
    assert.ok(a.cells.every((x) => x.solo.length === 3), 'tres condicions');
  },
  'el llinatge: les cel·les, F i l\'extinció en dos punts seguits': () => {
    const n = W * H;
    const soup = randomSoup(n, makeRng(6, 'v2'));
    const g = inert.fromHex(G1);
    for (const c of [3, 4, 5]) soup.set(g, c * PROGRAM_SIZE);
    const half = g.slice(); half.fill(0, 32); // porta finestres del genotip, però no es copia
    soup.set(half, 100 * PROGRAM_SIZE);
    const lin = createLineage({ program: g, seed: 1 });
    const r = lin.step(soup, n, 0);
    assert.strictEqual(r.M, 4);
    assert.strictEqual(r.tested, 4);
    assert.strictEqual(r.functional, 3);
    assert.strictEqual(r.F, 3);
    assert.strictEqual(lin.extinctAt, null);
    const empty = randomSoup(n, makeRng(7, 'v2'));
    assert.strictEqual(lin.step(empty, n, 50).F, 0);
    assert.strictEqual(lin.extinctAt, null, 'un sol punt amb F = 0 no és l\'extinció');
    lin.step(soup, n, 100);
    lin.step(empty, n, 150);
    assert.strictEqual(lin.extinctAt, null, 'els zeros no eren seguits');
    lin.step(empty, n, 200);
    assert.strictEqual(lin.extinctAt, 150);
    // amb més cel·les que la mostra, en prova 256 i estima F
    const many = randomSoup(n, makeRng(8, 'v2'));
    for (let c = 0; c < 300; c++) many.set(g, c * PROGRAM_SIZE);
    const m = createLineage({ program: g, seed: 2 }).step(many, n, 0);
    assert.strictEqual(m.M, 300); assert.strictEqual(m.tested, 256); assert.strictEqual(m.F, 300);
  },
  'la sembra: les posicions, el sham i les comprovacions': () => {
    // les posicions de la prova de viabilitat (una per món, la llavor del món + 700.000)
    assert.deepStrictEqual(positions(5004, 1)[0], { x: 494, y: 61, cell: 31726 });
    assert.deepStrictEqual(positions(5014, 1)[0], { x: 506, y: 5, cell: 3066 });
    const ps = positions(7001, 4);
    assert.strictEqual(new Set(ps.map((p) => p.cell)).size, 4);
    assert.ok(ps.every((p) => p.x >= 2 && p.x <= 509 && p.y >= 2 && p.y <= 253));
    assert.deepStrictEqual(plantCells(10, 5, W, H, true).length, 9);
    assert.throws(() => plantCells(1, 5, W, H, false), /vora/);
    const s = makeSham(inert.fromHex(G1), 5);
    assert.strictEqual(s.test.solo + s.test.context, 0);
    assert.deepStrictEqual([...s.bytes].sort((a, b) => a - b), [...inert.fromHex(G1)].sort((a, b) => a - b));
  },
  'sim.mjs: el cens inert no canvia la història': () => withTmp((tmp) => {
    const base = ['--world', `${W}x${H}`, '--seed', '4', '--epochs', '300', '--census', '50'];
    assert.strictEqual(sim(...base, '--json', join(tmp, 'a.jsonl')).status, 0);
    const r = sim(...base, '--inert-census', '64', '--json', join(tmp, 'b.jsonl'));
    assert.strictEqual(r.status, 0, r.stderr);
    const a = readJsonl(join(tmp, 'a.jsonl')), b = readJsonl(join(tmp, 'b.jsonl'));
    const census = (x) => JSON.stringify(x.filter((l) => l.type === 'census'));
    assert.strictEqual(census(a), census(b));
    assert.strictEqual(a.at(-1).fingerprint, b.at(-1).fingerprint);
    assert.strictEqual(b.filter((l) => l.type === 'inert').length, 6);
    assert.ok(b.filter((l) => l.type === 'inert').every((l) => !('lineage' in l)), 'sense llinatge, el cens inert no en parla');
    assert.deepStrictEqual(b[0].inertCensus, { sample: 64, seed: 20261116, conditions: { seed: 3000000000, count: 3 } });
    assert.ok(!('inertCensus' in a[0]) && !('plant' in a[0]) && !('lineage' in a[0]), 'sense les opcions, la línia d\'inici és la de sempre');
    assert.ok(!('extinction' in a.at(-1)));
  }),
  'sim.mjs --plant: planta, segueix el llinatge i s\'atura a l\'extinció': () => withTmp((tmp) => {
    const cap = capture(tmp);
    const plant = join(tmp, 'p.json'), sham = join(tmp, 's.json');
    let r = sembra('--from', cap, '--width', String(W), '--program', G1, '--cell', '10,8', '--lineage-seed', '1', '--genotype', 'G1', '--out', plant);
    assert.strictEqual(r.status, 0, r.stderr);
    r = sembra('--from', cap, '--width', String(W), '--program', G1, '--cell', '10,8', '--lineage-seed', '1', '--genotype', 'G1', '--out', plant);
    assert.strictEqual(r.status, 2, 'ha sobreescrit el fitxer de la sembra');
    assert.strictEqual(sembra('--from', cap, '--width', String(W), '--program', G1, '--cell', '1,8', '--lineage-seed', '1', '--out', join(tmp, 'x.json')).status, 2, 'una cel·la de la vora');
    assert.strictEqual(sembra('--from', cap, '--width', String(W), '--program', '00'.repeat(64), '--cell', '10,8', '--lineage-seed', '1', '--out', join(tmp, 'y.json')).status, 2, 'un programa que no és hereditari');
    const rec = JSON.parse(readFileSync(plant, 'utf8'));
    assert.deepStrictEqual(rec.cells, [8 * W + 10]);
    assert.strictEqual(rec.hex, G1);
    assert.ok(rec.genotypeTest.heritableSolo >= 95);
    // amb el llinatge
    const json = join(tmp, 'p.jsonl');
    r = sim('--world', `${W}x${H}`, '--seed', '9', '--from', cap, '--start', '100', '--epochs', '400', '--census', '50', '--plant', plant, '--lineage-every', '25', '--inert-census', String(W * H), '--json', json);
    assert.strictEqual(r.status, 0, r.stderr);
    const L = readJsonl(json);
    // el cens inert (de tot el món) diu quantes hereditàries són del llinatge: cap més que les hereditàries, i les que porten el genotip
    const inertLines = L.filter((l) => l.type === 'inert');
    assert.strictEqual(inertLines.length, 6);
    for (const l of inertLines) {
      assert.ok(Number.isInteger(l.lineage) && l.lineage <= l.heritable, JSON.stringify(l).slice(0, 200));
      const g1 = l.cells.filter((c) => c.program === G1 && (c.heritableSolo.includes('1') || c.heritableContext.includes('1'))).length;
      assert.ok(l.lineage >= g1, 'el llinatge no compta les cel·les amb el genotip mateix');
    }
    assert.strictEqual(L[0].plant.outputSha256, rec.outputSha256);
    assert.deepStrictEqual(L[0].lineage, { every: 25, seed: 1, sample: 256, conditions: { seed: 3000000000, count: 3 }, stopOnExtinction: null });
    const lin = L.filter((l) => l.type === 'lineage');
    assert.strictEqual(lin[0].epoch, 100); assert.strictEqual(lin[0].F, 1);
    assert.strictEqual(lin.length, 13);
    assert.ok('extinction' in L.at(-1));
    // el sham no es copia: s'extingeix al primer punt, es confirma al segon, i s'atura
    r = sembra('--from', cap, '--width', String(W), '--program', G1, '--cell', '10,8', '--sham', '5', '--lineage-seed', '1', '--out', sham);
    assert.strictEqual(r.status, 0, r.stderr);
    r = sim('--world', `${W}x${H}`, '--seed', '9', '--from', cap, '--start', '100', '--epochs', '400', '--census', '50', '--plant', sham, '--lineage-every', '25', '--stop-on-extinction', '0', '--json', join(tmp, 's.jsonl'));
    assert.strictEqual(r.status, 0, r.stderr);
    const S = readJsonl(join(tmp, 's.jsonl'));
    assert.strictEqual(S.at(-1).reason, 'extinció');
    assert.strictEqual(S.at(-1).extinction, 100);
    assert.strictEqual(S.at(-1).epoch, 125);
    // un món de partida que no és el de la sembra
    const other = join(tmp, 'altre.bin');
    const buf = readFileSync(cap); buf[0] ^= 1; writeFileSync(other, buf);
    r = sim('--world', `${W}x${H}`, '--from', other, '--start', '100', '--epochs', '200', '--plant', plant);
    assert.strictEqual(r.status, 2); assert.match(r.stderr, /no és el de la sembra/);
  }),
  'sim.mjs rebutja les combinacions que no tenen sentit': () => {
    for (const args of [
      ['--world', '64x64', '--plant', 'x.json'],
      ['--world', '64x64', '--from', 'x.bin', '--start', '1', '--epochs', '5', '--lineage-every', '10'],
      ['--world', '64x64', '--from', 'x.bin', '--start', '1', '--epochs', '5', '--plant', 'x.json', '--stop-on-extinction', '0'],
      ['--world', '64x64', '--census-version', 'v2', '--inert-census', '10'],
      ['--inert-census', '10'],
    ]) {
      const r = sim(...args);
      assert.strictEqual(r.status, 2, args.join(' '));
      assert.ok(r.stderr.startsWith('Error:'), r.stderr);
    }
  },
  'byte0 i byte0-placebo: el primer byte, i el que conserven': () => {
    const n = 200, rng = makeRng(21, 'v2');
    const soup = randomSoup(n, makeRng(20, 'v2'));
    const LT = 60;
    for (let c = 0; c < n; c++) if (rng() < 0.3) soup[c * PROGRAM_SIZE] = LT;
    soup.fill(LT, 7 * PROGRAM_SIZE, 8 * PROGRAM_SIZE);                       // tot '<'
    soup.fill(9, 9 * PROGRAM_SIZE, 10 * PROGRAM_SIZE); soup[9 * PROGRAM_SIZE] = LT; // les posicions 1 a 63, iguals
    const starts = (b) => { let k = 0; for (let c = 0; c < n; c++) if (b[c * PROGRAM_SIZE] === LT) k++; return k; };
    const b0 = transform(soup, 'byte0', 3);
    assert.deepStrictEqual(checkInvariants(soup, b0.out, b0.info), []);
    assert.strictEqual(starts(b0.out), 1, 'només el programa de tot \'<\' hi comença');
    const pl = transform(soup, 'byte0-placebo', 3);
    assert.deepStrictEqual(checkInvariants(soup, pl.out, pl.info), []);
    assert.strictEqual(starts(pl.out), starts(soup));
    assert.strictEqual(b0.info.byte0.programs, pl.info.byte0.programs);
    assert.strictEqual(b0.info.byte0.unchanged, 1); assert.strictEqual(pl.info.byte0.unchanged, 2);
    assert.strictEqual(b0.info.changed, 2 * b0.info.byte0.swapped);
    // el comprovador detecta una transformació espatllada
    const bad = Uint8Array.from(b0.out);
    const c = [...Array(n).keys()].find((k) => soup[k * PROGRAM_SIZE] === LT && k !== 7);
    bad[c * PROGRAM_SIZE] = LT;
    assert.ok(checkInvariants(soup, bad, b0.info).length > 0);
    const bad2 = Uint8Array.from(pl.out);
    [bad2[c * PROGRAM_SIZE], bad2[c * PROGRAM_SIZE + 1]] = [bad2[c * PROGRAM_SIZE + 1], bad2[c * PROGRAM_SIZE]];
    assert.ok(checkInvariants(soup, bad2, pl.info).length > 0);
  },
  'eines/arrelament.mjs: l\'envelliment, la preparació, el manifest, les comprovacions i les dues parts, amb un disseny petit': async () => {
    // Un disseny petit, dins del repositori (la preparació demana un commit net i el simulador de l'envelliment), en una carpeta
    // que la prova esborra
    const folder = `fase2/resultats/arrelament/prova-eina-${process.pid}`;
    const d = designFor({ folder, candidates: ['9001', '9002', '9003', '9004', '9005', '9006'], aging: 6, cohort: 3, age: 300, world: [W, H],
      horizonA: 200, horizonB: 300, sham: { genotype: 'G4', worlds: 1 } });
    const abs = join(root, folder);
    try {
      assert.strictEqual(agingLine(d, '9001'), `e9001 --world ${W}x${H} --seed 9001 --mixing 0 --epochs 300 --every 100 --census 250 --census-version v3 --rng v2 --stop-after-event 0 --json ${folder}/envelliment/e9001.jsonl --save ${folder}/envelliment/captures`);
      // les branques d'un món: 3 sopes × 14 sembres, 2 × 4 de byte0, 3 sham al primer món, i 3 naturals
      const bs = branchesOf(d, '9001', 0);
      assert.strictEqual(bs.filter((b) => b.part === 'A').length, 3 * 14 + 2 * 4 + 3);
      assert.strictEqual(bs.filter((b) => b.part === 'B').length, 3);
      assert.strictEqual(branchesOf(d, '9001', 1).filter((b) => b.variant === 'sham').length, 0);
      assert.deepStrictEqual([...new Set(bs.filter((b) => b.part === 'A').map((b) => b.seed))], [409001, 1409001, 2409001, 3409001]);
      assert.ok(bs.filter((b) => b.variant === 'sham').every((b) => !b.line.includes('--lineage-every')));
      // l'envelliment, amb sim.mjs
      for (const w of d.candidates) {
        const [, ...args] = agingLine(d, w).split(' ');
        const r = sim(...args);
        assert.strictEqual(r.status, 0, r.stderr);
      }
      const m = await prepare(d, { root, parallel: 4, log: () => {} });
      assert.strictEqual(m.worlds.filter((w) => w.included).length, 3);
      assert.deepStrictEqual(preflight(d, { root }), []);
      // una branca de la part A i una de la part B, amb les seves ordres
      const lines = readFileSync(join(abs, 'llista-a-pc.txt'), 'utf8').trim().split('\n');
      mkdirSync(join(abs, 'part-a')); mkdirSync(join(abs, 'part-b')); // com fa eines/llanca-lot.sh amb la seva carpeta
      for (const l of [lines[0], readFileSync(join(abs, 'llista-b-pc.txt'), 'utf8').trim().split('\n')[0]]) {
        const [, ...args] = l.split(' ');
        const r = sim(...args);
        assert.strictEqual(r.status, 0, r.stderr);
      }
      const a = readJsonl(join(abs, 'part-a', `${lines[0].split(' ')[0]}.jsonl`));
      assert.ok(a[0].plant && a.some((l) => l.type === 'lineage') && a.some((l) => l.type === 'inert'));
      // ara la part A ha començat; i una sembra o una llista tocades són un problema
      assert.ok(preflight(d, { root }).some((x) => /ja ha començat/.test(x)));
      assert.deepStrictEqual(checkManifest(d, { root }), []);
      const plant = join(root, m.branches.find((b) => b.part === 'A').plant);
      const pj = JSON.parse(readFileSync(plant, 'utf8')); pj.lineageSeed++; writeFileSync(plant, JSON.stringify(pj, null, 2) + '\n');
      assert.ok(checkManifest(d, { root }).some((x) => /la sembra no és la del manifest/.test(x)));
      writeFileSync(join(abs, 'llista-b-vm.txt'), 'x\n');
      assert.ok(checkManifest(d, { root }).some((x) => /la llista B-vm no és exactament/.test(x)));
      // la preparació no es torna a fer
      await assert.rejects(prepare(d, { root, log: () => {} }), /ja existeix/);
    } finally {
      rmSync(abs, { recursive: true, force: true });
    }
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { await fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
