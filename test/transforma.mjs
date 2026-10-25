// Proves de l'eina de les alíquotes (eines/transforma.mjs): els invariants de cada transformació, el determinisme,
// l'abast de la intervenció dels zeros, la línia d'ordres, i que el món de sim.mjs fa les mateixes tirades de l'atzar
// sigui quin sigui el contingut de les cel·les (els nombres aleatoris comuns entre braços).
// Executa: node test/transforma.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { KINDS, transform, checkInvariants, replicatingCells } from '../eines/transforma.mjs';
import { PROGRAM_SIZE, TAPE_SIZE, runPairs } from '../fase1/bff.js';
import { makeRng, randomSoup, shuffle, gather, scatter, mutate } from '../fase1/soup.js';
import { pairNeighbors, applyCurrents, applyFlow } from '../fase2/world.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const W = 16, H = 8, N = W * H;
// El replicador de la llavor 1 de la fase 1 (quadern/quadern.js). Només es planta en aquestes proves, mai en un
// experiment.
const REPLICATOR = Uint8Array.from([140, 221, 0, 221, 20, 164, 126, 32, 105, 126, 78, 173, 241, 242, 207, 220, 199, 45, 213, 101, 52, 91, 155, 79, 44, 60, 2, 125, 93, 71, 65, 217, 65, 5, 71, 141, 93, 141, 15, 5, 65, 217, 15, 71, 93, 125, 2, 60, 44, 79, 155, 91, 52, 101, 213, 45, 0, 0, 62, 82, 0, 77, 77, 0]);
// Un món petit amb zeros a les cel·les de soroll (com un món enverinat) i dos replicadors plantats
function world() {
  const soup = randomSoup(N, makeRng(3, 'v2'));
  const rng = makeRng(4, 'v2');
  for (let i = 0; i < soup.length; i++) if (rng() < 0.2) soup[i] = 0;
  soup.set(REPLICATOR, 20 * PROGRAM_SIZE);
  soup.set(REPLICATOR, 90 * PROGRAM_SIZE);
  return soup;
}
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'transf-')); try { fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }

