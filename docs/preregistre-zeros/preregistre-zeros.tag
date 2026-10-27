object 2628f9b1e693cededb3480529e6ef15bd2e88f32
type commit
tag preregistre-zeros
tagger xavig-icv <xavig-icv@users.noreply.github.com> 1793085593 +0100

Preregistre de la prova dels zeros: treure l'enverinament des de la mateixa captura

Commit: 2628f9b1e693cededb3480529e6ef15bd2e88f32, el merge de la PR #22. Tots dos auditors
hi van donar el GO a l'auditoria 18 (26-10-2026), després de les auditories 15 a 17.

Empremtes SHA-256, calculades sobre aquest commit:
788f260c7ba3aa77fdb58a4a834ca8eb4d6f8f90d86d781475a0db2b0abc2e8f  fase2/resultats/zeros/serie/manifest.json
3083791c8841ec86b846223ec31d9fff5ff97dfec57241545e19e528b1bd0747  docs/protocol-zeros.md (v0.3)
2061468b2fb0c3e96a3da52e9a2b81cacc78440d61a64ff8cbfc34d35bdd3283  fase2/zeros-confirmacio.mjs
e62fd9cf346100b3ceb70e5bdec19fe564b7601a2ea9653148a6361e5d8689cc  fase2/zeros-serie.mjs
b4b05e870ea7a41003f232583de17cf732fd67ff9c056d2154093eb840ea16d4  fase2/b2-serie.mjs
3b8be23e5cdeb08ef3fe86166e174595889e834aa7b1d0320a0c165de5e06179  fase2/census.js
624e67c463ef2c1429f84c6c42e0359ca263bd3370f9b8284b261edbaf34d830  fase2/preregistre.mjs
a7c3ae6b8902c5f1e689b0b34dea07248f32aa769388b6b4d4bb1999f8fd7642  eines/transforma.mjs
0d3b79c2fb4e98b4ccef0c00d41a4cfd76ef8deb728b7be99b46ebeab028197a  eines/pilot.mjs

El codi, respecte del de la preparació (4fa032b), fora de docs/ i de fase2/resultats/
(git diff --name-only 4fa032b 2628f9b1e693cededb3480529e6ef15bd2e88f32):
  fase2/zeros-serie.mjs
  test/zeros-confirmacio.mjs
Només hi canvien la frase del no-rebuig de decisionLines() i la seva prova (AU2-89).

Les 132 branques es llancen des d'una còpia d'aquest commit exacte, i la decisió només es
pren des d'una còpia d'aquest commit, amb
node fase2/zeros-confirmacio.mjs --decideix fase2/resultats/zeros/serie/branques
L'objecte d'aquesta etiqueta es segella amb OpenTimestamps, i cap branca no es llança
abans de l'ancoratge a Bitcoin (protocol §9).
