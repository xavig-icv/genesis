// El teu món, en viu: un món 2D nou, de bytes a l'atzar, que corre al navegador amb el simulador de les sèries
// (viu-motor.js), i que es mira com la vista 2D: els colors de família, de prop el codi i, molt de prop, el glif de cada
// byte. Cada 50 èpoques, el treballador d'anàlisi (viu-analisi.js) hi passa el registre de famílies, i cada 250, el
// cens v3: la vida s'estableix amb el criteri de les sèries (fase2/census.js). Cada cens porta l'empremta del món i
// l'ordre de sim.mjs que fa el mateix món amb Node. Res no es desa enlloc.
import { createWorld, step, runInWorkers, command, CENSUS_EVERY, FRAME_EVERY, RADIUS } from './viu-motor.js';
import { establishment } from '../../fase2/census.js';
import { OPCODES, glyphOf, CLASS_GLYPH, classOfChar } from './formes.js';
import { t, num, pct, setLang, onLang, apply } from './i18n.js';
import { bindThemeSwitch, readStageTokens, cssColor } from './tema.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const smooth = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
const to255 = (c) => [Math.round(c[0] * 255), Math.round(c[1] * 255), Math.round(c[2] * 255)];
const SIZES = { '512x256': [512, 256], '256x128': [256, 128] };
const PALETTE = 12, HORIZON = 16000, MAX_S = 320, BASE_MS = 250;
const mobile = matchMedia('(max-width: 820px)');
// la classe de cada byte (formes.js): 0 dada, 1 el zero i, de 2 a 11, les instruccions <>{}-+.,[]
const CLASS = new Uint8Array(256);
for (let v = 0; v < 256; v++) { const k = OPCODES.indexOf(String.fromCharCode(v)); CLASS[v] = v === 0 ? 1 : k >= 0 ? k + 2 : 0; }

apply();
for (const b of document.querySelectorAll('[data-lang]')) b.addEventListener('click', () => setLang(b.dataset.lang));
bindThemeSwitch();
let tokens = readStageTokens(), C = null;
function colors(tk) {
  C = {
    bg: cssColor(tk.background), lo: to255(tk.cellLow), hi: to255(tk.cellHigh), gridCss: cssColor(tk.grid),
    code: tk.flat.map((c, k) => to255(k === 0 ? tk.cellLow : c)), board: cssColor(tk.cellLow), text: tk.text.map((c) => cssColor(c)),
    outline: cssColor(tk.hoverOutline), halo: cssColor(tk.hoverHalo), fam: tk.families.map(to255),
  };
}
colors(tokens);
window.addEventListener('themechange', () => { tokens = readStageTokens(); colors(tokens); baseStale = true; codeKey = ''; });

// ───────── els paràmetres: de l'adreça (?llavor=&llei=&mida=), o una llavor a l'atzar
const randomSeed = () => 1 + (crypto.getRandomValues(new Uint32Array(1))[0] % 999999);
function readParams() {
  const q = new URLSearchParams(location.search), s = q.get('llavor') ?? '';
  return {
    seed: /^\d{1,10}$/.test(s) && Number(s) <= 4294967295 ? Number(s) : randomSeed(),
    mixing: q.get('llei') === 'corrent' ? 0.01 : 0,
    size: SIZES[q.get('mida')] ? q.get('mida') : mobile.matches ? '256x128' : '512x256',
  };
}
function writeParams(p) {
  const q = new URLSearchParams(location.search);
  q.set('llavor', String(p.seed)); q.set('llei', p.mixing ? 'corrent' : 'quiet'); q.set('mida', p.size);
  history.replaceState(null, '', `?${q}`);
}

// ───────── el món i els treballadors (al mòbil, com a molt dos fils: AUD-170)
const threads = Math.max(1, Math.min(mobile.matches ? 2 : 6, (navigator.hardwareConcurrency || 4) - 2));
let world = null, current = null, generation = 0, running = false, workers = [], runner = null, analyst = null;
let pending = 0, drain = null;
// el que diu l'anàlisi: el mapa de famílies (de l'època famEpoch), les famílies, els censos i l'establiment
let famMap = null, famEpoch = -1, families = [], palettes = new Map(), censuses = [], established = null;

