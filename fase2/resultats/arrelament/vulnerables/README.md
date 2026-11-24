# The pilot of appearance and taking root: are the natural replicators that become established in the aged soup less vulnerable to the first byte? (exploratory)

**Written on 24 November 2026, before computing anything.** This is the exploration lane (`docs/disseny.md`, 11-11-2026), and auditor 1's
proposal at audit 39 (F5; the synthesis of audits 39 and 40). The project owner said yes on 24-11-2026 ("Endavant amb la nota de l'auditor 2
i de l'auditor 1"). **It plants nothing in any world and simulates no world:** it reads the natural-lineage tracking (in git) and the pilot's
starting snapshots (not in git), and runs single encounters of two programs outside the world, like the replication test. A second note,
written at the same time, takes up auditor 2's proposal (`../sensibilitats/`).

## The question

The first-byte lead (audit 38, auditor 1; the extinction note, entry 22): when G1 copies itself into a partner, it keeps the partner's first
byte, and if that byte is `]` or 0 the copy is not heritable. In the aged soup, 13.3% to 14.3% of the cells start with `]` or 0; in the
shuffled soup about 1.1%, in the fresh one 0.8%. The lead fits the planted genotypes (G1, the only one that keeps the first byte, is the only
one that loses much in the aged soup) and the extinction note's soup-level records, but it could not be tested at the scale of the
neighbourhood with those records.

**A test that plants nothing** (auditor 1): if the aged soup's first bytes filtered the replicators, **the natural ones that become
established there should be vulnerable less often than those that become established in the other soups.** A program is *vulnerable* if it
copies itself heritably into partners whose first byte is neither `]` nor 0, and never heritably into partners that start with `]`: its copy
keeps the partner's first byte. The shuffled soup has the same bytes as the aged one with almost no `]` or 0 in first position: it is the
contrast.

## What is already known (so that nobody reads it as a prediction)

- **Auditor 1's sketch** (audit 39, F5; `primer-byte-a1`, with synthetic partners of random inert bytes, 20 of each first byte, and the
  best program of each robust lineage): the first lineage of the dominant group is vulnerable in 5 of the 15 establishments of the aged
  soup, 5 of the 15 of the shuffled soup and 3 of the 7 of the fresh one; counting lineages, the dominant groups' lineages are vulnerable
  46%, 34% and 44% of the time. Auditor 1 saw no filter, and wrote that the sketch is small and post hoc, and that a proper note should count
  per group with the world as the unit, use the real partners of the starting snapshots, and contrast with the shuffled soup.
- **The four genotypes** (the same sketch, §1): G1 keeps the partner's first byte in every copy, and its copies into partners that start
  with `]` or 0 are never heritable; G2 and G3 overwrite it almost always (with `]` partners, G2 keeps it in 8 of 38 copies and G3 in 5 of
  34, and 30 of 38 and 29 of 34 of their copies are heritable); G4 always overwrites it.
- **Not looked at:** any program against real partners from the starting snapshots, sorted by their first byte.

## The data

- **The natural-lineage tracking** (`../llinatges/seguiments/`, with `../llinatges/simulacio/` and `../llinatges/comparacio/`): the 52
  part-B branches with any heritable cell, each lineage's first programs, the unions and the establishment; and the part-B records of the
  pilot (`../pilot/part-b/`) for the establishment and its confirmation.
- **The pilot's starting snapshots** (`alicuotes/NNNN/ARM.bin` of the pilot's computation copy, not in git), checked against the SHA-256 of
  the manifest: the partners.
- **The four genotypes of the pilot** (`manifest.json`): the calibration.
- **No data from an undecided series.** The pilot is exploratory and already audited (37 to 40).

## The method (`vulnerables.mjs`)

- **The programs:** for every robust lineage of the 52 trackings (heritable in 50 of the 100 retest conditions or more, as in the extinction
  note), its first program with the highest retest score (the first of them if tied), as in auditor 1's sketch.
- **The partners:** real cells of a starting snapshot, in three kinds by their first byte: `]` (93), 0, and any other. **Twenty of each,
  drawn uniformly without replacement** among the cells of that kind, with `makeRng(1128000000 + 100 × i + 10 × a + k, 'v2')` (*i*, the
  world's position in the cohort, from 0; *a*, the soup: 0, 1, 2 for `continue`, `shuffle-all`, `reinit`; *k*, the kind: 0, 1, 2 for `]`, 0,
  other). The same partners for every program tested in that world and soup. The seed belongs to no plan.
  - **The main partners:** those of the **aged soup of the program's own world**, for the programs of all three soups: it is the soup where
    the filter would act, and the same kind of partner for every program.
  - **The sensitivity:** those of the program's own soup (its world and soup).
