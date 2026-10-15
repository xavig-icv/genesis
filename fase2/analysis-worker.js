// Treballador d'anàlisi del món 2D: rep una còpia del mapa i en calcula les
// mesures globals (com a la Fase 1) i el registre de famílies (families.js),
// sense bloquejar la pantalla.
import { PROGRAM_SIZE } from '../fase1/bff.js';
import { shannonEntropy, higherOrderEntropy } from '../fase1/soup.js';
import { createFamilyTracker } from './families.js';

const tracker = createFamilyTracker();
let generation = 0; // un reinici invalida les anàlisis que estiguin a mig fer

async function compressedSize(bytes) {
  if (typeof CompressionStream === 'undefined') return null;
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
  return (await new Response(stream).arrayBuffer()).byteLength;
}

self.onmessage = async (e) => {
  const msg = e.data;
  if (msg.type === 'reset') { tracker.reset(); generation++; return; }
  const gen = generation;
  const soup = new Uint8Array(msg.buffer);
  const h0 = shannonEntropy(soup);
  const bytes = await compressedSize(soup);
  if (gen !== generation) return;
  const result = tracker.analyse(soup, soup.length / PROGRAM_SIZE, msg.epoch, msg.width, msg.radius);
  self.postMessage({
    id: msg.id,
    h0,
    bpb: bytes == null ? null : (bytes * 8) / soup.length,
    hoe: bytes == null ? null : higherOrderEntropy(h0, bytes, soup.length),
    ...result,
  }, [result.map.buffer]);
};
