# claude-origins

Abiogènesi digital: un univers de joguina on intentem que la vida sorgeixi sola,
sense que ningú escrigui el primer organisme.

## Com obrir-ho

Cal Node.js (16 o superior). No hi ha dependències.

```bash
node server.mjs
```

I obre <http://localhost:8420>.

## Què hi ha

| On | Què és |
|---|---|
| `docs/disseny.md` | La visió, els principis, les lleis de l'univers i les decisions preses. |
| `quadern/` | El quadern de laboratori: què hem fet, què hem trobat i les preguntes obertes. |
| `fase1/` | La sopa primordial: reproducció de l'experiment BFF de *Computational Life* (Agüera y Arcas et al., 2024). |
| `fase2/` | El món 2D (llei 1, l'espai): la mateixa química en un mapa on cada programa només es troba amb els veïns. |
| `sim.mjs` | Simulació sense gràfics per a experiments llargs, de la sopa o del món 2D. |
| `*/resultats/` | Registres i captures dels experiments llargs. |

### Fase 1

- `bff.js`: l'intèrpret del llenguatge BFF (10 instruccions).
- `soup.js`: la sopa (barrejar, aparellar, mutar, mesurar).
- `motifs.js`: cerca dels fragments de codi més repetits.
- `glyphs.js`: com es mostra un programa (colors i caràcters).
- `main.js`, `worker.js`, `analysis-worker.js`, `chart.js`: la interfície del navegador.

### Fase 2

- `world.js`: la llei 1. Cada cel·la s'aparella amb un veí a 2 cel·les com a màxim.
- `families.js`: el registre de famílies de replicadors, amb la prova de replicació.
- `main.js`, `analysis-worker.js`, `style.css`: el mapa, amb zoom des dels territoris fins al codi.

## Proves i experiments

```bash
node fase1/test-bff.mjs
```

```bash
node fase2/test-world.mjs
```

```bash
node sim.mjs --world 512x256 --seed 1 --epochs 16000
```

`node sim.mjs` sense `--world` simula la sopa barrejada de la Fase 1. Amb la mateixa llavor i els mateixos
paràmetres, fa exactament la mateixa història que el navegador.

## Regles del projecte

Les regles completes i els motius són a [docs/disseny.md](docs/disseny.md). En resum: dissenyem les
lleis, mai els organismes; un canvi cada vegada, comparat amb la Fase 1; i un univers tancat, on els
organismes no tenen accés al sistema, a la xarxa ni als fitxers.
