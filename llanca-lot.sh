#!/usr/bin/env bash
# Executa un lot d'experiments (experiments.sh) i n'escriu el progrés NOMÉS en un fitxer, mai a la
# consola. Una consola de Windows en mode de selecció bloqueja tot el que hi escriu, i el 17-10-2026
# va aturar el lot del PC durant una hora (incidència 1 de l'acta de la sèrie de la llei 2).
#
#   bash llanca-lot.sh N carpeta llista.txt
#
# El progrés s'afegeix a <carpeta>/lot-<nom de la llista>.out, amb una línia d'inici (data i codi) i
# una de final amb el recompte. Si es torna a llançar, s'hi afegeix: experiments.sh salta els
# experiments acabats i torna a fer els incomplets. El lot corre en primer pla; per separar-lo de la
# sessió:
#   VM (Linux):  (nohup bash llanca-lot.sh 3 carpeta llista.txt > /dev/null 2>&1 &)
#   PC (Windows): Start-Process -WindowStyle Hidden bash -ArgumentList 'llanca-lot.sh', ...
# Per veure com va sense mirar cap resultat: bash seguiment.sh carpeta
set -euo pipefail
cd "$(dirname "$0")"
if [[ $# -ne 3 ]]; then echo "ús: bash llanca-lot.sh N carpeta llista.txt" >&2; exit 2; fi
PARALLEL="$1"; DIR="$2"; LIST="$3"
[[ -f "$LIST" ]] || { echo "no existeix la llista $LIST" >&2; exit 2; }
mkdir -p "$DIR"
OUTFILE="$DIR/lot-$(basename "${LIST%.*}").out"
if git rev-parse --short HEAD > /dev/null 2>&1; then
  # (sense "&&" dins de la substitució: amb set -e, una còpia neta aturava l'script)
  CODE="$(git rev-parse --short HEAD)"
  if [[ -n "$(git status --porcelain -- '*.js' '*.mjs' '*.sh')" ]]; then CODE+="+canvis"; fi
else
  CODE="$(cat VERSIO 2> /dev/null || echo desconegut)"
fi

echo "== lot començat $(date '+%Y-%m-%d %H:%M:%S') codi=$CODE llista=$LIST paral·lel=$PARALLEL" >> "$OUTFILE"
FROM=$(wc -l < "$OUTFILE")
bash experiments.sh "$PARALLEL" "$DIR" < "$LIST" >> "$OUTFILE" 2>&1 || true
count() { tail -n +"$FROM" "$OUTFILE" | grep -c "^$1" || true; }
echo "== lot acabat $(date '+%Y-%m-%d %H:%M:%S'): $(count 'acaba:') acabats, $(count 'falla:') fallats, $(count 'ja fet:') ja fets" >> "$OUTFILE"
