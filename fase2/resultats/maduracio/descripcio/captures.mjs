// Exploratori (la maduració, pas 1; P6 de la nota): els bytes de les sopes envellides sense vida, a les captures. Llegeix les captures
// de l'envelliment de la sèrie de la maduració (l'època 8.000) i les del món 1034 (cada 500 èpoques), que no són a git: reben la
// carpeta com a argument. En desa un resum (captures-resum.json), amb la SHA-256 de cada captura. No simula res.
//   node captures.mjs CARPETA-DE-L'ENVELLIMENT-DE-LA-SÈRIE CARPETA-DEL-1034 > captures-sortida.txt
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { ROOT, median, quantile } from './comu.mjs';

const [agingDir, dir1034] = process.argv.slice(2);
if (!agingDir || !dir1034) { console.error("Ús: node captures.mjs CARPETA-DE-L'ENVELLIMENT-DE-LA-SÈRIE CARPETA-DEL-1034"); process.exit(2); }
const OPS = [...'<>{}-+.,[]'], code = (c) => c.charCodeAt(0), LT = code('<'), isOp = new Uint8Array(256);
for (const c of OPS) isOp[code(c)] = 1;

function stats(buf) {
  const n = buf.length / 64, hist = new Array(256).fill(0), pos = new Array(64).fill(0), runs = [0, 0, 0, 0], start2 = new Map();
  let adjacent = 0, many = 0, start = 0, lt = 0, withOps = 0;
  for (let p = 0; p < n; p++) {
    const o = p * 64;
    let k = 0, run = 0, ops = 0;
    for (let i = 0; i < 64; i++) {
      const b = buf[o + i];
      hist[b]++;
      ops += isOp[b];
      if (b === LT) {
        k++; pos[i]++; run++;
        if ((i > 0 && buf[o + i - 1] === LT) || (i < 63 && buf[o + i + 1] === LT)) adjacent++;
      }
      if (b !== LT || i === 63) { if (run > 0) runs[run === 1 ? 0 : run === 2 ? 1 : run < 8 ? 2 : 3]++; run = 0; }
    }
    lt += k;
    if (k >= 8) many++;
    if (ops >= 16) withOps++;
    if (buf[o] === LT) start++;
    if (isOp[buf[o]] && isOp[buf[o + 1]]) { const key = String.fromCharCode(buf[o], buf[o + 1]); start2.set(key, (start2.get(key) ?? 0) + 1); }
  }
  const q = (a, b) => pos.slice(a, b).reduce((s, x) => s + x, 0) / lt;
  return {
    programs: n,
    ops: Object.fromEntries(OPS.map((c) => [c, hist[code(c)] / buf.length])),
    instructions: OPS.reduce((s, c) => s + hist[code(c)], 0) / buf.length,
    zero: hist[0] / buf.length,
    lt: { first8: q(0, 8), last8: q(56, 64), pos0: pos[0] / lt, pos63: pos[63] / lt, adjacent: adjacent / lt, programs8: many, start: start / n, runs },
    programs16ops: withOps,                                  // programes amb 16 instruccions o més (la quarta part del programa)
    start2: Object.fromEntries([...start2].sort((a, b) => b[1] - a[1]).slice(0, 12)),
  };
}
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const pct = (x, d = 2) => (100 * x).toFixed(d);
const spread = (v, d = 2, k = 100) => `${(k * median(v)).toFixed(d)} (de ${(k * quantile(v, 0.05)).toFixed(d)} a ${(k * quantile(v, 0.95)).toFixed(d)})`;

// 1. Les sopes envellides de la sèrie de la maduració: les incloses al manifest (sense vida a l'època 8.000)
const manifest = JSON.parse(readFileSync(join(ROOT, 'fase2/resultats/maduracio/serie/manifest.json'), 'utf8'));
const out = { tool: 'fase2/resultats/maduracio/descripcio/captures.mjs', aged: [], world1034: [] };
for (const w of manifest.worlds.filter((x) => x.included)) {
  const file = join(agingDir, basename(w.capture));
  if (!existsSync(file)) throw new Error(`no hi ha ${basename(w.capture)} a la carpeta de l'envelliment`);
  const buf = readFileSync(file), h = sha(buf);
  if (h !== w.captureSha256) throw new Error(`${basename(w.capture)}: la SHA-256 no és la del manifest`);
  out.aged.push({ world: w.world, file: basename(w.capture), sha256: h, epoch: 8000, ...stats(buf) });
}
// 2. El món 1034, cada 500 èpoques (i l'època 100)
for (const epoch of [100, ...Array.from({ length: 32 }, (_, i) => 500 * (i + 1))]) {
  const name = `llavor1034-mon512x256-r2-epoca${epoch}.bin`, buf = readFileSync(join(dir1034, name));
  out.world1034.push({ file: name, sha256: sha(buf), epoch, ...stats(buf) });
}
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), 'captures-resum.json'), JSON.stringify(out, null, 1) + '\n');

