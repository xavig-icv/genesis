// La prova de viabilitat (exploratori): l'anàlisi fixada a la nota (el README d'aquesta carpeta), escrita abans de mirar cap resultat.
// Des de l'arrel de la còpia, quan hi ha tots els registres i tots els llinatges:
//   node fase2/resultats/arrelament/viabilitat/viabilitat-analisi.mjs [--prova] > fase2/resultats/arrelament/viabilitat/analisi-sortida.txt
import { readFileSync, existsSync } from 'fs';
import { DIR, PILOT, CELLS, ROOTED, at, readJsonl, header } from './comu.mjs';

const prova = process.argv[2] === '--prova';
const base = prova ? `${DIR}/prova` : DIR;
const design = JSON.parse(readFileSync(at(`${DIR}/disseny.json`), 'utf8'));
const ids = prova ? readFileSync(at(`${DIR}/prova/llista.txt`), 'utf8').split('\n').filter(Boolean).map((l) => l.split(' ')[0]) : design.branches.map((b) => b.id);
const h = header();
console.log(`La prova de viabilitat${prova ? ' (la prova curta)' : ''}: l'anàlisi de la nota. codi=${h.code}  node=${h.node}`);

const median = (xs) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const quantile = (xs, q) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const fmt = (x) => (x === null ? '—' : String(x));
const rows = [];
const problems = [];
for (const id of ids) {
  const b = design.branches.find((x) => x.id === id);
  const regFile = at(`${base}/registres/${id}.jsonl`), linFile = at(`${base}/llinatge/${id}.jsonl`);
  if (!existsSync(regFile) || !existsSync(linFile)) { problems.push(`${id}: falta el registre o el llinatge`); continue; }
  const reg = readJsonl(regFile), lin = readJsonl(linFile);
  if (reg.at(-1).type !== 'end' || lin.at(-1).type !== 'end') { problems.push(`${id}: un registre que no és sencer`); continue; }
  if (reg[0].code !== lin[0].code.replace(/\+canvis$/, '') && !prova) problems.push(`${id}: el registre (${reg[0].code}) i el llinatge (${lin[0].code}) no són del mateix commit`);
  const caps = lin.filter((l) => l.type === 'capture').sort((a, c) => a.epoch - c.epoch);
  const F = new Map(caps.map((c) => [c.epoch, c.F]));
  // arrela: F ≥ 1.311 en dues captures separades per 300 èpoques
  let tRoot = null;
  for (const c of caps) if (c.F >= ROOTED && (F.get(c.epoch + 300) ?? -1) >= ROOTED) { tRoot = c.epoch - 8000; break; }
  // s'extingeix: F = 0 en dues captures seguides
  let tExt = null, regrow = false;
  for (let i = 0; i + 1 < caps.length; i++) if (caps[i].F === 0 && caps[i + 1].F === 0) { tExt = caps[i].epoch - 8000; break; }
  if (tExt !== null) regrow = caps.some((c) => c.epoch - 8000 > tExt && c.F > 0);
  const outcome = tRoot !== null ? 'arrela' : tExt !== null ? "s'extingeix" : 'censurada';
  const Fmax = Math.max(...caps.map((c) => c.F));
  // l'establiment de la llei 2, i si el llinatge n'és la família dominant
  const ev = reg.find((l) => l.type === 'event');
  let law2 = null;
  if (ev) {
    const census = reg.find((l) => l.type === 'census' && l.epoch === ev.epoch);
    const cap = [...caps].reverse().find((c) => c.epoch <= ev.epoch);
    const world = census ? (census.heritable / census.sample) * CELLS : null;
    law2 = { epoch: ev.epoch, dominant: world !== null && cap ? cap.F >= world / 2 : null, F: cap?.F ?? null, world: world === null ? null : Math.round(world) };
  }
  // el bessó: la branca del pilot de la maduració amb la mateixa llavor, sense res plantat
  const twinFile = at(`${PILOT}/branques/${b.twin}.jsonl`);
  const twinEv = existsSync(twinFile) ? readJsonl(twinFile).find((l) => l.type === 'event') : undefined;
  const last = reg.at(-1).epoch;
  const twin = twinEv && twinEv.epoch <= last ? twinEv.epoch : null;
  const secondsPerK = reg.at(-1).seconds / ((last - 8000) / 1000);
  rows.push({ id, b, caps, tRoot, tExt, regrow, outcome, Fmax, law2, twin, last, secondsPerK });
}
if (problems.length) { console.log('\nProblemes:'); for (const p of problems) console.log(`  ${p}`); if (!prova) process.exitCode = 1; }

