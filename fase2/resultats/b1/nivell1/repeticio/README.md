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
