# Estat de la qüestió · Genesis

**Per a què serveix.** Situa el projecte en el que ja s'ha fet: què se sap, què no, i què vol dir per als
nostres experiments. Respon a AUD-39 de l'auditoria 2 i a B4 del pla de la iteració 4. Data:
18-10-2026.

**Revisat el 19-10-2026** amb una revisió de novetat de les candidates a resultat (X-020; §11). Els articles
de 2024 i de Knierim, Cicala i Jha (2026) s'han tornat a llegir sencers. S'hi han corregit cinc coses:
- l'enverinament per zeros ja és a l'article de 2024 (§1 i §3);
- el 40 % de 2024 és de la transició, no de l'aparició (§1);
- què compara Knierim i altres amb la sopa (§1 i §2);
- l'ablació de LDIR de Cicala i altres (§2);
- la CNP de Cicala i altres és el mateix mecanisme que el nostre corrent (§4).

**Com s'ha fet.** Les referències s'han comprovat una per una al registre del DOI (Crossref), a PubMed, a
la pàgina d'arXiv o a la pàgina dels autors.
- Les que porten **(parcial)** tenen les dades bibliogràfiques comprovades, però el contingut surt de
  fonts secundàries, perquè no s'ha pogut llegir l'article.
- Els treballs del 2026 són **preprints sense revisió**. Els quatre més rellevants per al projecte, a més,
  s'han comprovat a mà a arXiv.
- Els resums de cada treball són nostres, no cites.

---

## 1. On encaixa el projecte

**Química artificial.** La idea que la vida pot aparèixer sola en una "química" de programes ve de lluny:
- el *Turing gas* de Fontana (1991), on els objectes són expressions de càlcul λ que es reescriuen
  entre elles;
- **AlChemy** (Fontana i Buss, 1994), on apareixen espontàniament hipercicles d'objectes que es copien;
- **Coreworld** (Rasmussen i altres, 1990), on els replicadors de dues instruccions envaeixen la memòria
  (parcial);
- **Amoeba** (Pargellis, 1996, 2001; Greenbaum i Pargellis, 2017), on la memòria aleatòria
  s'autoorganitza fins que hi apareixen replicadors.

Fora dels programes, el mateix fenomen s'ha vist en una química de molècules en 2D (Squirm3, Hutton
2002), en una de lògica combinatòria (Kruszewski i Mikolov, 2021) i en models químics generals (Liu i
Sumpter, 2018).

**El contrast: Tierra i Avida.** Tierra (Ray, 1991) i Avida (Adami i Brown, 1994; Ofria i Wilke, 2004)
són el contrari del que fem nosaltres: hi comença un ancestre escrit a mà, i el que s'estudia és
l'evolució. Tot i així, n'ha sortit molt coneixement útil:
- el llenguatge importa, sobretot la robustesa a les mutacions (Ofria i altres, 2002; Bryson i Ofria,
  2013);
- a ritmes de mutació alts guanyen els genotips robustos, no els ràpids (Wilke i altres, 2001);
- l'èxit d'un replicador mínim depèn molt d'on és a l'espai de programes (C G i altres, 2017).

**BFF.** El punt de partida directe és *Computational Life* (Agüera y Arcas i altres, 2024):
- en una sopa de 2¹⁷ programes de 64 bytes, sense cap ancestre, els replicadors apareixen, sobretot per
  automodificació. En un 40 % de les sopes hi ha, en 16.000 èpoques, una transició d'estat: els replicadors
  prenen la sopa. El 40 % és de la transició, no de la primera aparició;
- la seva figura 2 ja descriu l'enverinament per zeros. Un primer replicador que no tolera els zeros
  (*non-zero-tolerant*) passa per un període de *zero-poisoning*, i després una família nova pren la sopa;
- en una versió en 2D (240 × 135), també apareixen, però s'escampen com una ona i diverses variants hi
  conviuen;
- Forth, Z80 i 8080 també fan replicadors; SUBLEQ, no.

La Fase 1 del projecte reprodueix aquest resultat.

**El que ha vingut després (2024–2026).** El mateix grup i d'altres han continuat:
- **Mathis i altres (2024)** han refet AlChemy amb ordinadors d'ara. Les organitzacions estables hi
  apareixen més sovint del que es pensava, però no es combinen fàcilment en organitzacions d'ordre
  superior.
