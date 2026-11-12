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

## El càlcul i els resultats (12-11-2026, exploratori)

- **El càlcul:** la segona llista de B1 v0.7, de l'11-11-2026 a les 23.26 al 12-11-2026 a les 02.31, les quatre ordres amb el codi 0, des
  de la còpia neta del merge (`680d130`), amb Node 16.15.1 (`estat-llista.txt` i `consola-llista/`). `execucio-llista.txt` va anar a
  git abans de mirar res (`788923d`).
- **La repetició:** la llavor `0x9f8c5c5f` = 2676776031 i els trossos 20, 64 i 86, a les quatre tirades: 12 de 12 coincideixen
  (`repeticio/comparacio.txt`).
- **L'anàlisi:** `node eines/caps-analisi.mjs fase2/resultats/b1/caps/registres`, des de la còpia del càlcul, tal com surt a
  `analisi.txt`. C0 i S1 fan el mateix que al nivell 1.

  | Química | Hereditaris (de 10⁷) | El quocient contra C0 | El quocient contra S1 |
  |---|---|---|---|
  | C0 | 1.625 | — | — |
  | S1 | 6.420 | 3,95 (de 3,74 a 4,17) | — |
  | S1h0 | 3.835 | 2,36 (de 2,23 a 2,50) | 0,60 (de 0,57 a 0,62) |
  | S1h1 | 2.400 | 1,48 (de 1,39 a 1,57) | 0,37 (de 0,36 a 0,39) |

- **Què diu, descriptivament:** l'efecte d'S1 ve de tots dos caps.
  - Bloquejar només les escriptures de `h0` (`+`, `-` i `,`) a la meitat del punter dona 2,36 vegades els hereditaris de C0, i només
    les de `h1` (`.`), 1,48. Junts (S1), 3,95, una mica més que el producte (3,49).
  - La major part és de `h0`, com esperàvem (§14), però `h1` també hi compta.
  - Programa a programa, S1h1 conserva més hereditaris de C0 (1.119 de 1.625) que S1h0 (875) i que S1 (644): bloquejar les escriptures
    de `h0` en treu més dels que ja hi havia.
- **Els registres no són a git:** dos passen de 50 MB (`d-mig-S1`, 56,2 MB, i `d-mig-S1h0`, 50,4 MB). Són a la còpia neta del càlcul i,
  comprimits (51 MB), a la còpia de seguretat i a la versió `b1-v07-registres-v1` de GitHub
  (<https://github.com/xavig-icv/genesis/releases/tag/b1-v07-registres-v1>, des del 12-11-2026). La versió és un `tar` de 151.930.880
  bytes (SHA-256 `0b710924c7b3b014ba19a039c637d01823278e694d941ea419f09c1b18ddc355`) amb aquests registres i els de la §13, comprimits,
  els dos `execucio-llista.txt` i `sha256-gz.txt`. Descomprimits, cada un té la SHA-256 d'`execucio-llista.txt`.
- **L'extracte dels hereditaris,** com el del nivell 1 (AUD-174): `hereditaris.jsonl.gz`.
  - **Com es fa:** `node fase2/resultats/b1/nivell1/extreu-hereditaris.mjs CARPETA-DELS-REGISTRES fase2/resultats/b1/caps/execucio-llista.txt
    hereditaris.jsonl`. Comprova cada registre amb la SHA-256 d'`execucio-llista.txt`, i el recompte amb la línia final.
  - **Què hi ha:** 14.288 línies, 14.280 hereditaris i les 8 línies d'inici i de final.
  - **La SHA-256 del contingut** (sense comprimir, 3.581.389 bytes): `a817a57e7e6f90d1c9f4fe5375f85b7ebcc4c4e075a93ea7d714fb437c3c7acd`.
    És la que s'ha de comprovar: la del fitxer comprimit depèn de la versió de zlib (AUD-55).
  - **La del fitxer comprimit** (`gzip -n -9`, 1.074.884 bytes): `d1fb9ef86c9a6f2984e7bbde4beef53ecd131d37cb35235845f689a24aa157f2`.
