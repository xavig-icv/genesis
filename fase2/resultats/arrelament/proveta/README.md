# The pilot of appearance and taking root: the test tube, do the natural founders fit their own soup? (exploratory)

**Written on 24 November 2026, before computing anything.** This is the exploration lane (`docs/disseny.md`, 11-11-2026). After audit 40,
the project owner asked what I would propose besides the two auditors' next steps, and said yes to this note the same day ("endavant amb la
nota de la proveta"). **It plants nothing in any world and simulates no world:** it puts programs that were born in the project's worlds in
a test tube (the census's replication test, `fase2/replication.js`) with partners drawn from the pilot's starting soups, as the census and
the inert census do with the cells of a world. The rule of T-64 (no planting outside the invasion assay) is not touched.

## The question

Three things we know do not fit together:
- **In the aged soup, life becomes established more often** (the maturation series, entry 14; in the pilot's part B, 15 natural
  establishments of 60 in the aged soup against 7 in the fresh one).
- **The aged soup has fewer cells that copy on their own** (the step 2b recount, entry 18), so it does not make more replicators.
- **The planted replicators take root less in it** (the pilot, entry 20: 0.35 [0.28, 0.43]), so it is not more welcoming either.

So what is different must be **which** replicators are born there. My hypothesis: **the replicators born in a soup fit that soup**, and
the planted genotypes are strangers to it (G1 and G4 come from other worlds). If so, the pilot does not contradict maturation: it planted
the wrong genotypes. A reservation, also before computing: G1 was born in an aged world (1034) and still takes root badly in the aged
soups of the cohort, so the fit may be to each soup, not to "the aged soup" in general. The note separates the two.

**The test tube:** a program with 8 partners drawn from a soup snapshot, with the census's replication test (heredity, both roles: the
program first, with a partner of the soup, and second, after a partner of the soup). Its *heritable share* in a soup is the share of the
conditions in which it copies heritably. Four questions:
1. **Calibration: does the test tube see what the pilot saw?** The four planted genotypes have known rooting shares in each soup (the
   pilot's pR). If the test tube does not order them as the pilot does, it is not a measure of what makes a replicator take root, and the
   other questions are reported but not read.
2. **Local adaptation, to the kind of soup:** do the founders born in aged soups copy better with partners from aged soups, against fresh
   ones, than the founders born in fresh soups do (a reciprocal transplant, in the test tube)?
3. **Local adaptation, to their own soup:** does each founder copy better with partners from its own world's soup than with those of the
   same kind of soup in other worlds?
4. **The first-byte lead, in the test tube** (auditor 1's next step, here without planting): with the aged soup's first bytes `]` and 0
   replaced, against a placebo that replaces as many other first bytes, does G1 recover? And the founders?

And a descriptive one: **5. the founders against the natural lineages that did not become established,** each in its own soup.

## What is already known (so that nobody reads it as a prediction)

- **The pilot's rooting shares** (`../pilot/analisi-sortida.txt`), the calibration targets: G1 0.03, 0.06 and 0.12 (aged, shuffled, fresh);
  G4 0.21, 0.18 and 0.19; G2 0.98, 0.92 and 0.98; G3 0.90, 0.93 and 0.95.
- **Auditor 1, audit 38, post hoc, from a single encounter:** when G1 runs first, its copy keeps the partner's first byte; if that byte is
  `]` or 0 the copy is not heritable; 11.3% of the aged-soup cells start with `]`.
- **The natural establishments of part B:** 15, 15 and 7 of 60 (aged, shuffled, fresh), and their dominant groups (entry 21 and the
  extinction note, `../llinatges/` and `../extincions/`).
- **A timing, before writing this note:** G1 to G4 against the aged and fresh snapshots of world 7001, 40 conditions each, to measure the
  cost (from 0.7 to 6 ms per condition). Only the times were printed, no share.
- **Not looked at:** any heritable share of any program with partners of any soup.

## The data

- **The pilot's starting snapshots** (`alicuotes/NNNN/ARM.bin` of the pilot's computation copy, not in git), checked against the manifest's
  SHA-256: the aged (`continue`), shuffled (`shuffle-all`) and fresh (`reinit`) soups of the 60 worlds of the cohort, at epoch 8,000.
- **The programs** (chosen by `programes.mjs` from git, written to `programes.json` before any test):
  - **the four planted genotypes,** from the pilot's manifest;
  - **the founders:** for each part-B branch with an establishment, the dominant group at the confirmation (half or more of the inert
    census's heritable cells, the pilot's rule), and its oldest lineage (the root); its programs at first detection, the first four in
    the tracking's order (`../llinatges/seguiments/`);
  - **the natural lineages that did not become established** (question 5): the robust lineages of the trackings (heritable in 50 or more
    of the 100 retest conditions, the pilot's rule) that are not of a dominant group, without the probable fragments of an establishing
    lineage (10 bytes or more in common with the dominant group of their branch, the extinction note's rule); the first four programs.
- **No data from an undecided series.** The pilot and the two notes after it are exploratory and audited (37 to 40).

## The test tube, fixed now (`proveta.mjs`)

- **The pools:** for each world, its three soups, and two more made from the aged one: **fixed**, where each cell whose first byte is `]`
  or 0 gets the first byte of a random cell whose first byte is neither; and **placebo**, where as many cells whose first byte is neither
  get the first byte of another such cell. 300 pools.
- **The conditions of a pool:** 20; condition *j* draws 8 partners uniformly from the pool's cells, with its own seed, and the same
  partners for every program (paired). In the test, the program's first-role partner and its child's are also drawn from the pool (the
  `soloPartner` option); in the second role, the partners are the 8 (the test's context).
- **The test:** `replicationTest` with `heredity`, `complete` and `bothRoles`, as the inert test does, with the pool's partners instead of
  inert ones. For each program and condition: copies first, heritable first, copies second, heritable second.
- **Which programs against which pools:** the planted genotypes and the founders against all 300 pools; the natural lineages of question 5
  only against their own soup of their own world.
- **The seeds,** of no plan: the partners and the test of condition *j* of pool *k*, 1,126,000,000 + 1,000 *k* + 2 *j* (and + 1); the fixed
  and placebo pools of world *i*, 1,127,000,000 + 2 *i* (and + 1).

## The analysis, fixed now (`analisi.mjs`)

The **heritable share** h of a program in a pool: the share of its 20 conditions in which it is heritable, in either role (and, reported
next to it, as the program first and as the program second). For a founder or a natural lineage with several programs, the mean over its
programs. The bootstrap resamples whole worlds, 10,000 times, with seed **20261126**: the worlds of the pools for the planted genotypes, the
worlds of the founders for questions 2, 3 and 5 (a world can give a founder in each soup; the pools are the measuring instrument).

1. **Calibration:** H(G, soup), the mean over the 60 worlds of h(G) in that soup, for G1 to G4 and the three soups, next to the pilot's pR,
   and the Spearman correlation over the 12 points. **The test tube passes** if (C1) in each soup, G2 and G3 are both above G1 and G4, and
   (C2) G1's ratio, aged against fresh, has its interval below 1. G4's ratio, and the shuffled soup's, are reported.
2. **To the kind of soup:** for each founder, its mean h with the aged soups and with the fresh soups of the **other** worlds, and D, the
   first minus the second. The interaction: the mean D of the founders born in aged soups minus that of the founders born in fresh soups,
   with its interval. The founders of the shuffled soups, reported.
3. **To its own soup:** for each founder, h with its own world's soup of its birth minus the mean h with the same soup of the other worlds;
   the mean, for the founders of each soup, with its interval.
4. **The first byte:** for G1, G4 and the founders of each soup, the ratio of the mean h with the fixed pools against the placebo pools (also
   as the program first); and for G1, the share of its aged-against-fresh gap that the fixed pools close, (H fixed − H placebo) / (H fresh − H
   aged), with its interval.
5. **Descriptive:** h with its own soup of its own world, for the founders and the natural lineages that did not become established, by soup.

## What would change my mind (fixed now)

- **If the calibration fails,** the test tube does not measure what makes a replicator take root in the world. Questions 2 to 5 are reported
  as numbers, with no reading, and I drop this instrument: the hypothesis stays untested by it.
- **If it passes, question 2:** an interval above 0 means the founders fit the kind of soup they were born in (in the test tube): it would
  support my hypothesis, and the planted genotypes would be the wrong ones to measure maturation. An interval that contains 0 means no fit to
  the kind of soup could be seen (with 15 and 7 founders, the power is low, and I will say how wide the interval is). Below 0, the opposite.
- **Question 3:** an interval above 0 for the founders of the aged soups means they fit their own soup beyond its kind; it would also explain
  why G1, born in world 1034, fails in the aged soups of other worlds.
- **If neither question 2 nor question 3 shows a fit,** my hypothesis loses its support: the natural founders do not copy better in their own
  soup, and the effect of maturation must come from elsewhere (how often they appear, or how they spread).
- **Question 4:** if G1's ratio has its interval above 1 and G4's contains 1, the first byte acts in the test tube; the share of the gap it
  closes says how much of G1's deficit it explains (near 1, all of it; near 0, none). If the founders of the aged soups are not affected while
  G1 is, they do not suffer from the first byte.
- **Question 5** is descriptive.

## The short test, before the full run

`programes.mjs`, and then `proveta.mjs` on a single world (the first of the cohort) with all the programs, and `analisi.mjs --check`, which
validates the structure of what was written and prints no share. If anything fails, nothing else runs, and it is written here.

## The budget

- **No simulation of any world.** About a million replication tests, at 1 to 6 ms each: about half an hour of one processor, split by worlds
  into 6 processes at low priority. The limit of the lane (two days) is far.

## The limits, from the start

- **Exploratory:** no general causal claim, and no data that can be used to confirm anything.
- **The test tube is not the world:** no space, no spreading, partners drawn from the whole soup rather than from the neighbours, and the
  soup of epoch 8,000, while the founders appear later, in a soup that has changed.
- **Few founders:** 15 in the aged soups, 15 in the shuffled ones and 7 in the fresh ones. Their programs at first detection may already be
  those of the family that took over.
- **The lineage is of windows, not of descent** (AU2-156), and the natural families break into pieces (AUD-204): the founder is the root of
  the dominant group, by the tracking's rule.
- **No new planting.** If the test tube says something, testing it in the world would need either planting again (a new decision of the
  owner and the agreement of the three) or an intervention on the soup that measures natural establishments, which is another note.

## The commands (before computing)

- **`programes.mjs > programes.json`:** the programs above, from the pilot's manifest and records and the trackings, all in git.
- **`proveta.mjs PILOT-FOLDER [--worlds FIRST-LAST]`** (the positions in the cohort, from 1): the test tube for those worlds, to
  `proveta-FIRST-LAST.jsonl`, with the commit and the Node version in its first line. Each snapshot must have the manifest's SHA-256.
- **`analisi.mjs [--check]`:** the analysis above, to `analisi-sortida.txt`, with the commit and the Node version in its first line. It
  requires `programes.json` and the parts that cover the 60 worlds, each once.
