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
