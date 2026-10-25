# Acta del pilot de la maduració de la sopa

**El disseny:** `docs/pilot-maduracio.md` (v2), revisat a les auditories 15 i 16. És un pilot: no en surt cap conclusió, i els
seus mons no entren a cap sèrie.

## L'envelliment (25-10-2026)

- **El codi:** el commit `3b0cdc0` (el merge de la PR #20), en una còpia de treball del PC sense cap canvi als fitxers seguits.
- **La llista:** `node eines/pilot.mjs maduracio --envelliment`, desada com a `llista-envelliment.txt`.
  - **Què hi ha:** els 24 mons nous, de la llavor 5001 a la 5024, fins a l'època 8.000, amb `--stop-after-event 0`.
  - **La SHA-256:** `9f63545de8a4ef4dbdae14b63e8d151a9af7ded96149364d3943b48d20f5c309`.
- **El llançament:** el 25-10-2026 a les 16:06:07 (+01:00), al PC, amb `bash eines/llanca-lot.sh 6 ...` en una finestra oculta.
  - **Quants alhora:** 6.
  - **Els registres** porten `codi=3b0cdc0`.
- **Abans de la comprovació breu de l'auditoria 16** (X-051):
  - **Per què:** l'envelliment no depèn de res del que s'hi revisa, i tots tres vam estar d'acord amb l'edat 8.000.
  - **Què es farà després:** cap branca no es llança abans del GO.
- **Les actualitzacions de Windows:** pausades fins al 24-11-2026 a les 20:18:56Z, comprovat al registre.
- **L'energia:** el PC és connectat a la corrent.
- **Durant l'envelliment:** només `bash eines/seguiment.sh --agregat`.
