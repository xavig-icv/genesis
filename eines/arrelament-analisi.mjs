// L'anàlisi del pilot de l'aparició i l'arrelament (docs/pla-aparicio-arrelament.md, §6), escrita abans de calcular. Exploratori.
//
//   node eines/arrelament-analisi.mjs > fase2/resultats/arrelament/pilot/analisi-sortida.txt
//
// Només amb el pilot sencer: totes les branques del manifest, cadascuna amb el registre complet i l'ordre del manifest; si en falta
// cap, no en llegeix cap. Les xifres:
//  1. pR de cada sopa i variant (la part A): la part de les sembres que arrelen, amb l'interval del bootstrap per món;
//  2. el contrast principal: el quocient de pR entre continue i reinit, i entre shuffle-all i reinit, estratificat per variant (Mantel i
//     Haenszel) amb les variants informatives (G1, G1x9 i G4), i cada variant a part; byte0 contra byte0-placebo, amb G1x9 i G4;
//  3. λA de cada sopa (la part B): les aparicions detectades pel cens inert per cada 1.000 mon-èpoques abans de l'establiment, i els
//     quocients;
//  4. la consistència: P(arrela | detectada) de les famílies naturals i dels llinatges plantats que el cens inert ha vist;
//  5. la lectura, amb la regla de la §1;
//  6. els descriptius: G2, G3, els sham contra els bessons, les durades, l'establiment de la llei 2 amb el llinatge dominant.
// El món és la unitat: el bootstrap remostra mons sencers (10.000 vegades, amb la llavor 20261119).
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { makeRng } from '../fase1/soup.js';
import { Windows } from '../fase2/llinatge.js';
import { conditions, testInert, heritable, fromHex, INERT_CONDITIONS_SEED } from '../fase2/inert.js';
import { DESIGN, ROOT } from './arrelament.mjs';

export const ANALYSIS = Object.freeze({
  rooted: 1311,           // l'1 % del món
  interval: 250,          // els dos punts del criteri del llinatge
  informative: ['G1', 'G1x9', 'G4'],
  byte0: ['G1x9', 'G4'],
  bootstrap: 10000, bootstrapSeed: 20261119,
  retest: 100,            // les condicions de la prova de les aparicions (la llavor 3000000000)
  followUp: 1500,         // l'arrelament d'una família natural detectada: dominant a un establiment en 1.500 èpoques
  reference: { 'continue': 1.6, 'shuffle-all': 2.05 },
});

const readJsonl = (file) => readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const fmt = (x, k = 3) => (x === null || Number.isNaN(x) ? '—' : x.toFixed(k));
const her = (c) => heritable(c);

// Una branca de la part A: el llinatge, el cens inert i l'establiment
export function partA(lines, { start, horizon, rooted = ANALYSIS.rooted, interval = ANALYSIS.interval }) {
  const lin = lines.filter((l) => l.type === 'lineage').sort((a, b) => a.epoch - b.epoch);
  const F = new Map(lin.map((l) => [l.epoch, l.F]));
  let rootedAt = null;
  for (const l of lin) if (l.epoch - start <= horizon && l.F >= rooted && (F.get(l.epoch + interval) ?? -1) >= rooted) { rootedAt = l.epoch; break; }
  let extinctAt = null;
  for (let i = 0; i + 1 < lin.length; i++) if (lin[i].F === 0 && lin[i + 1].F === 0) { extinctAt = lin[i].epoch; break; }
  const inert = lines.filter((l) => l.type === 'inert');
  const ev = lines.find((l) => l.type === 'event');
  let law2 = null;
  if (ev && ev.epoch - start <= horizon) {
    const ir = inert.find((l) => l.epoch === ev.confirmed);
    law2 = { epoch: ev.epoch, confirmed: ev.confirmed, dominant: ir ? ir.heritable > 0 && 2 * (ir.lineage ?? 0) >= ir.heritable : null };
  }
  const seen = inert.find((l) => (l.lineage ?? 0) > 0);
  const end = lines.at(-1);
  return { rootedAt, extinctAt, law2, detectedAt: seen ? seen.epoch : null, Fmax: lin.length ? Math.max(...lin.map((l) => l.F)) : 0,
    outcome: rootedAt !== null ? 'arrela' : extinctAt !== null ? "s'extingeix" : 'censurada', last: end.epoch, reason: end.reason };
}

