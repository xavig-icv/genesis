// Proves del món 2D. Executa: node fase2/test-world.mjs
import assert from 'assert';
import { pairNeighbors, applyCurrents, applyFlow } from './world.js';
import { createFamilyTracker } from './families.js';
import { replicationTest } from './replication.js';
import { createCensus, establishment } from './census.js';
import { spawnSync } from 'child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { createRng, makeRng, shuffle, randomSoup } from '../fase1/soup.js';
import { KIND } from '../fase1/bff.js';

// El replicador real de la Fase 1 (llavor 1, programa núm. 7 a l'època 301).
const REPLICATOR = Uint8Array.from([140,221,0,221,20,164,126,32,105,126,78,173,241,242,207,220,199,45,213,101,52,91,155,79,44,60,2,125,93,71,65,217,65,5,71,141,93,141,15,5,65,217,15,71,93,125,2,60,44,79,155,91,52,101,213,45,0,0,62,82,0,77,77,0]);

// El palíndrom espaiat del punt (corrent 0,01, llavor 2, cel·la (179,173) al final):
// ···[········{··.>············]]············>.··{········[·······
const SPARSE = Uint8Array.from([94,94,251,91,78,198,39,237,82,55,89,53,123,232,163,46,62,181,38,253,255,31,255,23,119,154,94,34,181,93,93,79,34,94,154,40,160,18,170,255,119,107,181,62,46,163,232,123,15,89,55,143,237,117,198,78,91,251,222,94,250,168,50,50]);

// L'"enverinador" de l'auditoria 1 (AUD-02): no es replica, només escriu zeros al final del company.
const POISONER = new Uint8Array(64);
for (let i = 0; i < 32; i++) POISONER[1 + i] = '{.'.charCodeAt(i % 2);

// El successor immune de la Fase 1 (llavor 1 amb 7 fils, el programa més abundant a l'època 750):
// converteix en 255 els zeros que enverinaven el seu avantpassat (entrada 2 del quadern).
const IMMUNE = Uint8Array.from([239,241,90,60,255,192,45,111,101,255,2,241,255,255,241,52,91,255,106,91,155,79,44,60,2,125,93,71,71,217,45,5,71,141,93,141,71,5,45,217,71,71,93,125,2,60,44,79,155,91,106,255,91,52,241,2,255,101,111,45,192,52,255,60]);

// Un "copiador parcial" (AUD-33 de l'auditoria 2, AU2-02 de l'auditoria externa 2): 24 bytes de dades
// diferents, un zero i el bucle {[.>{], que copia les dades (al revés) al final del company. Passa la
// prova de replicació, però el que copia no és el codi que copia: la còpia no es pot tornar a copiar.
const PARTIAL = new Uint8Array(64);
for (let i = 0; i < 24; i++) PARTIAL[i] = 1 + i;
for (let i = 0; i < 6; i++) PARTIAL[25 + i] = '{[.>{]'.charCodeAt(i);

const fixture = (name) => new Uint8Array(readFileSync(fileURLToPath(new URL(`../test/fixtures/${name}`, import.meta.url))));

// Un món aleatori amb `program` plantat a una fracció `share` de les cel·les.
function plantedWorld(n, program, share, seed) {
  const rng = createRng(seed);
  const soup = randomSoup(n, rng);
  for (let c = 0; c < n; c++) if (rng() < share) soup.set(program, c * 64);
  return soup;
}

