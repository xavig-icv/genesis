# B2 · Repartiment dels mons entre l'exploració i la confirmació

**Què és.** La pregunta de B2 (pla de la iteració 4) és quant dura la vida establerta, i si el corrent hi
influeix. Es respon amb branques aparellades: cada món, continuat des de la captura de la seva època
d'establiment *t*, amb *m* = 0 i amb *m* = 0,01.

Els dos auditors de l'auditoria 7 van demanar el mateix (AUD-54 i la recomanació de l'auditor 2). Si
una exploració ha d'ajudar a decidir el disseny, cal reservar mons d'origen per a la confirmació, i el
món n'és la unitat de mostreig. Les llavors de continuació d'un mateix món no són rèpliques
independents.

**Com s'ha fet (18-10-2026, abans de fer cap branca).**
- **Els mons:** els 58 mons amb establiment de la sèrie de la llei 2, 24 del món quiet (A) i 34 del
  corrent 0,01 (B). Tots tenen la captura de l'època *t* al banc (`docs/captures.md`).
- **El repartiment:** a l'atzar dins de cada grup, la meitat per a l'exploració i la meitat per a la
  confirmació. Al món quiet en surten 12 i 12, i al corrent, 17 i 17.
- **La llavor del generador:** 20261018, fixada abans de veure el resultat.
- **Mètode:** les llavors amb establiment de cada grup, ordenades de menor a major i barrejades amb
  Fisher–Yates, amb un sol generador `makeRng(20261018, 'v2')` per als dos grups (primer A i després B).
  La primera meitat de l'ordre barrejat és l'exploració.
- **El fitxer:** `repartiment.json` porta, per a cada món, el grup, la llavor, *t*, la part, el camí de
  la captura i la seva SHA-256 (la de `captures.sha256`).

**La regla.** Les branques de l'exploració només es fan amb els mons de la part `exploracio`. Els de la
part `confirmacio` no es fan servir per a res fins que hi hagi un protocol preregistrat.

**El codi que ho reprodueix** (amb el commit d'aquest fitxer; `node b2-repartiment.mjs <repo>`):

```js
// Repartiment a l'atzar dels mons amb establiment de la sèrie de la llei 2 entre l'exploració i la
// confirmació de B2 (pla de la iteració 4; AUD-54 i recomanació de l'auditor 2, auditoria 7).
// Estratificat per condició d'origen. Llavor fixada abans de mirar el resultat: 20261018.
// Ús: node b2-repartiment.mjs <repo>
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const repo = process.argv[2];
const { readSeries } = await import(pathToFileURL(join(repo, 'fase2/estadistica.mjs')).href);
const { makeRng } = await import(pathToFileURL(join(repo, 'fase1/soup.js')).href);
const SEED = 20261018;
const sums = new Map(readFileSync(join(repo, 'captures.sha256'), 'utf8').trim().split('\n')
  .map((l) => l.split(/\s+\*?/)).map(([s, p]) => [p, s]));

const rng = makeRng(SEED, 'v2');
const worlds = [];
for (const group of ['A', 'B']) {
  const dir = join(repo, 'fase2/resultats/serie-llei2', group);
  const established = readSeries(dir).filter((x) => x.event).sort((a, b) => a.seed - b.seed);
  const order = established.map((x) => x.seed);
  for (let i = order.length - 1; i > 0; i--) {          // Fisher–Yates
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const half = order.length / 2;
  for (const x of established) {
    const tag = x.mixing === 0 ? '' : `-m${x.mixing}`;
    const capture = `fase2/resultats/serie-llei2/${group}/captures/llavor${x.seed}-mon512x256-r2${tag}-establiment${x.time}-epoca${x.time}.bin`;
    if (!sums.has(capture)) throw new Error(`no trobo la captura ${capture} a captures.sha256`);
    worlds.push({ group, seed: x.seed, mixing: x.mixing, t: x.time, part: order.indexOf(x.seed) < half ? 'exploracio' : 'confirmacio', capture, sha256: sums.get(capture) });
  }
}
const out = join(repo, 'fase2/resultats/b2');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'repartiment.json'), JSON.stringify({
  description: "Repartiment dels mons amb establiment de la sèrie de la llei 2 entre l'exploració i la confirmació de B2. Fet abans de mirar cap branca.",
  seed: SEED, rng: 'v2', method: "Per a cada grup (A, B), les llavors amb establiment ordenades de menor a major, barrejades amb Fisher–Yates (i de n-1 a 1, j = floor(rng() * (i + 1))) amb un sol generador makeRng(20261018, 'v2') per als dos grups, primer A i després B. La primera meitat de l'ordre barrejat és l'exploració.",
  worlds,
}, null, 1) + '\n');
for (const g of ['A', 'B']) for (const p of ['exploracio', 'confirmacio']) {
  console.log(g, p, worlds.filter((w) => w.group === g && w.part === p).map((w) => w.seed).join(' '));
}
```
