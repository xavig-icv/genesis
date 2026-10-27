// Proves de l'eina dels experiments d'alíquotes (eines/pilot.mjs) i de la potència de la maduració
// (eines/potencia-maduracio.mjs): les ordres, la validació de l'envelliment (AU2-85), el contracte del manifest i la
// procedència de les captures (AU2-84, AU2-88), la comprovació prèvia, i els valors crítics de la prova de signes.
// Les comprovacions del manifest es fan en una carpeta temporal amb fitxers sintètics, perquè no depenguin de l'estat
// del repositori.
// Executa: node test/pilot.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, copyFileSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PILOTS, COMMON, TRANSFORM_OFFSET, agingLine, branchLines, branchList, designParams, validateAging, simulatorProblems, checkCaptures, preflight, machineOf, agedCandidates } from '../eines/pilot.mjs';
import { establishment } from '../fase2/census.js';
import { critical, power, familyPower, validity } from '../eines/potencia-maduracio.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const opt = (line, name) => line.match(new RegExp(`--${name} (\\S+)`))?.[1];
const sha = (b) => createHash('sha256').update(b).digest('hex');
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'pilot-')); try { fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }
const put = (base, f, data) => { mkdirSync(dirname(join(base, f)), { recursive: true }); writeFileSync(join(base, f), data); };

// Un registre d'envelliment complet, com l'escriu sim.mjs: els censos cada 250 èpoques, l'establiment si el donen els
// censos (i l'aturada al cens que el confirma) i les mesures cada 100
function agingRecords(world, { establishAt = null, name = 'maduracio' } = {}) {
  const rec = [{
    type: 'start', code: 'abcdef1', rng: 'v2', node: 'v16', zlib: 'x', command: `node sim.mjs ${agingLine(world, name).split(' ').slice(1).join(' ')}`,
    seed: Number(world), programs: 131072, world: [512, 256], radius: 2, mixing: 0, diffusion: 0, flow: 0, renewal: 0, mutation: 0.00024,
    from: null, start: 0, epochs: 8000, every: 100, census: { ...COMMON.census }, event: { share: 0.01, censuses: 2, stopAfter: 0 },
  }];
  const seen = [];
  let event = null, end = 8000;
  for (let e = 1; e <= 8000; e++) {
    let confirmed = false;
    if (e % 250 === 0) {
      const h = establishAt !== null && e >= establishAt ? 100 : 0, rep = h + 1;
      const c = { type: 'census', version: 'v3', epoch: e, families: [], extinct: [], untracked: [], familySample: 0, sample: 2048, replicating: rep, solo: rep, context: 0, heritable: h, heritableSolo: h, heritableContext: 0 };
      rec.push(c); seen.push(c);
      if (event === null) { const t = establishment(seen, 250); if (t !== null) { event = t; confirmed = true; rec.push({ type: 'event', epoch: t, confirmed: e }); } }
    }
    if (e % 100 === 0) rec.push({ type: 'measure', epoch: e, h0: 5, hoe: 0.1, ops: 1000, runs: 100, epochs: 100, seconds: e / 10 });
    if (confirmed) { end = e; break; }
  }
  rec.push({ type: 'end', epoch: end, reason: event !== null ? 'establiment' : 'horitzó', fingerprint: 'abcd1234', hoeTransition: null, event, seconds: end / 10 });
  return rec;
}
const writeAging = (base, world, records, name = 'maduracio') => {
  put(base, `${PILOTS[name].folder}/envelliment/e${world}.jsonl`, records.map((r) => JSON.stringify(r)).join('\n') + '\n');
  put(base, `${PILOTS[name].folder}/envelliment/captures/llavor${world}-mon512x256-r2-final.bin`, Buffer.from(`captura ${world}`));
};

