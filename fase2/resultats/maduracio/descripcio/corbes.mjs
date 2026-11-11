// Exploratori (la maduració, pas 1; P1 i P2 de la nota): la corba de la maduració als mons sense vida de cada conjunt de dades, i què
// en queda quan la sopa es transforma. Només llegeix els registres de git. No simula res.
//   node corbes.mjs > corbes-sortida.txt
import { datasets, loadSet, lifeless, quantile, median, sd, spearman } from './comu.mjs';

const sets = datasets().map((s) => ({ ...s, records: loadSet(s).map((r) => ({ ...r, at: new Map(r.measures.map((m) => [m.epoch, m])) })) }));
const byId = Object.fromEntries(sets.map((s) => [s.id, s]));
const D = (m) => 8 - m.h0;
const f = (x, d = 4) => (Number.isFinite(x) ? x.toFixed(d) : '—');
const values = (records, epoch, get = D) => records.filter((r) => lifeless(r, epoch) && r.at.has(epoch)).map((r) => get(r.at.get(epoch)));

console.log('LA CORBA DE LA MADURACIÓ ALS MONS SENSE VIDA (P1)');
console.log('D = 8 − H0, en bits. Un món compta mentre cap cens no hi ha vist cap hereditari i falten més de 1.000 èpoques per a');
console.log("l'establiment. Per època: mons, mediana de D (del 5 % al 95 % dels mons), desviació; mediana de l'HOE; operacions per execució.");
for (const s of sets) {
  const t0 = s.records[0].t0;
  const epochs = t0 === 0 ? [100, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 10000, 12000, 14000, 16000] : [100, 500, 1000, 2000, 3000, 4000, 6000, 8000].map((d) => t0 + d);
  console.log(`\n${s.id}: ${s.label} (${s.records.length} registres)`);
  for (const e of epochs) {
    const v = values(s.records, e);
    if (v.length < 2) continue;
    const hoe = values(s.records, e, (m) => m.hoe), ops = values(s.records, e, (m) => m.ops / m.runs);
    console.log(`  ${String(e).padStart(5)}: ${String(v.length).padStart(3)} mons, D ${f(median(v))} (de ${f(quantile(v, 0.05))} a ${f(quantile(v, 0.95))}), sd ${f(sd(v))}; HOE ${f(median(hoe), 3)}; ops/execució ${f(median(ops), 1)}`);
  }
}

console.log('\n\nA1: LA CORBA ES REPETEIX? Els mons quiets de la sèrie del corrent (A) i els de l\'envelliment de la sèrie de la maduració');
for (const e of [1000, 2000, 4000, 6000, 8000]) {
  const a = median(values(byId['llei2-A'].records, e)), b = median(values(byId['mad-envelliment'].records, e)), c = median(values(byId['pilot-envelliment'].records, e));
  console.log(`  època ${String(e).padStart(4)}: A ${f(a)}; envelliment ${f(b)}; diferència ${(100 * (b - a) / a).toFixed(1)} %; (el pilot: ${f(c)}, ${(100 * (c - a) / a).toFixed(1)} %)`);
}

console.log('\n\nLA DISPERSIÓ ENTRE MONS ÉS NOMÉS SOROLL? (P1)');
console.log('La correlació de rangs (Spearman) entre la D d\'un món a dues èpoques, als mons sense vida a totes dues:');
for (const [id, pairs] of [['llei2-A', [[1000, 2000], [2000, 4000], [2000, 8000], [4000, 8000], [8000, 16000]]], ['mad-envelliment', [[1000, 2000], [2000, 4000], [2000, 8000], [4000, 8000]]], ['llei2-B', [[1000, 2000], [2000, 4000], [2000, 8000], [4000, 8000]]]]) {
  for (const [e1, e2] of pairs) {
    const rs = byId[id].records.filter((r) => lifeless(r, e2) && r.at.has(e1) && r.at.has(e2));
    if (rs.length < 10) continue;
    console.log(`  ${id}, ${e1} i ${e2}: ${rs.length} mons, rho = ${spearman(rs.map((r) => D(r.at.get(e1))), rs.map((r) => D(r.at.get(e2)))).toFixed(2)}`);
  }
}
// dues branques del mateix món (la sopa que continua): comparteixen la sopa de l'època 8.000, i no l'atzar de després
console.log('Dues branques del mateix món (la sopa que continua) comparteixen la sopa de l\'època 8.000, però no l\'atzar de després:');
const origin = new Map(byId['mad-envelliment'].records.map((r) => [r.name.replace(/^e/, ''), r]));
const world = (r) => r.name.split('-')[0];
for (const e of [9000, 10000, 12000, 16000]) {
  const pairs = new Map();
  for (const r of byId['mad-continue'].records) if (lifeless(r, e) && r.at.has(e)) pairs.set(world(r), [...(pairs.get(world(r)) ?? []), D(r.at.get(e))]);
  const both = [...pairs].filter(([, v]) => v.length === 2);
  const within = Math.sqrt(both.reduce((s, [, [a, b]]) => s + (a - b) ** 2 / 2, 0) / both.length);
  const means = both.map(([, [a, b]]) => (a + b) / 2), d8 = both.map(([w]) => D(origin.get(w).at.get(8000)));
  console.log(`  època ${e}: ${both.length} mons amb les dues branques sense vida; sd entre les dues branques d'un món ${f(within)}; sd entre mons (de la mitjana de les dues) ${f(sd(means))}; rho entre les dues branques ${spearman(both.map(([, v]) => v[0]), both.map(([, v]) => v[1])).toFixed(2)}; rho amb la D del món a l'època 8.000 ${spearman(d8, means).toFixed(2)}`);
}

console.log('\n\nQUÈ EN QUEDA QUAN ES TRANSFORMA LA SOPA (P2)');
console.log("La mediana als mons sense vida, pel temps passat des de l'època 8.000 (entre parèntesis, els mons). A la fila 0, la sopa");
console.log("envellida d'origen, abans de transformar-la: la barrejada en conserva els bytes, i la nova comença de zero.");
for (const where of ['mad', 'pilot']) {
  const arms = sets.filter((s) => s.arm && s.id.startsWith(`${where}-`));
  const org = new Map(byId[`${where}-envelliment`].records.map((r) => [r.name.replace(/^e/, ''), r]));
  for (const [label, get, d] of [['D (bits)', D, 4], ['HOE', (m) => m.hoe, 3], ['operacions per execució', (m) => m.ops / m.runs, 1]]) {
    console.log(`\n${where === 'mad' ? 'La sèrie' : 'El pilot'}, ${label}: ${arms.map((s) => s.arm).join(' | ')}`);
    const worlds = [...new Set(arms[0].records.map(world))].filter((w) => org.has(w));
    console.log(`  ${'0'.padStart(5)}: ${f(median(worlds.map((w) => get(org.get(w).at.get(8000)))), d)} (${worlds.length}), la sopa envellida d'origen`);
    for (const dt of [100, 200, 300, 500, 1000, 2000, 3000, 4000, 6000, 8000]) {
      const cells = arms.map((s) => { const v = values(s.records, 8000 + dt, get); return v.length ? `${f(median(v), d)} (${v.length})` : '—'; });
      console.log(`  ${String(dt).padStart(5)}: ${cells.join(' | ')}`);
    }
  }
}
