// Simulació sense gràfics, per a experiments llargs. Serveix per a totes les fases.
//
// Sopa barrejada (Fase 1):  node sim.mjs --seed 1 --epochs 16000
// Món 2D (Fase 2a):         node sim.mjs --world 512x256 --seed 1 --epochs 16000
//
// Opcions:
//   --log2size N     mida de la sopa barrejada (2^N programes, per defecte 17)
//   --world WxH      món 2D de W×H cel·les (en lloc de la sopa barrejada)
//   --radius R       distància màxima entre veïns al món 2D (per defecte 2)
//   --mixing M       llei 2: fracció de cel·les que el corrent barreja cada època (0 = quiet, 1 = sopa)
//   --diffusion D    llei 2: intercanvis amb un veí del costat per cel·la i època
//   --flow F         llei 3: riu d'esquerra a dreta, F columnes per època (material nou per l'esquerra)
//   --renewal R      llei 3: fracció de cel·les substituïdes per material nou cada època
//   --from fitxer    comença des d'un món desat (.bin) en lloc d'un de nou (experiments de branca)
//   --start N        època del món desat (per numerar les èpoques a partir d'aquí)
//   --census N       món 2D: cens de famílies de replicadors cada N èpoques (per defecte 250)
//   --mutation P     probabilitat de mutació per byte i època (per defecte 0.00024)
//   --every N        cada quantes èpoques es mesura (per defecte 100)
//   --threshold H    entropia d'ordre superior que marca la transició (per defecte 1.0)
//   --after N        èpoques a seguir després de la transició (per defecte 300)
//   --chunks K       sopa barrejada: imita el navegador amb K fils (mateixa història)
//   --save carpeta   desa la sopa en la transició i al final (.bin)
//   --save-every N   i també cada N èpoques
import { deflateRawSync } from 'zlib';
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { PROGRAM_SIZE, TAPE_SIZE, runPairs } from './fase1/bff.js';
import {
  DEFAULT_MUTATION, createRng, randomSoup, shuffle, gather, scatter,
  mutate, shannonEntropy, higherOrderEntropy, topPrograms,
} from './fase1/soup.js';
import { topMotifs, DATA } from './fase1/motifs.js';
import { pairNeighbors, applyCurrents, applyFlow, DEFAULT_RADIUS } from './fase2/world.js';
import { createFamilyTracker } from './fase2/families.js';

