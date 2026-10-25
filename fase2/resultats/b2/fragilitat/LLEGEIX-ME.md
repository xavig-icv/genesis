# La fragilitat del món (AUD-107): el resultat de l'exploració

**Què és:** una exploració, amb el pla escrit i desat abans de calcular res (`PLA.md`, commit `46e8db6`). No en surt
cap afirmació confirmada.
- **El codi:** `eines/fragilitat.mjs`, al commit `bcfcc00`.
- **L'ordre:** `node eines/fragilitat.mjs --json fase2/resultats/b2/fragilitat/propietats.jsonl > fase2/resultats/b2/fragilitat/sortida.txt`.
  Triga uns 5 minuts.
- **La reproducció:** els dos fitxers de sortida es van tornar a generar amb el codi desat, i són idèntics.
- **No se simula res:** només es llegeixen els registres de la llei 2 i de B2, i les captures de l'establiment.

## El que surt

**Els mons:** 33 mons B amb la història original fins a *t* + 1.000, dels quals 7 són fràgils: B2002, B2011, B2021,
B2038, B2042, B2043 i B2071. Dels 23 mons A, cap no ho és.

| Propietat (a *t*, si no es diu) | Fràgils (7): mediana [mín–màx] | Altres B (26) | A (23), mediana | *p* (Mann–Whitney exacta, bilateral) |
|---|---|---|---|---|
| **Bytes zero** | **17,6 % [8,2–26,5]** | **0,4 % [0,0–14,8]** | 0,5 % | **1,4·10⁻⁵** |
| Entropia de Shannon (bits) | 6,04 [5,73–6,33] | 7,41 [5,03–7,89] | 7,79 | 0,027 |
| Part del mapa de la família dominant | 0,30 [0,11–0,63] | 0,12 [0,01–0,93] | 0,04 | 0,026 |
| Es replica sola | 0,17 [0,05–0,35] | 0,08 [0,02–0,88] | 0,02 | 0,11 |
| Hereditaris a *t* (cens) | 0,11 [0,02–0,26] | 0,06 [0,01–0,86] | 0,02 | 0,45 |
| Hereditaris a la prova de l'eina | 0,11 [0,02–0,26] | 0,06 [0,01–0,88] | 0,02 | 0,39 |
| Hereditaris a *t* − 250 | 0,000 [0,000–0,007] | 0,000 [0,000–0,006] | 0,001 | 0,88 |
| Hereditaris a *t* − 500 | 0,000 (6 mons) | 0,000 (25) | 0,000 | 0,60 |
| Quocient *t* / *t* − 250 | 10,6 (3 mons) | 47,5 (13) | 8,4 | 0,30 |
| Edat *t* | 6.750 [500–11.000] | 7.000 [250–14.750] | 9.500 | 0,42 |
| Nombre de famílies | 1 [1–2] | 1 [1–3] | 1 | 0,58 |
| Es replica en context | 0,000 [0,000–0,001] | 0,001 [0,000–0,005] | 0,000 | 0,30 |

**El mecanisme de la família dominant:** els 7 fràgils són del palíndrom de la coma, i dels altres 26 mons B, ho són 17.
Els altres 9 són del palíndrom del punt.

El detall de cada món és a `propietats.jsonl`, i la sortida, a `sortida.txt`.

## Què en llegim, amb prudència

- **La pista: els bytes zero.** Quan la vida s'estableix, els mons fràgils tenen una proporció de bytes zero molt més alta:
  - una mediana del 17,6 %, contra el 0,4 %;
  - *p* = 1,4·10⁻⁵. Amb les 13 comparacions, i la correcció de Bonferroni, encara seria d'1,8·10⁻⁴;
  - **dins dels mons del palíndrom de la coma,** *p* = 1,7·10⁻⁴, de manera que no és només el mecanisme.
- **El pla deia "9 propietats".** En realitat són 12 mesures numèriques i el mecanisme, perquè algunes propietats en
  tenen més d'una.
- **Els zeros estaven al pla, amb el seu perquè:** l'enverinament per zeros, que va extingir un replicador a la fase 1
  (entrada 2). El palíndrom de la coma deixa zeros al company quan s'hi copia (entrada 2), i l'article de 2024 en descriu el fenomen.
