# Protocol de B2 · quant dura la vida establerta

**Estat: esborrany v0.3 (19-10-2026).** No s'ha llançat cap branca d'aquesta sèrie.
- **D'on surt:** incorpora l'auditoria 9, la segona prova confirmatòria (X-020 a X-022) i les decisions del
  responsable (`docs/disseny.md`).
- **Les marques:** **[PILOT]** és un valor que es fixarà amb la prolongació pilot (`fase2/resultats/b2/pilot/`),
  i **[OBERT]**, una pregunta per a l'auditoria 10.
- **El procediment:**
  1. es revisa a l'auditoria 10, amb el programa de la sèrie i les seves proves;
  2. el *merge* de la versió aprovada farà de preregistre, amb l'etiqueta anotada `preregistre-b2` i un segell
     d'OpenTimestamps abans de la primera branca (§9);
  3. després, cap canvi no es fa sense justificar-lo aquí, amb data i motiu, abans de mirar cap resultat.

## 1. Les preguntes

**La principal, que només s'estima: quant dura la vida establerta en el seu món?**
- És la durada de la vida quan el món continua amb la mateixa condició en què es va establir: quiet, si era
  quiet, i amb corrent, si en tenia.
- Una vida que s'estableix i després es perd ha viscut un temps, i no s'exclou (decisió del responsable,
  auditoria 7).
- No hi ha cap llindar ni cap afirmació confirmatòria sobre la durada (AUD-83).

**Dues confirmatòries, amb la correcció de Holm (§6.4):**
1. **El canvi de règim: la vida dura menys quan el seu món canvia de condició?** El canvi és un món quiet que
   passa a tenir corrent, o un món amb corrent que passa a ser quiet.
   - **D'on ve:** a l'exploració, les branques que canvien de condició perden la vida en 5 de 29 mons, i les
     que la mantenen, en 1 de 29 (AUD-82). És una hipòtesi que surt de les dades, i per això es posa a prova
     amb mons nous.
   - **La decisió:** la va prendre el responsable el 19-10-2026, després de l'auditoria 9.
2. **L'expansió amb corrent: amb corrent, la vida establerta s'escampa més de pressa?** Es compara la vida dels
   primers censos de la condició amb corrent amb la de la condició sense corrent, món a món.
   - **D'on ve:** és una candidata de l'auditor 1 (X-021) que surt de l'exploració. La branca amb corrent té
     més vida en 22 dels 29 mons (§2).
   - **La decisió:** la va prendre el responsable el 19-10-2026 (X-020 a X-022). Amb només 6 morts, la del canvi
     de règim té poca potència, i aquesta té una mesura contínua.
   - **Què no és:** no és una prova de quant dura la vida. Com a idea, segurament no és nova: la teoria dels
     fronts d'invasió ja preveu que la dispersió a distància els accelera. La prova en mesura la mida en aquest
     sistema, preregistrada i aparellada.

**Una de descriptiva: el corrent com a tal en les pèrdues.** Si el corrent desfà la vida, les branques amb
corrent la perdran més als dos orígens. El disseny 2 × 2 (§4) separa aquest efecte del canvi de règim.

## 2. El que en sabem: l'exploració

Amb els 29 mons de la part `exploracio`, una branca per món i condició, 2.000 èpoques (entrada 9 i auditoria 9):
- **Amb la regla R2** (§5), 6 de 58 branques perden la vida, a *t* + 750, 1.000, 1.250, 1.250, 1.500 i 1.750.
  Una es recupera: A1009-m0.01 acaba amb 1.825 hereditaris de 2.048 (AU2-57).
- **Les que la perden:** 1 de les 29 que continuen en la seva condició, i 5 de les 29 que la canvien (AUD-82).
  - **El canvi és en totes dues direccions:** 2 dels mons A, que hi guanyen corrent, i 3 dels B, que el perden.
  - **Amb corrent i sense, el mateix:** 3 de les 6 pèrdues són amb corrent, i 3 sense.
