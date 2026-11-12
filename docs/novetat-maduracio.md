# La matriu de novetat de la línia de la maduració

**Esborrany del 12-11-2026**, posat al dia el mateix dia tres vegades: amb les fonts obertes que va proposar el responsable, amb els PDF que
ens va fer arribar, i, al vespre, amb les respostes dels dos auditors a la consulta X-105 (la secció del final). És la quarta decisió de
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
| Agüera y Arcas (2025), *What Is Intelligence?*, capítol 1 | BFF | En línia, el 12-11-2026 (whatisintelligence.antikythera.org), amb una eina que en resumeix el text: les seccions sobre BFF |
| Peng, Linderoth i Baum (2022) | Xarxes de reaccions químiques | En línia, a PMC, el 12-11-2026, amb una eina que en resumeix el text: no l'hem llegit línia a línia. És la versió revisada del preprint de ChemRxiv que va proposar el responsable |
| Hickinbotham (2023) | Nanopond | El resum (OpenAlex, el 12-11-2026) |
| Kinsler i altres (2017); Papale i Kulish (2025); Fischbacher (2025) | Polímers en compartiments; química prebiòtica; cinètica de seqüències | El resum (OpenAlex, el 12-11-2026), amb una eina que en reconstrueix el text |
| Pargellis (1996, 2001, 2003) | Amoeba-I a III | Parcial; la de 2003, no. Que el joc d'instruccions ja s'hi esbiaixava ho diu el text de 2016 |
| Jha i altres (2026) | BFF i Z80, amb un cost energètic | Sencera, el 19-10-2026 |
| Cicala i altres (2026) | Z80, programes de 32 bytes | Sencera, el 19-10-2026 |
| Mathis i altres (2024) | AlChemy (càlcul λ) | El resum |

## Les afirmacions possibles, font per font

**Com es llegeix:** «hi és», ja publicat; «en part», hi ha una cosa semblant, però no la mateixa; «no hi surt», no és en el que hem llegit;
«no ho sabem», no n'hem llegit prou.

