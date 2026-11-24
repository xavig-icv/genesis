// How the planted replicators die out in the aged soup: the negative tests of `analisi.mjs --check` (audit 39, AU2-193; extended in audit
// 40, AU2-196, AU2-197 and AUD-216). Each case is a broken copy of primer-byte.jsonl or of one part-A record, written to a temporary folder
// (the repository is not touched), and --check must refuse it with exit code 1, for the reason the case names and without an uncaught
// error; the real scan and an unchanged copy of the record must pass with exit code 0. The first output, from audit 39, is
// prova-check-sortida.txt; this version writes prova-check-sortida-2.txt.
//
//   node fase2/resultats/arrelament/extincions/prova-check.mjs > fase2/resultats/arrelament/extincions/prova-check-sortida-2.txt
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawnSync } from 'child_process';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { ROOT, HERE, PILOT } from './comu.mjs';

const copy = (x) => JSON.parse(JSON.stringify(x));
const jsonl = (L) => L.map((l) => JSON.stringify(l)).join('\n') + '\n';

// 1. The first-byte scan
const original = readFileSync(join(ROOT, HERE, 'primer-byte.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const firstOf = (L, type) => L.findIndex((l) => l.type === type);
const edit = (fn) => { const L = copy(original); fn(L); return jsonl(L); };
// the second seed of the first cell that two seeds share (G1 and G4 share their positions; audit 40, auditor 2)
const sharedSecond = (L) => {
  const seen = new Map();
  for (let i = 0; i < L.length; i++) {
    if (L[i].type !== 'seed') continue;
    const k = `${L[i].world}|${L[i].soup}|${L[i].cell}`;
    if (seen.has(k)) return i;
    seen.set(k, i);
  }
  throw new Error('no two seeds share a cell');
};
const SCAN = [
  ['the real scan (must pass)', edit(() => {}), null],
  ['more cells starting with ] than cells (auditor 2, audit 39)', edit((L) => { const w = L[firstOf(L, 'world')]; w.continue.bracket = w.continue.cells + 1; }), 'impossible counts'],
  ['25 bad neighbours of 24 (auditor 2, audit 39)', edit((L) => { const s = L[firstOf(L, 'seed')]; s.bad = s.neighbours + 1; }), 'impossible neighbour counts'],
  ['a negative count', edit((L) => { L[firstOf(L, 'world')].reinit.zero = -1; }), 'impossible counts'],
  ['a count that is not an integer', edit((L) => { L[firstOf(L, 'world')]['shuffle-all'].bracket = 1.5; }), 'impossible counts'],
  ['a world with the wrong number of cells', edit((L) => { L[firstOf(L, 'world')].continue.cells = 131071; }), 'impossible counts'],
  ['a seed with 23 neighbours where there are 24', edit((L) => { L[firstOf(L, 'seed')].neighbours = 23; }), 'impossible neighbour counts'],
  ['a seed of another cell', edit((L) => { L[firstOf(L, 'seed')].cell += 1; }), 'does not match the manifest'],
  ['a seed of another soup', edit((L) => { const s = L[firstOf(L, 'seed')]; s.soup = s.soup === 'reinit' ? 'continue' : 'reinit'; }), 'does not match the manifest'],
  ['a seed twice', edit((L) => { L.splice(firstOf(L, 'seed'), 0, copy(L[firstOf(L, 'seed')])); }), 'twice'],
  ['a world twice', edit((L) => { L.splice(firstOf(L, 'world'), 0, copy(L[firstOf(L, 'world')])); }), 'twice'],
  ['a missing seed', edit((L) => { L.splice(firstOf(L, 'seed'), 1); }), 'lacks the seed'],
  ['a missing world', edit((L) => { L.splice(firstOf(L, 'world'), 1); }), 'not exactly the cohort'],
  ['another radius in the header', edit((L) => { L[0].radius = 3; }), 'the radius or the world size'],
  ['other bad bytes in the header', edit((L) => { L[0].bad = [93]; }), 'the bad first bytes'],
  ['a scan of the short test', edit((L) => { L[0].only = '7001'; }), 'of the short test'],
  ['an end line that counts other things', edit((L) => { L.at(-1).seeds -= 1; }), 'the end line'],
  ['an unknown line type', edit((L) => { L.splice(1, 0, { type: 'note' }); }), 'an unexpected line type'],
  // audit 40, auditor 2 (AU2-196, AU2-197)
  ['two seeds of the same cell with other bad counts (auditor 2, audit 40)', edit((L) => { const s = L[sharedSecond(L)]; s.bad = (s.bad + 1) % (s.neighbours + 1); }), 'are of the same cell'],
  ['a header without code and node (auditor 2, audit 40)', edit((L) => { delete L[0].code; delete L[0].node; }), 'not of the note\'s scan'],
  ['a header whose bad bytes are a number (auditor 2, audit 40)', edit((L) => { L[0].bad = 42; }), 'the bad first bytes'],
  ['the scan of another commit', edit((L) => { L[0].code = 'abcdef12'; }), 'not of the note\'s scan'],
  ['a header without "only"', edit((L) => { delete L[0].only; }), 'not null'],
  ['a line that is null', edit((L) => { L.splice(1, 0, null); }), 'not an object'],
  // audit 40, auditor 1 (check-a1.mjs)
  ['an empty file (auditor 1, audit 40)', '', 'not valid JSONL'],
  ['a line that is not JSON (auditor 1, audit 40)', jsonl(original).replace('\n', '\n{no\n'), 'not valid JSONL'],
  ['the world\'s name a number, not a text (auditor 1, audit 40)', edit((L) => { const w = L[firstOf(L, 'world')]; w.world = Number(w.world); }), 'not exactly the cohort'],
  ['the bad neighbours a text (auditor 1, audit 40)', edit((L) => { const s = L[firstOf(L, 'seed')]; s.bad = String(s.bad); }), 'impossible neighbour counts'],
  ['a seed of another genotype (auditor 1, audit 40)', edit((L) => { const s = L[firstOf(L, 'seed')]; s.variant = s.variant === 'G1' ? 'G4' : 'G1'; }), 'does not match the manifest'],
  ['a seed of another position (auditor 1, audit 40)', edit((L) => { const s = L[firstOf(L, 'seed')]; s.position = s.position === 1 ? 2 : 1; }), 'does not match the manifest'],
  ['a seed of a branch that is not there (auditor 1, audit 40)', edit((L) => { L[firstOf(L, 'seed')].branch += '-x'; }), 'lacks the seed'],
  ['a header of a code with changes (auditor 1, audit 40)', edit((L) => { L[0].code += '+canvis'; }), 'not of the note\'s scan'],
  ['a world without the shuffled soup (auditor 1, audit 40)', edit((L) => { delete L[firstOf(L, 'world')]['shuffle-all']; }), 'impossible counts'],
];

// 2. One part-A record: the first of G1 in the aged soup with a step at 8,500 where every case below can be made alone (auditor 1's
// choice in audit 40)
const m = JSON.parse(readFileSync(join(ROOT, PILOT, 'manifest.json'), 'utf8'));
let target = null, R0 = null;
for (const b of m.branches) {
  if (b.part !== 'A' || b.variant !== 'G1' || b.soup !== 'continue') continue;
  const L = readFileSync(join(ROOT, PILOT, 'part-a', `${b.id}.jsonl`), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const lin = L.filter((l) => l.type === 'lineage');
  const last = lin.at(-1);
  if (lin.length >= 12 && last.epoch === L.at(-1).epoch
    && lin.some((l) => l.epoch === 8500 && l.F > 0 && l.copying > l.functional + 1 && l.copying < l.tested && l.M > 256 && l.copying < 200)) { target = b.id; R0 = L; break; }
}
if (!target) throw new Error('no record for the cases');
const at = R0.findIndex((l) => l.type === 'lineage' && l.epoch === 8500);
const small = R0.findIndex((l) => l.type === 'lineage' && l.M > 0 && l.M <= 256);
const lastLin = R0.map((l) => l.type).lastIndexOf('lineage');
const nextLin = R0.findIndex((l, i) => i > at && l.type === 'lineage');
const editR = (fn) => { const L = copy(R0); fn(L); return jsonl(L); };
const Fof = (l) => (l.tested ? Math.round((l.M * l.functional) / l.tested) : 0);
const RECORD = [
  ['the record, unchanged (must pass)', editR(() => {}), null],
  ['tested > M (auditor 1, audit 40)', editR((L) => { L[at].tested = L[at].M + 1; }), 'impossible lineage line at 8500'],
  ['copying > tested (auditor 1, audit 40)', editR((L) => { L[at].copying = L[at].tested + 1; }), 'impossible lineage line at 8500'],
  ['F > M (auditor 1, audit 40)', editR((L) => { L[at].F = L[at].M + 1; }), 'impossible lineage line at 8500'],
  ['M negative (auditor 1, audit 40)', editR((L) => { L[at].M = -1; }), 'impossible lineage line at 8500'],
  ['functional > copying, with F that fits (auditor 1, audit 40)', editR((L) => { L[at].functional = L[at].copying + 1; L[at].F = Fof(L[at]); }), 'impossible lineage line at 8500'],
  ['F = 0 with functional > 0 (auditor 1, audit 40)', editR((L) => { L[at].F = 0; }), 'impossible lineage line at 8500'],
  ['a lineage line missing in the middle (auditor 1, audit 40)', editR((L) => { L.splice(at, 1); }), 'not one every 50 epochs'],
  ['200 tested of more than 256, not exhaustive, with F that fits (auditor 1, audit 40)', editR((L) => { L[at].tested = 200; L[at].F = Fof(L[at]); }), 'impossible lineage line at 8500'],
  ['a lineage line twice', editR((L) => { L.splice(at, 0, copy(L[at])); }), 'not one every 50 epochs'],
  ['two lineage lines out of order', editR((L) => { [L[at], L[nextLin]] = [L[nextLin], L[at]]; }), 'not one every 50 epochs'],
  ['an exhaustive step with 256 members or fewer', editR((L) => { L[small].exhaustive = true; }), 'impossible lineage line'],
  ['the lineage lines stop before the end of the branch', editR((L) => { L.splice(lastLin, 1); }), 'do not reach the end'],
  ['a start line without the lineage description', editR((L) => { delete L[0].lineage; }), 'does not describe a lineage'],
  ['a record without its end line', editR((L) => { L.pop(); }), 'not complete'],
  ['a record of another commit', editR((L) => { L[0].code = 'abcdef1'; }), 'not of the manifest'],
  ['a line that is null', editR((L) => { L.splice(at, 0, null); }), 'not complete'],
  ['a line that is not JSON', jsonl(R0).replace('\n', '\n{no\n'), 'not valid JSONL'],
];

const dir = mkdtempSync(join(tmpdir(), 'prova-check-'));
console.log(`The negative tests of analisi.mjs --check (audit 39, AU2-193; audit 40, AU2-196, AU2-197, AUD-216). ${codeVersion()}, ${process.version}.`);
let failures = 0, k = 0;
const run = (name, extra, want, expect) => {
  const r = spawnSync(process.execPath, [join(ROOT, HERE, 'analisi.mjs'), '--check', ...extra], { cwd: ROOT, encoding: 'utf8' });
  const reasons = r.stdout.split('\n').filter((l) => l.startsWith('- '));
  const ok = r.status === want && r.stderr === '' && (want === 0 ? r.stdout.includes('all the data were read and are valid')
    : r.stdout.includes('Nothing is analysed') && reasons.some((l) => l.includes(expect)));
  if (!ok) failures++;
  const why = (reasons.find((l) => expect && l.includes(expect)) ?? reasons[0] ?? r.stdout.trim().split('\n').at(-1) ?? '').slice(0, 120);
  console.log(`   ${ok ? 'ok  ' : 'FAIL'} ${name}: exit ${r.status} (expected ${want})${r.stderr ? ', with an error' : ''}; ${why}`);
};
try {
  console.log(`1. The first-byte scan (--primer-byte): ${SCAN.length} cases`);
  for (const [name, text, expect] of SCAN) {
    const file = join(dir, `cas-${k++}.jsonl`);
    writeFileSync(file, text);
    run(name, ['--primer-byte', file], expect === null ? 0 : 1, expect);
  }
  console.log(`2. The part-A record ${target} (--record), the step at 8,500 unless said otherwise: ${RECORD.length} cases`);
  for (const [name, text, expect] of RECORD) {
    const sub = join(dir, `cas-${k++}`);
    mkdirSync(sub);
    const file = join(sub, `${target}.jsonl`);
    writeFileSync(file, text);
    run(name, ['--record', file], expect === null ? 0 : 1, expect);
  }
  const other = join(dir, 'not-a-branch.jsonl');
  writeFileSync(other, jsonl(R0));
  run('a record for a branch that is not an informative part-A branch', ['--record', other], 1, 'not an informative part-A branch');
} finally { rmSync(dir, { recursive: true, force: true }); }
console.log(failures ? `${failures} cases did not behave as expected.` : 'All the cases behaved as expected.');
process.exit(failures ? 1 : 0);
