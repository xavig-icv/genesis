#!/usr/bin/env bash
# B1, després del nivell 1 (docs/pla-b1.md, §11): executa les ordres d'una llista, una darrere l'altra, des de l'arrel d'una còpia
# neta del repositori. És l'executor del nivell 1 (fase2/resultats/b1/nivell1/executa.sh) amb la guarda de l'AUD-174, i accepta les
# ordres de les tres eines: eines/densitat.mjs, eines/autonomia.mjs i eines/estrats.mjs.
#
#   bash eines/executa-b1.sh LLISTA SHA256 COMMIT
#
# Abans de començar: la SHA-256 de la llista, el commit, que la còpia no tingui canvis, i la guarda.
# La guarda (AUD-174): cap fitxer .js o .mjs amb canvis ni sense seguir, abans de començar i abans de cada ordre. Les eines hi
# escriurien "+canvis" al codi, i l'anàlisi en rebutjaria els registres: és el que va passar al primer intent de la repetició del
# nivell 1, amb un script copiat a la còpia del càlcul. Després de cada ordre, el registre no pot dir "+canvis".
# A l'estat (estat-LLISTA.txt, al costat de la llista), només quina ordre comença, quan acaba i amb quin codi: cap recompte. La
# consola de cada ordre, que només porta el progrés, va a consola/. Si un registre ja és sencer (amb la línia final), l'ordre se
# salta; si n'hi ha un d'incomplet, s'atura sense tocar-lo. Al final: el commit, la versió de Node, la SHA-256 de la llista i la de
# cada registre (execucio-LLISTA.txt).
set -u
[ $# -eq 3 ] || { echo "Ús: bash eines/executa-b1.sh LLISTA SHA256 COMMIT" >&2; exit 2; }
llista=$1 sha=$2 commit=$3
dir=$(dirname "$llista")
nom=$(basename "$llista" .txt)
estat="$dir/estat-$nom.txt"
execucio="$dir/execucio-$nom.txt"
log() { echo "$(date '+%d-%m-%Y %H.%M.%S') $*" >> "$estat"; }
atura() { log "aturat: $1"; echo "aturat: $1" >&2; exit "${2:-2}"; }
guarda() {
  local codi
  codi=$(git status --porcelain -- '*.js' '*.mjs')
  [ -z "$codi" ] || atura "hi ha codi amb canvis o sense seguir (AUD-174): $(echo "$codi" | tr '\n' ' ')"
}

[ -f "$llista" ] || { echo "no hi ha la llista: $llista" >&2; exit 2; }
[ "$(sha256sum "$llista" | cut -d' ' -f1)" = "$sha" ] || atura "la SHA-256 de $llista no és $sha"
[ "$(git rev-parse HEAD)" = "$commit" ] || atura "la còpia és a $(git rev-parse HEAD), i no a $commit"
[ -z "$(git status --porcelain --untracked-files=no)" ] || atura "la còpia té canvis sense desar"
guarda

# Les ordres, abans de començar: totes d'una de les tres eines, amb --json al final i cap registre repetit
jsons=()
while IFS= read -r ordre || [ -n "$ordre" ]; do
  ordre=${ordre%$'\r'}
  [ -z "$ordre" ] && continue
  case "$ordre" in "node eines/densitat.mjs "*" --json "*|"node eines/autonomia.mjs "*" --json "*|"node eines/estrats.mjs "*" --json "*) ;;
    *) atura "una línia que no és cap ordre de B1: $ordre" ;; esac
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
  guarda
  mkdir -p "$(dirname "$json")"
  log "comença $json"
  # les opcions no porten espais: es poden separar per paraules
  node ${ordre#node } > "$dir/consola/$(basename "$json" .jsonl).out" 2>&1 < /dev/null
  codi=$?
  log "acaba $json, codi $codi"
  [ $codi -eq 0 ] || atura "l'ordre ha fallat (codi $codi): $ordre" 1
  head -n 1 "$json" | grep -q '"code":"[0-9a-f]*+canvis"' && atura "el registre $json diu +canvis" 1
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
