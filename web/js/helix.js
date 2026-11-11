// El microscopi (web/microscopi/): la cinta de 128 bytes del BFF, plegada en una doble hèlix.
//
// La cinta és un anell: els dos caps hi donen la volta (mòdul 128), i el punter d'instruccions la recorre de 0 a 127. Aquí es
// plega per la meitat: la primera cel·la (les posicions 0 a 63) és una cadena, i la segona (64 a 127), l'altra, al revés. Així, el
// byte i de la primera queda davant del 127 − i de la segona, que és on el posa un replicador que es copia al revés, com els que
// hem vist (fase2/replication.js i cinta.js, mirrorStep). Cada parella està unida per un graó. Els dos graons dels extrems (0 amb
// 127, i 63 amb 64) també tanquen l'anell: el punter passa del 63 al 64, i els caps, del 127 al 0.
//
// Mòdul pur, sense el navegador: el proven les proves del lloc (test/web.mjs).
export const TAPE = 128, HALF = 64;
export const PER_TURN = 22;   // els àtoms d'una volta
export const RISE = 0.95;     // la distància entre dos graons, al llarg de l'eix
export const RADIUS = 3.2;    // el radi de l'hèlix

// La cadena (0, la primera cel·la; 1, la segona) i el graó (de 0 a 63) d'una posició de la cinta, i al revés
export const slot = (p) => (p < HALF ? { strand: 0, j: p } : { strand: 1, j: TAPE - 1 - p });
export const positionOf = (strand, j) => (strand ? TAPE - 1 - j : j);

// L'eix de l'hèlix és l'eix x. Per a cada posició de la cinta: el centre de l'àtom, a la superfície de l'hèlix, i els seus tres
// eixos: x, cap on avança la cinta; y, enfora de l'eix (els sòlids de formes.js tenen la base a y = 0 i miren amunt); i z = x × y
export function atomFrame(p, radius = RADIUS) {
  const { strand, j } = slot(p);
  const dTheta = (2 * Math.PI) / PER_TURN, theta = j * dTheta + (strand ? Math.PI : 0);
  const c = Math.cos(theta), s = Math.sin(theta);
  const center = [(j - (HALF - 1) / 2) * RISE, radius * c, radius * s];
  const y = [0, c, s];
  // la tangent de la cadena, en el sentit en què creix j; a la segona cadena, la cinta avança al revés
  const tx = [RISE, -radius * s * dTheta, radius * c * dTheta], l = Math.hypot(...tx);
  const x = tx.map((v) => (strand ? -v : v) / l);
  const z = [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]];
  return { center, x, y, z, strand, j };
}

// La matriu de model (per columnes, com mat4.js) d'un àtom: els seus eixos, escalats, i el centre, alçat `lift` enfora
export function atomMatrix(f, scale = 1, lift = 0) {
  return new Float32Array([
    f.x[0] * scale, f.x[1] * scale, f.x[2] * scale, 0,
    f.y[0] * scale, f.y[1] * scale, f.y[2] * scale, 0,
    f.z[0] * scale, f.z[1] * scale, f.z[2] * scale, 0,
    f.center[0] + f.y[0] * lift, f.center[1] + f.y[1] * lift, f.center[2] + f.y[2] * lift, 1,
  ]);
}

// Les línies de la molècula: l'esquelet (cada posició amb la següent, i la 127 amb la 0: l'anell) i els graons de dins (cada
// parella i, 127 − i, de l'1 al 62; els dels extrems ja són de l'esquelet). Parelles de posicions de la cinta
export function backbone() { return Array.from({ length: TAPE }, (_, p) => [p, (p + 1) % TAPE]); }
export function rungs() { return Array.from({ length: HALF - 2 }, (_, k) => [k + 1, TAPE - 2 - k]); }

// Quants bytes de la primera cel·la, tal com era al començament (A), hi ha a la segona al seu lloc del mirall: la posició 127 − i
// porta A[i]. És el que s'encén a l'escala
export function mirrored(tape, A) {
  let n = 0;
  for (let i = 0; i < HALF; i++) if (tape[TAPE - 1 - i] === A[i]) n++;
  return n;
}
