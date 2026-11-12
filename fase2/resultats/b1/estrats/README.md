# B1, la composició de bytes (§13) · les ordres, escrites abans de calcular

**Escrit el 05-11-2026, i posat al dia el 09-11-2026 amb la v0.6, abans de calcular res** (`docs/pla-b1.md`: §11, §13 i §15). Les ordres
les fa `node eines/b1-llistes.mjs estrats|estrats-autonomia`, a partir del pla de l'anàlisi (`planRuns`, a `eines/estrats-analisi.mjs`) i
del mapa de llavors (`eines/b1-llavors.mjs`): `test/b1-estrats.mjs` comprova que són aquestes.

| Fitxer | Què |
|---|---|
| `llista.txt` | Les 110 ordres: els 65 estrats de la corba ρ(p) (10⁶ programes, i 10⁷ de k = 0 a 12); les 22 sopes del pilot, amb companys uniformes i amb companys sintetitzats a partir de l'histograma de la sopa (10⁶ cadascuna); i D½ amb companys de D½ (els primers 10⁶ programes del nivell 1) |
| `llista-autonomia.txt` | Les 110 ordres de la prova d'autonomia dels hereditaris de cada registre de `llista.txt`, amb les condicions de la §4: la corba sense l'ajuda del company, ρ_aut(p) (AUD-175) |
| `registres/` | Els JSONL de `llista.txt`, un per ordre (encara cap). L'anàlisi: `node eines/estrats-analisi.mjs fase2/resultats/b1/estrats/registres` |
| `autonomia/` | Els JSONL de `llista-autonomia.txt` (encara cap). L'anàlisi: `node eines/estrats-autonomia-analisi.mjs fase2/resultats/b1/estrats/registres fase2/resultats/b1/estrats/autonomia fase2/resultats/b1/autonomia/registres` |

