// The record of heritable copies, the small version (exploratory; the note, README.md): the data, read and validated. Only data in git:
// the pilot's manifest and part-B records, and the natural-lineage trackings of the lineage note (with their replayed records). The
// checks are auditor 2's list at audit 43 (AU2-216) and auditor 1's (AUD-226): if anything is missing or impossible, nothing is used.
//
// load({ mutate }) returns { problems, B, cohort, wb, ... }. `mutate(data)`, for the negative tests only (prova.mjs), changes the parsed
// data in memory before the checks.
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { ANALYSIS } from '../../../../eines/arrelament-analisi.mjs';
import { DESIGN } from '../../../../eines/arrelament.mjs';
import { conditions, testInert, fromHex, heritable, INERT_CONDITIONS_SEED } from '../../../inert.js';

export const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..', '..');
export const PILOT = 'fase2/resultats/arrelament/pilot', LINEAGES = 'fase2/resultats/arrelament/llinatges';
export const HERE = 'fase2/resultats/arrelament/registre-copies';
export const ARMS = ['continue', 'shuffle-all', 'reinit'];
export const TIME = 1250;   // the time rule of the sensitivities note
export const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const readJsonl = (file) => readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const isN = (x) => Number.isSafeInteger(x) && x >= 0;
// a replayed record against the original: the same lines, except the seconds of measure and end, and the code and command of start
const clean = (x) => { const y = { ...x }; if (y.type === 'measure' || y.type === 'end') delete y.seconds; if (y.type === 'start') { delete y.code; delete y.command; } return JSON.stringify(y); };