// Les famílies del cens inert d'una branca natural (la part B). Dues cel·les hereditàries són de la mateixa família si comparteixen una
// finestra; una família continua si en comparteix alguna amb una d'abans. Una aparició és la primera detecció d'una família nova.
export function families(inert) {
  const fams = [];
  for (const rec of [...inert].sort((a, b) => a.epoch - b.epoch)) {
    const cells = rec.cells.filter(her).map((c) => ({ ...c, bytes: fromHex(c.program) }));
    // els grups d'aquest cens (unió per finestres compartides)
    const groups = [];
    for (const c of cells) {
      const w = new Windows(); w.addProgram(c.bytes);
      const hits = groups.filter((g) => g.windows.has(c.bytes) || g.cells.some((x) => w.has(x.bytes)));
      const g = hits.length ? hits[0] : { windows: new Windows(), cells: [] };
      if (!hits.length) groups.push(g);
      for (const h of hits.slice(1)) { for (const x of h.cells) { g.cells.push(x); g.windows.addProgram(x.bytes); } groups.splice(groups.indexOf(h), 1); }
      g.cells.push(c); g.windows.addProgram(c.bytes);
    }
    for (const g of groups) {
      const old = fams.filter((f) => !f.mergedInto && g.cells.some((c) => f.windows.has(c.bytes)));
      let f = old[0];
      if (!f) { f = { id: `${rec.epoch}:${g.cells[0].program}`, first: rec.epoch, windows: new Windows(), bytes: [], programs: g.cells.map((c) => c.program), seen: [] }; fams.push(f); }
      // dues famílies que es troben: continuen com una de sola (la més antiga), i totes dues es van comptar quan van aparèixer
      for (const o of old.slice(1)) { for (const b of o.bytes) { f.windows.addProgram(b); f.bytes.push(b); } o.mergedInto = f.id; }
      for (const c of g.cells) { f.windows.addProgram(c.bytes); f.bytes.push(c.bytes); }
      f.seen.push({ epoch: rec.epoch, cells: g.cells.length });
    }
  }
  return fams;
}

// La família dominant d'un cens inert: la que hi té més cel·les hereditàries
export function dominantFamily(fams, rec) {
  let best = null, bestN = 0;
  for (const f of fams.filter((x) => !x.mergedInto)) {
    const n = rec.cells.filter(her).filter((c) => f.windows.has(fromHex(c.program))).length;
    if (n > bestN) { best = f; bestN = n; }
  }
  return best;
}

// El quocient de Mantel i Haenszel: estrats { a, n1, b, n0 } (arrelen a la sopa que es prova, de n1; a la referència, de n0)
export function mh(strata) {
  let num = 0, den = 0;
  for (const { a, n1, b, n0 } of strata) { const N = n1 + n0; if (!N) continue; num += (a * n0) / N; den += (b * n1) / N; }
  return den > 0 ? num / den : null;
}

// L'interval del 95 % del bootstrap per món: `stat` rep una llista de mons (amb repeticions)
export function bootstrap(worlds, stat, { count = ANALYSIS.bootstrap, seed = ANALYSIS.bootstrapSeed } = {}) {
  const rng = makeRng(seed, 'v2'), est = [];
  for (let r = 0; r < count; r++) {
    const sample = Array.from({ length: worlds.length }, () => worlds[(rng() * worlds.length) | 0]);
    const v = stat(sample);
    if (v !== null && Number.isFinite(v)) est.push(v);
  }
  est.sort((a, b) => a - b);
  if (est.length < count * 0.9) return [null, null];
  return [est[Math.floor(0.025 * est.length)], est[Math.ceil(0.975 * est.length) - 1]];
}

