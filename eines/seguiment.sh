#!/usr/bin/env bash
# Com va un lot, sense mirar cap resultat (AU2-34 de l'auditoria externa 7).
#   bash eines/seguiment.sh [--agregat] carpeta
#
# Llegeix els fitxers lot-*.out de la carpeta, per ordre d'inici, i es queda amb l'últim estat de
# cada experiment (AUD-56 i AU2-40 de l'auditoria 8): "comença:" vol dir en marxa; "acaba:" o "ja fet:",
# acabat; "falla:", fallat. Un experiment que falla i es torna a llançar torna a estar en marxa, i un que
# surt a dos lots compta una sola vegada.
#
# Dels acabats, comprova que el registre sigui complet: la línia "empremta del món" (sense mostrar-ne el
# valor) i, si l'ordre del registre porta --json, que el JSONL acabi amb la línia final. Dels que són en
# marxa, diu quanta estona fa que no escriuen. No mostra mai cap xifra dels registres ni dels JSONL.
#
# Amb --agregat no escriu cap nom, només els recomptes i el temps màxim sense escriure. És per a les
# sèries confirmatòries: l'ordre en què acaben els experiments pot revelar-ne el resultat, perquè un
# món amb vida calcula més a poc a poc (AUD-57).
set -euo pipefail
AGG=0
if [[ "${1:-}" == --agregat ]]; then AGG=1; shift; fi
if [[ $# -ne 1 ]]; then echo "ús: bash eines/seguiment.sh [--agregat] carpeta" >&2; exit 2; fi
case "$1" in /*|[A-Za-z]:*) DIR="$1" ;; *) DIR="$PWD/$1" ;; esac
cd "$(dirname "$0")/.."     # els camins dels JSONL (--json) són relatius al repositori
shopt -s nullglob
LOTS=("$DIR"/lot-*.out)
[[ ${#LOTS[@]} -gt 0 ]] || { echo "no hi ha cap lot-*.out a $DIR" >&2; exit 1; }

# Els lots, per ordre de la primera línia (la data d'inici); dins de cada lot, per ordre de línies
ORDERED=$(for f in "${LOTS[@]}"; do printf '%s\t%s\n' "$(head -n 1 "$f")" "$f"; done | LC_ALL=C sort | cut -f2)
# L'últim estat de cada nom, en l'ordre en què van aparèixer: "nom estat"
STATES=$(while IFS= read -r f; do cat "$f"; done <<< "$ORDERED" | LC_ALL=C awk '
  function put(n, st) { s[n] = st; if (!(n in o)) o[n] = ++k }
  /^comença: / { put($2, "marxa") }
  /^acaba: /   { put($2, "acabat") }
  /^ja fet: /  { put($3, "acabat") }
  /^falla: /   { put($2, "fallat") }
  END { for (n in s) print o[n], n, s[n] }' | sort -n | cut -d' ' -f2-)
names() { [[ -z "$STATES" ]] || awk -v st="$1" '$2 == st { print $1 }' <<< "$STATES"; }
DONE=$(names acabat); FAILED=$(names fallat); RUNNING=$(names marxa)
n() { if [[ -z "$1" ]]; then echo 0; else wc -l <<< "$1"; fi; }

complete() {
  local log="$DIR/$1.log" json
  grep -q "empremta del món" "$log" 2> /dev/null || return 1
  json=$(head -n 1 "$log" | grep -o -- '--json [^ ]*' | cut -d' ' -f2 || true)
  [[ -z "$json" ]] && return 0
  [[ -s "$json" ]] && tail -n 1 "$json" | grep -q '"type":"end"'
}
ok=0; incomplete=""
for name in $DONE; do if complete "$name"; then ok=$((ok + 1)); else incomplete+=" $name"; fi; done

echo "lots: ${#LOTS[@]}"
for f in "${LOTS[@]}"; do
  last=$(tail -n 1 "$f")
  case "$last" in "== lot acabat"*|"== lot interromput"*) echo "  $(basename "$f"): ${last#== }" ;; esac
done
echo "experiments: $(n "$STATES")   acabats: $(n "$DONE")   fallats: $(n "$FAILED")   en marxa: $(n "$RUNNING")"
now=$(date +%s); max=0; lines=""
for name in $RUNNING; do
  log="$DIR/$name.log"
  if [[ -f "$log" ]]; then
    mins=$(( (now - $(date -r "$log" +%s)) / 60 )); if (( mins > max )); then max=$mins; fi
    lines+="  en marxa: $name, sense escriure fa $mins min"$'\n'
  else
    lines+="  en marxa: $name, encara sense registre"$'\n'
  fi
done
if [[ $AGG -eq 1 ]]; then
  echo "registres complets dels acabats: $ok de $(n "$DONE")"
  if [[ -n "$RUNNING" ]]; then echo "el que fa més estona que no escriu: $max min"; fi
else
  echo "registres complets dels acabats: $ok de $(n "$DONE")$([[ -n "$incomplete" ]] && echo "   INCOMPLETS:$incomplete")"
  if [[ -n "$FAILED" ]]; then echo "fallats: $(echo $FAILED)"; fi
  printf '%s' "$lines"
fi
exit 0
