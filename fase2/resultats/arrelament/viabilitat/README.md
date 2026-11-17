# El pilot de l'aparició i l'arrelament: la prova de viabilitat (exploratori)

**Escrit el 16-11-2026, abans de calcular res,** també abans de triar els genotips.
- **El carril:** el d'explorar (`docs/disseny.md`, 11-11-2026).
- **El pla:** `docs/pla-aparicio-arrelament.md`, §9.
- **Planta replicadors:** és l'excepció que el responsable va decidir el 16-11-2026 (la T-64; el pla, §2). Cap resultat d'aquí no diu on
  actua la maduració. Només serveix per fixar el pla v0.2.

## La pregunta

El pla v0.1 deixa per fixar l'horitzó *H*, les posicions per món *K*, els mons *N* i la mida del cens inert. Per fixar-los, quatre
coses:
1. **Els quatre genotips,** plantats en una cel·la, arrelen alguna vegada? I sempre? A quina sopa?
2. **Els temps:** quant triguen a arrelar els que arrelen, i quant viuen els que s'extingeixen?
3. **La dosi:** canvia res plantar-ne un quadrat de 3 × 3 cel·les?
4. **El cost i el detector:** quant costa una branca? Amb les mides dels llinatges, quina probabilitat tindria el cens inert de veure'ls?

## Les dades

