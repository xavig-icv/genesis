// Les imatges del lloc (web/img/): les de les finestres del laboratori de la portada (entrada-*.jpg), els dibuixos de veritat
// de l'explorador 3D i de la vista 2D, sense els controls (la del món en viu és la vista 2D a l'època 1.650, on encara només
// hi ha soroll); i els pòsters del naixement de la capçalera (naixement/TEMA-ÈPOCA.webp), els 7 fotogrames del planeta tal
// com els dibuixa la portada, quiets i sense fons, perquè s'hi vegin el cel i la llum de la pàgina. En tema clar i fosc, amb
// Chrome sense finestra i el protocol de DevTools, sense dependències.
// Les càmeres es posen directament a la seva posició, i cada captura espera que el dibuix hi sigui (el codi carregat i
// dibuixat), no un temps fix: així dues execucions donen els mateixos fitxers, byte a byte, amb la mateixa versió de Chrome,
// encara que la màquina vagi carregada (AUD-167). Al final, les compara amb web/img/SHA256SUMS, i si no hi són iguals, ho
// diu i surt amb el codi 1. Mai no sobreescriu cap fitxer.
//
// Cal el servidor engegat a l'arrel del repositori (node server.mjs). Executa:
//   node eines/web-imatges.mjs --chrome CAMI-DE-CHROME --sortida CARPETA [--mon 1006] [--epoca 3500]
//                              [--camera3d 380,108] [--centre2d 200,93] [--url http://localhost:8420/web/]
import crypto from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { launch, sleep, status } from './cdp.mjs';

const USAGE = 'Ús: node eines/web-imatges.mjs --chrome CAMI-DE-CHROME --sortida CARPETA [--mon 1006] [--epoca 3500] ' +
  '[--camera3d 380,108] [--centre2d 200,93] [--url http://localhost:8420/web/]';
// Els valors per defecte són els de les imatges de web/img/
const OPTIONS = {
  '--chrome': [/^.+$/, null],
  '--sortida': [/^.+$/, null],
  '--mon': [/^\d{1,6}$/, '1006'],
  '--epoca': [/^\d{1,6}$/, '3500'],
  '--camera3d': [/^\d{1,4},\d{1,4}$/, '380,108'],
  '--centre2d': [/^\d{1,4},\d{1,4}$/, '200,93'],
  '--url': [/^http:\/\/(localhost|127\.0\.0\.1):\d{1,5}\/web\/$/, 'http://localhost:8420/web/'],
};
// els fotogrames del naixement, en l'ordre que els passa el botó de la capçalera amb moviment reduït (del pòster, 3.500,
// endavant; després del darrer, torna al primer)
const BIRTH = [3500, 4500, 6000, 1650, 2250, 2500, 3000];
const FILES = ['clar', 'fosc'].flatMap((t) => [`entrada-3d-${t}.jpg`, `entrada-2d-${t}.jpg`, `entrada-viu-${t}.jpg`, ...BIRTH.map((e) => `naixement/${t}-${e}.webp`)]);
const SUMS = fileURLToPath(new URL('../web/img/SHA256SUMS', import.meta.url));
const fail = (msg, code = 2) => { console.error(`${msg}\n${USAGE}`); process.exit(code); };

const args = process.argv.slice(2);
if (args.includes('--help')) { console.log(USAGE); process.exit(0); }
const opt = {};
for (let i = 0; i < args.length; i += 2) {
  const [name, value] = [args[i], args[i + 1]];
  if (!(name in OPTIONS)) fail(`opció desconeguda: ${name}`);
  if (name in opt) fail(`opció repetida: ${name}`);
  if (value === undefined || !OPTIONS[name][0].test(value)) fail(`valor no vàlid per a ${name}: ${value}`);
  opt[name] = value;
}
for (const [name, [, def]] of Object.entries(OPTIONS)) {
  if (!(name in opt)) { if (def === null) fail(`falta ${name}`); opt[name] = def; }
}
if (!existsSync(opt['--chrome'])) fail(`no hi ha Chrome a ${opt['--chrome']}`);
const out = opt['--sortida'];
const taken = FILES.filter((f) => existsSync(join(out, f)));
if (taken.length) fail(`ja existeix ${join(out, taken[0])}: l'eina no sobreescriu res`);
const [u3, v3] = opt['--camera3d'].split(',').map(Number);
const [x2, y2] = opt['--centre2d'].split(',').map(Number);
const epoch = Number(opt['--epoca']);
const base = opt['--url'];

if (await status(`${base}index.html`) !== 200) fail(`el servidor no respon a ${base}: engega node server.mjs a l'arrel del repositori`, 1);
if (await status(`${base}dades/${opt['--mon']}/mon.json`) !== 200) fail(`no hi ha les dades del món ${opt['--mon']} (web/dades/${opt['--mon']})`, 1);

