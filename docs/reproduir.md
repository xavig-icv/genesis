# Com reproduir els resultats

Receptes per refer, des de fora, els resultats del projecte. Van de segons a hores. Totes les ordres
s'executen des de l'arrel del repositori, i es poden copiar tal com són en una consola `bash` (a Windows, Git
Bash).

## Què cal

- **Node.js:** per a ús nou, una versió amb manteniment (22 o 24). Els registres antics es van fer amb Node 16
  (el PC) i Node 20 (la VM). Amb qualsevol versió, la història del món és la mateixa. L'entropia d'ordre
  superior (HOE) difereix a la tercera xifra decimal, perquè depèn de la versió de zlib que porta Node (AUD-55).
- **Els sistemes provats:**
  - Windows 10 amb Git Bash;
  - Debian 13;
  - Ubuntu, a la integració contínua de GitHub, amb Node 16, 20, 22 i 24.

  No s'ha provat a macOS.
- **El navegador,** per a la interfície: Chrome, Edge o un altre basat en Chromium.

**Quant tarda cada cosa**, mesurat als registres:

| Què | Temps |
|---|---|
| La prova ràpida (§1) | de 10 a 15 segons |
| `npm test` | uns minuts |
| La decisió de la llei 2 (§3) | segons |
| Les decisions de B2, dels zeros i de la maduració (§6) | de 2 a 25 segons cadascuna |
| Una sopa de la Fase 1 (§2) | uns minuts fins a la transició (època 200); de 15 a 35 minuts fins a l'època 750, segons la càrrega de la màquina |
| Un món de la sèrie de la llei 2, fins a 16.000 èpoques o fins a 1.000 èpoques després de l'establiment | de 6 minuts a 3,3 hores, amb una mediana d'una hora |
| La sèrie de la llei 2 sencera (160 mons) | unes 170 hores de càlcul: més d'un dia amb sis processos alhora |

## 1. La prova ràpida

```bash
node sim.mjs --world 64x64 --seed 1 --epochs 300 --census 100
npm test
```

Les proves inclouen les empremtes de determinisme (`test/determinisme.mjs`): si passen, el simulador fa
exactament les mateixes històries que quan es van fer els experiments. Comprovat el 05-11-2026 amb Node 16: la
prova ràpida, en 8 segons, i les 325 proves de `npm test`, totes bé.

## 2. La sopa de la Fase 1 (entrades 1 i 2 del quadern)

La llavor 1, amb el generador v1 dels experiments antics i 7 fils, com al navegador:

```bash
node sim.mjs --seed 1 --chunks 7 --rng v1 --epochs 750 --after 1000 --save fase1-llavor1 --save-every 250
```

- **La transició:** arriba a l'època 200.
- **Per què `--after 1000`:** sense aquesta opció, la simulació s'atura 300 èpoques després de la transició.
- **La comprovació:** les captures de les èpoques 250, 500 i 750 han de tenir les SHA-256 de
  `docs/captures.sha256` (`fase1/resultats/llavor1-fils7-epoca*.bin`). Comprovat el 19-10-2026 i el 05-11-2026
  amb Node 16: coincideixen totes tres. El 05-11-2026 va trigar 34 minuts, amb una altra simulació alhora.

```bash
cd fase1-llavor1 && sha256sum llavor1-fils7-epoca250.bin llavor1-fils7-epoca500.bin llavor1-fils7-epoca750.bin; cd ..
grep llavor1-fils7 docs/captures.sha256
```

**A la interfície del navegador,** la història depèn del nombre de fils i del generador. Per veure-hi la de
l'entrada 1, cal triar el generador v1, 7 fils i la llavor 1 (AUD-80).

## 3. La decisió de la llei 2 (entrada 8)

**Des de `main`, el programa es nega a decidir,** i és correcte: la decisió confirmatòria només es pren des
d'una còpia idèntica al commit de l'etiqueta del preregistre (`docs/protocol-estadistic.md`). Es fa així:

