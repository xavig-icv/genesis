// A record of copy events (exploratory): two records of one branch, line by line, but for the commit, the Node version, the seconds and
// the memory. Exit code 0 if they are the same, 1 if they differ, 2 if a file cannot be read.
//
//   node fase2/resultats/arrelament/esdeveniments/compara.mjs A.jsonl.gz B.jsonl.gz
import { readFileSync } from 'fs';
import { gunzipSync } from 'zlib';

export function compare(a, b) {
  const strip = (x) => { const y = { ...x }; if (y.type === 'start') { delete y.code; delete y.node; } if (y.type === 'end') { delete y.seconds; delete y.secondsRun; delete y.rssMB; } return JSON.stringify(y); };
  if (a.length !== b.length) return { same: false, why: `${a.length} lines against ${b.length}` };
  for (let i = 0; i < a.length; i++) if (strip(a[i]) !== strip(b[i])) return { same: false, why: `line ${i + 1} differs (${a[i].type})` };
  return { same: true, why: `${a.length} lines, the same but for the commit, the Node version, the seconds and the memory` };
}

if (process.argv[1] && process.argv[1].endsWith('compara.mjs')) {
  const [fa, fb] = process.argv.slice(2);
  if (!fa || !fb || process.argv.length !== 4) { console.error('usage: node compara.mjs A.jsonl.gz B.jsonl.gz'); process.exit(2); }
  let a, b;
  try {
    const read = (f) => gunzipSync(readFileSync(f)).toString().trim().split('\n').map((l) => JSON.parse(l));
    a = read(fa); b = read(fb);
  } catch (e) { console.error(`compara: ${e.message}`); process.exit(2); }
  const r = compare(a, b);
  console.log(`${r.same ? 'the same' : 'they differ'}: ${r.why}`);
  process.exit(r.same ? 0 : 1);
}