// La sortida
const A = out.aged;
console.log(`LES SOPES ENVELLIDES SENSE VIDA DE LA SÈRIE DE LA MADURACIÓ (P6): ${A.length} mons, l'època 8.000`);
console.log('La mediana dels mons (del 5 % al 95 % dels mons). A l\'atzar, cada byte és el 0,39 % dels bytes.');
console.log(`  bytes d'instrucció: el ${spread(A.map((x) => x.instructions))} % (a l'atzar, el 3,91 %); el 0: el ${spread(A.map((x) => x.zero))} %`);
for (const c of OPS) console.log(`  ${c}  ${spread(A.map((x) => x.ops[c]), 3)} %, x${(256 * median(A.map((x) => x.ops[c]))).toFixed(2)} (de x${(256 * Math.min(...A.map((x) => x.ops[c]))).toFixed(2)} a x${(256 * Math.max(...A.map((x) => x.ops[c]))).toFixed(2)} a tots els mons)`);
console.log("\nOn és el '<':");
console.log(`  programes que comencen amb '<': el ${spread(A.map((x) => x.lt.start))} % (a l'atzar, el 0,39 %)`);
console.log(`  dels '<', a les 8 primeres posicions del programa: el ${spread(A.map((x) => x.lt.first8), 1)} %; a les 8 últimes: el ${spread(A.map((x) => x.lt.last8), 1)} % (uniforme: el 12,5 %)`);
console.log(`  a la posició 0: el ${spread(A.map((x) => x.lt.pos0))} %; a la 63: el ${spread(A.map((x) => x.lt.pos63))} % (uniforme: l'1,56 %)`);
console.log(`  al costat d'un altre '<': el ${spread(A.map((x) => x.lt.adjacent), 1)} %; amb bytes independents a la mateixa freqüència, el ${spread(A.map((x) => 1 - (1 - x.ops['<']) ** 2), 1)} %`);
console.log(`  programes amb 8 '<' o més: ${spread(A.map((x) => x.lt.programs8), 0, 1)} de 131.072; programes amb 16 instruccions o més: ${spread(A.map((x) => x.programs16ops), 0, 1)}`);
console.log(`  les tirades de '<', per llargada (1, 2, de 3 a 7, 8 o més), en % de les tirades: ${[0, 1, 2, 3].map((k) => pct(median(A.map((x) => x.lt.runs[k] / x.lt.runs.reduce((s, y) => s + y, 0))), 1)).join(', ')}`);
// els dos primers bytes del programa, quan tots dos són instruccions: a l'atzar, 2 programes per parella
const pairs = new Map();
for (const x of A) for (const [k, v] of Object.entries(x.start2)) pairs.set(k, [...(pairs.get(k) ?? []), v]);
console.log('\nEls dos primers bytes del programa, quan tots dos són instruccions (a l\'atzar, 2 programes per parella i món):');
console.log("la mediana dels mons on la parella és entre les 12 primeres, i en quants mons hi és");
for (const [k, v] of [...pairs].sort((a, b) => b[1].length * median(b[1]) - a[1].length * median(a[1])).slice(0, 14)) console.log(`  ${k}  ${median(v)} programes (a ${v.length} mons de ${A.length})`);

console.log('\n\nEL MÓN 1034 (quiet, sense vida), AL LLARG DEL TEMPS');
console.log("època: instruccions %; '<' %, ',' %, '>' %, '[' %, '{' %, '}' %, '.' %; comencen amb '<' %; '<' a les 8 últimes posicions %; '<' al costat d'un altre %; programes amb 8 '<' o més; la parella inicial més freqüent");
for (const x of out.world1034) {
  const top = Object.entries(x.start2)[0];
  console.log(`  ${String(x.epoch).padStart(5)}: ${pct(x.instructions)}; ${['<', ',', '>', '[', '{', '}', '.'].map((c) => pct(x.ops[c])).join(', ')}; ${pct(x.lt.start)}; ${pct(x.lt.last8, 1)}; ${pct(x.lt.adjacent, 1)}; ${x.lt.programs8}; ${top[0]} (${top[1]})`);
}
