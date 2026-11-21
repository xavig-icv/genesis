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

**El que ha canviat a la prova curta** (21-11-2026, abans del càlcul llarg i abans de mirar cap resultat de les preguntes):
- **La pregunta 3, amb un sol món** (el 7001, `57b0ded`): amb les definicions d'abans, G1 no sortia mai com a «es copia», perquè demanava la
  meitat del veí igual que el genotip, byte a byte, i un replicador pot deixar una còpia girada o parcial. La prova del projecte compta una
  finestra de 16 bytes. I «malmès» comptava qualsevol byte canviat, encara que el genotip continués sent hereditari. Ara: «es copia», amb la
  regla de la prova de replicació; «tocat», algun byte canviat; i «malmès», que ja no és hereditari amb companys inerts (la prova del
  llinatge). L'anàlisi fa servir «malmès». La sortida d'aquesta prova (amb les definicions d'abans), a `prova/veins-7001.jsonl`; el canvi del
  codi, a `b2eb906`, i el del README i de l'anàlisi, al commit següent.

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
