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

## How it went

- **The scripts,** in git before running anything (`fcec8bd`).
- **The short test** (22-11-2026): `primer-byte.mjs` on world 7001 (`prova/primer-byte-7001.jsonl`): the three soups, the 24 seeds with 24
  neighbours each, 1.2 s. Only its structure was looked at.
- **The full scan** (from `fcec8bd`, Node 16.15.1): the 60 worlds, all snapshots with the manifest's SHA-256, 1,440 seeds, 33 s
  (`primer-byte.jsonl`). Then `analisi.mjs --check`: the 2,160 part-A records, the scan and the 52 trackings, all valid, no result printed.
  Both in git before the analysis (`0b56a91`).
- **The analysis** (from `0b56a91`, Node 16.15.1, exit code 0): `analisi-sortida.txt`, in git as it came out (`f81327a`), before writing
  anything.
- **After audit 39:** the corrected analysis and the negative tests of `--check`, from `52b49f6` (Node 16.15.1, exit code 0 both):
  `analisi-sortida-2.txt` and `prova-check-sortida.txt`, in git as they came out (`1960ed3`).
- **After audit 40:** a stricter `--check` and more negative tests (`61addec`); from that commit (Node 16.15.1, exit code 0),
  `prova-check-sortida-2.txt`, in git as it came out. The analysis from the same commit gives `analisi-sortida-2.txt` again, identical
  except the commit in its first line: its results do not change.

## What came out (exploratory)

**In short:** in the aged soup, more of the G1 lineages that get through the first step die out, and fewer take root (by the pilot's
criterion), than in the fresh soup, most of the deaths soon after the first step; for G4, no conclusive aged-against-fresh difference was
detected. Their members are heritable less often in the aged soup, mostly
because fewer of them copy at all. By the rules fixed in the note, both the lineage records and the between-world pattern agree with the
first-byte lead. But the records have no first bytes, the spread between worlds is tiny, and within the aged soup the seeds with no
neighbour starting with `]` or 0 did no better. A lead that fits, not a mechanism shown.

### 1. The anatomy

| variant | soup | at 8,050: lost / present but not heritable / heritable | of those heritable at 8,050, by 9,500: died out / stopped after an establishment they dominated / still followed |
|---|---|---|---|
| G1 | aged | 21 / 185 / 34 | 25 / 6 / 3 |
| G1 | shuffled | 28 / 169 / 43 | 20 / 3 / 19 (and 1 stopped by another family's establishment) |
| G1 | fresh | 14 / 179 / 47 | 16 / 17 / 14 |
| G1 × 9 | aged | 0 / 83 / 157 | 123 / 10 / 24 |
| G1 × 9 | shuffled | 0 / 53 / 187 | 73 / 37 / 70 (and 7) |
| G1 × 9 | fresh | 0 / 51 / 189 | 27 / 112 / 47 (and 3) |
| G4 | aged | 21 / 161 / 58 | 7 / 51 / 0 |
| G4 | shuffled | 20 / 169 / 51 | 8 / 43 / 0 |
| G4 | fresh | 15 / 173 / 52 | 6 / 46 / 0 |

(240 plantings in each row. «Lost»: no cell carries any window of the lineage; «present but not heritable»: some do, none is heritable with
inert partners. «Stopped after an establishment they dominated»: the branch stopped 500 epochs after an establishment in which the planted
lineage was dominant, and is not observed afterwards. It is not the pilot's «taking root» (F ≥ 1,311 at two points 250 epochs apart, within
the horizon), which also counts lineages still followed: see below. These are counts of outcomes, not survival probabilities. From
`analisi-sortida-2.txt`, after audit 39; the first table gave «still alive» counts that included the branches stopped by an establishment,
and until audit 40 the middle column was called «took root»: see the corrections at the end.)

- **Most one-cell plantings lose heritability at the first step, in every soup** (G1: 206, 197 and 193 of 240 with F = 0 at 8,050). By
  the pilot's rule, their extinction is dated there once the next step confirms it, but most of them still have cells with the lineage's
  windows (G1: 185, 169 and 179); none of those cells is heritable. The aged soup's
  excess at the first step is small, and split: for G1, 7 more lost and 6 more present but not heritable; for G1 × 9, 32 more present but
  not heritable, and none lost.
