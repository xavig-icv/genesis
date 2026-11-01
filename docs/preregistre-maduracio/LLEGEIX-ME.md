# El preregistre de la sèrie de la maduració i el seu segell

**L'etiqueta:** `preregistre-maduracio`, anotada, objecte `6e95a287ad7a92d3f0b5c39e3ed6658a0a141589`, sobre el commit
`416f72095bbc2fb3fdb49e46350994cf66ddb0a8`. És la correcció de la barrera de `--prova` (la PR #29), sobre el merge de la PR #28.
- **Qui i quan:** la va crear Claude, amb el permís del responsable, l'1-11-2026 a les 13:31:02 UTC. Tots dos auditors hi havien
  donat el GO a l'auditoria 24, després de les auditories 19 a 23.
- **El missatge** porta:
  - la SHA-256 del manifest, del protocol (v0.5) i dels onze fitxers del programa (`docs/protocol-maduracio.md`, §9);
  - la llista dels fitxers que canvien respecte de la preparació (`d775174`);
  - la sortida sencera de `node eines/llindars-maduracio.mjs --comprova-certificat`, a la còpia d'aquest commit, abans de l'etiqueta.
- **El commit, comprovat:** el programa de la decisió no llegeix la línia "Commit:" del missatge (AUD-138). Abans de pujar
  l'etiqueta i de segellar-la, `git rev-parse preregistre-maduracio^{commit}` va donar `416f720…`.

**Els fitxers d'aquesta carpeta:**
- **`preregistre-maduracio.tag`:** l'objecte de l'etiqueta, tal com el guarda git (`git cat-file tag preregistre-maduracio`).
  - Té 3.771 bytes.
  - La seva SHA-256 és `20d3451a94cf73fc4b1ad62f6b2fe49511750c6af694482348204ef62fddb724`.
  - El seu identificador de git, el SHA-1 de `tag 3771\0` seguit del contingut, és `6e95a287…`.
- **`preregistre-maduracio.tag.ots`:** la prova d'OpenTimestamps d'aquest fitxer.
  - **Quan:** es va segellar l'1-11-2026 a les 13:32:24 UTC.
  - **Qui va respondre:** dos calendaris, `b.pool.opentimestamps.org` i `ots.btc.catallaxy.com`. Els altres dos de la llista per
    defecte tenien el certificat caducat, com als zeros.
  - **Què s'hi va enviar:** només un hash, el del fitxer amb un nonce aleatori.
  - **L'atestació de Bitcoin:** la del bloc 974.134, de `bob.btc.calendar.opentimestamps.org`, amb la transacció
    `e250cf36478e1dcded8a8f54757e1b38a52b8771c17cf2157cdbf0b083fe18ba`.
    - **Quan la dona el calendari:** quan el bloc té 6 confirmacions.
    - **La comprovació:** l'arrel de Merkle del bloc coincideix amb el missatge atestat (comprovat amb blockstream.info).
    - **La segona,** la de `btc.calendar.catallaxy.com`, encara era pendent quan es van llançar les branques. L'afegirem al
      fitxer quan el calendari la doni. La que data l'etiqueta és la primera.

**L'ordre, hora a hora (UTC, l'1-11-2026):**
- **13:31:02:** l'etiqueta.
- **13:31:12:** l'etiqueta, a GitHub.
- **13:32:24:** el segell s'envia als calendaris.
- **14:21:50:** l'hora del bloc 974.134, que l'ancora.
- **14:23:35:** el calendari ja diu que el segell és a la transacció `e250cf36…`, i n'espera 6 confirmacions.
- **15:28:54:** el calendari dona la prova completa. A les 15:29 en comprovem l'arrel de Merkle.
- **15:29:41 i 15:30:32:** `node eines/pilot.mjs serie --comprova`, al PC i a la màquina virtual, "tot correcte".
- **15:31:32:** el primer intent de llançament, que el llançador rebutja sense escriure res (l'acta, la incidència 1).
- **15:36:56:** comença el lot del PC, després d'un altre `--comprova`.
- **15:37:10:** comença el lot de la màquina virtual, també després d'un altre `--comprova`.

**El que demostra:**
- **Bitcoin,** sense confiar en ningú, demostra que l'etiqueta existia quan es va minar el bloc que l'ancora.
  - **L'hora del bloc** la posa qui el mina, i el consens només la fita a grans trets.
  - **Com als zeros,** cap branca no es va llançar abans que el bloc tingués prou confirmacions perquè el calendari en donés la
    prova completa.
- **El que Bitcoin no demostra:** que ningú no mirés cap registre abans de la decisió. Això ho diu l'acta
  (`fase2/resultats/maduracio/serie/acta.md`).

**Com es comprova:**
1. **Que el fitxer és l'objecte de l'etiqueta:** `git cat-file tag preregistre-maduracio | sha256sum` ha de donar
   `20d3451a…62fddb724`.
2. **El segell:** `ots verify preregistre-maduracio.tag.ots`, amb el client oficial (`opentimestamps-client`) i un node de Bitcoin,
   o bé amb un explorador de blocs. El format és l'estàndard, i qualsevol client el llegeix.
3. **Que el preregistre és el d'aquest commit:** des d'una còpia neta de l'etiqueta,
   `node fase2/maduracio-confirmacio.mjs --decideix fase2/resultats/maduracio/serie/branques` en comprova l'etiqueta, la còpia i les
   SHA-256 abans de calcular res.

**Una nota tècnica:** el segell es va fer com el dels zeros (`docs/preregistre-zeros/LLEGEIX-ME.md`), amb els mateixos scripts.
- **Per què no amb el client oficial:** la versió 0.8.0 tampoc no funciona a Windows, per la seva dependència
  `python-bitcoinlib`.
- **Com es va fer:** amb la biblioteca base, ara a la versió 0.5.0 (als zeros, la 0.4.5), i el mateix procediment que
  `ots stamp`. És a dir, el SHA-256 del fitxer, un nonce de 16 bytes, l'arbre de Merkle i com a mínim dues respostes de calendari.
- **El que no canvia:** el fitxer `.ots` és el mateix que en sortiria, i la verificació no en depèn.
