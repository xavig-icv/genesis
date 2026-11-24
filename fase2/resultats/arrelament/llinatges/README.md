# El pilot de l'aparició i l'arrelament: les famílies naturals seguides com els plantats (exploratori)

**Escrit el 21-11-2026, abans de calcular res.** És el carril d'explorar (`docs/disseny.md`, 11-11-2026), i el pas següent en què
coincidim els dos auditors i l'equip a l'auditoria 37 (la síntesi i la fila de `docs/disseny.md` del 21-11-2026). El responsable hi va dir
que sí el mateix dia («endavant amb la nota»). **No planta res:** ni al món ni en cap branca. La pregunta 3 fa una prova fora del món, com la
prova de replicació.

## La pregunta

El pilot (l'entrada 20) va trobar que els replicadors plantats arrelen menys a la sopa envellida que a la nova, i que, sense plantar res, la
vida s'hi estableix més. Però la part B no va poder separar l'aparició de l'arrelament: les famílies naturals que compta el cens inert es
trenquen en trossos a la seva foto, perquè una família és un grup de cel·les unides per finestres de 16 bytes, i els mutants del llinatge
que s'estableix no en comparteixen cap de sencera (AUD-204). Els plantats, en canvi, se segueixen amb el mòdul del llinatge, que hi afegeix
les finestres dels mutants que es copien. Tres preguntes:

1. **Quantes aparicions naturals hi ha, si les famílies es delimiten com els plantats?** Una aparició és un llinatge natural nou: el cens
   inert hi veu una cel·la hereditària que no porta cap finestra de cap llinatge que ja se segueix. A partir d'aquí, el llinatge se segueix
   com un plantat. I, sobretot: **quantes aparicions no s'estableixen** (les que fracassen), a cada sopa.
2. **La consistència, amb aquests llinatges:** la *P*(arrela | detectada) dels llinatges naturals, contra la dels plantats informatius (G1,
   G1 × 9 i G4, sense G2 i G3, que arrelen sempre; AUD-205), amb la regla de la consistència del pilot.
3. **Per què s'hi apaguen els plantats:** amb quina freqüència els veïns que tenen al voltant, a la sopa de partida, els fan malbé en una
   sola trobada, a cada sopa; i si aquesta freqüència va amb que s'apaguin.

## Les dades

- **Les preguntes 1 i 2:** les 52 branques de la part B on el cens inert troba alguna cel·la hereditària (21 a la sopa envellida, 19 a la
  barrejada i 12 a la nova), triades ara amb els registres del pilot. A les altres 128, el cens inert no en troba cap, i no hi pot començar
  cap llinatge: el resultat hi és zero, sense calcular res, perquè la simulació és determinista. L'exposició de totes 180 és la de
  l'anàlisi del pilot (les mon-èpoques fins a l'establiment o al final).
- **La pregunta 2, els plantats:** els registres de la part A del pilot, a git, amb `partA()` i `plantedClass()` de l'anàlisi, tal com són.
- **La pregunta 3:** les sembres de G1 (una cel·la) i de G4 de la part A (240 per sopa i genotip: 60 mons, 4 posicions), a git; i les captures
  de partida de cada sopa (`alicuotes/NNNN/ARM.bin`), que no són a git: les de la còpia del càlcul del pilot, comprovades amb la SHA-256 del
  manifest i la de la sembra. Els registres de la part A, per saber quins s'apaguen.
- **Cap dada d'una sèrie no decidida.** El pilot és exploratori i ja té l'auditoria dels resultats (la 37).

## El mètode

### Les preguntes 1 i 2: tornar a fer córrer les 52 branques, i seguir-hi els llinatges naturals

1. **La simulació, tal com era:** `sim.mjs` sense cap canvi, amb l'ordre del manifest de cada branca, i dues opcions que no canvien la
   història del món: `--save` (una carpeta de la còpia de treball, que git no segueix) i `--save-every 50`, i un altre `--json`. Les captures
   de partida, copiades a la còpia de treball al mateix camí relatiu, amb la SHA-256 del manifest comprovada abans.
