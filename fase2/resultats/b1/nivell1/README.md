# B1, el nivell 1 · les ordres, escrites abans de calcular

**Escrit el 03-11-2026, abans de calcular res amb la llavor del pla** (`docs/pla-b1.md`, v0.4: §5, §8 i §11). Els quatre mòduls
que fan el càlcul són idèntics als de `0bb753e`, el codi de la PR #30, amb el GO de tots dos auditors a l'auditoria 26. Les
ordres surten del pla de l'anàlisi (`PLAN`, a `eines/densitat-analisi.mjs`): la llavor, les distribucions, les químiques i les N.

| Fitxer | Què |
|---|---|
| `llista.txt` | Les 15 ordres: les 13 químiques amb D½ (`d-mig`), i C0 i K0 amb bytes uniformes, 10⁷ programes cadascuna |
| `llista-ampliacio.txt` | Les 13 de l'ampliació (§5): les químiques amb D½, de l'índex 10⁷ al 10⁸. Només es llancen si l'anàlisi de la primera llista diu que C0 hi té menys de 30 hereditaris |
| `executa.sh` | Executa una llista, una ordre darrere l'altra. Abans, comprova la SHA-256 de la llista, el commit i que la còpia no tingui canvis |
| `registres/` | Els JSONL, un per ordre (encara cap). L'anàlisi: `node eines/densitat-analisi.mjs fase2/resultats/b1/nivell1/registres` |

**Les SHA-256:**
- `llista.txt`: `0bb74a6c5a31ac722f096dc64763e0829701492b96c2a681092e82ef2a4f6a2a`
- `llista-ampliacio.txt`: `3d23e1dc5cc90af4b5d4d7a89fe34acba5ed9a9f9868bbc9c1488b9b558610ad`

## Com es llança

- **Quan:** després de la decisió de la sèrie de la maduració, amb el PC i la màquina virtual lliures (§11).
- **On:** al PC, des d'una còpia neta d'un commit de `main` que tingui aquesta carpeta i els quatre mòduls de `0bb753e`. Amb 8 fils
  per ordre, unes 4,2 h, i l'ampliació, si cal, unes 33 h més. La màquina virtual fa servir el mateix processador, i no hi afegiria
  gaire (§8).
- **L'ordre,** des de l'arrel de la còpia, en una finestra amagada i a prioritat baixa:
  `bash fase2/resultats/b1/nivell1/executa.sh fase2/resultats/b1/nivell1/llista.txt SHA-256 COMMIT`.
- **Mentre corren, cap recompte** (§11). El seguiment, només `estat-llista.txt`: quina ordre comença, quan acaba i amb quin codi.
  La consola de cada ordre (`consola/`) només diu quants programes s'han provat.
- **Si s'atura** (per exemple, si el PC es reinicia), es torna a llançar la mateixa llista: les ordres acabades se salten. Un registre
  incomplet atura l'executor sense tocar-lo: es mou a part, sense esborrar-lo, i es torna a llançar.
- **Al final,** al costat dels registres (§11): `execucio-llista.txt`, amb el commit, la versió de Node, la SHA-256 de la llista i la
  de cada registre. Va a git abans de mirar cap resultat.
- **Els registres,** a git si cap no passa de 50 MB. Si no, a la còpia de seguretat, com les captures, amb la SHA-256 a git: es poden
  tornar a fer amb la mateixa ordre.

## Abans d'analitzar: la repetició (§11)

Per veure que els registres s'han fet de debò (auditor 2):
1. **La llavor:** els vuit primers dígits hexadecimals de la SHA-256 d'`execucio-llista.txt`, com a enter. Si fos la del pla, la
   següent. No es pot saber abans que hi hagi els registres, i quan es calcula ja són a git.
2. **Els trossos:** `node eines/tria.mjs LLAVOR 3 0 1 2 … 99`. Són tres dels cent trossos de 10⁵ programes (els de `--tros`), els
   mateixos a les 15 tirades, perquè són els mateixos programes (§5).
