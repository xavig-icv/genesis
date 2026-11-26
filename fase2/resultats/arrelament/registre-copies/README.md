# The pilot of appearance and taking root: a record of heritable copies, the small version (exploratory)

**Exploration lane** (`docs/disseny.md`, 11-11-2026): this note is in git before computing; the audit comes afterwards, in one round. The
owner chose this path on 25-11-2026 ("endavant amb el registre de les còpies", T-93), after audit 43, where all three of us saw a record of
heritable copies as the way to tell the fragments of the dominant lineage from new appearances. It is the two proposals of audit 43 together:
auditor 2's requirements for the record (what an origin is, fixed before; origins that cannot be assigned; several sources; determinism; checks
with a known answer) and, as its first test, auditor 1's smaller version, on the disputed censuses only. **It plants nothing and changes no
simulator:** it re-runs pilot branches with a separate, instrumented copy of the world's epoch, checked against the simulator and against
every pilot record it uses.

## The question

The aged soup has more failed appearances than the fresh one (R0, 4.41 [1.45, 14.90] per 1,000 world-epochs), but half of them may be
fragments of the lineage that becomes established: the time rule, which removes the failed appearances detected within 1,250 epochs before
an establishment, makes the interval contain 1 (R1, 4.55 [0.90, 22.91]), and none of the indirect evidence could separate the two readings
(entries 24 and 26). **Are the appearances the time rule removes made of the dominant group's material, copied from it, or of material that
never passed through it?** And do the appearances detected together at one census (the bursts) have one origin or several?

## What is already known (so that nobody reads it as a prediction)

- **The counts:** R0, 33, 14 and 8 failed appearances (aged, shuffled, fresh); the time rule removes 16, 9 and 4 (R1: 17, 5 and 4). Of the
  16 aged ones, all are at the census of an establishment; 14 of the 33 are two bursts of 7 (world 7046 at epoch 16,000, its last census,
  in a branch that did not become established; world 7052 at 10,000, its establishment). Sequence and place point to the dominant group
  (entry 24), but within the world the sequence is undecided and 8 bytes cannot be calibrated (entry 26, audit 43).
- **Before writing this note:** the list of the appearances and branches (`prepara.mjs`, which only selects them from the data in git and
  writes `llista.json`); the instrument's checks (`prova.mjs`) while writing it, which all pass; and one branch run through with the
  instrument (world 7014's aged soup), to see that it works and how long it takes: only its checks and its line types were looked at (the 12
  measures, the invariant and the final fingerprint reproduced; 529 s), not a share nor a class. Its output is not kept; the full run
  computes that branch again.

## The data

Only data in git, validated more strictly than the earlier notes did (`dades.mjs`, with auditor 2's list at audit 43, AU2-216, and auditor 1's,
AUD-226): the pilot's manifest and part-B records (each with its seed, start capture and measures every 100 epochs), and the natural-lineage
trackings of entry 21, with their replayed records compared line by line with the pilot's. The start captures of the branches are those of
the pilot (not in git), checked with the manifest's SHA-256.

## The instrument (`traca.mjs`, `mon.mjs`, `registre.mjs`)

- **The world, again:** from a branch's start capture (epoch 8,000) and seed, the epochs exactly as `sim.mjs` does them in a quiet 2D world
  (the same modules: pairing, mutation, gathering and scattering; the same random numbers). The interpreter is a copy of `evaluate` that
  also lists every write (where, and from where); the mutation, a copy of `mutate` that lists what it overwrites. **The simulator is not
  touched.** Every 100 epochs, H0, the operations and the runs must be those of the pilot record, and the final fingerprint too; otherwise
  the branch fails and nothing of it is used.
