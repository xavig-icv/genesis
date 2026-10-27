# Protocol de la sèrie de la maduració · l'edat i la composició de la sopa

**Versió: v0.1, esborrany (27-10-2026), per a l'auditoria 20.** No s'ha envellit cap món, ni s'ha fet córrer cap branca.
- **D'on surt:**
  - el pilot de la maduració (l'entrada 12 del quadern i `fase2/resultats/maduracio/pilot/acta.md`);
  - l'auditoria 19, i la decisió del responsable del 27-10-2026 (`docs/disseny.md`, §5).
- **Els programes:**
  - `eines/pilot.mjs`, l'experiment `serie`: l'envelliment, la preparació, el manifest i les comprovacions;
  - `eines/transforma.mjs`, per a les transformacions i els escanejos;
  - `fase2/maduracio-confirmacio.mjs` i `fase2/maduracio-serie.mjs`, per a la decisió;
  - `eines/potencia-maduracio.mjs`, per a la potència i la validesa de la prova (§6).
- **El procediment:**
  1. l'auditoria 20 revisa aquest protocol i els programes;
  2. s'envelleixen els mons, i la preparació escriu el manifest (§7);
  3. una comprovació breu del manifest (auditoria 21);
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
- **El mètode: la permutació de signes exacta, unilateral, sobre la suma de les diferències** (la proposta de l'auditor 1, i la
  decisió del responsable).
  - **Sota H₀:** cada diferència té el mateix valor absolut i un signe a l'atzar, independent dels altres mons.
  - **La *p*:** la proporció de les 2^*m* assignacions de signes (*m*, els mons amb diferència) amb una suma igual o més gran
    que l'observada.
  - **Com es calcula:** exactament, per convolució dels valors absoluts, amb enters sense límit. La decisió compara la fracció
    amb el llindar sense cap arrodoniment.
  - **Els mons sense diferència** no hi compten: no canvien la suma.
- **La correcció de Holm,** amb α = 0,025 per a la família:
  - la *p* més petita es compara amb 0,0125;
  - si es rebutja, l'altra es compara amb 0,025.
- **Els mons són la unitat.** Les dues llavors d'un món i d'un braç es compten juntes, a la seva diferència.

**Per què no la prova de signes** (auditoria 19). La de signes compta els mons a favor i en contra, però no la mida de
cada diferència. Si la concordança entre les dues llavors canvia d'un braç a l'altre, rebutja massa sovint, encara que
els ritmes siguin iguals. La de permutació s'hi queda.

**La validesa de les dues proves** (`node eines/potencia-maduracio.mjs --validesa`; 20.000 repeticions):

| Dos braços amb el mateix ritme | Concordances | Signes | Permutació |
|---|---|---|---|
| 20 %, 150 mons, *K* = 2, α = 0,0125 | 0 i 0,4 | 4,7 % | 1,2 % |
| 20 %, 150 mons, *K* = 2, α = 0,0125 | 0,4 i 0 | 0,1 % | 0,9 % |
| 20 %, 150 mons, *K* = 2, α = 0,025 | 0 i 0,4 | 7,8 % | 2,3 % |
| 27 %, 150 mons, *K* = 2, α = 0,0125 | 0 i 0,4 | 4,1 % | 1,3 % |
| 20 %, 80 mons, *K* = 4, α = 0,0125 | 0 i 0,4 | 12,2 % | 1,5 % |

- **Al pilot hi era:** les concordances per braç anaven de −0,35 (`shuffle-all`) a 0,41 (`reinit`).
- **Què passava:** `reinit` concentrava els establiments en pocs mons, i `shuffle-all`, no.
  - **Món a món,** (c) donava 10 a favor i 4 en contra, però amb diferències de +1 a 10 mons, de −1 a 2 i de −2 a 2.
  - **La suma** és +4, que és el 27 % contra el 18 %.
- **El model de la prova:** és exacta si els dos braços són intercanviables dins de cada món. Si tenen el mateix ritme però
  una dispersió diferent, és aproximada, amb l'error de la taula.

**La potència** (`node eines/potencia-maduracio.mjs --familia`; 4.000 repeticions, llavor 20261028):
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
| 27 % i 27 % contra 13,5 % | 0,03 | 97 % | 97 % | 95 % | 99 % |
| 27 % i 27 % contra 13,5 % | 0,3 | 93 % | 93 % | 90 % | 97 % |
| 27 % i 27 % contra 18 % (el pilot) | 0,03 | 66 % | 65 % | 55 % | 76 % |
| 27 % i 27 % contra 18 % (el pilot) | 0,3 | 54 % | 54 % | 43 % | 65 % |

- **Si l'efecte és com el del pilot,** un "no concloent" és probable (auditor 1).
- **Amb la prova de signes,** la potència seria semblant amb la meitat del ritme, i 6 punts més baixa amb l'efecte del pilot (60 %
  per a (b)).

