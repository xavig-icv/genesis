// Proves del servidor local. Executa: node test/servidor.mjs
// Arrenca una instància pròpia en un port lliure (PORT=0) i hi fa peticions (casos d'AUD-04 i AUD-12).
import assert from 'assert';
import { spawn } from 'child_process';
import { request } from 'http';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
let PORT = 0;

function get(path, host = `localhost:${PORT}`) {
  return new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port: PORT, path, headers: { Host: host } }, (res) => {
      res.resume();
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location }));
    });
    req.on('error', reject);
    req.end();
  });
}

const server = spawn(process.execPath, ['server.mjs'], { cwd: root, env: { ...process.env, PORT: '0' } });
PORT = await new Promise((resolve, reject) => {
  let err = '';
  server.stderr.on('data', (d) => { err += d; });
  server.on('exit', (code) => reject(new Error(`el servidor no ha arrencat (codi ${code}): ${err}`)));
  server.stdout.once('data', (d) => resolve(Number(String(d).match(/localhost:(\d+)/)[1])));
});

const tests = {
  'serveix la portada i les pàgines': async () => {
    assert.strictEqual((await get('/')).status, 200);
    assert.strictEqual((await get('/fase2/')).status, 200);
    assert.strictEqual((await get('/fase1/bff.js')).status, 200);
    assert.strictEqual((await get('/quadern/')).status, 200);
  },
  'una adreça mal codificada dona 400 i el servidor no cau (AUD-04)': async () => {
    assert.strictEqual((await get('/%E0%A4%A')).status, 400);
    assert.strictEqual((await get('/')).status, 200);
  },
  'no serveix fitxers interns (AUD-12)': async () => {
    for (const p of ['/.claude/launch.json', '/.git/config', '/fase1/.hidden', '/sim.mjs', '/docs/disseny.md', '/CLAUDE.md']) {
      assert.strictEqual((await get(p)).status, 404, p);
    }
  },
  'no deixa sortir de la carpeta del projecte': async () => {
    assert.strictEqual((await get('/fase1/../../../Windows/win.ini')).status, 404);
    assert.strictEqual((await get('/%2e%2e/%2e%2e/etc/passwd')).status, 404);
  },
  'rebutja peticions amb un Host estrany (DNS rebinding)': async () => {
    assert.strictEqual((await get('/', 'evil.example:80')).status, 403);
  },
  'redirigeix les carpetes sense barra final': async () => {
    const r = await get('/fase1');
    assert.strictEqual(r.status, 301);
    assert.strictEqual(r.location, '/fase1/');
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { await fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message); }
}
server.kill();
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