- **The windows:** before each tracked census *E*, two windows are traced, **1,250 epochs (the main one, the time rule's span)** and **250
  (auditor 1's)**, or from the branch's start if it is shorter. At a window's start every byte of the world is its own origin.
- **The tags of every byte:** its **origin** (the byte of the window's start it descends from by copies), a **flag** (overwritten by a
  mutation, or changed by `+` or `-`) and a **mask**: which tracked sets of programs it has been in a carrier of. A copy (`.` or `,`) gives
  the byte written all the tags of the byte copied, also when the value does not change; `+` and `-` keep the tags and set the flag; a
  mutation clears them. **A carrier** of a set is a cell with one of its windows (16 bytes in a row with 6 different values or more, of a
  program or of its mirror: the tracking's rule); **when a carrier interacts, all its bytes take the set's bit.** So a byte with the bit of
  *D* has been, within the window, in a cell that carried the dominant group, or was copied from one, directly or through other cells.
- **The tracked sets at *E*:** ***D***, the first programs of the dominant group's lineages detected at an earlier census than *E* (the main
  one: a fragment of *D* needs *D* before it); ***Dbroad***, all the dominant group's lineages up to the confirmation (a sensitivity); and
  **each tracked appearance** at *E*, with its own first programs.
- **The invariant,** checked every 100 epochs and at *E*: every byte with no flag has the value of its origin. And at *E*, every tracked
  appearance's cells must hold its programs.

## The appearances (`prepara.mjs`, `llista.json`)

**Fixed now:** the failed appearances that the time rule removes, in the three soups (16, 9 and 4), and the burst of world 7046 at epoch 16,000
(7): **36 appearances, in 18 branches, at 19 tracked censuses**. In 6 of those censuses, all of the time rule, the dominant group has no
lineage detected at an earlier census. `llista.json` has, for each branch, its record, its start capture, and each tracked census with its
appearances (cells and programs) and its sets.

## The analysis, fixed now (`analisi.mjs`)

- **The class of an appearance** (the main window, *D*, its bytes pooled over its detection cells):
  - **no earlier dominant lineage**, if *D* is empty (the time rule removed it, but the dominant group was detected only later);
  - **older than the window**, if some cell already carried the appearance's own windows at the window's start;
  - otherwise, by the share of its bytes with *D*'s bit: **D-derived** if 0.5 or more; **not from D** if 0.125 (8 bytes in 64) or less;
    **mixed** in between.
  The same with the short window, and with *Dbroad*, as sensitivities. The burst of 7046 has no dominant group.
- **The controls, and when the instrument is valid:** at every tracked census and window, for each tracked set with 10 carriers or more at
  *E*, the share of its carriers that hold a window whose 16 bytes all carry the set's bit (a carrier got its window from a carrier, or was
  one when it interacted: it should be all of them, except windows made by mutations or by chance); and the mean *D* share of the cells 64 or
  more cells from any carrier of *D* (where the dominant group has not reached). **The instrument is valid only if every such set has 0.95
  or more, and every far mean is 0.05 or less;** otherwise nothing is read.
- **The baseline,** descriptive: for each appearance, 200 cells at the same distance from the nearest carrier of *D*, carrying no tracked
  set (drawn with seed 3,200,000,000 plus the world and the soup), with their mean *D* share and the appearance's percentile among them. It
  says whether an appearance is more made of *D* than its neighbourhood, not its class.
- **The origins of the appearances detected at one census of one branch** (two or more): two of them are joined if 16 bytes or more of one
  carry the other's bit, or if one cell of the window's start gives 16 bytes or more to each; the origins are the joined groups.
- **The recount** (the failed appearances per 1,000 world-epochs, aged against fresh, with the bootstrap over worlds of the within-world null
  note, 10,000 resamples with its seed, 3,100,000,000, so that R0 and R1 come out as there): **Rc**, R0 without the D-derived; **Rc′**, Rc
  with each census's appearances counted by their origins; Rc with the short window, and with *Dbroad*, as sensitivities. Each with its
  interval and whether it contains 1.

## What would change my mind (fixed now)

- **If the instrument fails** its controls (or any check of a branch): it measures nothing, and that is the result.
- **The aged soup's appearances that the time rule removes,** among those with a class of copies (D-derived, mixed or not from D): if two
  thirds or more are D-derived, **they are made mostly of the dominant group's material: fragments, as the time rule assumed**; if a third or
  fewer are D-derived and half or more are not from D, **the time rule removes appearances that are not made of its material**; otherwise,
  partly. The other two soups, descriptive.
- **The recount:** if Rc contains 1, the excess left once the D-derived are removed is not shown; if it lies above 1, an excess of
  appearances not made of the dominant group's material remains in the aged soup. Rc′ the same, counting origins.
- **In no case** is it a lineage of descent from one program, a test of where maturation acts (AUD-184 = AU2-151), or confirmatory: "made of
  *D*'s material" says which cells the bytes passed through, not that the appearance is a mutated copy of the dominant group's program.

## The checks with a known answer (`prova.mjs`, before the full run)

1. The interpreter: the tape and the operations of `evaluate` in 250,000 tapes (uniform, rich in instructions, real neighbour pairs of an
   aged soup), and the writes, replayed, give the tape.
2. The mutations: the buffer, the count and the following random number of `mutate`, with every overwritten byte listed.
3. The tags: a copy (also onto an equal value), a chain of copies, `+` and `-`, a mutation, and a carrier's bytes, each with its known
   answer; the replicator of Phase 1 copying itself into a partner of data bytes.
4. **A tiny test world** (32 × 32) with the replicator of Phase 1 in two cells, only in this test (as `test/quimiques.mjs` and
   `test/densitat.mjs` already do; no world of the project): with no mutation, every carrier at the end has a window whose 16 bytes all carry
   its bit and descend from those two cells, both are origins, and the invariant holds at every epoch; with mutations, the invariant holds.
5. **Against `sim.mjs`:** a tiny world from a capture, run by `sim.mjs` and by `mon.mjs` with windows open: the same measures and the same
   final fingerprint (the record on and off give the same history).
6. **The data's checks reject impossible cases:** auditor 2's four (a missing census, a false group at the confirmation, a step after the end,
   a false final branch) and five more.
7. The analysis, on synthetic records with a known answer: its reading and its recount.

## The short test, before the full run

From the note's commit: `prova.mjs` (its output, as it comes out); then one branch through `registre.mjs` into `prova/`, of which only its
checks and line types are looked at. The full run computes it again, and the two must be the same except for the seconds.

## The budget

92,750 epochs to simulate, about 24,000 of them with windows open. The branch run before the note took 0.42 s per traced epoch; the whole run,
about 5 hours of CPU, about an hour with 6 processes at low priority. The limit of the lane (two days) is far.

## The limits, from the start

- **Exploratory,** with no data that can confirm anything.
- **Material, not descent:** a byte's bit says that it passed through a carrier, and a carrier's every byte takes it, also the bytes that are
  not of the program. An appearance near the dominant group, where its copies overwrite the soup, can be D-derived by being there: the
  baseline says how much of its neighbourhood is.
- **Windows of programs:** *D*'s carriers are those of its lineages' first programs; a cell with a mutated copy of *D* that keeps no full window
  is not a carrier.
- **The small version:** only the appearances the time rule removes and one burst; the other failed appearances keep their count (no
  dominant group existed near them, or they are far from an establishment). The record over whole soups, and a definition of a new appearance
  for them, would come after.
- **Not where maturation acts:** the rule stays (AUD-184 = AU2-151).

## The commands (before computing)

- **`prepara.mjs CAPTURES-FOLDER`:** the list and the start captures (already run; `llista.json`, SHA-256 `c0afb2c0f182f922…`).
- **`prova.mjs`:** the checks, to `prova-sortida.txt`.
- **`registre.mjs ID`:** one branch, to `registres/ID.jsonl`; **`llanca.sh COMMIT`:** all of them, 6 at a time, from a clean copy at the
  commit, with the log in `llanca.log`.
- **`analisi.mjs [--check]`:** the analysis, to `analisi-sortida.txt`, with the commit and the Node version in its first line.

## How it went

- **The short test** (26-11-2026, 00.02 to 00.14, from `4ce3550`, Node 16.15.1, both exit codes 0): `prova.mjs`, 30 checks of 30
  (`prova-sortida.txt`); one branch (world 7014's aged soup) into `prova/`, of which only the checks and the line types were looked at (its
  measures, the invariant, the appearances' programs and the final fingerprint, all reproduced). In git with the outputs (`fd6ab4c`).
- **The full run** (from `fd6ab4c`, launched from the app on 26-11-2026 at 00.14.39, 6 at a time at low priority, Node 16.15.1): finished at
  01.47.11, 1 h 33 min (the budget said about an hour): **18 branches of 18 complete, every check of every branch passed**, the consoles
  empty (`llanca.log`, `consola/`). The records in git before any analysis (`38142ff`).
- **The short test's branch against the full run's** (`prova/compara.mjs`, written after the run; `prova/comparacio.txt`): the same lines,
  except for the seconds and the code (the short test ran from `4ce3550`, the full run from `fd6ab4c`, which only adds the short test's
  outputs; the note said "except for the seconds").
- **The analysis** (from `38142ff`, Node 16.15.1): `--check` first (exit code 0: the data valid, 18 branches of `fd6ab4c`, 36 appearances at
  19 censuses, 923 measures and every final fingerprint of the pilot records reproduced), then `analisi.mjs`, exit code 0, nothing on
  stderr: `analisi-sortida.txt`, in git as it came out (`c24e1cc`, SHA-256 `e9051dbf…5cf2`), before reading it.

## What came out (exploratory)

**In short** (corrected after audit 44): the instrument passes its controls, and by the rule fixed in the note the aged soup's 16
appearances that the time rule removes are all D-derived: 0.70 to 0.98 of their bytes passed, within 1,250 epochs, through cells that
carried the dominant group's windows. **But the bit records exposure (where bytes have been), not which program they come from, and their
neighbourhood is D-derived too:** 15 of the 16 are one or two cells from a carrier of the dominant group, where the cells at the same
distance are 0.59 to 0.81 D on average, and their percentile among those cells is 0.35 to 0.86. The dominant group appeared and spread
within every window (no carrier at any window's start), so the rule could hardly have come out otherwise: **it does not show that they are
fragments.** Post hoc, the bytes' origins by position point to mutated copies of the dominant group's program (auditor 1; a lead, not a
result). **Without the D-derived, the excess of failed appearances in the aged soup is not shown under this rule** (Rc, 2.27 [0.48, 8.64],
which mixes two rules; treated alike in both soups it is R1 again, 4.55 [0.90, 22.91]; every variant contains 1), which is not to say that
there is no excess. And **the two bursts of seven are not one origin each:** by the note's rule, six components of its provenance graph in
each, which are not six births.

1. **The instrument** (section 0). It reproduces the 18 pilot branches it re-runs (923 measures and every final fingerprint), and passes the
   controls fixed in the note, in both windows: 41 sets of 41 with 10 carriers or more have every carrier holding a full window with the
   set's bit (the lowest share, 1.000), and the cells 64 or more from the dominant group carry none of its bit (the highest mean, 0.000, at
   12 censuses). **What these controls check, and what not:** the positive one checks the bookkeeping (a carrier's bytes take the bit when it
   interacts, and a window that persists keeps it: it could only fail for windows made anew, by mutations or by chance); the far one, that the
   bit stays where the dominant group has been and does not spread through the soup. Neither says that a bit means descent from a program,
   and neither checks specificity: whether a cell next to the dominant group that does not come from it comes out "not from D" (audit 44).
   Auditor 2 made all 64 bytes of a cell take the bit with no copy at all, through a carrier window made by a mutation, and the positive
   control still passes (AUD-227 = AU2-218).

2. **The aged soup's 16 appearances that the time rule removes** (sections 1 and 2):
   - **All 16 are D-derived** in the main window, 15 of them at 0.84 or more (the lowest, 0.70, world 7059 at 13,250); with *Dbroad*, the
     same. The note fixed this reading before computing: "made mostly of the dominant group's material: fragments, as the time rule
     assumed". **It is withdrawn** (audit 44): the rule could hardly have come out otherwise (the next point), and the bit does not show
     fragments.
   - **Like their neighbourhood** (the baseline, descriptive): 14 are next to a carrier of the dominant group and one two cells away, where
     the cells at the same distance are 0.59 to 0.81 D on average; their percentile among them, 0.35 to 0.86. Only one stands out from its
     neighbourhood: world 7059's at 13,250 (appearance 3), four cells away, 0.70 against 0.03 (percentile 0.97). The other 15 have about as
     many bytes that passed through the dominant group's cells as the cells around them. **And it could hardly have been otherwise:** the
     dominant group had no carrier at the start of any of the 12 main windows with *D* (2,740 to 14,966 at *E*), and one cell from a
     carrier, 0.61 to 0.84 of the cells that are not appearances are D-derived too (auditor 1, post hoc; AUD-227 = AU2-218). The class alone
     is not informative.
   - **The bytes' origins by position** (auditor 1, post hoc, audit 44; AUD-228): the record also carries each byte's origin, and a copy
     keeps its program's origins at the same positions. With the dominant group's carriers at *E* as the reference (0.41 to 0.80; they make
     the map) and the cells far from it at 0.000, 15 of the 16 have as much of the dominant group's ancestry at their own positions as its
     carriers (0.84 to 1.25 times their mean), and all 16 more than the median of their neighbourhood: they look like mutated copies of the
     dominant group's program. A measure and a threshold chosen after seeing the data, in six branches with seven of the 16 from one: a
     lead, not a result.
   - **Moved within the window:** almost none of their bytes stayed unchanged in its own place since the window's start (the `self`
     column, 0.00 to two decimals); 0.10 to 0.40 of them have a mutation in their ancestry within the window, and 0.06 to 0.28 a `+` or `-`
     (flags on each byte's ancestry, not counts of events).
   - **The window's length:** with 250 epochs, 11 are D-derived, one mixed (world 7052 at 10,000, appearance 11: 0.39), and four older than
     the window: a window of their own was already in 1 to 38 cells 250 epochs before the census (worlds 7014, 7052, 7054 and 7074), and in
     none 1,250 epochs before. A matching window present at the window's start; it does not date the lineage (AU2-222).

3. **The shuffled and fresh soups** (descriptive). Shuffled, 9: 6 D-derived, one mixed (world 7037, 0.39), and two with no earlier dominant
   lineage. Fresh, 4: all four with no earlier dominant lineage (the dominant group was first detected at the same census or later), so the
   main rule cannot classify them; with *Dbroad*, two D-derived, one not from D and one older than the window. The three appearances of the
   whole list with no bit of *Dbroad* (worlds 7033, 7058 twice) are mostly bytes changed by `+` or `-` (0.67 to 0.97).

4. **The censuses with two or more appearances** (section 3): world 7046 at 16,000 (no dominant group: the branch did not become
   established), 7 appearances and **6 components**; world 7052 at 10,000 (its establishment), 7 appearances and **6 components**, all
   seven D-derived. The others: 7014, 2 and 1; 7048, 2 and 1; 7027, 2 and 2; 7059, 3 and 3. (Corrected after audit 44; the output says
   "origins".) All four joins come from the rule's second half, one start cell giving 16 bytes or more to each; the bit half joins nothing
   (the largest cross share, 0.03, 2 bytes), and the second half depends on how the material was split among cells at the window's start
   (AUD-230 = AU2-220). **Components of the note's provenance graph, not births.** With a measure by position (16 bytes with the same
   origin at the same position or its mirror, which neighbouring cells reach in 0 to 3 % of pairs; auditor 1, post hoc), world 7046 has six
   origins, joined differently, and 7052 seven: the appearances of a burst are not copies of one another.

5. **The recount** (section 4; the failed appearances per 1,000 world-epochs, aged against fresh, with the bootstrap over worlds of the
   within-world null note, which gives R0 and R1 again exactly):

   | | aged, shuffled, fresh | aged/fresh | |
   |---|---|---|---|
   | R0, no rule | 33, 14, 8 | 4.41 [1.45, 14.90] | above 1 |
   | R1, the time rule | 17, 5, 4 | 4.55 [0.90, 22.91] | contains 1 |
   | **Rc, without the D-derived** | 17, 8, 8 | **2.27 [0.48, 8.64]** | contains 1 |
   | Rc′, counting origins | 16, 8, 8 | 2.14 [0.48, 7.99] | contains 1 |
   | Rc, the short window | 22, 10, 8 | 2.94 [0.89, 10.16] | contains 1 |
   | Rc, *Dbroad* | 17, 7, 6 | 3.03 [0.62, 14.72] | contains 1 |

   Rc removes the same 16 aged appearances as the time rule, but keeps the fresh soup's four (they have no earlier dominant lineage) and
   three of the shuffled soup's nine: so it falls below R1. Its point estimate is still above 1, with 17 appearances against 8. **So Rc
   mixes two rules** (audit 44; AUD-229 = AU2-221): it treats the fresh soup's four unclassifiable appearances unlike the aged soup's.
   Treated alike (removed, like the time rule), it is R1 again, 4.55 [0.90, 22.91], and counting origins 4.28 [0.90, 21.31] (auditor 1,
   post hoc, with the note's bootstrap and seed). Every variant contains 1; the size of what is left depends on how the unclassifiable
   appearances are counted, and 2.27 alone is not "the excess left".

## The reading (by the rules fixed in the note; corrected after audit 44)

- **The question:** the appearances that the time rule removes in the aged soup have bytes that passed through the dominant group's
  carriers, **and so has their neighbourhood**. The bit cannot tell a mutated copy of the dominant group's program from a new arrangement of
  bytes that passed through its cells, and with the dominant group spreading within every window the class could hardly have come out
  otherwise: **it does not show that they are fragments.** The bytes' origins, by position, could tell them apart, and the note did not use
  them for it; post hoc they point to mutated copies (auditor 1). **"Their bytes passed through the dominant group's cells, like their
  neighbourhood's"; never "they are copies of the dominant group", nor "they are fragments".**
- **The excess:** once the D-derived are removed, it is not shown under this rule (Rc, Rc′, both sensitivities and the symmetric recount
  contain 1). With entry 26, where the excess was "neither separated from fragmentation nor shown to be fragments": the bit is consistent
  with the time rule, as place was, and adds no support of its own. **"The excess left without the D-derived is not shown"**, never "there
  is no excess" nor "the excess was fragments", and 2.27 alone is not "the excess left". The counts are small (17 against 8), the interval
  wide, and the other failed appearances keep their count (the small version).
- **The bursts:** six components each by the note's 16-byte rule, not six births; post hoc, by position, not copies of one another.

### What it does not say

- **Not descent, and not fragments** (the note's limit, sharpened at audit 44): a bit says that a byte passed through a carrier, and every
  byte of a carrier takes it, also bytes that are not the program's and bytes that no copy touched (AU2-218).
- **Not a validator to reuse as it is:** `analisi.mjs --check` accepts impossible records (a false seed and fingerprint, D = 2, a cell out
  of range, a duplicate control; AU2-219), and `prova/compara.mjs` prints differences but exits 0 (AU2-223; the package check reads the
  count it prints). The measures and fingerprints were checked by `registre.mjs` as it ran, which stops with a `fail` line otherwise;
  `--check` only reads what the records say. This note's data pass both auditors' independent checks. Both stay open, like AU2-205 and
  AU2-216, and are fixed before the code is used again.
- **Not about the failed appearances outside the list:** the 17 aged ones that the time rule keeps were not traced (the small version).
- **Not confirmatory, and not where maturation acts:** the rule stays (AUD-184 = AU2-151).

## Everything tried

- Before the note: `prepara.mjs` (the list), `prova.mjs` while writing it, and one branch run through the instrument (world 7014), whose
  output was not kept.
- From the note's commit: `prova.mjs` once and the short test once; from `fd6ab4c`, the full run once, with no failure and no relaunch.
- After the run: the comparison of the short test's branch with the full run's (`prova/compara.mjs`), a check, not an analysis.
- `analisi.mjs --check` once, and the analysis once. Nothing else was computed; the numbers in this section are read from the output.
- After audit 44: nothing computed by the team for the note. The auditors' post hoc measures (auditor 1's origins by position, the class by
  place and the symmetric recount; auditor 2's tag counterexample and negative tests) are theirs, re-run by the team as they are, and quoted
  as theirs.

## Corrections after audit 44 (26 November 2026)

Both auditors reproduced the note (auditor 1 re-ran the seven aged branches with a tracer of their own and rebuilt the list, the classes
and the recount; auditor 2 checked the captures, the records and the analysis, and ran the instrument against the plain epoch on a real
capture), accept it as exploratory, and ask for nothing to be computed again. **The outputs do not change.** The text of "What came out" and
"The reading" is the corrected one; what the note fixed before computing is as it was.
- **"By the rule fixed in the note: fragments, as the time rule assumed"** and **"the time rule's removal now has direct support in the aged
  soup, by material"** are withdrawn (AUD-227 = AU2-218). The bit records exposure, where bytes have been: every byte of a carrier takes it
  when the carrier interacts, also bytes no copy touched; the dominant group had no carrier at the start of any window and spread within
  it; and one cell from a carrier, 0.61 to 0.84 of the cells that are not appearances are D-derived too. The rule could hardly have come out
  otherwise. The bit is consistent with the time rule, as place was, and adds no support of its own.
- **"The record cannot tell a mutated copy of the dominant group's program from a new arrangement of bytes"** said too little (AUD-228): the
  bit cannot, but the bytes' origins by position could, and post hoc they point to mutated copies (auditor 1). A lead, not a result.
- **Rc** (AUD-229 = AU2-221): it mixes two rules; treated alike in both soups it is R1, 4.55 [0.90, 22.91] (4.28 counting origins). "2.27"
  alone is not "the excess left".
- **"Six origins in each burst"** (AUD-230 = AU2-220): six components of the note's provenance graph, all joined by a shared start cell, none
  by the bit; not six births. By position (auditor 1, post hoc), six and seven, not copies of one another.
- **"They took shape between 1,250 and 250 epochs before it"** (AU2-222) is withdrawn: a matching window present at the short window's start
  does not date a lineage. `mut` and `arith` are flags on a byte's ancestry, not counts of events.
- **The validators** (AU2-219, AU2-223): `--check` accepts impossible records and `prova/compara.mjs` exits 0 on a difference; open, fixed
  before the code is used again (like AU2-205 and AU2-216). The baseline is descriptive, not calibrated as a classifier (AU2-224).
- **Details** (auditor 1, N-1, N-2, N-4): in entry 27, the fresh soup's four are at censuses where the dominant group is first detected at
  the same census or later; "0.70 to 0.98 of their bytes", not "almost all"; and world 7037's shuffled appearance, the only one with less bit
  than its neighbourhood (0.39 against 0.89, percentile 0.06), is classed "mixed", not "not from D".
