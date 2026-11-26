// A measure of continuity (exploratory; the note, README.md): the records' validation, closed by default. Everything the analysis reads is
// checked against the list, the pilot's records and the computation's commit; anything missing, extra or impossible is a problem, and the
// analysis reads nothing. It closes, for this note's code, what audit 45 found open in the descent note's (AUD-234 = AU2-229): the list's
// SHA-256 and the commit are anchored (not only the same in every record), the samples have their exact sizes, no matched cell sits at
// distance 0, no origin is out of range. prova.mjs checks that every impossible case is rejected, also when it is the same in every record.
//
// validate({ list, records, files, pilot, code }): `list` the parsed llista.json; `records` a Map id -> array of parsed lines; `files` the
// names in the records' folder; `pilot` from pilotFacts(); `code` the commit the records must have been computed from (40 or 7+ hex).
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { WINDOWS, MATCHED } from '../descendencia/traca.mjs';
import { LIST_SHA256, SAMPLE } from './comu.mjs';

const P = PROGRAM_SIZE;
const isInt = (x, lo = 0, hi = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(x) && x >= lo && x <= hi;
const sameJSON = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const TYPES = new Set(['start', 'census', 'appearance', 'end']);
const KEYS = {
  start: ['type', 'branch', 'world', 'soup', 'code', 'node', 'list', 'seed', 'start', 'end', 'windows', 'censuses'],
  census: ['type', 'epoch', 'window', 'windowStart', 'N', 'next', 'D'],
  appearance: ['type', 'epoch', 'window', 'id', 'cells', 'orig', 'flags', 'matched', 'ring'],
  end: ['type', 'branch', 'measuresChecked', 'invariantChecks', 'fingerprint', 'seconds', 'rssMB'],
};
const D_KEYS = ['A', 'B', 'carriers', 'excluded', 'far', 'farCells', 'halfA', 'halfB', 'pool'];
const exactKeys = (x) => sameJSON(Object.keys(x).sort(), [...KEYS[x.type]].sort());
// An array of origins: whole cells, every origin an integer below `next`
const origins = (a, cells, next) => Array.isArray(a) && a.length === cells * P && a.every((g) => isInt(g, 0, next - 1));
const cellList = (a, n, exclude = []) => Array.isArray(a) && new Set(a).size === a.length && a.every((c) => isInt(c, 0, n - 1) && !exclude.includes(c));
// The commit a record names: the expected one, exactly (a short or a full hash of it), never with '+canvis'
const sameCommit = (got, want) => typeof got === 'string' && /^[0-9a-f]{7,40}$/.test(got) && typeof want === 'string' && /^[0-9a-f]{7,40}$/.test(want) && (got.startsWith(want) || want.startsWith(got));

export function validate({ list, records, files = null, pilot, code }) {
  const problems = [];
  if (typeof code !== 'string' || !/^[0-9a-f]{7,40}$/.test(code)) return { problems: ['no expected commit to check the records against'], code: null };
  const ids = list.branches.map((b) => b.id);
  if (files) {
    const want = ids.map((id) => `${id}.jsonl.gz`).sort(), have = [...files].sort();
    if (!sameJSON(want, have)) problems.push(`the folder does not hold exactly the list's records (${have.length} files, ${want.length} expected)`);
  }
  const nodes = new Set();
  for (const br of list.branches) {
    const L = records.get(br.id), pr = pilot.get(br.id), bad = [];
    if (!L) { problems.push(`${br.id}: no record`); continue; }
    if (!pr) { problems.push(`${br.id}: no pilot record to check it against`); continue; }
    const n = pr.n;
    if (!Array.isArray(L) || L.length < 2 || L.some((x) => !x || typeof x !== 'object' || !TYPES.has(x.type) || !exactKeys(x))) { problems.push(`${br.id}: a line that is not of the note's types and fields`); continue; }
    const S = L[0], E = L.at(-1);
    if (S.type !== 'start' || E.type !== 'end' || L.slice(1, -1).some((x) => x.type === 'start' || x.type === 'end')) { problems.push(`${br.id}: not one start line first and one end line last`); continue; }
    // the start and end lines, against the list, the pilot's record and the computation's commit
    if (S.branch !== br.id || String(S.world) !== String(br.world) || S.soup !== br.soup || S.seed !== pr.seed || S.start !== pr.start || S.end !== pr.end
      || !sameJSON(S.windows, WINDOWS) || !sameJSON(S.censuses, br.observers.map((o) => o.epoch))) bad.push('the start line is not of this branch or of its pilot record');
    if (!sameCommit(S.code, code)) bad.push(`the commit is not the computation's (${S.code})`);
    if (S.list !== LIST_SHA256) bad.push('the list\'s SHA-256 is not the note\'s');
    if (typeof S.node !== 'string' || !/^v\d+\.\d+\.\d+$/.test(S.node)) bad.push('no Node version');
    else nodes.add(S.node);
    if (E.branch !== br.id || E.fingerprint !== pr.fingerprint || E.measuresChecked !== pr.measures || E.invariantChecks !== pr.invariantChecks
      || typeof E.seconds !== 'number' || !Number.isFinite(E.seconds) || E.seconds < 0 || !isInt(E.rssMB, 1)) bad.push('the end line is not of this branch or of its pilot record');
    // exactly the lines the list asks for, once each, in the order the run writes them (census, then its appearances, per window)
    const want = [];
    for (const o of br.observers) for (const w of WINDOWS) {
      want.push(`census|${o.epoch}|${w}`);
      for (const y of o.appearances) want.push(`appearance|${o.epoch}|${w}|${y.id}`);
    }
    const got = L.slice(1, -1).map((x) => (x.type === 'census' ? `census|${x.epoch}|${x.window}` : `appearance|${x.epoch}|${x.window}|${x.id}`));
    if (!sameJSON(got, want)) { bad.push(`not the lines the list asks for, once each and in order (${got.length} lines, ${want.length} expected)`); problems.push(`${br.id}: ${bad.join('; ')}`); continue; }
    const census = new Map();
    for (const x of L.slice(1, -1)) {
      const o = br.observers.find((q) => q.epoch === x.epoch), hasD = o.sets.some((s) => s.name === 'D'), here = `${x.epoch}/${x.window}`;
      if (x.type === 'census') {
        census.set(`${x.epoch}|${x.window}`, x);
        if (x.windowStart !== Math.max(pr.start, x.epoch - x.window)) bad.push(`census ${here}: the window's start`);
        if (x.N !== n * P || !isInt(x.next, x.N, 67108863)) bad.push(`census ${here}: the world's bytes or the next origin`);
        if ((x.D === null) === hasD) { bad.push(`census ${here}: D, present or not, against the list`); continue; }
        if (x.D === null) continue;
        const d = x.D;
        if (typeof d !== 'object' || !sameJSON(Object.keys(d).sort(), D_KEYS)) { bad.push(`census ${here}: not the fields of D`); continue; }
        if (!isInt(d.carriers, 1, n) || !isInt(d.excluded, 0, d.carriers) || !isInt(d.A, 1) || !isInt(d.B) || d.A + d.B !== d.carriers - d.excluded || d.A !== Math.ceil((d.A + d.B) / 2)) bad.push(`census ${here}: the carriers and the halves do not add up`);
        if (!isInt(d.farCells, 0, n - d.carriers)) bad.push(`census ${here}: an impossible number of far cells`);
        if (!Array.isArray(d.pool) || d.pool.length % P !== 0 || !origins(d.pool, d.pool.length / P, x.next)) { bad.push(`census ${here}: the pool is not whole cells of origins below the next one`); continue; }
        const u = d.pool.length / P;
        const idx = (a, len) => Array.isArray(a) && a.length === len && a.every((i) => isInt(i, 0, u - 1));
        if (!idx(d.halfA, d.A) || !idx(d.halfB, Math.min(SAMPLE, d.B)) || !idx(d.far, Math.min(SAMPLE, d.farCells))) bad.push(`census ${here}: the samples are not of their sizes, or point outside the pool`);
        const used = new Set([...(d.halfA ?? []), ...(d.halfB ?? []), ...(d.far ?? [])]);
        if (used.size !== u) bad.push(`census ${here}: the pool holds a sequence no sample uses`);
        const seqs = new Set(); for (let i = 0; i < u; i++) seqs.add(d.pool.slice(i * P, i * P + P).join(','));
        if (seqs.size !== u) bad.push(`census ${here}: the pool holds a sequence twice`);
      } else {
        const y = o.appearances.find((q) => q.id === x.id), c = census.get(`${x.epoch}|${x.window}`);
        const next = c ? c.next : 0, k = y.cells.length;
        if (!sameJSON(x.cells, y.cells)) bad.push(`${x.id} ${here}: the cells are not the list's`);
        if (!origins(x.orig, k, next)) bad.push(`${x.id} ${here}: impossible origins`);
        if (!Array.isArray(x.flags) || x.flags.length !== k * P || x.flags.some((f) => ![0, 1, 2, 3].includes(f))) bad.push(`${x.id} ${here}: impossible flags`);
        if ((x.matched === null) === hasD) bad.push(`${x.id} ${here}: matched cells, present or not, against the list`);
        if (x.matched) {
          const m = x.matched;
          if (!sameJSON(Object.keys(m).sort(), ['cells', 'distance', 'orig']) || !isInt(m.distance, 0) || !cellList(m.cells, n, y.cells) || m.cells.length > MATCHED
            || !origins(m.orig, m.cells.length, next)) bad.push(`${x.id} ${here}: impossible matched cells`);
          else if (m.distance === 0 ? m.cells.length !== 0 : m.cells.length === 0) bad.push(`${x.id} ${here}: matched cells at distance 0, or none at a distance of 1 or more`);
        }
        const r = x.ring;
        if (!r || typeof r !== 'object' || !sameJSON(Object.keys(r).sort(), ['cells', 'orig']) || !cellList(r.cells, n, y.cells) || r.cells.length > 8 * k || !origins(r.orig, r.cells.length, next)) bad.push(`${x.id} ${here}: an impossible ring`);
      }
    }
    if (bad.length) problems.push(`${br.id}: ${bad.slice(0, 3).join('; ')}${bad.length > 3 ? `; … (${bad.length})` : ''}`);
  }
  if (nodes.size > 1) problems.push(`the records were not run with one Node (${[...nodes].join(', ')})`);
  return { problems, code };
}

// The pilot's facts a record must match: its seed, start, end, fingerprint, number of measures and invariant checks (from the pilot's record
// in git). At each measure epoch (every `every`) each open tracer is checked once; a tracer opens after the check of its start epoch,
// max(start, census − window), and is last checked at its census (the exact count; ../descendencia/valida.mjs, after its correction).
export function pilotFacts(list, readRecord) {
  const m = new Map();
  for (const br of list.branches) {
    const rec = readRecord(br.record), S = rec[0], E = rec.at(-1), every = S.every;
    if (!isInt(every, 1)) throw new Error(`${br.id}: the pilot record has no measure interval`);
    let invariantChecks = 0;
    for (const o of br.observers) for (const w of WINDOWS) invariantChecks += Math.floor(o.epoch / every) - Math.floor(Math.max(S.start, o.epoch - w) / every);
    m.set(br.id, { seed: S.seed, start: S.start, end: E.epoch, fingerprint: E.fingerprint, measures: rec.filter((l) => l.type === 'measure' && l.epoch > S.start && l.epoch <= E.epoch).length, invariantChecks, n: S.world[0] * S.world[1] });
  }
  return m;
}
