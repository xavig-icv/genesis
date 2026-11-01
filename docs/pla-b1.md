# B1, les ablacions de la química · el nivell 1, la densitat de replicadors

**Versió: v0.2, esborrany (01-11-2026), per a l'auditoria 25.** No s'ha calculat res, llevat del temps que triga la prova, sense
cap recompte (§8). El codi és a la mateixa branca, amb les proves (§9).
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
- **Controls:** variants que han de donar 0. Si no, la prova té falsos positius.

**Recordatori** (`fase1/bff.js`, la variant `bff_noheads`):
- `.` fa `t[h1] = t[h0]`, i `,` fa `t[h0] = t[h1]`;
- `+` i `-` canvien `t[h0]`, i `[` i `]` miren `t[h0]`;
- els dos caps comencen a 0, i el punter d'instruccions recorre tota la cinta, de 0 a 127.

**Les dues meitats:**
- **La "meitat del punter"** d'una escriptura o d'una lectura és la meitat on és el punter d'instruccions quan s'executa la
  instrucció: de 0 a 63, o de 64 a 127.
- **La posició escrita** és `h1` per a `.`, i `h0` per a `,`, `+` i `-`. **La posició llegida** és `h0` per a `.`, i `h1` per a `,`.
- **Una escriptura bloquejada** no canvia la cinta, consumeix el pas i compta com una operació. A les variants K, R i L, en canvi,
  l'instrucció no s'executa: no compta.

| Id | Definició exacta | Què diu | Què esperem, i per què |
|---|---|---|---|
| **C0** | BFF, tal com és | La referència | Replicadors, amb la distribució D½ |
| **K0** | `.` i `,` no fan res | **Control:** sense còpia | 0. Només `+` i `-` escriuen, i refer així 16 bytes d'un altre programa és molt improbable |
| **L0** | `[` i `]` no fan res | **Control:** sense bucles | 0. Cada instrucció s'executa com a molt un cop, i 64 bytes a l'atzar gairebé mai no tenen prou instruccions de còpia per copiar-ne 16 un a un |
| **S4** | Escriure a l'altra meitat que la del punter no fa res | **Control:** cap escriptura d'una meitat a l'altra | 0, per construcció: cap programa no pot posar res seu a l'altre |
| **K1** | `.` no fa res | Hi ha replicació només amb `,`? | Sí: `,` també copia d'una meitat a l'altra, si `h0` va enrere (`<`) |
| **K2** | `,` no fa res | Hi ha replicació només amb `.`? | Sí, amb `{`. No és el mirall de K1: `[`, `]`, `+` i `-` són de `h0` |
| **R0** | `+` i `-` no fan res | Cal l'aritmètica? | Sí que n'hi ha: copiar no demana canviar bytes |
| **S1** | Escriure a la meitat del punter no fa res | Sense automodificació: el codi que s'executa no es pot reescriure | Sí que n'hi ha: un replicador escriu al company, no a si mateix |
| **S2** | Escriure a les posicions 0–63 no fa res | El primer programa no es toca | Sí, sol: el primer escriu al segon |
| **S3** | Escriure a les posicions 64–127 no fa res | El segon programa no es toca | Sol, cap, per construcció: el primer no pot escriure al segon. En context, sí: el segon escriu al primer |
| **X1** | Llegir de l'altra meitat que la del punter no fa res (la còpia no s'executa) | Sense lectura del company (auditor 2) | Sí: un replicador llegeix el seu codi, de la seva meitat, i escriu a l'altra |
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
- **Ds, l'histograma d'una sopa envellida (proposta, per decidir):** els bytes amb la freqüència d'una sopa de l'època 8.000 sense
  vida. Lligaria B1 amb la maduració: si la composició envellida fa més probables els replicadors. Però és una altra pregunta, i
  la sopa envellida depèn de la química. A la v0.2, aquesta pregunta passa a ser la proposta de la §13, que no demana cap
  tirada a part amb Ds.

## 4. La mesura

