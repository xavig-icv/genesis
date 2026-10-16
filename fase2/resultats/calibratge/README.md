# Mons de la sèrie exploratòria regenerats amb el cens v3

Són els registres de `docs/calibratge.md`, §5 i §6 (AUD-34 de l'auditoria 2). Cada món té el mateix
generador (v1) i la mateixa llavor que a la sèrie exploratòria, però s'ha passat pel cens v3 corregit
després de l'auditoria 3 (AU2-15), amb el commit `734f4de`.
- **Mateixa història:** H0 i l'HOE són idèntics als registres originals de `fase2/resultats/vm/`.
- **Una diferència als registres:** les operacions per execució són mitjanes sobre intervals diferents.

| Fitxers | Món | Fins a |
|---|---|---|
| `quiet-14`, `quiet-15` | *m* = 0, llavors 14 i 15 | època 1.500 |
| `corrent-7` | *m* = 0,01, llavor 7 | època 1.500 |
| `quiet-9` | *m* = 0, llavor 9 | establiment a la 8.000, confirmat a la 8.250 (horitzó de la regeneració) |
| `corrent-11` | *m* = 0,01, llavor 11 | establiment a la 6.750, confirmat a la 7.000; aturat a la 7.250 |
| `potencia-dues-etapes-20000.txt` | — | La simulació del procediment de dues etapes (protocol §8), feta a la VM amb el mateix commit |

**Notes:**
- Les empremtes finals de `quiet-9` (`edf4e742`) i `corrent-11` (`86085945`) són les mateixes que les
  d'una primera regeneració feta amb la versió anterior del cens: el cens no toca el món. Aquella
  versió, i els seus registres, són a l'historial de git (commit `e03804a`).
- A la línia de l'ordre (`ordre=` i `command`), el camí local on es van escriure els fitxers s'ha
  substituït per `fase2/resultats/calibratge`.
