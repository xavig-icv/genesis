# La maduració, pas 2b: les cel·les que es repliquen, tornades a comptar amb companys inerts (exploratori)

**Escrit el 12-11-2026, abans de calcular res.** És el carril d'explorar (`docs/disseny.md`, 11-11-2026), i el primer que falta a la matriu
de novetat (`docs/novetat-maduracio.md`).

## La pregunta

L'escaneig de totes les cel·les del pas 1 (P5) dona, de mitjana per sopa:

| La sopa | Es repliquen | Hereditàries |
|---|---|---|
| La nova | 118 | 0,41 |
| L'envellida, tal com és | 23 | 0 |
| L'envellida, barrejada (els mateixos bytes, en un altre ordre) | 706 | 6,8 |

D'aquí surten A2 (la sopa envellida té menys programes que es copien que una de nova) i el contrapunt de la «màquina d'escriure
esbiaixada» d'Adami i LaBar (2017): la barrejada, amb la composició que la sopa s'ha fet ella mateixa, en té sis vegades més que la nova.

Però l'escaneig fa servir la prova del cens, amb companys de soroll, i el codi del company també s'executa (AUD-175). Al món 1034, les
hereditàries soles eren falsos positius (0 de 200 proves noves), i els 37 hereditaris de bytes uniformes de B1 no es copien sols (la prova
d'autonomia, l'entrada 15). **Quantes de les cel·les que es repliquen de cada sopa es copien sense el codi del company?**

## Les dades

- **Les sopes:** les 150 incloses de la sèrie de la maduració, cadascuna amb els tres braços: `continue` (la sopa envellida, a l'època
  8.000), `shuffle-all` (la barrejada) i `reinit` (la nova). En total, 450 sopes.
- **Les captures:** les de la sèrie (`fase2/resultats/maduracio/serie/alicuotes/`, a la còpia que les té), comprovades amb la SHA-256 del
  manifest.
- **Res de les branques:** només les sopes de partida. La sèrie és decidida des del 04-11-2026.
- **Cap simulació.**

## El mètode

1. **L'escaneig, de nou,** amb el mateix codi i la mateixa llavor que el de la preparació: la llavor del món més 600.000, l'amplada 512 i el
   radi 2 (`scanCells`, a `eines/transforma.mjs`). Aquesta vegada desa quines cel·les donen positiu.
   - **El control de punta a punta:** els tres recomptes de cada sopa (es repliquen, hereditàries i hereditàries soles) han de ser els del
     manifest. Si no, l'script s'atura.
2. **Cada positiu, tornat a provar amb companys inerts:** la prova d'autonomia de B1 (`conditions` i `testReplicator`, a
   `eines/autonomia.mjs`), amb la química de sempre (C0), 100 condicions i la llavor **3000000000**.
   - **La llavor** no és de cap pla: la de B1 és 20261101, la de la seva prova d'autonomia, 250000000, i les de la sèrie, les dels mons
     (més 600.000). Les condicions en fan servir de la 3000000000 a la 3000000199.
   - **Els companys,** tots inerts: el programa i 8 companys sense cap instrucció, i el company del paper sol, també inert. Si s'hi copia,
     es copia ell sol.
3. **Què es compta,** per a cada braç: els positius de l'escaneig, com al manifest; i, d'aquests, quants es copien amb companys inerts
   (`solo` o `context`) i quants són hereditaris (`heritableSolo` o `heritableContext`), en almenys una de les 100 condicions, en 95 o
   més, i en totes. Són les classes de la prova d'autonomia de B1.
4. **La comparació, món a món,** com al pas 1: l'envellida contra la nova, i la barrejada contra la nova, amb els recomptes nets.

## La prova curta, abans del càlcul llarg

Un món sencer (els tres braços), i els seus recomptes, comparats amb els del manifest. La sortida, tal com surt, a
`recompte-prova-sortida.txt`, abans de llançar la resta.

## El pressupost

- **L'escaneig:** uns 95 s per sopa; per a 450 sopes, unes 12 h de CPU.
- **Els positius:** uns 850 per món, uns 127.000 en total; uns 86 ms cadascun, amb 100 condicions: unes 3 h de CPU.
- **En total,** unes 15 h de CPU: unes 2 h amb 8 processos. Quan acabi el càlcul de B1, i després del pas 2a. Molt per sota dels dos dies.

## Què em faria canviar d'opinió

- **Si amb companys inerts l'ordre es manté** (la barrejada per sobre de la nova, i la nova per sobre de l'envellida, en cel·les que es
  copien soles): A2 i el contrapunt se sostenen, amb un recompte net.
- **Si totes tres cauen a gairebé zero:** els positius eren de la prova. A2, tal com és, no se sosté, i el contrapunt s'haurà de mesurar
  d'una altra manera.
- **Si l'envellida en té tantes o més que la nova:** A2 cau, i la maduració podria actuar també sobre l'aparició (A7).

## El que s'ha provat (12-11-2026)

- **La primera prova curta** (el món 6001, el primer del manifest, amb `7ee8160`): l'escaneig hi reprodueix els tres recomptes del
  manifest a totes tres sopes. Però l'script encara no desava, per a cada condició, si el programa es copia sol **o** en context, que és
  la xifra principal de la prova d'autonomia de B1. **Queda substituïda** per la segona, i no se n'ha fet cap resum. Els fitxers, tal com
  van sortir: `recompte-prova-7ee8160-0-1.jsonl` i `.err`.
- **La segona prova curta** (el mateix món, amb `83d82c3`, que desa aquest recompte i té el resum): l'escaneig hi torna a reproduir el
  manifest. Els fitxers, tal com surten: `recompte-prova-0-1.jsonl`, `.err` i el resum, `recompte-prova-sortida.txt`.
  - **És un sol món:** no en traiem cap resultat. Serveix per veure que el càlcul funciona de punta a punta.
  - **El temps,** amb el càlcul de B1 en marxa: 148 s, 322 s i 179 s per sopa. Sense B1, menys. Per a les 450 sopes, unes 20 h de CPU com
    a molt: unes 2,5 h amb 8 processos.

## Les sortides

- **`recompte-I-J.jsonl`,** un per procés (els mons del I al J del manifest): una línia per sopa, amb el món, el braç, la SHA-256 de la
  captura, els recomptes de l'escaneig, comprovats, i cada positiu (la cel·la, el que en deia l'escaneig i, de les 100 condicions, en
  quantes es copia i en quantes és hereditari).
- **`recompte-sortida.txt`:** el resum, de `recompte-analisi.mjs`, tal com surt.
