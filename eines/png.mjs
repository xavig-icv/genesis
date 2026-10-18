// Codificador mínim de PNG i d'APNG (PNG animat), sense dependències: només zlib de Node.
// Les imatges són RGB de 8 bits: un Uint8Array de mida amplada × alçada × 3.
import { deflateSync } from 'zlib';

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
const u32 = (...v) => { const b = Buffer.alloc(4 * v.length); v.forEach((x, i) => b.writeUInt32BE(x, 4 * i)); return b; };
function ihdr(width, height) {
  const b = Buffer.alloc(13);
  b.writeUInt32BE(width, 0); b.writeUInt32BE(height, 4);
  b[8] = 8; b[9] = 2; // 8 bits, RGB
  return chunk('IHDR', b);
}
// Les files amb el filtre 0 al davant, comprimides
function pixels(rgb, width, height) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    Buffer.from(rgb.buffer, rgb.byteOffset + y * width * 3, width * 3).copy(raw, y * (width * 3 + 1) + 1);
  }
  return deflateSync(raw, { level: 9 });
}
const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function encodePng(rgb, width, height) {
  return Buffer.concat([SIGNATURE, ihdr(width, height), chunk('IDAT', pixels(rgb, width, height)), chunk('IEND', Buffer.alloc(0))]);
}

// Un APNG amb totes les imatges de la mateixa mida. delayMs: el temps de cada imatge; lastMs: el de l'última
export function encodeApng(frames, width, height, { delayMs = 100, lastMs = delayMs, loops = 0 } = {}) {
  const parts = [SIGNATURE, ihdr(width, height), chunk('acTL', u32(frames.length, loops))];
  let seq = 0;
  frames.forEach((rgb, i) => {
    const ms = i === frames.length - 1 ? lastMs : delayMs;
    const fctl = Buffer.alloc(26);
    fctl.writeUInt32BE(seq++, 0); fctl.writeUInt32BE(width, 4); fctl.writeUInt32BE(height, 8);
    fctl.writeUInt32BE(0, 12); fctl.writeUInt32BE(0, 16);
    fctl.writeUInt16BE(ms, 20); fctl.writeUInt16BE(1000, 22); // retard = ms / 1000 s
    fctl[24] = 0; fctl[25] = 0; // sense esborrar; substitueix
    parts.push(chunk('fcTL', fctl));
    const data = pixels(rgb, width, height);
    parts.push(i === 0 ? chunk('IDAT', data) : chunk('fdAT', Buffer.concat([u32(seq++), data])));
  });
  parts.push(chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(parts);
}
