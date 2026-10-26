# Els pilots de la maduració de la sopa i de la intervenció dels zeros · disseny

**Estat: v2.2 (26-10-2026), amb les correccions de les auditories 15, 16 i 17.** No s'ha fet córrer cap branca de cap dels dos
experiments. L'envelliment i la preparació de la maduració ja són fets (`fase2/resultats/maduracio/pilot/acta.md`).
- **Els veredictes de la v1:**
  - **L'auditor 1:** GO per als dos pilots, amb canvis.
  - **L'auditor 2:** GO condicionat per a la maduració, i NO-GO per al dels zeros tal com era.
  - **La síntesi,** amb les tres recomanacions una al costat de l'altra: `../auditories/claude-origins/equip/sintesi-audit15.md`.
- **El que ha canviat de la v1** és a la §7; de la v2, a la §8; i de la v2.1, a la §9.
- **Les eines:**
  - `eines/transforma.mjs`, per transformar les captures;
  - `eines/pilot.mjs`, per a les llistes, el manifest i la comprovació prèvia;
  - `eines/potencia-maduracio.mjs`, per a la potència.

**Què és un pilot:** serveix per fixar el disseny d'una sèrie: l'edat, l'horitzó, el nombre de mons, el cost i la
potència. Com a l'exploració de B2:
- no en surt cap conclusió;
- els resultats del pilot no es fan servir mai com a prova;
- els mons del pilot no entren a la sèrie.

**Una excepció:** la intervenció dels zeros ja no és un pilot. El responsable va decidir fer-ne una prova preregistrada dins
dels 11 mons (§4.4). El seu protocol és a `docs/protocol-zeros.md`, i mana sobre la §4 d'aquest document.

## 1. Les preguntes

**La maduració.** Un món quiet sense vida, a una edat fixada, es divideix en alíquotes des de la mateixa captura, i
cadascuna continua amb el mateix atzar. La pregunta principal: la vida apareix abans si el món continua tal com és que
si se'n desfà l'estructura conservant-ne la composició? I quina capa és la que importa:
- **l'histograma de bytes,** que Knierim i altres (2026) relacionen amb l'aparició;
- **la composició de cada programa;**
- **l'ordre dels bytes dins del programa;**
- **la disposició dels programes a l'espai?**

Un resultat de `continue` contra `shuffle-all` no diu per si sol quina capa explica la diferència. El patró dels cinc
braços serveix per triar els contrastos d'una sèrie, no per provar una cadena de mediacions (auditor 2).

**Els zeros.** Als mons amb molts zeros quan s'hi estableix la vida (entrada 11), es canvien els zeros de les cel·les que
no es repliquen per bytes de dades. La pregunta: això evita que la vida baixi just després de l'establiment, com hi baixa
sense tocar res?

## 2. El que ja en sabem

### Les dades de la llei 2, mons quiets (80 mons, cens v3)

| Edat *a* | Sense establiment a *a* | S'estableixen dins de (*a*, *a* + 4.000] | Dins de (*a*, *a* + 8.000] |
|---|---|---|---|
| 0 (món nou) | 80 | 3 (4 %) | 8 (10 %) |
| 2.000 | 79 | 4 (5 %) | 12 (15 %) |
| 4.000 | 77 | 5 (6 %) | 14 (18 %) |
| 6.000 | 75 | 8 (11 %) | 14 (19 %) |
| 8.000 | 72 | 9 (13 %) | 16 (22 %) |

- **La pista de la maduració** (AUD-64, `docs/estat-questio.md`, §11.2): un món de 8.000 èpoques sense vida s'estableix
  en 8.000 èpoques més el doble de sovint que un de nou (22 % contra 10 %). Són dades mirades després, i poques.
  - **Una dada a favor** (auditor 1): l'augment va en contra de la selecció. Els mons que arriben a l'època 8.000 sense
    vida són, si de cas, els més lents.
- **A l'edat 8.000,** el cens (una mostra de 2.048 cel·les, l'1,6 % del món) veu algun replicador a 24 dels 72 mons, i
  algun hereditari a 1 (el A1064). Tots per sota de l'1 % (AUD-111).
