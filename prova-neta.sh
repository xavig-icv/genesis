#!/usr/bin/env bash
# Passa npm test en una còpia neta d'un commit (per defecte, HEAD), en un worktree temporal que
# s'esborra en acabar. Les proves no poden dependre de canvis sense desar de la còpia de treball: així es
# va escapar l'error de la PR #3 (AUD-58 de l'auditoria 8). Cal passar-lo abans de demanar cada merge.
#
#   bash prova-neta.sh [commit]
#
# Surt amb el codi de npm test. Necessita npm (al PC; la VM no en té, i allà les proves es passen una per
# una amb node).
set -euo pipefail
cd "$(dirname "$0")"
REF="${1:-HEAD}"
COMMIT=$(git rev-parse --verify --quiet "$REF^{commit}") || { echo "prova-neta.sh: commit desconegut: $REF" >&2; exit 2; }
TMP=$(mktemp -d)
cleanup() { git worktree remove --force "$TMP/copia" > /dev/null 2>&1 || true; rm -rf "$TMP"; }
trap cleanup EXIT
git worktree add --detach -q "$TMP/copia" "$COMMIT"
echo "proves en una còpia neta de $(git rev-parse --short "$COMMIT")"
(cd "$TMP/copia" && npm test)
