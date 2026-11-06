// La repetició dels càlculs de B1 que venen després del nivell 1 (docs/pla-b1.md, §11): un registre tornat a fer sencer, comparat
// amb l'original. No escriu cap recompte: només si coincideix o què no coincideix.
//
//   node eines/b1-compara.mjs ORIGINAL.jsonl REPETICIO.jsonl
//
// Han de coincidir: la línia d'inici, llevat del fitxer de --json de l'ordre (el codi, els mòduls, Node i els paràmetres, iguals);
// totes les línies d'entremig, byte a byte; i la línia final, llevat dels segons. Surt amb 0 si tot coincideix, i amb 1 si no.
import { readFileSync } from 'fs';
import { pathToFileURL } from 'url';

export function compare(a, b) {
  const la = readFileSync(a, 'utf8').split('\n').filter((l) => l !== ''), lb = readFileSync(b, 'utf8').split('\n').filter((l) => l !== '');
  const problems = [];
  if (la.length < 2 || lb.length < 2) return ['un dels dos no és sencer'];
  const sa = JSON.parse(la[0]), sb = JSON.parse(lb[0]), ea = JSON.parse(la[la.length - 1]), eb = JSON.parse(lb[lb.length - 1]);
  if (sa.type !== 'start' || sb.type !== 'start' || ea.type !== 'end' || eb.type !== 'end') return ['un dels dos no és sencer'];
  const noJson = (c) => (c ?? '').replace(/ --json \S+$/, '');
  if (noJson(sa.command) !== noJson(sb.command)) problems.push("l'ordre no és la mateixa (llevat de --json)");
  for (const k of new Set([...Object.keys(sa), ...Object.keys(sb)])) {
    if (k !== 'command' && JSON.stringify(sa[k]) !== JSON.stringify(sb[k])) problems.push(`la línia d'inici: ${k}`);
  }
  if (la.length !== lb.length) problems.push(`${la.length} línies i ${lb.length}`);
  for (let i = 1; i < Math.min(la.length, lb.length) - 1; i++) if (la[i] !== lb[i]) { problems.push(`la línia ${i + 1} no és la mateixa`); break; }
  for (const k of new Set([...Object.keys(ea), ...Object.keys(eb)])) {
    if (k !== 'seconds' && JSON.stringify(ea[k]) !== JSON.stringify(eb[k])) problems.push(`la línia final: ${k}`);
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [a, b] = process.argv.slice(2);
  if (!a || !b || process.argv.length !== 4) { console.error('Ús: node eines/b1-compara.mjs ORIGINAL.jsonl REPETICIO.jsonl'); process.exit(2); }
  const problems = compare(a, b);
  console.log(problems.length ? `No coincideixen: ${problems.join('; ')}` : 'Coincideixen');
  process.exit(problems.length ? 1 : 0);
}
