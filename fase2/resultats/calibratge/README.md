# Mons de la sèrie exploratòria regenerats amb el cens v3

Són els registres de `docs/calibratge.md`, §5 i §6 (AUD-34 de l'auditoria 2). Cada món té el mateix
generador (v1) i la mateixa llavor que a la sèrie exploratòria, però s'ha passat pel cens v3.
- **Mateixa història:** H0 i l'HOE són idèntics als registres originals de `fase2/resultats/vm/`.
- **Una diferència als registres:** les operacions per execució són mitjanes sobre intervals diferents.

| Fitxers | Món | Fins a |
|---|---|---|
| `quiet-14`, `quiet-15` | *m* = 0, llavors 14 i 15 | època 1.500 |
| `corrent-7` | *m* = 0,01, llavor 7 | època 1.500 |
| `quiet-9` | *m* = 0, llavor 9 | establiment a la 8.000, confirmat a la 8.250 |
| `corrent-11` | *m* = 0,01, llavor 11 | establiment a la 6.750, confirmat a la 7.000; aturat a la 7.250 |

**Notes:**
- Els tres primers registres diuen `codi=752ff04+canvis`. El canvi sense commit era `fase2/calibratge.mjs`,
  que encara no estava desat i que `sim.mjs` no fa servir. Els dos últims són del commit `5b6e436`, net.
- A la línia de l'ordre (`ordre=` i `command`), el camí local on es van escriure els fitxers s'ha
  substituït per `fase2/resultats/calibratge`.
