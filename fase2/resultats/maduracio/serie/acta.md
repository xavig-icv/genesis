# Acta de la sèrie preregistrada de la maduració

**El protocol:** `docs/protocol-maduracio.md`, la v0.5 a l'etiqueta, revisat a les auditories 19 a 24. La preparació es va fer amb
la v0.4, i la v0.5 només hi canvia el text (§10 del protocol). La sèrie compara tres braços, `continue`,
`shuffle-all` i `reinit`, en 150 mons nous envellits fins a l'època 8.000, amb dues llavors per braç: 900 branques.

Les hores d'aquesta acta són les del PC (+01:00), si no es diu el contrari.

## L'envelliment (29-10-2026)

- **El codi:** `2887679` (el merge de la PR #26), en una còpia de treball del PC, sense cap canvi als fitxers de codi.
- **La llista:** `llista-envelliment.txt`, de `node eines/pilot.mjs serie --envelliment`. Són els 180 primers mons de la llista
  de la sèrie, de la llavor 6001 a la 6180, fins a l'època 8.000. SHA-256
  `824f5615ec806c7b6903548fd943a241ce4e8912772515c6d5c2954e2810e9e2`.
- **L'ordre:** `bash eines/llanca-lot.sh 8 fase2/resultats/maduracio/serie/envelliment
  fase2/resultats/maduracio/serie/llista-envelliment.txt`, separat de la sessió.
  - **Amb prioritat baixa,** perquè la prova dels zeros, que corria a la màquina virtual i en comparteix la CPU, no
    s'alentís. Els processos de Node l'hereten.
  - **Només al PC:** la màquina virtual tenia els zeros.
- **El començament:** 01:04:05. **El final:** 13:47:48. `lot acabat: 180 acabats, 0 fallats, 0 ja fets`.
- **Durant l'envelliment:** només `bash eines/seguiment.sh --agregat`, i cap registre llegit.
- **En acabar, abans de la preparació:** la llista dels noms de les captures, que diu quins mons es van establir durant
  l'envelliment. És el que la preparació fa servir per excloure'ls (§2 del protocol), i no cap resultat de la sèrie.
- **El que va córrer alhora,** al PC:
  - la prova dels zeros, a la màquina virtual, fins a les 06.47 h, i la seva decisió;
  - l'auditoria 22: els càlculs de l'auditor 1 i el seu `npm test`;
  - les comprovacions de l'equip i les proves de la PR #27.

  Els temps dels mons no són comparables entre si. Les històries no en depenen, perquè la simulació és determinista.

## La preparació (29-10-2026)

- **El codi:** `557115f` (el merge de la PR #27, la correcció de l'AUD-132), a la mateixa còpia de treball, sense cap canvi als
  fitxers de codi. El simulador és el de l'envelliment: els vuit fitxers del simulador de `2887679` i de `557115f` són
  idèntics, i la preparació ho comprova.
- **Després del GO de l'auditoria 22,** de tots dos auditors.
- **L'ordre:** `node eines/pilot.mjs serie --prepara --paral·lel 8`, amb Node v16.15.1, separada de la sessió i amb prioritat
  baixa. La sortida es desa tal com surt.
- **Windows Update:** en pausa fins al 23-11-2026 a les 00:07:05Z, llegit al registre. L'últim reinici del PC, el 26-10-2026 a les
  00:41.

**El primer intent, aturat pel programa.**
- **De 13:59:10 a 15:05:18,** amb el codi de sortida 1.
- **Què va fer:**
  - va tornar a calcular el certificat dels llindars: totes les files, iguals que les del fitxer;
  - va validar els 180 envelliments sencers;
  - va escanejar 166 mons en dues rondes, de 150 i de 16. Els altres 14 s'havien establert durant l'envelliment.
- **Per què es va aturar:** "hi ha 144 mons inclosos, i en calen 150: cal envellir els següents de la llista, en ordre".
  - **No va fer** cap transformació, ni el manifest, ni les llistes de les branques.
  - **La proporció:** 144 de 180 (80 %). El protocol n'esperava uns 165, amb la del pilot (22 de 24, §2). La diferència és
    compatible amb l'atzar: amb 24 mons, l'interval de confiança del 95 % de la proporció del pilot va del 73 % al 99 %
    (Clopper-Pearson), i el 80 % hi és a dins. La prova exacta de Fisher entre totes dues dona *p* = 0,26.
- **El que no es va esborrar:**
  - **la sortida:** `prepara-sortida-interrompuda-20261029.txt`;
  - **els 166 escanejos:** apartats a `alicuotes-interromput-20261029/`. Després de comparar-los amb els del segon intent, es
    van treure de la còpia de treball i es van desar amb la còpia de seguretat de les captures. Les seves SHA-256 són a
    `escanejos-interromput.sha256`, amb els camins relatius a `alicuotes/`.

**L'envelliment dels mons 6181 a 6196** (§2: "Si no n'hi ha prou: s'envelleixen els següents de la llista, en ordre").
- **La llista:** `node eines/pilot.mjs serie --envelliment --mons 196`, a `llista-envelliment-196.txt` (SHA-256
  `1f3acbb74ffb0125dc958c10f8e0bf5210386c8da701ee08345b2ec7f4d90830`). Les 180 primeres línies són idèntiques a
  `llista-envelliment.txt`.
- **Per què 16 de més:**
  - són dues rondes de 8 processos;
  - en falten 6. Amb la proporció d'inclosos observada (80 %), la probabilitat que n'entrin menys de 6 de 16 és d'uns
    3·10⁻⁵;
  - quants se n'envelleixen de més no canvia quins mons entren a la sèrie. Entren els 150 primers de la llista, i els que
    vénen després no s'hi fan servir ni van al manifest (§2).
- **El codi:** `557115f`, el de la preparació. El simulador és el mateix, i la preparació ho comprova per al commit de cada
  envelliment.
- **L'ordre:** `bash eines/llanca-lot.sh 8 fase2/resultats/maduracio/serie/envelliment
  fase2/resultats/maduracio/serie/llista-envelliment-196.txt`. Separat de la sessió, amb prioritat baixa, i només al PC.
  - **Els 180 que ja hi eren** se salten ("ja fet").
  - **La preparació** s'hi va encadenar, però només si el lot acabava amb "16 acabats, 0 fallats, 180 ja fets".
- **El començament:** 15:14:55. **El final:** 16:19:29, `lot acabat: 16 acabats, 0 fallats, 180 ja fets`.

**El segon intent, encadenat.**
- **El començament:** 16:19:29, la mateixa ordre i el mateix codi.
- **Què va fer:**
  - va tornar a calcular el certificat dels llindars: totes les files, iguals que les del fitxer;
  - va validar els 196 envelliments, amb els dos commits (`2887679` i `557115f`) i el mateix simulador;
  - va escanejar els mons envellits en tres rondes, de 150, 21 i 1, fins a tenir-ne 150 d'inclosos: 172 mons escanejats;
  - les 450 transformacions (150 mons × 3 braços) i els 450 escanejos de totes les cel·les de les captures transformades.
- **El determinisme:** els 166 escanejos que ja havia fet el primer intent són idèntics, byte a byte, als del segon (les
  SHA-256 dels 166 `escaneig.json`). Es comprova amb `cd alicuotes && sha256sum -c ../escanejos-interromput.sha256`.
- **El que va córrer alhora,** al PC: la feina de la sessió i, amb prioritat mínima, tres simulacions de mons de la sèrie de
  la llei 2 per a les visualitzacions. La màquina virtual no feia res. Com a l'envelliment, els temps no són comparables, i
  les històries no en depenen.

### El resultat de la preparació (29-10-2026, a les 20:46)

- **El codi de sortida:** 0. La sortida, desada tal com va sortir: `prepara-sortida.txt`, SHA-256
  `ee3d4b0edc5e9584fa61fe3ff685a88639684f17d242683113fbb7bc72ebdaba`. La darrera línia: "manifest:
  fase2/resultats/maduracio/serie/manifest.json; 150 mons inclosos de 186, 900 branques".
- **El manifest:** els mons de la llista fins al 150è inclòs, de la llavor 6001 a la 6186, amb la raó de cada exclusió. 150
  mons inclosos, 3 braços, 2 llavors i 900 branques. SHA-256 `d2b96f78b2e84fc77c92e6d8ce37d6db668649bfdb5e6b062e87fa1409895b85`.
- **Les llistes:** el repartiment de `machineOf`, de cada cinc mons inclosos, en ordre, els tres primers al PC i els dos
  següents a la màquina virtual.
  - `llista-pc.txt`: 540 branques, de 90 mons. SHA-256 `7b5020e96d07cbb2927247cfaf98eb60b8e275887446eb92e71ff399e2b3c0a9`.
  - `llista-vm.txt`: 360 branques, de 60 mons. SHA-256 `9399ec458133932a823516c6ae06e644e530ac5c730391853863c1797d16d220`.
- **Les comprovacions:** `node eines/pilot.mjs serie --comprova-captures`, a les 20:47:04, i `--comprova`, a les 20:48:06. Totes
  dues, "tot correcte" (codi 0). Les sortides són a `comprova-captures-sortida.txt` i `comprova-sortida.txt`.
  - **Què miren:** el manifest contra el disseny; els 186 envelliments, tornats a validar; les SHA-256 de les 150 captures
    envellides i de les 450 transformades; els registres de les transformacions (la procedència i els invariants, correctes a
    totes 450) i els escanejos; les llistes; i que cap branca no hagi començat.

**Els 36 mons exclosos:**
- **14, per un establiment durant l'envelliment** (la cohort, §2). El món s'atura en establir-se, i no s'escaneja:
  - a l'època 750, el 6099; a la 1.250, el 6096; a la 1.500, el 6022 i el 6106; a la 2.000, el 6113; a la 3.750, el 6118;
  - a la 4.250, el 6010; a la 5.000, el 6054; a la 5.250, el 6002; a la 6.500, el 6153; a la 6.750, el 6046;
  - a la 7.500, el 6064, el 6069 i el 6178.
- **22, per cel·les hereditàries a l'escaneig de l'època 8.000** (AUD-111):
  - **19, amb una sola cel·la hereditària:** 6018, 6026, 6027, 6033, 6039, 6040, 6049, 6057, 6058, 6066, 6087, 6093, 6097,
    6103, 6115, 6151, 6154, 6163 i 6171. Totes són hereditàries soles, menys la del 6027, que ho és només en context.
  - **3, amb la vida a punt d'establir-se:** el 6068 (1.057 cel·les hereditàries), el 6114 (882) i el 6140 (1.116).
- **Les rondes de l'escaneig:** la primera, de 150 mons (de la llavor 6001 a la 6163), en va deixar 129 d'inclosos. La segona,
  de 21 (de la 6164 a la 6185), 20 més. La tercera, d'un sol món, el 6186, el 150è.
- **Els mons 6187 a 6196:** s'han envellit, però no s'han escanejat ni van al manifest (§2). Els seus registres són a
  `envelliment/`, com els de tots els altres.
- **Els commits de l'envelliment dels mons del manifest:** `2887679` per als 180 primers, i `557115f` per als sis últims (6181 a
  6186).

**El punt de partida de cada braç** (§3): l'escaneig de totes les cel·les de cada captura, abans de cap època de dinàmica. És
un descriptiu predefinit, i no cap resultat de la sèrie. Els valors de cada món són al manifest.

| Braç | Bytes canviats (de 8.388.608) | Cel·les que es repliquen | Cel·les hereditàries | Hereditàries soles |
|---|---|---|---|---|
| `continue` | 0 | d'11 a 35 (mediana 23) | cap, a cap món | cap |
| `shuffle-all` | de 8.337.573 a 8.340.643 (99,4 %) | de 596 a 831 (mediana 700,5) | 1.025, a tots 150 mons (d'1 a 16; mediana 6) | 99, a 77 mons |
| `reinit` | de 8.355.445 a 8.356.345 (99,6 %) | de 91 a 155 (mediana 117) | 62, a 49 mons (de 0 a 3) | 17, a 16 mons |

- **Corregit (31-10-2026):** la mediana de les cel·les que es repliquen a `shuffle-all` és 700,5: són 150 mons, i és la mitjana
  dels dos del mig. L'acta deia 700.
- **`continue`:** la captura envellida tal com és. Les 150 tenen la SHA-256 de la captura d'origen, i el seu escaneig és el de
  l'edat.
- **Com al pilot:** `shuffle-all` hi crea replicadors hereditaris a tots els mons (6,8 cel·les per món, i 7,7 al pilot), i
  `reinit`, alguns (0,41 per món, i 0,36 al pilot). La prova (c) els inclou (AUD-121).

**Una observació: el cens i l'escaneig no sempre coincideixen.**
- **El món 6047:** el cens de l'època 8.000 hi va trobar una cel·la hereditària a la seva mostra de 2.048, i l'escaneig de
  totes les cel·les, cap. Hi entra, perquè la regla és la de l'escaneig (§2, AUD-111).
- **Per què pot passar:** la prova d'herència de `fase2/replication.js` fa servir l'atzar, per triar el veí del context i per
  a les cintes de soroll. El cens i l'escaneig en fan servir de diferent (la llavor del cens, i la del món + 600.000). Una
  cel·la hereditària només en alguns contextos pot passar una prova i no l'altra.
- **L'altra direcció,** la de l'AUD-111, és la de 19 dels 22 mons exclosos per l'escaneig, els d'una sola cel·la: el cens de
  l'època 8.000 no hi va veure cap cel·la hereditària. Als altres tres, els que eren a punt d'establir-se, sí.
- **No hi canvia res:** la regla d'inclusió és la preregistrada, i el manifest la segueix. Va a l'auditoria 23, amb el manifest.

**El que no s'ha fet:** no s'ha llançat cap branca. L'auditoria 23 revisa el manifest abans de l'etiqueta (§7).

**Les captures** no van a git: les 265 de l'envelliment (les 196 finals i 69 dels esdeveniments) i les 450 de transformades,
6,0 GB. Es regeneren amb el commit, les llavors i les ordres de les llistes. Els registres de l'envelliment i de les
transformacions, els escanejos, el manifest i les llistes, sí.

## Els escanejos repetits (AUD-136, exploratoris)

- **Per a l'auditoria 23,** 344 escanejos més de les captures envellides, amb llavors noves: dues per a cadascun dels 150 mons
  inclosos (300) i dels 19 exclosos per una sola cel·la (38), i sis més per al 6047 (les llavors 3 a 8). Des de la còpia de
  treball del PC, amb prioritat baixa, el 29-10-2026 de les 21:14 a les 23:35, sense cap fallada.
- **El que hi surt:** un escaneig hi veu alguna cel·la hereditària en un 9 % dels casos als inclosos (27 de 300; cap món a totes
  dues llavors, i mai més d'una cel·la), i en un 8 % als exclosos d'una sola cel·la (3 de 38).
- **No hi canvia res:** la cohort és la d'un sol escaneig, el de l'època 8.000 (§8 del protocol), i aquests escanejos no entren
  a l'anàlisi.
- **On són:** a l'annex de l'auditoria 23, fora del repositori. `escanejos.sha256`, la llista de les seves SHA-256, té la
  SHA-256 `319a600a206f4adeef51cc1478d5286889639a1fbfb5c0061447d95276772a48`.

## Abans de l'etiqueta (31-10-2026)

Abans del GO de l'auditoria 24, per avançar feina. Les comprovacions es tornen a passar just abans del llançament (§7).

- **La còpia de treball del PC,** a `416f720`, des de `d775174`. Hi canvien `docs/protocol-maduracio.md`,
  `fase2/maduracio-confirmacio.mjs`, `test/maduracio-serie.mjs` i `test/pilot.mjs`, i les captures no es mouen. No hi ha cap
  fitxer seguit canviat, ni cap de sense seguir fora de les captures, i les 13 SHA-256 del missatge de l'etiqueta hi coincideixen.
- **`node eines/llindars-maduracio.mjs --comprova-certificat`,** amb Node v16.15.1: codi 0, en 12 s. La sortida:

  ```
  302 llindars (m de 0 a 150, els dos passos). La cota superior, com a molt α: 302; com a molt α·(1 − 10⁻⁴), el criteri de la taula: 302
    el més a prop d'α al pas 1: m = 77, el suprem entre 1.249691 % i 1.249692 % (0.999753·α)
    el més a prop d'α al pas 2: m = 108, el suprem entre 2.499740 % i 2.499740 % (0.999896·α)
  K és el més gran (el suprem del recompte següent passa del criteri): 289 de 289 (els altres 13, sense cap recompte més fins al nominal)
  El recompte següent seria vàlid, i només el marge de 10⁻⁴ l'exclou: 3
    m = 55, pas 2: el suprem del recompte següent entre 2.49998 % i 2.49999 %
    m = 121, pas 1: el suprem del recompte següent entre 1.24989 % i 1.24993 %
    m = 140, pas 2: el suprem del recompte següent entre 2.49980 % i 2.49984 %
  particions: 7366
  El certificat és el de la taula, totes les cotes són com a molt α, i les files de m = 0 a 150 són les que surten del càlcul.
  ```
- **La màquina virtual** (`~/claude-origins-416f720`, amb `VERSIO` `416f720`): les captures dels seus 60 mons, les 60
  envellides i les 180 transformades (240 fitxers, 2,01 GB), copiades des del PC. Totes 240 tenen la SHA-256 del manifest
  (`sha256sum -c`).
- **Les comprovacions,** amb el codi de `416f720`, de les 10:55 a les 10:58:
  - **a la màquina virtual,** amb Node v20.19.2: `node eines/pilot.mjs serie --comprova-captures --maquina vm` i `--comprova
    --maquina vm`, "tot correcte" (codi 0);
  - **al PC,** amb Node v16.15.1: `--comprova-captures --maquina pc` i `--comprova --maquina pc`, "tot correcte" (codi 0).

## L'etiqueta i el segell (01-11-2026)

- **El GO:** dels dos auditors, a l'auditoria 24, tots dos de l'1-11-2026. El responsable va aprovar l'etiqueta i el segell el
  mateix dia.
- **Abans de crear-la,** a la còpia de treball del PC (`416f720`, neta, sense `assume-unchanged` ni `skip-worktree`, i amb
  `NODE_OPTIONS` buit):
  - `git diff --name-only d775174 416f720` dona exactament els quatre fitxers del missatge, i cap de la carpeta de la sèrie;
  - les 13 SHA-256, tornades a calcular sobre els fitxers de `416f720`, coincideixen totes;
  - `node eines/llindars-maduracio.mjs --comprova-certificat`, amb Node v16.15.1: codi 0, en 12 s. La sortida és la de "Abans de
    l'etiqueta", byte a byte: deu línies, 932 bytes, SHA-256 `636bb0d1067520d0033b9845f5d662f42366f2dedddc20eb1f618705d343073f`. És
    la mateixa que van obtenir tots dos auditors.
- **El missatge:** l'esborrany revisat a l'auditoria 24, amb les dues marques plenes.
  - **La data del GO:** "01-11-2026".
  - **El certificat:** la sortida sencera de `--comprova-certificat`, les deu línies. L'auditor 1 la demanava sencera (AUD-138), i
    l'auditor 2, la darrera línia, sense canviar l'abast: la sortida sencera la conté.
  - **L'assaig,** amb els bytes definitius, en un clon d'un sol ús sense remot: `--decideix` passa el preregistre i s'atura,
    perquè no hi ha cap registre.
- **L'etiqueta:** `preregistre-maduracio`, anotada, sobre `416f72095bbc2fb3fdb49e46350994cf66ddb0a8`, creada a les 14:31:02.
  - **El commit, comprovat** (AUD-138): `git rev-parse preregistre-maduracio^{commit}` dona `416f72095bbc2fb3fdb49e46350994cf66ddb0a8`.
  - **L'objecte:** `6e95a287ad7a92d3f0b5c39e3ed6658a0a141589`, de 3.771 bytes. SHA-256
    `20d3451a94cf73fc4b1ad62f6b2fe49511750c6af694482348204ef62fddb724`.
  - **El programa de la decisió l'accepta:** a la còpia de treball del PC, `--decideix` passa la comprovació del preregistre i
    s'atura, perquè encara no hi ha cap de les 900 branques ("La sèrie no és la del manifest (900 problemes)").
  - **A GitHub:** pujada a les 14:31:12. `git ls-remote` en dona l'objecte i el commit.
- **El segell:** de l'objecte de l'etiqueta (`docs/preregistre-maduracio/preregistre-maduracio.tag`), amb OpenTimestamps, a les
  14:32:24.
  - **Els calendaris que van respondre:** `b.pool.opentimestamps.org` i `ots.btc.catallaxy.com`. Els altres dos de la llista per
    defecte tenien el certificat caducat, com als zeros.
  - **L'entorn:** un entorn virtual de Python nou, amb el permís del responsable, amb `opentimestamps-client` 0.8.0 i la biblioteca
    `opentimestamps` 0.5.0 (als zeros, la 0.7.2 i la 0.4.5). Els scripts són els dels zeros, i només fan servir la biblioteca base.

## L'ancoratge i el llançament (01-11-2026)

**L'ancoratge** (hores en UTC):
- **El bloc:** el 974.134, de les 14:21:50 (`000000000000000000006608e30a841e01ab0e22cf40f9d7e57c845e4b4d79e9`). El calendari
  `bob.btc.calendar.opentimestamps.org` hi va posar el segell amb la transacció `e250cf36…`.
- **Quan:** a les 15:28:54, quan el bloc ja tenia 6 confirmacions, el calendari va donar la prova completa.
- **La comprovació,** a les 15:29 (`verifica-ots.py`): l'arrel de Merkle del bloc coincideix amb el missatge atestat
  (blockstream.info), i el fitxer segellat és l'objecte de l'etiqueta.
- **La segona atestació:** la de `btc.calendar.catallaxy.com`, al bloc 974.152, de les 16:50:09 (la transacció `185247b7…`).
  Quan es van llançar les branques, encara era pendent. El calendari la va donar a les 17:51, i l'arrel de Merkle coincideix.
  No hi canvia res: la que data l'etiqueta és la del bloc 974.134.
- **El detall:** `docs/preregistre-maduracio/LLEGEIX-ME.md`.

**El llançament** (hores de les màquines, +01:00):
- **Just abans,** a cada màquina: `node eines/pilot.mjs serie --comprova --maquina pc`, a les 16:29:41 (Node v16.15.1), i
  `--maquina vm`, a les 16:30:32 (Node v20.19.2), "tot correcte" (codi 0). La còpia de treball del PC, a `416f720` i sense cap
  canvi; a la màquina virtual, `VERSIO` diu `416f720`. Cap branca no havia començat.
- **El primer intent,** a les 16:31:32 (PC) i a les 16:31:33 (màquina virtual), amb `bash eines/llanca-lot.sh`: els dos
  llançadors van sortir amb el codi 2, sense escriure res (la incidència 1).
- **Just abans del segon,** `--comprova` una altra vegada, "tot correcte": al PC, acabada a les 16:36:44, i a la màquina virtual,
  a les 16:37.
- **El PC:** el lot, a les 16:36:56, en una finestra oculta i amb prioritat baixa, com l'envelliment (els processos de Node
  l'hereten), des de la còpia de treball de `416f720`: `bash llanca-lot-416f720-corregit.sh 6
  fase2/resultats/maduracio/serie/branques fase2/resultats/maduracio/serie/llista-pc.txt`. 540 branques, 6 alhora. La primera
  línia del lot diu `codi=416f720`.
- **La màquina virtual:** el lot, a les 16:37:10, amb `nohup`, des de `~/claude-origins-416f720`: el mateix llançador, amb 4
  branques alhora i `llista-vm.txt`. 360 branques. La primera línia del lot diu `codi=416f720`.
- **El codi d'una branca de cada màquina,** just després de llançar: només el camp `code` de la línia d'inici del JSONL, sense
  llegir-ne res més.
  - **Al PC,** `6001-continue-a`: `416f720`.
  - **A la màquina virtual,** `6005-continue-a`: `416f720`.
- **Durant la sèrie:** només `bash eines/seguiment.sh --agregat`. Cap `--prova`, i no es mira cap resultat fins a la decisió,
  que es pren des d'una còpia de l'etiqueta.

### La incidència 1: el llançador rebutjava les llistes de la sèrie

- **Què va passar:** `eines/llanca-lot.sh` comprova, abans de començar, que la llista tingui algun experiment, amb
  `grep -v … "$LIST" | grep -qv …` i `set -o pipefail`. El segon `grep` surt a la primera línia que coincideix. Si la llista
  passa de 64 KB, la mida de la canonada, el primer encara hi escriu, rep un SIGPIPE i surt amb el codi 141, i amb `pipefail` la
  comprovació falla: "la llista … no té cap experiment", codi 2.
  - **Les llistes de la sèrie** fan 161 KB (PC) i 107 KB (màquina virtual). Les de les sèries anteriors en feien menys de 64
    (la de l'envelliment, 46 KB).
  - **Quan falla:** a la màquina virtual, sempre (3 de 3). Al PC, amb la llista del PC, també; amb la de la màquina virtual,
    no sempre.
- **El que no va passar:** cap branca no va començar, i no es va escriure res: ni la carpeta de les branques ni el fitxer del lot.
- **La solució, sense tocar el commit de l'etiqueta:** una còpia del llançador fora del repositori, `llanca-lot-416f720-corregit.sh`,
  amb la SHA-256 `a7285786b546d0019685941c82397ade539ce23242a0d0e4ae3024539aae6d9e` a totes dues màquines. Respecte de
  `eines/llanca-lot.sh` de `416f720`, només hi canvien dues línies, a més d'una capçalera que ho explica:
  - **la comprovació,** sense `-q`: `grep -v '^[[:space:]]*$' "$LIST" | grep -v '^[[:space:]]*#' > /dev/null`. El segon `grep`
    llegeix la llista sencera, i el resultat és el mateix;
  - **el `cd`** a la carpeta del repositori, que la còpia, fora del repositori, no pot fer: en lloc seu, comprova que es llança des
    de l'arrel del repositori.

  `experiments.sh`, `sim.mjs` i les llistes són els de `416f720`, sense cap canvi, i les còpies de treball continuen netes. Per
  això els lots i les branques diuen `416f720`, sense `+canvis`.
- **Abans de fer-la servir,** a cada màquina: amb les dues llistes de la sèrie i un `experiments.sh` de prova que només compta les
  línies (en una carpeta temporal, sense simular res), 30 llançaments de 30 amb 540 i 360 experiments. Una llista sense cap
  experiment, rebutjada amb el codi 2.
- **Si s'ha de tornar a llançar un lot** (§7 del protocol, pas 9): amb la mateixa còpia.
- **La correcció al repositori:** la branca `llanca-lot-llistes-grans` (`c6dd9f6`), amb la mateixa línia i una prova amb una
  llista d'1 MB, que amb el llançador de `416f720` falla. Va a la revisió dels auditors, i no canvia res de la sèrie.
- **Els altres `grep -q` dels lots** (a `experiments.sh` i `seguiment.sh`) llegeixen la primera o l'última línia d'un JSONL, que
  s'escriu d'un sol cop: al pilot de la maduració, com a molt 837 i 131 bytes. No els afecta.
- **L'auditoria 25** (01-11-2026, l'AUD-141): tots dos auditors donen la correcció per bona, i l'auditor 1 no troba cap altre script
  amb el problema. Llançar la sèrie amb la còpia no canvia res del que es calcula.
  - **La còpia, a git:** perquè se'n pugui comprovar la SHA-256, és a `incidencia-1/`, tal com és
    (`llanca-lot-416f720-corregit.sh`, `a7285786…`), amb el diferencial amb `eines/llanca-lot.sh` de `416f720`
    (`llanca-lot-416f720-corregit.diff`): la capçalera, el `cd` i la comprovació.
  - **La desviació de la lletra del protocol** (§7, pas 8, "`eines/llanca-lot.sh`, des de la carpeta del commit de l'etiqueta"):
    l'entrada de la decisió també ho dirà.

### La incidència 2: sis branques del PC, interrompudes (03-11-2026)

- **Què va passar:** el 03-11-2026, entre les 23.13.16 i les 23.13.44, es van aturar les sis branques que corrien al PC, i cap
  més:
  - **tres, amb el codi 130,** el de la interrupció: `6132-shuffle-all-b`, `6135-continue-b` i `6135-shuffle-all-a`;
  - **tres, sense cap línia de final al lot:** `6135-reinit-a`, `6135-reinit-b` i `6135-shuffle-all-b`.

  El lot va continuar amb les següents. La màquina virtual no en va tenir cap.
- **La causa probable:** l'actualització de l'aplicació de Claude, des d'on es va llançar el lot. El registre d'esdeveniments de
  Windows hi anota el paquet nou a les 23.03, i l'aturada del seu servei "durant el servei del paquet" a les 23.13.49. No hi va
  haver cap reinici, ni cap canvi d'alimentació, ni cap avís de memòria o de disc.
- **Com es va veure:** el 04-11-2026 a les 01.18, el seguiment agregat deia 3 fallats i 9 en marxa, amb només 6 processos de
  `node`, i 126 minuts sense escriure.
  - **Per trobar-ne la causa,** es van mirar les línies d'estat del lot (no els registres), les dates dels registres i el registre
    d'esdeveniments de Windows.
  - **Què s'hi va veure:** els noms de les branques començades i de les sis interrompudes, però cap xifra, cap registre, ni l'ordre
    en què van acabar.
- **Què es fa:** quan acabi el lot del PC, es torna a llançar el mateix lot, amb la mateixa còpia del llançador (§7, pas 9).
  `experiments.sh` salta les branques completes i torna a fer les sis des del principi (`sim.mjs` torna a escriure el JSONL
  sencer). Les branques són deterministes: en surten els mateixos registres que sense la interrupció.
  - **Ho fa un script fora del repositori,** `rellanca-pc-incidencia-2.sh` (SHA-256
    `ca4bb3d3b3a45b7cf36eb4c44ffb8ebd495accbff48900b939163476768a0245`), llançat el 04-11-2026 a les 01.26, a prioritat baixa.
  - **Com treballa:** espera la línia final del lot, mirant-la cada 5 minuts, i llavors torna a llançar el lot. No llegeix res
    més que aquesta línia.
  - **A git,** perquè se'n pugui comprovar la SHA-256: a `incidencia-2/`, tal com és.
- **Per no repetir-ho:** els lots que vinguin, des d'una finestra del PC que no depengui de l'aplicació.
