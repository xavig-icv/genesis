// El microscopi: dues cel·les veïnes reals d'un món de les sèries, i la seva trobada, pas a pas, amb la cinta de 128 bytes
// plegada en una doble hèlix (helix.js). La parella la tria trobada.js, a l'atzar amb una llavor declarada; l'execució és la de
// cinta.js (trace), que segueix l'intèrpret del simulador (fase1/bff.js) i s'hi compara abans d'ensenyar res, com a la portada.
//
// Tot el que es veu surt de les dades: els bytes de les dues cel·les (el codi de l'època, comprovat amb la seva SHA-256), el món,
// l'època i els passos de l'intèrpret. Només hi posem la forma de l'hèlix, els colors del tema i el moviment de la càmera.
import { compile } from './gl.js';
import { v3, perspective, lookAt, multiply, invert, project } from './mat4.js';
import { SHAPES, CLASS_NAMES, CLASS_GLYPH, glyphOf } from './formes.js';
import { trace, check, mirrorStep, copyStep } from './cinta.js';
import { loadWorld } from './dades.js';
import { bindThemeSwitch, readStageTokens, reducedMotion } from './tema.js';
import { t, num, lang, setLang, onLang, apply } from './i18n.js';
import { TAPE, HALF, atomFrame, atomMatrix, backbone, rungs, mirrored, slot } from './helix.js';
import { classOfByte, pickPair } from './trobada.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const BASE = '../dades';
// la trobada de partida: el món 1006, l'època de la cinta de la portada, i la primera llavor de les trobades, la de la cinta: la
// mateixa trobada (eines/web-trobades.mjs)
const DEFAULT = { mon: '1006', e: 3500 };
const SUN = v3.normalize([0.35, 0.9, 0.45]);
const FOV = (40 * Math.PI) / 180;
// la vista de partida: de biaix i a prop, i la càmera segueix els dos caps al llarg de l'hèlix (follow), fins que es fa doble clic
// en un àtom; Inici hi torna
const HOME = { yaw: -0.62, pitch: 0.36, dist: 26, target: [0, 0, 0] };

apply();
for (const b of document.querySelectorAll('[data-lang]')) b.addEventListener('click', () => setLang(b.dataset.lang));
bindThemeSwitch();

// ---- el panell, l'ajuda i el full inferior (com a l'explorador) ----
const help = $('help');
for (const b of document.querySelectorAll('[data-help]')) b.addEventListener('click', () => { help.showModal(); help.querySelector('.btn-primary')?.focus(); });
const side = $('side'), dock = $('dock'), grab = $('grab'), panelBtn = $('panel-btn');
const showPanel = (on) => { side.classList.toggle('is-closed', !on); panelBtn?.setAttribute('aria-expanded', String(on)); };
const showSheet = (on) => { dock.classList.toggle('is-open', on); grab.setAttribute('aria-expanded', String(on)); };
showPanel(true);
showSheet(false);
panelBtn?.addEventListener('click', () => showPanel(side.classList.contains('is-closed')));
grab.addEventListener('click', () => showSheet(!dock.classList.contains('is-open')));
$('sum').addEventListener('click', () => showSheet(true));
const mobile = matchMedia('(max-width: 820px)');
const placeSelect = () => (mobile.matches ? $('world-mob') : $('world-desk')).append($('world-box'));
placeSelect();
mobile.addEventListener?.('change', placeSelect);
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
function show(which, text) {
  for (const id of ['loading', 'error']) $(id).hidden = id !== which;
  if (which === 'error') $('error-text').textContent = text;
}

// ---- WebGL2: sense, la cinta de la portada és l'alternativa ----
const canvas = $('view');
const gl = canvas.getContext('webgl2', { antialias: true });
if (!gl) {
  $('loading').hidden = true;
  $('nowebgl').hidden = false;
  throw new Error('WebGL2');
}
const SOLID_VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
uniform mat4 uVP, uM;
out vec3 vN;
out vec3 vW;
void main() { vec4 w = uM * vec4(aPos, 1.0); vW = w.xyz; vN = mat3(uM) * aNormal; gl_Position = uVP * w; }`;
const SOLID_FS = `#version 300 es
precision highp float;
in vec3 vN;
in vec3 vW;
uniform vec3 uColor, uSun, uEye, uBg;
uniform float uEmit, uAmb, uFog, uAlpha;
out vec4 o;
void main() {
  vec3 n = normalize(vN);
  float d = max(dot(n, uSun), 0.0);
  vec3 c = uColor * (uAmb + (1.0 - uAmb) * d) + uColor * uEmit;
  float f = 1.0 - exp(-uFog * distance(vW, uEye));
  o = vec4(mix(c, uBg, f), uAlpha);
}`;
const LINE_VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec4 aColor;
uniform mat4 uVP;
out vec4 vC;
void main() { vC = aColor; gl_Position = uVP * vec4(aPos, 1.0); }`;
const LINE_FS = `#version 300 es
precision highp float;
in vec4 vC;
out vec4 o;
void main() { o = vC; }`;
const solid = compile(gl, SOLID_VS, SOLID_FS), line = compile(gl, LINE_VS, LINE_FS);

