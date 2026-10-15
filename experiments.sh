#!/usr/bin/env bash
# Executa una llista d'experiments de sim.mjs, N alhora. Cada línia de la llista és
#   nom  arguments de sim.mjs
# i el registre va a <carpeta>/<nom>.log. Les línies que ja tenen el registre complet se salten.
# Ús:
#   bash experiments.sh 3 fase3/resultats < llista.txt
set -euo pipefail
cd "$(dirname "$0")"
PARALLEL="${1:-3}"
export OUT="${2:-resultats}"
mkdir -p "$OUT"

run_one() {
  local name="$1"; shift
  local log="$OUT/$name.log"
  if [[ -s "$log" ]] && grep -q "empremta del món" "$log"; then
    echo "ja fet: $name"
    return
  fi
  echo "comença: $name"
  node sim.mjs "$@" > "$log" 2>&1
  echo "acaba:   $name"
}
export -f run_one

grep -v '^\s*$' | grep -v '^#' | xargs -P "$PARALLEL" -L 1 bash -c 'run_one "$@"' _
