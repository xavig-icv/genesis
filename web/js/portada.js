// La portada: al visor de la capçalera, un món com un planeta que gira lentament; i, a la química, la cinta que s'executa
// (js/cinta.js) i el sòlid de cada instrucció, que gira al pou del seu espècimen. Sense controls al planeta, perquè la
// pàgina es pugui desplaçar. Amb moviment reduït, tot quiet.
import { createRenderer } from './render.js';
import { loadWorld } from './dades.js';
import { R } from './geo.js';
import { v3, perspective, lookAt, multiply } from './mat4.js';
import { compile } from './gl.js';
import { SHAPES } from './formes.js';
import { apply, setLang, num, onLang } from './i18n.js';
import { bindThemeSwitch, readStageTokens, reducedMotion, parseColor } from './tema.js';
import { mountTape } from './cinta.js';

apply();
for (const b of document.querySelectorAll('[data-lang]')) b.addEventListener('click', () => setLang(b.dataset.lang));
bindThemeSwitch();
let tokens = readStageTokens();
const themed = [];
window.addEventListener('themechange', () => { tokens = readStageTokens(); for (const f of themed) f(tokens); });
const SUN = v3.normalize([0.55, 0.75, -0.35]);

// Dibuixa només quan el llenç es veu (i el navegador ja s'atura quan la pestanya no es veu)
function whenVisible(el) {
  const s = { on: true };
  new IntersectionObserver(([e]) => { s.on = e.isIntersecting; }).observe(el);
  return s;
}

