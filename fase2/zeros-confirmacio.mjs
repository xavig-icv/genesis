// El programa de la prova preregistrada dels zeros (docs/protocol-zeros.md).
//
//   node fase2/zeros-confirmacio.mjs --decideix [--serie manifest.json] carpeta
//        la decisió confirmatòria. Només des d'una còpia del commit de l'etiqueta del manifest (preregistre-zeros)
//   node fase2/zeros-confirmacio.mjs --prova COMMIT [--serie manifest.json] carpeta
//        el mateix càlcul, sense decidir res, per provar-lo amb dades sintètiques. Es nega a llegir la carpeta de la
//        sèrie de veritat (la del manifest)
//
// Aquest fitxer només importa mòduls de Node i fase2/preregistre.mjs, que tampoc no en carrega cap altre. Amb
// --decideix, comprova el preregistre abans de carregar cap codi més del projecte (AUD-81, auditoria 9).
import { readFileSync } from 'fs';
import { resolve, relative, isAbsolute } from 'path';
import { checkPreregistration, ROOT } from './preregistre.mjs';

const PROGRAM_FILES = ['docs/protocol-zeros.md', 'fase2/zeros-confirmacio.mjs', 'fase2/zeros-serie.mjs', 'fase2/preregistre.mjs', 'eines/transforma.mjs', 'eines/pilot.mjs'];
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
const manifestPath = take('--serie', true) ?? 'fase2/resultats/zeros/serie/manifest.json';
if ([decideMode, testCommit !== null].filter(Boolean).length !== 1 || args.length !== 1) fail('Ús: node fase2/zeros-confirmacio.mjs --decideix|--prova COMMIT [--serie manifest.json] carpeta', 2);
const folder = resolve(args[0]);

let pre = null;
if (decideMode) {
  pre = checkPreregistration({ manifestPath, defaultTag: 'preregistre-zeros', required: [manifestPath, ...PROGRAM_FILES] });
  if (pre.problem) fail(`No es pot prendre la decisió confirmatòria: ${pre.problem}.`);
}
// Només ara, amb el preregistre comprovat (o sense decidir res), es carrega la resta del programa
const lib = await import('./zeros-serie.mjs');
const manifest = pre ? pre.manifest : JSON.parse(readFileSync(resolve(ROOT, manifestPath), 'utf8'));
if (!manifest.test || !manifest.dir) fail(`${manifestPath} no és el manifest d'una prova (no té "test" ni "dir")`, 2);

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
if (pre) {
  console.log('');
  for (const l of lib.decisionLines(result)) console.log(l);
}
