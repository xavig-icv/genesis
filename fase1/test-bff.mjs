// Proves de l'intèrpret BFF. Executa: node fase1/test-bff.mjs
import assert from 'assert';
import { evaluate, TAPE_SIZE, MAX_STEPS } from './bff.js';
import { mutate, createRng, randomSoup, shuffle, gather, scatter, xoshiro128ss, createRngV2, makeRng } from './soup.js';
import { topMotifs } from './motifs.js';

function tape(code, fill = 1) {
  const t = new Uint8Array(TAPE_SIZE).fill(fill); // 1 = byte de dades (no fa res)
  for (let i = 0; i < code.length; i++) t[i] = code.charCodeAt(i);
  return t;
}

const tests = {
  'una cinta sense instruccions no fa res'() {
    const t = tape('');
    assert.strictEqual(evaluate(t, 0), 0);
    assert.ok(t.every((b) => b === 1));
  },
  '+ incrementa el byte sota head0'() {
    const t = tape('+'); // head0 = 0 apunta al mateix '+'
    assert.strictEqual(evaluate(t, 0), 1);
    assert.strictEqual(t[0], 44); // '+' (43) + 1 = ',' (44)
  },
  '. copia de head0 a head1'() {
    const t = tape('}}}.');
    assert.strictEqual(evaluate(t, 0), 4);
    assert.strictEqual(t[3], '}'.charCodeAt(0));
  },
  'els caps donen la volta a la cinta'() {
    const t = tape('{.');
    evaluate(t, 0);
    assert.strictEqual(t[TAPE_SIZE - 1], '{'.charCodeAt(0));
  },
  '[ salta el bucle si el byte és 0'() {
    const t = tape('<[+]');
    t[TAPE_SIZE - 1] = 0;
    assert.strictEqual(evaluate(t, 0), 2); // '<' i '[', el '+' no s'executa
    assert.strictEqual(t[TAPE_SIZE - 1], 0);
  },
  '] torna enrere mentre el byte no sigui 0'() {
    // head0 a l'últim byte (valor 3); el bucle el decrementa fins a 0
    const t = tape('<[-]');
    t[TAPE_SIZE - 1] = 3;
    evaluate(t, 0);
    assert.strictEqual(t[TAPE_SIZE - 1], 0);
  },
  'un [ sense parella atura el programa'() {
    const t = tape('<[+');
    t[TAPE_SIZE - 1] = 0;
    assert.strictEqual(evaluate(t, 0), 2);
  },
  'un bucle infinit s\'atura al límit de passos'() {
    const t = tape('[]'); // tape[0] = '[' mai és 0
    assert.strictEqual(evaluate(t, 0), MAX_STEPS);
  },
  'les cintes amb base > 0 són independents'() {
    const buf = new Uint8Array(TAPE_SIZE * 2).fill(1);
    buf.set(tape('+'), TAPE_SIZE);
    evaluate(buf, TAPE_SIZE);
    assert.strictEqual(buf[TAPE_SIZE], 44);
    assert.strictEqual(buf[0], 1);
  },
  'la taxa de mutació és la correcta'() {
    const buf = new Uint8Array(1 << 24);
    const n = mutate(buf, buf.length, 0.00024, createRng(7));
    const expected = buf.length * 0.00024;
    // marge de 4 desviacions típiques (distribució de Poisson)
    assert.ok(Math.abs(n - expected) < 4 * Math.sqrt(expected), `${n} vs ${expected}`);
  },
};

