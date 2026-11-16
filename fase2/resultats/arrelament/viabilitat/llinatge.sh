#!/usr/bin/env bash
# Exploratori (la prova de viabilitat del pilot de l'aparició i l'arrelament): el llinatge de les 90 branques, en 8 trossos alhora,
# després de calcular-les i de desar-ne els registres a git (el README d'aquesta carpeta, el punt 6). Des de l'arrel de la còpia neta:
#   bash fase2/resultats/arrelament/viabilitat/llinatge.sh COMMIT
# Cada tros, un procés de node amb la prioritat del llançador; la consola, a llinatge/tros-K.err. El codi de sortida de cada tros es
# desa just després de l'ordre. El que passa, a llinatge/llinatge.log.
set -u
commit=${1:-}
[ -n "$commit" ] || { echo "Ús: bash fase2/resultats/arrelament/viabilitat/llinatge.sh COMMIT" >&2; exit 2; }
[ -f sim.mjs ] || { echo "cal llançar-lo des de l'arrel de la còpia" >&2; exit 2; }
head=$(git rev-parse HEAD) || exit 2
case "$head" in "$commit"*) ;; *) echo "la còpia és a $head, i no a $commit" >&2; exit 2;; esac
[ -z "$(git status --porcelain -- '*.js' '*.mjs')" ] || { echo "hi ha fitxers de codi amb canvis o sense seguir" >&2; exit 2; }
dir=fase2/resultats/arrelament/viabilitat
mkdir -p "$dir/llinatge" || exit 2
logf="$dir/llinatge/llinatge.log"
log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$logf"; }
tros() {
  local k=$1 codi
  log "comença el tros $k/8"
  node "$dir/llinatge.mjs" --tros "$k/8" 2> "$dir/llinatge/tros-$k.err"
  codi=$?
  log "acaba el tros $k/8: codi $codi"
}
log "comença: codi $head, $(node --version)"
for k in 0 1 2 3 4 5 6 7; do tros "$k" & done
wait
n=$(ls "$dir"/llinatge/*.jsonl 2>/dev/null | wc -l)
log "acabat: $n llinatges"
