import { PROGRAM_SIZE, TAPE_SIZE, KIND } from '../fase1/bff.js';
import { makeRng, randomSoup, shuffle, gather, scatter, mutate } from '../fase1/soup.js';
import { LineChart } from '../fase1/chart.js';
import { renderProgram, countInstructions, byteLut, cssRgb, pack } from '../fase1/glyphs.js';
import { pairNeighbors, applyCurrents, applyFlow } from './world.js';

const THRESHOLD = 1.0;   // bits d'entropia d'ordre superior que marquen la transició
const SAMPLE_MS = 900;   // cada quant s'analitza el món
const DETAIL_SCALE = 8;  // a partir de 8 píxels per cel·la es veu el codi
const MAX_SCALE = 48;
const CELL_PX = 10;      // a la vista de codi, cada cel·la és un bloc de 10×10: marc + 8×8 bytes
const BASE_MS = 250;     // cada quant es redibuixa la vista de famílies mentre corre

const $ = (id) => document.getElementById(id);
const fmt = (v, d = 0) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toLocaleString('ca', { minimumFractionDigits: d, maximumFractionDigits: d });
const familyName = (id) => {
  let s = '';
  for (let k = id; k > 0; k = Math.floor((k - 1) / 26)) s = String.fromCharCode(65 + ((k - 1) % 26)) + s;
  return `Família ${s}`;
};

// ---------------------------------------------------------------- estat

let sim = null;
let workers = [];
let running = false;
let generation = 0;

function readParams() {
  const [width, height] = $('size').value.split('x').map(Number);
  return {
    seed: Math.max(0, Math.floor(Number($('seed').value) || 0)),
    width, height,
    radius: Number($('radius').value),
    mixing: Number($('mixing').value),
    diffusion: Number($('diffusion').value),
    flow: Number($('flow').value),
    renewal: Number($('renewal').value),
    mutation: Math.max(0, Number($('mutation').value) || 0) / 100,
    threads: Number($('threads').value),
    rng: $('rng').value,
  };
}

function createSim(p) {
  const n = p.width * p.height;
  const rng = makeRng(p.seed, p.rng);
  return {
    ...p, n, rng,
    soup: randomSoup(n, rng),
    order: new Uint32Array(n).map((_, i) => i),
    taken: new Uint8Array(n),
    pairIdx: new Uint32Array(n),
    scratch: p.mixing > 0 ? new Uint32Array(n * (PROGRAM_SIZE / 4)) : null,
    pool: p.mixing > 0 ? new Uint32Array(n) : null,
    flowState: { carry: 0 },
    shifts: 0,      // columnes que ha desplaçat el riu des del principi
    mapShifts: 0,   // les que havia desplaçat quan es va fer el mapa de famílies
    buffers: [],
    epoch: 0,
    history: [],
    opsAcc: 0,
    runsAcc: 0,
    transitionAt: null,
    families: [],
    extinct: [],
    familyMap: new Uint8Array(n),
    selected: -1,
    dirty: true,
  };
}

function setupWorkers(count) {
  for (const w of workers) w.terminate();
  workers = Array.from({ length: count }, () => new Worker(new URL('../fase1/worker.js', import.meta.url), { type: 'module' }));
}

function callWorker(w, msg) {
  return new Promise((resolve, reject) => {
    w.onmessage = (e) => resolve(e.data);
    w.onerror = reject;
    w.postMessage(msg, [msg.buffer]);
  });
}

// ---------------------------------------------------------------- simulació
// Mateix ordre de passos que worldEpoch() a sim.mjs: corrents, flux, barrejar
// l'ordre, aparellar veïns, mutar tot el mapa i executar. Tot l'atzar és aquí, i els
// treballadors només executen; per això el nombre de fils no canvia la història.

