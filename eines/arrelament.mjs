// El pilot de l'aparició i l'arrelament (docs/pla-aparicio-arrelament.md, v0.2): les llistes, el manifest i les comprovacions. Cap
// resultat no es llegeix: només els registres de l'envelliment, per saber quins mons hi entren, i les captures, per transformar-les,
// escanejar-les i fer-ne les sembres.
//
//   node eines/arrelament.mjs --envelliment [--mons N]   la llista de l'envelliment dels N primers mons de la llista (per defecte 74)
//   node eines/arrelament.mjs --prepara [--paral·lel N]  valida l'envelliment; escaneja els mons envellits per rondes fins a tenir-ne 60
//                                                        d'inclosos; fa les cinc sopes de cada món (eines/transforma.mjs) i n'escaneja el
//                                                        punt de partida; fa les sembres (eines/sembra.mjs); escriu les llistes de les
//                                                        dues parts i el manifest
//   node eines/arrelament.mjs --comprova [--maquina pc|vm]
//                                                        el manifest contra el disseny, i les captures, els escanejos, les sembres i les
//                                                        llistes contra el manifest; i que cap branca no hagi començat. Amb --maquina,
//                                                        només les captures dels mons d'aquella màquina
//   node eines/arrelament.mjs --escaneig-inert --from captura.bin --out fitxer.json
//                                                        totes les cel·les d'una captura, amb companys inerts en 3 condicions (el
//                                                        control de la sopa de partida); el fa servir --prepara, en processos a part
//
// --prepara no sobreescriu res: si el manifest ja existeix, s'atura. Els camins són relatius a la carpeta del repositori.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, renameSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';
import { spawn, execFileSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import { PROGRAM_SIZE } from '../fase1/bff.js';
import { censusProblem, structureProblems } from '../fase2/b2-serie.mjs';
import { conditions, testInert, copies, heritable, INERT_CONDITIONS, INERT_CONDITIONS_SEED } from '../fase2/inert.js';
import { positions, makePlant, writePlant } from './sembra.mjs';
import { COMMON } from './pilot.mjs';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const shaFile = (root, f) => sha256(readFileSync(join(root, f)));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const readJsonl = (root, f) => readFileSync(join(root, f), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const CENSUS = '--every 100 --census 250 --census-version v3 --rng v2';

// El disseny de la v0.2. Les proves en fan servir un de més petit (designFor)
export const DESIGN = Object.freeze({
  folder: 'fase2/resultats/arrelament/pilot',
  candidates: Array.from({ length: 100 }, (_, i) => String(7001 + i)),
  aging: 74, cohort: 60, age: 8000,
  world: COMMON.world, radius: COMMON.radius,
  arms: ['continue', 'shuffle-all', 'reinit'], byte0Arms: ['byte0', 'byte0-placebo'],
  transformOffset: 600000, byte0Offset: 650000, continuation: 400000, positionStep: 1000000, lineageOffset: 900000, shamOffset: 800000,
  // les variants de la part A (§4.1 i §4.2): K posicions per a les informatives, 1 per a G2 i G3
  variants: [
    { id: 'G1', genotype: 'G1', square: false, positions: 4 },
    { id: 'G1x9', genotype: 'G1', square: true, positions: 4 },
    { id: 'G4', genotype: 'G4', square: false, positions: 4 },
    { id: 'G2', genotype: 'G2', square: false, positions: 1 },
    { id: 'G3', genotype: 'G3', square: false, positions: 1 },
  ],
  byte0Variants: [{ id: 'G1x9', positions: 2 }, { id: 'G4', positions: 2 }],
  sham: { genotype: 'G4', worlds: 20 },
  horizonA: 1500, stopAfterEventA: 500, lineageEvery: 50, horizonB: 8000, inertCensus: 4096,
  genotypes: { file: 'fase2/resultats/arrelament/viabilitat/genotips.json', sha256: '8d16656ed261f87c84ebad34e0a78b925463969e84eb268cbb7a8e26559a39aa' },
  split: [['pc', 3], ['vm', 2]],
});
export const designFor = (overrides) => ({ ...DESIGN, ...overrides });
// Els fitxers del simulador: l'envelliment i el pilot han de tenir els mateixos
export const SIM_FILES = ['sim.mjs', 'fase1/bff.js', 'fase1/soup.js', 'fase1/motifs.js', 'fase2/world.js', 'fase2/census.js', 'fase2/replication.js', 'fase2/families.js', 'fase2/inert.js', 'fase2/llinatge.js'];

const dims = (d) => `${d.world[0]}x${d.world[1]}`;
const agedCapture = (d, w) => `${d.folder}/envelliment/captures/llavor${w}-mon${dims(d)}-r${d.radius}-final.bin`;
const armPath = (d, w, arm) => `${d.folder}/alicuotes/${w}/${arm}.bin`;
const scanPath = (d, w, arm = null) => `${d.folder}/alicuotes/${w}/${arm ? `${arm}-` : ''}escaneig.json`;
const inertScanPath = (d, w, arm) => `${d.folder}/alicuotes/${w}/${arm}-escaneig-inert.json`;
const plantPath = (d, id) => `${d.folder}/sembres/${id}.json`;
export const seedOf = (d, world, k) => Number(world) + d.continuation + d.positionStep * (k - 1);

// L'ordre de l'envelliment d'un món
export function agingLine(d, world) {
  const f = `${d.folder}/envelliment`;
  return `e${world} --world ${dims(d)} --seed ${world} --mixing 0 --epochs ${d.age} ${CENSUS} --stop-after-event 0 --json ${f}/e${world}.jsonl --save ${f}/captures`;
}

// Les branques d'un món inclòs: { id, part, world, soup, variant, position, seed, plant, line }. La part A, amb la sembra de cada
// variant a cada posició (i els sham, als primers mons), i la part B, una branca natural per sopa (la llavor de la posició 1)
export function branchesOf(d, world, index) {
  const out = [];
  const a = (id, soup, variant, k, sham = false) => {
    const plant = plantPath(d, id);
    const line = `${id} --world ${dims(d)} --seed ${seedOf(d, world, k)} --mixing 0 --from ${armPath(d, world, soup)} --start ${d.age} --epochs ${d.age + d.horizonA + 250} ${CENSUS}` +
      ` --stop-after-event ${d.stopAfterEventA} --plant ${plant}` + (sham ? '' : ` --lineage-every ${d.lineageEvery} --stop-on-extinction 0`) +
      ` --inert-census ${d.inertCensus} --json ${d.folder}/part-a/${id}.jsonl`;
    out.push({ id, part: 'A', world, soup, variant, position: k, seed: seedOf(d, world, k), plant, line });
  };
  for (const soup of d.arms) for (const v of d.variants) for (let k = 1; k <= v.positions; k++) a(`${world}-${soup}-${v.id}-p${k}`, soup, v.id, k);
  for (const soup of d.byte0Arms) for (const v of d.byte0Variants) for (let k = 1; k <= v.positions; k++) a(`${world}-${soup}-${v.id}-p${k}`, soup, v.id, k);
  if (index < d.sham.worlds) for (const soup of d.arms) a(`${world}-${soup}-sham-p1`, soup, 'sham', 1, true);
  for (const soup of d.arms) {
    const id = `${world}-${soup}-natural`;
    out.push({ id, part: 'B', world, soup, variant: null, position: 1, seed: seedOf(d, world, 1), plant: null,
      line: `${id} --world ${dims(d)} --seed ${seedOf(d, world, 1)} --mixing 0 --from ${armPath(d, world, soup)} --start ${d.age} --epochs ${d.age + d.horizonB} ${CENSUS}` +
        ` --stop-after-event 0 --inert-census ${d.inertCensus} --json ${d.folder}/part-b/${id}.jsonl` });
  }
  return out;
}

// La màquina de cada món inclòs, per la seva posició: 3 de cada 5 al PC i 2 a la màquina virtual
export function machineOf(d, i) {
  const total = d.split.reduce((s, [, k]) => s + k, 0);
  let r = i % total;
  for (const [m, k] of d.split) { if (r < k) return m; r -= k; }
  return null;
}

// L'envelliment d'un món. { problems, status }: problems, si el registre no és el que toca (un error de la preparació); status, si hi
// entra o no i per què
const START_KEYS = 'census,code,command,diffusion,epochs,event,every,flow,from,mixing,mutation,node,programs,radius,renewal,rng,seed,start,type,world,zlib';
export function validateAging(d, world, { root = ROOT, needCapture = true } = {}) {
  const f = `${d.folder}/envelliment/e${world}.jsonl`, problems = [], q = (m) => problems.push(`e${world}: ${m}`);
  if (!existsSync(join(root, f))) return { problems: [`e${world}: no hi ha el registre de l'envelliment`] };
  let r;
  try { r = readJsonl(root, f); } catch { return { problems: [`e${world}: el registre de l'envelliment no es pot llegir`] }; }
  const s = r[0], end = r[r.length - 1];
  if (!s || s.type !== 'start') return { problems: [`e${world}: no comença amb la línia d'inici`] };
  if (Object.keys(s).sort().join(',') !== START_KEYS) q("la línia d'inici no té els camps esperats");
  const expect = {
    seed: Number(world), programs: d.world[0] * d.world[1], world: d.world, radius: d.radius, mixing: 0, diffusion: 0, flow: 0, renewal: 0,
    mutation: COMMON.mutation, from: null, start: 0, epochs: d.age, every: COMMON.every, rng: COMMON.rng, census: COMMON.census,
    event: { share: 0.01, censuses: 2, stopAfter: 0 }, command: `node sim.mjs ${agingLine(d, world).split(' ').slice(1).join(' ')}`,
  };
  for (const [k, v] of Object.entries(expect)) if (!same(s[k], v)) q(`${k} és ${JSON.stringify(s[k])}, i el disseny diu ${JSON.stringify(v)}`);
  if (!(typeof s.code === 'string' && s.code.length >= 7 && !s.code.includes('+'))) q(`el codi del registre no és un commit net (${s.code})`);
  if (!end || end.type !== 'end') return { problems: [...problems, `e${world}: no acaba amb la línia final (incomplet)`] };
  const cs = r.filter((x) => x.type === 'census'), want = [];
  for (let e = COMMON.census.every; e <= end.epoch; e += COMMON.census.every) want.push(e);
  if (!same(cs.map((c) => c.epoch), want)) q(`els censos no són exactament els de cada ${COMMON.census.every} èpoques fins a l'època ${end.epoch}`);
  for (const c of cs) { const bad = censusProblem(c, COMMON.census); if (bad) { q(`el cens de l'època ${c.epoch} no és vàlid: ${bad}`); break; } }
  structureProblems(r, 0, end.epoch, COMMON).forEach(q);
  if (r.filter((x) => x.type === 'start').length !== 1 || r.filter((x) => x.type === 'end').length !== 1) q("té més d'una línia d'inici o de final");
  const ev = r.find((x) => x.type === 'event');
  let status;
  if (end.epoch === d.age && end.reason === 'horitzó' && end.event === null && !ev) status = { included: true };
  else if (end.reason === 'establiment' && ev && end.epoch === ev.confirmed && end.epoch <= d.age) status = { included: false, reason: `establiment abans de l'època ${d.age} (a l'època ${ev.epoch})` };
  else q(`acaba a l'època ${end.epoch} per "${end.reason}", que no és ni l'horitzó sense vida ni un establiment`);
  if (needCapture && status?.included && !existsSync(join(root, agedCapture(d, world)))) q(`no hi ha la captura final ${agedCapture(d, world)}`);
  return { problems, status, file: f, sha256: shaFile(root, f), code: s.code };
}

// Que el simulador del commit de l'envelliment sigui el d'ara (els blobs de git)
export function simulatorProblems(code, { root = ROOT } = {}) {
  const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  const out = [];
  for (const f of SIM_FILES) {
    let then, now;
    try { then = git('rev-parse', `${code}:${f}`); } catch { out.push(`el commit de l'envelliment (${code}) no té ${f}`); continue; }
    try { now = git('hash-object', '--no-filters', join(root, f)); } catch { out.push(`no es pot llegir ${f}`); continue; }
    if (then !== now) out.push(`${f} és diferent del del commit de l'envelliment (${code})`);
  }
  return out;
}

function codeVersion(root) {
  const run = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  try { return run('rev-parse', '--short', 'HEAD') + (run('status', '--porcelain', '--', '*.js', '*.mjs') ? '+canvis' : ''); } catch { return 'desconeguda'; }
}

// L'escaneig de totes les cel·les amb companys inerts, en 3 condicions
export function inertScan(soup) {
  const conds = conditions(INERT_CONDITIONS_SEED, INERT_CONDITIONS), n = soup.length / PROGRAM_SIZE;
  let copying = 0, heritables = 0, heritableSolo = 0;
  for (let c = 0; c < n; c++) {
    const s = testInert(soup.subarray(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE), conds);
    if (copies(s)) copying++;
    if (heritable(s)) heritables++;
    if (s.heritableSolo.includes('1')) heritableSolo++;
  }
  return { cells: n, copying, heritable: heritables, heritableSolo, conditions: { seed: INERT_CONDITIONS_SEED, count: INERT_CONDITIONS } };
}

// Les feines a part (eines/transforma.mjs i l'escaneig inert), N alhora
function runPool(jobs, parallel, root) {
  return new Promise((resolve, reject) => {
    let next = 0, running = 0, done = 0, failed = false;
    const launch = () => {
      if (done === jobs.length) { resolve(); return; }
      while (!failed && running < parallel && next < jobs.length) {
        const job = jobs[next++];
        running++;
        const child = spawn(process.execPath, job.args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
        let err = '';
        child.stderr.on('data', (x) => { err += x; });
        child.on('close', (code) => {
          running--; done++;
          if (code) { failed = true; reject(new Error(`${job.label}: ${err.trim()}`)); return; }
          if (done % 25 === 0 || done === jobs.length) console.log(`  ${done} de ${jobs.length}`);
          launch();
        });
      }
    };
    launch();
  });
}
const TRANSFORM = 'eines/transforma.mjs';
const scanRecord = (root, file) => {
  const s = JSON.parse(readFileSync(join(root, file), 'utf8'));
  return { file, sha256: shaFile(root, file), replicating: s.replicating, heritable: s.heritable, heritableSolo: s.heritableSolo, cells: s.cells };
};
const inertRecord = (root, file) => {
  const s = JSON.parse(readFileSync(join(root, file), 'utf8'));
  return { file, sha256: shaFile(root, file), captureSha256: s.captureSha256, copying: s.copying, heritable: s.heritable, heritableSolo: s.heritableSolo, cells: s.cells };
};

// Els genotips de la prova de viabilitat, amb la SHA-256 del disseny
export function genotypesOf(d, { root = ROOT } = {}) {
  const sha = shaFile(root, d.genotypes.file);
  if (sha !== d.genotypes.sha256) throw new Error(`${d.genotypes.file} no té la SHA-256 del disseny`);
  return Object.fromEntries(JSON.parse(readFileSync(join(root, d.genotypes.file), 'utf8')).genotypes.map((g) => [g.id, g.hex]));
}

export async function prepare(d = DESIGN, { root = ROOT, parallel = 6, log = console.log } = {}) {
  const manifestPath = `${d.folder}/manifest.json`;
  if (existsSync(join(root, manifestPath))) throw new Error(`${manifestPath} ja existeix: no es torna a preparar`);
  const code = codeVersion(root);
  if (code.includes('+') || code === 'desconeguda') throw new Error(`el codi té canvis sense desar (${code}): la preparació ha de ser d'un commit net`);
  const genotypes = genotypesOf(d, { root });
  // 1. L'envelliment: els candidats que en tenen el registre, en ordre, sense forats; validat sencer i amb el simulador d'ara
  const has = d.candidates.map((w) => existsSync(join(root, `${d.folder}/envelliment/e${w}.jsonl`)));
  const upTo = has.indexOf(false) < 0 ? has.length : has.indexOf(false);
  if (has.slice(upTo).some(Boolean)) throw new Error(`falta el registre de l'envelliment de ${d.candidates[upTo]}, i n'hi ha de mons posteriors`);
  const worlds = d.candidates.slice(0, upTo).map((world) => ({ world, start: d.age, capture: agedCapture(d, world) }));
  const problems = [], codes = new Set();
  for (const w of worlds) {
    const a = validateAging(d, w.world, { root });
    problems.push(...a.problems);
    if (!a.problems.length) { Object.assign(w, a.status); w.aging = { file: a.file, sha256: a.sha256, code: a.code }; codes.add(a.code); }
  }
  for (const c of codes) problems.push(...simulatorProblems(c, { root }));
  if (problems.length) throw new Error(`l'envelliment no és el que toca (${problems.length} problemes):\n- ${problems.slice(0, 20).join('\n- ')}`);
  // 2. L'escaneig de cada món envellit, per rondes, fins a tenir-ne d.cohort d'inclosos: s'exclou el món si hi ha alguna hereditària
  let i = 0, included = 0;
  while (included < d.cohort && i < worlds.length) {
    const batch = [];
    while (batch.length < d.cohort - included && i < worlds.length) { const w = worlds[i++]; if (w.included) batch.push(w); }
    for (const w of batch) mkdirSync(join(root, d.folder, 'alicuotes', w.world), { recursive: true });
    log(`L'escaneig de ${batch.length} mons envellits:`);
    await runPool(batch.map((w) => ({ label: `escaneig de ${w.world}`, args: [TRANSFORM, '--scan', '--from', w.capture, '--seed', String(Number(w.world) + d.transformOffset), '--width', String(d.world[0]), '--radius', String(d.radius), '--out', scanPath(d, w.world)] })), parallel, root);
    for (const w of batch) {
      w.scan = scanRecord(root, scanPath(d, w.world));
      if (w.scan.heritable > 0) { w.included = false; w.reason = `${w.scan.heritable} cel·les hereditàries a l'escaneig de l'època ${d.age}`; } else included++;
    }
  }
  if (included < d.cohort) throw new Error(`hi ha ${included} mons inclosos, i en calen ${d.cohort}: cal envellir els següents de la llista (node eines/arrelament.mjs --envelliment --mons N)`);
  worlds.splice(i);
  const cohort = worlds.filter((w) => w.included);
  for (const w of cohort) w.captureSha256 = shaFile(root, w.capture);
  // 3. Les cinc sopes de cada món, i el punt de partida de cadascuna
  const soups = [...d.arms, ...d.byte0Arms];
  log(`Les ${cohort.length * soups.length} transformacions:`);
  await runPool(cohort.flatMap((w) => soups.map((arm) => ({ label: `${w.world} ${arm}`,
    args: [TRANSFORM, '--from', w.capture, '--kind', arm, '--seed', String(Number(w.world) + (d.byte0Arms.includes(arm) ? d.byte0Offset : d.transformOffset)), '--width', String(d.world[0]), '--out', armPath(d, w.world, arm)] }))), parallel, root);
  log(`Els ${cohort.length * soups.length} escanejos amb la prova del cens:`);
  await runPool(cohort.flatMap((w) => soups.map((arm) => ({ label: `escaneig de ${w.world} ${arm}`,
    args: [TRANSFORM, '--scan', '--from', armPath(d, w.world, arm), '--seed', String(Number(w.world) + d.transformOffset), '--width', String(d.world[0]), '--radius', String(d.radius), '--out', scanPath(d, w.world, arm)] }))), parallel, root);
  log(`Els ${cohort.length * d.arms.length} escanejos amb companys inerts:`);
  await runPool(cohort.flatMap((w) => d.arms.map((arm) => ({ label: `escaneig inert de ${w.world} ${arm}`,
    args: ['eines/arrelament.mjs', '--escaneig-inert', '--from', armPath(d, w.world, arm), '--out', inertScanPath(d, w.world, arm)] }))), parallel, root);
  for (const w of cohort) {
    w.arms = {};
    for (const arm of soups) {
      const file = armPath(d, w.world, arm), recFile = file.replace(/\.bin$/, '.json');
      const rec = JSON.parse(readFileSync(join(root, recFile), 'utf8'));
      w.arms[arm] = { file, sha256: rec.outSha256, record: { file: recFile, sha256: shaFile(root, recFile) }, changed: rec.changed, byte0: rec.byte0 ?? null,
        scan: scanRecord(root, scanPath(d, w.world, arm)), ...(d.arms.includes(arm) ? { inertScan: inertRecord(root, inertScanPath(d, w.world, arm)) } : {}) };
    }
  }
  // 4. Les sembres: les posicions de cada món, i el fitxer de cada branca de la part A
  mkdirSync(join(root, d.folder, 'sembres'), { recursive: true });
  const cache = new Map(), soupCache = new Map();
  const soupOf = (file) => { if (!soupCache.has(file)) { soupCache.clear(); soupCache.set(file, new Uint8Array(readFileSync(join(root, file)))); } return soupCache.get(file); };
  const branches = [];
  cohort.forEach((w, idx) => {
    const K = Math.max(...d.variants.map((v) => v.positions), ...d.byte0Variants.map((v) => v.positions), 1);
    w.positions = positions(Number(w.world), K, d.world[0], d.world[1]);
    const bs = branchesOf(d, w.world, idx);
    for (const b of bs.filter((x) => x.part === 'A').sort((x, y) => (x.soup < y.soup ? -1 : x.soup > y.soup ? 1 : 0))) {
      const p = w.positions[b.position - 1];
      const variant = d.variants.find((v) => v.id === b.variant) ?? d.byte0Variants.find((v) => v.id === b.variant);
      const square = b.variant === 'sham' ? false : (d.variants.find((v) => v.id === b.variant)?.square ?? false);
      const cells = square ? [-1, 0, 1].flatMap((dy) => [-1, 0, 1].map((dx) => (p.y + dy) * d.world[0] + (p.x + dx))) : [p.cell];
      const genotype = b.variant === 'sham' ? d.sham.genotype : (d.variants.find((v) => v.id === b.variant)?.genotype);
      if (!genotype || (!variant && b.variant !== 'sham')) throw new Error(`${b.id}: variant desconeguda`);
      const record = makePlant({ from: armPath(d, w.world, b.soup), soup: soupOf(armPath(d, w.world, b.soup)), width: d.world[0], cells, program: genotypes[genotype],
        genotype: b.variant === 'sham' ? `${genotype} (sham)` : genotype, sham: b.variant === 'sham' ? Number(w.world) + d.shamOffset : null,
        lineageSeed: Number(w.world) + d.lineageOffset, cache });
      if (record.sourceSha256 !== w.arms[b.soup].sha256) throw new Error(`${b.id}: la captura de la sopa no és la del registre de la transformació`);
      writePlant(join(root, b.plant), record);
      b.plantSha256 = shaFile(root, b.plant);
    }
    branches.push(...bs);
  });
  log(`Les sembres: ${branches.filter((b) => b.part === 'A').length}`);
  // 5. Les llistes, per part i per màquina, i el manifest
  const lists = {};
  for (const part of ['A', 'B']) {
    for (const [machine] of d.split) {
      const lines = cohort.flatMap((w, idx) => (machineOf(d, idx) === machine ? branches.filter((b) => b.world === w.world && b.part === part).map((b) => b.line) : []));
      const file = `${d.folder}/llista-${part.toLowerCase()}-${machine}.txt`;
      writeFileSync(join(root, file), lines.join('\n') + '\n', { flag: 'wx' });
      lists[`${part}-${machine}`] = { file, sha256: shaFile(root, file), branches: lines.length };
    }
  }
  const manifest = {
    pilot: 'arrelament', design: 'docs/pla-aparicio-arrelament.md', code, node: process.version, date: new Date().toISOString(),
    params: { ...d, candidates: [d.candidates[0], d.candidates.at(-1)] }, genotypes,
    worlds: worlds.map(({ included: inc, ...w }) => ({ ...w, included: !!inc })),
    branches: branches.map(({ line, ...b }) => ({ ...b, command: `node sim.mjs ${line.split(' ').slice(1).join(' ')}` })), lists,
  };
  writeFileSync(join(root, manifestPath), JSON.stringify(manifest, null, 1) + '\n', { flag: 'wx' });
  log(`manifest: ${manifestPath}; ${cohort.length} mons inclosos de ${worlds.length}, ${branches.length} branques (${branches.filter((b) => b.part === 'A').length} de la part A)`);
  return manifest;
}

// El manifest contra el disseny, i les captures, els escanejos, les sembres i les llistes contra el manifest. Amb una màquina, només
// les captures dels mons de la seva llista. Retorna la llista de problemes
export function checkManifest(d = DESIGN, { root = ROOT, machine = null } = {}) {
  const p = [], q = (m) => p.push(m);
  const mf = `${d.folder}/manifest.json`;
  if (!existsSync(join(root, mf))) return [`no hi ha ${mf}`];
  const m = JSON.parse(readFileSync(join(root, mf), 'utf8'));
  if (!same(m.params, { ...d, candidates: [d.candidates[0], d.candidates.at(-1)] })) q('els paràmetres del manifest no són els del disseny');
  let genotypes;
  try { genotypes = genotypesOf(d, { root }); } catch (e) { q(e.message); }
  if (genotypes && !same(m.genotypes, genotypes)) q('els genotips del manifest no són els del fitxer del disseny');
  const cohort = m.worlds.filter((w) => w.included);
  if (cohort.length !== d.cohort) q(`el manifest té ${cohort.length} mons inclosos, i el disseny en diu ${d.cohort}`);
  if (!same(m.worlds.map((w) => w.world), d.candidates.slice(0, m.worlds.length))) q('els mons del manifest no són els primers de la llista, en ordre');
  const mine = new Set(cohort.filter((_, i) => !machine || machineOf(d, i) === machine).map((w) => w.world));
  for (const w of m.worlds) {
    const a = validateAging(d, w.world, { root, needCapture: w.included && mine.has(w.world) });
    a.problems.forEach(q);
    if (!a.problems.length && w.aging?.sha256 !== a.sha256) q(`${w.world}: el registre de l'envelliment no és el del manifest`);
    if (w.scan && w.scan.sha256 !== shaFile(root, w.scan.file)) q(`${w.world}: l'escaneig no és el del manifest`);
    if (!w.included) continue;
    if (mine.has(w.world) && shaFile(root, w.capture) !== w.captureSha256) q(`${w.world}: la captura envellida no és la del manifest`);
    for (const [arm, info] of Object.entries(w.arms ?? {})) {
      if (mine.has(w.world)) {
        if (!existsSync(join(root, info.file))) q(`${w.world} ${arm}: no hi ha la captura`);
        else if (shaFile(root, info.file) !== info.sha256) q(`${w.world} ${arm}: la captura no té la SHA-256 del manifest`);
      }
      if (shaFile(root, info.record.file) !== info.record.sha256) q(`${w.world} ${arm}: el registre de la transformació no és el del manifest`);
      const rec = JSON.parse(readFileSync(join(root, info.record.file), 'utf8'));
      if (rec.fromSha256 !== w.captureSha256) q(`${w.world} ${arm}: no és de la captura envellida`);
      if (rec.kind !== arm || rec.seed !== Number(w.world) + (d.byte0Arms.includes(arm) ? d.byte0Offset : d.transformOffset)) q(`${w.world} ${arm}: la transformació o la seva llavor no són les del disseny`);
      if (shaFile(root, info.scan.file) !== info.scan.sha256) q(`${w.world} ${arm}: l'escaneig no és el del manifest`);
      if (info.inertScan && shaFile(root, info.inertScan.file) !== info.inertScan.sha256) q(`${w.world} ${arm}: l'escaneig inert no és el del manifest`);
    }
  }
  // les branques: les del disseny, i les sembres, cadascuna amb la seva SHA-256 i de la captura de la seva sopa
  const want = cohort.flatMap((w, idx) => branchesOf(d, w.world, idx));
  if (!same(m.branches.map((b) => b.id), want.map((b) => b.id))) q('les branques del manifest no són les del disseny');
  for (const b of m.branches) {
    const exp = want.find((x) => x.id === b.id);
    if (exp && b.command !== `node sim.mjs ${exp.line.split(' ').slice(1).join(' ')}`) { q(`${b.id}: l'ordre no és la del disseny`); continue; }
    if (b.part !== 'A') continue;
    if (!existsSync(join(root, b.plant)) || shaFile(root, b.plant) !== b.plantSha256) { q(`${b.id}: la sembra no és la del manifest`); continue; }
    const pl = JSON.parse(readFileSync(join(root, b.plant), 'utf8'));
    const w = cohort.find((x) => x.world === b.world);
    if (pl.sourceSha256 !== w.arms[b.soup].sha256) q(`${b.id}: la sembra no és de la captura de la seva sopa`);
    if (b.variant !== 'sham' && genotypes && pl.hex !== genotypes[d.variants.find((v) => v.id === b.variant)?.genotype]) q(`${b.id}: el programa plantat no és el del genotip`);
    if (b.variant === 'sham' && (pl.plantedTest.solo + pl.plantedTest.context !== 0 || !pl.sham)) q(`${b.id}: el sham es copia`);
    if (pl.lineageSeed !== Number(b.world) + d.lineageOffset) q(`${b.id}: la llavor del llinatge no és la del disseny`);
  }
  for (const [key, l] of Object.entries(m.lists)) {
    const [part, mach] = key.split('-');
    const lines = cohort.flatMap((w, idx) => (machineOf(d, idx) === mach ? want.filter((b) => b.world === w.world && b.part === part).map((b) => b.line) : []));
    if (!existsSync(join(root, l.file)) || readFileSync(join(root, l.file), 'utf8') !== lines.join('\n') + '\n') q(`la llista ${key} no és exactament la del disseny`);
    else if (shaFile(root, l.file) !== l.sha256) q(`la llista ${key} no té la SHA-256 del manifest`);
  }
  return p;
}

// Abans de llançar: el manifest, i que cap branca no hagi començat
export function preflight(d = DESIGN, { root = ROOT, machine = null } = {}) {
  const p = checkManifest(d, { root, machine });
  for (const part of ['part-a', 'part-b']) {
    const dir = join(root, d.folder, part);
    if (existsSync(dir) && readdirSync(dir).some((f) => f.endsWith('.jsonl'))) p.push(`la ${part} ja ha començat: hi ha registres a ${d.folder}/${part}`);
  }
  return p;
}

function fail(message, code = 1) { console.error(`Error: ${message}`); process.exit(code); }

async function main(argv) {
  const opt = (name) => { const i = argv.indexOf(name); return i < 0 ? undefined : argv[i + 1]; };
  if (argv[0] === '--envelliment') {
    const n = opt('--mons') === undefined ? DESIGN.aging : Number(opt('--mons'));
    if (!Number.isInteger(n) || n < 1 || n > DESIGN.candidates.length) fail(`--mons ha de ser d'1 a ${DESIGN.candidates.length}`, 2);
    for (const w of DESIGN.candidates.slice(0, n)) console.log(agingLine(DESIGN, w));
  } else if (argv[0] === '--prepara') {
    const par = opt('--paral·lel') === undefined ? 6 : Number(opt('--paral·lel'));
    try { await prepare(DESIGN, { parallel: par }); } catch (e) { fail(e.message); }
  } else if (argv[0] === '--comprova') {
    const machine = opt('--maquina') ?? null;
    if (machine && !DESIGN.split.some(([m]) => m === machine)) fail('--maquina ha de ser pc o vm', 2);
    const p = preflight(DESIGN, { machine });
    if (p.length) { console.log(`${p.length} problemes:\n- ${p.slice(0, 50).join('\n- ')}`); process.exit(1); }
    console.log('tot correcte');
  } else if (argv[0] === '--escaneig-inert') {
    const from = opt('--from'), out = opt('--out');
    if (!from || !out) fail('--escaneig-inert necessita --from i --out', 2);
    if (existsSync(out) || existsSync(`${out}.part`)) fail(`${out} ja hi és: no el sobreescric`);
    const buf = readFileSync(from);
    const r = { type: 'inert-scan', from, captureSha256: sha256(buf), ...inertScan(new Uint8Array(buf.buffer, buf.byteOffset, buf.length)), code: codeVersion(ROOT), node: process.version };
    writeFileSync(`${out}.part`, JSON.stringify(r, null, 2) + '\n', { flag: 'wx' });
    renameSync(`${out}.part`, out);
  } else fail('Ús: node eines/arrelament.mjs --envelliment [--mons N] | --prepara [--paral·lel N] | --comprova [--maquina pc|vm] | --escaneig-inert --from captura.bin --out fitxer.json', 2);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
