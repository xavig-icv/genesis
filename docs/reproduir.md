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
| La prova ràpida (§1) | uns 15 segons |
| `npm test` | uns minuts |
| La decisió de la llei 2 (§3) | segons |
| Una sopa de la Fase 1 fins a la transició (§2) | minuts |
| Un món de la sèrie de la llei 2, fins a 16.000 èpoques o fins a 1.000 èpoques després de l'establiment | de 6 minuts a 3,3 hores, amb una mediana d'una hora |
| La sèrie de la llei 2 sencera (160 mons) | unes 170 hores de càlcul: més d'un dia amb sis processos alhora |

## 1. La prova ràpida

```bash
node sim.mjs --world 64x64 --seed 1 --epochs 300 --census 100
npm test
```

Les proves inclouen les empremtes de determinisme (`test/determinisme.mjs`): si passen, el simulador fa
exactament les mateixes històries que quan es van fer els experiments.

## 2. La sopa de la Fase 1 (entrades 1 i 2 del quadern)

La llavor 1, amb el generador v1 dels experiments antics i 7 fils, com al navegador:

```bash
node sim.mjs --seed 1 --chunks 7 --rng v1 --epochs 750 --after 1000 --save fase1-llavor1 --save-every 250
```

- **La transició:** arriba a l'època 200.
- **Per què `--after 1000`:** sense aquesta opció, la simulació s'atura 300 èpoques després de la transició.
- **La comprovació:** les captures de les èpoques 250, 500 i 750 han de tenir les SHA-256 de
  `docs/captures.sha256` (`fase1/resultats/llavor1-fils7-epoca*.bin`). Comprovat el 19-10-2026 amb Node 16:
  coincideixen totes tres.

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
node fase2/estadistica.mjs --etapa 2 ../claude-origins/fase2/resultats/serie-llei2/A ../claude-origins/fase2/resultats/serie-llei2/B > /tmp/etapa2.txt
diff /tmp/etapa2.txt ../claude-origins/fase2/resultats/serie-llei2/etapa2-sortida.txt && echo idèntica
cd ../claude-origins && git worktree remove ../preregistre
```

- **El camí:** `../claude-origins` és la carpeta del repositori. Si el vostre clon es diu d'una altra manera,
  canvieu-lo.
- **La sortida** ha de ser idèntica a la desada.
- **Una excepció possible:** la línia de sensibilitat de l'HOE pot canviar si la vostra versió de Node porta
  un altre zlib. La decisió no en depèn.
- **Comprovat el 19-10-2026** amb Node 16: la sortida és idèntica byte a byte.

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
- **El codi:** el commit era el `8cd4449`, i qualsevol commit posterior fa la mateixa història, perquè les
  empremtes de determinisme no es toquen mai.

## 5. Les imatges

`docs/imatges/README.md` té l'ordre de cada imatge i la captura que fa servir.
- **La corba de la llei 2:** només necessita els JSONL, que són a git, i tarda segons.
- **Les altres:** necessiten captures. La sèrie només desa les dels tres censos que precedeixen
  l'establiment, i es regeneren amb l'ordre del JSONL (§4). L'animació i el zoom necessiten una nova
  execució, i `docs/imatges/README.md` en dona l'ordre.

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
