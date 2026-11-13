# La maduració de la sopa sense vida, descrita amb les dades que ja tenim (exploratori)

**Què és:** el primer pas de la línia de la maduració, que el responsable va triar l'11-11-2026 (`docs/disseny.md`): què passa a la
sopa abans de la vida, i quant en depèn que la vida s'hi estableixi. Aquest pas només descriu, amb dades que ja existeixen.

**Per quin carril va:** pel d'explorar, el segon acord de l'11-11-2026.
- **Sense auditoria abans de calcular.** L'auditoria ve després, sobre el que s'hi hagi trobat.
- **Aquesta nota, escrita abans de calcular res:** què es mira, per què, i què ens faria abandonar la línia.
- **Cap simulació i cap llavor nova.** Els scripts només llegeixen registres i captures.
- **Tot el que en surt és exploratori:** una pista per al pas següent, no un resultat.

## 1. Les dades

Totes existeixen des d'abans d'aquesta nota. Cap no és d'una sèrie pendent de decidir.

| Dades | Què són | Quantes |
|---|---|---|
| `serie-llei2/A` i `B` | Mons de 0 a 16.000 èpoques: quiets, i amb corrent 0,01 | 80 i 80 |
| `maduracio/serie/envelliment` | Mons quiets de 0 a 8.000 èpoques | 196 |
| `maduracio/serie/branques` | Des de l'època 8.000, 8.000 èpoques més: la sopa que continua, la barrejada i la nova | 900 (150 mons, 3 braços, 2 branques) |
| `maduracio/serie/alicuotes` | L'escaneig de totes les cel·les de cada sopa envellida i de cada sopa transformada | 186 mons |
| `maduracio/pilot` | El mateix, amb cinc braços | 24 mons i 220 branques |
| `vm/` | La sèrie exploratòria del corrent, de l'octubre (generador v1, només text): corrent 0, 0,001, 0,01 i 0,1 | 30 mons |
| `fase1/resultats` | La sopa barrejada del tot (només text) | 3 llavors |
| Les captures, que no són a git | Les 196 sopes envellides de la sèrie, les 24 del pilot i el món 1034 (una cada 100 èpoques, fins a la 16.000) | 380 |

**Què porta cada registre:**
- **cada 100 èpoques:** l'entropia dels bytes (H0), l'entropia d'ordre alt (HOE), les operacions i les execucions;
- **cada 250 èpoques, el cens:** en una mostra de 2.048 cel·les, quantes es repliquen, quantes són hereditàries, i les famílies;
- **al `.log`, cada 100 èpoques:** els tres bytes més freqüents i els tres fragments de 12 bytes més freqüents.

**Les sèries amb vida** (B2 i els zeros) no es fan servir: parlen de després de l'establiment.

## 2. Què ja sabem d'aquestes dades

No és una mirada cega. Abans d'aquesta nota ja coneixíem:
- **les decisions i els recomptes d'establiment** de totes les sèries (entrades 8, 12 i 14 del quadern);
- **les quatre anàlisis de l'avaluació de l'11-11-2026,** fetes de pressa i sense pla:
  - la corba de la maduració i el ritme per franges de 4.000 èpoques, a la sèrie del corrent;
  - la composició de les 22 sopes del pilot;
  - les posicions del `<` en un sol món, el 1034;
  - la instrucció de còpia de la família més gran, per braç.

**No havíem mirat:**
- la corba a les altres sèries, ni l'HOE, ni les operacions;
- els censos d'abans de l'establiment, ni els escanejos món a món;
- els bytes i els fragments dels `.log`, ni les captures de la sèrie.

## 3. Les preguntes

**P1. La corba és la mateixa a totes les sèries?**
- **La mesura:** D = 8 − H0, els bits que la distribució dels bytes s'allunya de la uniforme. També l'HOE i les operacions per execució.
- **On:** als mons sense vida, època a època, per a cada conjunt de dades: la mediana i del 5 % al 95 % dels mons.
- **Un món compta com a sense vida** mentre cap cens no hi ha vist cap hereditari i falten més de 1.000 èpoques per a l'establiment,
  si n'hi ha.
- **La dispersió és només soroll?** La correlació de rangs entre la desviació d'un món a l'època 2.000 i a la 8.000. Si un món que va
  avançat hi continua, les diferències entre mons són de veritat.

