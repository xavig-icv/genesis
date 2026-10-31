// Les imatges de les entrades als visors de la portada (web/img/entrada-*.jpg): els dibuixos de veritat de l'explorador 3D i
// de la vista 2D, sense els controls, en tema clar i fosc. Amb Chrome sense finestra i el protocol de DevTools, sense
// dependències. La càmera 3D es posa directament a la seva posició, i així dues execucions donen els mateixos fitxers, byte
// a byte, amb la mateixa versió de Chrome (web/img/README.md). Mai no sobreescriu cap fitxer.
//
// Cal el servidor engegat a l'arrel del repositori (node server.mjs). Executa:
//   node eines/web-imatges.mjs --chrome CAMI-DE-CHROME --sortida CARPETA [--mon 1006] [--epoca 3500]
//                              [--camera3d 380,108] [--centre2d 200,93] [--url http://localhost:8420/web/]
import { spawn } from 'child_process';
import crypto from 'crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import http from 'http';
import { tmpdir } from 'os';
import { join } from 'path';

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
const FILES = ['entrada-3d-clar.jpg', 'entrada-2d-clar.jpg', 'entrada-3d-fosc.jpg', 'entrada-2d-fosc.jpg'];
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJson = (port, path) => new Promise((resolve, reject) => {
  http.get({ host: '127.0.0.1', port, path }, (r) => {
    let d = '';
    r.on('data', (c) => (d += c));
    r.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
  }).on('error', reject);
});
const status = (url) => new Promise((resolve) => {
  http.get(url, (r) => { r.resume(); resolve(r.statusCode); }).on('error', () => resolve(0));
});

// Un client de WebSocket mínim (RFC 6455): només el que cal per al protocol de DevTools
function connect(url) {
  const u = new URL(url);
  return new Promise((resolve, reject) => {
    const key = crypto.randomBytes(16).toString('base64');
    const req = http.request({ host: u.hostname, port: u.port, path: u.pathname, headers: { Connection: 'Upgrade', Upgrade: 'websocket', 'Sec-WebSocket-Key': key, 'Sec-WebSocket-Version': '13' } });
    req.on('upgrade', (res, socket) => {
      const pending = new Map();
      let buf = Buffer.alloc(0), parts = [], next = 0;
      const frame = (data, op) => {
        const n = data.length, mask = crypto.randomBytes(4);
        let head;
        if (n < 126) head = Buffer.from([0x80 | op, 0x80 | n]);
        else if (n < 65536) head = Buffer.from([0x80 | op, 0x80 | 126, n >> 8, n & 255]);
        else { head = Buffer.alloc(10); head[0] = 0x80 | op; head[1] = 0x80 | 127; head.writeBigUInt64BE(BigInt(n), 2); }
        const body = Buffer.from(data);
        for (let i = 0; i < n; i++) body[i] ^= mask[i & 3];
        socket.write(Buffer.concat([head, mask, body]));
      };
      socket.on('data', (chunk) => {
        buf = Buffer.concat([buf, chunk]);
        for (;;) {
          if (buf.length < 2) return;
          const fin = buf[0] & 0x80, op = buf[0] & 0x0f;
          let len = buf[1] & 0x7f, off = 2;
          if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
          else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
          if (buf.length < off + len) return;
          const payload = buf.subarray(off, off + len);
          buf = buf.subarray(off + len);
          if (op === 0x9) { frame(payload, 0xa); continue; }
          if (op === 0x8 || op === 0xa) continue;
          parts.push(payload);
          if (!fin) continue;
          const msg = JSON.parse(Buffer.concat(parts).toString('utf8'));
          parts = [];
          const p = msg.id && pending.get(msg.id);
          if (p) { pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result); }
        }
      });
      resolve({
        send: (method, params = {}) => new Promise((ok, ko) => { const id = ++next; pending.set(id, { resolve: ok, reject: ko }); frame(Buffer.from(JSON.stringify({ id, method, params })), 0x1); }),
        close: () => socket.destroy(),
      });
    });
    req.on('error', reject);
    req.end();
  });
}

if (await status(`${base}index.html`) !== 200) fail(`el servidor no respon a ${base}: engega node server.mjs a l'arrel del repositori`, 1);
if (await status(`${base}dades/${opt['--mon']}/mon.json`) !== 200) fail(`no hi ha les dades del món ${opt['--mon']} (web/dades/${opt['--mon']})`, 1);

mkdirSync(out, { recursive: true });
// Un perfil d'un sol ús, i el port que triï Chrome (el diu al fitxer DevToolsActivePort del perfil)
const profile = mkdtempSync(join(tmpdir(), 'web-imatges-'));
const chrome = spawn(opt['--chrome'], ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--hide-scrollbars',
  '--window-size=1440,900', 'about:blank'], { stdio: 'ignore' });
let cdp = null;
try {
  let port = 0, target = null;
  for (let i = 0; i < 150 && !target; i++) {
    try {
      if (!port) port = Number(readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]);
      if (port) target = (await getJson(port, '/json/list')).find((t) => t.type === 'page');
    } catch { /* Chrome encara arrenca */ }
    if (!target) await sleep(200);
  }
  if (!target) throw new Error("Chrome no ha obert el protocol de DevTools en 30 s");
  cdp = await connect(target.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  const go = async (url, wait) => { await cdp.send('Page.navigate', { url }); await sleep(wait); };
  const run = async (expression) => (await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.value;
  const theme = (t) => run(`(() => { document.documentElement.dataset.theme = '${t}'; window.dispatchEvent(new CustomEvent('themechange')); return 1; })()`);
  const bare = () => run(`(() => { const s = document.createElement('style'); s.textContent = '.t-left,.t-right,.dock,.hint,.insp,.scale,.state{display:none!important}'; document.head.append(s); return 1; })()`);
  const jpg = async (name) => {
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 86 });
    const bytes = Buffer.from(data, 'base64');
    writeFileSync(join(out, name), bytes, { flag: 'wx' });
    console.log(`${crypto.createHash('sha256').update(bytes).digest('hex')}  ${name}`);
  };
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 560, deviceScaleFactor: 1, mobile: false });
  for (const [t, name] of [['clar', 'light'], ['fosc', 'dark']]) {
    // l'explorador de prop: els taulers i els sòlids, amb la càmera posada directament (sense l'aproximació suau)
    await go(`${base}explorador/?mon=${opt['--mon']}`, 8000);
    await theme(name);
    await bare();
    await run(`(() => { explorador.state.time = ${epoch}; const c = explorador.camera; c.goal.u = ${u3}; c.goal.v = ${v3}; c.goal.d = 13; c.goal.pitch = 0.72; c.goal.yaw = 0.35; Object.assign(c.cur, c.goal); return 1; })()`);
    await sleep(6000);
    await jpg(`entrada-3d-${t}.jpg`);
    // la vista 2D, a 3 píxels per cel·la, amb el centre de la vista a la cel·la del centre
    await go(`${base}2d/?mon=${opt['--mon']}`, 6000);
    await theme(name);
    await bare();
    await run(`(() => { vista2d.state.time = ${epoch}; const { goal } = vista2d; goal.s = 3; goal.x0 = ${x2} - 600 / 3; goal.y0 = ${y2} - 280 / 3; return 1; })()`);
    await sleep(3000);
    await jpg(`entrada-2d-${t}.jpg`);
  }
} catch (e) {
  console.error(`No s'han pogut fer les imatges: ${e.message}`);
  process.exitCode = 1;
} finally {
  if (cdp) cdp.close();
  chrome.kill();
  await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome encara el té obert: és a la carpeta temporal */ }
}