console.log(`\nCada branca (${rows.length}): el desenllaç, el temps (des de la sembra), F màxim, l'establiment de la llei 2 i el del bessó (fins a la mateixa època)`);
for (const r of rows) {
  const t = r.tRoot !== null ? `arrela a ${r.tRoot}` : r.tExt !== null ? `s'extingeix a ${r.tExt}${r.regrow ? ' (I REBROTA)' : ''}` : `censurada a ${r.last - 8000}`;
  const l2 = r.law2 ? `llei 2 a ${r.law2.epoch - 8000} (llinatge ${r.law2.F} de ${fmt(r.law2.world)} estimats: ${r.law2.dominant ? 'dominant' : 'no dominant'})` : 'sense llei 2';
  console.log(`  ${r.id.padEnd(22)} ${t.padEnd(26)} Fmàx ${String(r.Fmax).padStart(6)}  ${l2}; bessó: ${r.twin === null ? 'no' : `a ${r.twin - 8000}`}`);
}

const groups = (key) => { const m = new Map(); for (const r of rows) { const k = key(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); } return m; };
console.log('\nPer variant i sopa: arrelen / s\'extingeixen / censurades (de n); la mediana del temps d\'arrelar i d\'extingir-se');
for (const [k, rs] of groups((r) => `${r.b.variant} ${r.b.arm}`)) {
  const c = (o) => rs.filter((r) => r.outcome === o).length;
  console.log(`  ${k.padEnd(20)} ${c('arrela')} / ${c("s'extingeix")} / ${c('censurada')} (de ${rs.length}); arrelar ${fmt(median(rs.filter((r) => r.tRoot !== null).map((r) => r.tRoot)))}, extingir-se ${fmt(median(rs.filter((r) => r.tExt !== null).map((r) => r.tExt)))}`);
}
console.log('\nPer variant (les tres sopes juntes):');
for (const [k, rs] of groups((r) => r.b.variant)) {
  const c = (o) => rs.filter((r) => r.outcome === o).length;
  console.log(`  ${k.padEnd(6)} ${c('arrela')} / ${c("s'extingeix")} / ${c('censurada')} (de ${rs.length})`);
}
console.log('\nPer sopa (els quatre genotips en una cel·la):');
for (const [k, rs] of groups((r) => r.b.arm)) {
  const one = rs.filter((r) => r.b.variant !== 'G1x9');
  const c = (o) => one.filter((r) => r.outcome === o).length;
  console.log(`  ${k.padEnd(12)} ${c('arrela')} / ${c("s'extingeix")} / ${c('censurada')} (de ${one.length})`);
}

const ext = rows.filter((r) => r.tExt !== null).map((r) => r.tExt);
const bins = [[100, 'en 100 èpoques'], [200, 'en 200'], [500, 'en 500'], [1000, 'en 1.000']];
console.log(`\nQuan s'extingeixen (${ext.length} llinatges): ${bins.map(([x, n]) => `${n}, ${ext.filter((t) => t <= x).length}`).join('; ')}; més tard, ${ext.filter((t) => t > 1000).length}`);
const roots = rows.filter((r) => r.tRoot !== null).map((r) => r.tRoot);
console.log(`Quan arrelen (${roots.length}): la mediana ${fmt(median(roots))}, el percentil 90 ${fmt(quantile(roots, 0.9))}, el màxim ${fmt(roots.length ? Math.max(...roots) : null)}`);

