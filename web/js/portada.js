// La portada amb l'Observatori (l'encàrrec 2). A la capçalera, el naixement del món 1006 en 7 fotogrames reals
// (js/naixement.js): amb WebGL2, els dibuixa el renderer dels visors damunt d'un fons transparent, perquè es vegin el cel i
// la llum de la pàgina; sense, són els pòsters. La cinta que s'executa (js/cinta.js); el sòlid de cada instrucció, que entra
// al seu pou una vegada i s'hi queda quiet; i les entrades de cada part, una sola vegada. Res no es mou més de 5 s sense
// un botó per aturar-ho: el planeta només gira mentre es reprodueix el naixement. Amb moviment reduït, tot quiet.
import { createRenderer } from './render.js';
import { loadMeta, loadFrame } from './dades.js';
import { R } from './geo.js';
import { v3, perspective, lookAt, multiply } from './mat4.js';
import { compile } from './gl.js';
import { SHAPES } from './formes.js';
import { apply, setLang, num, pct, t, onLang } from './i18n.js';
import { bindThemeSwitch, readStageTokens, reducedMotion } from './tema.js';
import { mountTape } from './cinta.js';
import { mountBirth, EPOCHS } from './naixement.js';

// Les entrades, primer: si alguna cosa de més avall falla, el contingut es continua veient (AUD-160). Només s'amaga el que
// encara és sota la pantalla, i res amb moviment reduït
function entrances() {
  if (reducedMotion.matches) return;
  const below = [...document.querySelectorAll('[data-enter]')].filter((el) => el.getBoundingClientRect().top > innerHeight);
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.remove('is-out'); e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  for (const el of below) { el.classList.add('is-out'); io.observe(el); }
}
entrances();

apply();
for (const b of document.querySelectorAll('[data-lang]')) b.addEventListener('click', () => setLang(b.dataset.lang));
bindThemeSwitch();
let tokens = readStageTokens();
const themed = [];
let themeStamp = 0;
window.addEventListener('themechange', () => { tokens = readStageTokens(); themeStamp++; for (const f of themed) f(tokens); });
const SUN = v3.normalize([0.55, 0.75, -0.35]);

// Dibuixa només quan el llenç es veu (i el navegador ja s'atura quan la pestanya no es veu)
function whenVisible(el) {
  const s = { on: true };
  new IntersectionObserver(([e]) => { s.on = e.isIntersecting; }).observe(el);
  return s;
}

// El cel de la capçalera: un patró fix d'estrelles (sempre el mateix), que només es veu al tema fosc (--o-stars)
function sky() {
  const el = document.querySelector('.ob-hero > .ob-sky');
  if (!el) return;
  let s = 20261103;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 150; i++) {
    const star = document.createElement('i'), size = rnd() < 0.85 ? 1 : 2;
    star.style.cssText = `left:${(rnd() * 100).toFixed(2)}%;top:${(rnd() * 100).toFixed(2)}%;width:${size}px;height:${size}px;opacity:${(0.25 + 0.65 * rnd() ** 2).toFixed(2)}`;
    frag.append(star);
  }
  el.append(frag);
}
sky();

// El món de la capçalera: el primer de la llista amb la llavor de la figura (data-seed), i la seva fitxa (mon.json, uns 40 kB)
async function heroWorld(seed) {
  const list = await (await fetch('dades/mons.json')).json();
  for (const m of list) {
    try {
      const meta = await loadMeta(`dades/${m.id}`);
      if (new RegExp(`--seed ${seed}\\b`).test(meta.ordre)) return { base: `dades/${m.id}`, meta };
    } catch { /* el següent */ }
  }
  return null;
}

// Els subtítols del naixement, de les dades: l'establiment i la seva confirmació (els dos censos), soroll si encara no hi ha
// cap família, i si no, el territori de la família més gran. A la 2.250 no es diu cap territori: és el del cens
function captions(meta) {
  const est = meta.establiment ?? {};
  return (i) => {
    const e = EPOCHS[i], k = meta.fotogrames.findIndex((x) => x.e === e);
    if (e === est.epoca) return t('birth.cap.est', { e: num(e) });
    if (e === est.confirmat) return t('birth.cap.confirm', { e: num(e) });
    let best = null;
    for (const f of meta.families) { const q = f.quota?.[k]; if (q !== null && q !== undefined && (!best || q > best.q)) best = { id: f.id, q }; }
    if (!best) return t('birth.cap.noise');
    return t('birth.cap.family', { id: best.id, p: pct(best.q).replace(' %', ' %') });
  };
}

