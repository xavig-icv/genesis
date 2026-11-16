// La prova de viabilitat (exploratori): els quatre genotips, amb la regla del pla (docs/pla-aparicio-arrelament.md, §4.1) i el mètode
// del README d'aquesta carpeta (el punt 1). Des de l'arrel de la còpia:
//   node fase2/resultats/arrelament/viabilitat/genotips.mjs > fase2/resultats/arrelament/viabilitat/genotips-sortida.txt
// Escriu genotips.json al costat (si ja hi és, s'hi nega).
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { pick } from '../../../../eines/tria.mjs';
import { testReplicator } from '../../../../eines/autonomia.mjs';
import { DIR, BACKUP, PILOT, CELLS, ARMS, GENOTYPE_SEED, INERT_SEED, at, hex, fromHex, programAt, sha256, header, readJsonl, interpret,
  inertConditions } from './comu.mjs';

const OUT = at(`${DIR}/genotips.json`);
if (existsSync(OUT)) { console.error(`${OUT} ja hi és: no el sobreescric`); process.exit(2); }
const conds = inertConditions(100);
const count1 = (s) => [...s].filter((c) => c === '1').length;
const test = (h) => {
  const r = testReplicator(fromHex(h), conds, interpret);
  return { heritableSolo: count1(r.heritableSolo), heritableContext: count1(r.heritableContext), solo: count1(r.solo), context: count1(r.context), ...r };
};
const out = { type: 'genotypes', ...header(), seed: GENOTYPE_SEED, conditions: { seed: INERT_SEED, count: 100, chemistry: 'C0' }, genotypes: [] };
console.log(`codi=${out.code}  node=${out.node}  llavor=${GENOTYPE_SEED}  condicions=${INERT_SEED} (100)`);

// G1: el brot del 1034, a la captura 5.200 (el registre del pas 3)
{
  const file = 'fase2/resultats/maduracio/durada/registres/durada-5200.jsonl';
  const lines = readJsonl(at(file));
  if (lines[0].type !== 'start' || lines[0].epoch !== 5200 || lines[0].seed !== INERT_SEED || lines[0].conditions !== 100) throw new Error(`${file}: la línia d'inici no és la que toca`);
  const all = '1'.repeat(100), seen = new Set(), list = [];
  for (const l of lines) if (l.type === 'cell' && l.heritableSolo === all && !seen.has(l.program)) { seen.add(l.program); list.push(l.program); }
  console.log(`\nG1: ${list.length} programes diferents hereditaris sols en 100 de 100 a la captura 5.200 del 1034`);
  let seed = GENOTYPE_SEED, rest = list, chosen = null, r = null;
  while (rest.length) {
    const [h] = pick(seed, 1, rest);
    r = test(h);
    console.log(`  tria amb la llavor ${seed}: ${h}  (hereditari sol en ${r.heritableSolo} de 100)`);
    if (r.heritableSolo >= 95) { chosen = h; break; }
    rest = rest.filter((x) => x !== h); seed++;
  }
  if (!chosen) throw new Error('G1: cap programa no fa 95 de 100');
  out.genotypes.push({ id: 'G1', hex: chosen, origin: { source: 'el brot del món 1034 (el pas 3)', record: file, recordSha256: sha256(readFileSync(at(file))), epoch: 5200, candidates: list.length, pickSeed: seed }, test: r });
}

