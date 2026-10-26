# Protocol de la prova dels zeros · treure l'enverinament des de la mateixa captura

**Versió: v0.3, esborrany (26-10-2026), amb la correcció de l'auditoria 17 (AU2-89), per a una comprovació breu (auditoria 18).**
No s'ha fet córrer cap branca.
- **D'on surt:**
  - l'exploració de la fragilitat del món (entrada 11, `fase2/resultats/b2/fragilitat/`);
  - les auditories 15 i 16;
  - les decisions del responsable: una prova preregistrada dins dels 11 mons, i, després de l'auditoria 16, un quart braç
    descriptiu (`docs/disseny.md`).
- **El que ha canviat de la v0.1** és a la §10, i de la v0.2, a la §11.
- **Els programes:**
  - `eines/transforma.mjs`, per a les transformacions i els escanejos;
  - `eines/pilot.mjs`, per al manifest, les llistes i les comprovacions;
  - `fase2/zeros-confirmacio.mjs` i `fase2/zeros-serie.mjs`, per a la decisió. Aquest darrer valida els registres amb
    les funcions de la sèrie de B2 (`fase2/b2-serie.mjs`).
- **El procediment:** després de la comprovació breu, aquest protocol, el manifest i els programes es fixen amb l'etiqueta
  anotada `preregistre-zeros` i un segell d'OpenTimestamps. **Cap branca no es llança abans que Bitcoin hagi ancorat el
  segell** (§9).

## 1. La pregunta i les hipòtesis

**El que ja en sabem** (entrada 11; auditoria 15, AUD-109 i AUD-110):
- **La baixada:** en 8 mons amb corrent, la vida baixa just després de l'establiment, del cens de *t* al primer cens de
  la branca (*t* + 250), a totes les seves branques de B2 amb corrent.
- **Els zeros:** quan s'hi estableix la vida, aquests mons tenen una proporció de bytes zero molt més alta (del 8 al 26 %),
  que no hi era 250 èpoques abans.
- **La hipòtesi:** un autoenverinament. El replicador s'escampa deixant moltes còpies trencades plenes de zeros, i aquestes
  deixalles aturen les còpies següents.

**L'efecte immediat de treure els zeros** (auditoria 16, AUD-116):
- **El control:** l'auditor 1 va aplicar el cens a la captura de *t*, tal com és i transformada, sense deixar córrer cap
  època. És la mateixa mostra que tindran les branques al primer cens.
- **El resultat:** amb `zeros-data` hi ha entre un 5 i un 88 % més d'hereditaris que amb `continue`, als 11 mons. Amb el
  placebo, els mateixos (entre −8 i +3 %, el soroll del cens).
- **Per què:** moltes còpies que no es repliquen ho fan quan els seus zeros passen a bytes de dades. Al B2002, una de cada
  deu cel·les de les deixalles.
  - **Què vol dir:** una part de les "còpies trencades" no són trencades, sinó adormides pels seus zeros.
  - **Com hi encaixa:** pot ser una segona via de l'autoenverinament. Els zeros no només aturarien les còpies que s'hi
    escriuen a sobre, sinó que també adormirien les que els porten.
  - **El que hem comprovat nosaltres:** al B2042, el cens estàtic dona 61 hereditaris amb `continue`, 77 amb `zeros-data` i
    56 amb el placebo.
- **La conseqüència per a la prova:** comparar només els hereditaris del primer cens entre braços no diria si la vida baixa
  menys. `zeros-data` hi començaria amb més vida, i la prova es podria rebutjar encara que la vida baixés igual. Per això
  la mesura és el canvi de cada braç des del seu propi punt de partida (§5).

**La pregunta:** si a la captura de *t* es canvien els zeros de les cel·les que no es repliquen per bytes de dades, **la
vida baixa menys, o creix més, del començament al primer cens?**

