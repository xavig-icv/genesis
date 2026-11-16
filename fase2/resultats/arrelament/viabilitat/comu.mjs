// La prova de viabilitat del pilot de l'aparició i l'arrelament (exploratori): el que fan servir tots els scripts d'aquesta carpeta.
// El README d'aquesta carpeta és la nota d'abans de calcular. No importar dins de cap fil (worker_threads): eines/autonomia.mjs hi
// posa el seu receptor de feines.
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { PROGRAM_SIZE, evaluator } from '../../../../fase1/bff.js';
import { WINDOW, MIN_DISTINCT } from '../../../../fase2/replication.js';
import { conditions, testCondition } from '../../../../eines/autonomia.mjs';
import { codeVersion } from '../../../../eines/b1-comu.mjs';

export const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
export const DIR = 'fase2/resultats/arrelament/viabilitat';
// La còpia de seguretat de les captures del pilot de la maduració (origen/, pc/ i vm/, amb el sha256.txt de cada carpeta). El camí és
// una dada interna (CLAUDE.local.md): es dona amb la variable d'entorn GENESIS_PILOT_BACKUP. Quan es va calcular, era una constant
// d'aquest fitxer (fins a e5f5c6d).
export const BACKUP = process.env.GENESIS_PILOT_BACKUP ?? 'GENESIS_PILOT_BACKUP-no-definida';
export const PILOT = 'fase2/resultats/maduracio/pilot';
export const WIDTH = 512, HEIGHT = 256, CELLS = WIDTH * HEIGHT;
export const ARMS = ['continue', 'shuffle-all', 'reinit'];
export const GENOTYPE_SEED = 20261116;   // la regla del pla, §4.1
export const WORLD_SEED = 20261117;      // la tria dels 6 mons
export const POSITION_OFFSET = 700000;   // la posició: la llavor del món + 700.000
export const LINEAGE_OFFSET = 900000;    // la mostra del llinatge: la llavor del món + 900.000
export const INERT_SEED = 3000000000;    // les condicions del pas 2b
export const ROOTED = 1311;              // l'1 % del món
export const SAMPLE = 256;               // les cel·les del llinatge que es proven, com a molt
export const CHEMISTRY = 'C0';
export const interpret = evaluator(CHEMISTRY);

export const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
export const sha256File = (file) => sha256(readFileSync(file));
export const hex = (bytes) => Buffer.from(bytes).toString('hex');
export const fromHex = (h) => Uint8Array.from(Buffer.from(h, 'hex'));
export const programAt = (soup, c) => soup.subarray(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE);
export const at = (rel) => join(ROOT, rel);
export const header = () => ({ code: codeVersion(ROOT), node: process.version, date: new Date().toISOString() });

// Les finestres d'un llinatge, amb la mateixa regla que la prova de replicació (fase2/replication.js, windowsOf i hasWindow): 16 bytes
// seguits amb almenys 6 valors diferents, del programa i del seu mirall; un programa en porta alguna si algun dels seus trossos de 16
// bytes (en el sentit de la cel·la) hi és. Per anar de pressa, s'indexen pels quatre primers bytes.
export class Windows {
  constructor() { this.set = new Set(); this.index = new Map(); }
  get size() { return this.set.size; }
  addProgram(P) {
    for (const b of [P, P.slice().reverse()]) {
      for (let i = 0; i + WINDOW <= PROGRAM_SIZE; i++) {
        const w = b.subarray(i, i + WINDOW);
        if (new Set(w).size < MIN_DISTINCT) continue;
        const key = String.fromCharCode(...w);
        if (this.set.has(key)) continue;
        this.set.add(key);
        const k4 = ((w[0] << 24) | (w[1] << 16) | (w[2] << 8) | w[3]) >>> 0;
        const list = this.index.get(k4);
        if (list) list.push(key); else this.index.set(k4, [key]);
      }
    }
  }
  has(P) {
    for (let i = 0; i + WINDOW <= PROGRAM_SIZE; i++) {
      const k4 = ((P[i] << 24) | (P[i + 1] << 16) | (P[i + 2] << 8) | P[i + 3]) >>> 0;
      const list = this.index.get(k4);
      if (!list) continue;
      const key = String.fromCharCode(...P.subarray(i, i + WINDOW));
      if (list.includes(key)) return true;
    }
    return false;
  }
}

// Un programa amb companys inerts en unes condicions: en quantes es copia i en quantes n'és hereditari (sol o en context)
export function inertTest(bytes, conds) {
  let copies = 0, heritable = 0, heritableSolo = 0;
  for (const cond of conds) {
    const r = testCondition(bytes, cond, interpret);
    if (r.solo || r.context) copies++;
    if (r.heritableSolo || r.heritableContext) heritable++;
    if (r.heritableSolo) heritableSolo++;
  }
  return { copies, heritable, heritableSolo };
}
export const inertConditions = (count) => conditions(INERT_SEED, count);

// Un JSONL, línia a línia
export const readJsonl = (file) => readFileSync(file, 'utf8').split('\n').filter((l) => l !== '').map((l) => JSON.parse(l));
