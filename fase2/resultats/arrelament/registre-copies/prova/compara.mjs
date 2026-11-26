// The short test's branch against the full run's (README, The short test): the same lines except for the seconds and the code.
//   node fase2/resultats/arrelament/registre-copies/prova/compara.mjs PROVA.jsonl REGISTRE.jsonl
import fs from 'fs';
const [a, b] = process.argv.slice(2);
const la = fs.readFileSync(a, 'utf8').split('\n').filter(Boolean), lb = fs.readFileSync(b, 'utf8').split('\n').filter(Boolean);
const drop = (o) => { const c = { ...o }; delete c.seconds; delete c.code; return JSON.stringify(c); };
let diffs = 0;
if (la.length !== lb.length) { console.log(`lines: ${la.length} vs ${lb.length}`); diffs++; }
const keysDiffer = [];
for (let i = 0; i < Math.min(la.length, lb.length); i++) {
  const oa = JSON.parse(la[i]), ob = JSON.parse(lb[i]);
  if (drop(oa) !== drop(ob)) { diffs++; keysDiffer.push(`line ${i + 1} (${oa.type})`); }
}
const types = (l) => l.map((x) => JSON.parse(x).type);
const count = {}; for (const t of types(la)) count[t] = (count[t] || 0) + 1;
const codes = [JSON.parse(la[0]).code, JSON.parse(lb[0]).code];
console.log(`lines ${la.length}, types ${JSON.stringify(count)}; codes ${codes.join(' / ')}; lines differing beyond seconds and code: ${diffs}`);
if (keysDiffer.length) console.log(keysDiffer.join('\n'));
