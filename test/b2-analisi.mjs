// Proves de l'anàlisi exploratòria de B2 (fase2/b2-analisi.mjs), amb branques sintètiques, i de la del pilot
// (eines/b2-pilot.mjs), amb els registres de git, i les funcions de l'exploració de la fragilitat (eines/fragilitat.mjs).
// Executa: node test/b2-analisi.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { readBranch, death, lifespan, signTest, analyse, RULES } from '../fase2/b2-analisi.mjs';
import { pilot } from '../eines/b2-pilot.mjs';
import { mannWhitney, mechanism } from '../eines/fragilitat.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const census = { version: 'v3', every: 250, sample: 2048, seed: 20261016 };

// Una branca sintètica amb el format de sim.mjs --from: els hereditaris de cada cens, de t + 250 a t + 2.000
function branch(file, { group, seed, mixing, t, heritable, replicating = heritable.map((h) => h + 30) }) {
  const tag = group === 'A' ? '' : '-m0.01';
  const records = [{ type: 'start', code: 'abc1234', seed: seed + 100000, mixing, start: t, epochs: t + 2000, every: 100, census,
    from: `fase2/resultats/serie-llei2/${group}/captures/llavor${seed}-mon512x256-r2${tag}-establiment${t}-epoca${t}.bin` }];
  heritable.forEach((h, i) => {
    const epoch = t + 250 * (i + 1);
    records.push({ type: 'census', version: 'v3', epoch, sample: 2048, heritable: h, heritableSolo: h, heritableContext: 0, replicating: replicating[i], solo: replicating[i], context: 0, families: [] });
    records.push({ type: 'measure', epoch, h0: 7, hoe: 1, ops: 100, runs: 1, epochs: 250, seconds: 60 * (i + 1) });
  });
  records.push({ type: 'end', epoch: t + 2000, reason: 'horitzó' });
  writeFileSync(file, records.map((r) => JSON.stringify(r)).join('\n') + '\n');
  return file;
}
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'b2-')); try { return fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }

