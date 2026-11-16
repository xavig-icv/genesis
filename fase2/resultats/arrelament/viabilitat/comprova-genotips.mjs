// La prova de viabilitat (exploratori): una comprovació que no era a la nota, escrita després de veure la tria dels genotips (G3 és un
// programa d'una sola cel·la). La regla tria el programa més freqüent, però en un món establert cada membre de la família pot ser diferent:
// cal saber si G2, G3 i G4 són de la família dominant a l'establiment. A la captura d'on surt cadascun, les cel·les que porten alguna
// finestra seva (M) i, de 256 a l'atzar, les hereditàries amb companys inerts en 3 condicions (F), contra els hereditaris del món que
// estima el cens v3 d'aquella època. Des de l'arrel de la còpia:
//   node fase2/resultats/arrelament/viabilitat/comprova-genotips.mjs > fase2/resultats/arrelament/viabilitat/comprova-genotips-sortida.txt
import { readFileSync } from 'fs';
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { makeRng } from '../../../../fase1/soup.js';
import { DIR, BACKUP, PILOT, CELLS, SAMPLE, Windows, at, fromHex, programAt, sha256, header, readJsonl, inertTest, inertConditions } from './comu.mjs';

const h = header();
console.log(`codi=${h.code}  node=${h.node}`);
const conds = inertConditions(3);
for (const g of JSON.parse(readFileSync(at(`${DIR}/genotips.json`), 'utf8')).genotypes.filter((x) => x.origin.branch)) {
  const o = g.origin;
  const file = ['pc', 'vm'].map((m) => `${BACKUP}/${m}/captures/${o.capture}`).find((f) => { try { readFileSync(f, { flag: 'r' }); return true; } catch { return false; } });
  const buf = readFileSync(file);
  if (sha256(buf) !== o.captureSha256) throw new Error(`${file}: la SHA-256 no és la de genotips.json`);
  const soup = new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
  const w = new Windows();
  w.addProgram(fromHex(g.hex));
  const members = [];
  for (let c = 0; c < CELLS; c++) if (w.has(programAt(soup, c))) members.push(c);
  const rng = makeRng(Number(o.world) + 950000, 'v2');
  for (let k = 0; k < Math.min(SAMPLE, members.length); k++) { const j = k + ((rng() * (members.length - k)) | 0); [members[k], members[j]] = [members[j], members[k]]; }
  const tested = members.slice(0, Math.min(SAMPLE, members.length));
  let functional = 0;
  for (const c of tested) if (inertTest(programAt(soup, c).slice(), conds).heritable) functional++;
  const F = Math.round((members.length * functional) / Math.max(1, tested.length));
  const census = readJsonl(at(`${PILOT}/branques/${o.branch}.jsonl`)).find((l) => l.type === 'census' && l.epoch === o.epoch);
  const world = Math.round((census.heritable / census.sample) * CELLS);
  console.log(`${g.id} (${o.branch}, època ${o.epoch}): porten alguna finestra seva ${members.length} cel·les; hereditàries amb companys inerts ${functional} de ${tested.length} provades, F ≈ ${F}; el cens v3 estima ${world} hereditaris al món (${census.heritable} de ${census.sample}): ${F >= world / 2 ? 'de la família dominant' : 'NO és de la família dominant'}`);
}