mkdirSync(join(out, 'naixement'), { recursive: true });
let ch = null;
try {
  ch = await launch(opt['--chrome']);
  const cdp = ch, { run, waitFor } = ch;
  const go = async (url, wait) => { await cdp.send('Page.navigate', { url }); await sleep(wait); };
  const theme = (t) => run(`(() => { document.documentElement.dataset.theme = '${t}'; window.dispatchEvent(new CustomEvent('themechange')); return 1; })()`);
  const bare = () => run(`(() => { const s = document.createElement('style'); s.textContent = '.t-left,.t-right,.dock,.hint,.insp,.scale,.state{display:none!important}'; document.head.append(s); return 1; })()`);
  const made = {};
  const jpg = async (name, params = { quality: 86 }, format = 'jpeg') => {
    const { data } = await cdp.send('Page.captureScreenshot', { format, ...params });
    const bytes = Buffer.from(data, 'base64');
    writeFileSync(join(out, name), bytes, { flag: 'wx' });
    made[name] = crypto.createHash('sha256').update(bytes).digest('hex');
    console.log(`${made[name]}  ${name}`);
  };
  for (const [t, name] of [['clar', 'light'], ['fosc', 'dark']]) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 560, deviceScaleFactor: 1, mobile: false });
    // l'explorador de prop: els taulers i els sòlids, amb la càmera posada directament (sense l'aproximació suau), quan el
    // codi de l'època ja hi és dibuixat
    await go(`${base}explorador/?mon=${opt['--mon']}`, 500);
    await waitFor('el món de l\'explorador', 'window.explorador?.state.world?.epochs.length > 0');
    await theme(name);
    await bare();
    await run(`(() => { explorador.state.time = ${epoch}; const c = explorador.camera; c.goal.u = ${u3}; c.goal.v = ${v3}; c.goal.d = 13; c.goal.pitch = 0.72; c.goal.yaw = 0.35; Object.assign(c.cur, c.goal); return 1; })()`);
    await waitFor(`el codi de l'època ${epoch}, dibuixat`, `explorador.shownCode === explorador.state.world.codeEpochAt(${epoch})`);
    await jpg(`entrada-3d-${t}.jpg`);
    // la vista 2D, a 3 píxels per cel·la, amb el centre de la vista a la cel·la del centre, i la càmera posada directament
    await go(`${base}2d/?mon=${opt['--mon']}`, 500);
    await waitFor('el món de la vista 2D', 'window.vista2d?.state.world?.epochs.length > 0');
    await theme(name);
    await bare();
    await run(`(() => { vista2d.state.time = ${epoch}; const { goal, cur } = vista2d; goal.s = 3; goal.x0 = ${x2} - 600 / 3; goal.y0 = ${y2} - 280 / 3; Object.assign(cur, goal); return 1; })()`);
    await waitFor('la vista 2D, quieta', `(() => { const { goal, cur } = vista2d; return cur.s === goal.s && cur.x0 === goal.x0 && cur.y0 === goal.y0; })()`);
    await jpg(`entrada-2d-${t}.jpg`);
    // la del món en viu: la mateixa vista, a l'època 1.650, on encara només hi ha soroll (així comença un món)
    await run('(() => { vista2d.state.time = 1650; return 1; })()');
    await run('new Promise((r) => setTimeout(r, 300))');
    await run('new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(1))))');
    await jpg(`entrada-viu-${t}.jpg`);
    // els 7 fotogrames del naixement: el planeta de la portada, quiet (amb moviment reduït), tal com el dibuixa a 1.440 × 900,
    // sense el fons (transparent), ni el cel, ni l'halo i la vora de CSS, ni els rètols, ni els pòsters de sota
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    const { identifier } = await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: `try { localStorage.setItem('theme', '${name}'); } catch {}` });
    await go(base, 500);
    // dibuixat, amb les fonts ja carregades i el dibuix de la mida del llenç (si la figura ha canviat de mida, s'ha redibuixat)
    const drawn = (e) => `(() => { const c = document.getElementById('hero'), d = Math.min(1.5, devicePixelRatio || 1); return document.fonts.status === 'loaded' && c?.dataset.epoch === '${e}' && c.width === Math.round(c.clientWidth * d) && c.height === Math.round(c.clientHeight * d); })()`;
    await waitFor('el planeta de la portada, dibuixat', drawn(BIRTH[0]));
    await run(`(() => { const s = document.createElement('style'); s.textContent = 'html,body{background:transparent!important}.ob-sky,.ob-planet__halo,.ob-planet__rim,.ob-planet__poster{visibility:hidden!important}'; document.head.append(s); return 1; })()`);
    await cdp.send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
    for (const [k, e] of BIRTH.entries()) {
      // el botó de la capçalera passa al fotograma següent, amb un tall (amb moviment reduït no es reprodueix sol)
      if (k) await run("(() => { document.querySelector('[data-pm=\"birth\"] [data-b=\"toggle\"]').click(); return 1; })()");
      await waitFor(`el fotograma de l'època ${e}, dibuixat`, drawn(e));
      const clip = await run(`(() => { const b = document.getElementById('hero').getBoundingClientRect(); return { x: b.left, y: b.top + scrollY, width: b.width, height: b.height, scale: 1 }; })()`);
      await jpg(`naixement/${t}-${e}.webp`, { quality: 80, clip }, 'webp');
    }
    await cdp.send('Emulation.setDefaultBackgroundColorOverride', {});
    await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier });
    await cdp.send('Emulation.setEmulatedMedia', { features: [] });
  }
  // les SHA-256, comparades amb les de web/img
  const sums = existsSync(SUMS) ? new Map(readFileSync(SUMS, 'utf8').trim().split('\n').map((l) => l.split(/\s+/)).map(([h, f]) => [f, h])) : new Map();
  const diff = FILES.filter((f) => sums.get(f) !== made[f]);
  if (diff.length) {
    console.log(`No són les de web/img: ${diff.join(', ')}. Si el canvi és a propòsit, posa-les a web/img i posa al dia web/img/SHA256SUMS.`);
    process.exitCode = 1;
  } else console.log(`Totes ${FILES.length}, iguals a les de web/img (web/img/SHA256SUMS).`);
} catch (e) {
  console.error(`No s'han pogut fer les imatges: ${e.message}`);
  process.exitCode = 1;
} finally {
  if (ch) await ch.close();
}
