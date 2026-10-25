# Acta de la prova preregistrada dels zeros

**El protocol:** `docs/protocol-zeros.md` (v0.2), revisat a les auditories 15 i 16. És una prova preregistrada dins dels 11
mons, amb quatre braços: `continue`, `zeros-data` i `placebo-cell` per a les dues proves, i `zeros-inert`, descriptiu.

## La preparació (25-10-2026)

- **El codi:** el commit `4fa032b` (el merge de la PR #21), a la carpeta principal del PC, sense cap canvi als fitxers de
  codi.
- **L'ordre:** `node eines/pilot.mjs zeros --prepara --paral·lel 4`.
- **Què fa:**
  - les 44 transformacions (11 mons × 4 braços), des de les captures de l'establiment, amb la SHA-256 de
    `fase2/resultats/b2/repartiment.json`;
  - els 44 escanejos de totes les cel·les, el punt de partida *h*₀ de cada braç.
- **Què escriu:** el manifest, les llistes de les dues màquines, i els registres de les transformacions i dels escanejos.
- **Abans de l'auditoria 17,** perquè els auditors en puguin revisar el manifest de veritat.
- **El que no s'ha fet:** no s'ha llançat cap branca.

### El resultat de la preparació (26-10-2026, a les 00:23)

- **El codi de sortida:** 0. Els invariants de les 44 transformacions, correctes.
- **El manifest:** 11 mons de 11, 4 braços, 3 llavors i 132 branques. SHA-256
  `788f260c7ba3aa77fdb58a4a834ca8eb4d6f8f90d86d781475a0db2b0abc2e8f`.
- **Les llistes:**
  - `llista-pc.txt`: 72 branques, de 6 mons. SHA-256 `f919fc0b2ef5577caea0500cb38644cc760e67133cd2322fb32fe96794a5d85d`.
  - `llista-vm.txt`: 60 branques, de 5 mons. SHA-256 `61d97c011b4cc62efe99c01ec4015753c7567a1ac3145ccedd1419afe106b1e2`.
- **Les comprovacions:** `node eines/pilot.mjs zeros --comprova-captures` i `--comprova`, totes dues "tot correcte".
- **El punt de partida de cada braç** (*h*₀, l'escaneig de totes les cel·les; entre parèntesis, respecte de `continue`). És
  l'estat abans de cap època de dinàmica, i no cap resultat de la prova:

| Món | Paper | `continue` | `zeros-data` | `placebo-cell` | `zeros-inert` |
|---|---|---|---|---|---|
| B2002 | prova | 10,69 % | 20,03 % (1,87) | 10,65 % (1,00) | 10,70 % (1,00) |
| B2011 | prova | 26,45 % | 37,33 % (1,41) | 26,48 % (1,00) | 26,52 % (1,00) |
| B2021 | prova | 14,57 % | 17,20 % (1,18) | 14,58 % (1,00) | 14,61 % (1,00) |
| B2038 | prova | 7,67 % | 13,47 % (1,76) | 7,64 % (1,00) | 7,70 % (1,00) |
| B2042 | prova | 2,64 % | 3,67 % (1,39) | 2,63 % (1,00) | 2,64 % (1,00) |
| B2043 | prova | 21,40 % | 25,19 % (1,18) | 21,36 % (1,00) | 21,46 % (1,00) |
| B2078 | prova | 8,49 % | 10,53 % (1,24) | 8,54 % (1,01) | 8,55 % (1,01) |
| B2001 | prova | 14,78 % | 15,39 % (1,04) | 14,73 % (1,00) | 14,76 % (1,00) |
| B2071 | control negatiu | 7,13 % | 8,83 % (1,24) | 7,12 % (1,00) | 7,10 % (1,00) |
| B2044 | control negatiu | 42,58 % | 46,92 % (1,10) | 42,55 % (1,00) | 42,62 % (1,00) |
| B2058 | control negatiu | 28,67 % | 33,55 % (1,17) | 28,63 % (1,00) | 28,66 % (1,00) |

- **Què confirma:** l'efecte immediat de l'AUD-116, ara amb totes les cel·les. `zeros-data` desperta còpies adormides, i el
  placebo i `zeros-inert` comencen on comença `continue`.
- **`zeros-inert`:** a cada món, en neteja de 53.637 a 119.872 cel·les, i en deixa com eren, perquè es despertarien, de 2.225
  a 16.051.
- **El placebo:** deixa sense aparellar del 0,5 al 5,0 % dels zeros de l'abast, a les cel·les saturades.
- **Les captures transformades** (44, unes 350 MB) no van a git: es regeneren amb el commit, les captures d'origen i les
  llavors. Els seus registres, els escanejos, el manifest i les llistes, sí.