**Les dues hipòtesis confirmatòries,** als 8 mons de prova, sobre la mesura *g* (§5):
1. **Contra `continue`:** *g* és més alt amb `zeros-data` que si el món continua sense tocar res.
2. **Contra el placebo:** *g* és més alt amb `zeros-data` que amb `placebo-cell`. El placebo canvia, a cada cel·la, tants
   bytes de dades com zeros té, i deixa els zeros (§3).

**L'abast de l'afirmació** (AU2-87): aquests 8 mons, triats després de veure'n les dades, no mons nous.
- **Per què és causal dins d'aquests mons:** els braços parteixen de la mateixa captura i tenen les mateixes llavors de
  continuació. Només els separa la transformació.
- **El que no diu:** si els zeros prediuen la fragilitat en mons nous. Això demanaria una cohort nova (auditor 2).

## 2. Els mons

| Mons | Paper | Què s'hi espera amb `continue` |
|---|---|---|
| B2002, B2011, B2021, B2038, B2042, B2043, B2078, B2001 | **De prova:** la vida baixa al primer cens a totes les seves branques de B2 amb corrent | Que baixi |
| B2071, B2044, B2058 | **Controls negatius:** amb corrent, la vida no hi baixa | Que no baixi |

- **Com es van triar:** són els 11 mons B amb el 8 % de zeros o més a *t*, un llindar posterior a les dades.
- **El paper de cadascun** surt de les branques de B2 (auditoria 15, `trajectories-zeros.mjs`).
- **La captura:** la de l'època *t* de l'establiment, amb la SHA-256 de `fase2/resultats/b2/repartiment.json`.
- **Els controls negatius tenen sostre** (AUD-119).
  - **El sostre:** amb `continue`, el B2044 i el B2058 són al 97 % al primer cens.
  - **El B2071 és barrejat:** a la història original la vida hi va baixar, i a les branques de B2 amb corrent hi va pujar.
  - **Què poden mostrar:** si la intervenció fa mal on no hi ha enverinament, però no si infla la mesura. Aquest control el
    fa el punt de partida de cada braç (*h*₀, §5).

## 3. Els braços

| Braç | Què fa (`eines/transforma.mjs`) | Paper |
|---|---|---|
| `continue` | La captura tal com és | Referència |
| `zeros-data` | Els bytes zero de les cel·les de fora dels replicadors detectats passen a un byte de dades a l'atzar: un dels 245 valors que no són 0 ni cap instrucció. El mapa d'instruccions del món no canvia | Les dues proves |
| `placebo-cell` | A cada cel·la de l'abast, tants bytes de dades com zeros té passen a un altre byte de dades. Els zeros i el mapa d'instruccions no canvien | La prova 2 |
| `zeros-inert` | Com `zeros-data`, cel·la per cel·la i en l'ordre de les cel·les, però només si la cel·la no passa a replicar-se. Si hi passa, es deixa com era, i el registre en diu quantes. Neteja els companys sense despertar còpies | **Descriptiu** (decisió del responsable, auditoria 16) |

- **Els replicadors detectats:** les cel·les que passen la prova de replicació, sola o en context, provades totes una per
  una. És una prova finita i conservadora. El registre de cada captura en desa la SHA-256 de la màscara, les cel·les
  protegides i els zeros protegits.
- **L'atzar de la transformació:** la llavor del món + 600.000, la mateixa als tres braços que la fan servir. Per tant, tots
  tres fan servir exactament les mateixes cel·les.
