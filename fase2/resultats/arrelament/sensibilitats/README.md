# The pilot of appearance and taking root: the neighbours within worlds, and a graph of candidate fragments (exploratory)

**Written on 24 November 2026, before computing anything.** This is the exploration lane (`docs/disseny.md`, 11-11-2026), and auditor 2's
proposal at audit 39 (F2, F4 and F5; the synthesis of audits 39 and 40), with auditor 1's third way for the fragments (audit 39, F4). The
project owner said yes on 24-11-2026 ("Endavant amb la nota de l'auditor 2 i de l'auditor 1"). **It plants nothing and simulates nothing:**
it only reads data that are already in git. A second note, written at the same time, tests auditor 1's proposal (`../vulnerables/`).

## The questions

The extinction note (notebook entry 22) left two things open that the existing records can still say something about:

1. **The neighbours, within worlds and places** (auditor 2, F2). Within the aged soup, the 26 one-cell G1 seeds with no neighbour starting
   with `]` or 0 did worse than the others (4.4% of the tested members heritable, against 10.0%), the opposite of what the first-byte lead
   predicts. Auditor 1 found that these 26 places are not random and that G4 and G1 × 9, planted at the same places, also take root less
   there: rather an effect of the place. Auditor 2 read it as evidence against the simple local version of the lead, clustered by world and
   position. **Does the contrast keep its direction when it is made within each world, and against G4 planted at the same cell?** G1 keeps
   its partner's first byte when it copies, and G4 overwrites it: at the same place, the lead predicts that G1 does worse than G4 where more
   neighbours start with `]` or 0.
2. **The fragments, as candidates** (auditor 2, F4; auditor 1, F4). The excess of natural appearances that do not become established in the
   aged soup (entry 21) depends on the appearances that may be fragments of the establishing lineage: without those detected in the 1,250
   epochs before an establishment (auditor 1's time rule), 4.55 [0.89, 23.22]; without those that share 10 bytes or more with their
   branch's dominant group (the extinction note's substring rule), 4.28 [1.24, 15.61]. Auditor 2: neither rule is the truth; the time window
   is arbitrary and may remove genuine appearances, and a shared substring shows similarity, not descent. **Build a graph of candidate
   links from the tracking records, with three kinds of evidence (time, sequence and place), declare the links as candidates, and give the
   failed appearances under each rule as the range of a sensitivity analysis.** And: do the three kinds of evidence agree on which
   appearances are probable fragments, and how often would place link a random cell?

## What is already known (so that nobody reads it as a prediction)

- **Question 1:** the extinction note's table (26, 78 and 136 aged-soup seeds with no, 1 or 2, and 3 or more neighbours starting with `]` or
  0; G1 4.4%, 10.0% and 10.0% of the tested members heritable; 0, 2 and 5 take root), and auditor 1's figures at the same places (audit 39,
  F2): G4 23.8%, 22.5% and 25.4%, taking root 3, 14 and 34; G1 × 9 9.2%, 10.6% and 10.0%, taking root 1, 12 and 11. The 26 places are in 22
  worlds. Nothing has been computed within worlds, or as G1 against G4 at the same cell.
- **Question 2:** the failed appearances (33, 14 and 8; aged against fresh, 4.41 [1.44, 15.49]), the two rules above, and auditor 1's
  descriptive of the 16 aged-soup appearances that the time rule removes (audit 39, F4): 15 lie inside the rectangle of the dominant group's
  cells at the census of the establishment, the nearest dominant cell is 1 to 18 cells away (among the dominant group's own cells, the median
  of that distance is 3 to 6), and 8 of the 16 share fewer than 10 bytes with the dominant group. No failed appearance shares more than 7
  bytes with the dominant groups of the other worlds; with a threshold of 8 bytes the ratio is 3.21 [0.72, 12.89], with 9, 3.57 [0.86,
  14.00]. Nobody has computed how close a random cell would be, or a graph with links between lineages that are not dominant.

## The data

- **The part-A records of the pilot** (`../pilot/part-a/`), the informative one-cell variants G1 and G4 (and G1 × 9, descriptive), in the
  aged soup; their lineage lines every 50 epochs and the pilot's outcome (`partA()` of `eines/arrelament-analisi.mjs`).
- **The first-byte scan** of the extinction note (`../extincions/primer-byte.jsonl`): the number of the 24 neighbours of each one-cell seed
  that start with `]` or 0, in the starting snapshot. G1 and G4 share their cells (the same four positions in every soup of a world).