| | L'afirmació | 2024 | Knierim (2026) | Greenbaum i Pargellis (2016) | C G (2017) | Adami i LaBar (2017) | Pigozzi i Levin (2026) | Jha (2026) | Estat a Genesis |
|---|---|---|---|---|---|---|---|---|---|
| A1 | La sopa sense vida de BFF deriva per un camí comú cap a una composició rica en instruccions (el `<`, deu vegades l'atzar). A BFF, Agüera y Arcas (2025) ja hi descriu fragments curts que es copien des del començament | En part: abans de la transició l'HOE puja i els bytes diferents baixen; cap freqüència de bytes | En part: la distribució dels bytes que la sopa escriu poc abans que la prengui un replicador; sense el curs en el temps ni el mecanisme | **Hi és, a Amoeba:** el joc d'instruccions s'esbiaixa sempre, de 25 instruccions efectives a unes 20 en les primeres 50.000 generacions, mesurat amb l'entropia de les instruccions soles (la mateixa mena de mesura que la nostra D, no la mateixa magnitud); abans dels replicadors hi pugen les que fan servir (els NOP, des d'unes 70.000 generacions abans, i el MALL). Ja s'esbiaixava a Amoeba-II i III, sense blocs | No hi surt: no hi ha cap sopa sense replicadors | En part, com a hipòtesi que no proven: l'activitat de molècules que no es copien canviaria la composició dels monòmers | No hi surt | No hi surt | Exploratori (entrada 16) |
| A2 | La sopa envellida té menys programes que es copien que una de nova: les instruccions s'amunteguen en pocs programes | No hi surt | En part, per a la composició: amb els bytes que escriu la sopa, la cerca a l'atzar troba el primer replicador unes 17 vegades abans que amb bytes uniformes, una màquina d'escriure esbiaixada a BFF. Sense la disposició ni la sopa tal com és | No hi surt: no compten quants programes es copien abans dels replicadors | No hi surt | No hi surt. És el contrapunt (vegeu sota): amb una composició propera a la dels replicadors, en troben 250 vegades més (seqüències de 15 instruccions), però en seqüències a l'atzar, sense cap disposició | No hi surt | No hi surt | Exploratori (entrada 16; l'auditor 1, AUD-122), amb la prova del cens, que té falsos positius (A6) |
| A3 | A igual temps des d'una sopa neta, la vida s'estableix més sovint en una sopa envellida | No hi surt: cap prova a una edat fixada | No hi surt | No hi surt. Els autors diuen que, a Amoeba, l'aparició es fa menys probable amb el temps, però és la distribució dels temps de les 25 tirades amb replicadors, sense les 24 censurades, i d'un altre estimand (el primer replicador, no l'establiment): només es pot comparar qualitativament | No hi surt | En part, com a hipòtesi que no proven: si la composició canvia «en la bona direcció», els replicadors podrien ser inevitables. I ja diuen que l'esbiaixament pot ajudar o perjudicar, segons l'entorn | No hi surt: cap edat del medi | No hi surt | **Confirmat** (entrada 14, preregistrat) |
| A4 | L'establiment té una part d'atzar: les dues branques d'un mateix món s'hi comporten de manera compatible amb la independència | No hi surt | No hi surt | No hi surt: 49 tirades independents, sense branques | No hi surt. Una pregunta veïna: quan competeixen tots els replicadors mínims, qui pren la població depèn poc de l'atzar (tres genotips, el 65 % de les 200 rèpliques) | No hi surt | No hi surt | No hi surt | Exploratori (entrada 16): compatible amb la independència, amb poca potència (AUD-183, AU2-152) |
| A5 | El `<` s'acumula per la regla del primer byte (el cap d'escriptura comença al primer byte, i un `<` el porta al final del company) | En part, el mètode: els *tokens* ja segueixen l'origen de cada byte a cada còpia. No la regla del primer byte | No hi surt | Un anàleg, no el mateix: els «propagadors», bucles de còpia que no s'acaben (no fan cap fill) i escampen per la memòria les seves instruccions i d'altres. Els dedueixen de les freqüències de parelles; no segueixen qui escriu cada instrucció | No hi surt | No hi surt | No hi surt | No hi surt | Exploratori (l'auditor 1); el pas 2a ho mesura, seguint qui escriu cada byte |
| A6 | Una prova de replicació amb companys de soroll dona falsos positius de l'autonomia (programes que només es copien amb el codi del company) quan s'escaneja una sopa sencera | No hi surt (no ho hem buscat) | En part: el seu detector ja vol evitar els falsos positius (deu branques de cinc execucions seguides, amb soroll nou cada vegada), sense mesurar-ne cap taxa | No hi surt. Hi expliquen una dificultat veïna: saber quan apareix un ancestre (en registren un quan es copia fidelment quatre generacions) | No hi pot sortir: a Avida, la prova es fa amb el programa sol | No hi pot sortir, per la mateixa raó | No hi surt | — | Exploratori (entrades 16 i 17) |
| A7 | La maduració actua sobre l'arrelament dels replicadors, no sobre la seva aparició | No hi surt | En part: sense fusions, els replicadors apareixen però no prenen la sopa | No hi surt cap prova. La seva explicació actua sobre l'aparició: els replicadors apareixen quan la densitat de blocs és prou alta | En part: separen que hi hagi replicadors (un de cada 200 milions de programes de 8 instruccions) de qui pren la població quan n'hi ha molts (els de més eficàcia). Hi compta el replicador, no l'estat de la sopa | No hi surt. La seva hipòtesi actua sobre l'aparició (la probabilitat de trobar un replicador per atzar) | **En part, en un model químic:** intervenir en l'organització del medi abans dels replicadors en puja la persistència (874 contra 716) i no canvia el temps fins al primer replicador (36 % contra 37 %) | En part: proves d'invasió amb llinatges evolucionats, sembrats a l'1 % en una sopa nova (A.2); no amb un fundador acabat de néixer | **Per provar** (el pilot). Encara no sabem on actua (AUD-184, AU2-151) |

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
  - **Per programes a l'atzar** (B1 v0.7, la §13; l'entrada 17, exploratori): amb companys inerts, amb la composició de les sopes
    envellides (un 11,3 % d'instruccions), uns 6·10⁻⁷ programes es copien sols i són hereditaris; amb bytes uniformes, cap de 10⁷ (la corba
    en dona uns 6·10⁻¹⁰, amb un interval que arriba a 10⁻⁷). La màquina d'escriure esbiaixada funciona a BFF sense l'ajuda del company, com
    ja apuntaven Knierim i altres (2026) amb el seu detector. El que falta és la disposició de les sopes de debò: el pas 2b.
