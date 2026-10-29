// La càmera de l'explorador: mira un punt del mapa (u, v) des d'una distància, un gir i una inclinació, al pla o al
// planeta. Els controls:
//   ratolí: arrossegar per moure's, el botó dret (o Maj + arrossegar) per girar i inclinar, la roda per fer zoom cap
//           al punter, doble clic per anar-hi
//   tàctil: un dit per moure's, dos per fer zoom i girar
//   teclat: fletxes o WASD per moure's, Q i E per girar, R i F per inclinar, + i − per fer zoom, Inici per tornar
// Tots els canvis s'apropen al seu objectiu suaument.
import { W, H, toWorld, frameAt, pick } from './geo.js';
import { v3, perspective, lookAt, multiply, invert, project } from './mat4.js';

const FOV = (50 * Math.PI) / 180;
const MIN_D = 1.6, MAX_D = 1500, MIN_PITCH = 0.12, MAX_PITCH = 1.53;
export const HOME = { u: W / 2, v: H / 2, d: 520, yaw: 0, pitch: 1.0 };

export function createCamera(canvas, { onPick, onHover, onChange } = {}) {
  const goal = { ...HOME, planet: 0 }, cur = { ...goal };
  let viewProj = null, inverse = null, eye = [0, 0, 0];
  const keys = new Set();

  const ease = (dt) => 1 - Math.exp(-dt * 9);
  const clampGoal = () => {
    goal.d = Math.min(MAX_D, Math.max(MIN_D, goal.d));
    goal.pitch = Math.min(MAX_PITCH, Math.max(MIN_PITCH, goal.pitch));
    if (goal.planet < 0.5) {
      goal.u = Math.min(W + 64, Math.max(-64, goal.u));
      goal.v = Math.min(H + 64, Math.max(-64, goal.v));
    } else goal.v = Math.min(H * 1.6, Math.max(-H * 0.6, goal.v));
  };
  // quantes unitats del món fa un píxel al punt que es mira
  const unitsPerPixel = () => (2 * cur.d * Math.tan(FOV / 2)) / canvas.clientHeight;
  // moure el punt que es mira, en unitats de la pantalla (cap a la dreta i cap amunt)
  function pan(dx, dy) {
    const s = unitsPerPixel(), cy = Math.cos(cur.yaw), sy = Math.sin(cur.yaw);
    // la dreta de la pantalla, sobre el terra: (cos, −sin) en (est, sud); endavant: (−sin, −cos)
    const east = -dx * s * cy + dy * s * -sy, south = -dx * s * -sy + dy * s * -cy;
    const lat = (0.5 - goal.v / H) * (Math.PI / 3), squeeze = 1 + (Math.max(0.25, Math.cos(lat)) - 1) * cur.planet;
    goal.u += east / squeeze;
    goal.v += south;
    clampGoal();
  }
  // el raig del punter (x, y en píxels del llenç) i el punt del mapa que toca
  function rayAt(x, y) {
    if (!inverse) return null;
    const nx = (x / canvas.clientWidth) * 2 - 1, ny = 1 - (y / canvas.clientHeight) * 2;
    const a = project(inverse, [nx, ny, -1]), b = project(inverse, [nx, ny, 1]);
    return { origin: a, dir: v3.normalize(v3.sub(b, a)) };
  }
  function mapAt(x, y) {
    const r = rayAt(x, y);
    return r ? pick(r.origin, r.dir, cur.planet) : null;
  }
  function zoomAt(factor, x, y) {
    const p = x === undefined ? null : mapAt(x, y);
    const before = goal.d;
    goal.d *= factor;
    clampGoal();
    if (p && factor < 1) {
      const f = 1 - goal.d / before;
      goal.u += (p[0] - goal.u) * f;
      goal.v += (p[1] - goal.v) * f;
      clampGoal();
    }
  }

  // el ratolí
  let drag = null;
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    canvas.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, y: e.clientY, rotate: e.button === 2 || e.shiftKey, moved: 0 };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const rect = canvas.getBoundingClientRect();
    if (!drag) { onHover?.(mapAt(e.clientX - rect.left, e.clientY - rect.top), e.clientX - rect.left, e.clientY - rect.top); return; }
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
    if (drag.rotate) { goal.yaw -= dx * 0.006; goal.pitch += dy * 0.005; clampGoal(); } else pan(dx, dy);
    onChange?.();
  });
  const endDrag = (e) => {
    if (e.pointerType === 'touch' || !drag) return;
    if (drag.moved < 4) { const rect = canvas.getBoundingClientRect(); onPick?.(mapAt(e.clientX - rect.left, e.clientY - rect.top)); }
    drag = null;
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', () => { drag = null; });
  canvas.addEventListener('pointerleave', () => onHover?.(null));
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    zoomAt(Math.exp(e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0015)), e.clientX - rect.left, e.clientY - rect.top);
    onChange?.();
  }, { passive: false });
  canvas.addEventListener('dblclick', (e) => {
    const rect = canvas.getBoundingClientRect(), p = mapAt(e.clientX - rect.left, e.clientY - rect.top);
    if (p) { goal.u = p[0]; goal.v = p[1]; goal.d = Math.min(goal.d, 14); clampGoal(); onChange?.(); }
  });

  // el tàctil: un dit mou, dos fan zoom i giren
  const touches = new Map();
  let pinch = null;
  const touchState = () => {
    const [a, b] = [...touches.values()];
    return { mid: [(a.x + b.x) / 2, (a.y + b.y) / 2], dist: Math.hypot(a.x - b.x, a.y - b.y), angle: Math.atan2(b.y - a.y, b.x - a.x) };
  };
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (const t of e.changedTouches) touches.set(t.identifier, { x: t.clientX, y: t.clientY });
    pinch = touches.size === 2 ? touchState() : null;
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const prev = new Map(touches);
    for (const t of e.changedTouches) touches.set(t.identifier, { x: t.clientX, y: t.clientY });
    if (touches.size === 1) {
      const [id, p] = [...touches.entries()][0], q = prev.get(id);
      if (q) pan(p.x - q.x, p.y - q.y);
    } else if (touches.size === 2 && pinch) {
      const s = touchState();
      if (s.dist > 0 && pinch.dist > 0) zoomAt(pinch.dist / s.dist);
      goal.yaw -= s.angle - pinch.angle;
      pan(s.mid[0] - pinch.mid[0], s.mid[1] - pinch.mid[1]);
      pinch = s;
    }
    onChange?.();
  }, { passive: false });
  const touchEnd = (e) => {
    for (const t of e.changedTouches) touches.delete(t.identifier);
    pinch = touches.size === 2 ? touchState() : null;
  };
  canvas.addEventListener('touchend', touchEnd);
  canvas.addEventListener('touchcancel', touchEnd);

  // el teclat (quan el focus no és en un camp de text)
  window.addEventListener('keydown', (e) => {
    if (e.target.closest?.('input, select, textarea')) return;
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'q', 'e', 'r', 'f', '+', '-', '='].includes(k)) { keys.add(k); e.preventDefault(); }
    if (k === 'home') { Object.assign(goal, { ...HOME, planet: goal.planet, d: goal.planet > 0.5 ? 900 : HOME.d }); onChange?.(); }
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());
  function keyboard(dt) {
    if (!keys.size) return;
    const step = 420 * dt, has = (...ks) => ks.some((k) => keys.has(k));
    if (has('arrowleft', 'a')) pan(step, 0);
    if (has('arrowright', 'd')) pan(-step, 0);
    if (has('arrowup', 'w')) pan(0, step);
    if (has('arrowdown', 's')) pan(0, -step);
    if (has('q')) goal.yaw += 1.6 * dt;
    if (has('e')) goal.yaw -= 1.6 * dt;
    if (has('r')) goal.pitch += 1.2 * dt;
    if (has('f')) goal.pitch -= 1.2 * dt;
    if (has('+', '=')) zoomAt(Math.exp(-2.2 * dt));
    if (has('-')) zoomAt(Math.exp(2.2 * dt));
    clampGoal();
    onChange?.();
  }

  return {
    goal, cur,
    get eye() { return eye; },
    update(dt, aspect) {
      keyboard(dt);
      const f = ease(dt);
      for (const k of ['u', 'v', 'yaw', 'pitch', 'planet']) cur[k] += (goal[k] - cur[k]) * f;
      cur.d *= Math.pow(goal.d / cur.d, f);
      const s = toWorld(cur.u, cur.v, 0, cur.planet), fr = frameAt(cur.u, cur.v, cur.planet);
      const cp = Math.cos(cur.pitch), dir = v3.add(v3.add(v3.scale(fr.east, cp * Math.sin(cur.yaw)), v3.scale(fr.up, Math.sin(cur.pitch))), v3.scale(fr.south, cp * Math.cos(cur.yaw)));
      eye = v3.add(s, v3.scale(dir, cur.d));
      const near = Math.max(0.02, cur.d * 0.02), far = cur.d * 8 + 2000;
      viewProj = multiply(perspective(FOV, aspect, near, far), lookAt(eye, s, fr.up));
      inverse = invert(viewProj);
      return { viewProj, eye };
    },
    mapAt,
    setPlanet(on) {
      goal.planet = on ? 1 : 0;
      if (on) goal.d = Math.max(goal.d, 900);
      else { goal.d = Math.min(goal.d, 700); clampGoal(); }
    },
    reset() { Object.assign(goal, { ...HOME, planet: goal.planet, d: goal.planet > 0.5 ? 900 : HOME.d }); },
    flyTo(u, v, d) { goal.u = u; goal.v = v; if (d) goal.d = d; clampGoal(); },
  };
}
