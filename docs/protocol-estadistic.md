# Protocol estadístic · sèrie confirmatòria de la llei 2

**Estat: esborrany v0.5 (16-10-2026).** Incorpora les correccions que van demanar tots dos auditors a
les auditories 3, 4 i 5, abans del *merge*. No s'ha llançat cap experiment d'aquesta sèrie. Quan el protocol
estigui aprovat, el commit del *merge* farà de preregistre: qualsevol canvi posterior s'haurà de
justificar aquí mateix, amb data i motiu, abans de mirar els resultats. Els canvis respecte de les
versions anteriors són a §13.

Respon a:
- AUD-06 (auditoria 1);
- AUD-30 a AUD-34 (auditoria 2) i AU2-01 a AU2-09 (auditoria externa 2);
- AUD-42 a AUD-45 (auditoria 3) i AU2-15 a AU2-22 (auditoria externa 3);
- AUD-46 a AUD-49 (auditoria 4) i AU2-23 a AU2-28 (auditoria externa 4);
- AUD-50 (auditoria 5) i AU2-29 i AU2-30 (auditoria externa 5).

La
sèrie de 15 llavors (entrada 6 del quadern) va ser exploratòria: generador v1, llavors no
independents, i un criteri i una prova triats després de veure les dades. Aquí es fixa tot abans.

## 1. Pregunta

Al món 2D, un corrent feble (barreja *m* = 0,01) fa que la vida **s'estableixi** més sovint o abans que
al món quiet (*m* = 0)?

"Establir-se" té una definició operativa (§4): replicadors hereditaris en almenys l'1 % del món, en dos
censos seguits. La pregunta no és sobre l'aparició dels primers copiadors, que és una mesura secundària
(§6), ni sobre si l'espai frena la vida respecte de la sopa barrejada, que demanaria una altra
comparació.

## 2. Hipòtesis

- **H0:** el corrent no canvia el ritme d'establiment (mateixa funció de risc).
- **H1:** el ritme és diferent amb corrent (bilateral). L'exploració suggereix que és més alt, però la
  prova és bilateral per no comprometre-nos amb la direcció.

## 3. Disseny

| | |
|---|---|
| Condicions | A: *m* = 0 (món quiet) · B: *m* = 0,01 |
| Món | 512 × 256, radi 2, sense difusió ni flux, mutació 0,00024 (vegeu §12) |
| Generador | v2 (xoshiro128\*\* inicialitzat amb SplitMix32) |
| Llavors | **Etapa 1:** A 1001–1050, B 2001–2050. **Etapa 2** (si cal, §8): A 1051–1080, B 2051–2080. Grups independents (§12) |
| Horitzó | 16.000 èpoques |
| Manifest | `fase2/serie-llei2.json`: les llavors de cada etapa, els paràmetres i els límits. L'anàlisi rebutja qualsevol fitxer que no hi encaixi (§9) |
| Codi | El commit del *merge*, amb l'etiqueta de git **`preregistre-llei2`** (AUD-46, AU2-23). És una etiqueta anotada, amb l'empremta SHA-256 del manifest, del protocol i de `fase2/estadistica.mjs`, i es publica a GitHub abans de llançar res. A la VM s'executa des de la carpeta d'aquell commit (`bash desplega-vm.sh` des d'una còpia de l'etiqueta, `~/claude-origins-<commit>`), i al PC, des d'un `git worktree` de l'etiqueta. Els registres no poden dir `+canvis`. `--etapa` comprova que el commit de cada experiment sigui el de l'etiqueta |
| Carpetes | `serie-llei2/A/` i `serie-llei2/B/`, una per condició (AUD-49). Per a cada llavor S: `S.jsonl`, `S.log` i `captures/` dins de la carpeta del grup. En acabar, es copien a `fase2/resultats/serie-llei2/A` i `.../B` (els JSONL i els registres a git; les captures, fora de git) |
| Entorn | Node 20.19.2 (VM, zlib 1.3.1) o Node 16.15.1 (PC, zlib 1.2.11). Donen resultats idèntics: `npm test` hi passa sencer, amb les mateixes empremtes i el mateix cens. La versió consta a cada registre |
| Ordre | `node sim.mjs --world 512x256 --seed S --mixing M --epochs 16000 --every 100 --census 250 --census-version v3 --stop-after-event 1000 --rng v2 --json serie-llei2/G/S.jsonl --save serie-llei2/G/captures --save-what event > serie-llei2/G/S.log` (G = A o B) |
| Dades | Un registre de text i un JSONL per experiment. El JSONL té una línia per cens i per mesura, amb tots els valors sense arrodonir, el commit i les versions. Amb `--save-what event`, quan hi ha establiment, es desen els mons dels censos de *t*, *t* − 250 i *t* − 500 (24 MB). Serviran de banc de mons amb vida (AUD-41) i per estudiar l'origen abans de la detecció (§6.7) |

