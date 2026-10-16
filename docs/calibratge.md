# Calibratge del cens v3

El cens v3 és la mesura principal de la sèrie confirmatòria. Abans de fer-la servir cal
saber què detecta i què no. Aquest document recull les proves de calibratge de la iteració 3. Responen a
AU2-01 i AU2-02 de l'auditoria externa 2, a AUD-33 i AUD-34 de l'auditoria 2 i, després de l'auditoria 3, a
AUD-42 i AU2-15. El codi és a
`fase2/replication.js` i `fase2/census.js`, i les proves automàtiques, a `fase2/test-world.mjs` i
`test/determinisme.mjs`.

## 1. Què mesura

**Mostra.** A cada cens es posen a prova 2.048 cel·les **diferents** del món, triades a l'atzar amb un
generador propi del cens. Si el món és més petit, totes.

**Primera generació.** La prova de replicació de sempre. El programa es replica si deixa al company 16
bytes seguits de si mateix, o del seu mirall, amb almenys 6 valors diferents. Es prova:
- **sol:** primer, amb un company de soroll (2 intents);
- **en context:** segon, amb un veí que encara no porta cap tros seu (4 intents).

**Segona generació (herència).** Cada vegada que el programa es replica, el company tal com ha quedat (el
"fill") es posa a prova en el mateix paper i amb els mateixos intents. Si el company del fill (el "nét")
acaba portant alguna finestra del programa original, és un **replicador hereditari**.
- **Els intents de la primera generació continuen** fins que l'herència queda demostrada, dins del mateix
  pressupost. Abans s'aturaven al primer fill encara que no fos hereditari (AU2-15).
- **El cens registra per separat** l'herència demostrada sola (`heritableSolo`) i la demostrada només en
  context (`heritableContext`).

**Criteri d'establiment.** Almenys l'1 % de la mostra són replicadors hereditaris en dos censos seguits.
És a `census.js` (`establishment`), i el fan servir tant `sim.mjs` com `fase2/estadistica.mjs`.

## 2. La bateria de calibratge (proves automàtiques)