const tests = {
  'cada transformació compleix els seus invariants, i és determinista amb la llavor': () => {
    const soup = world();
    for (const kind of KINDS) {
      const a = transform(soup, kind, 7, { width: W });
      assert.deepStrictEqual(checkInvariants(soup, a.out, a.info), [], kind);
      assert.deepStrictEqual(transform(soup, kind, 7, { width: W }).out, a.out, `${kind} no és determinista`);
      if (kind !== 'continue') assert.ok(a.info.changed > 0, `${kind} no ha canviat res`);
    }
    for (const kind of ['shuffle-programs', 'shuffle-within', 'shuffle-all', 'reinit', 'zeros-data', 'placebo-cell', 'zeros-all', 'control-all']) {
      assert.notDeepStrictEqual(transform(soup, kind, 7, { width: W }).out, transform(soup, kind, 8, { width: W }).out, `${kind} no depèn de la llavor`);
    }
  },
  'el que conserva cada barreja': () => {
    const soup = world();
    const hist = (b) => { const h = new Array(256).fill(0); for (const v of b) h[v]++; return h; };
    const cell = (b, c) => Array.from(b.subarray(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE));
    const all = transform(soup, 'shuffle-all', 1, { width: W }).out;
    assert.deepStrictEqual(hist(all), hist(soup));
    const within = transform(soup, 'shuffle-within', 1, { width: W }).out;
    for (let c = 0; c < N; c++) assert.deepStrictEqual(cell(within, c).sort((a, b) => a - b), cell(soup, c).sort((a, b) => a - b));
    const progs = transform(soup, 'shuffle-programs', 1, { width: W }).out;
    const key = (b) => Array.from({ length: N }, (_, c) => cell(b, c).join(',')).sort();
    assert.deepStrictEqual(key(progs), key(soup));
    assert.notDeepStrictEqual(Array.from(progs), Array.from(soup), 'la permutació ha deixat el món igual');
  },
  'els zeros de fora dels replicadors: canvien tots, i els replicadors no es toquen': () => {
    const soup = world();
    const z = transform(soup, 'zeros-outside', 5, { width: W });
    const mask = z.info.mask;
    assert.strictEqual(mask[20], 1); assert.strictEqual(mask[90], 1);
    assert.deepStrictEqual(Array.from(z.out.subarray(20 * PROGRAM_SIZE, 21 * PROGRAM_SIZE)), Array.from(REPLICATOR), 'el replicador ha canviat');
    for (let c = 0; c < N; c++) if (!mask[c]) assert.ok(!z.out.subarray(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE).includes(0), `queden zeros a la cel·la ${c}`);
    // el control fa servir les mateixes cel·les, i canvia exactament tants bytes no zero com zeros hi havia
    const k = transform(soup, 'control-outside', 5, { width: W });
    assert.deepStrictEqual(k.info.mask, mask);
    assert.strictEqual(k.info.changed, z.info.scope.zeros);
    assert.strictEqual(z.info.changed, z.info.scope.zeros);
    const zeros = (b) => b.reduce((s, v) => s + (v === 0), 0);
    assert.strictEqual(zeros(k.out), zeros(soup), 'el control ha canviat el nombre de zeros');
    // la funció de les cel·les que es repliquen és la mateixa que fa servir la transformació
    assert.deepStrictEqual(replicatingCells(soup, makeRng(5, 'v2'), { width: W }), mask);
  },
  'el comprovador d\'invariants detecta una transformació espatllada': () => {
    const soup = world();
    for (const kind of ['continue', 'shuffle-programs', 'shuffle-within', 'shuffle-all', 'reinit', 'zeros-data', 'placebo-cell', 'zeros-outside', 'control-outside']) {
      const { out, info } = transform(soup, kind, 2, { width: W });
      const bad = Uint8Array.from(out);
      // un byte més de la cel·la del replicador (fora de l'abast dels zeros) passa a valer 0 o 1
      bad[20 * PROGRAM_SIZE + 4] = bad[20 * PROGRAM_SIZE + 4] === 1 ? 2 : 1;
      assert.ok(checkInvariants(soup, bad, info).length > 0, `no detecta l'error a ${kind}`);
    }
    // zeros-data que hi posa una instrucció, i un placebo amb un canvi de menys en una cel·la
    const z = transform(soup, 'zeros-data', 2, { width: W });
    const i = z.out.findIndex((v, k) => v !== soup[k]);
    const badZ = Uint8Array.from(z.out); badZ[i] = 91; // '['
    assert.match(checkInvariants(soup, badZ, z.info).join(' '), /mapa d'instruccions/);
    const pl = transform(soup, 'placebo-cell', 2, { width: W });
    const j = pl.out.findIndex((v, k) => v !== soup[k]);
    const badP = Uint8Array.from(pl.out); badP[j] = soup[j];
    assert.match(checkInvariants(soup, badP, pl.info).join(' '), /placebo-cell ha canviat \d+ bytes a la cel·la/);
  },
  // El braç dels zeros de l'auditoria 15 (AUD-112): els zeros passen a bytes de dades, i el mapa d'instruccions no canvia.
  // El placebo (AU2-78): a cada cel·la, tants bytes de dades com zeros té, també en un mapa advers amb els zeros concentrats.
  'zeros-data i placebo-cell: el mapa d\'instruccions no canvia, i el placebo s\'aparella cel·la per cel·la': () => {
    const soup = world();
    soup.fill(0, 5 * PROGRAM_SIZE, 6 * PROGRAM_SIZE); // una cel·la plena de zeros: cap byte de dades per aparellar
    const isData = (v) => v !== 0 && !'<>{}-+.,[]'.includes(String.fromCharCode(v));
    const isOp = (v) => '<>{}-+.,[]'.includes(String.fromCharCode(v));
    const z = transform(soup, 'zeros-data', 5, { width: W }), pl = transform(soup, 'placebo-cell', 5, { width: W });
    assert.deepStrictEqual(checkInvariants(soup, z.out, z.info), []);
    assert.deepStrictEqual(checkInvariants(soup, pl.out, pl.info), []);
    assert.deepStrictEqual(pl.info.mask, z.info.mask, 'les dues màscares han de ser la mateixa');
    assert.strictEqual(z.info.scope.maskSha256, pl.info.scope.maskSha256);
    for (let k = 0; k < soup.length; k++) {
      assert.strictEqual(isOp(z.out[k]), isOp(soup[k]), 'zeros-data ha canviat el mapa d\'instruccions');
      assert.strictEqual(isOp(pl.out[k]), isOp(soup[k]), 'placebo-cell ha canviat el mapa d\'instruccions');
      if (z.out[k] !== soup[k]) assert.ok(soup[k] === 0 && isData(z.out[k]));
    }
    let shortfall = 0;
    for (let c = 0; c < N; c++) {
      if (z.info.mask[c]) continue;
      const span = (b) => Array.from(b.subarray(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE));
      const zc = span(soup).filter((v) => v === 0).length, dc = span(soup).filter(isData).length;
      const changed = (b) => span(b).filter((v, k) => v !== soup[c * PROGRAM_SIZE + k]).length;
      assert.strictEqual(changed(z.out), zc, `zeros-data, cel·la ${c}`);
      assert.strictEqual(changed(pl.out), Math.min(zc, dc), `placebo-cell, cel·la ${c}`);
      assert.strictEqual(span(pl.out).filter((v) => v === 0).length, zc, 'el placebo ha canviat els zeros');
      shortfall += zc - Math.min(zc, dc);
    }
    assert.ok(shortfall >= 64, 'la cel·la plena de zeros no hi compta');
    assert.strictEqual(pl.info.scope.shortfall, shortfall);
  },
  "l'eina no sobreescriu mai cap fitxer, ni l'entrada (AU2-79)": () => withTmp((tmp) => {
    const from = join(tmp, 'llavor1-mon16x8-r2-final.bin');
    writeFileSync(from, world());
    const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');
    const before = sha(from);
    const run = (...a) => spawnSync(process.execPath, [join(root, 'eines', 'transforma.mjs'), ...a], { encoding: 'utf8' });
    let r = run('--from', from, '--kind', 'shuffle-all', '--seed', '1', '--out', from);
    assert.strictEqual(r.status, 2); assert.match(r.stderr, /ja existeix/);
    assert.strictEqual(sha(from), before, "l'entrada ha canviat");
    r = run('--from', from, '--kind', 'shuffle-all', '--seed', '1', '--out', join(tmp, 'x.bin'));
    assert.strictEqual(r.status, 0, r.stderr);
    const x = sha(join(tmp, 'x.bin'));
    r = run('--from', from, '--kind', 'reinit', '--seed', '2', '--out', join(tmp, 'x.bin'));
    assert.strictEqual(r.status, 2, 'ha sobreescrit una sortida que ja hi era');
    assert.strictEqual(sha(join(tmp, 'x.bin')), x);
    writeFileSync(join(tmp, 'y.json'), '{}');
    r = run('--from', from, '--kind', 'reinit', '--seed', '2', '--out', join(tmp, 'y.bin'));
    assert.strictEqual(r.status, 2, 'ha sobreescrit un registre que ja hi era');
    assert.ok(!existsSync(join(tmp, 'y.bin')));
    assert.strictEqual(sha(from), before, "l'entrada ha canviat");
  }),
  "l'escaneig compta les cel·les que es repliquen i les hereditàries, i no transforma res (AUD-111)": () => withTmp((tmp) => {
    const from = join(tmp, 'llavor1-mon16x8-r2-final.bin');
    writeFileSync(from, world());
    const run = (...a) => spawnSync(process.execPath, [join(root, 'eines', 'transforma.mjs'), ...a], { encoding: 'utf8' });
    let r = run('--scan', '--from', from, '--seed', '3', '--out', join(tmp, 'e.json'));
    assert.strictEqual(r.status, 0, r.stderr);
    const e = JSON.parse(readFileSync(join(tmp, 'e.json'), 'utf8'));
    assert.strictEqual(e.cells, N);
    assert.ok(e.replicating >= 2 && e.heritable >= 1, `els replicadors plantats no surten: ${JSON.stringify(e)}`);
    writeFileSync(join(tmp, 'net.bin'), randomSoup(N, makeRng(11, 'v2')));
    r = run('--scan', '--from', join(tmp, 'net.bin'), '--seed', '3', '--width', '16', '--out', join(tmp, 'f.json'));
    assert.strictEqual(r.status, 0, r.stderr);
    assert.strictEqual(JSON.parse(readFileSync(join(tmp, 'f.json'), 'utf8')).heritable, 0);
    r = run('--scan', '--from', from, '--kind', 'continue', '--seed', '3', '--out', join(tmp, 'g.json'));
    assert.strictEqual(r.status, 2);
  }),
  "la línia d'ordres escriu la captura i el registre, i rebutja les opcions incorrectes": () => withTmp((tmp) => {
    const from = join(tmp, 'llavor1-mon16x8-r2-final.bin');
    writeFileSync(from, world());
    const run = (...a) => spawnSync(process.execPath, [join(root, 'eines', 'transforma.mjs'), ...a], { encoding: 'utf8' });
    const out = join(tmp, 'b.bin');
    let r = run('--from', from, '--kind', 'zeros-outside', '--seed', '5', '--out', out);
    assert.strictEqual(r.status, 0, r.stderr);
    const rec = JSON.parse(readFileSync(join(tmp, 'b.json'), 'utf8'));
    const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');
    assert.strictEqual(rec.outSha256, sha(out));
    assert.strictEqual(rec.fromSha256, sha(from));
    assert.strictEqual(rec.width, 16);
    assert.strictEqual(rec.invariants, 'correctes');
    assert.strictEqual(rec.zeros.after, rec.zeros.before - rec.scope.zeros);
    assert.match(rec.scope.maskSha256, /^[0-9a-f]{64}$/);
    assert.strictEqual(rec.scope.zerosProtected + rec.scope.zeros, rec.zeros.before);
    r = run('--from', from, '--kind', 'barreja', '--seed', '5', '--out', join(tmp, 'c.bin'));
    assert.strictEqual(r.status, 2); assert.ok(!existsSync(join(tmp, 'c.bin')));
    r = run('--from', from, '--kind', 'reinit', '--seed', '-1', '--out', join(tmp, 'c.bin'));
    assert.strictEqual(r.status, 2);
    r = run('--from', from, '--kind', 'reinit', '--seed', '1');
    assert.strictEqual(r.status, 2);
  }),
  // Els nombres aleatoris comuns: amb la mateixa llavor, el món fa les mateixes tirades, i per tant les mateixes
  // parelles i les mateixes mutacions, sigui quin sigui el contingut. La BFF no fa servir l'atzar.
  'el món de sim.mjs fa les mateixes tirades de l\'atzar sigui quin sigui el contingut (amb corrent i sense)': () => {
    const src = readFileSync(join(root, 'sim.mjs'), 'utf8');
    const body = src.slice(src.indexOf('function worldEpoch()'), src.indexOf('\n}\n', src.indexOf('function worldEpoch()')));
    assert.match(body, /applyCurrents\(soup, world\[0\], world\[1\], mixing, diffusion, rng, scratch, pool\);\s*applyFlow\(soup, world\[0\], world\[1\], flow, renewal, rng, flowState\);\s*shuffle\(order, rng\);\s*const nPairs = pairNeighbors\(order, taken, pairIdx, world\[0\], world\[1\], radius, rng\);\s*mutate\(soup, soup\.length, mutation, rng\);\s*gather\(soup, pairIdx, pairs, 0, nPairs\);\s*const ops = runPairs\(pairs, nPairs\);\s*scatter\(soup, pairIdx, pairs, 0, nPairs\);/,
      "worldEpoch de sim.mjs ha canviat: cal tornar a comprovar que l'atzar no depèn del contingut");
    assert.ok(!/rng|random/i.test(readFileSync(join(root, 'fase1', 'bff.js'), 'utf8').replace(/\/\/.*$/gm, '')), 'la BFF fa servir l\'atzar');
    for (const mixing of [0, 0.01]) {
      const trace = (soup) => {
        const base = makeRng(42, 'v2');
        let draws = 0;
        const rng = () => { draws++; return base(); };
        const order = new Uint32Array(N).map((_, i) => i), taken = new Uint8Array(N), pairIdx = new Uint32Array(N);
        const pairs = new Uint8Array((N / 2) * TAPE_SIZE), scratch = new Uint32Array(N * (PROGRAM_SIZE / 4)), pool = new Uint32Array(N);
        const log = [];
        for (let e = 0; e < 30; e++) {
          applyCurrents(soup, W, H, mixing, 0, rng, scratch, pool);
          applyFlow(soup, W, H, 0, 0, rng, { carry: 0 });
          shuffle(order, rng);
          const nPairs = pairNeighbors(order, taken, pairIdx, W, H, 2, rng);
          mutate(soup, soup.length, 0.01, rng);
          gather(soup, pairIdx, pairs, 0, nPairs);
          runPairs(pairs, nPairs);
          scatter(soup, pairIdx, pairs, 0, nPairs);
          log.push(draws, Array.from(pairIdx.subarray(0, 2 * nPairs)).join(','));
        }
        return log;
      };
      const a = world(), b = transform(a, 'shuffle-all', 9, { width: W }).out, c = transform(a, 'reinit', 9, { width: W }).out;
      const ta = trace(Uint8Array.from(a));
      assert.deepStrictEqual(trace(b), ta, `amb corrent ${mixing}, el món barrejat fa altres tirades`);
      assert.deepStrictEqual(trace(c), ta, `amb corrent ${mixing}, el món nou fa altres tirades`);
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