async function runEpoch(s) {
  applyCurrents(s.soup, s.width, s.height, s.mixing, s.diffusion, s.rng, s.scratch, s.pool);
  s.shifts += applyFlow(s.soup, s.width, s.height, s.flow, s.renewal, s.rng, s.flowState);
  shuffle(s.order, s.rng);
  const nPairs = pairNeighbors(s.order, s.taken, s.pairIdx, s.width, s.height, s.radius, s.rng);
  mutate(s.soup, s.soup.length, s.mutation, s.rng);
  const per = Math.ceil(nPairs / workers.length);
  const jobs = [];
  for (let i = 0; i < workers.length; i++) {
    const first = i * per;
    const count = Math.min(per, nPairs - first);
    if (count <= 0) break;
    let buffer = s.buffers[i];
    if (!buffer || buffer.byteLength < count * TAPE_SIZE) buffer = new ArrayBuffer(per * TAPE_SIZE);
    gather(s.soup, s.pairIdx, new Uint8Array(buffer), first, count);
    jobs.push(callWorker(workers[i], { buffer, nPairs: count, seed: 0, mutation: 0 }).then((r) => {
      s.buffers[i] = r.buffer;
      scatter(s.soup, s.pairIdx, new Uint8Array(r.buffer), first, count);
      s.opsAcc += r.ops;
    }));
  }
  await Promise.all(jobs);
  s.runsAcc += nPairs;
  s.epoch++;
  s.dirty = true;
}

async function loop(gen) {
  while (running && gen === generation) {
    await runEpoch(sim);
    if (gen !== generation) return;
    sample();
  }
}

function reset() {
  generation++;
  const p = readParams();
  setupWorkers(p.threads);
  analyst.postMessage({ type: 'reset' });
  pendingSamples.clear();
  sim = createSim(p);
  lastSample = 0;
  sampling = false;
  speed = { t: performance.now(), epoch: 0, value: null };
  $('banner').hidden = true;
  if (!running) $('play').textContent = 'Inicia';
  base.width = p.width;
  base.height = p.height;
  fitView();
  sample(true);
  updatePanels();
  if (running) loop(generation);
}

function setRunning(on) {
  running = on;
  $('play').textContent = on ? 'Pausa' : sim.epoch ? 'Continua' : 'Inicia';
  $('step').disabled = on;
  if (on) loop(generation);
}

// ---------------------------------------------------------------- anàlisi

const analyst = new Worker(new URL('./analysis-worker.js', import.meta.url), { type: 'module' });
let sampling = false;
let lastSample = 0;
let sampleId = 0;
const pendingSamples = new Map();

analyst.onmessage = (e) => {
  const r = e.data;
  const meta = pendingSamples.get(r.id);
  pendingSamples.delete(r.id);
  if (r.id === sampleId) sampling = false;
  if (!meta || meta.sim !== sim) return;
  const s = sim;
  const before = new Map(s.families.map((f) => [f.id, f]));
  for (const id of r.extinct) {
    const f = before.get(id);
    if (f) s.extinct.push({ ...f, died: meta.epoch });
  }
  s.families = r.families;
  s.familyMap = r.map;
  s.mapShifts = meta.shifts;
  const largest = s.families.reduce((m, f) => Math.max(m, f.share), 0);
  s.history.push({ epoch: meta.epoch, hoe: r.hoe, ops: meta.ops, alive: r.alive, families: s.families.length, largest });
  if (s.transitionAt == null && r.hoe != null && r.hoe > THRESHOLD) s.transitionAt = meta.epoch;
  s.dirty = true;
  baseStale = true;
  updatePanels();
};

function sample(force = false) {
  const now = performance.now();
  if (sampling || (!force && now - lastSample < SAMPLE_MS)) return;
  lastSample = now;
  sampling = true;
  const s = sim;
  const snapshot = s.soup.slice();
  const id = ++sampleId;
  pendingSamples.set(id, { sim: s, epoch: s.epoch, shifts: s.shifts, ops: s.runsAcc ? s.opsAcc / s.runsAcc : null });
  s.opsAcc = s.runsAcc = 0;
  analyst.postMessage({ type: 'sample', buffer: snapshot.buffer, id, epoch: s.epoch, width: s.width }, [snapshot.buffer]);
}

// ---------------------------------------------------------------- colors

let palette = null;