// La lectura de la §1
export function reading(ci, reference) {
  const [lo, hi] = ci;
  if (lo === null) return 'el pilot no ho pot dir (interval indefinit)';
  const has1 = lo <= 1 && 1 <= hi, hasR = lo <= reference && reference <= hi;
  if (hasR && !has1) return 'compatible amb que la maduració actuï, almenys en part, sobre l\'arrelament d\'aquestes variants';
  if (hi < 1) return "l'arrelament d'aquestes variants hi és més difícil: l'efecte de l'establiment hauria de venir de l'aparició";
  if (has1 && !hasR) return "l'arrelament d'aquestes variants no hi canvia gaire: l'efecte s'hauria de buscar a l'aparició (vegeu λA)";
  if (has1 && hasR) return 'el pilot no ho pot dir';
  return `més gran que el de l'establiment (${reference})`;
}

export function loadPilot(d = DESIGN, { root = ROOT } = {}) {
  const m = JSON.parse(readFileSync(join(root, d.folder, 'manifest.json'), 'utf8'));
  const problems = [], recs = new Map();
  for (const b of m.branches) {
    const file = join(root, d.folder, b.part === 'A' ? 'part-a' : 'part-b', `${b.id}.jsonl`);
    if (!existsSync(file)) { problems.push(`${b.id}: no hi ha el registre`); continue; }
    let lines;
    try { lines = readJsonl(file); } catch { problems.push(`${b.id}: el registre no es pot llegir`); continue; }
    if (lines[0]?.type !== 'start' || lines.at(-1)?.type !== 'end') { problems.push(`${b.id}: el registre no és sencer`); continue; }
    if (lines[0].command !== b.command) problems.push(`${b.id}: l'ordre del registre no és la del manifest`);
    if (typeof lines[0].code !== 'string' || lines[0].code.includes('+')) problems.push(`${b.id}: el codi del registre no és un commit net`);
    if (b.part === 'A' && lines[0].plant?.fileSha256 !== b.plantSha256) problems.push(`${b.id}: la sembra del registre no és la del manifest`);
    recs.set(b.id, lines);
  }
  const codes = new Set([...recs.values()].map((l) => l[0].code));
  if (codes.size > 1) problems.push(`els registres són de ${codes.size} commits diferents: ${[...codes].join(', ')}`);
  return { manifest: m, recs, problems };
}