- **Knierim i altres (2026), preprint,** sostenen que una cerca a l'atzar, amb una bona distribució de bytes,
  explica l'aparició dels replicadors BFF. També mostren que, si es limita com es combinen els programes,
  els replicadors continuen apareixent però ja no envaeixen la sopa.
  - **La comparació concreta** (la seva taula 1, amb la variant `bff_selfmove`): la sopa troba un replicador
    cada ~5·10⁶ programes.
  - **La mutació a l'atzar,** amb la distribució dels bytes que escriu la mateixa sopa i a un ritme de canvi
    semblant, en necessita 1,0–1,9·10⁷, 2 a 4 vegades més.
  - **Aquest factor el calculem nosaltres:** l'article no el dona. Comparem programes provats amb programes
    provats: els de la taula 1 amb els ~5·10⁶ de l'experiment 3.1, que l'article també dona com a ~2,5·10⁶
    interaccions de dos programes (AUD-92).
  - **Només superen la sopa** el remostreig complet de cada cinta i les distribucions fetes a mà (CUST i
    CUST64).
  - **La distribució de la sopa** (ℬℱℱ, la seva definició 3.3) és la dels bytes que la sopa escriu, comptant
    només els canvis que duren, i es va mesurar poc abans que un replicador la prengués, és a dir, ja madura. No
    és el contingut de la sopa. *(Corregit el 05-11-2026, auditoria 27: dèiem «l'histograma de la sopa».)*
  - **La cerca a l'atzar** (els experiments 3.2 i 3.4): fins al primer replicador, 2,9·10⁷ programes de
    mitjana amb bytes uniformes, i 1,7·10⁶ amb ℬℱℱ, unes 17 vegades menys. Amb CUST, 4,5·10⁵, i amb CUST64,
    9,4·10⁴ (els experiments 3.6 i 3.8). Els factors també els calculem nosaltres (AUD-173).
- **Cicala i altres (2026), preprint,** fan sopes de programes Z80 de 32 bytes, repartides en nínxols. Hi
  la replicació i la resolució de tasques evolucionen juntes, i la pressió per calcular afavoreix els
  replicadors compactes, que deixen memòria lliure.
- **Jha i altres (2026), preprint,** hi afegeixen un cost energètic compartit. Robar s'autolimita quan
  l'energia escasseja, i l'agrupament espacial ajuda la cooperació.

## 2. Pregunta 1: quines propietats de la química calen

**Que el llenguatge sigui universal no n'hi ha prou.**
- Cotler, Hongler i Hudcová (2025) construeixen un autòmat cel·lular universal en què no hi pot haver
  autoreplicació no trivial.
- SUBLEQ, que també és universal, no fa replicadors. El més petit que s'ha escrit a mà fa uns 60 bytes,
  i els autors creuen que la mida mínima d'un replicador és decisiva (Agüera y Arcas i altres, 2024).

**El que sembla decidir-ho és com de curts i com d'abundants són els replicadors a l'espai de
programes.** Knierim i altres (2026) proven dues distribucions de bytes fetes a mà, que fan més fàcil trobar
replicadors:
- CUST: la meitat dels bytes, instruccions, i l'altra meitat, bytes sense efecte;
- CUST64: a més, el byte 64, perquè els dos caps puguin començar a 64 posicions l'un de l'altre.

Fan servir la variant `bff_selfmove`, que només té una operació de còpia. *(Corregit el 19-10-2026: dèiem
que el ritme depenia "sobretot de tres coses", i la tercera, les operacions que faciliten la còpia, no
l'estudien.)*

**Les instruccions de còpia compten.** Si a Z80 es treu la família d'instruccions de còpia en bloc (LDIR), la
transició des dels primers replicadors (Load–Push) cap a un de compacte (LDD) és molt lenta. Sense pressió de
tasques, no s'acaba en 10⁷ èpoques; amb pressió de tasques, sí (Cicala i altres, 2026). *(Corregit el
19-10-2026: dèiem que els replicadors tardaven més a aparèixer.)* A
Avida, la majoria de canvis al joc d'instruccions no tenen cap efecte consistent. Ajuden els que fan més
flexibles les interaccions entre instruccions (Bryson i Ofria, 2013).

**Què vol dir per a B1 (les ablacions).**
- Knierim i altres ja apunten quines propietats importen. Les nostres ablacions haurien d'incloure
  variants de la densitat d'instruccions i de l'alineació dels caps, a més de les de la taula de
  l'auditoria 8.
- Com que la cerca a l'atzar amb una bona distribució troba replicadors (encara que, amb l'histograma de la
  sopa i al seu ritme de canvi, 2 a 4 vegades més a poc a poc que la sopa), convé separar dues coses:
  quines propietats fan que un replicador **existeixi i sigui curt**, i quines fan que, un cop
  aparegut, **s'estableixi**.

## 3. Pregunta 2: de què depèn que la vida s'estableixi i es mantingui

**Origen i establiment són passos diferents.**
- A Knierim i altres (2026), limitar la combinació de programes atura la invasió, però no l'aparició.
- A Avida, l'èxit es concentra en pocs progenitors (C G i altres, 2017).
- Encaixa amb la distinció del nostre protocol, que mesura l'establiment i no l'aparició. Però cal
  vigilar amb les comparacions directes. El que ells anomenen "aparició" és trobar algun replicador
  enlloc. Nosaltres, amb el cens, en mostrem 2.048 cel·les de 131.072 (l'entrada 7 ja advertia que "no
  detectat" no vol dir "absent").

**Els primers replicadors sovint duren poc.**
- El replicador sembrat a Coreworld es va extingir (parcial).
- Els de Kruszewski i Mikolov eren transitoris.
- A BFF, n'hi ha que s'extingeixen abans d'envair la sopa (Knierim i altres, 2026).
- Les famílies se succeeixen, a Z80 i a BFF, on els zeros enverinen la sopa. Ho descriu l'article de 2024
  (fig. 2), i ho vam retrobar a l'entrada 2. *(Corregit el 19-10-2026: no citàvem l'article de 2024.)*
