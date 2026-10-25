# Protocol de la prova dels zeros · treure l'enverinament des de la mateixa captura

**Versió: v0.1, esborrany (25-10-2026), per a la comprovació breu dels dos auditors.** No s'ha fet córrer cap branca.
- **D'on surt:** l'exploració de la fragilitat del món (entrada 11, `fase2/resultats/b2/fragilitat/`), l'auditoria 15 i
  la decisió del responsable de fer-ne una prova preregistrada dins dels 11 mons, amb tres braços (`docs/disseny.md`).
- **Els programes:**
  - `eines/transforma.mjs`, per a les transformacions;
  - `eines/pilot.mjs`, per al manifest, les llistes i la comprovació prèvia;
  - `fase2/zeros-confirmacio.mjs` i `fase2/zeros-serie.mjs`, per a la decisió.
- **El procediment:** després de la comprovació breu, aquest protocol, el manifest i els programes es fixen amb l'etiqueta
  anotada `preregistre-zeros` i un segell d'OpenTimestamps. **Cap branca no es llança abans que Bitcoin hagi ancorat el
  segell** (§9).

## 1. La pregunta i les hipòtesis

**El que ja en sabem** (entrada 11; auditoria 15, AUD-109 i AUD-110):
- **La baixada:** en 8 mons amb corrent, la vida baixa just després de l'establiment, del cens de *t* al primer cens de
  la branca (*t* + 250), a totes les seves branques de B2 amb corrent.
- **Els zeros:** quan s'hi estableix la vida, aquests mons tenen molts més bytes zero (del 8 al 26 %), que no hi eren
  250 èpoques abans.
- **La hipòtesi:** un autoenverinament. El replicador s'escampa deixant moltes còpies trencades plenes de zeros, i aquestes
  deixalles aturen les còpies següents.

**La pregunta:** si a la captura de *t* es canvien els zeros de les cel·les que no es repliquen per bytes de dades, la vida
baixa menys al primer cens?

**Les dues hipòtesis confirmatòries,** als 8 mons de prova:
1. **Contra `continue`:** amb els zeros canviats (`zeros-data`), la proporció d'hereditaris al primer cens és més alta que si
   el món continua sense tocar res.
2. **Contra el placebo:** també és més alta que amb el placebo (`placebo-cell`), que canvia el mateix nombre de bytes de
   dades a cada cel·la i deixa els zeros.

**L'abast de l'afirmació:** aquests 8 mons, no mons nous.
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

## 3. Els braços

| Braç | Què fa (`eines/transforma.mjs`) |
|---|---|
| `continue` | La captura tal com és |
| `zeros-data` | Els bytes zero de les cel·les de fora dels replicadors detectats passen a un byte de dades a l'atzar: un dels 245 valors que no són 0 ni cap instrucció. El mapa d'instruccions del món no canvia |
| `placebo-cell` | A cada cel·la de l'abast, tants bytes de dades com zeros té passen a un altre byte de dades. Si una cel·la té més zeros que bytes de dades, els canvia tots, i el registre en diu la diferència. Els zeros i el mapa d'instruccions no canvien |

- **Els replicadors detectats:** les cel·les que passen la prova de replicació, sola o en context, provades totes una per
  una. És una prova finita i conservadora. El registre de cada captura en desa la SHA-256 de la màscara, les cel·les
  protegides i els zeros protegits.
- **L'atzar de la transformació:** la llavor del món + 600.000. És la mateixa a `zeros-data` i `placebo-cell`, i per tant
  fan servir exactament les mateixes cel·les.
- **Els invariants** els comprova l'eina, i si no es compleixen, no escriu res.

## 4. Les branques

- **La condició:** corrent 0,01, la d'origen d'aquests mons. Món de 512 × 256, radi 2, generador v2, cens v3 cada 250
  èpoques, amb una mostra de 2.048.
- **Les llavors de continuació:** *K* = 3, la del món + 400.000, + 500.000 i + 700.000. Són les mateixes als tres braços.
- **L'horitzó:** *H* = 2.000 èpoques, fix i igual per a totes les branques.
- **L'ordre:** el de `eines/pilot.mjs` (`branchLines`).
- **La mida:** 11 mons × 3 braços × 3 llavors = 99 branques.
- **El cost:** de 2 a 5 h per branca, perquè el braç sense zeros va més a poc a poc. En total, de 200 a 500 h: d'un a dos
  dies, amb 6 branques alhora al PC i 4 a la màquina virtual.

**Per què *K* = 3:** amb 8 mons, la prova només es rebutja si tots els mons amb una diferència la tenen a favor (§6). Una
llavor més fa que la mitjana de cada món tingui menys soroll.

## 5. La mesura

**La principal: *h*₁, la proporció d'hereditaris al primer cens de la branca, a l'època *t* + 250.**
- **Per què:** és la predicció directa de la hipòtesi, i passa abans que els zeros tornin.
- **La mateixa mostra:** el cens té una llavor fixa, i al primer cens és la primera vegada que se'n fa servir l'atzar. La
  mostra de 2.048 cel·les és, doncs, la mateixa als tres braços d'un món.
