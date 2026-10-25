# Els pilots de la maduració de la sopa i de la intervenció dels zeros · disseny

**Estat: esborrany per a l'auditoria 15 (25-10-2026).** No s'ha fet córrer cap branca de cap dels dos pilots.
- **D'on surt:** la decisió del responsable després de l'auditoria 14 (`docs/disseny.md`). La síntesi, amb les
  propostes dels dos auditors i la de Claude, és a `../auditories/claude-origins/equip/sintesi-audit14.md`.
- **L'eina:** `eines/transforma.mjs`, amb les proves a `test/transforma.mjs`.

**Què és un pilot:** serveix per fixar el disseny d'una sèrie: l'edat, l'horitzó, el nombre de mons, el cost i la
potència. Com a l'exploració de B2:
- no en surt cap conclusió;
- els resultats del pilot no es fan servir mai com a prova;
- els mons del pilot no entren a la sèrie.

## 1. Les preguntes

**La maduració.** Un món quiet sense vida, a una edat fixada, es divideix en alíquotes des de la mateixa captura, i
cadascuna continua amb el mateix atzar. La pregunta principal: la vida apareix abans si el món continua tal com és que
si se'n desfà l'estructura conservant-ne la composició? I quina capa és la que importa:
- **l'histograma de bytes,** que Knierim i altres (2026) relacionen amb l'aparició;
- **la composició de cada programa;**
- **l'ordre dels bytes dins del programa;**
- **la disposició dels programes a l'espai?**

**Els zeros.** Als mons amb molts zeros quan s'hi estableix la vida (entrada 11), es treuen els zeros de les cel·les que
no es repliquen. La pregunta: després, la vida es perd menys que en un control que canvia el mateix nombre de bytes no
zero?

## 2. El que ja en sabem

### Les dades de la llei 2, mons quiets (80 mons, cens v3)

| Edat *a* | Sense establiment a *a* | S'estableixen dins de (*a*, *a* + 4.000] | Dins de (*a*, *a* + 8.000] |
|---|---|---|---|
| 0 (món nou) | 80 | 3 (4 %) | 8 (10 %) |
| 2.000 | 79 | 4 (5 %) | 12 (15 %) |
| 4.000 | 77 | 5 (6 %) | 14 (18 %) |
| 6.000 | 75 | 8 (11 %) | 14 (19 %) |
| 8.000 | 72 | 9 (13 %) | 16 (22 %) |

- **La pista de la maduració** (AUD-64, `docs/estat-questio.md`, §11.2): un món de 8.000 èpoques sense vida s'estableix
  en 8.000 èpoques més el doble de sovint que un de nou (22 % contra 10 %). Són dades mirades després, i poques.
- **A l'edat 8.000,** 71 dels 72 mons sense establiment no tenen cap hereditari al cens.
- **El cost d'un món sense vida:** de 0,21 a 0,25 s per època al PC. Fins a l'època 8.000, uns 30 minuts.

### El que diu el codi (comprovat a `test/transforma.mjs`)

- **El mateix atzar dona les mateixes tirades a tots els braços.** La BFF no fa servir l'atzar, i el món (els corrents,
  l'ordre, les parelles i les mutacions) en fa un nombre que no depèn del contingut de les cel·les.
  - **Per tant,** amb la mateixa `--seed` de continuació, tots els braços d'un món tenen exactament les mateixes
    parelles i les mateixes mutacions, també amb corrent.
  - **La prova** compara les tirades de mons diferents (barrejats o nous), amb corrent i sense, i comprova que
    `worldEpoch` de `sim.mjs` no canviï.
  - **Respon a la condició de l'auditor 2** (el generador no pot dependre del nombre de crides).
- **El cens té el seu atzar propi,** i les proves de replicació en consumeixen segons el contingut. Les cel·les de la
  mostra només coincideixen entre braços al primer cens. És soroll de mesura independent, no un biaix.

### Els zeros (l'exploració de l'entrada 11 i les proves de l'eina)

