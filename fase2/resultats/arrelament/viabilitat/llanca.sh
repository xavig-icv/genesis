#!/usr/bin/env bash
# Exploratori (la prova de viabilitat del pilot de l'aparició i l'arrelament): el llançador de les branques (el README d'aquesta carpeta,
# el punt 7). Des de l'arrel d'una còpia neta:
#   bash fase2/resultats/arrelament/viabilitat/llanca.sh LLISTA COMMIT [PROCESSOS]
# LLISTA: cada línia, «ID arguments-de-sim.mjs» (llista.txt o prova/llista.txt). Una branca, un procés de node, amb la prioritat del
# llançador. El registre és el JSONL de l'ordre (--json); la consola, ID.log i ID.err al costat. Un registre es dona per bo només si el
# codi de sortida és 0 (desat just després de l'ordre) i el JSONL acaba amb la línia final; si no, el JSONL i la consola es guarden a
# interromputs/ i el registre del llançador ho diu. Les branques que ja tenen el registre sencer, se les salta. El que passa, a
# llanca.log, al costat dels registres.
set -u
llista=${1:-}; commit=${2:-}; max=${3:-8}
if [ -z "$llista" ] || [ -z "$commit" ]; then
  echo "Ús: bash fase2/resultats/arrelament/viabilitat/llanca.sh LLISTA COMMIT [PROCESSOS]" >&2; exit 2
fi
[ -f sim.mjs ] || { echo "cal llançar-lo des de l'arrel de la còpia" >&2; exit 2; }
[ -f "$llista" ] || { echo "no trobo $llista" >&2; exit 2; }
case "$max" in ''|*[!0-9]*) echo "PROCESSOS ha de ser un nombre" >&2; exit 2;; esac
[ "$max" -ge 1 ] && [ "$max" -le 16 ] || { echo "PROCESSOS, d'1 a 16" >&2; exit 2; }
head=$(git rev-parse HEAD) || exit 2
case "$head" in "$commit"*) ;; *) echo "la còpia és a $head, i no a $commit" >&2; exit 2;; esac
[ -z "$(git status --porcelain -- '*.js' '*.mjs')" ] || { echo "hi ha fitxers de codi amb canvis o sense seguir" >&2; exit 2; }

# El JSONL de cada branca, de l'ordre; cap identificador repetit
ids=(); declare -A jsonOf argsOf
while read -r id args; do
  [ -z "$id" ] && continue
  [ -n "${jsonOf[$id]:-}" ] && { echo "l'identificador $id és repetit" >&2; exit 2; }
  json=$(printf '%s\n' "$args" | sed -n 's/.*--json \([^ ]*\).*/\1/p')
  [ -n "$json" ] || { echo "$id: l'ordre no té --json" >&2; exit 2; }
  from=$(printf '%s\n' "$args" | sed -n 's/.*--from \([^ ]*\).*/\1/p')
  [ -f "$from" ] || { echo "$id: falta la captura $from" >&2; exit 2; }
  ids+=("$id"); jsonOf[$id]=$json; argsOf[$id]=$args
done < "$llista"
[ "${#ids[@]}" -ge 1 ] || { echo "la llista és buida" >&2; exit 2; }
sortida=$(dirname "${jsonOf[${ids[0]}]}")
mkdir -p "$sortida/interromputs" || exit 2
logf="$sortida/llanca.log"
log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$logf"; }
complet() { [ -f "$1" ] && tail -n 1 "$1" | grep -q '"type":"end"'; }

run_one() {
  local id=$1 json=${jsonOf[$1]} codi
  log "comença $id"
  # shellcheck disable=SC2086
  node sim.mjs ${argsOf[$id]} > "$sortida/$id.log" 2> "$sortida/$id.err"
  codi=$?
  if [ "$codi" -eq 0 ] && complet "$json"; then
    log "acaba $id: bé (codi $codi)"
  else
    local t; t=$(date '+%Y%m%d%H%M%S')
    [ -f "$json" ] && mv "$json" "$sortida/interromputs/$id-$t.jsonl"
    mv "$sortida/$id.log" "$sortida/interromputs/$id-$t.log"; mv "$sortida/$id.err" "$sortida/interromputs/$id-$t.err"
    log "acaba $id: MALAMENT (codi $codi); el registre i la consola, a interromputs/"
  fi
}

log "comença: $llista, codi $head, $(node --version), $max processos alhora, ${#ids[@]} branques"
for id in "${ids[@]}"; do
  json=${jsonOf[$id]}
  if complet "$json"; then log "$id ja és feta"; continue; fi
  if [ -f "$json" ]; then
    t=$(date '+%Y%m%d%H%M%S'); mv "$json" "$sortida/interromputs/$id-$t.jsonl"
    log "$id tenia un registre interromput: guardat a interromputs/"
  fi
  while [ "$(jobs -rp | wc -l)" -ge "$max" ]; do wait -n; done
  run_one "$id" &
done
wait
ok=0
for id in "${ids[@]}"; do complet "${jsonOf[$id]}" && ok=$((ok + 1)); done
if [ "$ok" -eq "${#ids[@]}" ]; then log "acabat: $ok de ${#ids[@]} branques, totes bé"; else log "acabat amb fallades: $ok de ${#ids[@]} branques bé"; fi
