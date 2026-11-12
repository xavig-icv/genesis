# La matriu de novetat de la línia de la maduració

**Esborrany del 12-11-2026**, posat al dia el mateix dia amb les fonts obertes que va proposar el responsable. És la quarta decisió de l'11-11-2026 (`docs/disseny.md`; AU2-146): abans de dissenyar cap confirmació,
comparar cada afirmació que la línia podria fer amb el que ja s'ha publicat, dient com s'ha llegit cada font i quan. **No és una revisió
sistemàtica.** L'article de 2017 és de pagament, i el responsable no l'ha pogut llegir; en el seu lloc, les fonts obertes de la taula
de sota, i la versió del congrés de 2016, que és oberta.

## Les fonts

| Font | Sistema | Com l'hem llegida |
|---|---|---|
| Agüera y Arcas i altres (2024) | BFF: la sopa barrejada i el món 2D | Sencera, el 19-10-2026; una lectura dirigida dels dos auditors, l'11-11-2026 |
| Knierim i altres (2026) | BFF | Sencera, el 19-10-2026; la §3 i la figura 2, tornades a mirar l'11-11-2026 |
| Greenbaum i Pargellis (2017) | Amoeba | **Només el resum** (els dos auditors, l'11-11-2026). És de pagament: el responsable no l'ha pogut llegir |
| Greenbaum i Pargellis (2016), la versió del congrés ALIFE 2016 (pàgines 60–67) | Amoeba | El resum (la fitxa de Mount Sinai, el 12-11-2026). El PDF és obert a MIT Press, però darrere d'una verificació anti-robots: pendent que el baixi el responsable |
| Agüera y Arcas (2025), *What Is Intelligence?*, capítol 1 | BFF | Llegit en línia el 12-11-2026 (whatisintelligence.antikythera.org): les seccions sobre BFF |
| Pargellis (1996, 2001) | Amoeba | Parcial |
| Jha i altres (2026) | BFF i Z80, amb un cost energètic | Sencera, el 19-10-2026 |
| Cicala i altres (2026) | Z80, programes de 32 bytes | Sencera, el 19-10-2026 |
| Mathis i altres (2024) | AlChemy (càlcul λ) | El resum |

## Les afirmacions possibles, font per font

**Com es llegeix:** «hi és», ja publicat; «en part», hi ha una cosa semblant, però no la mateixa; «no hi surt», no és en el que hem llegit;
«no ho sabem», no n'hem llegit prou.

| | L'afirmació | 2024 | Knierim (2026) | Greenbaum i Pargellis (2017) | Jha (2026) | Estat a Genesis |
|---|---|---|---|---|---|---|
| A1 | La sopa sense vida de BFF deriva per un camí comú cap a una composició rica en instruccions (el `<`, deu vegades l'atzar). A BFF, Agüera y Arcas (2025) ja hi descriu fragments curts que es copien des del començament | En part: abans de la transició l'HOE puja i els bytes diferents baixen; cap freqüència de bytes | En part: la distribució dels bytes que la sopa escriu poc abans que la prengui un replicador; sense el curs en el temps ni el mecanisme | **Hi és, a Amoeba** (pel resum): les freqüències de les instruccions s'esbiaixen abans dels replicadors | No hi surt | Exploratori (entrada 16) |
| A2 | La sopa envellida té menys programes que es copien que una de nova: les instruccions s'amunteguen en pocs programes | No hi surt | No hi surt. La seva comparació (la sopa troba replicadors 2 a 4 vegades més de pressa que una cerca amb el seu histograma) és una altra mesura | No ho sabem | No hi surt | Exploratori (entrada 16; l'auditor 1, AUD-122) |
| A3 | A igual temps des d'una sopa neta, la vida s'estableix més sovint en una sopa envellida | No hi surt: cap prova a una edat fixada | No hi surt | No ho sabem | No hi surt | **Confirmat** (entrada 14, preregistrat) |
| A4 | L'establiment és un esdeveniment d'atzar: dues branques d'un mateix món s'estableixen de manera independent | No hi surt | No hi surt | No ho sabem | No hi surt | Exploratori (entrada 16) |
| A5 | El `<` s'acumula per la regla del primer byte (el cap d'escriptura comença al primer byte, i un `<` el porta al final del company) | No hi surt | No hi surt | No hi pot ser tal com és (un altre joc d'instruccions); un mecanisme anàleg, no ho sabem | No hi surt | Exploratori (l'auditor 1); el pas 2a ho mesura |
| A6 | Una prova de replicació amb companys de soroll dona falsos positius quan s'escaneja una sopa sencera | No hi surt (no ho hem buscat) | No hi surt (no ho hem buscat) | — | — | Exploratori (entrada 16) |
| A7 | La maduració actua sobre l'arrelament dels replicadors, no sobre la seva aparició | No hi surt | En part: sense fusions, els replicadors apareixen però no prenen la sopa | No ho sabem | En part: proves d'invasió amb llinatges evolucionats, sembrats a l'1 % en una sopa nova (A.2); no amb un fundador acabat de néixer | **Per provar** (el pilot) |