function fail(message) {
  setPlaying(false);
  $('error-text').textContent = t('live.error', { m: message });
  $('error').hidden = false;
}
function setupWorkers() {
  for (const w of workers) w.terminate();
  analyst?.terminate();
  workers = Array.from({ length: threads }, () => new Worker(new URL('../../fase1/worker.js', import.meta.url), { type: 'module' }));
  for (const w of workers) w.addEventListener('error', (e) => fail(e.message || 'fase1/worker.js'));
  runner = runInWorkers(workers);
  analyst = new Worker(new URL('./viu-analisi.js', import.meta.url), { type: 'module' });
  analyst.onmessage = (e) => onAnalysis(e.data);
  analyst.onerror = (e) => fail(e.message || 'viu-analisi.js');
}

function reset(p) {
  generation++;
  setPlaying(false);
  try { setupWorkers(); } catch (e) { fail(e.message); return; }
  const [width, height] = SIZES[p.size];
  world = createWorld({ seed: p.seed, width, height, mixing: p.mixing });
  current = p;
  analyst.postMessage({ type: 'reset', gen: generation, width, radius: RADIUS });
  pending = 0; drain?.(); drain = null;
  famMap = null; famEpoch = -1; families = []; palettes = new Map(); censuses = []; established = null;
  state.hover = state.pinned = null;
  rate = { t: performance.now(), e: 0, value: null };
  writeParams(p);
  syncForm(p);
  baseStale = true; codeKey = '';
  resizeBase();
  fit(true);
  panel(); timeline(); drawInspector(); hint(); tryNote();
}

// les èpoques, una rere l'altra mentre es reprodueix; cada 50, una còpia per a l'anàlisi (com a molt dues pendents)
async function loop(gen) {
  while (running && gen === generation) {
    try { await step(world, runner); } catch (e) { fail(e.message); return; }
    if (gen !== generation) return;
    soupChanged = true;
    if (world.epoch % FRAME_EVERY === 0) {
      const copy = world.soup.slice();
      pending++;
      analyst.postMessage({ type: 'frame', gen, epoch: world.epoch, census: world.epoch % CENSUS_EVERY === 0, buffer: copy.buffer }, [copy.buffer]);
      while (pending > 2 && gen === generation) await new Promise((r) => { drain = r; });
    }
  }
}
function setPlaying(on) {
  if (on && (!world || !$('error').hidden)) return;
  const was = running;
  running = on;
  $('play-icon').innerHTML = on ? '<path class="ic-fill" d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z"></path>' : '<path class="ic-fill" d="M7 4.5v15l12.5-7.5z"></path>';
  $('play').dataset.i18nTitle = on ? 'live.pause' : 'live.run';
  apply($('play').parentElement);
  hint();
  if (on && !was) { rate = { t: performance.now(), e: world.epoch, value: rate.value }; loop(generation); }
}
// la llavor 1006: la vida hi neix a l'època 2.250, com a la sèrie; mentre corre, quant falta al ritme d'ara (AUD-170)
const BIRTH_1006 = 2250;
function tryNote() {
  const is1006 = current?.seed === 1006 && current.mixing === 0 && current.size === '512x256';
  const eta = is1006 && running && rate.value > 0 && !established && world.epoch < BIRTH_1006;
  $('try-note').textContent = eta ? t('live.eta1006', { m: num(Math.max(1, Math.round((BIRTH_1006 - world.epoch) / rate.value / 60))) }) : t('live.try1006.note', { e: num(BIRTH_1006) });
}
function hint() {
  const h = $('hint');
  h.textContent = world && world.epoch === 0 ? t('live.start', { k: num(threads) }) : t('live.paused');
  h.classList.toggle('off', running);
}

