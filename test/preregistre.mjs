// Proves del camí confirmatori de fase2/estadistica.mjs amb un repositori de git de veritat: una còpia
// mínima del programa, una etiqueta anotada i una sèrie sintètica. Comprovacions de la iteració 4 (A1–A4;
// AUD-51, AU2-31, AU2-32, AUD-66 i X-004 del xat de les auditories; AUD-81 de l'auditoria 9). Executa: node test/preregistre.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, copyFileSync, readdirSync, appendFileSync, symlinkSync, cpSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
const MANIFEST = {
  name: 'Sèrie de prova',
  groups: { A: { label: 'A', mixing: 0, seeds: { 1: [1, 3], 2: [4, 5] } }, B: { label: 'B', mixing: 0.01, seeds: { 1: [11, 13], 2: [14, 15] } } },
  params: { programs: 64, world: [8, 8], radius: 2, mutation: 0.00024, rng: 'v2', epochs: 1000, every: 100, start: 0,
    census: { version: 'v3', every: 250, sample: 64, seed: 7 }, event: { share: 0.01, censuses: 2, stopAfter: 500 } },
  stages: { 1: { perGroup: 3, bound: 2.479178635 }, 2: { perGroup: 5, bound: 2.004268879 } },
};

// Un experiment sintètic amb el format de sim.mjs (el mateix que a test/estadistica.mjs)
function experiment({ seed, mixing, eventAt, code }) {
  const { epochs } = MANIFEST.params, every = 250, stopAfter = 500;
  const end = eventAt === null ? epochs : Math.min(epochs, eventAt + stopAfter);
  const records = [{ type: 'start', code, seed, mixing, ...MANIFEST.params }];
  for (let e = 1; e <= end; e++) {
    if (e % every === 0) {
      const h = eventAt !== null && e >= eventAt ? 10 : 0;
      records.push({ type: 'census', version: 'v3', epoch: e, sample: 64, replicating: h + 1, solo: h + 1, context: 0,
        heritable: h, heritableSolo: h, heritableContext: 0, families: [] });
      if (eventAt !== null && e === eventAt + every) records.push({ type: 'event', epoch: eventAt, confirmed: e });
    }
    if (e % 100 === 0) records.push({ type: 'measure', epoch: e, h0: 7.9, hoe: 0.2, ops: 1000, runs: 2400, epochs: 100, seconds: 1 });
  }
  records.push({ type: 'end', epoch: end, reason: eventAt !== null && eventAt + stopAfter <= epochs ? 'establiment' : 'horitzó' });
  return records;
}
function writeSeries(dir, code) {
  const groups = { A: [[1, null], [2, 500], [3, null]], B: [[11, 250], [12, 250], [13, 750]] };
  for (const [g, list] of Object.entries(groups)) {
    mkdirSync(join(dir, g), { recursive: true });
    for (const [seed, eventAt] of list) {
      const records = experiment({ seed, mixing: MANIFEST.groups[g].mixing, eventAt, code });
      writeFileSync(join(dir, g, `s${seed}.jsonl`), records.map((r) => JSON.stringify(r)).join('\n') + '\n');
    }
  }
  return [join(dir, 'A'), join(dir, 'B')];
}

const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const GIT = ['-c', 'user.name=prova', '-c', 'user.email=prova@exemple.invalid', '-c', 'core.autocrlf=false'];

