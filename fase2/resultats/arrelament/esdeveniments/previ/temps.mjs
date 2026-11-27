// A record of copy events (exploratory): the time and the memory, in a test world the size of the pilot's (512 × 256, radius 2, the
// pilot's mutation rate), with the replicator of Phase 1 planted at epoch 10: the epochs with no cell followed, a checkpoint, and the
// chains of 20 heritable cells at epoch 400 with the window from 0 (K = 2 and K = 4). Random bytes only: no world of the project.
//
//   node fase2/resultats/arrelament/esdeveniments/previ/temps.mjs
import { PROGRAM_SIZE } from '../../../../../fase1/bff.js';
import { makeRng } from '../../../../../fase1/soup.js';
import { createWorld, createReplayer } from '../mon.mjs';
import { createHeritability, createHistory, chain } from '../cadena.mjs';

const P = PROGRAM_SIZE, W = 512, H = 256, E = 400, seed = 3500000501;
const R1 = Uint8Array.from([140,221,0,221,20,164,126,32,105,126,78,173,241,242,207,220,199,45,213,101,52,91,155,79,44,60,2,125,93,71,65,217,65,5,71,141,93,141,15,5,65,217,15,71,93,125,2,60,44,79,155,91,52,101,213,45,0,0,62,82,0,77,77,0]);
const r = makeRng(seed, 'v2');
const soup = Uint8Array.from({ length: W * H * P }, () => (r() * 256) | 0);
const X = 128 * W + 256;
const world = createWorld({ soup, width: W, height: H, radius: 2, mutation: 0.00024, seed: seed + 1, inject: (e) => (e === 10 ? Array.from(R1, (v, j) => [X * P + j, v]) : null) });
const cps = new Map([[0, world.checkpoint()]]);
let t = Date.now();
for (let e = 1; e <= E; e++) { world.step(); if (e % 50 === 0) cps.set(e, world.checkpoint()); }
const perEpoch = (Date.now() - t) / E;
console.log(`epochs, no cell followed: ${perEpoch.toFixed(1)} ms each; ${cps.size} checkpoints; memory ${Math.round(process.memoryUsage().rss / 1048576)} MB`);
const her = createHeritability();
const heads = [];
const rr = makeRng(seed + 7, 'v2');
const cand = [];
for (let dy = -40; dy <= 40; dy++) for (let dx = -40; dx <= 40; dx++) cand.push(X + dy * W + dx);
t = Date.now();
for (const c of cand) if (her(soup.subarray(c * P, c * P + P))) heads.push(c);
console.log(`heritable cells within 40 of the planting at ${E}: ${heads.length} (${((Date.now() - t) / cand.length).toFixed(2)} ms per test)`);
const pick = [];
while (pick.length < Math.min(20, heads.length)) { const c = heads[(rr() * heads.length) | 0]; if (!pick.includes(c)) pick.push(c); }
const { replay, stats } = createReplayer(world, cps);
const h = createHistory({ replay, width: W, height: H, radius: 4, step: 50 });
for (const k of [2, 4]) {
  t = Date.now();
  const before = { replays: stats.replays, tests: her.tests() };
  const ends = new Map();
  for (const c of pick) { const ch = chain(h, her, { cell: c, e: E, ph: 'I' }, 0, null, k); const key = ch.end === 'birth' ? `birth ${ch.cell}@${ch.epoch}` : ch.end; ends.set(key, (ends.get(key) ?? 0) + 1); }
  console.log(`K = ${k}: ${pick.length} chains in ${((Date.now() - t) / 1000).toFixed(0)} s; ${stats.replays - before.replays} replays (${(stats.epochs / Math.max(1, stats.replays)).toFixed(0)} epochs each), ${her.tests() - before.tests} tests; ends: ${[...ends].map(([a, b]) => `${a}: ${b}`).join('; ')}`);
}
console.log(`replays in all: ${stats.replays}, ${((stats.epochs * perEpoch) / 1000).toFixed(0)} s of epochs at the plain speed; memory ${Math.round(process.memoryUsage().rss / 1048576)} MB`);
