# B2 · Exploració: quant dura la vida establerta

**Exploratori.** Serveix per triar el disseny de la sèrie preregistrada de B2: l'horitzó, el llindar de
"mort" i quantes llavors de continuació cal fer. No n'ha de sortir cap conclusió. Només fa servir els 29
mons de la part `exploracio` de `../repartiment.json`; els de la part `confirmacio` no es toquen.

**Les branques.**
- Cada món es continua des de la captura de l'època *t* del seu establiment, amb *m* = 0 i amb
  *m* = 0,01: 58 branques en total.
- La llavor de continuació és la llavor d'origen + 100.000, la mateixa a les dues condicions.
- Durada: 2.000 èpoques (`--start t --epochs t+2000`), amb un cens v3 cada 250 i mesures cada 100.
- Ordre: `node sim.mjs --world 512x256 --seed S --mixing M --from <captura> --start t --epochs t+2000
  --every 100 --census 250 --census-version v3 --rng v2 --json <nom>.jsonl`. Les llistes són
  `llista-pc.txt` (15 mons) i `llista-vm.txt` (14 mons), i porten els mons alternats.

**La mesura, que s'analitzarà quan acabi:** la durada de la vida establerta. És el temps des de *t* fins
al primer de dos censos seguits amb menys de l'1 % d'hereditaris a la mostra, la "mort" de la vida
establerta. Si no passa, la durada queda censurada a les 2.000 èpoques. El llindar, la regla dels dos
censos i l'horitzó són provisionals: l'exploració ha de dir si són adequats.

**Execució.** Amb `llanca-lot.sh` (progrés només a fitxer) i `seguiment.sh`, des del commit de
desplegament a la VM i des d'un *worktree* d'aquest commit al PC. Les captures de partida es copien al
mateix camí relatiu a totes dues màquines, i se'n comprova la SHA-256 amb `../repartiment.json`.
