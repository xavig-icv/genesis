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
