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
  - **Si és completa:** de moment, les atestacions estan pendents. Quan Bitcoin les confirmi, es completa la prova
    (`ots upgrade`) i es torna a desar.

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
