// El registre de famílies de replicadors (versió 2).
//
// La versió 1 buscava fragments abundants i després comprovava si es copiaven.
// L'escombrat de corrents (entrada 4 del quadern) en va mostrar tres punts cecs:
// no veia els replicadors espaiats, no veia els que necessiten una parella i no
// seguia les famílies quan evolucionaven. Aquesta versió comença per la vida:
//
//  1. Prova de replicació (replication.js) sobre una mostra de cel·les a l'atzar: primer
//     amb un company de soroll i segon amb un veí. Es replica qui deixa al company 16
//     bytes seguits de si mateix (o del seu mirall), no monòtons.
//  2. El codi compacte de cada replicador: només les instruccions, sense dades.
//     El palíndrom espaiat ···[········{··.>····]]····>.··{········[··· queda [{.>]]>.{[
//  3. Famílies per semblança: els replicadors que comparteixen trossos de 5
//     instruccions seguides, en qualsevol dels dos sentits, són de la mateixa família.
//  4. El nucli de cada família (els seus trossos de 6 instruccions més comuns) es
//     recalcula a cada anàlisi amb els membres actuals: així segueix l'evolució.
//  5. Territori: una cel·la és de la família si el seu codi compacte conté el nucli.
//
// Cada família conserva el color mentre viu: el color segueix la família, no la
// seva posició al rànquing.
//
// Mostreig (opció `sampling`): a la v3, la mostra són cel·les diferents (AU2-03 de l'auditoria
// externa 2: a la v2 es triaven amb reemplaçament i una cel·la podia sortir dues vegades), i les
// famílies que se surten del seguiment perquè n'hi ha massa no es donen per extingides (AUD-14). La
// v2 es manté per reproduir exactament els censos dels registres antics.
//
// Trossos informatius (opció `minDistinct`, AUD-162 i AU2-134): els trossos de codi compacte que fa servir el registre
// (els de 5 instruccions, per saber si dos replicadors s'assemblen, i els de 6 del nucli, i per tant el territori) han de
// tenir almenys `minDistinct` instruccions diferents. Amb 1, el valor per defecte, compten tots, com sempre: els censos i
// les sèries tancades no canvien. Amb 3, un tros com `[[[[[[` o `<<<>>>` no identifica cap família: molts programes tenen
// tirades d'una instrucció entre les dades, que al codi compacte es tornen contigües, i al món 1006 una família de nucli
// `[[[[[[` pintava durant dos fotogrames el 17 % de les cel·les. En trossos de 5 i de 6, demanar-ne 3 de diferents és el
// mateix que demanar més d'1 bit d'entropia. L'opció no toca el generador aleatori: amb qualsevol valor, la mostra i els
// replicadors són els mateixos, i només canvien les famílies, el nucli i el territori.
import { PROGRAM_SIZE, KIND } from '../fase1/bff.js';
import { createRng } from '../fase1/soup.js';
import { replicates } from './replication.js';

const SAMPLE = 512;          // cel·les que es posen a prova a cada anàlisi
const K = 5;                // trossos de codi compacte per comparar replicadors
const MATCH = 0.5;           // fracció de trossos compartits per ser de la mateixa família
const MIN_MEMBERS = 3;       // una família nova necessita 3 replicadors a la mostra
const CORE = 6;              // mida dels trossos del nucli
const CORE_SIZE = 3;         // trossos que formen el nucli
const COLORED = 3;           // famílies amb color propi (la resta, "altres")
const MAX_TRACKED = 12;      // famílies seguides alhora
const DEATH_SHARE = 0.0005;  // per sota del 0,05 % del mapa...
const DEATH_SAMPLES = 5;     // ...durant 5 anàlisis seguides, la família s'ha extingit

const OPCHAR = Array.from({ length: 256 }, (_, v) => (KIND[v] ? String.fromCharCode(v) : ''));
const reverse = (s) => [...s].reverse().join('');
const canonical = (g) => { const r = reverse(g); return g < r ? g : r; };

