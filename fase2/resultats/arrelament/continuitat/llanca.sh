#!/usr/bin/env bash
# A measure of continuity (exploratory; the note, README.md): every branch of the list through continuitat.mjs, 6 at a time, from the root
# of a clean copy at COMMIT.
#
#   bash fase2/resultats/arrelament/continuitat/llanca.sh COMMIT [ID ...]
#
# Without IDs, every branch of the list. It stops before starting if the copy is not at COMMIT, if a .js or .mjs has changes or is not
# followed, if the instrument's checks (prova-sortida.txt) did not all pass, or if another launch holds the lock. A branch whose record is
# complete (its final line) is skipped: a launch that resumes. One line per step in llanca.log, with each branch's exit code taken right
# after it ends; the console of each branch in consola/ID.log.
set -u
AQUI=fase2/resultats/arrelament/continuitat
LIST=fase2/resultats/arrelament/registre-copies/llista.json
ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "$(ts) $*" >> "$AQUI/llanca.log"; }
complete() { [ -f "$1" ] && gzip -dc "$1" 2>/dev/null | tail -1 | grep -q '"type":"end"'; }
commit="${1:-}"
[ -n "$commit" ] || { echo "usage: bash $AQUI/llanca.sh COMMIT [ID ...]"; exit 2; }
shift
[ "$(git rev-parse HEAD)" = "$(git rev-parse "$commit")" ] || { log "stopped: the copy is not at $commit"; exit 1; }
[ -z "$(git status --porcelain -- '*.js' '*.mjs')" ] || { log "stopped: a .js or .mjs has changes or is not followed"; exit 1; }
tail -1 "$AQUI/prova-sortida.txt" 2>/dev/null | grep -qx 'All the checks pass.' || { log "stopped: the instrument's checks did not all pass"; exit 1; }
mkdir "$AQUI/llanca.lock" 2>/dev/null || { log "stopped: another launch holds the lock"; exit 1; }
trap 'rmdir "$AQUI/llanca.lock"' EXIT
mkdir -p "$AQUI/registres" "$AQUI/consola"
log "starts at $(git rev-parse --short HEAD), $(node --version)"
if [ $# -gt 0 ]; then ids="$*"; else ids=$(node -e "const l=JSON.parse(require('fs').readFileSync('$LIST','utf8'));console.log(l.branches.map(b=>b.id).join(' '))"); fi
one() {
  local id="$1" rec="$AQUI/registres/$1.jsonl.gz"
  if complete "$rec"; then log "already done $id"; return 0; fi
  log "starts $id"
  node "$AQUI/continuitat.mjs" "$id" > "$AQUI/consola/$id.log" 2>&1
  local codi=$?
  if [ $codi -ne 0 ] || ! complete "$rec"; then log "fails $id: exit code $codi"; return 1; fi
  log "ends $id: exit code $codi"
}
export -f one log ts complete
export AQUI
echo $ids | tr ' ' '\n' | xargs -P 6 -I{} bash -c 'one "$@"' _ {}
codi=$?
done_all=1
for id in $ids; do complete "$AQUI/registres/$id.jsonl.gz" || done_all=0; done
if [ $done_all -eq 1 ]; then log "finished: every branch complete"; else log "stopped: some branch is not complete (xargs exit code $codi)"; fi
