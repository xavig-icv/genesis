// L'anàlisi del pilot de l'aparició i l'arrelament (docs/pla-aparicio-arrelament.md, §6), escrita abans de calcular. Exploratori.
//
//   node eines/arrelament-analisi.mjs > fase2/resultats/arrelament/pilot/analisi-sortida.txt
//
// Només amb el pilot sencer: el manifest ha de tenir exactament les branques del disseny i els escanejos inerts del punt de partida, amb
// la seva SHA-256 (AU2-170, AU2-171 = AUD-202), i cada branca, el registre complet, l'ordre i la sembra (o el seguiment) del manifest, i
// del commit del manifest (AU2-162); si en falta cap, no en llegeix cap. Les xifres (la v0.4 del pla, amb les correccions de les
// auditories 32 i 33):
//  1. pR de cada sopa i variant (la part A): la part de les sembres que arrelen dins de H, amb l'interval del bootstrap per món, i els
//     desenllaços per causa (arrela, s'extingeix dins de H, censurada a H o per l'establiment; AU2-159, AU2-173);
//  2. el contrast principal: el quocient de pR entre continue i reinit, i entre shuffle-all i reinit, estratificat per variant (Mantel i
//     Haenszel) amb les variants informatives (G1, G1x9 i G4), i cada variant a part; amb les dues mesures (arrela, i s'estableix amb el
//     llinatge dominant); i les sensibilitats: les censurades com si arrelessin, el criteri estricte de F (AU2-165), i sense els mons
//     amb una col·lisió al bessó (AU2-156). byte0 contra byte0-placebo, amb G1x9 i G4;
//  3. λdet de cada sopa (la part B): les aparicions DETECTADES pel cens inert per cada 1.000 mon-èpoques abans de l'establiment, no el ritme
//     de formació (AU2-160); amb la prova de les aparicions en unes condicions que no són les del cens (AUD-191), amb dos llindars (en
//     alguna i en 50 de 100 o més), cadascun amb totes les famílies, sense les de partida (les que ja hi eren: els programes de la primera
//     detecció comparteixen una finestra amb una cel·la hereditària del punt de partida; AUD-201) i sense les emparentades (amb qualsevol
//     cel·la que s'hi copiava; AU2-175); i la calibració del detector, amb la part A (AU2-175);
//  4. la consistència: P(arrela | detectada) de les famílies naturals i dels llinatges plantats, amb la mateixa definició (dominant, la
//     meitat o més de les hereditàries del cens inert; AU2-158) i la mateixa finestra i la mateixa regla de seguiment a totes dues parts
//     (1.250 èpoques des de la primera detecció; AUD-199 = AU2-172), per la mida a la primera detecció, amb les famílies unides en cadena
//     (AUD-200), i el producte λdet × P, només com una aproximació exploratòria (AU2-161);
//  5. la lectura, amb la regla de la §1: sis casos, la regla de la precisió (més de log(1,6)/2 de semiamplada: inconcloent) i, per a
//     λdet, una classificació numèrica que no atribueix cap mecanisme (AUD-190, AU2-164, AU2-174);
//  6. els descriptius: G2, G3, els sham contra els bessons (sense demanar la mateixa època; AU2-166), les durades i el punt de partida.
// El món és la unitat: el bootstrap remostra mons sencers (10.000 vegades, amb la llavor 20261119).
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { makeRng } from '../fase1/soup.js';
import { Windows } from '../fase2/llinatge.js';
import { conditions, testInert, heritable, fromHex, INERT_CONDITIONS, INERT_CONDITIONS_SEED } from '../fase2/inert.js';
import { DESIGN, ROOT, designProblems } from './arrelament.mjs';

export const ANALYSIS = Object.freeze({
  rooted: 1311,           // l'1 % del món
  interval: 250,          // els dos punts del criteri del llinatge
  informative: ['G1', 'G1x9', 'G4'],
  byte0: ['G1x9', 'G4'],
  bootstrap: 10000, bootstrapSeed: 20261119,
  // la prova de les aparicions: 100 condicions que no són les del cens inert (les 3 primeres de la llavor), AUD-191
  retest: { from: INERT_CONDITIONS, count: 100 },
  robust: 50,             // «robusta»: hereditària en 50 de 100 o més (comparable amb els genotips plantats)
  // l'arrelament d'una família detectada (la consistència): dominant a un establiment en 1.250 èpoques des de la primera detecció, a totes
  // dues parts. És el que la part A pot veure d'un llinatge detectat al primer cens inert (l'època 8.250): l'últim establiment que s'hi
  // pot confirmar és el de l'època 9.500 (AUD-199 = AU2-172)
  followUp: 1250,
  calibration: [1, 10, 100, 1310],   // la calibració del detector: F = 1, de 2 a 10, d'11 a 100, de 101 a 1.310, 1.311 o més (AU2-175)
  dominance: 0.5,         // dominant: la meitat o més de les hereditàries del cens inert, a la part A i a la B (AU2-158)
  collision: 131,         // una col·lisió al bessó: F del seguiment de 131 o més (el 10 % del llindar) fins a H + 250 (AU2-156)
  precision: Math.log(1.6) / 2, // la regla de la v0.1: més ample, inconcloent (AU2-164)
  reference: { 'continue': 1.6, 'shuffle-all': 2.05 },
});

