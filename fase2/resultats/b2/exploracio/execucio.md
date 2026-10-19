# B2 · com es va executar l'exploració

Com es van fer les 58 branques de `LLEGEIX-ME.md`. No hi ha cap resultat: l'anàlisi és a part.

## El llançament

- **18-10-2026, 15:08:** es llancen els dos lots, amb el commit `b3e0631`.
  - **Al PC:** `llista-pc.txt`, amb 30 branques i Node 16.
  - **A la màquina virtual:** `llista-vm.txt`, amb 28 branques i Node 20.
  - **Com:** 3 branques alhora a cada màquina.
    - **A la màquina virtual,** amb `llanca-lot.sh`.
    - **Al PC,** amb `experiments.sh` directament (AUD-62). El `llanca-lot.sh` d'aquell commit s'aturava
      en una còpia neta de git (l'error que corregeix la PR #4). La sortida també va només al fitxer del
      lot, i el simulador és el mateix.
- **19:20, la incidència:** un reinici automàtic de Windows Update va aturar els dos lots, perquè la màquina
  virtual corre al mateix ordinador.
- **20:10, el rellançament:** amb el mateix commit. Les branques que s'havien quedat a mitges es van tornar a
  fer des del principi. Són deterministes, i en surt la mateixa història.

## El repartiment de la cua

**19-10-2026, 01:11.** El PC anava més a poc a poc que la màquina virtual, i les 10 últimes branques de
`llista-pc.txt` (de la línia 21 a la 30) es van passar a la màquina virtual.
- **La llista:** és `llista-vm2.txt`, idèntica a aquelles línies.
- **Com:** 4 branques alhora, amb el mateix commit.
- **Les captures de partida:** es van comprovar amb `docs/captures.sha256`, abans i després de copiar-les.

**Les branques duplicades.** Al final, el PC va anar més de pressa del previst, i en va començar algunes de
`llista-vm2.txt` que la màquina virtual també feia.
- **Quina còpia val:** la de la màquina a què la llista assignava la branca. Es va decidir abans de mirar cap
  resultat. Són les del PC per a les línies 1 a 20 de `llista-pc.txt`, i les de la màquina virtual per a
  `llista-vm.txt` i `llista-vm2.txt`.
- **Les duplicades acabades** (B2058-m0, B2058-m0.01 i B2076-m0) són a `duplicats/pc/`.
  - Comparades amb les de la màquina virtual, tenen **els mateixos censos i la mateixa empremta del món**.
  - És a dir, Node 16 i Node 20 fan exactament la mateixa història.
- **Dues duplicades més** (B2076-m0.01 i B2080-m0.01) es van aturar a mitges, perquè només treien processador
  a la màquina virtual. El lot del PC les anota com a fallades (codi 127), i no hi són.

## El final

- **Quan van acabar:** el PC, el 19-10-2026 a les 08:48, i la màquina virtual, a les 09:24.
- **Les 58 branques són completes:** el JSONL té la línia d'inici, amb la llavor, i la final, i el registre té
  l'empremta del món.
- **Totes porten `codi=b3e0631`,** sense `+canvis`, i la llavor de continuació prevista (la del món +
  100.000).
- **Les màquines:** 20 branques es van fer amb Node 16 i 38 amb Node 20.
  - La història del món no en depèn.
  - L'entropia d'ordre superior dels registres difereix a la tercera xifra decimal (AUD-55).
  - L'anàlisi de B2 no la fa servir.
- **Els fitxers de cada lot:** `lot-llista-pc.out`, `lot-llista-vm.out` i `lot-llista-vm2.out`.
- **Les sumes:** `sha256.txt` té les SHA-256 de tots els fitxers copiats de les dues màquines. La còpia de la
  màquina virtual es va comprovar amb les sumes calculades allà.

**Una nota sobre el seguiment.** El `seguiment.sh` del commit `b3e0631` és anterior a la PR #5. Després del
rellançament, comptava dues vegades les branques acabades en el primer lot i saltades en el segon. Només
afectava el recompte durant l'execució: els recomptes d'aquesta nota es van fer branca per branca, amb el
JSONL.
