// Les famílies naturals seguides com els plantats (exploratori; la nota, README.md): el que comparteixen els scripts.
import { fileURLToPath } from 'url';
import { join } from 'path';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';

export const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..', '..');
export const PILOT = 'fase2/resultats/arrelament/pilot';
export const AQUI = 'fase2/resultats/arrelament/llinatges';
export const ARMS = ['continue', 'shuffle-all', 'reinit'];
// la llavor de cada llinatge natural (la nota): 917000000 + 1.000 × el món + 100 × la sopa + l'ordre de creació a la branca
export const lineageSeed = (world, soup, k) => 917000000 + 1000 * Number(world) + 100 * ARMS.indexOf(soup) + k;
export const BOOTSTRAP = { count: 10000, seed: 20261122 };
export const sha256 = (b) => createHash('sha256').update(b).digest('hex');
export const readJsonl = (file) => readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