const readJsonl = (file) => readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const fmt = (x, k = 3) => (x === null || x === undefined || Number.isNaN(x) ? '—' : x.toFixed(k));
const her = (c) => heritable(c);
// La cota inferior de Wilson (95 %) d'una proporció
const wilsonLow = (k, n) => {
  if (!n) return 0;
  const z = 1.959964, p = k / n, d = 1 + (z * z) / n;
  return Math.max(0, (p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d);
};

// Una branca de la part A: el llinatge, el cens inert i l'establiment
export function partA(lines, { start, horizon, rooted = ANALYSIS.rooted, interval = ANALYSIS.interval, dominance = ANALYSIS.dominance }) {
  const lin = lines.filter((l) => l.type === 'lineage').sort((a, b) => a.epoch - b.epoch);
  const at = new Map(lin.map((l) => [l.epoch, l]));
  // el criteri del llinatge, amb F; i l'estricte, amb la cota inferior de F (la mostra de 256, AU2-165)
  const fLow = (l) => (l.tested >= l.M ? l.F : Math.round(l.M * wilsonLow(l.functional, l.tested)));
  let rootedAt = null, rootedStrictAt = null;
  for (const l of lin) {
    if (l.epoch - start > horizon) break;
    const next = at.get(l.epoch + interval);
    if (rootedAt === null && l.F >= rooted && next && next.F >= rooted) rootedAt = l.epoch;
    if (rootedStrictAt === null && fLow(l) >= rooted && next && fLow(next) >= rooted) rootedStrictAt = l.epoch;
  }
  let extinctAt = null;
  for (let i = 0; i + 1 < lin.length; i++) if (lin[i].F === 0 && lin[i + 1].F === 0) { extinctAt = lin[i].epoch; break; }
  const inert = lines.filter((l) => l.type === 'inert');
  const ev = lines.find((l) => l.type === 'event');
  let law2 = null;
  if (ev && ev.epoch - start <= horizon) {
    const ir = inert.find((l) => l.epoch === ev.confirmed);
    law2 = { epoch: ev.epoch, confirmed: ev.confirmed, dominant: ir ? ir.heritable > 0 && (ir.lineage ?? 0) >= dominance * ir.heritable : null };
  }
  const seen = inert.find((l) => (l.lineage ?? 0) > 0);
  const end = lines.at(-1);
  // la causa de la censura: l'horitzó, o l'aturada a l'establiment abans que el criteri es pogués complir (AU2-159). S'extingeix dins de H
  // només si el primer zero hi és, com el primer punt del criteri d'arrelar (AU2-173): una extinció que comença després és una censura a H,
  // i el seu temps es queda a extinctAt, només com a descriptiu
  const extinctWithin = extinctAt !== null && extinctAt - start <= horizon;
  const outcome = rootedAt !== null ? 'arrela' : extinctWithin ? "s'extingeix" : 'censurada';
  const censor = outcome !== 'censurada' ? null : end.reason === 'establiment' ? 'establiment' : 'horitzó';
  return { rootedAt, rootedStrictAt, extinctAt, law2, detectedAt: seen ? seen.epoch : null, detectedSize: seen ? seen.lineage : null,
    Fmax: lin.length ? Math.max(...lin.map((l) => l.F)) : 0, outcome, censor, last: end.epoch, reason: end.reason,
    preCarriers: lines[0].plant?.preCarriers ?? null };
}

// El seguiment d'una família o d'un llinatge detectat, per a la consistència (AUD-199 = AU2-172). La mateixa regla a totes dues parts, des
// de la primera detecció (detected) i durant `window` èpoques:
//  - 'arrela': un establiment a l'època T ≤ detected + window, i n'és dominant;
//  - 'competidor': un establiment a T ≤ detected + window, i no n'és dominant (un altre s'hi estableix: es compta a part);
//  - 'no arrela': cap establiment fins a detected + window, i la branca s'ha pogut seguir fins aquí (detected + window ≤ lastObservable,
//    l'últim establiment que la branca pot confirmar);
//  - 'censurada': cap establiment, i la branca no s'ha pogut seguir tota la finestra. No entra al denominador.
// event és l'època de l'establiment (null si no n'hi ha cap que es pugui confirmar)
export function followUpClass({ detected, event, dominant, lastObservable, window = ANALYSIS.followUp }) {
  if (event !== null && event !== undefined && event - detected <= window) return dominant ? 'arrela' : 'competidor';
  if (detected + window <= lastObservable) return 'no arrela';
  return 'censurada';
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
      if (!f) { f = { id: `${rec.epoch}:${g.cells[0].program}`, first: rec.epoch, size: g.cells.length, windows: new Windows(), bytes: [], programs: g.cells.map((c) => c.program), seen: [] }; fams.push(f); }
      // dues famílies que es troben: continuen com una de sola (la més antiga), i totes dues es van comptar quan van aparèixer
      for (const o of old.slice(1)) { for (const b of o.bytes) { f.windows.addProgram(b); f.bytes.push(b); } o.mergedInto = f.id; }
      for (const c of g.cells) { f.windows.addProgram(c.bytes); f.bytes.push(c.bytes); }
      f.seen.push({ epoch: rec.epoch, cells: g.cells.length });
    }
  }
  return fams;
}

