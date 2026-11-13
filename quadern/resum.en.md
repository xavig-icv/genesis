# The lab notebook, entry by entry

*An English summary of each entry of the [lab notebook](index.html), which is written in Catalan and is the reference. Each summary
says what the entry asked, what came out and how sure we are. Where a later audit corrected an entry, the summary gives the
corrected reading. The Catalan terms are in the [glossary](../docs/glossari.md). Summaries written on 5 November 2026.*

**How sure we are:**
- **Exploratory:** we looked at the data. A pattern is a lead, not a result.
- **Pilot:** a small run to calibrate a design. No conclusion.
- **Preregistered:** the measure, the test, the sample and the decision program were tagged in git before the first run (and, for
  the later series, the tag was timestamped on Bitcoin). The decision is taken by the tagged program.
- **Descriptive:** measured, with intervals, but without a hypothesis test.

**What "life" means here:** from entry 8 on, life *becomes established* when at least 1% of a census sample of 2,048 cells are
heritable replicators (programs whose copies can copy themselves again), in two consecutive censuses, 250 epochs apart. It is an
operational definition of the model, nothing more. Entries 1 to 6 used earlier criteria, which they state.

<a id="entry-1"></a>
## Entry 1 · 14 October 2026 · The soup comes alive (exploratory)

A soup of 131,072 random 64-byte programs in the BFF language, with no replicator written in and no reward for copying. With seed 1,
nothing special happens for 190 epochs. Then, within about 30 epochs, the higher-order entropy jumps from 0.28 to 3.07 bits per byte,
and the instructions executed per pair rise from 76 to over 600: the soup fills with copies of a program nobody designed. Its 39-byte
core reads almost the same both ways (35 of 39 bytes match), and the entry explains how its copy loop works. The run is reproducible:
the same seed gives the same history. With other seeds, life came much later or not at all.

<a id="entry-2"></a>
## Entry 2 · 14 October 2026 · The life that poisoned itself (exploratory)

It starts with a correction: what entry 1 took for a flood of one repeated byte (seed 3) was a real replicator. At epoch 8,950, 27.6%
of the programs were replicators; 1,500 epochs later, only 2 in 4,000 could still copy themselves. The same 150 replicators copy
themselves 93.5% of the time with random partners, 75.8% with partners from the soup at epoch 8,950, and 6.2% with partners from the
soup at epoch 10,450. The world had become hostile, mainly because of zero bytes, which stop the copy loop. This led to the open-world
laws of phase 2, and much later to the zeros test (entry 13).

<a id="entry-3"></a>
## Entry 3 · 14 October 2026 · The 2D world, first attempt: silence (exploratory)

The same chemistry on a 2D map, where each program only meets its neighbours. In three worlds and 16,000 epochs, no family of
replicators appeared (replication test on 6,000 random cells at four epochs, and the family tracker on the whole map). The entry warns
that this cannot show that space hinders life: there are only three cases, there are fewer encounters (only 75% of the cells pair each
epoch), and the soup itself is very irregular.

<a id="entry-4"></a>
## Entry 4 · 15 October 2026 · Currents: how much mixing does life need? (exploratory)

Currents that move cells around, from a quiet world (m = 0) to a fully mixed soup (m = 1), with three seeds each. Life (higher-order
entropy above 1 bit, and 34% to 95% of programs replicating at the end) appeared at m = 0.001, m = 0.01 and m = 1, and not at m = 0 or
m = 0.1. With three seeds, no trend can be claimed. Three ways of copying appeared, one of which needs a partner. The sweep also exposed
three blind spots of the family tracker, which were fixed. Entry 6 corrects one statement: the quiet world does produce life sometimes.

<a id="entry-5"></a>
## Entry 5 · 15 October 2026 · Flow: saving the replicator that needs a partner (exploratory)

Branches from the burst of the partner-needing replicator of entry 4, continued under different kinds of flow. Without help it dies
within 200 epochs, and no river saves it. A strong enough renewal of material (0.3% to 1% of the world per epoch) keeps it alive, and it
keeps evolving. One branch with a soft renewal showed boom-and-bust cycles, and in a torrential river a new life appeared. These are
three continuations per condition, from a single starting point.

<a id="entry-6"></a>
## Entry 6 · 15 October 2026 · Fifteen seeds and an audit (exploratory)

