// El tema del lloc: el del sistema, el clar o el fosc. El triat es desa (localStorage 'theme'), i «sistema» l'esborra.
// Un script petit al <head> de cada pàgina l'aplica abans del primer pintat; aquest mòdul connecta el control i avisa
// els dibuixos ('themechange' a window) perquè tornin a llegir les fitxes de l'escenari d'estil.css.

const KEY = 'theme';
const media = matchMedia('(prefers-color-scheme: dark)');

function stored() { try { return localStorage.getItem(KEY); } catch { return null; } }
function store(value) {
  try {
    if (value === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, value);
  } catch { /* sense emmagatzematge: no es recorda */ }
}

export function getTheme() {
  const t = stored();
  return t === 'light' || t === 'dark' ? t : 'system';
}
export function effectiveTheme() {
  const t = getTheme();
  return t === 'system' ? (media.matches ? 'dark' : 'light') : t;
}
export function setTheme(value) {
  store(value);
  if (value === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = value;
  sync();
  notify();
}

// El control: un grup de botons amb data-theme-value="system|light|dark" (n'hi pot haver més d'un a la pàgina)
export function bindThemeSwitch() {
  for (const b of document.querySelectorAll('[data-theme-value]')) b.addEventListener('click', () => setTheme(b.dataset.themeValue));
  sync();
  media.addEventListener?.('change', () => { if (getTheme() === 'system') notify(); });
}
function sync() {
  const t = getTheme();
  for (const b of document.querySelectorAll('[data-theme-value]')) b.setAttribute('aria-pressed', String(b.dataset.themeValue === t));
}
function notify() { window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: effectiveTheme() } })); }

// Un color de les fitxes (#rrggbb, o rgb() i rgba() amb comes o espais) → [r, g, b, a], de 0 a 1
export function parseColor(s) {
  s = s.trim();
  if (s[0] === '#') {
    const n = parseInt(s.slice(1, 7), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
  }
  const m = s.match(/rgba?\(([^)]*)\)/);
  if (!m) return [0, 0, 0, 1];
  const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return [p[0] / 255, p[1] / 255, p[2] / 255, p.length > 3 ? p[3] : 1];
}
// El mateix color, per a un llenç 2D
export const cssColor = (c, a = c[3] ?? 1) => `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`;

// La classe de cada byte (formes.js): 0 dada, 1 el zero i, de 2 a 11, les instruccions <>{}-+.,[]
const KINDS = [null, 'zero', 'head0', 'head0', 'head1', 'head1', 'arith', 'arith', 'copy', 'copy', 'loop', 'loop'];

// Les fitxes de l'escenari del tema que es veu, ja convertides
// (de l'arrel de l'Observatori, .ob, si la pàgina en té; si no, de l'arrel del document, com a estil.css)
export function readStageTokens() {
  const cs = getComputedStyle(document.querySelector('.ob') ?? document.documentElement);
  const v = (name) => cs.getPropertyValue(name).trim(), c = (name) => parseColor(v(name));
  return {
    theme: effectiveTheme(),
    background: c('--stage-bg'),
    grid: c('--stage-grid'),
    oceanDeep: c('--ocean-deep'),
    oceanShallow: c('--ocean-shallow'),
    atmosphere: c('--atmos'),
    stars: v('--stars') === '1' || v('--o-stars') === '1',
    cellLow: c('--cell-lo'),
    cellHigh: c('--cell-hi'),
    hoverOutline: c('--hover-outline'),
    hoverHalo: c('--hover-halo'),
    boardTint: parseFloat(v('--board-tint')) / 100,
    dimOthers: parseFloat(v('--dim-others')),
    data: c('--i-data'),
    families: Array.from({ length: 12 }, (_, i) => c(`--f${i + 1}`)),
    // per classe de byte: la base dels sòlids 3D, abans de l'ombrejat, el color pla (la vista 2D) i el del text
    lit: KINDS.map((k) => (k ? c(`--i-${k}-lit`) : null)),
    flat: KINDS.map((k) => (k ? c(`--i-${k}-fill`) : null)),
    text: KINDS.map((k) => c(k ? `--i-${k}` : '--i-data')),
  };
}

// Moviment reduït: el planeta i els sòlids es pinten quiets i res no es reprodueix sol
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
