# Com participar-hi

*In English, briefly: issues and independent reproductions are very welcome, in Catalan or English. Please
do not change frozen documents (preregistered protocols, results), and keep the determinism fingerprints
untouched. Details below, in Catalan.*

Gràcies per l'interès. És un projecte petit, i el que més ajuda és:
- **Reproduir un resultat pel vostre compte** ([`docs/reproduir.md`](docs/reproduir.md)) i explicar-ne el
  resultat, tant si coincideix com si no.
- **Trobar errors:** al codi, als mètodes, a l'estadística o a les afirmacions del quadern. Si el quadern
  diu més que les dades, és un error.
- **Fer preguntes:** si alguna cosa no s'entén, també és un error, de la documentació.

**On fer-ho:** obriu una *issue*, en català o en anglès.

## Les regles del projecte

Són a `docs/disseny.md`, i les més importants són aquestes:
- **Dissenyem les lleis, mai els organismes.** Cap canvi no pot afegir replicadors inicials, premis per
  copiar-se ni instruccions que copiïn un programa sencer.
- **Res no s'esborra.**
  - El protocol preregistrat i els resultats no es toquen.
  - Una correcció és una nota nova, amb data.
  - Les empremtes de `test/determinisme.mjs` no es canvien mai: si un canvi ha d'alterar les històries,
    va darrere d'una opció nova.
- **Un canvi cada vegada,** comparat amb el grup de control.

## Si proposeu un canvi al codi

1. Una branca i una *pull request*, amb una explicació del perquè.
2. Les proves: `npm test` ha de passar. A GitHub, la integració contínua les passa amb diverses versions de
   Node.
3. **L'idioma:** comentaris i documentació en català, i identificadors en anglès. Si no escriviu en
   català, no passa res: ja ho adaptarem.
4. **Les dependències:** cap. El projecte fa servir JavaScript amb mòduls ES, sense dependències ni cap pas
   de compilació.

**El responsable del projecte** revisa cada canvi al simulador abans d'acceptar-lo.
