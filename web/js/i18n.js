// Els textos del lloc en català i en anglès. La llengua surt de ?lang=, de l'última triada (si el navegador la pot
// desar) o del navegador: català si el navegador en demana, i si no, anglès.
const TEXTS = {
  ca: {
    'site.title': 'claude-origins · Abiogènesi digital',
    'nav.home': 'Inici', 'nav.explorer': 'Explorador 3D', 'nav.notebook': 'Quadern', 'nav.repo': 'Codi',
    'nav.map': 'Vista 2D', 'nav.live': 'El teu món, en viu',
    'zoom.code2d': 'Fes zoom per veure els bytes de cada programa',
    'help.dbl2d': 'Doble clic per apropar-te a un punt.',
    'help.touch2d': 'Un dit per moure’t, dos per fer zoom.',
    'help.keys2d': 'Fletxes o <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> per moure’t, <kbd>+</kbd> i <kbd>−</kbd> per al zoom, <kbd>Inici</kbd> per veure el món sencer, <kbd>espai</kbd> per reproduir.',
    'view.flat': 'Pla', 'view.planet': 'Planeta', 'view.label': 'Vista', 'world.label': 'Món',
    'theme.label': 'Tema', 'theme.system': 'Sistema', 'theme.light': 'Clar', 'theme.dark': 'Fosc',
    'time.play': 'Reprodueix', 'time.pause': 'Atura', 'time.epoch': 'Època', 'time.speed': 'Velocitat',
    'time.established': 'Establiment',
    'panel.world': 'El món', 'panel.families': 'Famílies', 'panel.legend': 'Les instruccions', 'panel.why': 'Per què aquest món',
    'panel.toggle': 'Mostra o amaga el panell', 'panel.label': 'Panell', 'tab.legend': 'Instruccions',
    'families.none': 'Encara cap família de replicadors: només soroll.',
    'families.note': 'El color marca el territori de cada família: les cel·les que en porten el nucli de codi, no només els replicadors que funcionen. Ho dona el registre de famílies del projecte, sobre una mostra de cel·les a cada fotograma.',
    'families.born': 'neix a l’època {e}', 'families.died': 'fins a l’època {e}', 'families.share': '{p} del món',
    'families.focus': 'Clic per ressaltar-la', 'families.clear': 'Mostra-les totes',
    'inspector.cell': 'Cel·la ({x}, {y})', 'inspector.family': 'Família {id}', 'inspector.nofamily': 'Sense família',
    'inspector.instructions': '{k} instruccions de 64', 'inspector.code': 'El codi, a l’època {e}',
    'inspector.nocode': 'De prop, el codi es veu a partir de l’època {e}.', 'inspector.close': 'Tanca',
    'scale.cells': '{n} cel·les', 'scale.cell': '{n} cel·la', 'scale.label': 'Escala', 'minimap.label': 'Mapa · proposta',
    'zoom.code': 'Apropa’t per veure el codi de cada cel·la',
    'help.title': 'Com et pots moure',
    'help.drag': 'Arrossega per moure’t pel món.',
    'help.rotate': 'Botó dret (o <kbd>Maj</kbd> + arrossegar) per girar i inclinar la vista.',
    'help.zoom': 'Roda del ratolí per apropar-te o allunyar-te, cap al punter.',
    'help.dbl': 'Doble clic per anar a un punt.',
    'help.touch': 'Un dit per moure’t, dos per fer zoom i girar.',
    'help.keys': 'Fletxes o <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>, <kbd>Q</kbd> i <kbd>E</kbd> per girar, <kbd>R</kbd> i <kbd>F</kbd> per inclinar, <kbd>+</kbd> i <kbd>−</kbd> per al zoom, <kbd>Inici</kbd> per tornar, <kbd>espai</kbd> per reproduir.',
    'help.close': 'Entesos', 'help.groupMouse': 'Ratolí', 'help.groupTouch': 'Al mòbil', 'help.groupKeys': 'Teclat',
    'loading': 'Carregant el món…', 'loaded.checked': 'Dades comprovades amb la seva SHA-256',
    'error.webgl': 'Aquest navegador no té WebGL2, i l’explorador 3D el necessita.',
    'error.load': 'No s’ha pogut carregar el món: {m}', 'error.retry': 'Torna-ho a provar',
    'error.webglText': 'Un món digital on la vida sorgeix sola, vist des de dalt: del món sencer fins als bytes de cada programa.',
    'legend.data': 'dada (qualsevol altre byte)',
    'source': 'Les dades surten de tornar a fer la simulació amb la mateixa llavor: la història és la del registre (es comprova amb les SHA-256 de les captures).',
  },
  en: {
    'site.title': 'claude-origins · Digital abiogenesis',
    'nav.home': 'Home', 'nav.explorer': '3D explorer', 'nav.notebook': 'Notebook', 'nav.repo': 'Code',
    'nav.map': '2D view', 'nav.live': 'Your own world, live',
    'zoom.code2d': 'Zoom in to see the bytes of each program',
    'help.dbl2d': 'Double-click to zoom in on a point.',
    'help.touch2d': 'One finger to move, two to zoom.',
    'help.keys2d': 'Arrows or <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> to move, <kbd>+</kbd> and <kbd>−</kbd> to zoom, <kbd>Home</kbd> to see the whole world, <kbd>space</kbd> to play.',
    'view.flat': 'Plane', 'view.planet': 'Planet', 'view.label': 'View', 'world.label': 'World',
    'theme.label': 'Theme', 'theme.system': 'System', 'theme.light': 'Light', 'theme.dark': 'Dark',
    'time.play': 'Play', 'time.pause': 'Pause', 'time.epoch': 'Epoch', 'time.speed': 'Speed',
    'time.established': 'Establishment',
    'panel.world': 'The world', 'panel.families': 'Families', 'panel.legend': 'The instructions', 'panel.why': 'Why this world',
    'panel.toggle': 'Show or hide the panel', 'panel.label': 'Panel', 'tab.legend': 'Instructions',
    'families.none': 'No replicator family yet: only noise.',
    'families.note': 'The colour marks each family’s territory: the cells that carry its core code, not only the replicators that work. It comes from the project’s family tracker, run on a sample of cells at each frame.',
    'families.born': 'born at epoch {e}', 'families.died': 'until epoch {e}', 'families.share': '{p} of the world',
    'families.focus': 'Click to highlight it', 'families.clear': 'Show them all',
    'inspector.cell': 'Cell ({x}, {y})', 'inspector.family': 'Family {id}', 'inspector.nofamily': 'No family',
    'inspector.instructions': '{k} instructions out of 64', 'inspector.code': 'The code, at epoch {e}',
    'inspector.nocode': 'Up close, the code is shown from epoch {e}.', 'inspector.close': 'Close',
    'scale.cells': '{n} cells', 'scale.cell': '{n} cell', 'scale.label': 'Scale', 'minimap.label': 'Map · proposal',
    'zoom.code': 'Zoom in to see the code of each cell',
    'help.title': 'How to move around',
    'help.drag': 'Drag to move across the world.',
    'help.rotate': 'Right button (or <kbd>Shift</kbd> + drag) to turn and tilt the view.',
    'help.zoom': 'Mouse wheel to zoom in or out, towards the pointer.',
    'help.dbl': 'Double-click to fly to a point.',
    'help.touch': 'One finger to move, two to zoom and turn.',
    'help.keys': 'Arrows or <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>, <kbd>Q</kbd> and <kbd>E</kbd> to turn, <kbd>R</kbd> and <kbd>F</kbd> to tilt, <kbd>+</kbd> and <kbd>−</kbd> to zoom, <kbd>Home</kbd> to go back, <kbd>space</kbd> to play.',
    'help.close': 'Got it', 'help.groupMouse': 'Mouse', 'help.groupTouch': 'On a phone', 'help.groupKeys': 'Keyboard',
    'loading': 'Loading the world…', 'loaded.checked': 'Data checked against its SHA-256',
    'error.webgl': 'This browser has no WebGL2, which the 3D explorer needs.',
    'error.load': 'The world could not be loaded: {m}', 'error.retry': 'Try again',
    'error.webglText': 'A digital world where life arises on its own, seen from above: from the whole world down to the bytes of each program.',
    'legend.data': 'data (any other byte)',
    'source': 'The data come from running the simulation again with the same seed: the history is the recorded one (checked against the SHA-256 of the captures).',
  },
};

