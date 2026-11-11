# B1, les ablacions de la química · el nivell 1, la densitat de replicadors

**Versió: v0.7 (09-11-2026), amb les correccions de l'auditoria 29, per a l'auditoria 30, breu, abans de calcular res del que s'hi
afegeix.** El nivell 1 es va calcular el 4 i el 5-11-2026 amb la v0.4 (l'entrada 15 del quadern), i l'auditoria 27 el va revisar. La
v0.5 fixa el que ve després, amb el codi en una PR (la branca `b1-autonomia`) i les proves (§9): la prova d'autonomia (§4), la
composició de bytes (§13), les variants per cap d'S1 (§14) i les llavors (§15). D'això, només s'ha mesurat el temps, sense cap
recompte (§8).
- **L'auditoria 30** (10-11-2026): **GO de tots dos per calcular la PR sencera,** després del merge i des d'una còpia neta. Dues
  precisions del text (AUD-181 i AU2-145, §9 i §12) i una de la §13; **cap canvi de codi:** l'auditor 2 demana que el codi fusionat sigui
  el que han auditat.
- **De la v0.6 a la v0.7** (les correccions de l'auditoria 29, §12). Res no s'ha calculat, i cap llista no canvia:
  - **un registre de la §13 sense cap hereditari** (AUD-179, bloquejant): la prova d'autonomia dels seus hereditaris, amb 8 fils, sortia
    amb el codi 0 sense la línia final. Ara acaba sencera, i l'executor demana la línia final després de cada ordre (§9 i §11);
  - **una carpeta de consola per llista,** i la repetició de cada llista de la §13 a part (AUD-180, §11);
  - **l'anàlisi de la §13 i la prova d'autonomia dels seus hereditaris tornen a comprovar la composició,** sencera i de la cohort, i la de
    la línia d'inici, camp a camp (AU2-142, bloquejant per a la §13, §13);
  - **les anàlisis llegeixen l'ordre de cada registre sencera,** amb el contracte d'opcions de l'eina (AU2-143, bloquejant per a ρ_aut,
    §9);
  - **què mesura ρ_aut:** la densitat dels programes que la §13 detecta com a hereditaris i que també es copien amb companys inerts, no
    la de tots els que es podrien copiar sense el company (AU2-144, i l'auditor 1, §13);
  - **un zero per construcció trencat atura la validació** de la prova d'autonomia, i no només ho diu la sortida (la proposta de
    l'auditor 2 a l'AUD-176, §4).
- **De la v0.5 a la v0.6** (les decisions de l'auditoria 28, §12). Res no s'ha calculat:
  - **la composició de cada sopa, comprovada sencera** abans de cada tirada (AU2-140, bloquejant per a la §13): 2²³ bytes, els recomptes
    i les instruccions, i la cohort del pilot (§13);
  - **«sol» vol dir «el programa primer»,** no «sense el codi del company», i una corba sense l'ajuda del company, ρ_aut(p): la prova
    d'autonomia, aplicada als hereditaris de les tirades de la §13, amb el codi i la seva anàlisi escrits abans de calcular (AUD-175, §4 i
    §13);
  - **S4 dona 0 per construcció a la prova d'autonomia,** com S2 en context i S3 sol: la seva tirada es queda com a control, i l'anàlisi
    comprova els tres zeros (AUD-176, §2, §4 i §7);
  - **un control positiu del context,** fet a mà, i una prova de l'anàlisi de la §13 (AUD-177, §4 i §9);
  - **10⁷ programes també als estrats de k = 0 a 2,** amb el mapa de llavors i la llista de la §13 refets (AUD-178, §13 i §15);
  - **les sopes:** «companys sintetitzats a partir de l'histograma de la sopa», tots els recomptes, també els zeros, i les 22 juntes,
    aparellades (tots dos, §13);
  - **les precisions:** les 100 condicions (§4), la cobertura de Fay i Feuer, que no és una garantia (§13), i la guarda (§11).
- **De la v0.4 a la v0.5** (les decisions de l'auditoria 27 i de X-093 i X-094, §12):
  - **la prova d'autonomia:** el criteri (la distribució sencera, sol i en context, i quatre xifres fixades abans), els companys
    inerts (què són, com es fan i com es comprova que ho són), les 100 condicions, els controls, els 37 de bytes uniformes
    (exploratori) i la descripció dels robustos i dels fràgils (§4);
  - **la §13:** els tres punts de l'auditor 2 (el total de cada estrat, els pesos i els intervals, i que la densitat no prediu
    l'origen a la sopa sense un model propi); la sopa i l'època, fixades; tirades directes per a les sopes, en lloc d'estrats per a
    cadascuna (una proposta nova, per a l'auditoria 28); el cost, amb la velocitat real;
  - **les variants per cap** (S1h0 i S1h1), en una secció pròpia, exploratòries i fora del nivell 2 (§14);
  - **les llavors:** un mapa sense solapaments, i sense llavors a 1, 2 o 3 vegades la constant de splitmix32 (§15, AUD-146);
  - **l'executor,** amb la guarda de l'AUD-174, i les llistes d'ordres, fetes amb una eina i a git abans de calcular (§11);
  - **el nivell 1 es reprodueix des d'una còpia d'`a677726`:** aquesta PR canvia `fase1/bff.js` i `fase2/replication.js`, dos dels
    mòduls que l'anàlisi del nivell 1 compara (AUD-139). Sense les opcions noves, fan el mateix que abans (§9).
- **De la v0.3 a la v0.4** (les decisions de l'auditoria 26, §12). Només el text: el codi no canvia.
  - **X0** dona 0 a la pràctica, no per construcció (AUD-144, §2);
  - **el cost de l'ampliació,** i el vistiplau del responsable (AUD-145, §8);
  - **les llavors** de la §13, i una xifra de la §5 (AUD-146);
  - **per què l'interval del quocient és conservador** (§6);
  - **el que es desa amb els registres,** i com es comprova que s'han fet (§11).
- **De la v0.2 a la v0.3** (les decisions de l'auditoria 25, §12):
  - **el control S4 no ho era** (AUD-140, AU2-104): el codi del company s'hi pot copiar el programa. El control és X0, cap còpia
    ni cap escriptura d'una meitat a l'altra, i S4 passa a ser una variant;
  - **la llavor,** fixada (§5);
  - **el registre i l'anàlisi:** el codi del registre veu tot el repositori, hi ha la SHA-256 dels mòduls, i l'anàlisi només es fa
    amb el pla sencer (AUD-139, AU2-102, AUD-142, AU2-103);
  - **els textos** de les variants, dels zeros i de l'interval (§2, §6 i §7), i les decisions de la composició (§13).
- **De la v0.1 a la v0.2:** les decisions del responsable (§12) i una proposta nova, la composició de bytes i el possible
  descobriment (§13). La química, la mesura i el codi no canvien.
- **D'on surt:**
  - el full de ruta (`docs/disseny.md`, §4; AUD-40): després de la sèrie confirmatòria, un eix de química amb ablacions, per saber
    quins ingredients calen;
  - la decisió del responsable del 18-10-2026: primer B2, i després B1;
  - l'auditoria 8: la taula de variants de l'auditor 1 (§8) i la matriu de l'auditor 2 (§7);
  - l'auditoria 9: els dos nivells, i el cens amb la mateixa química (auditor 1, AUD-65); un eix cada vegada (auditor 2, §6.2);
  - l'estat de la qüestió (`docs/estat-questio.md`, §2): la densitat d'instruccions i l'alineació dels caps (Knierim i altres,
    2026);
  - la decisió del responsable del 30-10-2026: començar el disseny de B1 mentre corre la sèrie de la maduració;
  - la valoració del responsable de l'1-11-2026:
    - els dos nivells, d'acord;
    - les variants, les decidiran els dos auditors i Claude;
    - buscar en quines circumstàncies l'eina troba més replicadors, i quin pot ser el descobriment nou (§13).

## 1. La pregunta

**Quins ingredients de la química calen perquè hi hagi vida** (`docs/disseny.md`, §7)? És la pregunta oberta de l'article: per què
en BFF hi neix vida i en altres llenguatges no.

**Dos nivells** (auditor 1, auditoria 9; el responsable hi està d'acord, 01-11-2026):
1. **La densitat de replicadors** a l'espai de programes, per a cada variant de la química. És aquest pla.
2. **La sopa,** només amb les variants que en tenen, i amb el cens de la mateixa química (§10). Es dissenyarà amb els resultats
   del nivell 1.

**Què diu el nivell 1:** amb cada química, quina part dels programes a l'atzar d'una distribució de bytes fixada són replicadors
hereditaris. És si els replicadors curts **existeixen i són abundants**.
- **Per què importa:** segons Knierim i altres (2026), és el que explica que hi apareguin, i la cerca a l'atzar en troba gairebé tan
  bé com la sopa. Ho volem comprovar nosaltres, i no recolzar-nos-hi (`docs/estat-questio.md`, §10).
- **Què no diu:** si s'estableixen i duren. Origen i establiment són passos diferents (§3 de l'estat de la qüestió). És el nivell 2.

## 2. Les variants

**Els principis** (tots dos auditors):
- **Un canvi cada vegada,** d'una sola regla, definit exactament.
- **Una instrucció ablada no fa res i consumeix el pas,** com un byte de dades: el pressupost de `MAX_STEPS` no canvia (auditor 1).
- **La prova de replicació,** amb la mateixa química (AUD-65).
- **Desactivades per defecte:** les empremtes de `test/determinisme.mjs`, els valors del cens v2 i v3, i l'oracle de cubff no canvien.
- **Controls:** variants on, a la pràctica, no hi pot haver cap replicador. No són teoremes (auditor 2): si en donen, és un fals
  positiu de la prova o una via que no havíem previst, i es miren un a un (§6).

**Recordatori** (`fase1/bff.js`, la variant `bff_noheads`):
- `.` fa `t[h1] = t[h0]`, i `,` fa `t[h0] = t[h1]`;
- `+` i `-` canvien `t[h0]`, i `[` i `]` miren `t[h0]`;
- els dos caps comencen a 0, i el punter d'instruccions recorre tota la cinta, de 0 a 127.

**Les dues meitats:**
- **La "meitat del punter"** d'una escriptura o d'una lectura és la meitat on és el punter d'instruccions quan s'executa la
  instrucció: de 0 a 63, o de 64 a 127.
- **La posició escrita** és `h1` per a `.`, i `h0` per a `,`, `+` i `-`. **La posició llegida** és `h0` per a `.`, i `h1` per a `,`.
- **Una escriptura bloquejada,** o una còpia que X1 o X0 no fan, no canvia la cinta, consumeix el pas i compta com una operació. A
  les variants K, R i L, en canvi, l'instrucció no s'executa: no compta.

| Id | Definició exacta | Què diu | Què esperem, i per què |
|---|---|---|---|
| **C0** | BFF, tal com és | La referència | Replicadors, amb la distribució D½ |
| **K0** | `.` i `,` no fan res | **Control:** sense còpia | 0, a la pràctica. Només `+` i `-` escriuen, i refer així 16 bytes d'un altre programa és molt improbable |
| **L0** | `[` i `]` no fan res | **Control:** sense bucles | 0, a la pràctica. Cada instrucció s'executa com a molt un cop, i 64 bytes a l'atzar gairebé mai no tenen prou instruccions de còpia per copiar-ne 16 un a un |
| **X0** | Cap còpia ni cap escriptura d'una meitat a l'altra: una escriptura a l'altra meitat que la del punter no fa res, ni una còpia que hi llegeix (S4 i X1 alhora) | **Control:** cap byte no passa d'una meitat a l'altra | 0, a la pràctica, no per construcció (tots dos, AUD-144). Només el flux de control en passa informació: un valor hi pot passar comptant, amb un bucle que s'obre en un programa i es tanca a l'altre, i amb codi dels dos. Amb una parella feta a mà, el company acaba portant 16 bytes del programa. Els companys de la prova són de soroll, i no hi posen aquest codi. És el control que S4 no era (auditor 1, AUD-140) |
| **K1** | `.` no fa res | Hi ha replicació només amb `,`? | Sí: `,` també copia d'una meitat a l'altra, si `h0` va enrere (`<`) |
| **K2** | `,` no fa res | Hi ha replicació només amb `.`? | Sí, amb `{`. No és el mirall de K1: `[`, `]`, `+` i `-` són de `h0` |
| **R0** | `+` i `-` no fan res | Cal l'aritmètica? | Sí que n'hi ha: copiar no demana canviar bytes |
| **S1** | Escriure a la meitat del punter no fa res | Sense automodificació: el codi que s'executa no es pot reescriure | Sí que n'hi ha: un replicador escriu al company, no a si mateix |
| **S2** | Escriure a les posicions 0–63 no fa res | El primer programa no es toca | Sol, sí: el primer escriu al segon. En context, cap, per construcció: el segon no pot escriure al primer (auditor 1) |
| **S3** | Escriure a les posicions 64–127 no fa res | El segon programa no es toca | Sol, cap, per construcció: el primer no pot escriure al segon. En context, sí: el segon escriu al primer |
| **S4** | Escriure a l'altra meitat que la del punter no fa res | Cada programa només escriu a la seva meitat. Fa parella amb S1: amb S1, el programa només escriu al company; amb S4, el company només escriu a si mateix | Sí, per una via sabuda: el codi del company, que s'executa a la seva meitat, s'hi pot copiar el programa, amb un bucle que el programa obre i es tanca al company (AUD-140). A la v0.2 era un control. Amb companys inerts (la prova d'autonomia, §4), 0 per construcció en tots dos papers: un company inert no hi executa res, i el programa no hi pot escriure (AUD-176) |
| **X1** | Una còpia que llegeix de l'altra meitat que la del punter no fa res: no s'executa, però compta | Sense lectura del company (auditor 2). Només limita les còpies: `+`, `-`, `[` i `]` fan servir `h0` sigui on sigui (auditor 1) | Sí: un replicador llegeix el seu codi, de la seva meitat, i escriu a l'altra |
| **H64** | `h1` comença a 64, i no a 0 | Els caps alineats amb el company (Knierim i altres, CUST64) | Més que C0. Amb C0, la còpia senzilla és la del mirall (`{` porta `h1` a 127), i el fill és el programa al revés, que també s'ha de saber copiar. Amb H64, la còpia directa (`[.>}]`) deixa un fill idèntic, que es copia igual |

**Fora del nivell 1:** sense mutació (M0) i l'ordre simètric de la parella (O). Són regles de la sopa, i no tenen sentit amb un
programa sol (§10).

**Si S1 té un efecte fort,** el pas següent són les variants per cap: només les escriptures de `h0` (`+ - ,`), o només les de `h1`
(`.`) (auditor 1). En té, ×3,95 (l'entrada 15): són a la §14, fora del nivell 1 i del nivell 2.

## 3. Les distribucions de bytes

Els programes que es posen a prova es fan byte a byte, independents, amb una distribució fixada. És la mateixa per a totes les
variants: el que canvia és la química, no els programes.

- **D½, la principal:** cada byte és, amb probabilitat ½, una de les 10 instruccions, a l'atzar; si no, un dels altres 246 valors, a
  l'atzar.
  - **Per què:** amb bytes uniformes, la majoria dels programes només tenen 2 o 3 instruccions, i esperem molt pocs replicadors,
    potser cap.
  - **D'on surt:** de CUST, de Knierim i altres (2026), però no hi és idèntica. No sabem quins bytes sense efecte fan servir, i la
    seva química és `bff_selfmove`, no `bff_noheads`.
- **Du, uniforme:** la de la sopa del començament. Només amb C0 i K0, per acotar la densitat al principi d'una sopa.
- **Ds, l'histograma d'una sopa envellida:** els bytes amb la freqüència d'una sopa de l'època 8.000 sense vida. Lligaria B1 amb
  la maduració: si la composició envellida fa més probables els replicadors. Però és una altra pregunta, i la sopa envellida depèn
  de la química. Des de la v0.2, és a la §13: les sopes del pilot de la maduració, amb estrats fets amb la seva composició, i cap
  tirada amb Ds al nivell 1.

## 4. La mesura

**La prova és la del cens:** `replicationTest` de `fase2/replication.js`, amb `heredity` i `complete`, i amb l'intèrpret de la
variant (AUD-65). Cap prova nova (AUD-02).
- **On:** en una sopa barrejada de 9 programes: el que es prova, a la cel·la 0, i 8 de soroll, de bytes uniformes.
  - **Sol:** el programa va primer, amb un company de soroll. És el que fa el cens. El codi del company també s'executa, després del del
    programa: «sol» vol dir «el programa primer», i no «sense el codi del company» (auditor 1, AUD-175).
  - **En context:** va segon, amb un dels 8 de soroll primer. Al cens, el company és un veí del món. Aquí no hi ha món, i un
    company de soroll és el més neutre.
- **La mesura principal:** si el programa és un replicador hereditari, sol o en context (`heritable`).
- **Les secundàries:** `heritableSolo` i `heritableContext`, per separat; i si es replica, sense herència. Es donen sempre per
  separat, i amb el total (auditor 2): en context, el company hi pot contribuir (AUD-42).
- **Els replicadors que es troben** es desen sencers, per descriure'ls després: quantes instruccions tenen, el més curt, si es copien
  al revés, i si sols o en context.
- **Una mesura exploratòria, després del nivell 1: si els replicadors trobats són autònoms** (auditor 1). És la prova d'autonomia,
  fixada a la v0.5 (aquí sota).

### La prova d'autonomia (v0.5, per a l'auditoria 28)

**La pregunta:** si un replicador hereditari es copia sense el codi del company. Amb un company de soroll, el codi del company hi pot
contribuir, en tots dos papers: és el mecanisme de l'AUD-42, i el de l'AUD-140, que també hi és amb C0. A l'auditoria 27, una
comprovació exploratòria de l'auditor 1, sense la prova de l'herència, ho va mirar: amb bytes uniformes, 1 de 37. Els 44 d'S4, cap, però
és per construcció (AUD-176, aquí sota).

**Els replicadors:** els 75.118 hereditaris del nivell 1, de l'extracte (`fase2/resultats/b1/nivell1/hereditaris.jsonl.gz`,
comprovat amb la SHA-256 del contingut, `6029d878…`):
- **amb D½,** els de les 10 químiques de la llista del nivell 2: C0, K1, K2, R0, S1, S2, S3, S4, X1 i H64. Tots, sense mostra;
- **amb bytes uniformes,** els 37 de C0: exploratori (tots dos auditors).

Cada replicador es prova amb la seva química. Abans de començar, l'eina en torna a fer els bytes amb el generador del nivell 1: han de
ser els mateixos.

**El company inert** (auditor 2: què és, com es fa i com es comprova):
- **què és:** 64 bytes, cadascun a l'atzar d'entre els 246 valors que no són cap de les 10 instruccions. El 0 hi és, perquè decideix
  els bucles (auditor 1). L'enter, `(rng() · 246) | 0`, amb el biaix més gran de 246 / 2³², com el de D½;
- **per què és inert:** amb totes les químiques, un byte que no és una instrucció no fa res, i només consumeix el pas. Un company inert
  no hi executa res: només hi pot ser llegit, i escrit;
- **com es comprova:**
  - **a les proves,** 10.000 cintes de dos companys inerts per química, amb les 15 químiques: cap operació, i la cinta igual
    (`test/quimiques.mjs`);
  - **a l'eina, abans de començar,** cada parella ordenada dels 8 companys de cada condició, executada amb la química: cap operació,
    la cinta igual i cap byte d'instrucció. Si no, s'atura. El resultat va a la línia d'inici, i l'anàlisi el comprova;
  - **els controls,** a les proves: els tres replicadors reals de les proves (el de la Fase 1, l'espaiat i l'immune) es copien sols amb
    companys inerts a 15 o més de 20 condicions amb C0, i a cap amb S4; el programa de l'auditor 1 de l'AUD-140, que necessita el codi
    del company, no es replica a cap, ni amb C0 ni amb S4;
  - **un control positiu del context** (AUD-177; cap dels tres d'abans no es copia quan va segon): un palíndrom fet a mà, `{,[>{,]`, 25
    bytes de dades diferents i el seu mirall. Quan va segon, `{` porta `h1` a 127, i el bucle copia de `h1`, que baixa, a `h0`, que puja:
    la primera meitat acaba portant el programa al revés, que és ell mateix. Amb C0, és hereditari en context a les 20 condicions de la
    prova, i sol a cap; amb K2 (sense `,`), no es replica.

**Les condicions:** 100, les mateixes per a tots els replicadors i totes les químiques.
- **La condició j** (de 0 a 99): els 8 companys inerts de la sopa, fets amb el generador de la llavor 250.000.000 + 2j, i l'atzar de la
  prova, el de 250.000.000 + 2j + 1 (§15).
- **Què és el mateix per a tots** (auditor 1, auditoria 28): els 8 companys de la sopa, la llavor de l'atzar de la prova i, per tant, el
  primer company del paper sol. Els que venen després (els altres intents, i els de l'herència) depenen de l'atzar que ha gastat cada
  programa, com al cens.
- **La sopa:** el replicador, a la cel·la 0, i els 8 companys inerts, com la del nivell 1.

**La prova** és la del cens (`fase2/replication.js`, AUD-02), amb l'herència, completa, l'intèrpret de la química i dues opcions noves,
desactivades per defecte:
- **`soloPartner`:** el company del paper sol, i el del fill a la prova de l'herència sola, inert. En context, els companys són els de
  la sopa, inerts;
- **`bothRoles`:** l'herència en context es prova encara que l'herència sola ja hi sigui. Sense, `heritableContext` vol dir «només en
  context» (AUD-172). Amb, «hereditari en context»: tenim tots dos papers sencers (auditor 2).
- **La compatibilitat amb la prova d'abans** (auditor 2):
  - **sense les opcions,** la prova és la de sempre, i gasta el mateix atzar. Les empremtes de `test/determinisme.mjs`, el cens i les
    proves de les químiques no canvien, i `test/b1-autonomia.mjs` ho comprova programa a programa;
  - **amb `bothRoles`,** `solo`, `context`, `heritableSolo` i `heritable` són els de la prova del cens. Només canvia `heritableContext`:
    el del cens és el de `bothRoles` quan el programa no és hereditari sol;
  - **la xifra principal** d'una condició, si és hereditari sol o en context, és, doncs, la de la prova del cens, amb companys inerts.

**Les xifres,** fixades abans de calcular:
- **per a cada replicador,** de 0 a 100: *n*, en quantes condicions és hereditari, sol o en context (la xifra principal); *n*sol i
  *n*context, en cada paper. Al registre hi ha les quatre cadenes de 100 (es replica i és hereditari, sol i en context);
- **les quatre xifres** (X-093, i l'auditor 2 a X-094):

  | *n* | Què vol dir |
  |---|---|
  | 1 o més | Es pot copiar sense el codi del company: la capacitat, observada |
  | Més de 50 | Es copia en la majoria de les condicions assajades |
  | 95 o més | Autonomia robusta |
  | 100 | Autonomia estricta |

  «Robusta» i «estricta» són classificacions experimentals operatives de les 100 condicions assajades, no propietats demostrades amb un
  nombre finit de proves (auditor 2, auditories 27 i 28);
- **per a cada química:** quants replicadors passen cada xifra, amb l'interval de Clopper-Pearson del 95 % (la part dels hereditaris de
  la química); la distribució de *n* (0, de 1 a 10, d'11 a 50, de 51 a 94, de 95 a 99, i 100); les mateixes quatre xifres amb *n*sol i
  amb *n*context; i les quatre, per separat, per als que al nivell 1 eren hereditaris sols i per als que només ho eren en context;
- **els robustos i els fràgils** (exploratori; la recomanació de l'auditor 2 a X-094): per a cada grup de *n* (0, de 1 a 50, de 51 a 94,
  de 95 a 100), quants n'hi ha, la mediana de les instruccions, de les instruccions diferents i de les còpies (`.` i `,`), i la part amb
  `[` i `]`. Fixades abans; si cal mirar-ne d'altres, serà després i es dirà;
- **S2 i S3:** cadascuna només pot tenir hereditaris en un paper, per construcció. *n* és el del paper que pot (auditor 1).
- **S4, 0 per construcció en tots dos papers** (auditor 1, AUD-176): amb S4, una escriptura a l'altra meitat que la del punter no fa res,
  i un company inert no hi executa res. El company no canvia mai, i cap dels 44 no s'hi pot copiar, sigui quin sigui el seu mecanisme.
  L'auditor 1 ho va comprovar en 200.000 cintes, com amb el control X0. La tirada d'S4 es queda, com a control.
- **Els zeros per construcció, a l'anàlisi:** S2 en context, S3 sol i S4 en tots dos papers. Cap replicació, ni sense herència: si n'hi
  hagués cap, seria un error del codi, i la validació s'hi negaria (la proposta de l'auditor 2, auditoria 29; a la v0.6, només ho deia
  la sortida).

**Què no diu:**
- **un nombre finit de condicions:** un replicador que no es copia en cap de les 100 es podria copiar en una altra;
- **un tipus de company:** els companys inerts són un extrem. A la sopa, els companys són altres programes, i un replicador que necessita
  el codi del company hi pot viure igualment. Per això, la llista del nivell 2 no canvia: S4 no s'exclou automàticament (tots dos), i el
  disseny del nivell 2 dirà abans de calcular què vol dir el resultat de cada variant (auditor 1).

**El cost:** uns 86 ms per replicador amb 100 condicions, en un fil (§8): unes 1,8 h de fil per als 75.118, uns 30 minuts amb el PC.

## 5. Els programes, les llavors i la mida

**Els mateixos programes a totes les variants** (un disseny aparellat).
- **El programa i:** es fa amb un generador propi (el v2), amb la llavor del pla més 2*i*. Els 8 de soroll, també.
- **L'atzar de la prova del programa i:** un altre generador propi, amb la llavor més 2*i* + 1. Així, el resultat d'un programa
  només depèn de la llavor, de l'índex i de la variant, i no del que han gastat els anteriors.
- **Per què:** una diferència entre dues variants, programa a programa, només pot ser de la química. I el càlcul es pot repartir
  en trossos, en qualsevol ordre i a qualsevol màquina, amb el mateix resultat.

**La mida:** 10⁷ programes per variant, amb D½, i els mateixos 10⁷ a totes.
- **Una ampliació, decidida només amb el control:** si C0 hi té menys de 30 replicadors hereditaris, totes les variants passen a
  10⁸ programes, els mateixos.
- **Amb Du:** 10⁷ programes, amb C0 i K0.
- **La llavor: 20261101,** fixada a la v0.3, abans de calcular res amb cap llavor que no fos la de prova (777, §8). Els programes del
  nivell 1 fan servir els generadors de 20.261.101 a 20.261.101 + 2·10⁸ − 1, amb 10⁸ programes (a la v0.3 hi deia "+ 1"; AUD-146).
  Les llavors de la §13 en seran fora. L'anàlisi comprova que tots els registres siguin d'aquesta llavor.

## 6. L'anàlisi, escrita abans de calcular

**Per a cada variant:** *k* de *N* replicadors hereditaris, amb l'interval de Clopper-Pearson del 95 %. Amb 0, la cota superior.

**Contra C0, programa a programa:**
- **la taula de 2 × 2:** els programes hereditaris a totes dues variants, només a C0, només a la variant, o a cap;
- **el quocient de les densitats,** amb el seu interval: el de dos recomptes de Poisson independents (la binomial condicionada), que
  amb els mateixos programes és conservador.
  - **Sense solapament, ho és sempre** (auditor 1, auditoria 26): condicionat al total, el recompte de la variant és binomial, i
    l'interval de Clopper-Pearson cobreix almenys el 95 % per a cada total.
  - **Amb solapament** entre els hereditaris de les dues químiques, l'interval és més ample del que caldria. Ho hem comprovat, però
    no ho hem demostrat (auditor 2):
    - **calculada exactament** (auditor 1), la cobertura del 95 % nominal no baixa del 95 % en cap de 90 escenaris: de 3 a 300
      hereditaris esperats a C0, quocients de 0,01 a 10, i un solapament de cap, de la meitat o total. La més baixa, el 95,34 %,
      és sense solapament;
    - **`node eines/densitat-cobertura.mjs`** la mesura per simulació, amb la mateixa funció de l'anàlisi, en 24 d'aquests
      escenaris, i hi coincideix.
  - **Per descriure, n'hi ha prou** (auditor 1), i la taula de 2 × 2 dona els programes que canvien.
- **els programes que canvien:** els que són replicadors a una variant i no a l'altra. Si una ablació en crea de nous, ho diu.

**Només amb el pla sencer** (AUD-142, AU2-103): les 13 químiques amb D½, C0 i K0 amb Du, la llavor del pla, i 10⁷ programes (o
10⁸, amb D½, després de l'ampliació, i només si amb els primers 10⁷ C0 en tenia menys de 30). Si en falta o en sobra res, l'anàlisi
llista els problemes i no analitza res. Tampoc no hi passa cap registre fet amb uns altres mòduls que els de la seva còpia
(AUD-139, AU2-102).

**Els controls primer.** Si K0, L0 o X0 donen cap replicador hereditari, no s'interpreta res més fins que no s'hagin mirat un a un:
són falsos positius de la prova, o una via que no hem previst. S4 ja no hi és (AUD-140).

**Les variants que passen al nivell 2:** les que tenen almenys un replicador hereditari amb D½, i C0. Les que no en tenen cap en
10⁷ (o 10⁸) programes es donen amb la cota, sense sopa.
- **Amb l'ampliació pendent,** la llista no surt: es fa amb els 10⁸ programes (AUD-142).
- **Un zero és una cota, no una impossibilitat** (tots dos auditors). La regla és un criteri per triar les variants de la sopa, i
  no diu que sense aquell ingredient la vida sigui impossible. "Un ingredient necessari" vol dir això: cap replicador hereditari
  amb una densitat per sobre de la cota.
- **Un replicador en context** no basta per dir que un ingredient és necessari (auditor 2): el company hi pot contribuir (§4).

**Tot és descriptiu.** No hi ha cap decisió preregistrada: el nivell 1 estima densitats, amb un càlcul determinista (el mateix commit
i la mateixa llavor donen el mateix). La decisió és quines variants van a la sopa, amb la regla d'aquí dalt.

## 7. Les prediccions

Són les de la taula de la §2, escrites abans de calcular:
- **Els controls** (K0, L0 i X0): 0, a la pràctica.
- **Per construcció:** S3, sol, i S2, en context: 0. I, a la prova d'autonomia (§4), S4 en tots dos papers (AUD-176).
- **Totes les altres:** replicadors, S4 inclosa (AUD-140). Les que més ens poden sorprendre:
  - **K1 i K2:** si una de les dues instruccions de còpia és molt més important que l'altra;
  - **S1:** si l'automodificació hi és necessària;
  - **S4:** quants replicadors fan el company i el seu codi;
  - **H64:** si alinear els caps fa els replicadors molt més abundants. És una hipòtesi (auditor 2).

## 8. El que ja s'ha mesurat

**Només el temps,** sense cap recompte (30-10-2026, al PC, Node 16, amb C0): la prova sencera, en una sopa de 9 programes, triga
uns 0,8 ms per programa i fil, amb Du i amb D½.
- **10⁷ programes,** unes 2,3 h en un fil.
- **Tot el nivell 1:** 13 variants amb D½ (12 a la v0.2, i X0 a la v0.3), més C0 i K0 amb Du. Són 1,5·10⁸ proves, unes 33 h de
  fil: unes 4,2 h amb els 8 fils del PC. La màquina virtual comparteix els mateixos fils, i no hi afegeix gaire.
- **Si cal l'ampliació** (§5): les 13 variants amb D½ passen a 10⁸ programes. Són 1,17·10⁹ proves més, unes 260 h de fil: unes 33 h
  més amb els 8 fils, un dia i mig en total (auditor 1, AUD-145).
  El responsable hi va donar el vistiplau el 02-11-2026, abans de calcular res.
- **Gairebé tot el temps** és de les finestres de 16 bytes, que es comparen com a text. Una versió més ràpida de
  `fase2/replication.js` hauria de donar els mateixos resultats, comprovats amb les empremtes. Ara no la proposem.
- **El que hem vist sense voler** (31-10-2026), en provar l'eina (§9) amb una llavor de prova (777) i 300 programes, amb C0 i D½: el
  JSONL tenia almenys un programa que es replica. No n'hem mirat quants, ni si són hereditaris. La llavor de prova no és la del pla,
  i les proves de l'eina no miren mai cap recompte.
- **A l'auditoria 25** (01-11-2026):
  - **L'eina, amb un sol programa:** els dos auditors la van fer córrer així, i només en van mirar el camp `code`. L'auditor 1, amb
    K0 i bytes uniformes; l'auditor 2, amb C0, D½ i la llavor 777.
  - **Un programa fet a mà:** l'auditor 1 en va posar a prova un amb S4, C0, K0 i L0 (AUD-140). No és cap programa a l'atzar, i no
    diu res de cap densitat. Les proves de `test/quimiques.mjs` el fan servir.
  - **La cobertura de l'interval del quocient** (§6): amb recomptes sintètics, sense cap programa.
- **A l'auditoria 26** (02-11-2026), tampoc cap programa a l'atzar:
  - **l'auditor 1:** l'eina amb un sol programa de K0, bytes uniformes i la llavor 777, només per al camp `code` i els mòduls; una
    parella de programes fets a mà, amb X0 (AUD-144); i la cobertura exacta de l'interval, sense sortejar res;
  - **l'auditor 2:** registres sintètics i quatre cintes fetes a mà.
- **El nivell 1, calculat** (04 i 05-11-2026, l'entrada 15): amb 8 fils, unes 4.600 proves per segon, la meitat del que preveia la
  primera línia d'aquesta secció (els 8 fils del PC no fan 8 vegades un). Els costos de la v0.5 fan servir aquesta velocitat.
- **Per a la v0.5, només el temps** (05-11-2026, al PC, Node 16, un fil, la llavor de prova 777), sense cap recompte:
  - **la prova d'autonomia:** uns 86 ms per replicador amb 100 condicions, amb els tres replicadors de les proves;
  - **els estrats de la §13:** de 0,79 a 0,94 ms per programa, de k = 0 a k = 64 (3.000 programes per estrat); les sopes, 0,77 ms amb
    companys uniformes i 0,84 amb companys de la sopa; D½ amb companys de D½, 0,95;
  - **els controls de les proves d'autonomia,** amb la llavor 777 i 20 condicions: és el que diu la §4. No són programes del nivell 1.
- **A l'auditoria 27** (05-11-2026), l'auditor 1 va provar fins a 200 hereditaris de cada variant amb un company inert, sense la prova
  de l'herència (§4 i l'entrada 15). No és la prova d'autonomia, i no en fem servir les xifres.
- **Les composicions de les 22 sopes del pilot** (§13): de l'11,15 al 11,57 % de bytes d'instrucció. Són dades del pilot, ja
  descrites a la seva acta (AUD-122), i no cap resultat de B1.
- **A l'auditoria 28** (06-11-2026), cap programa a l'atzar del pla:
  - **l'auditor 1:** la prova del cens a `main` i a la PR, amb 120.097 programes del nivell 1 i els seus registres (cap no canvia); un
    tros del nivell 1, el 43, refet amb el codi de la PR; 200.000 cintes d'un programa de D½ i un company inert, per química (AUD-176); i
    l'anàlisi de la §13 amb tirades sintètiques;
  - **l'auditor 2:** dues composicions sintètiques, que l'eina acceptava (AU2-140), i la verificació dels 15 registres del nivell 1;
  - **l'equip,** per a la v0.6: el control positiu del context, fet a mà (§4), i la cobertura de l'interval amb les mides noves (§13).

## 9. La implementació, en una PR

És a la branca `b1-ablacions`, amb el pla. No canvia res del que ja hi havia: les empremtes de `test/determinisme.mjs`, l'oracle de
cubff i les proves de l'intèrpret i del món passen igual.
- **`fase1/bff.js`:** les 13 químiques de la §2 (`CHEMISTRIES`), i `evaluator(nom)`, que en dona l'intèrpret.
  - **Amb C0,** és la funció `evaluate` d'ara, la mateixa: la sopa, el món i el cens no canvien.
  - **Amb les altres,** una còpia d'`evaluate` amb les regles de la química, i les mateixes dues optimitzacions. X0 hi té dues
    regles alhora, les de S4 i X1.
- **`fase2/replication.js`:** l'opció `evaluate`, amb l'intèrpret de la química. Per defecte, el d'ara.
- **`eines/densitat.mjs`, l'eina del nivell 1:**
  - **les opcions:** la química, la distribució, la llavor, quants programes, des de quin índex (`--de`), quants fils (`--fils`) i
    cada quants programes un recompte (`--tros`);
  - **un JSONL com el de `sim.mjs`:** la línia d'inici, amb el codi i l'ordre; els replicadors trobats, amb els bytes; els recomptes
    acumulats; i la línia final, amb una empremta dels resultats;
  - **el codi:** el commit, amb `+canvis` si qualsevol fitxer `.js` o `.mjs` del repositori té canvis sense desar. Git es crida des
    de l'arrel: des d'`eines/`, un canvi a `fase1/` o a `fase2/` no hi sortia (AUD-139, AU2-102);
  - **la SHA-256 dels quatre mòduls** que fan el càlcul (`fase1/bff.js`, `fase1/soup.js`, `fase2/replication.js` i
    `eines/densitat.mjs`), a la línia d'inici. A la màquina virtual, sense git, és l'única manera de veure-hi un canvi;
  - **el resultat no depèn dels fils:** cada programa té el seu atzar (§5), i els resultats s'escriuen en ordre;
  - **una ordre per química,** amb fils (`worker_threads`), en lloc d'`eines/llanca-lot.sh`, que només executa `sim.mjs`;
  - **no sobreescriu cap fitxer,** i a la consola només hi escriu el progrés.
- **`eines/densitat-analisi.mjs`, l'anàlisi de la §6:** escrita i provada amb dades sintètiques abans de calcular res.
  - **Valida els registres:**
    - cada fitxer sencer i coherent, amb l'empremta;
    - la línia d'inici: una química i una distribució conegudes, la prova del cens, i l'ordre que diu el mateix que els camps;
    - els bytes de cada replicador, els del programa que en donen la llavor i l'índex (auditor 1);
    - tots del mateix commit, sense canvis, i amb la SHA-256 dels mòduls igual que la dels de la còpia on es fa l'anàlisi;
    - el pla sencer (`PLAN`): la llavor i el soroll, les dues distribucions, totes les químiques de cadascuna i cap més, i una *N*
      prevista; 10⁸, només si amb els primers 10⁷ programes C0 en tenia menys de 30 (les N segons l'etapa, auditor 2). Cap mode
      parcial;
    - per a cada distribució, totes les químiques amb els mateixos programes, de 0 a *N*, sense forats.
  - **L'interval de Clopper-Pearson** suma els termes de la binomial, sense cap taula, i serveix amb *n* = 10⁸. A 10⁶, dona el valor
    exacte, fet amb racionals, fins a 10⁻¹².
  - **Els controls** (K0, L0 i X0): si cap té hereditaris, ho diu, i no aplica ni l'ampliació ni la regla del nivell 2.
  - **La llista del nivell 2,** només quan l'ampliació ja no és pendent.
- **`eines/densitat-cobertura.mjs`:** la cobertura de l'interval del quocient, amb recomptes sintètics (§6).
- **Les proves:**
  - **`test/quimiques.mjs`:**
    - cada regla, amb una cinta feta a mà, també a les posicions 63 i 64 (les fronteres de S2 i S3, que abans només atrapava la
      referència; auditor 1);
    - cada química, contra una versió de referència lenta, adaptada de la de cubff, en 10.000 cintes a l'atzar;
    - **l'AUD-65:** els tres replicadors reals de les proves són hereditaris amb C0 i no amb K0. Amb cada química, la prova de
      replicació dona el mateix amb el seu intèrpret que amb el de referència. Sense l'opció, és la de sempre.
    - **l'AUD-140:** amb el programa fet a mà de l'auditor 1, el codi del company s'hi copia el programa amb S4, i amb X0 no; i, a la
      prova del cens, amb S4 és hereditari, i amb X0 ni tan sols es replica.
    - **Que les proves atrapen els errors:** amb un error posat a propòsit a la regla de S1, en fallen quatre (a la v0.2, tres; la
      quarta és la de les fronteres). L'auditor 1 n'hi va posar quatre, i les proves els van atrapar tots.
      A l'auditoria 26, en va posar 15 més a les correccions, i també els van atrapar tots. Dos, X0 amb una sola de les seves dues
      regles, només els atrapen les cintes fetes a mà: la referència llegeix la definició de `CHEMISTRIES`, i comprova l'intèrpret,
      no la definició.
  - **`test/densitat.mjs`:** les opcions, que el resultat no depèn dels fils ni dels trossos, el JSONL, les distribucions, l'AUD-65 a
    l'eina, i que el codi i la SHA-256 dels mòduls vegin un canvi a `fase1/` i a `fase2/`, amb git i sense (AUD-139).
  - **`test/densitat-analisi.mjs`:** l'interval, un resultat conegut, els controls, l'ampliació, la llista del nivell 2, la línia
    d'ordres amb el pla de veritat, i cada manera com la validació s'hi ha de negar, també el pla incomplet i uns altres mòduls.

**El que hi afegeix la v0.5,** a la branca `b1-autonomia`. Sense les opcions noves, res del que ja hi havia no canvia: les empremtes de
`test/determinisme.mjs`, l'oracle de cubff, els valors del cens i les proves de l'intèrpret, del món i del nivell 1 passen igual.
- **`fase2/replication.js`:** les opcions `soloPartner` i `bothRoles` (§4), desactivades per defecte.
- **`fase1/bff.js`:** S1h0 i S1h1 (§14), amb una regla nova, `heads`: de quin cap són les escriptures bloquejades. Les altres 13
  químiques fan el mateix que abans: la referència lenta de `test/quimiques.mjs` les comprova totes, també les dues noves.
- **`eines/densitat-analisi.mjs`:** les 13 químiques del nivell 1, escrites a `PLAN` (abans, totes les de `fase1/bff.js`, que ara en
  té 15); i la línia final de cada registre, a la validació, per a l'anàlisi de la §14.
- **`eines/densitat-cobertura.mjs`:** la llavor de la simulació, la del mapa (§15, AUD-146). La cobertura més baixa és del 95,64 %
  (abans, del 95,69 %).
- **Les eines noves:**
  - `eines/b1-llavors.mjs`: el mapa de llavors i la comprovació (§15);
  - `eines/b1-comu.mjs`: el codi, la SHA-256 dels mòduls, les opcions, l'extracte, els fils i la lectura dels JSONL;
  - `eines/b1-estadistica.mjs`: la gamma i la beta incompletes, Clopper-Pearson amb la beta (per a milers d'èxits) i l'interval de Fay i
    Feuer (§13);
  - `eines/autonomia.mjs` i `eines/autonomia-analisi.mjs`: la prova d'autonomia i la seva anàlisi (§4);
  - `eines/caps-analisi.mjs`: l'anàlisi de les variants per cap (§14);
  - `eines/estrats.mjs`, `eines/composicio.mjs`, `eines/estrats-analisi.mjs` i `eines/estrats-cobertura.mjs`: la §13;
  - `eines/b1-llistes.mjs`: les llistes d'ordres (§11);
  - `eines/executa-b1.sh`: l'executor, amb la guarda de l'AUD-174 (§11);
  - `eines/b1-compara.mjs`: la repetició d'un registre sencer, comparada amb l'original (§11).
- **Els mòduls de cada registre:** com al nivell 1, la SHA-256 de cada mòdul de què depèn el resultat va a la línia d'inici, i l'anàlisi
  la compara amb la dels de la seva còpia. Les eines noves no importen `eines/densitat.mjs` als fils: dins d'un fil, hi posaria el seu
  receptor de feines (`eines/estrats.mjs` en porta una còpia del sorteig de D½, i una prova comprova que fa les mateixes sopes).
- **Les proves noves:** `test/b1-autonomia.mjs` (les opcions, el mapa, l'estadística, els companys inerts, els controls, l'eina i les
  dues anàlisis), `test/b1-estrats.mjs` (els sortejos, les composicions, l'eina, el pla, les llistes, l'anàlisi i ρ(p)) i
  `test/executa-b1.mjs` (l'executor i la guarda, en un repositori de prova).

**El que hi afegeix la v0.6** (l'auditoria 28). El que ja hi havia fa el mateix, i les llistes de l'autonomia i de les variants per cap
no canvien:
- **`eines/estrats.mjs`** (AU2-140): la composició d'una sopa es comprova sencera abans de començar, i abans de crear el JSONL: exactament
  2²³ bytes; 256 recomptes enters, no negatius, que hi sumen; les instruccions, les que en surten amb els 10 opcodes; i la cohort del
  pilot (`checkCohort`: el món, inclòs al manifest, l'època 8.000 i la captura, amb la seva SHA-256). `uniformInt` i el sorteig d'una
  composició es neguen amb un total fora d'1 a 2³², en lloc de no acabar.
- **`eines/autonomia.mjs --registre`** (AUD-175): la prova d'autonomia dels hereditaris d'un registre de la §13, amb els bytes de cadascun
  refets amb el sorteig del registre. La línia d'inici en porta el nom, la SHA-256 i l'empremta, i la SHA-256 d'un mòdul més,
  `eines/estrats.mjs`.
- **`eines/estrats-autonomia-analisi.mjs`** (AUD-175): l'anàlisi de ρ_aut(p) (§13), escrita i provada abans de calcular.
- **`eines/autonomia-analisi.mjs`** (AUD-176): els zeros per construcció, comprovats i escrits a la sortida.
- **`eines/estrats-analisi.mjs`:** les 22 sopes juntes, aparellades (auditor 1), els noms dels companys de les sopes (auditor 2), i la
  SHA-256 de cada registre, per a la prova d'autonomia dels seus hereditaris.
- **`eines/b1-llavors.mjs`** (AUD-178): 10⁷ programes als estrats de k = 0 a 12. **`eines/b1-llistes.mjs`:** la llista nova,
  `estrats-autonomia`. **`eines/estrats-cobertura.mjs`:** l'escenari de l'auditor 1, un terra a tots els k.
- **`fase2/replication.js`:** només el comentari de l'AUD-42 («sol» vol dir «el programa primer», AUD-175). El codi no canvia.
- **Les proves:** les quatre composicions dolentes de l'auditor 2 i tres de fora de la cohort, amb l'eina sencera, que s'hi nega sense
  deixar cap JSONL (AU2-140); el control del context (AUD-177); els zeros per construcció (AUD-176); l'eina amb `--registre`, amb els
  hereditaris coneguts dels primers 5.000 programes del nivell 1, i la seva validació, i com s'hi nega (AUD-175); i `analyse()` de les
  dues anàlisis de la §13, amb dades sintètiques (AUD-177).

**El que hi afegeix la v0.7** (l'auditoria 29). Cap llista no canvia, i cada prova nova falla amb el codi d'abans:
- **`eines/b1-comu.mjs`:**
  - **`runJobs`** (AUD-179) acaba de seguida si no hi ha cap feina: abans, amb més d'un fil, no en creava cap, la promesa no es resolia
    mai, i l'eina sortia amb el codi 0 sense escriure la línia final. I s'hi nega si un fil s'atura abans d'acabar les seves feines;
  - **`readOptions` i `commandOptions`** (AU2-143): la lectura de les opcions de les eines, la mateixa a la línia d'ordres
    (`parseOptions`, que fa el mateix que abans) i a l'ordre de cada registre, sencera.
- **`eines/executa-b1.sh`:** després de cada ordre, el registre ha d'acabar amb la línia final, a més del codi 0 (AUD-179); la consola de
  cada ordre, a `consola-LLISTA/`, una carpeta per llista (AUD-180).
- **`eines/estrats.mjs`** (AU2-142): `checkRecordComposition`, la composició d'un registre d'una sopa, després de la tirada: el fitxer,
  sencer i de la cohort, i el món, l'època, la captura i la SHA-256 de la línia d'inici, les del fitxer. La fan servir l'anàlisi de la
  §13 i la prova d'autonomia dels hereditaris (`--registre`), que s'hi nega sense crear el JSONL.
- **Les tres anàlisis** (AU2-143): l'ordre de cada registre, llegida sencera amb el contracte d'opcions de l'eina, ha de dir el mateix
  que la línia d'inici, i el seu JSONL ha de ser el fitxer. A l'anàlisi de ρ_aut, abans només se'n mirava el registre.
  - **Del JSONL, només el nom del fitxer,** no la carpeta (AU2-145, auditoria 30): els registres s'han de poder analitzar des d'una
    còpia, com fan els auditors, i la ruta de l'ordre no queda certificada.
  - **La quarta, la de la §14** (`eines/caps-analisi.mjs`), fa servir la validació del nivell 1 (`eines/densitat-analisi.mjs`), que no
    canvia: compara amb una expressió regular les opcions que fan el resultat, i no hi veu un altre JSONL ni una opció repetida o
    desconeguda (AUD-181, auditoria 30). Els registres de la §14 hi queden lligats d'altres maneres: C0 i S1 han de donar la línia final
    del nivell 1, i S1h0 i S1h1, la llavor del pla, els bytes de cada replicador, l'empremta i els mòduls.
- **`eines/autonomia-analisi.mjs`:** un zero per construcció trencat és un problema de la validació, i no només una frase de la sortida
  (la proposta de l'auditor 2 a l'AUD-176).
- **`eines/estrats-autonomia-analisi.mjs`** (AU2-144): la sortida diu què mesura ρ_aut.
- **Les proves:** un registre de la §13 sense hereditaris, amb `--fils 8`, que l'anàlisi de ρ_aut accepta amb 0 replicadors, i un fil
  que s'atura (AUD-179); l'executor amb una eina que surt amb el codi 0 sense la línia final, i dues llistes a la mateixa carpeta
  (AUD-179 i AUD-180); el contraexemple de l'auditor 2 de l'AU2-142, i dos camps de la línia d'inici canviats; el de l'AU2-143, i un
  altre fitxer, una opció d'un altre mode, repetida o desconeguda, a les tres anàlisis; i un replicador d'S4 que es replica sol.

## 10. El nivell 2, la sopa (esbós)

- **Les variants:** les que passin el nivell 1, i C0, M0 (sense mutació) i O (l'ordre simètric).
  - **De M0:** l'article diu que la vida hi apareix igualment, i ho voldríem reproduir.
  - **D'O:** cal decidir si es dobla el pressupost de passos o si es reparteix (auditor 1).
- **On:** a la sopa barrejada de la fase 1, que és barata i hi fa vida en milers d'èpoques (`docs/disseny.md`, §4).
- **Les mesures** (auditor 2): l'origen hereditari, l'establiment i la persistència, per separat, amb el cens de la mateixa química.
- **El disseny:**
  - 15–20 llavors per variant, i un control concurrent;
  - el temps fins al primer replicador hereditari, amb log-rank;
  - preregistrat, i revisat pels dos auditors abans de llançar-lo.

## 11. El calendari

1. **Durant la sèrie de la maduració:** aquest pla i la PR de la §9, revisats a l'auditoria 25, i les seves correccions, a l'auditoria
   26: GO de tots dos (02-11-2026).
2. **Després de la sèrie i de la seva decisió,** quan el PC i la màquina virtual siguin lliures: el nivell 1, unes 4,2 h (13 químiques
   amb D½, i 2 amb Du), i unes 33 h més si cal l'ampliació (§8).
   - **D'on:** d'una còpia neta d'un commit de `main` amb aquest pla i els quatre mòduls de `0bb753e`, idèntics (auditor 2).
   - **Abans de llançar:** la llista de les 15 ordres, a git, amb la seva SHA-256 (auditor 2).
   - **Mentre corren:** cap recompte. El seguiment, només agregat.
   - **Al costat dels registres:** el commit, la versió de Node, la llista i la SHA-256 de cada registre (auditor 2).
   - **Abans d'analitzar, si s'han fet de debò** (auditor 2): es tornen a fer 3 trossos de 10⁵ programes de cada tirada (els de
     `--tros`), triats amb `eines/tria.mjs` i una llavor declarada que no és la del pla. Els replicadors i els recomptes hi han de
     coincidir.
   - **L'anàlisi,** des d'una còpia amb els quatre mòduls idèntics: el commit del càlcul, o un de posterior que no els toqui. Un
     canvi qualsevol a `eines/densitat.mjs` després de calcular, encara que sigui un comentari, fa que l'anàlisi rebutgi els
     registres (auditor 1).
   - **Fet** (04 i 05-11-2026): l'entrada 15, revisada a l'auditoria 27.
3. **La PR de la v0.5** (la branca `b1-autonomia`): el pla, el codi i les proves, i l'auditoria 28, breu, abans de calcular res. Hi va
   també el que l'auditoria 27 va deixar per a la 28: els 15 registres del nivell 1, per a l'auditor 2 (AU2-139), i les correccions de
   text de l'AU2-138.
   - **Fet** (06-11-2026): GO de l'auditor 1, amb dos canvis de text; GO de l'auditor 2 per a l'autonomia i les variants per cap, i NO-GO
     de la §13 fins a l'AU2-140. Les correccions, a la v0.6, i l'auditoria 29, breu, abans de calcular res.
   - **L'auditoria 29** (09-11-2026): NO-GO de tots dos a la PR sencera, per uns defectes petits de les eines i de la validació. L'auditor
     1, GO quan es corregeixi l'AUD-179; l'auditor 2, GO per a l'autonomia i les variants per cap, i la §13 i ρ_aut, quan es corregeixin
     l'AU2-142 i l'AU2-143. Les correccions, a la v0.7, i l'auditoria 30, breu. Res no es calcula abans del merge, tampoc l'autonomia:
     l'AUD-179 canvia `eines/b1-comu.mjs`, un dels mòduls que compara la seva anàlisi (l'auditor 1).
   - **L'auditoria 30** (10-11-2026): GO de tots dos per calcular la PR sencera, després del merge i des d'una còpia neta. Dues troballes
     noves, baixes, que no bloquegen (AUD-181 i AU2-145): precisions del text, sense cap canvi de codi (§9 i §12).
4. **Després del GO i del merge,** en aquest ordre, cada càlcul amb la seva llista:

   | Què | Llista (`fase2/resultats/b1/…`) | Ordres | Temps, amb el PC |
   |---|---|---|---|
   | La prova d'autonomia (§4) | `autonomia/llista.txt` | 11 | unes 0,5 h |
   | Les variants per cap, i C0 i S1 de nou (§14) | `caps/llista.txt` | 4 | unes 2,4 h |
   | La composició (§13): els 65 estrats, les 44 tirades de les sopes, i D½ amb companys de D½ | `estrats/llista.txt` | 110 | unes 13,7 h |
   | L'autonomia dels hereditaris de la §13 (ρ_aut, AUD-175) | `estrats/llista-autonomia.txt` | 110 | uns minuts |

   - **Les llistes** les fa `node eines/b1-llistes.mjs autonomia|caps|estrats|estrats-autonomia`, a partir del pla i del mapa de llavors,
     i són a git abans de calcular; `test/b1-estrats.mjs` comprova que són les que en surten. Les SHA-256, al README de cada carpeta.
   - **D'on:** d'una còpia neta del commit del merge, a D:, sense cap fitxer de codi sense seguir. Abans del primer lot, els mòduls i les
     eines de l'arbre del merge, els mateixos que els de la PR auditada, `bc9dd94` (auditor 2, auditories 29 i 30; després de
     l'auditoria 30, la PR només hi canvia el text), i la comparació, escrita.
   - **Com:** `bash eines/executa-b1.sh LLISTA SHA-256 COMMIT`, des d'una finestra de PowerShell del responsable, fora de l'aplicació
     (la incidència 2 de la maduració). L'executor és el del nivell 1 amb la guarda de l'AUD-174: cap fitxer `.js` o `.mjs` amb canvis
     o sense seguir, abans de començar i abans de cada ordre, i cap registre que digui `+canvis`. La guarda és la de git, i no veu els
     fitxers que git ignora (auditor 2): cap carpeta de codi del repositori no ho és. Després de cada ordre, el registre ha d'acabar amb
     la línia final, a més del codi 0 (AUD-179). La consola de cada ordre, a `consola-LLISTA/`, al costat de la llista (AUD-180).
   - **Mentre corren:** cap recompte. Només l'estat de l'executor.
   - **Al costat dels registres,** com al nivell 1: el commit, la versió de Node, la llista i la SHA-256 de cada registre.
   - **Els registres:** a git, si cap no passa de 50 MB; si no, com al nivell 1, comprimits a una versió de GitHub, i un extracte a git.
   - **Abans d'analitzar, la repetició** (auditor 2), amb la llavor que surt de la SHA-256 d'`execucio-llista.txt`, com al nivell 1: tres
     registres sencers de l'autonomia, tres de la §13 i tres de l'autonomia dels seus hereditaris, triats amb `eines/tria.mjs`, comparats
     amb `eines/b1-compara.mjs`; i, de les variants per cap, tres trossos de 10⁵ de cada registre, com al nivell 1. Ho diu el README de
     cada carpeta; les de les dues llistes de la §13, a `repeticio/registres/` i a `repeticio/autonomia/` (AUD-180). És una verificació
     per mostreig, no una demostració de totes les tirades (auditor 2).
   - **Les anàlisis,** cadascuna quan acabi la seva llista, des d'una còpia amb els mateixos mòduls: `eines/autonomia-analisi.mjs`,
     `eines/caps-analisi.mjs`, `eines/estrats-analisi.mjs` i, quan acabi l'autonomia dels hereditaris de la §13,
     `eines/estrats-autonomia-analisi.mjs`. Totes quatre es neguen si hi falta o hi sobra res.
5. **Després:** el disseny del nivell 2, amb la prova d'autonomia feta, i dient que la decisió es pren després de veure el nivell 1
   (auditor 1). Tindrà el seu protocol, amb les hipòtesis i els criteris fixats abans (auditor 2).

**El nivell 1 es reprodueix des d'una còpia d'`a677726`,** el commit del càlcul: aquesta PR canvia dos dels quatre mòduls que
l'anàlisi del nivell 1 compara (AUD-139), i des de `main`, després del merge, s'hi negarà. És la regla d'aquesta mateixa secció (un
canvi qualsevol a un mòdul fa que l'anàlisi rebutgi els registres), i la recepta és a `docs/reproduir.md` (§7). C0 i S1, tornats a
calcular amb el codi nou (§14), han de donar els mateixos registres: és una comprovació de punta a punta que el codi nou fa el mateix.

## 12. Les decisions (de l'auditoria 25 a la 29)

**Ja decidit pel responsable (01-11-2026):** els dos nivells (§1).

**Decidit a l'auditoria 25,** entre els dos auditors i Claude. On no coincideixen, ho diu:

| Què | Auditor 1 | Auditor 2 | Ara |
|---|---|---|---|
| **Les variants** | Cap més, llevat del control S4 refet. Sense els controls de caps | Les 12, sense els controls de caps | Les 12, i el control X0 (§2) |
| **El control S4** (AUD-140, AU2-104) | El control, S4 i X1 alhora; S4, una variant | Sense "0, per construcció"; S4, una variant diagnòstica, i el criteri dels controls, corregit | S4 es queda, amb una predicció que no és 0 (tots dos). El control X0 és la proposta de l'auditor 1: l'auditor 2 el revisa a l'auditoria 26 |
| **Les distribucions** | D½, i Du amb C0 i K0 | Igual | Igual (§3) |
| **La mida i el disseny aparellat** | D'acord | D'acord | 10⁷, i 10⁸ si C0 en té menys de 30; els mateixos programes (§5) |
| **Els companys de soroll** | De bytes uniformes | Igual | Igual (§4) |
| **La llavor** | Al pla definitiu, al commit del càlcul | Fixada per escrit | 20261101 (§5) |
| **La composició** | Sí, exploratòria; estrats amb la composició de cada sopa (AUD-143) | Sí, en una PR a part; estrats de k = 0 a 64 | Les dues coses (§13) |
| **El descobriment** | 2, 1, 3 i 4, i una cinquena: la dependència del company | 1, 2, 3 i 4 | La 1 i la 2 al capdamunt; a la pràctica, la 2 primer (§13) |
| **GO** | GO, amb tres canvis abans de calcular | NO-GO fins a una PR focalitzada i una revisió breu | Els canvis, en aquesta PR, i l'auditoria 26, abans de calcular |

**Per a l'auditoria 26,** breu: les correccions (§2, §5, §6 i §9), les decisions de la §13, i si el nivell 1 es pot calcular quan acabi
la sèrie.

**Decidit a l'auditoria 26** (02-11-2026). Els dos auditors coincideixen en tot el que importa:

| Què | Auditor 1 | Auditor 2 | Ara |
|---|---|---|---|
| **GO** | GO, sense cap canvi de codi | GO focalitzat: el merge, amb els mòduls de `0bb753e` | GO: el càlcul, després de la sèrie i de la seva decisió (§11) |
| **X0** | Un bon control: 0 a la pràctica, no per construcció (AUD-144) | Un control operacional, no un teorema de zero | X0 es queda, amb la frase de l'AUD-144 (§2) |
| **L'ampliació** | El cost, abans; el vistiplau del responsable, o una regla nova ara (AUD-145) | La regla, tal com és | La regla no canvia; el vistiplau del responsable, el 02-11-2026 (§8) |
| **Les llavors** | Les de la §13, fora de l'interval del nivell 1, i una per estrat (AUD-146) | — | A la §13 |
| **L'interval del quocient** | Exacte en 90 escenaris, i demostrat sense solapament | Els escenaris no ho demostren en general | Les dues coses (§6) |
| **El que es desa** | L'anàlisi, amb els mòduls idèntics | El commit, Node, les ordres i les sumes; reproduir mostres | Tot (§11) |

**Decidit a l'auditoria 27** (05-11-2026), i a X-093 i X-094. On no coincidien, la proposta de l'equip, que l'auditor 2 va acceptar
(X-094):

| Què | Auditor 1 | Auditor 2 | Ara |
|---|---|---|---|
| **La llista del nivell 2** | La de la regla | La de la regla, sense excloure S4 | Es queda. El disseny del nivell 2 dirà abans què vol dir el resultat de cada variant (§11) |
| **El criteri d'autonomia** | Dues xifres per ordre: en algun dels 100 (la principal), i en la majoria | De 0 a 100; robust, 95 o més; estricte, 100. «En alguna» no és autonomia | La distribució sencera, sol i en context, i quatre xifres: 1 o més, més de 50, 95 o més, i 100. «Robusta» i «estricta», operatives (§4) |
| **Els companys inerts** | Amb el 0, que decideix els bucles | Definir què és inert, com es fa i com es comprova | Una opció nova a `replicationTest`, desactivada per defecte, i tres comprovacions (§4) |
| **Els 37 de bytes uniformes** | Sí | Sí, exploratori | Sí, exploratori (§4) |
| **Els robustos i els fràgils** | — | Estudiar què fa robust un replicador (X-094) | Unes característiques fixades abans, exploratori (§4) |
| **La §13** | Un interval de llavors per estrat (AUD-146) | Tres punts: el total de cada estrat, els pesos i els intervals, i cap predicció de l'origen sense un model | Tots tres (§13), i el mapa de llavors (§15) |
| **Les variants per cap** | Ara, a la mateixa PR, com a mesures del nivell 1 | Una línia nova, preregistrada, després de la prova d'autonomia | A la PR, en una secció pròpia, calculades després de la prova d'autonomia i fora del nivell 2 (§14) |
| **La guarda de l'executor** (AUD-174) | A la PR | — | A l'executor nou (§11) |

**Per a l'auditoria 28,** breu, abans de calcular: la §4, la §13, la §14 i la §15, el codi i les proves. I una proposta nova, on cal el
parer de tots dos: a la §13, tirades directes per a les sopes del pilot en lloc d'estrats per a cadascuna.

**Decidit a l'auditoria 28** (06-11-2026). L'auditor 2 no va veure les troballes de l'auditor 1, ni l'auditor 1 la de l'auditor 2: totes
s'accepten, i a l'auditoria 29 cadascú revisa les de l'altre.

| Què | Auditor 1 | Auditor 2 | Ara |
|---|---|---|---|
| **GO** | GO per calcular, amb dos canvis de text abans | GO per a l'autonomia i les variants per cap; NO-GO de la §13 i de la PR fins a l'AU2-140, i una verificació breu | Les correccions, a la v0.6; l'auditoria 29, breu, i res no es calcula fins al merge (§11) |
| **La composició de les sopes** (AU2-140) | — | Es valida sencera abans de cada tirada, amb proves negatives | Feta (§9): 2²³ bytes, les instruccions i la cohort; l'eina s'hi nega sense deixar cap JSONL |
| **«Sol» i l'ajuda del company** (AUD-175) | «Sol» vol dir «el programa primer»; una corba sense l'ajuda del company, amb la prova d'autonomia als hereditaris dels estrats i de les sopes | — | ρ_aut(p), amb el codi i l'anàlisi escrits ara, no abans de l'anàlisi (§13) |
| **S4 a la prova d'autonomia** (AUD-176) | 0 per construcció; la tirada, un control | S4, una variant experimental (com a l'auditoria 27) | Totes dues coses: S4 és una variant del nivell 1, i a la prova d'autonomia, un control (§4) |
| **Les proves** (AUD-177) | Un control positiu del context, i una prova d'`analyse()` | Les negatives de l'AU2-140 | Totes (§9) |
| **Els estrats de k = 0 a 2** (AUD-178) | Si interessa, 10⁷: la comprovació a Du, d'una ràtio de 2,10 a 1,31, per 1,6 h | No tocar les llavors ni els estrats per l'AU2-140 | 10⁷ (§13): amb l'AUD-175, també fa deu vegades més estreta la cota de ρ_aut als p petits. Les llavors canvien abans de calcular res |
| **Les sopes** | Tirades directes, d'acord; i les 22 juntes, aparellades | Tirades directes, d'acord, amb «companys sintetitzats a partir de l'histograma», tots els recomptes i cap ampliació després | Tot (§13) |
| **Fay i Feuer** | Coincideix amb una implementació pròpia, i amb Garwood amb un estrat | No és una garantia universal del 95 % | La cobertura, per simulació, amb l'escenari de l'auditor 1; p\*, descriptiva (§13) |
| **Els controls de l'entrada 15** (AU2-141) | La cota, «unilateral del 97,5 %» | «Per bloquejar les vies conegudes», no «perquè no n'hi pogués haver» | Corregit a `main` (`0b184e1`), amb una nota |

**Per a l'auditoria 29,** breu, abans de calcular: el diferencial de la PR des de `92d3e8a`. Cada auditor revisa també les troballes de
l'altre (l'AU2-140, per a l'auditor 1; de l'AUD-175 a l'AUD-178, per a l'auditor 2).

**Decidit a l'auditoria 29** (09-11-2026). Cap auditor no va veure les troballes noves de l'altre: totes s'accepten, i a l'auditoria 30
cadascú revisa les de l'altre. Totes dues correccions de l'auditoria 28 que eren de l'altre, bones (l'AU2-140, per a l'auditor 1; de
l'AUD-175 a l'AUD-178, per a l'auditor 2).

| Què | Auditor 1 | Auditor 2 | Ara |
|---|---|---|---|
| **GO** | NO-GO tal com és; GO per calcular-ho tot quan es corregeixi l'AUD-179, sense cap altra auditoria si va en un commit sol | NO-GO a la PR sencera; GO per a l'autonomia i les variants per cap, i la §13 i ρ_aut, després de l'AU2-142 i l'AU2-143 i d'una revalidació breu | Les correccions, a la v0.7, i l'auditoria 30, breu. Res no es calcula fins al merge, tampoc l'autonomia: l'AUD-179 canvia un dels seus mòduls (§11) |
| **Un registre de la §13 sense hereditaris** (AUD-179) | La seva prova d'autonomia, amb 8 fils, surt amb el codi 0 sense la línia final; l'executor ho dona per bo | — | `runJobs` acaba sense feines, i l'executor demana la línia final (§9 i §11) |
| **Les consoles i la repetició** (AUD-180) | Les dues llistes de la §13 les comparteixen | — | Una carpeta de consola per llista, i la repetició de cada llista a part (§11) |
| **La composició a l'anàlisi** (AU2-142) | — | L'anàlisi no torna a comprovar l'època ni tots els camps de la composició | `checkRecordComposition`, a l'anàlisi i a la prova d'autonomia dels hereditaris (§9 i §13) |
| **L'ordre dels registres** (AU2-143) | — | L'anàlisi de ρ_aut no la compara sencera amb la línia d'inici | Sencera, amb el contracte d'opcions de l'eina, a les tres anàlisis (§9) |
| **Què mesura ρ_aut** (AU2-144) | Una precisió: només prova els hereditaris de la §13, i m_aut n'és una cota superior | Un estimand conjunt: detectat a la §13 i autònom amb companys inerts | Totes dues coses, al pla i a la sortida de l'anàlisi (§13) |
| **Els zeros per construcció** (AUD-176) | Tancada | Tancable; una millora opcional: que aturi la validació | Feta (§4) |

**Per a l'auditoria 30,** breu, abans de calcular: el diferencial de la PR des de `6f8bc0b`. Cada auditor revisa també les troballes de
l'altre (de l'AU2-142 a l'AU2-144, per a l'auditor 1; l'AUD-179 i l'AUD-180, per a l'auditor 2).

**Decidit a l'auditoria 30** (10-11-2026). GO de tots dos per calcular la PR sencera, i les correccions de l'auditoria 29, bones per a
tots dos. Cap no va veure la troballa nova de l'altre.

| Què | Auditor 1 | Auditor 2 | Ara |
|---|---|---|---|
| **GO** | GO per calcular-la sencera, després del merge i des d'una còpia neta | GO per als quatre blocs, després del merge, amb l'arbre científic de `bc9dd94`, comprovat, i des d'una còpia neta | El merge, i abans del primer lot, els mòduls i les eines de l'arbre del merge, comparats amb els de `bc9dd94` (§11) |
| **L'ordre a l'anàlisi de la §14** (AUD-181) | La valida com abans de l'AU2-143. Abans del merge, `commandOptions` també a la §14 (amb les opcions d'`eines/densitat.mjs` exportades), que prefereix, o dir-ho a `CLAUDE.md` | — (no la va veure) | Dir-ho a `CLAUDE.md` i aquí (§9). Exportar les opcions canviaria `eines/densitat.mjs`, un mòdul de la §4 i de la §14, després del GO de tots dos, i l'auditor 2 demana l'arbre auditat |
| **El JSONL de l'ordre** (AU2-145) | — (no la va veure) | Només se'n mira el nom. Comprovar-ne la ruta relativa del pla, o dir que no queda certificada; una millora posterior | Dir-ho (§9). La ruta del pla, si cal, en un càlcul nou, a les anàlisis, i amb la seva revisió |
| **m_aut** | Una cota superior (auditoria 29) | Ho és quan n'hi ha, i de la propietat conjunta | Totes dues coses (§13) |
| **Les condicions del càlcul** | En l'ordre del pla | Els mòduls de l'arbre del merge, comprovats; la còpia neta; les llistes i les llavors, sense canviar; cada registre, sencer; la repetició, abans d'analitzar; cap conclusió causal | Totes (§11) |

## 13. La composició de bytes, i què podria ser nou (decidida a l'auditoria 25, i fixada a la v0.5)

**La pregunta del responsable:** si, en unes altres circumstàncies, l'eina trobaria més replicadors. En provar-la amb 300 programes,
ja n'hi havia algun que es replicava (§8). No sabem com canvia amb les circumstàncies.

**Quines circumstàncies:** sense tocar la química, es poden canviar la composició dels bytes, la mida del programa, el pressupost
de passos i el company. Proposem només la composició:
- **la proposen Knierim i altres (2026):** la densitat d'instruccions;
- **és la que canvia a la sopa abans de la vida,** i la que separa els braços de la sèrie de la maduració: barrejar els bytes
  conserva la composició i desfà l'estructura;
- **les altres tres** canvien la regla del joc, no els programes.

**Una propietat exacta, que fa el càlcul possible.** Sigui D_p la distribució en què cada byte és, amb probabilitat p, una de les
10 instruccions, i si no, un dels altres 246 valors. D½ és p = ½.
- **Condicionat a k,** el nombre de bytes d'instrucció del programa, tots els programes amb k instruccions són igual de probables,
  sigui quin sigui p: els k llocs, a l'atzar, i els bytes, uniformes dins de cada classe.
- **Du és D_p amb p = 10/256.**
- **Per tant,** ρ(p) = Σₖ C(64, k) · pᵏ · (1 − p)⁶⁴⁻ᵏ · rₖ.
  - **Què és rₖ:** la part de replicadors hereditaris entre els programes amb exactament k instruccions.
  - **Què permet:** si es mesuren els rₖ (un disseny estratificat per k), es té la densitat per a qualsevol p, Du inclosa.
    Directament, amb Du, potser 10⁷ programes no en donen cap (§3).
  - **Dues condicions** (auditor 1): el company de la prova no pot dependre de p, i rₖ inclou l'atzar de la prova, propi de cada
    programa. És una identitat de probabilitat total, amb k = 0 i k = 64 inclosos (auditor 2).
- **És més general** (auditor 1): amb la composició dins de les instruccions (π) i la dels altres 246 valors (σ) fixades,
  condicionat a k, la distribució d'un programa no depèn de p. Uns estrats fets amb la π i la σ d'una sopa en donen la densitat per
  a qualsevol p.
- **Per a una altra composició, estrats amb la seva composició, i no pesos** (AUD-143). A la v0.2, cada replicador trobat duia un pes
  dins del seu estrat. És sense biaix, però, amb una mica de biaix dins de les classes, la mida efectiva de l'estrat cau en molts
  ordres de magnitud (per 1,6·10¹⁰ si el 0 és el 5 % dels altres bytes, amb k = 8), i la variància empírica no ho mostra.
- **El 0, sempre a σ,** amb la seva freqüència: als bucles, és el valor que compta (auditor 1).
- **Una comprovació:** la ρ(½) de la tirada principal, amb D½, i la dels rₖ surten de mostres independents. Que coincideixin dins dels
  intervals és una comprovació descriptiva, no una equivalència formal (auditor 2).

**Les prediccions,** que són hipòtesis (auditor 2):
- **Amb p petit, ρ_aut creix com p^m,** on m és el k més petit amb algun replicador que es copia sense el codi del company, i no el més
  petit que es vegi. Si és tan rar que 10⁷ programes de l'estrat no en donen cap, la pendent i la densitat a Du només tindran una cota
  (auditor 1). Un bucle de còpia en demana com a mínim cinc instruccions.
- **ρ, amb companys de soroll, no:** el company hi pot ajudar, també quan el programa va primer, i amb el total i amb els sols, m pot ser
  0 o 1 (AUD-175). Al nivell 1, amb bytes uniformes, un hereditari no té cap instrucció, i 17 de 37 en tenen 2 o menys. ρ té un terra
  als p petits, el de l'ajuda del company, i la predicció pᵐ és la de ρ_aut.
- **Amb p a prop d'1, baixa:** les instruccions de més es destorben. Si és així, hi ha un p\* on ρ és màxima, que respon la pregunta
  del responsable.
- **La sopa del començament és a p ≈ 0,039,** molt per sota de p\*.

**El disseny** (auditoria 25):
- **Exploratori** (tots dos), amb el codi en una PR a part, revisada abans de calcular.
- **No fa servir cap resultat de la sèrie de la maduració,** ni abans ni després de la decisió: les sopes són les del pilot. Si mai
  s'hi compara, serà exploratori, i es dirà.
- **La corba ρ(p):**
  - **els estrats:** de k = 0 a 64, tots, amb 10⁶ programes cadascun (auditor 2), i 10⁷ als de k = 3 a 12, on pesen Du i les sopes
    envellides (Claude i l'auditor 1). A la v0.6, també als de k = 0 a 2 (AUD-178, aquí sota);
  - **el company:** de bytes uniformes, com al nivell 1 (tots dos);
  - **les llavors** (AUD-146): fora de l'interval dels generadors del nivell 1, [20.261.101, 20.261.101 + 2·10⁸), i un interval
    propi per a cada estrat, sense solapaments. Amb el generador v2, una llavor dins de l'interval en tornaria a fer servir les
    seqüències, i les mostres no serien independents (auditor 1). L'eina de la cobertura, també amb una altra llavor que la del pla;
  - **una ampliació,** si cal, només amb una regla escrita abans dels resultats (auditor 2).
- **Les sopes envellides (Ds):** del pilot de la maduració, i no de la sèrie (tots dos).
  - **La composició de cadascun dels 22 mons,** i no només la mitjana (auditor 1), amb la definició de la sopa i l'època fixades a la
    PR de la §13 (auditor 2).
  - **Per a cadascuna,** estrats fets amb la seva composició (AUD-143). A la v0.5, una proposta diferent: tirades directes (aquí sota).
- **El company amb la composició de la sopa:** un estudi a part, una anàlisi de sensibilitat en tirades directes, amb unes quantes
  composicions: Du, les sopes envellides i D½ (tots dos).

**El disseny, fixat a la v0.5** (per a l'auditoria 28), **amb els canvis de la v0.6** (l'auditoria 28). Tot exploratori, amb C0, la
prova del cens i 8 companys a la sopa de la prova, com al nivell 1. L'eina és `eines/estrats.mjs`, i l'anàlisi,
`eines/estrats-analisi.mjs`; la de ρ_aut, `eines/estrats-autonomia-analisi.mjs`.
1. **La corba ρ(p):**
   - **els programes de l'estrat k:** exactament k bytes d'instrucció, a k posicions a l'atzar (Fisher-Yates parcial), i cada byte,
     uniforme dins de la seva classe: les 10 instruccions, o els altres 246 valors. És D_p condicionada a k, per a qualsevol p. Els
     enters a l'atzar són exactes: es rebutgen els valors de l'atzar que en farien un biaix;
   - **quants** (el primer punt de l'auditor 2): 10⁶ a cada estrat, i 10⁷ als de k = 0 a 12 (a la v0.5, de 3 a 12). **Els 10⁷ són el
     total de l'estrat,** amb els primers 10⁶ inclosos: són els programes de 0 a 10⁷ − 1 del seu interval de llavors, i els de 0 a
     10⁶ − 1 són els del disseny de base;
   - **per què també de k = 0 a 2** (auditor 1, AUD-178): a p = 10/256, aquests estrats fan el 54 % del pes, i amb 10⁶ la comprovació
     contra el nivell 1 a Du només veuria diferències d'un factor 2 (la mediana de cota superior / inferior, 2,10; amb 10⁷, 1,31). I amb
     la corba ρ_aut, que hi tindrà pocs èxits, la cota superior la fa el pes més gran per programa, wₖ(p) / nₖ: a p = 10/256, amb 10⁶ a
     k = 2, la cota amb zero èxits seria de 9,6·10⁻⁷, més que la del nivell 1 sol (3,7·10⁻⁷). Amb 10⁷, deu vegades menys. Són 2,7·10⁷
     proves més, unes 1,6 h;
   - **els companys:** uniformes, com al nivell 1, i el del paper sol, el del cens;
   - **les llavors:** un interval per estrat, al mapa (§15);
   - **cap ampliació:** si mai calgués, seria un pla nou, amb unes altres llavors (la regla que demanava l'auditor 2).
2. **Els pesos i els intervals** (el segon punt de l'auditor 2):
   - **rₖ:** xₖ hereditaris de nₖ, amb l'interval de Clopper-Pearson del 95 %;
   - **ρ(p) = Σₖ wₖ(p) · xₖ / nₖ,** amb wₖ(p) = C(64, k) pᵏ (1 − p)⁶⁴⁻ᵏ: la probabilitat de k instruccions amb D_p. Els pesos són exactes,
     no s'estimen, i sumen 1;
   - **l'interval de ρ(p):** el de Fay i Feuer (1997), el de les taxes estandarditzades, fet per a una suma ponderada de recomptes de
     Poisson amb pesos coneguts. Amb un sol estrat, és l'interval exacte de Garwood (les proves ho comproven, i l'auditor 1 ho va
     comprovar amb una implementació pròpia i amb les taules). Amb els nostres pesos i les nostres N, `node eines/estrats-cobertura.mjs`
     en mesura la cobertura en cinc formes de rₖ (la cinquena, la de l'auditor 1: un terra de 4·10⁻⁶ a tots els k, i el bony de D½) i
     cinc p: del 95,1 al 99,2 %, amb 20.000 repeticions (la llavor del mapa, §15). **És una comprovació per simulació, no una garantia**
     del 95 % per a qualsevol rₖ ni per a una p triada després de mirar la corba (auditor 2);
   - **m:** el k més petit amb algun hereditari. El de veritat pot ser més petit (auditor 1), i amb l'ajuda del company pot ser 0 o 1
     (AUD-175);
   - **p\*:** la p d'una graella de 0,001 amb la ρ més alta, i les p on la cota superior de ρ arriba a la inferior de ρ(p\*). No és un
     interval de confiança de p\*: és descriptiu;
   - **dues comprovacions,** amb mostres independents: ρ(½) contra C0 amb D½ al nivell 1, i ρ(10/256) contra C0 amb bytes uniformes;
   - **també amb l'herència sola,** que vol dir «el programa primer»: el codi del company també s'hi executa, després del del programa, i
     hi pot ajudar (AUD-175; a la v0.5 hi dèiem que «no depèn del company»).
2b. **La corba sense l'ajuda del company, ρ_aut(p)** (auditor 1, AUD-175; nova a la v0.6):
   - **com:** cada hereditari de les 110 tirades de la §13, tornat a provar amb la prova d'autonomia de la §4, amb les mateixes 100
     condicions de companys inerts (`eines/autonomia.mjs --registre`, la llista `estrats/llista-autonomia.txt`, després de la de la §13).
     Els bytes de cada hereditari es tornen a fer amb el sorteig del seu registre;
   - **la xifra:** aₖ, els hereditaris de l'estrat k que es copien en almenys una de les 100 condicions (es poden copiar sense el codi del
     company, la xifra principal de la §4); i, a part, en més de 50;
   - **ρ_aut(p) = Σₖ wₖ(p) · aₖ / nₖ,** amb nₖ els programes de l'estrat, l'interval de Fay i Feuer, la mateixa graella i p\*; i m_aut, el k
     més petit amb algun aₖ > 0;
   - **què mesura** (AU2-144, i la precisió de l'auditor 1, auditoria 29): la densitat dels programes que la §13 detecta com a
     hereditaris, amb companys de soroll, i que també es copien amb companys inerts. És un estimand conjunt, la probabilitat de totes dues
     coses alhora, i no la de tots els programes que es podrien copiar sense el company: un que ho faria però que no és hereditari amb
     companys de soroll no es prova mai. Per això, i pel mostreig, m_aut és una cota superior del k més petit dels que es copien sols,
     quan n'hi ha: si cap estrat no en té cap, no hi ha cap cota (l'auditor 2, auditoria 30). La cota val per a tots dos, el k més petit
     dels hereditaris que es copien sols i el de tots els que es copien sols, perquè els primers són una part dels segons. Al nivell 1
     (§4) passa el mateix, i les dues comprovacions comparen el mateix. Qualsevol conclusió ho ha de dir així;
   - **dues comprovacions,** amb mostres independents: ρ_aut(½) contra la part dels 10⁷ programes de C0 amb D½ del nivell 1 que passen la
     mateixa xifra a la §4, i ρ_aut(10/256) contra la de C0 amb bytes uniformes;
   - **per grups de k** (0–4, 5–12, 13–24, 25–40 i 41–64): els hereditaris, i quants passen cada xifra;
   - **les sopes:** per a cada sopa, i les 22 juntes, els autònoms amb cada tipus de company, i ρ_aut a la seva part d'instruccions;
   - **D½ amb companys de D½:** els seus autònoms. Els que també eren hereditaris al nivell 1 són els mateixos bytes, amb les mateixes
     condicions: les seves cadenes han de ser les de la §4, i si no, l'anàlisi s'hi nega;
   - **l'anàlisi** (`eines/estrats-autonomia-analisi.mjs`) valida els registres de la §13, els de l'autonomia dels seus hereditaris (un per
     registre, amb la seva SHA-256 i la seva empremta, l'ordre sencera, i els hereditaris tots i en ordre; AU2-143) i els de la §4. Un
     registre de la §13 sense cap hereditari en dona un d'autonomia sense cap replicador, sencer (AUD-179);
   - **el cost:** uns quants milers d'hereditaris, a uns 86 ms cadascun en un fil: uns minuts.
3. **Les sopes del pilot:**
   - **la sopa i l'època** (auditor 2): la captura de cada món de la cohort del pilot a l'època 8.000, sencera (les 131.072 cel·les,
     2²³ bytes). La cohort són els 22 mons sense establiment fins aleshores i sense cap cel·la hereditària, al manifest del pilot. Cap
     captura de la sèrie;
   - **la composició:** quantes vegades hi és cada valor de byte. `eines/composicio.mjs` la treu de la captura, només si la SHA-256 és
     la del manifest. Les 22 són a git (`fase2/resultats/b1/composicio/`), i n'hi ha de l'11,15 a l'11,57 % de bytes d'instrucció;
   - **una proposta nova: tirades directes, i no estrats per a cada sopa.** Cada programa, 64 bytes a l'atzar amb la composició de la
     sopa: 10⁶ per sopa. El sorteig és exacte, perquè el total és 2²³. Per què:
     - **l'AUD-143 no volia pesos** sobre els estrats de D, i una tirada directa no en té cap;
     - **la pregunta, per a cada sopa,** és la densitat a la seva composició, i una tirada directa la mesura sense cap model. Els estrats
       de cada sopa donarien, a més, la corba amb les instruccions i els altres valors de la sopa, que ara no cal: les 22 sopes tenen
       gairebé la mateixa part d'instruccions, i la seva diferència amb la corba de D ja diu què hi fa la composició dins de cada classe;
     - **el cost:** uns 20 estrats per sopa (els que pesen a p ≈ 0,114), 22 vegades, serien 4,4·10⁸ proves, unes 27 h més de càlcul;
     - **si l'auditoria 28 prefereix els estrats,** cal una opció nova a l'eina, amb la seva revisió. **Tots dos van preferir les
       tirades directes** (auditoria 28), i els estrats globals per a la corba;
   - **la composició, comprovada abans de cada tirada** (auditor 2, AU2-140): `eines/estrats.mjs` s'hi nega, abans de començar i sense
     crear el JSONL, si la composició no té exactament 2²³ bytes, si els 256 recomptes no hi sumen, si les instruccions no són les que en
     surten, o si no és la d'un món de la cohort del pilot (el món, inclòs al manifest; l'època 8.000; la captura i la seva SHA-256).
     L'anàlisi i la prova d'autonomia dels hereditaris ho tornen a comprovar tot, i la línia d'inici de cada registre ha de dir el món,
     l'època, la captura i la SHA-256 del fitxer (AU2-142, auditoria 29);
   - **els companys** (la sensibilitat de la v0.4, tots dos): els mateixos programes, amb companys uniformes i amb **companys sintetitzats
     a partir de l'histograma de la sopa**, aparellats programa a programa. Els sintetitzats són els 8 de la sopa de la prova, els del
     paper en context; el del paper sol és sempre el del cens, uniforme, com als escanejos del pilot. No són cel·les de la captura: el
     sorteig, byte a byte, només en conserva la freqüència de cada valor, i no l'estructura de les cel·les (auditor 2);
   - **què se'n diu:** la densitat amb cada tipus de company (Clopper-Pearson), la taula de 2 × 2 i el quocient (l'interval del nivell
     1); la ρ de la corba de D a la mateixa part d'instruccions; i, al costat, la part de cel·les hereditàries de l'escaneig del braç
     `shuffle-all` del pilot (la primera comprovació de l'auditor 1, AUD-121 i AUD-122). L'escaneig és d'un món barrejat, amb els veïns
     del radi 2 com a companys en context: s'hi assembla la tirada amb companys de la composició;
   - **les 22 juntes** (auditor 1, auditoria 28): cada sopa en donarà pocs (de l'ordre de 10 amb 10⁶ programes, segons una estimació de
     l'auditor 1), i la informació és a les 22 juntes: la taula de 2 × 2 i el quocient de la suma, amb l'interval del nivell 1;
   - **tots els recomptes i els seus intervals exactes,** també els zeros, i N no s'amplia després de veure'ls (auditor 2). La comparació
     amb `shuffle-all` és descriptiva, sense cap inferència causal.
4. **D½ amb companys de D½** (la sensibilitat de la v0.4): els primers 10⁶ programes del nivell 1 (la mateixa llavor), amb companys de
   D½ en lloc d'uniformes, aparellats amb C0 del nivell 1. Du amb companys de Du ja és el nivell 1.
5. **Cap predicció de l'origen a la sopa** (el tercer punt de l'auditor 2): la densitat diu quants replicadors hi ha a l'espai de
   programes d'una composició. Predir quan n'apareix un a la sopa, o a quina època, demana un model addicional dels encontres, de les
   interaccions i de la dependència en el temps, que aquí no hi és. La comparació amb l'escaneig de `shuffle-all` és descriptiva.
- **El risc per època** no és ρ sola: demana un model de quants programes nous prova la sopa a cada època (tots dos). Una afirmació
  causal sobre la probabilitat d'origen a la sopa demanarà un disseny propi, amb els veïns i la dependència en el temps (auditor 2).
  - **Si es fa:** exploratori, ajustat amb unes dades i validat amb unes altres.
  - **Una primera comprovació, sense la sèrie** (auditor 1): la ρ a la composició de cada sopa del pilot, amb companys de la mateixa
    composició, contra la part de cel·les que es repliquen just després de barrejar-la (AUD-121 i AUD-122).

**Què podria ser nou:**
1. **Si la composició explica quan apareix la vida.**
   - **La idea:** amb ρ a la composició de cada època, la cerca a l'atzar prediu el risc d'aparició d'una sopa, o d'un món. Si
     coincideix amb l'observat, la composició ho explica. Si la sopa va més de pressa, hi ha alguna altra cosa: l'estructura que
     acumula.
   - **És la pregunta de la sèrie de la maduració, per un camí independent:** la sèrie ho prova amb una intervenció, i B1 ho
     calcularia sense simular cap sopa.
   - **Què hi ha de nou:** Knierim i altres comparen la sopa amb la mutació a partir d'un histograma madur (§1 de l'estat de la
     qüestió). No hem trobat enlloc el risc d'aparició predit època a època, ni comparat amb una intervenció (§11).
   - **La part neta** (auditor 1): la corba ρ(p), amb m i p\*, que respon la pregunta del responsable i no depèn de cap model de la sopa.
   - **Què la refutaria:** que la sopa trobi replicadors molt més de pressa que la cerca a l'atzar a la seva composició, o que el risc
     observat no segueixi els canvis de composició (auditor 1); una mala predicció fora de mostra (auditor 2).
2. **Els ingredients necessaris:** les ablacions de la §2, la pregunta d'origen de B1. La refutaria, per a cada ingredient, una variant
   sense l'ingredient amb una densitat comparable a la de C0 (auditor 1).
3. **L'alineació dels caps (H64):** si multiplica la densitat, i si canvia m o només el factor de davant. Si confirma Knierim i altres,
   és una rèplica més que un descobriment (auditor 1).
4. **Els replicadors mínims:** el catàleg dels més curts de cada química, que no són per força els més curts que hi pot haver
   (auditor 2).
5. **Quina part dels replicadors depèn del company** (auditor 1): la mesura dels autònoms (§4), i S4.

**L'ordre** (auditoria 25): tots tres posen la 1 i la 2 al capdamunt. L'auditor 1 hi posa primer la 2, i l'auditor 2, la 1. A la
pràctica, la 2 va primer: és el nivell 1, a punt per calcular. La 1, després, exploratòria. La novetat de cadascuna s'ha de
comprovar amb una cerca de la bibliografia abans d'afirmar-la (auditor 2).

**El cost,** amb la velocitat real del nivell 1 (unes 4.600 proves per segon amb el PC, §8). A la v0.4 dèiem unes 4,3 h per a la
corba, amb la velocitat d'un fil multiplicada per 8:
- **la corba:** 6,5·10⁷ proves als 65 estrats, i 1,17·10⁸ més als de k = 0 a 12 (a la v0.5, 9·10⁷, de 3 a 12): 1,82·10⁸, unes 11 h;
- **les sopes del pilot:** 22 sopes, 10⁶ programes, amb dos tipus de company: 4,4·10⁷ proves, unes 2,7 h;
- **D½ amb companys de D½:** 10⁶ proves, uns 4 minuts;
- **l'autonomia dels hereditaris de la §13:** uns minuts.
- **En total,** unes 13,7 h (a la v0.5, unes 12 h).

## 14. Les variants per cap d'S1 (v0.5, exploratòries)

**Per què:** S1 (escriure a la meitat del punter no fa res) té 3,95 vegades els hereditaris de C0 (l'entrada 15). S1 bloqueja dues
menes d'escriptura: les de `h0` (`+`, `-` i `,`) i les de `h1` (`.`). Les variants per cap diuen quina de les dues hi pesa (auditor 1).

| Id | Definició exacta | Què diu |
|---|---|---|
| **S1h0** | Escriure amb `h0` (`+`, `-` i `,`) a la meitat del punter no fa res; amb `h1` (`.`), sí | Si l'efecte d'S1 és de les escriptures de `h0` |
| **S1h1** | Escriure amb `h1` (`.`) a la meitat del punter no fa res; amb `h0` (`+`, `-` i `,`), sí | Si és de les de `h1` |

- **Les regles,** les de la §2: una escriptura bloquejada no canvia la cinta, consumeix el pas i compta com una operació. S1 és S1h0 i
  S1h1 alhora.
- **Una hipòtesi, no una predicció:** els dos caps comencen a 0, a la meitat del programa quan va primer, i `+` i `-` hi canvien el seu
  propi codi; una còpia que va a l'altra meitat no la bloqueja cap de les dues. Esperem que la major part de l'efecte sigui de `h0`, però
  no ho sabem.
- **La mesura:** la del nivell 1 (§4), amb els mateixos 10⁷ programes de D½ (la llavor 20261101) i la mateixa eina,
  `eines/densitat.mjs`. No són del nivell 1: el seu pla (`PLAN`, a `eines/densitat-analisi.mjs`) té les 13 químiques de la §2.
- **C0 i S1, de nou:** el codi nou ha de fer el mateix que el del nivell 1, i es comprova de punta a punta. Les seves ordres són les del
  nivell 1, amb una altra carpeta, i els registres han de tenir la mateixa línia final (els totals i l'empremta) que els del nivell 1, de
  l'extracte. Si no, l'anàlisi no analitza res.
- **L'anàlisi** (`eines/caps-analisi.mjs`), descriptiva com la del nivell 1: la densitat de cada química, amb el seu interval; i,
  programa a programa, S1h0 i S1h1 contra S1 i contra C0, amb la taula de 2 × 2 i el quocient.
- **Quan:** després de la prova d'autonomia, i abans de dissenyar el nivell 2 (l'ordre que demanava l'auditor 2). Fora del nivell 2: la
  seva llista no canvia.
- **El cost:** 4·10⁷ proves, unes 2,4 h amb el PC.

## 15. Les llavors (v0.5, AUD-146)

**El problema:** amb el generador v2 (`fase1/soup.js`), la llavor *s* fa l'estat de xoshiro128\*\* amb quatre sortides seguides de
splitmix32, que suma la constant G = 0x9e3779b9 a cada pas: les de *s* són les de *s* + G, *s* + 2G, *s* + 3G i *s* + 4G. Dues llavors
que difereixen en G comparteixen tres dels quatre mots de l'estat, desplaçats; en 2G, dos; en 3G, un. Les seqüències no són iguals,
però tampoc no són d'estats independents.
- **La regla:** dos generadors de càlculs diferents no tenen llavors iguals, ni que difereixin en ±G, ±2G o ±3G (mòdul 2³²). Dins d'un
  interval no passa mai: el més ample, el del nivell 1, fa 2·10⁸ (tots els estrats junts, 3,64·10⁸), i el desplaçament més petit, 3G
  mòdul 2³², és de 626.627.285.
- **`eines/b1-llavors.mjs`** en té el mapa, i `checkSeedMap` el comprova; `test/b1-autonomia.mjs` també comprova que el v2 fa l'estat
  com diem.

| Què | Llavors | Generadors |
|---|---|---|
| El nivell 1 | de 20.261.101 a 220.261.100 | 2 per programa, 10⁸ programes com a molt |
| La prova d'autonomia (§4), i la dels hereditaris de la §13 (ρ_aut), amb les mateixes condicions | de 250.000.000 a 250.000.199 | 2 per condició, 100 condicions |
| Els estrats de la corba (§13) | de 260.000.000 a 623.999.999, un darrere l'altre: 2·10⁷ per als de k = 0 a 12, i 2·10⁶ per als de 13 a 64 (a la v0.5, de 260.000.000 a 569.999.999, amb 2·10⁷ només de 3 a 12; AUD-178) | 2 per programa |
| Les sopes del pilot (§13) | de 2.300.000.000 a 2.343.999.999: 2·10⁶ per sopa, en l'ordre del manifest | 2 per programa |
| La cobertura del quocient (§6) | 2.500.000.000 (abans, la del pla, 20261101; AUD-146) | 1 |
| La cobertura de la corba (§13) | 2.500.000.002 | 1 |

- **Les que tornen a fer servir les del nivell 1, a propòsit:** les variants per cap, i C0 i S1 de nou (§14), i D½ amb companys de D½
  (§13). Són els mateixos programes que al nivell 1, per comparar-los programa a programa: no són mostres noves.
- **Els companys de les sopes** (els dos tipus) fan servir les mateixes llavors: els mateixos programes, aparellats.
