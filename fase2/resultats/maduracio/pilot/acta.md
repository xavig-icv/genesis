# Acta del pilot de la maduració de la sopa

**El disseny:** `docs/pilot-maduracio.md` (v2), revisat a les auditories 15 i 16. És un pilot: no en surt cap conclusió, i els
seus mons no entren a cap sèrie.

## L'envelliment (25-10-2026)

- **El codi:** el commit `3b0cdc0` (el merge de la PR #20), en una còpia de treball del PC sense cap canvi als fitxers seguits.
- **La llista:** `node eines/pilot.mjs maduracio --envelliment`, desada com a `llista-envelliment.txt`.
  - **Què hi ha:** els 24 mons nous, de la llavor 5001 a la 5024, fins a l'època 8.000, amb `--stop-after-event 0`.
  - **La SHA-256:** `9f63545de8a4ef4dbdae14b63e8d151a9af7ded96149364d3943b48d20f5c309`.
- **El llançament:** el 25-10-2026 a les 16:06:07 (+01:00), al PC, amb `bash eines/llanca-lot.sh 6 ...` en una finestra oculta.
  - **Quants alhora:** 6.
  - **Els registres** porten `codi=3b0cdc0`.
- **Abans de la comprovació breu de l'auditoria 16** (X-051):
  - **Per què:** l'envelliment no depèn de res del que s'hi revisa, i tots tres vam estar d'acord amb l'edat 8.000.
  - **Què es farà després:** cap branca no es llança abans del GO.
- **Les actualitzacions de Windows:** pausades fins al 24-11-2026 a les 20:18:56Z, comprovat al registre.
- **L'energia:** el PC és connectat a la corrent.
- **Durant l'envelliment:** només `bash eines/seguiment.sh --agregat`.
- **El final:** el lot va acabar el 25-10-2026 a les 17:55:09, amb 24 mons acabats, cap de fallat, i els 24 registres complets.

## La preparació (26-10-2026)

**El codi:** el commit `4fa032b` (el merge de la PR #21), a la mateixa còpia de treball del PC. Els registres de
l'envelliment, que no són a git, s'hi van quedar.

**El primer intent, interromput.**
- **L'ordre:** `node eines/pilot.mjs maduracio --prepara --paral·lel 4`, al mateix temps que la preparació dels zeros.
- **L'apagada:** el 26-10-2026 a les 00:25:31, una apagada inesperada del PC (Kernel-Power 41: el sistema es va reiniciar
  sense apagar-se bé). No va ser Windows Update. La preparació era a l'escaneig 100 de 110.
- **La pausa de Windows Update:** després del reinici ja no era al registre. El responsable la va tornar a posar, fins al
  23-11-2026 a les 00:07:05Z, comprovat al registre.
- **El que no es va esborrar:** la sortida interrompuda es va apartar a `alicuotes-interromput-20261026/`, a la mateixa
  còpia, fora de git.

**El segon intent, sencer.**
- **L'ordre:** la mateixa, llançada cap a la 01:03.
- **Quan va acabar:** a les 02:06, amb el codi de sortida 0.
- **Què va fer:**
  - va validar els 24 envelliments sencers, amb el mateix simulador que el del seu commit;
  - va escanejar els 24 mons;
  - va fer les 110 transformacions;
  - va escanejar les 110 captures transformades.
- **El determinisme:** els 344 fitxers de la sortida interrompuda (110 captures, 110 registres i 124 escanejos) són idèntics
  byte a byte als del segon intent.

**El resultat de la preparació.**
- **La inclusió:** 22 mons de 24. Els exclosos són el 5012, amb 2 cel·les hereditàries a l'escaneig de l'època 8.000, i el
  5016, amb 1 (AUD-111). Cap món no s'havia establert abans de l'època 8.000.
- **El manifest:** 22 mons inclosos, 5 braços, 2 llavors, 220 branques. SHA-256
  `598495fe75308d4c1c064d562d109eb404c2f50941c9f55f19351f4e03f567a7`.
- **Les llistes:**
  - `llista-pc.txt`: 110 branques. SHA-256 `777a61bc1ad2db90768608cefab7a2cb13369ff85fe127dc8e9370058b867d66`.
  - `llista-vm.txt`: 110 branques. SHA-256 `3bca75e9b87f22846750465dcfa38b7ce24e885f5cc605782de449aea8843e46`.
- **Les comprovacions:** `node eines/pilot.mjs maduracio --comprova-captures` i `--comprova`, totes dues "tot correcte".

**Una observació d'abans de cap branca: les barreges creen replicadors.** L'escaneig de totes les cel·les de cada captura
transformada (cel·les que es repliquen / hereditàries, de 131.072):

| Braç | Es repliquen (mediana, rang) | Hereditàries | Mons amb alguna hereditària |
|---|---|---|---|
| `continue` | 25 (14–31) | 0 | 0 de 22 |
| `shuffle-programs` | 31 (19–43) | 3 en total | 3 de 22 |
| `shuffle-within` | 88 (71–116) | 14 en total | 9 de 22 |
| `shuffle-all` | 713 (641–776) | 169 en total, de 4 a 16 per món | **22 de 22** |
| `reinit` | 119 (105–138) | 8 en total | 7 de 22 |

- **Què vol dir:** la composició d'aquestes sopes envellides, si se'n barregen els bytes, ja conté replicadors hereditaris a
  tots els mons. Les sopes tal com són, no, i tenen menys cel·les que es repliquen que una sopa nova a l'atzar.
- **El que canvia per al pilot:** `shuffle-all` començarà amb vida hereditària, i `continue`, no. El contrast principal ja
  no compara només l'estructura. Es porta a l'auditoria 17 abans de llançar cap branca.
- **Les captures transformades** (110, unes 880 MB) no van a git: es regeneren amb el commit, les captures envellides i les
  llavors. Els seus registres, els escanejos, el manifest i les llistes, sí.

**Dues correccions de l'observació (auditoria 17), sense esborrar-la.**
- **Les hereditàries de `shuffle-all` (AUD-121):** "replicadors hereditaris a tots els mons" s'ha de matisar.
  - **Què passa:** de les 169 cel·les, 159 ho són només en context, el cas en què la prova pot donar falsos positius (AUD-42).
  - **Amb el criteri robust:** hereditàries soles, n'hi ha 10, en 9 dels 22 mons.
- **Les medianes (AUD-123):** les de la taula (25, 31, 88 i 713) eren les superiors. Amb el criteri de la resta del projecte, la
  mitjana dels dos valors del mig de 22, són 23,5, 30,5, 87,5 i 712,5.

| Braç | Es repliquen (mediana, rang) | Hereditàries (mons) | Hereditàries soles (mons) | Només en context |
|---|---|---|---|---|
| `continue` | 23,5 (14–31) | 0 (0) | 0 (0) | 0 |
| `shuffle-programs` | 30,5 (19–43) | 3 (3) | 2 (2) | 1 |
| `shuffle-within` | 87,5 (71–116) | 14 (9) | 4 (4) | 10 |
| `shuffle-all` | 712,5 (641–776) | 169 (22) | **10 (9)** | 159 |
| `reinit` | 119 (105–138) | 8 (7) | 4 (4) | 4 |

**La composició de les captures (AUD-122).** És un descriptiu estàtic i determinista, de les 22 captures de cada braç (medianes
dels 22 mons).
- **Qui l'ha calculat:** l'auditor 1, a l'auditoria 17, i l'equip ho ha comprovat amb un script independent. Les xifres coincideixen.
- **La dispersió:** la variància del nombre d'instruccions per programa, dividida per la de la binomial.

| Braç | Bytes d'instrucció | Zeros | Dispersió (rang) | Programes amb `[`, `]` i una còpia (`.` o `,`) |
|---|---|---|---|---|
| A l'atzar (esperat) | 3,9 % | 0,39 % | 1 | 1,9 % |
| `continue`, `shuffle-programs` i `shuffle-within` | 11,37 % | 0,56 % | 8,50 (8,09–8,89) | 3,05 % |
| `shuffle-all` | 11,37 % | 0,56 % | 1,00 (1,00–1,01) | 10,56 % |
| `reinit` | 3,91 % | 0,39 % | 1,00 (0,99–1,00) | 1,86 % |

- **La composició global de la sopa envellida canvia:** gairebé el triple de bytes d'instrucció que a l'atzar.
- **Però les instruccions es concentren en pocs programes:** la dispersió és 8,5 vegades la de l'atzar.
  - **La barreja global les reparteix,** i els programes amb els ingredients d'un bucle de còpia passen del 3,05 al 10,56 %.
  - **És la hipòtesi de l'equip a l'auditoria 17,** ara concreta: l'envelliment fa programes de composicions molt diferents, i
    la barreja els iguala.
- **L'ordre dels bytes dins dels programes envellits suprimeix la replicació:** amb la mateixa composició per programa, 23,5
  cel·les que es repliquen amb `continue` i 87,5 amb `shuffle-within`.

## La lectura, escrita abans de la primera branca (auditoria 17, 26-10-2026)

**El GO:** tots dos auditors han donat GO per llançar les 220 branques tal com són (l'opció (a) del traspàs), sense cap braç nou.
- **L'auditor 1** demana escriure aquí, abans de la primera branca, com es llegirà cada braç.
- **L'auditor 2** demana no fer cap afirmació causal sobre la maduració a partir del contrast brut, i declarar el punt de partida.

**Com es llegirà:**
- **Què és el pilot:** un calibratge exploratori, com diu el disseny.
  - **El contrast `continue` contra `shuffle-all`** compara tractaments sencers, no l'estructura sola.
  - **No se'n farà cap afirmació causal** sobre la maduració de la sopa.
- **`shuffle-all`** es llegeix com "la composició envellida, amb la seva propensió immediata", no com la manca d'estructura sola.
  - **El seu punt de partida:** 169 cel·les hereditàries, de 4 a 16 per món, als 22 mons; 10 de soles, en 9 mons.
  - **El de `continue`:** cap.
- **El punt de partida de cada món i braç** (l'escaneig, al manifest) és una covariable descriptiva.
  - **Els establiments de cada braç** es donaran també separats segons si el món tenia alguna hereditària sola al començament.
- **El criteri principal de "hereditari"** és el de les soles (AUD-121). Les de context hi seran com a secundàries.
- **Per a la sèrie,** si cal un braç `shuffle-all` "inert", es dissenyarà amb les dades del pilot.
  - **Les condicions de tots dos auditors:** el criteri, amb les hereditàries soles; una regla d'aturada finita, amb la llavor
    fixa; el registre dels bytes moguts; i una comprovació del que conserva.

## Les branques

### El PC (26-10-2026)

- **El codi:** el commit `521039c`, a la còpia de treball del PC, sense cap canvi als fitxers seguits.
  - **Respecte de `4fa032b`,** el de la preparació, només hi canvien textos i registres: fora de `docs/` i de
    `fase2/resultats/`, `git diff --name-only 4fa032b 521039c` no dona cap fitxer.
- **Abans de la primera branca,** a les 13:01:
  - les SHA-256 del manifest i de les dues llistes, les de més amunt;
  - `node eines/pilot.mjs maduracio --comprova`: "La comprovació prèvia del pilot maduracio: tot correcte." (codi 0);
  - les actualitzacions de Windows, pausades fins al 23-11-2026 a les 00:07:05Z, comprovat al registre;
  - el PC, connectat a la corrent.
- **El llançament:** el 26-10-2026 a les 13:01:28, en una finestra oculta.
  - **L'ordre:** `bash eines/llanca-lot.sh 6 fase2/resultats/maduracio/pilot/branques fase2/resultats/maduracio/pilot/llista-pc.txt`.
  - **Què hi ha:** 110 branques, 6 alhora. La primera línia del lot diu `codi=521039c`.
- **Durant el lot:** només `bash eines/seguiment.sh --agregat`.

### La màquina virtual (26-10-2026)

- **L'espai:** la comprovació prèvia hi mira totes les captures, d'origen i transformades (1,1 GB), i hi quedaven 1,6 GB.
  - **Què s'hi va esborrar:** les 168 captures de la sèrie de B2 que hi havia (1,4 GB). El responsable ens deixa gestionar
    l'espai de la màquina.
  - **Abans d'esborrar-les:** es va comprovar, una per una, que eren idèntiques a les de la còpia de seguretat (SHA-256).
- **El codi:** el commit `521039c`, desplegat amb `eines/desplega-vm.sh` (el fitxer `VERSIO` diu `521039c`).
  - **Les captures:** les 134 (24 envellides i 110 transformades), copiades del PC.
- **Abans de la primera branca,** a les 13:20:
  - les SHA-256 del manifest i de les dues llistes, les de més amunt;
  - `node eines/pilot.mjs maduracio --comprova`: "La comprovació prèvia del pilot maduracio: tot correcte." (codi 0).
- **El llançament:** el 26-10-2026 a les 13:20:28, amb `nohup`.
  - **L'ordre:** `bash eines/llanca-lot.sh 4 fase2/resultats/maduracio/pilot/branques fase2/resultats/maduracio/pilot/llista-vm.txt`.
  - **Què hi ha:** 110 branques, 4 alhora. La primera línia del lot diu `codi=521039c`.
- **Node:** el 16.15.1 al PC (Windows) i el 20.19.2 a la màquina virtual (Linux). Els registres en diuen la versió.

### El final (27-10-2026)

- **El PC:** el lot va acabar a les 03:15:46, amb 110 branques acabades, cap de fallada i els 110 registres complets
  (`bash eines/seguiment.sh --agregat`). Unes 14 h 14 min.
- **La màquina virtual:** el lot va acabar a les 08:02:28, amb 110 branques acabades, cap de fallada i els 110 registres
  complets. Unes 18 h 42 min.
- **Les captures, després de la sèrie** (AUD-118): `node eines/pilot.mjs maduracio --comprova-captures`, a cada màquina, des de la
  carpeta de `521039c`. Totes dues van donar "La comprovació de les captures del pilot maduracio: tot correcte." (codi 0): el PC
  a les 07:50, i la màquina virtual a les 08:03.
- **Els registres:** els 220 JSONL, els 220 registres de text i els dos `lot-*.out` són a `branques/`.
  - **D'on vénen:** copiats de les dues màquines, amb les SHA-256 comprovades.
  - **Dades internes:** cap, comprovat amb `grep`.
- **Les captures** no van a git:
  - les de partida, 24 d'envellides i 110 de transformades;
  - les dels establiments de les branques, 150: 69 del PC i 81 de la màquina virtual.
  - **La còpia de seguretat:** n'hi ha una de totes, amb les SHA-256 comprovades.

**El que vam veure abans de l'anàlisi.**
- **Quan:** cap a les 07:47, en fer la còpia de seguretat de les captures del PC. La màquina virtual encara tenia 3 branques
  en marxa.
- **Què:** la mida de la carpeta de les branques del PC (557 MB) i el nombre de captures d'establiment que hi havia (69). Cada
  branca que s'estableix en desa fins a tres.
- **Per què no canvia res:** l'anàlisi ja era escrita i fixada (la PR #23), i no en depèn.

**Una errada latent als noms de les captures.** El nom de cada captura d'establiment porta la llavor de la continuació i les
èpoques, però no el braç. Els cinc braços d'un món comparteixen la llavor i corren a la mateixa màquina. Si dos braços d'un món,
amb la mateixa llavor, s'haguessin establert al mateix cens, el segon hauria sobreescrit les captures del primer.
- **Què ha passat:** cap col·lisió. Totes les captures que havien d'escriure les 51 branques establertes hi són, cadascuna amb
  un nom propi (comprovat amb els registres).
- **Què no afecta:**
  - l'anàlisi, que només llegeix els registres;
  - la prova dels zeros, perquè les seves branques no desen cap captura.
- **Per a la sèrie:** cada branca ha de desar les captures a una carpeta pròpia. Es porta a l'auditoria 19.

## L'anàlisi (27-10-2026)

- **L'ordre:** `node eines/maduracio-analisi.mjs > fase2/resultats/maduracio/pilot/analisi.txt`, amb codi de sortida 0.
  - **Des d'on:** `main` a `8ea4e93`, el merge de la PR #23.
  - **On i quan:** al PC, amb Node 16.15.1, a les 08:03:44.
- **La sortida,** tal com va sortir: `analisi.txt`, SHA-256 `abee5c30f6c75798d31041f66693ea79d95729412d2afb1184726088323ce63e`.
- **La validació:** 220 branques de 220, totes vàlides. El codi dels registres és `521039c`, i el simulador, el de la preparació
  (`4fa032b`).
- **La comprovació independent,** feta després: un script que només llegeix els JSONL i el manifest, sense cap mòdul del projecte.
  - **Què dona:** la mateixa taula principal (els establiments, els mons, la RMST, les medianes, els contrastos món a món i la
    separació pel punt de partida).
  - **Els finals:** 51 branques s'aturen per l'establiment, i 169 arriben a l'horitzó.

### Els resultats

| Braç | Branques establertes | IC exacte del 95 % (\*) | Mons amb algun establiment | RMST (èpoques) | *T* dels establerts, mediana |
|---|---|---|---|---|---|
| `continue` | 12 de 44 (27,3 %) | 15,0–42,8 % | 11 de 22 | 7.210 | 5.500 |
| `shuffle-programs` | 13 de 44 (29,5 %) | 16,8–45,2 % | 10 de 22 | 6.926 | 4.750 |
| `shuffle-within` | 6 de 44 (13,6 %) | 5,2–27,4 % | 5 de 22 | 7.489 | 4.625 |
| `shuffle-all` | 12 de 44 (27,3 %) | 15,0–42,8 % | 12 de 22 | 6.756 | 3.250 |
| `reinit` | 8 de 44 (18,2 %) | 8,2–32,7 % | 6 de 22 | 7.477 | 5.625 |

(\*) Calculat després, com a descriptiu. Tracta les branques com a independents, que és el que diu la concordança entre llavors
(*rho* = 0,03).

- **Cada braç contra `continue`, món a món** (la proporció dels dos; sense cap prova):

  | Braç | Més alta | Més baixa | Igual |
  |---|---|---|---|
  | `shuffle-programs` | 7 | 7 | 8 |
  | `shuffle-within` | 1 | 7 | 14 |
  | `shuffle-all` | 8 | 8 | 6 |
  | `reinit` | 3 | 7 | 12 |

- **El punt de partida** (el criteri de les hereditàries soles): els mons amb alguna hereditària sola a l'escaneig del braç no
  s'estableixen més que els altres.
  - **`shuffle-all`:** amb alguna (9 mons), 3 de 18 branques (16,7 %); sense cap (13 mons), 9 de 26 (34,6 %).
  - **Els altres braços:** amb alguna, `shuffle-programs` 1 de 4, `shuffle-within` 1 de 8 i `reinit` 2 de 8. `continue` no en té
    cap.
- **La concordança entre llavors:** *rho* = 0,03.
  - **Què vol dir:** les dues llavors d'un món coincideixen gairebé només per atzar.
  - **Per braç:** a `continue`, coincideixen a 12 mons de 22 (*phi* −0,06); a `reinit`, a 18 (*phi* 0,39).
- **El primer cens amb algun hereditari,** des del començament (la mediana de les branques que en tenen algun): 2.250 èpoques a
  `shuffle-all` (16 de 44 branques), i 4.750 a `continue` (17 de 44).
- **El cost:**
  - **En total:** 158,5 h de branques (la suma dels temps, amb les altres corrent alhora), unes 7,2 h per món.
  - **Per branca:** 0,72 h de mitjana. `shuffle-all` és el braç més car (38,0 h), i `reinit`, el més barat (26,7 h).
  - **Per màquina:** Node 16 al PC i Node 20 a la màquina virtual van a la mateixa velocitat, unes 377 s per 1.000 èpoques.
  - **El temps de rellotge:** unes 19 h per a les 220 branques, amb 10 alhora.

### La lectura, tal com era escrita

- **No en surt cap conclusió:** és un calibratge exploratori, i amb 44 branques per braç els intervals s'encavalquen tots.
- **El contrast `continue` contra `shuffle-all`** compara tractaments sencers.
  - **Què dona:** 12 contra 12 establiments, i 8 mons a favor de cada braç, amb 6 d'iguals.
  - **El que no se'n diu:** res de causal sobre la maduració.
- **`shuffle-all`, la composició envellida amb la seva propensió immediata:** la propensió no s'hi veu.
  - **Com començava:** amb més cel·les que es repliquen que cap altre braç, i hereditàries als 22 mons.
  - **Què fa:** no s'estableix més que `continue`, i els mons que tenien alguna hereditària sola s'hi estableixen menys.
- **El que ens servirà per a la sèrie,** mirat després i, per tant, sense cap valor de prova:
  - **Les diferències més grans:** `shuffle-within` (1 món més alt, 7 més baixos) i `reinit` (3 i 7), totes dues per sota de
    `continue`. Amb 4 contrastos mirats després, una diferència així pot sortir per atzar.
  - **Les dades de la llei 2, per comparar:** a l'edat 8.000, 16 de 72 mons (22,2 %, IC 13,3–33,6 %); un món nou, 8 de 80
    (10,0 %, IC 4,4–18,8 %). `continue` hi encaixa, i `reinit` queda entre els dos.
  - **La concordança:** amb una *rho* de 0,03, les dues llavors d'un món valen gairebé com dues observacions independents.
  - **El cost:** unes 0,72 h per branca. Cal sumar-hi l'envelliment i l'escaneig de cada món.
- **El braç `shuffle-all` "inert"** que preveia la lectura es discutirà a l'auditoria 19, amb el disseny de la sèrie.
