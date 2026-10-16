#!/usr/bin/env bash
# Copia el codi de la simulació, tal com és al commit actual, a la màquina virtual de laboratori, en
# una carpeta pròpia d'aquell commit (~/claude-origins-<commit>), i hi deixa el fitxer VERSIO amb el
# commit (sim.mjs l'escriu a cada registre).
#
# Una carpeta per commit (AUD-22 de l'auditoria 1): abans es copiava sempre a ~/claude-origins, i un
# desplegament fet mentre corria un lot hauria barrejat versions. Ara cada lot s'executa des de la
# carpeta del seu commit, i un commit ja desplegat no es torna a copiar. També hi van les proves, el
# servidor, la portada i el quadern, perquè npm test hi passi sencer (la VM no té npm: les proves
# s'hi executen una per una amb node, en el mateix ordre que a package.json).
# Ús: bash desplega-vm.sh
set -euo pipefail
cd "$(dirname "$0")"
HOST="${VM:-claude@192.168.171.3}"
KEY="${VM_KEY:-$HOME/.ssh/claude_origins_vm}"
if [[ -n "$(git status --porcelain -- '*.js' '*.mjs' '*.sh' 'test/fixtures')" ]]; then
  echo "Hi ha canvis al codi sense commit: fes-ne el commit abans de desplegar." >&2
  exit 1
fi
HASH=$(git rev-parse --short HEAD)
DIR="claude-origins-$HASH"
if ssh -i "$KEY" -o BatchMode=yes "$HOST" "test -e ~/$DIR"; then
  echo "ja desplegat: ~/$DIR"
  exit 0
fi
git archive HEAD package.json sim.mjs server.mjs index.html experiments.sh fase1 fase2 quadern test \
  | ssh -i "$KEY" -o BatchMode=yes "$HOST" "mkdir ~/$DIR && tar xf - -C ~/$DIR && echo $HASH > ~/$DIR/VERSIO && echo desplegat a ~/$DIR"
