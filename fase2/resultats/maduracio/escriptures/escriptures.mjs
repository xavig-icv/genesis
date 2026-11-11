// Exploratori (la maduració, pas 2a; la nota, README.md): qui escriu els bytes que s'acumulen. A cada sopa, 10⁵ parelles de veïns de
// debò (radi 2), executades una vegada amb traca.mjs (comprovat contra fase1/bff.js: prova-traca-sortida.txt). No simula cap món.
//   node escriptures.mjs CARPETA-SERIE CARPETA-1034 [--parelles N] [--prova] > escriptures-sortida.txt
// CARPETA-SERIE: l'arrel de la còpia on hi ha les captures de la sèrie de la maduració (envelliment/captures i alicuotes/MÓN/*.bin).
// Escriu també escriptures.jsonl (una línia per sopa, amb la SHA-256). --prova: dues sopes de cada grup i 2.000 parelles.
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { OPCODES } from '../../../../fase1/bff.js';
import { makeRng } from '../../../../fase1/soup.js';
import { windowsOf, hasWindow } from '../../../replication.js';
import { evaluateTraced, neighbourPair } from './traca.mjs';

const here = dirname(fileURLToPath(import.meta.url)), root = join(here, '../../../..');
const args = process.argv.slice(2), prova = args.includes('--prova');
const k = args.indexOf('--parelles'), PAIRS = prova ? 2000 : k >= 0 ? Number(args[k + 1]) : 100000;
const [serie, dir1034] = args.filter((a, i) => !a.startsWith('--') && (k < 0 || i !== k + 1));
if (!serie || !dir1034 || !(PAIRS > 0)) { console.error('Ús: node escriptures.mjs CARPETA-SERIE CARPETA-1034 [--parelles N] [--prova]'); process.exit(2); }
const OPS = [...OPCODES].map((c) => c.charCodeAt(0)), isOp = new Uint8Array(256);
for (const b of OPS) isOp[b] = 1;
const LT = 60, COMMA = 44, TYPES = ['.same', '.cross', ',same', ',cross', '+', '-'];
const sha = (b) => createHash('sha256').update(b).digest('hex');
const count = (t, a, b) => { let n = 0; for (let i = a; i < b; i++) n += isOp[t[i]]; return n; };

// Les sopes: la cohort de la sèrie (envellides, barrejades i noves, comprovades amb el manifest) i el 1034 al llarg del temps
const manifest = JSON.parse(readFileSync(join(root, 'fase2/resultats/maduracio/serie/manifest.json'), 'utf8'));
let cohort = manifest.worlds.filter((w) => w.included);
if (prova) cohort = cohort.slice(0, 2);
const soups = [];
for (const w of cohort) {
  soups.push({ group: 'envellida', id: w.world, file: join(serie, w.capture), sha256: w.captureSha256 });
  soups.push({ group: 'barrejada', id: w.world, file: join(serie, w.arms['shuffle-all'].file), sha256: w.arms['shuffle-all'].sha256 });
  soups.push({ group: 'nova', id: w.world, file: join(serie, w.arms.reinit.file), sha256: w.arms.reinit.sha256 });
}
const epochs = prova ? [100, 8000] : [100, ...Array.from({ length: 32 }, (_, i) => 500 * (i + 1))];
for (const e of epochs) soups.push({ group: '1034', id: String(e), file: join(dir1034, `llavor1034-mon512x256-r2-epoca${e}.bin`), sha256: null });

