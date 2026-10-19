# Protocol de B2 · quant dura la vida establerta

**Estat: esborrany v0.1 (19-10-2026).** No s'ha llançat cap branca d'aquesta sèrie.
- **Les marques:** **[PROPOSTA]** és una tria que pot canviar, i **[OBERT]** és una pregunta per als
  auditors.
- **El procediment:**
  1. es revisa a l'auditoria 9;
  2. s'hi incorporen les correccions;
  3. el *merge* de la versió aprovada farà de preregistre, amb l'etiqueta anotada `preregistre-b2`.
- **Després del preregistre,** cap canvi no es fa sense justificar-lo aquí, amb data i motiu, abans de mirar
  cap resultat.

## 1. La pregunta

**La principal: quant dura la vida un cop s'ha establert?**
- Ho va decidir el responsable del projecte el 19-10-2026, després de veure l'exploració (entrada 9 del
  quadern).
- Una vida que s'estableix i després es mor ha viscut un temps, com qualsevol ésser viu. La durada és la
  mesura, i no s'exclou cap vida.

**La secundària: el corrent hi influeix?** Era la pregunta inicial de B2 (entrada 8), però l'exploració hi
dona molt pocs casos. Per això passa a ser secundària, i sense cap afirmació confirmatòria.

## 2. El que en sabem: l'exploració

