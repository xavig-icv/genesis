# El preregistre de la prova dels zeros i el seu segell

**L'etiqueta:** `preregistre-zeros`, anotada, objecte `2fb903b0eae252b2a2c78cb764e33b36b065a5ae`, sobre el commit
`2628f9b1e693cededb3480529e6ef15bd2e88f32` (el merge de la PR #22).
- **Qui i quan:** la va crear Claude, amb el permís del responsable, el 27-10-2026 a les 07:19:53 UTC. Tots dos auditors hi
  havien donat el GO a l'auditoria 18.
- **El missatge** porta:
  - la SHA-256 del manifest, del protocol (v0.3) i dels set fitxers del programa (`docs/protocol-zeros.md`, §9);
  - la llista dels fitxers de codi que canvien respecte de la preparació (`4fa032b`).

**Els fitxers d'aquesta carpeta:**
- **`preregistre-zeros.tag`:** l'objecte de l'etiqueta, tal com el guarda git (`git cat-file tag preregistre-zeros`).
  - Té 1.930 bytes.
  - La seva SHA-256 és `23c4b30c3ade44c1d86368bc6bc17315d1b5eda37b38ce537ac7a1c364a2b72f`.
  - El seu identificador de git, el SHA-1 de `tag 1930\0` seguit del contingut, és `2fb903b0…`.
- **`preregistre-zeros.tag.ots`:** la prova d'OpenTimestamps d'aquest fitxer.
  - **Quan:** es va segellar el 27-10-2026 a les 07:21:01 UTC.
  - **Qui va respondre:** dos calendaris, `b.pool.opentimestamps.org` i `ots.btc.catallaxy.com`. Els altres dos de la
    llista per defecte tenien el certificat caducat.
  - **Què s'hi va enviar:** només un hash, el del fitxer amb un nonce aleatori.
  - **Si és completa:** sí, amb dues atestacions de Bitcoin, la del bloc 973.367 i la del 973.378.
    - **La primera:** de `bob.btc.calendar.opentimestamps.org`, amb la transacció
      `b429782c12f12ba6608c11de714730686e028daa82565de17ca1f703c9653b2e`. El calendari dona la prova quan el bloc té 6
      confirmacions.
    - **La segona:** de `btc.calendar.catallaxy.com`, amb la transacció
      `463e4ad7f8440f2dbbca7dafcac3a953c2f37489c1d074bd71b12325054d5dc0`, al bloc 973.378. Quan es van llançar les
      branques, encara era pendent. La vam afegir al fitxer el mateix dia, quan el calendari la va donar.
    - **La comprovació:** l'arrel de Merkle de tots dos blocs coincideix amb el missatge atestat (comprovat amb
      blockstream.info).
    - **Per què dues:** la prova no depèn d'un sol calendari. La que data l'etiqueta és la primera, la del bloc més antic.

**L'ordre, hora a hora (UTC):**
- **07:19:53:** l'etiqueta.
- **07:20:** l'etiqueta, a GitHub.
- **07:21:01:** el segell s'envia als calendaris.
- **07:43:35:** l'hora del bloc 973.367, que l'ancora.
- **08:28:** el bloc més alt de la cadena és el 973.372. El 973.367 ja té 6 confirmacions.
- **08:34:** el calendari dona la prova completa. A les 08:34:49 en comprovem l'arrel de Merkle.
- **08:35:00:** `node eines/pilot.mjs zeros --comprova` al PC, "tot correcte".
- **08:35:08:** comença el lot del PC. La primera línia del lot és de les 08:35:09.
- **08:35:16:** `--comprova` a la màquina virtual, "tot correcte".
- **08:35:19:** comença el lot de la màquina virtual.
- **09:37:13:** l'hora del bloc 973.378, el de la segona atestació. El calendari la dona a les 11:23, i la comprovem tot
  seguit.

**El que demostra:**
- **Bitcoin,** sense confiar en ningú, demostra que l'etiqueta existia quan es va minar el bloc 973.367.
  - **L'hora del bloc,** 07:43:35, la posa qui el mina, i el consens només la fita a grans trets.
  - **Aquí no hi fa res:** el bloc és de 51 minuts abans de la primera branca, i quan es van llançar ja en tenia cinc més al
    damunt.
- **A B2 no va ser així:** el bloc que l'ancorava és de 6 minuts després de la primera branca (`docs/preregistre-b2/`).
  Després de B2 vam decidir esperar l'ancoratge abans de llançar, i aquesta és la primera sèrie que ho fa.
- **El que Bitcoin no demostra:** que ningú no mirés cap registre abans de la decisió. Això ho diu l'acta
  (`fase2/resultats/zeros/serie/acta.md`).

**Com es comprova:**
1. **Que el fitxer és l'objecte de l'etiqueta:** `git cat-file tag preregistre-zeros | sha256sum` ha de donar
   `23c4b30c…a2b72f`.
2. **El segell:** `ots verify preregistre-zeros.tag.ots`, amb el client oficial (`opentimestamps-client`) i un node de
   Bitcoin, o bé amb un explorador de blocs. El format és l'estàndard, i qualsevol client el llegeix.
3. **Que el preregistre és el d'aquest commit:** des d'una còpia neta de l'etiqueta,
   `node fase2/zeros-confirmacio.mjs --decideix fase2/resultats/zeros/serie/branques` en comprova l'etiqueta, la còpia i les
   SHA-256 abans de calcular res.

**Una nota tècnica:** el segell es va fer com el de B2 (`docs/preregistre-b2/LLEGEIX-ME.md`).
- **Per què no amb el client oficial:** la versió 0.7.2 no funciona a Windows, perquè la seva dependència `python-bitcoinlib`
  no hi troba una biblioteca OpenSSL compatible.
- **Com es va fer:** amb la biblioteca base `opentimestamps` 0.4.5 i el mateix procediment que `ots stamp`. És a dir, el
  SHA-256 del fitxer, un nonce de 16 bytes, l'arbre de Merkle i com a mínim dues respostes de calendari.
- **El que no canvia:** el fitxer `.ots` és el mateix que en sortiria, i la verificació no en depèn.
