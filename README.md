# claude-origins

Abiogènesi digital: un univers de joguina on intentem que la vida sorgeixi sola,
sense que ningú escrigui el primer organisme.

## Com obrir-ho

Cal Node.js (16 o superior). No hi ha dependències.

```bash
node server.mjs
```

I obre <http://localhost:8420>. Calen *module workers* i `CompressionStream` amb `deflate-raw`: Chrome,
Edge o un altre navegador basat en Chromium (és amb el que s'ha comprovat la reproduïbilitat).

## Què hi ha

| On | Què és |
|---|---|
| `docs/disseny.md` | La visió, els principis, les lleis de l'univers i les decisions preses. |
| `docs/captures.md` | Les captures clau dels mons, i com fer-ne còpia. |
| `docs/protocol-estadistic.md` | El protocol (preregistre) de la sèrie confirmatòria. |
| `docs/calibratge.md` | Què detecta el cens de la vida, i què no. |
| `eines/cubff/` | La comparació de l'intèrpret amb cubff, l'implementació original de l'article. |
| `quadern/` | El quadern de laboratori: què hem fet, què hem trobat i les preguntes obertes. |
| `fase1/` | La sopa primordial: reproducció de l'experiment BFF de *Computational Life* (Agüera y Arcas et al., 2024), i el nucli que fan servir totes les fases (intèrpret, generadors aleatoris, mesures). |
| `fase2/` | El món 2D i les lleis 1 (espai), 2 (corrents) i 3 (flux), el registre de famílies i les eines d'anàlisi. |
| `fase3/` | Llistes i registres dels experiments de la llei 3 (el codi és a `fase2/`). |
| `sim.mjs` | Simulació sense gràfics per a experiments llargs, de la sopa o del món 2D (`node sim.mjs --help`). |
| `experiments.sh` | Executa una llista d'experiments, uns quants alhora, i anota els que fallen. |
| `llanca-lot.sh` | Llança un lot d'`experiments.sh` i n'escriu el progrés només en un fitxer, mai a la consola. |
| `seguiment.sh` | Diu com va un lot (començats, acabats, fallats, en marxa) sense mostrar cap resultat. |
| `prova-neta.sh` | Passa `npm test` en una còpia neta d'un commit, abans de demanar un *merge*. |
| `test/` | Proves de la línia d'ordres, dels lots d'experiments, del servidor, de l'estadística, de l'oracle de cubff i de regressió del determinisme. `test/fixtures/` té dos retalls petits de mons amb vida. |
| `*/resultats/` | Registres dels experiments llargs (les captures `.bin` no són a git). |

### Fase 1

- `bff.js`: l'intèrpret del llenguatge BFF (10 instruccions).
- `soup.js`: la sopa (barrejar, aparellar, mutar, mesurar) i els generadors aleatoris v1 i v2.
- `motifs.js`: cerca dels fragments de codi més repetits.
- `glyphs.js`: com es mostra un programa (colors i caràcters).
- `main.js`, `worker.js`, `analysis-worker.js`, `chart.js`: la interfície del navegador.

### Fase 2

- `world.js`: les lleis 1 (aparellament amb veïns), 2 (corrents) i 3 (riu i renovació).
- `replication.js`: la prova de replicació, compartida per totes les eines, amb la de segona generació (la còpia també es copia?).
- `census.js`: el cens de la vida (versió 3: replicadors hereditaris en una mostra de 2.048 cel·les) i el criteri d'establiment.
- `families.js`: el registre de famílies de replicadors (descriptiu: el mapa i les històries).
- `analitza.mjs`: anàlisi d'una captura (`node fase2/analitza.mjs fitxer.bin`).
- `calibratge.mjs`: el cens sobre les captures clau.
- `estadistica.mjs`: l'anàlisi estadística de les sèries (log-rank, Kaplan–Meier, dues etapes, sensibilitats), amb la validació de la sèrie contra el manifest `serie-llei2.json` i la decisió de cada etapa (`--etapa`), que només es pren des d'una còpia idèntica a l'etiqueta del preregistre.
- `quadern-serie.mjs`: les taules per llavor i la corba de Kaplan–Meier d'una sèrie, en HTML, per al quadern.
- `b2-analisi.mjs`: l'anàlisi exploratòria de B2 (quant dura la vida establerta), amb les branques aparellades pel món.
- `main.js`, `analysis-worker.js`, `style.css`: el mapa, amb zoom des dels territoris fins al codi.

## Proves i experiments

```bash
npm test
```

```bash
node sim.mjs --world 512x256 --seed 1 --epochs 16000
```

`node sim.mjs` sense `--world` simula la sopa barrejada de la Fase 1.

**Reproduïbilitat.** Amb el mateix commit, la mateixa llavor i els mateixos paràmetres, la simulació fa
exactament la mateixa història; `test/determinisme.mjs` ho comprova. Al món 2D, el navegador i
`sim.mjs` fan la mateixa història amb qualsevol nombre de fils. A la sopa del navegador, cada fil té
la seva pròpia seqüència de mutacions, i la història depèn del nombre de fils: `sim.mjs --chunks K`
reprodueix la del navegador amb K fils.

**Generador aleatori i cens.** Des de l'auditoria 1, el generador per defecte és el v2 (xoshiro128\*\*),
i des de la iteració 3, el cens per defecte és el v3. Els experiments anteriors es van fer amb el
generador v1 (mulberry32) i el cens v2: per reproduir-los, cal afegir `--rng v1 --census-version v2`.

**Versions de Node.** Les proves passen amb Node 16 (zlib 1.2.11) i Node 20 (zlib 1.3.1), amb les mateixes
empremtes i el mateix cens. Amb Node 22, la compressió és una mica diferent i l'entropia d'ordre superior
canvia a la tercera xifra decimal: la història del món és la mateixa, però la mesura no.

**Fidelitat.** L'intèrpret dona exactament el mateix resultat que cubff, l'implementació original de
l'article, en 200.000 cintes (`eines/cubff/README.md`).

## Regles del projecte

Les regles completes i els motius són a [docs/disseny.md](docs/disseny.md). En resum: dissenyem les
lleis, mai els organismes; un canvi cada vegada, comparat amb la Fase 1; i un univers tancat, on els
organismes no tenen accés al sistema, a la xarxa ni als fitxers.

## Llicència i crèdits

- **Codi:** Apache 2.0 (`LICENSE`).
- **Quadern i documentació:** Creative Commons Reconeixement 4.0 (`LICENSE-docs.md`).
- **Crèdits** (`NOTICE`): l'experiment de la Fase 1 reprodueix *Computational Life* (Agüera y Arcas et al.,
  2024, arXiv:2406.19108) i segueix el comportament de la seva implementació de referència, cubff
  (Google LLC, Apache 2.0). claude-origins n'és una reimplementació independent, sense codi copiat.
