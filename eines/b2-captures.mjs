// Abans de llançar la sèrie de B2: comprova que les captures d'origen dels mons siguin les que declara el manifest
// (la SHA-256 de cada fitxer), a la màquina on s'executa (AU2-66, auditoria 10; protocol §7). El programa de la
// sèrie compara l'ordre i el camí de cada branca, però no els bytes de la captura que va carregar.
//
//   node eines/b2-captures.mjs [--serie fase2/serie-b2.json] [--maquina pc|vm] > CARPETA/captures-MAQUINA.txt
//
// Amb --maquina, només els mons d'aquella màquina; sense, tots. La sortida diu el commit i la versió de Node, i
// acaba amb el codi 1 si alguna captura falta o és diferent. No mira cap resultat.
import { readFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));

export function checkCaptures(manifest, { machine = null, base = root } = {}) {
  const worlds = manifest.worlds.filter((w) => machine === null || w.machine === machine);
  const lines = [], bad = [];
  for (const w of worlds) {
    const file = resolve(base, w.capture);
    if (!existsSync(file)) { bad.push(w.id); lines.push(`FALTA     ${w.id}  ${w.capture}`); continue; }
    const sha = createHash('sha256').update(readFileSync(file)).digest('hex');
    if (sha !== w.sha256) { bad.push(w.id); lines.push(`DIFERENT  ${w.id}  ${w.capture}  (${sha}, i el manifest diu ${w.sha256})`); }
    else lines.push(`ok        ${w.id}  ${w.capture}  ${sha}`);
  }
  return { lines, bad, n: worlds.length };
}

function commitOf(base) {
  if (existsSync(join(base, 'VERSIO'))) return `${readFileSync(join(base, 'VERSIO'), 'utf8').trim()} (VERSIO)`;
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: base, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch { return 'desconegut'; }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const opt = (name, def) => { const i = args.indexOf(name); return i < 0 ? def : args[i + 1]; };
  const manifestPath = opt('--serie', 'fase2/serie-b2.json'), machine = opt('--maquina', null);
  if (machine !== null && !['pc', 'vm'].includes(machine)) { console.log('Ús: node eines/b2-captures.mjs [--serie manifest.json] [--maquina pc|vm]'); process.exit(2); }
  const manifest = JSON.parse(readFileSync(resolve(root, manifestPath), 'utf8'));
  const { lines, bad, n } = checkCaptures(manifest, { machine });
  console.log(`Captures d'origen de ${manifestPath} (${manifest.estat}), ${machine ? `màquina ${machine}` : 'totes les màquines'}`);
  console.log(`commit ${commitOf(root)}; node ${process.version}; ${new Date().toISOString()}`);
  for (const l of lines) console.log(l);
  console.log(bad.length ? `ERROR: ${bad.length} de ${n} captures falten o són diferents: ${bad.join(', ')}` : `${n} de ${n} captures correctes`);
  process.exit(bad.length ? 1 : 0);
}
