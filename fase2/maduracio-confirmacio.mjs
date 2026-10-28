// El programa de la sèrie preregistrada de la maduració (docs/protocol-maduracio.md).
//
//   node fase2/maduracio-confirmacio.mjs --decideix [--serie manifest.json] carpeta
//        la decisió confirmatòria. Només des d'una còpia del commit de l'etiqueta del manifest (preregistre-maduracio)
//   node fase2/maduracio-confirmacio.mjs --prova COMMIT [--serie manifest.json] carpeta
//        el mateix càlcul, sense decidir res, per provar-lo amb dades sintètiques. Es nega a llegir la carpeta de la
//        sèrie de veritat (la del manifest)
//
// Aquest fitxer només importa mòduls de Node i fase2/preregistre.mjs, que tampoc no en carrega cap altre. Amb
// --decideix, comprova el preregistre abans de carregar cap codi més del projecte (AUD-81, auditoria 9).
import { readFileSync, realpathSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, relative, isAbsolute, join } from 'path';
import { checkPreregistration, ROOT } from './preregistre.mjs';

// els fitxers del programa i els que carrega (la validació de B2, el criteri d'establiment i el generador del bootstrap),
// la taula dels llindars calibrats, el seu certificat i el programa que els calcula, i les eines dels braços i del manifest
const THRESHOLDS = 'fase2/maduracio-llindars.json';
const PROGRAM_FILES = ['docs/protocol-maduracio.md', 'fase2/maduracio-confirmacio.mjs', 'fase2/maduracio-serie.mjs', 'fase2/b2-serie.mjs', 'fase2/census.js', 'fase1/soup.js', 'fase2/preregistre.mjs', THRESHOLDS, 'fase2/maduracio-llindars-certificat.json', 'eines/llindars-maduracio.mjs', 'eines/transforma.mjs', 'eines/pilot.mjs'];
// la sèrie de veritat: el seu manifest i la carpeta dels seus registres, que --prova no llegeix mai (AU2-98)
const SERIES_MANIFEST = 'fase2/resultats/maduracio/serie/manifest.json';
const SERIES_DIR = 'fase2/resultats/maduracio/serie/branques';
const fail = (msg, code = 1) => { console.log(msg); process.exit(code); };

const args = process.argv.slice(2);
const take = (flag, withValue) => {
  const i = args.indexOf(flag);
  if (i < 0) return withValue ? null : false;
  const v = withValue ? args[i + 1] : true;
  args.splice(i, withValue ? 2 : 1);
  return v;
};
const decideMode = take('--decideix', false), testCommit = take('--prova', true);
const manifestPath = take('--serie', true) ?? SERIES_MANIFEST;
if ([decideMode, testCommit !== null].filter(Boolean).length !== 1 || args.length !== 1 || args[0].startsWith('--')) fail('Ús: node fase2/maduracio-confirmacio.mjs --decideix|--prova COMMIT [--serie manifest.json] carpeta', 2);
const folder = resolve(args[0]);

let pre = null;
if (decideMode) {
  pre = checkPreregistration({ manifestPath, defaultTag: 'preregistre-maduracio', required: [manifestPath, ...PROGRAM_FILES] });
  if (pre.problem) fail(`No es pot prendre la decisió confirmatòria: ${pre.problem}.`);
}
// Només ara, amb el preregistre comprovat (o sense decidir res), es carrega la resta del programa
const lib = await import('./maduracio-serie.mjs');
let manifest;
try { manifest = pre ? pre.manifest : JSON.parse(readFileSync(resolve(ROOT, manifestPath), 'utf8')); } catch { fail(`no es pot llegir el manifest ${manifestPath}`, 2); }
if (!manifest.test || !manifest.dir) fail(`${manifestPath} no és el manifest d'una prova (no té "test" ni "dir")`, 2);

