// A measure of continuity (exploratory): a check after the analysis, declared (previ/, run with executa.sh). It explains one descriptive column
// of the output (section 1, "at the start": the run's pairs whose two origins were two bytes side by side of one cell at the window's start),
// which came out 0 for every run but one. It reads the records' census lines (the main window and map) and prints, for each census with D:
// how many of the map's pairs are of two bytes side by side of one cell at the window's start, how many hold the origin of a mutation (N or
// more), and how many neither; and the same for the pairs of half B's sample. No class, no appearance, no recount.
//
//   node fase2/resultats/arrelament/continuitat/previ/inici.mjs
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { gunzipSync } from 'zlib';
import { PROGRAM_SIZE } from '../../../../../fase1/bff.js';
import { context, FRAC } from '../mesura.mjs';

const P = PROGRAM_SIZE, KEY = 2 ** 26;
const dir = 'fase2/resultats/arrelament/continuitat/registres';
const gather = (pool, ix) => { const a = new Int32Array(ix.length * P); ix.forEach((i, k) => a.set(pool.subarray(i * P, i * P + P), k * P)); return a; };
const kind = (g, h, N) => (g >= N || h >= N ? 'mut' : Math.floor(g / P) === Math.floor(h / P) && Math.abs(g - h) === 1 ? 'start' : 'other');
console.log('census (branch epoch window): the map\'s pairs, side by side at the start / with a mutation\'s origin / neither; half B\'s pairs, the same');
for (const f of readdirSync(dir).filter((x) => x.endsWith('.jsonl.gz')).sort()) {
  const L = gunzipSync(readFileSync(join(dir, f))).toString().trim().split('\n').map((l) => JSON.parse(l));
  for (const c of L.filter((x) => x.type === 'census' && x.D && x.window === 1250)) {
    const pool = Int32Array.from(c.D.pool), ctx = context(gather(pool, c.D.halfA), FRAC, c.N);
    const m = { start: 0, mut: 0, other: 0 }, b = { start: 0, mut: 0, other: 0 };
    for (const k of ctx.pairs) m[kind(k % KEY, Math.floor(k / KEY), c.N)]++;
    const hB = gather(pool, c.D.halfB);
    for (let i = 0; i < hB.length; i += P) for (let j = 0; j < P - 1; j++) b[kind(hB[i + j], hB[i + j + 1], c.N)]++;
    const s = (o) => `${o.start} / ${o.mut} / ${o.other}`;
    console.log(`${f.replace('.jsonl.gz', '')} ${c.epoch} ${c.window}: the map ${s(m)}; half B ${s(b)}`);
  }
}
