# La fragilitat del món (AUD-107): el pla de l'exploració

**Escrit el 25-10-2026, abans de calcular cap de les propietats d'aquest pla.** És una exploració: no en sortirà cap
afirmació, només la decisió de si val la pena una confirmació amb mons nous.

## D'on surt

A l'auditoria 14, l'auditor 1 va trobar, mirant les dades després de la decisió de B2 (AUD-107), una relació entre dues
coses:
- **La història original de la llei 2:** en 7 dels 58 mons del banc, la vida es va perdre (menys de l'1 % d'hereditaris
  a *t* + 1.000). Tots 7 són mons amb corrent (B).
- **Les branques noves de B2** (exploració i confirmació): la vida es torna a perdre (regla R2) en 6 d'aquests 7 mons,
  i en 2 dels altres 26 mons B (Fisher, *p* = 1,7·10⁻⁴, mirat després).

Si la persistència queda en bona part fixada per l'estat del món quan s'estableix la vida, hi hauria d'haver alguna
cosa, a la captura de *t*, que distingeixi aquests mons. El responsable va decidir el 25-10-2026 explorar-ho al costat
de la línia de la maduració (`docs/disseny.md`).

## Les dades

- **Els mons:** els 33 mons B del banc que tenen la història original fins a *t* + 1.000 (en queda fora el B2062).
  - **Els fràgils:** els 7 de la definició de l'auditor 1, B2002, B2011, B2021, B2038, B2042, B2043 i B2071.
  - **Els altres:** 26.
  - **Com a referència, no a la comparació:** els 23 mons A amb història fins a *t* + 1.000, cap de fràgil.
- **Les captures:** les de l'època *t* de l'establiment, i les de *t* − 250 i *t* − 500, de
  `fase2/resultats/serie-llei2/*/captures/` (SHA-256 a `docs/captures.sha256` i a `fase2/resultats/b2/repartiment.json`).
- **Els censos:** els dels registres originals de la llei 2.
- **No se simula res.**

## Les propietats, totes a l'època *t* llevat que es digui

Es calculen totes, i es donen totes. No se'n tria cap després de veure-les.

1. **La vida a *t*:** la proporció d'hereditaris al cens de *t* (registre original).
2. **El creixement d'abans:** la proporció d'hereditaris a *t* − 500, *t* − 250 i *t*, i el quocient entre *t* i *t* − 250.
3. **L'edat:** l'època *t* de l'establiment.
4. **Les famílies:** el nombre de famílies i la part del mapa de la dominant (`node fase2/analitza.mjs`, amb la mostra
   per defecte de 4.000 cel·les i el generador fix de l'eina).
5. **El mecanisme:** el nucli de la família dominant, classificat en tres grups:
   - el palíndrom de la coma (`,` `<` `}`);
   - el palíndrom del punt (`.` `{` `>`);
   - qualsevol altre, que es diu tal com surt.
6. **Els replicadors:** la proporció que es replica sola i la que es replica en context, i la proporció d'hereditaris
   de la prova de l'eina.
7. **La química del món:** la proporció de bytes zero i l'entropia de Shannon dels bytes.
   - **Per què els zeros:** l'enverinament per zeros va extingir un replicador a la fase 1 (entrada 2).

## Com es compara

- **Per a cada propietat numèrica:** la mediana i el rang dels 7 fràgils i dels 26 altres, i la prova exacta de
  Mann–Whitney, bilateral, només com a descriptiu.
- **Per al mecanisme:** la taula de 7 i 26 per grup.
- **Amb 7 casos i 9 propietats**, una *p* petita pot sortir per atzar. Si se'n vol fer res, és una pista per a una
  confirmació, no un resultat.
- **Es diu també,** per a cada món fràgil, si alguna branca nova hi va perdre la vida (6 de 7).

## Què se'n farà

- **Si alguna propietat separa clarament els fràgils** (per exemple, sense encavalcament entre els dos grups): es
  proposarà als auditors una confirmació preregistrada amb mons nous, que prediu des de la captura de *t* quins
  perdran la vida. Abans, se'n calcularia el cost, perquè cal fer córrer mons fins a l'establiment.
- **Si no en separa cap:** l'AUD-107 queda com a descriptiu, al quadern.
- **En tots dos casos,** el resultat va al quadern, amb aquest pla.