The quiet world against a weak current (m = 0.01), with 15 seeds each: life (higher-order entropy above 1 bit) in 3 of 15 quiet
worlds and in 8 of 15 with the current. The first external audit, by another Claude instance, showed why this series cannot prove
an effect. Its two most important findings: the random generator had a single cycle of 2³² numbers, which a 2D world exhausts, so seeds
were not independent (it was replaced by xoshiro128\*\*, and the old one is kept to reproduce earlier results); and one analysis tool
counted false replicators (no published figure was inflated). This is what led to the preregistered series of entry 8.

<a id="entry-7"></a>
## Entry 7 · 16 October 2026 · What it means to be alive (method)

A copy is not a replicator: a hand-made partial copier (24 data bytes and a loop that copies them, but not the loop) passed the old
test in 586 of 586 trials. The test now has a second generation: a program counts only if its copy can copy itself again (a heritable
replicator). Re-measured with it, the poisoned soup of entry 2 had 8.8% of programs copying but only 4.3% heritable. The interpreter
was also checked against Google's original cubff code: identical, byte for byte, on 200,000 tapes. A later note (audit 3) fixes a gap
in the heredity test and records a known blind spot: in context, the partner's code can do the copying (AUD-42).

<a id="entry-8"></a>
## Entry 8 · 18 October 2026 · 160 worlds and an inconclusive result (preregistered, series 1)

Does a weak current make life become established more often? 80 quiet worlds against 80 with a current, with the rules sealed before
starting and a two-stage design. Life became established in 24 of 80 quiet worlds (30.0%) and in 34 of 80 with the current (42.5%). The
log-rank test gave Z = −1.83, and the preregistered bound was |Z| > 2.004: inconclusive. It neither shows an effect nor rules it out.
Part of the extra life with the current does not last: 1,000 epochs after establishment, it held in 23 of 23 quiet worlds and in 26 of
33 with the current.

<a id="entry-9"></a>
## Entry 9 · 19 October 2026 · How long established life lasts: an exploration (exploratory)

29 worlds continued from the moment life became established, without and with a current, for 2,000 more epochs. In none of the 58
branches did the heritable replicators vanish from the sample. The 1% threshold is a poor criterion for death (7 of 13 "deaths" by
one rule were false), and with a rule with a margin, the current does not seem to shorten life. A world's fate is not fixed at
establishment: two continuations of the same history disagree in 4 of 27 worlds. It served to design the series of entry 10.

<a id="entry-10"></a>
## Entry 10 · 25 October 2026 · How long established life lasts: the preregistered series (preregistered, series 2)

29 new worlds, continued from establishment with two seeds per condition for 5,000 more epochs. In its own condition, 93.1% of the
branches show no sustained loss of life. Whether a change of condition shortens life, the series cannot say: losses are rare. With a
current, life occupies more of the world on average during the first 2,000 epochs: confirmed, but expected from theory. Neither is a new
discovery. Audit 14 made the wording precise: the second test measures the share of the world, not the speed of a front.

<a id="entry-11"></a>
## Entry 11 · 25 October 2026 · The fragility of a world: a lead in the zeros (exploratory)

In some worlds, established life is lost again and again, even when the world is re-run from the same point. At establishment, those
fragile worlds have a much higher share of zero bytes, which appear during the 250 epochs in which the replicator spreads. Found by
looking at the data, with 7 cases and a threshold chosen afterwards. The hypothesis is self-poisoning: the spreading replicator leaves
broken copies full of zeros, which stop later copies. Entry 13 tests it.

<a id="entry-12"></a>
## Entry 12 · 27 October 2026 · The maturation of the soup: the pilot (pilot)

22 worlds without life after 8,000 epochs, each split into five branches from the same instant and with the same randomness: continue
as is, three kinds of shuffling, and a fresh soup. Within 8,000 more epochs, life became established in 27% of the branches that
continued as is, in 27% with all bytes shuffled and in 18% with a fresh soup. With 44 branches per arm, the intervals overlap, and
there is no conclusion. It calibrated the series of entry 14.

<a id="entry-13"></a>
## Entry 13 · 29 October 2026 · The zeros test: removing them from the same snapshot (preregistered, series 3)

In 8 worlds where life drops right after becoming established, each world was restarted from the same instant in four ways, with the
same randomness. If the zeros of the non-replicating cells become data bytes, life drops less, or grows more, than with a placebo that
changes as many data bytes, in all 8 worlds: the test confirms it. Against the untouched world it happens in 7 of 8, which the test
cannot confirm. It only applies to these worlds, chosen after seeing the data. It is not a discovery: zero poisoning is described in
the 2024 paper. What the test adds is causal evidence, from an intervention on the same snapshot with a control.

