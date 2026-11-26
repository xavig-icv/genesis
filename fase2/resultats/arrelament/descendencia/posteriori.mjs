// A measure of descent by the arrangement of origins (exploratory; the note, README.md): ONE CHECK AFTER THE FACT, declared, written after
// reading analisi-sortida.txt. It reads the records already in git and prints, for the time rule's appearances (main window, main measure),
// how many of each appearance's 200 matched cells reach the run of 15 pairs themselves, and their median, next to the appearance's score. It
// answers why so many appearances are "undecided": not part of the note's rule, and nothing in the reading changes with it.
//
//   node fase2/resultats/arrelament/descendencia/posteriori.mjs > posteriori-sortida.txt
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { MAIN, RUN, WINDOWS } from './traca.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../../../..');
const K = RUN.adj, W = WINDOWS[0];
const code = execFileSync('git', ['rev-parse', '--short=8', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
const list = JSON.parse(readFileSync(join(HERE, '../registre-copies/llista.json'), 'utf8'));
const readJsonl = (f) => readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const median = (v) => { const s = [...v].sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };

console.log(`A measure of descent (exploratory): a check after the fact, declared. The code: ${code}, ${process.version}.`);
console.log(`The time rule's appearances, window ${W}, measure ${MAIN}: the appearance's score (per cell, of 63 pairs), and its 200 matched cells: the share at ${K} pairs or more, the median.`);
console.log('   soup        branch  appearance  score  matched ≥ 15  matched median');
const bySoup = new Map();
for (const br of list.branches) {
  const L = readJsonl(join(HERE, 'registres', `${br.id}.jsonl`));
  for (const o of br.observers.filter((q) => q.why === 'time rule')) {
    for (const y of o.appearances) {
      const a = L.find((x) => x.type === 'appearance' && x.epoch === o.epoch && x.window === W && x.id === y.id);
      if (!a || !a.descent || !a.baseline) continue;   // no D: unclassifiable, as in the analysis
      const s = a.descent[MAIN] / a.cells.length, m = a.baseline.descent[MAIN];
      const share = m.filter((v) => v >= K).length / m.length;
      console.log(`   ${br.soup.padEnd(11)} ${br.world}    ${y.id.padEnd(10)}  ${s.toFixed(1).padStart(5)}  ${share.toFixed(2).padStart(12)}  ${String(median(m)).padStart(14)}`);
      if (!bySoup.has(br.soup)) bySoup.set(br.soup, []);
      bySoup.get(br.soup).push({ s, share });
    }
  }
}
console.log('\nBy soup: the appearances (with D), the median of their matched cells\' share at the run, and how many appearances score at the run or above');
for (const [soup, v] of bySoup) console.log(`   ${soup.padEnd(11)} ${v.length}: matched share at the run, median ${median(v.map((x) => x.share)).toFixed(2)} (from ${Math.min(...v.map((x) => x.share)).toFixed(2)} to ${Math.max(...v.map((x) => x.share)).toFixed(2)}); appearances at the run ${v.filter((x) => x.s >= K).length} of ${v.length}`);
