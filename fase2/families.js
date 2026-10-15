// El registre de famílies de replicadors (versió 2).
//
// La versió 1 buscava fragments abundants i després comprovava si es copiaven.
// L'escombrat de corrents (entrada 4 del quadern) en va mostrar tres punts cecs:
// no veia els replicadors espaiats, no veia els que necessiten una parella i no
// seguia les famílies quan evolucionaven. Aquesta versió comença per la vida:
//
//  1. Prova de replicació sobre una mostra de cel·les a l'atzar: primer amb un
//     company de soroll i segon amb un company del mateix món. Es replica qui deixa
//     al company 16 bytes seguits de si mateix (o del seu mirall), no monòtons.
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
import { PROGRAM_SIZE, TAPE_SIZE, KIND, evaluate } from '../fase1/bff.js';
import { createRng } from '../fase1/soup.js';

const SAMPLE = 512;          // cel·les que es posen a prova a cada anàlisi
const CONTEXT_TRIALS = 4;    // trobades en segona posició amb un veí, per cel·la
const WINDOW = 16;           // una còpia: 16 bytes seguits del programa (o del seu mirall)...
const MIN_DISTINCT = 6;      // ...amb almenys 6 valors diferents (zeros i <<<< no compten)
const K = 5;                 // trossos de codi compacte per comparar replicadors
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

function grams(s, k) {
  const out = new Set();
  for (let i = 0; i + k <= s.length; i++) out.add(s.slice(i, i + k));
  return out;
}

// Finestres de 16 bytes del programa i del seu mirall, prou variades per no coincidir per atzar.
function windowsOf(A) {
  const set = new Set();
  for (const b of [A, A.slice().reverse()]) {
    for (let i = 0; i + WINDOW <= PROGRAM_SIZE; i++) {
      const w = b.subarray(i, i + WINDOW);
      if (new Set(w).size >= MIN_DISTINCT) set.add(String.fromCharCode(...w));
    }
  }
  return set;
}

function hasWindow(P, set) {
  for (let i = 0; i + WINDOW <= PROGRAM_SIZE; i++) if (set.has(String.fromCharCode(...P.subarray(i, i + WINDOW)))) return true;
  return false;
}

// Es replica el programa de la cel·la c? Prova sol (primer, company de soroll) i en
// context: segon, amb un company que encara no porti cap tros seu. Si coneixem
// l'amplada del món, el company és un veí (a 2 cel·les com a molt), que és amb
// qui es troba de debò; si no, una cel·la qualsevol.
export function replicates(soup, c, rng, width = 0) {
  const n = soup.length / PROGRAM_SIZE;
  const height = width ? n / width : 0;
  const partnerCell = () => {
    if (!width) return (rng() * n) | 0;
    const x = c % width, y = (c / width) | 0;
    let nx, ny;
    do {
      nx = x + ((rng() * 5) | 0) - 2;
      ny = y + ((rng() * 5) | 0) - 2;
    } while ((nx === x && ny === y) || nx < 0 || ny < 0 || nx >= width || ny >= height);
    return ny * width + nx;
  };
  const A = soup.slice(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE);
  const set = windowsOf(A);
  if (!set.size) return false;
  const tape = new Uint8Array(TAPE_SIZE);
  const run = (first, second, partnerOffset) => {
    tape.set(first, 0);
    tape.set(second, PROGRAM_SIZE);
    evaluate(tape, 0);
    return hasWindow(tape.subarray(partnerOffset, partnerOffset + PROGRAM_SIZE), set);
  };
  for (let t = 0; t < 2; t++) {
    const B = Uint8Array.from({ length: PROGRAM_SIZE }, () => (rng() * 256) | 0);
    if (run(A, B, PROGRAM_SIZE)) return true;
  }
  for (let t = 0; t < CONTEXT_TRIALS; t++) {
    let B = null;
    for (let tries = 0; tries < 20 && !B; tries++) {
      const p = partnerCell();
      const P = soup.subarray(p * PROGRAM_SIZE, (p + 1) * PROGRAM_SIZE);
      if (!hasWindow(P, set)) B = P.slice();
    }
    if (B && run(B, A, 0)) return true;
  }
  return false;
}

export function createFamilyTracker(seed = 20261014) {
  let families = [];
  let nextId = 1;
  let rng = createRng(seed);

  function reset() {
    families = [];
    nextId = 1;
    rng = createRng(seed);
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
    for (const s of codes) for (const g of grams(s, K)) { p.add(g); p.add(reverse(g)); }
    return p;
  };
  const coreOf = (codes) => {
    const count = new Map();
    for (const s of codes) for (const g of new Set([...grams(s, CORE)].map(canonical))) count.set(g, (count.get(g) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, CORE_SIZE).map(([g]) => g);
  };

  // Analitza una còpia del mapa. Retorna les famílies vives, les que s'acaben
  // d'extingir, un mapa amb la família de cada cel·la (0 = cap; si no, índex+1) i
  // la fracció de cel·les de la mostra que es repliquen.
  function analyse(soup, n, epoch, width = 0) {
    // 1. Replicadors de la mostra, amb el seu codi compacte
    const sampleSize = Math.min(SAMPLE, n);
    const replicators = [];
    for (let k = 0; k < sampleSize; k++) {
      const c = n <= SAMPLE ? k : (rng() * n) | 0;
      if (!replicates(soup, c, rng, width)) continue;
      const code = compactCode(soup, c);
      if (code.length >= K) replicators.push({ c, code, kg: grams(code, K) });
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
    if (alive.length > MAX_TRACKED) {
      const dropped = new Set([...alive].sort((a, b) => b.cells - a.cells).slice(MAX_TRACKED).map((f) => f.id));
      extinct.push(...dropped);
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
      alive: replicators.length / sampleSize,
      families: families.map((f) => ({
        id: f.id, slot: f.slot, born: f.born, share: f.cells / n, core: f.core[0] ?? '', example: f.example,
      })),
    };
  }

  return { analyse, reset };
}
