// El cens dels experiments 2D: quanta vida hi ha al món en una època.
//
// Versió 3 (iteració 3, després de l'auditoria 2 i de l'auditoria externa 2). La mesura principal és
// funcional: es posa a prova una mostra de cel·les diferents, triades a l'atzar, amb la prova de
// replicació completa i la de segona generació (replication.js), i es compta quantes són replicadors
// hereditaris. No depèn del registre de famílies: el territori d'una família (les cel·les que en
// porten un tros del nucli) es desvia de la quantitat de replicadors en tots dos sentits (AU2-01), i
// els identificadors de família canvien quan les famílies es fusionen (AUD-32). Les famílies es
// continuen calculant, però només per descriure el món.
//
// Versió 2: el cens d'abans, només el registre de famílies (mostra de 512 amb reemplaçament). Es
// manté per reproduir exactament els registres dels experiments anteriors.
//
// El criteri d'establiment de la vida (protocol estadístic, §4) és aquí, i el fan servir tant sim.mjs
// (per aturar l'experiment) com l'anàlisi (fase2/estadistica.mjs): és el mateix codi.
import { makeRng } from '../fase1/soup.js';
import { replicationTest } from './replication.js';
import { createFamilyTracker } from './families.js';

export const CENSUS_VERSIONS = ['v2', 'v3'];
export const CENSUS_SAMPLE = 2048;   // cel·les que es posen a prova a cada cens (v3)
export const CENSUS_SEED = 20261016; // llavor del generador propi del cens (v3), independent del món
export const EVENT_SHARE = 0.01;     // establiment: almenys l'1 % de la mostra són replicadors hereditaris...
export const EVENT_CENSUSES = 2;     // ...en dos censos seguits

// El criteri d'establiment sobre una llista de censos en ordre ({ epoch, sample, heritable }, com els
// del JSONL). Retorna l'època del primer dels censos seguits que el compleixen, o null.
export function establishment(censuses, share = EVENT_SHARE, count = EVENT_CENSUSES) {
  let run = 0;
  for (let i = 0; i < censuses.length; i++) {
    const c = censuses[i];
    run = c.sample > 0 && c.heritable / c.sample >= share ? run + 1 : 0;
    if (run >= count) return censuses[i - count + 1].epoch;
  }
  return null;
}

export function createCensus({ version = 'v3', width, radius = 2, sample = CENSUS_SAMPLE } = {}) {
  if (!CENSUS_VERSIONS.includes(version)) throw new Error(`versió del cens desconeguda: ${version}`);
  const tracker = createFamilyTracker(undefined, { sampling: version === 'v2' ? 'v2' : 'v3' });
  const rng = makeRng(CENSUS_SEED, 'v2');
  let indices = null;

  // Una mostra de `size` cel·les diferents (Fisher-Yates parcial), o totes si n'hi ha menys
  function pick(n, size) {
    if (n <= size) return Uint32Array.from({ length: n }, (_, i) => i);
    if (indices?.length !== n) indices = Uint32Array.from({ length: n }, (_, i) => i);
    for (let k = 0; k < size; k++) {
      const j = k + ((rng() * (n - k)) | 0);
      [indices[k], indices[j]] = [indices[j], indices[k]];
    }
    return indices.slice(0, size);
  }

  // Analitza el món (no el modifica). Retorna el registre del cens: el que s'escriu al JSONL.
  function run(soup, n, epoch) {
    const fam = tracker.analyse(soup, n, epoch, width, radius);
    const record = {
      type: 'census', version, epoch,
      families: fam.families.map((f) => ({ id: f.id, born: f.born, share: f.share, core: f.core })),
      extinct: fam.extinct, untracked: fam.untracked, familySample: fam.alive,
    };
    if (version === 'v2') return record;
    const cells = pick(n, sample);
    let replicating = 0, solo = 0, context = 0, heritable = 0;
    for (const c of cells) {
      const r = replicationTest(soup, c, rng, { width, radius, complete: true, heredity: true });
      if (r.solo || r.context) replicating++;
      if (r.solo) solo++;
      if (r.context) context++;
      if (r.heritable) heritable++;
    }
    return { ...record, sample: cells.length, replicating, solo, context, heritable };
  }

  // La línia del registre de text. La de la v2 és exactament la d'abans.
  function line(r) {
    const fams = r.families.map((f) => `#${f.id}:${(f.share * 100).toFixed(2)}%(${f.core})`).join(' ');
    const tail = `famílies=${r.families.length}${fams ? `  ${fams}` : ''}${r.extinct.length ? `  extingides=${r.extinct.join(',')}` : ''}`;
    if (r.version === 'v2') return `cens ${r.epoch}  es repliquen=${(r.familySample * 100).toFixed(1)}%  ${tail}`;
    const pct = (x) => `${((x / r.sample) * 100).toFixed(1)}%`;
    return `cens ${r.epoch}  mostra=${r.sample}  hereditaris=${pct(r.heritable)}  es repliquen=${pct(r.replicating)}` +
      ` (sols ${pct(r.solo)}, en context ${pct(r.context)})  ${tail}${r.untracked.length ? `  sense seguiment=${r.untracked.join(',')}` : ''}`;
  }

  return { run, line };
}