> **Corregit el 18-10-2026, després de l'execució (AUD-55, auditoria 7).** La fila "Entorn" diu que les
> dues màquines "donen resultats idèntics". Les històries dels mons sí que són idèntiques: l'empremta del
> món, els censos sencers, l'establiment, les operacions i H0. L'auditor 1 ho va comprovar tornant a
> executar llavors de totes dues màquines. Però l'HOE de les mesures difereix lleugerament, fins a
> 1,1 × 10⁻³ bits per byte, perquè zlib 1.2.11 (Node 16) i 1.3.1 (Node 20) no comprimeixen igual el
> mateix món. Per exemple, el món de la llavor 2030 a l'època 14.000 ocupa 2.965.692 bytes contra
> 2.966.230. No afecta la mesura principal ni la decisió. Només podria afectar la sensibilitat
> descriptiva "HOE > 1" en un món que quedés molt a prop del llindar. La versió preregistrada d'aquest
> document és la de l'etiqueta `preregistre-llei2`; aquesta nota no hi canvia res.

## 4. Mesura principal: el moment de l'establiment

**Cens** (`fase2/census.js`, versió 3), cada 250 èpoques:
- es posen a prova **2.048 cel·les diferents** triades a l'atzar, amb un generador propi del cens (llavor
  20261016);
- es compta quantes són **replicadors hereditaris** (`fase2/replication.js`): el programa deixa al company
  16 bytes seguits de si mateix, amb almenys 6 valors diferents, i la còpia també es copia;
- la prova es fa sola (primer, amb un company de soroll, 2 intents) i en context (segon, amb un veí del
  món, 4 intents);
- els intents continuen fins que l'herència queda demostrada, també després d'un primer fill que no és
  hereditari (AU2-15);
- el cens registra per separat **l'herència demostrada sola** (`heritableSolo`) i **la demostrada només
  en context** (`heritableContext`).

**Limitació coneguda de la prova en context (AUD-42).** En context, el company va primer i també executa
codi. En un món artificial de "lectors", programes que copien el company dins seu, fins i tot un bloc de
dades sense cap instrucció surt hereditari. A les captures reals no s'ha vist, però per això es
registren `heritableSolo` i `heritableContext`, i hi ha una regla d'interpretació (§7).

**Hi ha establiment a l'època *t*** si, en dos censos seguits, almenys l'1 % de la mostra són
replicadors hereditaris (≥ 21 de 2.048). *t* és l'època del primer dels dos, assignada retrospectivament:
no se sap fins al cens següent. "Seguits" vol dir a exactament 250 èpoques de distància; si en faltés
algun entremig, no compten (AU2-17). És la funció `establishment()` de `census.js`, la mateixa que fan
servir `sim.mjs` i l'anàlisi.

**Què mesura.** El temps fins a l'establiment **segons aquest cens**. És un constructe operatiu, no una
equivalència amb una còpia sencera del genoma ni amb una persistència indefinida (AU2-22). "No detectat"
no vol dir "absent": una colònia de 27 cel·les en un món de 131.072 no la veu gairebé mai una mostra de
2.048 (`docs/calibratge.md`, §6).

**Censura:**
- si no hi ha establiment, l'experiment queda censurat a l'última època simulada, que és la 16.000;
- un criteri que només es compleix al cens de la 16.000 no té segon cens, i també queda censurat.

**Temps discret.** L'esdeveniment només es pot observar cada 250 èpoques. El log-rank amb empats ho té en
compte.

