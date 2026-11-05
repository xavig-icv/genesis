# Genesis

Projecte d'abiogènesi digital. Fins al 30-10-2026 es deia claude-origins, el nom que encara porten les carpetes (el
repositori local, els desplegaments de la VM, les auditories) i els registres, i que no es canvia. La visió, els
principis i les decisions són a `docs/disseny.md`, i els resultats dels experiments al quadern (`quadern/index.html`).
Llegeix-los abans de proposar canvis.

## Convencions

- Parla amb l'usuari en català. La interfície, la documentació i els comentaris del codi són en català;
  els identificadors del codi, en anglès.
- JavaScript amb mòduls ES, sense dependències ni pas de compilació. Node 16 a Windows: els scripts
  per a Node s'anomenen `.mjs` o depenen del `"type": "module"` del `package.json`.
- Proves: `npm test` (intèrpret, món i cens, línia d'ordres, lots d'experiments, servidor, estadística,
  oracle de cubff i regressió del determinisme; necessita `bash`, Git Bash a Windows). **Abans de demanar
  un merge, `bash eines/prova-neta.sh`**, que les passa en una còpia neta del commit: no poden dependre de canvis
  sense desar (AUD-58). GitHub també les passa a cada PR, amb Node 16, 20, 22 i 24 (`.github/workflows/proves.yml`), però no
  a `main`: **després de cada commit a `main` que pugui tocar les proves, també els de documents o de registres, `prova-neta`**
  (dues proves de la maduració van fallar a `main` sense que ningú ho veiés, la PR #33). Han de passar totes abans de donar res per acabat. Les empremtes de
  `test/determinisme.mjs` no es toquen mai: si un canvi ha d'alterar les històries a propòsit, va darrere
  d'una opció nova. El mateix val per als valors del cens v2.
- Experiments llargs sense gràfics: `node sim.mjs` (sopa) o `node sim.mjs --world 512x256` (món 2D).
  Les opcions es validen estrictament (`node sim.mjs --help`).
- Generador aleatori: v2 (xoshiro128\*\*) per defecte. Tots els experiments anteriors a l'auditoria 1
  es van fer amb v1 (mulberry32): per reproduir-los, `--rng v1`.
- Cens: v3 per defecte (replicadors hereditaris en una mostra de 2.048 cel·les diferents; vegeu
  `docs/calibratge.md`). Els experiments anteriors a la iteració 3 es van fer amb el cens v2: per
  reproduir-los, `--rng v1 --census-version v2` (les llistes antigues ja ho porten).
- Prova de replicació: només la de `fase2/replication.js`, amb la de segona generació (`heredity`). No
  n'escriguis cap altra (AUD-02). El criteri d'establiment de la vida és només a `fase2/census.js`.
- Estadística de la sèrie confirmatòria: `node fase2/estadistica.mjs --etapa 1|2 [--serie manifest.json] carpeta-A
  carpeta-B`, que valida els JSONL contra el manifest (per defecte `fase2/serie-llei2.json`) i aplica la decisió;
  sense `--etapa`, informe descriptiu. El manifest, el criteri d'establiment i els límits no es toquen després del
  preregistre. Protocol: `docs/protocol-estadistic.md`.
  - **La decisió confirmatòria** només es pren des d'una còpia del commit de l'etiqueta que declara el manifest
    (`"tag"`; per defecte, `preregistre-llei2`).
    - L'etiqueta ha de ser anotada, amb les SHA-256 del manifest i d'`estadistica.mjs` al missatge.
    - Tots els fitxers seguits han de ser idèntics als de l'etiqueta, sense `assume-unchanged` ni `skip-worktree`.
    - No hi pot haver fitxers de codi nous, ni `NODE_OPTIONS`, ni opcions de `node`.
  - **La sortida** es desa tal com surt (`> etapaN-sortida.txt`), i la capçalera, si cal, en un fitxer a part (AUD-52).
  - **Les sensibilitats** que es calculen les pot triar el manifest (`"sensitivities"`). A les sèries noves, sense
    l'HOE, que depèn de la versió de zlib (AUD-55).
  - **La sèrie de la llei 2 es decideix amb el programa de la seva etiqueta (`8cd4449`).** `test/estadistica.mjs`
    comprova que el programa d'ara en treu la mateixa decisió.
- Taules i corba d'una sèrie per al quadern: `node fase2/quadern-serie.mjs carpeta-A carpeta-B sortida`
  (`test/quadern.mjs` comprova que reprodueix les de l'entrada 8).
- B2 (quant dura la vida establerta): `node fase2/b2-analisi.mjs` és l'anàlisi **exploratòria** de les branques
  de `fase2/resultats/b2/exploracio`, amb tres regles de "mort", les morts falses, l'aparellament pel món i la
  concordança amb la història original. Mai no es fa servir amb els mons de la part `confirmacio` del
  repartiment (`fase2/resultats/b2/repartiment.json`): s'hi nega.
- La sèrie preregistrada de B2 (`docs/protocol-b2.md`): `node fase2/b2-confirmacio.mjs --decideix|--prova COMMIT|--llistes
  [--serie manifest.json] carpeta`, amb el manifest `fase2/serie-b2.json`.
  - **El manifest** el genera `node eines/b2-manifest.mjs --disseny i|ii --estat esborrany|final`, amb els noms opacs
    i les màquines.
  - **La cobertura dels intervals i la potència:** `node eines/b2-cobertura.mjs`.
  - **La prolongació pilot** (descriptiva, per fixar H i K): `node eines/b2-pilot.mjs`, amb els registres de
    `fase2/resultats/b2/pilot`.
  - **Abans de llançar la sèrie,** a cada màquina i des de la carpeta del commit de l'etiqueta:
    `node eines/b2-captures.mjs --maquina pc|vm`, que comprova la SHA-256 de les captures d'origen (AU2-66).
  - **La lectura de resultats:** `--prova` no llegeix mai la carpeta de la sèrie de veritat. Els resultats només es
    miren amb `--decideix`.
  - **Els programes confirmatoris nous** comproven el preregistre (`fase2/preregistre.mjs`, només mòduls de Node)
    abans de carregar res més del projecte (AUD-81).
- Les alíquotes (els pilots de la maduració i dels zeros, `docs/pilot-maduracio.md`): `node eines/transforma.mjs --from
  captura.bin --kind TIPUS --seed N --out sortida.bin`, que escriu la captura transformada i el seu registre `.json`, amb
  els invariants comprovats; mai no sobreescriu cap fitxer. L'atzar de la transformació és independent del de la
  continuació. `--scan` compta les cel·les que es repliquen i les hereditàries.
  - **Els experiments:** `node eines/pilot.mjs maduracio|zeros|serie --envelliment|--prepara|--comprova|--comprova-captures`
    (les llistes, el manifest congelat i contrastat amb el disseny, i les comprovacions abans de llançar i abans de decidir).
    La preparació valida l'envelliment sencer i escaneja totes les captures, el punt de partida de cada braç. A la sèrie,
    `--envelliment [--mons N]` dona els N primers mons de la llista (180 per defecte), i `--comprova --maquina pc|vm` i
    `--comprova-captures --maquina pc|vm` només miren les captures dels mons de la llista d'aquella màquina.
  - **La potència de la sèrie de la maduració:** `node eines/potencia-maduracio.mjs`, amb el món com a unitat. Amb `--familia`,
    les dues proves de la sèrie amb Holm i els llindars calibrats, i amb `--validesa`, l'error de tipus I de cada prova.
  - **Els llindars calibrats de la sèrie** (AUD-128, AU2-94): `node eines/llindars-maduracio.mjs --calcula|--comprova [--fins
    M]|--validesa|--suprem`. La taula, `fase2/maduracio-llindars.json`, va amb l'etiqueta i no es torna a calcular.
    - **La certificació** (AU2-99): `--certifica` escriu la cota superior rigorosa de cada llindar a
      `fase2/maduracio-llindars-certificat.json`, i `--comprova-certificat [--fins M]` la comprova. La SHA-256 de la taula
      certificada és fixada a `fase2/maduracio-serie.mjs` (`THRESHOLDS_SHA256`): cap altra taula no serveix per decidir. La
      preparació de la sèrie torna a calcular el certificat sencer, i abans de l'etiqueta es passa `--comprova-certificat` a la
      còpia que s'etiquetarà (auditoria 22).
  - **L'anàlisi del pilot de la maduració** (exploratòria): `node eines/maduracio-analisi.mjs [carpeta]`, escrita abans de cap
    resultat. Només quan hi ha les 220 branques; si en falta cap, no en llegeix cap. Valida el registre i el simulador de cadascuna.
- La prova preregistrada dels zeros (`docs/protocol-zeros.md`): `node fase2/zeros-confirmacio.mjs --decideix|--prova COMMIT
  [--serie manifest.json] carpeta`, amb el manifest de `node eines/pilot.mjs zeros --prepara`. Com a B2, la decisió només es
  pren des d'una còpia del commit de l'etiqueta (`preregistre-zeros`), i cap branca no es llança abans de l'ancoratge del
  segell a Bitcoin.
- La sèrie preregistrada de la maduració (`docs/protocol-maduracio.md`): `node fase2/maduracio-confirmacio.mjs --decideix|--prova
  COMMIT [--serie manifest.json] carpeta`, amb el manifest de `node eines/pilot.mjs serie --prepara`. La prova és la permutació de
  signes exacta, amb els llindars de Holm calibrats per *m* de la taula, i la decisió només es pren des d'una còpia del commit de
  l'etiqueta (`preregistre-maduracio`), com als zeros. Les branques no desen captures: si cal alguna, es regenera amb l'ordre de
  la branca del manifest, i només és bona si en surten els mateixos censos i la mateixa empremta final.
  - **`--prova`** no llegeix cap registre de la sèrie (AU2-98, AUD-132): ni pels àlies dels fitxers, ni amb un manifest que digui
    un altre `dir`, ni des d'una altra còpia del repositori, ni en una còpia dels fitxers, i no s'executa en una còpia on la sèrie
    ja té registres. D'un registre en llegeix primer, byte a byte, la primera línia no buida, i ni un byte més (AU2-100,
    AUD-133). Es nega si l'ordre de la branca l'escriu a la carpeta de la sèrie, o si no hi ha cap línia d'inici sencera en els
    primers 64 KiB. Les proves amb dades sintètiques, amb una altra carpeta a les ordres. **Des de l'etiqueta fins a la
    decisió, cap `--prova`**, i els registres només es copien a la carpeta del commit de l'etiqueta.
  - **L'etiqueta** (`preregistre-maduracio`, a `416f720`, 01-11-2026): l'objecte i el segell, a `docs/preregistre-maduracio/`.
    La sèrie va córrer de l'1 al 4-11-2026, llançada amb una còpia corregida de `eines/llanca-lot.sh`, fora del repositori: el de
    `416f720` rebutjava les llistes de més de 64 KB (l'acta, la incidència 1).
  - **La decisió** (04-11-2026, l'entrada 14): es rebutgen totes dues hipòtesis nul·les. La sortida, a
    `fase2/resultats/maduracio/serie/decisio-sortida.txt`. Es reprodueix byte a byte des d'una còpia de l'etiqueta, amb els registres de
    `main` copiats a la carpeta de la sèrie. Tots dos auditors la van confirmar a l'auditoria 27. La mesura és l'establiment: la vida
    «s'hi estableix», mai «hi neix» (AUD-171 = AU2-138).
- La fragilitat del món (AUD-107, exploratòria): `node eines/fragilitat.mjs`, amb el pla, escrit abans de calcular, i
  els resultats a `fase2/resultats/b2/fragilitat/`. No simula res.
- El registre de famílies, amb els trossos informatius (AUD-162): `createFamilyTracker(llavor, { minDistinct: 3 })` només fa
  servir els trossos de codi amb almenys 3 instruccions diferents. Per defecte, 1, com sempre: el cens i les sèries no canvien.
  La sensibilitat (exploratòria): `node eines/nuclis-sensibilitat.mjs clau|mon ...`, amb el pla, escrit abans de calcular, i
  els resultats a `fase2/resultats/nuclis/`. No simula res.
- B1, les ablacions de la química (`docs/pla-b1.md`), el nivell 1: `node eines/densitat.mjs --quimica C0|K0|… --distribucio
  d-mig|uniforme --llavor N --programes N --json fitxer.jsonl [--de I] [--fils F]`, i l'anàlisi, `node eines/densitat-analisi.mjs
  carpeta`. Les químiques són a `fase1/bff.js` (`CHEMISTRIES` i `evaluator`), i C0 és l'intèrpret de sempre. La prova de
  replicació és la del cens, amb la mateixa química (l'opció `evaluate` de `replicationTest`, AUD-65). El pla v0.4 té el GO de les
  auditories 25 i 26. El nivell 1 es va calcular el 4 i el 5-11-2026 (l'entrada 15), i l'ampliació no va caldre. L'auditoria 27 el
  va revisar. El pas següent (la prova d'autonomia, la §13 i les variants per cap) va en una PR, amb el pla v0.5 i l'auditoria 28
  abans de calcular.
  - **L'anàlisi només es fa amb el pla sencer** (`PLAN`: les 13 químiques amb `d-mig`, C0 i K0 amb `uniforme`, la llavor 20261101 i
    les N del pla), i amb registres fets amb els mòduls de la seva còpia (la SHA-256 de la línia d'inici; AUD-139, AUD-142).
  - **Els controls** són K0, L0 i X0. S4 és una variant: el codi del company s'hi pot copiar el programa (AUD-140).
  - **La cobertura de l'interval del quocient:** `node eines/densitat-cobertura.mjs`, amb recomptes sintètics.
  - **Les ordres del càlcul,** escrites abans de calcular, són a `fase2/resultats/b1/nivell1/`: `llista.txt`, i `llista-ampliacio.txt`
    si cal l'ampliació, amb les SHA-256 al README. Les executa `bash fase2/resultats/b1/nivell1/executa.sh LLISTA SHA-256 COMMIT`,
    des de l'arrel d'una còpia neta. Mentre corren, cap recompte: només l'estat de l'executor.
  - **A la còpia del càlcul, cap fitxer de codi sense seguir** mentre hi corri res: `eines/densitat.mjs` hi escriuria `+canvis`, i
    l'anàlisi en rebutjaria els registres (el primer intent de la repetició, `fase2/resultats/b1/nivell1/repeticio/README.md`).
  - **Els registres del nivell 1 no són a git:** dos passen de 50 MB. Són a la còpia de seguretat, amb la SHA-256 a
    `execucio-llista.txt`, i es poden refer amb les mateixes ordres. La repetició de tres trossos (`repeticio/`, amb `compara.mjs`), la
    sortida de l'anàlisi (`analisi.txt`), les comprovacions exploratòries (`exploratori/`) i l'extracte dels hereditaris
    (`hereditaris.jsonl.gz`, amb `extreu-hereditaris.mjs`; AUD-174) sí que hi són.
- Anàlisi d'una captura: `node fase2/analitza.mjs fitxer.bin` (prova de replicació i registre de famílies).
- Imatges per al README i el quadern: `node eines/imatges.mjs sopa|mon|codi|animacio|km ...`, a partir de les
  captures, sense dependències (PNG i PNG animat amb `eines/png.mjs`). Les del README són a `docs/imatges/`, i
  cada imatge ha de dir d'on surt (quina captura, quina llavor, quina època), a `docs/imatges/README.md`.
  - **Els exemples:** quan una imatge compara condicions, es trien a l'atzar amb una llavor declarada
    (`node eines/tria.mjs LLAVOR N elements...`), no els que es veuen bé.
  - **Les afirmacions dels peus** es comproven amb dades abans de publicar-les.
- El lloc web (`web/`, sense dependències): la portada, en català i en anglès, l'explorador 3D (WebGL2), la vista 2D i el
  món en viu (`web/viu/`). Fa servir els fitxers del simulador (`fase1/`, `fase2/`): s'ha de servir amb l'arrel del repositori.
  - **El món en viu** corre al navegador amb `web/js/viu-motor.js`, el mateix ordre de passos que `sim.mjs`, i el cens v3 de
    `fase2/census.js`: cada cens en dona l'empremta i l'ordre de `sim.mjs` que fa el mateix món (`test/web.mjs` ho comprova).
    No hi ha cap botó per plantar replicadors.
  - **La cinta de la portada:** bytes de dues cel·les reals, que s'executen amb `fase1/bff.js`. Es trien i se'n comproven les
    xifres del peu amb `node eines/web-cinta.mjs captura.bin web/dades/1006 3500 20261030` (`web/img/README.md`).
  - **Els colors** són fitxes de `web/css/estil.css`, amb un tema clar i un de fosc (per defecte, el del sistema); els dibuixos
    les llegeixen amb `web/js/tema.js`. El color és de les dades: la interfície va en tinta. Les dades diuen la posició de
    cada família a la paleta, no el color. Les imatges de `web/img/` diuen d'on surten (`web/img/README.md`), i es tornen a
    fer, byte a byte, amb `node eines/web-imatges.mjs --chrome CAMI-DE-CHROME --sortida carpeta` i el servidor engegat.
  - **Les dades de cada món:** `node eines/web-dades.mjs web/dades/ID/fitxa.json carpeta-de-captures`, a partir de les
    captures d'una execució amb `--save-every` (l'ordre és a la fitxa). Només les escriu si la història és la del registre:
    les SHA-256 de les captures (`docs/captures.sha256`) i els censos i l'empremta de la sèrie. No van a git.
  - **Els mons, com les imatges:** il·lustratius i declarats com a tals, o triats a l'atzar amb una llavor declarada, i
    cadascun amb la proporció de la seva sèrie. Cap resultat d'una sèrie abans de la seva decisió.
- Documents per a qui arriba de fora: `README.en.md` (cal posar-lo al dia quan canviï el README), `docs/reproduir.md`
  (receptes comprovades), `docs/glossari.md`, `CITATION.cff`, `CONTRIBUTING.md` i `LICENSE-data.md`. Al
  README, la revisió és "de dos auditors d'IA", mai "externa" sense dir-ho.
- Captures clau: `docs/captures.sha256` i `docs/captures.md`; còpia amb `bash eines/arxiva-captures.sh`.
- Llistes d'experiments: `bash eines/experiments.sh N carpeta < llista` (cada línia: `nom arguments-de-sim.mjs`).
  Els lots llargs es llancen amb `bash eines/llanca-lot.sh N carpeta llista`, que escriu el progrés només a
  `carpeta/lot-<llista>.out`, mai a la consola. Una consola de Windows en mode de selecció atura el lot.
  - **Separar-lo de la sessió:** a la VM, `(nohup bash eines/llanca-lot.sh ... > /dev/null 2>&1 &)`; al PC,
    `Start-Process -WindowStyle Hidden` amb `bash eines/llanca-lot.sh ...`.
  - **Abans de començar,** el lot comprova la llista: almenys un experiment i cap nom repetit, amb 1 a 16
    experiments alhora. Si no, surt amb el codi 2. Un experiment amb `--json` només es dona per fet si
    el JSONL és complet (la línia d'inici, amb la llavor, i la final). La línia final del lot diu
    `lot acabat` o `lot interromput (codi N)`.
  - **Seguiment:** `bash eines/seguiment.sh [--agregat] carpeta` només compta experiments (l'últim estat de
    cadascun) i comprova que els registres siguin complets. Durant una sèrie no es miren resultats
    parcials. A les sèries confirmatòries, amb `--agregat` (sense noms) i amb noms opacs a les llistes
    (AUD-57).
  - **Experiments de branca:** `node sim.mjs ... --from captura.bin --start EPOCA` continua un món desat.
- Màquina virtual de laboratori: l'accés (adreça, usuari i clau) és a `CLAUDE.local.md` i a `eines/local.env`,
  que no van a git. Cada commit desplegat és a `~/claude-origins-<commit>` (`~/claude-origins` és el desplegament antic, amb
  els resultats de la sèrie exploratòria). La VM no té `npm`: les proves s'hi executen una per una amb
  `node`, en l'ordre de `package.json`. Els lots es llancen amb `nohup`, entre parèntesis, perquè la
  sessió SSH no es quedi penjada. cubff (l'oracle de l'intèrpret) és a `~/cubff`: vegeu
  `eines/cubff/README.md`.
- Servidor local: `node server.mjs` (port 8420; configuració "sopa" a `.claude/launch.json`).

## Git i traçabilitat

- Repositori privat: `git@github.com:xavig-icv/genesis.git` (branca `main`), amb una clau de
  desplegament pròpia (configurada a `core.sshCommand`; vegeu `CLAUDE.local.md`).
- **Dades internes, només en local.** Les adreces, els noms de les claus, els camins de la màquina i les
  còpies de seguretat van a `CLAUDE.local.md` i a `eines/local.env` (a `.gitignore`), mai al repositori. Les
  auditories (`../auditories/`) tampoc no es publiquen. Abans de cada commit que toqui documentació o eines,
  comproveu-ho amb `git grep` de l'adreça de la VM.
- Un commit per cada canvi amb sentit (una llei, una correcció, una entrada del quadern), amb missatges
  en català que expliquin el perquè.
- Els canvis al simulador (`sim.mjs`, `fase1/bff.js`, `fase1/soup.js`, `fase2/world.js`) i a les eines
  d'anàlisi van en una branca i es revisen en una *pull request* abans d'entrar a `main`. El quadern, la
  documentació i els registres poden anar directament a `main`.
- Cada registre d'experiment comença amb `codi=<commit>`: si diu `+canvis`, el codi no estava desat.
  Abans d'un experiment llarg, fes commit del codi.
- La màquina virtual rep el codi amb `bash eines/desplega-vm.sh`, que copia exactament el commit actual a
  `~/claude-origins-<commit>` i hi deixa el fitxer `VERSIO`. Un lot s'executa sempre des de la carpeta
  del seu commit.
- Les captures `.bin` no van a git (vegeu `.gitignore`): es regeneren amb el mateix commit i llavor.
- Llicència: Apache 2.0 per al codi (`LICENSE`, `NOTICE` amb els crèdits) i CC BY 4.0 per al quadern i la
  documentació (`LICENSE-docs.md`). El repositori es farà públic quan s'acabi la revisió d'abans d'obrir-lo (T-13,
  05-11-2026; `docs/disseny.md`), amb la història tal com és, que encara conté l'adreça privada de la VM. Obrir-lo és cosa del
  responsable.
- Auditories externes iteratives a `../auditories/claude-origins/auditor1/auditN/`. En acabar cada grup
  de tasques, deixa-hi un `informe-de-traspas.md` (commits, estat de cada troballa AUD-xx, què cal
  revisar). Quan arribi l'informe de l'auditor, comprova'n les afirmacions amb dades i respon a
  `resposta-equip.md`. Les troballes conserven l'identificador entre auditories. Cada troballa nova, amb una
  línia i la resolució, va a l'índex públic `docs/auditories.md`, sense cap dada interna.
  - **Mentre una auditoria és oberta** (del paquet als informes), `main` no es toca: els merges, després dels informes. Així
    `main` és el que diu el traspàs.
- El protocol de la sèrie confirmatòria (`docs/protocol-estadistic.md`) no es llança fins que l'auditoria
  l'hagi revisat.

## Regles del projecte (vegeu `docs/disseny.md`)

- Dissenyem les lleis, mai els organismes: res de replicadors inicials ni de premis per copiar-se.
- Un canvi cada vegada, comparat amb el grup de control (la Fase 1).
- Comprovar les hipòtesis amb dades abans d'afirmar-les. Quan ens equivoquem, ho corregim al quadern
  sense esborrar el que havíem dit.
- Cada resultat important va al quadern, i cada decisió de disseny, a `docs/disseny.md`.
- Els registres dels experiments van a `*/resultats/`. Els fitxers `.bin` són captures de la sopa o del
  món (8 MB cadascun).
- Per provar la interfície es pot plantar un replicador des de la consola, però mai en un experiment.