function mesh(data) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
  gl.bindVertexArray(null);
  return { vao, count: data.length / 6 };
}
// un anell al pla xz, al voltant de l'eix y: la instrucció que s'executa
function torus(R, r, n, m) {
  const out = [], P = (i, k) => {
    const a = (i / n) * 2 * Math.PI, b = (k / m) * 2 * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
    return [[(R + r * Math.cos(b)) * ca, r * Math.sin(b), (R + r * Math.cos(b)) * sa], [Math.cos(b) * ca, Math.sin(b), Math.cos(b) * sa]];
  };
  for (let i = 0; i < n; i++) for (let k = 0; k < m; k++) {
    const q = [P(i, k), P(i + 1, k), P(i + 1, k + 1), P(i, k + 1)];
    for (const idx of [0, 1, 2, 0, 2, 3]) out.push(...q[idx][0], ...q[idx][1]);
  }
  return new Float32Array(out);
}
// un con amb la punta a l'origen i la base a y = h: els caps, que apunten l'àtom
function cone(r, h, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 2 * Math.PI, a1 = ((i + 1) / n) * 2 * Math.PI;
    const p0 = [r * Math.cos(a0), h, r * Math.sin(a0)], p1 = [r * Math.cos(a1), h, r * Math.sin(a1)];
    const nm = v3.normalize(v3.cross(p0, p1));
    out.push(0, 0, 0, ...nm, ...p0, ...nm, ...p1, ...nm);
    out.push(0, h, 0, 0, 1, 0, ...p1, 0, 1, 0, ...p0, 0, 1, 0);
  }
  return new Float32Array(out);
}
const SOLIDS = SHAPES.map((s) => (s ? mesh(s.data) : null));
const RING = mesh(torus(0.66, 0.07, 36, 6)), CONE = mesh(cone(0.26, 0.6, 14));
const lineBuf = gl.createBuffer(), lineVao = gl.createVertexArray();
gl.bindVertexArray(lineVao);
gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 12);
gl.bindVertexArray(null);

// la geometria fixa: l'àtom de cada posició, i les línies (just per sota dels àtoms)
const FRAMES = Array.from({ length: TAPE }, (_, p) => atomFrame(p));
const BASES = Array.from({ length: TAPE }, (_, p) => atomFrame(p, 3.08).center);
const SEGMENTS = [...backbone(), ...rungs()];
const PAIR_OF = (a, b) => slot(a).j === slot(b).j && a !== b;  // un graó: les dues posicions del mateix graó
const lineData = new Float32Array(SEGMENTS.length * 2 * 7);

// ---- l'estat ----
const state = {
  list: [], world: null, meetings: null, e: null, famId: null, seed: 0,
  pair: null, A: null, tape0: null, tr: null, done: -1, kind: 'none',
  s: 0, cur: null, playing: false, speed: 1, carry: 0, last: 0, paused: false,
  wroteAt: new Float64Array(TAPE).fill(-1e9), particles: [], hover: -1, tokens: readStageTokens(),
};
window.addEventListener('themechange', () => { state.tokens = readStageTokens(); });
const cam = { ...HOME, target: [...HOME.target], goal: { ...HOME, target: [...HOME.target] }, follow: true };

