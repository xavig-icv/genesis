# Acta de la sèrie preregistrada de B2

**El preregistre** (protocol v0.7, §7 i §9):
- **L'etiqueta:** `preregistre-b2`, anotada, objecte `b5778b99b2c624d3de9349415f69d48c27e2395c`, sobre el commit
  `67fe2f608e3d15424be0b321c17e1e19e1f0daa2`. Creada el 20-10-2026 i enviada a GitHub.
- **El segell d'OpenTimestamps** de l'objecte de l'etiqueta: el 20-10-2026 a les 21:48 (+02:00), amb dos calendaris
  (`docs/preregistre-b2/`, a `main`). Les atestacions de Bitcoin són pendents, i es completaran.
- **El GO:** dels dos auditors, a l'auditoria 13.

## Abans de la primera branca

**Les còpies del codi:**
- **El PC:** `claude-origins-b2serie`, una còpia de treball de git a l'etiqueta (`git describe` dona `preregistre-b2`), sense
  canvis als fitxers seguits.
- **La màquina virtual:** `~/claude-origins-67fe2f6`, desplegada amb `eines/desplega-vm.sh` (`VERSIO`: `67fe2f6`).

**Les captures** (AU2-66, AUD-98): `node eines/b2-captures.mjs`, sense `--maquina`, és a dir, les 29.
- **Al PC:** 29 de 29 correctes. Node v16.15.1, 2026-10-20T19:49:27Z (`captures-pc.txt`).
- **A la màquina virtual:** 29 de 29 correctes. Node v20.19.2, 2026-10-20T19:49:49Z (`captures-vm.txt`).
  - **D'on venen:** de la còpia del PC, i abans no n'hi havia cap.

**Les llistes** (`node fase2/b2-confirmacio.mjs --llistes`), amb els noms opacs del manifest:

| Llista | Branques | SHA-256 |
|---|---|---|
| `llista-pc.txt` | 60 | `b02bfe7c7d9c43536f7b56b6db7666524c599d8cf523f7c69f00e5a59bc9980b` |
| `llista-vm.txt` | 56 | `33e5c73b4d01a8e3ab107ba0ab441290fcfda71cba7732b608d04fdb8bfbc7bd` (la mateixa a la màquina virtual) |

**Una declaració (AUD-93):** en comprovar `llista-pc.txt`, abans del llançament, Claude en va mostrar la primera línia a la
terminal. Aquesta línia diu de quin món i de quina condició és la branca `b001`. No és cap resultat. Durant la sèrie ningú
no obrirà les llistes ni els registres.

**Les màquines:**
- **El PC:** 4 branques alhora.
- **La màquina virtual:** 4 nuclis i 4 branques alhora.

**Les actualitzacions de Windows:** pausades pel responsable.
- **Comprovat al registre:** del 20-10-2026 a les 20:18:56Z fins al 27-10-2026 a les 20:18:56Z, tant les de
  qualitat com les de funcions.

**L'energia del PC:** connectat a la corrent, no s'adorm ni hiberna mai. Amb bateria, s'adorm als 5 minuts. Per
això, durant la sèrie, el PC ha d'estar endollat. Si s'adorm, s'aturen tots dos lots, perquè la màquina virtual hi
és a dins.

## El llançament

- **La màquina virtual:** el 20-10-2026 a les 22:19:42, amb `nohup bash eines/llanca-lot.sh 4 ... llista-vm.txt`
  i `codi=67fe2f6`.
- **El PC:** el 20-10-2026 a les 22:20:11, amb `bash eines/llanca-lot.sh 4 ... llista-pc.txt` en una finestra oculta
  i `codi=67fe2f6`.
- **El primer seguiment agregat:** 4 en marxa a cada màquina, i cap de fallat.
- **La pausa de Windows Update, allargada** pel responsable el 22-10-2026, perquè la màquina virtual anava més lenta:
  ara és fins al 24-11-2026 a les 20:18:56Z, comprovat al registre.

## Durant la sèrie

- **El seguiment:** només `bash eines/seguiment.sh --agregat`, que compta experiments sense noms ni resultats.
- **Si una màquina s'atura:** es torna a llançar el mateix lot. Les branques acabades se salten (protocol §7).

## Abans de decidir

- **AUD-89:** `sha256sum fase2/b2-confirmacio.mjs fase2/preregistre.mjs` contra el missatge de l'etiqueta, i que
  l'objecte de l'etiqueta sigui el segellat.
- **AUD-98:** les 29 captures, una altra vegada, a la màquina on es decideix.
- **La decisió:** `node fase2/b2-confirmacio.mjs --decideix fase2/resultats/b2/confirmacio`, des de la còpia de
  l'etiqueta. La sortida es desa tal com surt.

