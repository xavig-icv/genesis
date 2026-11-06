# B1, la composició de bytes (§13) · les ordres, escrites abans de calcular

**Escrit el 05-11-2026, abans de calcular res** (`docs/pla-b1.md`, v0.5: §11, §13 i §15). Les ordres les fa
`node eines/b1-llistes.mjs estrats`, a partir del pla de l'anàlisi (`planRuns`, a `eines/estrats-analisi.mjs`) i del mapa de llavors
(`eines/b1-llavors.mjs`): `test/b1-estrats.mjs` comprova que són aquestes.

| Fitxer | Què |
|---|---|
| `llista.txt` | Les 110 ordres: els 65 estrats de la corba ρ(p) (10⁶ programes, i 10⁷ de k = 3 a 12); les 22 sopes del pilot, amb companys uniformes i amb companys de la sopa (10⁶ cadascuna); i D½ amb companys de D½ (els primers 10⁶ programes del nivell 1) |
| `registres/` | Els JSONL, un per ordre (encara cap). L'anàlisi: `node eines/estrats-analisi.mjs fase2/resultats/b1/estrats/registres` |

Les composicions de les sopes són a `fase2/resultats/b1/composicio/`, fetes amb `eines/composicio.mjs` a partir de les captures del
pilot (l'època 8.000), comprovades amb el manifest del pilot.

**La SHA-256 de `llista.txt`:** `9e67ddc9874188c69d08f0f5eb59f5381abc78d7180ec440d45cb95ae1c045c6`

## Com es llança

- **Quan:** després de les variants per cap (§11).
- **On i com:** com la prova d'autonomia, amb aquesta llista: `bash eines/executa-b1.sh fase2/resultats/b1/estrats/llista.txt SHA-256
  COMMIT`. Amb 8 fils, unes 12 h. Si s'atura, es torna a llançar: les ordres acabades se salten.
- **Mentre corre, cap recompte.** El seguiment, només `estat-llista.txt`.
- **Els registres:** a git si cap no passa de 50 MB; si no, com al nivell 1.

## Abans d'analitzar: la repetició

Com la de la prova d'autonomia: tres de les 110 tirades, triades amb `node eines/tria.mjs LLAVOR 3` i els noms dels registres (sense
`.jsonl`), tornades a fer senceres a `repeticio/` i comparades amb `node eines/b1-compara.mjs`.
