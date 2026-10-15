// Treballador d'anàlisi: rep una còpia de la sopa i en calcula les mesures
// sense bloquejar la pantalla.
import { PROGRAM_SIZE } from './bff.js';
import { shannonEntropy, higherOrderEntropy, topPrograms } from './soup.js';
import { topMotifs } from './motifs.js';

async function compressedSize(bytes) {
  if (typeof CompressionStream === 'undefined') return null;
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
  return (await new Response(stream).arrayBuffer()).byteLength;
}

self.onmessage = async (e) => {
  const { buffer, id } = e.data;
  const soup = new Uint8Array(buffer);
  const n = soup.length / PROGRAM_SIZE;
  const h0 = shannonEntropy(soup);
  const bytes = await compressedSize(soup);
  const { distinct } = topPrograms(soup, n, 0);
  self.postMessage({
    id,
    h0,
    bpb: bytes == null ? null : (bytes * 8) / soup.length,
    hoe: bytes == null ? null : higherOrderEntropy(h0, bytes, soup.length),
    distinct,
    motifs: topMotifs(soup, n),
  });
};