```bash
git worktree add --detach ../preregistre preregistre-llei2
cd ../preregistre
node fase2/estadistica.mjs --etapa 2 ../genesis/fase2/resultats/serie-llei2/A ../genesis/fase2/resultats/serie-llei2/B > /tmp/etapa2.txt
diff /tmp/etapa2.txt ../genesis/fase2/resultats/serie-llei2/etapa2-sortida.txt && echo idèntica
cd ../genesis && git worktree remove ../preregistre
```

- **El camí:** `../genesis` és la carpeta del repositori, com la d'un clon de GitHub. Si el vostre es diu d'una altra
  manera, canvieu-lo.
- **La sortida** ha de ser idèntica a la desada.
- **Una excepció possible:** la línia de sensibilitat de l'HOE pot canviar si la vostra versió de Node porta
  un altre zlib. La decisió no en depèn.
- **Comprovat el 19-10-2026 i el 05-11-2026** amb Node 16: la sortida és idèntica byte a byte. Els dos auditors ho
  van refer a l'auditoria 9.
- **Qui decideix:** la decisió la pren el programa de l'etiqueta (`8cd4449`), no el de `main` (AUD-87).
  - **Les comprovacions noves** del preregistre (PR #6) protegeixen les sèries futures.
  - **La de la llei 2** es va protegir amb les comprovacions a mà de l'acta del llançament.

**Sense `--etapa`**, des de `main`, `node fase2/estadistica.mjs carpeta-A carpeta-B` en fa l'informe
descriptiu.

## 4. Un món de la sèrie de la llei 2

Cada JSONL de la sèrie comença amb l'ordre exacta que el va fer. Per exemple:

```bash
head -1 fase2/resultats/serie-llei2/A/1006.jsonl
```

**Per repetir-la:**
- **Les rutes:** canvieu les de `--json` i de `--save` per una carpeta vostra.
- **La comprovació:** compareu els censos dels dos JSONL (les línies `"type":"census"`). Han de ser
  idèntics.
- **El codi:** feu servir el commit que diu el registre (`codi=8cd4449`, a la línia d'inici del JSONL), amb
  `git worktree add`, com a la §3 (AU2-63).
  - **Els commits posteriors** han mantingut les històries dels casos de regressió
    (`test/determinisme.mjs`), i a l'auditoria 9 dues llavors de la sèrie refetes amb el codi de `f821f4d` van
    donar la mateixa història.
  - **Però la garantia és el commit del registre,** no un de posterior.
- **Comprovat el 05-11-2026:** el món 1006 del grup A, refet amb el codi del registre (`8cd4449`) i Node 16, sense
  `--save`. Els 13 censos són idèntics byte a byte als del registre, que es va fer amb Node 20, i l'empremta final
  (`7f8d1963`) i l'època de l'establiment (2.250) també coincideixen. Va trigar 17,5 minuts.

## 5. Les imatges

`docs/imatges/README.md` té l'ordre de cada imatge i la captura que fa servir.
- **La corba de la llei 2:** només necessita els JSONL, que són a git, i tarda segons.
- **Les altres:** necessiten captures. La sèrie només desa les dels tres censos que precedeixen
  l'establiment, i es regeneren amb l'ordre del JSONL (§4). L'animació i el zoom necessiten una nova
  execució, i `docs/imatges/README.md` en dona l'ordre.
- **Comprovat el 05-11-2026** amb Node 16: les dues corbes de la llei 2 surten idèntiques, byte a byte.

## 6. Les decisions de B2, dels zeros i de la maduració (entrades 10, 13 i 14)

Com la de la llei 2 (§3): cada decisió es pren des d'una còpia del commit de la seva etiqueta, i el programa es nega a decidir des de
`main`. Els registres de les sèries són a `main`, i no a l'etiqueta, que es va fer abans de llançar-les: es copien a la carpeta de la
sèrie de la còpia. Des de l'arrel del repositori:

```bash
# B2, la vida establerta (entrada 10)
git worktree add --detach ../decisio preregistre-b2
mkdir -p ../decisio/fase2/resultats/b2/confirmacio
cp fase2/resultats/b2/confirmacio/*.jsonl ../decisio/fase2/resultats/b2/confirmacio/
(cd ../decisio && node fase2/b2-confirmacio.mjs --decideix fase2/resultats/b2/confirmacio) > /tmp/b2.txt
diff /tmp/b2.txt fase2/resultats/b2/confirmacio/decisio-sortida.txt && echo idèntica
git worktree remove --force ../decisio
```

```bash
# els zeros (entrada 13)
git worktree add --detach ../decisio preregistre-zeros
mkdir -p ../decisio/fase2/resultats/zeros/serie/branques
cp fase2/resultats/zeros/serie/branques/*.jsonl ../decisio/fase2/resultats/zeros/serie/branques/
(cd ../decisio && node fase2/zeros-confirmacio.mjs --decideix fase2/resultats/zeros/serie/branques) > /tmp/zeros.txt
diff /tmp/zeros.txt fase2/resultats/zeros/serie/decisio-sortida.txt && echo idèntica
git worktree remove --force ../decisio
```

```bash
# la maduració (entrada 14)
git worktree add --detach ../decisio preregistre-maduracio
mkdir -p ../decisio/fase2/resultats/maduracio/serie/branques
cp fase2/resultats/maduracio/serie/branques/*.jsonl ../decisio/fase2/resultats/maduracio/serie/branques/
(cd ../decisio && node fase2/maduracio-confirmacio.mjs --decideix fase2/resultats/maduracio/serie/branques) > /tmp/maduracio.txt
diff /tmp/maduracio.txt fase2/resultats/maduracio/serie/decisio-sortida.txt && echo idèntica
git worktree remove --force ../decisio
```

- **La sortida** ha de ser idèntica a la desada. `--force`, en treure la còpia, perquè hi queden els registres copiats.
- **Comprovat el 05-11-2026** amb Node 16: totes tres, idèntiques byte a byte (B2 en 2 segons, els zeros en 6 i la maduració en 23).
  Els dos auditors també les van refer, cadascuna a la seva auditoria.
- **Per què no cal cap captura:** les decisions només llegeixen els registres. Les captures de les branques es regeneren amb
  l'ordre de la línia d'inici de cada registre, com a la §4.

## 7. B1, el nivell 1 (entrada 15)

Els registres sencers no són a git: dos passen de 50 MB. Sí que hi ha l'extracte dels replicadors hereditaris, amb les línies tal
com són als registres, i la SHA-256 del seu contingut (`fase2/resultats/b1/nivell1/README.md`):

```bash
node -e "const z=require('zlib'),c=require('crypto'),fs=require('fs');const b=z.gunzipSync(fs.readFileSync('fase2/resultats/b1/nivell1/hereditaris.jsonl.gz'));console.log(c.createHash('sha256').update(b).digest('hex'))"
```

Ha de donar `6029d8783b13b1c8faa4077b0e28b2c569903e2420b8f660efa081092fb049a1`. Els registres sencers es poden baixar de la versió
`b1-nivell1-registres-v1` del repositori (<https://github.com/xavig-icv/genesis/releases/tag/b1-nivell1-registres-v1>, 105 MB), o refer-los amb les ordres de
`fase2/resultats/b1/nivell1/llista.txt` (unes 9 hores amb 8 fils). Descomprimits, han de tenir les SHA-256 d'`execucio-llista.txt`.

## Les captures

- **Per què no són a git:** els fitxers `.bin` fan 8 MB cadascun.
- **Les registrades:** n'hi ha 183, amb les seves SHA-256, a `docs/captures.sha256`, i `docs/captures.md`
  diu d'on surt cadascuna.
- **Com es tornen a fer:** amb el mateix commit, la mateixa llavor i els mateixos paràmetres.
- **Com es comproven:** `sha256sum -c docs/captures.sha256`, des de l'arrel. En un sistema en un altre idioma,
  amb `LC_ALL=C` al davant, perquè la sortida digui `OK`.

## Una diferència amb cubff

La taxa de mutació del projecte és el 0,024 % per byte i època, la que diu l'article, i cubff fa servir
1/4.096 (0,0244 %). És la mateixa a totes les sèries del projecte, però cal tenir-la present en comparar-nos
amb l'article (`eines/cubff/README.md`).
