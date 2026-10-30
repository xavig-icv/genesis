// La part comuna de les dues vistes del món (la 3D i la 2D): l'estat, la tria del món, el panell (el món, les famílies
// i les instruccions), l'inspector de la cel·la sota el punter, la línia de temps, els missatges d'estat, el tema i, al
// mòbil, el full inferior. Cada vista hi posa el seu dibuix: onFrame(i) quan canvia el fotograma, onTheme(fitxes) quan
// canvia el tema, i el bucle de dibuix.
import { loadWorld } from './dades.js';
import { W, H } from './geo.js';
import { CLASS_NAMES, CLASS_GLYPH, glyphOf, classOfChar } from './formes.js';
import { t, num, pct, lang, setLang, onLang, apply } from './i18n.js';
import { bindThemeSwitch, readStageTokens } from './tema.js';

const $ = (id) => document.getElementById(id);
export const EPOCHS_PER_SECOND = 100;
const CENSUS = 250; // un cens cada 250 èpoques: les marques de la línia de temps, i una etiqueta cada 1.000
const SVG = 'http://www.w3.org/2000/svg';
const mobile = matchMedia('(max-width: 820px)');
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const svgEl = (tag, attrs) => { const e = document.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
// un text amb els nombres en mono (2.250, 13, 64...)
function withNumbers(text) {
  const f = document.createDocumentFragment();
  text.split(/(\d[\d.,]*\d|\d)/).forEach((part, i) => { if (part) f.append(i % 2 ? el('span', 'mono', part) : part); });
  return f;
}
const famVar = (f) => `var(--f${(f.paleta % 12) + 1})`;
// el nucli d'una família, amb el color de cada instrucció
function motif(text) {
  const s = el('span', 'mono motif');
  for (const ch of text) { const cls = classOfChar(ch); s.append(cls ? el('b', CLASS_GLYPH[cls], glyphOf(cls)) : ch); }
  return s;
}

export function createUI({ base = '../dades', onWorld, onFrame, onTheme }) {
  const state = {
    world: null, time: 0, playing: false, speed: 1, frame: -1, focus: null, hover: null, pinned: null,
    code: { epoch: null, bytes: null, loading: null }, tokens: readStageTokens(), list: [],
  };
  apply();
  for (const b of document.querySelectorAll('[data-lang]')) b.addEventListener('click', () => setLang(b.dataset.lang));
  bindThemeSwitch();
  window.addEventListener('themechange', () => { state.tokens = readStageTokens(); state.frame = -1; onTheme?.(state.tokens); });

  // el fotograma A (el darrer que no passa de l'època actual), el B (el següent) i on som entre tots dos
  function frameIndex() {
    const e = state.world.epochs, time = state.time;
    let lo = 0, hi = e.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (e[mid] <= time) lo = mid; else hi = mid - 1; }
    const i = Math.min(lo, e.length - 2), f = (time - e[i]) / (e[i + 1] - e[i]);
    return { i, t: Math.min(1, Math.max(0, f)) };
  }
  // la paleta d'un fotograma, amb les altres famílies fosses cap a l'escenari si se'n ressalta una
  function palette(i) {
    const tk = state.tokens, p = state.world.palette(i, tk.families);
    if (state.focus !== null) {
      const bg = tk.background.map((c) => c * 255), d = tk.dimOthers;
      state.world.meta.fotogrames[i].f.forEach((id, j) => {
        if (id === state.focus) return;
        for (let k = 0; k < 3; k++) p[(j + 1) * 4 + k] = Math.round(bg[k] + (p[(j + 1) * 4 + k] - bg[k]) * d);
      });
    }
    return p;
  }
  const cellOf = (p) => {
    if (!p) return null;
    const x = Math.floor(p[0]), y = Math.floor(p[1]);
    return x >= 0 && y >= 0 && x < W && y < H ? { x, y, c: y * W + x } : null;
  };

  // el punter: a sobre d'una cel·la (p = [u, v] en cel·les, o null). Un clic fixa la cel·la (un altre clic a la mateixa,
  // o fora del món, la deixa anar)
  function hover(p) {
    if (state.pinned) return;
    state.hover = cellOf(p);
    drawInspector();
  }
  function pick(p) {
    const c = cellOf(p);
    state.pinned = !c || (state.pinned && state.pinned.c === c.c) ? null : c;
    state.hover = state.pinned ?? c;
    drawInspector();
  }
  function unpin() { state.pinned = null; state.hover = null; drawInspector(); }

  // els missatges d'estat: carregant, un error, o res
  function show(which, text) {
    for (const id of ['loading', 'error']) $(id).hidden = id !== which;
    if (which === 'error') $('error-text').textContent = text;
  }

  // els mons
  async function start() {
    const sel = $('world');
    try { state.list = await (await fetch(`${base}/mons.json`)).json(); } catch (e) { show('error', t('error.load', { m: e.message })); return; }
    const fill = () => {
      sel.replaceChildren(...state.list.map((w) => new Option(w.titol[lang], w.id)));
      if (state.world) sel.value = state.world.meta.id;
      sel.title = sel.selectedOptions[0]?.text ?? '';
    };
    fill();
    onLang(fill);
    sel.addEventListener('change', () => { sel.title = sel.selectedOptions[0]?.text ?? ''; open(sel.value); });
    $('retry').addEventListener('click', () => open(sel.value));
    const wanted = new URLSearchParams(location.search).get('mon');
    if (state.list.some((w) => w.id === wanted)) await open(wanted);
    else {
      // sense cap món demanat, el primer de la llista que es pugui carregar
      for (const w of state.list) if (await open(w.id, true)) return;
      show('error', t('error.load', { m: state.list.map((w) => w.id).join(', ') }));
    }
  }
  async function open(id, quiet = false) {
    $('loading-name').textContent = state.list.find((w) => w.id === id)?.titol[lang] ?? id;
    show('loading');
    let w;
    try { w = await loadWorld(`${base}/${id}`); } catch (e) { if (!quiet) show('error', t('error.load', { m: e.message })); return false; }
    state.world = w;
    show(null);
    $('world').value = id;
    $('world').title = $('world').selectedOptions[0]?.text ?? '';
    Object.assign(state, { frame: -1, pinned: null, hover: null, focus: null, code: { epoch: null, bytes: null, loading: null } });
    $('time').max = String(w.epochs.at(-1));
    state.time = w.meta.establiment ? Math.max(w.epochs[0], w.meta.establiment.epoca - 600) : w.epochs[0];
    onWorld?.(w);
    describe(); timeline(); legend(); families(); drawInspector();
    return true;
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

  // el panell: la capçalera (el món i la comprovació) i tres pestanyes
  function describe() {
    const m = state.world.meta;
    $('w-title').textContent = m.titol[lang];
    $('w-text').textContent = m.text[lang];
    $('w-why').textContent = m.tria[lang];
    $('w-check').hidden = !state.world.checked;
    $('sum-title').textContent = m.titol[lang];
  }
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(tab, focus = false) {
    for (const b of tabs) {
      const on = b === tab;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      $(b.getAttribute('aria-controls')).hidden = !on;
    }
    if (focus) tab.focus();
  }
  tabs.forEach((b, k) => {
    b.addEventListener('click', () => selectTab(b));
    b.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); selectTab(tabs[(k + d + tabs.length) % tabs.length], true); }
    });
  });
  if (tabs.length) selectTab(tabs.find((b) => b.getAttribute('aria-selected') === 'true') ?? tabs[0]);

  function legend() {
    const box = $('legend');
    box.replaceChildren();
    for (const cls of [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 0]) {
      const d = el('div', 'lg');
      d.append(el('dt', CLASS_GLYPH[cls], glyphOf(cls)), el('dd', '', cls ? CLASS_NAMES[lang][cls].replace(/^.\s/, '') : t('legend.data')));
      box.append(d);
    }
  }
  // les línies d'evolució comparteixen els eixos: del naixement de la primera família al final de la història, i del 0
  // a la quota més alta
  let axis = null;
  function families() {
    const ul = $('families'), w = state.world, fams = w.meta.families;
    ul.replaceChildren();
    $('fam-count').textContent = fams.length ? String(fams.length) : '';
    if (!fams.length) { ul.append(el('li', 'empty', t('families.none'))); updateFamilies(); return; }
    const end = w.epochs.at(-1), start = Math.min(...fams.map((f) => f.neix));
    axis = { start, span: Math.max(1, end - start), max: Math.max(0.001, ...fams.flatMap((f) => f.quota.filter((q) => q !== null))) };
    for (const f of fams) {
      const li = el('li'), b = el('button', 'fam');
      b.type = 'button';
      b.dataset.id = f.id;
      b.style.setProperty('--fc', famVar(f));
      b.title = t('families.focus');
      const main = el('span', 'fam-main'), meta = el('span', 'fam-meta');
      meta.append(withNumbers(t('families.born', { e: num(f.neix) }) + (f.mor !== null ? ` · ${t('families.died', { e: num(f.mor) })}` : '')));
      if (f.nucli) meta.append(' · ', motif(f.nucli));
      main.append(el('span', 'fam-name', t('inspector.family', { id: f.id })), meta);
      b.append(el('i', 'sw'), main, spark(f), el('span', 'fam-share'));
      b.addEventListener('click', () => { state.focus = state.focus === f.id ? null : f.id; state.frame = -1; updateFamilies(); });
      li.append(b);
      ul.append(li);
    }
    updateFamilies();
  }
  function spark(f) {
    const w = state.world, svg = svgEl('svg', { class: 'spark', viewBox: '0 0 100 22', preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    svg.append(svgEl('line', { class: 'base', x1: 0, y1: 21.5, x2: 100, y2: 21.5 }));
    let pts = [];
    const flush = () => { if (pts.length) svg.append(svgEl('polyline', { class: 'line', points: pts.join(' ') })); pts = []; };
    f.quota.forEach((q, j) => {
      const e = w.epochs[j];
      if (q === null || q === undefined || e < axis.start) { flush(); return; }
      pts.push(`${(((e - axis.start) / axis.span) * 100).toFixed(2)},${(21 - (q / axis.max) * 19).toFixed(2)}`);
    });
    flush();
    svg.append(svgEl('line', { class: 'now', x1: 0, y1: 0, x2: 0, y2: 22 }));
    return svg;
  }
  function updateFamilies() {
    const w = state.world;
    if (!w) return;
    const { i } = frameIndex(), x = axis ? Math.min(100, Math.max(0, ((state.time - axis.start) / axis.span) * 100)) : 0;
    const living = [];
    for (const b of $('families').querySelectorAll('.fam')) {
      const f = w.families.get(Number(b.dataset.id)), q = f.quota[i] ?? null;
      b.classList.toggle('is-ended', q === null && f.mor !== null && w.epochs[i] >= f.mor);
      b.classList.toggle('is-dimmed', state.focus !== null && state.focus !== f.id);
      b.setAttribute('aria-pressed', String(state.focus === f.id));
      b.querySelector('.fam-share').textContent = q === null ? '—' : pct(q);
      const now = b.querySelector('.now');
      now.setAttribute('x1', x.toFixed(2)); now.setAttribute('x2', x.toFixed(2));
      now.style.display = state.time < axis.start ? 'none' : '';
      if (q !== null) living.push([f, q]);
    }
    // el resum del full inferior (mòbil): les tres famílies amb més territori
    const mini = $('sum-fams');
    mini.replaceChildren(...living.sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f, q]) => {
      const s = el('span'), sw = el('i', 'sw');
      sw.style.setProperty('--fc', famVar(f));
      s.append(sw, pct(q));
      return s;
    }));
  }

  // l'inspector: a l'escriptori, fix a la dreta, a sota del panell (sense cap cel·la, diu què s'hi veurà); al mòbil, a
  // dalt, només amb una cel·la. Fixat, té un botó per tancar-lo
  const closeIcon = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>';
  function drawInspector() {
    const box = $('inspector'), cell = state.hover, w = state.world, docked = !mobile.matches;
    box.classList.toggle('is-docked', docked);
    if (!cell || !w) {
      box.hidden = !(docked && w);
      if (!box.hidden) { box.classList.remove('is-pinned'); box.replaceChildren(el('p', 'insp-empty', t('inspector.empty'))); }
      placeInspector();
      return;
    }
    const { i } = frameIndex(), f = w.familyAt(i, cell.c), k = w.k(i)[cell.c];
    box.hidden = false;
    box.classList.toggle('is-pinned', !!state.pinned);
    box.replaceChildren();
    const top = el('div', 'insp-top'), name = el('span', 'insp-cell'), right = el('span', 'insp-right');
    const label = t('inspector.cell', { x: cell.x, y: cell.y }), at = label.indexOf('(');
    name.append(label.slice(0, at), el('span', 'mono', label.slice(at)));
    const chip = el('span', 'chip');
    if (f) { const sw = el('i', 'sw'); sw.style.setProperty('--fc', famVar(f)); chip.append(sw, t('inspector.family', { id: f.id })); } else chip.append(t('inspector.nofamily'));
    const close = el('button', 'btn btn-icon insp-close');
    close.type = 'button';
    close.setAttribute('aria-label', t('inspector.close'));
    close.title = t('inspector.close');
    close.innerHTML = closeIcon;
    close.addEventListener('click', unpin);
    right.append(chip, close);
    top.append(name, right);
    const meta = el('div', 'insp-meta'), bytes = state.code.bytes;
    meta.append(el('span'), el('span'));
    meta.firstChild.append(withNumbers(t('inspector.instructions', { k })));
    if (bytes) meta.lastChild.append(withNumbers(t('inspector.code', { e: num(state.code.epoch) })));
    box.append(top, meta);
    if (bytes) {
      const prog = el('div', 'prog');
      prog.setAttribute('aria-label', '64 bytes');
      for (let b = 0; b < 64; b++) {
        if (b % 16 === 0) prog.append(el('span', 'off', String(b).padStart(2, '0')));
        const cls = bytes[cell.c * 64 + b];
        prog.append(el('span', CLASS_GLYPH[cls], glyphOf(cls)));
      }
      box.append(prog);
    } else if (w.codeEpochs.length) box.append(el('p', 'insp-note', t('inspector.nocode', { e: num(w.codeEpochs[0]) })));
    placeInspector();
  }
  // A l'escriptori, el panell i l'inspector fan una columna a la dreta, entre la barra de dalt i la línia de temps: el
  // panell s'encongeix (i el seu cos es desplaça) perquè l'inspector hi càpiga sempre a sota. Si el panell és tancat,
  // l'inspector puja fins a sota de la barra
  function placeInspector() {
    const box = $('inspector'), side = $('side');
    if (box.hidden || mobile.matches) { box.style.top = ''; side.style.maxHeight = ''; return; }
    const gap = parseFloat(getComputedStyle(document.body).getPropertyValue('--gap-tray')) || 12;
    const bar = document.querySelector('.t-right').getBoundingClientRect().bottom, end = $('timeline').getBoundingClientRect().top;
    const open = !side.classList.contains('is-closed');
    side.style.maxHeight = open ? `${Math.max(120, end - bar - box.offsetHeight - gap * 3)}px` : '';
    box.style.top = `${(open ? side.getBoundingClientRect().bottom : bar) + gap}px`;
  }

  // la línia de temps: un cens cada 250 èpoques, una etiqueta cada 1.000 (cada 2.000, si la història és llarga), i
  // l'establiment
  function timeline() {
    const m = state.world.meta, last = state.world.epochs.at(-1), box = $('ticks'), every = last > 8000 ? 2000 : 1000;
    box.replaceChildren();
    for (let e = 0; e <= last; e += CENSUS) {
      const p = `${(e / last) * 100}%`, major = e % 1000 === 0, i = el('i', major ? 'tick major' : 'tick');
      i.style.left = p;
      box.append(i);
      if (e % every === 0) {
        const l = el('span', 'tick-l' + (e === 0 ? ' first' : e === last ? ' last' : ''), num(e));
        l.style.left = p;
        box.append(l);
      }
    }
    const est = $('est');
    est.hidden = !m.establiment;
    if (m.establiment) { est.style.left = `${(m.establiment.epoca / last) * 100}%`; est.firstChild.textContent = t('time.established'); }
  }
  const track = $('time').parentElement, tip = $('scrub-tip');
  const scrub = (on) => { track.classList.toggle('is-scrubbing', on); tip.hidden = !on; };
  $('time').addEventListener('pointerdown', () => scrub(true));
  window.addEventListener('pointerup', () => scrub(false));
  $('time').addEventListener('input', (e) => { state.time = Number(e.target.value); setPlaying(false); });
  const playIcon = (on) => { $('play-icon').innerHTML = on ? '<path class="ic-fill" d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z"></path>' : '<path class="ic-fill" d="M7 4.5v15l12.5-7.5z"></path>'; };
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
  for (const b of $('speeds').querySelectorAll('button')) {
    b.addEventListener('click', () => {
      state.speed = Number(b.dataset.speed);
      for (const o of $('speeds').querySelectorAll('button')) o.setAttribute('aria-pressed', String(o === b));
    });
  }

  // l'ajuda, el panell (a l'escriptori) i el full inferior (al mòbil)
  const help = $('help');
  for (const b of document.querySelectorAll('[data-help]')) b.addEventListener('click', () => { help.showModal(); help.querySelector('.btn-primary')?.focus(); });
  const side = $('side'), panelBtn = $('panel-btn'), dock = $('dock'), grab = $('grab');
  const showPanel = (on) => { side.classList.toggle('is-closed', !on); panelBtn?.setAttribute('aria-expanded', String(on)); placeInspector(); };
  const showSheet = (on) => { dock.classList.toggle('is-open', on); grab.setAttribute('aria-expanded', String(on)); };
  showPanel(true);
  showSheet(false);
  // quan el panell canvia d'alçada (una altra pestanya, les famílies), l'inspector el segueix
  new ResizeObserver(() => placeInspector()).observe(side);
  panelBtn?.addEventListener('click', () => showPanel(side.classList.contains('is-closed')));
  grab.addEventListener('click', () => showSheet(!dock.classList.contains('is-open')));
  $('sum').addEventListener('click', () => showSheet(true));
  // el selector del món: a la barra de dalt a l'escriptori, i al full inferior al mòbil
  const placeSelect = () => (mobile.matches ? $('world-mob') : $('world-desk')).append($('world-box'));
  placeSelect();
  mobile.addEventListener?.('change', () => { placeSelect(); drawInspector(); });
  window.addEventListener('resize', placeInspector);
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && !e.target.closest?.('input, select, textarea, button, a')) { e.preventDefault(); $('play').click(); }
    if (e.key === 'Escape' && state.pinned) unpin();
  });
  onLang(() => { if (!state.world) return; describe(); timeline(); legend(); families(); drawInspector(); });

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
    const last = w.epochs.at(-1), p = `${(state.time / last) * 100}%`, e = Math.round(state.time);
    $('time').value = String(e);
    $('fill').style.width = p;
    $('playhead').style.left = p;
    tip.style.left = p;
    tip.textContent = num(e);
    $('epoch').textContent = num(e);
    return f;
  }

  return { state, start, tick, frameIndex, palette, hover, pick, needCode, drawInspector };
}
