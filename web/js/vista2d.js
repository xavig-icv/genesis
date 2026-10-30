// La vista 2D: el món des de dalt, com a la interfície i a les imatges del README, amb zoom des del món sencer fins
// als bytes de cada programa: els colors de família, les cel·les amb quadrícula, la imatge del codi (8 × 8 punts per
// cel·la, amb la família a la vora) i, molt de prop, el glif de cada byte. Sense WebGL: un llenç 2D, amb els colors del
// tema, sense llum. La lectura d'escala diu sempre què es veu.
import { createUI } from './ui.js';
import { W, H } from './geo.js';
import { glyphOf } from './formes.js';
import { cssColor } from './tema.js';
import { t, num } from './i18n.js';

const $ = (id) => document.getElementById(id);
const canvas = $('view'), g = canvas.getContext('2d');
const MAX_S = 320;
const smooth = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
const to255 = (c) => [Math.round(c[0] * 255), Math.round(c[1] * 255), Math.round(c[2] * 255)];

// els colors del tema, en enters (per a les imatges) i en text (per al llenç)
let C = null;
function colors(tk) {
  C = {
    bg: cssColor(tk.background), lo: to255(tk.cellLow), hi: to255(tk.cellHigh), grid: tk.grid, gridCss: cssColor(tk.grid),
    // la imatge del codi: les dades, del color de la cel·la buida, i el zero i les instruccions, del seu color pla
    code: tk.flat.map((c, k) => to255(k === 0 ? tk.cellLow : c)),
    board: cssColor(tk.cellLow), text: tk.text.map((c) => cssColor(c)),
    outline: cssColor(tk.hoverOutline), halo: cssColor(tk.hoverHalo),
  };
}

// dos fotogrames, l'un sobre l'altre amb transparència, perquè el temps flueixi entre tots dos
const frames = [0, 1].map(() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; });
function paint(cv, i) {
  const w = ui.state.world, fam = w.fam(i), k = w.k(i), pal = ui.palette(i);
  const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H), d = img.data;
  for (let c = 0; c < W * H; c++) {
    const j = fam[c], o = c * 4;
    if (j) { d[o] = pal[j * 4]; d[o + 1] = pal[j * 4 + 1]; d[o + 2] = pal[j * 4 + 2]; } else {
      const f = Math.min(1, k[c] / 24);
      for (let q = 0; q < 3; q++) d[o + q] = C.lo[q] + (C.hi[q] - C.lo[q]) * f;
    }
    d[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

const ui = createUI({
  onWorld: () => { fit(true); codeCache = null; },
  onFrame: (i) => { paint(frames[0], i); paint(frames[1], i + 1); codeCache = null; },
  onTheme: (tk) => { colors(tk); codeCache = null; },
});
colors(ui.state.tokens);

// la vista: s píxels per cel·la, i (x0, y0) la cel·la de la cantonada de dalt a l'esquerra
const goal = { s: 2, x0: 0, y0: 0 }, cur = { ...goal };
const size = () => ({ w: canvas.clientWidth, h: canvas.clientHeight });
const fitScale = () => { const { w, h } = size(); return Math.min(w / W, h / H) * 0.92; };
function fit(now = false) {
  const { w, h } = size(), s = fitScale();
  Object.assign(goal, { s, x0: W / 2 - w / 2 / s, y0: H / 2 - h / 2 / s });
  if (now) Object.assign(cur, goal);
}
function clamp() {
  const { w, h } = size();
  goal.s = Math.min(MAX_S, Math.max(fitScale() * 0.7, goal.s));
  goal.x0 = Math.min(W - 8 / goal.s * 8, Math.max(-w / goal.s + 8, goal.x0));
  goal.y0 = Math.min(H - 8 / goal.s * 8, Math.max(-h / goal.s + 8, goal.y0));
}
const cellAt = (mx, my) => [cur.x0 + mx / cur.s, cur.y0 + my / cur.s];
function zoomAt(f, mx, my) {
  const [u, v] = [goal.x0 + mx / goal.s, goal.y0 + my / goal.s];
  goal.s *= f;
  clamp();
  goal.x0 = u - mx / goal.s;
  goal.y0 = v - my / goal.s;
  clamp();
}
function centerOn(u, v) {
  const { w, h } = size();
  goal.x0 = u - w / 2 / goal.s;
  goal.y0 = v - h / 2 / goal.s;
  clamp();
}
function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1), { w, h } = size();
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
}
window.addEventListener('resize', () => { resize(); clamp(); });
resize();
fit(true);

