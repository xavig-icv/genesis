# How to take part

*En català: a sota, a «Com participar-hi».*

Thank you for your interest. It is a small project, and what helps most is:
- **Reproducing a result on your own** ([`docs/reproduce.md`](docs/reproduce.md), with commands) and telling us how
  it went, whether it matches or not.
- **Finding mistakes:** in the code, the methods, the statistics or the claims of the notebook. If the notebook says
  more than the data, it is a mistake.
- **Asking questions:** if something is not clear, that is also a mistake, of the documentation.

**Where:** open an *issue*, in English or in Catalan.

## The project's rules

They are in `docs/disseny.md` (in Catalan), and the most important ones are these:
- **We design the laws, never the organisms.** No change may add seeded replicators, rewards for copying or
  instructions that copy a whole program.
- **Nothing is deleted.**
  - The preregistered protocols and the results are not touched.
  - A correction is a new, dated note.
  - The fingerprints in `test/determinisme.mjs` never change: if a change has to alter the histories, it goes
    behind a new option.
- **One change at a time,** compared with the control group.

## If you propose a change to the code

1. A branch and a *pull request*, explaining why.
2. The tests: `npm test` must pass. On GitHub, continuous integration runs them with several versions of Node.
3. **The language:** English is the project's main language since 22 November 2026, and Catalan the second one.
   New comments and documentation in English, and identifiers in English. The existing comments are in Catalan, and
   stay that way.
4. **Dependencies:** none. The project uses JavaScript with ES modules, with no dependencies and no build step.

**The project owner** reviews every change to the simulator before accepting it.

---

# Com participar-hi

Gràcies per l'interès. És un projecte petit, i el que més ajuda és:
- **Reproduir un resultat pel vostre compte** ([`docs/reproduir.md`](docs/reproduir.md)) i explicar-ne el
  resultat, tant si coincideix com si no.
- **Trobar errors:** al codi, als mètodes, a l'estadística o a les afirmacions del quadern. Si el quadern
  diu més que les dades, és un error.
- **Fer preguntes:** si alguna cosa no s'entén, també és un error, de la documentació.

**On fer-ho:** obriu una *issue*, en anglès o en català.

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
3. **L'idioma:** des del 22 de novembre de 2026, l'anglès és la llengua principal del projecte, i el català, la segona.
   Els comentaris i la documentació nous, en anglès, i els identificadors, en anglès. Els comentaris que ja hi ha són en
   català, i s'hi queden.
4. **Les dependències:** cap. El projecte fa servir JavaScript amb mòduls ES, sense dependències ni cap pas
   de compilació.

**El responsable del projecte** revisa cada canvi al simulador abans d'acceptar-lo.
