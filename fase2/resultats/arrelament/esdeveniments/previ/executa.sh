#!/bin/bash
# A record of copy events (exploratory): everything run for this note before it goes into git, and after it outside the planned steps (the
# exploration lane's practice: docs/disseny.md, audits 45 and 46). Each run keeps its output and stderr as they come out, the exit code,
# the start and end times, whether it looked at anything of the pilot or of a series, and the SHA-256 of the code as git keeps it (LF line
# endings) and as it is in the working copy: the note's scripts and every module they import from other folders (previ/moduls.mjs).
#
#   bash fase2/resultats/arrelament/esdeveniments/previ/executa.sh NAME 'no' | 'yes: WHAT' COMMAND ARGS...
#   bash fase2/resultats/arrelament/esdeveniments/previ/executa.sh --final
#
# --final: no command; the SHA-256 of the code as it enters the note's commit (run with everything staged, just before the commit), and
# what changed since the last run. From the root of the working copy. It never overwrites a run: NAME must be new.
set -u
here=fase2/resultats/arrelament/esdeveniments
reg=$here/previ/registre.txt
hashes() {
  node $here/previ/moduls.mjs > "$1" || { echo 'executa: previ/moduls.mjs failed' >&2; exit 2; }
  ls $here/*.sh $here/previ/*.sh 2>/dev/null >> "$1"
  while read -r f; do
    raw=$(sha256sum "$f" | cut -c1-64)
    lf=$(tr -d '\r' < "$f" | sha256sum | cut -c1-64)
    echo "  $lf  (working copy: $raw)  $f"
  done < "$1"
}
if [ "${1:-}" = "--final" ]; then
  [ $# -eq 1 ] || { echo 'usage: executa.sh --final' >&2; exit 2; }
  tmp=$(mktemp)
  now=$(hashes "$tmp")
  # the last run's hashes, read before this block writes its own lines (the first --final read its own lines back)
  last=$(grep -n '^== [a-z]' "$reg" | grep -v '^[0-9]*:== final' | tail -1 | cut -d: -f1)
  prev=$(sed -n "$last,\$p" "$reg" | sed '/^== final/,$d' | grep '^  [0-9a-f]\{64\}' | awk '{print $1" "$NF}')
  {
    echo "== final: the code as it enters the note's commit ($(date '+%Y-%m-%d %H:%M:%S %z'))"
    echo "in the note's folder, not staged: $(git diff --name-only -- "$here" | grep -v 'previ/registre.txt' | wc -l); untracked: $(git ls-files --others --exclude-standard -- "$here" | grep -v 'previ/registre.txt' | wc -l)"
    echo "$now"
    echo "changed since the last run (as git keeps it):"
    echo "$now" | awk '{print $1" "$NF}' | while read -r h f; do
      p=$(echo "$prev" | awk -v f="$f" '$2==f{print $1}')
      if [ -z "$p" ]; then echo "  new: $f"; elif [ "$p" != "$h" ]; then echo "  changed: $f"; fi
    done
    echo "  (end of the list)"
  } >> "$reg"
  rm -f "$tmp"
  exit 0
fi
[ $# -ge 3 ] || { echo 'usage: executa.sh NAME no|yes:WHAT COMMAND ARGS...' >&2; exit 2; }
name=$1; looked=$2; shift 2
out=$here/previ/$name.txt; err=$here/previ/$name.err
if [ -e "$out" ] || [ -e "$err" ]; then echo "executa: $name exists" >&2; exit 2; fi
tmp=$(mktemp)
before=$(hashes "$tmp")
rm -f "$tmp"
start=$(date '+%Y-%m-%d %H:%M:%S %z')
# the run's header first, so a run that is stopped before its end is in the registry too
{
  echo "== $name"
  echo "command: $*"
  echo "start: $start"
  echo "looked at the pilot or a series: $looked"
  echo "commit: $(git rev-parse --short HEAD); changed or untracked anywhere in the repository (but previ/): $(git status --porcelain | grep -v "^?? $here/$\|$here/previ/" | wc -l)"
  echo "$before"
} >> "$reg"
"$@" > "$out" 2> "$err"
code=$?
echo "end of $name: $(date '+%Y-%m-%d %H:%M:%S %z'); exit code: $code" >> "$reg"
exit $code
