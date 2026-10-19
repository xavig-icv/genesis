// Genera el manifest de la sèrie preregistrada de B2 (fase2/serie-b2.json) a partir del repartiment dels mons
// (fase2/resultats/b2/repartiment.json) i dels paràmetres del protocol (docs/protocol-b2.md). Amb les mateixes
// opcions dona sempre el mateix manifest: el repartiment de les màquines i els noms opacs surten de llavors
// declarades, amb el generador v2.
//
//   node eines/b2-manifest.mjs [--disseny i|ii] [--estat esborrany|final] [--sortida fase2/serie-b2.json]
//
// Els dissenys (protocol §4):
//   i:  totes les branques amb H = 5.000 i K = 2; la prova del canvi de règim, amb les dues llavors a 5.000
//   ii: la condició d'origen amb H = 6.000 i K = 2, la de canvi amb H = 4.000 i K = 1; la prova del canvi de
//       règim, a 4.000 amb la primera llavor de cada condició
// Les dues proves confirmatòries (el canvi de règim i l'expansió amb corrent) es corregeixen amb Holm.
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { makeRng } from '../fase1/soup.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const SEEDS = { machines: 20261021, names: 20261023, bootstrap: 20261022 };
const OFFSETS = [200000, 300000];
// La prova de l'expansió fa servir totes les llavors de cada condició, i els 8 primers censos (t + 250 a t + 2.000)
const DESIGNS = {
  i: { origen: { H: 5000, K: 2 }, canvi: { H: 5000, K: 2 }, regime: { horizon: 5000, seedsOrigin: [0, 1], seedsSwitch: [0, 1] }, spread: { seedsOrigin: [0, 1], seedsSwitch: [0, 1] } },
  ii: { origen: { H: 6000, K: 2 }, canvi: { H: 4000, K: 1 }, regime: { horizon: 4000, seedsOrigin: [0], seedsSwitch: [0] }, spread: { seedsOrigin: [0, 1], seedsSwitch: [0] } },
};
const ORIGIN_MIXING = { A: 0, B: 0.01 };

function shuffle(items, seed) {
  const rng = makeRng(seed, 'v2'), a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function buildManifest({ design = 'i', estat = 'esborrany' } = {}) {
  const D = DESIGNS[design];
  if (!D) throw new Error(`disseny desconegut: ${design}`);
  const split = JSON.parse(readFileSync(join(root, 'fase2', 'resultats', 'b2', 'repartiment.json'), 'utf8'));
  const conf = split.worlds.filter((w) => w.part === 'confirmacio').sort((a, b) => a.group.localeCompare(b.group) || a.seed - b.seed);
  // Les màquines: dins de cada origen, els mons barrejats i alternats entre el PC i la màquina virtual
  const machine = new Map();
  for (const g of ['A', 'B']) shuffle(conf.filter((w) => w.group === g), SEEDS.machines + (g === 'B' ? 1 : 0))
    .forEach((w, i) => machine.set(`${w.group}${w.seed}`, i % 2 === 0 ? 'pc' : 'vm'));
  const worlds = conf.map((w) => ({ id: `${w.group}${w.seed}`, group: w.group, seed: w.seed, t: w.t, capture: w.capture, sha256: w.sha256, machine: machine.get(`${w.group}${w.seed}`) }));
  const branches = [];
  for (const w of worlds) {
    for (const cond of ['origen', 'canvi']) {
      const mixing = cond === 'origen' ? ORIGIN_MIXING[w.group] : ORIGIN_MIXING[w.group === 'A' ? 'B' : 'A'];
      for (let k = 0; k < D[cond].K; k++) branches.push({ world: w.id, cond, mixing, k, seed: w.seed + OFFSETS[k], H: D[cond].H });
    }
  }
  // Els noms opacs: en un ordre barrejat, b001, b002...
  shuffle(branches.map((_, i) => i), SEEDS.names).forEach((idx, i) => { branches[idx].name = `b${String(i + 1).padStart(3, '0')}`; });
  return {
    name: 'B2 · quant dura la vida establerta',
    estat, tag: 'preregistre-b2', protocol: 'docs/protocol-b2.md', dir: 'fase2/resultats/b2/confirmacio', design,
    params: { world: [512, 256], radius: 2, rng: 'v2', every: 100, mutation: 0.00024, census: { version: 'v3', every: 250, sample: 2048, seed: 20261016 } },
    rule: { lossMax: 5, recoverMin: 21 },
    tests: {
      method: 'holm', alpha: 0.025,
      regime: { ...D.regime, sided: 'unilateral' },
      spread: { censuses: 8, ...D.spread, sided: 'unilateral' },
    },
    bootstrap: { reps: 10000, seed: SEEDS.bootstrap, interval: 'bca', level: 0.95 },
    machines: { names: ['pc', 'vm'], seed: SEEDS.machines },
    names: { seed: SEEDS.names },
    worlds,
    branches: branches.sort((a, b) => a.name.localeCompare(b.name)),
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const opt = (name, def) => { const i = args.indexOf(name); return i < 0 ? def : args[i + 1]; };
  const out = opt('--sortida', 'fase2/serie-b2.json');
  const m = buildManifest({ design: opt('--disseny', 'i'), estat: opt('--estat', 'esborrany') });
  writeFileSync(join(root, out), JSON.stringify(m, null, 1) + '\n');
  const per = (k) => m.branches.filter((b) => m.worlds.find((w) => w.id === b.world).machine === k).length;
  console.log(`${out}: disseny ${m.design}, ${m.estat}; ${m.worlds.length} mons, ${m.branches.length} branques (pc ${per('pc')}, vm ${per('vm')})`);
}
