// A record of copy events (exploratory): why the chains of prova.mjs's test world d pass through heritable holders without stopping at the
// earlier lineage. The same test world (seed 3500000304, the replicator planted at 64 × 20 + 40 at epoch 10); the states of the holders
// prova-4 printed (cell@epoch, before the interaction), with their heritability, their carrier bits against the replicator, and how they
// compare with the replicator and its mirror. Random bytes only: no world of the project.
//
//   node fase2/resultats/arrelament/esdeveniments/previ/diag.mjs
import { PROGRAM_SIZE } from '../../../../../fase1/bff.js';
import { makeRng } from '../../../../../fase1/soup.js';
import { CarrierIndex } from '../../registre-copies/traca.mjs';
import { createWorld } from '../mon.mjs';
import { createHeritability } from '../cadena.mjs';

const P = PROGRAM_SIZE, W = 64, H = 64, X = 64 * 20 + 40, seed = 3500000304;
const R1 = Uint8Array.from([140,221,0,221,20,164,126,32,105,126,78,173,241,242,207,220,199,45,213,101,52,91,155,79,44,60,2,125,93,71,65,217,65,5,71,141,93,141,15,5,65,217,15,71,93,125,2,60,44,79,155,91,52,101,213,45,0,0,62,82,0,77,77,0]);
const her = createHeritability();
const ix = new CarrierIndex(); ix.add([R1], 1);
const r = makeRng(seed, 'v2');
const soup = Uint8Array.from({ length: W * H * P }, () => (r() * 256) | 0);
const world = createWorld({ soup, width: W, height: H, radius: 2, mutation: 0, seed: seed + 1, inject: (e) => (e === 10 ? Array.from(R1, (v, j) => [X * P + j, v]) : null) });
const want = [[2435, 123], [2437, 127], [2565, 144], [2631, 146], [2305, 117]];
const follow = new Uint8Array(W * H); for (const [c] of want) follow[c] = 1;
const mirror = R1.slice().reverse();
const show = (a) => Array.from(a).join(',');
for (let e = 1; e <= 150; e++) {
  const { records } = world.step(follow);
  for (const [c, t] of want) if (t === e) {
    const s = records.get(c).M;
    const sameAt = (ref, k) => { let n = 0; for (let j = 0; j < P; j++) if (s[j] === ref[(j + k + P) % P]) n++; return n; };
    let best = { n: -1 };
    for (const [name, ref] of [['the replicator', R1], ['its mirror', mirror]]) for (let k = -63; k <= 63; k++) { const n = sameAt(ref, k); if (n > best.n) best = { n, name, k }; }
    let run = 0, cur = 0; for (let j = 0; j < P; j++) { if (s[j] === R1[j] || s[j] === mirror[(j + 1) % P]) { cur++; run = Math.max(run, cur); } else cur = 0; }
    console.log(`${c}@${e} (before its interaction): heritable ${her(s)}; carrier bits ${ix.bits(s, 0)}; best alignment ${best.n} of 64 bytes with ${best.name} shifted ${best.k}`);
    console.log(`   ${show(s)}`);
  }
}
console.log(`the replicator: ${show(R1)}`);