Les composicions de les sopes són a `fase2/resultats/b1/composicio/`, fetes amb `eines/composicio.mjs` a partir de les captures del
pilot (l'època 8.000), comprovades amb el manifest del pilot. L'eina de la §13 les torna a comprovar senceres, i contra la cohort del
pilot, abans de començar cada tirada d'una sopa (AU2-140).

**Les SHA-256:**
- `llista.txt`: `2637c7ce563411b60f6b8f46381898b8ec1787104cdcb8378ce2c25c082f22af` (a la v0.5, `9e67ddc9…`: els estrats de k = 0 a 2
  passen de 10⁶ a 10⁷ programes, AUD-178);
- `llista-autonomia.txt`: `ef538ba6248fea79b12129606d03a3f3ddbaf9a0b20df3bacc01675271ff34ac`.

## Com es llança

- **Quan:** després de les variants per cap (§11). Primer `llista.txt`, i quan acabi, `llista-autonomia.txt`, que en llegeix els
  registres.
- **On i com:** com la prova d'autonomia, amb cada llista: `bash eines/executa-b1.sh fase2/resultats/b1/estrats/llista.txt SHA-256
  COMMIT`, i després el mateix amb `llista-autonomia.txt`. Amb 8 fils, unes 13,7 h la primera, i uns minuts la segona. Si s'atura, es
  torna a llançar: les ordres acabades se salten.
- **Mentre corre, cap recompte.** El seguiment, només `estat-llista.txt` i `estat-llista-autonomia.txt`.
- **La consola de cada ordre,** que només porta el progrés, a `consola-llista/` i a `consola-llista-autonomia/`: una carpeta per llista,
  perquè els registres de totes dues tenen els mateixos noms (AUD-180, auditoria 29).
- **Els registres:** a git si cap no passa de 50 MB; si no, com al nivell 1.

## Abans d'analitzar: la repetició

Com la de la prova d'autonomia: tres de les 110 tirades de cada llista, triades amb `node eines/tria.mjs LLAVOR 3` i els noms dels
registres (sense `.jsonl`), tornades a fer senceres i comparades amb `node eines/b1-compara.mjs`. Les de `llista.txt`, a
`repeticio/registres/`, i les de `llista-autonomia.txt`, a `repeticio/autonomia/`: si les dues tries fan sortir el mateix nom, no
coincideixen (AUD-180). La llavor, la de cada `execucio-llista*.txt`. És una verificació per mostreig, no una demostració de totes les
tirades (auditor 2).

## El càlcul i els resultats (12-11-2026, exploratori)

- **El càlcul,** al commit `680d130`, amb Node 16.15.1. `llista.txt`, de les 02.31 a les 16.21 del 12-11-2026, i `llista-autonomia.txt`,
  de les 16.21 a les 16.47: les 220 ordres amb el codi 0 (`estat-llista*.txt` i `consola-llista*/`). Els dos `execucio-llista*.txt` van
  anar a git abans de mirar res (`d46b242`).
- **La repetició:** de `llista.txt`, `estrat-25`, `estrat-51` i `sopa-5024-uniforme`; de `llista-autonomia.txt`, `estrat-09`,
  `sopa-5001-uniforme` i `sopa-5002-uniforme`. Les sis coincideixen (`repeticio/comparacio.txt`).
- **Les anàlisis,** des de la còpia del càlcul, tal com surten: `analisi.txt` (`node eines/estrats-analisi.mjs
  fase2/resultats/b1/estrats/registres`) i `analisi-autonomia.txt` (l'ordre de la taula de dalt).
  - **Les comprovacions hi quadren:** a D½, ρ = 1,61·10⁻⁴ (al nivell 1, 1,62·10⁻⁴); amb bytes uniformes, 3,85·10⁻⁶ (3,70·10⁻⁶); i a D½,
    ρ_aut = 8,44·10⁻⁵ (a la prova d'autonomia de la §4, 8,10·10⁻⁵).
- **Què diuen, descriptivament:**
  - **La corba ρ(p) creix amb la part d'instruccions,** sense cap màxim a l'interior: de 3,9·10⁻⁶ amb bytes uniformes (p = 10/256) a
    4,3·10⁻⁴ a p = 0,99.
  - **Sense l'ajuda del company, ρ_aut(p), és molt més baixa a les p petites.** Cap hereditari amb menys de 9 instruccions no es copia amb
    companys inerts (n'hi ha 190 de 0 a 4 instruccions). A p = 0,1, ρ_aut és el 3 % de ρ; a p = 0,5, el 52 %.
  - **Les 22 sopes del pilot** (l'època 8.000, p ≈ 0,113). Amb companys sintetitzats a partir de l'histograma de la sopa hi ha 6,25
    vegades més hereditaris que amb companys uniformes (de 5,39 a 7,29). Però sense l'ajuda del company n'hi ha els mateixos o menys (10 i
    13 de 2,2·10⁷), i coincideixen amb la corba (uns 6·10⁻⁷ per programa): l'efecte dels companys de la sopa és del company, no del
    programa.
  - **D½ amb companys de D½:** 595 hereditaris de 10⁶, 3,84 vegades els que hi ha amb companys uniformes. Sense l'ajuda del company, 24.
- **Els registres de `llista.txt` (321 MB) no són a git.** Cap no passa de 50 MB, com demanava aquest README, però el repositori en
  faria uns 120, i el responsable va decidir el 12-11-2026 posar-los a una versió de GitHub, com els del nivell 1. Són a la còpia neta del
  càlcul, comprimits (95 MB) a la còpia de seguretat, i a la versió `b1-v07-registres-v1`
  (<https://github.com/xavig-icv/genesis/releases/tag/b1-v07-registres-v1>): un `tar` de 151.930.880 bytes (SHA-256
  `0b710924c7b3b014ba19a039c637d01823278e694d941ea419f09c1b18ddc355`), amb els de les variants per cap. Descomprimits, tots 110 tenen la
  SHA-256 d'`execucio-llista.txt`. Els de `llista-autonomia.txt` (`autonomia/`, 9,7 MB) sí que són a git.
- **L'extracte dels hereditaris de `llista.txt`,** com el del nivell 1 (AUD-174): `hereditaris.jsonl.gz`, fet amb `node
  fase2/resultats/b1/nivell1/extreu-hereditaris.mjs CARPETA-DELS-REGISTRES fase2/resultats/b1/estrats/execucio-llista.txt hereditaris.jsonl`.
  - **Què hi ha:** 15.342 línies, 15.122 hereditaris i les 220 línies d'inici i de final.
  - **La SHA-256 del contingut** (sense comprimir, 3.918.836 bytes): `bafcccfb8cef9fdebb9b3a0d442a34efad600444aa2823b3f51b69e798f78327`. És
    la que s'ha de comprovar (AUD-55).
  - **La del fitxer comprimit** (`gzip -n -9`, 1.056.030 bytes): `3bf81fe9b0dd7ac40e793e7c1ccae44dedb636b9b44da0e88ea03e54f2585117`.
