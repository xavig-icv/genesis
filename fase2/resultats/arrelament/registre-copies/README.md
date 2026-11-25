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
