# Captures clau

Les captures (`.bin`) són l'estat complet d'un món o d'una sopa en una època: 64 bytes per programa,
sense capçalera. No van a git perquè ocupen 8 MB cadascuna i, en principi, es poden regenerar amb el
mateix commit, llavor i paràmetres. Però n'hi ha que són el **punt de partida d'altres experiments**
o que **cita el quadern**, i regenerar-les pot trigar hores. Aquestes són a `docs/captures.sha256`, amb la
suma de comprovació, i se'n fa còpia amb `bash eines/arxiva-captures.sh` (vegeu l'auditoria 1, AUD-10).

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

Comprimides ocupen uns 48 MB en total, la meitat que sense comprimir (s'assemblen força a soroll).

## El banc de mons amb vida de la sèrie de la llei 2 (afegit el 18-10-2026)

| Captures | Què són | Paràmetres | La fan servir |
|---|---|---|---|
| `fase2/resultats/serie-llei2/A/captures/*.bin` (72) i `fase2/resultats/serie-llei2/B/captures/*.bin` (99) | Per a cadascun dels **58 mons amb establiment** de la sèrie confirmatòria (24 del món quiet i 34 del corrent), els mons dels censos de *t*, *t* − 250 i *t* − 500, si són de l'època 250 o més tard. *t* és l'època d'establiment. En total, 171 captures | Món 512×256, radi 2, corrent 0 (A) o 0,01 (B), generador v2, cens v3, commit `8cd4449` (etiqueta `preregistre-llei2`). El nom de cada fitxer porta la llavor, *t* i l'època | El banc de mons amb vida (AUD-41). Les branques de B2 de la iteració 4, que comencen a *t*. L'estudi de l'origen abans de la detecció (protocol, §6.7) |

- **D'on surten.** Les va escriure `sim.mjs --save-what event` durant la sèrie: al PC, les llavors A 1026–1050 i 1066–1080 i B 2026–2050 i 2066–2080; a la VM, la resta. El 18-10-2026 es van copiar a la còpia de treball de `main`, i les 171 còpies són iguals que els originals de cada màquina (SHA-256).
- **Quins mons hi són.** Es va comprovar que cada món amb establiment té exactament les captures que li toquen, i que cap món sense establiment no en té. Quan *t* és 250 o 500, n'hi ha menys de tres.
- **L'arxiu.** Aquestes captures gairebé no es comprimeixen, i l'arxiu `arxiu-captures/` passa a ocupar uns 1,2 GB.

**On es guarda la còpia:** a la carpeta local `arxiu-captures/` i en una segona carpeta d'un altre disc (el camí és a `CLAUDE.local.md`, que no es publica). La primera còpia és del 15-10-2026, i el banc de la sèrie de la llei 2 s'hi va afegir el 18-10-2026 (`--verifica`: 183 correctes). Aquest segon disc és físicament diferent del del sistema: protegeix contra una avaria del disc del sistema, però no contra la pèrdua de tot l'ordinador. La màquina
virtual no serveix de còpia de seguretat, perquè és al mateix disc que el PC.

**Com es comprova una còpia:** `bash eines/arxiva-captures.sh --verifica [carpeta]` descomprimeix cada `.gz` i
en compara la suma amb `docs/captures.sha256`, que és la de la captura sense comprimir. Per tornar-les a posar
al seu lloc: `bash eines/arxiva-captures.sh --restaura [carpeta]` (AU2-11 de l'auditoria externa 2).

**Versions.** Les 171 captures del banc de la sèrie de la llei 2 són del generador v2 i del cens v3, i
es regeneren amb el commit `8cd4449` i l'ordre de la §3 del protocol. Les altres 12 captures i els
registres de la sèrie exploratòria es van fer amb el
generador v1 i el cens v2. Per regenerar-les cal `--rng v1 --census-version v2`. Els registres de les
llavors 4–15 de la VM (`fase2/resultats/vm/`) no porten la capçalera `codi=` ni `rng=`, perquè es van fer
amb codi anterior a la capçalera, del generador v1 (AUD-37 de l'auditoria 2).
