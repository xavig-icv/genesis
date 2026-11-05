// B1, el nivell 1: comprovacions exploratòries, escrites després de l'anàlisi (05-11-2026), per al quadern (l'entrada 15).
// No són part del pla: no decideixen res.
//   node fase2/resultats/b1/nivell1/exploratori/explora.mjs fase2/resultats/b1/nivell1/registres
// 1. Els totals de la línia final de cada registre: hereditaris sols, en context, i tots dos.
// 2. Amb bytes uniformes, els hereditaris de C0: quantes instruccions tenen, i si són sols o en context. Un programa amb menys de 5
//    instruccions no pot tenir un bucle de còpia propi: en calen `[`, `]`, una còpia (`.` o `,`) i moure tots dos caps (`<` o `>`, i
//    `{` o `}`). Sense bucle, cada instrucció s'executa com a molt un cop, i copiar 16 bytes en demana 16 de còpia.
// 3. Amb D½, els hereditaris de C0, H64 i S1 amb menys instruccions.
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const dir = process.argv[2];
const INSTR = new Set([...'<>{}-+.,[]'].map((c) => c.charCodeAt(0)));
const nInstr = (hex) => Buffer.from(hex, 'hex').reduce((s, b) => s + (INSTR.has(b) ? 1 : 0), 0);
const text = (hex) => [...Buffer.from(hex, 'hex')].map((b) => (INSTR.has(b) ? String.fromCharCode(b) : b === 0 ? '0' : '·')).join('');

const read = (f) => readFileSync(join(dir, f), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
console.log('1. Els totals (de la línia final): hereditaris, sols, en context, tots dos; es repliquen');
for (const f of readdirSync(dir).filter((x) => x.endsWith('.jsonl')).sort()) {
  const ls = read(f), end = ls[ls.length - 1];
  const both = end.heritableSolo + end.heritableContext - end.heritable;
  console.log(`  ${f.replace('.jsonl', '').padEnd(12)} ${String(end.heritable).padStart(6)} ${String(end.heritableSolo).padStart(6)} ${String(end.heritableContext).padStart(6)} ${String(both).padStart(5)}  ${end.replicates}`);
}

const her = (f) => read(f).filter((o) => o.type === 'replicator' && (o.heritableSolo || o.heritableContext));
console.log('\n2. Amb bytes uniformes, els hereditaris de C0: instruccions, sol/context, i el programa (· = byte sense efecte, 0 = el zero)');
const u = her('uniforme-C0.jsonl').map((o) => ({ ...o, k: nInstr(o.bytes) })).sort((a, b) => a.k - b.k);
const hist = {};
for (const o of u) hist[o.k] = (hist[o.k] ?? 0) + 1;
console.log(`  instruccions → quants: ${JSON.stringify(hist)}`);
const few = u.filter((o) => o.k < 5);
console.log(`  amb menys de 5 instruccions: ${few.length} de ${u.length} (${few.filter((o) => o.heritableSolo).length} sols, ${few.filter((o) => o.heritableContext).length} en context)`);
for (const o of u.slice(0, 8)) console.log(`  ${String(o.index).padStart(8)} k=${String(o.k).padStart(2)} ${o.heritableSolo ? 'sol' : '   '} ${o.heritableContext ? 'context' : '       '} ${text(o.bytes)}`);

console.log('\n3. Amb D½, els hereditaris amb menys instruccions');
for (const f of ['d-mig-C0.jsonl', 'd-mig-H64.jsonl', 'd-mig-S1.jsonl']) {
  const h = her(f).map((o) => ({ ...o, k: nInstr(o.bytes) })).sort((a, b) => a.k - b.k);
  console.log(`  ${f}: ${h.length} hereditaris; els 3 amb menys instruccions:`);
  for (const o of h.slice(0, 3)) console.log(`    ${String(o.index).padStart(8)} k=${o.k} ${o.heritableSolo ? 'sol' : '   '} ${o.heritableContext ? 'context' : '       '} ${text(o.bytes)}`);
}