// Les instruccions del programa de la cel·la c, sense les dades.
export function compactCode(soup, c) {
  let s = '';
  const base = c * PROGRAM_SIZE;
  for (let i = 0; i < PROGRAM_SIZE; i++) s += OPCHAR[soup[base + i]];
  return s;
}

// Els trossos de k instruccions seguides d'un codi compacte; amb minDistinct > 1, només els que en tenen prou de diferents
function grams(s, k, minDistinct = 1) {
  const out = new Set();
  for (let i = 0; i + k <= s.length; i++) {
    const g = s.slice(i, i + k);
    if (minDistinct <= 1 || new Set(g).size >= minDistinct) out.add(g);
  }
  return out;
}

export const SAMPLING_VERSIONS = ['v2', 'v3'];

export function createFamilyTracker(seed = 20261014, { sampling = 'v3', minDistinct = 1 } = {}) {
  if (!SAMPLING_VERSIONS.includes(sampling)) throw new Error(`mostreig desconegut: ${sampling}`);
  if (!Number.isInteger(minDistinct) || minDistinct < 1 || minDistinct > K) throw new Error(`minDistinct ha de ser un enter de 1 a ${K}: ${minDistinct}`);
  let families = [];
  let nextId = 1;
  let rng = createRng(seed);
  let indices = null; // v3: permutació parcial de les cel·les (Fisher-Yates), per triar-ne sense repetir

  function reset() {
    families = [];
    nextId = 1;
    rng = createRng(seed);
    indices = null;
  }

  // Fracció dels trossos de `kg` que són al perfil `profile`.
  const containment = (kg, profile) => {
    if (!kg.size) return 0;
    let hit = 0;
    for (const g of kg) if (profile.has(g)) hit++;
    return hit / kg.size;
  };
  const profileOf = (codes) => {
    const p = new Set();
    for (const s of codes) for (const g of grams(s, K, minDistinct)) { p.add(g); p.add(reverse(g)); }
    return p;
  };
  const coreOf = (codes) => {
    const count = new Map();
    for (const s of codes) for (const g of new Set([...grams(s, CORE, minDistinct)].map(canonical))) count.set(g, (count.get(g) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, CORE_SIZE).map(([g]) => g);
  };

  // Analitza una còpia del mapa. Retorna les famílies vives, les que s'acaben
  // d'extingir, un mapa amb la família de cada cel·la (0 = cap; si no, índex+1) i
  // la fracció de cel·les de la mostra que es repliquen.
  function analyse(soup, n, epoch, width = 0, radius = 2) {
    // 1. Replicadors de la mostra, amb el seu codi compacte
    const sampleSize = Math.min(SAMPLE, n);
    const replicators = [];
    if (sampling === 'v3' && n > SAMPLE && indices?.length !== n) indices = Uint32Array.from({ length: n }, (_, i) => i);
    for (let k = 0; k < sampleSize; k++) {
      let c;
      if (n <= SAMPLE) c = k;
      else if (sampling === 'v2') c = (rng() * n) | 0;
      else {
        const j = k + ((rng() * (n - k)) | 0);
        [indices[k], indices[j]] = [indices[j], indices[k]];
        c = indices[k];
      }
      if (!replicates(soup, c, rng, { width, radius })) continue;
      const code = compactCode(soup, c);
      if (code.length >= K) replicators.push({ c, code, kg: grams(code, K, minDistinct) });
    }

    // 2. Cada replicador va a la família coneguda que més s'hi assembla...
    const members = new Map(families.map((f) => [f.id, []]));
    const loose = [];
    for (const r of replicators) {
      let best = null, bestScore = MATCH;
      for (const f of families) {
        const score = containment(r.kg, f.profile);
        if (score >= bestScore) { best = f; bestScore = score; }
      }
      if (best) members.get(best.id).push(r); else loose.push(r);
    }
    // ...i els que no en tenen cap s'agrupen entre ells: si en són prou, família nova
    const clusters = [];
    for (const r of loose) {
      const cl = clusters.find((x) => containment(r.kg, x.profile) >= MATCH);
      if (cl) { cl.items.push(r); for (const g of r.kg) { cl.profile.add(g); cl.profile.add(reverse(g)); } }
      else clusters.push({ items: [r], profile: profileOf([r.code]) });
    }
    for (const cl of clusters) {
      if (cl.items.length < MIN_MEMBERS) continue;
      const f = { id: nextId++, born: epoch, slot: -1, low: 0, cells: 0, profile: cl.profile, core: [], example: null };
      families.push(f);
      members.set(f.id, cl.items);
    }

    // 3. El perfil i el nucli es refan amb els membres d'ara (si n'hi ha a la mostra)
    for (const f of families) {
      const m = members.get(f.id) ?? [];
      if (!m.length) continue;
      const codes = m.map((r) => r.code);
      f.profile = profileOf(codes);
      f.core = coreOf(codes);
      f.example = soup.slice(m[0].c * PROGRAM_SIZE, (m[0].c + 1) * PROGRAM_SIZE);
    }

    // 3b. Dues famílies que han acabat amb un tros de nucli en comú són la mateixa:
    //     la més jove s'uneix a la més antiga (no compta com a extinció)
    families.sort((a, b) => a.born - b.born || a.id - b.id);
    for (let i = 0; i < families.length; i++) {
      for (let j = families.length - 1; j > i; j--) {
        if (families[j].core.some((g) => families[i].core.includes(g))) {
          if (families[i].slot < 0) families[i].slot = families[j].slot;
          families.splice(j, 1);
        }
      }
    }

    // 4. Territori: cel·les que contenen algun tros del nucli (en qualsevol sentit).
    //    Les famílies més antigues tenen preferència.
    const owner = new Uint8Array(n);
    const needles = families.map((f) => f.core.flatMap((g) => [g, reverse(g)]));
    for (const f of families) f.cells = 0;
    for (let c = 0; c < n; c++) {
      const code = compactCode(soup, c);
      if (code.length < CORE) continue;
      for (let i = 0; i < families.length; i++) {
        if (needles[i].some((g) => code.includes(g))) { owner[c] = i + 1; families[i].cells++; break; }
      }
    }

    // 5. Extincions
    for (const f of families) f.low = f.cells / n < DEATH_SHARE ? f.low + 1 : 0;
    let alive = families.filter((f) => f.low < DEATH_SAMPLES);
    const extinct = families.filter((f) => f.low >= DEATH_SAMPLES).map((f) => f.id);
    const untracked = [];
    if (alive.length > MAX_TRACKED) {
      const dropped = new Set([...alive].sort((a, b) => b.cells - a.cells).slice(MAX_TRACKED).map((f) => f.id));
      (sampling === 'v2' ? extinct : untracked).push(...dropped);
      alive = alive.filter((f) => !dropped.has(f.id));
    }

    // 6. Colors: les famílies que ja en tenen el conserven; els lliures van a les més grans
    const used = new Set(alive.map((f) => f.slot).filter((s) => s >= 0));
    for (const f of [...alive].sort((a, b) => b.cells - a.cells)) {
      if (f.slot >= 0) continue;
      for (let s = 0; s < COLORED; s++) if (!used.has(s)) { f.slot = s; used.add(s); break; }
    }

    // 7. El mapa es va fer amb la llista sencera: el tornem a numerar segons les vives
    const remap = new Uint8Array(families.length + 1);
    families.forEach((f, idx) => { remap[idx + 1] = alive.indexOf(f) + 1; });
    const map = new Uint8Array(n);
    for (let i = 0; i < n; i++) map[i] = remap[owner[i]];
    families = alive;

    return {
      map,
      extinct,
      untracked,
      alive: replicators.length / sampleSize,
      families: families.map((f) => ({
        id: f.id, slot: f.slot, born: f.born, share: f.cells / n, core: f.core[0] ?? '', example: f.example,
      })),
    };
  }

  return { analyse, reset };
}
