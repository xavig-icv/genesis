# claude-origins

Projecte d'abiogènesi digital. La visió, els principis i les decisions són a `docs/disseny.md`, i els
resultats dels experiments al quadern (`quadern/index.html`). Llegeix-los abans de proposar canvis.

## Convencions

- Parla amb l'usuari en català. La interfície, la documentació i els comentaris del codi són en català;
  els identificadors del codi, en anglès.
- JavaScript amb mòduls ES, sense dependències ni pas de compilació. Node 16 a Windows: els scripts
  per a Node s'anomenen `.mjs` o depenen del `"type": "module"` del `package.json`.
- Proves: `npm test` (intèrpret, món, línia d'ordres, servidor i regressió del determinisme). Han de
  passar totes abans de donar res per acabat. Les empremtes de `test/determinisme.mjs` no es toquen
  mai: si un canvi ha d'alterar les històries a propòsit, va darrere d'una opció nova.
- Experiments llargs sense gràfics: `node sim.mjs` (sopa) o `node sim.mjs --world 512x256` (món 2D).
  Les opcions es validen estrictament (`node sim.mjs --help`).
- Generador aleatori: v2 (xoshiro128\*\*) per defecte. Tots els experiments anteriors a l'auditoria 1
  es van fer amb v1 (mulberry32): per reproduir-los, `--rng v1`.
- Prova de replicació: només la de `fase2/replication.js`. No n'escriguis cap altra (AUD-02).
- Anàlisi d'una captura: `node fase2/analitza.mjs fitxer.bin` (prova de replicació i registre de famílies).
- Captures clau: `captures.sha256` i `docs/captures.md`; còpia amb `bash arxiva-captures.sh`.
- Llistes d'experiments: `bash experiments.sh N carpeta < llista` (cada línia: `nom arguments-de-sim.mjs`).
  Experiments de branca: `node sim.mjs ... --from captura.bin --start EPOCA` continua un món desat.
- Màquina virtual de laboratori: `ssh -i ~/.ssh/claude_origins_vm claude@192.168.171.3` (Git Bash), amb el
  projecte a `~/claude-origins`. Escombrats: `bash fase2/escombrat.sh N < llista` (llançar amb `nohup`,
  entre parèntesis, perquè la sessió SSH no es quedi penjada).
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
- La màquina virtual rep el codi amb `bash desplega-vm.sh`, que copia exactament el commit actual i
  deixa el fitxer `VERSIO`. No despleguis mentre hi corre un lot: barrejaria versions.
- Les captures `.bin` no van a git (vegeu `.gitignore`): es regeneren amb el mateix commit i llavor.
- Abans de fer públic el repositori: llicència, crèdit a Agüera y Arcas et al. (2024) i treure'n les
  dades internes (IP de la màquina virtual, camins locals).

## Regles del projecte (vegeu `docs/disseny.md`)

- Dissenyem les lleis, mai els organismes: res de replicadors inicials ni de premis per copiar-se.
- Un canvi cada vegada, comparat amb el grup de control (la Fase 1).
- Comprovar les hipòtesis amb dades abans d'afirmar-les. Quan ens equivoquem, ho corregim al quadern
  sense esborrar el que havíem dit.
- Cada resultat important va al quadern, i cada decisió de disseny, a `docs/disseny.md`.
- Els registres dels experiments van a `*/resultats/`. Els fitxers `.bin` són captures de la sopa o del
  món (8 MB cadascun).
- Per provar la interfície es pot plantar un replicador des de la consola, però mai en un experiment.
