// A record of copy events (exploratory), before the note (counts only, from data in git): how many tracked lineages, other than the failed appearances, were first
// detected inside the windows of each branch's appearances (from the earliest window start to the latest census), with how many cells.
import { load } from '../../registre-copies/dades.mjs';
const d = load();
if (d.problems.length) { console.log(d.problems); process.exit(1); }
let L = 0, C = 0, maxB = 0, maxBid = '';
for (const b of d.B) {
  const f = d.failed(b);
  if (!f.length) continue;
  const ids = new Set(f.map((y) => y.id));
  const Es = [...new Set(f.map((y) => y.first))];
  const lo = Math.min(...Es.map((E) => Math.max(8000, E - 1250))), hi = Math.max(...Es);
  const ref = b.lineages.filter((x) => !ids.has(x.id) && x.first >= lo && x.first <= hi);
  const cells = ref.reduce((s, x) => s + x.cells.length, 0);
  L += ref.length; C += cells;
  if (cells > maxB) { maxB = cells; maxBid = b.id; }
  console.log(`${b.id.padEnd(26)} windows ${lo}..${hi}: other lineages ${ref.length} (rooted ${ref.filter((x) => x.rooted).length}), cells ${cells}`);
}
console.log(`in all: ${L} lineages, ${C} cells; the most in one branch: ${maxB} cells (${maxBid})`);
