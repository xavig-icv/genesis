// Exploratori (la maduració, pas 2b; el README d'aquesta carpeta, escrit abans de calcular): el resum del recompte amb companys inerts.
//
//   node fase2/resultats/maduracio/recompte/recompte-analisi.mjs [--tots] FITXER.jsonl... > recompte-sortida.txt
//
// Abans de comptar res, comprova cada registre de recompte.mjs: la línia d'inici (la llavor, les condicions, la química, les columnes i un
// codi sense canvis), una línia per sopa i la final; cada món i braç, una sola vegada, amb els tres braços; tots el mateix codi; i, amb
// --tots, els 150 mons inclosos del manifest. Si alguna cosa no hi és, ho diu i no compta res.
//
// Les classes, les de la prova d'autonomia de B1: de les 100 condicions de companys inerts, en almenys una, en 95 o més, i en totes.
// «Es copia»: sol o en context, a la mateixa condició. «Hereditari»: hereditari sol o en context, a la mateixa condició.
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { includedWorlds, ROOT, ARMS, SEED, CONDITIONS, CHEMISTRY, FIELDS } from './recompte.mjs';

const NAMES = { continue: "l'envellida", 'shuffle-all': 'la barrejada', reinit: 'la nova' };
const CLASSES = [['en alguna', (n) => n >= 1], ['en 95 o més', (n) => n >= 95], ['en totes 100', (n) => n >= 100]];
const col = Object.fromEntries(FIELDS.map((f, i) => [f, i]));

export function readRecords(files, { all = false, root = ROOT } = {}) {
  const soups = new Map(), problems = [], codes = new Set();
  for (const f of files) {
    let lines;
    try { lines = readFileSync(f, 'utf8').split('\n').filter((l) => l.trim() !== '').map((l) => JSON.parse(l)); } catch (e) { problems.push(`${f}: no es pot llegir (${e.message})`); continue; }
    const s = lines[0], e = lines[lines.length - 1];
    if (s?.type !== 'start' || e?.type !== 'end') { problems.push(`${f}: incomplet (sense la línia d'inici o la final)`); continue; }
    if (s.seed !== SEED || s.conditions !== CONDITIONS || s.chemistry !== CHEMISTRY || JSON.stringify(s.fields) !== JSON.stringify(FIELDS)) problems.push(`${f}: no és del pla (la llavor, les condicions, la química o les columnes)`);
    if (typeof s.code !== 'string' || s.code.includes('+canvis') || s.code === 'desconeguda') problems.push(`${f}: el codi no és un commit net (${s.code})`);
    codes.add(s.code);
    const body = lines.slice(1, -1);
    if (body.length !== e.soups || body.some((o) => o.type !== 'soup')) problems.push(`${f}: ${body.length} línies de sopa, i la línia final en diu ${e.soups}`);
    for (const o of body) {
      const k = `${o.world} ${o.arm}`;
      if (soups.has(k)) problems.push(`${k}: hi és més d'una vegada`);
      soups.set(k, o);
    }
  }
  if (codes.size > 1) problems.push(`els registres són de codis diferents: ${[...codes].join(', ')}`);
  const worlds = [...new Set([...soups.values()].map((o) => o.world))];
  for (const w of worlds) for (const arm of ARMS) if (!soups.has(`${w} ${arm}`)) problems.push(`${w} ${arm}: hi falta`);
  if (all) for (const w of includedWorlds(root).map((x) => x.world)) if (!worlds.includes(w)) problems.push(`${w}: hi falta el món`);
  return { soups, worlds, problems, codes: [...codes] };
}

const f2 = (x) => x.toFixed(2);
const sum = (v) => v.reduce((s, x) => s + x, 0);

export function summary({ soups, worlds, codes }) {
  const out = [];
  out.push(`El recompte amb companys inerts (la maduració, pas 2b; exploratori): ${worlds.length} mons, ${soups.size} sopes; el codi ${codes.join(', ')}`);
  out.push(`La prova: la d'autonomia de B1, ${CHEMISTRY}, ${CONDITIONS} condicions de companys inerts, la llavor ${SEED}`);
  const per = (arm, fn) => worlds.map((w) => fn(soups.get(`${w} ${arm}`)));
  const count = (o, field, test) => o.positives.filter((p) => test(p[col[field]])).length;
  for (const arm of ARMS) {
    out.push('');
    out.push(`${NAMES[arm]} (${arm}), ${worlds.length} sopes de ${soups.get(`${worlds[0]} ${arm}`).cells} cel·les:`);
    const rep = per(arm, (o) => o.replicating), her = per(arm, (o) => o.heritable);
    out.push(`  l'escaneig (la prova del cens, amb companys de soroll): es repliquen ${sum(rep)} (${f2(sum(rep) / worlds.length)} per sopa); hereditàries ${sum(her)} (${f2(sum(her) / worlds.length)} per sopa)`);
    for (const [label, field] of [['es copien', 'anyCopy'], ['són hereditàries', 'anyHeritable']]) {
      const parts = CLASSES.map(([name, test]) => { const v = per(arm, (o) => count(o, field, test)); return `${name}, ${sum(v)} (${f2(sum(v) / worlds.length)} per sopa)`; });
      out.push(`  amb companys inerts, ${label}: ${parts.join('; ')}`);
    }
    const herClean = per(arm, (o) => o.positives.filter((p) => p[col.scanHeritable] === 1 && p[col.anyHeritable] >= 1).length);
    out.push(`  de les hereditàries de l'escaneig, ho són també amb companys inerts (en alguna condició): ${sum(herClean)} de ${sum(her)}`);
  }
  // A2, món a món, amb els recomptes nets (es copien amb companys inerts en alguna condició)
  const clean = (o) => count(o, 'anyCopy', (n) => n >= 1);
  const cmp = (a, b, fn) => {
    let up = 0, eq = 0, down = 0;
    for (const w of worlds) { const x = fn(soups.get(`${w} ${a}`)), y = fn(soups.get(`${w} ${b}`)); if (x > y) up++; else if (x === y) eq++; else down++; }
    return `${up} més, ${eq} igual, ${down} menys`;
  };
  out.push('');
  out.push('Món a món (A2), les cel·les que es copien amb companys inerts en alguna condició:');
  out.push(`  l'envellida contra la nova: ${cmp('continue', 'reinit', clean)}`);
  out.push(`  la barrejada contra la nova: ${cmp('shuffle-all', 'reinit', clean)}`);
  out.push(`  (amb l'escaneig, per comparar: l'envellida contra la nova, ${cmp('continue', 'reinit', (o) => o.replicating)}; la barrejada contra la nova, ${cmp('shuffle-all', 'reinit', (o) => o.replicating)})`);
  return out.join('\n');
}

function main(argv) {
  const all = argv.includes('--tots'), files = argv.filter((a) => a !== '--tots');
  if (!files.length) { console.error('Ús: node fase2/resultats/maduracio/recompte/recompte-analisi.mjs [--tots] FITXER.jsonl... > recompte-sortida.txt'); process.exit(2); }
  const r = readRecords(files, { all });
  if (r.problems.length) { console.log(`No compto res:\n${r.problems.map((p) => `  ${p}`).join('\n')}`); process.exit(1); }
  console.log(summary(r));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main(process.argv.slice(2));
