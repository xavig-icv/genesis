// Before the note (synthetic, no branch of the pilot): where the replicator of Phase 1 puts each of its bytes when it copies itself into a
// partner of data bytes, as origins (the byte j of the partner comes from the replicator's byte g). Prints the offset j - g of each copied
// byte, and whether a copy keeps runs of consecutive origins.
import { PROGRAM_SIZE } from '../../../../../fase1/bff.js';
import { evaluateEvents, writes } from '../../registre-copies/traca.mjs';
import { Tracer } from '../traca.mjs';

const P = PROGRAM_SIZE;
const R1 = Uint8Array.from([140,221,0,221,20,164,126,32,105,126,78,173,241,242,207,220,199,45,213,101,52,91,155,79,44,60,2,125,93,71,65,217,65,5,71,141,93,141,15,5,65,217,15,71,93,125,2,60,44,79,155,91,52,101,213,45,0,0,62,82,0,77,77,0]);
for (const filler of [1, 0, 200]) for (const first of [0, 1]) {
  const soup = new Uint8Array(2 * P); soup.fill(filler);
  soup.set(R1, first * P);
  const fake = { carrier: new Uint16Array(2), update() {}, tracers: [] };
  const t = new Tracer(fake, 0, 0, soup, 1), ev = new Int32Array(2 * 8192 + 2), pair = Uint32Array.from([0, 1]), tape = soup.slice();
  t.gather(pair, 1); evaluateEvents(tape, 0, ev); t.apply(0, ev, writes.n); t.scatter(pair, 1);
  const other = 1 - first, offs = new Map();
  let fromR = 0;
  for (let j = 0; j < P; j++) {
    const g = t.orig[other * P + j];
    if ((g >> 6) === first && g < 2 * P) { fromR++; const k = j - (g - first * P); offs.set(k, (offs.get(k) ?? 0) + 1); }
  }
  let runs = 0;
  for (let j = 0; j + 1 < P; j++) { const a = t.orig[other * P + j], b = t.orig[other * P + j + 1]; if ((a >> 6) === first && (b >> 6) === first && Math.abs(b - a) === 1) runs++; }
  console.log(`filler ${filler}, replicator in cell ${first}: ${fromR} bytes of the partner from it; offsets j - g: ${[...offs].map(([k, v]) => `${k}×${v}`).join(' ')}; adjacent pairs with adjacent origins: ${runs} of 63; writes ${writes.n}`);
}
