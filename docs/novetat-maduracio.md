# La matriu de novetat de la línia de la maduració

**Esborrany del 12-11-2026**, posat al dia el mateix dia dues vegades: primer amb les fonts obertes que va proposar el responsable, i
després amb els PDF que ens va fer arribar. És la quarta decisió de l'11-11-2026 (`docs/disseny.md`; AU2-146): abans de dissenyar cap
confirmació, comparar cada afirmació que la línia podria fer amb el que ja s'ha publicat, dient com s'ha llegit cada font i quan. **No és
una revisió sistemàtica.** L'article de 2017 de Greenbaum i Pargellis és de pagament, i no l'hem pogut llegir. La versió del congrés de
2016, amb un resum que diu el mateix, és oberta, i l'hem llegida sencera.

## Les fonts

| Font | Sistema | Com l'hem llegida |
|---|---|---|
| Agüera y Arcas i altres (2024) | BFF: la sopa barrejada i el món 2D | Sencera, el 19-10-2026; una lectura dirigida dels dos auditors, l'11-11-2026 |
| Knierim i altres (2026) | BFF | Sencera, el 19-10-2026; la §3 i la figura 2, tornades a mirar l'11-11-2026 |
| Greenbaum i Pargellis (2016), la versió del congrés ALIFE 2016 (pàgines 60–67) | Amoeba | **Sencera, el 12-11-2026,** amb el PDF de MIT Press que va baixar el responsable |
| Greenbaum i Pargellis (2017) | Amoeba | Només el resum (els dos auditors, l'11-11-2026). És de pagament |
| C G, LaBar, Hintze i Adami (2017) | Avida | El resum, els mètodes, la competència entre replicadors, la discussió i les conclusions, el 12-11-2026 (arXiv 1701.03993v1, el PDF que va enviar el responsable) |
| Adami i LaBar (2017), la «màquina d'escriure esbiaixada» | Avida | Els resultats, la discussió i els mètodes, el 12-11-2026 (arXiv 1506.06988v2) |
| Agüera y Arcas (2025), *What Is Intelligence?*, capítol 1 | BFF | En línia, el 12-11-2026 (whatisintelligence.antikythera.org), amb una eina que en resumeix el text: les seccions sobre BFF |
| Peng, Linderoth i Baum (2022) | Xarxes de reaccions químiques | En línia, a PMC, el 12-11-2026, amb una eina que en resumeix el text: no l'hem llegit línia a línia. És la versió revisada del preprint de ChemRxiv que va proposar el responsable |
| Hickinbotham (2023) | Nanopond | El resum (OpenAlex, el 12-11-2026) |
| Pigozzi i Levin (2026) | GARD: conjunts de molècules que es reprodueixen per la composició | El resum (arXiv 2607.28250v2, el 12-11-2026) |
| Kinsler i altres (2017); Papale i Kulish (2025); Fischbacher (2025) | Polímers en compartiments; química prebiòtica; cinètica de seqüències | El resum (OpenAlex, el 12-11-2026), amb una eina que en reconstrueix el text |
| Pargellis (1996, 2001) | Amoeba | Parcial |
| Jha i altres (2026) | BFF i Z80, amb un cost energètic | Sencera, el 19-10-2026 |
| Cicala i altres (2026) | Z80, programes de 32 bytes | Sencera, el 19-10-2026 |
| Mathis i altres (2024) | AlChemy (càlcul λ) | El resum |

## Les afirmacions possibles, font per font

**Com es llegeix:** «hi és», ja publicat; «en part», hi ha una cosa semblant, però no la mateixa; «no hi surt», no és en el que hem llegit;
«no ho sabem», no n'hem llegit prou.

| | L'afirmació | 2024 | Knierim (2026) | Greenbaum i Pargellis (2016) | C G (2017) | Adami i LaBar (2017) | Jha (2026) | Estat a Genesis |
|---|---|---|---|---|---|---|---|---|
| A1 | La sopa sense vida de BFF deriva per un camí comú cap a una composició rica en instruccions (el `<`, deu vegades l'atzar). A BFF, Agüera y Arcas (2025) ja hi descriu fragments curts que es copien des del començament | En part: abans de la transició l'HOE puja i els bytes diferents baixen; cap freqüència de bytes | En part: la distribució dels bytes que la sopa escriu poc abans que la prengui un replicador; sense el curs en el temps ni el mecanisme | **Hi és, a Amoeba:** el joc d'instruccions s'esbiaixa sempre, de 25 instruccions efectives a unes 20 en les primeres 50.000 generacions, mesurat amb l'entropia de les instruccions soles (la mateixa mena de mesura que la nostra D); abans dels replicadors hi pugen les que fan servir (els NOP, des d'unes 70.000 generacions abans, i el MALL) | No hi surt: no hi ha cap sopa sense replicadors | En part, com a hipòtesi que no proven: l'activitat de molècules que no es copien canviaria la composició dels monòmers | No hi surt | Exploratori (entrada 16) |
| A2 | La sopa envellida té menys programes que es copien que una de nova: les instruccions s'amunteguen en pocs programes | No hi surt | No hi surt. La seva comparació (la sopa troba replicadors 2 a 4 vegades més de pressa que una cerca amb el seu histograma) és una altra mesura | No hi surt: no compten quants programes es copien abans dels replicadors | No hi surt | No hi surt. És el contrapunt (vegeu sota): amb una composició propera a la dels replicadors, en troben 250 vegades més, però en seqüències a l'atzar, sense disposició | No hi surt | Exploratori (entrada 16; l'auditor 1, AUD-122), amb la prova del cens, que té falsos positius (A6) |
| A3 | A igual temps des d'una sopa neta, la vida s'estableix més sovint en una sopa envellida | No hi surt: cap prova a una edat fixada | No hi surt | **No hi surt, i a Amoeba el temps hi juga en contra:** gairebé la meitat de les aparicions són del primer milió de generacions, i després la probabilitat baixa; una de les causes, diuen, és que els NOP continuen pujant. És la distribució dels temps d'aparició de 49 tirades, sense cap prova a una edat fixada | No hi surt | En part, com a hipòtesi que no proven: si la composició canvia «en la bona direcció», els replicadors podrien ser inevitables. Ho proposen per a sistemes com Avida | No hi surt | **Confirmat** (entrada 14, preregistrat) |
| A4 | L'establiment és un esdeveniment d'atzar: dues branques d'un mateix món s'estableixen de manera independent | No hi surt | No hi surt | No hi surt: 49 tirades independents, sense branques | No hi surt. Una pregunta veïna: quan competeixen tots els replicadors mínims, qui pren la població depèn poc de l'atzar (tres genotips, el 65 % de les 200 rèpliques) | No hi surt | No hi surt | Exploratori (entrada 16) |
| A5 | El `<` s'acumula per la regla del primer byte (el cap d'escriptura comença al primer byte, i un `<` el porta al final del company) | No hi surt | No hi surt | Un anàleg, no el mateix: els «propagadors», bucles de còpia que no s'acaben (no fan cap fill) i escampen per la memòria les seves instruccions i d'altres. Els dedueixen de les freqüències de parelles; no segueixen qui escriu cada instrucció | No hi surt | No hi surt | No hi surt | Exploratori (l'auditor 1); el pas 2a ho mesura, seguint qui escriu cada byte |
| A6 | Una prova de replicació amb companys de soroll dona falsos positius quan s'escaneja una sopa sencera | No hi surt (no ho hem buscat) | No hi surt (no ho hem buscat) | No hi surt. Hi expliquen una dificultat veïna: saber quan apareix un ancestre (en registren un quan es copia fidelment quatre generacions) | No hi pot sortir: a Avida, la prova es fa amb el programa sol | No hi pot sortir, per la mateixa raó | — | Exploratori (entrada 16) |
| A7 | La maduració actua sobre l'arrelament dels replicadors, no sobre la seva aparició | No hi surt | En part: sense fusions, els replicadors apareixen però no prenen la sopa | No hi surt cap prova. La seva explicació actua sobre l'aparició: els replicadors apareixen quan la densitat de blocs és prou alta | En part: separen que hi hagi replicadors (un de cada 200 milions de programes de 8 instruccions) de qui pren la població quan n'hi ha molts (els de més eficàcia). Hi compta el replicador, no l'estat de la sopa | No hi surt. La seva hipòtesi actua sobre l'aparició (la probabilitat de trobar un replicador per atzar) | En part: proves d'invasió amb llinatges evolucionats, sembrats a l'1 % en una sopa nova (A.2); no amb un fundador acabat de néixer | **Per provar** (el pilot) |

**Cicala i altres (2026), Mathis i altres (2024) i Peng, Linderoth i Baum (2022)** no tracten cap d'aquestes afirmacions: la coevolució
de la còpia amb una tasca; les organitzacions d'AlChemy; i, en xarxes de reaccions químiques, els sistemes autocatalítics que només
s'engeguen amb una espècie iniciadora (*seed*), organitzats en nivells: quan un nivell és actiu, el següent es pot iniciar amb espècies
més senzilles. Aquesta idea és una manera de pensar A7 (l'estat de la sopa decideix què hi pot arrelar), no un precedent: és una anàlisi
de la topologia de les xarxes, sense temps ni ritmes.

**El que diuen les altres fonts (12-11-2026):**
- **Greenbaum i Pargellis (2016), sencera.**
  - **El sistema:** Amoeba-IV, 1,2 milions d'instruccions en 500 bandes, amb 25 instruccions i adreces de NOP, com a Tierra. A cada
    generació hi entren seqüències curtes a l'atzar.
  - **Les fases:** primer, el joc d'instruccions s'esbiaixa; després s'escampen blocs curts, i hi apareixen proto-replicadors ineficients;
    i, a la meitat de les tirades (25 de 49), un replicador que evoluciona de pressa. Després, sempre domina una sola espècie.
  - **Les mesures:** l'entropia de les instruccions soles, la informació mútua de les parelles i les freqüències de seqüències de *n*
    instruccions.
  - **El cas que descriuen amb detall** (l'aparició, a unes 292.000 generacions): els NOP pugen des d'unes 70.000 generacions abans, i el MALL
    també; les parelles del bucle de còpia, des d'unes 50.000 abans. El màxim creixement de la informació mútua coincideix amb l'aparició.
  - **La disposició:** a la imatge de la memòria hi veuen tirades d'una mateixa instrucció, com les de `<<`, `>>` i `}}` del pas 1, però
    no les quantifiquen.
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
  - **La màquina d'escriure esbiaixada:** amb 15 instruccions, una cerca uniforme troba 58 replicadors en mil milions de seqüències; amb
    la composició d'aquests 58, 14.495, unes 250 vegades més (la seva aproximació en preveia 81). El biaix ha de ser proper al dels
    replicadors: no n'hi ha prou que baixi l'entropia, i amb 8 instruccions el biaix de les de 15 en troba 15 vegades menys que el propi.
    Si es torna a esbiaixar amb els replicadors trobats, en surten més, però cada vegada menys.
  - **La hipòtesi del final, que no proven:** en una química on les molècules no es copien però en fan d'altres, la seva activitat canvia
    la composició dels monòmers, i amb ella la probabilitat que apareguin replicadors. Si va «en la bona direcció», els replicadors
    podrien ser inevitables. Diuen que es podria provar en sistemes com Avida. **És la idea de la línia, escrita com a hipòtesi.**
  - **El contrapunt d'A2, i una prova d'aquesta hipòtesi a BFF** (exploratòria, el pas 1, P5). La sopa envellida barrejada és una màquina
    d'escriure esbiaixada amb la composició que la sopa s'ha fet ella mateixa, i hi coincideix: 706 cel·les que es repliquen, sis vegades
    les d'una sopa nova (118). La composició va en la bona direcció. Però la sopa tal com és en té 23, cinc vegades menys que una de nova:
    la disposició ho desfà. I tot i així, la vida s'hi estableix més sovint (A3). Si la maduració ajuda, no deu ser per l'aparició, com
    proposen ells, sinó per l'arrelament (A7).
  - **La reserva:** aquests recomptes són de la prova del cens, amb companys de soroll, que dona falsos positius (A6; i els 37 hereditaris
    de bytes uniformes de B1 no es copien sols). Abans de fer servir el contrapunt, cal tornar a comptar les tres sopes amb companys inerts.
- **Agüera y Arcas (2025), capítol 1:** a BFF, des del començament apareixen replicadors imperfectes, «trossos molt curts de codi», i el
  replicador sencer es forma per fusió de replicadors més petits («simbiosi multifractal»). Hi tracta cada instrucció com un replicador
  «atòmic». No diu quins bytes s'acumulen, no fa cap intervenció i no parla de l'edat de la sopa. **És un precedent a BFF de la idea
  general (A1) i, en part, del mecanisme (A5).**
- **Knierim i altres (2026),** ja a la bibliografia: si es bloquegen les fusions, els replicadors continuen apareixent però no prenen la
  sopa. **Aparèixer i prendre la sopa tenen requisits diferents: és un precedent de la pregunta d'A7**, encara que no en mesurin cap ritme
  ni hi intervinguin amb l'edat.
- **Pigozzi i Levin (2026), pel resum:** al model GARD, una mesura de l'organització causal del medi abans dels replicadors en prediu la
  replicació posterior millor que les mesures de la dinàmica molecular, i les intervencions que la pugen augmenten la persistència i
  l'abundància de la replicació (les que la baixen, al revés). **És el precedent més proper d'una intervenció en l'estat d'abans dels
  replicadors,** però en un model químic, sense cap sopa de programes ni cap edat del medi. Pel resum, no separen l'aparició de la
  persistència.
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
    Agüera y Arcas, 2025, a BFF);
  - la hipòtesi que l'activitat d'abans dels replicadors en canvia la composició i els fa més probables (Adami i LaBar, 2017, proposada
    sense provar-la), i que una composició propera a la dels replicadors en multiplica la probabilitat (ells mateixos, a Avida);
  - que el joc d'instruccions s'esbiaixa sempre pel mateix camí, i la mesura amb què ho veiem, l'entropia de les instruccions soles
    (A1; Greenbaum i Pargellis, 2016);
  - que la distribució dels bytes importa a BFF (Knierim i altres, 2026);
  - que aparèixer i prendre la població són dues coses (Knierim i altres, 2026; C G i altres, 2017, a Avida);
  - que una intervenció en l'organització d'abans dels replicadors en canviï la persistència i l'abundància (Pigozzi i Levin, 2026, en
    un model químic, pel resum).
- **Podria ser nou a BFF:**
  - **A3,** ja confirmada: a una edat fixada, la vida s'estableix més sovint en una sopa envellida. És una prova, a BFF i amb un control, de
    la hipòtesi d'Adami i LaBar. A Amoeba, el temps hi juga en contra (Greenbaum i Pargellis, 2016, sense prova a una edat fixada): que la
    maduració ajudi no és general, i depèn del sistema.
  - **A2,** amb el contrapunt de la màquina d'escriure esbiaixada: els bytes de la sopa envellida, barrejats, fan sis vegades més cel·les
    que es repliquen que una sopa nova; tal com són, cinc vegades menys. Si és nou, és que la disposició desfà el que la composició faria.
    Cal tornar-ho a comptar amb companys inerts.
  - **A4** (l'atzar de l'establiment) i **A5** (un mecanisme concret). D'A5, Greenbaum i Pargellis en tenen un anàleg, els propagadors,
    que dedueixen de freqüències; el pas 2a segueix qui escriu cada byte.
  - **I, sobretot, A7** (on actua la maduració), que és el que la línia vol provar. Greenbaum i Pargellis, i Adami i LaBar, ho expliquen
    per l'aparició; la nostra hipòtesi és l'arrelament.
- **El més segur de tot és metodològic** (A6), però és petit, i és propi de BFF: a Avida la prova es fa amb el programa sol.

## El que falta abans de dir res

1. **Tornar a comptar les cel·les que es repliquen** de les tres sopes (la nova, l'envellida i la barrejada) amb companys inerts, com la
   prova d'autonomia de B1. Sense això, el contrapunt d'A2 i la prova de la hipòtesi d'Adami i LaBar no es poden fer servir. Pel carril
   d'explorar, sense simular: n'hi ha prou amb les captures.
2. **La lectura sencera de Pigozzi i Levin (2026)** (arXiv 2607.28250, obert): si separen l'aparició de la persistència, A7 hi té un
   precedent més proper, encara que en un model químic.
3. **Una cerca més àmplia,** amb Google Scholar, que des d'aquí no hem pogut fer servir, i amb els preprints que OpenAlex no lliga.
4. **La consulta als dos auditors** (X-105), amb el PDF de la versió de 2016.
5. **Una persona del camp** que llegeixi aquesta matriu (els criteris del 05-11-2026).
6. **Una pregunta per al carril d'explorar, de C G i altres:** quan les dues branques d'un mateix món s'estableixen totes dues, ho fan amb
   la mateixa família dominant? Si és així, la família ja hi era abans de la branca, i això diria alguna cosa d'A7. Al pas 1 hi ha 23 mons
   amb la vida a totes dues branques (7, 12 i 4): poca potència, i es podria mirar sense simular si els registres guarden prou de cada
   família.

**Ja fetes, el 12-11-2026:**
- **La lectura sencera de Greenbaum i Pargellis (2016).** Respon la pregunta que s'hi feia: s'hi acumulen els NOP, el MALL i les parelles
  del bucle de còpia; s'escampen amb propagadors; i no ho proven amb cap intervenció.
- **La d'Adami i LaBar (2017),** que ha resultat el precedent més proper de la hipòtesi de la línia.
- **Una primera cerca datada,** amb les citacions a OpenAlex i dues cerques generals (a dalt).