<a id="entry-14"></a>
## Entry 14 · 4 November 2026 · The maturation of the soup: with the aged soup, life becomes established more often (preregistered, series 4)

150 quiet worlds that reach epoch 8,000 without life and without any detected heritable cell. Each was continued for 8,000 more
epochs in three ways, from the same snapshot and with the same randomness: the aged soup as it is, its bytes shuffled, and a fresh
soup. Life became established in 64 of 300 branches with the aged soup, in 40 with a fresh one, and in 82 with the aged soup
shuffled. Both preregistered tests (exact sign-permutation tests, with calibrated Holm thresholds) reject: p = 0.0067 and
p = 3.05·10⁻⁵. These are total effects in this cohort, not a mechanism. The shuffle itself creates replicators at once, so the second
test does not isolate the composition. Knierim et al. (2026) find that random search finds a replicator about 17 times sooner with the
distribution of the bytes a BFF soup writes than with uniform bytes, which makes the shuffled-soup result expected. That says nothing
about the soup kept as it is. Audit 27 corrected the title, which said that life "arises" more often.

<a id="entry-15"></a>
## Entry 15 · 5 November 2026 · The ingredients of the chemistry: what a random program needs to copy itself (descriptive)

The first level of B1: 10⁷ random programs (each byte is an instruction with probability ½), tested with the usual chemistry and with
twelve variants, each with one rule changed. The three controls (no copy instructions, no loops, or no copying from one program to the
other) give no heritable replicator, as expected; a zero does not prove there can be none. The usual chemistry gives 1,625, one in
6,150 programs. With only one of the two copy instructions there are fewer (71% with `,`, 39% with `.`). Without arithmetic there are
twice as many, and if a program cannot rewrite itself, four times as many. With the two heads aligned, 31 times as many, as Knierim et
al.'s CUST64 distribution suggests. With uniform random bytes, the test finds 44 times fewer, and none of them copies itself: with inert
partners none of the 37 copies (the autonomy test of 12 November 2026), and the copying was done by the test's random partner. Whether these chemistries let life become established in a soup is the
question of level 2.

<a id="entry-16"></a>
## Entry 16 · 12 November 2026 · The soup before life: what the data we already had say (exploratory)

