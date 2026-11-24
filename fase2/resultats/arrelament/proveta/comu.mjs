// The test tube (exploratory; the note, README.md): what the scripts share.
import { fileURLToPath } from 'url';
import { join } from 'path';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';

export const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..', '..');
export const PILOT = 'fase2/resultats/arrelament/pilot';
export const LINEAGES = 'fase2/resultats/arrelament/llinatges';
export const HERE = 'fase2/resultats/arrelament/proveta';
export const SOUPS = ['continue', 'shuffle-all', 'reinit'];
// the pools of a world: its three soups, and the aged soup with its ] and 0 first bytes replaced (fixed) or as many others (placebo)
export const KINDS = ['continue', 'shuffle-all', 'reinit', 'fixed', 'placebo'];
export const PLANTED = ['G1', 'G2', 'G3', 'G4'];
export const CONDITIONS = 20;            // per pool
export const PROGRAMS_CAP = 4;           // the first programs of a lineage's first detection
export const CONDITIONS_SEED = 1126000000;  // condition j of pool k: partners CONDITIONS_SEED + 1000 k + 2 j, test + 1
export const TRANSFORM_SEED = 1127000000;   // world i: fixed TRANSFORM_SEED + 2 i, placebo + 1
export const BOOTSTRAP = { count: 10000, seed: 20261126 };
// the first bytes that make a copy of G1 not heritable (audit 38, auditor 1): ']' (93) or 0
export const BAD_FIRST = new Set([93, 0]);
export const sha256 = (b) => createHash('sha256').update(b).digest('hex');
export const readJsonl = (file) => readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
export const poolIndex = (worldIndex, kind) => 5 * worldIndex + KINDS.indexOf(kind);