2. **La comprovació de punta a punta:** el registre nou ha de tenir els mateixos censos v3, els mateixos censos inerts, el mateix llinatge
   del seguiment, el mateix establiment i la mateixa empremta final que el de git. Si una línia no hi coincideix, la branca no val i no se
   n'analitza res.
3. **El seguiment dels llinatges naturals** (`segueix.mjs`), sobre les captures de cada 50 èpoques, amb `createLineage()` de
   `fase2/llinatge.js`, tal com és (la mostra de 256, les 3 condicions inerts, les finestres de les funcionals, l'extinció amb dos zeros):
   - **a cada cens inert** (cada 250 èpoques), abans del pas del llinatge d'aquella època, amb les finestres del pas anterior: les
     hereditàries d'un llinatge són les que en porten alguna finestra, com `del llinatge` al pilot (una cel·la pot ser de dos). Les que no en
     són de cap s'agrupen per finestres compartides (com `families()`), i cada grup comença un llinatge nou, amb els seus programes;
   - **dos llinatges que comparteixen una cel·la hereditària en un cens** s'uneixen: el més nou s'uneix al més antic, també en cadena, com les
     famílies de l'anàlisi (AUD-200). Cada llinatge continua fent els seus passos, i compta com una aparició a l'època on va començar. Les
     hereditàries d'un grup són les que porten alguna finestra d'algun dels seus llinatges;
   - **a cada època múltiple de 50:** un pas de cada llinatge que no s'hagi extingit (també el de l'època on comença). Si una cel·la
     hereditària és d'un llinatge extingit, es compta com un rebrot, i el llinatge torna a fer passos;
   - **la llavor de cada llinatge:** 917000000 + 1.000 × el món + 100 × la sopa (0, 1 i 2: `continue`, `shuffle-all` i `reinit`) + l'ordre
     de creació a la branca. No és la de cap pla (les del pilot són de 907001 a 907076);
   - **les captures** s'esborren quan el seguiment de la branca ha acabat i s'ha desat.
4. **El registre del seguiment:** un JSONL per branca, tal com surt, amb la línia d'inici (el commit, la versió de Node, la SHA-256 del
   registre nou de la simulació), una línia per llinatge i pas, una per llinatge i cens (les seves hereditàries), i la final.

### La pregunta 3: els veïns de la sembra, en una sola trobada

Per a cada sembra de G1 (una cel·la) i de G4: els 24 veïns de la cel·la sembrada dins del quadrat de radi 2 (els que `pairNeighbors` hi pot
aparellar), a la captura de partida de la seva sopa. Amb cada veí, la cinta de les dues parelles (el genotip primer, i el veí primer),
executada una vegada amb `evaluate()` de `fase1/bff.js` (la química de sempre, el màxim de passos del món), sense mutacions. De cada trobada,
tres coses que no s'exclouen (canviades després de la prova curta: vegeu «La prova curta»):
- **es copia:** la meitat del veí porta alguna finestra del genotip o del seu mirall (la regla de la prova de replicació);
- **tocat:** algun byte de la meitat del genotip ha canviat;
- **malmès:** la meitat del genotip ja no és hereditària amb companys inerts, amb la prova del llinatge (les 3 condicions de `fase2/inert.js`).

De cada sembra, la part de les 48 trobades en què el genotip queda malmès. I, com a descriptiu, la composició dels 24 veïns: la part dels
bytes que són instruccions, i la de `<` i `,`.

## L'anàlisi, fixada ara (`analisi.mjs`)

Llegeix els 52 seguiments, els registres de la part A i la sortida de la pregunta 3, i n'exigeix el mateix commit i la mateixa versió de
Node. El món és la unitat: el bootstrap remostra mons sencers (10.000 vegades, amb la llavor **20261122**, que no és de cap pla).

