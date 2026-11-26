#!/bin/bash
# Before the note (the practice proposed by auditor 2 at audit 44): runs a command of this note's folder, from the repository's root, and
# keeps its output (previ/NAME.txt and .err) with the time and the SHA-256 of every script of the folder (previ/registre.txt).
#   bash fase2/resultats/arrelament/descendencia/previ/executa.sh NAME node fase2/resultats/arrelament/descendencia/prova.mjs
set -u
D=fase2/resultats/arrelament/descendencia
NAME=$1; shift
[ -e "$D/previ/$NAME.txt" ] && { echo "previ/$NAME.txt already exists"; exit 2; }
{
  echo "== $NAME · $(date '+%Y-%m-%d %H.%M.%S') · $*"
  (cd "$D" && sha256sum *.mjs | sed 's/^/   /')
} >> "$D/previ/registre.txt"
"$@" > "$D/previ/$NAME.txt" 2> "$D/previ/$NAME.err"
codi=$?
echo "   exit code $codi, $(date '+%H.%M.%S')" >> "$D/previ/registre.txt"
exit $codi
