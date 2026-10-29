// Proves del servidor local. Executa: node test/servidor.mjs
// Arrenca una instància pròpia en un port lliure (PORT=0) i hi fa peticions (casos d'AUD-04 i AUD-12).
import assert from 'assert';
import { spawn } from 'child_process';
import { request } from 'http';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
let PORT = 0;

function get(path, host = `localhost:${PORT}`, port = PORT) {
  return new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port, path, headers: { Host: host } }, (res) => {
      res.resume();
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location }));
    });
    req.on('error', reject);
    req.end();
  });
}

// Arrenca server.mjs des de la carpeta `dir` en un port lliure; retorna el procés i el port
async function start(dir) {
  const proc = spawn(process.execPath, ['server.mjs'], { cwd: dir, env: { ...process.env, PORT: '0' } });
  const port = await new Promise((resolve, reject) => {
    let err = '';
    proc.stderr.on('data', (d) => { err += d; });
    proc.on('exit', (code) => reject(new Error(`el servidor no ha arrencat (codi ${code}): ${err}`)));
    proc.stdout.once('data', (d) => resolve(Number(String(d).match(/localhost:(\d+)/)[1])));
  });
  return { proc, port };
}
const { proc: server, port } = await start(root);
PORT = port;

const tests = {
  'serveix la portada i les pàgines': async () => {
    assert.strictEqual((await get('/')).status, 200);
    assert.strictEqual((await get('/fase2/')).status, 200);
    assert.strictEqual((await get('/fase1/bff.js')).status, 200);
    assert.strictEqual((await get('/quadern/')).status, 200);
    // el lloc web: la portada, l'explorador 3D, la vista 2D i les dades dels mons
    for (const p of ['/web/', '/web/explorador/', '/web/2d/', '/web/js/render.js', '/web/dades/mons.json']) assert.strictEqual((await get(p)).status, 200, p);
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
  "un enllaç simbòlic dins d'una carpeta pública no porta fora (AU2-13)": async () => {
    // Una còpia del servidor en una carpeta temporal, amb fase1/fora enllaçada a una carpeta de fora
    // (a Windows, una "junction", que no necessita permisos d'administrador)
    const tmp = mkdtempSync(join(tmpdir(), 'claude-origins-'));
    let copy = null;
    try {
      mkdirSync(join(tmp, 'web', 'fase1'), { recursive: true });
      mkdirSync(join(tmp, 'secret'));
      copyFileSync(join(root, 'server.mjs'), join(tmp, 'web', 'server.mjs'));
      writeFileSync(join(tmp, 'web', 'fase1', 'index.html'), 'hola');
      writeFileSync(join(tmp, 'secret', 'clau.txt'), 'secret');
      symlinkSync(join(tmp, 'secret'), join(tmp, 'web', 'fase1', 'fora'), 'junction');
      copy = await start(join(tmp, 'web'));
      const host = `localhost:${copy.port}`;
      assert.strictEqual((await get('/fase1/', host, copy.port)).status, 200);
      assert.strictEqual((await get('/fase1/fora/clau.txt', host, copy.port)).status, 404);
    } finally {
      copy?.proc.kill();
      rmSync(tmp, { recursive: true, force: true });
    }
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