- **Els invariants** els comprova l'eina, i si no es compleixen, no escriu res.
- **El placebo, a les cel·les saturades** (AU2-86, decidit abans de llançar).
  - **Què passa:** en una cel·la amb més zeros que bytes de dades, el placebo en canvia tots els bytes de dades, i no hi
    arriba. `zeros-data`, en canvi, hi canvia tots els zeros.
  - **Què en desa el registre:** la diferència de cada món, en total i a les cel·les saturades. Al B2042, el 2,9 % dels
    zeros de l'abast; als 11 mons, del 0,5 al 5,0 %.
  - **Per què no s'hi aplica *m* = mín(zeros, dades) als dos braços:** hi deixaria zeros precisament a les cel·les més
    saturades, on la hipòtesi diu que fan més mal (auditor 1).
  - **El que costa:** la prova 2 és contra un placebo **aparellat cel·la per cel·la, en part a les cel·les saturades**, i ho
    diu la frase de la decisió. És el contrast de dos tractaments concrets, no un aïllament perfecte de la dosi (auditor 2).

## 4. Les branques

- **La condició:** corrent 0,01, la d'origen d'aquests mons. Món de 512 × 256, radi 2, generador v2, cens v3 cada 250
  èpoques, amb una mostra de 2.048.
- **Les llavors de continuació:** *K* = 3, la del món + 400.000, + 500.000 i + 700.000. Són les mateixes als quatre braços.
- **L'horitzó:** *H* = 2.000 èpoques, fix i igual per a totes les branques.
- **L'ordre:** la de `eines/pilot.mjs` (`branchLines`). El manifest desa l'ordre exacta de cada branca, i la validació la hi
  compara.
- **La mida:** 11 mons × 4 braços × 3 llavors = 132 branques.
- **El cost:** de 2 a 5 h per branca, perquè els braços sense zeros van més a poc a poc. En total, de 260 a 660 h: d'un a
  tres dies, amb 6 branques alhora al PC i 4 a la màquina virtual.

**Per què *K* = 3:** amb 8 mons, la prova només es rebutja si tots els mons amb una diferència la tenen a favor (§6). Una
llavor més fa que la mitjana de cada món tingui menys soroll.

## 5. La mesura

**La principal: *g* = *h*₁ / *h*₀,** la vida del primer cens respecte de la del començament del mateix braç (AUD-116).
- ***h*₁:** la proporció d'hereditaris al primer cens de la branca, a l'època *t* + 250.
  - **La mateixa mostra:** el cens té una llavor fixa, i al primer cens és la primera vegada que se'n fa servir l'atzar. La
    mostra de 2.048 cel·les és, doncs, la mateixa als quatre braços d'un món.
  - **El valor d'un món i un braç:** la mitjana de les seves 3 llavors.
- ***h*₀:** la proporció d'hereditaris de l'**escaneig de totes les cel·les** de la captura del braç.
  - **La prova:** la mateixa del cens, la de replicació i la de segona generació (`eines/transforma.mjs --scan`).
  - **Per què és determinista:** depèn només de la captura, la llavor i el codi.
  - **Quan es fa:** abans del preregistre, a `--prepara`, i es desa al manifest.
- ***g* d'un món i un braç:** la mitjana de *h*₁ de les seves llavors, dividida per *h*₀.
- ***g* no afavoreix la hipòtesi** (auditor 1): amb més replicadors al començament hi ha més còpies i més deixalles, i això
  hauria de fer baixar el *g* de `zeros-data`, no pujar-lo.

**Les descriptives:**
- **L'efecte immediat:** *h*₀ de cada braç, respecte del de `continue`.
- ***h*₁ sol:** l'efecte total de la transformació al primer cens.
- ***g* de `zeros-inert`** contra `continue`, i contra `zeros-data`, que separa la neteja dels companys de les còpies que es
  desperten.
- ***g* del placebo** contra `continue`.
- **La sensibilitat amb els hereditaris sols** (`heritableSolo`), que no depenen dels veïns per construcció (AUD-119): les
  dues proves, refetes amb *g* dels hereditaris sols.
- **Les secundàries:**
  - la mitjana dels censos 2 a 4;
  - la pèrdua sostinguda R2, el temps fins a la pèrdua (amb censura a *H*) i la recuperació;
  - la proporció al cens final;
  - els zeros al llarg del temps: els bytes més freqüents del registre de text, cada 100 èpoques.

