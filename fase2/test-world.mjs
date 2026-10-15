// Proves del món 2D. Executa: node fase2/test-world.mjs
import assert from 'assert';
import { pairNeighbors, applyCurrents, applyFlow } from './world.js';
import { createFamilyTracker } from './families.js';
import { replicationTest } from './replication.js';
import { spawnSync } from 'child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { createRng, shuffle, randomSoup } from '../fase1/soup.js';

// El replicador real de la Fase 1 (llavor 1, programa núm. 7 a l'època 301).
const REPLICATOR = Uint8Array.from([140,221,0,221,20,164,126,32,105,126,78,173,241,242,207,220,199,45,213,101,52,91,155,79,44,60,2,125,93,71,65,217,65,5,71,141,93,141,15,5,65,217,15,71,93,125,2,60,44,79,155,91,52,101,213,45,0,0,62,82,0,77,77,0]);

// El palíndrom espaiat del punt (corrent 0,01, llavor 2, cel·la (179,173) al final):
// ···[········{··.>············]]············>.··{········[·······
const SPARSE = Uint8Array.from([94,94,251,91,78,198,39,237,82,55,89,53,123,232,163,46,62,181,38,253,255,31,255,23,119,154,94,34,181,93,93,79,34,94,154,40,160,18,170,255,119,107,181,62,46,163,232,123,15,89,55,143,237,117,198,78,91,251,222,94,250,168,50,50]);

// L'"enverinador" de l'auditoria 1 (AUD-02): no es replica, només escriu zeros al final del company.
const POISONER = new Uint8Array(64);
for (let i = 0; i < 32; i++) POISONER[1 + i] = '{.'.charCodeAt(i % 2);

// Un món aleatori amb `program` plantat a una fracció `share` de les cel·les.
function plantedWorld(n, program, share, seed) {
  const rng = createRng(seed);
  const soup = randomSoup(n, rng);
  for (let c = 0; c < n; c++) if (rng() < share) soup.set(program, c * 64);
  return soup;
}

function run(width, height, radius, seed) {
  const n = width * height;
  const order = new Uint32Array(n).map((_, i) => i);
  const rng = createRng(seed);
  shuffle(order, rng);
  const taken = new Uint8Array(n);
  const pairs = new Uint32Array(n);
  const nPairs = pairNeighbors(order, taken, pairs, width, height, radius, rng);
  return { pairs: pairs.subarray(0, 2 * nPairs), nPairs, n };
}