- **El palíndrom del punt** no en deixa: als seus 9 mons B, com a molt el 0,9 % de zeros, i cap no és fràgil.
- **L'entropia** més baixa no és una altra pista: més zeros vol dir menys entropia.
- **Hi ha encavalcament.** Quatre mons B no fràgils tenen més zeros que el fràgil que en té menys (el B2043, amb el
  8,2 %): el B2058 (14,8 %), el B2078 (14,5 %), el B2044 (10,9 %) i el B2001 (9,5 %).
  - Amb un llindar del 8 %, triat **després** de veure les dades, hi ha 7 fràgils d'11 per sobre i 0 de 22 per sota.
  - Les pèrdues a les branques noves de B2 hi van igual: 7 d'11 per sobre i 1 de 22 per sota. Una de les de per sobre
    és del B2078, que no és fràgil.
- **Que els zeros causin la pèrdua no es pot dir.** Podrien ser només la marca de les còpies trencades, que podrien fer
  mal per si soles.

## Corregit a l'auditoria 15 (25-10-2026)

- **Els zeros no hi eren abans de la vida** (AUD-109).
  - **Què faltava:** el pla preveia llegir les captures de *t* − 250 i *t* − 500, i l'eina no en va calcular els zeros. Ho
    va fer l'auditor 1 (`../auditories/claude-origins/auditor1/audit15/annexos/zeros-abans-de-t.mjs`), i ho hem comprovat.
  - **Les dades:** a *t* − 500 i *t* − 250, tots els mons B tenen un 0,4–0,6 % de zeros (fràgils, 0,5 %; altres, 0,5 %;
    *p* = 0,83 i 0,72). A *t*, els fràgils en tenen del 8 al 26 %.
  - **Què vol dir:** apareixen en les 250 èpoques en què el replicador s'escampa, i van amb la part del mapa de la
    família dominant (Spearman 0,54), no amb la proporció d'hereditaris (0,04).
  - **El que ja no es pot dir:** la frase d'abans, que els zeros podien ser un senyal "de quant ha treballat el palíndrom
    de la coma abans de l'establiment", no és certa. Abans no n'hi havia cap rastre.
  - **La hipòtesi que en surt** és un autoenverinament: en uns mons, el replicador s'escampa deixant moltes còpies
    trencades plenes de zeros, i aquestes deixalles aturen les còpies següents.
- **"Moltes més cel·les"** era "una proporció de bytes zero molt més alta": es mesura per bytes.
- **Continuar és una decisió posterior al pla** (AUD-114).
  - **Què deia el pla:** es proposaria una confirmació si alguna propietat separava clarament els fràgils, "per exemple,
    sense encavalcament". Els zeros s'encavalquen.
  - **Per què continuem igualment:** la diferència és molt gran (*p* = 1,4·10⁻⁵), hi ha un mecanisme conegut
    (l'enverinament per zeros de l'entrada 2), i una intervenció des de la mateixa captura és barata i causal.

## Què proposem

La relació és prou forta per mirar de confirmar-la. Hi ha dues maneres, que valoraran els auditors i decidirà el
responsable:
1. **Una intervenció des de la mateixa captura** (causal, i el disseny de les alíquotes de la maduració):
   - **La idea:** en els mons amb molts zeros, una branca amb els zeros canviats per bytes a l'atzar, i una de control
     amb el mateix nombre de bytes no zero canviats a l'atzar, amb el mateix atzar de continuació. *(Corregit a
     l'auditoria 15: ara els zeros passen a bytes de dades, i el control és un placebo aparellat cel·la per cel·la;
     `docs/pilot-maduracio.md`, §4.)*
   - **La predicció:** si els zeros enverinen, la vida es perd menys a la primera.
   - **El cost:** fa servir captures que ja tenim, i l'eina per transformar captures és la mateixa que necessita la
     maduració.
2. **Una predicció amb mons nous, preregistrada:** des de la captura de *t*, predir quins mons perdran la vida. Demana
   fer córrer mons B fins a l'establiment, i és cara.
