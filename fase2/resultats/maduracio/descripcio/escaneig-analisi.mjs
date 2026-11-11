// Exploratori (la maduració, pas 1, l'afegit): l'anàlisi de l'escaneig del món 1034 al llarg del temps (escaneig-1034.jsonl): quantes
// cel·les es repliquen i quantes són hereditàries a cada època, quant duren i de què estan fetes. Amb la carpeta de les captures, mira
// també si el programa d'una cel·la que es replica continua igual a les captures següents, i ho compara amb una cel·la qualsevol.
//   node escaneig-analisi.mjs [CARPETA-DEL-1034] > escaneig-analisi-sortida.txt
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { median, mean } from './comu.mjs';

const here = dirname(fileURLToPath(import.meta.url)), dir = process.argv[2];
const scans = readFileSync(join(here, 'escaneig-1034.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const at = new Map(scans.map((s) => [s.epoch, s]));
const OPS = '<>{}-+.,[]';
const ops = (hex) => [...Buffer.from(hex, 'hex')].map((b) => String.fromCharCode(b)).filter((c) => OPS.includes(c)).join('');
const f = (x, d = 1) => x.toFixed(d);

console.log(`L'ESCANEIG DEL MÓN 1034 (quiet, sense vida): ${scans.length} captures, de l'època ${scans[0].epoch} a la ${scans[scans.length - 1].epoch}`);
console.log('\n1. Quantes cel·les es repliquen (de 131.072), a cada captura dels primers 1.000 passos i després per franges');
console.log('   època: es repliquen (soles / només en context); hereditàries (soles)');
for (const s of scans.filter((x) => x.epoch <= 1000)) console.log(`   ${String(s.epoch).padStart(5)}: ${s.replicating} (${s.list.filter((x) => x.solo).length} / ${s.list.filter((x) => !x.solo).length}); ${s.heritable} (${s.heritableSolo})`);
console.log('   franja: captures; cel·les que es repliquen, mitjana (mínim a màxim), de les quals soles; captures amb alguna hereditària; hereditàries en total');
for (const [a, b] of [[0, 500], [500, 1000], [1000, 2000], [2000, 4000], [4000, 8000], [8000, 12000], [12000, 16000]]) {
  const v = scans.filter((s) => s.epoch > a && s.epoch <= b);
  if (!v.length) continue;
  console.log(`   de ${String(a).padStart(5)} a ${String(b).padStart(5)}: ${String(v.length).padStart(2)}; ${f(mean(v.map((s) => s.replicating)))} (${Math.min(...v.map((s) => s.replicating))} a ${Math.max(...v.map((s) => s.replicating))}), soles ${f(mean(v.map((s) => s.list.filter((x) => x.solo).length)))}; ${v.filter((s) => s.heritable > 0).length}; ${v.reduce((n, s) => n + s.heritable, 0)}`);
}

console.log('\n2. Quant duren: d\'una captura a la següent (100 èpoques), les cel·les que es replicaven');
console.log('   franja: cel·les que es replicaven; a la captura següent, la mateixa cel·la encara es replica; amb el mateix programa (dins de les que encara es repliquen)');
for (const [a, b] of [[0, 1000], [1000, 4000], [4000, 8000], [8000, 16000]]) {
  let n = 0, still = 0, same = 0;
  for (const s of scans) {
    if (s.epoch <= a || s.epoch > b || !at.has(s.epoch + 100)) continue;
    const next = new Map(at.get(s.epoch + 100).list.map((x) => [x.c, x]));
    for (const x of s.list) { n++; if (next.has(x.c)) { still++; if (next.get(x.c).program === x.program) same++; } }
  }
  console.log(`   de ${String(a).padStart(5)} a ${String(b).padStart(5)}: ${n}; ${still} (${f(100 * still / n)} %); ${same}`);
}

console.log('\n3. Les hereditàries: totes les que surten, amb les instruccions del programa (sense les dades)');
const her = scans.flatMap((s) => s.list.filter((x) => x.heritable).map((x) => ({ ...x, epoch: s.epoch })));
console.log(`   ${her.length} en ${scans.length} captures (${scans.filter((s) => s.heritable > 0).length} captures amb alguna); soles, ${her.filter((x) => x.heritableSolo).length}`);
for (const x of her) {
  let life = 0; while (at.has(x.epoch + 100 * (life + 1)) && at.get(x.epoch + 100 * (life + 1)).list.some((y) => y.c === x.c && y.heritable)) life++;
  const before = at.has(x.epoch - 100) && at.get(x.epoch - 100).list.some((y) => y.c === x.c && y.heritable);
  if (!before) console.log(`   època ${String(x.epoch).padStart(5)}, cel·la ${String(x.c).padStart(6)}: ${x.heritableSolo ? 'sola' : 'en context'}; hereditària també a ${life} captures següents; instruccions (${ops(x.program).length}): ${ops(x.program)}`);
}

// 4. Amb les captures: el programa d'una cel·la que es replica, continua igual 100 èpoques després? I el d'una cel·la qualsevol?
if (dir) {
  console.log('\n4. El programa, 100 èpoques després (amb les captures): igual byte a byte, a la mateixa cel·la');
  console.log('   franja: totes les cel·les, % amb el programa igual; les que es replicaven, quantes i % amb el programa igual; les que es replicaven soles, %');
  const name = (e) => join(dir, `llavor1034-mon512x256-r2-epoca${e}.bin`);
  const rows = [];
  let prev = null;
  for (const s of scans) {
    const cur = existsSync(name(s.epoch)) ? readFileSync(name(s.epoch)) : null;
    if (prev && cur && at.has(s.epoch - 100)) {
      let all = 0;
      for (let c = 0; c < cur.length / 64; c++) if (cur.compare(prev, c * 64, (c + 1) * 64, c * 64, (c + 1) * 64) === 0) all++;
      const list = at.get(s.epoch - 100).list, eq = (x) => cur.compare(Buffer.from(x.program, 'hex'), 0, 64, x.c * 64, (x.c + 1) * 64) === 0;
      rows.push({ epoch: s.epoch - 100, all: all / (cur.length / 64), n: list.length, same: list.filter(eq).length, solo: list.filter((x) => x.solo).length, soloSame: list.filter((x) => x.solo && eq(x)).length });
    }
    prev = cur;
  }
  for (const [a, b] of [[0, 1000], [1000, 4000], [4000, 8000], [8000, 16000]]) {
    const v = rows.filter((r) => r.epoch > a && r.epoch <= b);
    if (!v.length) continue;
    const n = v.reduce((t, r) => t + r.n, 0), same = v.reduce((t, r) => t + r.same, 0), solo = v.reduce((t, r) => t + r.solo, 0), soloSame = v.reduce((t, r) => t + r.soloSame, 0);
    console.log(`   de ${String(a).padStart(5)} a ${String(b).padStart(5)}: ${f(100 * mean(v.map((r) => r.all)))} %; ${n}, ${f(100 * same / n)} %; ${solo ? f(100 * soloSame / solo) : '—'} %`);
  }
}
