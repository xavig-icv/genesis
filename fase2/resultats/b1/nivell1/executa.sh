#!/usr/bin/env bash
# B1, el nivell 1 (docs/pla-b1.md, §11): executa les ordres d'una llista, una darrere l'altra, des de l'arrel d'una còpia neta del
# repositori. Abans de començar, comprova la SHA-256 de la llista, el commit i que la còpia no tingui canvis.
#
#   bash fase2/resultats/b1/nivell1/executa.sh LLISTA SHA256 COMMIT
#
# A l'estat (estat-LLISTA.txt, al costat de la llista), només quina ordre comença, quan acaba i amb quin codi: cap recompte. La
# consola de cada ordre, que només porta el progrés, va a consola/. Si un registre ja és sencer (amb la línia final), l'ordre se
# salta; si n'hi ha un d'incomplet, s'atura sense tocar-lo. Al final, al costat dels registres (§11): el commit, la versió de
# Node, la SHA-256 de la llista i la de cada registre (execucio-LLISTA.txt).
set -u
[ $# -eq 3 ] || { echo "Ús: bash executa.sh LLISTA SHA256 COMMIT" >&2; exit 2; }
llista=$1 sha=$2 commit=$3
dir=$(dirname "$llista")
nom=$(basename "$llista" .txt)
estat="$dir/estat-$nom.txt"
execucio="$dir/execucio-$nom.txt"
log() { echo "$(date '+%d-%m-%Y %H.%M.%S') $*" >> "$estat"; }
atura() { log "aturat: $1"; echo "aturat: $1" >&2; exit "${2:-2}"; }

[ -f "$llista" ] || { echo "no hi ha la llista: $llista" >&2; exit 2; }
[ "$(sha256sum "$llista" | cut -d' ' -f1)" = "$sha" ] || atura "la SHA-256 de $llista no és $sha"
[ "$(git rev-parse HEAD)" = "$commit" ] || atura "la còpia és a $(git rev-parse HEAD), i no a $commit"
[ -z "$(git status --porcelain --untracked-files=no)" ] || atura "la còpia té canvis sense desar"

# Les ordres, abans de començar: totes del nivell 1, amb --json al final i cap registre repetit
jsons=()
while IFS= read -r ordre || [ -n "$ordre" ]; do
  ordre=${ordre%$'\r'}
  [ -z "$ordre" ] && continue
  case "$ordre" in "node eines/densitat.mjs "*" --json "*) ;; *) atura "una línia que no és cap ordre del nivell 1: $ordre" ;; esac
  json=${ordre##* --json }
  case "$json" in *" "*) atura "--json ha de ser l'última opció: $ordre" ;; esac
  for j in "${jsons[@]+"${jsons[@]}"}"; do [ "$j" = "$json" ] && atura "un registre repetit: $json"; done
  jsons+=("$json")
done < "$llista"
[ ${#jsons[@]} -gt 0 ] || atura "la llista no té cap ordre"

mkdir -p "$dir/consola"
log "comença la llista $llista (${#jsons[@]} ordres, SHA-256 $sha), al commit $commit, amb Node $(node --version)"
while IFS= read -r ordre || [ -n "$ordre" ]; do
  ordre=${ordre%$'\r'}
  [ -z "$ordre" ] && continue
  json=${ordre##* --json }
  if [ -e "$json" ]; then
    if tail -n 1 "$json" | grep -q '^{"type":"end"'; then log "ja és sencer, se salta: $json"; continue; fi
    atura "$json existeix i no és sencer: cal mirar-ho a mà"
  fi
  mkdir -p "$(dirname "$json")"
  log "comença $json"
  # les opcions no porten espais: es poden separar per paraules
  node ${ordre#node } > "$dir/consola/$(basename "$json" .jsonl).out" 2>&1 < /dev/null
  codi=$?
  log "acaba $json, codi $codi"
  [ $codi -eq 0 ] || atura "l'ordre ha fallat (codi $codi): $ordre" 1
done < "$llista"

if [ -e "$execucio" ]; then
  log "$execucio ja hi era: no el torno a escriure"
else
  {
    echo "commit: $commit"
    echo "node: $(node --version)"
    echo "llista: $llista, SHA-256 $sha"
    echo "registres (SHA-256):"
    for j in "${jsons[@]}"; do sha256sum "$j"; done
  } > "$execucio"
fi
log "acabat"
