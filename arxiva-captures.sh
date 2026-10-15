#!/usr/bin/env bash
# Còpia de seguretat de les captures clau (AUD-10 de l'auditoria 1).
#
# Les captures .bin no van a git (8 MB cadascuna). Les que són el punt de partida d'altres
# experiments, o les que cita el quadern, són a captures.sha256 amb la seva suma de comprovació;
# què és cadascuna, a docs/captures.md.
#
#   bash arxiva-captures.sh [carpeta]            comprimeix les captures a la carpeta (per defecte
#                                                arxiu-captures/) i comprova les sumes
#   bash arxiva-captures.sh --verifica [carpeta] comprova un arxiu ja fet (per exemple, una còpia
#                                                en un disc extern)
#   bash arxiva-captures.sh --restaura [carpeta] torna a posar al seu lloc les captures que hi falten
set -euo pipefail
cd "$(dirname "$0")"
MODE=arxiva
if [[ "${1:-}" == --verifica || "${1:-}" == --restaura ]]; then MODE="${1#--}"; shift; fi
DEST="${1:-arxiu-captures}"

ok=0; bad=0
while read -r sum path; do
  path="${path#\*}"
  case "$MODE" in
    arxiva)
      if [[ ! -f "$path" ]]; then echo "FALTA     $path"; bad=$((bad + 1)); continue; fi
      if [[ "$(sha256sum "$path" | cut -d' ' -f1)" != "$sum" ]]; then echo "DIFERENT  $path"; bad=$((bad + 1)); continue; fi
      mkdir -p "$DEST/$(dirname "$path")"
      gzip -9 -c "$path" > "$DEST/$path.gz"
      ;;
    verifica)
      if [[ ! -f "$DEST/$path.gz" ]]; then echo "FALTA     $DEST/$path.gz"; bad=$((bad + 1)); continue; fi
      if [[ "$(gzip -dc "$DEST/$path.gz" | sha256sum | cut -d' ' -f1)" != "$sum" ]]; then echo "MALMÈS    $DEST/$path.gz"; bad=$((bad + 1)); continue; fi
      ;;
    restaura)
      if [[ -f "$path" ]]; then ok=$((ok + 1)); continue; fi
      mkdir -p "$(dirname "$path")"
      gzip -dc "$DEST/$path.gz" > "$path"
      if [[ "$(sha256sum "$path" | cut -d' ' -f1)" != "$sum" ]]; then echo "MALMÈS    $path"; rm -f "$path"; bad=$((bad + 1)); continue; fi
      echo "restaurat $path"
      ;;
  esac
  ok=$((ok + 1))
done < captures.sha256

echo "$MODE: $ok correctes, $bad amb problemes ($DEST)"
[[ $bad -eq 0 ]]