1. **La fragmentació:** de les aparicions robustes de l'anàlisi del pilot (les famílies de 16 bytes), quantes cauen dins d'un llinatge
   natural que ja se seguia (no són noves amb aquesta regla); i, per a cada llinatge, quantes famílies de l'anàlisi s'hi compten.
2. ***λ*lin:** les aparicions robustes (els programes de la primera detecció, hereditaris en 50 de les 100 condicions de la prova de l'anàlisi
   o més), per cada 1.000 mon-èpoques d'exposició, a cada sopa; i, a part, **les que no s'estableixen:** les que no són del grup dominant
   de l'establiment de la seva branca (o la branca no s'estableix). Els quocients contra la sopa nova, amb els intervals.
3. **La consistència:** a cada sopa, la *P*(arrela | detectada) dels llinatges naturals robustos (la regla de `naturalClass()`, amb la
   finestra d'1.250 èpoques; arrela si el seu grup té la meitat o més de les hereditàries del cens inert de la confirmació) contra la dels plantats
   G1, G1 × 9 i G4 (`plantedClass()`); amb els recomptes de cada classe, i sense els competidors com a sensibilitat.
4. **Els veïns:** a cada sopa i genotip, la mitjana de la part malmesa; el quocient entre l'envellida i la nova, i entre la barrejada i la
   nova, amb els intervals; i, dins de cada sopa, la part que s'apaga al primer pas del llinatge (l'època 8.050) per terços de la part malmesa.
   La composició dels veïns, com a descriptiu.

## Què em faria canviar d'opinió (fixat ara)

- **La fragmentació (AUD-204):** si la meitat o més de les aparicions robustes de l'anàlisi a la sopa envellida cauen dins d'un llinatge
  que ja se seguia, la fragmentació es confirma amb un altre mètode. Si en són menys d'una de cada cinc, el seguiment no veu el que veia la
  sensibilitat de les finestres, i ho diré.
