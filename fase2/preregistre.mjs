// La comprovació del preregistre d'una sèrie confirmatòria, compartida per fase2/estadistica.mjs (la llei 2) i
// fase2/b2-confirmacio.mjs (B2). Només fa servir mòduls de Node, de manera que un programa la pot executar
// abans de carregar cap codi del projecte (AUD-81, auditoria 9).
//
// La sèrie es decideix amb el commit de l'etiqueta de git del preregistre i el manifest d'aquest commit. Es
// comprova (auditories 6 a 9: AUD-46, AUD-50, AUD-51, AUD-66, AUD-81, AU2-23, AU2-29, AU2-31, AU2-32; X-004):
//  - res no pot carregar codi sense tocar cap fitxer seguit: ni NODE_OPTIONS ni opcions de node;
//  - l'etiqueta ha de ser anotada, i la còpia de treball, al seu commit;
//  - cap fitxer seguit amb assume-unchanged ni skip-worktree;
//  - el contingut de TOTS els fitxers seguits ha de ser el de l'etiqueta (git hash-object contra git
//    ls-tree), i no hi pot haver fitxers de codi nous no seguits;
//  - git s'executa amb un entorn net: sense cap variable GIT_* heretada (com GIT_CONFIG_COUNT, que pot
//    configurar un filtre), sense la configuració global ni la del sistema, i sense objectes de substitució
//    (git replace). hash-object, sense filtres: un filtre "clean" podria tornar el contingut de l'etiqueta per a
//    un fitxer que al disc és diferent;
//  - les SHA-256 del missatge de l'etiqueta han de coincidir amb els fitxers del commit, i hi han de ser les
//    dels fitxers de `required`. L'arbre de l'etiqueta és la referència; el missatge, un segon control.
// Un límit: la comprovació impedeix decidir amb codi canviat per error o amagat a git. Si el programa que la
// crida ja ha carregat codi del projecte canviat, aquest codi s'ha executat abans. Per això un programa nou
// l'ha de cridar abans de carregar res del projecte, com fa b2-confirmacio.mjs.
import { readFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));

// Retorna { commit, tag, tagObject, manifest } o { problem }. manifestPath i required, relatius a l'arrel.
// L'etiqueta és la que declara el manifest ("tag"), o defaultTag si no en declara cap.
export function checkPreregistration({ manifestPath, defaultTag, required, root = ROOT, env = process.env, execArgv = process.execArgv }) {
  const gitEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^GIT_/i.test(k)));
  // (/dev/null també a Windows: git l'entén, i en canvi no accepta el camí que dona os.devNull)
  Object.assign(gitEnv, { GIT_NO_REPLACE_OBJECTS: '1', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' });
  const run = (args, input) => execFileSync('git', args, { cwd: root, input, env: gitEnv, maxBuffer: 1 << 28, stdio: ['pipe', 'pipe', 'ignore'] });
  const git = (...a) => run(a).toString();
  if ((env.NODE_OPTIONS ?? '').trim()) return { problem: `NODE_OPTIONS no és buit (${env.NODE_OPTIONS}): podria carregar codi que no és a l'etiqueta` };
  if (execArgv.length) return { problem: `node s'ha executat amb opcions (${execArgv.join(' ')}): podrien carregar codi que no és a l'etiqueta` };
  let declared;
  try { declared = JSON.parse(readFileSync(join(root, manifestPath), 'utf8')); }
  catch { return { problem: `no es pot llegir el manifest ${manifestPath}` }; }
  const tag = declared.tag ?? defaultTag;
  let commit, tagObject;
  try {
    tagObject = git('rev-parse', '--verify', `refs/tags/${tag}`).trim();
    commit = git('rev-parse', `${tag}^{commit}`).trim();
  } catch { return { problem: `no hi ha l'etiqueta de git ${tag}` }; }
  try {
    if (git('cat-file', '-t', tagObject).trim() !== 'tag') return { problem: `l'etiqueta ${tag} no és anotada` };
    const head = git('rev-parse', 'HEAD').trim();
    if (head !== commit) return { problem: `la còpia de treball és al commit ${head}, no al del preregistre (${commit})` };
    const list = (paths) => paths.slice(0, 5).join(', ') + (paths.length > 5 ? ` i ${paths.length - 5} més` : '');
    const flagged = git('ls-files', '-v').split('\n').filter((l) => /^[a-zS] /.test(l)).map((l) => l.slice(2));
    if (flagged.length) return { problem: `hi ha fitxers marcats amb assume-unchanged o skip-worktree: ${list(flagged)}` };
    const tree = git('ls-tree', '-r', '-z', commit).split('\0').filter(Boolean).map((l) => {
      const [meta, path] = l.split('\t');
      const [, type, hash] = meta.split(' ');
      return { type, hash, path };
    }).filter((e) => e.type === 'blob');
    const missing = tree.filter((e) => !existsSync(join(root, e.path))).map((e) => e.path);
    if (missing.length) return { problem: `falten fitxers de l'etiqueta: ${list(missing)}` };
    const hashes = run(['hash-object', '--no-filters', '--stdin-paths'], tree.map((e) => e.path).join('\n') + '\n').toString().trim().split('\n');
    const changed = tree.filter((e, i) => hashes[i] !== e.hash).map((e) => e.path);
    if (changed.length) return { problem: `hi ha fitxers diferents dels de l'etiqueta: ${list(changed)}` };
    const extra = git('ls-files', '--others', '--exclude-standard', '--', '*.js', '*.mjs', '*.cjs', '*.json').trim().split('\n').filter(Boolean);
    if (extra.length) return { problem: `hi ha fitxers de codi que no són a l'etiqueta: ${list(extra)}` };
    const message = git('cat-file', '-p', tagObject);
    const listed = [...message.matchAll(/^([0-9a-f]{64})\s+(\S+)/gm)].map((m) => ({ sha: m[1], path: m[2] }));
    for (const needed of required) {
      if (!listed.some((l) => l.path === needed)) return { problem: `el missatge de l'etiqueta no porta la SHA-256 de ${needed}` };
    }
    for (const { sha, path } of listed) {
      let bytes;
      try { bytes = run(['show', `${commit}:${path}`]); } catch { return { problem: `el missatge de l'etiqueta cita ${path}, que no és al commit` }; }
      if (createHash('sha256').update(bytes).digest('hex') !== sha) return { problem: `la SHA-256 de ${path} no és la del missatge de l'etiqueta` };
    }
    return { commit, tag, tagObject, manifest: JSON.parse(git('show', `${commit}:${manifestPath}`)) };
  } catch (e) {
    return { problem: `no es pot llegir el preregistre amb git (${e.message})` };
  }
}