- **L'expansió** (X-021, comprovat). La mesura és la mitjana de la proporció d'hereditaris als 8 censos de cada
  branca.
  - **El resultat:** la branca amb corrent en té més en 22 de 29 mons (*p* = 0,004 unilateral, 0,008
    bilateral), amb una diferència mediana de 14,9 punts.
  - **Per origen:** afegir corrent als mons A en dona més en 10 de 12, i treure'l als B en dona menys en 12 de 17.
  - **A *t* + 2.000,** la diferència s'escurça: 19 de 29.
- **Amb R3, cap. Amb R1,** 13, de les quals 7 es recuperen.
- **El destí d'un món no queda fixat a *t*:** amb una altra llavor, acaba diferent en 4 de 27 mons a *t* +
  1.000.
- **El cost per època d'una branca viva creix amb el temps:** d'1,1 s de 0 a 500 èpoques a 5,0 s de 1.500 a
  2.000 (AUD-85).

## 3. Els mons i la població

- **Quins:** els 29 de la part `confirmacio` de `fase2/resultats/b2/repartiment.json`, 12 del món quiet (A) i
  17 del corrent (B).
  - Es van repartir a l'atzar el 18-10-2026, amb la llavor 20261018 (`e6be331`).
  - Ningú no n'ha fet cap branca.
- **El punt de partida:** la captura de l'època *t* de l'establiment, amb la SHA-256 de `repartiment.json`. Es
  comprova a les dues màquines abans de llançar.
- **La població** (AU2-59): els mons de 512 × 256 on la vida es va establir a la sèrie de la llei 2, quiets o
  amb corrent 0,01, continuats des del moment de l'establiment.
  - No són tots els mons possibles.
  - **L'origen** (A o B) no és a l'atzar: és la història de cada món (AU2-62). No se'n treu cap conclusió
    causal.
- **El que no és cec** (AUD-67, AU2-62): la història original d'aquests mons, de *t* a *t* + 1.000, és a la
  sèrie de la llei 2, i és pública.
  - L'anàlisi no la fa servir.
  - Ningú no l'ha mirada per dissenyar aquest protocol. És una declaració de procediment, no un cegament que es
    pugui comprovar.
  - **Per a la prova de l'expansió:** la hipòtesi surt només dels mons de l'exploració. El càlcul de l'auditor 1
    (`calculs-x020.mjs`, a les auditories) només llegeix `fase2/resultats/b2/exploracio`.
    - L'entrada 8 del quadern sí que va mirar tots els mons establerts, aquests 29 inclosos, però només si la
      vida es mantenia a *t* + 1.000.
    - És una altra mesura, i només de la condició d'origen.

## 4. Les branques

**Per cada món, dues condicions:**
- **la d'origen:** *m* = 0 als mons A, i *m* = 0,01 als B;
- **la de canvi:** l'altra.

**Les llavors de continuació:** *K* llavors **[PILOT]**, la del món + 200.000, + 300.000... Són diferents de la
de l'exploració (+ 100.000), i cada llavor es fa servir a totes dues condicions.

**L'horitzó *H*, i el disseny [PILOT].** Es triarà entre aquests dos amb el pilot (el cost i les morts
tardanes) i amb el càlcul de potència de la prova del canvi de règim, abans de l'etiqueta:
- **(i)** totes les branques, amb *H* = 5.000 i *K* = 2: 116 branques;
- **(ii)** la condició d'origen amb *H* = 6.000 i *K* = 2, i la de canvi amb *H* = 4.000 i *K* = 1: 87 branques.
  La prova del canvi de règim es restringeix llavors a 4.000 (§6.2).

**L'ordre**, la de l'exploració, desant el món final (`--save`) per estudiar després quina vida hi ha:

```
NOM --world 512x256 --seed LLAVOR --mixing M --from CAPTURA --start T --epochs T+H --every 100 --census 250 --census-version v3 --rng v2 --json CARPETA/NOM.jsonl --save CARPETA/captures
```

