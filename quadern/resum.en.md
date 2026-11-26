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
drifts away from uniform, faster with a current), and it piles up instructions, mainly `<` (ten times its random frequency), crowded into a
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

*Corrected after the source review (16 November 2026).* A Fable 5.2 model checked the project's Internet sources against their text. The
general idea is not new in BFF either: Agüera y Arcas's book (2025, chapter 1) already describes phases of "pre-life", rising computation
before tapes replicate and, as imperfect replicators proliferate, a rising density of instructions per tape, without figures and without
saying which bytes; what may be new is the measurement. The version of Greenbaum and Pargellis that was read is the 2016 one, and they
attribute the late drop in emergence in Amoeba to the continued biasing of the instruction set (NOPs above 25%): the closest published
case of a soup state that lowers the chance of a replicator appearing, opposite in sign to entry 14 and untested.

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

<a id="entry-19"></a>
## Entry 19 · 13 November 2026 · The soup before life, part three: how long new replicators live (exploratory)

Every cell of 33 snapshots of world 1034 (131,072 each), in three stretches of its life (epochs 100 to 1,100, 5,000 to 6,000 and 8,000
to 9,000), was tested in 10 conditions with partners that have no instructions, and the cells that copy themselves were retested in 100.
Outside the outbreak we already knew, no heritable replicator appears: no cell of the young soup copies itself, and in the old soup four
loose cells do, none of them heritable, and none reaches the next snapshot. The outbreak lived 300 to 500 epochs (snapshots 5,200 to
5,400; 50 to 76 cells, all copying in all 100 conditions) and died out without becoming established. The cells carrying 16-byte pieces of
it were about ten times as many, and there were still 749 at epoch 5,500, when none copied any more. The census scan saw the whole outbreak
(182 of 182 copying cells, 169 of 169 heritable), but outside it only 1 of 4 copying cells, and 81% of its 977 positives do not copy with
inert partners. By the rule of the note written before computing, the heritable appearances in this world are, in practice, the
outbreaks (one in 16,000 epochs), so whether the pilot may plant a replicator to measure taking root goes back to the project owner. A
periodic census with inert partners (a sample of 2,048 cells every 100 epochs) would have caught this outbreak about 9 times in 10; cells
that copy without being heritable do not reach the next snapshot, and counting them needs a log of the copies. One observation that was
not in the note: a fresh soup at epoch 0 has at least 5.9 cells per soup that copy with inert partners (step 2b), and world 1034 has none
from epoch 100 to 1,100. One world and one outbreak: exploratory.

*Corrected after the source review (16 November 2026).* Knierim et al. (2026) already report that their detector lets them see
replicators that appear and die out before taking over the soup. And the 2024 paper already measures taking root by seeding: one
replicator, extracted from one of their runs and cleaned, seeded in 1,000 fresh soups, leads to a transition in 22% of them within 128
epochs. No one has made the same measurement in soups of different ages.

<a id="entry-20"></a>
## Entry 20 · 21 November 2026 · The soup before life, part four: the aged soup does not help planted replicators take root (exploratory)

Maturation makes life become established more often (entry 14), but we did not know whether more replicators appear or more of them
take root. The pilot measured both separately in 60 new worlds (7001 to 7076, aged to epoch 8,000 with no establishment and no heritable
cell in the scan), with three soups from each: the aged one (`continue`), its shuffled histogram (`shuffle-all`) and a fresh one (`reinit`). In part A,
under the only written exception to the rule of planting nothing (T-64), replicators born in the project's worlds were planted in the same
cells of the three soups, 3,060 branches, and each lineage was followed for up to 1,500 epochs; in part B, nothing was planted, and a census
with inert partners counted the heritable families that appear. A feasibility test on 6 worlds (16 November) came first: two genotypes
(G2, G3) take root almost always, two (G1, G4) almost never, and G1 took root only in the fresh soup. In the pilot, the share of plantings
that take root is lower in the aged soup, not higher: 0.35 times the fresh soup [0.28, 0.43] (Mantel-Haenszel over G1, G1 in a 3 × 3
square and G4), and 0.58 [0.48, 0.69] in the shuffled one; the second measure and the three sensitivities agree. G1 loses a lot (0.24 and
0.15); for G4 it is inconclusive (1.11 [0.82, 1.52]); shams never take root, there are no collisions, and the first-byte rule has no large effect.
Yet in part B life becomes established in 15 worlds of 60 in the aged and shuffled soups and 7 in the fresh one, the direction of the
series, and the inert census sees 0.24, 0.16 and 0.05 new heritable families per 1,000 world-epochs before establishment (5.0 [1.8, 16.1]
and 3.3 [1.3, 9.6] times the fresh soup); the census never saw a planted lineage that stayed under 10 cells, and saw almost all of those that passed 100. By the reading rule fixed before
computing, the taking-root ratios are below 1 and precise enough: taking root of these variants goes against the effect, which would have
to come from appearance (a formal reading, conditional on natural appearances taking root like these genotypes); the detected-appearance ratio is inconclusive (too wide). The consistency check fails: of the families the
census sees, 0.17, 0.26 and 0.36 of the natural ones take root within 1,250 epochs, against 0.80, 0.75 and 0.96 of the planted lineages,
also at equal size in the aged and shuffled soups; most natural families there are competitors (another family becomes established). So
part A speaks only about these genotypes. Open questions: why planted replicators die out so fast in the aged soup (median of all
extinctions, 50 epochs), and what the competitor families are. Exploratory: no general causal claim before a confirmation in new worlds.

*Corrected after audit 37 (21 November 2026).* Both auditors accepted the results as exploratory: the records are complete, the analysis
re-runs byte for byte, and part A and the part-B families were recomputed without the team's code. The corrections are to the text. The
detected-family rate does not measure appearance (AUD-204): in the aged soup, 79% of the detected families are within 1,250 epochs before an
establishment, and many are pieces of the family that becomes established, sharing 9 to 15 bytes with its dominant family but no full
16-byte window; with 8-byte windows the ratio drops from 5.0 to 2.3, the same as the establishment ratio. The consistency check fails, but
it does not show that planted replicators do not represent natural ones: the gap also depends on the family definition and on G2 and G3,
which always take root (AUD-205). G4 is inconclusive, not unchanged (AUD-206). The title now says "planted replicators" (AUD-207). Natural
taking root is also observed, in part B, with incomplete detection, and "no family comes from the starting cells" is a window rule, not a
genealogy. With the pilot alone, 15 against 7 establishments is not significant (Fisher p = 0.10). *Corrected after audit 39:* two phrases of
this summary said more than the Catalan entry, about the scan (which misses some heritable cells, AUD-189) and about the census threshold
(AUD-212).