export function load({ mutate = null, robust = true } = {}) {
  const problems = [];
  const m = JSON.parse(readFileSync(join(ROOT, PILOT, 'manifest.json'), 'utf8'));
  const cohort = m.worlds.filter((w) => w.included).map((w) => w.world);
  const [W, H] = m.params.world;
  const start = DESIGN.age;
  const data = { m, cohort, records: new Map(), trackings: new Map(), replays: new Map(), list: null };
  for (const b of m.branches.filter((x) => x.part === 'B' && ARMS.includes(x.soup))) {
    const f = join(ROOT, PILOT, 'part-b', `${b.id}.jsonl`);
    if (existsSync(f)) { try { data.records.set(b.id, readJsonl(f)); } catch { problems.push(`${b.id}: the part-B record is not valid JSONL`); } }
  }
  data.list = readFileSync(join(ROOT, LINEAGES, 'llista.txt'), 'utf8').trim().split('\n').map((l) => l.split(' ')[0]);
  for (const id of data.list) {
    const s = join(ROOT, LINEAGES, 'seguiments', `${id}.jsonl`), r = join(ROOT, LINEAGES, 'simulacio', `${id}.jsonl`);
    if (existsSync(s) && existsSync(r)) {
      try { data.trackings.set(id, readJsonl(s)); data.replays.set(id, { lines: readJsonl(r), sha: sha256(readFileSync(r)) }); }
      catch { problems.push(`${id}: the tracking or its replayed record is not valid JSONL`); }
    }
  }
  if (mutate) mutate(data);
  const PBr = m.branches.filter((b) => b.part === 'B' && ARMS.includes(b.soup));

  // 1. the manifest: the part-B branches are the cohort's three soups, each once
  if (PBr.length !== cohort.length * ARMS.length) problems.push(`the manifest has ${PBr.length} part-B branches of the three soups`);
  if (new Set(PBr.map((b) => `${b.world}/${b.soup}`)).size !== PBr.length || new Set(PBr.map((b) => b.id)).size !== PBr.length) problems.push('the manifest repeats a part-B branch');
  for (const w of cohort) for (const s of ARMS) if (!PBr.some((b) => b.world === w && b.soup === s)) problems.push(`the manifest has no part-B branch for ${w}/${s}`);
  // 2. each part-B record: complete, of the manifest's commit, and of its branch
  const recB = new Map();
  for (const b of PBr) {
    const rec = data.records.get(b.id);
    if (!rec) { problems.push(`${b.id}: no part-B record`); continue; }
    const S = rec[0], E = rec.at(-1);
    if (S.type !== 'start' || E.type !== 'end' || String(S.code) !== String(m.code) || String(S.code).includes('+')) { problems.push(`${b.id}: the part-B record is not complete, or not of the manifest's commit`); continue; }
    if (String(S.start) !== String(start) || !String(S.command).includes(`--json ${PILOT}/part-b/${b.id}.jsonl`) || typeof E.fingerprint !== 'string' || !isN(E.epoch) || E.epoch > S.epochs) { problems.push(`${b.id}: the part-B record's start or end line is not of its branch`); continue; }
    recB.set(b.id, rec);
  }
  // 3. the tracked branches: exactly those with an inert census that finds a heritable cell, in the manifest's order
  const expected = PBr.filter((b) => recB.get(b.id)?.some((l) => l.type === 'inert' && l.heritable > 0)).map((b) => b.id);
  if (JSON.stringify(data.list) !== JSON.stringify(expected)) problems.push(`llista.txt is not the part-B branches with a heritable inert cell, in the manifest's order (${data.list.length} against ${expected.length})`);
  const seg = new Map();
  for (const id of data.list) {
    const b = PBr.find((x) => x.id === id), rec = recB.get(id), L = data.trackings.get(id), R = data.replays.get(id);
    if (!b || !rec) { problems.push(`${id}: not a part-B branch with a record`); continue; }
    if (!L || !R) { problems.push(`${id}: the tracking or its replayed record is missing`); continue; }
    // the replayed record, line by line against the pilot's (a real comparison, not a sentence)
    const cmd = (x) => String(x).replace(/ --(?:json|save|save-every) \S+/g, '');
    if (R.lines.length !== rec.length || R.lines.some((x, i) => clean(x) !== clean(rec[i])) || cmd(R.lines[0].command) !== cmd(rec[0].command)) { problems.push(`${id}: the replayed record is not the pilot's`); continue; }
    const S = L[0], Z = L.at(-1), ev = rec.find((l) => l.type === 'event') ?? null;
    if (S.type !== 'start' || Z.type !== 'end' || S.record?.sha256 !== R.sha) { problems.push(`${id}: the tracking is not complete, or not of its replayed record`); continue; }
    if (S.branch !== id || String(S.world) !== String(b.world) || S.soup !== b.soup || S.start !== start || S.end !== rec.at(-1).epoch
      || S.event !== (ev ? ev.epoch : null) || S.confirmed !== (ev ? ev.confirmed : null) || Z.branch !== id) { problems.push(`${id}: the tracking's start or end line does not match its branch`); continue; }
    const inert = rec.filter((l) => l.type === 'inert');
    const news = new Map(), parent = new Map(), steps = new Set(), bad = [];
    const root = (x) => { while (parent.has(x)) x = parent.get(x); return x; };
    const censusLines = L.filter((l) => l.type === 'census');
    // every inert census of the record, once and in order
    if (censusLines.length !== inert.length || censusLines.some((c, i) => c.epoch !== inert[i].epoch)) bad.push('the censuses are not those of the record');
    for (const l of L.slice(1, -1)) {
      if (!isN(l.epoch) || l.epoch <= start || l.epoch > S.end) { bad.push(`a line out of the branch (${l.type} ${l.epoch})`); continue; }
      if (l.type === 'new') {
        if (news.has(l.id) || !/^\d+:\d+$/.test(l.id) || Number(l.id.split(':')[0]) !== l.epoch || !Array.isArray(l.programs) || !Array.isArray(l.cells) || !l.programs.length
          || l.programs.length !== l.cells.length || l.programs.some((p) => !/^[0-9a-f]{128}$/.test(p)) || new Set(l.cells).size !== l.cells.length
          || l.cells.some((x) => !isN(x) || x >= W * H)) { bad.push(`new ${l.id}`); continue; }
        // the programs are those of the inert census at the same cells
        const ic = inert.find((x) => x.epoch === l.epoch);
        const byCell = new Map((ic?.cells ?? []).filter((c) => heritable(c)).map((c) => [c.cell, c.program]));
        if (l.cells.some((c, i) => byCell.get(c) !== l.programs[i])) { bad.push(`new ${l.id}: not the inert census's programs`); continue; }
        news.set(l.id, l);
      } else if (l.type === 'census') {
        const i = inert.find((x) => x.epoch === l.epoch), cells = Array.isArray(l.cells) ? l.cells : [];
        const herCells = new Set((i?.cells ?? []).filter((c) => heritable(c)).map((c) => c.cell));
        const created = (l.created ?? []).flatMap((x) => news.get(x)?.cells ?? [null]).sort((p, q) => p - q);
        const empty = cells.filter((x) => Array.isArray(x.lineages) && !x.lineages.length).map((x) => x.cell).sort((p, q) => p - q);
        if (!i || l.sample !== i.sample || l.heritable !== i.heritable || cells.length !== l.heritable || new Set(cells.map((x) => x.cell)).size !== cells.length
          || cells.some((x) => !herCells.has(x.cell)) || herCells.size !== cells.length
          || cells.some((x) => !Array.isArray(x.lineages) || x.lineages.some((y) => !news.has(y) || news.get(y).epoch > l.epoch))
          || (l.created ?? []).some((x) => !news.has(x) || news.get(x).epoch !== l.epoch) || JSON.stringify(created) !== JSON.stringify(empty)) { bad.push(`census ${l.epoch}`); continue; }
        // the unions: from a root to an older root, each lineage joined once
        if (!Array.isArray(l.joins) || new Set(l.joins.map((j) => j[0])).size !== l.joins.length || l.joins.some(([a, o]) => !news.has(a) || !news.has(o) || parent.has(a) || root(a) !== a || root(o) !== o || a === o
          || !(news.get(a).epoch > news.get(o).epoch || (news.get(a).epoch === news.get(o).epoch && Number(a.split(':')[1]) > Number(o.split(':')[1]))))) { bad.push(`census ${l.epoch}: the unions`); continue; }
        for (const [a, o] of l.joins) parent.set(a, o);
        // the groups field, against the cells counted by root
        const g = new Map();
        for (const c of cells) for (const r of new Set(c.lineages.map(root))) g.set(r, (g.get(r) ?? 0) + 1);
        const field = l.groups ?? {};
        if (Object.keys(field).length !== g.size || [...g].some(([r, k]) => field[r] !== k)) { bad.push(`census ${l.epoch}: the groups field`); continue; }
      } else if (l.type === 'step') {
        const k = `${l.id}@${l.epoch}`;
        if (!news.has(l.id) || l.epoch < news.get(l.id).epoch || l.epoch % 50 !== 0 || steps.has(k) || !isN(l.M) || !isN(l.tested) || !isN(l.functional) || !isN(l.F)
          || l.functional > l.tested || l.tested > l.M || l.F > l.M) { bad.push(`step ${l.id} ${l.epoch}`); continue; }
        steps.add(k);
      } else bad.push(`a line of type ${l.type}`);
    }
    if (!bad.length && (Z.lineages !== news.size || Z.groups !== new Set([...news.keys()].map(root)).size)) bad.push('the end line does not count the lineages and groups');
    if (bad.length) { problems.push(`${id}: impossible lines (${bad.slice(0, 3).join('; ')}${bad.length > 3 ? '; …' : ''})`); continue; }
    seg.set(id, L);
  }
  if (problems.length) return { problems };

  // The lineages of each branch, as the within-world null note (robust: the retest of the first programs, 50 of 100 conditions)
  const retest = robust ? conditions(INERT_CONDITIONS_SEED, ANALYSIS.retest.from + ANALYSIS.retest.count).slice(ANALYSIS.retest.from) : null;
  const cache = new Map();
  const score = (hex) => {
    if (!cache.has(hex)) {
      const s = testInert(fromHex(hex), retest);
      let k = 0;
      for (let i = 0; i < s.heritableSolo.length; i++) if (s.heritableSolo[i] === '1' || s.heritableContext[i] === '1') k++;
      cache.set(hex, k);
    }
    return cache.get(hex);
  };
  const B = PBr.map((b) => {
    const rec = recB.get(b.id), ev = rec.find((l) => l.type === 'event') ?? null, end = rec.at(-1);
    const r = { ...b, rec, ev, end, exposure: (ev ? ev.epoch : end.epoch) - start, lineages: [], domRoot: null, census: new Map(), tracked: seg.has(b.id) };
    const L = seg.get(b.id);
    if (!L) return r;
    const lin = new Map(), parent = new Map();
    const root = (id) => { while (parent.has(id)) id = parent.get(id); return id; };
    for (const l of L) {
      if (l.type === 'new') lin.set(l.id, { id: l.id, first: l.epoch, k: Number(l.id.split(':')[1]), programs: l.programs, cells: l.cells });
      if (l.type === 'census') {
        for (const [young, old] of l.joins) parent.set(young, old);
        if (ev && l.epoch === ev.confirmed) for (const [rid, k] of Object.entries(l.groups)) if (l.heritable > 0 && k >= ANALYSIS.dominance * l.heritable) r.domRoot = root(rid);
        r.census.set(l.epoch, l);
      }
    }
    r.lineages = [...lin.values()].map((x) => ({ ...x, robust: robust ? Math.max(...x.programs.map(score)) >= ANALYSIS.robust : null, root: root(x.id) }));
    for (const x of r.lineages) x.rooted = r.domRoot !== null && x.root === r.domRoot;
    return r;
  });
  // every establishment of a tracked branch has a dominant group, whose root is not joined to another later
  for (const b of B) if (b.tracked && b.ev && (b.domRoot === null || b.lineages.some((x) => x.id === b.domRoot && x.root !== b.domRoot))) problems.push(`${b.id}: an establishment without a dominant group`);
  if (problems.length) return { problems };
  const failed = (b) => b.lineages.filter((x) => x.robust && !x.rooted && x.first <= start + b.exposure);
  const wb = cohort.map((w) => Object.fromEntries(ARMS.map((s) => [s, B.find((x) => x.world === w && x.soup === s)])));
  return { problems, m, W, H, start, cohort, B, wb, failed };
}