**La prova és la del cens:** `replicationTest` de `fase2/replication.js`, amb `heredity` i `complete`, i amb l'intèrpret de la
variant (AUD-65). Cap prova nova (AUD-02).
- **On:** en una sopa barrejada de 9 programes: el que es prova, a la cel·la 0, i 8 de soroll, de bytes uniformes.
  - **Sol:** el programa va primer, amb un company de soroll. És el que fa el cens.
  - **En context:** va segon, amb un dels 8 de soroll primer. Al cens, el company és un veí del món. Aquí no hi ha món, i un
    company de soroll és el més neutre.
- **La mesura principal:** si el programa és un replicador hereditari, sol o en context (`heritable`).
- **Les secundàries:** `heritableSolo` i `heritableContext`, per separat; i si es replica, sense herència.
- **Els replicadors que es troben** es desen sencers, per descriure'ls després: quantes instruccions tenen, el més curt, si es copien
  al revés, i si sols o en context.

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
- **La llavor:** es fixa al pla, abans de calcular res (§12).

## 6. L'anàlisi, escrita abans de calcular

**Per a cada variant:** *k* de *N* replicadors hereditaris, amb l'interval de Clopper-Pearson del 95 %. Amb 0, la cota superior.

**Contra C0, programa a programa:**
- **la taula de 2 × 2:** els programes hereditaris a totes dues variants, només a C0, només a la variant, o a cap;
- **el quocient de les densitats,** amb el seu interval: el de dos recomptes de Poisson independents (la binomial condicionada), que
  amb els mateixos programes és conservador;
- **els programes que canvien:** els que són replicadors a una variant i no a l'altra. Si una ablació en crea de nous, ho diu.

**Els controls primer.** Si K0, L0 o S4 donen cap replicador hereditari, no s'interpreta res més fins que no s'hagin mirat un a un:
són falsos positius de la prova, o una via que no hem previst.

**Les variants que passen al nivell 2:** les que tenen almenys un replicador hereditari amb D½, i C0. Les que no en tenen cap en
10⁷ (o 10⁸) programes es donen amb la cota, sense sopa.

**Tot és descriptiu.** No hi ha cap decisió preregistrada: el nivell 1 estima densitats, amb un càlcul determinista (el mateix commit
i la mateixa llavor donen el mateix). La decisió és quines variants van a la sopa, amb la regla d'aquí dalt.

## 7. Les prediccions

Són les de la taula de la §2, escrites abans de calcular:
- **Els controls** (K0, L0 i S4): 0.
- **S3 sol:** 0, per construcció.
- **Totes les altres:** replicadors. Les que més ens poden sorprendre:
  - **K1 i K2:** si una de les dues instruccions de còpia és molt més important que l'altra;
  - **S1:** si l'automodificació hi és necessària;
  - **H64:** si alinear els caps fa els replicadors molt més abundants.

## 8. El que ja s'ha mesurat

**Només el temps,** sense cap recompte (30-10-2026, al PC, Node 16, amb C0): la prova sencera, en una sopa de 9 programes, triga
uns 0,8 ms per programa i fil, amb Du i amb D½.
- **10⁷ programes,** unes 2,3 h en un fil.
- **Tot el nivell 1:** 12 variants amb D½, més C0 i K0 amb Du. Són 1,4·10⁸ proves, unes 32 h de fil: unes 4 h amb els 8 fils del
  PC. La màquina virtual comparteix els mateixos fils, i no hi afegeix gaire.
- **Gairebé tot el temps** és de les finestres de 16 bytes, que es comparen com a text. Una versió més ràpida de
  `fase2/replication.js` hauria de donar els mateixos resultats, comprovats amb les empremtes. Ara no la proposem.
- **El que hem vist sense voler** (31-10-2026), en provar l'eina (§9) amb una llavor de prova (777) i 300 programes, amb C0 i D½: el
  JSONL tenia almenys un programa que es replica. No n'hem mirat quants, ni si són hereditaris. La llavor de prova no és la del pla,
  i les proves de l'eina no miren mai cap recompte.

## 9. La implementació, en una PR

