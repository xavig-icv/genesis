// Exploratori (la maduració, pas 2a). Una comprovació afegida DESPRÉS de mirar la sortida del càlcul sencer (12-11-2026), per poder
// interpretar el criteri 2 de la nota: la línia de base. El criteri compta quina part dels '<' nous surten de parelles en què el primer
// programa comença amb '<'; el primer programa és una cel·la a l'atzar, i per tant, sense cap enriquiment, aquesta part seria la dels
// programes de la sopa que comencen amb '<'. També dona la part dels bytes de la sopa que són '<'. Només llegeix les captures, comprovades
// amb la SHA-256 del manifest de la sèrie; no simula res.
//   node linia-base.mjs CARPETA-SERIE > linia-base-sortida.txt
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const here = dirname(fileURLToPath(import.meta.url)), root = join(here, '../../../..');
const [serie] = process.argv.slice(2);
if (!serie) { console.error('Ús: node linia-base.mjs CARPETA-SERIE'); process.exit(2); }
const LT = 60, PROGRAM = 64;
const manifest = JSON.parse(readFileSync(join(root, 'fase2/resultats/maduracio/serie/manifest.json'), 'utf8'));
const cohort = manifest.worlds.filter((w) => w.included);
const groups = {
  envellida: (w) => ({ file: w.capture, sha256: w.captureSha256 }),
  barrejada: (w) => ({ file: w.arms['shuffle-all'].file, sha256: w.arms['shuffle-all'].sha256 }),
  nova: (w) => ({ file: w.arms.reinit.file, sha256: w.arms.reinit.sha256 }),
};
const sha = (b) => createHash('sha256').update(b).digest('hex');
console.log(`La línia de base del criteri 2 (pas 2a, exploratori; afegida després de mirar la sortida): ${cohort.length} mons de la sèrie`);
console.log('Per sopa, la mitjana dels mons: la part dels programes que comencen amb \'<\' i la part dels bytes que són \'<\'.');
for (const [g, pick] of Object.entries(groups)) {
  let first = 0, bytes = 0;
  for (const w of cohort) {
    const { file, sha256 } = pick(w);
    const buf = readFileSync(join(serie, file));
    if (sha256 && sha(buf) !== sha256) { console.error(`${w.world} ${g}: la captura no té la SHA-256 del manifest`); process.exit(1); }
    const n = buf.length / PROGRAM;
    let f = 0, b = 0;
    for (let c = 0; c < n; c++) if (buf[c * PROGRAM] === LT) f++;
    for (let i = 0; i < buf.length; i++) if (buf[i] === LT) b++;
    first += f / n; bytes += b / buf.length;
  }
  console.log(`  ${g}: programes que comencen amb '<', ${(100 * first / cohort.length).toFixed(2)} %; bytes que són '<', ${(100 * bytes / cohort.length).toFixed(2)} %`);
}
