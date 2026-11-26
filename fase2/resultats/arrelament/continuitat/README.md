# A measure of continuity: 16 bytes in the dominant group's order (exploratory)

**The note, written before computing** (26 November 2026). The exploration lane (`docs/disseny.md`, 11-11-2026, with the practice added at
audit 45): this note goes into git before anything is computed on the pilot's branches, from a clean commit; the scripts and their outputs
as they come out; everything run before it, and after it outside the planned steps, in `previ/` with its output, stderr, exit code, times
and the SHA-256 of the code; one audit round afterwards. The owner chose this step on 26-11-2026 ("endavant amb la mesura de la
continuïtat", T-97), after audit 45.

## Where it comes from

The measure of descent of entry 28 (`../descendencia/`) counted how many of a cell's 63 pairs of adjacent bytes have their two origins in
the map of the dominant group's adjacent origins. At audit 45 both auditors found that it counts those pairs **anywhere in the cell, each
position counted**, and asks for no stretch of bytes in a row: it measures how much of the dominant group's **material** a cell carries,
not whether the cell holds its **order** (AUD-231 = AU2-225). Auditor 2's counterexample: the program cut into blocks of 2 bytes and
reordered scores 32 of 63 with no stretch longer than 2 bytes. Auditor 1's: pieces of 2 bytes of real carriers, reordered, reach the old
threshold 97–99 % of the time; a pair repeated over the cell scores 63; one of the four "copies" of entry 28 (world 7059 at 13,250) is a
mosaic of pieces of 4 bytes or fewer. The rule's "cannot tell" stood; what went with it did not.

**What all three agreed on at audit 45** (`docs/disseny.md`, the row of 26-11-2026): before any full record of copies, a measure of
continuity, **16 bytes in a row in the dominant group's order, passing over the cell's own mutations,** fixed before and tested with
adversarial cases of known answer, with the validators corrected. Auditor 1 added three classes instead of two (a copy, whole or mutated;
pieces of the dominant group's material; nothing of it), the neighbourhood as a description and not as a condition, the recount as a range
with the pieces at each end, "one origin" by a common run of 16 bytes, and keeping the origins of the scored cells in the records, so that
they can be scored again without running the branches. Auditor 2 asked for the run to be found **in one concrete carrier** (an ordered
substring of origins, forward or backward), for the map's habit of joining pairs from different carriers to be tested, for a fixed
abstention and admissible error, and for groups of comparable size when an appearance has several cells.

**The question:** of the appearances the time rule removes (the same 36 as entries 27 and 28), which carry 16 bytes or more of the dominant
group's order, which carry only pieces of its material, and which carry nothing of it? And, with those classes at each end of a range, is the
aged soup's excess of failed appearances shown?

**What has already been seen** (declared, so that nothing here is read as blind): every output of entries 27 and 28; and auditor 1's post
hoc numbers at audit 45 on the aged soup's seven branches (`auditor1/audit45/` in the audits repository): of the 16 aged time-rule
appearances, 2 with 16 bytes in a row in the map's order, 11 with 16 or more when one or two own mutations in a row are passed over, 5 in
pieces (the three of world 7059 and two of world 7052). **For the aged soup this note is therefore not independent of those numbers:** it
measures the same cells with a measure fixed before (and stricter: the run must sit in one carrier), with controls on each census. The
shuffled soup's seven appearances with a dominant group were not measured for continuity by anyone.

## What is measured, and how

**The same 18 branches and 36 appearances** as the small record and the descent note (`../registre-copies/llista.json`, SHA-256
`c0afb2c0f182f922…`), re-run from each branch's start capture and seed with the same instrumented world (`../registre-copies/mon.mjs`) and
the descent note's tracer (`../descendencia/traca.mjs`), both imported as they are. Every measure every 100 epochs and the final fingerprint
must again be those of the pilot record, or the branch fails and nothing of it is used. **Nothing is planted and no simulator is touched.**

**The origins** are the descent note's: each byte of the world is its own origin at the window's start (1,250 epochs; 250 as a
sensitivity); a copy passes the origin on; a mutation gives the byte a new origin of its own. **The run measures nothing:** at each tracked
census, `continuitat.mjs` keeps the origins of the cells the measures read (auditor 1's request): the dominant group's carriers (half A
whole, the donors; the first 1,000 of half B; 1,000 far cells at random), each appearance's cells with their flags, its 200 matched cells and
the cells around it. The halves and the matched cells are the descent note's (its seeds); the analysis checks that they are the same cells,
and that entry 28's thresholds and scores, recomputed from the saved origins, are the descent note's to the unit. **Everything is measured
by `analisi.mjs` from the records, with the functions of `mesura.mjs`.**

**The map** is the descent note's, built by its own function: the unordered pairs of origins of two adjacent bytes found in 1 % or more of
half A's carriers (at least 2; 0.5 % and 5 % as sensitivities).

**The main measure, the ordered run** (`orderedRun`): the longest run of a cell's consecutive bytes that sits, **in the same order, forward
or backward, at any offset, in one carrier of half A**, where:
- every pair of adjacent bytes of the run that are not passed over is a pair of the map (the dominant group's order, not one carrier's
  quirk);
- the run may pass over **the cell's own mutations** (an origin of a mutation that is not an origin of the map), at most 2 bytes in a row;
  they keep their place in the carrier (a substitution, not an insertion);
- the run starts and ends on a byte that is not passed over.

**The classes of a cell:** **ordered** if its ordered run is 16 bytes or more (the tracking's window); **pieces** if it is shorter but the cell
holds at least one pair of the map; **none** if it holds none. **The class of an appearance:** ordered if half or more of its cells are; none
if all are; otherwise pieces (each cell is measured on its own, never an average against single cells: AU2-226). The classes describe the
origins; "ordered" is not a genealogy shown (AU2-225): the cell holds 16 bytes or more in the order of the dominant group's carriers, made
within the window.

**Sensitivities, never read for the reading:** the window of 250 epochs; the map at 0.5 % and at 5 %; an appearance ordered if any of its
cells is; auditor 1's post hoc measure made exact (the longest run of map pairs passing over at most 2 own mutations where the map's order
passes, with no carrier: `mapRun`); the run in one carrier with no map condition (`donorRun`). Entry 28's score is printed beside them, to
connect the two notes.

**The controls of each census and context** (window and map; fixed; if one fails, the census's appearances are **unclassifiable**, the
abstention):
- **samples:** half B's sample 10 cells or more, the far sample 100 or more;
- **sensitivity:** 90 % or more of half B's sample ordered;
- **specificity of the material:** 95 % or more of the far sample none;
- **specificity of the order** (the adversarial controls, built from that census's own half B, far cells and map; `adversarial` in
  `mesura.mjs`; up to 500 cells per family; each family needs 10 cells or more):
  - half B's cells cut into pieces of 1, 2 and 4 bytes, the pieces reordered so that no two pieces consecutive in the source end up side by
    side: **5 % or fewer ordered**, each;
  - 16 pieces of 2 bytes of a half B cell placed in a far cell, likewise separated: **5 % or fewer**;
  - a pair of the map repeated over the whole cell (pairs that no carrier holds as three alternating bytes): **none ordered**;
- **sensitivity to own mutations:** half B cells whose ordered run is 32 bytes or more, with 4 own mutations at random places inside the run:
  **90 % or more ordered**;
- descriptive, never a condition: pieces of 8 and 16 bytes; 8 and 16 own mutations.

**The neighbourhood** (the 200 matched cells at the same distance from the dominant group, no tracked set): their classes and each cell's
percentile among their ordered runs, **as a description, never as a condition** (auditor 1 withdrew the condition at audit 45, AUD-232).

**One origin** (descriptive, never counted in the recount; AU2-228): two appearances of a census are joined if a cell of each holds the same
run of 16 bytes or more, in the same order, **outside the dominant group's order** (its pairs not map pairs: material they share that is not
D's; two copies of D share D's order and that alone does not join them; AUD-235); the local null, the pairs of their ring cells. Components,
not births.

**The recount: a range, with the pieces at each end** (auditor 1's request; counts of observed appearances per 1,000 world-epochs, the
aged/fresh ratio with the bootstrap over worlds, the within-world null note's seed; never a ratio of births, AU2-227). R0 (no rule) and R1
(the time rule) must come out as in that note. Then, for the time rule's appearances:
- **Rf, the pieces as fragments:** kept only if none;
- **Rb, the pieces as births:** kept if pieces or none;
- in both, the ones that cannot be classified are removed as by the time rule; **Rb+**, Rb with them kept (a sensitivity: in the fresh soup
  none can be classified, AU2-227).

**The reading, by rules fixed here:**
- **the aged soup** (and, apart, the shuffled soup): of the classifiable time-rule appearances, if two thirds or more are ordered, "two
  thirds or more carry 16 bytes or more in the dominant group's order, in one of its carriers, over their own mutations: by this measure,
  copies of its program, whole or mutated"; if two thirds or more are pieces, "they carry pieces of its material and no run of 16 in its
  order"; if two thirds or more are none, "nothing of its order made in the window"; otherwise "mixed";
- **the excess:** if Rf lies above 1, it is shown even with the pieces as fragments; if Rb does not lie above 1, it is not shown even with
  them as births ("never there is no excess"); otherwise it depends on what the pieces are, which this measure does not decide.

## The instrument's checks, before it is used (`prova.mjs`)

Test worlds only, with the replicator of Phase 1 and a variant of it; `prova-sortida.txt` must end with "All the checks pass." or neither
the launcher nor the analysis runs.
1. **The tracer** against its slow reference, with mutations, and the world against `sim.mjs` with the tracer open.
2. **The measures, one case at a time**, each with its known answer: an exact copy (64); a backward copy off the mirror by one, as the
   replicator of Phase 1 copies itself (63); a copy moved by 5 bytes (59); one, two and three own mutations side by side (64, 64, and 31: two
   are passed over, three stop the run); one on the last byte (63); eight scattered (64); a mutation every carrier shares (64: matched, not
   passed over); **auditor 2's counterexample** (2: pieces; entry 28's score, 32 as auditor 2 found); **a pair repeated** (2: pieces; entry
   28's score 63, auditor 1's measure 64); a mosaic of two halves of two programs (32) and of pieces of 8 bytes (8); **a chain of 8 programs
   joined by shared origins**, where every pair is a map pair but no carrier holds more than 9 bytes of it (9: the map's habit of joining
   pairs from different carriers, which auditor 1's measure does not stop: 64); a fragment of 16 bytes (16) and of 15 (15); and two false
   negatives the measure cannot avoid, said so: a copy made before the window (none) and a variant held by one carrier, below the map (none).
   Pieces of 1, 2, 4, 8 and 16 bytes, separated, 200 ways each: never more than a piece. The common run of two cells, and outside the map.
3. **In test worlds:** the replicator's half B ordered; its variant beside it not ordered; an independent planting of the same program, and
   the far cells, none; **the adversarial controls on its real copies**, as each census will have them; and **a neighbour that receives the
   material in pieces through the tracer** (auditor 1's case): 16 pieces of 2 bytes, pieces; one piece of 16 bytes, ordered.
4. **The validators fail closed** (AUD-234 = AU2-229, for this note's code): the list's SHA-256 and the commit anchored, also when the false
   value is the same in every record; the samples of their exact sizes; no origin out of range; no matched cell at distance 0, and none
   missing at a distance of 1 or more; the lines exactly the list's, once and in order; one Node: 32 impossible records, a file more in the
   folder, records of another commit and no commit to check against, each rejected. The comparator exits 0, 1 or 2.
5. **The analysis on synthetic records** with known classes: each appearance gets the class its cells were made for; a census with too few
   cells, unclassifiable; records of another commit, nothing read; `--check` prints no class and no run.

**What is not reused:** the validators and the `--check` of the earlier notes (AU2-205, AU2-216, AU2-219, AU2-223 and AUD-234 = AU2-229 stay
open for their code). This note imports only the instrument (the world, the tracer, the map's function), which the pilot's measures and
fingerprints check on every branch, and writes its own validator.

## The run

- **Data:** the 18 start captures (not in git; their SHA-256 in the list), copied from the pilot's computation copy and checked (18 of 18);
  the pilot's records, the lineage note's data through `../registre-copies/dades.mjs`, and the descent note's records, in git.
- **The short test,** after this note and `prova-sortida.txt` are in git: one branch (world 7014's aged soup) into `prova/`, of which only the
  validation, the line types, the samples' sizes, the time and the memory are looked at (`curta.mjs`, which prints no measure and no class);
  then `compara.mjs` against the full run's record of the same branch.
- **The full run:** the 18 branches, 6 at a time at low priority (`llanca.sh`). **Budget:** about two hours of machine (the descent note took
  1 h 32 min); stopped and reported if it passes six hours. The records into git before any analysis; `analisi.mjs --code COMMIT --check`,
  then `analisi.mjs --code COMMIT`, its output into git as it comes out, before reading it.
- **Before this note** (`previ/`, run with `previ/executa.sh`; `previ/registre.txt` keeps each run's command, times, exit code, what it looked
  at, and the SHA-256 of every script both as in the working copy and as git keeps it, with LF line endings; X-140 asks auditor 2 whether
  that should become a rule, and this note does it meanwhile). **No branch of the pilot:**
  - `prova-1`: two checks failed, both errors in the checks' construction, not in the measure: in a test world, one of 20 pieces of 16 bytes
    was taken from a carrier with an own mutation on the piece's edge, where the known answer is 15, not 16 (the sources are now carriers
    whose bytes 20 and 35 are not own mutations); and the synthetic records gave an appearance one class in one window and another in the
    other (now one class per appearance);
  - `prova-2`: all pass;
  - `temps-1` (`previ/temps.mjs`, a large test world, 9,520 carriers): the controls take about a second per census and context; **the
    repeated pair came out ordered in 2 of 100**, because some carriers there hold the repetition itself (a copy that wrote the same two
    bytes over and over): a cell repeating it then does sit in their order, and the control had no well-posed known answer. Since then it
    uses only pairs that no carrier holds as three alternating bytes;
  - `temps-2`: the same world, all the controls within their limits;
  - `prova-3`: all pass, with the code that goes into git with this note.
  These runs read only the pilot records' seeds, ends and fingerprints (the validator's checks) and, through `load()`, the published R0 and
  R1 with synthetic classes.

## What would change my mind

- **Ordered:** if two thirds or more of the classifiable aged appearances are ordered, the time rule's removal has support by continuity in
  the aged soup (for these appearances, with this measure), and the lead of audit 45 (11 mutated copies, 5 pieces) is not contradicted by a
  measure fixed before.
- **Pieces:** if two thirds or more are pieces, they are not copies of the dominant group's program in any useful sense; and the lead of
  audit 45 does not hold with the run in one carrier.
- **The instrument:** if most censuses fail their controls (in particular the adversarial ones on their own material), nothing is read, and
  the note says that the measure does not separate order from material on these worlds.
- **The excess:** by the range: above 1 even with the pieces as fragments, not shown even with them as births, or dependent on the pieces.

## What it is not

Exploratory. Not where maturation acts (AUD-184 = AU2-151). Not a genealogy (AU2-225): an ordered run says that 16 bytes or more of a cell
sit in the order of the dominant group's carriers, made within the window; it does not say who copied whom, and it cannot tell a descendant
from a sibling that copied the same material at the window's start. Blind to a copy made before the window (its bytes are their own origins)
and to a variant held by fewer carriers than the map wants. Not a definition of an independent birth: an appearance that is not ordered may
still be a copy of something else, and one that is ordered is a copy of material of the dominant group's lineages detected before, not of one
program in particular. Not the full record of copies, which auditor 2 proposes after this, with a genealogy of known answer.

## How it went

- **The note and its code** went into git at `4072981`; `prova-sortida.txt`, all the checks passing, and the short test at `d4edbb2`.
- **The short test** (world 7014's aged soup, 19.23 to 19.32, 516 s, 313 MB): valid against the list, the pilot record and the commit, and the
  same carriers, halves, far cells and matched cells as the descent note's record (`prova/curta-sortida.txt`).
- **The full run,** from `d4edbb28`, launched from the app on 26-11-2026 at 19.33.01, 6 at a time at low priority: it finished at 21.05.37
  (1 h 32 min, within the budget), 18 of 18 with exit code 0 and the final line, the consoles empty (`llanca.log`, `consola/`). The records
  (13 MB) went into git before anything was read (`42c948f`).
- **The short test against the full run's record of the same branch** (`compara.mjs`): the same but for the commit, the Node version, the
  seconds and the memory, exit code 0 (`prova/comparacio.txt`).
- **`analisi.mjs --code d4edbb28 --check`:** every record valid, exit code 0; no measure and no class printed (`check-sortida.txt`). Then
  **`analisi.mjs --code d4edbb28`** (21.07.31 to 21.12.23, exit code 0, stderr empty), its output into git as it came out, before it was
  read (`b41114a`, SHA-256 `f431aec3738e4a59…07a9`). On the way, the analysis found the same cells as the descent note's records, and entry
  28's map thresholds and scores, recomputed from the saved origins, the descent note's, all 9,246.
- **One check after the analysis, outside the planned steps,** run with `previ/executa.sh` and declared (`previ/inici-1`, below, "The column
  'at the start'").

## What came out (exploratory; `analisi-sortida.txt`)

**The controls.** Twelve of the 19 tracked censuses have a dominant group with lineages detected before (D); the other seven (six branches)
have none (no earlier dominant lineage in 7018, 7033, 7054's reinit, 7058 twice and 7068; no dominant group in 7046), as in entries 27 and 28.
- **In the main context** (window of 1,250 epochs, map at 1 %) **every census passed every control:** half B's sample ordered, 992 to 1,000 of
  1,000; the far sample none, 1,000 of 1,000 everywhere; half B's cells cut into pieces of 1, 2 and 4 bytes and reordered, at most 1 of 500
  ordered (pieces of 4 bytes in 7048's shuffled soup); 16 pieces of 2 bytes in a far cell, 0 of 500; a pair repeated, 0 (of 81 to 100 usable
  cells); 4 own mutations inside a run of 32, all ordered. **On these worlds the measure separates the dominant group's order from its
  material,** as far as these controls test it.
- **The descriptive families:** pieces of 8 bytes, 0 to 11 of 500 ordered; **pieces of 16 bytes, 440 to 499 of 500 ordered** (a fragment of
  16 bytes or more is ordered by construction, as the note said); 8 own mutations, 99 to 100 %; 16, 79 to 100 %.
- **The sensitivities' contexts:** the map at 0.5 % and at 5 %, every census valid; **the window of 250 epochs, 4 of 12 fail** (half B
  ordered 782, 839, 847 and 878 of 1,000, below 900: worlds 7014, 7027, 7052's shuffled soup and 7059), their appearances unclassifiable in
  that sensitivity only.

**The classes of the appearances the time rule removes** (the main measure):

| soup | appearances | ordered | pieces | none | unclassifiable |
|---|---|---|---|---|---|
| aged (continue) | 16 | 10 | 6 | 0 | 0 |
| shuffled | 9 | 3 | 4 | 0 | 2 (no earlier dominant lineage) |
| fresh (reinit) | 4 | 0 | 0 | 0 | 4 (no earlier dominant lineage) |

(The seven of world 7046 have no dominant group and are not among the time rule's removals.)
- **The aged soup's ten ordered** have runs of 21 to 63 bytes in one carrier of half A: one, world 7074 at 13,250, 63 of 64 bytes in both its
  cells; the other nine, 21 to 50. **Its six pieces** have longest runs of 5 to 14 bytes: 7014 at 9,000 (11), two of 7052 (14 and 12) and the
  three of 7059 (11; 5 and 6; 9). **None carries nothing of the dominant group's material**, as in entry 28.
- **Auditor 1's measure, made exact** (`mapRun`: the map's order, no carrier) gives 11 ordered and 5 pieces in the aged soup, the numbers of
  audit 45. **The carrier condition moves one:** 7014 at 9,000 (window 7) holds 39 bytes in the map's order, but at most 11 in one carrier.
  In the shuffled soup it moves 7048 at 10,000 (57 in the map's order, 13 in one carrier): the map's habit of joining pairs of different
  carriers, which the note's checks built on purpose (the chain of 8 programs).
- **The sensitivities** (never read for the reading): the aged soup, 10 or 11 ordered of 16 with the map at 0.5 % and 5 %, an appearance
  ordered if any of its cells is, `mapRun` and `donorRun`; **two of them, the map at 5 % and `mapRun`, reach two thirds by one appearance
  (11 of 16)**. With the window of 250 epochs, 6 ordered, 2 pieces, 3 none and 5 unclassifiable: three appearances of the aged soup become
  none (two of 7052 and world 7054's), whose material in the dominant group's order is older than 250 epochs or not there (a window is blind
  to the copies made before it).
- **The neighbourhood** (descriptive): the matched cells of the aged appearances are often ordered too, 54 to 123 of 200 (1 of 200 at
  distance 4, world 7059's first). The ten ordered appearances' runs sit at percentiles 0.78 to 0.96 of their matched cells' runs; the six
  pieces, 0.38 to 0.99.
- **One origin** (descriptive): in no census do two appearances share a run of 16 bytes outside the dominant group's order: as many
  components as appearances (2, 2, 2, 7 and 3), the longest such common run 1 to 3 bytes, the ring null 0. The seven of world 7052 are not
  copies of one another outside D's order (as audit 44 found for its components). In 7046, with no D, the common run with no map is 12 bytes
  at most: 7 components, the null 0.08.

**The recount** (counts of observed appearances per 1,000 world-epochs, aged / shuffled / fresh, and the aged/fresh ratio; never a ratio of
births):

| | aged, shuffled, fresh | aged/fresh |
|---|---|---|
| R0, no rule | 33, 14, 8 | 4.41 [1.45; 14.90] |
| R1, the time rule | 17, 5, 4 | 4.55 [0.90; 22.91] |
| **Rf, the pieces as fragments** | 17, 5, 4 | **4.55 [0.90; 22.91]** (contains 1) |
| **Rb, the pieces as births** | 23, 9, 4 | **6.15 [1.65; 29.51]** (above 1) |
| Rb+, Rb with the unclassifiable kept (sensitivity) | 23, 11, 8 | 3.08 [0.88; 11.04] (contains 1) |

R0 and R1 are the within-world null note's. Since no appearance is none, Rf = R1. With every map and measure of the sensitivities, Rf stays
4.55 [0.90; 22.91] and Rb is 5.88 to 6.15, above 1. **With the window of 250 epochs, Rf lies above 1** (20, 6, 4; 5.35 [1.31; 26.06]): the
three appearances that become none there are kept; that window is blind to the copies made before it, and fails its controls at four
censuses.

**The column "at the start"** (descriptive): of every ordered run's pairs, none were two bytes side by side of one cell at the window's start,
but for 3 of 12 in 7048 at 10,000. Since that looked odd, **one check after the analysis, declared** (`previ/inici.mjs`, `previ/inici-1.txt`):
the same holds for the dominant group's order itself. Of the map's 177 to 385 pairs, 0 to 14 are of that kind; the rest hold the origin of a
mutation (94 to 199) or two origins that were not side by side in one cell at the start; of half B's pairs, 0.6 to 18 %. So the column says
nothing particular about the appearances: **the order the measure looks for was itself arranged within the window and then spread among the
carriers.** How (recombined copies, shifted copies), this note does not measure.

## The reading (by the rules fixed in the note)

- **The aged soup: mixed, by this measure.** Of the 16 classifiable appearances the time rule removes, 10 carry 16 bytes or more in the
  dominant group's order, in one of its carriers, over their own mutations, and 6 carry only pieces of its material (runs of 5 to 14 bytes);
  none carries nothing of it. Neither class reaches two thirds (10 of 16 is one short of the 11 needed).
- **The shuffled soup: mixed, by this measure.** Of 7 classifiable, 3 ordered, 4 pieces, 0 none; 2 cannot be classified (no earlier dominant
  lineage).
- **The excess: it depends on what the pieces are, which this measure does not decide.** Rf (the pieces as fragments) contains 1; Rb (the
  pieces as births) lies above 1. **And Rb's lower end rests on removing the fresh soup's four appearances, which cannot be classified:**
  with them kept (Rb+, a sensitivity), the interval contains 1.
- **What would have changed my mind:** neither the ordered nor the pieces threshold was reached, so the lead of audit 45 (11 mutated copies,
  5 pieces) is **neither confirmed nor contradicted** by a rule fixed before: with the run in one carrier, 10 and 6. **The instrument did not
  fail:** every census of the main context passed its controls, the adversarial ones on its own material included.

### What it does not say

- **"Ordered" is not "a copy of the program".** It says that 16 bytes or more of a cell sit in the order of the dominant group's carriers,
  made within the window; **a fragment of 16 bytes or more is ordered too** (the descriptive control: 440 to 499 of 500), and of the ten only
  one (7074, 63 bytes) spans almost the whole program. The note's phrase for two thirds ordered, "copies of its program, whole or mutated",
  would have said more than the measure; it was not reached, and if it is used again it should say "16 bytes or more in its order".
- **"Pieces" is not "a new arrangement" nor "fragments":** a run shorter than 16 bytes in one carrier, with some of the map's pairs. A copy
  of a variant held by fewer carriers than the map wants, or of material copied before the window, also falls here or in none.
- Never "10 are copies", "6 are births", "the excess is real" or "there is no excess". Not a genealogy (AU2-225), not where maturation acts
  (AUD-184 = AU2-151).
- **The sensitivities that go the other way are not read either:** the map at 5 % and `mapRun` reach two thirds ordered (11 of 16), and with
  the window of 250 epochs Rf lies above 1. The reading is the main measure's; it is one appearance from the threshold, and the excess
  moves with the window.

## Everything tried

- Before the note (`previ/`): `prova-1` (two errors in the checks' construction), `prova-2`, `temps-1` (the repeated pair, not well posed),
  `temps-2` and `prova-3`, as listed in "The run". No branch of the pilot.
- After the note, the planned steps, each once: the instrument's checks (`prova-sortida.txt`), the short test, the full run, the comparison,
  `--check` and the analysis. Nothing failed, nothing was repeated, nothing was discarded.
- After the analysis, outside the planned steps: `previ/inici-1`, the check of the column "at the start" (above), declared in
  `previ/registre.txt` with the SHA-256 of the code as it is and as git keeps it.
