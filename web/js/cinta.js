// La cinta de la portada: dos programes de 64 bytes, l'un al costat de l'altre, que s'executen pas a pas. Els bytes són
// de dues cel·les veïnes reals (web/img/README.md). L'estat de cada pas surt de trace(), que segueix la semàntica de
// l'intèrpret del simulador (fase1/bff.js) i s'hi compara: la cinta després de s passos ha de ser la que dona evaluate()
// amb s passos. Ho prova test/web.mjs a cada pas, i la pàgina ho torna a comprovar abans de mostrar l'execució.
import { KIND, TAPE_SIZE, PROGRAM_SIZE, MAX_STEPS, evaluate } from '../../fase1/bff.js';

const OP = Object.fromEntries([...'<>{}-+.,[]'].map((c) => [c, KIND[c.charCodeAt(0)]]));
const MASK = TAPE_SIZE - 1;

// L'execució pas a pas. Retorna, per a cada pas s (de 0 a steps): on és el punter d'instruccions (pc[s], la instrucció
// que s'executarà) i els dos caps (h0[s], h1[s]); i, per a cada pas fet (s de 1 a steps), el byte escrit (written[s], o
// -1) i el seu valor nou (value[s]). Acaba quan el punter surt de la cinta, quan un claudàtor no té parella o a maxSteps.
export function trace(bytes, maxSteps = MAX_STEPS) {
  const t = Uint8Array.from(bytes);
  const pc = [0], h0 = [0], h1 = [0], written = [-1], value = [0];
  let p = 0, a = 0, b = 0, s = 0;
  for (; s < maxSteps; ) {
    const k = KIND[t[p]];
    let w = -1, out = false;
    if (k === OP['[']) {
      if (t[a] === 0) {
        for (let d = 1; d > 0; ) {
          if (++p >= TAPE_SIZE) { out = true; break; }
          const q = KIND[t[p]];
          if (q === OP['[']) d++; else if (q === OP[']']) d--;
        }
      }
    } else if (k === OP[']']) {
      if (t[a] !== 0) {
        for (let d = 1; d > 0; ) {
          if (--p < 0) { out = true; break; }
          const q = KIND[t[p]];
          if (q === OP[']']) d++; else if (q === OP['[']) d--;
        }
      }
    } else if (k === OP['.']) { t[b] = t[a]; w = b; }
    else if (k === OP[',']) { t[a] = t[b]; w = a; }
    else if (k === OP['>']) a = (a + 1) & MASK;
    else if (k === OP['<']) a = (a - 1) & MASK;
    else if (k === OP['}']) b = (b + 1) & MASK;
    else if (k === OP['{']) b = (b - 1) & MASK;
    else if (k === OP['+']) { t[a] = (t[a] + 1) & 255; w = a; }
    else if (k === OP['-']) { t[a] = (t[a] - 1) & 255; w = a; }
    // un claudàtor sense parella atura l'execució sense comptar el pas, com a evaluate()
    if (out) break;
    s++;
    if (++p >= TAPE_SIZE) { written.push(w); value.push(w >= 0 ? t[w] : 0); pc.push(-1); h0.push(a); h1.push(b); break; }
    written.push(w); value.push(w >= 0 ? t[w] : 0); pc.push(p); h0.push(a); h1.push(b);
  }
  return { steps: pc.length - 1, pc, h0, h1, written, value, final: t };
}

// La cinta després de s passos, a partir dels bytes escrits
export function tapeAt(bytes, tr, s) {
  const t = Uint8Array.from(bytes);
  for (let i = 1; i <= s; i++) if (tr.written[i] >= 0) t[tr.written[i]] = tr.value[i];
  return t;
}

// Compara el traçat amb l'intèrpret del simulador cada `every` passos (i al darrer). Retorna el primer pas que no
// coincideix, o -1
export function check(bytes, tr, every = 1) {
  const t = Uint8Array.from(bytes);
  for (let s = 0; s <= tr.steps; s++) {
    if (s > 0 && tr.written[s] >= 0) t[tr.written[s]] = tr.value[s];
    if (s % every && s !== tr.steps) continue;
    const ref = Uint8Array.from(bytes);
    evaluate(ref, 0, s);
    for (let i = 0; i < TAPE_SIZE; i++) if (ref[i] !== t[i]) return s;
  }
  // i, més enllà del darrer pas, l'intèrpret ja no hi canvia res
  const ref = Uint8Array.from(bytes);
  evaluate(ref, 0);
  for (let i = 0; i < TAPE_SIZE; i++) if (ref[i] !== tr.final[i]) return tr.steps;
  return -1;
}

