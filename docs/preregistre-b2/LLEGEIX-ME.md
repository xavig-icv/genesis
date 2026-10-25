# El preregistre de B2 i el seu segell

**L'etiqueta:** `preregistre-b2`, anotada, objecte `b5778b99b2c624d3de9349415f69d48c27e2395c`, sobre el commit
`67fe2f608e3d15424be0b321c17e1e19e1f0daa2`. La va crear el responsable el 20-10-2026, després del GO dels dos
auditors a l'auditoria 13. El missatge porta la SHA-256 del manifest, del protocol (v0.7) i dels tres fitxers del
programa (`docs/protocol-b2.md`, §9).

**Els fitxers d'aquesta carpeta:**
- **`preregistre-b2.tag`:** l'objecte de l'etiqueta, tal com el guarda git (`git cat-file tag preregistre-b2`).
  - Té 1.154 bytes.
  - La seva SHA-256 és `bbd60bf26288a0c39635b15509308a0e7c811e894f7b84160432c61246f3717b`.
  - El seu identificador de git, el SHA-1 de `tag 1154\0` seguit del contingut, és `b5778b99…`.
- **`preregistre-b2.tag.ots`:** la prova d'OpenTimestamps d'aquest fitxer.
  - **Quan:** es va segellar el 20-10-2026 a les 21:48 (+02:00), abans de la primera branca de la sèrie.
  - **Qui va respondre:** dos calendaris, `b.pool.opentimestamps.org` i `ots.btc.catallaxy.com`. Els altres dos de la
    llista per defecte tenien el certificat caducat.
  - **Què s'hi va enviar:** només un hash, el del fitxer amb un nonce aleatori.
  - **Si és completa:** sí. El 21-10-2026 es va completar amb les atestacions de Bitcoin, l'equivalent d'`ots upgrade`.
    - **El bloc 972.374,** del 20-10-2026 a les 20:25:42 UTC (via `bob.btc.calendar.opentimestamps.org`).
    - **El bloc 972.387,** de les 22:39:20 UTC (via `btc.calendar.catallaxy.com`).
    - **La comprovació:** l'arrel de Merkle de tots dos blocs coincideix amb el missatge atestat (comprovat amb
      blockstream.info).

**El que demostra, hora a hora (UTC), i una precisió:**
- **19:48:** el segell s'envia als calendaris.
- **20:19:42:** comença la primera branca de la sèrie, a la màquina virtual. La del PC comença a les 20:20:11.
- **20:25:42:** el bloc 972.374 l'ancora.
- **Què demostra cadascun:**
  - **Bitcoin,** sense confiar en ningú, demostra que l'etiqueta existia quan es va minar el bloc 972.374, que porta
    l'hora 20:25:42, **uns 6 minuts després** de començar la primera branca.
    - **L'hora del bloc** la posa qui el mina, i el consens només la fita a grans trets. A l'escala de minuts,
      Bitcoin no ordena l'ancoratge i el llançament: l'ordre el donen els calendaris (auditoria 14).
  - **Que el segell es va enviar 31 minuts abans del llançament** ho registren els calendaris, i per creure-ho cal
    confiar en ells.
- **Què hi havia escrit abans de l'ancoratge** (AUD-104, AU2-76): les primeres mesures de les branques que corrien,
  i el primer cens de dues branques del PC, b002 (a uns 158 s) i b004 (a uns 289 s). Cap no tenia el segon cens, i
  per tant cap no podia mostrar una pèrdua R2.
- **Per què a la pràctica no hi afecta:** ningú no va intervenir en cap branca, i la decisió es va prendre 4 dies
  després amb el programa de l'etiqueta. Que ningú no va mirar cap registre ho diu l'acta, no Bitcoin.
  *(Corregit a l'auditoria 14: deia que "en aquests 6 minuts cap branca no havia pogut donar cap resultat que algú
  mirés".)*
- **D'on ve:** el protocol (§9) deia "abans de la primera branca", i es va llegir com "enviar-lo". A les sèries
  següents, s'esperarà l'ancoratge a Bitcoin abans de llançar.

**Com es comprova:**
1. **Que el fitxer és l'objecte de l'etiqueta:** `git cat-file tag preregistre-b2 | sha256sum` ha de donar
   `bbd60bf2…f3717b`.
2. **El segell:** `ots verify preregistre-b2.tag.ots`, amb el client oficial (`opentimestamps-client`) i un node de
   Bitcoin, o bé amb un explorador de blocs. El format és l'estàndard, i qualsevol client el llegeix.
3. **Que el preregistre és el d'aquest commit:** des d'una còpia neta de l'etiqueta,
   `node fase2/b2-confirmacio.mjs --decideix CARPETA` en comprova l'etiqueta, la còpia i les SHA-256 abans de calcular
   res.

**Una nota tècnica:** el client oficial 0.7.2 no funciona a Windows, perquè la seva dependència `python-bitcoinlib` no
hi troba una biblioteca OpenSSL compatible.
- **Com es va fer el segell:** amb la biblioteca base `opentimestamps` 0.4.5 i el mateix procediment que `ots stamp`
  (el SHA-256 del fitxer, un nonce de 16 bytes, l'arbre de Merkle i com a mínim dues respostes de calendari).
- **El que no canvia:** el fitxer `.ots` és el mateix que en sortiria, i la verificació no en depèn.
