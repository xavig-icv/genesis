# El pilot de l'aparició i l'arrelament · on actua la maduració

**Versió: v0.4 (17-11-2026), amb les correccions de l'auditoria 33, per a una comprovació curta de tancament (l'auditoria 34).** Del
pilot, no s'ha calculat res. La prova de viabilitat (§9) sí, pel carril d'explorar, en uns altres mons: és a
`fase2/resultats/arrelament/viabilitat/`. Les eines són en aquesta PR (§7), i res no es calcula fins després de la comprovació i del merge.
- **La decisió que el fa possible:** el 16-11-2026, el responsable tria l'opció 2 de la T-64, l'assaig d'invasió, com una excepció escrita
  a la regla del projecte (§2, i `docs/disseny.md`). El 17-11-2026 confirma que la prova de viabilitat hi entrava (T-68).
- **De la v0.3 a la v0.4** (l'auditoria 33: l'auditor 1, GO amb quatre troballes baixes que recomana corregir abans del merge; l'auditor 2,
  NO-GO fins a corregir-ne tres d'altes, amb una comprovació curta). Només l'anàlisi i les seves proves; els mons, les variants, *N*, *K*,
  *H*, els braços i les llavors no canvien:
  - **el manifest, contra el disseny:** l'anàlisi es nega si en falta, en sobra o se'n repeteix cap branca, o si una no té l'ordre del
    disseny (AU2-170);
  - **els escanejos inerts del punt de partida,** obligatoris, amb la SHA-256 del manifest (AU2-171 = AUD-202);
  - **la consistència, amb la mateixa finestra i la mateixa regla de seguiment a les dues parts:** 1.250 èpoques des de la primera detecció,
    i quatre classes (arrela, competidor, no arrela, censurada); les competidores i les censurades no entren al denominador, i es compten
    (§6.4; AUD-199 = AU2-172). Les famílies unides en cadena hi compten (AUD-200);
  - **«de partida»,** més estret: els programes de la primera detecció contra les cel·les **hereditàries** del punt de partida; la regla
    d'abans es queda com a «emparentades» (§5; AUD-201);
  - **els dos llindars amb i sense les de partida, i la calibració del detector,** amb la part A (§5 i §6.3; AU2-175);
  - **s'extingeix dins de *H*** només si el primer zero hi és (§4.5; AU2-173);
  - **la lectura de *λ*det:** una classificació numèrica, que no atribueix cap mecanisme (§1; AU2-174).
- **De la v0.2 a la v0.3** (l'auditoria 32: l'auditor 1, GO amb quatre condicions; l'auditor 2, NO-GO fins a una revisió de tancament):
  - **la lectura** (§1 i §6.5): sis casos i una regla de la precisió. Un interval entre 1 i el quocient de l'establiment es llegia «més gran
    que el de l'establiment», i un interval que conté 1 semblava una prova d'equivalència (AUD-190, AU2-164);
  - **l'extinció, exacta:** quan *M* passa de 256 i cap cel·la de la mostra no és funcional, es proven totes (AUD-192 = AU2-157);
  - **el control de les col·lisions:** les branques de la part B segueixen les finestres dels quatre genotips sense plantar-los
    (`--track`), i cada sembra diu quantes cel·les en portaven alguna abans de plantar (AU2-156);
  - **«dominant», igual a les dues parts:** la meitat o més de les hereditàries del cens inert (AU2-158);
  - **la censura, per causa,** i *p*R definida com la part que arrela dins de *H* (AU2-159);
  - **les aparicions:** la prova, en 100 condicions que no són les del cens inert, amb dos llindars (AUD-191); les famílies que ja hi eren a
    l'època 8.000, separades (AUD-193); *λ*det, «les aparicions detectades», i no el ritme de formació (AU2-160);
  - **el producte *λ*det × *P*, només una aproximació exploratòria,** amb els supòsits escrits (AU2-161);
  - **la consistència,** amb la mateixa definició a totes dues parts i per la mida a la primera detecció (AUD-197);
  - **el criteri estricte de *F*** (la cota inferior de la mostra), com a sensibilitat (AU2-165);
  - **el commit del manifest,** comprovat a cada registre (AU2-162);
  - **el placebo de `byte0`** mou una instrucció, com `byte0` (AUD-195); **el `sham`,** un descriptiu (AUD-196, AU2-166);
  - **el que diu la prova de viabilitat,** corregit (§4.2 i §9; AUD-194), i d'on són G2, G3 i G4 (§4.1; AU2-163);
  - **l'excepció de la T-64,** la mateixa frase als tres llocs (§2; AUD-198).
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
  quantes famílies hereditàries s'hi **detecten**, i quantes arrelen. No és el ritme de formació: el cens no veu gairebé cap de les que
  s'apaguen de seguida (§5).
- **La consistència (l'auditor 1, §6.4).** Les famílies naturals detectades i els llinatges plantats detectats, amb la mateixa definició
  d'arrelar, han d'arrelar en la mateixa proporció. Si no ho fan, els plantats no representen els que hi apareixen sols.

**Com es llegirà, fixat ara** (§6.5; `reading()` d'`eines/arrelament-analisi.mjs`). A la sèrie, els quocients del ritme d'establiment
són **1,6** entre l'envellida i la nova, i **2,05** entre la barrejada i la nova. El quocient de *p*R entre dues sopes, amb l'interval
del bootstrap per món:

| Si l'interval... | ...es dirà |
|---|---|
| és més ample que la regla de la precisió (una semiamplada de més de log(1,6)/2 = 0,235 en logaritme) | inconcloent, sigui on sigui |
| conté el de l'establiment i no 1 | l'arrelament d'aquestes variants pot explicar tot l'efecte |
| queda entre 1 i el de l'establiment, sense contenir cap dels dos | l'arrelament n'explica una part, i la resta hauria de venir de l'aparició |
| queda per sobre del de l'establiment | l'arrelament explicaria més que tot l'efecte, i l'aparició hi aniria en contra |
| conté 1 i no el de l'establiment | l'arrelament no explica tot l'efecte, i la resta hauria de venir de l'aparició. **No és cap prova que l'arrelament no hi canviï** |
| queda per sota d'1 | l'arrelament hi va en contra, i l'efecte de l'establiment hauria de venir de l'aparició |
| conté 1 i el de l'establiment | no discrimina |

- **Amb les dues mesures de *p*R** («arrela» i «s'estableix amb el llinatge dominant», §4.5): si no diuen el mateix, es diu, sense triar-ne
  cap (la pregunta 2 de l'auditor 1).
- ***λ*det** és un **descriptiu**: no és el ritme de formació (§5). La seva lectura només diu on cau l'interval (els mateixos casos i la
  mateixa regla de la precisió), sense cap «explica» ni «hauria de venir de»: una comparació numèrica de les aparicions detectades, que no
  identifica ni atribueix cap mecanisme (AU2-174).
- **La regla de la precisió** és la de la v0.1: una semiamplada més gran vol dir que el pilot no té prou mons per a aquesta pregunta. Amb
  aquesta regla, la fila «no discrimina» només surt amb l'interval [1; el de l'establiment] exacte: un interval que conté tots dos té una
  semiamplada de log(1,6)/2 o més (l'auditor 1, auditoria 33).

**És exploratori.** Si en surt res, es confirma amb mons nous, protocol, auditoria i segell (el carril de confirmar).

## 2. L'excepció de la regla (T-64)

**La regla del projecte:** «dissenyem les lleis, mai els organismes». Cap replicador plantat en cap experiment. El responsable hi fa una
sola excepció, el 16-11-2026. La frase, igual que a `CLAUDE.md` i al principi 1 de `docs/disseny.md` (AUD-198):

> **L'única excepció** (T-64, 16-11-2026): plantar un replicador nascut als mons del projecte, amb `--plant` a l'ordre i en branques a part
> que comencen d'una còpia d'una captura, per mesurar si hi arrela: a la part A del pilot de l'aparició i l'arrelament
> (`docs/pla-aparicio-arrelament.md`), a la seva prova de viabilitat (feta el 16-11-2026) i a les proves de les seves eines. Mai en cap
> sèrie de l'abiogènesi, ni a la part B, ni en cap experiment que mesuri si la vida hi apareix, i una confirmació que torni a plantar
> necessita una decisió nova del responsable. Es diu «arrela un replicador plantat», mai «la vida hi neix».

- **On es veu:** a cada registre de la part A, l'ordre porta `--plant`, i la línia d'inici, el programa plantat i d'on surt.
- **La part B no planta res:** `--track` segueix les finestres dels genotips sense tocar cap cel·la (§5), i `sim.mjs` no deixa fer servir
  totes dues opcions alhora.

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
  - **amb companys inerts,** en 3 condicions: les 3 primeres de la llavor del pas 2b, 3000000000. **Desa el programa i les cadenes de cada
    cel·la que es copia** (AUD-193): l'anàlisi en separa les famílies que ja hi eren a l'època 8.000 (§5).

  No n'exclou cap braç. `shuffle-all` en crea, de replicadors (AU2-154), i es diu.

## 4. Part A: l'assaig d'invasió

### 4.1 Les variants

**Quatre genotips nascuts als mons del projecte,** cap d'un món del pilot, triats a la prova de viabilitat amb la regla de la v0.1
(`fase2/resultats/arrelament/viabilitat/genotips.json`, a `b391491`):
- **G1:** un dels 37 programes del brot del món 1034 (el pas 3) que són hereditaris sols en les 100 condicions de companys inerts a la
  captura 5.200. Una aparició natural que no va arrelar.
- **G2, G3 i G4:** de tres branques establertes del pilot de la maduració (l'entrada 12), una per braç: `5015-continue-a`, `5017-shuffle-all-a`
  i `5018-reinit-a`. A la captura de l'època de l'establiment, el programa més freqüent dels que són hereditaris sols en 95 de 100 o més.
  - **De quina família són** (AU2-163; l'auditor 1 ho va mesurar a la captura d'origen, totes les cel·les amb companys inerts en les 3
    condicions i les famílies per finestres compartides, i l'equip ho ha refet igual):

    | Genotip | Les hereditàries del món | Les famílies | La més gran | La del genotip |
    |---|---|---|---|---|
    | G2 (`5015-continue-a`, època 13.250) | 4.383 | 82 | 2.731 (el 62 %) | la segona, amb 1.435 |
    | G3 (`5017-shuffle-all-a`, època 9.000) | 1.443 | 15 | 1.428 (el 99 %) | la dominant |
    | G4 (`5018-reinit-a`, època 12.250) | 4.189 | 1 | 4.189 (el 100 %) | la dominant |

    `genotips.json` diu «la família dominant a l'establiment» als tres: és la sortida tal com va sortir, i no es toca. Els genotips no
    canvien. Per a una altra vegada, la regla de la família: el programa més freqüent de la família més gran.
- **G1 en un quadrat de 3 × 3 cel·les** (G1 × 9): la dosi que porta G1 a la zona del mig (el 39 % a la prova de viabilitat, contra l'11 %
  d'una cel·la).

**Les variants, a la prova de viabilitat** (6 mons, les tres sopes juntes): G1 arrela en 2 de 18 sembres, G1 × 9 en 7, G2 en 17, G3 en 15 i
G4 en 4.
- **La regla** (la pregunta 3 de l'auditor 1), escrita com a regla: **informatives, les que arrelen entre el 10 i el 90 % de les sembres,
  les tres sopes juntes.** Hi entren G1 (11 %), G1 × 9 (39 %) i G4 (22 %); G2 (94 %) no. G3 (83 %) no s'extingeix mai (15 arrelen i 3,
  censurades, que amb l'aturada a l'establiment + 500 desapareixeran): es deixa amb les descriptives.
- **Les descriptives:** G2 i G3, amb *K* = 1. Només podrien mostrar que una sopa els ho fa més difícil. No se n'afegeix ni se'n treu cap
  segons les dades del pilot (l'auditor 2).
- **D'on ve cada genotip** (la pregunta 7 de l'auditor 1): G1 i G1 × 9, d'un món envellit 5.200 èpoques sense vida, com `continue`; G4, d'un
  establiment a una sopa nova. Si un genotip arrela millor a la mena de sopa d'on ve, el contrast estratificat ho barreja: per això cada
  variant també es dona a part (§6.2, i §10).

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
  - **a la memòria:** `sim.mjs` comprova la SHA-256, compta les cel·les que ja porten alguna finestra del genotip (`preCarriers`, a la línia
    d'inici; AU2-156) i canvia els bytes, abans de la primera època;
  - **per què:** més de 3.000 captures sembrades no hi cabrien.
- **L'atzar de la continuació:**
  - **la posició *k*:** la llavor del món + 400.000 + 1.000.000 × (*k* − 1). La v0.1 deia «+ 100.000 × (*k* − 1)», que a partir de la
    tercera posició coincidia amb les llavors de la transformació (+ 600.000) i de la posició (+ 700.000).
  - **El bessó natural:** la posició 1 el té a la part B (§5). El seu món, sense la sembra, és la branca de la part B amb el mateix món,
    braç i llavor.
  - **Què tenen en comú els bessons:** l'atzar del món, és a dir, les parelles de cada època, que no depenen del contingut de les cel·les.
  - **Què no** (AUD-194): la història. A la prova de viabilitat, el nombre d'operacions ja és diferent del del bessó a la primera mesura, a
    totes les 90 branques, també a les que s'extingeixen de seguida: plantar una cel·la canvia la història de tot el món. La v0.2 deia que
    el món «torna a la història del bessó», i no és cert. El que sí que s'hi va veure: en 3 casos de 3, l'establiment arriba al mateix cens
    que al bessó. Els bessons són, doncs, una comparació aparellada, no una còpia de la història.
- **L'atzar del llinatge:** la llavor del món + 900.000. Només tria quines cel·les es proven, quan n'hi ha més de 256.

### 4.3 Els braços

| Braç | La sopa | Què s'hi planta | Per a què |
|---|---|---|---|
| `continue` | l'envellida | totes les variants | l'arrelament a la sopa madura |
| `shuffle-all` | l'histograma de l'envellida, barrejat | totes les variants | la composició, sense la disposició |
| `reinit` | una de nova | totes les variants | la referència |
| `byte0` | l'envellida, sense cap `<` al primer byte | G1 × 9 i G4, 2 posicions | la regla del primer byte (l'auditor 1) |
| `byte0-placebo` | l'envellida, amb el mateix nombre d'intercanvis, cadascun d'una instrucció lluny del primer byte | G1 × 9 i G4, 2 posicions | el placebo de `byte0` |
| `sham` (a cada sopa) | `continue`, `shuffle-all` i `reinit` | els bytes de G4, permutats, que no es copien | descriptiu: el que fa escriure una cel·la (l'auditor 2) |

- **`byte0` i `byte0-placebo`** (dos tipus nous d'`eines/transforma.mjs`; l'atzar, la llavor del món + 650.000):
  - **`byte0`:** a cada programa que comença amb `<`, el primer byte s'intercanvia amb un byte del mateix programa que no sigui `<`, triat
    a l'atzar. Sempre mou una instrucció;
  - **`byte0-placebo`** (AUD-195): als mateixos programes, una **instrucció** de les posicions 1 a 63, triada a l'atzar, s'intercanvia amb
    un byte diferent de les posicions 1 a 63. Si el programa no té cap instrucció en aquestes posicions, o hi té les 63 iguals, no es toca
    (es compta). A la v0.2, el placebo intercanviava dos bytes qualssevol, i el 77 % dels intercanvis no tocaven cap instrucció: no separava
    la regla del primer byte de moure una instrucció;
  - **què conserven tots dos:** la composició de cada programa i l'histograma del món, i tots dos mouen una instrucció;
  - **la diferència:** només `byte0` treu el `<` del primer byte. A la sopa envellida, hi comença el 7,5 % dels programes, contra el 4 %
    dels bytes (el pas 2a).
  - **Per què només G1 × 9 i G4:** són les variants del mig; amb 2 posicions, el contrast és secundari i el cost, petit.
  - **La precisió** (l'auditor 1): 120 sembres per variant i braç; l'error típic del logaritme del quocient, d'uns 0,14 sense l'efecte del
    món. Amb un 80 % de potència, **només veurà efectes d'1,5 o més**, i amb l'efecte del món, encara més grans.
- **El `sham`** (AUD-196, AU2-166): **un descriptiu, no una prova.**
  - **els bytes:** els de G4, en un ordre a l'atzar (la llavor del món + 800.000);
  - **la condició:** no es pot copiar en cap de les 100 condicions de companys inerts. Si es copia, s'agafa la permutació següent;
  - **on:** a la posició 1, amb la llavor de la posició 1, a les tres sopes dels 20 primers mons de la cohort;
  - **contra què es compara:** amb el bessó natural de la part B, com a parella, no com a còpia de la història (§4.2). Es dona l'època de
    l'establiment de tots dos (quan n'hi ha) i la diferència mitjana de la part hereditària dels censos v3 que tenen en comú, època a època.
  - **El que no pot fer:** veure un efecte que no sigui molt gros. A la sèrie, abans de l'època 9.500, s'establien el 3,3 % de les sopes
    envellides, el 8 % de les barrejades i l'1 % de les noves: amb 20 mons × 3 sopes, uns 2,5 bessons s'establiran dins del seu horitzó.

### 4.4 Les branques

- **L'ordre:** `node sim.mjs --world 512x256 --from BRAÇ.bin --start 8000 --epochs 9750 --seed S --mixing 0 --every 100 --census 250
  --census-version v3 --rng v2 --stop-after-event 500 --plant FITXER --lineage-every 50 --stop-on-extinction 0 --inert-census 4096 --json
  ...`.
  - **Les opcions noves:** les de la PR (§7).
  - **Les captures:** cap no se'n desa, com a la sèrie.
- **L'horitzó *H* = 1.500 èpoques** després de la sembra.
  - **A la prova de viabilitat,** els que arrelen ho fan en 200 èpoques de mediana, i en 1.100 com a molt (dels que van arrelar abans que
    l'establiment aturés la branca). Dues sembres de G1 × 9 van viure 1.600 i 2.100 èpoques abans d'extingir-se: aquí, censurades.
  - **La branca arriba a l'època 9.750:** *H* més 250, perquè el segon punt del criteri hi càpiga.
- **L'aturada:** la branca s'atura en el primer d'aquests casos:
  - el llinatge s'extingeix: `--stop-on-extinction 0`, *F* = 0 en dos punts seguits. **Ara és exacte** (§4.5): a la prova de viabilitat,
    5 de 38 extincions, totes de G1 × 9, es van declarar d'una mostra de 256, amb de 519 a 2.300 cel·les del llinatge (AUD-192 = AU2-157);
  - 500 èpoques després de l'establiment de la vida (el criteri de la llei 2). A la prova de viabilitat, l'aturada a l'establiment
    (`--stop-after-event 0`) en va censurar 7: el criteri del llinatge encara no s'hi havia pogut complir;
  - l'època 9.750.

  Els `sham` no tenen llinatge: s'aturen a l'establiment més 500 o a l'època 9.750.

### 4.5 La mesura

**El llinatge** (`--lineage-every 50`; `fase2/llinatge.js`), cada 50 èpoques:
1. **Les cel·les del llinatge:** les que porten alguna finestra del llinatge. Una finestra és un tros de 16 bytes amb almenys 6 valors
   diferents, en qualsevol dels dos sentits: la de la prova de replicació. En diem *M* les cel·les.
2. **La prova:** com a molt 256 de les *M*, triades amb l'atzar del llinatge, amb companys inerts en les 3 condicions. Si *M* ≤ 256, totes.
   **Si *M* > 256 i cap de la mostra no és funcional, es proven totes** (`exhaustive` a la línia del llinatge; AUD-192 = AU2-157): així,
   *F* = 0 sempre és exacte.
3. **Les funcionals:** les hereditàries en alguna de les 3 condicions. *F* n'és l'estimació per a tot el món: *M* × la fracció de les
   provades.
4. **Les finestres:** les de les funcionals s'afegeixen a les del llinatge. Així el llinatge se segueix encara que les mutacions en
   canviïn els bytes.

**Què mesura** (AU2-156): les cel·les funcionals que porten alguna finestra del llinatge. Hi entren els descendents del genotip plantat, i
també qualsevol seqüència de la sopa que hi comparteixi una finestra, n'hagi descendit o no. No és una prova de descendència. Per fitar-ho:
- **abans de plantar:** la línia d'inici diu quantes cel·les del món ja portaven alguna finestra del genotip (`preCarriers`);
- **el control de les col·lisions:** el bessó natural de la part B segueix les finestres dels quatre genotips sense plantar-los
  (`--track`, §5). Si el seguiment hi arriba a *F* ≥ 131 (el 10 % del llindar) fins a *H* + 250, és una col·lisió: el contrast principal
  es dona també sense aquests mons i sopes (§6.2).

**Els tres desenllaços** (AU2-159):
- **Arrela** (la mesura principal): *F* ≥ 1.311 cel·les, l'1 % del món, en dos punts del llinatge separats per 250 èpoques, el primer
  dins de *H*. És el criteri de la llei 2, amb companys inerts i per al llinatge.
- **S'extingeix:** *F* = 0 en dos punts seguits. Exacte.
- **Censurat:** ni una cosa ni l'altra, per una de dues causes: **l'horitzó** (la branca arriba a l'època 9.750) o **l'establiment** (la
  branca s'atura 500 èpoques després, abans que el criteri es pugui complir).

**«Dins de *H*», per a tots dos desenllaços** (AU2-173): arrela si el primer punt del criteri és dins de *H*, i s'extingeix dins de *H* si
el primer dels dos zeros hi és. Una extinció que comença després de *H* (els dos zeros entre les èpoques 9.550 i 9.750) és una censura a
*H*; el seu temps es dona només com a descriptiu.

***p*R** és la part de les sembres que arrelen dins de *H*: una censurada compta com «no arrela dins de *H*». No és la probabilitat d'arrelar
algun dia. Per això:
- **els desenllaços es donen per causa,** a cada sopa;
- **una sensibilitat:** les censurades com si arrelessin (la cota superior);
- **una altra, el criteri estricte de *F*** (AU2-165): amb la cota inferior de Wilson (95 %) de la fracció de funcionals de la mostra,
  en lloc de *F*, als dos punts. Quan es proven totes les *M*, és *F*.

**També, de cada branca:**
- **l'establiment de la llei 2** dins de *H*, i **si el llinatge n'és la família dominant:** al cens inert del cens que el confirma, almenys
  la meitat de les cel·les hereditàries són del llinatge. **La mateixa regla que a la part B** (AU2-158). És la mateixa prova (companys
  inerts) per a totes dues xifres: a la prova de viabilitat, comparar *F* amb el cens v3 barrejava dues proves;
- **el temps** fins a arrelar i fins a extingir-se;
- **la mida màxima;**
- **el cens inert** (§5): si ha vist el llinatge, quan, i amb quantes cel·les (la mida a la primera detecció). És la calibració de la part B.

**Les xifres de cada sopa:**
- ***p*R de cada variant:** la part de les sembres que arrelen dins de *H*, amb un interval del bootstrap per món (el món és la unitat, AU2);
- **el contrast principal,** entre sopes, aparellat per món i estratificat per variant, amb les tres variants informatives:
  - `continue` contra `reinit`;
  - `shuffle-all` contra `reinit`;
- **els secundaris:** `byte0` contra `byte0-placebo`; G2 i G3, cadascun; els `sham` contra els bessons (descriptiu);
- **el 22 % de l'article de 2024:** només com a referència, perquè és un altre sistema. Allà, la sopa barrejada i 128 èpoques; aquí, el món
  2D i *H*.

## 5. Part B: les aparicions naturals

- **Les branques:** els mateixos mons i braços (`continue`, `shuffle-all` i `reinit`), amb la llavor de la posició 1 i sense res plantat.
  - *H* = 8.000, com a la sèrie;
  - aturades a l'establiment (`--stop-after-event 0`, com a la sèrie).
  - **Què en surt:** els bessons naturals de la part A, i el ritme d'establiment d'aquests mons.
- **El seguiment dels genotips** (`--track seguiments/MON.json --lineage-every 50`; AU2-156): el llinatge de la part A, amb les finestres
  de G1, G2, G3 i G4 alhora, sense plantar res. Diu si la sopa del bessó ja té (o fa) seqüències que el llinatge comptaria com a seves: el
  control de les col·lisions de la §4.5. No canvia la història del món (la PR ho comprova), i costa uns 0,3 s per punt, unes 2,5 h de CPU
  a tota la part B.
- **El cens inert** (`--inert-census 4096`): a cada cens (cada 250 èpoques), 4.096 cel·les a l'atzar.
  - **L'atzar:** un de propi, amb la llavor 20261116, independent del món i del cens v3.
  - **La prova:** amb companys inerts, en les 3 condicions.
  - **Què s'escriu:** de cada cel·la que es copia en alguna condició, la posició, el programa i les cadenes.
  - **El que no toca:** l'atzar del món. La història és la mateixa amb aquest cens o sense, i la PR ho comprova (§7).
- **Per què 4.096 cada 250 èpoques:** a la prova de viabilitat, els llinatges que arrelen els veuria amb probabilitat 1, amb aquesta mida
  i amb les altres dues que es van mirar (2.048 i 4.096 cada 100). Dels que s'extingeixen, en veuria un 10 % (les altres dues, un 12 o un
  13 %). S'apaguen abans de fer-se grans, i cap mida raonable no els veu. Aquesta és la més barata: afegeix un 9 % a cada branca.
- **Una aparició detectada:** la primera detecció d'una família nova amb alguna cel·la hereditària.
  - **Nova:** que no comparteix cap finestra amb cap família detectada abans a la branca.
  - **Hereditària, tornada a provar** (AUD-191): els programes de la família es tornen a provar després, en **100 condicions que no són les
    del cens inert** (de la 4a a la 103a de la llavor 3000000000). Amb les 3 del cens, la prova no podia fallar: tot programa detectat ho és
    perquè és hereditari en alguna d'aquestes 3. La prova amb companys inerts només depèn dels bytes del programa: no cal cap captura.
  - **Dos llindars:** «en alguna» (hereditària en 1 de 100 o més) i **«robusta»** (en 50 de 100 o més), comparable amb els genotips
    plantats (95 de 100 o més).
  - **Les que ja hi eren, «de partida»** (AUD-193; v0.4, AUD-201): algun programa de la **primera detecció** de la família comparteix una
    finestra amb una cel·la **hereditària** de l'escaneig inert del punt de partida (§3).
  - **Les «emparentades»:** algun programa de la família, de qualsevol cens, en comparteix una amb **qualsevol** cel·la que s'hi copiava. És
    la regla de la v0.3, que comptava més famílies de les que ja hi eren: a les quatre sopes que l'auditor 1 va escanejar, cap cel·la no hi
    era hereditària, i la barrejada en tenia 127 que es copiaven.
  - ***λ*det es dona amb tots dos llindars, i cadascun amb totes les famílies, sense les de partida i sense les emparentades** (AU2-175).
  - **El temps:** és el de la detecció, no el de la formació (l'auditor 2).
- **L'arrelament natural** (AU2-158): la família detectada és **dominant** a l'establiment, és a dir, té la meitat o més de les cel·les
  hereditàries del cens inert del cens que el confirma. La mateixa regla que a la part A. La més nombrosa sense arribar a la meitat no és
  dominant (es dona com a descriptiu).
- **Les xifres de cada sopa:**
  - ***λ*det** (AU2-160): les aparicions **detectades** pel cens inert per cada 1.000 mon-èpoques d'exposició, abans de l'establiment. No
    és el ritme de formació de replicadors: el detector no veu gairebé cap de les que s'apaguen de seguida (un 10 % a la prova de
    viabilitat), i quantes en veu pot dependre de la sopa. Amb els dos llindars, i amb les de partida i sense;
  - ***P*(arrela | detectada):** la part de les famílies detectades robustes que arrelen (§6.4);
  - **el ritme d'establiment.**
- **La sensibilitat del detector** (l'auditor 2; v0.4, AU2-175): a la part A també corre el cens inert, i el llinatge en dona la mida real.
  L'anàlisi en dona una taula per sopa, sense els `sham`:
  - **per cens:** de cada cens inert, si ha vist el llinatge, segons la *F* del llinatge a la mateixa època (1; de 2 a 10; d'11 a 100; de
    101 a 1.310; 1.311 o més);
  - **per llinatge:** si el cens l'ha vist alguna vegada, segons la *F* màxima.

  És descriptiva: no serveix per corregir les aparicions que el cens no veu, i no arriba a les famílies que no veu mai.

## 6. L'anàlisi (fixada aquí; l'script, a la PR, abans de calcular)

`node eines/arrelament-analisi.mjs`, tal com surt. Només amb el pilot sencer (§7). El món és la unitat: el bootstrap remostra mons sencers
(10.000 vegades, amb la llavor 20261119).
1. ***p*R de cada sopa i variant** (la part A), amb els intervals del bootstrap per món, i **els desenllaços per causa**: arrela,
   s'extingeix, censurada a *H*, censurada per l'establiment (AU2-159).
2. **El contrast principal:** el quocient de *p*R entre `continue` i `reinit`, i entre `shuffle-all` i `reinit`, estratificat per variant
   (Mantel i Haenszel) amb G1, G1 × 9 i G4. Cada variant, també a part.
   - **Les dues mesures:** «arrela» (la principal) i «s'estableix amb el llinatge dominant» (la meitat o més).
   - **Les sensibilitats:** les censurades com si arrelessin; el criteri estricte de *F* (AU2-165); sense els mons i sopes amb una col·lisió
     al bessó (AU2-156).
   - **El secundari:** `byte0` contra `byte0-placebo`, amb G1 × 9 i G4 (només veu efectes grossos, §4.3).
   - **Les col·lisions:** quants mons i sopes en tenen, i la mediana de `preCarriers`.
3. ***λ*det de cada sopa** (la part B), amb els sis recomptes (els dos llindars, «en alguna» i «robustes», cadascun amb totes les famílies,
   sense les de partida i sense les emparentades), els intervals i els quocients contra `reinit`; i la calibració del detector (§5).
   Descriptiu (AU2-160, AU2-175).
4. **La consistència** (l'auditor 1; AU2-158, AUD-197; v0.4, AUD-199 = AU2-172): a cada sopa, *P*(arrela | detectada) de les famílies
   naturals robustes, contra la dels llinatges plantats que el cens inert ha detectat, **amb la mateixa definició, la mateixa finestra i la
   mateixa regla de seguiment a totes dues:**
   - **la finestra:** 1.250 èpoques des de la primera detecció. És el que la part A pot veure d'un llinatge detectat al primer cens inert
     (l'època 8.250): l'últim establiment que s'hi pot confirmar és el de l'època 9.500. La v0.3 deia 1.500 a les dues parts, i el codi
     donava 1.250 com a molt al plantat (AUD-199);
   - **les quatre classes** (`followUpClass`), de cada família o llinatge detectat:
     - **arrela:** un establiment de la llei 2 dins de la finestra, i n'és dominant (la meitat o més de les hereditàries del cens inert; les
       famílies que s'hi han unit, també en cadena, AUD-200);
     - **competidor:** un establiment dins de la finestra, i no n'és dominant. Un altre s'hi estableix i n'interromp el seguiment: no és un
       fracàs per defecte (l'auditor 2);
     - **no arrela:** cap establiment dins de la finestra, i la branca s'ha pogut seguir tota la finestra (fins a l'últim establiment que
       pot confirmar: a la part A, el de l'època 9.500; a la part B, el de 250 èpoques abans del final);
     - **censurada:** cap establiment, i la branca no s'ha pogut seguir tota la finestra. **No entra al denominador**, ni a la A ni a la B
       (la v0.3 les treia als naturals i les comptava com a fracassos als plantats; AU2-172);
   - ***P*** = arrela / (arrela + no arrela), amb els recomptes de les quatre classes a totes dues parts, i una sensibilitat amb els
     competidors com a fracassos;
   - **per la mida a la primera detecció** (1 cel·la, de 2 a 4, 5 o més): la comparació pot sortir diferent només per la mida.
   - **Els temps comencen a la detecció,** a totes dues parts. A la part A, la sembra és abans: la diferència es diu. Els que es detecten
     tard (a la part A, després de l'època 8.250, sense establiment) queden censurats: la consistència parla sobretot dels que es detecten
     d'hora.
   - **Si coincideixen,** els plantats representen els naturals detectats robustos. **Si no,** es diu, i la part A només parla d'aquestes
     variants.
   - **El producte *λ*det × *P*(arrela | detectada)** (AU2-161), contra el ritme d'establiment observat: **només una aproximació
     exploratòria.** Suposa que totes les aparicions que arrelen es detecten i que la detecció no depèn de la sopa. No és cap
     descomposició identificada del ritme d'establiment, i no se'n diu cap.
5. **La lectura** (§1): els quocients de *p*R (amb les dues mesures), amb els sis casos i la regla de la precisió; i el de *λ*det (els
   robustos), com una classificació numèrica, sense cap mecanisme (AU2-174).
6. **Els descriptius:** G2 i G3; «arrela» i «s'estableix amb el llinatge dominant», l'una al costat de l'altra; les durades; quantes
   branques canvien amb el criteri estricte; els `sham` contra els bessons (§4.3); i el punt de partida de cada braç.

L'script s'escriu i es prova amb dades sintètiques abans de calcular, com al pas 3, i va a la PR.

## 7. Les eines (una PR, amb les auditories 32 i 33)

**Ja fetes** (la branca `arrelament-eines`; `test/arrelament.mjs`, a `npm test`):
- **`sim.mjs`**, amb dos mòduls nous (`fase2/inert.js` i `fase2/llinatge.js`), cinc opcions:
  - `--plant` (només al món, i la línia d'inici diu `preCarriers`);
  - `--track` (seguir uns quants programes sense plantar-los; no es pot fer servir amb `--plant`, i demana `--lineage-every`);
  - `--lineage-every` (demana `--plant` o `--track`);
  - `--stop-on-extinction` (només amb `--plant`);
  - `--inert-census`, que, amb un llinatge, també diu quantes hereditàries en són.

  **Sense aquestes opcions, res no canvia.** La sortida és la d'abans, línia a línia, i passen les empremtes de `test/determinisme.mjs` i els
  valors del cens v2 i v3 (`CLAUDE.md`). El cens inert i el llinatge tenen un atzar propi: amb ells, els censos v3 i l'empremta final són els
  mateixos, també amb `--track`.
- **`fase2/inert.js`:** còpies de les funcions de la prova d'autonomia de B1, perquè el simulador no depengui d'una eina de B1. La prova
  comprova que fan el mateix.
- **`fase2/llinatge.js`:** el llinatge, d'un programa o de diversos alhora (el seguiment), amb la prova sencera quan la mostra no troba cap
  funcional (`exhaustive`), i `carriers()`, les cel·les que porten alguna finestra d'uns programes.
- **`eines/sembra.mjs`:** el fitxer de cada sembra i dels `sham`, amb les comprovacions:
  - el genotip, 95 de 100 o més;
  - el `sham`, 0 de 100;
  - la cel·la, a l'interior;
  - la SHA-256 de la captura.

  I les posicions (`--positions`), les mateixes que a la prova de viabilitat.
- **`eines/transforma.mjs`:** `byte0` i `byte0-placebo`, amb els invariants comprovats; el placebo, que sempre mou una instrucció (AUD-195).
- **`eines/potencia-arrelament.mjs`:** la precisió del contrast principal, simulada per món amb les *p*R de la prova de viabilitat (§8).
- **`eines/arrelament.mjs`:** les llistes, el manifest i les comprovacions abans de llançar, amb les mateixes regles que la sèrie de la
  maduració (`eines/pilot.mjs`):
  - **`--envelliment [--mons N]`:** l'envelliment dels 74 primers mons de la llista;
  - **`--prepara`:**
    - valida l'envelliment, amb el mateix simulador;
    - escaneja els mons per rondes fins a tenir-ne 60;
    - fa les cinc sopes de cada món i n'escaneja el punt de partida, amb la prova del cens i, a les tres de la part B, amb companys inerts
      (amb el programa de cada cel·la que es copia, AUD-193);
    - fa les sembres i els seguiments de la part B (`seguiments/MON.json`, amb la SHA-256 al manifest), i escriu les llistes de les dues
      parts, per màquina, i el manifest;
  - **`--comprova [--maquina pc|vm]`:** el manifest contra el disseny, les captures, les sembres, els seguiments i les llistes contra el
    manifest, i que cap branca no hagi començat.
- **`eines/arrelament-analisi.mjs`:** l'anàlisi de la §6. Només amb el pilot sencer:
  - **el manifest, contra el disseny** (`designProblems` d'`eines/arrelament.mjs`; v0.4, AU2-170): els paràmetres, la cohort, i cada branca
    del disseny exactament una vegada i en ordre, amb la seva ordre, el món, la sopa, la variant, la posició, la llavor i la sembra (o el
    seguiment);
  - **els escanejos inerts del punt de partida** de les sopes de la part B, amb la SHA-256 del manifest i la llista de les cel·les que es
    copien (v0.4, AU2-171 = AUD-202);
  - **cada registre,** sencer, amb l'ordre i la sembra (o el seguiment) del manifest, i **del commit del manifest** (AU2-162).

  Si en falta res, no se n'analitza res.
- **Les proves** (`test/arrelament.mjs`), entre d'altres:
  - un pilot sencer amb un disseny petit (mons de 32 × 16), de l'envelliment a l'anàlisi;
  - l'anàlisi, determinista;
  - les comprovacions, que detecten una sembra i una llista tocades, i un registre d'un altre commit;
  - **els contraexemples de l'auditoria 32:** l'extinció exacta amb més de 256 cel·les (una funcional entre 300, amb 8 llavors); el
    seguiment de diversos programes; `--track` sense canviar la història; `preCarriers`; les combinacions d'opcions rebutjades; el placebo,
    que mou una instrucció; una pluralitat de 2 de 5 que no és dominant; el criteri estricte; la causa de la censura; i els sis casos de la
    lectura, amb la regla de la precisió;
  - **els de l'auditoria 33** (v0.4): un manifest amb una branca de menys, una de repetida, una de més i una amb una altra llavor; un escaneig
    inert de partida que no hi és, que no té la SHA-256 del manifest i que no porta la llista de les que es copien; les quatre classes del
    seguiment, amb els dos contraexemples de l'auditor 2 (un natural i un plantat detectats tard: tots dos censurats); una cadena de famílies;
    «de partida» i «emparentada»; una extinció que comença després de *H*; i la lectura de *λ*det, sense cap mecanisme.
- **El que no hi és:** la PR petita de l'auditoria 31 (el punt 5, `windowsOf` amb un `Buffer`). No afecta el pilot, que només hi passa
  `Uint8Array`, i va a part.

## 8. El cost i la precisió

**Les xifres de la prova de viabilitat** (8 processos alhora):
- 253 s per cada 1.000 èpoques;
- una sembra que s'extingeix s'atura en unes 150 èpoques: menys d'un minut;
- una que arrela, unes 1.000 èpoques: arrelar, establir-se i 500 més.

| Què | Quantes | Hores de CPU |
|---|---|---|
| L'envelliment | uns 74 mons (0,45 h cadascun) | 33 |
| Els escanejos de l'època 8.000 | la inclusió (74) i el punt de partida dels braços (180, amb la prova del cens i amb companys inerts) | 26 |
| La part B | 180 branques, de fins a 8.000 èpoques (unes 0,9 h, amb el cens inert i el seguiment) | 163 |
| La part A, les tres sopes | 60 mons × 3 sopes × (4 × G1, 4 × G1 × 9, 4 × G4, G2, G3): 2.520 branques, unes 34 min per món i sopa | 100 |
| La part A, `byte0` i el placebo | 60 mons × 2 × (2 × G1 × 9, 2 × G4): 480 branques | 18 |
| Els `sham` | 20 mons × 3 sopes, fins a l'època 9.750 (unes 6,5 min) | 7 |
| **En total** | | **unes 350** |

- **Les correccions de l'auditoria 32 hi afegeixen poc:** el seguiment, unes 2,5 h a la part B (0,3 s per punt); la prova sencera a
  l'extinció, uns segons, i només als punts on *M* passa de 256 i cap de la mostra no és funcional (a la prova de viabilitat, 5 de 90
  branques; l'auditor 1 hi va mesurar d'1,4 a 9,8 s per punt, amb la màquina carregada).
- **Una cota que la v0.3 no deia** (l'auditor 1, auditoria 33): a la part B no hi ha aturada a l'extinció. Si un món tingués una col·lisió i
  el seguiment s'hi quedés amb moltes cel·les sense cap de funcional a la mostra, es provarien totes a cada punt: uns 4 ms per cel·la, uns
  40 s per punt amb 10.000 cel·les. Als dos bessons que va fer l'auditor 1, el seguiment no hi troba cap cel·la.
- **El temps real:** amb 8 processos al PC, uns dos dies; amb la màquina virtual també, un dia i mig.
- **La precisió del contrast principal** (la regla de la v0.1: *N* i *K* han de distingir 1 de 1,6, una semiamplada de log(1,6)/2 = 0,235
  com a molt; si no, la lectura diu «inconcloent», §1).
  - **Les dades:** 240 sembres per variant i sopa, i les *p*R de la prova de viabilitat (G1 0,11, G1 × 9 0,39 i G4 0,22).
  - **El càlcul aproximat:** l'error típic del logaritme del quocient estratificat és d'uns 0,09, i la semiamplada, d'uns 0,18.
  - **La simulació per món** (`node eines/potencia-arrelament.mjs`, 400 pilots simulats per cas, amb el bootstrap per món de la §6). Un
    efecte del món (sigma) i un de cada sopa del món (tau, la interacció), sobre el logit de *p*R:
    - **sense interacció o amb una de moderada** (tau fins a 0,5): la semiamplada va de 0,13 a 0,23, dins de la regla;
    - **amb una interacció forta** (sigma = tau = 1): de 0,21 a 0,25, al límit;
    - **en tots els casos,** si el quocient de debò és 1, l'interval exclou 1,6 en el 97 % dels pilots o més, i si és 1,6, exclou 1 en el
      96 % o més;
    - **la cobertura a 2,05** (`shuffle-all`) baixa fins al 69 % amb sigma = 1, pel sostre de la probabilitat 1 (l'auditor 1). L'script ho
      avisa.
  - **El que no hi és:** les *p*R de la prova de viabilitat són de 6 mons, i amb 18 sembres per variant poden ser més baixes al pilot (la
    regressió a la mitjana). Si ho són, l'interval s'eixampla, i la regla de la precisió ho dirà.
- **Si cal més de tres dies,** es redueix la part B abans que la part A, i es diu.

## 9. La prova de viabilitat (feta el 16-11-2026, exploratori)

**El que és:** `fase2/resultats/arrelament/viabilitat/` (la nota, `a98bbcc`, abans de calcular; el que surt, al README, amb una secció de
correccions de l'auditoria 32).
- **Les dades:** 6 mons del pilot de la maduració (5004, 5006, 5008, 5014, 5019 i 5020), les tres sopes a l'època 8.000, els quatre
  genotips en una cel·la i G1 en un quadrat de 3 × 3: 90 branques de fins a 4.000 èpoques, amb una captura cada 100 i el llinatge
  després.
- **Les branques:** de les 13.45 a les 15.47 del 16-11-2026, totes bé.

**El que en surt per al disseny:**
- **Arrelar depèn sobretot del genotip** (de 18 sembres): G1 2, G1 × 9 7, G2 17, G3 15 i G4 4. D'aquí les variants informatives i
  descriptives (§4.1).
- **Els que s'extingeixen ho fan de seguida:** 31 de 38 en 100 èpoques, sense cap còpia hereditària. N'hi ha que es copien al company: de
  les 27 amb *F* màxim 1, 12 van deixar trossos del genotip en altres cel·les. L'aturada a l'extinció fa la part A barata.
- **Els que arrelen,** en 200 èpoques de mediana i 1.100 com a molt: *H* = 1.500 (§4.4).
- **L'aturada a l'establiment** censurava el criteri del llinatge: ara, 500 èpoques més tard (§4.4).
- **La família dominant** s'ha de mesurar amb la mateixa prova que el llinatge: ara, amb el cens inert (§4.5).
- **El cens inert** veu tots els llinatges que arrelen i un 10 % dels que s'extingeixen (§5). És orientatiu: suposa que la prova veu
  totes les funcionals.
- **Plantar una cel·la canvia la història de tot el món** (AUD-194): cap branca no torna a la del bessó, encara que el llinatge s'apagui
  de seguida. En 3 casos de 3, l'establiment arriba al mateix cens que al bessó (§4.2). La v0.2 deia que «l'atzar comú funciona: quan la
  sembra s'apaga, el món torna a la història del bessó»: no se sosté.
- **Ser hereditari en totes 100 condicions no vol dir arrelar en una sopa:** G1 i G4 ho són, i s'extingeixen en 15 i 14 sembres de 18
  (l'auditor 1, per a l'entrada del quadern).

**Per sopa, amb 6 mons, no és cap resultat.** Els quatre genotips en una cel·la arrelen en 11 sembres de 24 a la sopa envellida, en 12 a la
barrejada i en 15 a la nova. Les diferències, si n'hi ha, poden anar en qualsevol direcció: el pilot ho ha de poder dir en totes dues (§1).

## 10. Els límits, d'entrada

- **Un replicador plantat no és una aparició natural.** El genotip, el lloc (una cel·la a l'atzar) i el moment (l'època 8.000) són
  nostres. Que el plantat representi els naturals no se suposa: ho prova la consistència (§6.4), i només per als naturals detectats.
- **Quatre genotips, i dos al sostre.** L'arrelament depèn molt del genotip. El contrast principal parla de G1, G1 × 9 i G4, i el pilot
  només en veurà la variació gruixuda.
- **D'on venen els genotips:** G1 d'un món envellit, com `continue`; G4 d'un establiment a una sopa nova. Si un genotip arrela millor a
  la mena de sopa d'on ve, el contrast estratificat ho barreja. Per això cada variant també es dona a part.
- **G3 i G4 són de la família dominant del seu establiment; G2, de la segona** (§4.1).
- **El llinatge és de finestres, no de descendència** (§4.5): el control de les col·lisions en fita la part que no ho és.
- **Dues mesures, dos noms:**
  - **«arrela»:** el criteri del llinatge, amb companys inerts;
  - **«s'estableix»:** el de la llei 2, amb companys de soroll.
- ***p*R és dins de *H*:** una sembra censurada compta com que no arrela dins de *H*, i es dona la sensibilitat (§4.5).
- **Una aparició es veu quan es detecta.** *λ*det no és el ritme de formació, el seu temps és el de la detecció, i el detector no veu
  gairebé cap de les que s'apaguen de seguida. El producte amb *P*(arrela | detectada) és una aproximació, no una descomposició.
- **La consistència parla sobretot dels que es detecten d'hora:** amb la mateixa finestra a les dues parts (1.250 èpoques), els que es
  detecten tard i sense establiment queden censurats, i es compten.
- **Exploratori.** Cap afirmació causal general fins a una confirmació amb mons nous (el criteri de l'auditor 2 per passar del pilot a
  una confirmació). Una confirmació que torni a plantar necessita una decisió nova del responsable (§2).

## 11. El que ve

1. **La PR** (la branca `arrelament-eines`), amb les correccions de les auditories 32 i 33, prova-neta i les proves de GitHub.
2. **La comprovació de tancament** (l'auditoria 34, curta, amb tots dos auditors): les correccions de l'auditoria 33, els seus
   contraexemples i aquest pla, abans de cap dada del pilot. L'auditor 1 deia que n'hi havia prou amb les SHA-256 noves i la prova; l'auditor
   2 la demana: amb tots dos, els tres hi estem d'acord.
3. **El merge,** i el pilot des d'una còpia neta:
   - l'envelliment;
   - els escanejos i les transformacions;
   - les parts A i B, uns dos dies de màquina.
4. **La ronda d'auditoria dels resultats,** i l'entrada del quadern.