The first step of the line the project now focuses on (what happens in the soup before life), done without any new simulation, from the
records and snapshots of already decided series. The lifeless soup matures along the same curve in every world (the byte distribution
drifts away from uniform, faster with flow), and it piles up instructions, mainly `<` (ten times its random frequency), crowded into a
few programs. Yet an aged soup has fewer cells that copy themselves than a fresh one (23 against 118 of 131,072; shuffled, the same bytes
give 706), and the few replicators that appear are lost at once: in one world scanned every 100 epochs, a single real outbreak reached
76 cells and vanished. Isolated "heritable" cells in such scans turned out to be false positives of the replication test (none passed
any of 200 retests; the outbreak's cells passed all), because the random partner sometimes does the copying. Two branches of the same
world become established independently, so establishment is a chance event. *(Corrected on 12-11-2026, consultation X-105: the branches
are compatible with independence, with little power (AUD-183); the false positives are of autonomy (AU2-152); and whether maturation
acts on appearance, on rooting or on both, we do not know yet: a count at one moment is not a rate (AUD-184, AU2-151).)* Two earlier
readings do not hold, as both auditors showed:
the establishment rate rises with age even when the soup no longer matures (so the rise is mostly the start-up delay of any clean soup),
and the dominant family at establishment is not made of what the soup piles up. The general idea of a pre-replicator phase was already
described in the Amoeba system (Greenbaum and Pargellis, 2017). What may be new is a specific mechanism in BFF, tested by intervention.
*(Updated on 12-11-2026 with the 2016 conference version, read in full; the 2017 article is paywalled.)* They measure the bias with the
entropy of single instructions, the same kind of measure as our D, and they make no intervention. In Amoeba, time works against
emergence: after a million generations, replicators rarely appear. In BFF, life becomes established more often in an aged soup
(entry 14). And Adami and LaBar (2017), in Avida, already proposed, without testing it, that activity before replicators changes
the composition and can make them more likely. The source-by-source comparison is in `docs/novetat-maduracio.md`.

<a id="entry-17"></a>
## Entry 17 · 12 November 2026 · Who copies itself: random replicators with partners that have no instructions (exploratory)

B1 v0.7, planned and reviewed before computing. The heritable replicators of entry 15 were retested in 100 conditions with partners
that have no instructions: if a program copies itself there, it does so alone. With the usual chemistry and half of the bytes being
instructions, half of them copy themselves in some condition and 18% in all; with aligned heads (H64), four in five; with the uniform
bytes of a fresh soup, none of the 37. Across programs with 0 to 64 instructions, the number of replicators rises steadily with the
share of instructions, but no heritable program with fewer than 9 instructions copies itself: the test's random partner does it. With
10% instructions, only 3% of what the test finds copies itself; with 50%, 52%. In the 22 pilot soups (11.3% instructions), partners
made from the soup's own byte histogram give 6.25 times more heritable programs than uniform partners, but the self-copiers are the
same (10 and 13 in 2.2·10⁷): the effect belongs to the partner. Composition matters for real self-copiers (none in 10⁷ with uniform
bytes, about 6 in 10⁷ with an aged soup's composition, 8 in 10⁵ with half instructions): Adami and LaBar's "biased typewriter", in BFF,
which Knierim et al. (2026) had already seen with their detector.
The effect of not being able to write to one's own half (S1) comes from both heads (2.36 and 1.48 times, 3.95 together). The census
counts of the soup before life (entry 16) must be redone with inert partners.

*Clarified after audit 31 (13 November 2026).* Both auditors redid the four analyses byte for byte. In the autonomy table, a condition
counts if the program is *heritable* with inert partners (it copies itself and the copy copies itself too), not merely if it copies
itself; in entry 18, "copies itself" means something else (one copy to the partner). "None below 9 instructions" holds for the sample
(9 is an upper bound of the minimum), and failing with inert partners means needing the partner, its code or its bytes; it does not
prove that the partner's code made the copy. The 6.25 of the pilot soups is a paired comparison on synthetic programs, not the effect
of the neighbours in an evolving soup.

<a id="entry-18"></a>
## Entry 18 · 12 November 2026 · The soup before life, part two: who writes the bytes, and who really copies itself (exploratory)

Two steps with the snapshots of already decided series, each with a note written before computing. First, an interpreter that reports
every write (checked against the simulator's) ran 10⁵ real neighbour pairs once in each of 483 soups. None of the note's four criteria
fails: in the aged soup, 85% of new `<` come from copying (in a fresh soup, mostly from `+` and `-`); pairs whose first program starts
with `<` make 55% of them, about 7 times their 7.5% share (a baseline computed after seeing the output, and said so), so the first-byte
rule has a strong effect; one round of interactions crowds instructions into fewer programs; and the aged soup makes ten times fewer
16-byte copies than its own bytes shuffled, in all 150 worlds. Second, every cell that the scan of each of the 450 series soups found
replicating was retested in 100 conditions with partners that have no instructions. Almost all were the work of the test's partner
(99.7% in aged soups), but the order holds in all 150 worlds: 0.07 cells per soup copy themselves in an aged soup, 5.9 in a fresh one and
111 in the same aged bytes shuffled. The arrangement of the aged soup undoes what its composition would do. At the start, no soup has
ready-made heritable replicators (0, 0 and 0.07 per soup, as entry 17's curve predicts for the shuffled soup). Whether maturation acts
on appearance or on taking root, we do not know yet: a count at one moment is not a rate.

*Corrected after audit 31 (13 November 2026).* Both auditors redid the figures, and each found on their own that the reading went beyond
the data. Step 2b only retested the scan's positives, and the scan misses real replicators: in 2 of 16 aged soups, auditor 1 found a
fragile cell heritable with inert partners that the scan had not seen, and 11 shuffled soups have one among the positives (two in all 100
conditions). So the counts are lower bounds of the scan's positives, heritable cells cannot be compared between soups, and "no soup has
ready-made replicators" and "the life that later becomes established was not there" do not hold. The order of the three soups holds, but
not the factors: the scan misses proportionally more in the aged soup. "Copies itself" here means one copy to the partner, not entry 17's
heritable self-copier; the comparable B1 figure is 5 of 1,025 scan heritables (0.033 per shuffled soup, against about 0.06 from B1). Failing
with inert partners means needing the partner, not that the partner's code made the copy. The "16-byte copies" counted windows the partner
already carried: in world 1034 at epoch 5,500, 312 of 313, so the jump is not the outbreak copying; counting only new ones, the aged soup
makes about 140 times fewer than its shuffled bytes, not ten. Only 0.04% of the aged soup's copies are in runs of 8 or more: single
writes, not Amoeba-like propagators. And a shuffled soup is enriched about 6 times too, so the first-byte rule is a rule of BFF; what is
specific to the aged soup is that more of its programs start with `<`.
