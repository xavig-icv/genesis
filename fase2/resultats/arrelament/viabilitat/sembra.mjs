// La prova de viabilitat (exploratori): els 6 mons, les posicions, les 90 sembres i les ordres de les branques (el README d'aquesta
// carpeta, els punts 2 a 5). Des de l'arrel de la còpia, després de genotips.mjs:
//   node fase2/resultats/arrelament/viabilitat/sembra.mjs > fase2/resultats/arrelament/viabilitat/sembra-sortida.txt
// Escriu les captures sembrades a sembres/ (cap no se sobreescriu), un .json per sembra, disseny.json, llista.txt (les 90 branques) i
// prova/llista.txt (la branca de la prova curta).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { makeRng } from '../../../../fase1/soup.js';
import { pick } from '../../../../eines/tria.mjs';
import { DIR, BACKUP, PILOT, WIDTH, HEIGHT, CELLS, ARMS, WORLD_SEED, POSITION_OFFSET, at, fromHex, hex, programAt, sha256, header, readJsonl } from './comu.mjs';

const fail = (m) => { console.error(m); process.exit(2); };
for (const f of ['disseny.json', 'llista.txt', 'prova/llista.txt']) if (existsSync(at(`${DIR}/${f}`))) fail(`${DIR}/${f} ja hi és: no el sobreescric`);
const genotypes = JSON.parse(readFileSync(at(`${DIR}/genotips.json`), 'utf8')).genotypes;
if (genotypes.map((g) => g.id).join() !== 'G1,G2,G3,G4') fail('genotips.json no té G1, G2, G3 i G4');
const manifest = JSON.parse(readFileSync(at(`${PILOT}/manifest.json`), 'utf8'));
const h = header();
console.log(`codi=${h.code}  node=${h.node}`);

// Els mons: els 22 inclosos, sense els d'on surten G2, G3 i G4; 6 a l'atzar
const origins = new Set(genotypes.filter((g) => g.origin.world).map((g) => g.origin.world));
const included = manifest.worlds.filter((w) => w.included).map((w) => w.world);
const candidates = included.filter((w) => !origins.has(w));
const worlds = pick(WORLD_SEED, 6, candidates);
console.log(`Els mons inclosos al pilot de la maduració: ${included.length}; sense els d'origen (${[...origins].join(', ')}): ${candidates.length}`);
console.log(`Els 6, amb la llavor ${WORLD_SEED}: ${worlds.join(' ')}`);

// La posició de cada món: x = 2 + ⌊r · 508⌋ i després y = 2 + ⌊r · 252⌋, amb el generador v2 i la llavor del món + 700.000
const positions = {};
for (const w of worlds) {
  const rng = makeRng(Number(w) + POSITION_OFFSET, 'v2');
  const x = 2 + ((rng() * (WIDTH - 4)) | 0), y = 2 + ((rng() * (HEIGHT - 4)) | 0);
  positions[w] = { x, y, cell: y * WIDTH + x };
  console.log(`  ${w}: x=${x} y=${y} (cel·la ${y * WIDTH + x})`);
}

