// Servidor estàtic mínim (sense dependències) per obrir el projecte al navegador.
// Ús: node server.mjs  ->  http://localhost:8420  (o PORT=8500 node server.mjs)
//
// Només escolta a 127.0.0.1 i només serveix el que necessiten les pàgines web: la portada i les
// carpetes fase1/, fase2/, quadern/ i web/ (el lloc web). Mai no serveix fitxers ni carpetes que comencin per punt
// (.git, .claude…). Comprova la capçalera Host perquè una web externa no hi pugui accedir amb un
// canvi de DNS ("DNS rebinding"). Vegeu AUD-04 i AUD-12 de l'auditoria 1. Un enllaç simbòlic no pot
// portar fora de les carpetes públiques (AU2-13 de l'auditoria externa 2).
import { createServer } from 'http';
import { readFile, stat, realpath } from 'fs/promises';
import { realpathSync } from 'fs';
import { extname, join, normalize, relative, resolve, sep } from 'path';
import { fileURLToPath } from 'url';

const ROOT = realpathSync(resolve(fileURLToPath(new URL('.', import.meta.url))));
const PORT = Number(process.env.PORT ?? 8420); // 0: el sistema tria un port lliure (per a les proves)
const PUBLIC = new Set(['index.html', 'fase1', 'fase2', 'quadern', 'web']);
let HOSTS = new Set();
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function reply(res, status, text, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  res.end(text);
}

const server = createServer(async (req, res) => {
  if (!HOSTS.has(req.headers.host ?? '')) return reply(res, 403, 'Prohibit');
  if (req.method !== 'GET' && req.method !== 'HEAD') return reply(res, 405, 'Mètode no permès', { Allow: 'GET, HEAD' });

  let path;
  try {
    path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    return reply(res, 400, 'Adreça mal codificada');
  }

  const parts = path.split('/').filter(Boolean);
  if (parts.some((p) => p.startsWith('.'))) return reply(res, 404, 'No trobat');
  if (parts.length && !PUBLIC.has(parts[0])) return reply(res, 404, 'No trobat');

  let file = normalize(join(ROOT, ...parts));
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return reply(res, 404, 'No trobat');

  try {
    if ((await stat(file)).isDirectory()) {
      if (!path.endsWith('/')) return reply(res, 301, '', { Location: `${path}/` });
      file = join(file, 'index.html');
    }
    // El camí real (sense enllaços) també ha de ser dins d'una carpeta pública
    const real = relative(ROOT, await realpath(file)).split(sep);
    if (!PUBLIC.has(real[0]) || real.some((p) => p === '..' || p.startsWith('.'))) return reply(res, 404, 'No trobat');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    reply(res, 404, 'No trobat');
  }
});
server.listen(PORT, '127.0.0.1', () => {
  const port = server.address().port;
  HOSTS = new Set([`localhost:${port}`, `127.0.0.1:${port}`, `[::1]:${port}`]);
  console.log(`Servint ${ROOT} a http://localhost:${port}`);
});