console.log('\nLa dosi (G1): una cel·la contra el quadrat de 3 × 3, per sopa');
for (const arm of ['continue', 'shuffle-all', 'reinit']) {
  const one = rows.filter((r) => r.b.variant === 'G1' && r.b.arm === arm), nine = rows.filter((r) => r.b.variant === 'G1x9' && r.b.arm === arm);
  const a = (rs) => `${rs.filter((r) => r.outcome === 'arrela').length} de ${rs.length} arrelen`;
  console.log(`  ${arm.padEnd(12)} una: ${a(one)}; nou: ${a(nine)}`);
}

// El detector: la probabilitat que un cens inert vegi el llinatge alguna vegada (orientativa: suposa que la prova veu totes les funcionals)
const schemes = [[2048, 100], [4096, 100], [4096, 250]];
const seen = (r, [n, every]) => {
  const s = n / CELLS;
  let logMiss = 0;
  for (let e = 8000 + every; e <= r.last; e += every) {
    const cap = [...r.caps].reverse().find((c) => c.epoch <= e);
    if (cap) logMiss += cap.F * Math.log(1 - s);
  }
  return 1 - Math.exp(logMiss);
};
console.log('\nEl detector (orientatiu): la probabilitat mitjana de veure el llinatge alguna vegada');
for (const sc of schemes) {
  const by = (rs) => (rs.length ? (rs.reduce((a, r) => a + seen(r, sc), 0) / rs.length).toFixed(2) : '—');
  console.log(`  ${sc[0]} cel·les cada ${sc[1]} èpoques: els que s'extingeixen ${by(rows.filter((r) => r.outcome === "s'extingeix"))}; els que arrelen ${by(rows.filter((r) => r.outcome === 'arrela'))}; els censurats ${by(rows.filter((r) => r.outcome === 'censurada'))}`);
}

const spk = rows.map((r) => r.secondsPerK);
console.log(`\nEl cost: ${fmt(median(spk)?.toFixed(0) ?? null)} s per cada 1.000 èpoques (la mediana; del ${fmt(spk.length ? Math.min(...spk).toFixed(0) : null)} al ${fmt(spk.length ? Math.max(...spk).toFixed(0) : null)})`);

console.log('\nLes regles del pla (§9), amb les xifres:');
const single = rows.filter((r) => r.b.variant !== 'G1x9');
const anyRoot = single.some((r) => r.outcome === 'arrela');
console.log(`  1. Algun genotip arrela en alguna sopa? ${anyRoot ? 'sí' : 'NO: la part A, amb el quadrat de 3 × 3 o amb un H més llarg'}`);
const perG = [...groups((r) => r.b.variant)].filter(([k]) => k !== 'G1x9').map(([k, rs]) => [k, rs.filter((r) => r.outcome === 'arrela').length / rs.length]);
const allHigh = perG.length && perG.every(([, p]) => p > 0.9);
console.log(`  2. Arrelen gairebé sempre (més del 90 %) a totes les sopes? ${perG.map(([k, p]) => `${k} ${(p * 100).toFixed(0)} %`).join(', ')}: ${allHigh ? 'SÍ: el pes, a la part B' : 'no'}`);
console.log(`  3. La mediana del temps d'arrelar, contra H/2 = 1.000 (H = 2.000, la proposta): ${fmt(median(roots))}${median(roots) !== null && median(roots) > 1000 ? ': H s\'allarga' : ''}`);
const fast = ext.filter((t) => t <= 200).length;
console.log(`  4. S'extingeixen en 200 èpoques: ${fast} de ${ext.length}${ext.length && fast / ext.length >= 0.9 ? ': l\'aturada a l\'extinció fa la part A barata, i K puja' : ''}`);
const regrow = rows.filter((r) => r.regrow).map((r) => r.id);
const twinOnly = rows.filter((r) => r.tExt !== null && r.law2 && r.law2.dominant).map((r) => r.id);
console.log(`  5. La mesura del llinatge: rebrots després de l'extinció, ${regrow.length ? regrow.join(', ') : 'cap'}; llinatges extingits que surten «dominants» a un establiment de la llei 2, ${twinOnly.length ? twinOnly.join(', ') : 'cap'}`);
