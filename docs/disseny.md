# Disseny de l'univers · claude-origins

Document viu amb la visió, els principis, les decisions i el pla del projecte.
Les dades i els resultats dels experiments són al [quadern de laboratori](../quadern/index.html).

## 1. Visió

Un univers digital de joguina on la vida pugui sorgir sola, sense que ningú escrigui el primer
organisme: **abiogènesi digital**. El projecte va néixer el 14 d'octubre de 2026 com un espai per fer
coses que siguin un repte i que motivin, i combina quatre coses:

- una **simulació** (la sopa i el món);
- **explicacions interactives** (el quadern, el microscopi);
- **narrativa emergent** (genealogies, famílies, històries que ningú no escriu);
- un **recurs en català** sobre un tema que gairebé no en té.

Tierra (1991) i Avida (1993) van estudiar l'evolució digital, però el primer replicador l'escrivia una
persona. El 2024, *Computational Life* (Agüera y Arcas et al.) va mostrar que en una sopa de programes
aleatoris els replicadors apareixen sols. El nostre objectiu no és repetir-ho, sinó respondre el que
va quedar obert: si la vida es pot mantenir, adaptar, formar ecosistemes i reproduir-se entre dos.

**La pregunta, reformulada (16-10-2026, AUD-39 de l'auditoria 2).** "La vida pot néixer sola?" ja té
resposta en substrats com aquest. Ho va mostrar *Computational Life*, ho hem reproduït a la Fase 1, i ja
hi havia precedents en altres químiques artificials: Coreworld (1990), AlChemy (1994) i Amoeba (1996). L'estat de la
qüestió és a `docs/estat-questio.md` (18-10-2026), amb les referències comprovades. Les preguntes d'aquest projecte són
les que queden obertes:

1. **Quines propietats** de la química i de l'entorn calen perquè la vida aparegui.
2. **De què depèn que s'estableixi i es mantingui.** Les dades de la iteració 3 suggereixen que el
   difícil no és que aparegui un copiador, sinó que n'aparegui un d'hereditari que s'estableixi.
3. **Si després hi ha evolució darwiniana sostinguda:** herència, variació i selecció mesurades, no
   només còpia.
4. **Si els resultats són generals** o propis de BFF.

## 2. Principis

1. **Dissenyem les lleis, mai els organismes.** Res de replicadors inicials, cap premi per replicar-se
   i cap instrucció que copiï un programa sencer d'un sol cop. La Terra també té unes lleis que la vida
   no va triar.
2. **Lleis generals, sense retocar-les fins que tot surti bé.** Si ajustem les lleis per obtenir un
   resultat, la vida l'hem posada nosaltres. Exemple rebutjat: una llei que "faci desaparèixer els
   zeros" seria dissenyar la cura d'una malaltia que ja coneixem (vegeu l'entrada 2 del quadern).
3. **Un canvi cada vegada.** Cada llei és un interruptor, i cada experiment es compara amb el grup de
   control (la Fase 1). Si canviem dues coses alhora, no sabrem quina ha causat l'efecte.
   **Matís (auditoria externa 2):** el control d'una llei és el mateix món amb la llei apagada. Per
   exemple, el món quiet és el control del corrent. La Fase 1 és el control de la química.
4. **Univers tancat.** Els organismes són bytes executats pel nostre propi intèrpret. No tenen accés al
   sistema operatiu, a la xarxa ni als fitxers. Una "estratègia de supervivència" vol dir copiar bytes
   dins de la memòria del món, i res més.
5. **Comprovar abans d'afirmar.** Cada hipòtesi es posa a prova amb dades. Quan ens equivoquem, ho
   corregim al quadern sense esborrar el que havíem dit.
6. **Reproduïbilitat.** Amb la mateixa llavor i els mateixos paràmetres, la mateixa història.

## 3. Què necessita un univers perquè hi neixi vida

Avaluació feta el 14 d'octubre de 2026, després de la Fase 1.

### Per néixer

| Requisit | A la Terra | Al nostre univers | Estat |
|---|---|---|---|
| Moltes molècules possibles | polímers (ARN, proteïnes) | 256^64 programes possibles | sí |
| Informació i màquina alhora | l'ARN és gen i enzim alhora | codi i dades a la mateixa cinta | sí |
| Còpia possible, però no regalada | molècules d'ARN que es copien | replicadors de ~40 bytes, a l'abast de l'atzar | sí |
| Contacte | aigua, difusió | aparellaments | sí |
| Variació | errors de còpia, radiació UV | mutació i automodificació | sí |
| Recursos limitats | matèria finita | copiar-se vol dir sobreescriure un altre programa | sí |
| Estabilitat | molècules que duren | mutació baixa (0,024 %) | sí |
| Escala i temps | oceans, milions d'anys | milers d'èpoques; 3 de 4 sopes | en part |

### Per durar i créixer

| Requisit | A la Terra | Al nostre univers | Com hi arribarem |
|---|---|---|---|
| Flux d'energia i matèria | el Sol, les fumaroles | món tancat | lleis 3 i 4 |
| Diversitat d'entorns | geografia | sopa uniforme | lleis 1, 4 i 5 |
| Compartiments | membranes, porus minerals | res | llei 7 |
| Complexitat sense sostre | genomes de milers de milions de bases | 64 bytes fixos | Química 2 |

## 4. Les lleis

Les lleis fonamentals de la física no es copien literalment: es tradueixen segons la funció que fan
per a la vida.

| Física real | Funció per a la vida | Al nostre univers |
|---|---|---|
| Espai-temps | localitat: el que és lluny no t'afecta a l'instant | llei 1; la informació viatja com a màxim 2 cel·les per època (la nostra "velocitat de la llum") |
| Electromagnetisme | la química: com interactuen les molècules | l'intèrpret BFF; i l'atracció, candidata a llei 8 |
| Gravetat | gradients i capes | baixa prioritat: corrents i energia ja en creen |
| Forces nuclears | àtoms estables | els bytes són estables per definició; la radioactivitat és la llei 5 |
| Termodinàmica | conservació de l'energia i flux | lleis 3 i 4 (energia conservada); la matèria ja es conserva |
| Quàntica | estats discrets i atzar | bytes i mutació; la superposició no hi té cap paper conegut |

| Llei | Què fa | A la Terra seria… | Pregunta que respon |
|---|---|---|---|
| 1. Espai | Mapa 2D; cada programa només interactua amb els veïns | la geografia | Es pot sobreviure a l'enverinament colonitzant zones netes? |
| 2. Corrents | Els programes intercanvien lloc amb els veïns | l'aigua, el vent | Quanta barreja necessita la vida? |
| 3. Flux | Entren programes nous per una vora, tot deriva i surt per l'altra | un riu, una fumarola | Un món obert que renova els materials |
| 4. Energia | L'energia arriba del sol, s'acumula a cada cel·la i es gasta amb cada instrucció | el Sol, el nucli terrestre | Selecciona organismes eficients? Apareixen nínxols i "possessions"? |
| 5. Radiació | La taxa de mutació canvia segons la zona | l'atmosfera, la capa d'ozó | On neix la vida i on dura més? |
| 6. Cicles | L'energia i els corrents varien amb el temps | dia i nit, humitat i sequera | Els cicles ajuden o perjudiquen? |
| 7. Minerals | Roca inert i porosa: cambres petites unides per canals | els porus de les fumaroles, les argiles | Els compartiments fan sorgir individus? |
| 8. Afinitat (candidata) | Els programes s'aparellen preferentment segons els seus bytes | l'atracció química, les bases complementàries | Calen per poder reconèixer una parella |

Dues propostes més, per després:

- **Química 2.** Una química pròpia per trencar el sostre dels 64 bytes i permetre individus. Es provarà
  primer en una sopa barrejada, per comprovar que la vida hi continua sorgint.
- **Reproducció entre dos.** Una variant de la química on un programa no pot copiar-se a si mateix,
  només el seu company. Ve de la proposta humana del projecte (conversa del 14-10-2026): la reproducció
  entre diversos elements, en lloc de la simple replicació.

**Idees del responsable del projecte (conversa del 16-10-2026), per a més endavant.**

- **La mida del món.** A la Terra hi ha prou espai perquè no calgui acabar amb un ésser viu per fer-ne
  lloc a un altre. Al nostre univers, cada cel·la conté sempre un programa, i copiar-se vol dir
  sobreescriure'n un altre. Passaria igual en un món més gran: el que hi falta no és espai, sinó
  **matèria lliure, no organitzada**. Sobreescriure un programa de soroll és com fer servir matèria
  primera; sobreescriure un replicador és competir-hi.
  - **La renovació (llei 3) és el que s'hi assembla més.**
  - **Una hipòtesi que es pot comprovar de manera barata.** Si l'aparició d'un replicador hereditari és
    un esdeveniment rar i local (iteració 3), el temps fins a l'establiment hauria de ser inversament
    proporcional a la mida del món.
  - **Una llei d'"espai buit".** Seria tenir cel·les sense programa, on copiar-se no destrueix res. Caldria
    pensar-la bé, perquè en BFF el zero ja fa de buit i és verinós.
- **Simbiosi.** A la Terra, els organismes conviuen al mateix espai i en simbiosi.
  - **El replicador que necessita parella** (entrada 4) és una protosimbiosi: només es copia al costat
    d'un company ple de `<`. Ara per ara fa de paràsit, perquè sobreescriu el company.
  - **La versió mutualista** és la reproducció entre dos de més amunt: dos programes que s'ajuden a
    copiar-se. Seria un hipercicle (Eigen).
  - **L'espai protegeix aquestes cooperacions dels paràsits** (Boerlijst i Hogeweg, 1991), cosa que
    connecta amb la llei 1.
- **La vida que dura poc també és vida** (conversa del 18-10-2026). Una població que s'estableix i
  desapareix ha viscut un temps, com qualsevol ésser viu. El que cal mesurar és quant viu, no
  excloure-la. Vegeu la decisió del 18-10-2026.
- **El temps que fa** (conversa del 18-10-2026). El corrent i el riu no haurien de ser sempre fixos: al
  món real fa sol, plou, neva, fa vent o no en fa.
  - **Encaixa amb la llei 6 (cicles)**, però hi afegeix l'atzar: no només cicles regulars, sinó un temps
    que canvia sense cap patró fix.
  - **Connecta amb la pregunta de B2.** Si el corrent ajuda les colònies noves a escampar-se però desfà
    les establertes (hipòtesi, entrada 8), alternar calma i temporal podria fer les dues coses alhora.
    Es pot comprovar: amb la mateixa barreja mitjana, un corrent variable fa establir i mantenir més vida
    que un de constant?
  - **Com seria.** Un procés aleatori que mou la barreja (i, si cal, el riu, la difusió i la
    renovació), amb un generador propi derivat de la llavor perquè sigui determinista. Per exemple, dos
    estats, calma i temporal, amb una probabilitat de canviar a cada època, o un valor que puja i baixa.
    Per defecte no s'activaria, i les empremtes de les proves no canviarien.
  - **La comparació neta** és variable contra constant, amb la mateixa mitjana: un canvi cada vegada.
  - Pendent de valorar amb els auditors (ronda de propostes de l'auditoria 8).
- **Organismes dins d'organismes.** Els humans i molts animals porten microorganismes vius a dins i a
  fora.
  - **Ja es pot buscar.** Un replicador curt, dins d'un programa de 64 bytes, es podria endur un altre
    replicador com a "passatger": quan l'hoste es copia, també copia el que porta a dins. Seria
    transmissió vertical, com la dels mitocondris. Es pot buscar a les captures: programes amb dos nuclis
    de famílies diferents.
  - **Una simbiosi de debò** demana individus més grans que una cel·la: la Química 2 o els compartiments
    de la llei 7. És una de les transicions evolutives majors (Maynard Smith i Szathmáry).

**Full de ruta (16-10-2026, AUD-40 de l'auditoria 2, decidit pel responsable del projecte).**
- **Primer, la sèrie confirmatòria de la llei 2.** *Feta el 18-10-2026: no concloent (entrada 8; vegeu
  §5 i §6).*
- **Després, un eix de química:** ablacions a la sopa barrejada, que és barata i hi fa vida en milers
  d'èpoques, per saber quins ingredients són necessaris. Per exemple:
  - sense mutació (l'article diu que la vida hi apareix igualment);
  - sense una de les dues instruccions de còpia;
  - amb l'ordre de la parella simètric;
  - sense automodificació.

  És la pregunta oberta de l'article: per què en BFF hi neix vida i en altres llenguatges no.
- **L'ordre de les lleis 4–8 i de la Química 2 es decidirà amb els resultats de les ablacions.** Les lleis
  es provaran preferentment amb branques aparellades des d'un banc de mons amb vida i amb assaigs
  d'establiment (AUD-41). La llei 4 (energia) s'haurà de dissenyar amb cura, perquè no es converteixi en
  una funció d'aptitud amagada.

## 5. Decisions

| Data | Decisió | Motiu |
|---|---|---|
| 14-10-2026 | Projecte: sopa primordial / abiogènesi digital | Problema obert, visual, i encaixa amb el nom `claude-origins` |
| 14-10-2026 | Camí A (l'origen, res regalat) abans que el camí B (la reproducció com a llei) | Si la reproducció és una llei, és un algorisme genètic, i ja no és abiogènesi |
| 14-10-2026 | La Fase 1 reprodueix l'experiment BFF tal qual | Grup de control i validació de les eines |
| 14-10-2026 | Es manté la química BFF a les fases 2a–2d | Està provat que hi neix vida; un canvi cada vegada; es pot comparar amb la versió 2D de l'article |
| 14-10-2026 | S'afegeixen la llei 7 (minerals) i l'energia conservada | Compartiments i termodinàmica: els dos requisits que falten |
| 14-10-2026 | Ordre de la Fase 2: espai → corrents → flux → energia → minerals → Química 2 → reproducció entre dos | De menys a més canvi |
| 14-10-2026 | Fase 2a: mapa de 512×256, veïns a 2 cel·les com a màxim, vores sense volta | Igual que la versió 2D de l'article (240×135), però amb tants programes com la nostra sopa (131.072) |
| 14-10-2026 | Al món 2D, tot l'atzar (aparellaments i mutacions) es fa al fil principal | El nombre de fils no canvia la història: navegador i Node fan exactament el mateix |
| 14-10-2026 | Una família de replicadors només es registra si passa la prova de replicació, i inclou el seu mirall | Abundant no vol dir viu; i els replicadors que hem vist es copien al revés |
| 14-10-2026 | Els colors de les famílies (magenta, verd, violeta) són diferents dels de les instruccions, i se'n mostren 3 com a màxim | Validats per a daltonisme amb qualsevol parella; el color segueix la família, no el rànquing |
| 15-10-2026 | Llei 2 = barreja (una fracció *m* de cel·les es redistribueix a l'atzar) + difusió (intercanvis amb un veí del costat) | La barreja interpola exactament entre els dos controls: *m* = 0 és el món 2D, *m* = 1 és la sopa. **Corregit (auditoria 1, AUD-05):** no és exacte. A *m* = 1 l'aparellament continua sent entre veïns i només s'aparellen el 75 % de les cel·les, i la mutació per interacció és 1,33 vegades més alta que a la sopa |
| 15-10-2026 | Primer experiment de la llei 2: escombrat de *m* ∈ {0,001; 0,01; 0,1; 1} amb llavors 1–3 | Respon alhora si l'espai frena la vida i quanta barreja necessita |
| 15-10-2026 | Cens de famílies (amb prova de replicació) cada 250 èpoques als experiments 2D | La vida local no mou l'entropia global; cal detectar-la directament |
| 15-10-2026 | La prova de replicació també posa el portador en segona posició i amb companys del mateix món; els fragments monòtons no compten | Al corrent 0,01 va aparèixer un replicador que només es copia després d'un company ple de `<`: la prova antiga no el veia |
| 15-10-2026 | La VM (Debian 13; l'adreça és a `CLAUDE.local.md`, que no es publica) és un laboratori aïllat per als experiments; Claude hi entra amb una clau pròpia | Comparteix processador amb el PC (i7-7700HQ): no hi afegeix potència, però aïlla la feina |
| 15-10-2026 | Llei 3 = riu (tot el mapa es desplaça cap a la dreta, entra material nou per l'esquerra i en surt per la dreta) + renovació (cel·les a l'atzar substituïdes per material nou) | Un sistema obert sense dissenyar la cura de cap verí concret; la renovació sense direcció fa de control del riu |
| 15-10-2026 | Experiments de branca: continuar un món desat (`--from`) canviant només una llei | Mateix punt de partida i una sola diferència: comparació neta, sense esperar que la vida neixi per atzar |
| 15-10-2026 | Estadística de la llei 2 a la VM: *m* = 0 i *m* = 0,01 amb les llavors 4–15 | 15 llavors per nivell (amb les 1–3), per separar l'efecte del corrent de la sort de cada llavor |
| 15-10-2026 | Auditoria externa 1: s'accepten 27 de 28 troballes. Resposta i pla a `../auditories/claude-origins-audit/audit1/` (la carpeta es va moure a `../auditories/claude-origins/auditor1/audit1/`) | Vegeu les decisions següents |
| 15-10-2026 | Generador aleatori v2 (xoshiro128\*\* amb SplitMix32) per defecte; v1 (mulberry32) es manté amb `--rng v1` | v1 esgota el seu cicle de 2^32 dins d'un món 2D i totes les llavors en són el mateix cicle desplaçat: la independència entre repeticions no estava garantida (AUD-01) |
| 15-10-2026 | La sèrie de 15 llavors de la llei 2 que corre a la VM s'acaba amb v1 i es tracta com a exploratòria; la confirmatòria es farà amb v2 i amb un protocol estadístic escrit abans | Coherència amb les llavors 1–3, i les conclusions estadístiques només amb repeticions independents |
| 15-10-2026 | Una sola prova de replicació (`fase2/replication.js`) per a totes les eines | `analitza.mjs` tenia una versió pròpia sense el filtre de finestres monòtones i comptava un 48 % de falsos replicadors en un món de prova (AUD-02). Cap xifra publicada no en depenia |
| 15-10-2026 | Proves de regressió del determinisme amb empremtes fixades (`test/determinisme.mjs`) | Totes les conclusions depenen que una llavor doni sempre la mateixa història (AUD-16) |
| 15-10-2026 | Els canvis al simulador i a les eines d'anàlisi passen per una *pull request* revisada per una persona | El desenvolupament és majoritàriament assistit per IA (AUD-25) |
| 15-10-2026 | Llicència: Apache 2.0 per al codi i CC BY 4.0 per al quadern i la documentació, amb els crèdits a `NOTICE` | Apache 2.0 té clàusula de patents i un mecanisme estàndard d'atribució, i és la de cubff; CC BY 4.0 és l'habitual per a text científic i divulgatiu (AUD-11) |
| 15-10-2026 | Auditories iteratives: després de cada grup de tasques, un informe de traspàs per a l'auditor (`../auditories/claude-origins/auditorN/auditM/`), el seu informe i la nostra resposta | Revisió externa contínua; les troballes conserven l'identificador entre auditories |
| 15-10-2026 | Registre de famílies v2: es parteix de la prova de replicació sobre 512 cel·les (sol i en context amb un veí), les famílies s'agrupen pel codi compacte (només instruccions) i el nucli es recalcula a cada anàlisi | La v1 no veia els replicadors espaiats, ni els que necessiten parella, ni seguia l'evolució. Validat amb proves i amb els mons desats de l'escombrat |
| 16-10-2026 | Segon auditor extern, un model diferent de Claude, en paral·lel amb l'auditoria 2. La primera passada la fa sense veure les auditories anteriors. Respostes i pla a `../auditories/claude-origins/equip/pla-iteracio-3.md` | Reduir els punts cecs compartits. Els dos auditors van coincidir de manera independent en els problemes principals del protocol |
| 16-10-2026 | La mesura principal de vida és funcional: el cens v3 compta els replicadors hereditaris (la còpia també es copia) en una mostra de 2.048 cel·les diferents. El registre de famílies queda com a eina descriptiva | El territori d'una família es desvia dels replicadors reals en tots dos sentits (AU2-01), i la prova antiga no distingia una còpia d'un tros de dades de l'herència (AUD-33). Calibrat a `docs/calibratge.md` |
| 16-10-2026 | Els experiments s'aturen 1.000 èpoques després de l'establiment, no després que l'HOE superi 1 bit | L'aturada per HOE podia censurar experiments abans que es pogués avaluar el criteri (AUD-30, AU2-04), i l'HOE depèn de la versió de zlib (AU2-07) |
| 16-10-2026 | La sèrie confirmatòria es fa en dues etapes (50 i, si cal, 80 llavors per condició), amb límits d'O'Brien–Fleming | La potència del log-rank per a efectes plausibles (20 % contra 40 %) era del 59 % amb 50 llavors (AUD-31, AU2-05) |
| 16-10-2026 | L'intèrpret es compara amb el codi original de cubff (oracle extern), compilat a la VM | La referència de les proves l'havíem escrita nosaltres (AU2-12). Coincideixen en 200.000 cintes. Es manté la mutació del 0,024 % (la de l'article; cubff fa servir 1/4.096) |
| 16-10-2026 | La pregunta del projecte es reformula: condicions, establiment, evolució posterior i generalitat (§1) | AUD-39; decidit pel responsable del projecte |
| 16-10-2026 | Després de la sèrie confirmatòria, ablacions de química a la sopa, abans de les lleis 4–8 (§4) | AUD-40; decidit pel responsable del projecte |
| 16-10-2026 | El *merge* de la iteració 3 (`8cd4449`) és el preregistre de la sèrie de la llei 2, amb l'etiqueta anotada `preregistre-llei2` publicada abans de llançar res. Tres punts febles del control de còpia neta (AUD-51, AU2-31, AU2-32) no es corregeixen al programa: es cobreixen amb comprovacions a mà, anotades a l'acta de llançament (`../auditories/claude-origins/equip/acta-preregistre-llei2.md`) | Tots dos auditors van donar GO a l'auditoria 6 amb la condició de no tocar més el motor de decisió abans del *merge*. Es corregiran a la iteració 4 |
| 16-10-2026 | Cada màquina (VM i PC) fa la meitat de cada grup de la sèrie, amb A i B alternats | Una interrupció afecta tots dos grups per igual, i les dues màquines donen resultats idèntics (`npm test`, les mateixes empremtes). **Precisat (auditoria 7, AUD-55):** les històries dels mons són idèntiques, però l'HOE difereix lleugerament (fins a 1,1 × 10⁻³) perquè zlib 1.2.11 i 1.3.1 no comprimeixen igual |
| 17-10-2026 | Durant l'execució no es tornen a repartir les llavors entre màquines, encara que una vagi més de pressa | No es toca un lot confirmatori en marxa: es podria repetir o saltar una llavor |
| 18-10-2026 | **Resultat de la sèrie confirmatòria:** no es rebutja H0 (món quiet 24/80, corrent 0,01 34/80; log-rank Z = −1,83, límit 2,004). Es comunica com a "no concloent", amb la mida de l'efecte (+12,5 punts, IC 95 % −2,3 a 27,3) i sense presentar com a resultat les sensibilitats ni les observacions descriptives | La regla de comunicació del protocol (§10), escrita abans. L'interval inclou el zero i també la diferència mínima rellevant (20 % contra 40 %) |
| 18-10-2026 | Els llançadors dels lots escriuran només a un fitxer, mai a la consola | Una finestra de consola en mode de selecció de Windows va aturar el lot del PC durant una hora (incidència 1 de l'acta) |
| 18-10-2026 | **Una vida que apareix i desapareix és vida, amb una vida curta.** No es canvia la definició d'establiment. S'hi afegeix la **durada** de la vida establerta com a mesura pròpia, amb el temps fins que deixa de complir el criteri | El responsable del projecte: "és una vida, però ha viscut X temps, com fan els éssers vius". Ho fa compatible amb la sèrie feta, i converteix la "vida que no dura" en una mesura, no en un criteri d'exclusió |
| 18-10-2026 | Iteració 4: primer B2 (la durada de la vida establerta, amb branques aparellades des de les captures de l'establiment), i després les ablacions (B1) | Decidit pel responsable del projecte. És barat i aprofita el banc de captures. Els mons d'origen es reparteixen a l'atzar entre exploració i confirmació, i el repartiment es desa a git abans de mirar res. Les llavors de continuació d'un mateix món no són rèpliques independents (AUD-54 i recomanació de l'auditor 2) |
| 18-10-2026 | La mida del món es prova de manera progressiva: primer mons petits, i després més grans | Decidit pel responsable del projecte. Amb les correccions de l'auditoria 7 (AUD-53): el que escala amb l'àrea és el risc, no la proporció de mons amb vida, i cal un llindar absolut o un cens complet perquè la mesura no depengui de la mida |
| 18-10-2026 | A les sèries futures, les llavors es repartiran a l'atzar entre les condicions, i es preregistrarà una comprovació de coherència entre blocs | L'heterogeneïtat entre les dues etapes de la sèrie de la llei 2 (AU2-33) no té cap causa coneguda, però la sèrie feia servir blocs de llavors seguits per a cada condició |
| 18-10-2026 | Les propostes del responsable del projecte es valoren internament i també amb els auditors. Hi haurà rondes en què els auditors també facin propostes sobre les preguntes obertes, no només revisions | Demanat pel responsable del projecte. Dos models diferents i una persona veuen coses diferents |
| 18-10-2026 | **Un xat comú** entre l'equip, els dos auditors i el responsable (`../auditories/claude-origins/xat/xat.md`), per fer-se preguntes entre auditories mentre corren els experiments. Normes: només s'hi afegeix; cada missatge té un identificador; no decideix res, i les decisions es queden a aquest document; les troballes i les propostes es fan primer per separat a cada informe; no es parla d'experiments en curs. L'auditor 2 hi participa per mitjà del responsable | Proposta del responsable del projecte, per treballar en paral·lel. Les normes en preserven la independència dels auditors i la traçabilitat. Els auditors en valoren el format a l'auditoria 8 |
| 18-10-2026 | Normes noves del xat (9 a 12), proposades pels dos auditors a l'auditoria 8: la **revelació simultània** de les respostes dels dos auditors; el **segellat** de cada informe abans de llegir el de l'altre; el **trasllat literal** dels missatges de l'auditor 2; i una **història verificable**, amb un repositori git local a la carpeta de les auditories que no es publica | Decidit pel responsable del projecte. Les respostes de l'auditoria 8 al xat es van escriure, sense voler, de manera independent, i va funcionar |
| 18-10-2026 | Les proves es passen en una **còpia neta del commit** abans de demanar cada *merge* (`prova-neta.sh`), i GitHub les passa a cada PR amb Node 16 i 20 | L'error de la PR #3 es va escapar perquè les proves es van passar amb canvis sense desar (AUD-58) |
| 18-10-2026 | El responsable del projecte demana que Claude avanci sense demanar confirmació en les millores i les adopcions, i que només s'aturi per a les avaluacions dels auditors i per a les preguntes que també hagin de respondre ells | Que el responsable no sigui el coll d'ampolla. Les PR del simulador i de les eines d'anàlisi continuen passant per la seva revisió |
| 18-10-2026 | **Les dades internes només en local.** L'adreça de la VM, els noms de les claus, els camins de la màquina i el de la còpia de seguretat passen a `CLAUDE.local.md` i a `eines/local.env`, que no van a git (n'hi ha un exemple publicat, `eines/local.env.exemple`). `eines/desplega-vm.sh` llegeix l'adreça d'`eines/local.env`, i sense aquest fitxer s'atura. S'han tret de `CLAUDE.md`, d'aquesta taula (la fila del 15-10-2026) i de `docs/captures.md`. **La història de git** anterior conserva l'adreça de la VM, que és privada (RFC 1918) i no s'hi pot arribar des de fora de la xarxa local: és al primer commit (`b1cca32`). Reescriure la història canviaria tots els commits, i també el de l'etiqueta del preregistre (`preregistre-llei2`), que la decisió confirmatòria exigeix intacta. **Si el repositori es fa públic,** les opcions es valoren a l'auditoria 9: acceptar-ho tal com és, o bé publicar un repositori nou sense història, i mantenir el privat com a referència del preregistre | El responsable vol que totes les dades sensibles quedin en local. Separar la configuració de la màquina del codi també fa que el projecte es pugui fer servir en una altra instal·lació |
| 18-10-2026 | **Reorganització del repositori:**<br>- els scripts de lots, seguiment, proves netes, desplegament i còpia de les captures passen a `eines/`;<br>- `captures.sha256` passa a `docs/`;<br>- el README es reescriu amb imatges que es poden tornar a fer (`eines/imatges.mjs`, `docs/imatges/LLEGEIX-ME.md`). | A l'arrel hi havia massa fitxers per entendre el projecte d'un cop d'ull. Les imatges han de dir d'on surten, com els resultats |
| 19-10-2026 | **Revisió del repositori (X-014).**<br>- Els dos auditors revisen el repositori com a projecte que es pot fer públic. Totes les troballes es confirmen amb dades (AUD-68 a AUD-80 i AU2-42 a AU2-55), i l'inventari de tota la història no hi troba cap secret.<br>- El que hi coincideixen s'adopta a la PR R1: el README diu que la revisió és d'IA, i no humana; les frases que deien més que les dades es rebaixen; "vida" és una definició operativa; els crèdits concorden amb `NOTICE`.<br>- També hi entren: notes datades al protocol i a B2, la guia `docs/reproduir.md`, el glossari, `CITATION.cff`, la llicència de les dades, `CONTRIBUTING.md` i les proves amb Node 22 i 24.<br>- La síntesi és a `../auditories/claude-origins/equip/sintesi-revisio-repositori.md` | El projecte ha de poder ser llegit i comprovat des de fora, i no ha de prometre més del que hi ha |
| 19-10-2026 | **Decisions del responsable sobre la revisió del repositori.**<br>- **La història de git (D1):** de moment, no es decideix. El repositori continua privat.<br>- **Les auditories (D2):** se'n publicarà un índex de troballes, amb una línia i la resolució de cadascuna. Els informes sencers es queden en local.<br>- **La portada (D3):** l'animació a dalt, amb l'època i una imatge fixa de reserva, i els cinc nivells de zoom al README. L'exemple del món amb corrent se substitueix per 4 mons de cada condició triats a l'atzar, amb una llavor declarada (`eines/tria.mjs`).<br>- **L'anglès (D5):** un `README.en.md` sencer, amb el català com a versió principal, i un glossari català–anglès.<br>- **Publicar a fora (D4)** (Pages, un DOI per a les captures, un segell de temps extern, una revisió humana) es decidirà quan es vulgui fer públic | Les propostes en què els auditors divergien. Les quatre recomanacions de Claude (X-016), llevat de la història |
| 19-10-2026 | **B2: l'exploració, i què mesura la sèrie preregistrada.**<br>- **L'exploració** (entrada 9): 58 branques de 2.000 èpoques. La vida establerta gairebé no es mor (6 morts amb la regla R2, cap amb R3). L'1 % dona moltes morts falses. Amb R2, el corrent no l'escurça.<br>- **La decisió del responsable:** la sèrie preregistrada mesurarà quant dura la vida establerta, i el corrent passa a ser una pregunta secundària, sense cap afirmació confirmatòria.<br>- **L'esborrany** és a `docs/protocol-b2.md` (v0.1), i el revisa l'auditoria 9 | Amb tan poques morts, una prova del corrent amb 29 mons donaria molt poca informació. La durada és la pregunta que el responsable va plantejar a l'auditoria 7 |
| 19-10-2026 | **El paquet de l'auditoria 9 per a l'auditor 2 porta la història de git,** com les anteriors, per decisió del responsable.<br>- La història conté el seu nom i dades internes de risc baix (`../auditories/claude-origins/equip/inventari-historia.md`). Es demana als auditors que no les copiïn als informes.<br>- La resta del paquet passa la comprovació de privadesa. | L'auditor 2 pot comprovar el preregistre de la llei 2 pel seu compte |
| 19-10-2026 | **Auditoria 9: el disseny de B2, decidit pel responsable.**<br>- **La mesura principal:** la vida en el seu món, és a dir, la supervivència sense primera pèrdua sostinguda (R2) de les branques que continuen en la condició d'origen. Només s'estima, sense cap llindar.<br>- **L'única prova confirmatòria:** el canvi de règim, la branca que canvia la condició del seu món contra la que no la canvia, món a món.<br>- **La "S(H) > 0,5"** queda fora (AUD-83).<br>- **Abans de fixar H i K,** una prolongació pilot de 14 branques de l'exploració fins a *t* + 6.000 (`fase2/resultats/b2/pilot/`).<br>- **L'etiqueta `preregistre-b2`** porta un segell d'OpenTimestamps abans de la primera branca de la sèrie (D4, per a aquesta etiqueta) | A l'exploració, les branques que canvien de condició moren més (5 de 29) que les que la mantenen (1 de 29) (AUD-82). Ajuntar-les barrejaria dues coses, i la comparació per corrent amagava el patró. Tots dos auditors coincideixen a treure el llindar de 0,5 i a calibrar l'interval |
| 19-10-2026 | **Les propostes de l'auditoria 9 per a després de B2.**<br>- **B3, la mida del món:** a la mateixa edat. Primer 128 × 64 fins a l'època 16.000, amb unes 300 llavors, un llindar adaptat a la mida i un model d'exposició (auditor 1). L'auditor 2 proposa separar la mida de les vores.<br>- **B1, les ablacions:** primer, la densitat de replicadors a l'espai de programes per a cada variant, i només després la sopa, amb el cens de la mateixa química (AUD-65).<br>- **El temps variable:** un procés de Markov de dos estats, amb un generador separat i la mitjana realitzada controlada. S'ha de dissenyar després de B2, perquè el canvi de règim n'és la peça clau.<br>- **El seguiment de llinatges,** i desar el món final de cada branca | Es dissenyaran quan B2 estigui acabat; aquí només s'apunten |
| 19-10-2026 | **Quin resultat faria que valgués la pena fer públic el projecte** (pregunta del responsable als auditors, X-020; respostes X-021 i X-022).<br>- **El criteri del responsable:** fer-lo públic si hi ha un descobriment nou, encara que sigui petit, que permeti a altres investigadors continuar. Tots dos auditors separen obrir el repositori d'anunciar un descobriment. De moment es manté el criteri del responsable.<br>- **B2 passa a tenir dues proves confirmatòries, amb la correcció de Holm:** la del canvi de règim i la de l'**expansió amb corrent**. La mesura de l'expansió és la mitjana de la proporció d'hereditaris als 8 primers censos de cada branca, i es compara la condició amb corrent amb la que no en té, món a món, amb una prova de signes unilateral. Ve d'una candidata de l'auditor 1 que surt de l'exploració (22 de 29 mons, *p* = 0,008, comprovat). Només es confirma amb els 29 mons reservats, mai amb els de l'exploració.<br>- **Abans d'afirmar cap novetat,** una revisió escrita de la bibliografia, candidata per candidata.<br>- **La línia de descobriment** es tria després de la revisió. Les candidates són tres: l'enverinament per zeros, amb una intervenció; la maduració de la sopa, amb una prova que barreja els bytes; i la dependència de la història (auditor 2) | Una prova que es recolza en 6 morts té poca potència. L'expansió té una mesura contínua i aparellada: amb 29 mons i l'efecte de l'exploració, la prova de signes té una potència de 0,75. A 29 mons, Holm no li costa res (cal 21 de 29 tant amb α = 0,025 com amb 0,0125), i a la del canvi de règim li costa poc. Com a idea, l'expansió segurament no és nova: la teoria dels fronts d'invasió ja la preveu |
| 19-10-2026 | **La revisió de novetat, i quan es tria la línia de descobriment** (X-023).<br>- **La revisió** (`docs/estat-questio.md`, §11), comprovada al text de cada article:<br>&nbsp;&nbsp;- l'enverinament per zeros ja és a l'article de 2024 (fig. 2), i se n'ha corregit el quadern i el README;<br>&nbsp;&nbsp;- l'expansió amb corrent és coneguda;<br>&nbsp;&nbsp;- la durada de la vida BFF és un buit;<br>&nbsp;&nbsp;- la dependència de la història té un precedent (Jha i altres, 2026);<br>&nbsp;&nbsp;- la maduració és l'única on no hi ha res fet: ningú no ha fet una prova a edat fixa (continuar, barrejar els bytes, reiniciar).<br>- **La recomanació de Claude:** la maduració. És el punt de trobada dels tres, perquè tots la posen entre les tres primeres, i és la més determinista. Les tres branques surten d'una mateixa captura amb la mateixa llavor.<br>- **La decisió del responsable:** no es dissenya cap línia nova fins que B2 no tingui resultat | B2 ocuparà les dues màquines uns quants dies, i el seu resultat pot canviar l'ordre de les candidates |
| 20-10-2026 | **La prolongació pilot de B2, i el disseny de la sèrie** (protocol v0.4).<br>- **El pilot:** 14 branques fins a *t* + 6.000, idèntiques a l'exploració fins a *t* + 2.000. Cap pèrdua tardana, cap envelliment, i el cost s'estabilitza al voltant de 5 s per època.<br>- **El disseny:** el (i), *H* = 5.000 i *K* = 2, 116 branques. ~639 h de càlcul. *(La primera xifra, ~655 h, sortia d'un càlcul de cost que només comptava 7 de les 12 branques vives; corregit a l'auditoria 10.)* | Allargar l'horitzó de l'origen no aporta gaire si no hi ha pèrdues tardanes, i el (ii) perdria una llavor de canvi i potència a totes dues proves |
| 20-10-2026 | **Auditoria 10: el que s'adopta, i les decisions del responsable** (X-026; `../auditories/claude-origins/equip/sintesi-audit10.md`).<br>- **On coincideixen els dos auditors i Claude, adoptat:**<br>&nbsp;&nbsp;- l'interval logit, i el BCa com a sensibilitat;<br>&nbsp;&nbsp;- la prova de signes;<br>&nbsp;&nbsp;- unilateral, amb α = 0,025 i Holm;<br>&nbsp;&nbsp;- el canvi de règim es manté confirmatori, i un no-rebuig es comunica com a "no concloent per falta de potència".<br>- **La decisió del responsable sobre l'expansió (AU2-65):** la regla conjunta. Només es rebutja H₀ si, a més de Holm, el corrent dona més vida a més de la meitat dels mons A i dels B.<br>- **La decisió del responsable sobre la revisió:** una auditoria 11 curta, només de les correccions, abans de l'etiqueta `preregistre-b2`.<br>- **Les correccions:** el validador sencer (AU2-64), els enllaços simbòlics (AUD-88), la comprovació de les captures (AU2-66), el cost del pilot i el protocol v0.5.<br>- **Per a la prova de la maduració** (quan B2 tingui resultat): quatre braços.<br>&nbsp;&nbsp;- continuar;<br>&nbsp;&nbsp;- barrejar tots els bytes del món;<br>&nbsp;&nbsp;- barrejar els bytes dins de cada programa;<br>&nbsp;&nbsp;- reiniciar (auditor 1). | **La regla conjunta:** fa que l'afirmació valgui per als dos orígens. Amb un efecte homogeni, hi costa com a molt 1 punt de potència (75,1 % contra 75,1 %).<br>**L'auditoria 11:** l'auditor 2 va trobar dos problemes alts que l'auditor 1 no havia vist, i el protocol no es llança sense revisió |
| 20-10-2026 | **Auditoria 11: l'establiment es recalcula amb els censos, i una auditoria 12 molt curta** (X-029; `../auditories/claude-origins/equip/sintesi-audit11.md`).<br>- **Els veredictes:** l'auditor 1 dona GO, amb tres correccions de text, i l'auditor 2, NO-GO per l'AU2-71: l'establiment no es comparava amb els censos.<br>- **Les correccions:** l'establiment recalculat amb el criteri de `fase2/census.js`, l'esquema sencer de la capçalera i de la línia final, i el protocol v0.6, la versió preregistrada.<br>- **El que ve:** una auditoria 12, només del diferencial, abans de l'etiqueta `preregistre-b2`. Hi coincideixen tots dos auditors (l'1 demana ensenyar-los el diferencial, i el 2, una revisió limitada als canvis) | El text de l'etiqueta queda fix. Un validador que deixa passar una pèrdua fabricada no garanteix la decisió, i el protocol no es llança sense revisió |
| 20-10-2026 | **Auditoria 12: la frase de la decisió 1, i la comprovació final abans de l'etiqueta** (X-031; `../auditories/claude-origins/equip/sintesi-audit12.md`).<br>- **Els veredictes:** l'auditor 1, GO; l'auditor 2, NO-GO per l'AU2-74.<br>- **L'AU2-74:** la prova de signes del canvi de règim no compta els empats, i la frase "en la majoria dels mons" podia ser falsa. Ara diu "entre els mons amb una diferència de durada, predominen els que la tenen més curta", amb els recomptes (protocol v0.7).<br>- **El que ve:** una comprovació curta de les frases, i el GO de tots dos sobre el commit nou, que és el que s'etiquetarà | Una decisió confirmatòria ha de dir exactament el que posa a prova la seva prova, també en els casos extrems |
| 20-10-2026 | **El preregistre de B2: l'etiqueta i el segell.**<br>- **El GO:** tots dos auditors el donen a l'auditoria 13 (X-033, X-034).<br>- **L'etiqueta:** `preregistre-b2`, anotada, sobre `67fe2f6`, amb la SHA-256 del manifest, del protocol v0.7 i dels tres fitxers del programa. És a GitHub.<br>- **El segell:** d'OpenTimestamps, sobre l'objecte de l'etiqueta, el 20-10-2026 a les 21:48. Respostes de dos calendaris, abans de la primera branca (`docs/preregistre-b2/`).<br>- **Com es va decidir:** el responsable ho va aprovar després de veure'n les conseqüències: el client aïllat en un entorn virtual, i només s'envia un hash.<br>- **D'aquí endavant,** cap canvi al protocol, al manifest ni al programa sense justificar-lo al protocol, abans de mirar cap resultat | El preregistre ha de poder demostrar, a qui no confiï en git ni en GitHub, que el protocol i el programa eren aquests abans de la primera branca |
| 25-10-2026 | **El resultat de B2, i què en fem** (entrada 10; `fase2/resultats/b2/confirmacio/`).<br>- **L'execució:** 116 branques, del 20 al 25-10-2026, sense cap fallada ni cap resultat mirat. La decisió, des d'una còpia de l'etiqueta, amb la sortida desada tal com va sortir.<br>- **La durada en el seu món:** S_orig(5.000) = 93,1 % (IC logit 73,8–98,5 %).<br>- **Prova 1, el canvi de règim:** no concloent (3, 3 i 23; *p* = 0,66). Les 11 pèrdues són en 6 mons.<br>- **Prova 2, l'expansió:** es rebutja H₀ (22 de 29, A 10 de 12, B 12 de 17; *p* = 0,004, llindar de Holm 0,0125). És una confirmació del que preveu la teoria, no un descobriment.<br>- **Per a les sèries següents:** abans de llançar la primera branca, s'espera que el segell d'OpenTimestamps quedi ancorat a Bitcoin. Aquí va ser 6 minuts després (`docs/preregistre-b2/`).<br>- **El que ve:** l'auditoria 14 revisa l'execució, la decisió i com es comunica. La línia nova es tria després | El criteri del responsable per publicar és un descobriment nou, encara que petit. B2 dona una mesura i una confirmació, però no un descobriment, i ho diem així al quadern i al README |
| 25-10-2026 | **Auditoria 14: B2, la decisió acceptada i el text precisat** (X-041 i X-042).<br>- **Els veredictes:** l'auditor 1, TANCAR, amb dues correccions de text; l'auditor 2, CORREGIR la comunicació, no la ciència. Tots dos reprodueixen la decisió byte a byte i en refan els recomptes amb un script propi.<br>- **El que s'adopta, on coincideixen tots tres:** la segona prova mesura la part del món que ocupa la vida als primers censos, no la velocitat d'un front (AU2-75); la durada és "cap pèrdua sostinguda R2 en 5.000 èpoques" (AU2-77); el segell, separant què demostra Bitcoin, què registren els calendaris i què declara l'acta (AUD-104, AU2-76); l'horitzó i les 4 pèrdues d'origen al README (AUD-105); la concentració de les pèrdues, mirada després (AUD-106).<br>- **Dos descriptius nous, mirats després:** la fragilitat del món (AUD-107) i la convergència final amb corrent i sense (AUD-108).<br>- **Com:** un sol commit editorial a `main`, sense tocar cap registre, el protocol preregistrat ni el programa, amb una addenda a l'acta. Els dos auditors en comproven el text al xat, sense una auditoria nova | Les correccions són de comunicació, i el criteri de tancament de tots dos auditors és que el text digui exactament el que mesura la prova |
| 25-10-2026 | **La línia següent: la maduració de la sopa, i al costat, la fragilitat del món** (decisió del responsable, després de l'auditoria 14; `../auditories/claude-origins/equip/sintesi-audit14.md`).<br>- **La maduració:** la recomanem tots tres. Branques des d'una mateixa captura d'un món quiet sense vida, a una edat fixada: continuar, barrejar els bytes dins de cada programa i barrejar tots els bytes del món, el nucli comú dels dos auditors. Al pilot, també permutar els programes (auditor 2) i reiniciar (auditor 1). El mateix atzar de continuació a tots els braços. El contrast principal, continuar contra barrejar tot el món.<br>- **Primer, un pilot** per fixar l'edat, l'horitzó i el nombre de mons, i calcular la potència abans del protocol. Si surt baixa, no es fa la sèrie. El disseny del pilot el revisaran els auditors abans de fer córrer res.<br>- **La fragilitat del món (AUD-107):** una exploració de les captures de l'establiment, sense simular res, amb el pla escrit abans de calcular (`fase2/resultats/b2/fragilitat/PLA.md`). Confirmar-la demanaria mons nous amb vida, i es decidirà després | La maduració és la candidata amb més lloc per a un resultat nou (`docs/estat-questio.md`, §11) i admet un disseny causal net. L'exploració de la fragilitat no gasta càlcul, i és la candidata més propera a un resultat petit |
| 25-10-2026 | **B2, tancada** (comprovació breu de l'auditoria 14: X-044, de l'auditor 1, i X-045, de l'auditor 2).<br>- **Tots dos donen el text de `7b948c2` per bo:** diu exactament el que mesura cada prova. Tanquen AUD-104 a AUD-106 i AU2-75 a AU2-77.<br>- **Tres precisions opcionals, adoptades:** "de mitjana" a la segona prova; "nivells molt semblants" en lloc d'"el mateix nivell" (70,6 % i 70,7 %), perquè no és una prova d'equivalència; i una frase nova per al 3 contra 3, que barrejava dues comparacions.<br>- **D'aquí endavant,** B2 no es toca: el que en surti de nou serà una altra sèrie o una exploració marcada com a tal | El criteri de tancament dels dos auditors s'ha complert, i les precisions són de text |
| 25-10-2026 | **Auditoria 15: els pilots, corregits abans de fer córrer res** (`../auditories/claude-origins/equip/sintesi-audit15.md`).<br>- **Els veredictes:** l'auditor 1, GO per als dos pilots amb canvis; l'auditor 2, GO condicionat per a la maduració i NO-GO per al dels zeros tal com era.<br>- **El que s'adopta:** l'escaneig d'herència i l'exclusió a la maduració (AUD-111); al pilot dels zeros, els zeros passen a bytes de dades (AUD-112), amb un placebo aparellat cel·la per cel·la (AU2-78), i la mesura principal és el primer cens (AUD-110); l'eina no sobreescriu cap fitxer, i hi ha un manifest congelat i una comprovació prèvia (AU2-79); la potència, refeta amb el món com a unitat (AUD-113).<br>- **La hipòtesi dels zeros, precisada:** no hi eren abans de la vida (AUD-109); és un autoenverinament durant l'expansió.<br>- **Pendents del responsable:** si el pilot dels zeros és un pilot o una prova preregistrada dins dels 11 mons, i si s'hi afegeix el braç que desfà el codi de les deixalles | Els dos auditors coincideixen en els canvis, i el disseny v2 en fa la confluència |

## 6. Estat i resultats principals

Resum. El detall és al quadern.

- **Fase 1, sopa barrejada:** en 3 de 4 sopes neix un replicador. Els tres són palíndroms que es copien
  al revés amb el mateix bucle (`,` `<` `}`): evolució convergent.
- **L'enverinament:** cada còpia deixa zeros al company, i els zeros aturen les còpies. A la llavor 3,
  el replicador es va extingir.
- **La immunitat:** a la llavor 1, un replicador successor converteix els zeros en 255 i en surt
  il·lès. La vida es va adaptar sola al món que havia espatllat.
- **Fase 2a, món 2D (en marxa):** el simulador i el mapa funcionen. En una prova visual amb un replicador
  plantat (només per provar la interfície, no és un experiment), la família s'escampa amb formes
  ramificades, darrere del front queda un halo de cel·les sense família, i hi apareixen variants mutants
  amb territori propi.
- **Fase 2a, primer resultat:** en tres mons sense res plantat (llavors 1, 2 i 3) i 16.000 èpoques, no
  ha nascut cap família, ni tan sols local. Amb tan pocs casos no es pot dir que l'espai freni la vida:
  calen més llavors i més temps (vegeu l'entrada 3 del quadern).
- **Llei 2, escombrat de corrents (entrada 4):** el món quiet no ha fet vida cap vegada (0 de 3; **corregit a
  l'entrada 6:** amb 15 llavors, 3 de 15); amb corrent, 4 de 12 (a *m* = 0,001, 0,01 i 1, però 0 de 3 a *m* = 0,1). És una pista, no una conclusió:
  l'atzar de cada llavor pesa més que el corrent amb només 3 llavors per nivell. Han aparegut
  tres mecanismes de còpia: el palíndrom de la coma (`, < }`, per cinquena vegada), el palíndrom del punt
  (`. { >`, el de l'article de Google) i un **replicador que necessita una parella** (només es copia
  després d'un company ple de `<`). Amb *m* = 1 hi ha competència i successió de famílies.
- **Llei 3, experiment de branca (entrada 5):** des de l'esclat del replicador que necessita parella, la
  renovació sense direcció el salva (llindar entre el 0,1 % i el 0,3 % de cel·les per època; robust a
  l'1 %), i cap riu no el salva, ni tan sols un que aporta el mateix material (5 columnes per època va
  més de pressa que la "velocitat de la llum" de 2 cel·les per època). En un riu torrencial hi va
  néixer de nou el palíndrom del punt, que va arribar al 63 % del món: el riu alimenta i el corrent
  escampa (hipòtesi, 1 cas de 3).
- **Llei 2, sèrie de 15 llavors (entrada 6, exploratòria):**
  - **Resultat:** món quiet, 3 de 15; corrent 0,01, 8 de 15 (log-rank *p* = 0,043; Fisher *p* = 0,13). No
    es dona per demostrat.
  - **Aparició des de zero amb flux:** 2 de 6 amb riu i 2 de 6 amb renovació, sense cap senyal que el flux
    afavoreixi l'aparició.
- **Iteració 3 (entrada 7):**
  - **Cens v3:** la mesura de vida és ara la dels replicadors hereditaris.
  - **Copiadors esporàdics:** en mons sense vida establerta, gairebé tots són no hereditaris.
  - **Fidelitat:** l'intèrpret coincideix amb cubff.
  - **Protocol v0.2:** a punt per a l'auditoria 3.
- **Llei 2, sèrie confirmatòria (entrada 8, preregistrada, protocol v0.5):**
  - **Resultat:** món quiet, 24 de 80 (30 %); corrent 0,01, 34 de 80 (42,5 %). Log-rank Z = −1,83: no
    supera el límit, i **no es pot afirmar que el corrent canviï el ritme d'establiment**. Tampoc no es pot
    descartar un efecte de la mida que ens interessava.
  - **Descriptiu:** les dues etapes no s'assemblen (19/18 i 5/16). La vida establerta es manté
    1.000 èpoques en 23 de 23 mons quiets i en 26 de 33 amb corrent. Si només es compta la vida que
    dura, la diferència gairebé desapareix. **Corregit (auditoria 7):** només a la sèrie sencera. Per
    etapes, la vida que dura queda 18 contra 12 i 5 contra 14, i l'excés de la segona etapa no són
    esclats.
  - **El món quiet fa vida en un 30 % dels mons,** més del que deia l'exploració (20 %, amb 15 llavors).
- **B2, quant dura la vida establerta (entrada 10, preregistrada, protocol v0.7):**
  - **En el seu món:** el 93,1 % de les branques no tenen cap pèrdua sostinguda en 5.000 èpoques. Les 4 pèrdues
    d'origen són d'hora, fins a *t* + 1.500, i totes tornen a passar de l'1 %.
  - **El canvi de condició:** no concloent. Les pèrdues són poques i es concentren en pocs mons.
  - **Amb corrent, la vida ocupa més part del món** als 8 primers censos, als dos orígens (22 de 29; 9,9 punts
    de mediana). Al final, amb corrent i sense, arriba a nivells molt semblants (descriptiu, no una prova
    d'equivalència). És el que s'espera de la
    teoria dels fronts d'invasió, però la sèrie no mesura la velocitat de cap front.
  - **Mirat després (AUD-107):** la vida es torna a perdre als mons on ja s'havia perdut a la història original
    (6 de 7, contra 2 de 26). Caldria confirmar-ho.
- **Registre de famílies v2:** arregla els tres punts cecs de la v1. Sobre els mons desats de
  l'escombrat, ara troba el replicador que necessita parella (3,9 % del mapa), el palíndrom espaiat, i
  no s'inventa famílies en un món sense vida. Triga ~0,5 s per anàlisi en un món de 131.072 cel·les.
  `fase2/analitza.mjs fitxer.bin` fa l'anàlisi completa d'una captura.

## 7. Preguntes obertes

- Si l'ordre de la parella no importés, canviaria el tipus de vida que apareix?
- Les defenses accidentals (els zeros) generen una cursa d'armaments?
- En un món amb espai, poden conviure diverses famílies de replicadors?
- L'espai pur frena l'aparició de la vida? I si és així, quanta barreja (llei 2) cal perquè torni?
  (Pista de l'entrada 4: molt poca, un 0,1 % de cel·les per època. Cal confirmar-ho amb més llavors.)
  (Entrada 8: el món quiet contra el corrent 0,01, amb 80 llavors cadascun, no és concloent. Per detectar
  una diferència com l'observada, d'uns 12 punts, caldrien unes 250 llavors per condició.)
- El corrent fa que la vida establerta duri menys? (Entrada 8, descriptiu: no es manté en 7 de 33 mons
  amb corrent i en 0 de 23 sense corrent.) Seria una pregunta preregistrada pròpia, amb branques des de
  les captures de l'establiment. (Auditoria 7: 6 dels 7 casos són de la primera etapa, i a la segona
  la vida que dura queda 5 contra 14. Els indicis són més febles del que semblava.)
- Un corrent que canvia amb el temps, entre la calma i el temporal, fa més vida que un de constant
  amb la mateixa mitjana? (Proposta del responsable del projecte, 18-10-2026; §4.)
- **La corba dosi-resposta del corrent** (auditoria 8, auditor 1). La llei 2 pregunta quanta barreja
  necessita la vida, però només se n'han provat dos punts, 0 i 0,01. Si la incidència passa del 30 % al
  42 % i s'acosta al 100 % a la sopa barrejada, l'efecte més fort és a la corba. Candidata per a una sèrie
  futura: 5 o 6 nivells (0, 0,003, 0,01, 0,03, 0,1 i 1), amb una prova de tendència.
- **Quant temps necessita una línia hereditària per diversificar-se i resistir un canvi de l'entorn**
  abans d'extingir-se? (Auditoria 8, auditor 2.) Es pot mesurar amb branques aparellades i pertorbacions
  controlades.
- **El ritme d'establiment depèn de l'edat del món** (auditoria 8, AUD-64, descriptiu). Al món quiet de la
  sèrie de la llei 2, és unes tres vegades més alt a la segona meitat que a les primeres 4.000 èpoques.
  Abans que hi pugui aparèixer un replicador, la sopa ha de "madurar"? Afecta el disseny de B3.
- Per què les dues etapes de la sèrie de la llei 2 donen resultats tan diferents (19/18 i 5/16)?
  (AU2-33: el mateix patró a totes dues màquines; cap causa coneguda.)
- El replicador que necessita una parella pot sobreviure en un món que no s'enverini tan de pressa?
  És el camí natural cap a la reproducció entre dos. (Entrada 5: sí, amb prou renovació.)
- Els mons amb riu i corrent afavoreixen que neixi vida? (Entrada 5: un cas en 750 èpoques.) Cal un
  experiment d'aparició des de zero amb riu. (Entrada 6: 2 de 6 amb riu i 2 de 6 amb renovació, sense
  cap senyal que ho afavoreixin.)
- On és el coll d'ampolla: en l'aparició d'un replicador hereditari o en el seu establiment? (Iteració 3:
  els copiadors esporàdics són gairebé tots no hereditaris.)
- Quins ingredients de la química són necessaris perquè hi neixi vida (les ablacions de §4)?
- El temps fins a l'establiment és inversament proporcional a la mida del món, com caldria esperar si
  l'origen és un esdeveniment rar i local?
- Hi ha replicadors que en porten un altre a dins ("passatgers") i el copien amb ells? Poden aparèixer
  cooperacions (hipercicles) en un món amb espai?
- Què cal perquè la complexitat continuï creixent?
