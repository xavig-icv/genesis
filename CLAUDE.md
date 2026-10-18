# claude-origins

Projecte d'abiogènesi digital. La visió, els principis i les decisions són a `docs/disseny.md`, i els
resultats dels experiments al quadern (`quadern/index.html`). Llegeix-los abans de proposar canvis.

## Convencions

- Parla amb l'usuari en català. La interfície, la documentació i els comentaris del codi són en català;
  els identificadors del codi, en anglès.
- JavaScript amb mòduls ES, sense dependències ni pas de compilació. Node 16 a Windows: els scripts
  per a Node s'anomenen `.mjs` o depenen del `"type": "module"` del `package.json`.
- Proves: `npm test` (intèrpret, món i cens, línia d'ordres, lots d'experiments, servidor, estadística,
  oracle de cubff i regressió del determinisme; necessita `bash`, Git Bash a Windows). Han de passar totes abans de donar res per acabat. Les empremtes de
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
- Estadística de la sèrie confirmatòria: `node fase2/estadistica.mjs --etapa 1|2 carpeta-A carpeta-B`, que valida
  els JSONL contra el manifest `fase2/serie-llei2.json` i aplica la decisió; sense `--etapa`, informe descriptiu.
  El manifest, el criteri d'establiment i els límits no es toquen després del preregistre.
  Protocol: `docs/protocol-estadistic.md`.
- Anàlisi d'una captura: `node fase2/analitza.mjs fitxer.bin` (prova de replicació i registre de famílies).
- Captures clau: `captures.sha256` i `docs/captures.md`; còpia amb `bash arxiva-captures.sh`.
- Llistes d'experiments: `bash experiments.sh N carpeta < llista` (cada línia: `nom arguments-de-sim.mjs`).
  Els lots llargs es llancen amb `bash llanca-lot.sh N carpeta llista`, que escriu el progrés només a
  `carpeta/lot-<llista>.out`, mai a la consola. Una consola de Windows en mode de selecció atura el lot.
  - **Separar-lo de la sessió:** a la VM, `(nohup bash llanca-lot.sh ... > /dev/null 2>&1 &)`; al PC,
    `Start-Process -WindowStyle Hidden` amb `bash llanca-lot.sh ...`.
  - **Seguiment:** `bash seguiment.sh carpeta` només compta experiments i comprova que els registres
    siguin complets. Durant una sèrie no es miren resultats parcials.
  - **Experiments de branca:** `node sim.mjs ... --from captura.bin --start EPOCA` continua un món desat.
- Màquina virtual de laboratori: `ssh -i ~/.ssh/claude_origins_vm claude@192.168.171.3` (Git Bash). Cada
  commit desplegat és a `~/claude-origins-<commit>` (`~/claude-origins` és el desplegament antic, amb
  els resultats de la sèrie exploratòria). La VM no té `npm`: les proves s'hi executen una per una amb
  `node`, en l'ordre de `package.json`. Els lots es llancen amb `nohup`, entre parèntesis, perquè la
  sessió SSH no es quedi penjada. cubff (l'oracle de l'intèrpret) és a `~/cubff`: vegeu
  `eines/cubff/README.md`.
- Servidor local: `node server.mjs` (port 8420; configuració "sopa" a `.claude/launch.json`).

## Git i traçabilitat

- Repositori privat: `git@github.com:xavig-icv/genesis.git` (branca `main`), amb una clau de
  desplegament pròpia (`~/.ssh/claude_origins_github`, configurada a `core.sshCommand`).
- Un commit per cada canvi amb sentit (una llei, una correcció, una entrada del quadern), amb missatges
  en català que expliquin el perquè.
- Els canvis al simulador (`sim.mjs`, `fase1/bff.js`, `fase1/soup.js`, `fase2/world.js`) i a les eines
  d'anàlisi van en una branca i es revisen en una *pull request* abans d'entrar a `main`. El quadern, la
  documentació i els registres poden anar directament a `main`.
- Cada registre d'experiment comença amb `codi=<commit>`: si diu `+canvis`, el codi no estava desat.
  Abans d'un experiment llarg, fes commit del codi.
- La màquina virtual rep el codi amb `bash desplega-vm.sh`, que copia exactament el commit actual a
  `~/claude-origins-<commit>` i hi deixa el fitxer `VERSIO`. Un lot s'executa sempre des de la carpeta
  del seu commit.
- Les captures `.bin` no van a git (vegeu `.gitignore`): es regeneren amb el mateix commit i llavor.
- Llicència: Apache 2.0 per al codi (`LICENSE`, `NOTICE` amb els crèdits) i CC BY 4.0 per al quadern i la
  documentació (`LICENSE-docs.md`). Abans de fer públic el repositori, cal treure-hi les
  dades internes (IP de la màquina virtual, camins locals).
- Auditories externes iteratives a `../auditories/claude-origins/auditor1/auditN/`. En acabar cada grup
  de tasques, deixa-hi un `informe-de-traspas.md` (commits, estat de cada troballa AUD-xx, què cal
  revisar). Quan arribi l'informe de l'auditor, comprova'n les afirmacions amb dades i respon a
  `resposta-equip.md`. Les troballes conserven l'identificador entre auditories.
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
