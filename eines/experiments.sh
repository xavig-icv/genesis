#!/usr/bin/env bash
# Executa una llista d'experiments de sim.mjs, N alhora. Cada línia de la llista és
#   nom  arguments de sim.mjs
# i el registre va a <carpeta>/<nom>.log. Les línies buides i les que comencen amb # no compten. Els
# camins de dins de la llista (--json, --from, --save) són relatius a la carpeta del repositori.
#
# Abans de començar es comprova la llista (AU2-39 i AU2-38 de l'auditoria externa 8): hi ha d'haver
# almenys un experiment, cap nom repetit, i un nombre d'experiments alhora d'1 a 16.
#
# Un experiment complet se salta ("ja fet"). Complet vol dir que el registre té l'empremta del món i,
# si l'ordre porta --json, que el JSONL existeix, comença amb la línia d'inici (amb la mateixa llavor
# que --seed, si n'hi ha) i acaba amb la línia final. Si no, es torna a fer des del principi (AU2-37;
# AUD-59: sim.mjs escriu l'empremta abans de la línia final del JSONL). A més, l'ordre que la línia
# d'inici diu que el va fer ("command") ha de ser exactament la de la llista: amb el mateix nom i la
# mateixa llavor, però un altre corrent, un altre horitzó o una altra captura, es torna a fer (AU2-56,
# auditoria 9).
#
# Per a cada experiment escriu "comença:" i, en acabar, "acaba:" o, si sim.mjs surt amb error,
# "falla:" amb el codi de sortida.
# Codis de sortida: 0 si s'han executat tots (encara que n'hagi fallat algun, cosa que queda escrita),
# 2 si la llista o els arguments no són vàlids, i un altre si el lot s'ha interromput.
# Ús:
#   bash eines/experiments.sh 3 fase3/resultats < llista.txt
# Per a lots llargs, feu servir eines/llanca-lot.sh, que escriu el progrés en un fitxer i no a la consola.
set -euo pipefail
cd "$(dirname "$0")/.."
PARALLEL="${1:-3}"
export OUT="${2:-resultats}"
if ! [[ "$PARALLEL" =~ ^[0-9]+$ ]] || (( PARALLEL < 1 || PARALLEL > 16 )); then
  echo "experiments.sh: el nombre d'experiments alhora ha de ser un enter d'1 a 16 (és '$PARALLEL')" >&2
  exit 2
fi
LIST=$(grep -v '^[[:space:]]*$' | grep -v '^[[:space:]]*#' || true)
if [[ -z "$LIST" ]]; then echo "experiments.sh: la llista no té cap experiment" >&2; exit 2; fi
DUP=$(printf '%s\n' "$LIST" | awk '{print $1}' | LC_ALL=C sort | uniq -d)
if [[ -n "$DUP" ]]; then echo "experiments.sh: noms repetits a la llista: $(echo $DUP)" >&2; exit 2; fi
mkdir -p "$OUT"

# Cert si l'experiment ja és complet (vegeu la capçalera). Arguments: el registre i els de sim.mjs.
complete() {
  local log="$1"; shift
  { [[ -s "$log" ]] && grep -q "empremta del món" "$log"; } || return 1
  # l'ordre, com l'escriu sim.mjs a la línia d'inici (abans que el bucle es mengi els arguments)
  local json="" seed="" command="node sim.mjs $*"
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --json) json="${2:-}"; shift ;;
      --seed) seed="${2:-}"; shift ;;
    esac
    shift
  done
  [[ -z "$json" ]] && return 0
  [[ -s "$json" ]] || return 1
  head -n 1 "$json" | grep -q '"type":"start"' || return 1
  if [[ -n "$seed" ]]; then head -n 1 "$json" | grep -q "\"seed\":$seed[,}]" || return 1; fi
  # la mateixa ordre: sim.mjs hi escriu "node sim.mjs" i els seus arguments, separats per un espai
  node -e 'const l = require("fs").readFileSync(process.argv[1], "utf8").split("\n")[0]; let s; try { s = JSON.parse(l); } catch { process.exit(1); } process.exit(s.command === process.argv[2] ? 0 : 1);' "$json" "$command" || return 1
  tail -n 1 "$json" | grep -q '"type":"end"'
}

run_one() {
  local name="$1"; shift
  local log="$OUT/$name.log"
  if complete "$log" "$@"; then
    echo "ja fet: $name"
    return
  fi
  echo "comença: $name"
  mkdir -p "$(dirname "$log")"
  local rc=0
  node sim.mjs "$@" > "$log" 2>&1 || rc=$?
  if [[ $rc -eq 0 ]]; then
    echo "acaba:   $name"
  else
    echo "falla:   $name (codi $rc)"
  fi
}
export -f complete run_one

# -r: amb una entrada buida, xargs no executa res (no hauria de passar, perquè la llista s'ha comprovat)
printf '%s\n' "$LIST" | xargs -r -P "$PARALLEL" -L 1 bash -c 'run_one "$@"' _
