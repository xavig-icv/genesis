// Gràfic de línia mínim en SVG: una sola sèrie, eixos discrets,
// creu que segueix el punter i una marca opcional (la transició).
const SVG = 'http://www.w3.org/2000/svg';
const M = { top: 12, right: 14, bottom: 26, left: 46 };
const HEIGHT = 190;
const MAX_POINTS = 900;

function el(name, attrs = {}, parent) {
  const e = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

// Passos "rodons" per als eixos: 1, 2, 5, 10, 20, 50...
function niceStep(range, count) {
  const raw = range / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
}

const fmt = (v, digits = 0) => (Math.abs(v) < 0.5 * 10 ** -digits ? 0 : v).toLocaleString('ca', { maximumFractionDigits: digits, minimumFractionDigits: digits });

export class LineChart {
  constructor(container, { yLabel, digits = 2, markerLabel = 'transició' }) {
    this.container = container;
    this.digits = digits;
    this.yLabel = yLabel;
    this.markerLabel = markerLabel;
    this.points = [];
    this.marker = null;
    this.width = container.clientWidth || 400;

    container.classList.add('chart');
    this.svg = el('svg', { role: 'img', 'aria-label': yLabel }, container);
    this.grid = el('g', { class: 'grid' }, this.svg);
    this.axes = el('g', { class: 'axes' }, this.svg);
    this.markerG = el('g', { class: 'marker' }, this.svg);
    this.path = el('path', { class: 'line' }, this.svg);
    this.cross = el('line', { class: 'crosshair', visibility: 'hidden' }, this.svg);
    this.dot = el('circle', { class: 'dot', r: 4, visibility: 'hidden' }, this.svg);
    this.hit = el('rect', { class: 'hit', fill: 'transparent' }, this.svg);
    this.tip = document.createElement('div');
    this.tip.className = 'tooltip';
    this.tip.hidden = true;
    container.appendChild(this.tip);

    this.hit.addEventListener('pointermove', (e) => this.hover(e));
    this.hit.addEventListener('pointerleave', () => this.unhover());
    new ResizeObserver(() => {
      const w = container.clientWidth;
      if (w && w !== this.width) { this.width = w; this.render(); }
    }).observe(container);
    this.render();
  }

  update(points, marker = null) {
    this.points = points;
    this.marker = marker;
    this.render();
  }

  scales() {
    const pts = this.points;
    const xMin = pts.length ? pts[0].x : 0;
    const xMax = Math.max(xMin + 10, pts.length ? pts[pts.length - 1].x : 0);
    let yMin = 0, yMax = 1;
    for (const p of pts) { if (p.y > yMax) yMax = p.y; if (p.y < yMin) yMin = p.y; }
    if (yMin > -0.05 * yMax) yMin = 0; // petits negatius (soroll de la compressió): l'eix comença a 0
    const yStep = niceStep(yMax - yMin, 4);
    yMax = Math.ceil(yMax / yStep) * yStep;
    yMin = Math.floor(yMin / yStep) * yStep;
    const w = this.width - M.left - M.right;
    const h = HEIGHT - M.top - M.bottom;
    return {
      xMin, xMax, yMin, yMax, yStep, w, h,
      x: (v) => M.left + ((v - xMin) / (xMax - xMin)) * w,
      y: (v) => M.top + h - ((v - yMin) / (yMax - yMin)) * h,
    };
  }

  render() {
    const s = this.scales();
    this.svg.setAttribute('viewBox', `0 0 ${this.width} ${HEIGHT}`);
    this.svg.setAttribute('width', this.width);
    this.svg.setAttribute('height', HEIGHT);
    this.grid.replaceChildren();
    this.axes.replaceChildren();
    this.markerG.replaceChildren();

    for (let v = s.yMin; v <= s.yMax + 1e-9; v += s.yStep) {
      const y = Math.round(s.y(v)) + 0.5;
      el('line', { x1: M.left, x2: M.left + s.w, y1: y, y2: y, class: Math.abs(v) < 1e-9 ? 'baseline' : '' }, this.grid);
      el('text', { x: M.left - 8, y: y + 4, 'text-anchor': 'end' }, this.axes).textContent = fmt(v, s.yStep < 1 ? 1 : 0);
    }
    const xStep = niceStep(s.xMax - s.xMin, Math.max(2, Math.floor(s.w / 90)));
    for (let v = Math.ceil(s.xMin / xStep) * xStep; v <= s.xMax; v += xStep) {
      el('text', { x: s.x(v), y: HEIGHT - 8, 'text-anchor': 'middle' }, this.axes).textContent = fmt(v);
    }

    if (this.marker != null) {
      const x = Math.round(s.x(this.marker)) + 0.5;
      el('line', { x1: x, x2: x, y1: M.top, y2: M.top + s.h }, this.markerG);
      const label = el('text', { x: x + 6, y: M.top + 12 }, this.markerG);
      label.textContent = this.markerLabel;
    }

    // Si hi ha molts punts, en dibuixem una mostra regular (sempre amb l'últim).
    const pts = this.points;
    const stride = Math.max(1, Math.ceil(pts.length / MAX_POINTS));
    let d = '';
    for (let i = 0; i < pts.length; i += stride) d += `${d ? 'L' : 'M'}${s.x(pts[i].x).toFixed(1)},${s.y(pts[i].y).toFixed(1)}`;
    if (pts.length && (pts.length - 1) % stride) {
      const p = pts[pts.length - 1];
      d += `L${s.x(p.x).toFixed(1)},${s.y(p.y).toFixed(1)}`;
    }
    this.path.setAttribute('d', d);

    for (const [k, v] of Object.entries({ x: M.left, y: M.top, width: Math.max(0, s.w), height: s.h })) this.hit.setAttribute(k, v);
    if (this.hoverX != null) this.showAt(this.hoverX);
  }

  hover(e) {
    const r = this.svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * this.width;
    const s = this.scales();
    this.hoverX = s.xMin + ((px - M.left) / s.w) * (s.xMax - s.xMin);
    this.showAt(this.hoverX);
  }

  unhover() {
    this.hoverX = null;
    this.cross.setAttribute('visibility', 'hidden');
    this.dot.setAttribute('visibility', 'hidden');
    this.tip.hidden = true;
  }

  showAt(xVal) {
    const pts = this.points;
    if (!pts.length) return;
    // cerca binària del punt més proper
    let lo = 0, hi = pts.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (pts[mid].x < xVal) lo = mid; else hi = mid; }
    const p = Math.abs(pts[lo].x - xVal) <= Math.abs(pts[hi].x - xVal) ? pts[lo] : pts[hi];
    const s = this.scales();
    const x = s.x(p.x), y = s.y(p.y);
    for (const [k, v] of Object.entries({ x1: x, x2: x, y1: M.top, y2: M.top + s.h, visibility: 'visible' })) this.cross.setAttribute(k, v);
    for (const [k, v] of Object.entries({ cx: x, cy: y, visibility: 'visible' })) this.dot.setAttribute(k, v);

    this.tip.replaceChildren();
    const value = document.createElement('strong');
    value.textContent = fmt(p.y, this.digits);
    const label = document.createElement('span');
    label.textContent = `${this.yLabel} · època ${fmt(p.x)}`;
    this.tip.append(value, label);
    this.tip.hidden = false;
    const scale = this.container.clientWidth / this.width;
    const left = Math.min(x * scale + 12, this.container.clientWidth - this.tip.offsetWidth - 4);
    this.tip.style.left = `${Math.max(4, left)}px`;
    this.tip.style.top = `${Math.max(0, y - 44)}px`;
  }
}