- **Agüera y Arcas (2025), capítol 1:** a BFF, des del començament apareixen replicadors imperfectes, «trossos molt curts de codi», i el
  replicador sencer es forma per fusió de replicadors més petits («simbiosi multifractal»). Hi tracta cada instrucció com un replicador
  «atòmic». No diu quins bytes s'acumulen, no fa cap intervenció i no parla de l'edat de la sopa. **És un precedent a BFF de la idea
  general (A1) i, en part, del mecanisme (A5).**
- **Knierim i altres (2026),** ja a la bibliografia:
  - **aparèixer i prendre la sopa:** si es bloquegen les fusions, els replicadors continuen apareixent però no prenen la sopa. És un
    precedent de la pregunta d'A7, encara que no en mesurin cap ritme ni hi intervinguin amb l'edat;
  - **la composició:** amb els bytes que escriu la sopa (ℬℱℱ), la cerca a l'atzar troba el primer replicador amb 1,7·10⁶ programes de
    mitjana, i amb bytes uniformes, amb 2,9·10⁷: unes 17 vegades abans (el factor és del projecte). És la màquina d'escriure esbiaixada, ja a
    BFF (l'auditor 1);
  - **el detector:** un programa ha de fer fills iguals amb soroll nou a cada pas, en cadenes de cinc execucions i en deu branques, «per
    evitar falsos positius» (l'auditor 2). No en mesuren cap taxa.
- **Pigozzi i Levin (2026),** la taula 1 i els resultats: al model GARD, una mesura de l'organització causal del medi abans dels
  replicadors en prediu la replicació posterior millor que les mesures de la dinàmica molecular.
  - **Les intervencions que la pugen** augmenten la persistència (874 ± 233 contra 716 ± 198 passos) i la consistència, sense canviar el
    temps fins al primer replicador (36 ± 26 % contra 37 ± 27 %); les que la baixen, al revés. La «probabilitat» de la taula (88 % a tots
    dos) és la fracció de passos en replicació, no la d'aparició.
  - **És el precedent més proper d'A7:** separen la persistència de l'aparició, amb intervencions (AU2-150).
  - **Les reserves** (l'auditor 1): són replicadors de composició, d'un sol llinatge; intervenen a cada generació, també amb el replicador
    ja present; i el text dona a la probabilitat un efecte al llarg del temps que la taula no mostra. No hi ha cap sopa de programes ni cap
    edat del medi.
- **Idees veïnes, en química, pel resum:** a Kinsler i altres (2017), polímers que esbiaixen la concentració de monòmers del seu
  compartiment hi tenen avantatge abans de cap replicació; Papale i Kulish (2025) descriuen l'evolució química d'abans de la replicació
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
    replicació, en fragments químics.
  - **Què en surt:** cap treball no prova que la maduració de la sopa, o la seva edat, canviï l'aparició o l'arrelament dels replicadors
    en una sopa de programes. OpenAlex no lliga totes les citacions dels preprints, i Google Scholar no l'hem pogut fer servir des d'aquí:
    la cerca no és completa.
- **No serveixen:** l'arXiv 0710.3278 (Silvestre i Fontanari, 2007) és d'un model de protocèl·lules, sense cap sopa de programes; el blog de
  Taskade sobre BFF és divulgatiu i no cita cap font primària (la «gelificació» i les dotze fusions no surten a cap article que hàgim
  trobat); i les pàgines de Semantic Scholar i de l'ACM no ens deixen entrar.

## Què en surt

- **No és nou:**
  - la idea general d'una fase prèvia en què la sopa s'organitza abans dels replicadors (Greenbaum i Pargellis, 2016 i 2017, a Amoeba;
    Agüera y Arcas, 2025, a BFF), amb un propagador que copia sense fer fills;
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
- **Podria ser nou a BFF:**
  - **A3,** ja confirmada: a una edat fixada, la vida s'estableix més sovint en una sopa envellida. És el que avui es pot defensar com a
    nou, amb els seus límits: un contrast preregistrat de l'establiment a BFF després de la maduració (tots dos auditors). No en prova cap
    mecanisme, ni la hipòtesi d'Adami i LaBar (AU2-151). La comparació amb Amoeba només és qualitativa.
  - **A2,** amb el contrapunt de la màquina d'escriure esbiaixada: si és nou, és que la disposició desfà el que la composició faria.
    Descriptiu fins al pas 2b.
  - **A4** (compatible amb l'atzar, amb poca potència) i **A5** (un mecanisme concret). D'A5, Greenbaum i Pargellis en tenen un anàleg, els
    propagadors, i el mètode de seguir els bytes ja és a l'article de 2024: el que pot ser nou és la regla del primer byte.
  - **I, sobretot, A7** (on actua la maduració), que és el que la línia vol provar. Pigozzi i Levin en tenen un precedent en part, en un
    model químic. A BFF, encara no sabem si la maduració actua sobre l'aparició, sobre l'arrelament o sobre totes dues (AUD-184 = AU2-151).
- **El més segur de tot és metodològic** (A6), però és petit: a Avida la prova es fa amb el programa sol, i Knierim i altres ja dissenyen
  el seu detector per evitar els falsos positius.

## El que falta abans de dir res

1. **Tornar a comptar les cel·les que es repliquen** de les tres sopes (la nova, l'envellida i la barrejada) amb companys inerts, i comparar
   hereditaris. La sopa barrejada hi fa de control de la disposició, amb les freqüències conservades (l'auditor 2). Pel carril d'explorar,
   sense simular. És el pas 2b: la nota, els scripts i la prova curta, a la branca `maduracio-recompte` (12-11-2026); el càlcul sencer,
   unes 2,5 h.
2. **Separar la primera aparició de l'establiment** (tots dos auditors): el pilot que mesuri l'aparició i l'arrelament per separat.
3. **Una cerca més àmplia,** amb Google Scholar, que des d'aquí no hem pogut fer servir, i amb els preprints que OpenAlex no lliga.
4. **Una persona del camp** que llegeixi aquesta matriu abans de reivindicar res (els criteris del 05-11-2026; tots dos auditors).
5. **Una pregunta per al carril d'explorar, de C G i altres:** quan les dues branques d'un mateix món s'estableixen totes dues, ho fan amb
   la mateixa família dominant? Si és així, la família ja hi era abans de la branca, i això diria alguna cosa d'A7. Al pas 1 hi ha 23 mons
   amb la vida a totes dues branques (7, 12 i 4): poca potència, i es podria mirar sense simular si els registres guarden prou de cada
   família.

**Ja fetes, el 12-11-2026:** la lectura sencera de Greenbaum i Pargellis (2016) (s'hi acumulen els NOP, el MALL i les parelles del bucle de
còpia; s'escampen amb propagadors; i no ho proven amb cap intervenció); la d'Adami i LaBar (2017), el precedent més proper de la hipòtesi de
la línia; la taula 1 de Pigozzi i Levin (2026); una primera cerca datada; i la consulta als dos auditors (a sota).

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
