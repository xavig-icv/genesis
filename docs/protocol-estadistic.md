# Protocol estadístic · sèrie confirmatòria de la llei 2

**Estat: esborrany v0.1, per revisar a l'auditoria 2.** No s'ha llançat cap experiment d'aquesta
sèrie. Quan el protocol estigui aprovat, el commit que el fixi farà de preregistre: qualsevol canvi
posterior s'haurà de justificar aquí mateix, amb data i motiu, abans de mirar els resultats.

Respon a AUD-06 de l'auditoria 1. La sèrie de 15 llavors (entrada 6 del quadern) va ser exploratòria:
fa servir el generador v1, amb llavors no independents, i el criteri i la prova es van triar després de
veure les dades. Aquí es fixa tot abans.

## 1. Pregunta

Al món 2D, un corrent feble (barreja *m* = 0,01) fa que la vida neixi **més sovint o abans** que al món
quiet (*m* = 0)?

## 2. Hipòtesis

- **H0:** el corrent no canvia el ritme d'aparició de la vida (mateixa funció de risc).
- **H1:** el ritme d'aparició és diferent amb corrent (bilateral). L'exploració suggereix que és més alt,
  però la prova és bilateral per no comprometre-nos amb la direcció.

## 3. Disseny

| | |
|---|---|
| Condicions | A: *m* = 0 (món quiet) · B: *m* = 0,01 |
| Món | 512 × 256, radi 2, sense difusió, sense flux, mutació 0,00024 (la de l'article) |
| Generador | v2 (xoshiro128\*\*) |
| Llavors | A: 1001–1050 · B: 2001–2050 (blocs separats: grups independents) |
| Horitzó | 16.000 èpoques. Les dues condicions tenen el mateix ritme d'aparellament (75 %), així que tenen el mateix nombre d'interaccions per època |
| Codi | Un sol commit per a tota la sèrie, sense `+canvis` als registres. Execució des d'una instantània del commit (`desplega-vm.sh` a la VM; `git worktree` al PC) |
| Ordre | `node sim.mjs --world 512x256 --seed S --mixing M --epochs 16000 --every 100 --census 250 --after 1000 --rng v2` |

## 4. Mesura principal: el moment de l'aparició

**Hi neix vida** a l'època *t* si el cens de famílies (registre v2, `fase2/families.js`, cada 250
èpoques) troba **una família que ocupa almenys l'1 % del mapa en dos censos seguits**, i *t* és l'època
del primer d'aquests dos censos. Si no passa abans de l'època 16.000, l'experiment queda **censurat** a
la 16.000.

Motiu: és un criteri basat en la prova de replicació directa, detecta la vida local (cosa que no fa
l'entropia global) i exigeix que duri, de manera que un esclat que mor en menys de 250 èpoques no compta.

**Regla d'aturada.** `sim.mjs` atura l'experiment 1.000 èpoques després que l'entropia d'ordre
superior superi 1 bit. Amb censos cada 250 èpoques, això deixa marge perquè es compleixi el criteri
principal. Si en algun cas l'experiment s'atura abans que el criteri es pugui avaluar, es tornarà a
executar sense aturada (`--after 99999`) amb la mateixa llavor, i es documentarà.

## 5. Mesures secundàries (descriptives)

1. L'aparició segons l'entropia d'ordre superior (> 1 bit), com a l'exploració, per comparar-les.
2. La fracció de la mostra que es replica al final.
3. Si la vida es manté: família ≥ 1 % del mapa 1.000 èpoques després de l'aparició.

## 6. Mida de la mostra

**50 llavors per condició (100 experiments).** Potència exacta de la prova de Fisher bilateral amb
α = 0,05, calculada sumant sobre tots els resultats possibles:

| Llavors per condició | 20 % contra 50 % | 20 % contra 45 % | 20 % contra 40 % |
|---|---|---|---|
| 30 | 60 % | 44 % | 30 % |
| 40 | 75 % | 59 % | 41 % |
| **50** | **85 %** | **71 %** | **52 %** |

El 20 % contra el 50 % és el que va donar l'exploració (3 de 15 contra 8 de 15), però és una estimació
amb molta incertesa, i és probable que l'efecte real sigui una mica més petit (la "maledicció del
guanyador"). Per això 50 i no 40. La prova principal (log-rank) també fa servir el moment de l'aparició
i hauria de tenir una potència una mica més alta que la de Fisher.

Si la diferència real és més petita, potser no la detectarem: un resultat negatiu s'interpretarà com
"no es pot afirmar", no com "no hi ha efecte", i s'informarà igual.

## 7. Anàlisi

- **Prova principal (una sola):** log-rank bilateral sobre el temps fins a l'aparició, amb censura a
  l'època 16.000. α = 0,05.
- **Secundàries, descriptives:** corbes de Kaplan–Meier per condició; prova exacta de Fisher bilateral
  sobre la proporció d'aparicions; les mesures de §5. No es corregeix per comparacions múltiples
  perquè no se'n treu cap conclusió confirmatòria.
- **Exclusions:** cap. Un experiment que falli per un error tècnic es torna a executar amb la mateixa
  llavor (el resultat és determinista) i es documenta.
- La sèrie exploratòria **no s'ajunta** amb aquesta.

## 8. Què es comunicarà

- **Resultat positiu:** log-rank *p* < 0,05. Es dirà que, en aquest món, el corrent canvia el ritme
  d'aparició de la vida, en la direcció observada.
- **Resultat negatiu o no concloent:** *p* ≥ 0,05. Es dirà que aquesta sèrie no permet afirmar-ho, amb
  la mida de l'efecte observat i el seu interval.
- En tots dos casos: taula completa per llavor, corbes de Kaplan–Meier i els registres a git.

## 9. Cost i execució

Uns 100 experiments d'1 hora de mitjana (més quan neix la vida). A la VM, 3 alhora: ~33 hores. Repartits
entre la VM i el PC: ~20 hores.

## 10. Preguntes obertes per a la revisió

1. És adequat el criteri principal (família ≥ 1 % del mapa en dos censos seguits)? Hauria de ser ≥ 5 %?
2. Cal un disseny aparellat (mateixa sopa inicial per a A i B, amb la mateixa llavor) en lloc de grups
   independents? Reduiria la variància, però la història divergeix de seguida, perquè el corrent fa servir
   l'atzar.
3. És raonable mantenir l'aturada a 1.000 èpoques després de l'entropia, o és millor córrer sempre fins
   a 16.000 encara que costi més?
4. 50 llavors per condició és prou, tenint en compte la incertesa de l'estimació exploratòria?
