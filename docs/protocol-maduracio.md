# Protocol de la sèrie de la maduració · l'edat i la composició de la sopa

**Versió: v0.5 (30-10-2026), per al preregistre.** El manifest és preparat (`d775174`, 29-10-2026) i comprovat (auditoria 23),
i no s'ha fet córrer cap branca. El que canvia de la v0.4, amb l'auditoria 23, és a la §10.
- **D'on surt:**
  - el pilot de la maduració (l'entrada 12 del quadern i `fase2/resultats/maduracio/pilot/acta.md`);
  - l'auditoria 19, i la decisió del responsable del 27-10-2026 (`docs/disseny.md`, §5);
  - l'auditoria 20, i la decisió del responsable del 27-10-2026: els llindars calibrats per *m* (§6);
  - l'auditoria 21, i la decisió del responsable del 28-10-2026: la taula certificada, i una revisió de les correccions abans
    de preparar el manifest (§6, §7);
  - l'auditoria 22: el GO dels dos auditors per preparar el manifest, i la correcció de l'AUD-132 (§7, §8);
  - l'auditoria 23: el manifest, comprovat pels dos auditors, i la correcció de la barrera de `--prova` abans de l'etiqueta
    (AU2-100, AUD-133; §7 a §9).
- **Els programes:**
  - `eines/pilot.mjs`, l'experiment `serie`: l'envelliment, la preparació, el manifest i les comprovacions;
  - `eines/transforma.mjs`, per a les transformacions i els escanejos;
  - `fase2/maduracio-confirmacio.mjs` i `fase2/maduracio-serie.mjs`, per a la decisió;
  - `eines/llindars-maduracio.mjs`, per als llindars calibrats i la seva certificació, i els seus fitxers,
    `fase2/maduracio-llindars.json` i `fase2/maduracio-llindars-certificat.json` (§6);
  - `eines/potencia-maduracio.mjs`, per a la potència (§6).
- **El procediment:**
  1. les auditories 20 a 22 van revisar les versions de la v0.1 a la v0.3, i les correccions;
  2. s'envelleixen els mons, i, després del GO de l'auditoria 22, la preparació escriu el manifest (§7);
  3. una comprovació breu del manifest i de la correcció de l'AUD-132 (auditoria 23), i una de la correcció de la barrera i
     d'aquesta versió (auditoria 24);
  4. el protocol, el manifest i els programes es fixen amb l'etiqueta anotada `preregistre-maduracio` i un segell
     d'OpenTimestamps. **Cap branca no es llança abans que Bitcoin hagi ancorat el segell** (§9).

## 1. La pregunta i les hipòtesis

**El que ja en sabem:**
- **La pista (AUD-64):** a les dades de la llei 2, mirades després, un món quiet sense vida a l'època 8.000 s'hi estableix
  en les 8.000 èpoques següents el doble de sovint que un món nou. És el 22 % (16 de 72) contra el 10 % (8 de 80).
- **El pilot** (22 mons, 5 braços i *K* = 2; exploratori, entrada 12):
  - **Els ritmes:** 27 % a `continue`, 27 % a `shuffle-all` i 18 % a `reinit`.
  - **Món a món:** `continue` contra `reinit` dona 7 a 3, amb 12 d'iguals, i `shuffle-all` contra `reinit`, 10 a 4, amb 8
    d'iguals.
  - **El valor:** són comparacions mirades després, sense valor de prova.
- **La composició (AUD-122):** les sopes envellides tenen un 11,4 % de bytes d'instrucció, contra el 3,9 % d'una sopa a
  l'atzar. Barrejar-les reparteix aquestes instruccions, i a l'instant ja hi ha més cel·les que es repliquen.

**La pregunta:** en un món quiet que arriba sense vida a l'època 8.000, la vida s'hi estableix més sovint en les 8.000
èpoques següents si es conserva la sopa envellida que si es canvia per una sopa nova? I si se'n conserva només l'histograma
de bytes, barrejat?

**Les dues hipòtesis confirmatòries,** triades després del pilot (auditoria 19):
1. **(b) L'edat:** el ritme d'establiment dins de *H* és més alt amb `continue` que amb `reinit`.
2. **(c) La composició:** el ritme d'establiment dins de *H* és més alt amb `shuffle-all` que amb `reinit`.

**La hipòtesi nul·la de cada prova** és la del ritme: el mateix ritme d'establiment, o un de més baix, al braç que es prova
que a `reinit`, sigui quina sigui la concordança entre les llavors de cada braç (AU2-94). No és la de dos braços
intercanviables, que demanaria més.

**L'abast de l'afirmació:**
- **La cohort:** mons quiets nous, sense establiment fins a l'època 8.000 i sense cap cel·la hereditària a l'escaneig
  d'aquella època (§2). No és una llei de tots els mons ni de l'edat en general (auditor 2).
- **Tractaments totals** (auditor 2):
  - **(b)** compara conservar la sopa envellida amb substituir-la per una de nova.
  - **(c)** compara una sopa nova amb la composició envellida, barrejada, i la seva propensió immediata. Inclou els
    replicadors que crea la barreja a l'instant (AUD-121, AUD-122).
  - **Cap de les dues** aïlla un mecanisme.
- **Per què és causal dins de la cohort:** els tres braços d'un món parteixen de la mateixa captura i tenen les mateixes
  llavors de continuació. Només els separa la transformació.
- **El que no s'afirmarà** (AUD-127):
  - que l'estructura no hi afegeix res: `continue` contra `shuffle-all` és descriptiu, sense prova d'equivalència;
  - que la composició explica l'efecte de l'edat.

## 2. Els mons

- **Les llavors:** de la 6001 a la 6400, en aquest ordre. Cap no s'havia fet servir: la llei 2 va de la 1001 a la 1080 i de
  la 2001 a la 2080, i el pilot, de la 5001 a la 5024. Els mons del pilot no hi entren.
- **L'envelliment:** `node eines/pilot.mjs serie --envelliment`, les ordres de cada món fins a l'època 8.000.
  - **La condició:** la del pilot: 512 × 256, radi 2, corrent 0, generador v2 i cens v3 cada 250 èpoques, amb una mostra de
    2.048 cel·les.
  - **L'aturada:** `--stop-after-event 0`, de manera que un món que s'estableix abans de l'època 8.000 s'atura.
- **Quants se n'envelleixen:** els 180 primers, de la 6001 a la 6180.
  - **Per què 180:** al pilot en van quedar 22 de 24. Amb aquesta proporció, se n'esperen uns 165 d'inclosos.
  - **Si no n'hi ha prou:** s'envelleixen els següents de la llista, en ordre (`--envelliment --mons N`).
- **La cohort (AU2-82):** els mons sense establiment fins a l'època 8.000.
- **L'exclusió per vida ja present (AUD-111):** s'escanegen totes les cel·les de cada món a l'època 8.000 (`eines/transforma.mjs
  --scan`). S'exclou el món si n'hi ha alguna d'hereditària, sola o en context.
- **La regla d'inclusió** (auditor 1): entren a la sèrie els 150 primers mons de la llista que passen totes dues regles.
  - **Els que vénen després** no s'hi fan servir, encara que s'hagin envellit, i no van al manifest.
  - **El manifest** porta tots els mons de la llista fins al 150è inclòs, amb la raó de cada exclusió.
  - **L'escaneig** es fa per rondes, tants mons com en falten. No se n'escaneja cap de més.

## 3. Els braços

| Braç | Què fa (`eines/transforma.mjs`) | Paper |
|---|---|---|
| `continue` | La captura tal com és | La prova (b) |
| `shuffle-all` | Es barregen tots els bytes del món, i només se'n conserva l'histograma | La prova (c) |
| `reinit` | Una sopa nova a l'atzar | La referència de totes dues proves |

- **L'atzar de la transformació:** la llavor del món + 600.000, independent del de la continuació.
- **El punt de partida de cada braç:** l'escaneig de totes les cel·les de cada captura, amb les hereditàries soles i les de
  context. Va al manifest, i és un descriptiu predefinit (auditor 2).
  - **Al pilot,** `shuffle-all` començava amb 169 cel·les hereditàries (10 soles, a 9 mons), i `reinit`, amb 8 (4 soles).
- **Els braços del pilot que no hi són:**
  - **`shuffle-programs`:** no hi va mostrar cap diferència.
  - **`shuffle-within`:** era el contrast més extrem, però es va veure després, i no es converteix en prova (auditor 2).
- **Cap braç inert** (auditoria 19). Hi estem d'acord tots tres: la prova (c) inclou els replicadors que crea la barreja.

## 4. Les branques

- **La condició:** la del pilot: corrent 0, 512 × 256, radi 2, generador v2 i cens v3 cada 250 èpoques.
- **Les llavors de continuació:** *K* = 2, la del món + 400.000 i + 500.000. Són les mateixes als tres braços.
- **L'horitzó:** *H* = 8.000 èpoques, de l'època 8.000 a la 16.000.
- **L'aturada:** cada branca s'atura quan s'hi estableix la vida (`--stop-after-event 0`).
- **L'establiment:** el criteri de la llei 2 (`fase2/census.js`): almenys l'1 % de la mostra d'hereditaris, en dos censos
  seguits.
- **Les captures: cap branca no en desa** (sense `--save`). Per què, en lloc d'una carpeta per branca (AUD-124, AU2-93):
  - **cap nom no pot col·lidir,** perquè no se n'escriu cap;
  - **no hi ha cap carpeta que reveli res durant la sèrie.** Al pilot, comptar les captures en va donar informació parcial
    (l'acta i l'auditoria 19);
  - **a la màquina virtual no hi caben:** amb el ritme del pilot, hi serien unes 200 captures més de 8 MB (1,7 GB), a més de les
    dels braços;
  - **si després en cal alguna,** es regenera exactament amb l'ordre de la branca del manifest, al seu commit, i amb
    `--save … --save-what event`.
    - **Quan és bona** (auditor 1): només si el registre de la branca regenerada té els mateixos censos i la mateixa empremta
      final que el de la sèrie.
    - **Comprovat** (auditoria 20): una branca establerta del pilot, `5017-shuffle-all-a`, refeta amb el codi de la v0.1, sense
      `--save` i amb `--save`. Dona el mateix registre que el del pilot, línia a línia, i les tres captures de l'establiment
      tenen la SHA-256 de les del pilot.
- **L'ordre de cada branca:** la de `eines/pilot.mjs` (`branchLines`). El manifest la desa exacta.
- **La mida:** 150 mons × 3 braços × 2 llavors = 900 branques.
- **Les màquines:** el PC fa 3 de cada 5 mons, i la màquina virtual, 2. És la proporció de branques alhora de cada una (6 i 4).
  Són 540 branques al PC i 360 a la màquina virtual.
- **El cost,** amb les dades del pilot:
  - **Les branques:** 0,69 h per branca a `continue`, 0,86 h a `shuffle-all` i 0,61 h a `reinit`. Són unes 650 h.
  - **L'envelliment:** 0,45 h per món, unes 81 h per a 180 mons.
  - **Els escanejos:** uns 2,5 minuts cadascun. Són uns 165 de l'edat i 450 dels braços: unes 26 h.
  - **En total:** unes 760 h, uns 4 dies amb 6 processos alhora al PC i 4 a la màquina virtual.

## 5. La mesura

- **La principal:** per a cada món i braç, el nombre de branques on la vida s'hi estableix dins de *H*: 0, 1 o 2.
- **La diferència d'un món:** *D*b = *n*(`continue`) − *n*(`reinit`), i *D*c = *n*(`shuffle-all`) − *n*(`reinit`). Van de −2
  a 2.
- **El ritme d'un braç:** el total d'establiments, dividit per les 300 branques del braç.
- **El que compara la prova:** la suma de les diferències de tots els mons. És 300 vegades la diferència dels dos ritmes.

**Els descriptius, predefinits** (`fase2/maduracio-serie.mjs`, `analyse`):
- **El ritme de cada braç,** amb dos intervals del 95 % (AU2-90):
  - el de Clopper-Pearson, que suposa que les branques són independents;
  - el d'un bootstrap per món (10.000 remostres, llavor 20261027), que no ho suposa.
- **La diferència de ritmes de cada prova,** amb l'interval del bootstrap per món.
- **`continue` contra `shuffle-all`:** la diferència de ritmes, amb el seu interval, i els mons a favor, en contra i iguals.
  Sense cap prova ni cap afirmació d'equivalència (AUD-127).
- **El punt de partida:**
  - l'escaneig de cada braç: les cel·les que es repliquen i les hereditàries, soles i en context;
  - els establiments, separats per si el món tenia alguna hereditària sola al començament del braç. És una partició dels mons
    tal com són, no un efecte (AU2-91).
- **El temps:**
  - la RMST de cada braç, restringida a *H*, que compta totes les branques;
  - la mediana de *T* de les branques establertes, dita com a tal. No diu que un braç sigui més ràpid (AU2-91).
- **La concordança:** entre les llavors (la *rho*, i la *phi* de cada braç) i entre els braços.
- **El primer cens amb algun hereditari.**
- **El cost:** per braç i per màquina.
- **Els establiments de cada món,** tots.

## 6. L'anàlisi

**Les dues proves:**
- **(b):** les 150 diferències *D*b. **(c):** les 150 diferències *D*c.
- **El mètode: la permutació de signes exacta, unilateral, sobre la suma de les diferències, amb els llindars de Holm calibrats
  per *m*.** La permutació és la proposta de l'auditor 1 (auditoria 19), i els llindars calibrats, la resposta a l'AUD-128 i
  l'AU2-94 (auditoria 20). Totes dues són decisions del responsable.
  - **La *p*:** count / 2^*m*. És la proporció de les 2^*m* assignacions de signes (*m*, els mons amb diferència) amb una suma
    igual o més gran que l'observada.
  - **Com es calcula:** exactament, per convolució dels valors absoluts, amb enters sense límit.
  - **Els mons sense diferència** no hi compten: no canvien la suma.
- **Els llindars calibrats** (`fase2/maduracio-llindars.json`, de `node eines/llindars-maduracio.mjs --calcula`):
  - **Què són:** per a cada *m*, de 0 a 150, i per a cada pas de Holm, α/2 = 1/80 i α = 1/40, un recompte *K*(*m*). Al pas *j* es
    rebutja si count ≤ *K*<sub>*j*</sub>(*m*). Amb *K* = −1, no es pot rebutjar.
  - **Com es trien:** cada *K*<sub>*j*</sub>(*m*) és el més gran amb què la probabilitat de rebutjar, sabent *m*, no passa
    d'α<sub>*j*</sub>·(1 − 10⁻⁴) amb cap distribució de les diferències no nul·les amb mitjana 0.
  - **La cerca del màxim:** a les dues arestes de la forma que concentra els −2 i reparteix els +1, on són els màxims, en una
    graella de 101 × 101 de tota la regió, i amb una cerca local des dels deu millors punts. El marge de 10⁻⁴ és per a l'error
    de la cerca.
  - **El càlcul,** amb enters exactes per als recomptes i només sumes i productes per a les probabilitats: és el mateix a
    qualsevol màquina. La taula va amb l'etiqueta, i `--comprova` la torna a calcular.
  - **La certificació** (AU2-99, auditoria 21; `node eines/llindars-maduracio.mjs --certifica`, al fitxer
    `fase2/maduracio-llindars-certificat.json`): una cota superior rigorosa del màxim de cada fila, que no depèn de cap cerca.
    - **El mètode:** les distribucions de les diferències no nul·les amb mitjana 0 són un quadrilàter, i la diagonal de les
      simètriques el parteix en dos triangles. A cada triangle, la probabilitat de rebutjar, sabent *m*, és exactament un
      polinomi de Bernstein, i el seu màxim no passa del coeficient més gran. Es parteixen els triangles fins que la cota
      superior i la inferior queden a menys d'una milionèsima.
    - **El resultat:** les 302 cotes són com a molt α<sub>*j*</sub>·(1 − 10⁻⁴), el criteri de la taula. La més justa és la
      de *m* = 108 al pas 2: el suprem és el 2,499740 % (0,999896·α).
    - **Cada *K* és el més gran:** a les 289 files on hi ha un recompte més fins al nominal, el següent ja passa del criteri.
      En tres, *m* = 55 al pas 2, 121 al pas 1 i 140 al pas 2, seria vàlid, i només el marge l'exclou.
    - **Una altra certificació, independent:** la de l'auditor 1, amb el mateix mètode i el seu codi, hi coincideix
      (auditoria 21).
    - **La coma flotant:** el càlcul és en coma flotant (Float64), amb un marge relatiu de 10⁻⁹ sobre cada cota, i sense una
      demostració formal de l'error d'arrodoniment (auditor 2, auditoria 22). Només fa sumes de nombres no negatius, productes
      i meitats, i l'error relatiu és de l'ordre de 10⁻¹² (auditor 1). El marge més just, el de *m* = 108 al pas 2, és de
      4·10⁻⁶ relatiu.
  - **La taula certificada:** la seva SHA-256 és fixada a `fase2/maduracio-serie.mjs` i al manifest. La preparació, les
    comprovacions i la decisió no n'accepten cap altra (AU2-99).
- **La correcció de Holm,** amb α = 0,025 per a la família, i els llindars calibrats:
  - **Al primer pas:** cada prova es compara amb el seu *K*₁(*m*);
  - **Al segon pas:** si una es rebutja, l'altra es compara amb el seu *K*₂(*m*).
- **Els mons són la unitat.** Les dues llavors d'un món i d'un braç es compten juntes, a la seva diferència.

**Per què els llindars calibrats** (AUD-128, AU2-94). La permutació de signes és exacta si els dos braços d'un món són
intercanviables. La hipòtesi d'aquesta sèrie, però, és la del ritme (§1). Si dos braços tenen el mateix ritme i una
concordança diferent, un concentra els establiments en pocs mons i l'altre els reparteix. Les diferències ja no són
simètriques, i amb els llindars de Holm de sempre la prova rebutja més que α.
- **El cas pitjor de la regla nominal** (`node eines/llindars-maduracio.mjs --suprem`): almenys el 2,31 % amb α/2 = 1,25 %, i
  el 3,50 % amb α = 2,5 %. Les cotes superiors en són el 2,67 % i el 4,15 %.
  - **On és:** amb pocs mons amb diferència (P(*D* ≠ 0) d'un 6 %), i *D* a −2, 0 i +1.
  - **La família:** fins al 4,6 %.
- **Per què són vàlids els llindars calibrats:**
  - **Els mons són independents** (auditor 2). Les llavors es fixen abans, la regla d'inclusió només mira l'envelliment de
    cada món, i la decisió s'atura si en falta cap registre. La validesa no cobreix una dependència entre mons.
  - **Sota la nul·la del ritme:** les diferències dels mons són independents i tenen mitjana 0.
  - **Sabent *m*:** les diferències no nul·les són independents i tenen una mateixa distribució amb mitjana 0. La
    concordança i la dependència entre els braços d'un món només canvien aquesta distribució, i la calibració les té en compte
    totes.
  - **Si la prova és vàlida per a cada *m*, ho és sempre.**
  - **Sabent *m*, una nul·la amb un ritme més baix** rebutja encara menys, perquè el recompte no creix mai quan una diferència
    no nul·la creix.
  - **Entre *m* diferents, la decisió no és monòtona** (AUD-130). Amb 15 mons amb diferència, es pot rebutjar una prova, i si
    un món més passa de 0 a +1, ja no: la *p* baixa, del 0,320 % al 0,208 %, però el llindar baixa més, del 0,320 % de *m* = 15
    al 0,171 % de *m* = 16. És el preu de calibrar per a cada *m*, i no afecta la validesa (§8).
  - **Holm, amb aquests llindars,** deixa la família com a molt al 2,5 %, sigui quina sigui la dependència entre les dues
    proves.
- **Els llindars de la taula:**
  - **Al primer pas,** per als *m* de 60 a 100, els habituals amb els efectes de la potència, el llindar, *K*/2^*m*, va del
    0,64 % a l'1,05 %, i és del 0,89 % de mitjana. Amb 10 mons o menys amb diferència, no es pot rebutjar.
  - **Al segon pas:** de l'1,61 % al 2,30 %, i del 2,04 % de mitjana. Amb 9 mons o menys, no es pot rebutjar.
  - **El cas pitjor dels calibrats, sense saber *m*** (`--suprem`; AUD-131): entre l'1,15 % i l'1,17 % al primer pas, i el
    2,43 % al segon, amb tots els mons amb diferència. La cota inferior surt d'una cerca, i la superior, de les cotes
    certificades de cada *m*.
- **Una sola α' per a tots els *m*** costaria més potència, i depèn del criteri (AUD-130):
  - **amb la validesa sense saber *m*,** hauria de ser més petita que 1/256, el 0,39 % (el càlcul de l'auditoria 20);
  - **amb el criteri de la taula, sabent *m*,** més petita que 2⁻¹⁰ al primer pas: amb 10 mons amb diferència, el resultat més
    extrem, amb la forma del cas pitjor, té una probabilitat de (2/3)¹⁰, l'1,73 %.

**Per què no la prova de signes** (auditoria 19). La de signes compta els mons a favor i en contra, però no la mida de
cada diferència. Si la concordança entre les dues llavors canvia d'un braç a l'altre, rebutja massa sovint, encara que
els ritmes siguin iguals.

**La validesa, exacta** (`node eines/llindars-maduracio.mjs --validesa`). Dos braços amb el mateix ritme, i la probabilitat de
rebutjar de cada prova, amb els llindars nominals / els calibrats:

| Dos braços amb el mateix ritme | Concordances | α/2 = 1,25 % | α = 2,5 % |
|---|---|---|---|
| 20 % | 0 i 0,4 | 1,14 % / 0,78 % | 2,20 % / 1,77 % |
| 20 % | 0,4 i 0 | 0,85 % / 0,56 % | 1,80 % / 1,40 % |
| 27 % | 0 i 0,4 | 1,11 % / 0,79 % | 2,19 % / 1,79 % |
| 10 % | 0 i 0,8 | 1,39 % / 0,81 % | 2,55 % / 1,83 % |
| 18 % | −0,2 i 0,8 | 1,39 % / 1,01 % | 2,55 % / 2,09 % |
| 2 % (l'escenari de l'auditor 2) | 0 i 1 | 2,18 % / 0,21 % | 3,39 % / 0,48 % |
| 5 % | 0 i 1 | 1,72 % / 0,76 % | 2,92 % / 1,67 % |
| 20 % | 0 i 1 | 1,30 % / 0,92 % | 2,44 % / 1,99 % |
| La forma de (c) al pilot, amb mitjana 0 | — | 1,37 % / 1,06 % | 2,56 % / 2,17 % |
| Tots els mons amb diferència, amb *D* = +1 o −2 | — | 1,36 % / 0,84 % | 3,25 % / 2,14 % |
| **El cas pitjor, sense saber *m*** (`--suprem`) | — | **2,31–2,67 % / 1,15–1,17 %** | **3,50–4,15 % / 2,43 %** |

- **Al pilot hi era:** les concordances per braç anaven de −0,35 (`shuffle-all`) a 0,41 (`reinit`).
- **Què passava:** `reinit` concentrava els establiments en pocs mons, i `shuffle-all`, no.
  - **Món a món,** (c) donava 10 a favor i 4 en contra, però amb diferències de +1 a 10 mons, de −1 a 2 i de −2 a 2.
  - **La suma** és +4, que és el 27 % contra el 18 %.

**La potència** (`node eines/potencia-maduracio.mjs --familia`; 4.000 repeticions, llavor 20261028), amb els llindars
calibrats:
- **L'efecte de la potència:** la meitat del ritme, és a dir, 27 % a `continue` i a `shuffle-all`, contra 13,5 % a `reinit`.
  - **D'on surt:** la llei 2 donava el 22 % contra el 10 %, una dada d'abans del pilot. Les proporcions del pilot en fan de
    referència.
  - **L'efecte del pilot,** 9 punts (27 % contra 18 %), també es declara.
- **El model:** el de les auditories 15 a 19.
  - **Les llavors:** amb probabilitat *rho*, les dues llavors d'un món i un braç fan el mateix, i si no, són independents.
  - **Els braços:** són independents. Les dues proves són contra `reinit`, una sopa nova que no té res a veure amb el món, i
    al pilot les llavors comunes no correlacionen els braços (auditoria 19).

| Ritmes | *rho* | (b) | (c) | Totes dues | Almenys una |
|---|---|---|---|---|---|
| 27 % i 27 % contra 13,5 % | 0,03 | 96 % | 96 % | 94 % | 99 % |
| 27 % i 27 % contra 13,5 % | 0,3 | 91 % | 91 % | 87 % | 95 % |
| 27 % i 27 % contra 18 % (el pilot) | 0,03 | 61 % | 60 % | 50 % | 70 % |
| 27 % i 27 % contra 18 % (el pilot) | 0,3 | 48 % | 49 % | 38 % | 60 % |

- **El cost dels llindars calibrats,** amb la mateixa llavor que la taula de la v0.1, que tenia els nominals:
  - **amb la meitat del ritme,** rebutjar totes dues proves passa del 95 % al 94 % (*rho* = 0,03), i del 90 % a l'87 %
    (*rho* = 0,3);
  - **amb l'efecte del pilot,** del 55 % al 50 %, i del 43 % al 38 %.
- **Si l'efecte és com el del pilot,** un "no concloent" és probable (auditor 1).

**Com es comunica:**
- **Si es rebutja (b):** "A la cohort (mons quiets sense vida a l'època 8.000, sense cap cel·la hereditària), la vida s'hi
  estableix més sovint en les 8.000 èpoques següents si es conserva la sopa envellida que amb una sopa nova (*X* de 300
  branques contra *Y*; *p* = …, llindar calibrat de Holm …). És l'efecte total de conservar la sopa d'aquests mons, no d'un
  mecanisme concret."
- **Si es rebutja (c):** la mateixa frase, amb "si es conserva l'histograma de bytes de la sopa envellida, barrejat,". En lloc de
  la de l'abast de (b), "És l'efecte total…", diu: "Inclou el que la barreja crea a l'instant, com els replicadors del
  començament: no aïlla la composició." (AUD-129)
- **Si no es rebutja:** "no concloent. La prova no permet afirmar que, a la cohort, la vida s'hi estableixi més sovint … que
  amb una sopa nova (…). No vol dir que s'hi estableixi igual."
  - **Quan cap resultat no arriba al llindar calibrat** del pas en què es compara la prova, la frase diu que la prova no es
    podia rebutjar (AUD-129, AU2-95). Passa amb 10 mons o menys amb diferència al primer pas de Holm, i amb 9 o menys al segon.
- **Sempre:** el ritme de cada braç amb els dos intervals, i la diferència de ritmes de cada prova amb el seu.
- **Les frases** surten de `decisionLines()` (`fase2/maduracio-serie.mjs`).

## 7. L'execució

1. **El codi:** el merge de la PR d'aquest protocol, amb la taula dels llindars i el seu certificat, desplegat a la màquina
   virtual amb `eines/desplega-vm.sh`. Les actualitzacions de Windows, pausades.
2. **L'envelliment:** `node eines/pilot.mjs serie --envelliment`, amb `eines/llanca-lot.sh`, des d'una còpia d'un commit amb el
   mateix simulador. Pot començar abans de la preparació: hi coincideixen tots dos auditors (auditories 20 i 21).
   - **On:** al PC.
   - **Si la màquina virtual és lliure:** una part de la llista hi pot anar. Els seus registres i les seves captures es copien al
     PC, amb les SHA-256 comprovades.
   - **Durant l'envelliment:** només `bash eines/seguiment.sh --agregat`.
3. **La preparació:** `node eines/pilot.mjs serie --prepara`, al PC, des d'un commit net, després del GO de l'auditoria 22, que
   tots dos auditors van donar el 29-10-2026.
   - **Què fa:**
     - comprova que la taula dels llindars sigui la certificada, per la SHA-256, i que hi hagi el seu certificat, amb totes
       les cotes com a molt α (AU2-99);
     - torna a calcular el certificat sencer, fila a fila, i s'atura si no és el del fitxer (auditor 1, auditoria 22);
     - valida l'envelliment sencer;
     - escaneja els mons envellits, en ordre, i hi aplica la regla d'inclusió;
     - transforma les captures dels 150 mons, que són 450, i les escaneja;
     - escriu el manifest i les llistes de les dues màquines.
   - **On va:** el manifest, els registres de l'envelliment, els escanejos, els registres de les transformacions i les llistes,
     a git. Les captures, no: es regeneren exactament.
4. **La comprovació breu** del manifest (auditoria 23), i la de la correcció de la barrera de `--prova` (auditoria 24).
5. **El preregistre:** l'etiqueta i el segell (§9). S'espera l'ancoratge.
   - **Abans de l'etiqueta,** a la còpia del commit que s'etiquetarà: `node eines/llindars-maduracio.mjs --comprova-certificat`
     (auditor 2, auditoria 22).
   - **La seva sortida,** al missatge de l'etiqueta i, en un commit posterior, a l'acta (auditor 1, auditoria 23). Si l'acta
     canviés abans de l'etiqueta, el commit etiquetat ja no seria el revisat.
6. **Les captures de la màquina virtual:** les dels seus 60 mons, les envellides i les transformades (uns 1,9 GB), copiades
   amb les SHA-256 comprovades.
7. **La comprovació prèvia,** a cada màquina: `node eines/pilot.mjs serie --comprova --maquina pc|vm`.
   - **El manifest,** contra el disseny.
   - **Les captures dels mons de la seva llista,** contra el manifest. Els registres i els escanejos de tots els mons, que són a
     git. L'escaneig de l'edat de cada món, lligat a la seva captura per la SHA-256 i al codi de la preparació (auditor 1,
     auditoria 20).
   - **Les llistes:** cadascuna, exactament la seva part dels mons inclosos, en ordre: 540 branques al PC i 360 a la màquina
     virtual (AU2-97).
   - **La taula dels llindars:** la certificada, amb el seu certificat (AU2-99).
   - **Que cap branca no hagi començat.**
8. **El llançament:** `eines/llanca-lot.sh`, des de la carpeta del commit de l'etiqueta.
   - **Just després:** el `code` d'una branca de cada màquina (auditor 1, auditoria 18), sense llegir-ne res més.
9. **Durant la sèrie:** només `bash eines/seguiment.sh --agregat`.
   - **Si una màquina s'atura,** es torna a llançar el mateix lot, i les branques acabades se salten.
10. **Abans de decidir:** `node eines/pilot.mjs serie --comprova-captures` al PC, amb totes les captures.
    - **A la màquina virtual,** abans d'esborrar-ne les captures: `node eines/pilot.mjs serie --comprova-captures --maquina vm`
      (auditor 1, auditoria 20).
11. **La decisió:** `node fase2/maduracio-confirmacio.mjs --decideix fase2/resultats/maduracio/serie/branques`.
    - **On:** des d'una còpia del commit de l'etiqueta, amb `NODE_OPTIONS` buit.
    - **La sortida** es desa tal com surt.
    - **El programa no decideix res si hi ha cap problema:** si el manifest no és coherent, si la taula dels llindars no és la
      certificada (per la SHA-256) o no té l'estructura esperada, o si algun registre no és exactament el que n'espera, en
      llista els problemes i s'atura.
    - **`--prova` no llegeix cap registre de la sèrie** (AU2-96, AU2-98, AUD-132, AU2-100, AUD-133):
      - ni la carpeta, ni pel camí d'un àlies de la carpeta o dels fitxers (enllaços simbòlics o durs);
      - ni amb un manifest que digui un altre `dir`: la carpeta de la sèrie de veritat sempre és protegida;
      - si la carpeta de la sèrie ja té registres, `--prova` no s'executa en aquella còpia del repositori;
      - ni des d'una altra còpia del repositori, ni en una còpia dels fitxers (AUD-132). D'un registre, abans de llegir-lo, en
        llegeix només la primera línia, que porta l'ordre de la branca i cap resultat, i es nega si l'ordre l'escriu a la
        carpeta de la sèrie. Les dades sintètiques escriuen en una altra carpeta.
      - **La primera línia,** byte a byte, fins al seu salt de línia, i ni un byte més (AU2-100, auditoria 23). Com el lector,
        se salten les línies buides del començament, i l'ordre es mira en el text de la línia i en el seu JSON (AUD-133). Si no
        hi ha cap línia d'inici d'un registre sencera en els primers 64 KiB, també es nega.
    - **Des de l'etiqueta fins a la decisió, cap `--prova`** (AUD-132): el programa ja és fixat, i les còpies del repositori amb
      el programa d'abans no tenen la barrera del contingut. Fins a la decisió, els registres només es copien a la carpeta del
      commit de l'etiqueta (els de la màquina virtual, al PC), i enlloc més.

## 8. Limitacions conegudes

- **Els contrastos es van triar després de veure el pilot** (auditor 1). La pista d'abans del pilot era l'edat (AUD-64), i la
  de la composició, l'AUD-122.
- **La cohort és condicionada:** mons que arriben sense vida a l'època 8.000, sense cap cel·la hereditària detectada per
  l'escaneig d'aquella època. La diferència de (b) és causal per a la intervenció de conservar o substituir la sopa d'aquests
  mons, no una llei de l'edat (auditor 2).
- **La cohort és la d'un sol escaneig** (AUD-136, auditoria 23). "Sense cap cel·la hereditària", a la frase de (b) (§6) i a la
  de la decisió, vol dir "sense cap de detectada per l'escaneig de l'època 8.000".
  - **La sensibilitat:** als escanejos repetits de l'auditoria 23, amb dues llavors més a cada món, un escaneig hi veu alguna
    cel·la hereditària marginal en un 9 % dels casos als inclosos (27 de 300), i en un 8 % als exclosos d'una sola cel·la (3 de
    38). És compatible amb que en tinguin tots els mons.
  - **No afecta la validesa de la prova:** l'exclusió és d'abans dels braços, la mateixa per a tots tres.
  - **Els escanejos repetits** són exploratoris, i no entren a l'anàlisi.
- **(c) és un tractament total:** inclou els replicadors que crea la barreja (AUD-121), i no aïlla la composició.
- **`reinit` també pot començar amb replicadors:** al pilot, 8 cel·les hereditàries a 7 mons. Es dona l'escaneig.
- **Cap afirmació d'equivalència** (AUD-127). Amb un marge útil, de 5 punts, caldrien uns 850 mons.
- **Els llindars calibrats** fan la prova vàlida per a la nul·la del ritme amb qualsevol distribució (§6), a canvi d'una mica de
  potència.
  - **La validesa, certificada** (AU2-99, auditoria 21): una cota superior rigorosa per a cada *m*, de dos programes
    independents, el del projecte i el de l'auditor 1. No depèn de cap cerca.
  - **Suposa que els mons són independents** (auditor 2): les llavors es fixen abans, i la regla d'inclusió només mira
    l'envelliment. No cobreix una dependència entre mons.
  - **La decisió no és monòtona entre *m* diferents** (AUD-130): un món més a favor, que passa de 0 a +1, pot treure un rebuig,
    perquè el llindar de *m* + 1 pot ser més baix. És el preu de calibrar per a cada *m*, i no afecta la validesa.
  - **La certificació és en coma flotant** (auditor 2, auditoria 22): amb un marge, i sense una demostració formal de l'error
    d'arrodoniment (§6).
- **La barrera de `--prova` és contra els errors, no contra un adversari** (AU2-98, AUD-132): un registre amb l'ordre de la
  primera línia reescrita, o un fitxer canviat entre la comprovació i la lectura, la passarien (auditor 2, auditoria 22). Els
  canvis que el lector no veu, com una línia en blanc al davant o la primera línia escrita amb `\/`, ja no (AUD-133). Per
  això, des de l'etiqueta fins a la decisió, no es fa servir `--prova` (§7).
- **Els braços fan feines diferents de la BFF:** `shuffle-all` és el més car, i `reinit`, el més barat.
- **Les branques no desen captures** (§4). Qualsevol anàlisi posterior que en necessiti les ha de regenerar.

## 9. El preregistre

- **L'etiqueta:** anotada, `preregistre-maduracio`. El missatge porta la SHA-256 d'aquests fitxers, un per línia i amb el camí
  sol, sense res al darrere (auditor 1, auditoria 19):
  - `fase2/resultats/maduracio/serie/manifest.json`
  - `docs/protocol-maduracio.md`
  - `fase2/maduracio-confirmacio.mjs`, `fase2/maduracio-serie.mjs`, `fase2/b2-serie.mjs`, `fase2/census.js` i `fase1/soup.js`
  - `fase2/preregistre.mjs`
  - `fase2/maduracio-llindars.json`, `fase2/maduracio-llindars-certificat.json` i `eines/llindars-maduracio.mjs`
  - `eines/transforma.mjs` i `eines/pilot.mjs`
- **El commit de l'etiqueta:** el de la correcció de la barrera de `--prova`, revisada a l'auditoria 24 (AU2-100, AU2-101).
  - **El manifest, els registres de la preparació i les llistes** hi són els de `d775174`, el commit que els afegeix, sense cap
    canvi. El missatge de l'etiqueta en dona el diferencial des de `d775174`, fitxer a fitxer.
  - **Les branques** es llancen des d'una còpia d'aquest commit exacte, i el codi de cada registre ha de ser el de l'etiqueta.
- **El segell:** de l'objecte de l'etiqueta, amb OpenTimestamps.
- **Abans de la primera branca,** cal que Bitcoin l'hagi ancorat (`docs/disseny.md`, 25-10-2026).
- **Després,** cap canvi al protocol, al manifest ni als programes sense justificar-lo aquí, amb data i motiu, abans de mirar
  cap resultat.

## 10. El que hi diu cada decisió de les auditories 19 a 23

**L'auditoria 23** (v0.4 → v0.5):

| Troballa o decisió | Què hi diu el protocol |
|---|---|
| El manifest | **Comprovat pels dos auditors,** amb codi independent: la regla d'inclusió, els 36 exclosos, les rondes, les 900 branques, les llistes i 1.260 SHA-256. El primer intent i l'ampliació, conformes a la §2. El 6047 hi entra, amb la regla de sempre |
| El GO | **L'auditor 1, GO a `003a9dd`. L'auditor 2, NO-GO focalitzat,** amb el manifest acceptat, fins a corregir l'AU2-100 i l'AU2-101. La correcció, en una PR, i una revisió breu a l'auditoria 24 (§7, §9) |
| AU2-100 | **La barrera llegeix byte a byte** la primera línia no buida d'un registre, i ni un byte més (§7) |
| AUD-133 | **La llegeix com el lector:** salta les línies buides del començament, i mira l'ordre també en el JSON. Sense cap línia d'inici sencera en els primers 64 KiB, es nega (§7, §8) |
| AU2-101, AUD-134 | **La capçalera** diu l'estat d'ara, i **la §9,** quin commit s'etiqueta |
| AUD-136 | **La cohort és la d'un sol escaneig,** amb la seva sensibilitat. Els escanejos repetits, exploratoris (§8) |
| L'auditor 1 | **La sortida de `--comprova-certificat`,** al missatge de l'etiqueta, i a l'acta després de l'etiqueta (§7) |

**L'auditoria 22** (v0.3 → v0.4):

| Troballa o decisió | Què hi diu el protocol |
|---|---|
| El GO | **La preparació del manifest,** de tots dos auditors. El manifest, a l'auditoria 23 (§7) |
| AUD-132 | **`--prova` no llegeix cap registre de la sèrie, sigui on sigui:** pel contingut de la primera línia, també des d'una altra còpia del repositori i en una còpia dels fitxers. I cap `--prova` des de l'etiqueta fins a la decisió (§7, §8) |
| L'auditor 1 | **La preparació torna a calcular el certificat sencer,** en lloc de refiar-se dels seus números (§7) |
| L'auditor 2 | **`--comprova-certificat` abans de l'etiqueta,** a la còpia que s'etiquetarà (§7). La SHA-256 del certificat ja va al missatge de l'etiqueta (§9). **La coma flotant** de la certificació, i que la barrera de `--prova` és contra els errors, a les limitacions (§6, §8) |

**L'auditoria 21** (v0.2 → v0.3):

| Troballa o decisió | Què hi diu el protocol |
|---|---|
| AU2-99 | **La taula, certificada** amb una cota superior rigorosa, del projecte i de l'auditor 1, i no per una cerca (§6, §8). La seva SHA-256, fixada al programa i al manifest: la preparació, les comprovacions i la decisió no n'accepten cap altra (§6, §7). El certificat va amb l'etiqueta (§9) |
| AU2-98 | **`--prova` no llegeix cap registre de la sèrie:** ni pels àlies dels fitxers (enllaços simbòlics o durs), ni amb un manifest que digui un altre `dir`, i no s'executa si la sèrie ja té registres. Les còpies, pel procediment (§7, §8) |
| AUD-130 | **Les frases de la validesa:** "sabent *m*", la decisió no monòtona entre *m* diferents (§6, §8), i de quin criteri parla la de l'α' única (§6) |
| AUD-131 | **El cas pitjor dels calibrats, sense saber *m*:** entre l'1,15 % i l'1,17 %, i el 2,43 % (§6) |
| L'auditor 2 | **Els mons, independents:** el primer pas de l'argument (§6), i les limitacions (§8) |
| L'ordre | **L'auditoria 22** revisa aquestes correccions abans de la preparació, i **la 23**, el manifest (§7). La decisió del responsable |

**L'auditoria 20** (v0.1 → v0.2):

| Troballa o decisió | Què hi diu el protocol |
|---|---|
| AUD-128, AU2-94 | **Els llindars calibrats per *m*** (§6). La hipòtesi nul·la és la del ritme (§1), i la permutació de signes amb els llindars nominals no la controla: fins al 4,6 % per a la família. El responsable tria els llindars calibrats, amb 150 mons |
| AUD-129, AU2-95 | **Les frases** (§6): la de "no es podia rebutjar" diu quan cap resultat no arriba al llindar calibrat, i la de (c) porta el seu abast en lloc del de (b) |
| AU2-96 | **`--prova`** compara també els camins reals (§7) |
| AU2-97 | **Les llistes:** cadascuna, exactament la seva part (§7) |
| Les captures | **Cap branca no en desa,** d'acord tots dos. La regeneració, comprovada, i només bona amb els mateixos censos i la mateixa empremta (§4) |
| L'auditor 1 | **L'escaneig de l'edat,** lligat a la seva captura (§7); **`--comprova-captures --maquina vm`,** abans d'esborrar les captures de la màquina virtual (§7) |
| L'ordre | **L'envelliment** pot començar; **la preparació,** després de l'auditoria 21 (§7) |

**L'auditoria 19** (v0.1):

| Troballa o decisió | Què hi diu el protocol |
|---|---|
| AUD-124, AU2-93 | **Les captures: cap branca no en desa** (§4). L'auditoria 19 proposava una carpeta per branca. No desar-ne res evita les col·lisions, no deixa cap carpeta que reveli res durant la sèrie, i fa lloc a la màquina virtual. Si cal, es regeneren exactament |
| AUD-125, AU2-90 | ***K* = 2 amb 150 mons,** i els intervals del bootstrap per món als descriptius (§5) |
| AUD-127 | **Cap afirmació d'equivalència** (§1, §8) |
| AU2-91 | **La mediana del temps,** dita de les branques establertes; **la partició pel punt de partida,** com a descriptiu (§5) |
| AU2-92 | **La potència conjunta de Holm,** amb dues *rho* i dos efectes; els braços, independents per construcció i al pilot (§6) |
| El responsable | **La permutació de signes** (§6) i **150 mons** (§2). Amb l'auditoria 20, els llindars calibrats |
| L'auditor 1 | **Les llavors dels mons,** fixades abans, amb la regla d'inclusió (§2); **el missatge de l'etiqueta,** sense res després dels camins (§9) |
| L'auditor 2 | **El punt de partida,** descriptiu predefinit (§3); **l'ancoratge** abans de la primera branca (§9) |
