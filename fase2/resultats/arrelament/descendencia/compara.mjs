// A measure of descent by position (exploratory; the note, README.md): two records of one branch, line by line (auditor 2's AU2-223: the
// exit code says it). The only fields ignored are listed here: the start line's code and Node version, and the end line's seconds and
// memory. Exit code 0: the same lines; 1: a difference; 2: wrong arguments or a file that cannot be read.
//
//   node fase2/resultats/arrelament/descendencia/compara.mjs A.jsonl B.jsonl
import { readFileSync } from 'fs';

export const IGNORED = { start: ['code', 'node'], end: ['seconds', 'rssMB'] };
export function compare(textA, textB) {
  const la = textA.split('\n').filter(Boolean), lb = textB.split('\n').filter(Boolean);
  const clean = (s) => { const o = JSON.parse(s); for (const k of IGNORED[o.type] ?? []) delete o[k]; return JSON.stringify(o); };
  const diffs = [];
  if (la.length !== lb.length) diffs.push(`lines: ${la.length} against ${lb.length}`);
  for (let i = 0; i < Math.min(la.length, lb.length); i++) if (clean(la[i]) !== clean(lb[i])) diffs.push(`line ${i + 1} (${JSON.parse(la[i]).type})`);
  return diffs;
}

if (process.argv[1] && process.argv[1].endsWith('compara.mjs')) {
  const args = process.argv.slice(2);
  if (args.length !== 2) { console.error('usage: node compara.mjs A.jsonl B.jsonl'); process.exit(2); }
  let a, b;
  try { a = readFileSync(args[0], 'utf8'); b = readFileSync(args[1], 'utf8'); } catch (e) { console.error(`compara: ${e.message}`); process.exit(2); }
  let diffs;
  try { diffs = compare(a, b); } catch (e) { console.error(`compara: a line is not JSON (${e.message})`); process.exit(2); }
  console.log(`lines ${a.split('\n').filter(Boolean).length}; ignored: start ${IGNORED.start.join(', ')}, end ${IGNORED.end.join(', ')}; differing lines: ${diffs.length}`);
  if (diffs.length) console.log(diffs.slice(0, 20).join('\n'));
  process.exitCode = diffs.length ? 1 : 0;
}