function buildPalette() {
  const lo = cssRgb('--cell-lo'), hi = cssRgb('--cell-hi');
  palette = {
    fam: [pack(cssRgb('--fam-1')), pack(cssRgb('--fam-2')), pack(cssRgb('--fam-3'))],
    other: pack(cssRgb('--fam-other')),
    gap: pack(cssRgb('--surface')),
    density: Uint32Array.from({ length: 65 }, (_, k) => pack(lo.map((c, i) => Math.round(c + (hi[i] - c) * Math.min(1, k / 24))))),
    bytes: byteLut(),
    text: getComputedStyle(document.documentElement).getPropertyValue('--text').trim(),
  };
  baseStale = true;
  if (sim) sim.dirty = true;
}

// Família de la cel·la c (índex+1 a sim.families, o 0). El mapa de famílies es va
// fer fa una estona: si el riu ha desplaçat el món des de llavors, el desplacem igual.
function familyIndexAt(c) {
  const dx = sim.shifts - sim.mapShifts;
  if (!dx) return sim.familyMap[c];
  const x = c % sim.width - dx;
  return x < 0 ? 0 : sim.familyMap[c - dx];
}

// Color de la família de la cel·la c (o null si no en té).
function familyColor(c) {
  const k = familyIndexAt(c);
  if (!k) return null;
  const f = sim.families[k - 1];
  return f && f.slot >= 0 ? palette.fam[f.slot] : palette.other;
}

// ---------------------------------------------------------------- mapa

const canvas = $('map');
const ctx = canvas.getContext('2d');
const base = document.createElement('canvas');   // 1 píxel per cel·la (vista de famílies)
const baseCtx = base.getContext('2d');
const detail = document.createElement('canvas'); // blocs de 10×10 (vista de codi)
const detailCtx = detail.getContext('2d');
const view = { scale: 1, ox: 0, oy: 0, fitted: true };
let baseStale = true;
let lastBase = 0;

function cssSize() {
  const r = canvas.getBoundingClientRect();
  return { w: r.width, h: r.height };
}

function fitScale() {
  const { w, h } = cssSize();
  return Math.min(w / sim.width, h / sim.height);
}

function clampView() {
  const { w, h } = cssSize();
  const vw = w / view.scale, vh = h / view.scale;
  view.ox = vw >= sim.width ? (sim.width - vw) / 2 : Math.min(Math.max(view.ox, 0), sim.width - vw);
  view.oy = vh >= sim.height ? (sim.height - vh) / 2 : Math.min(Math.max(view.oy, 0), sim.height - vh);
}

function fitView() {
  view.scale = fitScale();
  view.fitted = true;
  clampView();
  sim.dirty = true;
}

function zoomAt(cx, cy, factor) {
  const wx = view.ox + cx / view.scale, wy = view.oy + cy / view.scale;
  view.scale = Math.min(MAX_SCALE, Math.max(fitScale(), view.scale * factor));
  view.fitted = view.scale <= fitScale() + 1e-9;
  view.ox = wx - cx / view.scale;
  view.oy = wy - cy / view.scale;
  clampView();
  sim.dirty = true;
}

function drawBase() {
  const { width: W, height: H, soup, n } = sim;
  const img = baseCtx.createImageData(W, H);
  const px = new Uint32Array(img.data.buffer);
  for (let c = 0; c < n; c++) {
    const fam = familyColor(c);
    if (fam != null) { px[c] = fam; continue; }
    let k = 0;
    const b = c * PROGRAM_SIZE;
    for (let i = 0; i < PROGRAM_SIZE; i++) if (KIND[soup[b + i]]) k++;
    px[c] = palette.density[k];
  }
  baseCtx.putImageData(img, 0, 0);
  baseStale = false;
  lastBase = performance.now();
}

