# Les imatges del lloc web

Cada imatge diu d'on surt. Són captures del lloc mateix (els dibuixos de `web/js/`, sense els controls), fetes amb Chrome 156
sense finestra a 1200 × 560 píxels i desades en JPEG de qualitat 86, amb el món de la llavor 1006 a l'època 2.750.

| Fitxer | Què és |
|---|---|
| `entrada-3d-clar.jpg`, `entrada-3d-fosc.jpg` | L'explorador 3D de prop: els taulers de codi i els sòlids de les instruccions. Càmera a la cel·la (166, 104), a una distància de 13, amb una inclinació de 0,72 i un gir de 0,35, posada directament en aquesta posició (sense l'aproximació suau). Tema clar i fosc |
| `entrada-2d-clar.jpg`, `entrada-2d-fosc.jpg` | La vista 2D: els colors de família, a 3 píxels per cel·la, al voltant de la cel·la (168, 118). Tema clar i fosc |

**Les dades:** les del 1006 (`web/dades/1006`), fetes amb `eines/web-dades.mjs` a partir de les captures de l'ordre de la
fitxa (`web/dades/1006/fitxa.json`).

**La comprovació (30-10-2026).** La primera versió de les imatges es va fer abans que acabés la simulació sencera, amb unes
dades de prova que arribaven fins a l'època 2.750. Fins a aquesta època, les dades completes són idèntiques a les de prova:
les SHA-256 de les 55 captures, els mapes de família i d'instruccions, el codi i els colors de les famílies. Les quatre
imatges refetes amb les dades completes també surten idèntiques, byte a byte, si la càmera es posa directament a la seva
posició. Amb l'aproximació suau, la càmera s'atura amb un error d'arrodoniment que canvia d'una execució a l'altra: de quatre
parelles d'imatges 3D fetes amb les mateixes dades, només una va sortir igual byte a byte. Per això, les dues imatges 3D
són ara les de la càmera posada directament, que amb la mateixa versió de Chrome surten iguals a cada execució. Les 2D no
han canviat.

Es tornen a fer quan canviï el disseny dels visors.
