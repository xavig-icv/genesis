import { PROGRAM_SIZE, TAPE_SIZE } from './bff.js';
import { createRng, randomSoup, shuffle, gather, scatter } from './soup.js';
import { LineChart } from './chart.js';
import { motifMask, renderProgram, byteLut, countInstructions } from './glyphs.js';

const COLS = 8;          // programes per fila al mapa de la sopa
const SHOWN = 4096;      // programes visibles: 8 × 64 = 512 píxels d'ample, 512 files
const THRESHOLD = 1.0;   // bits d'entropia d'ordre superior que marquen la transició
const SAMPLE_MS = 700;   // cada quant es mesura la sopa

const $ = (id) => document.getElementById(id);
// (els valors que s'arrodoneixen a zero es mostren com a 0, no com a -0)
const fmt = (v, d = 0) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toLocaleString('ca', { minimumFractionDigits: d, maximumFractionDigits: d });

// ---------------------------------------------------------------- estat

let sim = null;
let workers = [];
let running = false;
let generation = 0;  // cada reinici invalida el bucle anterior

function readParams() {
  return {
    seed: Math.max(0, Math.floor(Number($('seed').value) || 0)),
    log2size: Number($('size').value),
    mutation: Math.max(0, Number($('mutation').value) || 0) / 100,
    threads: Number($('threads').value),
  };
}

function createSim(p) {
  const n = 1 << p.log2size;
  const rng = createRng(p.seed);
  return {
    n, rng,
    mutation: p.mutation,
    soup: randomSoup(n, rng),
    perm: new Uint32Array(n).map((_, i) => i),
    buffers: [],
    epoch: 0,
    history: [],
    opsAcc: 0,
    runsAcc: 0,
    transitionAt: null,
    distinct: null,
    motifs: [],
    selected: sim ? sim.selected : -1,
    dirty: true,
  };
}

// Els treballadors es recreen a cada reinici: així cap resposta d'una
// època antiga no es pot barrejar amb la sopa nova.
function setupWorkers(count) {
  for (const w of workers) w.terminate();
  workers = Array.from({ length: count }, () => new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }));
}

function callWorker(w, msg) {
  return new Promise((resolve, reject) => {
    w.onmessage = (e) => resolve(e.data);
    w.onerror = reject;
    w.postMessage(msg, [msg.buffer]);
  });
}

// ---------------------------------------------------------------- simulació

