// Les taules per llavor i la corba de Kaplan–Meier d'una sèrie de dues condicions, en HTML, per al
// quadern (A5 de la iteració 4; AUD-21). Fa servir les funcions de fase2/estadistica.mjs. Abans les feia un
// script de fora del repositori; la prova (test/quadern.mjs) comprova que reprodueix exactament les de
// l'entrada 8.
//
//   node fase2/quadern-serie.mjs carpeta-A carpeta-B carpeta-sortida [manifest.json]
//
// Escriu taula-A.html i taula-B.html (les files <tr> de cada grup) i km.svg.html (la corba). El manifest
// (per defecte, fase2/serie-llei2.json) dona l'etapa de cada llavor i els noms dels grups.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { readSeries, originMeasures, kaplanMeier, survivalAt, stageSeeds } from './estadistica.mjs';

const pct = (v) => (v * 100).toFixed(1).replace('.', ',');
const num = (v) => (v === null || v === undefined ? '—' : v.toLocaleString('ca-ES').replace(/ /g, '.'));

// La màquina de cada experiment, per la versió de Node que diu el seu JSONL: al projecte, el PC fa
// servir Node 16 i la VM, Node 20
const machineOf = (x) => (x.records[0].node.startsWith('v20') ? 'VM' : 'PC');

// Una fila per llavor: l'etapa, la màquina, l'establiment, el primer hereditari, el final, els
// hereditaris a l'últim cens i si la vida es manté a t + 1.000 (amb els hereditaris d'aquell cens si no)
export function seedRows(group, groupName, manifest) {
  const stageOf = (seed) => Object.keys(manifest.stages).map(Number).find((s) => stageSeeds(manifest, groupName, s).includes(seed)
    && !(s > 1 && stageSeeds(manifest, groupName, s - 1).includes(seed)));
  return group.map((x) => {
    const o = originMeasures(x);
    const last = x.censuses[x.censuses.length - 1];
    const after = x.event ? x.censuses.find((c) => c.epoch === x.time + (x.stopAfter ?? 1000)) : undefined;
    return {
      seed: x.seed, stage: stageOf(x.seed), machine: machineOf(x), t: x.event ? x.time : null, first: o.firstHeritable, end: x.end,
      lastHer: last.heritable / last.sample, maintained: o.maintained, afterHer: after ? after.heritable / after.sample : null,
    };
  });
}

export function rowsHtml(rows) {
  return rows.map((r) => `<tr><td>${r.seed}</td><td>${r.stage}</td><td>${r.machine}</td><td>${num(r.t)}</td><td>${num(r.first)}</td><td>${num(r.end)}</td>`
    + `<td>${pct(r.lastHer)} %</td><td>${r.maintained === null ? '—' : r.maintained ? 'sí' : `<strong>no</strong> (${pct(r.afterHer)} %)`}</td></tr>`).join('\n');
}

// La proporció de mons on la vida ja s'ha establert (1 − Kaplan–Meier), en SVG, amb els colors del tema
export function kmSvg(A, B, { labelA, labelB, horizon = 16000, ymax = 0.5 } = {}) {
  const W = 640, H = 300, L = 48, R = 16, T = 14, Bm = 36;
  const sx = (t) => L + (t / horizon) * (W - L - R), sy = (p) => T + (1 - p / ymax) * (H - T - Bm);
  const path = (g) => {
    let d = `M${sx(0).toFixed(1)},${sy(0).toFixed(1)}`;
    for (const st of kaplanMeier(g)) d += ` H${sx(st.time).toFixed(1)} V${sy(1 - st.s).toFixed(1)}`;
    return d + ` H${sx(horizon).toFixed(1)}`;
  };
  const steps = [0, 0.1, 0.2, 0.3, 0.4, 0.5].filter((p) => p <= ymax);
  const grid = steps.map((p) => `<line x1="${L}" x2="${W - R}" y1="${sy(p).toFixed(1)}" y2="${sy(p).toFixed(1)}" stroke="var(--grid)"/><text x="${L - 6}" y="${(sy(p) + 4).toFixed(1)}" text-anchor="end">${p * 100} %</text>`).join('');
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * horizon);
  const xt = ticks.map((t, i) => (i === ticks.length - 1
    ? `<text x="${W - 2}" y="${H - Bm + 18}" text-anchor="end">${num(t)}</text>`
    : `<text x="${sx(t).toFixed(1)}" y="${H - Bm + 18}" text-anchor="middle">${num(t)}</text>`)).join('');
  const fA = 1 - survivalAt(kaplanMeier(A), horizon).s, fB = 1 - survivalAt(kaplanMeier(B), horizon).s;
  return `<svg class="km" viewBox="0 0 ${W} ${H}" role="img" aria-label="Proporció de mons amb vida establerta al llarg de les èpoques: ${labelA} ${pct(fA)} % i ${labelB} ${pct(fB)} % a l'època ${num(horizon)}">
  <g font-size="12" fill="var(--text-2)">${grid}${xt}<text class="km-x" x="${(L + W - R) / 2}" y="${H - 4}" text-anchor="middle">època</text></g>
  <line x1="${L}" x2="${W - R}" y1="${sy(0)}" y2="${sy(0)}" stroke="var(--axis)"/>
  <path d="${path(A)}" fill="none" stroke="var(--series-1)" stroke-width="2.5"/>
  <path d="${path(B)}" fill="none" stroke="var(--op-loop)" stroke-width="2.5" stroke-dasharray="7 4"/>
  <g font-size="13" font-weight="650">
    <line x1="64" x2="92" y1="30" y2="30" stroke="var(--op-loop)" stroke-width="2.5" stroke-dasharray="7 4"/><text x="100" y="34" fill="var(--op-loop)">${labelB} · ${pct(fB)} % a l'època ${num(horizon)}</text>
    <line x1="64" x2="92" y1="52" y2="52" stroke="var(--series-1)" stroke-width="2.5"/><text x="100" y="56" fill="var(--series-1)">${labelA} · ${pct(fA)} %</text>
  </g>
</svg>`;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const [dirA, dirB, out, manifestFile = fileURLToPath(new URL('serie-llei2.json', import.meta.url))] = process.argv.slice(2);
  if (!out) {
    console.error('Ús: node fase2/quadern-serie.mjs carpeta-A carpeta-B carpeta-sortida [manifest.json]');
    process.exit(2);
  }
  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
  const A = readSeries(dirA), B = readSeries(dirB);
  const label = (g) => manifest.groups[g].label.replace(/ \(m = 0\)$/, '');
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'taula-A.html'), rowsHtml(seedRows(A, 'A', manifest)) + '\n');
  writeFileSync(join(out, 'taula-B.html'), rowsHtml(seedRows(B, 'B', manifest)) + '\n');
  writeFileSync(join(out, 'km.svg.html'), kmSvg(A, B, { labelA: label('A'), labelB: label('B') }) + '\n');
  console.log(`escrits taula-A.html, taula-B.html i km.svg.html a ${out}`);
}
