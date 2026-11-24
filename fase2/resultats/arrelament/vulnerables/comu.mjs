// The first-byte vulnerability of the natural establishments (exploratory; the note, README.md): what the scripts share.
import { fileURLToPath } from 'url';
import { join } from 'path';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';

export const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..', '..');
export const PILOT = 'fase2/resultats/arrelament/pilot';
export const LINEAGES = 'fase2/resultats/arrelament/llinatges';
export const HERE = 'fase2/resultats/arrelament/vulnerables';
export const ARMS = ['continue', 'shuffle-all', 'reinit'];
// the three kinds of partner, by their first byte: ']' (93), 0, and any other
export const KINDS = [']', '0', 'other'];
export const kindOf = (first) => (first === 93 ? ']' : first === 0 ? '0' : 'other');
export const PER_KIND = 20;
// the partners of world i (its position in the cohort, from 0), soup a and kind k (the note): a seed of no plan
export const PARTNER_SEED = 1128000000;
export const partnerSeed = (i, a, k) => (PARTNER_SEED + 100 * i + 10 * a + k) >>> 0;
// the bootstrap over worlds (the note): 10,000 resamples, a seed of no plan
export const BOOTSTRAP = { count: 10000, seed: 20261128 };
// the calibration (the note): G1 vulnerable, and G4 working and not vulnerable, in 54 of the 60 worlds or more
export const CALIBRATION = { worlds: 54 };
export const GENOTYPES = ['G1', 'G2', 'G3', 'G4'];
export const sha256 = (b) => createHash('sha256').update(b).digest('hex');
export const readJsonl = (file) => readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
// auditor 1's definitions (the note): a program works if it has a heritable copy with the partners of the other kind, and is vulnerable if
// it works and has none with the ']' partners
export const works = (c) => c.other.h >= 1;
export const vulnerable = (c) => works(c) && c[']'].h === 0;
export const vulnerableTo0 = (c) => works(c) && c['0'].h === 0;
