# Protocol estadístic · sèrie confirmatòria de la llei 2

**Estat: esborrany v0.2 (16-10-2026), per revisar a l'auditoria 3 pels dos auditors.** No s'ha llançat
cap experiment d'aquesta sèrie. Quan el protocol estigui aprovat, el commit que el fixi farà de
preregistre: qualsevol canvi posterior s'haurà de justificar aquí mateix, amb data i motiu, abans de
mirar els resultats. Els canvis respecte de la v0.1 són a §13.

Respon a AUD-06 (auditoria 1), AUD-30 a AUD-34 (auditoria 2) i AU2-01 a AU2-09 (auditoria externa 2). La
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
| Codi | El commit del preregistre, sense `+canvis` als registres. A la VM s'executa des de la carpeta d'aquell commit (`bash desplega-vm.sh`, `~/claude-origins-<commit>`), i al PC, des d'un `git worktree` del mateix commit |
| Entorn | Node 20.19.2 (VM, zlib 1.3.1) o Node 16.15.1 (PC, zlib 1.2.11). Donen resultats idèntics: `npm test` hi passa sencer, amb les mateixes empremtes i el mateix cens. La versió consta a cada registre |
| Ordre | `node sim.mjs --world 512x256 --seed S --mixing M --epochs 16000 --every 100 --census 250 --census-version v3 --stop-after-event 1000 --rng v2 --json S.jsonl --save captures --save-what event` |
| Dades | Un registre de text i un JSONL per experiment. El JSONL té una línia per cens i per mesura, amb tots els valors sense arrodonir, el commit i les versions. Amb `--save-what event`: només la captura del moment de l'establiment (8 MB), que farà de banc de mons amb vida (AUD-41) |

## 4. Mesura principal: el moment de l'establiment

**Cens** (`fase2/census.js`, versió 3), cada 250 èpoques:
- es posen a prova **2.048 cel·les diferents** triades a l'atzar, amb un generador propi del cens (llavor
  20261016);
- es compta quantes són **replicadors hereditaris** (`fase2/replication.js`): el programa deixa al company
  16 bytes seguits de si mateix, amb almenys 6 valors diferents, i la còpia també es copia;
- la prova es fa sola (primer, amb un company de soroll) i en context (segon, amb un veí del món).

**Hi ha establiment a l'època *t*** si, en dos censos seguits, almenys l'1 % de la mostra són
replicadors hereditaris (≥ 21 de 2.048). *t* és l'època del primer dels dos. És la funció
`establishment()` de `census.js`, la mateixa que fan servir `sim.mjs` i l'anàlisi.

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

L'auditor 2 proposava executar-los tots fins a la 16.000. Aquí es proposa aquesta regla pel cost: quan hi
ha vida, cada execució passa d'unes 70 operacions a centenars o milers. Si l'auditoria 3 hi veu una
objecció, s'executaran tots fins a la 16.000.

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

## 7. Anàlisis de sensibilitat (preespecificades, descriptives)

Totes surten dels mateixos JSONL. No canvien la conclusió principal:

1. Sense herència: la primera generació (es copien) ≥ 1 %.
2. Llindar del 5 %.
3. Només la prova sola, per la sensibilitat espacial de la prova en context (AUD-33).
4. El criteri de la v0.1, amb la unió de les famílies: el territori ≥ 1 % del mapa.
5. L'HOE > 1, com a l'exploració.
6. La proporcionalitat de riscos, de manera descriptiva (log(−log *S*)).

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

- **Si a l'etapa 1 es rebutja H0,** la sèrie s'acaba.
- **Si no,** s'executen les llavors de l'etapa 2 i el log-rank es fa amb les 80 + 80.
- **La decisió és mecànica.** No hi ha cap altra anàlisi intermèdia.
- **Escenaris:** l'auditor 1 n'estima un 79 % de potència per a un 20 % contra un 40 %, amb ~137
  experiments esperats.

## 9. Anàlisi

- **Script:** `fase2/estadistica.mjs` del commit del preregistre, amb les seves proves
  (`test/estadistica.mjs`):
  - referències externes: les dades de Gehan;
  - les xifres de l'entrada 6, refetes a partir dels registres;
  - casos límit del JSONL.
- **Ordre:** `node fase2/estadistica.mjs carpeta-A carpeta-B`.
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

- **Sense vida,** un experiment dura uns 70 minuts a la VM (amb 3 alhora).
- **Amb vida,** s'atura 1.000 èpoques després de l'establiment.
- **Etapa 1,** 100 experiments: unes 20–35 hores repartides entre la VM i el PC.
- **Etapa 2,** si cal, 60 experiments més: unes 12–20 hores.

## 12. Validesa i limitacions conegudes

- **Independència de les llavors (AU2-08).** Cada llavor dona un flux del generador v2, de període
  2^128 − 1, inicialitzat amb SplitMix32. Que no se solapin a la pràctica és una hipòtesi estàndard, no
  una propietat demostrada.
- **Sensibilitat del cens.** Un replicador que només té èxit en una part dels intents, com el que
  necessita parella, es detecta menys sovint. L'efecte és el mateix a les dues condicions, però
  afavoreix els replicadors eficients (`docs/calibratge.md`, §4).
- **La taxa de mutació.** És la de l'article (0,024 %). L'implementació de referència fa servir 1/4.096
  (0,0244 %). L'intèrpret coincideix amb cubff en 200.000 cintes (`eines/cubff/README.md`).
- **Un sol substrat** (BFF de 64 bytes) i un sol tipus de món.
- **Els "replicadors esporàdics" de l'exploració (AUD-34)** que s'han comprovat amb el cens v3 eren
  copiadors no hereditaris. La mesura d'origen (§6.6) ho separa.

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

## 14. Preguntes per a l'auditoria 3

1. La regla d'aturada de §5: és correcte que no és informativa? (AU2-04)
2. Els límits de les dues etapes es fixen ara, amb la fracció de llavors (50/80). És acceptable amb un
   log-rank, on la informació depèn del nombre d'esdeveniments, o caldria recalcular-los amb els
   esdeveniments observats? (AUD-31)
3. El llindar d'establiment (1 % de 2.048, dos censos seguits) i la prova de segona generació: la
   bateria de calibratge us sembla suficient?
4. Hi veieu cap altra amenaça a la validesa?
