# Els trossos informatius del registre de famílies · els resultats de la sensibilitat

**Escrit el 03-11-2026, després de calcular,** amb el pla de `pla.md`. És exploratori. El càlcul és del commit `df3676d` de la
branca `nuclis-monotons`, sense canvis per desar, amb Node 16.15.1. Cada JSON porta el commit i la SHA-256 del registre. Va de
l'1.43 h a les 2.11 h: quatre processos alhora, a prioritat baixa.

| Fitxers | Què |
|---|---|
| `clau.json`, `clau.csv` | Les 183 captures de `docs/captures.sha256`, cadascuna amb un registre nou |
| `1006.*`, `2041.*`, `1034.*` | La història dels tres mons del lloc (120, 135 i 160 fotogrames), amb un sol registre per a cada valor |

Amb els tres valors, la fracció de replicadors de la mostra és la mateixa a totes les entrades: l'eina ho comprova, i s'hauria
aturat.

## En poques paraules

- **Al 1006, la família falsa no desapareix amb 3.**
  - **A les èpoques 2.700 i 2.750,** la família 2 hi continua: és la mateixa, amb un Jaccard de 0,67 i 0,70, i amb el nucli
    `,<[[[[`. Té 3 instruccions diferents, però encara quatre `[` seguits.
  - **El seu territori:** el 10,8 % i el 12,4 % del món, en lloc del 15,7 % i el 17,1 %.
  - **Als fotogrames del costat** (2.650 i 2.800), només la família 1 pinta cel·les amb una tirada: 5.113 i 9.558, amb tots tres
    valors.
- **La família 1 hi queda igual** (Jaccard 1).
- **Fins a l'època 2.450, el criteri corregeix la família 1.** En els seus primers fotogrames, el nucli era una tirada de `[`, i en
  pintava massa. A la 2.300, per exemple, passa del 6,4 % a l'1,6 %.
- **A tota la resta, amb 3, gairebé res:**
  - **les 183 captures clau:** cap no canvia més de l'1 % (el màxim, −0,33 %);
  - **el 2041:** una sola època (−1,3 %);
  - **el 1034:** cap família amb cap valor, perquè no hi neix la vida.
- **El pla deia** que el lloc faria servir el criteri si la família falsa desapareixia i la resta canviava poc. La primera condició
  no es compleix. Per això, el lloc no el fa servir: va a la revisió, amb els resultats i dues propostes (al final).

## 1. El 1006, de l'època 2.650 a la 2.850

| Època | Cel·les amb una tirada | Pintades (1 / 2 / 3) | La família 2 (1 → 3) | Jaccard de la família 2 |
|---|---|---|---|---|
| 2.650 | 28.847 | 5.113 / 5.113 / 5.113 | — | — |
| 2.700 | 30.720 | 24.764 / 22.214 / 18.307 | `[[[[[[` 15,7 % → `,<[[[[` 10,8 % | 0,67 |
| 2.750 | 33.436 | 27.611 / 24.974 / 21.186 | `[[[[[[` 17,1 % → `,<[[[[` 12,4 % | 0,70 |
| 2.800 | 35.764 | 9.558 / 9.558 / 9.558 | — | — |
| 2.850 | 38.084 | 10.892 / 10.892 / 10.892 | — | — |

A les cinc èpoques, la família 1 té el mateix territori amb els tres valors (del 5,0 % a l'11,1 %).

## 2. El territori, comparat amb l'1

| Conjunt | Valor | Entrades | Canvien més de l'1 % | El canvi mitjà | El més gran | Famílies (entrades) |
|---|---|---|---|---|---|---|
| Les captures clau | 2 | 183 | 0 | 0,00 % | −0,01 % | 94 → 94 |
| | 3 | 183 | 0 | 0,00 % | −0,33 % | 94 → 93 |
| El 1006 | 2 | 120 | 4 | 0,15 % | −5,91 % (2.450) | 110 → 110 |
| | 3 | 120 | 12 | 0,36 % | −5,91 % (2.450) | 110 → 112 |
| El 2041 | 2 | 135 | 0 | 0,00 % | 0,00 % | 23 → 23 |
| | 3 | 135 | 1 | 0,01 % | −1,30 % (11.250) | 23 → 23 |
| El 1034 | 2 i 3 | 160 | 0 | 0,00 % | 0,00 % | 0 → 0 |

**Les dotze èpoques del 1006 que canvien més de l'1 % amb 3:**
- **De la 2.250 a la 2.450:** els primers fotogrames de la família 1. El seu nucli era `,<[[[[`, `[[[[[[`, `<[[[[[` o `[[[<,}`, i
  el territori es redueix:
  - a la 2.300, del 6,4 % a l'1,6 % (Jaccard 0,24);
  - a la 2.350, del 8,1 % al 4,3 %;
  - a la 2.450, de l'11,9 % al 6,0 %.
- **La 2.700 i la 2.750:** la família 2, a la taula de dalt.
- **De la 4.550 a la 5.450:** la tercera família, petita (del 0,3 % al 3,6 %), de nucli `[<[[[[` o `,,,,[,`. Amb 3 és una altra,
  aparellada amb un Jaccard de 0,02 a 0,29. La família 1, que ja cobreix del 56 % al 82 % del món, no canvia.

**Fora del 1006:**
- **El 2041, a l'època 11.250:** la família passa del 22,9 % al 21,7 % del món.
- **Les captures clau:** una sola família desapareix, i és minúscula: el 0,01 % del món (llavor 2062, època 15.250).

## 3. Els nuclis de l'1 amb menys de 3 instruccions diferents

| Conjunt | Entrades família-captura | Amb menys de 3 | Quins |
|---|---|---|---|
| El 1006 | 110 | 16 | `,,,,[,` 5, `[[[[[[` 3, `[<[[[[` 3, `,[,,,[` 2, i tres més |
| Les captures clau | 94 | 1 | `,[[[[[` |
| El 2041 | 23 | 0 | — |
| El 1034 | 0 | — | — |

Amb 3, cap no en queda, per construcció.

## Què en traiem

1. **El criteri és segur:**
   - fora del 1006, gairebé no canvia res;
   - no toca la mostra ni els replicadors;
   - el cens i les sèries no el fan servir.
2. **Al 1006 ajuda, però no n'hi ha prou.** Treu els nuclis monòtons i corregeix el territori dels primers fotogrames de la família
   1. Però la família 2 hi continua amb un nucli que és sobretot una tirada (`,<[[[[`). Una tirada de quatre instruccions iguals
   en un tros de sis encara pot ser part del codi d'una família de debò.
3. **Per a la revisió, dues propostes.** No les hem calculades: caldria un pla nou abans de fer-ho.
   - **La de l'auditor 2: una tirada màxima dins de cada tros** (per exemple, com a molt 3 instruccions iguals seguides). Treuria
     `,<[[[[`.
   - **L'alternativa de l'auditor 1: l'especificitat.** Per al nucli, els trossos freqüents als membres i rars a la resta de la
     mostra, com un tf-idf. És més difícil d'explicar, però és la que mira directament si un tros distingeix la família.
4. **Mentrestant, el lloc no el fa servir.** L'avís de la família 2 al panell dels visors (AUD-162) es queda.

**El que no hem mirat:** les famílies de debò amb un nucli monòton que l'auditor 1 va trobar a la prova dels zeros. No en tenim
les captures, com diu el pla.