L'exploració es va fer amb els 29 mons de la part `exploracio` del repartiment, amb una branca per món i
condició, durant 2.000 èpoques (entrada 9; `fase2/resultats/b2/exploracio/`):
- **Amb la regla R2** (§5), 6 de 58 branques es moren, i 1 d'aquestes es recupera.
- **Amb la regla R3,** cap.
- **La regla R1** (l'1 %) dona 13 morts, de les quals 7 són falses: la vida fluctua al voltant d'aquest
  llindar.
- **Amb R2,** 3 morts sense corrent i 3 amb corrent.
- **El destí d'un món no queda fixat a *t*:** la mateixa vida, amb una altra llavor, acaba diferent en 4 de 27
  mons a *t* + 1.000.

## 3. Els mons

- **Quins:** els 29 de la part `confirmacio` de `fase2/resultats/b2/repartiment.json`, 12 del món quiet
  (A) i 17 del corrent (B).
  - El repartiment es va fer el 18-10-2026 a l'atzar, amb la llavor 20261018, abans de fer cap branca
    (`e6be331`).
  - Ningú no ha fet cap branca d'aquests mons.
- **El punt de partida:** la captura de l'època *t* de l'establiment de cada món, amb la SHA-256 de
  `repartiment.json`. Es comprova abans de llançar.
- **El que no és cec (AUD-67):** la història original d'aquests mons, de *t* a *t* + 1.000, és a la sèrie de la
  llei 2, i ja és pública.
  - L'anàlisi no la fa servir.
  - Ningú no l'ha mirada per dissenyar aquest protocol: els paràmetres surten de l'exploració.

## 4. Les branques

**Per cada món:**
- **dues condicions:** *m* = 0 i *m* = 0,01;
- ***K* llavors de continuació [PROPOSTA: *K* = 2]:**
  - la del món + 200.000 i la del món + 300.000, diferents de la de l'exploració (+ 100.000);
  - cada llavor es fa servir a totes dues condicions, i les dues branques comparteixen el mateix atzar
    inicial, com a l'exploració.
- **en total, 29 × 2 × 2 = 116 branques.**

**L'ordre**, la mateixa de l'exploració, amb un horitzó *H* [PROPOSTA: *H* = 5.000 èpoques]:

```
NOM --world 512x256 --seed LLAVOR --mixing M --from CAPTURA --start T --epochs T+H --every 100 --census 250 --census-version v3 --rng v2 --json CARPETA/NOM.jsonl
```

**El cost.** A l'exploració, una branca tarda 2,9 segons per època de mitjana, amb 6 o 7 branques alhora
entre les dues màquines.

| *H* | *K* | Branques | Hores de càlcul | Dies, amb 7 alhora |
|---|---|---|---|---|
| 4.000 | 2 | 116 | 379 | 2,3 |
| **5.000** | **2** | **116** | **473** | **2,8** |
| 6.000 | 2 | 116 | 568 | 3,4 |
| 8.000 | 1 | 58 | 379 | 2,3 |

**[OBERT] Horitzó o llavors?**
- **Un horitzó més llarg** veu més morts, i per tant més durada.
- **Més llavors** separen el destí del món de l'atzar de la continuació (AUD-61).
- **La proposta,** *H* = 5.000 i *K* = 2, és un compromís.

## 5. La mesura: la durada

- **La mort (regla R2):** el primer de dos censos seguits amb 5 hereditaris o menys en una mostra de 2.048
  (menys del 0,25 %). Té marge respecte de l'1 % de l'establiment, i a l'exploració és la que dona menys
  morts falses (AUD-60, AU2-41).
- **La durada *L*:** l'època de la mort menys *t*. Si no n'hi ha cap abans de *t* + *H*, es censura a *H*.
- **Les recuperacions:** si, després de la mort, la vida torna a passar de l'1 %, la mort compta igualment.
  És la primera pèrdua sostinguda. Les recuperacions es comptaran a part.
- **Les sensibilitats,** descriptives:
  - R1, menys de l'1 %;
  - R3, cap hereditari;
  - R2 sense recuperació fins a *H*;
  - la mort de la còpia, amb menys de l'1 % de cel·les que es copien.

## 6. Què s'estima

La unitat de l'anàlisi és el **món**. En cada condició, el valor d'un món és la mitjana de les seves *K*
branques.

**Principals**, totes amb un interval del 95 % per *bootstrap* de mons (10.000 rèpliques i una llavor
declarada al manifest):
- **S(*H*):** la proporció de branques vives a *t* + *H*, per condició, per origen (A, B) i amb tot junt.
- **La corba de supervivència** (Kaplan–Meier) per condició, amb la censura a *H*, i la mediana si s'hi
  arriba.
- **La durada mitjana restringida (RMST) fins a *H*.**

**[PROPOSTA] Una afirmació confirmatòria.**
- **L'afirmació:** "la vida establerta dura": més de la meitat de les vides establertes encara viuen a
  *t* + *H*, amb tots els mons i les dues condicions junts.
- **Quan es farà:** només si el límit inferior de l'interval del 95 % de S(*H*) és per sobre de 0,5.
- **Si no hi arriba:** no es farà, i es dirà.
- **El que en diu l'exploració:** dona S(2.000) ≈ 0,9 amb R2, però no sabem què passa després.
- **[OBERT]** Té sentit aquesta afirmació, o n'hi ha prou amb les estimacions?

**Secundàries,** descriptives:
- **El corrent:** a cada món, *D* = *L*(0) − *L*(0,01), amb les durades restringides a *H* i la mitjana de
  les *K* llavors. Es dona la mitjana de *D* amb l'interval per *bootstrap*, i una prova de signes.
  - **Què se'n dirà:** cap afirmació sobre el corrent, en cap cas. Si l'interval exclou el zero, es dirà
    que és una pista per a una sèrie pròpia.
- **L'atzar de la continuació** (AUD-61): en quina proporció de mons i condicions les *K* llavors coincideixen
  a dir si la vida és viva a *t* + *H*.
- **L'origen:** els mons nascuts amb corrent (B) contra els quiets (A). L'exploració hi suggereix més morts
  als B, amb pocs casos.

## 7. L'execució

- **El codi:** el de l'etiqueta `preregistre-b2`, desplegat a les dues màquines per commit (`eines/desplega-vm.sh`).
- **El llançament:** amb `eines/llanca-lot.sh`. Un experiment només es dona per fet si el JSONL és complet.
- **Els noms, opacs** (AUD-57). Els noms de les branques de les llistes no diuen ni el món ni la condició. La
  correspondència és al manifest.
- **El seguiment, només agregat:** `eines/seguiment.sh --agregat`. Durant la sèrie no es mira cap
  resultat.
- **Les màquines:**
  - les branques es reparteixen a l'atzar en blocs equilibrats entre el PC i la màquina virtual, amb una
    llavor declarada (X-003);
  - la història no depèn de la màquina, com s'ha comprovat a l'exploració;
  - **[OBERT]** si les quatre branques d'un món van a la mateixa màquina.
- **Abans de llançar,** cal pausar les actualitzacions de Windows, perquè un reinici aturaria els dos lots
  (incidència de l'exploració). Ho fa el responsable.

## 8. L'anàlisi

- **El programa:** un de nou, `fase2/b2-confirmacio.mjs`, amb el seu manifest, `fase2/serie-b2.json`.
  - **El manifest** declara els mons, les llavors, les condicions, *H*, *K*, la regla, la llavor del
    *bootstrap* i l'etiqueta.
  - **El programa** valida els JSONL contra el manifest, comprova el preregistre com `fase2/estadistica.mjs`,
    i calcula el que diu la §6.
- **El calendari:**
  1. s'escriurà i es provarà amb dades sintètiques abans de llançar;
  2. es revisarà a l'auditoria 9 o a la 10;
  3. només llavors es crearà l'etiqueta.
- **[OBERT]** *Bootstrap* de mons, o un altre interval?

## 9. El preregistre

- **L'etiqueta:** `preregistre-b2`, anotada, amb les SHA-256 del protocol, del manifest i del programa
  d'anàlisi al missatge.
- **[OBERT, decisió D4 del responsable]** **Un segell de temps extern** de l'etiqueta abans de llançar
  (OpenTimestamps, o un dipòsit amb DOI), perquè un tercer pugui comprovar-ne la data (AUD-77).

## 10. Limitacions conegudes

- **La història original no és cega** (§3).
- **La mort es mesura en una mostra de 2.048 cel·les.** La regla R2 hi deixa marge, però una vida molt
  escassa es pot perdre per mostreig. Les sensibilitats R1 i R3 ho acoten.
- **Un horitzó finit:** el que passa després de *H* queda censurat.
- **L'abast:** un sol nivell de corrent (0,01), mons de 512 × 256, i les vides que es van establir a la sèrie
  de la llei 2, que no són una mostra de totes les vides possibles.
- **Vint-i-nou mons:** les estimacions per origen (12 i 17 mons) són poc precises.
