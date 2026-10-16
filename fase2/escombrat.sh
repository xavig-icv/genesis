#!/usr/bin/env bash
# Escombrat de la llei 2 (corrents): executa una llista d'experiments, N alhora.
# Reprodueix la sèrie exploratòria de les entrades 4 i 6, que es va fer amb el generador v1 i el cens
# v2: per això els fixa (AUD-29 de l'auditoria 2), i tots els registres amb aquest nom són de la
# mateixa versió. Per a sèries noves, feu servir experiments.sh amb una llista pròpia.
# Cada línia de la llista és "barreja llavor". Ús:
#   bash fase2/escombrat.sh 3 <<'EOF'
#   0.001 1
#   0.01 2
#   EOF
# AFTER=300 bash fase2/escombrat.sh 3 < llista   (èpoques a seguir després de la transició)
set -euo pipefail
cd "$(dirname "$0")/.."
PARALLEL="${1:-3}"
export AFTER="${AFTER:-1000}"
mkdir -p fase2/resultats

run_one() {
  local mixing="$1" seed="$2"
  local log="fase2/resultats/corrent-m${mixing}-llavor-${seed}.log"
  if [[ -s "$log" ]] && grep -q "empremta del món" "$log"; then
    echo "ja fet: m=${mixing} llavor=${seed}"
    return
  fi
  echo "comença: m=${mixing} llavor=${seed}"
  node sim.mjs --world 512x256 --seed "$seed" --mixing "$mixing" --epochs 16000 \
    --every 100 --census 250 --after "$AFTER" --save-every 4000 --save fase2/resultats --rng v1 --census-version v2 > "$log" 2>&1
  echo "acaba:   m=${mixing} llavor=${seed}"
}
export -f run_one

grep -v '^\s*$' | xargs -P "$PARALLEL" -L 1 bash -c 'run_one "$0" "$1"'
