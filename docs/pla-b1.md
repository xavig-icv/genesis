# B1, les ablacions de la química · el nivell 1, la densitat de replicadors

**Versió: v0.3 (01-11-2026), després de l'auditoria 25, per a l'auditoria 26.** No s'ha calculat res, llevat del temps que triga
la prova, sense cap recompte (§8). El codi és a la mateixa branca, amb les proves (§9).
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
| **X0** | Cap còpia ni cap escriptura d'una meitat a l'altra: una escriptura a l'altra meitat que la del punter no fa res, ni una còpia que hi llegeix (S4 i X1 alhora) | **Control:** cap byte no passa d'una meitat a l'altra | 0, a la pràctica. Només el flux de control (un bucle que mira l'altra meitat) en passa informació, i refer així una finestra de 16 bytes és, a la pràctica, impossible. És el control que S4 no era (auditor 1, AUD-140) |
| **K1** | `.` no fa res | Hi ha replicació només amb `,`? | Sí: `,` també copia d'una meitat a l'altra, si `h0` va enrere (`<`) |
| **K2** | `,` no fa res | Hi ha replicació només amb `.`? | Sí, amb `{`. No és el mirall de K1: `[`, `]`, `+` i `-` són de `h0` |
| **R0** | `+` i `-` no fan res | Cal l'aritmètica? | Sí que n'hi ha: copiar no demana canviar bytes |
| **S1** | Escriure a la meitat del punter no fa res | Sense automodificació: el codi que s'executa no es pot reescriure | Sí que n'hi ha: un replicador escriu al company, no a si mateix |
| **S2** | Escriure a les posicions 0–63 no fa res | El primer programa no es toca | Sol, sí: el primer escriu al segon. En context, cap, per construcció: el segon no pot escriure al primer (auditor 1) |
| **S3** | Escriure a les posicions 64–127 no fa res | El segon programa no es toca | Sol, cap, per construcció: el primer no pot escriure al segon. En context, sí: el segon escriu al primer |
| **S4** | Escriure a l'altra meitat que la del punter no fa res | Cada programa només escriu a la seva meitat. Fa parella amb S1: amb S1, el programa només escriu al company; amb S4, el company només escriu a si mateix | Sí, per una via sabuda: el codi del company, que s'executa a la seva meitat, s'hi pot copiar el programa, amb un bucle que el programa obre i es tanca al company (AUD-140). A la v0.2 era un control |
| **X1** | Una còpia que llegeix de l'altra meitat que la del punter no fa res: no s'executa, però compta | Sense lectura del company (auditor 2). Només limita les còpies: `+`, `-`, `[` i `]` fan servir `h0` sigui on sigui (auditor 1) | Sí: un replicador llegeix el seu codi, de la seva meitat, i escriu a l'altra |
| **H64** | `h1` comença a 64, i no a 0 | Els caps alineats amb el company (Knierim i altres, CUST64) | Més que C0. Amb C0, la còpia senzilla és la del mirall (`{` porta `h1` a 127), i el fill és el programa al revés, que també s'ha de saber copiar. Amb H64, la còpia directa (`[.>}]`) deixa un fill idèntic, que es copia igual |

**Fora del nivell 1:** sense mutació (M0) i l'ordre simètric de la parella (O). Són regles de la sopa, i no tenen sentit amb un
programa sol (§10).

**Si S1 té un efecte fort,** el pas següent són les variants per cap: només les escriptures de `h0` (`+ - ,`), o només les de `h1`
(`.`) (auditor 1).

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
  - **Sol:** el programa va primer, amb un company de soroll. És el que fa el cens.
  - **En context:** va segon, amb un dels 8 de soroll primer. Al cens, el company és un veí del món. Aquí no hi ha món, i un
    company de soroll és el més neutre.
- **La mesura principal:** si el programa és un replicador hereditari, sol o en context (`heritable`).
- **Les secundàries:** `heritableSolo` i `heritableContext`, per separat; i si es replica, sense herència. Es donen sempre per
  separat, i amb el total (auditor 2): en context, el company hi pot contribuir (AUD-42).
- **Els replicadors que es troben** es desen sencers, per descriure'ls després: quantes instruccions tenen, el més curt, si es copien
  al revés, i si sols o en context.
- **Una mesura exploratòria, després del nivell 1: si els replicadors trobats són autònoms** (auditor 1).
  - **Com:** cada replicador hereditari trobat es torna a provar amb 8 companys inerts (64 bytes a l'atzar d'entre els 246 valors
    que no són instruccions, el 0 inclòs), amb 100 llavors de prova.
  - **Què separa:** els que es repliquen sols dels que necessiten el codi del company. És el mecanisme de l'AUD-140, que també hi
    és amb C0, i el de l'AUD-42.
  - **El cost:** només es tornen a provar els trobats. El codi, amb el de la §13, i amb la mateixa revisió breu.

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
  nivell 1 fan servir els generadors de 20.261.101 a 20.261.101 + 2·10⁸ + 1; la §13 en tindrà una de pròpia. L'anàlisi comprova
  que tots els registres siguin d'aquesta llavor.

## 6. L'anàlisi, escrita abans de calcular

**Per a cada variant:** *k* de *N* replicadors hereditaris, amb l'interval de Clopper-Pearson del 95 %. Amb 0, la cota superior.

