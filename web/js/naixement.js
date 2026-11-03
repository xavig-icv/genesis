// El naixement del món 1006, a la capçalera de la portada: els 7 fotogrames reals, d'un en un, amb talls nets (entre dos
// fotogrames no es mostra res). A cada tall, la llum de l'atmosfera puja i torna en 750 ms (--t-flare): l'halo i la vora en
// CSS (.is-flare) i, amb WebGL, l'atmosfera del planeta («naixement:llum»).
// Es reprodueix una sola vegada, quan el planeta es veu al 60 %, i reposa a l'època 6.000 amb «Torna-ho a veure». Amb
// moviment reduït no es reprodueix sol: es queda el pòster (3.500), i el botó passa d'un fotograma al següent amb talls.
// La pestanya amagada l'atura. Els fotogrames només es baixen quan cal, i mai amb moviment reduït.
// Adaptat del mòdul de l'encàrrec 2 (Claude Design): els subtítols surten de les dades (caption), i amb WebGL els
// fotogrames són els del renderer (load), no imatges.
//
// Marcat: <section data-pm="birth" data-frames-dark="a.webp,…" data-frames-light="…">, amb [data-b="img"] (el pòster: una imatge
//   de fons, la del tema que es veu, també sense JavaScript; sense WebGL2, aquí s'hi posa cada fotograma),
//   [data-b="digits"], [data-b="cap"], .ob-scale__x × 7, .ob-scale__head, [data-b="toggle"] (amb [data-b="i-play|i-pause|
//   i-replay"]) i [data-b="again"]
export const EPOCHS = [1650, 2250, 2500, 3000, 3500, 4500, 6000];
export const HOLDS = [1600, 2000, 1000, 1000, 2200, 1000, 2600];
export const POSTER = 4;
const SPAN = 6000;

function currentTheme() {
  const t = document.documentElement.dataset.theme;
  if (t === 'light' || t === 'dark') return t;
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

// caption(i): el subtítol del fotograma i, a la llengua d'ara. load(): si n'hi ha, els fotogrames els porta el renderer
// (una promesa), i el pòster no canvia; si no, són les imatges de data-frames-*
export function mountBirth(sec, { num, t, caption = () => '', load = null, reducedMotion = matchMedia('(prefers-reduced-motion: reduce)') } = {}) {
  if (!sec) return null;
  const $ = (s) => sec.querySelector(s);
  const poster = $('[data-b="img"]');
  const digits = $('[data-b="digits"]'), cap = $('[data-b="cap"]');
  const marks = [...sec.querySelectorAll('.ob-scale__x')], head = $('.ob-scale__head');
  const btn = $('[data-b="toggle"]'), again = $('[data-b="again"]');
  const ic = { play: $('[data-b="i-play"]'), pause: $('[data-b="i-pause"]'), replay: $('[data-b="i-replay"]') };
  let theme = currentTheme();
  const urls = () => (theme === 'light' ? sec.dataset.framesLight : sec.dataset.framesDark).split(',');
  // només la imatge del tema que es veu: la de l'altre tema no es baixa fins que no es canvia de tema
  const setImage = () => { if (!load && poster) poster.style.backgroundImage = `url("${urls()[idx]}")`; };
  // poster · load · play · pause · rest
  let idx = POSTER, mode = 'poster', timer = 0, t0 = 0, left = 0, ready = null, readyFor = '', wasPlaying = false;
  const emit = (name, detail) => sec.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));

  function preload() {
    if (load) return (ready ??= load());
    if (ready && readyFor === theme) return ready;
    readyFor = theme;
    ready = Promise.all(urls().map((u) => { const im = new Image(); im.src = u; return im.decode().catch(() => {}); }));
    return ready;
  }
  function paint() {
    digits.textContent = num(EPOCHS[idx]);
    cap.textContent = caption(idx);
    marks.forEach((m, k) => { m.classList.toggle('is-current', k === idx); m.classList.toggle('is-past', k < idx); });
    if (head) head.style.left = `${(EPOCHS[idx] / SPAN) * 100}%`;
  }
  function show(i, flare) {
    idx = i;
    setImage();
    paint();
    emit('naixement:fotograma', { index: i, epoch: EPOCHS[i] });
    if (flare && !reducedMotion.matches) {
      // la llum: de cop a 1 i de tornada al repòs en 750 ms (--t-flare)
      sec.classList.add('is-flare');
      void sec.offsetWidth;
      requestAnimationFrame(() => sec.classList.remove('is-flare'));
      emit('naixement:llum', { ms: 750 });
    }
  }
  function ui() {
    const run = mode === 'play' || mode === 'load';
    ic.play.hidden = run || mode === 'rest';
    ic.pause.hidden = !run;
    ic.replay.hidden = mode !== 'rest';
    btn.setAttribute('aria-label', t(run ? 'pause' : mode === 'rest' ? 'again' : 'play'));
    btn.setAttribute('aria-pressed', String(run));
    if (again) again.hidden = mode !== 'rest';
    sec.dataset.mode = mode;
    emit('naixement:mode', { mode });
  }
  function hold(ms) { clearTimeout(timer); t0 = performance.now(); left = ms; timer = setTimeout(next, ms); }
  function next() { if (idx < EPOCHS.length - 1) { show(idx + 1, true); hold(HOLDS[idx]); } else { mode = 'rest'; ui(); } }
  // amb moviment reduït, el botó passa al fotograma següent, amb un tall, i torna a començar després del darrer
  function step() { show(idx < EPOCHS.length - 1 ? idx + 1 : 0, false); }
  function start() {
    clearTimeout(timer);
    mode = 'load'; ui();
    preload().then(() => { if (mode !== 'load') return; mode = 'play'; ui(); show(0, false); hold(HOLDS[0]); }, () => { mode = 'poster'; ui(); });
  }
  function pause() {
    if (mode === 'load') { mode = 'poster'; ui(); return; }
    if (mode !== 'play') return;
    clearTimeout(timer);
    left = Math.max(0, left - (performance.now() - t0));
    mode = 'pause'; ui();
  }
  function resume() { if (mode === 'pause') { mode = 'play'; ui(); hold(left); } }

  const onClick = () => {
    if (reducedMotion.matches) { preload().then(step, () => {}); return; }
    if (mode === 'play' || mode === 'load') pause(); else if (mode === 'pause') resume(); else start();
  };
  const onVisibility = () => { if (document.hidden) { wasPlaying = mode === 'play'; pause(); } else if (wasPlaying) { wasPlaying = false; resume(); } };
  const onTheme = () => { const n = currentTheme(); if (n === theme) return; theme = n; readyFor = ''; setImage(); };
  const onMotion = () => { if (reducedMotion.matches) { clearTimeout(timer); mode = 'poster'; show(POSTER, false); ui(); } };
  btn.addEventListener('click', onClick);
  again?.addEventListener('click', start);
  document.addEventListener('visibilitychange', onVisibility);
  reducedMotion.addEventListener?.('change', onMotion);
  new MutationObserver(onTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', onTheme);
  paint();
  ui();
  // una sola vegada, quan el planeta es veu al 60 % (al mòbil, la capçalera sencera no hi cap)
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); if (!reducedMotion.matches) start(); } }, { threshold: 0.6 });
  io.observe(sec.querySelector('.ob-planet') ?? sec);
  // relang(): torna a escriure el subtítol (la llengua ha canviat)
  return { relang: paint, get index() { return idx; }, get mode() { return mode; } };
}