function analyse(soup, seed) {
  const buf = readFileSync(soup.file), h = sha(buf);
  if (soup.sha256 && h !== soup.sha256) throw new Error(`${basename(soup.file)}: la SHA-256 no és la del manifest`);
  const rng = makeRng(seed, 'v2'), created = {}, destroyed = {}, tape = new Uint8Array(128);
  for (const b of [...OPS, 0]) { created[b] = Object.fromEntries(TYPES.map((t) => [t, 0])); destroyed[b] = Object.fromEntries(TYPES.map((t) => [t, 0])); }
  let ltFirst = 0, ltMotif = 0, copies = 0, inRuns = 0, copy16 = 0, n = 0, s1 = 0, s2 = 0, t1 = 0, t2 = 0;
  for (let p = 0; p < PAIRS; p++) {
    const [c, d] = neighbourPair(rng, 512, 256);
    tape.set(buf.subarray(c * 64, c * 64 + 64), 0); tape.set(buf.subarray(d * 64, d * 64 + 64), 64);
    const first = tape[0] === LT, motif = first && tape[1] === COMMA, set = windowsOf(tape.slice(0, 64));
    const before = [count(tape, 0, 64), count(tape, 64, 128)];
    let run = 0, last = null;
    const flush = () => { if (run >= 8) inRuns += run; run = 0; };
    evaluateTraced(tape, 0, (op, pos, b, a, src) => {
      const type = op === '+' || op === '-' ? op : op + ((pos < 64) === (src < 64) ? 'same' : 'cross');
      if (a !== b) {
        if (created[a]) created[a][type]++;
        if (destroyed[b]) destroyed[b][type]++;
        if (a === LT) { if (first) ltFirst++; if (motif) ltMotif++; }
      }
      if (src >= 0) {
        copies++;
        if (last && last.op === op && ((pos - last.pos) & 127) === ((src - last.src) & 127) && Math.abs(((pos - last.pos + 64) & 127) - 64) === 1) run++;
        else { flush(); run = 1; }
        last = { op, pos, src };
      } else { flush(); last = null; }
    });
    flush();
    const after = [count(tape, 0, 64), count(tape, 64, 128)];
    for (let i = 0; i < 2; i++) { n++; s1 += before[i]; s2 += before[i] ** 2; t1 += after[i]; t2 += after[i] ** 2; }
    if (set.size && hasWindow(tape.subarray(64, 128), set)) copy16++;
  }
  const varB = s2 / n - (s1 / n) ** 2, varA = t2 / n - (t1 / n) ** 2;
  return { group: soup.group, id: soup.id, file: basename(soup.file), sha256: h, seed, pairs: PAIRS, created, destroyed, ltFirst, ltMotif,
    copies, inRuns, copy16, mean: [s1 / n, t1 / n], variance: [varB, varA] };
}

const out = [];
soups.forEach((s, i) => { out.push(analyse(s, 940100 + i)); });
writeFileSync(join(here, prova ? 'escriptures-prova.jsonl' : 'escriptures.jsonl'), out.map((o) => JSON.stringify(o)).join('\n') + '\n');