// ---- els mons: només els que tenen famílies i codi ----
// Les trobades d'un món (eines/web-trobades.mjs): els bytes reals de les parelles de cada llavor. El fitxer es comprova amb la seva
// SHA-256 de web/dades/SHA256SUMS, la llista que també comprova la publicació del lloc
let sums = null;
async function loadSums() {
  if (sums) return sums;
  const r = await fetch(`${BASE}/SHA256SUMS`);
  if (!r.ok) throw new Error(`SHA256SUMS: ${r.status}`);
  sums = new Map((await r.text()).split('\n').filter(Boolean).map((l) => { const [h, f] = l.trim().split(/\s+\*?/); return [f, h]; }));
  return sums;
}
async function loadMeetings(id) {
  const expected = (await loadSums()).get(`${id}/trobades.z`);
  if (!expected) return null;
  const r = await fetch(`${BASE}/${id}/trobades.z`);
  if (!r.ok) throw new Error(`${id}/trobades.z: ${r.status}`);
  const buf = await r.arrayBuffer();
  if (globalThis.crypto?.subtle) {
    const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buf))].map((b) => b.toString(16).padStart(2, '0')).join('');
    if (h !== expected) throw new Error(`${id}/trobades.z no té la SHA-256 de SHA256SUMS`);
  }
  const raw = await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('deflate'))).text();
  return JSON.parse(raw);
}
async function start() {
  try {
    const list = await (await fetch(`${BASE}/mons.json`)).json();
    const listed = await loadSums();
    // només els mons amb trobades
    for (const w of list) if (listed.has(`${w.id}/trobades.z`)) state.list.push(w);
  } catch (e) { show('error', t('error.load', { m: e.message })); return; }
  if (!state.list.length) { show('error', t('error.load', { m: 'mons.json' })); return; }
  const sel = $('world');
  const fill = () => {
    sel.replaceChildren(...state.list.map((w) => new Option(w.titol[lang], w.id)));
    if (state.world) sel.value = state.world.meta.id;
  };
  fill();
  onLang(fill);
  sel.addEventListener('change', () => openWorld(sel.value, {}));
  $('retry').addEventListener('click', () => openWorld(sel.value, {}));
  const q = new URLSearchParams(location.search), wanted = q.get('mon') ?? DEFAULT.mon;
  const id = state.list.some((w) => w.id === wanted) ? wanted : state.list[0].id;
  await openWorld(id, { e: Number(q.get('e')), fam: Number(q.get('fam')), seed: q.get('llavor') });
}

// les èpoques de les trobades, i les famílies de cada una
const epochsOf = () => Object.keys(state.meetings.epoques).map(Number).sort((a, b) => a - b);
const seedRange = () => [state.meetings.llavors.des, state.meetings.llavors.des + state.meetings.llavors.n - 1];
async function openWorld(id, wanted) {
  $('loading-name').textContent = state.list.find((w) => w.id === id)?.titol[lang] ?? id;
  show('loading');
  let w, meetings;
  try { [w, meetings] = await Promise.all([loadWorld(`${BASE}/${id}`), loadMeetings(id)]); } catch (e) { show('error', t('error.load', { m: e.message })); return; }
  if (!meetings) { show('error', t('error.load', { m: `${id}/trobades.z` })); return; }
  Object.assign(state, { world: w, meetings });
  show(null);
  $('world').value = id;
  $('w-title').textContent = w.meta.titol[lang];
  $('w-check').hidden = !w.checked;
  const epochs = epochsOf(), [lo, hi] = seedRange();
  state.e = epochs.includes(wanted.e) ? wanted.e : epochs.includes(DEFAULT.e) ? DEFAULT.e : epochs[epochs.length >> 1];
  state.famId = wanted.fam || null;
  const s = Number(wanted.seed);
  state.seed = /^\d{1,10}$/.test(wanted.seed ?? '') && s >= lo && s <= hi ? s : lo;
  fillEpochs();
  await setupPair();
}
function fillEpochs() {
  const sel = $('epoch-sel');
  sel.replaceChildren(...epochsOf().map((e) => new Option(num(e), String(e))));
  sel.value = String(state.e);
  fillFamilies();
}
function fillFamilies() {
  const w = state.world, ids = Object.keys(state.meetings.epoques[state.e].families).map(Number), sel = $('fam-sel');
  if (!ids.includes(state.famId)) state.famId = ids[0];
  sel.replaceChildren(...ids.map((id) => { const f = w.families.get(id); return new Option(`${t('inspector.family', { id })}${f?.nucli ? ` · ${f.nucli}` : ''}`, String(id)); }));
  sel.value = String(state.famId);
}
$('epoch-sel').addEventListener('change', () => { state.e = Number($('epoch-sel').value); fillFamilies(); setupPair(); });
$('fam-sel').addEventListener('change', () => { state.famId = Number($('fam-sel').value); setupPair(); });
// la llavor: només les de les trobades; una altra, la següent (i, després de l'última, la primera)
$('seed').addEventListener('change', () => {
  const v = $('seed').value.trim(), [lo, hi] = seedRange();
  if (/^\d{1,10}$/.test(v) && Number(v) >= lo && Number(v) <= hi) { state.seed = Number(v); setupPair(); }
  else { $('seed').value = String(state.seed); $('pair-result').textContent = t('micro.seedRange', { a: lo, b: hi }); }
});
$('reseed').addEventListener('click', () => { const [lo, hi] = seedRange(); state.seed = state.seed >= hi ? lo : state.seed + 1; setupPair(); });