- **El cost d'un món sense vida:** de 0,21 a 0,25 s per època al PC. Fins a l'època 8.000, uns 30 minuts.

### El que diu el codi (comprovat a `test/transforma.mjs`, i per tots dos auditors)

- **El mateix atzar dona les mateixes tirades a tots els braços.** La BFF no fa servir l'atzar, i el món (els corrents,
  l'ordre, les parelles i les mutacions) en fa un nombre que no depèn del contingut de les cel·les.
  - **Per tant,** amb la mateixa `--seed` de continuació, tots els braços d'un món tenen exactament les mateixes
    parelles i les mateixes mutacions, també amb corrent.
  - **El que no vol dir:** que les trajectòries s'assemblin, perquè la dinàmica de la BFF és caòtica. No es compta amb
    aquesta correlació per a la potència.
- **El cens** té una llavor fixa. La mostra del **primer cens** és, doncs, la mateixa a tots els braços, i és una mesura
  aparellada perfecta. Després, les proves de replicació consumeixen l'atzar segons el contingut, i les mostres
  divergeixen.

### Els zeros (entrada 11, i auditoria 15)

- **Els zeros no hi eren abans de la vida** (AUD-109).
  - A *t* − 500 i *t* − 250, tots els mons B, fràgils inclosos, en tenen un 0,4–0,6 %, com una sopa a l'atzar.
  - En les 250 èpoques en què el replicador s'escampa, salten al 8–26 %.
  - Van amb la part del mapa de la família dominant (Spearman 0,54), però no amb la proporció d'hereditaris.
  - **La hipòtesi que en surt** és un autoenverinament: en uns mons, el replicador s'escampa deixant moltes còpies
    trencades plenes de zeros, i aquestes deixalles aturen les còpies següents.
- **Els replicadors porten molts zeros al seu codi:** uns 18–19 per programa. Treure tots els zeros del món, doncs, també
  els desfaria a ells.
- **Les cel·les que no es repliquen** en porten de 13 a 16 per programa, i hi ha del 47 al 93 % dels zeros, segons el món.
- **La baixada just després de *t*** (AUD-110):
  - **Les dades:** a les branques de B2, la vida baixa del cens de *t* al primer cens de la branca (*t* + 250) a 18 de
    20 branques dels mons fràgils, i a 0 de 70 dels mons quiets.
  - **Amb corrent, és previsible món a món:** baixa a totes les branques de 8 mons, i a cap dels altres 3.
- **La pèrdua R2 en 2.000 èpoques, amb corrent, és rara:** 3 de 10 branques als mons fràgils, perquè sovint un successor
  ocupa el món.
- **El cost:** sense els zeros de fora dels replicadors, el món va uns 3 cops més a poc a poc. Els bucles s'aturen menys.

## 3. El pilot de la maduració

