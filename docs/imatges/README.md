# D'on surten les imatges

Totes les imatges d'aquesta carpeta les genera `eines/imatges.mjs` a partir de captures `.bin`, amb els
colors del mode fosc de la interfície (`--tema fosc`). La corba també té una versió clara.
- **Les captures** no van a git (8 MB cadascuna), però es poden tornar a fer amb el mateix commit i la mateixa
  llavor.
- **Les que porten SHA-256** són a `docs/captures.sha256`, i es poden comprovar.

| Imatge | Què mostra | Captures |
|---|---|---|
| `colonia-animada.png` | Un PNG animat del món quiet de la llavor 1006 de la sèrie de la llei 2 (grup A): un fotograma cada 50 èpoques, de l'època 1.500 a la 2.900, amb l'època a la cantonada. Els visors que no animen en mostren l'últim fotograma. | 29 captures d'una nova execució de la mateixa llavor (vegeu més avall). |
| `zoom-1-mon.png` … `zoom-5-codi.png` | Cinc nivells de zoom sobre el mateix món a l'època 2.900, cadascun dins del rectangle de l'anterior. | La captura de l'època 2.900 de la mateixa execució. |
| `mons-a-l-atzar.png` | Quatre mons quiets (a l'esquerra) i quatre amb corrent 0,01 (a la dreta), triats a l'atzar d'entre els que la vida s'hi va establir, en el moment de l'establiment. | Les captures de l'època *t* de cada món, a `fase2/resultats/serie-llei2/{A,B}/captures/`. |
| `sopa-abans-i-despres.png` | Els primers programes de la sopa inicial de la llavor 1 de la Fase 1, al costat de la mateixa sopa a l'època 750. | `aleatoria:1:v1`, `fase1/resultats/llavor1-fils7-epoca750.bin` |
| `llei2-km.svg`, `llei2-km-fosc.svg` | La corba de Kaplan–Meier de la sèrie de la llei 2, en mode clar i en mode fosc. El README tria la del mode del lector. | Els JSONL de `fase2/resultats/serie-llei2/A` i `B` (sí que són a git). |

**Quines imatges són exemples i quines no.** L'única triada a l'atzar és `mons-a-l-atzar.png`.
- **La resta són il·lustratives,** triades a mà.
- **El món quiet de la llavor 1006** és un dels 24 mons quiets de la sèrie on la vida es va establir (de 80).
  Es va triar perquè hi neix una sola colònia, que es veu bé.
- **Al zoom,** les regions es van triar per mostrar el front de la colònia.
- **Els resultats** són a les sèries i al quadern, no en aquestes imatges.

## Les ordres

Des de l'arrel del repositori, a `bash`.

```bash
C=fase2/resultats/serie-llei2
node eines/imatges.mjs sopa docs/imatges/sopa-abans-i-despres.png --tema fosc aleatoria:1:v1 fase1/resultats/llavor1-fils7-epoca750.bin
node eines/imatges.mjs km $C/A $C/B docs/imatges/llei2-km.svg
node eines/imatges.mjs km $C/A $C/B docs/imatges/llei2-km-fosc.svg --tema fosc
```

**La sopa inicial:** `aleatoria:1:v1` és la sopa amb què va començar l'experiment de la llavor 1 de la Fase 1,
que es va fer amb el generador v1.
- **L'error de la primera versió:** la imatge del 18-10-2026 feia servir `aleatoria:1`, amb el generador v2,
  que és una altra sopa. No era, doncs, "la mateixa sopa" que deia el peu.
- **Com s'ha comprovat:** a l'època 250 d'aquell experiment, el 6,9 % dels bytes encara són iguals que els de
  la sopa inicial v1. Amb la v2 només n'hi coincideix el 0,4 %, el que tocaria per atzar.

### Els mons a l'atzar

La tria és amb `eines/tria.mjs` i la llavor 20261019, declarada abans de mirar-los. Es fa d'entre els mons on
la vida es va establir: 24 al grup A i 34 al grup B, cadascun amb la seva època *t*, en l'ordre de la
llavor.

```bash
A="1006:2250 1009:7500 1010:6250 1016:12250 1017:12500 1018:10250 1021:9500 1023:15750 1026:8000 1027:4000 1029:1250 1033:15000 1035:15000 1036:4750 1037:14500 1039:4250 1041:9000 1045:9500 1046:10500 1051:10250 1054:15000 1059:11750 1068:9500 1070:9000"
B="2001:5000 2002:7000 2003:13000 2005:5250 2011:2000 2019:8750 2021:11000 2030:14000 2032:3500 2036:12250 2038:10250 2039:2000 2041:10750 2042:5750 2043:500 2044:6750 2048:4500 2049:13750 2051:7000 2053:14750 2055:250 2056:11750 2057:2000 2058:12250 2062:15250 2064:9500 2065:7250 2069:7000 2071:6750 2074:5250 2076:1500 2078:4750 2079:11250 2080:7000"
node eines/tria.mjs 20261019 4 $A    # 1010:6250 1021:9500 1027:4000 1036:4750
node eines/tria.mjs 20261019 4 $B    # 2005:5250 2030:14000 2042:5750 2051:7000
```

**Les llistes** surten de la línia `"type":"event"` de cada JSONL de la sèrie. La imatge, amb un registre de
famílies per a cada món (vegeu "Com es llegeixen"):

```bash
C=fase2/resultats/serie-llei2
F=""
for p in 1010:6250:2005:5250 1021:9500:2030:14000 1027:4000:2042:5750 1036:4750:2051:7000; do
  IFS=: read -r a ta b tb <<< "$p"
  F="$F $C/A/captures/llavor$a-mon512x256-r2-establiment$ta-epoca$ta.bin $C/B/captures/llavor$b-mon512x256-r2-m0.01-establiment$tb-epoca$tb.bin"
done
node eines/imatges.mjs mon 512x256 docs/imatges/mons-a-l-atzar.png $F --escala 1 --columnes 2 --registre-per-imatge --tema fosc
```

**Les xifres del peu del README** surten del cens de l'època *t* de cada món, als JSONL:

| | Quiets: 1010 · 1021 · 1027 · 1036 | Amb corrent: 2005 · 2030 · 2042 · 2051 |
|---|---|---|
| **Replicadors hereditaris** | 3,7 % · 1,5 % · 1,2 % · 1,0 % | 85,5 % · 12,1 % · 2,4 % · 4,2 % |
| **El territori que dona `eines/imatges.mjs`** | 2,8 % · 1,7 % · 1,3 % · 4,4 % | 93,1 % · 13,0 % · 11,1 % · 5,0 % |

### L'animació i el zoom

La sèrie només desa les captures dels tres censos que precedeixen l'establiment. Per a l'animació i el zoom,
el món de la llavor 1006 es torna a simular amb les opcions de la sèrie i una captura cada 50 èpoques.

```bash
node sim.mjs --world 512x256 --seed 1006 --mixing 0 --epochs 2900 --after 99999 --every 100 --census 250 --census-version v3 --rng v2 --save anim --save-every 50
F=""; for e in $(seq 1500 50 2900); do F="$F anim/llavor1006-mon512x256-r2-epoca$e.bin"; done
node eines/imatges.mjs animacio 512x256 docs/imatges/colonia-animada.png $F --simple --escala 2 --retard 150 --tema fosc --amb-epoca --portada darrer
```

**Com s'atura la simulació** (AUD-75).
- **A la primera execució** (18-10-2026), sense `--epochs 2900` ni `--after`, es va aturar a l'època 2.900. Va
  ser per la regla de les **300** èpoques després que l'entropia d'ordre superior passés d'1, el valor per
  defecte de `--after`. Abans hi deia 500, i era un error.
- **Per què depenia de la versió:** l'entropia depèn de la versió de zlib, i per això l'aturada podia
  dependre de la versió de Node.
- **Ara:** l'ordre fixa el final (`--epochs 2900`) i desactiva l'aturada (`--after 99999`).

**Què se n'ha comprovat:**
- La nova execució va fer la mateixa història que la de la sèrie: les captures de les èpoques 1.750, 2.000
  i 2.250 tenen les mateixes SHA-256 que les de `docs/captures.sha256`.
- Al cens de l'època 2.250, l'1,9 % de la mostra són replicadors hereditaris. El de l'època 2.500 en confirma
  l'establiment.

Els cinc nivells de zoom:

```bash
F=anim/llavor1006-mon512x256-r2-epoca2900.bin
node eines/imatges.mjs mon 512x256 docs/imatges/zoom-1-mon.png $F --escala 2 --marc 110,20,256,128 --tema fosc
node eines/imatges.mjs mon 512x256 docs/imatges/zoom-2-graella.png $F --regio 110,20,256,128 --escala 4 --graella --marc 230,50,102,51 --tema fosc
node eines/imatges.mjs codi 512x256 docs/imatges/zoom-3-codi.png $F --regio 230,50,102,51 --marc 290,66,34,17 --tema fosc
node eines/imatges.mjs codi 512x256 docs/imatges/zoom-4-codi.png $F --regio 290,66,34,17 --byte 3 --marc 300,71,12,6 --tema fosc
node eines/imatges.mjs codi 512x256 docs/imatges/zoom-5-codi.png $F --regio 300,71,12,6 --byte 9 --tema fosc
```

**Les xifres dels peus del zoom**, calculades sobre la mateixa captura:
- **La zona grisa:** dins de la regió de `zoom-3-codi.png`, els programes sense família amb 16 instruccions o
  més en tenen 24,7 de mitjana, i el 68 % són de bucle.
- **Fora de la colònia:** a la franja de la dreta (x ≥ 310), els programes sense família en tenen 10,3.
- **Les replicadores:** a la regió de `zoom-4-codi.png` n'hi ha 153. Se'n buscava la distància al programa més
  comú, en bytes diferents, permetent-hi un desplaçament cíclic i el mirall.
  - En 89 (el 58 %), la distància és de 5 bytes o menys, i 10 són idèntiques al programa més comú.
  - En 56, la distància és de més de 20 bytes.

## Com es llegeixen

- **Els mons:**
  - Cada cel·la és un programa, i el gris indica quantes instruccions té: com més clar, més.
  - Els colors marquen les tres famílies de replicadors principals segons el registre de famílies
    (`fase2/families.js`): rosa, verd i violeta, per ordre.
  - **El color és el territori de la família:** les cel·les que en porten el nucli de codi. No és el
    mateix que els replicadors que funcionen, que són els que compta el cens (entrada 7 del quadern).
  - **El registre de famílies fa servir un generador amb llavor.**
    - Si diverses imatges comparteixen el registre (per defecte), les famílies hi conserven el color, però el
      territori d'una captura depèn de quantes se n'han analitzat abans.
    - Amb `--registre-per-imatge`, cada imatge té el seu registre, i el territori no depèn de l'ordre.
  - Amb `--simple`, el gris només té tres tons, perquè la imatge pesi menys.
  - Amb `--graella`, cada cel·la té una vora del color del fons, i es veu la quadrícula.
  - **A l'animació:**
    - Cap a l'època 2.100 hi apareix una taca de programes plens d'instruccions.
    - El registre de famílies la reconeix com a família de replicadors a l'època 2.200, quan ja ocupa el
      3,5 % del món, i des d'aleshores la pinta de rosa.
    - El cens de l'època 2.250 en marca l'establiment.
    - La colònia creix fins a cobrir el 12 % del món a l'època 2.900.
- **La vista de codi** (`codi`) és la de la interfície. Cada cel·la mostra els seus 64 bytes en una
  quadrícula de 8 × 8, amb un marc del color de la seva família, si en té. Amb `--byte 4` o més, el marc es
  fa més gruixut i els bytes queden separats per una línia.
- **Les sopes i la vista de codi** fan servir els colors de les instruccions de la interfície:
  - blau: les de còpia;
  - taronja: les de bucle;
  - verd: les que mouen els caps;
  - blanc: les aritmètiques (negre en mode clar);
  - gris fosc, més o menys segons el valor: els bytes que no són instruccions;
  - gairebé negre: els zeros.

  **Amb daltonisme,** el taronja i el verd, i el blau i el verd, es distingeixen pitjor (AUD-74). La
  forma del dibuix ajuda, però no n'hi ha prou.
