// L'exploració de la fragilitat del món (AUD-107), tal com la descriu fase2/resultats/b2/fragilitat/PLA.md, escrit
// abans de calcular-la: per a cada món del banc de la llei 2, les propietats de la captura de l'establiment (t) i dels
// censos d'abans, i la comparació dels mons B fràgils (menys de l'1 % d'hereditaris a t + 1.000 a la història
// original) amb els altres mons B. No simula res.
//
//   node eines/fragilitat.mjs [--json fitxer]
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (f) => readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const lossR2 = (cs) => { for (let i = 0; i + 1 < cs.length; i++) if (cs[i].heritable <= 5 && cs[i + 1].heritable <= 5) return true; return false; };
const median = (v) => { const s = [...v].sort((a, b) => a - b), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };

// la prova exacta de permutació de Mann–Whitney (rangs mitjans), bilateral: totes les maneres de triar el grup petit
export function mannWhitney(a, b) {
  const all = [...a.map((v) => [v, 0]), ...b.map((v) => [v, 1])].sort((x, y) => x[0] - y[0]);
  const rank = new Array(all.length);
  for (let i = 0; i < all.length;) {
    let j = i; while (j + 1 < all.length && all[j + 1][0] === all[i][0]) j++;
    for (let k = i; k <= j; k++) rank[k] = (i + j) / 2 + 1;
    i = j + 1;
  }
  const r = rank, n = all.length, k = a.length;
  const obs = all.reduce((s, x, i) => s + (x[1] === 0 ? r[i] : 0), 0), mid = (k * (n + 1)) / 2;
  let total = 0, extreme = 0;
  const idx = [];
  (function choose(start, depth, sum) {
    if (depth === k) { total++; if (Math.abs(sum - mid) >= Math.abs(obs - mid) - 1e-9) extreme++; return; }
    for (let i = start; i <= n - (k - depth); i++) { idx[depth] = i; choose(i + 1, depth + 1, sum + r[i]); }
  })(0, 0, 0);
  return extreme / total;
}

// el mecanisme pel nucli de la família dominant (PLA.md, propietat 5)
export function mechanism(core) {
  if (!core) return 'cap família';
  const has = (cs) => cs.every((c) => core.includes(c));
  const coma = has([',', '<', '}']), punt = has(['.', '{', '>']);
  if (coma && !punt) return 'coma';
  if (punt && !coma) return 'punt';
  return `altre: ${core}`;
}

function analyse(file) {
  const r = spawnSync(process.execPath, [join(root, 'fase2', 'analitza.mjs'), file], { encoding: 'utf8' });
  if (r.status) throw new Error(`analitza.mjs ${file}: ${r.stderr}`);
  const out = r.stdout;
  const num = (re) => { const m = out.match(re); return m ? Number(m[1]) / 100 : null; };
  const fams = [...out.matchAll(/família \d+: ([\d.]+) % del mapa · nucli (\S+)/g)].map((m) => ({ share: Number(m[1]) / 100, core: m[2] }));
  const top = fams.reduce((a, f) => (!a || f.share > a.share ? f : a), null);
  const bytes = new Uint8Array(readFileSync(file));
  const counts = new Array(256).fill(0); for (const v of bytes) counts[v]++;
  const entropy = -counts.reduce((s, c) => (c ? s + (c / bytes.length) * Math.log2(c / bytes.length) : s), 0);
  return {
    replicating: num(/replicadors a la mostra de \d+: ([\d.]+)%/), solo: num(/sols ([\d.]+)%/), context: num(/en context ([\d.]+)%/),
    heritableTest: num(/hereditaris \(la còpia també es copia\): ([\d.]+)%/),
    families: fams.length, topShare: top ? top.share : 0, mechanism: mechanism(top?.core), zeros: counts[0] / bytes.length, entropy,
  };
}

