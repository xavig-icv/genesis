// A within-world null for the fragment links (exploratory; the note, README.md): the feasibility counts, written before the note. For each
// control, how many pairs it would have. It computes no substring, no distance and no link.
//
//   node fase2/resultats/arrelament/nul-dins-mon/factibilitat.mjs > fase2/resultats/arrelament/nul-dins-mon/factibilitat-sortida.txt
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { ANALYSIS } from '../../../../eines/arrelament-analisi.mjs';
import { DESIGN } from '../../../../eines/arrelament.mjs';
import { conditions, testInert, fromHex, INERT_CONDITIONS_SEED } from '../../../../fase2/inert.js';
import { codeVersion } from '../../../../eines/b1-comu.mjs';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..', '..');
const PILOT = 'fase2/resultats/arrelament/pilot', LINEAGES = 'fase2/resultats/arrelament/llinatges';
const ARMS = ['continue', 'shuffle-all', 'reinit'];
const readJsonl = (file) => readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const start = DESIGN.age;
const m = JSON.parse(readFileSync(join(ROOT, PILOT, 'manifest.json'), 'utf8'));
const list = readFileSync(join(ROOT, LINEAGES, 'llista.txt'), 'utf8').trim().split('\n').map((l) => l.split(' ')[0]);
const seg = new Map(list.map((id) => [id, readJsonl(join(ROOT, LINEAGES, 'seguiments', `${id}.jsonl`))]));
const PBr = m.branches.filter((b) => b.part === 'B' && ARMS.includes(b.soup));
const recB = new Map(PBr.map((b) => [b.id, readJsonl(join(ROOT, PILOT, 'part-b', `${b.id}.jsonl`))]));
const retest = conditions(INERT_CONDITIONS_SEED, ANALYSIS.retest.from + ANALYSIS.retest.count).slice(ANALYSIS.retest.from);
const cache = new Map();
const score = (hex) => { if (!cache.has(hex)) { const s = testInert(fromHex(hex), retest); let k = 0; for (let i = 0; i < s.heritableSolo.length; i++) if (s.heritableSolo[i] === '1' || s.heritableContext[i] === '1') k++; cache.set(hex, k); } return cache.get(hex); };
const B = PBr.map((b) => {
  const rec = recB.get(b.id), ev = rec.find((l) => l.type === 'event') ?? null, end = rec.at(-1);
  const r = { ...b, ev, exposure: (ev ? ev.epoch : end.epoch) - start, lineages: [], domRoot: null };
  const L = seg.get(b.id);
  if (!L) return r;
  const lin = new Map(), parent = new Map(), steps = new Map();
  const root = (id) => { while (parent.has(id)) id = parent.get(id); return id; };
  for (const l of L) {
    if (l.type === 'new') lin.set(l.id, { id: l.id, first: l.epoch, k: Number(l.id.split(':')[1]), programs: l.programs, cells: l.cells });
    if (l.type === 'census') {
      for (const [young, old] of l.joins) parent.set(young, old);
      if (ev && l.epoch === ev.confirmed) for (const [rid, k] of Object.entries(l.groups)) if (l.heritable > 0 && k >= ANALYSIS.dominance * l.heritable) r.domRoot = root(rid);
    }
    if (l.type === 'step') { if (!steps.has(l.id)) steps.set(l.id, []); steps.get(l.id).push(l); }
  }
  r.lineages = [...lin.values()].map((x) => ({ ...x, robust: Math.max(...x.programs.map(score)) >= ANALYSIS.robust, root: root(x.id), steps: steps.get(x.id) ?? [] }));
  for (const x of r.lineages) x.rooted = r.domRoot !== null && x.root === r.domRoot;
  return r;
});
const alive = (x, e) => x.first <= e && x.steps.some((s) => s.epoch > e - 250 && s.epoch <= e && s.F >= 1);
const before = (x, y) => x.first < y.first || (x.first === y.first && x.k < y.k);
const failed = (b) => b.lineages.filter((x) => x.robust && !x.rooted && x.first <= start + b.exposure);
console.log(`The feasibility counts of the within-world null (no link computed). ${codeVersion()}, ${process.version}.`);
for (const soup of ARMS) {
  const T = B.filter((b) => b.soup === soup && seg.has(b.id));
  const E = T.filter((b) => b.domRoot !== null);
  let ys = 0, yT = 0, withD = 0, withZ = 0, pairsD = 0, pairsZ = 0, rob = 0, robD = 0;
  for (const b of T) { rob += b.lineages.filter((x) => x.robust).length; robD += b.lineages.filter((x) => x.robust && x.rooted).length; }
  for (const b of E) {
    for (const y of failed(b)) {
      ys++; if (b.ev.epoch - y.first <= 1250) yT++;
      const src = b.lineages.filter((x) => x.robust && x !== y && before(x, y) && alive(x, y.first));
      const D = src.filter((x) => x.rooted), Z = src.filter((x) => !x.rooted && x.root !== y.root);
      if (D.length) withD++; if (Z.length) withZ++; pairsD += D.length; pairsZ += Z.length;
    }
  }
  let nePairs = 0, neY = 0;
  for (const b of T.filter((x) => x.domRoot === null)) for (const y of failed(b)) { const Z = b.lineages.filter((x) => x.robust && x !== y && before(x, y) && alive(x, y.first) && x.root !== y.root); if (Z.length) neY++; nePairs += Z.length; }
  const cross = E.filter((b) => B.some((o) => o.world === b.world && o.soup !== b.soup && o.domRoot !== null && seg.has(o.id))).length;
  console.log(`${soup}: tracked ${T.length}, establishing ${E.length}; robust lineages ${rob} (dominant ${robD}); failed appearances ${ys} (in the time window ${yT}); with an earlier live dominant lineage ${withD} (pairs ${pairsD}); with an earlier live non-dominant lineage of another group ${withZ} (pairs ${pairsZ}); non-establishing branches: appearances with such a partner ${neY} (pairs ${nePairs}); establishing branches whose world has another establishing arm ${cross}`);
}