## 6. L'anàlisi

**Les dues proves,** als 8 mons de prova:
- **La prova 1:** *D*₁ = *g*(`zeros-data`) − *g*(`continue`), a cada món.
- **La prova 2:** *D*₂ = *g*(`zeros-data`) − *g*(`placebo-cell`), a cada món.
- **El mètode:** la prova de signes exacta, unilateral, sobre els mons amb *D* ≠ 0. H₀ diu que la probabilitat que *D* > 0
  és 1/2, i H₁, que és més gran. Els empats no hi compten.
- **La correcció de Holm,** amb α = 0,025 per a la família.
  - La prova amb la *p* més petita es compara amb α/2 = 0,0125.
  - Si la primera es rebutja, l'altra es compara amb α.
- **Què vol dir amb 8 mons:**
  - si els 8 tenen la diferència a favor, *p* = 1/256 = 0,0039;
  - amb 7 a favor i 1 en contra, *p* = 9/256 = 0,035, i no es rebutja;
  - amb 7 a favor i 1 empat, *p* = 1/128 = 0,0078.
  - **A la pràctica,** es rebutja només si tots els mons amb una diferència la tenen a favor.
- **Amb més empats** (AU2-89):
  - amb 6 mons amb diferència, la *p* més petita és 1/64 = 0,016. Només es pot rebutjar com a segona prova de Holm, si l'altra
    ja s'ha rebutjat;
  - amb 5 o menys, la *p* més petita és 1/32 = 0,031 o més, i no es pot rebutjar.

**El model de la prova** (AU2-87). La prova de signes suposa que, sota H₀, el signe de *D* és a l'atzar a cada món, i
independent d'un món a l'altre.
- **El que no és:** no és una prova de randomització de mons nous. Els 8 mons es van triar per un resultat anterior.
- **El que identifica:** l'efecte de la intervenció en aquestes captures, amb aquestes llavors.

**La potència.** Si a cada món la diferència surt a favor amb una probabilitat *q*, i no hi ha empats, una de les proves es
rebutja amb una probabilitat *q*⁸:

| *q* | 0,90 | 0,95 | 0,98 | 0,99 |
|---|---|---|---|---|
| Potència | 43 % | 66 % | 85 % | 92 % |

- **Què és:** una aproximació condicionada a 8 diferències sense empat i independents, per a un sol contrast.
- **Què no és:** la potència exacta conjunta de les dues proves amb Holm, si hi ha empats o dependència entre els contrastos.
  Amb empats, la potència canvia: amb 6 mons amb diferència només es pot rebutjar com a segona prova de Holm, i amb 5 o menys,
  mai (AU2-89).
- **Que *g* sigui més alt amb `zeros-data`** no vol dir que la vida no baixi: vol dir que baixa menys, o creix més.

**Com es comunica:**
- **Si es rebutja H₀:** "als mons de prova, entre els que tenen una diferència, predominen els que la vida baixa menys, o
  creix més, del començament al primer cens amb `zeros-data` que amb l'altre braç".
  - **Contra el placebo:** "aparellat cel·la per cel·la, en part a les cel·les saturades".
  - **I sempre:** "no diu res de mons nous".
- **Si no es rebutja:** no concloent.
  - **Què més diu la frase** (AU2-89): la *p* més petita que permetien els mons amb diferència.
  - **I la potència:** la d'aquesta secció (*q*⁸) només val per a 8 mons amb diferència, sense empats i independents, i no és
    la del resultat.
- **Les frases** surten de `decisionLines()` (`fase2/zeros-serie.mjs`).
- **La sortida informa** de tot això:
  - els valors de cada món (*h*₀, *h*₁ i *g* de cada braç);
  - els empats, les dues *p* i els llindars;
  - la diferència del placebo de cada món;
  - els controls negatius.

## 7. L'execució

