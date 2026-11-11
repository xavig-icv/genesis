// Exploratori (la maduració, pas 1): el que comparteixen els scripts d'aquesta carpeta. Només llegeix registres que ja existeixen.
import { readFileSync, readdirSync } from 'fs';
import { join, resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const jsonl = (p) => readdirSync(join(ROOT, p)).filter((f) => f.endsWith('.jsonl')).sort().map((f) => join(ROOT, p, f));

// Un registre: l'inici, les mesures (cada 100 èpoques), els censos (cada 250), l'establiment i el final
export function readRecord(file) {
  const ls = readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const start = ls[0], end = ls[ls.length - 1];
  if (start.type !== 'start' || end.type !== 'end') throw new Error(`${file}: el registre no és complet`);
  const censuses = ls.filter((o) => o.type === 'census');
  return {
    name: basename(file, '.jsonl'),
    start, end, censuses,
    measures: ls.filter((o) => o.type === 'measure'),
    t0: start.start ?? 0,                                          // l'època en què comença (0, o la de la captura d'origen)
    event: typeof end.event === 'number' ? end.event : null,       // l'establiment: el primer dels dos censos
    confirmed: ls.find((o) => o.type === 'event')?.confirmed ?? null,
    firstHer: censuses.find((c) => c.heritable > 0)?.epoch ?? Infinity,
    firstRep: censuses.find((c) => c.replicating > 0)?.epoch ?? Infinity,
    stop: typeof end.event === 'number' ? end.event : end.epoch,   // fins on és en risc: l'establiment o l'horitzó
  };
}

// Els conjunts de dades. `offset`: l'època en què la sopa és nova (per a l'edat); `quiet`: sense corrent
const ARMS = { continue: 'la sopa que continua', 'shuffle-all': 'la sopa barrejada (els mateixos bytes)', 'shuffle-programs': 'els programes canviats de lloc', 'shuffle-within': 'els bytes barrejats dins de cada programa', reinit: 'la sopa nova' };
export function datasets() {
  const sets = [
    { id: 'llei2-A', label: 'sèrie del corrent, món quiet', quiet: true, offset: 0, files: jsonl('fase2/resultats/serie-llei2/A') },
    { id: 'llei2-B', label: 'sèrie del corrent, corrent 0,01', quiet: false, offset: 0, files: jsonl('fase2/resultats/serie-llei2/B') },
    { id: 'mad-envelliment', label: "maduració, l'envelliment de la sèrie", quiet: true, offset: 0, files: jsonl('fase2/resultats/maduracio/serie/envelliment') },
    { id: 'pilot-envelliment', label: "maduració, l'envelliment del pilot", quiet: true, offset: 0, files: jsonl('fase2/resultats/maduracio/pilot/envelliment') },
  ];
  for (const [where, dir, arms] of [['mad', 'fase2/resultats/maduracio/serie/branques', ['continue', 'shuffle-all', 'reinit']],
    ['pilot', 'fase2/resultats/maduracio/pilot/branques', ['continue', 'shuffle-all', 'shuffle-programs', 'shuffle-within', 'reinit']]]) {
    const all = jsonl(dir);
    for (const arm of arms) {
      const files = all.filter((f) => new RegExp(`^[0-9A-Za-z]+-${arm}-[a-z0-9]+[.]jsonl$`).test(basename(f)));
      sets.push({ id: `${where}-${arm}`, label: `${where === 'mad' ? 'maduració, la sèrie' : 'maduració, el pilot'}: ${ARMS[arm]}`, quiet: true, offset: arm === 'reinit' ? 'start' : 0, arm, files });
    }
  }
  return sets;
}
export const loadSet = (set) => set.files.map(readRecord).map((r) => ({ ...r, offset: set.offset === 'start' ? r.t0 : 0 }));

// Un món compta com a sense vida, a una època, mentre cap cens no hi ha vist cap hereditari i falten més de 1.000 èpoques per a
// l'establiment, si n'hi ha (la nota, P1)
export const lifeless = (r, epoch) => epoch < r.firstHer && (r.event === null || epoch <= r.event - 1000);

// Estadística descriptiva
export const quantile = (v, q) => { const s = [...v].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(q * s.length))] : NaN; };
export const median = (v) => { const s = [...v].sort((a, b) => a - b), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : NaN; };
export const mean = (v) => v.reduce((s, x) => s + x, 0) / v.length;
export const sd = (v) => { const m = mean(v); return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / (v.length - 1)); };
const ranks = (v) => {
  const idx = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]), r = new Array(v.length);
  for (let i = 0; i < idx.length;) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1; i = j + 1; }
  return r;
};
export function spearman(x, y) {
  const a = ranks(x), b = ranks(y), ma = mean(a), mb = mean(b);
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < a.length; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  return num / Math.sqrt(da * db);
}

// Intervals exactes (descriptius). Poisson: l'interval de Garwood per a k esdeveniments; el quocient de dos ritmes, condicionat al
// total (Clopper i Pearson sobre la part del primer)
const lnFact = (() => { const c = [0]; return (n) => { while (c.length <= n) c.push(c[c.length - 1] + Math.log(c.length)); return c[n]; }; })();
const poissonCdf = (k, lam) => { if (k < 0) return 0; let s = 0; for (let i = 0; i <= k; i++) s += Math.exp(i * Math.log(lam) - lam - lnFact(i)); return Math.min(1, s); };
const binomCdf = (k, n, p) => { if (k < 0) return 0; if (k >= n) return 1; let s = 0; for (let i = 0; i <= k; i++) s += Math.exp(lnFact(n) - lnFact(i) - lnFact(n - i) + i * Math.log(p) + (n - i) * Math.log(1 - p)); return Math.min(1, s); };
const bisect = (f, lo, hi) => { for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } return (lo + hi) / 2; };
export function poissonInterval(k, alpha = 0.05) {
  const lower = k === 0 ? 0 : bisect((lam) => alpha / 2 - (1 - poissonCdf(k - 1, lam)), 1e-12, k + 1);
  const upper = bisect((lam) => poissonCdf(k, lam) - alpha / 2, k + 1e-12, 4 * k + 40);
  return [lower, upper];
}
// el ritme per 100.000 mon-èpoques, amb l'interval: "2,50 (de 1,20 a 4,60)"
export function rate(k, exposure) {
  const [lo, hi] = poissonInterval(k), f = (x) => (1e5 * x / exposure).toFixed(2);
  return exposure > 0 ? `${f(k)} (de ${f(lo)} a ${f(hi)})` : '—';
}
// el quocient de dos ritmes (k1/e1) / (k2/e2), amb l'interval exacte condicionat
export function rateRatio(k1, e1, k2, e2, alpha = 0.05) {
  const n = k1 + k2;
  if (n === 0 || e1 <= 0 || e2 <= 0) return { ratio: NaN, lower: NaN, upper: NaN };
  const pl = k1 === 0 ? 0 : bisect((p) => alpha / 2 - (1 - binomCdf(k1 - 1, n, p)), 1e-12, 1 - 1e-12);
  const pu = k1 === n ? 1 : bisect((p) => binomCdf(k1, n, p) - alpha / 2, 1e-12, 1 - 1e-12);
  const odds = (p) => (p >= 1 ? Infinity : p / (1 - p)) * (e2 / e1);
  return { ratio: k2 === 0 ? Infinity : (k1 / e1) / (k2 / e2), lower: odds(pl), upper: odds(pu) };
}
export const fmtRatio = (r) => `${r.ratio.toFixed(2)} (de ${r.lower.toFixed(2)} a ${Number.isFinite(r.upper) ? r.upper.toFixed(2) : 'infinit'})`;