// Una còpia mínima del repositori, amb un commit i l'etiqueta anotada del preregistre
function withRepo(fn) {
  const tmp = mkdtempSync(join(tmpdir(), 'preregistre-'));
  try {
    const repo = join(tmp, 'repo');
    for (const d of ['fase1', 'fase2', 'docs']) mkdirSync(join(repo, d), { recursive: true });
    copyFileSync(join(root, 'package.json'), join(repo, 'package.json'));
    for (const d of ['fase1', 'fase2']) {
      for (const f of readdirSync(join(root, d)).filter((f) => /\.m?js$/.test(f))) copyFileSync(join(root, d, f), join(repo, d, f));
    }
    writeFileSync(join(repo, 'docs', 'protocol-estadistic.md'), '# Protocol de prova\n');
    writeFileSync(join(repo, 'fase2', 'serie-llei2.json'), JSON.stringify(MANIFEST, null, 1) + '\n');
    const git = (...a) => {
      const r = spawnSync('git', [...GIT, ...a], { cwd: repo, encoding: 'utf8' });
      if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`);
      return r.stdout.trim();
    };
    git('init', '-q'); git('add', '-A'); git('commit', '-q', '-m', 'preregistre de prova');
    const tagMessage = (files = ['docs/protocol-estadistic.md', 'fase2/serie-llei2.json', 'fase2/estadistica.mjs']) =>
      'Preregistre de prova\n\n' + files.map((f) => `${sha(join(repo, f))}  ${f}`).join('\n') + '\n';
    const tag = (name, message) => { git('tag', '-a', name, '-m', message); return git('rev-parse', `refs/tags/${name}`); };
    const tagObject = tag('preregistre-llei2', tagMessage());
    const commit = git('rev-parse', 'HEAD');
    const [a, b] = writeSeries(join(tmp, 'dades'), commit.slice(0, 7));
    const decide = (extra = [], { env = {}, node = [] } = {}) => spawnSync(process.execPath, [...node, 'fase2/estadistica.mjs', '--etapa', '1', ...extra, a, b],
      { cwd: repo, encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '', ...env } });
    fn({ repo, git, tag, tagMessage, tagObject, commit, decide, a, b });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
const decided = (r) => /^DECISIÓ: /m.test(r.stdout);
const refused = (r, why) => {
  assert.strictEqual(r.status, 1, r.stdout + r.stderr);
  assert.ok(!decided(r), r.stdout);
  assert.match(r.stdout, /No es pot prendre la decisió confirmatòria/);
  assert.match(r.stdout, why);
};

const tests = {
  "amb l'etiqueta anotada i la còpia idèntica, decideix, i diu quin objecte d'etiqueta ha fet servir": () => withRepo(({ decide, tagObject, commit }) => {
    const r = decide();
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    assert.ok(decided(r), r.stdout);
    assert.match(r.stdout, new RegExp(`Commit del preregistre: ${commit} \\(etiqueta de git preregistre-llei2 \\(objecte ${tagObject}\\)`));
  }),
  "unes carpetes de dades no seguides dins de la còpia no bloquegen res": () => withRepo(({ repo, decide }) => {
    mkdirSync(join(repo, 'dades-locals'));
    writeFileSync(join(repo, 'dades-locals', 'x.jsonl'), '{}\n');
    writeFileSync(join(repo, 'dades-locals', 'x.log'), 'registre\n');
    assert.ok(decided(decide()));
  }),
  "una etiqueta lleugera no serveix (AU2-32)": () => withRepo(({ git, decide }) => {
    git('tag', '-d', 'preregistre-llei2'); git('tag', 'preregistre-llei2');
    refused(decide(), /no és anotada/);
  }),
  "un canvi amagat amb assume-unchanged o amb skip-worktree no passa (AUD-51)": () => withRepo(({ repo, git, decide }) => {
    for (const flag of ['--assume-unchanged', '--skip-worktree']) {
      appendFileSync(join(repo, 'fase2', 'census.js'), '\n// canvi amagat\n');
      git('update-index', flag, 'fase2/census.js');
      assert.strictEqual(git('status', '--porcelain'), '', `${flag}: git status ho amaga`);
      refused(decide(), /assume-unchanged o skip-worktree/);
      git('update-index', flag.replace('--', '--no-'), 'fase2/census.js');
      git('checkout', '--', 'fase2/census.js');
    }
  }),
  "qualsevol fitxer seguit canviat atura la decisió, també el protocol (AU2-31)": () => withRepo(({ repo, git, decide }) => {
    for (const f of ['docs/protocol-estadistic.md', 'fase1/bff.js', 'package.json']) {
      appendFileSync(join(repo, f), '\n');
      refused(decide(), new RegExp(`fitxers diferents dels de l'etiqueta: ${f.replace('.', '\\.')}`));
      git('checkout', '--', f);
    }
    assert.ok(decided(decide()));
  }),
  "un fitxer de codi nou que no és a l'etiqueta atura la decisió": () => withRepo(({ repo, decide }) => {
    writeFileSync(join(repo, 'fase2', 'nou.mjs'), 'export const x = 1;\n');
    refused(decide(), /fitxers de codi que no són a l'etiqueta: fase2\/nou\.mjs/);
  }),
  "el missatge de l'etiqueta: una SHA-256 equivocada, o la del programa que falta (X-004)": () => withRepo(({ git, tag, tagMessage, decide }) => {
    git('tag', '-d', 'preregistre-llei2');
    tag('preregistre-llei2', tagMessage().replace(/^[0-9a-f]{64}(?=  fase2\/estadistica\.mjs)/m, '0'.repeat(64)));
    refused(decide(), /la SHA-256 de fase2\/estadistica\.mjs no és la del missatge/);
    git('tag', '-d', 'preregistre-llei2');
    tag('preregistre-llei2', tagMessage(['docs/protocol-estadistic.md', 'fase2/serie-llei2.json']));
    refused(decide(), /no porta la SHA-256 de fase2\/estadistica\.mjs/);
  }),
  "NODE_OPTIONS o una opció de node atura la decisió (AUD-66)": () => withRepo(({ decide }) => {
    // (una opció vàlida i inofensiva: el programa no ha de mirar què fa, sinó que no n'hi hagi cap)
    refused(decide([], { env: { NODE_OPTIONS: '--max-old-space-size=4096' } }), /NODE_OPTIONS no és buit/);
    refused(decide([], { node: ['--no-warnings'] }), /node s'ha executat amb opcions \(--no-warnings\)/);
  }),
  // AUD-81 (auditoria 9): tres maneres deliberades de fer que git vegi el contingut de l'etiqueta en un fitxer
  // que al disc és diferent. A totes tres, census.js porta codi nou, i el programa no ha de decidir. (El codi
  // nou s'executa igualment en importar-lo, abans de la comprovació: la comprovació impedeix la decisió, no
  // l'execució. Vegeu la nota de preregistration() a fase2/estadistica.mjs.)
  "un filtre clean de git configurat amb variables d'entorn no amaga un canvi (AUD-81)": () => withRepo(({ repo, decide }) => {
    const original = join(repo, '..', 'census-original.js');
    copyFileSync(join(repo, 'fase2', 'census.js'), original);
    appendFileSync(join(repo, 'fase2', 'census.js'), "\nconsole.log('CODI MODIFICAT');\n");
    const attrs = join(repo, '..', 'attributes');
    writeFileSync(attrs, 'fase2/census.js filter=amaga\n');
    const r = decide([], { env: {
      GIT_CONFIG_COUNT: '2', GIT_CONFIG_KEY_0: 'core.attributesFile', GIT_CONFIG_VALUE_0: attrs.replace(/\\/g, '/'),
      GIT_CONFIG_KEY_1: 'filter.amaga.clean', GIT_CONFIG_VALUE_1: `sh -c 'cat > /dev/null; cat "${original.replace(/\\/g, '/')}"'`,
    } });
    refused(r, /fitxers diferents dels de l'etiqueta: fase2\/census\.js/);
  }),
  "el mateix filtre dins de .git tampoc no amaga el canvi (AUD-81)": () => withRepo(({ repo, git, decide }) => {
    const original = join(repo, '..', 'census-original.js');
    copyFileSync(join(repo, 'fase2', 'census.js'), original);
    appendFileSync(join(repo, 'fase2', 'census.js'), "\nconsole.log('CODI MODIFICAT');\n");
    writeFileSync(join(repo, '.git', 'info', 'attributes'), 'fase2/census.js filter=amaga\n');
    git('config', 'filter.amaga.clean', `sh -c 'cat > /dev/null; cat "${original.replace(/\\/g, '/')}"'`);
    const r = decide();
    refused(r, /fitxers diferents dels de l'etiqueta: fase2\/census\.js/);
  }),
  "git replace de l'arbre de l'etiqueta no amaga el canvi (AUD-81)": () => withRepo(({ repo, git, commit, decide }) => {
    appendFileSync(join(repo, 'fase2', 'census.js'), "\nconsole.log('CODI MODIFICAT');\n");
    const before = git('rev-parse', `${commit}^{tree}`);
    git('add', 'fase2/census.js');
    const after = git('write-tree');
    git('reset', '-q');
    git('replace', before, after);
    const r = decide();
    refused(r, /fitxers diferents dels de l'etiqueta: fase2\/census\.js/);
  }),
  // AUD-88 (auditoria 10): un fitxer seguit, o la seva carpeta, convertit en un enllaç simbòlic a una còpia idèntica
  // en una altra carpeta, on els mòduls que importa són diferents. A Windows, crear enllaços demana permisos: si no
  // es pot, la prova ho diu i se salta (a GitHub, amb Linux, s'executa).
  "un enllaç simbòlic a una còpia idèntica, o una carpeta enllaçada, atura la decisió (AUD-88)": () => withRepo(({ repo, decide }) => {
    const other = join(repo, '..', 'altre');
    for (const d of ['fase1', 'fase2']) cpSync(join(repo, d), join(other, d), { recursive: true });   // els mòduls que importa
    try { symlinkSync(join(other, 'fase2', 'census.js'), join(repo, 'fase2', 'census.enllac-prova.js'), 'file'); }
    catch (e) { console.log(`        (omesa: no es poden crear enllaços simbòlics en aquest sistema, ${e.code})`); return; }
    rmSync(join(repo, 'fase2', 'census.enllac-prova.js'));
    rmSync(join(repo, 'fase2', 'census.js'));
    symlinkSync(join(other, 'fase2', 'census.js'), join(repo, 'fase2', 'census.js'), 'file');
    refused(decide(), /enllaços simbòlics, o dins d'una carpeta que ho és, i a l'etiqueta no: fase2\/census\.js/);
    // la carpeta sencera
    rmSync(join(repo, 'fase2', 'census.js'));
    copyFileSync(join(other, 'fase2', 'census.js'), join(repo, 'fase2', 'census.js'));
    rmSync(join(repo, 'fase1'), { recursive: true });
    symlinkSync(join(other, 'fase1'), join(repo, 'fase1'), 'dir');
    refused(decide(), /enllaços simbòlics, o dins d'una carpeta que ho és, i a l'etiqueta no: fase1\//);
  }),
  "una còpia en un altre commit no decideix": () => withRepo(({ repo, git, decide }) => {
    writeFileSync(join(repo, 'NOTES.md'), 'una nota\n');
    git('add', 'NOTES.md'); git('commit', '-q', '-m', 'un commit després de l\'etiqueta');
    refused(decide(), /no al del preregistre/);
  }),
  "--serie: el manifest d'una sèrie futura, amb la seva pròpia etiqueta (A4)": () => withRepo(({ repo, git, tag, tagMessage, decide }) => {
    writeFileSync(join(repo, 'fase2', 'serie-prova.json'), JSON.stringify({ ...MANIFEST, tag: 'preregistre-prova', sensitivities: ['herència sola (≥ 1 %)'] }, null, 1) + '\n');
    git('add', '-A'); git('commit', '-q', '-m', 'sèrie nova');
    // les dades han de ser del commit nou
    const commit = git('rev-parse', 'HEAD');
    const dades = join(repo, '..', 'dades2');
    writeSeries(dades, commit.slice(0, 7));
    tag('preregistre-prova', tagMessage(['docs/protocol-estadistic.md', 'fase2/serie-prova.json', 'fase2/estadistica.mjs']));
    const run = (extra) => spawnSync(process.execPath, ['fase2/estadistica.mjs', '--etapa', '1', ...extra, join(dades, 'A'), join(dades, 'B')],
      { cwd: repo, encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: '' } });
    const r = run(['--serie', 'fase2/serie-prova.json']);
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /etiqueta de git preregistre-prova .*manifest fase2\/serie-prova\.json/);
    // només les sensibilitats que tria el manifest (A8)
    assert.match(r.stdout, /herència sola \(≥ 1 %\)/);
    assert.doesNotMatch(r.stdout, /HOE > 1/);
    // sense --serie, l'etiqueta per defecte apunta a un altre commit
    refused(run([]), /no al del preregistre/);
  }),
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
