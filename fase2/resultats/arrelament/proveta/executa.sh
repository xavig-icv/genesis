#!/usr/bin/env bash
# The test tube: the full run, in 6 processes (10 worlds each), from the root of a clean copy at the given commit. It writes
# proveta-FIRST-LAST.jsonl next to this script, and what happens to executa.log. It stops if the copy is not clean or not at the commit.
#   bash fase2/resultats/arrelament/proveta/executa.sh COMMIT PILOT-FOLDER
set -u
C=$1; S=$2
Q=fase2/resultats/arrelament/proveta
log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> $Q/executa.log; }
[ "$(git rev-parse HEAD)" = "$(git rev-parse "$C")" ] || { log "stopped: the copy is not at $C"; exit 2; }
[ -z "$(git status --porcelain -- '*.js' '*.mjs')" ] || { log "stopped: code files with changes or untracked"; exit 2; }
log "starts, $(git rev-parse --short=8 HEAD), $(node --version)"
pids=()
for a in 1 11 21 31 41 51; do
  b=$((a + 9))
  node $Q/proveta.mjs "$S" --worlds $a-$b > $Q/proveta-$a-$b.jsonl 2> $Q/proveta-$a-$b.err &
  pids+=($!)
done
fails=0
for p in "${pids[@]}"; do wait $p; codi=$?; [ $codi -eq 0 ] || fails=$((fails + 1)); done
for a in 1 11 21 31 41 51; do b=$((a + 9)); [ -s $Q/proveta-$a-$b.err ] || rm -f $Q/proveta-$a-$b.err; done
log "finished: $fails processes failed"
