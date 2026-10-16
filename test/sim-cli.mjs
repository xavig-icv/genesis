// Proves de la línia d'ordres de sim.mjs. Executa: node test/sim-cli.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { mkdtempSync, rmSync, readdirSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
const sim = (...args) => spawnSync(process.execPath, ['sim.mjs', ...args], { cwd: root, encoding: 'utf8' });

// Casos de l'auditoria 1 (AUD-03): abans s'acceptaven sense avís
const rejected = {
  'opció mal escrita': ['--world', '64x64', '--mixng', '0.5'],
  'decimal amb coma': ['--world', '64x64', '--mixing', '0,01'],
  '--epoch en lloc de --epochs': ['--world', '64x64', '--epoch', '5'],
  'llei del món sense --world': ['--mixing', '0.1'],
  'mida del món mal escrita': ['--world', '64'],
  'llavor no entera': ['--seed', '1.5'],
  'fracció més gran que 1': ['--world', '64x64', '--renewal', '2'],
  'opció sense valor': ['--seed'],
  'opció de la sopa amb --world': ['--world', '64x64', '--log2size', '12'],
  'branca que acaba abans de començar': ['--world', '64x64', '--from', 'x.bin', '--start', '100', '--epochs', '50'],
  'opció repetida': ['--seed', '1', '--seed', '2'],
  'generador desconegut': ['--rng', 'v3'],
  // Residus de l'auditoria 2 (AUD-03)
  'branca sense --start': ['--world', '64x64', '--from', 'x.bin', '--epochs', '50'],
  '--save-every sense --save': ['--world', '64x64', '--save-every', '100'],
  // Iteració 3: el cens v3 i l'aturada per establiment
  '--stop-after-event amb --after': ['--world', '64x64', '--stop-after-event', '1000', '--after', '300'],
  '--stop-after-event amb el cens v2': ['--world', '64x64', '--census-version', 'v2', '--stop-after-event', '1000'],
  '--census-sample amb el cens v2': ['--world', '64x64', '--census-version', 'v2', '--census-sample', '100'],
  'versió del cens desconeguda': ['--world', '64x64', '--census-version', 'v4'],
  '--stop-after-event a la sopa': ['--stop-after-event', '1000'],
  '--save-what sense --save': ['--world', '64x64', '--save-what', 'event'],
  '--save-what event amb el cens v2': ['--world', '64x64', '--save', 'x', '--census-version', 'v2', '--save-what', 'event'],
};

const tests = {};
for (const [name, args] of Object.entries(rejected)) {
  tests[`rebutja: ${name}`] = () => {
    const r = sim(...args);
    assert.strictEqual(r.status, 2, `codi de sortida ${r.status}`);
    assert.ok(r.stderr.startsWith('Error:'), r.stderr);
  };
}

tests['--help explica les opcions i acaba bé'] = () => {
  const r = sim('--help');
  assert.strictEqual(r.status, 0);
  assert.ok(r.stdout.includes('--mixing') && r.stdout.includes('--from'));
};

tests['una branca no detecta transició ni s\'atura abans d\'hora (AUD-07)'] = () => {
  const tmp = mkdtempSync(join(tmpdir(), 'claude-origins-'));
  try {
    // amb --threshold -100, en un experiment normal la "transició" saltaria a la primera mesura i
    // s'aturaria 5 èpoques després; en una branca no ha de passar
    const make = sim('--world', '64x32', '--seed', '1', '--epochs', '20', '--every', '1000', '--census', '1000', '--save', tmp);
    assert.strictEqual(make.status, 0, make.stderr);
    const snapshot = join(tmp, readdirSync(tmp).find((f) => f.endsWith('-final.bin')));
    const r = sim('--world', '64x32', '--from', snapshot, '--start', '20', '--epochs', '60', '--every', '10', '--threshold', '-100',
      '--after', '5', '--census', '1000');
    assert.strictEqual(r.status, 0, r.stderr);
    assert.ok(!r.stdout.includes('HOE >'), 'la branca ha detectat una transició');
    assert.ok(r.stdout.includes('època 60 '), 'la branca s\'ha aturat abans de l\'època final');
    // --threshold i --after no hi tenen efecte: s'accepten (llistes antigues), però amb un avís
    assert.ok(r.stderr.includes('Avís: --threshold') && r.stderr.includes('Avís: --after'), r.stderr);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
};

tests["s'atura N èpoques després de l'establiment, i el JSONL ho registra"] = () => {
  // Retall d'un món on el palíndrom del punt ja domina: l'establiment es confirma al segon cens
  const tmp = mkdtempSync(join(tmpdir(), 'claude-origins-'));
  try {
    const file = join(tmp, 'dades.jsonl');
    const r = sim('--world', '32x32', '--from', join(root, 'test', 'fixtures', 'punt-32x32.bin'), '--start', '0', '--epochs', '100',
      '--every', '5', '--census', '5', '--stop-after-event', '10', '--json', file);
    assert.strictEqual(r.status, 0, r.stderr);
    assert.ok(r.stdout.includes("*** ESTABLIMENT DE LA VIDA a l'època 5 (confirmat al cens 10) ***"), r.stdout);
    const records = readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.strictEqual(records[0].type, 'start');
    assert.strictEqual(records.filter((x) => x.type === 'census').length, 3);
    assert.deepStrictEqual(records.find((x) => x.type === 'event'), { type: 'event', epoch: 5, confirmed: 10 });
    const end = records[records.length - 1];
    assert.strictEqual(end.type, 'end');
    assert.strictEqual(end.reason, 'establiment');
    assert.strictEqual(end.epoch, 15);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
};

tests["--save-what event només desa la captura de l'establiment"] = () => {
  const tmp = mkdtempSync(join(tmpdir(), 'claude-origins-'));
  try {
    const r = sim('--world', '32x32', '--from', join(root, 'test', 'fixtures', 'punt-32x32.bin'), '--start', '0', '--epochs', '100',
      '--every', '5', '--census', '5', '--stop-after-event', '10', '--save', tmp, '--save-what', 'event');
    assert.strictEqual(r.status, 0, r.stderr);
    // l'establiment és a l'època 5 (el primer cens): és l'única captura de t i dels censos anteriors
    assert.deepStrictEqual(readdirSync(tmp), ['llavor1-mon32x32-r2-des0-establiment5-epoca5.bin']);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
