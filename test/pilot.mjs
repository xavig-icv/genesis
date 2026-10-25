// Proves de l'eina dels pilots d'alíquotes (eines/pilot.mjs) i de la potència de la maduració
// (eines/potencia-maduracio.mjs): les ordres de l'envelliment i de les branques, que els braços d'un món tinguin les
// mateixes llavors de continuació, que sim.mjs n'accepti les opcions, la comprovació prèvia sense manifest i els
// valors crítics de la prova de signes.
// Executa: node test/pilot.mjs
import assert from 'assert';
import { spawnSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { PILOTS, agingLine, branchLines, preflight, CONTINUATION } from '../eines/pilot.mjs';
import { critical, power } from '../eines/potencia-maduracio.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const opt = (line, name) => line.match(new RegExp(`--${name} (\\S+)`))?.[1];
function withTmp(fn) { const tmp = mkdtempSync(join(tmpdir(), 'pilot-')); try { fn(tmp); } finally { rmSync(tmp, { recursive: true, force: true }); } }

const tests = {
  "l'envelliment de la maduració: 24 mons nous, fins a l'època 8.000, i s'aturen si s'hi estableix la vida": () => {
    const lines = PILOTS.maduracio.worlds.map(agingLine);
    assert.strictEqual(lines.length, 24);
    assert.strictEqual(new Set(lines.map((l) => l.split(' ')[0])).size, 24);
    assert.deepStrictEqual(lines.map((l) => Number(opt(l, 'seed'))), Array.from({ length: 24 }, (_, i) => 5001 + i));
    for (const l of lines) {
      assert.strictEqual(opt(l, 'epochs'), '8000');
      assert.strictEqual(opt(l, 'mixing'), '0');
      assert.strictEqual(opt(l, 'stop-after-event'), '0');
      assert.ok(opt(l, 'json').startsWith('fase2/resultats/maduracio/pilot/envelliment/'));
    }
  },
  'les branques: els mateixos nombres aleatoris de continuació a tots els braços d\'un món, i cada braç la seva captura': () => {
    for (const [name, entry] of [['maduracio', { world: '5007', start: 8000 }], ['zeros', { world: 'B2042', start: 5750 }]]) {
      const p = PILOTS[name], lines = branchLines(name, entry);
      assert.strictEqual(lines.length, p.arms.length * CONTINUATION.length);
      for (const [tag, offset] of CONTINUATION) {
        const mine = lines.filter((l) => l.split(' ')[0].endsWith(`-${tag}`));
        assert.strictEqual(mine.length, p.arms.length);
        assert.ok(mine.every((l) => Number(opt(l, 'seed')) === Number(entry.world.replace(/^[AB]/, '')) + offset), `${name}: les llavors de ${tag} no són comunes`);
      }
      assert.strictEqual(new Set(lines.map((l) => opt(l, 'from'))).size, p.arms.length, `${name}: cada braç ha de tenir la seva captura`);
      assert.strictEqual(new Set(lines.map((l) => opt(l, 'json'))).size, lines.length);
      for (const l of lines) {
        assert.strictEqual(Number(opt(l, 'epochs')), entry.start + p.horizon);
        assert.strictEqual(Number(opt(l, 'mixing')), p.mixing);
        assert.strictEqual(opt(l, 'stop-after-event') ?? null, p.stopAfterEvent === null ? null : String(p.stopAfterEvent));
      }
    }
  },
  "sim.mjs accepta les opcions de l'envelliment i de les branques (amb menys èpoques)": () => withTmp((tmp) => {
    const sim = (args) => spawnSync(process.execPath, [join(root, 'sim.mjs'), ...args.split(' ')], { cwd: root, encoding: 'utf8' });
    const aging = agingLine('5001').split(' ').slice(1).join(' ').replace('--epochs 8000', '--epochs 10').replaceAll('fase2/resultats/maduracio/pilot/envelliment', join(tmp, 'e').replaceAll('\\', '/'));
    let r = sim(aging);
    assert.strictEqual(r.status, 0, r.stderr);
    const capture = join(tmp, 'e', 'captures', 'llavor5001-mon512x256-r2-final.bin').replaceAll('\\', '/');
    const branch = branchLines('maduracio', { world: '5001', start: 10 })[0].split(' ').slice(1).join(' ')
      .replace('--epochs 8010', '--epochs 20').replace(/--from \S+/, `--from ${capture}`).replaceAll('fase2/resultats/maduracio/pilot/branques', join(tmp, 'b').replaceAll('\\', '/'));
    r = sim(branch);
    assert.strictEqual(r.status, 0, r.stderr);
  }),
  // La comprovació prèvia depèn de l'estat del repositori (si el pilot ja és preparat), i per això aquí només es prova
  // que existeixi i la línia d'ordres
  "la línia d'ordres rebutja els usos incorrectes": () => {
    assert.strictEqual(typeof preflight, 'function');
    const r = spawnSync(process.execPath, [join(root, 'eines', 'pilot.mjs'), 'maduracio', '--res'], { encoding: 'utf8' });
    assert.strictEqual(r.status, 2);
    const s = spawnSync(process.execPath, [join(root, 'eines', 'pilot.mjs'), 'zeros', '--envelliment'], { encoding: 'utf8' });
    assert.strictEqual(s.status, 2);
    const t = spawnSync(process.execPath, [join(root, 'eines', 'pilot.mjs'), 'b3', '--prepara'], { encoding: 'utf8' });
    assert.strictEqual(t.status, 2);
  },
  'la potència de la maduració: els valors crítics de la prova de signes, i cap efecte dona com a molt α': () => {
    assert.strictEqual(critical(29, 0.025), 21); // el llindar de B2
    assert.strictEqual(critical(10, 0.025), 9);
    assert.strictEqual(critical(5, 0.025), 6); // impossible: 1/32 > 0,025
    const p0 = power({ pc: 0.2, ps: 0.2, worlds: 80, sims: 2000 });
    assert.ok(p0 <= 0.035, `sense efecte, la potència hauria de ser com a molt α (és ${p0})`);
    assert.ok(power({ pc: 0.22, ps: 0.11, worlds: 120, sims: 2000 }) > 0.8);
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