**Com es comunica:**
- **Si es rebutja (b):** "A la cohort (mons quiets sense vida a l'època 8.000, sense cap cel·la hereditària), la vida s'hi
  estableix més sovint en les 8.000 èpoques següents si es conserva la sopa envellida que amb una sopa nova (*X* de 300
  branques contra *Y*; *p* = …, llindar de Holm …). És l'efecte total de conservar la sopa d'aquests mons, no d'un mecanisme
  concret."
- **Si es rebutja (c):** el mateix, amb "si es conserva l'histograma de bytes de la sopa envellida, barrejat,". Afegeix:
  "Inclou el que la barreja crea a l'instant, com els replicadors del començament: no aïlla la composició."
- **Si no es rebutja:** "no concloent. La prova no permet afirmar que, a la cohort, la vida s'hi estableixi més sovint … que
  amb una sopa nova (…). No vol dir que s'hi estableixi igual."
  - **Amb menys de 7 mons amb diferència,** la frase diu que la prova no es podia rebutjar: la *p* més petita possible, 2^−*m*,
    no arriba al llindar.
- **Sempre:** el ritme de cada braç amb els dos intervals, i la diferència de ritmes de cada prova amb el seu.
- **Les frases** surten de `decisionLines()` (`fase2/maduracio-serie.mjs`).

## 7. L'execució

1. **El codi:** el merge de la PR d'aquest protocol, desplegat a la màquina virtual amb `eines/desplega-vm.sh`. Les
   actualitzacions de Windows, pausades.
2. **L'envelliment:** `node eines/pilot.mjs serie --envelliment`, amb `eines/llanca-lot.sh`, des d'una còpia del commit.
   - **On:** al PC.
   - **Si la màquina virtual és lliure:** una part de la llista hi pot anar. Els seus registres i les seves captures es copien al
     PC, amb les SHA-256 comprovades.
   - **Durant l'envelliment:** només `bash eines/seguiment.sh --agregat`.
3. **La preparació:** `node eines/pilot.mjs serie --prepara`, al PC, des d'un commit net.
   - **Què fa:**
     - valida l'envelliment sencer;
     - escaneja els mons envellits, en ordre, i hi aplica la regla d'inclusió;
     - transforma les captures dels 150 mons, que són 450, i les escaneja;
     - escriu el manifest i les llistes de les dues màquines.
   - **On va:** el manifest, els registres de l'envelliment, els escanejos, els registres de les transformacions i les llistes,
     a git. Les captures, no: es regeneren exactament.
4. **La comprovació breu** del manifest (auditoria 21).
5. **El preregistre:** l'etiqueta i el segell (§9). S'espera l'ancoratge.
6. **Les captures de la màquina virtual:** les dels seus 60 mons, les envellides i les transformades (uns 1,9 GB), copiades
   amb les SHA-256 comprovades.
7. **La comprovació prèvia,** a cada màquina: `node eines/pilot.mjs serie --comprova --maquina pc|vm`.
   - **El manifest,** contra el disseny.
   - **Les captures dels mons de la seva llista,** contra el manifest. Els registres i els escanejos de tots els mons, que són a
     git.
   - **Les llistes.**
   - **Que cap branca no hagi començat.**
8. **El llançament:** `eines/llanca-lot.sh`, des de la carpeta del commit de l'etiqueta.
   - **Just després:** el `code` d'una branca de cada màquina (auditor 1, auditoria 18), sense llegir-ne res més.
9. **Durant la sèrie:** només `bash eines/seguiment.sh --agregat`.
   - **Si una màquina s'atura,** es torna a llançar el mateix lot, i les branques acabades se salten.