// ---- la parella: la tria, el codi, l'execució i la comprovació ----
let setupToken = 0;
async function setupPair() {
  const token = ++setupToken, w = state.world, [W, H] = w.meta.mida, i = w.epochs.indexOf(state.e);
  const j = w.meta.fotogrames[i].f.indexOf(state.famId) + 1;
  $('seed').value = String(state.seed);
  syncUrl();
  setPlaying(false);
  const res = pickPair(w.fam(i), W, H, j, state.seed);
  if (!res) { Object.assign(state, { tr: null, cur: null }); describePair(t('micro.nopair', { f: state.famId })); return; }
  // la trobada de les dades: la de la llavor ha de ser la parella que en fa el mapa, i cada byte, de la classe del codi del lloc
  const stored = state.meetings.epoques[state.e]?.families[state.famId]?.trobades[state.seed - state.meetings.llavors.des];
  let classes;
  try { classes = await w.code(state.e); } catch (e) { show('error', t('error.load', { m: e.message })); return; }
  if (token !== setupToken) return;
  const [a, b] = res.pair, tape = new Uint8Array(TAPE);
  const fail = () => { Object.assign(state, { tr: null, cur: null }); describePair(t('micro.mismatchData')); };
  if (!stored || stored[0] !== a || stored[1] !== b || !/^[0-9a-f]{256}$/.test(stored[2])) { fail(); return; }
  for (let p = 0; p < TAPE; p++) tape[p] = parseInt(stored[2].slice(2 * p, 2 * p + 2), 16);
  for (let p = 0; p < TAPE; p++) if (classOfByte(tape[p]) !== classes[(p < HALF ? a : b) * 64 + (p % HALF)]) { fail(); return; }
  const tr = trace(tape);
  // abans d'ensenyar res, el traçat ha de coincidir amb l'intèrpret del simulador (cada 16 passos i al final)
  if (check(tape, tr, 16) !== -1) { Object.assign(state, { tr: null, cur: null }); describePair(t('micro.mismatch')); return; }
  const mirror = mirrorStep(tape, tr), direct = mirror < 0 ? copyStep(tape, tr) : -1;
  Object.assign(state, {
    pair: { a, b, count: res.count, W }, A: tape.slice(0, HALF), tape0: tape, tr,
    done: mirror >= 0 ? mirror : direct, kind: mirror >= 0 ? 'mirror' : direct >= 0 ? 'direct' : 'none',
    s: 0, cur: tape.slice(), carry: 0, particles: [], hover: -1,
  });
  state.wroteAt.fill(-1e9);
  $('time').max = String(tr.steps);
  const mark = $('done-mark');
  mark.hidden = state.done < 0;
  if (state.done >= 0) { mark.style.left = `${(state.done / tr.steps) * 100}%`; mark.querySelector('span').textContent = t('micro.done'); }
  describePair();
  legend();
  // amb moviment reduït, el pas de la còpia sencera, quiet; si no, es reprodueix sola
  if (reducedMotion.matches) goTo(Math.max(0, state.done));
  else setTimeout(() => { if (token === setupToken && state.s === 0) setPlaying(true); }, 500);
  render();
}
function syncUrl() {
  const q = new URLSearchParams(location.search);
  q.set('mon', state.world.meta.id); q.set('e', String(state.e)); q.set('fam', String(state.famId)); q.set('llavor', String(state.seed));
  history.replaceState(null, '', `?${q}`);
}
function cellXY(c) { const W = state.pair.W; return [c % W, Math.floor(c / W)]; }
function describePair(problem) {
  const w = state.world;
  if (problem) {
    $('pair-text').textContent = problem;
    $('pair-result').textContent = '';
    $('to-explorer').href = `../explorador/?mon=${w.meta.id}&e=${state.e}`;
    $('sum-pair').textContent = '';
    return;
  }
  const [ax, ay] = cellXY(state.pair.a), [bx, by] = cellXY(state.pair.b);
  $('pair-text').textContent = t('micro.pair', {
    w: w.meta.id, e: num(state.e), f: state.famId, ax, ay, bx, by, d: Math.max(Math.abs(ax - bx), Math.abs(ay - by)),
    s: state.seed, n: num(state.pair.count),
  });
  const end = state.tr.final;
  $('pair-result').textContent = state.kind === 'mirror' ? t('micro.result.mirror', { s: num(state.done) })
    : state.kind === 'direct' ? t('micro.result.direct', { s: num(state.done) })
      : t('micro.result.none', { c: mirrored(end, state.A) });
  $('to-explorer').href = `../explorador/?mon=${w.meta.id}&e=${state.e}&x=${ax}&y=${ay}`;
  $('sum-pair').textContent = `${num(state.e)} · (${ax}, ${ay}) → (${bx}, ${by})`;
}
onLang(() => { if (!state.world) return; $('w-title').textContent = state.world.meta.titol[lang]; fillEpochs(); if (state.tr) describePair(); legend(); render(); });