// Versió de referència: lenta però directa, calcada de cubff (bff.inc.h).
function referenceEvaluate(t, maxSteps = MAX_STEPS) {
  let pc = 0, h0 = 0, h1 = 0, ops = 0;
  for (let step = 0; step < maxSteps; step++) {
    h0 &= TAPE_SIZE - 1; h1 &= TAPE_SIZE - 1;
    const c = String.fromCharCode(t[pc]);
    if ('<>{}-+.,[]'.includes(c)) ops++;
    if (c === '<') h0--;
    else if (c === '>') h0++;
    else if (c === '{') h1--;
    else if (c === '}') h1++;
    else if (c === '-') t[h0]--;
    else if (c === '+') t[h0]++;
    else if (c === '.') t[h1] = t[h0];
    else if (c === ',') t[h0] = t[h1];
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

tests['la versió ràpida coincideix amb la de referència (20.000 cintes)'] = () => {
  const rng = createRng(42);
  const ops = '<>{}-+.,[]';
  for (let n = 0; n < 20000; n++) {
    const a = new Uint8Array(TAPE_SIZE);
    // barreja de bytes aleatoris i instruccions, perquè hi hagi bucles de veritat
    const density = rng();
    for (let i = 0; i < TAPE_SIZE; i++) {
      const r = rng();
      a[i] = r < density ? ops.charCodeAt((rng() * 10) | 0) : r < density + 0.05 ? 0 : (rng() * 256) | 0;
    }
    const b = a.slice();
    const maxSteps = n % 2 ? MAX_STEPS : 1 + ((rng() * 300) | 0); // també límits petits
    const opsFast = evaluate(a, 0, maxSteps);
    const opsRef = referenceEvaluate(b, maxSteps);
    assert.strictEqual(opsFast, opsRef, `ops diferents a la cinta ${n}`);
    assert.deepStrictEqual(a, b, `cinta diferent a la cinta ${n}`);
  }
};

tests['RNG v1 (mulberry32) no ha canviat'] = () => {
  const r = createRng(1);
  const first = [r(), r(), r()].map((x) => Math.floor(x * 4294967296));
  assert.deepStrictEqual(first, [2693262067, 11749833, 2265367787]);
};

tests['RNG v2: xoshiro128** dona els valors de referència'] = () => {
  // estat {1, 2, 3, 4}: valors de la implementació de referència de Blackman i Vigna
  const next = xoshiro128ss(1, 2, 3, 4);
  assert.deepStrictEqual([next(), next(), next(), next()], [11520, 0, 5927040, 70819200]);
};

tests['RNG v2: mateixa llavor, mateixa seqüència; llavors veïnes, seqüències sense relació'] = () => {
  const take = (r, k) => Array.from({ length: k }, () => r());
  assert.deepStrictEqual(take(createRngV2(7), 50), take(createRngV2(7), 50));
  // amb mulberry32, la llavor 2 és la llavor 1 desplaçada; amb v2, cap valor de les primeres
  // 10.000 sortides de la llavor 2 no apareix entre les de la llavor 1
  const a = new Set(take(createRngV2(1), 10000));
  const shared = take(createRngV2(2), 10000).filter((x) => a.has(x)).length;
  assert.ok(shared <= 1, `${shared} valors compartits`);
};

tests['RNG v2: distribució uniforme a [0, 1)'] = () => {
  const r = makeRng(123, 'v2');
  const buckets = new Array(10).fill(0);
  const N = 200000;
  for (let i = 0; i < N; i++) {
    const x = r();
    assert.ok(x >= 0 && x < 1);
    buckets[Math.floor(x * 10)]++;
  }
  for (const b of buckets) assert.ok(Math.abs(b - N / 10) < 5 * Math.sqrt(N / 10), `${buckets}`);
};

tests['gather i scatter: cada programa torna al seu lloc'] = () => {
  const rng = createRng(3);
  const n = 64;
  const soup = randomSoup(n, rng);
  const original = soup.slice();
  const perm = new Uint32Array(n).map((_, i) => i);
  shuffle(perm, rng);
  const pairs = new Uint8Array((n / 2) * TAPE_SIZE);
  gather(soup, perm, pairs, 0, n / 2);
  // la cinta 5 ha de ser el programa perm[10] seguit de perm[11]
  assert.deepStrictEqual(pairs.subarray(5 * 128, 5 * 128 + 64), original.subarray(perm[10] * 64, perm[10] * 64 + 64));
  assert.deepStrictEqual(pairs.subarray(5 * 128 + 64, 6 * 128), original.subarray(perm[11] * 64, perm[11] * 64 + 64));
  soup.fill(0);
  scatter(soup, perm, pairs, 0, n / 2);
  assert.deepStrictEqual(soup, original);
};

tests['topMotifs troba un fragment plantat a la meitat dels programes'] = () => {
  const n = 4096;
  const soup = randomSoup(n, createRng(9));
  const motif = '[[{.>]-]<,}+';
  for (let p = 0; p < n; p += 2) {
    const at = p * 64 + (p % 40); // a posicions diferents dins de cada programa
    for (let i = 0; i < motif.length; i++) soup[at + i] = motif.charCodeAt(i);
  }
  const [first] = topMotifs(soup, n);
  assert.strictEqual(String.fromCharCode(...first.bytes), motif);
  assert.ok(Math.abs(first.share - 0.5) < 0.02, `share ${first.share}`);
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
