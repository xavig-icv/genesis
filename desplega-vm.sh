#!/usr/bin/env bash
# Copia el codi de la simulació, tal com és al commit actual, a la màquina virtual de
# laboratori, i hi deixa el fitxer VERSIO amb el commit (sim.mjs l'escriu a cada registre).
# Ús: bash desplega-vm.sh
set -euo pipefail
cd "$(dirname "$0")"
HOST="${VM:-claude@192.168.171.3}"
KEY="${VM_KEY:-$HOME/.ssh/claude_origins_vm}"
if [[ -n "$(git status --porcelain -- '*.js' '*.mjs' '*.sh')" ]]; then
  echo "Hi ha canvis al codi sense commit: fes-ne el commit abans de desplegar." >&2
  exit 1
fi
HASH=$(git rev-parse --short HEAD)
git archive HEAD package.json sim.mjs experiments.sh fase1 fase2 \
  | ssh -i "$KEY" -o BatchMode=yes "$HOST" "mkdir -p ~/claude-origins && tar xf - -C ~/claude-origins && echo $HASH > ~/claude-origins/VERSIO && echo desplegat $HASH"
