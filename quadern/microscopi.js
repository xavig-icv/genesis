// El microscopi: executa una cinta pas a pas i mostra què fa cada instrucció.
// Semàntica idèntica a fase1/bff.js, però escrita per ser llegida, no per córrer.
import { TAPE_SIZE, MAX_STEPS } from '../fase1/bff.js';
import { createRng } from '../fase1/soup.js';

const MASK = TAPE_SIZE - 1;
const FAMILY = { '.': 'copy', ',': 'copy', '[': 'loop', ']': 'loop', '<': 'head', '>': 'head', '{': 'head', '}': 'head', '+': 'arith', '-': 'arith' };
const familyOf = (v) => FAMILY[String.fromCharCode(v)] ?? (v === 0 ? 'zero' : 'data');
const glyph = (v) => (FAMILY[String.fromCharCode(v)] ? String.fromCharCode(v) : v === 0 ? '0' : '·');
const where = (p) => (p < 64 ? `A${p}` : `B${p - 64}`);

function initialState(a, b) {
  const tape = new Uint8Array(TAPE_SIZE);
  tape.set(a, 0);
  tape.set(b, 64);
  return { tape, original: tape.slice(), pc: 0, h0: 0, h1: 0, steps: 0, ops: 0, done: false, note: 'Preparat. El punter (requadre) i els dos caps comencen a la posició A0.' };
}

// Executa una instrucció i retorna un estat nou (els anteriors es guarden per poder tornar enrere).
function step(prev) {
  if (prev.done) return prev;
  const s = { ...prev, tape: prev.tape.slice() };
  const t = s.tape;
  const c = String.fromCharCode(t[s.pc]);
  const at = where(s.pc);
  switch (c) {
    case '<': s.h0 = (s.h0 - 1) & MASK; s.note = `${at} «<»: head0 es mou a l'esquerra, fins a ${where(s.h0)}.`; break;
    case '>': s.h0 = (s.h0 + 1) & MASK; s.note = `${at} «>»: head0 es mou a la dreta, fins a ${where(s.h0)}.`; break;
    case '{': s.h1 = (s.h1 - 1) & MASK; s.note = `${at} «{»: head1 es mou a l'esquerra, fins a ${where(s.h1)}.`; break;
    case '}': s.h1 = (s.h1 + 1) & MASK; s.note = `${at} «}»: head1 es mou a la dreta, fins a ${where(s.h1)}.`; break;
    case '-': t[s.h0]--; s.note = `${at} «-»: resta 1 al byte de ${where(s.h0)}.`; break;
    case '+': t[s.h0]++; s.note = `${at} «+»: suma 1 al byte de ${where(s.h0)}.`; break;
    case '.': t[s.h1] = t[s.h0]; s.note = `${at} «.»: copia el byte de ${where(s.h0)} (head0) a ${where(s.h1)} (head1).`; break;
    case ',': t[s.h0] = t[s.h1]; s.note = `${at} «,»: copia el byte de ${where(s.h1)} (head1) a ${where(s.h0)} (head0).`; break;
    case '[':
      if (t[s.h0] === 0) {
        let depth = 1, pc = s.pc;
        while (depth > 0 && ++pc < TAPE_SIZE) {
          const q = String.fromCharCode(t[pc]);
          if (q === '[') depth++;
          else if (q === ']') depth--;
        }
        if (pc >= TAPE_SIZE) { s.done = true; s.note = `${at} «[»: el byte sota head0 és 0 i el bucle no té final. L'execució s'acaba.`; }
        else { s.note = `${at} «[»: el byte sota head0 és 0, així que se salta el bucle fins a ${where(pc)}.`; s.pc = pc; }
      } else s.note = `${at} «[»: el byte sota head0 no és 0, així que entra al bucle.`;
      break;
    case ']':
      if (t[s.h0] !== 0) {
        let depth = 1, pc = s.pc;
        while (depth > 0 && --pc >= 0) {
          const q = String.fromCharCode(t[pc]);
          if (q === ']') depth++;
          else if (q === '[') depth--;
        }
        if (pc < 0) { s.done = true; s.note = `${at} «]»: hauria de tornar enrere, però no hi ha cap «[». L'execució s'acaba.`; }
        else { s.note = `${at} «]»: el byte sota head0 (${where(s.h0)}) no és 0, així que torna a l'inici del bucle.`; s.pc = pc; }
      } else s.note = `${at} «]»: el byte sota head0 és 0, així que surt del bucle.`;
      break;
    default:
      s.note = `${at}: és un byte de dades, no fa res.`;
  }
  if (FAMILY[c]) s.ops++;
  s.steps++;
  if (!s.done) {
    s.pc++;
    if (s.pc >= TAPE_SIZE) { s.done = true; s.note += ' El punter surt de la cinta: fi.'; }
    else if (s.steps >= MAX_STEPS) { s.done = true; s.note += ' S\'ha arribat al límit de passos: fi.'; }
  }
  return s;
}