const tests = {
  // L'anàlisi del pilot (eines/b2-pilot.mjs), amb els registres de git: el que diu fase2/resultats/b2/pilot/LLEGEIX-ME.md
  "l'anàlisi del pilot reprodueix el LLEGEIX-ME: la mateixa història, 2 pèrdues i cap de tardana, i el cost": () => {
    const r = pilot();
    assert.deepStrictEqual([r.same, r.branches, r.losses, r.late], [14, 14, 2, 0]);
    assert.deepStrictEqual([4000, 5000, 6000].map((H) => r.hours(H).toFixed(1)), ['4.1', '5.5', '7.0']);   // corregit a l'auditoria 10
    assert.ok(r.lines.some((l) => /^1\. La mateixa història: 14 de 14 .*HOE difereix com a molt 1\.7e-3/.test(l)), r.lines[0]);
  },
  "una branca: grup, llavor d'origen, t i horitzó": () => withTmp((tmp) => {
    const b = readBranch(branch(join(tmp, 'B2002-m0.jsonl'), { group: 'B', seed: 2002, mixing: 0, t: 7000, heritable: [50, 50, 50, 50, 50, 50, 50, 50] }));
    assert.deepStrictEqual([b.group, b.originSeed, b.mixing, b.t, b.horizon, b.complete], ['B', 2002, 0, 7000, 2000, true]);
  }),
  "la mort amb cada regla, la data i les morts falses": () => withTmp((tmp) => {
    // R1 mor a t + 750 (15 i 10 de 2.048 són menys de l'1 %); R2 i R3 no moren
    const a = readBranch(branch(join(tmp, 'a.jsonl'), { group: 'A', seed: 1, mixing: 0, t: 1000, heritable: [100, 100, 15, 10, 10, 10, 10, 10] }));
    assert.deepStrictEqual(death(a, RULES['R1 · < 1 %']), { first: 1750, second: 2000, recovered: false });
    assert.strictEqual(death(a, RULES['R2 · ≤ 5 de 2.048']), null);
    assert.strictEqual(lifespan(a, death(a, RULES['R1 · < 1 %'])), 750);
    assert.strictEqual(lifespan(a, death(a, RULES['R1 · < 1 %']), { second: true }), 1000);
    assert.strictEqual(lifespan(a, null), 2000);
    // una mort que torna: R1 i R2 a t + 500, i després el 2,4 %
    const b = readBranch(branch(join(tmp, 'b.jsonl'), { group: 'A', seed: 2, mixing: 0, t: 1000, heritable: [100, 3, 2, 50, 100, 100, 100, 100] }));
    assert.deepStrictEqual(death(b, RULES['R1 · < 1 %']), { first: 1500, second: 1750, recovered: true });
    assert.deepStrictEqual(death(b, RULES['R2 · ≤ 5 de 2.048']), { first: 1500, second: 1750, recovered: true });
    assert.strictEqual(death(b, RULES['R3 · cap hereditari']), null);
    // un sol cens per sota no és mort
    const c = readBranch(branch(join(tmp, 'c.jsonl'), { group: 'A', seed: 3, mixing: 0, t: 1000, heritable: [100, 0, 100, 0, 100, 0, 100, 0] }));
    assert.strictEqual(death(c, RULES['R3 · cap hereditari']), null);
  }),
  'la fragilitat del món: la prova de Mann–Whitney exacta i el mecanisme (eines/fragilitat.mjs)': () => {
    // separació completa amb 2 i 2: de les 6 maneres de triar el grup, 2 són tan extremes
    assert.strictEqual(mannWhitney([3, 4], [1, 2]), 2 / 6);
    assert.strictEqual(mannWhitney([5], [1, 2, 3]), 2 / 4);
    // tot empatat: cap diferència
    assert.strictEqual(mannWhitney([1, 1], [1, 1]), 1);
    assert.strictEqual(mechanism('<[},<]'), 'coma');
    assert.strictEqual(mechanism('.{>'), 'punt');
    assert.strictEqual(mechanism(',[[[[['), 'altre: ,[[[[[');
    assert.strictEqual(mechanism(',<}.{>'), 'altre: ,<}.{>');
    assert.strictEqual(mechanism(undefined), 'cap família');
  },
  'prova de signes exacta': () => {
    assert.strictEqual(signTest(4, 0), 0.125);
    assert.strictEqual(signTest(6, 0), 0.03125);
    assert.strictEqual(signTest(0, 0), 1);
    assert.strictEqual(signTest(3, 3), 1);
  },
  "l'anàlisi aparella pel món i compta els que viuen més sense corrent": () => withTmp((tmp) => {
    const bs = [
      branch(join(tmp, 'A1-m0.jsonl'), { group: 'A', seed: 1, mixing: 0, t: 1000, heritable: [99, 99, 99, 99, 99, 99, 99, 99] }),
      branch(join(tmp, 'A1-m0.01.jsonl'), { group: 'A', seed: 1, mixing: 0.01, t: 1000, heritable: [99, 0, 0, 0, 0, 0, 0, 0] }),
      branch(join(tmp, 'B2-m0.jsonl'), { group: 'B', seed: 2, mixing: 0, t: 500, heritable: [99, 99, 99, 99, 99, 99, 99, 99] }),
      branch(join(tmp, 'B2-m0.01.jsonl'), { group: 'B', seed: 2, mixing: 0.01, t: 500, heritable: [99, 99, 99, 99, 99, 99, 99, 99] }),
    ].map(readBranch);
    const worlds = [{ group: 'A', seed: 1, part: 'exploracio' }, { group: 'B', seed: 2, part: 'exploracio' }];
    const out = analyse(bs, { worlds });
    assert.match(out, /mons: 2 de 2 d'exploració/);
    assert.match(out, /R1 · < 1 %[\s\S]*?origen A, m = 0\.01: 1 morts de 1/);
    // A1: sense corrent viu les 2.000 èpoques; amb corrent mor a t + 500 (dos censos sense cap hereditari): D = 1.500.
    // B2: totes dues viuen fins a l'horitzó: D = 0. La mitjana és 750
    assert.match(out, /aparellat \(2 mons\): D = L\(0\) − L\(0,01\) mitjana 750 èpoques; vida més llarga sense corrent 1, amb corrent 0, iguals 1/);
  }),
  "concordança amb la història original a t + 1.000, amb la branca de la condició d'origen (AUD-61)": () => withTmp((tmp) => {
    const bs = [
      branch(join(tmp, 'A1-m0.jsonl'), { group: 'A', seed: 1, mixing: 0, t: 1000, heritable: [99, 99, 99, 99, 99, 99, 99, 99] }),
      branch(join(tmp, 'A1-m0.01.jsonl'), { group: 'A', seed: 1, mixing: 0.01, t: 1000, heritable: [99, 99, 0, 0, 0, 0, 0, 0] }),
      branch(join(tmp, 'B2-m0.jsonl'), { group: 'B', seed: 2, mixing: 0, t: 500, heritable: [99, 99, 99, 99, 99, 99, 99, 99] }),
      branch(join(tmp, 'B2-m0.01.jsonl'), { group: 'B', seed: 2, mixing: 0.01, t: 500, heritable: [99, 99, 99, 99, 99, 99, 99, 99] }),
    ].map(readBranch);
    // la història original: A1 viva a t + 1.000 (època 2.000), B2 morta a t + 1.000 (època 1.500)
    const originals = new Map([
      ['A1', { censuses: [{ epoch: 2000, sample: 2048, heritable: 80 }] }],
      ['B2', { censuses: [{ epoch: 1500, sample: 2048, heritable: 1 }] }],
    ]);
    const out = analyse(bs, { worlds: [{ group: 'A', seed: 1, part: 'exploracio' }, { group: 'B', seed: 2, part: 'exploracio' }], originals });
    // A1 es compara amb la branca m = 0 (viva) i B2 amb la m = 0,01 (viva)
    assert.match(out, /2 mons: viva a totes dues 1, només a l'original 0, només a la branca 1, a cap 0/);
  }),
  "la línia d'ordres no analitza branques de mons de confirmació": () => withTmp((tmp) => {
    const dir = join(tmp, 'branques');
    mkdirSync(dir);
    branch(join(dir, 'A1-m0.jsonl'), { group: 'A', seed: 1, mixing: 0, t: 1000, heritable: [99, 99, 99, 99, 99, 99, 99, 99] });
    const rep = join(tmp, 'repartiment.json');
    writeFileSync(rep, JSON.stringify({ worlds: [{ group: 'A', seed: 1, part: 'confirmacio' }] }));
    const r = spawnSync(process.execPath, [join(root, 'fase2', 'b2-analisi.mjs'), dir, '--repartiment', rep, '--serie', tmp], { encoding: 'utf8' });
    assert.strictEqual(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /no són d'exploració \(A1-m0\): no s'analitza res/);
  }),
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