function stored() { try { return localStorage.getItem('lang'); } catch { return null; } }
function store(l) { try { localStorage.setItem('lang', l); } catch { /* sense emmagatzematge, no es recorda */ } }

export let lang = (() => {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'ca' || q === 'en') return q;
  const s = stored();
  if (s === 'ca' || s === 'en') return s;
  return (navigator.languages ?? [navigator.language]).some((l) => /^ca\b/i.test(l)) ? 'ca' : 'en';
})();

export function t(key, vars = {}) {
  const s = TEXTS[lang][key] ?? TEXTS.ca[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}
// Els números com a la resta del projecte: 2.250 i 1,9 en català, 2,250 i 1.9 en anglès (també amb quatre xifres,
// que alguns navegadors no agrupen)
export function num(x, digits = 0) {
  const [int, dec] = Math.abs(x).toFixed(digits).split('.');
  const [group, point] = lang === 'ca' ? ['.', ','] : [',', '.'];
  return (x < 0 ? '−' : '') + int.replace(/\B(?=(\d{3})+(?!\d))/g, group) + (dec ? point + dec : '');
}
export const pct = (x, digits = 1) => `${num(x * 100, digits)} %`;

const listeners = [];
export function onLang(f) { listeners.push(f); }
export function setLang(l) {
  if (l === lang) return;
  lang = l;
  store(l);
  document.documentElement.lang = l;
  apply();
  for (const f of listeners) f(l);
}
// Els elements amb data-i18n="clau" (el text) i data-i18n-title="clau" (el títol i l'etiqueta accessible)
export function apply(root = document) {
  document.documentElement.lang = lang;
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of root.querySelectorAll('[data-i18n-html]')) el.innerHTML = t(el.dataset.i18nHtml);
  for (const el of root.querySelectorAll('[data-i18n-title]')) { el.title = t(el.dataset.i18nTitle); el.setAttribute('aria-label', el.title); }
  for (const el of root.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
  for (const el of root.querySelectorAll('[data-lang]')) el.setAttribute('aria-pressed', String(el.dataset.lang === lang));
}