// Avança pels bytes de dades fins a la propera instrucció, conservant la nota.
function skipData(s) {
  const note = s.note;
  while (!s.done && !FAMILY[String.fromCharCode(s.tape[s.pc])]) s = step(s);
  return s.done ? s : { ...s, note };
}

export class Microscope {
  constructor(root, program, seed = 1) {
    this.root = root;
    this.program = program;
    this.rng = createRng(seed);
    this.timer = null;
    this.build();
    this.newPartner();
  }

  build() {
    const r = this.root;
    r.classList.add('microscope');
    r.innerHTML = `
      <div class="ms-controls">
        <button type="button" data-a="back" aria-label="Pas enrere">◀</button>
        <button type="button" data-a="step" aria-label="Pas endavant">▶</button>
        <button type="button" data-a="play" class="primary">Reprodueix</button>
        <button type="button" data-a="end">Fins al final</button>
        <button type="button" data-a="partner">Un altre company</button>
      </div>
      <div class="ms-tape">
        <div class="ms-label">A <span>el replicador</span></div>
        <div class="ms-row" data-from="0"></div>
        <div class="ms-label">B <span>el company</span></div>
        <div class="ms-row" data-from="64"></div>
      </div>
      <div class="ms-keys">
        <span><i class="k-pc"></i>punter d'instruccions</span>
        <span><i class="k-h0"></i>head0</span>
        <span><i class="k-h1"></i>head1</span>
        <span><i class="k-w"></i>byte reescrit</span>
      </div>
      <p class="ms-note" aria-live="polite"></p>
      <p class="ms-stats"></p>`;
    this.cells = [];
    for (const row of r.querySelectorAll('.ms-row')) {
      const from = Number(row.dataset.from);
      for (let i = 0; i < 64; i++) {
        const cell = document.createElement('span');
        cell.className = 'ms-cell';
        cell.title = where(from + i);
        row.appendChild(cell);
        this.cells.push(cell);
      }
    }
    r.querySelector('.ms-controls').addEventListener('click', (e) => {
      const a = e.target.closest('button')?.dataset.a;
      if (a === 'back') this.back();
      else if (a === 'step') this.forward();
      else if (a === 'play') this.toggle();
      else if (a === 'end') this.toEnd();
      else if (a === 'partner') this.newPartner();
    });
  }

  newPartner() {
    this.stop();
    const b = Uint8Array.from({ length: 64 }, () => (this.rng() * 256) | 0);
    const s = skipData(initialState(this.program, b));
    this.history = [{ ...s, note: `Preparat. Els caps comencen a A0. El punter ja ha passat els bytes de dades inicials i espera a ${where(s.pc)}, la primera instrucció.` }];
    this.render();
  }

  get state() { return this.history[this.history.length - 1]; }

  // Un pas "útil": executa la instrucció actual i deixa el punter a la següent
  // (els bytes de dades del mig també s'executen, però no fan res).
  forward() {
    const s = skipData(step(this.state));
    this.history.push(s);
    this.render();
    return !s.done;
  }

  back() {
    this.stop();
    if (this.history.length > 1) this.history.pop();
    this.render();
  }

  toEnd() {
    this.stop();
    let guard = 0;
    while (!this.state.done && guard++ < MAX_STEPS) this.history.push(step(this.state));
    this.render();
  }

  toggle() { this.timer ? this.stop() : this.play(); }

  play() {
    if (this.state.done) return;
    this.root.querySelector('[data-a="play"]').textContent = 'Pausa';
    this.timer = setInterval(() => { if (!this.forward()) this.stop(); }, 160);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
    const b = this.root.querySelector('[data-a="play"]');
    if (b) b.textContent = 'Reprodueix';
  }

  render() {
    const s = this.state;
    let rewritten = 0;
    for (let p = 0; p < TAPE_SIZE; p++) {
      const v = s.tape[p];
      const cell = this.cells[p];
      const changed = v !== s.original[p];
      if (changed && p >= 64) rewritten++;
      cell.textContent = glyph(v);
      cell.className = `ms-cell g ${familyOf(v)}${changed ? ' w' : ''}${p === s.pc && !s.done ? ' pc' : ''}${p === s.h0 ? ' h0' : ''}${p === s.h1 ? ' h1' : ''}`;
    }
    this.root.querySelector('.ms-note').textContent = s.note;
    this.root.querySelector('.ms-stats').textContent =
      `Pas ${s.steps.toLocaleString('ca')} · ${s.ops.toLocaleString('ca')} instruccions executades · ${rewritten} de 64 bytes de B reescrits${s.done ? ' · execució acabada' : ''}`;
  }
}
