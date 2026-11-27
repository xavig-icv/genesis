// A record of copy events (exploratory; the note, README.md): the records' check. It fails closed: any record that is missing, of another
// commit or impossible makes validate() return problems, and the analysis then reads nothing. prova.mjs feeds it impossible records.
//
// validate({ list, records, files, pilot, code, her }) -> { problems, n }: list, the parsed llista.json; records, a Map id -> array of
// parsed lines; files, the names in the records' folder; pilot, a Map id -> { seed, measures, fingerprint } from the pilot's records;
// code, the computation's commit (8 hex digits); her (optional), the census's test: the evidence's states are tested again.
import { PROGRAM_SIZE } from '../../../../fase1/bff.js';
import { K, THETA, REPLACE, MAX_HOPS } from './cadena.mjs';
import { LIST_SHA256, STEP, FOLLOW_RADIUS, K_SENS } from './comu.mjs';

const P = PROGRAM_SIZE;
const ENDS = new Set(['birth', 'earlier lineage', 'older', 'unresolved']);
const isN = (x) => Number.isSafeInteger(x) && x >= 0;
const isHex = (s) => typeof s === 'string' && /^[0-9a-f]{128}$/.test(s);
const fromHex = (s) => Uint8Array.from(s.match(/../g), (h) => parseInt(h, 16));

// One chain of one cell: its problems (strings)
function chainProblems(ch, { cell, census, w0, n, her }) {
  const bad = [];
  if (!ch || !ENDS.has(ch.end)) return ['an end that is not one of the four'];
  if (!Array.isArray(ch.hops)) return ['no hops'];
  let at = cell, last = census;
  ch.hops.forEach((x, i) => {
    if (x.cell !== at) bad.push(`hop ${i} does not start where the chain is`);
    if (!isN(x.epoch) || x.epoch > last || x.epoch <= w0) bad.push(`hop ${i}: an epoch out of the window or later than the step before`);
    if (!isN(x.to) || x.to >= n) bad.push(`hop ${i}: a cell out of the world`);
    if (x.kind === 'inherited') {
      const m = x.material;
      if (!m || !isN(m.H) || m.H < THETA || m.H > P || !isN(m.given) || m.given > m.H || m.H + m.U + m.N !== P) bad.push(`hop ${i}: an inheritance without half its bytes from heritable holders`);
      if (x.step !== 'interaction' && x.step !== 'mutation') bad.push(`hop ${i}: a step that is not one of the two`);
      if (!x.states || !isHex(x.states.before) || !isHex(x.states.after)) bad.push(`hop ${i}: no states`);
      else if (her && (her(fromHex(x.states.before)) || !her(fromHex(x.states.after)))) bad.push(`hop ${i}: the states are not an acquisition by the census's test`);
      if (!isN(x.toEpoch) || x.toEpoch > x.epoch || x.toEpoch < w0) bad.push(`hop ${i}: the holder's point is not before the step, in the window`);
    } else if (x.kind === 'replacement') {
      if (!isN(x.F) || x.F < REPLACE || x.F > P || x.toEpoch !== x.epoch || x.toPhase !== 'M') bad.push(`hop ${i}: a replacement with fewer than half the cell from the partner`);
    } else bad.push(`hop ${i}: a kind that is not one of the two`);
    at = x.to; last = x.toEpoch ?? x.epoch;
  });
  if (ch.hops.length > MAX_HOPS + 1 || (ch.end === 'unresolved' && ch.why === 'hops' && ch.hops.length !== MAX_HOPS + 1)) bad.push('more hops than the cap');
  if (ch.end === 'birth') {
    const m = ch.material;
    if (ch.cell !== at) bad.push('the end is not where the chain is');
    if (!isN(ch.epoch) || ch.epoch > last || ch.epoch <= w0 || (ch.step !== 'interaction' && ch.step !== 'mutation')) bad.push('a birth out of the window or of no step');
    if (!m || !isN(m.H) || !isN(m.U) || m.H + m.U + m.N !== P) bad.push('a birth without the count of its bytes');
    else if (m.H >= THETA) bad.push('a birth with half its bytes or more from heritable holders');
    if (!ch.states || !isHex(ch.states.before) || !isHex(ch.states.after)) bad.push('no states');
    else if (her && (her(fromHex(ch.states.before)) || !her(fromHex(ch.states.after)))) bad.push('the states are not an acquisition by the census\'s test');
  } else if (ch.end === 'unresolved' && ch.why !== 'hops') bad.push('an unresolved end of no kind');
  if (ch.end === 'earlier lineage' && (![1, 2, 3].includes(ch.bits) || ch.cell !== at || !ch.hops.length)) bad.push('an earlier lineage with no carrier bits, or not at the last hop');
  if (ch.end === 'older' && ch.cell !== at) bad.push('older, not where the chain is');
  return bad;
}

