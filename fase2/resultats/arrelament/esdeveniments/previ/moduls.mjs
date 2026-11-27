// A record of copy events (exploratory): the modules the note's scripts import, followed through their own imports, as paths from the
// repository's root, one per line (the note's own files included). For previ/executa.sh: the exploration lane hashes them all (the
// agreement of the three at audit 46).
//
//   node fase2/resultats/arrelament/esdeveniments/previ/moduls.mjs
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname, resolve, relative } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const note = resolve(here, '..');
const root = resolve(note, '..', '..', '..', '..');
const seen = new Set();
const todo = [];
for (const d of [note, here]) for (const f of readdirSync(d)) if (f.endsWith('.mjs')) todo.push(join(d, f));
while (todo.length) {
  const f = todo.pop();
  if (seen.has(f)) continue;
  seen.add(f);
  const text = readFileSync(f, 'utf8');
  for (const m of text.matchAll(/^\s*import\s[^'"]*['"](\.{1,2}\/[^'"]+)['"]/gm)) {
    const g = resolve(dirname(f), m[1]);
    if (!existsSync(g)) throw new Error(`moduls: ${relative(root, f)} imports ${m[1]}, which is not there`);
    todo.push(g);
  }
}
console.log([...seen].map((f) => relative(root, f).split('\\').join('/')).sort().join('\n'));
