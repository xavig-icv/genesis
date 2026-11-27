// A record of copy events (exploratory; the note, README.md): auditor 1's coverage (audit 46, §2), fixed here before it is computed, as a
// descriptive companion of the events. It reads the continuity note's records (../continuitat/registres, in git), which keep the origins of
// the cells it scores; it simulates nothing.
//
// The coverage of a cell: how many of its 64 bytes one carrier of half A holds at one alignment (forward or backward, any offset), counting
// the bytes with the same origin, in a row or not. The reference of each census (main window, 1,250 epochs): the coverage of the first 200
// cells of half B's sample; its 10th percentile is the threshold. A cell is a copy if its coverage reaches it; else, a long piece if the
// continuity note's run is 16 or more; else pieces or none, as that note. An appearance is a copy if half or more of its cells are; else a
// long piece if half or more are copies or long pieces; else pieces if any cell holds a map pair; else none.
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { gunzipSync } from 'zlib';
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { context, orderedRun, distinct, classOf } from '../continuitat/mesura.mjs';

const P = PROGRAM_SIZE;
export const REF = 200, PCT = 0.10, MAIN_WINDOW = 1250, FRAC = 0.01;

// The donors' distinct sequences and, per origin, where it sits in them
export function coverageIndex(donors) {
  const seen = new Map(), uniq = [];
  for (let c = 0; c < donors.length / P; c++) { const s = donors.subarray(c * P, c * P + P), k = s.join(','); if (!seen.has(k)) { seen.set(k, uniq.length); uniq.push(s); } }
  const at = new Map();
  uniq.forEach((s, u) => { for (let j = 0; j < P; j++) { let l = at.get(s[j]); if (!l) at.set(s[j], (l = [])); l.push(u * P + j); } });
  return { at, n: uniq.length, votes: new Int32Array(uniq.length * 2 * 128), touched: [] };
}
export function coverage(ix, o, off = 0) {
  let best = 0;
  for (let j = 0; j < P; j++) {
    const l = ix.at.get(o[off + j]);
    if (!l) continue;
    for (const k of l) {
      const u = (k / P) | 0, pos = k % P;
      for (const [dir, d] of [[0, pos - j + 64], [1, pos + j]]) {
        const key = (u * 2 + dir) * 128 + d;
        if (ix.votes[key] === 0) ix.touched.push(key);
        const v = ++ix.votes[key];
        if (v > best) best = v;
      }
    }
  }
  for (const k of ix.touched) ix.votes[k] = 0;
  ix.touched.length = 0;
  return best;
}
const pct = (a, q) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(q * s.length)]; };

// The rows: one per appearance with D at a census of the continuity note's records (main window)
export function coverageRows(root) {
  const dir = join(root, 'fase2/resultats/arrelament/continuitat/registres');
  const rows = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.jsonl.gz')).sort()) {
    const L = gunzipSync(readFileSync(join(dir, f))).toString().trim().split('\n').map((l) => JSON.parse(l));
    const S = L[0];
    for (const c of L.filter((l) => l.type === 'census' && l.window === MAIN_WINDOW && l.D)) {
      const pool = Int32Array.from(c.D.pool), seq = (i) => pool.subarray(i * P, i * P + P);
      const donors = new Int32Array(c.D.halfA.length * P);
      c.D.halfA.forEach((i, k) => donors.set(seq(i), k * P));
      const ix = coverageIndex(donors), ctx = context(donors, FRAC, c.N);
      const ref = c.D.halfB.slice(0, REF).map((i) => coverage(ix, seq(i)));
      const thr = pct(ref, PCT);
      for (const a of L.filter((l) => l.type === 'appearance' && l.epoch === c.epoch && l.window === MAIN_WINDOW)) {
        const o = Int32Array.from(a.orig), cells = [];
        for (let i = 0; i < a.cells.length; i++) {
          const cov = coverage(ix, o, i * P), run = orderedRun(ctx, o, i * P).run, base = classOf(run, distinct(ctx, o, i * P));
          cells.push({ cell: a.cells[i], cov, run, cls: cov >= thr ? 'copy' : base === 'ordered' ? 'long piece' : base });
        }
        const k = (x) => cells.filter((y) => x.includes(y.cls)).length;
        const cls = 2 * k(['copy']) >= cells.length ? 'copy' : 2 * k(['copy', 'long piece']) >= cells.length ? 'long piece' : k(['copy', 'long piece', 'pieces']) ? 'pieces' : 'none';
        rows.push({ branch: S.branch, soup: S.soup, world: S.world, census: c.epoch, id: a.id, threshold: thr, refMedian: pct(ref, 0.5), cells, cls });
      }
    }
  }
  return rows;
}