// The pilot's facts each record must match: the seed, the measures in (start, end] and the final fingerprint
export function pilotFacts(list, readRecord) {
  const m = new Map();
  for (const br of list.branches) {
    const rec = readRecord(br.record), S = rec[0], E = rec.at(-1);
    m.set(br.id, { seed: S.seed, fingerprint: E.fingerprint, measures: rec.filter((l) => l.type === 'measure' && l.epoch > S.start && l.epoch <= E.epoch).length });
  }
  return m;
}

export function validate({ list, records, files, pilot, code, her = null }) {
  const problems = [];
  let n = 0;
  if (!/^[0-9a-f]{8}$/.test(String(code))) return { problems: ['the computation\'s commit is not 8 hex digits'], n };
  const names = new Set(list.branches.map((b) => `${b.id}.jsonl.gz`));
  for (const f of files) if (!names.has(f)) problems.push(`a file in the records' folder that is not of the list: ${f}`);
  for (const b of list.branches) {
    const L = records.get(b.id);
    if (!L) { problems.push(`${b.id}: no record`); continue; }
    const S = L[0], Z = L.at(-1), pf = pilot.get(b.id), nn = 512 * 256;
    const bad = [];
    if (S?.type !== 'start' || Z?.type !== 'end') bad.push('no start or end line');
    else {
      if (S.branch !== b.id || String(S.world) !== String(b.world) || S.soup !== b.soup || S.list !== LIST_SHA256 || S.code !== code || S.start !== b.start || S.end !== b.end) bad.push('the start line is not of the list\'s branch, of its list or of the computation\'s commit');
      if (!pf || S.seed !== pf.seed) bad.push('the seed is not the pilot\'s');
      const R = S.rules ?? {};
      if (R.K !== K || R.kSensitivity !== K_SENS || R.theta !== THETA || R.replace !== REPLACE || R.maxHops !== MAX_HOPS || R.step !== STEP || R.followRadius !== FOLLOW_RADIUS) bad.push('the rules are not the note\'s');
      if (JSON.stringify(S.censuses) !== JSON.stringify(b.censuses.map((c) => ({ epoch: c.epoch, w0: c.w0 })))) bad.push('the censuses are not the list\'s');
      const wanted = new Set(); for (const c of b.censuses) for (let e = c.w0; e <= c.epoch; e += STEP) wanted.add(e);
      if (!pf || Z.branch !== b.id || Z.measuresChecked !== pf.measures || Z.fingerprint !== pf.fingerprint || Z.checkpoints !== wanted.size || !isN(Z.replays) || Z.replays < 1 || !isN(Z.heritabilityTests) || Z.heritabilityTests < 1)
        bad.push('the end line does not check the pilot\'s measures and fingerprint, or the checkpoints');
    }
    if (L.some((l) => l.type === 'fail')) bad.push('a fail line');
    // per census, its appearances' lines and then its reference lineages' lines, in the list's order
    const body = L.slice(1, -1);
    const want = b.censuses.flatMap((c) => [...c.appearances.map((y) => ({ c, y, type: 'appearance' })), ...(c.references ?? []).map((y) => ({ c, y, type: 'reference' }))]);
    if (body.length !== want.length || body.some((l, i) => l.type !== want[i].type)) bad.push('not one line per appearance and reference lineage of the list, in its order');
    else want.forEach(({ c, y, type }, i) => {
      const l = body[i];
      const same = l.id === y.id && l.census === c.epoch && l.w0 === c.w0 && Array.isArray(l.cells) && JSON.stringify(l.cells.map((x) => x.cell)) === JSON.stringify(y.cells)
        && (type === 'appearance' ? l.timeRule === y.timeRule : l.first === y.first && l.rooted === y.rooted && y.first >= c.w0 && y.first <= c.epoch);
      if (!same) { bad.push(`${y.id}: not the list's ${type}`); return; }
      const start = type === 'appearance' ? c.epoch : y.first;
      for (const x of l.cells) for (const k of ['main', 'sensitivity']) {
        const p = start === c.w0 ? (x.chains?.[k]?.end === 'older' && x.chains[k].hops?.length === 0 ? [] : ['a chain that starts at the window\'s start is not older']) : chainProblems(x.chains?.[k], { cell: x.cell, census: start, w0: c.w0, n: nn, her });
        for (const q of p) bad.push(`${type} ${y.id}, cell ${x.cell}, ${k}: ${q}`);
        n++;
      }
    });
    if (bad.length) problems.push(`${b.id}: ${bad.slice(0, 4).join('; ')}${bad.length > 4 ? `; … (${bad.length})` : ''}`);
  }
  return { problems, n };
}
