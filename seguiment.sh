#!/usr/bin/env bash
# Com va un lot, sense mirar cap resultat (AU2-34 de l'auditoria externa 7): compta els experiments
# començats, acabats i fallats segons els fitxers lot-*.out de la carpeta, comprova que els acabats
# tinguin el registre complet (la línia "empremta del món", sense mostrar-ne el valor) i diu quanta
# estona fa que cada experiment en marxa no escriu res. No llegeix mai els JSONL ni cap xifra dels
# registres.
#
#   bash seguiment.sh carpeta
set -euo pipefail
if [[ $# -ne 1 ]]; then echo "ús: bash seguiment.sh carpeta" >&2; exit 2; fi
DIR="$1"
shopt -s nullglob
LOTS=("$DIR"/lot-*.out)
[[ ${#LOTS[@]} -gt 0 ]] || { echo "no hi ha cap lot-*.out a $DIR" >&2; exit 1; }

# (sort i comm amb LC_ALL=C perquè l'ordre sigui el mateix; un grep sense coincidències no és un error)
names() { cat "${LOTS[@]}" | { grep "^$1" || true; } | sed "s/^$1 *//; s/ (codi .*//" | LC_ALL=C sort -u; }
STARTED=$(names 'comença:'); DONE=$(names 'acaba:'); FAILED=$(names 'falla:'); SKIPPED=$(names 'ja fet:')
n() { [[ -z "$1" ]] && echo 0 || echo "$1" | wc -l; }
# Un experiment que ha fallat i després ha acabat compta com a acabat
FAILED_NOW=$(LC_ALL=C comm -23 <(echo "$FAILED") <(echo "$DONE") | sed '/^$/d')
RUNNING=$(LC_ALL=C comm -23 <(echo "$STARTED") <(printf '%s\n%s\n' "$DONE" "$FAILED" | LC_ALL=C sort -u) | sed '/^$/d')

complete=0; incomplete=""
for name in $DONE $SKIPPED; do
  if grep -q "empremta del món" "$DIR/$name.log" 2> /dev/null; then complete=$((complete + 1)); else incomplete+=" $name"; fi
done

echo "lots: ${#LOTS[@]} ($(basename -a "${LOTS[@]}" | tr '\n' ' '))"
for f in "${LOTS[@]}"; do tail -n 1 "$f" | grep -q '^== lot acabat' && echo "  $(basename "$f"): $(tail -n 1 "$f" | sed 's/^== //')"; done
echo "començats: $(n "$STARTED")   acabats: $(n "$DONE")   fallats: $(n "$FAILED_NOW")   ja fets abans: $(n "$SKIPPED")   en marxa: $(n "$RUNNING")"
echo "registres complets dels acabats: $complete$([[ -n "$incomplete" ]] && echo "   INCOMPLETS:$incomplete")"
[[ -n "$FAILED_NOW" ]] && echo "fallats: $(echo $FAILED_NOW)"
now=$(date +%s)
for name in $RUNNING; do
  log="$DIR/$name.log"
  if [[ -f "$log" ]]; then echo "  en marxa: $name, sense escriure fa $(( (now - $(date -r "$log" +%s)) / 60 )) min"; else echo "  en marxa: $name, encara sense registre"; fi
done