const tests = {
  'les parelles són veïnes, dins del mapa i diferents'() {
    const W = 64, H = 32, R = 2;
    const { pairs, nPairs } = run(W, H, R, 1);
    for (let i = 0; i < nPairs; i++) {
      const p = pairs[2 * i], q = pairs[2 * i + 1];
      assert.notStrictEqual(p, q);
      const dx = Math.abs((p % W) - (q % W)), dy = Math.abs(((p / W) | 0) - ((q / W) | 0));
      assert.ok(dx <= R && dy <= R, `parella massa lluny: ${p} ${q}`);
      assert.ok(q < W * H);
    }
  },
  'cap cel·la no surt en dues parelles'() {
    const { pairs } = run(64, 32, 2, 2);
    assert.strictEqual(new Set(pairs).size, pairs.length);
  },
  'la majoria de cel·les troben parella'() {
    const { nPairs, n } = run(512, 256, 2, 3);
    const share = (2 * nPairs) / n;
    assert.ok(share > 0.6 && share <= 1, `només ${share}`);
  },
  'amb radi 1, els veïns són els 8 del voltant'() {
    const W = 50, H = 50;
    const { pairs, nPairs } = run(W, H, 1, 4);
    for (let i = 0; i < nPairs; i++) {
      const p = pairs[2 * i], q = pairs[2 * i + 1];
      assert.ok(Math.abs((p % W) - (q % W)) <= 1 && Math.abs(((p / W) | 0) - ((q / W) | 0)) <= 1);
    }
  },
  'les cantonades també troben veïns'() {
    // un món de 2×1: l'únic veí possible de cada cel·la és l'altra
    const { pairs, nPairs } = run(2, 1, 2, 5);
    assert.strictEqual(nPairs, 1);
    assert.deepStrictEqual([...pairs].sort(), [0, 1]);
  },
  'mateixa llavor, mateixes parelles'() {
    const a = run(128, 64, 2, 9), b = run(128, 64, 2, 9);
    assert.deepStrictEqual(a.pairs, b.pairs);
  },
  'els corrents no creen ni destrueixen programes'() {
    const W = 64, H = 32, n = W * H;
    const soup = randomSoup(n, createRng(6));
    const programs = (s) => Array.from({ length: n }, (_, c) => Buffer.from(s.subarray(c * 64, c * 64 + 64)).toString('hex')).sort();
    const before = programs(soup);
    const scratch = new Uint32Array(n * 16), pool = new Uint32Array(n);
    applyCurrents(soup, W, H, 0.3, 0.5, createRng(7), scratch, pool);
    assert.deepStrictEqual(programs(soup), before);
  },
  'sense corrents no es mou res ni es fa servir l\'atzar'() {
    const W = 64, H = 32, n = W * H;
    const soup = randomSoup(n, createRng(8));
    const copy = soup.slice();
    let calls = 0;
    const rng = () => { calls++; return 0.5; };
    assert.strictEqual(applyCurrents(soup, W, H, 0, 0, rng, new Uint32Array(n * 16), new Uint32Array(n)), 0);
    assert.deepStrictEqual(soup, copy);
    assert.strictEqual(calls, 0);
  },
  'amb barreja 0,1 el corrent arrossega un 10 % de les cel·les'() {
    const W = 512, H = 256, n = W * H;
    const soup = randomSoup(n, createRng(9));
    const moved = applyCurrents(soup, W, H, 0.1, 0, createRng(10), new Uint32Array(n * 16), new Uint32Array(n));
    assert.ok(Math.abs(moved / n - 0.1) < 0.005, `${moved / n}`);
  },
  'la difusió només intercanvia veïns del costat'() {
    const W = 40, H = 20, n = W * H;
    // cada cel·la porta el seu índex escrit al primer byte (i al segon, per passar de 255)
    const soup = new Uint8Array(n * 64);
    for (let c = 0; c < n; c++) { soup[c * 64] = c & 255; soup[c * 64 + 1] = c >> 8; }
    for (let seed = 0; seed < 200; seed++) {
      const s = soup.slice();
      applyCurrents(s, W, H, 0, 1 / n, createRng(seed), new Uint32Array(n * 16), new Uint32Array(n)); // un sol intercanvi
      const changed = [];
      for (let c = 0; c < n; c++) if ((s[c * 64] | (s[c * 64 + 1] << 8)) !== c) changed.push(c);
      assert.strictEqual(changed.length, 2);
      const [p, q] = changed;
      assert.ok(Math.abs((p % W) - (q % W)) <= 1 && Math.abs(((p / W) | 0) - ((q / W) | 0)) <= 1, `${p} i ${q} no són veïns`);
    }
  },
  'sense flux no es mou res ni es fa servir l\'atzar'() {
    const W = 32, H = 16, n = W * H;
    const soup = randomSoup(n, createRng(20));
    const copy = soup.slice();
    let calls = 0;
    assert.strictEqual(applyFlow(soup, W, H, 0, 0, () => { calls++; return 0.5; }, { carry: 0 }), 0);
    assert.deepStrictEqual(soup, copy);
    assert.strictEqual(calls, 0);
  },
  'el riu desplaça el món una columna i hi entra material nou per l\'esquerra'() {
    const W = 32, H = 16, n = W * H;
    const soup = randomSoup(n, createRng(21));
    const before = soup.slice();
    assert.strictEqual(applyFlow(soup, W, H, 1, 0, createRng(22), { carry: 0 }), 1);
    const cell = (s, x, y) => s.subarray((y * W + x) * 64, (y * W + x + 1) * 64);
    for (let y = 0; y < H; y++) {
      for (let x = 1; x < W; x++) assert.deepStrictEqual(cell(soup, x, y), cell(before, x - 1, y));
      assert.notDeepStrictEqual(cell(soup, 0, y), cell(before, 0, y)); // material nou
    }
  },
  'un riu lent desplaça una columna cada 1/flux èpoques'() {
    const W = 16, H = 4, n = W * H;
    const soup = randomSoup(n, createRng(23));
    const state = { carry: 0 }, rng = createRng(24);
    let shifts = 0;
    for (let e = 0; e < 40; e++) shifts += applyFlow(soup, W, H, 0.1, 0, rng, state);
    assert.strictEqual(shifts, 4);
  },
  'la renovació substitueix la fracció de cel·les indicada'() {
    const W = 512, H = 256, n = W * H;
    const soup = new Uint8Array(n * 64); // tot zeros: el material nou es nota
    applyFlow(soup, W, H, 0, 0.01, createRng(25), { carry: 0 });
    let renewed = 0;
    for (let c = 0; c < n; c++) if (soup.subarray(c * 64, c * 64 + 64).some((v) => v !== 0)) renewed++;
    assert.ok(Math.abs(renewed / n - 0.01) < 0.001, `${renewed / n}`);
  },
  'un replicador real es reconeix com a família'() {
    const n = 4096;
    const soup = plantedWorld(n, REPLICATOR, 0.05, 1);
    const r = createFamilyTracker().analyse(soup, n, 100);
    assert.strictEqual(r.families.length, 1);
    assert.ok(Math.abs(r.families[0].share - 0.05) < 0.015, `territori ${r.families[0].share}`);
    assert.strictEqual(r.families[0].slot, 0);
    assert.ok(r.map.filter((v) => v === 1).length > 0.03 * n);
  },
  'un fragment abundant que no es copia NO és una família'() {
    const n = 4096;
    const runs = new Uint8Array(64).fill(1);
    runs.fill('>'.charCodeAt(0), 20, 40); // ">>>>>>>>>>>>>>>>>>>>": abundant però inert
    const soup = plantedWorld(n, runs, 0.05, 2);
    const r = createFamilyTracker().analyse(soup, n, 100);
    assert.strictEqual(r.families.length, 0);
  },
  'una família que desapareix s\'extingeix i allibera el color'() {
    const n = 4096;
    const tracker = createFamilyTracker();
    tracker.analyse(plantedWorld(n, REPLICATOR, 0.05, 3), n, 100);
    const empty = randomSoup(n, createRng(4));
    let r;
    for (let k = 0; k < 5; k++) r = tracker.analyse(empty, n, 200 + k);
    assert.deepStrictEqual(r.extinct, [1]);
    assert.strictEqual(r.families.length, 0);
  },
  'un replicador espaiat es reconeix (punt cec de la versió 1)'() {
    const n = 4096;
    const soup = plantedWorld(n, SPARSE, 0.05, 12);
    const r = createFamilyTracker().analyse(soup, n, 100);
    assert.strictEqual(r.families.length, 1);
    assert.ok(Math.abs(r.families[0].share - 0.05) < 0.015, `territori ${r.families[0].share}`);
    assert.ok(r.alive > 0.03, `vius a la mostra: ${r.alive}`);
  },
  'la família segueix el replicador quan evoluciona (punt cec de la versió 1)'() {
    const n = 4096;
    const tracker = createFamilyTracker();
    const first = tracker.analyse(plantedWorld(n, REPLICATOR, 0.05, 13), n, 100);
    // una variant: una instrucció de fora del nucli canvia (">" passa a ser "+")
    const variant = REPLICATOR.slice();
    variant[58] = '+'.charCodeAt(0);
    const later = tracker.analyse(plantedWorld(n, variant, 0.05, 14), n, 200);
    assert.strictEqual(later.families.length, 1);
    assert.strictEqual(later.families[0].id, first.families[0].id);
    assert.ok(later.families[0].share > 0.03, `territori ${later.families[0].share}`);
  },
  'el mirall d\'un replicador és de la mateixa família'() {
    const n = 4096;
    const soup = plantedWorld(n, REPLICATOR, 0.04, 15);
    const mirror = REPLICATOR.slice().reverse();
    const rng = createRng(16);
    for (let c = 0; c < n; c++) if (rng() < 0.04) soup.set(mirror, c * 64);
    const r = createFamilyTracker().analyse(soup, n, 100);
    assert.strictEqual(r.families.length, 1);
  },
  'dos replicadors diferents són dues famílies amb colors diferents'() {
    const n = 4096;
    const soup = plantedWorld(n, REPLICATOR, 0.05, 17);
    const rng = createRng(18);
    for (let c = 0; c < n; c++) if (rng() < 0.05) soup.set(SPARSE, c * 64);
    const r = createFamilyTracker().analyse(soup, n, 100);
    assert.strictEqual(r.families.length, 2);
    assert.notStrictEqual(r.families[0].slot, r.families[1].slot);
  },
  'l\'enverinador no és un replicador, ni sol ni en context (AUD-02)'() {
    const W = 64, n = W * W;
    const soup = plantedWorld(n, POISONER, 0.5, 30);
    const rng = createRng(31);
    let tested = 0;
    for (let c = 0; c < n && tested < 200; c++) {
      if (soup[c * 64 + 1] !== '{'.charCodeAt(0)) continue;
      tested++;
      const r = replicationTest(soup, c, rng, { width: W });
      assert.ok(!r.solo && !r.context, `la cel·la ${c} compta com a replicador`);
    }
    assert.strictEqual(createFamilyTracker().analyse(soup, n, 0, W).families.length, 0);
  },
  'un replicador real sí que passa la prova compartida'() {
    const W = 64, n = W * W;
    const soup = plantedWorld(n, REPLICATOR, 0.2, 32);
    const rng = createRng(33);
    let ok = 0, tested = 0;
    for (let c = 0; c < n && tested < 100; c++) {
      if (soup[c * 64 + 17] !== 45 || soup[c * 64 + 21] !== 91) continue; // porta el replicador
      tested++;
      if (replicationTest(soup, c, rng, { width: W }).solo) ok++;
    }
    assert.ok(ok / tested > 0.7, `${ok} de ${tested}`);
  },
  'analitza.mjs fa servir la mateixa prova: 0 % amb l\'enverinador'() {
    const tmp = mkdtempSync(join(tmpdir(), 'claude-origins-'));
    try {
      const file = join(tmp, 'mon64x64-enverinador.bin');
      writeFileSync(file, plantedWorld(64 * 64, POISONER, 0.5, 34));
      const here = fileURLToPath(new URL('.', import.meta.url));
      const r = spawnSync(process.execPath, [join(here, 'analitza.mjs'), file, '300'], { encoding: 'utf8' });
      assert.strictEqual(r.status, 0, r.stderr);
      assert.ok(r.stdout.includes('replicadors a la mostra de 300: 0.0%'), r.stdout);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  },
  'un món aleatori no té cap família'() {
    const n = 8192;
    const r = createFamilyTracker().analyse(randomSoup(n, createRng(19)), n, 100);
    assert.strictEqual(r.families.length, 0);
    assert.strictEqual(r.alive, 0);
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
