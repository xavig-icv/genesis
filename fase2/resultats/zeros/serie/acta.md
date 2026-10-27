# Acta de la prova preregistrada dels zeros

**El protocol:** `docs/protocol-zeros.md` (v0.3), revisat a les auditories 15 a 18. És una prova preregistrada dins dels 11
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

## L'etiqueta i el segell (27-10-2026)

Les hores d'aquesta secció són en UTC.

- **El permís:** el responsable havia decidit esperar que acabés el pilot de la maduració (auditoria 18). Va acabar a les
  07:02, i ens va donar el permís per fer l'etiqueta, pujar-la i segellar-la.
- **Abans de crear-la** (la variant de l'auditor 1):
  - **El diferencial:** `git diff --name-only 4fa032b 2628f9b -- . ':!fase2/resultats' ':!docs'` dona exactament els dos
    fitxers del missatge, `fase2/zeros-serie.mjs` i `test/zeros-confirmacio.mjs`.
  - **Les SHA-256:** les nou del missatge, tornades a calcular sobre els fitxers de `2628f9b`, coincideixen totes.
- **L'etiqueta:** `preregistre-zeros`, anotada, sobre `2628f9b1e693cededb3480529e6ef15bd2e88f32`, creada a les 07:19:53.
  - **L'objecte:** `2fb903b0eae252b2a2c78cb764e33b36b065a5ae`, de 1.930 bytes. SHA-256
    `23c4b30c3ade44c1d86368bc6bc17315d1b5eda37b38ce537ac7a1c364a2b72f`.
  - **El missatge:** l'assajat a l'auditoria 18, idèntic byte a byte.
  - **El programa de la decisió l'accepta:** en una còpia neta de l'etiqueta, `node fase2/zeros-confirmacio.mjs --decideix
    fase2/resultats/zeros/serie/branques` passa la comprovació del preregistre. Després s'atura, com s'esperava: encara no hi ha
    cap de les 132 branques.
  - **A GitHub:** pujada a les 07:20. `git ls-remote` en dona l'objecte i el commit.
- **El segell:** de l'objecte de l'etiqueta (`docs/preregistre-zeros/preregistre-zeros.tag`), amb OpenTimestamps, a les 07:21:01.
  - **Qui va respondre:** dos calendaris, `b.pool.opentimestamps.org` i `ots.btc.catallaxy.com`. Els altres dos tenien el
    certificat caducat.
  - **Què s'hi va enviar:** només un hash.

## El desplegament i la comprovació prèvia (27-10-2026)

Les hores d'aquesta secció són les del PC i la màquina virtual (+01:00).

- **La màquina virtual:**
  - **L'espai:** s'hi van esborrar les 215 captures de la maduració (1,7 GB). Abans es van comparar una per una amb les de la
    còpia de seguretat (SHA-256). Hi queden 2,5 GB.
  - **El codi:** `2628f9b`, desplegat amb `eines/desplega-vm.sh` des d'una còpia neta de l'etiqueta. El fitxer `VERSIO` diu
    `2628f9b`.
    - **Les SHA-256 de l'etiqueta:** n'hi coincideixen 8 de 9. La que falta és la del protocol, que no s'hi desplega.
  - **Les captures:** les 55 del manifest (11 d'origen i 44 de transformades), copiades del PC.
  - **La comprovació prèvia:** `node eines/pilot.mjs zeros --comprova`, a les 08:23, amb Node 20.19.2: "La comprovació prèvia
    del pilot zeros: tot correcte." (codi 0).
- **El PC:**
  - **El codi:** una còpia de treball nova a `2628f9b`.
    - **Que és neta:** cap canvi als fitxers seguits, ni cap fitxer de codi sense seguir.
    - **Les SHA-256 de l'etiqueta:** hi coincideixen totes nou.
  - **Les captures:** les 55 del manifest, copiades de la carpeta de la preparació.
  - **La comprovació prèvia:** `node eines/pilot.mjs zeros --comprova`, a les 08:23, amb Node 16.15.1: "tot correcte" (codi 0).
  - **Les actualitzacions de Windows,** pausades fins al 23-11-2026 a les 00:07:05Z, comprovat al registre.
  - **L'energia:** el PC és a la corrent.
- **Les llistes:** `--comprova` en compara la SHA-256 amb la del manifest.
  - `llista-pc.txt`: 72 branques, `f919fc0b…`.
  - `llista-vm.txt`: 60 branques, `61d97c01…`.
- **Cap branca no s'ha llançat:** s'espera l'ancoratge del segell a Bitcoin (protocol, §9).

## L'ancoratge i el llançament (27-10-2026)

**L'ancoratge** (hores en UTC):
- **El bloc:** el 973.367, de les 07:43:35. El calendari `bob.btc.calendar.opentimestamps.org` hi va posar el segell amb la
  transacció `b429782c…`.
- **Quan:** a les 08:34, quan el bloc ja tenia 6 confirmacions, el calendari va donar la prova completa.
- **La comprovació,** a les 08:34:49: l'arrel de Merkle del bloc coincideix amb el missatge atestat (blockstream.info), i el
  fitxer segellat és l'objecte de l'etiqueta.
- **La segona atestació:** el calendari `btc.calendar.catallaxy.com` va ancorar el mateix segell al bloc 973.378, de les
  09:37:13 (la transacció `463e4ad7…`), una hora després del llançament. La va donar a les 11:23, i l'arrel de Merkle
  coincideix. No hi canvia res: la que data l'etiqueta és la del bloc 973.367.
- **El detall:** `docs/preregistre-zeros/LLEGEIX-ME.md`.

**El llançament** (hores de les màquines, +01:00):
- **El PC:**
  - **Just abans,** a les 09:35:00: `node eines/pilot.mjs zeros --comprova`, "tot correcte" (codi 0). La còpia, a `2628f9b`
    i sense cap canvi.
  - **El lot,** a les 09:35:08, en una finestra oculta: `bash eines/llanca-lot.sh 6 fase2/resultats/zeros/serie/branques
    fase2/resultats/zeros/serie/llista-pc.txt`. 72 branques, 6 alhora. La primera línia del lot diu `codi=2628f9b`.
- **La màquina virtual:**
  - **Just abans,** a les 09:35:16: `--comprova`, "tot correcte".
  - **El lot,** a les 09:35:19, amb `nohup`: `bash eines/llanca-lot.sh 4 fase2/resultats/zeros/serie/branques
    fase2/resultats/zeros/serie/llista-vm.txt`. 60 branques, 4 alhora. La primera línia del lot diu `codi=2628f9b`.
- **El codi d'una branca de cada màquina,** just després de llançar (la proposta de l'auditor 1): la primera línia del registre
  i la línia d'inici del JSONL, sense llegir-ne res més.
  - **Al PC,** `B2002-continue-a`: `code` `2628f9b`, Node 16.15.1.
  - **A la màquina virtual,** `B2011-continue-a`: `code` `2628f9b`, Node 20.19.2.
- **Durant els lots:** només `bash eines/seguiment.sh --agregat`. No es mira cap resultat fins a la decisió, que es pren des
  d'una còpia de l'etiqueta.