// el ratolí i el tàctil
let drag = null;
canvas.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') return; canvas.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, moved: 0 }; });
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  const r = canvas.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
  if (!drag) { ui.hover(cellAt(mx, my), mx, my); return; }
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
  goal.x0 -= dx / goal.s; goal.y0 -= dy / goal.s;
  cur.x0 -= dx / cur.s; cur.y0 -= dy / cur.s;
  clamp();
});
canvas.addEventListener('pointerup', (e) => {
  if (e.pointerType === 'touch' || !drag) return;
  if (drag.moved < 4) { const r = canvas.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top; ui.pick(cellAt(mx, my), mx, my); }
  drag = null;
});
canvas.addEventListener('pointerleave', () => ui.hover(null));
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  zoomAt(Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0015)), e.clientX - r.left, e.clientY - r.top);
}, { passive: false });
canvas.addEventListener('dblclick', (e) => { const r = canvas.getBoundingClientRect(); zoomAt(3, e.clientX - r.left, e.clientY - r.top); });
// un dit mou i dos fan zoom; un toc (un dit, gairebé quiet) fixa la cel·la, com un clic
const touches = new Map();
let pinch = null, tap = null;
const pinchState = () => { const [a, b] = [...touches.values()]; return { mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) }; };
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  for (const t of e.changedTouches) touches.set(t.identifier, { x: t.clientX, y: t.clientY });
  pinch = touches.size === 2 ? pinchState() : null;
  const first = [...touches.values()][0];
  tap = touches.size === 1 ? { x: first.x, y: first.y, t: performance.now() } : null;
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const prev = new Map(touches), r = canvas.getBoundingClientRect();
  for (const t of e.changedTouches) touches.set(t.identifier, { x: t.clientX, y: t.clientY });
  if (touches.size === 1) {
    const [id, p] = [...touches.entries()][0], q = prev.get(id);
    if (q) { goal.x0 -= (p.x - q.x) / goal.s; goal.y0 -= (p.y - q.y) / goal.s; clamp(); }
    if (tap && Math.hypot(p.x - tap.x, p.y - tap.y) > 8) tap = null;
  } else if (touches.size === 2 && pinch) {
    const s = pinchState();
    zoomAt(s.d / pinch.d, s.mx - r.left, s.my - r.top);
    goal.x0 -= (s.mx - pinch.mx) / goal.s; goal.y0 -= (s.my - pinch.my) / goal.s;
    clamp();
    pinch = s;
  }
}, { passive: false });
const touchEnd = (e) => {
  for (const t of e.changedTouches) touches.delete(t.identifier);
  pinch = touches.size === 2 ? pinchState() : null;
  if (tap && !touches.size && e.type === 'touchend' && performance.now() - tap.t < 400) {
    const r = canvas.getBoundingClientRect(), mx = tap.x - r.left, my = tap.y - r.top;
    ui.pick(cellAt(mx, my), mx, my);
  }
  if (!touches.size) tap = null;
};
canvas.addEventListener('touchend', touchEnd);
canvas.addEventListener('touchcancel', touchEnd);
const keys = new Set();
window.addEventListener('keydown', (e) => {
  if (e.target.closest?.('input, select, textarea')) return;
  const k = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', '+', '-', '='].includes(k)) { keys.add(k); e.preventDefault(); }
  if (k === 'home') fit();
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
window.addEventListener('blur', () => keys.clear());
function keyboard(dt) {
  if (!keys.size) return;
  const step = 500 * dt / goal.s, has = (...ks) => ks.some((k) => keys.has(k)), { w, h } = size();
  if (has('arrowleft', 'a')) goal.x0 -= step;
  if (has('arrowright', 'd')) goal.x0 += step;
  if (has('arrowup', 'w')) goal.y0 -= step;
  if (has('arrowdown', 's')) goal.y0 += step;
  if (has('+', '=')) zoomAt(Math.exp(2 * dt), w / 2, h / 2);
  if (has('-')) zoomAt(Math.exp(-2 * dt), w / 2, h / 2);
  clamp();
}

// el codi de les cel·les que es veuen, a un píxel per byte (es refà només quan canvia la regió, el codi o el tema)
let codeCache = null;
const codeCanvas = document.createElement('canvas');
function codeImage(bytes, epoch, x0, y0, x1, y1) {
  const key = `${epoch}:${x0}:${y0}:${x1}:${y1}`;
  if (codeCache === key) return codeCanvas;
  const cw = (x1 - x0) * 8, ch = (y1 - y0) * 8;
  codeCanvas.width = cw; codeCanvas.height = ch;
  const ctx = codeCanvas.getContext('2d'), img = ctx.createImageData(cw, ch), d = img.data;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const base = (y * W + x) * 64;
    for (let b = 0; b < 64; b++) {
      const col = C.code[bytes[base + b]], px = (x - x0) * 8 + (b & 7), py = (y - y0) * 8 + (b >> 3), o = (py * cw + px) * 4;
      d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  codeCache = key;
  return codeCanvas;
}

// la lectura d'escala: una barra d'un nombre rodó de cel·les, els píxels per cel·la i la cel·la sota el punter
let shownScale = '';
function scaleReadout(s) {
  let n = 1;
  while (n * s < 56 && n < 256) n *= 2;
  const cell = ui.state.hover, key = `${n}:${Math.round(s)}:${cell?.c ?? -1}`;
  if (key === shownScale) return;
  shownScale = key;
  $('scale-bar').style.width = `${Math.round(n * s)}px`;
  $('scale-cells').textContent = t(n === 1 ? 'scale.cell' : 'scale.cells', { n: num(n) });
  $('scale-zoom').textContent = `× ${num(Math.max(1, Math.round(s)))}`;
  const box = $('scale-cell');
  box.replaceChildren();
  box.hidden = box.previousElementSibling.hidden = !cell;
  if (cell) { const label = t('inspector.cell', { x: cell.x, y: cell.y }), at = label.indexOf('('), m = document.createElement('span'); m.className = 'mono'; m.textContent = label.slice(at); box.append(label.slice(0, at), m); }
}

// el mapa petit (proposta): el món sencer i el rectangle que es veu, al panell, només quan s'ha fet zoom
const mini = $('minimap'), miniCv = $('minimap-canvas'), mg = miniCv.getContext('2d');
mini.addEventListener('click', (e) => {
  const r = miniCv.getBoundingClientRect();
  centerOn(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H);
});
function minimap(f, s) {
  const on = s > fitScale() * 2.5;
  if (mini.hidden === on) mini.hidden = !on;
  if (!on) return;
  const mw = miniCv.width, mh = miniCv.height, k = mw / W, { w, h } = size();
  mg.imageSmoothingEnabled = false;
  mg.drawImage(frames[0], 0, 0, mw, mh);
  if (f.t > 0) { mg.globalAlpha = f.t; mg.drawImage(frames[1], 0, 0, mw, mh); mg.globalAlpha = 1; }
  const x = cur.x0 * k, y = cur.y0 * k, rw = (w / s) * k, rh = (h / s) * k;
  mg.lineWidth = 6; mg.strokeStyle = C.halo; mg.strokeRect(x, y, rw, rh);
  mg.lineWidth = 3; mg.strokeStyle = C.outline; mg.strokeRect(x, y, rw, rh);
}

let before = performance.now();
function draw(now) {
  const dt = Math.min(0.1, (now - before) / 1000);
  before = now;
  keyboard(dt);
  const f = ui.tick(dt);
  const e = 1 - Math.exp(-dt * 12);
  cur.s *= Math.pow(goal.s / cur.s, e);
  cur.x0 += (goal.x0 - cur.x0) * e;
  cur.y0 += (goal.y0 - cur.y0) * e;
  const dpr = canvas.width / canvas.clientWidth, { w, h } = size(), s = cur.s;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = C.bg;
  g.fillRect(0, 0, w, h);
  if (f) {
    const X = (u) => (u - cur.x0) * s, Y = (v) => (v - cur.y0) * s;
    g.imageSmoothingEnabled = false;
    g.drawImage(frames[0], X(0), Y(0), W * s, H * s);
    if (f.t > 0) { g.globalAlpha = f.t; g.drawImage(frames[1], X(0), Y(0), W * s, H * s); g.globalAlpha = 1; }
    // la vora del món
    g.strokeStyle = C.gridCss;
    g.lineWidth = 1;
    g.strokeRect(X(0) - 0.5, Y(0) - 0.5, W * s + 1, H * s + 1);
    // les cel·les visibles
    const x0 = Math.max(0, Math.floor(cur.x0)), y0 = Math.max(0, Math.floor(cur.y0));
    const x1 = Math.min(W, Math.ceil(cur.x0 + w / s)), y1 = Math.min(H, Math.ceil(cur.y0 + h / s));
    // de prop, el codi: els 64 bytes de cada cel·la en una quadrícula de 8 × 8, i la vora del color de la família;
    // molt de prop, el glif de cada byte
    const codeMix = smooth(10, 22, s), chars = s >= 88;
    if (codeMix > 0 && x1 > x0 && y1 > y0) {
      const bytes = ui.state.code.bytes ?? null;
      ui.needCode();
      if (bytes) {
        if (!chars) {
          g.globalAlpha = codeMix;
          g.drawImage(codeImage(bytes, ui.state.code.epoch, x0, y0, x1, y1), X(x0), Y(y0), (x1 - x0) * s, (y1 - y0) * s);
          g.globalAlpha = 1;
        } else {
          g.fillStyle = C.board;
          g.fillRect(X(x0), Y(y0), (x1 - x0) * s, (y1 - y0) * s);
          g.font = `600 ${Math.round((s / 8) * 0.62)}px "JetBrains Mono", ui-monospace, Consolas, monospace`;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
            const base = (y * W + x) * 64;
            for (let b = 0; b < 64; b++) {
              const cls = bytes[base + b];
              g.fillStyle = C.text[cls];
              g.fillText(glyphOf(cls), X(x) + ((b & 7) + 0.5) * s / 8, Y(y) + ((b >> 3) + 0.55) * s / 8);
            }
          }
        }
        const fam = ui.state.world.fam(f.i), pal = ui.palette(f.i), lw = Math.max(1, s / 14);
        g.lineWidth = lw;
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
          const j = fam[y * W + x];
          if (!j) continue;
          g.strokeStyle = `rgba(${pal[j * 4]},${pal[j * 4 + 1]},${pal[j * 4 + 2]},${codeMix})`;
          g.strokeRect(X(x) + lw / 2, Y(y) + lw / 2, s - lw, s - lw);
        }
      }
    }
    // la quadrícula de les cel·les, del color de l'escenari
    const grid = smooth(5, 12, s);
    if (grid > 0 && x1 > x0) {
      g.strokeStyle = cssColor(ui.state.tokens.background, 0.85 * grid);
      g.lineWidth = Math.max(1, s / 40);
      g.beginPath();
      for (let x = x0; x <= x1; x++) { g.moveTo(X(x), Y(y0)); g.lineTo(X(x), Y(y1)); }
      for (let y = y0; y <= y1; y++) { g.moveTo(X(x0), Y(y)); g.lineTo(X(x1), Y(y)); }
      g.stroke();
    }
    // la cel·la sota el punter: una vora en tinta, amb un halo
    const hv = ui.state.hover;
    if (hv) {
      g.lineWidth = 4; g.strokeStyle = C.halo; g.strokeRect(X(hv.x) - 1, Y(hv.y) - 1, s + 2, s + 2);
      g.lineWidth = 2; g.strokeStyle = C.outline; g.strokeRect(X(hv.x) - 1, Y(hv.y) - 1, s + 2, s + 2);
    }
    const w0 = ui.state.world;
    $('hint').classList.toggle('off', s >= 10 || !w0.codeEpochs.length || ui.state.time < w0.codeEpochs[0]);
    scaleReadout(s);
    minimap(f, s);
  }
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
ui.start();
window.vista2d = { state: ui.state, goal, cur };
