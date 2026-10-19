# Glossari català–anglès

Els termes del projecte, amb la traducció anglesa i què volen dir aquí. Els identificadors del codi ja són en
anglès; la segona columna és la paraula que s'hi correspon.

## El món

| Català | English | Què vol dir aquí |
|---|---|---|
| abiogènesi digital | digital abiogenesis | Que apareguin replicadors en un univers de programes sense que ningú n'escrigui el primer. |
| BFF | BFF | El llenguatge dels programes, una variant de Brainfuck de *Computational Life* (2024). |
| programa, cinta | program, tape | 64 bytes. Quan dos programes interactuen, s'enganxen en una cinta de 128 bytes que s'executa. |
| cap (de lectura, d'escriptura) | head (read, write) | Els dos punters que mouen les instruccions `<` `>` `{` `}`. Les instruccions `.` i `,` hi copien bytes. |
| sopa (barrejada) | (well-mixed) soup | La Fase 1: 131.072 programes que interactuen amb qualsevol altre. |
| món 2D, cel·la | 2D world, cell | La Fase 2: 512 × 256 cel·les, amb un programa cadascuna, que només interactua amb els veïns (radi 2). |
| època | epoch | Un pas de la simulació: els programes s'aparellen, cada parella s'executa un cop, i hi ha mutacions. |
| aparellament | pairing | Com es trien les parelles que interactuen en una època. |
| mutació | mutation | Un byte canviat a l'atzar, un 0,024 % per byte i època. |
| llei | law | Una regla de l'entorn que afegim al món (espai, corrent, riu...), mai una regla per als organismes. |
| corrent (llei 2) | mixing | Una fracció *m* de cel·les que cada època canvia de lloc a l'atzar. |
| difusió | diffusion | Intercanvis amb un veí del costat. |
| riu, renovació (llei 3) | river (flow), renewal | El món es desplaça i hi entra material nou; o cel·les a l'atzar es renoven. |
| fase | phase | Les etapes del projecte: 1, la sopa; 2, el món i les seves lleis; 3, el riu. |

## La vida i com es mesura

| Català | English | Què vol dir aquí |
|---|---|---|
| replicador | replicator | Un programa que, en interactuar amb un company, s'hi copia. |
| replicador hereditari | heritable replicator | Un replicador la còpia del qual també es copia (prova de segona generació, `fase2/replication.js`). |
| cens | census | Cada 250 èpoques, la prova de replicació en una mostra de 2.048 cel·les diferents. |
| establiment | establishment | La vida s'ha establert quan, en dos censos seguits, almenys l'1 % de la mostra són replicadors hereditaris (`fase2/census.js`). |
| família, registre de famílies | family, family tracker | Grups de replicadors amb el mateix nucli de codi, que el registre segueix d'una època a l'altra (`fase2/families.js`). |
| territori, nucli de codi | territory, code core | Les cel·les que porten el nucli de codi d'una família. No és el mateix que els replicadors que funcionen. |
| transició | transition | Quan l'entropia d'ordre superior passa d'1 bit: a la sopa, sol voler dir que hi ha replicadors. |
| entropia d'ordre superior (HOE) | higher-order entropy | Una mesura de quanta estructura hi ha a la sopa, calculada amb zlib. Varia lleugerament segons la versió de Node. |
| enverinament | poisoning | Els zeros que deixen les còpies i que aturen els replicadors (entrada 2 del quadern). |
| mort (B2) | death | Que la vida establerta desaparegui. A l'exploració de B2 es comparen tres regles candidates. |

## Els experiments

| Català | English | Què vol dir aquí |
|---|---|---|
| llavor | seed | El número que fixa tot l'atzar d'un experiment. Amb la mateixa llavor i el mateix codi, la mateixa història. |
| generador v1, v2 | RNG v1, v2 | mulberry32 (els experiments antics) i xoshiro128\*\* (des de l'auditoria 1). |
| captura | snapshot | El món o la sopa desats en un fitxer `.bin` de 8 MB. |
| empremta | fingerprint | Un resum (FNV-1a o SHA-256) que identifica un món o un fitxer. |
| branca | branch | Un experiment que continua una captura (`--from`), canviant-hi una sola llei. |
| lot | batch | Una llista d'experiments que es llancen junts (`eines/llanca-lot.sh`). |
| sèrie exploratòria, confirmatòria | exploratory, confirmatory series | Una sèrie per mirar i fer preguntes, i una altra per respondre-les amb un protocol fixat abans. |
| preregistre, etiqueta | preregistration, tag | El protocol i el codi fixats en una etiqueta anotada de git abans de llançar la sèrie. |
| etapa | stage | La sèrie de la llei 2 es decidia en dues etapes, amb límits d'O'Brien–Fleming. |
| auditor, auditoria | auditor, audit | Revisions fetes per dos models d'IA, en sessions separades. No és cap revisió per experts humans. |
| troballa (AUD-xx, AU2-xx) | finding | Un problema que troba un auditor. AUD-xx són de l'auditor 1, i AU2-xx, de l'auditor 2. Conserven el número entre auditories. Totes són a `docs/auditories.md`. |
| quadern | lab notebook | `quadern/index.html`: els resultats, en ordre, amb les correccions datades. |

## Les carpetes

| Carpeta | English |
|---|---|
| `fase1/`, `fase2/`, `fase3/` | phase 1 (the soup and the core), phase 2 (the world, its laws and the analysis tools), phase 3 (data of law 3) |
| `eines/` | tools |
| `resultats/` | results |
| `quadern/` | notebook |
| `docs/`, `test/` | docs, tests |
