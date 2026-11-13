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

## El que surt (12-11-2026, exploratori)

**El càlcul:** el responsable el va llançar el 12-11-2026 a les 19.36 des d'una finestra seva, amb `llanca-2b.sh` (fora del repositori) i
`43289a3`; va acabar a les 23.41, els vuit trossos amb el codi 0 (`llanca-2b.log`). A totes 450 sopes, l'escaneig dona els tres recomptes
del manifest. Els registres, tal com surten, a git abans del resum (`aad89e9`; les SHA-256, a `recompte-sha256.txt`). El resum,
`recompte-sortida.txt` (`recompte-analisi.mjs --tots`).

**Dues coses que no deia la nota:** es va llançar mentre corria el pas 2a, que la seva nota preveia d'uns minuts i en va trigar quatre
hores i mitja (la nota deia «després del pas 2a»; cap dels dos no fa servir l'altre); i va trigar unes 4 h amb 8 processos, una mica més
del previst, perquè els va compartir amb el 2a.

**Les cel·les que es copien, per sopa (la mitjana dels 150 mons):**

| La sopa | L'escaneig (companys de soroll) | Es copien amb companys inerts (en alguna condició) | En totes 100 | Hereditàries amb companys inerts |
|---|---|---|---|---|
| L'envellida, tal com és | 22,69 | 0,07 (11 en total) | 0,02 | 0 |
| La nova | 117,85 | 5,90 | 4,29 | 0 |
| La barrejada (els mateixos bytes de l'envellida) | 706,01 | 111,07 | 75,83 | 0,07 (11 en total) |

- **La majoria dels positius de l'escaneig eren de la prova:** el 99,7 % a la sopa envellida, el 95 % a la nova i el 84 % a la barrejada.
  De les hereditàries de l'escaneig, amb companys inerts només ho són 5 de 1.025 a la barrejada, i cap de 62 a la nova.
- **L'ordre es manté, a tots 150 mons:** la barrejada en té més que la nova, i la nova més que l'envellida (150 de 150 a totes dues
  comparacions).
- **El criteri de la nota:** «si amb companys inerts l'ordre es manté, A2 i el contrapunt se sostenen, amb un recompte net». Se sostenen, i
  amb més força: amb companys inerts, la sopa envellida té unes 80 vegades menys cel·les que es copien que una de nova, i els seus bytes,
  barrejats, unes 19 vegades més.
- **Coincideix amb B1** (la §13; l'entrada 17): amb la composició de les sopes envellides, uns 6·10⁻⁷ programes per programa es copien sols
  i són hereditaris, uns 0,08 per sopa de 131.072; a les sopes barrejades n'hi ha 0,07.

**Els límits:** és un recompte en un moment, no un ritme (AUD-184); «es copia» vol dir una còpia del programa al company en alguna de les
100 condicions, no un replicador hereditari; i és exploratori, amb les sopes d'una sèrie ja decidida.

## Correccions de l'auditoria 31 (13-11-2026)

Els dos auditors van refer el resum des dels registres, i l'auditor 1, un món sencer (el 6095): tot quadra. La lectura, en canvi, deia més
del que mostren les dades. El que hi ha a dalt es queda tal com era.

- **Només s'hi tornen a provar els positius de l'escaneig** (AUD-189 = AU2-153). Les altres 58.855.417 cel·les de les 450 sopes no s'han
  provat amb companys inerts, i l'escaneig, amb els sis intents de la prova del cens, es deixa replicadors de debò, sobretot els fràgils.
  - **A les sopes envellides,** l'auditor 1 va provar totes les cel·les de 16 sopes en una condició de companys inerts. Fora de l'escaneig,
    3 s'hi copien, i 2 en són hereditàries (als mons 6090 i 6095, en 2 condicions de 100, totes dues amb el programa segon). Entre els
    positius de l'escaneig d'aquestes 16 sopes, se'n copien 2, i cap no és hereditari. Hem tornat a provar les dues cel·les: és així.
  - **A les barrejades,** unes 4 de cada 100 cel·les que es copien queden fora de l'escaneig (els mons 6095 i 6001).
  - **Què vol dir:** les xifres de la taula són dels positius de l'escaneig, i en són cotes inferiors. L'ordre de les tres sopes no en
    depèn, però els factors sí. A la sopa envellida, l'escaneig se'n deixa, en proporció, més que a les altres: les «80 vegades menys» que
    la nova podrien ser menys. Les hereditàries no es poden comparar entre les sopes.
- **«Cap sopa no té replicadors fets» no se sosté** (AU2-154; l'entrada 18 ho deia). A 11 sopes barrejades, una cel·la és hereditària amb
  companys inerts, i a dues (els mons 6071 i 6186), en totes 100 condicions. Ha de dir: *a les 150 sopes envellides i a les 150 noves no hem
  trobat cap hereditari amb companys inerts entre els positius tornats a provar; a 11 sopes barrejades, sí. Els recomptes depenen de
  l'escaneig, i no permeten dir que cap altra cel·la no ho sigui.* Als 11 mons, la sopa barrejada s'estableix a 7 de 22 branques, i als
  altres 139, a 75 de 278 (l'auditor 1): no s'hi veu cap efecte, amb poca potència.
- **«Es copia» no és «hereditari»** (AUD-186). La xifra principal de la prova d'autonomia de B1 és si el programa és **hereditari** amb
  companys inerts (es copia, i la còpia també es copia), no si es copia. Ho dèiem malament a «El que s'ha provat» (la primera prova curta),
  i el comentari d'`anyOf` a `recompte.mjs` diu el mateix. L'script es queda tal com va córrer (el de `43289a3`); la correcció és aquí.
  - **La comparació amb B1,** doncs, s'ha de fer amb les hereditàries de l'escaneig que també ho són amb companys inerts: 5 de 1.025, 0,033
    per sopa barrejada (de 0,011 a 0,078). B1 en dona unes 0,06 (de 0,03 a 0,11) amb els programes i els companys de les sopes del pilot
    (4,55·10⁻⁷ per programa, la §13). Coincideixen, però amb 5, no amb 11.
- **Que no es copiïn amb companys inerts** (AU2-153) vol dir que necessiten el company, el seu codi o els seus bytes. No prova que la còpia
  la fes el codi del company.
- **El codi de `llanca-2b.log`** (ho vam trobar nosaltres, en verificar l'auditoria 31). `llanca-2b.sh`, fora del repositori, escrivia el
  codi de cada tros en una línia que començava amb un `$(ts)`, i aquesta ordre posa `$?` a 0: els «codi 0» del registre no diuen res, i la
  guarda del final no hauria vist cap error. El que sí que es va comprovar és que els vuit registres són sencers: la línia d'inici i la final,
  les 450 sopes, i l'escaneig igual al manifest a totes (també ho van comprovar els dos auditors). I els `.err` només hi tenen el temps de
  cada sopa. Les eines del repositori desen el codi just després de l'ordre (`codi=$?`).

## Les sortides

- **`recompte-I-J.jsonl`,** un per procés (els mons del I al J del manifest): una línia per sopa, amb el món, el braç, la SHA-256 de la
  captura, els recomptes de l'escaneig, comprovats, i cada positiu (la cel·la, el que en deia l'escaneig i, de les 100 condicions, en
  quantes es copia i en quantes és hereditari).
- **`recompte-sortida.txt`:** el resum, de `recompte-analisi.mjs`, tal com surt.