- **L'aparició, separada de l'arrelament:** si l'interval del quocient de les aparicions que no s'estableixen (l'envellida contra la nova) queda
  per sobre d'1, a la sopa envellida hi apareixen més replicadors, a més dels que s'estableixen. Si conté 1, no ho podem dir. Si cap sopa no en
  té 10 o més, la part B no mesura les aparicions que fracassen, i ho diré així.
- **La consistència:** els llinatges naturals i els plantats informatius «coincideixen» en una sopa si la diferència de les *P* és com a molt
  de 0,15 i la prova exacta de Fisher no la rebutja (p ≥ 0,05). Si no, no coincideixen.
- **Els veïns:** si el quocient de G1 (l'envellida contra la nova) queda per sobre d'1 i el de G4 conté 1, els veïns de la sopa envellida fan
  malbé G1 més sovint, i és una part de per què s'hi apaga (una associació, no una prova causal). Si el de G1 conté 1, la trobada immediata no
  ho explica.

## La prova curta, abans del càlcul llarg

La primera branca de les 52, en l'ordre del manifest: la simulació, la comprovació i el seguiment, de punta a punta. I la pregunta 3 amb un sol
món, el primer de la cohort. Si la comprovació falla o cap pas no surt bé, s'atura tot i es diu aquí.

**El que ha canviat a la prova curta** (21-11-2026, abans del càlcul llarg; la pregunta 3, després de veure la sortida d'un món, el 7001, que
és dins de l'anàlisi: la nota N-1 de l'auditoria 38):
- **La pregunta 3, amb un sol món** (el 7001, `57b0ded`): amb les definicions d'abans, G1 no sortia mai com a «es copia», perquè demanava la
  meitat del veí igual que el genotip, byte a byte, i un replicador pot deixar una còpia girada o parcial. La prova del projecte compta una
  finestra de 16 bytes. I «malmès» comptava qualsevol byte canviat, encara que el genotip continués sent hereditari. Ara: «es copia», amb la
  regla de la prova de replicació; «tocat», algun byte canviat; i «malmès», que ja no és hereditari amb companys inerts (la prova del
  llinatge). L'anàlisi fa servir «malmès». La sortida d'aquesta prova (amb les definicions d'abans), a `prova/veins-7001.jsonl`; el canvi del
  codi, a `b2eb906`, i el del README i de l'anàlisi, al commit següent.
- **La pregunta 3, amb les definicions noves** (el 7001, `e2dbfca`): les 24 sembres, en 1,5 s; els dos genotips, hereditaris a la prova del
  llinatge. La sortida, a `prova/veins-7001-2.jsonl`.
- **La primera branca, de punta a punta** (`7002-continue-natural`, de les 19.09 a les 19.28): la simulació, des de `57b0ded`, reprodueix el
  registre de git línia a línia (222 línies; l'empremta, `210e654c`); el seguiment (que es va fer amb `e2dbfca`, perquè el commit de la
  pregunta 3 va arribar mentre la simulació corria), 2 llinatges, 115 captures, 17 s; i les captures, esborrades. Tot, a `prova/`. El càlcul
  llarg la torna a fer, i ha de sortir igual.

## El pressupost

- **La simulació de les 52 branques:** una branca de la part B triga uns 45 minuts de CPU (la del pilot, unes 0,73 h). Unes 40 h de CPU en
  total, unes 5 a 6 h amb 8 processos, i el seguiment, una mica més.
- **Les captures:** com a molt 1,3 GB per branca (160 captures de 8 MB), a D:, i s'esborren després de cada seguiment: com a molt uns 11 GB
  alhora amb 8 processos.
- **La pregunta 3:** uns 70.000 trobades, uns minuts.
- **El límit:** dos dies de màquina. Els lots llargs, des d'una finestra de PowerShell del responsable.

## Els límits, d'entrada

- **Exploratori:** cap afirmació causal general, i cap dada que es pugui fer servir per confirmar res.
- **El llinatge és de finestres, no de descendència** (AU2-156): un mutant que les canviï totes abans de ser provat comença un llinatge nou.
- **El cens inert és una foto de 4.096 cel·les cada 250 èpoques:** les aparicions que no hi surten no es veuen.
- **La pregunta 3 és una sola trobada,** amb els veïns de partida i sense mutacions: no és la dinàmica del món.
- **Les branques de la part B s'aturen a l'establiment:** els llinatges naturals no se segueixen després.

## Les ordres (abans de calcular)

- **`prepara.mjs`:** comprova que el codi de la simulació sigui el del pilot (`92b8f4f`), tria les 52 branques, copia les captures de partida
  (amb la SHA-256 del manifest) i escriu `llista.txt` (SHA-256 `50750f61e40da2bac5a5acc8b82ff5118a5cd9d3ab59ed493381de67dfa73242`).
- **`llanca.sh COMMIT`:** les guardes (un pany, la còpia neta al commit, cap fitxer de codi sense seguir) i les 52 branques, 8 alhora, amb
  `branca.sh`: la simulació, la comprovació (`compara.mjs`), el seguiment (`segueix.mjs`) i esborrar les captures. El que passa, a
  `llanca.log`.
- **`veins.mjs`:** la pregunta 3, amb les captures de partida de la còpia del càlcul del pilot. **`analisi.mjs`:** l'anàlisi.

## Com va anar

- **El càlcul** (T-80): el va llançar el responsable des d'una finestra seva de PowerShell, el 21-11-2026 a les 20.05.50, des de `2f0585d`,
  amb 8 processos a prioritat baixa i Node 16.15.1. Va acabar el 22-11-2026 a les 00.16.18: 52 de 52 branques, totes comprovades i seguides
  (`llanca.log`). **Les 52 reprodueixen el registre del pilot línia a línia** (`comparacio/`), i la `7002-continue-natural` hi surt igual que
  a la prova curta. Les captures de cada 50 èpoques s'han esborrat després de cada seguiment.
- **La pregunta 3** (`veins.jsonl`), des del mateix commit, el 22-11-2026: 1.440 sembres (60 mons, 2 genotips, 3 sopes, 4 posicions), 100 s.
  Els dos genotips, hereditaris a la prova del llinatge.
- **Els registres, a git abans de l'anàlisi** (`194de00`).
- **L'anàlisi, el primer intent, amb un error meu** (`194de00`; la sortida, a `intent-1/analisi-sortida.txt`, tal com va sortir, `1e14256`): a
  la consistència (secció 3) hi entraven tots els plantats informatius, també els que el cens inert no detecta mai, i aquests sortien com a
  «no arrela» (els plantats, 0,11, 0,18 i 0,31). La nota diu la regla de la consistència del pilot, que només hi compta els plantats
  detectats (`detectedAt` no nul). Ho vaig veure perquè les xifres no eren les del pilot (0,63, 0,62 i 0,94; l'AUD-205).
- **L'anàlisi, corregida** (`d314b80`, només aquesta línia; la sortida, `analisi-sortida.txt`, `e42ee6b`): els plantats hi donen 0,63, 0,62 i
  0,94, les xifres de l'AUD-205. La resta de la sortida és igual a la del primer intent.
- **Un descriptiu afegit després de veure la sortida** (`descriptiu-fracassos.mjs`, `b5c3d1c`; la sortida, `descriptiu-fracassos.txt`): la
  nota no el fixava. Recomptes, sense cap quocient ni cap interval: on són les aparicions que no s'estableixen, i si encara eren vives.

## El que surt (exploratori)

**En poques paraules:** seguides com els plantats i comptades per llinatges, les famílies naturals de la sopa envellida i de la barrejada
compleixen el criteri de consistència fixat a la nota, i les de la nova no. No és cap prova que arrelin igual que els plantats: comptant cada
grup una vegada, a l'envellida no el compleixen (AUD-209, AU2-188). El seguiment compta més aparicions que no s'estableixen a la sopa
envellida que a la nova, però l'excés depèn de les que poden ser trossos del llinatge que s'estableix (AUD-208, AU2-190). I la pregunta 3
no mesura el mal que fan els veïns; separada per ordre, dona una pista del primer byte, per confirmar (AUD-210, AU2-189). Tot és
exploratori, de 52 branques, amb els criteris fixats a la nota abans de calcular. Les correccions de l'auditoria 38 són al final.

### 1. La fragmentació (AUD-204)

| sopa | famílies robustes de l'anàlisi del pilot | dins d'un llinatge que ja se seguia | llinatges robustos |
|---|---|---|---|
| envellida | 103 | 30 (0,29) | 80 |
| barrejada | 68 | 20 (0,29) | 56 |
| nova | 22 | 5 (0,23) | 17 |

- **Entre els dos llindars de la nota** (la meitat o més, es confirma; menys d'una de cada cinc, el seguiment no veu el que veia la
  sensibilitat de les finestres): **el seguiment ni confirma ni contradiu l'AUD-204.** N'uneix una part, no tant com les finestres de 8 bytes.
- **El quocient de les aparicions, gairebé igual que al pilot:** *λ*lin, 5,03 [1,84; 15,51] entre l'envellida i la nova (al pilot, *λ*det,
  5,01 [1,81; 16,09]; amb les finestres de 8 bytes, 2,30 [1,08; 6,03], l'AUD-204), i 3,56 [1,38; 9,43] entre la barrejada i la nova. El ritme
  d'establiment, 2,29 [1,05; 6,63] i 2,31 [1,02; 6,90].
- **Però el grup dominant de cada establiment encara aplega uns quants llinatges** (el descriptiu): 47 llinatges robustos als 15
  establiments de la sopa envellida, 42 als 15 de la barrejada i 9 als 7 de la nova. La nota compta cada llinatge com una aparició, també si
  després s'uneix a un altre: *λ*lin de totes les aparicions encara porta una part de la fragmentació.

### 2. Les aparicions que no s'estableixen

| sopa | aparicions robustes | no s'estableixen | *λ*lin de les que no s'estableixen (per 1.000 mon-èpoques) |
|---|---|---|---|
| envellida | 80 | 33 | 0,076 |
| barrejada | 56 | 14 | 0,033 |
| nova | 17 | 8 | 0,017 |

- **L'envellida contra la nova: 4,41 [1,44; 15,49].** L'interval queda per sobre d'1, i pel criteri de la nota el seguiment hi compta més
  aparicions que no s'estableixen. **Però l'excés depèn de les que poden ser trossos del llinatge que s'estableix** (AUD-208, AU2-190; l'auditor
  1, a posteriori): sense les 16 de les 1.250 èpoques d'abans d'un establiment, 4,55 [0,89; 23,22]; només amb les de branques sense
  establiment, 5,35 [0,77; 25,04]. Tots dos intervals contenen 1. La barrejada contra la nova, 1,89 [0,79; 5,71]: no ho podem dir.
- **«No s'estableix» vol dir «no és del grup dominant quan s'atura la branca»** (AU2-190): no és un fracàs independent, ni una extinció.
- **El descriptiu, afegit després:** de les 33 de la sopa envellida, **15 són a branques que no s'estableixen**, i 18 a branques que sí
  (16 d'aquestes, en les 1.250 èpoques d'abans de l'establiment). **Aquestes 18 poden ser trossos del llinatge que s'estableix** que el
  seguiment no ha unit: no ho sabem. Només amb les branques que no s'estableixen, 15, 5 i 3, que són recomptes sense l'exposició (amb
  l'exposició, el quocient de dalt, que conté 1). De les 15 de l'envellida, 8 són d'un sol món, el 7046, i set d'aquestes són llinatges petits
  al costat d'una família gran (l'auditor 1).
- **«No s'estableix» no vol dir «s'extingeix»:** 25 de les 33 encara eren vives al final de l'exposició (a l'establiment de la branca, o al
  final), amb una *F* màxima de 3 de mediana. A la nova, 4 de 8, amb una mediana de 176.

### 3. La consistència, amb els llinatges

| sopa | naturals robustos (llinatges) | plantats informatius detectats | la diferència, p de Fisher | el criteri de la nota |
|---|---|---|---|---|
| envellida | 43 de 67 (0,64) | 82 de 131 (0,63) | 0,02, p = 0,88 | coincideixen |
| barrejada | 25 de 35 (0,71) | 128 de 208 (0,62) | 0,10, p = 0,35 | coincideixen |
| nova | 6 de 12 (0,50) | 224 de 238 (0,94) | −0,44, p < 0,001 | no coincideixen |

- **Amb la regla de la nota** (com a molt 0,15 de diferència i p ≥ 0,05), el criteri de consistència **es compleix a la sopa envellida i a la
  barrejada, i no a la nova,** comptant llinatges. **És un criteri operatiu, no cap prova d'equivalència** (AU2-188): la p de Fisher tracta
  cada llinatge com si fos independent, i no ho són (la unitat és el món, i un sol establiment de l'envellida hi posa 16 llinatges que arrelen);
  i l'interval de Newcombe de la diferència arriba a 0,15 a l'envellida ([−0,127; 0,151]) i la passa a la barrejada ([−0,078; 0,239]).
- **Comptant cada grup de llinatges una vegada** (AUD-209; l'auditor 1, a posteriori): 12 de 36 a l'envellida (0,33; no es compleix), 11 de 21
  a la barrejada (0,52; es compleix) i 5 d'11 a la nova (0,45; no). A la barrejada i a la nova, el veredicte no depèn de la unitat; a
  l'envellida, sí. Cap de les dues unitats no és neta: comptant llinatges, un establiment fragmentat compta moltes vegades com a «arrela»;
  comptant grups, els trossos del dominant que no s'hi han unit queden fora del grup que arrela.
- **Al pilot,** amb les famílies de 16 bytes, els naturals eren 0,17, 0,26 i 0,36. Els plantats són els mateixos: la diferència
  ve només de com es delimiten les famílies naturals, i és coherent amb l'AUD-204.
- **Sense els competidors** (la sensibilitat): naturals 0,84, 0,86 i 0,67; plantats 0,63, 0,64 i 0,95.
- **Molts llinatges no hi entren:** les prèvies (78, 118 i 16: el llinatge comença al cens de la confirmació, després de l'establiment, i
  segurament és la fragmentació del que s'estableix) i les tardanes (13, 21 i 5).
- **La lectura de la §1 del pla demana la consistència a les sopes que es comparen,** i la nova és la de referència: **continua sense poder-se
  fer.** A la nova, la *P* dels naturals es mesura amb 12 llinatges.

### 4. Els veïns de la sembra, en una sola trobada

| genotip | envellida | barrejada | nova | l'envellida contra la nova | la barrejada contra la nova |
|---|---|---|---|---|---|
| G1 | 0,380 | 0,375 | 0,390 | 0,97 [0,96; 0,99] | 0,96 [0,94; 0,98] |
| G4 | 0,375 | 0,370 | 0,387 | 0,97 [0,95; 0,99] | 0,96 [0,94; 0,98] |

(la part de les trobades en què el genotip queda malmès, és a dir, que ja no és hereditari amb companys inerts; la mitjana de les 240
sembres)

- **La mesura no és el mal que fan els veïns** (AUD-210, AU2-189; l'auditor 1 la va separar per ordre, a posteriori). Barreja els dos ordres
  de la parella: quan el genotip va primer, mai no queda malmès; quan va segon, queda malmès de 0,74 a 0,78 de les vegades, i és el genotip
  mateix qui es fa malbé: els dos caps comencen a la meitat del company, i el seu bucle de còpia escriu sobre la seva pròpia meitat. Amb
  companys inerts, sense cap instrucció, G1 queda malmès el 95,8 % de les vegades quan va segon. Pel criteri fixat, el quocient de G1 no queda
  per sobre d'1, però la mesura no podia dir si els veïns el fan malbé.
- **Separada per ordre, la mateixa trobada dona una pista** (a posteriori): quan G1 va primer, la seva còpia al veí no és hereditària un
  12,9 % de les vegades a l'envellida, un 1,1 % a la barrejada i un 0,6 % a la nova (0,876 [0,865; 0,887]). La còpia de G1 deixa el primer
  byte del company tal com era, i si és `]` o 0, no és hereditària; a l'envellida, l'11,3 % de les cel·les comencen amb `]` (a la barrejada,
  un 0,5 %; a la nova, un 0,4 %). G4 sobreescriu el primer byte, i totes les seves còpies són hereditàries. És d'una sola trobada, i no ho
  explica tot: dins de l'envellida, les sembres sense cap veí que comenci amb `]` o 0 s'apaguen al primer pas igual que les altres, i la
  barrejada també hi perd sense aquest efecte. S'ha de confirmar.
- **Dins de cada sopa, més «malmès» va amb més sembres apagades al primer pas** (*F* = 0 a l'època 8.050): G1 a l'envellida, 64, 69 i 73 de 80
  per terços; a la nova, 60, 60 i 73. Una associació, descriptiva, d'una mesura que és la conducta del genotip quan va segon.
- **«Es copia» és l'ordre de la parella** (de 5.760 a 5.762 d'11.520): 1 quan el genotip va primer, 0 quan va segon (AUD-210, AU2-189). No és
  cap taxa de còpia, i no mira si la finestra ja hi era abans de la trobada (com a l'AUD-185).
- **La composició dels veïns** (descriptiu): a l'envellida, un 11,5 % d'instruccions, un 4,3 % de `<` i un 1,6 % de `,`; a la nova, un 3,9 %,
  un 0,38 % i un 0,40 %.

### El que no diu

- **No diu on actua la maduració.** L'excés d'aparicions que no s'estableixen a la sopa envellida depèn de les que poden ser trossos; la
  consistència, a l'envellida, depèn de la unitat, i a la nova no es compleix. La regla del projecte es manté: cap afirmació de si la
  maduració actua sobre l'aparició o sobre l'arrelament (AUD-184 = AU2-151). Per dir-ho, el carril de confirmar.
- **El llinatge és de finestres, no de descendència** (AU2-156), i el cens inert, una foto cada 250 èpoques.
- **Per què s'apaguen els plantats a la sopa envellida, encara no ho sabem:** la pregunta 3, tal com era, no ho podia dir, i la pista del
  primer byte s'ha de confirmar. Pot ser també el que passa després (les còpies dels veïns a sobre, la competència per l'espai), que aquesta
  nota no mesura.

## Tot el que s'ha provat

- La prova curta (`prova/`): la pregunta 3 amb les definicions d'abans i amb les noves, i la primera branca de punta a punta.
- El càlcul de les 52 branques i la pregunta 3 sencera, una vegada cadascun.
- L'anàlisi, dues vegades: el primer intent amb l'error de la consistència (`intent-1/`), i la corregida.
- El descriptiu de les aparicions que no s'estableixen, afegit després de veure la sortida.

## Les correccions de l'auditoria 38 (22-11-2026)

Tots dos auditors accepten el càlcul i l'anàlisi com a exploratoris: els registres, sencers i iguals als del pilot; l'anàlisi, refeta; l'error
del primer intent, ben declarat i ben corregit. Cap no demana repetir res. Les troballes són de lectura, i el text de dalt ja és el corregit.
**La sortida fixada (`analisi-sortida.txt`), el primer intent (`intent-1/`), el descriptiu i els registres no es toquen.** Les xifres noves
són de les sensibilitats dels auditors, a posteriori, i es diuen així.

- **Les aparicions que no s'estableixen** (AUD-208, AU2-190). Deia: «pel criteri de la nota, a la sopa envellida s'hi detecten més aparicions,
  a més de les que s'estableixen», i «una part poden ser trossos», i del descriptiu, «la direcció es manté». L'excés depèn de les que poden
  ser trossos: sense les de just abans d'un establiment, l'interval conté 1 (l'auditor 1). I «no s'estableix» vol dir «no és del grup dominant
  quan s'atura la branca» (l'auditor 2).
- **La consistència** (AUD-209, AU2-188). Deia: «les famílies naturals de la sopa envellida i de la barrejada arrelen tant com els plantats
  informatius quan el cens les detecta», i que la consistència «es compleix a la sopa envellida i a la barrejada». És el criteri operatiu de
  la nota, comptant llinatges, i no cap prova d'equivalència: la prova de Fisher no té en compte que els llinatges d'un món no són
  independents (l'auditor 2). Comptant cada grup una vegada, a l'envellida no es compleix (l'auditor 1).
- **Els veïns** (AUD-210, AU2-189). Deia: «els veïns de la sopa envellida no fan més mal als plantats en una trobada», «la trobada immediata
  amb els veïns no explica per què G1 s'apaga més a la sopa envellida», i de «es copia», «no ho vaig separar per l'ordre de la parella». La
  mesura barrejava els dos ordres: «es copia» és l'ordre, i «malmès» és el genotip que es fa malbé ell mateix quan va segon. Separada per
  ordre (l'auditor 1), dona la pista del primer byte, per confirmar.
- **El que no es pot refer sense les captures** (AU2-191). Els seguiments no es poden tornar a derivar només amb els JSONL. L'auditor 1 va
  tornar a fer quatre branques amb les ordres de `llista.txt` des de `2f0585d` (també la de 54 llinatges i l'única amb un rebrot), i el
  registre i el seguiment van sortir iguals.
- **La prova curta** (la nota N-1 de l'auditor 1). Deia que les definicions de la pregunta 3 van canviar «abans de mirar cap resultat de les
  preguntes». Van canviar després de veure la sortida d'un món, el 7001, que és dins de l'anàlisi. El canvi era necessari i és declarat.
