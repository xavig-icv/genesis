// Exploratori (la maduració, pas 1; P7 de la nota): de què estan fetes les famílies que s'estableixen. El nucli (les instruccions, tal
// com les dona el registre de famílies) de la família més gran al cens que confirma l'establiment, per conjunt i per edat del món; i,
// com a sensibilitat, totes les famílies d'aquell cens. Només llegeix els registres de git.
//   node fundadors.mjs > fundadors-sortida.txt
import { datasets, loadSet } from './comu.mjs';

const sets = datasets().map((s) => ({ ...s, records: loadSet(s) }));
const kind = (core) => (core.includes(',') && core.includes('.') ? 'totes dues' : core.includes(',') ? "només ','" : core.includes('.') ? "només '.'" : 'cap');
const KINDS = ["només ','", "només '.'", 'totes dues', 'cap'];
function founders(records) {
  const out = [];
  for (const r of records) {
    if (r.event === null) continue;
    const fams = (r.censuses.find((c) => c.epoch === r.confirmed)?.families ?? []).slice().sort((a, b) => b.share - a.share);
    if (fams.length) out.push({ r, top: fams[0], all: fams });
  }
  return out;
}
const tally = (cores) => KINDS.map((k) => `${k} ${cores.filter((c) => kind(c) === k).length}`).join('; ') + `; amb '<' ${cores.filter((c) => c.includes('<')).length} de ${cores.length}`;
const share = (cores) => { const a = cores.filter((c) => kind(c) === "només ','").length, b = cores.filter((c) => kind(c) === "només '.'").length; return a + b ? `${(100 * a / (a + b)).toFixed(0)} % amb ',' (de ${a + b})` : '—'; };

console.log('ELS FUNDADORS (P7): la instrucció de còpia del nucli de la família més gran al cens que confirma l\'establiment');
for (const s of sets) {
  const f = founders(s.records);
  if (!f.length) continue;
  const cores = new Map();
  for (const x of f) cores.set(x.top.core, (cores.get(x.top.core) ?? 0) + 1);
  console.log(`\n${s.id}: ${s.label} (${f.length} establiments amb família)`);
  console.log(`  la família més gran: ${tally(f.map((x) => x.top.core))}  ->  ${share(f.map((x) => x.top.core))}`);
  console.log(`  totes les famílies d'aquell cens (${f.reduce((n, x) => n + x.all.length, 0)}): ${tally(f.flatMap((x) => x.all.map((a) => a.core)))}`);
  console.log(`  els nuclis més freqüents: ${[...cores].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c, k]) => `${c} (${k})`).join('; ')}`);
}

console.log("\n\nPER L'EDAT DE LA SOPA EN ESTABLIR-SE (la família més gran)");
const QUIET = ['llei2-A', 'mad-envelliment', 'pilot-envelliment', 'mad-continue', 'pilot-continue', 'mad-reinit', 'pilot-reinit'];
const groups = [['Tots els mons quiets junts (edat)', sets.filter((s) => QUIET.includes(s.id)).flatMap((s) => founders(s.records))],
  ['Corrent 0,01 (la sèrie del corrent B)', founders(sets.find((s) => s.id === 'llei2-B').records)],
  ['La sopa barrejada, la sèrie i el pilot (temps des de la barreja)', sets.filter((s) => s.arm === 'shuffle-all').flatMap((s) => founders(s.records)).map((x) => ({ ...x, since: x.r.event - x.r.t0 }))]];
for (const [label, f] of groups) {
  console.log(`  ${label}:`);
  for (const [a, b] of [[0, 2000], [2000, 4000], [4000, 8000], [8000, 12000], [12000, 16000]]) {
    const v = f.filter((x) => { const t = x.since ?? x.r.event - x.r.offset; return t > a && t <= b; });
    if (v.length) console.log(`    de ${String(a).padStart(5)} a ${String(b).padStart(5)}: ${tally(v.map((x) => x.top.core))}  ->  ${share(v.map((x) => x.top.core))}`);
  }
}
