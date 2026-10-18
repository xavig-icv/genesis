# D'on surten les imatges

Totes les imatges d'aquesta carpeta les genera `eines/imatges.mjs` a partir de captures `.bin`, amb els
colors del mode fosc de la interfície (`--tema fosc`). Les captures no van a git (8 MB cadascuna), però es
poden tornar a fer amb el mateix commit i la mateixa llavor. Les que porten SHA-256 són a
`docs/captures.sha256` i es poden comprovar.

| Imatge | Què mostra | Captures |
|---|---|---|
| `colonia-animada.png` | Un PNG animat del món quiet de la llavor 1006 de la sèrie de la llei 2 (grup A), amb un fotograma cada 50 èpoques, de l'època 1.500 a la 2.900. | 29 captures d'una nova execució de la mateixa llavor (vegeu més avall). |
| `zoom-1-mon.png` … `zoom-5-codi.png` | Cinc nivells de zoom sobre el mateix món a l'època 2.900, cadascun dins del rectangle de l'anterior. | La captura de l'època 2.900 de la mateixa execució. |
| `colonia-mon-quiet.png` | El mateix món a les èpoques 1.750, 2.000 i 2.250 (la de l'establiment). | `serie-llei2/A/captures/llavor1006-…-establiment2250-epoca{1750,2000,2250}.bin` |
| `quiet-i-corrent.png` | El món quiet de la llavor 1006 a l'època 2.250, al costat del món amb corrent 0,01 de la llavor 2001 a l'època 5.000. Les dues èpoques són les de l'establiment. | `…/A/captures/llavor1006-…-establiment2250-epoca2250.bin`, `…/B/captures/llavor2001-…-m0.01-establiment5000-epoca5000.bin` |
| `sopa-abans-i-despres.png` | Els primers programes de la sopa inicial de la llavor 1 de la Fase 1, al costat de la mateixa sopa a l'època 750. | `aleatoria:1:v1`, `fase1/resultats/llavor1-fils7-epoca750.bin` |
| `llei2-km.svg` | La corba de Kaplan–Meier de la sèrie de la llei 2 (amb colors clars, com el quadern). | Els JSONL de `fase2/resultats/serie-llei2/A` i `B` (sí que són a git). |

## Les ordres

Des de l'arrel del repositori, amb `C=fase2/resultats/serie-llei2`:

```bash
node eines/imatges.mjs mon 512x256 docs/imatges/colonia-mon-quiet.png --escala 1 --tema fosc $C/A/captures/llavor1006-mon512x256-r2-establiment2250-epoca1750.bin $C/A/captures/llavor1006-mon512x256-r2-establiment2250-epoca2000.bin $C/A/captures/llavor1006-mon512x256-r2-establiment2250-epoca2250.bin
node eines/imatges.mjs mon 512x256 docs/imatges/quiet-i-corrent.png --escala 1 --tema fosc $C/A/captures/llavor1006-mon512x256-r2-establiment2250-epoca2250.bin $C/B/captures/llavor2001-mon512x256-r2-m0.01-establiment5000-epoca5000.bin
node eines/imatges.mjs sopa docs/imatges/sopa-abans-i-despres.png --tema fosc aleatoria:1:v1 fase1/resultats/llavor1-fils7-epoca750.bin
node eines/imatges.mjs km $C/A $C/B docs/imatges/llei2-km.svg
```

**La sopa inicial:** `aleatoria:1:v1` és la sopa amb què va començar l'experiment de la llavor 1 de la Fase 1,
que es va fer amb el generador v1.
- **L'error de la primera versió:** la imatge del 18-10-2026 feia servir `aleatoria:1`, amb el generador v2,
  que és una altra sopa. No era, doncs, "la mateixa sopa" que deia el peu.
- **Com s'ha comprovat:** a l'època 250 d'aquell experiment, el 6,9 % dels bytes encara són iguals que els de
  la sopa inicial v1. Amb la v2 només n'hi coincideix el 0,4 %, el que tocaria per atzar.

### L'animació i el zoom

La sèrie només va desar les captures dels censos que precedeixen l'establiment. Per a l'animació i el zoom, el
món de la llavor 1006 es va tornar a simular amb les opcions de la sèrie i una captura cada 50 èpoques:

```bash
node sim.mjs --world 512x256 --seed 1006 --mixing 0 --epochs 3250 --every 100 --census 250 --census-version v3 --rng v2 --save anim --save-every 50
node eines/imatges.mjs animacio 512x256 docs/imatges/colonia-animada.png anim/llavor1006-mon512x256-r2-epoca{1500,1550,…,2900}.bin --simple --escala 2 --retard 150 --tema fosc
```

**Com acaba la simulació:** s'atura a l'època 2.900, per la regla de les 500 èpoques després que l'entropia
d'ordre superior passi del llindar.

**Què se n'ha comprovat:**
- La nova execució va fer la mateixa història que la de la sèrie: les captures de les èpoques 1.750, 2.000
  i 2.250 tenen les mateixes SHA-256 que les de `docs/captures.sha256`.
- Al cens de l'època 2.250, l'1,9 % de la mostra són replicadors hereditaris. El de l'època 2.500 en confirma
  l'establiment.

Els cinc nivells de zoom, amb `F=anim/llavor1006-mon512x256-r2-epoca2900.bin`:

```bash
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
    (`fase2/families.js`): rosa, verd i violeta, per ordre. A `quiet-i-corrent.png`, el registre és comú a
    les dues imatges, i la família del món amb corrent hi surt en verd.
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
