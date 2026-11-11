// Proves de la composició de bytes de B1 (docs/pla-b1.md, §13). Cap no mira cap resultat del càlcul: les llavors són de prova.
//   - els enters a l'atzar exactes; els programes de cada estrat, amb exactament k instruccions, a posicions uniformes; el sorteig
//     d'una composició;
//   - D½ (d-mig) amb companys uniformes fa exactament les sopes del nivell 1, i amb els dos tipus de company, el mateix programa;
//   - les 22 composicions de git: la captura de cada una, la del manifest del pilot, i els recomptes, coherents;
//   - la línia d'ordres, el JSONL, els fils i els trossos;
//   - l'anàlisi: el pla, la validació (i com s'hi nega), ρ(p) i el seu interval.
// Executa: node test/b1-estrats.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { OPCODES, PROGRAM_SIZE } from '../fase1/bff.js';
import { makeRng } from '../fase1/soup.js';
import { soupFor as level1Soup, DISTRIBUTIONS } from '../eines/densitat.mjs';
import { strataBlocks, strataSize, soupBlocks, LEVEL1, SOUP_PROGRAMS } from '../eines/b1-llavors.mjs';
import { uniformInt, stratumProgram, compositionDraw, readComposition, checkCohort, parseSource, soupFor, sourceDraw, dMig, testRange, MODULES, SOUP_BYTES } from '../eines/estrats.mjs';
import { cohort } from '../eines/composicio.mjs';
import { planRuns, readRun, readFolder, rho, binomialWeight, analyse, COMPOSITIONS } from '../eines/estrats-analisi.mjs';
import { fayFeuer } from '../eines/b1-estadistica.mjs';
import { fileHashes, sha256 } from '../eines/b1-comu.mjs';
import { lists, LIST_FILES } from '../eines/b1-llistes.mjs';
import { compare } from '../eines/b1-compara.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const SEED = 777;
const INSTR = new Set([...OPCODES].map((c) => c.charCodeAt(0)));
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'estrats-')); try { fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }
const tool = (...a) => spawnSync(process.execPath, [join(root, 'eines', 'estrats.mjs'), ...a], { cwd: root, encoding: 'utf8' });
const lines = (f) => readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const clean = (f) => writeFileSync(f, readFileSync(f, 'utf8').replace(/^(\{"type":"start","code":"[0-9a-f]+)\+canvis"/, '$1"'));
const comp5001 = join(COMPOSITIONS, '5001.json');

const tests = {
  "els enters a l'atzar són exactes: es rebutgen els valors de l'atzar que en farien un biaix"() {
    const seq = (vals) => { let i = 0; return () => vals[i++] / 2 ** 32; };
    // amb m = 10, el límit és 2³² − 6: els sis últims valors es rebutgen
    assert.strictEqual(uniformInt(seq([2 ** 32 - 1, 2 ** 32 - 6, 13]), 10), 3);
    assert.strictEqual(uniformInt(seq([2 ** 32 - 7]), 10), (2 ** 32 - 7) % 10);
    // amb una potència de 2, no se'n rebutja cap
    assert.strictEqual(uniformInt(seq([2 ** 32 - 1]), 256), 255);
    const rng = makeRng(SEED, 'v2'), n = new Array(10).fill(0);
    for (let i = 0; i < 100000; i++) n[uniformInt(rng, 10)]++;
    assert.ok(n.every((x) => Math.abs(x - 10000) < 500), String(n));
  },
  'un programa de l\'estrat k té exactament k instruccions, a posicions uniformes, i els bytes, uniformes dins de cada classe'() {
    const rng = makeRng(SEED, 'v2');
    for (let k = 0; k <= 64; k++) for (let r = 0; r < 20; r++) assert.strictEqual(stratumProgram(rng, k).filter((b) => INSTR.has(b)).length, k, `k = ${k}`);
    const at = new Array(64).fill(0), values = new Map();
    for (let r = 0; r < 20000; r++) stratumProgram(rng, 8).forEach((b, i) => { if (INSTR.has(b)) at[i]++; values.set(b, (values.get(b) ?? 0) + 1); });
    // cada posició, amb probabilitat 8/64 = 1/8: 2.500 de 20.000
    assert.ok(at.every((x) => Math.abs(x - 2500) < 250), String(at));
    assert.strictEqual(values.size, 256);
    for (const b of INSTR) assert.ok(Math.abs(values.get(b) - 16000) < 800, `${b}: ${values.get(b)}`);
  },
  "el sorteig d'una composició segueix els recomptes"() {
    const counts = new Array(256).fill(0);
    counts[0] = 3; counts[46] = 1; counts[200] = 4;
    const draw = compositionDraw(counts), rng = makeRng(SEED, 'v2'), n = {};
    for (let i = 0; i < 80000; i++) { const b = draw(rng); n[b] = (n[b] ?? 0) + 1; }
    assert.deepStrictEqual(Object.keys(n).map(Number).sort((a, b) => a - b), [0, 46, 200]);
    assert.ok(Math.abs(n[0] - 30000) < 600 && Math.abs(n[46] - 10000) < 400 && Math.abs(n[200] - 40000) < 600, JSON.stringify(n));
  },
  'D½ amb companys uniformes fa les sopes del nivell 1; amb els dos tipus de company, el programa és el mateix'() {
    assert.deepStrictEqual([...Array(2000)].map((_, i) => dMig(makeRng(i, 'v2'))), [...Array(2000)].map((_, i) => DISTRIBUTIONS['d-mig'](makeRng(i, 'v2'))));
    const dm = parseSource('d-mig');
    for (const i of [0, 1, 2, 999, 123456]) {
      assert.deepStrictEqual(soupFor(i, LEVEL1.from, dm, 'uniforme'), level1Soup(i, LEVEL1.from, 'd-mig'), `programa ${i}`);
      const a = soupFor(i, SEED, dm, 'uniforme'), b = soupFor(i, SEED, dm, 'programa');
      assert.deepStrictEqual(a.subarray(0, PROGRAM_SIZE), b.subarray(0, PROGRAM_SIZE));
      assert.notDeepStrictEqual(a.subarray(PROGRAM_SIZE), b.subarray(PROGRAM_SIZE));
    }
    const sopa = parseSource(`sopa:${comp5001}`), draw = sourceDraw(sopa, readComposition(comp5001).counts);
    const a = soupFor(5, SEED, sopa, 'uniforme', draw), b = soupFor(5, SEED, sopa, 'programa', draw);
    assert.deepStrictEqual(a.subarray(0, PROGRAM_SIZE), b.subarray(0, PROGRAM_SIZE));
  },
  'les 22 composicions de git: la captura de cada una és la del manifest del pilot, i els recomptes quadren'() {
    const worlds = cohort();
    assert.strictEqual(worlds.length, 22);
    assert.deepStrictEqual(readdirSync(join(root, COMPOSITIONS)).sort(), worlds.map((w) => `${w.world}.json`).sort());
    for (const w of worlds) {
      const c = readComposition(join(root, COMPOSITIONS, `${w.world}.json`));
      assert.strictEqual(c.world, w.world);
      assert.strictEqual(c.epoch, 8000);
      assert.deepStrictEqual(c.capture, w.capture);
      assert.strictEqual(c.bytes, SOUP_BYTES);
      assert.strictEqual(c.instructions, c.counts.reduce((s, x, b) => s + (INSTR.has(b) ? x : 0), 0));
    }
  },
  "AU2-140: la composició es comprova sencera, i l'eina s'hi nega abans de començar, sense deixar cap JSONL"() {
    // els enters a l'atzar i el sorteig, fora d'1 a 2³²: s'hi neguen, en lloc de no acabar
    const rng = makeRng(SEED, 'v2');
    for (const m of [0, -1, 1.5, 2 ** 32 + 1, NaN]) assert.throws(() => uniformInt(rng, m), RangeError, String(m));
    assert.strictEqual(uniformInt(() => 0.5, 2 ** 32), 2 ** 31);
    assert.throws(() => compositionDraw(new Array(256).fill(0)), RangeError);
    assert.throws(() => compositionDraw([2 ** 32 + 1, ...new Array(255).fill(0)]), RangeError);
    const orig = JSON.parse(readFileSync(join(root, comp5001), 'utf8'));
    const changed = (f) => { const c = { ...orig, counts: [...orig.counts] }; f(c); return c; };
    const bad = {
      // els dos contraexemples de l'auditor 2: un recompte d'instruccions fals, i més de 2³² bytes
      'instruccions-falses': changed((c) => { c.instructions = 0; }),
      'mes-de-2-32': changed((c) => { c.bytes = 2 ** 32 + 1; c.counts = [2 ** 32 + 1, ...new Array(255).fill(0)]; c.instructions = 0; }),
      // un total que no és 2²³, i una suma que no quadra
      total: changed((c) => { c.counts[1]--; c.bytes--; }),
      suma: changed((c) => { c.counts[1]++; }),
      // les instruccions, en text (l'auditor 1, auditoria 29: abans, el missatge en deia el mateix nombre a totes dues bandes)
      'instruccions-en-text': changed((c) => { c.instructions = String(c.instructions); }),
    };
    const outside = {
      // un món exclòs de la cohort, una altra època, i una altra captura
      mon: changed((c) => { c.world = '5012'; }),
      epoca: changed((c) => { c.epoch = 7999; }),
      captura: changed((c) => { c.capture = { ...c.capture, sha256: '0'.repeat(64) }; }),
    };
    withTmp((tmp) => {
      for (const [name, c] of Object.entries({ ...bad, ...outside })) {
        const file = join(tmp, `${name}.json`), out = join(tmp, `${name}.jsonl`);
        writeFileSync(file, JSON.stringify(c) + '\n');
        const r = tool('--programa', `sopa:${file}`, '--company', 'programa', '--llavor', String(SEED), '--programes', '10', '--json', out);
        assert.strictEqual(r.status, 2, `${name}: ${r.stderr}`);
        assert.ok(!existsSync(out), `${name}: ha deixat un JSONL`);
        if (bad[name]) assert.throws(() => readComposition(file), /no és una composició/, name);
        else assert.throws(() => checkCohort(readComposition(file)), /cohort|època|captura/, name);
      }
      assert.throws(() => readComposition(join(tmp, 'instruccions-en-text.json')), /el recompte d'instruccions ha de ser un enter no negatiu/);
    });
    for (const w of cohort()) assert.doesNotThrow(() => checkCohort(readComposition(join(root, COMPOSITIONS, `${w.world}.json`))), w.world);
  },
  "AU2-142: l'anàlisi i la prova d'autonomia dels hereditaris tornen a comprovar la composició, sencera i de la cohort, i la de la línia d'inici, camp a camp"() {
    withTmp((tmp) => {
      const dir = join(tmp, 'r'), good = join(tmp, 'bona.json'), bad = join(tmp, 'epoca-7999.json'), aut = join(tmp, 'autonomia.jsonl');
      mkdirSync(dir);
      const orig = readFileSync(join(root, comp5001));
      writeFileSync(good, orig);
      writeFileSync(bad, JSON.stringify({ ...JSON.parse(orig), epoch: 7999 }) + '\n');
      const log = join(dir, 'sopa.jsonl'), plan = (f) => [{ key: 'sopa:5001:uniforme', program: `sopa:${f}`, partner: 'uniforme', seed: SEED, programs: 3, world: '5001' }];
      const autonomy = () => spawnSync(process.execPath, [join(root, 'eines', 'autonomia.mjs'), '--registre', log, '--llavor', String(SEED), '--condicions', '2', '--json', aut], { cwd: root, encoding: 'utf8' });
      assert.strictEqual(tool('--programa', `sopa:${good}`, '--company', 'uniforme', '--llavor', String(SEED), '--programes', '3', '--tros', '3', '--json', log).status, 0);
      clean(log);
      assert.deepStrictEqual(readFolder(dir, { root, plan: plan(good) }).problems, []);
      const text = readFileSync(log, 'utf8');
      const rewrite = (f) => { const ls = text.split('\n'), s = JSON.parse(ls[0]); f(s); ls[0] = JSON.stringify(s); writeFileSync(log, ls.join('\n')); };
      // el contraexemple de l'auditor 2: la mateixa tirada, amb la línia d'inici reescrita, coherent, per a una composició de l'època
      // 7.999. L'empremta no ho veu: no hi és, la línia d'inici. Abans, l'anàlisi l'acceptava
      rewrite((s) => { s.program = `sopa:${bad}`; s.command = s.command.replace(`sopa:${good}`, `sopa:${bad}`); s.composition = { ...s.composition, epoch: 7999, sha256: sha256(readFileSync(bad)) }; });
      assert.ok(readFolder(dir, { root, plan: plan(bad) }).problems.some((p) => /de l'època 7999, i ha de ser de la 8000/.test(p)));
      // la prova d'autonomia dels seus hereditaris també s'hi nega, sense crear el JSONL
      let r = autonomy();
      assert.strictEqual(r.status, 2, r.stderr);
      assert.match(r.stderr, /de l'època 7999, i ha de ser de la 8000/);
      assert.ok(!existsSync(aut));
      // la composició bona, i un camp de la línia d'inici que no és el del fitxer (l'època, o el nom de la captura): s'hi neguen totes dues
      for (const f of [(s) => { s.composition.epoch = 7999; }, (s) => { s.composition.capture = { ...s.composition.capture, file: 'una-altra.bin' }; }]) {
        rewrite(f);
        assert.ok(readFolder(dir, { root, plan: plan(good) }).problems.some((p) => /la composició de la línia d'inici no és la de/.test(p)));
        r = autonomy();
        assert.strictEqual(r.status, 2, r.stderr);
        assert.ok(!existsSync(aut));
      }
      // i un estrat que diu una composició
      const st = join(tmp, 'estrat.jsonl');
      assert.strictEqual(tool('--programa', 'estrat:3', '--company', 'uniforme', '--llavor', String(SEED), '--programes', '3', '--json', st).status, 0);
      clean(st);
      const sl = readFileSync(st, 'utf8').split('\n'), s0 = JSON.parse(sl[0]);
      s0.composition = JSON.parse(text.split('\n')[0]).composition;
      sl[0] = JSON.stringify(s0);
      writeFileSync(st, sl.join('\n'));
      assert.ok(readRun(st, root).problems.some((p) => /la línia d'inici diu una composició, i el programa no és d'una sopa/.test(p)));
    });
  },
  "l'eina: les opcions, el JSONL, i el resultat no depèn dels fils ni dels trossos"() {
    withTmp((tmp) => {
      const f = (n) => join(tmp, `${n}.jsonl`), base = ['--company', 'uniforme', '--llavor', String(SEED), '--programes', '120'];
      assert.strictEqual(tool('--help').status, 0);
      for (const a of [['--programa', 'estrat:65', ...base, '--json', f('x')], ['--programa', 'estrat:3', ...base.map((v) => (v === 'uniforme' ? 'programa' : v)), '--json', f('x')],
        ['--programa', 'cust', ...base, '--json', f('x')], ['--programa', 'sopa:no-hi-es.json', ...base, '--json', f('x')], ['--programa', 'd-mig', ...base],
        ['--programa', 'd-mig', ...base, '--json', f('x'), '--llavor', '1']]) assert.strictEqual(tool(...a).status, 2, a.join(' '));
      for (const [name, prog, partner] of [['k', 'estrat:20', 'uniforme'], ['s', `sopa:${comp5001}`, 'programa']]) {
        const b = base.map((v) => (v === 'uniforme' ? partner : v));
        assert.strictEqual(tool('--programa', prog, ...b, '--tros', '40', '--json', f(`${name}1`)).status, 0);
        assert.strictEqual(tool('--programa', prog, ...b, '--tros', '40', '--fils', '3', '--json', f(`${name}3`)).status, 0);
        const x = lines(f(`${name}1`)), y = lines(f(`${name}3`));
        assert.deepStrictEqual(x.slice(1, -1), y.slice(1, -1));
        assert.strictEqual(x[x.length - 1].fingerprint, y[y.length - 1].fingerprint);
        assert.deepStrictEqual(x[0].modules, fileHashes(MODULES));
        if (name === 's') assert.strictEqual(x[0].composition.sha256, readComposition(comp5001).sha256);
        clean(f(`${name}1`));
        assert.deepStrictEqual(readRun(f(`${name}1`), root).problems, []);
      }
      const before = readFileSync(f('k1'), 'utf8');
      assert.strictEqual(tool('--programa', 'estrat:20', ...base, '--json', f('k1')).status, 2);
      assert.strictEqual(readFileSync(f('k1'), 'utf8'), before);
      // la repetició (eines/b1-compara.mjs): la mateixa ordre, en un altre fitxer, coincideix; amb una altra llavor, no
      assert.strictEqual(tool('--programa', 'estrat:20', ...base, '--tros', '40', '--json', f('k1r')).status, 0);
      clean(f('k1r'));
      assert.deepStrictEqual(compare(f('k1'), f('k1r')), []);
      assert.strictEqual(tool('--programa', 'estrat:20', ...base.map((v) => (v === String(SEED) ? '778' : v)), '--tros', '40', '--json', f('k1x')).status, 0);
      clean(f('k1x'));
      const diff = compare(f('k1'), f('k1x'));
      assert.ok(diff.some((p) => /seed/.test(p)) && diff.some((p) => /fingerprint/.test(p)), diff.join('; '));
      // la mateixa sopa a l'eina i a testRange
      const r = testRange(0, 120, { seed: SEED, source: parseSource('estrat:20'), partner: 'uniforme' });
      assert.deepStrictEqual(r.found, lines(f('k1')).filter((o) => o.type === 'replicator'));
    });
  },
  "el pla: els 65 estrats, les 22 sopes amb els dos companys i D½ amb companys de D½, amb les llavors del mapa"() {
    const plan = planRuns();
    assert.strictEqual(plan.length, 65 + 44 + 1);
    assert.strictEqual(new Set(plan.map((p) => p.key)).size, plan.length);
    plan.filter((p) => p.k !== undefined).forEach((p) => { assert.strictEqual(p.seed, strataBlocks()[p.k].from); assert.strictEqual(p.programs, strataSize(p.k)); });
    // 10⁷ de k = 0 a 12 (AUD-178; a la v0.5, de 3 a 12), i 10⁶ als altres
    assert.deepStrictEqual(plan.filter((p) => p.k !== undefined && p.programs === 1e7).map((p) => p.k), [...Array(13).keys()]);
    assert.strictEqual(strataBlocks().at(-1).from + strataBlocks().at(-1).size, 624000000);
    const soups = soupBlocks(22);
    cohort().forEach((w, s) => { for (const partner of ['uniforme', 'programa']) assert.strictEqual(plan.find((p) => p.key === `sopa:${w.world}:${partner}`).seed, soups[s].from); });
    assert.ok(plan.filter((p) => p.world).every((p) => p.programs === SOUP_PROGRAMS));
    const dm = plan.find((p) => p.key === 'd-mig:programa');
    assert.deepStrictEqual([dm.seed, dm.programs], [LEVEL1.from, 1e6]);
  },
  "les llistes d'ordres de git són les que fa eines/b1-llistes.mjs, amb el pla i el mapa de llavors"() {
    const all = lists();
    for (const [what, file] of Object.entries(LIST_FILES)) {
      assert.strictEqual(readFileSync(join(root, file), 'utf8').replace(/\r/g, ''), all[what].join('\n') + '\n', what);
    }
    assert.deepStrictEqual(Object.keys(LIST_FILES).map((w) => all[w].length), [11, 4, 110, 110]);
    assert.ok([...all.autonomia, ...all.caps, ...all.estrats].every((l) => / --fils 8 --json fase2\/resultats\/b1\/(autonomia|caps|estrats)\/registres\/\S+\.jsonl$/.test(l)));
    // l'autonomia dels hereditaris de la §13 (AUD-175): una ordre per registre de la §13, amb les condicions de la §4
    all.estrats.forEach((l, i) => {
      const json = l.split(' --json ')[1], name = json.split('/').pop();
      assert.strictEqual(all['estrats-autonomia'][i], `node eines/autonomia.mjs --registre ${json} --llavor 250000000 --condicions 100 --fils 8 --json fase2/resultats/b1/estrats/autonomia/${name}`);
    });
  },
  "AUD-177: analyse() de la §13, amb 110 tirades sintètiques, acaba i en treu les xifres que toca"() {
    // com la prova de l'auditor 1 (auditoria 28): cap programa no s'executa, i els recomptes són inventats
    const runs = {}, mk = (n, idx, solo) => ({ n, found: idx.map((index, j) => ({ index, heritableSolo: j < solo, heritableContext: j >= solo })) });
    for (const p of planRuns()) {
      if (p.k !== undefined) runs[p.key] = mk(p.programs, p.k === 0 ? [5, 9] : p.k === 30 ? Array.from({ length: 160 }, (_, j) => 3 * j) : [], 1);
      else if (p.world) runs[p.key] = mk(p.programs, p.partner === 'uniforme' ? [3, 10, 17] : [10, 17, 24, 31], 0);
      else runs[p.key] = mk(p.programs, [11, 22], 0);
    }
    const out = analyse(runs);
    assert.strictEqual(out.length, 37);
    const text = out.join('\n');
    assert.match(text, /Els estrats, k: hereditaris de n, rₖ \(IC del 95 %\), només els que en tenen: 0: 2 de 10000000; 30: 160 de 1000000/);
    assert.match(text, /m, el k més petit amb algun hereditari: 0 \(/);
    // les sopes: a cadascuna, 2 a tots dos, 1 només amb uniformes i 2 només amb els de la sopa; les 22 juntes, aparellades (auditor 1)
    assert.match(text, /Les 22 sopes juntes: uniformes 66, .*; de la sopa 88, .*; 44, 22, 44, quocient 1\.33 \(/);
    assert.match(text, /companys sintetitzats a partir de l'histograma de la sopa/);
    // ρ(½), la suma dels pesos pels rₖ
    const want = binomialWeight(0, 0.5) * 2 / 1e7 + binomialWeight(30, 0.5) * 160 / 1e6;
    const got = /ρ\(p\), amb l'interval de Fay i Feuer del 95 %: .*0\.5: ([0-9.]+)·10\^(-?\d+)/.exec(text);
    assert.ok(got && Math.abs(Number(got[1]) * 10 ** Number(got[2]) - want) / want < 0.01, `${got} ${want}`);
  },
  "l'anàlisi: la validació d'una carpeta, i com s'hi nega"() {
    withTmp((tmp) => {
      const dir = join(tmp, 'r');
      mkdirSync(dir);
      const plan = [{ key: 'estrat:12', program: 'estrat:12', partner: 'uniforme', seed: SEED, programs: 90, k: 12 }, { key: 'sopa:5001:programa', program: `sopa:${comp5001}`, partner: 'programa', seed: SEED + 1000, programs: 60, world: '5001' }];
      // l'estrat, en dos trossos
      assert.strictEqual(tool('--programa', 'estrat:12', '--company', 'uniforme', '--llavor', String(SEED), '--programes', '50', '--json', join(dir, 'a.jsonl')).status, 0);
      assert.strictEqual(tool('--programa', 'estrat:12', '--company', 'uniforme', '--llavor', String(SEED), '--programes', '40', '--de', '50', '--json', join(dir, 'b.jsonl')).status, 0);
      assert.strictEqual(tool('--programa', `sopa:${comp5001}`, '--company', 'programa', '--llavor', String(SEED + 1000), '--programes', '60', '--json', join(dir, 'c.jsonl')).status, 0);
      for (const f of ['a', 'b', 'c']) clean(join(dir, `${f}.jsonl`));
      const ok = readFolder(dir, { root, plan });
      assert.deepStrictEqual(ok.problems, []);
      assert.strictEqual(ok.runs['estrat:12'].n, 90);
      // amb el pla de veritat: les llavors no hi són, i hi falten tirades
      const real = readFolder(dir, { root });
      assert.ok(real.problems.some((p) => /la llavor és/.test(p)) && real.problems.some((p) => /hi falta/.test(p)));
      // un forat, un replicador canviat, un altre codi
      rmSync(join(dir, 'b.jsonl'));
      assert.ok(readFolder(dir, { root, plan }).problems.some((p) => /50 programes, i el pla en preveu 90/.test(p)));
      const c = join(dir, 'c.jsonl'), text = readFileSync(c, 'utf8');
      writeFileSync(c, text.replace(/"modules":\{"fase1\/bff.js":"[0-9a-f]{64}"/, `"modules":{"fase1/bff.js":"${'0'.repeat(64)}"`));
      assert.ok(readFolder(dir, { root, plan }).problems.some((p) => /un altre codi/.test(p)));
      writeFileSync(c, text.replace(/("composition":\{"world":")5001/, (_, a) => `${a}5002`));
      assert.ok(readFolder(dir, { root, plan }).problems.some((p) => /la composició no és la de la captura/.test(p)));
      // l'ordre, sencera (AU2-143): un altre tros que el de la línia d'inici, un altre fitxer, i una opció que l'eina no té
      for (const [from, to, re] of [['--programes 60 ', '--programes 60 --tros 7 ', /l'ordre no diu el mateix/], ['c.jsonl"', 'd.jsonl"', /l'ordre no diu el mateix/],
        ['--programes 60 ', '--programes 60 --color blau ', /opció desconeguda: --color/]]) {
        writeFileSync(c, text.replace(from, to));
        assert.ok(readFolder(dir, { root, plan }).problems.some((p) => re.test(p)), `${from} -> ${to}`);
      }
    });
  },
  "ρ(p): la suma dels pesos de la binomial pels rₖ, i l'interval de Fay i Feuer"() {
    // els pesos sumen 1, per a qualsevol p
    for (const p of [0.01, 10 / 256, 0.3, 0.5, 0.99]) assert.ok(Math.abs([...Array(65)].reduce((s, _, k) => s + binomialWeight(k, p), 0) - 1) < 1e-12);
    const strata = Array.from({ length: 65 }, (_, k) => ({ n: strataSize(k), x: k === 10 ? 7 : k === 30 ? 160 : 0 }));
    const p = 0.25, r = rho(strata, p);
    assert.ok(Math.abs(r.value - (binomialWeight(10, p) * 7 / 1e7 + binomialWeight(30, p) * 160 / 1e6)) < 1e-18);
    assert.ok(r.ci[0] < r.value && r.value < r.ci[1]);
    // amb un sol estrat amb hereditaris, i pes 1 (p = 0 o 1 no; p tal que només pesi k = 0): l'interval de Garwood escalat
    const one = Array.from({ length: 65 }, (_, k) => ({ n: 1e6, x: k === 0 ? 3 : 0 }));
    const g = fayFeuer([1 / 1e6], [3]);
    const r0 = rho(one, 1e-9);
    assert.ok(Math.abs(r0.ci[0] - g.ci[0]) / g.ci[0] < 1e-6 && Math.abs(r0.ci[1] - g.ci[1]) / g.ci[1] < 1e-3, `${r0.ci} ${g.ci}`);
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
