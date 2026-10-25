# Índex de les troballes de les auditories

Els documents del projecte citen troballes de les auditories (AUD-xx, de l'auditor 1, i AU2-xx, de l'auditor 2). Els informes sencers no es publiquen; aquest índex en dona una línia i la resolució de cadascuna. Els dos auditors són models d'IA (una altra instància de Claude i un model diferent) que revisen el projecte en sessions separades: no és una revisió per experts humans. Cada troballa conserva el seu número d'una auditoria a l'altra.

**Com es llegeix:**
- **Auditoria:** la ronda en què va aparèixer la troballa. "Revisió" és la revisió del repositori del 19-10-2026. L'auditor 2 s'hi va incorporar a l'auditoria 2.
- **Gravetat:** la que va donar l'auditor.
- **Resolució:** l'estat més recent que consta a les respostes de l'equip, als traspassos i a la història de git, amb el commit o la PR quan n'hi ha.
  - **PR R1** és la PR de les correccions de la revisió del repositori (19-10-2026).
  - Cada troballa nova s'hi afegeix quan l'equip en respon l'informe.
  - Les correccions posteriors a l'auditoria 8 les va verificar l'auditoria 9 (19-10-2026), i ho diu la resolució de cadascuna.

## Auditor 1 (AUD-xx)

