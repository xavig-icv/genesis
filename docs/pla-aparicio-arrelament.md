# El pilot de l'aparició i l'arrelament · on actua la maduració

**Versió: v0.2 (16-11-2026), amb les xifres de la prova de viabilitat, per a l'auditoria 32.** Del pilot, no s'ha calculat res. La prova de
viabilitat (§9) sí, pel carril d'explorar, en uns altres mons: és a `fase2/resultats/arrelament/viabilitat/`. Les eines són en aquesta PR
(§7), i res no es calcula fins després de l'auditoria i del merge.
- **La decisió que el fa possible:** el 16-11-2026, el responsable tria l'opció 2 de la T-64, l'assaig d'invasió, com una excepció escrita
  a la regla del projecte (§2, i `docs/disseny.md`).
- **De la v0.1 a la v0.2** (la prova de viabilitat, §9):
  - **cada món, totes les variants,** en branques a part: els quatre genotips en una cel·la i G1 en un quadrat de 3 × 3 (§4.1). Les sembres
    que s'extingeixen costen menys d'un minut;
  - **el contrast principal, amb les variants informatives** (G1, G1 × 9 i G4), estratificat per variant. G2 i G3 arrelen gairebé sempre:
    al sostre, no podrien mostrar que una sopa n'afavoreix l'arrelament (§4.5 i §6);
  - ***K* = 4 posicions** per a les variants informatives, i 1 per a G2 i G3 (§4.2);
  - ***H* = 1.500** i l'aturada a l'establiment 500 èpoques més tard, perquè el criteri del llinatge s'hi pugui complir (§4.4);
  - **la família dominant a l'establiment, amb el cens inert,** que ara diu quantes de les seves hereditàries són del llinatge (§4.5);
  - ***N* = 60, i el cens inert de 4.096 cel·les cada 250 èpoques,** fixats (§3, §5 i §8);
  - **les llavors de continuació,** que a la v0.1 coincidien amb les d'altres usos a partir de la tercera posició (§4.2);
  - **dues correccions de la v0.1:** la captura d'on surten G2, G3 i G4 és la de l'època de l'establiment, el primer dels dos censos, i no
    la del cens que el confirma (no es desa); i, a la §9, «un *H* més curt» no feia la part A més sensible (censuraria).
