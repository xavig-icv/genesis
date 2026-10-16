# Oracle extern: cubff

L'intèrpret BFF del projecte (`fase1/bff.js`) es comparava amb una versió de referència escrita per
nosaltres a partir de cubff, i l'auditor 1, que també és Claude, la va donar per bona. Un malentès
compartit sobre cubff no l'hauria detectat cap de les dues comprovacions (AU2-12 de l'auditoria externa 2).
Ara es compara amb el **codi original de cubff**, compilat i executat sense cap modificació.

## Com es fa

A la màquina virtual de laboratori (Debian 13, g++ 14), amb `git`, `build-essential` i `libbrotli-dev`:

```bash
git clone https://github.com/paradigms-of-intelligence/cubff.git
cd cubff
git checkout f212e849027c98fcf4b242eccfb5fed435223e23
make CUDA=0 LINK_FLAGS="-lbrotlienc -lbrotlicommon"
bash test.sh bff_noheads
cp ruta/a/claude-origins/eines/cubff/oracle.cc .
g++ -std=c++17 -O2 -fopenmp -xc++ oracle.cc -xnone build/common.o -lbrotlienc -lbrotlicommon -o oracle
node ruta/a/claude-origins/eines/cubff/compara.mjs ./oracle 50000
```

- **La compilació** necessita `LINK_FLAGS`, perquè la VM no té `pkg-config`.
- **`bash test.sh bff_noheads`** és la prova del mateix cubff: la compilació reprodueix les seves dades
  de prova.
- **`oracle.cc`** és nostre i només fa entrada i sortida. Inclou `bff.inc.h` tal com és i crida
  `Bff::Evaluate(tape, 8192)`, la mateixa funció que fa servir cubff per a cada parella de la sopa.

## Resultat (16-10-2026)

`compara.mjs` genera un corpus determinista de quatre tipus de cintes de 128 bytes:
- bytes a l'atzar;
- cintes amb un 80 % d'instruccions, que fan bucles i arriben sovint al límit de passos;
- programes reals de dos mons amb vida, amb soroll;
- parelles de cel·les veïnes d'aquests mons.

| Tipus | Cintes | Cinta final igual | Operacions iguals | A prop del límit de 8.192 passos |
|---|---|---|---|---|
| Aleatòries | 50.000 | 50.000 | 50.000 | 69 |
| Densitat alta d'instruccions | 50.000 | 50.000 | 50.000 | 6.361 |
| Programes de mons amb vida + soroll | 50.000 | 50.000 | 50.000 | 210 |
| Parelles de veïns de mons amb vida | 50.000 | 50.000 | 50.000 | 345 |

**Coincideixen les 200.000.** També coincideix la manera de comptar: el límit de 8.192 passos inclou els
bytes que no són instruccions, però el recompte d'operacions no els inclou.

`test/oracle-cubff.mjs` (dins de `npm test`) repeteix la comparació amb 10.000 d'aquestes cintes, a
partir dels resultats de cubff desats a `test/fixtures/cubff-oracle.bin`, i no necessita cubff.

## Dues diferències trobades llegint cubff

- **La taxa de mutació.** cubff fa servir 1/4.096 = 0,0244 % per byte i època. L'article diu "0,024 %",
  que és el valor que fa servir el projecte (`DEFAULT_MUTATION = 0.00024`): un 1,7 % menys. És el
  mateix valor a totes les sèries del projecte, i per tant no afecta cap comparació interna. Sí que cal
  tenir-ho en compte en comparar-nos amb l'article.
- **La prova d'autoreplicació de cubff (`CheckSelfRep`) és generacional:** 13 intents amb soroll i 4
  generacions més per a cada un. És el mateix principi que la prova de segona generació del cens v3
  (`docs/calibratge.md`).

## L'aparellament 2D i la mutació, comprovats llegint el codi del commit f212e84

Aquestes dues parts no es poden executar per separat a cubff. Les hem comparat línia per línia amb
`fase2/world.js` i `fase1/soup.js`:

| | cubff (`main.cc`, `common_language.h`, `make_2d_pattern.py`) | claude-origins |
|---|---|---|
| Veïns permesos | Quadrat de 5 × 5 sense la mateixa cel·la, sense donar la volta al mapa | Igual (`pairNeighbors`, radi 2) |
| Ordre | Totes les cel·les barrejades a l'atzar a cada època | Igual |
| Elecció del veí | Uniforme entre els veïns permesos (un hash de l'època i la cel·la) | Uniforme entre els permesos (rebuig dins del quadrat, amb el generador del món) |
| Cel·la o veí ja aparellats | No hi ha parella (la cel·la pot ser triada més tard per una altra) | Igual |
| Qui va primer a la cinta | La cel·la que tria | Igual |
| Mutació | Cada byte, amb probabilitat *p*, passa a ser un byte a l'atzar, abans d'executar | Igual (salts geomètrics, equivalents) |
| Cel·les sense parella | Muten, però no s'executen | Igual |

L'única diferència és d'on surt l'atzar: cubff fa servir un hash, i el projecte, el generador del món.
És el que fa que el món sigui reproduïble amb `--seed`, i no canvia la distribució.