// ───────── l'anàlisi: el mapa de famílies, i el cens (amb el criteri d'establiment de les sèries)
function onAnalysis(m) {
  if (m.gen !== generation) return;
  pending--;
  const d = drain; drain = null; d?.();
  famMap = m.map; famEpoch = m.epoch;
  // cada família conserva el color mentre viu: el primer de la paleta que no tingui cap de les vives (com a eines/web-dades.mjs)
  const used = new Set(m.families.filter((f) => palettes.has(f.id)).map((f) => palettes.get(f.id)));
  for (const f of m.families) {
    if (palettes.has(f.id)) continue;
    let p = 0;
    while (p < PALETTE && used.has(p)) p++;
    if (p === PALETTE) p = f.id % PALETTE;
    used.add(p);
    palettes.set(f.id, p);
  }
  families = m.families;
  if (m.census) {
    censuses.push(m.census);
    if (!established) { const e = establishment(censuses, CENSUS_EVERY); if (e !== null) established = { epoch: e, confirmed: m.census.epoch }; }
  }
  baseStale = true;
  panel(); timeline();
  if (state.hover) drawInspector();
}
const famColor = (j) => C.fam[palettes.get(families[j - 1]?.id) ?? 0];

// ───────── el panell
function motif(text) {
  const s = el('span', 'mono motif');
  for (const ch of text) { const cls = classOfChar(ch); s.append(cls ? el('b', CLASS_GLYPH[cls], glyphOf(cls)) : ch); }
  return s;
}
function panel() {
  if (!world) return;
  const last = censuses.at(-1);
  $('status').textContent = established ? `${t('live.established', { e: num(established.epoch) })} ${t('live.confirmed', { c: num(established.confirmed) })}` : t('live.none');
  $('status').classList.toggle('is-alive', !!established);
  $('last-census').textContent = last ? t('live.census', { e: num(last.epoch), h: num(last.heritable), s: num(last.sample), p: pct(last.heritable / last.sample) }) : t('live.nocensus');
  // les famílies
  const ul = $('families');
  ul.replaceChildren();
  $('fam-count').textContent = families.length ? String(families.length) : '';
  if (!families.length) ul.append(el('li', 'empty', t('families.none')));
  for (const f of families) {
    const li = el('li'), row = el('div', 'fam no-spark'), main = el('span', 'fam-main'), meta = el('span', 'fam-meta'), sw = el('i', 'sw');
    sw.style.setProperty('--fc', `var(--f${(palettes.get(f.id) ?? 0) + 1})`);
    meta.append(t('families.born', { e: num(f.born) }));
    if (f.core) meta.append(' · ', motif(f.core));
    main.append(el('span', 'fam-name', t('inspector.family', { id: f.id })), meta);
    row.append(sw, main, el('span', 'fam-share', pct(f.share)));
    li.append(row);
    ul.append(li);
  }
  // comprova-ho: l'empremta i l'ordre de sim.mjs de l'últim cens
  $('check-more').hidden = !last;
  if (last) {
    $('check-text').textContent = t('live.check.text', { e: num(last.epoch), f: last.fingerprint });
    $('cmd').textContent = command({ seed: current.seed, width: world.width, height: world.height, mixing: current.mixing }, last.epoch);
    $('check-end').textContent = t('live.check.end', { f: last.fingerprint });
    $('line').textContent = last.line;
  } else $('check-text').textContent = t('live.check.wait');
  // el resum del full inferior (mòbil)
  $('sum-title').textContent = `${t('live.title')} · ${t('live.seed').toLowerCase()} ${current.seed}`;
  $('sum-fams').replaceChildren(...[...families].sort((a, b) => b.share - a.share).slice(0, 3).map((f) => {
    const s = el('span'), sw = el('i', 'sw');
    sw.style.setProperty('--fc', `var(--f${(palettes.get(f.id) ?? 0) + 1})`);
    s.append(sw, pct(f.share));
    return s;
  }));
}

