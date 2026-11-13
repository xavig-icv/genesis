// Exploratori (la maduració, pas 3): l'anàlisi fixada al README d'aquesta carpeta, escrita abans de mirar cap resultat.
//
//   node fase2/resultats/maduracio/durada/durada-analisi.mjs CARPETA-DELS-REGISTRES CARPETA-DEL-1034 [--prova] > durada-analisi-sortida.txt
//
// Llegeix els registres de durada.mjs (durada-E.jsonl) i n'exigeix les 33 èpoques dels tres trams, el mateix commit (sense canvis), la
// mateixa versió de Node, la química, la llavor i les condicions de durada.mjs, i la SHA-256 de l'escaneig del pas 1 d'ara. Amb --prova,
// accepta les èpoques que hi hagi (la prova curta). CARPETA-DEL-1034: les captures, per als rastres (punt 3), comprovades amb la SHA-256
// de cada registre.
//
// Les definicions:
//  - «es copia» (a les 10): sola o en context, en alguna de les 10 primeres condicions, les de la prova de totes les cel·les; «hereditària»
//    (a les 10): hereditària sola o en context en alguna de les 10. A les 100: el mateix, en alguna de les 100 condicions (en quantes);
//  - les classes, pel nombre de condicions de 100 en què es copia (o en què és hereditària): menys de 95, de 95 a 99, i totes 100;
//  - la família: les cel·les que es copien a les 10 i comparteixen una finestra de 16 bytes de la prova (windowsOf, de fase2/replication.js:
//    almenys 6 valors diferents, en qualsevol dels dos sentits), unides de dues en dues. Una família és hereditària si algun membre ho és
//    a les 100;
//  - el llinatge: les famílies de captures seguides d'un mateix tram que comparteixen una finestra, unides. La seva durada: les captures que
//    abasta. Si inclou la primera captura del tram, no sabem quan va començar; si inclou l'última, no sabem quan acaba;
//  - una aparició: un llinatge que no inclou la primera captura del tram;
//  - els rastres d'una família a la captura següent: les cel·les qualssevol que hi porten alguna de les seves finestres, i si el programa
//    d'algun membre hi és, igual, en alguna cel·la;
//  - els fràgils que les 10 condicions es deixen: per a cada cel·la que es copia a les 10, p = (k + 1) / 92, amb k les condicions de les
//    altres 90 (de la 10 a la 99) en què es copia (la correcció de Laplace, perquè una cel·la que només es copia a les 10 primeres no doni
//    0); la probabilitat de detectar-la, 1 − (1 − p)^10; i l'estimació del total, la suma d'1 partit per aquesta probabilitat. Igual per a
//    les hereditàries, amb les cadenes de l'herència. Només orientativa.
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { windowsOf, WINDOW } from '../../../../fase2/replication.js';
import { codeVersion, sha256 } from '../../../../eines/b1-comu.mjs';
import { ROOT, SCAN, SEED, SCREEN, CONDITIONS, CHEMISTRY, STRETCHES, EPOCHS, captureName } from './durada.mjs';

const argv = process.argv.slice(2), test = argv.includes('--prova'), [dir, capturesDir] = argv.filter((a) => a !== '--prova');
if (!dir || !capturesDir) { console.error('Ús: node fase2/resultats/maduracio/durada/durada-analisi.mjs CARPETA-DELS-REGISTRES CARPETA-DEL-1034 [--prova]'); process.exit(2); }
const fail = (m) => { console.error(`Error: ${m}`); process.exit(1); };
const WIDTH = 512, OPS = '<>{}-+.,[]';