// Un experiment de maduració sintètic i coherent: l'envelliment, els escanejos, les transformacions, els registres, les
// llistes i el manifest. El món 5003 s'estableix abans de l'època 8.000, i el 5004 té una cel·la hereditària.
const maturationFixture = (base) => agedFixture(base, 'maduracio', PILOTS.maduracio.worlds, { established: '5003', heritable: '5004' });
// El mateix per a la sèrie, amb una cohort de 5 (la prova la hi posa): el 6002 s'estableix abans de l'època 8.000, el
// 6004 té una cel·la hereditària, i el 6008, envellit, ja no hi entra. Hi entren el 6001, el 6003, el 6005, el 6006 i el
// 6007, i el PC en fa els tres primers
function seriesFixture(base) {
  writeAging(base, '6008', agingRecords('6008', { name: 'serie' }), 'serie');
  return agedFixture(base, 'serie', ['6001', '6002', '6003', '6004', '6005', '6006', '6007'], { established: '6002', heritable: '6004' });
}
function agedFixture(base, name, ids, { established, heritable: withHeritable }) {
  const p = PILOTS[name], code = 'abcdef1', worlds = [];
  for (const world of ids) {
    writeAging(base, world, agingRecords(world, { establishAt: world === established ? 4000 : null, name }), name);
    const capture = `${p.folder}/envelliment/captures/llavor${world}-mon512x256-r2-final.bin`;
    const agingFile = `${p.folder}/envelliment/e${world}.jsonl`;
    const w = { world, role: 'prova', start: 8000, capture, aging: { file: agingFile, sha256: sha(readFileSync(join(base, agingFile))), code } };
    if (world === established) { worlds.push({ ...w, included: false, reason: "establiment abans de l'època 8000 (a l'època 4000)" }); continue; }
    const seed = Number(world) + TRANSFORM_OFFSET, heritable = world === withHeritable ? 1 : 0;
    const scanFile = `${p.folder}/alicuotes/${world}/escaneig.json`;
    put(base, scanFile, JSON.stringify({ code, from: capture, fromSha256: sha(readFileSync(join(base, capture))), seed, cells: 131072, replicating: heritable, heritable, heritableSolo: heritable }));
    w.scan = { file: scanFile, sha256: sha(readFileSync(join(base, scanFile))), replicating: heritable, heritable, heritableSolo: heritable, cells: 131072 };
    if (heritable) { worlds.push({ ...w, included: false, reason: "1 cel·les hereditàries a l'escaneig de l'època 8000" }); continue; }
    w.included = true;
    w.captureSha256 = sha(readFileSync(join(base, capture)));
    w.arms = {};
    for (const arm of p.arms) {
      const file = `${p.folder}/alicuotes/${world}/${arm}.bin`, recFile = file.replace(/\.bin$/, '.json'), s2 = `${p.folder}/alicuotes/${world}/${arm}-escaneig.json`;
      put(base, file, Buffer.from(`${world} ${arm}`));
      const outSha256 = sha(readFileSync(join(base, file)));
      put(base, recFile, JSON.stringify({ tool: 'eines/transforma.mjs', code, from: capture, fromSha256: w.captureSha256, kind: arm, seed, width: 512, radius: 2, out: file, outSha256, changed: 1, scope: null, invariants: 'correctes' }));
      put(base, s2, JSON.stringify({ from: file, fromSha256: outSha256, seed, cells: 131072, replicating: 0, heritable: 0, heritableSolo: 0 }));
      w.arms[arm] = { file, sha256: outSha256, record: { file: recFile, sha256: sha(readFileSync(join(base, recFile))) }, changed: 1, scope: null, scan: { file: s2, sha256: sha(readFileSync(join(base, s2))), replicating: 0, heritable: 0, heritableSolo: 0, cells: 131072 } };
    }
    worlds.push(w);
  }
  const included = worlds.filter((w) => w.included), lists = {};
  for (const machine of ['pc', 'vm']) {
    const file = `${p.folder}/llista-${machine}.txt`, lines = included.filter((_, i) => machineOf(name, i) === machine).flatMap((w) => branchLines(name, w));
    put(base, file, lines.join('\n') + '\n');
    lists[machine] = { file, sha256: sha(readFileSync(join(base, file))), branches: lines.length };
  }
  const manifest = {
    pilot: name, design: p.protocol ?? 'docs/pilot-maduracio.md', code, ...(p.tag ? { tag: p.tag, dir: `${p.folder}/branques`, test: p.test } : {}),
    params: designParams(name), worlds, branches: included.flatMap((w) => branchList(name, w)), lists,
  };
  put(base, `${p.folder}/manifest.json`, JSON.stringify(manifest, null, 1));
  return manifest;
}
const rewrite = (base, m, name = 'maduracio') => put(base, `${PILOTS[name].folder}/manifest.json`, JSON.stringify(m, null, 1));
// La sèrie amb una cohort de 5, per a les proves (la de veritat, de 150), i la de veritat després
function withCohort(size, fn) {
  const saved = PILOTS.serie.cohort;
  PILOTS.serie.cohort = { ...saved, size };
  try { fn(); } finally { PILOTS.serie.cohort = saved; }
}