| ID | Auditoria | Gravetat | Què | Resolució |
|---|---|---|---|---|
| AUD-01 | 1 | Alta | El generador mulberry32 té un període massa curt per als mons 2D, i totes les llavors comparteixen un sol cicle. | Generador v2, xoshiro128\*\* (`b5b21c0`, PR #1), amb `--rng v1` per reproduir. Tancada a l'auditoria 2. |
| AUD-02 | 1 | Alta | `analitza.mjs` donava falsos positius de replicació i no coincidia amb la prova del registre de famílies. | Una sola prova de replicació (`15958ef`, PR #1). Cap xifra publicada no estava inflada. Tancada a l'auditoria 2. |
| AUD-03 | 1 | Mitjana | `sim.mjs` acceptava opcions desconegudes i valors no numèrics sense avisar. | Analitzador estricte (`c02382e`, PR #1) i els tres residus (`4d7bee5`). Tancada a l'auditoria 3. |
| AUD-04 | 1 | Mitjana | El servidor local queia amb una URL mal codificada. | Error capturat i resposta 400 (`3f1c385`, PR #1). Tancada a l'auditoria 2. |
| AUD-05 | 1 | Mitjana | "*m* = 1 és la sopa" no era exacte: l'aparellament i la mutació hi són diferents. | Text corregit (`293f25c`). Parcial: falta un mode d'aparellament complet a *m* = 1. |
| AUD-06 | 1 | Mitjana | Poques llavors per condició i un criteri d'aparició que no estava fixat d'entrada. | Protocol estadístic escrit abans de la sèrie (`9618c95`) i preregistrat. Tancada a l'auditoria 4. |
| AUD-07 | 1 | Mitjana | En una branca, la detecció de transició saltava a la primera mesura i aturava l'experiment. | Branques sense detecció (`c02382e`, PR #1). Parcial: els altres punts de partida venen del banc de captures de B2. |
| AUD-08 | 1 | Mitjana | Resultats sense commit, un lot amb dos commits i lots executats des de l'arbre de treball. | Commit, generador i Node a cada registre, i manifest a la sèrie. Parcial: fora de la sèrie, falten el manifest per lot i `--allow-dirty`. |
| AUD-09 | 1 | Mitjana | Al navegador, la història de la sopa depèn del nombre de fils i del maquinari. | README matisat (`293f25c`). Parcial: l'atzar no s'ha mogut al fil principal (vegeu AUD-80). |
| AUD-10 | 1 | Mitjana | Les captures no tenien còpia de seguretat ni metadades. | Manifest SHA-256 i còpia de les captures clau (`7b8c77f`, PR #1). Tancada a l'auditoria 2. |
| AUD-11 | 1 | Mitjana | El projecte no tenia llicència ni atribució de cubff. | Apache 2.0 per al codi, CC BY 4.0 per a la documentació i `NOTICE` (`2d25c42`). Tancada a l'auditoria 2. |
| AUD-12 | 1 | Baixa | El servidor local exposava carpetes internes del repositori i no comprovava `Host`. | Llista blanca i cap fitxer amb punt (`3f1c385`, PR #1). Tancada a l'auditoria 2. |
| AUD-13 | 1 | Baixa | La prova en context del registre feia servir sempre el radi 2, fos quin fos el del món. | El radi arriba a la prova com a paràmetre (`15958ef`, PR #1). Tancada a l'auditoria 2. |
| AUD-14 | 1 | Baixa | Les famílies "extingides" barrejaven extincions reals i famílies que es deixaven de seguir. | `untracked` separat d'`extinct` (`465b760`). Tancada a l'auditoria 3. |
| AUD-15 | 1 | Baixa | `Math.log` pot variar entre motors de JavaScript, i la compressió entre el navegador i Node. | Limitació documentada (V8) i `deflate-raw` (`293f25c`). Tancada a l'auditoria 3 com a limitació. |
| AUD-16 | 1 | Baixa | `npm test` només provava la Fase 1, sense integració contínua ni proves de regressió del determinisme. | Proves de regressió (`e356ca9`, PR #1) i integració contínua a GitHub (`a8d21cc`, PR #5). Verificada a l'auditoria 9. |
| AUD-17 | 1 | Baixa | Codi duplicat entre les interfícies i les eines. | Oberta: els mòduls compartits i `stepWorld()` estan ajornats. |
| AUD-18 | 1 | Baixa | El codi s'organitza per fases, i la Fase 3 no està definida al disseny. | Scripts a `eines/` (`e35a78c`). Els noms es mantenen per traçabilitat, amb un mapa al README (PR R1). |
| AUD-19 | 1 | Baixa | El README i la portada estaven desactualitzats; 190 contra 195 èpoques. | README, portada i nota 190/195 al quadern (`293f25c`, `9618c95`). Tancada a l'auditoria 2. |
| AUD-20 | 1 | Baixa | Registres amb BOM, noms inconsistents i sense format estructurat. | Parcial: el cens i les mesures ja són en JSONL; els registres continuen sent de text. |
| AUD-21 | 1 | Baixa | Les sèries i les taules del quadern s'escrivien a mà. | Les taules i la corba de l'entrada 8 surten de `fase2/quadern-serie.mjs`, amb prova (`6366aa0`, PR #6). Verificada a l'auditoria 9. |
| AUD-22 | 1 | Baixa | El desplegament a la màquina virtual deixava fitxers antics i no mirava si hi havia un lot en marxa. | Una carpeta per commit (`618c873`). Tancada a l'auditoria 3, amb una nota que es va corregir després (`6bd4877`). |
| AUD-23 | 1 | Baixa | `analitza.mjs` sense arguments acabava amb una traça d'error. | Missatge d'ús (`15958ef`, PR #1). Tancada a l'auditoria 2. |
| AUD-24 | 1 | Baixa | La interfície no registra els canvis de paràmetres, i el mapa no es pot fer servir amb el teclat. | Oberta. El teclat es revisarà amb AU2-52 (PR R2). |
| AUD-25 | 1 | Baixa | Dades internes de la infraestructura al repositori i privilegis amplis de l'agent. | Canvis al simulador per PR revisada (PR #1) i dades internes fora de l'arbre (`b32a489`). La història encara en té (AUD-78). |
| AUD-26 | 1 | Informativa | Node 16 està fora de manteniment. | Integració contínua també amb Node 22 i 24 (`5e46ec5`, PR R1). Node 16 i 20 queden per reproduir els registres. |
| AUD-27 | 1 | Informativa | L'univers tancat es respecta i la interfície tracta el DOM de manera segura. | No és cap defecte: es manté. |
| AUD-28 | 1 | Informativa | L'intèrpret i l'aparellament 2D són fidels a cubff, i la reproducció és exacta. | Es manté, automatitzat a `test/determinisme.mjs` (`e356ca9`) i amb l'oracle de cubff. |
| AUD-29 | 2 | Mitjana | Les llistes d'experiments antigues ja no reproduïen els resultats amb el generador nou. | Fixen `--rng v1 --census-version v2` (`34d8c5d`). Tancada a l'auditoria 3. |
| AUD-30 | 2 | Alta | La regla d'aturada del protocol depenia de l'HOE i no del criteri principal. | Aturada només després de l'esdeveniment confirmat (cens v3, `c0065b1`). Tancada a l'auditoria 3; residu a AUD-43. |
| AUD-31 | 2 | Mitjana | La potència no es calculava per a efectes plausibles; es proposa un disseny en dues etapes. | Dues etapes amb límits fixats i potència al mateix codi (`752ff04`, `60d4eb4`). Tancada a l'auditoria 3. |
| AUD-32 | 2 | Mitjana | La definició del criteri i l'anàlisi preregistrada eren incompletes. | Criteri funcional, script d'anàlisi amb proves i sensibilitats (`752ff04`, `c0065b1`). Tancada a l'auditoria 3; residu a AUD-44. |
| AUD-33 | 2 | Mitjana | La prova de replicació mesurava la còpia, no l'herència, i la seva sensibilitat depenia de l'espai. | Prova de segona generació (`c0065b1`) i, amb AUD-42, tancada a l'auditoria 4. |
| AUD-34 | 2 | Mitjana | El criteri barrejava l'aparició de la vida amb el seu establiment. | Mesures d'origen al protocol (`60d4eb4`). L'auditor va retirar la seva hipòtesi a l'auditoria 3, amb un cens complet. Tancada. |
| AUD-35 | 2 | Baixa | La redacció de l'entrada 6 i la censura de l'esclat s'havien de precisar. | Correccions anotades a l'entrada 6, sense esborrar l'original. Tancada a l'auditoria 3. |
| AUD-36 | 2 | Baixa | Les proves de determinisme no cobrien les mesures, el radi ni el navegador. | Proves de referència del cens v2 i v3 i empremtes noves (`c0065b1`). Tancada a l'auditoria 3; `stepWorld()` va amb AUD-17. |
| AUD-37 | 2 | Baixa | Els registres de la sèrie exploratòria no portaven el commit ni el generador. | Anotat a l'entrada 6 i a `docs/captures.md`. Tancada a l'auditoria 3. |
| AUD-38 | 2 | Baixa | Calia matisar `NOTICE` i l'origen de la funció de referència. | Comentari d'origen i matís a `NOTICE` (`e81b1cd`). Tancada a l'auditoria 3. |
| AUD-39 | 2 | Mitjana (estratègica) | Reformular la pregunta del projecte i escriure l'estat de la qüestió. | Pregunta reformulada a `docs/disseny.md`, i estat de la qüestió a `docs/estat-questio.md` (`f538512`). Verificada a l'auditoria 9. |
| AUD-40 | 2 | Mitjana (estratègica) | Fer un eix de química (ablacions a la sopa) abans de les lleis 4 a 7. | El responsable fixa el full de ruta: primer la sèrie i després les ablacions (B1). Tancada a l'auditoria 3. |
| AUD-41 | 2 | Mitjana (estratègica) | Dissenys eficients: un banc de mons amb vida, branques aparellades i assaigs d'establiment. | Banc de captures dels 58 mons amb vida, arxivat i verificat (`3cf2089`, `c745fb3`). Tancada a l'auditoria 8. |
| AUD-42 | 3 | Mitjana | La prova d'herència en context donava falsos positius amb programes lectors. | Herència sola i en context per separat, i sensibilitat redefinida (`9e7c539`). Tancada a l'auditoria 4. |
| AUD-43 | 3 | Baixa | L'aturada a *t* + 1.000 censura les anàlisis de sensibilitat. | Dit al protocol, i l'informe compta les sensibilitats censurades (`30e3b22`). Tancada a l'auditoria 4. |
| AUD-44 | 3 | Mitjana | L'script d'anàlisi no validava les entrades ni aplicava la decisió. | `--etapa` valida les dades i escriu la decisió (`30e3b22`). Tancada a l'auditoria 4. |
| AUD-45 | 3 | Baixa | Es deia, sense dades, que l'efecte és el mateix a les dues condicions. | Reformulat com a hipòtesi al protocol v0.3 (`5a7e0d4`). Tancada a l'auditoria 4. |
| AUD-46 | 4 | Baixa | `--etapa` no comprovava que el commit dels experiments fos el del preregistre. | Etiqueta `preregistre-llei2` i comprovació del commit (`9ee2f11`). Tancada a l'auditoria 5; residu a AUD-50. |
| AUD-47 | 4 | Baixa | `--etapa 2` no comprovava que l'etapa 1 no hagués rebutjat H0. | L'etapa 2 recalcula l'etapa 1 i s'hi nega si rebutjava (`9ee2f11`). Tancada a l'auditoria 5. |
| AUD-48 | 4 | Informativa | Les tres formes de risc sota H0 de la simulació no són tres proves de robustesa. | Explicat al protocol v0.4 (`fc2ac3f`). Tancada a l'auditoria 5. |
| AUD-49 | 4 | Baixa | El protocol no fixava l'estructura de carpetes que necessita `--etapa`. | Carpetes A i B al protocol v0.4 (`fc2ac3f`). Tancada a l'auditoria 5. |
| AUD-50 | 5 | Baixa | `--commit` acceptava qualsevol prefix, fins i tot massa curt. | `--commit` només en mode de prova i amb un hash complet (`92fac37`, `c7e5519`). Tancada a l'auditoria 6. |
| AUD-51 | 6 | Baixa | La comprovació de còpia neta es podia saltar amb `assume-unchanged`. | Fitxers seguits comparats amb l'etiqueta, sense `assume-unchanged` ni `skip-worktree` (`6366aa0`, PR #6). Verificada a l'auditoria 9. |
| AUD-52 | 7 | Baixa | Les sortides de decisió desades portaven una capçalera escrita a mà. | Sortides pures desades (`75e1218`). Tancada a l'auditoria 8. |
| AUD-53 | 7 | Baixa | Al pla de B3, la predicció confonia el costat amb l'àrea, i la mesura depenia de la mida. | Tancada al pla a l'auditoria 8; AUD-64 n'amplia l'abast. |
| AUD-54 | 7 | Informativa | Al pla de B2, calia reservar mons per a la confirmació abans d'explorar. | Mons repartits a l'atzar abans de mirar cap branca (`e6be331`). Tancada a l'auditoria 8. |
| AUD-55 | 7 | Baixa | L'HOE difereix entre Node 16 i Node 20 per la versió de zlib. | Nota datada al protocol i al disseny (`52d1780`), i sèries noves sense l'HOE a les sensibilitats (`6366aa0`). Verificada a l'auditoria 9. |
| AUD-56 | 8 | Baixa | `seguiment.sh` comptava malament després d'un rellançament. | L'últim estat de cada nom, amb proves de rellançament (`3865d9c`, PR #5). Verificada a l'auditoria 9. |
| AUD-57 | 8 | Baixa | El ritme i l'ordre d'acabament dels experiments poden revelar el resultat durant una sèrie. | Seguiment només agregat (`3865d9c`, PR #5) i noms opacs a les sèries confirmatòries futures. Verificada a l'auditoria 9. |
| AUD-58 | 8 | Baixa | Les proves d'una PR es van passar en una còpia amb canvis sense desar. | Proves en una còpia neta abans de cada merge i a GitHub, amb Node 16 i 20 (`a8d21cc`, PR #5). Verificada a l'auditoria 9. |
| AUD-59 | 8 | Informativa | Rutes relatives mal resoltes, i l'empremta s'escriu abans de la línia final del JSONL. | Camins resolts abans del `cd`, i un experiment només és fet amb el JSONL complet (`3865d9c`, PR #5). Verificada a l'auditoria 9. |
| AUD-60 | 8 | Baixa | La "mort" de B2 feia servir el llindar d'establiment, sense marge. | Tancada: el protocol de B2 fa servir la regla R2 (5 o menys de 2.048), amb R1 i R3 com a sensibilitats (auditoria 9). |
| AUD-61 | 8 | Mitjana | Amb una sola llavor per condició, l'exploració no pot dir quantes llavors calen. | Concordança amb la història original a l'eina de B2 (`971394e`, PR #7). Al protocol v0.4, *K* = 2 i la potència amb el risc del pilot (`9ce7dc5`); pendent de l'auditoria 10. |
| AUD-62 | 8 | Informativa | Una part de l'exploració de B2 no es va llançar amb el llançador documentat. | Acceptada: una acta de l'exploració, a la documentació interna de l'equip. |
| AUD-63 | 8 | Baixa | Error de l'auditor a l'auditoria 7 sobre el soroll al voltant del llindar. | Nota nova a l'entrada 8 del quadern (`573c0ec`). Verificada a l'auditoria 9. |
| AUD-64 | 8 | Mitjana | A B3, igualar cel·les × èpoques barreja la mida del món amb la seva edat. | Acceptada: B3 es redissenya per comparar a la mateixa edat. Pendent. |
| AUD-65 | 8 | Informativa | A les ablacions de B1, el cens ha de fer servir la mateixa química que el món. | Acceptada, amb una prova. Pendent, fins que es facin les ablacions. |
| AUD-66 | 8 | Baixa | La decisió confirmatòria no mirava `NODE_OPTIONS` ni les opcions de `node`. | La decisió s'hi nega si en troba (`6366aa0`, PR #6). Verificada a l'auditoria 9. |
| AUD-67 | 8 | Informativa | La meitat de confirmació de B2 no és cega respecte a la història original. | Tancada: el protocol de B2 ho declara com a limitació, i l'anàlisi no fa servir aquesta història (auditoria 9). |
| AUD-68 | Revisió | Mitjana | El resum en anglès no deia que els auditors són models d'IA, ni que un és el mateix model que desenvolupa. | El README, en català i en anglès, diu que la revisió és d'IA i no humana (`f23154d`, PR R1). |
| AUD-69 | Revisió | Mitjana | GitHub mostra el quadern com a codi HTML, no com a pàgina. | GitHub Pages és viable. Publicar-lo és una decisió pendent del responsable (D4). |
| AUD-70 | Revisió | Baixa | Cinc frases del README deien més que el quadern. | Frases ajustades al quadern (`f23154d`, PR R1). |
| AUD-71 | Revisió | Baixa | Una imatge generalitzava a partir d'un sol món per condició, i el color era el territori, no la vida. | Quatre mons per condició triats a l'atzar, amb el territori i el cens al peu (`27e063a`, `f23154d`, PR R1). Verificada a l'auditoria 9. |
| AUD-72 | Revisió | Baixa | El protocol de `main` s'obria com un esborrany, i la recepta de B2 citava una ruta antiga. | Notes datades, sense tocar els textos congelats (`b90b08f`, PR R1). Verificada a l'auditoria 9. |
| AUD-73 | Revisió | Baixa | GitHub no mostra els `LLEGEIX-ME.md` en obrir una carpeta. | Un `README.md` a les carpetes de les imatges i de B2 (`27e063a`, `b90b08f`, PR R1). Verificada a l'auditoria 9. |
| AUD-74 | Revisió | Baixa | Amb alguns tipus de daltonisme, els colors de les instruccions es confonen. | Pendent: canviar els colors de la interfície és una decisió del responsable, i aniria a la PR R2. |
| AUD-75 | Revisió | Baixa | L'animació començava amb un fotograma fosc i sense època, i la documentació deia 500 èpoques en lloc de 300. | Imatge de reserva, època, xifra corregida i una ordre que no depèn de l'HOE (`4c63be8`, `27e063a`, PR R1). Verificada a l'auditoria 9. |
| AUD-76 | Revisió | Baixa | En mode fosc, la corba del resultat principal era un bloc blanc, i no tenia peu. | Versió fosca i un peu amb la *n*, la prova i l'interval (`4c63be8`, `27e063a`, `f23154d`, PR R1). Verificada a l'auditoria 9. |
| AUD-77 | Revisió | Mitjana | Un tercer no pot verificar en el temps el preregistre de la llei 2. | El README diu què es pot verificar i què no (`f23154d`, PR R1). Un segell extern per a les sèries futures és la decisió D4. |
| AUD-78 | Revisió | Baixa | La història de git conté dades internes de la infraestructura. | Inventari de tota la història: cap secret. La decisió sobre la història (D1) és pendent, i el repositori continua privat. |
| AUD-79 | Revisió | Informativa | Els documents citen identificadors d'auditories que no són públiques. | Aquest índex (decisió D2). Els informes sencers no es publiquen. |
| AUD-80 | Revisió | Baixa | Per defecte, la sopa del navegador no reprodueix l'entrada 1 (fils i generador). | Pendent: un botó per reproduir l'entrada 1, a la PR R2. |
| AUD-81 | 9 | Baixa | El motor de la decisió es pot saltar a propòsit: amb un filtre de git o amb `git replace` decideix amb codi modificat. | Corregida a la PR #10 (`4b0b70b`), amb tres proves. El límit que hi queda (el codi importat s'executa abans de la comprovació) és escrit al codi, i el revisarà l'auditoria 10. Verificada a l'auditoria 10 pels dos auditors; el residu és a AUD-88 i AUD-89. |
| AUD-82 | 9 | Mitjana | Protocol de B2: l'estimand barreja la vida que continua en el seu món amb la que en canvia, que a l'exploració mor més (5 contra 1). | Confirmada. El responsable fa principal la vida en el seu món, i el canvi de règim n'és l'única prova confirmatòria. El 19-10-2026 s'hi afegeix la de l'expansió amb corrent, amb Holm (PR #12; X-020 a X-022). |
| AUD-83 | 9 | Mitjana | Protocol de B2: l'afirmació "S(H) > 0,5" es compliria gairebé sempre, i no posa res a prova. | Confirmada per simulació. L'afirmació se suprimeix, i la durada només s'estima. |
| AUD-84 | 9 | Baixa | Protocol de B2: amb 29 mons, l'interval per *bootstrap* percentil cobreix menys del 95 %. | Confirmada per simulació. El protocol v0.2 farà servir un interval calibrat. Al v0.4, el BCa, triat pel calibratge (`9ce7dc5`); pendent de l'auditoria 10. |
| AUD-85 | 9 | Baixa | Protocol de B2: el cost per època de les branques vives creix amb el temps, i el cost de la sèrie estava subestimat. | Confirmada amb les dades. Una prolongació pilot abans de fixar H i K: feta (`21e7e93`), i H i K al protocol v0.4 (`9ce7dc5`); pendent de l'auditoria 10. |
| AUD-86 | 9 | Informativa | Protocol de B2: hi falten la successió de famílies, la llavor comuna del cens, les morts a l'últim cens i la regla de les màquines. | Confirmada. S'afegeixen al protocol v0.2. |
| AUD-87 | 9 | Informativa | Detalls de documentació: la citació no deia "de vegades", el temps de la sopa era curt i la guia no deia qui pren la decisió de la llei 2. | Corregits a `main`. Verificada a l'auditoria 10. |
| AUD-88 | 10 | Baixa | Un enllaç simbòlic a una còpia idèntica fa que Node carregui els mòduls d'una altra carpeta, i la comprovació del preregistre no ho veu. | Confirmada a Linux. La comprovació rebutja els enllaços i les carpetes enllaçades que no són a l'etiqueta (PR `auditoria-10`), amb una prova. Pendent de l'auditoria 11. Verificada a l'auditoria 11. |
| AUD-89 | 10 | Informativa | El fitxer d'entrada i el comprovador són la base de confiança del programa: si es canvien, res no ho atrapa. | Acceptada: l'acta d'abans de decidir els comprova a mà contra el missatge de l'etiqueta (protocol de B2 v0.5, §7). Verificada a l'auditoria 11. |
| AUD-90 | 10 | Baixa | La màquina virtual semblava més lenta, i el repartiment de les branques, desequilibrat. | No es confirma: venia d'una taula de cost del pilot que només comptava 7 de les 12 branques vives, una errada de l'equip ja corregida. Les dues màquines costen el mateix. Retirada per l'auditor 1 a l'auditoria 11. |
| AUD-91 | 10 | Informativa | La carpeta del pilot de B2 no tenia les SHA-256 dels registres. | Corregida (`sha256.txt`, PR `auditoria-10`). Verificada a l'auditoria 11. |
| AUD-92 | 10 | Informativa | A l'estat de la qüestió, el factor de Knierim i altres és un càlcul propi, i "llinatges sembrats" pot confondre. | Corregida a `main` (`2889857`). El factor es manté: les dues xifres de l'article són la mateixa mesura. Tancada a l'auditoria 11. |
| AUD-93 | 10 | Informativa | Els noms opacs no amaguen el món ni la condició a les llistes ni als registres. | Acceptada: durant la sèrie ningú no els obre (protocol de B2 v0.5, §7). Verificada a l'auditoria 11. |
| AUD-94 | 11 | Informativa | El validador no comparava l'establiment amb els censos, tot i que el protocol deia que sí. | Corregida amb AU2-71: es recalcula amb els censos (PR `auditoria-11`). Pendent de l'auditoria 12. Verificada a l'auditoria 12. |
| AUD-95 | 11 | Baixa | La fórmula de S_orig(H) del protocol val 0 amb la censura a H, i la corba no és un Kaplan–Meier de branques. | Corregida al protocol de B2 v0.6 (PR `auditoria-11`). Verificada a l'auditoria 12. |
| AUD-96 | 11 | Baixa | Les frases de les decisions deien més que les hipòtesis del signe, i el text de Holm era ambigu amb la regla conjunta. | Corregida al programa i al protocol de B2 v0.6 (PR `auditoria-11`). Verificada a l'auditoria 12. Tancada a l'auditoria 13, amb AU2-74: la frase de l'auditoria 11 deia més que la prova, i es va corregir a l'auditoria 12. |
| AUD-97 | 11 | Informativa | El protocol que s'havia d'etiquetar deia "esborrany". | Corregida: "versió preregistrada" (protocol de B2 v0.6). Verificada a l'auditoria 12. |
| AUD-98 | 11 | Informativa | La comprovació de les captures era d'un sol moment i d'una sola màquina. | Acceptada: les 29, a totes dues màquines, abans de començar i abans de decidir (protocol de B2 v0.6, §7). Verificada a l'auditoria 12. |
| AUD-99 | 11 | Informativa | La prova dels enllaços simbòlics se saltava sencera a Windows. | Corregida: el cas de la carpeta s'hi fa amb una unió (PR `auditoria-11`). Verificada a l'auditoria 12. |
| AUD-100 | 11 | Informativa | La nota nova de l'entrada 1 atribuïa a l'article de 2024 un detall que el text no diu. | Corregida al quadern, amb una nota datada (PR `auditoria-11`). Verificada a l'auditoria 12. |
| AUD-101 | 12 | Informativa | El validador acceptava una transició de l'HOE inventada a la línia final d'una branca, on `sim.mjs` no en detecta mai cap. | Corregida: a les branques ha de ser nul·la (PR `auditoria-12`). Verificada a l'auditoria 13. |
| AUD-102 | 12 | Informativa | "Pèrdua confirmada fins a τ", a la corba, es podia llegir de dues maneres. | Corregida al protocol de B2 v0.7: "sense cap pèrdua datada a τ o abans". Verificada a l'auditoria 13. |
| AUD-103 | 13 | Informativa | Quan la decisió 2 no es rebutja, la frase del programa no en diu la potència, i el protocol diu que s'ha de comunicar amb la potència. | Acceptada: es dirà a l'informe del resultat. No es toca res més abans de l'etiqueta. |
| AUD-104 | 14 | Baixa | Els textos del segell de B2 deien que en els 6 minuts d'abans de l'ancoratge a Bitcoin cap branca no havia donat res que algú mirés, però dues branques ja havien escrit el primer cens. | Confirmada amb els registres. Corregit al quadern (entrada 10), a `docs/preregistre-b2/` i amb una addenda a l'acta: hi havia el primer cens de dues branques, cap de segon, i ningú no el va mirar, segons l'acta. |
| AUD-105 | 14 | Baixa | Al README hi faltava l'horitzó de 5.000 èpoques, i "totes les pèrdues tornen a passar de l'1 %" només és cert per a les 4 de la condició d'origen. | Corregida al README, al README.en i a `docs/disseny.md`. |
| AUD-106 | 14 | Informativa | L'entrada 10 no deia que la concentració de les pèrdues es va mirar després de la decisió. | Corregida a l'entrada 10. |
| AUD-107 | 14 | Informativa | Mirat després: la vida es torna a perdre a les branques noves dels mons on ja s'havia perdut a la història original (6 de 7, contra 2 de 26). | Comprovada amb les dades. Afegida a l'entrada 10 com a descriptiu mirat després. Candidata a una confirmació. |
| AUD-108 | 14 | Informativa | Mirat després: al final, amb corrent i sense, la vida arriba al mateix nivell. El corrent l'avança, però no n'augmenta el nivell final. | Comprovada amb les dades. Afegida a l'entrada 10 i al README com a descriptiu. |

## Auditor 2 (AU2-xx)

| ID | Auditoria | Gravetat | Què | Resolució |
|---|---|---|---|---|
| AU2-01 | 2 | Alta | El criteri principal confonia el territori genètic d'una família amb replicació real. | Cens v3 funcional (`c0065b1`) i calibratge (`a69a935`). Tancada amb una limitació: és una mesura operativa, no una definició de vida. |
| AU2-02 | 2 | Alta | La prova de replicació només demostrava la còpia d'una finestra curta. | Prova de segona generació (`c0065b1`). Tancada tècnicament a l'auditoria 4. |
| AU2-03 | 2 | Alta | El registre de famílies mostrejava les cel·les amb reemplaçament. | Mostra sense reemplaçament (`465b760`). Tancada a l'auditoria 3, amb un impacte residual baix. |
| AU2-04 | 2 | Alta | L'aturada per l'HOE podia esbiaixar l'anàlisi de supervivència. | Aturada només després de l'esdeveniment confirmat (`c0065b1`). Tancada a l'auditoria 3. |
| AU2-05 | 2 | Mitjana | La mida de mostra es justificava amb Fisher, i la prova principal és el log-rank. | Potència del log-rank i simulació de les dues etapes (`752ff04`, `30e3b22`). Tancada a l'auditoria 4. |
| AU2-06 | 2 | Alta | Faltava un procediment preregistrat per extreure els temps de les dades. | JSONL, extractor i validador (`752ff04`, `9ee2f11`). Tancada a l'auditoria 5. |
| AU2-07 | 2 | Mitjana | La regressió històrica de l'HOE fallava amb Node 22. | Versió de zlib a cada registre i HOE amb tolerància (`86ceddc`). Tancada a l'auditoria 3. |
| AU2-08 | 2 | Mitjana | La independència de les llavors és una hipòtesi, no una propietat demostrada. | Documentació matisada. Tancada amb una limitació: la independència formal no es demostra. |
| AU2-09 | 2 | Informativa | El disseny amb llavors independents renuncia a controlar la variabilitat inicial. | Disseny amb llavors independents, fixat per escrit al protocol. Tancada a l'auditoria 3. |
| AU2-10 | 2 | Mitjana | La poda de famílies comptava com a extingides les que es deixaven de seguir. | Com AUD-14: `untracked` separat d'`extinct` (`465b760`). Tancada a l'auditoria 3. |
| AU2-11 | 2 | Mitjana | Calia una verificació de punta a punta de les captures. | Verificació de les sumes documentada. Tancada a l'auditoria 3. |
| AU2-12 | 2 | Mitjana | La concordança amb cubff no s'havia demostrat de manera independent. | Oracle: l'intèrpret coincideix amb cubff en 200.000 cintes (`4dcceae`). Parcial: l'auditor no ha recompilat cubff pel seu compte. |
| AU2-13 | 2 | Informativa | Abast de la superfície del servidor local i de l'univers tancat. | El servidor comprova el camí real (`e81b1cd`). Tancada en l'abast local, sense prova de penetració. |
| AU2-14 | 2 | Mitjana | Cal prudència en interpretar i publicar els experiments històrics. | La sèrie històrica consta com a exploratòria. Parcial fins a la publicació. |
| AU2-15 | 3 | Alta | La cerca de descendents s'aturava en el primer fill no hereditari, i donava falsos negatius. | La cerca continua fins a demostrar l'herència (`9e7c539`), i calibratge refet (`c34bf1e`). Tancada a l'auditoria 4. |
| AU2-16 | 3 | Alta | L'anàlisi no validava l'esquema de les dades ni el pla d'assignació. | Manifest de la sèrie i validador (`30e3b22`, `9ee2f11`). Tancada a l'auditoria 5. |
| AU2-17 | 3 | Alta | L'establiment no comprovava que els censos fossin consecutius. | Censos a un interval exacte (`9e7c539`). Tancada a l'auditoria 4. |
| AU2-18 | 3 | Mitjana | El programa no aplicava la decisió de dues etapes preregistrada. | `--etapa` calcula i escriu la decisió (`30e3b22`). Tancada a l'auditoria 5. |
| AU2-19 | 3 | Mitjana | La sensibilitat "només la prova sola" no equivalia a herència sense ajuda. | Herència sola i en context per separat (`9e7c539`). Tancada a l'auditoria 4. |
| AU2-20 | 3 | Mitjana | La captura de "l'època d'establiment" era, de fet, la de la confirmació. | Captures de *t*, *t* − 250 i *t* − 500, amb la seva època (`9e7c539`). Tancada a l'auditoria 4. |
| AU2-21 | 3 | Mitjana | Faltava una simulació verificable de l'error de tipus I i de la potència del procediment seqüencial. | Simulació de les dues etapes i taula al protocol (`30e3b22`). Tancada a l'auditoria 4. |
| AU2-22 | 3 | Baixa | Validesa externa del constructe "vida" i sensibilitat que depèn del context. | Límits declarats al protocol v0.3 (`5a7e0d4`). Tancada documentalment a l'auditoria 4. |
| AU2-23 | 4 | Alta | El validador acceptava un commit homogeni que no fos el del preregistre. | Etiqueta del preregistre exigida (`9ee2f11`, `92fac37`). Tancada; l'etiqueta real es va comprovar a l'auditoria 7. |
| AU2-24 | 4 | Alta | Un experiment sense cap cens passava la validació. | El validador exigeix tots els censos (`9ee2f11`). Tancada a l'auditoria 5. |
| AU2-25 | 4 | Alta | No es validaven el rang ni la coherència dels recomptes. | Mostra de 2.048 i recomptes coherents (`9ee2f11`). Tancada a l'auditoria 5. |
| AU2-26 | 4 | Mitjana | L'etapa 2 no exigia que l'etapa 1 no hagués rebutjat H0. | L'etapa 2 recalcula l'etapa 1 (`9ee2f11`). Tancada a l'auditoria 5. |
| AU2-27 | 4 | Mitjana | Es podien perdre totes les mesures i acceptar un motiu final impossible. | El validador comprova les mesures i el final (`9ee2f11`). Tancada a l'auditoria 5. |
| AU2-28 | 4 | Baixa | La regla per interpretar l'herència en context quedava oberta. | Regla explícita al protocol v0.4 (`fc2ac3f`). Tancada documentalment a l'auditoria 5. |
| AU2-29 | 5 | Mitjana | `--commit` i `--manifest` podien substituir l'ancoratge del preregistre. | Només en mode de prova i amb un hash complet (`92fac37`, `c7e5519`). Tancada a l'auditoria 6. |
| AU2-30 | 5 | Baixa | L'ordre global de les línies del JSONL no era canònic. | Tipus de línia en llista blanca i ordre global (`92fac37`, `c7e5519`). Tancada a l'auditoria 6. |
| AU2-31 | 6 | Baixa | La comprovació de còpia neta no mirava el document del protocol. | Tots els fitxers seguits han de ser idèntics als de l'etiqueta (`6366aa0`, PR #6). Verificada a l'auditoria 9. |
| AU2-32 | 6 | Baixa | El programa no distingia una etiqueta anotada d'una de lleugera. | Exigeix una etiqueta anotada, amb les SHA-256 al missatge (`6366aa0`, PR #6). Verificada a l'auditoria 9. |
| AU2-33 | 7 | Mitjana | Heterogeneïtat no explicada de l'efecte entre les dues etapes de la sèrie de la llei 2. | Exploració amb particions declarades abans (`ef30154`): cap indici de causa sistemàtica. Oberta com a pregunta. |
| AU2-34 | 7 | Baixa | Exposició parcial i accidental a dades abans d'acabar l'etapa 2. | Declarada a l'acta. Seguiment sense xifres (PR #3) i només agregat (`3865d9c`, PR #5). Mitigada. |
| AU2-35 | 7 | Baixa | El commit del traspàs no coincidia amb el del paquet auditat. | Diferencial lliurat, i el paquet surt del mateix commit que el traspàs. Tancada a l'auditoria 8. |
| AU2-36 | 7 | Informativa | Les simulacions llargues no s'han reproduït de manera independent. | Manifest de 171 captures (`3cf2089`, `c745fb3`). Parcial: les captures no s'han lliurat a l'auditor. |
| AU2-37 | 8 | Alta | En rellançar un lot, es saltaven experiments que no tenien el JSONL. | Un experiment només és fet amb el JSONL complet (`3865d9c`, PR #5). Verificada a l'auditoria 9. |
| AU2-38 | 8 | Mitjana | El llançador absorbia un error fatal i retornava èxit. | Paràmetres validats i error propagat (`3865d9c`, PR #5). Verificada a l'auditoria 9. |
| AU2-39 | 8 | Mitjana | Una llista sense experiments podia llançar una simulació sense arguments. | Llista buida rebutjada (`3865d9c`, PR #5). Verificada a l'auditoria 9. |
| AU2-40 | 8 | Baixa | El seguiment comptava dues vegades els registres complets. | Com AUD-56: l'últim estat de cada nom (`3865d9c`, PR #5). Verificada a l'auditoria 9. |
| AU2-41 | 8 | Mitjana | La "mort" de B2 és perdre el llindar del cens, no una extinció demostrada. | Parcial: el protocol de B2 v0.2 separa la primera pèrdua sostinguda de l'estat al cens final (AU2-57); pendent de l'auditoria 10. |
| AU2-42 | Revisió | Alta | Publicar la història de git pot exposar dades internes, i no s'havia inventariat. | Inventari de tota la història: cap secret. La decisió sobre la història (D1) és pendent, i el repositori continua privat. |
| AU2-43 | Revisió | Alta | La verificació pública del preregistre depèn d'una història que pot quedar privada. | Com AUD-77: el README diu què es pot verificar (`f23154d`, PR R1). Segell extern futur: decisió D4. |
| AU2-44 | Revisió | Mitjana | El README deia "sense codi copiat", i `NOTICE` declara una adaptació de cubff. | Crèdits coherents amb `NOTICE` (`f23154d`, PR R1). |
| AU2-45 | Revisió | Mitjana | El protocol de `main` s'obria com si la sèrie no s'hagués fet. | Com AUD-72: una nota datada damunt del text congelat (`b90b08f`, PR R1). |
| AU2-46 | Revisió | Mitjana | Les captures per repetir les figures no són públiques. | Un dipòsit amb DOI és la decisió D4, pendent. Mentrestant, `docs/reproduir.md` explica com regenerar-les. |
| AU2-47 | Revisió | Mitjana | Node 16 i 20 hi constaven com a base vigent, i ja no tenen manteniment. | Proves també amb Node 22 i 24 (`5e46ec5`, PR R1). Node 16 i 20 queden per reproduir. |
| AU2-48 | Revisió | Mitjana | El README barrejava resultats exploratoris amb afirmacions generals sobre la "vida". | "Vida" com a definició operativa, i frases ajustades a les dades (`f23154d`, PR R1). |
| AU2-49 | Revisió | Mitjana | Una ordre per generar l'animació no s'executava tal com estava escrita. | Ordre corregida i comprovada (`27e063a`, PR R1). |
| AU2-50 | Revisió | Mitjana | No es definien la llicència de les dades ni la manera de citar el projecte. | `LICENSE-data.md` (CC BY 4.0) i `CITATION.cff` (`f23154d`, PR R1). |
| AU2-51 | Revisió | Baixa | L'animació i la paleta fosca no tenien una alternativa prou clara. | Com AUD-75 i AUD-76: imatge de reserva, època i corba fosca (`4c63be8`, `27e063a`, PR R1). |
| AU2-52 | Revisió | Baixa | A la interfície, el mapa és menys navegable amb el teclat que els controls. | Pendent: es provarà quan acabi B2, a la PR R2. |
| AU2-53 | Revisió | Baixa | Un nouvingut no tenia camins clars per reproduir, citar o contribuir. | `docs/reproduir.md`, `CONTRIBUTING.md`, `CITATION.cff` i una prova ràpida (`f23154d`, PR R1). |
| AU2-54 | Revisió | Baixa | Els noms històrics de les fases poden confondre. | Un mapa de carpetes al README, sense moure res (`f23154d`, PR R1). |
| AU2-55 | Revisió | Baixa | Calia precisar el grau d'independència de les auditories i si són públiques. | Com AUD-68 (`f23154d`, PR R1), i aquest índex (decisió D2). |
| AU2-56 | 9 | Mitjana | El llançador dona per fet un experiment amb el mateix nom i llavor encara que n'hagin canviat els paràmetres. | Corregida a la PR #10 (`c135013`): el llançador compara l'ordre del JSONL amb la de la llista. Amb una prova. Verificada a l'auditoria 10. |
| AU2-57 | 9 | Alta | Protocol de B2: confonia no haver patit cap pèrdua amb ser viu al final; una branca perd la vida i després es recupera. | Confirmada. El protocol v0.2 separa les dues mesures. |
| AU2-58 | 9 | Alta | Protocol de B2: l'estimand i el *bootstrap* no estaven prou especificats. | Confirmada. *Bootstrap* estratificat per origen i agrupat per món, especificat i calibrat al protocol v0.2. |
| AU2-59 | 9 | Mitjana | Protocol de B2: la població objectiu no estava definida. | Confirmada. El protocol v0.2 la defineix: els mons on la vida es va establir a la sèrie de la llei 2. |
| AU2-60 | 9 | Mitjana | Protocol de B2: el programa de la sèrie i les seves proves encara no existien. | Confirmada. El programa i les proves, amb la matriu de l'auditor (PR #11 i PR #12); es revisa a l'auditoria 10, abans de l'etiqueta. |
| AU2-61 | 9 | Mitjana | Protocol de B2: l'horitzó i la precisió no estaven prou justificats. | Confirmada. Una prolongació pilot i un càlcul de potència abans de fixar H i K: fets (`21e7e93`, `9ce7dc5`); pendent de l'auditoria 10. |
| AU2-62 | 9 | Baixa | Protocol de B2: el no cegament de la història original és una declaració, i l'origen dels mons no és a l'atzar. | Confirmada. S'afegeix a les limitacions del protocol v0.2. |
| AU2-63 | 9 | Baixa | La guia de reproducció deia que qualsevol commit posterior fa la mateixa història. | Corregida a `main`: cal el commit del registre. Verificada a l'auditoria 10. |
| AU2-64 | 10 | Alta | El validador de la sèrie de B2 acceptava registres sense mesures, amb línies alienes o amb comptadors impossibles. | Confirmada. El validador comprova l'estructura sencera que escriu `sim.mjs` (PR `auditoria-10`), amb les mutacions de l'auditor com a proves. Pendent de l'auditoria 11. A l'auditoria 11, parcial: hi faltava l'establiment (AU2-71) i l'esquema de la capçalera i la línia final (AU2-72). Amb AU2-71 i AU2-72, tancada a l'auditoria 12. |
| AU2-65 | 10 | Alta | La decisió de l'expansió amb corrent no aplicava la lectura per origen que diu el protocol. | Confirmada. El responsable tria la regla conjunta: cal també més de la meitat dels mons de cada origen (PR `auditoria-10`). Pendent de l'auditoria 11. Verificada a l'auditoria 11 pels dos auditors. |
| AU2-66 | 10 | Mitjana | L'anàlisi no comprova els bytes de les captures d'origen, només el camí. | Acceptada: `eines/b2-captures.mjs`, a totes dues màquines abans de llançar (protocol de B2 v0.5, §7). |
| AU2-67 | 10 | Mitjana | La potència del canvi de règim és molt sensible a la dependència, i la H₀ de la prova de signes era vaga. | Acceptada: hipòtesis operatives en termes del signe, i un no-rebuig es comunica com a no concloent (protocol de B2 v0.5). Tancada a l'auditoria 11. |
| AU2-68 | 10 | Mitjana | L'interval BCa es queda curt en alguns escenaris del calibratge. | Acceptada: l'interval és el logit, i el BCa, una sensibilitat (protocol de B2 v0.5). Tancada a l'auditoria 11. |
| AU2-69 | 10 | Mitjana | Les afirmacions de novetat necessiten una delimitació bibliogràfica més estreta. | Acceptada a `main` (`2889857`): "no l'hem trobat" vol dir a les fonts revisades, amb dos antecedents més. |
| AU2-70 | 10 | Baixa | El registre de canvis del protocol de B2 deia que hi havia una sola prova confirmatòria. | Corregida: la taula antiga diu que és un estat històric (protocol de B2 v0.5). |
| AU2-71 | 11 | Alta | El validador no recalculava l'establiment amb els censos: es podia suprimir, canviar de data o deixar desquadrat. | Confirmada. Es recalcula amb el criteri de `fase2/census.js`, com fa `sim.mjs`, amb els casos de l'auditor com a proves (PR `auditoria-11`). Pendent de l'auditoria 12. Tancada a l'auditoria 12. |
| AU2-72 | 11 | Mitjana | La capçalera i la línia final dels registres no tenien un esquema sencer. | Confirmada. Els camps exactes, la mida del món, el criteri d'establiment i l'empremta (PR `auditoria-11`). Pendent de l'auditoria 12. Tancada a l'auditoria 12. |
| AU2-73 | 11 | Mitjana | La fórmula de supervivència del protocol no era compatible amb la censura del programa. | Corregida al protocol de B2 v0.6, amb el cas sense variació de l'interval (PR `auditoria-11`). Tancada a l'auditoria 12. |
| AU2-74 | 12 | Mitjana | La frase de la decisió 1 deia "en la majoria dels mons", però la prova de signes no compta els empats: amb 7 mons a favor i 22 empats, es rebutja. | Confirmada; l'errada era de l'equip, de l'auditoria 11. La frase parla dels mons amb una diferència de durada, amb els recomptes i una prova (PR `auditoria-12`). Tancada a l'auditoria 13. |
| AU2-75 | 14 | Mitjana | La segona prova de B2 mesura la proporció d'hereditaris als 8 primers censos, no la velocitat d'un front, però els textos deien que el corrent "escampa la vida més de pressa". | Corregida al quadern, al README, al README.en i a `docs/disseny.md`: la vida ocupa més part del món als primers censos, i la teoria dels fronts és una explicació compatible, no observada. El protocol preregistrat no es toca. |
| AU2-76 | 14 | Mitjana | L'ancoratge del segell a Bitcoin és posterior a l'inici de la sèrie, i alguns registres ja tenien mesures. Calia separar què demostra Bitcoin, què registren els calendaris i què declara l'acta. | Corregida amb AUD-104. |
| AU2-77 | 14 | Baixa | "No perden mai la vida" confon la mesura (cap pèrdua sostinguda R2 en 5.000 èpoques, amb un cens cada 250) amb una continuïtat de la vida. | Corregida al quadern, al README i al README.en. |