És a la branca `b1-ablacions`, amb el pla. No canvia res del que ja hi havia: les empremtes de `test/determinisme.mjs`, l'oracle de
cubff i les proves de l'intèrpret i del món passen igual.
- **`fase1/bff.js`:** les químiques de la §2 (`CHEMISTRIES`), i `evaluator(nom)`, que en dona l'intèrpret.
  - **Amb C0,** és la funció `evaluate` d'ara, la mateixa: la sopa, el món i el cens no canvien.
  - **Amb les altres,** una còpia d'`evaluate` amb les regles de la química, i les mateixes dues optimitzacions.
- **`fase2/replication.js`:** l'opció `evaluate`, amb l'intèrpret de la química. Per defecte, el d'ara.
- **`eines/densitat.mjs`, l'eina del nivell 1:**
  - **les opcions:** la química, la distribució, la llavor, quants programes, des de quin índex (`--de`), quants fils (`--fils`) i
    cada quants programes un recompte (`--tros`);
  - **un JSONL com el de `sim.mjs`:** la línia d'inici, amb el codi i l'ordre; els replicadors trobats, amb els bytes; els recomptes
    acumulats; i la línia final, amb una empremta dels resultats;
  - **el resultat no depèn dels fils:** cada programa té el seu atzar (§5), i els resultats s'escriuen en ordre;
  - **una ordre per química,** amb fils (`worker_threads`), en lloc d'`eines/llanca-lot.sh`, que només executa `sim.mjs`;
  - **no sobreescriu cap fitxer,** i a la consola només hi escriu el progrés.
- **`eines/densitat-analisi.mjs`, l'anàlisi de la §6:** escrita i provada amb dades sintètiques abans de calcular res.
  - **Valida els registres:** cada fitxer sencer i coherent, amb l'empremta; tots del mateix commit, sense canvis; la mateixa
    llavor; i, per a cada distribució, totes les químiques amb els mateixos programes, de 0 a *N*, sense forats.
  - **L'interval de Clopper-Pearson** suma els termes de la binomial, sense cap taula, i serveix amb *n* = 10⁸. A 10⁶, dona el valor
    exacte, fet amb racionals, fins a 10⁻¹².
  - **Els controls:** si cap té hereditaris, ho diu, i no aplica ni l'ampliació ni la regla del nivell 2.
- **Les proves:**
  - **`test/quimiques.mjs`:**
    - cada regla, amb una cinta feta a mà;
    - cada química, contra una versió de referència lenta, adaptada de la de cubff, en 10.000 cintes a l'atzar;
    - **l'AUD-65:** els tres replicadors reals de les proves són hereditaris amb C0 i no amb K0. Amb cada química, la prova de
      replicació dona el mateix amb el seu intèrpret que amb el de referència. Sense l'opció, és la de sempre.
    - **Que les proves atrapen els errors:** amb un error posat a propòsit a la regla de S1, en fallen tres.
  - **`test/densitat.mjs`:** les opcions, que el resultat no depèn dels fils ni dels trossos, el JSONL, les distribucions i l'AUD-65 a
    l'eina.
  - **`test/densitat-analisi.mjs`:** l'interval, un resultat conegut, els controls, l'ampliació i cada manera com la validació s'hi
    ha de negar.

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

1. **Durant la sèrie de la maduració:** aquest pla i la PR de la §9, revisats a l'auditoria 25.
2. **Si s'aprova la §13:** el codi, amb una revisió breu, abans de la decisió de la sèrie si ha de ser una predicció.
3. **Després de la sèrie,** quan el PC i la màquina virtual siguin lliures: el nivell 1, unes 4 h, i la §13, unes 5 h més.
4. **Després:** el disseny del nivell 2.

## 12. Per decidir (auditoria 25)

**Ja decidit pel responsable (01-11-2026):** els dos nivells (§1).