3. **Es tornen a fer** amb l'ordre de cada tirada, però amb `--de` al començament del tros, `--programes 100000` i el registre a
   `repeticio/`. Els replicadors del tros i el seu recompte hi han de coincidir, línia a línia, amb els de la tirada.
4. **L'ampliació,** si cal, igual: amb `execucio-llista-ampliacio.txt` i els trossos del 100 al 999.

**L'executor, provat** (03-11-2026, fora del repositori, amb la llavor de prova 777 i 40 programes): una llista bona, la mateixa un
altre cop (se salten totes), un registre incomplet, una SHA-256 o un commit que no són els de la llista, una línia que no és cap
ordre del nivell 1 i un registre repetit.

## Després del càlcul (05-11-2026)

- **El càlcul:** les 15 ordres, de les 21.17.36 del 04-11-2026 a les 06.01.57 del 05-11-2026, totes amb el codi 0 (`estat-llista.txt`).
  Unes 35 min per ordre, i no 17: 8 h 44 min en total, i no 4,2 h.
- **`execucio-llista.txt`,** a git (`a146177`) abans de mirar cap resultat.
- **Els registres no són a git:** dos passen de 50 MB (`d-mig-R0`, 53,7 MB, i `d-mig-S1`, 56,2 MB). Són a la còpia neta del càlcul i,
  comprimits (101 MB), a la còpia de seguretat i a la versió `b1-nivell1-registres-v1` de GitHub. Totes coincideixen amb les SHA-256
  d'`execucio-llista.txt`.
- **La repetició:** `repeticio/`, amb el seu README.

## L'extracte dels hereditaris (auditoria 27, AUD-174)

Els registres sencers no són a git, i ningú de fora no els podia comprovar sense refer el càlcul (unes 9 h). L'extracte en porta el
que fa falta per comprovar l'anàlisi dels hereditaris i per a la prova d'autonomia:

- **Què hi ha:** per a cada registre, en ordre alfabètic, la línia d'inici, les dels replicadors hereditaris (sols o en context) i la
  línia final, tal com són, byte a byte. Són 75.148 línies: 75.118 hereditaris i les 30 línies d'inici i de final.
- **Com es fa:** `node fase2/resultats/b1/nivell1/extreu-hereditaris.mjs CARPETA-DELS-REGISTRES fase2/resultats/b1/nivell1/execucio-llista.txt
  hereditaris.jsonl`. Abans, comprova cada registre amb la SHA-256 d'`execucio-llista.txt`, i el recompte de cada un amb la seva línia
  final. No sobreescriu cap fitxer.
- **Les SHA-256:**
  - **del contingut** (`hereditaris.jsonl`, sense comprimir, 18.856.417 bytes): `6029d8783b13b1c8faa4077b0e28b2c569903e2420b8f660efa081092fb049a1`.
    És la que s'ha de comprovar: la del fitxer comprimit depèn de la versió de zlib (AUD-55);
  - **del fitxer comprimit** (`hereditaris.jsonl.gz`, 5.610.613 bytes): `a927f02e541fe9f7aea6e7e4989fa89719f0cd01d35cfe343c393366d661dca9`.
- **Comprovat:** l'auditor 1 en va fer un altre des dels registres sencers, sense l'eina de l'equip, i és igual byte a byte; l'auditor 2
  en va refer els recomptes, i quadren amb `analisi.txt` (auditoria 27).
- **Els registres sencers:** per a l'auditor 2, amb el paquet de l'auditoria 28 (AU2-139). Per a tothom, des del 05-11-2026, a la
  versió `b1-nivell1-registres-v1` de GitHub (<https://github.com/xavig-icv/genesis/releases/tag/b1-nivell1-registres-v1>): un `tar` de 105 MB (SHA-256 `991bd026…66c3`) amb els 15 registres
  comprimits, `execucio-llista.txt` i `sha256-gz.txt`. Descomprimits, cada registre ha de tenir la SHA-256 d'`execucio-llista.txt`.
