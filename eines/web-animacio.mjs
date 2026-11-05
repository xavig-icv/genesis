// Una animació d'un món del lloc a l'explorador 3D: una captura per època, amb l'època a la cantonada, i un PNG animat (APNG) amb
// una paleta comuna (eines/png.mjs). Si la primera època i l'última són la mateixa, una sola imatge, en PNG de color sencer (per a
// la previsualització del lloc).
// - Sense cap control de la pàgina: només el dibuix de l'explorador i l'època.
// - La càmera es posa directament a cada fotograma: es mou en línia recta d'u0 a u1, i la resta, quieta.
// - El temps de l'animació de la pàgina (les onades de l'oceà) també es fixa a cada fotograma: dues execucions donen el mateix
//   fitxer, byte a byte, amb la mateixa versió de Chrome i a la mateixa màquina. Les estrelles tenen una llavor fixa.
// - Mai no sobreescriu cap fitxer.
//
// Cal el servidor engegat a l'arrel del repositori (node server.mjs), amb les dades del món (web/dades). Executa:
//   node eines/web-animacio.mjs --chrome CAMI-DE-CHROME --sortida FITXER.png [--mon 1006] [--vista planeta|pla] [--mida 640x480]
//     [--camera U0,U1,V,D,INCLINACIO,GIR] [--epoques DE,A,PAS] [--retard MS] [--darrer MS] [--portada EPOCA] [--colors 256]
//     [--tema fosc|clar] [--url http://localhost:8420/web/]
import crypto from 'crypto';
import { existsSync, writeFileSync } from 'fs';
import { decodePng, encodePng, encodeApngIndexed, paletteOf, toIndices } from './png.mjs';
import { launch, sleep, status } from './cdp.mjs';

const USAGE = 'Ús: node eines/web-animacio.mjs --chrome CAMI-DE-CHROME --sortida FITXER.png [--mon 1006] [--vista planeta|pla] ' +
  '[--mida 640x480] [--camera U0,U1,V,D,INCLINACIO,GIR] [--epoques DE,A,PAS] [--retard MS] [--darrer MS] [--portada EPOCA] ' +
  '[--colors 256] [--tema fosc|clar] [--url http://localhost:8420/web/]';
const NUM = '-?\\d+(\\.\\d+)?';
const OPTIONS = {
  '--chrome': [/^.+$/, null],
  '--sortida': [/^.+\.png$/, null],
  '--mon': [/^\d{1,6}$/, '1006'],
  '--vista': [/^(planeta|pla)$/, 'planeta'],
  '--mida': [/^\d{2,4}x\d{2,4}$/, '640x480'],
  '--camera': [new RegExp(`^${NUM}(,${NUM}){5}$`), '176,336,128,640,1.53,0'],
  '--epoques': [/^\d{1,5},\d{1,5},\d{1,4}$/, '1500,6000,50'],
  '--retard': [/^\d{2,4}$/, '70'],
  '--darrer': [/^\d{2,5}$/, '1800'],
  '--portada': [/^\d{1,5}$/, '3500'],
  '--colors': [/^\d{1,3}$/, '256'],
  '--tema': [/^(fosc|clar)$/, 'fosc'],
  '--url': [/^http:\/\/(localhost|127\.0\.0\.1):\d{1,5}\/web\/$/, 'http://localhost:8420/web/'],
};
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
const [W, H] = opt['--mida'].split('x').map(Number);
const [u0, u1, v, d, pitch, yaw] = opt['--camera'].split(',').map(Number);
const [from, to, step] = opt['--epoques'].split(',').map(Number);
const colors = Number(opt['--colors']), cover = Number(opt['--portada']);
if (!step || to < from || (to - from) % step) fail('--epoques: DE ≤ A, i A − DE ha de ser un múltiple del PAS');
if (colors !== 0 && (colors < 2 || colors > 256)) fail('--colors: de 2 a 256, o 0 per al color sencer');
if (pitch < 0.12 || pitch > 1.53) fail("--camera: la inclinació, de 0,12 a 1,53 (la de l'explorador)");
if (!existsSync(opt['--chrome'])) fail(`no hi ha Chrome a ${opt['--chrome']}`);
const out = opt['--sortida'];
if (existsSync(out)) fail(`ja existeix ${out}: l'eina no sobreescriu res`);
const epochs = [];
for (let e = from; e <= to; e += step) epochs.push(e);
if (epochs.length > 1 && !epochs.includes(cover)) fail(`--portada: ${cover} no és cap de les èpoques`);
const base = opt['--url'], mon = opt['--mon'];

