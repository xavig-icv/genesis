// La composició de bytes d'una sopa envellida del pilot de la maduració, per a la §13 de B1 (docs/pla-b1.md): quantes vegades hi
// és cada valor de byte, en tota la sopa.
//
//   node eines/composicio.mjs --captura fitxer.bin --mon N --json sortida.json [--manifest fitxer.json]
//
// La sopa és la captura del món a l'edat del pilot (l'època 8.000), la de la cohort: només els mons inclosos del manifest del pilot
// (fase2/resultats/maduracio/pilot/manifest.json), i només si la SHA-256 de la captura és la que hi diu. Són les 131.072 cel·les
// del món de 512 × 256, 2²³ bytes. No sobreescriu cap fitxer.
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { pathToFileURL } from 'url';
import { OPCODES } from '../fase1/bff.js';
import { parseOptions, sha256 } from './b1-comu.mjs';
import { SOUP_BYTES } from './estrats.mjs';

export const MANIFEST = 'fase2/resultats/maduracio/pilot/manifest.json';
const INSTRUCTIONS = new Set([...OPCODES].map((c) => c.charCodeAt(0)));

// Els mons de la cohort del pilot, en l'ordre del manifest: { world, epoch, capture: { file, sha256 } }
export function cohort(manifestFile = MANIFEST) {
  const m = JSON.parse(readFileSync(manifestFile, 'utf8'));
  return m.worlds.filter((w) => w.included).map((w) => ({ world: w.world, epoch: w.start, capture: { file: w.capture, sha256: w.captureSha256 } }));
}
export function composition(buf, entry) {
  if (buf.length !== SOUP_BYTES) throw new Error(`la captura fa ${buf.length} bytes, i n'ha de fer ${SOUP_BYTES}`);
  if (sha256(buf) !== entry.capture.sha256) throw new Error(`la SHA-256 de la captura no és la del manifest per al món ${entry.world}`);
  const counts = new Array(256).fill(0);
  for (const b of buf) counts[b]++;
  const instructions = counts.reduce((s, c, b) => s + (INSTRUCTIONS.has(b) ? c : 0), 0);
  return { world: entry.world, epoch: entry.epoch, capture: entry.capture, bytes: buf.length, instructions, counts };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const opts = parseOptions(process.argv.slice(2), {
    captura: { type: 'str', required: true }, mon: { type: 'str', required: true }, json: { type: 'str', required: true }, manifest: { type: 'str', default: MANIFEST },
  }, 'Ús: node eines/composicio.mjs --captura fitxer.bin --mon N --json sortida.json [--manifest fitxer.json]');
  const fail = (m) => { console.error(`Error: ${m}`); process.exit(2); };
  const entry = cohort(opts.manifest).find((w) => w.world === opts.mon);
  if (!entry) fail(`el món ${opts.mon} no és de la cohort del pilot`);
  if (existsSync(opts.json)) fail(`${opts.json} ja existeix: no el sobreescric`);
  let c;
  try { c = composition(readFileSync(opts.captura), entry); } catch (e) { fail(e.message); }
  writeFileSync(opts.json, JSON.stringify(c) + '\n', { flag: 'wx' });
  console.log(`${opts.json}: el món ${c.world}, ${c.instructions} bytes d'instrucció de ${c.bytes}`);
}
