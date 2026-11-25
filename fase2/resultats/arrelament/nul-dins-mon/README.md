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
  5, 8 and 2, 1 and 8; in the fresh soup, 3, 2 and 1, 0 and 2.
