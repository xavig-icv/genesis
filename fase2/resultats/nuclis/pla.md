# Els trossos informatius del registre de famílies · el pla de la sensibilitat

**Escrit el 03-11-2026, abans de calcular res,** a la branca `nuclis-monotons`. És exploratori: no hi ha cap regla de decisió
preregistrada, i cap resultat no canvia cap sèrie tancada (AUD-162 i AU2-134; la síntesi de la revisió del lloc).

## La pregunta

El registre de famílies (`fase2/families.js`) agrupa els replicadors pels trossos de 5 instruccions que comparteixen, i en pinta
el territori amb els seus trossos de 6 més comuns (el nucli). Un tros com `[[[[[[` no identifica res: molts programes tenen
tirades d'una instrucció entre les dades. Al món 1006 del lloc, una «família 2» de nucli `[[[[[[` pinta el 17 % del món durant
dos fotogrames (AUD-162).

Amb l'opció nova `minDistinct`, el registre només fa servir els trossos amb almenys tantes instruccions diferents. La proposta és
3: en trossos de 5 i de 6, és el mateix que demanar més d'1 bit d'entropia (auditor 1). L'auditor 2 proposava treure només els
d'un sol símbol, que és el 2. **Quant canvien les famílies i el territori amb 2 i amb 3?**

## Les dades

1. **Les 183 captures de `docs/captures.sha256`,** comprovades abans amb la seva SHA-256:
   - 171 del banc de mons amb vida de la sèrie de la llei 2 (72 d'A i 99 de B);
   - 6 sopes de la Fase 1;
   - 6 mons de la Fase 2.

   Cadascuna, amb un registre nou.
2. **La història dels tres mons del lloc web:** el 1006, el 2041 i el 1034, amb 120, 135 i 160 fotogrames. Les captures són les de
   les seves simulacions, comprovades amb les SHA-256 de `mon.json`. Un sol registre per a cada valor, en ordre, com
   `eines/web-dades.mjs`.

Res de la sèrie de la maduració: l'eina s'hi nega.

## El càlcul

`node eines/nuclis-sensibilitat.mjs clau` i `mon`, des d'un commit net de la branca, amb `minDistinct` 1 (el d'ara), 2 i 3, la
llavor del registre per defecte (20261014) i el mostreig v3. Per a cada captura i valor:
- les famílies: el primer tros del nucli, quantes instruccions diferents té, i el territori;
- les cel·les amb color, les que en perden i les que en guanyen respecte de l'1;
- les cel·les amb una tirada d'una sola instrucció (6 iguals al codi compacte), i quantes tenen color;
- cada família de l'1, aparellada amb la d'aquest valor amb què comparteix més cel·les (el Jaccard de les cel·les).

L'opció no toca el generador aleatori: amb els tres valors, la mostra i els replicadors són els mateixos. Si la fracció de
replicadors de la mostra canvia, l'eina s'atura.

## El que mirarem, i què en farem

1. **Al 1006, de l'època 2.650 a la 2.850:**
   - amb 3, si alguna família pinta les cel·les amb una tirada;
   - si la família 1 canvia poc, és a dir, si té un Jaccard alt amb la de l'1.
2. **A totes les captures:**
   - quantes canvien el territori (les cel·les amb color) més d'un 1 % del món, amb 2 i amb 3;
   - quines famílies hi desapareixen o hi apareixen.
3. **Els nuclis de l'1:** quants tenen menys de 3 instruccions diferents.

**Què en farem:**
- **Si amb 3 la família falsa del 1006 desapareix, i la resta canvia poc:** el lloc farà servir `minDistinct` 3 quan se'n refacin
  les dades, després de la sèrie de la maduració i del nivell 1 de B1, i `mon.json` ho dirà.
- **Si canvia molt més del que esperem:** ho direm a la revisió, i no es farà servir fins que no ho entenguem.

**Les sèries:** el cens i les sèries no canvien en cap cas, perquè el valor per defecte és 1. Una sèrie nova només el canviaria si
ho digués el seu protocol abans de començar.

**El que no es pot mirar:** l'auditor 1 va trobar famílies de debò amb un nucli monòton a la prova dels zeros (`B2002-zeros-data-b`
i `B2021-zeros-inert-c`). Els seus registres només en tenen els censos, i no les captures: no sabrem si amb 3 continuen sent
famílies, amb un altre nucli.

## On

Els resultats, en aquesta carpeta:
- `clau.json` i `clau.csv`;
- `1006`, `2041` i `1034`, cadascun en `.json` i `.csv`, amb el commit i la SHA-256 del registre.

Un `README.md` amb el resum, escrit després de calcular.