**Calibratge** (`docs/calibratge.md`):
- **No compta:** un copiador parcial sintètic (es copia en el 100 % dels intents, però no és hereditari
  mai), l'enverinador i els mons aleatoris.
- **Sí que compta:** els replicadors reals, el replicador que necessita parella (en context) i el
  successor immune.
- **Sobre les 12 captures clau,** separa les sopes enverinades (moltes còpies no hereditàries) dels mons
  amb replicadors sans.

**Per què no el territori de les famílies, com a la v0.1.** S'ha mesurat que el territori es desvia dels
replicadors reals en tots dos sentits (AU2-01). A més, els identificadors de família canvien amb les
fusions (AUD-32).

## 5. Regla d'aturada

Cada experiment s'atura **1.000 èpoques després de l'establiment** (`--stop-after-event 1000`), o a la
16.000. L'entropia d'ordre superior ja no atura res (AUD-30, AU2-04).

**Per què no és censura informativa.** Un experiment només s'atura després d'haver observat
l'esdeveniment, i el que passi després no canvia el temps fins a l'esdeveniment. Els experiments sense
establiment arriben a la 16.000, amb una censura administrativa igual a les dues condicions. Les 1.000
èpoques de més serveixen per a la mesura de manteniment (§6.5).

A l'auditoria 3, **tots dos auditors van acceptar aquesta regla per a la mesura principal**. L'auditor
1 va comprovar al codi que l'esdeveniment queda confirmat abans de l'aturada.

**Sí que censura les sensibilitats** que es compleixen més tard, per exemple el llindar del 5 %
(AUD-43). Aquesta censura depèn de l'esdeveniment principal. Per això les sensibilitats són
descriptives, i l'informe diu, per a cadascuna, quants experiments hi han quedat censurats.

## 6. Mesures secundàries (descriptives)

1. Les corbes de Kaplan–Meier de cada condició.
2. La diferència d'incidència acumulada d'establiment a la 16.000 (B − A), amb l'interval al 95 %
   (Greenwood).
3. El temps mitjà restringit fins a l'establiment (RMST) a la 16.000, i la diferència entre condicions.
   És robust si els riscos no són proporcionals.
4. La proporció d'experiments amb establiment: la prova exacta de Fisher i els intervals de Wilson.
5. **Manteniment:** si al cens de *t* + 1.000 encara hi ha l'1 % de replicadors hereditaris.
6. **Origen (AUD-34):**
   - l'època del primer cens amb algun replicador hereditari;
   - el nombre de censos amb replicadors hereditaris abans de *t*;
   - el temps entre la primera detecció i *t*;
   - les mateixes tres mesures per als copiadors de primera generació.
7. **Origen abans de la detecció.** És una anàlisi descriptiva, que es farà després de la sèrie. Sobre
   les captures de *t* − 500, *t* − 250 i *t*, es farà un cens de totes les cel·les per mesurar la mida de
   la colònia abans de la detecció i el retard entre l'origen i l'establiment a cada condició.
   - **Per què importa (auditoria 3, §5.3).** El corrent podria escurçar aquest retard perquè escampa la
     colònia. Llavors, una part de la diferència entre condicions vindria d'una propagació més ràpida, i
     no d'un origen més freqüent.
   - **No invalida la mesura principal,** perquè tot això forma part de l'establiment. Però la conclusió
     ho haurà de dir.

## 7. Anàlisis de sensibilitat (preespecificades, descriptives)

Totes surten dels mateixos JSONL. No canvien la conclusió principal:

1. Sense herència: la primera generació (es copien) ≥ 1 %.
2. Llindar del 5 %.
3. **L'herència demostrada sola** (`heritableSolo`) ≥ 1 %, sense la prova en context (AUD-33c, AUD-42,
   AU2-19).
4. El criteri de la v0.1, amb la unió de les famílies: el territori ≥ 1 % del mapa.
5. L'HOE > 1, com a l'exploració.
6. La proporcionalitat de riscos, de manera descriptiva (log(−log *S*)).

