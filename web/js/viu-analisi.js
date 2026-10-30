// El treballador d'anàlisi del món en viu: rep una còpia del món cada 50 èpoques i hi passa el registre de famílies
// (fase2/families.js, per defecte, com les dades de l'explorador: el color del mapa) i, cada 250, el cens v3
// (fase2/census.js, com sim.mjs: els replicadors hereditaris de la mostra i el criteri d'establiment). Les còpies
// s'han d'analitzar totes i en ordre: el registre i el cens guarden estat d'un cop a l'altre.
import { createCensus } from '../../fase2/census.js';
import { createFamilyTracker } from '../../fase2/families.js';
import { PROGRAM_SIZE } from '../../fase1/bff.js';
import { fingerprint } from './viu-motor.js';

let census = null, tracker = null, world = null;

self.onmessage = ({ data: m }) => {
  if (m.type === 'reset') {
    world = { gen: m.gen, width: m.width, radius: m.radius };
    census = createCensus({ version: 'v3', width: m.width, radius: m.radius });
    tracker = createFamilyTracker();
    return;
  }
  if (!world || m.gen !== world.gen) return;
  const soup = new Uint8Array(m.buffer), n = soup.length / PROGRAM_SIZE;
  const f = tracker.analyse(soup, n, m.epoch, world.width, world.radius);
  const out = {
    gen: m.gen, epoch: m.epoch, map: f.map,
    families: f.families.map(({ id, born, share, core }) => ({ id, born, share, core })),
  };
  if (m.census) {
    const r = census.run(soup, n, m.epoch);
    out.census = { epoch: m.epoch, sample: r.sample, heritable: r.heritable, line: census.line(r), fingerprint: fingerprint(soup) };
  }
  self.postMessage(out, [out.map.buffer]);
};
