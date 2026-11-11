# B1, la prova d'autonomia · les ordres, escrites abans de calcular

**Escrit el 05-11-2026, abans de calcular res** (`docs/pla-b1.md`, v0.5: §4, §11 i §15). Les ordres les fa
`node eines/b1-llistes.mjs autonomia`, a partir del pla de l'anàlisi (`PLAN`, a `eines/autonomia-analisi.mjs`) i del mapa de llavors
(`eines/b1-llavors.mjs`): `test/b1-estrats.mjs` comprova que són aquestes.

| Fitxer | Què |
|---|---|
| `llista.txt` | Les 11 ordres: els hereditaris del nivell 1 de C0, K1, K2, R0, S1, S2, S3, S4, X1 i H64 amb D½, i els de C0 amb bytes uniformes (exploratori), amb 100 condicions de companys inerts |
| `registres/` | Els JSONL, un per ordre (encara cap). L'anàlisi: `node eines/autonomia-analisi.mjs fase2/resultats/b1/autonomia/registres` |

**La SHA-256 de `llista.txt`:** `ca5bb495a84038dc461c024bb2198b8f7acb87fa10e45835626d51572bca859c`

**A la v0.6** (09-11-2026, l'auditoria 28) la llista no canvia. S4 hi és com a control: amb companys inerts, dona 0 per construcció en
tots dos papers (AUD-176), i l'anàlisi en comprova els zeros, amb els d'S2 en context i S3 sol. «Sol» vol dir que el programa va
primer (AUD-175). La prova d'autonomia dels hereditaris de la §13 té la seva llista a `fase2/resultats/b1/estrats/`.

## Com es llança

- **Quan:** després del GO de l'auditoria 29 i del merge de la PR, abans de les variants per cap i de la §13 (§11).
- **On:** al PC, des d'una còpia neta del commit del merge, sense cap fitxer de codi sense seguir. Amb 8 fils, uns 30 minuts.
- **L'ordre,** des de l'arrel de la còpia, en una finestra de PowerShell del responsable, fora de l'aplicació, a prioritat baixa:
  `bash eines/executa-b1.sh fase2/resultats/b1/autonomia/llista.txt SHA-256 COMMIT`.
- **Mentre corre, cap recompte.** El seguiment, només `estat-llista.txt`.
- **Al final,** `execucio-llista.txt`, amb el commit, la versió de Node, la SHA-256 de la llista i la de cada registre. Va a git abans de
  mirar cap resultat.
- **Els registres,** a git si cap no passa de 50 MB (H64 en farà uns 32). Si no, com al nivell 1.

## Abans d'analitzar: la repetició

Com al nivell 1 (auditor 2):
1. **La llavor:** els vuit primers dígits hexadecimals de la SHA-256 d'`execucio-llista.txt`, com a enter.
2. **Quins:** `node eines/tria.mjs LLAVOR 3 d-mig-C0 d-mig-K1 d-mig-K2 d-mig-R0 d-mig-S1 d-mig-S2 d-mig-S3 d-mig-S4 d-mig-X1 d-mig-H64 uniforme-C0`.
3. **Es tornen a fer** sencers, amb la mateixa ordre i el registre a `repeticio/`, i es comparen amb
   `node eines/b1-compara.mjs registres/X.jsonl repeticio/X.jsonl`: han de coincidir línia a línia.