function drawDetail(x0, y0, x1, y1) {
  const cols = x1 - x0, rows = y1 - y0;
  const w = cols * CELL_PX, h = rows * CELL_PX;
  if (detail.width !== w || detail.height !== h) { detail.width = w; detail.height = h; }
  const img = detailCtx.createImageData(w, h);
  const px = new Uint32Array(img.data.buffer);
  const { soup, width: W } = sim;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const c = y * W + x;
      const frame = familyColor(c) ?? palette.gap;
      const ox = (x - x0) * CELL_PX, oy = (y - y0) * CELL_PX;
      for (let j = 0; j < CELL_PX; j++) {
        const row = (oy + j) * w + ox;
        for (let i = 0; i < CELL_PX; i++) {
          const inside = i >= 1 && i <= 8 && j >= 1 && j <= 8;
          px[row + i] = inside ? palette.bytes[soup[c * PROGRAM_SIZE + (j - 1) * 8 + (i - 1)]] : frame;
        }
      }
    }
  }
  detailCtx.putImageData(img, 0, 0);
}

function render(now) {
  const dpr = window.devicePixelRatio || 1;
  const { w, h } = cssSize();
  const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
  if (canvas.width !== cw || canvas.height !== ch) {
    canvas.width = cw;
    canvas.height = ch;
    if (view.fitted) fitView(); else clampView();
  }
  const codeView = view.scale >= DETAIL_SCALE;
  if (!codeView && (baseStale || (running && now - lastBase > BASE_MS))) drawBase();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
  ctx.fillRect(0, 0, cw, ch);
  const sc = view.scale * dpr;
  if (!codeView) {
    ctx.drawImage(base, -view.ox * sc, -view.oy * sc, sim.width * sc, sim.height * sc);
  } else {
    const x0 = Math.max(0, Math.floor(view.ox)), y0 = Math.max(0, Math.floor(view.oy));
    const x1 = Math.min(sim.width, Math.ceil(view.ox + w / view.scale));
    const y1 = Math.min(sim.height, Math.ceil(view.oy + h / view.scale));
    drawDetail(x0, y0, x1, y1);
    ctx.drawImage(detail, (x0 - view.ox) * sc, (y0 - view.oy) * sc, (x1 - x0) * sc, (y1 - y0) * sc);
  }
  if (sim.selected >= 0) {
    const sx = sim.selected % sim.width, sy = Math.floor(sim.selected / sim.width);
    const pad = Math.max(2, sc * 0.6);
    ctx.strokeStyle = palette.text;
    ctx.lineWidth = 2 * dpr;
    ctx.strokeRect((sx - view.ox) * sc - pad, (sy - view.oy) * sc - pad, sc + 2 * pad, sc + 2 * pad);
  }
  $('legend-families').hidden = codeView;
  $('legend-code').hidden = !codeView;
  $('zoom-label').textContent = `${fmt(view.scale, view.scale < 10 ? 1 : 0)} píxels per cel·la · vista ${codeView ? 'de codi' : 'de famílies'}`;
}

// Interacció: roda per apropar, arrossegar per moure, clic per inspeccionar.
function cellAt(e) {
  const r = canvas.getBoundingClientRect();
  const x = Math.floor(view.ox + (e.clientX - r.left) / view.scale);
  const y = Math.floor(view.oy + (e.clientY - r.top) / view.scale);
  return x < 0 || y < 0 || x >= sim.width || y >= sim.height ? -1 : y * sim.width + x;
}

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0015));
}, { passive: false });

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  drag = { x: e.clientX, y: e.clientY, ox: view.ox, oy: view.oy, moved: false };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (drag) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) { drag.moved = true; canvas.classList.add('dragging'); }
    if (drag.moved) {
      view.ox = drag.ox - dx / view.scale;
      view.oy = drag.oy - dy / view.scale;
      clampView();
      sim.dirty = true;
      $('map-tip').hidden = true;
      return;
    }
  }
  showTip(e);
});
canvas.addEventListener('pointerup', (e) => {
  if (drag && !drag.moved) {
    const c = cellAt(e);
    if (c >= 0) { sim.selected = c === sim.selected ? -1 : c; sim.dirty = true; }
  }
  drag = null;
  canvas.classList.remove('dragging');
});
canvas.addEventListener('pointerleave', () => { $('map-tip').hidden = true; });