- **Els mons:** els 22 inclosos al pilot de la maduració (l'entrada 12; `fase2/resultats/maduracio/pilot/manifest.json`).
  - **Les captures:** les dels braços `continue`, `shuffle-all` i `reinit` a l'època 8.000, a la còpia de seguretat del pilot de la
    maduració (`origen/alicuotes/`; el camí, a `CLAUDE.local.md`).
  - **La comprovació:** cadascuna, amb la SHA-256 del manifest, que és a git.
  - **Per què aquests:** no són mons del pilot (7001 a 7100). Les xifres que fixen el disseny no surten de les dades que es mesuraran.
- **G1:** el registre del pas 3 de la captura 5.200 del món 1034 (`fase2/resultats/maduracio/durada/registres/durada-5200.jsonl`, a git).
- **G2, G3 i G4:**
  - **les branques establertes del pilot de la maduració:** els registres de `fase2/resultats/maduracio/pilot/branques/`, a git;
  - **les captures dels seus establiments:** a la mateixa còpia de seguretat (`pc/captures/` i `vm/captures/`), comprovades amb el
    `sha256.txt` de cada carpeta.
- **Els bessons naturals:** les branques del pilot de la maduració amb la llavor a (`W-BRAÇ-a`). Tenen la mateixa ordre, la mateixa llavor
  i la mateixa captura de partida, però sense res plantat.
- **Les llavors.** Cap no és de cap pla. Cap dada no és d'una sèrie no decidida.

  | Llavor | Per a què |
  |---|---|
  | 20261116 | La tria dels genotips. És la regla del pla (§4.1), executada aquí: els genotips que en surtin seran els del pilot |
  | 20261117 | La tria dels 6 mons |
  | La del món + 700.000 | La posició |
  | La del món + 400.000 | La continuació: la del bessó |
  | La del món + 900.000 | La mostra del llinatge |
  | 3000000000 | Les condicions de companys inerts, les del pas 2b: les 100 per als genotips, i les 3 primeres per al llinatge |

## El mètode

1. **Els genotips** (`genotips.mjs`), amb la regla del pla (§4.1):
   - **G1:** els programes que són hereditaris sols en totes 100 condicions a la captura 5.200 (la cadena `heritableSolo` del registre del
     pas 3). Diferents, en l'ordre del registre. Se'n tria un amb `pick(20261116, 1, …)` d'`eines/tria.mjs`.
   - **G2, G3 i G4:** de cada braç (`continue`, `shuffle-all` i `reinit`), les branques establertes del pilot, amb l'identificador en ordre
     alfabètic. Se'n tria una amb `pick(20261116, 1, …)`.
     - **La captura:** la de l'època de l'establiment, *T*, el primer dels dos censos del criteri (`…-establimentT-epocaT.bin`). La del
       cens que el confirma no es desa. Si un altre establiment del pilot té la mateixa llavor i la mateixa *T*, el nom seria ambigu, i
       l'script s'atura.
     - **Els programes que es proven:** els 64 bytes de les 131.072 cel·les es compten, i els 50 més freqüents (desempat: l'hexadecimal,
       en ordre) es proven en les 100 condicions (`testReplicator` d'`eines/autonomia.mjs`, la química C0).
     - **El que es tria:** el més freqüent dels que són hereditaris sols en 95 o més.
   - **Si un no hi arriba:** es torna a triar entre els que queden, amb la llavor + 1 (i + 2…). Es diu.
   - **La comprovació final:** cada genotip es torna a provar en les 100 condicions, i ha de fer 95 o més.
2. **Els mons:** els 22, sense els tres d'on surten G2, G3 i G4 (si en són dos o un, també). Se'n trien 6 amb `pick(20261117, 6, …)`.
3. **La posició:** a cada món, el generador v2 amb la llavor del món + 700.000: *x* = 2 + ⌊*r* · 508⌋, i després *y* = 2 + ⌊*r* · 252⌋.
   - **La mateixa a tots els braços i genotips** del món.
   - **El quadrat de 3 × 3:** les 9 cel·les del voltant, centrades en aquesta.
4. **Les sembres** (`sembra.mjs`):
   - **quantes:** 6 mons × 3 sopes × 5 (els quatre genotips en una cel·la, i G1 en el quadrat), 90 captures a D:;
   - **la comprovació:** la SHA-256 de la captura de partida, la del manifest, i que només hi canviïn els bytes de les cel·les plantades;
   - **el registre de cadascuna:** un `.json` amb les dues SHA-256, les cel·les, els bytes d'abans i els plantats.
5. **Les branques:** l'ordre de la branca bessona del manifest, amb quatre canvis:
   - `--from` és la captura sembrada;
   - `--epochs 12000` (*H* = 4.000);
   - `--json registres/ID.jsonl`;
   - `--save captures/ID --save-every 100`, en lloc de `--save-what event`.

   L'identificador és `W-BRAÇ-G`, i `W-BRAÇ-G1x9` per al quadrat.
6. **El llinatge** (`llinatge.mjs`), després de calcular. A cada branca, la captura sembrada (8.000) i les de cada 100 èpoques, en ordre,
   amb la mesura del pla (§4.5):
   - les cel·les que porten alguna finestra del llinatge (*M*);
   - com a molt 256, provades amb companys inerts en 3 condicions (si *M* ≤ 256, totes);
   - *F*, les funcionals estimades: *M* × la fracció de les provades que són hereditàries en alguna condició;
   - les finestres de les funcionals provades s'afegeixen a les del llinatge;
   - a la captura sembrada, les finestres del llinatge són les del genotip.

   Un `.jsonl` per branca, amb una línia per captura.
7. **El llançador** (`llanca.sh`): 8 processos a prioritat baixa.
   - **Quan és bo un registre:** si acaba amb la línia final i el codi de sortida és 0, desat just després de l'ordre (`codi=$?`).
   - **Si un procés s'interromp:** el seu registre es desa a part, i la branca es torna a fer.
   - **Si es torna a llançar:** salta les branques fetes.

## L'anàlisi, fixada ara (`viabilitat-analisi.mjs`)

**De cada branca:**
- **arrela:** *F* ≥ 1.311 en dues captures separades per 300 èpoques. El criteri en demana 250, i les captures són cada 100. El temps
  d'arrelar és el de la primera captura;
- **s'extingeix:** *F* = 0 en dues captures seguides. El temps, el de la primera;
- **censurada:** ni una cosa ni l'altra;
- ***F* màxim;**
- **l'establiment de la llei 2,** si n'hi ha, i si el llinatge n'és la família dominant: *F* és almenys la meitat dels hereditaris del món
  estimats amb el cens v3 d'aquella època;
- **l'establiment del bessó.**

**Per genotip i sopa:**
- quantes arrelen, quantes s'extingeixen i quantes es censuren;
- la mediana dels temps;
- quan s'extingeixen: en 100 èpoques, en 200, en 500, en 1.000, o més tard.

**La dosi:** el quadrat contra una cel·la, amb G1.

**El detector.** De cada llinatge, la probabilitat que un cens inert el vegi alguna vegada, amb les *F* de les captures:
- 2.048 cel·les cada 100 èpoques;
- 4.096 cada 100;
- 4.096 cada 250, amb la captura anterior més propera.

A cada cens, 1 − (1 − *s*)^*F*, on *s* és la fracció del món que es prova. Només orientativa: suposa que la prova veu totes les
funcionals.

**El cost:** els segons per cada 1.000 èpoques de les branques.

**Les regles del pla (§9),** escrites amb les xifres.

## La prova curta, abans del càlcul llarg

**El procés sencer, des d'un commit net:**
- els genotips i els mons, sencers;
- les 90 sembres;
- una sola branca, el primer dels 6 mons, `reinit` i G1, fins a l'època 8.300, amb el llançador;
- el llinatge i l'anàlisi d'aquesta branca (`--prova`).

Les sortides, tal com surten, a `prova/`. No en traiem cap resultat.

## El pressupost

- **Els genotips:** quatre captures i uns 150 programes en 100 condicions. Minuts.
- **Les branques:** 90, de fins a 4.000 èpoques, unes 0,4 s per època. Són unes 40 h de CPU com a molt, unes 5 o 6 h amb 8 processos.
- **El llinatge:** unes 3.600 captures, d'1 o 2 s cadascuna. Una hora o dues de CPU.
- **El disc:** fins a 29 GB a D: (n'hi ha 381 de lliures). Les captures s'esborren després de l'anàlisi, perquè es poden refer amb les
  ordres.
- **En total:** menys d'un dia, molt per sota dels dos.

## Què em faria canviar d'opinió (les regles del pla, §9)

- **Si cap genotip no arrela mai en cap sopa,** la part A es fa amb el quadrat de 3 × 3, o amb un *H* més llarg.
- **Si arrelen gairebé sempre** (més del 90 %) a totes les sopes, la part A no pot ser gaire més sensible: una dosi més petita que una
  cel·la no n'hi ha. Ja diria que la sopa no canvia l'arrelament d'aquests genotips, i el pilot posaria el pes a la part B. (El pla v0.1
  deia «una dosi més petita o un *H* més curt»: un *H* més curt censuraria, no distingiria. Es corregeix a la v0.2.)
- **Si la meitat dels que arrelen triguen més de *H*/2,** *H* s'allarga.
- **Si gairebé tots els que s'extingeixen ho fan en 200 èpoques,** l'aturada a l'extinció fa la part A barata, i *K* puja.
- **Si la mesura del llinatge s'equivoca** (per exemple, *F* puja en una branca on el llinatge s'havia extingit i el bessó s'estableix sol),
  la mesura es corregeix abans de la v0.2, i es diu.

## Els límits, d'entrada

- **6 mons i una posició:** xifres gruixudes, per al disseny. Res sobre la maduració.
- **3 condicions** no veuen tots els fràgils, i *F* és una estimació.
- **Les captures són cada 100 èpoques:** és la resolució dels temps.
- **«Arrela» no és «s'estableix»:** el criteri del llinatge és amb companys inerts, i el de la llei 2, amb companys de soroll.

## El que s'ha provat (16-11-2026)

- **La tria dels genotips, el primer intent** (`bf262b4`, a `intent-1/`, tal com va sortir):
  - **l'error:** el resultat de la prova sobreescrivia els recomptes de 100 amb les cadenes de 0 i 1. El llindar de 95 no filtrava res, i es
    triava el primer programa que fos hereditari en alguna condició;
  - **per què la tria no canvia:** els quatre triats fan 100, 96, 96 i 100 de 100, i cap dels anteriors no era hereditari en cap condició;
  - **refet amb l'script corregit** (`b391491`): els mateixos quatre programes. També escriu els recomptes dels programes anteriors.
- **Els genotips** (`genotips-sortida.txt`):
  - **G1:** un dels 37 programes del brot del 1034;
  - **G2:** de `5015-continue-a`, a l'època 13.250;
  - **G3:** de `5017-shuffle-all-a`, a l'època 9.000;
  - **G4:** de `5018-reinit-a`, a l'època 12.250.

  Tots es copien sols, i cap no ho fa en context amb companys inerts.
- **Una comprovació que no era a la nota** (`comprova-genotips.mjs`, a `8800616`). G3 és un programa d'una sola cel·la. La regla tria el
  programa més freqüent, però en un món establert els membres de la família poden ser tots diferents. Per això, a la captura d'origen de
  cada un:
  - **les cel·les que porten alguna finestra seva:** 2.540 (G2), 3.796 (G3) i 10.745 (G4), totes per sobre de l'1 % del món;
  - **F, les hereditàries amb companys inerts:** unes 1.080, 1.080 i 1.850.

  Comparades amb els hereditaris que estima el cens v3, l'script diu «de la família dominant» per a G3 i G4, i no per a G2 (1.081 contra
  3.968). Però compara dues proves diferents: el cens v3 fa servir companys de soroll i veïns.
  - **El que en traiem:** tots tres són de famílies grans, però la regla no garanteix que siguin de la dominant.
  - **Al pla v0.2:** la família dominant s'ha de definir per les finestres, agrupant les cel·les hereditàries, i no pel programa més
    freqüent.
- **Les sembres** (`beb3422`):
  - **els 6 mons:** 5004, 5006, 5008, 5014, 5019 i 5020;
  - **les posicions:** a `sembra-sortida.txt`;
  - **les captures:** 90 a `sembres/`, que no van a git;
  - **les ordres:** 90 a `llista.txt`.
- **La prova curta** (`75e4c8d`, a `prova/`, tal com va sortir):
  - **la branca:** `5004-reinit-G1`, fins a l'època 8.300, amb el llançador i un procés a prioritat baixa: codi 0 i el registre sencer, en
    38 s;
  - **el llinatge i l'anàlisi:** corren de punta a punta.

  No en traiem cap resultat.
  - **El cost:** 124 s per cada 1.000 èpoques, amb un sol procés i la màquina lliure (la nota en preveia unes 400, amb la càrrega de la
    sèrie).
  - **Les 90 branques, amb 8 processos:** unes 3 a 5 h.

## El que surt (16-11-2026, exploratori)

**El càlcul:**
- **les branques:** des de `cdc2e78`, amb `llanca.sh` i 8 processos a prioritat baixa, del 16-11-2026 a les 13.45.47 a les 15.47.44. Les 90,
  amb el codi 0 i la línia final, cap d'interrompuda. Els registres, a git abans de mirar-los (`149e5c3`);
- **el llinatge:** des de `f603368`, amb `llinatge.sh` i 8 processos, de les 15.48 a les 15.53 (`e5f5c6d`);
- **l'anàlisi:** des d'`e5f5c6d`, a `analisi-sortida.txt`, tal com va sortir (`06dd455`).

**Un error de l'anàlisi.** Surt amb el codi 1 i 90 «problemes». La comprovació demanava que el registre i el llinatge fossin del mateix
commit, i el llinatge es fa per força després de desar els registres. Entre `cdc2e78` i `f603368` no hi canvia cap fitxer de codi: només
s'hi afegeix `llinatge.sh`. La resta de la sortida no en depèn.

**Arrelar depèn sobretot del genotip.** Una cel·la, les tres sopes juntes (de 18 sembres):

| Genotip | Arrelen | S'extingeixen | Censurades |
|---|---|---|---|
| G1 (el brot del 1034) | 2 | 15 | 1 |
| G2 (`5015-continue-a`) | 17 | 0 | 1 |
| G3 (`5017-shuffle-all-a`) | 15 | 0 | 3 |
| G4 (`5018-reinit-a`) | 4 | 14 | 0 |
| G1 en 3 × 3 | 7 | 9 | 2 |

- **Dues menes de genotips:**
  - **G2 i G3** arrelen gairebé sempre, en 100 o 200 èpoques;
  - **G1 i G4** s'extingeixen gairebé sempre.
- **La dosi:** nou cel·les de G1 arrelen més que una (7 de 18, contra 2).
- **Per sopa,** els quatre genotips en una cel·la (de 24): `continue` 11 / 10 / 3, `shuffle-all` 12 / 10 / 2 i `reinit` 15 / 9 / 0
  (arrelen / s'extingeixen / censurades).
  - **G1 només arrela a la sopa nova:** 2 de 6. En el quadrat, 1, 2 i 4 de 6 (envellida, barrejada i nova).
  - **Amb 6 mons, no és cap resultat.** Però la diferència entre sopes, si n'hi ha, pot ser petita o anar al revés del que es veia a
    l'establiment.
- **Quan s'extingeixen** (38): 31 en 100 èpoques, 34 en 200, 36 en 500. La majoria no arriben a copiar-se: *F* màxim 1.
- **Quan arrelen** (45): la mediana, 200 èpoques; el percentil 90, 700; el màxim, 1.100.
- **Les censurades** (7) són branques que es van aturar a l'establiment de la llei 2 abans que el criteri del llinatge es pogués complir.
  Mirat després: en 5 de les 7, el llinatge hi era dominant.
- **Els bessons:** tres bessons es van establir sols (`5004-reinit`, `5008-shuffle-all`, i `5004-continue` a l'època 4.000). A les quatre
  branques on el llinatge plantat s'havia extingit, l'establiment de la llei 2 arriba a la mateixa època que el del bessó, i el llinatge no
  hi és (*F* = 0). L'atzar comú funciona: quan la sembra s'apaga, el món torna a la història del bessó.
- **El detector:** un cens inert veuria els llinatges que arrelen (1,00 amb totes tres mides), però dels que s'extingeixen, només un 10 o
  13 %. S'apaguen abans de fer-se grans.
- **El cost:** 253 s per cada 1.000 èpoques, la mediana amb 8 processos (del 203 al 622).
- **La mesura del llinatge:** cap rebrot després d'una extinció, i cap llinatge extingit no surt dominant en un establiment.
  - **Però «dominant» compara dues proves:** *F* amb companys inerts, i el cens v3 amb companys de soroll.
  - **Un exemple:** a `5019-shuffle-all-G1x9`, el llinatge arrela a les 800 èpoques, però l'establiment de la llei 2 no arriba fins a les
    3.250, i el llinatge no hi surt dominant. G1 es copia sol amb companys inerts en les 100 condicions, però el cens v3 el prova amb
    companys de soroll.

**Les regles de la nota:**
1. **Algun genotip arrela?** Sí: el disseny es manté.
2. **Arrelen gairebé sempre?** No en conjunt: G2 i G3, sí (el 94 i el 83 %); G1 i G4, no (l'11 i el 22 %). Amb G2 i G3, la part A no
   podria veure que una sopa n'afavoreix l'arrelament, perquè ja hi són al sostre.
3. **La mediana del temps d'arrelar** és 200, molt per sota de *H*/2 = 1.000: *H* = 2.000 sobra. 1.500 n'hi hauria prou.
4. **S'extingeixen en 200 èpoques** 34 de 38, el 89 %, just per sota del «gairebé tots» (el 90 %). L'aturada a l'extinció fa la part A
   molt barata: *K* pot pujar.
5. **La mesura del llinatge:** sense errors visibles. Però l'establiment de la llei 2 ha d'aturar la branca més tard, perquè el criteri
   del llinatge s'hi pugui complir, i la família dominant s'ha de mesurar amb la mateixa prova (el cens inert).

**Què canvia al pla v0.2** (proposta, a `docs/pla-aparicio-arrelament.md`):
- **cada món, els quatre genotips,** cadascun en branques a part: les sembres que s'extingeixen costen menys d'un minut;
- **el contrast entre sopes, per genotip,** i una estimació conjunta estratificada per genotip. G2 i G3 al sostre no hi diuen gaire, i
  G1 i G4 són els informatius;
- **una dosi de 3 × 3 per a G1,** que el porta a la zona del mig;
- ***H* = 1.500, i l'aturada a l'establiment 500 èpoques més tard** (`--stop-after-event 500`), perquè el criteri del llinatge s'hi
  pugui complir;
- **la família dominant a l'establiment, amb el cens inert;**
- **la consistència de la part B, condicionada a la detecció,** com ja deia el pla: el detector no veu les aparicions que s'apaguen de
  seguida.

**Els límits, a més dels d'entrada:**
- 6 mons per cel·la de la taula;
- 4 genotips: G2 i G3 venen de famílies grans, però no necessàriament de la dominant (la comprovació dels genotips);
- les captures cada 100 èpoques: els temps d'extinció tenen aquesta resolució.

## Una correcció del 16-11-2026: els camins de la màquina

Els camins de la còpia de seguretat del pilot de la maduració són una dada interna. `CLAUDE.md` ho diu: els camins de la màquina van a
`CLAUDE.local.md`, mai al repositori. Fins a `e5f12e7`, en aquesta carpeta n'hi havia en tres llocs. Ho va veure la comprovació del paquet
de l'auditoria 32. Ara:
- **el README** diu «la còpia de seguretat del pilot de la maduració», i el camí és a `CLAUDE.local.md`;
- **`comu.mjs`** el llegeix de la variable d'entorn `GENESIS_PILOT_BACKUP`. Per refer la tria dels genotips o les sembres, cal
  donar-la-hi. L'anàlisi i el llinatge no la fan servir;
- **el camp `source` de les 90 sembres** (`sembres/*.json`) diu el camí relatiu a la còpia de seguretat (`origen/alicuotes/...`). La
  SHA-256 de la captura de partida és la mateixa, i és la que es comprova.

La història de git, que és pública, encara els porta. Ho decideix el responsable.

## Les correccions de l'auditoria 32 (17-11-2026)

Els dos auditors en van refer l'anàlisi, igual byte a byte, i l'auditor 1, la tria dels genotips, les sembres, el llinatge de 7 branques i
dues branques senceres. El que es va escriure a «El que surt» es queda tal com era. Aquestes frases no se sostenen tal com són escrites:
- **«L'atzar comú funciona: quan la sembra s'apaga, el món torna a la història del bessó»** (AUD-194). No hi torna cap de les 90 branques.
  Les parelles de cada època són les mateixes que al bessó, però el nombre d'operacions és diferent a totes les mesures, també a les 38 que
  s'extingeixen. Plantar una cel·la canvia la història de tot el món, encara que el llinatge s'apagui de seguida. El que és cert: en 3 casos
  de 3 (`5004-reinit-G4`, `5008-shuffle-all-G1` i `5008-shuffle-all-G4`), l'establiment arriba al mateix cens que al bessó. No són quatre:
  a `5004-continue-G1` i `G1x9` el bessó s'estableix just a l'horitzó de la branca, i no es poden mirar. El `sham` del pilot es basava en
  aquest supòsit: a la v0.3 del pla, és un descriptiu.
- **«La majoria no arriben a copiar-se: *F* màxim 1».** De les 27 extincions amb *F* màxim 1, 12 van deixar trossos del genotip en altres
  cel·les (de 2 a 137 cel·les amb alguna finestra seva). Amb els noms de l'AUD-186, «es copien al company»: el que no fan és cap còpia
  hereditària.
- **La regla 2 de la nota** demanava més del 90 %. G2 hi arriba (el 94 %); G3, no (el 83 %). Si G3 és al sostre és perquè no s'extingeix
  mai: 15 arrelen i 3 censurades.
- **La regla 4** («gairebé tots en 200 èpoques»): 34 de 38, el 89 %, no es compleix. Que *K* pugi és una decisió de disseny, que no surt de
  la regla.
- **Els temps d'arrelar:** el màxim de 1.100 èpoques és dels que van arrelar abans que l'establiment aturés la branca. Dues sembres de
  G1 × 9 van viure 1.600 i 2.100 èpoques abans d'extingir-se: amb *H* = 1.500, al pilot, quedarien censurades.
- **Cinc extincions de 38 es van declarar d'una mostra** (AUD-192 = AU2-157): totes de G1 × 9, amb de 519 a 2.300 cel·les del llinatge i *F*
  estimada amb 256. Aquí les branques van continuar, i cap no va rebrotar; al pilot, la branca s'atura a l'extinció, i ara, quan *M* passa
  de 256 i cap de la mostra no és funcional, es proven totes les cel·les.
  - **Refetes amb la prova sencera** (l'auditor 1, auditoria 33; l'equip ho ha refet igual): quatre de les cinc eren extincions de debò. A
    la cinquena, `5020-shuffle-all-G1x9`, la mostra de 256 deixava fora l'única cel·la funcional de 1.031: amb la prova sencera, l'extinció
    surt 100 èpoques més tard (a les 600 de la sembra, no a les 500), i no rebrota.
- **Els 90 «problemes» de l'anàlisi** (AU2-167) són els de l'error ja dit a «El que surt»: la comprovació del commit estava mal pensada.
- **G2, G3 i G4, i la família dominant** (AU2-163): l'auditor 1 ho va mesurar a la captura d'origen de cadascun (totes les cel·les amb
  companys inerts, en les 3 condicions, i les famílies per finestres compartides). G3 i G4 són de la família dominant del seu establiment
  (el 99 i el 100 % de les hereditàries); G2, de la segona (1.435 cel·les, contra 2.731 de la primera). `genotips.json` diu «la família
  dominant a l'establiment» als tres: és la sortida tal com va sortir, i no es toca.