- **El valor d'un món i un braç:** la mitjana de les seves 3 llavors. El món és la unitat.

**Les secundàries, descriptives:**
- la mitjana dels censos 2 a 4;
- la pèrdua sostinguda R2, el temps fins a la pèrdua (amb censura a *H*) i la recuperació;
- la proporció al cens final;
- els zeros al llarg del temps: els bytes més freqüents del registre de text, cada 100 èpoques.

## 6. L'anàlisi

**Les dues proves,** als 8 mons de prova:
- **La prova 1:** *D*₁ = *h*₁(`zeros-data`) − *h*₁(`continue`), a cada món.
- **La prova 2:** *D*₂ = *h*₁(`zeros-data`) − *h*₁(`placebo-cell`), a cada món.
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

**La potència.** Si a cada món la diferència surt a favor amb una probabilitat *q*, la prova es rebutja amb una probabilitat
*q*⁸:

| *q* | 0,90 | 0,95 | 0,98 | 0,99 |
|---|---|---|---|---|
| Potència | 43 % | 66 % | 85 % | 92 % |

Si la intervenció evita la baixada als 8 mons on passa sempre, *q* serà molt a prop d'1. Si només hi ajuda una mica, la prova
pot quedar no concloent.

**Com es comunica:**
- **Si es rebutja H₀:** als mons de prova, entre els que tenen una diferència, predominen els que tenen més hereditaris al
  primer cens amb `zeros-data` que amb l'altre braç. Les frases surten de `decisionLines()` (`fase2/zeros-serie.mjs`).
- **Si no es rebutja:** no concloent, amb la potència d'aquesta secció.
- **El que no diu:** res de mons nous, ni de la mida mitjana de l'efecte.

**Les descriptives:**
- `placebo-cell` contra `continue`, als mons de prova;
- els 3 controls negatius, un per un;
- les mesures secundàries de cada braç.

## 7. L'execució

1. **El codi:** el commit del preregistre, desplegat a la màquina virtual amb `eines/desplega-vm.sh`. Les actualitzacions de
   Windows, pausades.
2. **La preparació:** `node eines/pilot.mjs zeros --prepara`, abans del preregistre.
   - **Què fa:** les 33 transformacions.
   - **Què escriu:** el manifest (`fase2/resultats/zeros/serie/manifest.json`, amb la prova, l'etiqueta i les SHA-256 de les
     captures d'origen i de les transformades) i les llistes de les dues màquines.
   - **On va:** el manifest i les llistes van a git, i entren al commit de l'etiqueta.
3. **El preregistre:** l'etiqueta i el segell (§9). S'espera l'ancoratge a Bitcoin.
4. **La comprovació prèvia,** a cada màquina, amb les captures transformades copiades: `node eines/pilot.mjs zeros --comprova`.
5. **El llançament:** `eines/llanca-lot.sh`, des de la carpeta del commit.
6. **Durant la sèrie:** només `bash eines/seguiment.sh --agregat`.
   - **Si una màquina s'atura,** es torna a llançar el mateix lot, i les branques acabades se salten.
7. **La decisió:** `node fase2/zeros-confirmacio.mjs --decideix fase2/resultats/zeros/serie/branques`, des d'una còpia del
   commit de l'etiqueta, amb `NODE_OPTIONS` buit. La sortida es desa tal com surt.

## 8. Limitacions conegudes

- **Els mons es van triar després de veure les dades,** i l'afirmació queda limitada a ells.
- **La màscara dels replicadors detectats** és una prova finita: pot quedar-ne algun sense protegir.
- **Els zeros poden tornar:** el replicador continua deixant-ne. Per això la mesura principal és al primer cens.
- **El braç sense zeros fa més operacions per època.** Totes les branques tenen les mateixes èpoques i les mateixes parelles,
  però no la mateixa feina de la BFF. Es desen les operacions de cada mesura.
- **El placebo no s'aparella del tot** a les cel·les amb més zeros que bytes de dades. El registre en diu la diferència (al
  B2042, el 2,9 %).
- **Els bytes de dades que hi posa la transformació** són uniformes entre els 245 valors, i no segueixen l'histograma del món.
- **Les proves de signes** parlen del signe de la diferència a cada món, no de la mida de l'efecte.

## 9. El preregistre

- **L'etiqueta:** anotada, `preregistre-zeros`. El missatge porta la SHA-256 d'aquests fitxers:
  - `fase2/resultats/zeros/serie/manifest.json`
  - `docs/protocol-zeros.md`
  - `fase2/zeros-confirmacio.mjs` i `fase2/zeros-serie.mjs`
  - `fase2/preregistre.mjs`
  - `eines/transforma.mjs` i `eines/pilot.mjs`
- **El segell:** el de l'objecte de l'etiqueta, amb OpenTimestamps.
- **Abans de la primera branca,** cal que Bitcoin l'hagi ancorat (`docs/disseny.md`, 25-10-2026).
- **Després,** cap canvi al protocol, al manifest ni als programes sense justificar-lo aquí, amb data i motiu, abans de mirar
  cap resultat.
