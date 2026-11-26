# La matriu de novetat de la línia de la maduració

**Esborrany del 12-11-2026**, posat al dia el mateix dia tres vegades: amb les fonts obertes que va proposar el responsable, amb els PDF que
ens va fer arribar, i, al vespre, amb les respostes dels dos auditors a la consulta X-105 (la secció del final). El 13-11-2026, amb les
correccions de l'auditoria 31 (A2, A5, A6 i el contrapunt; la secció del final). El 16-11-2026, amb la revisió de les fonts d'un model Fable 5.2 (la secció del final). És la quarta decisió de
l'11-11-2026 (`docs/disseny.md`; AU2-146): abans de dissenyar cap confirmació, comparar cada afirmació que la línia podria fer amb el que ja
s'ha publicat, dient com s'ha llegit cada font i quan. **No és una revisió sistemàtica.** L'article de 2017 de Greenbaum i Pargellis és de
pagament, i no l'hem pogut llegir. La versió del congrés de 2016, amb un resum que diu el mateix, és oberta, i l'hem llegida sencera.

## Les fonts

| Font | Sistema | Com l'hem llegida |
|---|---|---|
| Agüera y Arcas i altres (2024) | BFF: la sopa barrejada i el món 2D | Sencera, el 19-10-2026; una lectura dirigida dels dos auditors, l'11-11-2026; els *tokens*, tornats a mirar el 12-11-2026 |
| Knierim i altres (2026) | BFF | Sencera, el 19-10-2026; la §3 i la figura 2, tornades a mirar l'11-11-2026; el detector (§2), el 12-11-2026 |
| Greenbaum i Pargellis (2016), la versió del congrés ALIFE 2016 (pàgines 60–67) | Amoeba | **Sencera, el 12-11-2026,** amb el PDF de MIT Press que va baixar el responsable; també els dos auditors |
| Greenbaum i Pargellis (2017) | Amoeba | Només el resum (els dos auditors, l'11-11-2026). És de pagament |
| C G, LaBar, Hintze i Adami (2017) | Avida | El resum, els mètodes, la competència entre replicadors, la discussió i les conclusions, el 12-11-2026 (arXiv 1701.03993v1, el PDF que va enviar el responsable) |
| Adami i LaBar (2017), la «màquina d'escriure esbiaixada» | Avida | Els resultats, la discussió i els mètodes, el 12-11-2026 (arXiv 1506.06988v2); l'auditor 1, sencer |
| Pigozzi i Levin (2026) | GARD: conjunts de molècules que es reprodueixen per la composició | La taula 1 i els resultats de les intervencions, el 12-11-2026 (arXiv 2607.28250, el PDF d'aquell dia); l'auditor 1, sencer, i l'auditor 2, en una lectura dirigida |
| Agüera y Arcas (2025), *What Is Intelligence?*, capítol 1 | BFF | En línia, el 12-11-2026 (whatisintelligence.antikythera.org), amb una eina que en resumeix el text: les seccions sobre BFF. Les seccions «Artificial Life» i «Complexification», llegides directament el 14-11-2026 (la revisió de les fonts) |
| Peng, Linderoth i Baum (2022) | Xarxes de reaccions químiques | En línia, a PMC, el 12-11-2026, amb una eina que en resumeix el text: no l'hem llegit línia a línia. És la versió revisada del preprint de ChemRxiv que va proposar el responsable |
| Hickinbotham (2023) | Nanopond | El resum (OpenAlex, el 12-11-2026) |
| Kinsler i altres (2017); Papale i altres (2025); Fischbacher (2025) | Polímers en compartiments; química prebiòtica; cinètica de seqüències | El resum (OpenAlex, el 12-11-2026), amb una eina que en reconstrueix el text |
| Pargellis (1996, 2001, 2003) | Amoeba-I a III | Parcial; la de 2003, no. Que el joc d'instruccions ja s'hi esbiaixava ho diu el text de 2016 |
| Jha i altres (2026) | Z80, amb un cost energètic (no BFF; FON-04) | Sencera, el 19-10-2026 |
| Cicala i altres (2026) | Z80, programes de 32 bytes | Sencera, el 19-10-2026 |
| Mathis i altres (2024) | AlChemy (càlcul λ) | El resum |

## Les afirmacions possibles, font per font

**Com es llegeix:** «hi és», ja publicat; «en part», hi ha una cosa semblant, però no la mateixa; «no hi surt», no és en el que hem llegit;
«no ho sabem», no n'hem llegit prou.

| | L'afirmació | 2024 | Knierim (2026) | Greenbaum i Pargellis (2016) | C G (2017) | Adami i LaBar (2017) | Pigozzi i Levin (2026) | Jha (2026) | Estat a Genesis |
|---|---|---|---|---|---|---|---|---|---|
| A1 | La sopa sense vida de BFF deriva per un camí comú cap a una composició rica en instruccions (el `<`, deu vegades l'atzar). A BFF, Agüera y Arcas (2025) ja hi descriu fragments curts que es copien des del començament i, sense xifres, que abans de la transició hi pugen el càlcul i la densitat d'instruccions (FON-01) | En part: l'HOE puja les primeres 1.000 èpoques i després baixa, amb una distribució que ja no és la uniforme del començament; els *tokens* únics baixen de 8 a uns 3 milions; cap freqüència de bytes (FON-02) | En part: la distribució dels bytes que la sopa escriu poc abans que la prengui un replicador; sense el curs en el temps ni el mecanisme | **Hi és, a Amoeba:** el joc d'instruccions s'esbiaixa sempre, de 25 instruccions efectives a unes 20 en les primeres 50.000 generacions, mesurat amb l'entropia de les instruccions soles (la mateixa mena de mesura que la nostra D, no la mateixa magnitud); abans dels replicadors hi pugen les que fan servir (els NOP, des d'unes 70.000 generacions abans, i el MALL). Ja s'esbiaixava a Amoeba-II i III, sense blocs | No hi surt: no hi ha cap sopa sense replicadors | En part, com a hipòtesi que no proven: l'activitat de molècules que no es copien canviaria la composició dels monòmers | No hi surt | No hi surt | Exploratori (entrada 16) |
| A2 | La sopa envellida té menys programes que es copien que una de nova: les instruccions s'amunteguen en pocs programes | No hi surt | En part, per a la composició: amb els bytes que escriu la sopa, la cerca a l'atzar troba el primer replicador unes 17 vegades abans que amb bytes uniformes, una màquina d'escriure esbiaixada a BFF. Sense la disposició ni la sopa tal com és | No hi surt: no compten quants programes es copien abans dels replicadors | No hi surt | No hi surt. És el contrapunt (vegeu sota): amb una composició propera a la dels replicadors, en troben 250 vegades més (seqüències de 15 instruccions), però en seqüències a l'atzar, sense cap disposició | No hi surt | No hi surt | Exploratori (entrades 16 i 18): amb companys inerts, l'ordre se sosté a tots 150 mons en còpies d'una generació (el pas 2b: 0,07, 5,9 i 111 cel·les per sopa que es copien al company, a l'envellida, la nova i la barrejada). Són dels positius de l'escaneig, i en són cotes inferiors: l'escaneig se'n deixa, i a l'envellida, en proporció, més. Les hereditàries amb companys inerts no es poden comparar entre les sopes (AUD-186, AUD-189 = AU2-153) |
| A3 | A igual temps des d'una sopa neta, la vida s'estableix més sovint en una sopa envellida | No hi surt: cap prova a una edat fixada | No hi surt | No hi surt. Els autors diuen que, a Amoeba, l'aparició es fa menys probable amb el temps, però és la distribució dels temps de les 25 tirades amb replicadors, sense les 24 censurades, i d'un altre estimand (el primer replicador, no l'establiment): només es pot comparar qualitativament. Ho atribueixen a l'esbiaixament continuat del joc d'instruccions, que hi fa rares les instruccions de la còpia: és el precedent publicat més proper d'un estat de la sopa que canvia l'aparició, de signe contrari i sense prova (FON-03) | No hi surt | En part, com a hipòtesi que no proven: si la composició canvia «en la bona direcció», els replicadors podrien ser inevitables. I ja diuen que l'esbiaixament pot ajudar o perjudicar, segons l'entorn | No hi surt: cap edat del medi | No hi surt | **Confirmat** (entrada 14, preregistrat) |
| A4 | L'establiment té una part d'atzar: les dues branques d'un mateix món s'hi comporten de manera compatible amb la independència | En part: la transició té una part d'atzar (el 40 % de 1.000 tirades amb els mateixos paràmetres, en qualsevol moment); cap branca d'un mateix estat (FON-09) | No hi surt | No hi surt: 49 tirades independents, sense branques | No hi surt. Una pregunta veïna: quan competeixen tots els replicadors mínims, qui pren la població depèn poc de l'atzar (tres genotips, el 65 % de les 200 rèpliques) | No hi surt | No hi surt | No hi surt | Exploratori (entrada 16): compatible amb la independència, amb poca potència (AUD-183, AU2-152) |
| A5 | El `<` s'acumula per la regla del primer byte (el cap d'escriptura comença al primer byte, i un `<` el porta al final del company): una regla de BFF, que la sopa envellida aprofitaria perquè hi té més programes que comencen amb `<` (AUD-187) | En part, el mètode: els *tokens* ja segueixen l'origen de cada byte a cada còpia. No la regla del primer byte | No hi surt | Un anàleg, no el mateix: els «propagadors», bucles de còpia que no s'acaben (no fan cap fill) i escampen per la memòria les seves instruccions i d'altres. Els dedueixen de les freqüències de parelles; no segueixen qui escriu cada instrucció | No hi surt | No hi surt | No hi surt | No hi surt | Exploratori (l'entrada 18, el pas 2a): el `<` s'escampa copiant-lo (85 %), amb escriptures soltes (només el 0,04 % de les còpies són dins de tirades de 8 o més: no són propagadors). El 55 % dels nous surten de parelles que comencen amb `<`, unes 7 vegades la seva part (una línia de base calculada després); però la sopa barrejada també s'hi enriqueix unes 6 vegades. El que és propi de l'envellida és que més programes hi comencen amb `<` (el 7,5 %, contra el 4 % dels seus bytes). És una associació de la traça, no una prova causal (AU2-155), i que faci acumular la sopa és per confirmar (AUD-187) |
| A6 | Una prova de replicació amb companys de soroll dona falsos positius de l'autonomia (programes que només es copien amb l'ajuda del company, el seu codi o els seus bytes) quan s'escaneja una sopa sencera, i també es deixa replicadors de debò | No hi surt (no ho hem buscat) | En part: el seu detector ja vol evitar els falsos positius (nou o deu branques de cinc execucions seguides, amb soroll nou cada vegada; FON-05), sense mesurar-ne cap taxa | No hi surt. Hi expliquen una dificultat veïna: saber quan apareix un ancestre (en registren un quan es copia fidelment quatre generacions) | No hi pot sortir: a Avida, la prova es fa amb el programa sol | No hi pot sortir, per la mateixa raó | No hi surt | — | Exploratori (entrades 16, 17 i 18): amb companys inerts, el 99,7 % dels positius de l'escaneig de les sopes envellides no s'hi copien (necessiten el company; AU2-153). I l'escaneig es deixa replicadors fràgils: a 2 de 16 sopes envellides, una cel·la hereditària amb companys inerts que no hi era (AUD-189). Al món 1034, provant totes les cel·les (el pas 3, l'entrada 19): l'escaneig veu tot el brot (169 hereditàries de 169), però fora del brot, 1 de 4 cel·les que es copien amb companys inerts, i el 81 % dels seus positius no s'hi copien |
| A7 | La maduració actua sobre l'arrelament dels replicadors, no sobre la seva aparició | En part: sembren un replicador (sorgit d'una tirada i netejat) en 1.000 sopes noves, i el 22 % fan la transició en 128 èpoques; diuen que es pot destruir abans de prendre la sopa. Sense cap edat ni estat de la sopa (FON-16) | En part: sense fusions, els replicadors apareixen però no prenen la sopa; i el detector els deixa veure replicadors que apareixen i s'extingeixen abans de prendre-la (FON-13) | No hi surt cap prova. La seva explicació actua sobre l'aparició: els replicadors apareixen quan la densitat de blocs és prou alta; i l'esbiaixament continuat, la fa menys probable (FON-03) | En part: separen que hi hagi replicadors (un de cada 200 milions de programes de 8 instruccions) de qui pren la població quan n'hi ha molts (els de més eficàcia). Hi compta el replicador, no l'estat de la sopa | No hi surt. La seva hipòtesi actua sobre l'aparició (la probabilitat de trobar un replicador per atzar) | **En part, en un model químic:** intervenir en l'organització del medi abans dels replicadors en puja la persistència (874 contra 716) i no canvia el temps fins al primer replicador (36 % contra 37 %) | En part: proves d'invasió amb llinatges evolucionats, sembrats a l'1 % en una sopa nova (A.2), a Z80 i sense mutació; no amb un fundador acabat de néixer | **No se sosté per als plantats** (el pilot, l'entrada 20, exploratori): els replicadors plantats arrelen menys a la sopa envellida, 0,35 vegades la nova [0,28; 0,43] (a la barrejada, 0,58 [0,48; 0,69]); G1 hi perd molt, a G4 és inconcloent. Sense plantar res, la vida s'hi estableix més, com a la sèrie (15 de 60 contra 7). El cens inert hi veu més famílies, però sobretot just abans d'un establiment, i moltes són trossos de la que s'estableix: no mesura l'aparició per separat (AUD-204). Per la regla fixada, si les aparicions naturals arrelessin com aquests genotips, l'efecte hauria de venir de l'aparició; la consistència no ho confirma (*P*(arrela | detectada), 0,80 contra 0,17 a l'envellida, una distància que també depèn de la delimitació de les famílies i de G2 i G3; AUD-205). **Les famílies naturals, seguides com els plantats** (l'entrada 21, exploratori; l'auditoria 38): comptant llinatges, el criteri de consistència es compleix a l'envellida i a la barrejada (0,64 contra 0,63; 0,71 contra 0,62), i no a la nova (6 de 12 contra 0,94), sense ser cap prova d'equivalència; comptant grups, a l'envellida no (0,33). A l'envellida s'hi compten més aparicions que no s'estableixen (4,41 [1,44; 15,49] vegades la nova), però l'excés depèn de les que poden ser trossos del llinatge que s'estableix: sense les de just abans d'un establiment, l'interval conté 1. **Com s'apaguen els plantats** (l'entrada 22, exploratori): a la sopa envellida, els llinatges de G1 que passen el primer pas s'extingeixen més (25 de 34 a la 9.500, contra 16 de 47 a la nova) i hi arrelen menys (pel criteri del pilot, 7 sembres de 240 contra 29; les auditories 39 i 40), amb menys membres hereditaris (0,64 [0,47; 0,88], i 0,81 als passos hereditaris; G4, 1,02); encaixa amb la pista del primer byte a escala de sopa, no a escala de veïnat. Abans, al món 1034 (el pas 3, l'entrada 19): les aparicions hereditàries són els brots, un en 16.000 èpoques. **La proveta** (l'entrada 23, exploratori): la prova del cens satura i no passa el calibratge; que els naturals s'adaptin a la seva sopa queda sense provar. **Sense plantar** (l'entrada 24, exploratori; l'auditoria 41): entre els naturals que s'estableixen no es veu cap filtre del primer byte (5 de 15, 5 de 15 i 3 de 7; l'interval admet un terç); la prova dels veïns no en pot dir res; i tres menes d'indici coincideixen a dir que l'excés d'aparicions que no s'estableixen no se separa de la fragmentació. **La síntesi** (l'entrada 25): on actua la maduració, encara no ho sabem; la línia dels replicadors plantats es tanca. **El nul dins del món** (l'entrada 26, exploratori; l'auditoria 43): el lloc supera el nul dins del món, i la seqüència només per la regla fixada (amb la branca com a unitat, no: dins del món queda sense decidir); els 8 bytes no s'hi poden calibrar amb aquests registres, i l'excés ni se separa de la fragmentació ni s'ha mostrat que siguin trossos. **El registre petit de les còpies** (l'entrada 27, exploratori; l'auditoria 44): els bytes de les 16 aparicions de la sopa envellida que treu la regla del temps han passat per les cel·les del grup dominant, i els del seu veïnat també: la marca diu per on han passat (exposició), no la descendència, i no mostra que siguin trossos; a posteriori, els orígens per posició apunten a còpies mutades (l'auditor 1, una pista); sense elles, l'excés de l'envellida no es mostra amb aquesta regla (totes les variants contenen 1; tractant igual les dues sopes, 4,55 [0,90; 22,91]); les dues ràfegues de set no són una sola aparició cadascuna. **Còpies o arranjaments nous** (l'entrada 28, exploratori): una mesura de descendència fixada abans, l'ordre dels orígens dels bytes, específica als mons de prova (separa les còpies d'un replicador de les d'una variant i d'una còpia independent del mateix programa) i lluny del grup dominant; de les 16, 4 còpies del grup dominant, cap arranjament nou i 12 sense decidir: per la regla fixada, no ho podem dir, perquè més de la meitat del seu veïnat també porta tirades de 16 bytes amb el seu ordre; l'excés que queda no es mostra amb aquesta regla (4,55 [0,90; 22,91]; treient només les còpies, 3,88 [1,13; 13,41]) |

**Cicala i altres (2026), Mathis i altres (2024) i Peng, Linderoth i Baum (2022)** no tracten cap d'aquestes afirmacions: la coevolució
de la còpia amb una tasca; les organitzacions d'AlChemy; i, en xarxes de reaccions químiques, els sistemes autocatalítics que només
s'engeguen amb una espècie iniciadora (*seed*), organitzats en nivells: quan un nivell és actiu, el següent es pot iniciar amb espècies
més senzilles. Aquesta idea és una manera de pensar A7 (l'estat de la sopa decideix què hi pot arrelar), no un precedent: és una anàlisi
de la topologia de les xarxes, sense temps ni ritmes.

**El que diuen les altres fonts (12-11-2026):**
- **Greenbaum i Pargellis (2016), sencera.**
  - **El sistema:** Amoeba-IV, 1,2 milions d'instruccions en 500 bandes, amb 25 instruccions i adreces de NOP, com a Tierra. És un món
    obert: a cada generació hi entren seqüències curtes a l'atzar, i la mida dels programes no és fixa.
  - **Les fases:** primer, el joc d'instruccions s'esbiaixa; després s'escampen blocs curts, i hi apareixen proto-replicadors ineficients;
    i, a la meitat de les tirades (25 de 49), un replicador que evoluciona de pressa. Després, sempre domina una sola espècie.
  - **Les mesures:** l'entropia de les instruccions soles, la informació mútua de les parelles i les freqüències de seqüències de *n*
    instruccions.
  - **El cas que descriuen amb detall** (l'aparició, a unes 292.000 generacions): els NOP pugen des d'unes 70.000 generacions abans, i el MALL
    també; les parelles del bucle de còpia, des d'unes 50.000 abans. El màxim creixement de la informació mútua coincideix amb l'aparició.
  - **El propagador sense herència hi és explícit:** el bucle {CALL, COPY, INCA, RETN} copia instruccions per la memòria i no pot fer cap
    fill (l'auditor 1).
  - **La disposició:** a la imatge de la memòria hi veuen tirades d'una mateixa instrucció, com les de `<<`, `>>` i `}}` del pas 1, però
    no les quantifiquen.
  - **La mutació:** la taxa, «triada empíricament», regula l'esbiaixament: per sota de 0,05, dominen els NOP; per sobre de 0,20, la mutació
    desfà els blocs. Sense dades.
  - **No hi ha cap intervenció ni cap control:** és la descripció de tirades. Proposen que grups de propagadors formin hipercicles
    (Eigen), i ho volen mirar.
- **C G i altres (2017), a Avida:**
  - **El paisatge:** enumeren tots els programes de 8 instruccions (uns 2,1·10¹¹) i en troben 914 que es copien, en dues classes i 13
    grups; amb 7 instruccions, cap.
  - **La competència:** quan els fan competir tots junts (10 còpies de cadascun, 200 rèpliques de 50.000 actualitzacions), tres genotips,
    els tres de més eficàcia, són l'avantpassat de la població al 65 % de les rèpliques, i els altres guanyadors són dels mateixos grups.
  - **Per a la línia:** separen dues preguntes que la línia també separa, que hi hagi replicadors i qui pren la població. Però no hi ha
    cap sopa sense replicadors, ni cap maduració, i la prova de replicació es fa amb el programa sol.
- **Adami i LaBar (2017), a Avida:**
  - **La màquina d'escriure esbiaixada:** en seqüències de 15 instruccions (amb un alfabet de 26), una cerca uniforme troba 58 replicadors
    en mil milions; amb la composició d'aquests 58, 14.495, unes 250 vegades més (la seva aproximació en preveia 81). El biaix ha de ser
    proper al dels replicadors: no n'hi ha prou que baixi l'entropia, i en seqüències de 8 el biaix de les de 15 en troba 15 vegades menys
    que el propi. Si es torna a esbiaixar amb els replicadors trobats, en surten més, però cada vegada menys.
  - **La hipòtesi del final, que no proven:** en una química on les molècules no es copien però en fan d'altres, la seva activitat canvia
    la composició dels monòmers, i amb ella la probabilitat que apareguin replicadors. Si va «en la bona direcció», els replicadors
    podrien ser inevitables. Diuen que es podria provar en sistemes com Avida. **És la idea de la línia, escrita com a hipòtesi.** Però hi
    demanen que els monòmers es reciclin en polímers nous, i BFF no té aquest pas: la disposició només la canvien la mutació i les
    escriptures dels programes. Barrejar la sopa el fa a mà (l'auditor 1).
  - **El contrapunt d'A2** (exploratori, el pas 1, P5): la sopa envellida barrejada té 706 cel·les que es repliquen, sis vegades les d'una
    sopa nova (118), i la sopa tal com és, 23, cinc vegades menys. **Descriu els recomptes; no és cap prova de la hipòtesi:**
    - els recomptes són de la prova del cens, amb companys de soroll, que dona falsos positius de l'autonomia (A6). Cal el pas 2b, amb
      companys inerts i comparant hereditaris;
    - un recompte en un moment no és un ritme d'aparició: les cel·les que es copien no duren gaire, i 23 poden ser un flux alt. On actua la
      maduració, encara no ho sabem (AUD-184 = AU2-151);
    - la hipòtesi parla d'aparició, i la sèrie de la maduració mesura l'establiment. `shuffle-all` contra `reinit` (82 contra 40
      establiments, a l'entrada 14, preregistrat) hi és coherent pel que fa a l'establiment, però no en prova l'aparició.
    - **Amb companys inerts** (el pas 2b; l'entrada 18), el contrapunt es manté a tots 150 mons en còpies d'una generació: 111 cel·les per
      sopa que es copien al company a la barrejada, 5,9 a la nova i 0,07 a l'envellida. Són dels positius de l'escaneig, i en són cotes
      inferiors (AUD-189 = AU2-153). Les hereditàries amb companys inerts, entre aquests positius, 0, 0 i 0,07 per sopa, no es poden
      comparar entre les sopes: l'escaneig se'n deixa, també a les envellides (AUD-186, AUD-189, AU2-154).
  - **Per programes a l'atzar** (B1 v0.7, la §13; l'entrada 17, exploratori): amb companys inerts, amb la composició de les sopes
    envellides (un 11,3 % d'instruccions), uns 6·10⁻⁷ programes es copien sols i són hereditaris; amb bytes uniformes, cap de 10⁷ (la corba
    en dona uns 6·10⁻¹⁰, amb un interval que arriba a 10⁻⁷). La màquina d'escriure esbiaixada funciona a BFF, com
    ja havien vist Knierim i altres (2026) amb el seu detector, que fa servir companys de soroll; que funcioni sense l'ajuda del company
    és de B1 (FON-07). El que falta és la disposició de les sopes de debò: el pas 2b.
- **Agüera y Arcas (2025), capítol 1:** a BFF, des del començament apareixen replicadors imperfectes, «trossos molt curts de codi», i el
  replicador sencer es forma per fusió de replicadors més petits («simbiosi multifractal»). Hi tracta cada instrucció com un replicador
  «atòmic».
  - **Llegit directament el 14-11-2026** (la revisió de les fonts, FON-01): hi descriu fases de «pre-vida»; un augment del càlcul en el
    període quiet, abans que les cintes es repliquin; instruccions que, en certes posicions o combinacions, es copien més del que tocaria
    per atzar; i, mentre proliferen els replicadors imperfectes, una densitat d'instruccions per cinta que puja. Tot sense xifres.
  - No diu quins bytes s'acumulen, no fa cap intervenció i no parla de l'edat de la sopa. **És un precedent a BFF de la idea general
    (A1) i, en part, del mecanisme (A5):** a totes dues, només en pot ser nova la mesura.
  - **Una tensió amb A2:** el llibre atribueix la pujada a fragments que es copien i proliferen, i a les sopes envellides de Genesis
    gairebé no n'hi ha que es copiïn amb companys inerts (els passos 2b i 3). El llibre parla d'una sopa barrejada que fa la transició.
- **Knierim i altres (2026),** ja a la bibliografia:
  - **aparèixer i prendre la sopa:** si es bloquegen les fusions, els replicadors continuen apareixent però no prenen la sopa. És un
    precedent de la pregunta d'A7, encara que no hi intervinguin amb l'edat: n'hi mesuren l'aparició (la fracció de tirades que veuen
    un replicador, la figura 4), però no cap ritme d'establiment (FON-06). I el detector els deixa veure replicadors que apareixen i
    s'extingeixen abans de prendre la sopa (la §3.1; FON-13);
  - **la composició:** amb els bytes que escriu la sopa (ℬℱℱ), la cerca a l'atzar troba el primer replicador amb 1,7·10⁶ programes de
    mitjana, i amb bytes uniformes, amb 2,9·10⁷: unes 17 vegades abans (el factor és del projecte). És la màquina d'escriure esbiaixada, ja a
    BFF (l'auditor 1);
  - **el detector:** un programa ha de fer fills iguals amb soroll nou a cada pas, en cadenes de cinc execucions i en nou o deu branques (l'algorisme 1 en diu deu, i el text i la figura 1, nou; FON-05), «per
    evitar falsos positius» (l'auditor 2). No en mesuren cap taxa.
- **Pigozzi i Levin (2026),** la taula 1 i els resultats: al model GARD, una mesura de l'organització causal del medi abans dels
  replicadors en prediu la replicació posterior millor que les mesures de la dinàmica molecular.
  - **Les intervencions que la pugen** augmenten la persistència (874 ± 233 contra 716 ± 198 passos) i la consistència, sense canviar el
    temps fins al primer replicador (36 ± 26 % contra 37 ± 27 %); les que la baixen redueixen la persistència (559) i la fracció de passos en replicació (80 %), però hi deixen la consistència per
    sobre del control (0,42 contra 0,38): el text diu que les quatre mesures empitjoren, i la taula no ho mostra (FON-08). La «probabilitat» de la taula (88 % a tots
    dos) és la fracció de passos en replicació, no la d'aparició.
  - **És el precedent més proper d'A7:** separen la persistència de l'aparició, amb intervencions (AU2-150).
  - **Les reserves** (l'auditor 1): són replicadors de composició, d'un sol llinatge; intervenen a cada generació, també amb el replicador
    ja present; i el text dona a la probabilitat un efecte al llarg del temps que la taula no mostra. No hi ha cap sopa de programes ni cap
    edat del medi.
- **Idees veïnes, en química, pel resum:** a Kinsler i altres (2017), polímers que esbiaixen la concentració de monòmers del seu
  compartiment hi tenen avantatge abans de cap replicació; Papale i altres (2025) descriuen l'evolució química d'abans de la replicació
  com una construcció del nínxol; i Fischbacher (2025) modela com canvia la composició de seqüències que s'executen com a programes. Cap
  no tracta les set afirmacions.
- **La cerca datada (12-11-2026).**
  - **Les citacions, a OpenAlex:**
    - **de Greenbaum i Pargellis** (2016 i 2017): C G i altres (2017); Hickinbotham (2023), sobre Nanopond, una altra química de
      programes (pel resum, els seus estats atractors depenen de com s'hi reparteix l'energia, sense cap fase d'abans dels replicadors); i,
      només pel títol, Banzhaf i Hu (2019), Witkowski i Ikegami (2019) i Szász (2017);
    - **d'Adami i LaBar** (2017; 19 treballs): els títols, i els resums de Kinsler i altres (2017) i d'Adami i C G (2022). Entre els que
      els citen hi ha Greenbaum i Pargellis (2017);
    - **d'Agüera y Arcas i altres** (2024; 31 treballs): els títols, i els resums dels set que hi podien tocar.
  - **Dues cerques generals** (BFF i la fase d'abans dels replicadors; l'autoorganització d'abans dels replicadors i la probabilitat
    d'establiment segons l'edat), que han portat a Pigozzi i Levin (2026) i a Adler (2026), sobre una selecció per la durada abans de la
    replicació, en fragments químics (arXiv:2601.17061, llegit amb una eina que en resumeix el text).
  - **Què en surt:** cap treball no prova que la maduració de la sopa, o la seva edat, canviï l'aparició o l'arrelament dels replicadors
    en una sopa de programes. OpenAlex no lliga totes les citacions dels preprints, i Google Scholar no l'hem pogut fer servir des d'aquí:
    la cerca no és completa.
- **No serveixen:** l'arXiv 0710.3278 (Silvestre i Fontanari, 2007) és d'un model de protocèl·lules, sense cap sopa de programes; el blog de
  Taskade sobre BFF és divulgatiu i no cita cap font primària (la «gelificació» i les dotze fusions no surten a cap article que hàgim
  trobat); i les pàgines de Semantic Scholar i de l'ACM no ens deixen entrar.

## Què en surt

- **No és nou:**
  - la idea general d'una fase prèvia en què la sopa s'organitza abans dels replicadors (Greenbaum i Pargellis, 2016 i 2017, a Amoeba;
    Agüera y Arcas, 2025, a BFF), amb un propagador que copia sense fer fills; i, a BFF, que abans de la transició hi pugen el càlcul i la
    densitat d'instruccions (Agüera y Arcas, 2025, sense xifres; FON-01);
  - que el joc d'instruccions s'esbiaixa sempre pel mateix camí (també a Amoeba-II i III), i la mena de mesura amb què ho veiem,
    l'entropia de les instruccions soles (A1; Greenbaum i Pargellis, 2016);
  - la hipòtesi que l'activitat d'abans dels replicadors en canvia la composició i els fa més probables (Adami i LaBar, 2017, proposada
    sense provar-la), i que una composició propera a la dels replicadors en multiplica la probabilitat (ells mateixos, a Avida). Que això
    pot ajudar o perjudicar segons l'entorn, també ho diuen ells;
  - que la composició dels bytes que escriu la sopa fa més probables els replicadors a BFF (Knierim i altres, 2026: unes 17 vegades);
  - seguir l'origen de cada byte (els *tokens* de l'article de 2024);
  - que aparèixer i prendre la població són dues coses (Knierim i altres, 2026; C G i altres, 2017, a Avida);
  - que una intervenció en l'organització d'abans dels replicadors en canviï la persistència i no el temps fins al primer replicador
    (Pigozzi i Levin, 2026, en un model químic).
  - que l'esbiaixament de la sopa en pugui abaixar l'aparició (Greenbaum i Pargellis, 2016, a Amoeba, sense prova; FON-03);
  - mesurar l'arrelament sembrant un replicador en una sopa nova de BFF: una de cada cinc vegades en pren la sopa (Agüera y Arcas i
    altres, 2024; FON-16);
  - la «pre-vida» com a teoria: selecció sense replicació, i una transició en què la vida s'imposa per sobre d'un llindar (Nowak i
    Ohtsuki, 2008).
- **Podria ser nou a BFF:**
  - **A3,** ja confirmada: a una edat fixada, la vida s'estableix més sovint en una sopa envellida. És el que avui es pot defensar com a
    nou, amb els seus límits: un contrast preregistrat de l'establiment a BFF després de la maduració (tots dos auditors). No en prova cap
    mecanisme, ni la hipòtesi d'Adami i LaBar (AU2-151). La comparació amb Amoeba només és qualitativa.
  - **A2,** amb el contrapunt de la màquina d'escriure esbiaixada: si és nou, és que la disposició desfà el que la composició faria.
    Amb el pas 2b, se sosté en còpies d'una generació, dels positius de l'escaneig (l'entrada 18; AUD-186, AUD-189).
  - **A4,** reduïda a les branques d'un mateix estat (compatible amb l'atzar, amb poca potència; que la transició té una part d'atzar ja
    és a l'article de 2024, FON-09), i **A5** (un mecanisme concret). D'A5, Greenbaum i Pargellis en tenen un anàleg, els propagadors; el
    mètode de seguir els bytes ja és a l'article de 2024; i el llibre de 2025 ja parla, sense xifres, d'instruccions que en certes
    posicions es copien més del que tocaria (FON-01). La regla del primer byte és de BFF: la sopa barrejada també
    s'hi enriqueix. El que pot ser nou és que la sopa envellida l'aprofita, amb escriptures soltes i no amb blocs (el pas 2a, descriptiu;
    AUD-187).
  - **I, sobretot, A7** (on actua la maduració), que és el que la línia vol provar. Pigozzi i Levin en tenen un precedent en part, en un
    model químic; i l'article de 2024 ja mesura, a BFF, l'arrelament d'un replicador sembrat en una sopa nova, però no segons l'edat ni
    l'estat de la sopa (FON-16). **El pilot (l'entrada 20, exploratori):** a la sopa envellida, els replicadors plantats hi arrelen menys, no més, i per la regla fixada, amb la seva condició, l'efecte hauria de venir de l'aparició. Però la consistència no es compleix, i el recompte de les aparicions detectades no mesura l'aparició per separat (AUD-204): encara no és cap afirmació de novetat. Amb les famílies naturals seguides com els plantats (l'entrada 21, i l'auditoria 38), el criteri de consistència es compleix a la barrejada, a l'envellida depèn de la unitat, i a la nova no es compleix; i l'excés d'aparicions que no s'estableixen no se separa de la fragmentació, i les entrades 22 a 24 no ho canvien: el mecanisme del primer byte s'ha mostrat fora del món, no com la causa de l'arrelament baix de G1, i entre els naturals no s'hi veu cap filtre. Aquest mecanisme, el de G1, no és cap fila de la matriu: no s'ha contrastat amb cap font (AUD-221). La síntesi és a l'entrada 25, corregida a l'auditoria 42. Si l'arrelament a BFF segons l'edat de la sopa és nou de mesurar, ho han de dir una cerca més àmplia i una persona del camp (els criteris del 05-11-2026).
- **El més segur de tot és metodològic** (A6), però és petit: a Avida la prova es fa amb el programa sol, i Knierim i altres ja dissenyen
  el seu detector per evitar els falsos positius. Que la mateixa prova també es deixi replicadors fràgils ho hem vist a l'auditoria 31
  (AUD-189).

## El que falta abans de dir res

1. **Separar la primera aparició de l'establiment** (tots dos auditors): el pilot que mesuri l'aparició i l'arrelament per separat. **Fet, exploratori** (l'entrada 20): l'arrelament dels plantats, sí; les aparicions, no: les famílies que el cens veu depenen de com es delimiten (AUD-204). L'auditoria 37 ho va revisar. Seguides com els plantats (l'entrada 21, exploratori), l'excés d'aparicions a l'envellida depèn de les que poden ser trossos (l'auditoria 38): l'aparició encara no se separa de la fragmentació.
2. **Una cerca més àmplia,** amb Google Scholar, que des d'aquí no hem pogut fer servir, i amb els preprints que OpenAlex no lliga.
3. **Una persona del camp** que llegeixi aquesta matriu abans de reivindicar res (els criteris del 05-11-2026; tots dos auditors).
4. **Una pregunta per al carril d'explorar, de C G i altres:** quan les dues branques d'un mateix món s'estableixen totes dues, ho fan amb
   la mateixa família dominant? Si és així, la família ja hi era abans de la branca, i això diria alguna cosa d'A7. Al pas 1 hi ha 23 mons
   amb la vida a totes dues branques (7, 12 i 4): poca potència, i es podria mirar sense simular si els registres guarden prou de cada
   família.
5. **Un recompte d'hereditaris que no depengui de l'escaneig** (AUD-189 = AU2-153): la prova amb companys inerts a totes les cel·les, o un
   registre de les còpies durant la simulació. I una mesura de còpies que compti només les noves (AUD-185 = AU2-155). **Per a un món,
   fet** (el pas 3, l'entrada 19): totes les cel·les de 33 captures del 1034. Per a les sopes de les sèries, encara no.
6. **Llegir directament el que s'ha llegit pel resum o amb una eina que resumeix,** abans de dir què no hi és (FON-01, FON-15):
   l'article de 2017 de Greenbaum i Pargellis, per una via autoritzada; el llibre *What Is Life?* (Agüera y Arcas, 2025), per saber si és
   el mateix text que el capítol; i la literatura de la «pre-vida» (la secció del final). I, si el responsable ho vol, repetir la cerca
   de la revisió de les fonts en una sessió nova i en una carpeta buida, perquè sigui cega de debò.

**Ja fetes, el 12-11-2026:** la lectura sencera de Greenbaum i Pargellis (2016) (s'hi acumulen els NOP, el MALL i les parelles del bucle de
còpia; s'escampen amb propagadors; i no ho proven amb cap intervenció); la d'Adami i LaBar (2017), el precedent més proper de la hipòtesi de
la línia; la taula 1 de Pigozzi i Levin (2026); una primera cerca datada; la consulta als dos auditors (a sota); i el recompte amb companys inerts (el pas 2b, l'entrada 18). **El 13-11-2026,** el pas 3 (l'entrada 19): totes les cel·les de 33 captures del món 1034, amb companys inerts. **El 16-11-2026,** la revisió de les fonts (a sota).

## La consulta X-105 (12-11-2026)

Els dos auditors van llegir Greenbaum i Pargellis (2016) i en van segellar la lectura abans d'obrir aquesta matriu (l'auditor 1 amb
`3ff5467`; l'auditor 2, amb una SHA-256, i adverteix que la interfície li havia mostrat una previsualització de la matriu). Després la van
contradir, cadascú pel seu compte. Totes les afirmacions comprovades són certes, i tots tres coincidim en les correccions, que ja són a dalt.

| Troballa | Gravetat | Què | La correcció |
|---|---|---|---|
| AUD-183 | Baixa | «Dues branques d'un mateix món s'estableixen de manera independent» és massa fort: les dades no n'exclouen una concordança d'uns 0,2 | «Compatibles amb la independència, amb poca potència» (A4; l'entrada 16) |
| AUD-184 | Baixa | «La maduració no deu actuar sobre l'aparició, sinó sobre l'arrelament» no surt d'un recompte en un moment | «Encara no sabem si és l'aparició, l'arrelament o totes dues; ho ha de dir el pilot» (A7; l'entrada 16) |
| AU2-150 | Mitjana | A7 tenia un precedent intervencional que la matriu no reconeixia: Pigozzi i Levin (2026) | A7, «en part», en un model químic |
| AU2-151 | Mitjana | Cap afirmació causal A2 → A3 → A7, ni que A3 provi la hipòtesi d'Adami i LaBar | Retirades (A3, A7, el contrapunt d'A2) |
| AU2-152 | Baixa | Les branques: independència condicional, no marginal. Els falsos positius: de quin fenotip | A4, i A6: «falsos positius de l'autonomia» |

**On és tot:** al repositori de les auditories, que no es publica (`equip/consulta-novetat/sintesi.md`, amb la taula de tres, i
`equip/annexos-x105/verificacio/`). Al xat, X-105 a X-107.

## L'auditoria 31 (13-11-2026)

La ronda única dels resultats exploratoris del carril d'explorar (B1 v0.7 i els passos 2a i 2b). Tots dos auditors van refer les xifres, que
quadren, i, cadascú pel seu compte, hi van trobar les mateixes dues coses. Tots tres coincidim en les correccions, que ja són a dalt.

| Troballa | Gravetat | Què | La correcció |
|---|---|---|---|
| AUD-189 = AU2-153 | Mitjana | El pas 2b només torna a provar els positius de l'escaneig, i l'escaneig es deixa replicadors fràgils | A2, A6 i el contrapunt: cotes inferiors dels positius de l'escaneig; les hereditàries no es comparen entre les sopes |
| AU2-154 | Mitjana | «A cap sopa no hi ha replicadors fets»: 11 sopes barrejades en tenen un, dos en totes 100 condicions | Retirada (l'entrada 18, un requadre) |
| AUD-185 = AU2-155 | Baixa i mitjana | El criteri 4 del pas 2a compta finestres que el company ja portava | Les còpies noves, comptades: 180 a l'envellida, unes 140 vegades menys que la barrejada i unes 14 menys que la nova (el sentit es manté); el salt del brot del 1034 no és de còpies |
| AUD-186 | Baixa | «Es copia» (una generació) no és «hereditari amb companys inerts» (la xifra de B1) | A2 i el contrapunt, amb els dos noms; la comparació amb B1, amb 5 de 1.025 |
| AUD-187 | Baixa | Les còpies de trossos (0,04 %) i la línia de base de la barrejada (6 vegades) no eren a l'entrada 18 | A5, reescrita: una regla de BFF que la sopa envellida aprofita, amb escriptures soltes |
| AUD-188 | Baixa | Les correccions de X-105 no havien arribat al README del pas 1 | Un requadre |

**On és tot:** al repositori de les auditories, que no es publica (`equip/sintesi-audit31.md`, amb la taula de tres, i
`equip/annexos-audit31/verificacio/`). Al xat, X-108 a X-110.

## La revisió de les fonts (16-11-2026)

La petició del responsable del 13-11-2026: un model Fable 5.2 revisa totes les fonts d'Internet que el projecte ha incorporat, amb una
cerca pròpia abans de llegir el repositori. **No és independent:** es va fer dins de la sessió de l'equip, amb el model canviat, i la cerca
pròpia, d'un agent a part, va rebre les instruccions del projecte; ho diuen la revisió i la cerca. Les troballes, però, es comproven a les
fonts, i l'equip les ha comprovades totes (dues, acceptades en part). Totes les fonts existeixen, els 64 DOI de la bibliografia resolen i
les xifres de la matriu són exactes. El que fallava era el precedent a BFF mateix.

| Troballa | Gravetat | Què | La correcció |
|---|---|---|---|
| FON-01 | Mitjana | El llibre d'Agüera y Arcas (2025), llegit amb una eina que resumeix, diu més del que en recollíem: a BFF, abans de la transició, pugen el càlcul i la densitat d'instruccions, i hi ha instruccions que en certes posicions es copien més | A1 i A5: només en pot ser nova la mesura. La tensió amb A2, dita |
| FON-02 | Baixa | A l'article de 2024, el que baixa són els *tokens* únics, no els bytes diferents | A1, la columna de 2024 |
| FON-03 | Mitjana | Greenbaum i Pargellis atribueixen la caiguda de l'aparició amb el temps a l'esbiaixament continuat de la sopa | A3, A7 i «Què en surt» |
| FON-04 | Baixa | Jha i altres només fan servir Z80 | La taula de les fonts |
| FON-05 | Baixa | El detector de Knierim i altres: nou o deu branques, segons on es miri | Corregit |
| FON-06 | Baixa | Knierim i altres sí que mesuren l'aparició amb les fusions bloquejades | Corregit |
| FON-07 | Baixa | «Sense l'ajuda del company» és de B1: el detector de Knierim fa servir companys de soroll | Corregit a la matriu; el quadern ja diu què van veure |
| FON-08 | Baixa | A Pigozzi i Levin, baixar l'organització no empitjora la consistència, encara que el text ho digui | Corregit |
| FON-09 | Baixa | Que la transició té una part d'atzar ja és a l'article de 2024 | A4, reduïda a les branques d'un mateix estat |
| FON-10 | Baixa | Set diferències menors a la bibliografia | Cinc, corregides a `docs/estat-questio.md`; dues no calien |
| FON-11 | Informativa | A Jha i altres, només els llinatges «de la cinta» es desfan; els «de la CPU» es fixen sempre | `docs/estat-questio.md`, §3 |
| FON-12 | Baixa | Deu treballs citats sense referència | A la bibliografia |
| FON-13 | Baixa | Knierim i altres ja veuen replicadors que apareixen i s'extingeixen | A7 i l'entrada 19 |
| FON-14 | Mitjana | Els README i el quadern només citaven Amoeba com a precedent de la fase prèvia | Els README i un requadre a l'entrada 16 |
| FON-15 | Informativa | El que falta abans de dir res | El punt 6 |
| FON-16 | Mitjana | L'article de 2024 sembra un replicador, sorgit d'una tirada i netejat, en 1.000 sopes noves, i el 22 % fan la transició en 128 èpoques: no el citàvem enlloc | A7, l'entrada 19 i la decisió de la inoculació |

**Les fonts que hi faltaven** (pel resum; la bibliografia, a `docs/estat-questio.md`):
- **La «pre-vida»:** Nowak i Ohtsuki (2008) hi descriuen selecció sense replicació, i una transició en què la vida desplaça la pre-vida si
  la replicació passa d'un llindar. És el marc teòric d'A7: aparèixer no és imposar-se.
- **La transició com un fet d'atzar i local:** Wu i Higgs (2012), dos estats estables i una transició estocàstica que comença en un lloc;
  Mathis, Bhattacharya i Walker (2017), molts intents frustrats abans de la vida, i els replicadors que comencen la transició sovint no són
  els que després s'imposen (toca A7 i «la família dominant a l'establiment»); i, al laboratori, Schaeffer i altres (2022), dos
  replicadors que surten d'una mateixa barreja en proporcions que canvien d'una repetició a l'altra (A4).
- **Un cas de contrast:** Jain i Krishna (1998), on un conjunt autocatalític apareix inevitablement en un graf que evoluciona, amb uns
  temps que segueixen una llei de potència.
- **Un senyal de vida a la composició:** Dorn i Adami (2011), a Avida, la distribució de les instruccions s'esbiaixa de manera repetible
  quan hi ha vida. A1 diu que a BFF ja s'esbiaixa sense vida, i s'hi ha de contrastar.
- **Altres:** Vimal i altres (2025), a AlChemy, funcions afegides a la sopa esbiaixen el que hi persisteix; i Stepney (2025), una revisió
  de l'origen de la vida virtual, que no hem llegit.
- **No són publicacions:** un repositori de tercers amb una implementació de BFF, que separa l'aparició, la transició, la presa i
  l'extinció; i dos articles de divulgació.

**On és tot:** al repositori de les auditories, que no es publica (`fable/`: la cerca pròpia, l'informe, la verificació i la resposta).