if (await status(`${base}explorador/index.html`) !== 200) fail(`el servidor no respon a ${base}: engega node server.mjs a l'arrel del repositori`, 1);
if (await status(`${base}dades/${mon}/mon.json`) !== 200) fail(`no hi ha les dades del món ${mon} (web/dades/${mon})`, 1);

let ch = null;
try {
  ch = await launch(opt['--chrome'], { width: W, height: H });
  const { run, waitFor } = ch;
  await ch.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  // el tema, i el temps de la pàgina: cada fotograma de requestAnimationFrame rep window.__t (ms), i no el rellotge
  await ch.send('Page.addScriptToEvaluateOnNewDocument', { source: `try { localStorage.setItem('theme', '${opt['--tema'] === 'fosc' ? 'dark' : 'light'}'); } catch {}
    window.__t = 1e7; { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf(() => cb(window.__t)); }` });
  await ch.send('Page.navigate', { url: `${base}explorador/?mon=${mon}` });
  await sleep(500);
  await waitFor("el món de l'explorador", 'window.explorador?.state.world?.epochs.length > 0');
  const known = await run('explorador.state.world.epochs');
  const missing = epochs.filter((e) => !known.includes(e));
  if (missing.length) throw new Error(`el món ${mon} no té les èpoques ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}`);
  // només el llenç, i l'època a la cantonada, amb la lletra monoespaiada del lloc
  await run(`(() => {
    const s = document.createElement('style');
    s.textContent = 'body *{visibility:hidden!important} #view{visibility:visible!important} #anim-epoca{visibility:visible!important;position:fixed;left:18px;bottom:14px;z-index:9;font:600 20px/1 var(--font-mono),monospace;font-variant-numeric:tabular-nums;letter-spacing:.04em;color:#d8dde6;text-shadow:0 1px 2px #000}';
    document.head.append(s);
    const el = document.createElement('div'); el.id = 'anim-epoca'; el.textContent = '0'; document.body.append(el);
    explorador.camera.setPlanet(${opt['--vista'] === 'planeta'}); explorador.state.playing = false; return 1; })()`);
  await waitFor('la lletra del lloc', 'document.fonts.ready.then(() => document.fonts.status === "loaded")');
  const frames = [];
  for (const [k, e] of epochs.entries()) {
    const u = epochs.length > 1 ? u0 + ((u1 - u0) * k) / (epochs.length - 1) : u0;
    await run(`(() => { const s = explorador.state, c = explorador.camera; s.playing = false; s.time = ${e};
      Object.assign(c.goal, { u: ${u}, v: ${v}, d: ${d}, pitch: ${pitch}, yaw: ${yaw}, planet: ${opt['--vista'] === 'planeta' ? 1 : 0} }); Object.assign(c.cur, c.goal);
      window.__t = ${1e7 + k * Number(opt['--retard'])}; document.getElementById('anim-epoca').textContent = '${e}'; return 1; })()`);
    // tres fotogrames amb el mateix temps: el primer posa el món i la càmera, i els altres ja dibuixen el mateix
    await run('new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => r(1)))))');
    const { data } = await ch.send('Page.captureScreenshot', { format: 'png' });
    const im = decodePng(Buffer.from(data, 'base64'));
    if (im.width !== W || im.height !== H) throw new Error(`la captura fa ${im.width} × ${im.height}, i no ${W} × ${H}`);
    frames.push(im.rgb);
    process.stdout.write(k % 10 === 9 || k === epochs.length - 1 ? `${e}\n` : `${e} `);
  }
  let bytes;
  if (frames.length === 1 || colors === 0) {
    if (frames.length > 1) throw new Error('una animació en color sencer seria massa gran: --colors 0 només per a una sola època');
    bytes = encodePng(frames[0], W, H);
  } else {
    const pal = paletteOf(frames, colors), cache = new Map(), idx = frames.map((f) => toIndices(f, pal, cache));
    bytes = encodeApngIndexed(idx, pal, W, H, { delayMs: Number(opt['--retard']), lastMs: Number(opt['--darrer']), cover: idx[epochs.indexOf(cover)] });
  }
  writeFileSync(out, bytes, { flag: 'wx' });
  console.log(`${crypto.createHash('sha256').update(bytes).digest('hex')}  ${out}`);
  console.log(`${frames.length} ${frames.length > 1 ? 'fotogrames' : 'imatge'}, ${W} × ${H}, ${(bytes.length / 1e6).toFixed(2)} MB`);
} catch (e) {
  console.error(`No s'ha pogut fer l'animació: ${e.message}`);
  process.exitCode = 1;
} finally {
  if (ch) await ch.close();
}