// 1. El planeta: el fotograma de l'època del peu de la figura, del primer món de la llista amb la seva llavor. El fons és
// el de la figura (--hero-bg: al tema clar, el paper de la pàgina), i al tema fosc hi ha més estrelles que als visors
async function hero() {
  const canvas = document.getElementById('hero'), r = createRenderer(canvas, { starCount: 16000 });
  if (!r) return;
  const fig = canvas.closest('[data-seed]'), seed = fig.dataset.seed;
  const withBackground = (tk) => ({ ...tk, background: parseColor(getComputedStyle(fig).getPropertyValue('--hero-bg')) });
  r.setTheme(withBackground(tokens));
  themed.push((tk) => r.setTheme(withBackground(tk)));
  const list = await (await fetch('dades/mons.json')).json();
  let w = null;
  for (const m of list) {
    try { const c = await loadWorld(`dades/${m.id}`); if (new RegExp(`--seed ${seed}\\b`).test(c.meta.ordre)) { w = c; break; } } catch { /* el següent */ }
  }
  if (!w) return;
  // l'època del peu de la figura (data-epoch); si el món no la té, no es dibuixa res
  const i = w.epochs.indexOf(Number(fig.dataset.epoch));
  if (i < 0) return;
  const frame = () => ({ fam: w.fam(i), k: w.k(i), palette: w.palette(i, tokens.families) });
  r.setFrames(frame(), frame());
  themed.push(() => r.setFrames(frame(), frame()));
  const vis = whenVisible(canvas);
  const resize = () => { const dpr = Math.min(1.5, devicePixelRatio || 1); r.resize(Math.round(canvas.clientWidth * dpr), Math.round(canvas.clientHeight * dpr)); };
  addEventListener('resize', resize);
  resize();
  const center = [0, -R, 0], t0 = performance.now();
  const loop = (now) => {
    if (vis.on) {
      const t = reducedMotion.matches ? 0 : (now - t0) / 1000;
      // la càmera gira al voltant de l'eix dels pols (z), una mica per sobre de l'equador, i el nord queda amunt
      const a = 0.5 * Math.sin(t * 0.05) - 0.15, tilt = 0.32, D = R * 4.3;
      const eye = v3.add(center, v3.scale([Math.cos(tilt) * Math.sin(a), Math.cos(tilt) * Math.cos(a), -Math.sin(tilt)], D));
      // el planeta sencer al visor: si el visor és més alt que ample, el camp de visió es fixa en horitzontal
      const aspect = canvas.clientWidth / canvas.clientHeight, fov = aspect < 1 ? 2 * Math.atan(Math.tan(0.31) / aspect) : 0.62;
      const proj = perspective(fov, aspect, 10, D * 3);
      r.draw({
        viewProj: multiply(proj, lookAt(eye, center, [0, 0, -1])), eye, planet: 1, sun: SUN, fog: 1 / (D * 4),
        height: 3, t: 0, time: t, codeMix: 0, gridMix: 0, hover: -1, pixel: Math.min(1.5, devicePixelRatio || 1),
      });
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

// 2. La química: les deu instruccions i el zero, cadascuna amb el seu sòlid al pou del seu espècimen
const GALLERY_VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
uniform mat4 uProj;
uniform mat4 uModel;
out vec3 vNormal;
void main() {
  vNormal = mat3(uModel) * aNormal;
  gl_Position = uProj * uModel * vec4(aPos, 1.0);
}
`;
const GALLERY_FS = `#version 300 es
precision highp float;
uniform vec3 uColor;
uniform vec3 uLight;
in vec3 vNormal;
out vec4 outColor;
void main() {
  vec3 n = normalize(vNormal);
  float diff = max(dot(n, uLight), 0.0), spec = pow(max(dot(reflect(-uLight, n), vec3(0.0, 0.0, 1.0)), 0.0), 20.0);
  outColor = vec4(uColor * (0.3 + 0.8 * diff) + vec3(0.3) * spec, 1.0);
}
`;
// Matrius petites per a la galeria (per columnes)
const mat = {
  ortho: (w, h) => new Float32Array([2 / w, 0, 0, 0, 0, 2 / h, 0, 0, 0, 0, -1 / 400, 0, -1, -1, 0, 1]),
  model(x, y, s, ax, ay) {
    const ca = Math.cos(ax), sa = Math.sin(ax), cb = Math.cos(ay), sb = Math.sin(ay);
    // gir en y, després en x, escala s i trasllació a (x, y); el centre de la forma, a l'alçada 0,35
    const m = [cb, sa * sb, -ca * sb, 0, 0, ca, sa, 0, sb, -sa * cb, ca * cb, 0];
    const out = new Float32Array(16);
    for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) out[c * 4 + r] = m[c * 4 + r] * s;
    out[12] = x - out[4] * 0.35; out[13] = y - out[5] * 0.35; out[14] = -out[6] * 0.35; out[15] = 1;
    return out;
  },
};
function gallery() {
  const canvas = document.getElementById('gallery'), gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true });
  if (!gl) return;
  const p = compile(gl, GALLERY_VS, GALLERY_FS);
  const wells = [...document.querySelectorAll('.specimen-well[data-cls]')];
  const vaos = wells.map((well) => {
    const cls = Number(well.dataset.cls), vao = gl.createVertexArray(), buf = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, SHAPES[cls].data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
    return { vao, count: SHAPES[cls].count, cls, well };
  });
  const vis = whenVisible(canvas), t0 = performance.now();
  const loop = (now) => {
    if (vis.on) {
      const dpr = Math.min(2, devicePixelRatio || 1), w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.useProgram(p.program);
      gl.uniformMatrix4fv(p.u.uProj, false, mat.ortho(w, h));
      gl.uniform3fv(p.u.uLight, v3.normalize([0.4, 0.75, 0.6]));
      const t = reducedMotion.matches ? 0.6 : (now - t0) / 1000, origin = canvas.getBoundingClientRect();
      vaos.forEach((v, k) => {
        const rect = v.well.getBoundingClientRect();
        // el centre del pou, en píxels des de la cantonada de sota a l'esquerra del llenç
        const x = rect.left - origin.left + rect.width / 2, y = origin.bottom - (rect.top + rect.height * 0.58);
        gl.uniformMatrix4fv(p.u.uModel, false, mat.model(x, y, Math.min(84, rect.height * 0.52, rect.width * 0.5), 0.55, t * 0.7 + k * 0.6));
        gl.uniform3fv(p.u.uColor, tokens.lit[v.cls].slice(0, 3));
        gl.bindVertexArray(v.vao);
        gl.drawArrays(gl.TRIANGLES, 0, v.count);
      });
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

// 3. L'aparició suau de les seccions, una sola vegada
function reveal() {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  for (const el of document.querySelectorAll('[data-reveal]')) io.observe(el);
}

reveal();
mountTape(document.getElementById('tape'), { num, onLang, reducedMotion });
gallery();
hero();