- **La història d'un llinatge** en condiciona el destí: si se'n sembra un 1 % en una sopa nova, la fixació
  depèn de la història evolutiva. Els llinatges evolucionats en sopes ben barrejades i amb molta energia
  s'hi desfan (Jha i altres, 2026, apèndix A.2).

**L'espai protegeix dels paràsits.**
- En un autòmat cel·lular, els hipercicles s'organitzen en espirals, i els paràsits en queden fora
  (Boerlijst i Hogeweg, 1991; parcial).
- En un sistema de replicació d'ARN real, la barreja total fa que el paràsit extingeixi l'hoste. En
  compartiments, oscil·len i coevolucionen (Bansho i altres, 2016).
- Alternar compartiments i barreja impedeix que els paràsits ho envaeixin tot (Matsumura i altres,
  2016).
- En l'espai, fins i tot els paràsits forts poden accelerar l'evolució dels replicadors (Colizzi i
  Hogeweg, 2016).

**Un buit que B2 pot omplir.** No hem trobat cap distribució publicada de la durada dels primers
replicadors en sopes com BFF. Si no ens hem deixat res, B2 respon una pregunta que no té resposta.

## 4. El corrent: la barreja ajuda o perjudica?

A la literatura, la barreja no té un efecte en una sola direcció:
- **La dispersió local manté la diversitat:** tres soques d'E. coli que competeixen en cicle només
  conviuen si la dispersió és local (Kerr i altres, 2002).
- **Hi ha una mobilitat crítica:** per sota, les espècies conviuen en espirals; per sobre, se'n perden
  (Reichenbach, Mobilia i Frey, 2007).
- **L'espai pot perjudicar la cooperació,** en el joc del *snowdrift* (Hauert i Doebeli, 2004) i en la
  simbiosi digital (Vostinar i Ofria, 2018).
- **En sopes de programes:**
  - en 2D, els replicadors tarden més a envair-ho tot i les variants conviuen (Agüera y Arcas i altres,
    2024). En una sopa ben barrejada, un replicador en pren la meitat en unes log *n* èpoques, i en 2D, en
    un temps proporcional al costat de la graella;
  - amb nínxols, un ritme intermedi d'aparellaments entre nínxols resol més tasques que no barrejar-los
    gens o barrejar-los molt (Cicala i altres, 2026). La seva "pol·linització entre nínxols" (CNP) és el
    mateix mecanisme que el nostre corrent: amb una probabilitat de 0,05, el company s'escull a l'atzar en
    tota la població. Però no en mesuren l'expansió, només les tasques.

**Què vol dir per al projecte.** Que la barreja tingui un efecte no monòton és coherent amb el resultat no
concloent de la sèrie de la llei 2, i dona força a la proposta de l'auditor 1 de fer una **corba
dosi-resposta**, amb diversos nivells de barreja, en lloc de comparar-ne només dos.

## 5. La mida del món

**N'hi ha poca evidència directa.**
- En autòmats cel·lulars, Chou i Reggia (1997) diuen que l'aparició de replicadors no depèn de la mida de
  l'espai (parcial: només n'hem vist un extracte).
- Knierim i altres (2026) diuen que altres mides de sopa donen resultats semblants, però no les
  estudien de manera sistemàtica.
- Cicala i altres (2026) troben que el repartiment en nínxols importa més que la mida total.

**Una predicció, no comprovada enlloc.** Si trobar un replicador és, de fet, mostrejar programes, com
sostenen Knierim i altres, el temps fins al primer hauria de dependre del nombre d'execucions. Un món més
gran només els trobaria abans per època. Però la nostra observació que el ritme d'establiment creix amb
l'edat del món (AUD-64) suggereix que també hi intervé la "maduració" de la sopa.

**Què vol dir per al projecte.** B3 respondria una pregunta oberta, amb el disseny que van proposar els
auditors: comparar a la mateixa edat, amb el logaritme de l'àrea com a *offset*.

## 6. El temps variable

**Els entorns que canvien acceleren l'evolució:**
- Kashtan i Alon (2005) i Kashtan, Noor i Alon (2007) ho veuen amb objectius canviants, sobretot quan
  canvien per mòduls. Un contrapunt: la modularitat també pot sorgir només d'un cost de les connexions
  (Clune, Mouret i Lipson, 2013).
- A Avida, els entorns cíclics fan les poblacions més evolucionables (Canino-Koning, Wiser i Ofria, 2019).

**A l'origen de la vida:**
- els cicles d'humitat i sequera de les basses termals concentren i polimeritzen molècules (Damer i
  Deamer, 2015, 2020);
- amb cicles repetits, els polímers s'allarguen a poc a poc (Higgs, 2016);
- els canvis cíclics seleccionen pocs heteropolímers (Tkachenko i Maslov, 2018);
- les pertorbacions periòdiques (Colizzi i Hogeweg, 2016) i la barreja intermitent (Matsumura i altres,
  2016) ajuden els sistemes de replicadors.

**Un buit.** No hem trobat cap estudi de lleis que canviïn amb el temps en sopes com BFF. El que més s'hi
acosta és un objectiu de tasques que es mou (Cicala i altres, 2026).

