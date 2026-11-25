# The pilot of appearance and taking root: a within-world null for the fragment links (exploratory)

**Written on 25 November 2026, before computing anything.** This is the exploration lane (`docs/disseny.md`, 11-11-2026), and auditor 2's
proposal at audit 41 (question 4 and AU2-204) and at audit 42 (§6.4): the smallest of the five paths in notebook entry 25. The project
owner said yes on 25-11-2026 ("endavant amb el nul dins del món"). **It plants nothing and simulates nothing:** it only reads data that are
already in git.

## The question

The sensitivities note (`../sensibilitats/`, notebook entry 24) found that 15 of the 16 aged-soup failed appearances that auditor 1's time
rule removes are also linked to the dominant group of their branch by sequence (14) or by place (11), and read it as: the three kinds of
evidence agree that they are probable fragments, and the excess of failed appearances in the aged soup cannot be separated from
fragmentation. But both links were calibrated outside the world, not within it:
- **the sequence threshold** (8 bytes) is 1 + the longest substring a failed appearance shares with the dominant groups of *other* worlds.
  Auditor 1's check with the starting snapshots (audit 41) sees the history shared before epoch 8,000, not after it: lineages of the same
  branch could share 8 bytes because they grew from the same soup after 8,000, without being fragments of each other;
- **the chance level of place** is the coverage of one uniformly drawn cell, computed only over the links found (AU2-204).

**Are the sequence and place links between the failed appearances and the dominant group more frequent than the same links between
lineages of the same world that cannot be, or operationally are not, fragments of each other?** If they are, the agreement stands against
a within-world null (still not descent). If not, the evidence that these appearances are fragments is weaker than the note read, and the
aged soup's excess of failed appearances is a more open question.

## What is already known (so that nobody reads it as a prediction)

- **The sensitivities note:** the agreement, 15 of 16 in the aged soup (14 by sequence, 11 by place, 10 by all three), 8 of 9 in the
  shuffled soup and 2 of 4 in the fresh one; the median chance level of the place links, 0.160 (aged soup 0.168); *s*\* = 8; the failed
  appearances under R0 to R6 (aged, shuffled, fresh: R0 33, 14, 8; R1 17, 5, 4; R3 19, 8, 7; R4 22, 10, 6; R5 17, 5, 4; R6 11, 5, 5) and
  the aged/fresh ratios (the interval contains 1 under R1, R3, R5 and R6). With *x* strictly earlier (AU2-203): 15 of 16, 7 of 9 and 0 of 4;
  R6 11, 6, 7.
- **Auditor 1's check at epoch 8,000** (audit 41): at most 0.50% of the aged soup's starting cells share 8 bytes with the dominant group's
  first programs, in the same world as in the others.
- **Counted before writing this note** (`factibilitat.mjs`, run once from a scratch folder; no substring, distance or link computed): in
  the aged soup, 21 tracked branches, 15 of them establishing; 158 robust lineages, 47 of them in a dominant group; 18 failed appearances in
  establishing branches, 16 in the time window, all 16 with an earlier live lineage of the dominant group (104 lineage pairs); 10 of the 18
  also have an earlier live lineage of another group, never united with them (26 lineage pairs), and in the non-establishing aged branches 8
  appearances have one (29 pairs); 8 of the 15 aged establishing branches have another establishing arm in the same world. In the shuffled
  soup, 1 establishing-branch appearance and 1 non-establishing one have such a partner; in the fresh soup, 1 and 0. **The within-branch
  null can be built for the aged soup only.** The script, with a relative path, is in git with this note, and its output from the note's
  commit.

## The data

- **The natural-lineage tracking** of the lineage note (`../llinatges/seguiments/`, with `../llinatges/simulacio/` and
  `../llinatges/comparacio/`) and the part-B records of the pilot (`../pilot/part-b/`), as in the sensitivities note's section 2: each
  lineage's first programs and cells, the cells of every lineage at every inert census, the unions, the steps (F) and the establishment.
- **The retest** of the lineages' first programs (100 conditions of `fase2/inert.js`, as in the extinction and sensitivities notes):
  robust means heritable in 50 or more.
- **No data from an undecided series.** The pilot is exploratory and already audited (37 to 42).

## The definitions (as in the sensitivities note)

