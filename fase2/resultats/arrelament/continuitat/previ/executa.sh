#!/bin/bash
# A measure of continuity (exploratory): everything run for this note before it goes into git, and after it outside the planned steps (the
# exploration lane's practice since audit 45, docs/disseny.md). Each run keeps its output and stderr as they come out, the exit code, the
# start and end times, the SHA-256 of the note's code (the working copy, and as git keeps it, with LF line endings) and whether it looked at
# anything of the pilot or of a series.
#
#   bash fase2/resultats/arrelament/continuitat/previ/executa.sh NAME 'no' | 'yes: WHAT' COMMAND ARGS...
#
# From the root of the working copy. It never overwrites a run: NAME must be new.
set -u
here=fase2/resultats/arrelament/continuitat
[ $# -ge 3 ] || { echo 'usage: executa.sh NAME no|yes:WHAT COMMAND ARGS...' >&2; exit 2; }
name=$1; looked=$2; shift 2
out=$here/previ/$name.txt; err=$here/previ/$name.err
if [ -e "$out" ] || [ -e "$err" ]; then echo "executa: $name exists" >&2; exit 2; fi
start=$(date '+%Y-%m-%d %H:%M:%S %z')
"$@" > "$out" 2> "$err"
code=$?
end=$(date '+%Y-%m-%d %H:%M:%S %z')
{
  echo "== $name"
  echo "command: $*"
  echo "start: $start; end: $end; exit code: $code"
  echo "looked at the pilot or a series: $looked"
  echo "commit: $(git rev-parse --short HEAD); changed or untracked in the note's folder: $(git status --porcelain -- "$here" | grep -v '/previ/' | wc -l)"
  for f in "$here"/*.mjs "$here"/*.sh "$here"/previ/*.mjs "$here"/previ/*.sh; do
    [ -e "$f" ] || continue
    raw=$(sha256sum "$f" | cut -c1-64)
    lf=$(tr -d '\r' < "$f" | sha256sum | cut -c1-64)
    echo "  $raw  (as git keeps it: $lf)  ${f#$here/}"
  done
} >> "$here/previ/registre.txt"
exit $code
