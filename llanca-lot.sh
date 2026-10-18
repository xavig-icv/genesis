#!/usr/bin/env bash
# Executa un lot d'experiments (experiments.sh) i n'escriu el progrés NOMÉS en un fitxer, mai a la
# consola. Una consola de Windows en mode de selecció bloqueja tot el que hi escriu, i el 17-10-2026
# va aturar el lot del PC durant una hora (incidència 1 de l'acta de la sèrie de la llei 2).
#
#   bash llanca-lot.sh N carpeta llista.txt
#
# La carpeta i la llista són relatives a la carpeta des d'on es crida l'script (AUD-59). Els camins de
# dins de la llista són relatius a la carpeta del repositori.
#
# El progrés s'afegeix a <carpeta>/lot-<nom de la llista>.out, amb una línia d'inici (data i codi) i
# una de final. Si el lot s'executa sencer, la línia final és "== lot acabat" amb el recompte, i el codi
# de sortida és 0, encara que hi hagi experiments fallats (queden escrits). Si no s'ha pogut executar
# o s'ha interromput, la línia és "== lot interromput (codi N)" i el llançador surt amb aquest codi
# (AU2-38 de l'auditoria externa 8). Una llista sense experiments o un N incorrecte es rebutgen abans
# de començar, amb el codi 2. Si es torna a llançar, s'hi afegeix: experiments.sh salta els experiments
# complets i torna a fer els incomplets.
#
# El lot corre en primer pla. Per separar-lo de la sessió:
#   VM (Linux):  (nohup bash llanca-lot.sh 3 carpeta llista.txt > /dev/null 2>&1 &)
#   PC (Windows): Start-Process -WindowStyle Hidden bash -ArgumentList 'llanca-lot.sh', ...
# Per veure com va sense mirar cap resultat: bash seguiment.sh [--agregat] carpeta
set -euo pipefail
if [[ $# -ne 3 ]]; then echo "ús: bash llanca-lot.sh N carpeta llista.txt" >&2; exit 2; fi
abs() { case "$1" in /*|[A-Za-z]:*) printf '%s\n' "$1" ;; *) printf '%s\n' "$PWD/$1" ;; esac; }
PARALLEL="$1"; DIR=$(abs "$2"); LIST=$(abs "$3")
cd "$(dirname "$0")"
if ! [[ "$PARALLEL" =~ ^[0-9]+$ ]] || (( PARALLEL < 1 || PARALLEL > 16 )); then
  echo "llanca-lot.sh: el nombre d'experiments alhora ha de ser un enter d'1 a 16 (és '$PARALLEL')" >&2; exit 2
fi
[[ -f "$LIST" ]] || { echo "llanca-lot.sh: no existeix la llista $LIST" >&2; exit 2; }
if ! grep -v '^[[:space:]]*$' "$LIST" | grep -qv '^[[:space:]]*#'; then
  echo "llanca-lot.sh: la llista $LIST no té cap experiment" >&2; exit 2
fi
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
rc=0
bash experiments.sh "$PARALLEL" "$DIR" < "$LIST" >> "$OUTFILE" 2>&1 || rc=$?
count() { tail -n +"$FROM" "$OUTFILE" | grep -c "^$1" || true; }
SUMMARY="$(count 'acaba:') acabats, $(count 'falla:') fallats, $(count 'ja fet:') ja fets"
if [[ $rc -eq 0 ]]; then
  echo "== lot acabat $(date '+%Y-%m-%d %H:%M:%S'): $SUMMARY" >> "$OUTFILE"
else
  echo "== lot interromput (codi $rc) $(date '+%Y-%m-%d %H:%M:%S'): $SUMMARY" >> "$OUTFILE"
  exit "$rc"
fi