// Quina versió del codi fa aquest experiment (per a la traçabilitat dels resultats):
// el commit de git, amb "+canvis" si el codi té canvis sense desar; o, si no hi ha git
// (a la màquina virtual), el fitxer VERSIO que s'hi escriu en copiar-hi el codi.
function codeVersion() {
  const here = fileURLToPath(new URL('.', import.meta.url));
  const run = (cmd) => execSync(cmd, { cwd: here, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  try {
    const hash = run('git rev-parse --short HEAD');
    return hash + (run('git status --porcelain -- "*.js" "*.mjs"') ? '+canvis' : '');
  } catch {
    try { return readFileSync(join(here, 'VERSIO'), 'utf8').trim(); } catch { return 'desconeguda'; }
  }
}

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const seed = Number(args.seed ?? 1);
const world = args.world ? args.world.split('x').map(Number) : null; // [amplada, alçada] o null
const radius = Number(args.radius ?? DEFAULT_RADIUS);
const mixing = Number(args.mixing ?? 0);
const diffusion = Number(args.diffusion ?? 0);
const flow = Number(args.flow ?? 0);
const renewal = Number(args.renewal ?? 0);
const from = args.from ?? null;
const start = Number(args.start ?? 0);
const censusEvery = Number(args.census ?? 250);
const nPrograms = world ? world[0] * world[1] : 1 << Number(args.log2size ?? 17);
const maxEpochs = Number(args.epochs ?? 16000);
const mutation = Number(args.mutation ?? DEFAULT_MUTATION);
const logEvery = Number(args.every ?? 100);
const threshold = Number(args.threshold ?? 1.0);
const afterTransition = Number(args.after ?? 300);
const chunks = Number(args.chunks ?? 0);
const saveEvery = Number(args['save-every'] ?? 0);
const saveDir = args.save ?? null;
if (saveDir) mkdirSync(saveDir, { recursive: true });
const lawsTag = (mixing ? `-m${mixing}` : '') + (diffusion ? `-d${diffusion}` : '') + (flow ? `-f${flow}` : '') + (renewal ? `-n${renewal}` : '');
const branchTag = from ? `-des${start}` : '';
const tag = world ? `mon${world[0]}x${world[1]}-r${radius}${lawsTag}${branchTag}-` : chunks ? `fils${chunks}-` : '';
const save = (name) => saveDir && writeFileSync(join(saveDir, `llavor${seed}-${tag}${name}.bin`), soup);

const rng = createRng(seed);
let soup;
if (from) {
  soup = new Uint8Array(readFileSync(from));
  if (soup.length !== nPrograms * PROGRAM_SIZE) throw new Error(`${from} no té la mida d'aquest món`);
} else soup = randomSoup(nPrograms, rng);
const flowState = { carry: 0 };
const order = new Uint32Array(nPrograms).map((_, i) => i);
const taken = new Uint8Array(nPrograms);
const pairIdx = new Uint32Array(nPrograms);
const pairs = new Uint8Array((nPrograms / 2) * TAPE_SIZE);
const scratch = world && mixing > 0 ? new Uint32Array(nPrograms * (PROGRAM_SIZE / 4)) : null;
const pool = world && mixing > 0 ? new Uint32Array(nPrograms) : null;
const tracker = world ? createFamilyTracker() : null;

// Una època de la sopa barrejada: tothom té parella.
function soupEpoch() {
  const nPairs = nPrograms / 2;
  shuffle(order, rng);
  gather(soup, order, pairs, 0, nPairs);
  if (chunks > 0) {
    const per = Math.ceil(nPairs / chunks);
    for (let i = 0; i < chunks; i++) {
      const count = Math.min(per, nPairs - i * per);
      if (count <= 0) break;
      const part = pairs.subarray(i * per * TAPE_SIZE, (i * per + count) * TAPE_SIZE);
      mutate(part, part.length, mutation, createRng((rng() * 4294967296) >>> 0));
    }
  } else mutate(pairs, nPairs * TAPE_SIZE, mutation, rng);
  const ops = runPairs(pairs, nPairs);
  scatter(soup, order, pairs, 0, nPairs);
  return { ops, runs: nPairs };
}

// Una època del món 2D: corrents, parelles de veïns i mutacions a tot el mapa.
// (Igual que fase2/main.js, perquè navegador i Node facin la mateixa història.)
function worldEpoch() {
  applyCurrents(soup, world[0], world[1], mixing, diffusion, rng, scratch, pool);
  applyFlow(soup, world[0], world[1], flow, renewal, rng, flowState);
  shuffle(order, rng);
  const nPairs = pairNeighbors(order, taken, pairIdx, world[0], world[1], radius, rng);
  mutate(soup, soup.length, mutation, rng);
  gather(soup, pairIdx, pairs, 0, nPairs);
  const ops = runPairs(pairs, nPairs);
  scatter(soup, pairIdx, pairs, 0, nPairs);
  return { ops, runs: nPairs };
}

const isOp = (v) => '<>{}-+.,[]'.includes(String.fromCharCode(v));
const glyph = (v) => (isOp(v) ? String.fromCharCode(v) : v === 0 ? '0' : `#${v}`); // byte real
const skelGlyph = (v) => (v === DATA ? '·' : glyph(v)); // esquelet d'un fragment
const opcodeString = (p) => Array.from(soup.subarray(p * PROGRAM_SIZE, (p + 1) * PROGRAM_SIZE), (c) => (isOp(c) ? String.fromCharCode(c) : c === 0 ? '0' : ' ')).join('');

// Els tres valors de byte més freqüents, en percentatge.
function topBytes() {
  const counts = new Float64Array(256);
  for (let i = 0; i < soup.length; i++) counts[soup[i]]++;
  return [...counts.keys()].sort((a, b) => counts[b] - counts[a]).slice(0, 3)
    .map((v) => `${glyph(v)}:${((counts[v] / soup.length) * 100).toFixed(1)}%`).join(' ');
}

console.log(`codi=${codeVersion()}  ordre=node sim.mjs ${process.argv.slice(2).join(' ')}`);
console.log(`llavor=${seed} ${world ? `món=${world[0]}x${world[1]} radi=${radius} barreja=${mixing} difusió=${diffusion} riu=${flow} renovació=${renewal}` : `sopa=${nPrograms}`} mutació=${mutation}${from ? ` des de=${from} (època ${start})` : ''}`);
const t0 = Date.now();
let ops = 0, runs = 0, transitionAt = -1, firstFamilyAt = -1;
for (let epoch = start + 1; epoch <= maxEpochs; epoch++) {
  const r = world ? worldEpoch() : soupEpoch();
  ops += r.ops;
  runs += r.runs;
  if (saveEvery && epoch % saveEvery === 0) save(`epoca${epoch}`);

  // Cens: famílies de replicadors (amb la prova de replicació), encara que siguin locals
  if (tracker && epoch % censusEvery === 0) {
    const census = tracker.analyse(soup, nPrograms, epoch, world[0]);
    if (census.families.length && firstFamilyAt < 0) {
      firstFamilyAt = epoch;
      console.log(`*** PRIMERA FAMÍLIA a l'època ${epoch} ***`);
      save(`familia${epoch}`);
    }
    const fams = census.families.map((f) => `#${f.id}:${(f.share * 100).toFixed(2)}%(${f.core})`).join(' ');
    console.log(`cens ${epoch}  es repliquen=${(census.alive * 100).toFixed(1)}%  famílies=${census.families.length}${fams ? `  ${fams}` : ''}${census.extinct.length ? `  extingides=${census.extinct.join(',')}` : ''}`);
  }

  if (epoch % logEvery === 0) {
    const h0 = shannonEntropy(soup);
    const hoe = higherOrderEntropy(h0, deflateRawSync(soup).length, soup.length);
    const secs = ((Date.now() - t0) / 1000).toFixed(0);
    const motifs = topMotifs(soup, nPrograms, 3)
      .map((m) => `${Array.from(m.bytes, skelGlyph).join('')} (${(m.share * 100).toFixed(1)}%)`).join('  ');
    console.log(`època ${epoch}  H0=${h0.toFixed(3)}  HOE=${hoe.toFixed(3)}  ops/execució=${(ops / runs).toFixed(1)}  parelles=${(runs / (logEvery * nPrograms / 2) * 100).toFixed(0)}%  bytes ${topBytes()}  fragments ${motifs || '–'}  ${secs}s`);
    ops = runs = 0;
    if (transitionAt < 0 && hoe > threshold) {
      transitionAt = epoch;
      console.log(`*** HOE > ${threshold} a l'època ${epoch} ***`);
      save(`epoca${epoch}`);
    }
    if (transitionAt > 0 && epoch - transitionAt >= afterTransition) break;
  }
}
save('final');
// Empremta del món final (FNV-1a): serveix per comprovar que el navegador fa la mateixa història
let hash = 0x811c9dc5;
for (let i = 0; i < soup.length; i++) hash = Math.imul(hash ^ soup[i], 0x01000193);
console.log(`\nempremta del món: ${(hash >>> 0).toString(16)}`);
const { distinct, top } = topPrograms(soup, nPrograms, 5);
console.log(`\nprogrames diferents: ${distinct} de ${nPrograms}`);
for (const { count, index } of top) console.log(`${String(count).padStart(7)}  |${opcodeString(index)}|`);