10. **Abans de decidir:** `node eines/pilot.mjs serie --comprova-captures` al PC, amb totes les captures.
11. **La decisió:** `node fase2/maduracio-confirmacio.mjs --decideix fase2/resultats/maduracio/serie/branques`.
    - **On:** des d'una còpia del commit de l'etiqueta, amb `NODE_OPTIONS` buit.
    - **La sortida** es desa tal com surt.
    - **El programa no decideix res si hi ha cap problema:** si el manifest no és coherent, o si algun registre no és
      exactament el que n'espera, en llista els problemes i s'atura.

## 8. Limitacions conegudes

- **Els contrastos es van triar després de veure el pilot** (auditor 1). La pista d'abans del pilot era l'edat (AUD-64), i la
  de la composició, l'AUD-122.
- **La cohort és condicionada:** mons que arriben sense vida a l'època 8.000, sense cap cel·la hereditària. La diferència de
  (b) és causal per a la intervenció de conservar o substituir la sopa d'aquests mons, no una llei de l'edat (auditor 2).
- **(c) és un tractament total:** inclou els replicadors que crea la barreja (AUD-121), i no aïlla la composició.
- **`reinit` també pot començar amb replicadors:** al pilot, 8 cel·les hereditàries a 7 mons. Es dona l'escaneig.
- **Cap afirmació d'equivalència** (AUD-127). Amb un marge útil, de 5 punts, caldrien uns 850 mons.
- **La prova de permutació** és exacta si els braços són intercanviables dins de cada món. Si tenen el mateix ritme i una
  dispersió diferent, és aproximada (§6).
- **Els braços fan feines diferents de la BFF:** `shuffle-all` és el més car, i `reinit`, el més barat.
- **Les branques no desen captures** (§4). Qualsevol anàlisi posterior que en necessiti les ha de regenerar.

## 9. El preregistre

- **L'etiqueta:** anotada, `preregistre-maduracio`. El missatge porta la SHA-256 d'aquests fitxers, un per línia i amb el camí
  sol, sense res al darrere (auditor 1, auditoria 19):
  - `fase2/resultats/maduracio/serie/manifest.json`
  - `docs/protocol-maduracio.md`
  - `fase2/maduracio-confirmacio.mjs`, `fase2/maduracio-serie.mjs`, `fase2/b2-serie.mjs`, `fase2/census.js` i `fase1/soup.js`
  - `fase2/preregistre.mjs`
  - `eines/transforma.mjs` i `eines/pilot.mjs`
- **El commit de l'etiqueta:** el que afegeix el manifest i els registres de la preparació. Les branques es llancen des d'una
  còpia d'aquest commit exacte, i el codi de cada registre ha de ser el de l'etiqueta.
- **El segell:** de l'objecte de l'etiqueta, amb OpenTimestamps.
- **Abans de la primera branca,** cal que Bitcoin l'hagi ancorat (`docs/disseny.md`, 25-10-2026).
- **Després,** cap canvi al protocol, al manifest ni als programes sense justificar-lo aquí, amb data i motiu, abans de mirar
  cap resultat.

## 10. El que hi diu cada decisió de l'auditoria 19

| Troballa o decisió | Què hi diu el protocol |
|---|---|
| AUD-124, AU2-93 | **Les captures: cap branca no en desa** (§4). L'auditoria 19 proposava una carpeta per branca. No desar-ne res evita les col·lisions, no deixa cap carpeta que reveli res durant la sèrie, i fa lloc a la màquina virtual. Si cal, es regeneren exactament |
| AUD-125, AU2-90 | ***K* = 2 amb 150 mons,** i els intervals del bootstrap per món als descriptius (§5) |
| AUD-127 | **Cap afirmació d'equivalència** (§1, §8) |
| AU2-91 | **La mediana del temps,** dita de les branques establertes; **la partició pel punt de partida,** com a descriptiu (§5) |
| AU2-92 | **La potència conjunta de Holm,** amb dues *rho* i dos efectes; els braços, independents per construcció i al pilot (§6) |
| El responsable | **La permutació de signes** (§6) i **150 mons** (§2) |
| L'auditor 1 | **Les llavors dels mons,** fixades abans, amb la regla d'inclusió (§2); **el missatge de l'etiqueta,** sense res després dels camins (§9) |
| L'auditor 2 | **El punt de partida,** descriptiu predefinit (§3); **l'ancoratge** abans de la primera branca (§9) |
