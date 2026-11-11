// Les trobades del microscopi del lloc web (web/microscopi/): els bytes reals de les parelles de cel·les que hi tria cada llavor.
//
//   node eines/web-trobades.mjs web/dades/ID carpeta-de-captures [--llavor L] [--n N]
//
// El codi que publica el lloc (codi/E.z, d'eines/web-dades.mjs) només diu la classe de cada byte, i per executar una trobada calen
// els bytes. Aquesta eina els treu de les captures de l'execució, per a les parelles que la pàgina triarà:
//  - les èpoques: les que tenen codi al lloc i alguna família al seu fotograma;
//  - per a cada època i cada família del fotograma, les parelles d'una cel·la de la família amb una veïna sense família, a dues
//    cel·les com a molt, en l'ordre de web/js/trobada.js (el mateix que el de la cinta de la portada, eines/web-cinta.mjs);
//  - per a cada llavor, de L a L + N − 1 (per defecte, de la de la cinta de la portada, 20261030, i 64), la parella que hi tria
//    la pàgina (trobada.js, pickPair) i els seus 128 bytes.
// Abans d'escriure res, comprova la SHA-256 de cada captura amb la de mon.json, i que la classe de cada byte desat sigui la del
// codi del lloc (codi/E.z) a la mateixa cel·la. Escriu trobades.z (el JSON, comprimit com les altres dades) a la carpeta del món, i
// no sobreescriu res. La pàgina torna a fer la tria amb el mapa i la torna a comprovar amb el codi.
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { inflateSync, deflateSync } from 'zlib';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { makeRng } from '../fase1/soup.js';
import { frontierPairs, classOfByte } from '../web/js/trobada.js';

export const SEED = 20261030;   // la llavor de la cinta de la portada (web/img/README.md): la primera trobada és la mateixa
export const COUNT = 64;
const sha = (b) => createHash('sha256').update(b).digest('hex');

export function buildMeetings(dir, capsDir, { seed = SEED, n = COUNT } = {}) {
  const meta = JSON.parse(readFileSync(join(dir, 'mon.json'), 'utf8'));
  const [W, H] = meta.mida, cells = W * H;
  const maps = inflateSync(readFileSync(join(dir, meta.mapes.fitxer)));
  if (sha(readFileSync(join(dir, meta.mapes.fitxer))) !== meta.mapes.sha256) throw new Error('mapes.z no té la SHA-256 de mon.json');
  const out = { format: 1, eina: 'eines/web-trobades.mjs', mon: meta.id, llavors: { des: seed, n }, radi: 2, epoques: {} };
  for (const e of Object.keys(meta.codiFitxers ?? {}).map(Number).sort((x, y) => x - y)) {
    const i = meta.fotogrames.findIndex((f) => f.e === e), list = i >= 0 ? meta.fotogrames[i].f : [];
    if (!list.length) continue;
    const font = meta.fonts.find((f) => f.e === e);
    if (!font) throw new Error(`l'època ${e} no té cap captura a mon.json`);
    const cap = readFileSync(join(capsDir, font.captura));
    if (sha(cap) !== font.sha256) throw new Error(`${font.captura} no té la SHA-256 de mon.json`);
    if (cap.length !== cells * 64) throw new Error(`${font.captura} no té la mida del món`);
    const codeFile = meta.codiFitxers[e], codeZ = readFileSync(join(dir, codeFile.fitxer));
    if (sha(codeZ) !== codeFile.sha256) throw new Error(`${codeFile.fitxer} no té la SHA-256 de mon.json`);
    const classes = inflateSync(codeZ), fam = maps.subarray(i * 2 * cells, i * 2 * cells + cells);
    const families = {};
    list.forEach((id, k) => {
      // les parelles, una sola vegada; la de cada llavor, amb la fórmula de pickPair (trobada.js): el primer nombre del generador
      // v2 de la llavor, per les parelles que hi ha
      const pairs = frontierPairs(fam, W, H, k + 1), count = pairs.length, meetings = [];
      if (!count) return;
      for (let s = 0; s < n; s++) {
        const [a, b] = pairs[Math.floor(makeRng((seed + s) >>> 0, 'v2')() * count)], bytes = Buffer.concat([cap.subarray(a * 64, a * 64 + 64), cap.subarray(b * 64, b * 64 + 64)]);
        // la classe de cada byte, la del codi del lloc a la mateixa cel·la
        for (let p = 0; p < 128; p++) {
          const c = p < 64 ? a : b, q = c * 64 + (p % 64);
          if (classOfByte(bytes[p]) !== classes[q]) throw new Error(`època ${e}: el byte ${p % 64} de la cel·la ${c} no té la classe del codi del lloc`);
        }
        meetings.push([a, b, bytes.toString('hex')]);
      }
      if (meetings.length) families[id] = { parelles: count, trobades: meetings };
    });
    if (Object.keys(families).length) out.epoques[e] = { captura: { fitxer: font.captura, sha256: font.sha256 }, families };
  }
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2), opts = { seed: SEED, n: COUNT }, pos = [];
  const fail = (m) => { console.error(`Error: ${m}\nÚs: node eines/web-trobades.mjs web/dades/ID carpeta-de-captures [--llavor L] [--n N]`); process.exit(2); };
  for (let k = 0; k < args.length; k++) {
    if (args[k] === '--llavor' || args[k] === '--n') {
      const v = args[++k];
      if (!/^\d{1,10}$/.test(v ?? '')) fail(`${args[k - 1]} necessita un enter`);
      if (args[k - 1] === '--llavor') opts.seed = Number(v); else opts.n = Number(v);
    } else if (args[k].startsWith('--')) fail(`opció desconeguda: ${args[k]}`);
    else pos.push(args[k]);
  }
  if (pos.length !== 2) fail('calen la carpeta del món i la de les captures');
  if (opts.n < 1 || opts.n > 1024 || opts.seed + opts.n > 2 ** 32) fail('--n ha de ser d’1 a 1.024, i la llavor més --n ha de cabre en 32 bits');
  const [dir, caps] = pos, file = join(dir, 'trobades.z');
  if (existsSync(file)) fail(`${file} ja existeix: no el sobreescric`);
  let out;
  try { out = buildMeetings(dir, caps, opts); } catch (e) { fail(e.message); }
  const z = deflateSync(Buffer.from(JSON.stringify(out)), { level: 9 });
  writeFileSync(file, z, { flag: 'wx' });
  const epochs = Object.keys(out.epoques);
  console.log(`${file}: ${epochs.length} èpoques (${epochs[0]} a ${epochs.at(-1)}), ${opts.n} llavors des de ${opts.seed}; ${z.length} bytes, SHA-256 ${sha(z)}`);
}
