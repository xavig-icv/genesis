#!/usr/bin/env bash
# Exploratori (la maduració, pas 3): el llançador del càlcul (el README d'aquesta carpeta). Des de l'arrel d'una còpia neta:
#   bash fase2/resultats/maduracio/durada/llanca.sh CARPETA-DEL-1034 COMMIT SORTIDA [PROCESSOS] [EPOCA...]
# Sense èpoques, les 33 dels tres trams (EPOCHS, a durada.mjs). Una època, un procés de node, amb la prioritat del llançador: el registre,
# a SORTIDA/durada-E.jsonl, i la consola, a SORTIDA/durada-E.err. Un registre es dona per bo només si el codi de sortida és 0 (desat just
# després de l'ordre) i acaba amb la línia final; si no, es queda com a .part i el registre del llançador ho diu. Les èpoques que ja tenen
# el registre, se les salta; un .part d'abans es guarda a SORTIDA/interromputs/ i l'època es torna a fer. El que passa, a SORTIDA/llanca.log.
set -u
dir=${1:-}; commit=${2:-}; sortida=${3:-}; max=${4:-8}
if [ -z "$dir" ] || [ -z "$commit" ] || [ -z "$sortida" ]; then
  echo "Ús: bash fase2/resultats/maduracio/durada/llanca.sh CARPETA-DEL-1034 COMMIT SORTIDA [PROCESSOS] [EPOCA...]" >&2; exit 2
fi
shift $(( $# < 4 ? $# : 4 ))
script=fase2/resultats/maduracio/durada/durada.mjs
[ -f "$script" ] || { echo "no trobo $script: cal llançar-lo des de l'arrel de la còpia" >&2; exit 2; }
case "$max" in ''|*[!0-9]*) echo "PROCESSOS ha de ser un nombre" >&2; exit 2;; esac
[ "$max" -ge 1 ] && [ "$max" -le 16 ] || { echo "PROCESSOS, d'1 a 16" >&2; exit 2; }
head=$(git rev-parse HEAD) || exit 2
case "$head" in "$commit"*) ;; *) echo "la còpia és a $head, i no a $commit" >&2; exit 2;; esac
[ -z "$(git status --porcelain -- '*.js' '*.mjs')" ] || { echo "hi ha fitxers de codi amb canvis o sense seguir" >&2; exit 2; }
if [ $# -gt 0 ]; then epochs="$*"; else epochs=$(node -e "import('./$script').then((m) => console.log(m.EPOCHS.join(' ')))") || exit 2; fi
for e in $epochs; do
  [ -f "$dir/llavor1034-mon512x256-r2-epoca$e.bin" ] || { echo "falta la captura de l'època $e a $dir" >&2; exit 2; }
done
mkdir -p "$sortida/interromputs" || exit 2
logf="$sortida/llanca.log"
log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$logf"; }

run_one() {
  local e=$1 out="$sortida/durada-$1.jsonl" err="$sortida/durada-$1.err" codi
  log "comença l'època $e"
  node "$script" "$dir" "$e" > "$out.part" 2> "$err"
  codi=$?
  if [ "$codi" -eq 0 ] && tail -n 1 "$out.part" | grep -q '"type":"end"'; then
    mv "$out.part" "$out" && log "acaba l'època $e: bé (codi $codi)"
  else
    log "acaba l'època $e: MALAMENT (codi $codi); el registre es queda com a $out.part"
  fi
}

log "comença: codi $head, $(node --version), $max processos alhora, les èpoques: $epochs"
for e in $epochs; do
  out="$sortida/durada-$e.jsonl"
  if [ -f "$out" ]; then log "l'època $e ja és feta"; continue; fi
  if [ -f "$out.part" ]; then
    t=$(date '+%Y%m%d%H%M%S')
    mv "$out.part" "$sortida/interromputs/durada-$e-$t.jsonl.part"
    [ -f "$sortida/durada-$e.err" ] && mv "$sortida/durada-$e.err" "$sortida/interromputs/durada-$e-$t.err"
    log "l'època $e tenia un registre interromput: guardat a interromputs/"
  fi
  while [ "$(jobs -rp | wc -l)" -ge "$max" ]; do wait -n; done
  run_one "$e" &
done
wait
ok=0; total=0
for e in $epochs; do total=$((total + 1)); [ -f "$sortida/durada-$e.jsonl" ] && ok=$((ok + 1)); done
if [ "$ok" -eq "$total" ]; then log "acabat: $ok de $total èpoques, totes bé"; else log "acabat amb fallades: $ok de $total èpoques bé"; fi