function showTip(e) {
  const c = cellAt(e);
  const tip = $('map-tip');
  if (c < 0) { tip.hidden = true; return; }
  const k = familyIndexAt(c);
  const f = k ? sim.families[k - 1] : null;
  const strong = document.createElement('strong');
  strong.textContent = f ? familyName(f.id) : 'Sense família';
  const span = document.createElement('span');
  span.textContent = `Cel·la (${c % sim.width}, ${Math.floor(c / sim.width)}) · ${countInstructions(sim.soup.subarray(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE))} instruccions`;
  tip.replaceChildren(strong, span);
  tip.hidden = false;
  const wrap = canvas.parentElement.getBoundingClientRect();
  tip.style.left = `${Math.min(e.clientX - wrap.left + 14, wrap.width - tip.offsetWidth - 4)}px`;
  tip.style.top = `${e.clientY - wrap.top + 14}px`;
}

$('zoom-in').addEventListener('click', () => { const { w, h } = cssSize(); zoomAt(w / 2, h / 2, 2); });
$('zoom-out').addEventListener('click', () => { const { w, h } = cssSize(); zoomAt(w / 2, h / 2, 0.5); });
$('zoom-fit').addEventListener('click', fitView);

// ---------------------------------------------------------------- panells

const hoeChart = new LineChart($('chart-hoe'), { yLabel: 'bits per byte', digits: 2 });
const opsChart = new LineChart($('chart-ops'), { yLabel: 'operacions', digits: 0 });

function swatch(f) {
  const i = document.createElement('i');
  i.className = `sw ${f.slot >= 0 ? `fam-${f.slot + 1}` : 'fam-other'}`;
  return i;
}

function renderInspector() {
  const c = sim.selected;
  if (c < 0) {
    $('inspector-title').textContent = 'Fes clic a una cel·la del mapa per seguir el seu programa en directe.';
    $('inspector').replaceChildren();
    return;
  }
  const bytes = sim.soup.subarray(c * PROGRAM_SIZE, (c + 1) * PROGRAM_SIZE);
  const k = familyIndexAt(c);
  const f = k ? sim.families[k - 1] : null;
  $('inspector-title').textContent = `Cel·la (${c % sim.width}, ${Math.floor(c / sim.width)}) · ${countInstructions(bytes)} instruccions · època ${fmt(sim.epoch)}`
    + (f ? ` · ${familyName(f.id)} (nucli ${f.core})` : '');
  renderProgram($('inspector'), bytes);
}

function updateLegend() {
  const list = $('legend-families');
  const items = [];
  for (const f of sim.families.filter((x) => x.slot >= 0).sort((a, b) => a.slot - b.slot)) {
    const li = document.createElement('li');
    li.append(swatch(f), familyName(f.id));
    items.push(li);
  }
  if (sim.families.some((f) => f.slot < 0)) {
    const li = document.createElement('li');
    li.append(swatch({ slot: -1 }), 'altres famílies');
    items.push(li);
  }
  const li = document.createElement('li');
  const i = document.createElement('i');
  i.className = 'sw cells';
  li.append(i, 'sense família: més clar com més instruccions té');
  items.push(li);
  list.replaceChildren(...items);
}

