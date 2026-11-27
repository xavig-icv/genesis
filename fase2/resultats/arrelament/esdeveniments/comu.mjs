// A record of copy events (exploratory; the note, README.md): the constants the run, the validation and the analysis share.
export const HERE = 'fase2/resultats/arrelament/esdeveniments';
export const LIST = `${HERE}/llista.json`;
export const WINDOW = 1250;        // the window before each detection census, as the earlier notes
export const STEP = 50;            // the checkpoints' spacing: segments (s, s + 50]
export const FOLLOW_RADIUS = 4;    // the neighbours followed with each cell asked for (the pairing radius is 2: partners and their partners)
export const BOOT_SEED = 3500000000, BOOT_COUNT = 10000;   // the bootstrap of the recount (this note's seed; no plan's)
export const REF_CELLS = 4;          // the cells of a reference lineage whose chains are followed (the first in the tracking)
export const K_SENS = 4;            // a sensitivity: bytes traced back through 4 transfers
export const LIST_SHA256 = 'eeeb890b15826c31ade8c7c4738a9704aff2e095db1c625f73d1963374c42294';   // llista.json, from prepara.mjs (previ/prepara-2)
