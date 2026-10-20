// L'anàlisi de la prolongació pilot de B2 (fase2/resultats/b2/pilot/LLEGEIX-ME.md), descriptiva: no en surt
// cap conclusió, i només serveix per fixar H i K de la sèrie preregistrada. Només llegeix les branques del pilot
// i les de l'exploració: cap dels mons reservats.
//
//   node eines/b2-pilot.mjs [carpeta-del-pilot]
//
// 1. La mateixa història: les primeres 2.000 èpoques de cada branca han de ser idèntiques a les de l'exploració
//    (els censos i les mesures, sense els segons ni l'HOE, que depèn de la versió de zlib; AUD-55).
// 2. Els hereditaris al llarg del temps, i les pèrdues R2 (docs/protocol-b2.md, §5), també després de t + 2.000.
// 3. Si la vida envelleix: el final respecte del màxim, a les branques que no la perden.
// 4. El cost per època, per trams de 500, a les branques vives, i el que costaria cada disseny.
// 5. El canvi de règim, només com a descripció.
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { lossTime } from '../fase2/b2-serie.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const RULE = { lossMax: 5, recoverMin: 21 };
const read = (f) => readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function pilot(dir = join(root, 'fase2', 'resultats', 'b2', 'pilot')) {
  const exploration = join(root, 'fase2', 'resultats', 'b2', 'exploracio');
  const lines = [];
  const branches = [];
  for (const machine of ['pc', 'vm']) {
    for (const name of readFileSync(join(dir, `llista-${machine}.txt`), 'utf8').trim().split('\n').map((l) => l.split(' ')[0])) {
      const r = read(join(dir, `${name}.jsonl`)), s = r[0], t = s.start, H = s.epochs - t;
      const cs = r.filter((x) => x.type === 'census'), ms = r.filter((x) => x.type === 'measure');
      const at = (e) => (e === 0 ? 0 : ms.find((m) => m.epoch === t + e)?.seconds ?? null);
      const cost = [];
      for (let a = 0; a < H; a += 500) { const x = at(a), y = at(a + 500); cost.push(x !== null && y !== null ? (y - x) / 500 : null); }
      branches.push({
        name, machine, world: name.slice(2, 7), mixing: s.mixing, node: s.node, t, H, records: r, cs, cost,
        cond: (name[2] === 'A') === (s.mixing === 0) ? 'origen' : 'canvi',
        loss: lossTime(cs, t, H, RULE), early: lossTime(cs.filter((c) => c.epoch <= t + 2000), t, 2000, RULE),
      });
    }
  }
  // 1. La mateixa història
  const strip = (x) => { const { seconds, hoe, ...rest } = x; return JSON.stringify(rest); };
  let same = 0, hoeGap = 0;
  for (const b of branches) {
    const e = read(join(exploration, `${b.name.slice(2)}.jsonl`));
    const pick = (rs) => rs.filter((x) => (x.type === 'census' || x.type === 'measure') && x.epoch <= b.t + 2000);
    const a = pick(b.records), c = pick(e);
    const ok = a.length === c.length && a.every((x, i) => strip(x) === strip(c[i]))
      && ['seed', 'mixing', 'from', 'start', 'rng', 'mutation', 'radius'].every((k) => JSON.stringify(b.records[0][k]) === JSON.stringify(e[0][k]));
    if (ok) same++; else lines.push(`  DIFERENT: ${b.name}`);
    a.forEach((x, i) => { if (x.type === 'measure' && c[i]) hoeGap = Math.max(hoeGap, Math.abs(x.hoe - c[i].hoe)); });
  }
  lines.unshift(`1. La mateixa història: ${same} de ${branches.length} branques idèntiques a l'exploració fins a t + 2.000 (l'HOE difereix com a molt ${hoeGap.toExponential(1)})`);
  // 2. Els hereditaris i les pèrdues
  const her = (b, e) => b.cs.find((c) => c.epoch === b.t + e)?.heritable;
  const max = (b) => Math.max(...b.cs.map((c) => c.heritable));
  lines.push('', '2. Els hereditaris a la mostra (de 2.048), de t + 1.000 a t + 6.000, i la pèrdua R2');
  for (const b of branches) {
    const traj = [1000, 2000, 3000, 4000, 5000, 6000].map((e) => String(her(b, e) ?? '-').padStart(4)).join(' ');
    const loss = b.loss.event ? `pèrdua a t + ${b.loss.T}${b.loss.recovered ? ', es recupera' : ''}${b.early.event ? '' : ' (tardana)'}` : 'sense pèrdua';
    lines.push(`  ${b.name.padEnd(15)} ${b.cond.padEnd(6)} ${traj}   màx ${String(max(b)).padStart(4)}   ${loss}`);
  }
  const lost = branches.filter((b) => b.loss.event);
  lines.push(`  pèrdues: ${lost.length} de ${branches.length}, ${lost.filter((b) => !b.early.event).length} després de t + 2.000, ${lost.filter((b) => b.loss.recovered).length} recuperades; d'origen ${lost.filter((b) => b.cond === 'origen').length} de ${branches.filter((b) => b.cond === 'origen').length}, de canvi ${lost.filter((b) => b.cond === 'canvi').length} de ${branches.filter((b) => b.cond === 'canvi').length}`);
  // 3. Si la vida envelleix
  const alive = branches.filter((b) => !b.loss.event);
  const ratios = alive.map((b) => b.cs[b.cs.length - 1].heritable / max(b));
  lines.push('', `3. Les ${alive.length} branques que no perden la vida acaben entre el ${(100 * Math.min(...ratios)).toFixed(0)} % i el ${(100 * Math.max(...ratios)).toFixed(0)} % del seu màxim; el mínim al cens final és ${Math.min(...alive.map((b) => b.cs[b.cs.length - 1].heritable))} de 2.048`);
  // 4. El cost
  const row = (bs) => bs[0].cost.map((_, i) => mean(bs.map((b) => b.cost[i]).filter((v) => v !== null)));
  const all = row(alive);
  lines.push('', '4. El cost: segons per època per trams de 500 èpoques, a les branques vives');
  for (const m of ['pc', 'vm']) {
    const bs = alive.filter((b) => b.machine === m);
    if (bs.length) lines.push(`  ${m} (${bs.length} branques, node ${bs[0].node}): ${row(bs).map((v) => v.toFixed(2)).join(' ')}`);
  }
  lines.push(`  totes: ${all.map((v) => v.toFixed(2)).join(' ')}`);
  const hours = (H) => all.slice(0, H / 500).reduce((a, v) => a + v * 500, 0) / 3600;
  lines.push(`  hores per branca viva: H = 4.000, ${hours(4000).toFixed(1)}; H = 5.000, ${hours(5000).toFixed(1)}; H = 6.000, ${hours(6000).toFixed(1)}`);
  lines.push(`  la sèrie: disseny (i), 116 branques de 5.000, ${(116 * hours(5000)).toFixed(0)} h; disseny (ii), 58 de 6.000 i 29 de 4.000, ${(58 * hours(6000) + 29 * hours(4000)).toFixed(0)} h`);
  // 5. El canvi de règim
  lines.push('', '5. El canvi de règim, per món (pèrdua R2 fins a t + 6.000), només descriptiu');
  for (const w of [...new Set(branches.map((b) => b.world))]) {
    const o = branches.find((b) => b.world === w && b.cond === 'origen'), c = branches.find((b) => b.world === w && b.cond === 'canvi');
    const d = (b) => (b.loss.event ? `pèrdua a t + ${b.loss.T}` : 'viva');
    lines.push(`  ${w}: origen (m = ${o.mixing}) ${d(o)}; canvi (m = ${c.mixing}) ${d(c)}`);
  }
  return { lines, same, branches: branches.length, losses: lost.length, late: lost.filter((b) => !b.early.event).length, hours };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  for (const l of pilot(process.argv[2]).lines) console.log(l);
}
