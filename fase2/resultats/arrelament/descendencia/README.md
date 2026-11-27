# A measure of descent by the arrangement of origins (exploratory)

**The note, written before computing** (26 November 2026). The exploration lane (`docs/disseny.md`, 11-11-2026): this note goes into git
before anything is computed on the pilot's branches, from a clean commit; the scripts and their outputs as they come out; everything tried;
one audit round afterwards. The owner chose this step on 26-11-2026 ("endavant amb la mesura de descendència", T-95), after audit 44.

## Where it comes from

The small record of heritable copies (`../registre-copies/`, entry 27) tagged every byte of 18 pilot branches with the tracked sets whose
carriers it had passed through (the *exposure bit*) and with the byte of the window's start it descends from by copies (its *origin*). At
audit 44 both auditors found that the bit records exposure, not descent: every byte of a carrier takes it when the carrier interacts, the
dominant group spread within every window, and one cell from a carrier 0.61 to 0.84 of the cells that are not appearances are D-derived
too; the rule fixed in that note could hardly have failed (AUD-227 = AU2-218). Auditor 1 added, post hoc, that the bytes' origins **by
position** could tell a copy of the dominant group's program from a new arrangement of bytes that passed through its cells, and that on the
aged soup's 16 time-rule appearances they point to copies (AUD-228). Both auditors asked, before any full record, for a measure of descent
fixed before, with controls of known answer, a definition of one origin with a null, and a recount that treats every soup alike; auditor 2
asked for the instrument's validators to fail closed (AU2-219, AU2-223) and for a slow reference version.

**The question:** are the failed appearances that the time rule removes copies of the dominant group's program (descent), or new
arrangements of bytes that passed through its cells? And, with that answer and a symmetric recount, is the aged soup's excess of failed
appearances still not shown?

**What has already been seen** (declared, so that nothing here is read as blind): the outputs of the small record (`../registre-copies/`,
all its numbers), and auditor 1's post hoc measure on the seven aged branches (`auditor1/audit44/annexos/traca-a1-sortida.txt` in the audits
repository): 15 of the 16 aged time-rule appearances with about as much of the dominant group's ancestry at their own positions as its
carriers, all 16 above the median of their neighbourhood. **For the aged soup, this note is therefore not an independent test of auditor 1's
lead:** it re-measures the same branches with a measure fixed before, out-of-sample controls and a specificity test. The shuffled and fresh
soups' appearances were not measured by position by anyone.

## What is measured, and how

**The same 18 branches and 36 appearances** as the small record (its `llista.json`, SHA-256 `c0afb2c0f182f922…`, read from
`../registre-copies/`), re-run from each branch's start capture and seed with the same instrumented world (`../registre-copies/mon.mjs`,
whose equivalence with `sim.mjs` that note checked). Every measure every 100 epochs and the final fingerprint must again be those of the pilot
record, or the branch fails and nothing of it is used. **Nothing is planted and no simulator is touched.**