| Element | Proposta | Per què |
|---|---|---|
| **Els mons** | 24 mons quiets nous: llavors 5001–5024, 512 × 256, radi 2, corrent 0, generador v2, cens v3 | Els de la llei 2 ja tenen una història coneguda. Les llavors no coincideixen amb cap de les anteriors |
| **L'envelliment** | `node eines/pilot.mjs maduracio --envelliment`: fins a l'època 8.000, amb `--stop-after-event 0` | Els mons que s'estableixen abans s'aturen, i queden fora |
| **La cohort** (AU2-82) | Els **mons sense establiment detectat fins a l'època 8.000**. Es desa el cens de l'època 8.000 de cadascun | La definició exacta del que s'estudia |
| **L'exclusió per vida ja present** (AUD-111) | Una prova de replicació i d'herència de **totes** les cel·les de cada món a l'època 8.000 (`eines/transforma.mjs --scan`). S'exclou el món si hi ha alguna cel·la hereditària. Els replicadors no hereditaris no s'exclouen: es desen, com a covariable | `continue` i `shuffle-programs` conserven els replicadors, i els altres braços els destrueixen. Amb vida ja present, el contrast principal donaria "l'estructura importa" per una raó trivial |
| **L'edat** | *a* = 8.000 | La segona meitat del rang de la llei 2, on el ritme és més alt; i *a* + *H* = 16.000, l'horitzó de la llei 2. Tots dos auditors hi estan d'acord |
| **Els braços** | `continue`, `shuffle-programs`, `shuffle-within`, `shuffle-all` i `reinit` | Els cinc, tots dos auditors hi estan d'acord. `reinit` fa de control positiu de l'edat |
| **L'atzar de la transformació** | La llavor del món + 600.000 | Independent del de la continuació |
| **La continuació** | *K* = 2 llavors, la del món + 400.000 i + 500.000, les mateixes a tots els braços. *H* = 8.000, fins a l'època 16.000, i `--stop-after-event 0` | Els mateixos nombres aleatoris a tots els braços. L'aturada estalvia càlcul |
| **La mesura principal** | L'establiment dins de *H*, amb el criteri de la llei 2, **estimat per món** (les dues llavors, una mitjana) | El criteri que ja coneixem. El món és la unitat |
| **Les descriptives** | El temps fins a l'establiment (RMST), el primer cens amb algun hereditari, la concordança entre llavors i entre braços, i el cost | Per triar la mesura de la sèrie i calcular-ne la potència |
| **La mida i el cost** | 240 branques com a molt. Unes 12 h d'envelliment, uns 40 min d'escanejos, i com a molt unes 135 h de branques: unes 145 h, un dia amb 6 branques alhora al PC i 4 a la màquina virtual | — |

**Què se'n traurà:**
- la proporció d'establiments a cada braç, per món (uns 22 mons per braç);
- la concordança entre llavors i entre braços d'un mateix món (la correlació *rho* de la potència);
- el cost real.

**Què no se'n traurà:** cap conclusió. Amb unes 44 branques per braç, l'interval de cada ritme anirà, per exemple, del 7
al 30 %. No podrà distingir un 11 % d'un 15 %.

**La lectura de cada braç** (auditoria 17) és a l'acta, escrita abans de la primera branca. `shuffle-all` comença amb cel·les
hereditàries, i `continue`, no: el contrast compara tractaments sencers, no l'estructura sola.

**La potència orientativa de la sèrie** (AUD-113, corregida): `node eines/potencia-maduracio.mjs`, amb el món com a unitat,
*K* = 2, la prova de signes exacta unilateral amb α = 0,025 i el contrast `continue` contra `shuffle-all`.

| `continue` | `shuffle-all` | *rho* | 40 mons | 80 | 120 | 160 | 240 |
|---|---|---|---|---|---|---|---|
| 22 % | 11 % | 0 | 36 % | 67 % | 86 % | 95 % | 99 % |
| 22 % | 11 % | 0,3 | 29 % | 57 % | 78 % | 89 % | 98 % |
| 22 % | 15 % | 0 | 14 % | 28 % | 43 % | 55 % | 75 % |

- **Corregit a l'auditoria 15 (AUD-113):** la v1 deia un 90 % amb 120 mons, i un 17–82 % a la segona fila. La simulació
  ràpida d'aleshores feia servir un generador de poca qualitat, i no es va desar.
- **La sèrie es dimensionarà per l'efecte que valgui la pena detectar,** fixat abans, i no per l'estimació del pilot.

## 4. El pilot dels zeros

**Aquesta secció ja no mana.** La intervenció dels zeros és ara una prova preregistrada, i el seu disseny és al protocol
(`docs/protocol-zeros.md`, v0.2). Hi ha canviat la mesura (*g* = *h*₁ / *h*₀, auditoria 16, AUD-116), hi ha un quart braç
descriptiu (`zeros-inert`) i 132 branques. El que segueix és el disseny de la v2, tal com era, per a la traçabilitat.

### 4.1 El disseny