// El primer pas on la segona meitat és una còpia exacta de la primera tal com era al principi, o -1
export function copyStep(bytes, tr) {
  const t = Uint8Array.from(bytes);
  const same = () => { for (let i = 0; i < PROGRAM_SIZE; i++) if (t[PROGRAM_SIZE + i] !== bytes[i]) return false; return true; };
  if (same()) return 0;
  for (let s = 1; s <= tr.steps; s++) {
    if (tr.written[s] >= 0) t[tr.written[s]] = tr.value[s];
    if (tr.written[s] >= PROGRAM_SIZE && same()) return s;
  }
  return -1;
}

// El primer pas on la segona meitat és una còpia sencera de la primera al revés (com es copien els replicadors que hem
// vist, fase2/replication.js), o -1
export function mirrorStep(bytes, tr) {
  const t = Uint8Array.from(bytes);
  const same = () => { for (let i = 0; i < PROGRAM_SIZE; i++) if (t[PROGRAM_SIZE + i] !== bytes[PROGRAM_SIZE - 1 - i]) return false; return true; };
  if (same()) return 0;
  for (let s = 1; s <= tr.steps; s++) {
    if (tr.written[s] >= 0) t[tr.written[s]] = tr.value[s];
    if (tr.written[s] >= PROGRAM_SIZE && same()) return s;
  }
  return -1;
}

