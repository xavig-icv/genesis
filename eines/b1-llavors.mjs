// Les llavors de B1 (docs/pla-b1.md, §15): l'interval de generadors de cada càlcul, sense solapaments (AUD-146).
//
// Amb el generador v2 (fase1/soup.js), la llavor s fa l'estat de xoshiro128** amb quatre sortides seguides de splitmix32, que
// suma GOLDEN a cada pas: les de s són mix(s + GOLDEN), ..., mix(s + 4·GOLDEN). Dues llavors que difereixen en GOLDEN comparteixen
// tres dels quatre mots de l'estat, desplaçats; en 2·GOLDEN, dos; en 3·GOLDEN, un. Les seqüències no són iguals, però tampoc no
// són d'estats independents. Per això, dos generadors de dos càlculs diferents no poden tenir llavors que difereixin en 0, ±GOLDEN,
// ±2·GOLDEN o ±3·GOLDEN (mòdul 2³²). Dins d'un interval no passa mai: el més ample fa 3,1·10⁸, i 3·GOLDEN (mòdul 2³²) és el més
// petit dels sis desplaçaments, 626.627.285. checkSeedMap ho comprova.
//
// Els càlculs que tornen a fer servir les llavors del nivell 1 són aparellats a propòsit: les variants per cap, C0 i S1 de nou,
// i D½ amb companys de D½ fan servir els mateixos programes que el nivell 1, i no són mostres noves.
export const GOLDEN = 0x9e3779b9;
const MOD = 2 ** 32;

export const LEVEL1 = Object.freeze({ name: 'el nivell 1', from: 20261101, size: 2e8 });  // 10⁸ programes com a molt, 2 generadors cadascun
export const AUTONOMY = Object.freeze({ name: "l'autonomia", from: 250000000, size: 200 });  // 100 condicions, 2 generadors cadascuna
export const STRATA_FROM = 260000000;  // els estrats de la corba ρ(p), un darrere l'altre (strataBlocks)
export const SOUPS_FROM = 2300000000;  // les sopes del pilot, un interval de 2·10⁶ cadascuna, en l'ordre de la llista
export const COVERAGE_SEED = 2500000000;          // la simulació d'eines/densitat-cobertura.mjs (AUD-146: abans, la del pla)
export const STRATA_COVERAGE_SEED = 2500000002;   // la d'eines/estrats-cobertura.mjs

// Els programes de cada estrat k (de 0 a 64): 10⁷ de k = 3 a 12, i 10⁶ als altres (§13). Cada programa gasta dos generadors
export const strataSize = (k) => (k >= 3 && k <= 12 ? 1e7 : 1e6);
export function strataBlocks() {
  const out = [];
  let from = STRATA_FROM;
  for (let k = 0; k <= 64; k++) { out.push({ name: `l'estrat ${k}`, k, from, size: 2 * strataSize(k) }); from += 2 * strataSize(k); }
  return out;
}
export const SOUP_PROGRAMS = 1e6;
export function soupBlocks(n) {
  return Array.from({ length: n }, (_, s) => ({ name: `la sopa ${s}`, s, from: SOUPS_FROM + s * 2 * SOUP_PROGRAMS, size: 2 * SOUP_PROGRAMS }));
}

// Si algun generador de l'interval a i algun del b tenen llavors que difereixen en d (mòdul 2³²)
function shiftedOverlap(a, b, d) {
  // (a + d) ∩ b, en el cercle de 2³²: els intervals, desplegats en [0, 2·2³²)
  const s = (((a.from + d) % MOD) + MOD) % MOD;
  const pieces = (from, size) => (from + size <= MOD ? [[from, from + size]] : [[from, MOD], [0, from + size - MOD]]);
  for (const [x0, x1] of pieces(s, a.size)) for (const [y0, y1] of pieces(b.from, b.size)) if (x0 < y1 && y0 < x1) return true;
  return false;
}
export const SHIFTS = [1, 2, 3].flatMap((m) => [m * GOLDEN, -m * GOLDEN]);
// Comprova tots els intervals entre ells i dins de cadascun. Retorna la llista dels problemes
export function checkSeedMap(blocks) {
  const problems = [];
  for (const b of blocks) {
    if (!(Number.isInteger(b.from) && b.from >= 0 && Number.isInteger(b.size) && b.size > 0 && b.from + b.size <= MOD)) problems.push(`${b.name}: fora de 0 a 2³²`);
    for (const d of SHIFTS) if (shiftedOverlap(b, b, d)) problems.push(`${b.name}: dues llavors de dins difereixen en ${d / GOLDEN}·GOLDEN`);
  }
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const [a, b] = [blocks[i], blocks[j]];
      if (shiftedOverlap(a, b, 0)) problems.push(`${a.name} i ${b.name} es solapen`);
      for (const d of SHIFTS) if (shiftedOverlap(a, b, d)) problems.push(`${a.name} i ${b.name}: llavors que difereixen en ${d / GOLDEN}·GOLDEN`);
    }
  }
  return problems;
}
// El mapa sencer de B1, amb les 22 sopes del pilot
export function seedMap(soups = 22) {
  return [LEVEL1, AUTONOMY, ...strataBlocks(), ...soupBlocks(soups),
    { name: "la simulació de la cobertura del quocient", from: COVERAGE_SEED, size: 1 },
    { name: 'la simulació de la cobertura de la corba', from: STRATA_COVERAGE_SEED, size: 1 }];
}