export function analyse(d = DESIGN, { root = ROOT, out = console.log, count = ANALYSIS.bootstrap } = {}) {
  const { manifest: m, recs, problems } = loadPilot(d, { root });
  out(`El pilot de l'aparició i l'arrelament: l'anàlisi de la §6 (exploratori). Manifest: ${m.code}; ${m.branches.length} branques.`);
  if (problems.length) { out(`\nNo s'analitza res: ${problems.length} problemes.\n- ${problems.slice(0, 30).join('\n- ')}`); return { ok: false, problems }; }
  const start = d.age;
  const cohort = m.worlds.filter((w) => w.included).map((w) => w.world);
  // la part A
  const A = m.branches.filter((b) => b.part === 'A').map((b) => ({ ...b, r: partA(recs.get(b.id), { start, horizon: d.horizonA }) }));
  const byWorld = new Map(cohort.map((w) => [w, A.filter((b) => b.world === w)]));
  const pR = (bs) => (bs.length ? bs.filter((b) => b.r.outcome === 'arrela').length / bs.length : null);
  out('\n1. pR, la part de les sembres que arrelen (interval del bootstrap per món)');
  out('   variant  ' + [...d.arms, ...d.byte0Arms].map((s) => s.padEnd(26)).join(''));
  for (const v of [...d.variants.map((x) => x.id), 'sham']) {
    const cells = [...d.arms, ...d.byte0Arms].map((s) => {
      const bs = A.filter((b) => b.variant === v && b.soup === s);
      if (!bs.length) return ''.padEnd(26);
      const ws = cohort.map((w) => bs.filter((b) => b.world === w)).filter((x) => x.length);
      const ci = bootstrap(ws, (sample) => pR(sample.flat()), { count });
      return `${fmt(pR(bs), 2)} [${fmt(ci[0], 2)}, ${fmt(ci[1], 2)}] n=${bs.length}`.padEnd(26);
    });
    out(`   ${v.padEnd(8)} ${cells.join('')}`);
  }
  // el contrast principal
  const strataOf = (bs, soup1, soup0, variants) => variants.map((v) => {
    const s1 = bs.filter((b) => b.variant === v && b.soup === soup1), s0 = bs.filter((b) => b.variant === v && b.soup === soup0);
    return { a: s1.filter((b) => b.r.outcome === 'arrela').length, n1: s1.length, b: s0.filter((b) => b.r.outcome === 'arrela').length, n0: s0.length };
  });
  const contrast = (soup1, soup0, variants) => {
    const est = mh(strataOf(A, soup1, soup0, variants));
    const ci = bootstrap(cohort.map((w) => byWorld.get(w)), (sample) => mh(strataOf(sample.flat(), soup1, soup0, variants)), { count });
    return { est, ci };
  };
  out('\n2. El contrast principal: el quocient de pR, estratificat per variant (Mantel i Haenszel), amb G1, G1x9 i G4');
  const main = {};
  for (const soup of ['continue', 'shuffle-all']) {
    const c = contrast(soup, 'reinit', ANALYSIS.informative);
    main[soup] = c;
    out(`   ${soup} contra reinit: ${fmt(c.est, 2)} [${fmt(c.ci[0], 2)}, ${fmt(c.ci[1], 2)}]`);
    for (const v of ANALYSIS.informative) { const cv = contrast(soup, 'reinit', [v]); out(`     ${v}: ${fmt(cv.est, 2)} [${fmt(cv.ci[0], 2)}, ${fmt(cv.ci[1], 2)}]`); }
  }
  const b0 = contrast('byte0', 'byte0-placebo', ANALYSIS.byte0);
  out(`   byte0 contra byte0-placebo (G1x9 i G4): ${fmt(b0.est, 2)} [${fmt(b0.ci[0], 2)}, ${fmt(b0.ci[1], 2)}]`);
  // la part B
  const B = m.branches.filter((b) => b.part === 'B').map((b) => {
    const lines = recs.get(b.id), ev = lines.find((l) => l.type === 'event'), end = lines.at(-1);
    const inert = lines.filter((l) => l.type === 'inert');
    const exposureEnd = ev ? ev.epoch : end.epoch;
    const fams = families(inert.filter((l) => l.epoch <= exposureEnd));
    // la prova de les aparicions: algun programa de la primera detecció, hereditari en alguna de les 100 condicions (AU2-152)
    const conds = conditions(INERT_CONDITIONS_SEED, ANALYSIS.retest);
    const apps = fams.filter((f) => f.programs.some((p) => heritable(testInert(fromHex(p), conds))));
    // la família dominant a l'establiment, i les que s'hi van fusionar
    let rootedIds = new Set();
    if (ev) {
      const ir = inert.find((l) => l.epoch === ev.confirmed);
      if (ir) {
        const all = families(inert.filter((l) => l.epoch <= ev.confirmed)), dom = dominantFamily(all, ir);
        if (dom) rootedIds = new Set([dom.id, ...all.filter((x) => x.mergedInto === dom.id).map((x) => x.id)]);
      }
    }
    return { ...b, ev, exposure: exposureEnd - start, apps, rootedIds, end };
  });
  const lam = (bs) => { const e = bs.reduce((s, b) => s + b.exposure, 0); return e ? (1000 * bs.reduce((s, b) => s + b.apps.length, 0)) / e : null; };
  out("\n3. λA, les aparicions detectades per cada 1.000 mon-èpoques abans de l'establiment (la part B)");
  const lamCI = {};
  for (const soup of d.arms) {
    const bs = B.filter((b) => b.soup === soup);
    const ci = bootstrap(cohort.map((w) => bs.filter((b) => b.world === w)), (s) => lam(s.flat()), { count });
    lamCI[soup] = ci;
    out(`   ${soup.padEnd(12)} ${fmt(lam(bs), 3)} [${fmt(ci[0], 3)}, ${fmt(ci[1], 3)}]; ${bs.reduce((s, b) => s + b.apps.length, 0)} aparicions, ${bs.filter((b) => b.ev).length} establiments de ${bs.length}`);
  }
  for (const soup of ['continue', 'shuffle-all']) {
    const r = (s) => { const a = lam(s.filter((b) => b.soup === soup)), z = lam(s.filter((b) => b.soup === 'reinit')); return a !== null && z ? a / z : null; };
    const ci = bootstrap(cohort.map((w) => B.filter((b) => b.world === w)), (s) => r(s.flat()), { count });
    main[`λ ${soup}`] = { est: r(B), ci };
    out(`   ${soup} contra reinit: ${fmt(r(B), 2)} [${fmt(ci[0], 2)}, ${fmt(ci[1], 2)}]`);
  }
  // la consistència
  out("\n4. La consistència: P(arrela | detectada), de les famílies naturals i dels llinatges plantats que el cens inert ha vist");
  for (const soup of d.arms) {
    const nat = B.filter((b) => b.soup === soup).flatMap((b) => b.apps.map((f) => ({ f, b })))
      .filter(({ f, b }) => b.ev || f.first + ANALYSIS.followUp <= b.end.epoch);
    const natRooted = nat.filter(({ f, b }) => b.rootedIds.has(f.id) && b.ev && b.ev.epoch - f.first <= ANALYSIS.followUp).length;
    const pl = A.filter((b) => b.soup === soup && b.variant !== 'sham' && b.r.detectedAt !== null);
    const plRooted = pl.filter((b) => b.r.law2?.dominant).length;
    out(`   ${soup.padEnd(12)} naturals ${natRooted} de ${nat.length} (${fmt(nat.length ? natRooted / nat.length : null, 2)}); plantats ${plRooted} de ${pl.length} (${fmt(pl.length ? plRooted / pl.length : null, 2)})`);
  }
  // la lectura
  out('\n5. La lectura (§1)');
  for (const soup of ['continue', 'shuffle-all']) {
    out(`   ${soup}: pR, ${reading(main[soup].ci, ANALYSIS.reference[soup])}`);
    out(`   ${soup}: λA, ${reading(main[`λ ${soup}`].ci, ANALYSIS.reference[soup]).replace("l'arrelament d'aquestes variants", "l'aparició").replace("sobre l'arrelament d'aquestes variants", "sobre l'aparició")}`);
  }
  // els descriptius
  out('\n6. Els descriptius');
  const agree = A.filter((b) => b.variant !== 'sham');
  const both = (o, l) => agree.filter((b) => (b.r.outcome === 'arrela') === o && ((b.r.law2?.dominant ?? false) === l)).length;
  out(`   «arrela» i «s'estableix amb el llinatge dominant»: totes dues ${both(true, true)}, només arrela ${both(true, false)}, només s'estableix ${both(false, true)}, cap ${both(false, false)}`);
  const ext = A.filter((b) => b.r.extinctAt !== null).map((b) => b.r.extinctAt - start).sort((a, b) => a - b);
  const rt = A.filter((b) => b.r.rootedAt !== null).map((b) => b.r.rootedAt - start).sort((a, b) => a - b);
  const med = (xs) => (xs.length ? xs[(xs.length - 1) >> 1] : null);
  out(`   s'extingeixen ${ext.length} (la mediana, ${med(ext)} èpoques); arrelen ${rt.length} (la mediana, ${med(rt)} èpoques)`);
  const sh = A.filter((b) => b.variant === 'sham');
  for (const b of sh) {
    const twin = B.find((x) => x.world === b.world && x.soup === b.soup);
    out(`   ${b.id}: establiment ${recs.get(b.id).find((l) => l.type === 'event')?.epoch ?? 'cap'}; el bessó, ${twin?.ev?.epoch ?? 'cap'}`);
  }
  out('\n   El punt de partida de cada sopa (la mediana dels mons): les que es repliquen i les hereditàries, amb la prova del cens; amb companys inerts, les que es copien i les hereditàries');
  for (const soup of [...d.arms, ...d.byte0Arms]) {
    const ws = m.worlds.filter((x) => x.included).map((x) => x.arms[soup]);
    const mdn = (f) => med(ws.map(f).filter((x) => x !== undefined).sort((a, b) => a - b));
    out(`   ${soup.padEnd(14)} ${mdn((x) => x.scan.replicating)} / ${mdn((x) => x.scan.heritable)}${ws[0].inertScan ? `; ${mdn((x) => x.inertScan.copying)} / ${mdn((x) => x.inertScan.heritable)}` : ''}`);
  }
  return { ok: true, main };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = analyse();
  process.exit(r.ok ? 0 : 1);
}