// El cas dels trossos informatius (AUD-162): el 5 % de cel·les, amb el replicador amb una tirada de [ als sis primers bytes
// (eren dades, i amb el cap 0 a sobre d'un byte que no és zero, els [ no fan res: es continua replicant), i el 20 %,
// inertes, amb la tirada als bytes 20 a 25. Al codi compacte, el primer tros del replicador és [[[[[[
function runWorld() {
  const n = 4096, rng = createRng(40), soup = randomSoup(n, rng), runner = REPLICATOR.slice();
  runner.fill('['.charCodeAt(0), 0, 6);
  let real = 0, inert = 0;
  for (let c = 0; c < n; c++) {
    const u = rng();
    if (u < 0.05) { soup.set(runner, c * 64); real++; } else if (u < 0.25) { soup.fill('['.charCodeAt(0), c * 64 + 20, c * 64 + 26); inert++; }
  }
  return { soup, n, real, inert };
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
  'amb minDistinct 3, una tirada d\'una sola instrucció no fa territori; per defecte, sí, com sempre (AUD-162)'() {
    const { soup, n, real, inert } = runWorld();
    const old = createFamilyTracker().analyse(soup, n, 100), one = createFamilyTracker(undefined, { minDistinct: 1 }).analyse(soup, n, 100);
    const three = createFamilyTracker(undefined, { minDistinct: 3 }).analyse(soup, n, 100);
    // per defecte, el d'ara: el nucli és la tirada, i el territori, els replicadors i les inertes
    assert.deepStrictEqual(one, old, 'minDistinct 1 és el valor per defecte');
    assert.strictEqual(old.families.length, 1);
    assert.strictEqual(old.families[0].core, '[[[[[[');
    assert.strictEqual(old.families[0].share, (real + inert) / n);
    // amb 3, el nucli té 3 instruccions diferents, i el territori són exactament els replicadors
    assert.strictEqual(three.families.length, 1);
    assert.ok(new Set(three.families[0].core).size >= 3, three.families[0].core);
    assert.strictEqual(three.families[0].share, real / n);
    // la mostra i els replicadors no canvien: l'opció no toca el generador aleatori
    assert.strictEqual(three.alive, old.alive);
  },
  'amb minDistinct 3, els nuclis de les famílies dels retalls amb vida tenen 3 instruccions diferents'() {
    for (const name of ['esclat-32x32.bin', 'punt-32x32.bin']) {
      const soup = new Uint8Array(readFileSync(fileURLToPath(new URL(`../test/fixtures/${name}`, import.meta.url))));
      const n = soup.length / 64, r = createFamilyTracker(undefined, { minDistinct: 3 }).analyse(soup, n, 100, 32);
      for (const f of r.families) assert.ok(new Set(f.core).size >= 3, `${name}: ${f.core}`);
      assert.strictEqual(r.alive, createFamilyTracker().analyse(soup, n, 100, 32).alive, name);
    }
  },
  'minDistinct ha de ser un enter de 1 a 5'() {
    for (const bad of [0, 6, 2.5, '3']) assert.throws(() => createFamilyTracker(undefined, { minDistinct: bad }), /minDistinct/);
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
  'els replicadors reals són hereditaris: el de la Fase 1, el palíndrom espaiat i el successor immune'() {
    for (const [name, program, seed] of [['Fase 1', REPLICATOR, 40], ['espaiat', SPARSE, 42], ['immune', IMMUNE, 44]]) {
      const W = 64, n = W * W;
      const soup = plantedWorld(n, program, 0.1, seed);
      const rng = createRng(seed + 1);
      let tested = 0, heritable = 0;
      for (let c = 0; c < n && tested < 100; c++) {
        if (soup.subarray(c * 64, c * 64 + 64).every((v, i) => v === program[i])) {
          tested++;
          if (replicationTest(soup, c, rng, { width: W, heredity: true }).heritable) heritable++;
        }
      }
      assert.ok(heritable / tested > 0.7, `${name}: ${heritable} de ${tested} hereditaris`);
    }
  },
  "AU2-15: l'herència es busca en tots els fills, no només en el primer (cel·la 660 de l'esclat)"() {
    const soup = fixture('esclat-32x32.bin');
    const r = replicationTest(soup, 660, makeRng(661, 'v2'), { width: 32, heredity: true });
    assert.ok(r.context && r.heritable && r.heritableContext && !r.heritableSolo, JSON.stringify(r));
  },
  "AUD-42: envoltat de lectors, un bloc sense instruccions surt hereditari, però només en context"() {
    // Limitació coneguda de la prova en context: el company (un lector) copia el bloc dins seu. Per això
    // el cens separa heritableSolo de heritableContext i el protocol té la sensibilitat de l'herència sola.
    const W = 32, n = W * W;
    const rng = makeRng(77, 'v2');
    const dataByte = () => { let v; do v = (rng() * 256) | 0; while (v === 0 || KIND[v]); return v; };
    const soup = new Uint8Array(n * 64);
    for (let c = 0; c < n; c++) {
      for (let i = 0; i < 64; i++) soup[c * 64 + i] = dataByte();
      if ((c % W) % 5 === 2 && ((c / W) | 0) % 5 === 2) continue; // bloc passiu
      soup[c * 64 + 55] = 0;
      for (let i = 0; i < 6; i++) soup[c * 64 + 56 + i] = '{[,>{]'.charCodeAt(i); // lector
    }
    const r = replicationTest(soup, 2 * W + 2, makeRng(1, 'v2'), { width: W, heredity: true });
    assert.ok(r.heritableContext && !r.heritableSolo && !r.solo, JSON.stringify(r));
    const census = createCensus({ width: W }).run(soup, n, 0);
    assert.strictEqual(census.heritableSolo, 0);
    assert.ok(census.heritableContext > 0.9 * census.sample, `només en context: ${census.heritableContext}`);
  },
  'el copiador parcial es copia, però no és hereditari (AUD-33, AU2-02)'() {
    const W = 64, n = W * W;
    const soup = plantedWorld(n, PARTIAL, 0.2, 46);
    const rng = createRng(47);
    let tested = 0, copies = 0;
    for (let c = 0; c < n && tested < 100; c++) {
      if (soup[c * 64 + 25] !== 123 || soup[c * 64] !== 1) continue;
      tested++;
      const r = replicationTest(soup, c, rng, { width: W, heredity: true });
      if (r.solo || r.context) copies++;
      assert.ok(!r.heritable, `la cel·la ${c} compta com a hereditària`);
    }
    assert.ok(copies / tested > 0.9, `només ${copies} de ${tested} passen la primera generació`);
  },
  "el copiador parcial tampoc no és hereditari envoltat de replicadors reals (en context)"() {
    // En context, el company va primer i també executa codi: un replicador veí no ha de fer que el
    // copiador parcial sembli hereditari
    for (const name of ['punt-32x32.bin', 'esclat-32x32.bin']) {
      const base = fixture(name);
      const rng = createRng(54);
      for (let c = 0; c < 1024; c += 16) {
        const soup = base.slice();
        soup.set(PARTIAL, c * 64);
        assert.ok(!replicationTest(soup, c, rng, { width: 32, heredity: true }).heritable, `${name}, cel·la ${c}`);
      }
    }
  },
  "l'enverinador tampoc no és hereditari"() {
    const W = 64, n = W * W;
    const soup = plantedWorld(n, POISONER, 0.5, 48);
    // La meitat de cel·les són aleatòries, i alguna es pot copiar per casualitat: cap no és hereditària
    const r = createCensus({ width: W }).run(soup, n, 0);
    assert.ok(r.replicating <= 5, `es repliquen ${r.replicating} de ${r.sample}`);
    assert.strictEqual(r.heritable, 0);
  },
  'cens v3: en un món aleatori no hi ha cap replicador hereditari'() {
    const W = 64, n = W * W;
    const r = createCensus({ width: W }).run(randomSoup(n, createRng(50)), n, 0);
    assert.strictEqual(r.sample, 2048);
    assert.strictEqual(r.heritable, 0);
  },
  "cens v3: el replicador que necessita parella és hereditari en context (retall de l'esclat)"() {
    const soup = fixture('esclat-32x32.bin');
    const r = createCensus({ width: 32 }).run(soup, 1024, 0);
    assert.strictEqual(r.solo, 0, 'aquest replicador no es copia sol');
    assert.ok(r.context >= 10, `en context: ${r.context}`);
    assert.ok(r.heritable >= 1 && r.heritable < r.context, `hereditaris: ${r.heritable} de ${r.context}`);
  },
  'cens v3: la mostra són cel·les diferents (AU2-03)'() {
    // Un món on només una cel·la és un replicador: amb una mostra de la meitat del món, el replicador hi
    // surt com a molt una vegada (amb reemplaçament, a vegades hi sortia més)
    const W = 64, n = W * W;
    const soup = randomSoup(n, createRng(52));
    soup.set(REPLICATOR, 1234 * 64);
    const census = createCensus({ width: W, sample: n / 2 });
    for (let k = 0; k < 20; k++) assert.ok(census.run(soup, n, k).heritable <= 1);
  },
  "criteri d'establiment: l'1 % de la mostra en dos censos seguits"() {
    const c = (epoch, heritable, sample = 2048) => ({ epoch, sample, heritable });
    assert.strictEqual(establishment([c(250, 0), c(500, 21), c(750, 30)], 250), 500);
    assert.strictEqual(establishment([c(250, 25), c(500, 3), c(750, 21), c(1000, 21)], 250), 750);
    assert.strictEqual(establishment([c(250, 20), c(500, 20)], 250), null, "20 de 2.048 no arriba a l'1 %");
    assert.strictEqual(establishment([c(250, 0), c(500, 100)], 250), null, "un sol cens no n'hi ha prou");
    assert.strictEqual(establishment([c(250, 10, 1000), c(500, 10, 1000)], 250), 250, "exactament l'1 % compta");
    assert.strictEqual(establishment([], 250), null);
    // AU2-17: dos censos positius amb censos absents entremig no són "seguits"
    assert.strictEqual(establishment([c(250, 21), c(1000, 21)], 250), null, 'hi falten els censos de 500 i 750');
    assert.strictEqual(establishment([c(250, 21), c(1000, 21), c(1250, 21)], 250), 1000);
    assert.throws(() => establishment([c(250, 21)]), /interval/);
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