// els registres
const files = readdirSync(dir).filter((f) => /^durada-\d+\.jsonl$/.test(f));
const scanSha = sha256(readFileSync(join(ROOT, SCAN)));
const records = new Map();
for (const f of files) {
  const lines = readFileSync(join(dir, f), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const start = lines[0], end = lines[lines.length - 1], cells = lines.slice(1, -1);
  if (start.type !== 'start' || end.type !== 'end') fail(`${f}: sense la línia d'inici o la final`);
  if (f !== `durada-${start.epoch}.jsonl` || end.epoch !== start.epoch) fail(`${f}: l'època no hi quadra`);
  if (cells.some((c) => c.type !== 'cell') || cells.length !== end.retested) fail(`${f}: les cel·les no hi quadren`);
  if (start.seed !== SEED || start.screen !== SCREEN || start.conditions !== CONDITIONS || start.chemistry !== CHEMISTRY) fail(`${f}: la llavor, les condicions o la química no són les de durada.mjs`);
  if (start.scanRecordSha256 !== scanSha) fail(`${f}: l'escaneig del pas 1 no és el d'ara`);
  if (String(start.code).includes('+')) fail(`${f}: el codi tenia canvis (${start.code})`);
  records.set(start.epoch, { start, end, cells });
}
const epochs = [...records.keys()].sort((a, b) => a - b);
if (!epochs.length) fail('cap registre');
const codes = new Set(epochs.map((e) => records.get(e).start.code)), nodes = new Set(epochs.map((e) => records.get(e).start.node));
if (codes.size !== 1 || nodes.size !== 1) fail(`els registres no són tots del mateix commit i la mateixa versió de Node: ${[...codes]} ${[...nodes]}`);
const missing = EPOCHS.filter((e) => !records.has(e)), extra = epochs.filter((e) => !EPOCHS.includes(e));
if (extra.length) fail(`èpoques que no són de cap tram: ${extra}`);
if (missing.length && !test) fail(`falten ${missing.length} èpoques de les ${EPOCHS.length}: ${missing}`);

// cada cel·la tornada a provar, amb les xifres
const anyOf = (a, b, from = 0, to = a.length) => { let n = 0; for (let j = from; j < to; j++) if (a[j] === '1' || b[j] === '1') n++; return n; };
for (const e of epochs) {
  for (const c of records.get(e).cells) {
    c.copy10 = anyOf(c.solo, c.context, 0, SCREEN) > 0;
    c.her10 = anyOf(c.heritableSolo, c.heritableContext, 0, SCREEN) > 0;
    c.copy100 = anyOf(c.solo, c.context);
    c.her100 = anyOf(c.heritableSolo, c.heritableContext);
    c.copyRest = anyOf(c.solo, c.context, SCREEN, CONDITIONS);
    c.herRest = anyOf(c.heritableSolo, c.heritableContext, SCREEN, CONDITIONS);
    c.inScan = c.scan !== null;
    c.scanHer = !!(c.scan && c.scan.heritable);
    c.bytes = Uint8Array.from(Buffer.from(c.program, 'hex'));
    c.code = [...c.bytes].map((b) => String.fromCharCode(b)).filter((ch) => OPS.includes(ch)).join('');
  }
}
const stretchOf = (e) => Object.keys(STRETCHES).find((k) => e >= STRETCHES[k][0] && e <= STRETCHES[k][1]);
const stretchEpochs = (k) => epochs.filter((e) => stretchOf(e) === k);
const cls = (n) => (n >= CONDITIONS ? 'totes 100' : n >= 95 ? 'de 95 a 99' : n >= 1 ? 'menys de 95' : 'cap');
const CLASSES = ['menys de 95', 'de 95 a 99', 'totes 100'];
const pct = (a, b) => (b ? `${(100 * a / b).toFixed(0)} %` : '—');
const mean = (v) => (v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0);

const first = records.get(epochs[0]).start;
console.log('LA MADURACIÓ, PAS 3 (EXPLORATORI): QUANT VIUEN ELS REPLICADORS NOUS DEL MÓN 1034, I QUANTS EN VEU L\'ESCANEIG');
console.log(`Els registres: ${epochs.length} captures, codi ${first.code}, ${first.node}; la química ${CHEMISTRY}, la llavor ${SEED}, ${SCREEN} condicions a totes les cel·les i ${CONDITIONS} a les tornades a provar.`);
console.log(`L'anàlisi: codi ${codeVersion(ROOT)}, ${process.version}.${test ? ` PROVA: només ${epochs.length} de les ${EPOCHS.length} èpoques; cap resultat.` : ''}`);

// 1. Quants
console.log('\n1. QUANTS: les cel·les que es copien amb companys inerts (a les 10 condicions), de 131.072, i les hereditàries');
console.log('   època: es copien (sola / en context); hereditàries; de les que es copien, a les 100: menys de 95 | de 95 a 99 | totes 100; de les hereditàries, a les 100: el mateix');
for (const k of Object.keys(STRETCHES)) {
  const es = stretchEpochs(k);
  if (!es.length) continue;
  console.log(`   El tram ${k} (de la ${STRETCHES[k][0]} a la ${STRETCHES[k][1]}):`);
  for (const e of es) {
    const { end, cells } = records.get(e), cp = cells.filter((c) => c.copy10), hr = cells.filter((c) => c.her10);
    const byCls = (v, key) => CLASSES.map((x) => v.filter((c) => cls(c[key]) === x).length).join(' | ');
    console.log(`   ${String(e).padStart(5)}: ${end.copy} (${end.copySolo} / ${end.copyContext}); ${end.heritable}; ${byCls(cp, 'copy100')}; ${byCls(hr, 'her100')}`);
  }
  const ends = es.map((e) => records.get(e).end);
  console.log(`   mitjana per captura: es copien ${mean(ends.map((x) => x.copy)).toFixed(2)}, hereditàries ${mean(ends.map((x) => x.heritable)).toFixed(2)}; captures amb alguna que es copia, ${ends.filter((x) => x.copy > 0).length} de ${es.length}; amb alguna hereditària, ${ends.filter((x) => x.heritable > 0).length}`);
}

// 2. La sensibilitat de l'escaneig
console.log("\n2. LA SENSIBILITAT DE L'ESCANEIG DEL CENS (el del pas 1, a les mateixes captures)");
const sens = (label, es) => {
  const all = es.flatMap((e) => records.get(e).cells);
  const cp = all.filter((c) => c.copy10), hr = all.filter((c) => c.her10);
  console.log(`   ${label}:`);
  console.log(`     de les que es copien amb companys inerts (a les 10), ${cp.length}: l'escaneig en veu ${cp.filter((c) => c.inScan).length} (${pct(cp.filter((c) => c.inScan).length, cp.length)}); per classe (a les 100), ${CLASSES.map((x) => { const v = cp.filter((c) => cls(c.copy100) === x); return `${x}: ${v.filter((c) => c.inScan).length} de ${v.length}`; }).join('; ')}`);
  console.log(`     de les hereditàries amb companys inerts (a les 10), ${hr.length}: hereditàries a l'escaneig, ${hr.filter((c) => c.scanHer).length} (${pct(hr.filter((c) => c.scanHer).length, hr.length)}); positius de l'escaneig, ${hr.filter((c) => c.inScan).length}; per classe (a les 100), ${CLASSES.map((x) => { const v = hr.filter((c) => cls(c.her100) === x); return `${x}: ${v.filter((c) => c.scanHer).length} de ${v.length}`; }).join('; ')}`);
  const sc = all.filter((c) => c.inScan), sh = all.filter((c) => c.scanHer);
  console.log(`     al revés: dels positius de l'escaneig, ${sc.length}, es copien amb companys inerts a les 100 ${sc.filter((c) => c.copy100 > 0).length} (${pct(sc.filter((c) => c.copy100 > 0).length, sc.length)}), i ${sc.filter((c) => c.copy100 > 0 && !c.copy10).length} d'aquests no s'havien copiat a les 10; de les seves hereditàries, ${sh.length}, ho són amb companys inerts ${sh.filter((c) => c.her100 > 0).length} (${pct(sh.filter((c) => c.her100 > 0).length, sh.length)})`);
};
for (const k of Object.keys(STRETCHES)) { const es = stretchEpochs(k); if (es.length) sens(`el tram ${k}`, es); }
sens('els tres trams', epochs);

// 3. Les famílies i els llinatges
const families = new Map(); // època -> [{ id, members, windows, heritable }]
let nextId = 0;
for (const e of epochs) {
  const cp = records.get(e).cells.filter((c) => c.copy10);
  const parent = cp.map((_, i) => i), find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const owner = new Map();
  cp.forEach((c, i) => {
    c.windows = windowsOf(c.bytes);
    for (const w of c.windows) { if (owner.has(w)) parent[find(i)] = find(owner.get(w)); else owner.set(w, i); }
  });
  const groups = new Map();
  cp.forEach((c, i) => { const r = find(i); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(c); });
  families.set(e, [...groups.values()].map((members) => ({
    id: nextId++, epoch: e, members, windows: new Set(members.flatMap((c) => [...c.windows])), heritable: members.some((c) => c.her100 > 0),
  })));
}
const allFams = epochs.flatMap((e) => families.get(e));
const famParent = new Map(allFams.map((f) => [f.id, f.id]));
const ffind = (i) => (famParent.get(i) === i ? i : (famParent.set(i, ffind(famParent.get(i))), famParent.get(i)));
const links = new Map(allFams.map((f) => [f.id, []]));
for (const e of epochs) {
  const next = e + 100;
  if (!records.has(next) || stretchOf(next) !== stretchOf(e)) continue;
  for (const f of families.get(e)) {
    for (const g of families.get(next)) {
      let shared = false;
      for (const w of g.windows) if (f.windows.has(w)) { shared = true; break; }
      if (shared) { famParent.set(ffind(g.id), ffind(f.id)); links.get(f.id).push(g.id); }
    }
  }
}
const lineages = new Map();
for (const f of allFams) { const r = ffind(f.id); if (!lineages.has(r)) lineages.set(r, []); lineages.get(r).push(f); }
const lin = [...lineages.values()].map((fs) => {
  const es = [...new Set(fs.map((f) => f.epoch))].sort((a, b) => a - b), k = stretchOf(es[0]), se = stretchEpochs(k);
  const members = fs.flatMap((f) => f.members);
  return {
    fams: fs, stretch: k, from: es[0], to: es[es.length - 1], span: es.length, contiguous: es.length === (es[es.length - 1] - es[0]) / 100 + 1,
    leftCensored: es[0] === se[0], rightCensored: es[es.length - 1] === se[se.length - 1],
    heritable: fs.some((f) => f.heritable), maxSize: Math.max(...es.map((e) => fs.filter((f) => f.epoch === e).reduce((s, f) => s + f.members.length, 0))),
    maxCopy: Math.max(...members.map((c) => c.copy100)), maxHer: Math.max(...members.map((c) => c.her100)),
    scanSeen: members.filter((c) => c.inScan).length, members: members.length,
    code: members.reduce((a, c) => (c.her100 > a.her100 || (c.her100 === a.her100 && c.copy100 > a.copy100) ? c : a)).code,
  };
});

// els rastres, a la captura següent
const traces = new Map(); // id de família -> { cells, sameProgram }
const readCapture = (e) => {
  const buf = new Uint8Array(readFileSync(join(capturesDir, captureName(e))));
  if (sha256(buf) !== records.get(e).start.sha256) fail(`${captureName(e)}: la SHA-256 no és la del registre`);
  return buf;
};
for (const e of epochs) {
  const next = e + 100, fams = families.get(e);
  if (!fams.length || !records.has(next) || stretchOf(next) !== stretchOf(e)) continue;
  const buf = readCapture(next), byWindow = new Map(), programs = new Map();
  for (const f of fams) for (const w of f.windows) { if (!byWindow.has(w)) byWindow.set(w, []); byWindow.get(w).push(f.id); }
  const hits = new Map(fams.map((f) => [f.id, 0]));
  for (let c = 0; c < buf.length / PROGRAM_SIZE; c++) {
    const P = buf.subarray(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE), seen = new Set();
    for (let i = 0; i + WINDOW <= PROGRAM_SIZE; i++) {
      const ids = byWindow.get(String.fromCharCode(...P.subarray(i, i + WINDOW)));
      if (ids) for (const id of ids) seen.add(id);
    }
    for (const id of seen) hits.set(id, hits.get(id) + 1);
    const hex = Buffer.from(P).toString('hex');
    programs.set(hex, (programs.get(hex) ?? 0) + 1);
  }
  for (const f of fams) traces.set(f.id, { cells: hits.get(f.id), sameProgram: f.members.some((c) => programs.has(c.program)) });
}

console.log('\n3. LES FAMÍLIES I QUANT VIUEN (les cel·les que es copien a les 10, unides per les finestres; els llinatges, d\'una captura a la següent)');
for (const k of Object.keys(STRETCHES)) {
  const L = lin.filter((l) => l.stretch === k);
  if (!stretchEpochs(k).length) continue;
  const fams = stretchEpochs(k).flatMap((e) => families.get(e));
  console.log(`   El tram ${k}: ${fams.length} famílies (${fams.filter((f) => f.heritable).length} hereditàries), en ${L.length} llinatges (${L.filter((l) => l.heritable).length} hereditaris)`);
  const spans = new Map();
  for (const l of L) spans.set(l.span, (spans.get(l.span) ?? 0) + 1);
  console.log(`     la durada, en captures: ${[...spans.keys()].sort((a, b) => a - b).map((s) => `${s}: ${spans.get(s)}`).join('; ')}; ja hi eren al principi ${L.filter((l) => l.leftCensored).length}, encara hi són al final ${L.filter((l) => l.rightCensored).length}`);
  const notLast = fams.filter((f) => traces.has(f.id));
  if (notLast.length) {
    const cont = notLast.filter((f) => links.get(f.id).length > 0);
    console.log(`     de les ${notLast.length} famílies que tenen captura següent al tram: hi continuen (amb alguna cel·la que es copia) ${cont.length}; hi deixen rastres (alguna cel·la amb una finestra seva) ${notLast.filter((f) => traces.get(f.id).cells > 0).length}; el mateix programa, en algun lloc, ${notLast.filter((f) => traces.get(f.id).sameProgram).length}`);
    const gone = notLast.filter((f) => !links.get(f.id).length).map((f) => traces.get(f.id).cells).sort((a, b) => a - b);
    console.log(`     les ${gone.length} que no hi continuen: amb algun rastre, ${gone.filter((x) => x > 0).length}; cel·les amb rastres, la mediana ${gone.length ? gone[(gone.length - 1) >> 1] : '—'} i el màxim ${gone.length ? gone[gone.length - 1] : '—'}`);
  }
  console.log('     els llinatges de més d\'una captura, o hereditaris: de - a (captures); cel·les màximes en una captura; membres en total, vistos per l\'escaneig; a les 100, es copia fins a / hereditària fins a; el codi (instruccions) del membre més robust');
  for (const l of L.filter((x) => x.span > 1 || x.heritable).sort((a, b) => a.from - b.from)) {
    console.log(`       ${l.from} - ${l.to} (${l.span}${l.contiguous ? '' : ', no seguides'}${l.leftCensored ? ', ja hi era' : ''}${l.rightCensored ? ', encara hi és' : ''}); ${l.maxSize}; ${l.members}, ${l.scanSeen}; ${l.maxCopy} / ${l.maxHer}; ${l.code}`);
  }
}

// 4. Les aparicions
console.log('\n4. LES APARICIONS: els llinatges que no hi eren a la primera captura del tram');
for (const k of Object.keys(STRETCHES)) {
  const es = stretchEpochs(k);
  if (!es.length) continue;
  const L = lin.filter((l) => l.stretch === k && !l.leftCensored), steps = es.length - 1;
  console.log(`   El tram ${k}: ${L.length} aparicions en ${steps} intervals de 100 èpoques (${steps ? (L.length / steps).toFixed(2) : '—'} per interval); hereditàries ${L.filter((l) => l.heritable).length}; d'una sola captura ${L.filter((l) => l.span === 1).length}; robustes (es copien en 95 o més de 100) ${L.filter((l) => l.maxCopy >= 95).length}`);
}

// 5. El brot
console.log('\n5. EL BROT: el llinatge del tram del brot amb més cel·les hereditàries, captura a captura');
const brot = lin.filter((l) => l.stretch === 'brot').sort((a, b) => b.fams.flatMap((f) => f.members).filter((c) => c.her100 > 0).length - a.fams.flatMap((f) => f.members).filter((c) => c.her100 > 0).length)[0];
if (!brot) console.log('   (cap llinatge al tram del brot)');
else {
  console.log(`   el codi del membre més robust: ${brot.code}`);
  console.log('   època: cel·les que es copien (a les 10); hereditàries a les 100; on (x, y); a les 100, mediana de condicions en què es copia / hereditària; l\'escaneig en veu (positius / hereditàries); rastres a la captura següent');
  const med = (v) => { const s = [...v].sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : '—'; };
  for (const e of stretchEpochs('brot')) {
    const fs = brot.fams.filter((f) => f.epoch === e), m = fs.flatMap((f) => f.members);
    if (!m.length) { console.log(`   ${e}: —`); continue; }
    const xs = m.map((c) => c.cell % WIDTH), ys = m.map((c) => (c.cell / WIDTH) | 0);
    const tr = fs.filter((f) => traces.has(f.id)).reduce((s, f) => s + traces.get(f.id).cells, 0);
    console.log(`   ${e}: ${m.length}; ${m.filter((c) => c.her100 > 0).length}; x ${Math.min(...xs)}-${Math.max(...xs)}, y ${Math.min(...ys)}-${Math.max(...ys)}; ${med(m.map((c) => c.copy100))} / ${med(m.map((c) => c.her100))}; ${m.filter((c) => c.inScan).length} / ${m.filter((c) => c.scanHer).length}; ${fs.some((f) => traces.has(f.id)) ? tr : '—'}`);
  }
}

// 6. Els fràgils que les 10 condicions es deixen
console.log('\n6. ELS FRÀGILS QUE LES 10 CONDICIONS ES DEIXEN (orientatiu): les detectades, i l\'estimació del total');
const ht = (v, key) => v.reduce((s, c) => { const p = (c[key] + 1) / (CONDITIONS - SCREEN + 2); return s + 1 / (1 - (1 - p) ** SCREEN); }, 0);
for (const k of [...Object.keys(STRETCHES), null]) {
  const es = k ? stretchEpochs(k) : epochs;
  if (!es.length) continue;
  const all = es.flatMap((e) => records.get(e).cells), cp = all.filter((c) => c.copy10), hr = all.filter((c) => c.her10);
  console.log(`   ${k ? `el tram ${k}` : 'els tres trams'}: es copien ${cp.length}, estimades ${ht(cp, 'copyRest').toFixed(1)}; hereditàries ${hr.length}, estimades ${ht(hr, 'herRest').toFixed(1)}`);
}
