# El pilot de l'aparició i l'arrelament

- **El pla:** `docs/pla-aparicio-arrelament.md`, v0.6. El procediment d'abans de llançar és el de la §11 (l'auditoria 36: AU2-180 i
  AU2-181).
- **El codi:** `92b8f4f` (el merge de la PR #37, `5ed5f83`, i la documentació de l'auditoria 36). El pilot corre en una còpia neta d'aquest
  commit, sense cap fitxer de codi sense seguir. Fins que acabin les parts A i B, no s'hi fa cap commit: l'anàlisi demana que cada registre
  sigui del commit del manifest (AU2-162). El que va a git, s'hi copia des de la còpia del càlcul, tal com és.
- **Planta replicadors** a la part A. És l'excepció de la T-64 (el pla, §2): «arrela un replicador plantat», mai «la vida hi neix».

## La preparació (del 18 al 19-11-2026)

Es va fer amb un llançador de fora del repositori. Fa les guardes, l'envelliment, la preparació, la comprovació global i el reescaneig, i
s'atura al primer pas que falla. No llança cap branca de les parts A i B.

### El primer intent no val: es va llançar dues vegades

- **Què va passar:** el 18-11-2026, l'ordre es va enganxar dues vegades a la mateixa finestra, a les 21.25.03 i a les 21.25.19. Dos lots
  de l'envelliment escrivien els mateixos registres.
- **Com es va aturar:** la primera aturada (cap a les 21.27) només va matar els `node`, i els dos bucles d'`eines/experiments.sh` van
  llançar els mons següents, de la 7025 a la 7032, cadascun dues vegades, fins a l'època 8.000. La segona (cap a les 22.40) va matar primer
  els `bash` i després els `node`, en passades, fins que no en va quedar cap (22.42).
- **On és:** la carpeta del pilot i el registre del llançador es van apartar sencers, amb la SHA-256 de cada fitxer, a la còpia de
  seguretat. No va res a git, i res d'aquest intent no s'ha fet servir.
- **El que es va corregir:** el llançador porta ara un pany (només corre el primer que crea la carpeta del pany), i una guarda que s'atura si
  hi ha cap simulació del pilot en marxa.
  - **La primera versió de la guarda es comptava a si mateixa:** la consulta de PowerShell porta el patró a la seva línia d'ordres. Ara només
    compta els `node` i els `bash`, i mai la consulta.

### El segon intent, en dues rondes

- **La primera ronda:** es va llançar el 18-11-2026 a les 22.47, una sola vegada.
  - **L'envelliment** dels 74 primers mons (de la 7001 a la 7074) va durar fins a les 03.08 (4 h 21 min), amb tots els registres sencers.
  - **La preparació** (de les 03.08 a les 03.36) es va aturar amb el codi 1: «hi ha 58 mons inclosos, i en calen 60». És el que ha de fer
    quan no n'hi ha prou, i el pla ho preveu: «se n'envelleixen uns 74, per rondes, com a la sèrie» (§3). A la sèrie de la maduració va
    passar el mateix.
  - **Els 67 escanejos** d'aquesta preparació es van apartar a la còpia de seguretat, perquè `eines/transforma.mjs` no sobreescriu cap
    fitxer, amb la sortida tal com va sortir.
- **La segona ronda:** amb 82 mons, 8 més (de la 7075 a la 7082, una tanda). Es va llançar el 19-11-2026 a les 07.40, una sola vegada.
  - **L'envelliment:** `llista-envelliment-82.txt` comença amb les 74 línies de `llista-envelliment.txt`, i el lot va saltar els 74 mons ja
    fets. Els 8 nous van acabar a les 08.07.
  - **La preparació** (de les 08.07 a les 14.16) es va tornar a fer sencera: «60 mons inclosos de 76, 3240 branques (3060 de la part A)».
    Talla la llista al món que completa la cohort, el 7076: els mons de la 7077 a la 7082 s'han envellit (els registres hi són), però no
    entren al manifest.
  - **Els 67 escanejos de la primera ronda,** comparats amb els d'ara: iguals byte a byte, els 67.
  - **La comprovació global** (14.17; `node eines/arrelament.mjs --comprova`, sense `--maquina`): «tot correcte», amb el codi 0. El `code` del
    manifest, `92b8f4f`, és el commit de la còpia (la nota N-1 de l'auditor 1).
  - **El reescaneig** (de les 14.17 a les 16.03): l'script de l'auditor 2 de l'auditoria 36 (`verifica-reescanejos.mjs`, tal com és, amb la
    SHA-256 del seu lliurament, `fc945e50…d236`). Diu: «OK: 69 captures escanejades de nou; els recomptes coincideixen amb el manifest».

**La cohort:** 76 mons considerats; 60 d'inclosos i 16 d'exclosos.

| Per què queden fora | Mons |
|---|---|
| Un establiment abans de l'època 8.000 (a les èpoques 1.750, 2.250, 3.500, 4.500, 5.750, 6.000 i 6.000) | 7 |
| Alguna cel·la hereditària a l'escaneig de l'època 8.000 (1 cel·la a 7 mons, 2 a un i 9 a un altre) | 9 |
| **Inclosos** | **60** (un 79 %; el pla en preveia un 81 %) |

## Què hi ha

| Fitxer o carpeta | Què és |
|---|---|
| `llista-envelliment.txt`, `llista-envelliment-82.txt` | Les llistes de l'envelliment: 74 i 82 mons (la segona comença amb la primera) |
| `envelliment/` | Els 82 registres de l'envelliment (`eNNNN.jsonl`, i la consola, `eNNNN.log`) i els dos fitxers dels lots (`lot-*.out`). Les captures no van a git |
| `alicuotes/NNNN/` | Els 69 mons escanejats, amb l'escaneig de la inclusió (`escaneig.json`). Als 60 inclosos, a més, les cinc transformacions (`continue`, `shuffle-all`, `reinit`, `byte0` i `byte0-placebo`): el registre de cadascuna (`TIPUS.json`) i el seu escaneig amb la prova del cens (`TIPUS-escaneig.json`); i dels tres braços, l'escaneig amb companys inerts (`BRAÇ-escaneig-inert.json`). Les captures (`.bin`) no van a git |
| `sembres/` | Les 3.060 sembres de la part A (`eines/sembra.mjs`) |
| `seguiments/` | Els 60 fitxers del seguiment dels programes de la part B (`--track`) |
| `manifest.json` | El manifest, amb la SHA-256 de cada captura, escaneig, sembra i llista, i l'ordre de cada branca |
| `llista-a-pc.txt`, `llista-a-vm.txt`, `llista-b-pc.txt`, `llista-b-vm.txt` | Les llistes de les parts A (1.836 i 1.224 branques) i B (108 i 72) |
| `preparacio/` | Les sortides de la segona ronda, tal com van sortir: la preparació, la comprovació global i el reescaneig |
| `comprova-abans-parts-sortida.txt` | La comprovació global que el llançador de les parts A i B va passar abans de començar, tal com va sortir |
| `part-a/`, `part-b/` | Els registres de les 3.060 branques de la part A i les 180 de la part B (`NNNN-….jsonl`), la consola de cadascuna (`.log`) i els fitxers dels quatre lots (`lot-llista-*.out`) |

**Les SHA-256:**

| Fitxer | SHA-256 |
|---|---|
| `manifest.json` | `89c3eaf93024429a55f1593ba8c29f6b39170d1b5665fe8a7c4c0caa4d187226` |
| `preparacio/prepara-sortida.txt` | `b0f6a26b7ca6aee4173a9d845ab72eb33a09a5971e1c1a23d08bf727c933f438` |
| `preparacio/comprova-global-sortida.txt` | `5a9cc548b698d18227996440cbb797fba8e0cd16e163992e5b44d75e8399aada` |
| `preparacio/reescaneig-sortida.txt` | `e2eb6ff0cf59b6a69a5417bcdc8ff4c6a30ff30b5922b87036b007a33c45ded7` |

## Les parts A i B

- **On:** totes al PC, també les llistes `-vm`, perquè la màquina virtual comparteix la CPU i no hi afegeix gaire res. Primer la part B
  (les branques llargues) i després la part A, 8 alhora, a prioritat baixa.
- **El llançador:** de fora del repositori, amb el mateix pany i la mateixa guarda de processos. Abans de començar, comprova que la còpia
  sigui la del commit i neta, que el manifest tingui la SHA-256 d'aquí i que les quatre llistes siguin les del manifest, i torna a passar
  la comprovació global. Després de cada llista, comprova el codi 0, el «lot acabat» sense cap branca fallada i que cada registre sigui
  sencer.
- **Durant el càlcul:** només el registre del llançador i els dels lots. Res de mirar els registres de les branques.
- **El cost** (el pla, §8): unes 290 hores de CPU, un dia i mig o dos amb 8 processos.

### Com van anar (del 19 al 21-11-2026)

Es van llançar el 19-11-2026 a les 20.57, una sola vegada, des d'una finestra de PowerShell del responsable, a prioritat baixa.

| Pas | Quan | Què va dir |
|---|---|---|
| Les guardes i la comprovació global | 19-11, 20.57 a 20.58 | «tot correcte», amb la SHA-256 de la de la preparació (`comprova-abans-parts-sortida.txt`) |
| B-pc (108 branques) | 19-11, 20.58 a 20-11, 06.49 | 108 acabades, 0 fallades |
| B-vm (72) | 20-11, 06.49 a 13.07 | 72 acabades, 0 fallades |
| A-pc (1.836) | 20-11, 13.08 a 21-11, 03.08 | 1.836 acabades, 0 fallades |
| A-vm (1.224) | 21-11, 03.09 a 12.53 | 1.224 acabades, 0 fallades |

- **Cada registre, sencer:** després de cada llista, el llançador va comprovar que tots tinguessin la línia d'inici i la final. Abans de
  pujar-los, ho he tornat a comprovar: les 3.240 branques de les quatre llistes tenen el registre, amb la línia d'inici, la final i el
  `code` `92b8f4f`, sense `+canvis`.
- **Copiats tal com són** des de la còpia del càlcul (`part-a/` i `part-b/`: els registres, la consola de cada branca i els fitxers dels
  lots), amb la SHA-256 de cada fitxer comparada amb l'original (6.484 de 6.484). A git abans de cap anàlisi: fins aquí, no s'ha mirat cap
  resultat.
- **El temps:** uns 40 h. La part B va trigar menys del que deia el pla (unes 0,73 h de CPU per branca, i no 0,9), i la part A, més (unes
  190 h de CPU, i no 125).
