# The pilot of appearance and taking root: how the planted replicators die out in the aged soup (exploratory)

**Written on 22 November 2026, before computing anything.** This is the exploration lane (`docs/disseny.md`, 11-11-2026), and the
next step on which both auditors and the team agreed at audit 38 (the synthesis, and the row of `docs/disseny.md` of 22-11-2026). The
project owner said yes the same day ("endavant amb la nota", task T-82). **It plants nothing and simulates nothing:** it reads the records
of the pilot (in git), the pilot's starting snapshots (on the computation copy of the pilot, not in git) and the natural-lineage tracking
of the previous note (in git). It is the first note written in English, after the language decision of the same day.

## The question

In the pilot (notebook entry 20), the planted replicators take root less in the aged soup than in the fresh one (0.35 [0.28, 0.43]),
mostly because of G1 (one cell and the 3 × 3 square); for G4 it is inconclusive. Why? Two leads, one from each auditor (audit 38, F5):
- **The anatomy of the extinctions** (auditor 2): when and how the planted lineages die out, from the lineage records the pilot already
  has, with the world as the unit.
- **The first byte** (auditor 1, post hoc, from a single encounter): when G1 runs first, its copy keeps the partner's first byte, and if
  that byte is `]` or 0 the copy is not heritable. In the aged soup 11.3% of the cells start with `]` (0.5% in the shuffled soup, 0.4%
  in the fresh one), and G1's copy is not heritable 12.9% of the time there (0.6% in the fresh soup). G4 overwrites the first byte and is
  not affected. Auditor 1 also found that, within the aged soup, the G1 seeds with no neighbour starting with `]` or 0 die out at the
  first step as often as the others, and that the shuffled soup also loses without this effect: the lead does not explain everything.

Four questions:
1. **How do the planted lineages die out?** At the first step, are they lost (no cell carries any of their windows), present but not
   heritable, or still heritable? When do they die out? And which share of their members copy, and which share are heritable?
2. **Does the first-byte lead reach the lineage level?** If the aged soup turns G1's copies into copies that are not heritable, the
   heritable share of G1's lineage members in the first steps should be lower in the aged soup than in the fresh one, and G4's should
   not.
3. **Does it hold between worlds?** If the lead matters, the worlds whose aged soup has more cells starting with `]` or 0 should be the
   ones where G1 does worse, and not G4.
4. **The natural families counted both ways** (audit 38, F1 and F2): by lineage and by group, with the longest common substring as a
   marker of the probable fragments of the establishing lineage.

## What is already known (so that nobody reads it as a prediction)

- **From the pilot (entry 20):** the rooting shares and their ratios, and that 633 of 840 plantings die out in the aged soup against
  485 in the fresh one.
- **From the previous note (entry 21; `../llinatges/analisi-sortida.txt`):** the G1 seeds whose lineage has F = 0 at the first step
  (epoch 8,050): 206 of 240 in the aged soup, 197 in the shuffled one and 193 in the fresh one; for G4, 182, 189 and 188.
- **From audit 38 (auditor 1, post hoc):** the first-byte figures above; the consistency counted by group (0.33, 0.52 and 0.45 against
  0.63, 0.62 and 0.94 for the planted); the failed appearances without those within 1,250 epochs before an establishment (4.55 [0.89,
  23.22]); and the longest common substring of the 18 aged-soup failed appearances in establishing branches with the dominant group of
  their world (median 9 bytes; 10 to 15 bytes in 9 of them; never 10 or more with the other worlds).
- **Not looked at:** anything about the members of the planted lineages (the `tested`, `copying` and `functional` fields beyond the first
  step's F), the per-world share of cells starting with `]` or 0, or its relation with any outcome.

## The data

- **The part-A records of the pilot** (in git, `../pilot/part-a/`): the 2,160 branches of the informative variants, G1, G1 × 9 and G4,
  in the three soups (60 worlds, 4 positions). Each has a lineage line every 50 epochs from 8,000 (M, the cells that carry a window of
  the lineage; `tested`, those tested with inert partners, all of them if M ≤ 256; `copying`, those that copy into a partner; `functional`,
  those that are heritable; F, the estimated functional cells), the establishment event if any, and the end line (with the extinction).
  G2 and G3, at the ceiling, and the shams are left out, as in the pilot's contrast.
- **The pilot's starting snapshots** (`alicuotes/NNNN/ARM.bin` of the pilot's computation copy, not in git), checked against the SHA-256 of
  the manifest: for the share of cells that start with `]` or 0, per world and soup, and for the first byte of the 24 neighbours (radius 2)
  of each one-cell seed. These counts go into git (`primer-byte.jsonl`), so that the analysis can be redone without the snapshots.
- **The natural-lineage tracking** (in git, `../llinatges/seguiments/` and `../llinatges/simulacio/`), for question 4.
- **No data from an undecided series.** The pilot is exploratory and already audited (37 and 38).

