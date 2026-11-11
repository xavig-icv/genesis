// Exploratori (la maduració, pas 1; P3, P4 i la primera part de P5 de la nota): el ritme d'establiment segons l'edat del món i segons
// la maduració de la sopa, i les aparicions d'hereditaris als censos d'abans de l'establiment. Només llegeix els registres de git.
//   node ritme.mjs > ritme-sortida.txt
import { datasets, loadSet, lifeless, median, rate, rateRatio, fmtRatio, poissonInterval } from './comu.mjs';

const sets = datasets().map((s) => ({ ...s, records: loadSet(s) }));
const byId = Object.fromEntries(sets.map((s) => [s.id, s]));
const age = (r, epoch) => epoch - r.offset;            // l'edat de la sopa: a la sopa nova de les branques, compta des de l'època 8.000

// els establiments i l'exposició (mon-èpoques en risc) d'uns registres, entre dues edats
function count(records, a, b) {
  let ev = 0, risk = 0;
  for (const r of records) {
    risk += Math.max(0, Math.min(age(r, r.stop), b) - Math.max(age(r, r.t0), a));
    if (r.event !== null && age(r, r.event) > a && age(r, r.event) <= b) ev++;
  }
  return [ev, risk];
}
const cell = ([ev, risk]) => (risk > 0 ? `${String(ev).padStart(3)} / ${String(Math.round(risk / 1000)).padStart(5)}k = ${rate(ev, risk)}` : '—');

console.log("EL RITME D'ESTABLIMENT I L'EDAT (P3)");
console.log("Per franja d'edat: establiments / mon-èpoques en risc (en milers) = establiments per 100.000 mon-èpoques (interval exacte del 95 %).");
console.log("L'edat és l'època, llevat de la sopa nova de les branques, on compta des de l'època 8.000. L'establiment és el primer dels dos censos.");
for (const width of [4000, 2000]) {
  console.log(`\nFranges de ${width} èpoques:`);
  for (const s of sets) {
    const ages = s.records.flatMap((r) => [age(r, r.t0), age(r, r.start.epochs)]), lo = Math.min(...ages), hi = Math.max(...ages);
    console.log(`  ${s.id}: ${s.label} (${s.records.length} registres, ${s.records.filter((r) => r.event !== null).length} establiments)`);
    for (let a = lo; a < hi; a += width) console.log(`    de ${String(a).padStart(5)} a ${String(a + width).padStart(5)}: ${cell(count(s.records, a, a + width))}`);
  }
}

// A2: tots els mons quiets junts, per edat. Hi entren els mons que no s'han tocat (la sèrie del corrent A, els envelliments i la sopa
// que continua) i la sopa nova de les branques; no hi entren les sopes barrejades, que no tenen una edat
const QUIET = ['llei2-A', 'mad-envelliment', 'pilot-envelliment', 'mad-continue', 'pilot-continue', 'mad-reinit', 'pilot-reinit'];
const quiet = QUIET.flatMap((id) => byId[id].records);
console.log("\n\nA2: EL RITME VA LLIGAT A L'EDAT? Tots els mons quiets junts (la sèrie del corrent A, els envelliments, la sopa que continua i la sopa nova)");
for (let a = 0; a < 16000; a += 2000) console.log(`  de ${String(a).padStart(5)} a ${String(a + 2000).padStart(5)}: ${cell(count(quiet, a, a + 2000))}`);
const young = count(quiet, 0, 4000), mid = count(quiet, 4000, 8000), old = count(quiet, 8000, 16000);
console.log(`  de 0 a 4.000: ${cell(young)}`);
console.log(`  de 4.000 a 8.000: ${cell(mid)}`);
console.log(`  de 8.000 a 16.000: ${cell(old)}`);
console.log(`  el quocient del ritme de 8.000 a 16.000 sobre el de 0 a 4.000: ${fmtRatio(rateRatio(old[0], old[1], young[0], young[1]))}`);
console.log(`  el de 4.000 a 8.000 sobre el de 0 a 4.000: ${fmtRatio(rateRatio(mid[0], mid[1], young[0], young[1]))}`);
console.log(`  el de 8.000 a 16.000 sobre el de 4.000 a 8.000: ${fmtRatio(rateRatio(old[0], old[1], mid[0], mid[1]))}`);
console.log('  Sense les branques (només mons que comencen a l\'època 0: la sèrie del corrent A i els envelliments):');
const untouched = ['llei2-A', 'mad-envelliment', 'pilot-envelliment'].flatMap((id) => byId[id].records);
for (const [a, b] of [[0, 4000], [4000, 8000], [8000, 16000]]) console.log(`    de ${a} a ${b}: ${cell(count(untouched, a, b))}`);