**Regla d'interpretació (AUD-42, precisada per AU2-28).**
- **L'única decisió confirmatòria és la prova principal** (el log-rank amb els límits de §8). La
  sensibilitat 3 no és una segona porta de significació: no converteix un resultat en confirmat ni en no
  confirmat.
- **El que canvia és com es formula la conclusió.** Si el resultat principal és positiu però no es manté
  amb la sensibilitat 3, és a dir, si depèn dels hereditaris només en context, es dirà explícitament: "el
  corrent canvia el ritme d'establiment operacional segons el cens v3, i la diferència depèn de
  l'herència demostrada en context".
- **Qualsevol afirmació mecanística** sobre el tipus de replicador serà exploratòria i, per fer-la
  confirmatòria, caldrà un preregistre nou.

## 8. Mida de la mostra: dues etapes

**Potència del log-rank** per simulació: riscos exponencials, temps arrodonits al cens i censura a la
16.000. La calcula el mateix codi de l'anàlisi (`node fase2/estadistica.mjs --potencia N`), i coincideix
amb la de l'auditor 1:

| Llavors per condició | 20 % contra 50 % | 20 % contra 45 % | 20 % contra 40 % | 20 % contra 35 % |
|---|---|---|---|---|
| 50 | 90 % | 78 % | 61 % | 40 % |
| 80 | 98 % | 93 % | 80 % | 57 % |

L'exploració va donar un 20 % contra un 53 %, però és una estimació molt incerta, i la diferència mínima
que ens interessa és la d'un 20 % contra un 40 %. Per això es fa servir un **disseny en dues etapes** amb
límits d'O'Brien–Fleming (despesa de Lan–DeMets), amb una fracció d'informació planificada de 50/80:

| | Etapa 1 (50 per condició) | Etapa 2 (80 per condició) |
|---|---|---|
| Es rebutja H0 si | \|Z\| > 2,479 (*p* < 0,0132) | \|Z\| > 2,004 (*p* < 0,0450) |

- **Si a l'etapa 1 es rebutja H0,** la sèrie s'acaba. La mida de l'efecte es dona com a descriptiva:
  en un disseny seqüencial, l'estimació tendeix a sobreestimar l'efecte.
- **Si no,** s'executen les llavors de l'etapa 2 i el log-rank es fa amb les 80 + 80.
- **La decisió és mecànica i la fa el codi:** `node fase2/estadistica.mjs --etapa 1 carpeta-A carpeta-B`.
  - **Quan s'analitza:** l'anàlisi de l'etapa 1 només es fa quan han acabat **els 100 experiments**. El
    validador ho exigeix.
  - **Cap altra anàlisi intermèdia.**
- **Els límits es fixen ara,** amb la fracció de llavors 50/80, i no es recalculen amb els esdeveniments
  observats. Els dos auditors hi estan d'acord. L'auditor 1 va comprovar per simulació que recalcular-los
  dona el mateix error de tipus I (4,8–5,3 %) i la mateixa potència.
