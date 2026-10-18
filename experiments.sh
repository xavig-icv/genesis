#!/usr/bin/env bash
# Executa una llista d'experiments de sim.mjs, N alhora. Cada línia de la llista és
#   nom  arguments de sim.mjs
# i el registre va a <carpeta>/<nom>.log. Les línies que ja tenen el registre complet se salten.
# Per a cada experiment escriu "comença:", i en acabar "acaba:" o, si sim.mjs surt amb error,
# "falla:" amb el codi de sortida (el registre queda incomplet i es torna a fer en rellançar el lot).
# Ús:
#   bash experiments.sh 3 fase3/resultats < llista.txt
# Per a lots llargs, feu servir llanca-lot.sh, que escriu el progrés en un fitxer i no a la consola.
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
  local rc=0
  node sim.mjs "$@" > "$log" 2>&1 || rc=$?
  if [[ $rc -eq 0 ]]; then
    echo "acaba:   $name"
  else
    echo "falla:   $name (codi $rc)"
  fi
}
export -f run_one

grep -v '^\s*$' | grep -v '^#' | xargs -P "$PARALLEL" -L 1 bash -c 'run_one "$@"' _
