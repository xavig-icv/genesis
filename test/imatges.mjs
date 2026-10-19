// Proves de les imatges (eines/png.mjs, eines/imatges.mjs i eines/tria.mjs). Executa: node test/imatges.mjs
import assert from 'assert';
import { inflateSync } from 'zlib';
import { spawnSync } from 'child_process';
import { mkdtempSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { encodePng, encodeApng } from '../eines/png.mjs';
import { soupImage, worldImage, codeImage, row, grid, label, thousands, COLORS, WORLD, THEMES } from '../eines/imatges.mjs';
import { pick } from '../eines/tria.mjs';
import { randomSoup, makeRng } from '../fase1/soup.js';

const root = fileURLToPath(new URL('..', import.meta.url));
// La CRC-32 dels PNG, escrita aquí a part (Node 16 no en té cap a zlib) per comprovar la del codificador
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) { c ^= b; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; }
  return (c ^ 0xffffffff) >>> 0;
}
// Els trossos d'un PNG: [{ type, data }], comprovant-ne la CRC
function chunks(png) {
  assert.deepStrictEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  const out = [];
  for (let i = 8; i < png.length;) {
    const len = png.readUInt32BE(i), type = png.toString('ascii', i + 4, i + 8);
    assert.strictEqual(png.readUInt32BE(i + 8 + len), crc32(png.subarray(i + 4, i + 8 + len)), `CRC de ${type}`);
    out.push({ type, data: png.subarray(i + 8, i + 8 + len) });
    i += 12 + len;
  }
  return out;
}