**Què vol dir per al projecte.** La proposta del temps variable del responsable del projecte és nova en
aquest tipus de sistema. Té dos bons referents: la barreja intermitent de Matsumura i altres i les
pertorbacions de Colizzi i Hogeweg.

## 7. Compartiments, minerals i espai buit

- **El corrector estocàstic** (Szathmáry i Demeter, 1987). Els replicadors competeixen dins de
  compartiments, i la divisió a l'atzar manté a ratlla els egoistes.
- **Els compartiments inorgànics** de les fumaroles: els gens van evolucionar en xarxes de cel·les de
  sulfur de ferro (Martin i Russell, 2003; Koonin i Martin, 2005), i els gradients tèrmics dels porus
  concentren molècules en molts ordres de magnitud (Baaske i altres, 2007).
- **Replicadors lligats a una superfície mineral:** milloren en fidelitat i eficiència fins i tot amb
  paràsits (Szabó i altres, 2002).
- **Compartiments experimentals:** l'argila accelera la formació de vesícules, que creixen i es divideixen
  (Hanczyc, Fujikawa i Szostak, 2003).
- **Cèl·lules abstractes:** en una química artificial, un metabolisme construeix la seva pròpia membrana
  (Ono i Ikegami, 2000; Hutton, 2007).
- **Un anàleg de l'espai buit en sopes de programes:** la pressió per calcular afavoreix els replicadors
  compactes, que deixen memòria lliure (Cicala i altres, 2026). Té a veure amb la idea del responsable de
  la matèria lliure contra la sobreescriptura.

**Què vol dir per al projecte.** La llei 7 (minerals) té un fonament sòlid. La idea de l'espai buit
també, però demana una química nova, com ja deia l'auditoria 8.

## 8. Simbiosi i transicions evolutives

- **Les transicions evolutives majors** (Maynard Smith i Szathmáry, 1995) i la seva revisió de 2015, que
  separa l'origen, el manteniment i la transformació de cada transició (Szathmáry, 2015).
- **Simbiosi digital:** l'espai pot reduir el mutualisme, perquè, en eliminar els paràsits, elimina també
  la diversitat de simbionts (Vostinar i Ofria, 2018).
- **Cooperació en sopes Z80:** quan l'energia escasseja, robar s'autolimita (Jha i altres, 2026).
- **Coevolució:** la coevolució d'hostes i paràsits fa créixer la complexitat (Zaman i altres, 2014).
- **Experiments amb ARN real:**
  - un replicador d'ARN es diversifica en una xarxa cooperativa de cinc llinatges (Mizuuchi, Furubayashi
    i Ichihashi, 2022);
  - els paràsits neixen dels errors de còpia de l'hoste (Furubayashi i altres, 2020).
- **Els límits:** a AlChemy, les organitzacions no es combinen fàcilment (Mathis i altres, 2024).

## 9. Pregunta 4: els resultats són generals?

**Hi ha replicadors espontanis en moltes químiques:**
- llenguatges de programació: BFF, Forth, Z80 i 8080 (Agüera y Arcas i altres, 2024; Cicala i altres,
  2026);
- memòries de propòsit general: Amoeba;
- molècules 2D: Squirm3;
- lògica combinatòria: Kruszewski i Mikolov;
- autòmats cel·lulars: Chou i Reggia, 1997, parcial; els *evoloops* de Sayama, 1999. Vegeu-ne la revisió
  de Sayama i Nehaniv (2025).

**No en surten a SUBLEQ ni a RSUBLEQ4.** Que un resultat sigui "general" vol dir, doncs, que no depengui
de detalls concrets de BFF dins d'aquesta família de químiques. És el que han de dir les ablacions (B1).

## 10. Què canvia per al projecte

1. **B2 omple un buit.** No hem trobat distribucions publicades de quant dura la vida establerta en sopes
   com BFF.