async function runEpoch(s) {
  shuffle(s.perm, s.rng);
  const nPairs = s.n / 2;
  const per = Math.ceil(nPairs / workers.length);
  const jobs = [];
  for (let i = 0; i < workers.length; i++) {
    const first = i * per;
    const count = Math.min(per, nPairs - first);
    if (count <= 0) break;
    let buffer = s.buffers[i];
    if (!buffer || buffer.byteLength !== count * TAPE_SIZE) buffer = new ArrayBuffer(count * TAPE_SIZE);
    gather(s.soup, s.perm, new Uint8Array(buffer), first, count);
    const seed = (s.rng() * 4294967296) >>> 0;
    jobs.push(callWorker(workers[i], { buffer, nPairs: count, seed, mutation: s.mutation }).then((r) => {
      s.buffers[i] = r.buffer;
      scatter(s.soup, s.perm, new Uint8Array(r.buffer), first, count);
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
  sim = createSim(p);
  lastSample = 0;
  sampling = false;
  speed = { t: performance.now(), epoch: 0, value: null };
  $('banner').hidden = true;
  if (!running) $('play').textContent = 'Inicia';
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

// ---------------------------------------------------------------- mesures
// Les mesures es calculen en un treballador a part sobre una còpia de la
// sopa, perquè la pantalla no s'encalli mentre es comprimeix.

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
  s.history.push({ epoch: meta.epoch, hoe: r.hoe, h0: r.h0, bpb: r.bpb, ops: meta.ops });
  s.distinct = r.distinct;
  s.motifs = r.motifs;
  if (s.transitionAt == null && r.hoe != null && r.hoe > THRESHOLD) s.transitionAt = meta.epoch;
  s.dirty = true; // per tornar a pintar l'inspector amb el fragment destacat
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
  pendingSamples.set(id, { sim: s, epoch: s.epoch, ops: s.runsAcc ? s.opsAcc / s.runsAcc : null });
  s.opsAcc = s.runsAcc = 0;
  analyst.postMessage({ buffer: snapshot.buffer, id }, [snapshot.buffer]);
}

// ---------------------------------------------------------------- dibuix de la sopa

const canvas = $('soup');
const ctx = canvas.getContext('2d');
const image = ctx.createImageData(canvas.width, canvas.height);
const pixels = new Uint32Array(image.data.buffer);
let lut = new Uint32Array(256);

function buildLut() {
  lut = byteLut();
  if (sim) sim.dirty = true;
}

function drawSoup() {
  const { soup } = sim;
  const width = canvas.width;
  for (let p = 0; p < SHOWN; p++) {
    const o = ((p / COLS) | 0) * width + (p % COLS) * PROGRAM_SIZE;
    const b = p * PROGRAM_SIZE;
    for (let i = 0; i < PROGRAM_SIZE; i++) pixels[o + i] = lut[soup[b + i]];
  }
  ctx.putImageData(image, 0, 0);
  if (sim.selected >= 0) {
    const row = (sim.selected / COLS) | 0, col = sim.selected % COLS;
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
    ctx.lineWidth = 1;
    ctx.strokeRect(col * PROGRAM_SIZE - 0.5, row - 1.5, PROGRAM_SIZE + 1, 3);
  }
}

function programAt(e) {
  const r = canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * canvas.width;
  const y = ((e.clientY - r.top) / r.height) * canvas.height;
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return -1;
  return Math.floor(y) * COLS + Math.floor(x / PROGRAM_SIZE);
}

canvas.addEventListener('click', (e) => {
  const p = programAt(e);
  sim.selected = p === sim.selected ? -1 : p;
  sim.dirty = true;
});
canvas.addEventListener('pointermove', (e) => {
  const p = programAt(e);
  const tip = $('soup-tip');
  if (p < 0) { tip.hidden = true; return; }
  tip.replaceChildren();
  const strong = document.createElement('strong');
  strong.textContent = `Programa núm. ${fmt(p)}`;
  const span = document.createElement('span');
  span.textContent = p === sim.selected ? 'Clic per deixar de seguir-lo' : 'Clic per seguir-lo a l\'inspector';
  tip.append(strong, span);
  tip.hidden = false;
  const wrap = canvas.parentElement.getBoundingClientRect();
  tip.style.left = `${Math.min(e.clientX - wrap.left + 14, wrap.width - tip.offsetWidth - 4)}px`;
  tip.style.top = `${e.clientY - wrap.top + 14}px`;
});
canvas.addEventListener('pointerleave', () => { $('soup-tip').hidden = true; });

// ---------------------------------------------------------------- panells

function renderInspector() {
  const p = sim.selected;
  if (p < 0) {
    $('inspector-title').textContent = 'Fes clic a la sopa per seguir un programa en directe.';
    $('inspector').replaceChildren();
    return;
  }
  const bytes = sim.soup.subarray(p * PROGRAM_SIZE, (p + 1) * PROGRAM_SIZE);
  const ops = countInstructions(bytes);
  const motif = sim.motifs[0]?.bytes;
  const hasMotif = motifMask(bytes, motif).some(Boolean);
  $('inspector-title').textContent = `Programa núm. ${fmt(p)} · ${ops} instruccions en 64 bytes · època ${fmt(sim.epoch)}`
    + (hasMotif ? ' · conté el fragment més abundant (subratllat)' : '');
  renderProgram($('inspector'), bytes, motif);
}

const hoeChart = new LineChart($('chart-hoe'), { yLabel: 'bits per byte', digits: 2 });
const opsChart = new LineChart($('chart-ops'), { yLabel: 'operacions', digits: 0 });

function updatePanels() {
  const s = sim;
  const last = s.history[s.history.length - 1];
  $('s-hoe').textContent = last?.hoe != null ? fmt(last.hoe, 2) : '–';
  $('s-ops').textContent = last?.ops != null ? fmt(last.ops, 0) : '–';
  const share = s.motifs[0]?.share;
  $('s-share').textContent = share != null ? `${fmt(share * 100, share < 0.1 ? 1 : 0)} %` : '–';

  hoeChart.update(s.history.filter((h) => h.hoe != null).map((h) => ({ x: h.epoch, y: h.hoe })), s.transitionAt);
  opsChart.update(s.history.filter((h) => h.ops != null).map((h) => ({ x: h.epoch, y: h.ops })), s.transitionAt);

  if (s.transitionAt != null) {
    $('banner-text').textContent = `Transició a l'època ${fmt(s.transitionAt)}: la sopa s'ha començat a omplir de còpies.`;
    $('banner').hidden = false;
  }

  const list = $('top');
  list.replaceChildren();
  for (const { share, bytes } of s.motifs) {
    const li = document.createElement('li');
    const c = document.createElement('span');
    c.className = 'count';
    c.textContent = `${fmt(share * 100, share < 0.1 ? 1 : 0)} %`;
    const small = document.createElement('small');
    small.textContent = 'dels programes';
    c.appendChild(small);
    const code = document.createElement('span');
    code.className = 'code';
    renderProgram(code, bytes, null, true);
    li.append(c, code);
    list.appendChild(li);
  }
  if (!s.motifs.length) {
    const li = document.createElement('li');
    li.className = 'sub';
    li.textContent = 'Encara no hi ha cap fragment de codi repetit.';
    list.appendChild(li);
  }

  const body = $('table-body');
  body.replaceChildren();
  for (const h of s.history.slice(-25).reverse()) {
    const tr = document.createElement('tr');
    for (const [v, d] of [[h.epoch, 0], [h.hoe, 3], [h.h0, 3], [h.bpb, 3], [h.ops, 1]]) {
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
    if (sim.dirty) {
      drawSoup();
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
for (const id of ['seed', 'size', 'threads']) $(id).addEventListener('change', reset);
$('mutation').addEventListener('change', () => { sim.mutation = readParams().mutation; });

$('csv').addEventListener('click', () => {
  const rows = [['epoca', 'entropia_ordre_superior', 'entropia_shannon', 'bits_per_byte_comprimit', 'ops_per_execucio']];
  for (const h of sim.history) rows.push([h.epoch, h.hoe, h.h0, h.bpb, h.ops].map((v) => (v == null ? '' : v)));
  const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `sopa-llavor${readParams().seed}-epoca${sim.epoch}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', buildLut);

// Per als curiosos: des de la consola del navegador, `sopa.sim` és la simulació en curs.
globalThis.sopa = { get sim() { return sim; } };

buildLut();
reset();
requestAnimationFrame(frame);