// L'informe: per grup (la mitjana de les sopes) i, per al 1034, per època
const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
const copyTypes = ['.same', '.cross', ',same', ',cross'];
function row(rs) {
  const per = (x) => (1000 * x) / (rs.length * PAIRS);                         // per 1.000 parelles
  const ltC = rs.reduce((a, r) => a + sum(r.created[LT]), 0), ltD = rs.reduce((a, r) => a + sum(r.destroyed[LT]), 0);
  const ltCopy = rs.reduce((a, r) => a + copyTypes.reduce((b, t) => b + r.created[LT][t], 0), 0);
  const ltArit = rs.reduce((a, r) => a + r.created[LT]['+'] + r.created[LT]['-'], 0);
  const insC = rs.reduce((a, r) => a + OPS.reduce((b, v) => b + sum(r.created[v]), 0), 0);
  const insCopy = rs.reduce((a, r) => a + OPS.reduce((b, v) => b + copyTypes.reduce((c, t) => c + r.created[v][t], 0), 0), 0);
  const insD = rs.reduce((a, r) => a + OPS.reduce((b, v) => b + sum(r.destroyed[v]), 0), 0);
  const copies = rs.reduce((a, r) => a + r.copies, 0), inRuns = rs.reduce((a, r) => a + r.inRuns, 0);
  const m0 = rs.reduce((a, r) => a + r.mean[0], 0) / rs.length, m1 = rs.reduce((a, r) => a + r.mean[1], 0) / rs.length;
  const v0 = rs.reduce((a, r) => a + r.variance[0], 0) / rs.length, v1 = rs.reduce((a, r) => a + r.variance[1], 0) / rs.length;
  const disp = (m, v) => v / (m * (1 - m / 64));
  return {
    lt: `'<' fets ${per(ltC).toFixed(1)}, desfets ${per(ltD).toFixed(1)}, net ${per(ltC - ltD).toFixed(1)}; dels fets, per còpia ${(100 * ltCopy / ltC).toFixed(1)} %, amb + o - ${(100 * ltArit / ltC).toFixed(1)} %; en parelles que comencen amb '<' ${(100 * rs.reduce((a, r) => a + r.ltFirst, 0) / ltC).toFixed(1)} %, amb '<,' ${(100 * rs.reduce((a, r) => a + r.ltMotif, 0) / ltC).toFixed(1)} %`,
    ins: `instruccions fetes ${per(insC).toFixed(1)}, desfetes ${per(insD).toFixed(1)}, net ${per(insC - insD).toFixed(1)}; de les fetes, per còpia ${(100 * insCopy / insC).toFixed(1)} %`,
    runs: `còpies ${per(copies).toFixed(1)}, de les quals en tirades de 8 o més ${(100 * inRuns / copies).toFixed(1)} %`,
    disp: `instruccions per programa ${m0.toFixed(3)} -> ${m1.toFixed(3)}; dispersió ${disp(m0, v0).toFixed(3)} -> ${disp(m1, v1).toFixed(3)}`,
    copy16: `parelles amb 16 bytes del primer programa al company ${(100 * rs.reduce((a, r) => a + r.copy16, 0) / (rs.length * PAIRS)).toFixed(3)} %`,
    ltCopyShare: ltCopy / ltC, ltFirstShare: rs.reduce((a, r) => a + r.ltFirst, 0) / ltC, dispDelta: disp(m1, v1) - disp(m0, v0),
  };
}
console.log(`QUI ESCRIU ELS BYTES QUE S'ACUMULEN (pas 2a, exploratori${prova ? '; PROVA CURTA' : ''}): ${PAIRS} parelles per sopa, executades una vegada`);
console.log("Per 1.000 parelles, la mitjana de les sopes de cada grup. 'Fets': escriptures que posen el byte on no hi era; 'desfets': que el treuen.");
const G = {};
for (const g of ['envellida', 'barrejada', 'nova']) {
  const rs = out.filter((r) => r.group === g), x = (G[g] = row(rs));
  console.log(`\n${g} (${rs.length} sopes):\n  ${x.lt}\n  ${x.ins}\n  ${x.runs}\n  ${x.disp}\n  ${x.copy16}`);
}
console.log('\nEl món 1034 al llarg del temps:');
for (const r of out.filter((o) => o.group === '1034')) { const x = row([r]); console.log(`  ${r.id.padStart(5)}: ${x.lt}\n         ${x.disp}; ${x.copy16}`); }
const e = out.filter((r) => r.group === 'envellida'), b = new Map(out.filter((r) => r.group === 'barrejada').map((r) => [r.id, r]));
const higher = e.filter((r) => r.copy16 > b.get(r.id).copy16).length, equal = e.filter((r) => r.copy16 === b.get(r.id).copy16).length;
console.log('\nEls quatre criteris de la nota (§5):');
console.log(`  1. '<' nous per còpia, a la sopa envellida: ${(100 * G.envellida.ltCopyShare).toFixed(1)} % (cau si és menys del 50 %)`);
console.log(`  2. '<' nous en parelles que comencen amb '<', a la sopa envellida: ${(100 * G.envellida.ltFirstShare).toFixed(1)} % (cau si és menys del 20 %)`);
console.log(`  3. el canvi de la dispersió en una ronda: envellida ${G.envellida.dispDelta.toFixed(4)}, nova ${G.nova.dispDelta.toFixed(4)} (cau si no creix a cap de les dues)`);
console.log(`  4. les còpies de 16 bytes, món a món: més a l'envellida que a la barrejada a ${higher} mons, iguals a ${equal}, menys a ${e.length - higher - equal}`);
