# El pilot de l'aparició i l'arrelament · on actua la maduració

**Versió: v0.1 (16-11-2026), l'esborrany del disseny.** Encara no s'ha calculat res. Abans del pilot vénen quatre passos: la prova de
viabilitat (§9, pel carril d'explorar), el pla v0.2 amb les xifres que en surtin, les eines en una PR (§7) i l'auditoria 32 del pla i de
la PR, abans de calcular (la síntesi de l'auditoria 31, el punt 4).
- **La decisió que el fa possible:** el 16-11-2026, el responsable tria l'opció 2 de la T-64, l'assaig d'invasió, com una excepció escrita
  a la regla del projecte (§2, i `docs/disseny.md`).
- **El que ja sabem i el pilot fa servir:**
  - la sèrie de la maduració (l'entrada 14);
  - els passos 1, 2a, 2b i 3 de la línia (les entrades 16 a 19);
  - l'experiment de sembra de l'article de 2024 (FON-16);
  - el mínim del pilot dels dos auditors (la síntesi de l'auditoria 31).

## 1. La pregunta

**La sèrie de la maduració** (l'entrada 14) diu que, en mons quiets que arriben sense vida a l'època 8.000, la vida s'hi estableix més
sovint si es conserva la sopa envellida (64 branques de 300) o el seu histograma barrejat (82) que amb una sopa nova (40). Les xifres
són les establertes en les 8.000 èpoques següents. És l'efecte total. No diu on actua.

**El ritme d'establiment d'un braç és el producte de dues coses:**
- **el ritme d'aparició:** quants replicadors hereditaris nous hi apareixen, per món i època;
- **la probabilitat d'arrelar:** quina part d'aquests acaba ocupant el món.

La maduració pot actuar sobre totes dues. Fins que no es mesurin per separat, no se'n diu res (AUD-184 = AU2-151).

**El pilot les mesura per separat, als mateixos mons i amb els mateixos braços:**
- **Part A, l'assaig d'invasió (§4).** Un mateix replicador, plantat en una cel·la, a la sopa envellida, a la barrejada i a la nova d'un
  mateix món. És la probabilitat d'arrelar, *p*R, de cada sopa. És el que fa l'article de 2024 a la sopa barrejada de BFF: un replicador
  nascut en una tirada, sembrat en 1.000 sopes noves, en pren la sopa el 22 % de les vegades en 128 èpoques. Ningú no ha mirat si la
  maduració canvia aquest 22 %.
- **Part B, les aparicions naturals (§5).** Els mateixos mons i braços, sense plantar res, amb un cens nou de companys inerts. Compta
  quantes famílies hereditàries hi apareixen i es detecten, i quantes arrelen.
- **La consistència (l'auditor 1, §6).** Les famílies naturals detectades i els llinatges plantats detectats han d'arrelar en la mateixa
  proporció. Si no ho fan, el replicador plantat no representa els que hi apareixen sols.

**Com es llegirà, fixat ara** (§6). A la sèrie, els quocients del ritme d'establiment són:
- **1,6** entre l'envellida i la nova;
- **2,05** entre la barrejada i la nova.

| Si el quocient de *p*R entre dues sopes... | ...es dirà |
|---|---|
| s'acosta al de l'establiment i no a 1 | la maduració actua, almenys en part, sobre l'arrelament d'aquest replicador |
| s'acosta a 1 i no al de l'establiment, i el de les aparicions sí que hi és | actua sobre l'aparició |
| no se separa de cap dels dos | el pilot no ho pot dir |

**És exploratori.** Si en surt res, es confirma amb mons nous, protocol, auditoria i segell (el carril de confirmar).

## 2. L'excepció de la regla (T-64)

**La regla del projecte:** «dissenyem les lleis, mai els organismes». Cap replicador plantat en cap experiment. El responsable hi fa una
sola excepció, el 16-11-2026:
- **Què s'hi permet:** plantar un replicador nascut als mons del projecte, només a la part A del pilot, per mesurar l'arrelament.
- **Què no s'hi permet:** cap replicador plantat en cap sèrie de l'abiogènesi, ni a la part B, ni a cap experiment que mesuri si la vida hi
  apareix.
- **Com es diu:** «arrela un replicador plantat», mai «la vida hi neix» ni «la vida s'hi estableix», sense dir que és plantat.
- **On es veu:** a cada registre de la part A, l'ordre porta `--plant`, i la línia d'inici, el programa plantat i d'on surt.

## 3. Els mons

- **Mons nous, com diu la decisió de l'11-11-2026:** les 150 captures de la sèrie de la maduració ja no hi serveixen, perquè s'hi ha fet
  la pista.
- **Les llavors:** de la 7001 a la 7100, en aquest ordre. Cap no s'ha fet servir. Les ocupades són de la 1001 a la 1080, de la 2001 a la
  2080, de la 5001 a la 5024 i de la 6001 a la 6400 (la llista de la sèrie, envellida fins a la 6196). De la 8001 en amunt, per a una
  confirmació, si cal.
- **L'envelliment:** el de la sèrie (`docs/protocol-maduracio.md`, §2):
  - 512 × 256, radi 2, corrent 0, generador v2, i cens v3 cada 250 èpoques;
  - fins a l'època 8.000, amb `--stop-after-event 0`.
- **La cohort:** la de la sèrie:
  - cap establiment fins a l'època 8.000;
  - cap cel·la hereditària a l'escaneig de totes les cel·les amb la prova del cens.
  Hi entren els *N* primers de la llista que passen totes dues regles. Proposta: *N* = 60, que es fixa a la v0.2 (§8).
- **Els braços de cada món,** amb l'atzar de la transformació de la sèrie (la llavor del món + 600.000):
  - `continue`: la sopa envellida, tal com és;
  - `shuffle-all`: els bytes del món barrejats, amb l'histograma intacte;
  - `reinit`: una sopa nova.
- **El punt de partida de cada braç** (l'auditor 2: el control de la sopa de partida), dos escanejos de totes les cel·les:
  - **amb la prova del cens,** com a la sèrie;
  - **amb companys inerts,** en 3 condicions: les 3 primeres de la llavor del pas 2b, 3000000000.

  No n'exclou cap braç. `shuffle-all` en crea, de replicadors (AU2-154), i es diu.

## 4. Part A: l'assaig d'invasió

### 4.1 Els replicadors que es planten

**Quatre genotips nascuts als mons del projecte,** cap d'un món del pilot. Els tria la regla, no l'equip:
- **G1, el brot del món 1034** (el pas 3): una aparició natural que no va arrelar.
  - **D'on es tria:** dels programes que són hereditaris sols en les 100 condicions de companys inerts a la captura 5.200 (els registres
    del pas 3, a git).
  - **Com:** un a l'atzar, amb `eines/tria.mjs` i la llavor 20261116.
- **G2, G3 i G4: la família dominant a l'establiment** (AU2-147) d'una branca establerta del pilot de la maduració (l'entrada 12).
  - **Un per braç:** `continue`, `shuffle-all` i `reinit`. N'hi ha 12, 12 i 8 d'establertes.
  - **La branca de cada braç:** a l'atzar, amb `eines/tria.mjs` i la mateixa llavor.
  - **El programa:** a la captura de l'establiment (la del cens que el confirma), els 50 programes més freqüents es proven amb les 100
    condicions. Es tria el més freqüent dels que són hereditaris sols en 95 o més.
- **Si un genotip no fa almenys 95 de 100** sol amb companys inerts, la regla passa al següent: el programa següent de G1, o la branca
  següent del sorteig.
- **Cada món rep un sol genotip,** el mateix a tots els seus braços. Els mons, en un ordre a l'atzar (llavor 20261116), se'ls reparteixen
  per torns: 15 mons per genotip si *N* = 60.
  - **Per què el mateix a tots els braços:** les comparacions entre sopes es fan dins de cada món, i el genotip no les confon.
  - **Què se'n veu:** si l'efecte depèn del genotip, de manera descriptiva.

### 4.2 La sembra

- **La dosi:** una cel·la, com l'article de 2024. Els 64 bytes de la cel·la es canvien pels del genotip, en el sentit en què es va
  registrar. La resta del món no es toca.
- **On:** *K* posicions per món, a l'atzar entre les cel·les a 2 o més de cada vora, de manera que tenen els 24 veïns. Proposta: *K* = 2,
  que es fixa a la v0.2.
  - **El sorteig:** el generador v2, amb la llavor del món + 700.000.
  - **Les mateixes posicions a tots els braços d'un món.**
- **Sense captures noves.** La sembra és una opció de `sim.mjs` (`--plant fitxer.json`). Funciona així:
  - **el fitxer:** el fa `eines/sembra.mjs`, i diu la SHA-256 de la captura de partida, la cel·la i els 64 bytes. Va a git, amb el
    manifest;
  - **a la memòria:** `sim.mjs` comprova la SHA-256 i canvia els 64 bytes, abans de la primera època;
  - **per què:** 660 captures sembrades serien més de 5 GB. La màquina virtual no les hi cap.
- **L'atzar de la continuació:**
  - la posició *k* té la llavor del món + 400.000 + 100.000 × (*k* − 1): la a i la b de la sèrie;
  - la posició 1 té el bessó natural de la part B (§5). El seu món, sense la sembra, és la branca de la part B amb el mateix món, braç i
    llavor.
  - **Què tenen en comú els bessons:** l'atzar del món (les parelles i les mutacions), que no depèn del contingut de les cel·les.
  - **Què pot divergir:** el del cens, quan una cel·la que prova és diferent.

### 4.3 Els braços

| Braç | La sopa | Què s'hi planta | Per a què |
|---|---|---|---|
| `continue` | l'envellida | el genotip | l'arrelament a la sopa madura |
| `shuffle-all` | l'histograma de l'envellida, barrejat | el genotip | la composició, sense la disposició |
| `reinit` | una de nova | el genotip | la referència |
| `byte0` | l'envellida, sense cap `<` al primer byte | el genotip | la regla del primer byte (l'auditor 1) |
| `byte0-placebo` | l'envellida, amb el mateix nombre d'intercanvis lluny del primer byte | el genotip | el placebo de `byte0` |
| `sham` (a cada sopa) | `continue`, `shuffle-all` i `reinit` | els bytes del genotip, permutats, que no es copien | el que fa escriure una cel·la (l'auditor 2) |

- **`byte0` i `byte0-placebo`** (dos tipus nous d'`eines/transforma.mjs`; l'atzar, la llavor del món + 650.000):
  - **`byte0`:** a cada programa que comença amb `<`, el primer byte s'intercanvia amb un byte del mateix programa que no sigui `<`, triat
    a l'atzar;
  - **`byte0-placebo`:** als mateixos programes, s'intercanvien dos bytes diferents de les posicions 1 a 63, triats a l'atzar;
  - **què conserven tots dos:** la composició de cada programa i l'histograma del món;
  - **la diferència:** només `byte0` treu el `<` del primer byte. A la sopa envellida, hi comença el 7,5 % dels programes, contra el 4 %
    dels bytes (el pas 2a).
- **El `sham`:**
  - **els bytes:** els del genotip, en un ordre a l'atzar (la llavor del món + 800.000);
  - **la condició:** no es pot copiar en cap de les 100 condicions de companys inerts. Si es copia, s'agafa la permutació següent;
  - **on:** a la posició 1, amb la llavor a, a les tres sopes d'un terç dels mons (els 20 primers de l'ordre a l'atzar si *N* = 60);
  - **contra què es compara:** amb el bessó natural de la part B.

### 4.4 Les branques

- **L'ordre:** `node sim.mjs --world 512x256 --from BRAÇ.bin --start 8000 --epochs 8000+H --seed S --mixing 0 --census 250 --census-version
  v3 --rng v2 --stop-after-event 0 --plant FITXER --lineage-every 50 --stop-on-extinction --inert-census 4096 --json ...`.
  - **Les opcions noves:** les de la PR (§7).
  - **Les captures:** cap no se'n desa, com a la sèrie.
- **L'horitzó *H*:** l'arrelament ha de cabre a l'horitzó, i els establiments naturals hi han de ser pocs. Proposta: *H* = 2.000. Es fixa
  amb la prova de viabilitat.
- **L'aturada:** la branca s'atura en el primer d'aquests casos:
  - el llinatge s'extingeix: `--stop-on-extinction` (§4.5), perquè la majoria dels llinatges deuen morir aviat i això en fa la part A molt
    més barata;
  - s'hi estableix la vida (el criteri de la llei 2);
  - s'arriba a *H*.

  Els `sham` no tenen llinatge: s'aturen a l'establiment o a *H*.

### 4.5 La mesura

**El llinatge** (`--lineage-every 50`), cada 50 èpoques:
1. **Les cel·les del llinatge:** les que porten alguna finestra del llinatge. Una finestra és un tros de 16 bytes amb almenys 6 valors
   diferents, en qualsevol dels dos sentits: la de la prova de replicació. En diem *M* les cel·les.
2. **La prova:** com a molt 256 de les *M*, triades amb l'atzar del llinatge (la llavor del món + 900.000), amb companys inerts en les 3
   condicions. Si *M* ≤ 256, totes.
3. **Les funcionals:** les hereditàries en alguna de les 3 condicions. *F* n'és l'estimació per a tot el món: *M* × la fracció de les
   provades.
4. **Les finestres:** les de les funcionals s'afegeixen a les del llinatge. Així el llinatge se segueix encara que les mutacions en
   canviïn els bytes. Les mutacions toquen una finestra de 16 bytes cada 260 èpoques, de mitjana.

**Els tres desenllaços:**
- **Arrela** (la mesura principal): *F* ≥ 1.311 cel·les, l'1 % del món, en dos punts del llinatge separats per 250 èpoques, dins de *H*.
  És el criteri de la llei 2, amb companys inerts i per al llinatge.
- **S'extingeix:** *F* = 0 en dos punts seguits. Quan *M* ≤ 256, és exacte.
- **Censurat:** ni una cosa ni l'altra a *H*.

**També, de cada branca:**
- **l'establiment de la llei 2** (el cens v3), i si el llinatge n'és la família dominant;
- **el temps** fins a arrelar i fins a extingir-se;
- **la mida màxima;**
- **el cens inert** (§5): si ha vist el llinatge, i quan. És la calibració de la part B.

**Les xifres de cada sopa:**
- ***p*R:** la part de les sembres que arrelen, amb un interval del bootstrap per món (el món és la unitat, AU2);
- **els contrastos, aparellats per món:**
  - `continue` contra `reinit`;
  - `shuffle-all` contra `reinit`;
  - `byte0` contra `byte0-placebo`;
- **per genotip:** de manera descriptiva;
- **el 22 % de l'article de 2024:** només com a referència, perquè és un altre sistema. Allà, la sopa barrejada i 128 èpoques; aquí, el món
  2D i *H*.

## 5. Part B: les aparicions naturals

- **Les branques:** els mateixos mons i braços (`continue`, `shuffle-all` i `reinit`), amb la llavor a i sense res plantat.
  - *H* = 8.000, com a la sèrie;
  - aturades a l'establiment.
  - **Què en surt:** els bessons naturals de la part A, i el ritme d'establiment d'aquests mons.
- **El cens inert** (`--inert-census 4096`): a cada cens (cada 250 èpoques), 4.096 cel·les a l'atzar.
  - **L'atzar:** un de propi, amb la llavor 20261116, independent del món i del cens v3.
  - **La prova:** amb companys inerts, en les 3 condicions.
  - **Què s'escriu:** de cada cel·la que es copia en alguna condició, la posició, el programa i les cadenes.
  - **El que no toca:** l'atzar del món. La història és la mateixa amb aquest cens o sense, i la PR ho comprova (§7).
- **Per què 4.096 cada 250 èpoques:**
  - **l'escaneig del pas 3:** un cens de 2.048 cel·les cada 100 èpoques hauria vist el brot del 1034 unes 9 vegades de cada 10;
  - **amb 4.096 cada 250,** un brot de 50 cel·les surt a cada cens amb una probabilitat d'un 80 %, i costa una cinquena part menys.
    Afegeix un 9 % a cada branca.
  - **On es fixa:** a la v0.2, amb les mides dels llinatges de la prova de viabilitat.
- **Una aparició:** la primera detecció d'una família nova amb alguna cel·la hereditària.
  - **Nova:** que no comparteix cap finestra amb cap família detectada abans a la branca.
  - **Hereditària, tornada a provar:** el programa que n'ha escrit el registre es torna a provar després, en les 100 condicions, i només
    compta si és hereditari en alguna (AU2-152). La prova amb companys inerts només depèn dels bytes del programa: no cal cap captura.
  - **El temps:** és el de la detecció, no el de la formació (l'auditor 2).
- **L'arrelament natural:** si la família detectada és la família dominant a l'establiment, és a dir, la que té més cel·les hereditàries
  al cens inert del cens que el confirma.
- **Les xifres de cada sopa:**
  - ***λ*A:** les aparicions detectades per cada 1.000 mon-èpoques d'exposició, abans de l'establiment;
  - ***P*(arrela | detectada):** la part de les famílies detectades que arrelen;
  - **el ritme d'establiment.**
- **La sensibilitat del detector** (l'auditor 2): a la part A també corre el cens inert, i el llinatge en dona la mida real. D'aquí
  surt la probabilitat de detectar un llinatge, segons la mida i la durada, a cada sopa.

## 6. L'anàlisi (fixada a la v0.2, abans de calcular)

1. ***p*R de cada sopa** (la part A), amb els intervals, i els quocients entre `continue` i `reinit` i entre `shuffle-all` i `reinit`.
2. ***λ*A de cada sopa** (la part B), amb els intervals, i els mateixos quocients.
3. **La consistència** (l'auditor 1): a cada sopa, *P*(arrela | detectada) de les famílies naturals, contra la dels llinatges plantats
   que el cens inert ha detectat. Si coincideixen, el genotip plantat representa els naturals, i *λ*A × *P*(arrela | detectada) dona el
   ritme d'establiment. Si no, es diu, i la part A només parla d'aquests genotips.
4. **La lectura** (§1): els quocients de *p*R i de *λ*A, contra el de l'establiment de la sèrie (1,6 i 2,05) i contra 1.
5. **`byte0` contra el seu placebo.**
6. **Els descriptius:** el punt de partida de cada braç, els genotips, els `sham` contra els bessons naturals, les durades i les mides
   dels llinatges, i el temps fins a arrelar.

L'script de l'anàlisi s'escriu i es prova amb dades sintètiques abans de calcular, com al pas 3, i va a la PR.

## 7. Les eines (una PR, amb l'auditoria 32)

- **`eines/sembra.mjs`:** el fitxer de cada sembra i dels `sham`, amb les comprovacions:
  - el genotip, 95 de 100 o més;
  - el `sham`, 0 de 100;
  - la cel·la, a l'interior;
  - la SHA-256 de la captura.
- **`sim.mjs`**, amb un mòdul nou (`fase2/llinatge.js`), quatre opcions:
  - `--plant`;
  - `--lineage-every`;
  - `--stop-on-extinction`;
  - `--inert-census`.

  **Sense aquestes opcions, res no canvia.** Les empremtes de `test/determinisme.mjs` i els valors del cens v2 i v3 han de ser els
  mateixos (`CLAUDE.md`).
- **`eines/transforma.mjs`:** `byte0` i `byte0-placebo`, amb els invariants comprovats (el que conserven, i que només toquen els
  programes que comencen amb `<`).
- **`eines/pilot.mjs arrelament`:** les llistes (l'envelliment, les transformacions, les sembres i les branques), el manifest i les
  comprovacions abans de llançar.
- **`eines/arrelament-analisi.mjs`:** l'anàlisi de la §6.
- **Les proves:**
  - la sembra només canvia 64 bytes;
  - el `sham` no es copia;
  - amb el cens inert i el llinatge, i sense res plantat, la història és la mateixa: els censos v3 i l'empremta final;
  - el llinatge en un món sintètic, amb un replicador que creix i un que s'extingeix;
  - l'anàlisi amb dades sintètiques.
- **Si es vol, la PR petita de l'auditoria 31** (el punt 5): `windowsOf` amb un `Buffer`.

## 8. El cost (proposta, per a *N* = 60 i *K* = 2; es fixa a la v0.2)

| Què | Quantes | Hores de CPU |
|---|---|---|
| L'envelliment | uns 74 mons, perquè a la sèrie n'entrava el 81 % (0,45 h cadascun) | 33 |
| Els escanejos de l'època 8.000 | la inclusió (74) i el punt de partida dels braços (180, amb la prova del cens i amb companys inerts) | 26 |
| La part B | 180 branques, de fins a 8.000 èpoques (unes 0,85 h) | 153 |
| La part A | 660 branques, de fins a 2.000 èpoques (0,27 h com a molt): 360 dels tres braços, 240 de `byte0` i el placebo, 60 de `sham` | 178 com a molt |
| **En total** | | **unes 390 com a molt** |

- **El temps real:** a la sèrie, el PC (6 alhora) i la màquina virtual (4) van fer unes 9,5 h de CPU per hora. El pilot hi trigaria uns
  dos dies, menys si l'aturada a l'extinció escurça la part A.
- **La precisió que es demanarà a la v0.2** (fixada ara): *N* i *K* han de fer prou estret l'interval del quocient de *p*R entre `continue`
  i `reinit`. Ha de distingir 1 de 1,6: una semiamplada de log(1,6)/2 com a molt, amb la *p*R de la prova de viabilitat.
  - **Si cal més de tres dies,** es redueix la part B abans que la part A, i es diu.

## 9. La prova de viabilitat (abans de la v0.2, pel carril d'explorar)

**Per a què:** per fixar *H*, *K* i *N*. També per saber:
- si els quatre genotips arrelen alguna vegada, i no sempre;
- quant viuen els llinatges que s'extingeixen;
- quant costa una branca.

**Les dades: els 22 mons del pilot de la maduració** (de la 5001 a la 5024), a les captures dels seus braços a l'època 8.000. No són
mons del pilot, de manera que les xifres que fixen el disseny no surten de les dades que es mesuraran. Les branques del pilot de la
maduració amb la llavor a són, a més, els seus bessons naturals, ja calculats.

**Què es fa:**
- **els quatre genotips,** triats amb la regla de la §4.1 (la primera feina d'aquest pas);
- **6 mons,** a l'atzar entre els 22, sense els tres d'on surten G2, G3 i G4;
- **les tres sopes,** una posició i la llavor a: 72 branques de fins a 4.000 èpoques;
- **la dosi** (l'auditor 2): G1 en un quadrat de 3 × 3 cel·les, als mateixos 6 mons i les tres sopes. Són 18 branques més, descriptives;
- **les branques:** amb les eines d'ara (`sim.mjs` sense canvis), amb una captura cada 100 èpoques a D: (unes 40 per branca), que s'esborren
  després, perquè es poden refer;
- **el llinatge,** a cada captura després de calcular, amb la mesura de la §4.5 (un script, com al pas 3).

**El carril:** una nota a git abans de calcular, des d'un commit net, amb la prova curta abans del càlcul llarg, els registres a git
abans de mirar-los, i l'etiqueta «exploratori».
- **El pressupost:** com a molt, 90 branques × 4.000 èpoques, unes 40 h de CPU, unes 5 h amb 8 processos.
- **Què canviaria el disseny:**
  - **si cap genotip no arrela mai,** la part A es fa amb el quadrat de 3 × 3, o amb un *H* més llarg;
  - **si arrelen gairebé sempre,** la part A no distingiria les sopes, i caldria una dosi més petita o un *H* més curt;
  - **si la meitat dels que arrelen triguen més de *H*/2,** *H* s'allarga;
  - **si gairebé tots els que s'extingeixen ho fan en 200 èpoques,** l'aturada a l'extinció fa la part A barata, i *K* puja.

## 10. Els límits, d'entrada

- **Un replicador plantat no és una aparició natural.** El genotip, el lloc (una cel·la a l'atzar) i el moment (l'època 8.000) són
  nostres. Que el plantat representi els naturals no se suposa: ho prova la consistència (§6.3).
- **Quatre genotips.** L'arrelament pot dependre del genotip, i el pilot només en veurà la variació gruixuda.
- **Dues mesures, dos noms:**
  - **«arrela»:** el criteri del llinatge, amb companys inerts;
  - **«s'estableix»:** el de la llei 2, amb companys de soroll.
- **Una aparició es veu quan es detecta.** El seu temps és el de la detecció, amb la sensibilitat mesurada en els llinatges plantats.
- **Exploratori.** Cap afirmació causal general fins a una confirmació amb mons nous (el criteri de l'auditor 2 per passar del pilot a
  una confirmació).

## 11. El que ve

1. **La decisió de la T-64,** a `docs/disseny.md` i a `CLAUDE.md`, i aquest pla, a `main`.
2. **La prova de viabilitat** (§9): la nota, els scripts, la prova curta i el càlcul. Els registres, a git abans de mirar-los.
3. **El pla v0.2,** amb *H*, *K*, *N* i la mida del cens inert, i la PR de les eines, amb prova-neta.
4. **L'auditoria 32** del pla i de la PR, abans de calcular.
5. **El pilot:** l'envelliment, els escanejos i les transformacions, i les parts A i B. Uns dos dies de màquina.
6. **La ronda d'auditoria dels resultats,** i l'entrada del quadern.