**Cicala i altres (2026) i Mathis i altres (2024)** no tracten cap d'aquestes afirmacions: la coevolució de la còpia amb una tasca, en un
cas, i les organitzacions d'AlChemy, en l'altre.

**El que diuen les altres fonts (12-11-2026):**
- **Agüera y Arcas (2025), capítol 1:** a BFF, des del començament apareixen replicadors imperfectes, «trossos molt curts de codi», i el
  replicador sencer es forma per fusió de replicadors més petits («simbiosi multifractal»). Hi tracta cada instrucció com un replicador
  «atòmic». No diu quins bytes s'acumulen, no fa cap intervenció i no parla de l'edat de la sopa. **És un precedent a BFF de la idea
  general (A1) i, en part, del mecanisme (A5).**
- **Knierim i altres (2026),** ja a la bibliografia: si es bloquegen les fusions, els replicadors continuen apareixent però no prenen la
  sopa. **Aparèixer i prendre la sopa tenen requisits diferents: és un precedent de la pregunta d'A7**, encara que no en mesurin cap ritme
  ni hi intervinguin amb l'edat.
- **La fitxa de la versió de 2016 de Greenbaum i Pargellis:** el mateix que el resum de 2017. La sopa d'Amoeba s'autoorganitza abans dels
  replicadors: el joc d'instruccions s'esbiaixa, s'hi escampen seqüències curtes («blocs de construcció»), i quan n'hi ha prou es
  combinen en replicadors. Ho mesuren amb les freqüències de seqüències de n instruccions, la distribució de mides i la informació mútua.
- **No serveixen:** l'arXiv 0710.3278 (Silvestre i Fontanari, 2007) és d'un model de protocèl·lules, sense cap sopa de programes; el blog de
  Taskade sobre BFF és divulgatiu i no cita cap font primària (la «gelificació» i les dotze fusions no surten a cap article que hàgim
  trobat); i les pàgines de Semantic Scholar i de l'ACM no ens deixen entrar.

## Què en surt

- **No és nou:** la idea general d'una fase prèvia en què la sopa s'organitza i després apareixen replicadors (Greenbaum i Pargellis,
  2016 i 2017, a Amoeba; Agüera y Arcas, 2025, a BFF), que la distribució dels bytes importa (Knierim i altres, 2026), i que aparèixer
  i prendre la sopa són dues coses (Knierim i altres, 2026).
- **Podria ser nou a BFF,** si la lectura de Greenbaum i Pargellis no hi diu el contrari: la prova causal a una edat fixada (A3, ja
  confirmada), la paradoxa de la disposició (A2), l'atzar de l'establiment (A4), un mecanisme concret (A5) i, sobretot, on actua la
  maduració (A7), que és el que la línia vol provar.
- **El més segur de tot és metodològic** (A6), però és petit.

## El que falta abans de dir res

1. **La lectura sencera de Greenbaum i Pargellis,** la versió oberta del congrés de 2016 (la de 2017 és de pagament), amb una pregunta: què hi diuen de la fase d'abans dels
   replicadors (quines instruccions s'hi acumulen, com, i si ho proven amb una intervenció).
2. **Una cerca datada** a arXiv i a Google Scholar (BFF, *primordial soup*, *pre-replicator*, *self-organization before replication*).
3. **Una persona del camp** que llegeixi aquesta matriu (els criteris del 05-11-2026).