1. **El codi:** un commit de `main` amb aquest protocol, desplegat a la màquina virtual amb `eines/desplega-vm.sh`. Les
   actualitzacions de Windows, pausades.
2. **La preparació:** `node eines/pilot.mjs zeros --prepara`, abans del preregistre, des d'un commit net.
   - **Què fa:** les 44 transformacions i els 44 escanejos.
   - **Què escriu:** el manifest (`fase2/resultats/zeros/serie/manifest.json`), amb:
     - la prova i l'etiqueta;
     - l'ordre de cada branca;
     - les SHA-256 de les captures d'origen, de les transformades, dels seus registres i dels escanejos;
     - les llistes de les dues màquines.
   - **On va** (AUD-120): el manifest, els registres de les transformacions (els `.json` d'`alicuotes/`), els escanejos i
     les llistes van a git, i entren al commit de l'etiqueta. Les captures, no: es regeneren exactament.
3. **El preregistre:** l'etiqueta i el segell (§9). S'espera l'ancoratge a Bitcoin.
4. **La comprovació prèvia,** a cada màquina: `node eines/pilot.mjs zeros --comprova`.
   - **Què hi ha de ser** (AUD-118): les 11 captures d'origen i les 44 transformades.
   - **Què comprova:**
     - el manifest, contra el disseny;
     - les captures, els registres i els escanejos, contra el manifest;
     - les llistes;
     - que cap branca no hagi començat.
5. **El llançament:** `eines/llanca-lot.sh`, des de la carpeta del commit de l'etiqueta.
6. **Durant la sèrie:** només `bash eines/seguiment.sh --agregat`.
   - **Si una màquina s'atura,** es torna a llançar el mateix lot, i les branques acabades se salten.
7. **Abans de decidir** (AUD-118): `node eines/pilot.mjs zeros --comprova-captures` a la màquina on es decideix. Comprova
   de nou totes les SHA-256, i el resultat va a l'acta.
8. **La decisió:** `node fase2/zeros-confirmacio.mjs --decideix fase2/resultats/zeros/serie/branques`, des d'una còpia del
   commit de l'etiqueta, amb `NODE_OPTIONS` buit. La sortida es desa tal com surt.
   - **El programa no decideix res si hi ha cap problema:** si el manifest no és coherent, o si algun registre no és
     exactament el que n'espera, en llista els problemes i s'atura.

## 8. Limitacions conegudes

- **Els mons es van triar després de veure les dades,** i l'afirmació queda limitada a ells.
- **La màscara dels replicadors detectats** és una prova finita: pot quedar-ne algun sense protegir.
- **Els zeros poden tornar:** el replicador continua deixant-ne. Per això la mesura principal és al primer cens.
- **El punt de partida (*h*₀) i el primer cens (*h*₁)** fan servir la mateixa prova de replicació, però *h*₀ és de totes
  les cel·les, i *h*₁, d'una mostra de 2.048. *h*₁ té el soroll de mostreig del cens.
- **`zeros-inert` depèn de l'ordre de les cel·les:** una cel·la es prova amb les veïnes que ja s'han netejat. L'ordre és
  fix i determinista.
- **Els braços sense zeros fan més operacions per època.** Totes les branques tenen les mateixes èpoques i les mateixes
  parelles, però no la mateixa feina de la BFF. Es desen les operacions de cada mesura.
- **El placebo no s'aparella del tot** a les cel·les saturades (§3).
- **Els bytes de dades que hi posen les transformacions** són uniformes entre els 245 valors, i no segueixen l'histograma
  del món.
- **Les proves de signes** parlen del signe de la diferència a cada món, no de la mida de l'efecte.

## 9. El preregistre

- **L'etiqueta:** anotada, `preregistre-zeros`. El missatge porta la SHA-256 d'aquests fitxers:
  - `fase2/resultats/zeros/serie/manifest.json`
  - `docs/protocol-zeros.md`
  - `fase2/zeros-confirmacio.mjs`, `fase2/zeros-serie.mjs`, `fase2/b2-serie.mjs` i `fase2/census.js`
  - `fase2/preregistre.mjs`
  - `eines/transforma.mjs` i `eines/pilot.mjs`
- **El commit de l'etiqueta** (auditoria 17):
  - **El codi:** el de la preparació (`4fa032b`), llevat de la frase de l'AU2-89 (`fase2/zeros-serie.mjs`) i de la seva prova.
  - **El missatge de l'etiqueta** porta la llista de `git diff --name-only 4fa032b` fins a l'etiqueta.
  - **Les branques** es llancen des d'una còpia d'aquest commit exacte: el codi de cada registre ha de ser el de l'etiqueta.
- **El segell:** el de l'objecte de l'etiqueta, amb OpenTimestamps.
- **Abans de la primera branca,** cal que Bitcoin l'hagi ancorat (`docs/disseny.md`, 25-10-2026).
- **Després,** cap canvi al protocol, al manifest ni als programes sense justificar-lo aquí, amb data i motiu, abans de mirar
  cap resultat.

## 10. Canvis respecte de la v0.1 (auditoria 16)

| Troballa | Què canvia |
|---|---|
| AUD-116 | **La mesura principal** passa a ser *g* = *h*₁ / *h*₀, amb *h*₀ de l'escaneig de totes les cel·les de cada braç. L'efecte immediat, a la §1. Les frases de les decisions, reescrites |
| La decisió del responsable | **Un quart braç descriptiu,** `zeros-inert`, que neteja els companys sense despertar còpies: 132 branques en lloc de 99 |
| AU2-83, AUD-117 | **La validació dels registres** és la de B2: l'esquema sencer, l'ordre, totes les mesures, els invariants del cens, l'establiment recalculat i l'ordre exacta del manifest. Un registre o un manifest sense l'estructura esperada és un problema, no una excepció |
| AU2-84, AU2-88 | **La comprovació prèvia** compara el manifest amb el disseny (els mons, el seu paper, els paràmetres, les branques i les llistes) i la procedència de cada captura. Un manifest buit o truncat no passa |
| AU2-85 | **L'envelliment de la maduració**, validat sencer. Un registre que no és el que toca és un error de la preparació |
| AU2-86 | **El placebo a les cel·les saturades:** tal com és, amb la diferència de cada món al manifest, i la prova 2 dita "aparellat cel·la per cel·la, en part a les cel·les saturades" |
| AU2-87 | **L'abast de l'afirmació, el model de la prova i la potència condicionada,** precisats (§1 i §6) |
| AUD-118 | **Abans de decidir,** `--comprova-captures` a la màquina on es decideix. A la màquina virtual hi han de ser també les captures d'origen |
| AUD-119 | **Els controls negatius tenen sostre** (§2); una sensibilitat amb els hereditaris sols; la potència a la frase quan no es rebutja |
| AUD-120 | **El manifest desa les SHA-256** dels registres de l'envelliment, dels escanejos i dels registres de les transformacions, i aquests van a git abans de l'etiqueta |

## 11. Canvis respecte de la v0.2 (auditoria 17)

| Troballa | Què canvia |
|---|---|
| AU2-89 | **La frase del no-rebuig** deia que la prova es rebutja amb una probabilitat *q* elevat al nombre de mons amb diferència. Amb empats és fals: amb 5 mons o menys no es pot rebutjar, i amb 6 depèn de l'ordre de les dues proves a Holm. Ara diu la *p* més petita possible i que la potència de la §6 no és la del resultat. Les *p*, Holm i la decisió no canvien, i la frase del rebuig tampoc. Una prova de regressió recorre tots els recomptes de 8 mons, amb l'altra prova primera i segona |
| Els dos auditors | **El commit de l'etiqueta:** el codi de la preparació, llevat d'aquesta frase (§9) |
