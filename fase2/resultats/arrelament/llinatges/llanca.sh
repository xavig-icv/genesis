#!/usr/bin/env bash
# Les famílies naturals seguides com els plantats (exploratori; la nota, README.md): el càlcul de les 52 branques. Des de l'arrel d'una
# còpia neta, i des d'una finestra de PowerShell del responsable (els lots llargs, no des de l'aplicació):
#
#   bash fase2/resultats/arrelament/llinatges/llanca.sh COMMIT-SENCER [PROCESSOS]
#
# Les guardes: un sol llançament alhora (un pany), la còpia al commit donat, cap canvi seguit, cap fitxer de codi canviat o sense seguir,
# i llista.txt i les captures de partida (prepara.mjs). Després, les branques de llista.txt, 8 alhora (o PROCESSOS), amb branca.sh; les
# que ja tenen el seguiment sencer se salten. Al final, quantes n'hi ha de bones. El que passa, a llanca.log.
set -u
AQUI=fase2/resultats/arrelament/llinatges
LOG="$AQUI/llanca.log"
COMMIT="${1:-}"; N="${2:-8}"
ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "$(ts) $*" >> "$LOG"; }
para() { log "aturat: $*"; exit 1; }
[ -n "$COMMIT" ] || { echo "ús: bash $AQUI/llanca.sh COMMIT-SENCER [PROCESSOS]" >&2; exit 2; }
PANY="$AQUI/llanca.lock"
if ! mkdir "$PANY" 2>/dev/null; then log "aturat: ja hi ha un llançament en marxa (el pany); aquest no fa res"; exit 3; fi
trap 'rmdir "$PANY" 2>/dev/null' EXIT
log "comença, des de $(basename "$(pwd)"), amb $(node --version), $N processos"
[ "$(git rev-parse HEAD)" = "$COMMIT" ] || para "la còpia no és a $COMMIT"
[ -z "$(git status --porcelain --untracked-files=no)" ] || para "la còpia té canvis seguits"
[ -z "$(git status --porcelain -- '*.js' '*.mjs' '*.sh')" ] || para "la còpia té fitxers de codi canviats o sense seguir"
[ -f "$AQUI/llista.txt" ] || para "no hi ha llista.txt (prepara.mjs)"
n=$(grep -c . "$AQUI/llista.txt")
log "la llista: $n branques, SHA-256 $(sha256sum "$AQUI/llista.txt" | cut -c1-64)"
xargs -P "$N" -L 1 bash "$AQUI/branca.sh" < "$AQUI/llista.txt"; codi=$?
bons=0
while read -r id _; do
  s="$AQUI/seguiments/$id.jsonl"
  [ -f "$s" ] && tail -1 "$s" | grep -q '"type":"end"' && grep -q "^$id: hi coincideix" "$AQUI/comparacio/$id.txt" 2>/dev/null && bons=$((bons + 1))
done < "$AQUI/llista.txt"
if [ $codi -eq 0 ] && [ "$bons" = "$n" ]; then log "acabat: $bons de $n branques, totes comprovades i seguides"; else para "$bons de $n branques bones (xargs, codi $codi)"; fi
