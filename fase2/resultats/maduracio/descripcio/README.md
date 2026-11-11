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