## 5. Les mesures

**La primera pèrdua sostinguda (regla R2)** (AU2-57, AUD-60).
- **Quan hi ha pèrdua:** és el primer parell de censos seguits, a 250 èpoques l'un de l'altre, amb 5
  hereditaris o menys en una mostra de 2.048 a cadascun.
- **Com es data:** la pèrdua es confirma al segon cens, i el temps *T* s'assigna al primer.
- **Què no és:** no és una extinció. És la pèrdua sostinguda del llindar de detecció.
- **Quan es detecta:** fins a *t* + *H* − 250 (AUD-86). Si el primer cens baix és a *t* + *H*, no hi ha segon
  cens que la confirmi, i la branca es censura a *H*.
- **La censura:** sense cap pèrdua confirmada, la branca es censura a *H*. És una censura administrativa, no
  una durada observada.
- **Els registres incomplets:** un registre que s'acaba abans, o al qual li falta un cens, és un **error de la
  sèrie**, no una censura.

**Les recuperacions:** un cens posterior a la pèrdua amb 21 hereditaris o més (l'1 %). Es compten a part, i no
anul·len la pèrdua.

**L'estat al cens final:** dues mesures diferents de *T*, que no se'n poden fer servir com a sinònim:
- `viu_1pct(H)`: 21 hereditaris o més al cens de *t* + *H*;
- `viu_R2(H)`: més de 5.

**Les sensibilitats,** descriptives:
- R1 (menys de l'1 %);
- R3 (cap hereditari);
- R2 sense recuperació fins a *H*;
- la pèrdua de la còpia (menys de l'1 % de cel·les que es copien);
- l'estat al cens final.

**La successió de famílies,** descriptiva (AUD-86): la família dominant a *t* + *H*, i si és una de registrada
després de *t*. La durada compta qualsevol hereditari, no la vida que es va establir.

**L'expansió**, per a la segona prova (§6.3).
- **La mesura:** *E* és la mitjana de la proporció d'hereditaris, de 2.048, als 8 primers censos de la branca,
  de *t* + 250 a *t* + 2.000. És la mesura de l'exploració.
- **Què compta:** qualsevol hereditari, igual que la durada.
- **Quines branques:** totes en tenen els 8 censos, amb tots dos dissenys.

## 6. L'anàlisi

La unitat és el **món** (AU2-58). En cada condició, el valor d'un món és la mitjana de les seves *K* branques.
Les branques d'un món no són rèpliques independents.

### 6.1 La principal: la durada en el seu món (estimació)

Amb les branques de la condició d'origen:
- **S_orig(*H*)** = (1/29) Σ_i mitjana_k [ *T_ik* > *H* ]: la proporció sense pèrdua fins a *H*, amb el mateix
  pes per món;
- **la corba de supervivència** (Kaplan–Meier) de *T*, amb la censura a *H*, i la mediana si s'hi arriba (pot
  quedar sense estimar);
- **la durada mitjana restringida, RMST_orig(*H*)** = (1/29) Σ_i mitjana_k min(*T_ik*, *H*). És una durada
  restringida a *H*, no la durada mitjana de la vida;
- **per origen** (A i B), i amb tot junt.

**Els intervals del 95 %:**
- **El *bootstrap*:** estratificat per origen i agrupat per món. Cada rèplica reextreu, amb reemplaçament, 12
  mons A i 17 mons B, i cada món s'hi emporta totes les seves branques. Es fan 10.000 rèpliques, i la llavor
  és al manifest.
- **El tipus d'interval [OBERT]:** BCa, o percentil a l'escala logit. Es triarà, abans de l'etiqueta, el que
  doni una cobertura més a prop del 95 % en la simulació (§8), perquè el percentil normal es queda curt amb 29
  mons (AUD-84).
- **Si totes les branques donen el mateix** (totes sense pèrdua), l'interval que dona el mètode triat; mai un
  NaN.

### 6.2 La primera confirmatòria: el canvi de règim

- **A cada món:** *D_i* = mitjana_k min(*T*_i,canvi,k, *H'*) − mitjana_k min(*T*_i,orig,k, *H'*).
  - *H'* és l'horitzó de la condició de canvi: *H* en el disseny (i), i 4.000 en el (ii).
  - Si el disseny és el (ii), es fa servir la primera llavor de la condició d'origen, per comparar amb el mateix
    nombre de llavors. **[OBERT]**
- **La prova:** la prova de signes exacta sobre els mons amb *D_i* ≠ 0. **[OBERT]**: unilateral amb α = 0,025,
  o bilateral amb α = 0,05? La resposta val per a totes dues proves.
- **La hipòtesi:** H₀, la vida dura igual si el món canvia de condició; H₁, dura menys.
- **La potència** es calcularà abans de l'etiqueta. S'hi faran servir les taxes de l'exploració i del pilot, i
  la probabilitat d'empat de cada disseny. Si és molt baixa, es dirà al protocol abans de llançar.
  - **Amb el model de l'eina de calibratge** (`eines/b2-cobertura.mjs`) i el disseny (i), amb un risc 5 vegades
    més alt quan el món canvia: un 87 % amb α, i un 79 % amb α/2, si les branques d'un món són independents
    (ρ = 0). Amb ρ = 0,05, un 29 % i un 17 %.

### 6.3 La segona confirmatòria: l'expansió amb corrent

- **A cada món:** *D_i* = mitjana_k *E*_i,amb corrent,k − mitjana_k *E*_i,sense corrent,k (§5).
  - **La condició amb corrent** és la de canvi als mons A i la d'origen als B.
  - **Les llavors:** totes les de cada condició, és a dir, 2 i 2 en el disseny (i), i 2 i 1 en el (ii).
- **La prova:** la prova de signes exacta sobre els mons amb *D_i* ≠ 0, unilateral. **[OBERT]**: la de signes o
  la de Wilcoxon? La de Wilcoxon té més potència, però suposa que, sota H₀, les diferències són simètriques.
  - Ara és la de signes, com la primera, perquè l'origen de cada món no és a l'atzar (AU2-62).
- **La hipòtesi:** H₀, la vida dels primers censos és igual amb corrent i sense; H₁, amb corrent n'hi ha més.
- **Com s'interpreta, decidit abans:** per origen, la proporció de mons amb *D_i* > 0 és descriptiva.
  - **Si és més gran que la meitat als dos orígens,** l'efecte s'atribueix al corrent.
  - **Si només ho és als mons B,** pot ser el canvi, i no el corrent. Als B, la condició amb corrent és la que no
    canvia, i hi ha més mons B (17) que A (12).
- **La potència** (exacta, `eines/b2-cobertura.mjs`).
  - **El llindar:** calen 21 mons de 29, tant amb α = 0,025 com amb α/2.
  - **Amb l'efecte de l'exploració** (*q* = 0,76): un 75 %. Amb *q* = 0,70, un 48 %; amb *q* = 0,80, un 89 %.
  - **Amb *K* = 2,** la mitjana de les dues llavors fa la mesura de cada món menys sorollosa, però no se n'ha
    calculat l'efecte.

### 6.4 Les dues decisions, amb la correcció de Holm

- **La regla:**
  1. La prova amb la *p* més petita es compara amb α/2.
  2. Si es rebutja, l'altra es compara amb α.
  3. Si no es rebutja, no es rebutja cap de les dues.
- **El programa** escriu les dues decisions per separat, cadascuna amb el seu llindar.
- **Si no es rebutja H₀,** es diu que la sèrie no ho permet afirmar. No es tria després cap variant de les
  proves, ni subgrups ni sensibilitats.
- **El que costa Holm:**
  - **A l'expansió, res.** Amb 29 mons, el llindar de 21 de 29 és el mateix amb α i amb α/2.
  - **Al canvi de règim, poc.** Si l'expansió es rebutja, es prova amb α. Si no, amb α/2.

### 6.5 Les descriptives

- **El 2 × 2** (l'origen per *m*): la proporció sense pèrdua i la RMST a les quatre cel·les. Si el corrent
  desfà la vida, les branques amb *m* = 0,01 la perden més als dos orígens; si el que la desfà és el canvi, la
  perden més les que canvien.
- **L'expansió per origen,** i la diferència mediana de *D_i* (§6.3).
- **L'atzar de la continuació** (AUD-61): en quina proporció de mons les *K* llavors coincideixen.
- **Les recuperacions, l'estat al cens final i la successió de famílies.**
- **El cost** per època i per tram.

## 7. L'execució

- **El codi:** el de l'etiqueta `preregistre-b2`, desplegat a totes dues màquines (`eines/desplega-vm.sh`). El
  llançador ha de portar la correcció d'AU2-56.
- **Les màquines:**
  - totes les branques d'un món van a la mateixa màquina;
  - els mons es reparteixen en blocs equilibrats per origen, amb una llavor declarada al manifest.
- **Si una màquina s'atura o cal repartir la cua:**
  - es mouen mons sencers, mai branques soltes;
  - val la còpia de la màquina assignada;
  - qualsevol branca duplicada es compara, i ha de tenir els mateixos censos i la mateixa empremta (AUD-86).
- **Els noms, opacs** (AUD-57): les llistes es generen a partir del manifest, i el nom no diu ni el món ni la
  condició.
- **El seguiment, només agregat:** `eines/seguiment.sh --agregat`. Durant la sèrie no es mira cap resultat.
- **Abans de llançar,** cal pausar les actualitzacions de Windows. Ho fa el responsable.

## 8. El programa de la sèrie

- **El programa:** un de nou, `fase2/b2-confirmacio.mjs`, amb el manifest `fase2/serie-b2.json` (AU2-60).
  - **El manifest** declara els mons, les captures amb la SHA-256, les condicions, les llavors, *H*, *K*, els
    noms opacs, el repartiment de les màquines, la llavor del *bootstrap* i l'etiqueta.
- **Primer, la comprovació del preregistre.** El fitxer d'entrada només farà servir mòduls de Node: comprovarà
  l'etiqueta i la còpia, i després carregarà la resta del programa. Així, el codi del projecte no s'executa
  abans de la comprovació (la limitació que deixa AUD-81 a `fase2/estadistica.mjs`).
- **La validació:** totes les branques, 29 × 2 × *K*, contra el manifest. Es comprova:
  - l'ordre de cada branca;
  - la llavor, la versió, la captura i el commit;
  - els censos, sense forats;
  - la línia final, a *t* + *H*;
  - cap fitxer de més ni de menys.

  Qualsevol diferència és un error, i el programa no calcula res.
- **Les proves,** amb dades sintètiques, que cobreixen almenys la matriu de l'auditor 2 (auditoria 9):
  - dos censos baixos seguits;
  - un de baix i el següent no;
  - un forat;
  - la parella a *H* − 250 i *H*, i un sol cens baix a *H*;
  - la recuperació;
  - una línia final anticipada;
  - una branca que falta;
  - una llavor o una condició equivocades;
  - un commit, una etiqueta o una captura diferents;
  - fitxers duplicats o aliens;
  - el *bootstrap*, que no ha de reextreure branques soltes;
  - 29 mons sense cap pèrdua;
  - l'expansió: quina condició té corrent a cada origen, i només els 8 primers censos;
  - un manifest amb menys censos que els de l'expansió;
  - la correcció de Holm, amb les quatre combinacions.
- **La simulació de cobertura:** la cobertura de l'interval i la taxa de falsos positius de la prova del canvi
  de règim, amb mons sintètics correlacionats, i l'atzar de la continuació. La potència de la de l'expansió és
  exacta.
- **Abans de l'etiqueta,** es revisa a l'auditoria 10.

## 9. El preregistre

- **L'etiqueta:** `preregistre-b2`, anotada, amb les SHA-256 del protocol, del manifest i del programa al
  missatge.
- **El segell extern** (decisió del responsable, 19-10-2026; AUD-77):
  - abans de la primera branca, l'objecte de l'etiqueta es segella amb OpenTimestamps;
  - només s'hi envia el hash, i el repositori pot continuar privat;
  - el fitxer de la prova (`.ots`) es desa al repositori.
- **El manifest i les empremtes** es publiquen després de la decisió, amb el codi exacte.

## 10. Limitacions conegudes

- **La població:** són mons condicionats a haver-se establert. L'origen és històric, no a l'atzar.
- **La història original no és cega** (§3).
- **La mort es mesura en una mostra de 2.048 cel·les.**
  - Una vida molt escassa es pot perdre per mostreig. La regla R2 hi deixa marge, i R1 i R3 ho acoten.
  - **La llavor del cens** és la mateixa a totes les branques (20261016): les branques d'un món es mesuren
    a les mateixes posicions a cada cens. No és cap biaix, però sí una correlació de mesura (AUD-86).
- **Un horitzó finit:** el que passa després de *H* queda censurat, i la mediana pot quedar sense estimar.
- **La successió de famílies:** la vida que sobreviu pot ser una família nova (§5).
- **Les màquines:** totes dues són el mateix ordinador físic. La història no en depèn, com s'ha comprovat a
  l'exploració.
- **L'abast:** un sol nivell de corrent (0,01), mons de 512 × 256, i 29 mons. Les estimacions per origen (12 i
  17 mons) són poc precises.
- **L'expansió i el canvi van junts a cada origen.**
  - Als mons A, la condició amb corrent és també la que canvia; als B, és la que no canvia.
  - Un efecte del canvi, sense cap efecte del corrent, sortiria a la prova com a més vida amb corrent als B i
    menys als A. Amb 17 mons B i 12 A, no s'anul·laria del tot.
  - Per això la lectura per origen (§6.3) es fixa abans.
- **L'expansió no és la durada.** Mesura la vida de les primeres 2.000 èpoques de la branca, no si la vida dura.

## 11. Canvis respecte de la v0.1

| Què | Per què |
|---|---|
| La principal és la durada en el seu món, i només s'estima | AUD-82; decisió del responsable |
| L'única prova confirmatòria és el canvi de règim | AUD-82, AUD-83; decisió del responsable |
| Fora l'afirmació "S(*H*) > 0,5" | AUD-83, AU2-59 |
| La primera pèrdua sostinguda i l'estat al cens final, separats i amb noms diferents | AU2-57 |
| El *bootstrap* estratificat per origen i agrupat per món, i l'interval triat per la cobertura | AU2-58, AUD-84 |
| La població, definida | AU2-59 |
| *H* i *K* es fixen amb el pilot i amb la potència | AUD-85, AU2-61; decisió del responsable |
| La detecció fins a *H* − 250, els registres incomplets com a error, la llavor del cens, la successió de famílies i la regla de les màquines | AUD-86 |
| El programa: primer la comprovació, i després la resta, amb la matriu de proves | AU2-60, AUD-81 |
| El segell d'OpenTimestamps | AUD-77; decisió del responsable |

## 12. Canvis respecte de la v0.2

| Què | Per què |
|---|---|
| Una segona prova confirmatòria, l'expansió amb corrent (§1, §5, §6.3), amb la seva lectura per origen fixada abans | X-020 a X-022; decisió del responsable, 19-10-2026. La del canvi de règim es recolza en 6 morts |
| Les dues proves, amb la correcció de Holm (§6.4) | Dues afirmacions confirmatòries. A 29 mons, a l'expansió no li costa res |
| El que se sap de les pèrdues de l'exploració, per direcció del canvi i per corrent (§2) | Comprovat amb les dades de l'exploració el 19-10-2026 |
| La part que no és cega, per a l'expansió (§3) | AUD-67, AU2-62 |
