// How the planted replicators die out in the aged soup: the negative tests of `analisi.mjs --check` (audit 39, AU2-193). Each case is a
// broken copy of primer-byte.jsonl, written to a temporary folder (the repository is not touched), and --check must refuse it with exit
// code 1; the real scan must pass with exit code 0.
//
//   node fase2/resultats/arrelament/extincions/prova-check.mjs > fase2/resultats/arrelament/extincions/prova-check-sortida.txt
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawnSync } from 'child_process';
import { codeVersion } from '../../../../eines/b1-comu.mjs';
import { ROOT, HERE } from './comu.mjs';

const original = readFileSync(join(ROOT, HERE, 'primer-byte.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const firstOf = (L, type) => L.findIndex((l) => l.type === type);
const edit = (fn) => { const L = original.map((l) => JSON.parse(JSON.stringify(l))); fn(L); return L; };
const CASES = {
  'the real scan (must pass)': edit(() => {}),
  'more cells starting with ] than cells (auditor 2)': edit((L) => { const w = L[firstOf(L, 'world')]; w.continue.bracket = w.continue.cells + 1; }),
  '25 bad neighbours of 24 (auditor 2)': edit((L) => { const s = L[firstOf(L, 'seed')]; s.bad = s.neighbours + 1; }),
  'a negative count': edit((L) => { L[firstOf(L, 'world')].reinit.zero = -1; }),
  'a count that is not an integer': edit((L) => { L[firstOf(L, 'world')]['shuffle-all'].bracket = 1.5; }),
  'a world with the wrong number of cells': edit((L) => { L[firstOf(L, 'world')].continue.cells = 131071; }),
  'a seed with 23 neighbours where there are 24': edit((L) => { L[firstOf(L, 'seed')].neighbours = 23; }),
  'a seed of another cell': edit((L) => { L[firstOf(L, 'seed')].cell += 1; }),
  'a seed of another soup': edit((L) => { const s = L[firstOf(L, 'seed')]; s.soup = s.soup === 'reinit' ? 'continue' : 'reinit'; }),
  'a seed twice': edit((L) => { L.splice(firstOf(L, 'seed'), 0, JSON.parse(JSON.stringify(L[firstOf(L, 'seed')]))); }),
  'a world twice': edit((L) => { L.splice(firstOf(L, 'world'), 0, JSON.parse(JSON.stringify(L[firstOf(L, 'world')]))); }),
  'a missing seed': edit((L) => { L.splice(firstOf(L, 'seed'), 1); }),
  'a missing world': edit((L) => { L.splice(firstOf(L, 'world'), 1); }),
  'another radius in the header': edit((L) => { L[0].radius = 3; }),
  'other bad bytes in the header': edit((L) => { L[0].bad = [93]; }),
  'a scan of the short test': edit((L) => { L[0].only = '7001'; }),
  'an end line that counts other things': edit((L) => { L.at(-1).seeds -= 1; }),
  'an unknown line type': edit((L) => { L.splice(1, 0, { type: 'note' }); }),
};
const dir = mkdtempSync(join(tmpdir(), 'prova-check-'));
console.log(`The negative tests of analisi.mjs --check (audit 39, AU2-193). ${codeVersion()}, ${process.version}.`);
let failures = 0, k = 0;
try {
  for (const [name, L] of Object.entries(CASES)) {
    const file = join(dir, `cas-${k++}.jsonl`);
    writeFileSync(file, L.map((l) => JSON.stringify(l)).join('\n') + '\n');
    const r = spawnSync(process.execPath, [join(ROOT, HERE, 'analisi.mjs'), '--check', '--primer-byte', file], { cwd: ROOT, encoding: 'utf8' });
    const want = name.startsWith('the real scan') ? 0 : 1;
    const ok = r.status === want;
    if (!ok) failures++;
    const why = (r.stdout.split('\n').find((l) => l.startsWith('- ')) ?? r.stdout.trim().split('\n').at(-1) ?? '').slice(0, 110);
    console.log(`   ${ok ? 'ok  ' : 'FAIL'} ${name}: exit ${r.status} (expected ${want}); ${why}`);
  }
} finally { rmSync(dir, { recursive: true, force: true }); }
console.log(failures ? `${failures} cases did not behave as expected.` : 'All the cases behaved as expected.');
process.exit(failures ? 1 : 0);
