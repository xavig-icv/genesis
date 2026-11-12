# Qui escriu els bytes que s'acumulen a la sopa abans de la vida (exploratori)

**Què és:** el primer pas de la confluència de la taula de tres (`docs/disseny.md`, 11-11-2026): el que es pot fer amb les captures,
sense simular cap món. Pel carril d'explorar.
- **Aquesta nota, abans de calcular res.** Es fa córrer quan acabi el càlcul de B1 v0.7 (la decisió diu «després del càlcul de B1»).
- **Cap simulació, cap llavor de cap pla, cap dada de B1 v0.7.**
- **Tot el que en surti és exploratori.** La llista de tot el que es provi, també del que no surti, anirà a sota.

## 1. Les preguntes

Al pas 1, la sopa sense vida acumula instruccions, sobretot `<`, i les amuntega en pocs programes; i la sopa vella té menys programes que
es copien que una de nova. Els auditors ho expliquen de maneres diferents: el primer byte d'un programa (l'auditor 1), una estructura local
que encara no té causa (l'auditor 2). No se sap quines operacions ho fan.

1. **Qui escriu els `<` nous:** una còpia d'un `<` que ja hi era (`.` o `,`), o una suma o una resta d'un valor veí (el 59 o el 61, amb
   `+` o `-`)? I quina part surt dels programes que comencen amb `<`?
2. **Qui amuntega les instruccions:** una ronda d'interaccions fa créixer la dispersió de les instruccions entre programes? Amb còpies de
   trossos sencers, o amb escriptures soltes?
3. **Per què la sopa vella té menys copiadors:** en una sola interacció, quantes vegades un programa deixa al company 16 bytes seguits seus
   (una còpia com la que busca la prova de replicació), a la sopa vella, a la mateixa barrejada i a una de nova?

## 2. Les dades (totes existeixen; cap simulació)

| Sopes | Quines | Quantes |
|---|---|---|
| Envellides | Les 150 de la cohort de la sèrie de la maduració, a l'època 8.000 | 150 |
| Les mateixes, barrejades | `shuffle-all.bin` de cada món (els mateixos bytes, en un altre ordre) | 150 |
| Noves | `reinit.bin` de cada món (bytes a l'atzar, com una sopa de l'època 0) | 150 |
| Al llarg del temps | El món 1034, quiet i sense vida, cada 500 èpoques fins a la 16.000 | 33 |

Les captures, amb la SHA-256 del manifest de la sèrie i de `docs/captures.sha256`.

## 3. Com

- **Un intèrpret instrumentat** (`traca.mjs`): una còpia de `evaluate` de `fase1/bff.js` que, a cada escriptura (`.`, `,`, `+`, `-`), en
  diu la instrucció, la posició, el byte d'abans i el de després, i per a les còpies, d'on surt. El simulador no es toca.
- **Abans de fer-lo servir, una prova:** amb 10⁵ cintes a l'atzar, amb més o menys instruccions, i amb 10⁵ parelles reals de captures, la
  cinta final i el nombre d'operacions han de ser idèntics als de `fase1/bff.js`. Si no, no es fa servir.
- **Les parelles:** a cada sopa, 10⁵ parelles de veïns de debò (una cel·la a l'atzar i un veí a l'atzar dins del radi 2, com el món), que
  s'executen una vegada. Les llavors, a partir de 940.000 (cap no és de cap pla).
- **El pressupost:** uns minuts de màquina; molt per sota dels dos dies.

## 4. Les mesures

1. **Per a cada byte d'instrucció,** les escriptures que en fan un (i les que en desfan), per tipus: còpia des de la mateixa meitat, còpia
   des de l'altra, `+` o `-`. I, per als `<`, quina part surt de parelles on el primer programa comença amb `<`, i quina amb el motiu `<,`.
2. **La disposició:** el canvi de la variància del nombre d'instruccions per programa després d'una ronda; quina part de les escriptures
   són dins de tirades de vuit còpies seguides o més (còpies de trossos).
3. **Les còpies de 16 bytes:** la part de les interaccions en què el company acaba amb 16 bytes seguits del primer programa, amb sis
   valors diferents com a mínim (la finestra de la prova de replicació).

## 5. Què em faria canviar d'opinió, escrit abans de calcular

| | Si | Llavors |
|---|---|---|
| 1 | Menys de la meitat dels `<` nous surten de còpies | L'acumulació és sobretot aritmètica, no còpia: cau «la sopa copia les instruccions» per al `<` |
| 2 | Menys d'un 20 % dels `<` nous surten de parelles on el primer programa comença amb `<` | Cau el mecanisme del primer byte |
| 3 | Una ronda no fa créixer la dispersió de les instruccions ni a la sopa vella ni a la nova | L'amuntegament no ve de les escriptures d'una interacció |
| 4 | La sopa vella i la mateixa barrejada fan les mateixes còpies de 16 bytes | La disposició no explica que la sopa vella tingui menys copiadors |

## 6. Què no es fa

- **Cap simulació,** cap llavor de cap pla, i cap resultat de B1 v0.7 (encara no n'hi ha).
- **Cap prova confirmatòria.** Els recomptes són descriptius. Les sopes de la sèrie ja no serveixen per confirmar res (la taula de tres).

## 7. El que surt (12-11-2026, exploratori)

**El càlcul:** `node escriptures.mjs` amb les captures de la sèrie i les del món 1034, des de `9664d07`, a prioritat baixa, de les 16.49 a
les 21.28 del 12-11-2026, amb el codi 0: 483 sopes, 10⁵ parelles cadascuna. **El pressupost de la nota («uns minuts») era equivocat:**
va trigar 4 h 38 min, encara molt per sota dels dos dies. La sortida, tal com surt, és a `escriptures-sortida.txt` i `escriptures.jsonl`
(`acbc25f`), a git abans de mirar-la.

**Els quatre criteris (§5): cap no cau.**

| | El criteri | El que surt | Què vol dir |
|---|---|---|---|
| 1 | Els `<` nous, per còpia | 85,4 % a la sopa envellida (cau per sota del 50 %) | El `<` s'acumula sobretot copiant-lo. A la sopa nova, en canvi, el fan sobretot `+` i `-` (67,5 %) |
| 2 | Els `<` nous, en parelles que comencen amb `<` | 54,8 % a l'envellida (cau per sota del 20 %) | Vegeu la línia de base, a sota: unes 7 vegades el que en sortiria sense enriquiment |
| 3 | La dispersió de les instruccions, en una ronda | Creix a totes dues: l'envellida, de 8,449 a 8,452; la nova, d'1,000 a 1,062 | L'amuntegament pot venir de les escriptures d'una interacció. Amb la sopa barrejada, d'1,000 a 1,413 en una sola ronda |
| 4 | Les còpies de 16 bytes, l'envellida contra la seva barrejada | Menys a l'envellida a tots 150 mons (0,016 % contra 0,171 % de les parelles) | La disposició sí que explica que la sopa vella tingui menys copiadors: els mateixos bytes, barrejats, en fan deu vegades més |

**La línia de base del criteri 2** (`linia-base.mjs` i `linia-base-sortida.txt`, **afegida després de mirar la sortida**, per poder-lo
interpretar). El primer programa d'una parella és una cel·la a l'atzar: sense cap enriquiment, la part dels `<` nous que surten de parelles
que comencen amb `<` seria la dels programes que comencen amb `<`.

| La sopa | Programes que comencen amb `<` | Bytes que són `<` | `<` nous en parelles que comencen amb `<` | L'enriquiment |
|---|---|---|---|---|
| Envellida | 7,46 % | 4,03 % | 54,8 % | unes 7 vegades |
| Barrejada | 4,03 % | 4,03 % | 23,0 % | unes 6 vegades |
| Nova | 0,39 % | 0,39 % | 11,3 % | unes 29 vegades, però amb pocs `<` nous i fets sobretot amb `+` i `-` |

**Què més s'hi veu,** descriptivament:
- **La sopa envellida és a prop de l'equilibri:** en fa i en desfà gairebé els mateixos (82,1 i 80,2 `<` per 1.000 parelles). La barrejada,
  en una ronda, en perd (268,5 fets i 292,9 desfets): la disposició de la sopa envellida conserva els `<`.
- **La barrejada copia molt més:** 19.041 còpies per 1.000 parelles, contra 6.035 a l'envellida i 4.207 a la nova.
- **El món 1034 al llarg del temps:** els `<` nous per còpia passen del 62 % (l'època 100) a un 85–90 %, i els de parelles que comencen
  amb `<`, del 26 % a un 50–60 %. La dispersió puja de 2,7 a uns 10 cap a les èpoques 2.500–3.500, i després baixa fins a 7,6 a la 16.000.
  Les còpies de 16 bytes salten a l'època 5.500 (0,313 %, deu vegades el normal): és el brot de l'escaneig del pas 1 (76 cel·les a la 5.400).

**Els límits:** cada parella s'executa una vegada, sense dinàmica; els percentatges són de tota la cohort; i la línia de base és posterior.
És exploratori: una descripció, no una prova.
