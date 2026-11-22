// How the planted replicators die out in the aged soup (exploratory; the note, README.md): what the scripts share.
import { fileURLToPath } from 'url';
import { join } from 'path';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';

export const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..', '..');
export const PILOT = 'fase2/resultats/arrelament/pilot';
export const LINEAGES = 'fase2/resultats/arrelament/llinatges';
export const HERE = 'fase2/resultats/arrelament/extincions';
export const ARMS = ['continue', 'shuffle-all', 'reinit'];
export const VARIANTS = ['G1', 'G1x9', 'G4'];
// the bootstrap over worlds (the note): 10,000 resamples, a seed of no plan
export const BOOTSTRAP = { count: 10000, seed: 20261125 };
// the first byte that makes a copy of G1 not heritable (audit 38, auditor 1): ']' (93) or 0
export const BAD_FIRST = new Set([93, 0]);
export const sha256 = (b) => createHash('sha256').update(b).digest('hex');
export const readJsonl = (file) => readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