**The tags** (`traca.mjs`, this note's tracer; the rest of the instrument is the small record's, imported as it is):
- **the origin:** each byte of the world, at the window's start, is its own origin; a copy (`.` or `,`) passes its origin on, also onto an
  equal value; `+` and `-` keep it and set a flag; **a mutation gives the byte a new origin of its own** (a number above the world's bytes,
  one per mutated byte), not "none" as in the small record: two cells that both descend from a byte made by one mutation share that origin
  (auditor 2's requirement);
- **the exposure bit,** as in the small record, kept and reported apart, never read as descent.

**The descent score of a cell, by arrangement** (the main measure). At the census *E*, the carriers of the dominant group's lineages
detected at an earlier census (*D*, as in the small record) are split in two halves at random (a seed of this note, 3,300,000,000 plus the
world, the soup and the census; 5 more for *Dbroad*; no plan's). From half A, **the map:** the pairs of origins that two adjacent bytes (*j*
and *j* + 1) have, in either order, in 1 % or more of half A's carriers (at least 2; each carrier counted once). **The score of a cell** is how
many of its 63 pairs of adjacent bytes have their two origins in the map (the average over its cells, for an appearance of several). A copy
keeps the adjacency of its program's origins, forward or backward and at any offset; a fragment keeps it along its run; a new arrangement of
the same bytes breaks it. The cells that are scored never make the map: half B, the appearances (excluded from the map even if they carry a
window of *D*), their matched cells and the far cells.

**Why adjacency and not the position** (decided on test worlds before this note; `previ/`): the first version of this note scored the origins
at their absolute position or at the mirror position 63 − *j*, as auditor 1's post hoc measure (position only). The checks on a test world
showed that the replicator of Phase 1 copies itself backwards with its byte *g* at 62 − *g* (off the mirror by one), so that a measure by
absolute position does not recognise its copies (`previ/prova-1.txt`, `previ/desplacament-1.txt`), while 62 or 63 of its 63 pairs of adjacent
origins are kept. Both absolute measures stay as sensitivities, not read. **The run that counts as descent:** 15 pairs, the adjacency of a run
of 16 bytes (the tracking's window); 16 bytes for the measures by byte.

**The controls of each census** (fixed; if one fails, the census's appearances are "unclassifiable" and none of them is read):
- **sensitivity, out of sample:** half B's scores. Their 10th percentile *q*10 must be 15 or more (90 % or more of the dominant group's own
  carriers reach the run), and half B must have 10 carriers or more (*D* 20 or more). **This needs the set's carriers to be made within the
  window:** a carrier that was already one at the window's start has origins of its own that no other carrier shares, and scores 0 (the test
  world, `previ/prova-2.txt`). At the main window the dominant group had no carrier at any window's start (auditor 1 at audit 44); at the short
  window (250) it usually had, and the census may fail this control;
- **specificity:** the cells 64 or more from any carrier of *D* (100 or more of them): at most 5 % of them may reach the run;
- **the neighbourhood:** the same 200 matched cells as the small record (the same distance to *D*, no tracked set, its seed), scored with the
  same map; the appearance's percentile among them (mid-rank).

**The rule for each appearance** (main window, 1,250 epochs; main measure):
- **a copy of D** if its score reaches the run (15 pairs) **and** its percentile among its matched cells is 0.90 or more: a copy of the
  dominant group's program, whole or a fragment of 16 bytes or more;
- **not a copy of D** if its score is below the run **and** its percentile is 0.50 or less;
- **undecided** otherwise (abstention, never counted as an origin of its own: auditor 2's "no convertir desconeguts en orígens");
- **unclassifiable** if *D* is empty (no dominant lineage detected at an earlier census) or the census fails its controls.

**The reading of the aged soup's 16 time-rule appearances** (only those classifiable count): two thirds or more "a copy of D" → "by their
arrangement, they are copies (whole or in part) of the dominant group's program: descent, as the time rule assumed"; two thirds or more "not
a copy of D" → "they are not copies of the dominant group's program: new arrangements of its material"; otherwise "cannot tell". The shuffled
and fresh soups' appearances, descriptive (their counts are small). Never "fragments" for the exposure bit, and never "born" for an
appearance.

**One origin** (for appearances of the same census): two appearances **share an origin** if they share 15 or more pairs of adjacent origins
(a run of 16 bytes; the larger count over their cells), new origins of mutations included; the census's appearances are then grouped by these
joins. **The local null:** the same count between the cells that touch one appearance and those that touch the other (Chebyshev 1, no tracked
set, not an appearance), pair by pair. If 5 % or more of those pairs reach 15, the census's origins are "cannot tell" and its appearances are
counted one by one. Sensitivities, fixed now: 7 and 31 pairs; and the first version's count by absolute position (16 bytes), descriptive.

**The recount** (failed appearances per 1,000 world-epochs, aged against fresh; the bootstrap over worlds of the within-world null note:
10,000 resamples, seed 3,100,000,000, which gives R0 and R1 again exactly):
- **Rd** (main, symmetric): of the time rule's appearances, only those classified "not a copy of D" are kept, in every soup; "a copy of D",
  "undecided" and "unclassifiable" are removed, as the time rule removes them. So Rd = R1 plus the time-rule appearances shown not to be
  copies;
- **Rd+** (sensitivity): only "a copy of D" removed (undecided and unclassifiable kept, in every soup);
- **Rd′:** Rd with the appearances that remain at one census counted by origins (the one-origin rule; the burst of world 7046 included);
- the excess left is **shown** if Rd's interval lies above 1, otherwise **not shown**; never "there is no excess".

**Sensitivities, fixed now and not read:** the window of 250 epochs; the map at 0.5 % and at 5 %; by absolute position or the mirror (this
note's first version) and by position only (auditor 1's post hoc measure); any position (an origin of the map at any position); *Dbroad*
(all the dominant group's lineages up to the confirmation) instead of *D*, descriptive; and the exposure bit, side by side.

## The instrument's checks, before it is used (`prova.mjs`)

All must pass, or nothing is computed on the pilot's branches (`llanca.sh` and `analisi.mjs` refuse otherwise). Test worlds only (random
bytes), with the replicator of Phase 1 that the project's tests already use and a variant of it made here (the same instructions and zeros,
its other bytes moved to the next value that is neither an instruction nor 0), as `registre-copies/prova.mjs` §4 does: **no world of the
project is touched, and no replicator is planted in any experiment.**
1. **The small record's interpreter and mutations, again** (a shorter run), and this note's new origins of mutations.
2. **The tags, against a slow reference:** a second tracer written another way (the tags on the world's bytes directly, as auditor 1's)
   must give the same origins, flags and bits at every epoch, with and without mutations (auditor 2's reference version).
3. **Known answers, one case at a time** (auditor 2's list): exact replication (the replicator's copy keeps its adjacency); `+` and `-`; a
   copy onto an equal value; a chain of copies; two origins in one cell; a mutation to the same value (a new origin, flagged); recombination
   (half a copy: 31 of 63 pairs); a fragment of 16 bytes (15 pairs, the run); a new arrangement (a carrier's own origins, shuffled within the
   cell: near 0); a copy moved by 5 bytes, and a backward copy off the mirror by one (both kept by adjacency, lost by absolute position); a
   false carrier made by a mutation (auditor 2's counterexample: the exposure bit takes all 64 bytes, the descent score stays 0); disappearance
   and rebirth (a program's bytes all mutated: no descent; a copy of it shares its new origins).
4. **The score in a test world with a known answer** (128 × 32, with and without mutations; the window opened at the planting, so that every
   later carrier is made within it): the replicator in three cells, its variant in three cells beside it, and an independent planting of the
   replicator in three cells far away (kept apart). With the map from half of the replicator's carriers: **sensitivity,** its other half's
   *q*10 at the run or above; **specificity,** the variant's carriers, the independent planting's carriers (the same program, another
   ancestry: descent, not likeness) and the far cells, 5 % or fewer at the run each.
5. **The one-origin rule:** copies of the replicator near each other share an origin (half or more of the pairs); the replicator and its
   independent planting never; the null of neighbouring cells with no program, below 5 %.
6. **The world against `sim.mjs`,** as in the small record (the measures and the final fingerprint), with both tracers open.
7. **The validators fail closed** (AU2-219, AU2-223): `valida.mjs` rejects each of 19 impossible records (21 since the correction after the
   full run: "How it went") built from a valid synthetic set
   (auditor 2's audit-44 list and others: a false seed or fingerprint, no measures, a score above the bytes or not whole, a cell outside the
   world, origins that do not add up, carriers below `ok + flagged`, a histogram that does not add up, a duplicated, missing or unexpected
   line, an extra field, a code with `+`, two commits, a wrong window start, a matched cell inside the appearance, an impossible pair, a missing
   record) and a folder with a file that is not the list's, and accepts the valid set; `analisi.mjs --check` exits 0 and 1 for them; and
   `compara.mjs` exits 0 for records that differ only in its listed ignored fields, 1 for a difference and 2 for wrong arguments.
8. **The analysis on synthetic records with a known answer:** all copies → "copies"; none → "not copies"; the neighbourhood as high →
   "cannot tell"; and Rd's counts as expected.

## The run

- **Data:** the 18 start captures (not in git; their SHA-256 in `../registre-copies/llista.json` and the pilot's manifest), copied from the
  pilot's computation copy and checked; the pilot's and the lineage note's data in git, through `../registre-copies/dades.mjs` (its checks).
- **The short test,** after this note and the checks are in git: one branch (world 7014's aged soup) into `prova/`, of which only the
  validation, the line types, the time and the memory are looked at (`prova/curta.mjs`, which prints no score and no class); then
  `compara.mjs` against the full run's record of the same branch.
- **The full run:** the 18 branches, 6 at a time at low priority (`llanca.sh`). **Budget:** about two hours of machine (the small record took
  1 h 33 min); stopped and reported if it passes six hours. The records into git before any analysis; `analisi.mjs --check`, then
  `analisi.mjs`, its output into git as it comes out, before reading it.
- **Before this note** (the practice proposed by auditor 2 at audit 44): everything run before this note, with its output, the time and the
  SHA-256 of the folder's scripts, is in `previ/` (`previ/executa.sh` ran it; `previ/registre.txt`). Only the checks on test worlds and on the
  pairs of a capture, and one script on a two-cell tape; **no branch of the pilot:**
  - `prova-1` (the first version, by absolute position): the replicator's copy not recognised, and the test world's controls all failing
    (`q10` = 0); it also showed that a tracer opened after the replicator spread scores its old carriers 0;
  - `desplacament-1` (`previ/desplacament.mjs`): where the replicator of Phase 1 puts its bytes when it copies itself (62 − *g*);
  - `prova-2` (adjacency): the known answers pass; the test world still fails, with the window opened after the spread;
  - `prova-3` (the window opened at the planting): all pass;
  - `prova-4` (the rule by the run of 16 bytes, and the fragment's case): all pass;
  - `prova-5` (the pairs of origins as numbers, not text, to save memory): the same output as `prova-4`.

## What would change my mind

- **Copies:** if two thirds or more of the classifiable aged appearances are "a copy of D", the time rule's removal has support by descent in
  the aged soup (for these appearances, with this measure), and the question for the 17 that the time rule keeps becomes the full record's.
- **Not copies:** if two thirds or more are "not a copy of D", auditor 1's post hoc lead does not hold with a measure fixed before, and the
  appearances near the dominant group are new arrangements of its material.
- **The instrument:** if the test world's specificity fails (the variant or the independent planting scores as a copy), the measure is not
  used and the note says so; if most censuses fail their controls, nothing is read.
- **The excess:** if Rd lies above 1, it is shown under this rule; if not, it stays "not shown".

## What it is not

Exploratory. Not where maturation acts (AUD-184 = AU2-151). Not a definition of an independent birth: an appearance that is not a copy of
*D* may still be a copy of something else (the burst of world 7046 has no *D*), and one that is a copy of *D* is a copy of material of the
dominant group's lineages detected before, not of one program in particular. The adjacency of origins says what was copied together, not by
whom; and a copy made before the window's start is not seen as one (its bytes are their own origins).

## How it went

- **The short test** (26-11-2026, from `686c455`, Node 16.15.1): `prova.mjs`, all the checks pass (its output, then `prova-sortida.txt`, now
  `prova-sortida-1.txt`); one branch (world 7014's aged soup) into `prova/`, 537 s and 345 MB, of which only the validation, the line types,
  the measures and the final fingerprint were looked at (`prova/curta-sortida.txt`: all the pilot's). In git with the outputs (`5d0a323`).
- **The full run** (from `5d0a323`, launched from the app on 26-11-2026 at 11.26.37, 6 at a time at low priority, Node 16.15.1): finished at
  12.58.20, 1 h 32 min (the budget said about two hours): **18 branches of 18 complete**, every measure every 100 epochs and every final
  fingerprint the pilot's, the consoles empty (`llanca.log`, `consola/`). The records in git before any analysis (`c88e85d`).
- **The short test's branch against the full run's** (`compara.mjs`; `prova/comparacio.txt`): exit code 0, no differing line beyond the
  ignored fields (the code, Node, the seconds and the memory).
- **The check rejected the records first, by an error of mine in the validator.** `analisi.mjs --check` from `c88e85d` rejected 17 of the 18
  records, all for one reason: "the end line is not of this branch or of its pilot record". The fingerprints and the measures of all 18 were
  the pilot's. What failed was a lower bound I had written in `valida.mjs`, at least one invariant check per measure, which is not what the
  run makes: at each measure epoch the run checks each open tracer once, and a tracer is open only within its window, so the count is not tied
  to the measures (the short test's branch had 13 against 12 by chance, and passed). **The correction** (`924b18f`, before any score was
  looked at): the validator asks for the exact count the run makes, computed from the list and the pilot record's measure interval; all 18
  records have it; `prova.mjs` adds two impossible cases (one check fewer, one more). `prova.mjs` again from `924b18f`: all the checks pass,
  21 impossible records of 21 rejected, and every other line the same as the first output (`prova-sortida.txt`, `b8239e4`).
- **The analysis** (from `b8239e4`, Node 16.15.1): `--check` first, exit code 0 (`check-sortida.txt`: 18 branches of `5d0a323e`, 36
  appearances at 19 censuses, 923 measures and every final fingerprint of the pilot records), then `analisi.mjs`, exit code 0 in 78 s,
  nothing on stderr: `analisi-sortida.txt`, in git as it came out (`a1d93a2`, SHA-256 `5528fb55…ec32`), before reading it.
- **One check after the fact, declared** (`posteriori.mjs`, written after reading the output, run from `f04f6a0`; `posteriori-sortida.txt`):
  how many of each time-rule appearance's 200 matched cells reach the run themselves. It is not part of the note's rule, and the reading does
  not change with it.
- **A name left from the first version:** the scripts and the first line of their outputs say "a measure of descent by position"; the measure
  fixed in the note, and computed, is by arrangement (the adjacency of origins). A sentence of `analisi.mjs` that would have printed the
  "copies" reading also says "by position"; it was not printed (the reading is "cannot tell"). Left as it is, with the outputs as they came out.

## What came out (exploratory)

- **The controls** (`analisi-sortida.txt`, §0). At the main window (1,250 epochs), **all 12 censuses with a *D* pass:** half B's *q*10
  from 29 to 53 pairs (the run is 15), and **no far cell reaches the run** (from 50,624 to 107,748 far cells per census). At the window of
  250, 4 of the 12 fail sensitivity (*q*10 = 0: the carriers were already carriers at the window's start, as the note foresaw). The 7
  censuses with no dominant lineage detected before (the aged soup's 7046, the shuffled soup's 7018 and 7033, the fresh soup's 7054, 7058
  twice and 7068) are unclassifiable.
- **The aged soup's 16 time-rule appearances,** all classifiable: **a copy of *D* 4, not a copy of *D* 0, undecided 12** (§1, §2). **All 16
  reach the score of 15** (from 20 to 54 of their 63 pairs in the map, per cell). The score counts pairs anywhere in the cell, not a run:
  only 2 of the 16 hold 16 bytes in a row in the dominant group's order (auditor 1 at audit 45; "Corrections after audit 45"). The 12
  undecided sit from the 51st to the 89th percentile of their matched cells. The four "copies" by the rule (a high score, above their
  neighbourhood; auditor 2 asks the text to call them that): world 7014 at 9,000 (two appearances: 46 pairs and percentile 0.96; 41 and
  0.90), 7054 at 14,000 (53.7, three cells; 0.93) and 7059 at 13,250 (21; 0.98), which auditor 1 finds a mosaic of pieces of 4 bytes or
  less (its longest stretch in a row, 3 pairs).
- **Why so many are undecided** (after the fact, declared; `posteriori-sortida.txt`): **their matched cells reach the score of 15
  themselves**, a median of 0.59 of them per appearance (from 0.03 to 0.89), and their median score, per appearance, from 0 to 33.5 pairs (20
  for the middle appearance). Near the dominant group, cells with 15 pairs or more of its material are common; 64 cells or more away from it,
  none.
- **The sensitivities of the 16** (§2): the map at 0.5 %, 2 copies; at 5 %, 5; by position or the mirror (this note's first version), 5; by
  position only (auditor 1's post hoc measure), 5; any position, 3; **none of them classes any as "not a copy of D".** At the window of 250
  epochs: 0 copies, 4 not copies, 7 undecided and 5 unclassifiable; a copy older than the window is not seen as one (the note, "What it is
  not"), so this window cannot separate them.
- **The shuffled soup** (9 time-rule appearances, descriptive): 2 copies, 5 undecided, 2 unclassifiable. **The fresh soup** (4):
  unclassifiable, no dominant lineage detected before.
- **One origin** (§3; descriptive, 15 shared pairs; the output says "origins", read **components by shared pairs**): world 7052's seven aged
  appearances at 10,000, **6 components** (null 0.003); 7059's three, 3 (null 0.000); 7048's two at 13,500, 1 (null 0.000); 7014's two,
  cannot tell (null 0.171); the burst of world 7046 (no *D*), cannot tell (null 0.247; 7 components at 31 pairs); the shuffled 7027's two, 2
  (null 0.029). Two appearances that both carry the dominant group's material share its pairs, which does not make one come from the other;
  by a common run of 16 bytes, none is joined (auditor 1, post hoc, audit 45).
- **The recount** (§4; failed appearances per 1,000 world-epochs, aged against fresh, the bootstrap over worlds): R0 4.41 [1.45; 14.90] and R1
  4.55 [0.90; 22.91], again exactly the within-world null note's; **Rd (main) = R1, 4.55 [0.90; 22.91]**, because no time-rule appearance is
  "not a copy of D" (an identity, not new evidence); Rd′ the same; **Rd+ (only the copies removed, a sensitivity), 3.88 [1.13; 13.41]**: R0
  minus the four aged copies, counting the 12 undecided as new; the map variants and the measures by position, 4.55; the window of 250, 5.62
  [1.47; 27.28], with 4 of its 12 censuses failing their control.

## The reading (by the rules fixed in the note)

*(Corrected after audit 45: "Corrections after audit 45", at the end.)*

- **The aged soup's 16 time-rule appearances: by the rule fixed in the note, cannot tell.** Neither two thirds copies of *D* (4 of 16) nor
  two thirds not (0 of 16). All 16 carry many pairs of the dominant group's material (20 to 54 of 63); only 2 hold 16 bytes in a row in its
  order. The score counts pairs anywhere in the cell: shuffling the bytes one by one breaks the order, shuffling them in pieces of 2 bytes or
  more keeps it and reaches the score almost always (auditor 1, post hoc). **The measure cannot say that an appearance is not a new
  arrangement** of the dominant group's material. And the rule asked a copy to stand out from its neighbourhood, which near the dominant group
  holds its material, in pieces and in copies, too: a condition of place, the right one for the exposure bit, not for a measure of descent;
  the neighbourhood is a descriptive contrast, not a known negative.
- **Post hoc** (auditor 1 at audit 45: a measure and a threshold chosen after seeing the data, on the same branches), 11 of the 16 hold 16
  bytes or more in the dominant group's order, passing over their own mutations (world 7074's, the whole program with 16 pairs broken by its
  own mutations and nothing else); by a rule fixed before, 10 within one carrier (entry 29). **Whether they are copies of the program or long
  pieces, neither measure says** (corrected after audit 46, AUD-236: "11 look like mutated copies" said more than the measure could). Auditor
  1's lead of audit 44 (AUD-228) points to the dominant group's material at its position, not to copies.
- **The excess left (Rd): not shown under this rule** (4.55 [0.90; 22.91]); never "there is no excess". Rd+ (3.88 [1.13; 13.41], a
  sensitivity) is R0 minus the four aged copies and counts as new the 12 undecided, which carry the dominant group's material: the excess left
  lies between Rd and Rd+ depending on what these 12 are (from 2.27 to 7.76 by how the abstentions are counted; auditor 1, post hoc). These
  are sensitivities of the count, not bounds of a ratio of births: the classification's errors are not calibrated, and *D* is available for
  all 16 aged appearances and for none of the 4 fresh (auditor 2).
- **The measure, unlike the exposure bit, is specific to the dominant group's material:** in the test worlds nothing of the variant or of the
  independent planting of the same program reaches 15, in the pilot's censuses no far cell does, and almost all the pairs of the map formed
  within the window (auditor 1). **Not to its order:** it counts pairs, not stretches.

### What it does not say

- Not that the 12 undecided are copies of *D*, nor that they are new arrangements of its material.
- Not that any appearance is not a new arrangement of the dominant group's material (the score cannot say it).
- Not that the appearances' neighbours are copies of the dominant group's program: a cell with 15 pairs or more of the map may hold them in
  pieces, and other material in its other bytes.
- Not where maturation acts (AUD-184 = AU2-151), and nothing about the 17 appearances the time rule keeps, which this note does not classify.
- The adjacency of origins says what was copied together within the window, not by whom; a copy made before the window's start is not seen.

## Everything tried

- **Before the note:** `previ/` (`prova-1` to `prova-5`, `desplacament-1`), listed above; no branch of the pilot.
- **`prova.mjs`, twice:** from `686c455` (19 impossible records; `prova-sortida-1.txt`) and from `924b18f`, after the validator's correction
  (21; `prova-sortida.txt`).
- **The short test** (`5d0a323`) and **the full run** (`c88e85d`), each once.
- **`analisi.mjs --check`, twice:** from `c88e85d` (17 records rejected by the validator's wrong bound; its output, only those 17 lines, was
  not kept) and from `b8239e4` (exit code 0; `check-sortida.txt`).
- **`analisi.mjs`, once** (`b8239e4`; `analisi-sortida.txt`), and **one check after the fact** (`posteriori.mjs`, `f04f6a0`).
- Nothing else was run on the records.

## Corrections after audit 45 (26 November 2026)

Both auditors reproduced the note (auditor 1 re-ran the seven aged branches with a tracer, a map and a score of their own, all equal to the
records, and ran `prova.mjs`, the check, the analysis and the check after the fact; auditor 2 checked both zips, recounted the classes
independently, enumerated the 275 invariant checks and reproduced the check after the fact), accept it as exploratory, accept the
validator's correction as legitimate and its exact count as right, and ask for nothing to be computed again. **The outputs do not change.**
The text of "What came out", "The reading" and "What it does not say" is the corrected one; what the note fixed before computing ("What is
measured, and how", the rule and "What would change my mind") is as it was, including its words "the run" and "a fragment of 16 bytes".
- **"The run" is a count of pairs, not a run** (AUD-231 = AU2-225). `score()` counts how many of a cell's 63 pairs of adjacent bytes have both
  origins in the map, anywhere in the cell and at every position; it asks for no stretch in a row. On the branches' own material, a new
  arrangement in pieces of 2 bytes reaches 15 in 97 to 99 % of cases, and even the bytes shuffled one by one in 3 to 65 % (auditor 1); a
  64-byte cell of 2-byte blocks reordered scores 32 with no two blocks in their order (auditor 2). Only 2 of the 16 aged appearances hold 16
  bytes in a row in the dominant group's order. Withdrawn: "all carry runs of 16 bytes in the dominant group's order", "none is a new
  arrangement by this measure", "a new arrangement of the same bytes breaks it" (only shuffling one by one does) and "unlike the exposure bit,
  the measure is specific" without saying of what (of the material, not of its order). The checks with a known answer could not see it: their
  new arrangement shuffled 64 distinct origins one by one, and their fragment was exactly a run of 16 bytes.
- **"A copy of D" is the rule's name for a high score above the neighbourhood,** not a copy of the program (AU2-225): the score is about
  origins, not values (a `+` or a `-` keeps a byte's origin and changes its value), and the map's pairs may come from different carriers. To
  speak of the program, the values or the instructions must be checked too (auditor 2). One of the four (world 7059's) is a mosaic of pieces
  of 4 bytes or less (auditor 1).
- **The neighbourhood's condition** (AUD-232, AU2-226): asking a copy to stand out from cells that also descend from the dominant group asks
  for more descent than theirs; auditor 1, who asked for it at audit 44, now withdraws that request. The neighbourhood is a descriptive contrast, not a
  known negative; and it compares an appearance's mean over its cells with single cells (auditor 2). The post hoc lead (11 mutated copies,
  5 pieces) is in "The reading", as a lead.
- **Rd+** (AUD-233, AU2-227): R0 minus four, not a result of its own; "its interval lies above 1" no longer stands alone. Rd = R1 is an
  identity. Neither bounds a ratio of births.
- **One origin** (AUD-235, AU2-228): "6 origins", "1 origin" are components by shared pairs; the local null is not matched on the dominant
  group's material nor calibrated at the scale of a group (auditor 2). By a common run of 16 bytes, no appearance is joined to another
  (auditor 1, post hoc).
- **The validators** (AUD-234, AU2-229): `validate()` accepts an empty baseline (and `classify()` would then read a `null` percentile as
  0.50 or less: "not a copy of D"), 64 pairs in a cell (an appearance, a matched cell or a histogram), a map threshold that is not the rule's,
  a baseline at distance 0, and a list's SHA-256 or a commit equally false in every record. None of these is in the real records (their 46
  baselines have 200 cells each). Open, like AU2-205, AU2-216, AU2-219 and AU2-223: fixed, with an impossible case for each, before the code
  is used again.
- **The name left** (AU2-230): the scripts' "by position" stays with the outputs; the next version names the measure in the code before
  computing.
- **Before this note** (auditor 1, N-1): the SHA-256 of `traca.mjs`, `descendencia.mjs` and `valida.mjs` at the note's commit are not those of
  `prova-5` in `previ/registre.txt`, but the scripts were not touched after `prova-5`: in the working copy they had CRLF line ends (left by
  edits made with Python), and git keeps them with LF. The commit's files, with CRLF, give `prova-5`'s SHA-256 exactly (the team's check at
  audit 45). Whether `previ/` should hash the scripts as git keeps them is asked of auditor 2 before it becomes a rule (the agreement of the
  three).
- **The first `--check`'s output** (N-2) was not kept ("Everything tried" said so); from now on, the output of every run, failed ones too, is
  kept.
- **Entry 28's "the full record … could say"** (N-3) is withdrawn: with the same score and the same control it would classify other
  appearances, not answer for these 16.

## After audit 46 (27 November 2026)

**The post hoc lead** (AUD-236; the phrase was auditor 1's, who withdraws it; auditor 2 accepts the lead only as "ordered by a post hoc
rule"): "11 mutated copies, 5 pieces", above and in the section before this one, reads "post hoc, 11 of the 16 hold 16 bytes or more in the
dominant group's order, passing over their own mutations (auditor 1, audit 45); by a rule fixed before, 10 within one carrier (entry 29);
whether they are copies of the program or long pieces, neither measure says". "The reading" is corrected; the section above keeps the words
it had, as the record of audit 45.