// ───────── la barra de baix: un cens cada 250 èpoques (la barra, els replicadors hereditaris de la mostra) i
// l'establiment, fins a l'horitzó de les sèries (16.000 èpoques) o més enllà
let span = HORIZON;
function timeline() {
  if (!world) return;
  span = Math.max(HORIZON, Math.ceil((world.epoch + 1) / 4000) * 4000);
  const ticks = $('ticks'), every = ticks.parentElement.clientWidth < 420 ? span / 2 : span > 16000 ? 4000 : 2000;
  ticks.replaceChildren();
  for (let e = 0; e <= span; e += 1000) {
    const p = `${(e / span) * 100}%`, i = el('i', e % every === 0 ? 'tick major' : 'tick');
    i.style.left = p;
    ticks.append(i);
    if (e % every === 0) { const l = el('span', 'tick-l' + (e === 0 ? ' first' : e === span ? ' last' : ''), num(e)); l.style.left = p; ticks.append(l); }
  }
  const bars = $('bars');
  bars.replaceChildren(...censuses.map((c) => {
    const b = el('i', 'cbar' + (c.heritable / c.sample >= 0.01 ? ' is-on' : ''));
    b.style.left = `${(c.epoch / span) * 100}%`;
    b.style.height = `${Math.max(1, Math.round(Math.sqrt(c.heritable / c.sample) * 18))}px`;
    return b;
  }));
  const est = $('est');
  est.hidden = !established;
  if (established) { est.style.left = `${(established.epoch / span) * 100}%`; est.firstChild.textContent = t('time.established'); }
}

// ───────── la vista: s píxels per cel·la, i (x0, y0) la cel·la de la cantonada de dalt a l'esquerra (com a la vista 2D)
const canvas = $('view'), g = canvas.getContext('2d');
const base = document.createElement('canvas'), codeCanvas = document.createElement('canvas');
let baseStale = true, lastBase = 0, soupChanged = false, codeKey = '';
const goal = { s: 2, x0: 0, y0: 0 }, cur = { ...goal };
const size = () => ({ w: canvas.clientWidth, h: canvas.clientHeight });
const W = () => world.width, H = () => world.height;
// l'espai on es veu el món sencer: entre la barra de dalt i la de baix i, a l'escriptori, a l'esquerra del panell
function area() {
  const { w, h } = size(), r = canvas.getBoundingClientRect(), gap = 16;
  const top = document.querySelector('.t-right').getBoundingClientRect().bottom - r.top + gap;
  const bottom = (mobile.matches ? $('dock') : $('timeline')).getBoundingClientRect().top - r.top - gap;
  const side = $('side'), right = mobile.matches || side.classList.contains('is-closed') ? w - gap : side.getBoundingClientRect().left - r.left - gap;
  return { x: gap, y: top, w: Math.max(80, right - gap), h: Math.max(80, bottom - top) };
}
const fitScale = () => { const a = area(); return Math.min(a.w / W(), a.h / H()); };
function fit(now = false) {
  const a = area(), s = fitScale();
  Object.assign(goal, { s, x0: W() / 2 - (a.x + a.w / 2) / s, y0: H() / 2 - (a.y + a.h / 2) / s });
  if (now) Object.assign(cur, goal);
}
function clamp() {
  const { w, h } = size();
  goal.s = Math.min(MAX_S, Math.max(fitScale() * 0.7, goal.s));
  goal.x0 = Math.min(W() - 64 / goal.s, Math.max(-w / goal.s + 8, goal.x0));
  goal.y0 = Math.min(H() - 64 / goal.s, Math.max(-h / goal.s + 8, goal.y0));
}
const cellAt = (mx, my) => [cur.x0 + mx / cur.s, cur.y0 + my / cur.s];
function zoomAt(f, mx, my) {
  const u = goal.x0 + mx / goal.s, v = goal.y0 + my / goal.s;
  goal.s *= f; clamp();
  goal.x0 = u - mx / goal.s; goal.y0 = v - my / goal.s; clamp();
}
function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1), { w, h } = size();
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
}
function resizeBase() { base.width = W(); base.height = H(); }
window.addEventListener('resize', () => { resize(); if (world) { clamp(); timeline(); } placeInspector(); });
resize();