- **La sortida de `--etapa 1`** (la decisió, el commit i l'empremta dels fitxers) es desa a git amb un
  commit abans de llançar res de l'etapa 2, perquè la decisió quedi datada (AUD-47).
- **`--etapa 2` recalcula Z sobre les llavors de l'etapa 1** i es nega a decidir si ja rebutjaven H0
  (AUD-47, AU2-26).

**Simulació del procediment sencer (AU2-21).** S'ha fet amb el mateix codi de l'anàlisi
(`node fase2/estadistica.mjs --potencia 20000`): temps de Weibull, arrodonits al cens i censurats a la
16.000. La taula dona:
- la proporció de sèries que rebutgen H0, amb l'error de Monte Carlo;
- la proporció que s'aturen a l'etapa 1;
- el nombre mitjà d'experiments.

| Escenari (incidència a la 16.000; forma del risc) | Rebutja H0 | S'atura a l'etapa 1 | Experiments esperats |
|---|---|---|---|
| H0 · 10 % (formes 0,5, 1 i 2) | 4,83–4,84 % (± 0,15) | 1 % | 159 |
| H0 · 30 % | 5,01–5,03 % (± 0,15) | 1 % | 159 |
| H0 · 50 % | 5,00–5,05 % (± 0,15) | 1 % | 159 |
| H0 · 70 % | 5,15–5,17 % (± 0,16) | 1 % | 159 |
| H0 · 90 % | 5,24–5,33 % (± 0,16) | 1–2 % | 159 |
| H1 · 20 % contra 40 %, riscos proporcionals | **79,0 %** (± 0,3) | 38 % | 137 |
| H1 · 20 % contra 50 %, riscos proporcionals | **98,2 %** (± 0,1) | 77 % | 114 |
| H1 · 20 % contra 40 %, amb corrent primerenc (forma 0,5) i sense, tardà (forma 2) | 88,0 % (± 0,2) | 50 % | 130 |
| H1 · 20 % contra 40 %, amb corrent tardà (forma 2) i sense, primerenc (forma 0,5) | 67,5 % (± 0,3) | 29 % | 143 |

La sortida completa és a `fase2/resultats/calibratge/potencia-dues-etapes-20000.txt` (VM, commit
`734f4de`).

- **L'error de tipus I** és del 5,0 % a les incidències que s'esperen a la sèrie (20–50 %). Puja una mica,
  fins al 5,3 %, quan gairebé tots els experiments tenen establiment, pels empats que creen els censos
  cada 250 èpoques. L'auditor 1 hi va arribar pel seu compte, i és acceptable.
- **La potència per a la diferència mínima rellevant** (20 % contra 40 %) és del 79 %, amb 137 experiments
  de mitjana. Coincideix amb la simulació de l'auditor 1 (79,6 %).
- **Amb riscos no proporcionals,** la potència depèn de la forma de la diferència: és més alta si el
  corrent fa que la vida s'estableixi abans (88 %), i més baixa si l'endarrereix (67 %).
- **Les tres formes sota H0 no són tres proves de robustesa (AUD-48).** Amb la mateixa llavor, fan
  servir els mateixos nombres aleatoris transformats de manera monòtona. A més, sota H0 el log-rank només
  depèn de l'ordre dels temps. Per això les tres files només es diferencien pels empats de l'arrodoniment
  al cens. La robustesa que importa és la de les dues files H1 amb riscos no proporcionals.

## 9. Anàlisi

- **Script:** `fase2/estadistica.mjs` del commit del preregistre, amb les seves proves
  (`test/estadistica.mjs`):
  - referències externes: les dades de Gehan;
  - les xifres de l'entrada 6, refetes a partir dels registres;
  - casos límit del JSONL;
  - el validador.
- **Ordre:** `node fase2/estadistica.mjs --etapa 1|2 carpeta-A carpeta-B`, des d'una còpia neta del commit
  de l'etiqueta `preregistre-llei2` (AUD-50, AU2-29).
  - **El commit i el manifest** de referència són els de l'etiqueta, i el programa es nega a decidir si la
    còpia de treball no és en aquell commit o té canvis al codi o al manifest.
  - **`--commit` i `--manifest`** només existeixen en el mode `--prova`, per provar el programa amb altres
    dades. Aquest mode exigeix un hash complet de 40 caràcters, i la seva sortida diu "DECISIÓ DE PROVA
    (no confirmatòria)".
- **Validació (AU2-16, AUD-44; ampliada per AU2-23 a AU2-27).** Abans de calcular res, el programa
  comprova:
  - que hi hagi exactament les llavors del manifest per a l'etapa, sense repetides ni absents;
  - que cada fitxer tingui els paràmetres del protocol i del seu grup;
  - que tots siguin **del commit de l'etiqueta `preregistre-llei2`** (o del que es passi amb `--commit`),
    sense `+canvis`;
  - que hi hagi **tots** els censos, de la 250 fins al final, seguits i sense forats;
  - que la mostra de cada cens sigui la del protocol (2.048);
  - que els recomptes siguin enters, dins de la mostra i coherents entre ells: hereditaris = sols + només
    en context, i hereditaris ≤ es copien;
  - que hi hagi **totes** les mesures, cada 100 èpoques;
  - que les línies siguin només dels cinc tipus de `sim.mjs`, i en el seu ordre: les èpoques no baixen, i
    dins d'una mateixa època van el cens, l'establiment i la mesura (AU2-30);
  - que l'establiment, l'època final i el motiu del final siguin els que diuen el criteri i la regla
    d'aturada.

  Si hi ha qualsevol anomalia, no decideix. A més, escriu l'empremta SHA-256 dels fitxers i el commit, i
  les interaccions per època de cada condició (AU2-09).
- **Prova principal (una sola):** el log-rank bilateral sobre el temps fins a l'establiment, amb els
  límits de §8.
- **Exclusions:** cap. Si un experiment falla per un error tècnic, es torna a executar amb la mateixa
  llavor (el resultat és determinista) i es documenta. L'script assenyala els experiments que s'han
  tallat abans d'hora.
- **La sèrie exploratòria no s'hi ajunta.**

## 10. Què es comunicarà

- **Resultat positiu** (|Z| per sobre del límit de l'etapa): en aquest món, un corrent feble canvia el
  ritme d'establiment de la vida, en la direcció observada, amb la mida de l'efecte i el seu interval.
- **Resultat negatiu o no concloent:** aquesta sèrie no permet afirmar-ho. Es donaran igualment la mida
  de l'efecte observat i el seu interval.
- **En tots dos casos:**
  - la taula completa per llavor;
  - les corbes de Kaplan–Meier;
  - les sensibilitats;
  - els registres i els JSONL a git.

  No es parlarà de "l'espai sol" ni de l'aparició dels primers replicadors com a resultat confirmatori.

## 11. Cost i execució

**Procediment de llançament** (auditoria 4, §6):
1. *Merge* de la branca. Es crea l'etiqueta anotada `preregistre-llei2` sobre el commit del *merge* i es
   publica a GitHub.
2. Es desplega el commit de l'etiqueta a la VM i es crea un `git worktree` al PC. La primera línia de
   cada registre ha de dir `codi=<commit>`, sense `+canvis`.
3. S'executen les 100 llavors de l'etapa 1, a les carpetes de §3.
4. **No es miren resultats parcials.** Fins que no acabin els 100 experiments, no se'n fa cap resum ni
   gràfic, encara que els registres de text es puguin llegir.
5. Si un experiment falla per un error tècnic, es torna a executar amb la mateixa llavor i s'anota.
6. Amb els 100 acabats, des d'una còpia neta del commit de l'etiqueta, i sense `--commit` ni `--manifest`:
   `node fase2/estadistica.mjs --etapa 1 serie-llei2/A serie-llei2/B`. La sortida es desa a git.
7. Si cal l'etapa 2, s'executen les 60 llavors restants des del mateix commit i es fa `--etapa 2`.

- **Sense vida,** un experiment dura uns 70 minuts a la VM (amb 3 alhora).
- **Amb vida,** s'atura 1.000 èpoques després de l'establiment.
- **Etapa 1,** 100 experiments: unes 20–35 hores repartides entre la VM i el PC.
- **Etapa 2,** si cal, 60 experiments més: unes 12–20 hores.

## 12. Validesa i limitacions conegudes

- **Independència de les llavors (AU2-08).** Cada llavor dona un flux del generador v2, de període
  2^128 − 1, inicialitzat amb SplitMix32. Que no se solapin a la pràctica és una hipòtesi estàndard, no
  una propietat demostrada.
- **Sensibilitat del cens.** Un replicador que només té èxit en una part dels intents, com el que
  necessita parella, es detecta menys sovint, i això afavoreix els replicadors eficients
  (`docs/calibratge.md`, §4).
  - **Si fa diferència entre condicions, no està demostrat (AUD-45).** Podria passar si les dues
    condicions produeixen tipus diferents de replicadors, o si la barreja canvia la sensibilitat de la
    prova en context (AUD-33c).
  - **Es podrà examinar:** és una hipòtesi que les dades de `heritableSolo` i `heritableContext`
    permetran comprovar.
- **La taxa de mutació.** És la de l'article (0,024 %). L'implementació de referència fa servir 1/4.096
  (0,0244 %). L'intèrpret coincideix amb cubff en 200.000 cintes (`eines/cubff/README.md`).
- **Un sol substrat** (BFF de 64 bytes) i un sol tipus de món.
- **Els "replicadors esporàdics" de l'exploració (AUD-34)** eren copiadors no hereditaris.
  - **L'auditor 1 ho va confirmar** amb un cens de totes les cel·les i amb repeticions, en dos mons:
    abans de l'establiment no hi ha cap replicador hereditari; quan n'apareix un, la vida s'estableix (8
    de 8 repeticions).
  - **Aquest patró és dels replicadors que es copien sols.** El que necessita parella es comporta
    d'una altra manera.
  - **La mesura d'origen (§6.6 i §6.7) ho separa.**

## 13. Canvis respecte de la v0.1

| Canvi | Motiu |
|---|---|
| Criteri: replicadors hereditaris ≥ 1 % d'una mostra sense reemplaçament, en lloc de "una família ≥ 1 % del mapa" | AU2-01, AU2-02, AU2-03, AU2-06, AUD-32, AUD-33 |
| La pregunta parla d'establiment | AUD-34, AUD-35 |
| Aturada a *t* + 1.000, en lloc de 1.000 èpoques després de l'HOE | AUD-30, AU2-04 |
| Dues etapes, 50 → 80, en lloc de 50 fixes; potència del log-rank, no de Fisher | AUD-31, AU2-05 |
| Script d'anàlisi, JSONL i proves, abans de començar | AUD-32, AU2-06 |
| Sensibilitats i mesures d'origen preespecificades | AUD-32, AUD-34 |
| Diferència d'incidència, RMST i proporcionalitat de riscos | AU2-05, auditor 2 (§4 del seu informe) |
| Desplegament per commit i versions de l'entorn | AUD-22, AU2-07 |
| Matís sobre la independència de les llavors | AU2-08 |
| **v0.3:** herència buscada en tots els fills dins del pressupost d'intents | AU2-15 |
| **v0.3:** herència sola i en context per separat; sensibilitat 3 redefinida; regla d'interpretació | AUD-42, AU2-19 |
| **v0.3:** "censos seguits" vol dir a exactament 250 èpoques | AU2-17 |
| **v0.3:** manifest, validació i decisió mecànica al codi (`--etapa`) | AU2-16, AU2-18, AUD-44 |
| **v0.3:** simulació del procediment de dues etapes sencer | AU2-21 |
| **v0.3:** captures de *t*, *t* − 250 i *t* − 500; l'origen abans de la detecció | AU2-20, auditoria 3 §5 |
| **v0.3:** censura de les sensibilitats per l'aturada; sensibilitat diferencial com a hipòtesi; el constructe operatiu | AUD-43, AUD-45, AU2-22 |
| **v0.4:** l'etiqueta `preregistre-llei2` i la comprovació del commit a `--etapa` | AUD-46, AU2-23 |
| **v0.4:** censos i mesures complets, mostra de 2.048 i recomptes enters i coherents al validador; el motiu del final | AU2-24, AU2-25, AU2-27 |
| **v0.4:** `--etapa 2` comprova l'etapa 1; la decisió de l'etapa 1 es desa a git | AUD-47, AU2-26 |
| **v0.4:** les formes sota H0; les carpetes de la sèrie; la regla d'interpretació precisada; el procediment de llançament | AUD-48, AUD-49, AU2-28 |
| **v0.5:** la decisió confirmatòria només des de l'etiqueta, amb el seu manifest; `--commit` i `--manifest`, només en mode de prova i amb el hash complet | AUD-50, AU2-29 |
| **v0.5:** els tipus i l'ordre de les línies del JSONL | AU2-30 |

## 14. Preguntes respostes a l'auditoria 3

1. **L'aturada a *t* + 1.000:** no és informativa per a la mesura principal. Els dos auditors hi estan
   d'acord. Sí que ho és per a les sensibilitats (§5).
2. **Els límits:** es fixen ara amb 50/80. Els dos auditors ho accepten, amb la simulació del procediment
   sencer (§8).
3. **El llindar i la bateria:** l'1 % és adequat. La bateria hi afegeix el món de lectors com a
   limitació coneguda (§4).
4. **Les altres amenaces:** les de §4, §7 i §12, ja incorporades.

**Per a la revisió de les correccions:** comproveu que la v0.3 resol el que vau demanar.
