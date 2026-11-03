# Les imatges del lloc web

Cada imatge diu d'on surt. Són captures del lloc mateix (els dibuixos de `web/js/`, sense els controls), fetes amb Chrome 156
sense finestra, amb el món de la llavor 1006. Les de les finestres del laboratori de la portada, a 1.200 × 560 píxels i en JPEG
de qualitat 86; els pòsters del naixement, a la mida del planeta de la portada a 1.440 píxels (621 × 621), en WebP de qualitat
80 i amb el fons transparent. Les SHA-256 són a `SHA256SUMS`.

| Fitxer | Què és |
|---|---|
| `entrada-3d-clar.jpg`, `entrada-3d-fosc.jpg` | L'explorador 3D de prop, a l'època 3.500: els taulers de codi i els sòlids de les instruccions. Càmera a la cel·la (380, 108), a una distància de 13, amb una inclinació de 0,72 i un gir de 0,35, posada directament en aquesta posició (sense l'aproximació suau). Tema clar i fosc |
| `entrada-2d-clar.jpg`, `entrada-2d-fosc.jpg` | La vista 2D a l'època 3.500: els colors de família, a 3 píxels per cel·la, des de la cantonada de dalt a l'esquerra del món (de la cel·la (0, 0) a la (399, 186)). Tema clar i fosc |
| `entrada-viu-clar.jpg`, `entrada-viu-fosc.jpg` | La finestra del món en viu: la mateixa vista 2D, a l'època 1.650, on encara només hi ha soroll. Així comença un món, també el que es fa al navegador. Tema clar i fosc |
| `naixement/TEMA-ÈPOCA.webp` | Els 7 fotogrames del naixement de la capçalera (1.650, 2.250, 2.500, 3.000, 3.500, 4.500 i 6.000), en tema clar i fosc: el planeta tal com el dibuixa la portada, quiet (amb moviment reduït, al punt de vista del repòs), sense el cel, l'halo, la vora ni els rètols, que són de la pàgina. El de la 3.500 és el pòster: es veu de seguida, mentre arriba el WebGL, i sempre sense WebGL2 o sense JavaScript (AUD-161), uns 50 kB. Els altres sis només es baixen si no hi ha WebGL2 i es reprodueix el naixement |
| `icona.svg` | La icona de la pestanya: el sigil de Genesis, del disseny de l'Observatori (l'encàrrec 2, `recursos/icones/favicon.svg`), sense canvis. No és una captura |

**Les dades:** les del 1006 (`web/dades/1006`), fetes amb `eines/web-dades.mjs` a partir de les captures de l'ordre de la
fitxa (`web/dades/1006/fitxa.json`). Els 7 fotogrames del naixement són fotogrames sols de la fitxa (`"sols"`), cadascun
igual que el seu tros dels mapes (AUD-161).

**On són les càmeres,** triat amb les dades i no a ull: la 3D, en una vora de la colònia, on la família ocupa el 44 % d'una
finestra de 24 × 24 cel·les i hi ha més instruccions per cel·la; la 2D, a la part del món on la colònia ocupa més vista (el 36 %).

**Es poden repetir byte a byte** amb la mateixa versió de Chrome: dues execucions donen els mateixos fitxers. Per això les
càmeres es posen directament a la seva posició: amb l'aproximació suau, s'hi aturen amb un error d'arrodoniment que canvia
d'una execució a l'altra. I cada captura espera que el dibuix hi sigui (el món carregat; a l'explorador, el codi de l'època
dibuixat; a la portada, el fotograma de l'època dibuixat), i no un temps fix: amb esperes fixes i la màquina carregada, dues de
les quatre imatges sortien diferents (AUD-167). Al final, l'eina les compara amb `SHA256SUMS`, i si no hi són iguals, ho diu i
surt amb el codi 1.

**Com es fan:** amb el servidor engegat a l'arrel del repositori (`node server.mjs`),

```
node eines/web-imatges.mjs --chrome CAMI-DE-CHROME --sortida CARPETA
```

- **Els valors per defecte són els d'aquestes imatges:** `--mon 1006 --epoca 3500 --camera3d 380,108 --centre2d 200,93`. La vista
  2D té el centre a la cel·la (200, 93), i comença a la (0, 0).
- **Els pòsters del naixement** es fan amb el botó de la capçalera, que amb moviment reduït passa al fotograma següent, amb un tall.
- **No sobreescriu cap fitxer.** Per comprovar les d'aquí, es fan en una altra carpeta i se'n comparen les SHA-256.
- **Comprovat el 31-10-2026,** amb Chrome 156.0.8078.73: les quatre de les entrades surten idèntiques, byte a byte, a les
  d'aquesta carpeta.
- **I el 03-11-2026,** amb Chrome 156.0.8078.74 i la màquina al 100 % (una sèrie en marxa): les 20, en dues execucions, iguals entre
  elles. Les quatre de les entrades 3D i 2D, iguals a les d'abans.

**Les primeres versions** (30-10-2026) eren de l'època 2.750. Es van fer abans que acabés la simulació sencera, amb unes dades
de prova, i fins a aquesta època les dades completes en són idèntiques (les SHA-256 de les 55 captures, els mapes, el codi i
els colors de les famílies), com també les imatges refetes. Es van canviar per l'època 3.500 perquè a la 2.750 la major part
del color és d'una segona família que només hi és dos fotogrames. El seu nucli és monòton (`[[[[[[`) i també és als membres
de la primera, i el seu exemple conté el nucli de la primera llegit al revés.

**Les imatges fixes del planeta d'abans** (`planeta-clar.jpg` i `planeta-fosc.jpg`, 03-11-2026) es van treure amb el disseny de
l'Observatori: els pòsters del naixement en fan la feina, sense fons.

Es tornen a fer quan canviï el disseny dels visors.

## La cinta de la portada

No és una imatge: són els 128 bytes de la figura de la química (`data-bytes` de `#tape` a `web/index.html`), que la pàgina
executa pas a pas amb l'intèrpret del simulador (`fase1/bff.js`, a través de `web/js/cinta.js`).

- **D'on surten:** de la captura `llavor1006-mon512x256-r2-epoca3500.bin` (SHA-256 `6e2236f9…`, a `fonts` de
  `web/dades/1006/mon.json`). A és la cel·la (410, 155), de la família 1; B, la (412, 156), veïna i sense família.
- **Com es van triar:** a l'atzar, amb `eines/tria.mjs` i la llavor 20261030, entre les 254.776 parelles d'una cel·la de la
  família 1 (primer) amb un veí sense família dins del quadrat de 5 × 5 (segon), com les parelles del món.
- **Les xifres del peu:** en una sola execució, el programa de la família es copia sencer al revés a l'altra meitat en
  186.746 d'aquestes parelles (el 73,3 %), i del dret, en 10. A la triada, la còpia al revés és sencera al pas 926, i A no
  canvia. Al principi, B ja té 43 dels 64 bytes d'A als mateixos llocs.
- **Com es comprova:** `node eines/web-cinta.mjs CAPTURA.bin web/dades/1006 3500 20261030` torna a fer la tria i les
  xifres, i escriu els bytes. `test/web.mjs` comprova que el traçat coincideix amb l'intèrpret a cada pas i que els peus
  diuen el pas de la còpia i els bytes iguals.