<a id="entry-21"></a>
## Entry 21 · 22 November 2026 · The soup before life, part five: natural families, followed like the planted replicators (exploratory)

In entry 20, the natural families counted by the inert census could not separate appearance from taking root: at the census snapshot they
break into pieces (AUD-204). Following the exploration-lane note agreed by both auditors and the team in audit 37, the 52 part-B branches
where the inert census sees some heritable cell (21 aged, 19 shuffled, 12 fresh) were run again with the pilot's simulator, nothing planted,
saving a capture every 50 epochs; all 52 reproduce the pilot records line by line. Natural lineages were followed with the same lineage
module as the planted ones: a new lineage starts when the census sees a heritable cell that carries no window of any lineage already
followed, and lineages that share a cell are joined. With the rules fixed in the note before computing: (1) the tracking joins 29% of the
pilot's robust families in the aged soup (30 of 103), between the two thresholds, so it neither confirms nor contradicts AUD-204, and the
ratio of all lineage appearances stays where it was (5.03 [1.84, 15.51]); the dominant group of each establishment still gathers several
lineages. (2) Appearances that do not become established (not in the dominant group when the branch stops): 33, 14 and 8; the aged soup has 4.41
times the fresh-soup rate [1.44, 15.49] (shuffled, 1.89 [0.79, 5.71]), but the excess depends on those that may be pieces of the
establishing lineage (below). A count added after seeing the output: of the 33, 15 are in branches that never become established and 18 in branches that do, almost
all just before the establishment, which may be pieces of the establishing lineage; 25 of the 33 were still alive, small, when the branch
stopped. (3) Consistency counted by lineage: natural 0.64, 0.71 and 0.50 (6 of 12) against 0.63, 0.62 and 0.94 for the planted informative
genotypes (G1, G1 × 9 and G4 together), in the aged, shuffled and fresh soups; it meets the note's operational criterion in the aged and
shuffled soups and not in the fresh one, which is the reference, so the plan's reading still cannot be made (counted by group, below). (4) In a
single encounter with the 24 neighbours of the planted cell, G1 is left no longer heritable 38% of the time in the aged soup and 39% in the
fresh one (0.97 [0.96, 0.99]); but the test mixed the two orders of the pair and did not measure neighbour damage (below). The first
analysis run had an error (all planted lineages entered the consistency check, also those the census never detects); it is kept as it came
out, and the corrected one gives the pilot's planted values. Exploratory: it does not say where maturation acts.

*Corrected after audit 38 (22 November 2026).* Both auditors accepted the computation and the analysis as exploratory: the records are
complete and equal to the pilot's (auditor 1 re-ran four branches), the analysis re-runs, and the first analysis error is well declared and
correctly fixed. The corrections are to the reading. The consistency result is the note's operational criterion, counted by lineage, not a
test of equivalence: Fisher's test treats lineages as independent although they cluster by world (one aged-soup establishment contributes 16
lineages that take root), and counting each group of joined lineages once, the criterion fails in the aged soup (0.33 against 0.63); it holds
in the shuffled soup both ways and fails in the fresh soup both ways (AUD-209, AU2-188). The excess of appearances that do not become
established depends on those that may be pieces of the establishing lineage: without those within 1,250 epochs before an establishment the
ratio is 4.55 [0.89, 23.22], and with only branches that never become established, 5.35 [0.77, 25.04] (auditor 1, post hoc); "not
established" means "not in the dominant group when the branch stops" (AUD-208, AU2-190). The neighbour test mixed the two orders of the
pair: "copies" is exactly the order, and "damaged" is G1 damaging itself when it runs second, also with inert partners (AUD-210, AU2-189).
Split by order, it gives a lead: when G1 runs first, its copy is not heritable 12.9% of the time in the aged soup and 0.6% in the fresh one,
because the copy keeps the partner's first byte and 11.3% of aged-soup cells start with `]`; G4 is not affected. It is post hoc, from a single
encounter, and does not explain everything (no association within the aged soup, and the shuffled soup also loses without it).
*Corrected again after audit 39 (24 November 2026):* three phrases of the paragraph above still gave the reading from before audit 38, and
the planted values were labelled with the genotypes instead of the soups (AUD-212).

<a id="entry-22"></a>
## Entry 22 · 22 November 2026 · The soup before life, part six: how the planted replicators die out in the aged soup (exploratory)

