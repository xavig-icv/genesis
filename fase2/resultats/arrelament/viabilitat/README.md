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
  - **Les captures:** les dels braços `continue`, `shuffle-all` i `reinit` a l'època 8.000, a
    `D:\abiogenesis-backup\maduracio-pilot\origen\alicuotes`.
  - **La comprovació:** cadascuna, amb la SHA-256 del manifest, que és a git.
  - **Per què aquests:** no són mons del pilot (7001 a 7100). Les xifres que fixen el disseny no surten de les dades que es mesuraran.
- **G1:** el registre del pas 3 de la captura 5.200 del món 1034 (`fase2/resultats/maduracio/durada/registres/durada-5200.jsonl`, a git).
- **G2, G3 i G4:**
  - **les branques establertes del pilot de la maduració:** els registres de `fase2/resultats/maduracio/pilot/branques/`, a git;
  - **les captures dels seus establiments:** `D:\abiogenesis-backup\maduracio-pilot\pc\captures` i `...\vm\captures`, comprovades amb el
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
