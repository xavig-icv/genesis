// L'explorador 3D: un món que evoluciona, amb les famílies de replicadors de colors i, de prop, el codi de cada
// cel·la amb un poliedre per instrucció. Les dades són a web/dades (vegeu eines/web-dades.mjs).
import { createRenderer } from './render.js';
import { createCamera } from './camera.js';
import { createUI } from './ui.js';

const $ = (id) => document.getElementById(id);
const canvas = $('view');
const SUN = (() => { const s = [0.45, 0.85, 0.32], l = Math.hypot(...s); return s.map((x) => x / l); })();
const smooth = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };

const renderer = createRenderer(canvas);
let shown = { code: null, window: null };
const ui = createUI({
  onWorld: () => { shown = { code: null, window: null }; renderer.setCode(null); renderer.setInstances(null); },
  onFrame: (i) => {
    const w = ui.state.world;
    renderer.setFrames({ fam: w.fam(i), k: w.k(i), palette: ui.palette(i) }, { fam: w.fam(i + 1), k: w.k(i + 1), palette: ui.palette(i + 1) });
  },
  onTheme: (tokens) => renderer?.setTheme(tokens),
});
// sense WebGL2, la vista 2D és l'alternativa
if (!renderer) {
  $('loading').hidden = true;
  $('nowebgl').hidden = false;
  throw new Error('WebGL2');
}
renderer.setTheme(ui.state.tokens);
const camera = createCamera(canvas, { onHover: (p, x, y) => ui.hover(p, x, y), onPick: (p, x, y) => ui.pick(p, x, y) });

function resize() {
  // en píxels reals, com a molt el doble, perquè els mòbils no s'encallin
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  renderer.resize(Math.round(canvas.clientWidth * dpr), Math.round(canvas.clientHeight * dpr));
}
window.addEventListener('resize', resize);
resize();

// de prop: els poliedres d'una finestra al voltant del punt que es mira
function updateCode(d) {
  const code = ui.state.code;
  if (!code.bytes) return;
  if (shown.code !== code.epoch) { renderer.setCode(code.bytes); shown.code = code.epoch; shown.window = null; }
  const r = Math.round(Math.min(56, Math.max(6, d * 1.3))), cu = camera.cur.u, cv = camera.cur.v, win = shown.window;
  if (win && Math.abs(win.r - r) < r * 0.3 && Math.hypot(win.u - cu, win.v - cv) < r * 0.25) return;
  renderer.setInstances(code.bytes, Math.floor(cu - r), Math.floor(cv - r), Math.ceil(cu + r), Math.ceil(cv + r));
  shown.window = { u: cu, v: cv, r };
}

const setView = (planet) => {
  camera.setPlanet(planet);
  $('flat').setAttribute('aria-pressed', String(!planet));
  $('planet').setAttribute('aria-pressed', String(planet));
};
$('flat').addEventListener('click', () => setView(false));
$('planet').addEventListener('click', () => setView(true));

let before = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - before) / 1000);
  before = now;
  const f = ui.tick(dt), w = ui.state.world;
  if (f) {
    const { viewProj, eye } = camera.update(dt, canvas.clientWidth / canvas.clientHeight);
    const d = camera.cur.d, codeMix = smooth(70, 30, d);
    if (codeMix > 0) { ui.needCode(); updateCode(d); }
    $('hint').classList.toggle('off', d < 90 || !w.codeEpochs.length || ui.state.time < w.codeEpochs[0]);
    renderer.draw({
      viewProj, eye, planet: camera.cur.planet, sun: SUN, fog: 1 / (d * 3 + 500), height: 3,
      t: f.t, time: now / 1000, codeMix: shown.code !== null ? codeMix : 0, gridMix: smooth(260, 110, d), hover: ui.state.hover?.c ?? -1,
      pixel: Math.min(2, window.devicePixelRatio || 1),
    });
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
ui.start();
// per provar-lo des de la consola del navegador
window.explorador = { state: ui.state, camera, renderer };