## The analysis, fixed now (`analisi.mjs`)

The world is the unit: the bootstrap resamples whole worlds (10,000 times, with seed **20261125**, which belongs to no plan).
Ratios are aged against fresh and shuffled against fresh, with the bootstrap interval.

1. **The anatomy**, for G1, G1 × 9 and G4 in each soup:
   - **the state at the first step** (epoch 8,050): *lost* (M = 0), *present but not heritable* (M ≥ 1 and F = 0), or *heritable* (F ≥ 1);
   - **the time to the first F = 0 and to the extinction** (two consecutive zeros, the pilot's rule), as the share still alive at 8,050,
     8,100, 8,250, 8,500, 9,000 and 9,500;
   - **the shares of the members in the first five steps** (8,050 to 8,250), pooled over the branches: `copying`/`tested`,
     `functional`/`copying` and `functional`/`tested`.
2. **The lead at the lineage level:** the ratio, aged against fresh, of `functional`/`tested` pooled over the first five steps, for G1,
   G1 × 9 and G4 (and shuffled against fresh, for comparison).
3. **The lead between worlds:** for each world, the share of the aged soup's cells that start with `]` or 0; its range over the 60 worlds;
   and its Spearman correlation, over the worlds, with (a) the number of G1 and G1 × 9 plantings that take root in the aged soup (of 8),
   (b) G1's `functional`/`tested` in the first five steps, and (c) the same two for G4. The interval, from the bootstrap over worlds. And,
   descriptive: for the one-cell G1 seeds of the aged soup, `functional`/`tested` by the number of neighbours that start with `]` or 0
   (none, 1 or 2, 3 or more).
4. **The natural families counted both ways** (descriptive, with rules fixed now; auditor 1 computed parts of it post hoc in audit 38):
   - **a group:** the robust lineages with the same root at the end of the tracking; it is detected when its first lineage is; it takes root
     if it is the dominant group at the confirmation. The consistency counted by group, with the note's rule and the planted ones as in the
     previous note;
   - **the longest common substring:** between any program of a lineage's first detection and any initial program of the lineages of the
     dominant group of its branch (also reversed). For the failed appearances in establishing branches, the share with 10 bytes or more; as a
     control, the same against the dominant groups of the other worlds of the same soup;
   - **the failed appearances without the probable fragments** (those with 10 bytes or more in common with their branch's dominant group):
     the counts and the aged/fresh ratio.

## What would change my mind (fixed now)

- **Question 2, the lead at the lineage level:** if the interval of G1's ratio (aged against fresh, `functional`/`tested`) lies below 1
  and G4's contains 1, the lineage records agree with the first-byte lead. If G1's contains 1, the records do not show the lead at the
  lineage level. If G4's also lies below 1, something in the aged soup hurts both, and the first byte is not the explanation.
- **Question 3, between worlds:** if the interval of G1's correlation with rooting lies below 0 and G4's contains 0, the between-world
  pattern agrees with the lead. If G1's contains 0, there is no between-world association, and I will say how much the share varies
  between worlds (if it hardly varies, the test has no power, and I will say so).
- **Question 1** is descriptive. I will say whether the excess of G1 deaths in the aged soup is mostly *present but not heritable* (the
  lineage leaves cells that carry its windows and do not copy themselves) or *lost* (nothing carrying its windows is left).
- **Question 4** is descriptive, and no reading depends on it: it puts in the project's code, with fixed rules, what auditor 1 computed
  post hoc.

## The short test, before the full run

`primer-byte.mjs` on a single world (the first of the cohort), and `analisi.mjs --check`, which loads and validates all the data
(the 2,160 records, `primer-byte.jsonl`, the 52 trackings) and prints only the counts of what it read, no result. If anything fails,
nothing else runs, and it is written here.

## The budget

- **No simulation.** Reading the records and the 180 starting snapshots: minutes. The limit of the lane (two days) is far.

## The limits, from the start

- **Exploratory:** no general causal claim, and no data that can be used to confirm anything.
- **The lineage is of windows, not of descent** (AU2-156): a copy that keeps few bytes of the planted program may fall out of the lineage.
- **The records have no interaction order and no per-member first byte:** question 2 can only see the lead through the heritable share of
  the members, not the mechanism itself.
- **Few worlds, little spread:** 60 worlds; if the share of `]` hardly varies between worlds, question 3 cannot answer.
- **No new planting.** Re-running part-A branches with instrumentation (auditor 2's second suggestion) would plant again: it needs a new
  decision of the owner and the agreement of the three (the T-64 rule), and is not part of this note.

## The commands (before computing)

- **`primer-byte.mjs PILOT-FOLDER [--world NNNN]`:** the per-world and per-seed first-byte counts, from the pilot's starting snapshots
  (checked against the manifest's SHA-256), to `primer-byte.jsonl`.
- **`analisi.mjs [--check]`:** the analysis above, to `analisi-sortida.txt`, with the commit and the Node version in its first line.