// ---- la reproducció ----
function goTo(target, live = false) {
  const tr = state.tr;
  if (!tr) return;
  if (target < state.s) { state.s = 0; state.cur = state.tape0.slice(); state.wroteAt.fill(-1e9); state.particles = []; }
  const now = performance.now() / 1000, from = state.s;
  for (; state.s < target; ) {
    const s = ++state.s, w = tr.written[s];
    if (w < 0) continue;
    const op = state.cur[tr.pc[s - 1]];
    state.cur[w] = tr.value[s];
    // les últimes escriptures d'un salt, amb el seu moviment: la còpia, del cap d'on llegeix al cap on escriu
    if (!live || reducedMotion.matches || target - s > 24) continue;
    state.wroteAt[w] = now;
    const src = op === 46 ? tr.h0[s] : op === 44 ? tr.h1[s] : -1;  // '.' copia de h0 a h1, ',' de h1 a h0
    if (src >= 0 && src !== w) state.particles.push({ from: src, to: w, t0: now, op });
  }
  if (from !== state.s) render();
}
function rate() {
  const tr = state.tr;
  // uns 12 segons fins a la còpia sencera, i després deu vegades més de pressa; sense còpia sencera, uns 20 segons en total
  const base = state.done > 0 ? (state.s < state.done ? state.done / 12 : (state.done / 12) * 10) : tr.steps / 20;
  return base * state.speed;
}
function setPlaying(on) {
  if (on && cam.overview) { cam.overview = false; cam.goal.dist = HOME.dist; }
  if (on && (!state.tr || state.s >= state.tr.steps)) { if (!state.tr) return; goTo(0); }
  state.playing = on;
  $('play').title = t(on ? 'time.pause' : 'time.play');
  $('play').setAttribute('aria-label', $('play').title);
  $('play-icon').innerHTML = on ? '<path class="ic-fill" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"></path>' : '<path class="ic-fill" d="M7 4.5v15l12.5-7.5z"></path>';
  state.last = performance.now();
  state.carry = 0;
}
$('play').addEventListener('click', () => setPlaying(!state.playing));
$('time').addEventListener('input', () => { setPlaying(false); goTo(Number($('time').value)); });
for (const b of document.querySelectorAll('[data-speed]')) b.addEventListener('click', () => {
  state.speed = Number(b.dataset.speed);
  for (const o of document.querySelectorAll('[data-speed]')) o.setAttribute('aria-pressed', String(o === b));
});
function advance(now) {
  if (!state.playing || !state.tr) return;
  state.carry += ((now - state.last) / 1000) * rate();
  state.last = now;
  const n = Math.floor(state.carry);
  state.carry -= n;
  if (!n) return;
  let target = Math.min(state.tr.steps, state.s + n);
  // a la còpia sencera s'atura, com la cinta de la portada; si es continua, va més de pressa fins al final
  const arrive = state.done > 0 && state.s < state.done && target >= state.done;
  if (arrive) target = state.done;
  goTo(target, true);
  if (arrive || state.s >= state.tr.steps) setPlaying(false);
  // a la còpia sencera, la càmera s'allunya per ensenyar tota l'escala encesa; en continuar, torna a seguir els caps
  if (arrive && cam.follow) { cam.overview = true; Object.assign(cam.goal, { target: [0, 0, 0], dist: 64 }); }
}
// el text de la línia de temps i dels comptadors
function render() {
  const tr = state.tr;
  if (!tr) return;
  const p = `${(state.s / Math.max(1, tr.steps)) * 100}%`;
  $('time').value = String(state.s);
  $('fill').style.width = p;
  $('playhead').style.left = p;
  $('step').textContent = num(state.s);
  $('copied').textContent = `${mirrored(state.cur, state.A)}/64`;
}