- **The natural-lineage tracking** (`../llinatges/seguiments/`, `../llinatges/simulacio/`) and the part-B records of the pilot
  (`../pilot/part-b/`): each lineage's first programs and cells, the cells of every lineage at every inert census, the unions, the steps (F)
  and the establishment.
- **No data from an undecided series.** The pilot is exploratory and already audited (37 to 40).

## The analysis, fixed now (`analisi.mjs`)

The world is the unit: the bootstrap resamples whole worlds (10,000 times, with seed **20261127**, which belongs to no plan). Distances on
the grid are Chebyshev distances (the larger of the horizontal and the vertical one), as the interaction square; the world has edges, not
a torus.

### 1. The neighbours, within worlds and against G4 at the same cell (the aged soup)

For each aged-soup place (world and position), *b* is the number of the 24 neighbours that start with `]` or 0 (`primer-byte.jsonl`), and
for each variant the members of the first five steps (8,050 to 8,250), pooled: tested and functional, as in the extinction note.

- **a. The extinction note's table, with intervals:** `functional`/`tested` of G1 by *b* (none, 1 or 2, 3 or more), the same for G4 at the
  same places, and the ratio G1/G4 in each class; G1 × 9 at the same centre cells, as a descriptive. The intervals, from the bootstrap.
- **b. Within worlds (the main measure):** in each world, its four places are split into *high* (*b* above the median of the world's four)
  and *low* (below it); the places at the median, and the worlds whose four places have the same *b*, are left out. Pooled over the
  worlds, for G1 and for G4: *R* = (`functional`/`tested` of the high places) / (`functional`/`tested` of the low places); and **the ratio
  of the two ratios, *RR* = *R*(G1) / *R*(G4)**, which compares G1 with G4 planted at the very same cells. The intervals, from the bootstrap.
- **c. Descriptive:** the same split with the share of seeds still heritable at the first step (F ≥ 1 at 8,050), for G1 and G4, each seed
  counted once, and the number of seeds and worlds in each half.

### 2. The graph of candidate fragments

**The lineages:** the robust lineages of the 52 trackings (heritable in 50 of the 100 retest conditions or more, with the best of their first
programs), the dominant group at the confirmation of each establishment, and the exposure, exactly as in the extinction note's section 4. A
**failed appearance** is a robust lineage that is not in the dominant group and is detected within the exposure.

**Three kinds of evidence that a failed appearance *y* is a fragment of another lineage *x* of the same branch** (each one a candidate link,
never a proof of descent):
- **time (T):** *y* is detected in the 1,250 epochs before the establishment of its branch (auditor 1's rule; only towards the dominant
  group);
- **sequence (S):** a first program of *y* and a first program of *x* share a substring (also reversed) of *s*\* bytes or more. **The threshold
  is fixed by a control, not by the description:** *s*\* = 1 + the longest substring that any failed appearance of an establishing branch
  shares with the dominant groups of the other worlds of its soup, over the three soups;
- **place (P):** at the census where *y* is detected, one of its cells is at most 8 cells from a heritable cell of *x* in the same census.
  For every place link, the **chance level**: the share of the world's cells that are at most 8 cells from those cells of *x* (a cell of the
  census sample is drawn uniformly, so this is how often a random sampled cell would be linked).

For S and P, *x* must have been detected at or before the census where *y* is, and must have been alive then (F ≥ 1 in one of its steps of
the 250 epochs up to that census).

**The rules, as a sensitivity analysis** (the counts per soup and the aged/fresh ratio of the failed appearances per 1,000 world-epochs,
with the interval, as in entry 21):
- **R0:** none (entry 21);
- **R1:** without the appearances linked to the dominant group by time (auditor 1's rule);
- **R2:** without those that share 10 bytes or more with the dominant group's first programs (the extinction note's rule, unchanged: no
  condition on time);