**Per decidir entre els dos auditors i Claude:**
1. **Les variants:** si n'hi falta cap o n'hi sobra cap, i les definicions de X1 i S4 (de les propostes de l'auditor 2).
   - **La proposta de Claude:** cap variant de química més al nivell 1.
   - **Les que podrien faltar:**
     - dos controls més, sense moure `h0` (`<` i `>`) o sense moure `h1` (`{` i `}`), que han de donar 0 per la mateixa raó que K0;
     - les variants per cap, que ja depenen de S1 (§2).
   - **L'eix nou** és la composició (§13), no la química.
2. **Les distribucions:**
   - D½ com a principal;
   - Du, només amb C0 i K0;
   - Ds: a la v0.2, dins de la §13.
3. **La composició de bytes i el possible descobriment** (§13):
   - si val la pena, i amb quin disseny;
   - si ha de ser una predicció, fixada abans de la decisió de la sèrie de la maduració.
4. **La mida:** 10⁷ programes, amb l'ampliació a 10⁸ si C0 en té menys de 30.
5. **El disseny aparellat:** els mateixos programes a totes les variants.
6. **Els companys de soroll** en context, en lloc d'un veí d'un món.
7. **La llavor,** que es fixarà quan el pla sigui definitiu.

## 13. La composició de bytes, i què podria ser nou (proposta per a l'auditoria 25)

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
- **Per a qualsevol altra composició** (una sopa envellida, Ds, o l'histograma d'una sopa a cada època):
  - **com:** cada replicador trobat, amb un pes dins del seu estrat, el quocient de les probabilitats de les seves instruccions i
    dels seus altres bytes;
  - **el que en surt:** un estimador sense biaix. El límit és la variància, i es dona sempre.
- **Una comprovació:** la ρ(½) de la tirada principal, amb D½, ha de coincidir, dins dels intervals, amb la dels rₖ.

**Les prediccions:**
- **Amb p petit, ρ creix com pᵐ,** on m és el nombre d'instruccions dels replicadors més curts. El JSONL els desa sencers, i m es
  pot comprovar llegint-los.
- **Amb p a prop d'1, baixa:** les instruccions de més es destorben. Hi ha d'haver un p\* on ρ és màxima, que respon la pregunta
  del responsable.
- **La sopa del començament és a p ≈ 0,039,** molt per sota de p\*.

**Què podria ser nou** (per ordenar entre els tres):
1. **Si la composició explica quan apareix la vida.**
   - **La idea:** amb ρ a la composició de cada època, la cerca a l'atzar prediu el risc d'aparició d'una sopa, o d'un món. Si
     coincideix amb l'observat, la composició ho explica. Si la sopa va més de pressa, hi ha alguna altra cosa: l'estructura que
     acumula.
   - **És la pregunta de la sèrie de la maduració, per un camí independent:** la sèrie ho prova amb una intervenció, i B1 ho
     calcularia sense simular cap sopa.
   - **Què hi ha de nou:** Knierim i altres comparen la sopa amb la mutació a partir d'un histograma madur (§1 de l'estat de la
     qüestió). No hem trobat enlloc el risc d'aparició predit època a època, ni comparat amb una intervenció (§11).
   - **Per ser una predicció de veritat:** el mètode, els estrats i les composicions s'haurien de fixar abans de la decisió de la
     sèrie. No s'hi fa servir cap resultat de la sèrie.
2. **Els ingredients necessaris:** les ablacions de la §2, la pregunta d'origen de B1.
3. **L'alineació dels caps (H64):** si multiplica la densitat, i si canvia m o només el factor de davant.
4. **Els replicadors mínims:** el catàleg dels més curts de cada química.

**La recomanació de Claude:** la 1, amb el disseny estratificat, i la 2, tal com era.
- **Per què:** la 1 és la que pot donar un resultat nou.
- **La 3 i la 4** surten gairebé soles de les mateixes dades.

**El cost**, amb el temps de la §8:
- **els estrats de k = 2 a 64,** amb 10⁶ programes cadascun i C0: 6,3·10⁷ proves, unes 15 h de fil, 2 h amb els 8 fils del PC;
- **els estrats que pesen a Du** (k de 3 a 12): potser 10⁷ programes cadascun, unes 3 h més.

**El que cal decidir:**
- si val la pena, i si els estrats han de ser més fins o més gruixuts;
- d'on surt Ds: proposem les sopes envellides del pilot de la maduració, que ja són analitzades, i no les de la sèrie;
- si el company de la prova també ha de tenir la composició que s'estudia, en lloc de bytes uniformes;
- si la comparació amb les sopes és exploratòria o preregistrada.

**El codi** vindrà després de l'auditoria 25, segons el que es decideixi, amb proves i amb una revisió breu abans de calcular. A la
v0.2 no se n'ha escrit cap.