// el món a un píxel per cel·la: el color de la família (del darrer registre) o, si no en té, el de les instruccions
function paintBase() {
  const n = world.n, soup = world.soup, ctx = base.getContext('2d'), img = ctx.createImageData(W(), H()), d = img.data;
  for (let c = 0; c < n; c++) {
    const o = c * 4, j = famMap ? famMap[c] : 0;
    if (j) { const col = famColor(j); d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; } else {
      let k = 0;
      for (let b = c * 64, end = b + 64; b < end; b++) if (CLASS[soup[b]] > 1) k++;
      const f = Math.min(1, k / 24);
      for (let q = 0; q < 3; q++) d[o + q] = C.lo[q] + (C.hi[q] - C.lo[q]) * f;
    }
    d[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  baseStale = false;
  lastBase = performance.now();
}
// el codi de les cel·les que es veuen, a un píxel per byte
function codeImage(x0, y0, x1, y1, fresh) {
  const key = `${x0}:${y0}:${x1}:${y1}`;
  if (key === codeKey && !fresh) return codeCanvas;
  const cw = (x1 - x0) * 8, ch = (y1 - y0) * 8, soup = world.soup;
  codeCanvas.width = cw; codeCanvas.height = ch;
  const ctx = codeCanvas.getContext('2d'), img = ctx.createImageData(cw, ch), d = img.data;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const at = (y * W() + x) * 64;
    for (let b = 0; b < 64; b++) {
      const col = C.code[CLASS[soup[at + b]]], o = (((y - y0) * 8 + (b >> 3)) * cw + (x - x0) * 8 + (b & 7)) * 4;
      d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  codeKey = key;
  return codeCanvas;
}

// ───────── el ratolí, el tàctil i el teclat
let drag = null;
canvas.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') return; canvas.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, moved: 0 }; });
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch' || !world) return;
  const r = canvas.getBoundingClientRect();
  if (!drag) { hover(cellAt(e.clientX - r.left, e.clientY - r.top)); return; }
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
  goal.x0 -= dx / goal.s; goal.y0 -= dy / goal.s; cur.x0 -= dx / cur.s; cur.y0 -= dy / cur.s;
  clamp();
});
canvas.addEventListener('pointerup', (e) => {
  if (e.pointerType === 'touch' || !drag) return;
  if (drag.moved < 4) { const r = canvas.getBoundingClientRect(); pick(cellAt(e.clientX - r.left, e.clientY - r.top)); }
  drag = null;
});
canvas.addEventListener('pointerleave', () => hover(null));
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  zoomAt(Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0015)), e.clientX - r.left, e.clientY - r.top);
}, { passive: false });
canvas.addEventListener('dblclick', (e) => { const r = canvas.getBoundingClientRect(); zoomAt(3, e.clientX - r.left, e.clientY - r.top); });
// un dit mou i dos fan zoom; un toc fixa la cel·la
const touches = new Map();
let pinch = null, tap = null;
const pinchState = () => { const [a, b] = [...touches.values()]; return { mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) }; };
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  for (const p of e.changedTouches) touches.set(p.identifier, { x: p.clientX, y: p.clientY });
  pinch = touches.size === 2 ? pinchState() : null;
  const first = [...touches.values()][0];
  tap = touches.size === 1 ? { x: first.x, y: first.y, t: performance.now() } : null;
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const prev = new Map(touches), r = canvas.getBoundingClientRect();
  for (const p of e.changedTouches) touches.set(p.identifier, { x: p.clientX, y: p.clientY });
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
  for (const p of e.changedTouches) touches.delete(p.identifier);
  pinch = touches.size === 2 ? pinchState() : null;
  if (tap && !touches.size && e.type === 'touchend' && performance.now() - tap.t < 400) { const r = canvas.getBoundingClientRect(); pick(cellAt(tap.x - r.left, tap.y - r.top)); }
  if (!touches.size) tap = null;
};
canvas.addEventListener('touchend', touchEnd);
canvas.addEventListener('touchcancel', touchEnd);
window.addEventListener('keydown', (e) => {
  if (e.target.closest?.('input, select, textarea')) return;
  if (e.key === ' ' && !e.target.closest?.('button, a')) { e.preventDefault(); setPlaying(!running); }
  if (e.key === 'Escape' && state.pinned) { state.pinned = state.hover = null; drawInspector(); }
  if (e.key === 'Home' && world) fit();
});

