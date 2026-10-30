// Les dades d'un món de l'explorador (les escriu eines/web-dades.mjs): la fitxa amb els fotogrames i les famílies
// (mon.json), els mapes de tots els fotogrames (mapes.z) i el codi d'algunes èpoques (codi/E.z). Cada fitxer es
// comprova amb la seva SHA-256 de mon.json abans de fer-lo servir.
async function inflate(buffer) {
  const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('deflate'));
  return new Response(stream).arrayBuffer();
}
async function sha256(buffer) {
  if (!globalThis.crypto?.subtle) return null; // fora d'un context segur (file://), no es pot comprovar
  const h = await crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function fetchChecked(url, expected) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  const buf = await r.arrayBuffer(), got = await sha256(buf);
  if (got !== null && got !== expected) throw new Error(`${url} no té la SHA-256 de mon.json`);
  return { buf, checked: got !== null };
}

export async function loadWorld(base) {
  const r = await fetch(`${base}/mon.json`);
  if (!r.ok) throw new Error(`${base}/mon.json: ${r.status}`);
  const meta = await r.json();
  const [W, H] = meta.mida, n = W * H;
  const { buf, checked } = await fetchChecked(`${base}/${meta.mapes.fitxer}`, meta.mapes.sha256);
  const maps = new Uint8Array(await inflate(buf));
  if (maps.length !== meta.fotogrames.length * 2 * n) throw new Error('els mapes no tenen la mida dels fotogrames');
  const families = new Map(meta.families.map((f) => [f.id, f]));
  const codeCache = new Map();
  const world = {
    meta, W, H, n, checked, families,
    epochs: meta.fotogrames.map((f) => f.e),
    fam: (i) => maps.subarray(i * 2 * n, i * 2 * n + n),
    k: (i) => maps.subarray(i * 2 * n + n, (i + 1) * 2 * n),
    // el mapa de dues capes d'un fotograma (família i instruccions), per a una textura RG8UI
    rg(i, out) {
      const f = this.fam(i), k = this.k(i);
      for (let c = 0; c < n; c++) { out[2 * c] = f[c]; out[2 * c + 1] = k[c]; }
      return out;
    },
    // la paleta d'un fotograma: l'índex de la família a la llista del fotograma (1, 2...) → el seu color, el de la seva
    // posició a la paleta del tema (colors, 12 [r, g, b] de 0 a 1)
    palette(i, colors, out = new Uint8Array(256 * 4)) {
      out.fill(0);
      meta.fotogrames[i].f.forEach((id, j) => {
        const c = colors[families.get(id).paleta % colors.length];
        out.set([c[0] * 255, c[1] * 255, c[2] * 255, 255], (j + 1) * 4);
      });
      return out;
    },
    familyAt(i, cell) { const j = this.fam(i)[cell]; return j ? families.get(meta.fotogrames[i].f[j - 1]) : null; },
    // les èpoques amb codi, i la més propera que no passi de e
    codeEpochs: Object.keys(meta.codiFitxers ?? {}).map(Number).sort((a, b) => a - b),
    codeEpochAt(e) { let best = null; for (const c of this.codeEpochs) if (c <= e) best = c; return best; },
    async code(e) {
      if (codeCache.has(e)) return codeCache.get(e);
      const p = (async () => {
        const f = meta.codiFitxers[e];
        const { buf } = await fetchChecked(`${base}/${f.fitxer}`, f.sha256);
        const raw = await inflate(buf);
        if (raw.byteLength !== n * 64) throw new Error(`el codi de l'època ${e} no té la mida del món`);
        return new Uint8Array(raw);
      })();
      codeCache.set(e, p);
      // no se'n guarden més de 8
      while (codeCache.size > 8) codeCache.delete(codeCache.keys().next().value);
      return p;
    },
  };
  return world;
}
