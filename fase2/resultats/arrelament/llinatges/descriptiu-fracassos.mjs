// Les famílies naturals seguides com els plantats: un descriptiu de les aparicions que no s'estableixen (exploratori). AFEGIT DESPRÉS DE VEURE
// la sortida de l'anàlisi (analisi-sortida.txt): la nota no el fixava, i no en surt cap quocient ni cap interval, només recomptes.
//
//   node fase2/resultats/arrelament/llinatges/descriptiu-fracassos.mjs > fase2/resultats/arrelament/llinatges/descriptiu-fracassos.txt
//
// La pregunta: les aparicions robustes que no s'estableixen (la secció 2 de l'anàlisi) són fracassos, o trossos del llinatge que s'estableix
// que el seguiment no ha unit (AUD-204)? Per a cadascuna, amb les mateixes definicions que analisi.mjs: si la branca s'estableix, i quantes
// èpoques abans de l'establiment apareix; i si el llinatge encara era viu al final de l'exposició (el seu últim pas, F > 0). I, per comparar,
// el mateix de les que s'estableixen.
import { readFileSync } from 'fs';
import { join } from 'path';
import { ANALYSIS } from '../../../../eines/arrelament-analisi.mjs';
import { DESIGN } from '../../../../eines/arrelament.mjs';
import { conditions, testInert, fromHex, INERT_CONDITIONS_SEED } from '../../../../fase2/inert.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { ROOT, PILOT, AQUI, ARMS, readJsonl } from './comu.mjs';

const start = DESIGN.age, out = (s = '') => console.log(s);
const retest = conditions(INERT_CONDITIONS_SEED, ANALYSIS.retest.from + ANALYSIS.retest.count).slice(ANALYSIS.retest.from);
const cache = new Map();
const score = (hex) => {
  if (!cache.has(hex)) {
    const s = testInert(fromHex(hex), retest);
    let k = 0;
    for (let i = 0; i < s.heritableSolo.length; i++) if (s.heritableSolo[i] === '1' || s.heritableContext[i] === '1') k++;
    cache.set(hex, k);
  }
  return cache.get(hex);
};
const robust = (programs) => Math.max(...programs.map(score)) >= ANALYSIS.robust;
const llista = readFileSync(join(ROOT, AQUI, 'llista.txt'), 'utf8').trim().split('\n').map((l) => l.split(' ')[0]);
const m = JSON.parse(readFileSync(join(ROOT, PILOT, 'manifest.json'), 'utf8'));
const rows = [];
for (const id of llista) {
  const b = m.branches.find((x) => x.id === id);
  const rec = readJsonl(join(ROOT, PILOT, 'part-b', `${id}.jsonl`));
  const ev = rec.find((l) => l.type === 'event') ?? null, end = rec.at(-1);
  const exposureEnd = ev ? ev.epoch : end.epoch;
  const L = readJsonl(join(ROOT, AQUI, 'seguiments', `${id}.jsonl`));
  const lin = new Map(), parent = new Map(), steps = new Map();
  const root = (x) => { while (parent.has(x)) x = parent.get(x); return x; };
  let domRoot = null;
  for (const l of L) {
    if (l.type === 'new') lin.set(l.id, { id: l.id, first: l.epoch, programs: l.programs });
    if (l.type === 'step') { if (!steps.has(l.id)) steps.set(l.id, []); steps.get(l.id).push(l); }
    if (l.type === 'census') {
      for (const [young, old] of l.joins) parent.set(young, old);
      if (ev && l.epoch === ev.confirmed) for (const [rid, k] of Object.entries(l.groups)) if (l.heritable > 0 && k >= ANALYSIS.dominance * l.heritable) domRoot = root(rid);
    }
  }
  for (const x of lin.values()) {
    if (x.first > exposureEnd || !robust(x.programs)) continue;
    const st = (steps.get(x.id) ?? []).filter((s) => s.epoch <= exposureEnd);
    rows.push({ soup: b.soup, rooted: domRoot !== null && root(x.id) === domRoot, establishes: !!ev, before: ev ? ev.epoch - x.first : null,
      alive: st.length ? st.at(-1).F > 0 : null, Fmax: st.length ? Math.max(...st.map((s) => s.F)) : 0 });
  }
}
const med = (a) => { if (!a.length) return '—'; const s = [...a].sort((p, q) => p - q); return s[(s.length - 1) >> 1]; };
out(`Les aparicions robustes dels llinatges naturals, fins al final de l'exposició (descriptiu, afegit després de veure la sortida). ${codeVersion()}, ${process.version}.`);
for (const [nom, pick] of [["no s'estableixen", (r) => !r.rooted], ["s'estableixen", (r) => r.rooted]]) {
  out(`\n${nom}:`);
  for (const soup of ARMS) {
    const R = rows.filter((r) => r.soup === soup && pick(r));
    const sense = R.filter((r) => !r.establishes), amb = R.filter((r) => r.establishes);
    const prop = amb.filter((r) => r.before <= ANALYSIS.followUp).length;
    out(`   ${soup.padEnd(12)} ${R.length}; a branques que no s'estableixen ${sense.length}; a branques que s'estableixen ${amb.length} (${prop} dins de les ${ANALYSIS.followUp} èpoques d'abans de l'establiment); vives al final de l'exposició ${R.filter((r) => r.alive).length}; F màxima, la mediana ${med(R.map((r) => r.Fmax))}`);
  }
}
