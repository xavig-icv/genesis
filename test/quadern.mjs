// Proves del generador de les taules del quadern (fase2/quadern-serie.mjs, A5 de la iteració 4): amb les
// dades reals de la sèrie de la llei 2, ha de reproduir exactament la taula per llavor i la corba de
// Kaplan–Meier de l'entrada 8. Executa: node test/quadern.mjs
import assert from 'assert';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { readSeries } from '../fase2/estadistica.mjs';
import { seedRows, rowsHtml, kmSvg } from '../fase2/quadern-serie.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const html = readFileSync(join(root, 'quadern', 'index.html'), 'utf8');
const entry8 = html.slice(html.indexOf('<article id="entrada-8">'), html.indexOf('</article>', html.indexOf('<article id="entrada-8">')));
const lines = (s) => s.split('\n').map((l) => l.trim()).filter(Boolean);
const manifest = JSON.parse(readFileSync(join(root, 'fase2', 'serie-llei2.json'), 'utf8'));
const dir = join(root, 'fase2', 'resultats', 'serie-llei2');
const A = readSeries(join(dir, 'A')), B = readSeries(join(dir, 'B'));

const tests = {
  "les taules per llavor són les de l'entrada 8": () => {
    const bodies = [...entry8.matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)].map((m) => lines(m[1]));
    // les dues últimes taules de l'entrada són les per llavor (món quiet i corrent)
    const [tA, tB] = bodies.slice(-2);
    assert.strictEqual(tA.length, 80);
    assert.deepStrictEqual(lines(rowsHtml(seedRows(A, 'A', manifest))), tA);
    assert.deepStrictEqual(lines(rowsHtml(seedRows(B, 'B', manifest))), tB);
  },
  "la corba de Kaplan–Meier és la de l'entrada 8": () => {
    const svg = entry8.slice(entry8.indexOf('<svg class="km"'), entry8.indexOf('</svg>') + '</svg>'.length);
    assert.deepStrictEqual(lines(kmSvg(A, B, { labelA: 'món quiet', labelB: 'corrent 0,01' })), lines(svg));
  },
  "l'etapa de cada llavor surt del manifest": () => {
    const rows = seedRows(A, 'A', manifest);
    assert.strictEqual(rows.find((r) => r.seed === 1050).stage, 1);
    assert.strictEqual(rows.find((r) => r.seed === 1051).stage, 2);
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try { fn(); console.log('  ok  ', name); }
  catch (e) { failed++; console.log('  FALLA', name, '\n       ', e.message.slice(0, 600)); }
}
console.log(failed ? `\n${failed} proves fallades` : '\nTotes les proves han passat');
process.exit(failed ? 1 : 0);
