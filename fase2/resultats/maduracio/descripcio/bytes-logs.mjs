// Exploratori (la maduració, pas 1; P6 de la nota, els .log): els tres bytes més freqüents que el simulador escriu cada 100 èpoques, als
// mons sense vida de cada conjunt. Serveix per veure si amb corrent pugen els mateixos bytes: de les sopes amb corrent no hi ha captures.
//   node bytes-logs.mjs > bytes-logs-sortida.txt
import { readFileSync } from 'fs';
import { datasets, loadSet, lifeless, median } from './comu.mjs';

console.log('ELS TRES BYTES MÉS FREQÜENTS, SEGONS ELS .log (P6)');
console.log('Per edat, als mons sense vida: quin byte és el primer, el segon i el tercer més sovint (en quants mons), i la mediana del seu percentatge.');
for (const s of datasets().filter((x) => ['llei2-A', 'llei2-B', 'mad-envelliment', 'mad-shuffle-all'].includes(x.id))) {
  const recs = loadSet(s).map((r, i) => {
    const at = new Map();
    for (const line of readFileSync(s.files[i].replace(/[.]jsonl$/, '.log'), 'utf8').split('\n')) {
      const m = /^època (\d+) .*bytes (\S+):([0-9.]+)% (\S+):([0-9.]+)% (\S+):([0-9.]+)%/.exec(line);
      if (m) at.set(Number(m[1]), [[m[2], Number(m[3])], [m[4], Number(m[5])], [m[6], Number(m[7])]]);
    }
    return { ...r, at };
  });
  const t0 = recs[0].t0;
  console.log(`\n${s.id}: ${s.label}`);
  for (const e of [500, 1000, 2000, 4000, 8000, 12000, 16000].map((d) => (t0 ? t0 + d : d))) {
    const rows = recs.filter((r) => lifeless(r, e) && r.at.has(e)).map((r) => r.at.get(e));
    if (rows.length < 5) continue;
    const place = (k) => {
      const by = new Map();
      for (const row of rows) by.set(row[k][0], [...(by.get(row[k][0]) ?? []), row[k][1]]);
      return [...by].sort((a, b) => b[1].length - a[1].length).slice(0, 2).map(([b, v]) => `${b} ${median(v).toFixed(1)} % (${v.length})`).join(' o ');
    };
    console.log(`  ${String(e).padStart(5)}, ${rows.length} mons: 1r ${place(0)}; 2n ${place(1)}; 3r ${place(2)}`);
  }
}
