#!/usr/bin/env bash
# La incidència 2 de la sèrie de la maduració (03-11-2026, a les 23.13): sis branques del PC es van interrompre quan es va
# actualitzar l'aplicació de Claude, des d'on es va llançar el lot. El lot va continuar amb les altres.
#
# Aquest script espera que el lot del PC acabi (la línia final de lot-llista-pc.out, «== lot acabat» o «== lot interromput»),
# mirant-ho cada 5 minuts, i llavors torna a llançar el mateix lot (§7 del protocol, pas 9), amb la mateixa còpia corregida del
# llançador (la incidència 1): experiments.sh salta les branques completes i torna a fer les incompletes des del principi.
# No llegeix cap registre: només l'última línia del fitxer del lot. Es llança des de l'arrel de la còpia del commit de l'etiqueta,
# en una finestra amagada i a prioritat baixa (els processos que llança l'hereten): Start-Process amb -WindowStyle Hidden, i la
# prioritat BelowNormal. Ha de ser a la mateixa carpeta que la còpia corregida del llançador; els camins de la màquina són a
# CLAUDE.local.md, que no va al repositori.
#
# El que fa, ho escriu a rellanca-pc-incidencia-2.log, al costat d'aquest script (fora del repositori).
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
LOG="$HERE/rellanca-pc-incidencia-2.log"
OUT=fase2/resultats/maduracio/serie/branques/lot-llista-pc.out
say() { echo "$(date '+%d-%m-%Y %H.%M.%S') $*" >> "$LOG"; }
[[ -f eines/experiments.sh && -f sim.mjs && -f "$OUT" ]] || { say "aturat: no és l'arrel de la còpia de l'etiqueta"; exit 2; }
say "espera que acabi el lot del PC ($(git rev-parse --short HEAD))"
until tail -n 1 "$OUT" | grep -q '^== lot \(acabat\|interromput\)'; do sleep 300; done
say "el lot ha acabat: $(tail -n 1 "$OUT")"
say "el torno a llançar: llanca-lot-416f720-corregit.sh 6, la llista del PC"
exec bash "$HERE/llanca-lot-416f720-corregit.sh" 6 fase2/resultats/maduracio/serie/branques fase2/resultats/maduracio/serie/llista-pc.txt