The planted replicators take root less in the aged soup than in the fresh one (entry 20). From the pilot's records and starting
snapshots, with no planting and no simulation, we looked at how they die out. This is the step both auditors and the team agreed on at
audit 38, through the exploration lane, with the note written before computing (`fase2/resultats/arrelament/extincions/README.md`, the first
note written in English). Most one-cell plantings lose their heritable cells at the first step in every soup (G1: 206, 197 and 193 of 240
with F = 0 at epoch 8,050; most of them still have cells that carry the lineage's windows, but none is heritable). Of the G1 lineages still
heritable at the first step, by epoch 9,500, in the aged soup 25 of 34 died out (21 of them by 8,250), 6 stopped after an establishment that the
planted lineage dominated, and 3 were still followed; in the fresh soup, 16 of 47 died out (all by 8,250), 17 stopped after an
establishment they dominated and 14 were still followed. By the pilot's criterion of taking root (the one of entry 20), 7 G1 plantings of
240 take root in the aged soup and 29 in the fresh one, all of them among those heritable at the first step. For G1 in a 3 × 3 square, 123
of 157 died out in the aged soup (86 by 8,250), against 27 of 189 in the fresh one (24 take root against 156); for G4, 7 of 58 against 6 of
52 died out, and the rest stopped after an establishment they dominated: no conclusive aged-against-fresh difference. These are counts of
outcomes, not survival probabilities: a branch stops 500 epochs after an establishment, and is not observed afterwards. Counted in deaths,
G1's excess in the aged soup is 13 at the first step and 9 afterwards, mostly within 200 epochs; G1 × 9 fades more gradually. The members of
the planted lineages in the first five steps are heritable less often in the aged soup (G1: 9.8% against 15.3%, 0.64 [0.47, 0.88]; G1 × 9,
0.57 [0.51, 0.63]; G4, 1.02 [0.92, 1.15]), mostly because fewer of them copy at all. That measure also counts the steps of lineages already
dying out; counting only the steps where the lineage is heritable, G1 gives 0.81 [0.68, 0.97] (post hoc, audit 39). By the rule fixed in
the note, the lineage records agree with auditor 1's first-byte lead (G1's copy keeps the partner's first byte, and a copy that starts with
`]` or 0 is not heritable; 11.3% of aged-soup cells start with `]`), but the records have no member's first byte and no order of the
encounters. In the shuffled soup G4 also loses (0.84 [0.76, 0.92]), with hardly any cell starting with `]`: something else is at work there.
Between worlds, the share of aged-soup cells starting with `]` or 0 only ranges from 13.3% to 14.3%; G1's taking root correlates with it at
−0.28 [−0.50, −0.03] (G4, −0.05), which meets the fixed rule but is one of four correlations (with Holm's correction, p = 0.13; auditor 1),
over a spread of one percentage point, and G1's heritable share does not show it. Within the aged soup, the 26 G1 seeds with no neighbour
starting with `]` or 0 did worse, not better; auditor 1 found them in unusual places, where G4 and G1 × 9 also take root less, and auditor 2 reads them
as evidence against the simple local version of the lead; both agree that they do not corroborate it. So the lead
fits at the level of the soup and not at the level of the neighbourhood: a lead, not a mechanism shown. Showing it would need an intervention
on the aged soup's first bytes, against a placebo (the pilot's `byte0` arms removed `<`, not `]`), and planting again needs a new decision of
the owner and the agreement of the three. Counting natural families by group, the consistency criterion is met only in the shuffled soup;
without the probable fragments (10 bytes or more shared with the branch's dominant group), the aged/fresh ratio of failed appearances is
4.28 [1.24, 15.61], while auditor 1's time-based rule gave 4.55 [0.89, 23.22]: depending on the rule, the excess still cannot be separated
from fragmentation. The lineage is of windows, not of descent (AU2-156). Exploratory: it does not say where maturation acts (AUD-184 =
AU2-151).

*Corrected after audit 39 (24 November 2026).* The first version said that 9 of 34 G1 lineages were "alive at 9,500" in the aged soup and
31 of 47 in the fresh one (and 51 of 58 and 46 of 52 for G4): those counts included the branches that had stopped at an establishment and
were not observed afterwards, most of them successes (AU2-192). It also said that G1's lineages "fade over the first thousand epochs", which
holds for G1 × 9 but not for G1 (AUD-214), and it left out the reservations on fragmentation and on the records (AUD-212). The heritable
share of 0.64 also counts lineages already dying out (AUD-213). The first analysis output stays as it came out, next to the corrected one,
and the data check now refuses impossible values (AU2-193).

*Corrected after audit 40 (24 November 2026).* The corrected version said that 6 of 34 G1 lineages "took root and established the world" in
the aged soup and 17 of 47 in the fresh one: those counted the branches stopped after an establishment that the planted lineage dominated,
not the pilot's taking root, which also counts lineages still followed (7 and 29; AUD-215), and it gave only auditor 1's reading of the 26
neighbourhoods. The data check now also refuses two seeds of
the same cell with other counts, a scan header without its commit, and impossible lineage lines (AU2-196, AU2-197, AUD-216). The outputs do
not change.

<a id="entry-23"></a>
## Entry 23 · 24 November 2026 · The soup before life, part seven: a test tube that does not work (exploratory)

The aged soup has more natural establishments, fewer cells that copy on their own, and planted replicators take root less in it. The
hypothesis: the replicators born there fit it, and the planted genotypes are strangers. To test it without planting anything, we put the
oldest lineage of the dominant group of each of the pilot's 37 part-B establishments and the four planted genotypes in a "test tube": the census's replication test,
with partners drawn from the pilot's starting soups (and from the aged soup with its `]` and 0 first bytes replaced, against a placebo),
823,440 tests, with the note written before computing (`fase2/resultats/arrelament/proveta/README.md`). Before reading anything else, the
test tube had to order the planted genotypes as the pilot did. It does not: it saturates. G1 is heritable in 97.6% of the conditions with the
aged soups and 100% with the fresh ones, G4 in 100% with all of them, G2 and G3 in 93% to 98%, while their rooting shares in the pilot go
from 3% to 98% (Spearman −0.65). The census's test says whether a program can replicate, trying each role several times, not how often it
does. By the rule fixed before computing, the other numbers are reported with no reading, and the hypothesis stays untested by this
instrument: neither for nor against. Testing it again would need a measure of how often a program copies per encounter, calibrated against
the pilot first, in another note. One result was seen before the full run (the first line of the short test, looked at by hand because the
data check could not validate a single world), and nothing was changed after it. Exploratory.

*Corrected after audit 41 (25 November 2026).* Both auditors reproduced the analysis and agreed that the calibration fails and the rest is
not read. The entry said "natural founders": what is tested is the dominant group's oldest lineage, not who founded the establishment
(AUD-219, the AU2-147 rule). The note said the second role is "almost never heritable for any program"; it is heritable in all 20
conditions for 3 of the 40 lineages that did not become established (N-2). Auditor 1 added two post hoc numbers: with two attempts per
condition the lead predicts 1 − *f*² = 0.981 for G1 in the aged soup, and 0.976 came out; and the vulnerability note's calibration is
already a measure per encounter, in which G4 copies heritably in every encounter while it takes root in 21% of the plantings, so such a
measure would fail the same calibration.

*Corrected after audit 42 (25 November 2026).* The recommendation above, to test again with a measure of how often a program copies per
encounter, no longer holds, and auditor 2 agrees: per encounter with the aged soup's partners, G1 copies heritably in 86% of the encounters,
G2 in 85%, G3 in 84% and G4 in 100%, while in the pilot they take root in 3%, 98%, 90% and 21%. The order runs against the pilot's, so it
would fail the same calibration, and that note will not be made. It does not mean that no measure over several encounters could ever serve.

<a id="entry-24"></a>
## Entry 24 · 24 November 2026 · The soup before life, part eight: two tests without planting anything (exploratory)

At audit 39 the two auditors proposed two ways to go on without planting again, and both notes were written before computing. **Auditor 1's
test** (`fase2/resultats/arrelament/vulnerables/README.md`): if the aged soup's `]` and 0 first bytes filtered the replicators, the natural
ones that become established there should be vulnerable to them less often. Each robust natural lineage's program met, once, 20 real partners
of its world's aged soup starting with `]`, 20 with 0 and 20 with another byte; "vulnerable" means it copies itself heritably into the others
and never into the `]` ones. The calibration passed (G1 vulnerable in all 60 worlds, G4 in none). The dominant group's oldest lineage is
vulnerable in 5 of the 15 establishments of the aged soup, 5 of the 15 of the shuffled soup and 3 of the 7 of the fresh one (aged minus
shuffled, 0.00 [−0.38, 0.38], which allows a difference of a third either way): **no filter is seen**, and the first-byte lead loses
strength as an explanation of taking root in the aged soup. More than half of the robust natural lineages are vulnerable, and they join the dominant group less often than the others in the aged
soup and also in the shuffled one, where almost no cell starts with `]` or 0. **Auditor 2's sensitivities**
(`fase2/resultats/arrelament/sensibilitats/README.md`): pooling the tested members of the places classified within each world, the ratio of
G1's to G4's (planted at the same cells) is 1.59 [0.97, 2.90], which cannot say by the note's rule and includes values a little below 1;
counting each seed once at the first step, both genotypes do about 1.7 times (1.66) better at the places with more neighbours starting with `]` or
0, a ratio of 1.00 that fits an effect of the place shared by both, without showing it. The local test says nothing about the lead. For the failed appearances, three kinds of candidate link to the establishing lineage (time,
sequence with a threshold of 8 bytes fixed by a control, and place within 8 cells) agree: 15 of the 16 aged-soup appearances that the time
rule removes are also linked by sequence or place. By the note's rule the time rule's reading is the more defensible, and with it the excess
of failed appearances in the aged soup cannot be separated from fragmentation (4.55 [0.91, 23.09]; counting candidate families, 2.35 [0.72,
10.06]). Place on its own is weak evidence: a random cell would be as close one time in six. One check was added after reading the output
(G1's 4.4% at the 26 places without such neighbours is a single seed). Exploratory: few establishments, a single encounter, and a candidate
link is not descent. Where maturation acts is still not known.

*Corrected after audit 41 (25 November 2026).* Both auditors recounted both analyses without the notes' code and accepted them as
exploratory. The entry said that the neighbours' ratio "leaves no room for the lead's direction" and that within each world "G1 does better,
not worse … and G4 about the same": the interval includes values below 1, and the pooled members weigh the lineages that grew (AUD-218,
AU2-200, AU2-201). It said "the founder" (AUD-219). The READMEs said that "the lead explains what happens to the planted G1": what has been
shown is the mechanism outside the world; whether it is why G1 takes root less has not (AUD-217). The note now states two conventions
(lineages at the same census ordered by number, AU2-203; "one time in six" is the coverage of one random cell, not a rate of false links,
AU2-204). The vulnerability test did not check whether a copied window was already in the partner (AU2-202); with the snapshots, none was,
in any of the 48,720 encounters.

*Corrected after audit 42 (25 November 2026).* Counting each seed once, both genotypes did "about 1.6 times better": 13 of 92 against 8 of
94, and 26 of 92 against 16 of 94, are both 1.66, about 1.7 times. The figure was auditor 1's at audit 41, rounded wrongly. The ratio, 1.00,
does not change.

<a id="entry-25"></a>
## Entry 25 · 25 November 2026 · The soup before life: what we learned, and what we did not (synthesis)

Entry 14 confirmed that life becomes established more often in an aged soup than in a fresh one. Since then, eight entries (16 and 18 to 24,
all exploratory) have looked for why: whether more replicators appear there, more of them take root, or both. This entry computes nothing;
it gathers what has been shown, what has not, and what could answer it. **The short answer: where maturation acts is still not known.**

**What has been shown.** Preregistered and confirmed in that cohort of worlds, both tests against the fresh soup: in quiet worlds that reach
epoch 8,000 with no establishment and no heritable cell in that epoch's scan, life becomes established in the next 8,000 epochs in 64
branches of 300 if the soup is kept and in 82 with its bytes shuffled (which includes the replicators the shuffle creates at once), against
40 with a fresh soup (entry 14; a total effect, with no mechanism). Kept against shuffled was not tested: 6.0 points fewer with the kept
soup, with an interval from −13.0 to +0.7 that contains zero. Exploratory: the soup without life matures the same way in every world
examined and fills with instructions, above all `<`, ten times more than chance (entry 16, five sets of worlds); `<` spreads by being
copied, mostly from programs that already start with `<` (entry 18, descriptive); the aged soup has the bytes of a rich soup and the
arrangement of a poor one: fewer cells that copy than a fresh soup, and many more once its bytes are shuffled (entries 16 and 18; the scan's
positives retested with inert partners, lower bounds and not a count of every heritable cell); in the 33 snapshots of world 1034 looked at,
from three moments of its life, the heritable appearances are bursts, one in 16,000 epochs, that live 300 to 500 epochs and fade without
becoming established (entry 19); planted replicators take root less in the aged soup, 0.35 times the fresh one [0.28, 0.43] (Mantel–Haenszel
over G1, G1 × 9 and G4; G1 0.24 [0.08, 0.48], G1 × 9 0.15 [0.10, 0.22], G4 inconclusive, 1.11 [0.82, 1.52]), and also less in the shuffled
soup, 0.58 [0.48, 0.69] (entry 20; 60 new worlds and 3,060 branches, 3,000 plantings of replicators and 60 shams); in the aged soup, of the
G1 lineages that pass the first step more die out by epoch 9,500 (25 of 34, against 16 of 47 in the fresh soup; counts of outcomes, not
survival probabilities) and fewer take root (7 of 34 against 29 of 47, which are all the G1 plantings of 240 that take root; entry 22);
outside the world, G1 leaves the partner's first byte as it was, and its copies into partners that start with `]` or 0 are never heritable
(0 of 1,200 with `]` and 0 of 1,200 with 0, against 1,200 of 1,200 with the others; entry 22, and entry 24's vulnerability note); and among
the natural replicators that become established (each establishment's dominant group's oldest lineage) no first-byte filter is seen (5 of
15, 5 of 15 and 3 of 7; the interval allows a difference of a third; entry 24).

**What has not been shown.** Where maturation acts, on appearance, on taking root or on both (AUD-184 = AU2-151): the pilot's formal reading
carries a condition, that natural appearances take root like these genotypes, which could not be established. Followed like the planted ones
and counted by lineage, natural families meet the consistency criterion in the aged and the shuffled soups and not in the fresh one, the
reference; counting each group once, only in the shuffled soup (entry 21). That is no test that they take root equally. That more
replicators appear in the aged soup: the census sees more families (5.0 times the fresh soup [1.8, 16.1]) and more failed appearances (4.41
[1.44, 15.49]), but the excess cannot be separated from fragmentation. That the first byte is why G1 takes root less: it fits at the level
of the soup, the neighbours' test says nothing about it, and showing it would need an intervention. Why planted replicators also take root
less in the shuffled soup (0.58 [0.48, 0.69]), where almost no cell starts with `]` or 0 (1.1%): something else is at work there (entries 21
and 22), which the first-byte lead cannot explain. That natural replicators fit their own soup: the test tube failed its calibration, and
the hypothesis stays untested. And the mechanism of entry 14.

**What we learned about the measures.** The census's replication test can count the partner's help when the program has few instructions, so
a positive must be retested with inert partners; if it then fails, the partner may have made the copy, or the copy may depend on the context
(entries 16 to 18). A scan is not an exhaustive count, and a count at one moment is not a rate (entries 16 to 19). The census sees mostly
lineages that grow: it never saw any of the more than 1,400 planted lineages that stayed under 10 cells, so the appearances it detects are
not the rate at which replicators form (entry 20). The census's test says whether a program can copy itself, not how often, so it does not
measure taking root (entry 23). The lineage is of windows, not of descent, and natural families break into fragments in the census's
snapshot, so any count of appearances depends on how they are delimited (entries 20, 21 and 24); the three kinds of evidence for fragments
(time, sequence and place) are not independent and partly agree by construction, and a probable fragment is not descent. A ratio that pools
members weighs the lineages that grew more: each seed, or each world, must also be counted once (entry 24). The planted genotypes range from
almost always taking root (G2, G3) to almost never (G1 in the aged soup): what is said of them is said genotype by genotype.

**What may be new.** The novelty matrix (`docs/novetat-maduracio.md`) says it source by source: the general idea of a phase before life is
not new (Greenbaum and Pargellis in Amoeba, Agüera y Arcas in BFF), nor the hypothesis that pre-replicator activity makes replicators more
likely (Adami and LaBar, 2017). What can be defended as new in BFF today is entry 14's preregistered contrast, with its limits. That the
soup's arrangement undoes what its composition would do (row A2 of the matrix), and that the aged soup exploits BFF's first-byte rule for
`<` (A5), may be, but they are descriptive, and would be a provisional claim, not a demonstrated priority. G1's first-byte mechanism is not
in the matrix: it has not been checked against any source. Where maturation acts, the line's question, cannot be claimed. Before anything is
said, a wider search is needed, and someone from the field should read the matrix. Limits: one world size, one chemistry, quiet worlds that
reach epoch 8,000 with no establishment and no heritable cell in the scan (which does not guarantee there is none); the census can miss
fragile replicators, not necessarily equally in every soup; everything but entry 14 is exploratory.

**What could answer it** (none decided; the owner chooses, and planting again needs a new decision and the agreement of the three). A small
step with what we have: the within-world null for the fragments (auditor 2's proposal at audit 41), permuting within each world and census
with the existing records, with no simulation and no planting, to see whether the links between failed appearances and the establishing
lineage are more than chance; it would sharpen "cannot be separated from fragmentation", but it would not show descent. A record of
heritable copies during the simulation, in the three soups: it would give the descent needed to tell fragments from new appearances, but not
the appearance rate directly, since a lineage makes thousands of copies; before computing, what a new appearance is (for example, a
heritable program with no heritable ancestor in the record) must be fixed, told apart from spread, mutation and fragmentation, and checked
on known cases; as a simulator option or as an instrumented copy checked against the simulator, like entry 18's interpreter, in a reviewed
pull request either way. An intervention on the aged soup's first bytes (`]` and 0, against a placebo), to know whether changing them
changes how G1 takes root, not whether it is the only route; with planted replicators, it needs a new decision. Planting the natural
lineages themselves (each establishment's dominant group's oldest lineage, and some of those that did not become established) in the three
soups with the pilot's criterion, a reciprocal transplant (auditor 1's proposal at audit 42): it would test the adaptation hypothesis, which
the test tube could not, and whether the planted genotypes represent the natural ones; it is planting again, so it needs a new decision and
the agreement of the three. Or a confirmatory series that separates appearance from taking root, on new worlds, with the fragment rule, the
minimum effect and the power fixed before computing; it needs a valid fragment rule, so it would come after the record, or with the record
inside it. With the agreement of both auditors, the line of planted replicators closes here.

*Corrected after audit 42 (25 November 2026).* Both auditors accept the synthesis's conclusion and the closing of the planted line, and ask
for no computation; they looked for every number in the entry and the output it comes from. The text above is the corrected one. It did not
say that both preregistered tests are against the fresh soup (the Catalan put life becoming established "even more" with the shuffled bytes
as preregistered and confirmed); kept against shuffled was not tested, and its interval contains zero (AUD-220 = AU2-207). "The first-byte
mechanism" as possibly new is G1's, which the novelty matrix does not assess; the matrix's A5 is the `<` rule, and it also asks for a wider
search (AUD-221, AU2-211). The shuffled soup's 0.58 was missing: it is the loss the first-byte lead cannot explain (AUD-222). "0 of 1,200"
holds for each of the two kinds of partner, `]` and 0 (AU2-208). The 25 of 34 are outcomes by epoch 9,500, and the 7 and the 29 that take
root are among the 34 and the 47 (auditor 1). Other precisions: one world size, the cohort's scan, the 60 shams, G1 and G1 × 9 apart, the
scan's lower bounds, the 1034 snapshots, consistency by lineage and by group, and two more lessons on the measures (AU2-211; auditor 1). The
record of copies would not give the appearance rate directly (AU2-209), and two paths were added: the within-world null, which both auditors
raise, and planting the natural lineages, auditor 1's proposal.

<a id="entry-26"></a>
## Entry 26 · 25 November 2026 · The soup before life, part nine: the fragments against a within-world null (exploratory)

In entry 24, three kinds of evidence (time, sequence and place) agreed that the aged soup's failed appearances may be fragments of the
establishing lineage, so the excess of failed appearances "cannot be separated from fragmentation". But sequence and place had been
calibrated outside the world. This note (`fase2/resultats/arrelament/nul-dins-mon/`, written before computing; auditor 2's proposal at
audits 41 and 42, the smallest of entry 25's five paths) compares them with what happens within each world, with the records already in git
and no simulation or planting.

**Sequence.** Between arms of the same world, which cannot descend from each other and share at most the soup's bytes, no pair reaches 8
bytes (at most 6): with the world's bytes in disorder 8 bytes is not reached by chance, which says nothing of the history within the world.
Within the branch, with the groups never united with the appearance (operational negatives, not genealogical truth), 25 of 55 pairs in the
aged soup share 8 bytes (0.45; with the dominant group, 13 of 16); checked after reading the output, 49 of the 55 control pairs come from two
worlds (7046 and 7052). But 47 of the 55 are lineages born at the same census as the appearance, mostly in two bursts, which may be fragments
of one lineage, and the tracking already splits new lineages that share a 16-byte window: it is not a false-link rate, and **8 bytes cannot
be calibrated within the world with these records**; at 12 bytes, 4 of 55 (0.07), a more restrictive threshold, not a calibrated one. The
main test, a permutation of the dominant label among each appearance's available groups: 8 of 10 informative appearances share 8 bytes with
the dominant group, against 5.65 expected (p = 0.036), which passes the rule fixed before computing. But the 10 come from four branches, six
from one (world 7052), and the test treats them as independent; all their control groups are lineages detected at the same census as the
appearance, "earlier" only by number, and the dominant group's representative carries up to 34 programs against 1 or 2. With one dominant
label per branch, p = 0.125, the smallest these four branches allow; with a priority order of the groups shared within each world, 0.065;
without world 7052, 0.17 (the auditors, post hoc). **Within the world, with these records, the sequence is undecided.** At 9 and 10 bytes,
p = 0.13 and 0.20; with all the lineages of each group, which favours the dominant group by construction, 0.012, 0.007 and 0.014
(descriptive).

**Place.** Moving each appearance to every position it fits in the world, with the dominant group's cells fixed: in the aged soup 11 of 16
lie near the dominant group, against 3.10 expected (P = 1.5·10⁻⁵), and with one appearance per branch 6 of 6 against 0.88 (auditor 1, post
hoc); 4 against 0.98 in the shuffled soup, 2 against 0.06 in the fresh one. **Place is evidence at the level of the set:** an excess over a
uniform placement, not descent. Each appearance is moved independently and uniformly, not where the soup is active, and the chance of a
link differs from one appearance to another. The agreement of 15 of 16 with the time rule rests on the sequence (with place at chance, 14.3
expected), which within the world is undecided.

**The whole graph.** Under the time rule the aged/fresh interval contains 1 at every threshold (4.55 [0.90, 22.91]). But the rule removes
about half of the failed appearances in both soups (16 of 33 and 4 of 8), and the ratio does not fall (4.41 with no rule): the interval
reaches 1 because only 4 fresh-soup appearances remain. And leaving out any one of four worlds (7027, 7050, 7062, 7065) puts it above 1. With the sequence alone, or with sequence and place together, it lies above 1 from
10 bytes on (sequence alone at 12 bytes, 3.74 [1.19, 12.93]); the candidate families, above 1 at 10 and 16 bytes, not at 8, 9 or 12. With no
rule, 4.41 [1.45, 14.90]. The agreement with the time rule holds at every threshold (15, 13, 12, 12 and 11 of 16; at 16 bytes, by place
alone).

**The reading.** By the rule fixed before computing both nulls are beaten, but the sequence's pass rests on one branch and on the order of
lineages born at the same census: "cannot be separated from fragmentation" stands on place, which holds with one appearance per branch, and
on time. 8 bytes cannot be calibrated within the world with these records, and the rules that rest on the sequence cannot be checked
within it. **The excess is still not separated from fragmentation, and not shown to be fragments either.** The time rule does not lower the
ratio (4.41 without any rule, 4.55 with it); and the count rests partly on bursts: 7 of the 33 come from one census of world 7046 (its last,
in a branch that did not become established) and 7 from one census of 7052 (its establishment). Counting each census once, 2.27 [0.93,
7.09] without any rule and 2.94 [0.82, 13.79] with the time rule (auditor 1, post hoc and descriptive: not a rule to choose). The answer
depends on how an appearance is delimited. Neither "more replicators appear in the aged soup" nor "the failed appearances are fragments" is
shown; a record of heritable copies (entry 25's second path) could tell them apart, once what counts as a new appearance is fixed.
Exploratory: 10 informative appearances from four worlds, six from one, a link is not descent, and where maturation acts is still not known
(AUD-184 = AU2-151).

*Corrected after audit 43 (25 November 2026).* Both auditors reproduced the note (auditor 1 with their own code, auditor 2 running it and
checking the records independently), accept it as exploratory and ask for no computation; the conclusion, neither separated from
fragmentation nor shown to be fragments, stands. The text above is the corrected one. It said that the sequence link "singles out the
dominant group within the world": the main test treats 10 appearances from four branches, six from one, as independent, against controls
that are same-census lineages with fewer programs, and with the branch as the unit it does not pass (AUD-223 = AU2-212, AU2-213). "8 bytes
is not calibrated within the world" was too strong, and "a within-world threshold" (12 bytes) was wrong: with these records the threshold
cannot be calibrated (AUD-224 = AU2-215). The time rule's interval reaching 1 read as if fragmentation explained the excess, and the bursts
were not said (AUD-225). Place is an excess over an independent uniform placement, and "each link alone would happen about one time in six"
was not right (AU2-214, AU2-217). The data check does not require every census, the groups, the steps within the branch or the final line;
the data pass, and it is strengthened before the code is used again (AUD-226 = AU2-216). And five details from auditor 1 (N-1 to N-5).

<a id="entry-27"></a>
## Entry 27 · 26 November 2026 · The soup before life, part ten: what the appearances are made of (exploratory)

In entry 26, the aged soup's excess of failed appearances was neither separated from fragmentation nor shown to be fragments. This note
(`fase2/resultats/arrelament/registre-copies/`, written before computing) is entry 25's second path, a record of heritable copies, in its
small version: audit 43's two proposals together, auditor 2's requirements and, as a first test, auditor 1's version on the disputed
censuses only. It plants nothing and changes no simulator: 18 pilot branches are run again with a separate copy of the world's epoch that
tags where every byte comes from and which cells it has passed through. Every 100 epochs the measures, and at the end the world's
fingerprint, must be those of the pilot record: all 18 branches reproduce them (923 measures), after 30 checks with a known answer. The
appearances are 36: the 16, 9 and 4 that the time rule removes in the aged, shuffled and fresh soups, and the burst of world 7046.

**The instrument.** A cell carrying a window of a tracked set of programs (16 bytes in a row with 6 different values or more) gives the set's
bit to all its bytes when it interacts; a copy passes all the tags on, a mutation clears them. The main set, *D*, is the dominant group's
lineages detected at an earlier census (a fragment of it needs it before); the windows are 1,250 epochs (the time rule's span) and 250
(auditor 1's). The controls pass in both: in the 41 sets with 10 carriers or more, every carrier holds a full window with the set's bit, and
cells 64 or more from the dominant group carry none of it. The first checks the bookkeeping (it could only fail for windows made anew); the
second, that the bit stays where the dominant group has been. Neither says that a bit means descent, and neither checks specificity:
auditor 2 made all 64 bytes of a cell take the bit with no copy at all, and the positive control still passes.

**The aged soup's 16 appearances that the time rule removes are all D-derived:** 0.70 to 0.98 of their bytes carry *D*'s bit, 15 of them
above 0.84 (with all the dominant group's lineages up to the confirmation, the same). The note had fixed, before computing, that this would
read as fragments; that reading is withdrawn. **Their neighbourhood is D-derived too:** 15 of the 16 are one or two cells from a carrier of
the dominant group, where the cells at the same distance are 0.59 to 0.81 D on average, and their percentile among those cells is 0.35 to
0.86; only one stands out (world 7059 at epoch 13,250, four cells away, 0.70 against 0.03). And it could hardly have been otherwise: the
dominant group had no carrier at the start of any main window and spread within it, and one cell from a carrier 0.61 to 0.84 of the cells
that are not appearances are D-derived (auditor 1, post hoc). The bit records exposure, where bytes have been, not which program they come
from. **The bytes' origins by position** could tell a copy from a new arrangement: post hoc (auditor 1), 15 of the 16 have as much of the
dominant group's ancestry at their own positions as its carriers, and all 16 more than the median of their neighbourhood; they look like
mutated copies of the dominant group's program, a lead from a measure chosen after seeing the data, not a result. Almost none of their
bytes stayed unchanged in its place since the window's start: 10 to 40 % have a mutation in their ancestry, 6 to 28 % a `+` or `-`. With
the 250-epoch window, 11 are D-derived, one mixed and four older than the window: a matching window was already present 250 epochs before
the census, which does not date the lineage.

**The shuffled and fresh soups** (descriptive): of the shuffled soup's 9, 6 are D-derived, one mixed and two have no earlier dominant
lineage; the fresh soup's four are at censuses where the dominant group is first detected at the same census or later, which the main rule
cannot classify (with all its lineages, two D-derived, one not and one older than the window). **The bursts:** by the note's 16-byte rule,
the seven appearances of world 7046 at epoch 16,000 (a branch that did not become established) make six groups, and the seven of world 7052
at 10,000 (its establishment), all D-derived, six as well. Every join comes from a shared start cell, none from the bit, and that half of
the rule depends on how the material was split among cells: groups of a rule, not six births. By position (auditor 1, post hoc), 7046 has
six origins, joined differently, and 7052 seven: the appearances of a burst are not copies of one another.

**The recount.** Without the D-derived (17, 8 and 8 appearances), the aged/fresh ratio is 2.27 [0.48, 8.64]; counting origins, 2.14 [0.48,
7.99]; with the short window, 2.94 [0.89, 10.16]; with all the dominant group's lineages, 3.03 [0.62, 14.72]: all contain 1 (with no rule,
4.41 [1.45, 14.90], and with the time rule, 4.55 [0.90, 22.91], as in entry 26). It removes the same 16 aged appearances as the time rule
but keeps the fresh soup's four, which it cannot classify, so it mixes two rules: treated alike in both soups it is the time rule's again,
4.55 [0.90, 22.91], and counting origins 4.28 [0.90, 21.31] (auditor 1, post hoc). 2.27 alone is not "the excess left".

**The reading.** The bytes of the appearances the time rule removes in the aged soup passed through the dominant group's cells, and so did
their neighbourhood's; with the dominant group spreading within every window, the class could hardly have come out otherwise, so it does
not show that they are fragments. "Their bytes passed through the dominant group's cells, like their neighbourhood's", never "copies of the
dominant group" nor "fragments". The bit is consistent with the time rule, as place was, and adds no support of its own. **The excess left
without the D-derived is not shown** under this rule — never "there is no excess", nor "the excess was fragments": the counts are small,
the interval wide, and the other failed appearances keep their count (the small version). Exploratory; exposure, not descent; where
maturation acts is still not known (AUD-184 = AU2-151). Next, the owner's choice: before the full record, all three of us would fix and
test with known answers a measure of descent (on the bytes' origins, by position, apart from the exposure bit), what one origin is, and a
recount that treats every soup alike; a small first step is to run these 18 branches again with that measure fixed before.

*Corrected after audit 44 (26 November 2026).* Both auditors reproduced the note (auditor 1 re-ran the seven aged branches with a tracer of
their own and rebuilt the list, the classes and the recount; auditor 2 checked the captures, the records and the analysis, and the instrument
against the plain epoch on a real capture), accept it as exploratory and ask for no computation. The outputs do not change; the text above
is the corrected one. It read the 16 as "fragments, as the time rule assumed" by the rule fixed in the note and said that the time rule's
removal "now has direct support in the aged soup, by material": the bit records exposure, the rule could hardly have come out otherwise,
and both are withdrawn (AUD-227 = AU2-218). "The record cannot tell a mutated copy from a new arrangement" said too little: the origins by
position could, and post hoc point to copies (AUD-228). The recount without the D-derived mixes two rules (AUD-229 = AU2-221). "Six origins"
in each burst were six components of the note's rule, all joined by a shared start cell (AUD-230 = AU2-220). "They took shape between 1,250
and 250 epochs before the census" does not follow (AU2-222). The data check accepts impossible records and the short test's comparator exits
0 on a difference: both open, like the earlier notes' (AU2-219, AU2-223); the baseline is descriptive (AU2-224). And three details from
auditor 1 (N-1, N-2, N-4).

<a id="entry-28"></a>
## Entry 28 · 26 November 2026 · The soup before life, part eleven: copies or new arrangements (exploratory)

In entry 27, the exposure bit said where the appearances' bytes had been, not which program they came from. At audit 44 all three of us
agreed that, before the full record, a measure of descent apart from that bit had to be fixed and tested with known answers, with a
definition of one origin and a recount that treats every soup alike; auditor 1's small first step was to run the same 18 branches again with
it. The owner agreed on 26-11-2026. The note (`fase2/resultats/arrelament/descendencia/`) was written before anything was computed on the
pilot's branches; everything run before it (test worlds only) is in `previ/`, with its output and the code's SHA-256, as auditor 2 proposed.
Nothing is planted in any experiment, and no simulator is touched.

**The measure.** At the window's start (1,250 epochs before the census) each byte is its own origin; a copy passes it on, `+` and `-` keep
it, and a mutation gives a new one, so two cells that descend from one mutated byte share it (auditor 2's requirement). The dominant group's
carriers (*D*, as in entry 27) are split in two halves at random; from half A, **the map**: the pairs of origins that two adjacent bytes have
in 1 % of its carriers or more. **A cell's score** is how many of its 63 pairs of adjacent bytes have both origins in the map, anywhere in
the cell: a copy keeps that order, forward or backward and at any offset; shuffling the bytes one by one breaks it, shuffling them in pieces
of 2 bytes or more does not. A score of 15 counts as descent: the note called it "the run", the adjacency of 16 bytes in a row, but it is a
count of pairs, not a run (audit 45, below). The first version scored origins at their position, as auditor 1's post hoc measure; on test worlds the replicator of Phase 1
turned out to copy itself backwards and shifted (byte *g* to 62 − *g*), which a positional measure does not recognise, while the order is
kept (62 or 63 of 63 pairs). **The rule:** "a copy of D" if it reaches 15 and lies above 90 % of its 200 matched cells (entry 27's: the
same distance from the dominant group, no tracked set); "not a copy" if below 15 and at the median or lower; otherwise "undecided";
"unclassifiable" with no *D* or when the census fails its controls.

**The checks, before use.** Known answers one case at a time (auditor 2's list, including a false carrier made by a mutation: the exposure
bit takes all 64 bytes, the descent score stays 0). In a test world with random bytes, with and without mutations, the replicator in three
cells, a variant of it beside them and the same replicator far away, kept apart: with the map from half the replicator's carriers, all of the
other half reach 15, and **none of the variant's or the independent planting's carriers** do (their bytes carry origins of their own); the exposure bit gives the independent
planting 0.99. A second tracer written another way gives the same origins at every epoch; the data check fails closed (21 impossible records
of 21 rejected; AU2-219) and the comparator exits with an error on a difference (AU2-223).

**How it went.** The 18 branches in 1 h 32 min, every measure and final fingerprint the pilot's. With the records in git, the data check
first rejected 17 of them through an error of mine in the validator: it asked for at least one invariant check per measure, whereas the run
makes one per open window, unrelated to the measures. It now asks for the exact count; all 18 records have it, and every check passed again
before any score was looked at. Then the analysis, kept as it came out before it was read, and one check after the fact, declared.

**The controls.** At the main window the 12 censuses with a *D* pass: half B reaches 15 (its 10th percentile from 29 to 53 pairs) and no
far cell does (50,624 to 107,748 per census). With the 250-epoch window, 4 of 12 fail, as the note foresaw: a copy made before the window is
not seen.

**The aged soup's 16 appearances that the time rule removes: 4 "a copy of D" by the rule (a high score, above their neighbourhood; 7059's,
auditor 1 finds, a mosaic of pieces of 4 bytes or less), none not a copy, 12 undecided.** All 16 reach 15 (20 to 54 pairs of 63), but only 2
hold 16 bytes in a row in the dominant group's order (auditor 1, audit 45); the 12 undecided lie between
the 51st and 89th percentiles of their matched cells. **Why so many are undecided** (after the fact, declared): the matched cells reach 15
too, a median of 59 % of them per appearance (3 to 89 %). Near the dominant group, cells with 15 pairs or more of its material are common;
64 cells or more away, there are none. Every sensitivity (the map at 0.5 % or 5 %, by position or mirror,
by position only, at any position) gives 2 to 5 copies and **no "not a copy"**; the 250-epoch window gives 4 "not a copy", but cannot see a
copy older than itself. **The shuffled soup** (9): 2 copies, 5 undecided, 2 with no earlier dominant lineage; **the fresh soup's** 4 cannot
be classified. **One origin** (descriptive): world 7052's seven at epoch 10,000 make six components by shared pairs (null 0.003); 7059's
three, three; 7048's two at 13,500, one; the burst of 7046 and 7014's pair cannot be told (the null is above 5 %). Components, not origins:
two appearances that both carry the dominant group's material share its pairs, and by a common run of 16 bytes none is joined (auditor 1,
post hoc).

**The recount.** Rd, the main one (of the appearances the time rule removes, only those shown not to be copies are counted again, in every
soup): there are none, so it is the time rule's, 4.55 [0.90, 22.91], containing 1. Removing only the copies (Rd+, a sensitivity), 3.88
[1.13, 13.41]: R0 minus four, counting the 12 undecided as new. The map variants and the positional measures 4.55; the 250-epoch window 5.62
[1.47, 27.28], with 4 of its 12 censuses failing their control.

**The reading.** By the rule fixed in the note, **we cannot tell**: neither two thirds copies of the dominant group (4 of 16) nor two thirds
not (none). All 16 carry many pairs of the dominant group's material; only 2 hold 16 bytes in a row in its order, and a new arrangement of
its material in pieces of 2 bytes or more would score as high, so **the measure cannot say that an appearance is not a new arrangement.** The
rule also asked a copy to stand out from its neighbourhood, which near the dominant group holds its material too: a condition of place, not
of descent. Never "the 12 are copies", "new arrangements" or "fragments". **The measure is specific to the dominant group's material**
(none in the test worlds' controls, none far from the dominant group), **not to its order.** Post hoc, by the order and bridging their own
mutations (auditor 1 at audit 45, a measure chosen after seeing the data), 11 of the 16 look like mutated copies of the dominant group's
program and 5 like pieces of its material: a lead, not a result; auditor 1's lead of entry 27 is not tested by a measure fixed before.
**The excess left is not shown under this rule** — never "there is no excess"; it lies between Rd and Rd+ depending on what the 12
undecided are, and neither is a ratio of births. The order of origins says what was copied together within the window, not by whom; the 17
aged appearances the time rule keeps are not classified; exploratory, and where maturation acts is still not known (AUD-184 = AU2-151).
Next: one audit round (45); then the owner's choice. All three of us would first fix a measure of continuity (16 bytes in a row in the
dominant group's order, bridging their own mutations) and test it with adversarial known answers, before any full record.

*Corrected after audit 45 (26 November 2026).* Both auditors reproduced the note (auditor 1 re-ran the seven aged branches with a tracer, a
map and a score of their own; auditor 2 recounted the classes independently and enumerated the invariant checks), accept it and the
validator's correction, and ask for no computation. The outputs do not change; the text above is the corrected one. "The run" is a count of
15 pairs anywhere in the cell, not a run: on the branches' own material a new arrangement in 2-byte pieces reaches it 97 to 99 % of the time,
and the known-answer checks could not see it (their new arrangement shuffled 64 distinct origins one by one). Withdrawn: "all carry runs of
16 bytes in the dominant group's order", "none is a new arrangement by this measure" and "specific" without saying of what (AUD-231 =
AU2-225). The neighbourhood's condition asks a copy for more descent than its neighbours, who descend from the dominant group too; the
neighbourhood is a descriptive contrast (AUD-232, AU2-226). Rd+ is R0 minus four, not a result of its own, and neither it nor Rd bounds a
ratio of births (AUD-233, AU2-227). "Six origins" are six components by shared pairs (AUD-235, AU2-228). The validators accept some
impossible records (an empty baseline, 64 pairs in a cell, a false threshold, distance 0, a list hash or commit equally false everywhere),
none of them in the real data: open, fixed before the code is used again (AUD-234, AU2-229). The name "by position" stays in the scripts'
outputs (AU2-230). The three scripts whose hashes at the note's commit differ from the last run before the note were not touched: only
their line ends (CRLF in the working copy, LF in git) differ. "The full record could say" is withdrawn (N-3).
