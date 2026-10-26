# Acta del pilot de la maduració de la sopa

**El disseny:** `docs/pilot-maduracio.md` (v2), revisat a les auditories 15 i 16. És un pilot: no en surt cap conclusió, i els
seus mons no entren a cap sèrie.

## L'envelliment (25-10-2026)

- **El codi:** el commit `3b0cdc0` (el merge de la PR #20), en una còpia de treball del PC sense cap canvi als fitxers seguits.
- **La llista:** `node eines/pilot.mjs maduracio --envelliment`, desada com a `llista-envelliment.txt`.
  - **Què hi ha:** els 24 mons nous, de la llavor 5001 a la 5024, fins a l'època 8.000, amb `--stop-after-event 0`.
  - **La SHA-256:** `9f63545de8a4ef4dbdae14b63e8d151a9af7ded96149364d3943b48d20f5c309`.
- **El llançament:** el 25-10-2026 a les 16:06:07 (+01:00), al PC, amb `bash eines/llanca-lot.sh 6 ...` en una finestra oculta.
  - **Quants alhora:** 6.
  - **Els registres** porten `codi=3b0cdc0`.
- **Abans de la comprovació breu de l'auditoria 16** (X-051):
  - **Per què:** l'envelliment no depèn de res del que s'hi revisa, i tots tres vam estar d'acord amb l'edat 8.000.
  - **Què es farà després:** cap branca no es llança abans del GO.
- **Les actualitzacions de Windows:** pausades fins al 24-11-2026 a les 20:18:56Z, comprovat al registre.
- **L'energia:** el PC és connectat a la corrent.
- **Durant l'envelliment:** només `bash eines/seguiment.sh --agregat`.
- **El final:** el lot va acabar el 25-10-2026 a les 17:55:09, amb 24 mons acabats, cap de fallat, i els 24 registres complets.

## La preparació (26-10-2026)

**El codi:** el commit `4fa032b` (el merge de la PR #21), a la mateixa còpia de treball del PC. Els registres de
l'envelliment, que no són a git, s'hi van quedar.

**El primer intent, interromput.**
- **L'ordre:** `node eines/pilot.mjs maduracio --prepara --paral·lel 4`, al mateix temps que la preparació dels zeros.
- **L'apagada:** el 26-10-2026 a les 00:25:31, una apagada inesperada del PC (Kernel-Power 41: el sistema es va reiniciar
  sense apagar-se bé). No va ser Windows Update. La preparació era a l'escaneig 100 de 110.
- **La pausa de Windows Update:** després del reinici ja no era al registre. El responsable la va tornar a posar, fins al
  23-11-2026 a les 00:07:05Z, comprovat al registre.
- **El que no es va esborrar:** la sortida interrompuda es va apartar a `alicuotes-interromput-20261026/`, a la mateixa
  còpia, fora de git.

**El segon intent, sencer.**
- **L'ordre:** la mateixa, llançada cap a la 01:03.
- **Quan va acabar:** a les 02:06, amb el codi de sortida 0.
- **Què va fer:**
  - va validar els 24 envelliments sencers, amb el mateix simulador que el del seu commit;
  - va escanejar els 24 mons;
  - va fer les 110 transformacions;
  - va escanejar les 110 captures transformades.
- **El determinisme:** els 344 fitxers de la sortida interrompuda (110 captures, 110 registres i 124 escanejos) són idèntics
  byte a byte als del segon intent.

**El resultat de la preparació.**
- **La inclusió:** 22 mons de 24. Els exclosos són el 5012, amb 2 cel·les hereditàries a l'escaneig de l'època 8.000, i el
  5016, amb 1 (AUD-111). Cap món no s'havia establert abans de l'època 8.000.
- **El manifest:** 22 mons inclosos, 5 braços, 2 llavors, 220 branques. SHA-256
  `598495fe75308d4c1c064d562d109eb404c2f50941c9f55f19351f4e03f567a7`.
- **Les llistes:**
  - `llista-pc.txt`: 110 branques. SHA-256 `777a61bc1ad2db90768608cefab7a2cb13369ff85fe127dc8e9370058b867d66`.
  - `llista-vm.txt`: 110 branques. SHA-256 `3bca75e9b87f22846750465dcfa38b7ce24e885f5cc605782de449aea8843e46`.
- **Les comprovacions:** `node eines/pilot.mjs maduracio --comprova-captures` i `--comprova`, totes dues "tot correcte".

**Una observació d'abans de cap branca: les barreges creen replicadors.** L'escaneig de totes les cel·les de cada captura
transformada (cel·les que es repliquen / hereditàries, de 131.072):

| Braç | Es repliquen (mediana, rang) | Hereditàries | Mons amb alguna hereditària |
|---|---|---|---|
| `continue` | 25 (14–31) | 0 | 0 de 22 |
| `shuffle-programs` | 31 (19–43) | 3 en total | 3 de 22 |
| `shuffle-within` | 88 (71–116) | 14 en total | 9 de 22 |
| `shuffle-all` | 713 (641–776) | 169 en total, de 4 a 16 per món | **22 de 22** |
| `reinit` | 119 (105–138) | 8 en total | 7 de 22 |

- **Què vol dir:** la composició d'aquestes sopes envellides, si se'n barregen els bytes, ja conté replicadors hereditaris a
  tots els mons. Les sopes tal com són, no, i tenen menys cel·les que es repliquen que una sopa nova a l'atzar.
- **El que canvia per al pilot:** `shuffle-all` començarà amb vida hereditària, i `continue`, no. El contrast principal ja
  no compara només l'estructura. Es porta a l'auditoria 17 abans de llançar cap branca.
- **Les captures transformades** (110, unes 880 MB) no van a git: es regeneren amb el commit, les captures envellides i les
  llavors. Els seus registres, els escanejos, el manifest i les llistes, sí.
