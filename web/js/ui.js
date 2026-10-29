// La part comuna de les dues vistes del món (la 3D i la 2D): l'estat, la tria del món, el panell (el món, les
// famílies i la llegenda), l'inspector de la cel·la sota el punter i la línia de temps. Cada vista hi posa el seu
// dibuix: setFrame(i) quan canvia el fotograma, i el bucle de dibuix.
import { loadWorld } from './dades.js';
import { W, H } from './geo.js';
import { CLASS_COLORS, CLASS_NAMES, OPCODES } from './formes.js';
import { t, num, pct, lang, setLang, onLang, apply } from './i18n.js';

const $ = (id) => document.getElementById(id);
export const EPOCHS_PER_SECOND = 100;

export function createUI({ base = '../dades', onWorld, onFrame }) {
  const state = {
    world: null, time: 0, playing: false, speed: 1, frame: -1, focus: null, hover: null, pinned: null,
    code: { epoch: null, bytes: null, loading: null },
  };
  apply();
  for (const b of document.querySelectorAll('[data-lang]')) b.addEventListener('click', () => setLang(b.dataset.lang));

  // el fotograma A (el darrer que no passa de l'època actual), el B (el següent) i on som entre tots dos
  function frameIndex() {
    const e = state.world.epochs, time = state.time;
    let lo = 0, hi = e.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (e[mid] <= time) lo = mid; else hi = mid - 1; }
    const i = Math.min(lo, e.length - 2), f = (time - e[i]) / (e[i + 1] - e[i]);
    return { i, t: Math.min(1, Math.max(0, f)) };
  }
  // la paleta d'un fotograma, amb les altres famílies apagades si se'n ressalta una
  function palette(i) {
    const p = state.world.palette(i);
    if (state.focus !== null) {
      state.world.meta.fotogrames[i].f.forEach((id, j) => {
        if (id === state.focus) return;
        for (let k = 0; k < 3; k++) p[(j + 1) * 4 + k] = Math.round(p[(j + 1) * 4 + k] * 0.18 + 12);
      });
    }
    return p;
  }
  const cellOf = (p) => {
    if (!p) return null;
    const x = Math.floor(p[0]), y = Math.floor(p[1]);
    return x >= 0 && y >= 0 && x < W && y < H ? { x, y, c: y * W + x } : null;
  };
  // el punter: a sobre d'una cel·la (p = [u, v] en cel·les, o null); amb un clic, la cel·la queda fixada
  const hover = (p) => { if (!state.pinned) { state.hover = cellOf(p); drawInspector(); } };
  const pick = (p) => { state.pinned = state.pinned || !p ? null : cellOf(p); state.hover = state.pinned ?? cellOf(p); drawInspector(); };

  // els mons
  async function start() {
    let list;
    try { list = await (await fetch(`${base}/mons.json`)).json(); } catch (e) { $('status').textContent = t('error.load', { m: e.message }); return; }
    const sel = $('world');
    const fill = () => { sel.replaceChildren(...list.map((w) => new Option(w.titol[lang], w.id))); if (state.world) sel.value = state.world.meta.id; };
    fill();
    onLang(fill);
    sel.addEventListener('change', () => open(sel.value));
    const wanted = new URLSearchParams(location.search).get('mon');
    await open(list.some((w) => w.id === wanted) ? wanted : list[0].id);
  }
  async function open(id) {
    $('status').hidden = false;
    $('status').textContent = t('loading');
    try { state.world = await loadWorld(`${base}/${id}`); } catch (e) { $('status').textContent = t('error.load', { m: e.message }); return; }
    $('status').hidden = true;
    $('world').value = id;
    Object.assign(state, { frame: -1, pinned: null, hover: null, focus: null, code: { epoch: null, bytes: null, loading: null } });
    const w = state.world;
    $('time').max = String(w.epochs[w.epochs.length - 1]);
    state.time = w.meta.establiment ? Math.max(w.epochs[0], w.meta.establiment.epoca - 600) : w.epochs[0];
    onWorld?.(w);
    describe(); marks(); legend(); families(); drawInspector();
  }
  // el codi de l'època amb codi més propera que no passi de l'actual
  async function needCode() {
    const w = state.world, epoch = w.codeEpochAt(state.time);
    if (epoch === null || state.code.epoch === epoch || state.code.loading === epoch) return state.code.bytes;
    state.code.loading = epoch;
    try {
      const bytes = await w.code(epoch);
      if (state.world === w && state.code.loading === epoch) { state.code = { epoch, bytes, loading: null }; drawInspector(); }
    } catch (e) { console.error(e); state.code.loading = null; }
    return state.code.bytes;
  }

  // el panell
  function describe() {
    const m = state.world.meta;
    $('w-title').textContent = m.titol[lang];
    $('w-text').textContent = m.text[lang];
    $('w-why').textContent = m.tria[lang];
    $('w-check').hidden = !state.world.checked;
    $('w-check').textContent = `✓ ${t('loaded.checked')}`;
  }
  function marks() {
    const m = state.world.meta, last = state.world.epochs.at(-1), first = state.world.epochs[0], box = $('marks');
    box.replaceChildren();
    if (!m.establiment) return;
    const d = document.createElement('div');
    d.className = 'mark';
    d.style.left = `${((m.establiment.epoca - first) / (last - first)) * 100}%`;
    d.textContent = t('time.established');
    box.append(d);
  }
  function legend() {
    const box = $('legend');
    box.replaceChildren();
    for (const cls of [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 1]) {
      const d = document.createElement('div'), c = document.createElement('code');
      c.textContent = cls === 1 ? '0' : OPCODES[cls - 2];
      c.style.color = CLASS_COLORS[cls];
      d.append(c, CLASS_NAMES[lang][cls].replace(/^.\s/, ''));
      box.append(d);
    }
    const d = document.createElement('div'), c = document.createElement('code');
    c.textContent = '·';
    c.style.color = '#3d4658';
    d.append(c, t('legend.data'));
    box.append(d);
  }
  function families() {
    const ul = $('families'), w = state.world;
    ul.replaceChildren();
    if (!w.meta.families.length) { const li = document.createElement('li'); li.textContent = t('families.none'); ul.append(li); return; }
    for (const f of w.meta.families) {
      const li = document.createElement('li');
      li.className = 'fam';
      li.dataset.id = f.id;
      li.title = t('families.focus');
      li.innerHTML = '<span class="swatch"></span><span class="name"></span><span class="share"></span><span class="meta"></span><canvas width="560" height="52"></canvas>';
      li.querySelector('.swatch').style.background = f.color;
      li.querySelector('.name').textContent = t('inspector.family', { id: f.id });
      li.addEventListener('click', () => { state.focus = state.focus === f.id ? null : f.id; state.frame = -1; updateFamilies(true); });
      ul.append(li);
    }
    updateFamilies(true);
  }
  function updateFamilies(redraw = false) {
    const w = state.world, { i } = frameIndex();
    for (const li of $('families').querySelectorAll('.fam')) {
      const f = w.families.get(Number(li.dataset.id)), q = f.quota[i];
      li.classList.toggle('gone', q === null);
      li.setAttribute('aria-pressed', String(state.focus === f.id));
      li.querySelector('.share').textContent = q === null ? '—' : pct(q);
      li.querySelector('.meta').textContent = t('families.born', { e: num(f.neix) }) + (f.mor !== null ? ` · ${t('families.died', { e: num(f.mor) })}` : '') + (f.nucli ? ` · ${f.nucli}` : '');
      if (redraw || li._i !== i) { spark(li.querySelector('canvas'), f, i); li._i = i; }
    }
  }
  function spark(cv, f, i) {
    const g = cv.getContext('2d'), w = cv.width, h = cv.height, n = f.quota.length;
    const max = Math.max(0.001, ...f.quota.filter((q) => q !== null));
    g.clearRect(0, 0, w, h);
    g.beginPath();
    let on = false;
    f.quota.forEach((q, j) => {
      if (q === null) { on = false; return; }
      const x = (j / (n - 1)) * w, y = h - 3 - (q / max) * (h - 8);
      if (!on) { g.moveTo(x, y); on = true; } else g.lineTo(x, y);
    });
    g.strokeStyle = f.color;
    g.lineWidth = 3;
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.5)';
    g.fillRect((i / (n - 1)) * w - 1, 0, 2, h);
  }

  // l'inspector
  const KIND = { 2: 'head', 3: 'head', 4: 'head1', 5: 'head1', 6: 'arith', 7: 'arith', 8: 'copy', 9: 'copy', 10: 'loop', 11: 'loop' };
  function drawInspector() {
    const box = $('inspector'), cell = state.hover, w = state.world;
    if (!cell || !w) { box.hidden = true; return; }
    const { i } = frameIndex(), f = w.familyAt(i, cell.c), k = w.k(i)[cell.c];
    box.hidden = false;
    box.replaceChildren();
    const row = (a, b, color) => {
      const d = document.createElement('div');
      d.className = 'row';
      d.innerHTML = '<span></span><b></b>';
      d.firstChild.textContent = a;
      d.lastChild.textContent = b;
      if (color) { const s = document.createElement('span'); s.className = 'swatch'; s.style.cssText = `display:inline-block;margin-left:8px;vertical-align:-2px;background:${color}`; d.lastChild.append(s); }
      return d;
    };
    box.append(row(t('inspector.cell', { x: cell.x, y: cell.y }), f ? t('inspector.family', { id: f.id }) : t('inspector.nofamily'), f?.color));
    box.append(row(t('inspector.instructions', { k }), ''));
    const bytes = state.code.bytes;
    if (bytes) {
      box.append(row(t('inspector.code', { e: num(state.code.epoch) }), ''));
      const prog = document.createElement('div');
      prog.className = 'prog';
      for (let b = 0; b < 64; b++) {
        const cls = bytes[cell.c * 64 + b], s = document.createElement('span');
        s.textContent = cls === 0 ? '·' : cls === 1 ? '0' : OPCODES[cls - 2];
        s.className = cls === 0 ? 'd' : cls === 1 ? 'z' : KIND[cls];
        prog.append(s);
      }
      box.append(prog);
    } else if (w.codeEpochs.length) {
      const p = document.createElement('p');
      p.style.cssText = 'margin:6px 0 0;color:var(--text-3)';
      p.textContent = t('inspector.nocode', { e: num(w.codeEpochs[0]) });
      box.append(p);
    }
  }

  // la línia de temps
  const playIcon = (on) => { $('play-icon').innerHTML = on ? '<path d="M4 2.5h3.5v13H4zM10.5 2.5H14v13h-3.5z" fill="currentColor"/>' : '<path d="M4 2.5v13l11-6.5z" fill="currentColor"/>'; };
  function setPlaying(on) {
    state.playing = on;
    playIcon(on);
    $('play').dataset.i18nTitle = on ? 'time.pause' : 'time.play';
    apply($('play').parentElement);
  }
  $('play').addEventListener('click', () => {
    const w = state.world;
    if (!w) return;
    if (!state.playing && state.time >= w.epochs.at(-1)) state.time = w.epochs[0];
    setPlaying(!state.playing);
  });
  $('time').addEventListener('input', (e) => { state.time = Number(e.target.value); setPlaying(false); });
  for (const b of $('speeds').querySelectorAll('button')) {
    b.addEventListener('click', () => {
      state.speed = Number(b.dataset.speed);
      for (const o of $('speeds').querySelectorAll('button')) o.setAttribute('aria-pressed', String(o === b));
    });
  }
  $('help-btn')?.addEventListener('click', () => $('help').showModal());
  // el panell es pot amagar; al mòbil, comença amagat perquè es vegi el món
  const side = $('side'), panelBtn = $('panel-btn');
  const showPanel = (on) => { side.classList.toggle('collapsed', !on); panelBtn?.setAttribute('aria-expanded', String(on)); };
  showPanel(!matchMedia('(max-width: 820px)').matches);
  panelBtn?.addEventListener('click', () => showPanel(side.classList.contains('collapsed')));
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && !e.target.closest?.('input, select, textarea, button')) { e.preventDefault(); $('play').click(); }
  });
  onLang(() => { if (!state.world) return; describe(); marks(); legend(); families(); drawInspector(); });

  // un pas del temps: avança si es reprodueix, i avisa la vista si canvia el fotograma
  function tick(dt) {
    const w = state.world;
    if (!w) return null;
    if (state.playing) {
      state.time = Math.min(w.epochs.at(-1), state.time + dt * EPOCHS_PER_SECOND * state.speed);
      if (state.time >= w.epochs.at(-1)) setPlaying(false);
    }
    const f = frameIndex();
    if (f.i !== state.frame) { state.frame = f.i; onFrame?.(f.i); updateFamilies(); if (state.hover) drawInspector(); }
    $('time').value = String(Math.round(state.time));
    $('epoch').textContent = num(Math.round(state.time));
    return f;
  }

  return { state, start, tick, frameIndex, palette, hover, pick, needCode, drawInspector };
}
