# Acta de la sèrie preregistrada de la maduració

**El protocol:** `docs/protocol-maduracio.md` (v0.4), revisat a les auditories 19 a 22. La sèrie compara tres braços, `continue`,
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
| `shuffle-all` | de 8.337.573 a 8.340.643 (99,4 %) | de 596 a 831 (mediana 700) | 1.025, a tots 150 mons (d'1 a 16; mediana 6) | 99, a 77 mons |
| `reinit` | de 8.355.445 a 8.356.345 (99,6 %) | de 91 a 155 (mediana 117) | 62, a 49 mons (de 0 a 3) | 17, a 16 mons |

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