// ───────── l'inspector: la cel·la sota el punter (o la fixada), amb els seus 64 bytes d'ara mateix
const state = { hover: null, pinned: null };
const cellOf = (p) => {
  if (!p || !world) return null;
  const x = Math.floor(p[0]), y = Math.floor(p[1]);
  return x >= 0 && y >= 0 && x < W() && y < H() ? { x, y, c: y * W() + x } : null;
};
function hover(p) { if (state.pinned) return; state.hover = cellOf(p); drawInspector(); }
function pick(p) {
  const c = cellOf(p);
  state.pinned = !c || (state.pinned && state.pinned.c === c.c) ? null : c;
  state.hover = state.pinned ?? c;
  drawInspector();
}
const closeIcon = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>';
function drawInspector() {
  const box = $('inspector'), cell = state.hover, docked = !mobile.matches;
  box.classList.toggle('is-docked', docked);
  if (!cell || !world) {
    box.hidden = !(docked && world);
    if (!box.hidden) { box.classList.remove('is-pinned'); box.replaceChildren(el('p', 'insp-empty', t('live.inspector'))); }
    placeInspector();
    return;
  }
  box.hidden = false;
  box.classList.toggle('is-pinned', !!state.pinned);
  box.replaceChildren();
  const top = el('div', 'insp-top'), name = el('span', 'insp-cell'), right = el('span', 'insp-right');
  const label = t('inspector.cell', { x: cell.x, y: cell.y }), at = label.indexOf('(');
  name.append(label.slice(0, at), el('span', 'mono', label.slice(at)));
  const j = famMap ? famMap[cell.c] : 0, f = j ? families[j - 1] : null, chip = el('span', 'chip');
  if (f) { const sw = el('i', 'sw'); sw.style.setProperty('--fc', `var(--f${(palettes.get(f.id) ?? 0) + 1})`); chip.append(sw, t('inspector.family', { id: f.id })); } else chip.append(t('inspector.nofamily'));
  const close = el('button', 'btn btn-icon insp-close');
  close.type = 'button';
  close.title = t('inspector.close');
  close.setAttribute('aria-label', close.title);
  close.innerHTML = closeIcon;
  close.addEventListener('click', () => { state.pinned = state.hover = null; drawInspector(); });
  right.append(chip, close);
  top.append(name, right);
  const soup = world.soup, prog = el('div', 'prog');
  let k = 0;
  for (let b = 0; b < 64; b++) {
    if (b % 16 === 0) prog.append(el('span', 'off', String(b).padStart(2, '0')));
    const cls = CLASS[soup[cell.c * 64 + b]];
    if (cls > 1) k++;
    prog.append(el('span', CLASS_GLYPH[cls], glyphOf(cls)));
  }
  const meta = el('div', 'insp-meta');
  meta.append(el('span', '', t('inspector.instructions', { k })), el('span', '', t('live.now', { e: num(world.epoch) })));
  box.append(top, meta, prog);
  placeInspector();
}
// a l'escriptori, l'inspector és fix a sota del panell (com als visors)
function placeInspector() {
  const box = $('inspector'), side = $('side');
  if (box.hidden || mobile.matches) { box.style.top = ''; side.style.maxHeight = ''; return; }
  const gap = parseFloat(getComputedStyle(document.body).getPropertyValue('--gap-tray')) || 12;
  const bar = document.querySelector('.t-right').getBoundingClientRect().bottom, end = $('timeline').getBoundingClientRect().top;
  const open = !side.classList.contains('is-closed');
  side.style.maxHeight = open ? `${Math.max(120, end - bar - box.offsetHeight - gap * 3)}px` : '';
  box.style.top = `${(open ? side.getBoundingClientRect().bottom : bar) + gap}px`;
}