- **A robust lineage, the dominant group** (at the confirmation of the establishment), **a failed appearance** (a robust lineage not in
  the dominant group, detected within the exposure), **earlier** (detected at an earlier census, or at the same census with a lower number:
  the note's convention, AU2-203) and **alive at *e*** (F ≥ 1 in one of its steps of the 250 epochs up to *e*).
- **A group:** the lineages the tracking united (its root). **The available groups of a failed appearance *y*:** the groups other than
  *y*'s own with at least one robust lineage earlier than *y* and alive at *y*'s detection. The dominant group, *D*, if it is one of them;
  the others are **control groups**. A control group never shared a heritable cell with *y* in the whole tracking (otherwise it would be
  *y*'s group): it is an operational negative, not a genealogical truth. It may itself be a fragment of the dominant group, which makes the
  null harder to beat, not easier.
- **The representative of a group for *y*:** its oldest robust lineage among those earlier than *y* and alive at *y*'s detection (ties by
  number). One lineage's first programs, so that the dominant group, with more lineages, does not get more chances (auditor 2: preserve the
  sizes of the program sets). The sensitivities note's group link, with all those lineages, is a sensitivity.
- **A sequence link at *t* bytes:** a first program of *y* and one of the representative share a substring (also reversed) of *t* bytes or
  more. ***t* ∈ {8, 9, 10, 12, 16}, fixed now** (auditor 2); 8 is the main one (the note's *s*\*). All are reported, and none is chosen
  afterwards.

## The analysis, fixed now (`analisi.mjs`)

The bootstrap resamples whole worlds, 10,000 times, with seed **3100000000**, which belongs to no plan and lies outside the ranges of the
plans' seeds.

### 1. Sequence: two within-world controls and a label permutation

- **1a. Other arms of the same world** (auditor 2's control a): for each failed appearance of an establishing branch, the longest substring
  with the dominant group (all its lineages) of each other arm of the same world that became established. No descent is possible between
  arms; the aged and the shuffled soups share their bytes, not their arrangement. Per soup: the number of pairs, the longest substring, and
  how many pairs reach each *t*.
- **1b. Within the branch, operational negatives** (auditor 2's control b): for every failed appearance *y* of any tracked branch
  (establishing or not) and each of its available groups *g*, whether *y* and *g*'s representative share *t* bytes or more. Per soup and
  *t*: the share among the pairs with *D*, and the share among the pairs with control groups, **the within-branch false-link rate *f*<sub>*t*</sub>**,
  with the counts and the bootstrap interval. Also the longest substring among the control pairs.
- **1c. The label permutation (the main test):** in the aged soup, the failed appearances of establishing branches that have *D* and at
  least one control group available (**the informative appearances**). *T* = how many of them are linked to *D*'s representative at 8 bytes.
  Under the null that *D* is not special among *y*'s available groups, the dominant label falls uniformly on one of them, independently for
  each *y*: the null distribution of *T* is exact, a convolution of independent Bernoulli variables, each with probability
  *m*<sub>*y*</sub>/*n*<sub>*y*</sub> (*m*<sub>*y*</sub> of the *n*<sub>*y*</sub> available groups linked to *y*). **p = P(*T*\* ≥ *T*).**
  The same at 9, 10, 12 and 16 bytes, and with the group link (all lineages), descriptive. The other two soups, descriptive, if they have
  any informative appearance.

### 2. Place: a spatial null (AU2-204)

For each failed appearance *y* of an establishing branch with an earlier live lineage of the dominant group: the sources are the heritable
cells, at *y*'s census, of the dominant group's lineages earlier than *y* and alive (as in the note). *y*'s detection cells are moved by
**every** rigid translation that keeps all of them inside the world (exhaustively, with no randomness), and *p*<sub>*y*</sub> is the share of
translations with a cell at most 8 cells (Chebyshev) from a source. Per soup: the observed number of place links, its expectation under
the null (Σ *p*<sub>*y*</sub>), and **P(count ≥ observed)** under the exact Poisson-binomial distribution. And the agreement under this null,
descriptive: of the aged-soup appearances the time rule removes, how many would be linked by sequence or place if the sequence links are
kept as observed and the place links follow the null (the expectation, and P(≥ the observed agreement)).

### 3. The whole graph, at every threshold (auditor 2's sensitivities)

At each *t* ∈ {8, 9, 10, 12, 16}, with the place rule of 8 cells and the sensitivities note's definitions (all the dominant group's
lineages earlier and alive):
- **the rules:** R3 (sequence at *t*), R5 (time, sequence or place), **R5∧** (without the appearances linked to the dominant group by
  sequence *and* place), R6 (the candidate families, with edges by sequence or place) and **R6∧** (edges only when sequence and place both
  link): the counts per soup, and the aged/fresh ratio with its interval. R0 and R1 do not depend on *t* and are given once;
- **the agreement** (aged soup): of the appearances the time rule removes, how many are linked by sequence or place at *t*;
- **the graph,** per soup: the edges, the edge density (edges over the pairs that could be linked: earlier and alive), the components, the
  bridges (edges whose removal splits a component), and R6 with the bridges removed;
- **leave one world out,** at 8 bytes: the aged/fresh ratio under R0, R1, R5 and R6 with each of the 60 worlds left out in turn: the range
  of the point estimate, and how many of the 60 change the verdict of the interval (contains 1, or lies above 1). Each with its own
  bootstrap of 10,000 and the same seed.

## What would change my mind (fixed now)

- **Sequence within the branch (1c, the main test).** With 8 informative appearances or more: if p ≤ 0.05, the failed appearances share 8
  bytes with the dominant group more often than with the other groups of their branch: **the sequence link singles out the dominant group
  within the world.** If p > 0.05, it does not, at this power: within the branch, the sequence link is about as frequent with other groups,
  and it is weaker evidence of fragments than the sensitivities note read. With fewer than 8: **indeterminate.**
- **The within-branch false-link rate (1b).** If *f*<sub>8</sub> in the aged soup is 0.10 or less, 8 bytes rarely links never-united
  groups of the same branch; if it is 0.33 or more, it often does, and 8 bytes is not calibrated within the world; in between, partly.
- **Other arms (1a).** If no pair reaches 8 bytes, the threshold holds within the world for pairs that cannot be descent; if some do, it does
  not, and I say the smallest *t* that none reaches.
- **Place (2).** If P(count ≥ observed) ≤ 0.05 in the aged soup, the place links are more than the same appearances placed uniformly would
  give: **place is evidence at the level of the set,** not of each link; otherwise it is not.
- **The reading of "cannot be separated from fragmentation":** if both 1c and 2 give p ≤ 0.05, the agreement stands against both
  within-world nulls; if only 1c, it stands on the sequence; if only 2, it stands on place alone; if neither (with 1c determinate), it
  weakens, and the aged soup's excess of failed appearances (R0, 4.41 [1.44, 15.49]) is a more open question. In no case is it a test of
  descent, or of where maturation acts.
- **The graph (3):** whether the aged/fresh verdict changes with the threshold, with AND instead of OR, without the bridges, or when one
  world is left out. Reported, not chosen.

## The short test, before the full run

`analisi.mjs --check` loads and validates all the data and prints only the counts of what it read and of the pairs each control has, no
link and no substring. If anything fails, nothing else runs, and it is written here. The checks (stronger than the sensitivities note's,
after AU2-205):
- **the manifest and the list:** the tracked branches are exactly the part-B branches whose record has an inert census with a heritable
  cell, in the manifest's order (as `../llinatges/prepara.mjs` chose them);
- **each tracking:** complete (start and end), of its record (the SHA-256 of `../llinatges/simulacio/`), with the check of the lineage note
  (`hi coincideix`), and its start line matching the manifest (branch, world, soup) and the part-B record (the event and the confirmation);
- **each census line of a tracking:** an inert census of the part-B record at the same epoch, with the same sample and the same number of
  heritable cells; one entry per heritable cell, without repeats; each named lineage known and detected at or before that census; the cells
  with no lineage are exactly those of the lineages created at that census; the unions join known lineages, the younger to the older;
- **each step line:** a known lineage, at or after its detection, with 0 ≤ functional ≤ tested ≤ M and F ≤ M;
- **each new lineage:** programs of 64 bytes (128 hexadecimal digits), as many as its cells, cells inside the world and without repeats.

## The budget

No simulation. The retest of the first programs (about a minute and a half), the substrings and the translations: minutes. The limit of the
lane (two days) is far.

## The limits, from the start

- **Exploratory:** no general causal claim, and no data that can be used to confirm anything.
- **A link is not descent** (AU2-156): the lineage is of windows, and the inert census is a sample of 4,096 cells every 250 epochs. A
  control group is an operational negative, not a lineage known to be unrelated; if control groups are themselves fragments of the dominant
  group, the null is harder to beat.
- **Few appearances:** about 10 informative ones in the aged soup, and almost none in the other two soups.
- **The spatial null places the appearances uniformly:** appearances may gather where the soup is active, near the dominant group, for
  reasons other than descent. It says how much place adds over a uniform placement, not why.
- **Not where maturation acts:** the rule stays (AUD-184 = AU2-151).

## The commands (before computing)

- **`factibilitat.mjs`:** the counts above, to `factibilitat-sortida.txt`.
- **`analisi.mjs [--check]`:** the analysis above, to `analisi-sortida.txt`, with the commit and the Node version in its first line.

## How it went

- **The scripts,** in git before running anything (`f35b47a`). The note's folder was first called `nul`, a name Windows reserves: git could
  not add it, and it became `nul-dins-mon` before the commit.
- **The feasibility counts** (`factibilitat.mjs`, from `f35b47a`, Node 16.15.1, exit code 0): `factibilitat-sortida.txt`, the same counts
  as the scratch run before the note.
- **The short test** (25-11-2026, from `f35b47a`, Node 16.15.1): `analisi.mjs --check`, all the data valid (the 180 part-B records, the 52
  trackings, the list as expected), no result printed. The pairs of each control: in the aged soup, 12 with other arms (1a), 16 with the
  dominant group and 55 with control groups (1b), 10 informative appearances (1c) and 16 appearances with sources (2); in the shuffled soup,
  5, 8 and 2, 1 and 8; in the fresh soup, 3, 2 and 1, 0 and 2. *Corrected after audit 43* (AUD-226, AU2-216): the checks do not require
  every census and every step, the cells and the new lineages' programs against the simulation, single joins from root to root, the `groups`
  field (with which the dominant group is chosen), a dominant group for every establishment, steps within the branch, or the final line's
  branch; auditor 2 shows four impossible mutations (a missing census, a false group at the confirmation, a step after the end, a false final
  branch) that they accept. Both auditors checked these points against the records and the simulation, and the data pass. Before this code
  is used again, they go on AU2-205's list.
- **The analysis** (from `afa94d2`, Node 16.15.1, exit code 0, nothing on stderr, 147 s): `analisi-sortida.txt`, in git as it came out
  (`0f3e59f`), before reading it. It reproduces the sensitivities note: R0 to R6 at 8 bytes (33, 14, 8 … 11, 5, 5) and the agreement, 15 of
  16 (14 by sequence, 11 by place).
- **One check after reading the output** (`posthoc-mons.mjs`, from `aff1c5e`, exit code 0; `posthoc-mons-sortida.txt`, `d0a7743`): where
  the control pairs of 1b come from. It is declared as post hoc below.

## What came out (exploratory)

**In short:** by the rules fixed before computing, both within-world nulls are beaten. The failed appearances share 8 bytes with the
dominant group more often than with the other groups of their branch (8 of 10, against 5.65 expected; p = 0.036), and they lie near it far
more often than the same appearances placed uniformly would (11 of 16, against 3.10; P = 1.5·10⁻⁵). **But the sequence's pass does not
hold with the branch as the unit:** the 10 appearances come from four branches, six from one (world 7052), the test treats them as
independent, and all their control groups are lineages detected at the same census as the appearance, "earlier" only by number (with one
dominant label per branch, p = 0.125, the smallest these four branches allow; audit 43). **Within the world the sequence is undecided with
these records, and "cannot be separated from fragmentation" stands on place and time.** And **8 bytes cannot be calibrated within the world
with these records:** 25 of the 55 pairs with never-united groups of the same branch share 8 bytes, but 47 of the 55 are lineages born at the
same census as the appearance, mostly in two bursts, which may be fragments of one lineage. The verdict on the aged soup's excess depends on
the rule and on how a burst is counted. *(Corrected after audit 43: see the end.)*

### 1. Sequence

- **Other arms of the same world (1a):** no pair reaches 8 bytes. The longest substring a failed appearance shares with the dominant group
  of another arm of its world is 6 bytes in the aged soup (12 pairs), 4 in the shuffled (5) and 2 in the fresh (3). By the note's rule, the
  threshold holds for pairs that cannot be descent. But no two arms share the soup's arrangement (the aged and the shuffled soups share
  only its bytes, the fresh one nothing): like the other worlds, this is a control of composition (with the world's bytes in disorder, 8
  bytes is not reached by chance), not of the history within the world (auditor 1, N-1). And 0 of 20 pairs is descriptive: with 20
  independent pairs, the one-sided 95% upper bound would be 0.14 (AU2-215).
- **Within the branch (1b), the aged soup:** the representative of the dominant group shares 8 bytes with 13 of the 16 failed appearances
  that have one; **the never-united control groups, with 25 of 55: *f*<sub>8</sub> = 0.45** (the bootstrap interval, [0.00, 0.57]). The longest
  substring with a control group is 13 bytes. At the other thresholds:

  | *t* | with the dominant group | with control groups (*f*<sub>*t*</sub>) |
  |---|---|---|
  | 8 | 13 of 16 (0.81) | 25 of 55 (0.45) |
  | 9 | 9 of 16 (0.56) | 19 of 55 (0.35) |
  | 10 | 5 of 16 (0.31) | 10 of 55 (0.18) |
  | 12 | 3 of 16 (0.19) | 4 of 55 (0.07) |
  | 16 | 0 of 16 | 0 of 55 |

  By the note's rule (0.33 or more), 8 bytes often links never-united groups of the same branch. *Checked after reading the output*
  (`posthoc-mons.mjs`): the 55 control pairs come from 6 worlds, and two carry 49 of them (world 7046, a branch that did not become
  established, 28 pairs and 12 links; world 7052, an establishing one, 21 and 12); in the other four, 1 link of 6 pairs. The rate is mostly
  two worlds', hence the interval down to 0.00. The shuffled and fresh soups have 2 and 1 control pairs. **But the controls are operational
  negatives, not pairs known to be unrelated** (AUD-224, AU2-215): 47 of the 55 pairs are lineages born at the same census as the appearance
  (20 of them linked at 8 bytes), mostly in two bursts (world 7046 at epoch 16,000, the last census of its branch; world 7052 at 10,000, its
  establishment), which may be fragments of one lineage; and the tracking already splits new lineages that share a 16-byte window with 6 or
  more distinct bytes, so at 16 bytes no same-census pair can link through such a window (none does). *f*<sub>8</sub> is not a false-link
  rate: **8 bytes cannot be calibrated within the world with these records.** (Of the 8 pairs from an earlier census, 5 link at 8 bytes and
  3 at 12: the team, counted at audit 43, post hoc.)
- **The label permutation (1c, the main test):** 10 informative appearances in the aged soup (with 2 to 7 available groups each). **8 of them
  share 8 bytes with the dominant group's representative, against 5.65 expected if the dominant label fell on any of their available groups:
  p = 0.036,** and by the note's rule it passes. **But the test treats the 10 appearances as independent, and they come from four branches,
  six from one (world 7052; 1 each from 7014 and 7048, 2 from 7059), where the dominant group is the same group for all six** (AUD-223,
  AU2-212). All 26 control groups are lineages detected at the same census as the appearance, "earlier" only by number, while the dominant
  group's representative is always from an earlier census and carries up to 34 first programs (34, 21 and 12 in worlds 7014, 7048 and 7059;
  1 in 7052), against 1 or 2 for the controls (AU2-213). *Post hoc, the auditors at audit 43:* with one dominant label per branch, among the
  groups all its appearances have, p = 0.125, the smallest these four branches allow; with a priority order of the groups shared within each
  world, 0.065; without world 7052, 0.17; with one program per representative, 0.21; with "earlier" strict (AU2-203), no informative
  appearance is left. **Within the world, with these records, the sequence is undecided.** Descriptive: with the representative, at 9 bytes
  p = 0.125 (5 against 3.34) and at 10, 0.20 (2 against 0.90); with the group link (all the lineages), which favours the dominant group by
  construction, p = 0.012, 0.007 and 0.014 at 8, 9 and 10 bytes. The shuffled soup has one informative appearance, and the fresh none.

### 2. Place

| soup | appearances with sources | place links | expected under the null | P(≥ observed) | *p*<sub>*y*</sub>, lower median (range) |
|---|---|---|---|---|---|
| aged | 16 | 11 | 3.10 | 1.5·10⁻⁵ | 0.167 (0.088 to 0.274) |
| shuffled | 8 | 4 | 0.98 | 0.009 | 0.087 (0.051 to 0.196) |
| fresh | 2 | 2 | 0.06 | 0.0006 | 0.014 (0.014 to 0.044) |

**By the note's rule, the place links are more than the same appearances placed uniformly would give: place is evidence at the level of the
set,** not of each link. Under the null, the chance of a place link differs from one appearance to another (the column gives the lower of
the two middle values, as the output prints it; AU2-217): it is not a false-positive rate of each link. It holds with one appearance per
branch (6 of 6, against 0.88; auditor 1, post hoc), and under a dependence sensitivity that shares one uniform draw within each world (P =
0.019; auditor 2, post hoc, not a joint translation). But each appearance is moved independently, and uniformly, not where the soup is active
(AU2-214): place is an excess over a uniform placement, not descent. The agreement, descriptive: with the sequence links as observed and
place from the null, 14.26 of the 16 would be linked (P(≥ 15) = 0.24): the agreement of 15 of 16 at 8 bytes rests on the sequence, which
within the world is undecided.

### 3. The whole graph

| rule | 8 bytes | 9 | 10 | 12 | 16 |
|---|---|---|---|---|---|
| R1 time (any threshold) | 4.55 [0.90, 22.91] | = | = | = | = |
| R3 sequence | 2.90 [0.69, 11.71] | 3.21 [0.84, 12.83] | 3.82 [1.12, 14.86] | 3.74 [1.19, 12.93] | 4.41 [1.45, 14.90] |
| R5 time, sequence or place | 4.55 [0.90, 22.91] | = | = | = | = |
| R5∧ sequence and place | 3.52 [0.98, 13.80] | 3.52 [0.98, 13.80] | 3.97 [1.16, 15.47] | 3.88 [1.21, 13.35] | 4.41 [1.45, 14.90] |
| R6 candidate families | 2.35 [0.75, 10.13] | 2.78 [0.92, 12.01] | 3.00 [1.04, 12.89] | 2.50 [0.85, 11.43] | 3.03 [1.02, 13.77] |
| R6∧ | 3.06 [0.96, 11.73] | 3.06 [0.96, 11.73] | 3.67 [1.16, 14.02] | 3.74 [1.20, 12.76] | 4.41 [1.45, 14.90] |
| R6 without the bridges | 2.14 [0.78, 7.05] | 2.14 [0.78, 7.05] | 2.41 [0.93, 7.84] | 3.21 [1.04, 11.16] | 3.48 [1.18, 11.82] |

(The aged/fresh ratio of the failed appearances per 1,000 world-epochs, with the interval of the bootstrap over worlds; R0, without any rule,
4.41 [1.45, 14.90]. The counts per soup are in the output.)

- **The agreement with the time rule** holds at every threshold by the sensitivities note's rule (two thirds or more): 15, 13, 12, 12 and 11
  of the 16; at 16 bytes, by place alone (sequence 0, place 11).
- **The verdict changes with the rule and the threshold:** under the time rule (R1, and R5, which equals it) the interval contains 1 at every
  threshold; with the sequence alone (R3) or with sequence and place together (R5∧, R6∧), it lies above 1 from 10 bytes on; the candidate
  families (R6), above 1 at 10 and 16 bytes and containing 1 at 8, 9 and 12; without the bridges, above 1 from 12 bytes on.
- **The graph:** at 8 bytes the aged soup has 953 candidate edges of 2,349 possible pairs (density 0.41), 27 components and 14 bridges; at
  16 bytes, 344 edges (0.15), 61 components and 22 bridges.
- **Leaving one world out** (8 bytes): R0 stays above 1 in all 60 (from 3.35 to 5.90); R6 stays containing 1 in all 60 (from 1.93 to 2.95);
  R1 and R5 contain 1, but **leaving out any one of four worlds (7027, 7050, 7062 or 7065) puts them above 1** (from 2.41 to 6.08).

### The reading

- **What holds:** the dominant group is near the failed appearances far more often than a uniform placement would give, also with one
  appearance per branch, and the agreement with the time rule holds at every threshold. The sequence passes the rule fixed before computing,
  but not with the branch as the unit, and against controls that are not comparable: within the world it is undecided with these records
  (AUD-223, AU2-212). By the note's own reading rule, with the sequence undecided, "cannot be separated from fragmentation" stands on place
  alone, and on time; the agreement of 15 of 16 rests on the sequence, so that part is not checked within the world either.
- **What weakens:** 8 bytes cannot be calibrated within the world with these records (the controls may be fragments of one lineage;
  AUD-224), and the rules that rest on the sequence (R3, R5∧, R6) cannot be checked within the world; from 12 to 16 bytes they remove fewer
  appearances partly by construction (at 16 bytes, R3 is R0). 12 bytes is a more restrictive threshold, with fewer links among the
  operational controls, not a calibrated one (AU2-215).
- **So the excess is still not separated from fragmentation, and not shown to be fragments either.** The time rule removes about half of the
  failed appearances in both soups (16 of 33 in the aged soup, 4 of 8 in the fresh one), and the ratio does not fall (4.41 without any rule,
  4.55 with it): its interval reaches 1 because only 4 fresh-soup appearances remain, and leaving out one of four worlds puts it above 1 again
  (AUD-225). And the count rests partly on bursts: 7 of the 33 come from one census of world 7046 (its last, in a branch that did not become
  established) and 7 from one census of 7052 (its establishment); counting each census once, 2.27 [0.93, 7.09] without any rule and 2.94
  [0.82, 13.79] with the time rule (auditor 1, post hoc and descriptive: not a rule to choose). The answer depends on how an appearance is
  delimited. Neither "more replicators appear in the aged soup" nor "the failed appearances are fragments" is shown. A record of heritable
  copies (entry 25, the second path) is what could tell them apart, once what counts as a new appearance is fixed (how a burst counts, and
  the appearances of the last census, which cannot be followed); even then, a copy does not give a genome's whole ancestry when it has
  several sources (AU2-217).
- *(Corrected after audit 43: see the end.)*

### What it does not say

- **Not descent:** a candidate link, a control group and a uniform placement are operational, not genealogical (AU2-156).
- **Not that the excess is real, or that it is fragments:** it depends on the rule, as above.
- **Not about the shuffled and fresh soups:** they have almost no informative pairs; their numbers are descriptive.
- **Not where maturation acts:** the rule stays (AUD-184 = AU2-151).

## Everything tried

- `factibilitat.mjs`, once before the note (from a scratch folder, with an absolute path) and once from the note's commit, with the same
  counts.
- The short test (`--check`), once; the analysis, once.
- After reading the output, one check that the note did not fix: where the control pairs of 1b come from (`posthoc-mons.mjs`, which copies
  the analysis's code up to the pair counts). Nothing else was computed.
- After audit 43: the post hoc numbers quoted in the text are the auditors' (their scripts are with the audit), except one count by the team
  in the audit's verification (the 8 earlier-census control pairs at 8 and 12 bytes). Nothing in the note's code or outputs changed.

## Corrections after audit 43 (25 November 2026)

Both auditors reproduced the note (auditor 1 with their own code, auditor 2 running it and checking the records independently), accept the
results as exploratory, and ask for nothing to be computed; the conclusion, "neither separated from fragmentation nor shown to be
fragments", stands. **The outputs do not change.** The text of "What came out" is the corrected one; what the note fixed before computing
is as it was.
- **The main test's pass** (AUD-223 = AU2-212, AU2-213): it treats 10 appearances from four branches, six from one, as independent, against
  control groups that are lineages of the same census with fewer programs. With the branch as the unit it does not pass (p = 0.125 with one
  label per branch, the smallest possible here; 0.065 with a priority order shared within each world): within the world the sequence is
  undecided, and "both nulls are beaten" is only by the rule fixed before computing. "The sequence link singles out the dominant group
  within the world" is withdrawn.
- **"8 bytes is not calibrated within the world"** (AUD-224 = AU2-215) was too strong, and "the sequence calibrated within the world (12
  bytes)" was wrong: most controls are same-census lineages, possibly fragments of one lineage, and the tracking splits those that share a
  16-byte window. With these records the threshold cannot be calibrated; 12 bytes is more restrictive, not calibrated.
- **The excess** (AUD-225): the time rule removes about half of the appearances in both soups and does not lower the ratio (4.41 and 4.55);
  and the count depends on two bursts of 7 (2.27 counting each census once, auditor 1, post hoc). "The time rule makes it compatible with 1"
  was true of the interval, but read as if fragmentation explained the excess.
- **Place** (AU2-214, AU2-217): an excess over an independent, uniform placement, not descent; it holds with one appearance per branch.
  "Each link alone would happen about one time in six" was not right: the chance differs by appearance, and the median printed is the lower
  of the two middle values.
- **The data checks** (AUD-226 = AU2-216): what `--check` does not require is in "How it went"; the data pass.
- **Details** (auditor 1, N-1 to N-5): the other arms are a control of composition; the group link favours the dominant group by
  construction; "within the branch, pooled"; pairs, not groups; the four worlds of the main test, named.