| Cas | Què s'espera | Resultat |
|---|---|---|
| El replicador de la Fase 1, el palíndrom espaiat del punt i el successor immune, plantats en un món aleatori | Hereditaris | Més del 70 % de les còpies plantades ho són a cada cas |
| **Copiador parcial** sintètic: 24 bytes de dades diferents i un bucle que les copia al company, però no copia el bucle | Es copia, però **no** és hereditari | Primera generació en 586 de 586 casos; hereditari en **cap** |
| El copiador parcial **envoltat de replicadors reals** (plantat a cada cel·la dels dos retalls de `test/fixtures`), perquè en context el company va primer i també executa codi | No és hereditari | 0 de 1.026 proves a cada retall; ni tan sols passa la primera generació en context |
| L'enverinador de l'auditoria 1 (escriu zeros al company) | Ni es copia ni és hereditari | 0 hereditaris |
| Un món aleatori | Cap hereditari | 0 de 2.048 |
| El replicador que necessita parella (retall de 32 × 32 de l'esclat, `test/fixtures/esclat-32x32.bin`) | Hereditari en context, mai sol | Només en context; alguns hereditaris. La cel·la 660, que el primer fill no demostrava, ara sí (AU2-15) |
| **Món de "lectors"** (AUD-42): programes que, quan van primers, copien el company dins seu, amb blocs de dades sense cap instrucció entremig | Els blocs no són replicadors. **Limitació coneguda:** la prova en context no ho pot saber, perquè la còpia la fa el company | Els blocs surten hereditaris, però **només en context** (`heritableContext`), mai sols. Per això la sensibilitat 3 del protocol és l'herència sola, i hi ha una regla d'interpretació |

**El replicador que necessita parella** va obligar a ajustar la prova. Al principi, la segona generació
tenia 2 intents també en context, i aquest replicador gairebé no hi passava. Diagnòstic sobre 40 casos de
l'esclat:
- el fill és sovint una còpia parcial: una mediana de 30 bytes iguals de 64;
- però es copia gairebé tan sovint com el pare (un 13,5 % d'èxit per intent, contra el 18 %).

Era hereditari; el que el feia perdre era el nombre d'intents. Ara la segona generació té els mateixos
intents que la primera en cada paper.

## 3. Les 12 captures clau

`node fase2/calibratge.mjs 2048` (cal restaurar abans les captures amb
`bash arxiva-captures.sh --restaura`). Per a cada família, es posen a prova 500 cel·les del seu territori i
500 de fora.

Les xifres són de la v3 corregida (AU2-15). Amb la primera versió, que s'aturava al primer fill, els
hereditaris eren una mica menys (per exemple, el 0,3 % a l'esclat i el 4,3 % a la sopa enverinada); són a
l'historial de git.

| Captura | Es repliquen | Hereditaris | Territori → hereditaris dins | Hereditaris fora |
|---|---|---|---|---|
| Esclat del replicador que necessita parella (corrent 0,01, llavor 1, 12.000) | 1,1 % (en context 1,0 %) | **0,6 %** | 3,95 % → 11,6 % | 0,0 % |
| El mateix món al final (13.000) | 0,0 % | 0,0 % | — | 0,0 % |
| Sopa, llavor 3, al pic (8.950) | 31,1 % | 25,5 % | 66,4 % → 41,2 % | 0,0 % |
| Sopa, llavor 3, després de l'extinció | 0,0 % | 0,0 % | — | 0,0 % |
| Sopa, llavor 1 amb 7 fils, replicador vell (250) | 33,5 % | 26,2 % | 72,7 % → 35,6 % | 0,0 % |
| La mateixa sopa, enverinada (500) | 8,8 % | **4,9 %** | 34,0 % → 11,8 % | 0,0 % |
| La mateixa sopa, successor immune (750) | 92,2 % | **89,5 %** | 95,4 % → 95,0 % | 0,4 % |
| Sopa, llavor 1 (16.000) | 8,9 % | 7,7 % | 68,6 % → 11,6 % | 0,0 % |
| Corrent 1, llavor 1, final | 33,9 % | 33,5 % | 81,2 % → 40,0 % | 7,4 % |
| Corrent 1, llavor 3, final (successió) | 97,9 % | 97,3 % | 4 famílies → 97–100 % | 87,6 % |
| Corrent 0,001, llavor 1, final | 94,5 % | 94,3 % | 96,9 % → 97,8 % | 1,4 % |
| Corrent 0,01, llavor 2, final (palíndrom del punt) | 86,0 % | 85,7 % | 2 famílies → 99,4–99,8 % | 0,0 % |

Cada cens triga entre 1,9 i 3,5 s en un món de 131.072 cel·les. En un món sense vida, 250 èpoques duren
uns 60 s, de manera que el cens hi afegeix un 4 % del temps de simulació.

## 4. El que se n'aprèn

1. **El territori d'una família no mesura quants replicadors hi ha (AU2-01).** Quan domina un replicador
   que es copia bé, el territori i els hereditaris coincideixen (97 % i 99 %). En canvi, es desvien:
   - a les sopes enverinades i en decadència, només una part del territori es replica (el 12–41 %),
     perquè hi queden còpies espatllades que encara porten el nucli de la família;
   - al món amb corrent 1 i llavor 3, el 88 % de les cel·les de fora del territori també són
     hereditàries.

   Per això el criteri principal és funcional.
2. **L'herència separa la còpia sana de la còpia espatllada, i encaixa amb l'entrada 2.** A les sopes
   enverinades, molts dels que es copien no deixen una còpia que es torni a copiar: el verí trunca les
   còpies. A la sopa enverinada de l'època 500, s'hi copia el 8,8 %, però només el 4,9 % és hereditari.
   Al successor immune, que converteix els zeros en 255, són hereditaris gairebé tots (89,5 de 92,2 %).
   La prova d'herència mesura, sense cap ajust, el fenomen que havíem descobert amb experiments
   dirigits.
3. **L'esclat del replicador que necessita parella no compleix el criteri.** Només el 0,6 % de la mostra
   és hereditari, i no arriba a l'1 %. Encaixa amb el que va passar: es va col·lapsar en menys de 1.000
   èpoques.
4. **Sensibilitat.** Per a un replicador que només té èxit en un 18 % dels intents, la probabilitat de
   detectar-lo és més baixa:
   - en primera generació, i en context, és 1 − 0,82⁴ ≈ 0,55;
   - en segona generació, el fill (un 13,5 % d'èxit per intent) s'ha de detectar també:
     0,55 × (1 − 0,865⁴) ≈ 0,24.

   El cens infraestima aquests replicadors respecte dels que es copien sols, que tenen èxit gairebé
   sempre, i això afavoreix els replicadors eficients.

   **Sobre les dues condicions (AUD-45).** Per a un mateix tipus de replicador, l'efecte és el mateix a
   les dues. Però no se sap si ho és per a la sèrie:
   - les condicions poden produir tipus diferents de replicadors;
   - la barreja pot canviar la sensibilitat de la prova en context (AUD-33c: 1,10 % amb veïns contra
     0,33 % amb companys de tot el mapa).

   És una hipòtesi, que es podrà examinar amb `heritableSolo` i `heritableContext`.
5. **La prova en context té un fals positiu conegut (AUD-42).** En un món de "lectors", que copien el
   company dins seu, un bloc sense instruccions surt hereditari. Aquí només surt així en context, i a les
   12 captures el context només pesa a l'esclat: hi ha un 0,6 % d'hereditaris, tots en context.

## 5. Replicadors esporàdics (AUD-34)

L'auditor 1 va trobar replicadors "esporàdics" (una cel·la d'una mostra de 512) en tots els 24 mons de
la sèrie exploratòria abans de cap establiment, i va proposar que el coll d'ampolla és l'establiment, no
l'origen. Com que la simulació és determinista, hem regenerat tres d'aquests mons fins a l'època 1.500
amb el cens v3 corregit (AU2-15):
- món quiet, llavors 14 i 15;
- corrent 0,01, llavor 7.

Hem comprovat que les històries són les mateixes: H0 i l'HOE són idèntics als registres originals.

| Món | Esporàdics al cens v2 (mostra de 512) | Cens v3 (2.048 per cens): es copien / hereditaris |
|---|---|---|
| Quiet, llavor 15 | 0,2 % a la 250 i 0,4 % a la 1.250 | 0–2 de 2.048 / **0** a tots els censos |
| Quiet, llavor 14 | 0,2 % a la 500 i a la 1.500 | 0 de 2.048 / **0** a tots els censos |
| Corrent 0,01, llavor 7 | 0,2 % a la 750 | 0–1 de 2.048 / **0** a tots els censos |

En 18 censos i 36.864 cel·les provades hi ha 0 replicadors hereditaris. Els esporàdics d'aquestes
èpoques primerenques són **copiadors no hereditaris, i molt escassos** (≲ 0,05 % del món).

## 6. Abans de l'establiment

Dos mons de la sèrie exploratòria, regenerats amb el cens v3 corregit fins a l'establiment:
- el món quiet de la llavor 9, que a l'exploració es va establir a la 7.750 pel criteri de família;
- el món amb corrent 0,01 de la llavor 11, establert a la 6.750.

| Món | Últim cens sense hereditaris | Primer cens amb hereditaris | Cens següent | Establiment (v3) | Criteri de família (v0.1) |
|---|---|---|---|---|---|
| Quiet, llavor 9 | 7.500 | 7.750: 20 de 2.048 (0,98 %; es copien 33) | 8.000: 97 (4,74 %; es copien 145) | 8.000 | 7.750 |
| Corrent 0,01, llavor 11 | 6.500 | 6.750: 33 de 2.048 (1,61 %; es copien 37) | 7.000: 136 (6,64 %; es copien 202) | 6.750 | 6.750 |

En tots els censos anteriors, de cada 2.048 cel·les se'n copien com a molt 2, i cap no és hereditària.
El primer replicador hereditari es detecta en el mateix interval de cens en què la vida s'enlaira. A la
llavor 9, el primer cens amb hereditaris (20 de 2.048) queda just per sota de l'1 % (21), i per això
l'establiment és al cens següent.

**L'auditor 1 ho va confirmar amb més resolució** (auditoria 3, §5):
- **Un cens de totes les cel·les,** no només d'una mostra, a les captures de les èpoques 5.500–6.500
  (corrent, llavor 11) i 6.500–7.500 (quiet, llavor 9). Hi havia entre 20 i 64 copiadors, i **cap
  hereditari**, tret de la llavor 9 a l'època 7.500. Allà hi havia una colònia de 27 hereditaris (el
  0,021 % del món) en una zona de 15 × 18 cel·les. Una mostra de 2.048 només l'hauria vista amb una
  probabilitat del 34 %.
- **Vuit repeticions de cada món,** amb atzar nou:
  - des de l'època 6.500 de la llavor 11, sense cap hereditari al món, cap repetició no s'estableix en
    1.000 èpoques;
  - des de l'època 7.500 de la llavor 9, amb la colònia, s'estableixen les 8.

**Lectura.** Les dades contradiuen la hipòtesi d'AUD-34, i l'auditor 1 la va retirar:

1. **Els copiadors no hereditaris són freqüents però escassos.**
2. **El pas rar és que aparegui un replicador hereditari.** L'auditor 1 estima la taxa per sota de ~4 ×
   10⁻⁴ per època.
3. **Quan apareix, s'estableix gairebé segur i de pressa,** en 250–500 èpoques.

Aquest patró és dels replicadors que es copien sols. El replicador que necessita parella té origen
sense establiment (l'esclat de l'entrada 4).

**Límit de la mesura.** Si un replicador hereditari ocupés una fracció *d* del món, una mostra de 2.048
cel·les el detectaria amb una probabilitat de 1 − (1 − *d*)^2048:
- un 64 % si *d* = 0,05 %;
- un 18 % si *d* = 0,01 %.

Per tant, "no detectat" no vol dir "absent": la colònia de 27 cel·les de la llavor 9 n'és l'exemple. Per
això la sèrie confirmatòria desa les captures de *t* − 500 i *t* − 250, en què un cens complet pot
mesurar l'origen abans de la detecció (protocol §6.7).