**P2. Què en queda quan es transforma la sopa?** La corba de D després de l'època 8.000, a cada braç, mentre no hi ha vida. A la
sèrie: la sopa que continua, la barrejada (els mateixos bytes, en un altre ordre) i la nova. Al pilot, a més: els programes canviats
de lloc, i els bytes barrejats dins de cada programa. La pregunta: la maduració és la composició, o és l'ordre?

**P3. El ritme d'establiment i l'edat del món.** Establiments per 100.000 mon-èpoques en risc, amb l'interval exacte de Poisson del
95 %, a cada conjunt. Les franges, fixades aquí: de 2.000 èpoques (de 0 a 16.000) i de 4.000.

**P4. A la mateixa maduració, el mateix ritme?** És la prova de la lectura «el corrent no fa més vida: fa madurar la sopa abans».
- **Les franges de D, fixades aquí:** de 0 a 0,05; a 0,10; a 0,15; a 0,20; a 0,30; i més de 0,30.
- **Quina D:** la mediana de la seva condició a aquella edat, i no la del món. La D d'un món puja quan la vida ja hi creix, abans que
  el cens la confirmi, i això lligaria les dues coses per força. Com a sensibilitat, la D del mateix món 1.000 èpoques abans.
- **Què es compara:** els establiments i l'exposició de cada franja, al món quiet i amb corrent.

**P5. Aparèixer i establir-se.**
- **Als censos d'abans de l'establiment:** la proporció de censos amb alguna cel·la que es replica, i amb alguna d'hereditària, per
  franja d'edat. I quants mons on s'ha vist un hereditari acaben amb la vida establerta.
