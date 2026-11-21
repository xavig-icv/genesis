// Les famílies naturals seguides com els plantats (exploratori; la nota, README.md, el mètode, punt 3): el seguiment dels llinatges
// naturals d'una branca de la part B, sobre les captures de cada 50 èpoques de la simulació tornada a fer. No simula res i no planta res.
//
//   node fase2/resultats/arrelament/llinatges/segueix.mjs ID
//
// Llegeix simulacio/ID.jsonl (que compara.mjs ja ha comprovat) i les captures de captures/ID/, i escriu seguiments/ID.jsonl:
//  - a cada cens inert, abans del pas d'aquella època i amb les finestres del pas anterior: les hereditàries de cada llinatge (les que en
//    porten alguna finestra; una cel·la pot ser de dos); dos llinatges que en comparteixen una s'uneixen (el més nou al més antic, en
//    cadena, com les famílies de l'anàlisi, AUD-200); les que no són de cap s'agrupen per finestres compartides (com families()), i cada
//    grup comença un llinatge nou;
//  - a cada època múltiple de 50: un pas de cada llinatge que no s'hagi extingit, amb createLineage() de fase2/llinatge.js tal com és
//    (també el de l'època on comença). Una hereditària d'un llinatge extingit és un rebrot, i el llinatge torna a fer passos.
// Les línies: 'start'; 'new' (un llinatge nou: l'època, els programes i la llavor); 'census' (les hereditàries de cada cens, amb els
// llinatges de cadascuna d'abans de crear-ne de nous, les unions i els rebrots); 'step' (un pas d'un llinatge); i 'end'.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createLineage, Windows } from '../../../../fase2/llinatge.js';
import { fromHex, heritable } from '../../../../fase2/inert.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { ROOT, AQUI, lineageSeed, sha256, readJsonl } from './comu.mjs';

const id = process.argv[2];
if (!id || process.argv.length !== 3) { console.error('ús: node segueix.mjs ID'); process.exit(2); }
const t0 = Date.now();
const recFile = join(ROOT, AQUI, 'simulacio', `${id}.jsonl`);
const rec = readJsonl(recFile);
const st = rec[0];
const [world, soup] = id.split('-natural')[0].match(/^(\d+)-(.+)$/).slice(1);
const start = st.start, n = st.programs;
const inert = new Map(rec.filter((l) => l.type === 'inert').map((l) => [l.epoch, l]));
const ev = rec.find((l) => l.type === 'event') ?? null;
const end = rec.at(-1);
const dir = join(ROOT, AQUI, 'captures', id);
const caps = new Map(readdirSync(dir).map((f) => [f, f.match(/-des\d+-epoca(\d+)\.bin$/)]).filter(([, m]) => m).map(([f, m]) => [Number(m[1]), f]));
const epochs = [...caps.keys()].sort((x, y) => x - y);
// totes les èpoques múltiples de 50, de start + 50 a l'última, han de tenir captura
for (let e = start + 50; e <= end.epoch; e += 50) if (!caps.has(e)) { console.error(`${id}: falta la captura de l'època ${e}`); process.exit(1); }

const lines = [];
const out = (l) => lines.push(JSON.stringify(l));
out({ type: 'start', code: codeVersion(), node: process.version, branch: id, world, soup, start, end: end.epoch, event: ev ? ev.epoch : null,
  confirmed: ev ? ev.confirmed : null, record: { file: `${AQUI}/simulacio/${id}.jsonl`, sha256: sha256(readFileSync(recFile)) }, captures: epochs.length,
  seed: 'lineageSeed(món, sopa, k) = 917000000 + 1000 × món + 100 × sopa + k' });