2. **B3 també:** la dependència de la mida no s'ha estudiat de manera sistemàtica. Knierim i altres donen
   una predicció (el nombre d'execucions), i la nostra observació de la maduració (AUD-64) n'apunta una
   altra.
3. **B1 es pot afinar** amb el que ja han trobat Knierim i altres: la densitat d'instruccions i l'alineació
   dels caps. *(Corregit el 19-10-2026: n'hem tret "les operacions que faciliten la còpia", que no
   estudien. L'article ja s'ha llegit sencer.)*
4. **La corba dosi-resposta del corrent** té el suport d'una literatura en què la barreja té efectes no
   monòtons.
5. **El temps variable** és nou en aquests sistemes, i té bons referents.
6. **Una precaució.** Els treballs del 2026 són preprints, i alguns resultats (per exemple, que la cerca a
   l'atzar expliqui l'aparició) caldria que els comprovéssim nosaltres abans de recolzar-nos-hi.

## 11. La novetat de les candidates (19-10-2026)

**Per a què serveix.** Per fer públic el projecte, el responsable demana un descobriment nou, encara que sigui
petit (X-020). Els dos auditors demanen comprovar abans la novetat de cada candidata, amb les fonts (X-021,
X-022). La revisió es va fer el 19-10-2026. Les afirmacions clau s'han comprovat al text de 2024 i al de
Knierim, Cicala i Jha (2026).

**Què vol dir "no l'hem trobat"** (AU2-69, auditoria 10). Vol dir que no surt a les fonts que hem revisat; no
demostra que no existeixi. No és una revisió sistemàtica. Abans de cap afirmació pública de novetat, cal fer una
matriu comparativa amb els textos originals i una revisió humana especialitzada. Dos antecedents ja limiten les
formulacions generals: la fase d'autoorganització prèvia de Greenbaum i Pargellis (2017) i la independència de la
mida que diuen Chou i Reggia (1997) (§5).

**1. L'enverinament per zeros i el successor resistent: conegut.**
- **Què ja se sap:** l'article de 2024 en descriu el fenomen i el relleu (fig. 2, §1). A Z80 hi ha
  successions semblants, però les atribueixen a la robustesa i a l'espai lliure (Cicala i altres, 2026).
- **Què seria nou:** la prova causal amb una intervenció des d'una mateixa captura, amb un control simulat, i
  la freqüència del fenomen entre mons, en 2D. Seria una nota curta, no un descobriment.

**2. La maduració de la sopa, o el mostreig: hi ha lloc per a un resultat nou.**
- **Què ja se sap:**
  - la idea d'una fase prèvia en què la sopa s'organitza, i la mesura amb què ho veiem, l'entropia de les instruccions soles
    (Greenbaum i Pargellis, 2016 i 2017);
  - que una composició propera a la dels replicadors en multiplica la probabilitat, i la hipòtesi, que no proven, que l'activitat
    d'abans dels replicadors pot canviar la composició en aquesta direcció (Adami i LaBar, 2017, a Avida);
  - que una intervenció en l'organització d'abans dels replicadors en canviï la persistència, sense canviar el temps fins al primer
    replicador (Pigozzi i Levin, 2026, en un model químic; la consulta X-105);
  - seguir l'origen de cada byte a cada còpia (els *tokens* de l'article de 2024);
  - que la distribució de bytes importa (Knierim i altres, 2026).
- **Des de l'11-11-2026, la línia del projecte** (`docs/disseny.md`). La matriu de novetat de les seves afirmacions possibles, font per
  font, és a `docs/novetat-maduracio.md` (esborrany del 12-11-2026).
- **Què no hem trobat enlloc:** cap prova a una edat fixada, que continuï, barregi o reiniciï la sopa. Del risc
  d'aparició segons l'edat, només la distribució dels temps d'aparició d'Amoeba, on baixa amb el temps (Greenbaum
  i Pargellis, 2016), al revés que el ritme d'establiment a BFF (l'entrada 16). La cerca datada del 12-11-2026 és a
  `docs/novetat-maduracio.md`.
- **Per què hi ha lloc:** les dades de Knierim i altres ho permeten. Amb el seu propi histograma, ja madur, i al
  seu ritme de canvi, la mutació a l'atzar és 2 a 4 vegades més lenta que la sopa, segons un càlcul nostre (§1).
  Aquesta diferència podria ser l'estructura que la sopa ha acumulat.
- **La prova que la separaria:** a una edat fixada, en mons sense replicadors, fer branques que continuïn, que
  barregin els bytes (amb el mateix histograma) o que reiniciïn la sopa.
- **El que hi tenim:** un indici feble, només als mons quiets de la llei 2. El ritme d'aparició passa de 2,8 a
  5,3 per 100.000 mon-èpoques, de la primera meitat a la segona (*p* ≈ 0,06). Als mons amb corrent no canvia.

**3. El corrent accelera l'expansió: conegut.**
- **Què ja se sap:**
  - és el que preveu la teoria dels fronts amb dispersió a distància (Fisher, 1937; Shigesada, Kawasaki i
    Takeda, 1995; Kot, Lewis i van den Driessche, 1996; Hallatschek i Fisher, 2014);
  - el cas extrem, ben barrejat contra 2D, ja és a l'article de 2024 (§4);
  - la CNP de Cicala i altres (2026) és el mateix mecanisme, tot i que no en mesuren l'expansió.
- **Què hi aporta B2:** la segona prova de la sèrie (`docs/protocol-b2.md`, §6.3) en mesura la mida, de manera
  preregistrada i aparellada. És una confirmació, no un descobriment.

**4. La persistència i el canvi de llei: en part, un buit.**
- **El buit, confirmat:** no hem trobat distribucions publicades de la durada de la vida BFF espontània (§3).
- **La dependència de la història** sí que té un precedent, amb proves d'invasió: replicadors de llinatges
  evolucionats, sembrats a l'1 % en una sopa nova (Jha i altres, 2026, A.2).
- **El que no hem trobat:** cap prova que canviar la llei del món, després que la vida s'hi hagi establert,
  n'alteri la persistència.

**El que no hem pogut comprovar nosaltres.** La revisió també apunta coses que encara no hem llegit a la font, i
que no s'han incorporat:
- el text sencer de Greenbaum i Pargellis (2017), que és de pagament (la versió de 2016 sí que l'hem llegida:
  `docs/novetat-maduracio.md`), i el de Chou i Reggia (1997);
- les inundacions periòdiques d'Hutton (2002), un precedent de lleis que canvien amb el temps;
- que els *evoloops* de Sayama (1999) són sembrats.

---

## Bibliografia

*Tots els treballs s'han comprovat al DOI, a PubMed o a arXiv, llevat dels que porten **(parcial)**.*

