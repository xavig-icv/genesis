// L'estadística de les anàlisis de B1 que venen després del nivell 1 (docs/pla-b1.md, §4, §13 i §14), sense dependències:
//  - la funció gamma incompleta regularitzada, P(a, x), i la beta incompleta regularitzada, I_x(a, b), amb la sèrie i la fracció
//    contínua de sempre (Numerical Recipes, §6.2 i §6.4), i les seves inverses per bisecció;
//  - l'interval de Clopper-Pearson amb els quantils de la beta: el mateix que el d'eines/densitat-analisi.mjs (que suma els termes
//    de la binomial, i només és pràctic amb pocs èxits), també amb milers (test/b1-estadistica.mjs els compara);
//  - l'interval gamma de Fay i Feuer (1997) d'una suma ponderada de recomptes de Poisson, el de les taxes estandarditzades: el de la
//    densitat reconstruïda amb els estrats, ρ(p) = Σₖ wₖ(p) · xₖ / nₖ (§13). És conservador en gairebé tots els casos que s'hi han
//    estudiat; eines/estrats-cobertura.mjs en mesura la cobertura amb els nostres pesos.

// ln Γ(x), x > 0 (Lanczos, g = 7, n = 9)
const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
  12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
export function lnGamma(x) {
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  x -= 1;
  let a = LANCZOS[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += LANCZOS[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

// P(a, x), la gamma incompleta regularitzada inferior
export function gammaP(a, x) {
  if (x <= 0) return 0;
  if (x < a + 1) {
    let sum = 1 / a, del = sum, ap = a;
    for (let n = 0; n < 10000; n++) { ap += 1; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-16) break; }
    return Math.min(1, sum * Math.exp(-x + a * Math.log(x) - lnGamma(a)));
  }
  // la fracció contínua de Q(a, x) (Lentz)
  let b = x + 1 - a, c = 1 / 1e-300, d = 1 / b, h = d;
  for (let i = 1; i < 10000; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-16) break;
  }
  return Math.max(0, 1 - Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h);
}

// I_x(a, b), la beta incompleta regularitzada
function betacf(a, b, x) {
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - (qab * x) / qap;
  if (Math.abs(d) < 1e-300) d = 1e-300;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 100000; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-16) break;
  }
  return h;
}
export function betaI(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log1p(-x));
  return x < (a + 1) / (a + b + 2) ? (front * betacf(a, b, x)) / a : 1 - (front * betacf(b, a, 1 - x)) / b;
}

// La inversa d'una funció de distribució creixent, per bisecció, a [lo, hi]
function invert(cdf, q, lo, hi) {
  for (let i = 0; i < 300; i++) { const mid = (lo + hi) / 2; if (cdf(mid) < q) lo = mid; else hi = mid; if (hi - lo <= 1e-15 * Math.max(1, hi)) break; }
  return (lo + hi) / 2;
}
export const betaQuantile = (q, a, b) => invert((x) => betaI(a, b, x), q, 0, 1);
export function gammaQuantile(q, shape, scale) {
  let hi = Math.max(1, shape) * scale;
  while (gammaP(shape, hi / scale) < q) hi *= 2;
  return invert((x) => gammaP(shape, x / scale), q, 0, hi);
}

// L'interval de Clopper-Pearson del 95 % de k èxits de n, amb els quantils de la beta
export function clopperPearsonBeta(k, n, level = 0.95) {
  const a = (1 - level) / 2;
  return [k === 0 ? 0 : betaQuantile(a, k, n - k + 1), k === n ? 1 : betaQuantile(1 - a, k + 1, n - k)];
}

// L'interval de Fay i Feuer (1997) de y = Σ cᵢ xᵢ, amb xᵢ de Poisson independents i els pesos cᵢ coneguts (cᵢ = wᵢ / nᵢ): la
// gamma amb la mitjana y i la variància v = Σ cᵢ² xᵢ per a l'extrem inferior, i amb y + cM i v + cM² per al superior, on cM és el
// pes més gran. Amb cap èxit, de 0 a cM · (el quantil de la gamma d'1 i 1)
export function fayFeuer(weights, counts, level = 0.95) {
  const a = (1 - level) / 2;
  let y = 0, v = 0, cM = 0;
  weights.forEach((c, i) => { y += c * counts[i]; v += c * c * counts[i]; if (c > cM) cM = c; });
  const lower = y === 0 ? 0 : gammaQuantile(a, (y * y) / v, v / y);
  const yu = y + cM, vu = v + cM * cM;
  const upper = gammaQuantile(1 - a, (yu * yu) / vu, vu / yu);
  return { value: y, ci: [lower, upper] };
}