function main() {
  const rep = JSON.parse(readFileSync(join(root, 'fase2/resultats/b2/repartiment.json'), 'utf8'));
  const M = JSON.parse(readFileSync(join(root, 'fase2/serie-b2.json'), 'utf8'));
  // les branques noves: exploració (K = 1) i confirmació (K = 2), per món
  const newLoss = new Map();
  const mark = (id, l) => newLoss.set(id, (newLoss.get(id) ?? false) || l);
  const exp = join(root, 'fase2/resultats/b2/exploracio');
  for (const f of readdirSync(exp).filter((f) => /^[AB]\d{4}-m0(\.01)?\.jsonl$/.test(f))) mark(f.slice(0, 5), lossR2(read(join(exp, f)).filter((x) => x.type === 'census')));
  for (const b of M.branches) mark(b.world, lossR2(read(join(root, 'fase2/resultats/b2/confirmacio', `${b.name}.jsonl`)).filter((x) => x.type === 'census')));

  const rows = [];
  for (const w of rep.worlds) {
    const id = `${w.group}${w.seed}`;
    const recs = read(join(root, 'fase2/resultats/serie-llei2', w.group, `${w.seed}.jsonl`));
    const cs = new Map(recs.filter((x) => x.type === 'census').map((c) => [c.epoch, c.heritable / c.sample]));
    const after = cs.get(w.t + 1000);
    if (!existsSync(join(root, w.capture))) throw new Error(`no trobo ${w.capture}`);
    rows.push({
      id, group: w.group, part: w.part, t: w.t,
      fragile: after === undefined ? null : after < 0.01,
      newLoss: newLoss.get(id) ?? null,
      h0: cs.get(w.t) ?? null, h250: cs.get(w.t - 250) ?? null, h500: cs.get(w.t - 500) ?? null,
      growth: cs.get(w.t - 250) ? cs.get(w.t) / cs.get(w.t - 250) : null,
      ...analyse(join(root, w.capture)),
    });
  }
  return rows;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const rows = main();
  const j = process.argv.indexOf('--json');
  if (j > 0) writeFileSync(process.argv[j + 1], rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  const B = rows.filter((r) => r.group === 'B' && r.fragile !== null), F = B.filter((r) => r.fragile), O = B.filter((r) => !r.fragile);
  const A = rows.filter((r) => r.group === 'A' && r.fragile !== null);
  console.log(`mons B amb història a t + 1.000: ${B.length} (fràgils ${F.length}: ${F.map((r) => r.id + (r.newLoss ? '' : ' (cap pèrdua nova)')).join(', ')}); mons A: ${A.length}, fràgils ${A.filter((r) => r.fragile).length}`);
  const props = [
    ['h0', "hereditaris a t (cens)"], ['h250', "hereditaris a t − 250"], ['h500', "hereditaris a t − 500"], ['growth', "quocient t / t − 250"],
    ['t', "edat t"], ['families', "nombre de famílies"], ['topShare', "part del mapa de la dominant"],
    ['solo', "es replica sola"], ['context', "es replica en context"], ['heritableTest', "hereditaris a la prova de l'eina"],
    ['zeros', "bytes zero"], ['entropy', "entropia de Shannon"],
  ];
  const fmt = (v) => (v === null ? '—' : Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(3));
  console.log('\npropietat | fràgils (7): mediana [mín–màx] | altres B (26): mediana [mín–màx] | A (23): mediana | Mann–Whitney exacta, bilateral (fràgils contra altres B)');
  for (const [k, name] of props) {
    const f = F.map((r) => r[k]).filter((v) => v !== null), o = O.map((r) => r[k]).filter((v) => v !== null), a = A.map((r) => r[k]).filter((v) => v !== null);
    const p = f.length && o.length ? mannWhitney(f, o) : null;
    console.log(`${name} | ${fmt(median(f))} [${fmt(Math.min(...f))}–${fmt(Math.max(...f))}] (n=${f.length}) | ${fmt(median(o))} [${fmt(Math.min(...o))}–${fmt(Math.max(...o))}] (n=${o.length}) | ${fmt(median(a))} | p = ${p === null ? '—' : p.toFixed(4)}`);
  }
  const mech = (g) => g.reduce((m, r) => ((m[r.mechanism] = (m[r.mechanism] ?? 0) + 1), m), {});
  console.log('\nmecanisme de la família dominant: fràgils', JSON.stringify(mech(F)), '· altres B', JSON.stringify(mech(O)), '· A', JSON.stringify(mech(A)));
}
