// Els textos del lloc en català i en anglès. La llengua surt de ?lang=, de l'última triada (si el navegador la pot
// desar) o del navegador: català si el navegador en demana, i si no, anglès.
const TEXTS = {
  ca: {
    // el títol i la descripció de cada pàgina (AUD-166)
    'page.home.title': 'Genesis · Abiogènesi digital',
    'page.home.desc': 'Un univers de joguina on la vida sorgeix sola: programes aleatoris que es tornen replicadors, sense que ningú n’escrigui el primer. Dissenyem les lleis, mai els organismes.',
    'page.explorer.title': 'Explorador 3D · Genesis',
    'page.explorer.desc': 'Un món digital on la vida sorgeix sola, en 3D: les famílies de replicadors i el codi de cada cel·la.',
    'page.view2d.title': 'Vista 2D · Genesis',
    'page.view2d.desc': 'Un món digital on la vida sorgeix sola, vist des de dalt: del món sencer fins als bytes de cada programa.',
    'page.live.title': 'El teu món, en viu · Genesis',
    'page.live.desc': 'Un món digital nou, de bytes a l’atzar, que corre al teu navegador amb el mateix simulador i les mateixes lleis que les sèries del projecte.',
    'nav.home': 'Inici', 'nav.explorer': 'Explorador 3D', 'nav.notebook': 'Quadern', 'nav.repo': 'Codi',
    'nav.map': 'Vista 2D', 'nav.live': 'El teu món, en viu',
    'zoom.code2d': 'Fes zoom per veure els bytes de cada programa',
    'help.dbl2d': 'Doble clic per apropar-te a un punt.',
    'help.touch2d': 'Un dit per moure’t, dos per fer zoom.',
    'help.keys2d': 'Amb el focus al món (un clic o <kbd>Tab</kbd>): fletxes o <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> per moure’t, <kbd>+</kbd> i <kbd>−</kbd> per al zoom, <kbd>Inici</kbd> per veure el món sencer, <kbd>Retorn</kbd> per fixar la cel·la del centre, <kbd>Esc</kbd> per deixar-la anar, <kbd>espai</kbd> per reproduir.',
    'view.flat': 'Pla', 'view.planet': 'Planeta', 'view.label': 'Vista', 'world.label': 'Món',
    'theme.label': 'Tema', 'theme.system': 'Sistema', 'theme.light': 'Clar', 'theme.dark': 'Fosc',
    'time.play': 'Reprodueix', 'time.pause': 'Atura', 'time.epoch': 'Època', 'time.speed': 'Velocitat',
    // el naixement del 1006, a la capçalera de la portada: els subtítols surten de mon.json (js/portada.js)
    'birth.again': 'Torna-ho a veure', 'birth.cap.noise': 'Encara cap família de replicadors: només soroll.',
    'birth.cap.est': 'La vida s’ha establert a l’època {e}.', 'birth.cap.confirm': 'El cens de l’època {e} en confirma l’establiment.',
    'birth.cap.family': 'Família {id} · {p} del món.',
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
    'inspector.empty': 'Passa el punter per sobre d’una cel·la per veure’n la família i el codi. Amb un clic, la fixes.',
    'scale.cells': '{n} cel·les', 'scale.cell': '{n} cel·la', 'scale.label': 'Escala', 'minimap.label': 'Mapa · proposta',
    'zoom.code': 'Apropa’t per veure el codi de cada cel·la',
    'help.title': 'Com et pots moure',
    'help.drag': 'Arrossega per moure’t pel món.',
    'help.rotate': 'Botó dret (o <kbd>Maj</kbd> + arrossegar) per girar i inclinar la vista.',
    'help.zoom': 'Roda del ratolí per apropar-te o allunyar-te, cap al punter.',
    'help.dbl': 'Doble clic per anar a un punt.',
    'help.touch': 'Un dit per moure’t, dos per fer zoom i girar.',
    'help.keys': 'Amb el focus al món (un clic o <kbd>Tab</kbd>): fletxes o <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>, <kbd>Q</kbd> i <kbd>E</kbd> per girar, <kbd>R</kbd> i <kbd>F</kbd> per inclinar, <kbd>+</kbd> i <kbd>−</kbd> per al zoom, <kbd>Inici</kbd> per tornar, <kbd>Retorn</kbd> per fixar la cel·la del centre, <kbd>Esc</kbd> per deixar-la anar, <kbd>espai</kbd> per reproduir.',
    'canvas.explorer': 'El món en 3D. Amb el focus aquí, les fletxes el mouen, i Retorn fixa la cel·la del centre i en mostra el codi.',
    'canvas.view2d': 'El món vist des de dalt. Amb el focus aquí, les fletxes el mouen, i Retorn fixa la cel·la del centre i en mostra el codi.',
    'canvas.live': 'El teu món, en viu. Amb el focus aquí, Retorn fixa la cel·la del centre i en mostra el codi, i l’espai el fa córrer o l’atura.',
    'inspector.pinned': 'Cel·la fixada ({x}, {y}): {f}, {k} instruccions de 64.',
    'inspector.pinnedLive': 'Cel·la fixada ({x}, {y}): {f}.',
    'inspector.released': 'Cel·la deixada anar.',
    'help.close': 'Entesos', 'help.groupMouse': 'Ratolí', 'help.groupTouch': 'Al mòbil', 'help.groupKeys': 'Teclat',
    'loading': 'Carregant el món…', 'loaded.checked': 'Dades comprovades amb la seva SHA-256',
    'error.webgl': 'Aquest navegador no té WebGL2, i l’explorador 3D el necessita.',
    'error.load': 'No s’ha pogut carregar el món: {m}', 'error.retry': 'Torna-ho a provar',
    'error.webglText': 'Un món digital on la vida sorgeix sola, vist des de dalt: del món sencer fins als bytes de cada programa.',
    'legend.data': 'dada (qualsevol altre byte)',
    'source': 'Les dades surten de tornar a fer la simulació amb la mateixa llavor: la història és la del registre (es comprova amb les SHA-256 de les captures).',
    'live.title': 'El teu món',
    'live.tab.census': 'El cens',
    'live.tab.check': 'Comprova-ho',
    'live.lead': 'Un món nou, de bytes a l’atzar, que corre al teu ordinador amb el mateix simulador i les mateixes lleis que les sèries.',
    'live.seed': 'Llavor',
    'live.reseed': 'Una altra',
    'live.law': 'Llei',
    'live.quiet': 'Quiet',
    'live.current': 'Corrent feble',
    'live.size': 'Mida',
    'live.apply': 'Comença un món nou',
    'live.run': 'Fes-lo córrer',
    'live.pause': 'Atura’l',
    'live.rate': 'Èpoques/s',
    'live.start': 'Prem ▶ per fer-lo córrer, amb {k} fils del teu ordinador',
    'live.paused': 'Aturat: prem ▶ per continuar',
    'live.none': 'Encara no hi ha vida establerta.',
    'live.established': 'La vida s’ha establert a l’època {e}.',
    'live.confirmed': 'Ho confirma el cens de l’època {c}.',
    'live.census': 'Al cens de l’època {e}, {h} de les {s} cel·les de la mostra són replicadors hereditaris ({p}).',
    'live.nocensus': 'El primer cens és a l’època 250.',
    'live.criterion': 'La vida s’estableix quan, en dos censos seguits, almenys l’1 % de la mostra són replicadors hereditaris: el criteri de les sèries. Les barres de baix són els censos.',
    'live.odds': 'No neix a tots els mons. A la sèrie preregistrada 1, en 16.000 èpoques, es va establir en 24 dels 80 mons quiets i en 34 dels 80 amb corrent feble. Amb la llavor 1006, la del planeta de la portada, s’hi estableix a l’època 2.250.',
    'live.try1006': 'Prova la llavor 1006',
    'live.try1006.note': 'A la sèrie, la vida hi neix a l’època {e}. Amb una llavor a l’atzar, el més probable és que hi vegis soroll durant molta estona.',
    'live.eta1006': 'Al ritme d’ara, la vida hi naixerà d’aquí a uns {m} min.',
    'live.check.text': 'Amb la mateixa llavor, el simulador fa el mateix món al navegador i amb Node. A l’època {e}, la de l’últim cens, l’empremta del món és {f}.',
    'live.check.wait': 'Al primer cens, a l’època 250, aquí hi haurà l’empremta del món i l’ordre per comprovar-la amb Node.',
    'live.check.cmd': 'Per comprovar-ho, des d’una còpia del repositori:',
    'live.check.end': 'Al final escriu «empremta del món: {f}», i el cens d’aquesta època és aquesta línia:',
    'live.foot': 'No és cap experiment: és el teu món, i no es desa enlloc. Corre amb els fitxers del simulador: fase1/bff.js, fase2/world.js i fase2/census.js.',
    'live.inspector': 'Passa el punter per sobre d’una cel·la per veure’n el codi d’ara mateix. Amb un clic, la fixes.',
    'live.now': 'Ara, a l’època {e}',
    'live.error': 'El món no pot córrer en aquest navegador: {m}',
  },
  en: {
    'page.home.title': 'Genesis · Digital abiogenesis',
    'page.home.desc': 'A toy universe where life arises on its own: random programs that become replicators, without anyone writing the first one. We design the laws, never the organisms.',
    'page.explorer.title': '3D explorer · Genesis',
    'page.explorer.desc': 'A digital world where life arises on its own, in 3D: the families of replicators and the code of each cell.',
    'page.view2d.title': '2D view · Genesis',
    'page.view2d.desc': 'A digital world where life arises on its own, seen from above: from the whole world down to the bytes of each program.',
    'page.live.title': 'Your own world, live · Genesis',
    'page.live.desc': 'A new digital world, of random bytes, that runs in your browser with the same simulator and the same laws as the project’s series.',
    'nav.home': 'Home', 'nav.explorer': '3D explorer', 'nav.notebook': 'Notebook (Catalan)', 'nav.repo': 'Code',
    'nav.map': '2D view', 'nav.live': 'Your own world, live',
    'zoom.code2d': 'Zoom in to see the bytes of each program',
    'help.dbl2d': 'Double-click to zoom in on a point.',
    'help.touch2d': 'One finger to move, two to zoom.',
    'help.keys2d': 'With the focus on the world (a click or <kbd>Tab</kbd>): arrows or <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> to move, <kbd>+</kbd> and <kbd>−</kbd> to zoom, <kbd>Home</kbd> to see the whole world, <kbd>Enter</kbd> to pin the cell in the centre, <kbd>Esc</kbd> to release it, <kbd>space</kbd> to play.',
    'view.flat': 'Plane', 'view.planet': 'Planet', 'view.label': 'View', 'world.label': 'World',
    'theme.label': 'Theme', 'theme.system': 'System', 'theme.light': 'Light', 'theme.dark': 'Dark',
    'time.play': 'Play', 'time.pause': 'Pause', 'time.epoch': 'Epoch', 'time.speed': 'Speed',
    'birth.again': 'Watch it again', 'birth.cap.noise': 'No family of replicators yet: only noise.',
    'birth.cap.est': 'Life became established at epoch {e}.', 'birth.cap.confirm': 'The census of epoch {e} confirms the establishment.',
    'birth.cap.family': 'Family {id} · {p} of the world.',
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
    'inspector.empty': 'Hover over a cell to see its family and its code. Click to pin it.',
    'scale.cells': '{n} cells', 'scale.cell': '{n} cell', 'scale.label': 'Scale', 'minimap.label': 'Map · proposal',
    'zoom.code': 'Zoom in to see the code of each cell',
    'help.title': 'How to move around',
    'help.drag': 'Drag to move across the world.',
    'help.rotate': 'Right button (or <kbd>Shift</kbd> + drag) to turn and tilt the view.',
    'help.zoom': 'Mouse wheel to zoom in or out, towards the pointer.',
    'help.dbl': 'Double-click to fly to a point.',
    'help.touch': 'One finger to move, two to zoom and turn.',
    'help.keys': 'With the focus on the world (a click or <kbd>Tab</kbd>): arrows or <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>, <kbd>Q</kbd> and <kbd>E</kbd> to turn, <kbd>R</kbd> and <kbd>F</kbd> to tilt, <kbd>+</kbd> and <kbd>−</kbd> to zoom, <kbd>Home</kbd> to go back, <kbd>Enter</kbd> to pin the cell in the centre, <kbd>Esc</kbd> to release it, <kbd>space</kbd> to play.',
    'canvas.explorer': 'The world in 3D. With the focus here, the arrows move it, and Enter pins the cell in the centre and shows its code.',
    'canvas.view2d': 'The world seen from above. With the focus here, the arrows move it, and Enter pins the cell in the centre and shows its code.',
    'canvas.live': 'Your own world, live. With the focus here, Enter pins the cell in the centre and shows its code, and space runs or pauses it.',
    'inspector.pinned': 'Pinned cell ({x}, {y}): {f}, {k} instructions out of 64.',
    'inspector.pinnedLive': 'Pinned cell ({x}, {y}): {f}.',
    'inspector.released': 'Cell released.',
    'help.close': 'Got it', 'help.groupMouse': 'Mouse', 'help.groupTouch': 'On a phone', 'help.groupKeys': 'Keyboard',
    'loading': 'Loading the world…', 'loaded.checked': 'Data checked against its SHA-256',
    'error.webgl': 'This browser has no WebGL2, which the 3D explorer needs.',
    'error.load': 'The world could not be loaded: {m}', 'error.retry': 'Try again',
    'error.webglText': 'A digital world where life arises on its own, seen from above: from the whole world down to the bytes of each program.',
    'legend.data': 'data (any other byte)',
    'source': 'The data come from running the simulation again with the same seed: the history is the recorded one (checked against the SHA-256 of the captures).',
    'live.title': 'Your own world',
    'live.tab.census': 'The census',
    'live.tab.check': 'Check it',
    'live.lead': 'A new world of random bytes, running on your computer with the same simulator and the same laws as the series.',
    'live.seed': 'Seed',
    'live.reseed': 'Another one',
    'live.law': 'Law',
    'live.quiet': 'Quiet',
    'live.current': 'Weak current',
    'live.size': 'Size',
    'live.apply': 'Start a new world',
    'live.run': 'Run it',
    'live.pause': 'Pause it',
    'live.rate': 'Epochs/s',
    'live.start': 'Press ▶ to run it, with {k} threads of your computer',
    'live.paused': 'Paused: press ▶ to go on',
    'live.none': 'No established life yet.',
    'live.established': 'Life became established at epoch {e}.',
    'live.confirmed': 'Confirmed by the census at epoch {c}.',
    'live.census': 'At the census of epoch {e}, {h} of the {s} cells in the sample are heritable replicators ({p}).',
    'live.nocensus': 'The first census is at epoch 250.',
    'live.criterion': 'Life is established when at least 1 % of the sample are heritable replicators in two consecutive censuses: the criterion of the series. The bars below are the censuses.',
    'live.odds': 'It is not born in every world. In preregistered series 1, within 16,000 epochs, it became established in 24 of the 80 quiet worlds and in 34 of the 80 with a weak current. With seed 1006, the one of the planet on the home page, it becomes established at epoch 2,250.',
    'live.try1006': 'Try seed 1006',
    'live.try1006.note': 'In the series, life is born in it at epoch {e}. With a random seed, you will most likely see noise for a long while.',
    'live.eta1006': 'At the current pace, life will be born in it in about {m} min.',
    'live.check.text': 'With the same seed, the simulator makes the same world in the browser and with Node. At epoch {e}, that of the last census, the fingerprint of the world is {f}.',
    'live.check.wait': 'At the first census, at epoch 250, this will show the fingerprint of the world and the command to check it with Node.',
    'live.check.cmd': 'To check it, from a copy of the repository:',
    'live.check.end': 'At the end it prints “empremta del món: {f}” (the fingerprint of the world), and the census of this epoch is this line:',
    'live.foot': 'This is not an experiment: it is your world, and it is not saved anywhere. It runs with the simulator’s files: fase1/bff.js, fase2/world.js and fase2/census.js.',
    'live.inspector': 'Hover over a cell to see its code right now. Click to pin it.',
    'live.now': 'Now, at epoch {e}',
    'live.error': 'The world cannot run in this browser: {m}',
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
// Els elements amb data-i18n="clau" (el text, també el títol de la pàgina), data-i18n-content="clau" (la descripció de la
// pàgina) i data-i18n-title="clau" (el títol i l'etiqueta accessible)
export function apply(root = document) {
  document.documentElement.lang = lang;
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of root.querySelectorAll('[data-i18n-content]')) el.setAttribute('content', t(el.dataset.i18nContent));
  for (const el of root.querySelectorAll('[data-i18n-html]')) el.innerHTML = t(el.dataset.i18nHtml);
  for (const el of root.querySelectorAll('[data-i18n-title]')) { el.title = t(el.dataset.i18nTitle); el.setAttribute('aria-label', el.title); }
  for (const el of root.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
  for (const el of root.querySelectorAll('[data-lang]')) el.setAttribute('aria-pressed', String(el.dataset.lang === lang));
}
