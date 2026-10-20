# B2 · prolongació pilot

**Exploratòria.** Serveix per fixar l'horitzó *H* i el nombre de llavors *K* de la sèrie preregistrada de B2
abans de crear-ne l'etiqueta. No n'ha de sortir cap conclusió. Només fa servir mons de la part `exploracio`
del repartiment: cap dels 29 mons reservats.

**Per què.** Ho va decidir el responsable el 19-10-2026, després de l'auditoria 9 (AUD-85, AU2-61). L'exploració
només arriba a 2.000 èpoques, i calen tres coses abans de fixar el disseny:
- **el cost real:** per època, el cost d'una branca viva creix amb el temps;
- **si hi ha morts tardanes;**
- **si la vida "envelleix"** quan el món s'omple, com a la sopa (entrada 2).

## Les branques

**Els mons.** Són 7 dels 29 de l'exploració, triats a l'atzar abans de llançar res, amb
`node eines/tria.mjs 20261020 7` sobre la llista de mons de l'exploració, ordenada per grup i llavor (cadascun
amb la seva *t*). La tria ha donat:
- A1046;
- B2002, B2036, B2038, B2043, B2062 i B2076.

**Per a cada món:**
- **les dues condicions:** *m* = 0 i *m* = 0,01;
- **la llavor:** la mateixa de l'exploració, la del món + 100.000;
- **el punt de partida:** la mateixa captura de l'època *t*.

**El que n'hem d'obtenir:**
- **La mateixa història:** les primeres 2.000 èpoques han de ser **idèntiques** a les de l'exploració. Es
  compararan els censos.
- **Fins on:** continuen fins a *t* + 6.000, 4.000 èpoques més.
- **El món final:** es desa a `captures/` (`--save`). No va a git, i és per estudiar després quina vida hi ha
  (auditoria 9, §4.1 de l'auditor 1).

## L'execució

- **El codi:** el commit d'aquest fitxer. El simulador no ha canviat des de l'exploració.
- **Les màquines:** cada món, amb les seves dues branques, va a una sola màquina. S'alternen per ordre de la
  tria: A1046, B2036, B2043 i B2076 al PC (`llista-pc.txt`), i B2002, B2038 i B2062 a la màquina virtual
  (`llista-vm.txt`).
- **El llançament:** amb `eines/llanca-lot.sh`, 4 branques alhora a cada màquina.
- **El seguiment:** `eines/seguiment.sh --agregat`.
- **Si cal repartir la cua o se n'interromp una,** es torna a fer des del principi, i val la còpia de la
  màquina assignada.

## Què se'n mirarà

Es mirarà en acabar, i serà descriptiu:
- **El cost per època,** per trams de 500 èpoques, en les branques vives.
- **Les morts amb la regla R2** (§5 de `docs/protocol-b2.md`), també després de *t* + 2.000, i si es
  recuperen.
- **Els hereditaris a la mostra** al llarg del temps. Si la vida s'acosta a omplir el món, si s'estanca o si
  baixa.
- **El canvi de règim** (AUD-82), només com a descripció. Amb 7 mons no es pot provar res, i la prova és per a
  la sèrie preregistrada.

## Què n'ha sortit (20-10-2026)

Les 14 branques van acabar entre el 19-10 a les 15:13 i el 20-10 a les 07:35, sense cap fallada i amb els
registres complets.
- **Els registres:** les capçaleres dels dos lots (`lot-llista-*.out`) portaven el camí absolut de la
  llista. S'ha canviat per un de relatiu (`fase2/resultats/b2/pilot/llista-*.txt`), i la resta és com va
  sortir.
- **Què no se'n treu:** com deia més amunt, res d'això no és cap conclusió. Serveix per fixar el disseny.

**La mateixa història.** Les 14 branques són idèntiques a l'exploració fins a *t* + 2.000: els 8 censos i les
20 mesures.
- **L'única diferència és l'HOE,** com a molt de 7,7·10⁻⁴. Sis branques es van fer amb Node 16 i les de
  l'exploració amb Node 20, i l'HOE depèn de la versió de zlib (AUD-55).
- **La resta és igual:** *h*₀ i les operacions coincideixen.

**Les pèrdues R2 fins a *t* + 6.000: 2 de 14, les mateixes de l'exploració.**
- **Quines:** B2002-m0, a *t* + 1.000, i B2038-m0, a *t* + 1.750. Totes dues són branques de canvi: mons B que
  perden el corrent.
- **Cap de tardana:** cap branca no perd la vida després de *t* + 2.000.
- **Com acaben:**
  - B2002-m0 torna a 22 hereditaris al cens final, i per tant compta com a recuperada (21 o més);
  - B2038-m0 acaba amb 17.
- **Per condició:** d'origen, 0 de 7; de canvi, 2 de 7.

**Si la vida envelleix: no s'hi veu.**
- **Com acaben les 12 branques que no la perden:** entre el 90 % i el 100 % del seu màxim, i totes amb 1.540
  hereditaris o més de 2.048 a *t* + 6.000.
- **Les baixades més grans:**
  - B2043-m0, de 1.942 a 1.757;
  - B2036-m0.01 i B2062-m0, un 8 %.
- **Alguns mons triguen a omplir-se.** A1046-m0 i les dues branques de B2062 tenen 134–304 hereditaris a
  *t* + 2.000, i 1.540–1.768 a *t* + 6.000.

**El cost.** La mitjana de les 12 branques vives, en segons per època i per trams de 500 èpoques:

| Tram (des de *t*) | 0 | 500 | 1.000 | 1.500 | 2.000 | 2.500 | 3.000 | 3.500 | 4.000 | 4.500 | 5.000 | 5.500 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| s/època | 1,0 | 1,6 | 3,2 | 4,4 | 5,0 | 5,1 | 5,4 | 5,0 | 5,0 | 4,9 | 4,8 | 4,7 |

- **Com evoluciona:** creix fins a *t* + 2.000, i després s'estabilitza al voltant de 5 s.
- **Per màquina, amb 4 branques alhora a cadascuna:**
  - al PC, amb Node 16, 4,5–4,9 s;
  - a la màquina virtual, amb Node 20, un pic de 9,4 s i després ~6,2 s.
- **Per branca viva:** 4,3 h amb *H* = 4.000, 5,6 h amb 5.000 i 7,0 h amb 6.000.
- **Per a la sèrie:**
  - el disseny (i) són ~655 h de càlcul;
  - el (ii), ~528 h.

**El canvi de règim,** només com a descripció.
- **Els 6 mons B:** la branca d'origen, amb corrent, no perd la vida a cap; la de canvi, sense corrent, la
  perd a 2.
- **A1046:** les dues branques continuen vives.