// ---- la llegenda: els àtoms i les marques ----
function legend() {
  const box = $('legend');
  box.replaceChildren();
  for (const cls of [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 0]) {
    const d = el('div', 'lg');
    d.append(el('dt', CLASS_GLYPH[cls], glyphOf(cls)), el('dd', '', cls ? CLASS_NAMES[lang][cls].replace(/^.\s/, '') : t('micro.lg.data')));
    box.append(d);
  }
  const marks = $('marks');
  marks.replaceChildren();
  const f = state.world?.families.get(state.famId);
  for (const [g, cls, key] of [['◯', '', 'micro.lg.pc'], ['▼', 'g-h0', 'micro.lg.h0'], ['▼', 'g-h1', 'micro.lg.h1'], ['━', '', 'micro.lg.rung']]) {
    const d = el('div', 'lg'), dt = el('dt', cls, g);
    // el graó encès, amb el color de la família
    if (key === 'micro.lg.rung' && f) dt.style.color = `var(--f${(f.paleta % 12) + 1})`;
    d.append(dt, el('dd', '', t(key)));
    marks.append(d);
  }
}
legend();

// ---- la càmera: gira al voltant del punt que es mira ----
// en una pantalla estreta (el mòbil dret), la càmera s'allunya: la vista té l'angle vertical fix
const narrow = () => Math.min(2, Math.max(1, canvas.clientHeight / Math.max(1, canvas.clientWidth)));
function eyeOf(c) {
  const cp = Math.cos(c.pitch), d = c.dist * narrow();
  return [c.target[0] + d * cp * Math.sin(c.yaw), c.target[1] + d * Math.sin(c.pitch), c.target[2] + d * cp * Math.cos(c.yaw)];
}
function updateCamera(dt) {
  // el punt que es mira, al llarg de l'eix: entre els dos caps
  if (cam.follow && !cam.overview && state.tr) {
    const s = state.s, x = (FRAMES[state.tr.h0[s]].center[0] + FRAMES[state.tr.h1[s]].center[0]) / 2;
    cam.goal.target = [x, 0, 0];
  }
  const k = 1 - Math.exp(-dt * 9), g = cam.goal;
  cam.yaw += (g.yaw - cam.yaw) * k;
  cam.pitch += (g.pitch - cam.pitch) * k;
  cam.dist += (g.dist - cam.dist) * k;
  cam.target = v3.mix(cam.target, g.target, k);
}
const clampGoal = () => {
  cam.goal.pitch = Math.max(-1.4, Math.min(1.4, cam.goal.pitch));
  cam.goal.dist = Math.max(5, Math.min(150, cam.goal.dist));
  cam.goal.target[0] = Math.max(-32, Math.min(32, cam.goal.target[0]));
};
let viewProj = null, inverse = null;
const pointers = new Map();
let dragged = 0, pinch = null;
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  dragged = 0;
  if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), dist: cam.goal.dist }; }
});
canvas.addEventListener('pointermove', (e) => {
  const p = pointers.get(e.pointerId);
  if (!p) { hoverAt(e.clientX, e.clientY); return; }
  const dx = e.clientX - p.x, dy = e.clientY - p.y;
  p.x = e.clientX; p.y = e.clientY;
  dragged += Math.abs(dx) + Math.abs(dy);
  if (pointers.size === 2 && pinch) {
    const [a, b] = [...pointers.values()];
    cam.goal.dist = pinch.dist * (pinch.d / Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)));
  } else {
    cam.goal.yaw -= dx * 0.006;
    cam.goal.pitch += dy * 0.006;
  }
  clampGoal();
});
const release = (e) => { pointers.delete(e.pointerId); if (pointers.size < 2) pinch = null; };
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);
canvas.addEventListener('pointerleave', () => { if (!pointers.size) setHover(-1); });
canvas.addEventListener('wheel', (e) => { e.preventDefault(); cam.goal.dist *= Math.exp(e.deltaY * 0.0012); clampGoal(); }, { passive: false });
// doble clic: s'apropa a l'àtom
canvas.addEventListener('dblclick', (e) => {
  const p = atomAt(e.clientX, e.clientY);
  if (p < 0) return;
  cam.goal.target = [...FRAMES[p].center];
  cam.follow = false;
  cam.goal.dist = 14;
  clampGoal();
});
canvas.addEventListener('keydown', (e) => {
  const k = e.key, g = cam.goal;
  if (k === 'ArrowLeft') g.yaw += 0.12;
  else if (k === 'ArrowRight') g.yaw -= 0.12;
  else if (k === 'ArrowUp') g.pitch += 0.1;
  else if (k === 'ArrowDown') g.pitch -= 0.1;
  else if (k === '+' || k === '=') g.dist *= 0.85;
  else if (k === '-' || k === '_') g.dist /= 0.85;
  else if (k === 'Home') { Object.assign(g, { ...HOME, target: [...HOME.target] }); cam.follow = true; cam.overview = false; }
  else if (k === ',' || k === '.') { setPlaying(false); goTo(Math.max(0, Math.min(state.tr?.steps ?? 0, state.s + (k === '.' ? 1 : -1)))); }
  else if (k === 'PageUp' || k === 'PageDown') { setPlaying(false); goTo(Math.max(0, Math.min(state.tr?.steps ?? 0, state.s + (k === 'PageUp' ? 100 : -100)))); }
  else return;
  e.preventDefault();
  clampGoal();
});
window.addEventListener('keydown', (e) => {
  if (e.key === ' ' && !e.target.closest?.('input, select, textarea, button, a')) { e.preventDefault(); setPlaying(!state.playing); }
});