const tests = {
  'un PNG: capçalera, CRC i píxels': () => {
    const rgb = Uint8Array.from([255, 0, 0, 0, 255, 0, 0, 0, 255, 10, 20, 30]);   // 2 × 2
    const cs = chunks(encodePng(rgb, 2, 2));
    assert.deepStrictEqual(cs.map((c) => c.type), ['IHDR', 'IDAT', 'IEND']);
    assert.strictEqual(cs[0].data.readUInt32BE(0), 2);
    assert.deepStrictEqual([cs[0].data[8], cs[0].data[9]], [8, 2]);
    // cada fila: el filtre 0 i els píxels
    assert.deepStrictEqual([...inflateSync(cs[1].data)], [0, 255, 0, 0, 0, 255, 0, 0, 0, 0, 255, 10, 20, 30]);
  },
  'un APNG: el nombre de fotogrames i els números de seqüència': () => {
    const f = (v) => new Uint8Array(3 * 4).fill(v);
    const cs = chunks(encodeApng([f(1), f(2), f(3)], 2, 2, { delayMs: 50 }));
    assert.deepStrictEqual(cs.map((c) => c.type), ['IHDR', 'acTL', 'fcTL', 'IDAT', 'fcTL', 'fdAT', 'fcTL', 'fdAT', 'IEND']);
    assert.strictEqual(cs[1].data.readUInt32BE(0), 3);
    const seqs = cs.filter((c) => c.type === 'fcTL' || c.type === 'fdAT').map((c) => c.data.readUInt32BE(0));
    assert.deepStrictEqual(seqs, [0, 1, 2, 3, 4]);
    assert.strictEqual(cs[2].data.readUInt16BE(20), 50);
  },
  'una sopa: els bytes amb el color de la seva família': () => {
    const soup = new Uint8Array(64 * 2);
    soup[0] = '.'.charCodeAt(0); soup[1] = '['.charCodeAt(0); soup[64] = 0;
    const im = soupImage(soup, { programs: 2, scale: 1 });
    assert.deepStrictEqual([im.width, im.height], [64, 2]);
    assert.deepStrictEqual([...im.rgb.subarray(0, 3)], COLORS.copy);
    assert.deepStrictEqual([...im.rgb.subarray(3, 6)], COLORS.loop);
    assert.deepStrictEqual([...im.rgb.subarray(64 * 3, 64 * 3 + 3)], COLORS.zero);
  },
  "un món: sense registre de famílies, el gris segons les instruccions": () => {
    const soup = new Uint8Array(64 * 2);           // un món de 2 × 1: una cel·la sense instruccions i una plena
    soup.fill('+'.charCodeAt(0), 64);
    const im = worldImage(soup, 2, 1, { scale: 1 });
    assert.deepStrictEqual([...im.rgb.subarray(0, 3)], WORLD.lo);
    assert.deepStrictEqual([...im.rgb.subarray(3, 6)], WORLD.hi);
  },
  "un món: la regió, la graella, el rectangle i el tema fosc": () => {
    const soup = new Uint8Array(64 * 6).fill('+'.charCodeAt(0));   // un món de 3 × 2, tot ple d'instruccions
    const px = (im, x, y) => [...im.rgb.subarray((y * im.width + x) * 3, (y * im.width + x) * 3 + 3)];
    const im = worldImage(soup, 3, 2, { scale: 3, region: [1, 0, 2, 2], grid: true, theme: THEMES.fosc });
    assert.deepStrictEqual([im.width, im.height], [6, 6]);
    assert.deepStrictEqual(px(im, 0, 0), THEMES.fosc.world.hi);
    assert.deepStrictEqual(px(im, 2, 0), THEMES.fosc.surface);      // la línia de la graella
    assert.throws(() => worldImage(soup, 3, 2, { region: [2, 0, 2, 2] }), /regió fora del món/);
    const marked = worldImage(soup, 3, 2, { scale: 4, mark: [1, 0, 1, 1] });
    assert.deepStrictEqual(px(marked, 3, 2), THEMES.clar.ink);       // el rectangle, just a l'esquerra de la cel·la 1
    assert.deepStrictEqual(px(marked, 5, 2), WORLD.hi);
  },
  "la vista de codi: 64 bytes en 8 × 8, amb el marc i la separació de més a prop": () => {
    const soup = new Uint8Array(64);
    soup[0] = '['.charCodeAt(0); soup[9] = ','.charCodeAt(0);       // el primer byte i el de la fila 1, columna 1
    const px = (im, x, y) => [...im.rgb.subarray((y * im.width + x) * 3, (y * im.width + x) * 3 + 3)];
    let im = codeImage(soup, 1, 1);
    assert.deepStrictEqual([im.width, im.height], [10, 10]);
    assert.deepStrictEqual(px(im, 0, 0), THEMES.clar.surface);      // sense família, el marc és del color del fons
    assert.deepStrictEqual(px(im, 1, 1), COLORS.loop);
    assert.deepStrictEqual(px(im, 2, 2), COLORS.copy);
    assert.deepStrictEqual(px(im, 3, 1), COLORS.zero);
    im = codeImage(soup, 1, 1, { byte: 4, theme: THEMES.fosc });
    assert.deepStrictEqual([im.width, im.height], [34, 34]);         // 8 × 4 i un marc d'1 a cada costat
    assert.deepStrictEqual(px(im, 1, 1), THEMES.fosc.loop);
    assert.deepStrictEqual(px(im, 4, 1), THEMES.fosc.surface);       // la línia entre bytes
    assert.deepStrictEqual(px(im, 5, 5), THEMES.fosc.copy);
  },
  "aleatoria:LLAVOR:v1 és la sopa inicial de sim.mjs amb el generador v1": () => {
    const tmp = mkdtempSync(join(tmpdir(), 'imatges-'));
    try {
      const out = (name) => join(tmp, name);
      const run = (args) => spawnSync(process.execPath, [join(root, 'eines', 'imatges.mjs'), 'sopa', ...args, '--programes', '4'], { encoding: 'utf8' });
      assert.strictEqual(run([out('v1.png'), 'aleatoria:5:v1']).status, 0);
      assert.strictEqual(run([out('v2.png'), 'aleatoria:5']).status, 0);
      const expected = soupImage(randomSoup(131072, makeRng(5, 'v1')), { programs: 4 });
      assert.ok(readFileSync(out('v1.png')).equals(encodePng(expected.rgb, expected.width, expected.height)));
      assert.ok(!readFileSync(out('v1.png')).equals(readFileSync(out('v2.png'))));
    } finally { rmSync(tmp, { recursive: true, force: true }); }
  },
  "un APNG amb una imatge per defecte que no forma part de l'animació (AUD-75)": () => {
    const f = (v) => new Uint8Array(3 * 4).fill(v);
    const cs = chunks(encodeApng([f(1), f(2)], 2, 2, { delayMs: 50, cover: f(9) }));
    // la imatge per defecte va a l'IDAT, abans del primer fcTL; els fotogrames, tots a fdAT
    assert.deepStrictEqual(cs.map((c) => c.type), ['IHDR', 'acTL', 'IDAT', 'fcTL', 'fdAT', 'fcTL', 'fdAT', 'IEND']);
    assert.strictEqual(cs[1].data.readUInt32BE(0), 2);
    assert.deepStrictEqual([...inflateSync(cs[2].data)].slice(1, 4), [9, 9, 9]);
    const seqs = cs.filter((c) => c.type === 'fcTL' || c.type === 'fdAT').map((c) => c.data.readUInt32BE(0));
    assert.deepStrictEqual(seqs, [0, 1, 2, 3]);
    assert.deepStrictEqual([...inflateSync(cs[4].data.subarray(4))].slice(1, 4), [1, 1, 1]);
  },
  "l'època a la cantonada: les xifres, el punt dels milers i el requadre": () => {
    assert.strictEqual(thousands(1500), '1.500');
    assert.strictEqual(thousands(16000), '16.000');
    assert.strictEqual(thousands(250), '250');
    const im = { rgb: new Uint8Array(40 * 20 * 3), width: 40, height: 20 };
    label(im, '1', { x: 4, y: 4, s: 1, color: [255, 255, 255], background: [7, 7, 7] });
    const px = (x, y) => [...im.rgb.subarray((y * 40 + x) * 3, (y * 40 + x) * 3 + 3)];
    // el "1": 010 / 110 / 010 / 010 / 111
    assert.deepStrictEqual(px(5, 4), [255, 255, 255]);
    assert.deepStrictEqual(px(4, 4), [7, 7, 7]);
    assert.deepStrictEqual(px(4, 5), [255, 255, 255]);
    assert.deepStrictEqual(px(6, 8), [255, 255, 255]);
    assert.deepStrictEqual(px(30, 15), [0, 0, 0]);                 // fora del requadre, no toca res
  },
  'una graella: les imatges per files, amb marge': () => {
    const sq = (v) => ({ rgb: new Uint8Array(3).fill(v), width: 1, height: 1 });
    const g = grid([sq(1), sq(2), sq(3)], 2, 1, [0, 0, 0]);
    assert.deepStrictEqual([g.width, g.height], [3, 3]);
    const px = (x, y) => g.rgb[(y * g.width + x) * 3];
    assert.deepStrictEqual([px(0, 0), px(2, 0), px(0, 2), px(2, 2)], [1, 2, 3, 0]);
  },
  "una tria a l'atzar amb llavor: sempre la mateixa, sense repetir, i en l'ordre de la llista": () => {
    const items = Array.from({ length: 30 }, (_, i) => `m${i}`);
    const a = pick(20261019, 4, items), b = pick(20261019, 4, items);
    assert.deepStrictEqual(a, b);
    assert.strictEqual(new Set(a).size, 4);
    assert.deepStrictEqual(a, [...a].sort((x, y) => items.indexOf(x) - items.indexOf(y)));
    assert.notDeepStrictEqual(pick(1, 4, items), a);
    assert.deepStrictEqual(pick(5, 3, ['x', 'y', 'z']), ['x', 'y', 'z']);
    assert.throws(() => pick(1, 4, ['x']), /N ha de ser/);
    const r = spawnSync(process.execPath, [join(root, 'eines', 'tria.mjs'), '20261019', '4', ...items], { encoding: 'utf8' });
    assert.strictEqual(r.stdout.trim(), a.join(' '));
  },
  'la corba de Kaplan–Meier en mode fosc': () => {
    const tmp = mkdtempSync(join(tmpdir(), 'imatges-'));
    try {
      const dir = join(root, 'fase2', 'resultats', 'serie-llei2'), out = join(tmp, 'km.svg');
      const r = spawnSync(process.execPath, [join(root, 'eines', 'imatges.mjs'), 'km', join(dir, 'A'), join(dir, 'B'), out, '--tema', 'fosc'], { encoding: 'utf8' });
      assert.strictEqual(r.status, 0, r.stderr);
      const svg = readFileSync(out, 'utf8');
      assert.ok(!svg.includes('var(--'));
      assert.match(svg, /<rect width="640" height="300" fill="#0d0d0d"\/>/);
      assert.ok(!svg.includes('#52514e'));                         // cap color del mode clar
    } finally { rmSync(tmp, { recursive: true, force: true }); }
  },
  'diverses imatges en fila, amb marge': () => {
    const a = { rgb: new Uint8Array(3).fill(1), width: 1, height: 1 }, b = { rgb: new Uint8Array(3).fill(2), width: 1, height: 1 };
    const r = row([a, b], 2);
    assert.deepStrictEqual([r.width, r.height], [4, 1]);
    assert.deepStrictEqual([...r.rgb], [1, 1, 1, 255, 255, 255, 255, 255, 255, 2, 2, 2]);
  },
  "la corba de Kaplan–Meier per a GitHub, sense les variables del quadern": () => {
    const tmp = mkdtempSync(join(tmpdir(), 'imatges-'));
    try {
      const dir = join(root, 'fase2', 'resultats', 'serie-llei2'), out = join(tmp, 'km.svg');
      const r = spawnSync(process.execPath, [join(root, 'eines', 'imatges.mjs'), 'km', join(dir, 'A'), join(dir, 'B'), out], { encoding: 'utf8' });
      assert.strictEqual(r.status, 0, r.stderr);
      const svg = readFileSync(out, 'utf8');
      assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
      assert.ok(!svg.includes('var(--'));
      assert.match(svg, /corrent 0,01 · 42,5 %/);
    } finally { rmSync(tmp, { recursive: true, force: true }); }
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