const L = [];           // { id, first, programs, seed, lin, parent, active, extinct }
const root = (x) => { while (x.parent) x = x.parent; return x; };
for (const e of epochs.filter((x) => x > start && x <= end.epoch)) {
  const soupBytes = new Uint8Array(readFileSync(join(dir, caps.get(e))));
  if (soupBytes.length !== n * 64) { console.error(`${id}: la captura de l'època ${e} no té la mida del món`); process.exit(1); }
  const ir = inert.get(e);
  if (ir) {
    const cells = ir.cells.filter((c) => heritable(c)).map((c) => ({ cell: c.cell, program: c.program, bytes: fromHex(c.program) }));
    const joins = [], revivals = [];
    const of = cells.map((c) => L.filter((x) => x.lin.has(c.bytes)));
    // les unions: dos llinatges que comparteixen una cel·la hereditària (el més nou al més antic, en cadena)
    for (const ls of of) {
      const roots = [...new Set(ls.map(root))].sort((x, y) => x.k - y.k);
      for (const r of roots.slice(1)) { r.parent = roots[0]; joins.push([r.id, roots[0].id]); }
    }
    // els rebrots: una hereditària d'un llinatge extingit
    for (const ls of of) for (const x of ls) if (!x.active && !revivals.includes(x.id)) { x.active = true; revivals.push(x.id); }
    // les que no són de cap: grups per finestres compartides (com families()), i un llinatge nou per grup
    const groups = [];
    cells.forEach((c, i) => {
      if (of[i].length) return;
      const w = new Windows(); w.addProgram(c.bytes);
      const hits = groups.filter((g) => g.windows.has(c.bytes) || g.cells.some((x) => w.has(x.bytes)));
      const g = hits.length ? hits[0] : { windows: new Windows(), cells: [] };
      if (!hits.length) groups.push(g);
      for (const h of hits.slice(1)) { for (const x of h.cells) { g.cells.push(x); g.windows.addProgram(x.bytes); } groups.splice(groups.indexOf(h), 1); }
      g.cells.push(c); g.windows.addProgram(c.bytes);
    });
    const created = [];
    for (const g of groups) {
      const k = L.length;
      if (k >= 100) { console.error(`${id}: més de 100 llinatges (la llavor de la nota en preveu 100 per branca)`); process.exit(1); }
      const seed = lineageSeed(world, soup, k);
      const x = { id: `${e}:${k}`, k, first: e, programs: g.cells.map((c) => c.program), seed, parent: null, active: true,
        lin: createLineage({ program: g.cells.map((c) => c.bytes), seed }) };
      L.push(x); created.push(x.id);
      out({ type: 'new', epoch: e, id: x.id, seed, cells: g.cells.map((c) => c.cell), programs: x.programs });
    }
    // les hereditàries de cada grup (les que porten alguna finestra d'algun dels seus llinatges, d'abans de crear-ne de nous)
    const byRoot = {};
    of.forEach((ls) => { for (const r of new Set(ls.map(root))) byRoot[r.id] = (byRoot[r.id] ?? 0) + 1; });
    out({ type: 'census', epoch: e, sample: ir.sample, heritable: ir.heritable, cells: cells.map((c, i) => ({ cell: c.cell, lineages: of[i].map((x) => x.id) })),
      groups: byRoot, joins, revivals, created });
  }
  for (const x of L) {
    if (!x.active) continue;
    const r = x.lin.step(soupBytes, n, e);
    out({ type: 'step', id: x.id, epoch: e, M: r.M, tested: r.tested, functional: r.functional, F: r.F, windows: r.windows, ...(r.exhaustive ? { exhaustive: true } : {}) });
    // dos zeros seguits: s'extingeix, i deixa de fer passos (si rebrota, en torna a fer)
    x.zeros = r.F === 0 ? (x.zeros ?? 0) + 1 : 0;
    if (x.zeros >= 2) { x.active = false; x.zeros = 0; }
  }
}
out({ type: 'end', branch: id, lineages: L.length, groups: new Set(L.map((x) => root(x).id)).size,
  extinct: L.filter((x) => x.lin.extinctAt !== null).map((x) => [x.id, x.lin.extinctAt]), active: L.filter((x) => x.active).map((x) => x.id),
  seconds: (Date.now() - t0) / 1000 });
mkdirSync(join(ROOT, AQUI, 'seguiments'), { recursive: true });
writeFileSync(join(ROOT, AQUI, 'seguiments', `${id}.jsonl`), lines.join('\n') + '\n');
console.log(`${id}: ${L.length} llinatges, ${new Set(L.map((x) => root(x).id)).size} grups, ${epochs.length} captures, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