// P4: a la mateixa maduració, el mateix ritme? La D de cada pas de 100 èpoques és la mediana de la condició a aquella edat (la corba
// dels mons sense vida); com a sensibilitat, la D del mateix món 1.000 èpoques abans
const BANDS = [0, 0.05, 0.10, 0.15, 0.20, 0.30, Infinity];
const bandName = (k) => (k === BANDS.length - 2 ? `${BANDS[k].toFixed(2)} o més` : `de ${BANDS[k].toFixed(2)} a ${BANDS[k + 1].toFixed(2)}`);
function curve(records) {
  const by = new Map();
  for (const r of records) for (const m of r.measures) if (lifeless(r, m.epoch)) { const a = age(r, m.epoch); if (!by.has(a)) by.set(a, []); by.get(a).push(8 - m.h0); }
  return new Map([...by].map(([a, v]) => [a, median(v)]));
}
function byBand(records, crv) {
  const ev = new Array(BANDS.length - 1).fill(0), risk = new Array(BANDS.length - 1).fill(0);
  for (const r of records) {
    const own = crv ? null : new Map(r.measures.map((m) => [m.epoch, 8 - m.h0]));
    for (let e = r.t0 + 100; e - 100 < r.stop; e += 100) {
      const d = crv ? crv.get(age(r, e)) : own.get(e - 1000);
      if (d === undefined) continue;
      const k = BANDS.findIndex((x, i) => d >= x && d < BANDS[i + 1]);
      risk[k] += Math.min(e, r.stop) - (e - 100);
      if (r.event !== null && r.event > e - 100 && r.event <= e) ev[k]++;
    }
  }
  return { ev, risk };
}
const current = byId['llei2-B'].records;
console.log('\n\nA LA MATEIXA MADURACIÓ, EL MATEIX RITME? (P4)');
console.log('Els mons quiets (els mateixos de l\'A2) i els de corrent 0,01 (la sèrie del corrent B), per franja de D.');
for (const [title, q, b] of [['Amb la D de la condició a aquella edat (la mediana dels mons sense vida):', byBand(quiet, curve(quiet)), byBand(current, curve(current))],
  ['Sensibilitat: amb la D del mateix món 1.000 èpoques abans (els primers 1.000 passos de cada registre no hi compten):', byBand(quiet, null), byBand(current, null)]]) {
  console.log(`\n${title}`);
  let expected = 0, observed = 0;
  for (let k = 0; k < BANDS.length - 1; k++) {
    const both = q.risk[k] > 0 && b.risk[k] > 0;
    console.log(`  D ${bandName(k).padEnd(15)}: quiet ${cell([q.ev[k], q.risk[k]])}; corrent ${cell([b.ev[k], b.risk[k]])}${both ? `; quocient corrent/quiet ${fmtRatio(rateRatio(b.ev[k], b.risk[k], q.ev[k], q.risk[k]))}` : ''}`);
    if (both) { expected += (q.ev[k] / q.risk[k]) * b.risk[k]; observed += b.ev[k]; }
  }
  const [lo, hi] = poissonInterval(observed);
  console.log(`  A les franges on hi ha totes dues condicions: amb corrent, ${observed} establiments; amb el ritme dels mons quiets a la mateixa D, se n'esperarien ${expected.toFixed(1)}. Observats/esperats: ${(observed / expected).toFixed(2)} (de ${(lo / expected).toFixed(2)} a ${(hi / expected).toFixed(2)}; l'interval només compta l'atzar dels observats)`);
}
console.log('\nI per edat, les mateixes dues condicions (per comparar):');
for (const [a, b] of [[0, 2000], [2000, 4000], [4000, 8000], [8000, 16000]]) {
  const q = count(quiet, a, b), c = count(current, a, b);
  console.log(`  de ${a} a ${b}: quiet ${cell(q)}; corrent ${cell(c)}; quocient ${fmtRatio(rateRatio(c[0], c[1], q[0], q[1]))}`);
}