function updatePanels() {
  const s = sim;
  const last = s.history[s.history.length - 1];
  $('s-hoe').textContent = last?.hoe != null ? fmt(last.hoe, 2) : '–';
  $('s-families').textContent = fmt(s.families.length);
  $('s-largest').textContent = last?.largest ? `${fmt(last.largest * 100, last.largest < 0.1 ? 1 : 0)} %` : '–';
  $('s-alive').textContent = last?.alive != null ? `${fmt(last.alive * 100, last.alive < 0.1 ? 1 : 0)} %` : '–';

  hoeChart.update(s.history.filter((h) => h.hoe != null).map((h) => ({ x: h.epoch, y: h.hoe })), s.transitionAt);
  opsChart.update(s.history.filter((h) => h.ops != null).map((h) => ({ x: h.epoch, y: h.ops })), s.transitionAt);

  if (s.transitionAt != null) {
    $('banner-text').textContent = `Transició a l'època ${fmt(s.transitionAt)}: el món s'ha començat a omplir de còpies.`;
    $('banner').hidden = false;
  }

  updateLegend();
  const list = $('families');
  list.replaceChildren();
  for (const f of [...s.families].sort((a, b) => b.share - a.share)) {
    const li = document.createElement('li');
    li.className = 'family';
    const info = document.createElement('span');
    const name = document.createElement('span');
    name.className = 'family-name';
    name.textContent = familyName(f.id);
    const meta = document.createElement('span');
    meta.className = 'family-meta';
    meta.textContent = `${fmt(f.share * 100, f.share < 0.1 ? 1 : 0)} % del mapa · neix a l'època ${fmt(f.born)} · nucli ${f.core}`;
    info.append(name, meta);
    const code = document.createElement('span');
    code.className = 'code';
    code.title = 'Un membre de la família, tal com és ara';
    if (f.example) renderProgram(code, f.example);
    li.append(swatch(f), info, code);
    list.appendChild(li);
  }
  if (!s.families.length) {
    const li = document.createElement('li');
    li.className = 'sub';
    li.textContent = 'Encara no hi ha cap família de replicadors.';
    list.appendChild(li);
  }
  $('extinct').textContent = s.extinct.length
    ? `Extingides: ${s.extinct.map((f) => `${familyName(f.id).replace('Família ', '')} (època ${fmt(f.born)}–${fmt(f.died)})`).join(', ')}.`
    : '';

  const body = $('table-body');
  body.replaceChildren();
  for (const hrow of s.history.slice(-25).reverse()) {
    const tr = document.createElement('tr');
    for (const [v, d] of [[hrow.epoch, 0], [hrow.hoe, 3], [hrow.ops, 1], [hrow.alive * 100, 1], [hrow.families, 0], [hrow.largest * 100, 1]]) {
      const td = document.createElement('td');
      td.textContent = v == null ? '–' : fmt(v, d);
      tr.appendChild(td);
    }
    body.appendChild(tr);
  }
}

// ---------------------------------------------------------------- bucle de pintat

let speed = { t: performance.now(), epoch: 0, value: null };

function frame(now) {
  if (sim) {
    if (sim.dirty || (running && now - lastBase > BASE_MS)) {
      render(now);
      renderInspector();
      sim.dirty = false;
    }
    $('s-epoch').textContent = fmt(sim.epoch);
    if (now - speed.t >= 1000) {
      speed.value = running ? ((sim.epoch - speed.epoch) * 1000) / (now - speed.t) : null;
      speed.t = now;
      speed.epoch = sim.epoch;
      $('s-speed').textContent = speed.value != null ? fmt(speed.value, 1) : '–';
    }
  }
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------- controls

const cores = navigator.hardwareConcurrency || 4;
for (let i = 1; i <= Math.min(16, cores); i++) {
  const o = document.createElement('option');
  o.value = i;
  o.textContent = i;
  $('threads').appendChild(o);
}
$('threads').value = Math.max(1, cores - 1);

$('play').addEventListener('click', () => setRunning(!running));
$('step').addEventListener('click', async () => {
  if (running) return;
  $('step').disabled = true;
  const gen = generation;
  await runEpoch(sim);
  if (gen === generation) sample(true);
  $('step').disabled = false;
  $('play').textContent = 'Continua';
});
$('reset').addEventListener('click', reset);
for (const id of ['seed', 'size', 'radius', 'mixing', 'diffusion', 'flow', 'renewal', 'threads', 'rng']) $(id).addEventListener('change', reset);
$('mutation').addEventListener('change', () => { sim.mutation = readParams().mutation; });

$('csv').addEventListener('click', () => {
  const rows = [['epoca', 'entropia_ordre_superior', 'ops_per_execucio', 'es_repliquen', 'families_vives', 'familia_mes_gran']];
  for (const h of sim.history) rows.push([h.epoch, h.hoe, h.ops, h.alive, h.families, h.largest].map((v) => (v == null ? '' : v)));
  const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `mon-llavor${sim.seed}-epoca${sim.epoch}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', buildPalette);
new ResizeObserver(() => { if (sim) sim.dirty = true; }).observe(canvas);

// Per als curiosos: des de la consola del navegador, `mon.sim` és la simulació en curs.
globalThis.mon = { get sim() { return sim; }, view };

buildPalette();
reset();
requestAnimationFrame(frame);