// ---- l'àtom sota el punter: el seu byte, a l'inspector ----
function atomAt(x, y) {
  if (!inverse || !state.cur) return -1;
  const r = canvas.getBoundingClientRect(), nx = ((x - r.left) / r.width) * 2 - 1, ny = 1 - ((y - r.top) / r.height) * 2;
  const a = project(inverse, [nx, ny, -1]), b = project(inverse, [nx, ny, 1]), dir = v3.normalize(v3.sub(b, a));
  let best = -1, bestT = Infinity;
  for (let p = 0; p < TAPE; p++) {
    const f = FRAMES[p], c = v3.add(f.center, v3.scale(f.y, 0.35)), oc = v3.sub(c, a), tt = v3.dot(oc, dir);
    if (tt <= 0) continue;
    if (v3.length(v3.sub(oc, v3.scale(dir, tt))) < 0.6 && tt < bestT) { best = p; bestT = tt; }
  }
  return best;
}
let hoverXY = [0, 0];
function hoverAt(x, y) { hoverXY = [x, y]; setHover(atomAt(x, y)); }
function setHover(p) {
  state.hover = p;
  const box = $('inspector');
  if (p < 0 || !state.cur) { box.hidden = true; return; }
  const b = state.cur[p], cls = classOfByte(b), { strand } = slot(p);
  box.replaceChildren();
  const top = el('div', 'insp-top'), name = el('span', 'insp-cell');
  name.append(t(strand ? 'micro.second' : 'micro.first'), ' · ', el('span', 'mono', t('micro.pos', { i: strand ? p - HALF : p })));
  top.append(name, el('span', `mono ${CLASS_GLYPH[cls]}`, glyphOf(cls)));
  const meta = el('p', 'insp-note', cls ? CLASS_NAMES[lang][cls].replace(/^.\s/, '') : t('micro.insp.data', { v: b }));
  box.append(top, meta);
  box.hidden = false;
  // a la dreta del punter; si no hi cap (el panell o la vora), a l'esquerra
  const right = !mobile.matches && !side.classList.contains('is-closed') ? side.getBoundingClientRect().left - 8 : window.innerWidth - 8;
  const w = box.offsetWidth || 304, x = hoverXY[0] + 16 + w <= right ? hoverXY[0] + 16 : Math.max(8, hoverXY[0] - 16 - w);
  box.style.left = `${x}px`;
  box.style.top = `${Math.max(8, hoverXY[1] - 70)}px`;
}

