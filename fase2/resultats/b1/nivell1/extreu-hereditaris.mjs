// L'auditoria 27: l'extracte dels replicadors hereditaris del nivell 1 de B1, per a qui no té els registres sencers (357 MB).
// Per a cada registre (en ordre alfabètic): la línia d'inici, les dels replicadors hereditaris (sols o en context) i la línia final,
// tal com són, byte a byte. Abans, comprova cada registre amb la SHA-256 d'execucio-llista.txt.
//
//   node extreu-hereditaris.mjs CARPETA-DELS-REGISTRES EXECUCIO-LLISTA.txt SORTIDA.jsonl
//
// L'auditor 1, amb els registres sencers, en pot refer l'extracte i comparar-ne la SHA-256.
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { join, basename } from 'path';

const [dir, execFile, out] = process.argv.slice(2);
if (!dir || !execFile || !out) { console.error('Ús: node extreu-hereditaris.mjs CARPETA-DELS-REGISTRES EXECUCIO-LLISTA.txt SORTIDA.jsonl'); process.exit(2); }
if (existsSync(out)) { console.error(`${out} ja existeix: no el sobreescric`); process.exit(2); }
const sha = (b) => createHash('sha256').update(b).digest('hex');
const expected = new Map();
for (const l of readFileSync(execFile, 'utf8').split('\n')) {
  const m = /^([0-9a-f]{64}) \*?(.+\.jsonl)$/.exec(l.trim());
  if (m) expected.set(basename(m[2]), m[1]);
}
const files = readdirSync(dir).filter((f) => f.endsWith('.jsonl')).sort();
if (files.length !== expected.size || files.some((f) => !expected.has(f))) { console.error('els registres de la carpeta no són els d\'execucio-llista.txt'); process.exit(1); }
const parts = [];
for (const f of files) {
  const buf = readFileSync(join(dir, f));
  if (sha(buf) !== expected.get(f)) { console.error(`${f}: la SHA-256 no és la d'execucio-llista.txt`); process.exit(1); }
  const lines = buf.toString('utf8').split('\n').filter((l) => l !== '');
  const her = lines.filter((l) => l.startsWith('{"type":"replicator"') && (l.includes('"heritableSolo":true') || l.includes('"heritableContext":true')));
  const end = JSON.parse(lines[lines.length - 1]);
  if (!lines[0].startsWith('{"type":"start"') || end.type !== 'end' || her.length !== end.heritable) { console.error(`${f}: l'extracte no quadra amb la línia final`); process.exit(1); }
  parts.push(lines[0], ...her, lines[lines.length - 1]);
  console.log(`${f}: ${her.length} hereditaris`);
}
const text = parts.join('\n') + '\n';
writeFileSync(out, text);
console.log(`${out}: ${parts.length} línies, SHA-256 ${sha(text)}`);