## El segell, completat (21-10-2026)

- **Les atestacions:** dues de Bitcoin, als blocs 972.374 (20-10-2026 20:25:42 UTC) i 972.387 (22:39:20 UTC).
  - **La comprovació:** l'arrel de Merkle de tots dos blocs coincideix amb el missatge atestat.
  - **On és:** `docs/preregistre-b2/` a `main`, `6aad7a6`.
- **Una precisió sobre l'hora:**
  - **El llançament:** la primera branca va començar a les 20:19:42 UTC.
  - **El primer bloc:** és de les 20:25:42, 6 minuts després.
  - **Què se'n demostra:** Bitcoin demostra que l'etiqueta existia abans de les 20:25:42. Que el segell es va enviar
    a les 19:48 ho registren els calendaris.
  - **Per què a la pràctica no hi afecta:** en 6 minuts cap branca no havia donat res que algú mirés.
  - **Per a les sèries següents:** abans de llançar, s'esperarà l'ancoratge a Bitcoin.

## El final de la sèrie (25-10-2026)

- **El PC:** el lot va acabar el 24-10-2026 a les 15:41:25, amb 60 branques acabades i cap de fallada.
- **La màquina virtual:** el lot va acabar el 25-10-2026 a les 00:57:23, amb 56 acabades i cap de fallada.
- **Els registres de la màquina virtual,** copiats al PC: la SHA-256 dels 56 JSONL, dels 56 registres de text i del
  lot coincideix amb la de la màquina virtual.
- **El seguiment agregat:** 116 de 116 acabades, cap de fallada, i els 116 registres complets.
- **Durant la sèrie** no s'ha mirat cap resultat. Només el recompte agregat de `eines/seguiment.sh --agregat`.

## Les comprovacions d'abans de decidir (25-10-2026)

- **AUD-89:** `sha256sum`, l'eina del sistema, dels cinc fitxers de la còpia de l'etiqueta. Tots cinc coincideixen
  amb el missatge de l'etiqueta. L'objecte de l'etiqueta (`b5778b99…`) té la SHA-256 del fitxer segellat
  (`bbd60bf2…`).
- **La còpia:** `HEAD` és `67fe2f6`, sense cap canvi als fitxers seguits, i amb `NODE_OPTIONS` buit.
- **AUD-98:** les 29 captures, una altra vegada, al PC: 29 de 29 correctes (`captures-decisio.txt`).

## La decisió (25-10-2026)

- **Quan i des d'on:** a la 01:18 (+02:00), des de la còpia de l'etiqueta, amb `NODE_OPTIONS` buit.
- **L'ordre:** `node fase2/b2-confirmacio.mjs --decideix fase2/resultats/b2/confirmacio > decisio-sortida.txt`.
- **El codi de sortida:** 0.
- **La sortida,** desada tal com va sortir: `decisio-sortida.txt`, SHA-256
  `92ddeb0b6af9354e87b697183d7b681ab1e73257131e6b8152051f3b2f948fe7`.
- **Una comprovació independent,** amb un script que no fa servir cap funció del programa, dona els mateixos recomptes:
  - l'expansió, 22 de 29 (A 10, B 12);
  - el canvi de règim, 3, 3 i 23;
  - S_orig = 93,1 %.

  Els registres són de 29 mons de confirmació, cap de l'exploració, amb 58 llavors.

## Addenda: l'auditoria 14 (25-10-2026)

Els dos auditors van reproduir la decisió byte a byte des de la còpia de l'etiqueta i en van refer els recomptes pel seu
compte. L'acta queda com estava. Hi afegim el que van demanar:
- **Cap relançament** (auditoria 14, auditor 1). Els dos lots van acabar sense cap branca fallada ni cap branca saltada
  per ja feta: `lot-llista-pc.out` i `lot-llista-vm.out`.
- **Què hi havia escrit abans de l'ancoratge a Bitcoin** (AUD-104, AU2-76). El bloc 972.374 porta l'hora 20:25:42 UTC,
  331 s després de començar el lot del PC i 360 s després del de la màquina virtual.
  - **Les mesures:** les primeres branques ja n'havien escrit. Al PC, la primera de cada branca és als 26, 77, 80 i 121 s.
  - **Els censos:** al PC, b002 i b004 havien escrit el primer cens, a uns 158 s i 289 s. Cap branca no tenia el segon
    cens, i per tant cap no podia mostrar una pèrdua R2. A la màquina virtual, cap no havia escrit cap cens.
  - **La frase de la secció "El segell, completat"**, "en 6 minuts cap branca no havia donat res que algú mirés", era
    massa forta. El que és exacte: ningú no va mirar cap registre ni va intervenir en cap branca. Ho declara aquesta
    acta, i no ho pot demostrar Bitcoin.
