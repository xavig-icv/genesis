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
