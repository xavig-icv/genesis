// Proves de les químiques de B1 (fase1/bff.js, docs/pla-b1.md, §2):
//   - C0 és evaluate, la mateixa funció, i una química desconeguda és un error;
//   - cada regla, amb una cinta feta a mà;
//   - cada química, contra una versió de referència lenta i directa, amb les mateixes regles, en cintes a l'atzar;
//   - la prova de replicació amb la química (AUD-65): els replicadors reals són hereditaris amb C0 i no amb K0, i amb cada
//     química la prova dona el mateix amb el seu intèrpret que amb el de referència. Sense l'opció, és la de sempre.
// Executa: node test/quimiques.mjs
import assert from 'assert';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { evaluate, evaluator, CHEMISTRIES, TAPE_SIZE, PROGRAM_SIZE, MAX_STEPS } from '../fase1/bff.js';
import { createRng, makeRng } from '../fase1/soup.js';
import { replicationTest } from '../fase2/replication.js';

const NAMES = Object.keys(CHEMISTRIES);
function tape(code, fill = 1) {
  const t = new Uint8Array(TAPE_SIZE).fill(fill); // 1 = byte de dades (no fa res)
  for (let i = 0; i < code.length; i++) t[i] = code.charCodeAt(i);
  return t;
}
const run = (name, t, maxSteps = MAX_STEPS) => evaluator(name)(t, 0, maxSteps);

// La versió de referència de fase1/test-bff.mjs (adaptada de bff.inc.h de cubff, Copyright 2024 Google LLC, llicència
// Apache 2.0; vegeu NOTICE), amb les regles d'una química, escrites tal com les diu docs/pla-b1.md: una instrucció ablada és
// un byte de dades; una escriptura bloquejada, o una còpia que llegeix de l'altra meitat, compta però no fa res
function referenceEvaluate(t, maxSteps, chemistry) {
  const nop = chemistry.nop ?? '', block = chemistry.block ?? null;
  const halfOf = (p) => (p < PROGRAM_SIZE ? 0 : 1);
  const writable = (p, pc) => {
    if (block === 'pc-half') return halfOf(p) !== halfOf(pc);
    if (block === 'other-half') return halfOf(p) === halfOf(pc);
    if (block === 'first') return p >= PROGRAM_SIZE;
    if (block === 'second') return p < PROGRAM_SIZE;
    return true;
  };
  const readable = (p, pc) => chemistry.noReadOther !== true || halfOf(p) === halfOf(pc);
  let pc = 0, h0 = 0, h1 = chemistry.h1 ?? 0, ops = 0;
  for (let step = 0; step < maxSteps; step++) {
    h0 &= TAPE_SIZE - 1; h1 &= TAPE_SIZE - 1;
    let c = String.fromCharCode(t[pc]);
    if (nop.includes(c)) c = 'x'; // ablada: un byte de dades
    if ('<>{}-+.,[]'.includes(c)) ops++;
    if (c === '<') h0--;
    else if (c === '>') h0++;
    else if (c === '{') h1--;
    else if (c === '}') h1++;
    else if (c === '-') { if (writable(h0, pc)) t[h0]--; }
    else if (c === '+') { if (writable(h0, pc)) t[h0]++; }
    else if (c === '.') { if (writable(h1, pc) && readable(h0, pc)) t[h1] = t[h0]; }
    else if (c === ',') { if (writable(h0, pc) && readable(h1, pc)) t[h0] = t[h1]; }
    else if (c === '[' && t[h0] === 0) {
      let d = 1; pc++;
      for (; pc < TAPE_SIZE; pc++) { if (t[pc] === 91) d++; if (t[pc] === 93 && --d === 0) break; }
      if (pc === TAPE_SIZE) return ops;
    } else if (c === ']' && t[h0] !== 0) {
      let d = 1; pc--;
      for (; pc >= 0; pc--) { if (t[pc] === 93) d++; if (t[pc] === 91 && --d === 0) break; }
      if (pc < 0) return ops;
    }
    pc++;
    if (pc >= TAPE_SIZE) return ops;
  }
  return ops;
}

// Els replicadors reals de fase2/test-world.mjs: el de la Fase 1, el palíndrom espaiat i el successor immune
const REPLICATOR = Uint8Array.from([140,221,0,221,20,164,126,32,105,126,78,173,241,242,207,220,199,45,213,101,52,91,155,79,44,60,2,125,93,71,65,217,65,5,71,141,93,141,15,5,65,217,15,71,93,125,2,60,44,79,155,91,52,101,213,45,0,0,62,82,0,77,77,0]);
const SPARSE = Uint8Array.from([94,94,251,91,78,198,39,237,82,55,89,53,123,232,163,46,62,181,38,253,255,31,255,23,119,154,94,34,181,93,93,79,34,94,154,40,160,18,170,255,119,107,181,62,46,163,232,123,15,89,55,143,237,117,198,78,91,251,222,94,250,168,50,50]);
const IMMUNE = Uint8Array.from([239,241,90,60,255,192,45,111,101,255,2,241,255,255,241,52,91,255,106,91,155,79,44,60,2,125,93,71,71,217,45,5,71,141,93,141,71,5,45,217,71,71,93,125,2,60,44,79,155,91,106,255,91,52,241,2,255,101,111,45,192,52,255,60]);
// Una sopa barrejada amb el programa a la cel·la 0 i 8 programes de soroll, com la del nivell 1 (docs/pla-b1.md, §4)
function mixedSoup(program, seed) {
  const rng = makeRng(seed, 'v2'), soup = new Uint8Array(PROGRAM_SIZE * 9);
  soup.set(program, 0);
  for (let i = PROGRAM_SIZE; i < soup.length; i++) soup[i] = (rng() * 256) | 0;
  return soup;
}