**Contra C0, programa a programa:**
- **la taula de 2 × 2:** els programes hereditaris a totes dues variants, només a C0, només a la variant, o a cap;
- **el quocient de les densitats,** amb el seu interval: el de dos recomptes de Poisson independents (la binomial condicionada), que
  amb els mateixos programes és conservador.
  - **Comprovat** (l'auditor 2 ho demanava justificat): `node eines/densitat-cobertura.mjs` en mesura la cobertura amb recomptes
    sintètics, i la mateixa funció de l'anàlisi. Amb 30 o 100 hereditaris esperats a C0, quocients de 0,1 a 2, i un solapament
    entre els hereditaris de les dues químiques de cap a total, la cobertura del 95 % nominal va del 95,7 % al 100 %.
  - **Amb solapament,** l'interval és més ample del que caldria. Per descriure, n'hi ha prou (auditor 1), i la taula de 2 × 2 dona
    els programes que canvien.
- **els programes que canvien:** els que són replicadors a una variant i no a l'altra. Si una ablació en crea de nous, ho diu.

**Només amb el pla sencer** (AUD-142, AU2-103): les 13 químiques amb D½, C0 i K0 amb Du, la llavor del pla, i 10⁷ programes (o
10⁸, amb D½, després de l'ampliació). Si en falta o en sobra res, l'anàlisi llista els problemes i no analitza res. Tampoc no hi
passa cap registre fet amb uns altres mòduls que els de la seva còpia (AUD-139, AU2-102).

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
- **Per construcció:** S3, sol, i S2, en context: 0.
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
      prevista. Cap mode parcial;
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
    - **Que les proves atrapen els errors:** amb un error posat a propòsit a la regla de S1, en fallen tres. L'auditor 1 n'hi va
      posar quatre, i les proves els van atrapar tots.
  - **`test/densitat.mjs`:** les opcions, que el resultat no depèn dels fils ni dels trossos, el JSONL, les distribucions, l'AUD-65 a
    l'eina, i que el codi i la SHA-256 dels mòduls vegin un canvi a `fase1/` i a `fase2/`, amb git i sense (AUD-139).
  - **`test/densitat-analisi.mjs`:** l'interval, un resultat conegut, els controls, l'ampliació, la llista del nivell 2, la línia
    d'ordres amb el pla de veritat, i cada manera com la validació s'hi ha de negar, també el pla incomplet i uns altres mòduls.

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
   26, breu.
2. **Després de la sèrie,** quan el PC i la màquina virtual siguin lliures, des d'un commit net amb aquest pla: el nivell 1, unes 4,2 h
   (13 químiques amb D½, i 2 amb Du).
3. **La §13:** el codi en una PR a part, amb una revisió breu abans de calcular; el càlcul, unes 5 h.
4. **Després:** el disseny del nivell 2.

## 12. Les decisions (auditoria 25)

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

## 13. La composició de bytes, i què podria ser nou (decidida a l'auditoria 25)

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
- **Amb p petit, ρ creix com pᵐ,** on m és el k més petit amb rₖ > 0, i no el més petit que es vegi. Si rₘ és tan petit que 10⁷
  programes de l'estrat no en donen cap, la pendent i la densitat a Du només tindran una cota (auditor 1).
- **Amb p a prop d'1, baixa:** les instruccions de més es destorben. Si és així, hi ha un p\* on ρ és màxima, que respon la pregunta
  del responsable.
- **La sopa del començament és a p ≈ 0,039,** molt per sota de p\*.

**El disseny** (auditoria 25):
- **Exploratori** (tots dos), amb el codi en una PR a part, revisada abans de calcular.
- **No fa servir cap resultat de la sèrie de la maduració,** ni abans ni després de la decisió: les sopes són les del pilot. Si mai
  s'hi compara, serà exploratori, i es dirà.
- **La corba ρ(p):**
  - **els estrats:** de k = 0 a 64, tots, amb 10⁶ programes cadascun (auditor 2), i 10⁷ als de k = 3 a 12, on pesen Du i les sopes
    envellides (Claude i l'auditor 1);
  - **el company:** de bytes uniformes, com al nivell 1 (tots dos);
  - **la llavor:** una de pròpia, diferent de la del nivell 1;
  - **una ampliació,** si cal, només amb una regla escrita abans dels resultats (auditor 2).
- **Les sopes envellides (Ds):** del pilot de la maduració, i no de la sèrie (tots dos).
  - **La composició de cadascun dels 22 mons,** i no només la mitjana (auditor 1), amb la definició de la sopa i l'època fixades a la
    PR de la §13 (auditor 2).
  - **Per a cadascuna,** estrats fets amb la seva composició (AUD-143).
- **El company amb la composició de la sopa:** un estudi a part, una anàlisi de sensibilitat en tirades directes, amb unes quantes
  composicions: Du, les sopes envellides i D½ (tots dos).
- **El risc per època** no és ρ sola: demana un model de quants programes nous prova la sopa a cada època (tots dos).
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

**El cost**, amb el temps de la §8:
- **la corba:** 6,5·10⁷ proves als 65 estrats, i 9·10⁷ més als de k = 3 a 12: unes 34 h de fil, unes 4,3 h amb els 8 fils del PC;
- **les sopes del pilot:** depèn de quants estrats pesin a cada composició. Es dirà a la PR de la §13, abans de calcular.
