// Chrome sense finestra i el protocol de DevTools, sense dependències: per a les eines que capturen el lloc web
// (eines/web-imatges.mjs i eines/web-animacio.mjs). Un perfil d'un sol ús, el port que triï Chrome i un client de WebSocket
// mínim (RFC 6455), només el que cal per al protocol.
import { spawn } from 'child_process';
import crypto from 'crypto';
import { mkdtempSync, readFileSync, rmSync } from 'fs';
import http from 'http';
import { tmpdir } from 'os';
import { join } from 'path';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const getJson = (port, path) => new Promise((resolve, reject) => {
  http.get({ host: '127.0.0.1', port, path }, (r) => {
    let d = '';
    r.on('data', (c) => (d += c));
    r.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
  }).on('error', reject);
});

// El codi d'estat d'una adreça (0 si no respon)
export const status = (url) => new Promise((resolve) => {
  http.get(url, (r) => { r.resume(); resolve(r.statusCode); }).on('error', () => resolve(0));
});

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

// Engega Chrome sense finestra i hi connecta. Torna { send, run, waitFor, close }:
// - run(expressió): l'avalua a la pàgina (amb await) i en torna el valor;
// - waitFor(què, expressió): espera que l'expressió sigui certa (com a molt 60 s), i després dos fotogrames;
// - close(): tanca la connexió i Chrome, i esborra el perfil.
export async function launch(chromePath, { width = 1440, height = 900 } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'web-chrome-'));
  const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--hide-scrollbars',
    `--window-size=${width},${height}`, 'about:blank'], { stdio: 'ignore' });
  let cdp = null;
  const close = async () => {
    if (cdp) cdp.close();
    chrome.kill();
    await sleep(500);
    try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome encara el té obert: és a la carpeta temporal */ }
  };
  try {
    let port = 0, target = null;
    for (let i = 0; i < 150 && !target; i++) {
      try {
        if (!port) port = Number(readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]);
        if (port) target = (await getJson(port, '/json/list')).find((t) => t.type === 'page');
      } catch { /* Chrome encara arrenca */ }
      if (!target) await sleep(200);
    }
    if (!target) throw new Error('Chrome no ha obert el protocol de DevTools en 30 s');
    cdp = await connect(target.webSocketDebuggerUrl);
    await cdp.send('Page.enable');
  } catch (e) { await close(); throw e; }
  const run = async (expression) => (await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.value;
  const waitFor = async (what, expression) => {
    for (let i = 0; i < 300; i++) { if (await run(expression)) { await run('new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(1))))'); return; } await sleep(200); }
    throw new Error(`en 60 s, no hi ha ${what}`);
  };
  return { send: (m, p) => cdp.send(m, p), run, waitFor, close };
}
