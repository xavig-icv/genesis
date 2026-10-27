// Els experiments d'alíquotes: el pilot de la maduració (docs/pilot-maduracio.md), la prova preregistrada dels zeros
// (docs/protocol-zeros.md) i la sèrie preregistrada de la maduració (docs/protocol-maduracio.md). Les llistes, el
// manifest congelat i les comprovacions que van demanar les auditories 15, 16 i 19. Cap resultat no es llegeix: només
// els registres de l'envelliment, per saber quins mons hi entren, i les captures, per transformar-les i escanejar-les.
//
//   node eines/pilot.mjs maduracio|serie --envelliment [--mons N]
//                                                         la llista de l'envelliment dels mons nous (a la sortida). A la
//                                                         sèrie, els N primers de la llista de llavors (per defecte, 180)
//   node eines/pilot.mjs PILOT --prepara [--paral·lel N]  valida l'envelliment (la maduració i la sèrie) i hi exclou els
//                                                         mons amb vida (AUD-111); a la sèrie, n'agafa els primers que hi
//                                                         entren, en l'ordre de la llista; transforma les captures amb
//                                                         eines/transforma.mjs i les escaneja totes (el punt de partida de
//                                                         cada braç, AUD-116); escriu el manifest i les llistes de les branques
//   node eines/pilot.mjs PILOT --comprova-captures        el manifest contra el disseny, i totes les captures, els registres
//                                                         i els escanejos contra el manifest (AU2-84, AU2-88). Serveix també
//                                                         després de la sèrie, abans de decidir (AUD-118)
//   node eines/pilot.mjs PILOT --comprova [--maquina pc|vm]
//                                                         la comprovació prèvia: --comprova-captures, les llistes, i que cap
//                                                         branca no hagi començat. Amb --maquina, només les captures dels
//                                                         mons de la llista d'aquella màquina
//
// PILOT és maduracio, zeros o serie. --prepara no sobreescriu res: si el manifest ja existeix, s'atura. Un registre de
// l'envelliment que no sigui el que toca és un error de la preparació, no un món exclòs (AU2-85). Els camins de les
// llistes són relatius a la carpeta del repositori, com a eines/experiments.sh.
import { readFileSync, writeFileSync, existsSync, mkdirSync, lstatSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';
import { spawn, execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { censusProblem, structureProblems } from '../fase2/b2-serie.mjs';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TOOL = join(ROOT, 'eines', 'transforma.mjs');
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// El que tenen en comú totes les branques i l'envelliment: el món, el generador, les mesures i el cens
export const COMMON = { world: [512, 256], radius: 2, rng: 'v2', every: 100, mutation: 0.00024, census: { version: 'v3', every: 250, sample: 2048, seed: 20261016 } };
const CENSUS = '--every 100 --census 250 --census-version v3 --rng v2';
export const TRANSFORM_OFFSET = 600000;
// Els fitxers del simulador: l'envelliment i la preparació han de tenir els mateixos
export const SIM_FILES = ['sim.mjs', 'fase1/bff.js', 'fase1/soup.js', 'fase1/motifs.js', 'fase2/world.js', 'fase2/census.js', 'fase2/replication.js', 'fase2/families.js'];

// Els dos experiments, tal com els descriuen docs/pilot-maduracio.md i docs/protocol-zeros.md
export const PILOTS = {
  maduracio: {
    folder: 'fase2/resultats/maduracio/pilot',
    worlds: Array.from({ length: 24 }, (_, i) => String(5001 + i)),
    age: 8000, horizon: 8000, mixing: 0, stopAfterEvent: 0, saveEvents: true,
    arms: ['continue', 'shuffle-programs', 'shuffle-within', 'shuffle-all', 'reinit'],
    continuation: [['a', 400000], ['b', 500000]],
  },
  // la prova preregistrada dels zeros: el manifest porta l'etiqueta i la prova
  zeros: {
    folder: 'fase2/resultats/zeros/serie',
    // els 8 mons on la vida baixa al primer cens a totes les branques de B2 amb corrent, i els 3 controls negatius (AUD-110)
    worlds: ['B2002', 'B2011', 'B2021', 'B2038', 'B2042', 'B2043', 'B2078', 'B2001', 'B2071', 'B2044', 'B2058'],
    roles: { B2071: 'control negatiu', B2044: 'control negatiu', B2058: 'control negatiu' },
    horizon: 2000, mixing: 0.01, stopAfterEvent: null, saveEvents: false,
    arms: ['continue', 'zeros-data', 'placebo-cell', 'zeros-inert'],
    continuation: [['a', 400000], ['b', 500000], ['c', 700000]],
    tag: 'preregistre-zeros', protocol: 'docs/protocol-zeros.md',
    test: {
      measure: "g = h₁ / h₀: els hereditaris del primer cens de la branca (t + 250) respecte dels del començament del braç", unit: 'món', worlds: 'prova',
      contrasts: [['zeros-data', 'continue'], ['zeros-data', 'placebo-cell']], method: 'holm', alpha: 0.025, sided: 'greater',
      descriptive: [['zeros-inert', 'continue'], ['zeros-data', 'zeros-inert'], ['placebo-cell', 'continue']],
    },
  },
  // la sèrie preregistrada de la maduració (auditoria 19): els 150 primers mons de la llista que hi entren, tres braços,
  // dues llavors, i cap captura de les branques (AUD-124, AU2-93). El PC en fa 3 de cada 5 mons, i la màquina virtual, 2
  serie: {
    folder: 'fase2/resultats/maduracio/serie',
    candidates: Array.from({ length: 400 }, (_, i) => String(6001 + i)),
    cohort: { from: 6001, to: 6400, size: 150 }, aging: 180,
    age: 8000, horizon: 8000, mixing: 0, stopAfterEvent: 0, saveEvents: false,
    arms: ['continue', 'shuffle-all', 'reinit'],
    continuation: [['a', 400000], ['b', 500000]],
    split: [['pc', 3], ['vm', 2]],
    tag: 'preregistre-maduracio', protocol: 'docs/protocol-maduracio.md',
    test: {
      measure: "el nombre de branques de cada món i braç on la vida s'estableix dins de H (el criteri de la llei 2)", unit: 'món', worlds: 'tots',
      contrasts: [['continue', 'reinit'], ['shuffle-all', 'reinit']], method: 'holm', alpha: 0.025, sided: 'greater',
      statistic: 'la permutació de signes exacta, sobre la suma de les diferències de cada món, amb els llindars de Holm calibrats per m',
      thresholds: 'fase2/maduracio-llindars.json',
      descriptive: [['continue', 'shuffle-all']],
    },
  },
};

const seedOf = (world) => Number(world.replace(/^[AB]/, ''));
const read = (root, f) => readFileSync(join(root, f), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const shaFile = (root, f) => sha256(readFileSync(join(root, f)));
const roleOf = (p, world) => p.roles?.[world] ?? 'prova';

// Els paràmetres que el manifest ha de portar, exactament
export function designParams(name) {
  const p = PILOTS[name];
  return { arms: p.arms, horizon: p.horizon, mixing: p.mixing, stopAfterEvent: p.stopAfterEvent, age: p.age ?? null, transformOffset: TRANSFORM_OFFSET, continuation: p.continuation, ...COMMON, ...(p.cohort ? { cohort: p.cohort } : {}) };
}
// Els experiments amb mons nous, envellits aquí: la maduració i la sèrie
const aged = (name) => name === 'maduracio' || name === 'serie';

// L'ordre de l'envelliment d'un món nou de la maduració o de la sèrie
export function agingLine(world, name = 'maduracio') {
  const p = PILOTS[name], d = `${p.folder}/envelliment`;
  return `e${world} --world 512x256 --seed ${world} --mixing 0 --epochs ${p.age} ${CENSUS} --stop-after-event 0 --json ${d}/e${world}.jsonl --save ${d}/captures`;
}
const agedCapture = (world, name = 'maduracio') => `${PILOTS[name].folder}/envelliment/captures/llavor${world}-mon512x256-r2-final.bin`;
const armPath = (p, world, arm) => `${p.folder}/alicuotes/${world}/${arm}.bin`;
const scanPath = (p, world, arm = null) => `${p.folder}/alicuotes/${world}/${arm ? `${arm}-` : ''}escaneig.json`;

// La captura d'origen i l'època de cada món (i, als zeros, la SHA-256 del repartiment de B2)
export function origin(name, world, { root = ROOT } = {}) {
  if (aged(name)) return { capture: agedCapture(world, name), start: PILOTS[name].age };
  const rep = JSON.parse(readFileSync(join(root, 'fase2/resultats/b2/repartiment.json'), 'utf8'));
  const w = rep.worlds.find((x) => `${x.group}${x.seed}` === world);
  if (!w) throw new Error(`${world} no és al repartiment de B2`);
  return { capture: w.capture, start: w.t, sha256: w.sha256 };
}

// Les línies de les branques d'un món inclòs
export function branchLines(name, entry) {
  const p = PILOTS[name];
  const lines = [];
  for (const arm of p.arms) {
    for (const [tag, offset] of p.continuation) {
      const id = `${entry.world}-${arm}-${tag}`;
      lines.push(`${id} --world 512x256 --seed ${seedOf(entry.world) + offset} --mixing ${p.mixing} --from ${armPath(p, entry.world, arm)} --start ${entry.start} --epochs ${entry.start + p.horizon} ${CENSUS}` +
        (p.stopAfterEvent !== null ? ` --stop-after-event ${p.stopAfterEvent}` : '') +
        ` --json ${p.folder}/branques/${id}.jsonl` + (p.saveEvents ? ` --save ${p.folder}/branques/captures --save-what event` : ''));
    }
  }
  return lines;
}
// Les mateixes branques, com les desa el manifest: amb l'ordre que escriurà sim.mjs a la línia d'inici
export function branchList(name, entry) {
  const p = PILOTS[name];
  return branchLines(name, entry).map((l) => {
    const [id, ...args] = l.split(' '), [, arm, tag] = id.match(/^.+?-(.+)-([a-z])$/);
    return { id, world: entry.world, arm, tag, seed: seedOf(entry.world) + p.continuation.find(([t]) => t === tag)[1], command: `node sim.mjs ${args.join(' ')}` };
  });
}

// L'envelliment d'un món de la maduració o de la sèrie (AU2-85). Retorna { problems, status }: problems, si el registre
// no és el que toca (és un error de la preparació); status, si hi entra o no i per què. Sense needCapture, no cal que hi
// sigui la captura final (la comprovació d'una màquina que no fa córrer aquest món)
const START_KEYS = 'census,code,command,diffusion,epochs,event,every,flow,from,mixing,mutation,node,programs,radius,renewal,rng,seed,start,type,world,zlib';
export function validateAging(world, { root = ROOT, name = 'maduracio', needCapture = true } = {}) {
  const p = PILOTS[name], f = `${p.folder}/envelliment/e${world}.jsonl`, problems = [], q = (m) => problems.push(`e${world}: ${m}`);
  if (!existsSync(join(root, f))) return { problems: [`e${world}: no hi ha el registre de l'envelliment`] };
  let r;
  try { r = read(root, f); } catch { return { problems: [`e${world}: el registre de l'envelliment no es pot llegir`] }; }
  const s = r[0], end = r[r.length - 1];
  if (!s || s.type !== 'start') return { problems: [`e${world}: no comença amb la línia d'inici`] };
  if (Object.keys(s).sort().join(',') !== START_KEYS) q("la línia d'inici no té els camps esperats");
  const expect = {
    seed: Number(world), programs: COMMON.world[0] * COMMON.world[1], world: COMMON.world, radius: COMMON.radius, mixing: 0, diffusion: 0, flow: 0, renewal: 0,
    mutation: COMMON.mutation, from: null, start: 0, epochs: p.age, every: COMMON.every, rng: COMMON.rng, census: COMMON.census,
    event: { share: 0.01, censuses: 2, stopAfter: 0 }, command: `node sim.mjs ${agingLine(world, name).split(' ').slice(1).join(' ')}`,
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
  if (end.epoch === p.age && end.reason === 'horitzó' && end.event === null && !ev) {
    const c = cs[cs.length - 1];
    status = { included: true, censusAtAge: { replicating: c.replicating, heritable: c.heritable, sample: c.sample } };
  } else if (end.reason === 'establiment' && ev && end.epoch === ev.confirmed && end.epoch <= p.age) {
    status = { included: false, reason: `establiment abans de l'època ${p.age} (a l'època ${ev.epoch})` };
  } else q(`acaba a l'època ${end.epoch} per "${end.reason}", que no és ni l'horitzó sense vida ni un establiment`);
  if (needCapture && !existsSync(join(root, agedCapture(world, name)))) q(`no hi ha la captura final ${agedCapture(world, name)}`);
  return { problems, status, file: f, sha256: shaFile(root, f), code: s.code };
}

// Que el simulador del commit de l'envelliment sigui el mateix que el d'ara (els blobs de git dels fitxers del simulador)
export function simulatorProblems(code, { root = ROOT } = {}) {
  const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  const out = [];
  for (const f of SIM_FILES) {
    let then, now;
    try { then = git('rev-parse', `${code}:${f}`); } catch { out.push(`el commit de l'envelliment (${code}) no és al repositori, o no hi ha ${f}`); continue; }
    try { now = git('hash-object', '--no-filters', join(root, f)); } catch { out.push(`no es pot llegir ${f}`); continue; }
    if (then !== now) out.push(`${f} és diferent del del commit de l'envelliment (${code})`);
  }
  return out;
}

function codeVersion(root) {
  const run = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  try { return run('rev-parse', '--short', 'HEAD') + (run('status', '--porcelain', '--', '*.js', '*.mjs') ? '+canvis' : ''); } catch { return 'desconeguda'; }
}
function fail(message, code = 1) { console.error(`Error: ${message}`); process.exit(code); }

// Executa les ordres d'eines/transforma.mjs, N alhora
function runPool(jobs, parallel, root) {
  return new Promise((resolve, reject) => {
    let next = 0, running = 0, done = 0;
    const launch = () => {
      if (done === jobs.length) { resolve(); return; }
      while (running < parallel && next < jobs.length) {
        const job = jobs[next++];
        running++;
        const child = spawn(process.execPath, [TOOL, ...job.args], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
        let err = '';
        child.stderr.on('data', (d) => { err += d; });
        child.on('close', (code) => {
          running--; done++;
          if (code) { reject(new Error(`${job.label}: ${err.trim()}`)); return; }
          console.log(`  fet: ${job.label} (${done} de ${jobs.length})`);
          launch();
        });
      }
    };
    launch();
  });
}
const scanRecord = (root, file) => {
  const s = JSON.parse(readFileSync(join(root, file), 'utf8'));
  return { file, sha256: shaFile(root, file), replicating: s.replicating, heritable: s.heritable, heritableSolo: s.heritableSolo, cells: s.cells };
};

// La màquina de cada món inclòs, per la seva posició al manifest: alternats, o, a la sèrie, 3 de cada 5 al PC i 2 a la
// màquina virtual (la proporció de branques alhora de cada una)
export function machineOf(name, i) {
  const split = PILOTS[name].split ?? [['pc', 1], ['vm', 1]], total = split.reduce((a, [, k]) => a + k, 0);
  let r = i % total;
  for (const [machine, k] of split) { if (r < k) return machine; r -= k; }
  return null;
}

// Els mons de la llista de la sèrie que tenen el registre de l'envelliment, en ordre. Un forat a la llista (un món sense
// registre i, després, mons que en tenen) és un error de l'envelliment
export function agedCandidates(name, { root = ROOT } = {}) {
  const p = PILOTS[name], has = p.candidates.map((w) => existsSync(join(root, `${p.folder}/envelliment/e${w}.jsonl`)));
  const first = has.indexOf(false), upTo = first < 0 ? has.length : first;
  if (has.slice(upTo).some(Boolean)) throw new Error(`falta el registre de l'envelliment de ${p.candidates[upTo]}, i n'hi ha de mons posteriors de la llista`);
  return p.candidates.slice(0, upTo);
}

const scanJob = (p, w) => ({ label: `escaneig de ${w.world}`, args: ['--scan', '--from', w.capture, '--seed', String(seedOf(w.world) + TRANSFORM_OFFSET), '--out', scanPath(p, w.world)] });
const excludeIfHeritable = (p, w, root) => {
  w.scan = scanRecord(root, scanPath(p, w.world));
  if (w.scan.heritable > 0) { w.included = false; w.reason = `${w.scan.heritable} cel·les hereditàries a l'escaneig de l'època ${p.age}`; }
};

export async function prepare(name, { root = ROOT, parallel = 6 } = {}) {
  const p = PILOTS[name], manifestPath = `${p.folder}/manifest.json`;
  if (existsSync(join(root, manifestPath))) fail(`${manifestPath} ja existeix: no es torna a preparar`);
  const code = codeVersion(root);
  if (code.includes('+') || code === 'desconeguda') fail(`el codi té canvis sense desar (${code}): la preparació ha de ser d'un commit net`);
  if (p.test?.thresholds && !existsSync(join(root, p.test.thresholds))) fail(`no hi ha la taula dels llindars calibrats (${p.test.thresholds}): node eines/llindars-maduracio.mjs --calcula`);
  const worlds = (p.cohort ? agedCandidates(name, { root }) : p.worlds).map((world) => {
    const o = origin(name, world, { root });
    return { world, role: roleOf(p, world), start: o.start, capture: o.capture, repartimentSha256: o.sha256 };
  });
  // 1. L'envelliment (la maduració i la sèrie): validat sencer, i amb el mateix simulador que ara
  if (aged(name)) {
    const problems = [], codes = new Set();
    for (const w of worlds) {
      const a = validateAging(w.world, { root, name });
      problems.push(...a.problems);
      if (!a.problems.length) { Object.assign(w, a.status); w.aging = { file: a.file, sha256: a.sha256, code: a.code }; codes.add(a.code); }
    }
    for (const c of codes) problems.push(...simulatorProblems(c, { root }));
    if (problems.length) fail(`l'envelliment no és el que toca (${problems.length} problemes):\n- ${problems.slice(0, 20).join('\n- ')}`);
    // l'escaneig d'herència de totes les cel·les a l'edat (AUD-111): s'exclou el món si hi ha alguna cel·la hereditària
    if (p.cohort) {
      // la sèrie: els primers mons de la llista que hi entren, fins a tenir-ne cohort.size. S'escanegen per rondes, tants
      // com en falten, i no se n'escaneja cap de més. Els que vénen després del darrer no van al manifest
      let i = 0, included = 0;
      while (included < p.cohort.size && i < worlds.length) {
        const batch = [];
        while (batch.length < p.cohort.size - included && i < worlds.length) { const w = worlds[i++]; if (w.included) batch.push(w); }
        for (const w of batch) mkdirSync(join(root, p.folder, 'alicuotes', w.world), { recursive: true });
        console.log(`L'escaneig de ${batch.length} mons envellits:`);
        await runPool(batch.map((w) => scanJob(p, w)), parallel, root);
        for (const w of batch) { excludeIfHeritable(p, w, root); if (w.included) included++; }
      }
      if (included < p.cohort.size) fail(`hi ha ${included} mons inclosos, i en calen ${p.cohort.size}: cal envellir els següents de la llista, en ordre (node eines/pilot.mjs ${name} --envelliment --mons N)`);
      worlds.splice(i);
    } else {
      const candidates = worlds.filter((w) => w.included);
      for (const w of candidates) mkdirSync(join(root, p.folder, 'alicuotes', w.world), { recursive: true });
      console.log(`L'escaneig dels ${candidates.length} mons envellits:`);
      await runPool(candidates.map((w) => scanJob(p, w)), parallel, root);
      for (const w of candidates) excludeIfHeritable(p, w, root);
    }
  } else worlds.forEach((w) => { w.included = true; });
  const included = worlds.filter((w) => w.included);
  if (!included.length) fail('no hi ha cap món inclòs');
  for (const w of included) {
    w.captureSha256 = shaFile(root, w.capture);
    if (w.repartimentSha256 && w.repartimentSha256 !== w.captureSha256) fail(`${w.capture} no té la SHA-256 del repartiment de B2`);
    mkdirSync(join(root, p.folder, 'alicuotes', w.world), { recursive: true });
  }
  // 2. Les transformacions, i 3. l'escaneig de cada captura transformada: el punt de partida de cada braç (AUD-116)
  console.log(`Les ${included.length * p.arms.length} transformacions:`);
  await runPool(included.flatMap((w) => p.arms.map((arm) => ({ label: `${w.world} ${arm}`, args: ['--from', w.capture, '--kind', arm, '--seed', String(seedOf(w.world) + TRANSFORM_OFFSET), '--out', armPath(p, w.world, arm)] }))), parallel, root);
  console.log(`Els ${included.length * p.arms.length} escanejos de les captures transformades:`);
  await runPool(included.flatMap((w) => p.arms.map((arm) => ({ label: `escaneig de ${w.world} ${arm}`, args: ['--scan', '--from', armPath(p, w.world, arm), '--seed', String(seedOf(w.world) + TRANSFORM_OFFSET), '--width', String(COMMON.world[0]), '--radius', String(COMMON.radius), '--out', scanPath(p, w.world, arm)] }))), parallel, root);
  for (const w of included) {
    w.arms = {};
    for (const arm of p.arms) {
      const file = armPath(p, w.world, arm), recFile = file.replace(/\.bin$/, '.json');
      const rec = JSON.parse(readFileSync(join(root, recFile), 'utf8'));
      w.arms[arm] = { file, sha256: rec.outSha256, record: { file: recFile, sha256: shaFile(root, recFile) }, changed: rec.changed, scope: rec.scope, scan: scanRecord(root, scanPath(p, w.world, arm)) };
    }
  }
  // 4. Les branques i les llistes de les dues màquines (els mons inclosos, repartits amb machineOf), i el manifest
  const branches = included.flatMap((w) => branchList(name, w));
  const lists = {};
  for (const machine of ['pc', 'vm']) {
    const lines = included.filter((_, i) => machineOf(name, i) === machine).flatMap((w) => branchLines(name, w));
    const file = `${p.folder}/llista-${machine}.txt`;
    writeFileSync(join(root, file), lines.join('\n') + '\n', { flag: 'wx' });
    lists[machine] = { file, sha256: shaFile(root, file), branches: lines.length };
  }
  for (const w of worlds) delete w.repartimentSha256;
  const manifest = {
    pilot: name, design: p.protocol ?? 'docs/pilot-maduracio.md', code, node: process.version, date: new Date().toISOString(),
    ...(p.tag ? { tag: p.tag, dir: `${p.folder}/branques`, test: p.test } : {}),
    params: designParams(name), worlds, branches, lists,
  };
  writeFileSync(join(root, manifestPath), JSON.stringify(manifest, null, 1) + '\n', { flag: 'wx' });
  console.log(`manifest: ${manifestPath}; ${included.length} mons inclosos de ${worlds.length}, ${branches.length} branques`);
}

// El manifest contra el disseny, i totes les captures, registres i escanejos contra el manifest. Amb una màquina, només
// les captures (els .bin) dels mons de la seva llista; els registres i els escanejos, que van a git, de tots. Retorna la
// llista de problemes (buida si tot és correcte)
export function checkCaptures(name, { root = ROOT, machine = null } = {}) {
  try { return captureProblems(name, root, machine); } catch (e) { return [`el manifest no té l'estructura esperada (${e.message})`]; }
}
function captureProblems(name, root, machine) {
  const p = PILOTS[name], problems = [], q = (m) => problems.push(m);
  const manifestPath = join(root, p.folder, 'manifest.json');
  if (!existsSync(manifestPath)) return [`no hi ha cap manifest a ${p.folder}`];
  let m;
  try { m = JSON.parse(readFileSync(manifestPath, 'utf8')); } catch { return ['el manifest no es pot llegir']; }
  // el contracte del disseny (AU2-84): el pilot, els paràmetres, els mons i el seu paper, i les branques
  if (m.pilot !== name) q(`el manifest és del pilot ${m.pilot}, no de ${name}`);
  if (!same(m.params, designParams(name))) q('els paràmetres del manifest no són els del disseny');
  if (p.tag && (m.tag !== p.tag || m.dir !== `${p.folder}/branques` || !same(m.test, p.test))) q("l'etiqueta, la carpeta o la prova del manifest no són les del disseny");
  if (p.cohort) {
    // la sèrie: els primers mons de la llista, en ordre, fins al darrer inclòs, i exactament cohort.size d'inclosos
    const ids = Array.isArray(m.worlds) ? m.worlds.map((w) => w.world) : [];
    if (!ids.length || !same(ids, p.candidates.slice(0, ids.length))) return [...problems, 'els mons del manifest no són els primers de la llista de la sèrie, en el seu ordre'];
    const n = m.worlds.filter((w) => w.included === true).length;
    if (n !== p.cohort.size) q(`el manifest té ${n} mons inclosos, i la sèrie n'ha de tenir ${p.cohort.size}`);
    if (m.worlds[m.worlds.length - 1].included !== true) q("la llista dels mons del manifest no acaba al darrer món inclòs");
  } else if (!Array.isArray(m.worlds) || !same(m.worlds.map((w) => w.world), p.worlds)) return [...problems, `els mons del manifest no són exactament els ${p.worlds.length} del disseny, en el seu ordre`];
  const included = m.worlds.filter((w) => w.included === true);
  if (!included.length) q('el manifest no té cap món inclòs');
  // amb una màquina, els mons de la seva llista (l'identificador de cada branca comença pel del món)
  let only = null;
  if (machine) {
    const l = m.lists?.[machine];
    if (!l || l.file !== `${p.folder}/llista-${machine}.txt` || !existsSync(join(root, l.file))) return [...problems, `falta la llista ${machine}`];
    only = new Set(readFileSync(join(root, l.file), 'utf8').split('\n').filter(Boolean).map((line) => line.split(' ')[0].split('-')[0]));
  }
  const seen = new Set(), paths = (f) => { if (seen.has(f)) q(`el camí ${f} es repeteix`); seen.add(f); };
  for (const w of m.worlds) {
    const need = !only || only.has(w.world);
    if (w.role !== roleOf(p, w.world)) q(`${w.world}: el paper és "${w.role}", i el disseny diu "${roleOf(p, w.world)}"`);
    const o = origin(name, w.world, { root });
    if (w.capture !== o.capture || w.start !== o.start) { q(`${w.world}: la captura d'origen o l'època no són les del disseny`); continue; }
    if (aged(name)) {
      // l'envelliment, tornat a validar, i el seu registre, el del manifest
      const a = validateAging(w.world, { root, name, needCapture: need });
      if (a.problems.length) { q(`${w.world}: ${a.problems[0]}`); continue; }
      if (!w.aging || w.aging.file !== a.file || w.aging.sha256 !== a.sha256 || w.aging.code !== a.code) q(`${w.world}: el registre de l'envelliment no és el del manifest`);
      if (!a.status.included) { if (w.included || w.reason !== a.status.reason) q(`${w.world}: l'exclusió no és la que dona l'envelliment`); continue; }
      if (!w.scan || w.scan.file !== scanPath(p, w.world) || !existsSync(join(root, w.scan.file)) || shaFile(root, w.scan.file) !== w.scan.sha256) { q(`${w.world}: l'escaneig de l'edat no és el del manifest`); continue; }
      const s = JSON.parse(readFileSync(join(root, w.scan.file), 'utf8'));
      if (s.from !== w.capture || s.seed !== seedOf(w.world) + TRANSFORM_OFFSET || s.heritable !== w.scan.heritable || s.code !== m.code) q(`${w.world}: l'escaneig de l'edat no és el de la captura envellida`);
      // la captura de l'escaneig, per la SHA-256 (auditor 1, auditoria 20): la del manifest, si el món hi entra, i la del disc,
      // si se'n miren les captures
      else if ((w.included && s.fromSha256 !== w.captureSha256) || (need && existsSync(join(root, w.capture)) && s.fromSha256 !== shaFile(root, w.capture))) q(`${w.world}: l'escaneig de l'edat no és de la captura d'origen (SHA-256)`);
      if (w.included !== (s.heritable === 0)) q(`${w.world}: la inclusió no és la que dona l'escaneig`);
      else if (!w.included && w.reason !== `${s.heritable} cel·les hereditàries a l'escaneig de l'època ${p.age}`) q(`${w.world}: la raó de l'exclusió no és la que dona l'escaneig`);
    } else if (w.included !== true) q(`${w.world}: als zeros, tots els mons hi entren`);
    if (!w.included) continue;
    if (need) {
      if (!existsSync(join(root, w.capture))) { q(`${w.world}: no hi ha la captura d'origen ${w.capture}`); continue; }
      const captureSha = shaFile(root, w.capture);
      if (captureSha !== w.captureSha256) q(`${w.world}: la captura d'origen no té la SHA-256 del manifest`);
      if (o.sha256 && o.sha256 !== captureSha) q(`${w.world}: la captura d'origen no té la SHA-256 del repartiment de B2`);
    }
    paths(w.capture);
    for (const arm of p.arms) {
      const a = w.arms?.[arm];
      if (!a) { q(`${w.world}: falta el braç ${arm}`); continue; }
      if (a.file !== armPath(p, w.world, arm)) q(`${w.world} ${arm}: el camí de la captura no és el del disseny`);
      paths(a.file);
      if (need) {
        if (!existsSync(join(root, a.file))) { q(`${w.world} ${arm}: no hi ha ${a.file}`); continue; }
        if (shaFile(root, a.file) !== a.sha256) q(`${w.world} ${arm}: la captura transformada no té la SHA-256 del manifest`);
      }
      if (!a.record || !existsSync(join(root, a.record.file)) || shaFile(root, a.record.file) !== a.record.sha256) { q(`${w.world} ${arm}: el registre de la transformació no és el del manifest`); continue; }
      const rec = JSON.parse(readFileSync(join(root, a.record.file), 'utf8'));
      // la procedència (AU2-88): d'on ve, on va, amb quina llavor, amb quin món i amb quin codi
      const want = { from: w.capture, fromSha256: w.captureSha256, out: a.file, outSha256: a.sha256, kind: arm, seed: seedOf(w.world) + TRANSFORM_OFFSET, width: COMMON.world[0], radius: COMMON.radius, code: m.code, invariants: 'correctes' };
      for (const [k, v] of Object.entries(want)) if (!same(rec[k], v)) q(`${w.world} ${arm}: el registre de la transformació diu ${k} = ${JSON.stringify(rec[k])}, i hauria de ser ${JSON.stringify(v)}`);
      if (!a.scan || a.scan.file !== scanPath(p, w.world, arm) || !existsSync(join(root, a.scan.file)) || shaFile(root, a.scan.file) !== a.scan.sha256) { q(`${w.world} ${arm}: l'escaneig del braç no és el del manifest`); continue; }
      const s = JSON.parse(readFileSync(join(root, a.scan.file), 'utf8'));
      if (s.from !== a.file || s.fromSha256 !== a.sha256 || s.seed !== seedOf(w.world) + TRANSFORM_OFFSET || s.heritable !== a.scan.heritable || s.heritableSolo !== a.scan.heritableSolo || s.cells !== a.scan.cells) q(`${w.world} ${arm}: l'escaneig no és el de la captura transformada`);
    }
  }
  // les branques i les llistes: exactament els mons inclosos × els braços × les llavors
  const want = included.flatMap((w) => branchList(name, w));
  if (!same(m.branches, want)) q('les branques del manifest no són les dels mons inclosos, els braços i les llavors del disseny');
  const lines = [];
  for (const machine of ['pc', 'vm']) {
    const l = m.lists?.[machine];
    if (!l || l.file !== `${p.folder}/llista-${machine}.txt` || !existsSync(join(root, l.file))) { q(`falta la llista ${machine}`); continue; }
    if (shaFile(root, l.file) !== l.sha256) q(`la llista ${machine} no té la SHA-256 del manifest`);
    const own = readFileSync(join(root, l.file), 'utf8').split('\n').filter(Boolean);
    // la seva part dels mons inclosos, la de machineOf, en ordre (AU2-97)
    const part = included.filter((_, i) => machineOf(name, i) === machine).flatMap((w) => branchLines(name, w));
    if (!same(own, part) || l.branches !== part.length) q(`la llista ${machine} no és exactament la seva part dels mons inclosos (${own.length} branques, i n'hi han de ser ${part.length})`);
    lines.push(...own);
  }
  const expectedLines = included.flatMap((w) => branchLines(name, w));
  if (!same([...lines].sort(), [...expectedLines].sort())) q('les llistes no són exactament les branques del manifest');
  return problems;
}

// La comprovació prèvia: les captures (amb una màquina, les dels mons de la seva llista) i, a més, que cap branca no hagi
// començat
export function preflight(name, { root = ROOT, machine = null } = {}) {
  const problems = checkCaptures(name, { root, machine });
  if (problems.length) return problems;
  const m = JSON.parse(readFileSync(join(root, PILOTS[name].folder, 'manifest.json'), 'utf8'));
  for (const b of m.branches) {
    const json = b.command.match(/--json (\S+)/)[1];
    try { lstatSync(join(root, json)); problems.push(`la branca ${b.id} ja ha començat (${json})`); } catch { /* encara no */ }
  }
  return problems;
}

async function main(argv) {
  const [name, mode, ...rest] = argv;
  const modes = ['--envelliment', '--prepara', '--comprova', '--comprova-captures'];
  const usage = 'Ús: node eines/pilot.mjs maduracio|zeros|serie --envelliment [--mons N]|--prepara [--paral·lel N]|--comprova [--maquina pc|vm]|--comprova-captures [--maquina pc|vm]';
  if (!PILOTS[name] || !modes.includes(mode)) fail(usage, 2);
  // les opcions de cada mode: --paral·lel a --prepara, --mons a l'envelliment de la sèrie, i --maquina a les comprovacions
  const allowed = { '--prepara': ['--paral·lel', /^[1-9]\d?$/], '--envelliment': ['--mons', /^[1-9]\d{0,2}$/], '--comprova': ['--maquina', /^(pc|vm)$/], '--comprova-captures': ['--maquina', /^(pc|vm)$/] }[mode];
  let value = null;
  if (rest.length) {
    if (!allowed || rest.length !== 2 || rest[0] !== allowed[0] || !allowed[1].test(rest[1]) || (mode === '--envelliment' && name !== 'serie')) fail(usage, 2);
    value = rest[1];
  }
  if (mode === '--envelliment') {
    if (!aged(name)) fail("només la maduració i la sèrie tenen envelliment", 2);
    const p = PILOTS[name], count = value === null ? (p.aging ?? p.worlds.length) : Number(value);
    if (p.candidates && count > p.candidates.length) fail(`la llista de la sèrie té ${p.candidates.length} mons`, 2);
    console.log((p.candidates ? p.candidates.slice(0, count) : p.worlds).map((w) => agingLine(w, name)).join('\n'));
  } else if (mode === '--prepara') {
    try { await prepare(name, { parallel: value === null ? 6 : Number(value) }); } catch (e) { fail(e.message); }
  } else {
    const problems = mode === '--comprova' ? preflight(name, { machine: value }) : checkCaptures(name, { machine: value });
    const what = `${mode === '--comprova' ? 'La comprovació prèvia' : 'La comprovació de les captures'}${value ? ` (${value})` : ''}`;
    if (problems.length) { console.log(`${what} ha trobat ${problems.length} problemes:\n- ${problems.slice(0, 30).join('\n- ')}`); process.exit(1); }
    console.log(`${what} del pilot ${name}: tot correcte.`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main(process.argv.slice(2));