// Les sembres: 4 genotips en una cel·la i G1 en el quadrat de 3 × 3, a les tres sopes de cada món
const variants = [...genotypes.map((g) => ({ name: g.id, genotype: g, square: false })), { name: 'G1x9', genotype: genotypes[0], square: true }];
mkdirSync(at(`${DIR}/sembres`), { recursive: true });
const branches = [];
const list = [];
for (const w of worlds) {
  const wm = manifest.worlds.find((x) => x.world === w);
  const { x, y } = positions[w];
  for (const arm of ARMS) {
    const src = `${BACKUP}/origen/alicuotes/${w}/${arm}.bin`;
    const buf = readFileSync(src);
    const srcSha = sha256(buf);
    if (srcSha !== wm.arms[arm].sha256) fail(`${src}: la SHA-256 no és la del manifest del pilot de la maduració`);
    if (buf.length !== CELLS * PROGRAM_SIZE) fail(`${src}: la mida no és la d'un món`);
    const twin = manifest.branches.find((b) => b.id === `${w}-${arm}-a`);
    if (!twin) fail(`no trobo la branca ${w}-${arm}-a al manifest`);
    for (const v of variants) {
      const id = `${w}-${arm}-${v.name}`;
      const cells = v.square ? [-1, 0, 1].flatMap((dy) => [-1, 0, 1].map((dx) => (y + dy) * WIDTH + (x + dx))) : [y * WIDTH + x];
      const soup = Uint8Array.from(buf);
      const bytes = fromHex(v.genotype.hex);
      const before = cells.map((c) => hex(programAt(soup, c)));
      for (const c of cells) soup.set(bytes, c * PROGRAM_SIZE);
      // només hi canvien els bytes de les cel·les plantades
      const allowed = new Set(cells);
      for (let i = 0; i < soup.length; i++) if (soup[i] !== buf[i] && !allowed.has((i / PROGRAM_SIZE) | 0)) fail(`${id}: ha canviat un byte fora de les cel·les plantades`);
      const out = `${DIR}/sembres/${id}.bin`;
      if (existsSync(at(out))) fail(`${out} ja hi és: no el sobreescric`);
      writeFileSync(at(out), soup);
      const record = { type: 'plant', id, world: w, arm, variant: v.name, genotype: v.genotype.id, hex: v.genotype.hex, source: src, sourceSha256: srcSha,
        output: out, outputSha256: sha256(soup), cells, before, ...h };
      writeFileSync(at(`${DIR}/sembres/${id}.json`), JSON.stringify(record, null, 2) + '\n');
      // l'ordre: la del bessó, amb quatre canvis
      let cmd = twin.command;
      const swap = (re, to) => { const m = cmd.match(re); if (!m || cmd.match(new RegExp(re.source, 'g')).length !== 1) fail(`${id}: l'ordre del bessó no té ${re}`); cmd = cmd.replace(re, to); };
      swap(/--from \S+/, `--from ${out}`);
      swap(/--epochs 16000/, '--epochs 12000');
      swap(/--json \S+/, `--json ${DIR}/registres/${id}.jsonl`);
      swap(/--save \S+ --save-what event/, `--save ${DIR}/captures/${id} --save-every 100`);
      if (!cmd.startsWith('node sim.mjs ')) fail(`${id}: l'ordre del bessó no comença per node sim.mjs`);
      branches.push({ id, world: w, arm, variant: v.name, genotype: v.genotype.id, cells, seed: Number(cmd.match(/--seed (\d+)/)[1]), twin: twin.id, plant: `${DIR}/sembres/${id}.json`, command: cmd });
      list.push(`${id} ${cmd.slice('node sim.mjs '.length)}`);
      console.log(`  ${id}: ${cells.length} cel·la${cells.length > 1 ? 'es' : ''}, ${sha256(soup).slice(0, 16)}…`);
    }
  }
}
writeFileSync(at(`${DIR}/disseny.json`), JSON.stringify({ type: 'design', ...h, worldSeed: WORLD_SEED, worlds, positions, genotypes: genotypes.map((g) => ({ id: g.id, hex: g.hex })), branches }, null, 2) + '\n');
writeFileSync(at(`${DIR}/llista.txt`), list.join('\n') + '\n');

// La prova curta: el primer dels 6 mons, reinit i G1, fins a l'època 8.300
const t = branches.find((b) => b.world === worlds[0] && b.arm === 'reinit' && b.variant === 'G1');
mkdirSync(at(`${DIR}/prova`), { recursive: true });
const testCmd = t.command.replace('--epochs 12000', '--epochs 8300').replace(`--json ${DIR}/registres/`, `--json ${DIR}/prova/registres/`).replace(`--save ${DIR}/captures/`, `--save ${DIR}/prova/captures/`);
writeFileSync(at(`${DIR}/prova/llista.txt`), `${t.id} ${testCmd.slice('node sim.mjs '.length)}\n`);
console.log(`\n${branches.length} branques a llista.txt; la prova curta, ${t.id}, a prova/llista.txt`);
