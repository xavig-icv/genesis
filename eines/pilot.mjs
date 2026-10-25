// Els pilots d'alíquotes (docs/pilot-maduracio.md): les llistes, el manifest congelat i la comprovació prèvia que va
// demanar l'auditoria 15 (AU2-79, AU2-82, AUD-111). Cap resultat no es llegeix: només els registres de l'envelliment,
// per saber quins mons hi entren, i les captures, per transformar-les.
//
//   node eines/pilot.mjs maduracio --envelliment     la llista de l'envelliment dels mons nous (a la sortida)
//   node eines/pilot.mjs PILOT --prepara             comprova l'envelliment (la maduració), escaneja i exclou els mons
//                                                    amb vida (AUD-111), transforma les captures amb eines/transforma.mjs
//                                                    i escriu el manifest i les llistes de les branques
//   node eines/pilot.mjs PILOT --comprova            la comprovació prèvia: que cada captura transformada sigui la del
//                                                    manifest i del seu registre, que vingui de la captura d'origen,
//                                                    que cap camí no es repeteixi, que les llistes siguin les del
//                                                    manifest i que cap branca no hagi començat
//
// PILOT és maduracio o zeros. Les carpetes són les de PILOTS. --prepara no sobreescriu res: si el manifest ja existeix,
// s'atura. Els camins de les llistes són relatius a la carpeta del repositori, com a eines/experiments.sh.
import { readFileSync, writeFileSync, existsSync, mkdirSync, lstatSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';
import { spawnSync, execSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const shaFile = (f) => sha256(readFileSync(join(root, f)));

// Els dos pilots, tal com els descriu docs/pilot-maduracio.md
export const PILOTS = {
  maduracio: {
    folder: 'fase2/resultats/maduracio/pilot',
    worlds: Array.from({ length: 24 }, (_, i) => String(5001 + i)),
    age: 8000, horizon: 8000, mixing: 0, stopAfterEvent: 0, saveEvents: true,
    arms: ['continue', 'shuffle-programs', 'shuffle-within', 'shuffle-all', 'reinit'],
  },
  zeros: {
    folder: 'fase2/resultats/zeros/pilot',
    // els 8 mons on la vida baixa al primer cens a totes les branques de B2 amb corrent, i els 3 controls negatius (AUD-110)
    worlds: ['B2002', 'B2011', 'B2021', 'B2038', 'B2042', 'B2043', 'B2078', 'B2001', 'B2071', 'B2044', 'B2058'],
    roles: { B2071: 'control negatiu', B2044: 'control negatiu', B2058: 'control negatiu' },
    horizon: 2000, mixing: 0.01, stopAfterEvent: null, saveEvents: false,
    arms: ['continue', 'zeros-data', 'placebo-cell'],
  },
};
export const TRANSFORM_OFFSET = 600000;
export const CONTINUATION = [['a', 400000], ['b', 500000]];
const CENSUS = '--every 100 --census 250 --census-version v3 --rng v2';

const seedOf = (world) => Number(world.replace(/^[AB]/, ''));

// L'ordre de l'envelliment d'un món nou de la maduració
export function agingLine(world) {
  const p = PILOTS.maduracio, d = `${p.folder}/envelliment`;
  return `e${world} --world 512x256 --seed ${world} --mixing 0 --epochs ${p.age} ${CENSUS} --stop-after-event 0 --json ${d}/e${world}.jsonl --save ${d}/captures`;
}
const agedCapture = (world) => `${PILOTS.maduracio.folder}/envelliment/captures/llavor${world}-mon512x256-r2-final.bin`;

// La captura d'origen i l'època de cada món
function origin(name, world) {
  if (name === 'maduracio') return { capture: agedCapture(world), start: PILOTS.maduracio.age };
  const rep = JSON.parse(readFileSync(join(root, 'fase2/resultats/b2/repartiment.json'), 'utf8'));
  const w = rep.worlds.find((x) => `${x.group}${x.seed}` === world);
  if (!w) throw new Error(`${world} no és al repartiment de B2`);
  return { capture: w.capture, start: w.t, sha256: w.sha256 };
}

const armPath = (p, world, arm) => `${p.folder}/alicuotes/${world}/${arm}.bin`;

// Les línies de les branques d'un món inclòs, a partir del manifest
export function branchLines(name, entry) {
  const p = PILOTS[name];
  const lines = [];
  for (const arm of p.arms) {
    for (const [tag, offset] of CONTINUATION) {
      const id = `${entry.world}-${arm}-${tag}`;
      lines.push(`${id} --world 512x256 --seed ${seedOf(entry.world) + offset} --mixing ${p.mixing} --from ${armPath(p, entry.world, arm)} --start ${entry.start} --epochs ${entry.start + p.horizon} ${CENSUS}` +
        (p.stopAfterEvent !== null ? ` --stop-after-event ${p.stopAfterEvent}` : '') +
        ` --json ${p.folder}/branques/${id}.jsonl` + (p.saveEvents ? ` --save ${p.folder}/branques/captures --save-what event` : ''));
    }
  }
  return lines;
}

const read = (f) => readFileSync(join(root, f), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
function codeVersion() {
  const run = (cmd) => execSync(cmd, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  try { return run('git rev-parse --short HEAD') + (run('git status --porcelain -- "*.js" "*.mjs"') ? '+canvis' : ''); } catch { return 'desconeguda'; }
}
function fail(message, code = 1) { console.error(`Error: ${message}`); process.exit(code); }

// Per a un món de la maduració: inclòs, o exclòs i per què (registre incomplet, establiment abans de l'edat)
export function agingStatus(world) {
  const p = PILOTS.maduracio, f = `${p.folder}/envelliment/e${world}.jsonl`;
  if (!existsSync(join(root, f))) return { included: false, reason: 'sense registre de l\'envelliment' };
  const r = read(f), end = r[r.length - 1];
  if (r[0].type !== 'start' || end.type !== 'end') return { included: false, reason: 'registre de l\'envelliment incomplet' };
  if (end.event !== null || end.epoch !== p.age) return { included: false, reason: `establiment abans de l'època ${p.age} (a l'època ${end.event ?? end.epoch})` };
  const c = r.filter((x) => x.type === 'census').pop();
  return { included: true, censusAtAge: c && c.epoch === p.age ? { replicating: c.replicating, heritable: c.heritable, sample: c.sample } : null };
}

function prepare(name) {
  const p = PILOTS[name], manifestPath = `${p.folder}/manifest.json`;
  if (existsSync(join(root, manifestPath))) fail(`${manifestPath} ja existeix: no es torna a preparar`);
  const worlds = [];
  for (const world of p.worlds) {
    const o = origin(name, world), entry = { world, role: p.roles?.[world] ?? 'prova', start: o.start, capture: o.capture };
    if (name === 'maduracio') {
      Object.assign(entry, agingStatus(world));
      if (entry.included) {
        // l'escaneig d'herència de totes les cel·les (AUD-111): s'exclou el món si hi ha algun hereditari
        const scan = `${p.folder}/alicuotes/${world}/escaneig.json`;
        mkdirSync(join(root, p.folder, 'alicuotes', world), { recursive: true });
        const r = spawnSync(process.execPath, [join(root, 'eines/transforma.mjs'), '--scan', '--from', o.capture, '--seed', String(seedOf(world) + TRANSFORM_OFFSET), '--out', scan], { cwd: root, encoding: 'utf8' });
        if (r.status) fail(`l'escaneig de ${world} ha fallat: ${r.stderr}`);
        const s = JSON.parse(readFileSync(join(root, scan), 'utf8'));
        entry.scan = { replicating: s.replicating, heritable: s.heritable, file: scan };
        if (s.heritable > 0) { entry.included = false; entry.reason = `${s.heritable} cel·les hereditàries a l'escaneig de l'època ${p.age}`; }
      }
    } else entry.included = true;
    if (entry.included) {
      entry.captureSha256 = shaFile(o.capture);
      if (o.sha256 && o.sha256 !== entry.captureSha256) fail(`${o.capture} no té la SHA-256 del repartiment`);
      entry.arms = {};
      for (const arm of p.arms) {
        const out = armPath(p, world, arm);
        mkdirSync(join(root, p.folder, 'alicuotes', world), { recursive: true });
        const r = spawnSync(process.execPath, [join(root, 'eines/transforma.mjs'), '--from', o.capture, '--kind', arm, '--seed', String(seedOf(world) + TRANSFORM_OFFSET), '--out', out], { cwd: root, encoding: 'utf8' });
        if (r.status) fail(`la transformació ${world} ${arm} ha fallat: ${r.stderr}`);
        const rec = JSON.parse(readFileSync(join(root, out.replace(/\.bin$/, '.json')), 'utf8'));
        entry.arms[arm] = { file: out, sha256: rec.outSha256, changed: rec.changed, scope: rec.scope };
      }
      console.log(`${world}: inclòs; ${p.arms.length} braços transformats`);
    } else console.log(`${world}: exclòs (${entry.reason})`);
    worlds.push(entry);
  }
  const included = worlds.filter((w) => w.included);
  const manifest = {
    pilot: name, design: 'docs/pilot-maduracio.md', code: codeVersion(), node: process.version, date: new Date().toISOString(),
    params: { arms: p.arms, horizon: p.horizon, mixing: p.mixing, stopAfterEvent: p.stopAfterEvent, age: p.age ?? null, transformOffset: TRANSFORM_OFFSET, continuation: CONTINUATION, census: CENSUS },
    worlds,
  };
  writeFileSync(join(root, manifestPath), JSON.stringify(manifest, null, 1) + '\n', { flag: 'wx' });
  // les llistes de les dues màquines: els mons inclosos, alternats
  for (const [machine, parity] of [['pc', 0], ['vm', 1]]) {
    const lines = included.filter((_, i) => i % 2 === parity).flatMap((w) => branchLines(name, w));
    writeFileSync(join(root, p.folder, `llista-${machine}.txt`), lines.join('\n') + '\n', { flag: 'wx' });
  }
  console.log(`manifest: ${manifestPath}; ${included.length} mons inclosos de ${worlds.length}, ${included.length * p.arms.length * CONTINUATION.length} branques`);
}

// Retorna la llista de problemes (buida si tot és correcte)
export function preflight(name) {
  const p = PILOTS[name], problems = [];
  const manifestPath = join(root, p.folder, 'manifest.json');
  if (!existsSync(manifestPath)) return [`no hi ha cap manifest a ${p.folder}`];
  const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const seen = new Set();
  const expected = [];
  for (const w of m.worlds.filter((x) => x.included)) {
    if (!existsSync(join(root, w.capture))) problems.push(`${w.world}: no hi ha la captura d'origen ${w.capture}`);
    else if (shaFile(w.capture) !== w.captureSha256) problems.push(`${w.world}: la captura d'origen no té la SHA-256 del manifest`);
    for (const arm of p.arms) {
      const a = w.arms?.[arm];
      if (!a) { problems.push(`${w.world}: falta el braç ${arm}`); continue; }
      if (seen.has(a.file) || a.file === w.capture) problems.push(`${w.world} ${arm}: el camí ${a.file} es repeteix`);
      seen.add(a.file);
      if (!existsSync(join(root, a.file))) { problems.push(`${w.world} ${arm}: no hi ha ${a.file}`); continue; }
      const rec = JSON.parse(readFileSync(join(root, a.file.replace(/\.bin$/, '.json')), 'utf8'));
      if (shaFile(a.file) !== a.sha256 || rec.outSha256 !== a.sha256) problems.push(`${w.world} ${arm}: la captura transformada no té la SHA-256 del manifest i del seu registre`);
      if (rec.fromSha256 !== w.captureSha256) problems.push(`${w.world} ${arm}: no ve de la captura d'origen`);
      if (rec.kind !== arm || rec.seed !== seedOf(w.world) + TRANSFORM_OFFSET || rec.invariants !== 'correctes') problems.push(`${w.world} ${arm}: el registre no és el que toca`);
    }
    expected.push(...branchLines(name, w));
  }
  const lists = ['pc', 'vm'].flatMap((machine) => {
    const f = join(root, p.folder, `llista-${machine}.txt`);
    return existsSync(f) ? readFileSync(f, 'utf8').trim().split('\n').filter(Boolean) : [];
  });
  if ([...lists].sort().join('\n') !== [...expected].sort().join('\n')) problems.push('les llistes no són les branques del manifest');
  for (const line of expected) {
    const json = line.match(/--json (\S+)/)[1];
    try { lstatSync(join(root, json)); problems.push(`la branca ${line.split(' ')[0]} ja ha començat (${json})`); } catch { /* encara no */ }
  }
  return problems;
}

function main(argv) {
  const [name, mode] = argv;
  if (!PILOTS[name] || !['--envelliment', '--prepara', '--comprova'].includes(mode) || argv.length !== 2) {
    fail('Ús: node eines/pilot.mjs maduracio|zeros --envelliment|--prepara|--comprova', 2);
  }
  if (mode === '--envelliment') {
    if (name !== 'maduracio') fail('només la maduració té envelliment', 2);
    console.log(PILOTS.maduracio.worlds.map(agingLine).join('\n'));
  } else if (mode === '--prepara') prepare(name);
  else {
    const problems = preflight(name);
    if (problems.length) { console.log(`La comprovació prèvia ha trobat ${problems.length} problemes:\n- ${problems.join('\n- ')}`); process.exit(1); }
    console.log(`Comprovació prèvia del pilot ${name}: tot correcte.`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main(process.argv.slice(2));
