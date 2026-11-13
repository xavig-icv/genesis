# La maduració, pas 3: quant viuen els replicadors nous, i quants en veu l'escaneig (exploratori)

**Escrit el 13-11-2026, abans de calcular res.** És el carril d'explorar (`docs/disseny.md`, 11-11-2026), i el pas que l'auditoria 31 posa
abans del disseny del pilot: la durada dels replicadors nous, que demana l'auditor 1, i la sensibilitat de l'escaneig, que demana l'auditor 2
(AUD-189 = AU2-153). El responsable hi va dir que sí el 13-11-2026 (T-62, l'opció A: si el pilot pot plantar un replicador, es decideix amb
les dades d'aquest pas).

## La pregunta

El pilot ha de mesurar per separat l'aparició (que hi aparegui un replicador hereditari) i l'arrelament (que s'hi estableixi) (AUD-184 =
AU2-151). Sense plantar res, l'arrelament és la fracció de les aparicions que arrelen: cal poder comptar també les que fracassen. Per
dissenyar-lo, ens falten tres coses:

1. **Quant viuen els replicadors nous** en una sopa sense vida: si una família que es copia amb companys inerts dura més o menys que
   l'interval entre dues captures (100 èpoques). D'això depèn el detector: escanejos periòdics, o un registre de les còpies durant la
   simulació.
2. **Quants n'hi ha:** quantes cel·les es copien amb companys inerts, i quantes en són hereditàries, a cada captura, provant-les **totes**,
   i no només els positius de l'escaneig (AUD-189).
3. **Quants en veu l'escaneig del cens** (la prova de replicació amb companys de soroll i veïns) a les mateixes captures: la seva
   sensibilitat, i quants dels seus positius no es copien amb companys inerts.

## Les dades

- **El món 1034** de la sèrie de la llei 2 (decidida), el que es va triar a l'atzar per al lloc web (`web/dades/1034/fitxa.json`): quiet, sense
  vida establerta en 16.000 èpoques, amb un brot que s'apaga (les captures 5.200 a 5.400; el pas 1). Una captura cada 100 èpoques, fora de
  git, comprovades amb la SHA-256 que en desa l'escaneig del pas 1 (`../descripcio/escaneig-1034.jsonl`, a git).
- **Tres trams d'11 captures (1.000 èpoques cadascun), fixats ara:**
  - **el jove:** de la 100 a la 1.100;
  - **el del brot:** de la 5.000 a la 6.000 (abans, durant i després del brot);
  - **el vell:** de la 8.000 a la 9.000, la mateixa edat que les sopes envellides de la sèrie de la maduració.

  En total, 33 captures. L'auditoria 31 en proposava unes 20 (el brot i un tram quiet). Hi afegeixo el tram jove, per tenir la sopa jove i la
  vella al mateix món.
- **L'escaneig del pas 1** de les mateixes captures (`escaneig-1034.jsonl`): la prova del cens, amb la llavor 711.000 més l'època, l'amplada
  512 i el radi 2. No es torna a fer, llevat del control de la prova curta.
- **Cap simulació.** Només es llegeixen captures.

## El mètode

1. **Totes les cel·les de cada captura** (131.072), provades amb companys inerts: la prova d'autonomia de B1 (`testCondition`, a
   `eines/autonomia.mjs`), amb la química de sempre (C0), en les 10 primeres condicions de la llavor del pas 2b, **3000000000**. De cada
   cel·la, si es copia (sola o en context) i si n'és hereditària, en cadascuna de les 10.
   - **La llavor** no és de cap pla: és la del pas 2b, i aquestes 10 condicions són les 10 primeres de les seves 100. Així les xifres es poden
     comparar amb les del 2b.
2. **Cada cel·la que es copia en alguna de les 10, i cada positiu de l'escaneig,** tornats a provar en les 100 condicions del pas 2b
   (`testReplicator`): en quantes es copia i en quantes n'és hereditària. Les 10 primeres han de donar el mateix que al punt 1 (és la mateixa
   prova, amb el mateix atzar); si no, l'script s'atura.
3. **El registre:** un JSONL per captura, tal com surt: la línia d'inici (el commit, la versió de Node, la SHA-256 de la captura i la de
   l'escaneig del pas 1, la química, la llavor i les condicions); una línia per cel·la provada de nou (la posició, el programa, el que en deia
   l'escaneig i les quatre cadenes de les 100 condicions); i la línia final, amb els recomptes de les 131.072 cel·les i els segons.