- **El que ja sabem i el pilot fa servir:**
  - la sèrie de la maduració (l'entrada 14);
  - els passos 1, 2a, 2b i 3 de la línia (les entrades 16 a 19);
  - l'experiment de sembra de l'article de 2024 (FON-16);
  - el mínim del pilot dels dos auditors (la síntesi de l'auditoria 31);
  - la prova de viabilitat (§9).

## 1. La pregunta

**La sèrie de la maduració** (l'entrada 14) diu que, en mons quiets que arriben sense vida a l'època 8.000, la vida s'hi estableix més
sovint si es conserva la sopa envellida (64 branques de 300) o el seu histograma barrejat (82) que amb una sopa nova (40). Les xifres
són les establertes en les 8.000 èpoques següents. És l'efecte total. No diu on actua.

**El ritme d'establiment d'un braç és el producte de dues coses:**
- **el ritme d'aparició:** quants replicadors hereditaris nous hi apareixen, per món i època;
- **la probabilitat d'arrelar:** quina part d'aquests acaba ocupant el món.

La maduració pot actuar sobre totes dues. Fins que no es mesurin per separat, no se'n diu res (AUD-184 = AU2-151).

**El pilot les mesura per separat, als mateixos mons i amb els mateixos braços:**
- **Part A, l'assaig d'invasió (§4).** Les mateixes variants, plantades en les mateixes cel·les, a la sopa envellida, a la barrejada i a la
  nova d'un mateix món. És la probabilitat d'arrelar, *p*R, de cada sopa. És el que fa l'article de 2024 a la sopa barrejada de BFF: un
  replicador nascut en una tirada, sembrat en 1.000 sopes noves, en pren la sopa el 22 % de les vegades en 128 èpoques. Ningú no ha mirat si
  la maduració canvia aquest 22 %.
- **Part B, les aparicions naturals (§5).** Els mateixos mons i braços, sense plantar res, amb un cens nou de companys inerts. Compta
  quantes famílies hereditàries hi apareixen i es detecten, i quantes arrelen.
- **La consistència (l'auditor 1, §6).** Les famílies naturals detectades i els llinatges plantats detectats han d'arrelar en la mateixa
  proporció. Si no ho fan, els plantats no representen els que hi apareixen sols.

**Com es llegirà, fixat ara** (§6). A la sèrie, els quocients del ritme d'establiment són:
- **1,6** entre l'envellida i la nova;
- **2,05** entre la barrejada i la nova.

| Si el quocient de *p*R entre dues sopes... | ...es dirà |
|---|---|
| s'acosta al de l'establiment i no a 1 | la maduració actua, almenys en part, sobre l'arrelament d'aquestes variants |
| s'acosta a 1 i no al de l'establiment, i el de les aparicions sí que hi és | actua sobre l'aparició |
| és més petit que 1 i no conté 1 | l'arrelament d'aquestes variants hi és més difícil, i l'efecte de l'establiment ha de venir de l'aparició |
| no se separa de cap dels dos | el pilot no ho pot dir |

**És exploratori.** Si en surt res, es confirma amb mons nous, protocol, auditoria i segell (el carril de confirmar).

## 2. L'excepció de la regla (T-64)

**La regla del projecte:** «dissenyem les lleis, mai els organismes». Cap replicador plantat en cap experiment. El responsable hi fa una
sola excepció, el 16-11-2026:
- **Què s'hi permet:** plantar un replicador nascut als mons del projecte, només a la part A del pilot (i a la seva prova de viabilitat),
  per mesurar l'arrelament.
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
  Hi entren els *N* = 60 primers de la llista que passen totes dues regles (§8). A la sèrie n'hi entrava el 81 %: se n'envelleixen uns 74,
  per rondes, com a la sèrie.
- **Els braços de cada món,** amb l'atzar de la transformació de la sèrie (la llavor del món + 600.000):
  - `continue`: la sopa envellida, tal com és;
  - `shuffle-all`: els bytes del món barrejats, amb l'histograma intacte;
  - `reinit`: una sopa nova.
- **El punt de partida de cada braç** (l'auditor 2: el control de la sopa de partida), dos escanejos de totes les cel·les:
  - **amb la prova del cens,** com a la sèrie;
  - **amb companys inerts,** en 3 condicions: les 3 primeres de la llavor del pas 2b, 3000000000.

  No n'exclou cap braç. `shuffle-all` en crea, de replicadors (AU2-154), i es diu.

## 4. Part A: l'assaig d'invasió

### 4.1 Les variants

**Quatre genotips nascuts als mons del projecte,** cap d'un món del pilot, triats a la prova de viabilitat amb la regla de la v0.1
(`fase2/resultats/arrelament/viabilitat/genotips.json`, a `b391491`):
- **G1:** un dels 37 programes del brot del món 1034 (el pas 3) que són hereditaris sols en les 100 condicions de companys inerts a la
  captura 5.200. Una aparició natural que no va arrelar.
- **G2, G3 i G4:** de tres branques establertes del pilot de la maduració (l'entrada 12), una per braç: `5015-continue-a`, `5017-shuffle-all-a`
  i `5018-reinit-a`. A la captura de l'època de l'establiment, el programa més freqüent dels que són hereditaris sols en 95 de 100 o més.
  - **Una limitació** (la comprovació dels genotips de la prova de viabilitat): són de famílies grans, de 2.540 a 10.745 cel·les amb
    alguna finestra seva, però la regla no garanteix que siguin de la família dominant.
- **G1 en un quadrat de 3 × 3 cel·les** (G1 × 9): la dosi que porta G1 a la zona del mig (el 39 % a la prova de viabilitat, contra l'11 %
  d'una cel·la).

**Les variants, a la prova de viabilitat** (6 mons, les tres sopes juntes): G1 arrela en 2 de 18 sembres, G1 × 9 en 7, G2 en 17, G3 en 15 i
G4 en 4.
- **Les informatives:** G1, G1 × 9 i G4. Tenen marge en totes dues direccions.
- **Les descriptives:** G2 i G3. Són al sostre: només podrien mostrar que una sopa els ho fa més difícil.

**Cada món, totes les variants,** cadascuna en branques a part i amb el mateix lloc a totes les sopes. Les comparacions entre sopes es fan
dins de cada món i de cada variant.

### 4.2 La sembra

- **La dosi:** una cel·la (com l'article de 2024), o el quadrat de 3 × 3 de G1 × 9. Els 64 bytes de cada cel·la es canvien pels del genotip,
  en el sentit en què es va registrar. La resta del món no es toca.
- **On:** *K* posicions per món, a l'atzar entre les cel·les a 2 o més de cada vora (tenen els 24 veïns):
  - ***K* = 4** per a les variants informatives;
  - ***K* = 1** per a G2 i G3 (la primera posició).
  - **El sorteig:** `node eines/sembra.mjs --positions MON 4`, el generador v2 amb la llavor del món + 700.000.
  - **Les mateixes posicions a totes les sopes i variants** d'un món.
- **Sense captures noves.** La sembra és una opció de `sim.mjs` (`--plant fitxer.json`). Funciona així:
  - **el fitxer:** el fa `eines/sembra.mjs`, i diu la SHA-256 de la captura de partida, les cel·les i els 64 bytes. Va a git, amb el
    manifest;
  - **a la memòria:** `sim.mjs` comprova la SHA-256 i canvia els bytes, abans de la primera època;
  - **per què:** més de 3.000 captures sembrades no hi cabrien.
- **L'atzar de la continuació:**
  - **la posició *k*:** la llavor del món + 400.000 + 1.000.000 × (*k* − 1). La v0.1 deia «+ 100.000 × (*k* − 1)», que a partir de la
    tercera posició coincidia amb les llavors de la transformació (+ 600.000) i de la posició (+ 700.000).
  - **El bessó natural:** la posició 1 el té a la part B (§5). El seu món, sense la sembra, és la branca de la part B amb el mateix món,
    braç i llavor.
  - **Què tenen en comú els bessons:** l'atzar del món (les parelles i les mutacions), que no depèn del contingut de les cel·les.
  - **Què pot divergir:** el del cens, quan una cel·la que prova és diferent.
  - **A la prova de viabilitat, ho fa:** a les quatre branques on el llinatge plantat es va extingir i el bessó es va establir sol,
    l'establiment hi arriba a la mateixa època que al bessó.
- **L'atzar del llinatge:** la llavor del món + 900.000. Només tria quines cel·les es proven, quan n'hi ha més de 256.

### 4.3 Els braços

| Braç | La sopa | Què s'hi planta | Per a què |
|---|---|---|---|
| `continue` | l'envellida | totes les variants | l'arrelament a la sopa madura |
| `shuffle-all` | l'histograma de l'envellida, barrejat | totes les variants | la composició, sense la disposició |
| `reinit` | una de nova | totes les variants | la referència |
| `byte0` | l'envellida, sense cap `<` al primer byte | G1 × 9 i G4, 2 posicions | la regla del primer byte (l'auditor 1) |
| `byte0-placebo` | l'envellida, amb el mateix nombre d'intercanvis lluny del primer byte | G1 × 9 i G4, 2 posicions | el placebo de `byte0` |
| `sham` (a cada sopa) | `continue`, `shuffle-all` i `reinit` | els bytes de G4, permutats, que no es copien | el que fa escriure una cel·la (l'auditor 2) |

- **`byte0` i `byte0-placebo`** (dos tipus nous d'`eines/transforma.mjs`; l'atzar, la llavor del món + 650.000):
  - **`byte0`:** a cada programa que comença amb `<`, el primer byte s'intercanvia amb un byte del mateix programa que no sigui `<`, triat
    a l'atzar;
  - **`byte0-placebo`:** als mateixos programes, s'intercanvien dos bytes diferents de les posicions 1 a 63, triats a l'atzar;
  - **què conserven tots dos:** la composició de cada programa i l'histograma del món;
  - **la diferència:** només `byte0` treu el `<` del primer byte. A la sopa envellida, hi comença el 7,5 % dels programes, contra el 4 %
    dels bytes (el pas 2a).
  - **Per què només G1 × 9 i G4:** són les variants del mig; amb 2 posicions, el contrast és secundari i el cost, petit.
- **El `sham`:**
  - **els bytes:** els de G4, en un ordre a l'atzar (la llavor del món + 800.000);
  - **la condició:** no es pot copiar en cap de les 100 condicions de companys inerts. Si es copia, s'agafa la permutació següent;
  - **on:** a la posició 1, amb la llavor de la posició 1, a les tres sopes dels 20 primers mons de la cohort;
  - **contra què es compara:** amb el bessó natural de la part B. Si escriure una cel·la no canvia res, s'hi estableix a la mateixa època.

### 4.4 Les branques

- **L'ordre:** `node sim.mjs --world 512x256 --from BRAÇ.bin --start 8000 --epochs 9750 --seed S --mixing 0 --every 100 --census 250
  --census-version v3 --rng v2 --stop-after-event 500 --plant FITXER --lineage-every 50 --stop-on-extinction 0 --inert-census 4096 --json
  ...`.
  - **Les opcions noves:** les de la PR (§7).
  - **Les captures:** cap no se'n desa, com a la sèrie.
- **L'horitzó *H* = 1.500 èpoques** després de la sembra.
  - **A la prova de viabilitat,** els que arrelen ho fan en 200 èpoques de mediana, i en 1.100 com a molt.
  - **La branca arriba a l'època 9.750:** *H* més 250, perquè el segon punt del criteri hi càpiga.
- **L'aturada:** la branca s'atura en el primer d'aquests casos:
  - el llinatge s'extingeix: `--stop-on-extinction 0`. A la prova de viabilitat, 31 de 38 en 100 èpoques;
  - 500 èpoques després de l'establiment de la vida (el criteri de la llei 2). A la prova de viabilitat, l'aturada a l'establiment
    (`--stop-after-event 0`) en va censurar 7: el criteri del llinatge encara no s'hi havia pogut complir;
  - l'època 9.750.

  Els `sham` no tenen llinatge: s'aturen a l'establiment més 500 o a l'època 9.750.

### 4.5 La mesura

**El llinatge** (`--lineage-every 50`; `fase2/llinatge.js`), cada 50 èpoques:
1. **Les cel·les del llinatge:** les que porten alguna finestra del llinatge. Una finestra és un tros de 16 bytes amb almenys 6 valors
   diferents, en qualsevol dels dos sentits: la de la prova de replicació. En diem *M* les cel·les.
2. **La prova:** com a molt 256 de les *M*, triades amb l'atzar del llinatge, amb companys inerts en les 3 condicions. Si *M* ≤ 256, totes.
3. **Les funcionals:** les hereditàries en alguna de les 3 condicions. *F* n'és l'estimació per a tot el món: *M* × la fracció de les
   provades.
4. **Les finestres:** les de les funcionals s'afegeixen a les del llinatge. Així el llinatge se segueix encara que les mutacions en
   canviïn els bytes.

**Els tres desenllaços:**
- **Arrela** (la mesura principal): *F* ≥ 1.311 cel·les, l'1 % del món, en dos punts del llinatge separats per 250 èpoques, el primer
  dins de *H*. És el criteri de la llei 2, amb companys inerts i per al llinatge.
- **S'extingeix:** *F* = 0 en dos punts seguits. Quan *M* ≤ 256, és exacte.
- **Censurat:** ni una cosa ni l'altra.

**També, de cada branca:**
- **l'establiment de la llei 2** dins de *H*, i **si el llinatge n'és la família dominant:** al cens inert del cens que el confirma, almenys
  la meitat de les cel·les hereditàries són del llinatge. És la mateixa prova (companys inerts) per a totes dues xifres: a la prova de
  viabilitat, comparar *F* amb el cens v3 barrejava dues proves;
- **el temps** fins a arrelar i fins a extingir-se;
- **la mida màxima;**
- **el cens inert** (§5): si ha vist el llinatge, i quan. És la calibració de la part B.

**Les xifres de cada sopa:**
- ***p*R de cada variant:** la part de les sembres que arrelen, amb un interval del bootstrap per món (el món és la unitat, AU2);
- **el contrast principal,** entre sopes, aparellat per món i estratificat per variant, amb les tres variants informatives:
  - `continue` contra `reinit`;
  - `shuffle-all` contra `reinit`;
- **els secundaris:** `byte0` contra `byte0-placebo`; G2 i G3, cadascun; els `sham` contra els bessons;
- **el 22 % de l'article de 2024:** només com a referència, perquè és un altre sistema. Allà, la sopa barrejada i 128 èpoques; aquí, el món
  2D i *H*.

## 5. Part B: les aparicions naturals

- **Les branques:** els mateixos mons i braços (`continue`, `shuffle-all` i `reinit`), amb la llavor de la posició 1 i sense res plantat.
  - *H* = 8.000, com a la sèrie;
  - aturades a l'establiment (`--stop-after-event 0`, com a la sèrie).
  - **Què en surt:** els bessons naturals de la part A, i el ritme d'establiment d'aquests mons.
- **El cens inert** (`--inert-census 4096`): a cada cens (cada 250 èpoques), 4.096 cel·les a l'atzar.
  - **L'atzar:** un de propi, amb la llavor 20261116, independent del món i del cens v3.
  - **La prova:** amb companys inerts, en les 3 condicions.
  - **Què s'escriu:** de cada cel·la que es copia en alguna condició, la posició, el programa i les cadenes.
  - **El que no toca:** l'atzar del món. La història és la mateixa amb aquest cens o sense, i la PR ho comprova (§7).
- **Per què 4.096 cada 250 èpoques:** a la prova de viabilitat, els llinatges que arrelen els veuria amb probabilitat 1, amb aquesta mida
  i amb les altres dues que es van mirar (2.048 i 4.096 cada 100). Dels que s'extingeixen, en veuria un 10 % (les altres dues, un 12 o un
  13 %). S'apaguen abans de fer-se grans, i cap mida raonable no els veu. Aquesta és la més barata: afegeix un 9 % a cada branca.
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
- **La sensibilitat del detector** (l'auditor 2): a la part A també corre el cens inert, i el llinatge en dona la mida real. D'aquí surt la
  probabilitat de detectar un llinatge, segons la mida i la durada, a cada sopa.

## 6. L'anàlisi (fixada aquí; l'script, a la PR, abans de calcular)

1. ***p*R de cada sopa i variant** (la part A), amb els intervals del bootstrap per món.
2. **El contrast principal:** el quocient de *p*R entre `continue` i `reinit`, i entre `shuffle-all` i `reinit`, estratificat per variant
   (Mantel i Haenszel) amb G1, G1 × 9 i G4, i l'interval del bootstrap per món (10.000 remostres). Cada variant, també a part.
3. ***λ*A de cada sopa** (la part B), amb els intervals, i els mateixos quocients.
4. **La consistència** (l'auditor 1): a cada sopa, *P*(arrela | detectada) de les famílies naturals, contra la dels llinatges plantats
   que el cens inert ha detectat.
   - **Si coincideixen,** els plantats representen els naturals, i *λ*A × *P*(arrela | detectada) dona el ritme d'establiment.
   - **Si no,** es diu, i la part A només parla d'aquestes variants.
   - **A la prova de viabilitat,** el cens inert veia tots els llinatges que arrelen i un 10 % dels que s'extingeixen. Per als plantats,
     *P*(arrela | detectada) hi era, doncs, alta, i la consistència compara això.
5. **La lectura** (§1): els quocients de *p*R i de *λ*A, contra el de l'establiment de la sèrie (1,6 i 2,05) i contra 1.
6. **`byte0` contra el seu placebo,** G2 i G3, i els `sham` contra els bessons.
7. **Els descriptius:** el punt de partida de cada braç, les durades i les mides dels llinatges, el temps fins a arrelar, i
   l'establiment de la llei 2 amb el llinatge dominant, al costat de l'«arrela».

L'script s'escriu i es prova amb dades sintètiques abans de calcular, com al pas 3, i va a la PR.

## 7. Les eines (una PR, amb l'auditoria 32)

**Ja fetes** (la branca `arrelament-eines`; `test/arrelament.mjs`, a `npm test`):
- **`sim.mjs`**, amb dos mòduls nous (`fase2/inert.js` i `fase2/llinatge.js`), quatre opcions:
  - `--plant`;
  - `--lineage-every`;
  - `--stop-on-extinction`;
  - `--inert-census`, que, amb un llinatge, també diu quantes hereditàries en són.

  **Sense aquestes opcions, res no canvia.** La sortida és la d'abans, línia a línia, i passen les empremtes de `test/determinisme.mjs` i els
  valors del cens v2 i v3 (`CLAUDE.md`). El cens inert i el llinatge tenen un atzar propi: amb ells, els censos v3 i l'empremta final són els
  mateixos.
- **`fase2/inert.js`:** còpies de les funcions de la prova d'autonomia de B1, perquè el simulador no depengui d'una eina de B1. La prova
  comprova que fan el mateix.
- **`eines/sembra.mjs`:** el fitxer de cada sembra i dels `sham`, amb les comprovacions:
  - el genotip, 95 de 100 o més;
  - el `sham`, 0 de 100;
  - la cel·la, a l'interior;
  - la SHA-256 de la captura.

  I les posicions (`--positions`), les mateixes que a la prova de viabilitat.
- **`eines/transforma.mjs`:** `byte0` i `byte0-placebo`, amb els invariants comprovats.
- **`eines/potencia-arrelament.mjs`:** la precisió del contrast principal, simulada per món amb les *p*R de la prova de viabilitat (§8).

**Per fer, a la mateixa PR, abans de l'auditoria 32:**
- **`eines/arrelament.mjs`:** les llistes, el manifest i les comprovacions abans de llançar:
  - l'envelliment;
  - els escanejos i les transformacions;
  - les sembres;
  - les branques de les dues parts.
- **`eines/arrelament-analisi.mjs`:** l'anàlisi de la §6, provada amb dades sintètiques.
- **Si es vol, la PR petita de l'auditoria 31** (el punt 5): `windowsOf` amb un `Buffer`.

## 8. El cost i la precisió

**Les xifres de la prova de viabilitat** (8 processos alhora):
- 253 s per cada 1.000 èpoques;
- una sembra que s'extingeix s'atura en unes 150 èpoques: menys d'un minut;
- una que arrela, unes 1.000 èpoques: arrelar, establir-se i 500 més.

| Què | Quantes | Hores de CPU |
|---|---|---|
| L'envelliment | uns 74 mons (0,45 h cadascun) | 33 |
| Els escanejos de l'època 8.000 | la inclusió (74) i el punt de partida dels braços (180, amb la prova del cens i amb companys inerts) | 26 |
| La part B | 180 branques, de fins a 8.000 èpoques (unes 0,9 h, amb el cens inert) | 160 |
| La part A, les tres sopes | 60 mons × 3 sopes × (4 × G1, 4 × G1 × 9, 4 × G4, G2, G3): 2.520 branques, unes 34 min per món i sopa | 100 |
| La part A, `byte0` i el placebo | 60 mons × 2 × (2 × G1 × 9, 2 × G4): 480 branques | 18 |
| Els `sham` | 20 mons × 3 sopes, fins a l'època 9.750 (unes 6,5 min) | 7 |
| **En total** | | **unes 345** |

- **El temps real:** amb 8 processos al PC, uns dos dies; amb la màquina virtual també, un dia i mig.
- **La precisió del contrast principal** (la regla de la v0.1: *N* i *K* han de distingir 1 de 1,6, una semiamplada de log(1,6)/2 = 0,235
  com a molt).
  - **Les dades:** 240 sembres per variant i sopa, i les *p*R de la prova de viabilitat (G1 0,11, G1 × 9 0,39 i G4 0,22).
  - **El càlcul aproximat:** l'error típic del logaritme del quocient estratificat és d'uns 0,09, i la semiamplada, d'uns 0,18.
  - **La simulació per món** (`node eines/potencia-arrelament.mjs`, 400 pilots simulats per cas, amb el bootstrap per món de la §6). Un
    efecte del món (sigma) i un de cada sopa del món (tau, la interacció), sobre el logit de *p*R:
    - **sense interacció o amb una de moderada** (tau fins a 0,5): la semiamplada va de 0,13 a 0,23, dins de la regla;
    - **amb una interacció forta** (sigma = tau = 1): de 0,21 a 0,25, al límit;
    - **en tots els casos,** si el quocient de debò és 1, l'interval exclou 1,6 en el 97 % dels pilots o més, i si és 1,6, exclou 1 en el
      96 % o més.
  - **El que no hi és:** les *p*R de la prova de viabilitat són de 6 mons. Si al pilot són més baixes, l'interval s'eixampla.
- **Si cal més de tres dies,** es redueix la part B abans que la part A, i es diu.

## 9. La prova de viabilitat (feta el 16-11-2026, exploratori)

**El que és:** `fase2/resultats/arrelament/viabilitat/` (la nota, `a98bbcc`, abans de calcular; el que surt, al README).
- **Les dades:** 6 mons del pilot de la maduració (5004, 5006, 5008, 5014, 5019 i 5020), les tres sopes a l'època 8.000, els quatre
  genotips en una cel·la i G1 en un quadrat de 3 × 3: 90 branques de fins a 4.000 èpoques, amb una captura cada 100 i el llinatge
  després.
- **Les branques:** de les 13.45 a les 15.47 del 16-11-2026, totes bé.

**El que en surt per al disseny:**
- **Arrelar depèn sobretot del genotip** (de 18 sembres): G1 2, G1 × 9 7, G2 17, G3 15 i G4 4. D'aquí les variants informatives i
  descriptives (§4.1).
- **Els que s'extingeixen ho fan de seguida:** 31 de 38 en 100 èpoques, i la majoria sense haver-se copiat mai. L'aturada a l'extinció fa
  la part A barata.
- **Els que arrelen,** en 200 èpoques de mediana i 1.100 com a molt: *H* = 1.500 (§4.4).
- **L'aturada a l'establiment** censurava el criteri del llinatge: ara, 500 èpoques més tard (§4.4).
- **La família dominant** s'ha de mesurar amb la mateixa prova que el llinatge: ara, amb el cens inert (§4.5).
- **El cens inert** veu tots els llinatges que arrelen i un 10 % dels que s'extingeixen (§5).
- **L'atzar comú funciona:** quan la sembra s'apaga, l'establiment del món arriba a la mateixa època que al bessó (§4.2).

**Per sopa, amb 6 mons, no és cap resultat.** Els quatre genotips en una cel·la arrelen en 11 sembres de 24 a la sopa envellida, en 12 a la
barrejada i en 15 a la nova. Les diferències, si n'hi ha, poden anar en qualsevol direcció: el pilot ho ha de poder dir en totes dues (§1).

## 10. Els límits, d'entrada

- **Un replicador plantat no és una aparició natural.** El genotip, el lloc (una cel·la a l'atzar) i el moment (l'època 8.000) són
  nostres. Que el plantat representi els naturals no se suposa: ho prova la consistència (§6.4).
- **Quatre genotips, i dos al sostre.** L'arrelament depèn molt del genotip. El contrast principal parla de G1, G1 × 9 i G4, i el pilot
  només en veurà la variació gruixuda.
- **G2, G3 i G4 són de famílies grans,** però potser no de la dominant del seu establiment.
- **Dues mesures, dos noms:**
  - **«arrela»:** el criteri del llinatge, amb companys inerts;
  - **«s'estableix»:** el de la llei 2, amb companys de soroll.
- **Una aparició es veu quan es detecta.** El seu temps és el de la detecció, i el detector no veu gairebé cap de les que s'apaguen de
  seguida.
- **Exploratori.** Cap afirmació causal general fins a una confirmació amb mons nous (el criteri de l'auditor 2 per passar del pilot a
  una confirmació).

## 11. El que ve

1. **A la PR:** `eines/arrelament.mjs` i `eines/arrelament-analisi.mjs`, amb proves, i prova-neta.
2. **L'auditoria 32** del pla i de la PR, abans de calcular.
3. **El merge,** i el pilot des d'una còpia neta:
   - l'envelliment;
   - els escanejos i les transformacions;
   - les parts A i B, uns dos dies de màquina.
4. **La ronda d'auditoria dels resultats,** i l'entrada del quadern.