**Químiques artificials i sopes de programes**
- Rasmussen S, Knudsen C, Feldberg R, Hindsholm M (1990). The coreworld: emergence and evolution of cooperative structures in a computational chemistry. *Physica D* 42:111–134. doi:10.1016/0167-2789(90)90070-6 (parcial)
- Fontana W (1991/1992). Algorithmic chemistry. *Artificial Life II*, SFI vol. XI, Addison-Wesley, pp. 159–209. (Pendent de comprovar l'any i les pàgines.)
- Fontana W, Buss LW (1994). "The arrival of the fittest": toward a theory of biological organization. *Bull. Math. Biol.* 56:1–64. doi:10.1007/BF02458289
- Fontana W, Buss LW (1994). What would be conserved if "the tape were played twice"? *PNAS* 91:757–761. doi:10.1073/pnas.91.2.757
- Pargellis AN (1996). The spontaneous generation of digital "life". *Physica D* 91:86–96. doi:10.1016/0167-2789(95)00268-5 (parcial)
- Pargellis AN (1996). The evolution of self-replicating computer organisms. *Physica D* 98:111–127. doi:10.1016/0167-2789(96)00089-9 (parcial)
- Pargellis AN (2001). Digital life behavior in the Amoeba world. *Artificial Life* 7:63–75. doi:10.1162/106454601300328025
- Greenbaum B, Pargellis AN (2017). Self-replicators emerge from a self-organizing prebiotic computer world. *Artificial Life* 23:318–342. doi:10.1162/artl_a_00234 (el resum: el text és de pagament)
- Greenbaum B, Pargellis AN (2016). Digital replicators emerge from a self-organizing prebiotic world. *Proceedings of the Artificial Life Conference 2016 (ALIFE XV)*, pp. 60–67. doi:10.1162/978-0-262-33936-0-ch016 (sencer, el 12-11-2026)
- Agüera y Arcas B (2025). *What Is Intelligence? Lessons from AI About Evolution, Computing, and Minds.* Antikythera. https://whatisintelligence.antikythera.org (el capítol 1, en línia el 12-11-2026, amb una eina que en resumeix el text)
- Ray TS (1991). An approach to the synthesis of life. *Artificial Life II*, SFI vol. XI, pp. 371–408.
- Adami C, Brown CT (1994). Evolutionary learning in the 2D artificial life system "Avida". *Artificial Life IV*. arXiv:adap-org/9405003
- Ofria C, Wilke CO (2004). Avida: a software platform for research in computational evolutionary biology. *Artificial Life* 10:191–229. doi:10.1162/106454604773563612
- Hutton TJ (2002). Evolvable self-replicating molecules in an artificial chemistry. *Artificial Life* 8:341–356. doi:10.1162/106454602321202417
- Kruszewski G, Mikolov T (2021). Emergence of self-reproducing metabolisms as recursive algorithms in an artificial chemistry. *Artificial Life* 27:277–299. doi:10.1162/artl_a_00355
- Liu Y, Sumpter D (2018). Spontaneous emergence of self-replication in chemical reaction systems. *J. Biol. Chem.* 293:18854–18863. doi:10.1074/jbc.RA118.003795
- C G N, LaBar T, Hintze A, Adami C (2017). Origin of life in a digital microcosm. *Phil. Trans. R. Soc. A* 375:20160350. doi:10.1098/rsta.2016.0350
- Adami C, LaBar T (2017). From entropy to information: biased typewriters and the origin of life. A: Walker SI, Davies PCW, Ellis GFR (eds.), *From Matter to Life: Information and Causality*, Cambridge University Press, pp. 130–154. arXiv:1506.06988 (llegit el 12-11-2026: els resultats, la discussió i els mètodes)
- Hickinbotham S (2023). Drivers of replicator organisation in the Nanopond artificial chemistry. *GECCO '23 Companion*, pp. 147–150. doi:10.1145/3583133.3590572 (el resum)
- Agüera y Arcas B, Alakuijala J, Evans J, Laurie B, Mordvintsev A, Niklasson E, Randazzo E, Versari L (2024). Computational life: how well-formed, self-replicating programs emerge from simple interaction. arXiv:2406.19108
- Mathis C, Patel D, Weimer W, Forrest S (2024). Self-organization in computation & chemistry: return to AlChemy. arXiv:2408.12137
- Knierim C, Versari L, Obryk R, Agüera y Arcas B, Saurous RA (2026). BFF: simple explanations for complex phenomena. arXiv:2607.01483 (preprint)
- Cicala F, Niklasson E, Randazzo E, Boukortt S, Basti A, Etcheverry M, Saurous RA, Laurie B, Manyika J, Agüera y Arcas B, Richards B (2026). Coevolution of self-replication and function in a digital primordial soup. arXiv:2607.09211 (preprint)
- Jha K, Cicala F, Agüera y Arcas B, Richards BA, Jaques N, Kleiman-Weiner M, Niklasson E (2026). Tapes together strong: the co-evolution of computation and cooperation. arXiv:2609.10817 (preprint)
- Dittrich P, Ziegler J, Banzhaf W (2001). Artificial chemistries—a review. *Artificial Life* 7:225–275. doi:10.1162/106454601753238636

**Ingredients de la química**
- Cotler J, Hongler C, Hudcová B (2025). Self-replication and computational universality. arXiv:2510.08342
- Ofria C, Adami C, Collier TC (2002). Design of evolvable computer languages. *IEEE Trans. Evol. Comput.* 6:420–424. doi:10.1109/TEVC.2002.802442
- Bryson DM, Ofria C (2013). Understanding evolutionary potential in virtual CPU instruction set architectures. *PLoS ONE* 8:e83242. doi:10.1371/journal.pone.0083242
- Sarkar S, England JL (2019). Design of conditions for emergence of self-replicators. *Phys. Rev. E* 100:022414. doi:10.1103/PhysRevE.100.022414
- Wilke CO, Wang JL, Ofria C, Lenski RE, Adami C (2001). Evolution of digital organisms at high mutation rates leads to survival of the flattest. *Nature* 412:331–333. doi:10.1038/35085569

**Establiment, paràsits i xarxes autocatalítiques**
- Eigen M (1971). Selforganization of matter and the evolution of biological macromolecules. *Naturwissenschaften* 58:465–523. doi:10.1007/BF00623322 (parcial)
- Eigen M, Schuster P (1977–78). The hypercycle. *Naturwissenschaften* 64:541–565; 65:7–41; 65:341–369. doi:10.1007/BF00450633 (parcial)
- Boerlijst MC, Hogeweg P (1991). Spiral wave structure in pre-biotic evolution: hypercycles stable against parasites. *Physica D* 48:17–28. doi:10.1016/0167-2789(91)90049-F (parcial)
- Kauffman SA (1986). Autocatalytic sets of proteins. *J. Theor. Biol.* 119:1–24. doi:10.1016/S0022-5193(86)80047-9
- Hordijk W, Steel M (2004). Detecting autocatalytic, self-sustaining sets in chemical reaction systems. *J. Theor. Biol.* 227:451–461. doi:10.1016/j.jtbi.2003.11.020
- Vasas V, Szathmáry E, Santos M (2010). Lack of evolvability in self-sustaining autocatalytic networks constraints metabolism-first scenarios for the origin of life. *PNAS* 107:1470–1475. doi:10.1073/pnas.0912628107
- Vasas V, Fernando C, Santos M, Kauffman S, Szathmáry E (2012). Evolution before genes. *Biology Direct* 7:1. doi:10.1186/1745-6150-7-1
- Peng Z, Linderoth J, Baum DA (2022). The hierarchical organization of autocatalytic reaction networks and its relevance to the origin of life. *PLoS Comput. Biol.* 18:e1010498. doi:10.1371/journal.pcbi.1010498 (amb una eina que en resumeix el text)
- Pigozzi F, Levin M (2026). Causal organization prior to and promoting self-replication in a catalytic model of the origin of life. arXiv:2607.28250 (preprint; la taula 1 i els resultats, el 12-11-2026)
- Bansho Y, Furubayashi T, Ichihashi N, Yomo T (2016). Host–parasite oscillation dynamics and evolution in a compartmentalized RNA replication system. *PNAS* 113:4045–4050. doi:10.1073/pnas.1524404113
- Colizzi ES, Hogeweg P (2016). Parasites sustain and enhance RNA-like replicators through spatial self-organisation. *PLoS Comput. Biol.* 12:e1004902. doi:10.1371/journal.pcbi.1004902
- Furubayashi T i altres (2020). Emergence and diversification of a host-parasite RNA ecosystem through Darwinian evolution. *eLife* 9:e56038. doi:10.7554/eLife.56038

**Barreja i estructura espacial**
- Kerr B, Riley MA, Feldman MW, Bohannan BJM (2002). Local dispersal promotes biodiversity in a real-life game of rock–paper–scissors. *Nature* 418:171–174. doi:10.1038/nature00823
- Reichenbach T, Mobilia M, Frey E (2007). Mobility promotes and jeopardizes biodiversity in rock–paper–scissors games. *Nature* 448:1046–1049. doi:10.1038/nature06095
- Hauert C, Doebeli M (2004). Spatial structure often inhibits the evolution of cooperation in the snowdrift game. *Nature* 428:643–646. doi:10.1038/nature02360
- Szabó P, Scheuring I, Czárán T, Szathmáry E (2002). In silico simulations reveal that replicators with limited dispersal evolve towards higher efficiency and fidelity. *Nature* 420:340–343. doi:10.1038/nature01187
- Takeuchi N, Hogeweg P (2009). Multilevel selection in models of prebiotic evolution II. *PLoS Comput. Biol.* 5:e1000542. doi:10.1371/journal.pcbi.1000542
- Vostinar AE, Ofria C (2018). Spatial structure can decrease symbiotic cooperation. *Artificial Life* 24:229–249. doi:10.1162/artl_a_00273

**Fronts d'invasió i dispersió a distància**
- Fisher RA (1937). The wave of advance of advantageous genes. *Ann. Eugen.* 7:355–369. doi:10.1111/j.1469-1809.1937.tb02153.x (parcial)
- Shigesada N, Kawasaki K, Takeda Y (1995). Modeling stratified diffusion in biological invasions. *Am. Nat.* 146:229–251. doi:10.1086/285796 (parcial)
- Kot M, Lewis MA, van den Driessche P (1996). Dispersal data and the spread of invading organisms. *Ecology* 77:2027–2042. doi:10.2307/2265698 (parcial)
- Hallatschek O, Fisher DS (2014). Acceleration of evolutionary spread by long-range dispersal. *PNAS* 111:E4911–E4919. doi:10.1073/pnas.1404663111 (parcial)

**Entorns variables**
- Kashtan N, Alon U (2005). Spontaneous evolution of modularity and network motifs. *PNAS* 102:13773–13778. doi:10.1073/pnas.0503610102
- Kashtan N, Noor E, Alon U (2007). Varying environments can speed up evolution. *PNAS* 104:13711–13716. doi:10.1073/pnas.0611630104
- Clune J, Mouret J-B, Lipson H (2013). The evolutionary origins of modularity. *Proc. R. Soc. B* 280:20122863. doi:10.1098/rspb.2012.2863
- Canino-Koning R, Wiser MJ, Ofria C (2019). Fluctuating environments select for short-term phenotypic variation leading to long-term exploration. *PLoS Comput. Biol.* 15:e1006445. doi:10.1371/journal.pcbi.1006445
- Damer B, Deamer D (2015). Coupled phases and combinatorial selection in fluctuating hydrothermal pools. *Life* 5:872–887. doi:10.3390/life5010872
- Damer B, Deamer D (2020). The hot spring hypothesis for an origin of life. *Astrobiology* 20:429–452. doi:10.1089/ast.2019.2045
- Higgs PG (2016). The effect of limited diffusion and wet–dry cycling on reversible polymerization reactions. *Life* 6:24. doi:10.3390/life6020024
- Tkachenko AV, Maslov S (2018). Onset of natural selection in populations of autocatalytic heteropolymers. *J. Chem. Phys.* 149:134901. doi:10.1063/1.5048488

**Compartiments i minerals**
- Szathmáry E, Demeter L (1987). Group selection of early replicators and the origin of life. *J. Theor. Biol.* 128:463–486. doi:10.1016/S0022-5193(87)80191-1
- Martin W, Russell MJ (2003). On the origins of cells. *Phil. Trans. R. Soc. B* 358:59–83. doi:10.1098/rstb.2002.1183
- Koonin EV, Martin W (2005). On the origin of genomes and cells within inorganic compartments. *Trends Genet.* 21:647–654. doi:10.1016/j.tig.2005.09.006
- Baaske P i altres (2007). Extreme accumulation of nucleotides in simulated hydrothermal pore systems. *PNAS* 104:9346–9351. doi:10.1073/pnas.0609592104
- Hanczyc MM, Fujikawa SM, Szostak JW (2003). Experimental models of primitive cellular compartments. *Science* 302:618–622. doi:10.1126/science.1089904
- Matsumura S i altres (2016). Transient compartmentalization of RNA replicators prevents extinction due to parasites. *Science* 354:1293–1296. doi:10.1126/science.aag1582
- Ono N, Ikegami T (2000). Self-maintenance and self-reproduction in an abstract cell model. *J. Theor. Biol.* 206:243–253. doi:10.1006/jtbi.2000.2121
- Hutton TJ (2007). Evolvable self-reproducing cells in a two-dimensional artificial chemistry. *Artificial Life* 13:11–30. doi:10.1162/artl.2007.13.1.11
- Adamski P i altres (2020). From self-replication to replicator systems en route to de novo life. *Nat. Rev. Chem.* 4:386–403. doi:10.1038/s41570-020-0196-x

**Transicions i simbiosi**
- Maynard Smith J, Szathmáry E (1995). *The Major Transitions in Evolution*. W.H. Freeman. ISBN 0716745259
- Szathmáry E (2015). Toward major evolutionary transitions theory 2.0. *PNAS* 112:10104–10111. doi:10.1073/pnas.1421398112
- Zaman L i altres (2014). Coevolution drives the emergence of complex traits and promotes evolvability. *PLoS Biol.* 12:e1002023. doi:10.1371/journal.pbio.1002023
- Mizuuchi R, Furubayashi T, Ichihashi N (2022). Evolutionary transition from a single RNA replicator to a multiple replicator network. *Nat. Commun.* 13:1460. doi:10.1038/s41467-022-29113-x

**Autòmats cel·lulars autoreplicants**
- von Neumann J (1966). *Theory of Self-Reproducing Automata* (ed. A.W. Burks). University of Illinois Press.
- Langton CG (1984). Self-reproduction in cellular automata. *Physica D* 10:135–144. doi:10.1016/0167-2789(84)90256-2 (parcial)
- Chou H-H, Reggia JA (1997). Emergence of self-replicating structures in a cellular automata space. *Physica D* 110:252–276. doi:10.1016/S0167-2789(97)00132-2 (parcial)
- Sayama H (1999). A new structurally dissolvable self-reproducing loop evolving in a simple cellular automata space. *Artificial Life* 5:343–365. doi:10.1162/106454699568818
- Sayama H, Nehaniv CL (2025). Self-reproduction and evolution in cellular automata: 25 years after evoloops. *Artificial Life* 31:81–95. doi:10.1162/artl_a_00451
