# Captures clau

Les captures (`.bin`) són l'estat complet d'un món o d'una sopa en una època: 64 bytes per programa,
sense capçalera. No van a git perquè ocupen 8 MB cadascuna i, en principi, es poden regenerar amb el
mateix commit, llavor i paràmetres. Però n'hi ha que són el **punt de partida d'altres experiments**
o que **cita el quadern**, i regenerar-les pot trigar hores. Aquestes són a `captures.sha256`, amb la
suma de comprovació, i se'n fa còpia amb `bash arxiva-captures.sh` (vegeu l'auditoria 1, AUD-10).

Totes es van fer amb el generador v1 (mulberry32) i amb codi anterior al primer commit; el codi actual
les reprodueix (comprovat a l'auditoria 1, §7.1).

| Captura | Què és | Paràmetres | La fan servir |
|---|---|---|---|
| `fase2/resultats/llavor1-mon512x256-r2-m0.01-epoca12000.bin` | L'esclat del replicador que necessita una parella | món 512×256, radi 2, corrent 0,01, llavor 1, època 12.000 | **Totes les branques de l'entrada 5** (`fase3/branca-esclat*.txt`); l'anàlisi de l'entrada 4 |
| `fase2/resultats/llavor1-mon512x256-r2-m0.01-final.bin` | El mateix món, després del col·lapse | ídem, època 13.000 | Entrada 4 |
| `fase1/resultats/llavor3-epoca8950.bin` | El replicador de la llavor 3 al pic | sopa 2^17, llavor 3, època 8.950 | Entrada 2 (27,6 % de replicadors; prova de l'entorn) |
| `fase1/resultats/llavor3-final.bin` | La mateixa sopa després de l'extinció | ídem, època 10.450 | Entrada 2 (el 6,2 % d'èxit contra companys de la sopa final) |
| `fase1/resultats/llavor1-fils7-epoca250.bin` | El replicador vell de la llavor 1 del navegador | sopa 2^17, llavor 1, `--chunks 7`, època 250 | Entrada 2 (immunitat: el replicador vell) |
| `fase1/resultats/llavor1-fils7-epoca500.bin` | La sopa enverinada just abans del relleu | ídem, època 500 | Entrada 2 (la sopa enverinada) |
| `fase1/resultats/llavor1-fils7-epoca750.bin` | El successor immune | ídem, època 750 | Entrada 2 (immunitat: el replicador nou) |
| `fase1/resultats/llavor1-epoca16000.bin` | El replicador de la llavor 1 sense gràfics | sopa 2^17, llavor 1, època 16.000 | Entrada 2 (tercer palíndrom); auditoria 1 |
| `fase2/resultats/llavor1-mon512x256-r2-m1-final.bin` | Corrent 1, llavor 1, final | món 512×256, corrent 1, llavor 1 | Entrada 4 |
| `fase2/resultats/llavor3-mon512x256-r2-m1-final.bin` | Corrent 1, llavor 3, final (successió de famílies) | món 512×256, corrent 1, llavor 3 | Entrada 4 |
| `fase2/resultats/vm/llavor1-mon512x256-r2-m0.001-final.bin` | Corrent 0,001, llavor 1, final | món 512×256, corrent 0,001, llavor 1 (VM) | Entrada 4 |
| `fase2/resultats/vm/llavor2-mon512x256-r2-m0.01-final.bin` | Corrent 0,01, llavor 2, final (palíndrom del punt) | món 512×256, corrent 0,01, llavor 2 (VM) | Entrada 4; registre de famílies v2 (prova del replicador espaiat) |

Comprimides ocupen uns 48 MB en total (un 40 % menys que sense comprimir: s'assemblen força a soroll).

**On es guarda la còpia:** pendent de decidir (disc extern, núvol o *releases* de GitHub). La màquina
virtual no serveix de còpia de seguretat, perquè és al mateix disc que el PC.
