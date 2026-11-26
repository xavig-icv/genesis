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
7. **The validators fail closed** (AU2-219, AU2-223): `valida.mjs` rejects each of 19 impossible records built from a valid synthetic set
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
