// Exploratori (la maduració, pas 1; afegit després de veure P1, no era a la nota): mons on la sopa s'allunya molt de la corba dels mons
// sense vida sense que el cens hi hagi confirmat cap establiment. Només llegeix els registres de git.
//   node anomalies.mjs > anomalies-sortida.txt
import { datasets, loadSet, lifeless, median } from './comu.mjs';

console.log('MONS QUE S\'ALLUNYEN DE LA CORBA SENSE ESTABLIMENT (afegit després de veure P1)');
console.log('Registres sense establiment on la D d\'alguna mesura passa de la mediana del seu conjunt a aquella època en més de 0,05 bits.');
let total = 0, found = 0;
for (const s of datasets()) {
  const recs = loadSet(s), by = new Map();
  for (const r of recs) for (const m of r.measures) if (lifeless(r, m.epoch)) { if (!by.has(m.epoch)) by.set(m.epoch, []); by.get(m.epoch).push(8 - m.h0); }
  const curve = new Map([...by].map(([e, v]) => [e, median(v)]));
  for (const r of recs) {
    if (r.event !== null) continue;
    total++;
    const far = r.measures.filter((m) => curve.has(m.epoch) && 8 - m.h0 - curve.get(m.epoch) > 0.05);
    if (!far.length) continue;
    found++;
    const last = r.measures[r.measures.length - 1], cs = r.censuses.filter((c) => c.epoch >= far[0].epoch);
    console.log(`  ${s.id} ${r.name}: des de l'època ${far[0].epoch}; al final (${last.epoch}), D ${(8 - last.h0).toFixed(3)} (la mediana, ${curve.get(last.epoch)?.toFixed(3) ?? '—'}), HOE ${last.hoe.toFixed(3)}; als censos de després: màxim de cel·les que es repliquen ${Math.max(...cs.map((c) => c.replicating))} de 2.048, màxim d'hereditàries ${Math.max(...cs.map((c) => c.heritable))}, famílies ${Math.max(...cs.map((c) => c.families.length))}; nuclis: ${[...new Set(cs.flatMap((c) => c.families.map((f) => `${f.core} (${(100 * f.share).toFixed(1)} %)`)))].slice(0, 4).join(', ') || 'cap'}`);
  }
}
console.log(`\n${found} de ${total} registres sense establiment.`);