const tests = {
  'C0 és evaluate, la mateixa funció, i una química desconeguda és un error'() {
    assert.strictEqual(evaluator('C0'), evaluate);
    assert.deepStrictEqual(NAMES, ['C0', 'K0', 'L0', 'S4', 'K1', 'K2', 'R0', 'S1', 'S2', 'S3', 'X1', 'H64']);
    for (const bad of ['c0', 'K9', 'toString', '__proto__', '']) assert.throws(() => evaluator(bad), /química desconeguda/);
  },
  "les instruccions ablades no fan res, no compten i consumeixen el pas (K0, K1, K2, R0 i L0)"() {
    let t = tape('}}}.');
    assert.strictEqual(run('C0', t), 4);
    assert.strictEqual(t[3], '}'.charCodeAt(0));
    for (const name of ['K0', 'K1']) {
      t = tape('}}}.');
      assert.strictEqual(run(name, t), 3, name);
      assert.strictEqual(t[3], '.'.charCodeAt(0), name);
    }
    t = tape('}}},');
    assert.strictEqual(run('K2', t), 3);
    assert.strictEqual(t[0], '}'.charCodeAt(0));
    t = tape('}}},');
    run('K1', t);
    assert.strictEqual(t[0], ','.charCodeAt(0), "amb K1, ',' copia");
    t = tape('+');
    assert.strictEqual(run('R0', t), 0);
    assert.strictEqual(t[0], '+'.charCodeAt(0));
    // sense bucles, '[]' són dades: el programa s'acaba, en lloc d'arribar al límit de passos
    assert.strictEqual(run('C0', tape('[]')), MAX_STEPS);
    assert.strictEqual(run('L0', tape('[]')), 0);
    // el pas: amb un límit de 2 passos, el '.' ablat de '..+' n'és un, i el '+' no arriba a executar-se
    t = tape('..+');
    assert.strictEqual(run('K1', t, 2), 0);
    assert.strictEqual(t[0], '.'.charCodeAt(0));
  },
  "les escriptures bloquejades no canvien la cinta, però compten (S1, S2, S3 i S4)"() {
    // '+' a la posició 0, amb el punter a la mateixa meitat
    for (const [name, changed] of [['C0', true], ['S1', false], ['S2', false], ['S3', true], ['S4', true]]) {
      const t = tape('+');
      assert.strictEqual(run(name, t), 1, name);
      assert.strictEqual(t[0], changed ? 44 : 43, name);
    }
    // '.' a la posició 127, des de la primera meitat. Si s'hi escriu, el punter hi troba el '{' copiat, i també s'executa
    for (const [name, changed] of [['C0', true], ['S1', true], ['S2', true], ['S3', false], ['S4', false]]) {
      const t = tape('{.');
      assert.strictEqual(run(name, t), changed ? 3 : 2, name);
      assert.strictEqual(t[TAPE_SIZE - 1], changed ? '{'.charCodeAt(0) : 1, name);
    }
    // un bucle que s'acaba reescrivint-se: el '+' converteix el '[' en '\', i el ']' ja no hi troba la parella. Amb el primer
    // programa intocable, el bucle arriba al límit de passos
    let t = tape('[+]');
    assert.strictEqual(run('C0', t), 3);
    assert.strictEqual(t[0], 92);
    t = tape('[+]');
    assert.strictEqual(run('S2', t), MAX_STEPS);
    assert.strictEqual(t[0], '['.charCodeAt(0));
  },
  "X1: una còpia que llegeix de l'altra meitat no fa res, i H64: h1 comença a 64"() {
    // '.' llegeix h0 = 127, de l'altra meitat que el punter
    let t = tape('<.');
    t[TAPE_SIZE - 1] = 7;
    assert.strictEqual(run('X1', t), 2);
    assert.strictEqual(t[0], '<'.charCodeAt(0));
    t = tape('<.');
    t[TAPE_SIZE - 1] = 7;
    run('C0', t);
    assert.strictEqual(t[0], 7);
    // llegir de la mateixa meitat sí que es pot
    t = tape('{.');
    run('X1', t);
    assert.strictEqual(t[TAPE_SIZE - 1], '{'.charCodeAt(0));
    // ',' llegeix h1 = 127
    t = tape('{,');
    t[TAPE_SIZE - 1] = 9;
    run('X1', t);
    assert.strictEqual(t[0], '{'.charCodeAt(0));
    t = tape('.');
    run('H64', t);
    assert.strictEqual(t[PROGRAM_SIZE], '.'.charCodeAt(0));
    t = tape('.');
    run('C0', t);
    assert.strictEqual(t[PROGRAM_SIZE], 1);
  },
  "cada química coincideix amb la versió de referència (10.000 cintes cadascuna)"() {
    const ops = '<>{}-+.,[]';
    for (const name of NAMES) {
      const rng = createRng(4200 + NAMES.indexOf(name)), ev = evaluator(name);
      for (let n = 0; n < 10000; n++) {
        const a = new Uint8Array(TAPE_SIZE);
        // barreja de bytes aleatoris i instruccions, perquè hi hagi bucles de veritat (com a fase1/test-bff.mjs)
        const density = rng();
        for (let i = 0; i < TAPE_SIZE; i++) {
          const r = rng();
          a[i] = r < density ? ops.charCodeAt((rng() * 10) | 0) : r < density + 0.05 ? 0 : (rng() * 256) | 0;
        }
        const b = a.slice();
        const maxSteps = n % 2 ? MAX_STEPS : 1 + ((rng() * 300) | 0);
        assert.strictEqual(ev(a, 0, maxSteps), referenceEvaluate(b, maxSteps, CHEMISTRIES[name]), `${name}: ops diferents a la cinta ${n}`);
        assert.deepStrictEqual(a, b, `${name}: cinta diferent a la cinta ${n}`);
      }
    }
  },
  "l'intèrpret d'una química fa servir la cinta a partir de base, com evaluate"() {
    for (const name of NAMES) {
      const buf = new Uint8Array(TAPE_SIZE * 2).fill(1);
      buf.set(tape('}}}.+'), TAPE_SIZE);
      const alone = tape('}}}.+');
      assert.strictEqual(evaluator(name)(buf, TAPE_SIZE), evaluator(name)(alone, 0), name);
      assert.deepStrictEqual(buf.subarray(TAPE_SIZE), alone, name);
      assert.ok(buf.subarray(0, TAPE_SIZE).every((v) => v === 1), name);
    }
  },
  "AUD-65: els replicadors reals són hereditaris amb C0 i no amb K0, a la sopa del nivell 1"() {
    for (const [what, program] of [['Fase 1', REPLICATOR], ['espaiat', SPARSE], ['immune', IMMUNE]]) {
      const soup = mixedSoup(program, 7);
      const c0 = replicationTest(soup, 0, makeRng(8, 'v2'), { heredity: true, evaluate: evaluator('C0') });
      assert.ok(c0.heritable, `${what}, C0: ${JSON.stringify(c0)}`);
      const k0 = replicationTest(soup, 0, makeRng(8, 'v2'), { heredity: true, evaluate: evaluator('K0') });
      assert.ok(!k0.solo && !k0.context && !k0.heritable, `${what}, K0: ${JSON.stringify(k0)}`);
    }
  },
  "AUD-65: amb cada química, la prova de replicació dona el mateix amb el seu intèrpret que amb el de referència"() {
    // els tres replicadors i 60 programes a l'atzar, amb la meitat dels bytes instruccions
    const ops = '<>{}-+.,[]', rng = createRng(65), programs = [REPLICATOR, SPARSE, IMMUNE];
    for (let k = 0; k < 60; k++) programs.push(Uint8Array.from({ length: PROGRAM_SIZE }, () => (rng() < 0.5 ? ops.charCodeAt((rng() * 10) | 0) : (rng() * 256) | 0)));
    for (const name of NAMES) {
      const reference = (t, base, maxSteps = MAX_STEPS) => { assert.strictEqual(base, 0); return referenceEvaluate(t, maxSteps, CHEMISTRIES[name]); };
      programs.forEach((program, k) => {
        const soup = mixedSoup(program, 100 + k);
        const a = replicationTest(soup, 0, makeRng(200 + k, 'v2'), { heredity: true, evaluate: evaluator(name) });
        const b = replicationTest(soup, 0, makeRng(200 + k, 'v2'), { heredity: true, evaluate: reference });
        assert.deepStrictEqual(a, b, `${name}, programa ${k}`);
      });
    }
  },
  "sense l'opció, la prova de replicació és la de sempre (l'esclat, 64 cel·les)"() {
    const soup = new Uint8Array(readFileSync(fileURLToPath(new URL('fixtures/esclat-32x32.bin', import.meta.url))));
    for (let c = 0; c < 64; c++) {
      const a = replicationTest(soup, c * 16, makeRng(c, 'v2'), { width: 32, heredity: true });
      const b = replicationTest(soup, c * 16, makeRng(c, 'v2'), { width: 32, heredity: true, evaluate });
      assert.deepStrictEqual(a, b, `cel·la ${c * 16}`);
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
