# B1, el nivell 1 · la repetició de tres trossos

**Escrit el 05-11-2026, abans de llançar la repetició i sense haver mirat cap registre** (`docs/pla-b1.md`, §11, i el README del
nivell 1). La repetició serveix per veure que els registres s'han fet de debò (auditor 2).

- **La llavor:** els vuit primers dígits hexadecimals de la SHA-256 d'`execucio-llista.txt` (`f0e46fa6…`, a git des de `a146177`),
  com a enter: `0xf0e46fa6` = **4041502630**. No és la del pla.
- **Els trossos:** `node eines/tria.mjs 4041502630 3 0 1 2 … 99` dona **12, 64 i 79**: els programes de l'1.200.000 a l'1.299.999, del
  6.400.000 al 6.499.999 i del 7.900.000 al 7.999.999. Són els mateixos a les 15 tirades.
- **Les ordres:** les de `llista.txt`, amb `--de` al començament del tros, `--programes 100000` i el registre en aquesta carpeta. Hi ha
  una llista per tros:

  | Llista | SHA-256 |
  |---|---|
  | `llista-tros12.txt` | `b7a2af5d814611d35b727163c1a20efeec4d4f059194a5aefd0cface4a4d975a` |
  | `llista-tros64.txt` | `3a54a30d95f251eb9bdfd3731f776c47fdf2220ecd1bbaa4b20247e6123e64a2` |
  | `llista-tros79.txt` | `90a447d67e13dbdf528d66176017ced6ce2e1da1859bf579a0206c0613e4206e` |

- **On:** a la còpia neta del càlcul (`a677726`), amb l'executor del nivell 1 (`executa.sh`). Les tres llistes corren alhora i a
  prioritat baixa. Cada ordre és un sol tros i fa servir un sol fil.
- **La comparació:** `compara.mjs`, escrit abans de llançar la repetició.
  - **Les proves:** amb dades sintètiques, s'hi ha canviat un byte, un recompte, l'ordre de dues línies, la química i la versió de
    Node, i hi ha faltat una repetició, n'hi ha sobrat una o n'hi ha hagut una d'incompleta.
  - **El criteri:** per a cada tirada i cada tros, els replicadors han de coincidir línia a línia. El recompte del tros ha de ser la
    diferència dels recomptes acumulats de la tirada.
  - **La sortida:** no escriu cap recompte.

  `node fase2/resultats/b1/nivell1/repeticio/compara.mjs fase2/resultats/b1/nivell1/registres fase2/resultats/b1/nivell1/repeticio 12 64 79`
- **Si no coincideixen,** l'anàlisi espera fins que se'n trobi la causa, i es diu al quadern i a l'auditoria.

## El primer intent no val (05-11-2026)

- **Què va passar:** de les 06.12 a les 06.34, les 45 ordres van acabar amb el codi 0. Però la línia d'inici de cada repetició deia
  `a677726+canvis`, i la de les tirades, `a677726`: no en coincidia cap, només pel camp `code`. Els mòduls del càlcul (`modules`),
  la versió de Node i la resta de la línia d'inici sí que hi coincidien.
- **La causa:** abans de llançar-la, vaig copiar `compara.mjs` a la còpia neta, sense seguir. `densitat.mjs` hi escriu `+canvis` si
  hi ha cap fitxer `.js` o `.mjs` que no sigui el del commit, encara que sigui sense seguir (`git status --porcelain -- "*.js"
  "*.mjs"`).
- **El criteri no es toca.** El primer intent és a `intent-1/`:
  - **a git:** l'estat, l'execució, la consola i la comparació;
  - **a la còpia de seguretat:** els 45 registres, comprimits, amb la SHA-256 a `intent-1/execucio-llista-tros*.txt`.

  No s'hi va comparar cap replicador, perquè la comparació s'atura a la primera diferència.
- **El segon intent** corre des de les 06.36, amb les mateixes llistes, i amb la còpia sense cap fitxer de codi sense seguir
  (`git status --porcelain -- "*.js" "*.mjs"`, buit). La comparació es fa des d'una altra còpia, la de `main`, amb els camins de la
  còpia neta.
- **Per al nivell 2:** a la còpia del càlcul, cap fitxer de codi sense seguir mentre hi corri res.

## El segon intent: 45 de 45 coincideixen (05-11-2026)

- **La repetició:** les 45 ordres, de les 06.36 a les 06.58, totes amb el codi 0.
  - **L'estat:** `estat-llista-tros*.txt`.
  - **Les SHA-256 dels registres:** `execucio-llista-tros*.txt`.
  - **La línia d'inici** de cada registre diu `a677726`, com la de les tirades.
- **La comparació** (`comparacio.txt`, des de la còpia de `main`): **45 de 45 coincideixen.** Els replicadors de cada tros, línia a
  línia, i el seu recompte.
- **Els dos intents:** els 45 registres del primer són iguals als del segon, línia a línia. Només canvien el camp `code` de la línia
  d'inici (`a677726+canvis` → `a677726`) i el temps de la línia final. El fitxer sense seguir no va canviar el càlcul.
  - **Quan es va comprovar:** després de la comparació.
  - **El programa i la seva sortida:** `intent-1/compara-intents.mjs` i `intent-1/comparacio-intents.txt`.
