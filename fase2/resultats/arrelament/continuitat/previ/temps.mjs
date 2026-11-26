// Before the note (previ/): how long the analysis's controls take for one census and context, on a large test world (random bytes and the
// replicator of Phase 1, as prova.mjs; no world of the project). Not part of the note's pipeline.
//   node fase2/resultats/arrelament/continuitat/previ/temps.mjs
import { PROGRAM_SIZE } from '../../../../../fase1/bff.js';
import { makeRng } from '../../../../../fase1/soup.js';
import { Observer } from '../../registre-copies/traca.mjs';
import { createWorld } from '../../registre-copies/mon.mjs';
import { Tracer } from '../../descendencia/traca.mjs';
import { context, orderedRun, distinct, adversarial, RUN } from '../mesura.mjs';

const P = PROGRAM_SIZE;
const R1 = Uint8Array.from([140,221,0,221,20,164,126,32,105,126,78,173,241,242,207,220,199,45,213,101,52,91,155,79,44,60,2,125,93,71,65,217,65,5,71,141,93,141,15,5,65,217,15,71,93,125,2,60,44,79,155,91,52,101,213,45,0,0,62,82,0,77,77,0]);
const W = 256, H = 128, n = W * H, r = makeRng(3400000901, 'v2');
const soup = Uint8Array.from({ length: n * P }, () => (r() * 256) | 0);
for (const [x, y] of [[40, 40], [200, 90], [128, 64]]) soup.set(R1, (y * W + x) * P);
const world = createWorld({ soup, width: W, height: H, radius: 2, mutation: 0.0005, seed: 3400000902 });
const o = new Observer(n, [{ name: 'R', bit: 1, programs: [R1] }]); o.all(soup);
const t = new Tracer(o, 0, 0, soup, n / 2); o.tracers.push(t);
let t0 = Date.now();
for (let e = 0; e < 120; e++) world.step([o]);
o.update(soup);
const car = []; for (let c = 0; c < n; c++) if (o.carrier[c] & 1) car.push(c);
console.log(`the world: ${car.length} carriers after 120 epochs (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
const rr = makeRng(3400000903, 'v2');
for (let i = car.length - 1; i > 0; i--) { const j = (rr() * (i + 1)) | 0; [car[i], car[j]] = [car[j], car[i]]; }
const A = car.slice(0, Math.ceil(car.length / 2)), B = car.slice(Math.ceil(car.length / 2), Math.ceil(car.length / 2) + 1000);
const far = []; for (let c = 0; c < n && far.length < 1000; c++) if (!o.carrier[c]) far.push(c);
const flat = (cells) => { const a = new Int32Array(cells.length * P); cells.forEach((c, i) => a.set(t.orig.subarray(c * P, c * P + P), i * P)); return a; };
t0 = Date.now();
const ctx = context(flat(A), 0.01, soup.length);
console.log(`the context: ${ctx.nDonors} donors, ${ctx.nUniq} distinct, ${ctx.pairs.size} map pairs (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
t0 = Date.now();
const hB = flat(B); let k = 0;
for (let i = 0; i < B.length; i++) if (orderedRun(ctx, hB, i * P).run >= RUN) k++;
console.log(`half B's sample: ${k} of ${B.length} ordered (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
t0 = Date.now();
const fF = flat(far); let z = 0;
for (let i = 0; i < far.length; i++) if (distinct(ctx, fF, i * P) === 0) z++;
console.log(`the far sample: ${z} of ${far.length} none (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
t0 = Date.now();
const adv = adversarial(ctx, hB, fF, 3400000904, t.next);
console.log(`the adversarial controls: ${Object.entries(adv).map(([key, v]) => `${key} ${v.ordered}/${v.cells}`).join(', ')} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
