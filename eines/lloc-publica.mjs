// El lloc web per a GitHub Pages: una carpeta amb la llista tancada de fitxers, i les dades comprovades amb la SHA-256.
//
//   node eines/lloc-publica.mjs SORTIDA [--arrel CARPETA] [--sense-dades]
//   node eines/lloc-publica.mjs --sumes [--arrel CARPETA]     (escriu a la sortida la llista de web/dades/SHA256SUMS)
//
// Què hi va (la llista tancada, AUD-12 i la revisió del lloc), i només el que git segueix:
// - web/, sencer;
// - les dades generades de cada món (web/dades/ID/mon.json, mapes.z, codi/ i sols/), que no són a git: es baixen d'una versió
//   de GitHub (.github/workflows/lloc.yml) i es comproven una per una amb web/dades/SHA256SUMS. Si en falta cap, en sobra cap o
//   alguna no hi coincideix, no es publica res;
// - quadern/, sencer;
// - de fase1/ i fase2/, només els fitxers de la carpeta (html, css i js), sense resultats/ ni les eines de Node (.mjs): el món en
//   viu i el quadern els fan servir al navegador;
// - una portada que porta a web/. Amb el workflow, GitHub Pages no hi fa passar Jekyll: no cal cap .nojekyll.
// No hi va res que comenci per punt, cap registre ni cap captura. Mai no sobreescriu: SORTIDA no ha d'existir.
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative, sep } from 'path';
import { fileURLToPath } from 'url';

const USAGE = 'Ús: node eines/lloc-publica.mjs SORTIDA [--arrel CARPETA] [--sense-dades]  |  node eines/lloc-publica.mjs --sumes [--arrel CARPETA]';
const fail = (msg, code = 2) => { console.error(`${msg}\n${USAGE}`); process.exit(code); };
const args = process.argv.slice(2);
let root = fileURLToPath(new URL('..', import.meta.url)), out = null, sums = false, noData = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--arrel') { root = args[++i]; if (!root) fail('falta la carpeta de --arrel'); }
  else if (a === '--sumes') sums = true;
  else if (a === '--sense-dades') noData = true;
  else if (a === '--help') { console.log(USAGE); process.exit(0); }
  else if (a.startsWith('--')) fail(`opció desconeguda: ${a}`);
  else if (out === null) out = a;
  else fail(`sobra ${a}`);
}
if (sums === (out !== null)) fail(sums ? '--sumes no porta SORTIDA' : 'falta SORTIDA');
if (sums && noData) fail('--sumes i --sense-dades no van junts');

const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const posix = (p) => p.split(sep).join('/');
// les dades generades: el que eines/web-dades.mjs escriu a cada món i .gitignore no deixa entrar a git
const GENERATED = /^web\/dades\/\d{1,6}\/(mon\.json|mapes\.z|codi\/\d{1,6}\.z|sols\/\d{1,6}\.z)$/;
function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
}
const dataFiles = () => walk(join(root, 'web', 'dades')).map((f) => posix(relative(root, f))).filter((f) => GENERATED.test(f)).sort();

if (sums) {
  for (const f of dataFiles()) process.stdout.write(`${sha(join(root, f))}  ${f.slice('web/dades/'.length)}\n`);
  process.exit(0);
}

if (existsSync(out)) fail(`ja existeix ${out}: l'eina no sobreescriu res`);
// el que git segueix
let tracked;
try { tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 }).split('\0').filter(Boolean); }
catch (e) { fail(`no puc llegir els fitxers de git a ${root}: ${e.message}`, 1); }
const isPublic = (f) => {
  if (f.split('/').some((p) => p.startsWith('.'))) return false;
  if (f.startsWith('web/') || f.startsWith('quadern/')) return true;
  return /^fase[12]\/[^/]+\.(html|css|js)$/.test(f);
};
const files = tracked.filter(isPublic);
for (const need of ['web/index.html', 'quadern/index.html', 'fase1/bff.js', 'fase2/world.js']) if (!files.includes(need)) fail(`no hi ha ${need} a git`, 1);

// les dades, comprovades amb web/dades/SHA256SUMS
let data = [];
if (!noData) {
  const list = join(root, 'web', 'dades', 'SHA256SUMS');
  if (!existsSync(list)) fail('no hi ha web/dades/SHA256SUMS', 1);
  const expected = new Map(readFileSync(list, 'utf8').trim().split('\n').map((l) => { const m = /^([0-9a-f]{64}) {2}(\S+)$/.exec(l); if (!m) fail(`línia estranya a SHA256SUMS: ${l}`, 1); return [`web/dades/${m[2]}`, m[1]]; }));
  const present = dataFiles(), problems = [];
  for (const [f, h] of expected) {
    if (!GENERATED.test(f)) problems.push(`${f}: no és cap fitxer de dades generat`);
    else if (!existsSync(join(root, f))) problems.push(`${f}: no hi és`);
    else if (sha(join(root, f)) !== h) problems.push(`${f}: la SHA-256 no hi coincideix`);
  }
  for (const f of present) if (!expected.has(f)) problems.push(`${f}: no és a SHA256SUMS`);
  if (problems.length) { console.error(`Les dades no són les de web/dades/SHA256SUMS (${problems.length}):\n  ${problems.slice(0, 10).join('\n  ')}`); process.exit(1); }
  data = [...expected.keys()];
}

let bytes = 0;
for (const f of [...files, ...data]) {
  const dst = join(out, f);
  mkdirSync(dirname(dst), { recursive: true });
  copyFileSync(join(root, f), dst);
  bytes += statSync(dst).size;
}
// la portada: el lloc és a web/
writeFileSync(join(out, 'index.html'), `<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<title>Genesis · Abiogènesi digital</title>
<meta http-equiv="refresh" content="0; url=web/">
<link rel="canonical" href="web/">
</head>
<body>
<p><a href="web/">Genesis · Abiogènesi digital</a></p>
</body>
</html>
`, { flag: 'wx' });
console.log(`${out}: ${files.length} fitxers de git i ${data.length} de dades, ${(bytes / 1e6).toFixed(1)} MB${noData ? ' (sense les dades)' : ''}`);