// La figura de la portada: les dues files de bytes, el pas, els controls i la barra per moure's pels passos. Es
// reprodueix sola el primer cop que es veu (amb moviment reduït, no), fins al pas on la còpia és sencera; després, si es
// continua, va més de pressa fins al final.
// L'esdeveniment (encàrrec 2): A entra des de l'esquerra i B des de la dreta (data-tape-enter), al pas de la còpia
// sencera s'atura, entra el final (.is-done) i els bytes copiats pugen de llum una vegada (.is-sweep); aturada després
// d'aquest pas, el botó diu «Continua» (.is-after). Amb moviment reduït es mostra directament aquest pas, sense pols de
// llum. La pestanya amagada l'atura; Re Pàg / Av Pàg mouen la barra de 100 en 100.
const OPS = '<>{}-+.,[]';
const GLYPH = '<>{}−+.,[]';
const COLOR = ['g-h0', 'g-h0', 'g-h1', 'g-h1', 'g-ar', 'g-ar', 'g-cp', 'g-cp', 'g-lp', 'g-lp'];
const look = (v) => {
  if (v === 0) return ['0', 'g-z'];
  const k = OPS.indexOf(String.fromCharCode(v));
  return k < 0 ? ['·', 'g-d'] : [GLYPH[k], COLOR[k]];
};
export function mountTape(fig, { num, onLang, reducedMotion }) {
  const bytes = Uint8Array.from(fig.dataset.bytes.match(/../g), (h) => parseInt(h, 16));
  if (bytes.length !== TAPE_SIZE) return;
  const tr = trace(bytes);
  // abans d'ensenyar res, el traçat ha de coincidir amb l'intèrpret del simulador (cada 16 passos i al final)
  if (check(bytes, tr, 16) !== -1) { fig.hidden = true; return; }
  const done = mirrorStep(bytes, tr), A = bytes.slice(0, PROGRAM_SIZE);
  const $ = (id) => fig.querySelector(`#${id}`);
  const cells = [];
  for (const row of [$('tape-a'), $('tape-b')]) for (let i = 0; i < PROGRAM_SIZE; i++) { const c = document.createElement('span'); c.style.setProperty('--k', String(i)); row.append(c); cells.push(c); }
  const scrub = $('tape-scrub');
  scrub.max = String(tr.steps);
  $('tape-mark').style.left = `${(done / tr.steps) * 100}%`;
  // la cinta del pas actual, i a quin pas es va escriure cada byte per últim cop
  let s = 0, cur = Uint8Array.from(bytes), wroteAt = new Int32Array(TAPE_SIZE).fill(-99);
  let playing = false, last = 0, carry = 0;
  function goTo(target) {
    if (target < s) { s = 0; cur = Uint8Array.from(bytes); wroteAt.fill(-99); }
    for (; s < target; ) { s++; const w = tr.written[s]; if (w >= 0) { cur[w] = tr.value[s]; wroteAt[w] = s; } }
  }
  const shown = new Array(TAPE_SIZE).fill('');
  function render() {
    let copied = 0;
    for (let i = 0; i < TAPE_SIZE; i++) {
      const [g, color] = look(cur[i]);
      // els bytes d'A: els de la primera meitat, i els de B que ja són els d'A al revés
      const isA = i < PROGRAM_SIZE || cur[i] === A[TAPE_SIZE - 1 - i];
      if (i >= PROGRAM_SIZE && isA) copied++;
      let cls = color;
      if (isA) cls += ' is-a';
      if (!reducedMotion.matches && s - wroteAt[i] < 6) cls += ' is-new';
      if (tr.pc[s] === i) cls += ' is-pc';
      if (tr.h0[s] === i) cls += ' is-h0';
      if (tr.h1[s] === i) cls += ' is-h1';
      const key = g + cls;
      if (shown[i] !== key) { shown[i] = key; cells[i].textContent = g; cells[i].className = cls; }
    }
    $('tape-step').textContent = num(s);
    $('tape-copied').textContent = String(copied);
    scrub.value = String(s);
    fig.classList.toggle('is-done', s >= done);
    fig.classList.toggle('is-after', !playing && s >= done && s < tr.steps);
  }
  const steps = () => { $('tape-steps').textContent = num(tr.steps); };
  steps();
  onLang?.(() => { steps(); render(); });

  const setPlaying = (on) => {
    const was = playing;
    playing = on;
    fig.classList.toggle('is-playing', on);
    fig.classList.toggle('is-after', !on && s >= done && s < tr.steps);
    if (on && !was) { last = performance.now(); carry = 0; requestAnimationFrame(frame); }
  };
  // en arribar al pas de la còpia sencera, els bytes copiats pugen de llum una sola vegada (750 ms, en escala)
  const sweep = () => {
    if (reducedMotion.matches) return;
    fig.classList.remove('is-sweep');
    void fig.offsetWidth;
    fig.classList.add('is-sweep');
    setTimeout(() => fig.classList.remove('is-sweep'), 1700);
  };
  function frame(now) {
    if (!playing) return;
    // uns 12 segons fins a la còpia sencera; després, deu vegades més de pressa
    const rate = s < done ? done / 12 : (done / 12) * 10;
    carry += ((now - last) / 1000) * rate;
    last = now;
    const n = Math.floor(carry);
    carry -= n;
    let target = Math.min(tr.steps, s + n);
    const arrive = s < done && target >= done;
    if (arrive) target = done;
    goTo(target);
    if (arrive) { playing = false; fig.classList.remove('is-playing'); render(); sweep(); return; }
    render();
    if (s >= tr.steps) setPlaying(false);
    if (playing) requestAnimationFrame(frame);
  }
  $('tape-play').addEventListener('click', () => { if (!playing && s >= tr.steps) { goTo(0); render(); } setPlaying(!playing); });
  $('tape-reset').addEventListener('click', () => { setPlaying(false); goTo(0); render(); });
  scrub.addEventListener('input', () => { setPlaying(false); goTo(Number(scrub.value)); render(); });
  scrub.addEventListener('keydown', (e) => {
    if (e.key !== 'PageUp' && e.key !== 'PageDown') return;
    e.preventDefault();
    setPlaying(false);
    goTo(Math.max(0, Math.min(tr.steps, s + (e.key === 'PageUp' ? 100 : -100))));
    render();
  });
  // la pestanya amagada l'atura; en tornar, continua si corria
  let wasPlaying = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { wasPlaying = playing; setPlaying(false); } else if (wasPlaying) { wasPlaying = false; setPlaying(true); }
  });
  // amb moviment reduït, el pas de la còpia sencera, quiet
  if (reducedMotion.matches) goTo(done);
  render();
  // la primera vegada que es veu: l'entrada (600 ms) i, després, es reprodueix sola (si no hi ha moviment reduït)
  if (!reducedMotion.matches) {
    fig.dataset.tapeEnter = 'pre';
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      fig.dataset.tapeEnter = 'in';
      setTimeout(() => { delete fig.dataset.tapeEnter; if (s === 0) setPlaying(true); }, 780);
    }, { threshold: 0.6 });
    io.observe(fig);
  }
}
