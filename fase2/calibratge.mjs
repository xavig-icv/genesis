// Calibratge del cens v3 (iteració 3): el cens sobre les captures clau, i la concordança entre el
// territori de les famílies i els replicadors comprovats (AU2-01 de l'auditoria externa 2).
//
// Ús: node fase2/calibratge.mjs [mostra=2048] [captura.bin ...]
//     Sense captures, fa servir les de docs/captures.sha256 que hi hagi al disc (vegeu docs/captures.md).
//     Els noms que contenen "mon<W>x<H>" són mons 2D; la resta, sopes barrejades.
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { PROGRAM_SIZE } from '../fase1/bff.js';
import { makeRng } from '../fase1/soup.js';
import { createCensus } from './census.js';
import { createFamilyTracker } from './families.js';
import { replicationTest } from './replication.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const [sampleArg, ...given] = process.argv.slice(2);
const sample = Number(sampleArg ?? 2048);
if (!Number.isInteger(sample) || sample < 1) {
  console.error('Ús: node fase2/calibratge.mjs [mostra=2048] [captura.bin ...]');
  process.exit(2);
}
const files = given.length ? given : readFileSync(join(root, 'docs', 'captures.sha256'), 'utf8').trim().split('\n')
  .map((l) => join(root, l.split(/\s+\*?/)[1])).filter((f) => existsSync(f));

const pct = (x, n) => `${((x / n) * 100).toFixed(1)} %`;
for (const file of files) {
  const soup = new Uint8Array(readFileSync(file));
  const n = soup.length / PROGRAM_SIZE;
  const m = file.match(/mon(\d+)x(\d+)/);
  const width = m ? Number(m[1]) : 0;
  const t0 = Date.now();
  const r = createCensus({ width, sample }).run(soup, n, 0);
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`${file.split(/[\\/]/).pop()}  (${width ? `món ${m[1]}x${m[2]}` : `sopa ${n}`}, ${secs} s)`);
  console.log(`  mostra ${r.sample}: es repliquen ${pct(r.replicating, r.sample)} (sols ${pct(r.solo, r.sample)}, en context ${pct(r.context, r.sample)}), hereditaris ${pct(r.heritable, r.sample)}`);

  // Concordança: de les cel·les de cada territori i de fora, quantes són replicadors hereditaris?
  const fam = createFamilyTracker().analyse(soup, n, 0, width);
  const rng = makeRng(7, 'v2');
  const rate = (inside) => {
    let tested = 0, heritable = 0;
    for (let tries = 0; tested < 500 && tries < 200000; tries++) {
      const c = (rng() * n) | 0;
      if (!inside(fam.map[c])) continue;
      tested++;
      if (replicationTest(soup, c, rng, { width, heredity: true }).heritable) heritable++;
    }
    return tested ? `${pct(heritable, tested)} de ${tested}` : '—';
  };
  fam.families.forEach((f, i) => console.log(`  família #${f.id} (territori ${(f.share * 100).toFixed(2)} %): hereditaris dins ${rate((v) => v === i + 1)}`));
  console.log(`  fora de tot territori: hereditaris ${rate((v) => v === 0)}`);
}