// P5: els episodis d'hereditaris als censos. Un episodi és una tirada de censos seguits amb algun hereditari a la mostra; acaba bé si
// la vida s'hi estableix (l'establiment cau dins de la tirada o al cens següent), i malament si els hereditaris desapareixen
console.log('\n\nAPARÈIXER I ESTABLIR-SE, ALS CENSOS (P5)');
console.log("Cada cens mira 2.048 cel·les de 131.072. Un episodi: censos seguits amb algun hereditari a la mostra.");
console.log('Per conjunt: censos en risc; amb alguna cel·la que es replica; amb algun hereditari; episodis que acaben en establiment i episodis que s\'apaguen');
console.log("(dels que s'apaguen: quants censos duren i el màxim d'hereditaris vistos); i establiments sense cap hereditari al cens d'abans.");
function episodes(r) {
  const cs = r.censuses.filter((c) => r.event === null || c.epoch <= r.confirmed), out = [];
  for (let i = 0; i < cs.length; i++) {
    if (cs[i].heritable === 0) continue;
    let j = i; while (j + 1 < cs.length && cs[j + 1].heritable > 0) j++;
    const run = cs.slice(i, j + 1), last = run[run.length - 1].epoch;
    out.push({ start: run[0].epoch, n: run.length, max: Math.max(...run.map((c) => c.heritable)), ok: r.event !== null && r.event >= run[0].epoch - 250 && r.event <= last + 250, r });
    i = j;
  }
  return out;
}
for (const s of sets) {
  const eps = s.records.flatMap(episodes), failed = eps.filter((e) => !e.ok), atRisk = s.records.flatMap((r) => r.censuses.filter((c) => c.epoch <= r.stop));
  const silent = s.records.filter((r) => r.event !== null && (r.censuses.find((c) => c.epoch === r.event - 250)?.heritable ?? 0) === 0).length;
  console.log(`  ${s.id.padEnd(22)}: ${atRisk.length} censos; es replica ${atRisk.filter((c) => c.replicating > 0).length}; hereditari ${atRisk.filter((c) => c.heritable > 0).length}; episodis: ${eps.filter((e) => e.ok).length} acaben en establiment, ${failed.length} s'apaguen${failed.length ? ` (durada: mediana ${median(failed.map((e) => e.n))} censos, màxim ${Math.max(...failed.map((e) => e.n))}; hereditaris vistos: mediana ${median(failed.map((e) => e.max))}, màxim ${Math.max(...failed.map((e) => e.max))})` : ''}; establiments ${s.records.filter((r) => r.event !== null).length}, dels quals ${silent} sense cap hereditari al cens d'abans`);
}
const all = quiet.flatMap(episodes);
console.log("Tots els mons quiets junts, per l'edat en què comença l'episodi: episodis, i quants acaben en establiment");
for (const [a, b] of [[0, 4000], [4000, 8000], [8000, 12000], [12000, 16000]]) {
  const e = all.filter((x) => age(x.r, x.start) > a && age(x.r, x.start) <= b);
  console.log(`  de ${a} a ${b}: ${e.length} episodis, ${e.filter((x) => x.ok).length} acaben en establiment (${e.length ? (100 * e.filter((x) => x.ok).length / e.length).toFixed(0) : '—'} %)`);
}

