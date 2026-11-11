// Exploratori (la maduració, pas 1; la segona part de P5 de la nota): els escanejos de totes les cel·les de cada sopa, a l'època 8.000
// (la sopa envellida, les transformades i la nova), i si el recompte d'una sopa prediu que la vida s'hi estableixi. Només llegeix els
// manifestos i els registres de git.
//   node escanejos.mjs > escanejos-sortida.txt
import { readFileSync } from 'fs';
import { join } from 'path';
import { ROOT, datasets, loadSet, median, mean, spearman } from './comu.mjs';

const sets = Object.fromEntries(datasets().map((s) => [s.id, loadSet(s)]));
const f = (x, d = 2) => x.toFixed(d);
const summary = (v) => `mitjana ${f(mean(v))}, mediana ${median(v)}, de ${Math.min(...v)} a ${Math.max(...v)}; total ${v.reduce((s, x) => s + x, 0)} en ${v.length} sopes; amb alguna, ${v.filter((x) => x > 0).length}`;

for (const [where, file] of [['mad', 'fase2/resultats/maduracio/serie/manifest.json'], ['pilot', 'fase2/resultats/maduracio/pilot/manifest.json']]) {
  const manifest = JSON.parse(readFileSync(join(ROOT, file), 'utf8')), arms = manifest.params.arms;
  console.log(`\n${where === 'mad' ? 'LA SÈRIE DE LA MADURACIÓ' : 'EL PILOT DE LA MADURACIÓ'}: ${manifest.worlds.length} mons al manifest, ${manifest.worlds.filter((w) => w.included).length} inclosos`);
  const reasons = new Map();
  for (const w of manifest.worlds.filter((x) => !x.included)) { const r = String(w.reason).replace(/ \(.*$/, '').replace(/\d+/g, 'N'); reasons.set(r, (reasons.get(r) ?? 0) + 1); }
  for (const [r, n] of reasons) console.log(`  exclosos, ${n}: ${r}`);
  const scanned = manifest.worlds.filter((w) => w.scan), inc = manifest.worlds.filter((w) => w.included);
  console.log(`\n  Cel·les que es repliquen i cel·les hereditàries, de 131.072, a cada sopa (l'escaneig de totes les cel·les):`);
  console.log(`    la sopa envellida, tots els mons escanejats: es repliquen, ${summary(scanned.map((w) => w.scan.replicating))}`);
  console.log(`                                                 hereditàries, ${summary(scanned.map((w) => w.scan.heritable))}`);
  for (const arm of arms) {
    console.log(`    ${arm}, els mons inclosos: es repliquen, ${summary(inc.map((w) => w.arms[arm].scan.replicating))}`);
    console.log(`    ${' '.repeat(arm.length)}                    hereditàries, ${summary(inc.map((w) => w.arms[arm].scan.heritable))}; d'aquestes, sense ajuda del company: ${inc.reduce((s, w) => s + w.arms[arm].scan.heritableSolo, 0)}`);
  }
  // A3: la sopa envellida, comparada amb la nova del mateix món
  const cmp = (a, b, get) => { let up = 0, eq = 0, down = 0; for (const w of inc) { const x = get(w.arms[a].scan), y = get(w.arms[b].scan); if (x > y) up++; else if (x === y) eq++; else down++; } return `més a ${a}: ${up}; igual: ${eq}; més a ${b}: ${down}`; };
  console.log(`\n  A3, món a món (${inc.length} mons): cel·les que es repliquen, ${cmp('continue', 'reinit', (s) => s.replicating)}`);
  if (arms.includes('shuffle-all')) console.log(`      la barrejada i la nova: es repliquen, ${cmp('shuffle-all', 'reinit', (s) => s.replicating)}; hereditàries, ${cmp('shuffle-all', 'reinit', (s) => s.heritable)}`);

  // el recompte de la sopa de partida i l'establiment de les seves branques
  console.log("\n  El recompte de la sopa de partida prediu l'establiment? Les branques de cada braç, segons el que hi havia a la sopa:");
  for (const arm of arms) {
    const recs = sets[`${where}-${arm}`], scan = new Map(inc.map((w) => [w.world, w.arms[arm].scan]));
    const rows = recs.map((r) => ({ r, s: scan.get(r.name.split('-')[0]) })).filter((x) => x.s);
    const share = (v) => `${v.filter((x) => x.r.event !== null).length} de ${v.length}${v.length ? ` (${(100 * v.filter((x) => x.r.event !== null).length / v.length).toFixed(0)} %)` : ''}`;
    const early = (v, d) => v.filter((x) => x.r.event !== null && x.r.event - x.r.t0 <= d).length;
    console.log(`    ${arm}: sense cap hereditària a la sopa, s'estableix a ${share(rows.filter((x) => x.s.heritable === 0))}; amb alguna, a ${share(rows.filter((x) => x.s.heritable > 0))}; amb 5 o més, a ${share(rows.filter((x) => x.s.heritable >= 5))}`);
    console.log(`    ${' '.repeat(arm.length)}  establiments en les primeres 1.000 èpoques: ${early(rows.filter((x) => x.s.heritable === 0), 1000)} sense cap hereditària, ${early(rows.filter((x) => x.s.heritable > 0), 1000)} amb alguna; en les primeres 2.000: ${early(rows.filter((x) => x.s.heritable === 0), 2000)} i ${early(rows.filter((x) => x.s.heritable > 0), 2000)}`);
    const med = median(rows.map((x) => x.s.replicating));
    console.log(`    ${' '.repeat(arm.length)}  per les cel·les que es repliquen: fins a la mediana (${med}), ${share(rows.filter((x) => x.s.replicating <= med))}; per sobre, ${share(rows.filter((x) => x.s.replicating > med))}; rho de Spearman amb l'establiment, ${f(spearman(rows.map((x) => x.s.replicating), rows.map((x) => (x.r.event !== null ? 1 : 0))))}`);
  }
}