- **Afterwards, more G1 lineages die out in the aged soup and fewer take root.** Of the G1 lineages still heritable at 8,050, by 9,500
  25 of 34 died out in the aged soup and 6 stopped after an establishment they dominated, against 16 and 17 of 47 in the fresh one. By the
  pilot's criterion of taking root (the one of entry 20's 0.35 and of this note's between-world correlation), 7 of the 34 take root in the
  aged soup and 29 of the 47 in the fresh one, all the G1 plantings that take root (the pilot's pR, 0.03 and 0.12 of 240): in the fresh soup,
  12 of the 14 still followed at 9,500 have already taken root (auditor 1's recount, audit 40). Counted in deaths, G1's excess is 13 at the
  first step and 9 afterwards, and 21 of the 25 later deaths come by 8,250 (in the fresh soup, all 16): G1 does not fade slowly. G1 × 9 does
  fade more gradually: 123 of 157 died out (86 by 8,250), against 27 of 189; 24 take root against 156 (pR 0.10 and 0.65). G4: 7 of 58
  against 6 of 52 died out, and the rest stopped after an establishment they dominated; all of them take root (51 and 46).
- **The shuffled soup is in between** for G1 and G1 × 9 (20 of 43 and 73 of 187 died out).

### 2. The lead at the lineage level

- **The heritable share of the members in the first five steps** (`functional`/`tested`): G1, 9.8% in the aged soup against 15.3% in the
  fresh one, 0.64 [0.47, 0.88]; G1 × 9, 0.57 [0.51, 0.63]; G4, 1.02 [0.92, 1.15]. By the note's rule (G1 below 1 and G4 contains 1):
  **the lineage records agree with the first-byte lead.**
- **It is mostly members that do not copy at all:** for G1, `copying`/`tested` is 10.6% against 16.0%, and `functional`/`copying` 92.4%
  against 96.0%. A copy that starts with `]` may not run at all, which would fit; but the records have no member's first byte, and cannot
  tell.
- **The measure also counts the lineages that are already dying out** (AUD-213): counting only the steps where the lineage is heritable
  (F ≥ 1), G1 gives 0.81 [0.68, 0.97], G1 × 9 0.73 [0.68, 0.79] and G4 1.01 [0.92, 1.10] (post hoc, `analisi-sortida-2.txt`). The rule's
  verdict does not change.
- **In the shuffled soup, something else:** G4 also loses there (0.84 [0.76, 0.92]), and so does G1 × 9 (0.87 [0.81, 0.93]), with only
  about 1% of the cells starting with `]` or 0. The shuffled soup's deficit is not the first byte.

### 3. The lead between worlds

- **The share of the aged soup's cells that start with `]` or 0 hardly varies between worlds:** from 13.3% to 14.3% (median 13.9%; the
  shuffled soup, 1.1%; the fresh one, 0.8%).
- **Taking root:** G1 and G1 × 9, Spearman −0.28 [−0.50, −0.03]; G4, −0.05 [−0.32, 0.22]. By the note's rule, **the between-world
  pattern agrees with the lead.** But the spread is one percentage point, too small for the mechanism itself to make much difference; it is
  one of four correlations (with Holm's correction for the four, p = 0.13; auditor 1, audit 39); and G1's heritable share does not show it
  (−0.12 [−0.37, 0.14]). The share may stand for something else in how each soup aged.
- **Within the aged soup, the neighbours do not fit:** the 26 G1 seeds with no neighbour starting with `]` or 0 did worse (4.4% of the
  tested members heritable, none took root) than those with 1 or 2 (10.0%; 2 took root) or 3 or more (10.0%; 5). Few seeds, descriptive,
  and in the opposite direction. Auditor 1 (audit 39) found that these 26 places are not random (four times more than expected, with more
  instructions around), and that G4 and G1 × 9 planted at the same places also take root less there: rather an effect of the place.
  Auditor 2 (audit 39) read it as evidence against the simple local version of the lead: few seeds, clustered by world and position, but
  not to be dismissed. Both agree that it does not corroborate the lead.

### 4. The natural families counted both ways

- **The consistency by group** (an operational criterion, not a test of equivalence): 12 of 36 (0.33) in the aged soup, 11 of 21 (0.52)
  in the shuffled one and 5 of 11 (0.45) in the fresh one, against 0.63, 0.62 and 0.94: met only in the shuffled soup. These are auditor 1's
  figures (audit 38), now from the project's code.
- **The longest common substring:** of the 18 failed appearances in aged-soup establishing branches, 9 share 10 bytes or more with their
  branch's dominant group (median 9), and none with the other worlds' dominant groups (median 4); in the shuffled soup, 4 of 9; in the
  fresh one, 2 of 5. Also auditor 1's figures.
- **Without these probable fragments:** 24, 10 and 6 failed appearances; aged against fresh, 4.28 [1.24, 15.61]. Auditor 1's rule (without
  all those within 1,250 epochs before an establishment) gave 4.55 [0.89, 23.22]. The two post hoc rules disagree on whether the interval
  stays above 1, so the excess still cannot be separated from fragmentation with confidence. And the 24 include the 8 of world 7046, which may
  be fragments of a large family that did not become established.

### What it does not say

- **Not that the first byte explains the extinctions of the planted replicators.** The records agree with it at the level of the soup, but
  they have no first bytes, the spread between worlds is tiny, and the local test points the other way. Showing it would need an
  intervention (changing the aged soup's `]` and 0 first bytes, against a placebo). The pilot's `byte0` arms, which removed `<` from the
  first byte, are not that test. Planting again for it needs a new decision of the owner and the agreement of the three.
- **Not where maturation acts:** the rule stays (AUD-184 = AU2-151).
- **The lineage is of windows, not of descent** (AU2-156).

## Everything tried

- The short test of the scan (one world), the full scan, `--check` and the analysis, once each.
- After audit 39: the corrected analysis and its negative tests, once each. After audit 40: the stricter negative tests, once, and the
  corrected analysis again from the same commit, to check that it gives the same output. Nothing else was computed.

## Corrections after audit 39 (24 November 2026)

Both auditors reproduced the analysis; auditor 2 gave a NO-GO to the temporal reading as written (AU2-192, high), and both asked for
corrections to the reading. **The first output (`analisi-sortida.txt`) stays as it came out.** The corrected analysis (`analisi.mjs` at
`52b49f6`) wrote `analisi-sortida-2.txt`; only the anatomy changes, and a post hoc line is added. The text above is the corrected one.

- **«Still alive at 9,500»** (AU2-192). The table counted as alive the branches that had stopped at an establishment before 9,500, which are not
  observed afterwards; most of them were successes, with the planted lineage dominant. It said: «9 of 34 are alive at 9,500 in the aged soup,
  against 31 of 47», «G4: 51 of 58 against 46 of 52», and «the shuffled soup is in between (23 and 114 alive)». Now: died out, stopped by an
  establishment (called «took root» until audit 40), and still followed, as counts of outcomes.
- **«They die out slowly over the first thousand epochs»** (AUD-214). True of G1 × 9, not of G1, whose later deaths mostly come by 8,250.
- **The heritable share of 0.64** (AUD-213) also counts the lineages already dying out; only the heritable steps give 0.81 [0.68, 0.97].
- **`--check`** (AU2-193) accepted impossible counts. It now refuses them, and `prova-check.mjs` gives it 17 broken copies of the scan
  (`prova-check-sortida.txt`, all refused, the real one accepted).
- **The between-world correlation and the neighbours:** auditor 1's Holm correction and auditor 1's reading of the 26 places, added above
  (and auditor 2's, after audit 40).
- **Without the snapshots** (AU2-194), the first-byte scan cannot be redone from the package: it can from the pilot's computation copy, where
  the snapshots are kept.

## Corrections after audit 40 (24 November 2026)

Both auditors reproduced the corrected analysis and its negative tests, and accepted the outcomes (AU2-192, closed). Auditor 1 gave a GO
with a condition on the text, and auditor 2 a NO-GO to the merge until the data check was stronger; neither asked for anything to be
computed again. **Neither output changes:** `analisi-sortida.txt` and `analisi-sortida-2.txt` stay as they came out. The text above is the
corrected one.

- **«Took root»** (AUD-215). The middle column of the table counted the branches stopped after an establishment that the planted lineage
  dominated, not the pilot's taking root, which also counts lineages still followed: for G1, 6 and 17 against the pilot's 7 and 29; for
  G1 × 9, 10 and 112 against 24 and 156. It now says what it counts, and where the text says «take root» it gives the pilot's figures. The
  direction does not change.
- **«Most one-cell plantings die at the first step»** (AU2-198). F = 0 at the first step is a loss of heritability, dated as the extinction
  by the pilot's rule once the next step confirms it; most of those lineages still have cells. Now «lose heritability».
- **«G4 shows no such difference»** (AU2-198). It is not shown to be equal: «no conclusive aged-against-fresh difference was detected».
- **The neighbours:** auditor 2's reading of the 26 places, next to auditor 1's (auditor 1, N-4).
- **`--check`** (AU2-196, AU2-197, AUD-216) still accepted two seeds of the same cell with other counts, a scan header without its commit
  and Node, and lineage lines that the lineage module cannot write, or a missing one. It now checks the scan's commit (`fcec8bd9`) and
  header, the seeds that share a cell, and every lineage line against `fase2/llinatge.js`; the two files of the negative tests are refused
  without `--check` (auditor 1, N-5); and `prova-check.mjs` gives it 33 copies of the scan and 19 of a part-A record
  (`prova-check-sortida-2.txt`: each broken one refused for the reason it names, the real ones accepted). The real data meet every check.
- **A blank line at the end of this file** (AU2-199), removed.
