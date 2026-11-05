object 416f72095bbc2fb3fdb49e46350994cf66ddb0a8
type commit
tag preregistre-maduracio
tagger xavig-icv <xavig-icv@users.noreply.github.com> 1793539862 +0100

Preregistre de la sèrie de la maduració: l'edat i la composició de la sopa

Commit: 416f72095bbc2fb3fdb49e46350994cf66ddb0a8, la correcció de la barrera de --prova
(AU2-100 i AUD-133, la PR de la branca au2-100-barrera), sobre el merge de la PR #28 (003a9dd).
Tots dos auditors hi van donar el GO a l'auditoria 24 (01-11-2026), després de les auditories 19 a 23.

Empremtes SHA-256, calculades sobre aquest commit:
d2b96f78b2e84fc77c92e6d8ce37d6db668649bfdb5e6b062e87fa1409895b85  fase2/resultats/maduracio/serie/manifest.json
5be4e827e1d5ea9da49ea5abaa26d246e3192808755999040de87accdc741708  docs/protocol-maduracio.md
71dba140b8e376d7cd353cd7310f2141d9782a46f2ee1c5db7b8e16ef3d096c9  fase2/maduracio-confirmacio.mjs
1006d04fc33180f0e0a2a5ba4e9f9a7842ca5c0ba3f6baec272aaf644de467dd  fase2/maduracio-serie.mjs
b4b05e870ea7a41003f232583de17cf732fd67ff9c056d2154093eb840ea16d4  fase2/b2-serie.mjs
3b8be23e5cdeb08ef3fe86166e174595889e834aa7b1d0320a0c165de5e06179  fase2/census.js
40d3278918b5ccab632890ca3ce4e3a300b0a47f5bfe29dd5066e036831cafd1  fase1/soup.js
624e67c463ef2c1429f84c6c42e0359ca263bd3370f9b8284b261edbaf34d830  fase2/preregistre.mjs
950991ea70f75534eacae78c374ac5013e68fae0b317e155b21119513920121f  fase2/maduracio-llindars.json
00ca98753d5071270c85f09c9f47119026824234182ce8500dfc1cb4c4abc448  fase2/maduracio-llindars-certificat.json
f453ae468bb7741cffb42a65f42bfdefd2f4e114124455dd31a3bb284b1bf81e  eines/llindars-maduracio.mjs
a7c3ae6b8902c5f1e689b0b34dea07248f32aa769388b6b4d4bb1999f8fd7642  eines/transforma.mjs
3fe842d6b69486551514664427efd140b14d409206686ec1755f16ff99b09f66  eines/pilot.mjs

El manifest, els registres de la preparació i les llistes són de d775174. Respecte d'aquell
commit (git diff --name-only d775174 416f72095bbc2fb3fdb49e46350994cf66ddb0a8):
  docs/protocol-maduracio.md
  fase2/maduracio-confirmacio.mjs
  test/maduracio-serie.mjs
  test/pilot.mjs
La prova de test/pilot.mjs es fa en un repositori mínim, sense cap manifest (PR #28). La barrera
de --prova llegeix byte a byte la primera línia no buida de cada registre, i ni un byte més, i el
protocol passa a la v0.5, sense cap regla nova (auditoria 23). Els altres onze fitxers d'aquest
missatge són idèntics als de d775174.

La sortida de --comprova-certificat, a la còpia d'aquest commit, abans de l'etiqueta:
302 llindars (m de 0 a 150, els dos passos). La cota superior, com a molt α: 302; com a molt α·(1 − 10⁻⁴), el criteri de la taula: 302
  el més a prop d'α al pas 1: m = 77, el suprem entre 1.249691 % i 1.249692 % (0.999753·α)
  el més a prop d'α al pas 2: m = 108, el suprem entre 2.499740 % i 2.499740 % (0.999896·α)
K és el més gran (el suprem del recompte següent passa del criteri): 289 de 289 (els altres 13, sense cap recompte més fins al nominal)
El recompte següent seria vàlid, i només el marge de 10⁻⁴ l'exclou: 3
  m = 55, pas 2: el suprem del recompte següent entre 2.49998 % i 2.49999 %
  m = 121, pas 1: el suprem del recompte següent entre 1.24989 % i 1.24993 %
  m = 140, pas 2: el suprem del recompte següent entre 2.49980 % i 2.49984 %
particions: 7366
El certificat és el de la taula, totes les cotes són com a molt α, i les files de m = 0 a 150 són les que surten del càlcul.

Les 900 branques es llancen des d'una còpia d'aquest commit exacte, i la decisió només es
pren des d'una còpia d'aquest commit, amb
node fase2/maduracio-confirmacio.mjs --decideix fase2/resultats/maduracio/serie/branques
L'objecte d'aquesta etiqueta es segella amb OpenTimestamps, i cap branca no es llança
abans de l'ancoratge a Bitcoin (protocol §9).