4. **Vuit processos alhora,** un per captura, a prioritat baixa. Un registre només es dona per bo si acaba amb la línia final i el codi de
   sortida és 0 (llegit just després de l'ordre); si un procés s'interromp, el seu fitxer es guarda a part, i la captura es torna a fer.

## L'anàlisi, fixada ara

Un script a part, `durada-analisi.mjs`, escrit abans de mirar cap resultat. Llegeix els 33 registres, i n'exigeix el mateix commit, la mateixa
versió de Node i la mateixa llavor.

1. **Quants:** per captura i per tram, les cel·les que es copien amb companys inerts (en alguna de les 10 condicions) i les que en són
   hereditàries; i, a les 100, en quantes condicions (les classes de B1: almenys 1, 95 o més, i totes 100).
2. **La sensibilitat de l'escaneig:** de les cel·les que es copien amb companys inerts, quantes eren positius de l'escaneig; de les
   hereditàries amb companys inerts, quantes eren hereditàries a l'escaneig; per classe. I, al revés, quants positius de l'escaneig es
   copien amb companys inerts a les 100 condicions, com al 2b.
3. **Les famílies i quant viuen:**
   - **la família:** dues cel·les que es copien són de la mateixa família si comparteixen una finestra de 16 bytes, la de la prova (almenys 6
     valors diferents, en qualsevol dels dos sentits);
   - **continua** a la captura següent si algun membre hi comparteix una finestra amb una cel·la que es copia;
   - **la durada:** en quantes captures seguides hi és. Les que ja hi eren a la primera captura del tram (no sabem quan van començar) i les que
     hi són a l'última (no sabem quan acaben), a part;
   - **els rastres:** a la captura següent, quantes cel·les qualssevol porten alguna finestra de la família, i si el mateix programa hi és
     en algun lloc.
4. **Les aparicions:** per tram, les famílies noves (les que no continuen cap família de la captura anterior), i quantes en són hereditàries
   (algun membre ho és en alguna de les 100 condicions).
5. **El brot:** la seva família, captura a captura: quantes cel·les en té, on, en quantes condicions es copien, i si l'escaneig les veia.
6. **Els fràgils que 10 condicions es deixen:** de cada cel·la detectada, la probabilitat de detectar-la, a partir de les altres 90 condicions,
   1 − (1 − p)^10; i una estimació del total, en què cada cel·la detectada compta 1 partit per la seva probabilitat. Només orientativa.

## La prova curta, abans del càlcul llarg

- **La captura 5.300 sencera,** amb l'script del càlcul i des d'un commit net. La sortida, tal com surt, a `prova/`. Serveix per veure que
  funciona de punta a punta, que l'anàlisi s'hi pot fer córrer i quant triga. No en traiem cap resultat.
- **El control de l'escaneig:** a la mateixa captura, l'escaneig del pas 1, refet amb el codi d'ara (`escaneig-control.mjs`), ha de donar la
  mateixa línia d'`escaneig-1034.jsonl`: els recomptes i les cel·les, amb el programa i les marques. Si no, ens aturem.

## El pressupost

- **Mesurat** (13-11-2026, 2.000 cel·les de quatre captures, la màquina lliure): de 0,74 a 0,77 ms per cel·la i condició. Una captura
  sencera amb 10 condicions, unes 16 min de CPU; les 33, unes 9 h.
- **Les cel·les tornades a provar** (unes desenes per captura), amb 100 condicions: minuts.
- **En total,** unes 9 h de CPU: unes 2 o 2,5 h amb 8 processos. Molt per sota dels dos dies.

## Què em faria canviar d'opinió

**El detector del pilot:**
- **Si les famílies noves duren més de 100 èpoques** (la majoria hi són en dues captures seguides o més), un escaneig amb companys inerts cada
  100 èpoques les veuria. Però costa unes 16 min de CPU per captura: per a centenars de mons, només en uns quants punts. El registre de les
  còpies seria el detector, i l'escaneig, la seva calibració.
- **Si gairebé totes hi són en una sola captura,** un escaneig cada 100 èpoques no compta les aparicions: el registre de les còpies és
  imprescindible.

**L'escaneig del cens:**
- **Si veu menys de la meitat** de les cel·les que es copien amb companys inerts, o de les hereditàries, no serveix per comptar aparicions, ni
  tornat a provar.
- **Si veu gairebé totes les robustes** (95 condicions o més), podria servir, tornat a provar, per comptar aquestes.

**La inoculació (T-62):**
- **Si, fora del brot, hi apareixen famílies hereditàries noves que s'apaguen** (almenys una per tram), hi ha aparicions que fracassen i es
  poden veure: l'arrelament es pot mesurar com la fracció de les aparicions que arrelen, sense plantar res, i la regla del projecte no canvia.
- **Si fora del brot no n'hi apareix cap,** les aparicions són, a la pràctica, els brots: n'hi ha un en 16.000 èpoques en aquest món. Mesurar
  quants arrelen, sense plantar res, demanaria un pilot molt més gran, i un assaig d'invasió amb replicadors nascuts als mons del projecte, a
  part de les sèries de l'abiogènesi i dit així, en seria l'alternativa. Ho decidiria el responsable.

## Els límits, d'entrada

- **Un sol món** i 33 captures. Res d'aquí no diu on actua la maduració (AUD-184 = AU2-151): el tram jove i el vell són descriptius.
- **La resolució és de 100 èpoques.** Una família que neix i mor entre dues captures no es veu.
- **10 condicions no veuen tots els fràgils:** una cel·la que es copia en 3 condicions de 100 es detecta una vegada de cada quatre. L'estimació
  del punt 6 de l'anàlisi ho corregeix només de mitjana.
- **«Es copia» no és «hereditari»** (AUD-186): totes dues xifres, cadascuna amb el seu nom.