if (testCommit !== null) {
  // --prova no llegeix cap registre de la sèrie de veritat (AU2-96, AU2-98, auditories 20 i 21):
  //   - les carpetes protegides: la del manifest que es dona i, sempre, la de la sèrie de veritat (i la del seu manifest, si
  //     en diu una altra). La de l'argument no hi pot ser, ni pel seu camí real (un enllaç simbòlic o una unió de Windows);
  //   - si la sèrie de veritat ja té cap registre, --prova no s'executa en aquesta còpia del repositori;
  //   - cada registre que es llegiria, abans de llegir-lo: no pot ser dins d'una carpeta protegida pel seu camí real (un
  //     enllaç simbòlic), ni el mateix fitxer, pel dispositiu i l'inode, que cap fitxer d'una carpeta protegida (un enllaç dur).
  // Una còpia dels registres no es pot detectar: fins a la decisió, només es copien a la carpeta del commit de l'etiqueta.
  const refuse = (why) => fail(`--prova no llegeix la carpeta de la sèrie (${why}): els resultats només es miren amb --decideix.`, 2);
  const inside = (dir, f) => { const rel = relative(dir, f); return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel)); };
  const physical = (p) => { try { return realpathSync.native(p); } catch { return p; } };
  const files = (d) => { try { return readdirSync(d).map((f) => join(d, f)); } catch { return []; } };
  const identity = (f) => { try { const s = statSync(f, { bigint: true }); return s.ino ? `${s.dev}:${s.ino}` : null; } catch { return null; } };
  const seriesDirs = [SERIES_DIR];
  try { const d = JSON.parse(readFileSync(resolve(ROOT, SERIES_MANIFEST), 'utf8')).dir; if (typeof d === 'string') seriesDirs.push(d); } catch { /* encara no hi ha el manifest */ }
  const shielded = new Map(); // el camí absolut de cada carpeta protegida, i com la diu el manifest
  for (const d of [String(manifest.dir), ...seriesDirs]) if (!shielded.has(resolve(ROOT, d))) shielded.set(resolve(ROOT, d), d);
  for (const [d, name] of shielded) if (inside(d, folder) || inside(physical(d), physical(folder))) refuse(name);
  for (const d of new Set(seriesDirs)) {
    if (files(resolve(ROOT, d)).some((f) => f.endsWith('.jsonl'))) fail(`--prova no s'executa en una còpia del repositori que ja té registres de la sèrie (${d}): les proves amb dades sintètiques es fan en una altra còpia.`, 2);
  }
  const guarded = new Set([...shielded.keys()].flatMap(files).map(identity).filter(Boolean));
  for (const b of Array.isArray(manifest.branches) ? manifest.branches : []) {
    const f = join(folder, `${b?.id}.jsonl`);
    if (!existsSync(f)) continue;
    if ([...shielded.keys()].some((d) => inside(physical(d), physical(f)))) refuse(`${b.id}.jsonl és un enllaç a un registre de la sèrie`);
    if (guarded.has(identity(f))) refuse(`${b.id}.jsonl és el mateix fitxer que un registre de la sèrie`);
  }
  if (!/^[0-9a-f]{40}$/.test(testCommit)) fail('--prova necessita un commit sencer (40 xifres hexadecimals)', 2);
  console.log(`MODE DE PROVA, sense cap decisió: commit ${testCommit}, manifest ${manifestPath}`);
}

// la taula dels llindars calibrats (§6): amb --decideix, la de l'etiqueta
if (pre && manifest.test.thresholds !== THRESHOLDS) fail(`el manifest no fa servir la taula dels llindars del preregistre (${THRESHOLDS})`);
const thresholds = lib.readThresholds(resolve(ROOT, String(manifest.test.thresholds)), manifest.test.alpha);
if (thresholds.problems.length) fail(`La taula dels llindars no és vàlida (${thresholds.problems.length} problemes):\n${thresholds.problems.slice(0, 10).map((p) => `  ${p}`).join('\n')}`);
const commit = pre ? pre.commit : testCommit;
const { branches, problems } = lib.readSeries(folder, manifest, { commit });
if (problems.length) {
  fail(`La sèrie no és la del manifest (${problems.length} problemes):\n${problems.slice(0, 20).map((p) => `  ${p}`).join('\n')}${problems.length > 20 ? `\n  i ${problems.length - 20} més` : ''}`);
}
if (pre) console.log(`Commit del preregistre: ${pre.commit} (etiqueta de git ${pre.tag} (objecte ${pre.tagObject}); manifest ${manifestPath})`);
const result = lib.analyse(branches, manifest, thresholds.table);
for (const l of result.lines) console.log(l);
if (pre) {
  console.log('');
  for (const l of lib.decisionLines(result)) console.log(l);
}