- **Als escanejos** (totes les cel·les, a l'època 8.000): quantes cel·les es repliquen i quantes són hereditàries a cada sopa
  envellida, a la barrejada i a la nova. I si el recompte d'un món prediu que la vida s'hi estableixi al braç que continua.

**P6. Els bytes.**
- **Als `.log`:** els bytes i els fragments més freqüents, i quant, per època, als mons sense vida de cada conjunt.
- **A les captures:** l'histograma dels bytes, el perfil per posició del programa, les tirades i els motius de dos bytes al començament
  del programa (`<,`, `{.` i els altres), a totes les sopes envellides de la sèrie i del pilot, i al món 1034 cada 500 èpoques.

**P7. Els fundadors.** El nucli de la família més gran al cens que confirma l'establiment, per conjunt, per braç i per edat del món:
la instrucció de còpia (`,`, `.` o totes dues) i si porta `<`. Com a sensibilitat, amb totes les famílies d'aquell cens.

## 4. Què ens faria abandonar la línia, escrit abans de calcular

| | Què | El resultat que la faria caure |
|---|---|---|
| A1 | La corba es repeteix | La mediana de D dels mons quiets, a l'època 4.000 o a la 8.000, difereix més d'un 10 % entre la sèrie del corrent (A) i l'envelliment de la sèrie de la maduració |
| A2 | El ritme va lligat a l'edat | Amb tots els mons quiets junts, el ritme de 8.000 a 16.000 no és més alt que el de 0 a 4.000: l'interval del 95 % del quocient inclou l'1 |
| A3 | La sopa envellida fabrica ingredients | Als escanejos, la sopa envellida no té més cel·les que es repliquen que la nova |

**I un resultat que no la faria caure, però en canviaria la lectura** (P4): si a la mateixa D el corrent té un ritme clarament més
alt que el món quiet, el corrent fa alguna cosa més que madurar la sopa.

## 5. Què no es fa

- **Cap simulació, cap llavor nova,** i cap eina de B1 amb les llavors del seu pla. Res del càlcul pendent de B1.
- **Cap prova confirmatòria.** Els intervals són descriptius, i s'hi miren moltes coses: el que en surti és una pista per al pas
  següent (simulacions petites) i per a la intervenció preregistrada.

## 6. Com

- **Els scripts** són en aquesta carpeta, cadascun amb la seva sortida (`NOM-sortida.txt`). Només llegeixen.
- **Les captures** no són a git. Els scripts que les llegeixen reben la carpeta com a argument, i en desen un resum (JSON), amb la
  SHA-256 de cada captura, que sí que hi va.
- **Els resultats,** en aquest mateix fitxer, a sota, quan hi siguin.

---

# Resultats (11-11-2026)

> **Corregit (la consulta X-105, 12-11-2026, i l'auditoria 31, 13-11-2026; AUD-188).** Tres frases d'aquests resultats diuen més del que
> mostren les dades. Es queden tal com eren, i valen les correccions de l'[entrada 16](../../../../quadern/index.html#entrada-16):
> - **«El que canvia amb l'edat no és quants n'hi ha, sinó quants arrelen»** (aquí a sota). Un recompte en un moment no és un ritme
>   d'aparició. Encara no sabem si la maduració actua sobre l'aparició, sobre l'arrelament o sobre totes dues: ho ha de dir el pilot que les
>   mesuri per separat (AUD-184 = AU2-151).
> - **«Dues branques d'un mateix món s'estableixen de manera independent»** (P3 i el final). Els recomptes en són compatibles, però amb
>   poca potència, i la independència seria, com a molt, condicional: les dues branques comparteixen la història del món (AUD-183, AU2-152).
> - **«Les hereditàries soles són falsos positius de la prova»** (P5, l'escaneig del 1034 i el final). Ho són de l'autonomia: no es copien
>   sense el company (AU2-152). I que no es copiïn amb companys inerts no prova que la còpia la fes el codi del company (AU2-153).
>
> I una precisió: «la sopa vella té menys cel·les que es copien que la nova» és dels positius de l'escaneig. El pas 2b ho manté amb companys
> inerts, però l'escaneig es deixa replicadors de debò, i les hereditàries no es poden comparar entre les sopes (AUD-189,
> `../recompte/README.md`).

Tot és exploratori: una descripció feta després de les decisions, amb moltes mirades. Les xifres són a les sortides dels scripts.

**En una frase:** la sopa sense vida madura igual a tots els mons, i la vida s'hi estableix més sovint com més vella és. Però la sopa
vella no té més replicadors que la nova: en té menys. El que canvia amb l'edat no és quants n'hi ha, sinó quants arrelen.

## Els tres resultats que ens farien abandonar la línia

| | Què | Què ha sortit |
|---|---|---|
| A1 | La corba es repeteix | **Es repeteix.** Entre conjunts independents, la mediana de D difereix menys d'un 0,5 % (el límit era un 10 %) |
| A2 | El ritme va lligat a l'edat | **Hi va.** De 8.000 a 16.000 èpoques, el ritme és 2,99 vegades el de 0 a 4.000 (interval del 95 %: de 1,92 a 4,82) |
| A3 | La sopa envellida fabrica ingredients | **Cau, tal com l'havíem escrit.** La sopa envellida té 23 cel·les que es repliquen, i la nova, 118. No en fabrica: n'hi ha cinc vegades menys |

La línia continua, perquè A1 i A2 se sostenen i l'efecte de la sèrie de la maduració és confirmat. Però la lectura canvia (vegeu «Què
corregeix»).

## P1. La corba és la mateixa a totes les sèries (`corbes-sortida.txt`)

La mediana de D (bits) als mons quiets sense vida, en cinc conjunts independents:

| Època | Sèrie del corrent (80) | Envelliment de la sèrie (196) | Envelliment del pilot (24) | Sopa nova de la sèrie (300) | Sopa nova del pilot (44) |
|---|---|---|---|---|---|
| 1.000 | 0,0142 | 0,0142 | 0,0142 | 0,0142 | 0,0141 |
| 4.000 | 0,1000 | 0,0996 | 0,1003 | 0,0997 | 0,0999 |
| 8.000 | 0,1684 | 0,1678 | 0,1686 | 0,1682 | 0,1682 |

- **Les diferències entre mons s'esborren.** A una mateixa època, els mons difereixen un 2 % (desviació de 0,004 bits a l'època 8.000).
  La correlació de rangs entre la D d'un món a dues èpoques baixa de 0,5–0,7 (èpoques 1.000 i 2.000) a 0,1–0,2 (2.000 i 8.000).
- **Dues branques d'un mateix món** comencen iguals i se separen: la correlació amb la D del món a l'època 8.000 és de 0,90 al cap de
  1.000 èpoques i de 0,13 al cap de 8.000.
- **Què vol dir:** la corba és un camí comú. Un món que va avançat no hi continua: la sopa oblida d'on ve.
- **Les altres dues mesures** fan el mateix a tots els conjunts. L'HOE puja fins a l'època 3.000 (0,347) i després baixa (0,288 a la
  16.000). Les operacions per execució pugen sempre: de 68 a 184.

## P2. Què en queda quan es transforma la sopa (`corbes-sortida.txt`)