// ───────── el formulari, les pestanyes, el panell plegable i el full inferior
function syncForm(p) {
  $('seed').value = String(p.seed);
  for (const b of $('laws').querySelectorAll('button')) b.setAttribute('aria-pressed', String(Number(b.dataset.mixing) === p.mixing));
  for (const b of $('sizes').querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.dataset.size === p.size));
}
const pressed = (group, attr) => group.querySelector('[aria-pressed="true"]').dataset[attr];
for (const group of [$('laws'), $('sizes')]) for (const b of group.querySelectorAll('button')) {
  b.addEventListener('click', () => { for (const o of group.querySelectorAll('button')) o.setAttribute('aria-pressed', String(o === b)); });
}
$('reseed').addEventListener('click', () => { $('seed').value = String(randomSeed()); });
$('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const seed = Number($('seed').value);
  if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) { $('seed').reportValidity(); return; }
  reset({ seed, mixing: Number(pressed($('laws'), 'mixing')), size: pressed($('sizes'), 'size') });
});
$('try-1006').addEventListener('click', () => { reset({ seed: 1006, mixing: 0, size: '512x256' }); setPlaying(true); });
$('play').addEventListener('click', () => setPlaying(!running));
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab, focus = false) {
  for (const b of tabs) { const on = b === tab; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; $(b.getAttribute('aria-controls')).hidden = !on; }
  if (focus) tab.focus();
}
tabs.forEach((b, k) => {
  b.addEventListener('click', () => selectTab(b));
  b.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (d) { e.preventDefault(); selectTab(tabs[(k + d + tabs.length) % tabs.length], true); }
  });
});
selectTab(tabs[0]);
const side = $('side'), dock = $('dock');
const showPanel = (on) => { side.classList.toggle('is-closed', !on); $('panel-btn')?.setAttribute('aria-expanded', String(on)); placeInspector(); if (world && Math.abs(goal.s / fitScale() - 1) < 0.35) fit(); };
const showSheet = (on) => { dock.classList.toggle('is-open', on); $('grab').setAttribute('aria-expanded', String(on)); };
showPanel(true);
showSheet(false);
new ResizeObserver(() => placeInspector()).observe(side);
$('panel-btn')?.addEventListener('click', () => showPanel(side.classList.contains('is-closed')));
$('grab').addEventListener('click', () => showSheet(!dock.classList.contains('is-open')));
$('sum').addEventListener('click', () => showSheet(true));
mobile.addEventListener?.('change', () => drawInspector());
onLang(() => { panel(); timeline(); hint(); drawInspector(); tryNote(); });
// amb la pestanya amagada, el món s'atura, i torna a córrer quan es torna a veure (AUD-170)
let resumeOnShow = false;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (running) { resumeOnShow = true; setPlaying(false); } } else if (resumeOnShow) { resumeOnShow = false; setPlaying(true); }
});

