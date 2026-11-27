// A record of copy events (exploratory): the code that prova-1 ran, rebuilt from the session's transcript. prova-1 was stopped by the time
// limit of the tool that launched it (exit code 124), and with it previ/executa.sh, which had not yet written its registry entry. This
// script replays, in order, every whole-file write and every edit the transcript records for the note's files up to the moment prova-1 was
// launched, and the one shell edit (two replacements in prova.mjs), and writes the files to previ/prova-1-codi/ with their SHA-256 (LF).
//
//   node fase2/resultats/arrelament/esdeveniments/previ/reconstrueix.mjs TRANSCRIPT.jsonl
//
// It reads only the transcript; it runs nothing of the note.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const here = dirname(fileURLToPath(import.meta.url));
const TR = process.argv[2];
if (!TR) { console.error('usage: node reconstrueix.mjs TRANSCRIPT.jsonl'); process.exit(2); }
const BS = String.fromCharCode(92);
const norm = (p) => String(p).split(BS).join('/');
const NOTE = 'claude-origins-esdeveniments/fase2/resultats/arrelament/esdeveniments/';
const files = new Map();
let launch = null;
const events = [];
for (const line of readFileSync(TR, 'utf8').split('\n')) {
  if (!line.includes('esdeveniments')) continue;
  let o; try { o = JSON.parse(line); } catch { continue; }
  const c = o.message && o.message.content; if (!Array.isArray(c)) continue;
  for (const x of c) {
    if (x.type !== 'tool_use') continue;
    if ((x.name === 'Write' || x.name === 'Edit') && norm(x.input.file_path).includes(NOTE)) events.push({ t: o.timestamp, ...x });
    if (x.name === 'Bash' && String(x.input.command).includes('executa.sh prova-1 no')) launch = launch ?? o.timestamp;
    if (x.name === 'Bash' && String(x.input.command).includes('sed -i') && String(x.input.command).includes('X1 = 32')) events.push({ t: o.timestamp, name: 'sed' });
  }
}
if (!launch) { console.error('no launch of prova-1 in the transcript'); process.exit(1); }
for (const ev of events) {
  if (!ev.t || ev.t >= launch) continue;
  if (ev.name === 'Write') files.set(norm(ev.input.file_path).split(NOTE)[1], ev.input.content);
  else if (ev.name === 'Edit') {
    const k = norm(ev.input.file_path).split(NOTE)[1], s = files.get(k);
    if (s === undefined || s.split(ev.input.old_string).length !== 2) { console.error(`an edit of ${k} at ${ev.t} does not apply once`); process.exit(1); }
    files.set(k, s.replace(ev.input.old_string, ev.input.new_string));
  } else {
    const s = files.get('prova.mjs');
    const a = 'const W = 256, H = 32, X1 = 32 * 0 + 16 * W + 40, X2 = 16 * W + 216;', b = 'const W = 96, H = 64, X = 64 * 32 / 2 * 0 + 32 * W + 48;';
    if (s.split(a).length !== 2 || s.split(b).length !== 2) { console.error('the shell edit does not apply'); process.exit(1); }
    files.set('prova.mjs', s.replace(a, 'const W = 256, H = 32, X1 = 16 * W + 40, X2 = 16 * W + 216;').replace(b, 'const W = 96, H = 64, X = 32 * W + 48;'));
  }
}
const out = join(here, 'prova-1-codi');
mkdirSync(out, { recursive: true });
console.log(`prova-1 launched at ${launch} (UTC); the note's files as they were then, rebuilt from ${events.filter((e) => e.t < launch).length} writes and edits:`);
for (const [k, s] of [...files].sort()) {
  writeFileSync(join(out, k.split('/').join('__')), s);
  console.log(`  ${createHash('sha256').update(s.split('\r\n').join('\n')).digest('hex')}  ${k}`);
}