- **Els replicadors porten molts zeros al seu codi:** uns 19 per programa al B2021 i 18 al B2042. Treure tots els zeros
  del món, doncs, també els desfaria a ells.
- **Les cel·les que no es repliquen** en porten de 13 a 16 per programa (en una sopa a l'atzar, 0,25):
  - al B2042, el 93 % dels zeros;
  - al B2021, el 59 %.
- **El cost:** una prova de 20 èpoques des del B2042 sense els zeros de fora dels replicadors va uns 3 cops més a poc a
  poc que el control: 0,6 s per època, contra 0,2. Sense zeros, els bucles s'aturen menys.

## 3. El pilot de la maduració

| Element | Proposta | Per què |
|---|---|---|
| **Els mons** | 24 mons quiets nous: llavors 5001–5024, 512 × 256, radi 2, corrent 0, generador v2, cens v3 | Els de la llei 2 ja tenen una història coneguda. Les llavors no coincideixen amb cap de les anteriors |
| **L'envelliment** | `node sim.mjs --world 512x256 --seed S --mixing 0 --epochs 8000 --census 250 --census-version v3 --rng v2 --stop-after-event 0 --json ... --save ...` | Els mons que s'estableixen abans de l'època 8.000 s'aturen i queden fora. Se n'esperen 2 o 3 de 24 |
| **L'edat** | *a* = 8.000 | La segona meitat del rang de la llei 2 (auditor 1); el ritme hi és més alt; i *a* + *H* = 16.000, l'horitzó de la llei 2 |
| **Els braços** | `continue`, `shuffle-programs`, `shuffle-within`, `shuffle-all` i `reinit` | El nucli comú dels dos auditors (`continue`, `shuffle-within` i `shuffle-all`), i els dos d'un sol auditor: `shuffle-programs` (auditor 2) i `reinit` (auditor 1) |
| **L'atzar de la transformació** | La llavor del món + 600.000, la mateixa als quatre braços que en fan servir | Independent del de la continuació (auditor 2) |
| **La continuació** | *K* = 2 llavors, la del món + 400.000 i + 500.000, les mateixes a tots els braços. *H* = 8.000, fins a l'època 16.000, i `--stop-after-event 0` | Els mateixos nombres aleatoris en tots els braços (els dos auditors). L'aturada en confirmar l'establiment estalvia càlcul |
| **La mesura principal** | L'establiment dins de *H*, amb el criteri de la llei 2 (`fase2/census.js`) | El criteri que ja coneixem |
| **Les descriptives** | El temps fins a l'establiment; el primer cens amb algun hereditari; la concordança entre les dues llavors i entre els braços | Per triar la mesura de la sèrie i calcular-ne la potència |
| **La mida** | 24 × 5 × 2 = 240 branques | — |
| **El cost** | Unes 12 h d'envelliment i com a molt unes 135 h de branques (unes 33 min cadascuna), unes 145 h en total: un dia, amb 6 branques alhora al PC i 4 a la màquina virtual | — |

**Què se'n traurà:**
- la proporció d'establiments a cada braç (unes 44 branques per braç);
- la concordança entre llavors i entre braços d'un mateix món;
- el cost real.

Amb el ritme de la llei 2, s'hi esperen uns 10 establiments a `continue` i uns 4 a `reinit`. Només un efecte gran s'hi
veuria. **No es decideix res amb aquestes xifres:** serveixen per a la potència de la sèrie.

**Una potència orientativa de la sèrie** (mons independents, *K* = 2, prova de signes unilateral amb α = 0,025, sobre
el contrast `continue` contra `shuffle-all`):

| `continue` | `shuffle-all` | 40 mons | 80 | 120 | 160 | 240 |
|---|---|---|---|---|---|---|
| 22 % | 11 % | 42 % | 73 % | 90 % | 98 % | 100 % |
| 22 % | 15 % | 17 % | 32 % | 48 % | 62 % | 82 % |

Amb 120 mons, a unes 2,7 h de càlcul cadascun (l'envelliment i 4 branques), serien uns 320 h: uns dos dies. El pilot ho
ha de confirmar.

## 4. El pilot dels zeros

| Element | Proposta | Per què |
|---|---|---|
| **Els mons** | Els 11 mons B amb el 8 % de zeros o més a *t*: els 7 fràgils (B2002, B2011, B2021, B2038, B2042, B2043 i B2071), i B2001, B2044, B2058 i B2078 | És un pilot. El llindar del 8 % és posterior a les dades: una sèrie en necessitaria un de fixat abans |
| **La captura** | La de l'establiment, *t* (`fase2/resultats/b2/repartiment.json`) | El punt de partida de B2 |
| **Els braços** | `continue`, `zeros-outside` i `control-outside` | Treure tots els zeros (`zeros-all`) també desfaria els replicadors (§2) |
| **L'atzar de la transformació** | La llavor del món + 600.000, la mateixa a `zeros-outside` i `control-outside` | Així totes dues fan servir exactament les mateixes cel·les |
| **La continuació** | Corrent 0,01 (la condició d'origen), *K* = 2, la llavor del món + 400.000 i + 500.000, i *H* = 2.000 | Als mons fràgils, la vida es perd entre *t* + 500 i *t* + 2.500 (B2), i a la història original, abans de *t* + 1.000 |
| **La mesura principal** | La pèrdua sostinguda R2 dins de *H* | La de B2 |
| **Les descriptives** | La proporció d'hereditaris de cada cens; si la vida es recupera; els zeros al llarg del temps, pels bytes més freqüents del registre de text (cada 100 èpoques) | Per saber si els zeros tornen, i a quin ritme |
| **La mida** | 11 × 3 × 2 = 66 branques | — |
| **El cost** | Amb vida, de 2,5 a 3 s per època, i el braç sense zeros pot anar més lent: de 2 a 5 h per branca, i de 150 a 250 h en total | — |

**Una limitació, dita abans:** el replicador continua deixant zeros. Si el món es torna a enverinar de pressa, la
intervenció pot fer poc efecte encara que els zeros siguin la causa. Per això el pilot segueix els zeros al llarg del
temps.

## 5. Les decisions obertes, per a l'auditoria 15

| Decisió | La proposta de Claude | Alternatives |
|---|---|---|
| L'edat i l'horitzó de la maduració | *a* = 8.000, *H* = 8.000 | *a* = 4.000 o 6.000; *H* més llarg |
| Els braços del pilot de la maduració | Tots cinc | Només el nucli de tres (`continue`, `shuffle-within` i `shuffle-all`) |
| La mesura de la sèrie de la maduració | L'establiment dins de *H* | El temps fins a l'establiment (log-rank aparellat); el primer hereditari |
| Els mons del pilot dels zeros | Els 11 per sobre del 8 % | Tots els 33 mons B, o només els 7 fràgils |
| El braç dels zeros | Només els de fora dels replicadors | També `zeros-all`, com a descriptiu |
| La mostra del cens | Com ara: comuna entre braços només al primer cens | Un cens amb la mostra comuna a tots els censos. Seria una opció nova de `sim.mjs`, perquè les empremtes del determinisme no es toquen |

## 6. La traçabilitat

- **Les captures transformades** no van a git, però es poden regenerar exactament amb la mateixa captura, el tipus i la
  llavor.
  - **El registre de cada una** (el `.json` que escriu l'eina) diu la SHA-256 de l'entrada i de la sortida, el tipus,
    la llavor, el commit i què ha canviat.
  - **Aquests registres** van a git amb els de les branques.
- **Les captures envellides** també es regeneren amb la llavor i el commit.
- **Les branques:** cada registre comença amb `codi=<commit>`, com sempre, i es llancen amb `eines/llanca-lot.sh` des de
  la carpeta del commit.
- **Abans de llançar,** el codi en un commit de `main`, i les actualitzacions de Windows pausades.
