# Calibratge del cens v3

El cens v3 és la mesura principal de la sèrie confirmatòria. Abans de fer-la servir cal
saber què detecta i què no. Aquest document recull les proves de calibratge de la iteració 3. Responen a
AU2-01 i AU2-02 de l'auditoria externa 2 i a AUD-33 i AUD-34 de l'auditoria 2. El codi és a
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

**Criteri d'establiment.** Almenys l'1 % de la mostra són replicadors hereditaris en dos censos seguits.
És a `census.js` (`establishment`), i el fan servir tant `sim.mjs` com `fase2/estadistica.mjs`.

## 2. La bateria de calibratge (proves automàtiques)

| Cas | Què s'espera | Resultat |
|---|---|---|
| El replicador de la Fase 1, el palíndrom espaiat del punt i el successor immune, plantats en un món aleatori | Hereditaris | Més del 70 % de les còpies plantades ho són a cada cas |
| **Copiador parcial** sintètic: 24 bytes de dades diferents i un bucle que les copia al company, però no copia el bucle | Es copia, però **no** és hereditari | Primera generació en 586 de 586 casos; hereditari en **cap** |
| L'enverinador de l'auditoria 1 (escriu zeros al company) | Ni es copia ni és hereditari | 0 hereditaris |
| Un món aleatori | Cap hereditari | 0 de 2.048 |
| El replicador que necessita parella (retall de 32 × 32 de l'esclat, `test/fixtures/esclat-32x32.bin`) | Hereditari en context, mai sol | Només en context; alguns hereditaris |

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

| Captura | Es repliquen | Hereditaris | Territori → hereditaris dins | Hereditaris fora |
|---|---|---|---|---|
| Esclat del replicador que necessita parella (corrent 0,01, llavor 1, 12.000) | 0,9 % (en context) | **0,3 %** | 3,95 % → 10,6 % | 0,0 % |
| El mateix món al final (13.000) | 0,0 % | 0,0 % | — | 0,0 % |
| Sopa, llavor 3, al pic (8.950) | 30,9 % | 23,4 % | 66,4 % → 38,4 % | 0,0 % |
| Sopa, llavor 3, després de l'extinció | 0,0 % | 0,0 % | — | 0,0 % |
| Sopa, llavor 1 amb 7 fils, replicador vell (250) | 33,7 % | 24,0 % | 72,7 % → 33,6 % | 0,0 % |
| La mateixa sopa, enverinada (500) | 8,8 % | **4,3 %** | 34,0 % → 10,2 % | 0,0 % |
| La mateixa sopa, successor immune (750) | 92,2 % | **89,2 %** | 95,4 % → 94,8 % | 0,4 % |
| Sopa, llavor 1 (16.000) | 8,6 % | 7,7 % | 68,6 % → 11,6 % | 0,0 % |
| Corrent 1, llavor 1, final | 34,0 % | 33,5 % | 81,2 % → 42,0 % | 7,4 % |
| Corrent 1, llavor 3, final (successió) | 97,9 % | 95,3 % | 4 famílies → 89–100 % | 86,2 % |
| Corrent 0,001, llavor 1, final | 94,4 % | 93,6 % | 96,9 % → 97,0 % | 1,2 % |
| Corrent 0,01, llavor 2, final (palíndrom del punt) | 86,0 % | 85,7 % | 2 famílies → 99,4–99,8 % | 0,0 % |

Cada cens triga entre 1,9 i 3,5 s en un món de 131.072 cel·les. En un món sense vida, 250 èpoques duren
uns 60 s, de manera que el cens hi afegeix un 4 % del temps de simulació.

## 4. El que se n'aprèn

1. **El territori d'una família no mesura quants replicadors hi ha (AU2-01).** Quan domina un replicador
   que es copia bé, el territori i els hereditaris coincideixen (97 % i 99 %). En canvi, es desvien:
   - a les sopes enverinades i en decadència, només una part del territori es replica (el 10–40 %),
     perquè hi queden còpies espatllades que encara porten el nucli de la família;
   - al món amb corrent 1 i llavor 3, el 86 % de les cel·les de fora del territori també són
     hereditàries.

   Per això el criteri principal és funcional.
2. **L'herència separa la còpia sana de la còpia espatllada, i encaixa amb l'entrada 2.** A les sopes
   enverinades, molts dels que es copien no deixen una còpia que es torni a copiar: el verí trunca les
   còpies. A la sopa enverinada de l'època 500, s'hi copia el 8,8 %, però només el 4,3 % és hereditari.
   Al successor immune, que converteix els zeros en 255, són hereditaris gairebé tots (89,2 de 92,2 %).
   La prova d'herència mesura, sense cap ajust, el fenomen que havíem descobert amb experiments
   dirigits.
3. **L'esclat del replicador que necessita parella no compleix el criteri.** Només el 0,3 % de la mostra
   és hereditari i el 0,9 % es copia, de manera que no arriba a l'1 % en cap dels dos casos. Encaixa amb
   el que va passar: es va col·lapsar en menys de 1.000 èpoques.
4. **Sensibilitat.** Per a un replicador que només té èxit en un 18 % dels intents, la probabilitat de
   detectar-lo és més baixa:
   - en primera generació, i en context, és 1 − 0,82⁴ ≈ 0,55;
   - en segona generació, el fill (un 13,5 % d'èxit per intent) s'ha de detectar també:
     0,55 × (1 − 0,865⁴) ≈ 0,24.

   El cens infraestima aquests replicadors respecte dels que es copien sols, que tenen èxit gairebé
   sempre. L'efecte és el mateix a les dues condicions de la sèrie confirmatòria. Afavoreix, però, els
   replicadors eficients, i s'haurà de tenir en compte en interpretar les èpoques d'establiment.

## 5. Replicadors esporàdics (AUD-34)

L'auditor 1 va trobar replicadors "esporàdics" (una cel·la d'una mostra de 512) en tots els 24 mons de
la sèrie exploratòria abans de cap establiment, i va proposar que el coll d'ampolla és l'establiment, no
l'origen. Com que la simulació és determinista, hem regenerat tres d'aquests mons fins a l'època 1.500
amb el cens v3:
- món quiet, llavors 14 i 15;
- corrent 0,01, llavor 7.

Hem comprovat que les històries són les mateixes: H0 i l'HOE són idèntics als registres originals.

| Món | Esporàdics al cens v2 (mostra de 512) | Cens v3 (2.048 per cens): es copien / hereditaris |
|---|---|---|
| Quiet, llavor 15 | 0,2 % a la 250 i 0,4 % a la 1.250 | 0–0,1 % / **0** a tots els censos |
| Quiet, llavor 14 | 0,2 % a la 500 i a la 1.500 | 0 % / **0** |
| Corrent 0,01, llavor 7 | 0,2 % a la 750 | 0 % / **0** |

En 18 censos i 36.864 cel·les provades no hi ha cap replicador hereditari. Els esporàdics d'aquestes
èpoques primerenques són **copiadors no hereditaris, i molt escassos** (≲ 0,05 % del món). Cal veure
què passa més a prop de l'establiment: §6.

## 6. Abans de l'establiment

*(Pendent: s'estan regenerant el món quiet de la llavor 9, amb establiment a l'època 7.750, i el de
corrent 0,01 de la llavor 11, amb establiment a la 6.750.)*