// G2, G3 i G4: la família dominant a l'establiment d'una branca del pilot de la maduració, una per braç
{
  const dir = at(`${PILOT}/branques`);
  const events = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.jsonl')).sort()) {
    const lines = readJsonl(join(dir, f));
    const ev = lines.find((l) => l.type === 'event');
    if (!ev) continue;
    const id = f.replace(/\.jsonl$/, ''), m = id.match(/^(\d{4})-(.+)-([ab])$/);
    if (!m) throw new Error(`un identificador que no entenc: ${id}`);
    events.push({ id, world: m[1], arm: m[2], tag: m[3], seed: lines[0].seed, epoch: ev.epoch, confirmed: ev.confirmed });
  }
  console.log(`\nLes branques establertes del pilot de la maduració: ${events.length}`);
  const name = (e) => `llavor${e.seed}-mon512x256-r2-des8000-establiment${e.epoch}-epoca${e.epoch}.bin`;
  const sums = {};
  for (const m of ['pc', 'vm']) {
    for (const line of readFileSync(`${BACKUP}/${m}/sha256.txt`, 'utf8').split('\n').filter(Boolean)) {
      const [h, f] = line.split(/\s+\*?/);
      sums[f.replace(/^captures\//, '')] = { sha256: h, file: `${BACKUP}/${m}/${f}` };
    }
  }
  const genIds = { continue: 'G2', 'shuffle-all': 'G3', reinit: 'G4' };
  for (const arm of ARMS) {
    let ids = events.filter((e) => e.arm === arm).map((e) => e.id).sort();
    console.log(`\n${genIds[arm]} (${arm}): ${ids.length} branques establertes: ${ids.join(' ')}`);
    let seed = GENOTYPE_SEED, chosen = null;
    while (ids.length && !chosen) {
      const [id] = pick(seed, 1, ids);
      const e = events.find((x) => x.id === id);
      const twins = events.filter((x) => x.seed === e.seed && x.epoch === e.epoch);
      if (twins.length !== 1) throw new Error(`${id}: el nom de la captura és ambigu (${twins.map((x) => x.id).join(', ')})`);
      const entry = sums[name(e)];
      if (!entry) throw new Error(`${id}: no trobo ${name(e)} a ${BACKUP}`);
      const buf = readFileSync(entry.file);
      if (sha256(buf) !== entry.sha256) throw new Error(`${entry.file}: la SHA-256 no és la del sha256.txt`);
      if (buf.length !== CELLS * PROGRAM_SIZE) throw new Error(`${entry.file}: la mida no és la d'un món`);
      const soup = new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
      const counts = new Map();
      for (let c = 0; c < CELLS; c++) { const h = hex(programAt(soup, c)); counts.set(h, (counts.get(h) ?? 0) + 1); }
      const top = [...counts].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).slice(0, 50);
      console.log(`  tria amb la llavor ${seed}: ${id}, establerta a l'època ${e.epoch}; ${name(e)} (${counts.size} programes diferents)`);
      for (const [h, n] of top) {
        const r = test(h);
        if (r.heritableSolo >= 95) {
          console.log(`  el més freqüent dels 50 que fa 95 o més: ${h}  (${n} cel·les; hereditari sol en ${r.heritableSolo} de 100)`);
          chosen = { id: genIds[arm], hex: h, origin: { source: `la família dominant a l'establiment de ${id} (el pilot de la maduració)`, branch: id, world: e.world, arm, seed: e.seed, epoch: e.epoch, capture: name(e), captureSha256: entry.sha256, cells: n, rank: top.findIndex((t) => t[0] === h) + 1, pickSeed: seed }, test: r };
          break;
        }
      }
      if (!chosen) { console.log('  cap dels 50 no fa 95 de 100: es torna a triar'); ids = ids.filter((x) => x !== id); seed++; }
    }
    if (!chosen) throw new Error(`${genIds[arm]}: cap branca no dona un genotip`);
    out.genotypes.push(chosen);
  }
}

// La comprovació final: cada genotip, 95 de 100 o més, sol
for (const g of out.genotypes) {
  const r = test(g.hex);
  if (r.heritableSolo < 95 || r.heritableSolo !== g.test.heritableSolo) throw new Error(`${g.id}: la comprovació final no hi coincideix`);
}
const distinct = new Set(out.genotypes.map((g) => g.hex));
if (distinct.size !== out.genotypes.length) throw new Error('dos genotips són el mateix programa');
console.log('\nEls genotips:');
for (const g of out.genotypes) {
  const glyphs = Array.from(fromHex(g.hex), (b) => ('<>{}-+.,[]'.includes(String.fromCharCode(b)) ? String.fromCharCode(b) : '·')).join('');
  console.log(`  ${g.id}  ${glyphs}  sol ${g.test.solo}, en context ${g.test.context}, hereditari sol ${g.test.heritableSolo}, hereditari en context ${g.test.heritableContext} (de 100)`);
}
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`\nescrit: ${DIR}/genotips.json`);