// 1. La capçalera: el planeta i el naixement
async function hero() {
  const sec = document.querySelector('[data-pm="birth"]'), fig = sec?.querySelector('.ob-planet');
  if (!sec || !fig) return;
  const canvas = document.getElementById('hero');
  const r = createRenderer(canvas, { starCount: 0, transparent: true });
  const world = heroWorld(fig.dataset.seed).catch(() => null);
  // amb WebGL2, els 7 fotogrames sols (uns 570 kB, només quan es reprodueix); sense, els pòsters de data-frames-*
  const frames = new Map();
  const frameOf = async (e) => {
    const w = await world;
    if (!w) throw new Error('sense el món de la capçalera');
    if (!frames.has(e)) frames.set(e, loadFrame(w.base, w.meta, e));
    return frames.get(e);
  };
  let caption = () => '';
  const birth = mountBirth(sec, {
    num, t: (k) => t({ play: 'time.play', pause: 'time.pause', again: 'birth.again' }[k]), reducedMotion,
    caption: (i) => caption(i),
    load: r ? () => Promise.all(EPOCHS.map(frameOf)) : null,
  });
  world.then((w) => { if (w) { caption = captions(w.meta); birth.relang(); } });
  onLang(() => birth.relang());
  if (!r) return;

  // el dibuix: el fotograma de l'època que es veu, amb la paleta del tema
  let shown = null, playing = false;
  const paint = (w) => { const f = { fam: w.fam(0), k: w.k(0), palette: w.palette(0, tokens.families) }; r.setFrames(f, f); };
  r.setTheme(tokens);
  themed.push((tk) => { r.setTheme(tk); if (shown) paint(shown); });
  const showEpoch = async (e) => { const w = await frameOf(e); shown = w; paint(w); };
  sec.addEventListener('naixement:fotograma', (ev) => { showEpoch(ev.detail.epoch).catch(() => {}); });
  sec.addEventListener('naixement:mode', (ev) => { playing = ev.detail.mode === 'play'; });
  // la llum de cada tall: l'atmosfera puja i torna en 750 ms (com l'halo i la vora en CSS). En repòs, més suau que als
  // visors (la meitat): l'atmosfera de l'Observatori és blanca, i el disseny la vol discreta (--atmos-intensity, --atmos-flare)
  let flareAt = -Infinity;
  sec.addEventListener('naixement:llum', () => { flareAt = performance.now(); });
  try { await showEpoch(Number(fig.dataset.epoch)); } catch { return; }

  const vis = whenVisible(canvas);
  const resize = () => {
    const dpr = Math.min(1.5, devicePixelRatio || 1), w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (w !== canvas.width || h !== canvas.height) r.resize(w, h);
  };
  // el gir: la fase només avança mentre es reprodueix, i s'atura suaument (en un segon) quan reposa o s'atura. A la fase 0,
  // el mateix punt de vista que els pòsters
  const center = [0, -R, 0], D = R * 4.3, FILL = 0.92;
  let phase = 0, speed = 0, last = performance.now(), drawn = '';
  const loop = (now) => {
    resize();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const target = playing && !reducedMotion.matches ? 1 : 0;
    speed += (target - speed) * Math.min(1, dt * 2.5);
    if (Math.abs(speed) < 1e-3 && target === 0) speed = 0;
    phase += speed * dt;
    const flare = Math.max(0, 1 - (now - flareAt) / 750), atmos = 0.5 + 0.9 * flare * flare;
    const key = `${phase.toFixed(5)}|${atmos.toFixed(3)}|${canvas.width}|${canvas.height}|${themeStamp}|${shown?.epochs[0]}`;
    if (vis.on && key !== drawn) {
      drawn = key;
      // la càmera gira al voltant de l'eix dels pols (z), una mica per sobre de l'equador, i el nord queda amunt; el
      // planeta omple el llenç quadrat (FILL), amb lloc per a l'atmosfera
      // (un gir lent, uns 2° per segon, que torna enrere passats uns 20 s de reproducció: el món no surt mai de la vista)
      const a = 0.45 * Math.sin(phase * 0.08) - 0.15, tilt = 0.32;
      const eye = v3.add(center, v3.scale([Math.cos(tilt) * Math.sin(a), Math.cos(tilt) * Math.cos(a), -Math.sin(tilt)], D));
      const aspect = canvas.clientWidth / canvas.clientHeight || 1, half = Math.atan(Math.tan(Math.asin(R / D)) / FILL);
      const fov = aspect < 1 ? 2 * Math.atan(Math.tan(half) / aspect) : 2 * half;
      r.draw({
        viewProj: multiply(perspective(fov, aspect, 10, D * 3), lookAt(eye, center, [0, 0, -1])), eye, planet: 1, sun: SUN, fog: 1 / (D * 4),
        height: 3, t: 0, time: phase, codeMix: 0, gridMix: 0, hover: -1, pixel: Math.min(1.5, devicePixelRatio || 1), atmos,
      });
      // l'època que hi ha dibuixada (l'eina de les imatges l'espera abans de capturar-ne el pòster)
      canvas.dataset.epoch = String(shown.epochs[0]);
      if (!canvas.classList.contains('is-drawn')) { canvas.classList.add('is-drawn'); fig.classList.add('is-live'); }
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
// L'entrada de cada sòlid, una vegada, quan els pous es veuen: gira i creix fins a la seva posició de repòs en 480 ms
// (--t-specimen), un 60 ms després de l'altre (--t-specimen-stagger)
const ENTER_MS = 480, STAGGER_MS = 60;
const easeOut = (x) => 1 - (1 - x) ** 3;
function gallery() {
  const canvas = document.getElementById('gallery'), gl = canvas?.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true });
  if (!gl) return;
  const p = compile(gl, GALLERY_VS, GALLERY_FS);
  const wells = [...document.querySelectorAll('.ob-specimen__well[data-cls]')];
  const vaos = wells.map((well) => {
    const cls = Number(well.dataset.cls), vao = gl.createVertexArray(), buf = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, SHAPES[cls].data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
    return { vao, count: SHAPES[cls].count, cls, well };
  });
  const vis = whenVisible(canvas);
  // l'entrada comença quan els pous es veuen (amb moviment reduït, o si ja es veien en obrir la pàgina, ja hi són)
  let enterAt = reducedMotion.matches || canvas.getBoundingClientRect().top < innerHeight * 0.85 ? -Infinity : null;
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && enterAt === null) { enterAt = performance.now(); io.disconnect(); } }, { threshold: 0.25 });
  if (enterAt === null) io.observe(canvas);
  let drawn = '';
  const loop = (now) => {
    const dpr = Math.min(2, devicePixelRatio || 1), w = canvas.clientWidth, h = canvas.clientHeight;
    // la clau porta també on són el primer i l'últim pou respecte del llenç: si les fonts o la mida mouen els pous, es redibuixa
    const o = canvas.getBoundingClientRect(), p0 = vaos[0]?.well.getBoundingClientRect(), p1 = vaos.at(-1)?.well.getBoundingClientRect();
    const since = enterAt === null ? 0 : now - enterAt, done = enterAt !== null && since > ENTER_MS + STAGGER_MS * vaos.length;
    const key = `${done ? 'quiet' : since.toFixed(0)}|${w}|${h}|${dpr}|${themeStamp}|${p0?.left - o.left}|${p0?.top - o.top}|${p1?.left - o.left}|${p1?.top - o.top}|${p0?.width}`;
    // cap fotograma si no ha canviat res (quiet, amb moviment reduït o sense canvis de mida ni de tema)
    if (vis.on && key !== drawn) {
      drawn = key;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.useProgram(p.program);
      gl.uniformMatrix4fv(p.u.uProj, false, mat.ortho(w, h));
      gl.uniform3fv(p.u.uLight, v3.normalize([0.4, 0.75, 0.6]));
      vaos.forEach((v, k) => {
        // abans de l'entrada, res; durant l'entrada, gira i creix; després, quiet a la posició de repòs
        const x0 = enterAt === null ? 0 : Math.min(1, Math.max(0, (since - k * STAGGER_MS) / ENTER_MS)), e = easeOut(x0);
        if (e <= 0) return;
        const rect = v.well.getBoundingClientRect();
        // el centre del pou, en píxels des de la cantonada de sota a l'esquerra del llenç
        const x = rect.left - o.left + rect.width / 2, y = o.bottom - (rect.top + rect.height * 0.58);
        const size = Math.min(84, rect.height * 0.52, rect.width * 0.5) * (0.4 + 0.6 * e);
        gl.uniformMatrix4fv(p.u.uModel, false, mat.model(x, y, size, 0.55, 0.42 + k * 0.6 - 1.6 * (1 - e)));
        gl.uniform3fv(p.u.uColor, tokens.lit[v.cls].slice(0, 3));
        gl.bindVertexArray(v.vao);
        gl.drawArrays(gl.TRIANGLES, 0, v.count);
      });
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

mountTape(document.getElementById('tape'), { num, onLang, reducedMotion });
gallery();
hero();
