// B1, el nivell 1 (docs/pla-b1.md, §11, i el README del nivell 1): la repetició de tres trossos, comparada amb les tirades.
// Escrit el 05-11-2026, abans de llançar la repetició i sense haver mirat cap registre.
//
//   node fase2/resultats/b1/nivell1/repeticio/compara.mjs REGISTRES REPETICIO TROS...
//
// Per a cada tirada de REGISTRES (els JSONL del nivell 1) i cada TROS (de 0 a 99, els trossos de 10⁵ programes de `--tros`), la
// repetició, REPETICIO/<tirada>-tros<TROS>.jsonl, ha de:
//   - ser sencera: la línia d'inici, els replicadors, un sol recompte i la línia final;
//   - venir del mateix codi i de la mateixa tirada: a la línia d'inici, els mateixos `code`, `modules` i `node`, i la mateixa
//     química, distribució, llavor, soroll, tros i prova, amb `from` al començament del tros i 10⁵ programes;
//   - tenir els mateixos replicadors que el tros de la tirada, línia a línia i byte a byte;
//   - tenir el recompte del tros: la diferència entre el recompte acumulat de la tirada al final del tros i el d'abans.
// No escriu cap recompte: només si coincideix o què no coincideix. Surt amb 0 si tot coincideix, i amb 1 si no.
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

const CHUNK = 100000, CHUNKS = 100;
const KEYS = ['tested', 'replicates', 'heritable', 'heritableSolo', 'heritableContext'];
const SAME = ['code', 'modules', 'node', 'chemistry', 'description', 'distribution', 'seed', 'noise', 'chunk', 'test'];

const usage = (msg) => {
  if (msg) console.error(msg);
  console.error('Ús: node compara.mjs REGISTRES REPETICIO TROS...');
  process.exit(2);
};
const [dirRuns, dirRep, ...chunkArgs] = process.argv.slice(2);
if (!dirRuns || !dirRep || chunkArgs.length === 0) usage();
const chunks = chunkArgs.map((s) => (/^\d+$/.test(s) && Number(s) < CHUNKS ? Number(s) : usage(`tros no vàlid: ${s}`)));
if (new Set(chunks).size !== chunks.length) usage('un tros repetit');

const typeOf = (l) => /^\{"type":"([a-z]+)"/.exec(l)?.[1];
const lines = (file) => readFileSync(file, 'utf8').split('\n').filter((l) => l !== '');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Els trossos demanats d'una tirada: els seus replicadors (les línies, tal com són) i els recomptes acumulats d'abans i de després
function runChunks(file) {
  const ls = lines(file);
  if (typeOf(ls[0]) !== 'start') throw new Error("no comença amb la línia d'inici");
  if (typeOf(ls[ls.length - 1]) !== 'end') throw new Error('no és sencera');
  const start = JSON.parse(ls[0]);
  if (start.from !== 0 || start.chunk !== CHUNK || start.programs !== CHUNK * CHUNKS) throw new Error('no és una tirada del nivell 1');
  const wanted = new Set(chunks), out = new Map();
  let before = Object.fromEntries(KEYS.map((k) => [k, 0])), upTo = 0, reps = [];
  for (let i = 1; i < ls.length - 1; i++) {
    const t = typeOf(ls[i]);
    if (t === 'replicator') { reps.push(ls[i]); continue; }
    if (t !== 'count') throw new Error(`una línia de tipus ${t}, la ${i + 1}`);
    const count = JSON.parse(ls[i]);
    if (count.upTo !== upTo + CHUNK) throw new Error(`un recompte fora d'ordre, a la línia ${i + 1}`);
    if (wanted.has(upTo / CHUNK)) out.set(upTo / CHUNK, { reps, before, after: count });
    before = count;
    upTo = count.upTo;
    reps = [];
  }
  if (upTo !== CHUNK * CHUNKS || reps.length) throw new Error('els recomptes no arriben al final');
  return { start, chunks: out };
}

// Per què la repetició del tros c no coincideix amb la tirada, o null si coincideix
function compare(name, run, c) {
  const file = join(dirRep, `${name}-tros${c}.jsonl`);
  if (!existsSync(file)) return 'no hi ha la repetició';
  const ls = lines(file);
  if (ls.length < 3 || typeOf(ls[0]) !== 'start' || typeOf(ls[ls.length - 2]) !== 'count' || typeOf(ls[ls.length - 1]) !== 'end') {
    return 'la repetició no és sencera';
  }
  const start = JSON.parse(ls[0]), count = JSON.parse(ls[ls.length - 2]), end = JSON.parse(ls[ls.length - 1]);
  const diff = SAME.filter((k) => !same(start[k], run.start[k]));
  if (diff.length) return `la línia d'inici no és la de la tirada: ${diff.join(', ')}`;
  if (start.from !== c * CHUNK || start.programs !== CHUNK || start.to !== (c + 1) * CHUNK) return 'la repetició no és el tros';
  const reps = ls.slice(1, -2), orig = run.chunks.get(c);
  if (reps.some((l) => typeOf(l) !== 'replicator')) return "la repetició té més d'un recompte, o una línia d'un altre tipus";
  if (reps.length !== orig.reps.length) return 'un nombre diferent de replicadors';
  if (reps.some((l, i) => l !== orig.reps[i])) return 'els replicadors no coincideixen, línia a línia';
  const outside = orig.reps.some((l) => {
    const x = JSON.parse(l).index;
    return !(x >= c * CHUNK && x < (c + 1) * CHUNK);
  });
  if (outside) return 'un replicador del tros és fora del tros';
  if (count.upTo !== (c + 1) * CHUNK) return 'el recompte de la repetició no és al final del tros';
  const bad = KEYS.filter((k) => count[k] !== orig.after[k] - orig.before[k]);
  if (bad.length) return `els recomptes no coincideixen: ${bad.join(', ')}`;
  if (count.tested !== CHUNK) return 'la repetició no ha provat 10⁵ programes';
  if (end.from !== start.from || end.to !== start.to || KEYS.some((k) => end[k] !== count[k])) {
    return 'la línia final de la repetició no és la del seu recompte';
  }
  return null;
}

const names = readdirSync(dirRuns).filter((f) => f.endsWith('.jsonl')).sort().map((f) => basename(f, '.jsonl'));
if (names.length === 0) usage(`no hi ha cap registre a ${dirRuns}`);
let ok = 0, total = 0;
for (const name of names) {
  let run;
  try {
    run = runChunks(join(dirRuns, `${name}.jsonl`));
  } catch (e) {
    console.log(`${name}: la tirada no es pot llegir: ${e.message}`);
    total += chunks.length;
    continue;
  }
  for (const c of chunks) {
    total++;
    const why = compare(name, run, c);
    if (why) console.log(`${name}, tros ${c}: NO COINCIDEIX: ${why}`);
    else {
      ok++;
      console.log(`${name}, tros ${c}: coincideix`);
    }
  }
}
// cap registre de més a la repetició
const expected = new Set(names.flatMap((n) => chunks.map((c) => `${n}-tros${c}.jsonl`)));
const extra = readdirSync(dirRep).filter((f) => f.endsWith('.jsonl') && !expected.has(f));
if (extra.length) console.log(`a la repetició, registres que no són de cap tirada ni de cap tros: ${extra.join(', ')}`);
console.log(`${ok} de ${total} coincideixen`);
process.exit(ok === total && !extra.length ? 0 : 1);
