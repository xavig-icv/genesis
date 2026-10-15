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

## 2. Principis

1. **Dissenyem les lleis, mai els organismes.** Res de replicadors inicials, cap premi per replicar-se
   i cap instrucció que copiï un programa sencer d'un sol cop. La Terra també té unes lleis que la vida
   no va triar.
2. **Lleis generals, sense retocar-les fins que tot surti bé.** Si ajustem les lleis per obtenir un
   resultat, la vida l'hem posada nosaltres. Exemple rebutjat: una llei que "faci desaparèixer els
   zeros" seria dissenyar la cura d'una malaltia que ja coneixem (vegeu l'entrada 2 del quadern).
3. **Un canvi cada vegada.** Cada llei és un interruptor, i cada experiment es compara amb el grup de
   control (la Fase 1). Si canviem dues coses alhora, no sabrem quina ha causat l'efecte.
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
| 15-10-2026 | La VM (192.168.171.3, Debian 13) és un laboratori aïllat per als experiments; Claude hi entra amb una clau pròpia | Comparteix processador amb el PC (i7-7700HQ): no hi afegeix potència, però aïlla la feina |
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
- **Llei 2, escombrat de corrents (entrada 4):** el món quiet no ha fet vida cap vegada (0 de 3); amb
  corrent, 4 de 12 (a *m* = 0,001, 0,01 i 1, però 0 de 3 a *m* = 0,1). És una pista, no una conclusió:
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
- El replicador que necessita una parella pot sobreviure en un món que no s'enverini tan de pressa?
  És el camí natural cap a la reproducció entre dos. (Entrada 5: sí, amb prou renovació.)
- Els mons amb riu i corrent afavoreixen que neixi vida? (Entrada 5: un cas en 750 èpoques.) Cal un
  experiment d'aparició des de zero amb riu.
- Què cal perquè la complexitat continuï creixent?