| Element | Proposta | Per què |
|---|---|---|
| **Els mons, amb el seu paper escrit abans** | **8 de prova** (B2002, B2011, B2021, B2038, B2042, B2043, B2078 i B2001): la vida baixa al primer cens a totes les seves branques de B2 amb corrent. **3 controls negatius** (B2071, B2044 i B2058): no hi baixa | Tots dos auditors volen els 11. Els controls negatius mostren si la intervenció fa alguna cosa més que treure l'enverinament |
| **La captura** | La de l'establiment, *t* (`fase2/resultats/b2/repartiment.json`) | El punt de partida de B2 |
| **Els braços** | `continue`; **`zeros-data`**, en què els zeros de fora dels replicadors detectats passen a bytes de dades; **`placebo-cell`**, en què a cada cel·la tants bytes de dades com zeros té passen a un altre byte de dades | §4.2 |
| **L'atzar de la transformació** | La llavor del món + 600.000, la mateixa als braços amb abast | Així fan servir exactament les mateixes cel·les |
| **La continuació** | Corrent 0,01 (la condició d'origen), *K* = 3, la llavor del món + 400.000, + 500.000 i + 700.000, i *H* = 2.000, fix | La mesura principal és a *t* + 250. Les 2.000 èpoques deixen veure també la pèrdua, la recuperació i la successió |
| **La mesura principal** (AUD-110) | **La proporció d'hereditaris al primer cens (*t* + 250), aparellada per món i llavor contra `continue`** | És la predicció directa de la hipòtesi; passa abans que els zeros tornin; i al primer cens la mostra és la mateixa a tots els braços |
| **Les secundàries** (AU2-81) | La mitjana dels censos 2 a 4; el temps fins a la pèrdua R2, amb censura a *H*; la pèrdua R2 i la recuperació; la successió; els zeros al llarg del temps (els bytes més freqüents del registre de text, cada 100 èpoques, i la captura final) | Per entendre què passa després, i si els zeros tornen |
| **La mida i el cost** | 11 × 3 × 3 = 99 branques; de 2 a 5 h per branca, de 200 a 500 h en total | Amb 8 mons, la prova només es rebutja si tots els mons amb una diferència la tenen a favor, i una tercera llavor en redueix el soroll (`docs/protocol-zeros.md`, §4) |

### 4.2 Els braços, i per què han canviat

- **El braç dels zeros: zeros → bytes de dades** (AUD-112).
  - **Què canvia:** els zeros de fora dels replicadors detectats passen a un dels 245 valors que no són ni 0 ni cap
    instrucció.
  - **Què no canvia:** el mapa d'instruccions del món és idèntic, i només canvia que aquells bytes ja no són zero.
  - **Per què:** a la v1 hi posava qualsevol valor d'1 a 255, i afegia un 2–5 % d'instruccions a les deixalles.
- **El placebo, aparellat cel·la per cel·la** (AU2-78).
  - **Què canvia:** a cada cel·la de l'abast, tants bytes de dades com zeros té passen a un altre byte de dades.
  - **Què no canvia:** els zeros i el mapa d'instruccions.
  - **Si una cel·la té més zeros que bytes de dades,** els canvia tots, i el registre en diu la diferència (al B2042, el
    2,9 %).
  - **Per què:** a la v1, el control canviava el mateix nombre global de bytes, però no a les mateixes cel·les. A més,
    desfeia codi de les deixalles (un 6–28 % de les seves instruccions).
- **Els contrastos:**
  - **El principal:** `zeros-data` contra `continue`, és a dir, l'efecte total de treure els zeros, amb tot el mapa
    d'instruccions igual.
  - **El de control:** `placebo-cell` contra `continue`, és a dir, si canviar valors de dades per si sol hi fa alguna cosa.
  - **El mecanístic:** `zeros-data` contra `placebo-cell`, amb la diferència d'aparellament que diu el registre.
- **El control antic (`control-outside`)** desfà codi de les deixalles. Respon una altra pregunta: si les deixalles fan mal
  per si mateixes, i no pels seus zeros. Es pot afegir com a quart braç, llegit contra `continue`: el responsable ho
  decideix (§4.4).

### 4.3 La màscara dels replicadors detectats (AU2-80)

- **Què és:** les cel·les que passen la prova de replicació, sola o en context, provades totes una per una. És una prova
  finita, no una garantia que no hi hagi cap replicador més.
- **Per què n'hi ha prou:** és conservadora, perquè protegeix també els replicadors no hereditaris.
- **Què en desa el registre de cada captura transformada:**
  - la SHA-256 de la màscara;
  - les cel·les protegides;
  - els zeros protegits i els de l'abast.
- **La comprovació de l'efecte immediat:** el primer cens de cada braç té la mateixa mostra, i diu si la intervenció hi ha
  canviat la proporció d'hereditaris.

### 4.4 Pilot o prova? Decidit: una prova preregistrada

**La decisió** (el responsable, 25-10-2026): una prova preregistrada dins dels 11 mons, amb tres braços. El protocol és a
`docs/protocol-zeros.md`. El que segueix és el raonament d'abans de la decisió.


L'auditor 1 hi fa notar que la intervenció és nova i l'atzar també, de manera que no hi ha dades ja vistes.
- **Com a pilot:** com la maduració. No en surt cap conclusió, i la confirmació necessitaria mons B nous, que són cars.
- **Com a prova preregistrada dins d'aquests 11 mons:** abans de llançar, s'escriuen la prova i les exclusions, es
  revisen breument, i es fixen amb una etiqueta i un segell (esperant l'ancoratge a Bitcoin).
  - **La prova:** per exemple, la de signes per mons, unilateral, als 8 mons de prova, amb *K* = 2.
  - **El que en sortiria:** una afirmació causal sobre aquests mons ("treure'ls els zeros evita la baixada"), no sobre
    mons nous.

## 5. Com s'executa (AU2-79, auditor 2: el manifest congelat i la comprovació prèvia)

1. **El codi,** en un commit de `main`, desplegat a la màquina virtual amb `eines/desplega-vm.sh`. Les actualitzacions de
   Windows, pausades. L'espai: unes 2 GB de captures noves a la carpeta del repositori.
2. **La maduració, l'envelliment:** `node eines/pilot.mjs maduracio --envelliment > llista`, i el lot.
3. **La preparació:** `node eines/pilot.mjs PILOT --prepara`, des d'un commit net.
   - **Què comprova a la maduració** (AU2-85):
     - el registre de l'envelliment de cada món, sencer: la capçalera i l'ordre exacta, tots els censos i totes les
       mesures, els invariants del cens, l'establiment recalculat i la línia final;
     - que el simulador del commit de l'envelliment sigui el d'ara.
     - **Un registre que no és el que toca és un error de la preparació,** no un món exclòs.
   - **Què fa:**
     - l'escaneig i les exclusions (la maduració);
     - totes les transformacions;
     - l'escaneig de cada captura transformada: el punt de partida de cada braç (AUD-116). A la maduració és un descriptiu.
       - **Corregit a l'auditoria 17 (AUD-123):** la v2.1 deia que "n'han de sortir 0 hereditaris". No és així: les barreges
         en creen, sobretot `shuffle-all` (l'acta).
   - **Què escriu:** el manifest (`manifest.json`), amb:
     - l'ordre de cada branca;
     - les SHA-256 dels registres de l'envelliment, dels escanejos, de les captures d'origen i transformades i dels seus
       registres (AUD-120);
     - les llistes de les dues màquines.
   - **Què no fa:** no sobreescriu res.
   - **On va:** el manifest, els registres i les llistes van a git abans de la primera branca.
4. **La comprovació prèvia,** a cada màquina, amb les captures d'origen i les transformades: `node eines/pilot.mjs PILOT --comprova`.
   - **El manifest, contra el disseny** (AU2-84): els mons, el seu paper i la inclusió, els paràmetres, les branques i les
     llistes. Un manifest buit o truncat no passa.
   - **La procedència de cada captura** (AU2-88): la SHA-256 del manifest i del seu registre, d'on ve, on va, la llavor, el
     món i el codi; i el seu escaneig.
   - **Que cap camí** no es repeteixi.
   - **Que cap branca** no hagi començat.
   - **Després de la sèrie** (AUD-118), `--comprova-captures` fa el mateix, sense mirar les branques.
5. **El lot de les branques,** amb `eines/llanca-lot.sh`, des de la carpeta del commit.

**L'eina de les transformacions no sobreescriu mai cap fitxer:**
- si la sortida o el seu registre ja existeixen, s'atura;
- escriu a un fitxer temporal que canvia de nom al final;
- comprova que l'entrada no hagi canviat.

## 6. La traçabilitat

- **Les captures transformades** no van a git, però es poden regenerar exactament amb la mateixa captura, el tipus i la
  llavor.
  - **El registre de cada una** (el `.json` de l'eina) diu les SHA-256, el tipus, la llavor, el commit i què ha canviat.
  - **Aquests registres, i el manifest,** van a git.
- **Les captures envellides** també es regeneren amb la llavor i el commit.
- **Cada registre de branca** comença amb `codi=<commit>`, com sempre.

## 7. Canvis respecte de la v1 (auditoria 15)

| Troballa | Què canvia |
|---|---|
| AUD-109 | Els zeros, mirats abans de *t*: la hipòtesi de l'autoenverinament (§2) |
| AUD-110 | La mesura principal dels zeros: el primer cens, i no la pèrdua R2 (§4.1) |
| AUD-111 | L'escaneig d'herència de totes les cel·les a l'edat 8.000, i l'exclusió (§3) |
| AUD-112 | Els zeros passen a bytes de dades; el control antic, com a braç a part opcional (§4.2) |
| AUD-113 | La taula de potència, refeta amb el món com a unitat i desada en un script (§3) |
| AUD-115 | `reinit` té un invariant: ha de ser la sopa a l'atzar de la seva llavor |
| AU2-78 | El placebo, aparellat cel·la per cel·la (§4.2) |
| AU2-79 | L'eina no sobreescriu mai cap fitxer; el manifest congelat i la comprovació prèvia (§5) |
| AU2-80 | La màscara dels replicadors detectats: el nom, i el que en desa el registre (§4.3) |
| AU2-81 | Les mesures secundàries dels zeros, i *H* fix (§4.1) |
| AU2-82 | La definició de la cohort de la maduració (§3) |
| Els 11 mons | El paper de cadascun, escrit abans: 8 de prova i 3 controls negatius (§4.1) |

## 8. Canvis respecte de la v2 (auditoria 16)

| Troballa | Què canvia |
|---|---|
| AU2-84 | La comprovació prèvia compara el manifest amb el disseny, i un manifest buit o truncat no passa (§5) |
| AU2-85 | L'envelliment, validat sencer a la preparació, i el mateix simulador que el de l'envelliment (§5) |
| AU2-88 | La procedència de cada captura transformada i del seu escaneig, comprovada (§5) |
| AUD-116, AUD-120 | L'escaneig de cada captura transformada, i les SHA-256 de tots els registres al manifest (§5) |
| AUD-118 | `--comprova-captures`, per comprovar les captures després de la sèrie (§5) |
| Els zeros | La §4 ja no mana: el disseny és a `docs/protocol-zeros.md` |

## 9. Canvis respecte de la v2.1 (auditoria 17)

| Troballa | Què canvia |
|---|---|
| Tots dos auditors | **La lectura de cada braç,** a l'acta abans de la primera branca: `shuffle-all` com la composició envellida amb la seva propensió immediata, el punt de partida com a covariable, i cap afirmació causal a partir del contrast brut |
| AUD-121 | **El criteri principal de "hereditari"** és el de les soles. De les 169 hereditàries de `shuffle-all`, 159 ho són només en context |
| AUD-122 | **La composició de les captures,** a l'acta com a descriptiu estàtic |
| AUD-123 | **El text de la §5** deia que l'escaneig de les captures transformades havia de donar 0 hereditaris, i l'acta donava les medianes superiors |