// ---- el dibuix ----
// el desplaçament del centre de la vista (en coordenades de la pantalla, de −1 a 1): la meitat de l'amplada que tapa el panell
function lensShift() {
  if (mobile.matches || side.classList.contains('is-closed')) return 0;
  const r = side.getBoundingClientRect(), c = canvas.getBoundingClientRect();
  return Math.max(0, c.right - r.left) / c.width;
}
function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
}
window.addEventListener('resize', resize);
resize();
const colorOf = (cls, tk) => (cls === 0 ? tk.data : tk.lit[cls]);
function familyColor(tk) {
  const f = state.world?.families.get(state.famId);
  return f ? tk.families[f.paleta % tk.families.length] : tk.hoverOutline;
}
function draw(now) {
  const tk = state.tokens, bg = tk.background, sec = now / 1000;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(bg[0], bg[1], bg[2], 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if (!state.cur) return;
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  const eye = eyeOf(cam);
  const proj = perspective(FOV, canvas.width / Math.max(1, canvas.height), 0.5, 600);
  proj[8] += lensShift();  // x_clip += f·z: el centre de la vista passa a x = −f, a l'esquerra del panell
  viewProj = multiply(proj, lookAt(eye, cam.target, [0, 1, 0]));
  inverse = invert(viewProj);
  const tr = state.tr, s = state.s, pc = tr.pc[s], h0 = tr.h0[s], h1 = tr.h1[s];
  // les línies: l'esquelet, i els graons, encesos quan el byte de la segona cel·la ja és la còpia del de davant
  const fam = familyColor(tk), grid = tk.grid;
  SEGMENTS.forEach(([a, b], k) => {
    const rung = PAIR_OF(a, b), lo = Math.min(a, b), done = rung && state.cur[TAPE - 1 - lo] === state.A[lo];
    const c = done ? [fam[0], fam[1], fam[2], 1] : rung && k >= TAPE ? [grid[0], grid[1], grid[2], 0.45] : [grid[0], grid[1], grid[2], 1];
    for (const [q, i] of [[a, 0], [b, 1]]) lineData.set([...BASES[q], ...c], (k * 2 + i) * 7);
  });
  gl.useProgram(line.program);
  gl.uniformMatrix4fv(line.u.uVP, false, viewProj);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.bindVertexArray(lineVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
  gl.bufferData(gl.ARRAY_BUFFER, lineData, gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.LINES, 0, SEGMENTS.length * 2);
  gl.disable(gl.BLEND);
  // els àtoms: el sòlid de cada instrucció, i una bola per a les dades
  gl.useProgram(solid.program);
  const u = solid.u;
  gl.uniformMatrix4fv(u.uVP, false, viewProj);
  gl.uniform3fv(u.uSun, SUN);
  gl.uniform3fv(u.uEye, eye);
  gl.uniform3fv(u.uBg, bg.slice(0, 3));
  gl.uniform1f(u.uAmb, tk.theme === 'dark' ? 0.42 : 0.55);
  gl.uniform1f(u.uFog, 0.006);
  gl.uniform1f(u.uAlpha, 1);
  const solidDraw = (m, matrix, color, emit) => {
    gl.uniformMatrix4fv(u.uM, false, matrix);
    gl.uniform3fv(u.uColor, color.slice(0, 3));
    gl.uniform1f(u.uEmit, emit);
    gl.bindVertexArray(m.vao);
    gl.drawArrays(gl.TRIANGLES, 0, m.count);
  };
  for (let p = 0; p < TAPE; p++) {
    const cls = classOfByte(state.cur[p]), pop = reducedMotion.matches ? 0 : Math.exp(-(sec - state.wroteAt[p]) / 0.18);
    const scale = (cls === 0 ? 0.55 : 0.86) * (1 + 0.4 * pop);
    const emit = (p === pc ? 0.45 : 0) + 0.6 * pop + (p === state.hover ? 0.25 : 0);
    solidDraw(cls === 0 ? SOLIDS[1] : SOLIDS[cls], atomMatrix(FRAMES[p], scale), colorOf(cls, tk), emit);
  }
  // la instrucció que s'executa (un anell), i els dos caps (dues puntes que l'apunten)
  if (pc >= 0) solidDraw(RING, atomMatrix(FRAMES[pc], 1, 0.02), tk.hoverOutline, 0.35);
  const side = h0 === h1 ? 0.32 : 0;
  for (const [h, cls, off] of [[h0, 2, -side], [h1, 4, side]]) {
    const f = FRAMES[h], m = atomMatrix(f, 1, 1.05);
    m[12] += f.z[0] * off; m[13] += f.z[1] * off; m[14] += f.z[2] * off;
    solidDraw(CONE, m, tk.lit[cls], 0.25);
  }
  // les còpies en curs: un byte que viatja del cap d'on es llegeix al cap on s'escriu
  const life = 0.32;
  state.particles = state.particles.filter((q) => sec - q.t0 < life);
  for (const q of state.particles) {
    const k = (sec - q.t0) / life, a = FRAMES[q.from], b = FRAMES[q.to];
    const pa = v3.add(a.center, v3.scale(a.y, 0.4)), pb = v3.add(b.center, v3.scale(b.y, 0.4)), pos = v3.mix(pa, pb, k * k * (3 - 2 * k));
    const m = atomMatrix({ ...a, center: pos }, 0.75);
    solidDraw(SOLIDS[1], m, tk.lit[q.op === 46 ? 8 : 9], 0.7);
  }
}
let before = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - before) / 1000);
  before = now;
  advance(now);
  updateCamera(dt);
  draw(now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
document.addEventListener('visibilitychange', () => { if (document.hidden) setPlaying(false); });
start();
// per provar-lo des de la consola del navegador
window.microscopi = {
  state, cam, goTo, setPlaying,
  // on és a la pantalla (en píxels de la finestra) el centre de l'àtom de la posició p
  screenOf(p) {
    const f = FRAMES[p], c = v3.add(f.center, v3.scale(f.y, 0.35)), q = project(viewProj, c), r = canvas.getBoundingClientRect();
    return [r.left + ((q[0] + 1) / 2) * r.width, r.top + ((1 - q[1]) / 2) * r.height];
  },
};
