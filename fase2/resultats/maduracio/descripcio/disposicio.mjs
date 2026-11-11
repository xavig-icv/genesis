// Exploratori (la maduració, pas 1; afegit l'11-11-2026 al vespre, després de llegir la part 2 de l'auditor 1, que ho proposa): la
// disposició de les instruccions a les captures del món 1034, al llarg del temps. Si les instruccions s'amunteguen en pocs programes,
// quina part en fan les tirades de '<'? No simula res: només llegeix captures.
//   node disposicio.mjs CARPETA-DEL-1034 > disposicio-sortida.txt
import { readFileSync } from 'fs';
import { join } from 'path';

const dir = process.argv[2];
if (!dir) { console.error('Ús: node disposicio.mjs CARPETA-DEL-1034'); process.exit(2); }
const OPS = new Uint8Array(256);
for (const c of '<>{}-+.,[]') OPS[c.charCodeAt(0)] = 1;
const LT = '<'.charCodeAt(0);
// la dispersió: la variància del recompte per programa, dividida per la d'una binomial amb la mateixa mitjana (1 = a l'atzar)
const dispersion = (counts) => {
  const n = counts.length, m = counts.reduce((s, x) => s + x, 0) / n, v = counts.reduce((s, x) => s + (x - m) ** 2, 0) / n;
  return { m, d: v / (m * (1 - m / 64)) };
};
console.log("LA DISPOSICIÓ DE LES INSTRUCCIONS AL MÓN 1034 (quiet, sense vida)");
console.log("Per programa: la mitjana d'instruccions i la dispersió (variància / la d'una binomial; 1 = repartides a l'atzar), comptant:");
console.log("  totes; sense els '<'; amb cada tirada de '<' com una sola; i la part de les instruccions que són en programes amb 16 o més.");
console.log('època: totes (mitjana, dispersió); sense els < (mitjana, dispersió); tirades de < com una (mitjana, dispersió); % en programes de 16 o més');
for (const epoch of [100, 500, 1000, 2000, 4000, 6000, 8000, 10000, 12000, 16000]) {
  const buf = readFileSync(join(dir, `llavor1034-mon512x256-r2-epoca${epoch}.bin`)), n = buf.length / 64;
  const all = new Array(n), noLt = new Array(n), runs = new Array(n);
  let inRich = 0, total = 0;
  for (let p = 0; p < n; p++) {
    let a = 0, b = 0, r = 0, prevLt = false;
    for (let i = 0; i < 64; i++) {
      const x = buf[p * 64 + i];
      if (OPS[x]) { a++; if (x !== LT) { b++; r++; } else if (!prevLt) r++; }
      prevLt = x === LT;
    }
    all[p] = a; noLt[p] = b; runs[p] = r; total += a; if (a >= 16) inRich += a;
  }
  const A = dispersion(all), B = dispersion(noLt), R = dispersion(runs);
  console.log(`  ${String(epoch).padStart(5)}: ${A.m.toFixed(2)}, ${A.d.toFixed(2)}; ${B.m.toFixed(2)}, ${B.d.toFixed(2)}; ${R.m.toFixed(2)}, ${R.d.toFixed(2)}; ${(100 * inRich / total).toFixed(1)} %`);
}