const tests = {
  "l'envelliment de la maduració: 24 mons nous, fins a l'època 8.000, i s'aturen si s'hi estableix la vida": () => {
    const lines = PILOTS.maduracio.worlds.map((w) => agingLine(w));
    assert.strictEqual(lines.length, 24);
    assert.strictEqual(new Set(lines.map((l) => l.split(' ')[0])).size, 24);
    assert.deepStrictEqual(lines.map((l) => Number(opt(l, 'seed'))), Array.from({ length: 24 }, (_, i) => 5001 + i));
    for (const l of lines) {
      assert.strictEqual(opt(l, 'epochs'), '8000');
      assert.strictEqual(opt(l, 'mixing'), '0');
      assert.strictEqual(opt(l, 'stop-after-event'), '0');
      assert.ok(opt(l, 'json').startsWith('fase2/resultats/maduracio/pilot/envelliment/'));
    }
  },
  'les branques: els mateixos nombres aleatoris de continuació a tots els braços d\'un món, i cada braç la seva captura': () => {
    for (const [name, entry] of [['maduracio', { world: '5007', start: 8000 }], ['zeros', { world: 'B2042', start: 5750 }]]) {
      const p = PILOTS[name], lines = branchLines(name, entry);
      assert.strictEqual(lines.length, p.arms.length * p.continuation.length);
      for (const [tag, offset] of p.continuation) {
        const mine = lines.filter((l) => l.split(' ')[0].endsWith(`-${tag}`));
        assert.strictEqual(mine.length, p.arms.length);
        assert.ok(mine.every((l) => Number(opt(l, 'seed')) === Number(entry.world.replace(/^[AB]/, '')) + offset), `${name}: les llavors de ${tag} no són comunes`);
      }
      assert.strictEqual(new Set(lines.map((l) => opt(l, 'from'))).size, p.arms.length, `${name}: cada braç ha de tenir la seva captura`);
      assert.strictEqual(new Set(lines.map((l) => opt(l, 'json'))).size, lines.length);
      for (const l of lines) {
        assert.strictEqual(Number(opt(l, 'epochs')), entry.start + p.horizon);
        assert.strictEqual(Number(opt(l, 'mixing')), p.mixing);
        assert.strictEqual(opt(l, 'stop-after-event') ?? null, p.stopAfterEvent === null ? null : String(p.stopAfterEvent));
      }
      // la llista del manifest porta l'ordre que escriurà sim.mjs
      const b = branchList(name, entry);
      assert.deepStrictEqual(b.map((x) => x.command), lines.map((l) => `node sim.mjs ${l.split(' ').slice(1).join(' ')}`));
      assert.deepStrictEqual(b.map((x) => x.seed), lines.map((l) => Number(opt(l, 'seed'))));
    }
    assert.deepStrictEqual(PILOTS.zeros.arms, ['continue', 'zeros-data', 'placebo-cell', 'zeros-inert']);
  },
  "sim.mjs accepta les opcions de l'envelliment i de les branques (amb menys èpoques)": () => withTmp((tmp) => {
    const sim = (args) => spawnSync(process.execPath, [join(root, 'sim.mjs'), ...args.split(' ')], { cwd: root, encoding: 'utf8' });
    const aging = agingLine('5001').split(' ').slice(1).join(' ').replace('--epochs 8000', '--epochs 10').replaceAll('fase2/resultats/maduracio/pilot/envelliment', join(tmp, 'e').replaceAll('\\', '/'));
    let r = sim(aging);
    assert.strictEqual(r.status, 0, r.stderr);
    const capture = join(tmp, 'e', 'captures', 'llavor5001-mon512x256-r2-final.bin').replaceAll('\\', '/');
    const branch = branchLines('maduracio', { world: '5001', start: 10 })[0].split(' ').slice(1).join(' ')
      .replace('--epochs 8010', '--epochs 20').replace(/--from \S+/, `--from ${capture}`).replaceAll('fase2/resultats/maduracio/pilot/branques', join(tmp, 'b').replaceAll('\\', '/'));
    r = sim(branch);
    assert.strictEqual(r.status, 0, r.stderr);
  }),
  "la validació de l'envelliment (AU2-85): sencer o establert, bé; incomplet o sense censos, un error": () => withTmp((tmp) => {
    writeAging(tmp, '5001', agingRecords('5001'));
    let a = validateAging('5001', { root: tmp });
    assert.deepStrictEqual(a.problems, []);
    assert.strictEqual(a.status.included, true);
    assert.deepStrictEqual(a.status.censusAtAge, { replicating: 1, heritable: 0, sample: 2048 });
    writeAging(tmp, '5002', agingRecords('5002', { establishAt: 4000 }));
    a = validateAging('5002', { root: tmp });
    assert.deepStrictEqual(a.problems, []);
    assert.deepStrictEqual(a.status, { included: false, reason: "establiment abans de l'època 8000 (a l'època 4000)" });
    // el cas de l'auditor 2: només la línia d'inici i la final
    writeAging(tmp, '5003', [{ type: 'start' }, { type: 'end', epoch: 8000, event: null }]);
    assert.ok(validateAging('5003', { root: tmp }).problems.length > 0, 'un envelliment sense censos no pot ser vàlid');
    const cases = [
      [(r) => r.filter((x) => !(x.type === 'census' && x.epoch === 8000)), /censos/],
      [(r) => r.filter((x) => x.type !== 'measure'), /mesures/],
      [(r) => { r[0].command = r[0].command.replace('--seed 5004', '--seed 9'); return r; }, /command/],
      [(r) => { r[0].code = 'abcdef1+canvis'; return r; }, /commit net/],
      [(r) => { r[r.length - 1].reason = 'HOE'; return r; }, /ni l'horitzó/],
      [(r) => { r.splice(5, 0, { type: 'misteri', epoch: 300 }); return r; }, /tipus/],
      [(r) => { const c = r.find((x) => x.type === 'census'); c.heritable = 5; return r; }, /no és vàlid/],
    ];
    cases.forEach(([mutate, re], i) => {
      writeAging(tmp, '5004', mutate(agingRecords('5004')));
      const pr = validateAging('5004', { root: tmp }).problems;
      assert.ok(pr.some((x) => re.test(x)), `no detecta el cas ${i}: ${pr.join('; ')}`);
    });
  }),
  "el manifest de la maduració, coherent, passa; i cada incoherència és un problema (AU2-84, AU2-88)": () => withTmp((tmp) => {
    const m = maturationFixture(tmp);
    assert.deepStrictEqual(checkCaptures('maduracio', { root: tmp }), []);
    assert.deepStrictEqual(preflight('maduracio', { root: tmp }), []);
    const mutations = [
      ['un manifest buit', (x) => ({ ...x, worlds: [], branches: [] }), /exactament els 24/],
      ['un món de menys', (x) => ({ ...x, worlds: x.worlds.slice(1) }), /exactament els 24/],
      ["un altre horitzó", (x) => ({ ...x, params: { ...x.params, horizon: 4000 } }), /paràmetres/],
      ['un món exclòs sense motiu', (x) => { x.worlds[0].included = false; return x; }, /inclusió|branques/],
      ['una branca de menys', (x) => ({ ...x, branches: x.branches.slice(1) }), /branques del manifest/],
      ['una llavor repetida', (x) => { x.branches[1] = { ...x.branches[1], seed: x.branches[0].seed }; return x; }, /branques del manifest/],
      ["l'exclusió de l'establiment, canviada", (x) => { x.worlds[2].reason = 'cap'; return x; }, /exclusió/],
      ["un registre d'envelliment que no és el seu", (x) => { x.worlds[0].aging.sha256 = '0'.repeat(64); return x; }, /envelliment no és el del manifest/],
    ];
    for (const [what, mutate, re] of mutations) {
      rewrite(tmp, mutate(JSON.parse(JSON.stringify(m))));
      const pr = checkCaptures('maduracio', { root: tmp });
      assert.ok(pr.some((x) => re.test(x)), `no detecta ${what}: ${pr.slice(0, 3).join('; ')}`);
    }
    rewrite(tmp, m);
    // la procedència d'una transformació (AU2-88): un registre que diu que ve d'una altra captura
    const a = m.worlds[0].arms['shuffle-all'], rec = JSON.parse(readFileSync(join(tmp, a.record.file), 'utf8'));
    put(tmp, a.record.file, JSON.stringify({ ...rec, from: m.worlds[1].capture }));
    let pr = checkCaptures('maduracio', { root: tmp });
    assert.ok(pr.some((x) => /registre de la transformació/.test(x)), pr.join('; '));
    put(tmp, a.record.file, JSON.stringify(rec));
    // una captura transformada canviada, i una llista amb una línia de menys
    put(tmp, a.file, Buffer.from('una altra cosa'));
    assert.ok(checkCaptures('maduracio', { root: tmp }).some((x) => /SHA-256 del manifest/.test(x)));
    put(tmp, a.file, Buffer.from(`${m.worlds[0].world} shuffle-all`));
    const l = m.lists.pc.file, text = readFileSync(join(tmp, l), 'utf8');
    put(tmp, l, text.split('\n').slice(1).join('\n'));
    assert.ok(checkCaptures('maduracio', { root: tmp }).some((x) => /llista pc|llistes/.test(x)));
    put(tmp, l, text);
    // la comprovació prèvia: cap branca no pot haver començat
    put(tmp, m.branches[0].command.match(/--json (\S+)/)[1], '{}');
    assert.ok(preflight('maduracio', { root: tmp }).some((x) => /ja ha començat/.test(x)));
    assert.deepStrictEqual(checkCaptures('maduracio', { root: tmp }), [], 'la comprovació de les captures serveix també després de la sèrie');
  }),
  "la sèrie: la llista de llavors, l'envelliment, tres braços sense cap captura de les branques (AUD-124), i la proporció 3:2": () => {
    const p = PILOTS.serie;
    assert.strictEqual(p.candidates.length, 400);
    assert.deepStrictEqual([p.candidates[0], p.candidates[399]], ['6001', '6400']);
    assert.deepStrictEqual(designParams('serie').cohort, { from: 6001, to: 6400, size: 150 });
    assert.ok(!('cohort' in designParams('maduracio')) && !('cohort' in designParams('zeros')), 'els manifests congelats no hi porten la cohort');
    const aging = agingLine('6001', 'serie');
    assert.strictEqual(opt(aging, 'seed'), '6001');
    assert.ok(opt(aging, 'json').startsWith('fase2/resultats/maduracio/serie/envelliment/'));
    assert.strictEqual(opt(aging, 'stop-after-event'), '0');
    const lines = branchLines('serie', { world: '6001', start: 8000 });
    assert.strictEqual(lines.length, 6);
    assert.deepStrictEqual([...new Set(lines.map((l) => opt(l, 'seed')))].sort(), ['406001', '506001']);
    assert.ok(lines.every((l) => !l.includes('--save')), 'les branques de la sèrie no desen cap captura');
    assert.ok(lines.every((l) => opt(l, 'epochs') === '16000' && opt(l, 'stop-after-event') === '0' && opt(l, 'mixing') === '0'));
    assert.deepStrictEqual(Array.from({ length: 10 }, (_, i) => machineOf('serie', i)), ['pc', 'pc', 'pc', 'vm', 'vm', 'pc', 'pc', 'pc', 'vm', 'vm']);
    assert.deepStrictEqual(Array.from({ length: 4 }, (_, i) => machineOf('maduracio', i)), ['pc', 'vm', 'pc', 'vm']);
    assert.deepStrictEqual(p.test.contrasts, [['continue', 'reinit'], ['shuffle-all', 'reinit']]);
  },
  "la sèrie: la cohort són els primers mons de la llista que hi entren; el manifest coherent passa, i amb una màquina només se'n miren les captures dels seus mons": () => withTmp((tmp) => withCohort(5, () => {
    const p = PILOTS.serie, m = seriesFixture(tmp);
    assert.deepStrictEqual(agedCandidates('serie', { root: tmp }), ['6001', '6002', '6003', '6004', '6005', '6006', '6007', '6008']);
    assert.deepStrictEqual(m.worlds.filter((w) => w.included).map((w) => w.world), ['6001', '6003', '6005', '6006', '6007']);
    assert.deepStrictEqual(checkCaptures('serie', { root: tmp }), []);
    assert.deepStrictEqual(preflight('serie', { root: tmp }), []);
    assert.deepStrictEqual(preflight('serie', { root: tmp, machine: 'vm' }), []);
    const mutations = [
      ['un món saltat', (x) => ({ ...x, worlds: x.worlds.filter((w) => w.world !== '6003') }), /primers de la llista/],
      ['un món de més al final, exclòs', (x) => { x.worlds.push({ ...x.worlds[1], world: '6008' }); return x; }, /darrer món inclòs|primers/],
      ['un món inclòs de menys', (x) => { x.worlds[x.worlds.length - 1].included = false; return x; }, /mons inclosos|inclusió/],
      ['una altra cohort', (x) => ({ ...x, params: { ...x.params, cohort: { ...x.params.cohort, size: 6 } } }), /paràmetres/],
      ["les branques amb captures", (x) => { x.branches[0] = { ...x.branches[0], command: `${x.branches[0].command} --save a` }; return x; }, /branques del manifest/],
    ];
    for (const [what, mutate, re] of mutations) {
      rewrite(tmp, mutate(JSON.parse(JSON.stringify(m))), 'serie');
      const pr = checkCaptures('serie', { root: tmp });
      assert.ok(pr.some((x) => re.test(x)), `no detecta ${what}: ${pr.slice(0, 3).join('; ')}`);
    }
    rewrite(tmp, m, 'serie');
    // una màquina només necessita les captures dels mons de la seva llista: a la màquina virtual, el 6006 i el 6007
    const pc = m.worlds.find((w) => w.world === '6001');
    for (const f of [pc.capture, ...Object.values(pc.arms).map((a) => a.file)]) rmSync(join(tmp, f));
    assert.deepStrictEqual(checkCaptures('serie', { root: tmp, machine: 'vm' }), []);
    assert.ok(checkCaptures('serie', { root: tmp, machine: 'pc' }).some((x) => /^6001: .*no hi ha la captura/.test(x)));
    assert.ok(checkCaptures('serie', { root: tmp }).some((x) => /6001/.test(x)), 'sense màquina, hi han de ser totes');
    // els registres i els escanejos, que van a git, es miren a totes dues
    const s = m.worlds.find((w) => w.world === '6001').arms.reinit.scan.file;
    put(tmp, s, '{}');
    assert.ok(checkCaptures('serie', { root: tmp, machine: 'vm' }).some((x) => /6001 reinit: l'escaneig/.test(x)));
    // un forat a l'envelliment és un error, no el final de la llista
    put(tmp, `${p.folder}/envelliment/e6010.jsonl`, '{}');
    assert.throws(() => agedCandidates('serie', { root: tmp }), /falta el registre de l'envelliment de 6009/);
  })),
  "la sèrie: cada llista és exactament la seva part (AU2-97), i l'escaneig de l'edat és de la captura d'origen, amb el codi de la preparació": () => withTmp((tmp) => withCohort(5, () => {
    const p = PILOTS.serie, m = seriesFixture(tmp);
    assert.deepStrictEqual(checkCaptures('serie', { root: tmp }), []);
    // les branques d'un món del PC, passades a la màquina virtual, amb les SHA-256 i els recomptes al dia: la unió és la
    // mateixa, però no la partició
    const pcFile = join(tmp, m.lists.pc.file), vmFile = join(tmp, m.lists.vm.file), pcText = readFileSync(pcFile, 'utf8'), vmText = readFileSync(vmFile, 'utf8');
    const pcLines = pcText.trim().split('\n'), moved = pcLines.filter((l) => l.startsWith('6001-')), kept = pcLines.filter((l) => !l.startsWith('6001-'));
    put(tmp, m.lists.pc.file, kept.join('\n') + '\n');
    put(tmp, m.lists.vm.file, [...moved, ...vmText.trim().split('\n')].join('\n') + '\n');
    const swapped = JSON.parse(JSON.stringify(m));
    for (const [machine, f] of [['pc', pcFile], ['vm', vmFile]]) Object.assign(swapped.lists[machine], { sha256: sha(readFileSync(f)), branches: readFileSync(f, 'utf8').trim().split('\n').length });
    rewrite(tmp, swapped, 'serie');
    let pr = checkCaptures('serie', { root: tmp });
    assert.ok(pr.some((x) => /la llista pc no és exactament la seva part/.test(x)) && pr.some((x) => /la llista vm no és exactament la seva part/.test(x)), pr.join('; '));
    assert.ok(!pr.some((x) => /les llistes no són exactament les branques/.test(x)), 'la unió és la mateixa');
    put(tmp, m.lists.pc.file, pcText); put(tmp, m.lists.vm.file, vmText);
    // el recompte de branques d'una llista, canviat
    rewrite(tmp, { ...m, lists: { ...m.lists, vm: { ...m.lists.vm, branches: m.lists.vm.branches + 1 } } }, 'serie');
    assert.ok(checkCaptures('serie', { root: tmp }).some((x) => /la llista vm no és exactament/.test(x)));
    rewrite(tmp, m, 'serie');
    // l'escaneig de l'edat d'una altra captura (fromSha256), o d'un altre codi, amb la SHA-256 del fitxer al dia al manifest
    const w = m.worlds.find((x) => x.world === '6001'), scan = JSON.parse(readFileSync(join(tmp, w.scan.file), 'utf8'));
    for (const [what, changed, re] of [['una altra captura', { fromSha256: '0'.repeat(64) }, /no és de la captura d'origen/], ['un altre codi', { code: '1234567' }, /no és el de la captura envellida/]]) {
      put(tmp, w.scan.file, JSON.stringify({ ...scan, ...changed }));
      const x = JSON.parse(JSON.stringify(m));
      x.worlds.find((y) => y.world === '6001').scan.sha256 = sha(readFileSync(join(tmp, w.scan.file)));
      rewrite(tmp, x, 'serie');
      pr = checkCaptures('serie', { root: tmp });
      assert.ok(pr.some((y) => /^6001: /.test(y) && re.test(y)), `no detecta ${what}: ${pr.join('; ')}`);
    }
    // un món exclòs per l'escaneig: el fromSha256 es mira contra la captura del disc, si s'hi és
    const ex = m.worlds.find((x) => x.world === '6004'), exScan = JSON.parse(readFileSync(join(tmp, ex.scan.file), 'utf8'));
    put(tmp, w.scan.file, JSON.stringify(scan)); rewrite(tmp, m, 'serie');
    put(tmp, ex.scan.file, JSON.stringify({ ...exScan, fromSha256: '0'.repeat(64) }));
    const y = JSON.parse(JSON.stringify(m));
    y.worlds.find((z) => z.world === '6004').scan.sha256 = sha(readFileSync(join(tmp, ex.scan.file)));
    rewrite(tmp, y, 'serie');
    assert.ok(checkCaptures('serie', { root: tmp }).some((z) => /^6004: .*no és de la captura d'origen/.test(z)));
  })),
  'els zeros: el manifest buit, o amb un paper canviat, és un problema; i la línia d\'ordres surt amb error (AU2-84)': () => withTmp((tmp) => {
    // un repositori mínim, com el de l'auditor 2, amb el programa i el repartiment de B2
    for (const d of ['fase1', 'fase2', 'eines']) {
      mkdirSync(join(tmp, d), { recursive: true });
      for (const f of readdirSync(join(root, d)).filter((f) => /\.m?js$/.test(f))) copyFileSync(join(root, d, f), join(tmp, d, f));
    }
    copyFileSync(join(root, 'package.json'), join(tmp, 'package.json'));
    put(tmp, 'fase2/resultats/b2/repartiment.json', readFileSync(join(root, 'fase2/resultats/b2/repartiment.json')));
    const dir = PILOTS.zeros.folder;
    put(tmp, `${dir}/manifest.json`, JSON.stringify({ worlds: [], params: { arms: PILOTS.zeros.arms } }));
    put(tmp, `${dir}/llista-pc.txt`, '\n'); put(tmp, `${dir}/llista-vm.txt`, '\n');
    let pr = checkCaptures('zeros', { root: tmp });
    assert.ok(pr.length > 0 && pr.some((x) => /exactament els 11/.test(x)), pr.join('; '));
    const r = spawnSync(process.execPath, [join(tmp, 'eines', 'pilot.mjs'), 'zeros', '--comprova'], { encoding: 'utf8' });
    assert.notStrictEqual(r.status, 0, 'la comprovació prèvia ha donat per bo un manifest buit');
    const worlds = PILOTS.zeros.worlds.map((world) => ({ world, role: world === 'B2002' ? 'control negatiu' : (PILOTS.zeros.roles[world] ?? 'prova'), included: true }));
    put(tmp, `${dir}/manifest.json`, JSON.stringify({ pilot: 'zeros', params: designParams('zeros'), tag: PILOTS.zeros.tag, dir: `${dir}/branques`, test: PILOTS.zeros.test, worlds, branches: [] }));
    pr = checkCaptures('zeros', { root: tmp });
    assert.ok(pr.some((x) => /B2002: el paper/.test(x)), pr.slice(0, 3).join('; '));
  }),
  'el simulador de l\'envelliment ha de ser el d\'ara': () => {
    const git = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' });
    if (git.status) { console.log('        (sense repositori de git: es salta)'); return; }
    assert.deepStrictEqual(simulatorProblems(git.stdout.trim(), { root }), []);
    assert.ok(simulatorProblems('0000000', { root }).length > 0, 'un commit que no existeix no pot passar');
  },
  "la línia d'ordres rebutja els usos incorrectes": () => {
    const run = (...a) => spawnSync(process.execPath, [join(root, 'eines', 'pilot.mjs'), ...a], { encoding: 'utf8' });
    assert.strictEqual(run('maduracio', '--res').status, 2);
    assert.strictEqual(run('zeros', '--envelliment').status, 2);
    assert.strictEqual(run('b3', '--prepara').status, 2);
    assert.strictEqual(run('zeros', '--prepara', '--paral·lel', '0').status, 2);
    assert.strictEqual(run('zeros', '--comprova', '--paral·lel', '2').status, 2);
    assert.strictEqual(run('serie', '--comprova', '--maquina', 'mac').status, 2);
    // --comprova-captures també accepta --maquina; sense manifest, és un problema i no un ús incorrecte
    assert.strictEqual(run('serie', '--comprova-captures', '--maquina', 'mac').status, 2);
    const vm = run('serie', '--comprova-captures', '--maquina', 'vm');
    assert.strictEqual(vm.status, 1, vm.stdout + vm.stderr);
    assert.ok(/La comprovació de les captures \(vm\) ha trobat 1 problemes/.test(vm.stdout) && /no hi ha cap manifest/.test(vm.stdout), vm.stdout);
    assert.strictEqual(run('maduracio', '--envelliment', '--mons', '3').status, 2, '--mons és només de la sèrie');
    assert.strictEqual(run('serie', '--envelliment', '--mons', '401').status, 2);
    const aging = run('serie', '--envelliment');
    assert.strictEqual(aging.status, 0);
    assert.strictEqual(aging.stdout.trim().split('\n').length, 180);
    assert.strictEqual(run('serie', '--envelliment', '--mons', '3').stdout.trim().split('\n').length, 3);
  },
  'la potència de la maduració: els valors crítics de la prova de signes, i cap efecte dona com a molt α': () => {
    assert.strictEqual(critical(29, 0.025), 21); // el llindar de B2
    assert.strictEqual(critical(10, 0.025), 9);
    assert.strictEqual(critical(5, 0.025), 6); // impossible: 1/32 > 0,025
    const p0 = power({ pc: 0.2, ps: 0.2, worlds: 80, sims: 2000 });
    assert.ok(p0 <= 0.035, `sense efecte, la potència hauria de ser com a molt α (és ${p0})`);
    assert.ok(power({ pc: 0.22, ps: 0.11, worlds: 120, sims: 2000 }) > 0.8);
  },
  'la potència de la sèrie: la família de Holm, i la validesa de les dues proves amb concordances diferents (auditoria 19)': () => {
    // sense cap efecte, rebutjar-ne almenys una no passa gaire d'α
    const none = familyPower({ pc: 0.2, ps: 0.2, pr: 0.2, worlds: 150, sims: 1000 });
    assert.ok(none.any <= 0.045, `sense efecte, ${none.any}`);
    const half = familyPower({ pc: 0.27, ps: 0.27, pr: 0.135, worlds: 150, rho: 0.03, sims: 1000 });
    assert.ok(half.b > 0.9 && half.c > 0.9 && half.both > 0.85, JSON.stringify(half));
    assert.ok(half.both <= Math.min(half.b, half.c) && half.any >= Math.max(half.b, half.c));
    // el mateix ritme, i una concordança de 0 contra 0,4: la de signes rebutja massa sovint, la de permutació, no
    const v = validity({ p: 0.2, worlds: 150, rhoA: 0, rhoB: 0.4, alpha: 0.0125, sims: 4000 });
    assert.ok(v.signes > 0.03, `la de signes, ${v.signes}`);
    assert.ok(v.permutacio < 0.02, `la de permutació, ${v.permutacio}`);
    // la calibrada (AUD-128, AU2-94): per sota de la de permutació, i amb concordança 1 a reinit i un ritme del 2 %, on la
    // de permutació passa d'α, per sota d'α
    assert.ok(v.calibrada <= v.permutacio && v.calibrada < 0.0125 + 0.004, `la calibrada, ${v.calibrada}`);
    const low = validity({ p: 0.02, worlds: 150, rhoA: 0, rhoB: 1, alpha: 0.0125, sims: 6000 });
    assert.ok(low.permutacio > 0.017 && low.calibrada < 0.008, JSON.stringify(low));
    // la família amb els llindars calibrats és la de per defecte, i amb els nominals de la permutació rebutja més
    const perm = familyPower({ pc: 0.27, ps: 0.27, pr: 0.135, worlds: 150, rho: 0.03, sims: 1000, test: 'permutacio' });
    assert.ok(perm.both >= half.both - 0.03 && half.both > 0.9, `${JSON.stringify(perm)} ${JSON.stringify(half)}`);
    assert.throws(() => familyPower({ pc: 0.27, ps: 0.27, pr: 0.135, k: 4, worlds: 80, sims: 10 }), /K = 2/);
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