// P5, per franja d'edat (la nota): la proporció de censos amb alguna cel·la que es replica i amb algun hereditari, i les cel·les que es
// repliquen per cens. Només els censos de mons sense vida: cap hereditari vist fins llavors, i a més de 1.000 èpoques de l'establiment
console.log("\nPer franja d'edat, als censos de mons sense vida (cap hereditari vist fins llavors, i a més de 1.000 èpoques de l'establiment):");
console.log('censos; amb alguna cel·la que es replica (%); cel·les que es repliquen per cens (de 2.048), i el que seria a tot el món (131.072)');
const perBand = (records, label, bands) => {
  console.log(`  ${label}`);
  for (const [a, b] of bands) {
    const cs = records.flatMap((r) => r.censuses.filter((c) => lifeless(r, c.epoch) && c.heritable === 0 && age(r, c.epoch) > a && age(r, c.epoch) <= b));
    if (!cs.length) continue;
    const rep = cs.reduce((s, c) => s + c.replicating, 0);
    console.log(`    de ${String(a).padStart(5)} a ${String(b).padStart(5)}: ${String(cs.length).padStart(5)} censos; ${(100 * cs.filter((c) => c.replicating > 0).length / cs.length).toFixed(1)} %; ${(rep / cs.length).toFixed(3)} per cens, ${(64 * rep / cs.length).toFixed(1)} al món`);
  }
};
const B2K = [[0, 1000], [1000, 2000], [2000, 4000], [4000, 6000], [6000, 8000], [8000, 12000], [12000, 16000]];
perBand(quiet, 'Tots els mons quiets junts (edat):', B2K);
perBand(current, 'Corrent 0,01 (la sèrie del corrent B):', B2K);
for (const id of ['mad-continue', 'mad-shuffle-all', 'mad-reinit', 'pilot-shuffle-programs', 'pilot-shuffle-within']) perBand(byId[id].records, `${id} (època):`, id.endsWith('reinit') ? B2K : [[8000, 8500], [8500, 9000], [9000, 10000], [10000, 12000], [12000, 16000]]);

// Afegit després de veure P3 (no era a la nota): les dues branques d'un mateix món comparteixen la sopa de partida i no l'atzar de
// després. Si l'establiment depengués només de l'atzar de després, les dues branques serien independents
console.log('\n\nLES DUES BRANQUES D\'UN MATEIX MÓN (afegit després de veure P3; no era a la nota)');
console.log("Mons amb les dues branques establertes, amb una i amb cap; i les que s'esperarien amb les dues establertes si fossin independents.");
for (const s of sets.filter((x) => x.arm)) {
  const by = new Map();
  for (const r of s.records) { const w = r.name.split('-')[0]; by.set(w, [...(by.get(w) ?? []), r]); }
  const pairs = [...by.values()].filter((v) => v.length === 2), n = pairs.length;
  const k = pairs.map((v) => v.filter((r) => r.event !== null).length), both = k.filter((x) => x === 2).length, one = k.filter((x) => x === 1).length;
  const p = (2 * both + one) / (2 * n);
  const gaps = pairs.filter((v) => v.every((r) => r.event !== null)).map((v) => Math.abs(v[0].event - v[1].event));
  console.log(`  ${s.id.padEnd(22)}: ${n} mons; dues ${both}, una ${one}, cap ${n - both - one}; esperades amb dues, si fossin independents: ${(n * p * p).toFixed(1)}${gaps.length ? `; quan hi són totes dues, la diferència entre els dos establiments: mediana ${median(gaps)} èpoques (de ${Math.min(...gaps)} a ${Math.max(...gaps)})` : ''}`);
}

// Afegit després de veure P3 (no era a la nota): la sopa nova de les branques (reinit) és una sopa a l'atzar com la de l'època 0, feta
// amb el mateix generador. Haurien de donar el mateix ritme que els mons que comencen a l'època 0
console.log("\n\nLA SOPA NOVA DE LES BRANQUES I ELS MONS QUE COMENCEN A L'ÈPOCA 0 (afegit després de veure P3; no era a la nota)");
const fresh = ['mad-reinit', 'pilot-reinit'].flatMap((id) => byId[id].records);
for (const [a, b] of [[0, 4000], [4000, 8000], [0, 8000]]) {
  const u = count(untouched, a, b), n = count(fresh, a, b);
  console.log(`  de ${a} a ${b}: mons que comencen a l'època 0, ${cell(u)}; la sopa nova de les branques, ${cell(n)}; quocient ${fmtRatio(rateRatio(n[0], n[1], u[0], u[1]))}`);
}
for (const id of ['llei2-A', 'mad-envelliment', 'pilot-envelliment', 'mad-reinit', 'pilot-reinit']) console.log(`    ${id}: ${cell(count(byId[id].records, 0, 8000))}`);