- **R3:** without those linked to the dominant group by sequence, at *s*\*;
- **R4:** without those linked to the dominant group by place;
- **R5:** without those linked to the dominant group by any of T, S or P (the widest of the rules towards the dominant group);
- **R6: the candidate families.** The graph of each branch has the robust lineages as nodes, joined if they are in the same group (the
  tracking's unions) or by a sequence or place link between any two of them. Its connected components are the candidate families; a
  failed candidate family is a component without the dominant group whose first lineage is detected within the exposure. R6 counts those.
- **The agreement:** of the aged-soup failed appearances in establishing branches that the time rule removes, how many are also linked to
  the dominant group by sequence or by place; and of those linked by sequence or place, how many the time rule removes. The same in the
  other two soups, descriptive.

## What would change my mind (fixed now)

- **Question 1:** if the interval of *RR* lies below 1, then within worlds and against G4 at the same cells, more neighbours starting with
  `]` or 0 go with G1 doing worse: the local pattern agrees with the lead, and the opposite direction of the raw table was the world or the
  place. If it contains 1, the local test cannot see the lead either way, and I will say how wide the interval is. If it lies above 1, the
  local pattern goes against the simple local version of the lead even within worlds and against G4 at the same cells.
- **Question 2, the agreement:** if two thirds or more of the appearances that the time rule removes are also linked by sequence or place,
  the three kinds of evidence agree that they are probable fragments, and the time rule's reading (an interval that contains 1) is the more
  defensible. If a third or fewer, the time rule removes appearances that neither the sequence nor the place links to the dominant group, and
  it is not the more defensible one. In between, no clear answer.
- **Question 2, place as evidence:** if the median chance level of the place links to the dominant group is above 0.5, a random sampled
  cell would be linked more often than not, and place is no evidence; below 0.1, it is strong evidence; in between, weak.
- **Question 2, the range:** whether the interval of the aged/fresh ratio contains 1 under every rule, under none, or under some, and which.
  No rule is the true count: the range is the result.

## The short test, before the full run

`analisi.mjs --check`, which loads and validates all the data (the part-A records, the scan, the 52 trackings, their records and their
checks, and the part-B records) and prints only the counts of what it read, no result. If anything fails, nothing else runs, and it is
written here.

## The budget

- **No simulation.** The only computation is the retest of the lineages' first programs (100 conditions each, as in the extinction note) and
  the substrings: minutes. The limit of the lane (two days) is far.

## The limits, from the start

- **Exploratory:** no general causal claim, and no data that can be used to confirm anything.
- **Question 1 has few places per world** (four), and most G1 seeds lose heritability at the first step: the within-world measure uses only
  the worlds whose four places differ in *b*, and the interval may be wide.
- **The scan counts the neighbours at the start only;** G1's copies spread to hundreds of cells that the records do not describe.
- **A candidate link is not descent:** the lineage is of windows (AU2-156), the inert census is a sample of 4,096 cells every 250 epochs,
  and place and sequence can link unrelated lineages. The chance level says how often place would link by chance; the control of the
  threshold says how much sequence two unrelated lineages share at most.
- **Not where maturation acts:** the rule stays (AUD-184 = AU2-151).

## The commands (before computing)

- **`analisi.mjs [--check]`:** the analysis above, to `analisi-sortida.txt`, with the commit and the Node version in its first line.

## How it went

- **The scripts,** in git before running anything (`57f3a17`).
- **The short test** (24-11-2026, from `57f3a17`, Node 16.15.1): `analisi.mjs --check`, all the data valid (720 aged-soup part-A records,
  240 places of the scan, the 52 trackings and the 180 part-B records), no result printed, 15 s.
- **The analysis** (from `1ea6a5a`, Node 16.15.1, exit code 0, nothing on stderr): `analisi-sortida.txt`, in git as it came out (`2b66fcf`),
  before reading it. Between the two commits only the other note's files changed.

## What came out (exploratory)

**In short:** within worlds and against G4 at the same cells, the neighbours do not show the first-byte lead: the fixed measure cannot say
(its interval just contains 1), and it leaves no room for the lead's direction. For the fragments, the three kinds of evidence agree: 15 of
the 16 aged-soup appearances that the time rule removes are also linked to the dominant group by sequence or by place, so by the note's rule
the time rule's reading is the more defensible, and with it the excess of failed appearances in the aged soup cannot be separated from
fragmentation. Place is weak evidence on its own.

### 1. The neighbours, within worlds and against G4 at the same cell

| neighbours starting with `]` or 0 | places (worlds) | G1, heritable share of the members | G4 | G1/G4 |
|---|---|---|---|---|
| none | 26 (22) | 4.4% [0.0, 5.2] | 23.8% | 0.18 [0.00, 0.24] |
| 1 or 2 | 78 (49) | 10.0% [6.1, 14.3] | 22.5% | 0.45 [0.27, 0.69] |
| 3 or more | 136 (58) | 10.0% [6.8, 13.3] | 25.4% | 0.40 [0.27, 0.53] |

(The aged soup, the members of the first five steps pooled. The table is the extinction note's and auditor 1's; the intervals, from the
bootstrap over worlds, are new. G1's 4.4% at the 26 places is a single seed: checked after reading the output, all 60 heritable members
come from one seed in world 7026, which also has 992 of the 1,368 tested members; hence the lopsided interval.)

- **Within worlds** (the main measure): 92 places above the median of their world and 94 below it, in all 60 worlds. G1: 10.3% at the high
  places against 6.1% at the low ones, *R* = 1.69 [1.04, 3.13]; G4: 25.2% against 23.6%, *R* = 1.07 [0.92, 1.35]. **RR = 1.59 [0.97,
  2.90].**
- **By the note's rule, the interval contains 1: the local test cannot see the lead either way.** But it runs from 0.97 to 2.90: it leaves no
  room for the lead's direction, which predicts *RR* below 1. Within its own world, G1 does better, not worse, at the places with more
  neighbours starting with `]` or 0, and G4 about the same.
- **Each seed counted once** (descriptive): still heritable at the first step, G1 13 of 92 high places against 8 of 94 low ones, and G4 26
  against 16. Both genotypes do better at the same places, which fits auditor 1's reading of an effect of the place.

### 2. The graph of candidate fragments

**The sequence threshold, from the control:** no failed appearance shares more than 7 bytes with the dominant groups of the other worlds, so
*s*\* = 8 (as auditor 1 found).

| rule | failed appearances (aged, shuffled, fresh) | aged against fresh | shuffled against fresh |
|---|---|---|---|
| R0 none (entry 21) | 33, 14, 8 | 4.41 [1.46, 15.42] | 1.89 [0.76, 5.68] |
| R1 time (auditor 1) | 17, 5, 4 | 4.55 [0.91, 23.09] | 1.35 [0.18, 6.60] |
| R2 10 bytes or more (the extinction note) | 24, 10, 6 | 4.28 [1.24, 16.74] | 1.80 [0.59, 6.58] |
| R3 sequence, *s*\* = 8 | 19, 8, 7 | 2.90 [0.69, 12.30] | 1.23 [0.34, 4.88] |
| R4 place, 8 cells | 22, 10, 6 | 3.92 [1.07, 19.50] | 1.80 [0.59, 8.01] |
| R5 any of time, sequence or place | 17, 5, 4 | 4.55 [0.91, 23.09] | 1.35 [0.18, 6.60] |
| R6 candidate families | 11, 5, 5 | 2.35 [0.72, 10.06] | 1.08 [0.23, 4.99] |

(Per 1,000 world-epochs; R0, R1 and R2 give the same counts as before, and intervals that differ only through the bootstrap's seed.)

- **The range:** the aged/fresh interval contains 1 under R1, R3, R5 and R6, and lies above 1 under R0, R2 and R4. No rule is the true
  count: the excess survives only the rules that remove the fewest probable fragments.
- **The agreement** (the aged soup): of the 18 failed appearances in establishing branches, the time rule removes 16, and **15 of these are
  also linked to the dominant group by sequence or by place** (14 by sequence, 11 by place; 10 by all three). Every appearance linked by
  sequence or place is one the time rule removes, so R5 is R1. The two that the time rule keeps are linked by nothing. **0.94: by the note's
  rule, the three kinds of evidence agree that they are probable fragments, and the time rule's reading is the more defensible.** In the
  shuffled soup, 8 of 9; in the fresh one, 2 of 4 (descriptive).
- **Place as evidence:** the median chance level of the place links is 0.160 (aged soup 0.168, from 0.069 to 0.274): a random sampled cell
  would be as close to the dominant group's cells about one time in six. **By the note's rule, place is weak evidence:** it adds little
  on its own, and the agreement rests mostly on the sequence.
- **The candidate families** (R6): counting the connected components of the graph, the aged soup has 11 failed families, the shuffled 5 and
  the fresh 5; 2.35 [0.72, 10.06].

### What it does not say

- **Not that the neighbours act against the lead.** The fixed measure cannot say; what it rules out is a strong local effect in the lead's
  direction. The scan counts the neighbours at the start only, and G1's copies spread far beyond them.
- **Not that the failed appearances are fragments.** A candidate link is not descent (AU2-156): it is a similarity of sequence at a
  threshold above what unrelated lineages share, a closeness of place that a random cell would have one time in six, and a time window.
  What the note says is that the three agree, and that with the rules that use them the excess cannot be separated from fragmentation.
- **Not where maturation acts:** the rule stays (AUD-184 = AU2-151).

## Everything tried

- The short test (`--check`), once; the analysis, once.
- After reading the output, one check that the note did not fix: where the 60 heritable G1 members of the 26 places without bad neighbours
  come from (a single seed, world 7026). Nothing else was computed.
