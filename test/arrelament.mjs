// Proves de les eines del pilot de l'aparició i l'arrelament (docs/pla-aparicio-arrelament.md): els companys inerts i el cens inert
// (fase2/inert.js), el llinatge (fase2/llinatge.js), la sembra (eines/sembra.mjs), les opcions noves de sim.mjs (--inert-census,
// --plant, --lineage-every i --stop-on-extinction) i els tipus byte0 i byte0-placebo d'eines/transforma.mjs.
// Executa: node test/arrelament.mjs
import assert from 'assert';
import { spawnSync, spawn } from 'child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { PROGRAM_SIZE } from '../fase1/bff.js';
import { makeRng, randomSoup } from '../fase1/soup.js';
import { windowsOf, hasWindow } from '../fase2/replication.js';
import * as inert from '../fase2/inert.js';
import { Windows, createLineage, carriers } from '../fase2/llinatge.js';
import { conditions as conditionsB1, testCondition as testConditionB1, inertProgram as inertProgramB1, INERT as INERT_B1 } from '../eines/autonomia.mjs';
import { positions, makeSham, plantCells } from '../eines/sembra.mjs';
import { transform, checkInvariants } from '../eines/transforma.mjs';
import { designFor, agingLine, branchesOf, prepare, preflight, checkManifest } from '../eines/arrelament.mjs';
import { partA, families, dominantFamily, mh, bootstrap, reading, analyse, followUpClass, rootedFamilies, startingFlags } from '../eines/arrelament-analisi.mjs';

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
    assert.ok(!m.exhaustive);
    // més cel·les que la mostra i cap de funcional: es proven totes, i F = 0 és exacte (AUD-192 = AU2-157)
    const dead = randomSoup(n, makeRng(9, 'v2'));
    for (let c = 0; c < 300; c++) dead.set(half, c * PROGRAM_SIZE);
    const z = createLineage({ program: g, seed: 3 }).step(dead, n, 0);
    assert.strictEqual(z.M, 300); assert.strictEqual(z.tested, 300); assert.strictEqual(z.F, 0); assert.strictEqual(z.exhaustive, true);
    // i una sola funcional entre 300: la mostra la pot perdre, però la prova sencera la troba (F > 0 amb qualsevol llavor)
    const one = Uint8Array.from(dead); one.set(g, 150 * PROGRAM_SIZE);
    for (let s = 0; s < 8; s++) assert.ok(createLineage({ program: g, seed: 10 + s }).step(one, n, 0).F > 0, `la llavor ${10 + s} perd l'única funcional`);
    // uns quants programes alhora (el seguiment del bessó): les finestres de tots
    const two = createLineage({ program: [g, inert.fromHex('00'.repeat(64))], seed: 4 }).step(soup, n, 0);
    assert.strictEqual(two.M, 4);
    assert.strictEqual(carriers(soup, n, [g]), 4);
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
    // el seguiment sense sembra (--track, AU2-156): tampoc no canvia la història
    const tr = join(tmp, 't.json');
    writeFileSync(tr, JSON.stringify({ type: 'track', genotypes: ['G1'], programs: [G1], lineageSeed: 5 }));
    const c = sim(...base, '--track', tr, '--lineage-every', '50', '--inert-census', '64', '--json', join(tmp, 'c.jsonl'));
    assert.strictEqual(c.status, 0, c.stderr);
    const C = readJsonl(join(tmp, 'c.jsonl'));
    assert.strictEqual(census(C), census(a));
    assert.strictEqual(C.at(-1).fingerprint, a.at(-1).fingerprint);
    assert.strictEqual(C[0].track.programs[0], G1); assert.ok(Number.isInteger(C[0].track.preCarriers));
    assert.strictEqual(C.filter((l) => l.type === 'lineage').length, 7);
    assert.ok(C.filter((l) => l.type === 'inert').every((l) => 'lineage' in l));
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
    assert.strictEqual(L[0].plant.preCarriers, 0, 'el món de partida no porta cap finestra de G1');
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
      ['--world', '64x64', '--from', 'x.bin', '--start', '1', '--epochs', '5', '--plant', 'x.json', '--track', 't.json', '--lineage-every', '10'],
      ['--world', '64x64', '--track', 't.json'],
      ['--world', '64x64', '--track', 't.json', '--lineage-every', '10', '--stop-on-extinction', '0'],
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
    assert.strictEqual(b0.info.byte0.unchanged, 1);
    // el placebo no canvia els programes sense cap instrucció de l'1 al 63, o amb les posicions 1 a 63 iguals
    const isOp = (v) => [60, 62, 123, 125, 45, 43, 46, 44, 91, 93].includes(v);
    let still = 0;
    for (let k = 0; k < n; k++) {
      const o = k * PROGRAM_SIZE;
      if (soup[o] !== LT) continue;
      const tail = soup.subarray(o + 1, o + PROGRAM_SIZE);
      if (!tail.some(isOp) || tail.every((v) => v === tail[0])) still++;
    }
    assert.strictEqual(pl.info.byte0.unchanged, still);
    // i cada intercanvi del placebo mou una instrucció, com byte0
    for (let k = 0; k < n; k++) {
      const o = k * PROGRAM_SIZE, diff = [];
      for (let i = 0; i < PROGRAM_SIZE; i++) if (pl.out[o + i] !== soup[o + i]) diff.push(i);
      if (diff.length) assert.ok(isOp(soup[o + diff[0]]) || isOp(soup[o + diff[1]]), `el placebo no mou cap instrucció a la cel·la ${k}`);
    }
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
  'l\'anàlisi: arrelar, extingir-se, la família dominant, Mantel i Haenszel i la lectura': () => {
    const L = (epoch, F) => ({ type: 'lineage', epoch, M: F, tested: F, copying: F, functional: F, F, windows: 1 });
    const end = (epoch) => ({ type: 'end', epoch, reason: 'horitzó' });
    let r = partA([{ type: 'start' }, L(8000, 1), L(8050, 5), L(8100, 1400), L(8150, 1500), L(8200, 1300), L(8350, 2000), end(8350)], { start: 8000, horizon: 1500 });
    assert.strictEqual(r.rootedAt, 8100); assert.strictEqual(r.outcome, 'arrela'); assert.strictEqual(r.Fmax, 2000);
    r = partA([{ type: 'start' }, L(8000, 1), L(8050, 1400), L(8300, 1000), end(8300)], { start: 8000, horizon: 1500 });
    assert.strictEqual(r.rootedAt, null, 'el segon punt, a 250 èpoques, no hi arriba');
    r = partA([{ type: 'start' }, L(8000, 1), L(8050, 0), L(8100, 3), L(8150, 0), L(8200, 0), end(8200)], { start: 8000, horizon: 1500 });
    assert.strictEqual(r.extinctAt, 8150); assert.strictEqual(r.outcome, "s'extingeix");
    const inertAt = (epoch, heritableN, lineage) => ({ type: 'inert', epoch, sample: 4096, copying: heritableN, heritable: heritableN, lineage, cells: [] });
    r = partA([{ type: 'start' }, L(8000, 1), inertAt(8250, 10, 1), { type: 'event', epoch: 8250, confirmed: 8500 }, inertAt(8500, 10, 6), end(8500)], { start: 8000, horizon: 1500 });
    assert.deepStrictEqual(r.law2, { epoch: 8250, confirmed: 8500, dominant: true }); assert.strictEqual(r.detectedAt, 8250);
    r = partA([{ type: 'start' }, L(8000, 1), { type: 'event', epoch: 8250, confirmed: 8500 }, inertAt(8500, 10, 4), end(8500)], { start: 8000, horizon: 1500 });
    assert.strictEqual(r.law2.dominant, false); assert.strictEqual(r.detectedAt, 8500);
    // les famílies del cens inert
    const rnd = (s) => { const g = makeRng(s, 'v2'); return Array.from({ length: PROGRAM_SIZE }, () => ((g() * 256) | 0).toString(16).padStart(2, '0')).join(''); };
    const X = rnd(1), Y = rnd(2);
    const cell = (program, h = '111') => ({ cell: 0, program, solo: h, context: '000', heritableSolo: h, heritableContext: '000' });
    const recs = [
      { type: 'inert', epoch: 8250, cells: [cell(G1), cell(G1), cell(X), cell(Y, '000')] },
      { type: 'inert', epoch: 8500, cells: [cell(G1), cell(G1), cell(G1), cell(Y), cell(X)] },
    ];
    const fams = families(recs);
    assert.deepStrictEqual(fams.map((f) => f.first), [8250, 8250, 8500], 'G1 i X a la primera; Y, quan és hereditària');
    const dm = dominantFamily(fams, recs[1]);
    assert.strictEqual(dm.family, fams[0]); assert.strictEqual(dm.dominant, true);
    // una pluralitat (2 de 5) no és dominant, com a la part A (AU2-158)
    const Z = rnd(3);
    const plural = { type: 'inert', epoch: 8750, cells: [cell(G1), cell(G1), cell(X), cell(Y), cell(Z)] };
    const fp = families([...recs, plural]);
    const dp = dominantFamily(fp, plural);
    assert.strictEqual(dp.family, fp[0]); assert.strictEqual(dp.dominant, false); assert.strictEqual(dp.share, 0.4);
    // el criteri estricte (la cota inferior de F) i la causa de la censura
    const Ls = (epoch, M, tested, functional) => ({ type: 'lineage', epoch, M, tested, copying: functional, functional, F: Math.round((M * functional) / tested), windows: 1 });
    r = partA([{ type: 'start' }, Ls(8000, 1, 1, 1), Ls(8100, 3000, 256, 140), Ls(8350, 3000, 256, 140), end(8350)], { start: 8000, horizon: 1500 });
    assert.strictEqual(r.rootedAt, 8100); assert.strictEqual(r.rootedStrictAt, 8100);
    r = partA([{ type: 'start' }, Ls(8000, 1, 1, 1), Ls(8100, 3000, 256, 115), Ls(8350, 3000, 256, 115), end(8350)], { start: 8000, horizon: 1500 });
    assert.strictEqual(r.rootedAt, 8100); assert.strictEqual(r.rootedStrictAt, null, 'F = 1.348, però la cota inferior és per sota de 1.311');
    r = partA([{ type: 'start' }, L(8000, 1), L(8050, 40), { type: 'end', epoch: 8750, reason: 'establiment' }], { start: 8000, horizon: 1500 });
    assert.strictEqual(r.outcome, 'censurada'); assert.strictEqual(r.censor, 'establiment');
    // Mantel i Haenszel, el bootstrap i la lectura
    assert.strictEqual(mh([{ a: 2, n1: 4, b: 1, n0: 4 }, { a: 1, n1: 4, b: 1, n0: 4 }]), 1.5);
    assert.strictEqual(mh([{ a: 2, n1: 4, b: 0, n0: 4 }]), null);
    const worlds = [[1], [2], [3], [4]];
    assert.deepStrictEqual(bootstrap(worlds, (s) => s.flat().reduce((a, b) => a + b, 0), { count: 500 }), bootstrap(worlds, (s) => s.flat().reduce((a, b) => a + b, 0), { count: 500 }));
    // la lectura, amb els sis casos i la regla de la precisió (AUD-190, AU2-164)
    assert.match(reading([1.3, 1.9], 1.6), /compatible amb el de l'establiment \(1.6\) i no amb 1/);
    assert.match(reading([1.1, 1.4], 1.6), /entre 1 i el de l'establiment \(1.6\)/);
    assert.match(reading([1.2, 1.9], 2.05), /entre 1 i el de l'establiment \(2.05\)/);
    assert.match(reading([1.7, 2.6], 1.6), /per sobre del de l'establiment/);
    assert.match(reading([0.6, 0.9], 1.6), /per sota d'1/);
    assert.match(reading([0.85, 1.3], 1.6), /compatible amb 1 i no amb el de l'establiment.*No és cap prova/);
    assert.match(reading([1.0, 1.6], 1.6), /no discrimina/);
    assert.match(reading([0.8, 2.0], 1.6), /inconcloent: l'interval és massa ample/);
    // per a λdet, una classificació numèrica, sense cap mecanisme (AU2-174)
    for (const ci of [[1.3, 1.9], [1.1, 1.4], [0.85, 1.3], [0.6, 0.9], [1.7, 2.6], [1.0, 1.6]]) {
      const t = reading(ci, 1.6, { quantity: 'λ' });
      assert.match(t, /no identifica ni atribueix cap mecanisme/);
      assert.doesNotMatch(t, /explica|hauria de venir|aparició|arrelament/, t);
    }
    assert.match(reading([1.3, 1.9], 1.6, { quantity: 'λ' }), /^compatible amb el de l'establiment \(1.6\) i no amb 1/);
    assert.match(reading([1.1, 1.4], 1.6, { quantity: 'λ' }), /^entre 1 i el de l'establiment/);
    assert.match(reading([0.8, 2.0], 1.6, { quantity: 'λ' }), /^inconcloent/);
    // l'extinció dins de H: el primer zero hi ha de ser (AU2-173); després, és una censura a H
    r = partA([{ type: 'start' }, L(8000, 1), L(9550, 0), L(9600, 0), { type: 'end', epoch: 9600, reason: 'extinció' }], { start: 8000, horizon: 1500 });
    assert.strictEqual(r.extinctAt, 9550); assert.strictEqual(r.outcome, 'censurada'); assert.strictEqual(r.censor, 'horitzó');
    r = partA([{ type: 'start' }, L(8000, 1), L(9500, 0), L(9550, 0), { type: 'end', epoch: 9550, reason: 'extinció' }], { start: 8000, horizon: 1500 });
    assert.strictEqual(r.outcome, "s'extingeix");
    // el seguiment de la consistència: la mateixa regla a les dues parts (AUD-199 = AU2-172)
    const fu = (detected, event, dominant, lastObservable) => followUpClass({ detected, event, dominant, lastObservable });
    assert.strictEqual(fu(8250, 9500, true, 9500), 'arrela', 'detectat a la primera, establert a la 9.500: dins de les 1.250');
    assert.strictEqual(fu(8250, 9500, false, 9500), 'competidor');
    assert.strictEqual(fu(8250, null, false, 9500), 'no arrela', 'seguit tota la finestra');
    assert.strictEqual(fu(8500, null, false, 9500), 'censurada', 'detectat tard i sense establiment: no entra, ni a la A ni a la B');
    assert.strictEqual(fu(15350, null, false, 15750), 'censurada', 'el contraexemple de l\'auditor 2, a la part B');
    assert.strictEqual(fu(9350, null, false, 9500), 'censurada', 'el contraexemple de l\'auditor 2, a la part A');
    assert.strictEqual(fu(8500, 9400, true, 9500), 'arrela');
    assert.strictEqual(fu(8250, 9750, true, 9750), 'no arrela', 'establert després de la finestra');
    // les famílies unides en cadena (AUD-200): C s'uneix a B, i B a A; A és la dominant, i totes tres hi compten
    const chain = [{ id: 'A' }, { id: 'B', mergedInto: 'A' }, { id: 'C', mergedInto: 'B' }, { id: 'D' }];
    assert.deepStrictEqual([...rootedFamilies(chain, { family: chain[0], dominant: true })].sort(), ['A', 'B', 'C']);
    assert.strictEqual(rootedFamilies(chain, { family: chain[0], dominant: false }).size, 0);
    // «de partida» i «emparentada» (AUD-201): els programes de la primera detecció contra les cel·les hereditàries del punt de partida
    const winOf = (...hexes) => { const w = new Windows(); for (const h of hexes) w.addProgram(inert.fromHex(h)); return w; };
    const fam = (first, later = []) => ({ programs: [first], bytes: [first, ...later].map((h) => inert.fromHex(h)) });
    assert.deepStrictEqual(startingFlags(fam(G1), { heritableStart: winOf(G1), related: winOf(G1) }), { preexisting: true, related: true });
    assert.deepStrictEqual(startingFlags(fam(G1), { heritableStart: winOf(), related: winOf(G1) }), { preexisting: false, related: true },
      'emparentada amb una cel·la que es copiava sense ser hereditària: no hi era');
    assert.deepStrictEqual(startingFlags(fam(X, [G1]), { heritableStart: winOf(G1), related: winOf(G1) }), { preexisting: false, related: true },
      'la primera detecció no comparteix res amb el punt de partida; un cens posterior, sí');
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
      assert.ok(a[0].plant && a.some((l) => l.type === 'lineage'), 'la branca de la part A no té la sembra o el llinatge');
      assert.strictEqual(a.filter((l) => l.type === 'inert').length, a.filter((l) => l.type === 'census').length, 'cada cens, amb el seu cens inert');
      // ara la part A ha començat
      assert.ok(preflight(d, { root }).some((x) => /ja ha començat/.test(x)));
      assert.deepStrictEqual(checkManifest(d, { root }), []);
      // l'anàlisi, només amb el pilot sencer
      let text = [];
      assert.strictEqual(analyse(d, { root, out: (l) => text.push(l), count: 100 }).ok, false);
      assert.match(text.join('\n'), /No s'analitza res/);
      // totes les branques, 8 alhora, i l'anàlisi sencera
      const all = ['llista-a-pc.txt', 'llista-a-vm.txt', 'llista-b-pc.txt', 'llista-b-vm.txt'].flatMap((f) => readFileSync(join(abs, f), 'utf8').trim().split('\n').filter(Boolean))
        .filter((l) => !existsSync(join(abs, l.includes('--plant') ? 'part-a' : 'part-b', `${l.split(' ')[0]}.jsonl`)));
      await new Promise((resolve, reject) => {
        let next = 0, running = 0, done = 0;
        const go = () => {
          if (done === all.length) return resolve();
          while (running < 8 && next < all.length) {
            const [, ...args] = all[next++].split(' ');
            running++;
            const c = spawn(process.execPath, ['sim.mjs', ...args], { cwd: root, stdio: 'ignore' });
            c.on('close', (code) => { running--; done++; if (code) return reject(new Error(`una branca ha sortit amb el codi ${code}`)); go(); });
          }
        };
        go();
      });
      text = [];
      const res = analyse(d, { root, out: (l) => text.push(l), count: 200 });
      const t = text.join('\n');
      assert.ok(res.ok, t.slice(0, 2000));
      for (const s of ['1. pR', '2. El contrast principal', '3. λdet', '4. La consistència', '5. La lectura', '6. Els descriptius']) assert.ok(t.includes(s), `falta la secció ${s}`);
      // els dos llindars amb i sense les de partida i les emparentades, i la calibració del detector (AU2-175); els competidors (AU2-172)
      for (const s of ['robustes, sense les de partida', 'en alguna, sense les emparentades', 'La calibració del detector', 'per llinatge:', 'competidor ', 'censurades ', 'amb els competidors com a fracassos']) assert.ok(t.includes(s), `falta «${s}»`);
      assert.ok(Object.keys(res.main).includes('continue') && Object.keys(res.main).includes('λ shuffle-all robustes'), 'falten els quocients de λdet');
      // l'anàlisi és determinista
      const again = [];
      analyse(d, { root, out: (l) => again.push(l), count: 200 });
      assert.strictEqual(again.join('\n'), t);
      // un registre d'un altre commit que el del manifest (AU2-162)
      const one = join(abs, 'part-a', `${lines[0].split(' ')[0]}.jsonl`);
      const saved = readFileSync(one, 'utf8');
      const ls = saved.trim().split('\n'); const st = JSON.parse(ls[0]); st.code = 'cafefee'; ls[0] = JSON.stringify(st);
      writeFileSync(one, ls.join('\n') + '\n');
      text = [];
      assert.strictEqual(analyse(d, { root, out: (l) => text.push(l), count: 50 }).ok, false);
      assert.match(text.join('\n'), /és de cafefee, i el manifest, de/);
      writeFileSync(one, saved);
      // el manifest, contra el disseny (AU2-170): una branca de menys, una de repetida, una de més; cap anàlisi
      const mfile = join(abs, 'manifest.json'), msaved = readFileSync(mfile, 'utf8');
      const refuse = (mutate, re) => {
        const mj = JSON.parse(msaved); mutate(mj); writeFileSync(mfile, JSON.stringify(mj, null, 1) + '\n');
        const out = [], rr = analyse(d, { root, out: (l) => out.push(l), count: 20 });
        writeFileSync(mfile, msaved);
        assert.strictEqual(rr.ok, false, `s'analitza amb ${re}`);
        assert.match(out.join('\n'), re);
      };
      refuse((mj) => { mj.branches.splice(5, 1); }, /hi falten 1 branques del disseny/);
      refuse((mj) => { mj.branches.push(mj.branches[0]); }, /branques repetides/);
      refuse((mj) => { mj.branches.push({ ...mj.branches[0], id: 'x-continue-G1-p1' }); }, /1 branques que no són del disseny/);
      refuse((mj) => { const b = mj.branches.find((x) => x.part === 'A'); b.seed++; }, /«seed» no és el del disseny/);
      // els escanejos inerts del punt de partida (AU2-171 = AUD-202): que hi siguin, amb la SHA-256 del manifest i la llista de les que es
      // copien
      const w0 = JSON.parse(msaved).worlds.find((w) => w.included), scanFile = join(root, w0.arms.continue.inertScan.file);
      const ssaved = readFileSync(scanFile, 'utf8');
      rmSync(scanFile);
      text = [];
      assert.strictEqual(analyse(d, { root, out: (l) => text.push(l), count: 20 }).ok, false);
      assert.match(text.join('\n'), /no hi ha l'escaneig inert del punt de partida/);
      const sj = JSON.parse(ssaved); delete sj.copiers; writeFileSync(scanFile, JSON.stringify(sj) + '\n');
      text = [];
      assert.strictEqual(analyse(d, { root, out: (l) => text.push(l), count: 20 }).ok, false);
      assert.match(text.join('\n'), /l'escaneig inert del punt de partida no té la SHA-256 del manifest/);
      refuse((mj) => { mj.worlds.find((w) => w.world === w0.world).arms.continue.inertScan.sha256 = createHash('sha256').update(readFileSync(scanFile)).digest('hex'); },
        /no porta la llista de les cel·les que es copien/);
      writeFileSync(scanFile, ssaved);
      assert.ok(analyse(d, { root, out: () => {}, count: 20 }).ok, 'amb tot restaurat, s\'analitza');
      // una sembra o una llista tocades són un problema
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
