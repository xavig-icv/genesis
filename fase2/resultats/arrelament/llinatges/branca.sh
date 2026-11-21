#!/usr/bin/env bash
# Les famílies naturals seguides com els plantats (exploratori; la nota, README.md): una branca, de punta a punta. La crida llanca.sh, des
# de l'arrel de la còpia de treball, amb una línia de llista.txt: «ID ordre-de-sim».
#  1. si el seguiment ja hi és, sencer, no fa res (un llançament que es repren);
#  2. la simulació (sim.mjs tal com és, amb l'ordre de la llista: --save i --save-every 50), amb el codi 0 i la línia final;
#  3. la comprovació de punta a punta (compara.mjs), que s'ha de complir;
#  4. el seguiment dels llinatges naturals (segueix.mjs);
#  5. esborra les captures de la branca.
# Escriu una línia per pas a llanca.log, i el que diuen els programes a consola/ID.log i comparacio/ID.txt.
set -u
AQUI=fase2/resultats/arrelament/llinatges
id="$1"; shift
ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "$(ts) $*" >> "$AQUI/llanca.log"; }
seg="$AQUI/seguiments/$id.jsonl"
if [ -f "$seg" ] && tail -1 "$seg" | grep -q '"type":"end"'; then log "ja fet $id"; exit 0; fi
mkdir -p "$AQUI/simulacio" "$AQUI/consola" "$AQUI/comparacio" "$AQUI/captures/$id"
log "comença $id"
node sim.mjs "$@" > "$AQUI/consola/$id.log" 2>&1; codi=$?
if [ $codi -ne 0 ] || ! tail -1 "$AQUI/simulacio/$id.jsonl" | grep -q '"type":"end"'; then log "falla $id: la simulació, codi $codi"; exit 1; fi
node "$AQUI/compara.mjs" "$id" > "$AQUI/comparacio/$id.txt" 2>&1; codi=$?
if [ $codi -ne 0 ]; then log "falla $id: la comprovació, codi $codi"; exit 1; fi
node "$AQUI/segueix.mjs" "$id" >> "$AQUI/consola/$id.log" 2>&1; codi=$?
if [ $codi -ne 0 ]; then log "falla $id: el seguiment, codi $codi"; exit 1; fi
rm -rf "$AQUI/captures/$id"
log "acaba $id"
