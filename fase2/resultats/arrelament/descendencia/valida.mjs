// A measure of descent by position (exploratory; the note, README.md): the records' validation, closed by default (auditor 2's list at
// audit 44, AU2-219). Everything the analysis uses is checked against the list and the pilot's records; anything missing, extra or
// impossible is a problem, and the analysis reads nothing. prova.mjs checks that each impossible case is rejected.
//
// validate({ list, records, pilot }): `list` the parsed llista.json; `records` a Map id -> array of parsed lines (or `files`, the names of
// the folder, to check that exactly the list's records are there); `pilot` a Map id -> { seed, start, end, fingerprint, measures, n }.
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { WINDOWS, VARIANTS, MAIN } from './traca.mjs';

const P = PROGRAM_SIZE;
const isInt = (x, lo = 0, hi = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(x) && x >= lo && x <= hi;
const isHist = (h, total) => Array.isArray(h) && h.length === P + 1 && h.every((x) => isInt(x)) && h.reduce((a, b) => a + b, 0) === total;
const sameJSON = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const TYPES = new Set(['start', 'census', 'appearance', 'pair', 'end']);
const KEYS = {
  start: ['type', 'branch', 'world', 'soup', 'code', 'node', 'list', 'seed', 'start', 'end', 'windows', 'censuses'],
  census: ['type', 'epoch', 'window', 'windowStart', 'exposure', 'D', 'Dbroad'],
  appearance: ['type', 'epoch', 'window', 'id', 'cells', 'bytes', 'exposureD', 'exposureDbroad', 'descent', 'descentBroad', 'mutNew', 'arith', 'self', 'origCells', 'presentAtStart', 'baseline'],
  pair: ['type', 'epoch', 'window', 'a', 'b', 'shared', 'same', 'mirror', 'aligned', 'distance', 'nullPairs', 'nullHist', 'nullHistAligned'],
  end: ['type', 'branch', 'measuresChecked', 'invariantChecks', 'fingerprint', 'seconds', 'rssMB'],
};
const exactKeys = (x) => sameJSON(Object.keys(x).sort(), [...KEYS[x.type]].sort());

function setInfo(x, n, keys, name, bad) {
  if (x === null) return;
  if (typeof x !== 'object' || !sameJSON(Object.keys(x).sort(), ['A', 'B', 'carriers', 'excluded', 'far', 'heldOut', 'thr'])) { bad.push(`${name}: not the fields of a set's controls`); return; }
  if (!isInt(x.carriers, 0, n) || !isInt(x.excluded, 0, x.carriers) || !isInt(x.A) || !isInt(x.B) || x.A + x.B !== x.carriers - x.excluded || x.A !== Math.ceil((x.A + x.B) / 2)) bad.push(`${name}: the carriers and the halves do not add up`);
  if (!x.far || !isInt(x.far.cells, 0, n) || !sameJSON(Object.keys(x.thr).sort(), [...keys].sort()) || !sameJSON(Object.keys(x.heldOut).sort(), [...keys].sort()) || !sameJSON(Object.keys(x.far.hist ?? {}).sort(), [...keys].sort())) { bad.push(`${name}: not the variants of the note`); return; }
  for (const k of keys) {
    if (!isInt(x.thr[k], 2, Math.max(2, x.A))) bad.push(`${name}: an impossible threshold (${k})`);
    if (!isHist(x.heldOut[k], x.B)) bad.push(`${name}: half B's histogram does not add up (${k})`);
    if (!isHist(x.far.hist[k], x.far.cells)) bad.push(`${name}: the far cells' histogram does not add up (${k})`);
  }
}

export function validate({ list, records, files = null, pilot, n: nWorld = 512 * 256 }) {
  const problems = [];
  const ids = list.branches.map((b) => b.id);
  if (files) {
    const want = ids.map((id) => `${id}.jsonl`).sort(), have = [...files].sort();
    if (!sameJSON(want, have)) problems.push(`the folder does not hold exactly the list's records (${have.length} files, ${want.length} expected)`);
  }
  const codes = new Set();
  for (const br of list.branches) {
    const L = records.get(br.id), pr = pilot.get(br.id), bad = [];
    if (!L) { problems.push(`${br.id}: no record`); continue; }
    if (!pr) { problems.push(`${br.id}: no pilot record to check it against`); continue; }
    const n = pr.n ?? nWorld;
    if (!Array.isArray(L) || L.length < 2 || L.some((x) => !x || typeof x !== 'object' || !TYPES.has(x.type) || !exactKeys(x))) { problems.push(`${br.id}: a line that is not of the note's types and fields`); continue; }
    const S = L[0], E = L.at(-1);
    if (S.type !== 'start' || E.type !== 'end' || L.slice(1, -1).some((x) => x.type === 'start' || x.type === 'end')) { problems.push(`${br.id}: not one start line first and one end line last`); continue; }
    // the start and end lines, against the list and the pilot's record
    if (S.branch !== br.id || String(S.world) !== String(br.world) || S.soup !== br.soup || typeof S.code !== 'string' || !/^[0-9a-f]{7,40}$/.test(S.code) || typeof S.node !== 'string'
      || S.seed !== pr.seed || S.start !== pr.start || S.end !== pr.end || !sameJSON(S.windows, WINDOWS) || !sameJSON(S.censuses, br.observers.map((o) => o.epoch))) bad.push('the start line is not of this branch, of its pilot record or of one clean commit');
    if (typeof S.list !== 'string' || !/^[0-9a-f]{64}$/.test(S.list)) bad.push('the start line has no list SHA-256');
    if (E.branch !== br.id || E.fingerprint !== pr.fingerprint || E.measuresChecked !== pr.measures || !isInt(E.invariantChecks, pr.measures) || typeof E.seconds !== 'number' || !Number.isFinite(E.seconds) || E.seconds < 0 || !isInt(E.rssMB)) bad.push('the end line is not of this branch or of its pilot record');
    codes.add(S.code); codes.add(`list:${S.list}`);
    // exactly the lines the list asks for, once each
    const want = new Set();
    for (const o of br.observers) for (const w of WINDOWS) {
      want.add(`census|${o.epoch}|${w}`);
      for (const y of o.appearances) want.add(`appearance|${o.epoch}|${w}|${y.id}`);
      for (let i = 0; i < o.appearances.length; i++) for (let j = i + 1; j < o.appearances.length; j++) want.add(`pair|${o.epoch}|${w}|${o.appearances[i].id}|${o.appearances[j].id}`);
    }
    const seen = new Set();
    for (const x of L.slice(1, -1)) {
      const key = x.type === 'census' ? `census|${x.epoch}|${x.window}` : x.type === 'appearance' ? `appearance|${x.epoch}|${x.window}|${x.id}` : `pair|${x.epoch}|${x.window}|${x.a}|${x.b}`;
      if (!want.has(key)) { bad.push(`a line the list does not ask for (${key})`); continue; }
      if (seen.has(key)) { bad.push(`a line twice (${key})`); continue; }
      seen.add(key);
      const o = br.observers.find((q) => q.epoch === x.epoch), hasD = o.sets.some((s) => s.name === 'D'), hasB = o.sets.some((s) => s.name === 'Dbroad');
      if (x.type === 'census') {
        if (x.windowStart !== Math.max(pr.start, x.epoch - x.window)) bad.push(`census ${x.epoch}/${x.window}: the window's start`);
        if (!Array.isArray(x.exposure) || !sameJSON(x.exposure.map((s) => s.name), o.sets.map((s) => s.name))
          || x.exposure.some((s) => !sameJSON(Object.keys(s).sort(), ['carriers', 'carriersAtStart', 'flagged', 'name', 'ok']) || !isInt(s.carriers, 0, n) || !isInt(s.carriersAtStart, 0, n) || !isInt(s.ok) || !isInt(s.flagged) || s.ok + s.flagged > s.carriers)) bad.push(`census ${x.epoch}/${x.window}: the exposure controls`);
        if ((x.D === null) === hasD || (x.Dbroad === null) === hasB) bad.push(`census ${x.epoch}/${x.window}: D or Dbroad, present or not, against the list`);
        setInfo(x.D, n, VARIANTS.map((v) => v.key), `census ${x.epoch}/${x.window}, D`, bad);
        setInfo(x.Dbroad, n, [MAIN], `census ${x.epoch}/${x.window}, Dbroad`, bad);
        const dc = x.D ? x.D.carriers : null, ec = Array.isArray(x.exposure) ? x.exposure.find((s) => s && s.name === 'D') : null;
        if (x.D && ec && ec.carriers !== dc) bad.push(`census ${x.epoch}/${x.window}: D's carriers differ between the exposure and the descent controls`);
      } else if (x.type === 'appearance') {
        const y = o.appearances.find((q) => q.id === x.id), N = y.cells.length * P;
        if (!sameJSON(x.cells, y.cells) || x.bytes !== N) bad.push(`${x.id}: the cells are not the list's`);
        if ((x.exposureD === null) === hasD || (x.exposureDbroad === null) === hasB || (x.descent === null) === hasD || (x.descentBroad === null) === hasB || (x.baseline === null) === hasD) bad.push(`${x.id}: D or Dbroad, present or not, against the list`);
        if (x.exposureD !== null && !isInt(x.exposureD, 0, N)) bad.push(`${x.id}: an impossible exposure`);
        if (x.exposureDbroad !== null && !isInt(x.exposureDbroad, 0, N)) bad.push(`${x.id}: an impossible exposure (Dbroad)`);
        if (x.descent !== null && (typeof x.descent !== 'object' || !sameJSON(Object.keys(x.descent).sort(), VARIANTS.map((v) => v.key).sort()) || Object.values(x.descent).some((k) => !isInt(k, 0, N)))) bad.push(`${x.id}: an impossible descent score`);
        if (x.descentBroad !== null && !isInt(x.descentBroad, 0, N)) bad.push(`${x.id}: an impossible descent score (Dbroad)`);
        if (!isInt(x.mutNew, 0, N) || !isInt(x.arith, 0, N) || !isInt(x.self, 0, N) || !isInt(x.presentAtStart, 0, n)) bad.push(`${x.id}: an impossible count`);
        const oc = x.origCells && typeof x.origCells === 'object' ? Object.entries(x.origCells) : null;
        if (!oc || oc.some(([c, k]) => !/^\d+$/.test(c) || !isInt(Number(c), 0, n - 1) || !isInt(k, 1, N)) || oc.reduce((s, [, k]) => s + k, 0) + x.mutNew !== N) bad.push(`${x.id}: impossible origins`);
        if (x.baseline) {
          const b = x.baseline, m = Array.isArray(b.cells) ? b.cells.length : -1;
          if (!sameJSON(Object.keys(b).sort(), ['cells', 'descent', 'distance', 'exposure']) || !isInt(b.distance) || m < 0 || m > 200 || new Set(b.cells).size !== m || b.cells.some((c) => !isInt(c, 0, n - 1) || y.cells.includes(c))
            || !Array.isArray(b.exposure) || b.exposure.length !== m || b.exposure.some((k) => !isInt(k, 0, P))
            || !b.descent || !sameJSON(Object.keys(b.descent).sort(), VARIANTS.map((v) => v.key).sort()) || Object.values(b.descent).some((a) => !Array.isArray(a) || a.length !== m || a.some((k) => !isInt(k, 0, P)))) bad.push(`${x.id}: an impossible baseline`);
        }
      } else {
        if (!isInt(x.shared, 0, P - 1) || !isInt(x.same, 0, P) || !isInt(x.mirror, 0, P) || x.aligned !== Math.max(x.same, x.mirror) || !isInt(x.distance) || !isInt(x.nullPairs) || !isHist(x.nullHist, x.nullPairs) || x.nullHist[P] !== 0 || !isHist(x.nullHistAligned, x.nullPairs)) bad.push(`pair ${x.a}/${x.b}: impossible counts`);
      }
    }
    if (seen.size !== want.size) bad.push(`${want.size - seen.size} lines the list asks for are missing`);
    if (bad.length) problems.push(`${br.id}: ${bad.slice(0, 3).join('; ')}${bad.length > 3 ? '; …' : ''}`);
  }
  const commits = [...codes].filter((c) => !c.startsWith('list:')), lists = [...codes].filter((c) => c.startsWith('list:'));
  if (commits.length > 1 || lists.length > 1) problems.push(`the records are not of one commit and one list (${[...codes].join(', ')})`);
  return { problems, code: commits[0] ?? null };
}

// The pilot's facts a record must match: its seed, start, end, fingerprint and number of measures (from the pilot's record in git)
export function pilotFacts(list, readRecord) {
  const m = new Map();
  for (const br of list.branches) {
    const rec = readRecord(br.record), S = rec[0], E = rec.at(-1);
    m.set(br.id, { seed: S.seed, start: S.start, end: E.epoch, fingerprint: E.fingerprint, measures: rec.filter((l) => l.type === 'measure' && l.epoch > S.start && l.epoch <= E.epoch).length, n: S.world[0] * S.world[1] });
  }
  return m;
}
