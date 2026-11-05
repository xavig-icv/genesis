# B1, les variants per cap d'S1 · les ordres, escrites abans de calcular

**Escrit el 05-11-2026, abans de calcular res** (`docs/pla-b1.md`, v0.5: §11, §14 i §15). Les ordres les fa
`node eines/b1-llistes.mjs caps`, a partir del pla de l'anàlisi (`PLAN`, a `eines/caps-analisi.mjs`): `test/b1-estrats.mjs` comprova
que són aquestes.

| Fitxer | Què |
|---|---|
| `llista.txt` | Les 4 ordres: C0 i S1, que tornen a fer les del nivell 1 amb el codi nou, i S1h0 i S1h1, amb els mateixos 10⁷ programes de D½ (la llavor 20261101) |
| `registres/` | Els JSONL, un per ordre (encara cap). L'anàlisi: `node eines/caps-analisi.mjs fase2/resultats/b1/caps/registres` |

**La SHA-256 de `llista.txt`:** `58343e4c61218a544683a2b40e749287bdc8d3e01aa401886fb4efe943887120`

## Com es llança

- **Quan:** després de la prova d'autonomia (§11).
- **On i com:** com la prova d'autonomia, amb aquesta llista: `bash eines/executa-b1.sh fase2/resultats/b1/caps/llista.txt SHA-256
  COMMIT`. Amb 8 fils, unes 2,4 h.
- **C0 i S1 han de fer el mateix que al nivell 1:** la mateixa línia final (els totals i l'empremta) que els registres del nivell 1, de
  l'extracte. L'anàlisi ho comprova, i si no hi coincideixen, no analitza res.
- **Els registres:** com al nivell 1, a git si cap no passa de 50 MB (el d'S1 del nivell 1 en feia 56,2). Si no, comprimits a una versió
  de GitHub, i els hereditaris, en un extracte a git.

## Abans d'analitzar: la repetició

La del nivell 1 (`fase2/resultats/b1/nivell1/README.md`): tres trossos de 10⁵ programes, triats amb `eines/tria.mjs` i la llavor que surt
de la SHA-256 d'`execucio-llista.txt`, tornats a fer a `repeticio/` amb `--de` i `--programes 100000`, i comparats amb
`node fase2/resultats/b1/nivell1/repeticio/compara.mjs registres repeticio TROS...`.
