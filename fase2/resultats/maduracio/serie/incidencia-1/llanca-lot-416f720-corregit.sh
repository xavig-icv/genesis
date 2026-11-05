#!/usr/bin/env bash
# CÒPIA CORREGIDA de eines/llanca-lot.sh de 416f720, per llançar la sèrie de la maduració (01-11-2026). Només hi canvien
# dues línies: (1) la comprovació de la llista, que amb "grep -q" i pipefail rebutjava les llistes de més de 64 KB (el primer
# grep rebia un SIGPIPE quan el segon sortia a la primera coincidència: "la llista no té cap experiment", codi 2); i (2) el
# "cd" a la carpeta del repositori, perquè aquesta còpia viu fora del repositori: es llança des de la seva arrel, i ho comprova.
# Tota la resta, i experiments.sh i sim.mjs, són els del commit de l'etiqueta, sense tocar.
# Executa un lot d'experiments (experiments.sh) i n'escriu el progrés NOMÉS en un fitxer, mai a la
# consola. Una consola de Windows en mode de selecció bloqueja tot el que hi escriu, i el 17-10-2026
# va aturar el lot del PC durant una hora (incidència 1 de l'acta de la sèrie de la llei 2).
#
#   bash eines/llanca-lot.sh N carpeta llista.txt
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
#   VM (Linux):  (nohup bash eines/llanca-lot.sh 3 carpeta llista.txt > /dev/null 2>&1 &)
#   PC (Windows): Start-Process -WindowStyle Hidden bash -ArgumentList 'eines/llanca-lot.sh', ...
# Per veure com va sense mirar cap resultat: bash eines/seguiment.sh [--agregat] carpeta
set -euo pipefail
if [[ $# -ne 3 ]]; then echo "ús: bash eines/llanca-lot.sh N carpeta llista.txt" >&2; exit 2; fi
abs() { case "$1" in /*|[A-Za-z]:*) printf '%s\n' "$1" ;; *) printf '%s\n' "$PWD/$1" ;; esac; }
PARALLEL="$1"; DIR=$(abs "$2"); LIST=$(abs "$3")
[[ -f eines/experiments.sh && -f sim.mjs ]] || { echo "llanca-lot (còpia corregida): cal llançar-lo des de l'arrel del repositori" >&2; exit 2; }
if ! [[ "$PARALLEL" =~ ^[0-9]+$ ]] || (( PARALLEL < 1 || PARALLEL > 16 )); then
  echo "llanca-lot.sh: el nombre d'experiments alhora ha de ser un enter d'1 a 16 (és '$PARALLEL')" >&2; exit 2
fi
[[ -f "$LIST" ]] || { echo "llanca-lot.sh: no existeix la llista $LIST" >&2; exit 2; }
if ! grep -v '^[[:space:]]*$' "$LIST" | grep -v '^[[:space:]]*#' > /dev/null; then
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

# Dins del repositori, el camí de la llista s'escriu relatiu a l'arrel: un camí absolut porta el nom de
# l'usuari i les carpetes de la màquina, que no han d'anar als registres
SHOWN="${LIST#"$PWD/"}"
echo "== lot començat $(date '+%Y-%m-%d %H:%M:%S') codi=$CODE llista=$SHOWN paral·lel=$PARALLEL" >> "$OUTFILE"
FROM=$(wc -l < "$OUTFILE")
rc=0
bash eines/experiments.sh "$PARALLEL" "$DIR" < "$LIST" >> "$OUTFILE" 2>&1 || rc=$?
count() { tail -n +"$FROM" "$OUTFILE" | grep -c "^$1" || true; }
SUMMARY="$(count 'acaba:') acabats, $(count 'falla:') fallats, $(count 'ja fet:') ja fets"
if [[ $rc -eq 0 ]]; then
  echo "== lot acabat $(date '+%Y-%m-%d %H:%M:%S'): $SUMMARY" >> "$OUTFILE"
else
  echo "== lot interromput (codi $rc) $(date '+%Y-%m-%d %H:%M:%S'): $SUMMARY" >> "$OUTFILE"
  exit "$rc"
fi