La mediana als mons sense vida, pel temps passat des de la transformació (la sopa envellida d'origen: D 0,168; 168 operacions):

| | La que continua | Barrejada (els mateixos bytes) | Programes canviats de lloc | Bytes barrejats dins del programa | Nova |
|---|---|---|---|---|---|
| D, al cap de 2.000 èpoques | 0,182 | 0,194 | 0,198 | 0,178 | 0,042 |
| D, al cap de 8.000 | 0,194 | 0,198 | 0,197 | 0,191 | 0,168 |
| Operacions per execució, al cap de 100 | 169 | 266 | 176 | 167 | 68 |
| Operacions per execució, al cap de 8.000 | 184 | 182 | 186 | 185 | 169 |
| HOE, al cap de 500 | 0,305 | 0,482 | 0,352 | 0,270 | 0,197 |

(Les columnes de la barrejada, la que continua i la nova són de la sèrie, amb 150 mons; les altres dues, del pilot, amb 22.)

- **Barrejar els bytes fa la sopa molt més activa** durant uns milers d'èpoques: un 57 % més d'operacions per execució. Després torna
  al mateix lloc que la que continua.
- **Canviar els programes de lloc també l'accelera,** sense tocar cap programa. En un món quiet, doncs, la maduració la frena que cada
  programa sempre té els mateixos veïns.
- **La maduració no és només la composició:** amb els mateixos bytes, la sopa barrejada es comporta d'una altra manera.

## P3. El ritme d'establiment puja amb l'edat (`ritme-sortida.txt`)

Tots els mons quiets junts: la sèrie del corrent sense corrent, els envelliments, la sopa que continua i la sopa nova. Establiments
per 100.000 mon-èpoques (entre parèntesis, l'interval del 95 %):

| Edat de la sopa | Establiments | Ritme |
|---|---|---|
| De 0 a 2.000 | 13 | 1,02 (de 0,54 a 1,74) |
| De 2.000 a 4.000 | 13 | 1,04 (de 0,55 a 1,78) |
| De 4.000 a 6.000 | 21 | 1,73 (de 1,07 a 2,65) |
| De 6.000 a 8.000 | 23 | 1,96 (de 1,24 a 2,94) |
| De 8.000 a 10.000 | 19 | 2,32 (de 1,40 a 3,63) |
| De 10.000 a 12.000 | 21 | 2,71 (de 1,68 a 4,14) |
| De 12.000 a 14.000 | 23 | 3,16 (de 2,00 a 4,74) |
| De 14.000 a 16.000 | 29 | 4,29 (de 2,87 a 6,16) |

- **No s'hi veu cap aplanament.** La D gairebé no puja després de l'època 12.000 (de 0,190 a 0,195), i el ritme sí. Un avís: la sopa
  que continua és de mons triats perquè no tenien cap hereditari a l'època 8.000, i això fa baixar el ritme de just després.
- **La sopa barrejada** té l'avantatge al començament: 5,41, 4,25, 3,11 i 3,11 en les quatre franges de 2.000 èpoques, contra 2,20, 2,49,
  3,41 i 3,87 de la que continua. Coincideix amb el temps que és més activa (P2).
- **Dues branques d'un mateix món s'estableixen de manera independent** (no era a la nota). Mons amb la vida a totes dues branques:
  7 a la sopa que continua (independents, se n'esperarien 6,8), 12 a la barrejada (11,2) i 4 a la nova (2,7). Que la vida s'estableixi
  no ve escrit a la sopa de partida: és un esdeveniment d'atzar, amb un ritme que depèn de l'estat de la sopa.
- **Una cosa que no sabem explicar** (no era a la nota): la sopa nova de les branques s'estableix 1,95 vegades més que els mons que
  comencen a l'època 0 (48 establiments contra 22; interval del quocient, de 1,16 a 3,39), i haurien de ser iguals: són sopes a
  l'atzar fetes amb el mateix generador, i la seva corba de D és idèntica. Pot ser l'atzar, entre tantes mirades. Cal comprovar-ho.

## P4. A la mateixa maduració, el mateix ritme? (`ritme-sortida.txt`)

- **Per edat,** el corrent (0,01) només té avantatge abans de l'època 8.000. El quocient del ritme amb corrent sobre el del món quiet:
  3,78 (de 0 a 2.000), 0,65 (de 2.000 a 4.000), 2,64 (de 4.000 a 8.000) i 1,07 (de 8.000 a 16.000; interval de 0,57 a 1,90).
- **A la mateixa D,** on hi ha totes dues condicions (D per sota de 0,20, que amb corrent són les primeres 3.900 èpoques): amb corrent,
  7 establiments, i amb el ritme dels mons quiets se n'esperarien 4,4 (observats sobre esperats: 1,61, de 0,65 a 3,31). Amb la D del
  mateix món 1.000 èpoques abans: 18 contra 10,6 (1,70, de 1,01 a 2,69).
- **La D no és una escala comuna.** El món quiet no passa de 0,20, i amb corrent arriba a 0,35 amb el mateix ritme final (3,1 i 3,3).
- **Què en queda:** el corrent avança l'establiment i no en canvia el ritme final. Que només faci madurar la sopa abans no queda
  provat: a la mateixa D, amb corrent el ritme sembla una mica més alt, amb pocs establiments.

## P5. Aparèixer i establir-se (`escanejos-sortida.txt` i `ritme-sortida.txt`)

Cel·les de cada sopa, de 131.072, a l'escaneig de totes les cel·les (la mitjana dels 150 mons de la sèrie):

| Sopa | Es repliquen | Hereditàries |
|---|---|---|
| Nova (a l'atzar) | 118 | 0,41 |
| Envellida, tal com és (època 8.000) | 23 | 0 |
| Envellida i barrejada (els mateixos bytes) | 706 | 6,8 |
| Envellida, amb els bytes barrejats dins de cada programa (pilot, 22 mons) | 91 | 0,64 |
| Envellida, amb els programes canviats de lloc (pilot, 22 mons) | 31 | 0,14 |

- **La sopa envellida té menys cel·les que es repliquen que la nova,** a tots 150 mons. I les seves 23 no depenen de l'edat: als
  censos, el recompte és el mateix de l'època 250 a la 16.000 (de 22 a 24 per món). Les 118 de la sopa nova es perden abans del
  primer cens.
- **Els seus bytes sí que en farien més:** barrejats, donen sis vegades més cel·les que es repliquen que una sopa nova, i disset
  vegades més d'hereditàries. La sopa envellida té una composició rica, però ordenada d'una manera que no fa replicadors.
- **Tenir hereditàries a la sopa de partida no fa que la vida s'hi estableixi.**
  - A la sopa nova: amb alguna hereditària, s'estableix al 12 % de les branques (12 de 98); sense cap, al 14 % (28 de 202).
  - A la sopa barrejada: cada sopa comença amb unes 7 hereditàries, i només el 5 % de les branques s'estableixen en les primeres
    1.000 èpoques (16 de 300).
- **Als mons envellits sense vida, de tant en tant hi ha una hereditària sola.** Dels 172 mons escanejats a l'època 8.000, 19 en
  tenien exactament una, i 3 en tenien un miler (la vida hi creixia). *(Les soles, segurament falsos positius de la prova: vegeu l'escaneig del 1034, a sota.)*
- **Als censos,** els episodis d'hereditaris que s'apaguen són freqüents: a la sèrie del corrent sense corrent, 16 s'apaguen i 24
  acaben en establiment. La part que acaba bé puja amb l'edat: del 62 % (de 0 a 4.000) al 81 % (de 12.000 a 16.000).
- **Amb corrent hi ha explosions que s'apaguen** (`anomalies-sortida.txt`): als mons 2014 i 2059 de la sèrie del corrent, un replicador
  arriba al 4 % i al 6 % de les cel·les en un cens, i al cens següent gairebé no en queda. El criteri no els compta, amb raó: no duren.

## P6. Els bytes (`captures-sortida.txt` i `bytes-logs-sortida.txt`)

Les 150 sopes envellides sense vida de la sèrie, a l'època 8.000. La mediana, i entre parèntesis del mínim al màxim de tots els mons:

| Byte | Vegades l'atzar | | Byte | Vegades l'atzar |
|---|---|---|---|---|
| `<` | 10,3 (de 9,8 a 10,7) | | `{` | 2,3 (de 2,1 a 2,5) |
| `,` | 3,9 (de 3,6 a 4,3) | | `}` | 1,9 (de 1,7 a 2,0) |
| `>` | 3,4 (de 3,3 a 3,6) | | `.` | 1,4 (de 1,3 a 1,6) |
| `[` | 2,9 (de 2,7 a 3,2) | | `]` | 1,3 (de 1,2 a 1,3) |
| | | | `+` i `-` | 0,8 |

- **És el mateix a tots els mons:** les xifres del món 1034 de l'avaluació es repeteixen als 150. El 7,45 % dels programes comencen
  amb `<` (del 5 % al 95 % dels mons: de 7,2 a 7,7), i el 36 % dels `<` en tenen un altre al costat (amb bytes independents, el 8 %).
- **El que hi domina són les tirades d'un mateix byte,** no el motiu `<,` de l'avaluació. Programes que comencen amb cada parella
  d'instruccions (a l'atzar, 2 per món): `<<`, 2.044; `>>`, 1.282; `}}`, 849; `,,`, 634; `{{`, 612; `<,`, 237.
- **Passa de seguida:** al món 1034, a l'època 100 ja hi ha 566 programes que comencen amb `>>`. Els `<` del final dels programes
  arriben al màxim a l'època 1.500 (el 40 % dels `<` a les 8 últimes posicions) i després baixen (el 26 % a la 16.000).
- **Amb corrent pugen els mateixos bytes, i més** (als `.log`): a l'època 8.000, el `<` és el 5,8 % dels bytes (sense corrent, el 4,0 %).
  El `<` és el byte més freqüent a tots els mons sense vida de totes les condicions, des de l'època 500.

## P7. Els fundadors (`fundadors-sortida.txt`)

La instrucció de còpia de la família més gran al cens que confirma l'establiment, a tots els mons quiets, per l'edat de la sopa:

| Edat de la sopa | Només `,` | Només `.` | Amb `,` |
|---|---|---|---|
| De 0 a 2.000 | 6 | 7 | 46 % |
| De 2.000 a 4.000 | 9 | 4 | 69 % |
| De 4.000 a 8.000 | 30 | 12 | 71 % |
| De 8.000 a 12.000 | 32 | 5 | 86 % |
| De 12.000 a 16.000 | 38 | 12 | 76 % |

- **A la sopa jove, els dos tipus de fundador surten igual** (`[<,}]` i `[{.>]` fan el mateix amb els dos caps canviats). **A la sopa madura, quatre de
  cada cinc copien amb `,`.** La sopa acumula sobretot `<` i `,`, i la vida que s'hi estableix n'hereta el biaix.
- **Amb totes les famílies d'aquell cens,** i no només la més gran, surt el mateix a cada conjunt.

## Què corregeix de l'avaluació de l'11-11-2026

| El que deia l'avaluació | El que surt amb totes les dades |
|---|---|
| El ritme d'establiment s'aplana quan la maduració s'aplana (§3.3) | **No se sosté.** Amb sis vegades més dades, el ritme continua pujant fins a l'època 16.000, i la D no. Ho havia dit amb 9 i 7 establiments |
| La sopa fabrica els ingredients del primer replicador (§3.5) | **Cal dir-ho d'una altra manera.** La composició s'enriqueix, però la sopa envellida, tal com és, té menys replicadors que una de nova, i tenir-ne no fa que la vida s'hi estableixi |
| Un motiu de dos bytes, `<,`, que copia un sol byte (§3.4) | **No és el principal.** Hi dominen les tirades d'un mateix byte (`<<`, `>>`, `}}`), que cal explicar |
| La sopa sense vida canvia igual a tots els mons (§3.1) | **Se sosté,** amb cinc conjunts independents i 150 captures |
| La barreja la fa madurar més de pressa (§3.2) | **Se sosté,** i també canviant els programes de lloc |
| Els fundadors copien sobretot amb `,` (§3.5) | **Se sosté,** i creix amb l'edat de la sopa |

## Què en surt per al pas següent

**La hipòtesi, tornada a escriure:** l'establiment de la vida és un esdeveniment d'atzar, i el seu ritme és el producte de dues coses:
quants replicadors apareixen i quina part arrela. A la sopa hi apareixen replicadors hereditaris tot sovint, i gairebé tots es perden.
El que la maduració canvia és, sobretot, quina part arrela, i de quin tipus són.

**El que cal mesurar al pas 2,** amb simulacions petites i escanejos de totes les cel·les cada poques èpoques:
1. **Quants hereditaris apareixen per època i quant duren,** en sopes de diverses edats. Ara només en tenim una foto, a l'època 8.000.
2. **Què els passa als que comencen sols:** si es perden perquè no es copien prou o perquè els veïns els espatllen.
3. **D'on surten les tirades** (`<<`, `>>`, `}}`), i per què el `<` guanya al `{`, si les instruccions són simètriques.

**Preguntes obertes que han sortit:**
- la diferència entre la sopa nova de les branques i els mons que comencen a l'època 0 (P3);
- un món del pilot (`5018-shuffle-within-a`) on la sopa canvia del tot (D 0,93) amb cel·les que es repliquen i cap d'hereditària;
- les explosions que s'apaguen amb corrent (P5).

## Els límits

- **És exploratori,** amb moltes mirades i sense correcció: cada interval és descriptiu.
- **Les branques no són mons independents:** dues per món, i de mons triats a l'època 8.000.
- **Els censos miren 2.048 cel·les de 131.072:** un replicador amb poques còpies gairebé mai no s'hi veu.
- **L'HOE depèn de la versió de zlib** (AUD-55), i els conjunts es van fer amb dues versions.
- **No s'ha fet:** dels `.log`, els fragments de 12 bytes; i de les captures, les 24 del pilot (les 150 de la sèrie i les 22
  composicions del pilot ja diuen el mateix).

---

# Afegit: els replicadors d'un món sense vida, al llarg del temps (la nota, abans de calcular)

**Per què:** dels resultats d'aquí dalt en surt que la sopa sempre té unes 23 cel·les que es repliquen, que de tant en tant hi ha
una hereditària sola, i que gairebé totes es perden. Però només en tenim una foto per món, a l'època 8.000. El món 1034 (quiet, sense
vida fins a l'època 16.000) té una captura cada 100 èpoques: es pot mirar què hi passa al llarg del temps, sense simular res.

**Què es fa:** l'escaneig de totes les cel·les de cada captura, amb la prova de replicació del projecte (`fase2/replication.js`, la
completa i la de segona generació; la mateixa de `eines/transforma.mjs --scan`). De cada cel·la que es replica se'n desa la posició,
el programa i si és hereditària. L'atzar de la prova: la llavor 711.000 més l'època, que no és de cap pla.

**Quines captures:** totes les del món 1034, de l'època 100 a la 16.000, cada 100 èpoques (160).

**Les preguntes:**
1. **Quantes cel·les es repliquen i quantes són hereditàries a cada època.** En especial al començament: una sopa nova en té 118, i
   una d'envellida, 23.
2. **Quant duren:** d'una captura a la següent (100 èpoques), quantes continuen al mateix lloc, amb el mateix programa.
3. **De què estan fetes** les hereditàries, i si canvien amb l'edat de la sopa.

**Què en canviaria la lectura:**
- si les hereditàries duren moltes captures sense escampar-se, el que falla no és que es perdin, sinó que no es copien prou;
- si gairebé cap no arriba a la captura següent, el que falla és que es perden de seguida.

**Els límits, d'entrada:** és un sol món, i la prova fa servir l'atzar (el company de cada cel·la). El tall de les 150 sopes de la
sèrie a l'època 8.000 és a `escanejos-sortida.txt`.

## Resultats de l'escaneig del món 1034 (11-11-2026)

**L'escaneig** (`escaneig-1034.jsonl` i `escaneig-analisi-sortida.txt`): les 160 captures, de les 11.00 h a les 12.05 h.

1. **Les cel·les que es repliquen són poques, i sempre en el mateix nombre:** 52 a l'època 100, i de 12 a 35 a totes les captures
   següents fins a la 16.000, llevat del brot (la mitjana per franges, de 20 a 31). Gairebé nou de cada deu es repliquen soles.
2. **Cap no dura:**
   - d'una captura a la següent (100 èpoques), només de l'1 al 3 % de les cel·les que es replicaven ho continuen fent a la mateixa
     cel·la, i cap amb el mateix programa;
   - en 100 èpoques, la sopa es reescriu gairebé sencera: només l'1,8 % dels programes (a la sopa jove) i el 0,7 % (a la vella)
     continuen iguals byte a byte.
3. **Un brot que s'apaga:** a les captures 5.200, 5.300 i 5.400, una família (`[[[[<},]],}<[[[[`) arriba a 46, 47 i 76 cel·les
   hereditàries, totes en un racó de 20 × 21 cel·les. A la 5.100 i a la 5.500 no n'hi ha cap. El cens només en va veure 2, a l'època
   5.250, lluny de l'1 % de la mostra que cal per a l'establiment.
4. **Les hereditàries soles són falsos positius de la prova** (`reprova-hereditaries-sortida.txt`; afegit després de veure l'escaneig,
   no era a la nota).
   - **Què hi ha:** fora del brot, l'escaneig en troba 11, una per captura, totes soles, d'1 a 12 instruccions (`}`, `..`, `[<`…).
   - **La comprovació:** tornades a provar 200 vegades cadascuna amb llavors noves, cap no és hereditària en cap prova, i només una es
     replica (2 vegades de 200). Les del brot (una de cada quatre, 43), hereditàries en 200 de 200.
   - **Què deu passar:** la prova posa al costat de la cel·la un company de bytes a l'atzar. Si aquest soroll porta un bucle que copia,
     la còpia la fa el soroll, i el fill pot ser un replicador fet amb el codi del soroll i un tros de la cel·la.

**Què en canvia:**
- **Del pas 1:** les 19 sopes envellides amb exactament una hereditària, de les 172 escanejades a l'època 8.000, segurament són falsos
  positius com aquests. També ho poden ser, en part, les 0,41 hereditàries per món de la sopa nova.
- **De la sèrie de la maduració:** 19 dels 22 mons exclosos per tenir hereditàries a l'escaneig en tenien una. No canvia la decisió: el
  criteri es va fixar abans, i s'aplicava a cada món abans de repartir-lo en braços.
- **De B1:** les densitats d'hereditaris de programes a l'atzar poden incloure casos com aquests. La prova d'autonomia (§4), amb
  companys sense cap instrucció, ho dirà.
- **Per al pas 2:** una hereditària s'ha de tornar a provar abans de comptar-la com una aparició.

**La resposta a la pregunta de la nota:** les hereditàries es perden de seguida, i les soles ni tan sols ho eren. En 16.000 èpoques, al
1034 només hi ha hagut un brot de debò, i va durar entre 200 i 400 èpoques.

## La disposició de les instruccions al 1034 (11-11-2026, al vespre; una proposta de l'auditor 1)

`disposicio.mjs` i `disposicio-sortida.txt`, sense simular res. Per programa: la mitjana d'instruccions i la dispersió (la variància
dividida per la d'una binomial amb la mateixa mitjana; 1 vol dir repartides a l'atzar).
- **Les instruccions s'amunteguen en pocs programes:** la dispersió ja és de 2,6 a l'època 100, arriba a 10 cap a l'època 2.000–4.000 i
  baixa a 7,7 a la 16.000, mentre la D continua pujant. Des de l'època 4.000, el 30 % de les instruccions són en programes que en tenen 16 o
  més.
- **No és per les tirades de `<`:** sense comptar cap `<`, la dispersió encara és més alta (9,4 a l'època 8.000, contra 8,6 comptant-les
  totes), i comptant cada tirada com una sola, gairebé igual (7,6). L'amuntegament i l'acumulació de `<` són dos fenòmens diferents.

## Després de les avaluacions dels dos auditors (X-102, 11-11-2026)

Tots dos han refet les meves quatre anàlisis de l'avaluació, i les han contradit amb dades. El que canvia d'aquest pas 1:
- **P3, el ritme i l'edat:** la pujada del ritme amb l'edat és, en bona part, l'arrencada de qualsevol sopa que comença sense hereditaris.
  Al braç `continue`, la sopa ja és madura i el ritme també puja (l'auditor 1). La part que es pot atribuir a la maduració és d'1,29, amb un
  interval que inclou l'1. I a la mateixa edat i al mateix braç, la D no distingeix els mons que s'establiran (l'auditor 2, AU2-148). Queda
  el nivell: a igual temps des d'una sopa neta, la sopa vella s'estableix més sovint.
- **P7, els fundadors:** el que es compta no són els fundadors, sinó la família dominant al cens que confirma l'establiment (AU2-147). I la
  diferència no té dosi: dins de `reinit`, amb corrent i per terços de la D, no creix amb la maduració (l'auditor 1). La frase «creix amb
  l'edat de la sopa» no se sosté.
- **P6, els bytes:** els `<` nous surten sobretot dels programes que comencen amb `<`, i el motiu `<,` n'explica un 5 % (l'auditor 1). Les
  tirades de `<` són reals, més enllà de dos models nuls (l'auditor 2, AU2-149).
- **La novetat:** Greenbaum i Pargellis (2017) ja descriuen a Amoeba una fase prèvia semblant: les instruccions s'esbiaixen, s'escampen blocs
  curts i després apareixen els replicadors (AU2-146). La idea general no és nova.
- **El que no canvia:** la corba es repeteix; la barreja l'accelera; la sopa vella té menys cel·les que es copien que la nova (l'auditor 1
  hi arriba pel seu compte); i dues branques d'un mateix món s'estableixen de manera independent.

**I una cosa que els afecta a tots dos:** les hereditàries soles són falsos positius de la prova (l'escaneig del 1034, a dalt). Qualsevol
ritme d'aparició s'ha de comptar amb les hereditàries tornades a provar.