- **The encounter:** a tape with the program first and the partner second, executed once with `evaluate()` of `fase1/bff.js` (the chemistry
  of the world, its maximum of steps), without mutations, as in the extinction note's single encounters. Afterwards, the partner's half:
  - **a copy** if it carries a 16-byte window of the program or of its mirror (`windowsOf()` and `hasWindow()` of `fase2/replication.js`,
    the replication test's rule);
  - **heritable** if it is a copy and is heritable with inert partners (`testInert()` of `fase2/inert.js`, with the 3 conditions of the
    lineage and of the inert census);
  - **keeps the first byte** if it is a copy and its first byte is the partner's.
- **Per program and kind of partner:** the copies, the heritable copies and the copies that keep the first byte, of 20.
- **The definitions** (auditor 1's): a program **works** if it has at least one heritable copy with the partners of the other kind; it is
  **vulnerable** if it works and has no heritable copy with the `]` partners. Vulnerable to 0, the same with the 0 partners (descriptive).
- **The calibration:** G1, G2, G3 and G4 against the main partners of every world of the cohort.

## The analysis, fixed now (`analisi.mjs`)

The world is the unit: the bootstrap resamples whole worlds (10,000 times, with seed **20261128**, which belongs to no plan), each world with
its branches in the three soups.

0. **The calibration, first:** with the main partners, **G1 must be vulnerable in 54 of the 60 worlds or more, and G4 must work and not be
   vulnerable in 54 or more.** If not, the test does not measure what it should, and nothing else is read (it is written as such). G2 and
   G3, descriptive.
1. **The main measure:** for each establishment (the dominant group at its confirmation, as in the extinction note), its **founder**: the
   robust lineage of the dominant group detected first (the first created, if tied). Among the establishments whose founder works with the
   main partners, **the share whose founder is vulnerable**, in each soup; the differences aged minus shuffled and aged minus fresh, with
   their intervals. The establishments whose founder does not work, counted.
2. **Descriptive, fixed now:**
   - per establishment, the share of the dominant group's working robust lineages that are vulnerable, averaged over the establishments of
     each soup (each establishment counts once);
   - all the working robust lineages: the share in the dominant group among the vulnerable ones and among the others, in each soup (the
     lineages of a branch are not independent: counts, no interval);
   - the main measure with the partners of the program's own soup;
   - for the founders: the share of their copies that keep the first byte (with the other partners), and their heritable copies with the `]`
     and the 0 partners, as distributions.

## What would change my mind (fixed now)

- **If the calibration fails,** nothing is read.
- **If the aged soup's share of vulnerable founders is below both the shuffled and the fresh shares, and the interval of aged minus shuffled
  lies below 0,** the natural establishments agree with a first-byte filter in the aged soup (an association, exploratory).
- **If the aged share is equal to or above the shuffled share,** no filter is seen, and, as auditor 1 wrote, the lead loses strength as an
  explanation of taking root in the aged soup. It does not say that the first byte does nothing to the planted G1.
- **Otherwise** (lower, with an interval that contains 0), it cannot say, and I will give the interval.
- **The power, said now:** with about 15 establishments in each of the two soups and shares near 0.4, the interval of the difference is
  about ±0.35 wide on each side: only a difference of about a third or more could show.

## The short test, before the full run

`vulnerables.mjs` on the first world of the cohort only (`--world`), into `prova/`: only its structure is looked at (the number of lines and
their fields), no result. Then `analisi.mjs --check` on the full output, which validates it and prints only the counts of what it read. If
anything fails, nothing else runs, and it is written here.

## The budget

- **No simulation of any world.** The retest of the lineages' first programs (100 conditions each) and about 160 programs × 2 sets of 60
  partners, plus the calibration (4 genotypes × 60 worlds × 60 partners), each copy tested with 3 inert conditions: minutes. The limit of the
  lane (two days) is far.

## The limits, from the start

- **Exploratory:** no general causal claim, and no data that can be used to confirm anything.
- **Few establishments:** 15, 15 and 7. Only a large difference could show (above).
- **A single encounter, with the program first:** not the dynamics of the world, and not the encounters where the program goes second.
- **Partners from the start:** the lineages appear later, in a soup that has changed a little.
- **Vulnerability is measured on one program per lineage:** a lineage's other programs may differ.
- **The founder is the first robust lineage of the dominant group that the census saw:** the lineage is of windows, not of descent
  (AU2-156), and the census is a sample every 250 epochs.
- **Not where maturation acts:** the rule stays (AUD-184 = AU2-151). No new planting: an intervention with seeds would need a new decision
  of the owner and the agreement of the three (T-64).

## The commands (before computing)

- **`vulnerables.mjs PILOT-FOLDER [--world NNNN]`:** the encounters, to `vulnerables.jsonl` (or `prova/` with `--world`), with the commit and
  the Node version in its first line. PILOT-FOLDER is the pilot folder of the pilot's computation copy, with the snapshots.
- **`analisi.mjs [--check]`:** the analysis above, to `analisi-sortida.txt`, with the commit and the Node version in its first line.

## How it went

- **The scripts,** in git before running anything (`57f3a17`).
- **The short test** (24-11-2026, from `57f3a17`): world 7001, the first of the cohort (`prova/vulnerables-7001.jsonl`). It has no tracked
  branch, so the test did not reach the lineages; I also ran world 7002, the first branch of `llista.txt` (`prova/vulnerables-7002.jsonl`),
  which does. Only the number of lines and their fields were looked at (`997aaa7`).
- **The full run** (from `997aaa7`, Node 16.15.1, exit code 0, nothing on stderr, 3 min 17 s): the 60 worlds, every snapshot with the
  manifest's SHA-256, the four genotypes against the aged partners of every world, and the 367 lineages of the 52 trackings, the robust ones
  tested (`vulnerables.jsonl`). `analisi.mjs --check`: all valid, no result printed. In git before the analysis (`1ea6a5a`).
- **The analysis** (from `1ea6a5a`, Node 16.15.1, exit code 0, nothing on stderr): `analisi-sortida.txt`, in git as it came out (`2b66fcf`),
  before reading it.

## What came out (exploratory)

**In short:** the test measures what it should (G1 is vulnerable in all 60 worlds, G4 in none), and **no filter is seen:** the founders of
the natural establishments are vulnerable as often in the aged soup as in the shuffled one (5 of 15 in both; 3 of 7 in the fresh one). By the
rule fixed in the note, the first-byte lead loses strength as an explanation of taking root in the aged soup. It does not say that the first
byte does nothing to the planted G1.

### 0. The calibration

| genotype | works | vulnerable | its copies with `]` partners: heritable / keep the first byte (of 1,200) |
|---|---|---|---|
| G1 | 60 | 60 | 0 / 1,200 (all 1,200 are copies) |
| G2 | 60 | 0 | 1,028 / 96 (of 1,126 copies) |
| G3 | 60 | 0 | 1,028 / 99 (of 1,128 copies) |
| G4 | 60 | 0 | 1,200 / 0 |

(Against the aged partners of each world, 20 of each first byte. With the partners of the other kind, G1's 1,200 copies are all heritable.)
**Passed** (the rule: 54 worlds or more). With real partners, the four genotypes behave as in auditor 1's sketch with synthetic ones.

### 1. The founders of the establishments

| soup | establishments | the founder works | vulnerable |
|---|---|---|---|
| aged | 15 | 15 | 5 (0.33) |
| shuffled | 15 | 15 | 5 (0.33) |
| fresh | 7 | 7 | 3 (0.43) |

- **Aged minus shuffled: 0.00 [−0.38, 0.38]; aged minus fresh: −0.10 [−0.62, 0.41].** By the note's rule (the aged share equal to or above
  the shuffled one): **no filter is seen.** As said before computing, only a difference of about a third could have shown; the interval
  allows one of up to 0.38 either way.
- **The same counts as auditor 1's sketch** (5, 5 and 3), now with real partners from the starting snapshots: here the partners' other bytes
  do not change who is vulnerable.
- **With the partners of the program's own soup** (the sensitivity), the same: 5 of 15, 5 of 15 and 3 of 7.

### 2. Descriptive

- **Per establishment,** the share of the dominant group's working robust lineages that are vulnerable, averaged: 0.36, 0.38 and 0.36.
- **All the working robust lineages** (counts; the lineages of a branch are not independent): more than half are vulnerable in the aged soup
  (85 of 153) and in the shuffled one (89 of 167), 14 of 31 in the fresh one. The vulnerable ones are in the dominant group less often than
  the others in the aged soup (21 of 85, 0.25, against 25 of 68, 0.37) and **also in the shuffled one** (15 of 89, 0.17, against 27 of 78,
  0.35), where almost no cell starts with `]` or 0; in the fresh one, the same (0.29 and 0.29). Whatever this gap is, it is not specific to
  the aged soup's first bytes.
- **The founders keep the partner's first byte in few of their copies** (the median share, 10%, 6% and 5%; some keep it in all of them),
  and at least half of them make heritable copies into 19 or 20 of the 20 `]` partners (the median, 20, 19 and 20). Vulnerable to 0: 4 of
  15, 2 of 15 and 2 of 7.

### What it does not say

- **Not that the first byte does nothing.** G1 keeps the partner's first byte in every copy and loses all its copies into `]` partners; the
  extinction note's records agree with the lead at the level of the soup. What this note says is that the natural replicators that become
  established in the aged soup are not selected against that weakness: a third of their founders have it, as in the shuffled soup.
- **Not where maturation acts:** the rule stays (AUD-184 = AU2-151).
- **Few establishments:** 15, 15 and 7, and a single encounter with the program first, with partners from the start.

## Everything tried

- The short test on two worlds (7001 and 7002), structure only.
- The full run, once; `--check` and the analysis, once each. Nothing else was computed.