// ───────── el dibuix
let rate = { t: 0, e: 0, value: null }, before = performance.now();
function draw(now) {
  const dt = Math.min(0.1, (now - before) / 1000);
  before = now;
  if (world) {
    const e = 1 - Math.exp(-dt * 12);
    cur.s *= Math.pow(goal.s / cur.s, e);
    cur.x0 += (goal.x0 - cur.x0) * e;
    cur.y0 += (goal.y0 - cur.y0) * e;
    // el món canvia: es torna a pintar com a molt cada 250 ms (i l'inspector, si hi ha cap cel·la)
    let fresh = false;
    if (baseStale || (soupChanged && now - lastBase > BASE_MS)) { paintBase(); fresh = soupChanged; soupChanged = false; if (state.hover) drawInspector(); }
    const dpr = canvas.width / canvas.clientWidth, { w, h } = size(), s = cur.s;
    const X = (u) => (u - cur.x0) * s, Y = (v) => (v - cur.y0) * s;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = C.bg;
    g.fillRect(0, 0, w, h);
    g.imageSmoothingEnabled = false;
    g.drawImage(base, X(0), Y(0), W() * s, H() * s);
    g.strokeStyle = C.gridCss;
    g.lineWidth = 1;
    g.strokeRect(X(0) - 0.5, Y(0) - 0.5, W() * s + 1, H() * s + 1);
    const x0 = Math.max(0, Math.floor(cur.x0)), y0 = Math.max(0, Math.floor(cur.y0));
    const x1 = Math.min(W(), Math.ceil(cur.x0 + w / s)), y1 = Math.min(H(), Math.ceil(cur.y0 + h / s));
    // de prop, el codi (8 × 8 bytes per cel·la), amb la vora del color de la família; molt de prop, el glif de cada byte
    const codeMix = smooth(10, 22, s), chars = s >= 88;
    if (codeMix > 0 && x1 > x0 && y1 > y0) {
      if (!chars) {
        g.globalAlpha = codeMix;
        g.drawImage(codeImage(x0, y0, x1, y1, fresh), X(x0), Y(y0), (x1 - x0) * s, (y1 - y0) * s);
        g.globalAlpha = 1;
      } else {
        g.fillStyle = C.board;
        g.fillRect(X(x0), Y(y0), (x1 - x0) * s, (y1 - y0) * s);
        g.font = `600 ${Math.round((s / 8) * 0.62)}px "JetBrains Mono", ui-monospace, Consolas, monospace`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
          const at = (y * W() + x) * 64;
          for (let b = 0; b < 64; b++) {
            const cls = CLASS[world.soup[at + b]];
            g.fillStyle = C.text[cls];
            g.fillText(glyphOf(cls), X(x) + ((b & 7) + 0.5) * s / 8, Y(y) + ((b >> 3) + 0.55) * s / 8);
          }
        }
      }
      if (famMap) {
        const lw = Math.max(1, s / 14);
        g.lineWidth = lw;
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
          const j = famMap[y * W() + x];
          if (!j) continue;
          const col = famColor(j);
          g.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${codeMix})`;
          g.strokeRect(X(x) + lw / 2, Y(y) + lw / 2, s - lw, s - lw);
        }
      }
    }
    const grid = smooth(5, 12, s);
    if (grid > 0 && x1 > x0) {
      g.strokeStyle = cssColor(tokens.background, 0.85 * grid);
      g.lineWidth = Math.max(1, s / 40);
      g.beginPath();
      for (let x = x0; x <= x1; x++) { g.moveTo(X(x), Y(y0)); g.lineTo(X(x), Y(y1)); }
      for (let y = y0; y <= y1; y++) { g.moveTo(X(x0), Y(y)); g.lineTo(X(x1), Y(y)); }
      g.stroke();
    }
    const hv = state.hover;
    if (hv) {
      g.lineWidth = 4; g.strokeStyle = C.halo; g.strokeRect(X(hv.x) - 1, Y(hv.y) - 1, s + 2, s + 2);
      g.lineWidth = 2; g.strokeStyle = C.outline; g.strokeRect(X(hv.x) - 1, Y(hv.y) - 1, s + 2, s + 2);
    }
    // l'època, la velocitat (cada segon) i la barra de baix
    $('epoch').textContent = num(world.epoch);
    if (now - rate.t > 1000) {
      rate.value = running ? ((world.epoch - rate.e) * 1000) / (now - rate.t) : null;
      rate.t = now; rate.e = world.epoch;
      $('rate').textContent = rate.value === null ? '—' : num(rate.value, rate.value < 10 ? 1 : 0);
      tryNote();
    }
    if (world.epoch > span) timeline();
    const p = `${(world.epoch / span) * 100}%`;
    $('fill').style.width = p;
    $('playhead').style.left = p;
  }
  requestAnimationFrame(draw);
}

// ───────── a punt
if (typeof Worker === 'undefined') fail('Web Workers');
else {
  reset(readParams());
  requestAnimationFrame(draw);
}
window.viu = { get world() { return world; }, get censuses() { return censuses; }, get families() { return families; }, setPlaying, reset, goal, cur };
