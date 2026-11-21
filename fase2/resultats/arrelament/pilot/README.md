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

## El que surt (21-11-2026, exploratori)

`node eines/arrelament-analisi.mjs`, des de la còpia del càlcul (`92b8f4f`), amb Node 16.15.1, de les 12.59 a les 13.13: codi 0, res a la
sortida d'errors. La sortida, a `analisi-sortida.txt`, tal com va sortir (`a50ed48`). El món és la unitat: els intervals són del
bootstrap per món (60 mons, 10.000 vegades).

### Part A: on arrelen els replicadors plantats

*p*R, la part de les sembres que arrelen dins de *H* (1.500 èpoques):

| Variant | `continue` (l'envellida) | `shuffle-all` (la barrejada) | `reinit` (la nova) |
|---|---|---|---|
| G1 (una cel·la) | 0,03 [0,01; 0,05] | 0,06 [0,03; 0,09] | 0,12 [0,07; 0,17] |
| G1 × 9 (3 × 3 cel·les) | 0,10 [0,06; 0,14] | 0,32 [0,26; 0,38] | 0,65 [0,60; 0,70] |
| G4 | 0,21 [0,16; 0,26] | 0,18 [0,13; 0,23] | 0,19 [0,14; 0,25] |
| G2 (descriptiu, al sostre) | 0,98 | 0,92 | 0,98 |
| G3 (descriptiu, al sostre) | 0,90 | 0,93 | 0,95 |
| sham (cap genotip) | 0 de 20 | 0 de 20 | 0 de 20 |

**El contrast principal** (el quocient de *p*R contra la sopa nova, Mantel i Haenszel amb G1, G1 × 9 i G4):

| | El quocient | G1 | G1 × 9 | G4 |
|---|---|---|---|---|
| `continue` contra `reinit` | **0,35 [0,28; 0,43]** | 0,24 [0,08; 0,48] | 0,15 [0,10; 0,22] | 1,11 [0,82; 1,52] |
| `shuffle-all` contra `reinit` | **0,58 [0,48; 0,69]** | 0,48 [0,24; 0,87] | 0,49 [0,41; 0,59] | 0,93 [0,67; 1,29] |

- **Les dues mesures diuen el mateix:** amb «s'estableix amb el llinatge dominant», 0,36 [0,29; 0,45] i 0,57 [0,48; 0,68].
- **Les sensibilitats, també:** les censurades com si arrelessin (0,39 i 0,75), el criteri estricte de *F* (0,36 i 0,55) i sense les
  col·lisions (no n'hi ha cap: 0 de 180, i cap cel·la amb una finestra dels genotips abans de plantar-los).
- **Per variant:** G1 i G1 × 9 arrelen molt menys a les sopes envellides. G1 ve d'un món envellit (el 1034), i G4 d'un establiment a una
  sopa nova: G1 arrela pitjor a la mena de sopa d'on ve.
- **G4, inconcloent:** 1,11 [0,82; 1,52] a l'envellida i 0,93 [0,67; 1,29] a la barrejada, amb una semiamplada de 0,31 i 0,33 en logaritme.
  És compatible amb cap diferència, però també amb un 50 % més o un 20 % menys: no és cap prova que no hi canviï (AUD-206 = AU2-183).
- **El secundari,** `byte0` contra `byte0-placebo`: 1,03 [0,82; 1,30]. Cap efecte gros de la regla del primer byte.
- **Els desenllaços:** de 840 sembres per sopa, s'extingeixen 633 a l'envellida, 549 a la barrejada i 485 a la nova. La mediana de totes les
  extincions és de 50 èpoques (a l'envellida, la de G1 × 9 és de 100), i la de les que arrelen, de 300. Quan un llinatge s'extingeix, en
  queden trossos, però cap cel·la que es copiï sola amb companys inerts (l'auditor 1, auditoria 37).

**La lectura, la de la §1** (fixada abans de calcular): els dos intervals queden per sota d'1, amb una semiamplada de 0,21 i 0,18 en
logaritme (la regla en demana menys de 0,235). Es diu: **l'arrelament d'aquestes variants hi va en contra, i l'efecte de l'establiment
hauria de venir de l'aparició.** És la lectura formal del contrast dels replicadors plantats, amb una condició: que les aparicions naturals
arrelin com aquests genotips. La consistència no ho confirma (a sota), i no és cap demostració que la maduració actuï sobre l'aparició dels
replicadors naturals (AUD-205, AU2-184).

### Part B: les aparicions naturals

- **L'establiment:** 15 mons de 60 a l'envellida, 15 a la barrejada i 7 a la nova. És la direcció de la sèrie de la maduració (64, 82 i 40
  de 300). Al pilot sol, la diferència no és significativa (una p de Fisher bilateral de 0,10; aparellada per món, una p de McNemar de 0,077 i
  0,096: diagnòstics dels auditors, a posteriori).
- ***λ*det, les aparicions detectades** pel cens inert per cada 1.000 mon-èpoques abans de l'establiment: 0,238 [0,103; 0,439] a l'envellida,
  0,159 [0,071; 0,280] a la barrejada i 0,048 [0,017; 0,086] a la nova (les robustes). Els quocients contra la nova, 5,01 [1,81; 16,09] i
  3,34 [1,26; 9,64]. Els sis recomptes donen el mateix: cap de les famílies detectades no comparteix cap finestra de 16 bytes amb les cel·les
  de partida, ni amb les hereditàries ni amb les que només es copien. És la regla de finestres, no una genealogia: no descarta una ascendència
  amb mutacions, i a la sopa envellida gairebé no hi havia cel·les de partida (10 que es copien, en 60 mons, i cap d'hereditària; AU2-186).
- **La lectura:** *inconcloent* per totes dues, perquè l'interval és massa ample (una semiamplada d'1,09 i 1,02 en logaritme). És un
  descriptiu: no és el ritme de formació, i no se n'atribueix cap mecanisme.
- **Què compta *λ*det** (AUD-204): a l'envellida, 81 de les 103 aparicions robustes (el 79 %) són en les 1.250 èpoques d'abans d'un
  establiment, i moltes són trossos de la família que s'estableix: comparteixen trossos de 9 a 15 bytes amb la seva dominant, i cap amb les dels
  altres mons. Com que la finestra en té 16, cada tros compta com una família nova. Amb finestres de 8 bytes, el quocient baixa a 2,30 [1,08;
  6,03], el mateix que el de l'establiment (2,29). Per tant, *λ*det **no mesura l'aparició per separat**: depèn de com es delimiten les
  famílies (l'auditor 1, una sensibilitat a posteriori que no canvia l'anàlisi fixada).
- **El detector:** cap llinatge plantat que no hagi passat de 10 cel·les no ha estat vist mai pel cens inert (0 de més de 1.400), i gairebé
  tots els que n'han passat de 100, sí. El cens veu sobretot les famílies que creixen.

### La consistència no es compleix

*P*(arrela | detectada), amb la mateixa definició, la mateixa finestra (1.250 èpoques des de la primera detecció) i la mateixa regla a les
dues parts:

| Sopa | Les famílies naturals robustes | Els llinatges plantats | Sense els competidors (sensibilitat) |
|---|---|---|---|
| `continue` | 15 de 87 (0,17) | 195 de 244 (0,80) | 0,54 i 0,80 |
| `shuffle-all` | 12 de 46 (0,26) | 239 de 319 (0,75) | 0,75 i 0,77 |
| `reinit` | 5 de 14 (0,36) | 340 de 354 (0,96) | 0,63 i 0,97 |

- **No coincideixen.** Els plantats que el cens veu arrelen molt més que les famílies naturals que veu. Amb la mateixa mida a la primera
  detecció (5 cel·les o més), també a l'envellida i a la barrejada: 0,67 contra 0,90 i 0,56 contra 0,82 (una p de Fisher de 0,02 i 0,01). A
  la nova, amb 4 naturals de 5 cel·les o més, no es pot dir (0,75 contra 0,98).
- **A l'envellida i a la barrejada, la majoria de les naturals són «competidores»:** hi ha un establiment dins de la finestra, però no en són
  dominants (59 de 87 i 30 de 46; a la nova, 6 de 14). Són, sobretot, trossos de la família que s'estableix (AUD-204). Sense els
  competidors, la diferència s'escurça; el pla ja diu que aquesta sensibilitat afavoreix les naturals.
- **Dues coses que no són de l'arrelament** fan la distància (AUD-205, a posteriori): la delimitació de les famílies naturals (amb finestres
  de 8 bytes, la seva *P* és 0,52, 0,69 i 0,60) i G2 i G3, que arrelen sempre (sense ells, la *P* dels plantats és 0,63, 0,62 i 0,94). La
  consistència no confirma que els plantats representin els naturals, però tampoc no mostra que no els representin.
- **Per la regla del pla:** com que no coincideixen, la part A només parla d'aquestes variants.
- **L'aproximació exploratòria** (*λ*det × *P*): 0,041, 0,041 i 0,017 per 1.000 mon-èpoques, contra un ritme d'establiment observat de
  0,035, 0,035 i 0,015. No és cap descomposició, i que s'hi acosti no diu res: per construcció, és el ritme dels que arrelen per la part
  de famílies que entren a la consistència, i a cada establiment n'arrela una (l'auditor 1, N-2).

### Els descriptius

- **Els sham** (una cel·la escrita sense cap genotip): cap llinatge, i la part hereditària dels censos, igual que la dels bessons (la
  diferència mitjana, entre −0,0021 i 0,0001).
- **El punt de partida** (la mediana dels mons): l'envellida, 23 cel·les que es repliquen amb la prova del cens i cap d'hereditària, i 0 que
  es copien amb companys inerts; la barrejada, 712 i 7, i 115 i 0; la nova, 118 i 0, i 7 i 0.

### Què en traiem

- **Als mons d'aquest pilot, la sopa envellida no ajuda a arrelar els replicadors plantats:** els en treu. G1 i G1 × 9 hi arrelen de quatre a
  set vegades menys que a la sopa nova, i a la barrejada, la meitat. A G4, inconcloent.
- **I tanmateix, sense plantar res, la vida s'hi estableix més,** com a la sèrie (15 de 60 contra 7). El cens hi veu més famílies, però
  gairebé totes just abans d'un establiment, i moltes són trossos de la família que s'estableix: el quocient depèn de com es delimiten les
  famílies (5,0 amb les finestres del pla, 2,3 amb finestres de 8 bytes, el mateix que l'establiment), i no mesura l'aparició per separat.
- **La lectura fixada, amb la seva condició:** si les aparicions naturals arrelessin com aquests genotips, l'efecte de la maduració hauria de
  venir de l'aparició. La consistència no ho confirma, i la part B no separa l'aparició de l'arrelament. És una lectura formal, no una
  demostració.
- **Les preguntes que queden:** per què els plantats s'hi apaguen tan de pressa (en queden trossos, però cap cel·la que es copiï sola); com
  delimitar les famílies naturals perquè es puguin seguir com els plantats; i si les aparicions de la sopa envellida són d'una altra mena que
  els plantats.

### Els límits

- **Exploratori.** Cap afirmació causal general fins a una confirmació amb mons nous, i una confirmació que torni a plantar necessita una
  decisió nova del responsable.
- **Quatre genotips,** dos al sostre: l'arrelament depèn molt del genotip, i a G4 és inconcloent.
- ***λ*det no és el ritme de formació:** depèn de com es delimiten les famílies, i el cens veu sobretot les que creixen.
- **La consistència,** amb pocs naturals a la sopa nova (14).

## Les correccions de l'auditoria 37 (21-11-2026)

Tots dos auditors van acceptar els resultats com a exploratoris: els registres, sencers; l'anàlisi, refeta byte a byte; la part A i les
famílies de la part B, refetes sense el codi de l'equip. Cap no demana repetir res. Les correccions són de text, i l'anàlisi fixada i la seva
sortida no es toquen:
- **AUD-204:** deia que el cens veia «unes cinc vegades més famílies que apareixen i creixen», i que *λ*det «compta les famílies que creixen».
  Ara diu què compta *λ*det, i que no mesura l'aparició per separat.
- **AUD-205 i AU2-184:** el títol de la consistència deia «els plantats no representen els naturals», i «Què en traiem», que la frase de la
  regla «només val per a aquestes variants». Ara: «la consistència no es compleix», i la frase de la regla, amb la seva condició.
- **AUD-206 = AU2-183:** deia «G4, igual a totes tres», «G4 no hi canvia» i «cap dels quatre genotips no hi arrela més». Ara, inconcloent.
- **AU2-186:** deia que «cap de les famílies detectades no ve de les cel·les hereditàries de partida». Ara, que no en comparteix cap
  finestra, i que és una regla, no una genealogia.
- **Les notes de l'auditor 1:** «destrueix» per «s'hi apaguen», la mediana de l'extinció (la de totes), la p del pilot sol, la mida a la
  primera detecció a la nova, «no n'són» per «no en són», i l'aproximació, per construcció.
- **AU2-187:** la sortida de l'anàlisi té espais al final de set línies de la taula. No es toca: la sortida es desa tal com surt.
