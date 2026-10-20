// El programa de la sèrie preregistrada de B2 (docs/protocol-b2.md, §8).
//
//   node fase2/b2-confirmacio.mjs --decideix [--serie manifest.json] carpeta
//        la decisió confirmatòria. Només des d'una còpia del commit de l'etiqueta del manifest
//        (preregistre-b2), i només si el manifest és el final
//   node fase2/b2-confirmacio.mjs --prova COMMIT [--serie manifest.json] carpeta
//        el mateix càlcul, sense decidir res, per provar-lo amb dades sintètiques. Es nega a llegir la carpeta
//        de la sèrie de veritat (la del manifest)
//   node fase2/b2-confirmacio.mjs --llistes [--serie manifest.json] carpeta-sortida
//        les llistes de cada màquina, amb els noms opacs del manifest (no llegeix cap resultat)
//
// Aquest fitxer només importa mòduls de Node i fase2/preregistre.mjs, que tampoc no en carrega cap altre.
// Amb --decideix, comprova el preregistre abans de carregar cap codi més del projecte, de manera que un codi
// canviat no es pot executar abans de la comprovació (AUD-81, auditoria 9).
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve, relative, isAbsolute } from 'path';
import { checkPreregistration, ROOT } from './preregistre.mjs';

const PROGRAM_FILES = ['docs/protocol-b2.md', 'fase2/b2-confirmacio.mjs', 'fase2/b2-serie.mjs', 'fase2/preregistre.mjs'];
const fail = (msg, code = 1) => { console.log(msg); process.exit(code); };

const args = process.argv.slice(2);
const take = (flag, withValue) => {
  const i = args.indexOf(flag);
  if (i < 0) return withValue ? null : false;
  const v = withValue ? args[i + 1] : true;
  args.splice(i, withValue ? 2 : 1);
  return v;
};
const decideMode = take('--decideix', false), testCommit = take('--prova', true), listsMode = take('--llistes', false);
const manifestPath = take('--serie', true) ?? 'fase2/serie-b2.json';
const modes = [decideMode, testCommit !== null, listsMode].filter(Boolean).length;
if (modes !== 1 || args.length !== 1) fail('Ús: node fase2/b2-confirmacio.mjs --decideix|--prova COMMIT|--llistes [--serie manifest.json] carpeta', 2);
const folder = resolve(args[0]);

let pre = null;
if (decideMode) {
  pre = checkPreregistration({ manifestPath, defaultTag: 'preregistre-b2', required: [manifestPath, ...PROGRAM_FILES] });
  if (pre.problem) fail(`No es pot prendre la decisió confirmatòria: ${pre.problem}.`);
  if (pre.manifest.estat !== 'final') fail(`No es pot prendre la decisió confirmatòria: el manifest de l'etiqueta és "${pre.manifest.estat}", no el final.`);
}
// Només ara, amb el preregistre comprovat (o sense decidir res), es carrega la resta del programa
const lib = await import('./b2-serie.mjs');
const manifest = pre ? pre.manifest : JSON.parse(readFileSync(join(ROOT, manifestPath), 'utf8'));

if (listsMode) {
  mkdirSync(folder, { recursive: true });
  for (const [machine, lines] of Object.entries(lib.machineLists(manifest))) {
    writeFileSync(join(folder, `llista-${machine}.txt`), lines.join('\n') + '\n');
    console.log(`llista-${machine}.txt: ${lines.length} branques`);
  }
  process.exit(0);
}

if (testCommit !== null) {
  const real = resolve(ROOT, manifest.dir), rel = relative(real, folder);
  if (rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))) fail(`--prova no llegeix la carpeta de la sèrie (${manifest.dir}): els resultats només es miren amb --decideix.`, 2);
  if (!/^[0-9a-f]{40}$/.test(testCommit)) fail('--prova necessita un commit sencer (40 xifres hexadecimals)', 2);
  console.log(`MODE DE PROVA, sense cap decisió: commit ${testCommit}, manifest ${manifestPath}`);
}

const commit = pre ? pre.commit : testCommit;
const { worlds, problems } = lib.readSeries(folder, manifest, { commit });
if (problems.length) {
  fail(`La sèrie no és la del manifest (${problems.length} problemes):\n${problems.slice(0, 20).map((p) => `  ${p}`).join('\n')}${problems.length > 20 ? `\n  i ${problems.length - 20} més` : ''}`);
}
if (pre) console.log(`Commit del preregistre: ${pre.commit} (etiqueta de git ${pre.tag} (objecte ${pre.tagObject}); manifest ${manifestPath})`);
const result = lib.analyse(worlds, manifest);
for (const l of result.lines) console.log(l);
// Dues decisions, amb la correcció de Holm (protocol §6.4). La segona, amb la regla conjunta per origen (§6.3,
// AU2-65). Un no-rebuig es comunica com a no concloent, amb la potència del protocol (AUD-89, AU2-67)
if (pre) {
  const { regime, spread } = result.tests, n = manifest.tests.spread.censuses;
  const p = (t) => `p = ${t.p.toFixed(4)}${t.threshold === null ? '; no s\'hi arriba amb Holm' : `, llindar de Holm ${t.threshold}`}`;
  const origins = `A: ${spread.byOrigin.A.pos} de ${spread.byOrigin.A.n}; B: ${spread.byOrigin.B.pos} de ${spread.byOrigin.B.n}`;
  console.log('');
  console.log(regime.rejected
    ? `DECISIÓ 1 (el canvi de règim): es rebutja H0: la vida dura menys quan el seu món canvia de condició (${p(regime)})`
    : `DECISIÓ 1 (el canvi de règim): no es rebutja H0: no concloent; la sèrie no permet afirmar que la vida duri menys quan el seu món canvia de condició, i la potència era baixa (protocol §6.2) (${p(regime)})`);
  if (spread.rejected) console.log(`DECISIÓ 2 (l'expansió amb corrent): es rebutja H0: amb corrent, la vida establerta té més hereditaris als ${n} primers censos, als dos orígens (${origins}; ${p(spread)})`);
  else if (spread.holmRejected) console.log(`DECISIÓ 2 (l'expansió amb corrent): no es rebutja H0: la prova global surt, però el corrent no dona més vida a més de la meitat dels mons de tots dos orígens (${origins}), i no es pot atribuir al corrent (protocol §6.3) (${p(spread)})`);
  else console.log(`DECISIÓ 2 (l'expansió amb corrent): no es rebutja H0: no concloent; la sèrie no permet afirmar que, amb corrent, la vida establerta tingui més hereditaris als ${n} primers censos (${origins}; ${p(spread)})`);
}