// La família d'un cens inert amb més cel·les hereditàries, i la seva part de les hereditàries. Dominant, si en té la meitat o més
// (AU2-158: la mateixa regla que la part A); la més nombrosa, només com a descriptiu
export function dominantFamily(fams, rec, { dominance = ANALYSIS.dominance } = {}) {
  const hs = rec.cells.filter(her);
  let best = null, bestN = 0;
  for (const f of fams.filter((x) => !x.mergedInto)) {
    const n = hs.filter((c) => f.windows.has(fromHex(c.program))).length;
    if (n > bestN) { best = f; bestN = n; }
  }
  const total = rec.heritable ?? hs.length;
  return { family: best, share: total ? bestN / total : 0, dominant: !!best && total > 0 && bestN >= dominance * total };
}

// Les famílies arrelades a un establiment: la dominant i totes les que s'hi han unit, també en cadena (AUD-200)
export function rootedFamilies(all, dom) {
  if (!dom?.dominant) return new Set();
  const byId = new Map(all.map((x) => [x.id, x]));
  const rootOf = (x) => { while (x.mergedInto) x = byId.get(x.mergedInto); return x; };
  return new Set(all.filter((x) => rootOf(x) === dom.family).map((x) => x.id));
}

// Una família i el punt de partida de la seva sopa (l'escaneig inert de l'època 8.000): «de partida», si algun programa de la primera
// detecció comparteix una finestra amb una cel·la hereditària del punt de partida (les que ja hi eren, AUD-201); «emparentada», si algun
// programa de la família, de qualsevol cens, en comparteix una amb qualsevol cel·la que s'hi copiava (la regla de la v0.3)
export function startingFlags(f, { heritableStart, related }) {
  return { preexisting: f.programs.some((h) => heritableStart.has(fromHex(h))), related: f.bytes.some((x) => related.has(x)) };
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

// La lectura de la §1 (AUD-190, AU2-164). `quantity`: 'pR' (l'arrelament) o 'λ' (les aparicions detectades). Sis casos, i la regla de la
// precisió: si l'interval és més ample que la regla, és inconcloent, sigui quin sigui. Un interval que conté 1 no és cap prova
// d'equivalència: «compatible amb 1». Amb la regla de la precisió, «no discrimina» només surt amb l'interval [1; el de l'establiment] exacte
// (l'auditor 1, auditoria 33). Per a λdet, que només compta deteccions, la lectura és una classificació numèrica de l'interval, sense cap
// mecanisme (AU2-174)
export function reading(ci, reference, { quantity = 'pR', precision = ANALYSIS.precision } = {}) {
  const [lo, hi] = ci;
  if (lo === null || hi === null || !(lo > 0)) return 'inconcloent: l\'interval no es pot calcular';
  const half = (Math.log(hi) - Math.log(lo)) / 2;
  if (half > precision) return `inconcloent: l'interval és massa ample (semiamplada ${half.toFixed(3)} en logaritme, més de ${precision.toFixed(3)})`;
  const has1 = lo <= 1 && 1 <= hi, hasR = lo <= reference && reference <= hi;
  if (quantity !== 'pR') {
    const where = has1 && hasR ? "conté 1 i el de l'establiment" : hasR ? `compatible amb el de l'establiment (${reference}) i no amb 1`
      : has1 ? "compatible amb 1 i no amb el de l'establiment" : hi < 1 ? "per sota d'1" : lo > reference ? `per sobre del de l'establiment (${reference})`
        : `entre 1 i el de l'establiment (${reference})`;
    return `${where}: una comparació numèrica de les aparicions detectades, que no identifica ni atribueix cap mecanisme`;
  }
  const what = "l'arrelament d'aquestes variants", other = "l'aparició";
  if (has1 && hasR) return 'no discrimina: l\'interval conté 1 i el de l\'establiment';
  if (hasR) return `compatible amb el de l'establiment (${reference}) i no amb 1: ${what} pot explicar tot l'efecte`;
  if (has1) return `compatible amb 1 i no amb el de l'establiment: ${what} no explica tot l'efecte, i la resta hauria de venir de ${other}. No és cap prova que no hi canviï`;
  if (hi < 1) return `per sota d'1: ${what} hi va en contra, i l'efecte de l'establiment hauria de venir de ${other}`;
  if (lo > reference) return `per sobre del de l'establiment (${reference}): ${what} explicaria més que tot l'efecte, i ${other} hi aniria en contra`;
  return `entre 1 i el de l'establiment (${reference}): ${what} explica una part de l'efecte, i la resta hauria de venir de ${other}`;
}

export function loadPilot(d = DESIGN, { root = ROOT } = {}) {
  const m = JSON.parse(readFileSync(join(root, d.folder, 'manifest.json'), 'utf8'));
  // el manifest, contra el disseny: totes les branques, cap de més ni de repetida, i els escanejos inerts de partida (AU2-170, AU2-171)
  const problems = designProblems(d, m, { root }), recs = new Map();
  for (const b of Array.isArray(m.branches) ? m.branches : []) {
    const file = join(root, d.folder, b.part === 'A' ? 'part-a' : 'part-b', `${b.id}.jsonl`);
    if (!existsSync(file)) { problems.push(`${b.id}: no hi ha el registre`); continue; }
    let lines;
    try { lines = readJsonl(file); } catch { problems.push(`${b.id}: el registre no es pot llegir`); continue; }
    if (lines[0]?.type !== 'start' || lines.at(-1)?.type !== 'end') { problems.push(`${b.id}: el registre no és sencer`); continue; }
    if (lines[0].command !== b.command) problems.push(`${b.id}: l'ordre del registre no és la del manifest`);
    if (typeof lines[0].code !== 'string' || lines[0].code.includes('+')) problems.push(`${b.id}: el codi del registre no és un commit net`);
    // el commit del registre ha de ser el del manifest (AU2-162): la preparació i les branques, des de la mateixa còpia
    else if (lines[0].code !== m.code) problems.push(`${b.id}: el registre és de ${lines[0].code}, i el manifest, de ${m.code}`);
    if (b.part === 'A' && lines[0].plant?.fileSha256 !== b.plantSha256) problems.push(`${b.id}: la sembra del registre no és la del manifest`);
    if (b.part === 'B' && lines[0].track?.fileSha256 !== b.trackSha256) problems.push(`${b.id}: el seguiment del registre no és el del manifest`);
    recs.set(b.id, lines);
  }
  return { manifest: m, recs, problems };
}

export function analyse(d = DESIGN, { root = ROOT, out = console.log, count = ANALYSIS.bootstrap } = {}) {
  const { manifest: m, recs, problems } = loadPilot(d, { root });
  out(`El pilot de l'aparició i l'arrelament: l'anàlisi de la §6 (exploratori). Manifest: ${m.code}; ${m.branches.length} branques.`);
  if (problems.length) { out(`\nNo s'analitza res: ${problems.length} problemes.\n- ${problems.slice(0, 30).join('\n- ')}`); return { ok: false, problems }; }
  const start = d.age;
  const cohortW = m.worlds.filter((w) => w.included);
  const cohort = cohortW.map((w) => w.world);
  const med = (xs) => (xs.length ? [...xs].sort((a, b) => a - b)[(xs.length - 1) >> 1] : null);

  // la part B primer: el control de les col·lisions (el seguiment dels genotips als bessons, sense plantar-los; AU2-156)
  const retest = conditions(INERT_CONDITIONS_SEED, ANALYSIS.retest.from + ANALYSIS.retest.count).slice(ANALYSIS.retest.from);
  const retestCache = new Map();
  // en quantes de les 100 condicions de la prova és hereditari (sol o en context)
  const retestScore = (hex) => {
    if (!retestCache.has(hex)) {
      const s = testInert(fromHex(hex), retest);
      let k = 0;
      for (let i = 0; i < s.heritableSolo.length; i++) if (s.heritableSolo[i] === '1' || s.heritableContext[i] === '1') k++;
      retestCache.set(hex, k);
    }
    return retestCache.get(hex);
  };
  // el punt de partida de cada sopa de la part B (l'escaneig inert de l'època 8.000; loadPilot ja n'ha comprovat la SHA-256, AU2-171):
  //  - les finestres de les cel·les hereditàries: «les de partida», les que ja hi eren (AUD-201);
  //  - les de totes les cel·les que s'hi copiaven: «les emparentades» amb la sopa de partida, la regla de la v0.3 (AUD-193)
  const startingWindows = new Map();
  for (const w of cohortW) {
    for (const soup of d.arms) {
      const related = new Windows(), heritableStart = new Windows();
      for (const c of JSON.parse(readFileSync(join(root, w.arms[soup].inertScan.file), 'utf8')).copiers) {
        related.addProgram(fromHex(c.program));
        if (heritable(c)) heritableStart.addProgram(fromHex(c.program));
      }
      startingWindows.set(`${w.world}|${soup}`, { related, heritableStart });
    }
  }
  const B = m.branches.filter((b) => b.part === 'B').map((b) => {
    const lines = recs.get(b.id), ev = lines.find((l) => l.type === 'event'), end = lines.at(-1);
    const inert = lines.filter((l) => l.type === 'inert');
    const exposureEnd = ev ? ev.epoch : end.epoch;
    const fams = families(inert.filter((l) => l.epoch <= exposureEnd));
    const sw = startingWindows.get(`${b.world}|${b.soup}`);
    // de partida: algun programa de la primera detecció comparteix una finestra amb una cel·la hereditària del punt de partida (AUD-201);
    // emparentada: algun programa de la família, de qualsevol cens, en comparteix una amb qualsevol cel·la que s'hi copiava
    const apps = fams.map((f) => ({ f, score: Math.max(...f.programs.map(retestScore)), ...startingFlags(f, sw) })).filter((x) => x.score >= 1);
    let dom = null, rootedIds = new Set();
    if (ev) {
      const ir = inert.find((l) => l.epoch === ev.confirmed);
      if (ir) {
        const all = families(inert.filter((l) => l.epoch <= ev.confirmed));
        dom = dominantFamily(all, ir);
        rootedIds = rootedFamilies(all, dom);
      }
    }
    const track = lines.filter((l) => l.type === 'lineage' && l.epoch <= start + d.horizonA + ANALYSIS.interval);
    const collisionF = track.length ? Math.max(...track.map((l) => l.F)) : 0;
    // l'últim establiment que la branca pot confirmar: el seu, si n'hi ha; si no, el de 250 èpoques abans del final (AUD-199)
    const lastObservable = ev ? ev.epoch : end.epoch - ANALYSIS.interval;
    return { ...b, ev, exposure: exposureEnd - start, apps, dom, rootedIds, end, lastObservable, collisionF, preCarriers: lines[0].track?.preCarriers ?? null };
  });
  const collided = new Set(B.filter((b) => b.collisionF >= ANALYSIS.collision).map((b) => `${b.world}|${b.soup}`));

  // la part A
  const A = m.branches.filter((b) => b.part === 'A').map((b) => ({ ...b, r: partA(recs.get(b.id), { start, horizon: d.horizonA }) }));
  const byWorld = new Map(cohort.map((w) => [w, A.filter((b) => b.world === w)]));
  const roots = { arrela: (b) => b.r.outcome === 'arrela', estricte: (b) => b.r.rootedStrictAt !== null, 'llei 2': (b) => !!b.r.law2?.dominant,
    'censurades com si arrelessin': (b) => b.r.outcome !== "s'extingeix" };
  const pR = (bs, f = roots.arrela) => (bs.length ? bs.filter(f).length / bs.length : null);
  out('\n1. pR, la part de les sembres que arrelen dins de H (interval del bootstrap per món)');
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
  out('   Els desenllaços (arrela / s\'extingeix / censurada a H / censurada per l\'establiment), per sopa:');
  for (const s of [...d.arms, ...d.byte0Arms]) {
    const bs = A.filter((b) => b.soup === s && b.variant !== 'sham');
    const c = (f) => bs.filter(f).length;
    out(`   ${s.padEnd(14)} ${c((b) => b.r.outcome === 'arrela')} / ${c((b) => b.r.outcome === "s'extingeix")} / ${c((b) => b.r.censor === 'horitzó')} / ${c((b) => b.r.censor === 'establiment')} (de ${bs.length})`);
  }

  // el contrast principal, amb les sensibilitats
  const strataOf = (bs, soup1, soup0, variants, f) => variants.map((v) => {
    const s1 = bs.filter((b) => b.variant === v && b.soup === soup1), s0 = bs.filter((b) => b.variant === v && b.soup === soup0);
    return { a: s1.filter(f).length, n1: s1.length, b: s0.filter(f).length, n0: s0.length };
  });
  const contrast = (soup1, soup0, variants, f = roots.arrela, keep = () => true) => {
    const bs = A.filter(keep);
    const est = mh(strataOf(bs, soup1, soup0, variants, f));
    const ci = bootstrap(cohort.map((w) => bs.filter((b) => b.world === w)), (sample) => mh(strataOf(sample.flat(), soup1, soup0, variants, f)), { count });
    return { est, ci };
  };
  const line = (c) => `${fmt(c.est, 2)} [${fmt(c.ci[0], 2)}, ${fmt(c.ci[1], 2)}]`;
  out('\n2. El contrast principal: el quocient de pR, estratificat per variant (Mantel i Haenszel), amb G1, G1x9 i G4');
  const main = {};
  const noCollision = (b) => !collided.has(`${b.world}|${b.soup}`) && !collided.has(`${b.world}|reinit`);
  for (const soup of ['continue', 'shuffle-all']) {
    const c = contrast(soup, 'reinit', ANALYSIS.informative);
    main[soup] = c;
    out(`   ${soup} contra reinit: ${line(c)}`);
    for (const v of ANALYSIS.informative) out(`     ${v}: ${line(contrast(soup, 'reinit', [v]))}`);
    main[`llei 2 ${soup}`] = contrast(soup, 'reinit', ANALYSIS.informative, roots['llei 2']);
    out(`     amb «s'estableix amb el llinatge dominant»: ${line(main[`llei 2 ${soup}`])}`);
    out(`     sensibilitats: les censurades com si arrelessin ${line(contrast(soup, 'reinit', ANALYSIS.informative, roots['censurades com si arrelessin']))}; el criteri estricte de F ${line(contrast(soup, 'reinit', ANALYSIS.informative, roots.estricte))}; sense les col·lisions ${line(contrast(soup, 'reinit', ANALYSIS.informative, roots.arrela, noCollision))}`);
  }
  const b0 = contrast('byte0', 'byte0-placebo', ANALYSIS.byte0);
  out(`   byte0 contra byte0-placebo (G1x9 i G4, secundari, amb 2 posicions: només veu efectes grossos): ${line(b0)}`);
  out(`   Les col·lisions: mons i sopes amb F de ${ANALYSIS.collision} o més al seguiment del bessó, ${collided.size} de ${B.length}; cel·les amb alguna finestra dels genotips abans de plantar-los (la mediana), ${fmt(med(A.map((b) => b.r.preCarriers).filter((x) => x !== null)), 0)}`);

  // la part B: les aparicions detectades
  const lam = (bs, pick) => { const e = bs.reduce((s, b) => s + b.exposure, 0); return e ? (1000 * bs.reduce((s, b) => s + b.apps.filter(pick).length, 0)) / e : null; };
  // els dos llindars, cadascun amb totes les famílies, sense les de partida i sense les emparentades (AU2-175, AUD-201)
  const robust = (x) => x.score >= ANALYSIS.robust;
  const picks = { 'en alguna': () => true, 'en alguna, sense les de partida': (x) => !x.preexisting, 'en alguna, sense les emparentades': (x) => !x.related,
    robustes: robust, 'robustes, sense les de partida': (x) => robust(x) && !x.preexisting, 'robustes, sense les emparentades': (x) => robust(x) && !x.related };
  out("\n3. λdet, les aparicions DETECTADES pel cens inert per cada 1.000 mon-èpoques abans de l'establiment (la part B). No és el ritme de formació");
  out("   «de partida»: algun programa de la primera detecció comparteix una finestra amb una cel·la hereditària de l'escaneig inert de l'època 8.000; «emparentada»: algun programa de la família en comparteix una amb qualsevol cel·la que s'hi copiava");
  for (const soup of d.arms) {
    const bs = B.filter((b) => b.soup === soup);
    const parts = Object.entries(picks).map(([k, pick]) => {
      const ci = bootstrap(cohort.map((w) => bs.filter((b) => b.world === w)), (s) => lam(s.flat(), pick), { count });
      return `${k} ${fmt(lam(bs, pick), 3)} [${fmt(ci[0], 3)}, ${fmt(ci[1], 3)}]`;
    });
    out(`   ${soup.padEnd(12)} ${parts.join('; ')}; ${bs.filter((b) => b.ev).length} establiments de ${bs.length}`);
  }
  for (const soup of ['continue', 'shuffle-all']) {
    for (const [k, pick] of Object.entries(picks)) {
      const r = (s) => { const a = lam(s.filter((b) => b.soup === soup), pick), z = lam(s.filter((b) => b.soup === 'reinit'), pick); return a !== null && z ? a / z : null; };
      const ci = bootstrap(cohort.map((w) => B.filter((b) => b.world === w)), (s) => r(s.flat()), { count });
      main[`λ ${soup} ${k}`] = { est: r(B), ci };
      out(`   ${soup} contra reinit (${k}): ${fmt(r(B), 2)} [${fmt(ci[0], 2)}, ${fmt(ci[1], 2)}]`);
    }
  }
  // la calibració del detector (AU2-175), amb la part A, on el llinatge en dona la mida: a cada cens inert, si ha vist el llinatge, per la
  // F del llinatge a la mateixa època; i, per llinatge, si l'ha vist mai, per la F màxima. Descriptiu: no corregeix les aparicions que el
  // cens no veu
  const bins = ANALYSIS.calibration, binOf = (F) => { const i = bins.findIndex((x) => F <= x); return i < 0 ? bins.length : i; };
  const binName = (i) => (i === 0 ? 'F = 1' : i < bins.length ? `F de ${bins[i - 1] + 1} a ${bins[i]}` : `F de ${bins.at(-1) + 1} o més`);
  out("   La calibració del detector (la part A, sense els sham): els censos inerts que veuen el llinatge, per la F del llinatge a la mateixa època; i els llinatges que el cens veu alguna vegada, per la F màxima");
  for (const soup of d.arms) {
    const per = bins.map(() => [0, 0]).concat([[0, 0]]), ever = bins.map(() => [0, 0]).concat([[0, 0]]);
    for (const b of A.filter((x) => x.soup === soup && x.variant !== 'sham')) {
      const lines = recs.get(b.id), lin = new Map(lines.filter((l) => l.type === 'lineage').map((l) => [l.epoch, l.F]));
      for (const ir of lines.filter((l) => l.type === 'inert')) {
        const F = lin.get(ir.epoch);
        if (!F) continue;
        const k = binOf(F); per[k][1]++; if ((ir.lineage ?? 0) > 0) per[k][0]++;
      }
      if (b.r.Fmax > 0) { const k = binOf(b.r.Fmax); ever[k][1]++; if (b.r.detectedAt !== null) ever[k][0]++; }
    }
    out(`   ${soup.padEnd(12)} per cens: ${per.map(([k, n], i) => `${binName(i)}, ${k} de ${n}`).join('; ')}`);
    out(`   ${''.padEnd(12)} per llinatge: ${ever.map(([k, n], i) => `${binName(i)}, ${k} de ${n}`).join('; ')}`);
  }

  // la consistència: la mateixa definició (AU2-158), i la mateixa finestra i la mateixa regla de seguiment a les dues parts (AUD-199 =
  // AU2-172). P = arrela / (arrela + competidor + no arrela); les censurades no hi entren, i es compten
  out(`\n4. La consistència: P(arrela | detectada), dominant (la meitat o més) a un establiment en ${ANALYSIS.followUp} èpoques des de la primera detecció, amb la mateixa regla de seguiment a les dues parts`);
  const sizeClass = (n) => (n <= 1 ? '1' : n <= 4 ? '2 a 4' : '5 o més');
  const natClass = ({ f, b }) => followUpClass({ detected: f.first, event: b.ev ? b.ev.epoch : null, dominant: b.rootedIds.has(f.id), lastObservable: b.lastObservable });
  // a la part A, l'últim establiment que es pot confirmar és el de start + H: la branca arriba a start + H + 250 (o s'atura abans perquè el
  // llinatge s'extingeix, i llavors ja no pot ser dominant)
  const plClass = (b) => followUpClass({ detected: b.r.detectedAt, event: b.r.law2 ? b.r.law2.epoch : null, dominant: !!b.r.law2?.dominant, lastObservable: start + d.horizonA });
  const tally = (xs, cls) => { const t = { arrela: 0, competidor: 0, 'no arrela': 0, censurada: 0 }; for (const x of xs) t[cls(x)]++; return t; };
  const pOf = (t) => { const n = t.arrela + t.competidor + t['no arrela']; return { k: t.arrela, n }; };
  const fr = ({ k, n }) => `${k} de ${n} (${fmt(n ? k / n : null, 2)})`;
  const counts = (t) => `arrela ${t.arrela}, competidor ${t.competidor}, no arrela ${t['no arrela']}, censurades ${t.censurada}`;
  const sansComp = (t) => ({ k: t.arrela, n: t.arrela + t['no arrela'] });
  for (const soup of d.arms) {
    const nat = B.filter((b) => b.soup === soup).flatMap((b) => b.apps.filter(robust).map((x) => ({ f: x.f, b })));
    const pl = A.filter((b) => b.soup === soup && b.variant !== 'sham' && b.r.detectedAt !== null);
    const tn = tally(nat, natClass), tp = tally(pl, plClass);
    out(`   ${soup.padEnd(12)} naturals robustes ${fr(pOf(tn))}; plantats ${fr(pOf(tp))}`);
    out(`     naturals: ${counts(tn)}; plantats: ${counts(tp)}; sense els competidors: naturals ${fr(sansComp(tn))}, plantats ${fr(sansComp(tp))}`);
    for (const cls of ['1', '2 a 4', '5 o més']) {
      const n1 = tally(nat.filter(({ f }) => sizeClass(f.size) === cls), natClass), p1 = tally(pl.filter((b) => sizeClass(b.r.detectedSize) === cls), plClass);
      out(`     la mida a la primera detecció, ${cls}: naturals ${fr(pOf(n1))}; plantats ${fr(pOf(p1))}`);
    }
    const lamR = lam(B.filter((b) => b.soup === soup), robust);
    const pn = pOf(tn), p = pn.n ? pn.k / pn.n : null;
    const est = B.filter((b) => b.soup === soup), rate = est.reduce((s, b) => s + b.exposure, 0) ? (1000 * est.filter((b) => b.ev).length) / est.reduce((s, b) => s + b.exposure, 0) : null;
    out(`     aproximació exploratòria (AU2-161): λdet robustes × P = ${fmt(lamR !== null && p !== null ? lamR * p : null, 3)}, contra el ritme d'establiment observat, ${fmt(rate, 3)} per 1.000 mon-èpoques. Suposa que totes les aparicions que arrelen es detecten, i que la detecció no depèn de la sopa`);
  }

  // la lectura
  out('\n5. La lectura (§1)');
  for (const soup of ['continue', 'shuffle-all']) {
    const ref = ANALYSIS.reference[soup];
    out(`   ${soup}, pR (arrela): ${reading(main[soup].ci, ref)}`);
    out(`   ${soup}, pR (s'estableix amb el llinatge dominant): ${reading(main[`llei 2 ${soup}`].ci, ref)}`);
    const a = reading(main[soup].ci, ref), b = reading(main[`llei 2 ${soup}`].ci, ref);
    if (a.split(':')[0] !== b.split(':')[0]) out('   les dues mesures de pR no diuen el mateix: es diu, sense triar-ne cap');
    out(`   ${soup}, λdet (robustes, descriptiu): ${reading(main[`λ ${soup} robustes`].ci, ref, { quantity: 'λ' })}`);
  }

  // els descriptius
  out('\n6. Els descriptius');
  const agree = A.filter((b) => b.variant !== 'sham');
  const both = (o, l) => agree.filter((b) => (b.r.outcome === 'arrela') === o && ((b.r.law2?.dominant ?? false) === l)).length;
  out(`   «arrela» i «s'estableix amb el llinatge dominant»: totes dues ${both(true, true)}, només arrela ${both(true, false)}, només s'estableix ${both(false, true)}, cap ${both(false, false)}`);
  const ext = A.filter((b) => b.r.extinctAt !== null).map((b) => b.r.extinctAt - start);
  const rt = A.filter((b) => b.r.rootedAt !== null).map((b) => b.r.rootedAt - start);
  out(`   s'extingeixen ${ext.length} (la mediana, ${med(ext)} èpoques); arrelen ${rt.length} (la mediana, ${med(rt)} èpoques); el criteri estricte de F hi canvia ${A.filter((b) => (b.r.rootedAt !== null) !== (b.r.rootedStrictAt !== null)).length}`);
  out('   Els sham contra els bessons (descriptiu: escriure una cel·la canvia la història del món, AUD-194; només veuria un efecte molt gros, AUD-196):');
  for (const b of A.filter((x) => x.variant === 'sham')) {
    const twin = B.find((x) => x.world === b.world && x.soup === b.soup);
    const cs = (lines) => new Map(lines.filter((l) => l.type === 'census').map((l) => [l.epoch, l.heritable / l.sample]));
    const s1 = cs(recs.get(b.id)), s0 = cs(recs.get(twin.id));
    const common = [...s1.keys()].filter((e) => s0.has(e));
    const diff = common.length ? common.reduce((s, e) => s + (s1.get(e) - s0.get(e)), 0) / common.length : null;
    out(`   ${b.id}: establiment ${recs.get(b.id).find((l) => l.type === 'event')?.epoch ?? 'cap'}, el bessó ${twin?.ev?.epoch ?? 'cap'}; la diferència mitjana de la part hereditària dels censos comuns, ${fmt(diff, 4)} (${common.length} censos)`);
  }
  out('\n   El punt de partida de cada sopa (la mediana dels mons): les que es repliquen i les hereditàries, amb la prova del cens; amb companys inerts, les que es copien i les hereditàries');
  for (const soup of [...d.arms, ...d.byte0Arms]) {
    const ws = cohortW.map((x) => x.arms[soup]);
    const mdn = (f) => med(ws.map(f).filter((x) => x !== undefined));
    out(`   ${soup.padEnd(14)} ${mdn((x) => x.scan.replicating)} / ${mdn((x) => x.scan.heritable)}${ws[0].inertScan ? `; ${mdn((x) => x.inertScan.copying)} / ${mdn((x) => x.inertScan.heritable)}` : ''}`);
  }
  return { ok: true, main };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = analyse();
  process.exit(r.ok ? 0 : 1);
}
